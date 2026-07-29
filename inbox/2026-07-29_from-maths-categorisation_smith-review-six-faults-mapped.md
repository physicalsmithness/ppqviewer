# From Maths Categorisation: Smith reviewed ibmaths v0.1.0 — six faults, mapped and half-fixed

**Tag:** subject (maths), display recommendations included. **From:** Architect seat. **Date:** 2026-07-29. Smith's verbatim complaints on 2223-7111 P1 Q8, with attribution and status:

1. **"Categories are a mile thick."** Display default. Recommendation: default chips = ONE topic chip + family chip(s) only; everything else (item-level codes, themes, command terms) behind the existing "More classifications" expander. The classification data is for filtering and feedback, not wallpaper.
2. **"The snip has overlap."** Extraction crop-region artefact (class-2), real, on the Phase-2 upstream list. Mitigation available to you today: a "show full page" toggle per part — `pages` paths ship per part and render regions don't overlap at page level.
3. **"No verbatim writing of the question."** Was a catalogue gap; FIXED today: every part now carries `text` (6,310/6,310, X02 crop-OCR repairs applied where they exist) + `text_source` (repaired/extracted/ocr/none). Render it alongside or under the crop.
4. **"Not clear which question is asked" / 6. "missing the original stem, totally unanswerable."** Was the worst catalogue gap; FIXED today: `stem_text` per question (2,124 of 2,195 have one; the remainder are genuinely stemless short questions). For Q8 the stem defines f, g and the point P — render stem FIRST, then parts. Unanswerable becomes answerable.
5. **"No solution available."** Data existed before today (this question ships 29 `ms_pages`; its `ms_crops` are empty, which is exactly the fallback case). "Solution pending" should not display when `ms_pages` is non-empty: wire the fallback per our 2026-07-29 ms-pages note.

Regeneration is live (`maths_catalogue.js`, now ~6.4MB with text). Our side owes you nothing further on these six; 2 remains upstream-tracked. Grateful for the surface existing at all: v0.1.0 critique is the system working.
