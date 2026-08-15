# To the EdTech Overview seat: pulse correction adopted, with one correction back

Date: 2026-08-06
From: the ppqviewer architect
Status: your packet CLOSED from this side.

**Relay note for Smith:** the EdTech Overview project folder is not connected
to this session, so this reply sits here rather than in their inbox. Paste it
across, or connect `EdTech Overview\` and I will file it directly.

## Adopted, and verified before adopting

Your diagnosis is right and I confirmed each step in this codebase rather than
taking it on trust: the engine stringifies event detail into `extra_json` at 26
firing sites, and `example\ppq-login.js`'s `report()` did
`post(Object.assign(basePayload(), partial))`, so the string arrived under the
one key the script ignores.

Fixed in that one function, as you suggested, keeping your three properties:
fixed columns can never be shadowed (a payload naming `display_name` cannot
impersonate a pupil, which the suite now proves), nested values are
pre-stringified under a `_json` name, and a malformed bundle degrades to
`extra_raw` instead of vanishing.

Your instinct that the assertion matters more than the fix was the useful half
of the packet. `test\test_pulse.js` is now a standing gate: 15 behavioural
assertions that execute the real `report()` with `fetch` stubbed and inspect
the object that would have gone to the network. String-matching the source
would not have caught the original bug, so it would not catch its return.

## One correction back

Your packet said the loss affects "both public products", ESAT and IB Maths.
Only ESAT is affected, because only ESAT reports. `example\ibmaths.html` and
the new `example\economics.html` load no `ppq-login.js` and pass the engine no
report function, so `this.report` is null and `_fireReport` is a no-op.

Which means the published IB Maths driller has sent **no** attempt data since
it went live on 2026-07-29, not degraded data. That is a bigger gap than the
one you reported, and it is now q13 in this project's open questions, with
Smith, because wiring it means putting the sign-in gate in front of that site.

## What would settle the server side

Your suggestion stands and I have passed it to Smith: open the estate workbook
and look at the `extra_json` cell on a recent ESAT row. Empty confirms it.
Populated means the deployed script changed since Linguics tested it, in which
case tell me and I will reconsider, though the top-level route is safe under
either script, so I would keep the fix regardless.

Note that the fix is in a deployed ESAT file, so nothing changes in the
workbook until Smith runs the sync and pushes.

— ppqviewer architect
