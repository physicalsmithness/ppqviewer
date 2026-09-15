/* Real-engine journeys for opt-in learner preferences and visit-bound pacing. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), {JSDOM} = require("jsdom");
const engine = fs.readFileSync(path.join(__dirname,"../engine/ppqviewer.js"),"utf8");
const physics = fs.readFileSync(path.join(__dirname,"../example/physics-config.js"),"utf8");
const opened = []; let checks = 0;
const clone = x => JSON.parse(JSON.stringify(x));
const questions = [
  {id:"a",topic:"A5",level:"SL",marks:2,question_text:"First",choices:["one","two","three","four"]},
  {id:"b",topic:"A1",level:"HL",marks:3,question_text:"Second",choices:["one","two","three","four"]}
];
function check(name,run) { run(); checks++; console.log("ok "+name); }
function mount(extra={},stored=null,records=questions) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>',{url:"https://example.test/",runScripts:"outside-only",pretendToBeVisual:true});
  const w=dom.window; w.confirm=()=>true; w.HTMLElement.prototype.scrollIntoView=function(){}; w.eval(engine);
  const config={storageKey:"learner-test",defaultOrder:"ordered",questionType:q=>q.type||"mcq",answerKeyOf:()=>"B",
    groupKey:q=>q.topic,groupLabel:q=>q.topic,metaLine:q=>"Original paper "+q.level,
    filters:[{field:"topic",label:"topic",values:["A5","A1"]}],learnerLevel:{enabled:true,defaultValue:"HL"},
    timing:{defaultMode:"clock",targetOf:(q,c)=>q.marks*(c.learnerLevel==="HL"?60:90)},...extra};
  if(stored) w.localStorage.setItem(config.storageKey,JSON.stringify(stored));
  const root=w.document.getElementById("root"),v=w.PPQViewer.mount(root,{config,questions:clone(records)});
  const p={dom,w,root,v};opened.push(p);return p;
}
function save(p,level,edit) {
  p.root.querySelector(".ppq-timing-btn").click();
  const panel=p.root.querySelector(".ppq-timing-panel"),select=panel.querySelector('select[aria-label="My level"]');
  assert(select);select.value=level;if(edit)edit(panel);panel.querySelector(".ppq-timing-save").click();
}
function stored(p) { return JSON.parse(p.w.localStorage.getItem(p.v.cfg.storageKey)); }
function live(p) {return {id:p.v.cur.id,attemptId:p.v._attemptId,shownAt:p.v.shownAt,answered:p.v.answered,
  marksPending:p.v._marksPending,timer:p.v._timerInterval,draw:JSON.stringify(p.v._drawHistory),attempts:JSON.stringify(p.v.store.attempts)};}
try {
  check("learner defaults and saved values are validated without inferring printed paper level",()=>{
    const p=mount();assert.strictEqual(p.v._learnerLevel(),"HL");assert.strictEqual(p.v.cur.level,"SL");
    const sl=mount({learnerLevel:{enabled:true,defaultValue:"SL"}},{prefs:{learnerLevel:"invalid"}});assert.strictEqual(sl.v._learnerLevel(),"SL");
    const invalid=mount({learnerLevel:{enabled:true,defaultValue:"invalid"}},{prefs:{learnerLevel:"HLSL"}});assert.strictEqual(invalid.v._learnerLevel(),"HL");
    const saved=mount({}, {prefs:{learnerLevel:"SL"}});assert.strictEqual(saved.v._learnerLevel(),"SL");
  });
  check("saving My level preserves the live answer and survives reload, topic changes and filter clearing",()=>{
    const p=mount();p.v._drawHistory=["existing drawing"];
    const before=live(p);save(p,"SL");assert.deepStrictEqual(live(p),before);
    assert.strictEqual(p.v._learnerLevel(),"SL");assert.strictEqual(p.v._visitLearnerLevel,"HL");
    assert.strictEqual(stored(p).prefs.learnerLevel,"SL");
    const topic=p.root.querySelector('select[aria-label="topic"]');topic.value="A1";topic.dispatchEvent(new p.w.Event("change"));
    assert.strictEqual(p.v._learnerLevel(),"SL");p.v.clearAllFilters();assert.strictEqual(p.v._learnerLevel(),"SL");
    const reload=mount({},stored(p));assert.strictEqual(reload.v._learnerLevel(),"SL");assert.strictEqual(reload.v._visitLearnerLevel,"SL");
    p.v._jumpToQuestion("b");assert.strictEqual(p.v._learnerLevel(),"SL");
    p.v.reset();assert.strictEqual(p.v._learnerLevel(),"SL");
  });
  check("timing target, extra time and axes stay fixed until the next visit",()=>{
    const calls=[],p=mount({timing:{defaultMode:"clock",targetOf:(q,c)=>{calls.push([q.id,c.learnerLevel]);return q.marks*(c.learnerLevel==="HL"?60:90);}}},
      {prefs:{timing:{visibility:"show",direction:"up",clock:true,extraPct:25}}});
    assert.strictEqual(p.v._timingTargetMsFor(p.v.cur),150000);assert.strictEqual(calls.length,1);
    const before=live(p);save(p,"SL",panel=>{
      panel.querySelector(".ppq-timing-extra-input").value="50";
      const direction=Array.from(panel.querySelectorAll(".ppq-timing-seg-row")).find(n=>n.querySelector(".ppq-timing-seg-label").textContent==="Direction");
      direction.querySelector('[data-value="down"]').click();
    });
    assert.deepStrictEqual(live(p),before);p.v._tickTiming();
    assert.strictEqual(p.v._timingTargetMsFor(p.v.cur),150000);assert.strictEqual(calls.length,1);
    assert.strictEqual(p.v._timingModeNow(),"show-up-clock");
    p.v.selectMCQ("B");assert.strictEqual(p.v._timerCtx.target_ms,150000);
    assert.strictEqual(p.v.store.attempts[0].learner_level,"HL");assert.strictEqual(p.v.cur.level,"SL");
    const answered=live(p);save(p,"SL");assert.deepStrictEqual(live(p),answered);
    p.v.next();assert.strictEqual(p.v.cur.id,"b");assert.strictEqual(p.v._visitLearnerLevel,"SL");
    assert.strictEqual(p.v._timingTargetMsFor(p.v.cur),405000);assert.strictEqual(p.v._timingModeNow(),"show-down-clock");
    assert.deepStrictEqual(calls,[["a","HL"],["b","SL"]]);
  });
  check("manual marks record the visit level even when preferences change after reveal",()=>{
    const old={id:"a",correct:true,level:"SL",attempt_id:"old"};
    const p=mount({questionType:()=>"marksSelfAssess",markschemeOf:()=>"Answer",attemptFields:q=>({level:q.level})},
      {attempts:[old],prefs:{}},questions);
    p.v.reveal();assert(p.v._marksPending);const before=live(p);save(p,"SL");assert.deepStrictEqual(live(p),before);
    p.root.querySelector('.ppq-mark-btn[data-mark="1"]').click();
    const row=p.v.store.attempts[1];assert.strictEqual(row.learner_level,"HL");assert.strictEqual(row.level,"SL");assert.strictEqual(row.marks_awarded,1);
    assert.deepStrictEqual(clone(p.v.store.attempts[0]),old);p.v.render();assert.strictEqual(p.v._visitLearnerLevel,"SL");
  });
  check("missing, invalid and throwing pacing targets do not invent an allocation",()=>{
    for(const targetOf of [()=>null,()=>0,()=>Infinity,()=>NaN,()=>{throw Error("bad target");}]) {
      const p=mount({timing:{defaultMode:"clock",targetOf}});assert.strictEqual(p.v._timingTargetMsFor(p.v.cur),null);
      p.v.selectMCQ("B");assert(!Object.hasOwn(p.v._timerCtx,"target_ms"));
    }
  });
  check("question badges are escaped, separate from history, refreshed and safe when a hook fails",()=>{
    const before=clone(questions),p=mount({attemptHistory:{enabled:true},questionBadgesOf:q=>q.id==="a"
      ? [{label:"Current HL",title:"Current syllabus"},{label:"<b>Original paper SL</b>",title:'<img src=x>'},null,{label:""}]
      : []});
    const right=p.root.querySelector(".ppq-question-top-right"),badges=right.querySelector(".ppq-question-badges");
    assert.strictEqual(badges.querySelectorAll(".ppq-question-badge").length,2);
    assert.strictEqual(badges.children[1].textContent,"<b>Original paper SL</b>");assert.strictEqual(badges.children[1].title,'<img src=x>');
    assert(!badges.querySelector("b,img"));assert(right.querySelector(".ppq-attempt-history"));
    assert.strictEqual(p.root.querySelector(".ppq-qid").textContent,"Original paper SL");
    assert.deepStrictEqual(clone(p.v.questions),before);p.v.next();assert(badges.hidden);assert.strictEqual(badges.children.length,0);
    p.v.cfg.questionBadgesOf=()=>{throw Error("badge error");};p.v.render();assert(badges.hidden);assert(p.v.cur);
  });
  check("learner preference works without timing and pacing description is escaped",()=>{
    const p=mount({timing:null});assert.strictEqual(p.root.querySelector(".ppq-timing-btn").textContent,"Preferences");
    save(p,"SL");p.v.next();p.v.selectMCQ("B");assert.strictEqual(p.v.store.attempts[0].learner_level,"SL");
    const described=mount({timing:{defaultMode:"none",description:"<b>Marks × time</b>",targetOf:q=>q.marks*100}});
    described.root.querySelector(".ppq-timing-btn").click();const desc=described.root.querySelector(".ppq-timing-description");
    assert.strictEqual(desc.textContent,"<b>Marks × time</b>");assert(!desc.querySelector("b"));
  });
  check("unrelated consumers keep one-argument pacing and omit learner UI and attempt fields",()=>{
    const p=mount({learnerLevel:undefined,timing:{defaultMode:"clock",targetOf:q=>q.marks*30}}, {prefs:{learnerLevel:"SL"}});
    assert.strictEqual(p.v.cfg.learnerLevel.enabled,false);assert.strictEqual(p.v._timingTargetMsFor(p.v.cur),60000);
    p.root.querySelector(".ppq-timing-btn").click();assert(!p.root.querySelector('select[aria-label="My level"]'));p.v.closeModal();
    assert(!p.root.querySelector(".ppq-question-top"));p.v.selectMCQ("B");assert(!Object.hasOwn(p.v.store.attempts[0],"learner_level"));
  });
  check("real Physics config supplies marks-aware allocations by practice paper and learner level",()=>{
    const box=new JSDOM("",{url:"https://example.test/",runScripts:"outside-only"}),w=box.window;
    w.PHYSICS_META={course:"ib",topics:{"A.5":"Relativity"}};w.PHYSICS_QUESTIONS=[];w.eval(physics);
    const cfg=w.PPQ_CONFIG;assert.strictEqual(cfg.learnerLevel.enabled,true);assert.strictEqual(cfg.learnerLevel.defaultValue,"HL");
    for(const paper of ["1","1A","1B"]) for(const learnerLevel of ["HL","SL"]) assert.strictEqual(cfg.timing.targetOf({marks:2,paper,topic_codes:["A.5"]},{learnerLevel}),240);
    assert.strictEqual(cfg.timing.targetOf({marks:3,paper:"2",topic_codes:["A.5"]},{learnerLevel:"HL"}),300);
    assert.strictEqual(cfg.timing.targetOf({marks:3,paper:"3",topic_codes:["A.5"]},{learnerLevel:"SL"}),324);
    assert.strictEqual(cfg.timing.targetOf({marks:3,paper:"3",topic_codes:["DATA"]},{learnerLevel:"SL"}),360);
    assert.strictEqual(cfg.timing.targetOf({marks:null,paper:"2",topic_codes:["A.5"]},{learnerLevel:"HL"}),null);box.window.close();
  });
} finally {opened.forEach(p=>{p.v.destroy();p.dom.window.close();});}
console.log(checks+" learner level and visit timing journeys passed");
