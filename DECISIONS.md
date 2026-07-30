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
