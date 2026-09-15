/* Assemble local physics practice from attributed catalogues and test exclusions.
   Source corpora are read-only. Only filtered crops are copied; original pages,
   test workbooks and the unfiltered catalogue are never served. */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");
const { buildIbExclusions } = require("./physics-test-exclusions");
const { build: buildIbPhysicsMcq } = require("./build_ib_physics_mcq");
const { loadReviewedTopics, topicMemberships, publicTaxonomy } = require("./ib-reviewed-topics");
const {loadCurrentReviewAdditions}=require("./ib-current-review-additions");
const {loadA5AdditionalGeometry}=require("./ib-a5-additional-geometry");
const ROOT = path.resolve(__dirname, "..");
const PAPERDB = process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases";
const PREVIEWS = path.resolve(PAPERDB, "outputs/previews");
const unique = a => [...new Set(a.filter(Boolean))];
const sha = v => crypto.createHash("sha256").update(v).digest("hex");
const read = p => fs.readFileSync(p, "utf8");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
function ensure(ok, why) { if (!ok) throw new Error(why); }
function within(root, file) { const r = path.relative(root, file); return r && !r.startsWith("..") && !path.isAbsolute(r); }
function imagePath(preview, file, kind) {
  ensure(!/[\\/]/.test(preview) && !/[\\/]/.test(file), "Unexpected crop path");
  ensure(file.startsWith(kind + "_"), "Question / markscheme image kind mismatch");
  const p = path.resolve(PREVIEWS, preview, "crops", file);
  ensure(within(PREVIEWS, p) && fs.existsSync(p), "Missing source crop: " + p);
  return p;
}
function mergeIbSupplement(native, supplement) {
  const merged = new Map(native.map(q => [q.id, {...q, parts:[...q.parts]}]));
  for (const q of supplement) {
    // A retired D2 tag must never inherit an overlapping live topic's status.
    const parts = q.parts.filter(p => {
      const d2Assessed = (p.primary_codes || []).filter(code => /^D\.2(?:\.|$)/.test(code));
      return (p.spec_status || q.spec_status) !== "out" &&
        !(d2Assessed.length && d2Assessed.every(code => /^D\.2\.X(?:\.|$)/.test(code)));
    });
    if (!parts.length) continue;
    if (!merged.has(q.id)) { merged.set(q.id,{...q,parts}); continue; }
    const existing = merged.get(q.id);
    ensure(existing.preview === q.preview && existing.question === q.question, "IB supplemental parent identity conflict: " + q.id);
    const byPart = new Map(existing.parts.map(p => [p.part_id,p]));
    for (const p of parts) {
      const previous = byPart.get(p.part_id);
      if (!previous || previous.spec_status === "out") byPart.set(p.part_id,p);
      else {
        ensure(previous.source_part_id === p.source_part_id, "IB supplemental part identity conflict: " + p.part_id);
        byPart.set(p.part_id,{...previous,topic_codes:unique([...previous.topic_codes,...p.topic_codes]),
          spec_status:[previous.spec_status,p.spec_status].includes("unreviewed") ? "unreviewed" : previous.spec_status});
      }
    }
    existing.parts = [...byPart.values()];
    // Both sources use the same original whole-question regions. Combining
    // their filenames also lets the completeness check cover added parts.
    for (const key of ["crops","pages"]) existing[key] = unique([...(existing[key] || []),...(q[key] || [])]);
  }
  return [...merged.values()];
}
function validateIbDataSupplement(native, supplement) {
  const report = supplement && supplement.report;
  ensure(report && report.schema_version === 1 && report.topic_code === "DATA" && Array.isArray(report.source_files), "Historical DATA provenance is missing");
  ensure(report.builder && report.builder.path === "tools/build_ib_data_analysis.py" &&
    report.builder.sha256 === sha(fs.readFileSync(path.join(ROOT,report.builder.path))), "Rebuild historical DATA with the current builder");
  const required = ["Physics Categorisation/viewer/ibphysics_catalogue.js", "outputs/exports/ib_physics_archive_flat_v5.csv", "Physics Categorisation/viewer/build_catalogue.py"];
  ensure(required.every(relative => report.source_files.some(source => source.path === relative)), "Historical DATA source fingerprints are incomplete");
  for (const source of report.source_files) {
    const file = path.resolve(PAPERDB,source.path);
    ensure(within(path.resolve(PAPERDB),file) && fs.existsSync(file) && source.sha256 === sha(fs.readFileSync(file)), "Historical DATA source changed: " + source.path);
  }
  const isData = p => p.assessment_focus === "data_analysis" || (p.topic_codes || []).includes("DATA");
  const expected = native.filter(q => /^\d{4}$/.test(String(q.year)) && Number(q.year) >= 2004 && Number(q.year) < 2026 && q.parts.some(isData));
  ensure(expected.length && expected.every(q => q.parts.every(isData)), "Historical DATA contains a mixed-focus parent requiring review");
  // This supplement is a verified selection of existing native records. Exact
  // equality preserves all source holds, context and scheme metadata unchanged.
  ensure(JSON.stringify(expected) === JSON.stringify(supplement.questions), "Historical DATA records differ from the native catalogue; rebuild the supplement");
  return report;
}
function selectIbTopics(q, p, topics) {
  if (!/^\d{4}$/.test(String(q.year)) || Number(q.year) >= 2026) return [];
  const selected = (p.topic_codes || []).filter(t => t !== "1B" && topics[t] && (t !== "DATA" || Number(q.year) >= 2004));
  if (Number(q.year) >= 2004 && topics.DATA && (q.paper === "1B" || p.assessment_focus === "data_analysis" || q.assessment_focus === "data_analysis")) selected.push("DATA");
  return unique(selected);
}
function applyIbReviewedMetadata(record, reviewed) {
  const answer = reviewed.parts[record.source_part_id];
  if (answer) {
    ensure(answer.answer_status === "reviewed_source_key" && /^[ABCD]$/.test(answer.correct_option), "Reviewed MCQ answer is ambiguous");
    ensure(/^1A?$/.test(String(record.paper)) && record.marks === 1, "Reviewed MCQ metadata does not match its eligible record");
    record.correct_option = answer.correct_option;
    record.answer_status = answer.answer_status;
  }
  const correction = reviewed.presentation_corrections[record.source_part_id];
  if (correction) {
    const expected = correction.context_only_crop;
    const matches = record.question_images.filter(file => path.basename(file) === expected.filename && sha(fs.readFileSync(file)) === expected.sha256);
    ensure(matches.length === 1 && record.question_images.length > 1, "Reviewed context-only crop or complete current prompt is missing");
    const before = unique([...record.question_images, ...record.context_images, ...record.markscheme_images]).sort();
    record.question_images = record.question_images.filter(file => file !== matches[0]);
    record.context_images = unique([...record.context_images, matches[0]]);
    ensure(JSON.stringify(before) === JSON.stringify(unique([...record.question_images, ...record.context_images, ...record.markscheme_images]).sort()), "Context role correction changed source images");
  }
  return record;
}
function ibInput(options = {}) {
  const reviewedTopics = loadReviewedTopics(options.reviewedTopicPaths || []);
  const source = path.join(PAPERDB, "Physics Categorisation/viewer/ibphysics_catalogue.js");
  const text = read(source), box = {window:{}};
  vm.runInNewContext(text, box, {timeout:20000});
  let raw = box.window.IBPHYS_QUESTIONS;
  const sourceMeta = box.window.IBPHYS_META;
  ensure(Array.isArray(raw) && raw.length, "IB catalogue missing");
  const dataPath = path.join(ROOT,"dist/physics-inputs/ib-data-analysis.json");
  ensure(fs.existsSync(dataPath), "Build historical data analysis first: tools/build_ib_data_analysis.py");
  const dataSupplement = JSON.parse(read(dataPath));
  validateIbDataSupplement(raw,dataSupplement);
  const d2Path = path.join(ROOT,"dist/physics-inputs/ib-d2.json");
  const supplement = fs.existsSync(d2Path) ? JSON.parse(read(d2Path)) : null;
  if (supplement) {
    ensure(Array.isArray(supplement.questions) && supplement.questions.length, "D2 supplement has no native questions");
    raw = mergeIbSupplement(raw,supplement.questions);
  }
  const currentTests = path.join(ROOT,"dist/physics-audit/current-ib-tests.json");
  ensure(fs.existsSync(currentTests), "Read the current shared-drive tests first: tools/scan-current-ib-tests.py");
  const a5Tests = path.join(ROOT,"reports/ib-a5-reviewed-test-exclusions.json");
  ensure(fs.existsSync(a5Tests), "Review the A5 test definitions before rebuilding");
  // Crop availability can improve independently of the reviewed release scope.
  // Keep A5 within the already-reviewed candidates; every other gate still runs.
  const a5ReleaseReview = JSON.parse(read(a5Tests));
  ensure(a5ReleaseReview.schema_version === 1 && a5ReleaseReview.topic === "A.5" && Array.isArray(a5ReleaseReview.candidate_records), "Reviewed A5 release candidates are missing");
  const a5ServedCandidates = a5ReleaseReview.candidate_records.filter(record => record.reason === "served");
  ensure(a5ServedCandidates.length && a5ServedCandidates.every(record => typeof record.source_part_id === "string" && record.source_part_id.length), "Reviewed A5 release source identities are missing");
  const a5ReleaseSourceIds = new Set(a5ServedCandidates.map(record => record.source_part_id));
  const currentAdditions=loadCurrentReviewAdditions();
  const exclusion = buildIbExclusions({paperdbRoot:PAPERDB, questions:raw,extraExclusionsPath:currentTests,extraExclusionsPaths:[a5Tests,...currentAdditions.paths, ...(options.extraExclusionsPaths || [])]});
  const cropReviewPath = path.join(ROOT,"reports/ib-reviewed-crop-exclusions.json");
  const cropReview = JSON.parse(read(cropReviewPath));
  ensure(cropReview.schema_version === 1 && exclusion.report.sourceFiles.some(s=>s.path === "outputs/exports/ib_physics_archive_flat_v5.csv" && s.sha256 === cropReview.corpus_sha256), "IB crop review does not match the current source corpus");
  const incompleteCrops = new Set(cropReview.source_part_ids), omittedImages = new Set(cropReview.suppressed_image_sha256s);
  const analysisPath = path.join(ROOT,"dist/physics-inputs/ib-a5-analysis.json");
  const analysis = JSON.parse(read(analysisPath));
  ensure(analysis.schema_version === 1 && analysis.topic === "A.5" && analysis.groups.length === 14, "Build the reviewed A5 analysis first");
  for (const file of [...analysis.report.source_files,analysis.report.builder]) {
    ensure(fs.existsSync(file.path) && sha(fs.readFileSync(file.path)) === file.sha256, "A5 analysis source changed: " + file.path);
  }
  const mcqPath = path.join(ROOT,"dist/physics-inputs/ib-physics-mcq.json");
  ensure(fs.existsSync(mcqPath), "Build the visually reviewed MCQ metadata first: tools/build_ib_physics_mcq.js");
  const mcq = JSON.parse(read(mcqPath));
  ensure(mcq.schema_version === 1 && mcq.course === "ib" && mcq.parts && mcq.presentation_corrections && mcq.report, "Reviewed IB MCQ input schema is missing");
  // Reproduce the projection from fingerprinted PDFs, crop images, original
  // scheme entries, the current catalogue and the checked-in visual review.
  // This input supplies metadata only; every eligibility gate below still runs.
  ensure(JSON.stringify(mcq) === JSON.stringify(buildIbPhysicsMcq({paperdbRoot:PAPERDB})), "Reviewed IB MCQ input differs from its verified sources; rebuild it");
  const groupCodes = new Set(analysis.groups.map(g=>g.code));
  const topics = {"A.1":"Kinematics", "A.5":"Galilean and special relativity", "E.1":"Structure of the atom", "E.2":"Quantum physics", ...(supplement ? {"D.2":"Electric and magnetic fields"} : {}), "DATA":"Data analysis and experimental method"};
  for (const topic of reviewedTopics) topics[topic.topic] = topic.label;
  const pageNo = f => (/_p(\d+)(?:_|\.)/.exec(f) || [])[1];
  const blockedPages = new Set([...exclusion.blockedQuestionPageKeys].map(key => key.split("/")[0] + "/" + pageNo(key)));
  const a5Geometry=loadA5AdditionalGeometry();
  const questions = [], withheld = [];
  for (const q of raw) {
    if (!/^\d{4}$/.test(String(q.year)) || Number(q.year) >= 2026) continue;
    if (exclusion.blockedParentIds.has(q.id)) continue;
    if (a5Geometry.heldParentIds.has(q.id)) {
      withheld.push({id:q.id,reason:"Reviewed A5 crop geometry or content requires correction"}); continue;
    }
    if ((q.parts || []).some(p=>incompleteCrops.has(p.source_part_id))) {
      withheld.push({id:q.id,reason:"printed question or answer-choice crop is incomplete"}); continue;
    }
    if (unique([...(q.pages || []), ...(q.crops || []), ...(q.parts || []).flatMap(p => p.crops || [])]).some(f => blockedPages.has(q.preview + "/" + pageNo(f)))) {
      withheld.push({id:q.id,reason:"shares a question page with reserved test content"}); continue;
    }
    for (const p of q.parts || []) {
      let selected = selectIbTopics(q,p,topics);
      for (const topic of reviewedTopics) {
        const review = topic.parts[p.source_part_id];
        selected = selected.filter(code => code !== topic.topic);
        if (review?.status === "included") selected.push(topic.topic);
        else if ((p.topic_codes || []).includes(topic.topic)) withheld.push({id:p.part_id,source_part_id:p.source_part_id,topic:topic.topic,reason:"Reviewed topic scope: " + (review?.reason || review?.status || "unmapped")});
      }
      if (!selected.length) continue;
      if (exclusion.blockedSourceIds.has(p.source_part_id) || exclusion.blockedGroups.has(p.cross_level_group_id)) throw new Error("Reserved part survived parent exclusion");
      if ((p.spec_status || q.spec_status) === "out") { withheld.push({id:p.part_id,reason:"outside current syllabus"}); continue; }
      const a5 = analysis.parts[p.source_part_id];
      if (selected.includes("A.5") && (!a5 || a5.status !== "included")) {
        withheld.push({id:p.part_id,source_part_id:p.source_part_id,topic:"A.5",reason:"A5 scope: " + (a5 ? a5.status + ": " + a5.reason : "unmapped")});
        selected = selected.filter(t=>t !== "A.5");
      }
      if (selected.includes("A.5") && !a5ReleaseSourceIds.has(p.source_part_id)) {
        withheld.push({id:p.part_id,source_part_id:p.source_part_id,topic:"A.5",reason:"A5 reviewed release scope pending"});
        selected = selected.filter(t=>t !== "A.5");
      }
      if (!selected.length) continue;
      const analysisGroups = selected.includes("A.5") ? unique(a5.group_codes) : [];
      ensure(!selected.includes("A.5") || analysisGroups.length && analysisGroups.every(code=>groupCodes.has(code)), "A5 part lacks a reviewed group");
      const structured = !/^1A?$/.test(q.paper);
      // Context must contain all the selected part's question pages. If it does
      // not, withhold the question instead of silently falling back to a page
      // that can contain an adjacent assessment question.
      const nativeCrops = unique(q.crops || []);
      const covered = new Set(nativeCrops.map(pageNo));
      if (!(p.crops || []).length || (structured && (!nativeCrops.length || !(p.pages || []).every(f => covered.has(pageNo(f)))))) {
        withheld.push({id:p.part_id,reason:"no complete cropped question context"}); continue;
      }
      if (!(p.ms_crops || []).length) { withheld.push({id:p.part_id,reason:"no cropped markscheme"}); continue; }
      const ownImages = unique(p.crops).map(f => imagePath(q.preview, f, "question")).filter(file=>!omittedImages.has(sha(fs.readFileSync(file))));
      if (!ownImages.length) { withheld.push({id:p.part_id,reason:"no question image after removing reviewed non-question crops"}); continue; }
      const context = structured ? nativeCrops.map(f => imagePath(q.preview, f, "question")) : [];
      const m = Number(p.marks);
      const record = applyIbReviewedMetadata({id:p.part_id, parent_id:q.id, source_part_id:p.source_part_id,
        source_group_id:p.cross_level_group_id || "", topic_codes:selected, analysis_groups:analysisGroups,
        analysis_atoms:selected.includes("A.5") ? a5.atom_codes : [],
        analysis_used_atoms:selected.includes("A.5") ? a5.used_atom_codes : [],
        analysis_optional_atoms:selected.includes("A.5") ? a5.optional_atom_codes : [],
        analysis_types:selected.includes("A.5") ? a5.type_codes : [],
        analysis_primary_atom:selected.includes("A.5") ? a5.primary_atom_code : null,
        analysis_canonical_id:selected.includes("A.5") && a5.canonical_row_ids.length === 1 ? analysis.reviewed_question_types.canonical_namespace + ":" + a5.canonical_row_ids[0] : null,
        analysis_canonical_ids:selected.includes("A.5") ? a5.canonical_row_ids.map(id=>analysis.reviewed_question_types.canonical_namespace + ":" + id) : [],
        year:String(q.year), paper:q.paper, level:q.level,
        question_number:q.question, label:p.label === q.question ? "" : p.label,
        marks:Number.isInteger(m) && m > 0 ? m : null,
        question_images:ownImages, context_images:context, markscheme_images:unique(p.ms_crops).map(f => imagePath(q.preview, f, "mark")),
        question_text:"", markscheme_text:"", source_label:[q.session,q.year,q.time_zone,q.level,"Paper " + q.paper].filter(Boolean).join(" · "),
        source_notice:selected.includes("A.5") ? "Earlier papers use their original marking conventions." : (p.spec_status || q.spec_status) === "unreviewed" ? "Earlier paper: syllabus fit is provisional. Use the original marking conventions." : ""}, mcq);
      if (reviewedTopics.some(topic => selected.includes(topic.topic))) {
        const memberships = topicMemberships(p.source_part_id, selected, reviewedTopics);
        for (const field of ["analysis_groups", "analysis_atoms", "analysis_types", "analysis_used_atoms", "analysis_optional_atoms", "analysis_canonical_ids"]) record[field] = unique([...record[field], ...memberships[field]]);
        record.current_topic_levels = memberships.current_topic_levels;
      }
      questions.push(a5Geometry.projectQuestion(record));
    }
  }
  return {meta:{course:"ib",title:"IB Physics",topics,classification_status:sourceMeta.classification_status,
    analysis:{topic:"A.5",groups:[...analysis.groups.map(({code,label,summary,checks})=>({code,label,summary,checks})), ...reviewedTopics.flatMap(topic=>publicTaxonomy(topic.groups))],
      atoms:[...analysis.reviewed_question_types.atoms, ...reviewedTopics.flatMap(topic=>publicTaxonomy(topic.atoms))],types:[...analysis.reviewed_question_types.types, ...reviewedTopics.flatMap(topic=>publicTaxonomy(topic.types))],
      registry_sha256:analysis.reviewed_question_types.registry_sha256},
    exclusion_review_complete:false,preview_notice:"Teacher preview. Known and possible test matches are excluded; the additional test collection still needs checking."},
    questions,report:{...exclusion.report,a5_additional_geometry:{path:a5Geometry.path,held_parent_ids:[...a5Geometry.heldParentIds],fingerprints:a5Geometry.fingerprints},reviewed_topics:reviewedTopics.map(topic=>({topic:topic.topic,path:topic.input_path,sha256:topic.input_sha256,report:topic.report})),catalogue:{path:source,sha256:sha(text)},a5_analysis:{path:analysisPath,sha256:sha(read(analysisPath)),report:analysis.report},mcq_metadata:{path:mcqPath,sha256:sha(read(mcqPath)),report:mcq.report,presentation_corrections:mcq.presentation_corrections},crop_review:{path:cropReviewPath,sha256:sha(read(cropReviewPath)),source_part_ids:cropReview.source_part_ids,suppressed_image_sha256s:cropReview.suppressed_image_sha256s},d2_supplement:supplement ? {path:d2Path,sha256:sha(read(d2Path)),report:supplement.report} : null,data_analysis_supplement:{path:dataPath,sha256:sha(read(dataPath)),report:dataSupplement.report},withheld,requested_unavailable:supplement ? [] : ["D.2"],
    limitation:"Current shared-drive tests have been compared. Unmatched or image-only test fragments remain; this is not cleared for pupil release."}};
}
function questionCounts(questions, topic) {
  const selected = topic ? questions.filter(q=>q.topic_codes.includes(topic)) : questions;
  const partIds = q => topic && q.topic_part_ids ? q.topic_part_ids[topic] || [] : q.part_ids || [q.source_part_id || q.id];
  return {records:selected.length, parents:new Set(selected.map(q=>q.parent_id)).size,
    parts:new Set(selected.flatMap(partIds)).size,
    printed_parts:new Set(selected.flatMap(q=>q.part_ids || [q.source_part_id || q.id])).size};
}
function coursePage(meta, questions) {
  return '<section><h2>'+esc(meta.title)+'</h2><div class="topics">'+Object.entries(meta.topics).map(([code,label])=> {
    const count=questionCounts(questions,code);
    const description = meta.course === "ib"
      ? count.parts+' parts'
      : count.parents+' question sets · '+count.parts+(meta.course === "trilogy" ? ' topic parts' : ' assessed parts');
    const displayLabel = meta.course === "ib" && /^[A-E]\.\d+$/.test(code) ? code.replace(".","")+' '+label : label;
    return count.records ? '<a href="'+esc(meta.course)+'/index.html?topic='+encodeURIComponent(code)+'"><strong>'+esc(displayLabel)+'</strong><span>'+description+'</span></a>' : '';
  }).join('')+'</div></section>';
}
function assemble() {
  const inputs = [ibInput()];
  const trilogy = path.join(ROOT,"dist/physics-inputs/trilogy.json");
  if (fs.existsSync(trilogy)) {
    const input = JSON.parse(read(trilogy));
    for (const relative of ["dist/physics-inputs/trilogy-test-exclusions.json","reports/trilogy-reviewed-test-exclusions.json"]) {
      const file = path.join(ROOT,relative), digest = sha(fs.readFileSync(file));
      ensure((input.report.known_exclusions || []).some(e=>e.source && path.resolve(e.source) === file && e.sha256 === digest), "Rebuild Trilogy with its current test reservations before assembly: " + relative);
    }
    const cropRules = path.join(ROOT,"reports/trilogy-reviewed-crop-rules.json");
    ensure(input.report.crop_review && input.report.crop_review.sha256 === sha(fs.readFileSync(cropRules)),
      "Rebuild Trilogy with the current reviewed crop corrections");
    const identityRules = path.join(ROOT,"reports/trilogy-reviewed-part-identities.json");
    ensure(input.report.part_identity_review && input.report.part_identity_review.sha256 === sha(fs.readFileSync(identityRules)),
      "Rebuild Trilogy with the current reviewed part identities");
    inputs.push(input);
  }
  const preib = path.join(ROOT,"dist/physics-inputs/preib.json");
  if (fs.existsSync(preib)) {
    const input = JSON.parse(read(preib));
    ensure(input.report.test_sources && input.report.test_sources.length > 0 && input.report.test_sources.every(test => test.sha256 && !test.error), "Read the current Pre-IB test before adding its practice collection");
    inputs.push(input);
  }
  // Apply the global mock reservation before counts, links or asset copying.
  // Specimens require an explicit year in their provenance, just like papers.
  inputs.forEach(input => {
    const allowed = q => /^\d{4}$/.test(String(q.year)) && Number(q.year) < 2026;
    input.report.mock_year_withheld = input.questions.filter(q => !allowed(q)).map(q => q.id);
    input.questions = input.questions.filter(allowed);
    ensure(input.questions.length > 0, "No dated pre-2026 questions in " + input.meta.course);
    input.meta.preview_notice = input.meta.exclusion_review_complete
      ? "Teacher preview. 2026 papers are reserved for mocks. This collection has been checked against the current PDF and Word assessments."
      : "Teacher preview. 2026 papers are reserved for mocks. Test matching is conservative and still has unresolved items; pupil release is not yet cleared.";
  });
  ensure(inputs.reduce((n,i)=>n+Object.keys(i.meta.topics).filter(t=>i.questions.some(q=>q.topic_codes.includes(t))).length,0)>=4,
    "Fewer than four requested areas remain after exclusions");
  const shared = ["engine/ppqviewer.js","engine/ppqviewer.css","example/physics.html","example/physics-config.js","example/physics-identity.js","example/physics-login.js",
    "tools/assemble_physics_preview.js","tools/physics-test-exclusions.js","tools/build_trilogy_physics.py","tools/trilogy_reviewed_topics.py","tools/build_ib_d2.py","tools/build_ib_data_analysis.py","tools/build_preib_physics.py"];
  const assetPaths = unique(inputs.flatMap(i=>i.questions.flatMap(q=>[...q.question_images,...(q.context_images||[]),...q.markscheme_images]))).sort();
  const assetHashes = assetPaths.map(p=>[p,sha(fs.readFileSync(p))]);
  shared.push("example/physics-reporting.js");
  const buildId = sha(JSON.stringify(inputs) + JSON.stringify(assetHashes) + shared.map(f=>sha(fs.readFileSync(path.join(ROOT,f)))).join("|")).slice(0,16);
  const out = path.join(ROOT,"dist/physics-preview",buildId + "-" + Date.now());
  // Each changed build gets a fresh folder: obsolete reserved assets cannot
  // survive a refresh of an earlier, broader selection.
  fs.mkdirSync(out,{recursive:true});
  const courses = [];
  for (const input of inputs) {
    const meta = input.meta;
    ensure(["ib","trilogy","preib"].includes(meta.course), "Unknown course");
    ensure(input.questions.length > 0, "Empty course");
    const dest = path.join(out,meta.course), assets = new Map();
    fs.mkdirSync(path.join(dest,"data"),{recursive:true});
    const generatedAssets = path.join(ROOT,"dist/physics-inputs",meta.course + "-assets");
    const imageUrl = source => {
      const abs = path.resolve(source);
      ensure(((within(PREVIEWS,abs) && /[\\/]crops[\\/]/.test(abs)) || (["trilogy","preib"].includes(meta.course) && within(generatedAssets,abs))) && /\.png$/i.test(abs), "Only source question crops may be served: " + abs);
      ensure(fs.statSync(abs).isFile(), "Source crop missing");
      if (!assets.has(abs)) {
        const bytes=fs.readFileSync(abs), url="assets/" + sha(bytes) + ".png";
        assets.set(abs,{url,bytes});
      }
      return assets.get(abs).url;
    };
    const questions=input.questions.map(q=>({...q,question_images:q.question_images.map(imageUrl),context_images:(q.context_images||[]).map(imageUrl),markscheme_images:q.markscheme_images.map(imageUrl)}));
    fs.mkdirSync(path.join(dest,"assets"),{recursive:true});
    for (const {url,bytes} of assets.values()) fs.writeFileSync(path.join(dest,url),bytes);
    fs.mkdirSync(path.join(dest,"engine"),{recursive:true});
    for (const f of ["ppqviewer.js","ppqviewer.css"]) fs.copyFileSync(path.join(ROOT,"engine",f),path.join(dest,"engine",f));
    fs.copyFileSync(path.join(ROOT,"example/physics.html"),path.join(dest,"index.html"));
    fs.copyFileSync(path.join(ROOT,"example/physics-config.js"),path.join(dest,"physics-config.js"));
    for (const name of ["physics-identity.js","physics-login.js","physics-reporting.js"]) fs.copyFileSync(path.join(ROOT,"example",name),path.join(dest,name));
    fs.writeFileSync(path.join(dest,"data/physics_catalogue.js"),"window.PHYSICS_META="+JSON.stringify(meta)+";\nwindow.PHYSICS_QUESTIONS="+JSON.stringify(questions)+";\n");
    courses.push({course:meta.course,title:meta.title,...questionCounts(questions),
      topics:Object.fromEntries(Object.keys(meta.topics).map(t=>[t,questions.filter(q=>q.topic_codes.includes(t)).length])),
      topic_counts:Object.fromEntries(Object.keys(meta.topics).map(t=>[t,questionCounts(questions,t)])),
      assets:assets.size,exclusion_review_complete:meta.exclusion_review_complete === true});
  }
  const missing = [!inputs.some(i=>i.meta.course === "ib" && i.questions.some(q=>q.topic_codes.includes("D.2"))) && "IB D2", !inputs.some(i=>i.meta.course === "preib") && "pre-IB forces"].filter(Boolean);
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Physics past-paper practice</title><style>body{margin:0;background:#f4f6f8;color:#182a37;font:17px/1.5 system-ui,sans-serif}main{max-width:1000px;margin:auto;padding:36px 24px}h1{font-size:2.1rem;line-height:1.15}.note{padding:16px 20px;background:#fff1cd;border-left:4px solid #b17a12;border-radius:8px}section{margin-top:32px}.topics{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}.topics a{display:block;border:1px solid #d2dde5;border-radius:12px;background:white;padding:22px;color:#174e67;text-decoration:none}.topics a:hover{border-color:#267b9a}.topics span{display:block;font-size:.9rem;margin-top:6px;color:#51616c}footer{margin-top:34px;font-size:.9rem;color:#52616c}</style></head><body><main><p>PAST-PAPER QUESTION VIEWER</p><h1>Physics past-paper practice</h1><p>Choose a course and topic. Work from the printed question, reveal its markscheme, and keep track of your practice.</p>'+inputs.map(i=>coursePage(i.meta,i.questions)).join('')+'<footer>'+(missing.length ? 'Still to connect: '+missing.map(esc).join(' and ')+'. ' : '')+'All courses use the shared viewer. Progress is saved in this browser.<br>Build '+buildId+'</footer></main></body></html>';
  fs.writeFileSync(path.join(out,"index.html"),html);
  const info={build_id:buildId,built_at:new Date().toISOString(),root:out,courses,pupil_release_ready:false};
  fs.writeFileSync(path.join(out,"build-info.json"),JSON.stringify(info,null,2));
  const audit=path.join(ROOT,"dist/physics-audit"); fs.mkdirSync(audit,{recursive:true});
  fs.writeFileSync(path.join(audit,buildId+".json"),JSON.stringify({build:info,inputs:inputs.map(i=>({course:i.meta.course,report:i.report})),asset_policy:"Crops only. No whole exam pages, PDFs, source test workbooks or unfiltered catalogues."},null,2));
  fs.writeFileSync(path.join(ROOT,"dist/physics-preview/latest.json"),JSON.stringify(info,null,2));
  console.log(JSON.stringify(info,null,2));
}
if (require.main===module) assemble();
module.exports={ibInput,assemble,mergeIbSupplement,selectIbTopics,validateIbDataSupplement,applyIbReviewedMetadata};
