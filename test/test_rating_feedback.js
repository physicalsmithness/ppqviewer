/* Real Physics config + shared engine. All images/reports stay local mocks. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8"),engine=read("engine/ppqviewer.js"),config=read("example/physics-config.js");
const opened=[];let checks=0;function check(name,fn){fn();checks++;console.log("ok "+name);}
const meanings=["No idea","Only half understand","Mostly understand","Fully understand, but I might miss it tomorrow","Fully understand, comfortable with this","Trivial — never need to see this again"];
function question(id,label,marks=2){return{id,parent_id:"paper-Q7",source_part_id:id,year:"2025",paper:"2",level:"HL",question_number:"7",label,marks,topic_codes:["A.5"],analysis_groups:["A5.TD"],question_images:["assets/"+id+".png"],context_images:["assets/context.png"],markscheme_images:["assets/ms-long.png"]};}
function mount({marks=2,mobile=false,extra={},stored=null}={}){
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:"https://example.test/ibphysicsppqs/",runScripts:"outside-only",pretendToBeVisual:true}),w=dom.window,intoView=[],windowScroll=[];
 Object.defineProperty(w,"innerWidth",{value:mobile?600:1200,configurable:true});
 w.matchMedia=query=>({matches:query.includes("max-width")?mobile:query.includes("prefers-reduced-motion"),addEventListener(){},removeEventListener(){}});
 w.HTMLElement.prototype.scrollIntoView=function(options){intoView.push({node:this,options});};w.scrollTo=(...args)=>windowScroll.push(args);w.confirm=()=>true;
 w.PHYSICS_META={course:"ib",release:true,title:"IB Physics",default_topic:"A.5",topics:{"A.5":"Relativity"},analysis:{topic:"A.5",groups:[{code:"A5.TD",label:"Time dilation",summary:"Compare the two events.",checks:["Name their frame."]}]}};
 w.PHYSICS_QUESTIONS=[question("q7-ai","(a_i)",marks),question("q7-aii","(a_ii)",marks)];
 w.eval(engine);w.eval(config);Object.assign(w.PPQ_CONFIG,{defaultOrder:"ordered",practiceSelection:{enabled:false},teacherHelp:null,problemReport:null},extra);
 if(stored)w.localStorage.setItem(w.PPQ_CONFIG.storageKey,JSON.stringify(stored));
 const root=w.document.getElementById("root"),v=w.PPQViewer.mount(root,{config:w.PPQ_CONFIG,questions:w.PHYSICS_QUESTIONS,meta:w.PHYSICS_META});
 const p={dom,w,root,v,intoView,windowScroll,q:s=>root.querySelector(s),qa:s=>Array.from(root.querySelectorAll(s))};opened.push(p);return p;
}
function key(p,value,repeat=false){p.root.dispatchEvent(new p.w.Event("pointerdown",{bubbles:true}));p.root.dispatchEvent(new p.w.KeyboardEvent("keydown",{key:value,repeat,bubbles:true,cancelable:true}));}
function mark(p,value){p.q('.ppq-mark-btn[data-mark="'+value+'"]').click();}
function currentHistory(p,selector){return p.qa(".ppq-attempt-history-column "+selector).map(n=>n.textContent.trim());}
function selectedMarks(p,values){
 assert.deepStrictEqual(p.qa(".ppq-mark-btn.selected").map(n=>Number(n.dataset.mark)),values);
 for(const node of p.qa(".ppq-mark-btn")){assert.strictEqual(node.getAttribute("aria-pressed"),values.includes(Number(node.dataset.mark))?"true":"false");assert(node.disabled,"Completed marks cannot append a second attempt");}
}
function saved(p,text){const status=p.q(".ppq-marks-saved");assert(status,"Saved outcome has a stable visible status");assert.strictEqual(status.textContent.replace(/\s+/g," ").trim(),text);assert.strictEqual(status.getAttribute("role"),"status");assert(!status.hidden);assert.notStrictEqual(status.style.display,"none");}
function geometry(p,{internal=true,compTop=1040,compBottom=1280}={}){
 const centre=p.q(".ppq-centre"),comp=p.q(".ppq-competence"),dash=p.q(".ppq-dash"),calls=[];
 centre.style.overflowY=internal?"auto":"visible";Object.defineProperty(centre,"clientHeight",{value:700,configurable:true});Object.defineProperty(centre,"scrollHeight",{value:internal?2400:700,configurable:true});
 centre.getBoundingClientRect=()=>({top:80,bottom:780,height:700,left:0,right:800,width:800});comp.getBoundingClientRect=()=>({top:compTop,bottom:compBottom,height:compBottom-compTop,left:0,right:800,width:800});
 centre.scrollTop=250;centre.scrollTo=function(options){calls.push(options);this.scrollTop=options.top;};dash.scrollTop=91;
 p.intoView.length=0;p.windowScroll.length=0;return{centre,comp,dash,calls};
}
try{
 check("IB has one inline C scale with the requested six meanings and automatic reveal enabled",()=>{
  const p=mount();assert.strictEqual(p.v.cfg.sideRating.enabled,false);assert.strictEqual(p.v.cfg.selfReport.autoReveal,true);assert.deepStrictEqual(Array.from(p.v.cfg.selfReport.meanings),meanings);
  assert.strictEqual(p.qa(".ppq-competence").length,1);assert(p.q(".ppq-card > .ppq-competence.ppq-inline-rating"));assert(!p.q(".ppq-side-rating"));assert(!p.q(".ppq-competence").classList.contains("show"));
  assert.deepStrictEqual(p.qa(".ppq-scale-btn").map(b=>b.title),meanings.map((s,i)=>(i+1)+" — "+s));
  p.v.reveal();assert(p.v._marksPending);assert(!p.q(".ppq-competence").classList.contains("show"));assert.strictEqual(p.v.store.attempts.length,0);
 });
 check("one out of two stays selected, announces Saved and appears in history immediately",()=>{
  const p=mount();p.v.reveal();mark(p,1);selectedMarks(p,[1]);saved(p,"Saved: 1/2");assert.strictEqual(p.v.store.attempts.length,1);assert.strictEqual(p.v.store.attempts[0].marks_awarded,1);
  assert.deepStrictEqual(currentHistory(p,".ppq-attempt-outcome"),["1/2"]);assert.deepStrictEqual(currentHistory(p,".ppq-attempt-confidence"),["C —"]);
  const column=p.q(".ppq-attempt-history-column.current");assert(column);assert.strictEqual(column.dataset.attemptId,p.v.store.attempts[0].attempt_id);assert.match(column.title,/This attempt/);assert.strictEqual(p.q(".ppq-attempt-history-title").textContent,"Attempts");
  assert(p.q(".ppq-competence").classList.contains("show"));assert.strictEqual(p.qa(".ppq-competence").length,1);assert(p.q(".ppq-card > .ppq-answer-panel").compareDocumentPosition(p.q(".ppq-competence"))&p.w.Node.DOCUMENT_POSITION_FOLLOWING);
  mark(p,2);assert.strictEqual(p.v.store.attempts.length,1);selectedMarks(p,[1]);saved(p,"Saved: 1/2");
 });
 check("full marks and an uncertain range retain faithful selections and saved outcomes",()=>{
  const full=mount();full.v.reveal();mark(full,2);selectedMarks(full,[2]);saved(full,"Saved: 2/2");assert(full.v.store.attempts[0].correct);assert.deepStrictEqual(currentHistory(full,".ppq-attempt-outcome"),["2/2"]);
  const range=mount({marks:4});range.v.reveal();range.q(".ppq-marks-unsure").click();mark(range,3);assert.strictEqual(range.v.store.attempts.length,0);mark(range,1);
  selectedMarks(range,[1,2,3]);saved(range,"Saved: 1–3/4");assert.deepStrictEqual(Array.from(range.v.store.attempts[0].marks_range),[1,3]);assert.strictEqual(range.v.store.attempts[0].sure,false);assert.deepStrictEqual(currentHistory(range,".ppq-attempt-outcome"),["1–3/4"]);
 });
 check("keyboard 1 records marks then 3 highlights C without creating another attempt",()=>{
  const p=mount();p.v.reveal();key(p,"1");selectedMarks(p,[1]);const attempt=p.v.store.attempts[0],id=attempt.attempt_id;key(p,"1",true);assert.strictEqual(attempt.self_report,null,"Holding the marks key cannot leak into an unintended C rating");key(p,"3");
  assert.strictEqual(p.v.store.attempts.length,1);assert.strictEqual(p.v.store.attempts[0],attempt);assert.strictEqual(attempt.attempt_id,id);assert.strictEqual(attempt.self_report,3);assert.strictEqual(p.q(".ppq-scale-btn.sel").dataset.val,"3");assert.deepStrictEqual(currentHistory(p,".ppq-attempt-confidence"),["C 3"]);selectedMarks(p,[1]);
  key(p,"1");assert.strictEqual(attempt.self_report,1);assert.strictEqual(p.q(".ppq-scale-btn.sel").dataset.val,"1");assert.strictEqual(p.v.store.attempts.length,1);assert.strictEqual(JSON.parse(p.w.localStorage.getItem(p.v.cfg.storageKey)).attempts[0].self_report,1);
 });
 check("automatic desktop reveal scrolls only the question pane enough to expose C",()=>{
  const p=mount();p.v.reveal();const g=geometry(p);mark(p,1);
  assert.strictEqual(g.calls.length,1);assert(g.calls[0].top>250&&g.calls[0].top<=790,"Scroll only as far as the hidden rating requires");assert.strictEqual(g.calls[0].behavior,"auto","Reduced-motion setting is respected");assert.strictEqual(g.dash.scrollTop,91);assert.strictEqual(p.windowScroll.length,0);assert.strictEqual(p.intoView.length,0);
  key(p,"3");assert.strictEqual(g.calls.length,1,"Selecting C does not repeat the reveal scroll");assert.strictEqual(g.dash.scrollTop,91);
 });
 check("already-visible C does not move the question or dashboard; mobile uses the document flow",()=>{
  const desktop=mount();desktop.v.reveal();const g=geometry(desktop,{compTop:200,compBottom:500});mark(desktop,1);assert.strictEqual(g.calls.length,0);assert.strictEqual(g.centre.scrollTop,250);assert.strictEqual(g.dash.scrollTop,91);
  const mobile=mount({mobile:true});mobile.v.reveal();const m=geometry(mobile,{internal:false});mark(mobile,1);assert.strictEqual(m.calls.length,0);assert.strictEqual(mobile.intoView.length,1);assert.strictEqual(mobile.intoView[0].node,m.comp);assert.strictEqual(mobile.intoView[0].options.block,"nearest");assert.strictEqual(m.dash.scrollTop,91);
 });
 check("Next clears the saved marks and rating on the new part without duplicating the old history",()=>{
  const p=mount();p.v.reveal();mark(p,1);key(p,"3");p.q(".ppq-competence .ppq-next").click();
  assert.strictEqual(p.v.cur.id,"q7-aii");assert(!p.q(".ppq-marks-saved"));assert(!p.q(".ppq-scale-btn.sel"));assert(!p.q(".ppq-competence").classList.contains("show"));assert.strictEqual(p.v.store.attempts.length,1);assert.strictEqual(p.qa(".ppq-attempt-history-column").length,0);
  p.v.render(p.w.PHYSICS_QUESTIONS[0]);assert.deepStrictEqual(currentHistory(p,".ppq-attempt-outcome"),["1/2"]);assert.deepStrictEqual(currentHistory(p,".ppq-attempt-confidence"),["C 3"]);
 });
 console.log(checks+" inline rating and saved-mark feedback journeys passed");
}finally{for(const p of opened){p.v.destroy();p.dom.window.close();}}
