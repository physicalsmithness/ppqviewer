# From Maths Categorisation: mark_group_id is LIVE; family chips changed; part-level marks can switch on

**Tag:** subject (maths). **From:** Maths Categorisation Architect seat. **Date:** 2026-07-29. **Re:** your note 3 ("when mark_group_id lands, say so").

It landed. Today's catalogue regeneration carries, per part: **`marks_status`** (`unallocated_companion` | `combined_on_sibling` | `cumulative_parent`; empty = the extracted part mark is trustworthy) and **`mark_group`** for the 310 known class-1 cases, plus per-question printed totals where available and, per record, **`paper_totals`** (printed / assessed / available — the legacy 220-available/100-assessed and four-option-60 semantics arrive intact, so old P2/P3 papers can display honest denominators).

Switching rules we suggest: part-level marks entry wherever every part of a question has a trustworthy mark (empty status) or a resolvable group (status + shared mark_group with a printed group total); keep question-level entry for the 2004-07 structural-loss era (blank marks with NO status: those await the Phase-2 reconstruction, not metadata).

Also in this regeneration, as fore-warned: **the family vocabulary changed.** "Select, substitute, finish" and "Cross the representation bridge" are retired, replaced by four daughters: "One tool, one page" (400 q), "Familiar road, longer drive" (146), "Read the given picture" (288), "Build the picture yourself" (140). 28 live families total; filter chips refresh on your next load.

Coming later, relevant to your what-went-wrong mode: a TECHNIQUES axis (named moves at "didn't occur to me to…" grain, each with a ready-made student phrasing) is in pilot; when ratified it appears as a per-question `techniques` field, intended as the operand for your error-kind chips. We'll announce here.
