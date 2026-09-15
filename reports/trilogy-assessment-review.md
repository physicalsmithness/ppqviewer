# Trilogy assessment review — 10 September 2026

Five additional whole questions present in the reviewed Trilogy input should be withheld. Three assessment questions were missed because they were scanned images or had small edits; a further Higher-tier apple question shares the context of a Foundation question already reserved. The additive rules are in [trilogy-reviewed-test-exclusions.json](trilogy-reviewed-test-exclusions.json). This review does **not** certify that every assessment question has been found.

## Confirmed and conservative exclusions

| Current assessment and location | Source question(s) | Evidence and decision |
| --- | --- | --- |
| 2023 electricity test, p4 Q2(a)–(b) | 2018 P1F Q04 | Same copper-wire I–V graph, fuse lead-in and fuse symbol question. Figure 7 becomes Figure 2, and “different resistance” becomes “higher resistance”. Visual comparison confirms the adapted source. Newly withheld. |
| 2024 Foundation test before car safety, p2 Part 1 Q02 | 2019 P2F Q01 | The image repeats the magnetic-force lead-in and all five answer choices for two non-contact forces. The source crop agrees. Newly withheld. |
| 2025 forces 2 test, p4 Q2(a)–(b) | 2020 P2F Q06 and P2H Q01 | The image repeats the paperclip/magnet diagram, weight equation and calculation using 20 paperclips, 1.0 g each, and 9.8 N/kg. Both source tiers agree. The test changes the calculation’s mark allocation. Both parents newly withheld. |
| 2024 Foundation test before car safety, p6–7 Part 2 Q1 | 2022 P2F Q03 | The apple/X diagram, 0.150 kg mass, resultant-force choices and 0→4.9 m/s calculation agree. Already withheld; explicit current-test evidence retained. |
| Same apple question | 2022 P2H Q07 | The Higher-tier source shares the distinctive branch/apple/X diagram and fall scenario, with 0.50 s equal to the Foundation answer. Its requested parts differ. Conservatively withhold the related whole parent; this is not an assertion that every part is identical. Newly withheld. |
| 2024 Foundation test before car safety, p2 Part 1 Q01 | 2018 P2F Q01 | Image-only scalar question has displacement, distance, force and velocity in the same order. Already withheld; evidence retained. |

The seven explicit parent IDs cover five newly withheld parents and two already withheld parents. Parent exclusions are additive to the broad matcher. No source paper from 2026 onward is allowed, independently of these assessment matches.

## Scope and method

The nine named files below were copied from the current shared assessment folder into a local audit directory. Their SHA-256 fingerprints appear in the machine-readable exclusion evidence where relevant. Native text was extracted from all six PDFs and all paragraphs of the three Word files, then ranked against the full available Trilogy/Synergy question database using distinctive short phrases. Candidate rankings are leads, not automatic identity decisions.

Local evidence is under `dist/physics-audit/trilogy-current-tests`: original snapshots, `targeted-native-audit.json`, `candidate-review.json`, and selected page renders in `review/`. The snapshot/extraction helper reads only the nine named tests when explicitly invoked with `--snapshot-current`; ordinary candidate and image review uses local snapshots.

| Current test | Type and inspected scope |
| --- | --- |
| `2. Electricity/2023 electricity test.pdf` | All 10 pages searched; p4 visually compared with source crops. |
| `2. Electricity/2023 Foundation electricity test.pdf` | All 11 pages searched; weak equation/recall matches reviewed in native text. |
| `2. Electricity/Electricity test (whole unit).docx` | All native paragraph blocks searched. Follow-up inspection viewed all 14 embedded images, including the PNG images stored with `.tmp` extensions. They include the wire-length apparatus, LDR and diode graphs, plug wiring and series/parallel reading exercises. The diagrams are now readable audit evidence; their inspection alone is not a source identity match. |
| `5. Forces and motion/1. Early test/Motion wk4 test 2025.pdf` | All 8 pages searched; scan-heavy p2–4 visually read; served bicycle graph checked as a counterexample. |
| `5. Forces and motion/2. Test before car safety etc/2025 test before momentum and car safety (forces 2).pdf` | All 11 pages searched; image-only p4 visually compared with both source tiers. |
| `5. Forces and motion/2. Test before car safety etc/2024 Foundation test b4 car safety.pdf` | All 12 pages searched; p2–7 visually read, with matches compared against source text/crops. |
| `5. Forces and motion/2. Test before car safety etc/resit motion+forces test b4 car safety 2025.docx` | All native blocks searched; all five embedded images viewed. They contain a school logo, trolley ramp, rugby player/tracker photo, answer box and velocity graph; no additional image-only question text was found. |
| `5. Forces and motion/3. Test at end focusing on momentum car safety/motion and forces test 3 2026.docx` | All native blocks searched; all five embedded images viewed. They contain a school logo, skaters, velocity graph, mattress and answer box; no additional image-only question text was found. |
| `5. Forces and motion/3. Test at end focusing on momentum car safety/Motion and forces test 3 FOUNDATION 2024.pdf` | All 9 pages searched; weak common-instruction and momentum matches reviewed in native text. |

The year of an assessment does not determine the year of its copied questions. In particular, the 2026 forces assessment remains part of the exclusion audit.

## Unresolved scanned material

Motion wk4 test 2025 p2 contains a cyclist velocity graph: Y is at 30 s and 5.4 m/s, Z at 70 s; the question asks for distance between Y and Z. Pages 3–4 contain an aircraft distance graph reaching 12,000 m at 50 s, then a deceleration calculation from 250 to 68 m/s at 0.14 m/s². These were visually read. Distinctive transcribed phrases and values did not identify them in the available Trilogy/Synergy source database. The served 2020 P2F Q04 bicycle graph was visually rejected: it is a distance graph to 250 m at 50 s, with a different question. An older or separate-course source is possible but has not been established.

The 2024 Foundation test p3–5 also contains image-only questions about an athlete on starting blocks, an athlete’s distance graph labelled J/K/L, and the reaction force on an aircraft engine. Their distinctive wording did not identify a source in the available database. They remain unresolved.

Additional source leads in the electricity tests identify a wire-length investigation in Synergy specimen set 2 (4F Q08 / 4H Q01), using 3.22 V, 2.18 A and the distinctive table with an anomalous 5.26 Ω result. These parents are outside the current Trilogy input; this pass has not added a new Synergy consumer or claimed a visual review of those source pages.

## Avoiding false identity claims

Several short matches describe different questions. A car accelerating from 2 to 10 m/s in the early test is not identified as the source aeroplane landing at 80 m/s and slowing to 10 m/s under a 750,000 N force. A solar-panel efficiency calculation in the Foundation electricity test is not identified as a scooter battery energy calculation merely because both use standard equation instructions. A typical-speed-of-sound recall phrase, on its own, does not establish which source question was copied. These weak matches were not converted into confirmed source identities.

Full assessment certification still requires resolving unidentified scan content and finishing visual/source checks beyond this bounded pass. The preview must retain its review notice until that work is complete.

The whole-unit Word media follow-up is recorded under
`dist/physics-audit/trilogy-current-tests/review/electricity-whole-unit-media`.
Its inventory binds every displayed image to source document SHA-256
`fa5d655ea7a8d3fcbafb8caec005415e81bc5098b54906d32b30abbb162d8b5a`.
This completes media readability inspection, without claiming that the short
schematic exercises have all been traced to original papers.
