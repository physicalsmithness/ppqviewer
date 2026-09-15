# IB layout and navigation validation — 12 September 2026

Status: **published and verified**. Release build
`ab0aa88396caf624` was assembled at `2026-09-12T17:19:11.156Z` and pushed as
commit `ca2810097f55624192bce19598ce729326480e57`. GitHub Pages reported that
exact commit built. Public verification passed at `2026-09-12T17:30:02.003Z`:
all eight public HTML/JS/CSS/build-info files and three sample PNGs matched.
The live checker confirmed 146 parts and 13 nonempty legacy groups; evidence
is recorded in `dist/physics-audit/ib-a5-live-verification.json`.

This is an interface-only update: the same 146 parts, 72 parent questions and
371 public images remain. Catalogue and version 1 identity-helper bytes are
unchanged. Version 2 identity recovery remains separately staged and is not
included. No real feedback or teacher-help form was submitted during checks;
learner attempt transport remains unconfigured.

## Actual-browser checks

- The home page presents A5 as available and five future-topic cards as
  unavailable. The “Past paper question viewer” title returns to this chooser.
- The desktop title, account and filter controls occupy one row, with a 51 px
  header. At a 390 px phone width, the header is 92 px and the page has no
  horizontal overflow.
- The checked source was `04N.P3.SL.TZ0.QG1(a)`. One compact row names the exact
  active target and offers its available parts in order before the context.
  The crop below context uses the neutral “Current part” separator. Source
  metadata and marks remain available.
- Current HL and original paper-level labels remain separate: HL badges are
  purple, SL badges green, and shared badges neutral. Colour supplements the
  explicit text.
- The question footer places Ask your teacher on the left, Report a display
  problem in the centre, and Draw on the right. The teacher dialog prominently
  calls the feature experimental and asks pupils to check back for replies;
  it says notifications are planned, without promising delivery.

## Automated checks

The 2,426 shared assertions passed, alongside ten new loading/header journeys,
eight chooser checks, 14 teacher-help journeys, 97 Physics checks and 18 release
checks, including 32 real MCQ keyboard journeys. Loading tests cover question
and context completion, cached images, image-free prompts, individual errors
and retry, old-event cancellation, empty scopes and destruction. A right-hand
group selection clears the previous markscheme immediately. Key tips stays
closed until explicitly opened. The image lifecycle does not change the
current attempt, timer start or progress and makes no feedback requests.

Shared consumers retain their previous header/loading behaviour unless they
enable the new options. The teacher-help copy hooks preserve explicit Send,
required question text, confirmed receipts and the existing safe retry ID.
