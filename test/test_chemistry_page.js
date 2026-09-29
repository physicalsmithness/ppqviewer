/* Real wrapper/engine sign-in and storage journeys, entirely in memory. */
"use strict";
const assert = require("assert/strict"), fs = require("fs"), path = require("path");
const {JSDOM} = require("jsdom");
const ROOT = path.resolve(__dirname,"..");
const read = file => fs.readFileSync(path.join(ROOT,file),"utf8");
const KEY = "smithics_fields_identity_v1", OLD = "chemistrydriller_ppq_v1_scores";
const question = {id:"25M.2.SL.TZ3.1(a)",parent_id:"25M.2.SL.TZ3.1",question_number:"1",label:"(a)",
  paper:"2",level:"SL",marks:2,stem_text:"A stem.\nAnother paragraph.",question_text:"Find the formula.",
  question_images:["assets/question.png"],markscheme_images:["assets/answer.png"],markscheme_text:"An answer.",
  current_levels:["SL","HL"],category_code:"S1.4",category_label:"Counting particles"};
const shared = (name="Pupil",id="one",cohort="SL") => ({anonymous_id:id,display_name:name,signed_in:true,cohort:"Physics legacy",
  contexts:{physics:{anonymous_id:id,display_name:name,cohort:"Physics"},chemistry:{anonymous_id:id,display_name:name,cohort}}});
let passed=0;
function check(name,fn){fn();passed++;console.log("ok "+name);}
function page(options={}) {
  const dom=new JSDOM(read("example/chemistry.html"),{url:options.url||"http://127.0.0.1:8791/",runScripts:"outside-only",pretendToBeVisual:true});
  const w=dom.window, requests=[];
  w.fetch=(...args)=>{requests.push(args);return Promise.resolve({type:"opaque"});};
  w.confirm=()=>true;
  const before=JSON.stringify({[question.id]:5});w.localStorage.setItem(OLD,before);
  Object.entries(options.storage||{}).forEach(([k,v])=>w.localStorage.setItem(k,typeof v==="string"?v:JSON.stringify(v)));
  w.CHEMISTRY_META={release:options.release===true};w.CHEMISTRY_QUESTIONS=[JSON.parse(JSON.stringify(question))];
  w.document.querySelectorAll("script:not([src])").forEach(script=>w.eval(script.textContent));
  for(const file of ["example/subject-identity.js","example/physics-reporting.js","engine/ppqviewer.js","example/chemistry-config.js","example/chemistry-page.js"])w.eval(read(file));
  return {dom,w,requests,before,close:()=>w.close()};
}
check("anonymous pupil sees chemistry's real class list before practice",()=>{
  const p=page();try{assert.equal(p.w.chemistryViewer,undefined);assert.equal(p.w.document.querySelector("#chem-signin").hidden,false);
    assert.deepEqual([...p.w.document.querySelectorAll("#chem-class option")].map(o=>o.value),["","SL","HL","Test"]);
    assert.equal(p.requests.length,0);}finally{p.close();}
});
check("driller chemistry identity enters directly and leaves physics untouched",()=>{
  const person=shared();const p=page({storage:{[KEY]:person}});try{assert.ok(p.w.chemistryViewer);
    const now=JSON.parse(p.w.localStorage.getItem(KEY));assert.deepEqual(now.contexts.physics,person.contexts.physics);
    assert.equal(p.w.localStorage.getItem("ppqviewer_chem_cohort_v1"),"SL");
    assert.equal(p.w.chemistryViewer.cfg.learnerId,"one");assert.equal(p.requests.length,0);
    assert.ok(p.w.document.querySelector(".chemistry-stem br"));
    assert.equal(p.w.document.querySelector(".ppq-markscheme").textContent,"");
  }finally{p.close();}
});
check("unbound old chemistry class cannot sign in a different physics learner",()=>{
  const person=shared("Bob","bob");delete person.contexts.chemistry;
  const p=page({storage:{[KEY]:person,ppqviewer_chem_cohort_v1:"SL"}});try{
    assert.equal(p.w.chemistryViewer,undefined);assert.equal(p.w.chemistryIdentity.current().signed_in,false);
    assert.equal(p.w.document.querySelector("#chem-name").value,"Bob");
    assert.equal(p.w.document.querySelector("#chem-class").value,"SL");
    p.w.document.querySelector("#chem-signin").dispatchEvent(new p.w.Event("submit",{cancelable:true}));
    assert.ok(p.w.chemistryViewer);assert.equal(p.w.chemistryIdentity.current().cohort,"SL");
  }finally{p.close();}
});
check("explicit sign-out is not reversed by a stale class",()=>{
  const person=shared();person.signed_in=false;
  const p=page({storage:{[KEY]:person,ppqviewer_chem_cohort_v1:"SL"}});try{assert.equal(p.w.chemistryViewer,undefined);assert.equal(p.w.chemistryIdentity.current().signed_in,false);}finally{p.close();}
});
check("every non-production journey isolates progress and suppresses reporting",()=>{
  for(const opts of [{release:false,url:"https://physicalsmithness.github.io/chemistrydriller/ppqviewer/"},
    {release:true,url:"https://physicalsmithness.github.io/chemistrydriller/ppqviewer/?preview=1"},
    {release:true,url:"http://127.0.0.1:8791/"},
    {release:true,url:"https://physicalsmithness.github.io/chemistrydriller/ppqviewer-other/"}]) {
    const p=page({...opts,storage:{[KEY]:shared()}});try{const v=p.w.chemistryViewer;
      assert.equal(v.cfg.storageKey,"chemistrydriller_ppq_preview_v1");assert.equal(v.store.scores[question.id],undefined);
      v.reveal();p.w.document.querySelector('.ppq-scale-btn[data-val="4"]').click();assert.equal(p.requests.length,0);
      assert.equal(p.w.localStorage.getItem(OLD),p.before);assert.equal(p.w.localStorage.getItem("chemistrydriller_ppq_v2"),null);
    }finally{p.close();}
  }
});
check("production imports legacy ratings without uploading or assigning ownership",()=>{
  const p=page({release:true,url:"https://physicalsmithness.github.io/chemistrydriller/ppqviewer/",storage:{[KEY]:shared(),
    chemistrydriller_ppq_v1_mcq:{[question.id]:true}}});try{const v=p.w.chemistryViewer;
    assert.equal(v.cfg.storageKey,"chemistrydriller_ppq_v2");assert.equal(v.store.scores[question.id],5);
    assert.equal(v.store.attempts[0].learner_id,undefined);assert.equal(p.requests.length,0);
    assert.equal(p.w.localStorage.getItem(OLD),p.before);
  }finally{p.close();}
});
check("sign-in from the shared chemistry helper opens an waiting gate",()=>{
  const p=page();try{p.w.chemistryIdentity.signIn("Pupil","HL");assert.ok(p.w.chemistryViewer);
    assert.equal(p.w.document.querySelector("#chem-signin").hidden,true);assert.equal(p.requests.length,0);
  }finally{p.close();}
});
check("existing site analytics load only on the production route, never in previews",()=>{
  for(const [url,release,expected] of [
    ["https://physicalsmithness.github.io/chemistrydriller/ppqviewer/",true,2],
    ["https://physicalsmithness.github.io/chemistrydriller/ppqviewer/?preview",true,0],
    ["http://127.0.0.1:8791/",true,0],
    ["https://physicalsmithness.github.io/chemistrydriller/ppqviewer/",false,0],
    ["https://physicalsmithness.github.io/chemistrydriller/ppqviewer-other/",true,0]
  ]){const p=page({url,release});try{
    assert.equal(p.w.document.querySelectorAll('script[src*="googletagmanager"],script[src*="clarity.ms"]').length,expected);
    if(expected)assert.ok(p.w.dataLayer.length===2);
    else assert.equal(p.w.dataLayer,undefined);
    assert.equal(p.requests.length,0);
  }finally{p.close();}}
});
console.log(passed+" chemistry page journeys passed");
