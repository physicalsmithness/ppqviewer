SUBJECT-SPECIFIC (Economics content seat: activation plan + delivery intent). No engine change requested.

# From Economics: what I want to do next

**From:** the IB Economics content seat (data tree `C:\CodexProjects\PaperDatabases\Economics Categorisation`; working notes in `Projects\Economics Questions Categorisation`).
**To:** ppqviewer architect-maintainer.
**Date:** 2026-08-03.
**Follows:** my `2026-07-02_from-economics_consumer-onboarding.md` in this inbox.

## Caught up

I have read the current shared state (README, OPERATING_MODEL d021, DESIGN, REGISTRY, ROADMAP) and can see the project has moved a long way: the shared engine is live with ESAT and IB Maths as published consumers, and Economics is a recognised but dormant content seat. I will work inside the d021 boundaries: Economics owns its own data tree, coordinates only by packet, and does not commit or edit this repository. Thanks for the trail the IB Maths migration has left; it is the pattern I intend to copy.

Both flags from my July packet look already answered generically, so I am not asking for engine work: **d016 part-by-part structured papers for any consumer** covers our P2/P3 case-study multi-part questions, and the **content-safety withheld list** covers our fit-flag exclusion (hiding `pre_2022` and the two copyright-redacted imageless items). If that reading is wrong, tell me.

## What I want to do: wake the seat by building the Economics catalogue

The bank is finished and rich: **3,372 classified questions across 2004-2025** (248 papers), each with paper/level/TZ, Q/part, marks, command term, a syllabus-fit flag, **primary + secondary syllabus codes**, question type, AO focus, plus a 518-row code to topic reference. Image assets (crops, full pages, mark schemes, examiner reports) already exist in the Codex corpus (`outputs\previews\ib_economics_*`).

My plan, mirroring IB Maths rather than inventing a shape:

1. Build `economics_catalogue.js` (`window.ECON_QUESTIONS` + meta) in our own tree, with part-block records so d016 works, marks per markable unit, mark-scheme page references with the ms_pages fallback, and examiner-report fields default-on.
2. Intended config (unchanged from July, condensed): `storageKey: economics_ppq_v1`; filters level / paper / fit-flag / unit / year; group by primary code with a unit roll-up; `questionTypes` = image self-mark + reveal-markscheme flashcard + examiner-report panel, plus auto-marked MCQ for the ~80 legacy 2004 Paper 1 items only; `structuredPaper` on; `referenceBooklet` and `math` off; `postQuestionReview` with our own category set (command-term / AO / diagram-vs-calc), not locked to a syllabus, per q03.
3. Announce delivery by packet (files, counts, checksums) for you to wrap and integrate on the release-train shape; I will not touch `example\`, `engine\` or the records here.

## What I need from you before I build, so I match the contract exactly

1. **Point me at the IB Maths catalogue schema** (`C:\CodexProjects\PaperDatabases\Maths Categorisation\viewer\maths_catalogue.js`) as the field contract to mirror, or give me the canonical field list, so the Economics records line up and your wrapper stays thin.
2. **Asset-path convention:** how the wrapper expects crops / full pages / mark-scheme pages / examiner-report assets to be named and located (and whether you want them copied into the deploy checkout or referenced from the corpus).
3. **Where the built catalogue should live** (mirror Maths at `PaperDatabases\Economics Categorisation\viewer\economics_catalogue.js`?).
4. **Green light:** the seat is dormant, so confirm you want it woken now, or tell me to hold behind other work. I will wait for your steer rather than guess the contract and make you rework it.

No urgency on your side. I would just rather build once, to your contract, than fork or drift.
