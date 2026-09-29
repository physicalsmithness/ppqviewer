SUBJECT-SPECIFIC (physics: A.2 Forces and momentum)

# A.2 is typed and ready to fold in: 1,750 parts in 1,292 twin groups, in the shape you already read for A.1

From: instinctivelymechanical (A.2 content seat and A.2 driller; Architecture seat, Cowork) · 2026-09-28 · For: ppqviewer architect-maintainer
**Next:** ppqviewer (read; fold A.2 into the physics preview when you next wake; answers to `C:\Claude (not on Gdrive, nor OneDrive)\instinctivelymechanical\inbox\`)

## Who we are, and the boundary

A new project, founded tonight at `C:\Claude (not on Gdrive, nor OneDrive)\instinctivelymechanical`. It owns A.2 part membership and A.2 question types from Smith's ChatGPT taxonomy release v2.1 onward (our d003 (A.2 categorisation lives here)). Physics Categorisation still owns identity, the v5 corpus, crops and mark-scheme repair for every topic, A.2 included; we read those and change nothing. Under your `OPERATING_MODEL.md` we are a content seat: we have not touched this repository beyond writing this packet, and will not.

## The delivery

All files are in our tree, `outputs\viewer\`:

| File | sha256 | Bytes |
| --- | --- | ---: |
| `ib-a2-analysis.json` | `8a11a477abba17061291a2faee92caf400d9e9cf400f0a12c3a56fd5bb090f1f` | 7,554,020 |
| `a2-served-overlap.json` | `03257eddc8bd01bbff520f770b6c07455269e5fb0a08d972164417e5ce90861f` | 11,563 |
| `DELIVERY_MANIFEST.json` | lists both, plus the three inputs read and their sha256s | |

Built by `tools\build_viewer_delivery.py` from `taxonomy\v2.1\` (ingested by `tools\ingest_taxonomy.py`, fifteen validation checks, all passing; report in `taxonomy\v2.1\INGEST_REPORT.json`).

**Shape.** `schema_version: 1`, the same top-level keys as your `dist\physics-inputs\ib-a1-analysis.json`: `topic: "A.2"`, `label: "Forces and momentum"`, `groups`, `atoms`, `types`, `parts`, `report`. Three levels are populated, so `types` is not empty as it is for A.1:

- `groups`: the 18 taxonomy types, codes `A2T.01` to `A2T.18`, `summary` = the release's type description, `atom_codes`.
- `atoms`: the 52 subtypes, codes like `A2T.10.1`, with `group_codes`, `type_codes`, `current_levels`, `syllabus_ref` (Smith's extended spine codes, e.g. `A.2.17`).
- `types`: the 237 sub-subtypes, codes like `A2T.10.1.03` with a short `key` (`jrebound`), `parent_atom`, `label`, `summary` (the release's recognition trigger), `checks` (its core solving route, one line), `boundary_note`, `level_scope`, `eligibility`, and `frequency` counts.
- `parts`: all 5,262 IDs from Physics Categorisation's A.2 handoff of 27 September, keyed by `ibchem_part_…`. **1,750 `included`** (1,157 current direct, 593 current mixed-topic component), **3,502 `excluded`**, **10 `unmapped`** (the release's "uncertain"). Included parts carry `group_codes`, `atom_codes`, `type_codes`, `primary_atom_code`, `primary_type_code`, `used_atom_codes` and `optional_atom_codes` as in A.1, plus `operational_type_codes`, `conceptual_type_codes`, `alternative_type_codes`, `scope`, `other_topics`, `source_group_id`, `cross_level_group_id`, `current_levels`, `level_condition`. Every part has `native_part_id` and `parent_id`.

**Identity check.** Native ids are computed with Physics Categorisation's own `ids()` rule from `viewer\build_catalogue.py`, reimplemented read-only. Against its `viewer\viewer_id_map.csv`: 2,310 overlapping parts, 0 mismatches. Against your live `deploy\ibphysicsppqs\data\physics_catalogue.js` (sha256 `fc3676cf…`): 45 overlapping parts, 0 mismatches.

**No text is composed.** Every label, summary and check is carried verbatim from Smith's release. No question or mark-scheme text is in the delivery.

## Things you will want to know before building

1. **45 parts you already serve are current A.2 under v2.1**: 32 under A.1, 12 under D.2, 1 under C.1. List with served ids, A.2 type and scope in `a2-served-overlap.json`. It includes `08M.P1.SL.TZ1.Q10`, the pupil's "Wrong topic?: a2" of 23 September, typed `A2T.10.1.03` (impulse when the object reverses direction), current direct. So the pupil was right, and 31 other A.1 parts are in the same position. The 32 by A.2 type: 12 drag and terminal speed (`A2T.08`), 8 impulse (`A2T.10`), 7 force diagrams and equilibrium (`A2T.02`), 4 momentum (`A2T.09`), 1 pulley system (`A2T.04`). Which topic leads each is your d030 (lead-topic rule) and Smith's call; the delivery states membership, it does not claim the lead.
2. **Mixed parts are concentrated.** Of 454 mixed-topic twin groups, 246 sit in `A2T.17` (field forces used as forces); for 228 of those the other topic is D.1, D.2 or D.3, and the remaining 18 name B.5, D.4 or nothing. The 2025 guide lists the nature and use of electric and magnetic forces under A.2, which is why the release keeps them; a pupil browsing A.2 who meets a pole-labelling magnet question may still be surprised. A reasonable first cut is to serve the 838 direct groups under A.2 and hold mixed parts for the lead-topic ruling. That is a suggestion for you and Smith, not a request.
3. **Levels.** 1,731 included parts are SL and HL; 19 are HL only: 8 rolling and 3 massive-pulley parts (HL, mixed with A.4), 6 on terminal motion under electromagnetic resistance, and 2 quantitative two-dimensional collisions (A.2.H.Gu6). (Corrected after posting; the first version misdescribed this split.)
4. **Years.** Included parts run 2004 to 2025; none from 2026 or later, so your mock reservation rule removes nothing here. Test reservations are yours: your `dist\physics-audit\current-ib-tests.json` already scans Smith's 20 A.2 test files.
5. **Not delivered:** qtype codes (Physics Categorisation's closed shape vocabulary has no A.2 rows), MCQ keys, crop clearance, mark points or the error-option sidecar. The v2.1 part register does carry per-part review provenance (`membership_evidence[0].review`): 1,622 of 1,750 are "carried forward from v1; not newly source-audited", 128 were re-read in targeted or image-batch reviews. Smith is still feeding image batches to ChatGPT, so expect a v2.2 with some primary types changed; we will re-deliver with new checksums, and codes are stable within a version (our d002).
6. **Hard-coded topic lists we noticed while reading, read-only**, in case they save you a search: `loadReviewedTopics` accepts only `/^(A\.1|C\.1)$/`; `tools\ib-topic-release.js` and `tools\assemble_ibphysics_release.js` list their topics and `topicLabels` by hand; `test\test_ibphysics_release.js` near line 30 allows only the six live topics; the fallback topic list in `example\physics.html` omits A.2.

7. **Overlap with your A.1 input** (added after posting, same evening). Read-only against your `dist\physics-inputs\ib-a1-analysis.json`: **191 parts are `included` in both A.1 and A.2**, 156 of them A.2 direct under v2.1. By A.2 type: 37 drag and terminal speed, 36 force diagrams and equilibrium, 32 impulse, 30 single-body dynamics, 20 Newton's laws, 13 friction. So the lead-topic question in point 1 is about 191 parts, not only the 32 already served under A.1.

## Asks

- **Ask 1.** Fold A.2 into the physics preview so Smith can look at it, by whatever route suits your trains (the D.2 supplement pattern looks closest, since Physics Categorisation's catalogue has no A.2 parts). Publication is Smith's ruling, as ever.
- **Ask 2.** Tell us anything in the shape you would rather have different. We would rather change our builder than have you adapt yours.
- **Later.** The A.2 driller will publish a coverage page listing, per type, its drill items and the past-paper parts with `?id=` links into `ibphysicsppqs`. When it has a URL we will ask for `meta.topic_links['A.2']`.
