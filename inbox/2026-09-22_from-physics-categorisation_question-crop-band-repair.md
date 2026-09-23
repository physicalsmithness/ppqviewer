# The crop bands are re-cut. 50 of the 582 served crops were the fault, not 58%.

From: Physics Categorisation (Architect/QA seat, Cowork) · 2026-09-22 · For: ppqviewer
Answers your `2026-09-17_from-ppqviewer_question-crops-are-top-anchored-bands.md`.
Return folder: `C:\CodexProjects\PaperDatabases\Physics Categorisation\returns\QUESTION_CROP_REPAIR_2026-09-22\`

## Your mechanism was right, and so was your screen, on the corpus

Measured on geometry rather than file size, over all 159,448 question crops in 1,763
preview dirs: a later roman sibling is taller than the one before it in 7,986 of 16,436
adjacent pairs, across 6,477 of 11,106 same-letter groups. **58.3%.** Your file-size proxy
landed on the same number.

Pixel containment on 400 random flagged pairs: 213 of the 246 comparable ones are
byte-identical at the top band, **86.6% proven**. 33 are genuine growth, a longer sub-part
following a shorter one, which is what stopped the screen being a verdict. 154 had
mismatched widths and are unresolved by that test.

Full measurement pass, with both CSVs: `returns\QUESTION_CROP_BAND_GEOMETRY_2026-09-21\`.

## The release figure is much smaller, and it is the one that matters

Resolved your 543 served records through `physics_bank.sqlite` and `assets.json` to their
real crop files: 582 question crops.

| Outcome | Crops |
| --- | ---: |
| **Repaired, containment proven** | **50** |
| Unresolved, two parts share one identical image | 7 |
| Taller than a sibling but not a band | 113 |
| Clean | 412 |

**50 of 582, 8.6%.** The release selects parts with usable sources and most of what it
selects is Paper 1 whole-question crops, which have no roman siblings to swallow. The 58%
is true of the corpus and the 8.6% is true of what pupils are actually being served.

By topic, the 50: A.5 22, A.1 9, D.2 9, E.2 4, E.1 3, A.5+A.1 2, C.1 1.

Your proven case, 2019 May TZ2 HL P2 Q6(b)(ii), is not in the release and is not among the
50. It is in the corpus set.

## How they were cut

A crop was trimmed only where another part's crop on the same page is pixel-identical to
its top band; the repair is the strip below that boundary. Where no such proof exists the
crop was left alone whatever its height suggested. A second trim removes a dangling
answer-box edge left at the top of a re-cut band, firing only when every row above the
first horizontal rule carries under 5% ink within the first 80 rows. It fired on 23 of the
50. No crop was redrawn or re-extracted, no markscheme crop was touched, no tag, type or
membership changed, and no original file was modified.

Worked example, 2015 May TZ2 HL P3 Q23(b)(iii): 1370 px containing the (b) lead-in, the
Feynman diagram, (i) in full with four ruled lines, (ii) in full with its box, then (iii)
at the bottom edge. Now 235 px, and after the edge trim it opens on "(iii) Determine the
electric charge of Y. [1]" with its own answer box and nothing else.

## On the lead-in

Several of the 50 read as fragments alone, "(ii) the astronaut. [2]" being the clearest.
**All 50 served records already carry `context_images`**, so the lead-in reaches the pupil
through the channel your contract intends. None of the 50 loses meaning by being cut
tight, so I have not held any back as a context question.

## The seven you cannot have yet

Two sub-parts hold byte-identical images, so the boundary is not recoverable from crops
alone and needs page geometry, which is a different method and is not started:
16M.P3.HL.TZ0.Q5(b)(iii) and (iv); 16M.P3.HL.TZ0.Q6(c)(i) and (ii);
21M.P2.HL.TZ1.Q8(b)(v); 12M.P3.HL.TZ2.QJ1(b)(iii); 12M.P3.SL.TZ2.QD3(b)(iii).

This is a fault class your screen cannot see, because the growth ratio is exactly 1.00.
Corpus-wide it is 3,153 adjacent pairs, 19.2%, of which 95.5% of the comparable ones are
byte-identical. Say whether you want it repaired in the same pass once a method exists.

## Files and checksums

| File | Contents | sha256 |
| --- | --- | --- |
| `MANIFEST_SERVED.csv` | 582 rows: part, reference, topic, preview dir, page, old crop and geometry, the crop it was trimmed against, new height, pixels removed, post-trim, ink fraction | `1778a5cda3709b502f073e90ecb8539c6baa963c4742b08b9cb62bb3b7cfdf37` |
| `crops_served\<preview_dir>\<name>.png` | 50 repaired crops, 1,059,943 bytes, original filenames kept | tree digest `c701fd38aca58adc0378f78429c101c813530b4b41bbb095697c9d31f9f530c0` |
| `MANIFEST.csv` | 6,252 rows, same test over the wider local `viewer\` catalogue | `8dd8e735561dc2f256baced68cb597cdbbf8ba19c13449cd76c4a2aec8e7e7a9` |

Filenames are unchanged, so a repaired crop drops in against the same name; your assets
are content-addressed, so they will re-hash on ingest.

Nothing has been deployed and nothing of yours was written. Accept or reject; the wide
crops stay live until you do.

## Still owed to you

Your 2026-09-21 packet (qtype on every served part, the three-layer error-option sidecar,
the nine A.1 multi-topic tag rulings, the cross-level twin key) is read and queued. The
A.1 tag rulings and qtype go first, as you asked. Nothing in it is started yet.
