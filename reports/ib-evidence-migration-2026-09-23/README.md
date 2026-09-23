# IB evidence migration, 23 September 2026

This records a provenance migration, not a new content or visual assessment.
The original semantic review dates are retained.

The preview refresh had overwritten `dist/physics-inputs/ib-d2.json`, and the
A5 projection depended on another project's editable syllabus file. The repair
pins independent release inputs under `reports/ib-release-inputs/` and rebuilds
the complete dependent assessment/clearance chain in an isolated candidate tree.

## Retained evidence

- `before/` contains the eleven original active artifacts, identified by
  `originals.json`.
- `preserved-inputs/` retains the other ignored local evidence needed by the
  original clearances, including rendered assessment pages. Its manifest
  distinguishes the replacement D2 baseline from the lost original bytes.
- `candidate/` contains the regenerated records and `validation.json`.
- `recovery-equivalence.json` records the full A5/D2 input comparison.
- `promotion.json` records verified replacement of the active artifacts.

Comparisons retain every question, mapping, source rectangle, image association,
answer, exclusion, and review decision. Only explicitly identified provenance
identities are rebound. Source fingerprint lists may be ordered by path;
question/image order is not discarded. The D2 assessment still pins one exact
recovery checksum and additionally compares its entire input with the original
reviewed recovery, allowing only the proved baseline/builder provenance changes.

One separately checked reporting change is recorded in `validation.json`:
three questions formerly removed from the previous release no longer appear in
the current-release impact list. Each remains reserved and is absent from the
current bundle. Their exclusions and the served question set are unchanged.

## Transaction and recovery

`tools/migrate_ib_release_evidence.js` is a bounded, one-time migration with
`prepare`, `validate`, and `promote` phases. Do not use it as a routine checksum
refresh. It refuses to reuse the old baseline after active evidence changes.

Validation runs in a disposable Node process. Its explicit filesystem overlay
redirects the named artifact paths into `candidate/` and rejects writes outside
that directory. The overlay is never used by normal release assembly or staging.

Promotion rechecks original/candidate hashes and the complete source witness
set, uses verified temporary files and same-directory renames, and retains a
journal while replacements are underway. A caught failure restores originals
only when their identities can be proved. If interrupted or concurrent edits
prevent a verified rollback, `reports/ib-evidence-promotion.pending.json` remains
and blocks assembly and staging. Preserve that journal and inspect its per-file
before/after identities before recovering; never delete it merely to unblock a
release. Both original and candidate copies remain available.

All material here is private and excluded from generated public bundles.
Being in this directory does not mean the files have already been committed or
that an external backup service has been verified.
