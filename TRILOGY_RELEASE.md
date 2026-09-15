# Trilogy Physics release — 15 September 2026

**Status: assembled and gated, not published.** The bundle is built and every check
passes. It has not been staged into the deployment checkout and nothing has been pushed,
because the AQA publication ruling is Smith's and has not been given.

Deployment repository: `trilogyphysicsppqs`, origin
`https://github.com/physicalsmithness/trilogyphysicsppqs.git`, cloned at
`C:\Claude (not on Gdrive, nor OneDrive)\trilogyphysicsppqs`, main, no commits yet.
Intended URL: <https://physicalsmithness.github.io/trilogyphysicsppqs/>

## What the bundle holds

- 93 whole parent questions, 517 parts, 516 bounded crops.
- AQA Combined Science Trilogy, two topics: 6.2 Electricity and 6.5 Forces.
- Electricity 32 parents / 144 topic parts; Forces 61 parents / 256 topic parts.
- Foundation 49, Higher 44. Papers P1 35, P2 58. Years 2018 to 2025.
- Whole parent questions with shared stems, bounded question and mark-scheme crops.

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

`node test/test_trilogy_release.js` — 15 checks, including a pupil journey through the
actual published files. It asserts that no reserved or withheld parent is served, that no
2026 paper and no Synergy parent is served, that every image is content-addressed, that
assets and references agree exactly, that the estate analytics blocks are present, that the
sign-in position matches the declared settings, and that nothing local, private or
evidential survives into the published catalogue.

It has already earned itself: it caught the `specimen` block carrying the source PDF's
absolute path and sha256 into the public record.

The eight estate gates stay green at 2,426 assertions with the shared-file changes below.

## Shared changes this release required

The wrapper was IB-only by name. Course behaviour is now declared by the catalogue:
`topic_chooser`, `sign_in`, `workspace_chrome`, `upcoming_topics`, `topic_links`,
`classes` and `account_link`. Every default reproduces exactly what `course === "ib"` did
before these fields existed, so an older catalogue behaves as it always has, and the IB
deployment is functionally unchanged.

Two consequences worth knowing. `example/physics-login.js` no longer shows the relativity
coverage link where a course has nowhere to point, and it refuses to invent a class list:
a sign-in gate without real class names is a build error, not a default. The IB deployment
is now one wrapper revision behind head, cosmetically rather than functionally, until its
next release train.

## Settings

`reports/trilogy-release-settings.json` carries the publication ruling, the sign-in
position and the class list as data. Two things are open there:

- **`publication_ruling.granted` is false.** The IB Maths ruling (d014/q12) does not
  inherit. `tools/stage_trilogy_release.js` refuses to write into the checkout without
  Smith's ruling recorded in his own words.
- **`sign_in.enabled` is false, and `sign_in.classes` is empty.** The IB site is gated;
  this one is not, because a gate needs the real Trilogy class names and inventing them
  splits one cohort across two spellings that the teacher tracker cannot rejoin. The
  Trilogy seat writes cohorts in the form `27 Trilogy 11Q`.

## The path to publication

1. Rebuild the input on the host, so `trilogy.json` carries the derived flag:
   `"C:\CodexProjects\PaperDatabases\tools\python\python.exe" tools\build_trilogy_physics.py --exclusions dist\physics-inputs\trilogy-test-exclusions.json`
2. Assemble: `node tools\assemble_trilogy_release.js`
3. Gate: `node test\test_trilogy_release.js`
4. Record the ruling, and the class list if the site is to be gated, in
   `reports\trilogy-release-settings.json`; re-run 2 and 3.
5. Stage: `node tools\stage_trilogy_release.js --write`
6. Smith commits and pushes `main` in the checkout, then verifies the served build rather
   than assuming Pages has updated.
