/* Deterministic adapter/engine integration: node test/test_chemistry_config.js.
 * Fixtures exercise migration, source boundaries and actual reveal/filter behavior.
 * No donor catalogue or network access is required. */
"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const rootDir = path.join(__dirname, "..");
const adapter = fs.readFileSync(path.join(rootDir, "example", "chemistry-config.js"), "utf8");
const engine = fs.readFileSync(path.join(rootDir, "engine", "ppqviewer.js"), "utf8");
let passed = 0;
function check(name, condition) { assert.ok(condition, name); passed++; }
function boot() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: "https://localhost/chemistrydriller/ppq.html", runScripts: "outside-only", pretendToBeVisual: true });
  dom.window.confirm = () => true;
  dom.window.eval(adapter);
  dom.window.eval(engine);
  return dom;
}
const dom = boot(), window = dom.window, api = window.ChemistryViewer;
const records = [{
  id: "25M.2.SL.TZ3.1", paper: "2", level: "SL", question_number: "1", marks: 99,
  question_text: "A stem.\nA second line.", question_images: ["assets/stem.png"],
  category_code: "S1", category_label: "Structure", current_levels: ["SL", "HL"],
  parts: [
    { part_id: "25M.2.SL.TZ3.1(a)", label: "(a)", text: "Name <the> substance.\nGive a reason.", marks: 2,
      crops: ["assets/a.png"], ms_crops: ["assets/ms-a.png"], markscheme_text: "Answer <safe>.\nReason.",
      lead_in: "Group introduction.\nKeep this break.", marking_differs: true, marking_note: "Old marking convention.",
      shared_group: "part-a-twin", spec_status: "current" },
    { part_id: "25M.2.SL.TZ3.1(b)", label: "(b)", text: "Unknown marks.",
      ms_crops: ["assets/ms-b.png"], marking_note: "Another older convention.", spec_status: "current" }
  ]
}, {
  id: "25M.2.HL.TZ3.1(a)", parent_id: "25M.2.HL.TZ3.1", paper: "2", level: "HL", label: "(a)",
  question_text: "HL printing of same part.", marks: 2, shared_group: "part-a-twin", current_levels: ["SL", "HL"], spec_status: "current"
}, {
  id: "ahl-only", paper: "2", level: "SL", question_text: "Historically SL, currently HL.", marks: 3,
  current_levels: ["HL"], spec_status: "current"
}, {
  id: "unknown-level", paper: "2", level: "SL", question_text: "Unclassified current level.", marks: 1, spec_status: "current"
}, {
  id: "original-hl-only", paper: "2", level: "HL", question_text: "Only available in original HL paper.", marks: 1,
  current_levels: ["SL", "HL"], spec_status: "current"
}, {
  id: "mixed", paper: "2", level: "SL", question_text: "Mixed syllabus.", marks: 1,
  current_levels: ["SL", "HL"], spec_status: "mixed"
}, {
  id: "out", paper: "2", level: "SL", question_text: "An old syllabus question.", marks: 1,
  current_levels: ["SL", "HL"], spec_status: "out", usable_if: "Practise only the calculation."
}, {
  id: "25N.1A.SL.TZ1.1", paper: "1A", level: "SL", marks: 1, question_text: "Choose an option.",
  choices: ["<b>literal</b>", "B", "C", "D"], answer_key: "A", markscheme_images: ["assets/mcq-ms.png"],
  level_availability: "SL+HL", marking_note: "MCQ older marking.", spec_status: "current"
}];
const before = JSON.stringify(records), questions = api.normalizeQuestions(records);
check("normalization preserves source records", JSON.stringify(records) === before);
check("canonical parts retain exact stable ID", questions[0].id === "25M.2.SL.TZ3.1(a)");
check("parent stem remains separate from part", questions[0].stem_text === "A stem.\nA second line." && questions[0].question_text.startsWith("Name"));
check("parent image is context", questions[0].context_images[0] === "assets/stem.png" && !questions[0].question_images);
check("missing part marks do not inherit parent total", questions[1].marks === null);
assert.throws(() => api.normalizeQuestions([{ id: "duplicate" }, { id: "duplicate" }]), /Duplicate/); passed++;
assert.throws(() => api.normalizeQuestions([{ id: "parent", parts: [{ text: "No ID" }] }]), /stable ID/); passed++;
const sourceShape = api.normalizeQuestions([{
  id: "source-parent", question: "8", paper: "1B", answer_key: "D", choices: ["A", "B", "C", "D"], markscheme_text: "Parent answer",
  parts: [{ part_id: "source-parent(a)", text: "First part" }, { part_id: "source-parent(b)", text: "Second part" }]
}, {
  id: "whole-mcq", question: "7", paper: "1A", answer_key: "D", choices: ["A", "B", "C", "D"],
  parts: [{ part_id: "whole-mcq(whole)", legacy_id: "whole-mcq", label: "7", text: "Whole MCQ" }]
}]);
check("canonical question number is preserved", sourceShape[0].question_number === "8");
check("multipart children never inherit unrelated parent answers", sourceShape.slice(0, 2).every(q => !q.answer_key && !q.choices && !q.markscheme_text));
check("single whole MCQ inherits its real parent answer", sourceShape[2].answer_key === "D" && sourceShape[2].choices.length === 4);
check("whole alias keeps the old runtime identity", sourceShape[2].id === "whole-mcq");
check("whole alias preserves canonical part ID for provenance", sourceShape[2].part_id === "whole-mcq(whole)");
const flatAlias = api.normalizeQuestions([{ id: "old-flat(whole)", part_id: "old-flat(whole)", legacy_id: "old-flat" }])[0];
check("explicit alias also preserves flat runtime identity", flatAlias.id === "old-flat" && flatAlias.part_id === "old-flat(whole)");

const config = api.createConfig({ questions, meta: { code_names: { S1: "Atomic structure" } }, learnerLevel: "SL" });
check("namespaced v2 key", config.storageKey === "chemistrydriller_ppq_v2");
check("modern preferences and history enabled", config.learnerLevel.enabled && config.attemptHistory.enabled && config.practiceSelection.enabled);
check("donor two-panel dashboard remains", config.dashboardLayout === "split" && config.dashboardColumns.length === 2);
check("booklet still available", config.modules.referenceBooklet.sections.length === 25 && config.headerButtons.length === 2);
check("human topic labels use meta names", config.groupLabel(questions[0]) === "Atomic structure (S1)");
const text = config.questionTextOf(questions[0]);
check("stem, lead and part have separate blocks", text.includes('class="chemistry-stem"') && text.includes('class="chemistry-lead-in"') && text.includes('class="chemistry-part-text"'));
check("line breaks are preserved", text.includes("A stem.<br>A second line.") && text.includes("substance.<br>Give"));
check("source text is escaped", text.includes("&lt;the&gt;") && !text.includes("Name <the>"));
check("local computer asset refs are not guessed into public files", config.cropsOf({ crop_url: "file:///C:/corpus/original.png" }).length === 0);
check("unsafe asset URLs are rejected", config.cropsOf({ question_images: ["javascript:alert(1)", "data:text/html,bad", "C:\\secret.png"] }).length === 0);
check("assembler image array takes precedence over old fields", config.cropsOf({ question_images: [], crop_url: "old.png" }).length === 0);
const based = api.createConfig({ questions, assetBase: "preview" });
check("asset base applies to normalized image", based.cropsOf(questions[0])[0] === "preview/assets/a.png");
check("safe legacy relative crop remains available", config.cropsOf({ crop_url: "assets/legacy.png" })[0] === "assets/legacy.png");
check("printing availability is not current eligibility", api.currentLevelsOf(questions.find(q => q.id === "25N.1A.SL.TZ1.1"))[0] === "UNKNOWN");
check("original level is never inferred as current eligibility", api.currentLevelsOf({ level: "SL" })[0] === "UNKNOWN");
check("marking note is absent before reveal notices", !config.noticesOf(questions[0]).some(n => String(n.text).includes("Old marking")));
check("marking note is supplied to reveal", config.markschemeNoteOf(questions[0]) === "Old marking convention.");
check("explicitly unchanged marking does not create an era warning", config.markschemeNoteOf({ marking_differs: false, marking_note: "No substantive difference" }) === "");
check("catalogue cross-level grouping is mapped", config.levelTwins.keyOf({ cross_level_group_id: "xlvl", cross_level_group_method: "token_context" }) === "xlvl");
check("self groups never become twins", config.levelTwins.keyOf({ cross_level_group_id: "self", cross_level_group_method: "self" }) === null);
check("whole MCQ number is not repeated as a part label", config.partLabelOf(sourceShape[2]) === "");
const noEligibility = api.createConfig({ questions: [{ id: "legacy", paper: "2", level: "SL", level_availability: "SL+HL" }] });
check("printing metadata alone creates no current eligibility filter", !noEligibility.filters.some(filter => filter.field === "current_levels"));
const originalFilter = config.filters.find(filter => filter.field === "original_availability");
check("SL source availability uses declared printing availability", originalFilter.default.join(",") === "SL,UNKNOWN" && originalFilter.valueOf({ level: "HL", level_availability: "SL+HL" }).join(",") === "SL,HL");
check("HL availability includes SL practice", based.filters.find(filter => filter.field === "original_availability").default.join(",") === "SL,HL,UNKNOWN");
const specFilter = config.filters.find(filter => filter.field === "spec_status");
check("current and close are the reviewed default cut", specFilter.default.join(",") === "current,close");
check("mixed and out remain explicitly selectable", specFilter.values.includes("mixed") && specFilter.values.includes("out"));
check("ungraded flashcard supplies scheme image on reveal path", config.markschemeOf(questions[1]).includes("assets/ms-b.png") && config.markschemeOf(questions[1]).includes("Another older convention."));

window.localStorage.setItem("chemistrydriller_ppq_v1_scores", JSON.stringify({ "25M.2.SL.TZ3.1(a)": 6, "old-not-in-bank": 4 }));
window.localStorage.setItem("chemistrydriller_ppq_v1_mcq", JSON.stringify({ "25N.1A.SL.TZ1.1": true, "old-wrong": false }));
window.localStorage.setItem("ppq_scores", JSON.stringify({ unrelated: 6 }));
const migrated = config.migrate(window.localStorage);
check("all valid legacy ratings survive, even absent catalogue IDs", migrated.scores["old-not-in-bank"] === 4 && migrated.scores[questions[0].id] === 6);
check("both right and wrong MCQ outcomes survive", migrated.attempts.length === 2 && migrated.attempts.find(a => a.id === "old-wrong").correct === false);
check("migration claims no learner ownership or timestamp", migrated.attempts.every(a => a.ts === null && !a.learner_id));
check("unscoped historical keys are ignored", migrated.scores.unrelated === undefined);
check("legacy store is not deleted", window.localStorage.getItem("chemistrydriller_ppq_v1_scores") !== null);

const root = window.document.getElementById("root"), viewer = window.PPQViewer.mount(root, { config, questions, meta: {} });
check("engine loads legacy confidence", viewer.store.scores[questions[0].id] === 6);
check("SL default excludes declared AHL", !viewer.view.some(q => q.id === "ahl-only"));
check("SL default retains unclassified current level", viewer.view.some(q => q.id === "unknown-level"));
check("normal practice excludes mixed and out-of-syllabus records", !viewer.view.some(q => q.id === "out" || q.id === "mixed"));
check("SL class excludes HL-only original printing", !viewer.view.some(q => q.id === "original-hl-only"));
check("SL class retains a source available at both levels", viewer.view.some(q => q.id === "25N.1A.SL.TZ1.1"));
check("twins keep preferred SL printing once", viewer.view.filter(q => q.shared_group === "part-a-twin").length === 1 && viewer.view.find(q => q.shared_group === "part-a-twin").level === "SL");
check("suppressed twin is still addressable", !!viewer.byId["25M.2.HL.TZ3.1(a)"]);
viewer.goToId(questions[0].id);
check("shared part navigator recognizes exact published IDs", root.querySelectorAll(".ppq-part-chip").length === 2);
check("printed context starts collapsed, with figures available on expansion", root.querySelector(".chemistry-context").open === false);
check("transcription is readable while the current part image loads", root.querySelector(".chemistry-transcription").open === true);
root.querySelectorAll(".ppq-question-crop").forEach(image => image.dispatchEvent(new window.Event("load")));
check("loaded current part makes the transcription closed by default", root.querySelector(".chemistry-transcription").open === false);
check("full context avoids a duplicate whole-question crop stack", !root.querySelector(".ppq-whole") && !root.querySelector(".ppq-wq-part"));
check("structured part uses mark-based self-assessment", viewer._curType === "marksSelfAssess");
check("markscheme absent from question stem", !root.querySelector(".ppq-stem").textContent.includes("Answer <safe>") && !root.querySelector('.ppq-stem img[src="assets/ms-a.png"]'));
check("rendered line breaks exist", root.querySelectorAll(".chemistry-part-text br").length === 1);
check("text-only record keeps its paragraphs visible", !config.questionTextOf({ id: "text-only", question_text: "First\nSecond" }).includes("<details") && config.questionTextOf({ id: "text-only", question_text: "First\nSecond" }).includes("First<br>Second"));
viewer.reveal();
check("scheme image appears after reveal", !!root.querySelector('.ppq-markscheme img[src="assets/ms-a.png"]'));
check("era note appears after reveal", root.querySelector(".ppq-markscheme").textContent.includes("Old marking convention."));
check("reveal does not invent a scored attempt", viewer.store.attempts.length === 2);
viewer.goToId(questions[1].id);
viewer.reveal();
check("unknown-mark flashcard reveals its original scheme", !!root.querySelector('.ppq-markscheme img[src="assets/ms-b.png"]'));
viewer.goToId("25N.1A.SL.TZ1.1");
check("MCQ choices cannot inject source HTML", root.querySelector(".ppq-option-mcq").textContent.includes("<b>literal</b>") && !root.querySelector(".ppq-option-mcq b"));
viewer.selectMCQ("A");
check("MCQ records actual correctness", viewer.store.attempts[viewer.store.attempts.length - 1].correct === true);
check("MCQ image markscheme appears only after answering", !!root.querySelector('.ppq-markscheme img[src="assets/mcq-ms.png"]'));
viewer.destroy();
dom.window.close();

const existing = boot(), existingApi = existing.window.ChemistryViewer;
existing.window.localStorage.setItem("chemistrydriller_ppq_v2", JSON.stringify({ scores: { keep: 3 }, attempts: [], prefs: { learnerLevel: "SL" } }));
existing.window.localStorage.setItem("chemistrydriller_ppq_v1_scores", JSON.stringify({ wrong: 6 }));
const existingViewer = existing.window.PPQViewer.mount(existing.window.document.getElementById("root"), {
  config: existingApi.createConfig({ questions }), questions, meta: {}
});
check("existing v2 progress is not reseeded from legacy", existingViewer.store.scores.keep === 3 && existingViewer.store.scores.wrong === undefined);
check("saved learner preference survives", existingViewer._learnerLevel() === "SL");
existingViewer.destroy(); existing.window.close();
const aliasDom = boot(), aliasWindow = aliasDom.window;
aliasWindow.localStorage.setItem("chemistrydriller_ppq_v1_scores", JSON.stringify({ "whole-mcq": 5 }));
aliasWindow.localStorage.setItem("chemistrydriller_ppq_v1_mcq", JSON.stringify({ "whole-mcq": true }));
const aliasViewer = aliasWindow.PPQViewer.mount(aliasWindow.document.getElementById("root"), {
  config: aliasWindow.ChemistryViewer.createConfig({ questions: sourceShape }), questions: sourceShape, meta: {}
});
aliasViewer.goToId("whole-mcq");
check("old deep link opens the aliased whole record", aliasViewer.cur.id === "whole-mcq" && aliasViewer.cur.part_id === "whole-mcq(whole)");
check("legacy score maps directly onto alias runtime ID", aliasViewer.store.scores[aliasViewer.cfg.idOf(aliasViewer.cur)] === 5);
check("legacy attempt maps directly onto alias runtime ID", aliasViewer.store.attempts.some(attempt => attempt.id === aliasViewer.cur.id && attempt.correct === true));
check("whole record is still discoverable as its parent", aliasViewer._blockParts(aliasViewer.cur).length === 1);
aliasViewer.destroy(); aliasWindow.close();

const masteryDom = boot(), masteryWindow = masteryDom.window;
const masteryQuestions = [
  { id: "analysis-a", paper: "1B", level: "SL", marks: 2, question_text: "First practical skill.",
    category_code: "7H", category_label: "Hazard-to-precaution matching", p1b_skill: ["7H1", "7H"] },
  { id: "analysis-b", paper: "1B", level: "SL", marks: 2, question_text: "Second practical skill.",
    category_code: "7H", category_label: "Hazard-to-precaution matching", p1b_skill: ["7H2", "7H"] },
  { id: "analysis-fallback", paper: "1B", level: "SL", marks: 1, question_text: "A newly classified practical skill.", p1b_skill: ["8D1a"] }
];
const masteryConfig = masteryWindow.ChemistryViewer.createConfig({questions:masteryQuestions});
check("explicit donor mastery code takes priority over finer skill tags", masteryConfig.dashboardColumns[0].groupKey(masteryQuestions[0]) === "7H");
check("new data without an explicit donor category retains its supplied skill", masteryConfig.dashboardColumns[0].groupKey(masteryQuestions[2]) === "8D1a");
check("syllabus topic cannot replace a practical mastery category", masteryConfig.dashboardColumns[0].groupKey({paper:"1B",category_code:"S1",p1b_skill:["8D1a"]}) === "8D1a");
masteryWindow.localStorage.setItem("chemistrydriller_ppq_v1_scores", JSON.stringify({"analysis-a":2,"analysis-b":5}));
const masteryRoot = masteryWindow.document.getElementById("root");
const masteryViewer = masteryWindow.PPQViewer.mount(masteryRoot, {config:masteryConfig,questions:masteryQuestions,meta:{}});
const masteryLayout = masteryRoot.querySelector(".ppq-layout-split");
check("practical mastery remains the left flanking panel", masteryLayout.firstElementChild.classList.contains("ppq-dash-left") && masteryLayout.lastElementChild.classList.contains("ppq-dash-right"));
const broadRow = masteryRoot.querySelector('.ppq-dash-left .ppq-cat[data-key="7H"]');
check("two detailed skills retain one shared original mastery row", !!broadRow && masteryRoot.querySelectorAll(".ppq-dash-left .ppq-cat").length === 2 && broadRow.querySelector(".ppq-cat-count").textContent === "(2)");
check("both old ratings populate the same ten-box mastery history", broadRow.querySelectorAll(".ppq-lhs-box").length === 10 && broadRow.querySelectorAll(".ppq-lhs-box[style]").length === 2);
broadRow.click();
check("clicking the broad mastery row selects both detailed skills", masteryViewer.view.map(q=>q.id).sort().join(",") === "analysis-a,analysis-b");
masteryRoot.querySelector('.ppq-dash-left .ppq-cat[data-key="7H"]').click();
check("clicking the active mastery row restores the full selection", masteryViewer.view.length === 3 && !masteryViewer.groupFilter);
check("fine skills remain available through their explicit filter", masteryViewer.cfg.filters.find(filter=>filter.field === "p1b_skill").values.includes("7H1"));
masteryViewer.goToId("analysis-a");
const normalTimeout = masteryWindow.setTimeout.bind(masteryWindow);
masteryWindow.setTimeout = (callback, delay, ...args) => delay === 220 ? (callback(...args), 0) : normalTimeout(callback, delay, ...args);
masteryViewer._saveRating(6);
check("saving a rating highlights the original broad mastery row", masteryRoot.querySelector('.ppq-dash-left .ppq-cat[data-key="7H"]').classList.contains("ppq-cat-fired"));
check("saved rating updates the broad mastery history", masteryRoot.querySelector('.ppq-dash-left .ppq-cat[data-key="7H"] .ppq-lhs-box').style.background === "rgb(47, 133, 90)");
masteryViewer.destroy(); masteryWindow.close();
console.log(passed + " chemistry adapter checks passed");
