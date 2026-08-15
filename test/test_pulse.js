/* Headless test for the estate attempt pulse: what `example\ppq-login.js`
   actually hands to the network. Requires jsdom. Run: node test/test_pulse.js

   WHY THIS SUITE EXISTS. The pulse failure class is invisible by construction.
   Every POST goes out `mode: "no-cors"`, so the promise resolves on dispatch
   and the status pill says "sent" when all it knows is "dispatched"; nothing
   client-side can see whether a row landed, or landed empty. From the day the
   pulse was wired until 2026-08-06 the engine stringified each event's detail
   into an `extra_json` field, and the deployed Apps Script discards that key,
   because it builds the extra_json COLUMN itself by sweeping up unrecognised
   top-level keys. So every rated, interrogation, timing_prefs, flag_review and
   learned_scope row landed with its whole informational content missing, and
   every answered row lost correct / time_ms / time_pressure, for weeks, with
   no symptom anywhere. Linguics hit it live on 2026-07-21; the EdTech Overview
   seat carried the correction here by packet.

   A fix alone would not have been worth much: the same silence would hide the
   next regression. These assertions convert a silent transport bug into a
   failing test, which is the move d016 (capability parity) made for
   capabilities. Keep them behavioural: they execute the real report() and
   inspect the object handed to fetch, rather than pattern-matching source.

   Claude (ppq architect), 2026-08-06. */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const PV = path.join(__dirname, "..");
const LOGIN = path.join(PV, "example", "ppq-login.js");

const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
  { runScripts: "outside-only", pretendToBeVisual: true, url: "https://localhost/" });
const { window } = dom;
global.window = window; global.document = window.document;

let pass = 0, fail = 0;
function check(n, c) { if (c) { pass++; console.log("  ok   " + n); } else { fail++; console.log("  FAIL " + n); } }

/* Capture every POST body instead of sending it. */
const sent = [];
window.fetch = function (url, opts) {
  try { sent.push(JSON.parse(opts.body)); } catch (e) { sent.push({ __unparseable: String(opts && opts.body) }); }
  return Promise.resolve({});
};

window.eval(fs.readFileSync(LOGIN, "utf8"));

const login = window.PPQLogin.createLogin({ projectTag: "test_project", classes: ["Y12 Test"] });
login.signIn("Test Pupil", "Y12 Test");

console.log("\n=== the extra bundle survives the trip ===");

sent.length = 0;
login.report({
  item_id: "Q1", topic: "T", qtype: "self_report", status: "rated",
  extra_json: JSON.stringify({ rating: 4, time_ms: 91000, time_pressure: "none" })
});
const rated = sent[sent.length - 1] || {};

check("no client-built extra_json is sent (the script discards that key)",
  !Object.prototype.hasOwnProperty.call(rated, "extra_json"));
check("the extras arrive as top-level scalars the script's sweep can see",
  rated.rating === 4 && rated.time_ms === 91000 && rated.time_pressure === "none");
check("the fixed columns still arrive alongside them",
  rated.status === "rated" && rated.item_id === "Q1" && rated.qtype === "self_report");
check("identity is merged in",
  rated.project === "test_project" && rated.display_name === "Test Pupil" && rated.cohort === "Y12 Test");

console.log("\n=== the three properties the estate asked us to keep ===");

/* 1. Never shadow a fixed column: a payload that names one must not be able to
      overwrite the identity or routing the workbook keys on. */
sent.length = 0;
login.report({
  item_id: "Q2", status: "answered",
  extra_json: JSON.stringify({ display_name: "IMPOSTOR", item_id: "WRONG", project: "WRONG", correct: true })
});
const shadow = sent[sent.length - 1] || {};
check("an extra named like a fixed column cannot overwrite it",
  shadow.display_name === "Test Pupil" && shadow.item_id === "Q2" && shadow.project === "test_project");
check("and its innocent siblings still get through", shadow.correct === true);

/* 2. Pre-stringify nested values: the sweep writes scalars, so an object left
      as an object lands as "[object Object]". */
sent.length = 0;
login.report({
  item_id: "Q3", status: "interrogation",
  extra_json: JSON.stringify({ markpoints: { a: 1, b: [2, 3] }, list: [1, 2], flat: "ok" })
});
const nested = sent[sent.length - 1] || {};
check("nested values are stringified under a _json name, never sent as objects",
  typeof nested.markpoints_json === "string" && JSON.parse(nested.markpoints_json).b[1] === 3);
check("arrays count as nested too", typeof nested.list_json === "string");
check("scalars keep their own name", nested.flat === "ok");
check("no value handed to fetch is a live object",
  Object.keys(nested).every((k) => nested[k] === null || typeof nested[k] !== "object"));

/* 3. Never lose a malformed payload silently: degrade to a raw column instead
      of dropping it, because dropping is exactly the bug we are fixing. */
sent.length = 0;
login.report({ item_id: "Q4", status: "answered", extra_json: "{not valid json" });
const broken = sent[sent.length - 1] || {};
check("a malformed extra bundle degrades to extra_raw rather than vanishing",
  typeof broken.extra_raw === "string" && broken.extra_raw.indexOf("not valid") >= 0);
check("and the event itself still reports", broken.item_id === "Q4" && broken.status === "answered");

console.log("\n=== the engine still speaks extra_json, which is why the shim must stay ===");

const engineSrc = fs.readFileSync(path.join(PV, "engine", "ppqviewer.js"), "utf8");
const sites = (engineSrc.match(/extra_json:/g) || []).length;
check("the engine builds extra_json at many firing sites (" + sites + "), so the flattening must live in the transport, not in the engine",
  sites >= 20);
check("no consumer wrapper hand-builds its own POST body",
  ["esat-compare.html", "ibmaths.html", "economics.html", "chem-compare.html"].every(function (f) {
    const p = path.join(PV, "example", f);
    if (!fs.existsSync(p)) return true;
    return fs.readFileSync(p, "utf8").indexOf("script.google.com") < 0;
  }));

/* Reporting is opt-in per consumer, and two published consumers do not take
   it. That is a product decision for Smith, not a defect, but it must be
   visible rather than discovered: this assertion documents the live state and
   will fail the day someone wires one up, prompting the record to be updated. */
console.log("\n=== which consumers actually report (state, not judgement) ===");
const wired = ["esat-compare.html", "ibmaths.html", "economics.html", "chem-compare.html"].filter(function (f) {
  const p = path.join(PV, "example", f);
  return fs.existsSync(p) && fs.readFileSync(p, "utf8").indexOf("ppq-login.js") >= 0;
});
check("exactly ESAT and the chemistry comparison page report; IB Maths and Economics send nothing (recorded in OPEN_QUESTIONS q13)",
  wired.length === 2 && wired.indexOf("esat-compare.html") >= 0 && wired.indexOf("chem-compare.html") >= 0);

console.log("\n==================  " + pass + " passed, " + fail + " failed  ==================");
process.exit(fail ? 1 : 0);
