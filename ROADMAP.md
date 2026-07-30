# ppqviewer roadmap

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
- [x] Suppress the known damaged records until repaired. _(Seven, not five: the
  damage scan found `esat_engaa_2019_s1_Q12` and `esat_nsaa_2019_s1_Q30` beyond
  the RS-01 list; all pinned in `example\esat-compare.html`, reported to Codex
  in `analysis_v2\VIEWER_DAMAGE_REPORT_2026-07-28.md`.)_
- [x] Test readiness precedence: unsafe or missing content cannot show Full or
  Provisional. _(2026-07-28: `test/test_content_safety.js`, 70 assertions, a
  sync publish gate; 281-suite still green. Post-gate public estate:
  Full 41 / Provisional 672 / Withheld 7 / Pending 18.)_
- [x] Add damaged-notation checks to the release path. _(Deterministic scan in
  the engine at render time and swept across the full bundle by the safety
  suite on every sync. Placeholder/missing-value patterns still wanted once
  real examples exist — kept below.)_
- [ ] Add unreplaced-placeholder and missing-value/unit checks when the
  analysis project can characterise them (VSAFE-04 residue).
- [x] Remove, isolate or prove unreachable the legacy pill/strikethrough option
  presentation (VSAFE-03). _(2026-07-28, v0.5.0: pill CSS deleted; legacy
  eliminations render through the deep-v2 letter rail; suite asserts no pill
  classes or struck-through text can return.)_
- [ ] Run representative desktop and 320 px interaction checks.
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

Exit: a pupil can report a problem centrally, revisit previous work and inspect
their own learning record.

## Phase 3 — reflection model

- [ ] Add optional before/after self-assessment.
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
- [ ] Chemistry shared-engine migration.
- [ ] Special Relativity embed.
- [ ] IB Physics, Economics, Trilogy Physics and pre-IB Physics adapters.
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
  - [ ] **NEXT — mark-point ticking as an OPT-IN mode (d017, Smith ruled (b)).**
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
