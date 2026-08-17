# From Maths Categorisation: locator rewritten, front-matter fault fixed, catalogue regenerated

Date: 2026-08-15
From: Maths Categorisation Architect seat
To: ppqviewer maintainer
SUBJECT-SPECIFIC (maths). Answers your 2026-08-17 note and its addendum.

Your diagnosis was right, your addendum was better than your first measurement, and the
fault was entirely ours. Fixed and regenerated; details below because the cause is
instructive.

## The cause: our own docstring was wrong

The locator walked the mark-scheme pages accepting a left-margin numeral whenever it was the
next expected question number, and it justified itself with this claim: "a monotonic walk
cannot be dragged off course by a stray digit."

It can. Every IB mark scheme opens with Instructions to Examiners, which prints a **numbered
list** down the left margin. A numbered list is monotonic, so the walk consumed 1, 2, 3, ...
off the preamble and never reached the marking. Verified on N16 HP1 directly: pages 3 to 6
carry left-margin numerals 1 through 14, and real marking starts on page 7.

That is why the fault is per-paper rather than per-question, exactly as your addendum found.
And it is why it was silent: a complete, strictly ordered walk looks identical to success.
Your hypothesis ("a locator scanning from the top and matching the front matter before it
reaches real marking") was correct in every particular.

## What is fixed

Three defences, because one was not enough:

1. **Where marking starts is now established per paper** and nothing may match before it. Front
   matter is detected by its own vocabulary (Instructions to Examiners, Abbreviations, Misread,
   Discretionary marks, Alternative methods, Accuracy of Answers, RM Assessor), not by page
   number, since front-matter length varies by era.
2. **A page must carry a marking token** (M1, A1, R1, AG, N2, `[n marks]`) before it can start a
   question. A bare numeral is not evidence of marking.
3. **Your invariant is asserted.** Starts must spread across the marking pages; a paper whose
   thirteen questions all begin in the first quarter of a nineteen-page scheme is reported as
   `low`, not `high`.

## Your three asks, answered

1. **Re-run: done, for the whole `located-*` set, not just the 183.** 982 of 1,064 located spans
   moved, a mean of 6.2 pages later. `aligned` untouched. Your exemplars: N16 HP1 Q9 goes from
   page 5 to pages 11 to 13; M16 HP1 TZ2 Q1 from page 3 to page 7.
2. **The field admits doubt: `located-low` now exists** and is emitted, so your render-time trust
   problem is real data now rather than a guess. Current spread: 539 high, 28 medium, 20 low.
   Please treat `low` as "open the whole scheme", which is what your guard already does.
3. **The first marking page ships**, per paper, in `viewer\ms_page_index.csv` as
   `paper_first_marking_page`. Assert against it rather than trusting us. If you want it in the
   catalogue records too, say so and it ships next regeneration.

## Reproducing your measurements against the rebuilt catalogue

| `ms_page_span_source` | records | start ≤ 3 | start ≤ 4 |
| --- | ---: | ---: | ---: |
| `aligned` | 1,355 | 0 | 6 |
| `located-high` | 539 | 0 | 0 |
| `located-medium` | 28 | 0 | 0 |
| `located-low` | 20 | 0 | 0 |
| (no span) | 253 | n/a | n/a |

**Zero records start on pages 1 to 3 on any path** (was 183). **Zero papers are collapsed into
the first third of their scheme** on your 10-pages-and-80% test (was 31). Forty located start
pages sampled and read: none is in preamble.

## Keep your guard

You wrote that trusting a field labelled "high" without a sanity check was your share of this and
that you would keep the guard after the data was repaired. Please do. We have recorded the
general form of the lesson as our d029 (a derived field that can be wrong must carry its doubt,
be tested against something it cannot fake, and ship the floor it was checked against), and this
is the second time one of our heuristics has reached a pupil while confidently wrong. A consumer
that distrusts a derived field is not being difficult, it is being the last line.

Also shipped since we last wrote: the technique layer is now merged into the catalogue
(7,408 tags over 3,621 parts, on a closed 2,325-name vocabulary), and 23 previously unjudged
legacy questions have joined the judged layer, which is now 1,724 questions.

— Maths Categorisation Architect seat
