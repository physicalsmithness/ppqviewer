/* Headless test for the shared ppqviewer engine, run against the real ESAT catalogue.
   Requires jsdom:  npm install jsdom
   Run from anywhere:  node test/test_ppqviewer.js
   Paths are resolved relative to this file, assuming the estate layout:
     C:\Claude (not on Gdrive, nor OneDrive)\ppqviewer\        (this project)
     C:\Claude (not on Gdrive, nor OneDrive)\ESAT Prep App\    (sibling, supplies the catalogue)
*/
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const PV = path.join(__dirname, "..");
const ESAT_DATA = process.env.ESAT_CATALOGUE_PATH ||
  "C:\\Claude (not on Gdrive, nor OneDrive)\\ESAT Prep App\\app\\data\\esat_catalogue.js";

const dom = new JSDOM(`<!doctype html><html><body><div id="ppq-root"></div></body></html>`,
  { runScripts: "outside-only", pretendToBeVisual: true, url: "https://localhost/" });
const { window } = dom;
window.confirm = () => true; // jsdom supplies localStorage (given url), Image, devicePixelRatio

function run(file) { window.eval(fs.readFileSync(file, "utf8")); }
let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log("  ok   " + name); } else { fail++; console.log("  FAIL " + name); } }

try {
  run(ESAT_DATA);
  run(path.join(PV, "example", "esat-config.js"));
  run(path.join(PV, "engine", "ppqviewer.js"));

  check("engine exposes mount", typeof window.PPQViewer.mount === "function");
  check("config loaded", !!window.PPQ_CONFIG && window.PPQ_CONFIG.storageKey === "esat_ppq_v1");
  check("questions present", (window.ESAT_QUESTIONS || []).length > 0);

  const root = window.document.getElementById("ppq-root");
  const v = window.PPQViewer.mount(root, { config: window.PPQ_CONFIG, questions: window.ESAT_QUESTIONS, meta: window.ESAT_META });

  check("furniture built (Option A)", !!root.querySelector(".ppq-header") && !!root.querySelector(".ppq-card") && !!root.querySelector(".ppq-dash") && !!root.querySelector(".ppq-modal"));
  check("filters built from meta", root.querySelectorAll(".ppq-select").length === 5);
  check("full view = all questions", v.view.length === window.ESAT_QUESTIONS.length);
  check("a question is shown", root.querySelector(".ppq-card").style.display === "flex" && root.querySelector(".ppq-qid").textContent.length > 0);

  const labels = v._optionLabels(v.cur);
  check("options = current question labels", root.querySelectorAll(".ppq-option").length === labels.length && labels.length > 0);

  const correct = window.PPQ_CONFIG.correctOf(v.cur).toUpperCase();
  v.selectOption(correct);
  check("attempt recorded", v.store.attempts.length === 1);
  check("attempt row engine-ready", (() => { const a = v.store.attempts[0]; return a.slug && a.part != null && typeof a.time_ms === "number" && a.correct === true; })());
  check("competence revealed", root.querySelector(".ppq-competence").className.indexOf("show") >= 0);

  root.querySelector('.ppq-scale-btn[data-val="4"]').click();
  check("self-rating stored", v.store.scores[v.cfg.idOf(v.cur)] === 4);

  check("dashboard groups rendered", root.querySelectorAll(".ppq-cat").length > 0);
  check("dashboard shows a tick/cross", Array.from(root.querySelectorAll(".ppq-ribbon")).some((r) => r.querySelector(".ppq-tick") || r.querySelector(".ppq-cross")));

  const v2 = window.PPQViewer.mount(root, { config: window.PPQ_CONFIG, questions: window.ESAT_QUESTIONS, meta: window.ESAT_META });
  check("store persists (attempts)", v2.store.attempts.length === 1);
  check("store persists (scores)", Object.keys(v2.store.scores).length === 1);

  root.querySelector('.ppq-select[data-fidx="0"]').value = "chemistry";
  v2.filterQuestions();
  check("subject filter narrows view", v2.view.length > 0 && v2.view.length < window.ESAT_QUESTIONS.length && v2.view.every((q) => q.subject === "chemistry"));

  let threw = false;
  try { window.PPQViewer.mount(root, { config: { title: "x" }, questions: [] }); } catch (e) { threw = /storageKey/.test(e.message); }
  check("d002: missing storageKey throws", threw);

  const engineSrc = fs.readFileSync(path.join(PV, "engine", "ppqviewer.js"), "utf8");
  check("embed-safe: no getElementById() calls", engineSrc.indexOf("getElementById(") === -1);
} catch (e) {
  fail++; console.log("  FAIL threw: " + e.stack);
}
console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
