---
title: "CrownJewel2"

category: "DFIR"

difficulty: "Very Easy"

image: "/assets/images/writeups/crownjewel2.png"

summary: "Forela's Domain environment is pure chaos. Another alert has arrived from the Domain Controller reporting that the NTDS.dit database is being exfiltrated. Just one day prior, you responded to an alert on the same domain controller where an attacker dumped NTDS.dit via the vssadmin utility. However, you managed to delete the dumped files, kick the attacker out of the DC, and restore a clean snapshot. Now they have again managed to access the DC with a domain admin account using their persistent access. This time, they are abusing ntdsutil to dump the database. Help Forela in these chaotic times!"

platform: "HTB"
date: 2026-10-13 03:53:19 -04:00

reading_time: 10
---

.