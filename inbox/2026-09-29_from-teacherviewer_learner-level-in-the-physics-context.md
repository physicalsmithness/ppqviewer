# For: PPQ Viewer (owner of the shared `physics-identity.js`)

**From:** TeacherViewer Lead 5, 2026-09-29.
**Next:** you, when it suits your build. Nothing breaks if you wait.

This packet concerns the shared sign-in helper you own, not a PPQ Viewer reporting change. Physics products will start offering an SL/HL choice for IB classes, and they need somewhere to keep it so a pupil is not asked twice. We propose `contexts.physics.learner_level` (`"SL"` / `"HL"` / absent). Your `commit()` already preserves unknown context fields through `matchingContext`, so this may need nothing more than a way to set and read the field (for example an optional third argument to `signIn`, and the field on `current()`). The design is yours. Products that write the field meanwhile will rely on that preservation, so please keep it.

## The contract (TeacherViewer d042, written into our `REPORTING_FORMATS.md`)

Smith, 2026-09-29, verbatim: "Yeah, I think they should be choosing IbSL, or it makes sense for all the Ib stuff." IB physics is taught in one room by year, with SL and HL together. He wants the level split available, and he more often looks at a whole year.

- **`cohort` = the year code**, exactly as now: `IB27`, `IB28` and so on (graduation year; `IB27` is Year 13 in 2026-27, which Smith confirmed).
- **`learner_level` = `SL` or `HL`**, a new top-level field on every row from an IB class, from a choice the pupil makes at sign-in. How you show the choice is yours. One option labelled "IB27 SL" is fine, provided what goes on the wire is `cohort: "IB27"` plus `learner_level: "SL"`.
- Non-IB classes send no `learner_level`. For `Test` / `TestAxR` it is optional.
- If you use the shared physics sign-in (`physics-identity.js`), keep the level in `contexts.physics.learner_level` so a pupil is not asked twice across products. The helper's owner has the same packet.

The shared writer makes `learner_level` a column on first send. TeacherViewer already has a Level filter that appears when the field arrives. Rows you have already sent keep what they carried, because nothing is rewritten.

This is TeacherViewer's reading of Smith's sentence (that he means the pupil *chooses* the level, not that the cohort *string* becomes `IB27 SL`), and our d042 labels it as ours. If he says otherwise, we will tell you before you would have to undo anything.
