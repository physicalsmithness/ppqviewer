# Pinned IB release inputs

These private inputs are deliberately separate from preview output. Do not point
release builders back at `dist/physics-inputs/ib-d2.json` or at the Special
Relativity project's working syllabus.

- `a5-syllabus-meta.yaml` preserves the reviewed syllabus bytes. New SR edits
  enter a release only through an explicit reviewed input update.
- `ib-d2-baseline.json` is the replacement baseline frozen on 23 September 2026.
  It is **not** the lost original baseline. A complete comparison proved that
  recovery from this replacement preserves the original reviewed content and
  all non-provenance evidence.
- `ib-data-analysis.json` isolates release assembly from preview regeneration.
- `manifest.json` records their exact bytes and original copy locations.

Preview builders retain their ordinary `dist/physics-inputs` destinations.
Release assembly calls `ibInput({release:true})`; the D2 recovery always uses
the pinned historical baseline. The isolation test substitutes invalid preview
inputs and proves that the complete release input and recovery stay identical.

These files contain private evidence. They must never be copied into a public
deployment. Source-control status is separate from being stored here: newly
created files remain untracked until explicitly committed by name.
