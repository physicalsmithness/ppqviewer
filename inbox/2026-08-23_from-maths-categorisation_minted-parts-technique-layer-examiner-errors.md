# From Maths Categorisation: 76 papers gain missing questions; technique and examiner layers land

Date: 2026-08-23
From: Maths Categorisation Architect seat
To: ppqviewer maintainer
SUBJECT-SPECIFIC (maths). Regenerate when convenient; nothing here breaks an existing field.

Three things landed together. The first changes what a pupil can see.

## 1. 254 missing parts are minted, on 76 papers

The parts the extraction never captured are verified against the printed page renders and now
ship as ordinary parts. They carry **`origin: "minted"`** and **`origin_evidence`** (the page
they were read from), so you can style or caveat them if you want to, though I would not: they
are the printed question and the rest of the record is the one that was wrong.

Your own exemplar now reads correctly end to end for the first time. `8819-7202_Q9` shows
(a)(i), (a)(ii), (b)(i), **(b)(ii) "the distance travelled between t = 0 and t = t₁"** (minted),
(b)(iii), the (b)(v) phantom flagged as before, and (c).

**Two things to expect:**

- **Part counts rise on 76 papers.** Not a regression.
- **15 minted labels are section-qualified**, of the form `B1(a)` rather than `1(a)`. That is
  not decoration. The 2006-07 option papers restart their question numbering per section, so
  "1(a)" genuinely exists twice on the same paper and our unqualified labels cannot tell them
  apart. Where a minted part collided with an existing one I resolved the section from the page
  it was verified on. If you sort or key on part label, be aware that a leading `A` or `B` on
  those papers is a section, not a part letter.

Minted parts carry no crops, no mark points and no mark-scheme span, because none exists for
them upstream. `text_source` is `page_render`.

## 2. The technique layer is complete

`techniques` on a part is now populated across the whole corpus rather than a pilot slice:
**13,602 tags over 6,262 parts on all 252 papers**, 2.17 per part, on a closed vocabulary of
2,353 named moves. 96.7% of parts that have mark-point evidence are tagged; the remainder are
recorded as thin with a reason rather than left silently empty.

Nothing is required of you. It matters because it is the operand for the "where you went wrong"
work: a dropped mark can now be spoken about as a named move rather than as a mark number.

## 3. New: observed candidate errors, from the examiners

Not yet in the catalogue, and I want your view on the shape before I put it there.

We have mined the IB subject reports into **2,836 observed errors across 1,131 questions**, on a
vocabulary of **105 error kinds**, 80 of which recur across three or more syllabus topics. Each
row carries the error in plain words, the examiner's own quote as evidence, the part it belongs
to where the examiner says so, and whether the comment was about the question or the paper.

This is the first thing in the project built from what happened to candidates rather than from
what the paper asks. The obvious pupil-facing use is on the reveal, next to the examiner comment
you already render: not "here is a paragraph about how the cohort did" but "the two things
candidates got wrong here were X and Y". The obvious analytic use is crossing error kind with
technique.

**Question for you: what shape do you want it in?** Options as I see them: a per-question array
of `{error_kind, statement, quote}`; or a flatter `common_errors` list of statements only; or
nothing on the record and a separate lookup keyed by question id. Tell me which fits the engine
and I will ship that rather than guess.

## Also since the last note

`spec_status` sentences now respect part dependencies: a pupil is never told to skip a part whose
answer a later part needs, and where the dead material comes first the sentence hands over the
result instead. 187 questions carry one.

— Maths Categorisation Architect seat
