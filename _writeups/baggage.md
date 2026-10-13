---
title: "Baggage"
summary: "Reconstruct post-compromise activity from KAPE-collected Windows registry artifacts and Shellbags evidence."
image: "/assets/images/writeups/baggage.png" # optional path, e.g. 
image_alt: ""
category: "DFIR"
difficulty: "Very Easy"
platform: "HTB"
os: "Windows"
reading_time: 10
---

## 01 / Scenario

A production workstation, identified as `PROD-WORKSTATION`, was reported compromised. The supplied scenario says the attacker took over the `admin` account, used it to browse the local user `steve`'s profile, searched for sensitive files, accessed network shares, and staged data for exfiltration.

The investigation prompt asks the analyst to reconstruct post-compromise activity from KAPE-collected registry hives, with Windows Explorer Shellbags used as a persistent record of folder navigation.

> **Scope note:** The supplied reference contains the scenario and a partial evidence overview, but not the completed findings or the full command transcript. This page records the source-provided context only; add verified findings from the original investigation before presenting it as a complete case report.

## 02 / Evidence overview

The reference identifies a KAPE collection named `Baggage.zip`, with the password `hacktheblue`. It describes registry hives from two user profiles and the system default profile.

The visible file-tree excerpt includes:

- `ConsoleLog.txt` — KAPE execution log.
- `CopyLog.csv` — file-copy manifest with hashes.
- A `C/Users/` tree containing profile directories.

The full file tree and the contents of those artifacts were not included in the supplied material, so no additional filenames or artifact values are asserted here.

## 03 / Investigation workflow

A defensible reconstruction should keep evidence and interpretation separate:

1. Preserve the original archive and record its hash before analysis.
2. Review the collection log and copy manifest to confirm what was collected and whether any copy errors were reported.
3. Identify the relevant user and system registry hives, maintaining the source path and profile association for each artifact.
4. Examine Shellbags records for evidence of folder navigation, then correlate those records with other available timestamps and artifacts.
5. Build a timeline that distinguishes observed activity from hypotheses. A Shellbags entry can support that a folder was navigated, but by itself does not prove that a file was opened or exfiltrated.

These are general forensic steps, not claimed results from the missing evidence.

## 04 / Findings

**Pending source notes.** The reference describes the suspected account takeover and the artifacts provided for investigation, but it does not show the recovered folder paths, timestamps, or final timeline. Insert the validated observations here, with each statement tied to a specific artifact.

A useful finding format is:

- **Observation:** the exact artifact value and its source.
- **Interpretation:** what that value supports, with uncertainty stated explicitly.
- **Corroboration:** the second artifact or log that strengthens the interpretation.

## 05 / Conclusion

The available source establishes the investigative objective: use collected registry evidence, particularly Shellbags, to reconstruct post-compromise navigation. The final conclusion should be added after the artifacts have been examined and independently correlated.
