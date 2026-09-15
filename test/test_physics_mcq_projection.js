"use strict";
// Metadata adoption must not expand the reviewed practice pool or replace crops.
const assert=require("assert"),fs=require("fs"),path=require("path");
const {ibInput,applyIbReviewedMetadata}=require("../tools/assemble_physics_preview");
const ROOT=path.resolve(__dirname,"..");
const read=file=>JSON.parse(fs.readFileSync(path.join(ROOT,file),"utf8"));
const clearance=read("reports/ib-a5-release-clearance.json");
const metadata=read("dist/physics-inputs/ib-physics-mcq.json");
const input=ibInput(),questions=input.questions.filter(q=>q.topic_codes.includes("A.5"));
const set=values=>[...new Set(values)].sort();
let checks=0;
function check(label,fn){fn();checks++;console.log("ok "+label);}
check("answer projection preserves the complete reviewed A5 source-ID set",()=>{
  assert.deepStrictEqual(set(questions.map(q=>q.source_part_id)),set(clearance.reviewed_source_part_ids));
});
check("context role correction preserves every original image",()=>{
  const actual=set(questions.flatMap(q=>[...q.question_images,...q.context_images,...q.markscheme_images]).map(p=>path.resolve(p)));
  const expected=set(clearance.rendered_asset_review.assets.map(a=>path.resolve(a.path)));
  assert.deepStrictEqual(actual,expected);
  console.log("  reviewed parts "+questions.length+", source images "+actual.length);
});
check("only visually reviewed MCQs receive the two public answer fields",()=>{
  for(const q of input.questions){
    const reviewed=metadata.parts[q.source_part_id];
    if(reviewed){assert.strictEqual(q.correct_option,reviewed.correct_option);assert.strictEqual(q.answer_status,"reviewed_source_key");}
    else{assert(!Object.hasOwn(q,"correct_option"));assert(!Object.hasOwn(q,"answer_status"));}
    for(const field of ["evidence","visual_review","question_source_sha256","markscheme_source_sha256","report"])assert(!Object.hasOwn(q,field));
  }
  assert(input.report.mcq_metadata.report.source_files.length>0);
});
check("the invariant definition retains its prompt and moves only the reviewed introduction",()=>{
  const id="ibchem_part_400ccd640c974718",q=questions.find(q=>q.source_part_id===id);
  const name=metadata.presentation_corrections[id].context_only_crop.filename;
  assert(q);assert(q.question_images.length>0);
  assert(!q.question_images.some(p=>path.basename(p)===name));
  assert.strictEqual(q.context_images.filter(p=>path.basename(p)===name).length,1);
  assert(q.question_images.some(p=>path.basename(p)==="question_7_a__ii_v015_p015_01_36de80b6aa.png"));
});
check("unknown answers cannot acquire automatic marking",()=>{
  const fixture={source_part_id:"unknown",paper:"1A",marks:1,question_images:[],context_images:[],markscheme_images:[]};
  assert.deepStrictEqual(applyIbReviewedMetadata(structuredClone(fixture),{parts:{},presentation_corrections:{}}),fixture);
  assert.throws(()=>applyIbReviewedMetadata(fixture,{parts:{unknown:{correct_option:"?",answer_status:"reviewed_source_key"}},presentation_corrections:{}}),/ambiguous/);
});
check("same-name crop with a different fingerprint cannot change role",()=>{
  const id="ibchem_part_400ccd640c974718",current=questions.find(q=>q.source_part_id===id);
  const correction=structuredClone(metadata.presentation_corrections[id]);
  const file=current.context_images.find(p=>path.basename(p)===correction.context_only_crop.filename);
  const fixture={...current,question_images:[...current.question_images,file],context_images:current.context_images.filter(p=>p!==file)};
  correction.context_only_crop.sha256="0".repeat(64);
  assert.throws(()=>applyIbReviewedMetadata(fixture,{parts:{},presentation_corrections:{[id]:correction}}),/context-only crop/);
});
console.log(checks+" reviewed MCQ projection checks passed");
