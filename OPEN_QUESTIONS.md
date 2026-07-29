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

## q08 — real class source

What is the current authoritative class list/API? Until known, the live
`Test`, `Y12 ESAT`, `Y13 ESAT` list must be described as interim/test-only.

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

## q12 — IB-content public exclusion gate (blocks any public IB Maths deploy)

The IB Maths viewer consumes IB past-paper crops. The Maths seat's onboarding
note (inbox, 2026-07-29) flags the provenance/licence exclusion-layer question
as unresolved for any PUBLIC deployment; a teacher-only surface has no such
gate. Until Smith rules on what may be published (and under what exclusion
rules), `example\ibmaths.html` stays a teacher-only local page and
`deploy\ibmathsdriller` stays on the placeholder. Decision needed before the
first real publish.

## Previously resolved

- Special Relativity is an intended embedded consumer.
- The engine builds its own on-screen furniture inside a mount point.
- Self-report is configurable rather than fixed permanently to one taxonomy.
- Chemistry preserves its split dashboard.
- Assistance is a later shared module with pupil/class/all visibility.
- Real identity/class membership is a later dependency of assistance, not a
  launch blocker for the current ESAT viewer.

— Codex refresh for Claude, 2026-07-28
