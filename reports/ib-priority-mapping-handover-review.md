# Recovered physics mappings: viewer intake review

12 September 2026. Private integration note; not a pupil-facing asset.

Read the coordinator's `C:/CodexProjects/PaperDatabases/Physics Categorisation/reports/categorisation_audit_2026-09-12/PRIORITY_MAPPING_HANDOVER.md` and the D2, C1 and Paper 1B source handovers. The local teacher bank at `http://127.0.0.1:8770/api/stats` responds and reports 18,308 archive parts. Its published counts are a saved snapshot, not a live deployment check.

The public viewer baseline remains build `74bc30c663ec86cf`: 321 unique parts, including 159 A1, 144 A5 and 26 C1 parts. Topic totals overlap. This review makes no publication or exclusion changes.

## D2: a concrete source-input gap

Source directory: `C:/CodexProjects/PaperDatabases/Physics Categorisation/outputs/d2_assignment_recovery_2026-09-12/`.

All 15 products in `export_manifest.json` match their declared SHA-256 hashes. The main assignment table hash is `a0dde558b12eb4b7f8c79999a919b3d2c0876d66c32f9848961f79adfb2b16d5`. The current v5 corpus still hashes to `6034e8854097c03384922d542b244164603262b1d6b0189d7a5a0ec34c13c17c`.

Filtering `part_type_assignments.csv` to `scope_status=retained` and `ordinary_topic_evidence=True` yields 552 distinct parts and 639 memberships. The current private `dist/physics-inputs/ib-d2.json` has 388 distinct source parts; 321 overlap those ordinary recovered parts. **231 ordinary recovered parts are absent from that input.** These counts precede learner test, source and image checks; 231 is not a publishable-part promise.

The integration must retain `versioned_type_id` and source provenance. Its 98 type-to-understanding links must remain type-level references, not be expanded into claims about each part's assessed syllabus steps. The additional 17 DATA parts / 22 memberships are already in the main assignment table and must not be added again or classified as ordinary D2 evidence. Two ordinary parts have source-quality flags affecting three memberships; their answer-key qualifications remain unresolved for automatic marking. Keep pack occurrences and duplicate/group relationships as separate evidence.

## C1: recovered examples can improve existing questions

Source directory: `C:/CodexProjects/PaperDatabases/Physics Categorisation/outputs/priority_membership_recovery_c1_2026-09-12/`.

The assignment table hash is `83722fbe0222375da66e9c911e474345f7515da002637807120a8b63bf9cdcbd`. Its 90 exemplar memberships cover 87 parts. Filtering to current types without a later-checkpoint conflict leaves 82 distinct parts. Matching those stable IDs to the published C1 collection gives **eight memberships across seven currently published parts, using seven versioned types**.

These are usable exact source links for a reviewed descriptor update, not an exhaustive C1 taxonomy census. The delivered-workbook namespace `C1_007B_WORKBOOK_cc4e297f2763` differs from the viewer's current counts/dependency vocabulary. Integrate an explicit versioned vocabulary, with its original wording and guidance; do not silently reinterpret existing local codes. Keep the three retired memberships and three conflicting links out of any automatic current-type promotion. Existing part IDs and pupil progress keys need not change.

## Other incoming layers

- A1: the 831 recovered exact-linked parts comprise 729 already included by the viewer and 102 currently unmapped records. Of the latter, 100 retain explicitly uncertain author judgments; two have repaired source-text formatting. All 136 currently typed published parts have exactly identical type-code arrays in the recovery. The other 23 published parts belong to its 214 broad-category records, so the recovery adds no proven finer typing to the current 159. Of the existing 756 included A1 source IDs, 630 are in the current 5,077-part native catalogue and 126 are absent. Of the 102 new exact-linked candidates, 80 are in that catalogue (78 uncertain and two repaired) and 22 are absent. Preserve the viewer's later scope readings; neither mechanical linkage nor broad category membership is a new exact-type approval.
- A5: the master describes 749 source records / 409 reviewed canonical questions before viewer release checks. Preserve source appearances versus canonical grouping and the current tested publication boundary.
- E1/E2: 30 and 23 exact 2025 joins respectively; 136 pack rows remain unjoined. Counts-only pack taxonomies do not establish database memberships.
- Paper 1B: 204 proposed skill rows on 120 of 130 current-spec parts; only 53 rows are source-checked and 151 remain pending independent QA. Preserve the 18 vocabulary-fit cases, role/route qualifiers and source review status. This does not replace the broader historical data-analysis collection (877 raw parts under the current location rule).

## Next implementation boundaries

**Correction to the incoming A1 diagnosis:** code inspection finds no extra A1 candidate-batch selection in `ibInput()`. Reviewed A1 overlays apply to every native catalogue part. The candidate-membership check in `ib-topic-release.js` validates the result rather than silently filtering it. The smaller native catalogue, current topic dispositions and subsequent publication checks must be distinguished when explaining the 159 total. The explicit frozen candidate gate in `assemble_physics_preview.js` applies to A5.

Consume new mappings first in private, source-fingerprinted inputs. Enrich already published C1 parts without substituting unrelated codes. Expand the D2 candidate input using the ordinary recovered ledger, retaining quality cautions. Any new pupil release still requires the existing current-test comparison, complete sibling/context exclusion, 2026+ exam exclusion, exact original/crop ownership and answer-key checks. No source export, shared-drive test, learner progress store or deployed site was modified by this intake review.

Smith subsequently approved the attempt-logging connection and the labelled Test-class verification. The receiver and Google Sheet readback have both confirmed it; the checked viewer release is being published separately from any new D2 question clearance.
