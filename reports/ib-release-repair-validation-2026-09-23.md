# IB release repair validation, 23 September 2026

Build `fac62770fb70f6df` is staged in `deploy/ibphysicsppqs` against deployment
baseline `161b2826569e4c55f1eaab2f6594672638e40c79`. Seven generated files are
staged, with no unstaged deployment changes. Nothing has been committed or
pushed, and this record does not claim live-site verification.

## Repair and retained evidence

Release assembly now reads pinned A5 syllabus, D2 baseline and historical DATA
inputs from `reports/ib-release-inputs/`. Preview refreshes use separate mutable
outputs. The eleven dependent evidence artifacts were rebuilt in a candidate
tree, fully compared with retained originals, and promoted with verified
rollback support. All eleven active files match the promotion receipt.

Original review dates and substantive decisions are preserved. The one checked
historical-impact reporting difference is documented in the candidate validation
receipt: three previously removed questions remain reserved and absent from the
current bundle. The complete public catalogue matches previously gated local
build `03860fb2b708a642`: 543 parts, 1,316 assets and 44 crop notices.

The release runner stops on failure and no longer borrows the SR project's
working syllabus. Staging requires a clean checkout and does not discard
whitespace differences. Both assembly and staging reject an unfinished evidence
promotion. No pending promotion journal remains. The SR working syllabus was
verified unchanged, with SHA-256
`6f563a39c4f51f41ea35b5f557381c2af133e7293fd328aae8e52a0c7270ea9a`.

## Validation

All 27 applicable suites passed across the initial release run and the consumer
continuation, together with the viewer JavaScript syntax check:

- Release verification: 36 checks, 252 real MCQs and 2,016 fresh keyboard journeys.
- Nine evidence, isolation, D2 and staging suites, including 14 transaction fault
  tests and 19 staging checks.
- Eight shared suites: 2,426 assertions.
- Nine consumer suites: 194 checks.

The initial runner correctly stopped on an outdated preview-count assertion.
Only that test was corrected before all nine consumer suites were run
successfully. The retained initial log therefore contains a failure; this is
not a claim that one uninterrupted runner invocation passed.

Testing also reproduced and fixed a report-submission `ReferenceError` caused
by a variable declared outside the submission handler's scope. The regression
checks use mocked transports; no real feedback was sent.

After removing a redundant assembler guard, the first staging attempt correctly
refused the outdated source fingerprint before writing deployment files. The
final assembly was compared with tested build `7df8c498b1ffb20b`: all 1,325
public content/UI files are byte-identical. Only `build_id` and `built_at` in
build metadata changed. All 1,326 staged deployment files were then checked
against the final bundle. No runtime change was introduced after testing.

## Records

- [Migration explanation](ib-evidence-migration-2026-09-23/README.md)
- [Full candidate validation](ib-evidence-migration-2026-09-23/candidate/validation.json)
- [Verified promotion](ib-evidence-migration-2026-09-23/promotion.json)
- [Final public-file equivalence](ib-evidence-migration-2026-09-23/public-bundle-equivalence.json)
- [Initial release gates](ib-evidence-migration-2026-09-23/release-gates-initial.log)
- [Successful consumer continuation](ib-evidence-migration-2026-09-23/consumer-gates-final.log)
- [Successful final staging log](../tmp/ib-stage-run.log)

The private evidence archive has explicit Git ignore exceptions so its nested
copies from `dist/` and `tmp/` can be retained in source control. Source changes
and the archive are still uncommitted; an external backup has not been verified.
