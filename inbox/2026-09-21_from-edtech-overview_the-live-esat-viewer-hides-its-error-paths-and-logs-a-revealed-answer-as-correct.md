# The live ESAT viewer hides its error paths at the moment they matter, and logs a revealed answer as a correct attempt

From: EdTech Overview (interactive takeover, 2026-09-21 evening) · For: the ESAT planning seat (Esat Categorisation), for onward posting to `ppqviewer\inbox\` when you next post there (ppqviewer is not mounted in this seat's session tonight, so its copy is owed)
**Next:** ESAT planning seat (read; decide whether 1 and 2 go to ppqviewer as one packet or ride your next E-packet)
Canonical copy: `EdTech Overview\dispatch_packets\` (same filename). No clock.

## Why this packet exists

Smith commissioned an outside review of the live `esatwallop` site (a ChatGPT-side reviewer, 16 September, desktop only, no code access). Two of its findings are about the product's teaching layer rather than its polish, so I reproduced both tonight on the live build (`d7a8973475453f74`, built 2026-09-07 11:48 UTC, the build you released) and checked one of them against the served bundle. Both reproduce. Two attempts were written to the shared tracker under cohort `Test`, name `EdTech seat check`, at about 23:45 to 23:55 BST; ignore them.

## 1. The per-option error path exists in the served bundle and the panel does not show it

Test: `esat_nsaa_2016_s1_Q28` (the roof-coupling pulley), chose **A, 4.0 N**.

What the panel says under ABOUT YOUR ANSWER: *"The mass requires T = 54 N; both sides of the rope pull down on the fixed pulley, so the coupling force is 2T = 108 N. Was that what happened?"*, then the four buttons (Yes, that was it / Something like that / No, another reason / Not sure), then FIRST THING TO NOTICE and CHECK YOURSELF.

What the served bundle holds for that option (`dist\esat_analysis_v2.js`, 09-07 12:48, content identical to the released one per your wave-3 note; `options[A].error_path`, `diagnostic_confidence: high`):

> 4.0 N is ma, the resultant force on the mass, not the rope tension or coupling force.

That sentence is the diagnosis the reviewer said was missing, word for word the reasoning they wrote themselves ("the pupil may have calculated the resultant force while omitting weight"). It is in the data for the option they picked and the viewer showed them the general solution instead. The bundle carries **4,681 `error_path` strings**; the panel appears to show none of them in the "About your answer" slot, at least for provisional records, which is 719 of the 720 served (`provisional_feedback` in the ledger; the one `full_feedback` is still `esat_nsaa_2020_s1_Q22`, your wave-3 finding 1, unlanded replacement).

I cannot see the wrapper code from here, so I do not know whether this is (a) the projection deliberately withholding per-option paths on provisional records (a defensible RS-02 safety choice, "eighteen misleading provisionals"), or (b) the slot simply reading a different field. Either way the consequence is the same: the estate's single best live demonstration of the lost-marks positioning (GO_TO_MARKET q11) is invisible to every pupil on effectively every question, and the "Was that what happened?" buttons are asking a pupil to confirm a diagnosis that was never made specific to them. If it is (a), landing wave 1b + R9 (about 140 verified records) is what turns the paths on; if it is (b), it is a one-slot change. Please say which.

## 2. Reveal, then select the revealed answer, and the progress grid records a correct attempt

Test: `esat_nsaa_2016_s1_Q29` (heater, charge and voltage). Pressed **Show markscheme** first. The viewer printed *"Correct answer: F (not logged)"*. Then selected **F**. The Teaching topic progress grid put a ✔ under P1 Electricity, the attempt pulsed ("sent"), and the confidence modal opened as for any unaided answer.

So "not logged" is true of the reveal and false of what follows it: the next click is scored as if unaided, on the grid and, unless the payload carries a reveal flag I cannot see, in the shared workbook. This is the same measurement-integrity principle Smith ruled twice in three days elsewhere (this seat's 09-10 entry: attempts after help are not attempts), and it is the exact fault the reviewer reported on the geometry question. Fix shape: once revealed, either lock the option buttons for that question or score the selection as `revealed`, never as correct; the new got-it-then / get-it-now scales ppqviewer is building for IB physics (Smith's 19 to 21 September instruction, "Not applicable: AI or someone else's intelligence helped me") are the same distinction and ESAT should inherit them when its release train next runs.

## 3. Two external facts you may not have, read tonight from esat-tmua.ac.uk

- **There is a January 2027 sitting.** Booking opens 26 October 2026 15:00, closes 21 December 2026 18:00 GMT, test window 4 to 8 January 2027, for applicants to institutions other than Oxford and Cambridge (and the Cambridge mature colleges / Oxford foundation year). October results 16 November; January results 8 February. So the product has a second cohort this cycle, not only the 12 to 16 October one.
- **UAT-UK's website terms of use, Intellectual Property section, verbatim:** *"Material from this site may be viewed, downloaded and/or printed for your personal use only and cannot be used for direct or indirect commercial purposes or advantage without the express written permission of UAT-UK. You may not modify the paper or digital copies of any material printed off or downloaded in any way and you must not use any illustrations, photographs, video or audio sequences or any graphics separately from any accompanying text."* The ENGAA and NSAA archives sit on that site. This is the admissions row of GO_TO_MARKET q8 (paper-release IP) answered from the rights-holder's side: the crops are fine to serve to Smith's own pupils under d014's posture (school pupils who already hold the papers, unpublicised), and are not fine to sell without written permission. Recorded in GO_TO_MARKET tonight; nothing for you to do, but it bounds any release that charges.

## What I am not asking

No content work. Your wave-3 verdicts and the landing sequence (E07 first) stand; if anything, finding 1 is one more reason E07 fires.

---

## Addendum, 2026-09-22 00:20, after ppqviewer was mounted in this session

**Finding 1 is a design choice in the engine, not a projection or a data gap, so the "which is it" question above is answered.** `engine\ppqviewer.js`, `_verdictEl` (about line 5122; the released copy in `deploy\esatwallop\engine\ppqviewer.js` is identical at about line 4080):

```
/* Deep-v2 error_path is a reconstructed reviewer mechanism, not a known pupil
   history. Pupils get the matching conditional feedback question instead. */
if (opt && opt.error_path && (!isV2 || reviewMode)) {
```

So on every deep-v2 record (all 720 served) the per-option `error_path` renders only in review mode, and the pupil gets `_selectedDiagnosticCardV2`, which picks the best-matching entry of `rec.feedback[]` by option specificity. For `esat_nsaa_2016_s1_Q28` the record carries exactly two feedback entries, `correct_guess` (H, guess declared) and `wrong_answer` (`selected_options: ["any_wrong"]`), so every one of the seven wrong options gets the same general-solution sentence, followed by "Was that what happened?" That is the shape across the provisional set: the conditional-feedback layer is generic where the `error_path` layer is specific.

The 22 July stance (an inferred mechanism should not be asserted to the pupil as their history) is right as far as it goes, and the buttons already exist to honour it. The fix is a phrasing rule, not a data run: when the matched feedback entry is the generic `any_wrong`, render the chosen option's `error_path` as a hypothesis in the same card ("One way to get 4.0 N: F = ma gives the resultant force on the mass, not the tension or the coupling force. Was that what happened?"), and keep the four buttons. That is what the reviewer asked for word for word, and it is d033's principle (options a pupil can recognise about their own attempt, each with a tick) applied to the layer that already exists. Suggested for the next ESAT release train; nothing here touches content.

**Finding 2 restated for the engine rather than the wrapper:** after "Show markscheme" prints "Correct answer: F (not logged)", the option buttons stay live and the next click scores as unaided. Once revealed, either lock the letters for that question or score the click as `revealed`; d033's "Not applicable" answer is the same distinction and could carry it.

Delivered directly to `ppqviewer\inbox\` on 2026-09-22 (the mount arrived); the Esat Categorisation copy is updated to match and its ticker carries a revision line.
