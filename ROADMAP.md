# ppqviewer roadmap

Last audited: 2026-07-28  
Maintainer: Claude  
Current public ESAT release: **v0.2.15**, build `b778d4c0d9c2`

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
- [ ] Add canonical analysis-ID support to question finding.

Exit: a pupil can report a problem centrally, revisit previous work and inspect
their own learning record.

## Phase 3 — reflection model

- [ ] Add optional before/after self-assessment.
- [ ] Add the configurable generic error-taxonomy layer with free-text escape.
- [ ] Extend reviewer provenance when authoritative hashes/pass history are
  supplied.
- [ ] Review whether feedback-readiness filters are useful after real use.

## Phase 4 — timing system — **NEXT (Smith priority, 2026-07-29)**

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
  → first publish (enable GitHub Pages on the repo at that point).
  Includes d011 (learned scope): nested tri-state tick tree over the syllabus
  spine, filters default to within-learned, master toggle, unlearned greyed.
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
