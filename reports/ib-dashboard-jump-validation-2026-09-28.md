# IB Physics mastery jump — 28 September 2026

Requested behavior: the mastery sidebar jumps to the relevant question type as
the correctness or confidence indicator fires, never in anticipation of an answer.

## Change

`Viewer._firePendingDashboardPulse` now selects the active matching facet row,
or the first matching row, and brings it into view within its own dashboard pane.
The scroll uses `behavior: "instant"` in the same call that starts the pulse.
All directly assessed matching rows continue to flash. An already-visible row
does not move. No question load, navigation, markscheme reveal or incomplete
mark-range event gained a scroll call. The legacy non-facet path is unchanged.

Canonical files: `engine/ppqviewer.js`, `test/test_dashboard_pulse.js`,
and the clarified geometry-test description in `test/test_question_tools.js`.
Pre-existing engine/CSS/reporting work was preserved.

## Browser evidence

The real assembled IB release was exercised locally at a desktop viewport of
1280 by 900 using the browser UI. Local reporting is disabled by the existing
host restriction; no production learner attempts were submitted.

- May 2025, HL Paper 1A TZ3, Q9: answering B moved the dashboard from 0 to
  1162.4 pixels in the answer event. The flashing Direct time dilation row was
  visible at viewport y=340.7–430.5.
- After manually scrolling the dashboard back to the top, entering confidence 3
  restored the same row and pulse immediately.
- Next opened November 2013 HL Paper 3 Q14(a) without moving the dashboard.
- Revealing that markscheme left the dashboard at 1162.4 with no pulse.
- Saving 1/2 then moved the dashboard to 0 and flashed the matching Reference
  frames, events, space–time and invariant quantities row at y=300.6.

## Validation

- Syntax check and scoped whitespace check passed.
- 12 dashboard pulse regression checks passed, including no early jump, marks,
  confidence revisions, multiple memberships, active-row preference, visible and
  tall rows, hidden/non-scrolling panels, filtered-out questions, focus, filters
  and independent question/layout scroll positions.
- Inline rating, question tools, dashboard memberships, question loading,
  Physics engine behavior, usability and reporting suites passed.
- All eight required shared suites passed: 2,426 assertions, zero failures.
- The remaining evidence/consumer suites passed. The initial three failures in
  `test_physics` were stale copied engines in an older local multi-course preview;
  the normal assembler refreshed it and all 101 checks then passed. This did not
  change the IB release pointer or any question source.
- The exact IB release passed all 36 package/UI checks, with 252 real MCQs,
  2,016 fresh keyboard journeys and zero reused journeys (exec session 93024).

## Package

IB build: `c75a30d7c3a1172f`.
Deployment baseline: `67fac6817cb2e4f39aa458ddf7e517cff56ed515`.
The catalogue and all 1,316 assets are byte-identical to the deployment baseline:
543 parts, with no question-data changes. Package differences are build metadata,
shared engine JS/CSS and the already-present generic reporting-adapter update.

Staging completed with all 1,326 package files verified, four changed files in
the deployment index, and zero deleted assets. The staging tool confirmed exact
index/worktree identity with the generated build.

Publication has not been performed. Commit, push and served-build verification
remain outstanding. The repository's operating model reserves the final GitHub
Desktop push to Smith.
