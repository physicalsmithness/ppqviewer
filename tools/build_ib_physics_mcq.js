/* Project visually reviewed printed MCQ keys. This provides answer metadata,
   never eligibility: callers must retain every existing source/test/crop gate. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const { parseCsv } = require("./physics-test-exclusions");
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_PAPERDB = process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases";
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = file => JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
function ensure(ok, reason) { if (!ok) throw new Error(reason); }
function inside(root, relative) {
  const file = path.resolve(root, relative), rel = path.relative(root, file);
  ensure(rel && !rel.startsWith("..") && !path.isAbsolute(rel), "MCQ source path escapes its root");
  return file;
}

function build(options = {}) {
  const paperdb = path.resolve(options.paperdbRoot || DEFAULT_PAPERDB);
  const reviewPath = options.reviewPath || path.join(ROOT, "reports/ib-physics-reviewed-mcq.json");
  const review = readJson(reviewPath);
  ensure(review.schema_version === 1 && review.course === "ib" && review.parts, "MCQ review schema missing");
  const correctionReviews = review.presentation_corrections || {};
  const hasReview = id => review.parts[id] || correctionReviews[id];
  const nativePath = inside(paperdb, "Physics Categorisation/viewer/ibphysics_catalogue.js");
  const csvPath = inside(paperdb, "outputs/exports/ib_physics_archive_flat_v5.csv");
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(nativePath, "utf8"), box, { timeout: 20000 });
  const native = new Map();
  for (const question of box.window.IBPHYS_QUESTIONS || []) for (const part of question.parts || []) {
    if (!hasReview(part.source_part_id)) continue;
    ensure(!native.has(part.source_part_id), "Duplicate native reviewed MCQ identity");
    native.set(part.source_part_id, { question, part });
  }
  const columns = ["part_id", "preview", "year", "session", "level", "time_zone", "paper", "question", "ms_text", "question_source", "mark_scheme_source", "question_crop_paths", "ms_crop_paths"];
  const rows = new Map();
  for (const row of parseCsv(fs.readFileSync(csvPath, "utf8"), columns)) {
    if (!hasReview(row.part_id)) continue;
    ensure(!rows.has(row.part_id), "Duplicate reviewed MCQ CSV identity");
    rows.set(row.part_id, row);
  }
  const files = new Map();
  function record(file, expected) {
    const bytes = fs.readFileSync(file), digest = sha(bytes);
    if (expected) ensure(digest === expected, "Reviewed MCQ source changed: " + file);
    files.set(file, { path: file, sha256: digest });
    return digest;
  }
  function reviewedFile(item) {
    ensure(item && /^[a-f0-9]{64}$/.test(item.sha256), "Reviewed MCQ fingerprint missing");
    const file = inside(paperdb, item.path);
    record(file, item.sha256);
    return file;
  }
  const parts = {};
  for (const [sourceId, reviewed] of Object.entries(review.parts)) {
    ensure(/^ibchem_part_[a-f0-9]+$/.test(sourceId), "Unexpected reviewed source identity");
    const row = rows.get(sourceId), source = native.get(sourceId);
    ensure(row && source, "Reviewed MCQ is missing from source catalogue/archive: " + sourceId);
    const { question, part } = source;
    const correct = reviewed.correct_option;
    ensure(/^[ABCD]$/.test(correct), "Reviewed MCQ key is not a single printed A-D option");
    ensure(/^(1|1A)$/.test(row.paper) && row.paper === String(question.paper), "Reviewed key is not an MCQ paper");
    ensure(/^\d{4}$/.test(row.year) && Number(row.year) < 2026 && Number(row.year) >= 2004 && String(question.year) === row.year, "Reviewed key source violates the year embargo");
    ensure(Number(part.marks) === 1, "Reviewed MCQ has unexpected marks");
    for (const [field, reviewedField] of [["year", "year"], ["session", "session"], ["level", "level"], ["time_zone", "time_zone"], ["paper", "paper"], ["question", "question_number"], ["preview", "preview"]]) {
      ensure(String(row[field]) === String(reviewed[reviewedField]), "Reviewed MCQ source identity changed: " + field);
    }
    ensure(question.preview === reviewed.preview && String(question.question) === reviewed.question_number, "Native MCQ parent identity mismatch");
    ensure(part.answer_status === "source_key" && part.self_mark === "mcq" && part.correct_answer === correct && part.answer === correct, "Native MCQ key missing, ambiguous or conflicting");
    ensure(row.ms_text.trim() === "Answer: " + correct, "Archive MCQ key conflicts with reviewed printed key");
    ensure(reviewed.visual_review && reviewed.visual_review.question_options_complete === true && reviewed.visual_review.printed_scheme_verified === true, "Printed MCQ options/scheme have not been reviewed");
    ensure(row.question_source === reviewed.question_source.path && row.mark_scheme_source === reviewed.markscheme_source.path, "Reviewed original PDF identity changed");
    reviewedFile(reviewed.question_source);
    reviewedFile(reviewed.markscheme_source);
    const qp = readJson(reviewedFile(reviewed.question_metadata));
    const ms = readJson(reviewedFile(reviewed.markscheme_metadata));
    ensure(qp.source.relative_path === row.question_source && ms.source.relative_path === row.mark_scheme_source, "Original preview document identity mismatch");
    for (const metadata of [qp.source, ms.source]) {
      ensure(String(metadata.year) === row.year && metadata.series === row.session && metadata.level === row.level && metadata.time_zone === row.time_zone && String(metadata.paper) === row.paper, "Original preview paper/year/tier identity mismatch");
    }
    const entries = ms.entries.filter(entry => String(entry.question_number) === row.question);
    ensure(entries.length === 1, "MCQ answer entry is not unique");
    const entry = entries[0];
    ensure(entry.answer_text === "Answer: " + correct && entry.text === "Answer: " + correct, "Original MCQ entry key conflicts");
    ensure(JSON.stringify(entry.source_lines) === JSON.stringify(reviewed.markscheme_entry.source_lines) && entry.source_lines.includes(correct), "Original MCQ printed answer lines changed");
    ensure(entry.page_start === reviewed.markscheme_entry.page_start && entry.page_end === reviewed.markscheme_entry.page_end, "Original MCQ scheme page changed");
    const previewRelative = "outputs/previews/" + row.preview + "/";
    const questionCrops = row.question_crop_paths.split("|").filter(Boolean).map(file => previewRelative + file);
    const msCrops = entry.crop_image_paths.map(file => previewRelative + file);
    ensure(JSON.stringify(questionCrops) === JSON.stringify(reviewed.question_crops.map(file => file.path)), "Reviewed question crop set changed");
    ensure(JSON.stringify(msCrops) === JSON.stringify(reviewed.markscheme_crops.map(file => file.path)), "Reviewed scheme crop set changed");
    [...reviewed.question_crops, ...reviewed.markscheme_crops].forEach(reviewedFile);
    parts[sourceId] = {
      correct_option: correct, answer_status: "reviewed_source_key",
      source_label: [row.session, row.year, row.time_zone, row.level, "Paper " + row.paper, "Q" + row.question].join(" · "),
      question_source_sha256: reviewed.question_source.sha256,
      markscheme_source_sha256: reviewed.markscheme_source.sha256,
      evidence: {
        method: "Printed question and scheme crops visually verified; native key, full archive row and original scheme entry agree.",
        question_crops: reviewed.question_crops, markscheme_crops: reviewed.markscheme_crops,
        scheme_page: entry.page_start, printed_lines: entry.source_lines,
        visual_review: reviewed.visual_review
      }
    };
  }
  const presentationCorrections = {};
  for (const [sourceId, correction] of Object.entries(correctionReviews)) {
    const row = rows.get(sourceId), source = native.get(sourceId);
    ensure(row && source && correction.source_part_id === sourceId, "Presentation correction source is missing");
    ensure(source.part.part_id === correction.part_id && source.question.preview === correction.preview && row.preview === correction.preview, "Presentation correction identity changed");
    ensure(/^\d{4}$/.test(row.year) && Number(row.year) < 2026 && Number(row.year) >= 2004, "Presentation correction source violates year embargo");
    const context = correction.context_only_crop;
    ensure(context && path.basename(context.path) === context.filename && (source.part.crops || []).includes(context.filename), "Context-only crop is no longer a focused source crop");
    ensure((source.part.crops || []).includes(path.basename(correction.current_prompt_crop.path)), "Complete current prompt crop is missing");
    [correction.question_metadata, correction.current_prompt_crop, context, correction.whole_question_evidence_crop].forEach(reviewedFile);
    presentationCorrections[sourceId] = {
      context_only_crop: { filename: context.filename, sha256: context.sha256 },
      evidence: correction.evidence
    };
  }
  record(nativePath); record(csvPath); record(reviewPath);
  return { schema_version: 1, course: "ib", parts, presentation_corrections: presentationCorrections, report: {
    builder: { path: "tools/build_ib_physics_mcq.js", sha256: sha(fs.readFileSync(__filename)) },
    source_files: [...files.values()], reviewed_count: Object.keys(parts).length,
    policy: "Apply answers only to records already retained by all assessment, source-year, scope and crop gates. Unreviewed/ambiguous keys retain self-assessment. Do not publish this audit evidence map."
  } };
}

if (require.main === module) {
  const data = build();
  if (process.argv.includes("--stdout")) process.stdout.write(JSON.stringify(data));
  else {
    const output = path.join(ROOT, "dist/physics-inputs/ib-physics-mcq.json");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, JSON.stringify(data, null, 2) + "\n");
    console.log(JSON.stringify({ output, reviewed: data.report.reviewed_count }));
  }
}
module.exports = { build };
