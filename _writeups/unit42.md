---
layout: writeup
title: "Unit42 — HTB Sherlock Writeup"
name: "Unit42"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 10
date: "2026-10-22 19:45:35 -04:00"
image: "/assets/images/writeups/unit42/unit42.png"
description: "An in-depth investigation of the Unit42 sherlock from HackTheBox (HTB)"

#stuff
summary: |
         In this Sherlock, you will familiarize yourself with Sysmon logs and various useful Event IDs for identifying and analyzing malicious activities on a Windows system. Palo Alto's Unit42 recently conducted research on an UltraVNC campaign, wherein attackers utilized a backdoored version of UltraVNC to maintain access to systems. This lab is inspired by that campaign and guides participants through the initial access stage of the campaign.

         To answer the questions in this lab, you will only need the Event Viewer, with VirusTotal as an optional supplement. Below are some important Sysmon Event IDs that can be utilized in your analysis: Event ID 1: Process Creation/Execution. Includes process path, parent process path, and command-line arguments. Event ID 2: File Creation Time Changed. Includes the file making the change, the file to which the change is being made, tampered timestamp, and original timestamp. Event ID 3: Network Connection. Includes the process making the connection, destination IP address, and port. Event ID 5: Process Termination. Includes the name of the process that was killed or terminated itself. Event ID 11: File Created. Includes the process creating the file, the file being created, and its full path. Event ID 22: DNS Query. Includes the process querying the domain, the target domain name, and the IP addresses they resolve to.

#stuff
overview_title: "Blind Analysis"
overview:
  - |
    First I made a csv version of the file and opened the csv in Timeline Explorer (both the tools used for csv conversion and csv viewing where made by Eric Zimmerman). After opening the file, I saw that there were only about 169 events recorded. This meant that I could see skim through each of them straight on. When skimming through them, I got suspicious of a file called preventivo because it attempted network connections, time-stomping, deleting files, scheduled tasks, etc. Then I copied its SHA-256 hash in the hash field of the csv in Timeline Explorer and pasted it into VirusTotal which said the file was likely malicious and it also said it's related to trojan malware behavior. I also noticed that it looked up "www.example.com" which seemed weird to me.

#stuff
side_notes:
  - |
    The files were not extracting properly so I used 7zip to extract the files.

#stuff
cards:
  card1:
    card_title: "question 01"
    question: "How many event logs are there with event id 11?"
    answer: "56"
    explanation: |
                 To find this, we can filter for the events with their Event ID being "11", then if we check the total lines (events) we can see that there were 56 of them available.

  card2:
    card_title: "question 02"
    question: "Whenever a process is created in memory, an event with event id 1 is recorded with details such as command line, hashes, process path, parent process path, etc. what is the malicious process that infected the victim's system?"
    answer: "c:\\users\\cyberjunkie\\downloads\\preventivo24.02.14.exe.exe"
    explanation: |
                 Looking back at the analysis, we can see that the file we suspected and tested (using it's hash) was malicious and it was preventivo24.

  card3:
    card_title: "question 03"
    question: "Which cloud drive was used to distribute the malware?"
    answer: "dropbox"
    explanation: |
                 To find this, first I sorted out the events based on their timestamp (ascending), then I looked through the ones that mentioned the malware and saw the url in which it was downloaded from. The domain I saw was dropbox.

  card4:
    card_title: "question 04"
    question: "The initial malicious file time-stamped (a defense evasion technique, where the file creation date is changed to make it appear old) many files it created on disk. what was the timestamp changed to for a pdf file?"
    answer: "2024-01-14 08:10:06"
    explanation: |
                 The question itself hinted that the answer would be related to a pdf file and that pdf file would be one that was created by the malware and not the user from a different date, that tells us that simply searching for "pdf" and also time-stomping events should give us the answer. Searching for a the string "pdf" in the search bar returned 2 events, one was a file delete and the other a timestomp activity. If we look through the second event we see that it reveals the original and updated time.

  card5:
    card_title: "question 05"
    question: "The malicious file dropped a few files on disk. where was \"once.cmd\" created on disk? please answers with the full path along with the filename."
    answer: "c:\\users\\cyberjunkie\\appdata\\roaming\\photo and fax vn\\photo and vn 1.1.2\\install\\f97891c\\windowsvolume\\games\\once.cmd"
    explanation: |
                 If we filter for the file called "once.cmd", we see a few events that contain that name, but only 2 of those events was information on a file being created. To find the correct one of those 2, we can see the file dropped by "DESKTOP-887GK2L\CyberJunkie" was the one somewhere inside the appdata folder. We could also look at the other files that were dropped and correlate them with this file and see that a bunch of files were dropped in the same folder (oncd.cmd included).

  card6:
    card_title: "question 06"
    question: "The malicious file attempted to reach a dummy domain, most likely to check the internet connection status. what domain name did it try to connect to?"
    answer: "www.example.com"
    explanation: |
                 If we filter for "dns", We see a DNSQuery being made to www.example.com. I also so this in my initial analysis and it made me confused as to why it attempted to reach that domain.

  card7:
    card_title: "question 07"
    question: "Which ip address did the malicious process try to reach out to?"
    answer: "93.184.216.34"
    explanation: |
                 To find this, we have to look for the network connection attempts made by the user, so we filter for eventID 3. We see 1 event that says 172.17.79.132 reached out to 93.184.216.34. If there were more than 1, we would have to look for the one close to the timestamps of the events we have identified so far.

  card8:
    card_title: "question 08"
    question: "The malicious process terminated itself after infecting the pc with a backdoored variant of ultravnc. when did the process terminate itself?"
    answer: "2024-02-14 03:41:58"
    explanation: |
                 By filtering for eventID 5 (process termination), we see one event that occured at 2024-02-14 03:41:58.

#stuff
notes:
  - |
    Sysmon Event ID 1: Process Creation/Execution. Includes process path, parent process path, and command-line arguments.
  - |
    Sysmon Event ID 2: File Creation Time Changed. Includes the file making the change, the file to which the change is being made, tampered timestamp, and original timestamp.
  - |
    Sysmon Event ID 3: Network Connection. Includes the process making the connection, destination IP address, and port.
  - |
    Sysmon Event ID 5: Process Termination. Includes the name of the process that was killed or terminated itself.
  - |
    Sysmon Event ID 11: File Created. Includes the process creating the file, the file being created, and its full path.
  - |
    Sysmon Event ID 22: DNS Query. Includes the process querying the domain, the target domain name, and the IP addresses they resolve to.

---
{% include writeup-data.html %}
