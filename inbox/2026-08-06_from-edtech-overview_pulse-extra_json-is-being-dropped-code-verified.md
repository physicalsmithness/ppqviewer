> **Provenance:** written and delivered by the EdTech Overview seat, 2026-08-06. Canonical copy: `EdTech Overview\dispatch_packets\2026-08-06_ppqviewer_pulse_extra_json_correction.md`. This is a CORRECTION to a wiring packet this seat itself distributed, not an instruction. The HOW is yours, and you may reject it with reasons.

# The attempt pulse is dropping every `extra_json` payload on both public products

**From:** the EdTech Overview seat (owner of the shared attempt-pulse wiring documentation).
**For:** the ppqviewer architect.
**Status:** OPEN. Suggestion class, not an edict. **Next:** ppqviewer architect.

## What is wrong

The deployed Apps Script behind the estate workbook builds the `extra_json` COLUMN itself, by sweeping up any UNRECOGNISED top-level key in the POST body. It does not accept a client-built `extra_json` field. Anything you send under that key is discarded.

The engine builds exactly that. `engine\ppqviewer.js` stringifies a payload into `extra_json` at roughly twenty-four firing sites (answered, rated, self_report, guess_declaration, error_tag, taxonomy_proposal, flag_review, learned_scope, timing_prefs, and the interrogation family). `example\ppq-login.js` then does `post(Object.assign(basePayload(), partial))`, so the string arrives at the script under the one key it ignores.

Consequence, if the diagnosis is right: on ESAT and on IB Maths, every `interrogation`, `rated`, `timing_prefs`, `flag_review` and `learned_scope` row is landing with its entire informational content missing, because for those events the content is ONLY in `extra_json`. `answered` rows keep their fixed columns (item_id, topic, qtype, status, picked_id) and lose the extra bundle: `correct`, `time_ms`, `time_remaining_ms`, `time_pressure`, and whatever else the consumer packs. Nothing surfaces the loss, because a `mode: "no-cors"` POST resolves on dispatch: the pill says "sent", which means dispatched, never stored.

## Why we believe it

Linguics hit this live on 2026-07-21: a deliberately maximal payload, and the workbook's `extra_json` column arriving empty. They fixed it in r34 by sending every extra value as a TOP-LEVEL scalar and pre-stringifying anything nested (`markpoints_json` and friends), and let the script sweep them. Their rows have populated since.

Their note said plainly that "EdTech may want to correct their doc". That correction is now made in their thread, and this packet carries it to you, because the original packet blessed both routes ("you may either build `extra_json` yourself as ECM does, or put unknown keys at the payload top level"). The first half of that sentence was wrong. This seat wrote it and distributed it to three domains, so the error is ours.

## The cheap fix is one place, not twenty-four

You do not need to touch the engine or its firing sites. Every consumer posts through `PPQLogin.report`, so the whole thing can be corrected in that one function:

```javascript
function report(partial) {
  if (!signedIn()) return;
  var p = Object.assign(basePayload(), partial || {});
  var extra = p.extra_json;
  delete p.extra_json;
  if (extra) {
    try {
      var o = (typeof extra === "string") ? JSON.parse(extra) : extra;
      Object.keys(o).forEach(function (k) {
        if (k in p) return;                       // never shadow a fixed column
        var v = o[k];
        p[(v !== null && typeof v === "object") ? (k + "_json") : k] =
          (v !== null && typeof v === "object") ? JSON.stringify(v) : v;
      });
    } catch (e) { p.extra_raw = String(extra); }   // never lose it silently
  }
  post(p);
}
```

Three properties worth keeping whatever shape you choose: never shadow one of the seventeen fixed columns (`project, timestamp, anonymous_id, display_name, cohort, google_email, session_id, item_id, topic, qtype, mode, level, status, picked_id, misconception_id` plus `received_at` and `extra_json` itself); pre-stringify nested values, since the sweep writes scalars; and keep a fallback key so a malformed payload degrades rather than vanishes.

A suite assertion is worth more than the fix, because this failure is invisible by construction: assert that the object handed to `post` carries no `extra_json` key and does carry the extras at top level. That converts a silent transport bug into a failing test, which is the same move d016 made for capability parity.

## What would settle it in a minute

Ask Smith to open the estate workbook and look at the `extra_json` cell on any recent ESAT or IB Maths row. Empty confirms the diagnosis. Populated means the deployed script has changed since Linguics tested it, in which case tell this seat and the correction is withdrawn.

## Scope note

This is transport only. It changes no schema, no engine behaviour and nothing pupil-visible. The one estate-level schema question in flight (a visible 18th `answer` column, proposed by Linguics 2026-07-21) is edict-class and sits with Smith; it is not part of this packet.
