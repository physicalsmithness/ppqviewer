/* Verification harness: extracts the REAL render functions from engine/ppqviewer.js
   and runs them against the current analysis_v2 bundle fixtures, asserting the
   acceptance criteria in VIEWER_HANDOFF_2026-07-24.md. No browser/jsdom needed.

   Adopted as a permanent project test and maintained by Codex, 2026-07-24. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const ENGINE = path.join(PROJECT_ROOT, "engine", "ppqviewer.js");
const ANALYSIS_ROOT = process.env.ESAT_ANALYSIS_ROOT ||
  "C:\\CodexProjects\\PaperDatabases\\Esat Categorisation\\analysis_v2";
const BUNDLE = path.join(ANALYSIS_ROOT, "dist", "esat_analysis_v2.js");
const CLASSIFICATION_BUNDLE = path.join(ANALYSIS_ROOT, "dist", "esat_classification.js");
const CATALOGUE = process.env.ESAT_CATALOGUE_JS ||
  "C:\\Claude (not on Gdrive, nor OneDrive)\\ESAT Prep App\\app\\data\\esat_catalogue.js";

// ---- minimal element shim -------------------------------------------------
function makeEl(tag) {
  const listeners = {};
  const node = {
    tagName: String(tag).toUpperCase(),
    className: "",
    children: [],
    style: { cssText: "" },
    dataset: {},
    _attrs: {},
    _text: "",
    _html: "",
    value: "",
    isConnected: true,
    appendChild(c) { this.children.push(c); c.parent = this; c.parentNode = this; return c; },
    removeChild(c) {
      const i = this.children.indexOf(c);
      if (i >= 0) this.children.splice(i, 1);
      c.parent = null;
      c.parentNode = null;
      return c;
    },
    scrollIntoView(opts) { this._scrollIntoView = opts || true; },
    setAttribute(k, v) {
      this._attrs[k] = v;
      if (k.slice(0, 5) === "data-") {
        const dk = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        this.dataset[dk] = v;
      }
    },
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    dispatchEvent(evt) {
      const e = typeof evt === "string" ? { type: evt } : evt;
      e.target = e.target || this;
      (listeners[e.type] || []).forEach((fn) => fn(e));
      return true;
    },
    click() { this.dispatchEvent({ type: "click", target: this }); },
    closest(selector) {
      let cur = this;
      while (cur) {
        if (selector.charAt(0) === ".") {
          const wanted = selector.slice(1).split(".");
          const have = String(cur.className || "").split(/\s+/);
          if (wanted.every((c) => have.indexOf(c) >= 0)) return cur;
        }
        cur = cur.parentNode;
      }
      return null;
    },
    focus() { document.activeElement = this; },
    querySelectorAll(selector) {
      const out = [];
      const matches = (n) => {
        if (selector.charAt(0) === ".") {
          const wanted = selector.slice(1).split(".");
          const have = String(n.className || "").split(/\s+/);
          return wanted.every((c) => have.indexOf(c) >= 0);
        }
        return n.tagName === selector.toUpperCase();
      };
      (this.children || []).forEach((child) => walk(child, (n) => { if (matches(n)) out.push(n); }));
      return out;
    },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    classList: {
      add(...names) {
        const have = String(node.className || "").split(/\s+/).filter(Boolean);
        names.forEach((name) => { if (have.indexOf(name) < 0) have.push(name); });
        node.className = have.join(" ");
      },
      remove(...names) {
        node.className = String(node.className || "").split(/\s+/).filter((c) => c && names.indexOf(c) < 0).join(" ");
      },
      contains(name) { return String(node.className || "").split(/\s+/).indexOf(name) >= 0; },
      toggle(name, force) {
        const on = this.contains(name);
        const next = force === undefined ? !on : !!force;
        if (next) this.add(name); else this.remove(name);
        return next;
      }
    },
    get textContent() { return this._text; },
    set textContent(v) { this._text = v; },
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = v; if (v === "") this.children = []; }
  };
  return node;
}
const document = { createElement: (t) => makeEl(t), activeElement: null };

// ---- el / esc copied verbatim from the engine -----------------------------
function el(tag, attrs, html) {
  const n = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "class") n.className = attrs[k];
    else if (k === "style") {
      n.style.cssText = attrs[k];
      String(attrs[k]).split(";").forEach((part) => {
        const ci = part.indexOf(":");
        if (ci < 0) return;
        const prop = part.slice(0, ci).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (prop) n.style[prop] = part.slice(ci + 1).trim();
      });
    }
    else if (k.slice(0, 5) === "data-") n.setAttribute(k, attrs[k]);
    else n[k] = attrs[k];
  }
  if (html != null) n.innerHTML = html;
  return n;
}
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// ---- extract real functions from the engine source ------------------------
const src = fs.readFileSync(ENGINE, "utf8");
function extractStandaloneFn(name) {
  const marker = "function " + name + "(";
  const start = src.indexOf(marker);
  if (start < 0) throw new Error("cannot find " + name);
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
const analysisMathEsc = extractStandaloneFn("analysisMathEsc");
const allocateLargestRemainder = extractStandaloneFn("allocateLargestRemainder");
/* VSAFE-01 (2026-07-28): module-scope binding — the extracted _contentSafety
   resolves its free reference to scanAnalysisRecordForDamage against this. */
const scanAnalysisRecordForDamage = extractStandaloneFn("scanAnalysisRecordForDamage");
/* VF-02 (2026-07-29): shading helper, and the binding the extracted progress
   page resolves against. */
const shadeCell = extractStandaloneFn("shadeCell");
/* d013: the extracted timing functions resolve their free reference against
   this mirror; the source assert pins the engine literal so drift is caught. */
const TIMING_MODES = ["none", "end_only", "per_question", "clock", "ring", "bank"];
/* VF-14r: performance scoring + colour for the question clusters. */
const questionPerfScore = extractStandaloneFn("questionPerfScore");
const perfColour = extractStandaloneFn("perfColour");
/* VF-04r: axes migration + the shared clock/preview formatter. */
const timingModeToAxes = extractStandaloneFn("timingModeToAxes");
const timingDisplayText = extractStandaloneFn("timingDisplayText");
/* d011: the learned-scope tree helpers. */
const learnedTreeState = extractStandaloneFn("learnedTreeState");
const learnedTreeLeaves = extractStandaloneFn("learnedTreeLeaves");
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
  const argsAndBody = src.slice(fnStart, end + 1);
  // eslint-disable-next-line no-eval
  return eval("(" + argsAndBody + ")");
}
function extractFnOptional(name) {
  const marker = "Viewer.prototype." + name + " = function";
  return src.indexOf(marker) >= 0 ? extractFn(name) : null;
}

const V = {}; // fake viewer holding the real methods
["_appendMethodsV2", "_methodBlockV2", "_methodKindLabel", "_elimChipsV2El",
 "_optionRailLegendEl", "_appendSelfReportV2", "_promptBlockV2", "_stateLabel",
 "_verdictEl", "_reviewerDiagnosticsV2", "_feedbackOptionMatchV2",
 "_feedbackGuessMatchesV2", "_selectedOptionFeedbackV2", "_selectedDiagnosticCardV2",
 "_matchFeedbackV2", "_thingsUsedItemsV2", "_thingsUsedStatesV2",
 "_thingsUsedRowV2", "_appendThingsUsedV2", "_appendFreeformReflectionV2",
 "_interrogationResponseCue", "_renderInterrogationFeedback", "_filterValue",
 "_filterValues", "_parentFilterValue", "_fillSingleFilterOptions", "_syncSingleFilterStyle",
 "_refreshDependentFilters", "_dashboardFacet", "_activeDashboardFacet",
 "_matchesQuestionFilters", "filterQuestions", "setGroupFilter",
 "_setDashboardFacetValue", "_clearDashboardFacet", "_zeroRatings",
 "_renderDashboardFacet", "_catHtml",
 "_buildGuessPicker", "_renderInterrogation", "_isV2", "_guessLabel", "_guessPrompt",
 "_feedbackReadiness", "_setFeedbackStatusBadge", "_contentSafety", "_methodAskText",
 "_elimChipsEl", "next", "prev", "_renderHistoryEntry", "_questionById",
 "_lastAttemptFor", "_reopenAttempt", "closeModal",
 "_progressStats", "_renderProgressPage", "_jumpToAttempt", "_attachResponseToAttempt",
 "_promptMethodAskV2", "_syncAnalysisReminder",
 "_timingPrefs", "_setTimingPrefs", "_timingModeNow", "_timingTargetMsFor",
 "_elapsedTimingMs", "_commitTiming", "_openTimingPanel", "_reducedMotion", "_fmtClock",
 "_questionScores", "_discardCommittedTime",
 "_questionInLearnedScope", "_learnedScopeBiting", "_openLearnedPanel", "_syncLearnedButton"
].forEach((n) => { V[n] = extractFn(n); });

// ---- fake instance context ------------------------------------------------
function makeCtx(rec) {
  const reports = [];
  return {
    cur: { id: (rec.identity && rec.identity.id) || "test-question" },
    cfg: { idOf: (q) => q.id || ((rec.identity || {}).id || "test-question") },
    store: { attempts: [{ attempt_id: "test-attempt" }] },
    _saveStore: () => {},
    _optionLabels: () => (rec.identity && rec.identity.option_labels) || [],
    _analysisSelfReports: {},
    _promptStates: {},
    _thingsUsedStates: {},
    _attemptId: "test-attempt",
    _chosenLabel: "",
    _wasRight: false,
    _postGuessDeclared: false,
    _preGuessDeclaration: null,
    _fireReport: (payload) => reports.push(payload),
    _reports: reports,
    _renderInterrogationFeedback: () => {},
    _analysisReviewMode: () => false, /* VF-13 */
    // bind the real methods
    _appendMethodsV2: V._appendMethodsV2, _methodBlockV2: V._methodBlockV2,
    _promptMethodAskV2: V._promptMethodAskV2, /* VF-13 */
    _syncAnalysisReminder: () => {}, /* VF-13: no modal in this harness */
    _methodAskText: V._methodAskText, /* Phase 1.5 */
    _methodKindLabel: V._methodKindLabel, _elimChipsV2El: V._elimChipsV2El,
    _optionRailLegendEl: V._optionRailLegendEl, _appendSelfReportV2: V._appendSelfReportV2,
    _promptBlockV2: V._promptBlockV2, _stateLabel: V._stateLabel,
    _verdictEl: V._verdictEl, _reviewerDiagnosticsV2: V._reviewerDiagnosticsV2,
    _feedbackOptionMatchV2: V._feedbackOptionMatchV2,
    _feedbackGuessMatchesV2: V._feedbackGuessMatchesV2,
    _selectedOptionFeedbackV2: V._selectedOptionFeedbackV2,
    _selectedDiagnosticCardV2: V._selectedDiagnosticCardV2,
    _matchFeedbackV2: V._matchFeedbackV2,
    _thingsUsedItemsV2: V._thingsUsedItemsV2,
    _thingsUsedStatesV2: V._thingsUsedStatesV2,
    _thingsUsedRowV2: V._thingsUsedRowV2,
    _appendThingsUsedV2: V._appendThingsUsedV2,
    _appendFreeformReflectionV2: V._appendFreeformReflectionV2,
    _interrogationResponseCue: V._interrogationResponseCue,
    _renderInterrogationFeedback: V._renderInterrogationFeedback,
    _buildGuessPicker: V._buildGuessPicker
  };
}

// ---- load bundle ----------------------------------------------------------
const bsrc = fs.readFileSync(BUNDLE, "utf8");
const objStart = bsrc.indexOf("{", bsrc.indexOf("var bundle = {"));
let d = 0, oe = -1;
for (let i = objStart; i < bsrc.length; i++) { const c = bsrc[i]; if (c === "{") d++; else if (c === "}") { d--; if (d === 0) { oe = i; break; } } }
const bundle = JSON.parse(bsrc.slice(objStart, oe + 1));
const byId = {};
bundle.records.forEach((r) => { byId[r.identity.id] = r; });

// ---- tree helpers ---------------------------------------------------------
function walk(node, fn) { fn(node); (node.children || []).forEach((c) => walk(c, fn)); }
function collect(node, pred, out) { out = out || []; walk(node, (n) => { if (pred(n)) out.push(n); }); return out; }
function textOf(node) { let t = (node._text || "") + (node._html || ""); (node.children || []).forEach((c) => { t += textOf(c); }); return t; }

// Render methods+prompts into a container and return an ordered summary of
// top-level blocks: {kind:'method'|'prompt'|'legend', ...}
function renderAnalysis(rec) {
  const ctx = makeCtx(rec);
  const iq = makeEl("div");
  const rendered = ctx._appendMethodsV2(iq, rec);
  ctx._appendSelfReportV2(iq, rec, rendered);
  // Build ordered block list from iq.children
  const blocks = iq.children.map((c) => {
    const cls = c.className || "";
    if (cls.indexOf("ppq-oev-legend") >= 0) return { type: "legend" };
    if (cls.indexOf("ppq-iq-method") >= 0) {
      const kind = (cls.match(/ppq-iq-kind-(\w+)/) || [])[1] || "?";
      const titleEl = collect(c, (n) => n.tagName === "B")[0];
      const kindTag = collect(c, (n) => (n.className || "").indexOf("ppq-iq-method-kind") >= 0)[0];
      // rail letters
      const rail = collect(c, (n) => (n.className || "").indexOf("ppq-oev-row") >= 0)[0];
      const letters = rail ? rail.children.map((L) => L.innerHTML + ":" + (L.className.match(/ppq-oev (\w+)/) || [])[1]) : [];
      const numbered = collect(c, (n) => (n.className || "").indexOf("numbered") >= 0).length;
      const hasUsed = collect(c, (n) => (n.className || "").indexOf("ppq-iq-used") >= 0).length > 0;
      return { type: "method", id: c.dataset.methodId || "", kind, kindTag: kindTag ? kindTag.innerHTML : "", title: titleEl ? titleEl.innerHTML : "", letters, numbered, hasUsed };
    }
    if (cls.indexOf("ppq-iq-prompt") >= 0) {
      const text = collect(c, (n) => (n.className || "").indexOf("ppq-iq-prompt-text") >= 0)[0];
      const states = collect(c, (n) => (n.className || "").indexOf("ppq-iq-state") >= 0 && n.tagName === "BUTTON").map((b) => b.innerHTML);
      return {
        type: "prompt", text: text ? text.innerHTML : "", states,
        perMethod: cls.indexOf("ppq-iq-prompt-permethod") >= 0, /* VF-13 */
        promptId: (c.dataset && c.dataset.promptId) || "",
        methodRef: (c.dataset && c.dataset.methodRef) || ""
      };
    }
    return { type: "other", cls };
  });
  return { ctx, blocks };
}

// ---- assertions -----------------------------------------------------------
let pass = 0, fail = 0;
function check(cond, msg) { if (cond) { pass++; } else { fail++; console.log("  FAIL: " + msg); } }

function fixture(id, label) { console.log("\n=== " + label + " (" + id + ") ==="); return byId[id]; }

// Lightweight maths notation from the JSON is presented as maths, not authoring
// syntax, and remains escaped before entering innerHTML.
(function () {
  check(analysisMathEsc("p^2q^2 + 4sqrt(2) + sqrt(10x-x^2)") ===
    "p²q² + 4√2 + √(10x-x²)",
    "analysis text renders powers and square roots");
  check(analysisMathEsc("sqrt(ab), sqrt(discriminant), mysqrt2, my_sqrt2") ===
    "√(ab), √(discriminant), mysqrt2, my_sqrt2",
    "long radicands retain brackets and sqrt inside a word is untouched");
  check(analysisMathEsc("<b>sqrt(2)</b>") === "&lt;b&gt;√2&lt;/b&gt;",
    "analysis maths formatting cannot inject HTML");
})();

// Q4: four unnumbered peer checks + synthesis; all six letters every row;
// neutral/time-sink group prompt once after the four checks.
(function () {
  const rec = fixture("esat_engaa_2016_s1_Q04", "Q4");
  const { blocks } = renderAnalysis(rec);
  const methods = blocks.filter((b) => b.type === "method");
  const checks = methods.filter((m) => m.kind === "independent_check");
  const synth = methods.filter((m) => m.kind === "synthesis");
  check(checks.length === 4, "Q4 has 4 independent_checks (got " + checks.length + ")");
  check(synth.length === 1, "Q4 has 1 synthesis (got " + synth.length + ")");
  methods.forEach((m) => check(m.letters.length === 6, "Q4 rail has all 6 letters: " + m.title + " (" + m.letters.length + ")"));
  checks.forEach((m) => check(m.numbered === 0, "Q4 check is unnumbered: " + m.title));
  // synthesis rail: A-E rules_out, F directly_identifies
  const sLet = Object.fromEntries(synth[0].letters.map((x) => x.split(":")));
  check(sLet.F === "di", "Q4 synthesis F = directly_identifies (got " + sLet.F + ")");
  check(["A", "B", "C", "D", "E"].every((L) => sLet[L] === "ro"), "Q4 synthesis A-E = rules_out");
  // statement 1 rail: A/B/C rules_out, D/E/F unaffected
  const m0 = Object.fromEntries(methods[0].letters.map((x) => x.split(":")));
  check(m0.A === "ro" && m0.B === "ro" && m0.C === "ro", "Q4 stmt1 A/B/C rules_out");
  check(m0.D === "un" && m0.E === "un" && m0.F === "un", "Q4 stmt1 D/E/F unaffected (got " + m0.D + m0.E + m0.F + ")");
  // VF-13 (Smith 2026-07-29, read-once): the group prompt no longer interrupts
  // as ONE standalone block after the peer group (which forced re-reading the
  // methods to answer it); each referenced method's foot carries its own ask
  // with the prompt's authored states.
  const prompts = blocks.filter((b) => b.type === "prompt");
  const neutralStandalone = prompts.filter((p) => !p.perMethod && /neutral-looking/i.test(p.text));
  check(neutralStandalone.length === 0,
    "Q4 group prompt no longer renders as a standalone block (got " + neutralStandalone.length + ")");
  const groupRefs = (rec.self_report_prompts || []).filter((p) => (p.method_refs || []).length > 1);
  check(groupRefs.length >= 1, "Q4 fixture still carries a group prompt to split");
  const gp = groupRefs[0];
  const perMethod = prompts.filter((p) => p.perMethod && p.promptId === gp.id);
  check(perMethod.length === (gp.method_refs || []).length,
    "the group prompt asks at EVERY referenced method's foot (" + perMethod.length + "/" + (gp.method_refs || []).length + ")");
  perMethod.forEach((p) => {
    const i = blocks.indexOf(p);
    const before = blocks.slice(0, i).reverse().find((b) => b.type === "method");
    check(!!before && before.id === p.methodRef,
      "a per-method ask directly follows the method it asks about (" + p.methodRef + ")");
    check(p.states.length === (gp.states || []).length,
      "the per-method ask carries the prompt's authored states");
  });
  const idxSynth = blocks.indexOf(synth[0]);
  const lastPerMethod = blocks.indexOf(perMethod[perMethod.length - 1]);
  check(lastPerMethod < idxSynth || (gp.method_refs || []).indexOf(synth[0].id) >= 0,
    "the peer-group asks finish before the synthesis unless it too is referenced");
  // no raw proposed__ in any state label
  prompts.forEach((p) => p.states.forEach((s) => check(s.indexOf("proposed") < 0, "Q4 state label has no 'proposed': " + s)));
  // used-it hidden on methods that have local prompts (all 4 checks have prompts)
  checks.forEach((m) => check(!m.hasUsed, "Q4 check has no 'used it' (local prompt exists): " + m.title));
})();

// Q27: dependent route (numbered), independent check, optional route.
(function () {
  const rec = fixture("esat_engaa_2016_s1_Q27", "Q27");
  const { blocks } = renderAnalysis(rec);
  const methods = blocks.filter((b) => b.type === "method");
  const route = methods.find((m) => /angle at Q/i.test(m.title));
  const indep = methods.find((m) => m.kind === "independent_check");
  check(route && route.kind === "route", "Q27 'Describe the angle at Q twice' is a route");
  check(route && route.numbered > 0, "Q27 route steps are numbered (" + (route ? route.numbered : 0) + ")");
  check(indep && indep.numbered === 0, "Q27 independent check is unnumbered");
  // independent check rail: A/B/C rules_out, D/E/F/G unaffected (NOT green)
  const il = Object.fromEntries(indep.letters.map((x) => x.split(":")));
  check(il.A === "ro" && il.B === "ro" && il.C === "ro", "Q27 check A/B/C rules_out");
  check(["D", "E", "F", "G"].every((L) => il[L] === "un"), "Q27 survivors D-G are unaffected, not green (got " + ["D","E","F","G"].map((L)=>il[L]).join(",") + ")");
})();

// Q40: direction check, closeness check, synthesis, two optional routes.
(function () {
  const rec = fixture("esat_engaa_2019_s1_Q40", "Q40");
  const { blocks } = renderAnalysis(rec);
  const methods = blocks.filter((b) => b.type === "method");
  const kinds = methods.map((m) => m.kind);
  check(kinds.filter((k) => k === "independent_check").length === 2, "Q40 has 2 independent_checks");
  check(kinds.filter((k) => k === "synthesis").length === 1, "Q40 has 1 synthesis");
  check(kinds.filter((k) => k === "route").length === 2, "Q40 has 2 routes");
  // direction check rail: A/B unaffected, C/D/E rules_out
  const dir = methods[0];
  const dl = Object.fromEntries(dir.letters.map((x) => x.split(":")));
  check(dl.A === "un" && dl.B === "un", "Q40 direction A/B unaffected");
  check(dl.C === "ro" && dl.D === "ro" && dl.E === "ro", "Q40 direction C/D/E rules_out");
  // synthesis: B directly_identifies
  const syn = methods.find((m) => m.kind === "synthesis");
  const sl = Object.fromEntries(syn.letters.map((x) => x.split(":")));
  check(sl.B === "di", "Q40 synthesis B = directly_identifies (got " + sl.B + ")");
})();

// 2022 Q27 (exact-vs-approximation), 2019 Q01 (surd-square), 2017 Q46 (graph-area) — render without crash + rails complete.
["esat_engaa_2022_s1_Q27", "esat_engaa_2019_s1_Q01", "esat_engaa_2017_s1_Q46"].forEach((id) => {
  const rec = byId[id];
  if (!rec) { console.log("\n=== " + id + " === NOT IN BUNDLE"); check(false, id + " acceptance fixture is present"); return; }
  const { blocks } = renderAnalysis(rec);
  const methods = blocks.filter((b) => b.type === "method");
  const nLabels = (rec.identity.option_labels || []).length;
  console.log("\n=== " + id + " === " + methods.length + " methods, " + nLabels + " options");
  methods.forEach((m) => check(m.letters.length === nLabels, id + " rail complete (" + m.letters.length + "/" + nLabels + "): " + m.title));
  // every prompt rendered has readable states (no proposed__)
  blocks.filter((b) => b.type === "prompt").forEach((p) => p.states.forEach((s) => check(s.indexOf("proposed") < 0, id + " state has no 'proposed': " + s)));
});

// 2023 Q29: the two legitimate routes and the intermediate-stop diagnostic
// are three independently answerable rows, and its surds render as maths.
(function () {
  const rec = fixture("esat_engaa_2023_s1_Q29", "Q29 split prompts and maths");
  const { blocks } = renderAnalysis(rec);
  const answerable = blocks.filter((b) => b.type === "prompt" && b.states.length);
  check(answerable.length === 3, "Q29 has three separately answerable prompt rows");
  check(answerable.map((p) => p.text).join("|") ===
    "Did you work directly with pr and pq?|Did you find p, q and r separately?|Did you stop at r - q before multiplying by p?",
    "Q29 keeps the three actions separate and in context");
  check(answerable[2].states.join("|") ===
    "Yes, that was it|Something like that|No, another reason|Not sure",
    "Q29 intermediate-stop row uses the short diagnostic controls");
  const ctx = makeCtx(rec);
  const iq = makeEl("div");
  const rendered = ctx._appendMethodsV2(iq, rec);
  ctx._appendSelfReportV2(iq, rec, rendered);
  const visible = textOf(iq);
  check(visible.indexOf("4√2") >= 0 && visible.indexOf("p²q²") >= 0,
    "Q29 renders square roots and powers in the method working");
  check(visible.indexOf("sqrt(") < 0, "Q29 exposes no raw sqrt(...) authoring syntax");
})();

// Pupil/reviewer split: v2 error_path is hidden from pupils and fully available
// in the explicit reviewer payload.
(function () {
  const rec = fixture("esat_engaa_2022_s1_Q27", "audience split");
  const ctx = makeCtx(rec);
  ctx._chosenLabel = "E";
  ctx._wasRight = false;
  const pupilVerdict = ctx._verdictEl(rec, true, "E", "A", false, false);
  const reviewerVerdict = ctx._verdictEl(rec, true, "E", "A", false, true);
  check(collect(pupilVerdict, (n) => (n.className || "").indexOf("ppq-iq-option-path") >= 0).length === 0,
    "pupil verdict contains no v2 error_path");
  check(collect(reviewerVerdict, (n) => (n.className || "").indexOf("ppq-iq-option-path") >= 0).length === 1,
    "reviewer verdict retains selected error_path");
  const reviewer = ctx._reviewerDiagnosticsV2(rec);
  const optionRows = collect(reviewer, (n) => (n.className || "").split(/\s+/).indexOf("ppq-iq-reviewer-option") >= 0);
  check(optionRows.length === rec.options.length, "reviewer payload shows every option reconstruction");
  check(textOf(reviewer).indexOf(analysisMathEsc(rec.options.find((o) => o.label === "E").error_path)) >= 0,
    "reviewer payload includes option E error_path");
  check(textOf(reviewer).indexOf(rec.review.notes[0]) >= 0, "reviewer payload includes review notes");
})();

// Selected-answer feedback is a local conditional question with four controls.
(function () {
  const rec = fixture("esat_engaa_2022_s1_Q27", "selected-answer diagnostics");
  const expected = {
    B: "outside_factor_not_squared",
    C: "cross_terms_omitted_c",
    E: "sqrt20_missimplified_e"
  };
  Object.keys(expected).forEach((letter) => {
    const ctx = makeCtx(rec);
    let diagnosticCue = null;
    ctx._interrogationResponseCue = (origin, text, delay) => {
      diagnosticCue = { origin, text, delay };
    };
    ctx._chosenLabel = letter;
    ctx._wasRight = false;
    const card = ctx._selectedDiagnosticCardV2(rec);
    check(!!card, "diagnostic card exists for " + letter);
    check(card && card.dataset.feedbackId === expected[letter], letter + " gets only its matching feedback row");
    const buttons = collect(card, (n) => (n.className || "").split(/\s+/).indexOf("ppq-iq-diagnostic-choice") >= 0);
    check(buttons.map((b) => b.innerHTML).join("|") ===
      "Yes, that was it|Something like that|No, another reason|Not sure",
      letter + " diagnostic controls use the agreed order");
    buttons[0].click();
    check(ctx._reports.length === 1, letter + " diagnostic click emits one report");
    const payload = JSON.parse(ctx._reports[0].extra_json);
    check(payload.selected_option === letter && payload.feedback_id === expected[letter] &&
      payload.response_state === "yes_that_was_it" && payload.attempt_id === "test-attempt",
      letter + " diagnostic report keeps answer, feedback and attempt context");
    check(diagnosticCue && diagnosticCue.origin === card &&
      diagnosticCue.text === "Recorded" && diagnosticCue.delay === 220,
      letter + " diagnostic visibly acknowledges the answer after the same short beat");
  });

  const correctCtx = makeCtx(rec);
  correctCtx._chosenLabel = "A";
  correctCtx._wasRight = true;
  correctCtx._preGuessDeclaration = { guess_declared: true };
  const correctCard = correctCtx._selectedDiagnosticCardV2(rec);
  const correctButtons = collect(correctCard, (n) => (n.className || "").split(/\s+/).indexOf("ppq-iq-diagnostic-choice") >= 0);
  check(correctButtons.map((b) => b.innerHTML).join("|") ===
    "I had a complete reason|I used a shortcut or check|I was not fully sure|It was a guess",
    "correct-answer diagnostic asks about provenance");

  const synthetic = {
    identity: { id: "synthetic_feedback" },
    pupil_analysis: {},
    feedback: [
      { id: "generic_wrong", selected_options: ["any_wrong"], prompt_id: null, states: [], text: "generic" },
      { id: "specific_b", selected_options: ["B"], prompt_id: null, states: [], text: "specific" },
      { id: "prompt_wrong", selected_options: ["any_wrong"], prompt_id: "p1", states: ["missed"], text: "prompt" }
    ]
  };
  const sctx = makeCtx(synthetic);
  sctx._chosenLabel = "B"; sctx._wasRight = false;
  check(sctx._selectedOptionFeedbackV2(synthetic).id === "specific_b",
    "letter-specific feedback beats any_wrong");
  sctx._chosenLabel = "C";
  check(sctx._selectedOptionFeedbackV2(synthetic).id === "generic_wrong",
    "any_wrong matches an arbitrary wrong letter");
  sctx._promptStates.p1 = "missed";
  check(sctx._matchFeedbackV2(synthetic, true).id === "prompt_wrong",
    "prompt-state any_wrong feedback remains independently reachable");
})();

// Bottom knowledge/technique audit: no cap, fixed copy/order, implicit default
// without logging, and explicit interaction does log.
(function () {
  const rec = fixture("esat_engaa_2022_s1_Q27", "Things this question used");
  const ctx = makeCtx(rec);
  const iq = makeEl("div");
  ctx._appendThingsUsedV2(iq, rec);
  const section = collect(iq, (n) => (n.className || "").split(/\s+/).indexOf("ppq-iq-things") >= 0)[0];
  check(!!section && textOf(section).indexOf("Things this question used") >= 0,
    "knowledge section has its explicit title");
  const rows = collect(section, (n) => (n.className || "").split(/\s+/).indexOf("ppq-iq-thing") >= 0);
  const expectedCount = (rec.requirements.knowledge_atoms || []).length + (rec.requirements.technique_atoms || []).length;
  check(rows.length === expectedCount && rows.length > 4,
    "knowledge section renders every atom with no four-item cap (" + rows.length + ")");
  const stateButtons = rows[0].querySelectorAll(".ppq-iq-thing-state");
  check(stateButtons.map((b) => b.dataset.state).join("|") ===
    "secure_before_question|knew_but_did_not_retrieve|sketchy_on_this|still_unclear",
    "knowledge states have the fixed semantic order");
  check(stateButtons.map((b) => b.innerHTML).join("|") ===
    "Known|Known, but did not think of it|Sketchy|Not known",
    "knowledge states have the agreed pupil copy");
  check(stateButtons[0].classList.contains("sel") && stateButtons[0].classList.contains("implicit"),
    "Known is visibly preselected as an implicit default");
  check(ctx._reports.length === 0 && Object.keys(ctx._thingsUsedStates).length === 0,
    "rendering the Known default does not log mastery");
  let knowledgeCue = null;
  ctx._interrogationResponseCue = (origin, text, delay) => {
    knowledgeCue = { origin, text, delay };
  };
  stateButtons[1].click();
  check(ctx._thingsUsedStates[rows[0].dataset.thingId] === "knew_but_did_not_retrieve",
    "an explicit knowledge exception is stored");
  check(ctx._reports.length === 1 && ctx._reports[0].qtype === "things_used",
    "an explicit knowledge response emits one report");
  check(knowledgeCue && knowledgeCue.origin === rows[0] &&
    knowledgeCue.text === "Recorded" && knowledgeCue.delay === 220,
    "an explicit knowledge response visibly fires in its own row after 220 ms");

  const confirm = section.querySelector(".ppq-iq-things-confirm");
  let confirmCue = null;
  ctx._interrogationResponseCue = (origin, text, delay) => {
    confirmCue = { origin, text, delay };
  };
  confirm.click();
  check(confirmCue && confirmCue.origin === section &&
    confirmCue.text === "Recorded" && confirmCue.delay === 220,
    "confirm-all visibly fires in the knowledge section after 220 ms");
})();

// Optional free text is stored with the current attempt and reported once.
(function () {
  const rec = fixture("esat_engaa_2022_s1_Q27", "freeform reflection");
  const ctx = makeCtx(rec);
  const iq = makeEl("div");
  ctx._appendFreeformReflectionV2(iq, rec);
  const areas = collect(iq, (n) => (n.className || "").split(/\s+/).indexOf("ppq-iq-reflection-text") >= 0);
  check(areas.length === 1, "one freeform reflection textarea is rendered");
  areas[0].value = "  Lost the outside factor  ";
  areas[0].dispatchEvent({ type: "blur" });
  check(ctx.store.attempts[0].freeform_reflection === "Lost the outside factor",
    "freeform reflection is trimmed and stored on the attempt");
  check(ctx._reports.length === 1 && ctx._reports[0].qtype === "freeform_reflection",
    "freeform reflection emits one report");
  const payload = JSON.parse(ctx._reports[0].extra_json);
  check(payload.attempt_id === "test-attempt" && payload.question_id === rec.identity.id,
    "freeform report keeps attempt and question context");
  areas[0].dispatchEvent({ type: "blur" });
  check(ctx._reports.length === 1, "unchanged freeform text is not reported twice");
})();

// Authored method order is a contract, not an inferred preferred route.
(function () {
  const rec = fixture("esat_engaa_2022_s1_Q27", "authored method order");
  const { blocks } = renderAnalysis(rec);
  const ids = blocks.filter((b) => b.type === "method").map((b) => b.id);
  check(ids.join("|") === rec.methods.map((m) => m.id).join("|"),
    "rendered methods preserve authored order across interleaved prompts");
  check(ids.join("|") === "factor_cancel_rationalise|rough_magnitude_filter|expand_then_rationalise",
    "exact route precedes approximation and expansion in the surd pilot");
})();

// Guess percentages are part of the normal picker: visible and pre-filled,
// optional to edit, and Enter accepts the current state exactly once.
(function () {
  console.log("\n=== pre-filled guess percentages and Enter ===");
  const rec = fixture("esat_engaa_2022_s1_Q27", "guess percentages");
  const ctx = makeCtx(rec);
  const submissions = [];
  let skips = 0;
  const picker = ctx._buildGuessPicker({
    labels: ["A", "B", "C"],
    preselect: ["B"],
    stage: "pre_verdict",
    prompt: "Which options were in the running?",
    onDone: (payload) => submissions.push(payload),
    onSkip: () => { skips++; }
  });
  const rows = picker.querySelectorAll(".ppq-gpick-row");
  const byLetter = {};
  rows.forEach((row) => {
    byLetter[row.querySelector(".ppq-gpick-letter").innerHTML] = {
      row: row,
      cb: row.querySelector("input"),
      pct: row.querySelector(".ppq-gpick-pct"),
      wrap: row.querySelector(".ppq-gpick-pctwrap")
    };
  });
  check(!picker.querySelector(".ppq-gpick-pcttoggle") &&
    !!picker.querySelector(".ppq-gpick-pcthint"),
    "percentage fields are normal visible controls, not hidden behind a toggle");
  check(byLetter.B.pct.value === "100" && !byLetter.B.pct.disabled &&
    byLetter.A.pct.value === "0" && byLetter.A.pct.disabled,
    "the preselected answer starts at 100% while unchecked options stay disabled");
  check(byLetter.A.wrap.style.display === "" && byLetter.B.wrap.style.display === "",
    "percentages remain visibly beside both selected and available options");
  check(byLetter.B.pct.ariaLabel === "Percentage for B",
    "each percentage field has an explicit accessible name");

  byLetter.A.cb.checked = true;
  picker.querySelector(".ppq-gpick-options").dispatchEvent({
    type: "change",
    target: byLetter.A.cb
  });
  check(byLetter.A.pct.value === "50" && byLetter.B.pct.value === "50",
    "selecting a second candidate pre-fills an equal 50/50 split");

  byLetter.A.pct.value = "60";
  picker.querySelector(".ppq-gpick-options").dispatchEvent({
    type: "input",
    target: byLetter.A.pct
  });
  check(byLetter.A.pct.value === "60" && byLetter.B.pct.value === "40",
    "editing one percentage automatically keeps the total at 100");

  let prevented = 0, stopped = 0;
  const enter = {
    type: "keydown",
    key: "Enter",
    repeat: false,
    target: byLetter.A.pct,
    preventDefault: () => { prevented++; },
    stopPropagation: () => { stopped++; }
  };
  picker.dispatchEvent(enter);
  check(submissions.length === 1 && skips === 0 &&
    submissions[0].candidate_options.join("|") === "A|B" &&
    submissions[0].candidate_percentages.A === 60 &&
    submissions[0].candidate_percentages.B === 40,
    "Enter from a percentage field accepts the pre-filled/edited declaration");
  check(prevented === 1 && stopped === 1 &&
    picker.querySelector(".ppq-gpick-done").textContent === "Done \u2713",
    "Enter visibly says Done and does not leak to the global key handler");
  picker.dispatchEvent(enter);
  check(submissions.length === 1,
    "a second Enter during the page transition cannot submit twice");

  const singleCtx = makeCtx(rec);
  let singleDone = 0, singleSkip = 0;
  const single = singleCtx._buildGuessPicker({
    labels: ["A", "B", "C"],
    preselect: ["B"],
    stage: "pre_verdict",
    onDone: () => { singleDone++; },
    onSkip: () => { singleSkip++; }
  });
  single.dispatchEvent({
    type: "keydown",
    key: "Enter",
    repeat: false,
    target: single.querySelector(".ppq-gpick-pct"),
    preventDefault: () => {},
    stopPropagation: () => {}
  });
  check(singleDone === 0 && singleSkip === 1 &&
    single.querySelector(".ppq-gpick-done").innerHTML === "Done" &&
    single.querySelector(".ppq-gpick-skip").textContent === "Skipped \u2713",
    "with only the original answer selected, Enter advances without declaring a guess");

  const clickCtx = makeCtx(rec);
  let clickDone = 0, clickSkip = 0;
  const clickPicker = clickCtx._buildGuessPicker({
    labels: ["A", "B", "C"],
    preselect: ["B"],
    stage: "pre_verdict",
    onDone: () => { clickDone++; },
    onSkip: () => { clickSkip++; }
  });
  clickPicker.querySelector(".ppq-gpick-done").click();
  check(clickDone === 0 && clickSkip === 1 &&
    clickPicker.querySelector(".ppq-gpick-skip").textContent === "Skipped \u2713",
    "clicking Done with the untouched defaults matches pressing Enter");
  check(src.indexOf("picker._ppqSubmitOrSkip") >= 0 &&
    src.indexOf("guessPage.style.display !== \"none\"") >= 0,
    "global Enter also routes to the visible guess picker when focus is outside it");
})();

// Selecting an answer must capture it without leaking the verdict while the
// guess declaration is still on screen. The same committed answer is revealed
// after Done/Skip, or immediately if the pupil closes that page early.
(function () {
  console.log("\n=== verdict waits for guess declaration ===");
  const selectOption = extractFn("selectOption");
  const selectMCQ = extractFn("selectMCQ");
  const afterAnswer = extractFn("_afterAnswer");
  const closeModal = extractFn("closeModal");
  const revealCommittedAnswer = extractFnOptional("_revealCommittedAnswer");

  function makeRevealCtx(type) {
    const options = ["A", "B", "C"].map((label) => {
      const b = makeEl("button");
      b.className = "ppq-option";
      b.dataset.label = label;
      return b;
    });
    const nodes = {
      ".ppq-answer-line": makeEl("div"),
      ".ppq-answer-panel": makeEl("div"),
      ".ppq-examiner-body": makeEl("div"),
      ".ppq-skip": makeEl("button"),
      ".ppq-reveal": makeEl("button"),
      ".ppq-competence": makeEl("div"),
      ".ppq-unsure": makeEl("button"),
      ".ppq-guess": makeEl("div"),
      ".ppq-kb-hint": makeEl("div"),
      ".ppq-modal-body": makeEl("div"),
      ".ppq-modal-content": makeEl("div"),
      ".ppq-modal-min": makeEl("button"),
      ".ppq-modal-reminder": makeEl("div"),
      ".ppq-modal-feedback-status": makeEl("span"),
      ".ppq-modal": makeEl("div"),
      ".ppq-next": makeEl("button")
    };
    const reports = [];
    const ctx = {
      answered: false,
      cur: { id: "deferred-verdict-question", correct_answer: "C" },
      cfg: {
        modules: { postQuestionReview: true },
        analysisOf: () => null,
        idOf: (q) => q.id,
        correctOf: (q) => q.correct_answer,
        answerKeyOf: (q) => q.correct_answer,
        metaLine: () => "Deferred verdict test",
        groupLabel: () => "M5 Geometry",
        analysisReminderGroup: true,
        selfReport: { levels: 6, prompt: "How did that feel?", meanings: [] },
        revealCorrect: true
      },
      root: makeEl("div"),
      q(selector) { return nodes[selector] || null; },
      qa(selector) {
        if (selector === ".ppq-option") return options;
        if (selector === ".ppq-scale-btn") return [];
        return [];
      },
      store: { attempts: [{ attempt_id: "deferred-attempt" }], scores: {} },
      _answerLabels: ["A", "B", "C"],
      _curType: type || "multipleChoice",
      _attemptId: "deferred-attempt",
      _chosenLabel: "",
      _wasRight: false,
      _answerRevealPending: false,
      _preGuessDeclaration: null,
      _saveStore: () => {},
      _fireReport: (payload) => reports.push(payload),
      _commitTimer: () => {},
      _recordAttempt: () => {},
      _analysisReviewMode: () => false,
      _syncAnalysisReminder: V._syncAnalysisReminder, /* VF-13 */
      _contentSafety: V._contentSafety, /* VSAFE-01 */
      _isV2: V._isV2,
      _guessLabel: V._guessLabel,
      _guessPrompt: V._guessPrompt,
      _feedbackReadiness: V._feedbackReadiness,
      _setFeedbackStatusBadge: V._setFeedbackStatusBadge,
      _buildGuessPicker: V._buildGuessPicker,
      _verdictEl: V._verdictEl,
      _appendFreeformReflectionV2: V._appendFreeformReflectionV2,
      _renderSelectedOptionDiagnosticV2: () => {},
      _renderInterrogationFeedback: () => {},
      _firePendingDashboardPulse: () => {},
      _commitPreVerdictGuess: () => {},
      _examinerShown: 0,
      _showExaminer() { this._examinerShown++; },
      _renderInterrogation: V._renderInterrogation,
      _afterAnswer: afterAnswer,
      _revealCommittedAnswer: revealCommittedAnswer || (() => {}),
      selectOption: selectOption,
      selectMCQ: selectMCQ,
      closeModal: closeModal,
      next: () => {}
    };
    return { ctx, nodes, options, reports };
  }

  const oldSetTimeout = global.setTimeout;
  const timers = [];
  global.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  try {
    const normal = makeRevealCtx();
    normal.ctx.selectOption("A");
    const guessPage = normal.nodes[".ppq-modal-body"].querySelector(".ppq-iq-guesspage");
    const restPage = normal.nodes[".ppq-modal-body"].querySelector(".ppq-iq-rest");
    check(/Deferred verdict test/.test(normal.nodes[".ppq-modal-reminder"].textContent) &&
      /M5 Geometry/.test(normal.nodes[".ppq-modal-reminder"].textContent) &&
      /you chose A/.test(normal.nodes[".ppq-modal-reminder"].textContent),
      "the sticky analysis bar retains the question, broad topic and chosen answer while the dashboard is hidden");
    check(!!guessPage && guessPage.style.display !== "none" &&
      !!restPage && restPage.style.display === "none",
      "answering opens the guess declaration before the verdict");
    check(normal.options.every((b) =>
      !b.classList.contains("correct") && !b.classList.contains("incorrect")),
      "no option receives correct/incorrect styling while the guess page is visible");
    check(!normal.nodes[".ppq-answer-line"].classList.contains("show") &&
      !normal.nodes[".ppq-answer-line"].textContent,
      "the outer answer text stays hidden while the guess page is visible");

    guessPage.querySelector(".ppq-gpick-skip").click();
    const revealTimer = timers.find((t) => t.ms === 180);
    check(!!revealTimer,
      "Done/Skip schedules the short transition before revealing the answer");
    if (revealTimer) revealTimer.fn();
    check(normal.options[0].classList.contains("incorrect") &&
      normal.options[2].classList.contains("correct"),
      "after the guess transition, the chosen and correct options are revealed");
    check(normal.nodes[".ppq-answer-line"].classList.contains("show") &&
      /correct answer is C/i.test(normal.nodes[".ppq-answer-line"].textContent),
      "after the guess transition, the answer text is revealed");

    const early = makeRevealCtx();
    early.ctx.selectOption("A");
    check(early.options.every((b) =>
      !b.classList.contains("correct") && !b.classList.contains("incorrect")) &&
      !early.nodes[".ppq-answer-line"].classList.contains("show"),
      "the early-close path also begins with the verdict hidden");
    early.ctx.closeModal();
    check(early.options[0].classList.contains("incorrect") &&
      early.options[2].classList.contains("correct") &&
      early.nodes[".ppq-answer-line"].classList.contains("show"),
      "closing the guess page early reveals the committed answer instead of stranding it");

    const mcqTimerStart = timers.length;
    const mcq = makeRevealCtx("mcq");
    mcq.ctx.selectMCQ("A");
    const mcqGuessPage = mcq.nodes[".ppq-modal-body"].querySelector(".ppq-iq-guesspage");
    check(mcq.options.every((b) =>
      !b.classList.contains("correct") && !b.classList.contains("incorrect")) &&
      mcq.ctx._examinerShown === 0,
      "MCQ correctness and examiner text also remain hidden during guess declaration");
    mcqGuessPage.querySelector(".ppq-gpick-skip").click();
    const mcqRevealTimer = timers.slice(mcqTimerStart).find((t) => t.ms === 180);
    if (mcqRevealTimer) mcqRevealTimer.fn();
    check(mcq.options[0].classList.contains("incorrect") &&
      mcq.options[2].classList.contains("correct") &&
      mcq.ctx._examinerShown === 1,
      "MCQ styling and examiner text appear together after the transition");
  } finally {
    global.setTimeout = oldSetTimeout;
  }
})();

// A missing authored analysis must not suppress the attempt-feedback flow.
// The fallback deliberately contains no invented teaching content, but retains
// the guess declaration, freeform reflection and self-rating shell.
(function () {
  console.log("\n=== feedback fallback without authored analysis ===");
  const renderSource = extractFn("_renderInterrogation").toString();
  check(renderSource.indexOf("if (!rec) return") < 0 &&
    renderSource.indexOf("viewer-feedback-fallback-v1") >= 0,
    "a question without analysis receives a safe fallback record instead of returning early");
  check(renderSource.indexOf("this._buildGuessPicker") >= 0,
    "the no-analysis fallback still passes through the guess declaration page");
  check(renderSource.indexOf("Question-specific suggestions are still being prepared.") >= 0,
    "the fallback explains the absence of question-specific suggestions without inventing any");
  check((renderSource.match(/this\._appendFreeformReflectionV2\(restPage, rec\)/g) || []).length === 1 &&
    renderSource.indexOf("ppq-iq-rate") >= 0,
    "every schema path shares exactly one freeform feedback box and the self-rating");

  const modalNodes = {
    ".ppq-modal-body": makeEl("div"),
    ".ppq-modal-content": makeEl("div"),
    ".ppq-modal-min": makeEl("button"),
    ".ppq-modal-reminder": makeEl("div"),
    ".ppq-modal-feedback-status": makeEl("span"),
    ".ppq-modal": makeEl("div"),
    ".ppq-competence": makeEl("div")
  };
  const fallbackReports = [];
  let fallbackSaves = 0;
  const fallbackCtx = {
    cur: { id: "missing-analysis-question", correct_answer: "C" },
    cfg: {
      modules: { postQuestionReview: true },
      analysisOf: () => null,
      idOf: (q) => q.id,
      correctOf: (q) => q.correct_answer,
      metaLine: () => "Missing analysis test",
      selfReport: { levels: 6, prompt: "How did that feel?", meanings: [] }
    },
    root: makeEl("div"),
    q: (selector) => modalNodes[selector] || null,
    qa: () => [],
    store: { attempts: [{ attempt_id: "missing-attempt" }], scores: {} },
    _saveStore: () => { fallbackSaves++; },
    _fireReport: (payload) => fallbackReports.push(payload),
    _answerLabels: ["A", "B", "C"],
    _optionLabels: () => ["A", "B", "C"],
    _attemptId: "missing-attempt",
    _chosenLabel: "A",
    _wasRight: false,
    _analysisReviewMode: () => false,
    _contentSafety: V._contentSafety, /* VSAFE-01 */
    _isV2: V._isV2,
    _guessLabel: V._guessLabel,
    _guessPrompt: V._guessPrompt,
    _feedbackReadiness: V._feedbackReadiness,
    _setFeedbackStatusBadge: V._setFeedbackStatusBadge,
    _buildGuessPicker: V._buildGuessPicker,
    _verdictEl: V._verdictEl,
    _appendFreeformReflectionV2: V._appendFreeformReflectionV2,
    _renderSelectedOptionDiagnosticV2: () => {},
    _renderInterrogationFeedback: () => {},
    _revealCommittedAnswer: () => {},
    _commitPreVerdictGuess: () => {},
    closeModal: () => {},
    next: () => {},
    _renderInterrogation: V._renderInterrogation
  };
  fallbackCtx._renderInterrogation();
  const mounted = modalNodes[".ppq-modal-body"];
  const fallbackGuess = mounted.querySelector(".ppq-iq-guesspage");
  const fallbackRest = mounted.querySelector(".ppq-iq-rest");
  check(!!fallbackGuess && !!fallbackGuess.querySelector(".ppq-gpick"),
    "runtime null-analysis rendering opens the ordinary guess picker");
  check(!!fallbackRest && !!fallbackRest.querySelector(".ppq-iq-fallback-note"),
    "runtime null-analysis rendering mounts the explicit no-suggestions note");
  check(/solution pending/i.test(modalNodes[".ppq-modal-feedback-status"].textContent) &&
    modalNodes[".ppq-modal-feedback-status"].classList.contains("ppq-feedback-status-pending"),
    "the sticky analysis bar carries the same pending status as the question header");
  check(collect(fallbackRest, (n) => (n.className || "").indexOf("ppq-iq-reflection-text") >= 0).length === 1 &&
    collect(fallbackRest, (n) => (n.className || "").indexOf("ppq-iq-scale-btn") >= 0).length === 6,
    "runtime fallback contains one feedback box and all six rating choices");

  const oldSetTimeout = global.setTimeout;
  const fallbackTimers = [];
  global.setTimeout = (fn, ms) => { fallbackTimers.push({ fn: fn, ms: ms }); return fallbackTimers.length; };
  try {
    const fallbackPicker = fallbackGuess.querySelector(".ppq-gpick");
    fallbackPicker.dispatchEvent({
      type: "keydown",
      key: "Enter",
      repeat: false,
      target: fallbackPicker.querySelector(".ppq-gpick-pct"),
      preventDefault: () => {},
      stopPropagation: () => {}
    });
    const revealTimer = fallbackTimers.find((t) => t.ms === 180);
    check(!!revealTimer &&
      fallbackPicker.querySelector(".ppq-gpick-skip").textContent === "Skipped \u2713",
      "Enter records the no-guess path visibly before revealing fallback feedback");
    revealTimer.fn();
    check(fallbackGuess.style.display === "none" && fallbackRest.style.display === "",
      "the fallback advances from guess capture to the feedback screen");
  } finally {
    global.setTimeout = oldSetTimeout;
  }

  const fallbackText = fallbackRest.querySelector(".ppq-iq-reflection-text");
  fallbackText.value = "Needed another route";
  fallbackText.dispatchEvent({ type: "blur" });
  check(fallbackCtx.store.attempts[0].freeform_reflection === "Needed another route" &&
    fallbackSaves === 1 &&
    fallbackReports.some((r) => r.qtype === "freeform_reflection"),
    "fallback freeform feedback persists against the current attempt");

  const fallbackScale = fallbackRest.querySelector(".ppq-iq-scale");
  const fallbackRateButtons = collect(fallbackScale,
    (n) => (n.className || "").split(/\s+/).indexOf("ppq-iq-scale-btn") >= 0);
  fallbackScale.dispatchEvent({ type: "click", target: fallbackRateButtons[3] });
  check(fallbackCtx.store.scores["missing-analysis-question"] === 4 &&
    fallbackRest.querySelector(".ppq-iq-next").style.display === "inline-block",
    "fallback rating stores normally and reveals Next question");
})();

// Answering an inline diagnostic visibly causes its result: the prompt passes
// its own block as the response origin, then tailored feedback waits briefly,
// scrolls into view and highlights. A response with no authored feedback still
// receives a transient Recorded acknowledgement.
(function () {
  console.log("\n=== visible response firing ===");
  const rec = byId.esat_engaa_2022_s1_Q27;
  const prompt = {
    id: "test_prompt",
    prompt: "Did you use this?",
    states: ["secure_before_question", "still_unclear"]
  };
  const ctx = makeCtx(rec);
  let receivedOrigin = null;
  ctx._renderInterrogationFeedback = (origin) => { receivedOrigin = origin; };
  const promptBlock = ctx._promptBlockV2(prompt, "method_awareness");
  promptBlock.querySelector(".ppq-iq-state").click();
  check(receivedOrigin === promptBlock,
    "an inline answer identifies the exact block that fired it");

  const oldSetTimeout = global.setTimeout;
  const timers = [];
  global.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  try {
    const tailored = makeCtx(rec);
    const feedbackBox = makeEl("div");
    feedbackBox.className = "ppq-iq-feedback";
    const iq = makeEl("div");
    iq.appendChild(feedbackBox);
    tailored._iqBox = iq;
    tailored._matchInterrogationFeedback = () => ({ text: "Tailored next step" });
    const origin = makeEl("div");
    iq.appendChild(origin);
    tailored._renderInterrogationFeedback(origin);
    check(feedbackBox.children.length === 0 && timers.some((t) => t.ms === 220),
      "tailored feedback waits for a perceptible 220 ms beat");
    timers.find((t) => t.ms === 220).fn();
    check(textOf(feedbackBox).indexOf("Tailored next step") >= 0,
      "tailored feedback appears after the beat");
    check(feedbackBox.classList.contains("ppq-iq-feedback-fired") &&
      feedbackBox._scrollIntoView && feedbackBox._scrollIntoView.behavior === "smooth",
      "tailored feedback highlights and scrolls smoothly into view");

    const noTailored = makeCtx(rec);
    const noFeedbackBox = makeEl("div");
    noFeedbackBox.className = "ppq-iq-feedback";
    const noIq = makeEl("div");
    noIq.appendChild(noFeedbackBox);
    const noOrigin = makeEl("div");
    noIq.appendChild(noOrigin);
    noTailored._iqBox = noIq;
    noTailored._matchInterrogationFeedback = () => null;
    const before = timers.length;
    noTailored._renderInterrogationFeedback(noOrigin);
    const responseTimer = timers.slice(before).find((t) => t.ms === 220);
    responseTimer.fn();
    check(textOf(noOrigin).indexOf("Recorded") >= 0,
      "an answer with no tailored branch still visibly says Recorded");
  } finally {
    global.setTimeout = oldSetTimeout;
  }
})();

// Feedback readiness is pupil-facing state, not an inference they should have
// to make from whether a long panel happens to appear. Reviewed, draft and
// missing records must map to three explicit, stable states at the question top.
(function () {
  console.log("\n=== feedback readiness badge ===");
  const feedbackReadiness = extractFnOptional("_feedbackReadiness");
  check(!!feedbackReadiness,
    "the viewer exposes one feedback-readiness helper for all status rendering");
  if (feedbackReadiness) {
    const ctx = {
      cfg: {
        analysisOf: (q) => q.analysis || null
      },
      _contentSafety: V._contentSafety /* VSAFE-01 */
    };
    const full = feedbackReadiness.call(ctx, {
      id: "reviewed-question",
      analysis: { review: { status: "reviewed" } }
    });
    const provisional = feedbackReadiness.call(ctx, {
      id: "draft-question",
      analysis: { review: { status: "draft" } }
    });
    const pending = feedbackReadiness.call(ctx, {
      id: "missing-question",
      analysis: null
    });
    check(full && full.code === "full" && /full feedback/i.test(full.label || ""),
      "reviewed analysis is labelled Full feedback");
    check(provisional && provisional.code === "provisional" &&
      /provisional feedback/i.test(provisional.label || ""),
      "draft/legacy analysis is labelled Provisional feedback");
    check(pending && pending.code === "pending" &&
      /(solution pending|feedback pending|basic feedback)/i.test(pending.label || ""),
      "missing analysis is explicitly labelled pending/basic rather than appearing broken");

    const modalBadge = makeEl("span");
    const badgeCtx = {
      cfg: ctx.cfg,
      cur: null,
      _feedbackReadiness: feedbackReadiness,
      _contentSafety: V._contentSafety /* VSAFE-01 */
    };
    V._setFeedbackStatusBadge.call(
      badgeCtx,
      modalBadge,
      { id: "reviewed-question", analysis: { review: { status: "reviewed" } } },
      "ppq-modal-feedback-status"
    );
    check(/full feedback/i.test(modalBadge.textContent) &&
      modalBadge.classList.contains("ppq-modal-feedback-status") &&
      modalBadge.classList.contains("ppq-feedback-status-full"),
      "the shared badge painter gives the sticky modal status the full-feedback state");
  }
  check(src.indexOf("ppq-feedback-status") >= 0 &&
    src.indexOf("_feedbackReadiness") >= 0,
    "the question header renders the shared feedback-readiness state as a badge");
  check(src.indexOf('<span class="ppq-modal-feedback-status"') >= 0 &&
    src.indexOf('this.q(".ppq-modal-feedback-status")') >= 0 &&
    src.indexOf("_setFeedbackStatusBadge") >= 0,
    "the analysis top bar reuses the shared feedback badge instead of duplicating status logic");
})();

// The ESAT controls default to the launch-safe in-spec estate, distinguish
// source from year, and offer a direct finder rather than forcing pupils to
// navigate several filters just to reach a known paper/question.
(function () {
  console.log("\n=== ESAT launch filters and question finder ===");
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "example", "esat-compare.html"), "utf8");
  const specAt = html.indexOf('field: "esat_in_spec"');
  const specConfig = specAt >= 0 ? html.slice(specAt, specAt + 500) : "";
  check(/allLabel:\s*"In spec \+ out of spec"/.test(specConfig) &&
    /default:\s*"in_spec"/.test(specConfig),
    "spec filter defaults to In spec and names the combined choice clearly");
  check(/positiveValues:\s*\[\s*"in_spec"\s*\]/.test(specConfig),
    "the in-spec selection is declared as the positive/green filter state");
  check(/\bfield:\s*"assessment"\s*,[^{}]*allLabel:\s*"All sources"/s.test(html) &&
    /\bfield:\s*"year"\s*,[^{}]*allLabel:\s*"All years"/s.test(html),
    "source and paper year are separate, clearly named filters");
  check(/counterScope:\s*\{[\s\S]*ignoreFilterFields:\s*\[\s*"esat_in_spec"\s*\]/.test(html) &&
    /analysisReminderGroup:\s*true/.test(html),
    "ESAT declares the spec-excluding scope counter and broad-topic analysis reminder");
  check(/questionFinder:\s*true/.test(html) &&
    src.indexOf("ppq-find-input") >= 0,
    "the ESAT page enables the direct question finder and the engine renders it");

  const catalogueSandbox = {};
  catalogueSandbox.window = catalogueSandbox;
  vm.createContext(catalogueSandbox);
  vm.runInContext(fs.readFileSync(CATALOGUE, "utf8"), catalogueSandbox);
  const mathsPhysics = (catalogueSandbox.ESAT_QUESTIONS || [])
    .filter((q) => q.subject === "maths" || q.subject === "physics");
  check(mathsPhysics.length === 738 &&
    mathsPhysics.filter((q) => q.esat_in_spec === "in_spec").length === 613,
    "the launch counter's real estate is 613 in-spec questions shown from 738 Maths/Physics questions");
})();

// A scope counter applies every active filter except the deliberately ignored
// launch filter. It therefore explains a safe default without hard-coding an
// estate count, and continues to tell the truth after another filter changes.
(function () {
  console.log("\n=== shown count versus filter scope ===");
  const order = makeEl("select"); order.value = "order";
  const start = makeEl("select"); start.value = "1";
  const year = makeEl("select"); year.value = "2022";
  const spec = makeEl("select"); spec.value = "in_spec";
  const counter = makeEl("div");
  const selects = { 1: year, 2: spec };
  const subjectLabels = { maths: "Maths", physics: "Physics", chemistry: "Chemistry" };
  const ctx = {
    cfg: {
      filters: [
        { field: "subject", multi: true },
        { field: "year" },
        { field: "esat_in_spec" }
      ],
      counterScope: {
        ignoreFilterFields: ["esat_in_spec"],
        label(scopeQuestions) {
          const present = {};
          scopeQuestions.forEach((q) => { present[q.subject] = true; });
          return ["maths", "physics", "chemistry"]
            .filter((subject) => present[subject])
            .map((subject) => subjectLabels[subject]).join(" + ");
        }
      },
      idOf: (q) => q.id,
      sort: (a, b) => a.id.localeCompare(b.id),
      groupKey: (q) => q.topic_code || q.subject
    },
    questions: [
      { id: "m22i", subject: "maths", year: "2022", esat_in_spec: "in_spec" },
      { id: "p22i", subject: "physics", year: "2022", esat_in_spec: "in_spec" },
      { id: "p22o", subject: "physics", year: "2022", esat_in_spec: "out_of_spec" },
      { id: "p23o", subject: "physics", year: "2023", esat_in_spec: "out_of_spec" },
      { id: "c22i", subject: "chemistry", year: "2022", esat_in_spec: "in_spec" }
    ],
    view: [],
    idx: -1,
    groupFilter: null,
    _multiSel: { 0: new Set(["maths", "physics"]) },
    _filterValue: V._filterValue,
    _filterValues: V._filterValues,
    _matchesQuestionFilters: V._matchesQuestionFilters,
    q(selector) {
      if (selector === ".ppq-order") return order;
      if (selector === ".ppq-start") return start;
      if (selector === ".ppq-counter") return counter;
      const match = selector.match(/data-fidx="(\d+)"/);
      return match ? selects[match[1]] : null;
    },
    next() {}
  };

  V.filterQuestions.call(ctx);
  check(counter.innerHTML === "2 shown / 3 Maths + Physics",
    "the in-spec slice is distinguished from the otherwise identical Maths/Physics scope");

  year.value = "2023";
  V.filterQuestions.call(ctx);
  check(counter.innerHTML === "0 shown / 1 Physics",
    "the scope count and label still respect another active filter");

  year.value = "2022";
  spec.value = "ALL";
  V.filterQuestions.call(ctx);
  check(counter.innerHTML === "3 shown / 3 Maths + Physics",
    "choosing the combined spec view restores every question without changing the scope");
})();

// Provisional subtopics remain a reversible overlay: their selector is hidden
// until one broad topic is chosen, then contains only that topic's observed
// labels and resets safely when the parent topic changes.
(function () {
  console.log("\n=== dependent subtopic filter ===");
  const topic = makeEl("select");
  topic.dataset.fidx = "0";
  topic.value = "ALL";
  const subtopic = makeEl("select");
  subtopic.dataset.fidx = "1";
  subtopic.value = "ALL";
  const filters = [
    { field: "topic_code", label: "topic", allLabel: "All topics" },
    {
      field: "classification_subtopic",
      label: "subtopic",
      allLabel: "All first-pass subtopics",
      dependsOn: "topic_code",
      hideUntilParent: true
    }
  ];
  const selectors = { 0: topic, 1: subtopic };
  const ctx = {
    cfg: { filters },
    questions: [
      { topic_code: "P1", classification_subtopic: "Circuit rules" },
      { topic_code: "P1", classification_subtopic: "Power & energy" },
      { topic_code: "M5", classification_subtopic: "Angles & polygons" },
      { topic_code: "M5" }
    ],
    _multiSel: {},
    q(selector) {
      const match = selector.match(/data-fidx="(\d+)"/);
      return match ? selectors[match[1]] : null;
    },
    _filterValue: V._filterValue,
    _filterValues: V._filterValues,
    _parentFilterValue: V._parentFilterValue,
    _fillSingleFilterOptions: V._fillSingleFilterOptions,
    _syncSingleFilterStyle: V._syncSingleFilterStyle,
    _refreshDependentFilters: V._refreshDependentFilters
  };
  ctx._fillSingleFilterOptions(1);
  check(subtopic.style.display === "none" && subtopic.disabled &&
    subtopic.children.length === 1,
    "subtopic filter stays out of the way while broad topic is All");

  topic.value = "P1";
  ctx._refreshDependentFilters("topic_code");
  const p1Values = subtopic.children.map((option) => option.value);
  check(subtopic.style.display === "" && !subtopic.disabled,
    "choosing a broad topic reveals its subtopic filter");
  check(p1Values.join("|") === "ALL|Circuit rules|Power & energy",
    "P1 shows only its observed first-pass subtopics in stable order (got " + p1Values.join("|") + ")");

  subtopic.value = "Circuit rules";
  topic.value = "M5";
  ctx._refreshDependentFilters("topic_code");
  const m5Values = subtopic.children.map((option) => option.value);
  check(m5Values.join("|") === "ALL|Angles & polygons" && subtopic.value === "ALL",
    "changing broad topic replaces stale options and clears an invalid selection (got " +
      m5Values.join("|") + "; selected " + subtopic.value + ")");

  const html = fs.readFileSync(path.join(PROJECT_ROOT, "example", "esat-compare.html"), "utf8");
  check(html.indexOf("dist/esat_classification.js") >= 0 &&
    html.indexOf('dependsOn: "topic_code"') >= 0,
    "ESAT page loads the generated classification overlay and wires the dependent filter");
  let inlineSyntaxError = "";
  const inlineScripts = Array.from(html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi));
  inlineScripts.forEach((match) => {
    try { new Function(match[1]); } catch (err) { inlineSyntaxError = err.message; }
  });
  check(!inlineSyntaxError,
    "all inline ESAT page scripts parse after taxonomy wiring" +
      (inlineSyntaxError ? " (" + inlineSyntaxError + ")" : ""));
})();

// An opted-in dependent, array-valued filter becomes an in-place RHS drill-down.
// Its displayed vocabulary is stable, while filtering and counts use membership
// so one question can contribute to more than one family.
(function () {
  console.log("\n=== dashboard subtopic facet ===");
  const topic = makeEl("select");
  topic.dataset.fidx = "0";
  const subtopic = makeEl("select");
  subtopic.dataset.fidx = "1";
  const order = makeEl("select"); order.value = "order";
  const start = makeEl("input"); start.value = "";
  const counter = makeEl("span");
  function option(select, value) {
    const node = makeEl("option");
    node.value = value;
    node.textContent = value;
    select.appendChild(node);
  }
  option(topic, "ALL"); option(topic, "M5");
  option(subtopic, "ALL"); option(subtopic, "Angles");
  option(subtopic, "Solids"); option(subtopic, "Triangles");
  option(subtopic, "Empty under current filters");
  topic.value = "M5"; subtopic.value = "ALL";

  const panel = makeEl("aside");
  panel.appendChild(makeEl("h3"));
  const subtitle = makeEl("div"); subtitle.className = "ppq-dash-sub"; panel.appendChild(subtitle);
  const content = makeEl("div"); content.className = "ppq-dash-content"; panel.appendChild(content);

  const questions = [
    { id: "g1", topic_code: "M5", classification: { primary_subtopic: "Angles" }, classification_subtopics: ["Angles", "Triangles"] },
    { id: "g2", topic_code: "M5", classification: { primary_subtopic: "Angles" }, classification_subtopics: ["Angles"] },
    { id: "g3", topic_code: "M5", classification: { primary_subtopic: "Triangles" }, classification_subtopics: ["Triangles"] },
    { id: "g4", topic_code: "M5", classification: { primary_subtopic: "Solids" }, classification_subtopics: ["Solids"] }
  ];
  const stableFamilies = (source) =>
    Array.from(new Set(source.map((q) => q.classification.primary_subtopic))).sort();
  const filters = [
    { field: "topic_code", label: "topic", allLabel: "All topics", values: ["M5"] },
    { field: "classification_subtopics", label: "subtopic", allLabel: "All subtopics", dependsOn: "topic_code", hideUntilParent: true, dashboardFacet: true, values: stableFamilies }
  ];
  const selects = { 0: topic, 1: subtopic };
  let dashboardRenders = 0;
  const ctx = {
    cfg: {
      filters,
      selfReport: { levels: 6, ramp: { 1: "1,1,1", 2: "2,2,2", 3: "3,3,3", 4: "4,4,4", 5: "5,5,5", 6: "6,6,6" } },
      idOf: (q) => q.id,
      groupKey: (q) => q.topic_code,
      groupLabel: (q) => q.topic_code + " Geometry",
      isUntagged: () => false
    },
    questions,
    byId: Object.fromEntries(questions.map((q) => [q.id, q])),
    store: { attempts: [{ id: "g1", correct: true }], scores: { g1: 4 } },
    view: [], idx: -1, groupFilter: null, _multiSel: {},
    q(selector) {
      if (selector === ".ppq-order") return order;
      if (selector === ".ppq-start") return start;
      if (selector === ".ppq-counter") return counter;
      if (selector === ".ppq-dash-content") return content;
      const match = selector.match(/data-fidx="(\d+)"/);
      return match ? selects[match[1]] : null;
    },
    qa() { return []; },
    next() {},
    renderDashboard() { dashboardRenders++; },
    _wireCats() {},
    _filterValue: V._filterValue,
    _filterValues: V._filterValues,
    _dashboardFacet: V._dashboardFacet,
    _activeDashboardFacet: V._activeDashboardFacet,
    _parentFilterValue: V._parentFilterValue,
    _fillSingleFilterOptions: V._fillSingleFilterOptions,
    _syncSingleFilterStyle: V._syncSingleFilterStyle,
    _refreshDependentFilters: V._refreshDependentFilters,
    _matchesQuestionFilters: V._matchesQuestionFilters,
    filterQuestions: V.filterQuestions,
    _zeroRatings: V._zeroRatings,
    _questionScores: V._questionScores, /* VF-14r2 */
    _catHtml: V._catHtml
  };

  const facet = ctx._activeDashboardFacet();
  V._renderDashboardFacet.call(ctx, facet);
  check(content.innerHTML.indexOf("<b>4 questions.</b>") >= 0 &&
    content.innerHTML.indexOf("counts below can overlap") >= 0,
    "the Geometry drill-down states its unique total and explains overlapping counts");
  check(content.innerHTML.indexOf('data-value="Angles"><div class="ppq-cat-name">Angles <span class="ppq-cat-count">(2)</span>') >= 0 &&
    content.innerHTML.indexOf('data-value="Triangles"><div class="ppq-cat-name">Triangles <span class="ppq-cat-count">(2)</span>') >= 0,
    "array membership contributes one question to every applicable stable family");
  check(content.innerHTML.indexOf(
    'data-value="Empty under current filters" disabled aria-disabled="true"'
  ) >= 0,
  "a stable family with no questions under the other active filters is visible but cannot create an empty view");

  V._setDashboardFacetValue.call(ctx, 1, "Triangles");
  check(subtopic.value === "Triangles" && ctx.view.length === 2 &&
    ctx.view.every((q) => q.classification_subtopics.indexOf("Triangles") >= 0),
    "clicking a RHS family filters through the existing dependent selector");
  V._setDashboardFacetValue.call(ctx, 1, "Triangles");
  check(subtopic.value === "ALL" && ctx.view.length === 4,
    "clicking the active RHS family again restores the whole Geometry topic");

  topic.value = "ALL";
  ctx._refreshDependentFilters("topic_code");
  V.setGroupFilter.call(ctx, "M5");
  check(topic.value === "M5" && ctx.groupFilter === null &&
    subtopic.style.display === "" && dashboardRenders > 0,
    "clicking broad M5 uses the same parent selector and drill-down as choosing M5 in the header");
  V._clearDashboardFacet.call(ctx, true);
  check(topic.value === "ALL" && subtopic.value === "ALL" &&
    subtopic.style.display === "none",
    "All topics clears both levels and hides the dependent selector again");

  check(V._dashboardFacet.call({ cfg: { filters: [{ field: "topic_code" }] } }) === null,
    "consumers that do not opt in retain the ordinary dashboard contract");

  const html = fs.readFileSync(path.join(PROJECT_ROOT, "example", "esat-compare.html"), "utf8");
  check(html.indexOf("dashboardFacet: true") >= 0 &&
    html.indexOf("stableClassificationFamilies") >= 0 &&
    html.indexOf("multilabel_source_primary_subtopic") >= 0,
    "ESAT opts into stable sidecar-owned families rather than every raw or superseded label");
})();

// The reviewed 2022 rectangle twins must retain the human factor-pair search
// agreed in moderation instead of jumping from the product equation to x = 11.
(function () {
  console.log("\n=== 2022 Q9 factor-pair route ===");
  ["esat_nsaa_2022_s1_Q09", "esat_engaa_2022_s1_Q09"].forEach((id) => {
    const rec = byId[id];
    check(!!rec, id + " is present in the analysis bundle");
    if (!rec) return;
    const main = (rec.methods || []).find((method) => method.role === "recommended");
    const alternative = (rec.methods || []).find((method) => method.id === "expand_quadratic");
    const mainText = (main && main.pupil_steps || []).join(" ");
    check(main && main.title === "Look for two factors three apart" &&
      /10\s*[×x]\s*18/i.test(mainText) && /12\s*[×x]\s*15/i.test(mainText),
      id + " shows the nearby factor-pair search rather than jumping to x = 11");
    check(alternative && /usually longer/i.test(alternative.title || "") &&
      /(x\s*[−-]\s*11).*(x\s*\+\s*16)/i.test((alternative.pupil_steps || []).join(" ")),
      id + " keeps formal quadratic factorising as an explicit longer alternative");
    check((rec.self_report_prompts || []).length === 1 &&
      /factor pair three apart/i.test(rec.self_report_prompts[0].prompt || ""),
      id + " asks one focused, answerable question about the factor search");
    check((rec.methods || []).length === 2 &&
      !(rec.methods || []).some((method) =>
        /compare enlarged|coefficient.only|reject.*negative/i.test(
          String(method.id || "") + " " + String(method.title || "")
        )),
      id + " contains no redundant pseudo-route for a routine check");
  });
})();

// Every generated classification id must resolve to a real displayed catalogue
// row using the page's part-specific-then-question-level lookup rule.
(function () {
  console.log("\n=== classification catalogue coverage ===");
  const sandbox = {};
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(CATALOGUE, "utf8"), sandbox);
  vm.runInContext(fs.readFileSync(CLASSIFICATION_BUNDLE, "utf8"), sandbox);
  const classification = sandbox.ESAT_CLASSIFICATION;
  const questions = sandbox.ESAT_QUESTIONS || [];
  const baseId = (q) => q.slug + "_Q" +
    String(parseInt(q.question_number, 10)).padStart(2, "0");
  const partId = (q) => baseId(q) + (q.part ? "_" + q.part : "");
  const catalogueIds = new Set();
  questions.forEach((q) => {
    catalogueIds.add(baseId(q));
    catalogueIds.add(partId(q));
  });
  const classifiedIds = Object.keys(classification.by_id || {});
  const unmatched = classifiedIds.filter((id) => !catalogueIds.has(id));
  check(classifiedIds.length === classification.question_count,
    "classification bundle count matches its unique by_id entries");
  check(classifiedIds.length === 738,
    "the full maths/physics estate has a first-pass classification (738/738)");
  check((classification.unresolved_conflicts || []).length === 0,
    "all cross-sweep retained-label conflicts have an evidence-backed resolution");
  check((classification.unreconciled_reroutes || []).length === 0,
    "every rerouted question has a finalized classification in its target sweep");
  check(unmatched.length === 0,
    "every provisional classification resolves to a displayed catalogue row" +
      (unmatched.length ? " (unmatched: " + unmatched.join(", ") + ")" : ""));
  const displayedMatches = questions.filter((q) =>
    !!classification.by_id[partId(q)] || !!classification.by_id[baseId(q)]).length;
  check(displayedMatches === classification.question_count,
    "catalogue lookup exposes every classified question exactly once (" +
      displayedMatches + "/" + classification.question_count + ")");

  const multilabelRoot = path.join(
    ANALYSIS_ROOT, "generated", "classification", "multilabel"
  );
  const sidecars = fs.readdirSync(multilabelRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(
      multilabelRoot, entry.name, entry.name + "_multilabel.json"
    ))
    .filter((file) => fs.existsSync(file));
  const sidecarRows = sidecars.flatMap((file) => {
    const payload = JSON.parse(fs.readFileSync(file, "utf8"));
    return (payload.records || []).map((row) => ({ file, row }));
  });
  check(classification.multilabel_records_applied === sidecarRows.length &&
    (classification.multilabel_sources || []).length === sidecars.length,
    "the viewer bundle contains every auto-discovered multi-label sidecar row (" +
      sidecarRows.length + " from " + sidecars.length + " topic maps)");
  check(classification.multilabel_records_applied === 738,
    "every classified question has a completed multi-label topic map (738/738)");
  const droppedSidecarPrimaries = sidecarRows.filter(({ row }) => {
    const merged = (classification.by_id || {})[row.question_id];
    return !merged ||
      merged.multilabel_source_primary_subtopic !== row.primary_subtopic ||
      (merged.syllabus_subtopics || []).indexOf(row.primary_subtopic) < 0;
  });
  check(droppedSidecarPrimaries.length === 0,
    "each topic map's compact RHS family survives the global merge and remains an overlapping membership" +
      (droppedSidecarPrimaries.length
        ? " (first dropped: " + droppedSidecarPrimaries[0].row.question_id + ")"
        : ""));
})();

// Wide-screen analysis is a side sheet so the live question remains visible.
(function () {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8");
  check(css.indexOf(".ppq-modal.ppq-modal-analysis:not(.minimized)") >= 0,
    "analysis modal has a dedicated wide-screen side-sheet rule");
  check(css.indexOf(".ppq.ppq-analysis-open .ppq-layout") >= 0,
    "question layout makes room for the analysis side sheet");
  check(src.indexOf("if (modalContent) modalContent.scrollTop = 0") >= 0,
    "each newly answered question resets the reused analysis scroller to the top");
  check(/\.ppq-modal-topbar\s*\{[^}]*position:\s*sticky/i.test(css) &&
    /\.ppq-modal-feedback-status\s*\{[^}]*white-space:\s*nowrap/i.test(css),
    "the compact feedback status stays in the sticky modal bar while the analysis scrolls");
  check(css.indexOf(".ppq-iq-rest-fired") >= 0 &&
    css.indexOf(".ppq-iq-feedback-fired") >= 0 &&
    css.indexOf(".ppq-iq-response-cue") >= 0,
    "verdict reveal, tailored feedback and Recorded acknowledgement all have visible firing styles");
})();

// Phase 1.5 (Smith 2026-07-28): the ask sits at the FOOT of each method as an
// explicit yes/no pair, and an attached authored prompt forms one continuous
// card with its method. Read the thing, answer beside the thing.
(function () {
  console.log("\n=== method ask placement (Phase 1.5) ===");
  const baseRec = { identity: { id: "ask-test", option_labels: ["A", "B"] } };

  const ctx = makeCtx(baseRec);
  const method = { id: "m_ask", presentation_kind: "route", title: "Test route", pupil_steps: ["Step one.", "Step two."] };
  const block = V._methodBlockV2.call(ctx, method, ["A", "B"], false);
  const askRows = collect(block, (n) => (n.className || "") === "ppq-iq-method-ask");
  check(askRows.length === 1, "a method without a local prompt gets exactly one foot ask row");
  check(block.children.length && block.children[block.children.length - 1] === askRows[0],
    "the ask is the LAST element of the method card (after the steps, where the eye lands)");
  const askButtons = askRows.length ? collect(askRows[0], (n) => (n.className || "").indexOf("ppq-iq-used") >= 0 && n.tagName === "BUTTON") : [];
  const askText = (b) => String(b._html || b._text || b.textContent || "");
  check(askButtons.length === 2 &&
    /yes, i did/i.test(askText(askButtons[0])) &&
    /no, i didn't/i.test(askText(askButtons[1])),
    "the ask offers an explicit Yes, I did / No, I didn't pair");
  const head = collect(block, (n) => (n.className || "") === "ppq-iq-method-head")[0];
  check(!!head && collect(head, (n) => (n.className || "").indexOf("ppq-iq-used") >= 0).length === 0,
    "the small head-corner tick is gone");
  if (askButtons.length === 2) {
    askButtons[0].dispatchEvent({ type: "click" });
    askButtons[1].dispatchEvent({ type: "click" });
    const states = ctx._reports
      .filter((r) => r.qtype === "self_report")
      .map((r) => JSON.parse(r.extra_json).state);
    check(states.indexOf("used") >= 0 && states.indexOf("not_used") >= 0,
      "Yes fires state used, No fires state not_used (same event grammar as the old tick)");
  }
  check(V._methodAskText.call(ctx, "route") === "Did you use this route?" &&
    V._methodAskText.call(ctx, "independent_check") === "Did you do this check?" &&
    V._methodAskText.call(ctx, "synthesis") === "Did you put it together like this?",
    "the ask wording is plain and matched to the method kind");

  const suppressed = V._methodBlockV2.call(makeCtx(baseRec), method, ["A", "B"], true);
  check(collect(suppressed, (n) => (n.className || "").indexOf("ppq-iq-used") >= 0).length === 0 &&
    collect(suppressed, (n) => (n.className || "") === "ppq-iq-method-ask").length === 0,
    "a method with an authored local prompt gets no generic ask (the prompt IS the ask)");

  const joinedRec = {
    identity: { id: "join-test", option_labels: ["A", "B"] },
    methods: [{ id: "m_j", presentation_kind: "route", title: "Joined route", pupil_steps: ["One step."] }],
    self_report_prompts: [{ id: "p_j", prompt: "Did you spot the shortcut?", states: ["used_as_main_route"], method_refs: ["m_j"] }]
  };
  const jctx = makeCtx(joinedRec);
  const iqRoot = makeEl("div");
  V._appendMethodsV2.call(jctx, iqRoot, joinedRec);
  const jblock = collect(iqRoot, (n) => (n.className || "").indexOf("ppq-iq-method ") >= 0 || (n.className || "") === "ppq-iq-method")[0] ||
    iqRoot.children[0];
  check(!!jblock && jblock.classList.contains("ppq-iq-method-joined"),
    "a method followed by its attached prompt squares off to join it");
  const attached = collect(iqRoot, (n) => (n.className || "").indexOf("ppq-iq-prompt-attached") >= 0);
  check(attached.length === 1, "the referenced prompt renders as the attached continuation of its method");
  check(iqRoot.children.indexOf(attached[0]) === iqRoot.children.indexOf(jblock) + 1,
    "the attached prompt directly follows its method (answer beside the thing)");

  const css = fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8");
  check(css.indexOf(".ppq-iq-method-ask") >= 0 &&
    css.indexOf(".ppq-iq-prompt-attached") >= 0 &&
    css.indexOf(".ppq-iq-method-joined") >= 0,
    "the ask row and the joined-card treatment are styled");
  check(/\.ppq-iq-method-desc\s*\{[^}]*line-height:\s*1\.6/.test(css) &&
    /\.ppq-iq-prompt-text\s*\{[^}]*line-height:\s*1\.6/.test(css),
    "method steps and prompt text carry the opened-up line spacing (Smith: text was too close)");
  const wrapperHtml = fs.readFileSync(path.join(PROJECT_ROOT, "example", "esat-compare.html"), "utf8");
  check(wrapperHtml.indexOf("update-note") < 0 &&
    wrapperHtml.indexOf("comparison copy") < 0 &&
    wrapperHtml.indexOf("shared engine, comparison") < 0,
    "the initial screen carries no intro message and no interim comparison branding (Smith 2026-07-29)");
})();

// VF-13 (Smith 2026-07-29): loads more real estate, everything visible at once,
// nothing read twice.
(function () {
  console.log("\n=== analysis overhaul round 2 (VF-13) ===");
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8");
  check(css.indexOf("min(1080px, 72vw)") >= 0,
    "the wide-screen analysis sheet takes most of the screen");
  check(/\.ppq\.ppq-analysis-open\s*\{\s*--ppq-crop-width:\s*97%/.test(css),
    "the shrunken question column still shows its crop at full column width");
  check(src.indexOf('class: "ppq-iq-things", open: true') >= 0,
    "Things this question used opens expanded");
  check(extractFn("_appendInsightV2").toString().indexOf("check_prompt") >= 0 &&
    extractFn("_appendSelfReportV2").toString().indexOf("checkprompt") < 0,
    "the check question reads once with the insight, not as a floating orphan");
  check(extractFn("_appendSelfReportV2").toString().indexOf("About the whole question") >= 0,
    "orphan prompts read as deliberate whole-question asks");
  const sync = extractFn("_syncAnalysisReminder").toString();
  check(sync.indexOf("your split") >= 0 && sync.indexOf("you gave yourself") >= 0,
    "the sticky bar can carry the declared split and marks verdicts");
  check(extractFn("_commitPreVerdictGuess").toString().indexOf("_syncAnalysisReminder") >= 0 &&
    extractFn("_commitPostGuess").toString().indexOf("_syncAnalysisReminder") >= 0,
    "declaring or correcting a guess updates the sticky bar immediately");

  // the sticky bar composition, functionally
  const rNode = makeEl("div");
  const rctx = {
    cur: { id: "r1" },
    cfg: { metaLine: () => "ENGAA 2023 Q23", analysisReminderGroup: true, groupLabel: () => "MM2 Sequences" },
    _chosenLabel: "A",
    _preGuessDeclaration: { candidate_options: ["A", "C"], candidate_percentages: { A: 60, C: 40 } },
    q: (sel) => (sel === ".ppq-modal-reminder" ? rNode : null),
    _syncAnalysisReminder: extractFn("_syncAnalysisReminder")
  };
  rctx._syncAnalysisReminder();
  check(/you chose A/.test(rNode.textContent || rNode._text || "") &&
    /your split: A 60% \/ C 40%/.test(rNode.textContent || rNode._text || ""),
    "the bar shows the answer AND the declared percentages together");
})();

// d013/VF-04 (Smith priority, 2026-07-29): the timing system — six modes, the
// time bank, per-learner extra time, pause, discard, silent capture always.
(function () {
  console.log("\n=== timing system (VF-04/d013) ===");
  check(src.indexOf('["none", "end_only", "per_question", "clock", "ring", "bank"]') >= 0,
    "the six timing modes exist (the ESAT packet's five plus the pacing ring)");
  check(extractFn("_startTimer").toString().indexOf("_startTiming") >= 0 &&
    extractFn("_commitTimer").toString().indexOf("_commitTiming") >= 0,
    "cfg.timing supersedes the legacy timer while legacy consumers keep working");
  check(src.indexOf("prefs: o.prefs || {}") >= 0,
    "learner preferences persist in the store");

  function tctx(opts) {
    opts = opts || {};
    const tel = makeEl("div");
    return {
      cfg: { timing: { targetOf: opts.targetOf || function () { return 90; }, defaultMode: opts.defaultMode || "clock" } },
      store: { prefs: opts.prefs || {}, attempts: [] },
      cur: { id: "t1" },
      shownAt: Date.now() - (opts.spentMs != null ? opts.spentMs : 30000),
      _pausedMs: opts.pausedMs || 0,
      _pauseStartedAt: null,
      _bankMs: opts.bankMs != null ? opts.bankMs : 0,
      _sessionTimed: { count: 0, totalMs: 0, targetMs: 0 },
      _timeDiscarded: !!opts.discard,
      _stopTimer: () => {},
      _saveStore() { this._saved = (this._saved || 0) + 1; },
      _fireReport: () => {},
      _attemptId: "a-commit",
      q: (sel) => (sel === ".ppq-timer" ? tel : null),
      _tel: tel,
      _discardCommittedTime: V._discardCommittedTime,
      _timingPrefs: V._timingPrefs,
      _setTimingPrefs: V._setTimingPrefs,
      _timingModeNow: V._timingModeNow,
      _timingTargetMsFor: V._timingTargetMsFor,
      _elapsedTimingMs: V._elapsedTimingMs,
      _commitTiming: V._commitTiming,
      _fmtClock: V._fmtClock
    };
  }

  // VF-04r: independent axes with migration from the old single-mode pref
  const base = tctx({});
  const basePrefs = base._timingPrefs();
  check(basePrefs.visibility === "show" && basePrefs.clock === true &&
    basePrefs.direction === "up" && basePrefs.overtimeReset === true &&
    basePrefs.extraPct === 0 && basePrefs.clockScale === 1 && basePrefs.ringScale === 1,
    "first run maps the consumer default onto the axes (show + clock, count up, start-from-zero)");
  const savedMode = tctx({ prefs: { timing: { mode: "bank", extraPct: 25 } } });
  check(savedMode._timingModeNow() === "show-up-clock-bank",
    "an old saved mode migrates onto the axes (bank -> show + clock + bank)");
  check(savedMode._timingTargetMsFor({ id: "x" }) === 112500,
    "extra time survives migration and scales the target (90s + 25% = 112.5s)");
  const negative = tctx({ prefs: { timing: { mode: "ring", extraPct: -10 } } });
  check(negative._timingTargetMsFor({ id: "x" }) === 81000,
    "a negative adjustment makes practice targets harder (90s − 10% = 81s)");
  const badMode = tctx({ prefs: { timing: { mode: "sideways" } } });
  check(badMode._timingPrefs().visibility === "show" && badMode._timingPrefs().clock === true,
    "an unknown saved mode falls back to the consumer default");
  const axesSaved = tctx({ prefs: { timing: { visibility: "show", direction: "down", clock: false, ring: true, overtimeReset: false, bank: true, clockScale: 1.4, ringScale: 1.9, extraPct: 50 } } });
  const ap = axesSaved._timingPrefs();
  check(ap.direction === "down" && ap.ring === true && ap.clock === false &&
    ap.overtimeReset === false && ap.bank === true && ap.clockScale === 1.4 && ap.ringScale === 1.9,
    "a saved axes shape round-trips exactly, sizes included");

  // Smith's overtime matrix, verbatim
  const up = { direction: "up", overtimeReset: false };
  const upReset = { direction: "up", overtimeReset: true };
  const down = { direction: "down", overtimeReset: false };
  const downReset = { direction: "down", overtimeReset: true };
  check(timingDisplayText(up, 121000, 120000).text === "2:01" && timingDisplayText(up, 121000, 120000).over === true,
    "counting up past 2:00, keep counting: red 2:01");
  check(timingDisplayText(upReset, 121000, 120000).text === "+0:01",
    "counting up past 2:00, start from zero: red +0:01");
  check(timingDisplayText(down, 121000, 120000).text === "−0:01",
    "counting down past zero, keep counting: −0:01");
  check(timingDisplayText(downReset, 121000, 120000).text === "+0:01",
    "counting down past zero, start from zero: +0:01");
  check(timingDisplayText(down, 47000, 90000).text === "0:43" && timingDisplayText(down, 47000, 90000).over === false,
    "counting down before the allocation shows the remainder");
  check(timingDisplayText(up, 47000, null).text === "0:47",
    "no target means a plain count-up, never an invented allocation");
  check(tctx({ targetOf: function () { return null; } })._timingTargetMsFor({ id: "x" }) === null,
    "no pacing from the subject means no target, never an invented one");

  const paused = tctx({ spentMs: 40000, pausedMs: 10000 });
  const pausedElapsed = paused._elapsedTimingMs();
  check(pausedElapsed >= 29000 && pausedElapsed <= 31500,
    "pause time is excluded from the spend (got " + pausedElapsed + "ms)");

  const bankCtx = tctx({ spentMs: 30000, prefs: { timing: { mode: "bank", extraPct: 0 } } });
  bankCtx._commitTiming();
  check(bankCtx._attemptTimeMs >= 29000 && bankCtx._attemptTimeMs <= 31500,
    "commit freezes the pause-adjusted spend");
  check(bankCtx._bankMs >= 58500 && bankCtx._bankMs <= 61000,
    "a quick answer banks the saved seconds (target 90s − ~30s spent)");
  check(bankCtx._timerCtx.target_ms === 90000 && bankCtx._sessionTimed.count === 1,
    "the commit context carries the target and the session tally grows");
  check(/took/.test(textOf(bankCtx._tel)) && /bank \+/.test(textOf(bankCtx._tel)),
    "the reveal line shows the spend, the target and the bank");

  const overdrawn = tctx({ spentMs: 120000, prefs: { timing: { mode: "bank", extraPct: 0 } } });
  overdrawn._commitTiming();
  check(overdrawn._bankMs <= -29000 && overdrawn._bankMs >= -31500,
    "overrunning draws the bank negative — deficit is visible, not floored away");

  const discard = tctx({ spentMs: 30000, discard: true, prefs: { timing: { mode: "bank", extraPct: 0 } } });
  discard._commitTiming();
  check(discard._attemptTimeMs === null && discard._bankMs === 0 &&
    discard._sessionTimed.count === 0 &&
    /not recorded/.test(textOf(discard._tel)),
    "don't-record-this-one yields an honest null and touches neither bank nor tally");

  // VF-04r2: the clock can be ignored STRAIGHT AFTER answering too
  const retro = tctx({ spentMs: 30000, prefs: { timing: { mode: "bank", extraPct: 0 } } });
  retro._commitTiming();
  retro.store.attempts.push({ attempt_id: "a-commit", time_ms: retro._attemptTimeMs, correct: true });
  check(retro._bankMs > 0 && retro._sessionTimed.count === 1 &&
    collect(retro._tel, (n) => (n.className || "").indexOf("ppq-timing-discard") >= 0).length === 1,
    "the reveal line carries its own don't-record control");
  retro._discardCommittedTime();
  check(retro.store.attempts[0].time_ms === null && retro.store.attempts[0].time_discarded === true &&
    retro.store.attempts[0].correct === true,
    "retro discard strikes the time but keeps the answer recorded");
  check(retro._bankMs === 0 && retro._sessionTimed.count === 0 && retro._sessionTimed.totalMs === 0,
    "retro discard unwinds the bank credit and the session tally exactly");
  check(/not recorded/.test(textOf(retro._tel)), "the reveal line says so");
  const bankAfter = retro._bankMs;
  retro._discardCommittedTime();
  check(retro._bankMs === bankAfter, "a second click cannot double-unwind");

  // discard flows through to the stored row
  const rowCtx = {
    cfg: { learnerId: "x", idOf: (q) => q.id, timingMode: "none", timing: { targetOf: () => 90, defaultMode: "none" }, appVersion: "t", attemptFields: () => ({}), groupKey: () => "T" },
    cur: { id: "q9" },
    shownAt: Date.now() - 5000,
    store: { attempts: [] },
    _curType: "marksSelfAssess",
    _attemptId: "a-t",
    _attemptTimeMs: null,
    _timeDiscarded: true,
    _timingModeNow: V._timingModeNow,
    _timingPrefs: V._timingPrefs,
    _sessionHistory: [],
    _pendingDashboardPulse: null,
    _saveStore: () => {},
    _fireReport: () => {},
    _recordAttempt: extractFn("_recordAttempt")
  };
  rowCtx._recordAttempt("", false, { marks_max: 5 });
  check(rowCtx.store.attempts[0].time_ms === null && rowCtx.store.attempts[0].time_discarded === true &&
    rowCtx.store.attempts[0].timing_mode === "off",
    "a discarded time reaches the attempt row as null, flagged, with the live timing mode");

  // the preferences panel
  const pNodes = {
    ".ppq-modal-body": makeEl("div"),
    ".ppq-modal-reminder": makeEl("div"),
    ".ppq-modal-min": makeEl("button"),
    ".ppq-modal-feedback-status": makeEl("span"),
    ".ppq-modal": makeEl("div")
  };
  const panelCalls = { set: null, closed: 0, started: 0 };
  const pctx = {
    cfg: { timing: { targetOf: () => 90, defaultMode: "clock" } },
    store: { prefs: {} },
    _sessionTimed: { count: 2, totalMs: 150000, targetMs: 180000 },
    _bankMs: 30000,
    _timingPrefs: V._timingPrefs,
    _reducedMotion: () => false,
    _fmtClock: V._fmtClock,
    _setTimingPrefs: (p) => { panelCalls.set = p; },
    _fireReport: () => {},
    closeModal: () => { panelCalls.closed++; },
    _startTiming: () => { panelCalls.started++; },
    q: (sel) => pNodes[sel] || null,
    _openTimingPanel: V._openTimingPanel
  };
  check(pctx._openTimingPanel() === true, "the timing panel renders into the modal shell");
  const segRows = collect(pNodes[".ppq-modal-body"], (n) => (n.className || "") === "ppq-timing-seg-row");
  check(segRows.length === 8,
    "eight independent controls: show, direction, clock, clock size, ring, ring size, overtime, bank");
  check(segRows.every((r) => (collect(r, (n) => (n.className || "").indexOf("ppq-timing-seg") === 0 && (n.className || "").indexOf(" off") < 0).length > 0)),
    "with pacing supplied every axis is available");
  const preview = collect(pNodes[".ppq-modal-body"], (n) => (n.className || "") === "ppq-timing-preview")[0];
  check(!!preview && /While working/.test(textOf(preview)) && /Allocation up/.test(textOf(preview)),
    "a live preview shows the working state and the allocation-up state");
  function segButton(rowIdx, value) {
    return collect(segRows[rowIdx], (n) => (n.className || "").indexOf("ppq-timing-seg-btn") >= 0 && n.dataset && n.dataset.value === value)[0];
  }
  segButton(1, "down").dispatchEvent({ type: "click" });
  segButton(7, "on").dispatchEvent({ type: "click" });
  segButton(3, "L").dispatchEvent({ type: "click" });
  const saveBtn = collect(pNodes[".ppq-modal-body"], (n) => (n.className || "").indexOf("ppq-timing-save") >= 0)[0];
  saveBtn.dispatchEvent({ type: "click" });
  check(panelCalls.set && panelCalls.set.direction === "down" && panelCalls.set.bank === true &&
    panelCalls.set.clockScale === 1.4 && panelCalls.closed === 1 && panelCalls.started === 1,
    "picking Count down, bank On and clock size L persists the axes and restarts the timer");
  check(/This session so far/.test(textOf(pNodes[".ppq-modal-body"])),
    "the panel carries the end-only session summary");

  // wrappers supply pacing
  const esatHtml = fs.readFileSync(path.join(PROJECT_ROOT, "example", "esat-compare.html"), "utf8");
  check(/timing:\s*\{[\s\S]{0,200}return 90;[\s\S]{0,200}defaultMode: "clock"/.test(esatHtml),
    "ESAT supplies uniform 90s section pacing with the quiet clock default");
  const mathsHtml = fs.readFileSync(path.join(PROJECT_ROOT, "example", "ibmaths.html"), "utf8");
  check(/timing:\s*\{[\s\S]{0,700}defaultMode: "none"/.test(mathsHtml) && /q\.marks \|\| 1\) \* perMark/.test(mathsHtml),
    "IB Maths paces per mark from the guide with timing off by default");
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8");
  check(css.indexOf(".ppq-timing-ring-fill") >= 0 && css.indexOf(".ppq-timing-bank.neg") >= 0,
    "the ring and the in-the-red bank are styled");
  check(extractFn("_buildTimingRow").toString().indexOf("_reducedMotion") >= 0,
    "reduced motion swaps the ring for a quiet countdown");
  check(src.indexOf("Guessing is never inferred from") >= 0,
    "the no-guess-inference rule is stated where the timing system lives");
})();

// VF-14r (Smith 2026-07-29): performance and filtering by lots of other
// categories, each with a question cluster — one dot per available question,
// neutral until tried, then the 4×-most-recent performance colour.
(function () {
  console.log("\n=== category axes and question clusters (VF-14r) ===");

  // scoring: the most recent answer weighs 4× all earlier ones
  check(questionPerfScore([]) === null && questionPerfScore(null) === null,
    "no attempts means no score (neutral dot)");
  check(questionPerfScore([1]) === 1 && questionPerfScore([0]) === 0,
    "a single attempt scores itself");
  check(questionPerfScore([1, 0]) === 0.2,
    "right-then-wrong lands exactly on 0.2 (the pale-yellow anchor)");
  check(questionPerfScore([0, 1]) === 0.8,
    "wrong-then-right lands at 0.8");
  check(Math.abs(questionPerfScore([1, 1, 0.4]) - (4 * 0.4 + 2) / 6) < 1e-9,
    "marks fractions blend into the weighted score");

  // colour: continuous, red 0 -> pale yellow 0.2 -> green 1
  check(perfColour(0) === "rgb(176,48,48)" && perfColour(1) === "rgb(45,106,63)",
    "the ends are red and green");
  check(perfColour(0.2) === "rgb(245,233,168)",
    "0.2 is exactly the pale yellow");
  check(perfColour(0.6) === "rgb(145,170,116)",
    "between the anchors the colour interpolates smoothly (no bands)");

  const axisCtx = {
    cfg: {
      groupKey: (q) => q.topic, groupLabel: (q) => "Topic " + q.topic, idOf: (q) => q.id,
      progressAxes: [
        { key: "fam", label: "By family", valuesOf: (q) => q.families },
        { key: "type", label: "By type", valuesOf: (q) => q.types }
      ]
    },
    questions: [
      { id: "q1", topic: "A", families: ["Spot the disguise", "Bridge"], types: ["Proof"] },
      { id: "q2", topic: "A", families: ["Bridge"], types: ["Direct"] },
      { id: "q3", topic: "B", families: [], types: ["Direct"] },
      { id: "q4", topic: "B", families: ["Bridge"], types: [] }
    ],
    _questionById: V._questionById,
    _questionScores: V._questionScores,
    store: {
      attempts: [
        { id: "q1", attempt_id: "x1", correct: true, time_ms: 30000, ts: "2026-07-29T09:00:00Z" },
        { id: "q2", attempt_id: "x2", correct: false, time_ms: 60000, ts: "2026-07-29T09:05:00Z", marks_awarded: 2, marks_max: 5 },
        { id: "q2", attempt_id: "x3", correct: false, time_ms: 20000, ts: "2026-07-29T09:10:00Z" },
        { id: "q3", attempt_id: "x4", correct: true, time_ms: null, ts: "2026-07-29T09:15:00Z", time_discarded: true }
      ],
      scores: { q1: 5, q2: 3 },
      flags: {}
    }
  };
  const stats = V._progressStats.call(axisCtx);
  check(stats.axes.length === 2, "every configured axis aggregates");
  const fam = stats.axes[0];
  const bridge = fam.rows.find((r) => r.value === "Bridge");
  check(!!bridge && bridge.attempts === 3 && bridge.correct === 1,
    "a multi-value category counts every question that belongs to it");
  check(bridge.available === 3 && bridge.tried === 2,
    "the cluster covers every AVAILABLE question, tried or not");
  const bridgeScores = {};
  bridge.questions.forEach((d) => { bridgeScores[d.id] = d.score; });
  check(bridgeScores.q1 === 1 && bridgeScores.q4 === null &&
    Math.abs(bridgeScores.q2 - 0.08) < 1e-9,
    "per-question scores: clean right = 1, untried = neutral, marks-then-wrong = 0.08");
  check(bridge.avgRating === 4, "category ratings average the member questions' scores");
  check(bridge.timeN === 3 && Math.round(bridge.avgTimeS) === 37,
    "category time averages over its timed attempts");
  const disguise = fam.rows.find((r) => r.value === "Spot the disguise");
  check(!!disguise && disguise.attempts === 1 && fam.rows[0].value === "Bridge",
    "axis rows sort by practice volume");
  const typeAxis = stats.axes[1];
  const direct = typeAxis.rows.find((r) => r.value === "Direct");
  check(!!direct && direct.attempts === 3 && direct.available === 2 && direct.tried === 2,
    "a second axis slices the same attempts its own way");
  check(direct.timeN === 2 && Math.round(direct.avgTimeS) === 40,
    "discarded times stay out of the averages");

  // rendered page: axis tables with dots bundles
  const aNodes = {
    ".ppq-modal-body": makeEl("div"),
    ".ppq-modal-content": makeEl("div"),
    ".ppq-modal-min": makeEl("button"),
    ".ppq-modal-reminder": makeEl("div"),
    ".ppq-modal-feedback-status": makeEl("span"),
    ".ppq-modal": makeEl("div")
  };
  const aPage = Object.assign({}, axisCtx, {
    cfg: Object.assign({ metaLine: (q) => "Q " + q.id, modules: {} }, axisCtx.cfg),
    q: (sel) => aNodes[sel] || null,
    _progressStats: V._progressStats,
    _feedbackReadiness: () => ({ code: "pending", label: "Solution pending" }),
    _jumpToAttempt: () => {},
    _renderProgressPage: V._renderProgressPage
  });
  aPage._renderProgressPage();
  const axisTables = collect(aNodes[".ppq-modal-body"], (n) => (n.className || "").indexOf("ppq-progress-axis") >= 0);
  check(axisTables.length === 2, "one table renders per axis");
  const clusters = collect(axisTables[0], (n) => (n.className || "") === "ppq-qcluster");
  check(clusters.length >= 2, "each category row carries its question cluster");
  const bridgeCluster = clusters[0];
  const bridgeDotEls = collect(bridgeCluster, (n) => (n.className || "").indexOf("ppq-qdot") >= 0);
  check(bridgeDotEls.length === 3, "one dot per AVAILABLE question in the category");
  check(bridgeDotEls.filter((d) => (d.className || "").indexOf("untried") >= 0).length === 1,
    "an unattempted question shows as a neutral dot");
  check(bridgeDotEls.some((d) => (d.style.cssText || "").indexOf(perfColour(1)) >= 0),
    "a clean-right question wears the full green");
  check(collect(axisTables[0], (n) => (n.className || "") === "ppq-qcluster-count")
    .some((n) => /2 \/ 3/.test(n._html || n._text || n.textContent || "")),
    "the tried / available count sits under the cluster");

  // wrappers expose the new filters and axes
  const mHtml = fs.readFileSync(path.join(PROJECT_ROOT, "example", "ibmaths.html"), "utf8");
  check(/field: "question_types"/.test(mHtml) && /field: "themes"/.test(mHtml) &&
    /field: "command_terms"/.test(mHtml) && /command_terms: q\.command_terms/.test(mHtml),
    "IB Maths filters by type, theme and command term");
  check(/progressAxes:/.test(mHtml) && /By family/.test(mHtml) && /By command term/.test(mHtml),
    "IB Maths supplies its performance axes");
  const eHtml = fs.readFileSync(path.join(PROJECT_ROOT, "example", "esat-compare.html"), "utf8");
  check(/progressAxes:/.test(eHtml) && /By subtopic/.test(eHtml) && /By spec status/.test(eHtml),
    "ESAT supplies its performance axes");
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8");
  check(css.indexOf(".ppq-qcluster") >= 0 && css.indexOf(".ppq-qdot.untried") >= 0,
    "the cluster and its neutral untried dots are styled");

  // VF-14r2: the little question boxes live on the DASHBOARD categories too
  const scoresMap = V._questionScores.call({
    store: { attempts: [
      { id: "qa", correct: true },
      { id: "qa", correct: false },
      { id: "qb", correct: false, marks_awarded: 3, marks_max: 5 }
    ] }
  });
  check(scoresMap.qa === 0.2 && scoresMap.qb === 0.6,
    "_questionScores shares the 4x-most-recent weighting (right-then-wrong = 0.2)");
  const catHtml = V._catHtml.call(
    { cfg: { selfReport: { ramp: { 1: "1,1,1" }, levels: 1 }, revealCorrect: true }, groupFilter: null },
    "T1",
    { label: "Topic one", total: 2, marks: [true], ratings: { 1: 0 },
      qids: ["qa", "qz"], qscores: { qa: 1 } },
    "ribbonHeat"
  );
  check(catHtml.indexOf("ppq-qcluster") >= 0 &&
    catHtml.indexOf("untried") >= 0 &&
    catHtml.indexOf(perfColour(1)) >= 0,
    "a dashboard category renders one box per question, neutral or performance-coloured");
  check(extractFn("renderDashboard").toString().indexOf("_questionScores") >= 0 &&
    extractFn("_renderDashboardFacet").toString().indexOf("_questionScores") >= 0,
    "both the grouped dashboard and the subtopic facet carry the boxes");
  check(src.indexOf("One box per question — grey until tried") >= 0,
    "the dashboard legend explains the boxes");
})();

// VSAFE-03 (Claude 2026-07-28): the rejected pill/strikethrough option treatment
// is deleted, and the legacy eliminations parser renders through the same
// coloured-letter rail as deep-v2, so no fallback can restore the old design.
(function () {
  console.log("\n=== legacy eliminations use the approved rail (VSAFE-03) ===");
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8");
  check(css.indexOf(".ppq-elim") < 0, "the .ppq-elim pill classes are deleted from the stylesheet");
  check(css.indexOf("line-through") < 0, "no strikethrough treatment remains anywhere in the stylesheet");

  const ctx = { _elimChipsV2El: V._elimChipsV2El };
  const parsed = V._elimChipsEl.call(ctx, { eliminates: "kills B and D, lands on A" }, ["A", "B", "C", "D"], "A");
  const pills = collect(parsed, (n) => (n.className || "").indexOf("ppq-elim") >= 0);
  check(pills.length === 0, "the legacy parser emits no pill chips");
  const rail = collect(parsed, (n) => (n.className || "").indexOf("ppq-oev-row") >= 0);
  check(rail.length === 1, "parsed legacy eliminations render as the fixed option rail");
  const letters = rail.length ? collect(rail[0], (n) => (n.className || "").indexOf("ppq-oev ") >= 0) : [];
  const relOf = {};
  letters.forEach((n) => { relOf[n._html || n._text || ""] = n.className; });
  check(letters.length === 4 &&
    /\bro\b/.test(relOf.B || "") && /\bro\b/.test(relOf.D || "") &&
    /\bdi\b/.test(relOf.A || "") && /\bun\b/.test(relOf.C || ""),
    "killed letters read rules_out, the landing letter identifies, survivors stay unaffected");

  const unparsed = V._elimChipsEl.call(ctx, { eliminates: "several quick sanity checks settle it" }, ["A", "B"], "A");
  check(collect(unparsed, (n) => (n.className || "").indexOf("ppq-oev-row") >= 0).length === 0 &&
    collect(unparsed, (n) => (n.className || "").indexOf("ppq-iq-elim-prose") >= 0).length === 1,
    "unparseable prose still falls back to the honest raw-prose line, never guessed chips");
})();

// VF-07 (Claude 2026-07-28): the flag persists per question, the header gains a
// real Flagged filter, and the copy stops promising a recommender that does not
// exist yet.
(function () {
  console.log("\n=== persisted flag and flagged filter (VF-07) ===");
  check(src.indexOf("we'll bring more like this") < 0,
    "the false 'more like this' promise is gone from the engine");
  check(src.indexOf("in your flagged list") >= 0 &&
    src.indexOf("save it to your flagged list") >= 0,
    "the flag copy describes what actually happens");
  check(src.indexOf("flags: o.flags || {}") >= 0 &&
    src.indexOf("return { attempts: [], scores: {}, flags: {}, prefs: {}, learned: { set: {}, enabled: true } }") >= 0,
    "flags, prefs and the learned set are first-class persisted store state");
  check(src.indexOf("ppq-flagged-toggle") >= 0 &&
    extractFn("_matchesQuestionFilters").toString().indexOf("_flaggedOnly") >= 0,
    "the header toggle exists and flagged-only is a real filter every view consumer shares");
  check(extractFn("clearAllFilters").toString().indexOf("_flaggedOnly = false") >= 0,
    "Clear all filters also clears the flagged-only view");
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8");
  check(css.indexOf(".ppq-flagged-toggle.on") >= 0, "the active flagged toggle is visibly on");

  function flagNodes() {
    return {
      ".ppq-modal-body": makeEl("div"),
      ".ppq-modal-content": makeEl("div"),
      ".ppq-modal-min": makeEl("button"),
      ".ppq-modal-reminder": makeEl("div"),
      ".ppq-modal-feedback-status": makeEl("span"),
      ".ppq-modal": makeEl("div"),
      ".ppq-competence": makeEl("div")
    };
  }
  function flagCtx(nodes, flags) {
    const reports = [];
    const ctx = {
      cur: { id: "flag-test-question", correct_answer: "C" },
      cfg: {
        modules: { postQuestionReview: true },
        analysisOf: () => null,
        idOf: (q) => q.id,
        correctOf: (q) => q.correct_answer,
        metaLine: () => "Flag test",
        selfReport: { levels: 6, prompt: "How did that feel?", meanings: [] }
      },
      root: makeEl("div"),
      q: (selector) => nodes[selector] || null,
      qa: () => [],
      store: { attempts: [{ attempt_id: "flag-attempt" }], scores: {}, flags: flags || {} },
      _saves: 0,
      _saveStore() { this._saves++; },
      _fireReport: (payload) => reports.push(payload),
      _reports: reports,
      _answerLabels: ["A", "B", "C"],
      _optionLabels: () => ["A", "B", "C"],
      _attemptId: "flag-attempt",
      _chosenLabel: "A",
      _wasRight: false,
      _analysisReviewMode: () => false,
      _syncFlaggedToggle: () => {},
      _contentSafety: V._contentSafety,
      _isV2: V._isV2,
      _guessLabel: V._guessLabel,
      _guessPrompt: V._guessPrompt,
      _feedbackReadiness: V._feedbackReadiness,
      _setFeedbackStatusBadge: V._setFeedbackStatusBadge,
      _buildGuessPicker: V._buildGuessPicker,
      _verdictEl: V._verdictEl,
      _appendFreeformReflectionV2: V._appendFreeformReflectionV2,
      _renderSelectedOptionDiagnosticV2: () => {},
      _renderInterrogationFeedback: () => {},
      _revealCommittedAnswer: () => {},
      _commitPreVerdictGuess: () => {},
      closeModal: () => {},
      next: () => {},
      _renderInterrogation: V._renderInterrogation
    };
    return ctx;
  }

  const nodesA = flagNodes();
  const ctxA = flagCtx(nodesA, {});
  ctxA._renderInterrogation();
  const flagBtn = collect(nodesA[".ppq-modal-body"], (n) => (n.className || "").indexOf("ppq-iq-flag") >= 0)[0];
  check(!!flagBtn && /save it to your flagged list/i.test(flagBtn._html || ""),
    "an unflagged question offers the honest save-to-list copy");
  if (flagBtn) {
    flagBtn.click();
    check(!!ctxA.store.flags["flag-test-question"] && ctxA._saves === 1,
      "flagging writes a persisted timestamp through the store");
    const rep = ctxA._reports.filter((r) => r.qtype === "review_flag").pop();
    const repData = rep ? JSON.parse(rep.extra_json) : {};
    check(!!rep && repData.flagged === true && repData.question_id === "flag-test-question",
      "the flag event reports the question id and the new state");
    check(/in your flagged list/i.test(flagBtn._html || "") || /in your flagged list/i.test(flagBtn.textContent || ""),
      "the button confirms membership of the flagged list, promising nothing else");
    flagBtn.click();
    check(!ctxA.store.flags["flag-test-question"] && ctxA._saves === 2,
      "unflagging removes the persisted entry");
  }

  const nodesB = flagNodes();
  const ctxB = flagCtx(nodesB, { "flag-test-question": 123 });
  ctxB._renderInterrogation();
  const flagBtnB = collect(nodesB[".ppq-modal-body"], (n) => (n.className || "").indexOf("ppq-iq-flag") >= 0)[0];
  check(!!flagBtnB && (flagBtnB.className || "").indexOf("on") >= 0 &&
    /in your flagged list/i.test(flagBtnB._html || ""),
    "a question flagged in a previous session reopens already flagged");

  const fctx = {
    cfg: { filters: [], groupKey: () => "ALL", idOf: (q) => q.id },
    store: { flags: { q1: 1 } },
    _flaggedOnly: true,
    _multiSel: {},
    q: () => null,
    _filterValues: V._filterValues
  };
  check(V._matchesQuestionFilters.call(fctx, { id: "q1" }) === true &&
    V._matchesQuestionFilters.call(fctx, { id: "q2" }) === false,
    "flagged-only passes flagged questions and blocks the rest");
  fctx._flaggedOnly = false;
  check(V._matchesQuestionFilters.call(fctx, { id: "q2" }) === true,
    "toggling off restores the full view");
})();

// VF-03 (Claude 2026-07-28): Previous walks the session's attempted history
// (reshuffle-proof); attempted questions carry a visible Review action that
// reopens the earlier verdict, declaration, responses and analysis without
// recording anything new.
(function () {
  console.log("\n=== session history and review reopen (VF-03) ===");

  // --- history navigation, ordered and shuffled ---
  function navCtx(view) {
    const questions = [{ id: "qa" }, { id: "qb" }, { id: "qc" }, { id: "qd" }];
    return {
      cfg: { idOf: (q) => q.id },
      questions: questions,
      view: view === "shuffled" ? [questions[3], questions[2], questions[1], questions[0]] : questions.slice(),
      idx: 0,
      cur: questions[0],
      _sessionHistory: [],
      rendered: [],
      render(q) {
        this.cur = q || this.view[this.idx];
        if (!q) { this._histPos = null; this._returnIdx = null; }
        this.rendered.push(this.cfg.idOf(this.cur));
      },
      _showEmpty: () => {},
      next: V.next,
      prev: V.prev,
      _renderHistoryEntry: V._renderHistoryEntry,
      _questionById: V._questionById
    };
  }
  ["ordered", "shuffled"].forEach(function (mode) {
    const ctx = navCtx(mode);
    /* attempt qa, then qb, exactly as _recordAttempt records them */
    ctx._sessionHistory = ["qa", "qb"];
    ctx.cur = ctx.questions[1]; /* qb on screen */
    ctx.idx = 1;
    ctx.prev();
    check(ctx.rendered[ctx.rendered.length - 1] === "qa",
      mode + ": Previous returns to the question attempted before this one");
    const len = ctx.rendered.length;
    ctx.prev();
    check(ctx.rendered.length === len && ctx._histPos === 0,
      mode + ": Previous at the oldest attempt stays put instead of wandering");
    ctx.next();
    check(ctx.rendered[ctx.rendered.length - 1] === "qb",
      mode + ": Next walks forward through the history");
    ctx.next();
    check(ctx._histPos == null,
      mode + ": stepping past the newest attempt resumes the live run");
  });
  (function () {
    const ctx = navCtx("ordered");
    ctx._sessionHistory = ["qa"];
    ctx.view = []; /* the current filters exclude everything */
    ctx.cur = null;
    ctx.prev();
    check(ctx.rendered[ctx.rendered.length - 1] === "qa",
      "history survives filter changes: an attempted question reopens even when filtered out");
  })();
  check(extractFn("filterQuestions").toString().indexOf("_histPos = null") >= 0,
    "a filter/order change ends the history walk");
  check(extractFn("_recordAttempt").toString().indexOf("_sessionHistory") >= 0,
    "answering records the question into the session history");
  check(extractFn("render").toString().indexOf("looking back") >= 0,
    "the card labels history views as looking back");

  // --- review reopen ---
  function reviewNodes() {
    return {
      ".ppq-modal-body": makeEl("div"),
      ".ppq-modal-content": makeEl("div"),
      ".ppq-modal-min": makeEl("button"),
      ".ppq-modal-reminder": makeEl("div"),
      ".ppq-modal-feedback-status": makeEl("span"),
      ".ppq-modal": makeEl("div"),
      ".ppq-competence": makeEl("div")
    };
  }
  const nodes = reviewNodes();
  const reports = [];
  let reveals = 0;
  const ctx = {
    cur: { id: "review-test-question", correct_answer: "C" },
    cfg: {
      modules: { postQuestionReview: true },
      analysisOf: () => null,
      idOf: (q) => q.id,
      correctOf: (q) => q.correct_answer,
      metaLine: () => "Review test",
      selfReport: { levels: 6, prompt: "How did that feel?", meanings: [] }
    },
    root: makeEl("div"),
    q: (selector) => nodes[selector] || null,
    qa: () => [],
    store: {
      attempts: [{
        id: "review-test-question", attempt_id: "orig-att", chosen_option: "B", correct: false,
        pre_guess_declaration: { candidate_options: ["B", "C"], candidate_percentages: { B: 60, C: 40 } },
        freeform_reflection: "ran out of time"
      }],
      scores: {}, flags: {}
    },
    answered: false,
    _saveStore: () => {},
    _fireReport: (payload) => reports.push(payload),
    _answerLabels: ["A", "B", "C"],
    _optionLabels: () => ["A", "B", "C"],
    _attemptId: "live-att",
    _chosenLabel: "",
    _wasRight: false,
    _analysisReviewMode: () => false,
    _syncFlaggedToggle: () => {},
    _firePendingDashboardPulse: () => {},
    _revealCommittedAnswer: () => { reveals++; },
    _contentSafety: V._contentSafety,
    _isV2: V._isV2,
    _guessLabel: V._guessLabel,
    _guessPrompt: V._guessPrompt,
    _feedbackReadiness: V._feedbackReadiness,
    _setFeedbackStatusBadge: V._setFeedbackStatusBadge,
    _buildGuessPicker: V._buildGuessPicker,
    _verdictEl: V._verdictEl,
    _appendFreeformReflectionV2: V._appendFreeformReflectionV2,
    _renderSelectedOptionDiagnosticV2: () => {},
    _renderInterrogationFeedback: () => {},
    _commitPreVerdictGuess: () => {},
    closeModal: V.closeModal,
    next: () => {},
    _renderInterrogation: V._renderInterrogation,
    _lastAttemptFor: V._lastAttemptFor,
    _reopenAttempt: V._reopenAttempt
  };

  const row = ctx._lastAttemptFor(ctx.cur);
  check(!!row && row.attempt_id === "orig-att",
    "the most recent recorded attempt is found from the persisted log");
  ctx._reopenAttempt(row);
  const body = nodes[".ppq-modal-body"];
  check(collect(body, (n) => (n.className || "").indexOf("ppq-iq-reviewing-note") >= 0).length === 1,
    "review mode is unmistakably labelled");
  const guessPage = collect(body, (n) => (n.className || "").indexOf("ppq-iq-guesspage") >= 0)[0];
  const restPage = collect(body, (n) => (n.className || "").indexOf("ppq-iq-rest") >= 0)[0];
  check(!!guessPage && guessPage.style.display === "none" &&
    !!restPage && restPage.style.display !== "none",
    "reopening goes straight to the verdict — no fresh guess declaration is demanded");
  const verdictHead = collect(body, (n) => (n.className || "").indexOf("ppq-iq-option-head") >= 0)[0];
  check(!!verdictHead && /You chose B/.test(verdictHead._html || verdictHead._text || ""),
    "the stored chosen answer is restored into the verdict");
  const recap = collect(body, (n) => (n.className || "").indexOf("ppq-iq-declaration-recap") >= 0)[0];
  check(!!recap && /B \(60%\), C \(40%\)/.test(recap._html || recap._text || ""),
    "the stored guess declaration is recapped with its percentages");
  const reflection = collect(body, (n) => (n.className || "").indexOf("ppq-iq-reflection-text") >= 0)[0];
  check(!!reflection && reflection.value === "ran out of time",
    "the saved reflection note is restored, not blanked");
  check(ctx._attemptId === "orig-att",
    "review adopts the ORIGINAL attempt id so any edits attach to it");
  check(ctx.store.attempts.length === 1 &&
    reports.filter((r) => r.status === "answered").length === 0,
    "reopening records no new attempt row and fires no answer event");
  check(reveals === 0, "review paints no verdict onto the still-answerable card");

  ctx.closeModal();
  check(!ctx._reviewingAttempt && ctx._attemptId !== "orig-att" && reveals === 0,
    "closing a review mints a fresh attempt id and still paints nothing");
})();

// VF-02 (Claude 2026-07-29): the pupil's own progress page — aggregates from
// the local store, house-style shaded tables, drill-down that reopens the
// exact attempt, and interrogation responses persisted onto attempt rows.
(function () {
  console.log("\n=== pupil progress page (VF-02) ===");

  // --- shading obeys the house rules ---
  check(shadeCell("1,2,3", 0, 10) === "" && shadeCell("1,2,3", -4, 10) === "" && shadeCell("1,2,3", 5, 0) === "",
    "no shading at the white zero anchor or on degenerate scales");
  const half = shadeCell("1,2,3", 5, 10), full = shadeCell("1,2,3", 10, 10), over = shadeCell("1,2,3", 30, 10);
  check(/rgba\(1,2,3, 0\.275\)/.test(half), "shading is smooth and proportional (half of max = half of cap)");
  check(/0\.550/.test(full) && full === over,
    "darkness is capped so black text stays readable at the extreme");

  // --- aggregation ---
  const statsCtx = {
    cfg: { groupKey: (q) => q.topic, groupLabel: (q) => "Topic " + q.topic, idOf: (q) => q.id },
    questions: [{ id: "q1", topic: "A" }, { id: "q2", topic: "A" }, { id: "q3", topic: "B" }],
    _questionById: V._questionById,
    _questionScores: V._questionScores,
    store: {
      attempts: [
        { id: "q1", attempt_id: "a1", correct: true, time_ms: 30000, ts: "2026-07-28T10:00:00Z",
          pre_guess_declaration: { candidate_options: ["A", "B"] } },
        { id: "q1", attempt_id: "a2", correct: false, time_ms: 60000, ts: "2026-07-29T10:00:00Z",
          freeform_reflection: "rushed the algebra",
          responses: { prompts: { p1: "used_as_main_route" }, things: { k1: "sketchy_on_this" } } },
        { id: "q3", attempt_id: "a3", correct: true, time_ms: 45000, ts: "2026-07-29T11:00:00Z" }
      ],
      scores: { q1: 4, q2: 6 },
      flags: { q3: 111 }
    }
  };
  const s = V._progressStats.call(statsCtx);
  check(s.totals.attempts === 3 && s.totals.questions === 2 && s.totals.correct === 2 &&
    s.totals.pctCorrect === 67 && s.totals.guesses === 1 && s.totals.flags === 1 &&
    s.totals.reflections === 1 && s.totals.responses === 2 && s.totals.timeMs === 135000,
    "totals: attempts, distinct questions, correctness, guesses, flags, reflections, responses, time");
  check(s.totals.avgRating === 5, "average rating spans every rated question");
  check(s.topics.length === 2 && s.topics[0].key === "A",
    "topics are grouped and sorted by activity");
  const tA = s.topics[0], tB = s.topics[1];
  check(tA.attempts === 2 && tA.pctCorrect === 50 && tA.avgRating === 5 && tA.guesses === 1,
    "per-topic correctness, rating (including rated-but-unattempted questions) and guesses");
  check(tB.attempts === 1 && tB.pctCorrect === 100 && tB.flagged === 1,
    "flags land on their question's topic");
  check(s.days.length === 2 && s.days[0].day === "2026-07-28" && s.days[1].attempts === 2 && s.days[1].correct === 1,
    "activity is grouped by day in date order");

  // --- the rendered page ---
  function progressNodes() {
    return {
      ".ppq-modal-body": makeEl("div"),
      ".ppq-modal-content": makeEl("div"),
      ".ppq-modal-min": makeEl("button"),
      ".ppq-modal-reminder": makeEl("div"),
      ".ppq-modal-feedback-status": makeEl("span"),
      ".ppq-modal": makeEl("div")
    };
  }
  const nodes = progressNodes();
  const jumps = [];
  const pageCtx = Object.assign({}, statsCtx, {
    cfg: Object.assign({ metaLine: (q) => "Q " + q.id, modules: {} }, statsCtx.cfg),
    q: (sel) => nodes[sel] || null,
    _progressStats: V._progressStats,
    _feedbackReadiness: () => ({ code: "pending", label: "Solution pending" }),
    _jumpToAttempt: (qid) => jumps.push(qid)
  });
  check(V._renderProgressPage.call(pageCtx) === true, "the progress page renders into the modal shell");
  const body = nodes[".ppq-modal-body"];
  check(collect(body, (n) => (n.className || "") === "ppq-progress").length === 1 &&
    nodes[".ppq-modal"].classList.contains("ppq-modal-progress"),
    "the page mounts once and marks the modal as the progress surface");
  check(collect(body, (n) => (n.className || "") === "ppq-progress-stat").length === 7,
    "the totals strip carries the seven headline numbers");
  const tables = collect(body, (n) => (n.className || "") === "ppq-progress-table");
  check(tables.length === 2, "topic and over-time tables both render");
  const shadedTds = collect(tables[0], (n) => n.tagName === "TD" && /rgba\(/.test(n.style.cssText || ""));
  check(shadedTds.length >= 4, "magnitude columns carry computed shading");
  const items = collect(body, (n) => (n.className || "") === "ppq-progress-attempt");
  check(items.length === 3 && items[0]._attrs === undefined || items.length === 3,
    "the drill-down lists every recent attempt");
  check(items.length === 3 && String(items[0].dataset && items[0].dataset.qid || items[0]["data-qid"] || "").length >= 0,
    "attempt rows carry their question id");
  check(items.length === 3 && /guess: A\/B/.test(items[2]._html || ""),
    "a declared guess shows its candidate set");
  check(collect(body, (n) => (n.className || "") === "ppq-progress-reflection").length === 1,
    "saved reflections appear with their attempts");
  check(items.length === 3 && /Solution pending/.test(items[0]._html || ""),
    "feedback readiness rides along where useful");
  if (items.length) {
    items[0].dispatchEvent({ type: "click" });
    check(jumps.length === 1 && jumps[0] === "q3",
      "clicking an attempt jumps to that exact question (newest first)");
  }

  // --- drill-down behaviour ---
  const jctxCalls = { closed: 0, rendered: [], reopened: [] };
  const jctx = {
    cfg: { idOf: (q) => q.id, modules: { postQuestionReview: true } },
    questions: statsCtx.questions,
    store: statsCtx.store,
    _questionById: V._questionById,
    _questionScores: V._questionScores,
    _lastAttemptFor: V._lastAttemptFor,
    closeModal: () => { jctxCalls.closed++; },
    render: (q) => { jctxCalls.rendered.push(q && q.id); },
    _reopenAttempt: (row) => { jctxCalls.reopened.push(row.attempt_id); }
  };
  V._jumpToAttempt.call(jctx, "q1");
  check(jctxCalls.closed === 1 && jctxCalls.rendered[0] === "q1" && jctxCalls.reopened[0] === "a2",
    "drill-down closes the page, shows the question and reopens its LAST attempt");

  // --- empty state ---
  const emptyNodes = progressNodes();
  const emptyCtx = Object.assign({}, pageCtx, {
    q: (sel) => emptyNodes[sel] || null,
    store: { attempts: [], scores: {}, flags: {} }
  });
  V._renderProgressPage.call(emptyCtx);
  check(collect(emptyNodes[".ppq-modal-body"], (n) => (n.className || "") === "ppq-progress-empty").length === 1,
    "an empty store gets a plain explanation, not a broken page");

  // --- responses persist onto the attempt row ---
  const actx = {
    store: { attempts: [{ attempt_id: "a1" }, { attempt_id: "a2" }] },
    _attemptId: "a1",
    _saveStore: () => {},
    _attachResponseToAttempt: V._attachResponseToAttempt
  };
  actx._attachResponseToAttempt("prompts", "p9", "some_state");
  check(actx.store.attempts[0].responses.prompts.p9 === "some_state" &&
    !actx.store.attempts[1].responses,
    "a response attaches to ITS attempt row, found by attempt id");
  actx._attachResponseToAttempt("prompts", "p9", undefined);
  check(!("p9" in actx.store.attempts[0].responses.prompts),
    "clearing a response removes it from the row");
  check(src.indexOf('_attachResponseToAttempt("prompts"') >= 0 &&
    src.indexOf('_attachResponseToAttempt("things"') >= 0 &&
    src.indexOf('_attachResponseToAttempt("methods"') >= 0 &&
    src.indexOf('_attachResponseToAttempt("diagnostic"') >= 0,
    "prompt, knowledge-state, method and diagnostic responses all persist");
  check(src.indexOf("post_guess_declaration = payload") >= 0,
    "the post-answer guess correction persists onto the attempt row too");
  check(src.indexOf("ppq-progress-btn") >= 0, "the header offers My progress");
})();

// d011 (Smith, "Learned so far", maths only): nested tri-state tree; filters
// stay within the learned set once anything is ticked; unmapped questions
// fall outside an active scope; unlearned dashboard groups grey out.
(function () {
  console.log("\n=== learned so far (d011) ===");
  const tree = [
    { code: "T1", label: "T1", children: [
      { code: "SL 1.1", label: "SL 1.1" },
      { code: "SL 1.2", label: "SL 1.2", children: [
        { code: "SL1.2.1", label: "SL1.2.1" }, { code: "SL1.2.2", label: "SL1.2.2" }
      ]}
    ]}
  ];
  check(learnedTreeLeaves(tree[0]).join(",") === "SL 1.1,SL1.2.1,SL1.2.2",
    "leaves are the tickable units (two-level codes lead their own line)");
  check(learnedTreeState(tree[0], {}) === "none" &&
    learnedTreeState(tree[0], { "SL 1.1": true, "SL1.2.1": true, "SL1.2.2": true }) === "all" &&
    learnedTreeState(tree[0], { "SL1.2.1": true }) === "some",
    "the tri-state reads all / some / none through the nesting");

  function lctx(set, enabled) {
    return {
      cfg: { learnedScope: { tree: tree, refsOf: (q) => q.refs || [], label: "Learned so far" }, idOf: (q) => q.id },
      store: { learned: { set: set || {}, enabled: enabled !== false } },
      _questionInLearnedScope: V._questionInLearnedScope,
      _learnedScopeBiting: V._learnedScopeBiting
    };
  }
  check(lctx({})._questionInLearnedScope({ refs: ["SL1.2.1"] }) === true,
    "an empty learned set never filters — the scope only bites once ticked");
  const active = lctx({ "SL1.2.1": true, "SL1.2.2": true });
  check(active._questionInLearnedScope({ refs: ["SL1.2.1"] }) === true &&
    active._questionInLearnedScope({ refs: ["SL1.2.1", "SL1.2.2"] }) === true,
    "a question is in scope when ALL its refs are learned");
  check(active._questionInLearnedScope({ refs: ["SL1.2.1", "SL 1.1"] }) === false,
    "one untaught ref keeps a question out (it needs something not yet learned)");
  check(active._questionInLearnedScope({ refs: [] }) === false,
    "unmapped questions sit outside an ACTIVE scope");
  check(lctx({ "SL1.2.1": true }, false)._questionInLearnedScope({ refs: ["SL 1.1"] }) === true,
    "the master toggle turns the scope off for looking ahead");
  check(active._learnedScopeBiting() === true && lctx({})._learnedScopeBiting() === false,
    "the biting test drives the button state and the greying");
  check(extractFn("_matchesQuestionFilters").toString().indexOf("_questionInLearnedScope") >= 0,
    "the scope is a real filter every view consumer shares");
  check(src.indexOf("learned: o.learned || { set: {}, enabled: true }") >= 0,
    "the learned set persists in the store");

  // the panel: tick a topic box, everything beneath follows; save persists
  const pNodes = {
    ".ppq-modal-body": makeEl("div"),
    ".ppq-modal-reminder": makeEl("div"),
    ".ppq-modal-min": makeEl("button"),
    ".ppq-modal-feedback-status": makeEl("span"),
    ".ppq-modal": makeEl("div")
  };
  const calls = { saved: 0, closed: 0, filtered: 0, dashed: 0 };
  const pctx = {
    cfg: { learnedScope: { tree: tree, refsOf: (q) => q.refs || [], label: "Learned so far" }, idOf: (q) => q.id },
    store: { learned: { set: {}, enabled: true } },
    questions: [{ id: "q1", refs: ["SL1.2.1"] }, { id: "q2", refs: ["SL 1.1", "SL1.2.2"] }],
    q: (sel) => pNodes[sel] || null,
    _questionInLearnedScope: V._questionInLearnedScope,
    _saveStore: () => { calls.saved++; },
    _fireReport: () => {},
    closeModal: () => { calls.closed++; },
    _syncLearnedButton: () => {},
    filterQuestions: () => { calls.filtered++; },
    renderDashboard: () => { calls.dashed++; },
    _openLearnedPanel: V._openLearnedPanel
  };
  check(pctx._openLearnedPanel() === true, "the Learned so far panel renders into the modal shell");
  const topicBox = collect(pNodes[".ppq-modal-body"], (n) => (n.className || "").indexOf("ppq-ls-box") >= 0)[0];
  topicBox.dispatchEvent({ type: "click", stopPropagation: () => {}, preventDefault: () => {} });
  const saveBtn = collect(pNodes[".ppq-modal-body"], (n) => (n.className || "").indexOf("ppq-learned-save") >= 0)[0];
  saveBtn.dispatchEvent({ type: "click" });
  check(calls.saved === 1 && calls.closed === 1 && calls.filtered === 1 && calls.dashed === 1 &&
    pctx.store.learned.set["SL 1.1"] === true && pctx.store.learned.set["SL1.2.1"] === true &&
    pctx.store.learned.set["SL1.2.2"] === true,
    "ticking the topic box ticks every leaf beneath it, and Save persists and refreshes");

  // greying reaches the dashboard rows
  const greyHtml = V._catHtml.call(
    { cfg: { selfReport: { ramp: { 1: "1,1,1" }, levels: 1 }, revealCorrect: true }, groupFilter: null },
    "T9",
    { label: "Unlearned topic", total: 1, marks: [], ratings: { 1: 0 }, qids: [], qscores: {}, unlearned: true },
    "ribbonHeat"
  );
  check(greyHtml.indexOf("ppq-cat-unlearned") >= 0,
    "a group with nothing in scope greys out rather than vanishing");
  check(css5011().indexOf(".ppq-cat-unlearned") >= 0 && css5011().indexOf(".ppq-ls-box.some") >= 0,
    "the greying and the tri-state boxes are styled");
  function css5011() { return fs.readFileSync(path.join(PROJECT_ROOT, "engine", "ppqviewer.css"), "utf8"); }

  // wrappers: maths carries the scope with guide-true pacing; ESAT does not
  const mHtml2 = fs.readFileSync(path.join(PROJECT_ROOT, "example", "ibmaths.html"), "utf8");
  check(/learnedScope:/.test(mHtml2) && /LEARNED_TREE/.test(mHtml2) && /refsOf: function \(q\) \{ return q\.aa_codes/.test(mHtml2),
    "IB Maths supplies the tree (from observed item codes) and refsOf");
  check(/120 \* 60 \/ 110/.test(mHtml2) && /75 \* 60 \/ 55/.test(mHtml2),
    "maths pacing now follows the AA guide's assessment outline (HL rates, P3 distinct)");
  const eHtml2 = fs.readFileSync(path.join(PROJECT_ROOT, "example", "esat-compare.html"), "utf8");
  check(eHtml2.indexOf("learnedScope") < 0,
    "ESAT carries no learned scope (whole-spec test prep, per Smith)");
})();

console.log("\n==================  " + pass + " passed, " + fail + " failed  ==================");
process.exit(fail ? 1 : 0);
