# Physics past-paper preview

Built in the shared viewer workspace on 10 September 2026 at Smith's request.
The combined all-course collection remains a local preview.

A1, A5 and C1 have a separate public release at
`https://physicalsmithness.github.io/ibphysicsppqs/`: 159, 144 and 26 parts
respectively. A1 has 136 directly mapped parts; C1 fine coding is pending.
See `IB_PHYSICS_RELEASE.md` and `reports/ib-a1-c1-publication.md` for the
review, publication status and rebuild sequence. Other topics remain local.

## Open and rebuild

Run `RUN_PHYSICS_PREVIEW.cmd`, then open <http://127.0.0.1:8788/>.
The server listens only on this computer and reads the latest successful build.
Rebuilding creates a fresh folder, so old reserved images cannot remain in the
served collection. No source catalogue, test document or database is changed.

The consumer uses the existing shared engine with course-specific browser
progress, topic filters, printed questions, context, markscheme reveal,
self-assessment and drawing. It makes no external attempt reports in preview.

## Requested first group

- IB: A1 kinematics, A5 relativity, E1 atomic structure, E2 quantum physics,
  D2 electric and magnetic fields, and data analysis/experimental method.
  Patrick clarified that the last collection should include historical data
  analysis from 2004 onwards, as well as modern Paper 1B. Old `topic=1B` links
  open the DATA collection; the paper filter still selects actual Paper 1B.
- Trilogy: electricity and forces, assembled from the existing tagged archive.
- Pre-IB: a forces and motion collection using reviewed mappings to the
  school's 4SS0 syllabus. Selected assessed parts retain their printed context.

All nine requested areas are connected. D2 is a supplemental native catalogue
merged before the full IB assessment reservations are applied. A retired D2
classification cannot be promoted by a current tag from another topic.

Counts come from `dist/physics-preview/latest.json`, not this document. Some
IB parts have multiple topic tags, so adding topic counts double-counts them.
IB topic cards and practice counts use parts only, with topic prefixes and
names such as A1 Kinematics and A5 Special relativity. Trilogy currently presents
complete parent questions and their complete schemes, while its topic-part
count includes only parts with an assessed or reviewed mapping to that topic.
Other-topic siblings remain in the full printed context. The count includes
printed Foundation/Higher appearances, not unique cross-tier question families.

The historical IB DATA input verifies all 877 native classified parts against
the full source archive's existing era rule: pre-2016 Paper 2 first questions,
2016–2024 Paper 3 Section A, and 2025 Paper 1B. It does not infer new tags.
The final served selection is smaller after test, page and crop exclusions.
The source has no DATA records for 2021/2022 under that rule. All 2004 candidates
are reserved, so the earliest currently served DATA questions are from 2005.

## Assessment reservations

Patrick's instruction is unconditional: **no 2026 exam papers in any course**,
because they are reserved for mocks. The assembler also withholds later papers
and any record without a dated pre-2026 source. A 2026 school test is evidence
of questions to exclude, not permission to practise 2026 exam papers.

The current assessment sources Patrick identified are:

- `H:\Shared drives\0. Physics (Teachers)\1- IB Folder\3. Assessments`,
  especially the latest A/B/C/D/E tests, including
  `A\A.1\A.1 Test 2026.pdf`.
- `H:\Shared drives\0. Physics (Teachers)\2 - AQA GCSE\Assessments`.
- `H:\Shared drives\0. Physics (Teachers)\3 - Pre-IB`.

IB reservations initially consume the repaired PACKET_006D test ledger and
every possible archive candidate, including uncertain proposals. They expand
through the **full archive**, whole parent questions, HL/SL twins and duplicate
links before selecting practice parts. Questions sharing a source page with
reserved content are withheld too. No whole exam page or PDF fallback is served.
Missing candidate links are reported as unresolved, never interpreted as proof
that a test question is safe for practice.

Trilogy withholds the 23 explicitly selected parts in the 2026 Y10 assessment
plan, including modified selections, their whole parents and connected
Foundation/Higher variants. Other 2025 questions may be used when no other
assessment reservation applies. The broad current-test reservations remain
mandatory and additive. The eight specimen source PDFs have printed 2018
dates; those dates and original set numbers are verified and retained rather
than dropping specimens as undated. Reviewed historical StL forces allocations
add 55 existing part mappings, including three additional parent candidates.

Consumer-only specimen repairs remove one footer-only crop and restore clipped
question-number boxes. One original specimen prints `02.3` twice for two
different prompts; the second occurrence has a distinct local identity and
uses its verified `02.4` markscheme row. The printed label remains unchanged.
Both question and scheme source fingerprints guard that exception. Evidence is
in `reports/trilogy-reviewed-crop-rules.json` and
`reports/trilogy-reviewed-part-identities.json`; source databases are unchanged.

The nine latest Trilogy electricity/forces documents also have a close visual
review. Seven whole parents have durable, additive reservations, including five
that survived the first text pass. These cover changed wire/fuse wording,
image-only non-contact-force and paperclip questions, and the apple context
reused in another tier. The broad current-test list is mandatory even for a
standalone course rebuild; the assembler rejects inputs with stale reservation
fingerprints. Evidence is in `reports/trilogy-assessment-review.md` and
`reports/trilogy-reviewed-test-exclusions.json`.

Pre-IB comparison includes 20 top-level test PDF/Word versions, retaining newer
Word files even when an older PDF exists. The short average-speed formula
question in the forces test reserves its entire 2019 source parent. Patrick
selected the PDF and Word versions as the current Forces assessment on
10 September. The separate Google Doc was not read and is not assumed identical.
The expanded nine-set collection has a source-bound visual comparison against
the 20 available assessment versions; see `reports/preib-expansion-review.md`.
It uses the 77 merged mappings and 298 mappings from completed B01–B03 returns.
Later worklists exist, but their completed returns are not available locally;
the 2,234 extracted archive parts are not all classified. Eight candidate
parents are held for tests.

Printed-choice quality is also checked. Known incomplete IB diagrams/answer
options and their declared twins are withheld using
`reports/ib-reviewed-crop-exclusions.json`; one stray reference-only image is
omitted by its exact content fingerprint. This check is separate from syllabus
and assessment matching.

Current scan coverage: 125 IB PDF/Word documents (all readable and byte-identical
to the local assessment snapshots), 201 GCSE documents (all readable), and the
pre-IB forces test. The comparison reserves possible matches as well as clear
ones. Scanned and rewritten questions require further evidence; successful file
reading alone does not prove complete matching.

When tests change, refresh the two comparisons using the PaperDatabases Python
runtime before rebuilding:

```text
tools/scan-current-ib-tests.py --output dist/physics-audit/current-ib-tests.json
tools/match_trilogy_current_tests.py --preib-test "H:\Shared drives\0. Physics (Teachers)\3 - Pre-IB\PreIB forces and motion test 2024.pdf"
tools/audit_trilogy_assessments.py --snapshot-current
tools/snapshot_preib_current_assessments.py
```

These are local read-and-compare operations. They require access to the shared
drive. The normal preview launcher consumes their saved results; it does not
claim to refresh school assessments on every launch.

The full audit is written outside the served site under `dist/physics-audit`.
It records source hashes, exclusion counts, unavailable content and remaining
uncertainty. Test evidence and unfiltered catalogues are never copied into the
web server's root.

## Source and checks

Canonical new files are `example/physics.html`, `example/physics-config.js`,
`tools/assemble_physics_preview.js`, `tools/physics-test-exclusions.js`,
`tools/build_trilogy_physics.py`, `tools/trilogy_reviewed_topics.py`,
`tools/build_ib_d2.py`, `tools/build_ib_data_analysis.py`,
`tools/build_ib_a5_analysis.py`,
`tools/build_preib_physics.py`, and `tools/serve_physics_preview.js`.
Generated files live only under `dist/`.

The Trilogy input builder uses the existing PaperDatabases Python environment
(it supplies PyMuPDF), reads the database read-only, and crops original PDFs
inside known question bounds. It writes only local preview inputs.

Run `node test/test_physics.js`, `node test/test_physics_exclusions.js`,
`node test/test_physics_supplements.js` and
`node test/test_physics_data_analysis.js` after
assembly. They check viewer interactions, course isolation, source reservations,
parent/duplicate closure, the year embargo, asset hashes and reserved-page
overlap. The PaperDatabases Python runtime also runs
`test/test_trilogy_coverage.py` and `test/test_trilogy_reviewed_topics.py` to check
plan selections, dated specimens, reviewed mappings and source-change rejection.
The eight existing viewer gates also remain required for release.
The A5 projection is checked by `test/test_ib_a5_analysis.py`; shared group
membership, part wording and authored facet guidance are checked by
`test/test_dashboard_memberships.js`. See
`reports/ib-a5-analysis-provenance.md` for the source taxonomy and scope rules.

Publication and comprehensive test-exclusion approval are separate from a
working local preview. Keep the preview notice while unresolved evidence remains.

The original seven-area preview passed all eight existing gates (2,426
assertions) plus the consumer and exclusion suites. The latest build pointer
and its matching unserved audit identify the expanded collection and current
counts. Implementation checks are not a complete content clearance.

The latest build pointer is authoritative for the expanded counts and build
identity. Only the exact reviewed Pre-IB collection has completed its
current-assessment comparison; unresolved IB/Trilogy source matches keep the
combined preview uncleared for pupil release.

Verified expanded build on 10 September: `823f28e9387bdb88`. It contains
1,713 IB parts across 935 whole questions, including 324 DATA parts across 66
questions; Trilogy electricity has 144 topic parts in 32 sets and forces has
256 topic parts in 61 sets; Pre-IB has 17 assessed parts in nine sets.
The final consumer suite passed 94 checks, the supplemental reservation suite
passed, and the Python coverage/review suites passed 25 tests. The unchanged IB
exclusion and DATA paths passed 29 checks and their focused provenance tests.
The served build identity matches the final pointer. Historical 2005 DATA,
markscheme reveal and the final topic totals were verified in the browser.
