# Trilogy Physics release — 15 September 2026

**Status: staged in the deployment checkout, ready for Smith to commit and push.**
Build `a8e2add2b62997e0`. Every check passes. Nothing has been pushed.

Deployment repository: `trilogyphysicsppqs`, origin
`https://github.com/physicalsmithness/trilogyphysicsppqs.git`, cloned at
`C:\Claude (not on Gdrive, nor OneDrive)\trilogyphysicsppqs`, main, no commits yet.
Staged there: 526 files. URL once pushed:
<https://physicalsmithness.github.io/trilogyphysicsppqs/>

## What the site holds

- 93 whole parent questions, 517 parts, 516 bounded crops.
- AQA Combined Science Trilogy, two topics: 6.2 Electricity and 6.5 Forces.
- Electricity 32 parents / 144 topic parts; Forces 61 parents / 256 topic parts.
- Foundation 49, Higher 44. Papers P1 35, P2 58. Years 2018 to 2025.
- Whole parent questions with shared stems, bounded question and mark-scheme crops.

## Publication ruling (Smith, 2026-09-15)

Granted on the same terms as IB Maths: served only to pupils in school where he knows
they have the rights; not publicised outside school; he watches for any traffic spike;
revisit if Google sign-in lands. Recorded in
`reports/trilogy-release-settings.json`. It is a separate ruling, not an inheritance
from d014/q12, because AQA content is a different rights position from IB.

## Sign-in

The site is gated, matching IB Physics. Classes, from Smith on 2026-09-15:

```
Test
27 Trilogy 11P    27 Trilogy 11Q    27 Trilogy 11R
28 Trilogy 10P    28 Trilogy 10Q    28 Trilogy 10R
```

The leading number is the exam-year cohort, which matches the vocabulary the Trilogy
Categorisation seat uses when it reports cohorts. `Test` comes first, as on the IB site.
The gate is browser-local with no password check, and it fails open: if the script does
not load the site opens ungated rather than locking a pupil out, because being unable to
revise is worse than an unreported session.

`example/physics-login.js` refuses to invent a class list. A gate with no real class
names is a build error, not a default, because two spellings of one cohort cannot be
rejoined in the teacher tracker.

## Year ranges, not years

The filter offers **2018–2021** and **2022–2025**, never individual years. Smith's rule
from the IB site on 13 September: individual years are "almost a clue as to which papers
the questions are in the test", because a year whose questions are all withheld shows as
a gap. The same applies here, so the same rule applies. The published
`build-info.json` carries the band names and not the list of served years, for the same
reason. Each question still shows its own exact paper and year in its source label, as
on the IB site.

This is now a catalogue-declared feature (`meta.year_bands`) rather than an IB special
case, so pre-IB gets it by declaring bands.

## Why it is releasable

The Trilogy Categorisation seat closed the exclusion review on 14 September: no question
served by the input matches any question in the school's current electricity or forces
assessments. Method was two passes covering each other's blind spot, 17,323 flattened
text units from `aqa_extraction_plus_calc.db` opened read-only, plus first renders of the
seven assessment pages carrying 45 or fewer native words. Their evidence is at
`C:\CodexProjects\PaperDatabases\Trilogy Categorisation\qa\exclusion_review_2026-09-14`
and its fingerprints are re-verified by the assembler on every build.

Adopted on 15 September with the two Synergy specimen parents reserved first, as the seat
asked, so the certification cannot carry silently into a wider corpus.

## The certification is scoped, and the scope is enforced

`exclusion_review_complete` and `pupil_release_ready` are no longer hardcoded. Both are
derived. The certification in `reports/trilogy-reviewed-test-exclusions.json` names its
scope: topics electricity and forces, serving course Trilogy alone, 93 parents, 517 parts.
`tools/build_trilogy_physics.py` refuses the flag unless the build falls inside that scope,
and `tools/assemble_trilogy_release.js` re-derives the same conclusion independently rather
than trusting the built input.

**Add a topic, or admit Synergy to serving, and the flag drops on its own.** That is
deliberate: the review restarts when the corpus widens, and nobody has to remember it.

## What is withheld

- Every parent reserved by the broad assessment matcher, and every tier twin of one.
- The five parents the 10 September review added, plus the two the 14 September closing
  pass evidenced (`trilogy_2018_p1h::Q06`; `trilogy_2022_p2f::Q07` and twin
  `trilogy_2022_p2h::Q02`), which the matcher had already caught.
- `synergy_specimen_set2_4f::Q08` and `synergy_specimen_set2_4h::Q01`, reserved ahead of
  scope: the wire-length investigation apparatus in the electricity tests.
- All 2026 and later source papers, unconditionally. They are reserved for mocks, and a
  2026 school test is evidence of questions to exclude rather than permission to practise.
- Synergy altogether: the input serves Trilogy only.

Five assessment items remain unidentified. The closing pass searched each on its own
printed signature and all returned zero, so they come from outside this archive. A question
the corpus does not contain cannot be served by it.

## Gates

`node test/test_trilogy_release.js` — 18 checks, including a pupil journey through the
actual published files: that a reserved or withheld parent is never served, that no 2026
paper and no Synergy parent is served, that every image is content-addressed, that assets
and references agree exactly, that the analytics blocks are present, that the class list
is the school's own and contains no IB class, that no individual year is offered as a
filter value, and that nothing local, evidential or governance-related survives into any
published file.

It has already earned itself twice. It caught the `specimen` block carrying the source
PDF's absolute path and sha256 into the public record, on 22 of the 93 questions. It then
caught `build-info.json` publishing the publication ruling and its wording to the web.

The eight estate gates stay green at 2,426 assertions with the shared-file changes below.

## Shared changes this release required

The wrapper was IB-only by name. Course behaviour is now declared by the catalogue:
`topic_chooser`, `sign_in`, `workspace_chrome`, `upcoming_topics`, `topic_links`,
`classes`, `account_link` and `year_bands`. Every default reproduces exactly what
`course === "ib"` did before these fields existed, so an older catalogue behaves as it
always has, and the IB deployment is functionally unchanged.

Consequence worth knowing: the IB deployment is now one wrapper revision behind head,
cosmetically rather than functionally, until its next release train. The assembled local
preview under `dist/physics-preview` is also stale for the same reason, which
`test/test_physics.js` reports as six failures until `RUN_PHYSICS_PREVIEW.cmd` is run.

## The remaining step

Review the checkout, then commit and push. From PowerShell, as a normal user:

```
cd "C:\Claude (not on Gdrive, nor OneDrive)\trilogyphysicsppqs"
git add -A
git commit -m "Trilogy Physics: electricity and forces, 93 questions, 517 parts, build a8e2add2b62997e0"
git push -u origin main
```

Everything in that checkout is generated, so `git add -A` is safe there. It is not safe
in the engine repository, where phantom newline-only changes live.

Then enable GitHub Pages on the repository if it is not already on, and verify the served
build rather than assuming Pages has updated:
<https://physicalsmithness.github.io/trilogyphysicsppqs/build-info.json> should report
`a8e2add2b62997e0`.

The local release record for this build, including the 128 withheld parent IDs and the
three verified evidence fingerprints, is kept at
`reports/trilogy-release-record-a8e2add2b62997e0.json`, because `dist/` is generated and
not versioned.

To rebuild from source at any point (host, PowerShell, normal user; the first line reads
the database read-only and writes only crops that do not already exist). Running these
four is also the way to verify this release independently: the build id should come back
as `a8e2add2b62997e0` and the staging step should report no added, removed or changed
files apart from `build-info.json`, whose only difference is its timestamp.

```
cd "C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer"
& "C:\CodexProjects\PaperDatabases\tools\python\python.exe" tools\build_trilogy_physics.py --exclusions dist\physics-inputs\trilogy-test-exclusions.json
node tools\assemble_trilogy_release.js
node test\test_trilogy_release.js
node tools\stage_trilogy_release.js --write
```
