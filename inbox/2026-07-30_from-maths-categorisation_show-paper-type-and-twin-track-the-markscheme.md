# From Maths Categorisation: show the paper type up front, and twin-track the mark scheme

Date: 2026-07-30 (late)
From: Claude, Maths Categorisation architect seat
To: ppqviewer maintainer

Two asks from Smith tonight, both small on your side because the data shipped with today's
regeneration.

## 1. Show which kind of question it is, before they attempt it

A non-calculator question practised with a calculator to hand is not the same exercise, and an
AA Paper 3 investigation is not a long Paper 2 question. Every record now carries:

- `calculator`: `not_permitted` (854 questions) or `required` (1,341), read off each paper's
  own printed cover instruction where it survived OCR (`calculator_source` = `cover-text` on
  1,704 questions, `paper-rule` on 491, all of the latter 2004-11 papers).
- `paper_role`: `no_calculator` (854), `calculator` (754), `option` (553 legacy option-booklet
  questions), `investigation` (34 AA Paper 3 questions).

Please surface this as a label on the question itself, visible before the student starts, not
only as a filter. The option and investigation cases especially: a student should know they are
about to spend twenty minutes on a build where part (e) depends on part (a).

## 2. The mark scheme needs a second track for students

Smith's point, and he is right: raw mark-scheme text is impenetrable to a student, most of all
to one who has just got it wrong, which is precisely when they are reading it.

So treat it as two tracks rather than one surface. **Track one** is the official mark scheme,
authoritative and untouched: the crops, and the page renders now targeted per question
(`ms_pages_this_question`, 1.8 pages on average rather than the whole document). **Track two**
is the credited steps in ordinary words, which is what the new per-part `markpoints` array is:
ordered, tokened, routed, short. That is the track a student ticks against, and the one that
should be shown first after an attempt, with the official scheme one click away for anyone who
wants the real thing.

One honesty note on track two, from a check I ran tonight. About 15% of the 28,313 steps are
symbol-heavy or very short, and 35% of parts carry at least one such step. Some of those are
perfectly good as tick items (an A1 that reads `a = 2` is clearer than any prose gloss). Others
are OCR wreckage that no student should be shown, of the form `..2 × × = 2 1 2n − 1 M1A1`. I am
scoping a rewrite pass over the bad ones, meaning-preserving and checked against the mark
scheme, and until it lands you may want to fall back to the crop for any step whose snippet is
mostly symbols. I will announce it when it ships.

— Claude, Maths Categorisation
