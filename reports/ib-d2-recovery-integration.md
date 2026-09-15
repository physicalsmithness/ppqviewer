# D2 recovery and private release preparation

The recovered September 9 authored map is now joined to native archive parts in
`dist/physics-inputs/ib-d2-recovered.json`. Its fixed SHA-256 is
`04fec1db6555875d25b8585fabbb1fe8fbb28d578e32eac543df4dc3266a89ae`.
The old `ib-d2.json` and the public collection were not changed by this work.

The source namespace is `d2_sort_2026-09-09@867cbd71ae82`; the export is
`d2_assignment_recovery_2026-09-12_v1`. All recovered product hashes and native
field/locator joins are checked before building. Source files remain read-only.

| Population | Parts | Memberships |
| --- | ---: | ---: |
| Authored ordinary D2 | 552 | 639 |
| DATA retained separately | 17 | 22 |
| Ordinary source-quality qualifications | 2 | 3 |

The old input contained 388 parts, with 321 overlapping these ordinary mappings.
Therefore 231 authored ordinary source IDs were absent from that input. Existing
assessment parent/twin/duplicate reservations, reserved question pages, reviewed
crop/scheme holds, required crop availability and the pre-2026 exam rule leave
184 fixed candidates in 165 parents; 82 of those parts are new to the old input.
The other 368 ordinary parts have explicit private hold reasons. These numbers
are source preflight counts, not a claim that the expanded assessment scope is
cleared.

The two uncertain keys remain in the authored mapping ledger but are explicitly
held with their parents/twins. No answer from the recovery alone is promoted to
automatic marking. The 98 understanding references remain type-level source
evidence; they do not become assessed syllabus tags on individual parts. All 72
versioned type rows remain available, including the unevidenced D2.H1b candidate
and the pack-only D2.4b type. Pack occurrences never enlarge the ordinary bank.

`tools/ib-d2-release.js` independently projects candidates and checks exact
question/part/role attribution, one source rectangle per image, original PDF
metadata and bytes, and overlap with reserved source geometry. Missing or
ambiguous geometry withholds complete D2 parents. Its preliminary pass retained
170 parts in 153 parents, including 74 new parts and 441 offered PNG paths, before
the new D2 assessment holds. It matched 106 MCQ keys to unique original answer
entries and number/answer source lines. Other questions remain manually marked.
This is attribution checking, not individual visual proofreading of every crop.

Two further source-scope holds are documented in
`reports/ib-d2-reviewed-scope-holds.json`: May 2007 HL/SL G3(b) requires relativistic
mass after acceleration. Its qΔV membership is preserved, while the indivisible
retired demand prevents release. The authored A5 S021 review independently
supports that hold.

The release helper's default `prepareRelease()` requires the completed
`reports/ib-d2-reviewed-test-exclusions.json`, an exact witness of all 184 fixed
candidate IDs and the input hash above, current source fingerprints, and no
unresolved relevant assessment items. It applies fresh full-corpus closure and
question-page holds before image checks. It returns `questions`, `taxonomy`,
`fingerprints`, `report` and `clearance`; it does not publish or merge them.
Taxonomy identity uses the versioned code, while `display_code` retains the
authored local label. Current learner level follows the authored operation's
SL/HL classification and preserves the original paper level separately.

Validation: 10 recovery checks and 9 release-preparation checks passed. They cover
written-input reproduction, source hashes, native identities, complete scope
partition, DATA separation, disputed-key holds, current assessment closure,
wrong-part and ambiguous crop rejection, invalid geometry, exact assessment
scope/hash enforcement and original MCQ key evidence. The initial preflight has
`review_complete:false`; final D2 assessment comparison remains a separate gate.
