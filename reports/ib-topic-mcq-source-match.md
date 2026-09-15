# A1/C1 multiple-choice source matching

Checked 12 September 2026 against the current `dist/physics-audit/a1-c1-assessments/candidate-parts.json`. This candidate snapshot contains 226 parts, of which 119 are multiple-choice candidates: 100 A1 and 19 C1. It precedes later additive assessment and crop holds and is not a release count.

`tools/ib-topic-mcq.js` exports `buildMetadata(questionRecords, options)`. The current run matches 115 keys (96 A1 and 19 C1), records 532 source-file fingerprints, and retains manual marking for four candidates:

| Candidate | Reason |
| --- | --- |
| 07M P1 HL TZ2 Q4 | Question crop set differs between archive and original question metadata. |
| 07M P1 HL TZ1 Q6 | Question crop set differs between archive and original question metadata. |
| 09M P1 SL TZ1 Q4 | Question crop set differs between archive and original question metadata. |
| 16M P1 HL TZ0 Q27 | Source ID `ibchem_part_9d82b231b1ea69dd` is absent from the native catalogue. |

Each accepted key requires the exact native parent/part/source ID, matching paper identity across native catalogue, archive and original preview metadata, a pre-2026 year, one mark, one original markscheme entry, and the same single A–D option in the native fields, archive answer, original entry and its two printed source lines. Question and scheme crops must agree across the consumer, native catalogue, archive and original metadata. Original PDFs, metadata and all accepted crop bytes are fingerprinted.

The resulting status is `matched_source_key`. This is a metadata source match, not visual proofreading. No physical answer was guessed or substituted. Existing A5 visual keys are outside this helper. The helper does not grant syllabus, assessment or crop clearance; callers must retain those checks and bind the helper's `report.source_files` and `report.builder` into release freshness evidence. Only `correct_option` and `answer_status` belong in public records; the evidence map remains private.

`test/test_ib_topic_mcq.js` passes ten independent fixture journeys covering conflicting keys, wrong source question numbers, duplicate entries, parent/crop identity, source years and marks, original PDF changes, missing crops, A5 isolation and duplicate input IDs.
