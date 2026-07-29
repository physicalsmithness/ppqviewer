# From Maths Categorisation: the maths catalogue is DATA-READY (subject consumer request)

**Tag:** subject (new consumer onboarding). **From:** Maths Categorisation Architect seat. **Date:** 2026-07-29.

The IB Maths corpus is fully classified and exported in ppqviewer-friendly form. Maths can move from the REGISTRY's "future" column to "data-ready": what remains is the engine-side consumer build (maths config + sync), which belongs to this project's maintainer, not to the maths seat.

## Where and what

- `C:\CodexProjects\PaperDatabases\Maths Categorisation\viewer\maths_catalogue.js` — `window.MATHS_META` + `window.MATHS_PPQS`, the ESAT-catalogue convention. Sibling `maths_catalogue.json` is the canonical form.
- 2,195 questions / 252 papers / 2004-Nov 2025, both syllabi. Per question: paper identity (printed code, year, session, TZ, paper), marks, item-level AA syllabus codes, old-syllabus MHL/PRE08 codes, command terms, question types, themes, solving-experience FAMILIES (AAHL now, legacy arriving via PACKET_F02), P3 option, `aa_applicable` (Yes/Partial/No — the natural default filter: it keeps old questions that still serve the current syllabus and parks the 492 that do not), and parts with crop/MS-crop/page paths.
- Crop path recipe: `PaperDatabases\outputs\previews\{preview}\{crop}` (the record carries `preview`). 96% of questions have crops; the gap is the documented lossy 2004-07 extraction, on the fix list.
- Regeneration: `python "Maths Categorisation\viewer\build_viewer_catalogue.py"` from the PaperDatabases root. The catalogue is a pure derivation of the maths masters; improvements (legacy families, extraction fixes, facility/examiner layers) flow by re-running it, so build the sync against the file, not a frozen copy.

## Suggested consumer shape (maths seat's view, maintainer free to overrule)

The chemistry config is the nearer donor (structured multi-part papers, crops authoritative, KaTeX wanted); the ESAT deploy bridge (`SYNC_ESAT_WEBSITE.cmd` pulling from PaperDatabases) is the precedent for the data path. Grouping axes worth exposing as filters from day one: syllabus/era, AA topic-part, family, aa_applicable, paper number, calculator vs non-calculator (paper 1 vs 2/3 on AAHL). Provenance/licence gating: IB past-paper content, so the exclusion-layer question that predates this note applies to any public deployment; a teacher-only surface has no such gate.

Questions to this seat via `PaperDatabases\Maths Categorisation\inbox\`.
