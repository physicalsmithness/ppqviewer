"use strict";
// Private D.2 source projection. This does not alter the active supplement or
// certify new questions against assessments; the release owner still gates it.
const fs = require("fs"), path = require("path"), crypto = require("crypto"), vm = require("vm");
const {parseCsv, buildIbExclusions} = require("./physics-test-exclusions");
const ROOT = path.resolve(__dirname, "..");
const PAPERDB = "C:/CodexProjects/PaperDatabases";
const RECOVERY = "Physics Categorisation/outputs/d2_assignment_recovery_2026-09-12";
const SOURCE_VERSION = "d2_sort_2026-09-09@867cbd71ae82";
const EXPORT_VERSION = "d2_assignment_recovery_2026-09-12_v1";
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const unique = values => [...new Set(values.filter(Boolean))];
function ensure(value, message) { if (!value) throw Error(message); }
function inside(root, filename) { const relative = path.relative(root, filename); return relative && !relative.startsWith("..") && !path.isAbsolute(relative); }
function identities(row) {
  const parent = `${row.year.slice(-2)}${row.session[0].toUpperCase()}.P${row.paper}.${row.level}.${row.time_zone || "TZ0"}.Q${row.question}`;
  const labels = [...row.part_label.matchAll(/\(([^)]+)\)/g)].map(match => match[1]);
  return {parent, part: `${parent}(${labels.join("_") || "whole"})`, label: labels.map(label => `(${label})`).join("") || row.question};
}
function clean(text) {
  return String(text || "").replaceAll("[diagram/graph layout text omitted; see source clipping]", "[figure]")
    .replaceAll("[answer space]", "").replace(/\[\s*\d+\s*(?:marks?)?\s*\]/g, "").replace(/[ \t]+/g, " ").trim();
}
function focus(row) {
  const year = Number(row.year), paper = row.paper.toUpperCase();
  if ((year >= 2025 && paper === "1B") || (year >= 2016 && year <= 2024 && paper === "3" && row.section === "A") ||
      (year >= 2004 && year <= 2015 && paper === "2" && ["A1", "1"].includes(row.question))) return "data_analysis";
  return paper === "3" ? "option_content" : "core";
}
function sourceHoldClosure(rows, seeds) {
  const byId = new Map(rows.map(row => [row.part_id, row])), parents = new Map(), groups = new Map(), duplicates = new Map();
  const add = (index, key, value) => { if (key) { if (!index.has(key)) index.set(key, []); index.get(key).push(value); } };
  for (const row of rows) {
    add(parents, identities(row).parent, row.part_id); add(groups, row.cross_level_group_id, row.part_id);
    add(duplicates, row.part_id, row.duplicate_of); add(duplicates, row.duplicate_of, row.part_id);
  }
  const held = new Set(), queue = [];
  const hold = id => { if (id && byId.has(id) && !held.has(id)) { held.add(id); queue.push(id); } };
  seeds.forEach(hold);
  for (let i = 0; i < queue.length; i++) {
    const row = byId.get(queue[i]);
    [...(parents.get(identities(row).parent) || []), ...(groups.get(row.cross_level_group_id) || []), ...(duplicates.get(row.part_id) || [])].forEach(hold);
  }
  return held;
}

function build(options = {}) {
  const estate = path.resolve(options.paperdbRoot || PAPERDB), previews = path.join(estate, "outputs/previews");
  const recovery = path.join(estate, RECOVERY), witnesses = new Map(), assets = new Map();
  function bytes(filename) {
    filename = path.resolve(filename);
    const value = fs.readFileSync(filename);
    witnesses.set(filename, {path: filename, sha256: sha(value)});
    return value;
  }
  function json(filename) { return JSON.parse(bytes(filename).toString("utf8").replace(/^\uFEFF/, "")); }
  function csv(filename) { return parseCsv(bytes(filename).toString("utf8")); }
  function fieldPaths(row, key) { return String(row[key] || "").split(";").filter(Boolean).map(value => path.resolve(previews, row.preview, value)); }
  function cropFiles(preview, values, kind) {
    return unique((Array.isArray(values) ? values : String(values || "").split(";")).filter(Boolean).map(value => {
      const filename = path.resolve(previews, preview, value), local = path.relative(path.join(previews, preview), filename).replaceAll("\\", "/");
      ensure(inside(path.join(previews, preview), filename) && /^crops\/[a-zA-Z0-9_.-]+\.(png|jpg|jpeg|webp)$/.test(local), "Unsafe or non-crop source image: " + value);
      ensure(path.basename(filename).startsWith(kind + "_"), "Source image role mismatch: " + filename);
      const imageBytes = bytes(filename);
      assets.set(filename, {...witnesses.get(filename), preview, relative_path: local, file: path.basename(filename), bytes: imageBytes.length});
      return path.basename(filename);
    }));
  }
  const manifest = json(path.join(recovery, "export_manifest.json"));
  ensure(manifest.source_version === SOURCE_VERSION && manifest.export_version === EXPORT_VERSION, "Unreviewed D2 recovery version");
  for (const entry of [...manifest.exports, ...manifest.support_files]) {
    const filename = path.resolve(entry.path);
    ensure(inside(recovery, filename) && sha(bytes(filename)) === entry.sha256, "D2 recovery product changed: " + entry.path);
  }
  const assignments = csv(path.join(recovery, "part_type_assignments.csv"));
  const types = csv(path.join(recovery, "versioned_types.csv"));
  const links = csv(path.join(recovery, "type_understanding_mappings.csv"));
  const ledger = csv(path.join(recovery, "reviewed_parts.csv"));
  const joins = csv(path.join(recovery, "verified_group_joins.csv"));
  const grouping = csv(path.join(recovery, "group_membership.csv"));
  const corpusFile = path.join(estate, "outputs/exports/ib_physics_archive_flat_v5.csv"), rows = csv(corpusFile);
  const corpus = new Map(rows.map(row => [row.part_id, row]));
  ensure(corpus.size === rows.length && rows.length === 18308, "D2 archive identities changed");
  ensure(ledger.length === 1700 && types.length === 72 && links.length === 98, "D2 recovered ledger/taxonomy changed");
  const typeIndex = new Map(types.map(type => [type.versioned_type_id, type]));
  ensure(typeIndex.size === types.length && new Set(assignments.map(row => row.part_id + ":" + row.versioned_type_id)).size === assignments.length, "Duplicate D2 taxonomy/membership identity");
  const ordinary = assignments.filter(row => row.scope_status === "retained" && row.ordinary_topic_evidence === "True");
  const data = assignments.filter(row => row.assessment_focus === "data_analysis");
  const ordinaryIds = new Set(ordinary.map(row => row.part_id)), dataIds = new Set(data.map(row => row.part_id));
  ensure(ordinaryIds.size === 552 && ordinary.length === 639 && dataIds.size === 17 && data.length === 22 && assignments.length === 661, "D2 authored population changed");
  ensure([...dataIds].every(id => !ordinaryIds.has(id)), "DATA evidence entered ordinary D2");
  const fieldMap = {database_group_id: "cross_level_group_id", database_group_method: "cross_level_group_method", database_is_canonical: "is_canonical", database_duplicate_of: "duplicate_of"};
  for (const reviewed of ledger) {
    const row = corpus.get(reviewed.part_id);
    ensure(row && reviewed.corpus_sha256 === witnesses.get(corpusFile).sha256, "D2 review used a different archive: " + reviewed.part_id);
    for (const [key, value] of Object.entries(reviewed)) {
      const sourceKey = fieldMap[key] || key;
      if (Object.hasOwn(row, sourceKey)) {
        const pathField = ["question_source", "mark_scheme_source"].includes(sourceKey);
        ensure(pathField ? path.resolve(estate, row[sourceKey]) === path.resolve(value) : row[sourceKey] === value,
          "D2 reviewed/native field mismatch: " + reviewed.part_id + "/" + key);
      }
    }
    for (const [reviewKey, sourceKey] of [["question_crops_json", "question_crop_paths"], ["mark_scheme_crops_json", "ms_crop_paths"], ["page_renders_json", "page_render_paths"]]) {
      ensure(JSON.stringify(JSON.parse(reviewed[reviewKey]).map(file => path.resolve(file)).sort()) === JSON.stringify(fieldPaths(row, sourceKey).sort()), "D2 source locators changed: " + reviewed.part_id + "/" + sourceKey);
    }
  }
  for (const assignment of assignments) {
    ensure(typeIndex.has(assignment.versioned_type_id) && assignment.source_version === SOURCE_VERSION && assignment.versioned_type_id === SOURCE_VERSION + "::" + assignment.local_code, "D2 unversioned or unknown assignment");
    ensure(focus(corpus.get(assignment.part_id)) === assignment.assessment_focus, "D2 ordinary/DATA location rule differs");
  }
  for (const link of links) ensure(typeIndex.has(link.versioned_type_id), "Unknown D2 type-level understanding reference");
  const oldInputFile = path.join(ROOT, "dist/physics-inputs/ib-d2.json"), old = json(oldInputFile);
  const oldIds = new Set(old.questions.flatMap(q => q.parts.map(p => p.source_part_id)));
  const nativeFile = path.join(estate, "Physics Categorisation/viewer/ibphysics_catalogue.js"), nativeBox = {window:{}};
  vm.runInNewContext(bytes(nativeFile).toString("utf8"), nativeBox, {timeout:20000});
  const nativeParts = new Map(nativeBox.window.IBPHYS_QUESTIONS.flatMap(q => q.parts.map(p => [p.source_part_id, p])));
  bytes(path.join(estate, "Physics Categorisation/viewer/build_catalogue.py"));
  const cropReview = json(path.join(ROOT, "reports/ib-reviewed-crop-exclusions.json"));
  ensure(cropReview.corpus_sha256 === witnesses.get(corpusFile).sha256, "Crop holds used a different archive");
  const knownDefects = unique([...cropReview.source_part_ids, ...Object.keys(old.report.reviewed_crop_defects || {}), ...Object.keys(old.report.documented_scheme_mismatch_sources || {})]);
  const qualityHolds = sourceHoldClosure(rows, knownDefects);
  const exclusionPaths = options.exclusionPaths || ["dist/physics-audit/current-ib-tests.json", "reports/ib-a5-reviewed-test-exclusions.json", "reports/ib-a1-c1-reviewed-test-exclusions.json"];
  const exclusion = buildIbExclusions({paperdbRoot: estate, questions: [], extraExclusionsPaths: exclusionPaths.map(file => path.resolve(ROOT, file))});
  for (const source of exclusion.report.sourceFiles) bytes(path.isAbsolute(source.path) ? source.path : path.join(estate, source.path));
  bytes(path.join(ROOT, "tools/physics-test-exclusions.js"));
  const pageNo = file => (/_p(\d+)(?:_|\.)/.exec(file) || [])[1];
  const blockedPages = new Set([...exclusion.blockedQuestionPageKeys].map(file => file.split("/")[0] + "/" + pageNo(file)));
  const parentRows = new Map(), previewCache = new Map(), withheld = [], questions = [];
  for (const row of rows) if (ordinaryIds.has(row.part_id)) {
    const parent = identities(row).parent;
    if (!parentRows.has(parent)) parentRows.set(parent, []);
    parentRows.get(parent).push(row);
  }
  const qualityFlags = ordinary.filter(row => row.source_quality_status === "uncertain");
  ensure(new Set(qualityFlags.map(row => row.part_id)).size === 2 && qualityFlags.length === 3, "D2 source quality flags changed");
  const flagged = new Map(qualityFlags.map(row => [row.part_id, row]));
  const answerQualityHolds = sourceHoldClosure(rows, [...flagged.keys()]);
  const membershipByPart = new Map();
  for (const assignment of ordinary) {
    if (!membershipByPart.has(assignment.part_id)) membershipByPart.set(assignment.part_id, []);
    membershipByPart.get(assignment.part_id).push(assignment);
  }
  for (const [parentId, group] of parentRows) {
    const first = group[0], reasons = [];
    if (!/^\d{4}$/.test(first.year) || Number(first.year) >= 2026) reasons.push("2026_and_later_source_exam_embargo_or_unknown_year");
    if (group.some(row => exclusion.blockedSourceIds.has(row.part_id)) || exclusion.blockedParentIds.has(parentId)) reasons.push("existing_assessment_whole_parent_twin_duplicate_reservation");
    if (group.some(row => qualityHolds.has(row.part_id))) reasons.push("existing_reviewed_crop_or_scheme_defect_whole_parent_twin_hold");
    if (group.some(row => answerQualityHolds.has(row.part_id))) reasons.push("authored_uncertain_answer_key_whole_parent_twin_hold");
    if (!previewCache.has(first.preview)) {
      const document = json(path.join(previews, first.preview, "question_preview.json"));
      previewCache.set(first.preview, new Map(document.question_groups.map(q => [String(q.question_number), q])));
    }
    const native = previewCache.get(first.preview).get(first.question);
    ensure(native, "Missing native D2 parent: " + parentId);
    const parentCropPaths = native.crop_image_paths || [];
    const parentSourceFiles = unique([first.question_source, first.mark_scheme_source]).map(file => path.resolve(estate, file));
    for (const file of parentSourceFiles) if (file) { ensure(inside(estate, path.resolve(file)), "D2 source PDF outside estate"); bytes(file); }
    const refs = unique([...parentCropPaths, ...group.flatMap(row => [...String(row.question_crop_paths).split(";"),
      ...String(row.page_render_paths).split(";").filter(file => path.basename(file).startsWith("question_"))])]);
    if (refs.some(file => blockedPages.has(first.preview + "/" + pageNo(file)))) reasons.push("question_or_context_shares_reserved_source_page");
    for (const row of group) if (!row.question_crop_paths || !row.ms_crop_paths) reasons.push("missing_focused_question_or_markscheme_crop");
    if (reasons.length) {
      for (const row of group) withheld.push({source_part_id: row.part_id, parent_id: parentId, reasons: unique(reasons), newly_recovered: !oldIds.has(row.part_id)});
      continue;
    }
    const parts = group.map(row => {
      const id = identities(row), previous = nativeParts.get(row.part_id), caution = flagged.get(row.part_id);
      if (previous) ensure(previous.part_id === id.part, "Native D2 stable identity changed");
      const pages = String(row.page_render_paths || "").split(";").filter(file => path.basename(file).startsWith("question_")).map(file => path.basename(file));
      const msPages = String(row.page_render_paths || "").split(";").filter(file => path.basename(file).startsWith("mark_")).map(file => path.basename(file));
      const part = {part_id: id.part, source_part_id: row.part_id, label: id.label, text: clean(row.question_text), lead_in: clean(row.parent_context),
        marks: /^\d+$/.test(row.marks) ? Number(row.marks) : null, marks_status: /^\d+$/.test(row.marks) ? "source_extracted" : "unknown", mark_group: "",
        crops: cropFiles(row.preview, row.question_crop_paths, "question"), pages, ms_crops: cropFiles(row.preview, row.ms_crop_paths, "mark_scheme"), ms_pages: msPages,
        ms_pages_this_question: msPages, ms_page_span_source: msPages.length ? "located-medium" : "unlocated",
        markscheme_text: row.ms_text, ms_text_status: row.ms_text_status, topic_codes: ["D.2"], primary_codes: ["D.2"], secondary_codes: [],
        classification_status: "authored_source_membership", classification_sources: [path.join(recovery, "part_type_assignments.csv")],
        selection_evidence: {"D.2": "versioned_authored_ordinary_membership"}, assessment_focus: focus(row), spec_status: "current",
        spec_status_source: "authored_recovered_current_D2_scope", usable_if: "", has_figure_omitted: clean(row.question_text + " " + row.parent_context).includes("[figure]"),
        examiner_comment: row.examiner_report_part_comment || row.examiner_report_question_comment, examiner_source_type: row.examiner_report_source_type,
        examiner_match_note: row.examiner_report_match_note, answer_pack_comment: row.answer_pack_comment, answer_pack_source: row.answer_pack_source,
        cross_level_group_id: row.cross_level_group_id, is_canonical: row.is_canonical === "1", duplicate_of_source: row.duplicate_of, self_mark: "marks",
        answer_status: caution ? "source_quality_review_required" : "not_independently_reviewed_for_automatic_marking",
        source_quality_status: caution ? "uncertain" : "source_record_preserved", source_quality_note: caution?.source_quality_note || "",
        versioned_type_ids: membershipByPart.get(row.part_id).map(item => item.versioned_type_id)};
      // A membership recovery is not an answer-key review. Preserve a printed
      // key as private evidence only; never supply a new auto-marking answer.
      const key = /^\s*Answer:\s*([ABCD])\s*$/.exec(row.ms_text);
      if (key) part.extracted_answer = key[1];
      if (previous?.answer_note && !part.source_quality_note) part.source_quality_note = previous.answer_note;
      return part;
    });
    const q = {id: parentId, preview: first.preview, year: first.year, series: first.session, session: first.session, time_zone: first.time_zone,
      paper: first.paper, level: first.level, question: first.question, topic_code: "D.2", topic_codes: ["D.2"], primary_code: "D.2", primary_codes: ["D.2"],
      assessment_focus: focus(first), spec_status: "current", usable_if: "", classification_status: "authored_source_membership", stem_text: clean(native.shared_stem || first.shared_stem),
      crops: cropFiles(first.preview, parentCropPaths, "question"), parts, pages: unique(parts.flatMap(p => p.pages)), ms_crops: unique(parts.flatMap(p => p.ms_crops)),
      ms_pages: unique(parts.flatMap(p => p.ms_pages)), ms_pages_this_question: unique(parts.flatMap(p => p.ms_pages)), ms_page_span_source: "located-medium",
      marks: parts.every(p => p.marks !== null) ? parts.reduce((sum, p) => sum + p.marks, 0) : null,
      examiner_comment: first.examiner_report_question_comment, examiner_source_type: first.examiner_report_source_type, examiner_match_note: first.examiner_report_match_note,
      marking_differs: Number(first.year) < 2025 ? "yes" : "no", marking_note: Number(first.year) < 2025 ? "This scheme follows the conventions of its original examination." : ""};
    q.ms_page_span = unique(q.ms_pages.map(pageNo)).map(Number).sort((a,b) => a-b);
    questions.push(q);
  }
  const candidateIds = new Set(questions.flatMap(q => q.parts.map(p => p.source_part_id)));
  const familyNames = unique(types.map(type => type.family));
  const groupCodes = new Map(familyNames.map((family, index) => [family, SOURCE_VERSION + "::family:" + (index + 1)]));
  const atoms = types.map(type => ({code: type.versioned_type_id, label: type.question_type, group_code: groupCodes.get(type.family),
    local_code: type.local_code, source_version: type.source_version, source_evidence_status: type.source_evidence_status,
    scope_status: type.scope_status, summary: type.core_solving_route, checks: [], current_level_source: type.level_2025_skill,
    type_understanding_references: links.filter(link => link.versioned_type_id === type.versioned_type_id).map(link => link.understanding_code)}));
  const parts = Object.fromEntries(ledger.map(row => {
    const members = membershipByPart.get(row.part_id) || [], included = ordinaryIds.has(row.part_id);
    return [row.part_id, {status: included ? "included" : "excluded", reason: row.scope_reason, scope_reviewed: true,
      group_codes: unique(members.map(member => groupCodes.get(typeIndex.get(member.versioned_type_id).family))), atom_codes: members.map(member => member.versioned_type_id), type_codes: [],
      used_atom_codes: [], optional_atom_codes: [], assessment_focus: row.assessment_focus, source_quality_status: row.source_quality_status,
      source_quality_note: row.source_quality_note, integration_review_status: flagged.has(row.part_id) ? "source_quality_review_required" : "source_membership_preserved",
      source_review_seq: row.source_review_seq, source_analysis_file: row.source_analysis_file, source_analysis_json_pointer: row.source_analysis_json_pointer,
      recovered_group_id: row.recovered_group_id, native_candidate_eligible: candidateIds.has(row.part_id), assessment_review_complete: false}];
  }));
  const counts = {ordinary_source_parts: ordinaryIds.size, ordinary_memberships: ordinary.length, separate_DATA_parts: dataIds.size, separate_DATA_memberships: data.length,
    taxonomy_types: types.length, ordinary_evidenced_types: new Set(ordinary.map(row => row.versioned_type_id)).size, type_understanding_references: links.length,
    quality_flag_parts: flagged.size, quality_flag_memberships: qualityFlags.length, previous_input_parts: oldIds.size,
    overlap_previous_input: [...ordinaryIds].filter(id => oldIds.has(id)).length, absent_from_previous_input: [...ordinaryIds].filter(id => !oldIds.has(id)).length,
    candidate_parts: candidateIds.size, candidate_parents: questions.length, candidate_new_parts: [...candidateIds].filter(id => !oldIds.has(id)).length,
    withheld_parts: withheld.length, source_crop_assets: assets.size};
  return {schema_version: 1, topic: "D.2", label: "Electric and magnetic fields", source_version: SOURCE_VERSION, export_version: EXPORT_VERSION,
    groups: familyNames.map(family => ({code: groupCodes.get(family), label: family, summary: "", checks: []})), atoms, types: [], parts, questions,
    memberships: ordinary, separate_data_memberships: data, type_understanding_mappings: links, verified_group_joins: joins, source_group_membership: grouping,
    report: {builder: {path: __filename, sha256: sha(fs.readFileSync(__filename))}, source_files: [...witnesses.values()].sort((a,b) => a.path.localeCompare(b.path)), counts,
      assessment_review_complete: false, needs_test_exclusion_and_crop_filtering: true,
      ordinary_source_ids: [...ordinaryIds].sort(), candidate_source_ids: [...candidateIds].sort(), new_candidate_source_ids: [...candidateIds].filter(id => !oldIds.has(id)).sort(),
      separate_DATA_source_ids: [...dataIds].sort(), quality_flags: qualityFlags, withheld_candidates: withheld, asset_manifest: [...assets.values()],
      existing_assessment_reservation_counts: exclusion.report.counts,
      limitations: ["These are private source candidates; the expanded D2 assessment comparison and per-image source ownership checks are not certified.",
        "The source's 98 understanding links belong to question types. They are not new per-part assessed syllabus tags.",
        "Only focused question, markscheme and whole-question context crops are candidates for display. Page renders remain private location metadata.",
        "DATA memberships and pack occurrences never enlarge ordinary D2. Source-quality flags do not become clean automatic-marking keys."]}};
}
function write(output = path.join(ROOT, "dist/physics-inputs/ib-d2-recovered.json")) {
  output = path.resolve(output); ensure(inside(ROOT, output), "D2 output must remain inside the workspace");
  const result = build(); fs.mkdirSync(path.dirname(output), {recursive: true}); fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
  return {output, sha256: sha(fs.readFileSync(output)), counts: result.report.counts};
}
if (require.main === module) console.log(JSON.stringify(write(process.argv[2]), null, 2));
module.exports = {build, write, identities, focus, sourceHoldClosure};
