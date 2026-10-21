---
layout: writeup
title: "BFT — HTB Sherlock Writeup"
name: "BFT"
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 10
date: "2026-10-14 03:28:23 -04:00"
image: "/assets/images/writeups/bft/bft.png"
description: "An in-depth investigation of the BFT sherlock from HackTheBox (HTB)"

summary: |
         "In this Sherlock, you will become acquainted with MFT (Master File Table) forensics. You will be introduced to well-known tools and methodologies for analyzing MFT artifacts to identify malicious activity. During our analysis, you will utilize the MFTECmd tool to parse the provided MFT file, TimeLine Explorer to open and analyze the results from the parsed MFT, and a Hex editor to recover file contents from the MFT. 

         Tools Used: MFTECmd, TimeLine Explorer, HxD Hex Editor."

overview_title: "Overview"
overview:
  - |
    BFT is a beginner level HTB sherlock that involves dealing with the $MFT artifact (found under the drive root folder) and tools such as TimeLine Explorer and HxD. The artifact usually stores information on the CRUD timestamps of files present in the system, sometimes even deleted ones. If a file is small enough, it's contents will also be stored in the $MFT.
  - |
    >First Thigs First: **"Blind Analysis!!"**
  - |
    Since we can't just open the file, we need to first change it into a readable format such as json, csv, etc. In my case I chose csv. We also need to choose the tool we want to use to change the format of the artifact, in my case I chose MfteCmd.exe.
    I ran `mftecmd.exe -f c:\path\to\artifact --csv destination_folder --csvf output_file.csv`. Then `timelineexplorer.exe output_file.csv` to open and view the file's contents, the second part could take a while (it took me about a minute).
  - |
    Based on the artifact given, I suspected the attack was related to files being created. With that in mind, I filtered the log for files in the user's Downloads folder and found two items. One folder called "Kape" with its related files and subfolders, and the other is a zip called "Stage-20240213T093324Z-001" and also with its related files and subfolders. The second one intriqued me because it when it was extracted, it created a folder called "Stage" which had another zip file called invoices.zip. This seemed fishy because a common thing attackers do is make a fake invoice file or email and send it to their victims. The way those attacks work is sometimes just a simple phishing email where you are asked to make payments, and other times require the victim to download a file that actually contains code that runs when executed (double-clicked). In the artifact, we see a file called invoice.bat being created and it is part of the folder called Stage-20240213T093324Z-001. Notice how the file ends with the ".bat" extention which means it likely has code inside it that runs when the user opens it, thinking it to be a normal invoice. A file called "invoice" that has the extension of ".bat" is what made me very sure that this was the malicious file we could be looking for.
  - |
    After finding the malicious file, I wanted to know what its contents were so that I could know the exact code the attacker wanted to run. To do that, I needed a hex viewer tool. I used "mft browser (Costas K.)" instead of HxD because I already had it installed and am already comfortable with how it works. First I opened the tool, fed it the actual $MFT file (not the .csv version), then when it started loading I clicked cancel at the top. This is because it could have taken a long time to for the tool to finish processing the file and I needed the information of only one file. After cancelling, I clicked the "New Range" button at the top and a few errors showed on screen (just click "ok" for each). Then I chose the single record option and entered the mft record ID (unique ID for each file in the system, the number can be reused if a file gets deleted and its content gets replaced) of the malicious file I found. Now I could see information of the file that wasn't present in TimelineExplorer.
  - |
    The bottom right of the file shows the bytes and also readable strings found. Since this file is small enough, it's contents were stored on the artifact, we can see it by scrolling down the ascii contents table or by clicking $DATA at the bottom and then clicking resident content (the output will show in the top right).
  - text: |
          These pictures are retelling the story above. find record ID --> choose single record --> the $DATA contents section.
    images:
      - "/assets/images/writeups/bft/recordid.png"
      - "/assets/images/writeups/bft/chooserange.png"
      - "/assets/images/writeups/bft/datacontents.png"
side_notes:
  - |
    The biggest clue for identifying the malicious file was its name.
cards:
  card1:
    card_title: "question 01"
    question: "Simon stark was targeted by attackers on february 13. he downloaded a zip file from a link received in an email. what was the name of the zip file he downloaded from the link?"
    answer: "stage-20240213t093324z-001.zip"
    explanation: |
                 To find the zip, refer back to the overview section of this page where I outlined how I found it.
  card2:
    card_title: "question 02"
    question: "What is the full host url from where this zip file was downloaded?"
    answer: "https://storage.googleapis.com/drive-bulk-export-anonymous/20240213t093324.039z/4133399871716478688/a40aecd0-1cf3-4f88-b55a-e188d5c1c04f/1/c277a8b4-afa9-4d34-b8ca-e1eb5e5f983c?authuser"
    explanation: |
                 After find the malicious file, we can scroll through the entries in Timeline Explorer and one of those entries will be titled Zone.ID Contents which includes the full url from where the file was downloaded.
  card3:
    card_title: "question 03"
    question: "What is the full path and name of the malicious file that executed malicious code and connected to a c2 server?"
    answer: "c:\\users\\simon.stark\\downloads\\stage-20240213t093324z-001\\stage\\invoice\\invoices\\invoice.bat"
    explanation: |
                 The malicious file was seen to have been part of the zip file identified in question 1, and we found the exact one based on it's name.
  card4:
    card_title: "question 04"
    question: "Analyze the $created0x30 timestamp for the previously identified file. when was this file created on disk?"
    answer: "2024-02-13 16:38:39"
    explanation: |
                 If we open the Timeline explorer app with our .csv file loaded and filter for the name of the file, then scroll to the $created0x30 timeline section to find the answer.
  card5:
    card_title: "question 05"
    question: "Finding the hex offset of an mft record is beneficial in many investigative scenarios. find the hex offset of the stager file from question 3."
    answer: "16E3000"
    explanation: |
                 To find this, we will have to look at the number we see in the record offset label and then run a small code to convert that number into a hexadecimal (hex).
    images:
      - "/assets/images/writeups/bft/hexoffset.png"
    terminal_title: "find_hex.py"
    terminal_output: "x=input(\"Input Number: \") #if a non-integer number is given then the code below will fail.\nx=int(x)\n y=hex(x)\nprint(\"Output:\",y)\n\n#One-liner version\nprint(\"Output:\",hex(int(input(\"Input Number: \"))))"
    explanation3: "After finding the number mentioned above and copying it, we run the python code shown above. The first line of the code asks the user for an input number and then pauses the code until they enter a value and submit it, then the next line says \"X's new value is integer version of its current value", then the next line changes X into a hexadecimal number. The final line prints out the value of Y.\nThe line below that does that same except its a one-liner version."
  card6:
    card_title: "question 06"
    question: "Find the contents of the malicious stager identified in question 3 and answer with the c2 ip and port."
    answer: "43.204.110.203:6666"
    explanation: |
                 By looking at the $DATA contents of the file, we can see malicious code being written and also we could see the IP and port. Look at the last image in the overview panel.

---
{% include writeup-data.html %}








