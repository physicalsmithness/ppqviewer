# C1 source continuity review — 13 September 2026

The freshness failure is a legitimate update to the author's unfinished C1 return. It does not change the accepted 352-ID checkpoint or the existing C1 question/type projection. Refreshing the private input with the existing guarded builder is appropriate; changing or bypassing a hash check is unnecessary.

## Exact change and preserved witnesses

All paths in this table are relative to `C:/CodexProjects/PaperDatabases/Physics Categorisation/returns/PACKET_015_C1/`.

| Source | Previously pinned SHA256 | Current SHA256 |
| --- | --- | --- |
| `FEEDBACK_015.md` | `4b1427696c0399d06243801c7edd73493259194e145be128eb62799871e911d0` | `d82fc334316bfb2233391084a687a16943d89397a2331b54dd273dc2a2ff88c2` |
| `syllabus_tags.csv` | `bcb4422a32db3cbdf50cf89b3040a4ed51e1de8f98071b9bfce9ca67d462f31c` | `1977b4a72c48001ec044bb549c1b959b2786ec5243d64580643555e74c966275` |
| `mark_categories.csv` | `13dd31dd54021e12d603c5bb119cd29da2b61cca38ca23653911cf614efa841b` | `733a2a6ea8bfad1d3d91b8c225b49d9b6ea661062df84913dd20ecbdf5db6259` |

The former feedback bytes are preserved exactly in `_checkpoints/seq_0704_20260912/FEEDBACK_015.md`, with the former hash above. The current bytes also have an exact copy in `_checkpoints/seq_0772_reboot_20260913/FEEDBACK_015.md`. A textual comparison finds only the new seq772 reboot/status preface and a heading identifying the following seq704 report as historical. The entire former report remains unchanged. The preface explicitly says the ordered review is unfinished, later sidecar work remains unmerged, and the original seq352 checkpoint remains available.

The immutable semantic sources remain `_checkpoints/seq_0352/syllabus_tags.csv`, SHA256 `de5822b1ab5dcb379a73e876039970d7b5191b9abc06261cb0e643c3a1448c70`, and `_checkpoints/seq_0352/mark_categories.csv`, SHA256 `0ac203e5e26b671b15a0caf2b13d1b4192b82bedc7847892bfb9be9541396bd5`. Their feedback witness remains SHA256 `3b6d127a5557b04d53c4d78c4ebfb0eac0079999f8516d1c95ebb910d70c42c4`.

## Semantic continuity

An independent in-memory call to `tools/build_ib_c1_analysis.py:build()` passed all existing checks and matched the prior generated input's `parts`, `groups`, `atoms`, `types` and counts exactly. No generated input or clearance was written during this comparison.

| Checked source | Approved rows | Current rows | Continuity result |
| --- | ---: | ---: | --- |
| Syllabus tags | 997 | 2,219, covering 772 IDs | Exact ordered prefix; every occurrence of every approved ID is unchanged. |
| Mark categories | 588 | 1,273, covering 312 retained IDs | Exact ordered prefix; every occurrence of every approved ID is unchanged. |

Scope stays at 133 included, 219 excluded and 420 unmapped native IDs. The delivered-workbook recovery still supplies 19 memberships to 18 included IDs, without changing scope. The reference public build `f6004e904e4c69a8` contains 25 C1 parts, seven typed parts and eight delivered-workbook memberships. No new source ID, source crop, question type or prerequisite interpretation is authorised by this refresh.

## Newly mentioned qualifications

The six qualifications named in the new feedback preface were resolved to exact source IDs using `_seq_run_20260909/reading_log.md`, the native index and the current flat-v5 archive. Against all 454 records in the immutable f600 public catalogue (SHA256 `5096dc718c648a96846a19411be73d71478b127e0aa3a24f45549359e8ff220e`), each has zero exact source-ID hits, zero cross-level-group hits and zero same numbered-parent hits across levels. All 25 existing C1 parts are therefore outside these six source findings.

| Sequence | Source ID | Qualification | Public related records |
| --- | --- | --- | ---: |
| 745 | `ibchem_part_336047bd6c9e5b73` | Retired Q-factor decay: the alternative driven model contradicts explicit switch-off. | 0 |
| 750 | `ibchem_part_297f930f259b643a` | Pendulum energy calculation: a native speed allowance has a printed acceleration unit. | 0 |
| 754 | `ibchem_part_b6a13f27d9df02fd` | SHM acceleration: signed displacement differs from the scheme's magnitude; one listed scheme crop belongs to the preceding part. | 0 |
| 755 | `ibchem_part_ac2863d26ee6bfb6` | Interference: examiner commentary contradicts the physically consistent native key. | 0 |
| 760 | `ibchem_part_bfa1a39c2a707a3f` | Kinetic-energy graph: the source owner recovered criteria from the original scheme page. | 0 |
| 772 | `ibchem_part_005484466a325837` | Phase-shifted acceleration graph: both lead and lag routes are accepted; examiner evidence is limited. | 0 |

This is a source-delta and identity review, not fresh visual proofreading of those six questions or clearance for the later seq353–772 candidates. The current builder already withholds later scope and rejects changes to the approved checkpoint or any appended correction to its IDs. Keep those guards, regenerate private fingerprints and continuity evidence with that builder, then regenerate downstream A1/C1 clearance and verify the final package normally. There is no reason to substitute old feedback paths for current-source freshness or to expand the accepted candidate boundary.
