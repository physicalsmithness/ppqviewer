# ppqviewer consumer registry

Last audited: 2026-07-30 (Claude takeover audit)

This is the drift detector and capability-awareness map. Update it on every
consumer migration and material module change.

| Consumer | Current status | Location/surface | Shared viewer state | Enabled/known capabilities |
| --- | --- | --- | --- | --- |
| ESAT | Public v0.2.17 (pushed 2026-07-29); the 08-03 integration work (safety catalogue, advisories, presentation benchmark, teaching hierarchy) is adopted at head and awaits its release train | source `example\esat-compare.html`; checkout `deploy\esatwallop`; public `physicalsmithness.github.io/esatwallop` | engine 0.19.0 at head; adopted integration carries resolvable-content safety, 12 suppressions, 3 source advisories, the presentation benchmark and canonical teaching catalogue; public build still pre-dates it | image self-mark, post-question review, guesses, timing, reporting, drawing, Subject → Topic → Family filter/progress/search, content-safety withholding, source advisories |
| Chemistry | Live own copy; shared-engine migration not complete | `C:\Claude (not on Gdrive, nor OneDrive)\chemistrydriller` | Donor/consumer, not yet one runtime source | reference booklet, structured papers, mixed question types, maths, split dashboard |
| Chemistry G: mirror | Stale; retire | `G:\My Drive\github local files\chemistrydriller` | Not authoritative | Do not use as source |
| Special Relativity | Intended near-term embed | `C:\Claude (not on Gdrive, nor OneDrive)\Special Relativity Driller` | No ppqviewer adapter recorded here | Requires embedded mount |
| IB Physics | QUEUED with a deployment name (d026, Smith 2026-08-17): its own site, **`ibphysicsppqs`**, launched standalone first because that scales, then attached to the individual physics drillers as each is ready. Repo does not exist yet; Smith creates it at publish time | content seat `C:\CodexProjects\PaperDatabases\Physics Categorisation` (founded 2026-08-01; extended 2025 spine of 652 coded lines plus an inductive family axis) | Not connected; no catalogue delivered yet | Rich tagging/error taxonomy and eventual assistance/history |
| Economics | WRAPPED, not published (2026-08-06). **Deployment target ruled 2026-08-17 (d026): a sub-path of the existing economics site, `ibeconomics/ppqviewer`, not a repo of its own.** First sub-path deployment in the project: the assembler writes into the `ibeconomics` working copy and touches nothing else there; Smith pushes that repo. Analytics are not inherited (each page on that site carries its own snippet), and whether the viewer wears the site's design system is open. Catalogue delivered 2026-08-03 (1,021 records, 3,498 parts, 2004-2025); wrapper + suite built by the first bounded builder dispatch. Needs Smith at publish time for the deploy repository name and the school-served content ruling | wrapper `example\economics.html`; suite `test\test_economics.js` (91 assertions); catalogue `C:\CodexProjects\PaperDatabases\Economics Categorisation\viewer\economics_catalogue.js`; assets `PaperDatabases\outputs\previews\ib_economics_*` in `crops\`/`pages\` subfolders | engine 0.19.0, no engine change required | Auto-marked MCQ (73 of the 80 legacy 2004 P1; 7 have OCR-scrambled option tables and fall back), marks self-assessment against level bands (3,298), flashcard reveal where the printed marks are unrecoverable (127), structuredPaper part navigation, examiner commentary + paper reports, eight filters incl. syllabus status defaulting to the practisable subset, eight progress axes. NOT built: the essay criteria checklist (1,185 parts), paused into the post-question redesign so economics and maths get one ticking surface |
| IB Maths | PUBLISHED (d014, pushed 2026-07-29: 12,585 assets incl. 5,633 complete ms pages at 12:57, final v0.13.0/v0.1.1 assembly at 19:09, origin up to date; Pages-serving browser check owed) | wrapper `example\ibmaths.html` (teacher preview reads assets locally); canonical catalogue `C:\CodexProjects\PaperDatabases\Maths Categorisation\viewer\maths_catalogue.js` (their builder; 2,195 questions, both syllabi); deploy checkout `deploy\ibmathsdriller` (engine 0.13.0 + full asset set incl. complete ms pages) | engine API 0.14.0; wrapper v0.2.0; d016 part-by-part live (5,368 markable-unit records from 2,195 questions; 1,459 questions part-level) | Question-unit marks self-assessment (their per-part marks still carry aggregation quirks); filters: syllabus/AA-fit(default Yes)/topic/subtopic/family/paper/year; d012 taxonomy seeded; timer up; generic feedback shell; 840 missing-ms-crop questions now served by the ms_pages fallback (VF-15); examiner reports default-on (part/question commentary, match-note provenance, paper subject reports; 2026-08-03) |
| Trilogy Physics | Intended future past-paper viewer | external project | Not connected | Mapping exists elsewhere; no viewer adapter recorded here |
| pre-IB Physics | Intended future past-paper viewer | external project | Not connected | No viewer adapter recorded here |

## Shared capabilities consumers should know about

- namespaced attempt/rating storage;
- filtering, ordered/shuffled navigation and question finding;
- drawing and keyboard control;
- structured papers, reference-booklet linking, mixed question types and maths;
- post-question guess/reflection/rating;
- deep-v2 methods, diagnostics, option evidence and reviewer mode;
- event reporting and lightweight identity;
- timing capture and basic display;
- multi-label classification hierarchy;
- content-safety gate (engine 0.4.0): consumer withheld list + damage
  heuristics; unsafe analysis falls back to the generic shell and can never
  present as Full/Provisional.
- configurable source advisories that keep a question playable and persist in
  review; opt-in guided presentation; and a finder `searchTermsOf` hook.

- session history navigation, review-reopen of prior attempts, persisted
  flags with a Flagged filter, and the pupil "My progress" page
  (engine 0.6.0–0.7.0);
- marks-based self-assessment with the error taxonomy (d012, engine 0.8.0),
  sized to the markable unit since d016;
- **part-by-part structured papers for ANY consumer (d016, engine 0.14.0):**
  chemistry's `structuredPaper` navigator plus consumer hooks `partLabelOf`,
  `partMarksOf`, `msPagesLabelOf`. A consumer whose records form part blocks
  MUST enable it — the suite now fails otherwise (capability parity). Read
  this row before building any new consumer: the engine already carries
  chemistry's multipart model, and IB Maths lost a day to not using it;
- the full timing system (d013, engine 0.9.0): six modes incl. time bank,
  learner extra time, pause, discard; subjects supply only `timing.targetOf`
  + `defaultMode`.

## Requested capabilities not yet generally available

- central feedback submission;
- full timing preference/bank/pause system;
- configurable generic error taxonomy and before/after rating;
- functional flagged/revisit queue and recommendations;
- assistance/teacher replies;
- real accounts/classes and cross-consumer analytics.

— Codex registry refresh for Claude, 2026-07-28
