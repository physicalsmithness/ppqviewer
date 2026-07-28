# DESIGN: ppqviewer engine

The concrete core-vs-config-vs-module-vs-data split, grounded in a full read of both live engines (chemistry `ppq.js` 826 lines + `ppq.html`; ESAT `engine.js` 388 lines + `config.js` + `index.html`). Target: one neutral engine, plus a tiny per-subject config, plus opt-in modules, plus per-subject data. Chemistry and ESAT should each migrate to a config file and a data file with no engine fork.

## 1. Shared engine (subject-agnostic, one file)

- Filter / order / shuffle / start-number. The flow is structurally identical in both copies today; only the filter FIELDS differ, so the fields come from config (see §3).
- Navigation: next / prev / skip, loop at ends, and optional jump-to-id (used by the multi-part module).
- The 1-to-6 self-mark scale: `.scale-btn` click writes a per-id competence score, then reveals Next.
- Storage: the attempts-log model (d001) keyed off `CONFIG.storageKey` (d002). `saveStore()` persists `{ attempts: [], scores: {} }`; the dashboard derives from it. One flat attempt row per answer (fields as ESAT's `recordAttempt`), with `self_report` reserved for the post-question interrogation module.
- `renderDashboard` (d004): group by `CONFIG.groupKey`, last-N tick/cross ribbon, 1-to-6 heat map with the shared ramp and intensity formula, click-a-group-to-filter, untagged bucket last, dashboard layout per `CONFIG.dashboardLayout`.
- Prefetch (d005): one parametrised function, depth `CONFIG.prefetchAhead`.
- Drawing overlay: `toggleDrawingMode`, `initCanvas`, `startDraw` / `draw` / `endDraw`, `clearCanvas`, `undoDraw`, `setDrawColor`, `setDrawThickness`, Ctrl+Z, resize re-init. This is the cleanest verbatim-shared block across both copies; adopt as-is.
- Image modal: `openModal` (accepts a single src or an array; renders images or a PDF iframe), `closeModal`.
- Keyboard map: arrows (prev/next), S skip, R reveal, Enter advance, number keys select options, 1-to-6 rate. Option-key range comes from config.
- The engine owns its DOM (d003), built into one mount element.

## 2. DOM contract (d003)

Each consumer page supplies: the standard `<head>` (viewport, stylesheet, GA4 + Clarity blocks per WEB_KIT, plus KaTeX/mhchem links only if the math module is on), and one `<div id="ppq-root"></div>` mount. The engine builds header/filter bar, question card, draw controls, competence widget, dashboard panel(s) and modal inside it. Styling stays in a shared stylesheet using CSS variables (`--c1..--c6` ramp, `--accent`, etc.) so a subject can re-skin via variables without touching structure.

**Embed mode (d009).** The same mount-point design must also run as a bolt-on component INSIDE a larger host app (Special Relativity is the first such consumer: the viewer is one part of a bigger driller, not the whole page). So the engine must not assume it owns `<body>`, must not depend on being the only script with a given global, and must scope everything to its mount, so a host page can drop `#ppq-root` anywhere and mount the viewer without clashes. One design, two uses: standalone page and embed.

## 3. Per-subject config (the `window.ESAT_CONFIG` pattern, generalised)

A single object per subject, e.g. `window.PPQ_CONFIG`:

- `title`, `versionLabel`, `appVersion`
- `storageKey` (REQUIRED, unique, namespaced; engine fails loud if missing)
- `learnerId` (default "local"; real identity arrives later, never baked into stores)
- `timingMode` ("none" in v1; capture is always on, UI gated), `showTimerUI` (bool)
- `filters`: an ordered array of filter dimensions, each `{ field, label, allLabel, friendlyLabels? }`. Chemistry: paper, level (+ implicit category filter). ESAT: subject, assessment, topic_code, esat_in_spec.
- `groupKey(q)` and `groupLabel(q)`: the dashboard grouping. Chemistry groups by `category_code`; ESAT by `topic_code` with an "UT_" untagged bucket.
- `dashboardLayout`: "single" (ESAT) or "split" (chemistry's 1B on the left, S/R on the right, by `category_code` prefix + paper).
- `prefetchAhead` (default 3)
- `options`: how answer options are labelled. `{ mode: "labels" | "count" | "text", labels?, count? }`. ESAT uses bare A..H labels (text is in the image); chemistry paper 1A uses A..D with synthetic option text from `q.choices`.
- `modules`: booleans switching optional modules on (see §4).
- Module-specific config sub-objects (e.g. the booklet asset list + trigger patterns) live under the module's key.

## 4. Optional modules (loaded only when config enables them)

- **`referenceBooklet`** (from chemistry): a config-supplied ordered list of reference-page assets plus trigger patterns; the engine scans question text and injects an "open in modal" button when a trigger matches. Chemistry supplies its 24 IB data-booklet sections and the "Section N" / "periodic table" triggers. Physics data sheet, ESAT formula sheet can opt in later.
- **`structuredPaper`** (from chemistry): multi-part whole-question navigation. On when question ids carry a block/part shape like `<block>(<part>)`. Provides `getQuestionBlockKey` / `getQuestionBlockParts` / `goToQuestionId`, the part-chip navigator, the assembled "whole question" `<details>` stack (auto-open past the first part), and the original-exam-page `<details>`. **Two explicit viewing modes (Smith 2026-07-01), user-switchable:** (a) WHOLE-QUESTION mode, the default for long questions, where you see the whole question and its parts and reveal answers together; and (b) PART-BY-PART mode, where you take one part at a time and the answer comes bit by bit. The engine already assembles the whole-question view; the requirement is to make the mode an explicit toggle rather than an implicit consequence of which part you are on. **Carry the G: peek-back heuristic:** when showing the original printed page(s), if the block's first part's page differs and the previous catalogue question shares the same paper code, include that previous page too (a stem can begin at the foot of the earlier printed page). This lived only in the old G: copy and must not be lost.
- **`questionTypes`** (from chemistry): per-question `type` so a subject can mix auto-marked MCQ (synthetic option text, marked against `answer_key`, logged), image self-mark (bare labels vs `correct_answer`), and reveal-markscheme flashcard (markscheme text with the accept/reject formatting, optional full-page markscheme in a spoiler `<details>`). Includes the examiner-report panel (`examiner_report`).
- **`math`** (from chemistry): KaTeX + mhchem rendering of question and markscheme text, with the cold-cache re-render safety net. Off for image-only subjects (ESAT needs none).
- **`postQuestionReview`** (new, built once as shared, per kickoff): the "where did you go wrong" interrogation. Writes into the reserved `self_report` field on the attempt row. The misconceptions spine (`misconceptions_core.yaml`, IB Physics Overview root) is ONE available vocabulary, NOT the only one and NOT mandatory. Smith (2026-07-01, q03): the categories are fed by each consumer/user, and it must not be locked to "always by the syllabus" or "only two ways of saying", because that would block innovation. So the module takes its category set from config (a consumer may point at the spine, supply its own list, or allow a free response), with the spine offered as a convenient default for subjects that want it.

- **`assistance`** (new, future phase, d007): on a question, the pupil asks for help and writes a free response; a teacher records an answer against it. The recorded answer carries a VISIBILITY SCOPE: direct to that pupil, to that pupil's class, or to all users. Because a class-visible or all-visible answer crosses users, this module writes to a SHARED store (backend), not the local attempts log, and depends on the identity/classes layer (d008). Built once as a shared optional module so economics/maths/physics inherit it, not an SR-only or chemistry-only feature.

- **`selfReport` scheme (config, d006):** the 1-to-6 scale is the default but is defined in `CONFIG.selfReport` (levels, labels, colour ramp), so a consumer can evolve its self-report differently. The dashboard heat map and the attempt row read the scheme from config rather than assuming 1..6.

## 5. Per-subject data (never engine)

The question catalogue (chemistry `window.CHEM_PPQS` in `ppqs.js`; ESAT `window.ESAT_QUESTIONS` + `ESAT_META` in `esat_catalogue.js`) and the asset folders (crops, full pages, markschemes, booklet pages). A small note per subject maps its raw field names to the config `filters` / `groupKey`, so the catalogue itself needs no rename to migrate.

## 6. Migration sketch (what each consumer does to adopt)

- **ESAT:** smallest move. Rename `ESAT_CONFIG` to the shared config shape, point at the shared engine + stylesheet, replace its bespoke `index.html` body with the `#ppq-root` mount. Modules: `postQuestionReview` on; others off. Its attempts-log and namespaced key already match the spine.
- **Chemistry:** larger move. Provide config (filters: paper/level; `dashboardLayout: "split"`; `options` for paper-1A MCQ; modules: `referenceBooklet`, `structuredPaper`, `questionTypes`, `math` all on). Migrate storage from the two flat maps to the attempts-log model (a one-off local read of the old namespaced keys can seed `scores` so pupils lose no history; `attempts` starts empty). Replace the bespoke three-column HTML with the mount. Keep `ppqs.js` as-is.
