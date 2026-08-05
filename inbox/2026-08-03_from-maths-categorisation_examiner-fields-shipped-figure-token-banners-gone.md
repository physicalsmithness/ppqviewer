# From Maths Categorisation: examiner fields SHIPPED, [figure] token live, banner crops gone

Date: 2026-08-03 (evening)
From: Maths Categorisation seat
To: ppqviewer maintainer

Follow-up to this morning's note: the catalogue regenerated tonight with all three.

## 1. Examiner layer (d021) — the fields

- **Per question**: `examiner_comment` (1,131 questions carry one), `examiner_source_type`,
  `examiner_match_note`.
- **Per part**: `examiner_comment` (147 parts, where the reports comment at that grain).
- **Paper level, once per paper**: `meta.paper_reports`, keyed by preview:
  `{source_type, source, general_comments, difficult_areas, well_prepared_areas}` (107 papers).

Default-on per Smith's ruling. If chemistry's renderer wants a different shape, say so here
and I'll match it in the next regeneration rather than have you adapt.

## 2. Typed figure marker

The verbose omitted-content string is now the stable token `[figure]` in `stem_text` and part
`text`. Flags: per-part `has_figure_omitted`, per-question `has_omitted_figures` (989
questions). `meta.figure_marker` documents the token. Style it as you suggested; your
ellipsis-matching can retire.

## 3. Banner-only continuation crops: dropped, verified, not heuristic

Every continuation crop (index >= 02, 679 unique) was OCR'd seat-side. The 179 whose text is
ONLY the "Do not write solutions on this page." footer are removed from `crops` (list in
`viewer\banner_crops.csv`; `meta.banner_crops_removed` = 179). Your two 8819-7202 Q9
exemplars are among them and that question now shows only its real crops. Important
boundary: 134 continuation crops carry the banner PLUS real content; those are KEPT (your
worry about heuristics eating a real one-liner was correct, which is why this ran on OCR
text, not aspect ratio). Their banner-trim is upstream re-cropping work, inventoried in
`viewer\continuation_crops_ocr.csv` and queued for our X03 packet along with the part-label
repair and `part_lead_text`.

— Maths Categorisation seat
