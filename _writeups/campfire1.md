---
layout: writeup
title: "Campfire-1 — HTB Sherlock Writeup"
name: "Campfire-1"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 7
date: "2026-08-26 01:17:56 -05:00"
image: "/assets/images/writeups/campfire1/campfire1.png"
descrption: "An in-depth investigation of the Campfire-1 sherlock from HackTheBox (HTB)"

#stuff
summary: "Alonzo Spotted Weird files on his computer and informed the newly assembled SOC Team. Assessing the situation it is believed a Kerberoasting attack may have occurred in the network. It is your job to confirm the findings by analyzing the provided evidence.\n\nYou are provided with:\n\n1- Security Logs from the Domain Controller\n\n2- PowerShell-Operational Logs from the affected workstation\n\n3- Prefetch Files from the affected workstation"

#stuff
overview_title: "Blind Analysis"
overview:
  - |
    This sherlock gives us 2 event log files and a folder containing multiple prefetch files. I started my analysis by using PECmd.exe and EvtxeCmd.exe to change the files into a csv. Then I opened them in TimelineExplorer.exe. After parsing them to a csv, I had a csv for each of the event files and another one for all the prefetch files, and also another one called prefetch_timeline.csv.
    <img src="/assets/images/writeups/campfire1/files.png" loading="lazy">
  - |
    I started the analysis with the Dc file, which had only about 194 lines. After skimming through it I found a few key stuff. The first thing I found was multiple failed password attempts from the same account. Then I found about 16 service tickets being requested. I filtered for EventID 4769, Kerberos service ticket requests. Then I checked the ecryption type of the tickets and found that "MSSQLService" had a weak encryption type, RC4-HMAC, which me believe that "MSSQLService" was likely the one kerberoasted since it has a weaker encryption type making it easier to crack. 
  - |
    After finding the service ticket that was targeted, I then looked through the powershell logs and all I found was a script called powerview.ps1 being executed a few minutes before the kerberoasting attempt. Then I also decided to look through the prefetch files and filtered for a timerange that's close to when the attack occured, 5 minutes before until 5 minutes after. After looking through the pf files within that timerange, I saw that RUBEUS.EXE, an executable used to inspect kerberos tickets, ran one second before the service ticket was requested.

#stuff
cards:
  card1:
    card_title: "question 01"
    question: "analyzing domain controller security logs, can you confirm the date & time when the kerberoasting activity occurred?"
    answer: "2024-05-21 03:18:09"
    explanation: |
                 We can simply look at the TimeCreated field that the "MSSQLService" ticket was requested.
                 <img src="/assets/images/writeups/campfire1/mssql.png" loading="lazy">

  card2:
    card_title: "question 02"
    question: "what is the service name that was targeted?"
    answer: "mssqlservice"
    explanation: |
                 If we look through all the service tickets that were generated, the ticket for MSSQL seemed to be the most suspicious because its encryption type was the weakest, making it the most susceptible to kerberoasting. We can find this from the image above.

  card3:
    card_title: "question 03"
    question: "it is really important to identify the workstation from which this activity occurred. what is the ip address of the workstation?"
    answer: "172.17.79.129"
    explanation: |
                 We can simply look into the remote host field of the same event as question 01.
                 <img src="/assets/images/writeups/campfire1/remotehost.png" loading="lazy">

  card4:
    card_title: "question 04"
    question: "now that we have identified the workstation, a triage including powershell logs and prefetch files are provided to you for some deeper insights so we can understand how this activity occurred on the endpoint. what is the name of the file used to enumerate active directory objects and possibly find kerberoastable accounts in the network?"
    answer: "powerview.ps1"
    explanation: |
                 If we look through the powershell log, we will see that a script was executed and it's called powerview.ps1.
                 <img src="/assets/images/writeups/campfire1/powerview.png" loading="lazy">

  card5:
    card_title: "question 05"
    question: "when was this script executed?"
    answer: "2024-05-21 03:16:32"
    explanation: |
                 We can look in the TimeCreated coloumn of the image from the previous question to identify this.

  card6:
    card_title: "question 06"
    question: "what is the full path of the tool used to perform the actual kerberoasting attack?"
    answer: "c:\\users\\alonzo.spire\\downloads\\rubeus.exe"
    explanation: |
                 Since Rubeus.exe was executed the second before the MSSQLService ticket was requested (we can find this in the vsv version of the prefetch file), this tool seemed to be the most likely item used in the attack. If we check to the files loaded section, we will find it's full path over there. Alternatively, we could search for its name in the prefetch_timeline to recieve its full path and also the time of execution. We can replace the "VOLUME\VOLUME{01d951602330db46-52233816}\" section of it to C:\.

  card7:
    card_title: "question 07"
    question: "when was the tool executed to dump credentials?"
    answer: "2024-05-21 03:18:08"
    explanation: |
                 By looking at the "Last Run" timestamp of rubeus.exe, we can see that it last ran on 2024-05-21 03:18:08.
                 <img src="/assets/images/writeups/campfire1/rubeustime.png" loading="lazy">
  
#stuff
notes:
  - |
    Windows Security Event ID 4769: Kerberos Service Ticket Requested. Recods Kerberos service ticket requests.
  - |
    Windows Security Event ID 4768: Kerberos TGT Requested. Records Ticket Granting Ticket requests.
  - |
    Windows Security Event ID 4771: Kerberos Pre-Authentication Failed. Records failed Kerberos pre-authentication attempts.
  - |
    T1558.003 – Kerberoasting: An attacker requests service tickets to crack service account passwords offline.
  - |
    T1087.002 – Domain Account Discovery: An attacker enumerates domain accounts to identify potential targets.


#stuff
configure:
  prompt: ">"

#<img src="/assets/images/writeups/campfire1/yz.png" loading="lazy">
---
{% include writeup-data.html %}
