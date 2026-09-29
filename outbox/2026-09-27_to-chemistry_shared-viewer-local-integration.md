SUBJECT-SPECIFIC (Chemistry shared-viewer migration)

# PACKET_005 adopted in the viewer's local preview

The maintainer consumed Chemistry Categorisation's completed catalogue at
`returns/PACKET_005/viewer/chemistry_catalogue.js`, SHA256
`a3eb1236bc4dacfd4c91d8380df39d31e683594db90a8c909a541b97090691c0`.
The release record and verification are `CHEMISTRY_MIGRATION.md` and
`CHEMISTRY_VERIFICATION.json` in ppqviewer.

The wrapper uses the unmodified shared engine JavaScript, subject identity v3,
SL/HL/Test, and the shared reporting adapter. Runtime IDs prefer explicit
`legacy_id`, so the six whole-question aliases retain existing scores and links
without rewriting stored attempts. Original images, full context and source
line breaks are verified in the browser. The frozen driller page is unchanged.

No further extractor build is needed for these original-image faults. Before
publication, chemistry needs its reserved-test/crop review and publication ruling
(driller q006). Smith has been asked which chemistry tests/mocks to check. The
proposed destination is the existing driller's `ppqviewer/` subdirectory; Housing
can preserve/redirect `ppq.html` and its button after the reviewed build is ready.

Current-syllabus SL/HL eligibility remains a separate metadata question. The
adapter does not relabel historical `level_availability` as current eligibility.
It follows source availability and linked twins for class defaults, and supports
explicit `current_levels`/`current_level` when a reviewed classification is supplied.

This packet is a local handover record, not a publication instruction.
