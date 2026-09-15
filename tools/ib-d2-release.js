"use strict";
// D2-only release preparation. No active catalogue, source database or public
// site is modified. A complete fixed-scope assessment review is mandatory.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const {parseCsv, buildIbExclusions} = require("./physics-test-exclusions");
const {build: buildRecovery, identities, sourceHoldClosure} = require("./build_ib_d2_recovery");
const {loadCurrentReviewAdditions}=require("./ib-current-review-additions");
const ROOT = path.resolve(__dirname, ".."), DB = path.resolve(process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases");
const inputPath = path.join(ROOT, "dist/physics-inputs/ib-d2-recovered.json");
const assessmentPath = path.join(ROOT, "reports/ib-d2-reviewed-test-exclusions.json");
const scopePath = path.join(ROOT, "reports/ib-d2-reviewed-scope-holds.json");
const clearancePath = path.join(ROOT, "reports/ib-d2-release-clearance.json");
const presentationPath=path.join(ROOT,"reports/ib-d2-reviewed-presentation.json");
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const unique = values => [...new Set(values.filter(Boolean))];
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const same = (a,b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const imageFields = ["question_images", "context_images", "markscheme_images"];
const pageNo = file => Number((/_p(\d+)(?:_|\.)/.exec(file) || [])[1]);
function validRegion(region) {
  return Number.isInteger(region?.page_number) && region.page_number > 0 && Array.isArray(region.bbox) && region.bbox.length === 4 &&
    region.bbox.every(Number.isFinite) && region.bbox[0] >= 0 && region.bbox[1] >= 0 && region.bbox[2] > region.bbox[0] && region.bbox[3] > region.bbox[1];
}
function overlaps(a,b) {
  return a.page_number === b.page_number && Math.min(a.bbox[2], b.bbox[2]) > Math.max(a.bbox[0], b.bbox[0]) &&
    Math.min(a.bbox[3], b.bbox[3]) > Math.max(a.bbox[1], b.bbox[1]);
}
function ownedCrop(entries, row, role, basename) {
  const matches=entries.filter(entry=>(entry.crop_image_paths || []).some(name=>path.basename(name)===basename));
  ensure(matches.length===1,"D2 crop attribution is absent or ambiguous");
  const entry=matches[0]; ensure(entry.owner_question===row.question,"D2 crop belongs to another question");
  ensure(role === "context" ? entry.whole_parent === true : entry.part_label === row.part_label,"D2 crop belongs to another part or role");
  ensure(entry.crop_regions?.length===entry.crop_image_paths.length && entry.crop_regions.every(validRegion),"D2 crop lacks one valid original rectangle per image");
  const index=entry.crop_image_paths.findIndex(name=>path.basename(name)===basename), region=entry.crop_regions[index];
  ensure(region.page_number===pageNo(basename),"D2 crop filename/source rectangle page differs");
  return {entry,region};
}
function validateAssessment(assessment, input, hash) {
  ensure(assessment.schema_version === 1 && assessment.topic === "D.2" && assessment.review_complete === true &&
    Array.isArray(assessment.unresolved_relevant_items) && assessment.unresolved_relevant_items.length === 0, "D2 assessment review is incomplete");
  ensure(Array.isArray(assessment.reviewed_candidate_source_ids) && same(assessment.reviewed_candidate_source_ids, input.report.candidate_source_ids) &&
    new Set(assessment.reviewed_candidate_source_ids).size === input.report.candidate_source_ids.length, "D2 assessment did not review the exact fixed candidate scope");
  ensure(path.resolve(assessment.reviewed_candidate_file || "") === inputPath && assessment.reviewed_candidate_sha256 === hash, "D2 assessment candidate input changed");
  ensure(Array.isArray(assessment.blocked_source_ids) && Array.isArray(assessment.source_files) && assessment.source_files.length, "D2 assessment source evidence is missing");
  ensure(!assessment.read_failures?.length, "D2 assessment includes unreadable sources");
}
function publicTaxonomy(input) {
  const project = item => ({code:item.code, topic:"D.2", label:item.label, ...(item.local_code ? {display_code:item.local_code} : {}),
    ...(item.summary ? {summary:item.summary} : {}), checks:item.checks || []});
  return {groups:input.groups.map(project), atoms:input.atoms.map(project), types:[]};
}
function applyReviewedPresentation(records,review,readFile=fs.readFileSync){
  ensure(review.schema_version===1&&review.topic==="D.2"&&review.review_complete===true&&Array.isArray(review.unresolved_relevant_items)&&!review.unresolved_relevant_items.length,"D2 presentation review is incomplete");
  ensure(Array.isArray(review.suppressed_assets)&&Array.isArray(review.required_assets),"D2 presentation asset decisions are missing");
  const result=records.map(record=>({...record,markscheme_images:[...record.markscheme_images]}));
  const byId=new Map(result.map(record=>[record.source_part_id,record])),seen=new Set();
  for(const asset of review.suppressed_assets){
    const record=byId.get(asset.source_part_id),file=path.resolve(asset.path),key=asset.source_part_id+":"+file;
    ensure(record&&record.parent_id===asset.parent_id&&asset.role==="markscheme"&&asset.remaining_answer_complete===true,"D2 suppression lacks a complete retained-answer review");
    ensure(!seen.has(key)&&record.markscheme_images.includes(file),"D2 suppression is repeated or not assigned to this part");seen.add(key);
    ensure(sha(readFile(file))===asset.sha256,"D2 suppressed asset changed");
    ensure(review.required_assets.some(required=>required.source_part_id===asset.source_part_id&&required.parent_id===asset.parent_id&&required.role==="markscheme"),"D2 suppression lacks its required answer image");
    record.markscheme_images=record.markscheme_images.filter(image=>image!==file);
    ensure(record.markscheme_images.length,"D2 suppression removed the entire markscheme");
  }
  for(const asset of review.required_assets){
    const record=byId.get(asset.source_part_id),file=path.resolve(asset.path);
    ensure(record&&record.parent_id===asset.parent_id&&asset.role==="markscheme"&&record.markscheme_images.includes(file),"A required complete D2 answer image was removed");
    ensure(sha(readFile(file))===asset.sha256,"D2 retained answer image changed");
  }
  return result;
}
function project(input, db = DB) {
  const atoms = new Map(input.atoms.map(atom => [atom.code, atom]));
  const image = (parent, file) => {
    ensure(typeof file === "string" && file === path.basename(file) && /^(question|mark)_.*\.png$/.test(file), "D2 crop filename is invalid");
    return path.join(db, "outputs/previews", parent.preview, "crops", file);
  };
  return input.questions.flatMap(parent => parent.parts.map(part => {
    const membership = input.parts[part.source_part_id];
    ensure(membership?.status === "included" && membership.assessment_focus !== "data_analysis", "D2 projection lacks ordinary authored membership");
    const levelTexts = membership.atom_codes.map(code => atoms.get(code)?.current_level_source);
    ensure(levelTexts.length && levelTexts.every(level => ["HL", "SL + HL"].includes(level)), "D2 authored current level is unrecognized");
    // A part containing any explicitly HL operation requires HL; original
    // printed-paper level is retained separately and does not decide this.
    const currentLevel = levelTexts.includes("HL") ? "HL" : "HLSL";
    return {id:part.part_id, parent_id:parent.id, source_part_id:part.source_part_id, source_group_id:part.cross_level_group_id || "", topic_codes:["D.2"],
      analysis_groups:[...membership.group_codes], analysis_atoms:[...membership.atom_codes], analysis_types:[], analysis_used_atoms:[], analysis_optional_atoms:[], analysis_canonical_ids:[],
      current_topic_levels:{"D.2":currentLevel}, year:String(parent.year), paper:parent.paper, level:parent.level, question_number:parent.question,
      label:part.label === parent.question ? "" : part.label, marks:Number.isInteger(part.marks) && part.marks > 0 ? part.marks : null,
      question_images:unique(part.crops).map(file=>image(parent,file)), context_images:/^1A?$/.test(parent.paper) ? [] : unique(parent.crops).map(file=>image(parent,file)),
      markscheme_images:unique(part.ms_crops).map(file=>image(parent,file)), question_text:"", markscheme_text:"",
      source_label:[parent.session,parent.year,parent.time_zone,parent.level,"Paper " + parent.paper].filter(Boolean).join(" · "), source_notice:""};
  }));
}

function buildCandidateClearance(options = {}) {
  const requireAssessment = options.requireAssessment !== false, files = new Map(), cache = new Map();
  function read(file, expected) {
    file = path.resolve(file); const value = fs.readFileSync(file), hash = sha(value), previous = files.get(file);
    ensure(!expected || hash === expected, "D2 evidence changed: " + file);
    ensure(!previous || previous.sha256 === hash, "D2 source changed during audit: " + file);
    files.set(file, {path:file,sha256:hash}); return value;
  }
  const json = file => JSON.parse(read(file).toString("utf8").replace(/^\uFEFF/, ""));
  const metadata = (preview, kind) => {
    const file = path.join(DB,"outputs/previews",preview,kind + "_preview.json");
    if (!cache.has(file)) cache.set(file,json(file)); return cache.get(file);
  };
  const input = json(inputPath), inputHash = files.get(inputPath).sha256;
  ensure(JSON.stringify(input) === JSON.stringify(buildRecovery()), "D2 recovery input no longer reproduces from its source fingerprints");
  [...input.report.source_files,input.report.builder].forEach(file=>read(file.path,file.sha256));
  const corpusPath = path.join(DB,"outputs/exports/ib_physics_archive_flat_v5.csv"), corpus = parseCsv(read(corpusPath).toString("utf8"));
  const byId = new Map(corpus.map(row=>[row.part_id,row])), parents = new Map(input.questions.map(parent=>[parent.id,parent]));
  let assessment = null;
  const assessedFile = path.resolve(options.assessmentPath || assessmentPath);
  if (fs.existsSync(assessedFile)) {
    assessment = json(assessedFile);
    validateAssessment(assessment,input,inputHash);
    ensure(assessment.corpus_sha256 === files.get(corpusPath).sha256,"D2 assessment archive changed");
    assessment.source_files.forEach(file=>read(path.isAbsolute(file.path)?file.path:path.join(DB,file.path),file.sha256));
  } else ensure(!requireAssessment,"D2 current assessment report is missing");
  const scopes = json(scopePath);
  ensure(scopes.schema_version === 1 && scopes.topic === "D.2" && scopes.review_complete === true && scopes.corpus_sha256 === files.get(corpusPath).sha256,"D2 current-scope holds lack source evidence");
  scopes.source_files.forEach(file=>read(file.path,file.sha256));
  const scopeHolds = sourceHoldClosure(corpus,scopes.blocked_source_ids);
  const exclusions = ["dist/physics-audit/current-ib-tests.json","reports/ib-a5-reviewed-test-exclusions.json","reports/ib-a1-c1-reviewed-test-exclusions.json"].map(file=>path.join(ROOT,file));
  if (assessment) exclusions.push(assessedFile);
  if(requireAssessment){
    const additional=loadCurrentReviewAdditions();
    additional.fingerprints.forEach(file=>read(file.path,file.sha256));
    exclusions.push(...additional.paths);
  }
  const closure = buildIbExclusions({paperdbRoot:DB,questions:input.questions,extraExclusionsPaths:exclusions});
  closure.report.sourceFiles.forEach(file=>read(path.isAbsolute(file.path)?file.path:path.join(DB,file.path),file.sha256));
  const heldQuestions = new Set(corpus.filter(row=>closure.blockedSourceIds.has(row.part_id)).map(row=>row.preview + "/" + row.question));
  const heldPages = new Set([...closure.blockedQuestionPageKeys].map(file=>file.split("/")[0] + "/" + pageNo(file)));
  const presentation=json(presentationPath);
  ensure(Array.isArray(presentation.source_files)&&presentation.source_files.length,"D2 presentation evidence is missing");
  presentation.source_files.forEach(file=>read(file.path,file.sha256));
  const projected = applyReviewedPresentation(project(input),presentation,read), heldParents = new Set(), failures = [], assets = [], originals = [], mcq = [], mcqFindings = [];
  function hold(record,reason,detail={}) { heldParents.add(record.parent_id); failures.push({source_part_id:record.source_part_id,parent_id:record.parent_id,reason,...detail}); }
  function bindOriginals(row) {
    for (const [kind,column,type] of [["question","question_source","question_paper"],["mark_scheme","mark_scheme_source","mark_scheme"]]) {
      const meta = metadata(row.preview,kind), source = meta.source;
      ensure(source?.relative_path === row[column] && source.document_type === type && source.subject === "Physics","D2 original PDF attribution differs");
      for (const [key,field] of [["year","year"],["series","session"],["level","level"],["time_zone","time_zone"],["paper","paper"],["paper_variant","paper_variant"]])
        ensure(String(source[key] ?? "") === row[field], "D2 original PDF " + key + " differs");
      ensure(!path.isAbsolute(row[column]) && !row[column].split(/[\\/]/).includes("..") && /\.pdf$/i.test(row[column]),"D2 original PDF path is unsafe");
      const filename = path.join(DB,row[column]); ensure(read(filename).subarray(0,5).toString() === "%PDF-","D2 original PDF header is missing");
      originals.push({source_part_id:row.part_id,role:kind,...files.get(filename),metadata_path:path.join(DB,"outputs/previews",row.preview,kind+"_preview.json")});
    }
  }
  for (const record of projected) {
    const parent = parents.get(record.parent_id), part = parent.parts.find(part=>part.source_part_id===record.source_part_id), row = byId.get(record.source_part_id);
    try {
      ensure(row && identities(row).parent===parent.id && identities(row).part===record.id,"D2 native source identity differs");
      ensure(Number(row.year)>=2004 && Number(row.year)<2026,"D2 source-year embargo");
      ensure(!scopeHolds.has(row.part_id),"Reviewed mixed or retired demanded operation remains held");
      ensure(!closure.blockedParentIds.has(parent.id) && !closure.blockedSourceIds.has(row.part_id),"Current assessment whole-parent/twin/duplicate hold");
      ensure(![...parent.pages,...parent.crops,...parent.parts.flatMap(part=>part.crops)].some(file=>heldPages.has(parent.preview+"/"+pageNo(file))),"Question/context shares a reserved source page");
      const qp = metadata(parent.preview,"question"), groups = qp.question_groups.filter(group=>String(group.question_number)===row.question);
      ensure(groups.length===1,"Original D2 whole-question entry is missing or ambiguous");
      const ownParts = groups[0].parts.filter(entry=>entry.part_label===row.part_label);
      ensure(ownParts.length===1,"Original D2 focused part entry is missing or ambiguous");
      ensure(same(part.crops,ownParts[0].crop_image_paths.map(file=>path.basename(file))),"D2 focused question crop assignment differs from original part");
      if (!/^1A?$/.test(parent.paper)) {
        ensure(parent.crops.length && same(parent.crops,groups[0].crop_image_paths.map(file=>path.basename(file))),"D2 complete context assignment differs");
        const covered = new Set(parent.crops.map(pageNo)); ensure(part.pages.every(file=>covered.has(pageNo(file))),"D2 context does not cover all focused part pages");
      }
      bindOriginals(row);
    } catch(error) { hold(record,error.message); continue; }
    for (const field of imageFields) for (const file of record[field]) {
      const role = field === "markscheme_images" ? "markscheme" : field === "context_images" ? "context" : "question";
      try {
        const basename = path.basename(file), kind = role === "markscheme" ? "mark_scheme" : "question", meta = metadata(parent.preview,kind);
        ensure(path.resolve(file)===path.join(DB,"outputs/previews",parent.preview,"crops",basename),"D2 image is outside its source crop folder");
        const entries = role === "markscheme" ? meta.entries.map(entry=>({...entry,owner_question:String(entry.question_number)})) :
          meta.question_groups.flatMap(group=>[{...group,owner_question:String(group.question_number),whole_parent:true},...group.parts.map(entry=>({...entry,owner_question:String(group.question_number)}))]);
        const {entry,region}=ownedCrop(entries,row,role,basename);
        const reserved = entries.filter(other=>heldQuestions.has(parent.preview+"/"+other.owner_question));
        ensure(reserved.every(other=>other.crop_regions?.length && other.crop_regions.every(validRegion)),"Reserved source question lacks a valid comparison rectangle");
        ensure(!reserved.some(other=>other.crop_regions.some(otherRegion=>overlaps(region,otherRegion))),"D2 crop overlaps reserved source content");
        const png = read(file); ensure(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && png.readUInt32BE(16)>0 && png.readUInt32BE(20)>0,"D2 crop PNG is invalid");
        assets.push({source_part_id:record.source_part_id,parent_id:parent.id,role,path:file,sha256:sha(png),owner_question:row.question,owner_part:entry.part_label || null,
          source_region:region,metadata_path:path.join(DB,"outputs/previews",parent.preview,kind+"_preview.json")});
      } catch(error) { hold(record,error.message,{role,path:file}); }
    }
    if (/^1A?$/.test(parent.paper)) {
      try {
        const qp = metadata(parent.preview,"question"), ms = metadata(parent.preview,"mark_scheme"), group = qp.question_groups.find(group=>String(group.question_number)===row.question);
        const entries = ms.entries.filter(entry=>String(entry.question_number)===row.question), key = /^Answer: ([ABCD])$/.exec(row.ms_text.trim())?.[1];
        ensure(parent.parts.length===1 && group.parts.length===1 && part.marks===1 && row.marks==="1" && /^[ABCD]$/.test(key || ""),"D2 MCQ lacks a unique one-mark extracted answer");
        ensure(entries.length===1,"D2 MCQ original answer entry is not unique"); const entry=entries[0];
        ensure(entry.part_label===row.part_label && entry.marks===1 && entry.answer_text==="Answer: "+key && entry.text==="Answer: "+key,"D2 MCQ original answer entry conflicts");
        ensure(entry.source_lines?.length===2 && String(entry.source_lines[0]).trim().replace(/\.$/,"")===row.question && entry.source_lines[1]===key,"D2 MCQ original lines do not uniquely pair number and answer");
        ensure(same(entry.crop_image_paths.map(file=>path.basename(file)),part.ms_crops),"D2 MCQ scheme crop assignment differs");
        record.correct_option=key; record.answer_status="matched_source_key";
        mcq.push({source_part_id:row.part_id,correct_option:key,source_lines:[...entry.source_lines],metadata_path:path.join(DB,"outputs/previews",parent.preview,"mark_scheme_preview.json"),visual_review:false});
      } catch(error) { mcqFindings.push({source_part_id:record.source_part_id,reason:error.message,fallback:"manual_self_mark"}); }
    }
  }
  const questions = projected.filter(record=>!heldParents.has(record.parent_id)), retained = new Set(questions.map(record=>record.source_part_id));
  ensure(questions.every(record=>input.report.candidate_source_ids.includes(record.source_part_id)),"D2 release widened its fixed source scope");
  const currentImpacts = [];
  const latestPath = path.join(ROOT,"dist/ibphysics-release/latest.json");
  if (fs.existsSync(latestPath)) {
    const latest = JSON.parse(fs.readFileSync(latestPath,"utf8")), catalogueFile=path.join(latest.root,"data/physics_catalogue.js");
    if (fs.existsSync(catalogueFile)) {
      const box={window:{}}; require("vm").runInNewContext(fs.readFileSync(catalogueFile,"utf8"),box);
      for (const record of box.window.PHYSICS_QUESTIONS || []) if (closure.blockedParentIds.has(record.parent_id))
        currentImpacts.push({id:record.id,source_part_id:record.source_part_id,parent_id:record.parent_id,topic_codes:record.topic_codes});
    }
  }
  [__filename,path.join(ROOT,"tools/build_ib_d2_recovery.js"),path.join(ROOT,"tools/physics-test-exclusions.js")].forEach(file=>read(file));
  const reviewComplete=requireAssessment&&Boolean(assessment);
  const clearance = {schema_version:1,topic:"D.2",review_complete:reviewComplete,
    unresolved_relevant_items:reviewComplete?[]:[requireAssessment?"Current D2 assessment comparison is not complete":"Private preflight skips the mandatory global assessment additions"],
    reviewed_source_part_ids:[...retained].sort(),reviewed_parent_ids:unique(questions.map(record=>record.parent_id)).sort(),
    input:{path:inputPath,sha256:inputHash},assessment_review:assessment?{path:assessedFile,sha256:files.get(assessedFile).sha256}:null,
    counts:{fixed_candidate_parts:projected.length,parts:questions.length,parents:unique(questions.map(record=>record.parent_id)).length,
      new_parts:questions.filter(record=>input.report.new_candidate_source_ids.includes(record.source_part_id)).length,matched_mcq_keys:questions.filter(record=>record.correct_option).length,
      assets:unique(assets.filter(asset=>retained.has(asset.source_part_id)).map(asset=>asset.path)).length},
    assets:assets.filter(asset=>retained.has(asset.source_part_id)),originals:originals.filter(item=>retained.has(item.source_part_id)),
    fingerprints:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)),withheld_parent_ids:[...heldParents].sort(),findings:failures,
    mcq_metadata:{matched:mcq.filter(item=>retained.has(item.source_part_id)),manual_fallbacks:mcqFindings.filter(item=>retained.has(item.source_part_id))},
    existing_public_assessment_impacts:currentImpacts,
    limitations:["Every retained image is bound to its exact original question/part role, source rectangle and original PDF identity, with conservative reserved-content comparisons.",
      "This is source-attribution validation, not individual visual proofreading of every image. Uncertain ownership and geometry withhold whole D2 parents.",
      "Exact original MCQ answer entries may supply a key; other answers remain manually marked. Type-understanding references remain private type-level evidence."]};
  return {questions,analysis:publicTaxonomy(input),clearance};
}
function write(options={}) {
  const result=buildCandidateClearance(options), output=path.resolve(options.output || (options.requireAssessment===false ? path.join(ROOT,"dist/physics-audit/d2-recovery/geometry-preflight.json") : clearancePath));
  ensure(output.startsWith(ROOT+path.sep),"D2 clearance output must stay in the workspace");
  fs.mkdirSync(path.dirname(output),{recursive:true}); fs.writeFileSync(output,JSON.stringify(options.requireAssessment===false ? result : result.clearance,null,2)+"\n");
  return {path:output,sha256:sha(fs.readFileSync(output)),counts:result.clearance.counts,review_complete:result.clearance.review_complete,failures:result.clearance.findings.length};
}
function prepareRelease(options={}) {
  const result=buildCandidateClearance(options);
  return {questions:result.questions,taxonomy:result.analysis,fingerprints:result.clearance.fingerprints,clearance:result.clearance,
    report:{topic:"D.2",input:result.clearance.input,assessment_review:result.clearance.assessment_review,counts:result.clearance.counts,
      withheld_parent_ids:result.clearance.withheld_parent_ids,findings:result.clearance.findings,mcq_metadata:result.clearance.mcq_metadata,
      existing_public_assessment_impacts:result.clearance.existing_public_assessment_impacts,limitations:result.clearance.limitations}};
}
if (require.main===module) console.log(JSON.stringify(write({requireAssessment:!process.argv.includes("--preflight")}),null,2));
module.exports={prepareRelease,buildCandidateClearance,write,project,publicTaxonomy,validRegion,overlaps,ownedCrop,validateAssessment,applyReviewedPresentation,inputPath,assessmentPath,clearancePath};
