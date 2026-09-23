"use strict";
// Source and assessment checks for additional public IB topics. This module
// reads source files; only the explicit clearance builder writes local evidence.
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const {ibInput} = require("./assemble_physics_preview");
const {parseCsv, buildIbExclusions} = require("./physics-test-exclusions");
const {overlap} = require("./build_ib_a5_clearance");
const {loadReviewedTopics} = require("./ib-reviewed-topics");
const {buildMetadata: buildTopicMcq} = require("./ib-topic-mcq");
const {buildOriginalEvidence} = require("./ib-topic-originals");
const {loadCurrentReviewAdditions}=require("./ib-current-review-additions");
const {loadA5AdditionalGeometry}=require("./ib-a5-additional-geometry");
const ROOT = path.resolve(__dirname, ".."), DB = path.resolve(process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases");
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const unique = values => [...new Set(values)];
const analysisPaths = ["dist/physics-inputs/ib-a1-analysis.json", "dist/physics-inputs/ib-c1-analysis.json"];
const assessmentPath = path.join(ROOT, "reports/ib-a1-c1-reviewed-test-exclusions.json");
const clearancePath = path.join(ROOT, "reports/ib-a1-c1-release-clearance.json");
const sharedCropReviewPath = path.join(ROOT, "reports/ib-a5-shared-parent-crop-review.json");
const imageFields = ["question_images", "context_images", "markscheme_images"];

function reviewedInput() {
  const input = ibInput({release:true,reviewedTopicPaths: analysisPaths, extraExclusionsPaths: [assessmentPath]});
  const questions = input.questions.filter(q => q.topic_codes.some(topic => ["A.1", "A.5", "C.1"].includes(topic)));
  const mcq = buildTopicMcq(questions);
  for (const q of questions) {
    const key = mcq.parts[q.source_part_id];
    if (!key) continue;
    ensure(!q.correct_option || q.correct_option === key.correct_option, "Conflicting reviewed MCQ key");
    if (q.answer_status !== "reviewed_source_key") { q.correct_option = key.correct_option; q.answer_status = key.answer_status; }
  }
  return {...input, questions, report:{...input.report,topic_mcq_metadata:mcq.report}};
}

function auditCrops(input) {
  const fingerprints = new Map();
  function read(file) {
    const resolved = path.resolve(file), bytes = fs.readFileSync(resolved);
    fingerprints.set(resolved, {path: resolved, sha256: sha(bytes)});
    return bytes;
  }
  const json = file => JSON.parse(read(file));
  const box = {window: {}};
  vm.runInNewContext(read(path.join(DB, "Physics Categorisation/viewer/ibphysics_catalogue.js")).toString("utf8"), box);
  const native = box.window.IBPHYS_QUESTIONS, parents = new Map(native.map(q => [q.id, q]));
  const corpus = parseCsv(read(path.join(DB, "outputs/exports/ib_physics_archive_flat_v5.csv")).toString("utf8"));
  const currentAdditions=loadCurrentReviewAdditions();
  for(const file of currentAdditions.fingerprints)ensure(sha(read(file.path))===file.sha256,"Additional test evidence changed during crop audit");
  for(const file of loadA5AdditionalGeometry().fingerprints)ensure(sha(read(file.path))===file.sha256,"Additional A5 geometry evidence changed during crop audit");
  const exclusions = [path.join(ROOT, "dist/physics-audit/current-ib-tests.json"), path.join(ROOT, "reports/ib-a5-reviewed-test-exclusions.json"), assessmentPath,...currentAdditions.paths];
  exclusions.forEach(read);
  const closure = buildIbExclusions({paperdbRoot: DB, questions: native, extraExclusionsPaths: exclusions});
  for (const file of closure.report.sourceFiles) read(path.isAbsolute(file.path) ? file.path : path.join(DB, file.path));
  const heldQuestions = new Set(corpus.filter(row => closure.blockedSourceIds.has(row.part_id)).map(row => row.preview + "/" + row.question));
  const pageNumber = file => (/_p(\d+)(?:_|\.)/.exec(file) || [])[1];
  const heldPages = new Set([...closure.blockedQuestionPageKeys].map(key => key.split("/")[0] + "/" + pageNumber(key)));
  const cache = new Map(), audit = [], failures = [], heldParents = new Set();
  const validRegion = region => Number.isInteger(region.page_number) && region.page_number > 0 &&
    Array.isArray(region.bbox) && region.bbox.length === 4 && region.bbox.every(Number.isFinite) &&
    region.bbox[2] > region.bbox[0] && region.bbox[3] > region.bbox[1];
  function metadata(preview, kind) {
    const file = path.join(DB, "outputs/previews", preview, kind + "_preview.json");
    if (!cache.has(file)) cache.set(file, json(file));
    return cache.get(file);
  }
  for (const q of input.questions.filter(q => q.topic_codes.some(topic => ["A.1", "C.1"].includes(topic)))) {
    const nativeQuestion = parents.get(q.parent_id);
    if (!nativeQuestion) {
      heldParents.add(q.parent_id);
      failures.push({source_part_id:q.source_part_id,parent_id:q.parent_id,reason:"Original parent is absent from the native catalogue"});
      continue;
    }
    ensure(Number(q.year) < 2026 && !closure.blockedParentIds.has(q.parent_id), "Reserved reviewed-topic parent: " + q.id);
    const nativePart = nativeQuestion.parts.find(part => part.source_part_id === q.source_part_id);
    ensure(nativePart && nativePart.part_id === q.id, "Reviewed topic part identity differs from its native parent: " + q.id);
    ensure(!nativeQuestion.parts.some(part => closure.blockedSourceIds.has(part.source_part_id)), "Reserved sibling in a reviewed-topic context");
    ensure([...(nativeQuestion.pages || []), ...(nativeQuestion.crops || []), ...nativeQuestion.parts.flatMap(p => p.crops || [])]
      .every(file => !heldPages.has(nativeQuestion.preview + "/" + pageNumber(file))), "Reserved source page in reviewed-topic context");
    for (const field of imageFields) for (const file of q[field]) {
      const role = field === "markscheme_images" ? "markscheme" : field === "context_images" ? "context" : "question";
      try {
        ensure(/[\\/]crops[\\/](question|mark)_.*\.png$/.test(file), "Image is not a source crop");
        const cropRoot = path.join(DB, "outputs/previews", nativeQuestion.preview, "crops");
        ensure(path.resolve(file) === path.join(cropRoot, path.basename(file)), "Crop is outside the selected question's original preview");
        const allowedNames = role === "context" ? nativeQuestion.crops : role === "markscheme" ? nativePart.ms_crops : nativePart.crops;
        ensure((allowedNames || []).includes(path.basename(file)), "Crop is not assigned to this source part and role");
        const bytes = read(file), meta = metadata(nativeQuestion.preview, role === "markscheme" ? "mark_scheme" : "question");
        const entries = role === "markscheme" ? meta.entries : meta.question_groups.flatMap(group => [{...group, owner_question: group.question_number}, ...group.parts.map(part => ({...part, owner_question: group.question_number}))]);
        const matches = entries.filter(entry => (entry.crop_image_paths || []).some(name => path.basename(name) === path.basename(file)));
        ensure(matches.length === 1, "Crop attribution is absent or ambiguous");
        const match = matches[0], owner = role === "markscheme" ? match.question_number : match.owner_question;
        ensure(String(owner) === String(nativeQuestion.question), "Crop belongs to another question");
        ensure(match.crop_regions?.length && match.crop_regions.every(validRegion), "Crop has no valid recorded source rectangle");
        const reserved = entries.filter(entry => heldQuestions.has(nativeQuestion.preview + "/" + (role === "markscheme" ? entry.question_number : entry.owner_question)));
        // A recovery placeholder can contain reserved answer text without a
        // reliable location. Its absence of an image does not establish that
        // another crop is clear, so those previews remain held for review.
        ensure(reserved.every(entry => entry.crop_regions?.length && entry.crop_regions.every(validRegion)), "Reserved question has no valid rectangle for comparison");
        ensure(!reserved.some(entry => (entry.crop_regions || []).some(b => match.crop_regions.some(a => overlap(a, b)))), "Crop overlaps a reserved question rectangle");
        audit.push({source_part_id: q.source_part_id, parent_id: q.parent_id, role, path: path.resolve(file), sha256: sha(bytes), owner_question: String(owner),
          metadata_path: path.join(DB, "outputs/previews", nativeQuestion.preview, (role === "markscheme" ? "mark_scheme" : "question") + "_preview.json")});
      } catch (error) {
        heldParents.add(q.parent_id);
        failures.push({source_part_id: q.source_part_id, parent_id: q.parent_id, role, path: file, reason: error.message});
      }
    }
  }
  // A reviewed existing A5 crop may remain while a different new A1 crop from
  // the same parent is withheld. Bind this exception to the exact visual review,
  // source files, role assignments and bytes, never just to a parent ID.
  const sharedReview = json(sharedCropReviewPath), retainedA5 = new Set();
  ensure(sharedReview.review_complete === true && sharedReview.reserved_content_found === false &&
    sharedReview.unresolved_relevant_items.length === 0, "Shared-parent visual review is incomplete");
  for (const file of sharedReview.source_files) ensure(sha(read(file.path)) === file.sha256, "Shared-parent review source changed: " + file.path);
  for (const q of input.questions.filter(q => q.topic_codes.includes("A.5") && heldParents.has(q.parent_id))) {
    const record = sharedReview.records.find(item => item.source_part_id === q.source_part_id);
    ensure(sharedReview.retain_unchanged_source_ids.includes(q.source_part_id) && record?.review_complete === true &&
      record.disposition === "retain_unchanged" && record.parent_id === q.parent_id && record.id === q.id &&
      !q.topic_codes.some(topic => ["A.1", "C.1"].includes(topic)), "An affected A5 part lacks an exact visual review: " + q.id);
    const assigned = imageFields.flatMap(field => q[field].map(file => ({path:path.resolve(file),role:field === "markscheme_images" ? "markscheme" : field === "context_images" ? "context" : "question"})));
    const key = item => item.role + ":" + path.resolve(item.path);
    ensure(JSON.stringify(assigned.map(key).sort()) === JSON.stringify(record.assets.map(key).sort()), "Reviewed A5 image roles changed");
    const failedHashes = new Set(failures.filter(item => item.parent_id === q.parent_id && item.path).map(item => sha(read(item.path))));
    for (const asset of record.assets) ensure(sha(read(asset.path)) === asset.sha256 && !failedHashes.has(asset.sha256), "A retained A5 image changed or aliases a failed new crop");
    retainedA5.add(q.source_part_id);
  }
  const questions = input.questions.filter(q => !heldParents.has(q.parent_id) || retainedA5.has(q.source_part_id));
  for (const file of buildOriginalEvidence(questions, {paperdbRoot:DB}).fingerprints) {
    ensure(sha(read(file.path)) === file.sha256, "Original source changed during its review: " + file.path);
  }
  return {questions, assets: audit.filter(item => !heldParents.has(item.parent_id)), withheld_parents: [...heldParents].sort(), failures, fingerprints: [...fingerprints.values()]};
}

function validateTopicClearance(clearance, questions) {
  ensure(clearance.schema_version === 1 && clearance.review_complete === true && Array.isArray(clearance.unresolved_relevant_items) && !clearance.unresolved_relevant_items.length, "A1/C1 release review is incomplete");
  const selected = questions.filter(q => q.topic_codes.some(topic => ["A.1", "C.1"].includes(topic)));
  const assessment = JSON.parse(fs.readFileSync(assessmentPath));
  ensure(assessment.review_complete === true && Array.isArray(assessment.reviewed_candidate_source_ids) &&
    selected.every(q => assessment.reviewed_candidate_source_ids.includes(q.source_part_id)), "A1/C1 candidate scope was not assessed against the current tests");
  ensure(assessment.reviewed_candidate_file && sha(fs.readFileSync(assessment.reviewed_candidate_file)) === assessment.reviewed_candidate_sha256,
    "The candidate set changed after the assessment comparison");
  ensure(JSON.stringify(unique(selected.map(q => q.source_part_id)).sort()) === JSON.stringify(clearance.reviewed_source_part_ids), "A1/C1 served scope differs from its clearance");
  for (const topic of ["A.1", "C.1"]) ensure(selected.some(q => q.topic_codes.includes(topic)), "No cleared parts remain for " + topic);
  const expectedFiles = unique(selected.flatMap(q => imageFields.flatMap(field => q[field]))).map(file => path.resolve(file)).sort();
  ensure(JSON.stringify(expectedFiles) === JSON.stringify(unique(clearance.assets.map(asset => path.resolve(asset.path))).sort()), "A1/C1 asset scope differs from its clearance");
  const witnesses = new Map(clearance.fingerprints.map(file => [path.resolve(file.path), file.sha256]));
  const reviewed = loadReviewedTopics(analysisPaths);
  const mcq = buildTopicMcq(selected);
  const originals = buildOriginalEvidence(selected, {paperdbRoot:DB});
  for (const q of selected.filter(q=>q.answer_status === "matched_source_key")) ensure(mcq.parts[q.source_part_id]?.correct_option === q.correct_option, "Matched MCQ key no longer agrees with its original sources");
  const nativePath = path.join(DB, "Physics Categorisation/viewer/ibphysics_catalogue.js");
  const sourceBox = {window:{}}; vm.runInNewContext(fs.readFileSync(nativePath,"utf8"),sourceBox);
  const nativeParents = new Map(sourceBox.window.IBPHYS_QUESTIONS.map(q=>[q.id,q]));
  const metadataPaths = unique(selected.flatMap(q=> {
    const native = nativeParents.get(q.parent_id);
    ensure(native?.parts.some(part=>part.source_part_id===q.source_part_id && part.part_id===q.id), "Cleared part identity is no longer present in its native parent");
    return ["question", "mark_scheme"].map(kind=>path.join(DB,"outputs/previews",native.preview,kind+"_preview.json"));
  }));
  const freshness = JSON.parse(fs.readFileSync(path.join(ROOT,"dist/physics-audit/a1-c1-assessments/freshness.json")));
  const sharedReview = JSON.parse(fs.readFileSync(sharedCropReviewPath));
  const required = [...loadCurrentReviewAdditions().fingerprints.map(file=>file.path),...loadA5AdditionalGeometry().fingerprints.map(file=>file.path),...analysisPaths.map(file => path.join(ROOT, file)), assessmentPath, nativePath, sharedCropReviewPath,
    ...originals.fingerprints.map(file=>path.resolve(file.path)),
    ...sharedReview.source_files.map(file=>path.resolve(file.path)),
    ...["outputs/exports/ib_physics_archive_flat_v5.csv","Physics Categorisation/returns/PACKET_006D/source_results_v4.csv","Physics Categorisation/returns/PACKET_006D/matches.csv"].map(file=>path.join(DB,file)),
    ...reviewed.flatMap(topic=>[...topic.report.source_files,topic.report.builder].map(file=>path.resolve(file.path))),
    ...assessment.source_files.map(file=>path.isAbsolute(file.path)?file.path:path.join(DB,file.path)),
    ...[...mcq.report.source_files,mcq.report.builder].map(file=>path.resolve(file.path)),
    ...freshness.source_files.map(file=>path.join(DB,"Physics Categorisation/reference/tests/3. Assessments",file.relative_path)),
    ...metadataPaths,
    ...["tools/ib-topic-release.js", "tools/ib-reviewed-topics.js", "tools/assemble_physics_preview.js", "tools/physics-test-exclusions.js", "dist/physics-audit/a1-c1-assessments/freshness.json"].map(file => path.join(ROOT, file)), ...expectedFiles];
  ensure(required.every(file => witnesses.has(path.resolve(file))), "A1/C1 release fingerprints are incomplete");
  ensure(witnesses.size === clearance.fingerprints.length, "Duplicate A1/C1 evidence fingerprints");
  for (const file of clearance.fingerprints) ensure(fs.existsSync(file.path) && sha(fs.readFileSync(file.path)) === file.sha256, "A1/C1 clearance source changed: " + file.path);
}

function buildClearance() {
  const input = reviewedInput(), reviewed = loadReviewedTopics(analysisPaths), assessment = JSON.parse(fs.readFileSync(assessmentPath));
  ensure(assessment.review_complete === true && Array.isArray(assessment.unresolved_relevant_items) && !assessment.unresolved_relevant_items.length, "Current A1/C1 assessments still need review");
  const freshnessPath = path.join(ROOT, "dist/physics-audit/a1-c1-assessments/freshness.json"), freshness = JSON.parse(fs.readFileSync(freshnessPath));
  ensure(freshness.all_identical === true && freshness.source_files.length, "Current A1/C1 assessment freshness is not confirmed");
  const result = auditCrops(input), fingerprints = new Map(result.fingerprints.map(file => [file.path, file]));
  function witness(file, expectedHash) {
    const resolved = path.resolve(file), digest = sha(fs.readFileSync(resolved));
    ensure(!expectedHash || digest === expectedHash, "Reviewed topic source changed: " + file);
    fingerprints.set(resolved, {path: resolved, sha256: digest});
  }
  for (const file of [...analysisPaths, "tools/ib-topic-release.js", "tools/ib-reviewed-topics.js", "tools/assemble_physics_preview.js", "tools/physics-test-exclusions.js"]) witness(path.join(ROOT, file));
  witness(freshnessPath); witness(assessmentPath);
  for (const file of assessment.source_files) witness(path.isAbsolute(file.path)?file.path:path.join(DB,file.path), file.sha256);
  for (const file of [...input.report.topic_mcq_metadata.source_files,input.report.topic_mcq_metadata.builder]) witness(file.path,file.sha256);
  for (const topic of reviewed) for (const file of [...topic.report.source_files, topic.report.builder]) witness(file.path, file.sha256);
  for (const file of freshness.source_files) witness(path.join(DB, "Physics Categorisation/reference/tests/3. Assessments", file.relative_path), file.sha256);
  const selected = result.questions.filter(q => q.topic_codes.some(topic => ["A.1", "C.1"].includes(topic)));
  const clearance = {schema_version: 1, topics: ["A.1", "C.1"], review_complete: true, reviewed_utc: new Date().toISOString(), unresolved_relevant_items: [],
    reviewed_source_part_ids: unique(selected.map(q => q.source_part_id)).sort(), reviewed_parent_ids: unique(selected.map(q => q.parent_id)).sort(),
    counts: Object.fromEntries(["A.1", "C.1"].map(topic => [topic, {parts: selected.filter(q => q.topic_codes.includes(topic)).length, typed_parts: selected.filter(q => q.topic_codes.includes(topic) && q.analysis_atoms.some(code => code.replace(/\./g, "").startsWith(topic.replace(".", "")))).length}])),
    assessment_review: {path: assessmentPath, sha256: sha(fs.readFileSync(assessmentPath))}, freshness: {path: freshnessPath, checked_at: freshness.checked_at},
    mcq_metadata: {matched_source_ids:selected.filter(q=>q.answer_status === "matched_source_key").map(q=>q.source_part_id).sort(),findings:input.report.topic_mcq_metadata.findings},
    fingerprints: [...fingerprints.values()].sort((a,b) => a.path.localeCompare(b.path)), assets: result.assets, withheld_parents: result.withheld_parents, crop_findings: result.failures,
    limitations: ["Fine question-type mappings are published only where supported; an explicit current-topic scope review can retain an otherwise untyped part.", "Crop source rectangles, original-question ownership and reserved-content overlap are checked for every asset; this is not a claim of individual visual proofreading for every image."]};
  validateTopicClearance(clearance, result.questions);
  fs.writeFileSync(clearancePath, JSON.stringify(clearance, null, 2) + "\n");
  console.log(JSON.stringify({path: clearancePath, counts: clearance.counts, assets: unique(clearance.assets.map(asset => asset.path)).length, withheld_parents: result.withheld_parents.length, fingerprints: clearance.fingerprints.length}, null, 2));
  return clearance;
}

if (require.main === module) buildClearance();
module.exports = {reviewedInput, auditCrops, buildClearance, validateTopicClearance, clearancePath, analysisPaths, assessmentPath};
