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
/* Resolve rows through the prototype so geometry survives _saveStore rebuilding
   the dashboard. Coordinates represent content positions, not stale DOM nodes. */
function geometry(p,{height=500,scrollHeight=2400,scrollTop=310,rows={alpha:[950,120],beta:[1250,120],gamma:[1550,120]}}={}){
  const dash=p.root.querySelector(".ppq-dash"),calls=[],original=p.w.HTMLElement.prototype.getBoundingClientRect;
  const rect=(top,h)=>({top,bottom:top+h,height:h,left:0,right:300,width:300});
  Object.defineProperty(dash,"clientHeight",{value:height,configurable:true});
  Object.defineProperty(dash,"scrollHeight",{value:scrollHeight,configurable:true});
  dash.scrollTop=scrollTop;
  dash.scrollTo=function(options){calls.push({top:options.top,behavior:options.behavior,fired:fired(p)});this.scrollTop=options.top;};
  p.w.HTMLElement.prototype.getBoundingClientRect=function(){
    if(this===dash)return rect(100,height);
    if(this.matches(".ppq-facet-cat")&&rows[this.dataset.value]){
      const [top,h]=rows[this.dataset.value];return rect(100+top-dash.scrollTop,h);
    }
    return original.call(this);
  };
  return{dash,calls,rows};
}
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
  check("committing marks immediately jumps the dashboard with its flash, preserving focus and other panes",()=>{
    const p=mount(),g=geometry(p),centre=p.root.querySelector(".ppq-centre"),layout=p.root.querySelector(".ppq-layout");
    p.v.reveal();centre.scrollTop=420;layout.scrollTop=90;
    const before=Array.from(p.root.querySelectorAll(".ppq-select"),s=>s.value),button=p.root.querySelector('.ppq-mark-btn[data-mark="1"]');
    button.focus();const focus=p.w.document.activeElement;button.click();
    assert.strictEqual(g.calls.length,1,"The jump happens in the mark event without running timers");
    assert.strictEqual(g.calls[0].top,760);assert.strictEqual(g.calls[0].behavior,"instant");
    assert.deepStrictEqual(g.calls[0].fired,[],"Jump and pulse are one event: place the row before starting its flash");
    assert.deepStrictEqual(fired(p),["alpha","beta"]);
    assert.strictEqual(centre.scrollTop,420);assert.strictEqual(layout.scrollTop,90);
    assert.deepStrictEqual(p.scrolls,[]);assert.strictEqual(p.w.document.activeElement,focus);
    assert.deepStrictEqual(Array.from(p.root.querySelectorAll(".ppq-select"),s=>s.value),before);
    for(const timer of Array.from(p.timers.values()))if(timer.ms===220)timer.fn();
    assert.strictEqual(g.calls.length,1,"Facet jumps must not be repeated by a delayed timer");
  });
  check("rendering, navigation and markscheme reveal do not jump before an outcome is committed",()=>{
    const p=mount(),g=geometry(p);
    p.v.renderDashboard();p.v.render(p.questions[1]);p.v.render(p.questions[0]);p.v.reveal();
    assert.strictEqual(g.calls.length,0);assert.strictEqual(g.dash.scrollTop,310);
    assert.deepStrictEqual(fired(p),[]);assert.strictEqual(p.v.store.attempts.length,0);
  });
  check("an incomplete uncertain range does not jump or flash; committed range does both",()=>{
    const p=mount(),g=geometry(p);p.v.reveal();p.root.querySelector(".ppq-marks-unsure").click();
    p.root.querySelector('.ppq-mark-btn[data-mark="0"]').click();
    assert.deepStrictEqual(fired(p),[]);assert.strictEqual(g.calls.length,0);assert.strictEqual(p.v.store.attempts.length,0);
    p.root.querySelector('.ppq-mark-btn[data-mark="2"]').click();
    assert.deepStrictEqual(fired(p),["alpha","beta"]);assert.strictEqual(g.calls.length,1);
    assert.deepStrictEqual(Array.from(p.v.store.attempts[0].marks_range),[0,2]);
  });
  check("each saved confidence value jumps with its own feedback, without another attempt",()=>{
    const p=mount({selfReport:{levels:6,prompt:"C",autoReveal:true}}),g=geometry(p);mark(p);
    assert.strictEqual(g.calls.length,1);
    for(const rating of [4,2]){
      g.dash.scrollTop=0;
      p.root.querySelector('.ppq-scale-btn[data-val="'+rating+'"]').click();
      assert.strictEqual(g.calls.length,rating===4?2:3);
      assert.deepStrictEqual(g.calls[g.calls.length-1].fired,[]);
      assert.deepStrictEqual(fired(p),["alpha","beta"]);
      assert.strictEqual(p.v.store.attempts[0].self_report,rating);
    }
    assert.strictEqual(p.v.store.attempts.length,1);
    assert(p.scrolls.every(node=>node.matches(".ppq-competence")),"Only the separate inline C reveal may use document scrolling");
  });
  check("an already-visible matching row flashes without moving the dashboard",()=>{
    const p=mount(),g=geometry(p,{rows:{alpha:[400,120],beta:[1250,120],gamma:[1550,120]}});mark(p);
    assert.deepStrictEqual(fired(p),["alpha","beta"]);assert.strictEqual(g.calls.length,0);
    assert.strictEqual(g.dash.scrollTop,310);assert.deepStrictEqual(p.scrolls,[]);
  });
  check("multiple memberships flash together and one jump prefers the active matching row",()=>{
    const p=mount(),select=p.root.querySelector('.ppq-select[data-fidx="1"]');
    select.value="beta";select.dispatchEvent(new p.w.Event("change",{bubbles:true}));
    const g=geometry(p);mark(p);
    assert.deepStrictEqual(fired(p),["alpha","beta"]);assert.strictEqual(g.calls.length,1);
    assert.strictEqual(g.calls[0].top,1060,"The active beta membership wins over the first alpha row");
    assert.strictEqual(select.value,"beta");
  });
  check("a row taller than the viewport aligns at its top",()=>{
    const p=mount(),g=geometry(p,{rows:{alpha:[950,650],beta:[1700,120],gamma:[1900,120]}});mark(p);
    assert.strictEqual(g.calls.length,1);assert(g.dash.scrollTop>=938&&g.dash.scrollTop<=950);
    const box=p.root.querySelector('.ppq-facet-cat[data-value="alpha"]').getBoundingClientRect();
    assert(box.top>=100&&box.top<=112);
  });
  check("hidden or non-scrolling dashboards flash without moving the document",()=>{
    for(const dimensions of [{height:0},{height:500,scrollHeight:500}]){
      const p=mount(),g=geometry(p,dimensions);mark(p);
      assert.deepStrictEqual(fired(p),["alpha","beta"]);assert.strictEqual(g.calls.length,0);
      assert.deepStrictEqual(p.scrolls,[]);
    }
  });
  check("a reviewed part outside another active filter cannot jump or flash that filtered dashboard",()=>{
    const p=mount(),g=geometry(p);p.v.render(p.questions[2]);mark(p);
    assert.deepStrictEqual(fired(p),[]);assert.strictEqual(g.calls.length,0);assert.strictEqual(p.v.store.attempts[0].id,"q3");
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
