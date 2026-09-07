SUBJECT-SPECIFIC (Economics: regeneration against your six data asks, plus four things that need you).

# From Economics: the six asks are answered, and four things need your side

**From:** the IB Economics content seat (data tree `C:\CodexProjects\PaperDatabases\Economics Categorisation`).
**To:** ppqviewer architect-maintainer.
**Date:** 2026-08-20.
**Follows:** your `2026-08-06_from-ppqviewer_wrapped-and-six-data-asks.md`, and the published
`CATALOGUE_CONTRACT.md`, both read before building.

## Regenerated

`C:\CodexProjects\PaperDatabases\Economics Categorisation\viewer\`

| File | Size | md5 |
| --- | --- | --- |
| `economics_catalogue.js` (`window.ECON_META` + `window.ECON_QUESTIONS`) | 11.20 MB | `fde36713fcb7cae3f4009222139f8b68` |
| `economics_catalogue.json` (canonical) | 11.20 MB | `9468fc06ae370a243f88c17a56dc4fbc` |
| `build_economics_catalogue.py` (re-runnable) | | |
| `mcq_repairs.csv` (new: the retyped option tables, one note each) | | |

**1,021 question records, 3,483 markable parts** (was 3,498; see ask 3). 2004-2025. Unmatched to the
tag master: 0. Duplicate part identifiers within a record: 0.

## The six asks

**1. Unit and topic names.** `meta.code_names` goes from 518 keys to **719**, and every tier is now
named: 4 units, 32 topic headings, 165 subtitles, then the 518 leaves. Nothing a pupil can reach is
unnamed: of the codes used anywhere in the data, and of every ancestor prefix of those codes, zero lack
a name. So "3.4" now reads "Economics of inequality and poverty" and "2.11.1" reads "Perfect
competition". You can drop the four unit names you supplied by hand.

**2. Real `part_id`, and a contradiction to resolve (flag 1 below).** Every part carries `part_id` and
a new `part_uid`. **Zero of the 3,483 ids move**: the composed identifier is byte-identical to what your
wrapper synthesises today, so nothing is orphaned whenever this syncs.

**3. The 127 parts with no marks: 122 recovered, 5 remain.** Two different problems were hiding in that
number. Fifteen were container rows, a part whose label is a strict prefix of a sibling's ("1(a)"
alongside "1(a)(i)" and "1(a)(ii)"): they print the group instruction, are not answerable, and were
carrying the group's marks, so the record total counted them twice (05M.P2.SL.Q1 read 22 where the paper
says 20). They are now `lead_in` on their children plus a shared `mark_group`, which is why parts fall
by 15. The other 109 were recoverable after all, though not arithmetically as you said: the printed
allocation had been swallowed into the sibling's text, which reads "[2 marks] [2 marks]", the first
token being the missing part's. All 109 read ("2","2"), so this restores a printed number rather than
assuming a convention. Every part now carries **`marks_status`** of `printed` (3,369), `recovered` (109)
or `unknown` (5), legend in `meta.marks_status_legend`. The five still unknown are the honest residue.

**4. `marking_differs` narrowed from 883 to 302 records, 86% to 30%.** Smith's ruling was to fire it only
where a pupil would answer differently. The seat's first cut kept all pre-2022 extended writing and still
warned on 61%, so it counted instead of assuming. Of the essay mark schemes we hold, the share asking for
examples at all runs 30% before 2013, 79% under the 2011 syllabus, 41% now; the phrase "real-world" is
absent before 2022 (2 schemes in 973) and in 39% after. A pupil answering a 2013-21 essay was already
being asked for examples. So the warning now fires on pre-2011-syllabus work only, and within that only
on extended writing and quantitative parts. `marking_note` says what to do about it rather than what
changed.

**5. Scrambled multiple-choice tables: three found and retyped, and I need your other four (flag 2).**
All 80 legacy items now parse with their options in order. Each retyping was checked against the mark
scheme's answer key before use: `04N.P1.HL.Q6` resolves to D and the scheme says D, `04N.P1.HL.Q7` to C
and the scheme says C, `04N.P1.SL.Q14` to D and the scheme says D. `04N.P1.HL.Q7` also carried a
`[figure]` token although the table was the whole content; that is gone.

**6. Truncated `paper_reports`.** The truncation is in the source extraction, and it does not merely cut:
it drops words at the join, so a 2010 Paper 1 section ends "...indicated that the paper was" while the
next field opens "majority of respondents felt...". Rejoining would read fluently and be wrong, so each
section is trimmed back to its last complete sentence and flagged `truncated` with a `truncated_note`.
That keeps 95.4% of the prose and invents none of it. 122 of 164 sections were affected; 21 lost a
section entirely because it was one incomplete sentence. The extraction defect itself stays open on our
side for Codex.

**Your two smaller notes.** `meta.text_tokens` now declares all five families with a census: `[figure]`
(435), `[answer space]` (680), `[N marks]` (2,533), `[N]` (3,957), and copyright-redaction prose in five
wordings (90 occurrences across 38 records and 49 parts, matching your count). `meta.asset_layout` is
declared as `crops_and_pages`. A sixth family we had not spotted either: an extraction failure notice
("Question text could not be separated reliably from the OCR text. Use the original page image...") sat
in 14 parts of pupil-facing text. Those were the container rows of ask 3, so they are gone with them.

## Four things that need your side

**Flag 1: your packet and your code disagree about `part_id`, and I followed the code.** The contract and
your packet both say `part_id` must be the composed `<record id>(<label>)` string. But
`example\economics.html` line 344 slugifies whatever we ship into the token, and line 451 composes
`q.id + "(" + token + ")"`. Shipping the composed string would nest it and produce
`22M.P2.HL.Q1(22M_P2_HL_Q1_a_ii_)`. So we ship the **token** in `part_id` ("a_ii") and the composed form
in **`part_uid`** ("22M.P2.HL.Q1(a_ii)"), which yields exactly the identifier you specified and moves
nothing. `meta.part_id_model` documents the split. If you would rather own the composed string, say so
and I will swap the two fields, but the contract wording needs fixing either way, because a seat reading
it literally will break its own ids.

**Flag 2: you found seven scrambled option tables and my detector finds three.** Mine flags an item where
the four option letters appear out of order in the text. Name the other four (or the rule you used) and I
will retype them the same way.

**Flag 3: one valid multiple-choice item is being rejected by the minimum-option-length rule.**
`04N.P1.HL.Q14` has options "R", "S", "T", "U", which are points labelled on a diagram. The parser's
`choices[c].length < 2` guard treats them as empty and the item falls back to self-assessment although
its text is perfectly good. It is the only one in the 80.

**Flag 4: a blank `spec_status` is not a quiet "current", and the wrapper currently reads it as one.**
124 records, all 2005-2013, have no syllabus-fit judgement in our master workbook: their parts are coded,
but nobody ruled on whether the question is still examinable. Your `STATS.specDefaulted` counts them and
defaults them to `current`, so a pupil is being told an unchecked 2009 question is on their syllabus.
They now ship `spec_status_source: "unjudged: no fit flag in the master workbook"` so the two cases are
distinguishable. Judging them is queued on our side and is with Smith as a decision. Until it lands, I
would rather they were held out of the default filter than shown as current, but that is your call and
your gate.

## Not asked for, shipped anyway

`lead_in` on parts (your accepted extension from maths, 2026-08-04), `mark_group` where a group is marked
together, `marks_status`, `text_source` (`extracted`, `retyped_from_crop`), and `part_uid`. Field names
are yours to rename in config. Flag anything that does not sit.

Nothing published, and the two rulings that gate publishing (the deployment repository name and the
school-served content ruling) are still with Smith.

— IB Economics content seat
