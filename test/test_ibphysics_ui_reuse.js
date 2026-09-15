/* Read-only synthetic files and the real immutable receipt; never launches a
   release builder or sends any answer/report. */
"use strict";
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {loadVerifiedUi,canReuseQuestion,FILES,VERIFIED}=require('./helpers/ib_verified_ui');
const ROOT=path.resolve(__dirname,'..'),clone=x=>JSON.parse(JSON.stringify(x)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
let checks=0;function check(label,fn){fn();checks++;console.log('ok '+label);}
function fixture(){
 const root=path.resolve(ROOT,'dist/reuse-in-memory-fixture'),reference=path.join(root,'dist/ibphysics-release',VERIFIED.build_id+'-123'),releaseRoot=path.join(root,'candidate');
 const records=Array.from({length:200},(_,i)=>({id:'q'+i,parent_id:'parent'+i,source_part_id:'source'+i,marks:1,correct_option:'ABCD'[i%4],answer_status:'matched_source_key',topic_codes:['A.1'],analysis_atoms:['A1.fixture'],question_images:['assets/question'+i+'.png'],context_images:[],markscheme_images:['assets/answer'+i+'.png']}));
 const files=new Map(),receipt={...VERIFIED,result:'PASS',release_directory:path.relative(root,reference),files:{}};
 for(const file of FILES){const bytes=Buffer.from(file==='data/physics_catalogue.js'?'window.PHYSICS_QUESTIONS='+JSON.stringify(records)+';':'fixed UI '+file);files.set(path.join(reference,file),bytes);files.set(path.join(releaseRoot,file),bytes);receipt.files[file]=sha(bytes);}
 const args={root,releaseRoot,receipt,readFile:file=>{assert(files.has(file),'Missing fixture: '+file);return files.get(file);}};
 return{args,files,reference,records};
}
check('the actual f600 receipt pins all UI bytes and all 200 previously exercised MCQs',()=>{
 const receipt=JSON.parse(fs.readFileSync(path.join(ROOT,'reports/ib-verified-ui-reference.json'))),reference=path.join(ROOT,receipt.release_directory);
 const loaded=loadVerifiedUi({root:ROOT,releaseRoot:reference,receipt});assert.equal([...loaded.values()].filter(q=>['reviewed_source_key','matched_source_key'].includes(q.answer_status)).length,200);
});
check('data additions permit reuse only for byte-equivalent existing question records',()=>{
 const f=fixture();f.files.set(path.join(f.args.releaseRoot,'data/physics_catalogue.js'),Buffer.from('new candidate catalogue'));
 const loaded=loadVerifiedUi(f.args);assert(canReuseQuestion(loaded,clone(f.records[0])));assert(!canReuseQuestion(loaded,{...f.records[0],id:'new'}));
 for(const mutate of [q=>q.correct_option='D',q=>q.marks=2,q=>q.topic_codes.push('E.1'),q=>q.analysis_atoms.push('atomic:type'),q=>q.question_images[0]='assets/replacement.png',q=>q.context_images.push('assets/context.png'),q=>q.markscheme_images[0]='assets/new-answer.png',q=>q.parent_id='different']){const q=clone(f.records[0]);mutate(q);assert(!canReuseQuestion(loaded,q),'Changed record must receive fresh keyboard journeys');}
});
check('a changed candidate UI file forces full fresh journeys',()=>{
 for(const file of FILES.filter(f=>f!=='data/physics_catalogue.js')){const f=fixture();f.files.set(path.join(f.args.releaseRoot,file),Buffer.from('changed'));assert.throws(()=>loadVerifiedUi(f.args),/UI changes require full fresh journeys/);}
});
check('missing witnesses, changed reference bytes and an unverified run cannot grant reuse',()=>{
 let f=fixture();delete f.args.receipt.files['physics-reporting.js'];assert.throws(()=>loadVerifiedUi(f.args),/must be pinned/);
 f=fixture();f.files.set(path.join(f.reference,'data/physics_catalogue.js'),Buffer.from('changed'));assert.throws(()=>loadVerifiedUi(f.args),/reference changed/);
 f=fixture();f.args.receipt.completed_session=1;assert.throws(()=>loadVerifiedUi(f.args),/Unexpected verified UI run/);
 f=fixture();f.args.receipt.result='PENDING';assert.throws(()=>loadVerifiedUi(f.args),/completed PASS/);
 f=fixture();f.args.receipt.release_directory='../elsewhere';assert.throws(()=>loadVerifiedUi(f.args),/immutable release folder/);
});
console.log(checks+' verified-UI reuse checks passed with no filesystem writes');
