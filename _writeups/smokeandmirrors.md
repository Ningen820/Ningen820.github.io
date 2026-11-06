---
layout: writeup
title: "Smoke and Mirrors — HTB Sherlock Writeup"
name: "Smoke and Mirrors"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 10
date: "2026-11-06 00:03:10 -05:00"
image: "/assets/images/writeups/smokeandmirrors/smokeandmirrors.png"
descrption: "An in-depth investigation of the Smoke And Mirrors sherlock from HackTheBox (HTB)"

#stuff
summary: "Byte Doctor Reyes is investigating a stealthy post-breach attack where several expected security logs and Windows Defender alerts appear to be missing. He suspects the attacker employed defense evasion techniques to disable or manipulate security controls, significantly complicating detection efforts.\n\nUsing the exported event logs, your objective is to uncover how the attacker compromised the system's defenses to remain undetected."

#stuff
overview_title: "Blind Analysis"
overview:
  - |
    We are given 3 artifacts and one of them contains powershell commands and scripts ran, and since this sherlock is about disabling or manipulating security controls I decided to focus mostly on the powershell logs to see contents of code ran.
  - |
    When looking through the powershell scripts, I was looking for key words such as disable, defender, protection, etc. I came across multiple code blocks that seemed malicious such as "MpCmdRun.exe -RemoveDefinitions -All" and Set-MpPreference -DisableIOAVProtection $true -DisableEmailScanning $true -DisableBlockAtFirstSeen $true". I also saw the attacker attemptint to delete history. 

#stuff
side_notes:
  - |
    I am doing my analysis on Timeline Explorer (by Eric Zimmerman) instead of the actual event files because I can easily see the contents of an entry without having to click on it.

#stuff
cards:
  card1:
    card_title: "question 01"
    question: "What is the full path of the registry key used to disable LSA protection?"
    answer: "HKLM\\SYSTEM\\CurrentControlSet\\Control\\LSA"
    explanation: |
                 If we filter for the term "lsa" we will find a script block containg code about disabling RunAsPPL. The path seen in that code is HKLM\SYSTEM\CurrentControlSet\Control\LSA
                 <img src="/assets/images/writeups/smokeandmirrors/lsa.png" loading="lazy">

  card2:
    card_title: "question 02"
    question: "Which PowerShell command did the attacker first execute to disable Windows Defender?"
    answer: "Set-MpPreference -DisableIOAVProtection $true -DisableEmailScanning $true -DisableBlockAtFirstSeen $true"
    explanation: |
                 To find this, we will first have to sort the events by the time they were created in ascending order, then we look for the term "disable" in the windows powershell operational log events.
                 <img src="/assets/images/writeups/smokeandmirrors/disable.png" loading="lazy">

  card3:
    card_title: "question 03"
    question: "Which DLL function did the attacker patch to disable AMSI?"
    answer: "AmsiScanBuffer"
    explanation: |
                 After filtering for the powershell logs, I searched for the script blocks containing the term "dll" in it and 2 entries matched the search. Both those entries had the same content. After looking through the entries we can see an attempted obfuscation method by trying to split the word letter by letter. GetProcAddress(h, "A" + "m" + "s" + "i" + "S" + "c" + "a" + "n" + "B" + "u" + "f" + "f" + "e" + "r"). If we join the letters we will see it spelling out AmsiScanBuffer.
                 <img src="/assets/images/writeups/smokeandmirrors/amsi.png" loading="lazy">

  card4:
    card_title: "question 04"
    question: "Which command did the attacker use to restart the machine in Safe Mode?"
    answer: "bcdedit.exe /set safeboot network"
    explanation: |
                 For this question, if we search for bcdedit, we should be able to find the command about restarting to safe mode. Atfirst I thought the answer would be "bcdedit /set safeboot network" but I forgot to put the extension of the application.
                 <img src="/assets/images/writeups/smokeandmirrors/safeboot.png" loading="lazy">

  card5:
    card_title: "question 05"
    question: "Which PowerShell command did the attacker use to disable PowerShell command history logging?"
    answer: "Set-PSReadlineOption -HistorySaveStyle SaveNothing"
    explanation: |
                 To find the answer for this question, all we will need is to filter for the word "history". Doing so will show us an entry about history deleting.
                 <img src="/assets/images/writeups/smokeandmirrors/history.png" loading="lazy">

  
#stuff
notes:
  - |
    Sysmon Event ID 12 – Registry Object Added or Deleted: Records the creation and deletion of registry keys and values.
  - |
    Sysmon Event ID 13 – Registry Value Set: Records modifications to registry values, including the registry key, value name, and written data.
  - |
    Sysmon Event ID 14 – Registry Key or Value Renamed: Records registry key and value renaming activity, including the old and new names.
  - |
    T1562 – Impair Defenses: An attacker disables, modifies, or interferes with security tools and system defenses to avoid detection.
  - |
    T1112 – Modify Registry: An attacker modifies the Windows Registry to establish persistence, change system configurations, or weaken security settings.
  - |
    T1059 – Command and Scripting Interpreter: An attacker uses command-line interfaces or scripting languages, such as PowerShell, CMD, or Bash, to execute commands and malicious code.
  - |
    T1070 – Indicator Removal: An attacker deletes or modifies artifacts, such as logs, timestamps, or files, to hide malicious activity and avoid detection.

  - |
    Event ID 4103 – Module Logging: Records PowerShell pipeline execution details, including commands, cmdlets, parameters, and module activity. Useful for identifying commands executed through PowerShell.

  - |
    Event ID 4104 – Script Block Logging: Records the contents of PowerShell script blocks as they are processed. Useful for identifying suspicious scripts, encoded commands, and potentially malicious PowerShell activity.

#stuff
configure:
  prompt: ">"

---
{% include writeup-data.html %}
