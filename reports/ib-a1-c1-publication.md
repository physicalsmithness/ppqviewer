# A1 and C1 publication — 12 September 2026

Status: **published and verified**. Build `74bc30c663ec86cf`, commit
`0c71e82be7db4c782755f3fcde065b15c43e0f2b`. GitHub Pages reported that exact
commit built. Public verification passed at `2026-09-12T19:44:41.529Z`, with
all eight page/script/style/build files and seven PNGs across the three topics
matching. Evidence: `dist/physics-audit/ib-a5-live-verification.json`.

All 31 release checks passed, including 113 original MCQs and 904 keyboard
journeys. Additional checks passed: 14 chooser/topic-scope, 6 filter,
12 shuffle/navigation, 8 presentation, 8 original-PDF, 10 MCQ-source,
35 topic-loader, 6 A1 projection and 6 assessment-review checks. The eight
shared suites passed 2,426 assertions. Actual-browser checks verified the
chooser, A1 topic/type filtering and closed Key tips, plus C1 MCQ and written
question/context/markscheme loading. No real learner attempts were submitted.

A private source checkpoint was saved before publication verification at
`dist/ibphysics-source-checkpoints/74bc30c663ec86cf.zip`: 56 files, SHA256
`1e13b8f33a60a2ac57d47d7423b202b368113393ed88497dd7e1cb0227ec5b24`.
Its documentation records the then-pending verification; this record contains
the subsequent publication receipt.

The release adds A1 Kinematics and C1 Simple harmonic motion to the topic
chooser alongside A5. It contains 159 A1 parts (136 with confirmed direct
question-type mappings), 26 C1 parts (fine mappings pending), and 144 A5 parts.
There are 321 distinct source parts; eight parts belong to both A1 and A5.
The 787 public PNG assets are deduplicated by content hash.

## Taxonomy provenance

A1 uses the current authored 52-type vocabulary and exact source decisions
from PACKET_007B_A1_second. The September taxonomy synthesis is retained as
provenance, not treated as a complete source-ID crosswalk. Twenty-three final
A1 parts have independently reviewed current-topic scope but no invented fine
classification. See `ib-a1-taxonomy-projection.md`.

C1 uses the completed PACKET_015_C1 checkpoint for current-topic inclusion.
The SHMDriller's current 127-type vocabulary is loaded, but its workbook pack
aliases have no confirmed native source-ID crosswalk. C1 therefore offers all
available parts while explicitly saying question types are being added. See
`ib-c1-analysis-handoff.md`. Smith is asking the original analysts to complete
the authored write-up and descriptor coding.

Only directly assessed descriptors populate each topic's sidebar. Shared
questions do not introduce another topic's descriptors. Required and optional
concepts remain separate. Fine classification gaps do not hide otherwise
reviewed, cleared parts when All question types is selected.

## Content and source checks

The current A1/C1 assessment review covered the fixed 226-part candidate set
against 22 current shared-drive files, including the latest tests and scanned
items. Additional holds removed eight candidates. Final source attribution,
original-PDF identity, full-parent reservations and image checks leave the
counts above. This record does not certify unreviewed archive content.

All 2026 and later exam papers remain prohibited. Assessment/source evidence
stays private; the public package contains only the viewer and eligible crops.
Every selected A1/C1 part is bound to its original question and markscheme PDF,
native parent, exact source row, crop assignments and current file hashes.
Missing reserved geometry holds affected new parts for further review.

The separate shared-parent visual check found two defective existing A5
entries: both 04N G2(d_iii) appearances. Their whole parents are withheld,
reducing A5 from 146 to 144 parts and 72 to 70 parents. The two reviewed 10N
D1(c/e) appearances remain byte-for-byte unchanged. See
`ib-a5-shared-parent-crop-review.json`. Attempt storage is untouched.

109 newly source-matched MCQs use original answer keys, in addition to the four
existing visually reviewed A5 MCQs. Four unmatched candidates retain manual
marking. No answer is inferred from solving the physics.

## Rebuild sequence

1. Review changed database, taxonomy and assessment inputs. Rebuild the private
   A1/C1 inputs with their Python builders when those source decisions change.
2. Run `node tools/build_ib_a5_clearance.js` and
   `node tools/ib-topic-release.js`. These write local evidence and reject
   changes beyond the reviewed scope; changing an expected count is not review.
3. Run `node tools/assemble_ibphysics_release.js`, then
   `node test/test_ibphysics_release.js` against the generated release.
4. Inspect the local site with
   `node tools/serve_physics_preview.js --ib-release --port 8789`.
5. After reviewing the bundle, stage it with
   `node tools/stage_ibphysics_release.js <verified-deployment-baseline>`.
   This copies only public files and removes exact obsolete tracked assets;
   it does not commit or push. Publish only to the existing IB Physics origin.
6. Verify Pages' exact commit and run `node tools/verify_ibphysics_live.js`.

Database improvements do not silently overwrite the live GitHub Pages site.
The generated release must be rebuilt and published. Stale fingerprints block
the old clearance until changed material has been reviewed.

The public identity helper remains version 1. The separately staged version 2
candidate is not part of this work. No teacher question, display report or
real pupil attempt was submitted during verification.
