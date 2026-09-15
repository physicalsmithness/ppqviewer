/* Synthetic identities only; every network call is mocked. */
"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const source=read("example/physics-reporting.js"),html=read("example/physics.html"),opened=[];
let checks=0;function check(name,fn){fn();checks++;console.log("ok "+name);}
function fixture(){
 const dom=new JSDOM("",{url:"https://physicalsmithness.github.io/ibphysicsppqs/",runScripts:"outside-only"}),w=dom.window,sent=[];opened.push(dom);
 w.fetch=(url,opts)=>{sent.push({url,opts,p:JSON.parse(opts.body)});return Promise.resolve({type:"opaque"});};w.eval(source);
 const person={anonymous_id:"fixture-person",display_name:"Logging fixture",cohort:"Test",signed_in:true};
 const q={id:"fixture-Q1(a)",source_part_id:"fixture-source",parent_id:"fixture-Q1",topic_codes:["A.1"],analysis_atoms:["A1.GRAPH"],year:"2025",paper:"2",level:"HL"};
 const row={id:q.id,attempt_id:"fixture-attempt",learner_id:person.anonymous_id,marks_max:2,marks_awarded:1,correct:false,time_ms:0,ts:"2026-09-12T12:00:00Z",self_report:null,learner_level:"SL"};
 const v={cfg:{learnerId:person.anonymous_id,idOf:q=>q.id},cur:q,byId:{[q.id]:q},_attemptId:row.attempt_id,store:{attempts:[row]}};
 const reporter=w.PhysicsReporting.create({enabled:true,identity:{current:()=>person},viewer:()=>v});
 const send=(status="answered",extra={attempt_id:row.attempt_id})=>reporter.report({status,item_id:q.id,extra_json:JSON.stringify(extra)});
 return{w,person,q,row,v,sent,send,reporter};
}
function realPage(url="https://physicalsmithness.github.io/ibphysicsppqs/?topic=A.5",fail=false){
 const dom=new JSDOM(html,{url,runScripts:"outside-only",pretendToBeVisual:true}),w=dom.window,sent=[];opened.push(dom);
 w.fetch=(url,opts)=>{sent.push({url,opts,p:JSON.parse(opts.body)});if(fail)throw Error("offline");return Promise.resolve({type:"opaque"});};
 w.confirm=()=>true;
 w.PHYSICS_META={course:"ib",release:true,title:"Reporting test",topics:{"A.5":"Relativity"},analysis:{topic:"A.5",groups:[{code:"A5.TD",label:"Time dilation",summary:"Read the two events."}]}};
 w.PHYSICS_QUESTIONS=[{id:"25M.P2.HL.TZ1.Q1(a)",source_part_id:"fixture-source",parent_id:"25M.P2.HL.TZ1.Q1",topic_codes:["A.5"],analysis_groups:["A5.TD"],analysis_atoms:[],year:"2025",paper:"2",level:"HL",question_number:"1",label:"(a)",marks:2,question_images:["assets/question.png"],context_images:[],markscheme_images:["assets/answer.png"]}];
 w.localStorage.setItem("smithics_fields_identity_v1",JSON.stringify({anonymous_id:"fixture-person",display_name:"Logging fixture",signed_in:true,cohort:"Wrong subject",contexts:{physics:{anonymous_id:"fixture-person",display_name:"Logging fixture",cohort:"Test"}}}));
 w.localStorage.setItem("physics_ppq_ib_v1",JSON.stringify({attempts:[{id:w.PHYSICS_QUESTIONS[0].id,attempt_id:"legacy",marks_max:2,marks_awarded:0}],scores:{},flags:{},prefs:{}}));
 for(const file of ["engine/ppqviewer.js","example/physics-identity.js","example/physics-login.js","example/physics-reporting.js","example/physics-config.js"])w.eval(read(file));
 w.PPQ_CONFIG.prefetchAhead=0;w.PPQ_CONFIG.teacherHelp=null;w.PPQ_CONFIG.problemReport=null;
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(match[1].includes("window.physicsViewer ="))w.eval(match[1]);
 return{w,sent,v:w.physicsViewer,root:w.document.getElementById("ppq-root")};
}
try{
 check("exact zero, partial and full marks keep scored status and the real denominator",()=>{
  for(const [marks,status] of [[0,"wrong"],[1,"half"],[2,"correct"]]){const f=fixture();f.row.marks_awarded=marks;f.send();const p=f.sent[0].p;assert.equal(p.status,status);assert.equal(p.event_status,"answered");assert.equal(p.marks_awarded,marks);assert.equal(p.marks_max,2);assert.equal(p.row_type,"attempt");assert.equal(p.time_ms,0);assert.equal(p.correct,false);assert.equal(p.learner_level,"SL");assert.equal(p.level,"HL");assert.equal(p.source_part_id,f.q.source_part_id);}
 });
 check("uncertain ranges and missing scores are never fabricated as wrong or full",()=>{
  const f=fixture();delete f.row.marks_awarded;f.row.marks_range=[0,2];f.send();assert.equal(f.sent[0].p.status,"unknown");assert.equal(f.sent[0].p.marks_range_json,"[0,2]");assert(!Object.hasOwn(f.sent[0].p,"marks_awarded"));delete f.row.marks_range;delete f.row.marks_max;f.send();assert.equal(f.sent[1].p.status,"unknown");assert(!Object.hasOwn(f.sent[1].p,"marks_max"));
 });
 check("MCQ answers log one mark and preserve the selected option",()=>{
  const f=fixture();delete f.row.marks_max;delete f.row.marks_awarded;f.row.chosen_option="B";f.row.correct=true;f.reporter.report({status:"answered",item_id:f.q.id,picked_id:"B",extra_json:JSON.stringify({attempt_id:f.row.attempt_id})});assert.equal(f.sent[0].p.marks_max,1);assert.equal(f.sent[0].p.marks_awarded,1);assert.equal(f.sent[0].p.picked_id,"B");
 });
 check("C and revised C link to one attempt without adding legacy attempt counts",()=>{
  const f=fixture();f.send();f.send("rated",{rating:3});f.send("rated",{rating:4});assert.equal(f.sent.filter(x=>x.p.item_id).length,1);for(const x of f.sent.slice(1)){assert.equal(x.p.row_type,"rating");assert.equal(x.p.item_id,"");assert.equal(x.p.question_id,f.q.id);assert.equal(x.p.attempt_id,f.row.attempt_id);}assert.deepEqual(f.sent.slice(1).map(x=>x.p.rating),[3,4]);
 });
 check("a reviewed attempt is selected before the current visit; unowned history is never reported",()=>{
  const f=fixture();f.v._reviewingAttempt={...f.row,attempt_id:"older-owned"};f.v.store.attempts.push(f.v._reviewingAttempt);f.send("rated",{rating:2});assert.equal(f.sent[0].p.attempt_id,"older-owned");delete f.v._reviewingAttempt.learner_id;f.send("rated",{rating:5});assert.equal(f.sent.length,1);
 });
 check("pre-answer ratings are independent, and missing answer rows cannot be replayed",()=>{
  const f=fixture();f.v.store.attempts=[];f.send("rated",{rating:2});assert(!Object.hasOwn(f.sent[0].p,"attempt_id"));assert.equal(f.sent[0].p.item_id,"");f.send();assert.equal(f.sent.length,1);
 });
 check("sign-out, changed person and mismatched viewer identity suppress attribution",()=>{
  const f=fixture();f.person.signed_in=false;f.send();f.person.signed_in=true;f.person.anonymous_id="new-person";f.send();f.v.cfg.learnerId="new-person";f.send("rated",{rating:5});assert.equal(f.sent.length,0);
 });
 check("payload identity/routing cannot be replaced by extras, and legacy receiver retains detail",()=>{
  const f=fixture();f.send("answered",{attempt_id:f.row.attempt_id,project:"other",anonymous_id:"other",display_name:"other",cohort:"other",google_email:"other",mode:"other",row_type:"other",flag:false});const p=f.sent[0].p;assert.equal(p.project,"ppqviewer_ibphysics");assert.equal(p.anonymous_id,"fixture-person");assert.equal(p.display_name,"Logging fixture");assert.equal(p.cohort,"Test");assert.equal(p.google_email,"");assert.equal(p.mode,"ppq_viewer");assert.equal(p.flag,false);assert(!Object.hasOwn(p,"extra_json"));assert.equal(p.analysis_atoms_json,'["A1.GRAPH"]');const oldColumns=new Set(["project","timestamp","anonymous_id","display_name","cohort","google_email","session_id","item_id","topic","qtype","mode","level","status","picked_id","misconception_id","extra_json"]);const tail=Object.fromEntries(Object.entries(p).filter(([k])=>!oldColumns.has(k)));assert.equal(JSON.parse(JSON.stringify(tail)).marks_awarded,1);
 });
 check("historical time removal reports the affected owned attempt, not the displayed question",()=>{
  const f=fixture();f.row.time_ms=null;f.row.time_discarded=true;f.reporter.report({status:"timing_prefs",item_id:"other-question",extra_json:JSON.stringify({time_deleted_historical:true,attempt_id:f.row.attempt_id,item_id:f.q.id})});assert.equal(f.sent[0].p.question_id,f.q.id);assert.equal(f.sent[0].p.time_ms,null);assert.equal(f.sent[0].p.time_discarded,true);assert.equal(f.sent[0].p.item_id,"");
 });
 check("local previews and unrelated hosts cannot enable reporting",()=>{
  const f=fixture(),m={course:"ib",release:true};for(const url of ["http://127.0.0.1:8789/","https://example.test/ibphysicsppqs/","https://physicalsmithness.github.io/esatwallop/"])assert.equal(f.w.PhysicsReporting.isLive(m,new URL(url)),false);assert.equal(f.w.PhysicsReporting.isLive(m,f.w.location),true);assert.equal(f.w.PhysicsReporting.isLive({...m,release:false},f.w.location),false);
 });
 check("real page wires an answer and C, with physics class and no old-history upload",()=>{
  const p=realPage();assert(p.v);assert.equal(typeof p.v.report,"function");assert.equal(p.sent.length,0);p.root.querySelector(".ppq-reveal").click();p.root.querySelector('.ppq-mark-btn[data-mark="1"]').click();assert.equal(p.sent.length,1);assert.equal(p.sent[0].p.status,"half");assert.equal(p.sent[0].p.cohort,"Test");assert.equal(p.sent[0].p.marks_awarded,1);p.root.querySelector('.ppq-scale-btn[data-val="3"]').click();assert.equal(p.sent.length,2);assert.equal(p.sent[1].p.rating,3);assert.equal(p.sent[1].p.attempt_id,p.sent[0].p.attempt_id);assert.equal(p.v.store.attempts[0].attempt_id,"legacy");assert(p.w.document.querySelector("#physics-sign-in-gate").textContent.includes("New attempts"));
 });
 check("local real page records progress without network, and reporting failure never loses a mark",()=>{
  for(const [url,fail,count] of [["http://127.0.0.1:8789/?topic=A.5",false,0],["https://physicalsmithness.github.io/ibphysicsppqs/?topic=A.5",true,1]]){const p=realPage(url,fail);p.root.querySelector(".ppq-reveal").click();p.root.querySelector('.ppq-mark-btn[data-mark="2"]').click();assert.equal(p.v.store.attempts.at(-1).marks_awarded,2);assert.equal(p.sent.length,count);}
 });
}finally{for(const dom of opened){if(dom.window.physicsViewer)dom.window.physicsViewer.destroy();if(dom.window.physicsLogin)dom.window.physicsLogin.destroy();dom.window.close();}}
console.log(checks+" physics reporting checks passed");
