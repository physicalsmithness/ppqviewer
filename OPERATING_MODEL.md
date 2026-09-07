# ppqviewer operating model: seats, boundaries and release trains

Adopted 2026-08-03, d021 (multi-consumer operating model). This file is the
project's role roster in the sense of MetaProject's `INTERCHAT_PROTOCOL.md`;
the mechanics (packets, wake ritual, derive-never-remember) live there, the
seat map lives here. Every chat that touches this project reads this file on
wake, after `README.md`.

## Why this exists: the near-miss of 3 August

In the early hours of 2026-08-03, chats tasked from the Codex side committed
`f48abc3` and `a4891a2` into this repository (engine +307 lines, an ESAT
wrapper rework, new tests and preview tooling, five documents) under the
maintainer's own git author string, while the maintainer seat was mid-session
in the same working tree. The maintainer discovered the commits by git
archaeology, not by being told. The work itself was disciplined and has been
adopted on review; the method was the exact hazard the estate protocol
exists to prevent: two writers in one live repository, no channel between
them, indistinguishable authorship. It cost nothing this time. Unmanaged, the
same pattern eventually costs a silent overwrite in a shared file. Hence a
written seat map with single-writer areas.

The root cause was tasking, not agent initiative: viewer-fixing workstreams
were stood up on the Codex side on 29 July, one day after Codex's own
`CLAUDE_HANDOFF_2026-07-28.md` returned the viewer to Claude. A boundary that
lives only in a handoff document does not survive the next planning chat.
This file is where the boundary now lives, on both sides' reading lists.

## The product, named properly

ppqviewer is the product: one shared engine (`engine\`), per-subject config
and data, opt-in modules; subjects never fork (`PROJECT.md`). Deployments are
consumers wearing deployment names: **esatwallop** (ESAT), **ibmathsppqs**
(IB Maths), the **chemistry driller** (donor app; shared-engine migration
pending), with physics, economics and the Special Relativity embed to come.

Smith's direction (2026-08-03): the chemistry pattern, where the ppq viewer
sits as one module beside adjacent driller/flashcard modules in a subject
app, is the expected shape of most future deployments; ESAT stays
viewer-primary for now. Roughly 60-70% of what any deployment needs is
shared, which is why development stays in this one place rather than
per-subject forks.

## Seats and single-writer areas

| Seat | Where it runs | Owns (single writer) | Never touches |
| --- | --- | --- | --- |
| **Architect-maintainer** (Claude, the standing ppqviewer seat) | Cowork | `engine\`, `test\`, `tools\`, sync scripts, cross-consumer records (README, ROADMAP, DECISIONS, OPEN_QUESTIONS, REGISTRY, CHANGELOG, this file), release assembly, review and integration of every other seat's output | pushing (Smith's act); content seats' data trees (read yes, write no) |
| **Consumer builders** (bounded Claude chats, stood up on demand per deployment) | Cowork | exactly the files their dispatch packet names, normally one consumer's wrapper/config under `example\` plus its tests | `engine\`, other consumers' files, records beyond their own build note |
| **Content seats** (ESAT analysis = Codex; Maths Categorisation; Physics when it joins; Economics dormant) | ChatGPT/Codex or Claude, their choice | their own catalogue/analysis trees (`C:\CodexProjects\PaperDatabases\...` and kin), their own control documents | **this repository, entirely: no commits, no file edits, ever** |
| **Smith** | GitHub Desktop, the browser, the classroom | every push; rulings; visual passes; running the native sync cmds | (n/a) |

Author strings make seats distinguishable in history: the architect commits
as `Claude (ppq architect)`, a builder as `Claude builder (<consumer>)`.
No seat commits under another seat's name. Content seats have no author
string here because they never commit here.

## The channel

Cross-seat traffic is files, per the estate protocol. Change-requests and
delivery notices arrive as `inbox\` packets
(`YYYY-MM-DD_from-<seat>_<topic>.md`, first line tagged UNIVERSAL or
SUBJECT-SPECIFIC; the `PROJECT.md` convention, unchanged). Content
deliveries stay inside the content seat's own tree and are announced by
packet naming files, counts and checksums; the viewer's sync consumes them
from there. The architect reads `inbox\` on wake and before every post.
Builders return a tested diff plus a build note; the architect runs the
gates and commits.

If a chat finds itself about to edit this repository and no packet or
dispatch names it, the correct move is to stop and write a packet instead.
That rule is the whole document in one sentence.

## Planning

Viewer and deployment planning live with the architect. Content seats plan
their own content programmes (Codex's `PROJECT_CONTROL` remains the ESAT
analysis-side control document) and coordinate by packet. The working
template, proven on IB Maths through July: coordination inside Claude, bulk
content production wherever tokens are cheapest, everything crossing the
boundary as data plus packets. ESAT moved onto this template on 2026-08-03;
the two Codex-side viewer workstreams ("Fix PPQ viewer release safety",
"Build PPQ feedback workstream") are closed, and their useful output has
been adopted into this repository (see d021).

## Release trains, one per consumer

Nothing publishes because a suite went green; deployment is always Smith's
explicit act.

- **Gates (all trains):** `node --check` on the engine, then the eight suites
  (`test_ppqviewer`, `test_chem`, `test_content_safety`,
  `verify_analysis_presentation`, `test_categorisation_integration`,
  `test_economics`, `test_pulse`, `test_vocabulary`), plus the consumer's own
  checks (`VSAFE_RELEASE_CHECKS.md` for ESAT).
- **Assert invariants, echo counts.** A gate pinned to a snapshot of a content
  seat's data goes red when that data IMPROVES, which teaches its owner to
  ignore it. On 2026-09-05 nine assertions failed across two suites purely
  because two seats had delivered what was asked of them. Pin the rule that
  protects a pupil; put the number in the message instead.
- **ESAT:** architect confirms gates; Smith runs `SYNC_ESAT_WEBSITE.cmd`,
  reviews `deploy\esatwallop` in GitHub Desktop, pushes; the served build ID
  is verified afterwards.
- **IB Maths:** the architect re-assembles site files on wake and whenever a
  regeneration packet lands (d015, maintainer syncs and Smith pushes); bulk
  assets and the build-info stamp complete natively via
  `SYNC_IBMATHS_WEBSITE.cmd`; Smith reviews and pushes.
- **Chemistry, physics, later consumers:** each gets the same shape when it
  goes live: an assembly path the architect can run, a native cmd for bulk,
  a deploy checkout Smith pushes.
- **Two deployment shapes, chosen per subject (d026, 2026-08-17).** A
  consumer either gets a site of its own (`esatwallop`, `ibmathsppqs`, and
  `ibphysicsppqs` when it launches) or lives as a sub-path inside a subject
  site that already exists (`ibeconomics/ppqviewer`). The second is new: the
  assembler writes one folder inside another project's working copy and
  touches nothing else in it, and Smith pushes that project's repo rather
  than a deploy checkout of ours. A sub-path consumer inherits neither
  analytics nor styling from its host; both are decisions, not defaults.

## On wake (any seat)

Run `node tools\state.js` FIRST, before reading anything. It derives, in one
command, what three successive sessions each spent an hour reconstructing:
head commit, engine version, every deployment's build against head, any pin
that is live at head but missing from a deployment, unpushed checkouts, and
the newest inbox packets. Then read `README.md`, this file, `ROADMAP.md` and
your `inbox\`. Derive state from disk in the same turn you claim it; a
remembered number about a live estate rots in hours (estate law, Linguics
pilot 2026-07-19).

Two standing hazards the script exists to catch:

- **Published is not tested.** Assembly, push and further source commits are
  three separate acts hours apart. On 2026-08-04 three engine commits landed
  after Smith's push, so the live ESAT site served an unpinned corrupt record
  while head was clean and green at 2,288 assertions. Nothing announced it.
  The script's DEPLOYMENTS block is the announcement; read it before telling
  Smith anything is safe.
- **Never run `git add -A` in this repository.** The working copy is CRLF and
  several blobs are LF, so nine files show as wholly modified when they are
  not; a blanket add rewrites another seat's work as a line-ending flip and
  buries the real diff. Commit by name. The script separates the phantoms
  from real edits so you can see which is which.
