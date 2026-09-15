"use strict";
const assert=require('assert');
const {references,resolveReference,closeParts}=require('../tools/audit_ib_review_notes');
let passed=0;function check(name,fn){fn();passed++;console.log('PASS '+name);}
const row=(part_id,question='3',time_zone='TZ1',extra={})=>({part_id,preview:'p-'+time_zone,year:'2009',session:'May',paper:'1',level:'SL',question,time_zone,cross_level_group_id:part_id,duplicate_of:'',page_render_paths:'pages/question_v003_p003.png;pages/mark_v002_p002.png',...extra});
check('Weak or negative review language retains exact candidate evidence',()=>{
  const r=references('The strongest v3 retrieval is only 2009 May TZ1 P1 SL Q3 3 (coverage 0.164); source differs substantively.');
  assert.equal(r.length,1);assert.equal(r[0].question,'3');assert.equal(resolveReference(r[0],[row('a'),row('b','30'),row('c','3','TZ2')])[0].part_id,'a');
});
check('An explicit time zone is exact; omitted time zone preserves both historical candidates',()=>{
  const corpus=[row('a'),row('b','3','TZ2')];
  assert.deepEqual(resolveReference(references('2009 May P1 SL Q3')[0],corpus).map(x=>x.part_id),['a','b']);
  assert.deepEqual(resolveReference(references('2009 May TZ1 P1 SL Q3')[0],corpus).map(x=>x.part_id),['a']);
});
check('Lettered parent and Paper 1A preserve full tuple without guessing a subpart',()=>{
  const ref=references('2025 November TZ3 P1A HL QA2 A2(b)(ii)')[0];
  assert.deepEqual([ref.year,ref.session,ref.paper,ref.level,ref.time_zone,ref.question],['2025','Nov','1A','HL','TZ3','A2']);
  assert.equal(references('Q3 resembles the May 2009 skydiver question').length,0);
});
check('Explicit part and group identifiers resolve only exact corpus identities',()=>{
  const corpus=[row('ibchem_part_ab',{},{},{cross_level_group_id:'ibchem_xlvl_12'}),row('ibchem_part_ac',{},{},{cross_level_group_id:'ibchem_xlvl_12'})];
  assert.equal(resolveReference(references('ibchem_xlvl_12')[0],corpus).length,2);
  assert.equal(resolveReference(references('ibchem_part_ab')[0],corpus).length,1);
  assert.equal(resolveReference(references('ibchem_part_abcd')[0],corpus).length,0);
});
check('Whole-parent, declared twin and duplicate closure reaches a fixed point',()=>{
  const corpus=[row('a'),row('b','3','TZ1',{cross_level_group_id:'twin'}),row('c','7','TZ2',{cross_level_group_id:'twin'}),row('d','7','TZ2',{duplicate_of:'e'}),row('e','9','TZ3'),row('f','9','TZ3'),row('unrelated','11','TZ3')];
  const result=closeParts(corpus,new Set(['a']));
  assert.deepEqual([...result.closure].sort(),['a','b','c','d','e','f']);
  assert.equal(result.origins.get('c').reason,'declared_cross_level_group');
  assert.equal(result.origins.get('e').reason,'declared_duplicate');
  assert.ok([...result.pages].every(x=>x.includes('/question_')));
});
console.log(passed+' review-note reservation checks passed');
