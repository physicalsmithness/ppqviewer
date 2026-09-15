"use strict";
// Rechecks the frozen, manually reviewed A5 release scope. This helper writes
// local evidence only; it cannot modify the archive or publish a release.
const fs=require("fs"),path=require("path"),vm=require("vm"),crypto=require("crypto");
const {parseCsv,buildIbExclusions}=require("./physics-test-exclusions");
const {ibInput}=require("./assemble_physics_preview");
const {loadCurrentReviewAdditions}=require("./ib-current-review-additions");
const {loadA5AdditionalGeometry,validRegion}=require("./ib-a5-additional-geometry");
const ROOT=path.resolve(__dirname,".."),DB=path.resolve(process.env.PHYSICS_PAPERDB_ROOT||"C:/CodexProjects/PaperDatabases");
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const overlap=(a,b)=>a.page_number===b.page_number&&Math.min(a.bbox[2],b.bbox[2])>Math.max(a.bbox[0],b.bbox[0])&&Math.min(a.bbox[3],b.bbox[3])>Math.max(a.bbox[1],b.bbox[1]);
// The two May 2008 G2(b)(i) fallback exceptions were retired after the source
// owner supplied adequate row crops. Every overlap now uses actual crop_regions
// unchanged, including conservative full-page rectangles wherever they remain.
function main(){
const fingerprints=new Map();
function bytes(file){file=path.resolve(file);const b=fs.readFileSync(file);fingerprints.set(file,{path:file,sha256:sha(b)});return b;}
const json=file=>JSON.parse(bytes(file));
const local=f=>path.join(ROOT,f),source=f=>path.join(DB,f);
const supplementPath=local("reports/ib-a5-reviewed-test-exclusions.json"),currentPath=local("dist/physics-audit/current-ib-tests.json");
const supplement=json(supplementPath),current=json(currentPath),freshness=json(local("dist/physics-audit/a5-current-assessment-freshness.json"));
const analysis=json(local("dist/physics-inputs/ib-a5-analysis.json")),cropReview=json(local("reports/ib-reviewed-crop-exclusions.json"));
const sharedCropReview=json(local("reports/ib-a5-shared-parent-crop-review.json"));
ensure(sharedCropReview.review_complete===true && sharedCropReview.unresolved_relevant_items.length===0,"Shared-parent crop review is incomplete");
for(const f of sharedCropReview.source_files)ensure(sha(bytes(f.path))===f.sha256,"Shared-parent crop review source changed");
const mcq=json(local("dist/physics-inputs/ib-physics-mcq.json"));
ensure(mcq.schema_version===1&&mcq.course==="ib"&&mcq.parts&&mcq.presentation_corrections&&Array.isArray(mcq.report?.source_files),"Reviewed MCQ metadata is missing");
for(const f of mcq.report.source_files)ensure(sha(bytes(f.path))===f.sha256,"Reviewed MCQ evidence changed");
const corpus=parseCsv(bytes(source("outputs/exports/ib_physics_archive_flat_v5.csv")).toString("utf8"));
const box={window:{}};vm.runInNewContext(bytes(source("Physics Categorisation/viewer/ibphysics_catalogue.js")).toString("utf8"),box);
const native=box.window.IBPHYS_QUESTIONS;
for(const f of ["Physics Categorisation/returns/PACKET_006D/source_results_v4.csv","Physics Categorisation/returns/PACKET_006D/matches.csv","Physics Categorisation/work/a5_dependencies_20260908/analysis_all_years.json"])bytes(source(f));
for(const f of ["tools/build_ib_a5_clearance.js","tools/physics-test-exclusions.js","tools/assemble_physics_preview.js","tools/ib-reviewed-topics.js","reports/physics-current-test-visual-review.md","tools/build_ib_physics_mcq.js","reports/ib-physics-reviewed-mcq.json","reports/ib-a5-reserved-geometry-review.md","test/test_ib_a5_clearance_geometry.js"])bytes(local(f));
for(const f of supplement.school_test_files){const file=source("Physics Categorisation/reference/tests/3. Assessments/"+f.relative_path);ensure(sha(bytes(file))===f.sha256,"Reviewed A5 snapshot changed");ensure(freshness.files.some(x=>x.path===f.path&&x.sha256===f.sha256),"Current shared assessment differs from reviewed A5 snapshot");}
ensure(current.read_failures.length===0 && supplement.read_failures.length===0,"Assessment read failure");
const currentAdditions=loadCurrentReviewAdditions();
for(const file of currentAdditions.fingerprints)ensure(sha(bytes(file.path))===file.sha256,"Additional test review changed during A5 clearance");
const geometry=loadA5AdditionalGeometry();
for(const file of geometry.fingerprints)ensure(sha(bytes(file.path))===file.sha256,"Additional A5 geometry review changed during clearance");
const closure=buildIbExclusions({paperdbRoot:DB,questions:native,extraExclusionsPaths:[currentPath,supplementPath,...currentAdditions.paths]});
const input=ibInput(),served=input.questions.filter(q=>q.topic_codes.includes("A.5"));
const badCrop=new Set(cropReview.source_part_ids),parentMap=new Map(native.map(q=>[q.id,q]));
const partMap=new Map(corpus.map(r=>[r.part_id,r]));
const parent=r=>`${r.year.slice(-2)}${r.session[0].toUpperCase()}.P${r.paper}.${r.level}.${r.time_zone||"TZ0"}.Q${r.question}`;
const pageNo=f=>(/_p(\d+)(?:_|\.)/.exec(f)||[])[1];
const blockedPageKeys=new Set([...closure.blockedQuestionPageKeys].map(k=>k.split("/")[0]+"/"+pageNo(k)));
const heldPreviewQuestions=new Set(corpus.filter(r=>closure.blockedSourceIds.has(r.part_id)).map(r=>r.preview+"/"+r.question));
const servedParents=new Set(served.map(q=>q.parent_id));
const corpusSiblings=corpus.filter(r=>servedParents.has(parent(r)));
ensure(corpusSiblings.every(r=>!closure.blockedSourceIds.has(r.part_id)),"A reserved sibling could leak through full-parent context");
const baselinePath=local("dist/ibphysics-release/ab0aa88396caf624-1789233551012/data/physics_catalogue.js"),baselineBytes=bytes(baselinePath),baselineBox={window:{}};
ensure(sha(baselineBytes)==="f32aef8b1941bce59cfb49c0c7fce93ef5109064c34af000c289108b4c9fd1ca","The original 146-part A5 baseline changed");
vm.runInNewContext(baselineBytes.toString("utf8"),baselineBox);
const baselineA5=baselineBox.window.PHYSICS_QUESTIONS.filter(q=>q.topic_codes.includes("A.5"));
const originalCropHolds=["ibchem_part_71630df3bdf6ab2f","ibchem_part_c07207339d141b80"];
const baseline144=baselineA5.filter(q=>!originalCropHolds.includes(q.source_part_id));
ensure(baselineA5.length===146&&baseline144.length===144&&new Set(baseline144.map(q=>q.parent_id)).size===70,"The reviewed A5 baseline identities changed");
const intersection=supplement.candidate_records.filter(r=>r.reason==="served"&&analysis.parts[r.source_part_id]?.status==="included"&&!parentMap.get(r.parent_id).parts.some(p=>badCrop.has(p.source_part_id))).map(r=>r.source_part_id).sort();
ensure(JSON.stringify(intersection)===JSON.stringify(baseline144.map(q=>q.source_part_id).sort()),"The original A5 test/taxonomy intersection changed without review");
const noteReview=json(local("reports/ib-review-note-reservations.json"));
ensure(noteReview.review_complete===true&&noteReview.unresolved_relevant_items.length===0&&Array.isArray(noteReview.reviewed_public_removals),"Reviewed note-derived public removals are missing");
const noteRemovals=noteReview.reviewed_public_removals.filter(r=>r.topic_codes.includes("A.5"));
ensure(new Set(noteRemovals.map(r=>r.source_part_id)).size===noteRemovals.length&&noteRemovals.every(r=>r.baseline_build_id==="18a6bc2d3b649210"&&baseline144.some(q=>q.source_part_id===r.source_part_id&&q.parent_id===r.parent_id)),"A5 note-derived removal is outside the fixed reviewed baseline");
ensure([...geometry.heldParentIds].every(id=>baseline144.some(q=>q.parent_id===id)),"A5 geometry hold is outside the fixed reviewed baseline");
const removedByNotes=new Set(noteRemovals.map(r=>r.source_part_id));
const expectedRecords=baseline144.filter(q=>!removedByNotes.has(q.source_part_id)&&!geometry.heldParentIds.has(q.parent_id));
const expected=expectedRecords.map(q=>q.source_part_id).sort();
const actual=served.map(q=>q.source_part_id).sort();
ensure(JSON.stringify(expected)===JSON.stringify(actual),"Assembler differs from reviewed A5 test/taxonomy intersection");
const newCropHolds=["ibchem_part_71630df3bdf6ab2f","ibchem_part_c07207339d141b80"];
ensure(JSON.stringify([...sharedCropReview.requires_correction_source_ids].sort())===JSON.stringify([...newCropHolds].sort()) && newCropHolds.every(id=>badCrop.has(id)&&!actual.includes(id)),"The two reviewed A5 crop defects must stay withheld");
ensure(actual.length===expectedRecords.length&&servedParents.size===new Set(expectedRecords.map(q=>q.parent_id)).size,"The A5 scope changed beyond explicit note and geometry review removals");
for(const id of ["ibchem_part_5c81831f71b30c1e","ibchem_part_b3c8f15d11280183"])ensure(closure.blockedSourceIds.has(id),"Inherited proper-length definition escaped reservation");
const assetAudit=[],metadataCache=new Map();
function metadata(preview,kind){const file=source(`outputs/previews/${preview}/${kind}_preview.json`);if(!metadataCache.has(file))metadataCache.set(file,json(file));return metadataCache.get(file);}
for(const q of served){
 const n=parentMap.get(q.parent_id);ensure(n&&Number(q.year)<2026&&analysis.parts[q.source_part_id].status==="included","Ineligible A5 source");
 ensure(!closure.blockedParentIds.has(n.id)&&!n.parts.some(p=>badCrop.has(p.source_part_id)),"Held whole parent selected");
 const filenames=[...(n.pages||[]),...(n.crops||[]),...n.parts.flatMap(p=>p.crops||[])];
 ensure(filenames.every(f=>!blockedPageKeys.has(n.preview+"/"+pageNo(f))),"Reserved question page in full context");
 for(const [role,files] of Object.entries({question:q.question_images,context:q.context_images,markscheme:q.markscheme_images}))for(const file of files){
  const digest=sha(bytes(file)),name=path.basename(file);ensure(/[\\/]crops[\\/](question|mark)_.*\.png$/.test(file),"Full page or document selected");
  const meta=metadata(n.preview,role==="markscheme"?"mark_scheme":"question");
  const entries=role==="markscheme"?meta.entries:meta.question_groups.flatMap(g=>[{...g,owner_question:g.question_number},...g.parts.map(p=>({...p,owner_question:g.question_number}))]);
  const matches=entries.filter(e=>(e.crop_image_paths||[]).some(f=>path.basename(f)===name));
  ensure(matches.length===1,"Unattributed rendered crop: "+file);
  const match=matches[0],owner=role==="markscheme"?match.question_number:match.owner_question;
  ensure(String(owner)===String(n.question),"Crop belongs to a different original question: "+file);
  ensure(match.crop_regions?.length&&match.crop_regions.every(validRegion),"Rendered A5 crop has no valid own rectangle: "+file);
  const reserved=entries.filter(e=>heldPreviewQuestions.has(n.preview+"/"+(role==="markscheme"?e.question_number:e.owner_question)));
  const missingReservedQuestions=[...new Set(reserved.filter(e=>!e.crop_regions?.length||!e.crop_regions.every(validRegion)).map(e=>String(role==="markscheme"?e.question_number:e.owner_question)))].sort();
  const exception=missingReservedQuestions.length?geometry.requireException({source_part_id:q.source_part_id,parent_id:q.parent_id,role,path:file,sha256:digest,missing_reserved_questions:missingReservedQuestions}):null;
  ensure(!reserved.some(e=>(e.crop_regions||[]).some(b=>validRegion(b)&&(match.crop_regions||[]).some(a=>overlap(a,b)))),"Rendered crop overlaps a reserved question: "+file);
  assetAudit.push({source_part_id:q.source_part_id,parent_id:q.parent_id,role,path:file,sha256:digest,owner_question:owner,matched_metadata:true,reserved_rectangle_overlaps:0,own_rectangles_valid:true,missing_reserved_questions:missingReservedQuestions,additional_geometry_review:exception?{path:geometry.path,sha256:sha(bytes(geometry.path)),review_complete:true,reserved_content_found:false}:null});
 }
}
const claims={
 1:{method:"Complete native prompt and answer-table visual review; full-corpus and surviving-parent comparison",finding:"No exact archive counterpart identified. The test asks both Earth and spacecraft arrival-clock readings in terms of D and v. All proposed archive candidates are reserved. The four surviving A5 MCQs were individually compared and ask different tasks.",origin_status:"unconfirmed; all candidate identities withheld"},
 2:{method:"Full-prompt and distinctive-value searches across full corpus and remaining whole-parent text",finding:"No identical two-beacon, 1200 m, 0.80c Lorentz interval task found. Nearby light-clock, three-beacon, reflected-light and 0.950c lightning questions have different events, values and assessed operations. Every proposed source is reserved.",origin_status:"unconfirmed; all candidate identities withheld"},
 3:{method:"Direct visual review of the P/Q/R spacetime event diagram and comparison with surviving graph tasks",finding:"No matching diagram/task was identified in the release scope. Direct side-by-side comparison with the surviving May 2016 three-beacon diagram confirms different event positions and axes slopes, not merely changed event letters. All retrieved candidate parents are reserved; the surviving modern worldline MCQ asks a different task.",origin_status:"unconfirmed; all candidate identities withheld"},
 4:{method:"Full-prompt search and surviving whole-parent comparison, including all four retained MCQs",finding:"No identical opposite-moving two-ship symbolic speed MCQ identified. Retrieved candidates are reserved. The retained 2025 relative-observer speed question uses specified 0.50c measurements and a different observer relation.",origin_status:"unconfirmed; all candidate identities withheld"},
 5:{method:"Complete prompt and numerical/context comparison across corpus and remaining parents",finding:"No identical 0.60c spaceship and 0.10c same-direction probe question identified. All proposed candidates are reserved; unrelated black-hole probe material is outside the authored A5 release scope.",origin_status:"unconfirmed; all candidate identities withheld"},
 6:{method:"Direct visual review of the same-position S-prime diagram; whole-parent/candidate comparison",finding:"The closest archived coordinate-geometry candidates, including November 2018 Q5 SL/HL, are fully reserved. No identical graph survives in the selected release pool.",origin_status:"unconfirmed; all candidate identities withheld"},
 7:{method:"Rewritten numerical stem identified beyond lexical matching",finding:"The November 2016 round-trip twin problem is the same 0.60c, three-light-year calculation with a rewritten traveller description. The supplemental reservation covers both level parents and every sibling.",origin_status:"identified rewritten original"},
 8:{method:"Original stem/value comparison and full-parent/level closure",finding:"May 2024 TZ2 Q4 is reserved in SL and HL, including all context and parts.",origin_status:"identified original"},
 9:{method:"Original spacetime event diagram/task comparison and full-parent/level closure",finding:"May 2024 TZ2 Q5 is reserved in SL and HL, including the additional part whose group identity differs.",origin_status:"identified original"},
 10:{method:"Original task comparison plus conservative standalone proper-length definition search, including commands inherited from parent context",finding:"May 2024 TZ1 Q3 is reserved in both levels. Matching standalone proper-length definitions, including May 2007 TZ2 G1 with an inherited definition instruction, are additionally reserved with their full parents and twins. The final 72 complete parent-question texts were cross-checked for surviving definition variants.",origin_status:"identified original and definition variants"},
 11:{method:"Original relative-velocity and simultaneity task comparison",finding:"May 2024 TZ1 Q4 is fully reserved in SL and HL.",origin_status:"identified original"},
 12:{method:"Original spacetime diagram, coordinate and invariance task comparison",finding:"May 2024 TZ1 Q5 is fully reserved in SL and HL.",origin_status:"identified original"},
 13:{method:"Original spacecraft stem/diagram comparison and cross-zone/level closure",finding:"November 2023 Q5 is reserved in SL and HL for both TZ1 and TZ2.",origin_status:"identified original"},
 14:{method:"Direct visual reading of scanned page 17 followed by original source comparison",finding:"May 2019 TZ1 Q4, the 3230 m muon problem, is fully reserved in SL and HL. All six original source parts are blocked.",origin_status:"identified scanned original"},
 15:{method:"Standalone definition semantic comparison including reversed word order",finding:"All standalone reference-frame and inertial-reference-frame definition variants found in the full corpus are reserved with their full parents, level twins and duplicates; concept-application questions are not treated as identical definitions.",origin_status:"semantic task equivalents conservatively reserved"}
};
const testQuestions=supplement.school_test_question_coverage.map(q=>{ensure(q.candidate_source_parts.length&&q.all_candidates_reserved,"A5 test candidates not all reserved");ensure(q.candidate_source_parts.every(id=>closure.blockedSourceIds.has(id)),"A5 test candidate escaped current closure");if(q.identified_whole_archive_parents)ensure(q.identified_whole_archive_parents.every(id=>closure.blockedParentIds.has(id)),"An identified A5 original parent escaped closure");return{question:q.question,review_complete:true,pages:q.pages,...claims[q.question],candidate_source_parts:q.candidate_source_parts,all_candidates_reserved:true,identified_original_parent_ids:q.identified_whole_archive_parents||[],all_identified_parts_and_twins_reserved:q.all_identified_parts_and_twins_reserved??null};});
const reasons={};for(const r of supplement.candidate_records){let reason=r.reason;if(reason==="served"){if(parentMap.get(r.parent_id).parts.some(p=>badCrop.has(p.source_part_id)))reason="reviewed_incomplete_or_wrong_crop";else if(removedByNotes.has(r.source_part_id))reason="reviewed_textual_test_reference_or_page_hold";else if(geometry.heldParentIds.has(r.parent_id))reason="reviewed_additional_geometry_hold";else if(analysis.parts[r.source_part_id]?.status!=="included")reason="outside_authored_current_A5_scope_"+(analysis.parts[r.source_part_id]?.status||"missing");}reasons[reason]=(reasons[reason]||0)+1;}
const record={schema_version:1,topic:"A.5",review_complete:true,reviewed_utc:new Date().toISOString(),unresolved_relevant_items:[],reviewed_source_part_ids:actual,reviewed_parent_ids:[...servedParents].sort(),fingerprints:[...fingerprints.values()].sort((a,b)=>a.path.localeCompare(b.path)),test_questions:testQuestions,
 scope:{parts:served.length,parents:servedParents.size,year_min:Math.min(...served.map(q=>Number(q.year))),year_max:Math.max(...served.map(q=>Number(q.year))),native_A5_candidates:supplement.candidate_records.length,first_withholding_reason_counts:reasons,rule:"Current authored A5 inclusions intersected with all candidate/test reservations, full-parent/twin/duplicate closure, reserved question-page holds and reviewed crop holds. Every 2026+ exam is prohibited."},
 current_school_test_fingerprints:freshness,
 reserved_source_geometry_reviews:[],
 reviewed_baseline:{path:baselinePath,sha256:sha(baselineBytes),original_parts:146,original_crop_hold_source_ids:originalCropHolds,note_review_removal_source_ids:[...removedByNotes].sort(),geometry_held_parent_ids:[...geometry.heldParentIds].sort(),retained_source_part_ids:actual},
 additional_geometry_review:{path:geometry.path,sha256:sha(bytes(geometry.path)),held_parent_ids:[...geometry.heldParentIds].sort(),retained_exception_records:assetAudit.filter(a=>a.additional_geometry_review).length,suppressed_assets:geometry.report.suppressed_assets||[],required_assets:geometry.report.required_assets||[]},
 shared_parent_crop_review:{path:local("reports/ib-a5-shared-parent-crop-review.json"),sha256:sha(bytes(local("reports/ib-a5-shared-parent-crop-review.json"))),withheld_source_ids:newCropHolds,retained_unchanged_source_ids:sharedCropReview.retain_unchanged_source_ids},
 reviewed_mcq_metadata:{input_path:local("dist/physics-inputs/ib-physics-mcq.json"),source_part_ids:served.filter(q=>q.answer_status==="reviewed_source_key").map(q=>q.source_part_id).sort(),answers:Object.fromEntries(served.filter(q=>q.answer_status==="reviewed_source_key").map(q=>[q.source_part_id,q.correct_option])),presentation_corrections:mcq.presentation_corrections,note:"Printed answer keys and complete A-D options are visually reviewed and source-fingerprinted. Only existing eligible records receive answer fields; the crop role correction preserves the exact source-image union."},
 independent_definition_review:{date:"2026-09-12",reviewer:"physics_wrapper agent",parts:146,status:"passed",scope:"All selected definition/target-term candidates including inherited context and markscheme, all 19 authored REF/PROPER parts, and eight long target-term prompts",finding:"No additional standalone proper-length, reference-frame or inertial-frame definitions survive. Remaining definitions concern proper time, spacetime or invariant quantities; remaining proper-length prompts identify or justify the measuring observer."},
 rendered_asset_review:{distinct_images:new Set(assetAudit.map(a=>a.path)).size,distinct_question_images:new Set(assetAudit.filter(a=>a.role!=="markscheme").map(a=>a.path)).size,distinct_markscheme_images:new Set(assetAudit.filter(a=>a.role==="markscheme").map(a=>a.path)).size,full_corpus_sibling_parts_checked:corpusSiblings.length,reserved_parent_or_sibling_hits:0,reserved_question_page_hits:0,reserved_rectangle_overlap_hits:0,all_assets_attributed_to_expected_original_question:true,assets:assetAudit,review_note:"Every published question, whole-parent context and markscheme crop was checked against original crop metadata and source reservations. Three unattributed old answer crops were visually checked, found incorrect, and their two whole parents withheld. This is a source-boundary audit; it does not claim every image received a separate visual proofreading pass."},
 related_source_quality:{known_swapped_text_rows:["Q164","Q165","Q167","Q168","Q200","Q201","Q206","Q207"],status:"All source appearances are withheld by the standalone-definition whole-parent closure; none survives in A5."},
 other_current_test_triage:{scope:"125 current ABCDE and Data Analysis PDF/DOCX snapshots compared; current A5 documents freshly rehashed on 2026-09-12",no_candidate_rows_in_current_files:45,structural_or_answer_fragments:35,readable_rows:10,unique_readable_prompts:3,unrelated_items:[{topic:"D.1",file:"D/D.1 HL Test.pdf",page:6,question:11,status:"Touching-sphere gravitation task; no identified A5 overlap"},{topic:"D.1",files:["D/D1 SL.pdf","D/d1+d2 HL test.pdf"],pages:[3,2],questions:[7,5],status:"Elliptical-orbit acceleration task; no identified A5 overlap"},{topic:"D.1",files:["D/D1 SL.pdf","D/d1+d2 HL test.pdf"],pages:[4,3],questions:[8,6],status:"Inverse-square orbit force-graph task; no identified A5 overlap"}],note:"Repeated DOCX/PDF appearances account for ten readable rows. These remain unlinked archive origins and are not falsely marked resolved; their physics content is outside the reviewed A5 scope."},
 limitations:["This clearance binds only the listed retained source parts from the immutable 146-part baseline and the exact files and rendered assets fingerprinted here. Only the two original crop holds, explicit reviewed note removals and explicit geometry parent holds may reduce that scope. Any changed assessment, catalogue, scope, exclusion rule or image invalidates the record.","The originals of school-test Q1-Q6 remain unconfirmed. Their complete prompts/diagrams were compared against the proposed pool; all candidate links were withheld and no matching surviving task was identified. Review completion does not turn proposed matches into confirmed identities.","The A5 shared-drive fingerprints are current as of 2026-09-12. The broader 125-file shared-drive comparison was made on 2026-09-10; newly changed non-A5 assessments require renewed comparison.","The review excludes identified and possible copies or rewrites of test questions. Sharing the same syllabus skill alone is not treated as an identical question.","Missing or invalid reserved rectangles require an exact reviewed crop exception; every own crop rectangle must be valid, and every valid reserved rectangle still participates in the overlap check."]};
const out=local("reports/ib-a5-release-clearance.json");fs.writeFileSync(out,JSON.stringify(record,null,2)+"\n");console.log(JSON.stringify({path:out,sha256:sha(fs.readFileSync(out)),parts:served.length,parents:servedParents.size,images:record.rendered_asset_review.distinct_images,marks:record.rendered_asset_review.distinct_markscheme_images,fingerprints:record.fingerprints.length},null,2));
}
module.exports={main,overlap};
if(require.main===module)main();
