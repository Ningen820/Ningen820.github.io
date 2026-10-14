---
title: "Noxious"

category: "SOC"

difficulty: "Very Easy"

image: "/assets/images/writeups/noxious.png"

summary: "The IDS device alerted us to a possible rogue device in the internal Active Directory network. The Intrusion Detection System also indicated signs of LLMNR traffic, which is unusual. It is suspected that an LLMNR poisoning attack occurred. The LLMNR traffic was directed towards Forela-WKstn002, which has the IP address 172.17.79.136. A limited packet capture from the surrounding time is provided to you, our Network Forensics expert. Since this occurred in the Active Directory VLAN, it is suggested that we perform network threat hunting with the Active Directory attack vector in mind, specifically focusing on LLMNR poisoning."

platform: "HTB"
date: 2026-09-16 03:17:23 -04:00

reading_time: 10
---

.