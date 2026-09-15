# Private A5 source-geometry review — 12 September 2026

## Current status: both temporary exceptions retired

The source owner repaired both reserved G2(b)(i) proper-length definition rows
to adequate `row-graphics-v1` crops. Both complete source-page images retain
the exact hashes recorded below. Each row contains the definition and one mark;
the following 40/γ calculation belongs to (ii). G2 and its twins remain fully
reserved. The repairs do not authorize serving their questions or answers.

| Source preview | Actual protected crop rectangle | Current metadata SHA-256 |
| --- | --- | --- |
| `ib_physics_2008_may_3_030c56b9`, page 11 | `[60,582,568,621]` | `2172f89a72f6e6dc5746b90d8bfd1e57e783d70be9b1beb9bc571b700c3c57c1` |
| `ib_physics_2008_may_3_fce874db`, page 10 | `[60,609,568,649]` | `d8b5b4147ce83531a84a47fe498a300dec5d2b458150c8347cd4c6e7956d1e12` |

The original text bounds are unchanged. Actual crop bounds include more area
than the former text-only exceptions, protecting the padding too. Clearance
now uses every entry's actual `crop_regions` unchanged in the ordinary overlap
check. There is no preview-specific override, original-text substitution or
hash bypass. All remaining full-page fallbacks retain their conservative full
geometry; served crop geometry and other reservation rules are unchanged.

The regression test pins both current metadata hashes and unchanged page-image
hashes as review evidence. Five checks cover both actual rows/G1 separation,
their padding, full-page overlap rejection, and continued whole-parent/part
reservations. Runtime metadata remains bound by the normal clearance
fingerprints. The two exception entries are removed from regenerated records.
This change does not regenerate canonical clearance or approve other updates.

## Historical investigation — obsolete exception described below

The following records the earlier fallback revision and its temporary remedy.
Its exception algorithm and old metadata hashes are historical, not current.

The clearance failure on May 2008 G1 is a metadata interpretation error, not newly exposed reserved content. The served G1(a)(i) and G1(a)(ii) answer images are unchanged. A reserved G2(b)(i) definition row was changed to a whole-page display fallback; the gate incorrectly treated that entire display rectangle as source content owned by G2.

Both complete source-page images were visually reviewed. G1 is the separate speed calculation at the top. G2(b)(i) is the proper-length definition below, with no diagram or owned content outside its original text rectangle. G2 and its level twins remain reserved in full. None of their fallback images is served.

| Preview / original paper | Reserved row / virtual page | Reviewed owned rectangle | Full display rectangle |
| --- | --- | --- | --- |
| `ib_physics_2008_may_3_030c56b9` / May 2008 P3 SL TZ1 | G2(b)(i), 11 (printed 13) | `[70.92,588.15,555.96,615.23]` | `[0,0,595,842]` |
| `ib_physics_2008_may_3_fce874db` / May 2008 P3 HL TZ1 | G2(b)(i), 10 (printed 12) | `[70.92,615.75,555.96,642.83]` | `[0,0,595,842]` |

In both papers, served G1(a)(i) occupies `[99.29,112.83,555.96,126.11]` and G1(a)(ii) `[99.24,139.07,555.96,336.1]` on the corresponding virtual page. These do not touch the reserved definition rectangle. Other G2 task rectangles remain included in the normal reserved-content overlap check.

The first failing image is `outputs/previews/ib_physics_2008_may_3_030c56b9/crops/mark_scheme_g1_a__i_v011_p011_01_8f9ba65b8d.png`, attributed to `08M.P3.SL.TZ1.QG1`, source part `ibchem_part_d6d68f039bca1dbb`. SHA256 `d9825657fb751b913b8db0e7bc3445f850c7f74bb707efdba19ffb913f2dbdb0` matches the previous clearance exactly. The old SL markscheme metadata fingerprint was `14771de568a6eb3583529fb8fe434d9403ac87df65521cdb1f644371895a30c4`.

The bounded correction in `tools/build_ib_a5_clearance.js` uses original source ownership only for these two visually reviewed rows, bound to the exact current metadata and page-image hashes below. It never shrinks a **served** crop's rectangle. An actually served whole-page fallback still overlaps the reserved definition and fails. Any changed evidence, owner, box, page or added asset block invalidates the exception. Unreviewed fallback rows retain conservative full-page geometry.

| Evidence under `C:/CodexProjects/PaperDatabases/outputs/previews/` | SHA256 |
| --- | --- |
| `ib_physics_2008_may_3_030c56b9/mark_scheme_preview.json` | `611137f75cb70e70ea2f4cb523e2b36464641b89189022e642fefa344d01c131` |
| `ib_physics_2008_may_3_030c56b9/pages/mark_v011_p011.png` | `5ddf4de4be060041d1baef900eecce546c308592f2712e3a78b8e495d338a58e` |
| `ib_physics_2008_may_3_fce874db/mark_scheme_preview.json` | `ad96ea1b91137478adafc36368b31fe53c6d6f26412b9a1840ad141a01ceb3fc` |
| `ib_physics_2008_may_3_fce874db/pages/mark_v010_p010.png` | `c0337c62b519baf81751c1513c47e83969880f2d6caff3749bab51528e92ebff` |

Five focused regression checks pass. A complete clearance run with output captured only in memory also passes: 146 parts, 72 parents, 449 images, two reviewed source-geometry entries and zero reserved rectangle overlaps. It retains all existing test, whole-parent/twin, page, crop and syllabus holds. This validates the boundary correction; it does not independently approve other newly changed image content. No source database, catalogue, native input or existing clearance record was modified during this investigation.
