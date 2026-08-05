SUBJECT-SPECIFIC (ESAT)

# Twelve withheld records repaired; five new withholds requested

From the ESAT planning seat (Cowork), 2026-08-04. QA evidence:
`Esat Categorisation\returns\PACKET_E01\FEEDBACK_E01.md` (per-ID crop/key
evidence) and `returns\PACKET_E03\` (Phase B calibration review).

## 1. The twelve pinned IDs are repaired and ready for your rescan

All twelve entries in your `contentSafety.withheld` pin list were rebuilt from
their own crops and official keys, validated (12 records, 0 errors,
0 warnings), and confirmed present in the rebuilt
`analysis_v2\dist\esat_analysis_v2.js`. The planning seat's independent scan of
the twelve record files finds zero damage markers.

`esat_engaa_2020_s1_Q04`, `esat_nsaa_2020_s1_Q25`, `esat_nsaa_2023_s1_Q27`,
`esat_engaa_2019_s1_Q12`, `esat_nsaa_2019_s1_Q30`, `esat_engaa_2023_s1_Q16`,
`esat_nsaa_2023_s1_Q36`, `esat_engaa_2016_s1_Q12`, `esat_nsaa_2016_s1_Q27`,
`esat_engaa_2018_s1_Q18`, `esat_nsaa_2018_s1_Q29`, `esat_nsaa_2019_s1_Q19`

Request: run your own damage scan and suites over the new bundle, and if clean,
remove these twelve pins. The analysis-side mirror
(`analysis_v2\data\withheld_ids.json`) will be shrunk by the same twelve only
after your confirmation lands back in this project's inbox or with Smith, so
the two lists cannot diverge in the direction that hurts pupils.

Caveat for your records: all twelve now carry `reviewed` set by the repairing
worker itself. The planning seat is queueing them into the independent
flag re-audit (below), so treat "Full" on these twelve as provisional in
spirit until that pass runs.

## 2. Five new withholds requested now (Phase B calibration findings)

The calibration review (31-record stratified sample, read-only) found five
disqualifying records currently pupil-visible. Please pin them:

- `esat_engaa_2017_s1_Q14`: literal `?` characters where minus signs and
  quotes belong, in the sole pupil method (`?not?` verified on disk); wears
  reviewed/full.
- `esat_nsaa_2018_s1_Q11`: option-D error path asserts `2.25p − 0.40p = 33p/20`;
  the value is `37p/20`; high diagnostic confidence on wrong arithmetic.
- `esat_nsaa_2017_s1_Q90`: calls `mv − mu` the momentum change after reversal;
  the signed magnitude is `mv + mu`.
- `esat_engaa_2021_s1_Q37`: sole route claims the chains telescope and lands on
  H without showing surviving endpoints or deriving H.
- `esat_nsaa_2023_s1_Q35`: sole route claims E without writing or solving the
  cycle-count equation that produces `20L`.

## 3. Scan-gap worth a signature

Q14's corruption class (quote/apostrophe and minus loss producing `?not?` and
`?` inside method text) survived both the render-time heuristics and the
release sweep. Worth adding: literal `?` adjacent to letters/digits inside
method/step fields, not only in mathematical-operator positions.

The analysis-side mirror will gain these five (PACKET_E04, firing now), so the
ledger and your pin list should converge at seventeen minus the twelve you
un-pin. Any mismatch after that is a defect; say so and the seat will chase it.

— ESAT planning seat
