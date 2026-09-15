## 2026-09-14: “also studied” co-strand panel (QoderWork)

A part that belongs to more than one topic now says so on the question card,
main strand first. Smith reached the 2014 November Paper 3 HL Q16(a)
simultaneity part through A1 Kinematics and objected that “A1 is obviously such
a minor part of this”: the tags row listed A5 and A1 as equal chips with no
hierarchy. The card now carries a dedicated `.ppq-also-studied` panel above the
source advisory. For Q16(a) it reads “This part is studied in 2 topics — Main:
A5 Galilean and special relativity · A5.9 Simultaneity and signal order; Also:
A1 Kinematics · Close the journey bookkeeping.” `topic_codes[0]` is the primary
strand (the same one `groupKey` uses for progress); each strand shows the family
descriptor the reviewed analysis attached to that topic, falling back to the
atom label, then to the bare topic name.

The panel is a new optional engine hook, `alsoStudiedOf(q)`, rendered by
`_renderAlsoStudied`. It is DOM-inert for every consumer that does not supply
it: the element is only created when `cfg.alsoStudiedOf` is a function, so the
economics, chemistry, ESAT and single-topic physics cards are byte-for-byte
unchanged. It deliberately does not use the `.ppq-notice` channel, preserving
the existing contract that only reviewed practice-focus notes appear there.
`analysisValuesForTopic` was refactored onto a shared `entryInTopic` matcher so
the panel’s descriptors use exactly the filters’ topic-attribution rule.

Bundle `e56bf638d0332e3e` assembles with the same 543 served parts and
per-topic counts as `9392e1ca48403a54`; only the viewer code changed. The full
release suite passed 33 checks, 252 MCQs and 2,016 fresh keyboard journeys;
`test_physics` (99), `test_physics_e_topics` (9, including a new co-strand
assertion) and every other physics and shared-engine consumer suite passed.

Publication receipt: bundle `e56bf638d0332e3e` was staged into
`deploy/ibphysicsppqs` and pushed as commit
`4e6ee94c8e599da9aa6a5b0e22a6eb490a19edd1` on `main`. GitHub Pages served the
new build, and live byte verification against
`https://physicalsmithness.github.io/ibphysicsppqs/` PASSED at
`2026-09-14T21:04:28.843Z`: 22 public files matched the published commit,
build-info reports build `e56bf638d0332e3e` with 543 parts, and per-topic
counts are unchanged (A.1 149/128, A.5 138/138, C.1 25/7, D.2 146/146,
E.1 55/55, E.2 39/39). Only the viewer engine, its stylesheet and the physics
consumer changed; the served part set is identical to `9392e1ca48403a54`.

## 2026-09-14: IB Physics leads the public title (QoderWork)

The practice viewer is now titled “IB Physics past-paper question viewer”: the
course leads the title and “past-paper” is hyphenated, in the desktop title,
the topic-home heading, the header home link and its aria-label, the release
metadata and the IB config title. The now-redundant standalone “IB Physics”
course line is gone from the topic home; its bottom spacing moved onto the
heading so the chooser rhythm is unchanged. Consumer tests assert the new
title. Local release bundle `9392e1ca48403a54` assembles and validates with
the same 543 served parts and per-topic counts as before.

Publication receipt: bundle `9392e1ca48403a54` was staged into
`deploy/ibphysicsppqs` and pushed as commit
`615a60af413b92a4672764e66cf34d3968f64421` on `main`. GitHub Pages reported
that exact commit `built`. Live byte verification against
`https://physicalsmithness.github.io/ibphysicsppqs/` PASSED at
`2026-09-14T20:26:26.641Z`: 22 public files (nine text/data/engine files and
sample crops) matched the published commit, build-info reports build
`9392e1ca48403a54` with 543 parts, and per-topic counts are unchanged
(A.1 149/128, A.5 138/138, C.1 25/7, D.2 146/146, E.1 55/55, E.2 39/39). Only
the title strings changed; the served part set is identical to the previous
public build `d5fa99e9dedd533b`.

The same pass restored `Physics Categorisation/viewer/ibphysics_catalogue.js`
to the byte-exact reviewed state (`050e5203…`) that every release clearance
pins. An earlier 2026-09-14 catalogue rebuild had changed that file's hash and
blocked release assembly at input load; the reviewed D.2 material remains
available separately for a coordinated regeneration.

## 2026-09-12: Driller sign-in publication receipt

The owning Driller task reports that Smith published Driller v0.20.0. Its
read-only check at `2026-09-12T18:30:18Z` matched local HEAD, GitHub main and
six public assets to `71480bc62458e42fb10297e335c0bf158f6317f5`. The public
Driller version 2 helper has SHA256
`0a7ddcc249a304c38728db4affa11af41ad8c5080939d829c07ffbeda0b531b1`.
PPQ remains on version 1; its version 2 candidate is still staged. No PPQ
publication was requested or performed by this coordination update.

## 2026-09-12: topic home and compact question layout

Published build `ab0aa88396caf624`, assembled at `2026-09-12T17:19:11.156Z`,
deployment `ca2810097f55624192bce19598ce729326480e57`. GitHub Pages reported
that exact commit built. Public verification passed at
`2026-09-12T17:30:02.003Z`: all eight public files and three sample PNGs matched.

- The root topic chooser offers A5 and shows five future topics as unavailable.
  “Past paper question viewer” returns home. Desktop title, account and filters
  share a single row; the phone layout remains within its viewport.
- One compact row identifies the exact question part and offers ordered part
  chips before context. A neutral separator marks the current crop. HL and SL
  badges have distinct purple and green styling without losing source labels.
- Optional accessible image loading includes per-image retry and cancellation
  of stale events after another group is selected. Old answer content clears
  immediately. Key tips remains closed until requested.
- Ask your teacher now uses cautious experimental wording before the form.
  Notifications are described as planned; actual receipt checks remain intact.
  The footer places Ask left, Report centre and Draw right.
- All 2,426 shared assertions, ten loading, eight chooser, 14 teacher-help,
  97 Physics and 18 release checks passed, including 32 MCQ keyboard journeys.
  Browser checks found a 51 px desktop header, a 92 px header at 390 px phone
  width and no horizontal overflow. No form was submitted.
- The 146 parts, 72 parents and 371 images, catalogue and active version 1
  identity helper are unchanged. Version 2 remains separately staged.
  See `reports/ib-layout-navigation-validation.md`.

## 2026-09-12: Key tips stays closed until requested

Published as build `d58538cb2385018d`, deployment
`1cf5c9048814103cb5b8cea8cb4dbae547d2aa0c`. Public byte verification passed
at `2026-09-12T16:45:32.270Z`: eight public files and three PNGs matched,
including the active version 1 identity helper. No new Pages API status is
claimed by this record.

- The guidance disclosure is now “Key tips” and starts closed, including after
  selecting or switching groups. Explicit opening reveals the same authored
  advice; selected rows, marking state and navigation are preserved.
- All 26 affected guidance/tools/usability checks and 18 release checks passed,
  including 32 MCQ keyboard journeys. Compared with `bca8a6f34a08360d`, data,
  images and identity-helper bytes are unchanged; only engine and build-record
  bytes differ. Existing source and assessment boundaries remain unchanged.
- Identity recovery version 2 remains separately staged and unpublished. This
  tips release continues to use version 1.

## 2026-09-12: physics sign-in recovery — source-only, staged

At the start of this source-only investigation the public release was
`bca8a6f34a08360d`, deployment `ee4e024f16fb1a5ce622cad7d49e07060e0ddcf6`.
The delegated investigation does not authorize recovery publication; the
subsequent Key tips release above still uses the published version 1 helper.

- The version 2 shared identity helper recovers physics sign-in metadata
  omitted by Fields/ECM's legacy four-field estate writer. A durable
  `smithics_physics_signin_v1` checkpoint applies only to the same ID and
  cleaned display name; explicit false/sign-out remains authoritative.
- Identity reads may update only the estate identity key, the new sign-in
  checkpoint and an existing configured local identity mirror. They do not
  alter progress or transmit data/reports across Smith's estate.
- The original nine identity checks and ten independent recovery journeys pass;
  unchanged deployed v1 fails the reproduced overwrite regression. Candidate v2
  is frozen in `staged/physics-identity-v2/physics-identity.js`; active source
  retains published v1 for the separate Key tips release. No v2 deployment is claimed.
  See `reports/ib-physics-identity-recovery.md`.

## 2026-09-12: visible saved marks and inline C

Published as build `bca8a6f34a08360d`, deployment
`ee4e024f16fb1a5ce622cad7d49e07060e0ddcf6`. GitHub Pages built that exact
commit; all eight public files and three sample PNGs matched at
`2026-09-12T16:02:25.814Z`.

- Exact marks and uncertain range bounds stay visibly selected. A nearby
  `Saved: 1/2` or `Saved: 0–2/2` status confirms the result immediately, and the
  current attempt appears in the marks/C history without navigating away.
- IB places C below the marks in the question pane. Saving marks reveals it
  and scrolls that pane only as far as needed; phones use the same inline flow.
  The shared `selfReport.autoReveal` option defaults to off, preserving other
  consumers' existing placement.
- Matching visible analysis categories flash immediately using the actual
  facet memberships, including overlapping types. Filters and analysis scroll
  position stay unchanged; incomplete range selection does not trigger a flash.
- Approved physics C2–5 wording: “Only half understand”; “Mostly understand”;
  “Fully understand, but I might miss it tomorrow”; “Fully understand,
  comfortable with this”. C1 “No idea”, C6 “Trivial — never need to see this
  again” and the shared engine's default scale are unchanged.
- Validation passed: 2,426 shared assertions, seven new rating-flow checks,
  six dashboard-pulse checks, 15 history, eight presentation, 12 shuffle,
  13 teacher-help, seven question-tools, nine pacing and nine identity journeys.
  The final release passed 18 checks, including 32 real MCQ keyboard journeys.
- Independent comparison with `e55db219ef0bb748` confirmed all 146 records,
  complete analysis metadata and all 371 PNG bytes are identical. Clearance
  binds 72 parents, 449 source paths and 579 fingerprints. The two obsolete
  reserved-row exceptions are retired; actual crop rectangles now pass the
  ordinary overlap checks. See `reports/ib-rating-feedback-validation.md` for
  exact local desktop/mobile geometry and public verification evidence.

## 2026-09-12: teacher questions, reviewed crops and finer A5 practice

Published as build `e55db219ef0bb748`, deployment
`fae202def056b155a801fc2492cc1e301bac351f`. GitHub Pages and eight public
HTML/JS/CSS/build-info files plus three crops matched at
`2026-09-12T15:32:36.840Z`, including the repaired Q7(b)(i) diagram.

- Optional shared `teacherHelp` adds Ask the teacher, explicit submission,
  receipt confirmation, stable retry IDs and saved reply notifications.
  Pending questions remain private; teachers review the question and answer
  before publishing them for everyone, without pupil names. The pupil feed
  renders public text only and sends no learner performance or image contents.
- Report a display problem needs no typed explanation. Explicit Send includes
  the source context and optional note, retains failed drafts and says “Thanks
  for reporting.” after dispatch. Opaque feedback responses cannot privately
  prove storage; teacher-help receipt confirmation remains a separate check.
- Shared physics sign-in remembers a name and class in this browser, links to
  the A5 coverage table and preserves the existing local progress history.
  It has no password check and does not send PPQ attempts to the tracker.
- Reviewed A5 metadata contains 45 authored question types, with 24 offered
  in the current pool and 29 finer detail choices. Exact directly assessed
  memberships drive filtering/counts; the 13 nonempty legacy groups remain.
- Eight answer-diagram crops are complete, including 25M.P2.HL.TZ1.Q7(b)(i).
  November 2024 Q4(b)(i), SL and HL, now uses its own answer row; neighbouring
  and mislinked b(ii)/c(ii) crops are removed. The approved 146 source IDs,
  72 parents and every question/context image remain unchanged.
- Clearance binds 449 source images and 581 current fingerprints; identical
  content deduplicates to 371 public assets. Independent old/new comparison,
  18 release checks (four MCQs/32 keyboard journeys) and five reserved-geometry
  checks passed with no unrelated scope widening.
- TeacherViewer 20's empty queue and the public reply feed passed read-only
  live checks. Synthetic client tests cover sending/retry/notification paths;
  no real report, clarification or teacher publication was sent, so the live
  write/answer round trip remains untested. See `IB_PHYSICS_RELEASE.md`.

## 2026-09-12: question tools, readable guidance and learner pacing

Published and publicly verified at 14:07 UTC as build `19069d1cf2b1158a`,
deployment `30002287822b6c079a1e9dccb97014d49a61bf2e`.

- Draw and Report a problem stay at the bottom-right of the question pane,
  clear of the analysis. Reset is under Preferences > Manage saved progress,
  with confirmation retained.
- A selected group's named guidance is brought into view in the analysis
  pane, with a tan accent, short paragraphs and spaced authored bullets.
- My level persists HL/SL. Known marks determine current-practice targets;
  visit snapshots preserve an open answer/timer when preferences change.
  Current A5 HL and historical paper level are labelled separately.
- Reports snapshot source metadata, send only on explicit submission, retain
  failed drafts and distinguish dispatch from unconfirmed destination receipt.
- Eight shared gates passed (2,426 assertions), plus focused learner, pacing,
  tools, report and release journeys and desktop/mobile browser checks.
- The source crop defect in 25M.P2.HL.TZ1.Q7(b)(i) is documented privately for
  the cropper. Source question data and all 376 image bytes remain unchanged.

## 2026-09-12: attempt history and practice preferences

Published and publicly verified as build `f38b6d4216288094`, deployment
`6c0536038885e879df5e30973345c2566c8be674` at 13:33 UTC. The reviewed
146 parts and 376 distinct images remain unchanged.

- IB practice shows a compact history beside the question heading. Each
  attempt has its marks fraction above its own C rating, with green intensity
  showing the result. Missing historical ratings remain blank rather than
  borrowing the latest score for the question.
- Preferences control history visibility and the practice selection:
  Complete mix (default), Not attempted yet, or Previous errors. Errors use
  the most recent completed result, including partial marks. Skips do not
  count as attempts. Exhausting the selection offers an explicit next choice.
- These shared features are opt-in for other consumers. Preferences and
  per-attempt ratings stay in the existing browser-local progress store.
- C controls and Next sit beside the question on desktop, above the scrolling
  analysis list. On phones they remain in a compact bottom panel. The exact
  scale descriptions are available in an expandable Scale section.
- IB starts with Shuffle: whole-question groups are shuffled and their parts
  remain in printed order, including nested Roman labels. In order remains
  available, alongside an explicit Shuffle all parts choice. The practice queue
  retains its order while completed parts leave it in unattempted mode.
- Enter consumes the viewer navigation action so a focused Next button cannot
  also fire a native click and skip the following part. Marks, preferences and
  disclosure controls retain their own keyboard activation.
- IB uses year-range filters, Paper 1 / Paper 2 practice categories (the latter
  includes former Paper 3), and numbered A5 analysis groups in teaching order.
  Individual question metadata continues to identify the original paper.

## 2026-09-12: compact IB practice and answer loading

Published and publicly verified as build `26469749a6f01468`, deployment
`12f934aa992a05c9bd56de748d8a6a4e59c66070`. The same 146 parts and 376
distinct images remain available.

- The IB wrapper uses independent question and group-list scrolling on desktop,
  smaller zoomable crops, prominent target-part headings and navigation above
  the context. Redundant navigation modes and learner-facing release notices
  are removed. Timing defaults to off.
- Reviewed printed MCQ keys activate the existing A–D / 1–4 automatic marking.
  The original cropped scheme appears after answering. Unknown keys continue
  to use self-assessment.
- Shared prefetching now includes context and cropped markschemes, with bounded,
  deduplicated image caching. New navigation/layout hooks are optional; existing
  consumers retain their defaults.
- The six canonical scale descriptions remain in use, with the requested
  “tomorrow/next week” wording and larger text in the IB wrapper.

## 2026-09-12: shared group analysis and A5 publication

- **Optional dashboard membership hooks:** `groupKeysOf(q)` lets a part
  appear in each of its reviewed groups, while `groupLabelOf(key, q)` supplies
  the correct label for each membership. Repeated keys count once. Existing
  consumers retain their `groupKey` / `groupLabel` behaviour by default.
- **The displayed unit can be a part:** `itemNoun: "part"` changes the
  counter, finder, dashboard and progress wording. It defaults to "question".
- **Authored guidance within a group:** a dependent dashboard-facet filter
  can supply `facetGuidanceOf(groupCode)` returning `{summary, checks}`.
  Selecting the group shows an expandable "About this group" card; its text
  is escaped. The hook is optional and the existing facet filter remains the
  source of truth for selection.
- **IB Physics A5 published and verified.** The standalone
  site is `physicalsmithness.github.io/ibphysicsppqs`: 146 parts in 13 groups,
  build `ed5cf7f1f7458863`. Public files were verified against deployment commit
  `e3d3603e275230c1c6974624dd096c627f869b1f`, with live browser checks of
  question/markscheme loading and group guidance.
  Current-test exclusions, the pre-2026 source
  gate, reviewed current-A5 scope and crop checks remain independent gates.
  Topic labels retain their A1/A5 prefixes; learner counts use parts.

The new membership/guidance regression suite covers overlapping groups,
default compatibility, part wording, facet navigation and escaped guidance.
The A5 source projection has five passing scope/provenance regressions.
The universal consumer notice is staged in
`outbox/2026-09-12_to-consumers_group-analysis-and-part-counts.md` for relay;
no external consumer notification has been sent. See `IB_PHYSICS_RELEASE.md`.

## 2026-09-10: physics preview and assessment reservations

Patrick requested at least four physics practice areas and exclusion of test
questions. Added a local shared-engine consumer covering IB A1, A5, E1, E2,
historical data analysis (including Paper 1B) and D2, plus Trilogy electricity/forces and a reviewed 4SS0
Pre-IB forces collection. Close visual test review adds durable reservations
for short, adapted and scanned questions missed by the initial text matcher.
Incomplete IB answer-choice diagrams and retired D2-only mappings are withheld.
The shared engine and existing deployments are unchanged.

The coverage correction consumes existing DATA classifications back to 2004,
restores specimens dated 2018 on their original covers, and holds the selected
2025 assessment sources rather than every 2025 paper. Completed Pre-IB returns
and reviewed Trilogy forces mappings extend the selection. Topic cards show
both whole questions and assessed parts; all existing test reservations remain.

Added a global pre-2026 source-year gate, conservative IB test-candidate
reservations with parent/twin/duplicate closure and shared-page withholding,
current shared-drive test comparisons, bounded Trilogy question/scheme crops,
an isolated local server, and regression tests. Native text matching cannot
certify every scanned or rewritten test item; the preview remains labelled
for teacher review and has not been published. See `PHYSICS_PREVIEW.md`.

## 2026-09-05 — the site-name swap, phantom parts refused, and a gate that catches vocabulary drift

- **`deploy\ibmathsdriller` is now `deploy\ibmathsppqs`** (their d030). A folder
  inside this project, named after a different project, containing this
  project's site: the trap that caused the repo mix-up in the first place. The
  IB Maths Driller seat enumerated every dependent file for me, including the
  hand-over guard in `SYNC_IBMATHS_WEBSITE.cmd` whose failure mode is a script
  calling itself, and `tools\state.js` whose bare `dir` string would have left
  the wake surface reporting a missing checkout. Seven files updated; the
  remote was already swapped, and the checkout is in sync.
- **The wrapper stops calling itself a driller.** Once the addresses swap, a
  site titled "IB Maths driller" sitting at the past-paper address is a milder
  version of the same confusion. Now "IB Maths Past Papers", in the title, the
  header and the assembler's rewrite.
- **274 phantom parts were being served to pupils.** The maths seat's label
  repair (packet 2026-08-15) named the corruption per part, flagging rather
  than dropping them because tags and mark points hang off them. Flagged
  upstream is not handled downstream: this wrapper read neither `label_status`
  nor `phantom_kind`, so every phantom was offered as an ordinary part, which
  means offering a pupil a question that was never printed. Now refused
  everywhere pupil-facing. Two consequences the suite records: `2222-7107_Q12`
  splits into three markable units of 4, 3 and 12 where a pupil used to get a
  single 19-mark bar, and 15 questions correctly return to question-level
  because their apparent second part was a `duplicate_of_sibling` phantom.
- **`test_vocabulary.js`, a new gate, suggested by the EdTech Overview seat.**
  Two of the three faults Smith found on 08-17 were the same fault: a wrapper
  testing for a token the content seat's data has never contained. Nothing
  could catch them, because every assertion in 2,418 asked whether a behaviour
  FIRES, and neither of those is a behaviour that fires. This asserts that
  every string literal a wrapper compares a catalogue field against actually
  occurs in that field, and separately lists fields a seat ships that the
  wrapper never reads. It found the dead `calculator === "required"` branch on
  its first run, and the unread list is how the phantom fields above were
  noticed eleven days after their packet arrived.
- **Nine assertions across two suites were failing because the data got
  BETTER.** Economics filled every empty `spec_status`, recovered 109 of 127
  unmarked parts and repaired three of seven unparsed MCQs; maths repaired the
  labels this suite's exemplar was pinned to. A gate that reddens when a seat
  delivers what was asked teaches its owner to ignore it, so the rule is now
  written into `OPERATING_MODEL.md`: assert the invariant, echo the count.
- Two genuine findings surfaced while re-baselining, both packeted: 10 of
  economics' 145 thin markschemes have no crop or page behind them (the
  wrapper now says so rather than promising a printed scheme it does not
  have), and maths has non-phantom parts carrying 0 marks with no
  `marks_status` to explain them.
- Gates at head: 19 + 18 + 101 + 1,503 + 661 + 92 + 28 + 4 = 2,426, none
  failing. Deploy site files re-assembled; the run needs Smith's sync and push.

# CHANGELOG: ppqviewer

Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.

## 2026-08-17 — three faults Smith found in one sitting, all mine

Every one of them looked healthy in the source and was invisible to the
suites. Assertions added for all three, written against the real wrapper and
the real catalogue rather than against the source text.

- **The Learned-so-far scope read the wrong code field.** The seat ships
  `aa_codes` (what a question was tagged as under its own syllabus generation)
  and `aa_codes_today` ("the spine codes the question would carry if set
  today, from the lineage judgement"). Everything a pupil meets is expressed
  in the CURRENT syllabus, so the judged code must win; the wrapper preferred
  the historical one, and `learnedScope.refsOf` read it with no fallback at
  all. Smith un-ticked complex numbers and was still served
  `8804-7401_Q13` ("solve z³ − 8i = 0"), whose historical codes are equation
  solving and trigonometry and whose judged code is complex numbers. One
  `currentCodes()` helper now governs the scope tree, the topic chip, the
  filters, the weak-area chips and the progress axes. 62 legacy records had
  the two fields pointing at different topics; a further 103 carried only a
  judged code and were unplaceable in the tree. The 463 AAHL records carry no
  judged codes and are unaffected.
- **A markscheme cover could be presented as the answer.** Two routes. A
  "located" span lying in the front matter (379 records across 31 papers,
  since repaired by the seat and verified here page by page), and no location
  at all, where the whole document sprang open at page one, which is how
  Smith read `8818-7201_Q7` as having an unrelated markscheme when the paper
  was right and page one was a cover. The wrapper now refuses a located set
  lying entirely in the first three pages, and never auto-opens the
  whole-document fallback, which instead says plainly that the question's own
  pages could not be found and names the question to look for. The guard is
  code, not data: the suite asserts the guard exists, so a locator regression
  cannot reach a pupil again.
- **553 option-booklet questions dropped their calculator rule.** The seat's
  vocabulary is `permitted` / `not_permitted`; the wrapper tested for
  `"required"`, which has never appeared in the data, so an option question
  printed a bare "Option booklet". Found only because the seat's regeneration
  made a neighbouring assertion fail.
- Seat's locator fix verified independently before adoption: `8816-7201_Q9`
  moved from markscheme page 5 (examiner instructions) to pages 11–13, and
  page 11 does carry "attempt to differentiate implicitly, M1". Unlocated
  records are down from 253 to 43. Their new `located-low` tier is the
  confidence signal this project asked for.
- Gates at head: 19 + 18 + 101 + 1,503 + 658 + 91 + 28 = 2,418, none failing.
  Deploy site files re-assembled; the run needs Smith's sync and push.

## 2026-08-06 (later still) — d024: a sign-in gate on every consumer, and IB Maths starts reporting for the first time

Smith ruled q13 within the hour: gate both, now, rather than waiting for
Google sign-in.

- **`PPQLogin.mountGate()`**, a new shared helper: injects the gate styles,
  markup, class dropdown (populated before anything that can fail, so it is
  never blank), sign-in and reveal. ESAT's equivalent is 90 hand-written lines
  in its wrapper; repeating that per consumer is how three drillers end up
  with three subtly different sign-ins and one quietly stops pulsing. IB Maths
  and Economics use the helper in eight lines each. ESAT keeps its hand-rolled
  gate until a later touch, and the suite asserts the two behave alike.
- **IB Maths and Economics are gated and reporting**, each with its own
  project tag (`ppqviewer_ibmaths`, `ppqviewer_economics`) and its own cohort
  key, so a pupil's economics class cannot overwrite their maths class in the
  shared identity. Both fall back to opening ungated and silent if the login
  script is missing: being locked out of revision is worse than an unreported
  session.
- **The IB Maths assembler now ships `ppq-login.js`** and fails loudly if it
  is absent, because a missing gate script is invisible at build time and
  serves an ungated, silent site.
- `test_pulse.js` grew to 23 assertions: every pupil-facing consumer loads the
  login, hands a report function to the mount, and holds distinct tags and
  keys; the shared gate hides the app, offers the same three fields, is safe
  to call before sign-in, and reveals the app on start.
- Gates at head: 19 + 18 + 101 + 1,503 + 647 + 91 + 23 = 2,402, none failing.
- **q08 (real class source) is now the blocking item.** Three hardcoded
  placeholder class lists exist where there was one, and two of them are my
  guesses at names Smith has not supplied.

## 2026-08-06 (later) — the attempt pulse has been throwing away its payload since it was wired

Acting on the EdTech Overview seat's correction packet, diagnosis verified in
this code before changing anything.

- **The bug.** The engine stringifies each event's detail into `extra_json` at
  26 firing sites. The deployed Apps Script builds the `extra_json` COLUMN
  itself, by sweeping unrecognised TOP-LEVEL keys, and discards a client-built
  `extra_json` field. So every `rated`, `interrogation`, `timing_prefs`,
  `flag_review` and `learned_scope` row has been landing with its entire
  informational content missing, and every `answered` row losing `correct`,
  `time_ms` and `time_pressure`. Invisible by construction: a `no-cors` POST
  resolves on dispatch, so the status pill said "sent" when it knew only
  "dispatched". Linguics hit this live on 2026-07-21 and fixed it the same way.
- **Fixed in one place**, `example\ppq-login.js`'s `report()`, not at the 26
  engine sites: the extra bundle is flattened to top-level scalars, nested
  values pre-stringified under a `_json` name, fixed columns never shadowed,
  and a malformed bundle degrades to `extra_raw` rather than vanishing.
- **`test\test_pulse.js`, 15 assertions, a new gate.** Behavioural, not
  pattern-matching: it executes the real `report()` with `fetch` stubbed and
  inspects the object that would have gone to the network. The assertion is
  worth more than the fix, because this failure class shows no symptom.
- **Correction back to the EdTech seat**: their packet said both ESAT and IB
  Maths were affected. Only ESAT reports at all. IB Maths and Economics load
  no `ppq-login.js` and pass the engine no report function, so **the published
  IB Maths driller has sent no attempt data since 2026-07-29**. Recorded as
  q13 (should IB Maths and Economics report?), a product decision for Smith
  since reporting requires the sign-in gate; the suite asserts today's state
  so wiring one forces the question rather than drifting.
- Gates at head: 19 + 18 + 101 + 1,503 + 647 + 91 + 15 = 2,394, none failing.
  The fix is in a deployed ESAT file, so it reaches pupils only on the next
  sync and push.

## 2026-08-06 — IB Economics wrapped; the first bounded builder dispatch; the catalogue contract published and then corrected by its own first use

- **`CATALOGUE_CONTRACT.md`** (Smith's ruling, 2026-08-05): one public spec for
  every content seat, replacing the private bilateral negotiation that held for
  two seats and would not hold for six. Its first section, at Smith's
  instruction, is that seats may ask for anything: new fields, new question
  shapes, new pupil interactions, capabilities the engine lacks. Flag rather
  than bend. Delivered by packet to the Maths, Economics and ESAT seats.
- **IB Economics wrapper and suite**, built by a bounded builder chat under
  `dispatch\2026-08-06_builder_economics-wrapper.md`, the first use of the
  builder seat in d021 (multi-consumer operating model). 1,021 records and
  3,498 parts exploded into markable units; 73 auto-marked MCQ, 3,298 marks
  self-assessment, 127 flashcard; eight filters, eight progress axes, examiner
  panel default-on, syllabus status defaulting to the practisable subset per
  d020. 91 assertions against the real catalogue. The builder touched only its
  two named files, requested no engine change, and committed nothing. Gates at
  head: 19 + 18 + 101 + 1,503 + 647 + 91 = 2,379, none failing.
- **The dispatch packet was wrong in five places and the builder said so**,
  which is the outcome the seat split is for. Three corrections are general and
  are now in the contract: asset folder layout differs by seat and must be
  declared (`meta.asset_layout`) rather than assumed; `part_id` must be shaped
  `<record id>(<label>)` because the engine's part navigator matches on that
  prefix and any other separator renders nothing, silently; and every
  extraction token family must be declared, not just figures.
- **Data asks returned to the Economics seat** (packet 2026-08-06): unit and
  topic names in `code_names`, real `part_id`s, marks for the 127 part records
  that have none, `marking_differs` narrowed from 86% of records to where it
  means something, the seven OCR-scrambled MCQ option tables, and the
  truncated paper-report prose.

## 2026-08-04 — the twelve verified and un-pinned (two-key release); the scanner's blind spot found; Q14's twin caught

Responding to the ESAT planning seat's relay (E01 accepted; E04 fired; E05
awaiting viewer confirmation).

- **The twelve repaired records: independently verified and UN-PINNED.**
  Verification beyond the seat's own: the records themselves read back with
  correct restored mathematics (real minus signs, correct decay chains,
  correct wave arithmetic), heuristic-clean, resolvable, validator clean.
  Release is two-key: the analysis ledger still withholds them until
  PACKET_E05 fires, so un-pinning changes nothing pupil-visible until the
  analysis side turns its key and the next sync ships.
- **Two-key withholding hardened in the engine**: a status source saying
  `withheld`/`invalid` now gates on its own, exactly as a consumer pin does.
  Before this, a ledger "withheld" with no matching pin fell through to
  Guided help, so safety depended on the consumer remembering to pin.
- **The scanner's blind spot**: `SKIP_KEYS` included `path`, which silently
  exempted `error_path` (pupil-facing diagnosis text) from every damage
  sweep. That is how Q14's `?not?` corruption survived. Fixed (exact-key
  skip only), plus the seat's proposed `?`-fused-to-letter signature.
- **The widened scan immediately found Q14's damage twin**,
  `esat_nsaa_2017_s1_Q27`, corrupted identically and previously invisible:
  pinned, and reported to the analysis side for the repair queue. Pin set is
  now six (E03's five + the twin).
- Codex's integration suite updated where it release-pinned the old
  twelve-pin state. Full gate green: 19 + 18 + 101 + 1,503 + 647.

## 2026-08-04 (small hours) — the gate caught the E01 repairs, not damage; E03's five disqualifiers pinned

Smith's release-train run stopped at the content-safety suite: thirteen
"failures" that were in fact the twelve PACKET_E01 repairs landing (all
twelve records rebuilt from crop + official key on the analysis side,
2026-08-03 evening, evidence in `returns\PACKET_E01\FEEDBACK_E01.md`). The
suite's pre-repair expectation that each pinned ID is still damaged had gone
stale. Verified and closed:

- **The twelve stay suppressed pending a deliberate release**: the analysis
  side's `withheld_ids.json` bakes them withheld in the bundle ledger, the
  viewer pins remain, and both come off together when the analysis side
  clears its list by packet. Release is a decision, not a side effect.
- **PACKET_E03's calibration falsified the reviewed/full flag** (both
  sampled "full" records failed). Its five disqualifying records are now
  pinned with their evidence as reasons: Q14 (scanner-evading `?`-for-minus
  corruption), Q11 (wrong arithmetic in a diagnosis), Q90 (wrong sign law),
  Q37 (missing derivation), Q35 (unsupported landing). Material-defect
  records ship under the already-softened "Detailed help"/"Guided help"
  labels and wait for remediation.
- **Safety suite redesigned** from asserted damage to layered pin
  accounting (heuristic-flagged / ledger-withheld / semantic pin), exact
  set-equality between wrapper pins and the suite's expected list, and an
  assertion that semantic pins survive analysis-side regeneration.
  Gates: 126/126 safety, 1,503/1,503 catalogue integration, 647/647
  presentation. Scanner gap noted: Q14's corruption class evades the
  signatures; human review remains the quality layer.
- Wrapper pin list: 12 repaired-held + 5 E03 = 17. Inter-chat note filed in
  the ESAT project; ledger alignment (adding the five to withheld_ids)
  requested there.

## 2026-08-03 (later still) — maths examiner reports live, default-on (B(a) first item)

Wrapper + suite only; the engine's `examinerOf` panel already fired on the
maths reveal path, so wiring the config IS the feature.

- Question-level `examiner_comment` (1,131 questions) renders at the reveal;
  on a part unit the part's own commentary (147 parts) leads and the
  whole-question comment sits behind "The examiners on the whole question".
- `examiner_match_note` renders as a quiet provenance line, never a claim.
- `meta.paper_reports` (general comments / difficult areas / well-prepared
  areas, 107 papers) joins by preview key as a closed details block:
  "What examiners said about this whole paper".
- Five suite assertions pin default-on reach (900+ records), part-beats-
  question ordering, paper-report reachability and the provenance line.
  Presentation suite 647/647. Deploy site files re-assembled; Smith's cmd
  run and push publish it.

## 2026-08-03 (night) — the seat's three packets consumed; d022 deck and d023 redesign recorded; mock-ups delivered

No engine change; wrapper + suite + records. Catalogue regenerated twice
tonight by the Maths seat (17:31 and 20:07) and consumed on arrival.

- **`[figure]`/`[graph]` typed token** cleaned in `cleanStemText` (the verbose
  marker match stays as a stale-data fallback); suite asserts the token can
  never reach a pupil.
- **Roman-gap absorption gate**: a question with a blank-mark unit AND gapped
  romans in a letter group stays question-level rather than absorbing (126
  questions, label corruption per the seat's measurement; 2222-7107 P2 Q12 is
  the pinned exemplar, reversing its old absorbed expectation). Flips back
  automatically when the seat's X03 label repair ships. Record count moves
  5,368 → 5,054; the stem-pages assertion made proportional accordingly.
- **`aa_codes_today` routing**: judged lineage codes now place legacy
  questions in topics and subtopic filters; the MHL heuristic survives only
  for the 460 provisional questions. `practice_value` carried, unsurfaced.
- **Examiner shape confirmed to the seat by reply packet**: keep
  `examiner_comment`/`meta.paper_reports` as shipped; the engine's
  `examinerOf` panel is the landing point; maths build queued NEXT.
- **d022 (unseen-first deck)** and **d023 (post-question redesign direction)**
  recorded from Smith's dictation; layout mock-ups delivered at
  `mockups\feedback_redesign_2026-08-03.html`; d019 ticking paused into d023.
- Housekeeping: the stale f48 worktree registration pruned (its branch tip
  `a4891a2` is merged; the 20MB folder in CodexProjects is inert); the
  `.codex\worktrees\5040` folder was found already deleted host-side.
- Presentation suite 642/642; ESAT gates re-verified against the 18:30
  Codex-side bundle rebuild (112/112, 1,503/1,503).

## 2026-08-03 (later) — d021: multi-consumer operating model; the foreign commits adopted; records reconciled

No engine change. Governance and records, after Smith's ruling of today.

- **`OPERATING_MODEL.md` created** and put at the top of the wake list:
  single-writer seat map (architect owns engine/tests/tools/records; builders
  own exactly what their packet names; content seats never commit here; Smith
  owns every push), per-seat git author strings, the inbox packet channel,
  and one release train per consumer. Recorded as d021 (multi-consumer
  operating model), with d020 (default to the practisable subset) backfilled
  into DECISIONS at the same time.
- **The 3 August foreign commits (`f48abc3`, `a4891a2`) reviewed and
  adopted.** All engine additions are opt-in config; no deployed file was
  touched; the full gate re-run from disk this session passes at 2,292
  assertions across the five suites (19 + 18 + 112 + 640 + 1,503). The
  near-miss and its rule are written into OPERATING_MODEL; the stand-down
  and continuing content remit for the Codex side are in
  `CODEX_BRIEF_2026-08-03.md` for Smith to deliver.
- **README reconciled**: the stale v0.2.15 public baseline (repeated on
  2026-08-03 from the 07-28 handoff) corrected to the pushed v0.2.17 with
  post-gate readiness counts; OPERATING_MODEL added to Read-first.
- **IB Maths deploy re-assembled** (d015, maintainer syncs on wake): site
  files now carry the tested `93a0177` state (engine 462669fc40c7), replacing
  the mid-session 00:53 snapshot that Smith's 00:54 commit shipped;
  `build-info.json` still needs its native re-stamp via
  `SYNC_IBMATHS_WEBSITE.cmd` (the sandbox cannot finish the 17k-asset
  verification walk inside its timeout), then Smith reviews and pushes.

## 2026-08-03 — ESAT safety, advisories, presentation and teaching catalogue reconciled locally

- Reconciled the isolated ESAT work onto main `f48abc3` without replacing the
  v0.18.x card composition, printed-page/crop work, IB Maths part/mark behavior,
  chemistry auto-open behavior or current sync routing.
- Content readiness now requires a valid, resolvable analysis record. Twelve
  damaged guided explanations are explicitly suppressed while questions remain
  playable through the generic review shell.
- Added the configurable amber source-advisory contract and the three approved
  ESAT advisories, preserved before answering and after answering.
- Added the opt-in eight-question presentation benchmark, guided review sections,
  compact alternative methods, plain pupil labels, 44 px targets and contained
  320 px progress tables.
- ESAT now uses the canonical main family and resolved teaching topic for its
  Subject → Topic → Family hierarchy, filters, dashboard and progress. Extra
  family/topic relevance and all retrieval tags remain searchable.
- Current 720-record bundle behavior is release-pinned: polygon option testing,
  scanner ordered-option bounds and the distinct `knew_but_did_not_need` state.
- Added exact local assembly/identity verification and the 738-item catalogue
  integration suite. No public/generated deployment files were changed.
- Final local gates: 2,283 assertions passed across shared viewer, presentation
  (including current IB Maths contracts), ESAT safety/catalogue and chemistry;
  exact preview build `f13c2ea7d3657643` passed 12/12 identity checks and the
  1280 px/320 px browser pass with no console errors or horizontal overflow.

## 2026-08-03 — d020: the driller defaults to what a pupil can still be examined on (engine v0.19.0)

Two seat packets of 2026-08-01, built against the catalogue they regenerated
this evening (`spec_status`, `usable_if`, `marking_note`, all 2,195 questions).

- **Default subset.** The syllabus filter is multi-select and starts on
  current + close + mixed, with off-syllabus OFF: 3,696 of 5,368 records
  served by default. Their argument is the right one: "a pupil revising should
  not have to know that the Sets, Relations and Groups option existed in order
  to avoid it." Off-syllabus stays one tick away, never hidden.
- **The status is on the QUESTION**, above everything, not in a chip: an
  off-syllabus question says so and says why it is still here ("the reasoning
  is still worth doing, but this exact content will not be examined"); a mixed
  one says which way to read it; a current one says nothing, because it needs
  nothing. `usable_if` (their sentence turning a skippable question into a
  usable one) takes precedence over my generic wording the moment it is
  populated; it ships empty today by design.
- **The markscheme carries its era warning at the reveal**: 315 questions from
  2004-07 were marked under conventions since abolished, and without the note
  the scheme looks broken and the pupil stops trusting it.
- **The origin flag stays a quiet chip**, per their correction that it is
  interest and not a warning.
- Two new engine hooks, deliberately generic: `noticesOf` (anything a pupil
  must know before working) and `markschemeNoteOf` (anything they need while
  reading a scheme). Physics hit the same era problem (their d024), so this is
  the surface both subjects can use.
- Suites 640/640 presentation + 112/112 safety + 18/18 chemistry.

**Coordination note, and it matters more than the feature.** A second seat
committed `a4891a2` into this repo at 00:56 today under the same author name,
touching the engine, the ESAT wrapper, four test files and adding three docs.
Nothing was lost: `git status` showed every one of their files as modified only
because the mount writes LF where they committed CRLF, and `git diff
--ignore-cr-at-eol` confirmed the sole real changes were my four files. This
commit therefore names its files explicitly rather than `git add -A`, which
would have rewritten the line endings of their work. Their `test_chem.js` now
takes `CHEMISTRYDRILLER_ROOT` from the environment, which is the right shape.
Two seats on one live repo is the hazard the estate protocol exists to
manage; flagged to Smith for a ruling.

## 2026-08-02 (later) — the deploy never shipped the printed pages; crop sizing corrected (engine v0.18.1)

Smith on 0.18.0: "we still have the first thing not appearing... A1 is
appearing more with a greater size than A1 and A2 together."

- **The broken image was mine, in the assembler.** It copies crops, ms crops
  and ms pages, and never the printed QUESTION pages, so d018's stem block, the
  one thing the whole fix rests on, resolved to a broken-image icon on the
  deployed site. The source files were all present; they were simply never
  copied. Adds 1,965 files, about 123MB. The suite now asserts the assembler
  ships them, because a fix whose asset never deploys is not a fix.
- **Crop sizing was made worse by my first attempt.** `width: 100%` stretched a
  one-line clipping to full card width, so it rendered in far larger type than
  a clipping holding a whole part plus its diagram, which is exactly the "(a)(i)
  bigger than (a)(i)+(a)(ii)" Smith saw. Crops share a source DPI, so capping
  without upscaling (`width: auto; max-width: 100%`) is what makes their type
  agree. Asserted both ways.
- **Taxonomy, from his words:** "Didn't read the question carefully" joins
  Annoying slips, and a new "Working and communication" group covers "got the
  answer but didn't show enough working", missed method marks, unstated
  conclusions and unjustified steps: a maths mark is routinely lost with the
  right answer on the page, and no existing group could say so.
- Suites 626/626 + 70/70 + 18/18.

## 2026-08-02 — card composition rebuilt from Smith's screen recording (engine v0.18.0)

Smith recorded a full scroll through MHL 8819-7202 P2 Q9 and listed what he met
in order. The deployed site he was recording is engine 0.14.0, so it predates
the stem fix, but most of his list was composition and stands regardless.

- **Printed pages LEAD the card.** He reached the graph only at the very end
  ("first time we're seeing the graph... but confusing"), because the OCR
  transcription came first. Where printed pages exist they are the question:
  pages, then the part being answered, then the transcription demoted into a
  collapsed "The words, transcribed (the printed pages above are the
  authority)". Consumers with no printed pages are unchanged.
- **Every block says what it is** ("no introduction to stem, bstem, etc.", "no
  intro to question clippings"): the transcription carries per-block labels
  ("The question says", "9(b)(iii), 6 marks asks"), the clipping carries "The
  part you are answering now: (b)(i)-(b)(v), 6 marks", which also answers "hard
  for someone to realise... it's 9bi-iii, if you look at the top".
- **Missing figures are declared.** A bare "…" in the transcription now reads
  "A diagram, graph or table here is not in the transcription. It is in the
  printed page above."
- **The whole-question block became a MAP**, one row per part with its marks
  and a jump, instead of a second copy of every clipping ("all of this we've
  had before, some of it many times"). Card image count on his exemplar falls
  from a dozen-plus to six.
- **One width rule** for every question image ("massive size issues between
  them").
- **"Reveal" now reads "Show markscheme"** (his words).
- Four faults were catalogue-side and are packeted to the seat: part labels
  numbered by position so (b) reads (i), (iii), (v); the (b) lead-in attached
  to the last part instead of heading them; continuation crops containing only
  IB's "Do not write solutions on this page." banner; and a request for a typed
  missing-figure marker. No viewer heuristic was added for the banner: the only
  signals here are aspect ratio and page position, and both would eventually
  eat a real continuation.
- Suites 622/622 + 70/70 + 18/18.

## 2026-07-31 (night) — d018: the stem is shown as printed, and chemistry's auto-open is back (engine v0.17.0)

Smith, three times over: "This was solved by chemistry." He was right, and I
had been fixing parts while leaving the stem as OCR prose.

- **The stem now appears as the printed page**, opening the card above the part
  crop, on 5,285 of 5,368 records. There is no stem image anywhere in the
  catalogue and part crops are cropped tight to their own part, so a stem's
  table (8824-9702 P3 Q2's palindromic coefficients), graph or typeset maths
  existed nowhere on screen; `stem_text` flattens display maths and drops
  figures entirely. The OCR text remains as the d015 cross-check.
- **"Show original exam page(s)" was serving MARKSCHEME pages.** A part's
  `pages` interleaves mark pages with question pages and the wrapper took
  `pages[0]`, so that control, sitting next to Reveal, genuinely did show the
  answer, exactly as Smith read it. Filtered to question pages, asserted for
  every record, and no longer duplicated at the foot of the card.
- **Chemistry's auto-open rule restored**: `openAttr = isFirstPart ? '' :
  ' open'`. From part (b) onwards the whole question opens by itself, so the
  stem and every earlier part are in view without a click; on the first part it
  stays shut because the stem is directly above. Our Phase 3 port had replaced
  this with "always open in whole mode, never in part mode".
- Second capability found missing from the chemistry port in two days, both
  found by Smith. Standing lesson recorded in d018: read
  `chemistrydriller\ppq.js` itself, not our summary of it.
- Suites 622/622 + 70/70 + 18/18, including a jsdom render proving a pupil on
  part (b) sees the stem pages open, the earlier parts open, and no `mark_`
  image anywhere on the card.

## 2026-07-31 (later) — timer reset per question, and historical times can be deleted (engine v0.16.0)

Smith: "can we have a reset button for the timer on an individual q and a way
to delete historical timings. q stem time delete time."

- **Reset (↺) in the timer row.** Restarts this question's clock from zero for
  the interruption case, clearing any pause in progress so the clock actually
  runs again. Nothing is committed until the answer lands, so there is no bank
  or tally to unwind and the answer is untouched.
- **"Recorded times" on the progress page**: a table of question, what it
  asked (a stripped stem snippet), the time, and a per-row "delete time", plus
  "Delete every recorded time (n)" behind a confirm. Striking a time nulls
  `time_ms` and sets `time_discarded`, exactly as "don't record this one" does;
  the answer, rating, flags and reflections all stay. A time recorded while
  someone was interrupted is worse than no time, because every pace and average
  downstream silently reads it.
- Deleting THIS session's just-recorded time delegates to the existing retro
  discard so the bank credit and session tally unwind precisely rather than
  being double-counted; older rows only strike the row, since a finished
  session's bank is not live to adjust.
- Suites 614/614 + 70/70 + 18/18. Two harness contexts in the presentation
  suite needed the new methods registered, which is why the count jumped.

## 2026-07-31 — learned-tree ticking fixed; paper kind shown up front; chemistry's suite green again

- **"Any tick/untick recollapses the view so unticking three in a row is a
  right pain"** (Smith). Ticking rebuilt the entire tree DOM, discarding every
  open branch and the scroll position. The tree is now built once and a tick
  repaints only the boxes whose state can have changed, so open branches,
  scroll and focus survive; Tick everything and Clear repaint in place too.
- **The kind of question is stated before the attempt** (seat packet): "No
  calculator", "Calculator", "Option booklet, calculator", "Paper 3
  investigation" lead the meta line, and `paper_role` joins the filters. All
  5,368 records carry it (1,708 non-calculator, 1,934 calculator, 1,374 option,
  352 investigation).
- **Chemistry's regression suite runs again and is green (18/18).** It needs
  jsdom, which is not vendored, so it had quietly stopped being run and one
  assertion had gone stale: it still described the pre-22-July single-sidebar
  split dashboard (`.ppq-dash-content.split`) rather than the two flanking
  panels that replaced it. Confirmed the same failure on the pre-d016 engine
  before touching it, so this was a stale test and never a regression; the
  header now says how to run it. Chemistry being the donor of the multipart
  model, an unrun chemistry suite is exactly the blind spot that let d016's
  fault develop.
- Suites: 606/606 presentation + 70/70 safety + 18/18 chemistry.

## 2026-07-30 (night) — d017: the seat's names and page ranges adopted on arrival (engine v0.15.0)

Two packets landed from the Maths seat while d016 was being built, and both
overtook it. Adopted the same night; ruling recorded on the third.

- **Bare syllabus codes fixed** (Smith: "there is no friendly text on anything
  bar t1t2 etc."). The seat diagnosed it exactly: my generated labels are
  item-level (`AHL1.12.1`), every surface groups at topic-part level
  (`AHL1.12`), so each lookup missed. Now `meta.code_names` (135) then
  `meta.item_content` (275) then the generator, displayed name first and code
  second. All 82 topic-parts in the corpus are named, none bare. Reaches the
  subtopic filter, dashboard facet, weak-area chips, the Learned-so-far tree
  and, via a new `axis.labelOf` hook, the progress page's rows.
- **Markscheme narrowing handed back to the seat's data.** Their
  `ms_pages_this_question` (2,021 of 2,195 questions) plus `ms_page_span_source`
  supersede my crop-filename locator of a few hours earlier, which survives as
  the fallback. Mean pages shown per record: 19.0 → 2.9, with only 181 records
  still getting a whole document. Their per-part `ms_crop_adequacy` flags 778
  units whose crop is too short to be the real answer: those open their full
  pages unasked and say why. `located-medium` admits it is approximate, and the
  whole document stays one click deeper because a narrowed set can clip.
- **Mark-point ticking: Smith ruled (b), opt-in** ("it may become a, but let's
  not make it burdensome for the moment"). The d016 marks bar stays the
  default; ticking will be offered where `markpoints` exist (6,207 parts) and
  must write the same attempt row, so promoting it later is a default change
  rather than a migration. Not built yet, spec in d017.
- Engine 0.15.0 adds `msPagesAllOf`, `msPagesOpenOf`, `axis.labelOf`, all
  optional. Suites 598/598 + 70/70.

## 2026-07-30 — d016: part-by-part, taken from chemistry (engine v0.14.0, ibmaths v0.2.0)

Smith on a 19-mark question with one `0 … 19` bar: "the part question stuff is
just not serving… it's like the chemistry thing is being ignored… I feel like
I'm going over the ground and having to fix problems that I previously fixed."
Diagnosis: not a missing feature. Chemistry's `structuredPaper` navigator has
been in this engine since Phase 3 (d001) and the IB Maths wrapper never
enabled it, flattening every question's parts into one record.

- **Records are markable units.** One record per part, except parts the seat
  marked together (shared `mark_group`) which form one unit worth their
  combined marks. 5,368 records from 2,195 questions; 1,459 questions get
  part-level marks entry. Unit ids satisfy the engine's existing block
  contract, so the part chips, the "you are here" whole-question view and the
  part-by-part toggle all light up with no engine change. Single-part
  questions keep their bare id, so stored history survives.
- **Blank marks inside a marked run are absorbed** into the unit sharing their
  part letter (2222-7107 P2 Q12: `12(c)(ii)` blank beside a 12-mark `(c)`
  group), which lifts part-level questions 1,063 → 1,459 and 10+-mark
  questions 425 → 763 of 862. No marks invented. The 2004-07 structural-loss
  era stays question-level per the seat's rules: 99 records still show 10+
  marks in one bar and flip automatically when their Phase-2 reconstruction
  lands.
- **Markscheme pages narrowed** from the whole paper (mean 19 pages, from the
  cover) to the pages holding the question, derived from ms_crop page
  provenance and bracketed from located neighbours otherwise: mean 7.1,
  3,806 located, 77 bracketed, 1,485 still whole (crop-less papers; seat ask
  sent). The expander says which of the three it is.
- **Part chips carry their marks**; the card's meta line names the part and
  its marks, and only claims the whole-question total when the parts add up
  to it (90 units carry the seat's aggregation quirks).
- **Capability parity is now enforced by test.** The new suite section
  executes the real wrapper against the real catalogue (capturing
  `PPQViewer.mount`) instead of grepping source, and fails if a consumer whose
  records form part blocks has not enabled `structuredPaper`/`blockKeyOf`.
  This is the mechanism against re-solving solved problems.
- Engine 0.14.0 adds optional hooks only (`partLabelOf`, `partMarksOf`,
  `msPagesLabelOf`); ESAT and chemistry untouched. Suites 587/587 + 70/70.

## 2026-07-30 — takeover audit (records only, no engine change)

New maintainer chat took the seat (predecessor context-heavy). Verified from
disk: source tree clean at `d8560c7`; suites re-run green, 556/556 + 70/70
(bundle paths supplied via `ESAT_ANALYSIS_ROOT` / `ESAT_CATALOGUE_JS` when the
sandbox mounts differ from the hardcoded defaults); ESAT checkout at v0.2.17,
pushed, in step with origin; ibmathsdriller pushed IN FULL (12,585 assets incl.
5,633 complete ms pages at 12:57, final v0.13.0/v0.1.1 assembly at 19:09 —
Smith had already run sync + push, so the predecessor's closing "to publish"
instruction was already satisfied when written). Owed: browser confirmation
that GitHub Pages serves both builds.

Correction for the trail (Smith flagged it): the predecessor's closing chat
claim that the chemistry driller's 956 questions are "all Paper 1 multiple
choice" is false — 226 are 1A MCQs, 305 are 1B and 425 are Paper 2 long-form;
every record carries `question_text`, `markscheme_text`, `marks` and
`page_url`, with 274 in `shared_group` multipart blocks. The RECORDS (d001,
d010, REGISTRY) were correct throughout and no outbound packet carried the
error; noted here so the wrong version cannot be re-inherited from the
transcript. Chemistry's data shape remains the standard the maths experience
is being brought up to (ms_pages fallback and stem-first shipped; fault-4
part navigation queued next).

ROADMAP/REGISTRY reconciled: ESAT v0.2.17 recorded as pushed; IB Maths moved
PUBLISHING → PUBLISHED; fault-4 part navigation (+ fault-2 full-page toggle)
recorded as the active next build; spine-label item closed (viewer-side
generator); family vocabulary 26→28 noted as flowing.

## 2026-07-29 (night) — d014: IB Maths publish approved (q12 resolved); Smith's three faults fixed (v0.13.0)

Engine v0.13.0; ibmaths wrapper v0.1.1.

- **q12 resolved by Smith → d014.** The IB Maths driller publishes: served to
  school pupils who hold rights to the papers, not publicised beyond school,
  GA4 watched for spikes; Google sign-in expedited for the medium term. The
  assembler now ships the complete markscheme pages too (deduped 41k refs →
  ~4.3k files, ≈334MB; site total ≈680MB) and strips the local-note comment
  block from the deployed index.
- **"Markscheme clearly too short" (VF-15):** new engine config `msPagesOf`.
  Reveal shows ms crops inline as before, then a "Show the complete markscheme
  pages" expander with the full pages — open automatically when a question has
  no crops at all. Exemplar: MHL 2216-7208 P3 Q4, 13 marks, two thin crops,
  13 full pages.
- **"Don't have q stem":** the seat's text extractor drops display maths,
  leaving `[diagram/graph layout text omitted; see source clipping]`
  mid-sentence in 989 of 2,195 questions. The wrapper now renders the marker
  as a quiet ellipsis (the crop below is authoritative), hides stems that say
  nothing once cleaned, and also strips the leading question number,
  `[Maximum mark: n]`, duplicate part labels and trailing `[n]` tokens the
  surrounding furniture already shows. Real inline maths in the catalogue text
  remains the seat-side fix (packet sent).
- **"Don't have categories":** the 492 legacy questions with no AA mapping no
  longer pool in one "Untagged" bucket — a commented navigation heuristic maps
  MHL core codes (and pre-2008 option names) to the nearest AA topic, only
  when AA codes gave nothing. Item-level mapping stays with the seat.
- Suites: 556/556 presentation + 70/70 content safety.

## 2026-07-29 (late afternoon) — d011: Learned so far, built; guide-true maths pacing (v0.12.0)

Engine v0.12.0. IB Maths only per Smith ("not needed for esat").

- **Learned so far** (name confirmed): a header button opens the nested
  tri-state tree — topic → topic-part → item, built from the corpus's observed
  AA codes — where ticking a parent ticks everything beneath and partial
  branches show as filled squares. Once anything is ticked, every filter,
  the finder, the counter and the dashboard operate WITHIN the learned set:
  a question is in scope only when ALL its syllabus refs are learned; a
  question with no AA mapping sits outside an active scope. An empty set
  never filters, the panel's look-ahead toggle turns the scope off wholesale,
  "Tick everything"/"Clear" exist, and the panel live-counts items ticked and
  questions in scope. Unlearned dashboard groups grey out rather than vanish.
  The set persists per device (`store.learned`).
- **Maths pacing corrected from the AA guide Smith supplied** (my 1.5 min/mark
  guess replaced): HL P1/P2 = 120 min/110 marks ≈ 65.5 s per mark; P3 = 75/55
  ≈ 81.8 s per mark; SL rates (90/80) switch in when the SL/HL declaration
  lands (recorded in d011 and the roadmap, with per-paper question-type notes).
  Chemistry and Physics 2025 guides preserved in `PaperDatabases\reference
  guides\` for their future consumers.
- Also this hour (v0.11.x): the timer's reveal line carries its own
  "don't record this one", striking the just-recorded time retroactively and
  unwinding the bank credit and session tally exactly, answer kept.
- Suites 531/531 + 70/70 (tri-state through nesting, all-refs semantics,
  empty-set pass-through, look-ahead toggle, unmapped-question rule, panel
  cascade + persistence, greying, wrapper wiring, guide pacing, ESAT
  exclusion).

## 2026-07-29 (afternoon) — VF-04r: the timer becomes independent axes, sticky, with a live preview (v0.11.0)

Engine v0.11.0, from Smith's first live look at the timer.

- **Sticky**: the timer is now a floating chip that stays put while the
  question scrolls ("it shouldn't scroll up with the rest of the q").
- **Independent options** replace the six bundled modes: count up / count
  down; Off / Show while working / Reveal after answering; digital clock
  on/off; pacing ring on/off; when the allocation is up, START FROM ZERO
  (default) or keep counting; time bank on/off. Old saved prefs migrate onto
  the axes automatically.
- **Smith's overtime matrix, verbatim**: counting up past a 2:00 allocation
  shows red "2:01" (keep counting) or red "+0:01" (start from zero); counting
  down shows "−0:01" / "+0:01". One formatter drives the live clock and the
  panel preview, so they cannot disagree.
- **No jitter**: the ring sits first with fixed geometry and the digits
  reserve their width, so nothing shifts left/right as numbers change
  ("distracting"). **Sizes are independent**: clock size S/M/L/XL, ring size
  S/M/L/XL, and the bank chip grows with the clock.
- **Live preview in the panel**: as options are toggled, a preview shows the
  working state and the allocation-up state exactly as they will render
  ("they should see a preview of this as they select").
- Attempt rows now record the axes as a compact string (e.g.
  `show-up-clock-bank`); `off` when hidden.
- Suites 509/509 + 70/70 (axes round-trip, migration incl. unknown modes,
  the four overtime formats, panel segs, preview, size persistence).

## 2026-07-29 (midday, second) — VF-14r2: the question boxes reach the dashboard (v0.10.2)

Smith: "this is for the colour of the little question box." The dashboard's
category rows (and the subtopic facet drill-down) now carry the same little
question boxes as the progress page — one per question in the category,
neutral grey until tried, then the continuous performance colour from the
shared `_questionScores` map (4×-most-recent, pale yellow at 0.2). The ribbon
and rating heat stay beneath; the dashboard legend explains the boxes. ESAT
wrapper release label bumped to **v0.2.17 · timing, clusters, bigger
analysis** so deployed builds are tellable apart at a glance (the label had
sat at v0.2.16 across several engine versions — my omission). Suites 501/501
+ 70/70.

## 2026-07-29 (midday) — VF-14r: the last-10 strip becomes a QUESTION CLUSTER (v0.10.1)

Smith's correction, minutes after v0.10.0, confirmed for ESAT and maths alike:
not a rolling last-10 — **one dot per available question in the category**.
Untried questions sit neutral; a tried question is coloured by its performance
score, where the MOST RECENT answer weighs 4× all earlier ones (attempt
values: right 1, wrong 0, marks attempts their fraction, ranges their
midpoint). The colour runs continuously red (0) → **pale yellow at exactly
0.2** → green (1); the 0.2 anchor is precisely the right-then-wrong score, so
"was right, just got it wrong" reads as pale yellow rather than an accusing
red. Clusters cap at 240 dots with an honest "+n"; a "tried / available"
count sits beneath; per-dot tooltips carry the question id and percentage.
Suites 497/497 + 70/70 (weighting anchors, colour stops and smoothness,
availability counting, neutral dots, cluster rendering).

## 2026-07-29 (late morning) — VF-14: performance and filters by many more categories, with last-10 dots (v0.10.0)

Engine v0.10.0, from Smith's dictated ask ("view performance by lots of the
other categories… filter by lots of other categories… a little bundle of
green & red squares next to each — look at patterns"). The squares are
The Smithy patterns gallery's **P-SLI-LAST10DOTS**: the most recent outcomes
in order, oldest dropping off, empty slots padded.

- **New config surface `progressAxes`**: each axis names a label and
  `valuesOf(q) -> [categories]` (multi-value welcome — a question counts in
  every category it belongs to). My progress renders one house-style shaded
  table per axis: category, **last-10 dots** (green right, amber part-marks,
  red wrong, pale pads, newest at the right), attempts, correct %, average
  rating, average time. Rows sort by practice volume, capped at the 14
  most-practised with an honest "+n more" line. Ratings average the member
  questions' scores; discarded times stay out of the averages.
- **IB Maths**: filters gain question type, theme and command term (the
  catalogue's `command_terms` now ride the flattened rows); performance axes:
  subtopic, family, question type, theme, command term, paper, syllabus era.
- **ESAT**: performance axes: subtopic, source, year, spec status.
- Suites: acceptance 486/486 (multi-value counting, chronological r/p/w
  trails, rating and time aggregation, dot padding and order, wrapper wiring);
  content-safety 70/70.
- Consumer notes: `progressAxes` is optional; consumers without it keep the
  existing topic-only progress page.

## 2026-07-29 (mid-morning) — d013/VF-04: the timing system (v0.9.0)

Engine v0.9.0. Sources: handoff VF-04 + the ESAT architecture packet
(2026-06-29), built as one bounded feature per the handoff sequence.

- **Six modes**, learner-chosen in the new header Timing panel and persisted
  per device (`store.prefs.timing`): Off (silent capture only), Reveal at the
  end (session summary in the panel), Reveal after each question, Quiet clock,
  Pacing ring (fills toward the target, shows "+0:12 over"; swaps to a quiet
  countdown under prefers-reduced-motion), and Time bank (± seconds against
  the target; the bank can go NEGATIVE — deficit is shown, never floored
  away).
- **Pacing comes from the subject**: `cfg.timing = { targetOf(q) -> seconds,
  defaultMode }`. ESAT: uniform 90 s (60 min / 40 questions), default quiet
  clock (Smith's earlier choice preserved). IB Maths: 1.5 min per mark
  (`marks × 90 s`), default off while learning (q10). No pace is hardcoded;
  difficulty-based targets stay a later, learned pattern.
- **Extra time is a learner preference, not config**: 25% / 50% / custom in
  the panel, negative allowed for harder practice; scales every target.
- **Pause** (paused time excluded from the spend) and **"don't record this
  one"** (attempt lands with `time_ms: null` + `time_discarded`, touching
  neither bank nor session tally). Analysis/reflection time is excluded by
  construction — the clock commits at answer (or at markscheme reveal for
  marks questions). Report payloads gain `target_ms` and `time_discarded`.
  Guessing is never inferred from time.
- Legacy `cfg.timer` consumers are untouched; `cfg.timing` supersedes when
  present. `timing_mode` on attempt rows now records the live mode.
- Suites: acceptance 470/470 (prefs, target×multiplier incl. negative, pause
  arithmetic, bank credit and deficit, discard honesty, panel behaviour,
  wrapper pacing, reduced-motion fallback); content-safety 70/70.
- Config-shape confirmation posted to `ESAT Prep App\inbox\`.

## 2026-07-29 (morning) — VF-13: analysis overhaul round 2 — read once, answer there, loads more room (v0.8.1)

Engine v0.8.1, from Smith's live-use dictation ("we only ever want anyone to
read something once… it has to all happen at the same time… loads more real
estate").

- **Real estate.** On wide screens the analysis sheet now takes
  `min(1080px, 72vw)` (was 760px/52vw); the question column shrinks but stays
  visible with its crop scaled to the narrower column, so question + answer +
  analysis are on screen together.
- **The sticky bar shows everything you committed**: question, topic, "you
  chose A" (or "you gave yourself 5/7" for marks attempts) AND "your split:
  A 60% / C 40%" from the guess declaration, updating the moment a declaration
  or post-answer correction lands (new `_syncAnalysisReminder`).
- **Group prompts split to their methods.** A prompt referencing several
  methods no longer renders once after the group (forcing re-reading); each
  referenced method's foot carries a compact kind-aware ask ("Did you use this
  route?") with the prompt's AUTHORED states, answered where that method was
  read. Events keep the same self_report grammar plus `method_ref`; the plain
  prompt-id state stays current so conditional feedback matching is unchanged.
  The authored combined wording remains reviewer-visible (`?review`) and in the
  block's tooltip. Single-ref prompts keep their Phase 1.5 attached rendering.
- **The floating check question is gone**: `pupil_analysis.check_prompt` now
  reads once inside the insight block as "Check yourself", instead of dangling
  optionless near the bottom ("it just doesn't make sense").
- **"Things this question used" opens expanded** by default (still
  collapsible). Orphan whole-question prompts sit under an explicit "About the
  whole question" heading.
- Acceptance suite 443/443 (Q4 group-prompt contract rewritten to the split
  model; sheet width, crop scaling, reminder composition, check placement and
  expansion all asserted). Content-safety 70/70.
- Consumer notes: presentation-level only; no config changes. Analysts: the
  per-method split reinterprets a group prompt's states per member — if any
  group prompt's states cannot read per-method, flag it and the viewer can
  exempt that prompt id.

## 2026-07-29 (small hours) — d012 marks self-assessment + the IB Maths teacher-only consumer (v0.8.0)

Engine v0.8.0. New consumer: IB Maths (teacher-only). ESAT release unchanged.

- **New question type `marksSelfAssess` (d012, Smith's dictated spec).** Work on
  paper, reveal the markscheme (ms text and/or ms crops; the clock stops at
  reveal, so marks entry is not working time), then the marks bar: one row
  0..max, one click when sure, the max button doubles as "Got it right" (no
  "I"), a "Not sure?" toggle takes a two-tap lowest/highest range. `correct`
  stays the derived full-marks boolean so every existing surface works;
  `marks_max`, `marks_awarded`/`marks_range` and `sure` ride on the attempt
  row. Number keys enter marks. Full marks highlights the 4/5/6 rating band
  (others stay clickable). The verdict reads "You gave yourself X / max".
- **Structured what-went-wrong (d012 taxonomy, implements VF-06's shape).**
  Part marks or a zero opens a config-driven multi-select taxonomy
  (`selfAssess.taxonomy` groups; maths seed: Annoying slips / Getting stuck /
  provisional Communication), the question's own topic-parts as one-click
  weak-area chips (`selfAssess.weakAreasOf`), an "Other" free text and a
  "Suggest a new category" proposal channel. Selections persist onto the
  attempt row (`responses.error_tags`) and restore in review mode.
- **IB Maths consumer (`example\ibmaths.html`), TEACHER-ONLY.** Mounts the
  Maths Categorisation seat's canonical catalogue
  (`Maths Categorisation\viewer\maths_catalogue.js`, 2,195 questions, AAHL +
  legacy MHL, live-read so their regeneration flows through). Question-unit
  marking (their per-part marks still carry aggregation quirks); filters
  syllabus/era, AA fit (default Yes), topic, topic-part facet, family, paper,
  year; d012 taxonomy seeded; count-up timer; generic feedback shell; flags,
  history, review and My progress inherited. Public deployment is BLOCKED on
  q12 (IB-content exclusion gate); `deploy\ibmathsdriller` holds a placeholder
  only. 840 legacy questions lack markscheme crops — honest in-app note, and
  reported to the Maths seat with the `ms_pages` fix suggestion.
- **Supersession:** yesterday evening's `tools/build_ibmaths_catalogue.js` and
  its generated `example/ibmaths/` output are REMOVED — the Maths seat now
  ships the canonical catalogue (their `viewer\build_viewer_catalogue.py`), and
  one source beats two. Its AAHL-flat join logic lives on in git history
  (commit 732c3b3) if ever needed.
- Verification: acceptance 363/363 and safety 70/70 still green (no regression
  from the new type); `_commitMarks` semantics spot-checked (full / partial /
  range / range-at-max / double-commit guard). A dedicated d012 suite section
  and Smith's visual pass are still owed before this engine version reaches a
  publish.

## 2026-07-29 (later) — VF-02: the pupil's own progress page (v0.7.0)

Engine v0.7.0, same unpublished ESAT release v0.2.16.

- **"My progress" button in the header** (every consumer) opens the pupil's own
  analysis page in the modal shell, built entirely from the local store: a
  seven-number totals strip (attempts, questions tried, % correct, average
  rating, guesses declared, flagged, time practising); a by-topic table
  (attempts, correct %, average rating, average time, flags); an over-time
  by-day table; and a recent-questions drill-down where each attempt shows
  verdict, rating, declared guess candidates, flag, time, persisted response
  count, feedback-readiness badge and any saved reflection. Clicking an
  attempt closes the page, shows that exact question (independent of current
  filters) and reopens its last attempt in review mode.
- **Tables follow the estate data-presentation standard**: values centred both
  ways, headings wrapped rather than widening columns, smooth two-tone shading
  computed per cell and anchored white at zero, one hue per quantity class
  (counts slate, correctness blue, ratings amber, time purple), black text with
  capped darkness. Departure stated: flag counts are unshaded because their
  range is a thin sliver of a zero-anchored scale.
- **Interrogation responses now persist onto the attempt row**
  (`row.responses`: prompts, knowledge states, method yes/no, diagnostic
  choices; plus `post_guess_declaration`). Previously they left only as report
  events. This feeds the progress page AND completes VF-03: reopening an
  attempt now restores the chips/states that were actually selected.
- Empty store gets a plain explanation rather than a broken page. Attempts on
  questions no longer in the bank render unclickable rather than crashing.
- Acceptance suite grows 336 → 363 (shading rules, aggregation, rendered page,
  drill-down, empty state, response persistence). Content-safety 70/70.
- Consumer notes: `row.responses` is additive; the page needs no config. q11's
  recommendation (pupil-first, teacher aggregation later) is implemented.

## 2026-07-29 — VF-03: session history and review reopen (v0.6.0)

Engine v0.6.0, same unpublished ESAT release v0.2.16.

- **Previous now walks the session's attempted history**, in attempt order,
  instead of the current view array: it survives reshuffles and filter changes,
  and reopens an attempted question even when the current filters exclude it.
  The card says "looking back" while in the walk; at the oldest attempt,
  Previous stays put rather than wandering into arbitrary positions. Next walks
  forward through the history, then resumes the live run where it left off.
  With no history yet, both keep their original positional behaviour.
- **Attempted questions carry a visible "Review your last answer" button**
  (fed by the persisted attempts log, so it works across sessions). It reopens
  the analysis pop-up in review mode: earlier verdict restored, guess
  declaration recapped with its percentages, saved reflection note restored,
  rating already showing, flags as they were. Review adopts the ORIGINAL
  attempt id so any edits made while reviewing attach to that attempt; no new
  attempt row is written, no answer event fires, nothing is painted onto the
  still-answerable card, and closing the review mints a fresh attempt id so a
  genuine re-attempt never reuses the old one.
- Reflection prefill also fixes same-session reopening showing a blank box
  where a note had already been saved.
- Acceptance suite grows 314 → 336 (ordered + shuffled history walks,
  filtered-out reopen, oldest-attempt behaviour, review-mode restoration,
  no-duplicate-event guarantees, close-review reset). Content-safety 70/70.
- Consumer notes: `render()` gains an optional explicit-question parameter;
  positional calls behave exactly as before. The Review button only appears for
  consumers running `postQuestionReview`.

## 2026-07-28 (night) — VSAFE-03 + VF-07: rejected pills deleted, the flag is real (v0.5.0)

Engine v0.5.0, same unpublished ESAT release v0.2.16.

- **VSAFE-03 closed.** The legacy pill/strikethrough elimination chips are
  DELETED from the stylesheet, not just unused, and the legacy prose parser
  (`_elimChipsEl`) now renders through the same `.ppq-oev` coloured-letter rail
  as deep-v2: parsed kills project to rules_out, the landing letter to
  directly_identifies, survivors stay unaffected. Unparseable prose keeps its
  honest raw-prose fallback. The suite asserts no pill classes and no
  struck-through text anywhere in the stylesheet, so no future fallback can
  silently restore the rejected design.
- **VF-07 minimum honest implementation.** `store.flags` (question id →
  flagged-at timestamp) joins attempts/scores as persisted state; a question
  flagged in a previous session reopens flagged; the header gains a
  "Flagged (n)" toggle (hidden until something is flagged) filtering through
  the shared predicate so finder, counter scope and dashboard agree; Clear all
  filters clears it; unflag works from the same button. Copy is honest: "in
  your flagged list", with the false recommender promise removed. The
  `review_flag` event now carries `question_id` alongside `flagged`.
- Suites: acceptance 314/314 (VSAFE-03 rail projection, VF-07
  persistence/filter/copy/reopen); content-safety 70/70.
- Consumer notes: `flags` is additive store state (old stores normalise to
  `{}`); the Flagged toggle appears only for consumers running
  `postQuestionReview`. Chemistry unaffected.

## 2026-07-28 (evening) — Phase 1.5: readable analysis, answer beside the thing (v0.4.1)

Engine v0.4.1, same unpublished ESAT release v0.2.16. Direct response to Smith's
live-use verdict (dictated, 2026-07-28): the pop-up was "mainly unreadable",
text too close together, and the did-you-use-it questions not beside the
content they ask about.

- Typography opened up across the interrogation pop-up: body text to ~1rem,
  line-height 1.6+, step padding doubled, bigger chip/choice tap targets, a
  full unit of air between cards (previously 0.72–0.95rem text at 1.4–1.5
  leading with 0.5rem card gaps).
- The generic method tick moved from a small head-corner "used it" button to a
  foot-of-method ask row, where the eye lands after reading the steps:
  "Did you use this route? / Did you do this check? / Did you put it together
  like this?" answered with explicit "Yes, I did / No, I didn't" buttons.
  Event grammar unchanged (self_report state `used` / `not_used`), so
  reporting and analysis consumers see the same data.
- The QoderWork handoff #4 rule is kept: a method with an authored local
  prompt gets no generic ask; that prompt IS the ask, and it now renders as
  the visual CONTINUATION of its method card (joined borders, dashed divider,
  faint tint) so the question is answered where the content was read. DOM
  order is unchanged (prompt remains the sibling after its method), so the
  analyst placement contract and existing assertions hold.
- ESAT sign-in gate now carries a clearly-marked "Important update" note
  (Smith: an important update must be clearly visible as one), and the
  versionLabel reads "safer content, clearer analysis".
- Authored prompt PROSE is untouched (analysis-side ownership); only viewer
  chrome wording changed.
- Acceptance suite grows 281 → 294 (ask placement, wording, yes/no events,
  local-prompt suppression, joined cards, line-spacing wiring, update note).
  Content-safety suite still 70/70.

## 2026-07-28 (later) — content-safety gate: damaged analysis can no longer render (v0.4.0)

Engine v0.4.0, ESAT wrapper v0.2.16. Implements VSAFE-01/VSAFE-02 from
`CLAUDE_HANDOFF_2026-07-28.md`. Source-only until the next sync + push.

- New config surface `contentSafety: { withheld: {id: reason}, heuristics: true }`
  (defaults: empty list, heuristics on). `_contentSafety(q, rec)` decides safety
  with precedence: bundle-declared `content_safety` state → consumer withheld
  list → deterministic damage heuristics (`scanAnalysisRecordForDamage`:
  replacement char, `?` fused to digit, `?` between numbers, repeated `?`, lost
  apostrophe, UTF-8 mojibake; URL-ish fields skipped; memoised per record).
  Reasons are reviewer-facing only.
- `_feedbackReadiness`: safety comes first and cannot be overridden by the
  `feedbackStatusOf` hook, a catalogue field or the bundle's status ledger.
  Full and Provisional now both REQUIRE a resolvable safe record: a ledger row
  alone promotes nothing (the 18 held launch-only questions stay Solution
  pending whatever the status estate claims — the VSAFE-02 clamp). Unsafe
  records return new code `withheld` with pupil-facing label "Solution pending"
  (deliberately indistinguishable from pending for pupils; distinct class
  `ppq-feedback-status-withheld` in CSS for tests/reviewer tooling).
- `_renderInterrogation`: the gate sits at the single analysis entry point; a
  withheld record takes the same generic guess/feedback/rating shell as an
  absent one, with no fragment of unsafe content rendered. The `?review` strip
  shows `CONTENT WITHHELD (was: <review status>) — <reasons>`.
- ESAT wrapper pins seven known-damaged records: the analysis owner's RS-01
  five, plus TWO MORE the damage scan found on 2026-07-28
  (`esat_engaa_2019_s1_Q12`, `esat_nsaa_2019_s1_Q30`: byte-identical damaged
  pair, both marked reviewed, both live as Full). Reported to Codex in
  `analysis_v2\VIEWER_DAMAGE_REPORT_2026-07-28.md`. Scan sweep: 5/720 flagged,
  all confirmed damaged, zero false positives.
- Honest public estate once deployed: Full 41, Provisional 672, Withheld 7,
  Solution pending 18 (sum 738; previously 46/674/18 with five damaged records
  presenting as Full). Derived from the 2026-07-27 bundle.
- Tests: new `test/test_content_safety.js` (70 assertions: heuristics,
  precedence, clamps, wrapper pinning, real-bundle gating, clean-record
  non-regression) wired into the sync as a publish gate. The 281-assertion
  acceptance harness taught the new method (fake ctxs bind `_contentSafety`).
  Both suites green: 281/281, 70/70.
- `tools\sync_esat_website.ps1`: runs the safety suite before assembly is
  publishable; banner now names the split (viewer Claude, analysis Codex).

Consumer notes: chemistry and other non-analysis consumers are unaffected
(no `analysisOf` → gate never engages). Any consumer that supplies analysis
records inherits the gate; a consumer claiming Full/Provisional status must now
actually resolve a safe record or the badge clamps to pending.

## 2026-07-28 — Claude takeover: baseline verified, source under version control (no engine change)

Maintainer: **Claude**, per `CLAUDE_HANDOFF_2026-07-28.md`. Codex retains analysis planning and content repair in PaperDatabases.

- Re-ran the viewer acceptance suite against the live analysis_v2 bundles and the real ESAT catalogue: **281 passed, 0 failed**, matching the handoff baseline.
- Confirmed `deploy\esatwallop` clean at `41dbecc` with `build-info.json` carrying the public build `b778d4c0d9c2` (built 2026-07-27T23:43Z, 720 analysis records, 738 classifications).
- Established the recoverable source checkpoint the handoff required: initialised a real git repository in the source folder (the previous `.git` was empty), with `.gitignore` excluding generated `dist\` and the separately-versioned `deploy\` checkout. Initial commit `bb5ee7a`, 36 files. Local history only; no remote, no push.
- Removed a stale `deploy\esatwallop\.git\index.lock` (left by a sandboxed status probe; it would have blocked GitHub Desktop commits).
- No engine, page, bundle or deployment change. Next per `ROADMAP.md` Phase 1: VSAFE-01/VSAFE-02 (invalid/withheld content-safety state; readiness computed from content the viewer actually resolves).

## 2026-07-24 — Codex takeover, analysis-presentation contract and repeatable ESAT deployment (v0.3.0)

Maintainer: **Codex**. This release completes and verifies the interrupted Qoder
handoff, then replaces Qoder's hidden deployment workspace with a documented,
project-owned pipeline.

### Analysis presentation

- The analysis pop-up can be minimised to a slim bottom bar so the pupil can
  inspect the question, diagram, options and chosen answer while reading.
- `methods[].presentation_kind` now distinguishes dependent routes, independent
  checks and synthesis instead of flattening everything under "Ways through it".
- The option-evidence display is a complete fixed-position letter rail ordered
  from `identity.option_labels`, with seven preserved evidence relationships.
- Self-report prompts render next to their referenced methods; group prompts
  appear once after the group. Raw `proposed__` state IDs never reach pupils.
- Review status and reviewer identity are confined to the reviewer-only
  `?review` strip.
- Missing analysis remains a graceful plain-question path and never blocks the
  ordinary answer, verdict or progression flow.

This deliberately supersedes the v0.2.9 pupil-facing review label, detached
"More quick checks" area and pill/strikethrough option chips.

### Verification

- `test/verify_analysis_presentation.js` is now a permanent Codex-maintained
  acceptance harness. Current result: **192 passed, 0 failed**.
- PaperDatabases validation: **100 records, 0 errors, 0 warnings**.
- The deployed engine and generated analysis bundle receive syntax checks on
  every sync.

### Deployment and ownership

- The permanent GitHub Pages checkout is now `deploy\esatwallop`; the Qoder
  workspace is historical only.
- `SYNC_ESAT_WEBSITE.cmd` runs `tools\sync_esat_website.ps1`, which validates and
  rebuilds PaperDatabases analysis, assembles the viewer, updates the checkout,
  adds deterministic cache-busting tokens and writes `build-info.json`.
- The sync stops before Git staging, committing or pushing. GitHub Desktop is
  the deliberate review and push boundary.

— Codex, 2026-07-24

---

## 2026-07-23 (QoderWork) — analyst presentation contract: all prompts shown, state label, evidence vocabulary, reviewer strip (v0.2.9)
Four changes requested by the categorisation analyst after reviewing the live esatwallop site.

### 1. All self-report prompts now shown
The renderer previously showed only the FIRST primary method prompt and FIRST primary knowledge check. Now ALL primaries are rendered. Secondary (non-primary) prompts and checks sit behind a "More quick checks (N)" disclosure. `pupil_analysis.check_prompt` (a plain string question) is surfaced as a quiet text line.

### 2. Analysis-state label
A quiet footer in the pop-up: "Full review · Codex" (when `review.status === "reviewed"` and the record has methods + feedback) or "Early review" (sparse v2). Distinguishes complete analysis from in-progress.

### 3. Option-evidence vocabulary (viewer-ready)
`_elimChipsV2El` now supports a richer `option_evidence[]` array on each method: `{label, relationship}` where relationship is one of `rules_out` (red, struck), `counts_against` (amber), `supports` (light green), `favours` (green), `directly_identifies` (bold green). Falls back to the binary `eliminates[]`/`lands_on` when `option_evidence` is absent. DATA ACTION NEEDED: the analyst adds the `option_evidence` field to Q4, Q11, Q36 methods in the next bundle build.

### 4. Reviewer-only analysis strip (?review)
Append `?review` to the URL to see a monospace strip at the top of each pop-up: record ID, schema version, review status, reviewer, crop/answer check marks, and prompt counts. Immediately distinguishes "the analysts ignored this" from "the data contains it but the viewer hid it." Pupils never see it (no `?review` in their URL).

### Also in this version
- Sticky top bar: `.ppq-header` no longer scrolls away (position:sticky, top:0, z-index:100).
- "Out of Spec" tag: now big, bold, and red (`.ppq-tag-out`) so it's unmissable at a glance. Filter renamed "All (spec)" → "All In" with friendly label "In spec" / "Out of Spec".
- Previous button at the TOP of the card (`.ppq-prev-top`): smaller, subtler duplicate of the bottom Previous so pupils don't have to scroll past a long question crop to go back. Both buttons wired via `qa(".ppq-prev").forEach`.

---

## 2026-07-23 (QoderWork) — guess declaration moves to first page of the pop-up (v0.2.8)
Smith's redesign: the guess declaration is no longer a panel below the question (easy to miss "down there"). It is now the FIRST PAGE of the post-answer pop-up, asked BEFORE the verdict is revealed. Suspense before the reveal.

### What changed
- The pre-answer "I'm guessing" panel below the question is retired (DOM retained, never shown). The old post-answer "Actually, it was a guess" correction inside the modal is also superseded.
- The pop-up now opens straight onto a guess page: heading "Want to declare a bit of a guess?" + the option checkboxes (chosen option preselected) + optional percentages. The pupil ticks options and presses Done, or presses Enter/Skip to decline. Only THEN does the verdict ("You chose X — the answer is Y") appear.
- Reworded prompts: "Tick the options you think it could be." (was "Which options are still in the running?"). The heading is "Want to declare a bit of a guess?" (was "I'm guessing").
- Percentages pulled in next to the option letter (was floating way out on the right with `margin-left:auto`).
- New `declared_stage: "pre_verdict"` in the payload (post-answer but pre-verdict — they've picked their option but haven't seen the correct answer yet). Carries `chosen_option` and `correct`. The stored attempt row is updated retroactively (the attempt is committed the moment they pick, before the modal opens).
- Feedback matching unchanged: `_postGuessDeclared` and `_preGuessDeclaration` are both set, so guess-aware feedback entries fire correctly once the verdict page is revealed.
- Edge case: questions with fewer than 2 options skip the guess page entirely (verdict shows immediately).

### What stays
- The shared `_buildGuessPicker` is unchanged (same validation, same largest-remainder allocation, same optional percentages toggle).
- The `guessDefaults` config hook still works (per-stage prompt/label overrides from analysis-v2 `interaction_defaults`).
- chem-compare is untouched (it does not enable `postQuestionReview`).
- All v0.2.7 behaviour (verdict content, insight, methods, self-report, feedback, 1-6, flag) is preserved — just revealed one beat later.

---

## 2026-07-22 (QoderWork, latest) — analyst handoff: guess semantics repaired, verdict literally first, analysis-v2 consumed (v0.2.7)
Integration pass implementing the categorisation analysts' "Handoff to the ppqviewer implementer". This is NOT a rewrite — the functioning viewer, filtering, timer, reporting, modal, plain-question fallback and non-ESAT consumers are all preserved. chem-compare is untouched (every change is opt-in config).

### Settled guess-declaration semantics (now implemented)
- One declaration offered at BOTH stages: pre-answer ("I'm guessing") and post-answer ("Actually, it was a guess"). A guess is any set from 2 up to every option — not a special "guess between two".
- Percentages are OPTIONAL, behind an "Add percentages (optional)" toggle. Equal splitting is only a starting value once that toggle is chosen; a pupil can record just the candidate set.
- After answering, the chosen option stays IN the picker and starts PRESELECTED (it is no longer removed).
- Both stages fire `qtype:"guess_declaration"` with one payload shape in `extra_json`: `{guess_declared:true, declared_stage:"pre_answer"|"post_answer", candidate_options:[...], attempt_id:"...", candidate_percentages?}`. The post-answer event additionally carries `chosen_option` and `correct`. The legacy `qtype:"unsure"` and its `declared/wavering` payloads are superseded.
- Every displayed attempt gets a stable `attempt_id`; the answer event and the stored attempt carry it plus any pre-answer declaration snapshot, so repeated attempts at one question stay distinguishable.
- `Done` no longer silently closes on <2 options — the panel stays open with an inline validation message. No event fires for an empty post-answer selection.

### Two bugs fixed
- `_shouldHandleKey` now ignores `INPUT`/`SELECT`/`TEXTAREA`/content-editable targets, so typing "10", "50" or "80" into a percentage box never commits answer A/E/H.
- Percentage redistribution uses a largest-remainder allocation (`allocateLargestRemainder`) — every value is a non-negative integer and the total is exactly 100 (the old proportional pass could drive the final option negative).

### Modal order — the verdict is now literally first
The pop-up order is: (1) concrete verdict "You chose B — the answer is D", ALWAYS rendered even when the chosen option has an empty `error_path` (the explanation is optional, the verdict is not); (2) the optional post-answer guess correction; (3) the pupil insight; (4) methods + structured eliminations; (5) the primary self-report/knowledge check + matched feedback; (6) the 1-6 rating + Next. The old "What this question is really about" headline no longer precedes the verdict. The outer "Actually, I wasn't sure" control is superseded (hidden, DOM retained) — the correction now sits inside the modal where guess-aware feedback can see it.

### Analysis-v2 consumption (with old-data fallback)
- The engine detects a v2 record by its `identity` + `pupil_analysis` blocks and renders its fields DIRECTLY: insight (`first_notice`/`why_it_matters`/`next_move`), chosen-option `error_path`, method `title` + `pupil_steps`, red chips from `methods[].eliminates`, green chip from `methods[].lands_on`, the primary `self_report_prompts[]` item, the primary `requirements.post_question_checks[]` item, and structured feedback on `selected_options`/`prompt_id`/`states`/`guess_declared`.
- NO regex parsing of v2 steps or eliminations (the `_methodLinesEl`/`_elimChipsEl` stopgaps are legacy-only now). Internal taxonomy is hidden from pupils: `error_tags`, category paths, mechanism codes, diagnostic confidence, difficulty chips, strategy tags.
- Feedback matching for v2 is first-match-wins over the array, on the structured constraints; a `guess_declared:true` entry only fires once a guess is on record. The per-method "used it" tickbox stays as supplementary evidence (it does not drive v2 feedback).
- `esat-compare.html` loads the generated bundle (`window.ESAT_ANALYSIS_V2`), `analysisOf` prefers `by_id` and falls back to the legacy analysis store for unmigrated questions, and `guessDefaults` is sourced from `interaction_defaults.guess_declaration`. Questions with no analysis of either kind remain the plain viewer.

### Content ownership
The viewer renders the analysts' v2 pupil prose faithfully (escaped, laid out) and does NOT rewrite it — no JS cleanup layer for praise/jargon/tone. The viewer owns only generic chrome: "I'm guessing", "Actually, it was a guess", validation messages, headings, buttons, and the humanised state-chip labels.

### Fixes found in verification (this session)
- ENGINE BUG: the interrogation modal never populated its feedback region on first open — feedback only appeared after a guess was committed or a self-report state was tapped. So entries that match with no guess and no prompt state (v2 `selected_options`-only, legacy `any_wrong`/`any_correct`) were invisible on a plain answer. `_renderInterrogation` now calls `_renderInterrogationFeedback()` once the modal is mounted (it still re-renders on guess/prompt interaction). Caught by the headless test.
- esat-compare SIGN-IN GATE: if `ppq-login.js` failed to load (e.g. a tester opened the file without its folder), the inline script threw at `window.PPQLogin.createLogin` BEFORE the class dropdown was populated — leaving it blank and Start dead, so testers could not get in. The dropdown is now populated FIRST and unconditionally; the estate login is optional with a minimal local fallback gate (name remembered locally, no pulse); and `enterApp` shows a plain "the viewer engine did not load — open from inside the ppqviewer folder" message instead of failing silently if the engine itself is absent.

---

## 2026-07-22 (QoderWork) — pre-declare guesses (v0.2.6)
Smith's decision: "I think we just go with pre, actually." Pupils can optionally declare which options they're guessing between BEFORE locking in their answer — more honest data than post-declare (which is also still available as "Actually, I wasn't sure").

### How it works
- A small "Declare guesses?" button sits above the answer row, visible while the question is on screen. Entirely optional — if they just answer, nothing is recorded.
- Clicking it opens a panel: one checkbox per option letter. Tick 2+ to engage.
- Percentages auto-distribute equally (2 ticks = 50/50, 3 = 34/33/33). Each ticked option gets a number input; typing a bigger number proportionally decreases the others. Total always sums to 100.
- "Done" fires `status:"interrogation", qtype:"guess_declaration"` with `{declared:true, wavering:[{label:"B", pct:60}, {label:"D", pct:40}]}`. "Skip" closes without recording.
- The widget hides once the answer is locked; resets between questions.

### Design notes
- Pre-declare captures uncertainty at the honest moment (before outcome knowledge). Post-declare ("Actually, I wasn't sure") captures reflection after seeing the verdict. Both stay — they measure different things.
- The analyst preview's ask #6 (pre vs post) is now answered: we do BOTH. The analyst's remaining job is to think about how to USE the data (e.g., weighting, routing to different feedback paths).

---

## 2026-07-22 (QoderWork) — correction: verdicts back ON, verdict leads the pop-up (v0.2.5)
Smith corrected the v0.2.4 misread. He never said "never tell them right or wrong" — he said the *fault* was that the abstract probe headline ("What this question is really about?") came FIRST, ahead of the concrete verdict. His words: "I didn't say we never tell them right or wrong. I said that was a fault, not that that's true."

### What changed
- `esat-compare.html` no longer sets `revealCorrect: false`. Pupils ARE told right/wrong, same as before v0.2.4.
- Pop-up order is now: **verdict block FIRST** ("You picked B — the right answer" / "You picked B — the answer is G", with red/green border + coloured head), then the probe, then methods, then feedback, then 1-6 + Next.
- CSS verdict styling restored (`.ppq-iq-option.wrong/.right` borders + head colours).

### What stays
- The engine's `revealCorrect` switch still exists (opt-in, default true) for a future test mode where hiding the verdict is genuinely wanted. ESAT does not set it.
- Everything else from v0.2.4 is unchanged: "Actually, I wasn't sure", multi-line methods, "used it" tickboxes, no "beats the trap"/speed labels, in-popup 1-6, shuffle default, multi-select subject filter, count-up timer, stuck-filter fix.

---

## 2026-07-22 (QoderWork) — Smith's live-review pass: "wasn't sure", pop-up rebuild, shuffle + Maths&Physics default, count-up timer, stuck-filter fix (v0.2.4)
Engine + stylesheet + esat-compare wiring. All of it from Smith talking through the running page. chem-compare is untouched (every change is opt-in config, so it keeps today's behaviour).

### ~~Never tell them right or wrong~~ (SUPERSEDED by v0.2.5 — this was a misread; verdicts are ON)
- `config.revealCorrect` was added (default true). esat-compare briefly set it `false`; v0.2.5 removed that. The switch remains in the engine for a future test mode. Correctness is always RECORDED in every attempt row regardless of display.

### NEW "Actually, I wasn't sure" (uncertainty confession)
- After answering, an option sits to the RIGHT of the answer line: "Actually, I wasn't sure". Tapping it opens letter chips ("I thought it was…") so the pupil can mark the options they were torn between — "I thought it was B or D" — then Done. Fires `status:"interrogation", qtype:"unsure"` with `{unsure:true, wavering:["B","D"]}`. This is the lucky-guess detector: it works even when the answer was right, and independently of speed.

### Pop-up rebuild (from Smith talking through it)
- Methods are set out on MULTIPLE LINES — the one-line algebra was "quite hard to read". Split on commas/semicolons; "=>" becomes a "⇒ …" result line. On the 128 ESAT methods, 117 now break into lines. (NOTE-TO-SELF: a real per-method `steps:[…]` field would beat this regex pass.)
- Every method gets a little "used it" TICKBOX (multi-select across methods), replacing the single 6-state shortcut-awareness ladder and the one green "Use this" button ("I don't know why one is green and one's not"). Fires `qtype:"self_report"` with `state:"used"/"not_used"` per method.
- "beats the trap" and the "~15s" speed labels are GONE ("I don't know what beat the trap means could you please get rid of this 15 second stuff"). All methods now look equal.
- A small encouraging line under "Ways through it": there's more than one route, collecting alternatives is the point.
- The 1-6 self-rating now lives INSIDE the pop-up ("that one, two, three, four, five, six is back outside. Probably should be inside it there"), with its own "Next question →" button. The outer 1-6 row is hidden while the pop-up is open; closing the pop-up early (×/Escape/outside) brings it back so nobody is stranded, syncing any rating picked inside. Keyboard: Enter advances from the pop-up once rated, 1-6 rate inside it, arrows close it then navigate.

### Filters + timer (esat-compare)
- Shuffle is now the STANDARD order (`config.defaultOrder:"shuffle"`).
- The subject filter is a new multi-select DROPDOWN defaulting to Maths + Physics (Smith teaches both now); Chemistry and Biology are a tick away in the same dropdown. Engine support: any filter may set `multi:true` + `default:[…]`; ticking everything collapses back to "All".
- The exam timer now counts UP ("you're counting down, no, count up… and just to have a log of how long"): a subtle elapsed clock, and every answer records `time_ms`. The down mode (banking + forced/tight/ok pressure tags) stays in the engine for later.
- STUCK FILTER FIXED: Smith clicked P3 Mechanics (a physics topic) while filtered to maths, got "No questions match these filters", and couldn't see the filter was on or how to undo it. Now the active topic filter shows as a removable chip next to the question counter ("P3 Mechanics ✕"), the empty state names the stuck filter and offers "Clear all filters", and the active mastery category is highlighted more loudly.

### Deferred (noted, not built)
- A first analysis page (the mastery dashboard exists; the new unsure/used-it/flag/timing events give it more to show) — next pass.
- Probe/method/slug wording is still analyst-facing (Smith: "that will be fixed, that's not your problem").

## 2026-07-22 (QoderWork) — estate shared login + exam timer with guess-disambiguation (v0.2.3)
Two additions, both driven by Smith. No storage/schema change; the attempt row shape is untouched (new fields ride in `extra_json`).

### Estate shared login (the tracking-system bridge, NOT a new auth tier)
- New shared module `example/ppq-login.js` exposing `window.PPQLogin.createLogin({projectTag, cohortKey, classes, onStatus})`. It replicates the exact mechanism Linguics adopted from the EdTech Overview shared-login spec — it does NOT invent a new system.
- Identity is SHARED across the whole estate via the localStorage key `smithics_fields_identity_v1` (`{anonymous_id, display_name, google_email}`), so a pupil's name prefills on every driller. `google_email` stays empty estate-wide (real Google-OAuth is the teacher-read tier, not this).
- Cohort/class is SCOPED per page (its own `cohortKey`, never written into the shared identity object — that holds the pupil's physics class). Class is chosen from a supplied DROPDOWN.
- On sign-in it fires a `session_start` row; every event POSTs to the one shared `teacher-tracking.gs` endpoint with the page's `project` tag (`ppqviewer_esat` / `ppqviewer_chemistry`), which the script routes to its own tab automatically (no redeploy). Fail-soft: the pulse never breaks the app (sent/offline flash only).
- POST pattern is the estate standard: `text/plain` + `no-cors` + `keepalive` (Apps Script rejects preflighted JSON; the response is opaque, so "sent" means dispatched, not confirmed).
- Wired into BOTH comparison pages: `esat-compare.html` (`ppqviewer_esat` / `ppqviewer_esat_cohort_v1`) and `chem-compare.html` (`ppqviewer_chemistry` / `ppqviewer_chem_cohort_v1`). The old inline identity/report/gate code in each page was deleted and replaced by the shared module.
- FLAG FOR SMITH: the class dropdowns use INTERIM hardcoded lists — ESAT `["Test","Y12 ESAT","Y13 ESAT"]`, Chemistry `["Test","Y10 Chemistry","Y11 Chemistry"]`. Give me the real class names and I'll swap them; when TeacherViewer milestone M2 ships its single-source `doGet`, point the dropdown at that instead.

### Exam timer (the feature that tells a fast answer apart from a guess)
- New optional `config.timer` = `{mode:"up"|"down", perQuestionSec, banking, bankSec, prominence:"hidden"|"subtle"|"prominent", pressureSec}`. Off unless supplied. Wired into `esat-compare.html` as `{mode:"down", perQuestionSec:90, banking:true, prominence:"subtle", pressureSec:10}`.
- Silent capture is ALWAYS on (the engine already records `time_ms`); the timer config only governs whether a visible clock is shown and how prominent it is. `prominence:"hidden"` records everything and shows nothing — per Smith's earlier "avoid surfacing the time" preference.
- Time-banking (down mode): surplus time carries forward into a pool floored at 0. Answer Q1 in 30s of a 90s budget → +60s banked; Q2's budget becomes 150s.
- Guess-disambiguation (Smith's point: "people guess after 10 minutes of thought; these kids would only guess with 8 seconds if they really only had 8 seconds left"). A fast answer is AMBIGUOUS — instant knowledge vs. ran out of clock — so the engine records the CONTEXT of the speed, not just the speed. On every "answered" report, `extra_json` now also carries `time_remaining_ms` and `time_pressure`: `"forced"` (clock at/below 0), `"tight"` (≤ pressureSec left), or `"ok"` (plenty left). An 8s answer with 82s on the clock logs `"ok"`; an 8s answer at 0s logs `"forced"` — downstream analysis can now separate a confident snap from a desperate guess.
- Visible clock styles: `--subtle` (small, muted, top-right) and `--prominent` (large, boxed, centred); `--tight` recolours, `--forced` recolours + pulses.

## 2026-07-22 (QoderWork) — post-question interrogation as a pop-up, first half-working pass (v0.2.2)
Engine + stylesheet + esat-compare wiring. Deliberately rough, per Smith's "get something half working, we'll come back and make it smooth". No storage/schema change; the attempt row is untouched.
- New optional module `postQuestionReview`. When `config.modules.postQuestionReview` is truthy and `config.analysisOf(q)` returns an analysis record (ESAT d028 shape), the engine opens an interrogation POP-UP after an answer is committed (it reuses the image-zoom modal shell; dismiss via ×, Escape, or clicking outside). Smith: the inline panel "gets lost a long way down there". Questions with no record show the plain viewer (graceful absence).
- The pop-up shows: the probe ("What this question is really about", with difficulty/trick chips); the chosen option's error path plus misconception slugs (green if right, red if wrong); the methods with the trap-defeating quick route highlighted ("beats the trap"); and the FIRST self-report prompt as the 6-state shortcut-awareness ladder (used / saw_and_used / saw_and_discarded / barely_considered / did_not_see / saw_and_got_stuck).
- NEW red/green elimination chips per method (Smith: "if it kills B&D, you show a B&D in red; if it takes you straight to the answer, show it in green"). `_elimChipsEl` does a best-effort regex parse of the free-prose `eliminates` field into red (killed letters, struck through) and green (lands-on letter) chips, one per option. On the 128 ESAT methods this parses 67 into chips; the other 61 fall back to showing the raw prose rather than guessing. DATA GAP for the analysts: add a structured per-method field (`eliminates:[letters]`, `lands_on:letter`) so this is reliable.
- NEW per-method "Use this" adoption tick (recommended styling on the trap-beater; ignorable). Fires `status:"interrogation", qtype:"method_adopt"`.
- NEW optional "Flag this — come back / more like this" review flag (Smith: pupils can ask for a question to return). Fires `status:"flag_review", qtype:"review_flag"`.
- Feedback fires on (chosen option + self-report state). `on` honours option:X, any_wrong, any_correct. `when` honours state:method_ref directly, plus a rough inference for used:full_solve (learner didn't take the prompted shortcut), plus a crude bare-flag prefix match. Tapping a state fires a `status:"interrogation", qtype:"self_report"` event.
- The pop-up is optional and non-blocking: the 1-6 rating and Next button are untouched.
- NEW left options rail (`config.optionsLeft`, on for ESAT): the A–H letter picker sits in a sticky column to the LEFT of the question so there is no long scroll to answer (the crop shows the printed options; the rail is just the picker).
- Wired into `example/esat-compare.html`: loads the five ESAT analysis-store files (33 questions, 5 papers), maps catalogue ids (slug|number|part) onto analysis ids (slug_Qnn[_part]), and sets `optionsLeft:true`.
- KNOWN ROUGH EDGES (notes-to-self in engine): 6 state labels are a first draft; only the first self-report prompt is shown; the `when` grammar is partial and needs reconciling with misconceptions_core.yaml; probe/method wording is analyst-facing and should be rephrased for pupils; the elimination-chip parse is a stopgap (see DATA GAP above).

## 2026-07-22 (QoderWork, later) — layout + UX quick fixes from Smith's comparison feedback (v0.2.1)
Engine + stylesheet, no storage/schema change.
- Split dashboard restored to the original Chemistry-viewer shape: a three-column layout — `dashboardColumns[0]` (e.g. Paper 1B Mastery) on the LEFT, the question card in the CENTRE, `dashboardColumns[1]` (e.g. Syllabus Overview) on the RIGHT (`grid-template-columns: 280px 1fr 280px`). Previously both columns were stacked inside one right-hand sidebar. `_renderSplit` now renders each column into its own flanking panel; single-mode dashboards are unchanged.
- Independent scrolling: the mastery panel(s) are now `position: sticky`, so scrolling the paper no longer drags the mastery out of view, while each panel keeps its own internal scroll. Narrow screens fall back to a stacked, non-sticky layout.
- Larger controls: Reveal/Previous/Skip/Next buttons bumped to 1.05rem; the 1-6 self-assess scale buttons to 1.15rem with more padding.
- Tunable figure size: crop / whole-question / original-page images now honour a `--ppq-crop-width` CSS variable (default 92%, centred). chem-compare sets 90% (a touch smaller); esat-compare sets 78% (its questions were coming through too big). The drawing canvas sits in the same container, so it stays aligned.
- Labelled 1-6 scale: each scale button now carries a tooltip and a legend beneath the scale gives Smith's canonical meanings — 1 No idea; 2 Don't fully understand; 3 Got it wrong but I get it now; 4 Got it right but not stable; 5 Got it, strong/comfortable; 6 Trivial, never need it again. Default in the engine (`DEFAULT_SCALE_MEANINGS`), overridable via `config.selfReport.meanings`.
- Softened the full-markscheme spoiler wording to "(may well contain spoilers for other parts)", aligned across the engine and the live Chemistry viewer.

## 2026-07-22 (QoderWork) — report hook + comparison pages with estate logging (v0.2.1)
Engine v0.2.1. Optional `report` callback wired into the mount, fired on every attempt and self-rating.
- `PPQViewer.mount(root, { config, questions, meta, report })`: the `report` callback receives a payload shaped for the estate's shared `teacher-tracking.gs` Apps Script endpoint (project, timestamp, session_id, item_id, topic, qtype, mode, level, status, picked_id, misconception_id, extra_json). Engine stays transport-agnostic; the hosting page supplies the callback and POSTs to REPORT_URL.
- Events fired: `session_start` (on init), `answered` (MCQ/imageSelfMark, with correct + time_ms in extra_json), `rated` (self-report 1-to-6, with rating value in extra_json).
- Comparison pages created: `example/chem-compare.html` and `example/esat-compare.html`. Both carry the estate GA4 + Clarity blocks (WEB_KIT), an honour-system sign-in gate (name + class, modelled on the Trilogy shell), and POST to the shared Apps Script endpoint under project tags `ppqviewer_chemistry` and `ppqviewer_esat`. Separate storage keys (`_COMPARE` suffix) so comparison use does not touch live pupil data.
- Crop paths resolved to absolute `file:///` URLs for cross-folder local viewing.
- No consumer notifications sent (comparison pages, not live deployments).

## 2026-07-01 (Phase 3) — chemistry's modules ported, chemistry migrated (v0.2.0-phase3)
Engine v0.2. Pluggable question-type system plus chemistry's optional modules, ESAT path unchanged.
- Question types: `imageSelfMark` (ESAT), `mcq` (chemistry 1A, auto-marked with synthetic option text + examiner report), `flashcard` (chemistry 1B/2, reveal markscheme with accept/reject formatting + full-page spoiler + examiner report).
- Modules: `referenceBooklet` (data-booklet deep-link with the Section-N / periodic-table scanner), `structuredPaper` (multi-part navigator, whole-question vs part-by-part toggle, the G:-copy page peek-back heuristic), `math` (KaTeX/mhchem hook). Split dashboard (`dashboardLayout: "split"`) for chemistry's two-column syllabus view. Header buttons (periodic table / data booklet).
- Chemistry wired as the second consumer: `example/chem-config.js`. New unified storage key `chemistrydriller_ppq_v2` with a `migrate` hook seeding from the old v1 keys so pupils keep their history (d010).
- Tests: `test/test_chem.js` (jsdom) 21/21 pass against the real 956-question chemistry bank (migration, split dashboard, MCQ auto-mark, flashcard reveal recording no graded attempt, structured multi-part with two modes, booklet trigger, header buttons, filtering). ESAT regression `test/test_ppqviewer.js` still 19/19: no capability lost on either side.
- Process note: the bash sandbox served a stale truncated view of the just-written engine file, so v0.2 was validated against a reconstructed sandbox copy. The on-disk engine is complete and correct (734 lines). This was a sandbox mount lag, not a disk issue.

## 2026-07-01 (Phase 2) — shared engine spine built and tested (v0.1.0-phase2)
First real engine code. `engine/ppqviewer.js` + `engine/ppqviewer.css`.
- Option A (d003) implemented: `PPQViewer.mount(root, {config, questions, meta})` draws all furniture (header/filter bar, question card, drawing controls, options, self-report widget, dashboard, floating toolbar, modal) into one mount. No `getElementById`, all state on the instance, all queries scoped to the root: embed-safe for SR (d009).
- Shared core: config loader that fails loud on a missing `storageKey` (d002); flat attempts-log + scores storage keyed off `storageKey` (d001); filter/order/shuffle/start; next/prev/skip; pluggable self-report widget defaulting to 1-to-6 (d006); dashboard derived from the log (last-10 ribbon + rating heat map, shared ramp + intensity, untagged-last, click-to-filter); parametrised prefetch warming crops, stem and answer separately, depth from config (d005); drawing overlay ported verbatim and scoped; image modal; scoped keyboard map.
- First consumer wired: `example/esat-config.js` maps ESAT onto the shared schema (storageKey kept as `esat_ppq_v1` so pupils' scores survive), `example/esat.html` is the one-mount page.
- Tested headless against the real 1042-question ESAT catalogue (`test/test_ppqviewer.js`, jsdom): 19/19 pass, covering furniture build, filtering, self-mark, engine-ready attempt rows, self-rating, dashboard derivation, cross-mount persistence, the fail-loud storageKey guard, and an embed-safety check.
- NOT yet ported (Phase 3): chemistry's modules (referenceBooklet, structuredPaper with its two modes + peek-back heuristic, questionTypes MCQ/flashcard/examiner, math), the split dashboard layout, and the postQuestionReview/assistance modules. Hook points are in place.

## 2026-07-01 (later) — Smith feedback folded into the design
Still docs, no engine yet.
- Verified fork-vs-stale on the G: chemistry copy by reading it in full (736 lines): stale, not a fork. One micro-heuristic (peek-back to the previous printed page) preserved into structuredPaper. See d001 verification note.
- New decisions: d006 (self-report is a pluggable config scheme, not a hardcoded 1-to-6), d007 (assistance layer: pupil asks for help + free response, teacher records an answer with a visibility scope: pupil / class / all), d008 (real logins + class membership for all users, the OAuth backend tier), d009 (viewer must run as an embeddable bolt-on component, not only a standalone page).
- Open questions resolved: q01 (SR is a near-term EMBED consumer), q03 (self-report categories fed by each consumer, not syllabus-locked), q05 (preserve chemistry's dashboard split). q02 reworded in plain English and still needs Smith's steer. q04 parked ("dunno"), non-blocking. q06 added (cross-consumer analytics visibility).
- Prefetch confirmed: several ahead, answer image warmed separately.

## 2026-07-01 — Phase 0 kickoff, operating-model docs laid down
Not an engine change yet (no shared engine exists to ship). Recorded for the trail.
- Read the kickoff packet and the divergence census.
- Read both live engines in full: chemistry `ppq.js` (826 lines) + `ppq.html`, ESAT `engine.js` (388) + `config.js` + `index.html`.
- Confirmed the live chemistry copy is `C:\Claude...\chemistrydriller` (29 Jun, namespaced storage + PREFETCH_AHEAD=3 + part navigator), not the stale G: mirror (bare `ppq_scores`, no prefetch). No wrong-copy risk.
- Census correction logged: the live chemistry copy has since adopted namespaced storage, closing one of the census's stated reasons for the ESAT spine (conclusion unchanged; see d001).
- Laid down PROJECT, DESIGN, DECISIONS, OPEN_QUESTIONS, ROADMAP, REGISTRY, and this CHANGELOG.
- Seed decision recorded: d001 (ESAT-spine seed), with d002 (namespaced storage mandatory), d003 (engine-owns-DOM), d004 (one configurable dashboard), d005 (parametrised prefetch).

No consumer notifications sent (nothing shipped). First notification will accompany the Phase 2 spine.
