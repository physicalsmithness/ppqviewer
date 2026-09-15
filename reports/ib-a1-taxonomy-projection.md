# A1 taxonomy input and remaining source assignments

12 September 2026. Private viewer integration evidence; this report and the source
workbooks are not pupil-facing assets.

The user-supplied backup workbooks are byte-identical to their current equivalents:

- `C:/CodexProjects/PaperDatabases/Physics Categorisation/outputs/a1_taxonomy_20260909/A1_question_taxonomy.xlsx`, SHA-256 `dc1a9ce29c8f63e911ff90174ae16f3638f91668fddf023106b131b0a51f0e97`.
- `C:/CodexProjects/PaperDatabases/Physics Categorisation/returns/PACKET_007B_A1_second/a1_question_types.xlsx`, SHA-256 `c002f27b430a7562d2b78bfbbc31994d0b39a948351399c4bca66ab56e3f2d5d`.

The September synthesis supplies eight teaching families and 51 types in teaching
order. It explicitly describes itself as a synthesis and evidence sample, rather
than an exhaustive question census. Its example references cannot establish that
every member of an older broad type belongs to each cited new K-code. The entire
authored vocabulary is preserved in the private input's `teaching_taxonomy`.

The August second pass supplies 52 current A1 types and one explicitly retired
type, final shape-to-type coverage decisions and 4,457 exact part decisions.
These decisions are in
`Physics Categorisation/.work_packet_007b_a1_second/blind_pass/decisions/`.
The final workbook and companion `workbook_draft` tables are checked cell-for-cell
before projection. The provisional `pass2_shape_mapping.csv` is not the final
mapping and is not used.

The private input `dist/physics-inputs/ib-a1-analysis.json` uses these current A1
type codes as atoms, with their original labels and solving guidance. Five of the
source's freer families have current types; the turning/circular-motion family
does not. No prerequisite or optional demand is inferred from a secondary family.
Single unsplit final type memberships require the authored literal evidence to
remain in the same v5 field. Explicit final workbook examples are retained only
with matching current evidence and no conflicting quarantine decision. Split
shapes do not receive every destination type automatically.

The existing 529-part A1 preview is not a reviewed release population. Its broad
tags include unrelated X-ray, stellar-spectrum, magnetic-force, nuclear-energy
and relativistic-frame operations. The first projection divides it as follows:

| Status | Parts | Meaning |
|---|---:|---|
| Included, exact type membership | 154 | Authored current type membership and current literal evidence |
| Included, scope reviewed only | 27 | Current A1 demand independently checked; finer descriptors deliberately blank |
| Excluded | 189 | Source quarantine/final no-current-A1 mapping, or the bounded scope review |
| Unmapped | 159 | No sufficient exact current-scope/type decision, or unresolved authored confidence |

The bounded scope review read the own question, shared stem, parent context and
native scheme text of all 36 split-only preview cases. It retained 27 direct
kinematics demands and withheld nine uncertainty-only, wave-only, force-output,
gravitational-escape or relativistic-frame demands. This certifies the topic
boundary, not diagram correctness, answers or assessment exclusion. Each decision
is recorded with an evidence hash in the input. The review is bound to v5 corpus
SHA-256 `6034e8854097c03384922d542b244164603262b1d6b0189d7a5a0ec34c13c17c`.

Across all source IDs the input has 756 included, 3,335 excluded and 1,016 unmapped
records. Within the native catalogue's 1,908 A1-tagged parts it has 579 included,
515 excluded and 814 unmapped. These are classification counts before the existing
assessment, page, crop and approved-source release checks. They must not be quoted
as publishable question totals.

## Handoff for the original analysts

Return one record per exact source part, descriptor, demand role and solution
route. Required fields are `source_part_id` (current v5 `part_id`), corpus and own
text fingerprints, `scope_status`, `scope_reason`, taxonomy version, descriptor
code, `demand_role`, `route_scope`, evidence quote/field, review status and source
locator. Preserve multiple directly assessed descriptors and separate those from
prerequisite, optional, context-only and alternative-route demands.

Provide the actual part-to-K-code assignments for the September eight-family
scheme. Do not translate example citations into universal crosswalks or silently
reuse a local code whose meaning changed between workbook versions. The JSON
contains the exact source-ID queue and the source-authored pending split branches.
Current A1 content is common to SL and HL; original paper level remains separate.

The builder writes only the viewer's private input and rejects changed source
workbooks/corpus where they invalidate the reviewed joins. Neither this projection
nor the teaching taxonomy changes the assessment exclusion policy or authorizes
publication of unreviewed crops. No source workbook or PaperDatabases file was edited.
