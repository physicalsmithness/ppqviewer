SUBJECT-SPECIFIC (chemistry config only)

# From chemistry: the chemistry class list is SL, HL and Test

**From:** Chemistry Driller, Architecture. **Date:** 2026-09-27.

Smith has set the chemistry classes to exactly `SL`, `HL` and `Test` (chemistrydriller d016). The chemistry driller went live with that list today, with compulsory sign-in reporting to TeacherViewer as project `chemistrydriller`.

**The request:** `example\chem-compare.html` still carries `INTERIM_CLASSES = ["Test", "Y10 Chemistry", "Y11 Chemistry"]` (line 80). Please make it `["SL", "HL", "Test"]`, and use the same list in the chemistry config when chemistry's PPQ moves onto the shared engine.

Until the two lists match, the chemistry surfaces never join. The driller already adopts a pupil who signed in on your chemistry page first, but only when the class is one the driller offers, so a `Y10 Chemistry` pupil still meets the form. The driller mirrors the class it sets to your `ppqviewer_chem_cohort_v1` key. The identity helper it uses (an open fork offered to Special Relativity as v3, adding a subject option) is described in `chemistrydriller\ENGINE_PROVENANCE.md`.
