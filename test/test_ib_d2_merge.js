"use strict";
const assert = require("node:assert/strict");
const {mergeD2Release} = require("../tools/merge_ib_d2_release");
const q = {id:"25M.P2.HL.TZ1.Q2(a)",parent_id:"25M.P2.HL.TZ1.Q2",source_part_id:"ibchem_part_abcdef",
  year:"2025",paper:"2",level:"HL",question_number:"2",label:"(a)",marks:2,
  question_images:["question.png"],context_images:["context.png"],markscheme_images:["mark.png"],
  topic_codes:["A.5"],analysis_groups:["A5.F"],analysis_atoms:["A5.1"],analysis_types:[],
  analysis_used_atoms:[],analysis_optional_atoms:[],analysis_canonical_ids:[],current_topic_levels:{"A.5":"HL"}};
const d2 = {...structuredClone(q),topic_codes:["D.2"],analysis_groups:["d2-version::family:1"],
  analysis_atoms:["d2-version::D2.1"],current_topic_levels:{"D.2":"HLSL"}};
let checks=0;
function check(name, fn){fn();checks++;console.log("PASS "+name);}
check("overlap enriches one stable question without mutating inputs or assets",()=>{
  const originals=JSON.stringify([q,d2]), merged=mergeD2Release([q],[d2]);
  assert.equal(merged.length,1);assert.equal(merged[0].id,q.id);
  assert.deepEqual(merged[0].topic_codes,["A.5","D.2"]);
  assert.deepEqual(merged[0].analysis_atoms,["A5.1","d2-version::D2.1"]);
  assert.deepEqual(merged[0].current_topic_levels,{"A.5":"HL","D.2":"HLSL"});
  assert.deepEqual(merged[0].context_images,q.context_images);assert.equal(JSON.stringify([q,d2]),originals);
});
check("new sources are appended exactly once",()=>{
  const next={...d2,id:"new",source_part_id:"ibchem_part_123456"};
  assert.equal(mergeD2Release([q],[next]).length,2);
  assert.throws(()=>mergeD2Release([q],[next,next]),/Duplicate/);
  assert.throws(()=>mergeD2Release([q],[{...next,id:q.id}]),/aliases/);
});
check("changed ownership, image context, marks and source metadata fail closed",()=>{
  for(const change of [{id:"other"},{parent_id:"other"},{context_images:["other.png"]},{marks:3},{level:"SL"}])
    assert.throws(()=>mergeD2Release([q],[{...d2,...change}]),/source content differs/);
});
check("exam years and direct descriptor scope are mandatory",()=>{
  for(const change of [{year:"2026"},{year:"unknown"},{analysis_atoms:[]},{topic_codes:["DATA"]}])
    assert.throws(()=>mergeD2Release([],[{...d2,...change}]));
});
check("existing source keys are retained and conflicts fail",()=>{
  assert.equal(mergeD2Release([{...q,correct_option:"A",answer_status:"reviewed_source_key"}],[d2])[0].correct_option,"A");
  assert.throws(()=>mergeD2Release([{...q,correct_option:"A"}],[{...d2,correct_option:"B"}]),/Conflicting/);
});
console.log(checks+" D2 merge checks passed");
