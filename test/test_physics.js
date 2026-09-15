/* Physics consumer journeys through the real shared engine and page.
   Run: node test/test_physics.js (requires the same jsdom as other consumer tests).
   Also verifies the real build at dist/physics-preview/latest.json when present.
   PHYSICS_PREVIEW_INFO overrides that build pointer. No network/server needed. */
"use strict";
const { JSDOM } = require("jsdom");
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(file, "utf8");
const PAGE = read(path.join(ROOT, "example/physics.html"));
const CONFIG = read(path.join(ROOT, "example/physics-config.js"));
const ENGINE = read(path.join(ROOT, "engine/ppqviewer.js"));
const IDENTITY = read(path.join(ROOT, "example/physics-identity.js"));
const LOGIN = read(path.join(ROOT, "example/physics-login.js"));
const doms = [];
let passed = 0, failed = 0;
function check(name, condition) {
  if (condition) passed++;
  else { failed++; console.error("FAIL " + name); }
}
function page(meta, records, opts = {}) {
  const html = opts.html || PAGE;
  const query = opts.query !== undefined ? opts.query : "?id=" + encodeURIComponent(records && records[0] ? records[0].id : "fixture");
  const dom = new JSDOM(html, { url: "http://localhost/ib/index.html" + query, runScripts: "outside-only", pretendToBeVisual: true });
  doms.push(dom);
  const w = dom.window, network = [];
  w.fetch = (...args) => { network.push(args); throw Error("Unexpected network request"); };
  w.XMLHttpRequest = function () { network.push("XHR"); throw Error("Unexpected network request"); };
  w.navigator.sendBeacon = (...args) => { network.push(args); return false; };
  w.confirm = () => true;
  if (meta !== undefined) w.PHYSICS_META = meta;
  if (records !== undefined) w.PHYSICS_QUESTIONS = records;
  Object.entries(opts.storage || {}).forEach(([key, value]) => w.localStorage.setItem(key, value));
  if (!w.localStorage.getItem("smithics_fields_identity_v1")) w.localStorage.setItem("smithics_fields_identity_v1", JSON.stringify({
    anonymous_id:"physics-fixture",display_name:"Fixture Pupil",signed_in:true,
    contexts:{physics:{anonymous_id:"physics-fixture",display_name:"Fixture Pupil",cohort:"Test"}}
  }));
  if (!opts.missingEngine) w.eval(opts.engine || ENGINE);
  w.eval(IDENTITY); w.eval(LOGIN);
  w.eval(opts.config || CONFIG);
  if (opts.ordered) w.PPQ_CONFIG.defaultOrder = "ordered"; // Deterministic sequential fixture; real built pages retain their default.
  Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)).forEach(match => { if (match[1].trim()) w.eval(match[1]); });
  return { w, dom, network, root: w.document.getElementById("ppq-root"), v: w.physicsViewer };
}
function close(p) { if (p.v) p.v.destroy(); p.dom.window.close(); }
function metadata(course = "ib") {
  return { course, title: "Physics " + course, topics: { A1: "Kinematics", E1: "Structure of the atom", D2: "Electric and magnetic fields" }, preview_notice: "Teacher preview: additional tests still need checking." };
}
const fixture = [
  { id: "paper-Q1(a)", parent_id: "paper-Q1", topic_codes: ["A1"], year: "2020", paper: "2", level: "HL", question_number: "1", label: "(a)", marks: 3,
    question_images: ["assets/q1-a.png"], context_images: ["assets/q1-context.png"], markscheme_images: ["assets/ms1-a.png"], source_notice: "Syllabus fit is provisional.", source_label: "May 2020 · HL · Paper 2" },
  { id: "paper-Q1(b)", parent_id: "paper-Q1", topic_codes: ["A1", "E1"], year: "2020", paper: "2", level: "HL", question_number: "1", label: "(b)", marks: null,
    question_images: ["assets/q1-b.png"], context_images: ["assets/q1-context.png"], markscheme_images: ["assets/ms1-b.png", "assets/ms1-b2.png"] },
  { id: "paper-Q2", parent_id: "paper-Q2", topic_codes: ["E1"], year: "2019", paper: "1B", level: "SL", question_number: "2", label: "", marks: 2,
    question_images: ["assets/q2.png"], context_images: [], markscheme_images: ["assets/ms2.png"] }
];
try {
  console.log("Physics fixture journeys");
  const p = page(metadata(), fixture, { query: "?topic=A.1,invalid", ordered: true }), v = p.v;
  check("real page mounts engine", !!v && !!p.root.querySelector(".ppq-card"));
  check("IB viewer title used", p.w.document.title === "IB Physics past-paper question viewer"); // QoderWork 2026-09-14
  check("legacy teacher notice stays out of practice", p.w.document.getElementById("physics-preview-notice").hidden && !p.w.document.getElementById("physics-preview-notice").textContent);
  check("course chooser link", p.w.document.querySelector("nav a").getAttribute("href") === "../index.html");
  check("A.1 link maps to A1 and invalid values ignored", v.view.length === 2 && v.view.every(q => q.topic_codes.includes("A1")));
  check("multi-topic question remains in topic view", v.view.some(q => q.id === fixture[1].id));
  check("topic prefix precedes its name", p.root.querySelector(".ppq-multi-panel").textContent.includes("A1 Kinematics"));
  check("unavailable topic not offered", !p.root.querySelector('.ppq-multi-panel input[value="D2"]'));
  check("paper/year-range/level controls present", ["paper", "year range", "level"].every(field => p.root.querySelector('select[aria-label="' + field + '"]')));
  check("drawing/timing controls retained", p.root.querySelector(".ppq-draw-toggle") && p.root.querySelector(".ppq-timing-btn"));
  check("legacy source notice is absent", !p.root.querySelector(".ppq-notice"));
  check("single-topic part keeps the also-studied panel hidden", (() => { const box = p.root.querySelector(".ppq-also-studied"); return box && box.hidden && !box.textContent.trim(); })()); // QoderWork 2026-09-14
  check("source metadata not repeated", (v.cfg.metaLine(fixture[0]).match(/2020/g) || []).length === 1 && (v.cfg.metaLine(fixture[0]).match(/Paper 2/g) || []).length === 1);
  const context = p.root.querySelector(".physics-context"), crop = p.root.querySelector('.ppq-stem > img[src="assets/q1-a.png"]');
  check("necessary context is visible before focused crop", context && context.open && crop && (context.compareDocumentPosition(crop) & p.w.Node.DOCUMENT_POSITION_FOLLOWING));
  check("scheme hidden before reveal", !p.root.querySelector(".ppq-answer-panel").classList.contains("show"));
  check("two actual sibling chips", p.root.querySelectorAll(".ppq-part-chip").length === 2);
  check("printed sibling labels", p.root.querySelector(".ppq-part-chip").textContent.includes("(a)"));
  p.root.querySelector(".ppq-reveal").click();
  check("printed scheme reveals", p.root.querySelector('.ppq-answer-panel.show img[src="assets/ms1-a.png"]'));
  check("three marks means buttons zero to three", p.root.querySelectorAll(".ppq-mark-btn").length === 4);
  check("reveal does not assign marks", v.store.attempts.length === 0);
  p.root.querySelector('.ppq-mark-btn[data-mark="2"]').click();
  check("awarded marks logged", v.store.attempts.length === 1 && v.store.attempts[0].marks_awarded === 2 && v.store.attempts[0].marks_max === 3);
  check("time recorded", Number.isFinite(v.store.attempts[0].time_ms) && v.store.attempts[0].time_ms >= 0);
  p.root.querySelector('.ppq-scale-btn[data-val="4"]').click();
  check("rating saved", v.store.scores[fixture[0].id] === 4);
  const saved = p.w.localStorage.getItem("physics_ppq_ib_v1");
  check("IB namespace used", saved && JSON.parse(saved).attempts.length === 1);
  p.root.querySelector('.ppq-part-chip[data-id="paper-Q1(b)"]').click();
  check("sibling navigation renders that part", v.cur.id === fixture[1].id && p.root.querySelector('.ppq-stem > img[src="assets/q1-b.png"]'));
  check("multi-topic part names both strands, main first", (() => { // QoderWork 2026-09-14
    const box = p.root.querySelector(".ppq-also-studied"); if (!box || box.hidden) return false;
    const items = Array.from(box.querySelectorAll(".ppq-also-studied-item")).map(n => n.textContent);
    return items.length === 2 && /^Main: A1 Kinematics$/.test(items[0]) && /^Also: E1 Structure of the atom$/.test(items[1]) &&
      box.querySelector(".ppq-also-studied-main") === box.querySelector(".ppq-also-studied-item") &&
      /studied in 2 topics/.test(box.querySelector(".ppq-also-studied-label").textContent);
  })());
  check("unknown marks use flashcard", v._curType === "flashcard");
  p.root.querySelector(".ppq-reveal").click();
  check("flashcard reveals every scheme crop", p.root.querySelectorAll(".ppq-answer-panel.show .ppq-ms-crop").length === 2);
  check("unknown marks not fabricated", p.root.querySelectorAll(".ppq-mark-btn:not([disabled])").length === 0 && v.store.attempts.length === 1);
  const all = p.root.querySelector(".ppq-multi-all input"); if (!all.checked) all.click();
  check("All topics includes the full catalogue and its already-completed questions by default", v._practiceBaseView.length === 3 &&
    v.view.length === 3 && v.view.some(q => v.store.attempts.some(a => a.id === q.id)));
  const paper = p.root.querySelector('select[aria-label="paper"]');
  paper.value = "1"; paper.dispatchEvent(new p.w.Event("change", { bubbles: true }));
  check("paper filter narrows precisely without rewriting original paper or year", v.view.length === 1 && v.cur.id === fixture[2].id && v.cur.paper === "1B" && v.cur.year === "2019");
  check("singletons have no fake navigator", p.root.querySelectorAll(".ppq-part-chip").length === 0);
  check("multi-topic progress classification retained", v.cfg.progressAxes[0].valuesOf(fixture[1]).length === 2);
  check("no reporting callback", v.report === null);
  check("practice journey makes no network calls", p.network.length === 0);
  check("shared sign-in adds no reporting transport or remote scripts", !/PPQLogin|sendBeacon|fetch\s*\(/.test(PAGE + CONFIG + IDENTITY + LOGIN) && !Array.from(p.w.document.scripts).some(s => /^(https?:)?\/\//.test(s.getAttribute("src") || "")));
  const restored = page(metadata(), fixture, { storage: { physics_ppq_ib_v1: saved } });
  check("progress survives reload", restored.v.store.attempts.length === 1 && restored.v.store.scores[fixture[0].id] === 4);
  ["trilogy", "preib"].forEach(course => {
    const other = page(metadata(course), fixture, { storage: { physics_ppq_ib_v1: saved } });
    check(course + " progress isolated", other.v.cfg.storageKey === "physics_ppq_" + course + "_v1" && other.v.store.attempts.length === 0); close(other);
  });
  const invalid = page(metadata(), fixture, { query: "?topic=invalid" });
  check("invalid topic returns to topic choice without opening a question", !invalid.v && !invalid.root.querySelector(".ppq-card"));
  const comma = page(metadata(), fixture, { query: "?topic=A1,E1" });
  check("comma filter uses union", comma.v.view.length === fixture.length);
  const mismatch = page(metadata(), [fixture[0], { ...fixture[1], parent_id: "different-parent" }]);
  check("similar IDs cannot invent sibling relationship", mismatch.root.querySelectorAll(".ppq-part-chip").length === 0);
  const sparse = page(metadata(), [{ id: "only", topic_codes: ["A1"], marks: null, question_images: ["assets/only.png"], markscheme_images: [] }]);
  check("fixed IB practice selectors remain while empty source levels omit their selector", sparse.root.querySelectorAll(".ppq-select[data-fidx]").length === 2 && sparse.root.querySelector('select[aria-label="paper"]') && sparse.root.querySelector('select[aria-label="year range"]') && !sparse.root.querySelector('select[aria-label="level"]'));
  sparse.root.querySelector(".ppq-reveal").click();
  check("missing markscheme honestly labelled", sparse.root.querySelector(".ppq-markscheme").textContent.includes("not available"));
  const missing = page(undefined, undefined), empty = page(metadata(), []), noEngine = page(metadata(), fixture, { missingEngine: true });
  check("missing bundle explains remedy", !missing.v && missing.root.querySelector('[role="alert"]') && missing.root.textContent.includes("collection could not be loaded"));
  check("empty collection explained", !empty.v && empty.root.textContent.includes("no approved practice"));
  check("missing engine explained", !noEngine.v && noEngine.root.textContent.includes("viewer files could not be loaded"));
  [p, restored, invalid, comma, mismatch, sparse, missing, empty, noEngine].forEach(close);

  const pointer = process.env.PHYSICS_PREVIEW_INFO || path.join(ROOT, "dist/physics-preview/latest.json");
  if (!fs.existsSync(pointer)) console.log("No assembled build yet; build with tools/assemble_physics_preview.js for corpus checks.");
  else {
    const info = JSON.parse(read(pointer));
    console.log("Assembled physics build " + info.build_id);
    check("build contains courses", Array.isArray(info.courses) && info.courses.length > 0);
    for (const course of info.courses) {
      const dir = path.join(info.root, course.course), label = course.course + ": ";
      const html = read(path.join(dir, "index.html")), config = read(path.join(dir, "physics-config.js")), engine = read(path.join(dir, "engine/ppqviewer.js"));
      check(label + "current wrapper copied", config === CONFIG && html === PAGE);
      check(label + "shared engine unchanged", engine === ENGINE);
      check(label + "shared identity and its transport-free gate copied", read(path.join(dir,"physics-identity.js")) === IDENTITY && read(path.join(dir,"physics-login.js")) === LOGIN);
      const box = { window: {} };
      vm.runInNewContext(read(path.join(dir, "data/physics_catalogue.js")), box, { timeout: 20000 });
      const meta = box.window.PHYSICS_META, records = box.window.PHYSICS_QUESTIONS;
      check(label + "build record counts match actual collection", records.length === course.records && records.length > 0);
      check(label + "build part counts match source identities", new Set(records.flatMap(q=>q.part_ids || [q.source_part_id || q.id])).size === course.parts);
      check(label + "IDs unique", new Set(records.map(q => q.id)).size === records.length);
      check(label + "question/scheme crops present", records.every(q => q.question_images.length && q.markscheme_images.length));
      check(label + "topics all labelled", records.every(q => q.topic_codes.length && q.topic_codes.every(code => meta.topics[code])));
      check(label + "marks integer or unknown", records.every(q => q.marks === null || Number.isInteger(q.marks) && q.marks > 0));
      check(label + "2026, future and undated papers withheld", records.every(q => /^\d{4}$/.test(String(q.year)) && Number(q.year) < 2026));
      const urls = new Set(records.flatMap(q => [...q.question_images, ...(q.context_images || []), ...q.markscheme_images]));
      check(label + "references only local hashed crops", Array.from(urls).every(url => /^assets\/[a-f0-9]{64}\.png$/.test(url)));
      const bad = [];
      for (const url of urls) {
        if (!/^assets\/[a-f0-9]{64}\.png$/.test(url) || !fs.existsSync(path.join(dir, url))) { bad.push(url); continue; }
        const bytes = fs.readFileSync(path.join(dir, url)), hash = crypto.createHash("sha256").update(bytes).digest("hex");
        if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || path.basename(url) !== hash + ".png") bad.push(url);
      }
      check(label + "all crops exist, are PNGs and match content hashes (" + urls.size + ")", bad.length === 0);
      check(label + "no unreferenced crop files left in served assets", fs.readdirSync(path.join(dir, "assets")).every(file => urls.has("assets/" + file)));
      if (bad.length) console.error("Bad crops: " + bad.slice(0, 3).join(", "));
      const topic = Object.keys(meta.topics).find(code => records.some(q => q.topic_codes.includes(code)));
      const actual = page(meta, records, { html, config, engine, query: "?topic=" + encodeURIComponent(topic) });
      check(label + "actual built page mounts", !!actual.v);
      check(label + "actual topic filter precise", actual.v.view.length === records.filter(q => q.topic_codes.includes(topic)).length && actual.v.view.every(q => q.topic_codes.includes(topic)));
      const selected = actual.v.cur;
      actual.root.querySelector(".ppq-reveal").click();
      check(label + "actual scheme crops revealed", actual.root.querySelectorAll(".ppq-answer-panel.show .ppq-ms-crop").length === selected.markscheme_images.length);
      check(label + "actual page has no remote reports", actual.network.length === 0 && actual.v.report === null);
      close(actual);
      console.log("  " + course.course + ": " + course.parts + " parts in " + course.parents + " whole questions; " + urls.size + " verified crops");
    }
  }
} catch (error) { failed++; console.error(error.stack); }
finally { doms.forEach(dom => { try { dom.window.close(); } catch (_) {} }); }
console.log(passed + " passed, " + failed + " failed");
process.exitCode = failed ? 1 : 0;
