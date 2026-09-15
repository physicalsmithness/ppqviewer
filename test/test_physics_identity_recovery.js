/* Independent identity interoperability journeys: real helper/PPQ UI, synthetic storage only. */
"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const source=process.env.PHYSICS_IDENTITY_SOURCE?fs.readFileSync(path.resolve(process.env.PHYSICS_IDENTITY_SOURCE),"utf8"):read("staged/physics-identity-v2/physics-identity.js"),html=read("example/physics.html"),engine=read("engine/ppqviewer.js"),login=read("example/physics-login.js"),config=read("example/physics-config.js");
const KEY="smithics_fields_identity_v1",CHECKPOINT="smithics_physics_signin_v1",SR="srd_identity_v1",STORE="physics_ppq_ib_v1";
const question={id:"25M.P2.HL.TZ1.Q1(a)",parent_id:"25M.P2.HL.TZ1.Q1",source_part_id:"fixture-source",topic_codes:["A.5"],analysis_groups:["A5.TD"],analysis_atoms:[],year:"2025",paper:"2",level:"HL",question_number:"1",label:"(a)",marks:2,question_images:["assets/question.png"],context_images:[],markscheme_images:["assets/answer.png"]};
const progress={
 [STORE]:JSON.stringify({attempts:[{id:question.id,learner_id:"smith-id",attempt_id:"previous",marks_max:2,marks_awarded:1}],scores:{[question.id]:3},flags:{},prefs:{}}),
 srd_eventlog_v1:'[{"id":"earlier-drill","correct":true}]',srd_prefs_v1:'{"retain":"SR preferences"}',
 smithics_fields_v0_1:'{"attempts":["earlier-fields"]}',chemistry_ppq_v1:'{"scores":{"old":6}}'
};
const opened=[];let checks=0;function check(name,fn){fn();checks++;console.log("ok "+name);}
function shared(name="Smith",id="smith-id"){return{anonymous_id:id,display_name:name,signed_in:true,google_email:"",cohort:"Another subject",contexts:{physics:{anonymous_id:id,display_name:name,cohort:"Test"}}};}
function fieldsRecord(record){return{anonymous_id:record.anonymous_id,display_name:record.display_name,cohort:"Another subject",google_email:""};}
function capture(p){const out={};for(let i=0;i<p.storage.length;i++){const k=p.storage.key(i);out[k]=p.storage.getItem(k);}return out;}
function unchangedProgress(p){for(const [key,value]of Object.entries(progress))assert.equal(p.storage.getItem(key),value,key+" bytes preserved");assert.equal(p.requests.length,0,"No reporting or network request");}
function create(state={},options={}){
 const dom=new JSDOM(options.ui?html:'<!doctype html><div id="root"></div>',{url:"https://physicalsmithness.github.io/ibphysicsppqs/?topic=A.5",runScripts:"outside-only",pretendToBeVisual:true}),w=dom.window,storage=w.localStorage,requests=[];
 Object.entries({...progress,...state}).forEach(([key,value])=>storage.setItem(key,typeof value==="string"?value:JSON.stringify(value)));
 w.fetch=(...args)=>{requests.push(args);throw Error("Unexpected network request");};w.XMLHttpRequest=function(){requests.push("XHR");throw Error("Unexpected XHR");};w.navigator.sendBeacon=(...args)=>{requests.push(args);return false;};w.confirm=()=>true;
 if(options.denied)Object.defineProperty(w,"localStorage",{get(){throw Error("Storage denied");},configurable:true});
 w.eval(source);let mounts=0;
 if(options.ui){
  w.PHYSICS_META={course:"ib",release:true,title:"Physics identity fixture",topics:{"A.5":"Relativity"},analysis:{topic:"A.5",groups:[{code:"A5.TD",label:"Time dilation",summary:"Use the events.",checks:[]}]}};w.PHYSICS_QUESTIONS=[JSON.parse(JSON.stringify(question))];
  w.eval(engine);const original=w.PPQViewer.mount;w.PPQViewer.mount=function(){mounts++;return original.apply(this,arguments);};w.eval(login);w.eval(config);w.PPQ_CONFIG.prefetchAhead=0;w.PPQ_CONFIG.teacherHelp=null;w.PPQ_CONFIG.problemReport=null;
  for(const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(script[1].includes("window.physicsViewer ="))w.eval(script[1]);
 }
 const identity=options.ui?w.physicsIdentity:w.PhysicsIdentity.create(options.sr?{localKey:SR}:{}),events=[],unsubscribers=[];
 unsubscribers.push(identity.subscribe(value=>events.push(JSON.parse(JSON.stringify(value)))));
 const p={dom,w,storage,identity,requests,events,unsubscribers,root:options.ui?w.document.getElementById("ppq-root"):null,mounts:()=>mounts};opened.push(p);return p;
}
function rewrite(p,value,event="storage"){
 if(value===null)p.storage.removeItem(KEY);else p.storage.setItem(KEY,typeof value==="string"?value:JSON.stringify(value));
 if(event==="storage")p.w.dispatchEvent(new p.w.StorageEvent("storage",{key:KEY,newValue:p.storage.getItem(KEY)}));else if(event)p.w.dispatchEvent(new p.w.Event(event));
}
function signedSmith(p){const value=p.identity.current();assert.equal(value.signed_in,true);assert.equal(value.anonymous_id,"smith-id");assert.equal(value.display_name,"Smith");assert.equal(value.cohort,"Test");return value;}
try{
 check("Fields four-field overwrite keeps a mounted PPQ visit and subscribed SR class intact",()=>{
  const p=create({[KEY]:shared()},{ui:true});signedSmith(p);const v=p.w.physicsViewer;assert(v);assert.equal(p.mounts(),1);
  const sr=p.w.PhysicsIdentity.create({localKey:SR}),srEvents=[];p.unsubscribers.push(sr.subscribe(value=>srEvents.push(value)));
  v.reveal();const before={attempt:v._attemptId,shownAt:v.shownAt,bar:p.root.querySelector(".ppq-marksbar"),viewer:v};
  const checkpoint=p.storage.getItem(CHECKPOINT);
  rewrite(p,fieldsRecord(shared()));signedSmith(p);assert.equal(p.w.physicsViewer,before.viewer);assert.equal(v._attemptId,before.attempt);assert.equal(v.shownAt,before.shownAt);assert.equal(p.root.querySelector(".ppq-marksbar"),before.bar);assert(!p.root.hidden);assert.equal(p.mounts(),1);
  assert.deepEqual(JSON.parse(p.storage.getItem(SR)),{anonymous_id:"smith-id",name:"Smith",cohort:"Test",signed_in:true});assert.equal(sr.current().signed_in,true);assert.equal(p.events.length,0);assert.equal(srEvents.length,0);assert(p.storage.getItem(CHECKPOINT));assert(checkpoint);unchangedProgress(p);
 });
 check("focus and pageshow recover same-tab legacy rewrites without emitting a false identity transition",()=>{
  const p=create({[KEY]:shared()},{sr:true});signedSmith(p);
  for(const event of ["focus","pageshow"]){rewrite(p,fieldsRecord(shared()),event);signedSmith(p);assert.equal(JSON.parse(p.storage.getItem(SR)).cohort,"Test");assert.equal(JSON.parse(p.storage.getItem(SR)).signed_in,true);assert.equal(p.events.length,0);unchangedProgress(p);}
 });
 check("a fresh page recovers the same person from the trusted checkpoint after shared metadata loss",()=>{
  const first=create({[KEY]:shared()});signedSmith(first);assert(first.storage.getItem(CHECKPOINT));rewrite(first,fieldsRecord(shared()),null);
  const fresh=create(capture(first),{ui:true});signedSmith(fresh);assert(fresh.w.physicsViewer);assert(!fresh.root.hidden);assert.equal(fresh.mounts(),1);assert.equal(fresh.w.physicsViewer.cfg.learnerId,"smith-id");unchangedProgress(first);unchangedProgress(fresh);
 });
 check("explicit sign-out survives lossy rewrites, focus and reload until a deliberate sign-in",()=>{
  const p=create({[KEY]:shared()},{sr:true});signedSmith(p);p.identity.signOut();assert.equal(p.identity.current().signed_in,false);
  rewrite(p,fieldsRecord(shared()));assert.equal(p.identity.current().signed_in,false);p.w.dispatchEvent(new p.w.Event("focus"));assert.equal(p.identity.current().signed_in,false);
  const fresh=create(capture(p),{ui:true});assert.equal(fresh.identity.current().signed_in,false);assert(!fresh.w.physicsViewer);assert(fresh.root.hidden);
  const returned=fresh.identity.signIn("Smith","Test");assert.equal(returned.anonymous_id,"smith-id");signedSmith(fresh);assert(fresh.w.physicsViewer);unchangedProgress(p);unchangedProgress(fresh);
 });
 check("signOut called before processing an already-clobbered shared record still persists sign-out",()=>{
  const p=create({[KEY]:shared()},{sr:true});signedSmith(p);rewrite(p,fieldsRecord(shared()),null);p.identity.signOut();assert.equal(p.identity.current().signed_in,false);
  rewrite(p,fieldsRecord(shared()),"pageshow");assert.equal(p.identity.current().signed_in,false);const fresh=create(capture(p),{sr:true});assert.equal(fresh.identity.current().signed_in,false);unchangedProgress(p);unchangedProgress(fresh);
 });
 check("deleted or malformed shared identity cannot be restored from an old checkpoint or SR mirror",()=>{
  for(const damaged of [null,"{broken",JSON.stringify([])]){
   const p=create({[KEY]:shared()},{sr:true});signedSmith(p);assert(p.storage.getItem(CHECKPOINT));rewrite(p,damaged);assert.equal(p.identity.current().signed_in,false);
   const fresh=create(capture(p),{ui:true});assert.equal(fresh.identity.current().signed_in,false);assert(!fresh.w.physicsViewer);unchangedProgress(p);unchangedProgress(fresh);
  }
 });
 check("same name with another ID and the same ID with another name cannot inherit the old class",()=>{
  for(const changed of [{anonymous_id:"different-id",display_name:"Smith"},{anonymous_id:"smith-id",display_name:"Another Smith"}]){
   const p=create({[KEY]:shared()},{sr:true});signedSmith(p);rewrite(p,{...changed,cohort:"Test",google_email:""});const current=p.identity.current();assert.equal(current.signed_in,false);assert.equal(current.anonymous_id,changed.anonymous_id);assert.equal(current.display_name,changed.display_name);assert.equal(current.cohort,"");
   const fresh=create(capture(p),{ui:true});assert.equal(fresh.identity.current().signed_in,false);assert(!fresh.w.physicsViewer);unchangedProgress(p);unchangedProgress(fresh);
  }
 });
 check("flat unverified name and class cannot establish a physics sign-in without a trusted checkpoint",()=>{
  const p=create({[KEY]:fieldsRecord(shared())},{ui:true});assert.equal(p.identity.current().signed_in,false);assert.equal(p.identity.current().cohort,"");assert(!p.w.physicsViewer);unchangedProgress(p);
 });
 check("present malformed or mismatched physics context cannot inherit a checkpoint sign-in",()=>{
  const contexts=["broken",[],{physics:null},{physics:[]},{physics:"broken"},
   {physics:{anonymous_id:"different-id",display_name:"Smith",cohort:"Test"}},
   {physics:{anonymous_id:"smith-id",display_name:"Another Smith",cohort:"Test"}},
   {physics:{anonymous_id:"smith-id",display_name:"Smith",cohort:""}}];
  for(const context of contexts){
   const p=create({[KEY]:shared()},{sr:true});signedSmith(p);rewrite(p,{...fieldsRecord(shared()),contexts:context});assert.equal(p.identity.current().signed_in,false);assert.equal(p.identity.current().cohort,"");
   const fresh=create(capture(p),{ui:true});assert.equal(fresh.identity.current().signed_in,false);assert(!fresh.w.physicsViewer);unchangedProgress(p);unchangedProgress(fresh);
  }
 });
 check("denied browser storage keeps explicit sign-in and sign-out usable in memory without touching progress",()=>{
  const p=create({}, {denied:true});assert.equal(p.identity.current().signed_in,false);const signed=p.identity.signIn("Smith","Test");assert(signed.signed_in);assert(signed.anonymous_id);const id=signed.anonymous_id;
  for(const event of ["focus","pageshow"]){p.w.dispatchEvent(new p.w.Event(event));assert.equal(p.identity.current().anonymous_id,id);assert.equal(p.identity.current().signed_in,true);assert.equal(p.identity.current().cohort,"Test");}
  p.identity.signOut();p.w.dispatchEvent(new p.w.Event("focus"));assert.equal(p.identity.current().signed_in,false);assert.equal(p.identity.signIn("Smith","Test").anonymous_id,id);unchangedProgress(p);
 });
 console.log(checks+" independent physics identity recovery journeys passed");
}finally{for(const p of opened){p.unsubscribers.forEach(fn=>fn());if(p.w.physicsLogin)p.w.physicsLogin.destroy();if(p.w.physicsViewer)p.w.physicsViewer.destroy();p.w.close();}}
