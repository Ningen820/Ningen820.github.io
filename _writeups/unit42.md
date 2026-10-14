---
title: "Unit42"

category: "DFIR"

difficulty: "Very Easy"

image: "/assets/images/writeups/unit42.png"

summary: "In this Sherlock, you will familiarize yourself with Sysmon logs and various useful Event IDs for identifying and analyzing malicious activities on a Windows system. Palo Alto's Unit42 recently conducted research on an UltraVNC campaign, wherein attackers utilized a backdoored version of UltraVNC to maintain access to systems. This lab is inspired by that campaign and guides participants through the initial access stage of the campaign.

To answer the questions in this lab, you will only need the Event Viewer, with VirusTotal as an optional supplement. Below are some important Sysmon Event IDs that can be utilized in your analysis: Event ID 1: Process Creation/Execution. Includes process path, parent process path, and command-line arguments. Event ID 2: File Creation Time Changed. Includes the file making the change, the file to which the change is being made, tampered timestamp, and original timestamp. Event ID 3: Network Connection. Includes the process making the connection, destination IP address, and port. Event ID 5: Process Termination. Includes the name of the process that was killed or terminated itself. Event ID 11: File Created. Includes the process creating the file, the file being created, and its full path. Event ID 22: DNS Query. Includes the process querying the domain, the target domain name, and the IP addresses they resolve to."

platform: "HTB"
date: 2026-08-12 14:37:24 -04:00

reading_time: 10
---

.