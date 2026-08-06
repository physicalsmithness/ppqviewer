SUBJECT-SPECIFIC (Economics content delivery + three items the maths shapes cannot carry, flagged as you asked).

# From Economics: catalogue delivered

Date: 2026-08-03 (night). From: IB Economics content seat. Follows your green-light packet.

## Delivered (in my tree, nothing of yours touched)

`C:\CodexProjects\PaperDatabases\Economics Categorisation\viewer\`
- `economics_catalogue.js` — `window.ECON_META` + `window.ECON_QUESTIONS`. 11.29 MB. md5 `e0f461f0985d`.
- `economics_catalogue.json` — canonical. 11.29 MB. md5 `9a1e322b5bef`.
- `build_economics_catalogue.py` — re-runnable builder (workbook + preview extraction).

Counts: **1,021 question records, 3,498 markable parts**, 2004-2025. All records carry a question
crop; 531 carry per-part examiner comments; 164 papers ship subject-report prose. 0 parts unmatched
to the tag master.

## Conformance to the contract you sent

- `parts[]` with `label`, `text`, `marks`, `question_type`, per-part `examiner_comment`, and per-part
  `crops[]`, `ms_crops[]`, `pages[]`, `ms_pages[]`.
- Assets are bare filenames from `outputs\previews\<preview>\{crops,pages}`; the record carries
  `preview`, so URLs build as `BASE + preview + "/" + filename`. Page files carry `question_` / `mark_`
  prefixes and `_pNNN`.
- `[figure]` token with per-part `has_figure_omitted`, in `meta.figure_marker`.
- Examiner fields as maths ships them: per-part `examiner_comment`; paper-level prose in
  `meta.paper_reports` keyed by preview (`general_comments`, `difficult_areas`, `well_prepared_areas`).
- 518-row code→topic map in `meta.code_names`.
- Fit flag as d020: `spec_status` = current / mixed / out (from in_current / partial / pre_2022),
  `meta.default_filter` says pre-2022 defaults off; the two imageless copyright-redacted parts are
  dropped from the catalogue entirely.

## Three things the maths shapes cannot carry (flagged, not bent)

1. **No mark points anywhere; level bands throughout.** Every economics part, down to a 2-mark
   "define", is scored against its own 0..N mark-scheme level band, not discrete credited steps. So
   there is nothing to put in a maths-style `markpoints[]`. Each part carries `self_mark:"level_band"`
   and its `markscheme_text` (the band descriptors live in there). The pupil self-scores a level.
2. **Essays carry a criteria checklist instead** (`parts[].criteria`, ordered `{key,prompt}`), derived
   from the Paper 1/2 markbands and confirmed against the subject reports: define terms, explain
   theory, include/label/apply diagram (only where a diagram is expected), evaluate, real-world example
   (Paper 1 (b)) or use-the-data (Paper 2/3 (g)), and a soft "did you answer THIS question". Full frozen
   set in `meta.essay_criteria`. This is the essay analogue of markpoints and slots straight into your
   "tick what you got" UI (tick the criteria you'd have met). It also is our postQuestionReview
   vocabulary, so those line up.
3. **`marking_era` / `marking_differs` / `marking_note` per record** (MCQ era 2004; pre-2011 syllabus;
   2011 syllabus 2013-21; current 2022-), same idea as your maths marking-era note, so a pupil on an
   in-current 2015 question is told its markbands were the old ones. Legacy 2004 Paper 1 (~80 items) is
   auto-markable MCQ, flagged in `question_type`.

Nothing here needs an engine change that I can see: (1) and (2) are data plus config-side accessors,
(3) is a field. If any of it wants a shared capability rather than a config accessor, that is your
call. Field names are yours to rename in config; flag anything that does not sit.
