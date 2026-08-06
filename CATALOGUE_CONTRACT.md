# The catalogue contract: what a subject ships to the viewer

For every content seat that feeds ppqviewer: ESAT, IB Maths, Economics,
Chemistry, Physics, and whoever comes next. Adopted 2026-08-05.

Until now each seat negotiated its field list with the architect privately, by
packet. That worked for two seats and would not work for six: the same
conversation repeated, slightly differently each time, producing near-identical
vocabularies that the viewer then has to reconcile. This file is that
conversation, held once, in public.

Read it before you build a catalogue. Then build in your own tree, and announce
delivery by packet. You never commit to this repository; that boundary is in
`OPERATING_MODEL.md`.

---

## This is a contract, not a cage: ask for what you need

The most important section, so it comes first.

**You may ask for anything.** New fields, new question shapes, new pupil
interactions, a capability the engine does not have yet. The estate's standing
principle is that architecture and authoring both think and neither prescribes
(estate constitution, principle 5: the flow runs both ways). You are the seat
in contact with the actual questions. If the shapes below do not fit your
subject, the shapes are wrong, not your subject.

Three rules make asking cheap:

1. **Flag, never bend.** If your data will not sit in a shape below, say so in
   a packet and ship it in the shape it wants. Do not squeeze it into a field
   that means something else. Economics did this well on 2026-08-03: it
   reported that economics has no discrete mark points anywhere, only
   level bands, instead of inventing empty `markpoints[]` arrays. That flag
   became an accepted extension (below) within a day.
2. **Ask before you build, not after.** A question in a packet costs the
   architect ten minutes. A delivered 11 MB catalogue in the wrong shape costs
   you a rebuild.
3. **Name what the pupil should see.** The most useful requests describe the
   pupil's experience ("a pupil on a 2015 question should be told the
   markbands were the old ones"), not the field. The architect will find the
   field.

Requests arrive as `inbox\YYYY-MM-DD_from-<seat>_<topic>.md` in this
repository, or through Smith. Answers come back to your own tree's inbox.

---

## What the viewer actually needs

### Tier 1: the four shapes that must match exactly

Field *names* are mapped in each consumer's config, so a rename costs one line
rather than a fork. These four *shapes* are different: the engine and the
shared tooling key on their structure, and getting them wrong means rework.

**1. Parts, because the markable unit is the record.** The engine's part
navigator came from the chemistry driller and now serves every consumer
(d016, part-by-part from chemistry's model). A question that a pupil marks in
pieces ships as `parts[]`, each part carrying at minimum:

| Field | Meaning |
| --- | --- |
| `label` | the printed label, e.g. `(b)(ii)` |
| `part_id` | stable identifier, and it must be shaped `<record id>(<label>)`, e.g. `22M.P2.HL.Q1(a_ii)`. The engine's part navigator finds a question's siblings by matching `record id + "("`, so any other separator makes the navigator silently render nothing. Never renumbered once published: attempts are keyed on it |
| `text` | the printed part text, verbatim |
| `lead_in` | the group introduction, repeated on every sibling in the group; the viewer deduplicates and renders it once above the group |
| `marks` | marks for this part |
| `marks_status` | how confident that number is |
| `mark_group` | parts marked together share a group and become one markable unit |
| `crops[]`, `ms_crops[]`, `pages[]` | assets for this part, bare filenames |

If your records form part blocks, you must ship them; the suite fails a
consumer that declines a capability the engine already carries.

**2. Asset filenames carry their kind and their page number, and the layout is
declared not guessed.** Pages are named `question_pNNN` and `mark_pNNN`. This
is not cosmetic: a mixed `pages` array once caused the viewer to serve
markscheme pages to pupils labelled "original exam pages" (fixed in d018, show
the stem as printed). The prefix is what stops that.

Assets stay in your corpus as bare filenames and the record carries its
`preview` folder, but the folder layout underneath differs by seat: maths
writes everything flat as `<preview>/<filename>`, economics separates
`<preview>/crops/` from `<preview>/pages/`. Both are fine; guessing is not.
Declare yours in `meta.asset_layout` as either `"flat"` or
`"crops_and_pages"`. The Economics build lost a pass to this in August 2026:
the dispatch assumed flat and every image would have 404'd had the builder not
checked the corpus itself. The site assembler copies every referenced asset
into the deployment, so the published site is self-contained.

**3. Every extraction artefact is a declared typed token, not prose.** Where
extraction dropped a diagram, put the literal token `[figure]` (or `[graph]`)
in the text and set `has_figure_omitted` on that part. Free prose like
"[diagram omitted]" reaches pupils as noise; the suite asserts that no such
token can.

This extends past figures. Declare **every** token and boilerplate family your
extraction leaves in pupil-facing text, in `meta.text_tokens`: answer-space
placeholders, mark allocations like `[4]` or `[4 marks]`, copyright-redaction
notices, answer-box runs. Economics shipped four such families in August 2026
with only the figure token declared; the builder found the rest by reading
6,000 occurrences out of the corpus. An undeclared token is one that reaches a
pupil on the day nobody is looking.

**4. Human names for every code, at every level of the tree.** Ship a
code-to-name map as `meta.code_names`. Pupils see the name first and the code
second, everywhere: filters, progress axes, weak-area chips. Without the map
the viewer either shows a pupil "SL3.6" (which means nothing to them) or the
architect hand-maintains a lookup that rots.

Name the intermediate levels too, not only the leaves. Economics shipped 518
leaf codes and no unit or topic names, so the viewer could offer units (which
the builder supplied by hand) and leaves, but the 32 topic headings between
them had to be dropped: a bare "3.4" is exactly what this rule forbids, and
there was nothing else to show. If your syllabus has three tiers, name three
tiers.

### Tier 2: what makes the difference between usable and good

Not structurally required, but each of these earned its place by fixing a real
complaint from a real pupil or from Smith:

- **`examiner_comment`** per question and per part, plus
  `examiner_source_type` and `examiner_match_note` for provenance, plus
  `meta.paper_reports` keyed by preview with general comments, difficult areas
  and well-prepared areas. Renders default-on.
- **Syllabus status per question** (d020, default to the practisable subset):
  `spec_status` of current / close / mixed / out, with `usable_if` prose on the
  near-misses. The viewer defaults to what a pupil can still be examined on,
  and a pupil should never need to know a retired option existed in order to
  avoid it. The `usable_if` sentence is the field that matters most here: "good
  practice for three equations in three unknowns if you ignore the matrix
  apparatus" is worth more than the flag.
- **Marking-era notes**: `marking_differs` and `marking_note` where a question
  was marked under conventions since abolished. Without it the markscheme looks
  broken and the pupil stops trusting the reveal.
- **Mark-scheme page narrowing**: `ms_pages_this_question` and
  `ms_crop_adequacy`, so a thin crop opens its own pages and says why, instead
  of showing a whole paper.
- **Classification you can filter and chart on**: a hierarchy (subject, topic,
  family or your subject's equivalent), plus whatever axes your subject
  genuinely has. Every axis you ship becomes a filter and a performance
  breakdown for free.

### Tier 3: subject-specific, ship what is true

Command terms, assessment objectives, calculator status, question type, skill
demand, themes, techniques. Ship what your subject has; leave out what it does
not. The viewer treats these as configurable axes, not as a fixed vocabulary.

---

## Reference implementation

`C:\CodexProjects\PaperDatabases\Maths Categorisation\viewer\maths_catalogue.js`
(`window.MATHS_META` + `window.MATHS_PPQS`). Its 45 record fields and 20 part
fields are the fullest worked example; copy its shapes, not necessarily its
vocabulary. Economics mirrored it in a single build with no rework, which is
the outcome this document exists to repeat.

Expose your catalogue as two globals in your own `viewer\` folder:
`window.<SUBJ>_META` and `window.<SUBJ>_QUESTIONS` (or `_PPQS`).

## Accepted extensions

Shapes added because a seat flagged rather than bent. They are now available to
every subject:

- **Level bands instead of mark points** (Economics, 2026-08-03). Where a part
  is scored against a 0..N level descriptor rather than discrete credited
  steps, ship `self_mark: "level_band"` and the band descriptors in
  `markscheme_text`. The pupil self-scores a level.
- **Criteria checklists for extended writing** (Economics). Ordered
  `parts[].criteria` of `{key, prompt}`, with the frozen set in
  `meta.essay_criteria`. This is the essay analogue of mark points and feeds
  the same "tick what you got" surface.
- **`lead_in` on parts** (Maths, 2026-08-04). Solved a fault where a group
  introduction arrived attached to the last part instead of heading the group.

## Delivering

Announce every delivery and regeneration as a packet naming files, counts and
checksums. Data never crosses into this repository; the viewer's sync reads it
from your tree. When a repaired or changed record affects something the viewer
suppresses or gates, name the affected IDs in the packet so both sides move in
step.

Two things need Smith rather than the architect, at publish time and not
before: the deployment repository name, and the publication ruling for your
subject's content (the d014 question, where IB Maths was approved for
school-served, unpublicised use with traffic watched).

— ppqviewer architect
