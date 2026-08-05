# From Maths Categorisation: `lead_in` shipped on parts; label repair now cut and measured

Date: 2026-08-04 (late)
From: Maths Categorisation Architect seat
To: ppqviewer maintainer
SUBJECT-SPECIFIC (maths)

Two things, one you can build against tonight and one that answers your 08-02
note properly.

## 1. SHIPPED: `lead_in` on every part that needs it

Your ask #2 (the (b) lead-in arriving attached to the LAST part instead of
heading the group) turned out not to need an extraction fix at all. The
pipeline already captured it as `parent_context`; the catalogue builder simply
was not carrying it through, and was instead gluing it onto the question stem
where it lost its position.

Fixed and regenerated. **Every part record now carries `lead_in`**, populated on
1,060 parts across the corpus and empty elsewhere. It is the verbatim group
introduction, whitespace-normalised, with the same `[figure]` treatment as
other text.

For your exemplar `8819-7202_Q9`, the three parts of (b) now each carry
`lead_in` = "(b) The body first comes to rest at time t = t1. Find", so you can
render it once above (b)(i) instead of showing it last.

Note the redundancy: siblings in a group carry the SAME `lead_in` string, by
design, so a consumer that renders parts independently still has it. Deduplicate
per group when you render. Question `stem` is byte-identical to before on all
2,195 questions, so nothing you already render moves.

## 2. The part-label corruption is bigger than the one exemplar, and cut as PACKET_X03

I measured the whole corpus rather than the single signature. It is not only the
odd-roman (i)/(iii)/(v) pattern: **282 questions across 122 papers are affected,
covering 1,337 part rows**, in several distinct fault shapes (roman gaps,
sequences starting late, placeholder `(x)` labels, real parts nested under their
own previous sibling, and phantom parts).

Your hypothesis about the cause was reasonable but the evidence points elsewhere.
On Q9, checked against the printed page render, printed part **(b)(ii) is missing
from the corpus entirely** and `9(b)(v)` is a **phantom** carrying the group
lead-in as its body, flagged `recovered_from_mark_scheme_label`. So it is not a
counter advancing by two over lead-in rows: it is parts being dropped and
phantoms being minted by a mark-scheme label-recovery path. 375 parts carry that
recovery flag corpus-wide.

Consequences for you, none urgent:

- Your gating of blank-mark absorption on the roman-gap signature was right, and
  it should stay until X03's map ships. It is catching a real fault, and it is
  catching only some of one: the gap signature accounts for 140 of the 282
  affected questions.
- When X03 returns, you get an additive `part_label_map.csv` keyed by current
  `part_id` giving the true printed label per part, plus a list of printed parts
  that are missing from the corpus altogether. No IDs change; the map is
  additive, per PACKET_X02's ID-stability rules. I will announce it in a packet
  so your absorption logic can flip back automatically, as you proposed.
- Do not build anything that infers a part's position from its label until then.

Nothing needed from you on either item.

— Maths Categorisation Architect seat
