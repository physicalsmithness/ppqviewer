# Chemistry shared-viewer release — 27 September 2026

Status: **published and publicly verified** on 27 September 2026. All 59 files
in the live check matched the reviewed release bytes. The old public entry was
also browser-checked: it redirects to the shared viewer and shows Chemistry's
SL/HL/Test sign-in, with no browser errors. The receipt is
`CHEMISTRY_LIVE_VERIFICATION.json`.

- Production: https://physicalsmithness.github.io/chemistrydriller/ppqviewer/
- Existing entry: https://physicalsmithness.github.io/chemistrydriller/ppq.html
- Build: `2026-09-27T14-38-55-510Z_ad41d9e4`.
- Commit: `f44c70119fd34518b79d33cfae377223f9761261`.
- Previous commit: `8d80016df8c8d95870a49425ece9adb595ddb180`.
- Scope: the existing 2,465 question IDs from 2016–2025; no new IDs or 2026 papers.
- Files: 6,601, confined to `ppq.html` and `ppqviewer/`.
- Question/context/markscheme assets: 6,565 unique files; every part has an original.

## Authority and boundaries

Smith explicitly requested publication: “let's get that uploaded to the site to
make it functional.” `CHEMISTRY_RELEASE_SETTINGS.json` records this instruction,
the exact source and legacy catalogue hashes, destination and scope. Older
directions that Smith would push are superseded by this current instruction.

No named Chemistry test reservation or exclusion manifest was found in the
reviewed project decisions, inbox/inter_chat records or categorisation delivery.
This is a record of that finding, not a claim to have compared undisclosed school
tests. Chemistry's authority is this request to repair its existing published
bank; it is not inherited from another subject's publication ruling.

The Chemistry Driller home page and all other tracked files are unchanged. The
old `ppq.html` link redirects within the same origin, preserving query strings
and fragments. Private settings, source paths, reports and the rollback copy
are outside the published directory. Unrelated untracked files were not staged.

## Preserved behaviour

The left data-analysis mastery view retains all 305 Paper 1B parts in their
original 72 groups, ten rating boxes, click-to-filter behaviour and saved-rating
highlight. Canonical finer skill tags remain available in filters. The original
category is bound by stable donor ID and must also be explicitly declared in
the source skill list; it is never guessed from a code prefix or array order.

The right syllabus overview, reference booklet, periodic table, flags, drawing,
navigation and progress remain. Existing ratings use the same production store,
with legacy import only if that store is absent. No historical answers are
assigned an invented owner or sent to the teacher.

Current part images show by default with context/transcription collapsed. The
transcript is temporarily readable while a part image loads or fails; a manual
disclosure choice is respected. The next three part images preload before
supplementary context and scheme images consume the bounded cache.

Production sign-in uses Chemistry's existing SL/HL/Test classes and identity
helper. New attempt reporting is routed to `ppqviewer_chemistry`; existing GA4
and Clarity destinations are retained. Both are disabled on loopback and with
`?preview`, which also uses separate progress. No real pupil attempt was
submitted during verification.

## Evidence and repeatability

`CHEMISTRY_VERIFICATION.json` records the verified preview and source runtime
hashes. The release assembler reconstructs each public record from pinned
source plus the validated legacy mastery mapping, verifies source and bundled
image bytes, and writes a new build rather than editing an old one.

The staging tool checks the exact repository, branch, clean tracked state,
manifest and hashes. The Git-index verifier checked all 6,601 staged blobs
against the reviewed bytes, including line endings, before commit. A subsequent
commit-path audit found zero files outside the two intended viewer paths.

Automated Chemistry checks: 86 adapter, 8 page, 5 reporting, 22 preview/server,
54 loading and 12 release checks. The standing shared-engine suites, shared
loading/behaviour and physics-reporting checks also passed. Real-data parity
checks compared all 72 mastery groups and their selected ID sets.

Browser checks covered the assembled production package on loopback, original
entry redirect with query/hash, default crop/disclosures, markscheme reveal,
two-sided dashboards, row filtering and no horizontal overflow. Live byte
verification checks all public scripts/data and booklet files plus selected
question/context/scheme images; it is not an exhaustive remote image crawl.

The old route backup is in
`dist/chemistry-release/2026-09-27T14-38-55-510Z_ad41d9e4-rollback/`.
The complete prior state is also recoverable from the previous Git commit.
No reset, force push, unrelated cleanup or asset deletion was used.

See `CHEMISTRY_FEATURE_GAPS.md` for the comparison with other consumers and
`PROJECT_HISTORY_REVIEW.md` for the decision-history review. Further feature
work must preserve the left data-analysis view and subject-specific strengths.
