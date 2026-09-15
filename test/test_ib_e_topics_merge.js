"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {mergeERelease}=require("../tools/merge_ib_e_topics_release");
function record(id,topics=["E.1"]){
  return {id:"Q"+id,parent_id:"P"+id,source_part_id:"ibchem_part_"+id,source_group_id:"G"+id,
    topic_codes:topics,analysis_groups:["g"],analysis_atoms:["exact:v1"],analysis_types:[],analysis_used_atoms:[],
    analysis_optional_atoms:[],analysis_canonical_ids:[],current_topic_levels:Object.fromEntries(topics.map(t=>[t,"HL"])),
    year:"2025",paper:"1A",level:"HL",question_number:"1",label:"",marks:1,
    question_images:["q.png"],context_images:[],markscheme_images:["m.png"],correct_option:"B",answer_status:"matched_source_key"};
}
test("E-only additions preserve all existing records and both E memberships",()=>{
  const prior=record("abc",["D.2"]),copy=structuredClone(prior),e=record("def",["E.1","E.2"]);
  const result=mergeERelease([prior],[e]);assert.deepEqual(result,[copy,e]);assert.deepEqual(prior,copy);
});
test("shared source parts merge exact E tags without duplicating the part",()=>{
  const prior=record("abc",["D.2"]),e=record("abc",["E.1","E.2"]);e.analysis_atoms=["e1:v2","e2:v3"];
  const result=mergeERelease([prior],[e]);assert.equal(result.length,1);
  assert.deepEqual(result[0].topic_codes,["D.2","E.1","E.2"]);assert.deepEqual(result[0].analysis_atoms,["exact:v1","e1:v2","e2:v3"]);
});
test("a conflicting source key, crop, mark, label or group cannot be merged",()=>{
  for(const [field,value]of [["correct_option","C"],["question_images",["different.png"]],["marks",2],["label","(b)"],["source_group_id","different"]]){
    const prior=record("abc",["D.2"]),e=record("abc");e[field]=value;assert.throws(()=>mergeERelease([prior],[e]));
  }
});
test("source identity aliasing and repeated source IDs are rejected",()=>{
  const a=record("abc"),b=record("def");b.id=a.id;
  assert.throws(()=>mergeERelease([a],[b]));assert.throws(()=>mergeERelease([],[a,a]));
});
test("out-of-scope topics and reserved exam years are rejected",()=>{
  for(const topics of [[],["A.1"],["E.1","D.2"]])assert.throws(()=>mergeERelease([],[record("abc",topics)]));
  for(const year of ["2026","2027","2003","unknown"]){const q=record("abc");q.year=year;assert.throws(()=>mergeERelease([],[q]));}
});
test("explicit reviewed untyped topic scope stays untyped",()=>{
  const q=record("abc");q.analysis_groups=[];q.analysis_atoms=[];
  assert.deepEqual(mergeERelease([],[q])[0].analysis_atoms,[]);
});
test("shared parts preserve and deduplicate both scope-note lists without changing either input",()=>{
  const prior=record("abc",["D.2"]),e=record("abc",["E.1","E.2"]);
  prior.practice_scope_notes=["Existing topic scope.","Read the marked part."];
  e.practice_scope_notes=["E1 is assessed within a mixed question.","Read the marked part."];
  const before=structuredClone([prior,e]);
  function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
  freeze(prior);freeze(e);
  const result=mergeERelease([prior],[e]);
  assert.equal(result.length,1);
  assert.deepEqual(result[0].practice_scope_notes,["Existing topic scope.","Read the marked part.","E1 is assessed within a mixed question."]);
  assert.deepEqual([prior,e],before);
  result[0].practice_scope_notes.push("Result-only edit.");
  assert.deepEqual([prior,e],before);
});
test("E scope notes survive merging into an existing part without prior notes",()=>{
  const prior=record("abc",["D.2"]),e=record("abc");e.practice_scope_notes=["Only the assessed E1 component is counted."];
  const before=structuredClone([prior,e]),result=mergeERelease([prior],[e]);
  assert.deepEqual(result[0].practice_scope_notes,e.practice_scope_notes);
  assert.notEqual(result[0].practice_scope_notes,e.practice_scope_notes);
  assert.deepEqual([prior,e],before);
});
function sibling(source,part,topics){
  return {...record(source,topics),id:'21M.P2.SL.TZ2.Q4'+part,parent_id:'21M.P2.SL.TZ2.Q4',question_number:'4',label:part,paper:'2',marks:2};
}
test("new E1 Q4(a) precedes existing D2 Q4(b) without moving unrelated questions",()=>{
  const b=sibling('4bd3e3ead239b35a','(b)',['D.2']),a=sibling('8038ee395e8b43da','(a)',['E.1']);
  const first=record('aaa',['A.1']),middle=record('bbb',['C.1']),last=record('ccc',['A.5']);
  const existing=[first,b,middle,last],before=structuredClone([existing,a]);
  const result=mergeERelease(existing,[a]);
  assert.deepEqual(result.filter(q=>q.parent_id===a.parent_id),[a,b]);
  for(const index of [0,2,3])assert.deepEqual(result[index],existing[index],'Unrelated record positions remain unchanged');
  assert.deepEqual([existing,a],before,'Neither source input is changed');
});
test("cross-topic nested parts keep logical prefix and Roman order with shuffled inputs",()=>{
  const existing=[sibling('a','(b)(i)',['D.2']),sibling('b','(a)(ix)',['D.2'])];
  const added=[sibling('c','(a)(v)',['E.1']),sibling('d','(a)(ii)',['E.2']),sibling('e','(a)(iv)',['E.1']),sibling('f','(a)(i)',['E.1']),sibling('ff','(a)',['E.1'])];
  const expected=['(a)','(a)(i)','(a)(ii)','(a)(iv)','(a)(v)','(a)(ix)','(b)(i)'];
  const merged=mergeERelease(existing,added);assert.deepEqual(merged.map(q=>q.label),expected);
  assert.deepEqual(mergeERelease([...existing].reverse(),[...added].reverse()).map(q=>q.label),expected);
  assert.deepEqual(new Map(merged.map(q=>[q.id,q])),new Map([...existing,...added].map(q=>[q.id,q])),'Ordering does not alter a source record');
});
