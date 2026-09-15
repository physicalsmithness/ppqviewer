/* Real physics wrapper + shared identity journeys. No network or pupil data.
 * Run: node test/test_physics_identity.js
 * PPQ_PROJECT_ROOT may supply the unchanged engine during staged review. */
"use strict";
const assert = require("assert/strict"), fs = require("fs"), path = require("path"), {JSDOM} = require("jsdom");
const ROOT = path.resolve(__dirname,".."), SOURCE = path.resolve(process.env.PPQ_PROJECT_ROOT || ROOT);
const read = file => fs.readFileSync(path.join(ROOT,file),"utf8");
const html = read("example/physics.html"), config = read("example/physics-config.js"), identity = read("example/physics-identity.js"), login = read("example/physics-login.js");
const engine = fs.readFileSync(path.join(SOURCE,"engine/ppqviewer.js"),"utf8");
const KEY = "smithics_fields_identity_v1", STORE = "physics_ppq_ib_v1";
const question = {id:"25M.P2.HL.TZ1.Q1(a)",parent_id:"25M.P2.HL.TZ1.Q1",source_part_id:"fixture-source",topic_codes:["A.5"],analysis_groups:["A5.TD"],analysis_atoms:[],year:"2025",paper:"2",level:"HL",question_number:"1",label:"(a)",marks:2,question_images:["assets/question.png"],context_images:[],markscheme_images:["assets/answer.png"]};
const meta = {course:"ib",release:true,title:"Physics identity fixture",topics:{"A.5":"Relativity"},analysis:{topic:"A.5",groups:[{code:"A5.TD",label:"Time dilation",summary:"Use the two events.",checks:[]}]}};
const saved = JSON.stringify({attempts:[{id:question.id,attempt_id:"before-login",ts:"2026-09-01T12:00:00Z",marks_max:2,marks_awarded:1}],scores:{[question.id]:3},flags:{},prefs:{}});
const opened = []; let checks = 0;
function check(name, run) { run(); checks++; console.log("ok " + name); }
function shared(name="Pupil One",id="pupil-one",cohort="IB27",signed=true) {
  return {anonymous_id:id,display_name:name,signed_in:signed,google_email:"",cohort:"Chemistry legacy",extra:"keep",contexts:{physics:{anonymous_id:id,display_name:name,cohort},chemistry:{cohort:"Chemistry"}}};
}
function page(state={}, options={}) {
  const dom = new JSDOM(html,{url:"https://physicalsmithness.github.io/ibphysicsppqs/?topic=A.5",runScripts:"outside-only",pretendToBeVisual:true});
  const w = dom.window, requests = []; let mounts=0;
  w.fetch = (...args) => { requests.push(args); throw Error("Unexpected fetch"); };
  w.XMLHttpRequest = function () { requests.push("XHR"); throw Error("Unexpected XHR"); };
  w.navigator.sendBeacon = (...args) => {requests.push(args);return false;};
  w.localStorage.setItem(STORE,saved);
  Object.entries(state).forEach(([key,value]) => w.localStorage.setItem(key,typeof value === "string" ? value : JSON.stringify(value)));
  w.PHYSICS_META = JSON.parse(JSON.stringify(meta)); w.PHYSICS_QUESTIONS = [JSON.parse(JSON.stringify(question))];
  w.eval(engine);
  const mount=w.PPQViewer.mount; w.PPQViewer.mount=function(){mounts++;return mount.apply(this,arguments);};
  if (!options.noIdentity) w.eval(identity);
  w.eval(login); w.eval(config);
  w.PPQ_CONFIG.prefetchAhead=0;
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) if(match[1].includes("window.physicsViewer ="))w.eval(match[1]);
  const p={w,dom,requests,root:w.document.getElementById("ppq-root"),mounts:()=>mounts};opened.push(p);return p;
}
function submit(p,name,cohort) {
  const gate=p.w.document.getElementById("physics-sign-in-gate");
  gate.querySelector("input").value=name;gate.querySelector("select").value=cohort;
  gate.querySelector("form").dispatchEvent(new p.w.Event("submit",{bubbles:true,cancelable:true}));
}
function storage(p,value) {p.w.localStorage.setItem(KEY,JSON.stringify(value));p.w.dispatchEvent(new p.w.StorageEvent("storage",{key:KEY}));}
try {
  check("new browser asks once and preserves existing PPQ results",()=>{
    const p=page();assert(!p.w.physicsViewer);assert(p.root.hidden);assert(!p.w.document.getElementById("physics-sign-in-gate").hidden);
    assert.equal(p.w.localStorage.getItem(STORE),saved);submit(p,"New Pupil","IB27");
    assert(p.w.physicsViewer);assert.equal(p.mounts(),1);assert.equal(p.w.physicsViewer.cfg.storageKey,STORE);assert.equal(p.w.physicsViewer.report,null);
    assert.equal(p.w.localStorage.getItem(STORE),saved);assert.equal(p.requests.length,0);
  });
  check("shared physics identity opens automatically, keeps the shared class and coverage link on release",()=>{
    const p=page({[KEY]:shared("Pupil One","pupil-one","Year 12 Physics")});
    assert(p.w.physicsViewer);assert.equal(p.w.physicsViewer.cfg.learnerId,"pupil-one");assert.equal(p.mounts(),1);
    assert(!p.w.document.querySelector(".physics-preview"));
    assert.equal(p.w.document.querySelector(".physics-account a").getAttribute("href"),"/SpecialRelativityDriller/app/coverage.html");
    p.w.document.querySelector(".physics-person").click();assert(p.root.hidden);
    assert.equal(p.w.document.querySelector("#physics-login-cohort").value,"Year 12 Physics");
    p.w.document.querySelector(".physics-login-cancel").click();assert(!p.root.hidden);assert.equal(p.mounts(),1);
    assert.equal(p.w.localStorage.getItem(STORE),saved);
  });
  check("Switch updates future attempt identity without remounting or changing historical results",()=>{
    const p=page({[KEY]:shared()}),v=p.w.physicsViewer;
    p.root.querySelector(".ppq-reveal").click();
    const previousAttempt=v._attemptId;
    assert(p.root.querySelector(".ppq-answer-panel.show"));
    p.w.document.querySelector(".physics-person").click();submit(p,"Pupil Two","IB28");
    assert.equal(p.w.physicsViewer,v);assert.equal(p.mounts(),1);assert.equal(p.w.localStorage.getItem(STORE),saved);
    assert.notEqual(v._attemptId,previousAttempt);assert.equal(v._marksPending,false);assert(!p.root.querySelector(".ppq-answer-panel.show"));
    const now=p.w.physicsIdentity.current();assert.equal(now.display_name,"Pupil Two");assert.notEqual(now.anonymous_id,"pupil-one");assert.equal(v.cfg.learnerId,now.anonymous_id);
    const raw=JSON.parse(p.w.localStorage.getItem(KEY));assert.equal(raw.cohort,"Chemistry legacy");assert.equal(raw.contexts.chemistry.cohort,"Chemistry");assert.equal(raw.extra,"keep");
    p.root.querySelector(".ppq-reveal").click();Array.from(p.root.querySelectorAll(".ppq-mark-btn")).at(-1).click();
    assert.equal(v.store.attempts.at(-1).learner_id,now.anonymous_id);assert.equal(v.store.attempts[0].attempt_id,"before-login");assert.equal(p.requests.length,0);
  });
  check("same-person focus preserves an open answer while the Switch form blocks viewer keyboard shortcuts",()=>{
    const p=page({[KEY]:shared()}),v=p.w.physicsViewer;
    p.root.querySelector(".ppq-reveal").click();const id=v._attemptId,bar=p.root.querySelector(".ppq-marksbar");
    p.w.dispatchEvent(new p.w.Event("focus"));assert.equal(v._attemptId,id);assert.equal(p.root.querySelector(".ppq-marksbar"),bar);
    p.w.document.querySelector(".physics-person").click();
    for(const key of ["6","Enter","ArrowRight"]){p.w.document.body.dispatchEvent(new p.w.KeyboardEvent("keydown",{key,bubbles:true,cancelable:true}));}
    assert.equal(v._attemptId,id);assert.equal(p.w.localStorage.getItem(STORE),saved);
    p.w.document.querySelector(".physics-login-cancel").click();assert.equal(v._attemptId,id);assert.equal(p.root.querySelector(".ppq-marksbar"),bar);
  });
  check("cross-tab person and sign-out changes update the gate and mounted viewer without duplicate mounts",()=>{
    const p=page({[KEY]:shared()}),v=p.w.physicsViewer;
    v._visitTimingPrefs={...v._timingPrefs(),visibility:"show"};v._startTiming();assert(v._timerInterval);
    p.root.querySelector(".ppq-reveal").click();const previousAttempt=v._attemptId;
    storage(p,shared("Other Pupil","other-id","IB28"));assert.equal(v.cfg.learnerId,"other-id");assert.match(p.w.document.querySelector(".physics-person").textContent,/Other Pupil/);
    assert.notEqual(v._attemptId,previousAttempt);assert(!p.root.querySelector(".ppq-answer-panel.show"));assert.equal(v._marksPending,false);
    storage(p,shared("Other Pupil","other-id","IB28",false));assert(p.root.hidden);assert(!p.w.document.getElementById("physics-sign-in-gate").hidden);
    assert.equal(v._timerInterval,null);
    storage(p,shared("Other Pupil","other-id","IB28"));assert(!p.root.hidden);assert.equal(p.w.physicsViewer,v);assert.equal(p.mounts(),1);
    assert.equal(p.w.localStorage.getItem(STORE),saved);assert.equal(p.requests.length,0);
  });
  check("a matching signed-in legacy Driller identity opens PPQs without another form",()=>{
    const p=page({srd_identity_v1:{anonymous_id:"legacy-id",name:"Legacy Pupil",cohort:"IB27",signed_in:true}});
    assert(p.w.physicsViewer);assert.equal(p.w.physicsViewer.cfg.learnerId,"legacy-id");assert.equal(p.w.physicsIdentity.current().cohort,"IB27");assert.equal(p.w.localStorage.getItem(STORE),saved);assert.equal(p.requests.length,0);
  });
  check("an old Driller person cannot override a different shared person or a deliberate shared sign-out",()=>{
    const legacy={anonymous_id:"old",name:"Old Pupil",cohort:"IB27",signed_in:true};
    const p=page({[KEY]:{anonymous_id:"new",display_name:"New Pupil"},srd_identity_v1:legacy});
    assert(!p.w.physicsViewer);assert.equal(p.w.document.querySelector("#physics-login-name").value,"New Pupil");assert.equal(p.w.localStorage.getItem(STORE),saved);
    const signedOut=page({[KEY]:shared("Old Pupil","old","IB27",false),srd_identity_v1:legacy});assert(!signedOut.w.physicsViewer);
  });
  check("missing identity dependency explains the problem without losing the stored progress",()=>{
    const p=page({}, {noIdentity:true});assert(!p.w.physicsViewer);assert.match(p.root.textContent,/shared physics sign-in could not be loaded/);assert.equal(p.w.localStorage.getItem(STORE),saved);assert.equal(p.requests.length,0);
  });
  check("malformed shared identity does not clear or claim existing progress",()=>{
    const p=page({[KEY]:"{broken"});assert(!p.w.physicsViewer);assert.equal(p.w.localStorage.getItem(STORE),saved);assert.equal(p.requests.length,0);
  });
} finally {
  opened.forEach(p=>{if(p.w.physicsLogin)p.w.physicsLogin.destroy();if(p.w.physicsViewer)p.w.physicsViewer.destroy();p.w.close();});
}
console.log(checks+" physics identity journeys passed");
