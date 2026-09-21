# A.5 fold-in assessment: there is no ready backlog

Date: 2026-09-17 · Author: Claude (ppq architect) · Status: **findings only, nothing changed**

Answers the question put to a cloud agent on `ibphysicsppqs`: fold in "the other
ready A.5 PPQs" that `WHY_ppqviewer_is_thin_2026-09-13.md` (QoderWork) says are
sitting unreleased. Short answer: they are not unreleased, they are withheld, and
every one of them has a named reason already on file.

## What the investigation report got wrong

It describes the live site as "a frozen 12-September snapshot of 146 question
appearances" and predicts that re-running the release against the 409-question
registry would "roughly triple A.5 on the site, from ~96 to ~409 canonical tasks".

Three things are wrong with that.

1. **The site is not the 12-September snapshot.** Live is build
   `e56bf638d0332e3e`, commit `4e6ee94`, byte-verified 2026-09-14. It carries
   543 distinct parts across six topics, not an A.5-only slice:
   A1 149, A5 138, C1 25, D2 146, E1 55, E2 39.
2. **The re-release against the registry already happened.** The A.5 clearance
   (`reports/ib-a5-release-clearance.json`) was reviewed at
   `2026-09-13T16:27:58.857Z`, the same day the investigation was written, and it
   consumed the reviewed registry. The report describes a job as outstanding that
   had been done hours earlier.
3. **A.5 went down, not up, and on purpose.** The clearance records
   `original_parts: 146` and `retained_source_part_ids: 138`: two crop holds,
   three note-review removals and a geometry hold took eight parts out. The
   shrink is the review working.

## The census

`native_A5_candidates` is 1,178. Every one is dispositioned. Counts are parts,
not deduplicated questions; the medium is markdown, so no shading.

| First withholding reason | Parts |
| --- | ---: |
| Served to pupils | 138 |
| Existing test parent, twin or duplicate reservation | 499 |
| Reviewed A.5-definition parent, twin or duplicate reservation | 171 |
| Shares a reserved question page | 159 |
| Outside authored current A.5 scope, excluded | 81 |
| Outside authored current A.5 scope, unmapped | 51 |
| Outside current syllabus | 46 |
| Reviewed incomplete crop | 10 |
| No cropped markscheme | 8 |
| Reviewed incomplete or wrong crop | 8 |
| Reviewed textual test reference or page hold | 3 |
| Reviewed additional geometry hold | 3 |
| Outside authored current A.5 scope, mixed | 1 |
| **Total** | **1,178** |

Grouped, the 1,040 withheld parts are:

- **832 reserved because of Smith's own tests and mocks**, or because they share a
  page with something reserved. This is the largest block by a distance, and it is
  the gate doing the single job it exists for. Publishing them would hand pupils
  the mock paper.
- **179 outside current A.5 scope.** General relativity, relativistic energy and
  momentum, rest mass: old Paper 3 Option H content that the 2025 syllabus does
  not carry. The investigation report says this itself.
- **29 with a crop or markscheme defect.** These are the only ones that could
  become releasable without a policy change, and they need repair work in
  PaperDatabases, not a re-release.

## What the investigation report got right

- `tools/build_bank_browser.py` line 345 hardcodes
  `live = {'A.1':159,'A.5':144,'C.1':26}` from a saved release report. Those
  numbers are stale in all three places and the teacher bank browser prints them
  as fact. Real defect, worth fixing, and it is in PaperDatabases rather than
  here. It is also the likely source of the report's own confusion about what is
  live.
- The fine question-type layer exists for seven topics out of twenty-five. That,
  not A.5 release volume, is what limits the site's breadth.
- Tags belong in PaperDatabases and the site should not infer them. See d028
  (requirement roles and the topic/course/unit words).

## Recommendation

Do not re-release A.5. The A.5 ceiling is set by test reservation and by the 2025
syllabus, and no amount of re-running the assembler moves either. Growth comes
from new topics with a reviewed type layer, and from the 29 crop repairs if
anyone wants the last few percent of A.5.
