"use strict";
// Synthetic read-only source fixtures: no source corpus or review is modified.
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const file=path.resolve(__dirname,'../tools/ib-a5-additional-geometry.js'),code=fs.readFileSync(file,'utf8');
const ROOT=path.resolve(__dirname,'..'),DB=path.resolve(process.env.PHYSICS_PAPERDB_ROOT||'C:/CodexProjects/PaperDatabases');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const copy=x=>JSON.parse(JSON.stringify(x));
const parent='07M.P3.SL.TZ2.QG3',part='ibchem_part_a123',preview='synthetic_review';
const cropRoot=path.join(DB,'outputs/previews',preview,'crops'),good=path.join(cropRoot,'mark_scheme_G3.png'),bad=path.join(cropRoot,'mark_scheme_H.png');
const nativePath=path.join(DB,'Physics Categorisation/viewer/ibphysics_catalogue.js'),csvPath=path.join(DB,'outputs/exports/ib_physics_archive_flat_v5.csv'),metaPath=path.join(DB,'outputs/previews',preview,'mark_scheme_preview.json'),reviewPath=path.join(ROOT,'reports/ib-a5-additional-geometry-review.json');
function fixture(mutate=()=>{}){
  const state={files:new Map(),metadata:{entries:[{question_number:'G3',crop_image_paths:['crops/mark_scheme_G3.png'],crop_regions:[{page_number:1,bbox:[1,2,30,40]}]},{question_number:'G3',crop_image_paths:['crops/mark_scheme_H.png'],crop_regions:[{page_number:2,bbox:[1,2,30,40]}]},{question_number:'A3',crop_image_paths:[],crop_regions:[]}]}};
  state.files.set(file,Buffer.from(code));state.files.set(good,Buffer.from('complete original answer'));state.files.set(bad,Buffer.from('next option heading'));
  state.files.set(nativePath,Buffer.from('window.IBPHYS_QUESTIONS='+JSON.stringify([{id:parent,question:'G3',preview,crops:[],parts:[{source_part_id:part,crops:[],ms_crops:[path.basename(good),path.basename(bad)]}]}])+';'));
  state.files.set(csvPath,Buffer.from('part_id\n'+part+'\n'));
  const retained={source_part_id:part,parent_id:parent,role:'markscheme',path:good,sha256:sha(state.files.get(good)),missing_reserved_questions:['A3'],review_complete:true,reserved_content_found:false};
  state.report={schema_version:1,review_complete:true,unresolved_relevant_items:[],read_failures:[],reviewed_parent_ids:[parent],held_parent_ids:[],retained_records:[retained],suppressed_assets:[{source_part_id:part,parent_id:parent,role:'markscheme',path:bad,sha256:sha(state.files.get(bad)),reason:'Only the next option heading',remaining_answer_complete:true}],required_assets:[{source_part_id:part,parent_id:parent,role:'markscheme',path:good,sha256:retained.sha256}]};
  mutate(state);
  state.files.set(metaPath,Buffer.from(JSON.stringify(state.metadata)));
  state.report.source_files=[...state.files].filter(([p])=>p!==file).map(([path,bytes])=>({path,sha256:sha(bytes)}));
  if(state.afterWitnesses)state.afterWitnesses(state);
  state.files.set(reviewPath,Buffer.from(JSON.stringify(state.report)));
  const module={exports:{}};const sandbox={module,exports:module.exports,__dirname:path.dirname(file),__filename:file,process,Buffer,require:name=>name==='fs'?{readFileSync:p=>{const found=state.files.get(path.resolve(p));if(!found)throw Error('Missing synthetic source '+p);return found;}}:require(name)};
  vm.runInNewContext(code,sandbox,{filename:file});return {api:module.exports,state};
}
let count=0;function check(name,fn){fn();count++;console.log('ok '+name);}
check('Exact reviewed crop loads with fingerprinted original ownership',()=>{const {api,state}=fixture(),loaded=api.loadA5AdditionalGeometry();assert.strictEqual(loaded.requireException(state.report.retained_records[0]),loaded.report.retained_records[0]);assert(loaded.fingerprints.some(f=>f.path===metaPath));assert(loaded.fingerprints.some(f=>f.path===file));});
check('Changed source bytes invalidate even an otherwise complete review',()=>{const {api}=fixture(s=>s.afterWitnesses=x=>x.files.set(good,Buffer.from('different answer')));assert.throws(()=>api.loadA5AdditionalGeometry(),/source changed/);});
check('Unresolved review or recorded read failures prevent loading',()=>{for(const mutate of [s=>s.report.review_complete=false,s=>s.report.unresolved_relevant_items.push('pending'),s=>s.report.read_failures.push('missing PDF')])assert.throws(()=>fixture(mutate).api.loadA5AdditionalGeometry(),/incomplete/);});
check('Visual exception cannot rescue absent or invalid own rectangles',()=>{for(const rectangles of [[],[{page_number:1,bbox:[0,0,0,1]}],[{page_number:0,bbox:[0,0,1,1]}],[{page_number:1,bbox:[0,0,1]}]])assert.throws(()=>fixture(s=>s.metadata.entries[0].crop_regions=rectangles).api.loadA5AdditionalGeometry(),/invalid own/);});
check('Source-part, role, bytes and missing-reserved set are all exact',()=>{const {api,state}=fixture(),g=api.loadA5AdditionalGeometry(),r=state.report.retained_records[0];for(const changed of [{source_part_id:'ibchem_part_other'},{parent_id:'07M.P3.SL.TZ2.QG2'},{role:'context'},{path:bad},{sha256:'0'.repeat(64)},{missing_reserved_questions:['A3','B1']}])assert.throws(()=>g.requireException({...r,...changed}),/Missing exact/);});
check('Held parents cannot also receive retained exceptions',()=>assert.throws(()=>fixture(s=>s.report.held_parent_ids=[parent]).api.loadA5AdditionalGeometry(),/held native parent/));
check('Suppression removes exactly the heading and preserves the required complete answer',()=>{const {api}=fixture(),g=api.loadA5AdditionalGeometry(),q={source_part_id:part,parent_id:parent,question_images:['question'],context_images:['context'],markscheme_images:[good,bad]};const after=g.projectQuestion(q);assert.deepStrictEqual(copy(after.markscheme_images),[good]);assert.deepStrictEqual(q.markscheme_images,[good,bad]);assert.strictEqual(after.question_images,q.question_images);assert.strictEqual(after.context_images,q.context_images);assert.throws(()=>g.projectQuestion({...q,markscheme_images:[bad]}),/remaining answer disappeared/);});
check('An omitted answer crop needs a matching exact retained answer witness',()=>{assert.throws(()=>fixture(s=>s.report.required_assets=[]).api.loadA5AdditionalGeometry(),/requires a reviewed complete/);assert.throws(()=>fixture(s=>s.report.required_assets[0].sha256='0'.repeat(64)).api.loadA5AdditionalGeometry(),/not exactly visually retained/);});
console.log(count+' A5 additional-geometry checks passed');
