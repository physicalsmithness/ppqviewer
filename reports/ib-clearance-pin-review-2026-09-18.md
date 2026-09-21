# Clearance pin review: the one changed input, and why regenerating is safe

Date: 2026-09-18 · Author: Claude (ppq architect) · Status: review complete, nothing regenerated yet

The IB physics assembler refused on 2026-09-18 with
`A5 clearance input changed: tools/assemble_physics_preview.js`. This is the review
that ruling asks for before any clearance is regenerated.

## What actually drifted

Every pinned fingerprint in all four clearances was recomputed and compared.

| Clearance | Pins | Unchanged | Changed | Not checkable here |
| --- | ---: | ---: | ---: | ---: |
| `ib-a5-release-clearance.json` | 1,555 | 1,554 | 1 | 0 |
| `ib-a1-c1-release-clearance.json` | 2,082 | 2,079 | 1 | 2 |
| `ib-d2-release-clearance.json` | 1,726 | 1,726 | 0 | 0 |
| `ib-e1-e2-release-clearance.json` | 1,662 | 1,662 | 0 | 0 |

The single changed file is the same one in both cases:
`tools/assemble_physics_preview.js`. Not one crop, catalogue, analysis file or
markscheme moved.

The two not-checkable entries are A1/C1 pins on
`C:\Users\patri\Downloads\IB_C1_SHM_question_counts_dependencies_and_marks (1).xlsx`
and a copy under `_ClaudeBackups\SHMDriller\reference\`. They are outside the folders
this session can read, so they are unverified rather than missing. A clearance that
pins a file in Downloads is fragile on its own terms and is worth rehoming.

## What changed in it, and why it cannot move a served part

The file was last touched by `ad35e0c` (2026-09-15, "Trilogy adopted and gated"). Most
of that commit's diff on this file is line-ending churn, LF to CRLF, which is the
phantom class `tools/state.js` already warns about. Ignoring whitespace leaves exactly
one substantive hunk, inside `assemble()`:

```
-  const info={build_id:buildId,built_at:...,root:out,courses,pupil_release_ready:false};
+  const pupilReleaseReady=courses.length>0 && courses.every(c=>c.exclusion_review_complete===true);
+  const info={...,pupil_release_ready:pupilReleaseReady,
+    pupil_release_withheld_for:courses.filter(c=>c.exclusion_review_complete!==true).map(c=>c.course)};
```

That derives a release flag instead of hardcoding it false, which is the improvement
that commit describes and should not be reverted.

**`assemble()` is not on the IB release path.** `assemble_ibphysics_release.js` imports
`{ibInput}` from this module and nothing else; `ib-topic-release.js` does the same.
Neither calls `assemble()`, which exists to build the local combined multi-course
preview page and its `build-info.json`. Nothing in the hunk reads a topic, a part, a
crop or an exclusion.

So the pin is correct to have fired, and the change behind it cannot alter which A5 or
A1/C1 parts are selected. Regenerating the two clearances re-stamps a fingerprint over
reviewed drift; it is not a count being edited in place of a review, which is the thing
`IB_PHYSICS_RELEASE.md` forbids.

## Regenerating, and the stop condition

```
node tools\build_ib_a5_clearance.js
node tools\ib-topic-release.js
```

Both print a JSON summary. The counts must not move. A5 stays **138 parts in 68
parents**; A1/C1 stays at **A1 149 and C1 25** eligible parts. If any of those change,
stop: the drift was not confined to the hunk above and the content seat is owed a look
before anything is published.

## Not the cause of today's changes

The three viewer changes waiting to ship (d029 twin collapse, the A5-scoped coverage
link, the chooser counting what practice serves) touch `engine/ppqviewer.js`,
`example/physics-config.js` and `example/physics.html`. None of those is a pinned
clearance input. This blocker dates from 15 September and has been sitting unseen
because nothing has assembled IB physics since the 14th.
