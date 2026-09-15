/* Category feedback uses the real engine's committed marks and filtered rows.
   No browser network, source database or generated bundle is touched. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const engine=fs.readFileSync(path.join(__dirname,"../engine/ppqviewer.js"),"utf8");
const opened=[];let checks=0;
function check(name,fn){fn();checks++;console.log("ok "+name);}
function mount(extra={}){
  const dom=new JSDOM('<div id="root"></div>',{url:"https://pulse.test/",runScripts:"outside-only",pretendToBeVisual:true});
  const w=dom.window,scrolls=[],timers=new Map();let timerId=0;
  w.HTMLElement.prototype.scrollIntoView=function(){scrolls.push(this);};
  w.setTimeout=(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;};
  w.clearTimeout=id=>timers.delete(id);
  w.eval(engine);
  const questions=[
    {id:"q1",topic_codes:["A.5"],tags:["alpha","beta","alpha"],paper:"1",marks:2},
    {id:"q2",topic_codes:["A.5"],tags:["gamma"],paper:"1",marks:2},
    {id:"q3",topic_codes:["A.5"],tags:["alpha"],paper:"2",marks:2}
  ];
  const config={storageKey:"pulse-fixture",defaultOrder:"order",questionType:()=>"marksSelfAssess",marksOf:q=>q.marks,
    questionTextOf:()=>"Question",markschemeOf:()=>"Markscheme",groupKey:()=>"A.5",groupLabel:()=>"Relativity",
    modules:{postQuestionReview:false},selfReport:{levels:6,prompt:"C"},
    filters:[{field:"topic_codes",values:["A.5"],default:"A.5"},
      {field:"projected_type",valueOf:q=>q.tags,values:["alpha","beta","gamma"],dependsOn:"topic_codes",dashboardFacet:true},
      {field:"paper",values:["1","2"],default:"1"}],...extra};
  const root=w.document.getElementById("root"),v=w.PPQViewer.mount(root,{config,questions});
  const p={dom,w,root,v,questions,scrolls,timers};opened.push(p);return p;
}
const fired=p=>Array.from(p.root.querySelectorAll(".ppq-cat-fired"),n=>n.dataset.value||n.dataset.key).sort();
function mark(p,value=1){p.v.reveal();p.root.querySelector('.ppq-mark-btn[data-mark="'+value+'"]').click();}
try{
  check("committed fractional marks immediately flash every directly assessed visible type",()=>{
    const p=mount();assert.deepStrictEqual(fired(p),[]);mark(p);
    assert.deepStrictEqual(fired(p),["alpha","beta"]);
    assert.strictEqual(p.v.store.attempts.length,1);assert.strictEqual(p.v.store.attempts[0].marks_awarded,1);
    assert.strictEqual(p.v._questionScores().q1,.5);
    const row=p.root.querySelector('.ppq-facet-cat[data-value="alpha"]');
    assert(row.querySelector('.ppq-qdot:not(.untried)'));
    assert.strictEqual(p.v._pendingDashboardPulse,null);
  });
  check("feedback preserves both panes, focus and the active filters",()=>{
    const p=mount(),centre=p.root.querySelector(".ppq-centre"),dash=p.root.querySelector(".ppq-dash");
    p.v.reveal();centre.scrollTop=420;dash.scrollTop=310;
    const before=Array.from(p.root.querySelectorAll(".ppq-select"),s=>s.value),button=p.root.querySelector('.ppq-mark-btn[data-mark="1"]');
    button.focus();const focus=p.w.document.activeElement;button.click();
    assert.strictEqual(centre.scrollTop,420);assert.strictEqual(dash.scrollTop,310);
    assert.deepStrictEqual(p.scrolls,[]);assert.strictEqual(p.w.document.activeElement,focus);
    assert.deepStrictEqual(Array.from(p.root.querySelectorAll(".ppq-select"),s=>s.value),before);
  });
  check("an incomplete uncertain range does not flash; committed range does",()=>{
    const p=mount();p.v.reveal();p.root.querySelector(".ppq-marks-unsure").click();
    p.root.querySelector('.ppq-mark-btn[data-mark="0"]').click();
    assert.deepStrictEqual(fired(p),[]);assert.strictEqual(p.v.store.attempts.length,0);
    p.root.querySelector('.ppq-mark-btn[data-mark="2"]').click();
    assert.deepStrictEqual(fired(p),["alpha","beta"]);
    assert.deepStrictEqual(Array.from(p.v.store.attempts[0].marks_range),[0,2]);
  });
  check("a reviewed part outside another active filter cannot flash that filtered dashboard",()=>{
    const p=mount();p.v.render(p.questions[2]);mark(p);
    assert.deepStrictEqual(fired(p),[]);assert.strictEqual(p.v.store.attempts[0].id,"q3");
  });
  check("repeated pulses restart their timeout; detached rows cannot affect replacement rows",()=>{
    const p=mount();mark(p);const old=p.root.querySelector('.ppq-facet-cat[data-value="alpha"]');
    const first=old._ppqPulseTimer;p.v._pendingDashboardPulse="A.5";p.v._firePendingDashboardPulse();
    assert(!p.timers.has(first));assert(p.timers.has(old._ppqPulseTimer));
    const callback=p.timers.get(old._ppqPulseTimer).fn;p.v.renderDashboard();
    assert(!old.isConnected);p.v._pendingDashboardPulse="A.5";p.v._firePendingDashboardPulse();callback();
    assert.deepStrictEqual(fired(p),["alpha","beta"]);
  });
  check("legacy topic dashboards retain their existing delayed pulse",()=>{
    const p=mount({filters:[]});mark(p);assert.deepStrictEqual(fired(p),[]);
    const timer=Array.from(p.timers.values()).find(t=>t.ms===220);assert(timer);timer.fn();
    assert.deepStrictEqual(fired(p),["A.5"]);assert.strictEqual(p.scrolls.length,1);
  });
  console.log(checks+" dashboard pulse checks passed");
}finally{for(const p of opened){p.v.destroy();p.dom.window.close();}}
