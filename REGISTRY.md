# ppqviewer consumer registry

Last audited: 2026-07-30 (Claude takeover audit)

This is the drift detector and capability-awareness map. Update it on every
consumer migration and material module change.

| Consumer | Current status | Location/surface | Shared viewer state | Enabled/known capabilities |
| --- | --- | --- | --- | --- |
| ESAT | Public shared-engine deployment | source `example\esat-compare.html`; checkout `deploy\esatwallop`; public `physicalsmithness.github.io/esatwallop` | live v0.2.17 (checkout synced + pushed 2026-07-29, in step with origin; carries content safety, history, progress, timing axes, clusters; public build-identity check owed) | image self-mark, post-question review, guesses, timer capture/display, reporting, classifications, drawing, content-safety withholding |
| Chemistry | Live own copy; shared-engine migration not complete | `C:\Claude (not on Gdrive, nor OneDrive)\chemistrydriller` | Donor/consumer, not yet one runtime source | reference booklet, structured papers, mixed question types, maths, split dashboard |
| Chemistry G: mirror | Stale; retire | `G:\My Drive\github local files\chemistrydriller` | Not authoritative | Do not use as source |
| Special Relativity | Intended near-term embed | `C:\Claude (not on Gdrive, nor OneDrive)\Special Relativity Driller` | No ppqviewer adapter recorded here | Requires embedded mount |
| IB Physics | Future consumer; no adapter recorded here | external project | Not connected | Rich tagging/error taxonomy and eventual assistance/history |
| Economics | Future consumer; no adapter recorded here | external project | Not connected | Past-paper data exists elsewhere; adapter/status not recorded here |
| IB Maths | PUBLISHED (d014, pushed 2026-07-29: 12,585 assets incl. 5,633 complete ms pages at 12:57, final v0.13.0/v0.1.1 assembly at 19:09, origin up to date; Pages-serving browser check owed) | wrapper `example\ibmaths.html` (teacher preview reads assets locally); canonical catalogue `C:\CodexProjects\PaperDatabases\Maths Categorisation\viewer\maths_catalogue.js` (their builder; 2,195 questions, both syllabi); deploy checkout `deploy\ibmathsdriller` (engine 0.13.0 + full asset set incl. complete ms pages) | engine API 0.14.0; wrapper v0.2.0; d016 part-by-part live (5,368 markable-unit records from 2,195 questions; 1,459 questions part-level) | Question-unit marks self-assessment (their per-part marks still carry aggregation quirks); filters: syllabus/AA-fit(default Yes)/topic/subtopic/family/paper/year; d012 taxonomy seeded; timer up; generic feedback shell; 840 missing-ms-crop questions now served by the ms_pages fallback (VF-15) |
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
