# ppqviewer handoff to Claude — 2026-07-28

Claude is the viewer maintainer from this handoff. Codex retains planning and
analysis-content coordination in `PaperDatabases`, but viewer code, interaction,
deployment preparation and viewer documentation return to Claude.

Read this file first, then `ROADMAP.md`. Historical chat exports, `KICKOFF.md`
and older roadmap entries explain decisions but are not current task state.

## Exact authority

| Concern | Authority |
| --- | --- |
| Viewer engine | `engine\ppqviewer.js`, `engine\ppqviewer.css` |
| ESAT wrapper | `example\esat-compare.html`, `example\ppq-login.js` |
| Generated local site | `dist\esat-compare` |
| Versioned Pages checkout | `deploy\esatwallop` |
| Analysis source | `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\data` |
| Analysis bundle | `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\dist\esat_analysis_v2.js` |
| Classification bundle | `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\dist\esat_classification.js` |
| Analysis project control | `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2\PROJECT_CONTROL_2026-07-28.md` |
| Repeatable assembly | `SYNC_ESAT_WEBSITE.cmd` |

The viewer source folder has an empty `.git` directory and is not a usable
repository. The deployment checkout is versioned. Establish a recoverable
source checkpoint before material viewer changes; do not treat the empty source
`.git` as history.

## Live baseline verified on 2026-07-28

- Public page: `https://physicalsmithness.github.io/esatwallop/`
- Visible release: ppqviewer v0.2.15, build `b778d4c0d9c2`
- Public catalogue: 1,042 questions
- Maths/Physics scope: 738 = 613 in spec + 125 out of spec
- Question-specific deep-v2 feedback: 720
- Status actually resolved by the public viewer:
  - 46 `Full feedback`
  - 674 `Provisional feedback`
  - 18 `Solution pending`
- Multi-label classification: 738/738
- Viewer acceptance suite: 281 passed, 0 failed
- A 320 px live check on a pending question had no document-level horizontal
  overflow. This is not a substitute for the representative mobile pass in the
  roadmap.

The previous roadmap's 46/692/0 table was wrong. The status ledger counts 18
held launch cards as provisional, but those cards are not bundled or loaded.
The engine correctly falls back to `Solution pending`.

## Do not rebuild these implemented features

- Guess declaration is the first post-answer page, before the verdict.
- The chosen option is preselected; candidate percentages are prefilled and
  editable; Enter/Skip can decline the declaration.
- Correctness is revealed after the declaration or skip.
- Every question receives the generic guess/reflection/rating flow.
- Deep records add all authored prompts, conditional selected-answer questions,
  `No, another reason`, methods, requirements and selected feedback.
- Reviewer-only reconstruction is available through `?review`.
- Independent checks, dependent routes and synthesis are distinct.
- Deep-v2 option evidence uses a fixed full option rail and seven relationship
  states.
- `Things this question used` is subordinate, defaults to Known and offers four
  knowledge states.
- Free-text `Where did you go wrong or lose time?` is present.
- Question status is visible before work begins.
- Maths + Physics and In spec are the initial scope; shuffle is the default.
- Source and year filters are separate.
- Human-readable exact question finding, multi-label subtopics, the right-hand
  hierarchy, top Previous button, count-up time display, response jump/flash,
  minimisable analysis and mobile CSS are present.

## Release-safety blockers

### VSAFE-01 — invalid/damaged content state

Deep-v2 presence currently wins over safer legacy or generic content. Add a
viewer-side `invalid`/`withheld` state or equivalent content-safety predicate so
a damaged record cannot render merely because it exists.

Known affected IDs:

- `esat_engaa_2020_s1_Q04`
- `esat_nsaa_2020_s1_Q25`
- `esat_nsaa_2023_s1_Q27`
- `esat_engaa_2023_s1_Q16`
- `esat_nsaa_2023_s1_Q36`

The first three are labelled Full. The live pupil view for
`esat_engaa_2020_s1_Q04` visibly contains `238 ? 206`, `92 ? 16` and the
compulsory First thing / Why / Next structure. Validation and review flags did
not catch this.

Required behaviour:

1. the content build or wrapper supplies safety state/reasons;
2. unsafe analysis is not shown;
3. the question still runs using the generic feedback shell;
4. the badge says withheld/invalid or Solution pending, never Full;
5. reviewer mode exposes the reason;
6. regression tests cover precedence and fallback.

Content repair belongs to the analysis project; safe refusal/fallback belongs
to the viewer.

### VSAFE-02 — status must describe resolved content

Preserve the current good behaviour: the 18 unloaded launch-only questions show
Solution pending. Do not display Provisional merely because a ledger row says
so. Compute readiness from content that the viewer can actually resolve, plus
the new safety state.

Recommended product decision: keep the 18 pending and migrate them to deep-v2.
Do not revive the old launch-card renderer unless there is a deliberate reason;
its forced route model was held for calibration.

### VSAFE-03 — legacy presentation trap

The deep-v2 option rail complies with the no-pills/no-strikethrough requirement,
but reachable legacy CSS still contains pill and line-through treatment. Either
remove it, scope it to reviewer-only historical previews, or prove it is
unreachable. Do not let a future fallback silently restore the rejected design.

### VSAFE-04 — release checks

Add checks for:

- replacement characters and suspicious mathematical question marks;
- unreplaced placeholders;
- missing values/units in pupil-facing steps;
- unsafe-v2 fallback;
- actual Full/Provisional/Pending/Invalid counts;
- a long formula/surd, pending record, out-of-spec record and conditional
  selected-answer question at desktop and phone width;
- exact deployed asset/build identity after publication.

## Requested viewer features not yet complete

### VF-01 — central feedback submission

Explicitly delegated to the viewer/host owner and never implemented.

MVP:

- a small Feedback control available from the question and analysis;
- learner name prefilled from the existing identity;
- canonical full question ID, paper label, chosen option, viewer build and
  analysis version included automatically;
- a short free-text message with optional category;
- success/failure that does not block question use;
- one central reviewer sweep rather than browser-local notes only.

Do not invent an endpoint. Confirm the host-side owner, URL, authentication and
data shape before implementation.

### VF-02 — analysis pages

Repeatedly requested and deferred. The mastery sidebar is not the requested
analysis surface.

First pupil-facing page should show, by topic/subtopic and over time:

- attempts, correctness and 1–6 ratings;
- guesses and candidate sets;
- time distribution and time-bank context where enabled;
- method/idea responses and knowledge-state responses;
- flagged questions and free-text reflections;
- provisional/full/pending/withheld readiness where useful;
- drill-down to exact questions and the ability to reopen their feedback.

A later teacher view may aggregate classes, but do not block the pupil page on
the later identity/backend work.

### VF-03 — previous/history must reopen analysis

Previous exists at top and bottom and moves through the shuffled array, but a
returned question does not provide a clear way to reopen the previous verdict,
guess declaration, saved responses and analysis. Add:

- stable session history independent of current filter reshuffles;
- a visible Review answer/analysis action on attempted questions;
- restored chosen answer, declaration, rating, flags and reflection;
- no duplicate answer event merely for reopening;
- regression coverage for ordered and shuffled navigation.

### VF-04 — complete timing preferences

Only background `time_ms`, one count-up display and unused down/banking engine
primitives exist. The requested system remains largely unbuilt.

Required preference screen and behaviour:

- timing off/background only;
- quiet numeric elapsed/remaining time;
- visual 89-second ring/pie with overtime;
- time-bank view showing ahead/behind;
- configurable extra-time percentage, including 25% and 50%, and an optional
  negative adjustment for harder practice;
- base calculation retained from the request: `27*60/40` seconds per question;
- pause control;
- analysis/feedback time automatically excluded;
- `Don't keep a record of the time for this one`;
- time-bank carry/deficit across remaining questions;
- preferences stored per learner and editable;
- accessible reduced-motion/non-visual equivalents.

Do not infer guessing from speed. Guessing remains self-declared.

### VF-05 — before/after self-assessment

The viewer records only the post-answer 1–6 rating. A before/after layer was
requested so a pupil can distinguish prior understanding from “I understand it
now because I saw the answer.” Design this as optional and low-friction; do not
force two ratings on every question.

### VF-06 — general error-taxonomy self-report

Deep records provide question-specific prompts and a free-text note, but the
shared configurable error taxonomy in `DESIGN.md` is not implemented. Add an
optional generic layer for errors such as algebra, units/prefix, wording,
critical word missed, expression insufficiently precise and no way in. Keep the
vocabulary configurable and allow free text; do not force syllabus categories.

### VF-07 — flagged/revisit/more-like-this behaviour

The current button only emits an event but says “we'll bring more like this.”
There is no flagged queue and no recommendation mechanism.

Minimum honest implementation:

- persist flag state;
- provide a Flagged questions filter/list;
- allow unflag/revisit/reopen analysis;
- change the copy until a real “more like this” recommender exists.

### VF-08 — canonical-ID question finding

The finder accepts human paper notation such as `ENGAA 2020 Q4`, but not the
canonical analysis ID `esat_engaa_2020_s1_Q04`. Add canonical-ID matching. Decide
explicitly whether a direct jump should clear all filters and switch to In order;
the current silent reset is surprising.

### VF-09 — reviewer provenance strip

The current `?review` strip shows ID, schema, review status/reviewer, crop/key
checks and prompt counts. It does not show the originally requested build date,
producing batch, instruction/pass history, content hash, user acceptance or
pupil-test state. Add these only when supplied by authoritative provenance; show
unknown rather than inventing history.

### VF-10 — launch branding and classes

Remove “shared engine, comparison” / “comparison copy” from the live title and
sign-in page. Replace the interim `Test`, `Y12 ESAT`, `Y13 ESAT` list with the
real source of classes, or clearly label it as test-only until that source
exists.

### VF-11 — full mobile interaction pass

Responsive CSS exists, and individual checks passed, but a current representative
live pass is outstanding. Cover the complete answer → guess → verdict → methods
→ conditional prompt → things-used → reflection → rating → next flow, including
long maths and keyboard/touch behaviour.

## Requested platform capabilities, deliberately later

- Assistance module: pupil asks for help; teacher replies to the pupil, class or
  everyone. Depends on real identity and a shared backend.
- Real account/class membership. The user explicitly said it was not needed for
  the current viewer, but it is a dependency of assistance.
- Cross-consumer teacher analytics.
- Chemistry's complete move onto the shared engine.
- Special Relativity embed.
- Adapters for IB Physics, Economics, Maths, Trilogy Physics and pre-IB Physics.
- Final hosted-shared-script versus vendored-copy decision.

These belong in the roadmap and registry, but must not displace release safety
or the explicit ESAT viewer backlog.

## First Claude sequence

1. Establish a recoverable viewer-source checkpoint.
2. Re-run the 281-assertion suite and a small live/browser smoke test.
3. Implement VSAFE-01/VSAFE-02 before expanding use.
4. Update regression coverage and verify public fallback/status behaviour.
5. Implement central feedback once its endpoint/owner is confirmed.
6. Take VF-02/VF-03/VF-07 together as the first usable history/analysis slice.
7. Treat the timing system as a separate bounded feature with its own tests.
8. Keep `ROADMAP.md`, `CHANGELOG.md`, `REGISTRY.md` and this handoff aligned.

Do not edit generated `dist` or deployment assets manually. Change canonical
sources and run the sync. Do not publish merely because syntax and structural
tests pass; visually inspect the assembled site and verify the served build.

— Codex, 2026-07-28
