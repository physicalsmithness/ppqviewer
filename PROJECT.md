# PROJECT: ppqviewer (the estate's shared past-paper-question viewer engine)

Established 2026-06-29 (kickoff), first-session build 2026-07-01. Lives on the non-sync drive at `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\`. Owned by no subject; tracked as an estate shared asset in `EdTech Overview\SHARED_ASSETS.md` ("ppqviewer" / "Question Tools engine").

## What it is

One shared engine that displays authentic past-paper-question images, lets a pupil self-mark on a 1-to-6 scale, and shows a per-skill dashboard (a last-N tick/cross ribbon plus a 1-to-6 rating heat map, shared colour ramp and intensity formula), with a drawing overlay and an image modal. Every subject runs the SAME engine and supplies only its own config and question data. A universal improvement is made once here and is live for every subject the next time their page opens.

## Why it exists

Chemistry and ESAT each grew their own copy of the same viewer, and the copies drifted. The concrete proof is the prefetch drift: a "longer pre-fetch" improvement (`PREFETCH_AHEAD = 3` with sibling-part warming) landed in the live chemistry copy alone and reached neither the ESAT sibling (one-step preload only) nor the stale G: chemistry mirror. The single-shared-engine model exists to stop exactly this: propagate universal gains automatically, and make each subject aware of the optional capabilities it is not using.

## The model (three layers plus data)

- **Engine (shared, here):** all logic. Filter / order / shuffle / start-number, navigation, the 1-to-6 self-mark, the dashboard, parametrised prefetch, the drawing overlay, the modal, the keyboard map, question loading.
- **Config (per subject):** a required and UNIQUE namespaced storage key, field and label names, the grouping function, prefetch depth, and which optional modules are switched on.
- **Optional modules (opt-in, built here):** reference-booklet deep-link, structured multi-part navigator, question-type plugins (auto-marked MCQ, image self-mark, reveal-markscheme flashcard, examiner-report panel), KaTeX math rendering, post-question "where did you go wrong" interrogation.
- **Data (per subject):** the question catalogue and the asset folders only.

Subjects never edit the engine. A new need is either a new shared capability (made here) or a new opt-in module (made here, switched on in that subject's config). Never a fork.

## Consumers

See `REGISTRY.md` for the live table. In brief: Chemistry (live) and ESAT (live) are the two real copies to fold in; Special Relativity is a possible future migration target (it currently runs a different engine family, not this one); Economics and Maths are possible future consumers with no copy yet.

## Change and notification

Universal changes are made once here and notified into each consumer's inbox, with `CHANGELOG.md` as the record. Subject-specific modules are logged in `REGISTRY.md` so every other subject can see the capability exists and is simply switched off for them. Change-requests arrive in `inbox\`, named `YYYY-MM-DD_from-<subject>_<topic>.md`, tagged UNIVERSAL or SUBJECT-SPECIFIC on the first line.

## Constraints

UK English. Never the "— " (em-dash-with-space) sequence. Single shared engine, namespaced storage required, lose no capability either existing copy has. Published surfaces carry the estate GA4 + Clarity blocks (WEB_KIT). Depart from the brief where there is reason, recorded in `DECISIONS.md`.
