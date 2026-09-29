# Chemistry viewer: feature comparison and next steps

Audit date: 27 September 2026. This is a comparison and recommendation record, not authorization to enable every feature. No engine, wrapper, catalogue, or deployment files were changed for this audit.

## Conclusion

The replacement Chemistry adapter uses the shared viewer and closes the original-image, multipart-text, saved-ID, and stale-engine problems. The most useful next additions are **Report a problem**, chemistry-aware timing, and better access to the classification and examiner material already in the delivered catalogue. **Ask your teacher** is also available in the shared engine but needs its own checked service wiring. Rich question-by-question explanations and current SL/HL eligibility need further chemistry content work.

Chemistry's split Paper 1B/Syllabus dashboard and data booklet are deliberate features to preserve. The latest requested display—current-part crop visible, Question context and Question transcription closed, temporary transcription while the crop loads—is also deliberate. More duplicated question text or an automatically open whole-question crop stack would reverse that decision.

Smith explicitly reaffirmed preservation of the left data-analysis view during release preparation. The parity audit caught and fixed a fine-first grouping regression: the assembler now retains the donor's explicit category by unchanged question ID, only when the canonical source also declares that category. All 305 Paper 1B parts retain their original 72 mastery rows, ten rating boxes, row filtering and saved-rating highlight. Finer skills remain separately filterable. This is a preservation requirement for subsequent feature work; do not replace the split dashboard merely to adopt another subject's layout.

## What was compared, and what “available” means

The comparison uses `example/chemistry-config.js`, `example/chemistry-page.js`, `example/chemistry.html`, their shared engine, the current Physics, IB Maths, ESAT and Economics wrappers, and the assembled source-data contract. A feature in another wrapper is source evidence, not proof that it is on that public site today.

| Consumer | Evidence boundary |
| --- | --- |
| Chemistry | Shared adapter and wrapper published on 27 September; build `2026-09-27T14-38-55-510Z_ad41d9e4`. Publication and the 59-file public byte check are recorded in `CHEMISTRY_RELEASE.md` and `CHEMISTRY_LIVE_VERIFICATION.json`. |
| IB Physics | `IB_PHYSICS_RELEASE.md:31` records publicly verified build `e56bf638d0332e3e` on 14 September, including timer, teacher help, display reports and the “also studied” panel. The newer checkout build `fac62770fb70f6df` is explicitly **staged, not published** in `reports/ib-release-repair-validation-2026-09-23.md:3`. Newer source features, including six named report reasons and lead-topic/twin refinements, must not automatically be described as live. |
| ESAT | Current wrapper and local `deploy/esatwallop/build-info.json` (`d7a8973475453f74`, 7 September) establish assembled capability. The registry's July live row is older than this assembly; it does not prove the September bundle was published. |
| IB Maths | Current wrapper and local `deploy/ibmathsppqs/build-info.json` (`8883b4c2c35b`, 16 September) establish assembled capability. Older publication statements in the registry do not verify this exact build. |
| Economics | Current wrapper demonstrates implementation. `REGISTRY.md:47` calls it wrapped and not published. It is a comparison reference, not a verified public precedent. |

Fresh public fetches from this subtask were unavailable, both through the shell and the web tool. No inference of “live now” is made from a deployment directory. `REGISTRY.md` contains stale version rows and should be read alongside dated release receipts.

## Already caught up

The new Chemistry configuration has original part images; separate stem, lead-in and part transcription with preserved line breaks; printed context; after-answer schemes and marking-era notes; valid MCQ marking and numerical self-assessment; part navigation; question finding; image enlargement/retry and preloading; drawing; flags; saved ratings; attempt history; My Progress; mixed, unattempted and latest-error practice; order/shuffle preferences; compact controls and protected reset. Reference-booklet sections and the periodic table remain available.

It also opts into source twin grouping and class-linked original-paper availability. These are **not** a claim that every old SL question is currently SL content. The wrapper supplies the signed-in learner level, and only explicit current-level fields can support current-syllabus filtering. New live reporting is gated to the production host/path; previews use separate storage and reporting stays off. Stable legacy IDs, including six explicit whole-record aliases, preserve ratings and question links.

Evidence: `example/chemistry-config.js:136`, `:180`, `:205`, `:218`, `:228`, `:276`, `:294`; `example/chemistry-page.js:9`, `:25`, `:43`, `:60`. The report and teacher-help gaps below are distinct from the attempt reporting already wired into the wrapper.

## Prioritized gaps

| Priority | Useful addition | Chemistry today / comparison evidence | Work needed |
| --- | --- | --- | --- |
| 1 | **Report a problem** beside the question | Chemistry has no `problemReport`. Physics has source/reference context and six named reasons in `example/physics-config.js:287`; general display reports have historical publication evidence in `IB_PHYSICS_RELEASE.md:193`. This is particularly useful while pupils encounter old cropping or classification problems. | Small config/service integration. Supply the correct chemistry project and source fields, preserve explicit pupil submission, and test the receiver without sending real reports. Six-reason source implementation is newer than the verified public baseline. |
| 1 | **Examiner detail that explains its provenance** | Chemistry renders only `examiner_comment || examiner_report` (`example/chemistry-config.js:276`). Maths distinguishes part/whole-question commentary, match notes and paper-wide summaries (`example/ibmaths.html:836`); Economics does the same (`example/economics.html:836`). | Mostly adapter/assembly work using existing data: show match/source labels and a closed paper-summary disclosure after answering. Preserve or bind the exact paper-report join key; the assembler currently keeps `meta.paper_reports` but drops the record's `preview` key (`tools/assemble_chemistry_preview.js:11`, `:203`). Do not infer a join from a question ID. |
| 1 | **Cleaner full-markscheme fallback** | Chemistry has scheme crops **and** full pages, but the assembler appends pages to `markscheme_images`, so they are treated as one crop stack (`tools/assemble_chemistry_preview.js:115`). Maths/Economics separate crops, pages for this question and optional all-pages fallbacks (`example/ibmaths.html:902`, `:916`; `example/economics.html:777`). | Preserve separate explicit asset roles and use existing `msPagesOf`/label/open hooks. This is presentation and asset modelling, not missing answer material. Every Chemistry `ms_crop_adequacy` is currently `unknown`; any “this crop is thin” automatic opening or narrow-page claim needs reviewed source metadata. |
| 2 | **Marks-aware timer and extra-time preferences** | Chemistry only sets `timingMode: "none"`; it has no full `timing` config (`example/chemistry-config.js:234`). Physics (`example/physics-config.js:356`), Maths (`example/ibmaths.html:670`), ESAT (`example/esat-compare.html:449`) and Economics (`example/economics.html:563`) configure the shared timing controls. | Small config change after checking Chemistry's own paper durations/marks and SL/HL policy. Keep the timer off by default. Physics's seconds-per-mark rates are physics evidence and must not be copied as chemistry facts. Basic elapsed-time recording is already present; the missing feature is pacing/preferences. |
| 2 | **Fine syllabus, question-type and command-term access** | Chemistry's main filters/progress axes expose topics and Paper 1B skills; search does not include fine syllabus codes, command terms, types or themes (`example/chemistry-config.js:212`, `:218`). These fields already exist in much of the source. Maths exposes type/theme/command filters and progress (`example/ibmaths.html:701`, `:714`); ESAT has structured classifications (`example/esat-compare.html:415`). | Config-only metadata/search/filter additions are possible now, with unknown/unclassified coverage shown honestly. A refined topic → type/detail sidebar is a larger layout decision: the engine returns `_renderSplit()` before dependent-facet rendering (`engine/ppqviewer.js:6384`), so the Physics facet dashboard cannot simply be switched on while keeping Chemistry's two panels. |
| 2 | **Ask your teacher** | No Chemistry `teacherHelp` configuration. Physics configures it in `example/physics-config.js:273`; historically published behaviour is documented in `IB_PHYSICS_RELEASE.md:193`. | Existing shared client plus checked chemistry service/project routing and public question links. Keep current cautious experimental copy: replies may require checking back; do not promise automatic notifications. Pupil names must not enter public replies. This transport is separate from attempt reporting. |
| 3 | **Topic launch page and richer multi-topic explanation** | Chemistry opens the viewer directly and supports `?id=`, but has no topic home/`?topic=` entry route. Its split dashboard groups by the first topic, while My Progress can include all declared topics. Physics has topic entry, lead-demand filtering and “also studied” (`example/physics-config.js:89`, `:95`, `:246`, `:394`). | Topic links/home are wrapper work. Clear secondary-topic labels can use existing metadata, but deciding “assessed here” versus “supporting context” needs chemistry-authored roles. There are 155 multi-topic parts; do not make every tag a main teaching home or invent a lead-demand order. |
| 3 | **Learned so far** | Maths supplies a syllabus tree and per-question references (`example/ibmaths.html:678`). Chemistry has neither configuration nor complete fine-code coverage. | Shared control exists, but it needs a checked Chemistry tree and an agreed rule for records without fine codes. Once active, the engine excludes questions without matching references (`engine/ppqviewer.js:1705`); silently losing the 652 parts without `syllabus_codes` would be misleading. |
| 3 | **Useful “what went wrong” and richer after-answer teaching** | Chemistry has no authored analysis hook or self-assessment taxonomy and disables `postQuestionReview` (`example/chemistry-config.js:294`). Maths configures useful error groups (`example/ibmaths.html:945`); ESAT supplies authored routes, misconceptions and knowledge checks (`example/esat-compare.html:288`, `:471`, `:504`). | A modest agreed chemistry error taxonomy is config work. Per-question markpoint checks, alternative methods, common wrong routes and targeted diagnostics require authored chemistry data. Turning on the generic shell will not create that teaching content. |
| 3 | **Current SL/HL eligibility** | Source-paper filtering and twin preference are already enabled. The delivered catalogue has no explicit `current_levels` or `current_level` records. | Chemistry Categorisation must supply reviewed present-syllabus eligibility. The adapter already supports explicit fields; `level_availability` describes source printings and cannot safely substitute. |

Small optional refinements: set `itemNoun: "part"` so counts match the records (Physics does this at `example/physics-config.js:351`); include readable source metadata where available; consider whole-question shuffle as the initial order, as Physics and the other wrappers do. Chemistry's current ordered default is a preference difference, not a defect—its shuffle options already exist. Do not change these merely to make every subject visually identical.

## What the delivered chemistry data can support

Read-only count of the delivered canonical catalogue, SHA-256 `a3eb1236bc4dacfd4c91d8380df39d31e683594db90a8c909a541b97090691c0`: 638 parents, 2,465 parts. Counts below mean nonempty fields, not an independent classification-quality review.

| Field / content | Parts or records |
| --- | ---: |
| Broad topics | 2,160 parts |
| Fine syllabus codes | 1,813 parts |
| Paper 1B skill tags | 343 parts |
| Command terms | 1,590 parts |
| Question types | 827 parts |
| Themes | 289 parts |
| Examiner comment | 781 parts |
| Examiner match note | 270 parts |
| Paper reports | 80 records, of which 17 have substantive general/difficult/well-prepared text |
| Explicit current SL/HL fields | 0 parts; also absent on parents |
| Authored markpoints or criteria | 0 parts |
| Markscheme crop adequacy | 2,465 `unknown` |

Source: [Chemistry catalogue](<C:/CodexProjects/PaperDatabases/Chemistry Categorisation/returns/PACKET_005/viewer/chemistry_catalogue.js>). The generated bundle retains many classification fields that the current UI does not yet use; this is not a request to have the content task redo them.

## Decisions from the project record that constrain the next round

- **One shared engine, subject-specific configuration and data.** `DESIGN.md:3` and `:34` deliberately preserve Chemistry's split dashboard and booklet; `ppqviewer_divergence_census.md:13` distinguishes this PPQ lineage from the separate driller/event-log engines. “Catch up” does not mean copying every unrelated driller feature.
- **Names and fields are a contract, not permission to guess content.** `CATALOGUE_CONTRACT.md:66` protects stable IDs; `:108` requires code names; `:126`–`:140` describe examiner provenance, present-syllabus scope, marking-era warnings and explicit scheme fallback quality. New meaningful metadata should be agreed with the content owner.
- **Teaching categories need roles.** `CATEGORISATION_INTEGRATION.md:3`–`:14` separates a canonical main family from secondary/boundary labels. The Physics discussion in `chat transcripts/ib physics ppqviewer 1.md` and its current lead-topic config apply the same distinction to demand versus membership. Chemistry topic/type display should not manufacture such roles from unordered tags.
- **Presentation does not author explanations.** `PRESENTATION_BENCHMARK.md:17`–`:25` specifies readable crops, 44 px controls, narrow-screen behaviour and a clear after-answer sequence. It explicitly leaves authored analysis and correctness unchanged.
- **Pupil controls were deliberately simplified.** `chat transcripts/codex add physics past papers.md:374`, `:541`, `:604`, `:757`, `:1092` document off-by-default timing, completed questions included, explicit order choices, learner level versus historical print level, question tools and cautious experimental teacher-help wording. The latest Chemistry user preference for collapsed context/transcription supersedes older general whole-question defaults.
- **The proposed second “understand now” marks scale is not a shipped feature gap.** `chat transcripts/ib physics ppqviewer 1.md:2822` and `:2828` identify that scale and per-error “understand now” as new work. The existing taxonomy panel is reusable; the new two-scale flow should be decided once in the shared engine. Economics' essay checklist is also recorded as not built, rather than a ready-made feature Chemistry is missing (`REGISTRY.md:47`).
- **Release evidence is separate from source readiness.** `PHYSICS_PREVIEW.md` documents dated local scope and source checks, not current publication. `CODEX_BRIEF_2026-08-03.md:10`–`:25` explains the earlier overlapping-edit problem and the authoring/integration separation; it is historical context, not evidence of a current feature being absent or live.

Full design/contract/census/preview/brief documents above were included in this audit, alongside relevant decision passages in both Physics transcripts. Inbox/outbox and architect-transcript decisions are being reviewed separately by the coordinating task. Keep subsequent feature work bounded: expose usable existing data first, then request the missing chemistry authoring explicitly.
