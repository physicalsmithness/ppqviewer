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

## q13 — should IB Maths and Economics report to the estate pulse?

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
