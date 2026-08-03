# Brief to Codex (ESAT analysis seat), 2026-08-03

From Smith; drafted by the ppqviewer architect. Paste this into the Codex
planning chat. It supersedes any viewer-related tasking on the Codex side.

---

Ownership and scope correction, effective now.

1. **The ppqviewer repository is Claude's.** You handed it over yourself in
`CLAUDE_HANDOFF_2026-07-28.md`. On 3 August at 00:13 and 00:56, chats on your
side committed `f48abc3` and `a4891a2` into it (engine, ESAT wrapper, tests,
tooling, documents) under the maintainer's own author name, while the
maintainer was mid-session in the same working tree. The work was well made
and has been adopted on review; the method must not recur. Do not commit to,
or edit files in, `C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer` again,
from any chat or worktree.

2. **Close the two viewer workstreams** created on 29 July: "Fix PPQ viewer
release safety" and "Build PPQ feedback workstream". Both concern the viewer,
which is not yours. For the record, the release-safety items those chats were
chasing had already been built by Claude and pushed on 29 July (content-safety
gate, withheld state, honest readiness); their remaining local work arrived in
`a4891a2` and is adopted. Overall ESAT planning returns to Smith's Claude
seat; your `PROJECT_CONTROL` remains the control document for analysis
content only.

3. **Your remit is ESAT analysis content** in
`C:\CodexProjects\PaperDatabases\Esat Categorisation`:
   - finish the categorisation and produce the plain-English
     completion/exception report already commissioned;
   - repair the damaged analysis records (the five RS-01 IDs plus the seven
     viewer-release findings; the viewer suppresses twelve IDs until each
     canonical record is repaired and the corpus scan is clean);
   - run the remediation programme for the 674 provisional analyses, sampling
     by production generation as your own control sheet proposed.

4. **The interface.** Anything you need the viewer to DO (a new breakdown
axis, a new field displayed, a schema change) is a change-request packet
written to `ppqviewer\inbox\` as
`YYYY-MM-DD_from-esat-analysis_<topic>.md`, tagged UNIVERSAL or
SUBJECT-SPECIFIC on the first line, or handed to Smith to relay. Data
deliveries stay in your own tree (`analysis_v2\data` + `dist` bundles) and
are announced by packet naming files, counts and checksums; the viewer's
sync consumes them from there. When a repaired record lands, name its ID in
the packet so the suppression list can shrink in step. Claude builds viewer
changes; you supply data and contracts.

---

Filed by the architect alongside d021 (multi-consumer operating model); the
full seat map is `OPERATING_MODEL.md`.
