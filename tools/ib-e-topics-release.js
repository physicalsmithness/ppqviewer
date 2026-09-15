"use strict";
// E1/E2 release gate. Read the normalized scope, fixed-scope current-test review
// and exact originals. A preflight is diagnostic only and cannot be published.
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const source=require("./ib-e-topics-input");
const {buildIbExclusions}=require("./physics-test-exclusions");
const {sourceHoldClosure,identities}=require("./build_ib_d2_recovery");
const {validRegion,overlaps,ownedCrop}=require("./ib-d2-release");
const {loadCurrentReviewAdditions}=require("./ib-current-review-additions");
const {ROOT,DB}=source,sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const clearancePath=path.join(ROOT,"reports/ib-e1-e2-release-clearance.json");
const assessmentPaths=["reports/ib-e1-learner-scope-review.json","reports/ib-e2-learner-scope-review.json"].map(p=>path.join(ROOT,p));
const ensure=(ok,message)=>{if(!ok)throw Error(message);},unique=a=>[...new Set(a.filter(Boolean))];
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const imageFields=["question_images","context_images","markscheme_images"];
const pageNo=file=>Number((/_p(\d+)(?:_|\.)/.exec(file)||[])[1]);
function prepareRelease(options={}){
  const preflight=options.preflight===true,input=source.build(),files=new Map(),cache=new Map();
  function read(file,expected){
    file=path.resolve(file);const bytes=fs.readFileSync(file),hash=sha(bytes);
    ensure(!expected||hash===expected,"E1/E2 evidence changed: "+file);
    ensure(!files.has(file)||files.get(file).sha256===hash,"E1/E2 source changed during release audit");
    files.set(file,{path:file,sha256:hash});return bytes;
  }
  const json=file=>JSON.parse(read(file).toString("utf8").replace(/^\uFEFF/,""));
  input.report.source_files.forEach(f=>read(f.path,f.sha256));
  const byId=new Map(input.corpus.map(r=>[r.part_id,r]));
  const parents=new Map(input.questions.map(q=>[q.id,q]));
  const corpusPath=path.join(DB,"outputs/exports/ib_physics_archive_flat_v5.csv");
  const corpusHash=files.get(corpusPath).sha256;
  const assessments=[];
  for(const file of assessmentPaths){
    if(preflight&&!fs.existsSync(file))continue;
    const review=json(file);
    ensure(review.schema_version===1&&["E.1","E.2"].includes(review.topic)&&review.review_complete===true,
      "E1/E2 current-assessment review is incomplete");
    ensure(review.corpus_sha256===corpusHash&&Array.isArray(review.reviewed_candidate_source_ids),
      "E1/E2 assessment did not bind its fixed archive candidates");
    ensure(input.report.candidate_source_ids.filter(id=>Object.hasOwn(input.parts[id].topics,review.topic))
      .every(id=>review.reviewed_candidate_source_ids.includes(id)),"New E1/E2 candidates have not received assessment comparison");
    ensure(Array.isArray(review.blocked_source_ids)&&Array.isArray(review.source_files)&&review.source_files.length&&
      !(review.read_failures||[]).length&&!(review.unresolved_relevant_items||[]).length,"E1/E2 assessment has unresolved source reads");
    review.source_files.forEach(f=>read(path.isAbsolute(f.path)?f.path:path.join(DB,f.path),f.sha256));
    assessments.push({file,review});
  }
  ensure(preflight||new Set(assessments.map(a=>a.review.topic)).size===2,"Both E-topic assessment comparisons are mandatory");
  const freshnessPath=path.join(ROOT,"reports/ib-e1-e2-current-assessment-freshness.json"),fresh=json(freshnessPath);
  ensure(fresh.complete===true&&fresh.inventory_matches===true&&fresh.source_files.length>=16,"Current E assessment freshness is incomplete");
  fresh.source_files.forEach(f=>{ensure(f.matches_snapshot&&f.sha256===f.snapshot_sha256,"E assessment snapshot mismatch");read(f.snapshot_path,f.snapshot_sha256);});
  const additional=loadCurrentReviewAdditions();
  additional.fingerprints.forEach(f=>read(f.path,f.sha256));
  const exclusionPaths=["dist/physics-audit/current-ib-tests.json","reports/ib-a5-reviewed-test-exclusions.json",
    "reports/ib-a1-c1-reviewed-test-exclusions.json"].map(p=>path.join(ROOT,p));
  exclusionPaths.push(...additional.paths,...assessments.map(a=>a.file));exclusionPaths.forEach(file=>read(file));
  const closure=buildIbExclusions({paperdbRoot:DB,questions:input.questions,extraExclusionsPaths:exclusionPaths});
  closure.report.sourceFiles.forEach(f=>read(path.isAbsolute(f.path)?f.path:path.join(DB,f.path),f.sha256));
  const known=json(path.join(ROOT,"reports/ib-reviewed-crop-exclusions.json"));
  ensure(known.corpus_sha256===corpusHash,"Known source-media hold archive changed");
  const qualityHolds=sourceHoldClosure(input.corpus,unique([...(known.source_part_ids||[]),...input.report.learner_hold_source_ids,
    ...assessments.flatMap(a=>a.review.source_quality_hold_ids||[]),
    "ibchem_part_b94a96fa7e929d68","ibchem_part_0ca679bf2e54c0a0","ibchem_part_215ca58054f9ca6b"]));
  const heldQuestions=new Set(input.corpus.filter(r=>closure.blockedSourceIds.has(r.part_id)).map(r=>r.preview+"/"+r.question));
  const heldPages=new Set([...closure.blockedQuestionPageKeys].map(f=>f.split("/")[0]+"/"+pageNo(f)));
  const metadata=(preview,kind)=>{
    const file=path.join(DB,"outputs/previews",preview,kind+"_preview.json");
    if(!cache.has(file))cache.set(file,json(file));return cache.get(file);
  };
  const projected=source.project(input),heldParents=new Set(),findings=[],assets=[],originals=[],mcq=[],mcqFindings=[];
  function hold(q,reason,detail={}){heldParents.add(q.parent_id);findings.push({source_part_id:q.source_part_id,parent_id:q.parent_id,reason,...detail});}
  function bindOriginals(row){
    for(const [kind,column,type]of [["question","question_source","question_paper"],["mark_scheme","mark_scheme_source","mark_scheme"]]){
      const meta=metadata(row.preview,kind),s=meta.source;
      ensure(s?.relative_path===row[column]&&s.document_type===type&&s.subject==="Physics","E original document attribution differs");
      for(const [key,field]of [["year","year"],["series","session"],["level","level"],["time_zone","time_zone"],["paper","paper"],["paper_variant","paper_variant"]])
        ensure(String(s[key]??"")===row[field],"E original document "+key+" differs");
      ensure(!path.isAbsolute(row[column])&&!row[column].split(/[\\/]/).includes("..")&&/\.pdf$/i.test(row[column]),"Unsafe original E PDF path");
      const filename=path.join(DB,row[column]);ensure(read(filename).subarray(0,5).toString()==="%PDF-","Original E PDF header missing");
      originals.push({source_part_id:row.part_id,role:kind,...files.get(filename)});
    }
  }
  for(const record of projected){
    const row=byId.get(record.source_part_id),parent=parents.get(record.parent_id),part=parent.parts.find(p=>p.source_part_id===row.part_id);
    try{
      ensure(identities(row).parent===record.parent_id&&identities(row).part===record.id,"E stable source identity differs");
      ensure(Number(row.year)>=2004&&Number(row.year)<2026,"E source-year embargo");
      ensure(!qualityHolds.has(row.part_id),"E whole-parent/twin source-quality hold");
      ensure(!closure.blockedParentIds.has(parent.id)&&!closure.blockedSourceIds.has(row.part_id),"Current assessment whole-parent/twin/duplicate hold");
      ensure(![...parent.pages,...parent.crops,...parent.parts.flatMap(p=>p.crops)].some(file=>heldPages.has(parent.preview+"/"+pageNo(file))),
        "E question/context shares a reserved source page");
      ensure(Number.isInteger(record.marks)&&record.marks>0&&record.question_images.length&&record.markscheme_images.length,
        "E focused question/marks/markscheme is incomplete");
      const qp=metadata(row.preview,"question"),groups=qp.question_groups.filter(g=>String(g.question_number)===row.question);
      ensure(groups.length===1,"Original E whole-question entry missing or ambiguous");
      const own=groups[0].parts.filter(p=>p.part_label===row.part_label);
      ensure(own.length===1&&same(part.crops,own[0].crop_image_paths.map(p=>path.basename(p))),"Original E focused crop assignment differs");
      if(!/^1A?$/.test(parent.paper)){
        ensure(parent.crops.length&&same(parent.crops,groups[0].crop_image_paths.map(p=>path.basename(p))),"Original E context assignment differs");
        const pages=new Set(parent.crops.map(pageNo));ensure(part.pages.every(file=>pages.has(pageNo(file))),"E context does not cover focused source pages");
      }
      bindOriginals(row);
    }catch(error){hold(record,error.message);continue;}
    for(const field of imageFields)for(const file of record[field]){
      const role=field==="markscheme_images"?"markscheme":field==="context_images"?"context":"question";
      try{
        const basename=path.basename(file),kind=role==="markscheme"?"mark_scheme":"question",meta=metadata(row.preview,kind);
        ensure(path.resolve(file)===path.join(DB,"outputs/previews",row.preview,"crops",basename),"E image escapes its original crop folder");
        const entries=role==="markscheme"?meta.entries.map(e=>({...e,owner_question:String(e.question_number)})):
          meta.question_groups.flatMap(g=>[{...g,owner_question:String(g.question_number),whole_parent:true},
            ...g.parts.map(p=>({...p,owner_question:String(g.question_number)}))]);
        const {entry,region}=ownedCrop(entries,row,role,basename),reserved=entries.filter(e=>heldQuestions.has(row.preview+"/"+e.owner_question));
        ensure(reserved.every(e=>e.crop_regions?.length&&e.crop_regions.every(validRegion)),"Reserved source entry lacks comparison geometry");
        ensure(!reserved.some(e=>e.crop_regions.some(r=>overlaps(region,r))),"E crop overlaps reserved content");
        const png=read(file);ensure(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&png.readUInt32BE(16)>0&&png.readUInt32BE(20)>0,
          "E crop PNG is invalid");
        assets.push({source_part_id:row.part_id,parent_id:parent.id,role,path:file,sha256:sha(png),owner_question:row.question,
          owner_part:entry.part_label||null,source_region:region,metadata_path:path.join(DB,"outputs/previews",row.preview,kind+"_preview.json")});
      }catch(error){hold(record,error.message,{role,path:file});}
    }
    if(/^1A?$/.test(parent.paper)){
      try{
        const qp=metadata(row.preview,"question"),ms=metadata(row.preview,"mark_scheme"),group=qp.question_groups.find(g=>String(g.question_number)===row.question);
        const entries=ms.entries.filter(e=>String(e.question_number)===row.question),key=/^Answer: ([ABCD])$/.exec(row.ms_text.trim())?.[1];
        ensure(parent.parts.length===1&&group.parts.length===1&&part.marks===1&&row.marks==="1"&&/^[ABCD]$/.test(key||""),
          "E MCQ lacks a unique one-mark extracted key");
        ensure(entries.length===1,"E MCQ key entry is ambiguous");const entry=entries[0];
        ensure(entry.part_label===row.part_label&&entry.marks===1&&entry.answer_text==="Answer: "+key&&entry.text==="Answer: "+key,"E MCQ original key conflicts");
        ensure(entry.source_lines?.length===2&&String(entry.source_lines[0]).trim().replace(/\.$/,"")===row.question&&entry.source_lines[1]===key,
          "E MCQ original lines do not uniquely pair number and key");
        ensure(same(entry.crop_image_paths.map(p=>path.basename(p)),part.ms_crops),"E MCQ scheme assignment differs");
        record.correct_option=key;record.answer_status="matched_source_key";
        mcq.push({source_part_id:row.part_id,correct_option:key,source_lines:entry.source_lines,visual_review:false});
      }catch(error){mcqFindings.push({source_part_id:row.part_id,reason:error.message,fallback:"manual_self_mark"});}
    }
  }
  const questions=projected.filter(q=>!heldParents.has(q.parent_id)),retained=new Set(questions.map(q=>q.source_part_id));
  for(const q of questions)for(const [topic,decision]of Object.entries(input.parts[q.source_part_id].topics))
    ensure(decision.status!=="current_mixed_component"||input.parts[q.source_part_id].scope_notes[topic],
      "Retained mixed-topic question lacks reviewed answer-free practice wording: "+q.source_part_id);
  const taxonomy=source.publicTaxonomy(input);
  [__filename,path.join(ROOT,"tools/ib-e-topics-input.js"),path.join(ROOT,"tools/ib-d2-release.js"),
    path.join(ROOT,"tools/build_ib_d2_recovery.js"),path.join(ROOT,"tools/physics-test-exclusions.js")].forEach(file=>read(file));
  const counts=Object.fromEntries(["E.1","E.2"].map(topic=>[topic,{
    candidates:projected.filter(q=>q.topic_codes.includes(topic)).length,parts:questions.filter(q=>q.topic_codes.includes(topic)).length,
    typed_parts:questions.filter(q=>q.topic_codes.includes(topic)&&q.analysis_atoms.some(code=>input.atoms.some(a=>a.code===code&&a.topic===topic))).length}]));
  const clearance={schema_version:1,topics:["E.1","E.2"],review_complete:!preflight,unresolved_relevant_items:preflight?["Private preflight is not release clearance"]:[],
    reviewed_source_part_ids:[...retained].sort(),reviewed_parent_ids:unique(questions.map(q=>q.parent_id)).sort(),counts,
    assets:assets.filter(a=>retained.has(a.source_part_id)),originals:originals.filter(a=>retained.has(a.source_part_id)),
    fingerprints:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)),withheld_parent_ids:[...heldParents].sort(),findings,
    assessment_reviews:assessments.map(({file})=>({path:file,sha256:files.get(file).sha256})),freshness:{path:freshnessPath,checked_at:fresh.checked_at},
    mcq_metadata:{matched:mcq.filter(q=>retained.has(q.source_part_id)),manual_fallbacks:mcqFindings.filter(q=>retained.has(q.source_part_id))},
    limitations:["Exact reviewed source scope is distinct from type associations and test clearance.",
      "All retained crop attribution and original-PDF fingerprints are checked; this does not claim individual visual proofreading of every image."]};
  return {questions,taxonomy,fingerprints:clearance.fingerprints,clearance,
    safety:{blockedParentIds:closure.blockedParentIds,blockedSourceIds:closure.blockedSourceIds,heldPages,qualityHolds},
    report:{topics:["E.1","E.2"],counts,source_snapshot:input.report.source_snapshot,eligibility:input.report.eligibility,
      candidate_source_ids:input.report.candidate_source_ids,withheld_parent_ids:clearance.withheld_parent_ids,findings,
      assessment_reviews:clearance.assessment_reviews,mcq_metadata:clearance.mcq_metadata,limitations:clearance.limitations}};
}
if(require.main===module){
  const preflight=process.argv.includes("--preflight"),result=prepareRelease({preflight});
  const out=preflight?path.join(ROOT,"dist/physics-audit/e1-e2-preflight.json"):clearancePath;
  fs.writeFileSync(out,JSON.stringify(preflight?result:result.clearance,null,2)+"\n");
  console.log(JSON.stringify({path:out,counts:result.clearance.counts,findings:result.clearance.findings.length,
    parts:result.questions.length,review_complete:result.clearance.review_complete}));
}
module.exports={prepareRelease,clearancePath,assessmentPaths};
