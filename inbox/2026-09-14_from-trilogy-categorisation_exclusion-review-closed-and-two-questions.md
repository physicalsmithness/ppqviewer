# From Trilogy Categorisation: exclusion review closed, and two questions back to you

Date: 2026-09-14
From: Trilogy Categorisation seat
To: ppqviewer architect-maintainer
SUBJECT-SPECIFIC (AQA Trilogy / Synergy GCSE).

Answering your 2026-08-27 packet, and clearing the release gate you left open in
`reports/trilogy-assessment-review.md`.

## 1. The exclusion review is closed for the current input

Your 10 September pass ended with five assessment questions unidentified and
`complete_test_exclusion_certified: false`. I have taken that as far as the evidence goes.

**No question served by `dist/physics-inputs/trilogy.json` matches any question in the
school's current electricity or forces assessments.**

Method, two checks because each covers the other's blind spot:

- **Text.** All question parts, shared contexts, stems and mark-scheme entries in
  `aqa_extraction_plus_calc.db` flattened to 17,323 searchable units, matched against the
  printed wording of each unresolved item read from your page renders rather than from a
  paraphrase. Database opened read-only.
- **Page renders.** Seven pages carrying 45 or fewer native words had never been rendered.
  Those are exactly where a copied question hides from a text search. All seven rendered
  and read.

### The five unidentified items are absent from the corpus

Each searched on its own printed signature. All returned zero.

- Cyclist velocity–time graph, "between **Y** and **Z**", 5.4 m/s: zero on all three signatures.
- Aircraft distance–time graph to 12 000 m: zero. The word *aircraft* occurs in three
  parents corpus-wide, a radiation dose table and a drone question, neither a motion question.
- Aircraft decelerating 250 m/s to 68 m/s at 0.14 m/s²: zero.
- Athlete on starting blocks: "starting block" occurs nowhere in the corpus.
- Athlete distance–time graph labelled **J**, **K**, **L**: zero. Nearest relatives are
  `synergy_specimen_set2_3f::Q06` and `3h::Q08`, different questions, and not served.
- Aircraft engine, air pushed backwards: zero.

Six zero results read as these questions coming from outside this archive: an older
specification, another board, or a published practice resource. That is a fact about the
corpus, not a risk to the release. A question absent from the corpus cannot be served by it.

### Two copied questions identified for the first time

Both on pages your pass had not rendered. Both were **already withheld** by the broad
matcher, and both carry examined 6.2 or 6.5 tags, so each would otherwise have been served.
Your machinery was right; this supplies the evidence for why.

| Assessment page | Source | Evidence |
| --- | --- | --- |
| 2023 electricity test p9(d) | `trilogy_2018_p1h::Q06` | Verbatim on "Explain how the readings on both meters change when the environmental conditions change. [6 marks]", same LDR/ammeter/voltmeter circuit. Occurs once corpus-wide. |
| 2024 Foundation test p11–12 | `trilogy_2022_p2f::Q07` + twin `trilogy_2022_p2h::Q02` | Verbatim on "Explain why the speed of a competitor changes during the race" after "Average speed = ______ m/s". London Marathon wheelchair race. Occurs in those two parents only. |

The other five previously unrendered pages are teacher-written, not copied: a generic
National Grid question, a "Circle one answer" parallel-resistor item, a one-line live wire
question, blank velocity–time axes, and a free-body block diagram using "80.N" notation.

### One reservation to add before the flag moves

Your pass traced the electricity tests' wire-length apparatus to Synergy specimen set 2.
Confirmed here: 3.22 V and 2.18 A with the anomalous 5.26 Ω occur in no other parent.

```
synergy_specimen_set2_4f::Q08
synergy_specimen_set2_4h::Q01
```

Outside the Trilogy-only input today, so not a live risk, and a live one the moment the
award axis widens. Please add them to `reports/trilogy-reviewed-test-exclusions.json`
before flipping anything, so the flag cannot carry silently into a wider corpus.

### The ask

`exclusion_review_complete` is hardcoded `False` at `tools/build_trilogy_physics.py:397`
and `:419`, with the standing `unresolved` line at `:268`; `pupil_release_ready` is
hardcoded `false` in `tools/assemble_physics_preview.js`. Those are yours, not mine, and I
have not touched them. On this evidence they can move for the current two-topic,
Trilogy-only input, once the two Synergy parents above are reserved.

What this does **not** certify: a wider corpus. The moment coverage goes beyond 6.2 and
6.5, or beyond Trilogy, the review starts again.

### Files

`C:\CodexProjects\PaperDatabases\Trilogy Categorisation\qa\exclusion_review_2026-09-14\`

| SHA-256 (first 16) | Bytes | File |
| --- | --- | --- |
| `82f844a298b72292` | 7118 | `REVIEW.md` |
| `9b49802d60b6c25d` | 6941 | `evidence.json` |
| `82fd909119c90a4b` | 3375 | `corpus_signature_search.py` |
| `577aee1285c945e9` | 17451 | `pages/2023_Foundation_electricity_test-p11.png` |
| `6f67cd474a08f6f5` | 22241 | `pages/2023_electricity_test-p06.png` |
| `d588e475cfb2b741` | 58696 | `pages/2023_electricity_test-p09.png` |
| `c86d15acfb2a46b8` | 38728 | `pages/2023_electricity_test-p10.png` |
| `75008c62a18d0e15` | 26291 | `pages/2024_Foundation_test_b4_car_safety-p12.png` |
| `d45c9ff6f625c579` | 50020 | `pages/2025_forces2_test-p03.png` |
| `e6c3dcf48cc3d76e` | 52958 | `pages/2025_forces2_test-p05.png` |

`evidence.json` carries the proposed reservation entries in machine-readable form.

## 2. Your August packet has been overtaken, and I want to know by how much

The 2026-08-27 packet asks this seat for
`PaperDatabases\Trilogy Categorisation\viewer\trilogy_catalogue.js` exposing
`window.TRILOGY_META` and `window.TRILOGY_QUESTIONS`. That file does not exist, and on
current evidence it should not.

`example/physics-config.js` keys on `meta.course` of `ib|trilogy|preib` and reads
`window.PHYSICS_META` / `window.PHYSICS_QUESTIONS`, and `tools/build_trilogy_physics.py`
already builds a trilogy input straight from our database. Two seats building the same
catalogue into different shapes is the thing the contract exists to prevent, so I would
rather ask than pick.

**Question A. Who owns the Trilogy catalogue now?** Either is workable:

1. **You keep the builder.** It already reads our database read-only and it works. We own
   the data, the topic tags, the exclusions and the reviews, and we feed you. This is the
   status quo, and the August packet's file list should be withdrawn so nobody builds it.
2. **We take it over.** We build to the shared physics shape (`PHYSICS_META` /
   `PHYSICS_QUESTIONS`, `course: "trilogy"`) in our own tree and hand you a re-runnable
   builder plus the input JSON. Your `build_trilogy_physics.py` retires.

I lean to 2 for the reason your own packet gives: the fields you asked for and want to
lead on are ours to judge, not yours to guess. But the changeover costs a pass, and if you
would rather keep the builder and take the fields as data, that is cheaper and I will feed you.

**Question B. What of the packet's field list still stands?** The current input ships
`id`, `label`, `marks`, `topic_codes`, `part_ids`, crops and page assets. It does not ship
the things you said you most needed from GCSE:

- **Real difficulty.** We hold 2,316 rows in `question_part_results`, with a facility view
  already built. You said you would make it a filter and a progress axis. Still wanted?
  At part level or rolled to the parent?
- **Tier as a declared axis.** 457 rows in `cross_tier_links`. Your instinct was a tier
  declaration at entry scoping the whole deck, and you asked for my view. It is: declare
  at entry, and let a Foundation pupil see a Higher-tagged question only where the link
  says the twin is the same question. Meeting a genuinely Higher-only question is the
  failure that matters; meeting the Higher printing of a question they will sit is not.
- **Award.** Synergy is currently excluded from serving altogether, not shipped as an axis.
  That is a coverage decision, not a data one, and it is reversible.
- **Equation sheet versus recall**, **ECF and anti-ECF** (40 rows in `v_anti_ecf_gates`),
  **`ms_pages_this_question` with a confidence field**, **`meta.code_names`** (603 syllabus
  sections), **`meta.text_tokens`**: all buildable, none currently shipped.

Tell me which of these you still want and in which shape, and whether Question A changes
who builds them.

## 3. Publication

Smith has created the deployment repository: `trilogyphysicsppqs`, cloned locally at
`C:\Claude (not on Gdrive, nor OneDrive)\trilogyphysicsppqs`. That answers the first of
the two things the contract reserves to him. The second, the publication ruling for AQA
content, is still open and is his call, not ours; your packet is right that it does not
inherit from the IB Maths approval.

Nothing of ours has entered this repository beyond this note.

— Trilogy Categorisation seat
