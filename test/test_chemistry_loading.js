/* Readable transcription while chemistry images load, using actual adapter and
 * engine. All image outcomes are simulated; JSDOM makes no network requests.
 * Run: node test/test_chemistry_loading.js */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const rootDir = path.join(__dirname, "..");
const adapterSource = fs.readFileSync(path.join(rootDir, "example", "chemistry-config.js"), "utf8");
const engineSource = fs.readFileSync(path.join(rootDir, "engine", "ppqviewer.js"), "utf8");
let passed = 0;
function check(name, condition) { assert.ok(condition, name); passed++; }

function boot(cached) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "https://localhost/chemistry/", runScripts: "outside-only", pretendToBeVisual: true
  });
  const window = dom.window, state = new Map(Object.entries(cached || {}));
  Object.defineProperty(window.HTMLImageElement.prototype, "complete", {
    configurable: true, get() { return state.has(this.getAttribute("src")); }
  });
  Object.defineProperty(window.HTMLImageElement.prototype, "naturalWidth", {
    configurable: true, get() { return state.get(this.getAttribute("src")) === "loaded" ? 640 : 0; }
  });
  window.confirm = () => true;
  window.eval(adapterSource); window.eval(engineSource);
  const questions = [
    { id: "q1", paper: "2", level: "SL", marks: 2, spec_status: "current",
      stem_text: "Opening passage.", question_text: "First readable line.\nSecond readable line.",
      question_images: ["part-1.png", "part-2.png"], context_images: ["context.png"],
      markscheme_images: ["markscheme.png"], markscheme_text: "Private answer, shown after reveal." },
    { id: "q2", paper: "2", level: "SL", marks: 1, spec_status: "current",
      question_text: "Next question transcription.", question_images: ["next.png"],
      markscheme_images: ["next-markscheme.png"], markscheme_text: "Next answer." },
    { id: "q3", paper: "2", level: "SL", marks: 1, spec_status: "current",
      question_text: "Text-only question.\nKeep the line break.", question_images: [], context_images: [],
      markscheme_text: "Text-only answer." }
  ];
  const root = window.document.getElementById("root");
  const viewer = window.PPQViewer.mount(root, {
    config: window.ChemistryViewer.createConfig({ questions, meta: {}, learnerLevel: "SL" }), questions, meta: {}
  });
  const find = selector => root.querySelector(selector);
  function image(src) { return Array.from(root.querySelectorAll(".ppq-stem img")).find(img => img.getAttribute("src") === src); }
  function emit(imgOrSrc, outcome) {
    const img = typeof imgOrSrc === "string" ? image(imgOrSrc) : imgOrSrc;
    assert.ok(img, "fixture image exists: " + imgOrSrc);
    state.set(img.getAttribute("src"), outcome);
    img.dispatchEvent(new window.Event(outcome === "loaded" ? "load" : "error"));
  }
  function gated(label) {
    check(label + ": answers remain hidden", !find(".ppq-answer-panel").classList.contains("show") && !find(".ppq-markscheme").textContent.includes("Private answer"));
    check(label + ": no marks entry or attempt is created", !find(".ppq-marksbar") && viewer.store.attempts.length === 0 && !viewer.answered);
  }
  return { dom, window, root, viewer, find, image, emit, state, gated,
    transcript: () => find("details[data-ppq-loading-transcript]"),
    close: () => { viewer.destroy(); window.close(); } };
}

let t = boot();
check("actual chemistry config opts into transcript fallback", t.viewer.cfg.questionLoading.transcriptFallback === true);
check("pending current crops open readable transcription immediately", t.transcript().open && t.transcript().textContent.includes("First readable line."));
check("fallback preserves line breaks", t.transcript().querySelectorAll(".chemistry-part-text br").length === 1);
check("question context stays collapsed while loading", t.find(".chemistry-context").open === false);
check("all current crops are identified independently from context", t.root.querySelectorAll(".ppq-question-crop").length === 2 && !t.image("context.png").classList.contains("ppq-question-crop"));
t.gated("pending images");
t.emit("context.png", "loaded");
check("context loading does not close the current-part fallback", t.transcript().open);
t.emit("part-1.png", "loaded");
check("one loaded crop does not close transcription while another is pending", t.transcript().open);
t.emit("part-2.png", "loaded");
check("all loaded current crops close the automatic fallback", !t.transcript().open);
check("finished image batch clears loading status", t.find(".ppq-question-loading").hidden && t.find(".ppq-stem").getAttribute("aria-busy") === "false");
t.gated("finished images"); t.close();

t = boot();
t.emit("part-1.png", "loaded"); t.emit("part-2.png", "loaded");
check("slow context does not keep current-part transcription open", !t.transcript().open);
check("slow context is still represented in image loading status", !t.find(".ppq-question-loading").hidden && t.find(".ppq-stem").getAttribute("aria-busy") === "true");
t.emit("context.png", "failed");
check("context failure does not reopen a readable current crop", !t.transcript().open);
check("context failure offers a retry", !!t.find(".chemistry-context .ppq-image-retry"));
t.find(".chemistry-context .ppq-image-retry").click();
check("context retry also leaves the transcription closed", !t.transcript().open);
t.emit("context.png", "loaded"); t.gated("context failure and retry"); t.close();

t = boot();
t.emit("part-1.png", "failed"); t.emit("part-2.png", "loaded"); t.emit("context.png", "loaded");
check("failed current image retains readable transcription", t.transcript().open);
check("failed current image becomes hidden with actionable error", t.image("part-1.png").hidden && !!t.find(".ppq-image-retry") && t.find(".ppq-question-loading").classList.contains("ppq-question-loading-error"));
t.find(".ppq-image-retry").click();
check("retry preserves transcription while restoring image loading", t.transcript().open && !t.image("part-1.png").hidden && t.image("part-1.png").classList.contains("ppq-question-image-pending"));
check("retry removes the old error control", !t.find(".ppq-image-retry"));
t.emit("part-1.png", "loaded");
check("successful current retry closes automatic transcription", !t.transcript().open);
t.gated("current failure and retry"); t.close();

t = boot();
t.transcript().querySelector("summary").click();
check("pupil can close the temporary transcription", !t.transcript().open);
t.emit("part-1.png", "failed");
check("image failure respects manual closed state", !t.transcript().open);
t.find(".ppq-image-retry").click();
t.emit("part-1.png", "loaded"); t.emit("part-2.png", "loaded"); t.emit("context.png", "loaded");
check("loading completion respects manual closed state", !t.transcript().open);
t.gated("manual close"); t.close();

t = boot();
t.transcript().querySelector("summary").click();
t.transcript().querySelector("summary").click();
check("pupil can deliberately reopen transcription while images load", t.transcript().open);
t.emit("part-1.png", "loaded"); t.emit("part-2.png", "loaded");
check("current image completion respects manual open state", t.transcript().open);
t.emit("context.png", "loaded");
check("context completion also respects manual open state", t.transcript().open);
t.gated("manual open"); t.close();

t = boot();
const oldImage = t.image("part-1.png"), oldContext = t.image("context.png"), oldTranscript = t.transcript();
const oldBatch = t.viewer._questionImageBatch;
t.viewer.goToId("q2");
const nextTranscript = t.transcript(), nextStatus = t.find(".ppq-question-loading").textContent;
check("navigation creates fresh automatic fallback state", nextTranscript !== oldTranscript && nextTranscript.open);
oldTranscript.querySelector("summary").click();
check("navigation removes old manual-choice listener", oldBatch.transcriptManual === false);
t.emit(oldImage, "loaded"); t.emit(oldContext, "failed");
check("late old image events cannot change new transcript or status", nextTranscript.open && t.find(".ppq-question-loading").textContent === nextStatus && !t.find(".ppq-image-retry"));
t.emit("next.png", "loaded");
check("new current image completion still closes new fallback", !nextTranscript.open);
oldImage.dispatchEvent(new t.window.Event("error"));
check("stale failures cannot reopen a finished new transcript", !nextTranscript.open && t.find(".ppq-question-loading").hidden);
t.gated("navigation with stale events"); t.close();

t = boot({ "part-1.png": "loaded", "part-2.png": "loaded" });
check("cached current crops leave transcript synchronously closed", !t.transcript().open);
check("cached current crops are immediately visible", !t.image("part-1.png").hidden && !t.image("part-1.png").classList.contains("ppq-question-image-pending"));
check("cached crops close fallback even with uncached context", !t.transcript().open && !t.find(".ppq-question-loading").hidden);
t.gated("cached current crops"); t.close();

t = boot({ "part-1.png": "loaded", "part-2.png": "loaded", "context.png": "loaded" });
check("fully cached batch starts without loading state", !t.transcript().open && t.find(".ppq-question-loading").hidden);
t.viewer.goToId("q3");
check("text-only questions show their words without collapsed transcript", !t.transcript() && t.find(".chemistry-part-text").textContent.includes("Text-only question."));
check("text-only question preserves newline and has no loading state", t.find(".chemistry-part-text br") && t.find(".ppq-question-loading").hidden);
t.gated("text-only question"); t.close();

console.log(passed + " chemistry loading checks passed");
