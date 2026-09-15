"use strict";
// Read-only candidate inspection, deliberately not an eligibility/clearance rule.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {parseCsv,buildIbExclusions}=require('./physics-test-exclusions');
const DB='C:/CodexProjects/PaperDatabases',ROOT=path.resolve(__dirname,'..');
const SNAP=DB+'/Physics Categorisation/returns/E1_E2_REVIEW_2026-09-13/checkpoint_004';
const CORPUS=DB+'/outputs/exports/ib_physics_archive_flat_v5.csv';
// Freeze the assessment baseline used for this independent review. Do not import
// the live global-additions loader: it will later include this review itself.
const BASELINE_EXCLUSION_PATHS=['dist/physics-audit/current-ib-tests.json','reports/ib-a5-reviewed-test-exclusions.json','reports/ib-a1-c1-reviewed-test-exclusions.json','reports/ib-review-note-reservations.json','reports/ib-d2-reviewed-test-exclusions.json'].map(p=>path.join(ROOT,p));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function load(){
 const read=p=>parseCsv(fs.readFileSync(p,'utf8'));
 const scopes=read(SNAP+'/candidate_scope_outcomes.csv'),assignments=read(SNAP+'/part_type_assignments.csv'),demands=read(SNAP+'/reconciled_individual_demands.csv');
 const corpus=read(CORPUS),byId=new Map(corpus.map(r=>[r.part_id,r]));
 const ex=buildIbExclusions({paperdbRoot:DB,questions:[],extraExclusionsPaths:BASELINE_EXCLUSION_PATHS});
 const ids=[...new Set([...scopes.filter(r=>r.candidate_topic==='E.2'),...assignments.filter(r=>r.candidate_topic==='E.2'),...demands.filter(r=>r.understanding_code.startsWith('E.2.'))].map(r=>r.part_id))];
 const box={window:{}};vm.runInNewContext(fs.readFileSync(DB+'/Physics Categorisation/viewer/ibphysics_catalogue.js','utf8'),box);
 const native=new Map(box.window.IBPHYS_QUESTIONS.flatMap(q=>q.parts.map(p=>[p.source_part_id,{q,p}])));
 const rows=ids.map(id=>({id,source:byId.get(id),scope:scopes.find(r=>r.part_id===id&&r.candidate_topic==='E.2'),assignments:assignments.filter(r=>r.part_id===id),demands:demands.filter(r=>r.part_id===id),native:native.get(id),reserved:ex.blockedSourceIds.has(id)}));
 return {rows,scopes,assignments,demands,corpus,ex,native};
}
function brief(r){const s=r.source;return {id:r.id,ref:[s.year,s.session,'P'+s.paper,s.level,s.time_zone,'Q'+s.question,s.part_label].join(' '),status:r.scope?.status,primary:r.scope?.current_primary_subtopic,q:s.question_text,stem:s.shared_stem,context:s.parent_context,ms:s.ms_text,e2:r.demands.filter(x=>x.understanding_code.startsWith('E.2.')).map(x=>[x.understanding_code,x.role])};}
if(require.main===module){const s=load(),start=Number(process.argv[2]||0),take=Number(process.argv[3]||20),rows=s.rows.filter(r=>!r.reserved);console.log(JSON.stringify({total:rows.length,start,rows:rows.slice(start,start+take).map(brief)},null,2));}
module.exports={load,brief,DB,ROOT,SNAP,CORPUS,hash,BASELINE_EXCLUSION_PATHS};
