"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const {prepareRelease,project,publicTaxonomy,validRegion,overlaps,ownedCrop,validateAssessment,inputPath}=require("../tools/ib-d2-release");
const input=JSON.parse(fs.readFileSync(inputPath,"utf8")),sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
let checks=0;function check(name,run){run();checks++;console.log("PASS "+name);}
const result=prepareRelease({requireAssessment:false});
check("release projection never widens the frozen candidate identities",()=>{
  const candidates=new Set(input.report.candidate_source_ids),ids=result.questions.map(q=>q.source_part_id);
  assert.equal(new Set(ids).size,ids.length);assert(ids.every(id=>candidates.has(id)));assert(ids.length>0);
  result.questions.forEach(q=>{assert.deepEqual(q.topic_codes,["D.2"]);assert(Number(q.year)<2026);assert(q.question_images.length);assert(q.markscheme_images.length);});
});
check("assessment certification requires exact candidate scope and original file hash",()=>{
  const good={schema_version:1,topic:"D.2",review_complete:true,unresolved_relevant_items:[],reviewed_candidate_source_ids:input.report.candidate_source_ids,
    reviewed_candidate_file:inputPath,reviewed_candidate_sha256:sha(fs.readFileSync(inputPath)),blocked_source_ids:[],source_files:[{path:inputPath,sha256:sha(fs.readFileSync(inputPath))}]};
  validateAssessment(good,input,good.reviewed_candidate_sha256);
  assert.throws(()=>validateAssessment({...good,review_complete:false},input,good.reviewed_candidate_sha256),/incomplete/);
  assert.throws(()=>validateAssessment({...good,reviewed_candidate_source_ids:good.reviewed_candidate_source_ids.slice(1)},input,good.reviewed_candidate_sha256),/fixed candidate scope/);
  assert.throws(()=>validateAssessment({...good,reviewed_candidate_sha256:"0".repeat(64)},input,good.reviewed_candidate_sha256),/input changed/);
  assert.throws(()=>validateAssessment({...good,unresolved_relevant_items:["image-only task"]},input,good.reviewed_candidate_sha256),/incomplete/);
});
check("same-parent wrong-part crops and ambiguous reuse are rejected",()=>{
  const filename="question_7_a_v004_p004_01_a.png",row={question:"7",part_label:"7(a)"};
  const entry={owner_question:"7",part_label:"7(a)",crop_image_paths:["crops/"+filename],crop_regions:[{page_number:4,bbox:[60,80,550,140]}]};
  assert.equal(ownedCrop([entry],row,"question",filename).entry,entry);
  assert.throws(()=>ownedCrop([{...entry,part_label:"7(b)"}],row,"question",filename),/another part/);
  assert.throws(()=>ownedCrop([{...entry,owner_question:"8"}],row,"question",filename),/another question/);
  assert.throws(()=>ownedCrop([entry,{...entry}],row,"question",filename),/ambiguous/);
  assert.throws(()=>ownedCrop([entry],row,"context",filename),/another part or role/);
});
check("per-image rectangles reject missing, swapped-page and degenerate geometry",()=>{
  const filename="question_7_a_v004_p004_01_a.png",row={question:"7",part_label:"7(a)"};
  const entry={owner_question:"7",part_label:"7(a)",crop_image_paths:["crops/"+filename],crop_regions:[{page_number:5,bbox:[60,80,550,140]}]};
  assert.throws(()=>ownedCrop([entry],row,"question",filename),/page differs/);
  assert.throws(()=>ownedCrop([{...entry,crop_regions:[]}],row,"question",filename),/rectangle/);
  assert(!validRegion({page_number:4,bbox:[0,0,100,0]}));assert(!validRegion({page_number:4,bbox:[0,NaN,100,100]}));
  assert(overlaps({page_number:4,bbox:[0,0,100,100]},{page_number:4,bbox:[90,90,200,200]}));
  assert(!overlaps({page_number:4,bbox:[0,0,100,100]},{page_number:5,bbox:[0,0,100,100]}));
});
check("retired mass demands and disputed answer keys remain out of release",()=>{
  const held=["ibchem_part_e6c577a51fdc0700","ibchem_part_5dab633bcc41eb4b","ibchem_part_0ca679bf2e54c0a0","ibchem_part_2712dff29cedfa47"];
  held.forEach(id=>assert(!result.questions.some(q=>q.source_part_id===id)));
  assert(result.report.findings.some(row=>/retired demanded operation/.test(row.reason)));
});
check("public taxonomy displays local labels and keeps understanding references private",()=>{
  const taxonomy=publicTaxonomy(input);assert.equal(taxonomy.atoms.length,72);
  taxonomy.atoms.forEach(atom=>{assert(atom.code.startsWith(input.source_version+"::"));assert.equal(atom.topic,"D.2");assert(atom.display_code.startsWith("D2."));assert(!("type_understanding_references" in atom));assert(!("source_version" in atom));});
  taxonomy.groups.forEach(group=>assert.equal(group.topic,"D.2"));
});
check("current level follows authored operations and ignores original paper level",()=>{
  const original=project(input),clone=structuredClone(input);clone.questions.forEach(q=>q.level=q.level==="HL"?"SL":"HL");
  assert.deepEqual(project(clone).map(q=>q.current_topic_levels),original.map(q=>q.current_topic_levels));
  assert(original.some(q=>q.current_topic_levels["D.2"]==="HL"));assert(original.some(q=>q.current_topic_levels["D.2"]==="HLSL"));
});
check("retained assets have exact role, part, rectangle and current byte witnesses",()=>{
  const fingerprints=new Map(result.fingerprints.map(file=>[path.resolve(file.path),file.sha256]));
  const offered=new Set(result.questions.flatMap(q=>[...q.question_images,...q.context_images,...q.markscheme_images]));
  assert.deepEqual([...new Set(result.clearance.assets.map(asset=>asset.path))].sort(),[...offered].sort());
  result.clearance.assets.forEach(asset=>{assert(validRegion(asset.source_region));assert.equal(sha(fs.readFileSync(asset.path)),asset.sha256);assert.equal(fingerprints.get(path.resolve(asset.path)),asset.sha256);assert(fingerprints.has(path.resolve(asset.metadata_path)));});
  result.questions.forEach(q=>{assert(result.clearance.originals.some(original=>original.source_part_id===q.source_part_id&&original.role==="question"));assert(result.clearance.originals.some(original=>original.source_part_id===q.source_part_id&&original.role==="mark_scheme"));});
});
check("automatic MCQ keys are backed by unique original number-answer lines",()=>{
  const keys=new Map(result.clearance.mcq_metadata.matched.map(entry=>[entry.source_part_id,entry]));
  result.questions.filter(q=>q.correct_option).forEach(q=>{const evidence=keys.get(q.source_part_id);assert(evidence);assert.equal(q.correct_option,evidence.correct_option);assert.equal(evidence.source_lines[1],q.correct_option);assert.equal(String(evidence.source_lines[0]).trim().replace(/\.$/,""),q.question_number);assert.equal(q.answer_status,"matched_source_key");});
  result.questions.filter(q=>!/^1A?$/.test(q.paper)).forEach(q=>assert(!q.correct_option));
});
console.log(`${checks} D2 release checks passed; ${result.questions.length} private parts; assessment complete: ${result.clearance.review_complete}.`);
