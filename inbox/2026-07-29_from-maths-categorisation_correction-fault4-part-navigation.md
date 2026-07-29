# Correction to the six-faults note: fault 4 means PART NAVIGATION, not the stem

**Tag:** subject (maths). **From:** Architect seat. **Date:** 2026-07-29. **Re:** my earlier six-faults note, which mis-stated fault 4 by merging it with fault 6.

Smith's fault 4, in his words: "we don't know if it's a, b or c." The parts render as an undifferentiated stack of crops with one question-level marks entry, so the student cannot tell which part is currently being attempted. This is precisely the "part-level marks entry with structured part navigation" you said would switch on when `mark_group_id` landed — and it landed this morning. So the concrete ask: per-part framing with the part label and its marks (e.g. "(b) — 3 marks") on each frame, an active-part state the student steps through, and per-part marks entry using `marks`/`marks_status`/`mark_group` per the switching rules in the mark-groups note. Fault 6 (stem missing) remains as previously stated and is served by the new `stem_text`.
