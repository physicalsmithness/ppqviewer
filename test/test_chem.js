/* Headless test for the shared engine's chemistry consumer (question types, modules,
   split dashboard, migration). Requires jsdom. Run: node test/test_chem.js
   Layout assumed: ppqviewer\ sibling of chemistrydriller\ (which supplies ppqs.js).

   jsdom is NOT vendored here, so this suite silently stopped being run and its
   one stale assertion went unnoticed for over a week (2026-07-30). If `require
   ("jsdom")` fails, install it anywhere and point NODE_PATH at it, e.g.
     npm install jsdom --prefix %TEMP%\ppqjs
     set NODE_PATH=%TEMP%\ppqjs\node_modules && node test\test_chem.js
   Chemistry is the donor of the multipart model the whole engine leans on, so
   this suite matters more than its run frequency suggested. */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const PV = path.join(__dirname, "..");
const CHEM_ROOT = process.env.CHEMISTRYDRILLER_ROOT ||
  "C:\\Claude (not on Gdrive, nor OneDrive)\\chemistrydriller";
const CHEM_DATA = path.join(CHEM_ROOT, "ppqs.js");

const dom = new JSDOM(`<!doctype html><html><body><div id="ppq-root"></div></body></html>`,
  { runScripts: "outside-only", pretendToBeVisual: true, url: "https://localhost/" });
const { window } = dom;
window.confirm = () => true;
global.window = window; global.document = window.document;
function run(f) { window.eval(fs.readFileSync(f, "utf8")); }
let pass = 0, fail = 0;
function check(n, c) { if (c) { pass++; console.log("  ok   " + n); } else { fail++; console.log("  FAIL " + n); } }

try {
  window.localStorage.setItem("chemistrydriller_ppq_v1_scores", JSON.stringify({ "25N.1A.SL.TZ1.1": 5 }));
  window.localStorage.setItem("chemistrydriller_ppq_v1_mcq", JSON.stringify({ "25N.1A.SL.TZ1.1": true }));

  require(CHEM_DATA);                                  // large file: sets window.CHEM_PPQS
  run(path.join(PV, "example", "chem-config.js"));
  run(path.join(PV, "engine", "ppqviewer.js"));

  check("config is chemistry v2", window.PPQ_CONFIG.storageKey === "chemistrydriller_ppq_v2");
  check("questions present", (window.CHEM_PPQS || []).length > 0);

  const root = window.document.getElementById("ppq-root");
  const v = window.PPQViewer.mount(root, { config: window.PPQ_CONFIG, questions: window.CHEM_PPQS, meta: {} });

  check("migrate: score seeded from v1", v.store.scores["25N.1A.SL.TZ1.1"] === 5);
  check("migrate: mcq history seeded as attempt", v.store.attempts.some((a) => a.id === "25N.1A.SL.TZ1.1" && a.correct === true));
  check("2 filters + order = 3 selects", root.querySelectorAll(".ppq-select").length === 3);
  /* The split dashboard moved to two FLANKING panels on 2026-07-22 (left =
     column 0, question centre, right = column 1), restoring the original
     chemistry three-column shape. This assertion still described the older
     one-sidebar DOM (.ppq-dash-content.split / .ppq-dash-col) and so had been
     failing against a feature that works. Corrected 2026-07-30 to the current
     contract; verified failing identically on the pre-d016 engine first, so it
     was never a regression. */
  check("split dashboard (2 flanking panels)",
    root.querySelector(".ppq-layout-split") && root.querySelectorAll(".ppq-dash-split-panel").length === 2 &&
    Array.prototype.every.call(root.querySelectorAll(".ppq-dash-split-panel"),
      (p) => p.querySelector(".ppq-dash-content") && p.querySelector("h3")));
  check("split has rating boxes + ribbon/heat", root.querySelector(".ppq-lhs-box") && root.querySelector(".ppq-heat"));

  const mcqQ = window.CHEM_PPQS.find((q) => q.paper === "1A" && q.choices && q.answer_key);
  v.goToId(mcqQ.id);
  check("MCQ: type mcq, option buttons with text", v._curType === "mcq" && root.querySelectorAll(".ppq-option-mcq").length === mcqQ.choices.length);
  const before = v.store.attempts.length;
  v.selectMCQ(mcqQ.answer_key.toUpperCase());
  check("MCQ: correct records a right attempt", v.store.attempts.length === before + 1 && v.store.attempts[v.store.attempts.length - 1].correct === true);

  const fcQ = window.CHEM_PPQS.find((q) => q.paper !== "1A" && q.markscheme_text);
  v.goToId(fcQ.id);
  check("flashcard: type flashcard, no options", v._curType === "flashcard" && root.querySelector(".ppq-options").style.display === "none");
  const beforeFc = v.store.attempts.length;
  v.reveal();
  check("flashcard: reveal shows markscheme", root.querySelector(".ppq-answer-panel").className.indexOf("show") >= 0 && root.querySelector(".ppq-markscheme").innerHTML.length > 0);
  check("flashcard: reveal records no graded attempt", v.store.attempts.length === beforeFc);

  const multi = window.CHEM_PPQS.find((q) => v._blockParts(q).length > 1);
  v.goToId(multi.id);
  check("structured: part chips (>1)", root.querySelectorAll(".ppq-part-chip").length > 1);
  check("structured: whole-question assembly", !!root.querySelector(".ppq-whole") && !!root.querySelector(".ppq-wq-part"));
  check("structured: mode toggle (whole + part)", root.querySelectorAll(".ppq-mode-btn").length === 2);

  const bookQ = window.CHEM_PPQS.find((q) => /section\s+\d+/i.test(q.question_text || "") || /periodic table/i.test(q.question_text || ""));
  if (bookQ) { v.goToId(bookQ.id); check("referenceBooklet: button injected", root.querySelectorAll(".ppq-booklet").length >= 1); }
  else { check("referenceBooklet (no trigger in bank, skipped)", true); }

  check("header buttons present (2)", root.querySelectorAll(".ppq-headbtn").length === 2);
  root.querySelector('.ppq-select[data-fidx="0"]').value = "1A";
  v.filterQuestions();
  check("paper filter narrows to 1A", v.view.length > 0 && v.view.every((q) => q.paper === "1A"));
} catch (e) { fail++; console.log("  FAIL threw: " + e.stack); }
console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
