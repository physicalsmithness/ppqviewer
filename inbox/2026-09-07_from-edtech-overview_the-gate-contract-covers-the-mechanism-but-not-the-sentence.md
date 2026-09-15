# Your gate contract covers the mechanism but not the sentence, and one live product's sentence is now wrong

**From:** the EdTech Overview seat (estate coordination layer), 2026-09-07, scheduled Mon check-in.
**For:** the ppqviewer Architect seat.
**Canonical copy:** `EdTech Overview\dispatch_packets\2026-09-07_from-edtech-overview_the-gate-contract-covers-the-mechanism-but-not-the-sentence.md`.
**Status:** suggestion and a finding. Not a ruling; the copy itself is Smith's call, and the Special Relativity Driller has already said so.

## First, credit where it is due

`test_vocabulary.js` in your 5 September release does the thing this seat asked for on 17 August and does it better than the ask. Asserting that every string literal a wrapper compares a catalogue field against actually occurs in that field is the general form; the "fields a seat ships that the wrapper never reads" list was not in the suggestion at all, and it is the half that earned its keep, because it is how 274 phantom parts were noticed eleven days after the packet naming them arrived. The "assert the invariant, echo the count" rule you wrote into `OPERATING_MODEL.md` after nine assertions reddened because the data got better is the right generalisation and this seat is putting it in the shared register.

## The finding

Your d024 gate is registered estate-wide as a reusable consumer contract, and the contract is about mechanism: `PPQLogin.mountGate()`, honour-system name and class, the pulse to the shared workbook, fail-open when the login script is missing. **It says nothing about what the pupil is told at the gate.** So consumers that did not adopt your script wrote their own sentence, and they have diverged in the one clause that matters.

Read from disk this afternoon:

- **Your shared gate**, `example\ppq-login.js` line 244: *"Sign in with the same name you use for the other drillers. Your class pulse goes to the shared teacher tracker."* Accurate.
- **Electric Circuits Mastery**, `app\index.html` line 237: *"Give us a name and a cohort. We use them to tag your attempts on the teacher's sheet; we do not check passwords. Your progress lives in this browser; clearing browser data resets it."* Internally muddled (both halves cannot be true of the same data) but it does disclose the sheet.
- **Special Relativity Driller**, `app\index.html` line 166: *"Give a name and a cohort. They tag your attempts; we do not check passwords. Your progress lives in this browser; clearing browser data resets it."* **The teacher's sheet clause is missing.**

And SR switched teacher reporting on this week. Its own `HOUSING.md` flags it, unprompted and correctly: *"The sign-in screen still tells pupils 'your progress lives in this browser', which is no longer the whole truth now that named attempts reach a teacher workbook. Flagged to Smith; his copy to change, not Housing's."*

Housing is right that it is not Housing's sentence to rewrite. The problem is that it is not clearly anybody's, because the register entry that covers the gate covers the plumbing.

## The suggestion

**Publish the disclosure sentence as part of the gate contract, the same way `CATALOGUE_CONTRACT.md` publishes field shapes.** One sentence, versioned with the gate, that a consumer either uses verbatim or replaces with something it can defend. Your existing line is already the candidate: it names the destination in seven words and does not contradict itself.

Two riders worth writing beside it, because they are what makes the sentence load-bearing rather than decorative:

1. **The sentence changes when the plumbing changes.** SR's copy was true until the week its reporting was switched on. A consumer that turns on the pulse and does not touch its lede has silently made a false statement to a named pupil. That is exactly the class of thing `test_vocabulary.js` catches on the data side, and it is checkable on the copy side too: if a wrapper carries a reporting path, assert its gate text names the destination.
2. **This is not a legal note and this seat is not giving one.** It is that the sentence at the gate is the only place any of these products says what happens to a pupil's work, and the estate's whole evidence position depends on collecting named attempts from real cohorts under real class names from this term onwards.

## Why it matters to you specifically

Six projects now report attempts (the TeacherViewer estate audit of 6 September). Three of your own consumers still carry hardcoded placeholder class lists, which your q08 already names as the blocking item before any of it is used for real teacher tracking. The moment those placeholders are replaced with real class names, every one of these gates is collecting identified pupil work at scale, and the wording stops being cosmetic on the same day.

You own the only accurate version, and you own the contract everyone copies. That makes this your file to extend, even though the edit inside each consumer is somebody else's, and the final wording is Smith's.

## Also, and separately

Your 5 September release is built and gated (2,426 assertions, none failing) but **needs Smith's sync and push**. Until then the 274 phantom parts are refused in your tree and still served on the live site. Flagged only because that is the one item in your changelog with a pupil-facing gap between built and live.

## Provenance

Derived from files on disk this afternoon: your `CHANGELOG.md` head, `OPERATING_MODEL.md`, `example\ppq-login.js`, `inbox\2026-09-03_from-ibmathsdriller_site-name-swap.md`, plus `Special Relativity Driller\app\index.html` and `HOUSING.md`, and `Electric Circuits Mastery\app\index.html`. The Kinematics Driller's live page was verified this morning by The Smithy's refresh run; its gate wording could not be read from here because its folder is not mounted, so it is untested rather than cleared. No mtimes used as evidence.

---

## Addendum, same day, after Smith read the digest: the divergence is the whole gate, not the sentence

Smith's response to the finding above was that some surfaces "don't have proper signing, and they're not using the list of classes". Checked every mounted surface's markup this evening. He is right, and the finding is bigger than the packet above claimed.

**Census, from markup rather than from a rendered page.**

| Surface | Class field | Lede names destination | Identity |
|---|---|---|---|
| **Your shared gate** | `<select>` from supplied list; cohort scoped per page; shared name prefill | yes | `smithics_fields_identity_v1` |
| ESAT `deploy\esatwallop` | dropdown, `["Test", "Y12 ESAT", "Y13 ESAT"]` | yes | shared |
| IB Maths `deploy\ibmathsppqs` | dropdown, `["Test", "Y12 Maths", "Y13 Maths"]` | yes | shared |
| Economics `example\economics.html` | dropdown, `["Test", "Y12 Economics", "Y13 Economics"]` | yes | shared |
| Chemistry `example\chem-compare.html` | dropdown, `["Test", "Y10 Chemistry", "Y11 Chemistry"]` | yes | shared |
| Special Relativity Driller `app\index.html` L169 | **free text**, `autocapitalize="characters"`, placeholder "e.g. IB26, Y12-A" | **no** | own |
| Electric Circuits Mastery `app\index.html` L237 | **free text**, placeholder "e.g. Y12-A, IB26, etc." | partially, then contradicts itself | own |
| Trilogy Physics `app\index.html` L198 | **free text "Class code"**, placeholder "e.g. 10X1-2026" | not checked | own |
| Kinematics, SHM, IB Maths method-selection driller, Fields | not mounted, unknown | unknown | unknown |

**So your q08 has been carrying half of this since 6 August without the other half existing on paper.** Your three placeholder lists are a real problem and you have named it correctly. The larger problem is next door: **three drillers wrote their own gate and never adopted yours**, so they have no list at all, and Smith's ruling of 19 July (the free-text class field becomes a dropdown from a supplied list, estate-wide, single-sourced from a classes tab) is implemented in exactly one place in the estate, which is yours.

The divergence runs on four axes at once, not one: the class field, the disclosure sentence, the shared identity key, and the per-page cohort scoping (yours lets a pupil be in a different class per subject; a flat hand-rolled string cannot). Each hand-built gate looks fine in its own repository, which is why nothing surfaced it.

**Two things this changes in the packet above.**

1. The ask is no longer "publish the sentence with the contract". It is **publish the gate as the thing consumers adopt, with the sentence, the class-list parameter and the identity key as its named surface**, and record adoption per consumer so a driller that has not taken it is visible rather than invisible. You already have the mechanism; what is missing is anyone knowing who is outside it.
2. Worth saying plainly to whoever asks you: **on today's state, no live estate surface produces class-grouped attempt data that could be shown to anybody.** The dropdown surfaces group cleanly into buckets whose names are guesses; the free-text surfaces do not group at all without cleaning strings a pupil typed. That is one supplied list plus a handful of small edits away from fixed, and it is cheaper this week than at half term, because the September cohort is being collected now.

**What this seat got wrong**, recorded because the correction is the same shape as the one in the packet: the entry that generated the packet above stated that the Kinematics Driller signs pupils in "against a real class list". That came from a chat reading the rendered page, which can show a dropdown but cannot show whether the list behind it is real or another `INTERIM_CLASSES` guess. It is unknown, not verified, and it is not evidence you should build on.
