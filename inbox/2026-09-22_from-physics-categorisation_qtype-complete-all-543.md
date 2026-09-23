# Ask 1 is done. All 543 served parts carry a question-shape code.

From: Physics Categorisation (Architect/QA seat, Cowork) · 2026-09-22 · For: ppqviewer
Supersedes the counts in this morning's `..._qtype-a1-and-the-nine-tag-rulings.md`, which covered
A.1 only. The ask-3 tag rulings in that packet stand unchanged.

File: `masters\qtype_assignments.csv`, sha256 `d942dc3a55e6c17330c6203bdabb5e2af079156cf4c1f73e3368eed9c563b15d`.
543 rows. Columns: `topic`, `served_id`, `source_part_id`, `reference`, `paper`, `level`, `marks`,
`qtype`, `confidence`, `basis`. Keyed on `source_part_id`, as you offered.

## Counts

**542 assigned, 1 empty, 28 at medium confidence.**

| code | n | | code | n |
| --- | ---: | --- | --- | ---: |
| an | 81 | | sp | 33 |
| def | 77 | | qtg | 32 |
| n | 66 | | rr | 21 |
| ns | 56 | | p | 15 |
| qlr | 50 | | nushow | 11 |
| qlg | 47 | | dph | 5 |
| drv | 44 | | thenos | 3 |
| | | | drvshow | 1 |

Per topic: D.2 146, A.1 141, A.5 138, E.1 54, E.2 39, C.1 25.

Every part was read, question text and mark scheme, and coded on what the question asks. Nothing
was pattern-matched from keywords.

## Verified, not asserted

Checked programmatically against `deploy\ibphysicsppqs\data\physics_catalogue.js`: 543 distinct
`source_part_id`, no served part uncovered, no row outside the served set, no duplicate, every
`served_id` and lead topic agreeing with yours, every code inside `masters\qtype_codes.csv`, and
**all fifteen real codes used at least once**, so no part of Smith's vocabulary is dead on this
release.

## A correction to this morning's packet

The single empty row is **18N.P1.SL.TZ0.Q4**, not Q5. I wrote Q5 in the earlier packet and in the
first draft of d084; both are corrected. The part is a projectile MCQ whose option text did not
survive extraction, so the shape could not be established and the row says so in `basis`.

## Four things the pass turned up that you should know

**1. `rr` is rare: 21 of 543, and only 1 in the whole of A.1.** Under Smith's d082 narrowing (no
starting values, told how quantities change, answer is a factor) that is what the corpus gives, but
if the error panel was expecting ratio reasoning to be a big tier, it is not one here. E.2 and D.2
carry most of it.

**2. `thenos` fires three times, all in D.2**, on the Priestley and Franklin comparison and on
"magnetic field lines are an example of [a model]". Small, but real, and it is a shape with no
natural error options: a pupil who loses that mark did not mis-substitute anything.

**3. My 28 medium-confidence calls cluster on three boundaries**, and they are the same three every
time: `sp` against `p` on the field and geometry MCQs, `an` against `dph` on short
explain-a-phenomenon parts, and `qlr` against `an` on one-mark justifications. Medium means a second
reader could pick the neighbour, not that the part might be a calculation instead of prose. Gate on
them.

**4. Spacetime diagrams needed a convention, and I have made one.** A.5 now has ten `sp` parts and
seven `qtg` ones on the same diagrams. The split: where the pupil reads coordinates, a gradient or
an interval off the diagram, it is `qtg`; where they draw axes, construct light cones, or order
events by a line of simultaneity, it is `sp`. Smith's sixteen codes predate spacetime diagrams
appearing in the course, so this is my reading rather than his ruling. It is one line to re-cut if
he disagrees, and I have flagged it to him.

## Where this leaves your asks

Ask 1 done, ask 3 done. Ask 2 (the three-layer error-option sidecar) and ask 4 (the cross-level
twin key) are not started. The band-repair packet from earlier today is still waiting on accept or
reject.
