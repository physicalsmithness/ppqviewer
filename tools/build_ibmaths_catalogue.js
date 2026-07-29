/* Build the IB Maths catalogue for the shared ppqviewer engine.

   Joins, read-only:
   - PaperDatabases\outputs\exports\ib_maths_aahl_flat.csv   (extraction: text, crops, markschemes, examiner comments)
   - Maths Categorisation\masters\questions.csv               (QA'd question rows: types, themes, skill demand, totals)
   - Maths Categorisation\masters\tags.csv                    (multi-tags: syllabus_ref, command_term, question_type, theme, family)
   - Maths Categorisation\syllabus_spine.csv                  (AA HL spine: code, topic_part, content)

   Emits example\ibmaths\ibmaths_catalogue.js:
   - window.IBMATHS_QUESTIONS : one row per canonical part (the practising unit)
   - window.IBMATHS_META      : topics, papers, sessions, years, spine (for d011 learned scope)

   Crop paths are emitted RELATIVE to PaperDatabases\outputs\ ("previews/<slug>/crops/x.png");
   the wrapper supplies the base (file:/// locally; copied assets when deployed).

   Untagged parts still ship (topic "UT"); the engine's untagged-last rule handles them.
   Claude (viewer maintainer), 2026-07-29. */
"use strict";
const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PAPERDB = process.env.IBMATHS_PAPERDB_ROOT ||
  "C:\\CodexProjects\\PaperDatabases";
const CATEG = process.env.IBMATHS_CATEG_ROOT ||
  path.join(PAPERDB, "Maths Categorisation");
const OUT = process.env.IBMATHS_CATALOGUE_OUT ||
  path.join(PROJECT_ROOT, "example", "ibmaths", "ibmaths_catalogue.js");

const FLAT = path.join(PAPERDB, "outputs", "exports", "ib_maths_aahl_flat.csv");
const MASTER_Q = path.join(CATEG, "masters", "questions.csv");
const MASTER_T = path.join(CATEG, "masters", "tags.csv");
const SPINE = path.join(CATEG, "syllabus_spine.csv");

const TOPIC_NAMES = {
  1: "Number and algebra",
  2: "Functions",
  3: "Geometry and trigonometry",
  4: "Statistics and probability",
  5: "Calculus"
};
const MS_UNUSABLE = /could not be separated reliably/i;

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field.replace(/\r$/, "")); field = ""; rows.push(row); row = []; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows;
}
function indexed(rows) {
  const header = rows[0].map((h) => h.replace(/^\uFEFF/, "").trim());
  const idx = {};
  header.forEach((h, i) => { idx[h] = i; });
  return { idx, rows: rows.slice(1).filter((r) => r.length > 1) };
}
function splitList(v) {
  return String(v || "").split(";").map((s) => s.trim()).filter(Boolean);
}
function topicOfCode(code) {
  const m = String(code || "").match(/^(?:SL|AHL)(\d)/i);
  return m ? parseInt(m[1], 10) : null;
}

// ---- load ------------------------------------------------------------------
const flat = indexed(parseCSV(fs.readFileSync(FLAT, "utf8")));
const masterQ = indexed(parseCSV(fs.readFileSync(MASTER_Q, "utf8")));
const masterT = indexed(parseCSV(fs.readFileSync(MASTER_T, "utf8")));
const spine = indexed(parseCSV(fs.readFileSync(SPINE, "utf8")));

// spine lookup: full code -> { topic_part, content }; also the emitted tree rows
const spineByCode = {};
const spineRows = spine.rows.map((r) => {
  const code = r[spine.idx.code];
  const row = {
    code: code,
    topic_part: r[spine.idx.topic_part],
    content: String(r[spine.idx.content] || "").trim()
  };
  spineByCode[code] = row;
  return row;
});

// masters questions: key preview|question
const qMeta = {};
masterQ.rows.forEach((r) => {
  const key = r[masterQ.idx.preview] + "|" + r[masterQ.idx.question];
  qMeta[key] = {
    total_marks: parseInt(r[masterQ.idx.total_marks], 10) || null,
    question_types: splitList(r[masterQ.idx.question_types]),
    themes: splitList(r[masterQ.idx.themes]),
    skill_demand: r[masterQ.idx.skill_demand] || "",
    aa_applicable: r[masterQ.idx.aa_applicable] || "",
    paper_code: r[masterQ.idx.paper_code] || "",
    review_status: r[masterQ.idx.review_status] || ""
  };
});

// tags: part-level by part_id; question-level by preview|question
const tagsByPart = {};
const tagsByQuestion = {};
masterT.rows.forEach((r) => {
  const type = r[masterT.idx.tag_type];
  const value = r[masterT.idx.tag_value];
  if (!type || !value) return;
  const partId = r[masterT.idx.part_id];
  const bucketKey = partId || (r[masterT.idx.preview] + "|" + r[masterT.idx.question]);
  const store = partId ? tagsByPart : tagsByQuestion;
  const b = store[bucketKey] = store[bucketKey] || {};
  (b[type] = b[type] || []).push(value);
});

// ---- build part rows -------------------------------------------------------
const F = flat.idx;
const questions = [];
const report = {
  parts: 0, skipped_non_canonical: 0, with_crop: 0, ms_text_usable: 0,
  ms_crops: 0, ms_neither: 0, examiner: 0, tagged: 0, untagged: 0
};
const yearsSet = {}, papersSet = {}, sessionsSet = {};

flat.rows.forEach((r) => {
  if (String(r[F.is_canonical]) !== "1") { report.skipped_non_canonical++; return; }
  const preview = r[F.preview];
  const qNum = parseInt(r[F.question], 10);
  const partLabel = String(r[F.part_label] || "").trim();
  const partId = r[F.part_id];
  const qKey = preview + "|" + qNum;
  const meta = qMeta[qKey] || {};

  // tags: this part's own tags plus the question-level tags
  const own = tagsByPart[partId] || {};
  const qLevel = tagsByQuestion[qKey] || {};
  const refs = (own.syllabus_ref || []).concat(qLevel.syllabus_ref || [])
    .filter((v, i, a) => a.indexOf(v) === i);
  const commandTerms = (own.command_term || []).concat(qLevel.command_term || [])
    .filter((v, i, a) => a.indexOf(v) === i);
  const families = (qLevel.family || []).concat(own.family || [])
    .filter((v, i, a) => a.indexOf(v) === i);

  // primary topic: modal topic number across syllabus refs; tie -> lowest
  const counts = {};
  refs.forEach((code) => {
    const t = topicOfCode(code);
    if (t) counts[t] = (counts[t] || 0) + 1;
  });
  let topicNum = null, best = -1;
  Object.keys(counts).map(Number).sort((a, b) => a - b).forEach((t) => {
    if (counts[t] > best) { best = counts[t]; topicNum = t; }
  });

  // subtopics at topic_part granularity (dashboard facet), refs kept in full (d011)
  const subtopics = refs.map((code) => (spineByCode[code] || {}).topic_part ||
    String(code).replace(/^((?:SL|AHL)\d+\.\d+).*$/, "$1"))
    .filter((v, i, a) => v && a.indexOf(v) === i);

  const msTextRaw = String(r[F.ms_text] || "").trim();
  const msUsable = msTextRaw && !MS_UNUSABLE.test(msTextRaw);
  const msCrops = splitList(r[F.ms_crop_paths]).concat(splitList(r[F.ms_answer_crop_paths]))
    .map((p) => "previews/" + preview + "/" + p);
  const crops = splitList(r[F.question_crop_paths]).map((p) => "previews/" + preview + "/" + p);
  const pageRenders = splitList(r[F.page_render_paths]).map((p) => "previews/" + preview + "/" + p);
  const examiner = String(r[F.examiner_report_part_comment] || r[F.examiner_report_question_comment] || "").trim();

  if (crops.length) report.with_crop++;
  if (msUsable) report.ms_text_usable++;
  if (msCrops.length) report.ms_crops++;
  if (!msUsable && !msCrops.length) report.ms_neither++;
  if (examiner) report.examiner++;
  if (refs.length) report.tagged++; else report.untagged++;

  const year = parseInt(r[F.year], 10);
  const paper = parseInt(r[F.paper], 10);
  const session = r[F.session];
  yearsSet[year] = 1; papersSet[paper] = 1; sessionsSet[session] = 1;

  questions.push({
    id: preview + "|Q" + qNum + "|" + (partLabel || "all"),
    part_id: partId,
    preview: preview,
    paper_code: meta.paper_code || "",
    year: year,
    session: session,
    time_zone: r[F.time_zone] || "",
    paper: paper,
    question: qNum,
    part_label: partLabel,
    marks: parseInt(r[F.marks], 10) || 0,
    total_marks: meta.total_marks,
    question_text: String(r[F.question_text] || "").trim().slice(0, 400),
    crops: crops,
    page_url: pageRenders[0] || null,
    ms_text: msUsable ? msTextRaw : "",
    ms_crops: msCrops,
    answer_url: msCrops[0] || null,
    examiner_report: examiner,
    topic_num: topicNum,
    topic_code: topicNum ? ("T" + topicNum) : null,
    topic: topicNum ? TOPIC_NAMES[topicNum] : null,
    syllabus_refs: refs,
    subtopics: subtopics,
    command_terms: commandTerms,
    families: families,
    question_types: meta.question_types || [],
    themes: meta.themes || [],
    skill_demand: meta.skill_demand || "",
    review_status: meta.review_status || ""
  });
  report.parts++;
});

// stable order: year, session, paper, question, part
questions.sort((a, b) =>
  a.year - b.year ||
  String(a.session).localeCompare(String(b.session)) ||
  a.paper - b.paper ||
  a.question - b.question ||
  String(a.part_label).localeCompare(String(b.part_label), undefined, { numeric: true }));

const meta = {
  built_at: new Date().toISOString(),
  source: "PaperDatabases ib_maths_aahl_flat + Maths Categorisation masters",
  count: questions.length,
  topics: Object.keys(TOPIC_NAMES).map((n) => ({ code: "T" + n, name: TOPIC_NAMES[n] })),
  papers: Object.keys(papersSet).map(Number).sort(),
  sessions: Object.keys(sessionsSet).sort(),
  years: Object.keys(yearsSet).map(Number).sort(),
  spine: spineRows
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT,
  "/* GENERATED by tools/build_ibmaths_catalogue.js — do not hand-edit.\n" +
  "   Rebuild after masters or extraction changes. Built " + meta.built_at + " */\n" +
  "window.IBMATHS_META = " + JSON.stringify(meta) + ";\n" +
  "window.IBMATHS_QUESTIONS = " + JSON.stringify(questions) + ";\n",
  "utf8");

console.log("ibmaths catalogue built: " + OUT);
console.log(JSON.stringify(report, null, 1));
console.log("questions (parts): " + questions.length +
  " | papers: " + meta.papers.join(",") +
  " | years: " + meta.years[0] + "-" + meta.years[meta.years.length - 1] +
  " | spine rows: " + spineRows.length);
const untaggedPct = Math.round(100 * report.untagged / (report.parts || 1));
console.log("tagged parts: " + report.tagged + " (" + (100 - untaggedPct) + "%), untagged: " + report.untagged);
