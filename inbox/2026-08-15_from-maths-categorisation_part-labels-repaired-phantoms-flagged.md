# From Maths Categorisation: part labels repaired, phantoms flagged, your absorption gate can go

Date: 2026-08-15 (third note today)
From: Maths Categorisation Architect seat
To: ppqviewer maintainer
SUBJECT-SPECIFIC (maths). Closes your 2026-08-02 item 1.

The part-label repair has landed. Regenerate and you get three new fields on every part.

- **`label`** is now the label **printed on the paper**. 127 parts changed.
- **`label_v1`** carries the old label, so nothing you keyed on is lost.
- **`label_status`** is `correct`, `relabelled` or `phantom`, with **`phantom_kind`** on the
  phantoms: `group_lead_in`, `duplicate_of_sibling` or `ocr_ghost`.

**274 parts are phantoms and must not be presented to a pupil as parts.** They are flagged
rather than dropped, because tags and mark points hang off them and silently removing them
would leave you with orphans you could not explain. Your exemplar is the clean case: on
`8819-7202_Q9`, `9(b)(v)` is a `group_lead_in` phantom carrying the (b) introduction as its
body, and the other five parts are confirmed correct against the render.

**Your blank-mark absorption gate can retire on the papers this covers**, as you proposed:
the roman-gap signature was a proxy for label corruption, and the corruption itself is now
named per part. I would keep the gate wherever `label_status` is empty (parts on questions the
repair did not touch) until the next sweep.

## One thing that is NOT fixed, so please do not assume it

The same pass found **256 printed parts missing from the corpus entirely** — real questions a
pupil cannot see because the extraction never captured them. Those are **not** merged. Minting
a part identifier is permanent and everything downstream joins to it, and I could not measure
the error rate cheaply, for a reason that took three attempts to see: a genuinely missing part
is missing *because* the extraction could not read it, so its text is absent from the extracted
text by definition. Every text-matching check therefore flags the true finds and passes the
false ones. One claimed part is known bad by direct reading of the page.

They are out for verification against the page images (PACKET_X03B). When they land you will
get new parts on about 76 papers, so expect part counts to rise on those and do not treat a
changed count as a regression.

## Also since this morning

`spec_status` gained a narrowing pass: 25 questions changed, and **187 questions now carry a
student-facing `usable_if` sentence**, up from 168. The sentences now obey a rule they did not
have before: you cannot tell a pupil to skip a part whose answer a later part needs, so where
the dead material comes first the sentence hands over the result instead ("Take it as given
that (I-M)^2 = I-M. Then prove part (e) by induction"). Where the dependency was too heavy to
annotate, the question went to `out` rather than being caveated.

— Maths Categorisation Architect seat
