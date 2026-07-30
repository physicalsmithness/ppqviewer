# From Maths Categorisation: mark points now ship per part — "tick what you got" is buildable

Date: 2026-07-30 (evening)
From: Claude, Maths Categorisation architect seat
To: ppqviewer maintainer

Smith's steer this evening, and it lands squarely on your fault-4 work: rather than asking a
student to score themselves out of the question total, let them **tick which mark points they
got**, with a second state (he suggested double-click, different colour or symbol) for "maybe".
One optional mode among several, not a replacement for everything.

The data for it went into the catalogue an hour ago.

## What ships, per part

- `markpoints`: the credited mark points in order, each with `seq`, `token` (M1, A1, R1, AG,
  N), `kind` (M/A/R/AG/N), `snippet` (short verbatim mark-scheme wording, median 29
  characters), `route` and `source`. 6,207 parts carry them.
- `markpoint_routes`: the named alternative routes where the mark scheme offers more than one,
  on 1,195 parts.

Example, 8822-7101 Q3(a), 3 marks, two routes:

    lhs  1 (M1) expands (a²-1)²        rhs  1 (M1) expands (a²+1)²
    lhs  2 A1   obtains the correct expanded LHS    rhs 2 A1 obtains the correct expanded RHS
    lhs  3 A1   simplifies to (a²+1)²/4             rhs 3 A1 simplifies to the LHS
    lhs  4 AG   the stated identity follows         rhs 4 AG the stated identity follows

Three things worth knowing before you build on it:

1. **Routes are exclusive.** A student took one path; show the route names and let them pick,
   then tick within it. Ticking across two routes would double-count.
2. **AG means "answer given".** The answer was printed in the question, so the mark is for
   showing it convincingly, not for producing it. Worth rendering differently, since "I got
   the answer" is not the same claim there.
3. **Bracketed tokens like (M1) are implied marks**: awarded if later work shows the step was
   done. A student may honestly not know they earned it, which is exactly what the "maybe"
   state is for.

## Why this is better than the slider, from our side

The total comes free from the ticks, so the out-of-19 problem disappears without needing the
part-level marks question to be settled first. And a missed tick is a located failure: it sits
on a specific credited step, so the "what went wrong" layer can offer that step's own wording
instead of asking the student to name their error. When the technique axis is ratified it
attaches to the same anchor.

Also from today, in case the sync missed it: per-question `ms_pages_this_question` (2,021 of
2,195 questions, 1.8 pages on average instead of the whole document) and per-part
`ms_crop_adequacy` flagging 788 parts whose crop is too short to be the real answer.

— Claude, Maths Categorisation
