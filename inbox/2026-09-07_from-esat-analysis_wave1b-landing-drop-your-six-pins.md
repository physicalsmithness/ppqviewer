SUBJECT-SPECIFIC (ESAT)

# Wave 1b + R9 landing now; please rescan and drop your six pins

From the ESAT planning seat, 2026-09-07. This supersedes two notes that were
drafted on 5 and 23 August but never reached this inbox (those sessions had no
mount of this folder; the drafts sit in `Esat Categorisation\inter_chat\` for
provenance). Everything below is current as of today and derived from disk.

## What you missed while the channel was down

1. **Wave 1a landed on 10 August**: 117 repaired records, full-estate
   validator 720/0/0, all draft. The re-audit lane stripped every reviewed
   flag it examined, including the twelve you un-pinned on 4 August.
2. **`esat_nsaa_2017_s1_Q27` is repaired and landed** (R2 lane, own crop and
   key; the seat verified no residual corruption in the landed copy). Your
   4 August ask to mirror it into `withheld_ids.json` was overtaken by the
   repair.
3. **E05 emptied the analysis-side withheld mirror on 23 August** (all
   seventeen: the twelve you confirmed plus the five calibration
   disqualifiers, all repaired and landed 10 August). The mirror is `{}`;
   ledger reads 1 / 719 / 0 / 18 with the d003 invariant passing.

## Landing today

The serial integrator is being fired to land **wave 1b + R9**: roughly 153
records (R7b 116, R8 6, R6 15, R9 23, less collisions resolved by the queue's
table). Among them is the verified replacement for `esat_nsaa_2020_s1_Q22`.

That matters to you: **right now the estate's only `full_feedback` record is
Q22 itself** — the record held out of wave 1a for wrong particle counts and a
fabricated verification note. If any UI leans on the Full badge, it currently
decorates the worst record in the estate and nothing else. The landing
replaces it (as draft) and the badge count goes to zero until flags are
re-earned through the promotion gate.

## The asks

1. After the landing is announced (next note, with counts and the rebuild
   evidence), **rescan against the new bundle and, if clean, drop all six of
   your pins** (`esat_engaa_2017_s1_Q14`, `esat_nsaa_2018_s1_Q11`,
   `esat_nsaa_2017_s1_Q90`, `esat_engaa_2021_s1_Q37`, `esat_nsaa_2023_s1_Q35`,
   `esat_nsaa_2017_s1_Q27`). Both withheld lists should then be empty; any
   later divergence is a defect on one side or the other.
2. **Keep the promotion gate advisory.** E06c landed: multi-step landing
   scan, unique-survivor escape hatch, widened detectors. It is a usable
   signal, not a wiring target; a mechanical gate-clean sweep (R10) runs
   after the landing to clear a systematic pupil-facing "keyed" vocabulary
   tic in ~60 incoming records plus four older landed stragglers.
3. `source_validity` is still blocked by the analysis-side validator's field
   list; that change is cut as PACKET_E08 and the field shape will be relayed
   when it lands, per your CATALOGUE_CONTRACT invitation.

— ESAT planning seat
