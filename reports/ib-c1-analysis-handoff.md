# C1 source and taxonomy handoff — 12 September 2026

The normalized adapter is `tools/build_ib_c1_analysis.py`, with default output `dist/physics-inputs/ib-c1-analysis.json`. It reads source workbooks, references, CSVs and the native index without changing them. The output is private build input.

## Reviewed content

The authoritative ordered return is `C:/CodexProjects/PaperDatabases/Physics Categorisation/returns/PACKET_015_C1/`. Its `FEEDBACK_015.md` explicitly ends the current review at input 352. Older full-run drafts are not silently treated as completed current review.

The current `syllabus_tags.csv` has exact native IDs for all 352 reviewed inputs. Its 141 retained C1 parts include eight whose central demand is retired `C.1.X`. Excluding those leaves **133 current C1 parts**, each with `scope_reviewed:true` and an exact join to the native index and flat-v5 archive. All 133 have question crops on disk; 117 have listed markscheme crops present. The remaining 16 need downstream scheme recovery or withholding. These are availability checks, not fresh visual review or assessment clearance.

The input retains each C1 scope row and its CSV record number, with authored `central`, `step` and `assumed` syllabus roles separate. A reviewed current part can be served while its finer type remains unmapped. Assessment exclusions and final crop/context verification still belong to release review.

## Authored taxonomy

The canonical SHMDriller workbook and both supplied copies are byte-identical, SHA256 `a392963bb60707fce2fa9800138e4dc314d3e25bcf2dedc96714976b0085da29`:

- `C:/Claude (not on Gdrive, nor OneDrive)/SHMDriller/reference/C1_counts_dependencies_and_marks.xlsx`
- `C:/Users/patri/OneDrive/Documents/Claude/Projects/_ClaudeBackups/SHMDriller/reference/C1_counts_dependencies_and_marks.xlsx`
- `C:/Users/patri/Downloads/IB_C1_SHM_question_counts_dependencies_and_marks (1).xlsx`

`Question inventory!A1:P207` has 206 canonical items and 312 marks. IDs such as `T4-10b` and `25-AX-F2` are pack aliases. The inventory includes 20 Tsokos mini-test items alongside original past papers, so its denominator is not a native past-paper count.

SHMDriller decision d032 makes `reference/C1_QUESTION_TYPES.md` the current checklist. Its structured `tools/taxonomy_build/tax_content.json` contains **127 distinct types**, matching all 127 Markdown headings and the 127 current `typeconcept.json` entries. The old-to-new translation has 116 old codes; that is not the current checklist size. There are 16 displayed family sections, preserving the thirteen numbered families and the authored 8A/8B/8C and 10A/10B subdivisions.

`typeshares.json` maps all 206 canonical aliases to current types. The adapter preserves names, order, question descriptions, inventory and dependencies. Source-specific marking commentary stays in the private report, rather than becoming an invented pre-answer checklist.

## Analyst handoff

The missing link is an authored mapping from native `source_part_id` values (`ibchem_part_…`) to the descriptors. Pack aliases, printed question labels, source-group IDs and short descriptions alone do not establish a unique join.

For each source part, supply its native ID, directly assessed `C1-n.m` code or codes, primary code where meaningful, separate required/optional concepts, confirmed canonical aliases and source evidence. Keep direct assessment distinct from context/prerequisites and state retired or other-topic scope explicitly. Do not broadcast one concept's dependency footprint to every sibling type.

The optional private crosswalk is `reports/ib-c1-reviewed-native-joins.json`, with `joins:[{source_part_id,canonical_row_id,authored_type,source_row_sha256,...evidence}]`. The row fingerprint uses the builder's `row_sha` function on the current flat-v5 CSV row. Changed source rows or alias/type mismatches are rejected. The initial adapter had empty `atom_codes`; the separate delivered-workbook recovery below now fills a limited subset. `fine_classification_complete:false` remains. Zero mapped types must not be presented as proof that a question type is absent.

The generated report fingerprints every source and the builder and records unmatched IDs and asset availability. Current assessment clearance remains a separate prerequisite for publication. No workbook was authored or exported, and no source paper or identity data was changed.

## Delivered-workbook descriptor examples

`tools/ib_c1_descriptor_recovery.py` now reads `Physics Categorisation/outputs/priority_membership_recovery_c1_2026-09-12/` and the actual delivered `returns/PACKET_007B_C1/c1_question_types.xlsx`. The manifest binds workbook SHA256 `cc4e297f2763ef55fa1b7318564c681f52c7da837bbfd4fb7962211090825a88` and the current flat-v5 corpus. Every exported type is checked against its workbook cells; every example is checked against its source-ID, workbook example cell and literal current-corpus quotation.

The 51 delivered descriptors retain distinct versioned IDs beginning `C1_007B_WORKBOOK_cc4e297f2763:`. The existing 127-type SHMDriller vocabulary is unchanged. Ten delivered family definitions retain their authored wording and order; one has no primary-type membership. The combined private input has 178 types and 26 family records. The public display code may use the authored short code without altering the versioned membership ID.

Of 90 supplied example links, 19 apply to 18 already-included C1 source parts. Against the current 26 published C1 parts, seven parts gain eight memberships covering seven descriptors. Scope remains exactly 133 included, 219 excluded and 420 unmapped source IDs. Three conflicting links, three retired links and examples outside the existing included scope remain unapplied. No example can add a new source part or remove an assessment exclusion.

The delivered workbook does not assign prerequisite or alternative-route roles. Existing dependency arrays, syllabus roles, canonical aliases and level evidence remain unchanged. Exact source rows, conflicts and skipped examples stay in the private report; classification remains partial. All downstream assessment, year and crop gates still apply. Ten read-only tests in `test/test_ib_c1_descriptor_recovery.py` cover these boundaries without writing any workbook.
