/* Independent DOM journeys for question-local tools and explicit group guidance.
   Desktop/mobile geometry remains a real-browser check. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const engine=fs.readFileSync(path.join(__dirname,"../engine/ppqviewer.js"),"utf8");
const consumer=fs.readFileSync(path.join(__dirname,"../example/physics-config.js"),"utf8");
const clone=x=>JSON.parse(JSON.stringify(x));const opened=[];let checks=0;
function check(name,fn){fn();checks++;console.log("ok "+name);}
const records=["REF","VEL"].map((g,i)=>({id:"q"+i,parent_id:"q"+i,source_part_id:"q"+i,topic_codes:["A.5"],analysis_groups:["A5."+g],
  year:2025,paper:"1A",level:"HL",question_number:String(i+1),label:"",marks:1,correct_option:"B",answer_status:"reviewed_source_key",
  question_images:["question.png"],context_images:[],markscheme_images:["mark.png"]}));
const meta={course:"ib",title:"IB Physics",default_topic:"A.5",topics:{"A.5":"Relativity"},analysis:{groups:[
  {code:"A5.REF",label:"Frames",summary:"Identify the frame.",checks:["Name the observer."]},
  {code:"A5.VEL",label:"Velocity",summary:"Identify relative motion.",checks:["Use a consistent direction."]}
]}};
function mount(extra={},stored=null,pure=false){
  const dom=new JSDOM('<div id="root"></div>',{url:"https://tools.test/",runScripts:"outside-only",pretendToBeVisual:true});
  const w=dom.window,confirms=[],scrolls=[];let accept=true;
  w.confirm=message=>{confirms.push(message);return accept;};
  w.HTMLElement.prototype.scrollIntoView=function(options){scrolls.push({node:this,options});};
  w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.eval(engine);w.PHYSICS_META=clone(meta);w.PHYSICS_QUESTIONS=clone(records);w.eval(consumer);
  const config=pure?{storageKey:"question-tools-minimal",questionType:()=>"mcq",choicesOf:()=>["one","two"],answerKeyOf:()=>"B",...extra}
    :{...w.PPQ_CONFIG,defaultOrder:"ordered",prefetchAhead:0,...extra};
  if(stored)w.localStorage.setItem(config.storageKey,JSON.stringify(stored));
  w.localStorage.setItem("another-consumer",JSON.stringify({attempts:[{id:"untouched"}]}));
  const root=w.document.getElementById("root"),v=w.PPQViewer.mount(root,{config,questions:w.PHYSICS_QUESTIONS,meta:w.PHYSICS_META});
  const p={dom,w,root,v,confirms,scrolls,setConfirm:value=>{accept=value;}};opened.push(p);return p;
}
function state(p){return {id:p.v.cur.id,attempt:p.v._attemptId,answered:p.v.answered,shownAt:p.v.shownAt,timer:p.v._timerInterval,
  pending:p.v._marksPending,draw:JSON.stringify(p.v._drawHistory),store:JSON.stringify(p.v.store)};}
function preferences(p){p.root.querySelector(".ppq-timing-btn").click();return p.root.querySelector(".ppq-timing-panel");}
function choose(p,value){const select=p.root.querySelector('select[aria-label="question group"]');select.value=value;select.dispatchEvent(new p.w.Event("change",{bubbles:true}));}
try{
  check("IB question tools are outside the paper scroller and separate from the right dashboard",()=>{
    const p=mount(),column=p.root.querySelector(".ppq-question-column"),centre=p.root.querySelector(".ppq-centre"),tools=p.root.querySelector(".ppq-toolbar.ppq-question-tools");
    assert(column&&tools);assert.strictEqual(centre.parentElement,column);assert.strictEqual(tools.parentElement,column);
    assert(!centre.contains(tools));assert(!p.root.querySelector(".ppq-dash").contains(tools));
    assert(centre.compareDocumentPosition(tools)&p.w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.strictEqual(p.root.querySelectorAll(".ppq-draw-toggle").length,1);assert(!p.root.querySelector(".ppq-reset"));
    let toggles=0;p.v.toggleDraw=()=>{toggles++;};tools.querySelector(".ppq-draw-toggle").click();assert.strictEqual(toggles,1);
  });
  check("opening and saving Preferences leaves the current answer and clock intact",()=>{
    const p=mount({}, {prefs:{timing:{visibility:"show",direction:"up",clock:true}}});
    p.v._drawHistory=["existing line"];let before=state(p),panel=preferences(p);
    assert.deepStrictEqual(state(p),before);assert.strictEqual(panel.querySelector(".ppq-progress-tools > summary").textContent,"Manage saved progress");
    assert(!panel.querySelector(".ppq-progress-tools").open);panel.querySelector(".ppq-timing-save").click();
    // Save normalizes preference storage but must not reset the active visit.
    assert.strictEqual(p.v.cur.id,before.id);assert.strictEqual(p.v._attemptId,before.attempt);assert.strictEqual(p.v.shownAt,before.shownAt);
    assert.strictEqual(p.v._timerInterval,before.timer);assert.strictEqual(JSON.stringify(p.v._drawHistory),before.draw);
    p.v.selectMCQ("B");before=state(p);panel=preferences(p);assert.strictEqual(p.root.querySelectorAll(".ppq-reset").length,1);
    assert(panel.contains(p.root.querySelector(".ppq-reset")));panel.querySelector(".ppq-timing-save").click();
    assert.deepStrictEqual(state(p),before);
  });
  check("Reset cancellation preserves everything and confirmation clears only this viewer's attempts and ratings",()=>{
    const stored={attempts:[{id:"q0",correct:false,attempt_id:"old"}],scores:{q0:3},flags:{q0:true},prefs:{learnerLevel:"SL",practiceSelection:{mode:"mix"}},learned:{set:{topic:true},enabled:true}};
    const p=mount({},stored),other=p.w.localStorage.getItem("another-consumer"),panel=preferences(p),before=state(p);
    p.setConfirm(false);panel.querySelector(".ppq-reset").click();assert.deepStrictEqual(state(p),before);assert.strictEqual(p.confirms.length,1);
    assert.match(p.confirms[0],/cannot be undone/i);p.setConfirm(true);panel.querySelector(".ppq-reset").click();
    assert.strictEqual(p.confirms.length,2);assert.deepStrictEqual(clone(p.v.store.attempts),[]);assert.deepStrictEqual(clone(p.v.store.scores),{});
    assert.deepStrictEqual(clone(p.v.store.flags),stored.flags);assert.deepStrictEqual(clone(p.v.store.prefs),stored.prefs);assert.deepStrictEqual(clone(p.v.store.learned),stored.learned);
    assert.strictEqual(p.w.localStorage.getItem("another-consumer"),other);
    const saved=JSON.parse(p.w.localStorage.getItem(p.v.cfg.storageKey));assert.deepStrictEqual(saved.attempts,[]);assert.deepStrictEqual(saved.scores,{});
  });
  check("Reset-in-Preferences can be enabled without any other preference feature",()=>{
    const p=mount({questionTools:{resetInPreferences:true}},null,true);
    assert.strictEqual(p.root.querySelector(".ppq-timing-btn").textContent,"Preferences");assert(!p.root.querySelector(".ppq-reset"));
    const panel=preferences(p);assert.strictEqual(panel.querySelector(".ppq-progress-title").textContent,"Preferences");assert(panel.querySelector(".ppq-progress-tools .ppq-reset"));
  });
  check("dropdown and dashboard group choices focus closed Key tips without revealing advice",()=>{
    const p=mount(),dash=p.root.querySelector(".ppq-dash");dash.scrollTop=670;choose(p,"A5.REF");
    let heading=p.root.querySelector(".ppq-facet-guidance summary");assert.strictEqual(heading.textContent,"Key tips");assert(!heading.parentElement.open);
    assert.strictEqual(dash.scrollTop,0);assert.strictEqual(p.w.document.activeElement,heading);
    assert.strictEqual(p.root.querySelector(".ppq-facet-cat.active").dataset.value,"A5.REF");
    heading.click();assert(heading.parentElement.open);
    dash.scrollTop=910;p.root.querySelector('.ppq-facet-cat[data-value="A5.VEL"]').click();
    heading=p.root.querySelector(".ppq-facet-guidance summary");assert.strictEqual(heading.textContent,"Key tips");assert(!heading.parentElement.open);
    assert.strictEqual(p.root.querySelector(".ppq-facet-cat.active").dataset.value,"A5.VEL");
    assert.strictEqual(dash.scrollTop,0);assert.strictEqual(p.w.document.activeElement,heading);assert.strictEqual(p.v.cur.id,"q1");
    assert.strictEqual(p.scrolls.length,0,"Desktop guidance selection must not scroll the document");
  });
  check("guidance focus changes only the dashboard scroller and answer/rating updates leave it in place",()=>{
    const p=mount();choose(p,"A5.REF");const dash=p.root.querySelector(".ppq-dash"),centre=p.root.querySelector(".ppq-centre"),layout=p.root.querySelector(".ppq-layout");
    dash.scrollTop=710;centre.scrollTop=420;layout.scrollTop=90;p.v._focusDashboardGuidance();
    assert.strictEqual(dash.scrollTop,0);assert.strictEqual(centre.scrollTop,420);assert.strictEqual(layout.scrollTop,90);
    dash.scrollTop=530;p.v.selectMCQ("B");assert.strictEqual(dash.scrollTop,530);assert.strictEqual(centre.scrollTop,420);assert.strictEqual(layout.scrollTop,90);
    p.root.querySelector('.ppq-scale-btn[data-val="4"]').click();assert.strictEqual(dash.scrollTop,530);assert.strictEqual(centre.scrollTop,420);
    assert(!p.root.querySelector(".ppq-facet-guidance").open);assert.strictEqual(p.v.store.attempts[0].self_report,4);
    p.v.renderDashboard();assert.strictEqual(dash.scrollTop,530);assert.strictEqual(centre.scrollTop,420);
    // jsdom has no internal overflow geometry, so the answer may reveal inline
    // C in document flow. It must never scroll dashboard guidance on this path.
    assert.strictEqual(p.scrolls.length,1);assert.strictEqual(p.scrolls[0].node,p.root.querySelector(".ppq-competence"));
  });
  check("legacy tools and group selections keep their existing location and scroll behaviour",()=>{
    const legacy=mount({questionTools:undefined},null,true);assert(!legacy.root.querySelector(".ppq-question-column"));
    assert.strictEqual(legacy.root.querySelector(".ppq-toolbar").parentElement,legacy.root);assert(legacy.root.querySelector(".ppq-toolbar .ppq-reset"));
    const p=mount();const filter=p.v.cfg.filters.find(f=>f.field==="analysis_groups");filter.focusGuidanceOnSelect=false;
    const dash=p.root.querySelector(".ppq-dash");dash.scrollTop=390;choose(p,"A5.REF");assert.strictEqual(dash.scrollTop,390);
    assert.strictEqual(p.root.querySelector(".ppq-facet-guidance summary").textContent,"Key tips");assert(!p.root.querySelector(".ppq-facet-guidance").open);
  });
}finally{opened.forEach(p=>{p.v.destroy();p.dom.window.close();});}
console.log(checks+" question tools and guidance journeys passed");
