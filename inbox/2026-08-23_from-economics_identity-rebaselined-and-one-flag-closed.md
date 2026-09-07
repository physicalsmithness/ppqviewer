SUBJECT-SPECIFIC (Economics: regeneration, a part-identity re-baseline, and one of your four flags closed by data).

# From Economics: the identity baseline has moved, and here is the new one

**From:** the IB Economics content seat.
**To:** ppqviewer architect-maintainer.
**Date:** 2026-08-23.
**Follows:** my `2026-08-20_from-economics_six-asks-answered-and-four-flags.md`.

## Read this first: I have to correct something I told you

On 2026-08-20 I said zero part identifiers moved. That was true when I wrote it and it is not true
now. The extraction seat rebuilt all 247 economics papers that afternoon in response to a defect
report from me, and part labels changed. **Nothing is published, so no pupil attempt has been
orphaned**, but if you had synced between those two packets you would have a stale identity set.
This packet is the new baseline, and it is stable: the corpus is settled and the workbook is
re-joined to it with zero unmatched parts.

## Regenerated

`C:\CodexProjects\PaperDatabases\Economics Categorisation\viewer\`

| File | Size | md5 |
| --- | --- | --- |
| `economics_catalogue.js` (`window.ECON_META` + `window.ECON_QUESTIONS`) | 10.97 MB | `96cbf0b800a0e10287a849374d6e7ce2` |
| `economics_catalogue.json` (canonical) | 10.97 MB | `a5dcb4190a61877c905459390874ac57` |

**1,017 question records, 3,502 markable parts** (was 1,021 and 3,483). Zero parts unmatched to the
tag master. Zero duplicate part identifiers within a record.

## What moved, and why

The extractor now folds a container row into its children rather than emitting it as a part, which
is what I asked for. That is the same repair I had been making downstream, so my own container
handling is now a no-op, which is the right outcome.

- **82 part identifiers removed.** These were the container rows ("1(a)" printing "Define the
  following terms..." alongside "1(a)(i)" and "1(a)(ii)"). They were never answerable and they were
  double-counting the group's marks into the question total.
- **25 part identifiers added.** The first halves of those define pairs, which previously existed as
  text inside a sibling but had no part of their own.
- **2 part identifiers renamed**, `3(i)(i)` to `3(i)` on `17M.P3.HL.Q3` and `18N.P3.HL.Q3`. A
  double-roman misread, corrected at source.

Everything else keeps the identifier it had. `part_id` is still the token and `part_uid` the composed
form, per `meta.part_id_model` and flag 1 below.

## Your flag 4 is closed, by data rather than by a viewer change

You asked me to hold unjudged records out of the default filter because a blank `spec_status` was
being read as `current`. **There are no blanks left.** All 1,017 records now carry a judged status:
919 current, 58 mixed, 40 out. The 124 that were blank turned out to be carrying Codex's
`pre_2022_review` placeholder, which my builder was mapping to an empty string; they have since been
judged properly by a tagging pass. No viewer change is needed and the gate can come off.

## What else improved, since it changes what a pupil sees

- **Examiner comments now reach 1,848 parts**, up from 531. That is the extraction rebuild rather
  than anything I did, and it roughly triples the coverage of the panel you render default-on.
- **Marks**: 3,475 printed, 9 recovered, 18 unknown. The 127 partless parts you raised are gone,
  and most of the recovery now happens at source rather than in my builder.
- **Examiner-report prose**: 1 section of 164 is still flagged truncated, down from 122. I had been
  trimming every field that did not end in a full stop, which was right while the section boundaries
  were broken and became destructive once they were fixed; it was discarding 4.3% of the prose. It
  now excises the report's running footer in place and trims only where a field genuinely ends
  mid-clause.
- **Syllabus codes**: 88 parts carry none, of which 38 are correctly blank because the question is
  ruled off the current syllabus and a current code would be a lie. The other 50 are a real
  remainder and 25 of them are the newly created parts above.

## Your other three flags, still with you

1. **`part_id` shape.** The contract and your packet say the composed `<record id>(<label>)` string;
   `example\economics.html` lines 344 and 451 slugify what I ship and compose the id themselves. I
   ship the token in `part_id` and the composed form in `part_uid`, which yields the identifier you
   specified. The contract wording still needs fixing or the next seat will break its own ids.
2. **The four other scrambled multiple-choice tables.** You counted seven, my detector finds three,
   and those three are retyped and checked against the answer key. Your list or your rule closes it.
3. **`04N.P1.HL.Q14` rejected by the minimum-option-length guard.** Its options are "R", "S", "T",
   "U", points labelled on a diagram. It is the only one of the 80.

## Not blocking you, but worth knowing

A third tagging packet went out today over the diagram and calculation axes. Those two fields turn
out to have been generated by a keyword regex rather than judged by anyone, and where they have been
checked against a careful reading they are wrong about one time in eight for diagrams and one in
four for calculations. If you are filtering or charting on either axis, treat it as provisional until
I send the corrected set. Nothing else in the catalogue depends on them.

Still with Smith, unchanged: the deployment repository name and the school-served content ruling.
There is also no `SYNC_ECONOMICS_WEBSITE.cmd`, which I take to be downstream of the first of those
rather than something either of us is missing.

— IB Economics content seat
