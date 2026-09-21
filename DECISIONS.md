# DECISIONS: ppqviewer

Numbered, newest reasoning appended. Cite as "d001 (ESAT-spine seed)", never bare "d001".

---

## d001 (ESAT-spine seed): seed the shared engine's spine from ESAT, port chemistry's richer features on as opt-in modules

**Decision.** Agree with the seat recommendation. The canonical engine's SPINE (storage model, config indirection, filtering/navigation skeleton) is seeded from ESAT's `engine.js`. Chemistry's richer FEATURES (multi-part navigator, data-booklet deep-link, dual MCQ/flashcard/examiner-report modes, KaTeX, the longer prefetch with sibling-part warming) are ported on as opt-in modules. Hard rule: the combined engine must do everything chemistry's does and everything ESAT's does.

**Reasons, from reading both engines in full (not taken on trust):**

1. **Storage model is the deciding factor.** ESAT stores a flat attempts log (`recordAttempt`: one row per answer with chosen option, correctness, `time_ms`, `timing_mode`, `self_report` reserved, `ts`, `app_version`, `context`) and derives the dashboard from it. Chemistry stores only the final state: a `scores` map (id to 1-6) and an `mcqResults` map (id to boolean), no attempt history and no timing. An attempts log is a superset: the score-only view can be derived from it, but not the reverse. Retrofitting an attempts log into chemistry's `saveState` is more invasive than porting chemistry's view features onto ESAT's spine.

2. **ESAT is already config-driven** (`window.ESAT_CONFIG`: title, versionLabel, appVersion, storageKey, learnerId, timingMode, subjectLabels, specLabels). Chemistry hard-codes its equivalents in the engine and in `ppqs.js`. The config-driven shape is exactly what the shared model needs, so ESAT is closer to the target.

3. **Silent timing capture** (`time_ms`, `timing_mode`) already exists in ESAT with the UI gated for later. This is a real analytics gain chemistry lacks, and it is on the spine.

**Census correction (material, found this session).** The 2026-06-29 divergence census argued for the ESAT spine partly on the grounds that chemistry still used a bare `ppq_scores` / `ppq_mcq` storage key while ESAT alone namespaced. That is now out of date: the live `C:\Claude...\chemistrydriller\ppq.js` (dated 29 Jun 03:42) has ALREADY adopted namespaced keys (`chemistrydriller_ppq_v1_scores` / `_mcq`, its own d005 fix). So both copies now namespace, and that particular argument no longer separates them. The conclusion is unchanged because reason 1 (attempts-log vs score-map) is the deeper structural difference and stands on its own. Recorded so the reasoning is honest rather than inherited.

**Cost this decision accepts (tracked in ROADMAP).** Chemistry's features are non-trivial to port: the multi-part block detection and whole-question navigator (`getQuestionBlockKey` / `getQuestionBlockParts` / `goToQuestionId` / part-chips / `wq-part` stack), the 24-entry data-booklet deep-link with the in-text "Section N" / "periodic table" scanner, the dual MCQ-vs-flashcard rendering with examiner reports, and KaTeX + mhchem. None may be lost.

**Fork-vs-stale verification (2026-07-01, Smith asked).** Read the full G: chemistry `ppq.js` (736 lines) against the live copy (826 lines), not just the head. The G: copy is stale, not a fork: every capability it has is present in the live copy, mostly enhanced (namespaced storage, part-navigator, `goToQuestionId`, deeper prefetch, KaTeX cold-cache safety net). No divergent development. ONE micro-heuristic in G: was NOT carried into the live copy and must be folded into the shared structuredPaper module rather than lost: in its "Show Full Question Pages" view, G: peeks at the previous question in the catalogue and, if it shares the same paper code, prepends that previous page image (a workaround for a stem that began at the foot of the earlier printed page). Tracked as a structuredPaper requirement (DESIGN §4).

---

## d002 (namespaced storage mandatory): all storage keys off a required config namespace

The engine keys every localStorage read/write off `CONFIG.storageKey`, which is required and must be unique per consumer. No bare `ppq_scores`. This is the fix for the original collision (chemistry's bare key clashing with the Pre-IB Topic 7 key). Both live copies already comply; the shared engine enforces it (fail loud if `storageKey` is absent).

---

## d003 (canonical DOM contract): the engine renders its own question DOM into one mount point

Reading both HTML shells showed they use DIFFERENT element IDs and structures for the same parts (chemistry: `mcq-options`, `comp-widget`, `answer-panel`, `ms-text`, `q-text`, a three-column syllabus layout with `lhs-content` / `rhs-content`; ESAT: `options-grid`, `competence`, `answer-line`, `crop-stack`, `dash-content`, a single dashboard). If the shared engine simply "expects IDs", every consumer's HTML has to converge on one hidden contract, which is a fresh source of drift.

**Decision.** The shared engine owns its DOM: each consumer page supplies one mount element (plus the standard `<head>` assets and the GA/Clarity blocks), and the engine builds the card, controls, competence widget, dashboard and modal inside it. Config chooses dashboard shape (single-column grouped, or a two-column split like chemistry's 1B / S+R). This keeps "subjects supply only config + data" true at the HTML level too, not just the JS level. It is a larger up-front rewrite than an ID-matching approach, recorded as an open trade in `OPEN_QUESTIONS.md` (q02) in case Smith prefers the lighter ID-contract route.

**CONFIRMED 2026-07-01: Smith chose Option A (engine builds the furniture).** q02 resolved. The engine draws all furniture into one `#ppq-root` mount; consumers ship only config + data. This is the Phase 2 build shape.

---

## d004 (dashboard is one configurable component): group function from config, untagged bucket last

One `renderDashboard`, shared. The last-N ribbon, the 1-to-6 heat map, the colour ramp `{1:'229,62,62',2:'221,107,32',3:'214,158,46',4:'72,187,120',5:'56,161,105',6:'47,133,90'}` and the intensity formula `0.2 + 0.8 * count / max` are already verbatim-identical across both copies, so they become the shared default. Grouping (`groupKey` / `groupLabel`) and the "untagged last" sort come from config. Chemistry's syllabus-specific two-column split (driven by `category_code` prefixes and paper `1B`) is expressed as a dashboard-layout config option, not baked into the core.

---

## d005 (prefetch is one parametrised function): depth from config

The prefetch becomes a single shared function with the lookahead count exposed as `CONFIG.prefetchAhead` (default 3), warming the visible crop, the full-page stem, the markscheme page, and, when the structured-paper module is on, the sibling-part crops. Retained-image cap stays bounded (80). Today's prefetch change would then be a one-line default edit inherited by everyone, which is the whole point.

**Smith confirmation (2026-07-01):** yes, prefetch several questions ahead, and warm the ANSWER / markscheme image as its own separate fetch (not only the question crop), so revealing the answer is instant too. This is already how the live chemistry prefetch behaves (`answer_url` warmed alongside the stem); keep it, and keep the depth in config.

---

## d006 (self-report is pluggable, not a hardcoded 1-to-6): the rating scheme is defined in config, not baked into the core

**Decision.** The 1-to-6 self-mark is the shared DEFAULT, but the core must not assume it is universal or permanent. Smith (2026-07-01): all consumers use 1-to-6 today, but "the self-report might develop in different ways with different things." So the self-report scheme (number of levels, labels, colour ramp, and whether it is a rating at all versus, say, a confidence tag or a free response) is defined in `CONFIG.selfReport` and the storage + dashboard read the scheme from there. The heat-map colour ramp and the attempt row's `self_report` field are driven by the scheme definition, not by a fixed 1..6 literal. Nothing changes for the current consumers; the core just stops hard-coding the scale.

---

## d007 (help / assistance layer with visibility scopes): a pupil can ask for help on a question, a teacher records an answer, and the answer has a visibility scope

**Decision (new capability, future phase).** Smith wants, on a question, the pupil to be able to ask for assistance and write a free response, and for the teacher to record an answer against it. The recorded answer carries a VISIBILITY SCOPE, one of: direct to that pupil, visible to that pupil's class, or visible to all users. This is an opt-in shared module (`assistance`), built once here, not per subject. It writes to a store that is separate from the local attempts log because it crosses users (a teacher answer seen by a class is not local-only state). It implies the identity/classes layer in d008. Recorded now so the spine is not designed in a way that blocks it; built in a later phase (ROADMAP). See OPEN_QUESTIONS q06 for the cross-consumer analytics-visibility question that rides alongside it.

---

## d008 (identity and classes, for all logins): real logins with class membership, needed by the assistance layer and beyond

**Decision (future, dependency of d007).** Smith: logins are "something we should do for all logins", and on login the teacher can assign users to classes. So the shared model gains an identity layer: a real login (not the current `learnerId: "local"` placeholder) and a class membership per user, so a teacher answer can be scoped to a class. This is the FastAPI + Google-OAuth backend tier the estate web kit already points at (the Memoriser pattern). `learnerId` stays out of the question/analysis stores as raw identity; the login maps to it. Big, later, but recorded as the substrate the assistance layer needs. Do not bake a two-value-only or syllabus-only assumption anywhere that would block it (Smith's "don't block innovation").

---

## d010 (chemistry migration details): unified v2 store with seed-from-v1, and the split preserved as two labelled columns

**Storage.** Chemistry moves to a single unified key `chemistrydriller_ppq_v2` holding `{attempts, scores}` (the shared shape). A `migrate` config hook seeds it once from the old `chemistrydriller_ppq_v1_scores` / `_mcq` keys, so pupils keep their self-ratings and their MCQ history (old booleans become minimal attempt rows). Confirmed by test.

**Question types.** Paper 1A renders as auto-marked `mcq` (synthetic A-D option text from `choices`, marked against `answer_key`, examiner-report panel); papers 1B and 2 render as reveal-markscheme `flashcard` (formatted markscheme text, optional full-page markscheme spoiler, examiner-report). Graded types (mcq, imageSelfMark) write attempt rows; flashcard records only the self-rating, matching the donor.

**Split dashboard (q05 preserved).** Chemistry's two-column syllabus split is expressed as `dashboardColumns` and rendered as two labelled columns ("Paper 1B Mastery" with rating boxes, "Syllabus Overview" with tick/cross ribbon + rating heat map) inside the dashboard panel. The split CONTENT is preserved faithfully; its exact left-and-right-of-centre placement from the old three-column page is a later cosmetic option (this is the "or move the join point back" half of Smith's q05 note, deferred as non-essential).

---

## d011 (learned scope): pupils mark what they have learned so far, and the viewer filters within it by default

**Decision (Smith, dictated 2026-07-29, for IB Maths first but built as a shared module).** A pupil can mark their current position in the course — everything actually learned so far — through a nested tri-state tick tree over the consumer's syllabus hierarchy (for IB Maths: topic → subtopic → item, the spine's SL1.2.3 level; "it should be possible to drill down considerably"). Ticking a parent ticks all its descendants, so nobody re-ticks leaf by leaf; partial branches show an indeterminate state.

Once a learned set exists, the question filters operate WITHIN it by default: "All topics" means all LEARNED topics ("you want somebody to be able to click all, meaning everything learned, without having to retick everything"). One visible master toggle turns the scope off for deliberate looking-ahead. Unlearned entries in dashboards and filter lists are greyed rather than hidden (Smith: "maybe greying for unlearned").

**Semantics.** A question is within scope when ALL of its syllabus codes are marked learned — a question that needs an untaught technique is not practisable, whatever else it touches. (The looser any-code reading is recorded as the alternative; revisit if strictness excludes too much in practice.)

**Storage and future.** The learned set persists in the store (`store.learned`, code → true) per consumer storageKey — local to the pupil's device now. When real logins and classes arrive (d008, identity and classes), a teacher-set class coverage can seed or override the local set; nothing in this design blocks that.

**Naming.** Smith confirmed **"Learned so far"** (2026-07-29).

**Built 2026-07-29 (engine v0.12.0), IB Maths only — Smith: "not needed for esat".** Extension recorded the same day, from the AA guide Smith supplied: pupils should also DECLARE THEIR LEVEL (SL/HL). The declaration restricts the Learned-so-far tree (SL sees SL codes only), switches the timing baseline (guide assessment outline: SL 90 min/80 marks vs HL 120/110, P3 75/55), and notes that question types differ by paper. Not yet built; queued with the guide numbers already wired for HL.

---

## d012 (marks-based self-assessment with uncertainty and an error taxonomy): the long-form self-mark is marks out of maximum, a declared range when unsure, a banded rating prompt, and a structured what-went-wrong

**Decision (Smith, dictated 2026-07-29; his framing: "let's get a rough thing outlined for that, and we can work on it").** For long-form parts (IB Maths first), right/wrong is not enough. After revealing the markscheme the pupil enters MARKS:

1. **Marks bar, fewest clicks.** One row of buttons `0 … max` (max from the part's marks). One click records an exact, sure mark. The max button is visually distinct and labelled "Got it right" (no "I", Smith's wording); zero is plain. A separate "Not sure?" toggle switches to RANGE entry: tap the lowest plausible and highest plausible mark (two clicks). Partial credit is automatic from the value, not a separate mode.
2. **Banded rating prompt.** Full marks highlights ratings 4, 5, 6 in the 1-6 self-report ("should prompt you to rate it four, five or six; the others should be clickable, but those should be highlighted"). Other outcomes leave the scale neutral until Smith specifies more bands.
3. **What went wrong (part marks or zero).** A structured, MULTI-SELECT taxonomy panel opens, config-driven per consumer (extends d006's pluggable self-report and implements VF-06's configurable vocabulary + free-text escape). Maths seed vocabulary, grouped:
   - **Annoying slips**: algebraic slip (written); algebraic slip (mental); mental arithmetic; calculator; miscopied / mistyped the question or equation.
   - **Getting stuck**: couldn't find a way in; saw half the way in; got halfway there; stuck on the algebra; didn't spot factorising; took the wrong route (e.g. expanded when not needed); didn't spot taking logs; didn't spot the hidden quadratic.
   - **Content gap ("weak area", clickable)**: the question's OWN subtopics render as chips ("I'm not solid on …"), so naming the weak area is one click; where the pupil's progress data already marks a subtopic weak, that chip is pre-highlighted ("you should be prompting for a weak area if we have that, if that's joined up").
   - **Communication (provisional)**: didn't state the conclusion / justification missing. (Smith's dictation was unclear here — "didn't comment… probably a different section" — flagged for his correction rather than guessed at.)
   - **Escapes**: "Other…" free text, and "Suggest a new category" (a proposal channel, reported for review, mirroring the estate's vocabulary-coinage pattern).
   Some causes are question-specific and should eventually feed FROM the question (analysis-side, when authored analysis exists); the taxonomy is a shared floor, not a ceiling.
4. **Storage.** The attempt row carries `marks_max`, `marks_awarded` (exact) or `marks_range: [lo, hi]`, `sure` (boolean), and `error_tags` (selected taxonomy values + free text). `correct` stays derived (awarded === max) so every existing surface (dashboard, progress, history) keeps working; the progress page can grow marks-fraction views later.

Implemented as question type `marksSelfAssess` in the shared engine, configured per consumer (`selfAssess: { taxonomy: … }`). Rough by design; Smith iterates on the wording and the taxonomy after first contact.

**First-contact iteration (Smith, 2026-07-29 evening), built the same day:** the prompt reads "How many marks do you award yourself, out of N?"; full marks above 2 reads "Got it completely right". Groups reordered: the WAY-IN block first (couldn't find a way in / saw half the way in / got halfway there), then **Stuck algebraically** (didn't spot factorising; took an unhelpful route; expanded when I should have factorised; didn't see I had to gather terms; didn't spot the hidden quadratic; didn't spot taking logs; stuck on the algebra) which "should only trigger when it's really there" — groups may declare `when(q)`, maths gates it on algebra content as an interim until the seat's TECHNIQUES axis lands — then Annoying slips BELOW. Communication is OUT until a communication mark exists in the data. Suggest-a-category sits above Other. Weak-area chips and the learned tree speak human (labels generated from the syllabus spine; "no way people are going to know what SL1.2 is"). Consumers with no feedback source show no readiness badge.

**Open direction (Smith's, recorded not resolved):** whether to categorise every error at all, per-mark opinions ("give an opinion on each mark — did you miss it?"), and whether the same structure transfers to chemistry and physics, where errors are less well-categorised than maths. The techniques axis (per-question, student-phrased) is the expected next input.

---

## d014 (IB Maths publication): school-use publish approved; q12 closed

**Decision (Smith, 2026-07-29 night, verbatim intent):** "this will only be
served to people in school where i know they have rights. in the meantime it
won't be publicised to people outside of school and i will know if there's any
spike. i think it's safe to issue. but we can expedite google login too, for
medium term."

So: `deploy\ibmathsdriller` publishes to GitHub Pages with the estate GA4 +
Clarity blocks (spike-watching is part of the basis), it is not linked or
publicised beyond school, and **Google sign-in is an expedited medium-term
item** (ROADMAP; supersedes the light honour sign-in as the identity answer
for IB content). The assembler ships crops, ms crops and the complete
deduped markscheme pages (~680MB site). The rights position is Smith's own
call as the teacher serving licensed pupils; the viewer's job is to keep the
surface unpublicised (no index pages, no cross-links) and observable (GA4).

---

## d013 (timing system): engine owns modes, bank, pause, discard and the learner's extra time; subjects supply only pacing

**Decision (built 2026-07-29; sources: handoff VF-04 + the ESAT architecture packet of 2026-06-29).** The shared engine owns the timing MECHANISM: six modes (`none`, `end_only`, `per_question`, `clock`, `ring`, `bank` — the packet's five plus the pacing ring), the running time bank (allowed to go negative: a deficit is shown, not floored away), pause (paused time excluded from the spend), the per-question "don't record this one" (an honest `time_ms: null` + `time_discarded`), the learner's extra-time percentage (25%/50%/custom, negative allowed for harder practice), and silent `time_ms` capture in every mode. Preferences persist per learner per consumer in `store.prefs.timing` and are edited in the engine's Timing panel. The ring falls back to a quiet countdown under `prefers-reduced-motion`. Analysis/reflection time is excluded by construction: the clock commits when the answer (or the markscheme reveal, for marks questions) lands. Guessing is never inferred from time.

**Subjects supply only** `cfg.timing = { targetOf(q) -> seconds, defaultMode }`: ESAT paces uniformly per section (S1: 60 min / 40 questions = 90 s; default mode keeps Smith's quiet count-up clock); IB Maths paces at 1.5 minutes per mark (`marks × 90 s`; default off per q10 while learning). No pace is hardcoded in the engine; difficulty-based targets remain a pattern to learn from real medians later, never assumed. Legacy `cfg.timer` consumers keep working unchanged.

---

## d009 (embeddable as a bolt-on component, not only a standalone page): the viewer must run inside a larger app

**Decision.** Smith (2026-07-01) on Special Relativity: it IS a consumer and wants to use this soon, but "it's only a part" of the app, "a thing to be bolted onto". So the viewer is not always the whole page; it must run as a component mounted inside a larger host app (the circuit-builder-embed pattern from ECM). This fits d003 (engine-owns-DOM into one `#ppq-root` mount): the same mount-point design serves both a standalone page and an embed. Requirement: no reliance on owning `<body>`, the header, or global singletons that would clash with a host; everything scoped to the mount and namespaced. SR is the first embed consumer, near-term.

---

## d015 (takeover operating rulings): duplicate text is deliberate; maintainer syncs, Smith pushes; builders on demand

**Decision (Smith, 2026-07-30, on the new maintainer's takeover report).** Three rulings:

1. **Maths display: render BOTH the stem text and an identical part text.** Smith: "rendering both is fine. it's a double check for poor ocr plus diagrams etc." The extracted text is a deliberate cross-check surface against the crop, not furniture to dedupe. Fault-4 keeps both; text cleanup stays limited to page-furniture tokens (leading question numbers, `[Maximum mark: n]`, duplicate part labels, trailing `[n]`, trailing `□` answer-box runs), never the prose itself.

2. **Sync automation (option a).** The viewer maintainer re-assembles `deploy\ibmathsdriller` on every wake and whenever a regeneration packet lands (sha-compare the canonical catalogue against the deployed copy; run `tools\assemble_ibmaths_site.js`). Smith alone commits and pushes, via GitHub Desktop. Bulk asset spurts (hundreds of MB) finish natively via `SYNC_IBMATHS_WEBSITE.cmd`, which now fails loud when run from a worktree/partial copy. No nightly scheduled job for now (offered, not taken).

3. **Roles (option a).** No standing second seat. This seat stays architect/integrator; big self-contained features may be dispatched to bounded builder chats with a packet and a returned, tested diff, on demand. Revisit if two features must run in parallel.

(Recorded immediately because Smith was switching models mid-conversation; the ~700MB of junk assets in the `.codex` worktree 5040 remains in place, no ruling given.)

---

## d016 (part-by-part, taken from chemistry): the markable unit is the record, and a consumer may not ignore a capability the engine already carries

**The failure this fixes.** Smith, 2026-07-30, on a 19-mark question offering a single `0 … 19` marks bar: "the part question stuff is just not serving… It's like the chemistry thing is being ignored. You have to go back to that and pick up what's working in it. I feel like I'm going over the ground and having to fix problems that I previously fixed."

He was right, and the cause was not a missing feature. Chemistry's past-paper viewer solved structured papers long ago, and its module was ported into this engine in Phase 3 under d001 (ESAT-spine seed, port chemistry's features as opt-in modules): `structuredPaper` draws the part chips, the whole-question / part-by-part toggle and the peek-back page heuristic, tested by `test_chem.js`. The IB Maths consumer, built 2026-07-29, **never switched it on**. Its flatten collapsed each question's `parts` array into one record and rendered the parts as a stack of crops with one question-level marks entry. The engine offered the solution; the consumer walked past it. d001's hard rule ("the combined engine must do everything chemistry's does and everything ESAT's does") was satisfied in the engine and silently broken at the consumer boundary, where nothing was checking.

**Decision, three parts.**

1. **The record is the MARKABLE UNIT, not the printed question.** A unit is what one marks entry covers: normally one part, but parts the seat marked together (shared `mark_group`) form one unit worth their combined marks, because that is how the paper marks them. Unit ids are `<questionId>(<slug>)`, which satisfies the engine's existing block-detection contract, so `structuredPaper` groups them with no engine change. Single-part questions keep their original bare id, so stored history survives. IB Maths: 5,368 records from 2,195 questions; 1,459 questions gain part-level marks entry.

2. **A zero-mark part inside a marked run is an extraction miss, not a task.** Where a blank-mark part shares its printed part letter with a neighbouring unit that has marks (e.g. 2222-7107 P2 Q12: `12(c)(ii)` blank while `(c)(i)/(iii)/(v)` share a 12-mark group), it is absorbed into that unit. No marks are invented; the group total is the printed one. This lifts questions with part-level marks from 1,063 to 1,459, and questions worth 10+ marks from 425 to 763 of 862. What remains question-level is the seat's 2004-07 structural-loss era (blank marks, NO status), per their switching rules; 99 records still show 10+ marks in one bar, and they flip automatically when the seat's Phase-2 mark reconstruction lands, with no code change here.

3. **Markscheme pages are narrowed to the question.** `ms_pages` is the paper's ENTIRE markscheme (mean 19 pages, up to 38, page 1 the cover), which the reveal was serving whole: Smith, "the entire document, starting with the header page, is completely nuts." The ms_crop filenames carry their source page, so the pages holding a question are derived where crops exist and bracketed between located neighbours otherwise. Mean pages shown falls from 19.0 to 7.1; 3,806 records located exactly, 77 bracketed, 1,485 still whole (the crop-less papers, seat ask sent). The expander's wording states which of the three it is; the viewer never implies it located something it did not.

**The mechanism, which matters more than the fix.** A new suite section executes the real wrapper against the real catalogue (capturing `PPQViewer.mount`) rather than grepping source, and asserts CAPABILITY PARITY: if a consumer's records form part blocks, `structuredPaper` and `blockKeyOf` must be present. A consumer can no longer quietly decline a capability the engine already carries, which is the class of error d016 exists to close. Engine 0.14.0 adds only optional hooks (`partLabelOf`, `partMarksOf`, `msPagesLabelOf`); chemistry and ESAT are untouched and their suites unchanged.

**Still owed here, recorded so it is not lost:** the per-part "show the full printed page" toggle (fault 2) rides on this shape and is not yet wired; the seat's `meta.code_names` / `meta.item_content` are shipped but not yet adopted in chip and sidebar labels. _(Labels adopted the same night, see d017.)_

---

## d017 (mark-point ticking is opt-in, not the default): plus the seat's page ranges and code names adopted on arrival

**Smith's ruling, 2026-07-30 night, on how the mark-point data should be used:** option **(b)**, with his words: "it may become a, but let's not make it burdensome for the moment."

Context: the Maths seat shipped `markpoints` on 6,207 parts (each with `seq`, `token` M1/A1/R1/AG/N, `kind`, a short verbatim `snippet`, `route`, `source`) plus `markpoint_routes` on 1,195 parts, following Smith's steer that a pupil might tick the mark points they actually got, with a second "maybe" state. The seat argued it should supersede the marks bar, because the total then falls out of the ticks and a missed tick is a LOCATED failure that the what-went-wrong layer can name for itself.

**Decision.** The part-level marks bar built in d016 (part-by-part from chemistry) stays the default self-mark. Mark-point ticking is an OPT-IN mode offered where `markpoints` exist, never forced, and it must not add a step to the ordinary path. Smith may promote it to the default later once it has been used in anger; the design should therefore keep the tick data and the marks number in the same attempt row (ticks imply a total, so a ticked attempt writes `marks_awarded` exactly as the bar does) so that promoting it is a default change, not a migration.

Three properties of the seat's data the build must honour: routes are EXCLUSIVE (pick a route, then tick within it; ticking across routes double-counts), `AG` means the answer was printed so the claim is "I showed it convincingly" rather than "I got it", and bracketed tokens like `(M1)` are implied marks a pupil may not know they earned, which is exactly what the "maybe" state carries.

**Adopted the same night, both live faults with the data already in the catalogue:**

1. **Human names everywhere a code can surface.** Smith: "there is no friendly text on anything bar t1t2 etc." The seat diagnosed it precisely: `ibmaths_spine_labels.js` is generated from the ITEM-level spine (`AHL1.12.1`) while every surface groups at topic-part level (`AHL1.12`), so each lookup missed and fell back to the bare code, which is why only T1-T5 read properly. Lookup order is now `meta.code_names` (135, authoritative) then `meta.item_content` (275) then the generator, and the display rule is name first, code second: "Complex numbers, Cartesian form, Argand diagram (AHL1.12)". All 82 topic-parts present in the corpus are named, none falls through. Applies to the subtopic filter, the dashboard facet, the progress axis (new engine hook `axis.labelOf`, since axes previously printed raw values), the weak-area chips and the Learned-so-far tree.

2. **The seat's own markscheme page ranges, which supersede my locator of a few hours earlier.** They shipped `ms_pages_this_question` (2,021 of 2,195 questions), `ms_page_span_source` (`aligned` 1,355 / `located-high` 575 / `located-medium` 91) and per-part `ms_crop_adequacy`, flagging 788 parts whose crop is under about a text line per mark. Theirs is used first, my crop-filename locator survives as the fallback, whole paper last: mean pages shown falls from 19.0 to 2.9, with only 181 records still served a whole document. A thin or crop-less part now opens its pages unasked and says why ("the clipped markscheme below is too short to be the whole answer"), `located-medium` says it is approximate, and the complete document always remains one click deeper because a narrowed set can clip.

Engine 0.15.0 adds `msPagesAllOf`, `msPagesOpenOf` and `axis.labelOf`, all optional. Suites 598/598 + 70/70.

---

## d018 (the stem as printed, and chemistry's auto-open restored): a stem is an image, never OCR prose

**Smith, 2026-07-31, three times over: "This was solved by chemistry."** His fault report: "we're not getting the stem. You get the WORDS of the stem, but if there's any maths in the stem, then you'll be lucky if you can understand it. If there's a graph in the stem, then you just won't see it." And: "I'm sure that chemistry would show you the stem again and again and again."

He was right on both counts, and I had been fixing parts while leaving the stem alone. Three faults, all now closed.

**1. The stem had no image at all.** The catalogue carries `stem_text` and nothing else: no stem crop exists, and every part crop is cropped tightly to its own part. So a stem's display maths arrives flattened (`2x2 - 5x + 2 = 0 {2, -5, 2}`), and a stem's table or graph, like the palindromic-coefficients table in 8824-9702 P3 Q2, is simply absent. Prose cannot be the account of a stem. What DOES exist is the printed question page, so the engine gains `stemPagesOf` and the card now opens with **the question as printed, with its stem, tables and figures**, above the part crop, on 5,285 of 5,368 records. The OCR text stays as the cross-check Smith asked for in d015; it is no longer the only account of the stem.

**2. "Show original exam page(s)" was serving MARKSCHEME pages.** A part's `pages` array interleaves mark pages with question pages (8824-9702 Q2(a)(i) lists `mark_p016`, `mark_p017`, then `question_p005`), and the wrapper took `pages[0]`. So the control at the foot of the card, next to Reveal, really did show the answer, which is exactly how Smith read it. Question pages only now, filtered on the filename, asserted by the suite for every record.

**3. Chemistry's auto-open rule had been dropped in the Phase 3 port.** Chemistry's `ppq.js` reads `const openAttr = isFirstPart ? '' : ' open'; // auto-open when earlier parts exist`, so from part (b) onwards the whole question is expanded by default and the pupil sees the stem and everything already asked, every time, without opening anything. Our port always opened it in whole mode and never in part mode, which is not the same rule. Restored verbatim in behaviour: shut on the first part (the stem is right above it), open on every part after, and the summary says which it is doing. This is the second capability found missing from the port after d016 (part-by-part), both found by Smith rather than by us, which is what the capability-parity test now exists to prevent.

Engine 0.17.0. Suites 622/622 + 70/70 + 18/18.

**Standing lesson, recorded because it has now cost two rounds:** when a consumer looks wrong and chemistry solved the same problem, READ `chemistrydriller\ppq.js` before designing anything. Not d001's summary of it, the code. Both misses here were visible in about forty lines of it.

---

## d019 (mark-point ticking, built first as opt-in, then judged on a real question): Smith's (c)

**Decision (Smith, 2026-08-02):** option **(c)**. Build mark-point ticking as an opt-in mode, look at it on a real question, and only then decide whether it replaces the marks bar and shrinks the generic taxonomy. This supersedes nothing in d017 (mark-point ticking opt-in); it sets what happens next after the looking.

Context for the reversal-that-isn't: d017 recorded "(b), it may become a, but let's not make it burdensome". On 2026-08-02, having met the generic error list on a question it did not fit, Smith went further: "How can you give a possible 'why I got it wrong' option on all of them?… I think we just need a complete redesign of all this stuff." The redesign is available in data rather than in vocabulary: `markpoints` on 6,207 parts gives the credited steps in the markscheme's own words, so a pupil ticks what they got instead of choosing a cause from a list I wrote. A missed tick is a LOCATED failure on a named step; the total falls out of the ticks, which also dissolves the out-of-N problem d016 only halved. (c) is the honest order: build it, look at it, then rule.

**Build constraints, carried forward from d017 and the seat's cautions:** routes are exclusive (choose a route, then tick within it; ticking across routes double-counts); `AG` means the answer was printed, so "I got it" is a different claim there and must render differently; bracketed tokens like `(M1)` are implied marks a pupil may not know they earned, which is what the "maybe" state carries; the tick data and the marks number share one attempt row, so promoting ticking to the default later is a config change and not a migration; and about 15% of the seat's 28,313 steps are symbol-heavy or OCR wreckage, so any step whose snippet is mostly symbols falls back to the crop until their rewrite pass lands.

**Interim taxonomy additions (same day, from Smith's words):** "Didn't read the question carefully" belongs in Annoying slips, and a new group "Working and communication" covers getting the answer but not showing enough working, missing a method mark, not stating the conclusion, and not justifying a step. A maths mark is routinely lost with the right answer on the page and nothing in the old list could say so. These stay until ticking proves it can say it better.

---

## d020 (default to the practisable subset): the driller serves what a pupil can still be examined on, and the question carries its own syllabus and era notices

_Backfilled 2026-08-03: built and committed in `93a0177` (engine v0.19.0) on 2026-08-03 at 02:13, recorded in the CHANGELOG, but the session ended before this entry was written._

**Decision (from the Maths seat's packets of 2026-08-01, built 2026-08-03).** The syllabus filter is multi-select and defaults to current + close + mixed with off-syllabus OFF (3,696 of 5,368 records served by default; the rest one tick away, never hidden). The seat's argument stands as the rationale: a pupil revising should not have to know the Sets, Relations and Groups option existed in order to avoid it. Syllabus status renders on the question itself rather than as a chip (an off-syllabus question says so and says why it is still worth having; a current one says nothing); the seat's `usable_if` sentence takes precedence over generic wording wherever populated. The 315 questions from 2004-07 marked under abolished conventions carry their era warning at the markscheme reveal, because without it the scheme reads as broken and the pupil stops trusting the reveal. Two deliberately generic engine hooks carry all of this: `noticesOf` (what a pupil must know before working) and `markschemeNoteOf` (what they need while reading a scheme); physics has the same era problem waiting and inherits the surface.

---

## d021 (multi-consumer operating model): the architect owns the platform, builders are bounded and packet-dispatched, content seats never commit here, and ESAT planning comes inside

**Decision (Smith, 2026-08-03, dictated; mechanism drafted by the architect).** Smith's substance: development for all deployments stays in this one place, because 60-70% of what any deployment needs is shared; the best organisation is the viewer seat in charge as architect, instructing builders underneath it for the specialist deployments, keeping the architect's context for the overview rather than the coding guts as consumers multiply; ibmathsdriller is a deployment name for what is really the ppqviewer, and the chemistry pattern (the viewer as one module beside adjacent driller modules) is the probable shape of many future deployments, with ESAT viewer-primary for some time yet; and ESAT, which had been coordinated outside Claude and "lost its way a bit", moves onto the maths template: coordination inside Claude, bulk content production outside where tokens are cheapest, everything crossing the boundary as data plus packets.

**Mechanism.** `OPERATING_MODEL.md`, new and on every seat's wake list: single-writer areas per seat (architect: engine, tests, tools, records; builders: exactly what their packet names; content seats: their own trees and never this repository; Smith: every push), per-seat git author strings (`Claude (ppq architect)`, `Claude builder (<consumer>)`), the inbox packet channel unchanged, and one release train per consumer with the suites as gates and Smith's push as the only publishing act.

**Trigger and disposition.** The trigger was the 2026-08-03 near-miss: Codex-tasked chats committed `f48abc3` and `a4891a2` into this repository under the maintainer's author name while the maintainer was mid-session in the same tree (details in `OPERATING_MODEL.md`). The work itself was reviewed this session and **adopted**: all engine additions are opt-in config (`presentation` block, `sourceAdvisoryOf`, `searchTermsOf`, `classificationLabels`, the record-resolvability readiness check), no deployed file was touched, and the full gate now passes at 2,292 assertions across the five suites, re-run from disk this session. The two Codex-side viewer workstreams are closed by Smith's brief (`CODEX_BRIEF_2026-08-03.md`); Codex retains ESAT analysis content: categorisation completion and exception reporting, damaged-record repair against the twelve suppressed IDs, and the remediation programme for the 674 provisional records.

---

## d022 (the deck serves what you have not met): unseen questions are the default pool, repeats are declared

**Decision (Smith, dictated 2026-08-03; "big and tricky to get right", so recorded fully before building).** The default serving order stays a shuffle, but the DECK it shuffles is the pool of questions the pupil has not met before. Changing any filter rebuilds the deck over the newly filtered pool, still excluding met questions by default. The pupil can switch pool, three options: **unseen only** (default); **unseen plus questions rated below 4** (met questions whose latest 1-6 self-rating was 3 or lower return to the deck); **all questions**. And whenever a previously-met question IS served, from any pool, it announces itself: "Met this before: got it right/wrong, rated N", from the latest attempt row.

**Build notes (engine-wide, every consumer).** "Met" means an attempt row exists for the record (answered, or marks entered, or markscheme revealed on a reveal-type question); a skipped question is not met. The pool is computed per storageKey from the attempts log, so it needs no new storage; the pool CHOICE persists in `store.prefs`. Exhausting the pool must say so plainly and offer the next pool rather than silently reshuffling repeats in. Interactions to hold: session history and "Review your last answer" (VF-03) operate on attempts regardless of pool; the Learned-so-far scope (d011) and syllabus default (d020) compose with the pool as intersections; the timing bank is indifferent. `practice_value` (maths L02) may later refine "all questions". Sequencing per Smith: ahead of the post-question redesign build; the examiner rendering (small, already ruled, data shipped) goes first.

---

## d023 (post-question feedback, redesign direction): first instinct first, three doors, detail behind them

**Direction (Smith, dictated 2026-08-03; mock-ups commissioned rather than a build, "so we could talk about it without ever having to build them").** The present post-question surface overloads one screen; pupils rate 1-6 and read little. The redesign starts from what a pupil actually wants to SAY first, three doors:

1. **"A silly mistake"** (the first instinct; "so annoying"): didn't read the question properly / mental arithmetic / algebra slip. Quick in, quick out.
2. **"Got the idea, couldn't get to the answer"**: opens the stuck-algebraically vocabulary (d012) and the "now you've seen it" ladder.
3. **"Didn't see what the question was about"**: opens the same ladder plus the question's own content elements.

The ladder under doors 2 and 3: I see it now / I sort of get it now / I don't really get it / I don't get it at all. The "how to do it" surface becomes a DEDICATED screen, viewable before or after the door detail: direct methods on one half, narrowing methods on the other, "used it" beside each, faster routes highlighted, with "did you find the quickest way?" as its question. Everyone, right or wrong, gets "Would you get a similar question right tomorrow?" (definitely / probably / maybe / probably not). Skipping past any of it is always allowed and never nagged.

Open for the mock-up conversation: one-thing-per-screen versus three-panels-on-one-screen (mocked both); where the methods screen sits in each; whether d019's mark-point ticking lives behind door 2 or stays its own opt-in reveal step (d019's build is paused until this conversation rules). Mock-ups: `mockups\feedback_redesign_2026-08-03.html`.

## d024 (a sign-in gate on every consumer): every pupil-facing driller is gated and pulses to the shared workbook

**Ruling (Smith, dictated 2026-08-06):** "we must put a sign-in gate in front of us, absolutely, and the economics, we need it on a sign-in gate." Answers q13 with option (a): wire IB Maths and Economics to the estate pulse now, accepting the sign-in gate, rather than waiting for Google sign-in.

**What it was answering.** Found while fixing the pulse transport: only `esat-compare.html` loaded `ppq-login.js` and handed the engine a report function, so the IB Maths driller had been published since 2026-07-29 sending no attempt data at all, and the new Economics wrapper sent none either. Reporting fires only for a signed-in pupil, so wiring the pulse necessarily means gating the site, which is why it was Smith's call rather than a defect to fix quietly.

**Built the same day.** Rather than hand-roll ESAT's 90-line gate a third and fourth time, `PPQLogin.mountGate()` now injects the whole thing (styles, markup, class dropdown populated before anything that can fail, sign-in, reveal), and the two new consumers use it in eight lines each. ESAT keeps its hand-rolled gate for now and can migrate on a later touch; `test_pulse.js` asserts every pupil-facing consumer loads the login, hands a report function to the mount, and carries its own project tag and its own cohort key, so a pupil's economics class can never overwrite their maths class and no consumer can quietly stop reporting. The IB Maths site assembler now ships `ppq-login.js` and fails loudly if it is missing, because a missing gate script opens the site ungated and silent, which is the exact state this decision ends.

**Standing consequence.** A new pupil-facing consumer is not finished until it is gated and reporting. The suite enumerates them, so adding one without wiring it fails the gate rather than shipping quietly.

**Still interim, and now three times over: q08.** ESAT, Maths and Economics each carry a hardcoded placeholder class list. That was tolerable for one consumer and is not for three; the real class source (or an explicit test-only mode) is the blocking item before any of this is used for real teacher tracking.

## d025 (I used AI on this one): AI-assisted work is coverage, not performance

**Direction (Smith, dictated 2026-08-17).** A small marker a pupil sets after a question to say they used AI on it. Recorded as direction, not built; the forks below need Smith before any of it is worth coding.

What he settled:

- **Using AI cuts you out of the reflection layer.** The post-question interrogation asks where *your* thinking went wrong. If AI did the thinking there is nothing to interrogate, and asking anyway teaches a pupil to invent an answer.
- **The 1-6 rating survives.** A pupil can still say how well they understand it.
- **It counts towards nothing.** No performance statistic, no last-10 dots, no weak-area chip.
- **It earns a BLUE coverage dot, and blue is the only thing that is ever blue.** The dashboard's coverage grid gains one new colour, reserved for "the only time you have met this was with AI". Coverage is a real and separate fact from performance, and this is the one place the distinction is worth a colour.
- **Blue is a state, not a record.** It reflects the MOST RECENT attempt on that item only. Do the item again unaided and the blue is superseded and ignored; the history stays but the dot stops being blue.

Open, and Smith's to rule:

1. **Reporting.** Smith's instinct was "default to not reporting". The architect's counter-argument, on the record because it is a disagreement: a teacher who can see "covered nineteen items, fourteen of them with AI" is being told something true and useful, and suppressing it makes the tracker quietly wrong about what a class has actually done. The distinction worth keeping is between *not counting towards performance* (agreed, absolutely) and *not being visible at all* (a different and probably worse thing). Proposal: exclude from every performance figure, report it as its own status.
2. **Does a later AI attempt turn a real dot blue?** "Most recent wins" says yes. Honest, and it does describe where a pupil is now, but it means an unaided success can be overwritten by a later assisted attempt, which will feel wrong to a pupil who is using AI to revise something they already know. The alternative is that blue is only ever a floor: it colours an item nothing else has coloured, and never displaces an unaided attempt.
3. **One reflection question may deserve to survive the cut-out.** Not the error taxonomy, which is about your own wrong turning, but the forward-looking one from d023 (post-question redesign): "would you get a similar question right tomorrow?" Using AI and then judging whether you could now do it alone is arguably the single most useful thing a pupil can be asked at that moment, and it is the one question the assistance does not answer for them.
4. **Scope.** Universal or maths-first? The problem is not subject-specific; ESAT, chemistry and economics pupils have the same access to the same tools. Recommend building it in the engine as an opt-in module so every consumer can switch it on.
5. **Wording, and not overloading Flag.** The existing Flag button means "come back to this", which is a different idea; this must not ride on it. The marker's own copy should be plain and unloaded, "I used AI on this one", not a confession.

The rating's MEANING shifts under the marker and the wording should shift with it: unaided it asks how that went, assisted it is closer to how well you understand it now. Worth one line of different copy rather than reusing the same prompt.

## d026 (two deployment shapes, one per subject): IB Physics gets its own site, Economics lives inside ibeconomics

**Ruling (Smith, 2026-08-17).** Physics past-paper questions get a site of their own, `ibphysicsppqs`. Economics does not: it lives inside the existing economics site, at `ibeconomics/ppqviewer`.

**Physics is a deliberate departure and Smith named it as one.** The earlier thinking was that physics past papers would only ever launch inside the individual physics drillers. They will still be attached to those drillers, but attachment takes time per driller, and a standalone site launches the whole corpus at once. So the order is: standalone first because it scales, attached afterwards as each driller is ready.

That refines d021 (multi-consumer operating model), which recorded the chemistry pattern (viewer as one module beside driller modules) as the expected shape of most future deployments. The shape is better understood as a SEQUENCE than a fixed choice: viewer-primary to launch, module later where a host app exists. Economics proves the other half of the same rule, because there a host site already exists, so the viewer slots straight in beside it.

**Economics is this project's first sub-path deployment**, and it is a genuinely different build target from the two live sites:

- Target is a subfolder of an existing published repo (`ibeconomics`, live at `physicalsmithness.github.io/ibeconomics/`, working copy on the Claude drive), not a repo root. The assembler writes `ppqviewer\` inside that working copy and must never touch anything else in it; Smith pushes the `ibeconomics` repo as a whole.
- Relative asset paths are unaffected: `assets/previews/...` resolves under `ppqviewer/` exactly as it does under a repo root.
- Analytics are NOT inherited. Each page on that site carries its own snippet (MetaProject's standing note on the economics site), so the viewer page needs its own, and which measurement ID it should carry is a question for Smith rather than a guess.
- The economics site has a house design system (`css\design-system.css`, with colour carrying fixed meaning across all 39 diagram pages). A pupil moving from a diagram to a past paper stays on one site, so whether the viewer wears that skin or its own is a real design question, not a detail.
- Same origin as the diagram pages means shared `localStorage`. Storage keys must be checked against whatever the diagrams and the Diagrammer already write.
- Both directions need a link, or nobody finds it: the economics site index to the viewer, and the viewer back.

**Still owed before either publishes:** the school-served content ruling for IB Economics and IB Physics past papers, the d014 (q12 resolved, publish approved) class of question. For economics it bites harder than it did for maths, because `ibeconomics` is an existing public site with its own traffic rather than a quiet new address.

## d027 (three physics deployments, not a topic split): one engine, three qualifications, three sites

**Ruling (Smith, 2026-08-17).** IB Physics, Trilogy GCSE and pre-IB past papers each get their own published site, off the one shared engine. Extends d026 (two deployment shapes), which named `ibphysicsppqs`.

**What was rejected, and why it matters.** Smith had considered splitting the viewers by question topic, matching the individual physics drillers, and ruled it out on time. The stronger reason, recorded so it is not revisited: the viewer already carries a topic axis as a filter, so a topic-split site is a filter with a release train bolted to it, multiplied by the number of topics, and the coverage dashboard gets *worse* because each pupil only ever sees a slice of their own record. One bank, good filters.

**Why qualification IS a legitimate split where topic is not.** Maths works as one site because it is one qualification across two syllabus generations, so a legacy question is still recognisably the pupil's subject. IB, Trilogy and pre-IB are three audiences. A Y10 pupil shown a bank that is mostly IB HL is looking at noise, and their progress page is dominated by things they will never sit. Three deployments cost almost nothing now (the assembler is parameterised; the second is a config file), which is exactly what would not be true of a topic split.

**The critical path is not the viewer.** Physics Categorisation holds its spine and its family and question-type masters but has no `viewer\` catalogue yet; Trilogy holds an extraction database and master workbook; pre-IB has no seat that could be found at all. Each wrapper is roughly a bounded-builder day once data lands. Whether this is one week or three is decided by whether those seats build to `CATALOGUE_CONTRACT.md` first time, as Economics did.

**Requirements packets issued 2026-08-27** to Physics Categorisation and Trilogy Categorisation (their inboxes; the Trilogy one also establishes the `inbox\` convention in that project). The pre-IB packet is held in `outbox\` because no pre-IB seat could be located, and it carries a prior question for Smith: whether "pre-IB past papers" means the school's own internal exams (different rights position, different pipeline) or IGCSE (in which case the corpus already exists under `Other boards GCSE Physics` and the seat is a sibling of Trilogy).

**Standing instruction from the same conversation:** keep it simple for physics now, but make **coverage display and misconception display configurable per consumer**, because both will develop. They become config hooks like `questionTypes` and `progressAxes` already are. Sequencing note: d025's blue AI-coverage dot is the first new coverage state anyone has asked for, so building the flexible coverage surface for d025 means physics inherits a proven seam rather than discovering it.

**Pointer carried into the packets rather than left to be rediscovered:** the estate's Error Taxonomy project holds `misconceptions_core.yaml` at estate level, elevated out of the IB Physics Overview precisely so misconceptions would not be reinvented per subject. Physics is the subject it was built from, so it is a prior answer to check before minting a parallel vocabulary.

## d028 (requirement roles and the topic/course/unit words): say what is NOT needed, and never infer it

**Ruling (Smith, dictated 2026-09-17).** Two rules, one about substance and one about words.

**Substance: the useful half of a multi-topic tag is the negative one.** Smith: "I prefer if you know the things that are not required, then that's the best." When a part carries physics from a second syllabus topic, the pupil's real question is whether they need that physics to answer. So a co-strand carries a ROLE, not just a name:

- **Required** means the second topic is assessed and the part is not answerable without it. Name it, and name it large enough to be a warning.
- **Not required** means the second topic is scenery, and the notice must name what can be ignored, e.g. "Not required: E3 scenery on an E1 notation question".

A notice that only says a part is "studied in two topics" makes the pupil do the work of deciding which case they are in. That is the `alsoStudied` panel shipped in build `e56bf638d0332e3e` (commit `4e6ee94`, "Main: … / Also: …"), and it is the thing this decision supersedes. Extends d027 (three physics deployments) only in its notice layer; no release scope changes.

**Words. The three are not interchangeable, and each is reserved.**

- **Topic** for a syllabus code inside the qualification the pupil is sitting. A1, A5, C1, D2, E1, E2, E3 are topics. The banner for the Required case is "Another topic needed", and it names which. This is the ordinary case, because a physics part reaching into more physics has not left the course.
- **Course** for a different programme: chemistry, maths, economics. `index.html`'s "Choose a course" and "Choose another course" are correct uses and stay.
- **Unit** for a teaching unit that is not a syllabus code. Not used by the viewer today; reserved so nobody reaches for it as a synonym.

The failure this fixes: a build described a second physics topic as "Other course needed", which tells an IB Physics pupil they have wandered into another subject when they have not.

**The viewer must not infer either the role or the ignore reason.** Roles are content-seat data, authored against the actual part, and they arrive through `CATALOGUE_CONTRACT.md` like every other tag. A viewer that guesses "required" from the presence of a topic code is inventing assessment advice. Where no reviewed role exists, the correct behaviour is to name the co-strand without a role, which is what ships today. Physics Categorisation has the first version of this vocabulary on branch `cursor/a5-e3-tagging-release-df79` (`masters/requirement_tags.json`, roles `assessed` / `not_required_scenery` plus a named ignore reason); adopting it is a catalogue-contract extension, not a viewer change, and the engine work is the notice layer only.

## d029 (HL/SL twins): show one printing, the learner's own, and say when it is the other

**Ruling (Smith, dictated 2026-09-17).** "You should only show one, and it should be native." A question printed in both the HL and the SL paper is one question, and a pupil meets it once.

**Which one.** The printing native to the learner's saved level. An HL learner gets the HL printing, an SL learner the SL printing. Where only the other level's printing is served, show that one and label it, because the difference is teaching content rather than a technicality: Smith, same dictation, "HLs need to know that the SL version is a slightly easier version." The label does the work the choice cannot.

**Why this is not an edge case.** Smith: "There are absolutely loads of those, and every year it's a set category HL/SL question you need to know." Measured in the live release `e56bf638d0332e3e`: **160 of 543 served parts sit in a cross-level pair**, 80 pairs, every group exactly two members. By topic, A.1 65, A.5 46, D.2 34, E.1 12, C.1 4. Collapsing takes the release from 543 printings to 463 distinct questions. Until it is done, roughly three parts in ten can come round twice, and every per-topic count on the chooser is inflated by the same amount.

**The key.** `source_group_id`, whose `ibchem_xlvl_` prefix is the content seat's own cross-level grouping. Every served group with more than one member spans both levels, so the key needs no heuristic on top. It is not complete: 2006 May P1 SL Q21 and HL Q26 are the same question at different numbers and the data files them as two singletons, so the key under-reports. Matching on year, paper and question number instead would be worse in both directions, because P1 SL Q1 and HL Q1 are usually different questions. Collapse what the key knows, and raise the misses with the seat rather than guessing. [raised 2026-09-21: Physics Categorisation inbox, `2026-09-21_from-ppqviewer_error-options-question-kind-and-a1-tag-faults.md`, ask 4: three known different-number twins and sixteen same-number candidates; 193 served parts keyed in 113 groups on build `fee35feac3a10a92`.]

**Where it belongs.** Selection, not presentation, because the pupil's level can change in session through preferences and the served set must follow. The existing "Original paper: HL" badge states the printing's level already; what d029 adds is that the pair collapses, and that an off-level printing says plainly what it is.

**What the release now guarantees, and why it is stricter than before (2026-09-18).** `test_ibphysics_release.js` asserted that a mounted page serves every cleared part. d029 makes that false for one learner, so the assertion was replaced rather than relaxed. Three parts: each level's view is exactly the collapse of the cleared set for that level; the two views together are exactly the cleared set, so a clearance-approved part can never be unreachable at both levels; and every cross-level pair splits, one printing per level, never both to one. Measured on build `e8c26fc4bfbc2db9`: HL 115, SL 115, union 138, 92 shared and 23 each way. Every printing also stays in `byId`, so a shared link opens either twin at either level. Relaxing the old assertion to 115 was considered and rejected: it is the only check standing between a release and silently dropping cleared content.

**Counts a pupil can click carry the reachable number.** A facet badge reading 8 that opens 5 questions is a lie about the click. Facet and group-dashboard counts therefore collapse; progress REPORT denominators stay on the whole bank, which is the line `_progressStats` already drew.

## d031 (named report reasons): name the fault for the pupil, because they cannot

**Ruling (Smith, dictated 2026-09-19).** "You have to remember that kids don't know what they don't know, and so they'll be more tentative from that. We need to invite them." One button leading to a dropdown asks a pupil to classify a fault they have no vocabulary for. Six named reasons, each stating the fault in the pupil's words, ask them only to recognise it.

**The reasons, in his wording.** About the question: *Wrong topic?* ("this question doesn't seem to belong in this unit at all"), *Wrong question type?* ("I think this question might be in the wrong group on the right"), *Q&A don't match?*, *Bad cropping?* ("cropping" is a word they know, so it is used). About the app, under its own heading: *Something broken?*, *Could be better?* ("if you think you can see what would improve this, say here").

**Two judgements on top of the dictation, both reversible.** "Question-answer is missing" was folded into *Bad cropping?* rather than made a seventh box, because a missing question or answer is what a bad crop produces and the pupil cannot tell the two apart. The question-side group carries no heading, since only the app side needs naming.

**Layout.** A box of small boxes, visually unlike the two single tools flanking it: *Ask your teacher* sends a message and *Draw* is a pencil, and all three looking alike is what made the strip unreadable. The lead line, "Please report to help this improve", sits to the LEFT of the grid, spending width rather than the height this strip does not have.

**Two ranks of detail.** A named reason already says what is wrong, so the first four invite *"Just press Send, or add more details below."* An app report is worthless without words, so those two say *"Give details below."* Declared per reason as `detail: "invite"` rather than hardcoded.

**The panel repeats what it covers.** Opening it hides the question, so it restates *Currently viewing <source>* and the filters in use, and captures both. Smith: "Even when you're doing general improvements, be clear. Currently viewing question blah blah. Put all the information that you have." A wrong-grouping report cannot be read without the filters that produced the grouping.

**Rejected:** an invitation line reading "tell us anything, even if you're not sure", as patronising. Drafts are kept per question AND reason, so a half-written crop report is not lost by opening another box. Consumers supplying no reasons keep the old button and dropdown untouched.

## d030 (a topic's practice is the parts it leads): a second strand is not a drill

**Ruling (Smith, dictated 2026-09-19).** Meeting 2012 May P3 SL QD1(b)(ii), a simultaneity question, inside A1 Kinematics practice: "It shouldn't be an A1 practice at all. It's completely miscategorized. The postulate of relativity is not part of A1. It's ridiculous."

**The rule.** A topic's practice pool is the parts that topic LEADS, `topic_codes[0]`. Where a topic is only a second strand, the part stays reachable through the topic that does lead it, and through a shared link, but it stops appearing in the other topic's drill. Implemented as a `valueOf` on the topic filter, so it is one consumer-side rule rather than an engine special case, with the chooser counting the same way.

**Size.** Nine parts in the whole release sat in a topic they did not lead: eight relativity parts inside A1, and one D2 part inside E1. Every other topic was already clean. A1 goes 117 to 109 and E1 49 to 48; nothing leaves the release. Two of the eight were the HL and SL printings of one question that d029 cannot pair, because they carry different question numbers (QD1 and QH1), so this removes a duplicate d029 could not see.

**Why the co-strand panel was not enough.** d028 made a multi-topic part name its main strand, and the 2026-09-14 over-claim audit treated that as closing the complaint. It did not. Smith raised the same fault three times across six days. Naming the main topic tells a pupil the part is misplaced; it does not stop it being served. Where the two disagree, the pool is the thing to fix.

**What the notice is FOR, restated by Smith in the same dictation, and not yet built.** The useful direction is the demand, not the membership. Inside A5 you are not surprised the part is A5; you chose it. You are surprised that it also needs something else, and the weight of that notice should scale with the demand: "requires A1" is mild, because everyone has done A1, while "requires E4" is a warning and should be bold. The current wording states membership flatly in both directions. Folding that into d028's Required / Not required roles is outstanding.

**The tag itself is also wrong, and that is not ours.** Smith: "I understand somewhat where someone is thinking about when they do that, but really they shouldn't be thinking about it." A1 as a second strand on a relativity part is a categorisation fault, and d030 only stops the viewer acting on it. Raise the eight with Physics Categorisation rather than leaving the viewer to compensate forever. [raised 2026-09-21, with the D2/E1 Q40 part and the d028 role ask: Physics Categorisation inbox, `2026-09-21_from-ppqviewer_error-options-question-kind-and-a1-tag-faults.md`, ask 3.]

**Collapse AFTER filtering, never before.** Found by the new release check on its first run. Collapsing the whole bundle and then filtering is not the same operation as filtering and then collapsing: where a pair's two printings carry different topic tags, the global collapse can drop the printing inside the topic and keep the one outside it, so the badge undercounts a view that still holds the part. `filterQuestions` filters then collapses, and every count that must agree with it has to do the same.

**Related, and separate (Smith, same dictation).** He corrected my reading that repeated fusion questions were a duplication complaint: "Another fusion question is not the issue. The issue is just not a great question to be giving people." That is the selection-quality problem also raised by 2017 Nov P2 Q2(d) being offered as practice for D2.1a, where the charge-sign reasoning is incidental to a six-part satellite-tether question with three pages of context. Correct tag, poor practice item. Ranking a type's practice set by how directly a part exercises it, and by how much context it costs to reach, is its own job and does not belong in d029.

## d032 (a wide crop stays served, with a notice that names the part to answer): proven per picture, and it expires by itself

**Ruling (Smith, 2026-09-22, option (b) of three).** The question crops the seat measured as top-anchored bands (a later sub-part's picture contains the earlier sub-part in full, so a pupil answers (b)(i) and is marked against (b)(ii)) stay served until the crop repair lands, each with a notice: *"This picture also shows part (b)(i). Answer part (b)(ii) only."* Holding them was rejected because it would have cost A5 25 of its 138 parts; leaving them was the fault Smith found in live use on 17 September.

**Sized on the release, not the corpus.** Physics Categorisation's geometry pass (`returns\QUESTION_CROP_BAND_GEOMETRY_2026-09-21`) could not say how many *served* parts were affected. Joining its screens to build `fee35feac3a10a92` through the clearance fingerprints: 58 of 543 served parts carried a flagged picture (44 band, 14 equal-height twin candidates). Tested on the pixels by `tools\build_ib_crop_notices.py`: **44 are proven** (the later crop's top band is byte-identical to the earlier crop, mean difference 0.0 on every one), 5 are real growth, 2 cannot be tested because the seat's tightest-run pick put the two crops on different pages, and all 14 twin candidates are different pictures that merely share a height. So the notice list is 44, a verdict, not the 87% screen. By lead topic: A.5 19, A.1 9, D.2 9, E.2 4, E.1 2, C.1 1.

**How it is built so nobody has to remember to remove it.** `reports\ib-crop-notices.json` records each proven case with the sha256 of the faulty served picture. The assembler attaches `crop_notes` to a part only while that exact picture is what it serves, so when the seat's repair changes the crop the hash changes and the notice drops without a decision. The public record carries only the two part labels and the kind; source paths stay in `reports\`. The release suite asserts that every proven notice for a served picture is carried, that no part carries a notice its picture was not proven for, and that the warning renders above the picture. Consumers supplying no `crop_notes` render nothing.

**Not a repair.** The seat's repair (page renders and per-part geometry) is still the fix and is second in its queue behind `qtype` and the A.1 rulings, by Smith's priority ruling of the same day. The pupil report of 14 September (`10N.P3.SL.TZ0.QD1(c)`) is in neither measured class and is named to the seat for the repair pass to look at first.

## d033 (got it then, get it now, and what went wrong in the marking's shape): direction, the sweep requested

**Direction (Smith, dictated 2026-09-19 and clarified 2026-09-21 and 22; not built).** After a question the pupil answers two scales in marks, then, if understanding is short, says what went wrong. Recorded as direction with the open points marked, on the d025 pattern, because the vocabulary comes from a sweep that has been requested rather than from this project.

- **Got it then.** How many marks would you have got, 0 to full (the existing marks bar), plus exactly one answer that is not a mark: *"Not applicable: AI or someone else's intelligence helped me."* That attempt counts towards no performance figure and earns no got-it-then coverage.
- **Get it now.** How many marks do you understand now, on the same row style beneath. Prefilled to full when got-it-then is full, and it can be reduced: the invitation is *"actually I don't get it, even though I wrote it right."* An AI-helped attempt still answers it and **earns a coverage mark for it**: "that's the payoff for being honest." This is d025's open point 3 answered: the one reflection that survives the cut-out is this scale, in marks rather than as a question. Smith: "It's the invitation that they do get a coverage mark for."
- **What went wrong.** A side panel, opening when get-it-now is short of full and openable otherwise. Organised along the lines of Smith's marking, in three tiers the pupil is invited into, **major errors, medium errors, annoying errors**, with non-calculation questions getting their own kind of options; the options shown depend on the kind of question. Each option carries a tick beside it, *understand it now?*, prefilled from the scales. The list he dictated was "a feel for things and a feel for how things might be phrased", not the list; the list is "all the things I normally use in my marking, and then all the things that could be said once it's properly marked": his 83 marking categories (`Physics Categorisation\masters\lost_mark_categories.csv`, whose tiers are the Lost Marks Viewer severity axis in `misconceptions_core.yaml`) and a per-question sweep, packeted to Physics Categorisation on 2026-09-21 (`qtype` per served part; option layers by kind, type and part; every option tagged with his marking category so the tier is one table on this side, owned by Smith).
- **Tier membership as read from a garbled sentence, to be corrected in one line if wrong.** Major: couldn't find what to equate; wrong equation from elsewhere; wrong equation from this topic; a made-up equation ("they use the wrong thing rather than they weren't sure": the "not sure it's even a formula" in the first dictation was a mishearing); wrong kind of number (SubK). Medium: SubP, the wrong particular number "but at least it's a force"; a force missed from F = ma; an energy missed from the balance; vector and sign slips in substitution. Annoying: algebra slips, stuck on the algebra (Smith would like it medium and leaves it annoying), prefixes and conversions, care and calculation slips, rounding, left as a fraction, units. Non-calculation: hadn't learned the definition, had the concept a bit wrong or not precise enough, actually had this wrong, not sure I would have drawn that graph well enough, had the rough idea but wasn't solid, really didn't understand.
- **Wording.** Pupil voice, warm where warmth is needed, never patronising; product copy in Smith's voice under the constitution's rules.
- **Reporting.** The breakdown shows both scales per row as percentages, *50% got it then, 90% get it now*, mark-weighted, on the last attempt per question by default with a switch to include every attempt. The model is Special Relativity's coverage page, which already carries the latest/all switch and reads this viewer's store directly, so get-it-now becomes a second percentage column there once the attempt row carries the field. All of it reaches the teacher view.

**Open.** The six-level C rating: Smith's "maybe we just sort of highlight 4, 5, 6 … one last thing to say about it" is read as keeping the rating after the scales as a shakiness gloss (levels 4 to 6 only) and is unconfirmed. Where the panel sits (the right-hand column is the candidate). The exact option lists per kind, which arrive with the sweep. Nothing of this is built; the request that unblocks it is out.
