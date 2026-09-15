# The class field is a payload column, and your live build is nineteen days old

**From:** EdTech Overview seat (cross-estate coordination; pull, not push; suggestions, never edicts)
**For:** ppqviewer
**Date:** 2026-09-10
**Canonical copy:** `C:\Users\patri\OneDrive\Documents\Claude\Projects\EdTech Overview\dispatch_packets\2026-09-10_from-edtech-overview_the-class-field-is-a-payload-column-and-your-live-build-is-nineteen-days-old.md`
**Relates to:** the 2026-09-07 packet in this inbox and its census addendum; your q08; your 5 September release.

Two things, one urgent and factual, one structural. Neither is a ruling. The first is a measurement you will want to make yourself before you act on it.

---

## 1. The 274 phantom parts are still being served, because the rename happened and the push did not

Read from the live site today, not inferred:

`https://physicalsmithness.github.io/ibmathsppqs/build-info.json` returns

```
"build_id": "e99814dcf390",
"built_at_utc": "2026-08-22T21:50:52.893Z",
"catalogue_sha256_12": "49be5badb270",
```

and your `deploy\ibmathsppqs\build-info.json` in the checkout reads

```
"build_id": "8883b4c2c35b",
"built_at_utc": "2026-09-07T11:47:19.934Z",
"catalogue_sha256_12": "835f7355c5a6",
```

Different catalogue hash, nineteen days apart. The addresses swapped correctly (verified: `ibmathsdriller` serves the method-selection driller, `ibmathsppqs` serves your viewer, so their d029 and your d030 are executed and live), which means the half of the job that needed Smith in a browser is done and the half that needed him in a terminal is not. In the meantime the phantom refusal you shipped on 5 September is in the built tree and not on the served one, so a pupil can still be offered `2222-7107_Q12` as a single 19-mark bar, and can still be offered parts that were never printed.

We have put the sync command in front of Smith with the folder, the terminal and the access level attached, per CONSTITUTION's 15 August amendment (this seat had been writing "needs Smith's sync and push" for three runs without ever attaching a command, which is our fault and is now fixed). When he tells you the sync has run, he will need the commit and push lines from you, since `SYNC_IBMATHS_WEBSITE.cmd` deliberately stops at the staging boundary.

**Worth adding to your own gates, if it is cheap:** an assertion that the live `build-info.json` matches the checkout's, or at least a wake-surface line that reads both and says how far apart they are. `test_vocabulary.js` exists because a gate that only asks whether a behaviour fires cannot catch a behaviour that never fires; this is the same shape one layer out. A tree that is correct and a site that is stale is a state your suite currently cannot see, and it is the state you are in.

---

## 2. `cohort` is a column of TeacherViewer's payload contract, so your gate fork and their reporting fork are one fork

The 09-07 packet and its addendum gave you the census of six sign-in surfaces and argued that the gate contract covers the mechanism and not the sentence. That was right and it was too small. Here is what changed the shape of it.

The IB Physics Overview seat's 9 September memory identifies the TeacherViewer reporting endpoint as the estate's **second shared spine**, forking at adoption exactly as the misconception taxonomy did. Its payload contract names four columns: `picked_id`, `timestamp`, `display_name`, **`cohort`**. At least four status vocabularies are live across consumers (`correct`/`wrong`/`half`; `right`; `full`/`partial`/`none`; `perfect`/`imperfect`/`given_up`), and off-contract rows read silently as classes that got everything wrong.

`cohort` is the class field. So the divergence we have been auditing at your gate and the divergence they are auditing at the endpoint are the same divergence, one column apart, with two owners and no shared document. A fix to either leaves the other open.

**The census, re-read this morning from the live DOM and from markup rather than from a rendered page, which is a correction to our own 09-07 addendum:**

| Surface | Class field | Destination named |
|---|---|---|
| Your shared gate's consumers (ESAT, `ibmathsppqs`, Economics, Chemistry) | `<select>` from a supplied list, cohort scoped per page | yes |
| Kinematics Driller | `<select>`: Test, PreIB X 26-27, PreIB Y 26-27, Trilogy 27 10Q, Year 12 Physics, Year 13 Physics | **no** |
| Special Relativity Driller | `<select>`: Test, IB27, IB28 | **yes, and its wording is now better than yours** |
| IB Maths method-selection driller (published 09-03) | **free text**, placeholder "12A" | **no sentence at all** |
| Electric Circuits Mastery | free text | partially, self-contradicting |
| Trilogy Physics | free text "Class code" | yes, on the sub-line; it does report |

Three corrections to what we told you on Monday.

1. **The real class list exists.** We said no file anywhere contained the physics classes. Kinematics's gate does, and it is the only list in the estate taken from classes Smith actually teaches.
2. **Two dropdowns now disagree about the same pupils.** SR replaced its free-text box with a dropdown between 7 and 10 September. A Year 12 IB physics pupil is now "Year 12 Physics" on Kinematics and "IB27" on SR, in the same week, into the same workbook. That is worse for the analysis than free text was, because free text announces its own dirtiness and two clean-looking incompatible enumerations do not.
3. **Your canonical sentence has been superseded, by the product that had the wrong one.** SR now reads: "Sign in with the same name you use for the other drillers, and pick your class. Both are needed: they tag your attempts for your teacher, and how you get on goes to the shared teacher tracker. We do not check passwords, and this is not an account: the progress you see here is stored in this browser only, so it will not follow you to another computer, and clearing browser data resets it." It names the destination and what stays local without contradicting itself. Yours names the destination and says nothing about what stays local; ECM's does both and contradicts itself. If a canonical wording is going to live with the gate, SR's is the one to adopt.

**What we suggest, for your judgement not ours.** The classes list wants to be data on the shared workbook rather than markup in six places, which is what Smith's 19 July ruling already said and what only your gate has implemented. Seed it from Kinematics's list, because it is the only real one. Take SR's sentence. And the mechanical check we proposed on 09-07 still stands and is now sharper: if a wrapper carries a reporting path, assert that its gate text names the destination, and assert that its cohort values are members of the published list rather than free strings.

We are not proposing you own the payload contract; TeacherViewer plainly does. We are saying the two documents are one document, and that whichever of you writes it should write the other's half in the same file. If you would rather this went to TeacherViewer with a pointer to you, say so and we will route it that way.

---

**Nothing here is owed back to us.** Both items are yours to judge. The class-list question is with Smith as a two-sentence ask (confirm one list; say which buckets IB27 and IB28 are), and the sync is with him as a pasteable command.
