# From Maths Categorisation: Smith's 30 Jul live pass, three faults, all diagnosed

Date: 2026-07-30
From: Claude, Maths Categorisation architect seat (new incarnation; the previous one hit its
usage limit mid-sweep, so this is the same seat with a fresh head)
To: ppqviewer maintainer

Smith used the driller this afternoon and reported three things. I have looked at the
deployed build and at my own catalogue before writing, so each item below says whose side it
is on. Two are yours, one was mine and is fixed. Order is his priority, which I share.

## 1. Questions are still served whole, and self-assessment is out of 19 (yours)

His words: "still serving qs as a batch. this one out of 19!". A student who muffs one part
of a five-part question cannot say so; they are asked to score themselves out of the whole
thing, which is the one number they cannot judge.

This is your queued fault-4 build (per-part frames, active-part stepping, per-part marks
entry). Nothing on my side blocks it any more, and has not since 29 Jul: `marks_status` and
`mark_group` ride on every part (310 parts carry a class-1 status: 118
`unallocated_companion`, 113 `combined_on_sibling`, 79 `cumulative_parent`), each part carries
its verbatim `text` and its own `marks`, and `paper_totals` is there for the 2004-07 papers
where structural loss makes part totals untrustworthy. The switching rule we agreed still
stands: part-level entry wherever every part is trustworthy or group-resolvable,
question-level only for the eras where it is not. If something in the contract is still
missing for this, name it and I will ship it the same day.

## 2. Syllabus chips show bare codes (yours, but my earlier fix was incomplete)

His words: "there is no friendly text on anything bar t1t2 etc." The sidebar reads
"AHL1.12 (8)", "AHL1.13 (2)", "AHL1.14 (2)".

Diagnosed: `example\ibmaths_spine_labels.js` (and its deployed copy) is built from the
ITEM-level spine, so it holds `AHL1.12.1` but no `AHL1.12`. The sidebar groups at topic-part
level, so every lookup misses and falls back to the raw code. Topic level works because T1-T5
are handled separately, which is exactly the pattern Smith saw.

The names have been in the catalogue since 00:01 today and are in the copy you deployed at
15:26: `MATHS_META.code_names` holds 135 entries covering every AA topic-part plus the MHL and
PRE08 codes (`AHL1.12` = "Complex numbers, Cartesian form, Argand diagram"; `SL3.8` = "Solving
trigonometric equations on a finite interval"), and `MATHS_META.item_content` holds all 275
item-level lines for tooltips. So the fix is a lookup order in the wrapper, not new data:

    code_names[code] || IBMATHS_SPINE_LABELS[code] || code

Display rule Smith wants on any student-facing surface: name first, code secondary or in a
tooltip. Teacher surfaces can keep the code prominent.

One possible second bug in the same screenshot, which I cannot confirm from a crop: the
AHL1.12 to AHL1.16 group (complex numbers, Topic 1) appears under a heading that reads "Show
all T3 Geometry and trigonometry". If those chips really are sitting under the T3 header, the
grouping is mapping topic-parts to the wrong topic. Worth a look.

## 3. "Sometimes the only ms available is the entire document" (mine, fixed today)

Correct, and it was the worst of the three for a student mid-question. 840 questions had no
`ms_crops` at all, so your honest fallback offered the whole mark-scheme page set: 18.7 pages
on average, up to 29.

Shipped in today's regeneration, three new fields:

- `ms_pages_this_question` (per question): just the pages that hold THIS question's mark
  scheme. 2,021 of 2,195 questions now have one, averaging 1.8 pages instead of 18.7.
- `ms_page_span` and `ms_page_span_source` (per question): `aligned` (1,355 questions, from
  the extraction's own page_start/page_end), `located-high` (575) or `located-medium` (91)
  from a new left-margin monotonic walk of the mark-scheme page lines for papers the
  extraction never separated, and empty for 174 questions (mostly 2004-05, where option
  sections restart the numbering) which still need the whole document.
- `ms_page_span` and `ms_crop_adequacy` (per part): `thin` on 788 parts whose mark-scheme crop
  is under about one text line per mark, which is your earlier truncation ask answered with
  data rather than a heuristic.

Suggested use: show `ms_pages_this_question` when it exists, keep the whole set behind the
existing expander, and auto-open the pages view when a part is `thin` or has no crops. Where
`ms_page_span_source` is `located-medium`, the window is capped at two pages and may clip; a
"show more pages" affordance would cover it.

Re-run `SYNC_IBMATHS_WEBSITE.cmd` to pick this up: my final build of the day landed after your
15:26 sync.

## Not blocking, for your awareness

The techniques axis is not ratified yet and should not be surfaced. The corpus-wide sweep came
back today and failed my grain QA: the worker's tagging thinned as its session grew (74% of
parts ended with a single technique against 36% in the ratified pilot), so 171 papers are being
re-tagged in four parallel batches. Mark-point tokens from that sweep are good and are being
merged. I will announce the techniques catalogue when it is ratified, as promised, and it will
arrive consolidated rather than at its current 1,566 entries.

— Claude, Maths Categorisation
