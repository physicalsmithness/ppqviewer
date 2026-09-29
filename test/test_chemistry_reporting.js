/* Synthetic identities only; every network call is mocked. */
"use strict";
const assert = require("assert/strict"), fs = require("fs"), path = require("path"), { JSDOM } = require("jsdom");
const source = fs.readFileSync(path.join(__dirname, "../example/physics-reporting.js"), "utf8"), opened = [];
let checks = 0;
function check(name, fn) { fn(); checks++; console.log("ok " + name); }
function fixture(enabled = true) {
  const dom = new JSDOM("", { url: enabled ? "https://physicalsmithness.github.io/chemistrydriller/ppqviewer/" : "http://127.0.0.1:8789/", runScripts: "outside-only" });
  const w = dom.window, sent = []; opened.push(dom);
  w.fetch = (url, opts) => { sent.push({ url, opts, p: JSON.parse(opts.body) }); return Promise.resolve({ type: "opaque" }); };
  w.eval(source);
  let person = { anonymous_id: "chemistry-learner", display_name: "Chemistry fixture", cohort: "Chemistry class", signed_in: true };
  const q = { id: "chemistry-existing-Q1(a)", source_part_id: "chemistry-source", topic_codes: ["R1.1"], marks: 2 };
  const legacy = { id: q.id, attempt_id: "legacy-unowned", marks_max: 2, marks_awarded: 0 };
  const other = { id: q.id, attempt_id: "other-learner-attempt", learner_id: "other-learner", marks_max: 2, marks_awarded: 2 };
  const row = { id: q.id, attempt_id: "new-chemistry-attempt", learner_id: person.anonymous_id, marks_max: 2, marks_awarded: 1, ts: "2026-09-27T12:00:00Z" };
  const v = { cfg: { learnerId: person.anonymous_id, idOf: q => q.id }, cur: q, byId: { [q.id]: q }, _attemptId: row.attempt_id, store: { attempts: [legacy, other] } };
  const before = JSON.stringify(v.store);
  const reporter = w.PPQReporting.create({ enabled, projectTag: "ppqviewer_chemistry", reportingVersion: "chemistry-1", identity: { current: () => person }, viewer: () => v });
  const send = (status = "answered", extra = { attempt_id: row.attempt_id }) => reporter.report({ status, item_id: q.id, extra_json: JSON.stringify(extra) });
  return { w, sent, v, row, legacy, other, reporter, send, before, setPerson: next => { person = next; } };
}
try {
  check("chemistry uses the same adapter and immutable receiver with explicit subject routing", () => {
    const f = fixture(); assert.equal(f.w.PPQReporting, f.w.PhysicsReporting);
    f.v.store.attempts.push(f.row);
    f.send("answered", { attempt_id: f.row.attempt_id, project: "ppqviewer_ibphysics", reporting_version: "spoof", anonymous_id: "other", cohort: "Physics class" });
    const { p, url, opts } = f.sent[0];
    assert.equal(url, f.w.PhysicsReporting.REPORT_URL); assert.equal(opts.method, "POST"); assert.equal(opts.mode, "no-cors");
    assert.equal(p.project, "ppqviewer_chemistry"); assert.equal(p.reporting_version, "chemistry-1");
    assert.equal(p.anonymous_id, "chemistry-learner"); assert.equal(p.cohort, "Chemistry class");
    assert.equal(p.question_id, f.row.id); assert.equal(p.attempt_id, f.row.attempt_id); assert.equal(p.status, "half");
  });
  check("original physics callers retain their project and reporting version defaults", () => {
    const f = fixture(); f.v.store.attempts.push(f.row);
    const reporter = f.w.PhysicsReporting.create({ enabled: true, identity: { current: () => ({ signed_in: true, anonymous_id: f.row.learner_id, display_name: "Physics fixture", cohort: "Physics class" }) }, viewer: () => f.v });
    reporter.report({ status: "answered", item_id: f.row.id, extra_json: JSON.stringify({ attempt_id: f.row.attempt_id }) });
    assert.equal(f.sent[0].p.project, "ppqviewer_ibphysics"); assert.equal(f.sent[0].p.reporting_version, "ibphysics-1");
  });
  check("creating chemistry reporting never backfills or assigns ownership to existing attempts", () => {
    const f = fixture(); assert.equal(f.sent.length, 0); assert.equal(JSON.stringify(f.v.store), f.before);
    f.v.store.attempts.push(f.row); f.send();
    assert.deepEqual(f.sent.map(x => x.p.attempt_id), [f.row.attempt_id]);
    f.v._reviewingAttempt = f.legacy; f.send("rated", { rating: 4 });
    f.v._reviewingAttempt = f.other; f.send("rated", { rating: 4 });
    assert.equal(f.sent.length, 1); assert.equal(JSON.stringify({ attempts: f.v.store.attempts.slice(0, 2) }), f.before);
  });
  check("chemistry rechecks current identity on every event and isolates another learner's attempt", () => {
    const f = fixture(); f.v.store.attempts.push(f.row); f.send();
    f.setPerson({ signed_in: false, anonymous_id: f.row.learner_id, display_name: "Chemistry fixture", cohort: "Chemistry class" }); f.send();
    f.setPerson({ signed_in: true, anonymous_id: "next-learner", display_name: "Next fixture", cohort: "Next class" }); f.send();
    f.v.cfg.learnerId = "next-learner"; f.send(); f.send("rated", { attempt_id: f.row.attempt_id, rating: 5 });
    assert.equal(f.sent.length, 1);
    const next = { ...f.row, attempt_id: "next-attempt", learner_id: "next-learner" }; f.v.store.attempts.push(next);
    f.send("answered", { attempt_id: next.attempt_id });
    assert.equal(f.sent.length, 2); assert.equal(f.sent[1].p.anonymous_id, "next-learner"); assert.equal(f.sent[1].p.cohort, "Next class");
  });
  check("a chemistry preview with reporting disabled never invokes transport", () => {
    // The consumer supplies its live-site policy through enabled.
    const f = fixture(false); f.v.store.attempts.push(f.row);
    f.send(); f.send("rated", { attempt_id: f.row.attempt_id, rating: 3 });
    f.send("timing_prefs", { attempt_id: f.row.attempt_id, time_discard_retro: true });
    assert.equal(f.sent.length, 0); assert.equal(f.v.store.attempts.at(-1).marks_awarded, 1);
  });
} finally { for (const dom of opened) dom.window.close(); }
console.log(checks + " chemistry reporting checks passed");
