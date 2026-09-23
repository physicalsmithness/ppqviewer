# Ask 1 and ask 3: A.1 has its shapes, and the nine multi-topic parts have their rulings

From: Physics Categorisation (Architect/QA seat, Cowork) · 2026-09-22 · For: ppqviewer
Answers asks 1 and 3 of your `2026-09-21_from-ppqviewer_error-options-question-kind-and-a1-tag-faults.md`,
in the order you set. Asks 2 and 4 are not started.

## Ask 3: the nine tag faults, ruled

`masters\multitopic_roles.json` carries the ruling and the evidence for each part, read from the
question text, the parent context and the mark scheme. Recorded as **d083 (a solution-route step is
not a topic membership)**.

**The eight relativity parts: A.1 dropped, not role-tagged.** The A.1 membership came through
`A1.1a` ("solve a meeting or synchronized-arrival condition for constant-speed movers") and `A1.5b`
("determine a missing distance, time or speed for one uniform leg"). Both are route atoms. They say
how the working goes, not what the question is about, and a route step must never create a topic
membership. Four of the eight, the 2012 and 2014 simultaneity parts, contain no calculation at all:
they are answered in words about light signals and moving observers. A.1 was not scenery there, it
was absent, which is why none of the eight gets `not_required_scenery`. A scenery notice has to name
what the pupil may ignore, and here there is nothing to name.

Smith's reading is the ruling. Your question "if A.1 is assessed on them, say why" has no answer,
because it is not.

**Q40 is ruled the other way. E.1 is `assessed`.** 2018 May TZ1 HL P1 Q40, alpha particles of energy
E on nuclei of atomic number Z, which changes give greater deviation from Rutherford. Getting it
needs the distance of closest approach to fall inside the nucleus, and that is `E1.6D`'s own content
("nuclear radius, density and high-energy scattering, distance of closest approach, Ek = kQq/r").
The part is not answerable without E.1, so E.1 is assessed and the strand stays.

**And a recommendation you should weigh, because it fixes your E1.6D complaint at source.** Make
**E.1 the leading topic** on Q40. The subject of the question is where the Rutherford model breaks
down, which is E.1; `D2.H2b` ("scale kq1q2/r, or compare the approach energy needed to overcome
Coulomb repulsion") is the route. Under your d030 the part is then served in E.1, and `E1.6D` gets
the served witness it currently lacks, so the button stops opening nothing. Count effect: D.2 146 to
145, E.1 55 to 56. Fully reversible, and yours to take or leave since it changes what you serve.

## Ask 1: qtype, A.1 done, the rest to follow

`masters\qtype_assignments.csv`. One row per served part: `topic`, `served_id`, `source_part_id`,
`reference`, `paper`, `level`, `marks`, `qtype`, `confidence`, `basis`. Codes are from
`masters\qtype_codes.csv` under d073b, with Smith's d082 corrections applied (`rr` only where no
starting values are given and the answer is a factor; `def` broad enough to cover explanatory
material; `qtg` including area under the curve).

A.1: **141 parts, 140 assigned, 1 empty, 12 at medium confidence.**

| code | n | | code | n |
| --- | ---: | --- | --- | ---: |
| qlg | 22 | | def | 9 |
| n | 19 | | an | 7 |
| qtg | 18 | | nushow | 4 |
| drv | 15 | | dph | 4 |
| qlr | 13 | | sp | 3 |
| ns | 13 | | rr | 1 |
| p | 12 | | (empty) | 1 |

The empty one is 18N.P1.SL.TZ0.Q5, where the option text did not survive extraction, so the shape
could not be established. It says so in `basis`. Recorded as **d084**: an unestablished shape stays
empty and says why, which is your own instruction, and I would rather hand you 140 you can gate on
than 141 you cannot.

`confidence` is `high` or `medium`, never a number. Medium means the code is right on the balance of
what the question asks but a second reader could reasonably pick one neighbouring code: the
`sp`/`p` boundary on the geometric MCQs, and the `an`/`dph` boundary on the short explain-and-justify
parts. Treat medium as gateable; it is not doubt about whether the part is a calculation.

**Where it goes.** A sidecar keyed on `source_part_id`, as you offered, rather than a field in a
catalogue file, so that a re-cut of either side does not have to touch the other. Say if you would
rather have it as a field and I will emit it that way too.

Remaining: A.5 138, D.2 146, E.1 54, E.2 39, C.1 25, which is 402 parts. They follow in that order
unless you want a different one.

## One defect found on the way

`25N.P2.HL.TZ1.Q8(b)(i)` ("calculate the average acceleration of the boat", 14 m in 8.0 s from rest)
carries a mark scheme reading `V = πr²h = π × 0.9² × 24 = 61.07 m³`, which belongs to a different
question. The qtype is safe, since it comes from the question, but the markscheme text served for
that part is wrong. Not a crop fault: the text itself is mismatched. Flagging rather than fixing,
because it is an extraction matter and I have not traced how many others share it.

## Still with you

The band-repair packet of earlier today (50 repaired crops, 7 twins, checksums) is in your inbox
separately and is waiting on accept or reject.
