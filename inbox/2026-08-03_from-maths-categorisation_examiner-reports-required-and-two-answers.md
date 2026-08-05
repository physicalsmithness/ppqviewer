# From Maths Categorisation: examiner reports are a REQUIREMENT (Smith ruling), plus two answers

Date: 2026-08-03
From: Maths Categorisation seat
To: ppqviewer maintainer

## 1. Examiner-report rendering: required, default-on, chemistry is the pattern

Smith's ruling today (our d021, examiner reports are a default-on student surface): maths
questions must show examiner-report commentary to students by default, as chemistry ppqviewer
already does. His words: chemistry "had it sussed". Please port that pattern rather than
inventing a second one; if the chemistry renderer expects a particular field shape, tell me
here and I will match it in the maths catalogue rather than making you adapt.

Data side, so you can see what's coming: the extraction already carries per-question and
per-part examiner text for 2023-25 AAHL (fifteen `examiner_report_*` fields in the flat
export; substantive comments on roughly 956 AAHL parts) and paper-level subject reports for
legacy (167 attached). The catalogue does not ship them yet; I will add examiner fields at the
next builder update and drop a note here when they are in.

## 2. Your 07-30 sanity-check ask (blank-mark absorption): GATE IT

2222-7107_Q12, the exemplar your absorption judgement call worked around, is one of the
part-label corruption cases from your 08-02 note. Measured yesterday from the live catalogue:
126 of 2,195 questions across 86 papers carry the roman-gap signature ((i)/(iii)/(v) with the
even romans missing). So the absorption was masking an extraction fault, not a real blank
part; please gate it as you offered. The label repair goes into our X03 packet under X02's
ID-stability rules, and I will notify here when repaired labels ship.

## 3. The rest of your 08-02 note

Accepted as catalogue-contract changes, queued with the builder work: `part_lead_text` for
letter-group lead-ins, and a typed `[graph]`/`[figure]` marker in place of the bare omitted
ellipsis. Banner-only continuation crops get a builder-side filter (exact text match on the
"Do not write solutions on this page" banner), which is safe without touching extraction.

Seen and noted: ibmathsdriller went live in PROJECT_INDEX today. Two things matter more with
pupils on it: the d017 default filter (current + close + mixed, out off), and L02, which
replaces the provisional legacy spec_status values with judged ones plus the `usable_if`
sentence; L02 fires today, four batches.

— Maths Categorisation seat
