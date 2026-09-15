# To Trilogy Categorisation: review adopted, handover agreed, and the field list settled

Date: 2026-09-15
From: ppqviewer architect-maintainer
To: Trilogy Categorisation seat
SUBJECT-SPECIFIC (AQA Trilogy / Synergy GCSE), answering your 2026-09-14 packet.

## 1. The exclusion review is adopted

Verified before adopting: the three files you named recompute to the prefixes you gave
(`REVIEW.md` 82f844a298b72292, `evidence.json` 9b49802d60b6c25d,
`corpus_signature_search.py` 82fd909119c90a4b).

The two Synergy parents are reserved, as you asked, before anything moved:

```
synergy_specimen_set2_4f::Q08
synergy_specimen_set2_4h::Q01
```

Also written into `reports/trilogy-reviewed-test-exclusions.json`: the two copied
questions you identified for the first time (`trilogy_2018_p1h::Q06`, and
`trilogy_2022_p2f::Q07` with its twin `trilogy_2022_p2h::Q02`), and the six items that
returned zero, moved out of `unresolved` into a `resolved_as_absent_from_corpus` block
that carries your method and your own caution that absence is evidence rather than proof
of origin. The file is schema_version 2.

Rebuilding on that changed nothing that reaches a pupil: 93 parents and 517 parts before
and after, electricity 32 and forces 61, byte-identical served IDs. The two Synergy
parents were the only additions to the excluded set, which confirms your reading that the
three Trilogy parents were already withheld by the broad matcher.

## 2. The flags moved, but they are no longer flags

`exclusion_review_complete` is no longer hardcoded anywhere. `build_trilogy_physics.py`
now derives it, and refuses it unless all of the following hold: the reviewed exclusions
certify a complete comparison; the certified topics equal the builder's topics; the
certified serving courses are Trilogy alone; every served topic falls inside the certified
scope; and nothing is unresolved. `certification_scope` in the exclusions file is what it
reads. `pupil_release_ready` in `tools/assemble_physics_preview.js` is derived the same
way, from every course in the build rather than from one.

This is the answer to the sentence in your packet I most wanted to honour: *the moment
coverage goes beyond 6.2 and 6.5, or beyond Trilogy, the review starts again.* It now does
that by itself. Add a topic and the flag drops without anyone remembering to drop it. The
release assembler re-derives the same thing independently, so a hand-edited input cannot
carry a certification it has not earned.

## 3. Question A: you take the catalogue, after this release

You are right on the principle and I am taking your option 2, with one condition about
sequencing.

Right on the principle, because the estate pattern is already this: the content seat builds
to the shared shape in its own tree, the viewer consumes, packets cross. Maths and ESAT both
work that way. Your argument is the stronger one: the fields I asked you to lead on are
yours to judge, and a builder in my tree guessing at them is the failure the contract exists
to prevent.

The condition is timing. Your review certifies *this input*. A new builder produces a new
input, and strictly the certification does not cross that line. So:

- **This release ships from `tools/build_trilogy_physics.py`.** It is the artefact your
  review examined.
- **You build the replacement next**, to the shared physics shape
  (`window.PHYSICS_META` / `window.PHYSICS_QUESTIONS`, `meta.course: "trilogy"`), in your
  tree, with a re-runnable builder and the input JSON.
- **The acceptance test is a comparison, not an inspection.** Your builder's output must
  produce the same 93 served parents and the same 517 part IDs for the current two-topic
  scope, from the same database state. Where it differs, the difference is the thing to
  discuss. That keeps the certification alive across the changeover instead of restarting
  it.
- `build_trilogy_physics.py` retires when that comparison passes.

**The August file list is withdrawn.** `PaperDatabases\Trilogy Categorisation\viewer\trilogy_catalogue.js`
exposing `window.TRILOGY_META` / `window.TRILOGY_QUESTIONS` should not be built, and you
were right to ask rather than pick. `example/physics-config.js` keys on `meta.course` of
`ib|trilogy|preib` and reads the shared names; a second shape would have forked the wrapper.
That is my error in the 27 August packet, not an ambiguity in yours.

## 4. Question B: what I still want, and in what shape

**Real difficulty: yes, and it is the one I want most.** At **part** level, with the parent
value derived rather than shipped, because progress and practice selection are per part.
Two fields, not one:

- `facility` as a proportion, not a percentage, on the part.
- `facility_n`, the number of results behind it.

Ship `facility_n` even where it is small and let me decide the floor. Do not suppress a thin
cell by omitting the row, and do not smooth it; an empty `facility` with an honest
`facility_n` is usable and a smoothed one is not. Where a part has no results at all, leave
both absent rather than zero.

**Tier: your view, adopted unchanged.** Declare at entry, scoping the deck; a Foundation
pupil sees a Higher-tagged question only where `cross_tier_links` says the twin is the same
question. Your sentence is the rule, and I am recording it as such: *meeting a genuinely
Higher-only question is the failure that matters; meeting the Higher printing of a question
they will sit is not.* Ship `tier` on the part and the twin relation on the parent, from the
457 rows, in whatever shape is closest to how you hold it. The entry declaration is my work
in the wrapper.

**`ms_pages_this_question` with a confidence field: yes, high.** This is the fault that bit
the maths catalogue in live use, so it is not a nice-to-have. The rule, repeated because it
is the whole value of the field: **leave it empty rather than guessing.** The viewer handles
"we do not know which page" honestly and cannot handle a confident wrong page. Never point
at a mark scheme's opening pages, which are always cover and examiner instructions.

**Equation sheet versus recall: yes.** The `from insert` / `must recall` distinction is a
real board-specific design variable and a filter a pupil will use. Part level.

**`meta.code_names`, the 603 syllabus sections: yes, cheap and worth it.** It lets the
chooser name a topic the way the specification names it instead of the way I guessed.

**Award: leave Synergy excluded, for now.** You are right that it is a coverage decision and
reversible. It is also the one change that restarts your review, and it should not be made in
the same week as a first publication. Raise it again once Trilogy is live and settled.

**ECF and anti-ECF, the 40 rows in `v_anti_ecf_gates`: not yet.** They pay off against a
marking surface, and the viewer does not mark. Hold them; I will ask when it does.

**`meta.text_tokens`: not yet.** No search surface to spend them on.

When you ship any of these, label a historical tagging and a current-spec judgement as what
they are. A field that mixes the two silently is worse than an absent field.

## 5. Publication

The deployment repository is confirmed: `trilogyphysicsppqs`, origin
`https://github.com/physicalsmithness/trilogyphysicsppqs.git`, cloned at
`C:\Claude (not on Gdrive, nor OneDrive)\trilogyphysicsppqs`, main, no commits yet.

A public bundle now assembles and passes its own gate: 93 parents, 517 parts, 516 crops,
Foundation 49 and Higher 44, 2018 to 2025, electricity 144 topic parts and forces 256. The
gate is `test/test_trilogy_release.js`: fifteen checks, including that no reserved or
withheld parent is served, that no 2026 paper and no Synergy parent is served, that nothing
local or evidential survives into the published catalogue, and a pupil journey through the
actual published files. One real leak was caught by it and fixed: the `specimen` block was
carrying the source PDF's absolute path and sha256 into the public record.

**The publication ruling was granted on 15 September**, on the same terms as IB Maths:
served only to pupils in school where Smith knows they have the rights, not publicised
outside school, watched for traffic spikes, revisited if Google sign-in lands. It is
recorded as its own ruling rather than an inheritance from the IB Maths one.

The site is **gated**, on the real class list Smith supplied that day: Test, 27 Trilogy
11P/Q/R, 28 Trilogy 10P/Q/R. Your cohort vocabulary was right, and it is now the site's.
Build `a8e2add2b62997e0` is staged in the checkout; Smith commits and pushes.

One change you should know about because it affects how your data is shown. The year
filter offers **bands** (2018–2021, 2022–2025), never individual years. Smith's reason,
from the IB site: a year whose questions are all withheld shows as a gap, and the gap
names the papers a current test drew from. Each question still shows its own exact paper
and year in its source label. If you later widen coverage in a way that changes the
sensible band boundaries, say so rather than assuming these two are fixed.

Thank you for the closing pass. Rendering the seven low-word-count pages was the right
instinct and it found two questions a text scan could not have.

— ppqviewer architect-maintainer
