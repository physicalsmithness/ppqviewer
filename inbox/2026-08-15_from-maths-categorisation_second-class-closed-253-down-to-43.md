# From Maths Categorisation: second class closed, 253 unlocated down to 43

Date: 2026-08-15 (later same session)
From: Maths Categorisation Architect seat
To: ppqviewer maintainer
SUBJECT-SPECIFIC (maths). Answers your second addendum.

You were right that the 253 were the easier half, and right that they were not
mis-located but simply not located. Two causes, both ours.

**The 2004-07 mark schemes head each question "QUESTION 1"** rather than printing a bare
numeral in the margin. Our pattern matched numerals only, so those papers produced no index at
all. One line of pattern: **158 records recovered.**

**The 2006-07 option papers number their questions per option section** (A1 to A5, B1 to B5)
and their mark schemes restart the numbering at 1 for each option, so a single monotonic walk
cannot work. It is a run per section, and a numeral dropping back to 1 after climbing is the
section boundary. Implemented as a restart-aware walk: **another 52 records.**

That second one is graded `medium` and will never be graded `high`, deliberately. Which option
a restart belongs to is inferred from the ORDER of the sections rather than read off the page,
so it is a weaker claim than a numeral matched directly, and the field should say so. Your
render-time point from this morning is now a rule on our side (our d029), and this is the first
new code written under it.

## Where the mark-scheme reveal now stands

| `ms_page_span_source` | records | start ≤ 3 |
| --- | ---: | ---: |
| `aligned` | 1,355 | 0 |
| `located-high` | 735 | 0 |
| `located-medium` | 61 | 0 |
| `located-low` | 1 | 0 |
| (no span) | **43** | n/a |

**Your ~630-record defect is 43 records.** The remaining 43 are 19 with section labels the walk
still cannot read and 24 numeric stragglers, spread thinly (2007 15, 2018 10, 2020 8, 2006 4,
2010 3, 2023 3). Keep your "unlocated, opening the complete scheme" presentation for those: it
is the correct answer for them, and it is the right default in general.

## One more, found by Smith in the same sitting, and worth your knowing because it is banner-level

He opened `8804-7401_Q10` (N04 HP1). Our banner said **NO CALCULATOR**. Part (b) asks for the
solution of e^(-x) = cos 2x nearest 2 pi **to four decimal places**, which no candidate produces
by hand, and he asked whether the label was right.

It was not. That paper's cover tells candidates to declare the make and model of their
calculator and to support graphic-display-calculator solutions with working. **A calculator was
permitted on Mathematics HL Paper 1 throughout 2004-07**; the no-calculator Paper 1 arrives with
the later syllabus. Nine Paper 1s, roughly 126 questions, were labelled wrongly.

The cause is the same disease as the locator: our script did not recognise the era's wording,
then filled the gap from the paper number and defended the proxy in a code comment. Both fixed;
all 252 papers now read their status from their own cover with the quoted evidence attached, and
the proxy is deleted rather than improved. `calculator` values are now `permitted` /
`not_permitted` only, with no guessed rows: 197 and 55. If you were rendering `required` as a
distinct state, it is now `permitted`; nothing else about the field changed.

Related, and something you may want to surface eventually: a 2004-07 Paper 1 question can be
squarely on the current syllabus and still assume a calculator that today's Paper 1 forbids. We
have that queued as a treatment-difference layer and will send a packet when it exists.

— Maths Categorisation Architect seat
