# ppqviewer consumer registry

Last audited: 2026-07-28

This is the drift detector and capability-awareness map. Update it on every
consumer migration and material module change.

| Consumer | Current status | Location/surface | Shared viewer state | Enabled/known capabilities |
| --- | --- | --- | --- | --- |
| ESAT | Public shared-engine deployment | source `example\esat-compare.html`; checkout `deploy\esatwallop`; public `physicalsmithness.github.io/esatwallop` | live v0.2.15 / API 0.3.0; source v0.2.16 / API 0.4.1 (content-safety gate + readability rework, awaiting sync + push) | image self-mark, post-question review, guesses, timer capture/display, reporting, classifications, drawing, content-safety withholding |
| Chemistry | Live own copy; shared-engine migration not complete | `C:\Claude (not on Gdrive, nor OneDrive)\chemistrydriller` | Donor/consumer, not yet one runtime source | reference booklet, structured papers, mixed question types, maths, split dashboard |
| Chemistry G: mirror | Stale; retire | `G:\My Drive\github local files\chemistrydriller` | Not authoritative | Do not use as source |
| Special Relativity | Intended near-term embed | `C:\Claude (not on Gdrive, nor OneDrive)\Special Relativity Driller` | No ppqviewer adapter recorded here | Requires embedded mount |
| IB Physics | Future consumer; no adapter recorded here | external project | Not connected | Rich tagging/error taxonomy and eventual assistance/history |
| Economics | Future consumer; no adapter recorded here | external project | Not connected | Past-paper data exists elsewhere; adapter/status not recorded here |
| Maths | Nearing readiness — Smith reports many questions analysed (2026-07-28); location/format not yet recorded here | external project | Not connected | Adapter/status not recorded here; onboarding needs: catalogue + config (+ analysis bundle if made, which inherits the content-safety gate) |
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

## Requested capabilities not yet generally available

- central feedback submission;
- analysis/history pages and reopenable prior feedback;
- full timing preference/bank/pause system;
- configurable generic error taxonomy and before/after rating;
- functional flagged/revisit queue and recommendations;
- assistance/teacher replies;
- real accounts/classes and cross-consumer analytics.

— Codex registry refresh for Claude, 2026-07-28
