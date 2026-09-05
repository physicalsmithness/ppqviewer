# To the pre-IB Physics seat: what the viewer needs

Date: 2026-08-27
From: ppqviewer architect-maintainer
SUBJECT-SPECIFIC (pre-IB Physics). Smith's ruling, 2026-08-17.

**Relay note for Smith, and the reason this sits in ppqviewer's outbox rather
than in a seat inbox: I could not find a pre-IB past-paper categorisation
seat.** `PaperDatabases` holds seats for IB Physics (`Physics Categorisation`)
and GCSE (`Trilogy Categorisation`, plus corpora under `Other boards GCSE
Physics` and `4ss0 Edexcel Single Science`), but nothing for pre-IB, and the
registry has only recorded pre-IB Physics as an intended future consumer in an
external project. So the first question below is for you rather than for a
seat: point me at it, or tell me it does not exist yet, and I will deliver
this where it belongs.

There is also a real question about what "pre-IB past papers" ARE. If the
corpus is the school's own internal exams, this is not a past-paper
categorisation job in the same sense as the other two, and both the rights
position and the extraction pipeline are different. If it is IGCSE, then the
corpus already exists under `Other boards GCSE Physics\Edexcel IGCSE Physics`
and the seat is really a sibling of Trilogy. Worth settling before anyone
starts, because it changes who does the work.

---

## The decision

pre-IB past-paper questions get their **own published site**, one of three
physics deployments off one shared engine (IB Physics `ibphysicsppqs`,
Trilogy, pre-IB). Separate sites because they are separate audiences.

## Read this first

`C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\CATALOGUE_CONTRACT.md`

The single public spec of what a subject ships. **Its first section is the one
that matters: you may ask for anything.** If a shape does not fit this course,
the shape is wrong. Flag rather than bend; ask before building rather than
after.

## Where it goes

`<your tree>\viewer\preib_catalogue.js`, exposing `window.PREIB_META` and
`window.PREIB_QUESTIONS`, with a re-runnable builder beside it. Nothing enters
the ppqviewer repository; you send packets, I read your tree.

## The four shapes that must match exactly

1. **`parts[]` as the markable unit**, with `label`, `part_id`, `text`,
   `lead_in`, `marks`, `marks_status`, `mark_group`, and per-part `crops[]`,
   `ms_crops[]`, `pages[]`. **`part_id` must be shaped `<record id>(<label>)`**;
   the engine finds siblings by matching `record id + "("`, and any other
   separator makes the part navigator silently show nothing. Attempts are keyed
   on it, so it can never be renumbered once published.
2. **Asset filenames carrying kind and page number** (`question_pNNN`,
   `mark_pNNN`), with the folder layout DECLARED in `meta.asset_layout`
   (`"flat"` or `"crops_and_pages"`). Guessing wrong 404s every image.
3. **Every extraction token declared** in `meta.text_tokens`, not only
   `[figure]`.
4. **Human names for every code at every tier**, in `meta.code_names`. A pupil
   never sees a bare code.

## Two faults maths shipped, so you can skip them

Ship `ms_pages_this_question`, a page span **and a confidence field**, and
never point at a markscheme's opening pages: they are cover, copyright and
examiner instructions. Maths shipped confident spans into the front matter on
379 records and the viewer rendered the abbreviations page as the answer.
If you cannot locate a question's pages, leave the field empty rather than
guessing; the viewer then offers the whole document and says plainly that the
question's own pages could not be found.

And if you ship both a historical tagging and a current-spec judgement, label
which is which: the viewer prefers the judged one for everything a pupil sees.

## What is likely different here

This is the smallest of the three corpora and probably the least standardised,
which changes the emphasis:

- **Say what a "paper" is.** If these are internal school exams, ship whatever
  identifies them (year, set, paper) and I will build the filters around what
  you actually have rather than assuming an exam board's shape.
- **Syllabus mapping matters more than usual**, because pre-IB exists to lead
  into IB. If a question maps onto the IB spine, ship that code as well as any
  local topic: it means the same pupil's coverage can eventually join up across
  the pre-IB and IB sites, which is the whole point of them sharing an engine.
- **Marks and markschemes may be thinner or handwritten.** Say so rather than
  faking a page reference. A question with a crop and no scheme is a supported
  state; a wrong scheme is not.
- **Rights are a different question.** If this is the school's own material,
  the d014 IB-content reasoning does not apply and the publication question is
  simpler; if it is IGCSE, it is a third rights-holder and needs its own
  ruling from Smith.

— ppqviewer architect
