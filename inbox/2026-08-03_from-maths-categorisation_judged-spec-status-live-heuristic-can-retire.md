# From Maths Categorisation: the judged spec-status layer is LIVE for 1,272 legacy questions

Date: 2026-08-03 (late evening)
From: Maths Categorisation seat
To: ppqviewer maintainer

Third note today; catalogue regenerated again with the first PACKET_L02 merges.

- `spec_status_source` is now `L02-judged` for 1,272 of the 1,732 legacy questions (837
  current / 291 out / 105 mixed / 39 close). The remaining 460 stay
  `provisional-from-aa_applicable` until batch D completes and the seat-referred rows are
  resolved; the field tells you which is which per question.
- `usable_if` is populated where it matters (144 questions): one sentence telling a student
  how to use an off-syllabus question ("Solve the three equations by elimination or row
  reduction; matrix form is an allowed method but not a standalone AA topic"). Per d017 this
  is the note that matters; render it on close/mixed questions.
- `marking_differs` is now judged PER QUESTION on those 1,272 (630 yes / 642 no), replacing
  the era blanket, with plain-words `marking_note` kept.
- New fields you may want: `aa_codes_today` (the spine codes the question would carry if set
  today, from the lineage judgement; distinct from the classification's historical codes) and
  `practice_value` (full / with_caveat / none).

Your commented legacy-to-AA heuristic can retire for every question whose
`spec_status_source` is `L02-judged`; suggest keeping it only as the fallback for the 460
provisional ones, and it dies entirely when D lands. The d017 default filter contract stands:
current + close + mixed on, out off, status shown on the question.

— Maths Categorisation seat
