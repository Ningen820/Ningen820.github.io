---
layout: writeup
title: "SmartyPants — HTB Sherlock Writeup"
name: "SmartyPants"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 10
date: "2026-11-08 16:54:28 -05:00"
image: "/assets/images/writeups/smartypants/smartypants.png"
descrption: "An in-depth investigation of the Smarty Pants sherlock from HackTheBox (HTB)"

#stuff
summary: "Forela's CTO, Dutch, stores important files on a separate Windows system because the domain environment at Forela is frequently breached due to its exposure across various industries. On 24 January 2025, our worst fears were realised when an intruder accessed the fileserver, installed utilities to aid their actions, stole critical files, and then deleted them, rendering them unrecoverable. The team was immediately informed of the extortion attempt by the intruders, who are now demanding money. While our legal team addresses the situation, we must quickly perform triage to assess the incident's extent. Note from the manager: We enabled SmartScreen Debug Logs across all our machines for enhanced visibility a few days ago, following a security research recommendation. These logs can provide quick insights, so ensure they are utilised."

#stuff
overview_title: "Blind Analysis"
overview:
  - |
    Extracting the zip gave us a folder with many event log files. I used Evtxecmd.exe and also TimelineExplorer.exe for my analysis (both are in my path). After running the command `evtxecmd.exe -d logs --csv outputs --csvf events.csv`, I opened the events.csv file using TimelineExplorer. 
  - |
    Since the sherlock's description itself said that SmartScreen logs will be important, I mostly focused on them. I did that by filtering for SmartScreen in the provider coloumn. The important things I saw were winrar.exe, everything.exe, shredder.exe, megasync.exe, and two document files that looked important based on their names. The timeframe of these things were between 2025-01-24 10:17:14 — 2025-01-24 10:27:09. Then I proceeded to filter for events that happened during those minutes to see if I could find any extra context

#stuff
side_notes:
  - |
    I renamed the folder containing the log files to "logs" to make it easier for me later.
  - |
    My logs are sorted by TimeCreated in ascending order.

#stuff
cards:
  card1:
    card_title: "question 01"
    question: "When did the attacker log in via RDP?"
    answer: "2025-01-24 10:15:14"
    explanation: |
                 We can find this by filtering for EventID 1149 for TerminalServices-RemoteConnectionManager/Operational. We see one event that's at 2025-01-24 10:15:14.

  card2:
    card_title: "question 02"
    question: "What was the first tool they downloaded and installed?"
    answer: "winrar"
    explanation: |
                 If we look in the SmartScreen events, we will see winrar getting installed.

  card3:
    card_title: "question 03"
    question: "What was the full path of the portable file search tool?"
    answer: "c:\\users\\dutch\\downloads\\everything.exe"
    explanation: |
                 After winrar was installed, we saw a file called everything.exe and its full path. If we look it up online we will see its information.
                 <img src="/assets/images/writeups/smartypants/everything.png" loading="lazy">

  card4:
    card_title: "question 04"
    question: "When was the file search tool executed?"
    answer: "2025-01-24 10:17:33"
    explanation: |
                 We can go to the TimeCreated coloumn of the everything.exe file we previously saw.
  card5:
    card_title: "question 05"
    question: "What was the first stolen document?"
    answer: "c:\\users\\dutch\\documents\\2025- board of directors documents\\ministry of defense audit.pdf"
    explanation: |
                 If the events are sorted in ascending order, the first document we will come across is ministry of defense audit.pdf.
                 <img src="/assets/images/writeups/smartypants/docs.png" loading="lazy">

  card6:
    card_title: "question 06"
    question: "What was the second stolen document?"
    answer: "c:\\users\\dutch\\documents\\2025- board of directors documents\\2025-budget-allocation-confidential.pdf"
    explanation: |
                 If the events are sorted in ascending order, the second document we will come across is 2025-budget-allocation-confidential.pdf.

  card7:
    card_title: "question 07"
    question: "What cloud utility was used to steal the documents?"
    answer: "megasync"
    explanation: |
                 After the two documents, we see MEGAsyncsetup64.exe being installed and then later MEGAsync.exe was ran. If we look up MEGAsync we will see that it's a cloud utility.
                 <img src="/assets/images/writeups/smartypants/megasync.png" loading="lazy">

  card8:
    card_title: "question 08"
    question: "When was the cloud utility executed?"
    answer: "2025-01-24 10:22:19"
    explanation: |
                 If we go to the row that contains MEGAsync.exe and then scroll to the TimeCreated coloumn of it, we will see that it was ran at 10:22:19.

  card9:
    card_title: "question 09"
    question: "What utility was used to destroy the data?"
    answer: "file shredder"
    explanation: |
                 After all this, we then see an application called file_shredder_setup.exe being installed and then Shredder.exe being executed. If we look up "file shredder.exe", we can see that it's used to permanently delete files.
                 <img src="/assets/images/writeups/smartypants/shredder.png" loading="lazy">

  card10:
    card_title: "question 10"
    question: "When was the security log cleared?"
    answer: "2025-01-24 10:28:41"
    explanation: |
                 The attacker cleared 2 logs, one is a system log and the other is a security log. This question asks for the security log, so we can filter the "Channel" coloumn for "Security", we will find that the the first event is Event Log Cleared. The EventID for log clearing in Security.evtx is 1102, so we could also filter for that.
                 <img src="/assets/images/writeups/smartypants/log.png" loading="lazy">
  
#stuff
notes:
  - |
    - Windows Security Event ID 1102: Audit Log Cleared. Indicates that the Windows Security event log was cleared.
  - |
    Windows System Event ID 104: System Log Cleared. Indicates that the Windows System event log was cleared.
  - |
    RDP RemoteConnectionManager Event ID 1149: Remote Desktop Authentication Succeeded. Typically contains the authenticated username, domain, and source network address.
  - |
    T1021.001 – Remote Desktop Protocol: An attacker uses RDP to remotely access a compromised Windows machine.
  - |
    T1105 – Ingress Tool Transfer: An attacker transfers tools or files into a compromised system.
  - |
    T1083 – File and Directory Discovery: An attacker searches the filesystem to locate important files and directories.
  - |
    T1567.002 – Exfiltration to Cloud Storage: An attacker uses cloud storage services to exfiltrate stolen data.
  - |
    T1485 – Data Destruction: An attacker destroys data to make it unrecoverable.
  - |
    T1070.001 – Clear Windows Event Logs: An attacker clears Windows event logs to remove evidence of malicious activity.

#stuff
configure:
  prompt: ">"

#<img src="/assets/images/writeups/x/yz.png" loading="lazy">
---
{% include writeup-data.html %}
