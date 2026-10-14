
---
title: "Brutus"

category: "DFIR"

difficulty: "Very Easy"

image: "/assets/images/writeups/brutus.png"

summary: "In this Sherlock, you will familiarize yourself with Unix auth.log and wtmp logs. We'll explore a scenario where a Confluence server was brute-forced via its SSH service. After gaining access to the server, the attacker performed additional activities, which we can track using auth.log. Although auth.log is primarily used for brute-force analysis, we will delve into the full potential of this artifact in our investigation, including aspects of privilege escalation, persistence, and even some visibility into command execution."

platform: "HTB"
date: 2026-08-04 04:43:28 -04:00

reading_time: 10
---

.