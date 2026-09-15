"use strict";
// Bind all selected additional-topic parts to their original question and
// markscheme PDFs, including parts whose answers are marked manually.
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const {parseCsv} = require("./physics-test-exclusions");
const DEFAULT_DB = "C:/CodexProjects/PaperDatabases";
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const ensure = (ok, message) => { if (!ok) throw Error(message); };
function inside(root, relative) {
  ensure(typeof relative === "string" && relative.length && !path.isAbsolute(relative), "Original source path must be relative");
  const target = path.resolve(root, relative), remainder = path.relative(root, target);
  ensure(remainder && !remainder.startsWith("..") && !path.isAbsolute(remainder), "Original source path escapes its root");
  return target;
}
function buildOriginalEvidence(questions, options = {}) {
  ensure(Array.isArray(questions), "Original source records must be an array");
  const db = path.resolve(options.paperdbRoot || process.env.PHYSICS_PAPERDB_ROOT || DEFAULT_DB);
  const fingerprints = new Map(), metadataCache = new Map();
  function read(file) {
    file = path.resolve(file);
    const bytes = fs.readFileSync(file), digest = sha(bytes), earlier = fingerprints.get(file);
    ensure(!earlier || earlier.sha256 === digest, "Original source changed during this check: " + file);
    fingerprints.set(file, {path: file, sha256: digest});
    return bytes;
  }
  function metadata(file) {
    if (!metadataCache.has(file)) metadataCache.set(file, JSON.parse(read(file).toString("utf8").replace(/^\uFEFF/, "")));
    return metadataCache.get(file);
  }
  const nativePath = inside(db, "Physics Categorisation/viewer/ibphysics_catalogue.js");
  const csvPath = inside(db, "outputs/exports/ib_physics_archive_flat_v5.csv");
  const box = {window: {}};
  vm.runInNewContext(read(nativePath).toString("utf8"), box, {timeout: 20000});
  const native = new Map(), rows = new Map(), originals = [], seen = new Set();
  function add(map, id, item) { if (!map.has(id)) map.set(id, []); map.get(id).push(item); }
  for (const parent of box.window.IBPHYS_QUESTIONS || []) for (const part of parent.parts || []) add(native, part.source_part_id, {parent,part});
  for (const row of parseCsv(read(csvPath).toString("utf8"))) add(rows, row.part_id, row);
  for (const question of questions.filter(q => (q.topic_codes || []).some(code => ["A.1", "C.1"].includes(code)))) {
    const id = question.source_part_id;
    ensure(/^ibchem_part_[a-f0-9]+$/.test(id || "") && !seen.has(id), "Original source-part identity is missing or repeated");
    seen.add(id);
    ensure(native.get(id)?.length === 1 && rows.get(id)?.length === 1, "Original source-part join is missing or ambiguous: " + id);
    const {parent,part} = native.get(id)[0], row = rows.get(id)[0];
    ensure(question.parent_id === parent.id && question.id === part.part_id, "Original native parent/part identity differs: " + id);
    ensure(row.preview === parent.preview && row.question === String(parent.question) && row.question === String(question.question_number), "Original preview/question identity differs: " + id);
    ensure(/^\d{4}$/.test(row.year) && Number(row.year) >= 2004 && Number(row.year) < 2026, "Original source year is outside the permitted range: " + id);
    for (const field of ["year", "paper", "level"]) ensure(row[field] === String(parent[field]) && row[field] === String(question[field]), "Original source " + field + " differs: " + id);
    ensure(row.session === parent.session && row.time_zone === parent.time_zone, "Original session/time zone differs: " + id);
    const preview = inside(db, "outputs/previews/" + row.preview), source = {source_part_id: id, part_id:question.id,parent_id:question.parent_id,preview:row.preview};
    for (const [kind, column, target] of [["question", "question_source", "question_source"], ["mark_scheme", "mark_scheme_source", "markscheme_source"]]) {
      const metadataPath = inside(preview, kind + "_preview.json"), meta = metadata(metadataPath), original = meta.source;
      ensure(original && original.relative_path === row[column], "Original PDF attribution differs from archive: " + id + " " + kind);
      ensure(original.subject === "Physics" && original.document_type === (kind === "question" ? "question_paper" : "mark_scheme"), "Original document subject/type differs: " + id + " " + kind);
      for (const [field, archiveField] of [["year","year"],["series","session"],["level","level"],["time_zone","time_zone"],["paper","paper"],["paper_variant","paper_variant"]]) {
        ensure(String(original[field] ?? "") === String(row[archiveField] ?? ""), "Original PDF " + field + " differs: " + id + " " + kind);
      }
      ensure(/\.pdf$/i.test(row[column]), "Original document is not a PDF: " + id + " " + kind);
      const originalPath = inside(db, row[column]);
      if (!fingerprints.has(originalPath)) ensure(read(originalPath).subarray(0, 5).toString() === "%PDF-", "Original PDF header is missing: " + originalPath);
      source[target] = {...fingerprints.get(originalPath), metadata_path: metadataPath, metadata_sha256:fingerprints.get(metadataPath).sha256};
    }
    originals.push(source);
  }
  read(__filename);
  return {fingerprints:[...fingerprints.values()].sort((a,b)=>a.path.localeCompare(b.path)), originals,
    builder:fingerprints.get(__filename)};
}
module.exports = {buildOriginalEvidence};
