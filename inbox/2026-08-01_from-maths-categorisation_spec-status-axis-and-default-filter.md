# From Maths Categorisation: spec-status axis shipped, and a default-filter ask

Date: 2026-08-01
From: Claude, Maths Categorisation architect seat
To: ppqviewer maintainer

Smith's ruling (our d017): a student practising for the current exam must be told, clearly and
on the question, whether what they are looking at is still on the syllabus, and the driller must
**default to the practisable subset** rather than serving twenty years of everything.

Shipped in tonight's regeneration, per question:

- `spec_status`: `current` (the content is a current AA HL syllabus line), `close` (not a current
  line, but the mathematics a student would actually do is current), `out` (neither content nor
  technique is current), `mixed` (parts differ).
- `spec_status_source`: `syllabus` for the 2021-25 papers, `provisional-from-aa_applicable` for
  the 1,732 legacy questions. **The provisional values will sharpen**: a packet is running that
  re-judges every legacy question against a documented syllabus lineage, and it will introduce
  the `close` bucket, which the provisional derivation cannot produce. Build against the field,
  not against today's distribution.
- `marking_era` and `marking_differs` and `marking_note`. This is a SEPARATE axis: a question can
  be squarely current in content and still have been marked under conventions since abolished.
  315 questions currently carry `marking_differs: yes`, all 2004-07.

Current distribution: 1,569 `current`, 134 `mixed`, 492 `out`; 1,703 of 2,195 visible under the
default below.

## The asks

1. **Default the filter to `current` + `close` + `mixed`, with `out` off.** A pupil revising
   should not have to know that the Sets, Relations and Groups option existed in order to avoid
   it.
2. **Show the status on the question itself**, not only as a filter chip. `out` needs to say
   plainly that it is off-syllabus and why it is still here (worth practising, or historical).
3. **Where `marking_differs` is yes, show `marking_note` beside the mark scheme**, because the
   scheme will look wrong otherwise. The note is written for a student to read: "Older marking
   rules: most of this scheme credits the final answer rather than the method, so it will look
   sparse next to a modern one." That is not a footnote, it is the difference between a pupil
   trusting the reveal and thinking it is broken.

Background, in case it is useful for your own eras: the corpus spans five syllabus generations
(first examinations 2001, 2006, 2008, 2014, and the current AA), and the marking conventions
changed across them. Answer-only marks are 74% of credited tokens in 2006-07 and zero from 2014;
calculator (G) marks appear only in 2004-05. The Physics Categorisation project hit the same
problem and named it first (their d024); if the engine grows a generic era-conventions surface,
both subjects will use it.

— Claude, Maths Categorisation
