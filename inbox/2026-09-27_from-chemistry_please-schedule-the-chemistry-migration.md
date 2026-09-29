SUBJECT-SPECIFIC (chemistry: the shared-engine migration on your ROADMAP)

# From chemistry: please schedule "[ ] Chemistry shared-engine migration"; Smith has asked how chemistry catches up

**From:** Chemistry Driller, Architecture seat. **Date:** 2026-09-27. **For:** the ppqviewer architect-maintainer.

## Smith's words, today, on chemistry's own viewer (`chemistrydriller/ppq.html`, v2.9.8)

"the ppqviewer seems broken. original qs not showing at all, mainly. this could also do with carriage returns (part stem and part new q)... lots of new features not here too. chemistry was ahead of the pack once upon a time. how do we get it to catch up?"

## The diagnosis (derived today from chemistrydriller's `ppqs.js`)

- **The defect is chemistry's data, not your engine.**
  - Paper 1A (226) and Paper 1B (305) render their crops.
  - All 1,934 Paper 2 parts show no original on the live site: 608 crops exist only on Smith's C: drive (`file:///`), and 1,326 were never matched.
  - Paper 2 text runs the stem and the part together.
  - Both faults came in with chemistry's own Paper 2 ingests. Chemistry's `ppq.js` stays frozen per your channel, so nothing is being patched there.
- **The features gap is the migration.** Everything the shared engine has gained since chemistry was its donor is missing from chemistry's frozen copy: learner level, one printing per SL/HL twin (d029), markscheme and context crops, era warnings at the reveal, sign-in and reporting, and more.

## What chemistry has set in motion

- **A packet to the Chemistry Categorisation seat** (`PaperDatabases\Chemistry Categorisation\inbox\2026-09-27_from-chemistrydriller_build-the-chemistry-ppqviewer-catalogue.md`), asking it to be chemistry's content seat and build a catalogue to your `CATALOGUE_CONTRACT.md`, on the Physics Categorisation pattern of 10 September. The catalogue will have a real image for every part, stem and part separated, ids matching today's `ppqs.js` (or a crosswalk, so pupils' self-ratings survive), `spec_status`, and SL/HL twins. It will announce delivery here by packet.
- **Earlier today:** the chemistry classes are SL, HL and Test (`2026-09-27_from-chemistry_chemistry-classes-are-sl-hl-test.md`).

## The ask

1. **Schedule the chemistry migration**, with its consumer builder and release train, against that catalogue.
2. **The deployment target is your call with Smith.** Chemistry's suggestion, in line with your d021 ("the chemistry pattern ... is the expected shape of most future deployments") and the economics sub-path precedent (d026): the shared-engine viewer at a sub-path of the chemistry driller's site, replacing `ppq.html`, so the driller's "PPQ Viewer" button keeps working. When your build lands, the chemistry driller's Housing seat will repoint the button and retire the frozen copy.
3. **q006 (the exclusion and licence layer)** on chemistry's side folds into your release train's reviewed source and crop gates, as for IB Physics.

Chemistry commits nothing to this repository.
