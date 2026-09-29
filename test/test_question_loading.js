/* Compact target and asynchronous image journeys, using the Physics consumer.
   Image events are synthetic; no network or real feedback submission occurs. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), { JSDOM } = require("jsdom");
const engine = fs.readFileSync(path.join(__dirname, "../engine/ppqviewer.js"), "utf8");
const consumer = fs.readFileSync(path.join(__dirname, "../example/physics-config.js"), "utf8");
const opened = []; let checks = 0;
const meta = { course: "ib", title: "IB Physics", default_topic: "A.5", topics: { "A.5": "Relativity" }, analysis: { groups: [
  { code: "A5.REF", label: "Frames", summary: "Identify the frame.", checks: ["Name the observer."] },
  { code: "A5.VEL", label: "Velocity", summary: "Identify relative motion.", checks: ["Use a consistent direction."] }
] } };
const records = [
  { id: "paper-Q1(a)", parent_id: "paper-Q1", label: "(a)", question_number: "1", analysis_groups: ["A5.REF"], level: "SL" },
  { id: "paper-Q1(c)", parent_id: "paper-Q1", label: "(c)", question_number: "1", analysis_groups: ["A5.REF"], level: "HL" },
  { id: "paper-Q2(a)", parent_id: "paper-Q2", label: "(a)", question_number: "2", analysis_groups: ["A5.VEL"], level: "HLSL" }
].map(q => ({ source_part_id: q.id, year: 2004, paper: "3", topic_codes: ["A.5"], marks: 2,
  question_images: ["assets/" + q.id + ".png"], context_images: ["assets/" + q.parent_id + "-context.png"],
  markscheme_images: ["assets/" + q.id + "-ms.png"], ...q }));
function mount(extra = {}, cached = false, questions = records) {
  const dom = new JSDOM('<div id="root"></div>', { url: "https://loading.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const w = dom.window; let requests = 0;
  w.fetch = () => { requests++; throw new Error("Unexpected network request"); };
  w.confirm = () => true; w.HTMLElement.prototype.scrollIntoView = function () {};
  if (cached) {
    Object.defineProperty(w.HTMLImageElement.prototype, "complete", { get: () => true });
    Object.defineProperty(w.HTMLImageElement.prototype, "naturalWidth", { get: () => 320 });
  }
  w.PHYSICS_META = JSON.parse(JSON.stringify(meta)); w.PHYSICS_QUESTIONS = JSON.parse(JSON.stringify(questions));
  w.eval(engine); w.eval(consumer);
  const config = { ...w.PPQ_CONFIG, defaultOrder: "ordered", prefetchAhead: 0, teacherHelp: null, problemReport: null, ...extra };
  const root = w.document.getElementById("root"), v = w.PPQViewer.mount(root, { config, questions: w.PHYSICS_QUESTIONS, meta: w.PHYSICS_META });
  const p = { dom, w, root, v, requests: () => requests }; opened.push(p); return p;
}
function check(name, fn) { fn(); checks++; console.log("ok " + name); }
const images = p => Array.from(p.root.querySelectorAll(".ppq-stem img[src]"));
const status = p => p.root.querySelector(".ppq-question-loading");
function emit(p, image, event = "load") { image.dispatchEvent(new p.w.Event(event)); }
function group(p, code) { p.root.querySelector('.ppq-facet-cat[data-value="' + code + '"]').click(); }
try {
  check("one exact target and ordered available parts precede context without repeating a banner", () => {
    const p = mount(), row = p.root.querySelector(".ppq-question-target-row"), heading = row.querySelector("h2"), stem = p.root.querySelector(".ppq-stem");
    assert.strictEqual(p.root.querySelectorAll(".ppq-target-part").length, 1);
    assert.match(heading.textContent, /Answer question 1\(a\)/); assert.match(heading.textContent, /2 marks/);
    assert(row.compareDocumentPosition(stem) & p.w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.strictEqual(row.querySelector(".ppq-wq-jump").textContent, "Practise:");
    assert.deepStrictEqual(Array.from(row.querySelectorAll(".ppq-part-chip"), b => b.dataset.id), ["paper-Q1(a)", "paper-Q1(c)"]);
    assert.strictEqual(row.querySelector('[aria-current="step"]').dataset.id, "paper-Q1(a)");
    assert.strictEqual(stem.querySelector(".ppq-stem-partlead").textContent, "Current part");
    assert(!stem.textContent.includes("Answer question")); assert(!row.textContent.includes("(b)"));
    assert(p.root.querySelector(".ppq-qid").textContent.includes("2004"));
  });
  check("HL, SL and shared badges have distinct classes while their source labels stay explicit", () => {
    const p = mount();
    assert.strictEqual(p.root.querySelector(".ppq-question-badge-hl").textContent, "Current: HL");
    assert.deepStrictEqual(Array.from(p.root.querySelectorAll(".ppq-question-badge-sl"), badge => badge.textContent), ["SL printing", "Original paper: SL"]);
    p.v.render(p.v.questions[2]);
    assert.strictEqual(p.root.querySelector(".ppq-question-badge-shared").textContent, "Original paper: HL/SL");
    const unknown = mount({ questionBadgesOf: () => [{ label: "Other", level: "__proto__" }] });
    assert.strictEqual(unknown.root.querySelector(".ppq-question-badge").className, "ppq-question-badge");
  });
  check("loading announces the current image batch and settles only after question plus context finish", () => {
    const p = mount(), batch = images(p); assert.strictEqual(batch.length, 2);
    assert(!status(p).hidden); assert.strictEqual(status(p).getAttribute("role"), "status");
    assert.strictEqual(status(p).getAttribute("aria-live"), "polite");
    assert.strictEqual(p.root.querySelector(".ppq-stem").getAttribute("aria-busy"), "true");
    batch.forEach(im => assert.strictEqual(im.loading, "eager"));
    const attempt = p.v._attemptId, shown = p.v.shownAt;
    emit(p, batch[1]); assert(!status(p).hidden); assert.match(status(p).textContent, /1 of 2/);
    emit(p, batch[0]); assert(status(p).hidden); assert.strictEqual(p.root.querySelector(".ppq-stem").getAttribute("aria-busy"), "false");
    assert.strictEqual(p.v._attemptId, attempt); assert.strictEqual(p.v.shownAt, shown); assert.strictEqual(p.v.store.attempts.length, 0);
  });
  check("right-hand group selection removes the old answer immediately and keeps Key tips closed", () => {
    const p = mount(); images(p).forEach(im => emit(p, im));
    p.root.querySelector(".ppq-reveal").click(); assert(p.root.querySelector(".ppq-markscheme img"));
    group(p, "A5.VEL");
    assert.strictEqual(p.v.cur.id, "paper-Q2(a)"); assert(!status(p).hidden);
    assert.strictEqual(p.root.querySelector(".ppq-markscheme").innerHTML, "");
    assert(!p.root.querySelector(".ppq-answer-panel").classList.contains("show"));
    assert(!p.root.querySelector(".ppq-marksbar")); assert(!p.root.querySelector(".ppq-competence").classList.contains("show"));
    assert(!p.root.querySelector(".ppq-facet-guidance").open); assert.strictEqual(p.root.querySelector(".ppq-facet-guidance summary").textContent, "Key tips");
    assert.strictEqual(p.v.store.attempts.length, 0);
  });
  check("late success and failure events from an earlier selection cannot complete or corrupt the new batch", () => {
    const p = mount(), old = images(p); group(p, "A5.VEL"); const next = images(p), before = status(p).textContent;
    emit(p, old[0]); emit(p, old[1], "error");
    assert.strictEqual(status(p).textContent, before); assert(!p.root.querySelector(".ppq-question-image-error"));
    next.forEach(im => emit(p, im)); assert(status(p).hidden);
    emit(p, old[0], "error"); assert(status(p).hidden); assert(!p.root.querySelector(".ppq-question-image-error"));
  });
  check("a failed image ends loading with a local retry and successful retry clears only that failure", () => {
    const p = mount(), batch = images(p), original = batch[0].getAttribute("src");
    emit(p, batch[0], "error"); emit(p, batch[1]);
    assert.strictEqual(p.root.querySelector(".ppq-stem").getAttribute("aria-busy"), "false");
    assert(!status(p).hidden); assert(status(p).classList.contains("ppq-question-loading-error")); assert(batch[0].hidden);
    p.root.querySelector(".ppq-image-retry").click();
    assert.strictEqual(batch[0].getAttribute("src"), original); assert(!batch[0].hidden);
    assert.strictEqual(p.root.querySelector(".ppq-stem").getAttribute("aria-busy"), "true");
    emit(p, batch[0]); assert(status(p).hidden); assert(!p.root.querySelector(".ppq-question-image-error"));
    assert.strictEqual(p.v.cur.id, "paper-Q1(a)"); assert.strictEqual(p.v.store.attempts.length, 0);
  });
  check("cached images and image-free questions have no residual loading banner", () => {
    const cached = mount({}, true); assert(status(cached).hidden); images(cached).forEach(im => assert(!im.classList.contains("ppq-question-image-pending")));
    const textOnly = mount({}, false, [{ ...records[0], question_images: [], context_images: [], question_text: "A text-only prompt" }]);
    assert(status(textOnly).hidden); assert.strictEqual(textOnly.root.querySelector(".ppq-stem").getAttribute("aria-busy"), "false");
  });
  check("empty scopes and destroy cancel outstanding image batches", () => {
    const p = mount(), batch = images(p); p.v._showEmpty("No parts match");
    assert(status(p).hidden); batch.forEach(im => emit(p, im, "error")); assert(!p.root.querySelector(".ppq-question-image-error"));
    assert.strictEqual(p.v._questionImageBatch, null); p.v.render(p.v.questions[0]);
    const beforeDestroy = images(p); p.v.destroy(); beforeDestroy.forEach(im => emit(p, im, "error"));
    assert.strictEqual(p.root.innerHTML, ""); assert.strictEqual(p.v._questionImageBatch, null);
  });
  check("legacy consumers retain the prior heading and lazy images unless they opt in", () => {
    const p = mount({ compactQuestionHeader: false, questionLoading: undefined });
    assert(!p.root.querySelector(".ppq-question-target-row")); assert(!status(p));
    assert.match(p.root.querySelector(".ppq-stem-partlead").textContent, /Answer question 1\(a\)/);
    assert(!p.root.querySelector(".ppq-stem").hasAttribute("aria-busy"));
    images(p).forEach(im => assert.strictEqual(im.getAttribute("loading"), "lazy"));
  });
  check("the image and header journeys make no feedback or attempt requests", () => {
    opened.forEach(p => assert.strictEqual(p.requests(), 0));
  });
} finally { opened.forEach(p => { p.v.destroy(); p.dom.window.close(); }); }
console.log(checks + " compact header and question-image journeys passed");
