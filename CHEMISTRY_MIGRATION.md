# Chemistry shared-viewer migration

Started 27 September 2026 in response to Smith's request to fix missing originals,
readable stem/part text and the feature gap. This task owns the viewer integration;
the concurrent Chemistry Categorisation task owns source recovery and the catalogue.
The old Chemistry Driller engine is not changed by this work.

**Published and publicly verified:** 27 September 2026, build
`2026-09-27T14-38-55-510Z_ad41d9e4`, commit
`f44c70119fd34518b79d33cfae377223f9761261`.
The existing `ppq.html` link now opens
https://physicalsmithness.github.io/chemistrydriller/ppqviewer/ .
See `CHEMISTRY_RELEASE.md` and `CHEMISTRY_LIVE_VERIFICATION.json` for the
59-file live check, preserved behaviour and deployment boundaries.

## Verified local build

Build `2026-09-27T14-37-31-894Z_358af1` is available at
`http://127.0.0.1:8791/` while the local server is running. All 2,465 original
IDs remain reachable; every part has an original image. The build contains
6,565 unique question/context/markscheme assets, with zero missing, remote or
unsafe image references. Paper 2 accounts for 1,934 of those parts. Fifty-six
Paper 2 parts have markscheme text but no markscheme image; that is distinct
from the repaired original-question image coverage.

The content-seat validation passed, and this assembly consumed catalogue SHA256
`a3eb1236bc4dacfd4c91d8380df39d31e683594db90a8c909a541b97090691c0`.
Source and assembled viewer files were independently compared by SHA256.
Evidence: `CHEMISTRY_VERIFICATION.json` and the build report named in
`dist/chemistry-preview/latest.json`.

Browser checks covered the phenolphthalein context diagram, mechanism line
breaks, a real MCQ, markscheme reveal, an old whole-question link and responsive
layouts at 320 and 1280 pixels. No horizontal overflow or browser errors were
observed in those journeys. Production reporting has not been exercised.

## Implementation

- `example/chemistry.html`, `chemistry-page.js` and `chemistry-config.js` form the
  new consumer. They use `engine/ppqviewer.js` and its CSS without a fork.
- Class choices are SL, HL and Test. `subject-identity.js` is an unchanged copy of
  Chemistry Driller's subject-aware v3 helper, SHA256
  `0a9ba8b8e5e0b310ac4ec2ad45e794eef573e449f37b3961ae743451a7c55609`.
  It uses the chemistry context and preserves physics identity fields.
- The proven physics reporting adapter also exports `PPQReporting`. Chemistry
  supplies project `ppqviewer_chemistry`; physics defaults are unchanged.
- Explicit line breaks are escaped and rendered. Separate stem, group introduction
  and part fields are retained. Printed question/context and markscheme assets are
  copied into a self-contained build.
- Smith's preferred default (27 September): question context and transcription
  are collapsed once the current part image is ready. While it loads, the
  transcript is readable; if an image fails, it stays readable during retry.
  A pupil's manual disclosure choice takes precedence. Slow collapsed context
  does not hold the transcript open after the current part loads.
- The next three part images preload before supplementary context, siblings and
  markschemes consume the bounded 80-image cache. The preview server caches only
  content-addressed question assets; wrapper and catalogue updates stay fresh.
  Shared consumers opt into the text fallback with
  `questionLoading.transcriptFallback: true` and a transcription disclosure
  marked `data-ppq-loading-transcript` (or the engine's `ppq-transcript`).
- Existing part IDs remain unchanged in the runtime, including six explicit
  aliases where the catalogue uses a `(whole)` suffix. Canonical `part_id` is
  retained as provenance. Production uses `chemistrydriller_ppq_v2`
  and imports the old score/MCQ maps only when the v2 store is absent. Legacy
  attempts acquire neither an invented pupil nor an invented timestamp, and are
  never backfilled to reporting. Preview uses its own store and no migration.
- Reporting is disabled unless both the reviewed release flag and the exact
  production HTTPS host/path match. `?preview` also disables it and isolates storage.
- The shared CSS now puts the question before the long mastery panels when a
  split dashboard stacks below 980 pixels. Desktop keeps the three-column layout.
- Smith explicitly reaffirmed the left data-analysis dashboard. All 305 Paper
  1B parts retain their original 72 mastery groups, ten rating boxes, filtering
  and rating highlights. The assembler binds the original category by stable ID
  and checks it is explicitly present in the canonical skill list. Finer skill
  tags remain filterable without fragmenting the original mastery rows.
- Practice defaults to current/close syllabus status. The class seeds original
  paper availability (SL keeps shared/SL; HL can also practise SL), and learner
  preferences select the native printing of linked twins. Original-paper
  availability is not asserted to be current-syllabus eligibility; the adapter
  supports a separate current-level filter when authoritative fields arrive.

## Content input

The consumed delivery is
`C:\CodexProjects\PaperDatabases\Chemistry Categorisation\returns\PACKET_005\viewer\chemistry_catalogue.js`,
with `CHEM_META`, `CHEM_QUESTIONS` and adjacent `previews` assets. Its build report,
validation, crosswalk and checksums remain with the content seat. Changes there
require a fresh assembly and source-hash check here.

The pasted handoff was partly correct: missing asset packaging/matching caused
the absent originals. Some question strings already contain newlines; the old
viewer also collapses those, so readable text requires both source recovery and
viewer rendering changes. Source recovery belongs to categorisation; no new
extractor run is assumed merely because the old catalogue missed an image.

## Release record

Smith subsequently instructed publication to the existing site. The exact
authority, same-bank scope, source pins, reserved-test finding, deployment
boundaries and verification are recorded in `CHEMISTRY_RELEASE.md` and
`CHEMISTRY_RELEASE_SETTINGS.json`. The home-page button stays unchanged;
`ppq.html` redirects to `ppqviewer/` with the same query/hash and browser origin.

The local assembler still cannot publish. The separate release assembler
reconstructs the public records from pinned source and the validated legacy
mastery mapping, rechecks every source/bundled image and runtime hash, and emits
only an allowlisted public package. Staging and Git-index audits precede commit.
The live byte-verification receipt records actual publication separately.

## Verification commands

```powershell
node tools/assemble_chemistry_preview.js --catalogue "C:/CodexProjects/PaperDatabases/Chemistry Categorisation/returns/PACKET_005/viewer/chemistry_catalogue.js" --assets-root "C:/CodexProjects/PaperDatabases/Chemistry Categorisation/returns/PACKET_005/viewer/previews"
node tools/serve_chemistry_preview.js --port 8791
```

Automated checks (all passed):

```powershell
node test/test_chemistry_config.js
node test/test_chemistry_page.js
node test/test_chemistry_reporting.js
node test/test_chemistry_preview.js
node test/test_chemistry_release.js
node test/test_chemistry_loading.js
node test/test_question_loading.js
node test/test_physics_engine_behaviour.js
node test/test_physics_reporting.js
```

The eight standing viewer suites also ran successfully on 27 September. Their
existing ESAT placeholder warning is unrelated to chemistry and remains
automatically withheld by the content-safety gate.

The chemistry checks comprise 86 adapter assertions, eight page journeys, five
reporting checks, 22 assembler/server checks, 12 release checks and 54 controlled image-loading
checks. The 10 shared image-loading journeys and 21 engine behaviour checks pass,
including next-part preload priority under cache pressure. One stale physics
badge expectation was corrected after reproducing the same failure on the HEAD
engine; the intended extra SL-printing badge is now covered. All 12 existing
physics reporting checks passed after the shared reporting change.

Pre-change recovery snapshot: `chemistry-migration-before-2026-09-27.zip`.
It contains only the existing source/record files affected by this migration.
