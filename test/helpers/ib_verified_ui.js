"use strict";
// Reuse applies only to the per-record keyboard loop. Source, package and topic
// UI checks always run against the candidate, including its new catalogue.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const FILES=['data/physics_catalogue.js','engine/ppqviewer.js','engine/ppqviewer.css','physics-config.js','index.html','physics-identity.js','physics-login.js','physics-reporting.js'];
const VERIFIED={build_id:'f6004e904e4c69a8',completed_session:99433,checks:32,mcqs:200,keyboard_journeys:1600};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const keyed=q=>['reviewed_source_key','matched_source_key'].includes(q.answer_status);
function loadVerifiedUi({root,releaseRoot,receipt,readFile=fs.readFileSync}){
 assert.equal(receipt.result,'PASS','UI reuse requires a completed PASS receipt');
 for(const [field,value]of Object.entries(VERIFIED))assert.equal(receipt[field],value,'Unexpected verified UI run: '+field);
 assert.equal(receipt.keyboard_journeys,receipt.mcqs*8);
 assert.deepEqual(Object.keys(receipt.files).sort(),[...FILES].sort(),'Every verified UI file and catalogue must be pinned');
 const reference=path.resolve(root,receipt.release_directory),allowed=path.join(path.resolve(root),'dist/ibphysics-release')+path.sep;
 assert(reference.startsWith(allowed),'Verified UI reference must remain in the immutable release folder');
 assert(path.basename(reference).startsWith(receipt.build_id+'-'),'Verified UI directory does not match its build');
 for(const file of FILES){
  const expected=receipt.files[file];assert.match(expected,/^[a-f0-9]{64}$/);
  assert.equal(sha(readFile(path.join(reference,file))),expected,'Verified UI reference changed: '+file);
  if(file!=='data/physics_catalogue.js')assert.equal(sha(readFile(path.join(releaseRoot,file))),expected,'UI changes require full fresh journeys: '+file);
 }
 const box={window:{}};vm.runInNewContext(readFile(path.join(reference,'data/physics_catalogue.js')).toString('utf8'),box,{timeout:20000});
 const records=JSON.parse(JSON.stringify(box.window.PHYSICS_QUESTIONS));
 assert(Array.isArray(records));assert.equal(records.filter(keyed).length,receipt.mcqs,'Verified MCQ count changed');
 assert.equal(new Set(records.map(q=>q.id)).size,records.length,'Verified question identities are repeated');
 return new Map(records.map(q=>[q.id,q]));
}
function canReuseQuestion(references,question){const previous=references.get(question.id);return Boolean(previous&&JSON.stringify(previous)===JSON.stringify(question));}
module.exports={loadVerifiedUi,canReuseQuestion,FILES,VERIFIED};
