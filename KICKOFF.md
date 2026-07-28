# ppqviewer kickoff: build the single shared past-paper-question engine

From: EdTech Overview seat (estate coordination for cross-project synergy)
For: the ppqviewer chat (the chat that builds and owns the shared engine in this folder)
Date: 2026-06-29
Canonical copy also at `EdTech Overview\dispatch_packets\ppqviewer_kickoff_packet.md`.

You own `ppqviewer`, the estate's shared past-paper-question viewer engine, living here at `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\`. It is owned by no subject. Chemistry and ESAT already run their own copies; your job is to make one engine they all share. This is a brief, not a rulebook: where you have good reason to depart, do, and record the reason in DECISIONS.

## The decision Smith has made: a single shared engine

All subjects run the SAME engine, not copies. The engine lives here; each subject supplies only its own config and its own question data and loads the one engine. A universal improvement is therefore made once, here, and is live for every subject the next time their page opens. This is deliberate: the divergence census found a "longer pre-fetch" improvement trapped in the chemistry copy alone, and the single-shared-engine model exists to stop exactly that.

- **Engine (shared, yours):** all the logic. Filter / order / shuffle, the 1-to-6 self-mark, the dashboard (last-rating ribbon plus rating-distribution heat map, shared colour ramp and intensity formula), parametrised pre-fetch, the drawing overlay, the modal, the keyboard map, the question-loading and multi-part handling.
- **Config (per subject):** a required and UNIQUE storage key (namespaced, e.g. `chem_ppq_v1`, `esat_ppq_v1`; chemistry's current bare `ppq_scores` is a collision bug to fix), field and label names, grouping function, `PREFETCH_AHEAD`, and which optional modules are switched on.
- **Data (per subject):** the question catalogue and the asset folders only.
- **Subjects never edit the engine.** If a subject needs new behaviour, it is either a new shared capability (made here) or a new optional module (made here, switched on in that subject's config). Never a fork.

## Your first job: consolidate the two real copies, with a longer think

The divergence census (`ppqviewer_divergence_census.md`, in this folder) is your evidence base. It found only two genuine copies: the live chemistry engine (`C:\Claude (not on Gdrive, nor OneDrive)\chemistrydriller\ppq.js` + `ppq.html`; the `G:` chemistry copy is a stale mirror to retire) and ESAT (`C:\Claude (not on Gdrive, nor OneDrive)\ESAT Prep App\app\engine.js`).

The seat's recommendation, passed on as INPUT you are free to disagree with: seed the SPINE from ESAT (it is the cleaner rewrite, with mandatory namespaced storage and a flat attempts-log from which the dashboard is derived), and port chemistry's richer FEATURES onto it as opt-in modules (data-booklet deep-link, multi-part whole-question navigator, the MCQ / flashcard / examiner-report question types, KaTeX). Smith's explicit instruction is that YOU decide this with a proper, longer look at both live copies rather than taking the recommendation on trust. Read both engines in full, weigh them yourself, and record your seed decision and reasons in DECISIONS. The one hard rule: lose no capability that either copy already has. The combined engine must do everything chemistry's does and everything ESAT's does.

## Optional modules to carry

- **Chemistry's data-booklet deep-link** (jump to the relevant page of the data booklet from a question).
- **Post-question "where did you go wrong" interrogation.** ESAT wants this heavily; Smith expects economics, maths and others to want it too, so build it ONCE as a shared optional mode, not an ESAT-only feature. It is the estate's lost-marks idea (record what was got wrong) applied at the viewing layer, so bind its categories to `misconceptions_core.yaml` (the ratified spine at the IB Physics Overview root) rather than inventing a private vocabulary.
- Any other per-copy feature the census surfaces. When in doubt, make it a module rather than baking it into the shared core.

## Change, notification and "what you are not getting" (Smith's requirement)

All consumers are on the same engine AND must be kept aware of changes:

- **Universal changes:** made once here, and you NOTIFY every consumer. Keep a `CHANGELOG.md` in this folder, and on a universal change drop a short note into each consumer's inbox so a subject author is never surprised by behaviour they did not ask for.
- **Subject-specific modules:** when a module is added for one subject, record it in the REGISTRY so every OTHER subject can SEE the capability exists and is simply switched off for them, and can opt in if they want it. Smith's words: subjects "should be aware of what they're not getting." The registry is that awareness surface.
- **REGISTRY.md** (create it): one row per consumer with engine version, copy/location, storage key, and which optional modules are enabled. This is both the drift detector and the what-each-subject-has map.

## Routing: how a subject asks for a change

A subject that wants a change has its own chat drop a note into `ppqviewer\inbox\`, named `YYYY-MM-DD_from-<subject>_<topic>.md`, tagged UNIVERSAL or SUBJECT-SPECIFIC on the first line. You read the inbox, make universal changes in the shared engine, and treat subject-specific ones as config or a new opt-in module. The EdTech Overview seat will tell each current consumer chat that this inbox is the channel, so requests actually arrive here rather than landing in whichever subject Smith happens to be in (which is how the pre-fetch drift happened).

## Consumers (initial registry rows)

- **Chemistry** — live, `C:\Claude (not on Gdrive, nor OneDrive)\chemistrydriller\`. Current most-advanced copy (holds the longer pre-fetch).
- **ESAT** — live, `C:\Claude (not on Gdrive, nor OneDrive)\ESAT Prep App\app\`. Cleaner spine, namespaced storage, wants the post-question interrogation.
- **Special Relativity** — INTENDED consumer (Smith confirmed it is meant to be one; he was unsure whether it is wired yet). It currently runs a different engine family, so treat it as a migration target, not a current copy. Coordinate the migration via the IB Physics Overview seat when it is ready.
- **Economics, maths** — possible future consumers; no copy exists yet.

## First-session output

1. Surface evidence you have read this and the census (name the two real copies, the pre-fetch drift, and the seed question).
2. Lay down the estate operating-model docs in this folder: PROJECT, DESIGN, DECISIONS, OPEN_QUESTIONS, ROADMAP, plus REGISTRY.md and CHANGELOG.md.
3. Read both live engines yourself and record your seed decision in DECISIONS with reasons (agreeing or disagreeing with the seat's ESAT-spine recommendation).
4. Sketch the config-vs-engine split concretely (what fields each subject's config carries) so chemistry and ESAT can migrate onto the shared engine with only a config and data file each.

## Constraints

UK English. Never use the em-dash character. Single shared engine, namespaced storage required. Lose no existing capability. Depart from this brief where you have reason, and record the reason.
