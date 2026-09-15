<!-- QoderWork 2026-09-14 -->
# A.1 over-claim audit — the reviewed 756-part "included" pool

Date: 2026-09-14 · Author: QoderWork · Status: **findings only — no data changed**

This audit answers the complaint that a relativity question (2014 Nov P3 HL Q16,
`14N.P3.HL.TZ0.Q16(a)`) was served under "A1 Kinematics", and the wider worry that
"almost everything is going to be A1 if that's the criterion." It reviews the
`status:"included"` pool in `dist/physics-inputs/ib-a1-analysis.json` against the
pinned catalogue (`ibphysics_catalogue.js`, sha256 `050e5203…`) and against what is
actually served in release `e56bf638d0332e3e`.

A machine-readable, **reversible** review queue accompanies this report at
`reports/ib-a1-overclaim-candidates.json`. It *flags* candidates only. It does **not**
edit `ib-a1-analysis.json`, any clearance, or the catalogue, and it triggers no rebuild.

## Headline

The "everything is A1" fear is **not** borne out by the data. A.1 is the genuine
catalogue-primary topic for **606 of the 630** included parts that can be joined to a
catalogue question (**96%**). The complaint class is real but small and is already
handled on the viewer side.

## What pupils actually see (served set = 149 A.1 parts)

- 141 served parts carry A.1 as `topic_codes[0]` (A.1 leads).
- 8 served parts carry A.1 only as a **co-strand** behind A.5 — all of them relativity:
  `09M.P3.SL.TZ1.QD2(b)`, `12M.P3.SL.TZ2.QD1(b_ii)`, `12M.P3.HL.TZ2.QH1(b_ii)`,
  `14N.P3.HL.TZ0.Q16(a)`, `14N.P3.SL.TZ0.Q11(a)`, `16M.P3.SL.TZ0.Q5(c)`,
  `24N.P3.HL.TZ0.Q5(b)`, `24N.P3.SL.TZ0.Q5(b)`.

All eight already carry `topic_codes:["A.5","A.1"]` (A.5 primary). The co-strand panel
shipped in item 1 (live in build `e56bf638d0332e3e`, commit `4e6ee94`) renders these as
"Main: A5 Galilean and special relativity … / Also: A1 Kinematics …". The exact
screenshot question `14N.P3.HL.TZ0.Q16(a)` is confirmed in this set, so the viewer-side
demotion Smith asked for is **delivered** for every served relativity part.

## Joining the pool to the catalogue

Each included record's `source_part_id` is an opaque `ibchem_part_…` hash that does not
appear in the catalogue; the usable key is `parent_id` → catalogue `id`.

- 756 included parts.
- 630 join to a catalogue question (0 join failures where a `parent_id` exists).
- 126 have **no** `parent_id` and a null `native_part_id`. These are unmatchable join
  artifacts with **zero pupil exposure** — a part with no native id can never be served.
  They should not be read as over-claim.

## Hard divergence — analysis asserts A.1, catalogue question does not list A.1

**22 parts** (9 served, 13 held). All are authored `confidence:"sure"`. By the
catalogue's own primary class:

| Catalogue primary | Count | Note |
|---|---|---|
| DATA (data analysis) | 11 | P3 data-analysis parts with a motion context |
| A.5 (relativity) | 10 | the complaint class |
| E.2 (quantum) | 1 | `08N.P2.HL.TZ0.QB3(a_iii)`, also corpus-defect |

The 9 served divergences are the interesting exposure:

- A.5-primary (5) — already demoted by the co-strand panel: `10N.P3.HL.TZ0.QH1(b_i)`,
  `12M.P3.SL.TZ2.QD1(b_ii)`, `14N.P3.HL.TZ0.Q16(a)`, `14N.P3.SL.TZ0.Q11(a)`,
  `12M.P3.HL.TZ2.QH1(b_ii)`.
- DATA-primary (4) — `24N.P3.SL.TZ0.Q2(c)`, `24N.P3.HL.TZ0.Q2(a)`, `24N.P3.HL.TZ0.Q2(c)`,
  `19M.P3.HL.TZ1.Q1(b_i)`. These are Paper 3 data-analysis parts the A.1 review pulled in
  as kinematics practice. Whether A.1 belongs here is a genuine judgment call: a
  data-analysis question about motion can legitimately be kinematics practice, but the
  catalogue files it under DATA.

## Soft quality flags (not "wrong topic" — source-quality / uncertainty)

Deduplicated across the included pool:

- 18 authored `confidence:"unsure"`
- 64 with `pending_shape_branches`
- 115 with `source_corpus_defect`
- **181** parts carrying at least one soft flag; **48** of those are served.

These flags mean the underlying source record has a quality note, a shape branch still
pending, or the analyst was unsure — **not** that A.1 is the wrong topic. Treating them
as over-claim would be over-reading the signal.

## Recommendation (for Smith's decision — nothing applied yet)

1. **Viewer-side demotion: done.** The 8 served A.5/A.1 relativity parts, including the
   screenshot question, now lead with A.5 and name A.1 as "Also" via the live co-strand
   panel. No further action needed for the complaint as filed.
2. **Do not mass-reclassify.** A.1 is genuinely primary for 96% of the joinable pool, and
   reclassification would *reduce* served A.1 counts — against the standing "boost A.1"
   goal. This is why the queue is flag-only.
3. **Only the 4 served DATA-primary divergences warrant a real look.** These are the sole
   pupil-visible parts where A.1 is asserted over a non-relativity catalogue topic. If
   Smith agrees they belong to DATA rather than A.1 practice, the reversible step is to
   set them to a `course_extra`/excluded disposition in the analysis with a witness, then
   regenerate the A1/C1 clearance and republish — a change of at most 4 served parts.
4. **Leave the 126 no-parent and 181 soft-flag records alone** unless a targeted source
   cleanup is separately scheduled; they carry no A.1-vs-other-topic over-claim.

Suggested next action if Smith wants to proceed: review the 4 DATA-primary served parts
side-by-side (question crop + catalogue DATA tag + A.1 analysis reason) before any edit.
