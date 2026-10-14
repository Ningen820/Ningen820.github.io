
---
title: "CrownJewel1"

category: "DFIR"

difficulty: "Very Easy"

image: "/assets/images/writeups/crownjewel1.png"

summary: "Forela's domain controller is under attack. The Domain Administrator account is believed to be compromised, and it is suspected that the threat actor dumped the NTDS.dit database on the DC. We just received an alert of vssadmin being used on the DC. Since this is not part of the routine schedule, we have good reason to believe that the attacker abused this LOLBIN utility to get the Domain environment's crown jewel. Perform some analysis on provided artifacts for a quick triage and, if possible, kick the attacker out as early as possible."

platform: "HTB"
date: 2026-08-03 22:38:19 -04:00

reading_time: 10
---

.