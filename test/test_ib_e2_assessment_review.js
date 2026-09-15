"use strict";
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {build,closure,validateFingerprints}=require('../tools/build_ib_e2_assessment_review');
const ROOT=path.resolve(__dirname,'..'),r=build();let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('every pinned eligible E2 part has an explicit review or existing-closure disposition',()=>{
 const pin=require('../reports/ib-e1-e2-eligibility-pin.json'),overlay=JSON.parse(fs.readFileSync(pin.eligibility.path));
 const expected=Object.entries(overlay.parts).filter(([id,p])=>p.topics?.['E.2']?.eligible).map(([id])=>id).sort();
 assert.deepEqual(r.reviewed_candidate_source_ids,expected);assert.equal(expected.length,252);
 const records=new Map(r.candidate_review.map(x=>[x.source_part_id,x]));
 const held=expected.map(id=>records.get(id)).filter(x=>x.disposition==='existing_assessment_hold');
 assert.equal(held.length,141);assert(held.every(x=>x.semantic_reviewed===false&&x.existing_closure_witness?.baseline_report_paths.length===5));
 assert(expected.filter(id=>!held.some(x=>x.source_part_id===id)).every(id=>records.get(id).semantic_reviewed));
});
test('all preflight IDs lie inside the fixed semantic read set and cannot expand its scope',()=>{
 const b=require('../reports/ib-e2-assessment-review-baseline.json');assert.deepEqual(r.semantic_reviewed_candidate_source_ids,b.initial_unreserved_source_ids);
 assert.equal(b.preflight_e2_source_ids.length,81);assert(b.preflight_e2_source_ids.every(id=>r.semantic_reviewed_candidate_source_ids.includes(id)));
 assert.equal(r.source_eligibility_coverage.uncovered_source_ids.length,0);
});
test('a changed evidence fingerprint is rejected without altering any file',()=>{
 const witness=r.source_files.find(x=>x.path.endsWith('ib-e2-reviewed-visual-witnesses.json'));assert(witness);
 validateFingerprints([witness]);assert.throws(()=>validateFingerprints([{...witness,sha256:'0'.repeat(64)}]),/Evidence changed/);
});
test('new holds close across parents, cross-level twins and duplicate links',()=>{
 const row=(id,preview,q,group='',duplicate='')=>({part_id:id,preview,question:q,cross_level_group_id:group,duplicate_of:duplicate,page_render_paths:`${preview}/question_v001_p001.png`});
 const c=closure([row('a','p','1'),row('b','p','1','g'),row('c','t','2','g'),row('d','t','2','','e'),row('e','u','3'),row('f','v','4')],['a']);
 assert.deepEqual([...c.ids].sort(),['a','b','c','d','e']);assert(c.pages.has('u/001'));assert(!c.pages.has('v/001'));
});
test('changed source number does not silently clear the close test variant',()=>{
 assert(r.blocked_source_ids.includes('ibchem_part_e6290f3ca090b95f'));
 assert(!r.blocked_source_ids.includes('ibchem_part_aedf0afa8753d139'));
 assert(r.reviewed_differences.some(x=>x.source_ids.includes('ibchem_part_aedf0afa8753d139')));
 assert.equal(r.closure_review.reviewed_public_removals.length,2);
 assert.deepEqual(Array.from(r.closure_review.reviewed_public_removals,x=>x.source_part_id).sort(),['ibchem_part_1ea95804146ce613','ibchem_part_ccda5ab0c7d1c164']);
 assert(!r.closure_review.reviewed_public_removals.some(x=>x.topic_codes.includes('A.5')||x.topic_codes.includes('C.1')));
});
test('review has no self-report, other E report or mutable global-loader dependency',()=>{
 const forbidden=['ib-current-review-additions.js','ib-e1-learner-scope-review.json','ib-e2-learner-scope-review.json'];
 assert(r.source_files.every(x=>!forbidden.some(n=>x.path.endsWith(n))));
 assert(r.source_files.every(x=>path.isAbsolute(x.path)&&/^[a-f0-9]{64}$/.test(x.sha256)));
 assert.equal(r.review_complete,true);assert.deepEqual(r.read_failures,[]);assert.deepEqual(r.unresolved_relevant_items,[]);
});
console.log(`${passed} E2 assessment review checks passed; sources were read only.`);
