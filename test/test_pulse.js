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

/* d024 (Smith 2026-08-06): every pupil-facing consumer is gated and pulses.
   IB Maths was published for a week reporting nothing at all; that is the
   thing these assertions exist to stop recurring silently. */
console.log("\n=== every pupil-facing consumer is gated and reports (d024) ===");

const PUPIL_FACING = ["esat-compare.html", "ibmaths.html", "economics.html"];
const wired = PUPIL_FACING.filter(function (f) {
  const p = path.join(PV, "example", f);
  return fs.existsSync(p) && fs.readFileSync(p, "utf8").indexOf("ppq-login.js") >= 0;
});
check("every pupil-facing consumer loads the estate login: " + wired.join(", "),
  wired.length === PUPIL_FACING.length);

const reporting = PUPIL_FACING.filter(function (f) {
  const src = fs.readFileSync(path.join(PV, "example", f), "utf8");
  return /report:\s*(gate \? gate\.report : null|presentationBenchmark \? null : report|report)/.test(src);
});
check("and hands a report function to the engine mount, so events actually fire: " + reporting.join(", "),
  reporting.length === PUPIL_FACING.length);

/* Distinct project tags and cohort keys: one shared workbook routes by project
   tag, and a shared cohort key would make a pupil's economics class overwrite
   their maths class. */
const tags = {}, cohorts = {};
PUPIL_FACING.forEach(function (f) {
  const src = fs.readFileSync(path.join(PV, "example", f), "utf8");
  const t = src.match(/projectTag:\s*"([^"]+)"/);
  const c = src.match(/cohortKey:\s*"([^"]+)"/);
  if (t) tags[t[1]] = (tags[t[1]] || 0) + 1;
  if (c) cohorts[c[1]] = (cohorts[c[1]] || 0) + 1;
});
check("each consumer has its own project tag (" + Object.keys(tags).join(", ") + ")",
  Object.keys(tags).length === PUPIL_FACING.length && Object.keys(tags).every((k) => tags[k] === 1));
check("each consumer scopes its class to its own key, so one subject's class cannot overwrite another's",
  Object.keys(cohorts).length === PUPIL_FACING.length && Object.keys(cohorts).every((k) => cohorts[k] === 1));

console.log("\n=== the shared gate behaves like the hand-rolled one ===");

const gateDom = new JSDOM(`<!doctype html><html><body><div id="ppq-root"></div></body></html>`,
  { runScripts: "outside-only", url: "https://localhost/" });
gateDom.window.fetch = function () { return Promise.resolve({}); };
gateDom.window.eval(fs.readFileSync(LOGIN, "utf8"));
const gate = gateDom.window.PPQLogin.mountGate({
  title: "Test Driller", projectTag: "ppqviewer_test",
  cohortKey: "ppqviewer_test_cohort_v1", classes: ["Y12 Test", "Y13 Test"],
  appEl: "ppq-root"
});
const gdoc = gateDom.window.document;
check("the gate injects itself and hides the app until sign-in",
  !!gdoc.getElementById("ppq-sign-in-gate") && gdoc.getElementById("ppq-root").style.display === "none");
check("the class dropdown is never blank: placeholder plus every class",
  gdoc.getElementById("ppq-si-class").options.length === 3);
check("it offers the same three fields the hand-rolled ESAT gate offers",
  !!gdoc.getElementById("ppq-si-name") && !!gdoc.getElementById("ppq-si-class") && !!gdoc.getElementById("ppq-si-start"));
check("report() is safe to hand to the engine before anyone has signed in",
  typeof gate.report === "function" && (gate.report({ status: "answered" }), true));

gdoc.getElementById("ppq-si-name").value = "Gate Pupil";
gdoc.getElementById("ppq-si-class").value = "Y13 Test";
gdoc.getElementById("ppq-si-start").click();
check("signing in reveals the app and hides the gate",
  gdoc.getElementById("ppq-root").style.display === "block" && gdoc.getElementById("ppq-sign-in-gate").style.display === "none");

/* Smith's question, 2026-08-06: "a user who already has progress and then logs
   in will keep their progress?" IB Maths ran ungated from 2026-07-29, so real
   pupils have real local history that predates the gate. The answer must be
   proved, not assumed: the engine namespaces its store on config.storageKey
   alone, identity plays no part in the key, and the login writes only the
   shared identity object and this page's own cohort key. These assertions pin
   that down so nobody can later make sign-in the owner of the store without
   the suite objecting. */
console.log("\n=== progress made before sign-in survives it ===");

const preDom = new JSDOM(`<!doctype html><html><body><div id="ppq-root"></div></body></html>`,
  { runScripts: "outside-only", url: "https://localhost/" });
preDom.window.fetch = function () { return Promise.resolve({}); };
const CONSUMER_STORE = "ibmaths_ppq_v1";
const priorWork = JSON.stringify({
  attempts: [{ id: "8822-7101_Q1", marks: 5, ts: 1 }, { id: "8822-7101_Q2", marks: 3, ts: 2 }],
  scores: { "8822-7101_Q1": 5 }, flags: {}, prefs: { order: "shuffle" },
  learned: { set: { "SL3.6": 2 }, enabled: true }
});
preDom.window.localStorage.setItem(CONSUMER_STORE, priorWork);
preDom.window.localStorage.setItem(CONSUMER_STORE + "_structmode", "parts");
preDom.window.eval(fs.readFileSync(LOGIN, "utf8"));

const preGate = preDom.window.PPQLogin.mountGate({
  title: "Maths", projectTag: "ppqviewer_ibmaths",
  cohortKey: "ppqviewer_ibmaths_cohort_v1", classes: ["Y13 Maths"], appEl: "ppq-root"
});
const pdoc = preDom.window.document;
pdoc.getElementById("ppq-si-name").value = "Returning Pupil";
pdoc.getElementById("ppq-si-class").value = "Y13 Maths";
pdoc.getElementById("ppq-si-start").click();

check("the attempt store is byte-identical after signing in",
  preDom.window.localStorage.getItem(CONSUMER_STORE) === priorWork);
check("and so is the part-view preference beside it",
  preDom.window.localStorage.getItem(CONSUMER_STORE + "_structmode") === "parts");
check("signing out clears only this page's class, never the pupil's work",
  (preGate.login.signOut(),
    preDom.window.localStorage.getItem(CONSUMER_STORE) === priorWork &&
    !preDom.window.localStorage.getItem("ppqviewer_ibmaths_cohort_v1")));

const loginSrc = fs.readFileSync(LOGIN, "utf8");
const writes = (loginSrc.match(/localStorage\.(setItem|removeItem|clear)\(([^,)]+)/g) || [])
  .map((s) => s.replace(/.*\(/, "").trim());
check("the login touches only the shared identity and the page cohort key (" + writes.join(", ") + ")",
  writes.length > 0 && writes.every((w) => /SHARED_IDENTITY_KEY|cohortKey/.test(w)));

const engineSrcForKey = fs.readFileSync(path.join(PV, "engine", "ppqviewer.js"), "utf8");
check("the engine keys its store on storageKey alone, so identity can never own a pupil's history",
  /localStorage\.getItem\(this\.cfg\.storageKey\)/.test(engineSrcForKey) &&
  !/storageKey\s*\+\s*[^_"']*(learnerId|anonymous_id|display_name)/.test(engineSrcForKey));

console.log("\n==================  " + pass + " passed, " + fail + " failed  ==================");
process.exit(fail ? 1 : 0);
