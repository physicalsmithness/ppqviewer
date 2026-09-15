"use strict";
// Read-only source audit. Output stays in this workspace; source classifications
// and the school assessment snapshots are never modified.
const fs=require("fs"),path=require("path"),vm=require("vm"),crypto=require("crypto");
const {parseCsv,buildIbExclusions}=require("./physics-test-exclusions");
const ROOT=path.resolve(__dirname,".."), DB=process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases";
const sha=b=>crypto.createHash("sha256").update(b).digest("hex"), read=p=>fs.readFileSync(p,"utf8");
const sources=[];
function source(relative){const bytes=fs.readFileSync(path.join(DB,relative));sources.push({path:relative,sha256:sha(bytes)});return bytes.toString("utf8");}
const corpus=parseCsv(source("outputs/exports/ib_physics_archive_flat_v5.csv"),["part_id","preview","question","year","session","paper","level","time_zone","cross_level_group_id","duplicate_of","question_text","shared_stem","parent_context","ms_text","page_render_paths"]);
const box={window:{}};vm.runInNewContext(source("Physics Categorisation/viewer/ibphysics_catalogue.js"),box);
const native=box.window.IBPHYS_QUESTIONS;
const currentPath=path.join(ROOT,"dist/physics-audit/current-ib-tests.json"), current=JSON.parse(read(currentPath));
const base=buildIbExclusions({paperdbRoot:DB,questions:native,extraExclusionsPath:currentPath});
const ledger=parseCsv(source("Physics Categorisation/returns/PACKET_006D/source_results_v4.csv"));
const matches=parseCsv(source("Physics Categorisation/returns/PACKET_006D/matches.csv"));
const tests=ledger.filter(r=>r.source_kind==="test" && /A\.5 Relativity Test\.(?:pdf|docx)$/.test(r.source_file));
const a5Files=current.source_files.filter(f=>f.relative_path.includes("A.5"));
for(const f of a5Files){const relative="Physics Categorisation/reference/tests/3. Assessments/"+f.relative_path;const digest=sha(fs.readFileSync(path.join(DB,relative)));sources.push({path:relative,sha256:digest});if(digest!==f.sha256)throw Error("A5 snapshot changed: "+f.relative_path);}
const freshnessPath=path.join(ROOT,"dist/physics-audit/a5-current-assessment-freshness.json"),freshness=JSON.parse(read(freshnessPath));
if(freshness.files.length!==a5Files.length || a5Files.some(f=>!freshness.files.some(now=>now.path===f.path && now.sha256===f.sha256)))throw Error("Current A5 assessment fingerprints differ from the reviewed snapshot");
const parent=r=>`${r.year.slice(-2)}${r.session[0].toUpperCase()}.P${r.paper}.${r.level}.${r.time_zone||"TZ0"}.Q${r.question}`;
const byId=new Map(corpus.map(r=>[r.part_id,r])), byParent=new Map(),byGroup=new Map(),duplicates=new Map();
const add=(map,key,id)=>{if(!key)return; if(!map.has(key))map.set(key,new Set());map.get(key).add(id);};
for(const r of corpus){add(byParent,parent(r),r.part_id);add(byGroup,r.cross_level_group_id,r.part_id);if(r.duplicate_of){add(duplicates,r.part_id,r.duplicate_of);add(duplicates,r.duplicate_of,r.part_id);}}
// These are literal definition tasks, not every question using the concept.
const definitionRules=[
 {test_question:"15",test_page:18,reason:"same standalone reference-frame or inertial-reference-frame definition, including reversed word order",pattern:/(?:explain|state|define|describe)(?:\s+what\s+is\s+meant\s+by)?\s+(?:an?\s+)?(?:inertial\s+)?(?:frame\s+of\s+reference|reference\s+frame)/i},
 {test_question:"10(b)(i)",test_page:11,reason:"same standalone proper-length definition",pattern:/(?:explain|state|define|describe)(?:\s+what\s+is\s+meant\s+by)?\s+proper\s+length/i}
];
const seedEvidence=[];
for(const r of corpus) for(const rule of definitionRules) {
 const inheritedDefinition=/(?:define|explain|state).*(?:terms|meaning|meant)/i.test(r.parent_context||"") && (rule.test_question==="10(b)(i)" ? /^\s*(?:\([a-ziv]+\)\s*)*proper length\s*(?:\[|$)/i.test(r.question_text) : /^\s*(?:\([a-ziv]+\)\s*)*(?:inertial\s+)?(?:frame of reference|reference frame)\s*(?:\[|$)/i.test(r.question_text));
 if(rule.pattern.test(r.question_text)||inheritedDefinition)seedEvidence.push({source_part_id:r.part_id,parent_id:parent(r),test_question:rule.test_question,test_page:rule.test_page,reason:rule.reason+(inheritedDefinition?"; definition command inherited from parent context":""),question_text:r.question_text,parent_context:r.parent_context,markscheme_text:r.ms_text,already_reserved:base.blockedSourceIds.has(r.part_id)});
}
for(const id of ["ibchem_part_b1b88eba3fcbb5ae","ibchem_part_3d699c462e907aae"]){const r=byId.get(id);if(!r || !/three light years/.test(r.shared_stem) || !/0\.6c/.test(r.shared_stem))throw Error("Rewritten Q7 source changed");seedEvidence.push({source_part_id:id,parent_id:parent(r),test_question:"7",test_page:6,reason:"same round-trip traveller-time calculation at 0.60c and three light years, rewritten from twin B to spaceship observer",question_text:r.question_text,shared_stem:r.shared_stem,markscheme_text:r.ms_text,already_reserved:base.blockedSourceIds.has(id)});}
const extra=new Set(seedEvidence.map(e=>e.source_part_id)),queue=[...extra];
for(let i=0;i<queue.length;i++){const r=byId.get(queue[i]);if(!r)throw Error("Unknown source ID");const linked=[...(byParent.get(parent(r))||[]),...(byGroup.get(r.cross_level_group_id)||[]),...(duplicates.get(r.part_id)||[])];for(const id of linked)if(!extra.has(id)){extra.add(id);queue.push(id);}}
const extraParents=new Set([...extra].map(id=>parent(byId.get(id))));
const pageNo=f=>(/_p(\d+)(?:_|\.)/.exec(f)||[])[1];
const extraPageKeys=new Set([...extra].flatMap(id=>byId.get(id).page_render_paths.split(";").filter(x=>/question_/.test(x)).map(x=>byId.get(id).preview+"/"+path.basename(x.replace(/\\/g,"/")))));
const badCrop=new Set(JSON.parse(read(path.join(ROOT,"reports/ib-reviewed-crop-exclusions.json"))).source_part_ids);
function classify(extraHolds){const pages=new Set([...base.blockedQuestionPageKeys,...(extraHolds?extraPageKeys:[])].map(k=>k.split("/")[0]+"/"+pageNo(k)));const results=[];
 for(const q of native)for(const p of q.parts||[]){if(!(p.topic_codes||[]).includes("A.5"))continue;let reason="served";
  if(!/^\d{4}$/.test(String(q.year))||Number(q.year)>=2026)reason="2026_or_later_or_undated";
  else if(base.blockedParentIds.has(q.id))reason="existing_test_parent_twin_or_duplicate_reservation";
  else if(extraHolds&&extraParents.has(q.id))reason="reviewed_A5_definition_parent_twin_or_duplicate_reservation";
  else if(q.parts.some(x=>badCrop.has(x.source_part_id)))reason="reviewed_incomplete_crop";
  else if([...(q.pages||[]),...(q.crops||[]),...q.parts.flatMap(x=>x.crops||[])].some(f=>pages.has(q.preview+"/"+pageNo(f))))reason="shares_reserved_question_page";
  else if((p.spec_status||q.spec_status)==="out")reason="outside_current_syllabus";
  else if(!p.crops.length||(!/^1A?$/.test(q.paper)&&(!(q.crops||[]).length||!(p.pages||[]).every(f=>q.crops.some(c=>pageNo(c)===pageNo(f))))))reason="no_complete_cropped_context";
  else if(!p.ms_crops.length)reason="no_cropped_markscheme";
  results.push({part_id:p.part_id,source_part_id:p.source_part_id,parent_id:q.id,reason});
 }return results;}
const count=rows=>Object.fromEntries([...new Set(rows.map(r=>r.reason))].map(reason=>[reason,rows.filter(r=>r.reason===reason).length]));
const candidateIds=value=>String(value||"").match(/ibchem_(?:part|xlvl)_[a-f0-9]+/g)||[];
const rowsByQuestion=[];
for(let n=1;n<=15;n++){const rows=tests.filter(r=>r.source_q_label===String(n)),sourceIds=new Set(rows.map(r=>r.source_part_id));const ids=new Set();for(const r of matches)if(sourceIds.has(r.source_part_id))for(const field of ["candidate_part_id","candidate_group_id","derived_from"])candidateIds(r[field]).forEach(id=>ids.add(id));for(const r of rows)for(const field of ["matched_part_id","matched_group_id","rank1_part_id","rank1_group_id","derived_from"])candidateIds(r[field]).forEach(id=>ids.add(id));const parts=new Set();for(const id of ids)if(byId.has(id))parts.add(id);else for(const part of byGroup.get(id)||[])parts.add(part);rowsByQuestion.push({question:n,pages:[...new Set(rows.map(r=>Number(r.source_page)))],ledger_rows:rows.length,candidate_source_parts:[...parts].sort(),all_candidates_reserved:[...parts].every(id=>base.blockedSourceIds.has(id)),proposal_patterns:[...new Set(rows.map(r=>r.pattern))],has_final_adjudication:rows.every(r=>r.final_status)});}
const knownParents={7:["16N.P3.HL.TZ0.Q7","16N.P3.SL.TZ0.Q7"],8:["24M.P3.HL.TZ2.Q4","24M.P3.SL.TZ2.Q4"],9:["24M.P3.HL.TZ2.Q5","24M.P3.SL.TZ2.Q5"],10:["24M.P3.HL.TZ1.Q3","24M.P3.SL.TZ1.Q3"],11:["24M.P3.HL.TZ1.Q4","24M.P3.SL.TZ1.Q4"],12:["24M.P3.HL.TZ1.Q5","24M.P3.SL.TZ1.Q5"],13:["23N.P3.HL.TZ1.Q5","23N.P3.SL.TZ1.Q5","23N.P3.HL.TZ2.Q5","23N.P3.SL.TZ2.Q5"],14:["19M.P3.HL.TZ1.Q4","19M.P3.SL.TZ1.Q4"]};
for(const [question,parents] of Object.entries(knownParents)){if(parents.some(id=>!base.blockedParentIds.has(id)&&!extraParents.has(id)))throw Error("Identified A5 test parent is not reserved: "+question);Object.assign(rowsByQuestion[Number(question)-1],{identified_whole_archive_parents:parents,all_identified_parts_and_twins_reserved:parents.every(id=>byParent.has(id)&&[...byParent.get(id)].every(pid=>base.blockedSourceIds.has(pid)||extra.has(pid)))});}
const before=classify(false),after=classify(true),retained=after.filter(r=>r.reason==="served");
const report={schema_version:1,created_utc:new Date().toISOString(),course:"ib",topic:"A.5",corpus_sha256:sources[0].sha256,source_files:sources,read_failures:[],school_test_files:a5Files,source_freshness_verified_at:freshness.checked_utc,current_assessment_freshness:{path:freshnessPath,sha256:sha(fs.readFileSync(freshnessPath)),...freshness},
 policy:"Existing candidate closure plus conservative reservations of the same standalone definition task where the test reverses its wording. No source claims are rewritten as confirmed matches.",
 source_part_ids:[...new Set(seedEvidence.map(e=>e.source_part_id))].sort(),parent_ids:[...extraParents].sort(),blocked_source_ids:[...extra].sort(),blocked_question_page_keys:[...extraPageKeys].sort(),reviewed_evidence:seedEvidence,
 counts:{native_A5_candidates:before.length,native_A5_candidate_parents:new Set(before.map(r=>r.parent_id)).size,before:count(before),after:count(after),after_retained_parents:new Set(retained.map(r=>r.parent_id)).size},
 candidate_records:after,school_test_question_coverage:rowsByQuestion,
 unresolved_relevant_items:[{question:"1-6",reason:"Complete prompts have provisional bespoke/weak-link classifications. All retrieved candidates are reserved. Distinctive full-prompt searches found no exact archive counterpart; selected-pool comparison is recorded separately in the scoped clearance."}],
 unrelated_global_unlinked_items:"The three unlinked D1 gravitation prompts do not create an identified A5 match.",
 complete_test_exclusion_certified:false,limitations:["Current A5 school-test fingerprints were independently refreshed by the parent task and match the reviewed local snapshots.","Q1-Q6 original identity remains unconfirmed; selected-pool comparisons are recorded in the scoped clearance.","All candidate/proposal links and all identified original questions, full parents and twins are withheld; this is not a claim that every unpublished rewrite has a discoverable original."]};
const output=path.join(ROOT,"reports/ib-a5-reviewed-test-exclusions.json");fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");console.log(JSON.stringify({output,counts:report.counts,definition_seeds:report.source_part_ids.length,extra_parent_closure:extraParents.size,all15CandidateSetsReserved:rowsByQuestion.every(r=>r.all_candidates_reserved)},null,2));
