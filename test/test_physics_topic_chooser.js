/* Real page/identity routing journeys. Synthetic browser state; no network. */
"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const html=read("example/physics.html"),engine=read("engine/ppqviewer.js"),config=read("example/physics-config.js"),identity=read("example/physics-identity.js"),login=read("example/physics-login.js");
const KEY="smithics_fields_identity_v1",STORE="physics_ppq_ib_v1";
const signed={anonymous_id:"smith-fixture",display_name:"Smith",signed_in:true,cohort:"Another subject",contexts:{physics:{anonymous_id:"smith-fixture",display_name:"Smith",cohort:"Test"}}};
const questions=["a","c"].map(label=>({id:"04N.P3.SL.TZ0.QG1("+label+")",parent_id:"04N.P3.SL.TZ0.QG1",source_part_id:"fixture-"+label,topic_codes:["A.5"],analysis_groups:["A5.POST"],analysis_atoms:[],year:"2004",paper:"3",level:"SL",question_number:"G1",label:"("+label+")",marks:2,question_images:["assets/question-"+label+".png"],context_images:["assets/context.png"],markscheme_images:["assets/answer-"+label+".png"]}));
const meta={course:"ib",release:true,title:"IB Physics past papers",default_topic:"A.5",topics:{"A.5":"Galilean and special relativity"},analysis:{topic:"A.5",groups:[{code:"A5.POST",label:"Postulates",summary:"Identify the two postulates.",checks:[]}]}};
const expandedQuestions=questions.concat([
 {...questions[0],id:"25M.P2.HL.TZ1.Q1(a)",parent_id:"25M.P2.HL.TZ1.Q1",source_part_id:"fixture-a1",topic_codes:["A.1"],analysis_groups:["A1.GRAPHS"],analysis_atoms:["A1.GRADIENT"]},
 {...questions[0],id:"25M.P2.HL.TZ1.Q2(a)",parent_id:"25M.P2.HL.TZ1.Q2",source_part_id:"fixture-c1",topic_codes:["C.1"],analysis_groups:["C1.MOTION"],analysis_atoms:["C1.PERIOD"]},
 {...questions[1],id:"25M.P2.HL.TZ1.Q2(b)",parent_id:"25M.P2.HL.TZ1.Q2",source_part_id:"fixture-reviewed-untyped",topic_codes:["A.1","C.1"],analysis_groups:[],analysis_atoms:[]}
]);
const expandedMeta={...meta,topics:{"A.1":"Kinematics","A.5":"Galilean and special relativity","C.1":"Simple harmonic motion"},topic_mapping_counts:{"A.1":{parts:2,typed_parts:1},"A.5":{parts:2,typed_parts:0},"C.1":{parts:2,typed_parts:1}},analysis:{...meta.analysis,
 groups:meta.analysis.groups.concat([{code:"A1.GRAPHS",label:"Motion graphs",summary:"Read the axes.",checks:[]},{code:"C1.MOTION",label:"Oscillatory motion",summary:"Identify a full cycle.",checks:[]}]),
 atoms:[{code:"A1.GRADIENT",label:"Find a gradient",summary:"Use the graph gradient.",checks:[]},{code:"C1.PERIOD",label:"Find a period",summary:"Time one complete cycle.",checks:[]}],types:[]}};
const progress={[STORE]:JSON.stringify({attempts:[{id:questions[0].id,attempt_id:"old",marks_max:2,marks_awarded:1}],scores:{[questions[0].id]:3},prefs:{},flags:{}}),srd_eventlog_v1:'[{"id":"saved-drill","correct":true}]',smithics_fields_v0_1:'{"keep":"saved Fields work"}'};
const opened=[];let checks=0;
function check(label,fn){fn();checks++;console.log("ok "+label);}
function page(query="",options={}){
 const dom=new JSDOM(html,{url:"https://physicalsmithness.github.io/ibphysicsppqs/"+query,runScripts:"outside-only",pretendToBeVisual:true}),w=dom.window,network=[],writes=[];
 for(const [k,v]of Object.entries(progress))w.localStorage.setItem(k,v);
 if(options.signedIn!==false)w.localStorage.setItem(KEY,JSON.stringify(signed));
 const set=w.Storage.prototype.setItem;w.Storage.prototype.setItem=function(k,v){writes.push(k);return set.call(this,k,v);};
 w.fetch=(...args)=>{network.push(args);throw Error("Unexpected network request");};w.XMLHttpRequest=function(){network.push("XHR");throw Error("Unexpected XHR");};w.navigator.sendBeacon=(...args)=>{network.push(args);return false;};w.confirm=()=>true;
 w.PHYSICS_META=JSON.parse(JSON.stringify(options.meta||meta));w.PHYSICS_QUESTIONS=JSON.parse(JSON.stringify(options.questions||questions));
 w.eval(engine);const mount=w.PPQViewer.mount;let mounts=0;w.PPQViewer.mount=function(){mounts++;return mount.apply(this,arguments);};w.eval(identity);w.eval(login);w.eval(config);w.PPQ_CONFIG.prefetchAhead=0;w.PPQ_CONFIG.defaultOrder="ordered";w.PPQ_CONFIG.teacherHelp=null;w.PPQ_CONFIG.problemReport=null;
 for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(match[1].includes("window.physicsViewer ="))w.eval(match[1]);
 const p={w,dom,root:w.document.getElementById("ppq-root"),network,writes,mounts:()=>mounts};opened.push(p);return p;
}
function noProgressWrites(p){for(const [k,v]of Object.entries(progress))assert.equal(p.w.localStorage.getItem(k),v,k+" bytes unchanged");assert(!p.writes.some(k=>Object.hasOwn(progress,k)),"Home must not write a progress store");assert.equal(p.network.length,0);}
function home(p){assert.equal(p.mounts(),0);assert(!p.w.physicsViewer);assert(p.root.querySelector(".physics-topic-home"));assert(!p.w.document.querySelector(".ppq-card"));assert(!p.w.document.querySelector('img[src^="assets/"]'));noProgressWrites(p);}
function activeTopicLinks(p){return[...p.w.document.querySelectorAll("a[href]")].filter(a=>new URL(a.href).searchParams.has("topic"));}
function submit(p){const gate=p.w.document.getElementById("physics-sign-in-gate");gate.querySelector("input").value="Smith";gate.querySelector("select").value="Test";gate.querySelector("form").dispatchEvent(new p.w.Event("submit",{bubbles:true,cancelable:true}));}
try{
 check("IB home ignores the default topic and does not mount or reveal a question",()=>{
  const p=page();home(p);const title=p.root.querySelector('h1 a[href="./"]');assert(title);assert.equal(title.textContent,"IB Physics past-paper question viewer");assert.equal(p.w.document.title,"IB Physics past-paper question viewer");const links=activeTopicLinks(p);assert.equal(links.length,1);assert.equal(new URL(links[0].href).searchParams.get("topic"),"A.5");assert.match(links[0].textContent,/A5.*Galilean and special relativity/i); // QoderWork 2026-09-14
 });
 check("requested future topics are explicitly unavailable and cannot navigate to absent data",()=>{
  const p=page();home(p);const text=p.root.textContent;
  for(const label of ["Kinematics","Simple harmonic motion","Structure of the atom","Quantum physics","Electric and magnetic fields","Data analysis"])assert(text.includes(label),label+" is named");
  const disabled=[...p.root.querySelectorAll('[disabled],[aria-disabled="true"]')];assert.equal(disabled.length,6);assert(disabled.every(el=>/Not yet available/i.test(el.textContent)));assert(disabled.every(el=>!el.hasAttribute("href")&&!el.querySelector("a")));assert(!/assessment|reserved|mock|test exclusion/i.test(text));
 });
 check("unavailable or invalid routes stay on the chooser without silently selecting A5",()=>{
  for(const query of ["?topic=A.1","?topic=unknown","?topic=1B"]){const p=page(query);home(p);assert.equal(activeTopicLinks(p).length,1);}
 });
 check("valid A5 routes open the approved topic and preserve stored work",()=>{
  for(const query of ["?topic=A.5","?topic=A5"]){const p=page(query);assert.equal(p.mounts(),1);assert(p.w.physicsViewer);assert.deepEqual(p.w.physicsViewer.view.map(q=>q.id),questions.map(q=>q.id));assert(!p.root.hidden);noProgressWrites(p);}
 });
 check("an exact shared question link opens that part without requiring a topic parameter",()=>{
  const p=page("?id="+encodeURIComponent(questions[1].id));assert.equal(p.mounts(),1);assert.equal(p.w.physicsViewer.cur.id,questions[1].id);assert.deepEqual(Object.keys(p.w.physicsViewer.byId).sort(),questions.map(q=>q.id).sort());noProgressWrites(p);
 });
 check("home needs no sign-in; selecting a topic then signs in once before starting practice",()=>{
  const p=page("",{signedIn:false});home(p);assert(!p.w.document.getElementById("physics-sign-in-gate"));const link=activeTopicLinks(p)[0];assert(link);
  const next=page(new URL(link.href).search,{signedIn:false});assert.equal(next.mounts(),0);assert(next.root.hidden);assert(next.w.document.getElementById("physics-sign-in-gate"));submit(next);assert.equal(next.mounts(),1);assert(next.w.physicsViewer);assert.equal(next.w.physicsIdentity.current().display_name,"Smith");noProgressWrites(next);
 });
 check("an unavailable exact question link keeps the existing honest notice and available collection",()=>{
  const p=page("?id=not-in-this-collection");assert.equal(p.mounts(),1);assert.equal(Object.keys(p.w.physicsViewer.byId).length,questions.length);assert.match(p.w.document.body.textContent,/That question is not in this practice collection/);noProgressWrites(p);
 });
 check("the viewer title returns home and the account actions share one header",()=>{
  const p=page("?topic=A.5"),title=p.w.document.querySelector('a.physics-viewer-home[href="./"]');assert(title,"Viewer title is a home link");assert.match(title.getAttribute("aria-label"),/choose a topic/i);assert.equal(title.textContent,"IB Physics past-paper question viewer");assert.equal(p.root.querySelector(".ppq-title").textContent,title.textContent); // QoderWork 2026-09-14
  const head=p.root.querySelector(".ppq-header"),person=p.w.document.querySelector(".physics-person"),coverage=p.w.document.querySelector('a[href="/SpecialRelativityDriller/app/coverage.html"]');assert(head&&person&&coverage);assert(head.contains(person));assert(head.contains(coverage));assert.equal((head.textContent.match(/IB Physics past-paper question viewer/g)||[]).length,1);assert.equal(p.w.document.querySelectorAll(".physics-person").length,1);noProgressWrites(p); // QoderWork 2026-09-14
 });
 check("the expanded home offers A1, A5 and C1 exactly once without starting practice",()=>{
  const p=page("",{meta:expandedMeta,questions:expandedQuestions});home(p);
  assert.deepEqual(activeTopicLinks(p).map(a=>new URL(a.href).searchParams.get("topic")).sort(),["A.1","A.5","C.1"]);
  const cards=[...p.root.querySelectorAll(".physics-topics-available article")];assert.equal(cards.length,3);
  for(const [code,label]of Object.entries(expandedMeta.topics))assert(cards.some(card=>card.textContent.includes(label)&&card.querySelector('a[href="?topic='+encodeURIComponent(code)+'"]')));
  const future=[...p.root.querySelectorAll('.physics-topics-soon article[aria-disabled="true"]')];assert.equal(future.length,4);assert(future.every(card=>!card.querySelector("a")&&/Not yet available/.test(card.textContent)));
 });
 check("each new direct link opens only its exact topic memberships, including reviewed untyped parts",()=>{
  for(const code of ["A.1","A1","A.5","C.1","C1"]){
   const p=page("?topic="+code,{meta:expandedMeta,questions:expandedQuestions}),canonical=code.replace(/^([AC])([15])$/,"$1.$2");
   assert.equal(p.mounts(),1);assert(p.w.physicsViewer);assert.deepEqual(p.w.physicsViewer.view.map(q=>q.id).sort(),expandedQuestions.filter(q=>q.topic_codes.includes(canonical)).map(q=>q.id).sort());
   assert.equal(Object.keys(p.w.physicsViewer.byId).length,expandedQuestions.length,"Topic filtering does not remove eligible shared-link records");
   if(canonical!=="A.5")assert(p.w.physicsViewer.view.some(q=>q.source_part_id==="fixture-reviewed-untyped"));
   const homeLink=p.root.querySelector('a.physics-viewer-home[href="./"]');assert(homeLink);noProgressWrites(p);
  }
 });
 check("a shared exact C1 part opens correctly when A5 remains the catalogue default",()=>{
  const target=expandedQuestions.find(q=>q.source_part_id==="fixture-c1"),p=page("?id="+encodeURIComponent(target.id),{meta:expandedMeta,questions:expandedQuestions});
  assert.equal(p.mounts(),1);assert.equal(p.w.physicsViewer.cur.id,target.id);assert.equal(Object.keys(p.w.physicsViewer.byId).length,expandedQuestions.length);noProgressWrites(p);
 });
 check("partial type mapping is explained within the selected topic and never hides untyped questions",()=>{
  const p=page("?topic=A.1",{meta:expandedMeta,questions:expandedQuestions}),v=p.w.physicsViewer;
  assert.match(p.root.querySelector(".ppq-dash-facet-content").textContent,/Some questions still need a type/);
  assert.equal(v.view.length,2);const category=p.root.querySelector('.ppq-facet-cat[data-value="A1.GRADIENT"]');assert(category);category.click();
  assert.deepEqual(v.view.map(q=>q.source_part_id),["fixture-a1"]);p.root.querySelector(".ppq-facet-clear").click();assert.equal(v.view.length,2);
  const topic=p.root.querySelector('select[aria-label="topic"]');topic.value="A.5";topic.dispatchEvent(new p.w.Event("change",{bubbles:true}));
  assert(!/Some questions still need a type/.test(p.root.querySelector(".ppq-dash-facet-content").textContent));
 });
 check("a fully untyped C1 collection stays available with an honest topic-specific explanation",()=>{
  const qs=JSON.parse(JSON.stringify(expandedQuestions));for(const q of qs.filter(q=>q.topic_codes.includes("C.1")))q.analysis_atoms=[];
  const m=JSON.parse(JSON.stringify(expandedMeta));m.topic_mapping_counts["C.1"].typed_parts=0;
  const p=page("?topic=C.1",{meta:m,questions:qs}),v=p.w.physicsViewer,facet=p.root.querySelector(".ppq-dash-facet-content");
  assert.equal(v.view.length,2);assert.match(facet.textContent,/Question types are being added/);assert.match(facet.textContent,/All available questions can be practised now/);
  assert.equal(p.root.querySelectorAll(".ppq-facet-cat").length,0,"No descriptor is fabricated from topic scope or a prerequisite");
 });
 check("a shared A1/A5 question keeps each topic's own descriptors in its sidebar and selectors",()=>{
  const qs=JSON.parse(JSON.stringify(expandedQuestions)),m=JSON.parse(JSON.stringify(expandedMeta)),shared=qs.find(q=>q.source_part_id==="fixture-a1");
  shared.topic_codes.push("A.5");shared.analysis_groups.push("A5.POST");shared.analysis_atoms.push("A5.H5");
  m.analysis.atoms.push({code:"A5.H5",label:"Relativity postulates",summary:"State the postulates.",checks:[]});
  m.analysis.types=[{code:"A1.GRADIENT.TANGENT",parent_atom:"A1.GRADIENT",label:"Tangent"},{code:"A5.H5.POSTULATES",parent_atom:"A5.H5",label:"Both postulates"}];
  shared.analysis_types=["A1.GRADIENT.TANGENT","A5.H5.POSTULATES"];
  const p=page("?topic=A.1",{meta:m,questions:qs}),v=p.w.physicsViewer;
  const values=label=>Array.from(p.root.querySelector('select[aria-label="'+label+'"]').options,option=>option.value).filter(value=>value!=="ALL");
  assert.deepEqual(values("question type"),["A1.GRADIENT"]);assert.deepEqual(values("question group"),["A1.GRAPHS"]);
  assert.deepEqual(Array.from(p.root.querySelectorAll(".ppq-facet-cat"),node=>node.dataset.value),["A1.GRADIENT"]);
  assert(v.view.some(q=>q.source_part_id===shared.source_part_id),"Shared questions remain in the selected topic");
  const atom=p.root.querySelector('select[aria-label="question type"]');atom.value="A1.GRADIENT";atom.dispatchEvent(new p.w.Event("change",{bubbles:true}));assert.deepEqual(values("detail"),["A1.GRADIENT.TANGENT"]);
  const topic=p.root.querySelector('select[aria-label="topic"]');topic.value="A.5";topic.dispatchEvent(new p.w.Event("change",{bubbles:true}));
  assert.deepEqual(values("question type"),["A5.H5"]);assert.deepEqual(values("question group"),["A5.POST"]);
  assert.deepEqual(Array.from(p.root.querySelectorAll(".ppq-facet-cat"),node=>node.dataset.value),["A5.H5"]);
  atom.value="A5.H5";atom.dispatchEvent(new p.w.Event("change",{bubbles:true}));assert.deepEqual(values("detail"),["A5.H5.POSTULATES"]);
 });
 console.log(checks+" physics topic chooser journeys passed");
}finally{for(const p of opened){if(p.w.physicsLogin)p.w.physicsLogin.destroy();if(p.w.physicsViewer)p.w.physicsViewer.destroy();p.w.close();}}
