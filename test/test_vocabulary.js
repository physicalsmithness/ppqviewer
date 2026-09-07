/* Vocabulary agreement between a wrapper and the catalogue it consumes.
   Run: node test/test_vocabulary.js

   WHY. On 2026-08-17 Smith found three faults in one sitting. Two were the
   same fault wearing different clothes: a wrapper testing for a token the
   content seat's data has never contained.

     - `q.calculator === "required"`. The seat's vocabulary is
       `permitted` / `not_permitted`, so 553 option-booklet questions printed
       a bare "Option booklet" and silently dropped their calculator rule.
     - `learnedScope.refsOf` read `aa_codes` and never `aa_codes_today`, so a
       pupil who un-ticked complex numbers was still served them.

   Both were invisible to 2,418 assertions, because every one of those asks
   whether a behaviour fires, and neither of these is a behaviour that fires.
   They are vocabulary mismatches between two files written by different seats,
   and they surface only when a human meets a real question.

   Suggested by the EdTech Overview seat (packet 2026-08-17), whose framing is
   the right one: this is the cheap half of absence-testing, and cheap halves
   are the ones that actually get built.

   TWO CHECKS.

   1. HARD: every string literal a wrapper compares a catalogue field against
      must actually occur among that field's values. Scoped to fields the
      catalogue really ships, so viewer-internal fields (`ms_pages_kind` and
      friends, which the wrapper invents) cannot raise false alarms. A check
      that cries wolf gets ignored.
   2. SOFT, printed not asserted: fields a seat ships that the wrapper never
      mentions. Usually deliberate, sometimes a delivery nobody wired up, so
      it earns visibility rather than a failure.

   Claude (ppq architect), 2026-09-05. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PB = process.env.PAPERDATABASES_ROOT || "C:\\CodexProjects\\PaperDatabases";

const CONSUMERS = [
  {
    name: "IB Maths",
    wrapper: path.join(PROJECT_ROOT, "example", "ibmaths.html"),
    catalogue: process.env.MATHS_CATALOGUE_JS || path.join(PB, "Maths Categorisation", "viewer", "maths_catalogue.js")
  },
  {
    name: "Economics",
    wrapper: path.join(PROJECT_ROOT, "example", "economics.html"),
    catalogue: process.env.ECONOMICS_CATALOGUE_PATH || path.join(PB, "Economics Categorisation", "viewer", "economics_catalogue.js")
  }
];

let pass = 0, fail = 0;
function check(cond, msg) { if (cond) { pass++; } else { fail++; console.log("  FAIL: " + msg); } }

/* Every scalar value each field takes, across records and their parts. Capped:
   we only ever ask "does this token occur", never "list them all". */
function fieldValues(records) {
  const map = Object.create(null);
  const note = (k, v) => {
    if (v === null || v === undefined) return;
    if (typeof v === "object") {
      if (Array.isArray(v)) v.forEach((x) => { if (x !== null && typeof x !== "object") add(k, x); });
      return;
    }
    add(k, v);
  };
  const add = (k, v) => {
    const set = map[k] || (map[k] = new Set());
    if (set.size < 4000) set.add(String(v));
  };
  records.forEach((r) => {
    Object.keys(r).forEach((k) => note(k, r[k]));
    (r.parts || []).forEach((p) => { if (p && typeof p === "object") Object.keys(p).forEach((k) => note(k, p[k])); });
  });
  return map;
}

/* `x.field === "token"` and `"token" === x.field`, both equality strengths. */
function testedTokens(src) {
  const pairs = [];
  let m;
  const forward = /\.([A-Za-z_][A-Za-z0-9_]*)\s*===?\s*"([^"\\]{0,80})"/g;
  while ((m = forward.exec(src))) pairs.push([m[1], m[2]]);
  const backward = /"([^"\\]{0,80})"\s*===?\s*[A-Za-z_$][\w$]*\.([A-Za-z_][A-Za-z0-9_]*)/g;
  while ((m = backward.exec(src))) pairs.push([m[2], m[1]]);
  return pairs;
}

function inlineScript(html) {
  const open = html.lastIndexOf("<script>");
  return open < 0 ? html : html.slice(open + "<script>".length, html.indexOf("</script>", open));
}

CONSUMERS.forEach((c) => {
  console.log("\n=== " + c.name + " ===");
  if (!fs.existsSync(c.catalogue)) { console.log("  SKIP: catalogue not found at " + c.catalogue); return; }
  if (!fs.existsSync(c.wrapper)) { console.log("  SKIP: wrapper not found at " + c.wrapper); return; }

  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(c.catalogue, "utf8"), sandbox);
  let records = [];
  Object.keys(sandbox.window).forEach((k) => {
    const v = sandbox.window[k];
    if (Array.isArray(v) && v.length > records.length) records = v;
  });
  check(records.length > 0, c.name + ": the catalogue exposes a record array");
  if (!records.length) return;

  const values = fieldValues(records);
  const src = inlineScript(fs.readFileSync(c.wrapper, "utf8"));
  const pairs = testedTokens(src);

  /* 1. Tokens tested against fields the catalogue actually ships. */
  const checked = [];
  const missing = [];
  pairs.forEach(([field, token]) => {
    if (!values[field]) return;              // viewer-internal field: not ours to police
    if (token === "") return;
    checked.push(field + '="' + token + '"');
    if (!values[field].has(token)) missing.push(field + ' === "' + token + '" (never occurs; field takes ' +
      Array.from(values[field]).slice(0, 4).map((v) => '"' + v + '"').join(", ") +
      (values[field].size > 4 ? ", …" : "") + ")");
  });
  console.log("  " + checked.length + " token comparisons checked against " + records.length + " records");
  missing.forEach((m) => console.log("    MISMATCH: " + m));
  check(missing.length === 0,
    c.name + ": every token the wrapper tests for occurs in the shipped data (" + missing.length + " that do not)");

  /* 2. Fields shipped but never mentioned anywhere in the wrapper. */
  /* Property ACCESS, not any mention: a field named in a comment is not a
     field the wrapper reads, and counting comments would have quietly cleared
     `lead_in` and `phantom_kind` off this list the moment they were described
     in prose. */
  const readsField = (k) => new RegExp("\\.(" + k + ")\\b|\\[\\s*[\"'](" + k + ")[\"']\\s*\\]").test(src);
  const unread = Object.keys(values).filter((k) => !readsField(k)).sort();
  if (unread.length) {
    console.log("  shipped but never referenced by the wrapper (" + unread.length + "): " + unread.join(", "));
    console.log("    (informational: usually deliberate, occasionally a delivery nobody wired up)");
  }
});

console.log("\n==================  " + pass + " passed, " + fail + " failed  ==================");
process.exit(fail ? 1 : 0);
