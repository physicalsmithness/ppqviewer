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

- [ ] Add invalid/withheld analysis state and safe generic fallback.
- [ ] Suppress the five known damaged records until repaired.
- [ ] Test readiness precedence: unsafe or missing content cannot show Full or
  Provisional.
- [ ] Add damaged-notation/placeholder checks to the release path.
- [ ] Remove, isolate or prove unreachable the legacy pill/strikethrough option
  presentation.
- [ ] Run representative desktop and 320 px interaction checks.
- [ ] Verify the exact public build and asset identities after deployment.

Exit: unsafe content cannot render and every readiness badge describes the
content actually resolved by the viewer.

## Phase 2 — feedback and useful history

- [ ] Implement the central feedback submission after confirming its endpoint,
  owner and data contract.
- [ ] Add stable attempted-question history and reopen-analysis behaviour in
  ordered and shuffled modes.
- [ ] Turn Flag into a real persisted flagged-question list; remove the false
  “we'll bring more like this” promise until recommendations exist.
- [ ] Build the first pupil analysis page over attempts, ratings, guesses, time,
  flags, prompts and reflections.
- [ ] Add canonical analysis-ID support to question finding.

Exit: a pupil can report a problem centrally, revisit previous work and inspect
their own learning record.

## Phase 3 — reflection model

- [ ] Add optional before/after self-assessment.
- [ ] Add the configurable generic error-taxonomy layer with free-text escape.
- [ ] Extend reviewer provenance when authoritative hashes/pass history are
  supplied.
- [ ] Review whether feedback-readiness filters are useful after real use.

## Phase 4 — timing system

- [ ] Build the timing-preference screen: off/background, number, ring/pie and
  time-bank modes.
- [ ] Support extra-time and optional negative practice adjustments.
- [ ] Add pause and per-question “Don't keep a record of the time for this one.”
- [ ] Exclude analysis/reflection time automatically.
- [ ] Implement bank/deficit display across remaining questions.
- [ ] Add accessibility, persistence and regression coverage.

Do not infer guessing from time.

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
- [ ] IB Physics, Economics, Maths, Trilogy Physics and pre-IB Physics adapters.
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
