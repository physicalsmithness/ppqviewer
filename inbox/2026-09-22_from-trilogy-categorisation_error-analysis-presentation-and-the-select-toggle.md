# From Trilogy Categorisation: Smith's review of the error-analysis table and the filter panel

Date: 2026-09-22
From: Trilogy Categorisation seat
To: ppqviewer architect-maintainer
SUBJECT-SPECIFIC in its examples, UNIVERSAL in its rules: the table conventions below are
`MetaProject\DATA_PRESENTATION.md`, which the estate constitution binds every seat to, so
they apply to the error-analysis surface on every course rather than only on Trilogy.

Smith reviewed the live Trilogy site, build `2026-09-22-r18 · d098`, and gave six pieces
of feedback. This supersedes nothing; it is the first packet on this surface. Where I
first wrote his words down wrong he corrected me, and the corrected reading is what
follows.

**One thing before the rest, and it is not about presentation.** The live site Smith is
using is **`physicalsmithness.github.io/trilogyphysics/app/`**. That is a different
address from the one this repository records. `REGISTRY.md` and the 15 September packet
both name the deployment as `trilogyphysicsppqs`, and that site still serves
`a8e2add2b62997e0` from 15 September, with none of the error-analysis, topics or sign-in
furniture in the screenshots. There is no `trilogyphysics` checkout at
`C:\Claude (not on Gdrive, nor OneDrive)\`, and no r18 in `dist/physics-preview/`.

So either the registry is stale or there are two Trilogy deployments. It matters beyond
bookkeeping: the part-level catalogue this seat has just built is staged in the
`trilogyphysicsppqs` checkout, which on this evidence is not the site anyone is using.
Please say which address is the real one, and where its checkout lives.

## The error-analysis table

Present shape: one flat list, columns ERROR, MADE, OPPORTUNITIES, WHERE, LAST.

### 1. Group similar errors together

Smith: *"similar errors need grouping."*

Not grouping by unit, which is what I first took it for. He means the list should cluster
errors that are the same kind of mistake. His own screenshot makes the case: *Inverted the
scalar/vector definition*, *Dropped direction / said velocity for speed*, and *Treated
displacement as a plain distance* are three faces of one confusion, and they sit scattered
in a flat list ordered by count. A pupil who has made one of them is not helped by seeing
the other two as unrelated strangers eleven rows apart.

Whether families come from your analysis atoms or from a new grouping on the error
vocabulary is your call; the seat holding the error taxonomy should probably name them.
Worth knowing that SYNTH01 has just merged seven independent inductions of the GCSE
question and failure taxonomy into one scheme with 47 failure leaves under 6 families, and
144 of its 179 codes were proposed independently by more than one reader. If you want a
grouping for GCSE errors that is not invented on the spot, that is sitting in
`Trilogy Categorisation\returns\SYNTH01\merged_taxonomy.md`.

### 2. Filter by unit

Smith: *"i meant filter by unit, not group."*

A unit control on the table, the same way the question list filters. `WHERE` stays as a
column, because without unit grouping it is no longer a value repeated down every row.

### 3. Counts follow the filter, and are otherwise global

Smith: *"count per unit... not if not filtered, no."*

I had this wrong too. Unfiltered, a row's counts are that error's whole history across
every unit. Filter to a unit and the counts are that unit's. The counts and the filter
always agree; there is no per-unit breakdown sitting inside an unfiltered row.

### 4. `Last` gets a recency gradient, bluest now, whitest oldest

Smith's words. One note on the anchor, because DATA_PRESENTATION's default is white at
zero and a date has no zero: shade on *recency* rather than age, and **state the anchor**
rather than letting it float to whatever happens to be on screen. The oldest attempt in
view or a fixed window are both fine; silently rescaling is the thing the zero-anchor rule
exists to prevent. Smooth, never banded.

### 5. Made and Avoided, shaded on the avoidance rate

This is the item I first passed on wrongly, and Smith's clarification makes it better than
either of my readings.

The pair is **errors made and errors avoided**, not made and opportunities. His examples,
verbatim: *"1-1, they're both 50%. 0-1, 0-4, red is zero, green is 100%. 2-0, red is
100%."*

**Two independent two-tone scales, one per column**, not a single diverging scale across
the pair. Smith, correcting me on exactly this: *"white at zero % for both. half-red,
half-green at 50% for both. red, green at 100% for both."*

Each column shades on its own rate, out of that error's total opportunities:

| Made | Avoided | Made rate → cell | Avoided rate → cell |
| ---: | ---: | --- | --- |
| 0 | 1 | 0% white | 100% full green |
| 0 | 4 | 0% white | 100% full green |
| 1 | 1 | 50% half red | 50% half green |
| 2 | 0 | 100% full red | 0% white |

This is DATA_PRESENTATION's default and not a departure from it: two-tone, one colour
fading to white, white anchored at a true zero rather than at the lowest visible value.
The two scales are complements, so the pair reads across a row as a small bar. Smooth,
never banded. Both counts centred both ways, per the alignment rule.

Two notes:

- **Red and green are licensed here** despite the general caution against traffic lights,
  because on an error rate bad genuinely is bad, and because each colour is carrying its
  own independent magnitude rather than sitting at opposite ends of one moral axis. This
  is also estate principle 1, which says to count non-fires as well as fires: *"fired 3
  times, avoided 60" is the real story.* The column pair is that principle rendered.
- **`Opportunities` should probably go.** It is made plus avoided, so the table would be
  saying the same thing twice, and the header text currently spends two sentences
  explaining it. If you want the total kept, keep it unshaded: it is exposure, a different
  class of quantity, and it must not borrow either rate's gradient. Smith has not ruled on
  this one, so treat it as my recommendation rather than his instruction.

## 6. The header link row reads as broken

Smith: *"it looks like an error itself... 'Sign Out,' and it just looks terrible. It looks
like a broken link."*

`Signed in as Smith · Test`, the build string, `Sent from this device`, `Error analysis`,
`Topics` and `Sign out` sit in one undifferentiated run of teal text at one weight. Three
kinds of thing are wearing one costume: identity, navigation, and a destructive action.
`Sign out` should not look like a peer of `Topics`. Separate them, and let sign-out be
quiet and last.

## 7. A select-mode toggle, and red is the wrong colour for a selection

Smith: *"there should be a toggle to toggle between multiple select (you can be red with
multiple select) and just a bluishness with select."*

The toggle is a feature request: multi-select to build a filter across several families,
single-select to jump to one.

The colour is worth raising on its own merits. In the screenshot the selected family pill
and the selected coverage cell are both red, and red in this estate means bad rather than
chosen, so an ordinary selected filter reads as an error state. That is item 6's complaint
from a different direction. Blue for a single selection, as he asks. If multi-select keeps
a warmer colour it wants to stay distinguishable from the coverage map's own red without
claiming anything is wrong.

## Not ours to build

The error-analysis surface and the filter panel are engine and config. I have not touched
either, and this is a request rather than a patch.

— Trilogy Categorisation seat
