# Current IB test exclusion review — 10 September 2026

The current shared-drive tests were compared with the local assessment snapshot. All 125 PDF/DOCX files read under A, B, C, D, E and Data Analysis Tests were byte-identical to their local snapshot counterparts. No document read failed. The additional text/reference pass supplies precautionary candidate links; it does not turn provisional matches into confirmed identities.

The source audit is `dist/physics-audit/current-ib-tests.json`. The detailed coverage check is `dist/physics-audit/ib-test-coverage-validation.json`. Source documents were read only; neither the shared drive nor PaperDatabases was modified.

## Visual checks of pages with little native text

| Current test and page | Visual finding | Original archive question and verified reservation |
| --- | --- | --- |
| `A/A.5 Relativity Test.pdf`, page 17, Q14 | Muons at 3230 m, speed 0.980 c, gamma 5.00, rest half-life 2.20 microseconds; Newtonian and relativistic fractions plus the moving observer explanation. | May 2019 TZ1 Paper 3 Q4, both SL and HL. All six original parts and both whole questions are reserved. |
| `E/E1-E2 Test HL.pdf`, page 10, Q19 continuation | Photoelectric current–voltage graph, including zero current for large negative voltage. | May 2024 TZ1 Paper 2 HL Q11. The continuation and complete original question are reserved. |
| `E/Topic E HL Test.pdf`, page 16 | Same photoelectric graph continuation. | Same reserved May 2024 question. |
| `E/E1-E2 Test HL.pdf`, page 18, Q31 | Calculate the radius of the potassium-40 nucleus. | November 2017 Paper 2 HL Q3(d)(i). The part and complete original question are reserved. |
| `Data Analysis Tests/Data Analysis Test 2024.pdf`, pages 1–5 and 7–9 | These are real scanned question pages: pendulum/string edge, ice under load, and oscillating girders. | Existing image-reviewed source evidence links Q1 to May 2015 TZ2 Paper 2 Q1, Q2 to November 2012 Paper 2 Q1, and Q3 to May 2012 TZ2 Paper 2 Q1. Their linked parts, whole questions and level twins are reserved. |
| `Data Analysis Tests/Data Analysis Test.pdf`, page 1 | Its first pendulum question is the same question shown in the 2024 version. | The older document's own source ledger lists Q2/Q3; the 2024 version supplies the Q1 link used by the reservation closure. |
| `A/A.1/A.1 Test 2024.pdf`, page 20 | Blank page. | No additional question to reserve. |
| `D/d1+d2 HL test.pdf`, page 2 Q5 and page 3 Q6 | Image-only questions about an elliptical orbit: maximum acceleration at perihelion, and an inverse-square force graph as the planet moves from P to A. | The no-candidate ledger rows are genuine readable questions, not blank fragments. No exact source text was found in the full v5 archive. These assess D1 gravitation; they remain unresolved and cannot be treated as evidence that the assessment collection is fully matched. |

## Exact regression identifiers

- Muon question SL parts: `ibchem_part_60adf76c010831ff`, `ibchem_part_122b539743a90cf4`, `ibchem_part_6090a899e8047775`.
- Muon question HL parts: `ibchem_part_e4f58d6b02b604f9`, `ibchem_part_568ef640a6e2c55f`, `ibchem_part_0970847778340ab5`.
- Muon whole questions: `19M.P3.SL.TZ1.Q4`, `19M.P3.HL.TZ1.Q4`.
- Negative-current photoelectric part: `ibchem_part_353ebf785b2f1259`; whole question: `24M.P2.HL.TZ1.Q11`.
- Potassium-40 radius part: `ibchem_part_03aaf7d320927eb2`; whole question: `17N.P2.HL.TZ0.Q3`.
- Pendulum data-analysis whole questions: `15M.P2.HL.TZ2.Q1`, `15M.P2.SL.TZ2.Q1`.

These are named assertions in `test/test_physics_exclusions.js`. They use the current additional test audit when it exists. Separate failure checks confirmed that additional audits with unreadable sources, a different corpus checksum or an invalid schema are rejected.

## Source checksums

The shared-drive and local-snapshot SHA-256 values agree:

| Relative source | SHA-256 |
| --- | --- |
| `A/A.5 Relativity Test.pdf` | `6773c72f49db3951fe572c7956c3a5d9698011b7b2256a556328395b6b8e2ab3` |
| `E/E1-E2 Test HL.pdf` | `9ba329e6831a40d1a9f5f68bafb8a54a1e8cd71c9a9e013de1edb02f5f690604` |
| `E/Topic E HL Test.pdf` | `6ef0985da90e31cf27f161389f5e93aefb6fa01e039a16696f64e92c453f56f9` |
| `Data Analysis Tests/Data Analysis Test 2024.pdf` | `a75a3cdf69493b90e31a0d29cd4b515cfef1a9af083ac582873c9259815d0c4d` |
| `Data Analysis Tests/Data Analysis Test.pdf` | `4d250087b7ae3017117a96a31f748b369314edac8070719d7158728fc7337e4f` |

## Coverage and remaining limits

86 of the 125 current files occur directly as question sources in the repaired matching ledger; another nine occur as paired markscheme sources. The other 30 are mostly answer documents, with several combined/revision documents and an equations test. Every one of the 125 was included in the additional comparison regardless of prior coverage.

Combining all existing test candidates with the additional current-file candidates reserves 7,221 archive parts before practice-specific crop and syllabus checks. This includes 986 parent questions from the existing selected catalogue. There are no linked identifiers missing from the current corpus.

The shared-drive comparison establishes freshness for the 125 PDF/DOCX files. Some existing source rows remain ambiguous, fragmented or without a confirmed archive counterpart. All linked candidates are withheld, but the evidence does not establish that every test item has been identified. RTF files and folders outside this comparison's scope rely on the older matching ledger. Full original pages and unfiltered source documents must not be exposed through the practice viewer.
