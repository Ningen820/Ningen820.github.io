---
title: "ShadowTrace"
summary: "Investigate suspicious Windows activity by analyzing event logs, PowerShell history, and file-system artifacts."
image: "/assets/images/writeups/shadowtrace.png"
date: 2026-10-13 18:00:00 -04:00
category: "DFIR"
difficulty: "Easy"
platform: "HTB"
os: "Windows"
reading_time: 12
---

## 01 / Scenario

A Windows workstation was flagged for suspicious activity after an employee reported an unexpected command window. The security team collected several forensic artifacts for offline analysis.

The objective is to reconstruct the sequence of events, identify relevant account activity, and determine which commands were executed.

### Objectives

- Identify the account associated with the activity.
- Determine which PowerShell commands were executed.
- Establish a timeline of relevant events.
- Answer the investigation questions using supporting evidence.

### Questions

1. Which user account was associated with the relevant logon?
2. Which PowerShell command enumerated local users?
3. What was the earliest relevant event in the collected timeline?
4. Which file was referenced in the command history?

---

## 02 / Environment Setup

The investigation is performed on a forensic workstation using a provided evidence directory.

First, list the collected files.

<div class="terminal-block">
  <div class="terminal-header">
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-title">PowerShell</span>
    <button class="terminal-copy" type="button" onclick="copyTerminal(this)">Copy</button>
  </div>
  <pre><code>Get-ChildItem -Path ".\evidence" -Recurse -File</code></pre>
</div>

**Example output:**

```text
Security.evtx
PowerShell.evtx
ConsoleHost_history.txt
```

The directory contains Windows Security logs, PowerShell operational logs, and a PowerShell command history file.

These artifacts can provide different types of evidence about account activity and command execution.

---

## 03 / PowerShell History Analysis

PowerShell history can reveal commands entered interactively. However, it does not necessarily record every command executed on the system.

Inspect the collected history file.

<div class="terminal-block">
  <div class="terminal-header">
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-title">PowerShell</span>
    <button class="terminal-copy" type="button" onclick="copyTerminal(this)">Copy</button>
  </div>
  <pre><code>Get-Content ".\evidence\ConsoleHost_history.txt"</code></pre>
</div>

**Example output:**

```text
whoami
Get-LocalUser
Get-ChildItem C:\Users\Public
Get-Content C:\Users\Public\maintenance.txt
```

Four commands appear in the history. `Get-LocalUser` is particularly relevant because it retrieves local Windows user accounts.

The other commands identify the current user, enumerate the Public directory, and read a file named `maintenance.txt`.

### Question 1: Which command enumerated local user accounts?

**Answer:** `Get-LocalUser`

**Evidence:** The command appears in `ConsoleHost_history.txt`.

**Analysis:** The command can be used for legitimate administration, so its presence alone does not establish malicious activity. Its significance depends on the surrounding evidence and investigation context.

---

## 04 / Identify the User Account

The `whoami` command identifies the account associated with the command's execution context, but the history file does not show its output.

To investigate the account, inspect the collected Security event log.

<div class="terminal-block">
  <div class="terminal-header">
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-title">PowerShell</span>
    <button class="terminal-copy" type="button" onclick="copyTerminal(this)">Copy</button>
  </div>
  <pre><code>Get-WinEvent -Path ".\evidence\Security.evtx" |
  Where-Object { $_.Id -eq 4624 } |
  Select-Object TimeCreated, Id, Message</code></pre>
</div>

**Example finding:**

```text
TimeCreated : 10/13/2026 10:12:41 AM
Id          : 4624
Account Name: j.smith
```

Windows Security event ID `4624` represents a successful logon. The event's account, logon type, and related details should be examined to determine whether it corresponds to the activity under investigation.

### Question 2: Which account was associated with the relevant logon?

**Answer:** `j.smith`

**Evidence:** The illustrative Security event records the account name `j.smith`.

**Analysis:** A successful logon is not inherently suspicious. Additional context is necessary to determine whether it is relevant to the investigation.

---

## 05 / Build an Activity Timeline

A timeline helps establish the order of events and correlate different artifacts.

For this fictional example, the collected evidence suggests the following sequence:

| Time | Artifact | Observation |
|---|---|---|
| 10:12:41 | Security log | Successful logon associated with `j.smith` |
| 10:13:02 | Command history | `whoami` |
| 10:13:18 | Command history | `Get-LocalUser` |
| 10:13:47 | Command history | Public directory enumeration |
| 10:14:05 | Command history | Read `maintenance.txt` |

These times are illustrative. A standard PowerShell history file generally does not include a timestamp for every command, so the command-level times would need independent corroboration in a real investigation.

### Question 3: What was the earliest relevant event?

**Answer:** The successful logon at approximately 10:12:41 AM on October 13, 2026.

**Evidence:** The example Security event log.

**Analysis:** This is the earliest relevant event in the example timeline, not necessarily the earliest activity that actually occurred on the workstation.

---

## 06 / Investigate the Referenced File

The command history contains a reference to:

`C:\Users\Public\maintenance.txt`

If the file was included in the evidence collection, inspect its metadata.

<div class="terminal-block">
  <div class="terminal-header">
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-dot"></span>
    <span class="terminal-title">PowerShell</span>
    <button class="terminal-copy" type="button" onclick="copyTerminal(this)">Copy</button>
  </div>
  <pre><code>Get-Item ".\evidence\maintenance.txt" |
  Select-Object FullName, Length, CreationTimeUtc, LastWriteTimeUtc</code></pre>
</div>

**Example output:**

```text
FullName         : .\evidence\maintenance.txt
Length           : 86
CreationTimeUtc  : 2026-10-12 14:22:00Z
LastWriteTimeUtc : 2026-10-12 14:22:00Z
```

The example metadata indicates that the file's recorded timestamps predate the activity in the timeline. However, timestamps can be affected by copying, modification, or collection procedures.

### Question 4: Which file was referenced?

**Answer:** `C:\Users\Public\maintenance.txt`

**Evidence:** The command appears in `ConsoleHost_history.txt`.

**Analysis:** The history establishes that a command referencing this path was recorded. Additional evidence would be needed to confirm successful access and determine the file's contents.

---

## 07 / Questions and Answers

### Q1. Which account was associated with the relevant logon?

**Answer:** `j.smith`

**Evidence:** Security event ID `4624` in the example log.

### Q2. Which command enumerated local users?

**Answer:** `Get-LocalUser`

**Evidence:** `ConsoleHost_history.txt`.

### Q3. What was the earliest relevant event?

**Answer:** The successful logon at 10:12:41 AM on October 13, 2026.

**Evidence:** The example Security log.

### Q4. Which file was referenced in the command history?

**Answer:** `C:\Users\Public\maintenance.txt`

**Evidence:** `ConsoleHost_history.txt`.

---

## 08 / Conclusion

The example investigation identified an account associated with a successful logon, recovered a sequence of PowerShell commands, and identified a file referenced during the activity.

The findings demonstrate the importance of correlating command history with event logs and file-system artifacts rather than treating an individual command as conclusive evidence of malicious behavior.

The available example evidence is insufficient to establish that the activity was malicious. A real investigation would require the original artifacts, verified timestamps, and additional context before reaching a final determination.

### Key Findings

- **Account:** `j.smith`
- **User enumeration:** `Get-LocalUser`
- **Earliest relevant event:** October 13, 2026, at 10:12:41 AM
- **Referenced file:** `C:\Users\Public\maintenance.txt`

### Lessons Learned

- Correlate multiple artifacts to reconstruct activity.
- Distinguish direct observations from assumptions.
- Record where each finding came from.
- Support answers with specific evidence.
- Document limitations and uncertainty.
