---
layout: writeup
title: "Noxious — HTB Sherlock Writeup"
name: "Noxious"
category: "SOC"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 10
date: "2026-07-18 03:34:29 -04:00"
image: "/assets/images/writeups/noxious/noxious.png"
description: "An in-depth investigation of the Noxious sherlock from HackTheBox (HTB)"

summary: "The IDS device alerted us to a possible rogue device in the internal Active Directory network. The Intrusion Detection System also indicated signs of LLMNR traffic, which is unusual. It is suspected that an LLMNR poisoning attack occurred. The LLMNR traffic was directed towards Forela-WKstn002, which has the IP address 172.17.79.136. A limited packet capture from the surrounding time is provided to you, our Network Forensics expert. Since this occurred in the Active Directory VLAN, it is suggested that we perform network threat hunting with the Active Directory attack vector in mind, specifically focusing on LLMNR poisoning."

overview_title: "Overview"
overview:
  - |
    Text
  - |
    Text
  - |
    Text
side_notes:
  - |
    Text
  - |
    Text
  - |
    Text
cards:
  card1:
    card_title: "question 01"
    question: "Text?"
    answer: "Text"
    explanation: |
                 Text
    terminal_title: "Text"
    terminal_code1: "Text"
    terminal_output1: |-
      Text
      Text
  card2:
    card_title: "question 02"
    question: "Text?"
    answer: "Text"
    explanation: |
                 Text
    terminal_title: "Text"
    terminal_code1: "Text"
    terminal_output1: |-
      Text
notes:
  - |
    Text
  - |
    Text
  - |
    Text

---
{% include writeup-data.html %}
