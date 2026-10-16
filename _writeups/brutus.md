---
title: "Brutus (HTB)"

name: "Brutus"

description: "An in-depth investigation of the Brutus sherlock from HackTheBox (HTB)"

category: "DFIR"

difficulty: "Very Easy"

image: "/assets/images/writeups/brutus.png"

summary: "In this Sherlock, you will familiarize yourself with Unix auth.log and wtmp logs. We'll explore a scenario where a Confluence server was brute-forced via its SSH service. After gaining access to the server, the attacker performed additional activities, which we can track using auth.log. Although auth.log is primarily used for brute-force analysis, we will delve into the full potential of this artifact in our investigation, including aspects of privilege escalation, persistence, and even some visibility into command execution."

platform: "HTB"
date: 2026-08-26 15:01:10 -04:00

reading_time: 10
---


## Overview

Brutus investigates a Confluence server that was accessed after an SSH brute-force attack. The main artifacts are `auth.log`, which records authentication-related activity and some privileged commands, and `wtmp`, a binary record of login sessions. I used `auth.log` to identify the source and authentication events, then correlated it with `wtmp` to find when the interactive session actually started.

> The terminal outputs below are concise excerpts of the relevant fields. Validate them against your own Sherlock files before treating this draft as a record of your own run. The `LIVE` label is a visual status badge, not a running shell.

## Investigation

<div style="display:grid;gap:18px;">
  <article class="writeup-card" id="q1">
    <div class="writeup-card-top">
      <span class="section-kicker"><span>//</span> QUESTION 01</span>
      <span class="difficulty-chip">AUTH.LOG</span>
    </div>
    <h3>What IP address did the attacker use to carry out the brute-force attack?</h3>
    <p><strong>Methodology</strong></p>
    <p>I extracted the IPv4 addresses found in SSH-related log entries, counted how often each appeared, and sorted the results. A source address appearing far more often than the others is a strong lead for the repeated login attempts.</p>
    <div class="terminal-window">
      <div class="terminal-window-head">
        <div class="terminal-lights"><i></i><i></i><i></i></div>
        <span>auth.log</span>
        <div style="display:flex;align-items:center;gap:9px;margin-left:auto;flex-shrink:0;">
          <span class="terminal-mini-status">bash</span>
          <span class="terminal-live" style="margin-left:0;">LIVE</span>
        </div>
      </div>
      <div class="terminal-window-body">
        <p class="terminal-line"><span class="prompt-symbol">$</span> <span id="brutus-q1-command">grep 'sshd' auth.log | grep -v 'pam_unix' | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | sort | uniq -c | sort -nr | head</span></p>
        <p class="terminal-output">170  65.2.161.68<br>1    172.31.35.28<br>1    203.101.190.9</p>
      </div>
    </div>
    <div class="writeup-card-foot"><span>ANSWER</span><strong><code>65.2.161.68</code></strong></div>
  </article>

  <article class="writeup-card" id="q2">
    <div class="writeup-card-top">
      <span class="section-kicker"><span>//</span> QUESTION 02</span>
      <span class="difficulty-chip">AUTH.LOG</span>
    </div>
    <h3>Which account was compromised by the successful brute-force attempt?</h3>
    <p><strong>Methodology</strong></p>
    <p>I filtered for successful SSH password authentications from the attacker IP. The account named in an <code>Accepted password</code> message identifies which username the attacker accessed. The log shows a brief successful root login followed by another root authentication associated with the interactive session.</p>
    <div class="terminal-window">
      <div class="terminal-window-head">
        <div class="terminal-lights"><i></i><i></i><i></i></div>
        <span>auth.log</span>
        <div style="display:flex;align-items:center;gap:9px;margin-left:auto;flex-shrink:0;">
          <span class="terminal-mini-status">bash</span>
          <span class="terminal-live" style="margin-left:0;">LIVE</span>
        </div>
      </div>
      <div class="terminal-window-body">
        <p class="terminal-line"><span class="prompt-symbol">$</span> <span id="brutus-q2-command">grep 'Accepted password' auth.log | grep '65.2.161.68'</span></p>
        <p class="terminal-output">Mar  6 06:31:40 ... Accepted password for root from 65.2.161.68<br>Mar  6 06:32:44 ... Accepted password for root from 65.2.161.68</p>
      </div>
    </div>
    <div class="writeup-card-foot"><span>ANSWER</span><strong><code>root</code></strong></div>
  </article>

  <article class="writeup-card" id="q3">
    <div class="writeup-card-top">
      <span class="section-kicker"><span>//</span> QUESTION 03</span>
      <span class="difficulty-chip">WTMP</span>
    </div>
    <h3>What is the UTC timestamp when the attacker manually logged in and established an interactive terminal session?</h3>
    <p><strong>Methodology</strong></p>
    <p>`auth.log` records the authentication event, but the question asks when the terminal session was established. Since `wtmp` is binary, I parsed it with the supplied `utmp.py` script and filtered the result by the attacker IP. The matching row identifies the root session one second after the authentication event.</p>
    <div class="terminal-window">
      <div class="terminal-window-head">
        <div class="terminal-lights"><i></i><i></i><i></i></div>
        <span>wtmp</span>
        <div style="display:flex;align-items:center;gap:9px;margin-left:auto;flex-shrink:0;">
          <span class="terminal-mini-status">bash</span>
          <span class="terminal-live" style="margin-left:0;">LIVE</span>
        </div>
      </div>
      <div class="terminal-window-body">
        <p class="terminal-line"><span class="prompt-symbol">$</span> <span id="brutus-q3-command">TZ=UTC python3 utmp.py wtmp | grep '65.2.161.68'</span></p>
        <p class="terminal-output">"USER" "2549" "pts/1" "ts/1" "root" "65.2.161.68" ... "2024/03/06 06:32:45" ...</p>
      </div>
    </div>
    <div class="writeup-card-foot"><span>ANSWER</span><strong><code>2024-03-06 06:32:45 UTC</code></strong></div>
  </article>

  <article class="writeup-card" id="q4">
    <div class="writeup-card-top">
      <span class="section-kicker"><span>//</span> QUESTION 04</span>
      <span class="difficulty-chip">AUTH.LOG</span>
    </div>
    <h3>What session number was assigned to the attacker's root session?</h3>
    <p><strong>Methodology</strong></p>
    <p>I searched for session-related messages at the time of the second root authentication. Session 34 opened and closed in the same second, which is consistent with the brief automated login check. Session 37 appears at the later authentication time and matches the manual session found in `wtmp`.</p>
    <div class="terminal-window">
      <div class="terminal-window-head">
        <div class="terminal-lights"><i></i><i></i><i></i></div>
        <span>auth.log</span>
        <div style="display:flex;align-items:center;gap:9px;margin-left:auto;flex-shrink:0;">
          <span class="terminal-mini-status">bash</span>
          <span class="terminal-live" style="margin-left:0;">LIVE</span>
        </div>
      </div>
      <div class="terminal-window-body">
        <p class="terminal-line"><span class="prompt-symbol">$</span> <span id="brutus-q4-command">grep 'session' auth.log | grep '06:32:44'</span></p>
        <p class="terminal-output">Mar  6 06:32:44 ip-172-31-35-28 systemd-logind[411]: New session 37 of user root.</p>
      </div>
    </div>
    <div class="writeup-card-foot"><span>ANSWER</span><strong><code>37</code></strong></div>
  </article>
</div>

## Final Answers

1. **Attacker IP address:** `65.2.161.68`
2. **Compromised account:** `root`
3. **Manual interactive login (UTC):** `2024-03-06 06:32:45`
4. **Root session number:** `37`

## Key Notes

- **Count before guessing:** A large cluster of failed SSH attempts from one source IP is a useful brute-force indicator. Confirm it against the surrounding authentication events.
- **Authentication and login time differ:** `auth.log` recorded the successful authentication at `06:32:44`; `wtmp` recorded the interactive terminal session at `06:32:45` UTC.
- **Correlate artifacts:** Use `auth.log` to understand authentication and session activity, then compare it with `wtmp` rather than relying on a single timestamp.
- **A brief session can be a clue:** Session 34 opened and closed in the same second; session 37 is the interactive root session.
- **Continue looking after initial access:** Later entries identify a new account, `cyberjunkie`, added to the `sudo` group. Account creation is a persistence clue worth investigating further.

<p class="article-endnote"><span class="endnote-line"></span><span>END OF INVESTIGATION // HTB SHERLOCKS</span><span class="endnote-line"></span></p>
