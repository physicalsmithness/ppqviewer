# IB Physics release status

## Mastery jump fix staged, 28 September 2026

Build `c75a30d7c3a1172f` is staged in `deploy/ibphysicsppqs` against clean
baseline `67fac6817cb2e4f39aa458ddf7e517cff56ed515`. The mastery sidebar brings
the relevant type into view at the same event that fires its saved marks or
confidence indicator. Question navigation and markscheme reveal do not jump it.

All 27 release-gate suites and the focused regressions passed, including 36
exact-package checks and 2,016 fresh keyboard journeys across 252 MCQs. Browser
checks verified both answer/rating jumps and no early movement. All 543 parts
and 1,316 assets are unchanged. Four generated files are staged, with no deleted
assets. This is not a publication claim: commit, push and served-build verification
remain outstanding. See `reports/ib-dashboard-jump-validation-2026-09-28.md`.

## Local evidence repair, 23 September 2026

Build `fac62770fb70f6df` is staged locally after the evidence-chain repair.
All 1,325 public content/UI files are byte-identical to tested build
`7df8c498b1ffb20b`; only build metadata changed after final assembler cleanup.
Its complete public catalogue is identical to previously gated local
build `03860fb2b708a642`: 543 parts, 1,316 assets and 44 crop notices. This entry
does not claim publication; committing, pushing and live verification remain
separate. All 27 applicable suites passed across the recorded full run and
consumer continuation. See `reports/ib-release-repair-validation-2026-09-23.md`.

Release assembly now uses pinned A5 syllabus, D2 baseline and historical DATA
inputs in `reports/ib-release-inputs/`. Preview refreshes retain separate
`dist/physics-inputs/` outputs. The eleven dependent evidence records were
rebuilt and fully compared before transactional promotion; original reviews
and their dates remain preserved. See
`reports/ib-evidence-migration-2026-09-23/README.md` and its validation/promotion
receipts for the exact evidence and the checked historical-impact difference.

`RUN_IB_RELEASE.cmd` stops on every failed command and never borrows the SR
project's working file. `STAGE_IB_RELEASE.cmd` requires a clean deployment
checkout and never discards whitespace differences. An unfinished evidence
promotion blocks both assembly and staging.

The outdated consumer suites now exercise the adopted twin, lead-topic and named
report-reason rules. Exercising actual report submission also exposed and fixed
an out-of-scope variable in the engine; tests use mocked transports only.

## Published six-topic release

Build `e56bf638d0332e3e`, assembled at `2026-09-14T20:37:56.950Z`, was published as
commit `4e6ee94c8e599da9aa6a5b0e22a6eb490a19edd1`. GitHub Pages served the new
build and live byte verification passed at `2026-09-14T21:04:28.843Z`: 22 public
files matched the published commit. This build adds the “also studied”
co-strand panel (a multi-topic part now names every strand on the card, main
strand first with its reviewed descriptor) over `9392e1ca48403a54`; the served
**543 distinct parts** and every per-topic count are identical, and only the
viewer engine, stylesheet and physics consumer changed. The full release suite
passed 33 checks, 252 MCQs and 2,016 fresh keyboard journeys.

Build `9392e1ca48403a54`, assembled at `2026-09-14T18:05:57.955Z`, was
published as commit `615a60af413b92a4672764e66cf34d3968f64421`. GitHub Pages
reported that exact commit `built`. Live byte verification passed at
`2026-09-14T20:26:26.641Z`: 22 public files (nine text/data/engine files and
sample crops) matched the published commit. That build was a title-only change
over `d5fa99e9dedd533b` — the served viewer became “IB Physics past-paper
question viewer” with “past-paper” hyphenated and the standalone IB Physics
course line removed from the topic home.

The previous build `d5fa99e9dedd533b`, assembled at `2026-09-13T16:42:29.680Z`,
was published as commit `d3195abc9940e3bbb63ad47d5ffd67a9eed9e55e`.
GitHub Pages built that exact commit. Public hash verification passed at
`2026-09-13T16:53:59.601Z`: nine page/script/style/build files and 13 PNGs
matched, 22 files in total. The actual public chooser shows all six topics.

The release contains **543 distinct parts** and **1,316 public PNGs**.
Before publication, 3,406 source/evidence fingerprints were rechecked. The
fresh full release run (session 73028) passed 33 checks, 252 MCQs and 2,016
fresh keyboard journeys, with zero reused journeys. Receipt:
`reports/ib-d5fa99e9dedd533b-release-verification.json`.

Browser checks covered E1/E2 selection, authored types, collapsed Key tips,
visible answer-free mixed-scope notes, original context and written schemes.
A cross-topic part-chip ordering defect was corrected and rechecked in the
final package. Record: `reports/ib-d5fa99e9dedd533b-browser-check.json`.

| Topic | Eligible parts | Parts with direct type mappings |
| --- | ---: | ---: |
| A1 Kinematics | 149 | 128 |
| A5 Galilean and special relativity | 138 | 138 |
| C1 Simple harmonic motion | 25 | 7 |
| D2 Electric and magnetic fields | 146 | 146 |
| E1 Structure of the atom | 55 | 55 |
| E2 Quantum physics | 39 | 39 |

The topic counts sum to 552 because nine parts have two topic memberships.
Reviewed A1/C1 topic scope is sufficient for inclusion when a finer descriptor
is still unmapped; those parts stay under All question types. Sidebars show
only descriptors belonging to the selected topic. Authored labels, order and
exact source-ID joins are preserved; prerequisite/context tags do not become
directly assessed types.

D2's current clearance retains 146 parts in 135 parents, including 62 source
appearances absent from the prior private input. It binds 379 distinct source
crop paths and 95 original matched MCQ keys.
Those source-path counts are separate from the public bundle's content-
deduplicated PNG count. An exact, reviewed presentation overlay omits one
unrelated following-section heading; the complete first answer crop remains
unchanged. The original source files have not been edited.

The eligible counts above reflect additional global assessment-note and page
holds. They replace the previous selection; they are not an arbitrary sample
or a cap. Private assessment descriptions and exclusion evidence never enter
the public catalogue or learner notices.

E1/E2 use the accepted checkpoint_004 plus pinned v001 learner eligibility.
Every eligible source ID received current-assessment comparison: 264 E1 and
252 E2 before assessment/crop/parent/page holds. The final 94 E parts retain
110 exact direct type links; supporting and historical roles do not become
counted types. Both completed E reviews now apply globally and remove one
previous A1 part and three previous D2 parts. Six retained mixed E1 parts have
reviewed answer-free Practice focus notes. All E2 parts are current HL.

The appended C1 seq772 analyst update was checked against the accepted
seq0352 boundary: all reviewed part/type fields remain identical and none of
the six newly noted source qualifications affects the public pool. Only
private source witnesses were refreshed; later C1 candidates were not added.

## Attempt logging

The published wrapper connects the existing estate receiver to project/tab
`ppqviewer_ibphysics` in **Smithics driller responses**. An approved labelled
Test-class attempt and linked C judgment were acknowledged and independently
read back from that tab. The receiver connection is verified, and the connected
wrapper is now published in the live-verified build above.

The production IB site reports new activity only: completed marks/MCQ attempts
and new linked C or time-removal events. Existing browser history is never
replayed or backfilled. Exact source, question, attempt and current learner
identifiers keep marks and judgments linked; another learner's saved work is
not relabelled on a shared device. Local previews keep attempts local, and
reporting failures do not interrupt saved practice.

Scored rows carry `item_id` and correct/half/wrong/unknown outcome status.
C/event rows retain `question_id` and `attempt_id` but leave `item_id` empty
so the older teacher reader does not count them as another attempt. Uncertain
mark ranges remain uncertain. The receiver stores extensions in `extra_json`;
richer related-record display requires the newer teacher Records view.
No automatic retry is made against the append-only receiver, and an opaque
browser response is not described as confirmation of spreadsheet receipt.
See `reports/ib-physics-attempt-logging.md` for exact destination and evidence.

## Assessment and source rules

Every exam paper from **2026 onwards is prohibited**. Existing reservations
remain additive: confirmed matches, unresolved proposed alternatives, reviewed
rewrites, full parent questions, level twins, duplicates and shared reserved
question/context pages. The newly reconciled historical references in review
notes apply across every IB topic, including existing published content.

Original-source validation checks the actual question and markscheme PDFs,
sitting identity, source membership and source bytes. Crop validation separately
checks ownership by question/part, rectangles, displayed context, overlap with
reserved content, image bytes and reviewed defects. A valid original PDF does
not prove that its crop is complete or correctly assigned. The public viewer
serves approved crops; full-page/PDF fallbacks cannot bypass these checks.

Current syllabus scope is distinct from the printed historical source level.
A5 remains current HL content even when its source was an old SL option paper.
The learner's saved HL/SL choice controls practice pacing, not historical-source
classification. Unreviewed mixed, retired or conflicting scope and uncertain
crop ownership remain withheld. Explicitly accepted mixed E components carry
visible scope limits. Fine taxonomy gaps alone do not exclude an otherwise reviewed
A1/C1 topic part.

Private evidence stays in `reports/` and `dist/physics-audit/`. The D2 final
clearance SHA-256 is
`5c604dde37b647d9663b10dd7b358b3f44239998b6750cf48d9306ec4712d3cf`.
Its 31 focused recovery/release/presentation/merge checks passed. A separate
default projection verified complete assessment status, the exact 146-part
set, the heading omission and the complete retained answer. Independent
sampling covered nine parts and 23 retained images; it is not a claim that
every image was individually visually proofread.

## Retained viewer behaviour

The topic home offers the available topics without mounting an answering
session. Explicit topic/question links open the viewer; the title returns
home. Current-part headings and ordered part chips precede the context.
Question, context and scheme crops preload; images support enlargement and
retry without leaving stale answers visible.

Saved exact/range marks remain highlighted with a Saved status. C follows
the marks inside the question pane, with minimal scrolling there; the current
attempt appears in history immediately. C1–6 reads: No idea; Only half
understand; Mostly understand; Fully understand, but I might miss it tomorrow;
Fully understand, comfortable with this; Trivial — never need to see this again.

Completed questions are included by default. Preferences offer unattempted
parts or latest errors, and distinguish whole-question shuffle with ordered
parts, all-part shuffle and in-order navigation. Missing historical C is never
borrowed from a later attempt. Shared browser progress and identity helper v1
remain intact; PPQ sign-in recovery v2 is still separately staged.

The timer defaults off. Saved learner level and extra time determine the
current visit's marks-aware target: Paper 1/data analysis 120 seconds per mark;
written questions 100 seconds at HL or 108 at SL. Saving preferences preserves the open answer
and timer. Key tips stays closed until opened, and ordinary answer/rating
updates do not move the analysis.

Ask your teacher, display reports and Draw remain explicit question tools.
Teacher help confirms a receipt before claiming delivery; public replies
contain teacher-reviewed wording without pupil names. Display-report and
teacher-help transports remain separate from attempt logging. No real pupil
history or teacher reply was sent during validation.

## Build and verify

1. Refresh the reviewed classifications and assessment evidence only after
   reviewing source changes. Regenerate the affected clearances; changing an
   expected count is not a substitute for review.
2. Run `node tools/assemble_ibphysics_release.js`. Changed source fingerprints,
   missing reviews, invalid memberships or reserved/corrupt content block
   assembly. The D2 path replays its exact source, assessment and presentation
   evidence before merging stable identities.
3. Run `node test/test_ibphysics_release.js` against the new bundle and the
   relevant topic, reporting and presentation tests. Run the eight shared
   suites whenever the shared engine changes.
4. Review with `node tools/serve_physics_preview.js --ib-release --port 8789`.
   Browser checks must avoid creating real learner records or help submissions.
5. Stage only the generated bundle recorded in
   `dist/ibphysics-release/latest.json` into `deploy/ibphysicsppqs`; remove
   obsolete public assets and keep private audit/test files out.
6. For future releases, verify the actual deployed commit, build-info,
   page/data/image bytes and topic interaction after publication. Record that
   evidence before changing the release status to publicly verified.

## Historical published baselines

These counts and test totals describe past releases, not the current build.

| Published build | Verified scope | Publication evidence |
| --- | --- | --- |
| `f6004e904e4c69a8` | 454 distinct A1/A5/C1/D2 parts; 1,108 PNGs; 32 checks and 1,600 fresh key journeys | Commit `b9c5624bb848fed5b6b61778644a30161c4151b8`; 18 live files verified |
| `74bc30c663ec86cf` | 321 distinct parts: A1 159 (136 typed), A5 144, C1 26; 787 PNGs | Commit `0c71e82be7db4c782755f3fcde065b15c43e0f2b`; live byte check `2026-09-12T19:44:41.529Z` |
| `ab0aa88396caf624` | A5-only, 146 parts and 371 PNGs; topic home/header/loading update | Commit `ca2810097f55624192bce19598ce729326480e57`; live byte check `2026-09-12T17:30:02.003Z` |

The three-topic baseline passed 31 release checks, including 113 MCQs and 904
keyboard journeys; the shared suites passed 2,426 assertions. Those earlier
wrappers saved attempts locally and had no configured PPQ attempt callback.
Earlier 146-part interface comparisons, coverage-gap findings and crop counts
are preserved in their dated reports; they do not describe today's scope.

Further records: `reports/ib-a1-c1-publication.md`,
`reports/ib-layout-navigation-validation.md`,
`reports/ib-rating-feedback-validation.md` and
`reports/ib-a5-changed-crop-visual-review.md`. Other IB topics, Trilogy and
Pre-IB remain local previews; this published release covers only the
six topics listed above.
