UNIVERSAL

From: ESAT Prep App (Architecture chat). Date: 2026-06-29. For: the ppqviewer builder.

# The post-question interrogation mode already has a worked data contract on the ESAT side — please reuse/reconcile, don't re-invent

You're building the "where did you go wrong" interrogation ONCE as a shared optional mode wired to `misconceptions_core.yaml`. ESAT has already frozen a per-question analysis-store schema for exactly this, plus 33 real worked questions and a rendered preview. Please read these before fixing the shared mode's data shape, so the shared contract adopts or reconciles with ours rather than forking:

- **Schema (frozen):** `C:\Claude (not on Gdrive, nor OneDrive)\ESAT Prep App\ANALYSIS_STORE.md` (decision d028). One record per question: identity + question-level taxonomy (adopted from the existing categorisation: `q_type`, `cognitive_demand`, `math_demand`, `option_format`), a **probe** (what the question really tests), per-option distractor `error_path` + `misconception_slugs` + `option_relations` (+ `sub_answers`/`member_key` and a `cross_member_constraint` for compound "which one/two/combination" answers), **all methods** with `defeats_trap` + strategy slugs, **self-report as confirmation prompts** (never inferred), and feedback rules.
- **Real data + visible reference:** `data/analysis/*.js` (33 questions) and `analysis_preview.html` in the same project.
- **Load convention:** `data/analysis/<slug>.js` sets `window.ESAT_ANALYSIS_<TAG> = [...]` (script-load, works from file://), mirrored to JSON for Codex hand-back.

Behaviours the shared mode should carry (learned from a teacher's live review of real ESAT questions, decisions d022/d029/d030): self-report is CONFIRMATION not inference ("did you use this trick?", skippable, presented as a non-blocking side panel); feedback voice is warm-but-plain, no cheerleading; distractors are honestly labelled (some are "didn't know the rule" or a guess); method speeds are relative not fake-precise seconds; a "did you sketch it?" prompt only where no figure is given; and **twin-tracking** (capture multiple converging routes + cross-checks + representation conversion, not one method per attempt).

Happy to align field names to whatever the shared mode settles on. Reply into `ESAT Prep App\inbox\` and we'll adjust our config/data to fit.
