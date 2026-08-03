/* VSAFE-01/VSAFE-02 regression suite: content-safety gate and honest readiness.

   Verifies, against BOTH synthetic records and the real analysis_v2 bundle:
   - a damaged record can never present as Full or Provisional (any status source);
   - unsafe analysis falls back to the generic shell (withheld == absent, for pupils);
   - all twelve known-damaged records are pinned in the ESAT wrapper and all gate;
   - the damage heuristics catch what they are known to catch, with no false
     positives across the live corpus (new flags are reported, not failed —
     the runtime auto-withholds them, which is the safe direction);
   - the 18 launch-only questions' class of failure (ledger promotes unresolvable
     content) is clamped at engine level.

   Extraction idiom follows test/verify_analysis_presentation.js.
   Viewer-maintained. Claude, 2026-07-28. */
"use strict";
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENGINE = path.join(PROJECT_ROOT, "engine", "ppqviewer.js");
const CSS = path.join(PROJECT_ROOT, "engine", "ppqviewer.css");
const WRAPPER = path.join(PROJECT_ROOT, "example", "esat-compare.html");
const ANALYSIS_ROOT = process.env.ESAT_ANALYSIS_ROOT ||
  "C:\\CodexProjects\\PaperDatabases\\Esat Categorisation\\analysis_v2";
const BUNDLE = path.join(ANALYSIS_ROOT, "dist", "esat_analysis_v2.js");

const src = fs.readFileSync(ENGINE, "utf8");
const cssSrc = fs.readFileSync(CSS, "utf8");
const wrapperSrc = fs.readFileSync(WRAPPER, "utf8");

/* The RS-01 five plus the seven scan findings. ALL TWELVE were repaired by
   PACKET_E01 (2026-08-03, evidence in returns\PACKET_E01\FEEDBACK_E01.md) and
   are heuristic-clean; they stay pinned until the analysis side clears
   `data\withheld_ids.json` and the architect reviews the release (the
   suppression-shrinks-in-step contract). */
const KNOWN_DAMAGED = [
  "esat_engaa_2020_s1_Q04",
  "esat_nsaa_2020_s1_Q25",
  "esat_nsaa_2023_s1_Q27",
  "esat_engaa_2023_s1_Q16",
  "esat_nsaa_2023_s1_Q36",
  "esat_engaa_2019_s1_Q12",
  "esat_nsaa_2019_s1_Q30",
  "esat_engaa_2016_s1_Q12",
  "esat_nsaa_2016_s1_Q27",
  "esat_engaa_2018_s1_Q18",
  "esat_nsaa_2018_s1_Q29",
  "esat_nsaa_2019_s1_Q19"
];
/* The E03 calibration's five disqualifying records (2026-08-03, evidence in
   returns\PACKET_E03\FEEDBACK_E03.md): semantic defects (wrong arithmetic,
   wrong sign law, missing derivations) plus one scanner-evading corruption.
   No scanner can catch these classes; they are pinned on human review. */
const E03_PINNED = [
  "esat_engaa_2017_s1_Q14",
  "esat_nsaa_2018_s1_Q11",
  "esat_nsaa_2017_s1_Q90",
  "esat_engaa_2021_s1_Q37",
  "esat_nsaa_2023_s1_Q35"
];
/* Everything the wrapper must pin, exactly: set-equality is asserted against
   the wrapper source, so a pin can be neither dropped nor added silently. */
const PINNED = KNOWN_DAMAGED.concat(E03_PINNED);
const SOURCE_ADVISORY_IDS = [
  "esat_engaa_2018_s1_Q53",
  "esat_nsaa_2018_s1_Q89",
  "esat_engaa_2016_s1_Q52"
];

// ---- extraction (same idiom as verify_analysis_presentation.js) ------------
function extractStandaloneFn(name) {
  const marker = "function " + name + "(";
  const start = src.indexOf(marker);
  if (start < 0) throw new Error("cannot find standalone " + name);
  const braceOpen = src.indexOf("{", start);
  let depth = 0, end = -1;
  for (let i = braceOpen; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  // eslint-disable-next-line no-eval
  return eval("(" + src.slice(start, end + 1) + ")");
}
function extractFn(name) {
  const marker = "Viewer.prototype." + name + " = function";
  const start = src.indexOf(marker);
  if (start < 0) throw new Error("cannot find " + name);
  const fnStart = src.indexOf("function", start);
  const braceOpen = src.indexOf("{", fnStart);
  let depth = 0, end = -1;
  for (let i = braceOpen; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  // eslint-disable-next-line no-eval
  return eval("(" + src.slice(fnStart, end + 1) + ")");
}

/* Module-scope binding: extracted _contentSafety resolves its free reference
   to scanAnalysisRecordForDamage against THIS name. */
const scanAnalysisRecordForDamage = extractStandaloneFn("scanAnalysisRecordForDamage");
const analysisRecordResolution = extractStandaloneFn("analysisRecordResolution");
const _contentSafety = extractFn("_contentSafety");
const _feedbackReadiness = extractFn("_feedbackReadiness");

// ---- tiny check harness ----------------------------------------------------
let passed = 0, failed = 0;
function section(name) { console.log("\n=== " + name + " ==="); }
function check(cond, label) {
  if (cond) { passed++; }
  else { failed++; console.log("  FAIL: " + label); }
}

// ---- fake viewer ctx -------------------------------------------------------
function makeCtx(opts) {
  opts = opts || {};
  return {
    cfg: {
      idOf: function (q) { return (q && q.id) || "test-question"; },
      analysisOf: opts.analysisOf || function () { return null; },
      feedbackStatusOf: opts.feedbackStatusOf || null,
      contentSafety: {
        withheld: (opts.contentSafety && opts.contentSafety.withheld) || {},
        heuristics: !opts.contentSafety || opts.contentSafety.heuristics !== false
      }
    },
    _safetyCache: null,
    _contentSafety: _contentSafety,
    _feedbackReadiness: _feedbackReadiness
  };
}
function rec(id, text, review) {
  return {
    schema_version: "2.0.0",
    identity: { id: id, correct_answer: "A" },
    pupil_analysis: { first_notice: text },
    options: [], methods: [], self_report_prompts: [], feedback: [],
    review: review ? { status: review } : undefined
  };
}
function readinessOf(ctx, q) { return ctx._feedbackReadiness.call(ctx, q); }
const Q = { id: "q1" };

// ---- synthetic: heuristics -------------------------------------------------
section("damage heuristics on synthetic records");
check(scanAnalysisRecordForDamage(rec("a", "Alpha reduces mass number by 4.")).length === 0,
  "clean text is not flagged");
check(scanAnalysisRecordForDamage(rec("a", "Did you find the wave speed from the wavelength?")).length === 0,
  "ordinary question-mark punctuation is not flagged");
check(scanAnalysisRecordForDamage(rec("a", "mass number ?4 and proton number ?2")).length > 0,
  "'?' fused to digit is flagged");
check(scanAnalysisRecordForDamage(rec("a", "so 238 ? 206 gives the count")).length > 0,
  "'?' between numbers is flagged");
check(scanAnalysisRecordForDamage(rec("a", "construct parent ???X from the charge")).length > 0,
  "repeated '?' is flagged");
check(scanAnalysisRecordForDamage(rec("a", "each row?s mass-number drop")).length > 0,
  "lost apostrophe is flagged");
check(scanAnalysisRecordForDamage(rec("a", "value is \uFFFD J")).length > 0,
  "replacement character is flagged");
check(scanAnalysisRecordForDamage({ identity: { id: "a", crop: "crops/q?4.png" } }).length === 0,
  "URL-ish keys are skipped");
check(scanAnalysisRecordForDamage(rec("a", "value \u202f is missing")).length > 0,
  "standalone narrow-space damage is flagged");
check(scanAnalysisRecordForDamage(rec("a", "Use {{missing_value}} here")).length > 0,
  "unreplaced template placeholders are flagged");

section("record resolvability");
check(analysisRecordResolution(null).resolvable === false, "a missing/non-object record is not resolvable");
check(analysisRecordResolution({ schema_version: "2.0.0", pupil_analysis: { first_notice: "Text" } }).resolvable === false,
  "deep-v2 requires an identity block");
check(analysisRecordResolution({ schema_version: "2.0.0", identity: { id: "x", correct_answer: "A" },
  pupil_analysis: {}, options: [], methods: [], self_report_prompts: [], feedback: [] }).resolvable === false,
  "deep-v2 presence without pupil-facing analysis is not readiness");
check(analysisRecordResolution(rec("x", "Useful pupil analysis")).resolvable === true,
  "a structurally valid deep-v2 record with pupil text resolves");
check(analysisRecordResolution({ id: "legacy", probe: { text: "Useful legacy explanation" }, methods: [] }).resolvable === true,
  "the supported legacy analysis shape still resolves");

// ---- synthetic: _contentSafety precedence ---------------------------------
section("content-safety precedence");
(function () {
  const ctx = makeCtx();
  check(ctx._contentSafety.call(ctx, Q, null).safe === true, "absent record is safe (generic shell handles it)");
  check(ctx._contentSafety.call(ctx, Q, rec("ok", "clean")).safe === true, "clean record is safe");
  const dmg = ctx._contentSafety.call(ctx, Q, rec("bad", "lost ?4 here"));
  check(dmg.safe === false && dmg.reasons.length > 0, "heuristic damage marks record unsafe with reasons");
})();
(function () {
  const ctx = makeCtx({ contentSafety: { withheld: { "pinned": "known damage" } } });
  const r = ctx._contentSafety.call(ctx, Q, rec("pinned", "perfectly clean text"));
  check(r.safe === false && /withheld by consumer: known damage/.test(r.reasons.join(" ")),
    "consumer withheld list marks a clean-looking record unsafe, reason preserved");
})();
(function () {
  const ctx = makeCtx();
  const declared = rec("decl", "clean");
  declared.content_safety = { status: "invalid", reasons: ["bad build"] };
  const r = ctx._contentSafety.call(ctx, Q, declared);
  check(r.safe === false && /declared invalid by content build: bad build/.test(r.reasons.join(" ")),
    "bundle-declared invalid state is honoured");
})();
(function () {
  const ctx = makeCtx({ contentSafety: { heuristics: false } });
  check(ctx._contentSafety.call(ctx, Q, rec("bad", "lost ?4 here")).safe === true,
    "heuristics:false disables the scan (withheld list still available)");
})();
(function () {
  const ctx = makeCtx();
  const a = ctx._contentSafety.call(ctx, Q, rec("memo", "lost ?4 here"));
  const b = ctx._contentSafety.call(ctx, Q, rec("memo", "now clean"));
  check(a === b, "safety is memoised per record id");
})();

// ---- synthetic: readiness can never lie ------------------------------------
section("readiness precedence (VSAFE-02)");
(function () {
  const ctx = makeCtx({ analysisOf: function () { return rec("r", "clean", "reviewed"); } });
  check(readinessOf(ctx, Q).code === "full", "clean reviewed record still presents Full");
})();
(function () {
  const ctx = makeCtx({ analysisOf: function () { return rec("r", "clean", "draft"); } });
  check(readinessOf(ctx, Q).code === "provisional", "clean draft record still presents Provisional");
})();
(function () {
  const ctx = makeCtx();
  check(readinessOf(ctx, Q).code === "pending", "no record presents Solution pending");
})();
(function () {
  const ctx = makeCtx({ analysisOf: function () { return rec("r", "lost ?4", "reviewed"); } });
  const r = readinessOf(ctx, Q);
  check(r.code === "withheld", "damaged record marked reviewed presents withheld, not Full");
  check(r.label === "Solution pending", "withheld shows the pupil the plain Solution pending label");
  check(Array.isArray(r.withheldReasons) && r.withheldReasons.length > 0,
    "withheld readiness carries reviewer-facing reasons");
})();
(function () {
  const ctx = makeCtx({
    analysisOf: function () { return rec("r", "lost ?4", "reviewed"); },
    feedbackStatusOf: function () { return "full_feedback"; }
  });
  check(readinessOf(ctx, Q).code === "withheld", "ledger string cannot override the safety gate");
})();
(function () {
  const ctx = makeCtx({ feedbackStatusOf: function () { return "full_feedback"; } });
  check(readinessOf(ctx, Q).code === "pending",
    "ledger claiming full WITHOUT a resolvable record clamps to pending (the 18-launch-card class)");
})();
(function () {
  const ctx = makeCtx({ feedbackStatusOf: function () { return "provisional_feedback"; } });
  check(readinessOf(ctx, Q).code === "pending",
    "ledger claiming provisional WITHOUT a resolvable record clamps to pending");
})();
(function () {
  const ctx = makeCtx({ feedbackStatusOf: function () { return { code: "full", label: "Full feedback" }; } });
  check(readinessOf(ctx, Q).code === "pending",
    "explicit full OBJECT without a resolvable record clamps to pending");
})();
(function () {
  const ctx = makeCtx({
    analysisOf: function () { return rec("r", "clean", "reviewed"); },
    feedbackStatusOf: function () { return { code: "pending", label: "Solution pending" }; }
  });
  check(readinessOf(ctx, Q).code === "pending", "explicit object may still downgrade a clean record");
})();
(function () {
  const ctx = makeCtx({ analysisOf: function () { return rec("r", "clean"); } });
  const q2 = { id: "q2", feedback_status: "reviewed" };
  check(readinessOf(ctx, q2).code === "full", "catalogue feedback_status still promotes WITH a record behind it");
  const ctx2 = makeCtx();
  check(readinessOf(ctx2, q2).code === "pending", "catalogue feedback_status alone cannot promote");
})();

// ---- source wiring ---------------------------------------------------------
section("engine/wrapper/css wiring");
(function () {
  const ri = src.indexOf("Viewer.prototype._renderInterrogation = function");
  const riEnd = src.indexOf("Viewer.prototype.", ri + 40);
  const riSrc = src.slice(ri, riEnd > 0 ? riEnd : ri + 20000);
  check(riSrc.indexOf("_contentSafety(") >= 0, "_renderInterrogation consults the safety gate");
  check(riSrc.indexOf("contentWithheld") >= 0 && riSrc.indexOf("CONTENT WITHHELD") >= 0,
    "_renderInterrogation exposes the withheld reason to reviewers");
  check(riSrc.indexOf("hasAuthoredAnalysis ? authoredRec :") >= 0,
    "withheld records take the generic fallback shell");
  check(src.indexOf("cfg.contentSafety") >= 0, "config normalisation carries contentSafety");
  check(src.indexOf("analysisRecordResolution(rec)") >= 0,
    "the safety gate validates resolvability rather than record presence");
  check(cssSrc.indexOf(".ppq-feedback-status-withheld") >= 0, "css styles the withheld badge");
  check(/contentSafety:\s*\{/.test(wrapperSrc) && /heuristics:\s*true/.test(wrapperSrc),
    "ESAT wrapper enables the gate with heuristics on");
  PINNED.forEach(function (id) {
    check(wrapperSrc.indexOf('"' + id + '"') >= 0, "wrapper pins " + id);
  });
  const withheldStart = wrapperSrc.indexOf("withheld: {");
  const withheldEnd = wrapperSrc.indexOf("\n          }", withheldStart);
  const withheldSrc = wrapperSrc.slice(withheldStart, withheldEnd);
  const wrapperPinIds = [];
  withheldSrc.replace(/"(esat_[A-Za-z0-9_]+)"\s*:/g, function (all, id) { wrapperPinIds.push(id); return all; });
  check(wrapperPinIds.length === PINNED.length &&
    wrapperPinIds.every(function (id) { return PINNED.indexOf(id) >= 0; }),
    "the wrapper's pin list matches the suite's expected set exactly (" +
    wrapperPinIds.length + " vs " + PINNED.length + ")");
  SOURCE_ADVISORY_IDS.forEach(function (id) {
    check(wrapperSrc.indexOf('"' + id + '"') >= 0, "wrapper advises " + id);
    check(withheldSrc.indexOf(id) < 0, id + " is advisory-only and remains playable");
  });
  check(src.indexOf("cfg.sourceAdvisoryOf") >= 0 && cssSrc.indexOf(".ppq-source-advisory") >= 0,
    "engine exposes and styles the amber source-advisory contract");
})();

// ---- real bundle -----------------------------------------------------------
section("real analysis_v2 bundle");
(function () {
  if (!fs.existsSync(BUNDLE)) {
    console.log("  SKIP: bundle not found at " + BUNDLE);
    return;
  }
  const bsrc = fs.readFileSync(BUNDLE, "utf8");
  const objStart = bsrc.indexOf("{", bsrc.indexOf("var bundle = {"));
  let d = 0, oe = -1;
  for (let i = objStart; i < bsrc.length; i++) { const c = bsrc[i]; if (c === "{") d++; else if (c === "}") { d--; if (d === 0) { oe = i; break; } } }
  const bundle = JSON.parse(bsrc.slice(objStart, oe + 1));
  const byId = {};
  bundle.records.forEach(function (r) { byId[r.identity.id] = r; });
  const ledger = bundle.feedback_status_by_id || {};

  // Wrapper-equivalent config: the pinned list + heuristics.
  const withheld = {};
  PINNED.forEach(function (id) { withheld[id] = "pinned"; });

  PINNED.forEach(function (id) {
    const r = byId[id];
    check(!!r, id + " present in bundle (else this list is stale — re-audit)");
    if (!r) return;
    const ctx = makeCtx({
      analysisOf: function () { return r; },
      feedbackStatusOf: function () { return ledger[id] || null; },
      contentSafety: { withheld: withheld }
    });
    const ready = readinessOf(ctx, { id: id });
    check(ready.code === "withheld",
      id + " gates to withheld (ledger says " + JSON.stringify(ledger[id]) + ")");
    check(ready.label === "Solution pending", id + " shows pupils Solution pending");
  });

  /* Layered accounting per pin, replacing the pre-repair "heuristics must
     catch each" assertions (stale once PACKET_E01 landed): a pin is
     legitimate when the record is still heuristic-flagged, OR the analysis
     side still bakes it withheld in the ledger, OR it is a semantic pin
     (human-review evidence the scanners cannot see). The classification is
     printed so a graduated pin is visible at every gate run. */
  const layers = { heuristic: [], ledger_withheld: [], semantic_pin: [] };
  PINNED.forEach(function (id) {
    const r = byId[id];
    if (!r) return;
    if (scanAnalysisRecordForDamage(r).length) layers.heuristic.push(id);
    else if (ledger[id] === "withheld") layers.ledger_withheld.push(id);
    else layers.semantic_pin.push(id);
  });
  console.log("  pin accounting: " + layers.heuristic.length + " heuristic-flagged, " +
    layers.ledger_withheld.length + " ledger-withheld (repaired, awaiting release review), " +
    layers.semantic_pin.length + " semantic pins (human-review evidence)");
  check(layers.heuristic.length + layers.ledger_withheld.length + layers.semantic_pin.length === PINNED.length,
    "every pinned ID present in the bundle is accounted for by a suppression layer");
  E03_PINNED.forEach(function (id) {
    check(layers.semantic_pin.indexOf(id) >= 0 || layers.heuristic.indexOf(id) >= 0,
      id + " (E03) is pinned by evidence, not by the ledger: the pin must survive analysis-side regeneration");
  });

  // Corpus sweep: report (not fail) anything newly flagged beyond the known set —
  // the runtime will already be withholding it, which is the safe direction.
  const flagged = [];
  Object.keys(byId).forEach(function (id) {
    if (scanAnalysisRecordForDamage(byId[id]).length) flagged.push(id);
  });
  const unexpected = flagged.filter(function (id) { return PINNED.indexOf(id) < 0; });
  if (unexpected.length) {
    console.log("  ATTENTION: heuristics flag " + unexpected.length +
      " record(s) beyond the known-damaged list (auto-withheld at runtime; report to the analysis owner):");
    unexpected.forEach(function (id) {
      console.log("    " + id + " -> " + scanAnalysisRecordForDamage(byId[id]).join("; "));
    });
  } else {
    console.log("  corpus sweep: no flags beyond the known-damaged list (" + flagged.length + " total)");
  }

  // Safety must not have eaten clean Full records: a known-clean reviewed record still presents Full.
  const cleanFull = Object.keys(byId).filter(function (id) {
    return PINNED.indexOf(id) < 0 &&
      byId[id].review && byId[id].review.status === "reviewed" &&
      scanAnalysisRecordForDamage(byId[id]).length === 0;
  });
  check(cleanFull.length > 0, "there exist clean reviewed records");
  if (cleanFull.length) {
    const id = cleanFull[0];
    const ctx = makeCtx({
      analysisOf: function () { return byId[id]; },
      feedbackStatusOf: function () { return ledger[id] || null; },
      contentSafety: { withheld: withheld }
    });
    check(readinessOf(ctx, { id: id }).code === "full",
      "clean reviewed record (" + id + ") still presents Full through the gate");
  }
})();

console.log("\n==================  " + passed + " passed, " + failed + " failed  ==================");
process.exit(failed ? 1 : 0);
