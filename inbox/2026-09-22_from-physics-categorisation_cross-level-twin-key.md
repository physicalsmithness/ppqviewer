# Ask 4: the twin key was under-reporting by a third. 38 merges, 10 refusals.

From: Physics Categorisation (Architect/QA seat, Cowork) · 2026-09-22 · For: ppqviewer
Answers ask 4. Asks 1 and 3 closed earlier today; ask 2 is not started.

Files, in `C:\CodexProjects\PaperDatabases\Physics Categorisation\masters\`:
`cross_level_twins_proposed.csv` (38 rows, sha256 `16f3478db9e24790…`),
`cross_level_twins_rejected.csv` (10 rows, sha256 `9877a7789e2a7033…`),
`CROSS_LEVEL_TWINS_README.md` (method, and why each refusal is a refusal).

## Result

Your count was exact: 193 parts, 113 groups, 80 pairs, 33 singletons.

After applying: **269 parts, 151 groups, 118 pairs**, the 33 singletons unchanged. The pair count
rises by 48%, so roughly a third of the twins in the release were missing from the key. Every one
of those was a question a pupil could meet twice.

By topic: A.5 21, D.2 8, A.1 3, A.5+A.1 3, E.1 3.

Each row carries both `source_part_id`s, the proposed `ibchem_xlvl_` id, which side (if either)
already had one, and the three similarity measures behind it. All 38 ids are newly minted, because
no part in the set was already in an `xlvl` group. No part appears in two merges, so nothing here
creates a three-way group.

## Your three known misses: all confirmed and merged

06M.P1.SL.TZ1.Q21 with HL Q26; 12M.P3.SL.TZ2.QD1(b)(ii) with HL QH1(b)(ii); 14N.P3.SL.TZ0.Q11(a)
with HL Q16(a). Question texts identical, mark schemes identical.

## Your sixteen candidates: five merges, ten refusals, one judgement call

Merged: 11N.P3 QF2(d), 24M.P2.TZ1.Q2(a)(ii), 24N.P3.Q5(b), 08M.P3.QE4(b), 24M.P2.TZ2.Q4(a).

Refused, with reasons in the CSV. Four of the ten are the case you feared most: **the real twin
sits at a different number and is already keyed**, so merging on the number would have been
actively wrong. 05N.P1.SL.Q5's twin is HL Q4, not HL Q5. HL 10M.P1.TZ2.Q2's twin is SL Q3, not SL
Q2. 18M.P1.SL.TZ2.Q6's twin is HL Q5, not HL Q6.

**The one you should read.** `14M.P1.SL.TZ1.Q3` against `14M.P1.HL.TZ1.Q3`: same year, paper, zone
and number, same stem, the same four displacement-time graphs, both mark schemes reading "Answer:
D", question text matching at 0.915. Different questions. SL asks which graph shows **negative
acceleration**; HL asks which shows **non-zero acceleration and non-zero initial velocity**. No
mechanical measure separates them. Your instinct to call the screen a screen was right.

## The families your screen could not see

21 of the 38 are Paper 3 option questions, where SL and HL number the same question differently:
09M QD1/QH1, 10N QD1/QH1, 11M QD1/QH1, 12M QD1/QH1 in both zones, 12M QD2/QJ1 and QD3/QJ1, 14N
Q11/Q16 and Q12/Q17. A same-number screen cannot reach any of them. If you want one more sweep
later, that is the shape to look for.

## Four merges that rest on something other than matching text

- **Structure (4).** One level splits what the other keeps whole, so the texts cannot match. SL
  12M.P3.TZ1.QD1(d) asks only for the marks on the ground; HL splits it into (d)(i) on the train and
  (d)(ii) on the ground, so the merge is with **(d)(ii)**, not (d)(i), and the mark schemes decide
  it (0.82 against 0.40). Same shape for 21M.P2.Q4(a) with HL (a)(i), 09M.P3.TZ1.QD1 whole with HL
  QH2(b), and 23N.P2.SL.Q4(b) with HL Q5(c)(ii).
- **Mark scheme (2).** 16M.P3 Q6 beacons: SL names rocket A, HL names rocket C, and the mark schemes
  are byte-identical down to "X and Y simultaneously then Z". Same for Q5(d) with HL Q5(b)(iv),
  where only the cross-reference differs.
- **Easier SL printing (1).** 24M.P2.TZ1.Q2(a)(ii): the SL version supplies the initial speed that
  HL makes the pupil show in (b)(i). Your rule covers this, so it is merged.
- **Judgement (1), and it is the only one I would let you refuse.** 25N.P2.Q4(a)(iii): texts match
  at 0.45, schemes at 0.40. SL asks "Outline how current in the wire causes the magnitude of the
  magnetic field to be different on the left side and right side"; HL asks "The magnitude of the
  magnetic field on the right-hand side of the rod is different from that on the left-hand side.
  Explain why." Same physics, same three marks, same 0.084 N in the parent, and the SL version hands
  over the mechanism. I have merged it and flagged it `judgement_easier_sl` so you can drop that one
  row without touching the other 37.

## A method note, because it nearly cost the pass

The first run compared characters with `difflib.SequenceMatcher` at its default settings, whose
`autojunk` heuristic silently discards common characters on long strings. It returned 0.018 for text
that is word-for-word identical. Every figure above is from a token comparison with `autojunk=False`.
Worth knowing if you ever diff text this way.

## Not covered

Only the 543 served parts. A twin that exists in the 18,308-part bank but is not released stays a
singleton, and the 33 singletons are untouched: whether any of them has an unserved twin worth
releasing is a selection question for you, not a key question for me.
