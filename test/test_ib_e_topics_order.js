/* Original-source ordering only; no build outputs, sources or public files are written. */
"use strict";
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {build,project,orderPartsByOriginal,DB}=require('../tools/ib-e-topics-input');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
let checks=0;function check(label,run){run();checks++;console.log('ok '+label);}
const rows=labels=>labels.map((part_label,index)=>({part_id:'source-'+index,question:'4',part_label}));
const original=labels=>({question_number:'4',parts:labels.map(part_label=>({part_label}))});
check('source-ID input order never overrides the original printed part order',()=>{
  const archive=rows(['4(b)','4(a)']),before=JSON.stringify(archive);
  const ordered=orderPartsByOriginal(archive,original(['4(a)','4(b)','4(c)']));
  assert.deepEqual(ordered.map(r=>r.part_label),['4(a)','4(b)']);
  assert.equal(JSON.stringify(archive),before,'Source rows are not mutated');
  assert.equal(ordered[0],archive[1],'The exact original record survives ordering');
});
check('nested Roman labels and withheld siblings follow metadata without lexical guesses',()=>{
  const source=original(['4(a)(i)','4(a)(ii)','4(a)(iii)','4(a)(iv)','4(a)(v)','4(a)(ix)','4(b)']);
  assert.deepEqual(orderPartsByOriginal(rows(['4(a)(ix)','4(b)','4(a)(iv)','4(a)(ii)']),source).map(r=>r.part_label),['4(a)(ii)','4(a)(iv)','4(a)(ix)','4(b)']);
});
check('missing, repeated or wrong-parent labels cannot silently invent an order',()=>{
  assert.throws(()=>orderPartsByOriginal(rows(['4(z)']),original(['4(a)'])),/no unique original part position/);
  assert.throws(()=>orderPartsByOriginal(rows(['4(a)']),original(['4(a)','4(a)'])),/no unique original part position/);
  assert.throws(()=>orderPartsByOriginal(rows(['4(a)','4(a)']),original(['4(a)'])),/Repeated archive label/);
  assert.throws(()=>orderPartsByOriginal(rows(['4(a)']),{...original(['4(a)']),question_number:'5'}),/another original question/);
  assert.throws(()=>orderPartsByOriginal(rows(['4(a)']),{question_number:'4'}),/no part sequence/);
});
const input=build(),byId=new Map(input.corpus.map(row=>[row.part_id,row]));
check('the reported 21M SL Q4 case follows the exact original a/b/c metadata',()=>{
  const a=byId.get('ibchem_part_8038ee395e8b43da'),b=byId.get('ibchem_part_4bd3e3ead239b35a');
  assert(a&&b);assert.equal(a.preview,b.preview);
  const source=read(path.join(DB,'outputs/previews',a.preview,'question_preview.json')).question_groups.find(q=>String(q.question_number)==='4');
  assert.deepEqual(source.parts.map(part=>part.part_label),['4(a)','4(b)','4(c)']);
  assert.deepEqual(orderPartsByOriginal([b,a],source).map(row=>row.part_id),[a.part_id,b.part_id]);
});
check('every current E parent and its flat projection retain native part order',()=>{
  let multi=0;
  for(const parent of input.questions){
    const source=read(path.join(DB,'outputs/previews',parent.preview,'question_preview.json')).question_groups.find(q=>String(q.question_number)===parent.question);
    const rows=parent.parts.map(part=>byId.get(part.source_part_id));
    assert.deepEqual(parent.parts.map(part=>part.source_part_id),orderPartsByOriginal(rows,source).map(row=>row.part_id),parent.id);
    if(parent.parts.length>1)multi++;
  }
  assert(multi>0,'The real source has multipart parents to exercise');
  assert.deepEqual(project(input).map(q=>q.source_part_id),input.questions.flatMap(parent=>parent.parts.map(part=>part.source_part_id)));
  console.log('  '+input.questions.length+' parents; '+multi+' multipart parents');
});
console.log(checks+' original E part-order checks passed');
