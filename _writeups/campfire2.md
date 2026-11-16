---
layout: writeup
title: "Campfire-2 — HTB Sherlock Writeup"
name: "Campfire-2"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 10
date: "2026-11-15 23:30:43 -05:00"
image: "/assets/images/writeups/campfire2/campfire2.png"
descrption: "An in-depth investigation of the Campfire-2 sherlock from HackTheBox (HTB)"

#stuff
summary: "Forela's Network is constantly under attack. The security system raised an alert about an old admin account requesting a ticket from KDC on a domain controller. Inventory shows that this user account is not used as of now so you are tasked to take a look at this. This may be an AsREP roasting attack as anyone can request any user's ticket which has preauthentication disabled."

#stuff
overview_title: "Blind Analysis"
overview:
  - |
    After using EvtxeCmd.exe from Eric Zimmerman, I proceeded to use his other tool called TImelineExplorer.exe. The first tool is used to convert the log file I was given into csv format, the second tool was used to open the csv into a readable table.  
  - |
    The size of this log file was not too large so it was possible to scroll through it. I scrolled through it for about 15 minutes looking for common things found in asrep roasting attacks, such as logins without preauth. I found a TGT request from arthur.kyle that had no preauthentication enabled and its encryption type was a RC4-HMAC, a weak and older encryption type. After finding this, I noted a few things from that event such as attacker IP and the timestamp. Then I filtered the full log for the attacker's IP address. The main things I found were that he accessed a network share through a different username and also a service ticket request.

#stuff
side_notes:
  - |
    Attacker IP: 172.17.79.129

#stuff
cards:
  card1:
    card_title: "question 01"
    question: "when did the asrep roasting attack occur, and when did the attacker request the kerberos ticket for the vulnerable user?"
    answer: "2024-05-29 06:36:40"
    explanation: |
                 Since asrep roasting attaks occur when preauthentication is turned off, I filtered for Kerberos TGT events (EventID 4768). I found one event that did not have preauthentication enabled, the username was arthur.kyle.
                 <img src="/assets/images/writeups/campfire2/nopreauth.png" loading="lazy">

  card2:
    card_title: "question 02"
    question: "please confirm the user account that was targeted by the attacker."
    answer: "arthur.kyle"
    explanation: |
                 Following the same steps as done in question 01, we can see that the username is arthur.kyle.

  card3:
    card_title: "question 03"
    question: "what was the sid of the account?"
    answer: "s-1-5-21-3239415629-1862073780-2394361899-1601"
    explanation: |
                 For that same event we saw in questions 01 and 02, If we go to the Payload section of that same event we saw in questions 01 and 02, we can look in the TargetSid field.
                 <img src="/assets/images/writeups/campfire2/sid.png" loading="lazy">

  card4:
    card_title: "question 04"
    question: "it is crucial to identify the compromised user account and the workstation responsible for this attack. please list the internal ip address of the compromised asset to assist our threat-hunting team."
    answer: "172.17.79.129"
    explanation: |
                 We can find the ip by looking at the "Remote Host" field for the same event as in previous questions. The number after the ':' is the port number so we can exclude that.
                 <img src="/assets/images/writeups/campfire2/remotehost.png" loading="lazy">

  card5:
    card_title: "question 05"
    question: "we do not have any artifacts from the source machine yet. using the same dc security logs, can you confirm the user account used to perform the asrep roasting attack so we can contain the compromised account/s?"
    answer: "happy.grunwald"
    explanation: |
                 If we filter for the attacker's IP in the "Remote Host" field, we can see that they requested a service ticket under the username "happy.grunwald" and then proceeded to access network share objects.
                 <img src="/assets/images/writeups/campfire2/ipfilter.png" loading="lazy">
  
#stuff
notes:
  - |
    Windows Security Event ID 4768: Kerberos TGT Requested. Records Ticket Granting Ticket requests.

#stuff
configure:
  prompt: ">"

#<img src="/assets/images/writeups/campfire2/yz.png" loading="lazy">
---
{% include writeup-data.html %}
