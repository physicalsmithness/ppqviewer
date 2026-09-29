# Project history review — chemistry migration context

Reviewed 2026-09-27. This is a reading record, not a fresh publication approval or a claim that historical features are live. Current implementation and release state must be checked separately.

## Scope actually read

- Every Markdown/text file in `inbox/`, `outbox/` and `dispatch/`: **51 inbox files, 9 outbox files, 1 dispatch file**, 243,345 bytes in total at inventory time. These folders contained no additional nested Markdown/text files. Full packet bodies were read in bounded chunks; any truncated chunk was reread.
- `chat transcripts/architect 5.md`: the opening project direction and the current reply in turn 1, then the complete user/reply content of turns 2–21. Turn 1 embeds roughly 85 KB of older pasted conversation; that embedded archive was sampled, not exhaustively reread. Transcript-saving instructions and condensed tool logs were excluded.
- `chat transcripts/ppqviewer architect 7.md`: all substantive direct user messages and the opening reply; complete relevant exchanges in turns 12–13 and 21–24. Repetitive release-failure replies, transcript-saving instructions and tool logs were not exhaustively reread. This covered the sidebar direction, next-feature queue, twin evidence discussion and release-input failure/repair.
- Cross-checked `DECISIONS.md` sections d028–d034, especially d033's later addenda, because the transcripts contain an outdated account of what blocks that work. `OPERATING_MODEL.md` and `CATALOGUE_CONTRACT.md` were also read earlier in this task.
- `CHANGELOG.md`: read **lines 190–1742 in full**, including rereading the one truncated section. Root reviewed the preceding section. This covers the earliest engine/chemistry port through later shared features; a historical “implemented” entry is still not proof of today's consumer deployment.
- `PPQ_Viewer_(chat1,qoder)2026-07-23_15-15.md`: indexed all **54 user messages and read their complete bodies**, then sampled the ends of assistant replies to user messages 3, 10, 13, 20, 25, 28, 39, 40, 47, 53 and 54 (several have no reply). Numbering here is the ordinal `### **You**` block, not a heading already present in the export.
- `PPQ_Viewer_2_(chat, qoder)2026-07-24_12-25.md`: indexed all **13 user messages and read their complete bodies**, plus bounded reply endings for messages 2, 3, 7, 10 and 13. Message 3 explicitly contains an analyst's pasted recommendations, separately identified below. These two exports total **4,096,408 bytes**; their repeated tool dumps, model thinking and full assistant histories were **not** exhaustively read.

The source index for this review is the three complete packet folders and the six named documents/transcripts above, plus the two earlier contract reads. The remaining transcript/core-document sweep, source-code audit and current release verification belong to the parallel reviews; this note does not claim to cover them.

## Decisions that matter to chemistry

| Direction and authority | Consequence |
| --- | --- |
| **Smith, Architect 5 turn 1:** keep shared development together; chemistry's viewer beside its driller modules is an important deployment pattern; architect coordinates bounded builders. | Fix common behaviour in the shared viewer. The chemistry content seat supplies data; it should not repair a frozen viewer fork. Historical assignments to a named Claude/Codex seat explain the boundary, not a permanent ban on Smith reassigning the maintainer role. |
| **Smith, Architect 5 turn 2:** the catalogue contract must explicitly let subjects ask for things. | A shape mismatch is reported and resolved, not forced into an approximate field. A thin wrapper is a means, not a reason to discard useful chemistry content. |
| **Chemistry Architecture packet, 27 September, quoting Smith:** originals are missing, stem/part text needs line breaks, and chemistry should catch up with shared features. | These are the immediate migration outcomes, rather than more patching of `chemistrydriller/ppq.js`. The packet's 608/1,326 image diagnosis describes the old donor data, not the later PACKET_005 delivery. |
| **Chemistry Architecture packet, 27 September, reporting chemistry d016:** classes are exactly **SL, HL, Test**. | The old comparison page's Y10/Y11 placeholders are superseded. Chemistry's class scope must remain independent of physics/maths/economics. |
| **Smith, Architect 5 turns 5–6; later identity packets:** sign-in/reporting matters, and existing progress must survive sign-in. | Preserve published question IDs and browser stores. Identity adoption must not replay old attempts, attribute another browser user's history to a new person, or silently imply authenticated/cross-device accounts. New reporting and local progress are separate facts. |
| **Smith's review quoted in July/August maths packets:** show the actual part, its marks, original stem, group lead-in and usable scheme; use human-readable topic labels. Examiner commentary is required/default-on, with chemistry explicitly cited as the good precedent. | Chemistry should regain its own established strengths. Preserve source line breaks and group structure; do not replace missing context with a guessed transcription or treat a whole-paper cover as the answer. |
| **Smith's current-syllabus direction, later clarified by content seats:** default to useful current practice; show `usable_if`; distinguish old marking conventions. | Reviewed current eligibility must win where supplied. Historical paper level/availability is not a judgement about today's SL/HL syllabus. A blank or unjudged field is not silently “current”. |
| **Smith, d029:** a known SL/HL twin appears once, preferably in the pupil's own printing; the alternative printing is labelled. | Use the content seat's declared relation, preserve both IDs for links/history, filter before collapsing, and show reachable counts. Do not pair by matching question numbers or manufacture relations in the wrapper. |

## Deployment: settled principles versus proposals

The **chemistry subdirectory is still a proposal in the 27 September migration packet**: use the existing driller's `ppqviewer/` path, then let its Housing seat preserve or redirect `ppq.html` and repoint the button. The packet explicitly leaves the target to the maintainer with Smith. The economics subpath was directly chosen by Smith in Architect 5 turn 14; that precedent does not itself approve a chemistry publication.

The same distinction applies to content release. Chemistry's q006, reserved-test/crop review and publication ruling belong to its own release train. The 15 September Trilogy outbox records a separate explicit ruling even though its terms resemble IB Maths. A historical school-served approval for another subject is not a chemistry approval.

The local integration outbox dated 27 September records PACKET_005 adoption, exact legacy-ID aliases and a preview. It explicitly says it is **not a publication instruction**. Build, review, staging, push and served-byte verification remain distinct states. Old transcript commands and “a” responses authorised their named historical builds; they are not standing instructions to execute now.

Architect 7's release failure supplies an additional rule, formalised in **d034**: disposable preview regeneration must never overwrite the reviewed inputs used to justify a release. Preserve/pin evidence separately, compare semantic contents, and do not reset a review date merely because provenance has been rebuilt.

## Shared features chemistry can adopt without inventing a second system

The four 12 September consumer outbox notes describe opt-in capabilities already introduced for physics: compact attempt history; not-attempted/mix/previous-error practice choices; whole-question shuffle keeping parts in order; a side rating panel; question/context/markscheme preloading; compact structured navigation and scroll regions; preserving filters in the finder; shared group guidance; learner level and captured pacing; named problem reporting; question badges and docked tools.

These notes say explicitly that **other consumers were not deployed by those changes**. They are an adoption checklist, not evidence that chemistry already has them. They also record a later preference for **Complete mix** in physics; the older “unseen first” direction must not be applied as an unconditional current default across every consumer.

Smith also explicitly chose **“grouping and leading”** for the physics type sidebar (Architect 7 turn 13): headings by syllabus number and codes at the start of rows. This is a specific later layout request, compatible with readable names; it does not revoke the general ban on unexplained bare codes. Showing genuinely new content with no possible past papers was discussed alongside it, but the transcript's implementation/queue statements are the architect's, not fresh Smith approval of every suggested detail.

## Earlier user direction and superseded implementations

The Qoder exports explain why the current chemistry preview is a sensible intermediate step. In chat 1 message 3 Smith explicitly wanted to **compare chemistry in the shared viewer beside its old viewer**, checking parity before migration. Messages 9–13 require independent scrolling, larger usable controls, and chemistry's two views on opposite sides: Paper 1B characteristics and syllabus overview. They also criticise oversized figures and duplicated original/transcribed question displays. These are direct directions, unlike the assistant's much later claims that a port was already a migration.

Several specific corrections should survive future work:

- **Originals and context:** the 2 August changelog makes printed originals the leading representation, with transcription as a collapsible cross-check when originals exist; images should not upscale beyond source quality. The 31 July entry records that from part (b) onward chemistry must expose the whole context and earlier parts. This is relevant to tables/diagrams spread across pages. Temporary text while an image loads can satisfy the present request without changing which source is authoritative after loading.
- **Rating, understanding and guessing:** Smith's original 1–6 meanings are in chat 1 message 13; message 20 explicitly says 4 means understood but perhaps unstable tomorrow, not a lucky correct guess. The assistant's ensuing proposal to reuse 1–6 as a full before/after pair was tentative, not an agreed design. Later d033 is the controlling account of the two mark scales. Smith rejects inferring a guess from speed (messages 22–23): pupils declare it themselves.
- **Verdicts and guess timing:** garbled dictation in message 26 was wrongly implemented as hiding correctness. Smith corrected it explicitly in message 28: tell the pupil right/wrong before abstract explanation. The later request in messages 53–54 places the optional guess declaration on the first pop-up page, before showing the verdict; the v0.2.8 changelog records this replacing the earlier below-question pre-answer panel. Do not revive the accidental no-verdict behaviour or assume every old guess screen is still wanted.
- **Clock behaviour:** messages 39–40, 46–48 say off is suitable while learning, explicit pause needs no explanation, reflection automatically suspends timing, an optional reason must not suggest “misread the question”, and discarding time keeps the question attempt. The numeric correction is **27 × 60 ÷ 40**, superseding the mistaken 89 seconds; extra-time percentages can be negative for harder pacing. Those numbers are ESAT-specific, not chemistry timings. Later changelog entries separate the clock's independent controls rather than bundling arbitrary modes.
- **History and readable feedback:** chat 2 message 2 directly requests Previous at the top and reopening previous feedback even after shuffle; message 3 directly adds a sticky top bar. Its remaining analysis-state/evidence suggestions are explicitly pasted from the analyst. The 24 July changelog subsequently supersedes detached “More quick checks”, pupil-facing reviewer labels, and pill/strikethrough evidence displays: prompts belong beside their method; review provenance stays in review tooling; absent analysis must not stop normal answering.

The changelog also records useful implementation obligations: mark and response history belongs to the original attempt, not today's latest answer; reviewing must not create a duplicate attempt/event; local progress needs a clear empty state; reporting distinguishes an opaque dispatch from an acknowledged receipt; optional teacher-help work stays private pending review. These are historical evidence and test targets, not a fresh claim that chemistry's current preview enables every service.

## d033: two scales are independent of the error-option sweep

The most important correction to the older transcript is the **23 September d033 addendum**. Architect 7 first called the whole feature blocked, then called it unblocked when question-type codes arrived. The later recorded confirmation is more precise:

- **Got it then:** marks earned unaided, plus the non-mark answer “Not applicable: AI or someone else's intelligence helped me.” Assisted attempts are **excluded from the performance denominator**, not scored as zero.
- **Get it now:** marks understood now; still answered after assistance and earns understanding coverage. A full got-it-then result prefills full understanding but can be reduced. The two percentages are mark-weighted, latest attempt per question by default, with an all-attempts switch; both reach the teacher view.
- **Only the what-went-wrong panel waits for the content seat's error-option sidecar.** Finishing `qtype` is not finishing that sidecar. Options vary by question kind/type/part, use Smith's marking categories, carry “understand it now?” ticks, and are organised as major, medium and annoying errors. The dictated example list is expressly not the final vocabulary. Tier interpretation was partly uncertain and must not be treated as settled authoring data.

The six-level rating remains, with its offered band following **get-it-now**, not got-it-then. Short understanding offers 1–3; full understanding offers 4–6, with Smith's possible 3–6 overlap still unresolved in the record. The architect recommended rewording contradictory legacy descriptions; that recommendation is not approved copy. The purple/blue/teal assisted-coverage ramp is likewise provisional: its reference result and duration remain open. d033 supersedes the earlier flat-blue d025 proposal and answers which reflection survives assistance; it does not make every earlier proposed reporting/colour detail final.

For the taxonomy itself, **the Error Taxonomy seat's 24 September stand-down supersedes EdTech's same-day courier request**. The v0.5 snapshot was already delivered; do not send another. The canonical home moved to `C:\Claude (not on Gdrive, nor OneDrive)\Error Taxonomy\misconceptions_core.yaml`. `attribution_confidence` and `answer_earned` are ratified; the new graph-coordinate-misread leaf should replace corresponding proposed paths where it genuinely fits. Per-question evidence still belongs to the content seat; the viewer should not infer a pupil's actual error from an answer choice.

## Directions still requiring care

- **Assistance integrity:** the 21 September ESAT finding reproduces reveal-then-answer counting as unaided success. Its suggested error-path-as-hypothesis presentation is an EdTech recommendation, whereas separating assisted coverage from performance is Smith's direction. Keep those authorities distinct.
- **Error tables:** Smith's Trilogy feedback says group similar errors, filter by unit, let counts follow that filter, show made/avoided with separate rates fading from white, and use a stated recency anchor. Removing the opportunities column was the sender's recommendation. The packet concerns the **Trilogy Driller**, not proof that the PPQ product has that table.
- **Twins from examiner reports:** Smith proposed this as a possibility. Architect 7 found it useful as corroborating evidence but explicitly warned against short generic comments and proposed a content-seat sweep. Neither exact-comment matching nor the 38 historical physics proposals is a blanket auto-merge rule for chemistry.
- **Parked surfaces:** mark-point ticking and economics essay checklists were held for a shared post-question redesign, not abandoned and not separate wrapper jobs. Authenticated accounts, verified identity and cross-device storage were discussed as shared-service work, not permission to create another identity provider inside ppqviewer.
- **Obsolete dispatch instructions:** the 6 August economics dispatch contains subsequently corrected assumptions: flat asset paths, underscore-made IDs, and empty status treated as current. Later packets and the contract override those details. Do not copy that dispatch as a current chemistry template.

No code, content-tree file, deployment or external message was changed by this history review.

## Later release steering, 27 September

Smith explicitly authorized uploading the repaired Chemistry viewer and then
reaffirmed that existing strengths, especially the left data-analysis view,
must survive. The release preparation found and corrected a fine-first grouping
regression; see `CHEMISTRY_RELEASE.md` for all 72 original groups' parity checks.
The original-image default and preloading/transcription fallback are also direct
current user instructions, not inferred from older transcript proposals.

Two TeacherViewer packets arrived in Chemistry Driller's inbox during this work.
The later `2026-09-27_from-teacherviewer_your-question-answered-and-my-criticism-withdrawn.md`
explicitly withdraws the earlier SL/HL cohort criticism. It supports retaining
Chemistry's stated SL/HL/Test vocabulary; it does not authorize inventing class
codes or adding the physics-only TestAxR cohort.
