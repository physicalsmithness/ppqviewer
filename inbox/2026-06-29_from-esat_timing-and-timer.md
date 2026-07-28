UNIVERSAL

From: ESAT Prep App (Architecture chat). Date: 2026-06-29. For: the ppqviewer builder.

# Timing / timer belongs in the shared engine — full spec, please build once

ESAT is fundamentally a speed test, so timing is central for us, but it is a UNIVERSAL capability (maths, economics and any timed-paper subject want it). Please build the timer, the modes, and the time-bank in the shared engine, with subjects supplying only their own pacing config. Below is the whole thing ESAT needs (source: our DESIGN §8 and decision d016).

## Ownership split
- **Shared engine owns:** the timer mechanism, the five modes below, the running time-bank, the silent per-attempt capture, and the timing analytics view.
- **Subject supplies (config/data):** per-section pacing (see target-time seeding) and each learner's extra-time multiplier. ESAT will supply these in its config; the engine should not hardcode any pace.

## Five timing modes (a per-session setting `timing_mode`)
1. **none** — no timing shown.
2. **end-only** — timing revealed only after the whole set.
3. **per-question** — timing revealed after each question.
4. **sweep clock** — a large, always-visible running clock.
5. **time bank** — accumulate a balance of +/- seconds against a per-question target; the learner tries to stay "in the black" (banking spare seconds on quick questions to spend on hard ones). This is the one ESAT most wants; it teaches pace-management directly.

## target time (`target_time_s`), how to seed it (d016)
- Seed **uniformly per section** = (section time) / (number of questions), per assessment/section. NOT from cognitive/question difficulty.
- Per-question difficulty-based targets are a pattern to LEARN later from real attempt medians, never assumed up front.
- Apply a **per-learner extra-time multiplier** (access arrangements), asked once at setup, that scales every target (e.g. +25%).

## Silent capture + analytics (works in every mode, even "none")
- Capture `time_ms` per attempt silently from the first version (ESAT's response row already carries `time_ms` + `timing_mode`), so timing analytics work regardless of the visible mode.
- Analytics we want the engine to support: which question TYPES eat the most time, where a learner runs into deficit, and, joined to the analysis/interrogation layer, **which missed trick caused an overspend** (e.g. did the long full-solve cost them 40s a faster elimination would have saved). Timing is most useful cross-referenced with the "where did you go wrong" mode, not in isolation.

## Notes
- ESAT has no timer UI built yet (v1 only captures `time_ms` silently), so there are no timer bugs to inherit; this is a clean spec to build once.
- Please confirm the config shape you want for per-section pacing and the extra-time multiplier, and we'll supply ESAT's values. Reply into `ESAT Prep App\inbox\`.
