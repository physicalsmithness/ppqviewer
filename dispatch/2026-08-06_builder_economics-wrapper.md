# Dispatch: IB Economics consumer wrapper

Date: 2026-08-06
From: ppqviewer architect
To: bounded builder chat, `Claude builder (economics)`
Governing: `OPERATING_MODEL.md` (d021, multi-consumer operating model)

The first bounded builder dispatch. Build the IB Economics wrapper and its
test. Nothing else.

## Boundaries, which are the point of this packet

**You may create or edit exactly these two files:**

- `example\economics.html` — the wrapper and config, a single self-contained
  page, modelled closely on `example\ibmaths.html`
- `test\test_economics.js` — its suite, modelled on `test\test_chem.js`

**You may read anything.** In particular read `example\ibmaths.html` (the
reference consumer), `engine\ppqviewer.js` (to use the API, never to change
it), `CATALOGUE_CONTRACT.md`, and the Economics catalogue.

**You may not touch, under any circumstances:** `engine\`, any other file in
`example\`, `tools\`, `deploy\`, `dist\`, or any project record (README,
ROADMAP, DECISIONS, OPEN_QUESTIONS, REGISTRY, CHANGELOG, OPERATING_MODEL,
CATALOGUE_CONTRACT). The Economics data tree at
`C:\CodexProjects\PaperDatabases\Economics Categorisation` is READ ONLY.

**You do not commit and you do not run git.** Return a build note; the
architect runs the gates and commits.

If you find you need an engine change, stop and say so in the build note with
the reason. Do not work around the engine, and do not copy engine code into
the wrapper.

## The data

`C:\CodexProjects\PaperDatabases\Economics Categorisation\viewer\economics_catalogue.js`
exposes `window.ECON_META` and `window.ECON_QUESTIONS`. 1,021 question records,
3,498 parts, 2004 to 2025. Delivered against the catalogue contract; the seat's
delivery packet is `inbox\2026-08-03_from-economics_catalogue-delivered.md`.

Record fields: `id, year, series, time_zone, paper, level, question, marks,
spec_status, spec_status_source, marking_era, marking_differs, marking_note,
primary_code, codes, stem_text, has_omitted_figures, stem_crops, parts,
preview`.

Part fields: `label, text, marks, primary_codes, secondary_codes,
question_type, ao_focus, diagram_type, calculation_type, rwe_required, hl_only,
self_mark, criteria, markscheme_text, examiner_comment, has_figure_omitted,
crops, ms_crops, pages, ms_pages`.

Meta keys: `generated_from, count, levels, years, code_names (518),
paper_reports (164), figure_marker ("[figure]"), spec_status_legend,
default_filter, self_mark_model, essay_criteria, examiner_note`.

Assets live in the corpus at
`C:\CodexProjects\PaperDatabases\outputs\previews\<preview>\` as bare
filenames. Build URLs as `BASE + preview + "/" + filename`, exactly as
`ibmaths.html` does. The teacher preview reads straight from the corpus.

## Config decisions already made, so you do not have to make them

These are architect calls. Follow them; if one looks wrong, say so in the build
note rather than deviating silently.

1. `storageKey: "economics_ppq_v1"`.
2. **Question type routing on `question_type` first**, not `self_mark`:
   `multiple_choice` (80 legacy 2004 Paper 1 items) routes to the engine's
   `mcq` type, auto-marked. Everything else routes to `marksSelfAssess`.
   Note the data sets `self_mark: "level_band"` on all 3,498 parts including
   the MCQ ones, which is why routing must key on `question_type`.
3. **Level bands need no new engine behaviour.** An IB Economics band awards
   marks out of N against descriptors, so the existing marks bar is the right
   widget; the band descriptors are simply what `markschemeOf` returns
   (`markscheme_text`). Do not build a parallel widget.
4. **`structuredPaper` on.** The markable unit is the part
   (d016, part-by-part from chemistry's model). `partLabelOf` from `label`,
   `partMarksOf` from `marks`. This data has no `mark_group` or
   `marks_status`, so every part is its own unit.
5. **Part identity.** The data ships no `part_id`. Synthesise it
   deterministically as `<record id> + "_" + <label>` and put a clear comment
   on the function saying that attempts are keyed on it and it must never
   change. The architect is asking the seat to ship a real `part_id`; when it
   arrives the synthesis becomes a fallback.
6. `markschemeOf` returns the part's `markscheme_text`. `markschemeNoteOf`
   returns `marking_note` where `marking_differs` is `"yes"`, so a pupil on an
   old question is told the markbands were the old ones before they distrust
   the reveal.
7. **Examiner panel default-on**, mirroring the maths shape exactly: the
   part's own `examiner_comment` leads, and `meta.paper_reports[preview]`
   (general comments, difficult areas, well-prepared areas) sits behind a
   closed details block.
8. **Filters:** level (HL/SL), paper (1/2/3), syllabus status, unit or topic
   from `primary_code` rolled up through `meta.code_names`, year, question
   type, AO focus. Syllabus status follows d020 (default to the practisable
   subset): `current` and `mixed` on by default, `out` off, and the status
   shown on the question itself rather than as a chip. The 124 records with an
   empty `spec_status` are treated as current, and you flag the count in the
   build note.
9. **Human names before codes, everywhere.** `meta.code_names` is a 518-row
   code-to-name map; a pupil must never be shown a bare `1.2.1.b`.
10. **Omitted figures:** the `[figure]` token from `meta.figure_marker`, with
    per-part `has_figure_omitted`, rendered as a quiet ellipsis with the crop
    as the authority. The suite must assert the raw token can never reach a
    pupil.
11. **`progressAxes`:** level, paper, unit, year, question type, AO focus,
    syllabus status.
12. **Timing:** the same defaults as `ibmaths.html`. Do not invent new modes.
13. `postQuestionReview` on, with the engine's existing generic taxonomy.

## Explicitly out of scope

- **The essay criteria checklist** (`parts[].criteria`, populated on 1,185
  parts, with the frozen set in `meta.essay_criteria`). It needs the
  tick-what-you-got surface, which is paused into the post-question feedback
  redesign along with the maths mark-point ticking. The architect will build
  both together so economics and maths get one surface, not two. Do not
  approximate it.
- **Publication.** No deploy checkout, no site assembler, no analytics. The
  deployment repository name and the school-served publication ruling both
  need Smith, and the estate web kit's analytics and feedback widget are added
  at publish time.

## What you must return

1. The two files, working.
2. A build note (in your final message, not as a file) covering: what you
   built, anything in the data that surprised you, any config decision above
   that you think is wrong and why, the count of records defaulted to current
   from an empty `spec_status`, and anything you had to leave undone.

## Gates

Your own `test\test_economics.js` must pass, and it must actually exercise the
real catalogue rather than fixtures: mount the engine against
`window.ECON_QUESTIONS`, and assert at minimum the MCQ path auto-marks, the
marks bar sizes to the part, part navigation walks a multi-part Paper 2
question, the syllabus filter defaults correctly, code names render instead of
codes, the `[figure]` token never reaches rendered pupil text, and the examiner
panel shows part commentary with the paper report behind it.

The architect will additionally run the five standing suites
(`test_ppqviewer`, `test_chem`, `test_content_safety`,
`verify_analysis_presentation`, `test_categorisation_integration`) and will not
commit if any regress.

Sandbox note: `require("jsdom")` resolved across the Windows mount exceeds the
shell timeout. Copy `engine/ test/ example/` plus `node_modules` to local disk
and run there; everything else is read by absolute path.

— ppqviewer architect
