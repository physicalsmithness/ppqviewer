# ppqviewer

`ppqviewer` is the estate's shared past-paper-question viewer engine. Subjects
supply configuration and question data; shared behaviour belongs here rather
than in subject forks.

**Current maintainer: Claude (from 2026-07-28).**

## Read first

1. `OPERATING_MODEL.md` — seats, single-writer boundaries and release trains
   (d021). Every chat touching this project reads it on wake.
2. `CLAUDE_HANDOFF_2026-07-28.md` — the takeover evidence and requirements
   (historical baseline; current state is ROADMAP's).
3. `CATALOGUE_CONTRACT.md` — what a subject ships to the viewer, and how a
   content seat asks for something the contract does not yet cover. Every
   content seat reads this before building a catalogue.
4. `ROADMAP.md` — active work and phase exits.
5. `CODEX_OWNERSHIP.md` — source locations and the repeatable update path; the
   filename is historical.
6. `REGISTRY.md` — consumers and enabled capabilities.
7. `CHANGELOG.md` — implemented changes.
8. `VSAFE_RELEASE_CHECKS.md` — repeatable safety, assembly and release gate.
9. `PRESENTATION_BENCHMARK.md` and `CATEGORISATION_INTEGRATION.md` — the
   bounded pupil-journey standard and ESAT teaching-catalogue contract.

`KICKOFF.md`, `DESIGN.md`, `DECISIONS.md`, `OPEN_QUESTIONS.md` and the exported
viewer chats preserve architectural and decision history. They are not a
substitute for the current handoff and roadmap.

## Current ESAT release

- Live: <https://physicalsmithness.github.io/esatwallop/>
- Public label: ppqviewer v0.2.17 (checkout synced and pushed 2026-07-29;
  served-build browser verification still owed). The v0.2.15 baseline in the
  2026-07-28 handoff is historical.
- Catalogue: 1,042 questions; Maths/Physics scope: 738
- Question-specific deep feedback: 720
- Readiness after the content-safety gate: 41 Full, 672 Provisional,
  7 Withheld, 18 Solution pending
- Classification: 738/738
- Local gates at head: 2,292 assertions across five suites, 0 failed
  (2026-08-03)

The integration branch adds the completed local safety, advisory, presentation
and teaching-catalogue work on top of the v0.18.x shared engine. It is not a
public release: no generated deployment files are changed by that work.

## Canonical sources

| Concern | Location |
| --- | --- |
| Shared engine | `engine\ppqviewer.js`, `engine\ppqviewer.css` |
| ESAT wrapper | `example\esat-compare.html`, `example\ppq-login.js` |
| Local assembled site | `dist\esat-compare` |
| GitHub Pages checkout | `deploy\esatwallop` |
| Analysis project | `C:\CodexProjects\PaperDatabases\Esat Categorisation\analysis_v2` |
| Assembly command | `SYNC_ESAT_WEBSITE.cmd` |

The source folder's `.git` is empty and is not usable version history. The
deployment checkout is versioned. Create a recoverable source checkpoint before
material viewer changes.

## Updating the ESAT website

Run `SYNC_ESAT_WEBSITE.cmd` from this folder after canonical viewer or analysis
changes. It validates and rebuilds analysis, assembles current assets, writes
cache-busting build information and runs the presentation suite. It does not
stage, commit or push.

For release preparation and browser checking without touching generated public
files, follow `VSAFE_RELEASE_CHECKS.md` and assemble into a fresh temporary
folder with `tools\assemble_esat_preview.js`.

Review `deploy\esatwallop` in GitHub Desktop, commit intentionally and push
`main`. Then verify the exact served build rather than assuming Pages has
updated.

Never edit `dist` or deployment files by hand.

## Product model

- One shared engine.
- Per-subject configuration and data.
- Optional shared modules rather than forks.
- Namespaced storage.
- Pupil-facing content separated from reviewer reconstruction.
- Readiness reflects content that actually resolves in the viewer.
- Structural validation, substantive review, deployment, user acceptance and
  pupil testing remain separate.

— Codex documentation handoff, 2026-07-28
