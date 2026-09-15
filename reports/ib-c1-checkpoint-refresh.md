# C1 source continuity check — 12 September 2026

Staging the tested `243d5f537dba18d2` release correctly stopped when two live author CSV fingerprints changed. The files had appended a second batch of 352 source IDs; they had not changed the first approved checkpoint. The live feedback document still describes the first completed 352-ID checkpoint.

| Source | Approved snapshot rows | Live rows | Continuity |
| --- | ---: | ---: | --- |
| `syllabus_tags.csv` | 997 | 2006 | Exact ordered prefix; every row concerning an approved ID is unchanged. |
| `mark_categories.csv` | 588 | 1183 | Exact ordered prefix; every row concerning an approved ID is unchanged. |

The immutable `_checkpoints/seq_0352` snapshots have exactly the formerly approved hashes: `de5822b1ab5dcb379a73e876039970d7b5191b9abc06261cb0e643c3a1448c70` for syllabus tags and `0ac203e5e26b671b15a0caf2b13d1b4192b82bedc7847892bfb9be9541396bd5` for mark categories. The corresponding live hashes are `bcb4422a32db3cbdf50cf89b3040a4ed51e1de8f98071b9bfce9ca67d462f31c` and `13dd31dd54021e12d603c5bb119cd29da2b61cca38ca23653911cf614efa841b`.

`tools/build_ib_c1_analysis.py` now explicitly selects those immutable, already-assessed snapshots. It checks both the ordered live prefix and every live occurrence of an approved source ID. Changes to an earlier row, an appended correction to an earlier ID or altered snapshot bytes stop the build. Newly appended IDs are observed in the private continuity report and are not silently admitted to this release.

A fresh in-memory build produced **identical `parts`, `groups`, `atoms`, `types` and counts** to the tested C1 input: 133 included, 219 excluded and 420 unmapped; 19 recovered descriptor memberships across 18 included source parts. The published subset therefore remains 26 C1 parts, seven typed parts and eight delivered-workbook memberships. Original question/markscheme images and source IDs are unchanged. Only private evidence fingerprints and the explicit checkpoint-continuity report change.

Without that boundary, an unrestricted rebuild would have admitted 141 additional included source parts before the necessary assessment comparison. That future scope needs a separate source and assessment review. This refresh preserves all current test exclusions and does not authorize any new question.

The previous full release test passed 31 checks and 904 keyboard journeys. A final rebuild must validate the refreshed evidence and compare the serialized public content with the tested release before reusing that behavioural result.
