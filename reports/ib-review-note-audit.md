# Written test-reference reservations — 12 September 2026

The audit examines every `source_kind=test` row in the current PACKET_006D ledger, rather than only the D2 files. Complete examination references and explicit archive IDs in the ledger, final results, stage-3 proposals and individually attributable QA records are resolved against the fingerprinted 18,308-part archive. A review note that says a comparison is weak remains a precautionary candidate hold; it is not described as a confirmed test copy.

The private machine-readable evidence is `ib-review-note-reservations.json`, produced by `tools/audit_ib_review_notes.js`. It binds 2,813 test rows, 16,479 reference occurrences, 4,134 distinct source/reference pairs, 2,754 seed parts and their whole-parent, declared-twin and duplicate closure. Of the seeds, 148 were outside the previous exclusions; closure adds 207 archive parts. Both incomplete date references in the attributable QA tables have bounded wording/date candidate witnesses and are held. No positive nonmatch exception has been supplied.

The review boundary is permanently the **321-part build `18a6bc2d3b649210`**. It must not be replaced with a later, already-pruned catalogue. The `reviewed_public_removals` array preserves each exact source ID, parent, topic, reason, reference lineage and baseline catalogue hash. The existing `ibInput` whole-parent page gate is applied as well as source/parent/twin closure.

| Topic | Source or twin holds | Additional shared-page holds | Total removals | Remaining from this baseline |
| --- | ---: | ---: | ---: | ---: |
| A1 | 5 | 4 | 9 | 150 |
| A5 | 3 | 0 | 3 | 141 |
| C1 | 0 | 1 | 1 | 25 |
| Total | 8 | 5 | 13 | 308 |

Source and twin holds are 09M SL P1 TZ1 Q3; 10N SL P1 Q3; 14M HL P1 TZ2 Q2 and its declared SL Q3 twin; 18M SL P1 TZ1 Q8; and all three parts of 25M HL P2 TZ2 Q6. Page-only holds are 04N SL P1 Q5, 09M SL P1 TZ1 Q4, 13N SL P1 Q12, and 25M P1A TZ2 Q5 at both levels. A page hold is a conservative rendering restriction; it does not assert that the neighbouring question appears in a test.

The skydiver source ID `ibchem_part_df4014d007195024` was independently checked against the full Q19 tables in the 2024, 2025 and 2026 A1 tests. The whole tables differ, but their direction-of-motion subparts plausibly reuse the qualitative task. `ib-a1-skydiver-note-review.json` therefore retains the hold with PDF, crop and review-render fingerprints. It does not claim a confirmed copy.

Five focused tests cover exact sitting resolution, omitted time zones, lettered parents/Paper 1A, explicit IDs, and fixed-point sibling/twin/duplicate closure. No source corpus, assessment, shared exclusion implementation or public release file was edited by this audit. All review notes and assessment paths are private evidence and must remain outside the served release.
