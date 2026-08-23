# ppqviewer open questions

Last audited: 2026-07-28

Only questions requiring a user/host decision belong here. Implemented decisions
remain in `DECISIONS.md`; ordinary engineering tasks belong in `ROADMAP.md`.

## q04 — final publishing model

Should consumers load one hosted shared engine, or vendor a tested copy into
each deployment repository?

Current reality: canonical viewer source is in this folder, while ESAT deploys a
copied engine inside `deploy\esatwallop`. This is workable but is not literally
“one runtime file shared by every subject.” Revisit before more consumers join.

## q06 — cross-consumer analytics

Should the teacher analytics surface aggregate all viewer consumers? If yes,
does it belong in ppqviewer or a separate estate reporting application?

This is not required for the first pupil analysis page.

## q07 — central feedback backend

The central feedback UI is specified but blocked on:

- endpoint/host owner;
- authentication expectation;
- payload schema;
- where reviewers see and resolve submissions.

The viewer can prepare question ID, learner name, selected answer, analysis/build
identity and text, but must not invent or silently transmit to a destination.

## q08 — real class source (now the blocking item, 2026-08-06)

What is the current authoritative class list/API? Until known, the live class
lists must be described as interim/test-only.

**Raised in priority by d024 (a sign-in gate on every consumer).** There are now
three hardcoded placeholder lists, not one: `Test / Y12 ESAT / Y13 ESAT`,
`Test / Y12 Maths / Y13 Maths`, `Test / Y12 Economics / Y13 Economics`. The
last two are guesses at names Smith has not supplied. A pupil who picks the
wrong label lands in the wrong bucket in the shared workbook, and the tracking
d024 exists to enable is only as good as these strings. Either the real names
per subject, or the TeacherViewer single-source lookup, before any of this is
leaned on for teaching decisions.

## q09 — historical launch cards

Recommendation: keep the 18 affected questions as Solution pending and migrate
them to deep-v2. Only build a launch-card loader if the user deliberately wants
that older content model supported.

Decision required only if Claude proposes reviving the legacy layer.

## q10 — default timing mode

The requested timing system offers several modes. Which should be the first-run
default once built?

Historical guidance: recommend timing off/background while learning, then let
the pupil opt into visible timing. The current public wrapper shows a quiet
count-up timer.

## q11 — first analysis-page audience

Recommendation: build the pupil's own history/analysis page first, using local
and reported attempt data. Treat class/teacher aggregation as the later backend
phase.

Decision required only if the host-side data model makes the pupil-first slice
impractical.

## q13 — should IB Maths and Economics report to the estate pulse? RESOLVED

**RESOLVED by Smith, 2026-08-06, as d024 (a sign-in gate on every consumer):
option (a), wire both now and accept the gate.** Built the same day via the new
shared `PPQLogin.mountGate()`; the suite now enumerates every pupil-facing
consumer and asserts each is gated, reports, and carries its own project tag
and cohort key. The finding that prompted it is kept below because it is the
evidence for the standing rule that a consumer is not finished until it
reports.

Found 2026-08-06 while fixing the pulse transport. Only `esat-compare.html` and
the chemistry comparison page load `ppq-login.js` and pass a `report` function
to the engine, so **the published IB Maths driller has sent no attempt data
since it went live on 2026-07-29**, and the new Economics wrapper sends none
either. GA4 page analytics are on IB Maths (d014, publish approved); the
attempt pulse is a different thing and is absent.

This is a product decision, not a defect, which is why it is here rather than
on the roadmap. Reporting requires sign-in (`report()` returns early when not
signed in), so wiring it means putting the estate's honour sign-in gate in
front of the maths driller, which changes what a pupil meets on arrival.

The options: (a) wire both to the pulse now, accepting the sign-in gate;
(b) wait for Google sign-in (expedited under d014, publish approved for
school use) and wire all consumers to that in one pass; (c) leave IB Maths and
Economics deliberately unreported and say so in the registry.

`test\test_pulse.js` asserts the current state, so the day a consumer is wired
the suite fails and this question gets answered rather than drifting.

## q14 — where does this run once login has to mean something? (2026-08-17)

Smith: "these are all temporary, aren't they, because we're going to have to
move them off GitHub in order to get login?" Partly, and the distinction
decides the sequencing.

- **Google sign-in itself does not need a move.** Google Identity Services is
  client-side; a static page can sign a pupil in and receive an ID token.
- **Accounts that MEAN something need a backend, but not necessarily a new
  host.** Something has to verify the token (an unverified token is a claim,
  not a fact) and hold per-pupil progress so it follows them between devices.
  The estate already runs a small backend of exactly this kind: the Apps
  Script behind the attempt pulse. TeacherViewer's d007 is the same pattern,
  Google sign-in plus the surface hosted by the script.
- **Putting the PAPERS behind the login does need a move.** On GitHub Pages
  every asset URL is public; a sign-in screen there is a curtain over an
  unlocked door. So the day "school-served and unpublicised, traffic watched"
  (d014's basis) stops being a sufficient rights position is the day hosting
  has to change. That, not login, is the forcing function.

**What survives a move, so this is not wasted work:** the engine, every
wrapper and config, the catalogues, the assemblers, and d026's two deployment
shapes. What changes is the URL and the push mechanism, and the estate already
has a redirect-stub pattern from the ibeconomics split.

**The observation worth carrying:** six threads now point at one missing
piece. q04 (hosted engine versus vendored copy), q07 (feedback backend owner),
q08 (real class source), d014's expedited Google sign-in, TeacherViewer
stalled one deployment short, and this. All of them are waiting on one small
verified-identity service. Building that is a bigger decision than any of the
six and would close all of them.

## q15 — should school-facing drillers report into Smith's personal analytics and Sheet? (2026-08-17)

WEB_KIT now carries TTPossiblee's d004, promoted to estate level: *a tool
built for St Leonards does not use `G-WKYGJYERSR` and does not use the estate
feedback sink*, because that measurement property and that Apps Script Sheet
live in Smith's personal Google account, and pointing school use at them mixes
school data into a private estate silently.

Every ppqviewer consumer uses both. d024 (a sign-in gate on every consumer)
made this sharper the same week: two more sites now collect pupil name, class
and per-question attempts into that personal Sheet.

The judgement is Smith's and it is not obvious: these are his own teaching
tools, used with his own classes, which is not the same as a tool the school
commissioned. But the question should be answered deliberately rather than by
default, and it is cheap to change now and awkward later.

## Previously resolved

- **q12 — IB-content public exclusion gate. RESOLVED by Smith, 2026-07-29
  (recorded as d014):** publication approved. Basis: the site is served to
  school pupils who hold rights to the papers; it will not be publicised
  beyond school; GA4 is watched for any traffic spike; Google sign-in is
  expedited for the medium term. The deploy now ships crops, ms crops AND the
  complete markscheme pages (deduped, ≈680MB total).

- Special Relativity is an intended embedded consumer.
- The engine builds its own on-screen furniture inside a mount point.
- Self-report is configurable rather than fixed permanently to one taxonomy.
- Chemistry preserves its split dashboard.
- Assistance is a later shared module with pupil/class/all visibility.
- Real identity/class membership is a later dependency of assistance, not a
  launch blocker for the current ESAT viewer.

— Codex refresh for Claude, 2026-07-28
