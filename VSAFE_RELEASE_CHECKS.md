# ESAT safety and release checks

This is the release gate for the ESAT consumer. It prepares and verifies local
artifacts only; it does not authorise deployment, publication or a push.

## Content-safety contract

- A deep-v2 record must be structurally resolvable and contain pupil-facing
  analysis. Record presence alone never earns Full or Provisional readiness.
- Declared invalid/damaged content, a consumer-withheld ID, a damage signature,
  or an unresolvable record uses the safe generic review shell and displays
  `Solution pending`.
- The twelve current damaged guided explanations are pinned in
  `example/esat-compare.html`. Remove an ID only after the canonical analysis
  record is repaired and the full corpus scan is clean.
- Source advisories are separate. The three configured source-defective or
  ambiguous questions stay playable; the amber advisory appears before the
  answer and remains in review.

## Repeatable local gate

From the repository root, run:

```powershell
node --check engine\ppqviewer.js
node test\test_ppqviewer.js
node test\verify_analysis_presentation.js
node test\test_content_safety.js
node test\test_categorisation_integration.js
node test\test_chem.js
```

Then assemble into a new disposable folder, never `dist` or `deploy`:

```powershell
node tools\assemble_esat_preview.js --out C:\tmp\ppqviewer-esat-preview
node tools\verify_esat_preview.js --root C:\tmp\ppqviewer-esat-preview
node tools\serve_esat_preview.js --root C:\tmp\ppqviewer-esat-preview --port 8765
```

Check the ordinary page and `?presentation-benchmark` at desktop width and
320 px. Confirm warnings, question crops, option controls, verdict-first review,
alternative-method disclosures, the fifth knowledge state, catalogue hierarchy,
finder search, progress tables and keyboard focus.

## Release identity

`build-info.json` pins the engine, CSS, canonical wrapper, catalogue, current
720-record analysis bundle, 738-record classification bundle and assembled
index. `verify_esat_preview.js` recomputes those hashes and checks that every
local dependency referenced by the assembled page exists.

Deployment remains a separate, explicitly authorised step. When authorised,
run the current sync script, review its output, verify the served build ID and
asset hashes, then publish intentionally. Never hand-edit generated files.
