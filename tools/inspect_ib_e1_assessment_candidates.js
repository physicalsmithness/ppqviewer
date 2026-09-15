"use strict";
// Read-only inspection helper for the fixed E1 checkpoint and existing holds.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {parseCsv,buildIbExclusions}=require('./physics-test-exclusions');
const DB='C:/CodexProjects/PaperDatabases', ROOT=path.resolve(__dirname,'..');
const SNAP=DB+'/Physics Categorisation/returns/E1_E2_REVIEW_2026-09-13/checkpoint_004';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function load(){
 const read=p=>parseCsv(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
 const scopes=read(SNAP+'/candidate_scope_outcomes.csv'),assignments=read(SNAP+'/part_type_assignments.csv'),demands=read(SNAP+'/reconciled_individual_demands.csv');
 const corpus=read(DB+'/outputs/exports/ib_physics_archive_flat_v5.csv');
 const byId=new Map(corpus.map(r=>[r.part_id,r]));
 const extras=['reports/ib-a5-reviewed-test-exclusions.json','reports/ib-review-note-reservations.json','reports/ib-d2-reviewed-test-exclusions.json','reports/ib-a1-c1-reviewed-test-exclusions.json'].map(p=>path.join(ROOT,p));
 const ex=buildIbExclusions({paperdbRoot:DB,questions:[],extraExclusionsPath:path.join(ROOT,'dist/physics-audit/current-ib-tests.json'),extraExclusionsPaths:extras});
 const ids=[...new Set([...scopes.filter(r=>r.candidate_topic==='E.1'),...assignments.filter(r=>r.candidate_topic==='E.1'),...demands.filter(r=>r.understanding_code.startsWith('E.1.'))].map(r=>r.part_id))];
 const box={window:{}};vm.runInNewContext(fs.readFileSync(DB+'/Physics Categorisation/viewer/ibphysics_catalogue.js','utf8'),box);
 const native=new Map(box.window.IBPHYS_QUESTIONS.flatMap(q=>q.parts.map(p=>[p.source_part_id,{q,p}])));
 const rows=ids.map(id=>({id,source:byId.get(id),scope:scopes.find(r=>r.part_id===id&&r.candidate_topic==='E.1'),assignments:assignments.filter(r=>r.part_id===id),demands:demands.filter(r=>r.part_id===id),native:native.get(id),reserved:ex.blockedSourceIds.has(id)}));
 return {rows,scopes,assignments,demands,corpus,ex};
}
function brief(r){const s=r.source;return {id:r.id,ref:[s.year,s.session,s.paper,s.level,s.time_zone,s.question,s.part_label].join(' '),scope:r.scope?.current_primary_subtopic,status:r.scope?.status,q:s.question_text,stem:s.shared_stem,ms:s.ms_text,why:r.scope?.reason,demands:r.demands.filter(x=>x.understanding_code.startsWith('E.1.')).map(d=>[d.understanding_code,d.role,d.reason])};}
if(require.main===module){const state=load(),mode=process.argv[2]||'mapped',start=Number(process.argv[3]||0),take=Number(process.argv[4]||15);const rows=state.rows.filter(r=>!r.reserved&&(mode==='all'||mode==='mapped'&&r.scope?.status==='mapped'||mode==='component'&&r.scope?.status!=='mapped'&&r.demands.some(x=>x.understanding_code.startsWith('E.1.')&&x.role==='assessed')));console.log(JSON.stringify({total:rows.length,start,rows:rows.slice(start,start+take).map(brief)},null,2));}
module.exports={load,brief,DB,ROOT,SNAP,hash};
