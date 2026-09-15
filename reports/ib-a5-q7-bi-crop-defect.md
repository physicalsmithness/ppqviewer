# Confirmed source markscheme crop defect

Private source-quality handover, 12 September 2026. No source files, crops, eligibility records or published data were changed by this audit.

The markscheme for **25M.P2.HL.TZ1.Q7(b_i)** is truncated in the supplied PNG. The published PNG is byte-identical, so this defect exists before the viewer applies its display styles. The complete source-page image contains the entire spacetime diagram, including the origin and x′ line; the part crop ends inside the diagram around ct = 3 and omits its lower portion.

- Stable source part: `ibchem_part_89ef1c2cbcbbee95`.
- Source PDF: `C:/CodexProjects/PaperDatabases/IB Papers and MS/exam_papers/may_25/files and resources/Experimental sciences/Physics_paper_2_TZ1_HL_markscheme.pdf`.
- Printed and physical page: **13**. Source entry: **7(b)(i)**.
- Preview: `ib_physics_2025_may_2_22756acd`.
- Metadata: [mark_scheme_preview.json](<C:/CodexProjects/PaperDatabases/outputs/previews/ib_physics_2025_may_2_22756acd/mark_scheme_preview.json:3158>), entry index 25.
- Metadata SHA-256: `390e6126b8c00c11169bca457de5f39af9b0364ee38b4a71ec1cc7b7592e97ea`.

The metadata records crop bounds `[79.68, 268.42, 781.98, 410.47]` and attached diagram bounds `[136.35, 309.12, 355.94, 529.42]`, in PDF coordinates. The crop ends **118.95 points above the diagram bottom**. Its `asset_blocks` entry already identifies the complete diagram, but its `crop_regions` does not include it fully.

| Evidence | Dimensions | SHA-256 |
|---|---|---|
| [Source part crop](<C:/CodexProjects/PaperDatabases/outputs/previews/ib_physics_2025_may_2_22756acd/crops/mark_scheme_7_b__i_v013_p013_01_35099cbaff.png>) | 1816 × 416 | `53e84bb41bae48cc5b89a0934fdbeb134a82ddbaea5c904a4c7e88bdd771d7b2` |
| [Complete source page](<C:/CodexProjects/PaperDatabases/outputs/previews/ib_physics_2025_may_2_22756acd/pages/mark_v013_p013.png>) | 1170 × 827 | `dcc5b07515b5c0b14ccbbc4faf9b4859d13e7009c68cc46ea39028340ebcd960` |
| [Published-bundle asset](<C:/Claude (not on Gdrive, nor OneDrive)/ppqviewer/dist/ibphysics-release/f38b6d4216288094-1789219817545/assets/53e84bb41bae48cc5b89a0934fdbeb134a82ddbaea5c904a4c7e88bdd771d7b2.png>) | 1816 × 416 | `53e84bb41bae48cc5b89a0934fdbeb134a82ddbaea5c904a4c7e88bdd771d7b2` |

Public asset relative path: `assets/53e84bb41bae48cc5b89a0934fdbeb134a82ddbaea5c904a4c7e88bdd771d7b2.png`. The catalogue lists it as this part's sole `markscheme_images` entry.

The attached full diagram is also identified in metadata as `assets/mark_v013_p013_img01_f71d13a24b7441d9.png`, with content SHA-256 `0b233e7b2ad3b784aac0c52544a98310853e040eb916fcf2b377e32d75e359d8`. This is attribution evidence, not a replacement asset approved for publication.

The bounded follow-up inspected this one markscheme paper's entry metadata for attached images crossing the bottom edge of their crop. It found this entry only. That check does **not** certify other papers, text-only crops, other crop edges, or every rendered markscheme. The issue has been left for the source cropper to correct. Any replacement must be reviewed and pass the existing asset-bound release checks before publication.
