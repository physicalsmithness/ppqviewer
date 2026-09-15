/* Match original MCQ metadata for already-retained A1/C1 records. This is an
   answer projection, not syllabus/test/crop clearance or visual proofreading. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const {parseCsv} = require("./physics-test-exclusions");
const ROOT = path.resolve(__dirname, ".."), DEFAULT_DB = "C:/CodexProjects/PaperDatabases";
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const same = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
function inside(root, file) {
  const full = path.resolve(root, file), relative = path.relative(root, full);
  ensure(relative && !relative.startsWith("..") && !path.isAbsolute(relative), "Source path is outside its root");
  return full;
}
function buildMetadata(questionRecords, options = {}) {
  ensure(Array.isArray(questionRecords), "MCQ records must be an array");
  const db = path.resolve(options.paperdbRoot || process.env.PHYSICS_PAPERDB_ROOT || DEFAULT_DB);
  const files = new Map(), cache = new Map();
  function read(file) {
    file = path.resolve(file);
    if (!cache.has(file)) {
      const bytes = fs.readFileSync(file);
      cache.set(file, bytes); files.set(file, {path: file, sha256: sha(bytes)});
    }
    return cache.get(file);
  }
  const json = file => JSON.parse(read(file).toString("utf8").replace(/^\uFEFF/, ""));
  const nativePath = inside(db, "Physics Categorisation/viewer/ibphysics_catalogue.js");
  const csvPath = inside(db, "outputs/exports/ib_physics_archive_flat_v5.csv");
  const box = {window: {}};
  vm.runInNewContext(read(nativePath).toString("utf8"), box, {timeout: 20000});
  const native = new Map(), rows = new Map();
  function add(map, id, value) {
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(value);
  }
  for (const parent of box.window.IBPHYS_QUESTIONS || []) for (const part of parent.parts || []) add(native, part.source_part_id, {parent, part});
  for (const row of parseCsv(read(csvPath).toString("utf8"))) add(rows, row.part_id, row);
  const parts = {}, findings = [], seen = new Set();
  let considered = 0, nonMcq = 0, outsideTopics = 0;
  for (const record of questionRecords) {
    if (!(record.topic_codes || []).some(code => ["A.1", "C.1"].includes(code))) { outsideTopics++; continue; }
    const sources = native.get(record.source_part_id) || [];
    if (!/^(1|1A)$/.test(String(record.paper)) && !sources.some(s => s.part.self_mark === "mcq")) { nonMcq++; continue; }
    considered++;
    try {
      const id = record.source_part_id;
      ensure(/^ibchem_part_[a-f0-9]+$/.test(id || "") && !seen.has(id), "Missing or duplicate input source identity");
      seen.add(id);
      ensure(sources.length === 1 && (rows.get(id) || []).length === 1, "Source part is absent or ambiguous in the native catalogue/archive");
      const {parent, part} = sources[0], row = rows.get(id)[0], key = part.correct_answer;
      ensure(record.parent_id === parent.id && record.id === part.part_id, "Consumer and native parent/part identities differ");
      ensure(parent.parts.length === 1 && String(part.label) === row.question, "MCQ native question is not one complete numbered part");
      ensure(row.preview === parent.preview && row.question === String(parent.question) && row.question === String(record.question_number), "Question number or preview identity differs");
      ensure(/^(1|1A)$/.test(row.paper), "Source is not a multiple-choice paper");
      ensure(/^\d{4}$/.test(row.year) && Number(row.year) >= 2004 && Number(row.year) < 2026, "Source year is outside the permitted range");
      for (const field of ["year", "paper", "level"]) ensure(row[field] === String(parent[field]) && row[field] === String(record[field]), "Consumer/native/archive " + field + " differs");
      ensure(row.session === parent.session && row.time_zone === parent.time_zone, "Native session/time zone differs from archive");
      ensure(Number(record.marks) === 1 && Number(part.marks) === 1 && Number(row.marks) === 1, "MCQ must have exactly one mark");
      ensure(/^[ABCD]$/.test(key || "") && part.self_mark === "mcq" && part.answer_status === "source_key" && part.answer === key, "Native key is missing, ambiguous or conflicting");
      ensure(row.ms_text.trim() === "Answer: " + key && part.markscheme_text.trim() === "Answer: " + key, "Native and archive keys conflict");
      const preview = inside(db, "outputs/previews/" + row.preview);
      const qpPath = inside(preview, "question_preview.json"), msPath = inside(preview, "mark_scheme_preview.json");
      const qp = json(qpPath), ms = json(msPath);
      const original = [];
      for (const [metadata, relative, kind] of [[qp, row.question_source, "question_paper"], [ms, row.mark_scheme_source, "mark_scheme"]]) {
        ensure(metadata.source && metadata.source.relative_path === relative && metadata.source.document_type === kind && metadata.source.subject === "Physics", "Original preview document identity differs");
        for (const [field, csvField] of [["year","year"],["series","session"],["level","level"],["time_zone","time_zone"],["paper","paper"]]) ensure(String(metadata.source[field]) === row[csvField], "Original preview " + field + " differs");
        ensure(typeof relative === "string" && /\.pdf$/i.test(relative), "Original source is not a PDF");
        const file = inside(db, relative), bytes = read(file);
        ensure(bytes.subarray(0, 5).toString() === "%PDF-", "Original PDF header is missing");
        original.push({path: file, sha256: sha(bytes)});
      }
      ensure(original[0].path !== original[1].path, "Question and markscheme point at the same original PDF");
      const groups = (qp.question_groups || []).filter(g => String(g.question_number) === row.question);
      ensure(groups.length === 1, "Original question entry is absent or ambiguous");
      const questionParts = (groups[0].parts || []).filter(p => String(p.part_label) === row.question);
      ensure(questionParts.length === 1 && Number(questionParts[0].marks) === 1, "Original numbered MCQ part is absent or ambiguous");
      const entries = (ms.entries || []).filter(e => String(e.question_number) === row.question);
      ensure(entries.length === 1, "Original answer entry is absent or ambiguous");
      const entry = entries[0];
      ensure(String(entry.part_label) === row.question && Number(entry.marks) === 1 && entry.answer_text === "Answer: " + key && entry.text === "Answer: " + key, "Original answer entry conflicts with the native key");
      ensure(Array.isArray(entry.source_lines) && entry.source_lines.length === 2 &&
        String(entry.source_lines[0]).trim().replace(/\.$/, "") === row.question && entry.source_lines[1] === key,
        "Original source lines do not uniquely pair this question number and key");
      ensure(Number.isInteger(entry.page_start) && entry.page_start > 0 && entry.page_end === entry.page_start, "Original key page is missing or ambiguous");
      const cropPaths = (relativePaths, names, consumerPaths, originalPaths, description) => {
        ensure(Array.isArray(consumerPaths) && consumerPaths.length && relativePaths.length && same(relativePaths, originalPaths || []), description + " crop metadata differs");
        const paths = relativePaths.map(relative => {
          ensure(/^crops\/(question|mark)_.*\.png$/.test(relative), description + " is not a bounded crop path");
          return inside(preview, relative);
        });
        ensure(new Set(paths).size === paths.length && same(paths, consumerPaths.map(p => path.resolve(p))) && same(paths.map(p => path.basename(p)), names || []), description + " consumer/native crop assignment differs");
        return paths.map(file => ({path: file, sha256: sha(read(file))}));
      };
      const questionCrops = cropPaths(row.question_crop_paths.split("|").filter(Boolean), part.crops, record.question_images, questionParts[0].crop_image_paths, "Question");
      const schemeCrops = cropPaths(row.ms_crop_paths.split("|").filter(Boolean), part.ms_crops, record.markscheme_images, entry.crop_image_paths, "Markscheme");
      const contextCrops = [];
      for (const file of record.context_images || []) {
        const full = path.resolve(file), name = path.basename(full);
        ensure(full === path.join(preview, "crops", name) && (parent.crops || []).includes(name) &&
          (groups[0].crop_image_paths || []).includes("crops/" + name), "Context crop identity differs");
        contextCrops.push({path: full, sha256: sha(read(full))});
      }
      parts[id] = {correct_option: key, answer_status: "matched_source_key", evidence: {
        method: "Native key, flat archive answer and unique original markscheme entry/source lines agree; no visual-review claim.",
        source_part_id: id, part_id: record.id, parent_id: record.parent_id, preview: row.preview,
        question_source: original[0], markscheme_source: original[1],
        question_metadata: files.get(qpPath), markscheme_metadata: files.get(msPath),
        question_crops: questionCrops, markscheme_crops: schemeCrops, context_crops: contextCrops,
        scheme_page: entry.page_start, source_lines: [...entry.source_lines], visual_review: false
      }};
    } catch (error) {
      delete parts[record.source_part_id];
      findings.push({source_part_id: record.source_part_id, part_id: record.id, reason: error.message, fallback: "manual_self_mark"});
    }
  }
  return {schema_version: 1, course: "ib", topics: ["A.1", "C.1"], parts, report: {
    builder: {path: __filename, sha256: sha(fs.readFileSync(__filename))},
    source_files: [...files.values()].sort((a,b) => a.path.localeCompare(b.path)),
    considered_count: considered, matched_count: Object.keys(parts).length, non_mcq_count: nonMcq,
    outside_topic_count: outsideTopics, findings,
    policy: "Only project public correct_option and answer_status onto the same already-cleared source part. Preserve all eligibility, assessment, crop and freshness gates. Keep this evidence private. Unmatched records retain manual marking."
  }};
}
module.exports = {buildMetadata};
