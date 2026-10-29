---
layout: writeup
title: "PhishNet — HTB Sherlock Writeup"
name: "PhishNet"
category: "SOC"
difficulty: "Very Easy"
platform: "HTB"
reading_time: 10
date: "2026-07-29 00:26:56 -04:00"
image: "/assets/images/writeups/phishnet/phishnet.png"
description: "An in-depth investigation of the PhishNet sherlock from HackTheBox (HTB)"

#stuff
summary: |
         An accounting team receives an urgent payment request from a known vendor. The email appears legitimate but contains a suspicious link and a .zip attachment hiding malware. Your task is to analyze the email headers and uncover the attacker's scheme.

#stuff

#stuff
cards:
  card1:
    terminal_title: "email.eml"
    terminal_code1: "cat -n logs/email.eml"
    terminal_output1: |-
      1  Return-Path: <finance@business-finance.com>
      2  Reply-To: <support@business-finance.com>
      3  X-Mailer: Microsoft Outlook 16.0
      4  X-Originating-IP: [45.67.89.10]
      5  X-Priority: 1 (Highest)
      6  X-MSMail-Priority: High
      7  Received-SPF: Pass (protection.outlook.com: domain of business-finance.com designates 45.67.89.10 as permitted sender)
      8  ARC-Seal: i=1; a=rsa-sha256; d=business-finance.com; s=arc-2025; t=1677416100; cv=pass;
      9  ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=business-finance.com; s=arc-2025;
      10  X-AntiSpam: Passed
      11  X-Organization: Business Finance Ltd.
      12  X-Envelope-From: finance@business-finance.com
      13  List-Unsubscribe: <mailto:unsubscribe@business-finance.com>
      14  X-Sender-IP: 45.67.89.10
      15  Received: from mail.business-finance.com ([203.0.113.25])
      16          by mail.target.com (Postfix) with ESMTP id ABC123;
      17          Mon, 26 Feb 2025 10:15:00 +0000 (UTC)
      18  Received: from relay.business-finance.com ([198.51.100.45])
      19          by mail.business-finance.com with ESMTP id DEF456;
      20          Mon, 26 Feb 2025 10:10:00 +0000 (UTC)
      21  Received: from finance@business-finance.com ([198.51.100.75])
      22          by relay.business-finance.com with ESMTP id GHI789;
      23          Mon, 26 Feb 2025 10:05:00 +0000 (UTC)
      24  Authentication-Results: spf=pass (domain business-finance.com designates 45.67.89.10 as permitted sender)
      25           smtp.mailfrom=business-finance.com;
      26           dkim=pass header.d=business-finance.com;
      27           dmarc=pass action=none header.from=business-finance.com;
      28  Message-ID: <20250226101500.ABC123@business-finance.com>
      29  Date: Mon, 26 Feb 2025 10:15:00 +0000 (UTC)
      30  From: "Finance Dept" <finance@business-finance.com>
      31  To: "Accounting Dept" <accounts@globalaccounting.com>
      32  Subject: Urgent: Invoice Payment Required - Overdue Notice
      33  MIME-Version: 1.0
      34  Content-Type: multipart/mixed; boundary="boundary123"
      35
      36  --boundary123
      37  Content-Type: text/html; charset="UTF-8"
      38  Content-Transfer-Encoding: quoted-printable
      39
      40  <html>
      41  <head>
      42    <title>Invoice Overdue</title>
      43  </head>
      44  <body>
      45    <p>Dear Accounting Team,</p>
      46  <p>This is a final notice regarding the outstanding invoice #INV-2025-0012. Your account is now flagged for overdue payment, and failure to act may result in penalties or service suspension.</p>
      47  <p>Details of the invoice:</p>
      48  <ul>
      49    <li><b>Invoice Number:</b> INV-2025-0012</li>
      50    <li><b>Amount Due:</b> $4,750.00</li>
      51    <li><b>Due Date:</b> February 28, 2025</li>
      52  </ul>
      53    <p>Our records indicate that invoice #INV-2025-0012 is overdue for payment. Please process the payment immediately to avoid late fees.</p>
      54    <p>For your convenience, you can download the full invoice and payment instructions from the link below:</p>
      55    <p><a href="https://secure.business-finance.com/invoice/details/view/INV2025-0987/payment">Download Invoice</a></p>
      56    <p>Alternatively, the invoice is also attached as a .zip file.</p>
      57    <p>If you have already made the payment, kindly ignore this notice.</p>
      58    <p>Best regards,<br>Finance Department<br>Business Finance Ltd.</p>
      59  </body><p>For assistance, please contact our support team at <a href='mailto:support@business-finance.com'>support@business-finance.com</a> or call our helpline at +1-800-555-0199.</p>
      60  <p>Thank you for your prompt attention to this matter.</p>
      61
      62  </html>
      63
      64  --boundary123
      65  Content-Type: application/zip; name="Invoice_2025_Payment.zip"
      66  Content-Disposition: attachment; filename="Invoice_2025_Payment.zip"
      67  Content-Transfer-Encoding: base64
      68
      69  UEsDBBQAAAAIABh/WloXPY4qcxITALvMGQAYAAAAaW52b2ljZV9kb2N1bWVudC5wZGYuYmF0zL3ZzuzIsR18LQN+h62DPujWX0e7
      70
      71  --boundary123--
    explanation3: "The command `cat` is used to take the text in a file and bring it out on the screen as output, the `-n` tells it to number the lines in the file (by default it numbers empty lines too), the `logs/email.eml` is the path of the file we want to see."

  card2:
    card_title: "question 01"
    question: "What is the originating IP address of the sender?"
    answer: "45.67.89.10"
    explanation: |
                 By looking at the output (raw email contents) above, we can see the the sender's IP address on the 14th line.

  card3:
    card_title: "question 02"
    question: "Which mail server relayed this email before reaching the victim?"
    answer: "203.0.113.25"
    explanation: |
                 When we look at lines 15-24, we see the hops the email took before it reached the victim. The bottomest one is the earliest hop and the uppermost one is the final hop. To check the mail server before it reached the victim, we have to check the final hop and there we see a "from" section. The "from" section includes the server name and also its ip. This specific question turned out to be asking for the ip of the server. We can also simplify the output onscreen with `head -n 27 logs/email.eml |nl -ba |tail -n 14`. What that command does is this. `head` tells us to take the topper lines of the file/output (in this case the file is `logs/email.eml` and the `-n 27` specifies the amount of lines to take). We then pass down lines 1-27 to the next command `nl -ba` via the `|` (the `|` is called a pipeline that passes the command on the left to the one on the right, the `nl -ba` tells us to number the output's lines and the `-ba` part of that command tells us to also count empty lines. In our case this will give us 1-27). After that we do the pipeline again but this time we pass it to `tail` which tells us to give us the lower lines of the file/output (in our case the output is lines 1-27 of the file. the `-n 14` specifies the amount of lines to take). The `nl -ba` part was just there to make it easier for us since it shows us the line numbers and the command was dealing with manually selecting x lines. That command was to give out lines 14-27 because that was the part that included the "hops" of the email.
    terminal_title: "Final Server Hop"
    terminal_code1: "head -n 27 logs/email.eml |nl -ba |tail -n 14"
    terminal_output1: |-
      14  X-Sender-IP: 45.67.89.10
      15  Received: from mail.business-finance.com ([203.0.113.25])
      16          by mail.target.com (Postfix) with ESMTP id ABC123;
      17          Mon, 26 Feb 2025 10:15:00 +0000 (UTC)
      18  Received: from relay.business-finance.com ([198.51.100.45])
      19          by mail.business-finance.com with ESMTP id DEF456;
      20          Mon, 26 Feb 2025 10:10:00 +0000 (UTC)
      21  Received: from finance@business-finance.com ([198.51.100.75])
      22          by relay.business-finance.com with ESMTP id GHI789;
      23          Mon, 26 Feb 2025 10:05:00 +0000 (UTC)
      24  Authentication-Results: spf=pass (domain business-finance.com designates 45.67.89.10 as permitted sender)
      25           smtp.mailfrom=business-finance.com;
      26           dkim=pass header.d=business-finance.com;
      27           dmarc=pass action=none header.from=business-finance.com;

  card4:
    card_title: "question 03"
    question: "What is the sender's email address?"
    answer: "finance@business-finance.com"
    explanation: |
                 The answer for this question can easily be found if we simply read the email header. But to make matters simpler for us, we can run a little filter for only the lines that have a certain keyword. The command is `cat -n logs/email.eml |grep -i from`. In that command, `grep` is used to take the text in an output/file and search a certain keyword against the lines in that output/file. the `-i` indicates case-insensitive searching. The word `from` is the keyword we searched for. The output is all lines that contain the word "from".
    terminal_title: "Sender's Email"
    terminal_code1: "cat -n logs/email.eml |grep -i from"
    terminal_output1: |-
      12  X-Envelope-From: finance@business-finance.com
      15  Received: from mail.business-finance.com ([203.0.113.25])
      18  Received: from relay.business-finance.com ([198.51.100.45])
      21  Received: from finance@business-finance.com ([198.51.100.75])
      25           smtp.mailfrom=business-finance.com;
      27           dmarc=pass action=none header.from=business-finance.com;
      30  From: "Finance Dept" <finance@business-finance.com>
      54    <p>For your convenience, you can download the full invoice and payment instructions from the link below:</p>

  card5:
    card_title: "question 04"
    question: "What is the 'Reply-To' email address specified in the email?"
    answer: "support@business-finance.com"
    explanation: |
                 By looking at the email header field, we can find the 'Reply-To' email address. It sits on the second line.
    terminal_title: "Reply-To Email"
    terminal_code1: "cat -n logs/email.eml |grep -i reply-to"
    terminal_output1: |-
      2  Reply-To: <support@business-finance.com>

  card6:
    card_title: "question 05"
    question: "What is the SPF (Sender Policy Framework) result for this email?"
    answer: "pass"
    explanation: |
                 By running a similar command as the one above, except this time we filter for the keyword "spf", we should be able to see the spf result for the email.
    terminal_title: "SPF Result"
    terminal_code1: "cat -n logs/email.eml |grep -i spf"
    terminal_output1: |-
      7  Received-SPF: Pass (protection.outlook.com: domain of business-finance.com designates 45.67.89.10 as permitted sender)
      24  Authentication-Results: spf=pass (domain business-finance.com designates 45.67.89.10 as permitted sender)

  card7:
    card_title: "question 06"
    question: "What is the domain used in the phishing URL inside the email?"
    answer: "secure.business-finance.com"
    explanation: |
                 To find this, we can either look to where the actual email message starts and find the domain inside a url mentioned or run a similar command like above. For this one, we will filter for "href" since in html it's used to add a redirect url. 
    terminal_title: "Domain URL"
    terminal_code1: "cat -n logs/email.eml |grep -i href"
    terminal_output1: |-
      55    <p><a href="https://secure.business-finance.com/invoice/details/view/INV2025-0987/payment">Download Invoice</a></p>
      59  </body><p>For assistance, please contact our support team at <a href='mailto:support@business-finance.com'>support@business-finance.com</a> or call our helpline at +1-800-555-0199.</p>
    explanation3: "The output gives us two matches, and we can see that the first match is a url and the second match is not a typical url and is less likely the one we are being asked of. The answer should contain both the domain and subdomain and we know that the domain and subdomain in a url is the things that come after the https and at the end of the tld. For example something.secondThing.com, something is the subdomain and secondThing is the subdomain and the .com is the tld"

  card8:
    card_title: "question 07"
    question: "What is the fake company name used in the email?"
    answer: "Business Finance Ltd."
    explanation: |
                 If we look back at the email header field, we can see the organization section where it says "X-Organization: Business Finance Ltd.". 

  card9:
    card_title: "question 08"
    question: "What is the name of the attachment included in the email?"
    answer: "Invoice_2025_Payment.zip"
    explanation: |
                 The answer for this is at the last 10 lines of the email where it explicitly mentions the name.
    terminal_title: "attachment Name"
    terminal_code1: "tail -n 10 logs/email.eml"
    terminal_output1: |-
      </html>

      --boundary123
      Content-Type: application/zip; name="Invoice_2025_Payment.zip"
      Content-Disposition: attachment; filename="Invoice_2025_Payment.zip"
      Content-Transfer-Encoding: base64

      UEsDBBQAAAAIABh/WloXPY4qcxITALvMGQAYAAAAaW52b2ljZV9kb2N1bWVudC5wZGYuYmF0zL3ZzuzIsR18LQN+h62DPujWX0e7

  card10:
    card_title: "question 09"
    question: "What is the SHA-256 hash of the attachment?"
    answer: "8379C41239E9AF845B2AB6C27A7509AE8804D7D73E455C800A551B22BA25BB4A"
    explanation: |
                 The last thing we saw in the email is a long gibberish-looking text which is actually a base64 encoded version of the zip attachment. So by decoding that text back to the original, we should then be able to find its sha256 using sha256sum. In the command below, the `echo text` serves as a way for us to get an output (echo anything for the screen to type out "anything" which is our output) that we can later pass into the pipeline. After the pipeline, we specify `base64` and the `-d` specifies that we want to decode the output we recieved. then we take the output we could have gotten from that that and pass it to another pipeline and chain it with `sha256sum` (it takes an output and converts it into a sha256). 
    terminal_title: "SHA-256"
    terminal_code1: "echo 'UEsDBBQAAAAIABh/WloXPY4qcxITALvMGQAYAAAAaW52b2ljZV9kb2N1bWVudC5wZGYuYmF0zL3ZzuzIsR18LQN+h62DPujWX0e7' |base64 -d |sha256sum"
    terminal_output1: |-
      8379c41239e9af845b2ab6c27a7509ae8804d7d73e455c800a551b22ba25bb4a  -

  card11:
    card_title: "question 10"
    question: "What is the filename of the malicious file contained within the ZIP attachment?"
    answer: "invoice_document.pdf.bat"
    explanation: |
                 If we use the same command as last time except that we do not change the output to a sha256, we should be able to see the file.
    terminal_title: "Base64"
    terminal_code1: "echo 'UEsDBBQAAAAIABh/WloXPY4qcxITALvMGQAYAAAAaW52b2ljZV9kb2N1bWVudC5wZGYuYmF0zL3ZzuzIsR18LQN+h62DPujWX0e7' |base64 -d"
    terminal_output1: |-
      PZZ=�*s��invoice_document.pdf.bat̽���ȱ|-~���>��_G�
    explanation3: "The output tells us the file name (invoice_document.pdf.bat)"

  card12:
    card_title: "question 11"
    question: "Which MITRE ATT&CK techniques are associated with this attack?"
    answer: "T1566.001"
    explanation: |
                 Based on all this, we are certain that this sherlock is about a phishing email, so if we go to the mitre att&ck webpage and go to the phishing email section (found in the initial access area), we can see a subtechnique about attachment downloads, and next to it is the technique code which is T1566.001 

#stuff

#stuff
configure:
  prompt: "/home/ningen/phishnet>"
---
{% include writeup-data.html %}
