# IB marks and C feedback validation — 12 September 2026

Status: **published and verified**. Release `bca8a6f34a08360d`, deployment
`ee4e024f16fb1a5ce622cad7d49e07060e0ddcf6`. GitHub Pages reported that exact
commit built. Public verification passed at `2026-09-12T16:02:25.814Z`: all
eight checked public files and three sample PNGs matched the deployed bytes.

The actual-browser checks below used isolated preview `44c1d6819e3b33cb` at
`http://127.0.0.1:8791/`, signed in locally as Smith / Test. This exact origin
isolated its local progress. No attempt transport was configured. Display-report
and teacher-help endpoints were configured, but neither form was submitted.
No real feedback, teacher question or pupil attempt was transmitted during
these marking checks.

The subsequently assembled and published release is `bca8a6f34a08360d`: 146 parts,
72 parents, 449 source image paths, 371 distinct public PNGs and 579 clearance
fingerprints. Full release validation passed 18 checks, including 32 real MCQ
keyboard journeys. Independent comparison with `e55db219ef0bb748` confirmed
all 146 records and complete `meta.analysis` are unchanged; the public catalogue
bytes share SHA-256 `f32aef8b1941bce59cfb49c0c7fce93ef5109064c34af000c289108b4c9fd1ca`.
All 371 PNG bytes are also identical. The geometry observations below identify
the isolated preview actually tested; public delivery was then verified by the
file checks recorded above.

## Desktop: 25M.P2.HL.TZ1.Q7(b)(i)

- Selecting 1 out of 2 immediately displayed `Saved: 1/2`; the selected mark
  had `aria-pressed="true"` and remained visibly selected.
- The C stage appeared below the marks. Its top was 451.55 px and bottom
  640.43 px, wholly inside the question pane's 158.8–652.8 px visible bounds.
- Only the question pane moved: its scroll position changed from 467 to 1196.
  The analysis pane remained at 0. The question and filter selection stayed
  in place.
- Choosing C3 updated the current attempt immediately and made Next visible.

## Phone: 390 × 844, 25M.P2.HL.TZ1.Q7(a)(i)

- Selecting 1 out of 2 showed the saved mark and revealed inline C.
- C occupied 545.35–831.93 px in the viewport; all six labels were visible.
  Document scrollY was 964. The layout used the normal inline phone flow.
- The browser viewport was reset after this check.

## Automated checks already passed

The shared suites passed 2,426 assertions. Focused passes comprised seven
rating-flow checks, six dashboard-pulse checks, 15 history journeys, eight
presentation journeys, 12 shuffle/navigation journeys, 13 teacher-help
journeys, seven question-tools checks, nine pacing checks and nine identity
journeys. These cover exact/zero/full/range mark feedback, immediate current
history, the inline C transition, category feedback without analysis scrolling,
and preservation of the existing navigation/help/sign-in behaviour.

The two obsolete May 2008 reserved-row geometry exceptions were also retired.
Five focused actual-source geometry/reservation checks and syntax checks passed;
ordinary overlap now uses unchanged actual `crop_regions`. The new 579-fingerprint
count belongs to the published clearance and does not widen its 146-part scope.

The CHANGELOG, release document and registry record the verified release. The
preceding `e55db219ef0bb748` release retains its historical commit and evidence
in the earlier CHANGELOG entry.
