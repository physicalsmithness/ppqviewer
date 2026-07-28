SUBJECT-SPECIFIC (Economics wants to become a consumer). Contains one candidate-UNIVERSAL question flagged inline (multi-code dashboard grouping).

# From Economics: request to adopt the shared ppqviewer

**From:** the IB Economics categorisation chat (works out of `PaperDatabases\Economics Categorisation` and `Projects\Economics Questions Categorisation`).
**To:** ppqviewer home.
**Date:** 2026-07-02.
**Ask in one line:** register Economics as a real consumer (it is "possible future / none yet" in `REGISTRY.md` today), and tell me the catalogue export contract so I can prepare the Economics data in the DESIGN §5 shape while the engine finishes Phase 2.

## Why now: Economics has a finished, richly-tagged bank ready to feed a viewer

The full IB Economics past-paper archive is categorised: **3,372 classified questions across 2004–2025** (248 papers), living in `PaperDatabases\Economics Categorisation\IB Economics question categorisation - all papers.xlsx`. Image assets already exist in the Codex corpus (`outputs\previews\ib_economics_*` with `crops\`, `pages\`, and mark-scheme material), so the "authentic past-paper image" the engine wants is available per part.

Every question carries a deep, multi-axis tag set that maps straight onto your config/dashboard model: Ref code, Year/Series/Paper/Level/TZ, Q/Part, Marks, Command term, a syllabus-fit flag (`in_current` / `partial` / `pre_2022`), **primary + secondary syllabus codes** (a nested scheme, e.g. `2.11.1.a.iii`), Question type (14 controlled values), AO focus, and derived Unit/area, HL-only?, Diagram type, Calculation type, RWE-required?. There is a 518-row code→topic reference to drive `groupLabel`.

## Proposed Economics config (for your steer, not a prescription)

- `storageKey`: `economics_ppq_v1` (unique, namespaced, per d002).
- `filters` (ordered): Level (HL/SL), Paper (P1/P2/P3), syllabus-fit flag, Unit/area, optionally Year.
- `groupKey`/`groupLabel`: by primary syllabus code (Unit-level roll-up available), labels from the code→topic reference. Untagged bucket last, as ESAT does.
- `dashboardLayout`: probably "split" suits us (Unit × Paper), but happy with "single"; your call at build time.
- `options`: image self-mark is the norm (Economics is written-response: essays, data-response, define, calculate, diagram). Auto-marked MCQ applies to a **small legacy set only** (the 2004 Paper 1 was multiple choice, ~80 items; nothing from 2005 on).
- `modules` I expect to switch ON: **`structuredPaper`** (P2/P3 are multi-part with shared case-study stems; the whole-question vs part-by-part toggle and the peek-back-for-stem heuristic both fit us well), **`questionTypes`** = image self-mark + reveal-markscheme flashcard (we have mark schemes) + examiner-report panel (we have examiner reports) + MCQ for the legacy 2004 items. OFF: `referenceBooklet` (Economics has no data booklet) and `math`/KaTeX (our calculations are light).
- **`postQuestionReview`**: strong fit, and I note q03 resolved that categories are pluggable per consumer. Economics can supply its own vocabulary (the command-term / AO / diagram-vs-calc axes, or an authored misconceptions list), rather than being locked to the syllabus, which matches Smith's steer.

## Two distinctive Economics needs to flag now (so they shape the contract, not a later fork)

1. **Multi-code questions — candidate UNIVERSAL.** Unlike Chemistry/ESAT, where a question has one `topic_code`, Economics essays legitimately test several syllabus points (a primary plus secondaries). `groupKey(q)` returning a single group loses that. Options: group by primary only (simplest, safe default), or let a question surface under each of its codes on the dashboard. This may benefit other subjects too, so raising it as a possible shared capability rather than solving it privately in our config. Your call on whether the engine's grouping should accept a multi-value key.

2. **Fit-flag / exclusion filter.** We carry `in_current` / `partial` / `pre_2022`, and a handful of copyright-redacted items with no usable image (two are unrecoverable at source). We need a filter dimension for the fit flag and a clean way to exclude the imageless ones. This looks adjacent to the public / teacher-only / used-in-own-tests exclusion layer noted as not-yet-built on the old PPQ, so it may be worth designing once.

## What I would like back

- Confirm Economics as an intended consumer and update its `REGISTRY.md` row (I have not edited the registry myself, per "subjects never edit the engine").
- The **catalogue export contract**: the exact `window.<X>_QUESTIONS` field shape and the asset-path convention you want, so I can export our workbook into it and write the small field-map note (DESIGN §5) now, ready for when Phase 2 lands.
- Whether you would like Economics to wait for the engine, or to prep the config + catalogue in parallel. I am ready to do the data side whenever it helps.

No rush on your side; Economics is not blocked. Flagging it so the shared engine's contract accounts for a written-response, multi-code subject from the start.
