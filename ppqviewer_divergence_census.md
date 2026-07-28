# ppqviewer Divergence Census

2026-06-29 census by the EdTech Overview seat.

Purpose: map how far the estate-shared "ppqviewer" engine (authentic past-paper-question image viewer, 1-to-6 self-marking, per-skill dashboard) has diverged across the subject projects that each hold a copy, so the copies can be folded into one neutral canonical engine without losing any gain.

Method: Glob and Grep across G:\My Drive\github local files, C:\Claude (not on Gdrive, nor OneDrive), and C:\Users\patri\github-local-files for ppq filenames and for the engine's distinctive strings (ppq_scores, scale-btn, preloadImages, crop_url, renderDashboard, prefetch). Engines were read and compared against the chemistry copy as the reference. Note on tooling: the G: drive is not mounted in the bash sandbox this session, so all G: work was done with the host file tools.

---

## 0. Headline findings

1. There are only TWO genuine ppqviewer copies in the estate: the chemistry driller and the ESAT Prep App. Every other engine.js found (Special Relativity, Trilogy Physics, Electric Circuits Mastery, Fields, Pre-IB) belongs to a SEPARATE engine family (the ECM / Pre-IB event-log "drilling" lineage) and is not a ppqviewer descendant. See section 1 for why.

2. The donor is NOT the G: chemistry copy. The brief named G:\...\chemistrydriller\ppq.js (about 736 lines) as the donor / most-current. The code says otherwise. The G: copy carries the OLD prefetch (cap 20, current plus next only) and lacks the newer engine helpers. The live, most-current chemistry engine is the C:\Claude copy, which has the longer prefetch and a part-navigator the G: copy does not. This matches the estate rule that active projects live on the non-sync C:\Claude and the G: mirrors are stale.

3. The "longer pre-fetch given to chemistry today" landed on the C:\Claude chemistry copy, not on the G: mirror and not on ESAT. ESAT has only a one-step preload. So the universal-change drift test is already failing: a change made to the live chemistry copy has not propagated to the ESAT sibling, and the G: chemistry mirror is behind its own live twin.

---

## 1. Inventory: every ppqviewer copy found

### Genuine ppqviewer copies (the only two)

| Copy | Engine file(s) | Lines | Last modified | Subject | Storage keys |
|---|---|---|---|---|---|
| Chemistry (LIVE donor) | C:\Claude (not on Gdrive, nor OneDrive)\chemistrydriller\ppq.js + ppq.html | ppq.js ~785 (richer), ppq.html 18.6 kB | ppq.js 2026-06-14, ppq.html 2026-06-27, data ppqs.js 2026-06-29 | IB Chemistry | ppq_scores, ppq_mcq |
| Chemistry (STALE mirror) | G:\My Drive\github local files\chemistrydriller\ppq.js + ppq.html + ppqs.js | ppq.js 736 | (G: mirror, older logic) | IB Chemistry | ppq_scores, ppq_mcq |
| ESAT Prep App | C:\Claude (not on Gdrive, nor OneDrive)\ESAT Prep App\app\engine.js + index.html + config.js + data\esat_catalogue.js | engine.js 388 | 2026-06-23 | ESAT (multi-subject: maths, physics, chemistry, biology) | esat_ppq_v1 (namespaced) |

Note on the two chemistry copies: same project, two locations. The C:\Claude one is live and functionally ahead (has resolveInlineImg, getQuestionBlockParts, goToQuestionId, a part-navigator with part-chips and a whole-question wq-part view, and the longer PREFETCH_AHEAD=3 prefetch). The G: one is the older mirror (simple preloadImages, no part-navigator, no goToQuestionId). The raw line count is a red herring: G: is 736 lines but functionally behind; the live C: copy is more capable even though its line count is similar. Treat the C:\Claude copy as the reference for all comparison below.

### NOT ppqviewer (separate "drilling" engine family, listed so they are not mistaken for copies)

These share words like renderDashboard and a 1-to-6 idea but are a different lineage: event-log mastery model, shuffled-deck scheduler, MCQ / calc graders, NO past-paper image crops, NO scale-btn / ppq_scores. Their own headers state they descend from Electric Circuits Mastery and the Pre-IB engine, not from ppq.js.

- C:\Claude (not on Gdrive, nor OneDrive)\Special Relativity Driller\app\engine.js (1209 lines, 2026-06-29). Header: "Shape lifted from the Fields / ECM siblings." Keys: srd_identity_v1, srd_session_v1, srd_prefs_v1, srd_eventlog_v1.
- C:\Claude (not on Gdrive, nor OneDrive)\Trilogy Physics\app\engine.js (1447 lines, 2026-06-20). Header: "engine blend: ECM drilling + Pre-IB calc_workings/atoms." Keys: trilogy_physics_log_v1, trilogy_physics_engine_prefs_v1.
- C:\Claude (not on Gdrive, nor OneDrive)\Electric Circuits Mastery\app\engine.js (the family ancestor).
- C:\Claude (not on Gdrive, nor OneDrive)\fieldsdriller\engine.js and the preibphysics topic engines.

These are out of scope for ppqviewer consolidation. They are flagged here only so a future tidy-up does not wrongly fold them in. (There may be a SECOND consolidation worth doing across THAT family, but it is a different exercise.)

No ppqviewer copies were found under C:\Users\patri\github-local-files (folder connected, nothing matched). No sundairy / ibeconomics / maths ppqviewer copy exists on G: today; only the chemistry copy carries the engine there.

---

## 2. Engine divergence matrix: ESAT vs the chemistry reference

Both share the same skeleton, which confirms common ancestry. ESAT's own header says so: "ESAT Prep viewer engine, adapted from the Chemistry PPQ viewer (ppq.js)."

SAME in both (the genuine shared core):

- The filter / order / shuffle / start-number flow (filterQuestions): identical structure, only the field names differ (chemistry filters paper/level/category_code; ESAT filters subject/assessment/topic_code/spec).
- The 1-to-6 self-mark scale via .scale-btn click handlers writing a per-id score, then revealing Next. (Chemistry uses class "selected"; ESAT uses class "sel". Cosmetic only.)
- renderDashboard: same idea in both, group by category, a last-N tick/cross ribbon plus a 1-to-6 rating heatmap with the identical colour ramp ({1:'229,62,62' ... 6:'47,133,90'}) and the identical intensity formula (0.2 + 0.8 * count / max). Click a category to filter. This is near-verbatim shared logic.
- The drawing overlay (toggleDrawingMode, initCanvas, startDraw/draw/endDraw, clearCanvas, undoDraw, setDrawColor, setDrawThickness, Ctrl+Z, resize re-init). ESAT's header explicitly says "drawing overlay (ported from donor ppq.js)." This is the cleanest verbatim-shared block of all.
- The image modal (openModal/closeModal).
- Keyboard handler shape (arrows, S to skip, Enter to advance, number keys map to options, 1-to-6 maps to scale buttons).
- Image preloading exists in both (but see section 3, the depth differs).

DIFFERS in ESAT (engine-level):

- Storage and state model. Chemistry: two flat maps in localStorage, state.scores under ppq_scores and state.mcqResults under ppq_mcq, saved by saveState(). ESAT: a single namespaced object under CONFIG.storageKey ("esat_ppq_v1") holding { attempts: [], scores: {} }, saved by saveStore(). ESAT additionally logs a flat engine-ready ATTEMPT ROW per answer (recordAttempt) with learner_id, slug, question_number, part, chosen_option, is_correct, time_ms, timing_mode, self_report (null, reserved), ts, app_version, context. Chemistry has nothing equivalent: it stores only the final score and the boolean MCQ result, no attempt history, no timing.
- Config indirection. ESAT reads everything that varies from window.ESAT_CONFIG (title, versionLabel, appVersion, storageKey, learnerId, timingMode, subjectLabels, specLabels). Chemistry hard-codes its equivalents in the engine and in ppqs.js. ESAT is therefore already part-way to the config-driven shape the canonical engine wants.
- Question rendering. Chemistry branches on paper: paper 1A is MCQ mode (synthetic A-D option text from q.choices, auto-marked against answer_key, writes mcqResults), papers 1B / 2 are flashcard mode (reveal markscheme text plus optional full markscheme page in a details block, KaTeX-rendered). ESAT has ONE mode: image-only stem (the crop carries both question and options), bare A-to-H option buttons with NO synthetic text (deliberate, its d019 note), self-marked against correct_answer. ESAT has no KaTeX (its prompts are images, so none is needed).
- Grouping helper. ESAT has groupKey/groupLabel with an explicit "untagged bucket last" sort and a per-topic total count shown in the dashboard. Chemistry sorts categories plainly and splits the dashboard into two columns (LHS 1B sub-categories, RHS S/R categories) driven by category_code prefixes, a chemistry-syllabus-specific split.

DIFFERS in chemistry (engine-level, present in the LIVE C: copy, absent in ESAT):

- Data-booklet deep-linking. DATA_BOOKLET_SECTIONS is a 24-entry table of IB chemistry data-booklet page images. The engine scans question text for "Section N" and for "periodic table" and injects a "View Section N of Data Booklet" button that opens the matching booklet page(s) in the modal. This is the headline per-subject feature and is entirely chemistry-specific.
- Multi-part / whole-question navigation. getQuestionBlockKey / getQuestionBlockParts gather all parts of one structured exam question; the engine renders part-chips and a wq-part "whole question" stack, and goToQuestionId jumps between parts (or scrolls to a filtered-out part). ESAT has no concept of multi-part questions.
- Dual MCQ + flashcard modes and examiner reports (er-box / examiner_report). ESAT is single-mode and has no examiner-report panel.
- KaTeX math rendering of question and markscheme text.
- The category scroll-to-and-highlight behaviour in saveState (scrollToCat), tied to chemistry's 1B / S / R category codes.

---

## 3. The prefetch test (universal-change drift)

This is the explicit test case: Smith gave a "longer pre-fetch" to the chemistry copy today.

- Chemistry, LIVE (C:\Claude\chemistrydriller\ppq.js): the NEW longer prefetch.
  const PREFETCH_AHEAD = 3; warms the current question plus three ahead. preloadImages now warms the visible crop (via resolveInlineImg), the full-page stem (page_url), the markscheme page (answer_url), AND for multi-part questions every sibling-part crop (getQuestionBlockParts). Retained-image cap raised to 80. nextQuestion drives it with a loop: for (let k = 1; k <= PREFETCH_AHEAD; k++) preloadImages(currentQuestions[currentIndex + k]).

- Chemistry, STALE (G:\...\chemistrydriller\ppq.js): the OLD prefetch.
  preloadImages warms only q.page_url-or-crop_url plus answer_url; cap 20; nextQuestion preloads only the current question and the single next one. No resolveInlineImg, no sibling-part warming, no PREFETCH_AHEAD.

- ESAT (engine.js): a MINIMAL preload, behind even the old chemistry one.
  In renderQuestion, only the immediate next question's crops are warmed: const nxt = view[(idx + 1) % view.length]; if (nxt && nxt.crops) nxt.crops.forEach(src => { const i = new Image(); i.src = src; }). One step ahead, no page/markscheme warming, no retained-image cap, no multi-step lookahead.

Verdict. Newest to oldest: LIVE chemistry (C:) > stale chemistry (G:) > ESAT. The longer prefetch exists in exactly one place, the live chemistry copy, and has propagated to neither the G: chemistry mirror nor the ESAT sibling. This is concrete evidence of the drift the consolidation is meant to end: a genuinely universal improvement (image prefetch depth) is trapped in one copy. In the canonical engine, prefetch depth should be a single shared function with the lookahead count exposed as config (a PREFETCH_AHEAD setting), so a change like today's is made once for everyone.

---

## 4. Subject-specific features to preserve as OPTIONAL modes in the canonical engine

Per copy, the gains that must survive consolidation as config-driven or pluggable features, not be lost:

From chemistry (live C: copy):
- Data-booklet deep-linking (DATA_BOOKLET_SECTIONS plus the in-text "Section N" / "periodic table" scanner and the View-booklet button). Make this an optional "reference booklet" module: config supplies an ordered list of reference-page assets and a set of trigger patterns; the engine injects the open-in-modal button when a trigger matches. Other subjects (physics data sheet, ESAT formula sheet) can then opt in with their own asset list.
- Multi-part whole-question navigation (block detection, part-chips, wq-part stack, goToQuestionId). Optional "structured paper" mode, on when the data has part ids of the form "<block>(<part>)".
- Dual MCQ-vs-flashcard mode plus examiner reports. Optional per-question "type" so a subject can mix auto-marked MCQ, image self-mark, and reveal-markscheme flashcards.
- KaTeX math rendering. Optional "render math" flag for text-prompt subjects; off for image-only subjects.

From ESAT:
- Namespaced storage key via config.storageKey. This must become MANDATORY in the canonical engine. ESAT's header records that the chemistry donor omitted it and collided with the Pre-IB Topic 7 localStorage key (their d004). The canonical engine must key all storage off a required config namespace and never use a bare "ppq_scores".
- Flat engine-ready attempt rows (recordAttempt: one row per answer, with timing, chosen option, correctness, version, context). This is a real analytics gain chemistry lacks. Make it the canonical storage model (an attempts log) with the dashboard derived from it, rather than chemistry's score-only maps.
- Silent timing capture (time_ms, timing_mode) ready for a later timer UI. Keep as an always-on capture with the UI gated by config.
- Image-only stem with bare option labels and a configurable option-label set (option_labels / option_count, A to H rather than fixed A to D). Generalises chemistry's fixed 4-option MCQ.
- Config-driven friendly labels (subjectLabels, specLabels) and an explicit "untagged bucket last" dashboard sort.

Shared, keep as core (already common to both): the 1-to-6 self-mark scale, the dashboard ribbon plus heatmap with its colour ramp and intensity formula, click-a-category-to-filter, the drawing overlay, the image modal, the keyboard map, filter / order / shuffle / start-number.

---

## 5. Consolidation recommendation

Best seed: start from ESAT's engine.js, not chemistry's. Reasoning: ESAT is the younger, cleaner rewrite of the same skeleton; it already has the two structural things the canonical engine must have and chemistry lacks (a required namespaced storage key, and a flat attempts-log storage model with the dashboard derived from it). It is also already config-driven (window.ESAT_CONFIG). Chemistry, by contrast, hard-codes subject specifics into the engine and stores only final scores. It is easier to port chemistry's rich optional features ONTO the ESAT spine than to retrofit ESAT's storage/config discipline INTO chemistry's engine.

What each copy must contribute to the canonical engine:
- From chemistry (live C: copy): the longer prefetch (PREFETCH_AHEAD plus sibling-part warming, parametrised), the data-booklet reference-page module, the multi-part whole-question navigator, the dual MCQ / flashcard / examiner-report question types, and optional KaTeX. Port these as opt-in modules.
- From ESAT: the namespaced storage key (mandatory), the flat attempts-log model and silent timing, the image-only stem with a configurable option-label set, and the config-label pattern. These become the spine.
- Retire the G: chemistry mirror once the live copy's features are folded in; do not seed from it.

Cleanest core-vs-config split:

GENUINELY SHARED ENGINE (one file, neutral, subject-agnostic):
- filter / order / shuffle / start-number; navigation (next / prev / skip, loop, optional jump-to-id); the 1-to-6 self-mark scale; the attempts-log storage model and saveStore (keyed off a required config namespace); renderDashboard (group, last-N ribbon, 1-to-6 heatmap with the shared ramp and intensity formula, click-to-filter, configurable "untagged last"); the parametrised image prefetch; the drawing overlay; the image modal; the keyboard map.

PER-SUBJECT CONFIG (a small config object per project, the ESAT_CONFIG pattern generalised):
- title / versionLabel / appVersion; storageKey (required, unique); learnerId; timingMode and whether the timer UI shows; field names and friendly labels for the filter dimensions; the grouping key and label function; prefetch depth (PREFETCH_AHEAD); which optional modules are on.

OPTIONAL MODULES (loaded only when the subject's config enables them):
- reference-booklet deep-linking (with the subject's own asset list and trigger patterns); structured multi-part navigation; question-type plugins (auto-marked MCQ, image self-mark, reveal-markscheme flashcard, examiner report); KaTeX math rendering.

PER-SUBJECT DATA (never engine): the question catalogue (chemistry's ppqs.js / window.CHEM_PPQS, ESAT's esat_catalogue.js / window.ESAT_QUESTIONS plus ESAT_META) and the asset folders (crops, full pages, markschemes, booklet pages).

Net effect: one neutral ppqviewer engine plus a tiny per-subject config plus opt-in modules plus per-subject data. Today's prefetch change would then be a one-line edit to a shared default that every subject inherits, instead of a gain stranded in a single copy.
