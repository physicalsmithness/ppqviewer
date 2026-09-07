/* Headless test for the shared engine's IB Economics consumer.
   Requires jsdom.  Run:  node test/test_economics.js

   It runs against the REAL 1,021-record catalogue, not fixtures, because
   almost everything this wrapper does is a response to something specific in
   that data (options parsed out of OCR'd multiple-choice text, 127 parts whose
   printed marks did not survive extraction, a two-level paper_reports shape,
   assets in crops/ and pages/ subfolders). A fixture would agree with the
   wrapper by construction and prove nothing.

   Catalogue location, following test_chem.js's CHEMISTRYDRILLER_ROOT pattern:
   the Windows path is the default and ECONOMICS_CATALOGUE_PATH overrides it,
   so the same suite runs on the Windows estate and on a POSIX mount.

     set ECONOMICS_CATALOGUE_PATH=...\economics_catalogue.js && node test\test_economics.js

   jsdom is not vendored. If require("jsdom") fails, install it anywhere and
   point NODE_PATH at it:
     npm install jsdom --prefix %TEMP%\ppqjs
     set NODE_PATH=%TEMP%\ppqjs\node_modules && node test\test_economics.js
*/
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const PV = path.join(__dirname, "..");
const ECON_DATA = process.env.ECONOMICS_CATALOGUE_PATH ||
  "C:\\CodexProjects\\PaperDatabases\\Economics Categorisation\\viewer\\economics_catalogue.js";
/* Optional: when set, the suite also checks that a sample of the asset URLs
   the wrapper builds resolve to files that actually exist. */
const PREVIEWS_ROOT = process.env.ECONOMICS_PREVIEWS_ROOT || "";

const dom = new JSDOM(
  `<!doctype html><html><body><div id="ppq-root"></div><div id="ppq-root-2"></div></body></html>`,
  { runScripts: "outside-only", pretendToBeVisual: true, url: "https://localhost/" });
const { window } = dom;
window.confirm = () => true;
global.window = window; global.document = window.document;

let pass = 0, fail = 0;
function check(n, c) { if (c) { pass++; console.log("  ok   " + n); } else { fail++; console.log("  FAIL " + n); } }
function run(f) { window.eval(fs.readFileSync(f, "utf8")); }
/* The wrapper's config is inline in its page, as ibmaths.html's is. Take the
   last <script> block, the house pattern from verify_analysis_presentation.js. */
function inlineScriptOf(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf8");
  const open = html.lastIndexOf("<script>");
  if (open < 0) throw new Error("no inline <script> in " + htmlPath);
  return html.slice(open + "<script>".length, html.indexOf("</script>", open));
}

/* Everything the extractor can leave behind that a pupil must never read. The
   figure marker is declared in meta.figure_marker; the other three families
   are undeclared and are cleaned by the wrapper. */
const BANNED = [
  { name: "[figure] / [graph] omission token", re: /\[(?:figure|graph|diagram|image|table)\]/i },
  { name: "[answer space]", re: /\[\s*answer space\s*\]/i },
  { name: "bare mark allocation [4] / [4 marks]", re: /\[\s*\d{1,3}\s*(?:marks?)?\s*\]/i },
  { name: "copyright-redaction prose", re: /(?:removed|redacted)\s+for\s+copyright/i },
  { name: "please-refer-to link", re: /\[\s*please refer to/i }
];
function bannedIn(text) {
  const t = String(text == null ? "" : text);
  for (const b of BANNED) if (b.re.test(t)) return b.name;
  return null;
}

try {
  const ECON_HTML = path.join(PV, "example", "economics.html");

  require(ECON_DATA);                       // 11 MB: sets window.ECON_META + ECON_QUESTIONS
  run(path.join(PV, "engine", "ppqviewer.js"));
  window.eval(inlineScriptOf(ECON_HTML));   // builds records, sets PPQ_CONFIG, mounts #ppq-root

  const cfg = window.PPQ_CONFIG;
  const RAW = window.ECON_QUESTIONS || [];
  const META = window.ECON_META || {};
  const RECORDS = window.ECON_VIEWER_RECORDS || [];
  const STATS = window.ECON_BUILD_STATS || {};
  const rawParts = RAW.reduce((a, q) => a + (q.parts || []).length, 0);

  // ---------------------------------------------------------------- the data
  check("config is the economics consumer", cfg.storageKey === "economics_ppq_v1");
  /* Counts are ECHOED, not pinned. This suite failed eight times over on
     2026-09-05 for no reason but a regeneration: the seat re-baselined to
     1,017 records and 3,502 parts, filled every empty spec_status, recovered
     109 of the 127 unmarked parts and repaired three of the seven unparsed
     MCQs. Every one of those is the seat doing exactly what was asked, and a
     gate that goes red when the data IMPROVES teaches its owner to ignore it.
     So each check below asserts the invariant and reports the number. */
  check("real catalogue: " + RAW.length + " records, " + rawParts + " parts",
    RAW.length > 900 && rawParts >= RAW.length && rawParts < RAW.length * 12);
  check("every part became one markable unit", RECORDS.length === rawParts);
  check("wrapper mounted its own page without throwing",
    !!window.document.getElementById("ppq-root").querySelector(".ppq-card"));

  // -------------------------------------------------------------- identities
  const ids = new Set(RECORDS.map((r) => r.id));
  check("part ids are unique", ids.size === RECORDS.length);
  /* Attempts are keyed on the part id, so it has to be reproducible from the
     record id and the printed label alone, and it has to keep the engine's
     "<block>(<part>)" shape or _blockParts finds no siblings. */
  check("part ids keep the engine's block shape",
    RECORDS.every((r) => !r.is_part || r.id.indexOf(r.block_id + "(") === 0));
  check("single-part questions keep their original record id",
    RECORDS.filter((r) => !r.is_part).every((r) => r.id === r.block_id));
  check("part id is derived from record id + printed label",
    ids.has("22M.P2.HL.Q1(a_i)") && ids.has("22M.P2.HL.Q1(g)"));

  // ------------------------------------------------------------ asset URLs
  /* The delivery packet puts assets in <preview>/{crops,pages}. Building them
     flat, as the maths corpus allows, breaks every image on the page. */
  const allCrops = [], allPages = [];
  RECORDS.forEach((r) => {
    (r.crops || []).forEach((u) => allCrops.push(u));
    (r.ms_crops || []).forEach((u) => allCrops.push(u));
    (r.ms_pages || []).forEach((u) => allPages.push(u));
    (r.question_pages_all || []).forEach((u) => allPages.push(u));
  });
  check("crops resolve under <preview>/crops/",
    allCrops.length > 4000 && allCrops.every((u) => u.indexOf("/crops/") > 0));
  check("pages resolve under <preview>/pages/",
    allPages.length > 3000 && allPages.every((u) => u.indexOf("/pages/") > 0));
  check("question pages carry the question_ prefix, never mark_",
    RECORDS.every((r) => (r.question_pages_all || []).every((u) => /\/pages\/question_/.test(u))));
  if (PREVIEWS_ROOT) {
    const sample = allCrops.filter((_, i) => i % 500 === 0).concat(allPages.filter((_, i) => i % 500 === 0));
    const missing = sample.filter((u) => {
      const rel = u.slice(u.indexOf("/previews/") + "/previews/".length);
      return !fs.existsSync(path.join(PREVIEWS_ROOT, rel));
    });
    check("sampled asset URLs exist on disk (" + sample.length + " checked)", missing.length === 0);
  } else {
    check("asset existence on disk (ECONOMICS_PREVIEWS_ROOT unset, skipped)", true);
  }

  // ------------------------------------------- no raw token reaches a pupil
  let leaked = null, leakedWhere = "";
  for (const r of RECORDS) {
    const where = bannedIn(r.part_text) || bannedIn(r.stem_text);
    if (where) { leaked = r.id; leakedWhere = where; break; }
  }
  check("no extraction token survives into pupil text" + (leaked ? " (" + leaked + ": " + leakedWhere + ")" : ""),
    leaked === null);
  /* And nothing reaches the rendered card either, which is the claim that
     actually matters. Sampled across the records that carry the token. */
  const figureRecs = RECORDS.filter((r) => r.part_figure_omitted);
  check("the catalogue really does carry the token, " + figureRecs.length + " records (guard against a vacuous pass)",
    figureRecs.length > 20 &&
    RAW.some((q) => (q.parts || []).some((p) => /\[figure\]/i.test(p.text || ""))));

  // ---------------------------------------------------------- human names
  const itemFilter = cfg.filters.filter((f) => f.field === "syllabus_items")[0];
  const observedCodes = new Set();
  RECORDS.forEach((r) => (r.syllabus_items || []).forEach((c) => observedCodes.add(c)));
  const unnamed = [...observedCodes].filter((c) => {
    const l = itemFilter.friendlyLabels[c];
    return !l || l === c || /^\s*\d+(?:\.\w+)+\s*$/.test(l);
  });
  check("every observed syllabus code has a human name (" + observedCodes.size + " codes)", unnamed.length === 0);
  check("names lead, codes follow", (itemFilter.friendlyLabels["1.2.1.b"] || "").indexOf("1.2.1.b") > 0);
  /* The seat ships 83 names wrapped in square brackets, which read as one more
     extraction token if passed through. */
  check("bracket-wrapped code names are unwrapped",
    !Object.values(itemFilter.friendlyLabels).some((l) => /^\[/.test(String(l))));
  const unitFilter = cfg.filters.filter((f) => f.field === "unit_code")[0];
  check("units are named, not numbered", /Microeconomics/.test(unitFilter.friendlyLabels["2"] || ""));
  /* The markable unit is the part, so the unit must be the part's own. A
     data-response question walks the syllabus; filing all of it under the
     record's primary_code would misplace a fifth of the corpus. */
  const partUnit = new Map();
  RAW.forEach((q) => (q.parts || []).forEach((p) => {
    const own = (p.primary_codes || [])[0] || (p.secondary_codes || [])[0] || q.primary_code || "";
    partUnit.set(q.id + "|" + p.label, String(own).split(".")[0]);
  }));
  const misfiled = RECORDS.filter((r) => {
    const want = partUnit.get(r.block_id + "|" + (r.is_part ? r.question + r.part_label : r.question));
    return want && ["1", "2", "3", "4"].indexOf(want) >= 0 && r.unit_code !== want;
  });
  check("each part is filed under its own unit, not the whole question's", misfiled.length === 0);
  check("and that actually moves records (the whole-question unit would differ)",
    RECORDS.some((r) => r.unit_code !== (String(RAW.filter((q) => q.id === r.block_id)[0].primary_code || "").split(".")[0])));
  const typeFilter = cfg.filters.filter((f) => f.field === "question_type")[0];
  const observedTypes = new Set(RECORDS.map((r) => r.question_type));
  check("every question type has a human label, no raw tokens",
    [...observedTypes].every((t) => typeFilter.friendlyLabels[t] && !/_/.test(typeFilter.friendlyLabels[t])));
  const aoFilter = cfg.filters.filter((f) => f.field === "ao_focus")[0];
  const observedAO = new Set(RECORDS.map((r) => r.ao_focus));
  check("every assessment objective has a human label",
    [...observedAO].every((a) => !!aoFilter.friendlyLabels[a]));

  // ------------------------------------------------------------- the counts
  /* The seat has since filled every one, so this now asserts the invariant
     rather than the old count: nothing is ever served without a syllabus
     status, whether the seat supplied it or the wrapper defaulted it. */
  check("every record has a syllabus status (" + STATS.specDefaulted + " defaulted by the wrapper)",
    RECORDS.every((r) => !!r.spec_status));
  check("multiple choice: " + STATS.mcqParsed + " parsed, " + STATS.mcqFellBack + " fell back",
    STATS.mcqParsed + STATS.mcqFellBack === RECORDS.filter((r) => r.question_type === "multiple_choice").length &&
    STATS.mcqParsed > STATS.mcqFellBack * 5);
  check(STATS.marksMissing + " parts have no usable printed marks, and none is offered a mark bar",
    RECORDS.filter((r) => !(parseInt(r.marks, 10) > 0)).every((r) => cfg.questionType(r) !== "marksSelfAssess"));

  // ------------------------------------------------------------- the viewer
  const root = window.document.getElementById("ppq-root-2");
  const v = window.PPQViewer.mount(root, { config: cfg, questions: RECORDS, meta: META });

  check("engine furniture built", !!root.querySelector(".ppq-header") && !!root.querySelector(".ppq-card"));
  check("modules on: part navigator + post-question review",
    cfg.modules.structuredPaper === true && cfg.modules.postQuestionReview === true);

  // --------------------------------------------- syllabus filter defaults
  const specFilter = cfg.filters.filter((f) => f.field === "spec_status")[0];
  check("syllabus filter is multi-select, defaulting to current + mixed",
    specFilter.multi === true &&
    specFilter.default.length === 2 &&
    specFilter.default.indexOf("current") >= 0 && specFilter.default.indexOf("mixed") >= 0);
  check("off-syllabus questions exist but are not served by default",
    RECORDS.some((r) => r.spec_status === "out") && v.view.every((q) => q.spec_status !== "out"));
  check("defaulted-to-current records are in the default view",
    v.view.some((q) => q.spec_status === "current"));
  check("out is reachable, not hidden", specFilter.values.indexOf("out") >= 0);

  // ------------------------------------------------------------------ MCQ
  const mcqRec = RECORDS.filter((r) => r.mcq_choices && r.spec_status !== "out")[0];
  v.goToId(mcqRec.id);
  check("MCQ: routed to the engine's mcq type with option buttons",
    v._curType === "mcq" && root.querySelectorAll(".ppq-option-mcq").length === mcqRec.mcq_choices.length);
  check("MCQ: option text is the option, not the whole question",
    root.querySelector(".ppq-option-mcq").textContent.indexOf(mcqRec.mcq_choices[0].slice(0, 20)) >= 0);
  check("MCQ: the parsed stem no longer carries its own options",
    !/(^|\s)B\.\s/.test(cfg.questionTextOf(mcqRec)));
  const beforeMcq = v.store.attempts.length;
  v.selectMCQ(mcqRec.mcq_key);
  const lastMcq = v.store.attempts[v.store.attempts.length - 1];
  check("MCQ: the right answer auto-marks as correct",
    v.store.attempts.length === beforeMcq + 1 && lastMcq.correct === true && lastMcq.id === mcqRec.id);
  /* And a wrong answer is not quietly accepted. */
  const mcqRec2 = RECORDS.filter((r) => r.mcq_choices && r.id !== mcqRec.id && r.spec_status !== "out")[0];
  v.goToId(mcqRec2.id);
  v.selectMCQ("ABCD".split("").filter((L) => L !== mcqRec2.mcq_key)[0]);
  check("MCQ: a wrong answer auto-marks as wrong",
    v.store.attempts[v.store.attempts.length - 1].correct === false);
  const mcqFallback = RECORDS.filter((r) => r.question_type === "multiple_choice" && !r.mcq_choices);
  /* Not pinned to a count, because the seat keeps repairing these and the
     rule is what protects a pupil. The source check stops the rule being
     deleted once the count reaches zero and the `every` goes vacuous. */
  check("MCQ: items whose options could not be parsed never present as multiple choice (" +
      mcqFallback.length + " such)",
    mcqFallback.every((r) => cfg.questionType(r) !== "mcq") &&
    /mcq_choices/.test(inlineScriptOf(ECON_HTML)));
  check("MCQ: and those items say why, rather than showing scrambled letters unexplained",
    mcqFallback.every((r) => (cfg.noticesOf(r) || []).some((n) => /options did not come through/i.test(n.text || ""))));

  // ----------------------------------------- marks that did not survive
  /* Checked before the marks bar is ever drawn, so a zero count here means
     this part drew nothing rather than that a previous question's bar was
     tidied away. (The engine leaves the previous bar in the hidden answer
     panel when you navigate off a marks question; invisible to a pupil, but
     it is why this block comes first.) */
  const noMarks = RECORDS.filter((r) => !r.marks_known && r.spec_status !== "out")[0];
  v.goToId(noMarks.id);
  check("a part with no printed marks does not draw a fake 0-1 bar",
    v._curType === "flashcard" && root.querySelectorAll(".ppq-mark-btn").length === 0);
  const beforeFc = v.store.attempts.length;
  v.reveal();
  check("it still reveals the markscheme", root.querySelector(".ppq-answer-panel").className.indexOf("show") >= 0);
  check("revealing it still draws no marks bar", root.querySelectorAll(".ppq-mark-btn").length === 0);
  check("and records no graded attempt", v.store.attempts.length === beforeFc);
  check("and says why there is no marks bar",
    (cfg.noticesOf(noMarks) || []).some((n) => /mark/i.test(n.label || "") && !!n.text));

  // ------------------------------------------------------------ marks bar
  /* Level bands need no new widget: an economics band awards marks out of N
     against descriptors, so the existing bar is the right one and the band
     descriptors are simply what markschemeOf returns. */
  const bandRec = RECORDS.filter((r) =>
    r.marks_known && r.marks === 15 && r.markscheme_text && r.spec_status !== "out")[0];
  v.goToId(bandRec.id);
  check("long-form parts route to marks-based self-assessment", v._curType === "marksSelfAssess");
  v.reveal();
  check("marks bar sizes to THIS part, not the whole question (0.." + bandRec.marks + ")",
    root.querySelectorAll(".ppq-mark-btn").length === bandRec.marks + 1 &&
    bandRec.marks !== bandRec.question_marks);
  check("marks bar names the part's maximum",
    /out of 15/.test(root.querySelector(".ppq-marksbar-prompt").textContent));
  check("the reveal shows the level-band descriptors",
    root.querySelector(".ppq-markscheme").innerHTML.length > 200);
  check("markscheme text is escaped before it reaches innerHTML",
    !/<(?!\/?(?:br|b|i|div)\b)/.test(cfg.markschemeOf(bandRec)));
  check("the band text does not open by repeating the question back",
    bandRec.band_text.toLowerCase().indexOf(bandRec.part_text.toLowerCase()) !== 0);
  /* 94 parts have almost no transcribed scheme — one of them is the single
     token "[2]". Presenting that as the marking bands would be the viewer
     claiming content it does not have. */
  const thin = RECORDS.filter((r) => r.band_thin);
  check("thin markschemes are named as thin, not passed off as the bands",
    thin.length > 50 && /too short to be the whole scheme/.test(cfg.markschemeOf(thin[0])));
  /* 10 of the thin bands have no crop and no page behind them, so the old
     form of this asserted the seat's completeness rather than the viewer's
     honesty. What the viewer owes is that it never promises a printed scheme
     it does not have. */
  const thinBare = thin.filter((r) => (r.ms_crops || []).length + (r.ms_pages || []).length === 0);
  check("a thin markscheme opens what printed scheme exists (" + (thin.length - thinBare.length) + " of " + thin.length + ")",
    thin.filter((r) => !thinBare.includes(r)).every((r) => cfg.msPagesOpenOf(r) === true &&
      /open below/.test(cfg.markschemeOf(r))));
  check("and where none was captured it says so rather than promising one (" + thinBare.length + ")",
    thinBare.every((r) => /no printed markscheme was captured/.test(cfg.markschemeOf(r))));
  check("a full markscheme keeps its mark allocations",
    RECORDS.some((r) => !r.band_thin && /\[\s*\d+\s*\]/.test(r.band_text)));
  const beforeBar = v.store.attempts.length;
  v._commitMarks(bandRec, { max: bandRec.marks, awarded: 9, sure: true });
  const barAttempt = v.store.attempts[v.store.attempts.length - 1];
  check("marks entry records the award against the part",
    v.store.attempts.length === beforeBar + 1 &&
    barAttempt.marks_awarded === 9 && barAttempt.marks_max === bandRec.marks &&
    barAttempt.correct === false && barAttempt.part_label === bandRec.part_label);

  // --------------------------------------------------- part navigation
  const p2 = RAW.filter((q) => q.paper === "2" && (q.parts || []).length >= 5 &&
    (q.spec_status || "current") !== "out")[0];
  const p2Parts = RECORDS.filter((r) => r.block_id === p2.id);
  check("a multi-part Paper 2 question exists to walk (" + p2.id + ", " +
    p2Parts.length + " parts)", p2Parts.length === p2.parts.length && p2Parts.length >= 5);
  v.goToId(p2Parts[0].id);
  check("part chips: one per part", root.querySelectorAll(".ppq-part-chip").length === p2Parts.length);
  check("part chips read the printed label, not a slug",
    root.querySelector(".ppq-part-chip").textContent.indexOf(p2Parts[0].part_label) >= 0);
  check("part chips carry each part's own marks",
    root.querySelectorAll(".ppq-part-chip-marks").length === p2Parts.filter((r) => r.marks_known).length);
  check("whole-question assembly and mode toggle",
    !!root.querySelector(".ppq-whole") && !!root.querySelector(".ppq-wq-part") &&
    root.querySelectorAll(".ppq-mode-btn").length === 2);
  const last = p2Parts[p2Parts.length - 1];
  v.goToId(last.id);
  check("walking to the last part keeps the navigator and moves the marker",
    root.querySelectorAll(".ppq-part-chip").length === p2Parts.length &&
    root.querySelector(".ppq-part-chip.current").textContent.indexOf(last.part_label) >= 0);
  check("the shared extract is shown on every part of the question",
    (cfg.stemPagesOf(last) || []).length > 0 &&
    cfg.stemPagesOf(last).join("|") === cfg.stemPagesOf(p2Parts[0]).join("|"));
  check("the card's meta line names the part and its marks",
    /Q\d+\s*\(?[a-z]/i.test(cfg.metaLine(last)) && /marks/.test(cfg.metaLine(last)));
  /* 738 of the 1,021 records predate the current paper structure, so the
     meta line must not describe a 2004 multiple-choice Paper 1 in the words
     of the 2022 extended-response one. */
  check("the meta line says multiple choice on the 2004 Paper 1, and claims no other paper structure",
    /Paper 1 \(multiple choice\)/.test(cfg.metaLine(mcqRec)) &&
    /· Paper 2 ·/.test(cfg.metaLine(last)));
  check("a 1-mark part reads '1 mark', not '1 marks'", / 1 mark ·| 1 mark$/.test(cfg.metaLine(mcqRec)));
  /* The record's marks field is the sum of its parts, so where a part's marks
     were lost the total is short by that part and is not the printed one. */
  const shortTotal = RECORDS.filter((r) => r.is_part && !r.question_marks_complete);
  check("the whole-question total is not claimed where a part's marks were lost (" + shortTotal.length + ")",
    shortTotal.every((r) => !/for the whole question/.test(cfg.metaLine(r))));
  check("and it is claimed where they all survived",
    /of \d+ for the whole question/.test(
      cfg.metaLine(RECORDS.filter((r) => r.is_part && r.question_marks_complete)[0])));

  // ------------------------------------------------------- examiner panel
  const exRec = RECORDS.filter((r) => r.examiner_comment && r.paper_report &&
    r.marks_known && r.spec_status !== "out")[0];
  v.goToId(exRec.id);
  v.reveal();
  const exHtml = root.querySelector(".ppq-examiner-body").innerHTML;
  check("examiner panel shows this part's own commentary",
    exHtml.indexOf(exRec.examiner_comment.slice(0, 40).replace(/&/g, "&amp;")) >= 0);
  check("the paper's subject report sits behind it, closed",
    /<details[^>]*class="ib-ex-paper"/.test(exHtml) && !/<details[^>]*\sopen/.test(exHtml));
  check("the panel is shown by default, not behind a control",
    root.querySelector(".ppq-answer-panel").className.indexOf("has-examiner") >= 0);
  /* The paper_reports shape is one level deeper than maths': keyed by preview,
     then by section. Reading it maths-style yields undefined everywhere. */
  check("paper report is read through its section key, not off the top level",
    /In general:|Found difficult:|Well prepared:/.test(exHtml));
  /* The engine leaves the previous question's commentary in the DOM and hides
     it with the panel's has-examiner class. A question with nothing to say
     must therefore not acquire that class, or one question's examiner report
     is shown against another's. */
  const noEx = RECORDS.filter((r) => !cfg.examinerOf(r) && r.marks_known && r.spec_status !== "out")[0];
  v.goToId(noEx.id);
  v.reveal();
  check("a question with no examiner report does not inherit the last one's",
    root.querySelector(".ppq-answer-panel").className.indexOf("has-examiner") < 0);

  // ------------------------------------------------ marking-era honesty
  const oldRec = RECORDS.filter((r) => r.marking_differs === "yes" && r.marking_note &&
    r.marks_known && r.spec_status !== "out")[0];
  check("an old question warns that its markbands were the old ones",
    !!cfg.markschemeNoteOf(oldRec) && cfg.markschemeNoteOf(oldRec) === oldRec.marking_note);
  check("a current-era question carries no such note",
    RECORDS.filter((r) => r.marking_differs === "no").every((r) => !cfg.markschemeNoteOf(r)));

  // ------------------------------------------------------------- notices
  /* The engine drops any notice without `text`, so a label-only notice is a
     silent no-op rather than the warning it looks like in the source. */
  let notices = 0, textless = 0;
  RECORDS.forEach((r) => (cfg.noticesOf(r) || []).forEach((n) => { notices++; if (!n.text) textless++; }));
  check("every notice carries text the engine will actually render",
    notices > 0 && textless === 0);
  check("off-syllabus questions say so, and say why they are still here",
    (cfg.noticesOf(RECORDS.filter((r) => r.spec_status === "out")[0]) || [])
      .some((n) => n.tone === "warn" && /syllabus/i.test(n.label || "")));
  const redacted = RECORDS.filter((r) => r.part_redacted || r.stem_redacted);
  check("copyright-redacted questions admit the gap rather than showing a blank",
    redacted.length > 0 &&
    (cfg.noticesOf(redacted[0]) || []).some((n) => /copyright/i.test(n.text || "")));
  const emptyText = RECORDS.filter((r) => !r.part_text);
  check("a part with no surviving text says so instead of rendering nothing",
    emptyText.length > 0 && emptyText.every((r) => /printed page above/.test(cfg.questionTextOf(r))));

  // ---------------------------------------------------------- progress axes
  const axisKeys = cfg.progressAxes.map((a) => a.key);
  ["unit", "paper", "level", "year", "qtype", "ao", "spec"].forEach((k) => {
    check("progress axis present: " + k, axisKeys.indexOf(k) >= 0);
  });
  check("progress axes label their values rather than emitting codes",
    cfg.progressAxes.filter((a) => a.key === "unit")[0].labelOf("3").indexOf("Macroeconomics") >= 0 &&
    cfg.progressAxes.filter((a) => a.key === "qtype")[0].labelOf("essay_b_evaluate").indexOf("_") < 0);

  // ---------------------------------------------------------------- filters
  /* 8 configured filters: 7 single-selects, plus the syllabus multi-select,
     plus the engine's own order control. */
  check("filters rendered: 7 single-selects + order, and one multi-select",
    cfg.filters.length === 8 &&
    root.querySelectorAll(".ppq-select").length === 8 &&
    root.querySelectorAll(".ppq-order").length === 1 &&
    root.querySelectorAll(".ppq-multifilter").length === 1);
  const unitSel = root.querySelector('.ppq-select[data-fidx="3"]');
  check("the unit control offers names",
    Array.prototype.some.call(unitSel.options, (o) => /Microeconomics/.test(o.textContent)));
  const itemSel = root.querySelector('.ppq-select[data-fidx="4"]');
  check("the syllabus-content control is hidden until a unit is chosen",
    itemSel.style.display === "none" && itemSel.disabled === true);
  unitSel.value = "3";
  unitSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  check("unit filter narrows the deck",
    v.view.length > 0 && v.view.every((q) => q.unit_code === "3"));
  /* The one that matters: what a pupil actually reads in the control. A bare
     "3.4.3.a.i" in this list is the failure the catalogue contract's
     code_names map exists to prevent. */
  const itemOpts = Array.prototype.slice.call(itemSel.options).slice(1);
  check("choosing a unit reveals its syllabus content, named (" + itemOpts.length + " items)",
    itemSel.style.display !== "none" && itemOpts.length > 50 &&
    itemOpts.every((o) => !/^\s*\d+(?:\.\w+)+\s*$/.test(o.textContent)) &&
    itemOpts.every((o) => o.textContent.length > o.value.length + 3));
  itemSel.value = itemOpts[0].value;
  itemSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  check("and filtering on one of them narrows the deck to it",
    v.view.length > 0 && v.view.every((q) => (q.syllabus_items || []).indexOf(itemOpts[0].value) >= 0));
  itemSel.value = "ALL";
  itemSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  unitSel.value = "ALL";
  unitSel.dispatchEvent(new window.Event("change", { bubbles: true }));
  check("weak-area chips name the content, never a bare code",
    (cfg.selfAssess.weakAreasOf(bandRec) || []).every((a) => /\(\d/.test(a.label) && a.label.length > 20));

} catch (e) { fail++; console.log("  FAIL threw: " + e.stack); }
console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
