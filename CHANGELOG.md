# CHANGELOG: ppqviewer

Universal engine changes are recorded here and notified into each consumer's inbox. Newest at the top.

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
