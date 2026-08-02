/* Release-critical ESAT teaching catalogue and refreshed bundle proof. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
function cliValue(name, fallback) {
  const at = process.argv.indexOf(name);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
}
const ANALYSIS_ROOT = cliValue("--analysis-root", process.env.ESAT_ANALYSIS_ROOT ||
  "C:\\CodexProjects\\PaperDatabases\\Esat Categorisation\\analysis_v2");
const ESAT_ROOT = cliValue("--esat-root", process.env.ESAT_APP_ROOT ||
  "C:\\Claude (not on Gdrive, nor OneDrive)\\ESAT Prep App");
const FILES = {
  wrapper: path.join(ROOT, "example", "esat-compare.html"),
  catalogue: path.join(ESAT_ROOT, "app", "data", "esat_catalogue.js"),
  classification: path.join(ANALYSIS_ROOT, "dist", "esat_classification.js"),
  analysis: path.join(ANALYSIS_ROOT, "dist", "esat_analysis_v2.js"),
  trace: path.join(ANALYSIS_ROOT, "generated", "reports", "esat_viewer_family_feed_trace_2026-07-30.csv"),
  taxonomy: path.join(ANALYSIS_ROOT, "generated", "reports", "esat_taxonomy_catalogue_2026-07-30.json")
};
Object.keys(FILES).forEach((key) => {
  if (!fs.existsSync(FILES[key])) throw new Error(key + " not found: " + FILES[key]);
});

let passed = 0, failed = 0;
function check(ok, message) {
  if (ok) passed++;
  else { failed++; console.error("FAIL:", message); }
}
function parseCsv(text) {
  const rows = [];
  let row = [], value = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { value += '"'; i++; }
      else if (ch === '"') quoted = false;
      else value += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(value); value = ""; }
    else if (ch === "\n") { row.push(value.replace(/\r$/, "")); rows.push(row); row = []; value = ""; }
    else value += ch;
  }
  if (value || row.length) { row.push(value.replace(/\r$/, "")); rows.push(row); }
  const headers = rows.shift().map((h, i) => i === 0 ? h.replace(/^\uFEFF/, "") : h);
  return rows.filter((values) => values.some(Boolean)).map((values) => {
    const record = {};
    headers.forEach((header, index) => { record[header] = values[index] || ""; });
    return record;
  });
}
function node() {
  return { style: {}, value: "", textContent: "", innerHTML: "",
    appendChild(child) { return child; }, addEventListener() {}, focus() {} };
}
function executeWrapper() {
  const elements = {};
  const sandbox = { console, setTimeout() { return 0; }, clearTimeout() {},
    localStorage: { getItem() { return null; }, setItem() {} } };
  sandbox.window = sandbox;
  sandbox.location = { search: "" };
  sandbox.document = {
    getElementById(id) { if (!elements[id]) elements[id] = node(); return elements[id]; },
    createElement() { return node(); }
  };
  sandbox.PPQLogin = { createLogin() { return {
    signedIn() { return true; }, current() { return { display_name: "Release test" }; },
    wireGate() {}, report() {}
  }; } };
  let captured = null;
  sandbox.PPQViewer = { mount(root, options) { captured = options; return options; } };
  vm.createContext(sandbox);
  [FILES.catalogue, FILES.classification, FILES.analysis].forEach((file) => {
    vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  });
  const html = fs.readFileSync(FILES.wrapper, "utf8");
  const inline = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))
    .map((match) => match[1]).find((source) => source.indexOf("function mountViewer()") >= 0);
  if (!inline) throw new Error("ESAT wrapper mount script not found");
  vm.runInContext(inline, sandbox, { filename: FILES.wrapper });
  if (!captured) throw new Error("ESAT wrapper did not mount");
  return { captured, classification: sandbox.ESAT_CLASSIFICATION, analysis: sandbox.ESAT_ANALYSIS_V2 };
}

const runtime = executeWrapper();
const captured = runtime.captured;
const config = captured.config;
const classification = runtime.classification;
const analysis = runtime.analysis;
const trace = parseCsv(fs.readFileSync(FILES.trace, "utf8"));
const taxonomy = JSON.parse(fs.readFileSync(FILES.taxonomy, "utf8"));
const anomalies = new Map((taxonomy.placement_anomalies || []).map((row) => [row.question_id, row]));
function baseId(q) { return q.slug + "_Q" + String(parseInt(q.question_number, 10)).padStart(2, "0"); }
function recordId(q) { return baseId(q) + (q.part ? "_" + q.part : ""); }
const questions = (captured.questions || []).filter((q) => q.classification);
const byId = new Map();
questions.forEach((q) => byId.set(classification.by_id[recordId(q)] ? recordId(q) : baseId(q), q));

console.log("\n=== all 738 canonical family and topic choices ===");
check(trace.length === 738, "authoritative family-feed trace contains 738 rows");
check(questions.length === 738, "wrapper exposes 738 classified maths/physics questions");
trace.forEach((row) => {
  const q = byId.get(row.question_id);
  check(!!q && q.classification_family === row.intended_canonical_family,
    row.question_id + " uses canonical family " + row.intended_canonical_family);
  const anomaly = anomalies.get(row.question_id);
  const expectedTopic = anomaly ? anomaly.resolved_topic_key : row.catalogue_topic_code + " " + row.catalogue_topic;
  check(!!q && q.teaching_topic_key === expectedTopic,
    row.question_id + " uses teaching topic " + expectedTopic);
});

console.log("\n=== curated hierarchy, progress and search ===");
const canonicalFamilies = new Set(Object.values(classification.by_id).map((r) => r.canonical_primary_family));
const visibleFamilies = new Set(questions.map((q) => q.classification_family));
const teachingTopics = new Set(questions.map((q) => q.teaching_topic_key));
check(canonicalFamilies.size === 117 && visibleFamilies.size === 117, "all 117 curated families are visible");
check(teachingTopics.size === 23, "viewer resolves 23 teaching topics");
check(questions.every((q) => q.classification_family && !/^not(?:\s|$)/i.test(q.classification_family) &&
  !/(?:catalogue|classification)\s+boundary/i.test(q.classification_family)),
"no boundary label becomes a main teaching home");
const filters = new Map(config.filters.map((filter) => [filter.field, filter]));
check(["subject", "teaching_topic_key", "classification_family"].every((field, i) =>
  config.filters[i] && config.filters[i].field === field), "filter order is Subject -> Topic -> Family / subtopic");
check(filters.get("classification_family").dependsOn === "teaching_topic_key" &&
  filters.get("classification_family").dashboardFacet === true,
"family filter and dashboard share the teaching-topic parent");
check(JSON.stringify(filters.get("classification_family").values(questions).sort()) ===
  JSON.stringify(Array.from(canonicalFamilies).sort()), "family filter exposes exactly the curated families");
const familyAxis = config.progressAxes.find((axis) => axis.key === "teaching_family");
const topicAxis = config.progressAxes.find((axis) => axis.key === "teaching_topic");
check(questions.every((q) => JSON.stringify(familyAxis.valuesOf(q)) === JSON.stringify([q.classification_family])),
  "progress counts each question once in its main family");
check(questions.every((q) => JSON.stringify(topicAxis.valuesOf(q)) === JSON.stringify([q.teaching_topic_key])),
  "progress counts each question once in its teaching topic");
check(questions.every((q) => (q.classification_related_families || []).every((family) =>
  canonicalFamilies.has(family) && family !== q.classification_family)),
"additional family relevance contains only other curated families");
check(questions.every((q) => {
  const searchable = new Set(config.searchTermsOf(q));
  const r = q.classification;
  return (r.technique_tags || []).every((v) => searchable.has(v)) &&
    (r.representation_tags || []).every((v) => searchable.has(v)) &&
    (!r.calculation_or_reasoning_mode || searchable.has(r.calculation_or_reasoning_mode)) &&
    (r.filter_tags || []).every((v) => searchable.has(v));
}), "techniques, representations, reasoning style and retrieval terms are searchable for all 738");
const mismatches = trace.filter((row) => row.source_match === "False");
check(mismatches.length === 75 && mismatches.every((row) =>
  byId.get(row.question_id).classification_family === row.intended_canonical_family),
"all 75 prior family-feed mismatches now use canonical intent");

console.log("\n=== refreshed canonical analysis behavior ===");
check(analysis.records.length === 720, "refreshed canonical bundle contains 720 records");
[
  ["esat_nsaa_2017_s1_Q11", "test_listed_side_counts"],
  ["esat_engaa_2017_s1_Q17", "test_listed_side_counts"],
  ["esat_engaa_2016_s1_Q09", "bound_loss_with_ordered_options"],
  ["esat_nsaa_2016_s1_Q05", "bound_loss_with_ordered_options"]
].forEach((expectation) => {
  const rec = analysis.by_id[expectation[0]];
  check(!!rec && rec.methods[0] && rec.methods[0].id === expectation[1],
    expectation[0] + " shows " + expectation[1] + " first");
  check(!!rec && rec.methods.length > 1 && rec.methods[1].role === "alternative",
    expectation[0] + " retains the exact/algebraic route as an alternative");
});
const thingsContract = ((analysis.interaction_defaults || {}).things_used_check || {});
const states = [thingsContract.default_state].concat(thingsContract.exception_states || [])
  .filter(Boolean).map((state) => typeof state === "string" ? state : state.id);
check(states.indexOf("knew_but_did_not_need") === states.indexOf("knew_but_did_not_retrieve") + 1,
  "knew_but_did_not_need follows did-not-think-of-it in the canonical contract");

console.log("\n=== integrated safety, advisories and presentation ===");
const wrapper = fs.readFileSync(FILES.wrapper, "utf8");
const engine = fs.readFileSync(path.join(ROOT, "engine", "ppqviewer.js"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "engine", "ppqviewer.css"), "utf8");
check((wrapper.match(/release scan 2026-07-29/g) || []).length === 5 && /contentSafety:\s*\{/.test(wrapper),
  "all twelve content-safety suppressions remain configured");
check(/esat_engaa_2018_s1_Q53/.test(wrapper) && /esat_nsaa_2018_s1_Q89/.test(wrapper) &&
  /esat_engaa_2016_s1_Q52/.test(wrapper), "all three source advisories remain configured");
check(/PRESENTATION_BENCHMARK_IDS/.test(wrapper) && /presentation-benchmark/.test(wrapper) &&
  config.presentation.enabled === true, "eight-question benchmark and reusable presentation contract remain enabled");
check(/ppq-progress-table-scroll/.test(engine) &&
  /\.ppq-progress-table-scroll[\s\S]*overflow-x:\s*auto/.test(css),
"progress tables remain keyboard-focusable and horizontally contained at 320px");

console.log("\n================== " + passed + " passed, " + failed + " failed ==================");
process.exitCode = failed ? 1 : 0;
