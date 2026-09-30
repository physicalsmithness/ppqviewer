# ppqviewer roadmap

Physics onboarding update (2026-09-10): a local preview now covers all nine of
Patrick's requested areas using the shared engine. All 2026 exam papers are
reserved for mocks. Known and possible test matches are withheld, including
whole parents and linked duplicates; remaining scanned/rewritten test items
must be reconciled before pupil release. D2 and the reviewed 4SS0 Pre-IB
forces starter set are connected. Run/status details: `PHYSICS_PREVIEW.md`.

Last audited: 2026-07-30 (Claude takeover audit)  
Maintainer: Claude  
Current public ESAT release: **v0.2.17** (checkout synced + pushed 2026-07-29;
public build-identity verification still owed, Phase 1)  
IB Maths driller: **published 2026-07-29** (d014 (school-use publish)); full
asset set incl. complete ms pages pushed; Pages-serving browser check owed

Read `CLAUDE_HANDOFF_2026-07-28.md` first. It contains the evidence, exact
requirements and known affected question IDs.

A task is complete only when its canonical source is changed, regression tests
pass, the assembled site is visually checked, and the exact intended build is
served publicly. Authored, schema-valid, reviewed, bundled, deployed,
user-reviewed and pupil-tested are separate states.

## Current public baseline

| State | Count |
| --- | ---: |
| Public catalogue | 1,042 |
| Maths/Physics scope | 738 |
| Full feedback | 46 |
| Provisional feedback | 674 |
| Solution pending | 18 |
| Deep-v2 records | 720 |
| Multi-label classifications | 738 |
| Viewer regression assertions | 281 passed, 0 failed |

The 18 pending questions have validated historical launch cards, but those cards
are held, absent from the bundle and not loaded. The public viewer correctly
shows Solution pending. Do not use the old 46/692/0 roadmap figures.

## Phase 1 — release safety

- [x] Add invalid/withheld analysis state and safe generic fallback.
  _(2026-07-28, engine v0.4.0: `contentSafety` config + `_contentSafety` gate;
  withheld renders the generic shell, badge says Solution pending, `?review`
  shows the reason.)_
- [x] Suppress the known damaged records until repaired. _(Twelve are pinned in
  `example\esat-compare.html`: the RS-01 five plus seven deterministic
  viewer-release findings. Questions remain playable; only damaged guided
  explanation content is suppressed.)_
- [x] Test readiness precedence: unsafe or missing content cannot show Full or
  Provisional. _(2026-07-28: `test/test_content_safety.js`, 70 assertions, a
  sync publish gate; 281-suite still green. Post-gate public estate:
  Full 41 / Provisional 672 / Withheld 7 / Pending 18.)_
- [x] Add damaged-notation checks to the release path. _(Deterministic scan in
  the engine at render time and swept across the full bundle by the safety
  suite on every sync. Placeholder/missing-value patterns still wanted once
  real examples exist — kept below.)_
- [x] Add unreplaced-placeholder and missing-value/unit checks. _(The release
  scan covers narrow-space missing values/units, authoring placeholders and the
  earlier damaged-notation signatures across all 720 records.)_
- [x] Remove, isolate or prove unreachable the legacy pill/strikethrough option
  presentation (VSAFE-03). _(2026-07-28, v0.5.0: pill CSS deleted; legacy
  eliminations render through the deep-v2 letter rail; suite asserts no pill
  classes or struck-through text can return.)_
- [x] Run representative desktop and 320 px interaction checks on the exact
  assembled integration preview. _(2026-08-03: local-only build
  `f13c2ea7d3657643`; eight-question benchmark checked at 1280 x 900 and
  320 x 800 with no horizontal overflow, undersized visible controls or browser
  errors. This is release preparation only; it was not deployed.)_
- [ ] Verify the exact public build and asset identities after deployment.

Exit: unsafe content cannot render and every readiness badge describes the
content actually resolved by the viewer.

## Phase 1.5 — analysis readability (Smith, 2026-07-28, priority)

Smith's live-use verdict, dictated: the analysis pop-up is "mainly unreadable";
text is too cramped, and the self-report questions are separated from the
content they ask about.

- [x] Open up the typography: line spacing/density in the interrogation pop-up
  so it reads in one pass. _(2026-07-28, v0.4.1: ~1rem body, 1.6+ leading,
  doubled step spacing, bigger tap targets, more air between cards.)_
- [x] Put each response control directly beside the thing it asks about.
  _(2026-07-28: explicit "Yes, I did / No, I didn't" ask at the FOOT of each
  method; authored prompts render as the joined continuation of their method
  card; same event grammar.)_
- [x] Reword the viewer-chrome asks to plain English ("Did you use this
  route?" etc.). _(Authored prompt prose is analysis-side; if a pupil-voice
  rewording pass is wanted there, it goes through Codex.)_
- [ ] Regression coverage landed (294-assertion suite); Smith's desktop/mobile
  visual pass on a long-maths question still owed (fold into the Phase 1
  visual checks above).

## Phase 2 — feedback and useful history

- [ ] Implement the central feedback submission after confirming its endpoint,
  owner and data contract.
- [x] Add stable attempted-question history and reopen-analysis behaviour in
  ordered and shuffled modes. _(2026-07-29, v0.6.0: Previous walks the
  attempted-session history reshuffle-proof; "Review your last answer" reopens
  verdict/declaration/reflection/rating on the original attempt id with no
  duplicate events.)_
- [x] Turn Flag into a real persisted flagged-question list; remove the false
  “we'll bring more like this” promise until recommendations exist.
  _(2026-07-28, v0.5.0: persisted `store.flags`, header Flagged (n) filter,
  unflag, honest copy. Reopening the ANALYSIS of a flagged attempt rides on
  the history item below.)_
- [x] Build the first pupil analysis page over attempts, ratings, guesses, time,
  flags, prompts and reflections. _(2026-07-29, v0.7.0: "My progress" page,
  house-style shaded tables, drill-down reopening the exact attempt;
  interrogation responses now persist onto attempt rows.)_
- [x] VF-14 (Smith 2026-07-29): performance and filters by many more category
  axes, each row with its P-SLI-LAST10DOTS bundle. _(v0.10.0: `progressAxes`
  config; IB Maths adds type/theme/command filters + seven axes; ESAT adds
  four axes.)_
- [ ] Add canonical analysis-ID support to question finding.
- [ ] **d022 (unseen-first deck): the next ENGINE build, after the maths
  examiner work.** Default pool excludes met questions; three pool options
  (unseen / unseen + rated below 4 / all); any served repeat announces
  "Met this before: right/wrong, rated N". Full spec in d022. Smith,
  2026-08-03: higher priority than the post-question redesign, "big and
  tricky to get right".
- [ ] d023 (post-question feedback redesign): mock-ups delivered 2026-08-03
  (`mockups\feedback_redesign_2026-08-03.html`); the build waits on Smith's
  read of them. d019's ticking build is paused into this conversation.

Exit: a pupil can report a problem centrally, revisit previous work and inspect
their own learning record.

## Phase 3 — reflection model

- [ ] Add optional before/after self-assessment.
  _(Now specified as d033 (got it then, get it now) with d025 (I used AI on
  this one): the marks row gains one non-mark answer, "Not applicable: AI or
  someone else's intelligence helped me", excluded from every performance
  figure; a second row, "how many marks do you understand now", which an
  assisted attempt still answers and which earns it a coverage mark. Neither
  scale needs the Physics Categorisation sweep; only the what-went-wrong
  panel waits on that seat's ask 2 (error-option sidecar, not started as of
  2026-09-22). Engine opt-in, physics first. Recorded here 2026-09-23 because
  the direction had lived only in DECISIONS and was being lost.)_
  **Built 2026-09-29, landed in source 2026-09-30** (after the chemistry and
  mastery-jump work was committed as `343cfa9`): marks questions only (MCQs
  open), IB on, `test/test_understanding_scales.js` (11 journeys) plus the
  affected suites green. Not in any build yet; it rides the one train of
  Smith's 2a ruling.
- [ ] Add the configurable generic error-taxonomy layer with free-text escape.
  _(d012 (marks self-assessment) built this for marks questions, maths-first;
  what remains open is ESAT/MCQ adoption, and Smith's recorded d012 direction
  questions — whether categorising every error earns its keep, per-mark
  "did you miss it?", chem/physics transfer. Techniques axis is the awaited
  input.)_
- [ ] Extend reviewer provenance when authoritative hashes/pass history are
  supplied.
- [ ] Review whether feedback-readiness filters are useful after real use.

## Phase 4 — timing system — BUILT 2026-07-29 (d013 (timing axes) + VF-04r/r2/r3)

Spec sources, to be built together as one bounded feature: the handoff's VF-04
list below, plus the ESAT architecture packet
`inbox\2026-06-29_from-esat_timing-and-timer.md` (five modes: none / end-only /
per-question / sweep clock / TIME BANK; per-section uniform target seeding,
never difficulty-based up front; per-learner extra-time multiplier; silent
capture always on; analytics joined to the interrogation layer). Confirm the
pacing/extra-time config shape back to `ESAT Prep App\inbox\` as part of the
build.

- [x] Build the timing-preference screen: off/background, number, ring/pie and
  time-bank modes. _(2026-07-29, v0.9.0/d013: six modes incl. end-only and
  per-question reveal; Timing panel in the header.)_
- [x] Support extra-time and optional negative practice adjustments.
  _(25/50/custom %, negative allowed; a learner preference, not config.)_
- [x] Add pause and per-question “Don't keep a record of the time for this
  one.” _(Both live in the timing row; discard yields time_ms null.)_
- [x] Exclude analysis/reflection time automatically. _(By construction: the
  clock commits at answer / markscheme reveal.)_
- [x] Implement bank/deficit display across remaining questions. _(Bank runs
  ± and shows deficit; session summary in the panel.)_
- [x] Add accessibility, persistence and regression coverage. _(Reduced-motion
  ring fallback; per-device prefs; 27 new suite assertions.)_

Do not infer guessing from time. _(Stated in d013 and asserted by the suite.)_

## Phase 5 — launch polish

- [ ] Remove comparison-copy branding.
- [ ] Replace the interim class list with the real class source or an explicit
  test-only mode.
- [ ] Normalise classification boundary metadata and vocabulary aliases.
- [ ] Decide whether any launch-card layer remains supported; prefer deep-v2
  migration while the 18 records remain pending.

## Later shared-platform work

- [ ] **Google sign-in — EXPEDITED, medium term (d014, Smith 2026-07-29).**
  Identity for the published IB Maths driller (and then every consumer):
  supersedes the light honour sign-in as the plan of record. Needs an auth
  decision (Firebase/GIS vs backend) — ties into q07/q08 rather than another
  bespoke layer.
- [ ] Assistance module with pupil/class/all visibility.
- [ ] Real identity/class membership backend.
- [ ] Cross-consumer teacher analytics.
- [x] Chemistry shared-engine migration. **Published and publicly verified,
  2026-09-27:** 2,465 parts with originals, unchanged IDs and preserved ratings;
  SL/HL/Test identity; original 72 left data-analysis mastery groups retained.
  Old `ppq.html` links redirect to `chemistrydriller/ppqviewer/`. Build
  `2026-09-27T14-38-55-510Z_ad41d9e4`; 59 public files matched the release.
  Authority and same-bank scope: `CHEMISTRY_RELEASE.md`. Further feature
  comparison: `CHEMISTRY_FEATURE_GAPS.md`; preserve the split dashboards.
- [ ] Special Relativity embed.
- [ ] **Next IB train (Smith's 2a, 2026-09-29):** the twin key (Physics
  Categorisation d085, 38 merges), the type list grouped under and led by its
  code, the report strip spread, d033's scales, and d035 (nothing served that
  needs a topic not yet met; Smith 2026-09-30). **Not yet on any train:** A.2 as
  a seventh topic (1,372 servable parts delivered by instinctivelymechanical
  2026-09-29; Smith ruled it opens on `ibphysicsppqs`), and the A1 v004 import
  (accepted in the teacher bank by 13 September, never imported).
- [ ] IB Physics, Trilogy Physics and pre-IB Physics adapters. IB Physics published
  2026-09-13. **Trilogy Physics staged for publication 2026-09-15** (build
  `a8e2add2b62997e0`, 526 files in the checkout, 18-check gate green): the exclusion
  review is certified and scope-enforced, the AQA publication ruling was granted that
  day on the IB Maths terms, and the site is gated on the real Trilogy class list,
  which closes q08 for this subject. Smith commits and pushes. See
  TRILOGY_RELEASE.md. Pre-IB still has no seat; it inherits the same release train
  and gets year bands by declaring them.
- [x] **Economics adapter — WRAPPED 2026-08-06, not published.** The content
  seat delivered `economics_catalogue.js` (1,021 records, 3,498 parts) on
  2026-08-03; the wrapper and its 91-assertion suite were built by the first
  bounded builder dispatch (`dispatch\2026-08-06_builder_economics-wrapper.md`)
  with no engine change. Remaining, in order: the seat's data asks (unit and
  topic names, real `part_id`s, marks for 127 part records, narrowed
  `marking_differs`); the essay criteria checklist, deliberately paused into
  d023 (post-question redesign) so economics criteria and maths mark-point
  ticking land as one surface; then publication, which needs Smith for the
  deploy repository name and the school-served content ruling (the d014
  question), plus the estate web kit's analytics and feedback widget.
  Unverified in the build: the timing rates (180 / 157.5 / 105 seconds per
  mark, taken from the IB assessment outline and corroborated by nothing in
  the corpus). Timing is off by default; confirm before it is ever defaulted
  on.
- [ ] **IB Maths adapter — ACTIVE (Smith, 2026-07-29).** Source:
  `PaperDatabases\Maths Categorisation` masters + AAHL flat export + previews.
  Profile: chemistry-style reveal-markscheme + examiner comments (no authored
  how-to yet), keeping timing and guess-probability machinery. Deploy:
  `deploy\ibmathsdriller` checkout of github.com/physicalsmithness/ibmathsdriller.
  Steps: catalogue builder → wrapper + config → local visual pass → sync script
  → first publish — ALL DONE. Published 2026-07-29: assets committed 12:57
  (12,585 files incl. 5,633 complete ms pages), final v0.13.0/v0.1.1 assembly
  committed 19:09, origin up to date. Owed: confirm Pages serves it in a
  browser (GA4 then starts watching per d014).
  Includes d011 (learned scope): nested tri-state tick tree over the syllabus
  spine, filters default to within-learned, master toggle, unlearned greyed.
  - [x] d011 BUILT (2026-07-29, v0.12.0): Learned so far button + tri-state
    tree panel (topic → topic-part → item from the observed AA codes), scope
    filtering with empty-set pass-through, look-ahead toggle, greyed dashboard
    groups. Maths only per Smith.
  - [ ] SL/HL level declaration (Smith + AA guide, 2026-07-29): restricts the
    tree to SL codes, switches pacing to the SL outline (90 min/80 marks),
    notes per-paper question-type differences. Guides preserved:
    `Maths Categorisation\reference\IB Maths AA Guide (Smith upload…).pdf`;
    Chemistry + Physics 2025 guides in `PaperDatabases\reference guides\` for
    their future consumers.
  - [x] Item-label prose for the tree. _(2026-07-29: generated viewer-side
    from the syllabus spine into `example\ibmaths_spine_labels.js`. The seat
    then shipped authoritative names in the catalogue: `meta.code_names`
    (135) + `meta.item_content` (275), packet 2026-07-29. Adopt with fault-4:
    catalogue names win, generator fills gaps; student surfaces show name
    first, code secondary.)_
  - [x] **fault-4 part navigation with per-part marks — BUILT 2026-07-30**
    (d016 (part-by-part from chemistry), engine v0.14.0, ibmaths v0.2.0).
    Records became markable units, so chemistry's `structuredPaper` navigator
    (in the engine since Phase 3, never switched on here) now supplies the
    part chips with their marks, the "you are here" whole-question view and
    the part-by-part toggle; marks entry is sized to the part. 1,459 of 2,195
    questions get part-level marks; the 2004-07 structural-loss era stays
    question-level per the seat's rules and flips when their Phase-2 mark
    reconstruction lands. Markscheme pages narrowed from whole papers (mean
    19, from the cover) to the question's own pages (mean 7.1). Capability
    parity is now asserted by the suite, so no future consumer can quietly
    decline a capability the engine already carries.
  - [ ] Fault-2 residue: the per-part "show the full printed page" toggle.
    The unit shape now makes this small; `pages` ship per part.
  - [x] Adopt the seat's `meta.code_names` + `meta.item_content`. _(d017,
    2026-07-30 night: lookup order fixed, all 82 observed topic-parts named,
    name first and code second, across filters, facet, progress axis, weak-area
    chips and the Learned tree.)_
  - [x] Adopt the seat's `ms_pages_this_question` / `ms_crop_adequacy`.
    _(d017: mean pages shown 19.0 → 2.9; thin crops open their pages unasked
    and say why; whole document one click deeper.)_
  - [x] **Examiner reports, default-on — BUILT 2026-08-03 night** (seat
    packets 2026-08-03; Smith's ruling recorded their side; B(a) first item).
    No engine change needed: the maths reveal path already fires the
    `examinerOf` panel. The config now maps `examiner_comment` with the
    part's own commentary leading on a part unit and the whole-question
    comment one click deeper, `examiner_match_note` as quiet provenance, and
    `meta.paper_reports` (general / difficult / well-prepared) as a closed
    details block. Suite: five new assertions, 647/647.
  - [x] Consume the three 08-03 packets: `[figure]`/`[graph]` token cleaned
    (suite-asserted it can never reach a pupil), blank-mark absorption GATED
    on the roman-gap signature (126 corrupt-label questions stay
    question-level until X03), `aa_codes_today` routing adopted with the MHL
    heuristic demoted to fallback for the 460 provisional, `practice_value`
    carried. _(2026-08-03 night; presentation suite 642/642.)_
  - [ ] **PAUSED into d023 (post-question redesign) — mark-point ticking as an
    OPT-IN mode (d017, Smith ruled (b); d019 ruled build-then-judge).**
    `markpoints` on 6,207 parts, `markpoint_routes` on 1,195. Routes are
    exclusive (choose a route, tick within it); `AG` means the answer was
    printed, so render that claim differently; bracketed `(M1)` are implied
    marks, which is what the "maybe" tick state is for. Must write the same
    attempt row as the marks bar so promotion to default is a config change.
    Keep it light: it may not add a step to the ordinary path.
  - [ ] Trailing □ answer-box runs still print in extracted text (they are
    OCR'd answer boxes). Strip as furniture; per d015 the text itself stays
    even when it duplicates the stem.
  - [ ] 99 records still present 10+ marks as one bar (structural-loss era);
    1,485 records still show a whole-paper markscheme (crop-less papers).
    Both are seat-side data asks, packeted 2026-07-30.
  - [ ] Family vocabulary 26→28 (two mega-families split into four
    daughters) is already flowing data-driven; on next touch, check no stored
    filter preference pins a retired family name ("Select, substitute,
    finish" / "Cross the representation bridge") and silently empties a
    filter.
- [ ] Final shared-hosted-script versus vendored-copy decision.

## Implemented foundation

- [x] Shared mountable engine and subject config model.
- [x] Drawing, keyboard navigation, question types and structured papers.
- [x] Estate reporting pulse and lightweight identity.
- [x] Guess-before-verdict flow with candidate sets and optional percentages.
- [x] Generic feedback shell for every question.
- [x] Deep-v2 pupil/reviewer separation and conditional diagnostics.
- [x] Full option-evidence rail and seven relationships.
- [x] Things-used knowledge states and free-text reflection.
- [x] Full/provisional/pending badge based on resolvable content.
- [x] Maths + Physics, In spec and Shuffle defaults.
- [x] Source/year/topic/subtopic filters and human-readable question finder.
- [x] Multi-label classification hierarchy and response jump/flash.
- [x] Top Previous button, minimisable analysis and responsive CSS.
- [x] Repeatable sync/assembly and public deployment checkout.

— Codex audit for Claude, 2026-07-28
