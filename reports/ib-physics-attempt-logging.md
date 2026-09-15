# IB Physics attempt logging — connected, published and verified

Updated 13 September 2026. Four-topic build `f6004e904e4c69a8` is published
as commit `b9c5624bb848fed5b6b61778644a30161c4151b8`, including the connected
wrapper and D2 descriptor-display repair. GitHub Pages built the exact commit;
public hash verification passed at `2026-09-12T23:26:36.317Z`.
The previous public baseline was `74bc30c663ec86cf`, commit
`0c71e82be7db4c782755f3fcde065b15c43e0f2b`.

## Cause and verified destination

The previous public wrapper omitted the engine's `report` callback. Marks
and C were saved in this browser but did not reach the shared tracker.
Teacher help used a separate working connection.

The new `physics-reporting.js` adapter uses the existing estate Apps Script
receiver declared in `example/ppq-login.js`, with project
`ppqviewer_ibphysics`. Its verified destination is **Smithics driller responses**,
spreadsheet `1kUqhZCTyOMoHzgn2QRB2Dxhp2vSZarLsmMxcCqf5rRA`,
tab **ppqviewer_ibphysics** (sheet ID 683951123). That tab was absent before
the approved connection test.

Smith explicitly approved connecting and publishing the described payload
and the labelled Test-class verification. The receiver acknowledged one
synthetic attempt and its linked C judgment. Independent Sheets readback at
`2026-09-12T22:06:57.725Z` verified 1/2 marks, C3 and 12,500 ms with the same
attempt ID `ibphysics-qa-a4d5f911-2c51-43ca-87e5-de01562896bc`.
The two rows are in `ppqviewer_ibphysics!A2:Q3`; the readback inspected
`A1:Q4`. Both use `IB Physics logging test (Codex)`, class `Test`.
No real pupil history was submitted.

Evidence: `dist/physics-audit/ibphysics-reporting-receipt.json` and
`dist/physics-audit/ibphysics-reporting-sheet-readback.json`. These establish
the receiver/destination round trip. The separate public-byte check establishes
publication of the connected student wrapper.

## New activity only

Reporting activates only for a release on the production IB Physics site.
Local previews keep attempts local. The adapter transmits new completed
attempts and new C/time-removal events; it never scans, replays or backfills
existing browser history. Sign-in and existing local progress keys are preserved.

Payloads include the signed-in identifier/name/physics class, exact question,
source and parent references, topic descriptors, marks or an uncertain range,
C, available time, learner level and attempt identifier. The adapter links
judgments to the exact owned question/attempt. Switching people cannot relabel
another person's saved work. Pre-answer C remains a judgment and does not
invent a completed attempt.

Scored rows use `status: correct/half/wrong/unknown`, retain
`event_status: answered` and carry `item_id`. Partial exact marks are
`half`; uncertain ranges remain `unknown`, with their bounds preserved.
C/event rows clear `item_id` while retaining `question_id` and
`attempt_id`. The older teacher reader therefore counts one scored attempt,
not a second attempt for its C row. The receiver retains extension fields
inside `extra_json`; a richer joined display requires the newer teacher
Records view. No teacher-backend update is included in this fix.

Reporting failures leave local marking intact. There is no automatic retry
against this append-only endpoint. An opaque browser fetch response is never
presented as confirmation that a row reached the spreadsheet.

## Validation and release boundary

Twelve synthetic reporting checks passed, including real-wrapper callbacks,
exact/partial/ranged marks, zero time, false correctness, C linkage,
legacy-reader attempt counts, identity switches, time removal, failure
isolation and no history upload. Those tests use mocked transport.
Only the separately approved labelled Test-class round trip wrote to the
actual receiver.

The published content contains 454 distinct parts and 1,108 public PNGs:
A1 150 (129 typed), A5 138, C1 25 (seven typed), D2 149. The topic sum of 462
includes eight cross-topic parts. D2 binds 391 source crop paths before
public content deduplication. All 2026+ exam papers and additive assessment,
parent/twin/page/scope/crop holds remain excluded. Original PDF provenance
and the correctness/completeness of displayed crops are separate checks.

Publication is verified: nine public page/script/style/build files and nine
PNG assets matched the release hashes, 18 files in total. The actual public
chooser showed the four topic counts above. The fresh full release run passed
32 checks, 200 MCQs and 1,600 fresh keyboard journeys with zero reused journeys;
2,887 evidence fingerprints were rechecked before publication. The labelled
Test-class receiver check and the subsequent website deployment remain separate
verification steps. No historic pupil attempts were backfilled.
