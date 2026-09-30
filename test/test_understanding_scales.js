/* d033 (got it then, get it now) with d025 (I used AI on this one), on the real
   IB Physics config. Synthetic questions and identities; every network call mocked. */
"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const ROOT=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const engine=read("engine/ppqviewer.js"),config=read("example/physics-config.js"),reporting=read("example/physics-reporting.js");
const opened=[];let checks=0;function check(name,fn){fn();checks++;console.log("ok "+name);}
const LABEL="Not applicable: AI or someone else's intelligence helped me";
function question(id,marks=2,extra={}){return Object.assign({id,parent_id:"paper-Q7",source_part_id:id,year:"2025",paper:"2",level:"HL",question_number:"7",label:"(a)",marks,topic_codes:["A.5"],analysis_groups:["A5.TD"],question_images:["assets/"+id+".png"],context_images:[],markscheme_images:["assets/ms.png"]},extra);}
function mount({course="ib",questions=[question("q1"),question("q2",3)],extra={},stored=null}={}){
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:"https://example.test/ibphysicsppqs/",runScripts:"outside-only",pretendToBeVisual:true}),w=dom.window,events=[];
 w.HTMLElement.prototype.scrollIntoView=function(){};w.scrollTo=()=>{};w.confirm=()=>true;
 w.matchMedia=q=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.PHYSICS_META={course,release:true,title:"Scales test",default_topic:"A.5",topics:{"A.5":"Relativity"},analysis:{topic:"A.5",groups:[{code:"A5.TD",label:"Time dilation"}]}};
 w.PHYSICS_QUESTIONS=questions;
 w.eval(engine);w.eval(config);
 Object.assign(w.PPQ_CONFIG,{defaultOrder:"ordered",practiceSelection:{enabled:false},teacherHelp:null,problemReport:null,prefetchAhead:0},extra);
 if(stored)w.localStorage.setItem(w.PPQ_CONFIG.storageKey,JSON.stringify(stored));
 const root=w.document.getElementById("root");
 const v=w.PPQViewer.mount(root,{config:w.PPQ_CONFIG,questions:w.PHYSICS_QUESTIONS,meta:w.PHYSICS_META,report:e=>events.push(e)});
 const p={dom,w,root,v,events,q:s=>root.querySelector(s),qa:s=>Array.from(root.querySelectorAll(s))};opened.push(p);return p;
}
function key(p,value){p.root.dispatchEvent(new p.w.Event("pointerdown",{bubbles:true}));p.root.dispatchEvent(new p.w.KeyboardEvent("keydown",{key:value,bubbles:true,cancelable:true}));}
const mark=(p,n)=>p.q('.ppq-mark-btn[data-mark="'+n+'"]').click();
const now=(p,n)=>p.q('.ppq-now-btn[data-now="'+n+'"]').click();
const visibleLevels=p=>p.qa(".ppq-competence .ppq-scale-btn").filter(b=>!b.hidden).map(b=>Number(b.dataset.val));
const visibleLegend=p=>p.qa(".ppq-competence .ppq-scale-legend-item").map((n,i)=>n.hidden?null:i+1).filter(Boolean);
const awaiting=p=>p.q(".ppq-competence").classList.contains("ppq-rating-awaiting");
const last=p=>p.v.store.attempts[p.v.store.attempts.length-1];
try{
 check("IB offers the one non-mark answer beside the marks; Trilogy and other consumers do not",()=>{
  const ib=mount();ib.v.reveal();const helped=ib.q(".ppq-marksbar .ppq-marks-assisted");
  assert(helped);assert.equal(helped.textContent,LABEL);assert.equal(ib.qa(".ppq-marks-assisted").length,1);assert(!ib.q(".ppq-nowbar"),"Get it now waits for got it then");
  const tri=mount({course:"trilogy"});tri.v.reveal();assert(!tri.q(".ppq-marks-assisted"));assert.equal(tri.v.cfg.understanding.enabled,false);
  const off=mount({extra:{understanding:{enabled:false}}});off.v.reveal();assert(!off.q(".ppq-marks-assisted"));mark(off,1);assert(!off.q(".ppq-nowbar"));assert(!awaiting(off));
 });
 check("full marks prefill get it now to full and offer only C 4 to 6",()=>{
  const p=mount();p.v.reveal();mark(p,2);
  const row=last(p);assert.equal(row.get_it_now_marks,2);assert.equal(row.correct,true);assert(!row.assisted);
  assert.deepEqual(p.qa(".ppq-now-btn").map(b=>b.textContent),["0","1","2"]);
  assert.deepEqual(p.qa(".ppq-now-btn.selected").map(b=>b.dataset.now),["2"]);
  assert.equal(p.q(".ppq-nowbar-prompt").textContent,"How many marks do you understand now, out of 2?");
  assert(!awaiting(p));assert.deepEqual(visibleLevels(p),[4,5,6]);assert.deepEqual(visibleLegend(p),[4,5,6]);
  key(p,"2");assert.equal(row.self_report,null,"A hidden level cannot be keyed");
  key(p,"5");assert.equal(row.self_report,5);assert.equal(p.v.store.scores.q1,5);
  assert.equal(p.v.store.attempts.length,1,"Neither row appends a second attempt");
 });
 check("short marks hold C back until get it now is answered, then offer only 1 to 3",()=>{
  const p=mount();p.v.reveal();key(p,"1");
  const row=last(p);assert.equal(row.marks_awarded,1);assert.equal(row.get_it_now_marks,undefined);
  assert(awaiting(p),"C waits for get it now");assert(p.v._nowPending);assert.deepEqual(p.qa(".ppq-now-btn.selected"),[]);
  key(p,"1");assert.equal(row.get_it_now_marks,1);assert.equal(row.self_report,null,"The key that answered get it now does not also rate");
  assert(!awaiting(p));assert.deepEqual(visibleLevels(p),[1,2,3]);assert.deepEqual(visibleLegend(p),[1,2,3]);
  key(p,"5");assert.equal(row.self_report,null);key(p,"2");assert.equal(row.self_report,2);
  const understood=p.events.filter(e=>e.status==="understood");assert.equal(understood.length,1);
  assert.deepEqual(JSON.parse(understood[0].extra_json),{attempt_id:row.attempt_id,get_it_now_marks:1,marks_max:2});
 });
 check("wrote it right but does not get it: lowering get it now swaps the band and drops a rating from the other band",()=>{
  const p=mount();p.v.reveal();mark(p,2);key(p,"5");const row=last(p);assert.equal(row.self_report,5);
  now(p,1);assert.equal(row.get_it_now_marks,1);assert.deepEqual(visibleLevels(p),[1,2,3]);
  assert.equal(row.self_report,null);assert.equal(p.v.store.scores.q1,undefined);assert(!p.q(".ppq-competence .ppq-scale-btn.sel"));
  assert.equal(p.q(".ppq-next").style.display,"none","Next waits for a rating in the right band");
  key(p,"3");assert.equal(row.self_report,3);assert.equal(row.correct,true,"Got it then is untouched by get it now");
  assert.equal(p.v.store.attempts.length,1);
 });
 check("the declaration records no mark, no verdict, and still asks get it now",()=>{
  const p=mount();p.v.reveal();p.q(".ppq-marks-assisted").click();
  const row=last(p);assert.equal(row.assisted,"ai_or_other");assert.equal(row.correct,null);assert.equal(row.is_correct,"assisted");
  assert(!("marks_awarded" in row));assert(!("marks_range" in row));assert.equal(row.marks_max,2);assert.equal(row.get_it_now_marks,undefined);
  assert.equal(p.q(".ppq-marks-saved").textContent,"Saved: AI or someone else helped");
  assert(p.qa(".ppq-mark-btn").every(b=>b.disabled&&!b.classList.contains("selected")));
  const helped=p.q(".ppq-marks-assisted");assert(helped.disabled&&helped.classList.contains("selected"));assert.equal(helped.getAttribute("aria-pressed"),"true");
  assert(awaiting(p));now(p,2);assert.deepEqual(visibleLevels(p),[4,5,6]);
  const answered=p.events.find(e=>e.status==="answered");const extra=JSON.parse(answered.extra_json);
  assert.equal(extra.assisted,"ai_or_other");assert.equal(extra.correct,null);
  assert.equal(p.q(".ppq-attempt-history-column .ppq-attempt-outcome").textContent,"helped");
 });
 check("an assisted attempt counts towards no performance figure but is covered",()=>{
  const p=mount();p.v.reveal();p.q(".ppq-marks-assisted").click();now(p,1);
  assert.equal(p.v._questionScores().q1,undefined,"No right/wrong score for q1");
  const stats=p.v._progressStats();assert.equal(stats.totals.attempts,0);assert.equal(stats.totals.assisted,1);assert.equal(stats.totals.correct,0);assert.equal(stats.totals.pctCorrect,null,"Not a zero per cent");assert.equal(stats.totals.questions,1,"Covered");
  const topic=stats.axes[0].rows.find(r=>r.value==="A.5");assert.equal(topic.attempts,0);assert.equal(topic.assisted,1);assert.equal(topic.tried,1);
  const dot=topic.questions.find(d=>d.id==="q1");assert.equal(dot.score,null);assert.deepEqual({...dot.assisted},{understood:0.5,now:1,max:2});
 });
 check("an assisted dot sits on the purple-to-teal ramp by its own get it now, and is round",()=>{
  const colour=(n,answer=true)=>{const p=mount();p.v.reveal();p.q(".ppq-marks-assisted").click();if(answer)now(p,n);p.v.renderDashboard();
   const dot=p.qa(".ppq-qdot.assisted")[0];assert(dot,"The dashboard shows an assisted dot");return{bg:dot.style.background.replace(/\s/g,""),title:dot.title};};
  assert.equal(colour(0).bg,"rgb(104,46,128)");assert.equal(colour(1).bg,"rgb(52,96,196)");assert.equal(colour(2).bg,"rgb(20,134,150)");
  const unanswered=colour(0,false);assert.equal(unanswered.bg,"rgb(52,96,196)");assert.match(unanswered.title,/understanding now not recorded/);
  assert.match(colour(2).title,/helped by AI or someone else; understand 2\/2 now/);
 });
 check("a later unaided attempt supersedes the blue, and the earlier help leaves no wrong behind",()=>{
  const stored={attempts:[{id:"q1",attempt_id:"a1",marks_max:2,assisted:"ai_or_other",correct:null,is_correct:"assisted",get_it_now_marks:2,ts:"2026-09-28T10:00:00Z"},
   {id:"q1",attempt_id:"a2",marks_max:2,marks_awarded:2,correct:true,is_correct:"right",ts:"2026-09-29T10:00:00Z"}],scores:{},flags:{},prefs:{}};
  const p=mount({stored});assert.equal(p.v._assistedDots().q1,undefined);assert.equal(p.v._questionScores().q1,1,"Only the unaided attempt scores");
  p.v.renderDashboard();assert.equal(p.qa(".ppq-qdot.assisted").length,0);
  const flipped={...stored,attempts:[stored.attempts[1],{...stored.attempts[0],ts:"2026-09-30T10:00:00Z"}]};
  const q=mount({stored:flipped});assert.deepEqual({...q.v._assistedDots().q1},{understood:1,now:2,max:2});assert.equal(q.v._questionScores().q1,1,"The unaided result is kept, not overwritten");
 });
 check("the next question starts clean: no pending row, no hidden levels, no held rating",()=>{
  const p=mount();p.v.reveal();mark(p,1);assert(awaiting(p));p.v.next();
  assert.equal(p.v.cur.id,"q2");assert(!awaiting(p));assert(!p.v._nowPending);assert.deepEqual(visibleLevels(p),[1,2,3,4,5,6]);assert(!p.q(".ppq-nowbar"));
  p.v.reveal();mark(p,3);assert.equal(last(p).get_it_now_marks,3);assert.deepEqual(visibleLevels(p),[4,5,6]);
 });
 check("Enter still moves on while get it now waits, leaving it honestly unanswered",()=>{
  const p=mount();p.v.reveal();mark(p,0);const row=last(p);key(p,"Enter");
  assert.equal(p.v.cur.id,"q2");assert.equal(row.get_it_now_marks,undefined);
 });
 check("the reporting adapter sends the declaration as its own outcome and get it now as a linked judgment",()=>{
  const dom=new JSDOM("",{url:"https://physicalsmithness.github.io/ibphysicsppqs/",runScripts:"outside-only"}),w=dom.window,sent=[];opened.push({dom,v:{destroy(){}}});
  w.fetch=(url,opts)=>{sent.push(JSON.parse(opts.body));return Promise.resolve({type:"opaque"});};w.eval(reporting);
  const person={anonymous_id:"fixture-person",display_name:"Fixture",cohort:"Test",signed_in:true};
  const q={id:"fx-Q1(a)",source_part_id:"fx",parent_id:"fx-Q1",topic_codes:["A.5"]};
  const row={id:q.id,attempt_id:"fx-attempt",learner_id:person.anonymous_id,marks_max:2,assisted:"ai_or_other",correct:null,is_correct:"assisted",time_ms:0,ts:"2026-09-29T12:00:00Z",self_report:null};
  const v={cfg:{learnerId:person.anonymous_id,idOf:x=>x.id},cur:q,byId:{[q.id]:q},_attemptId:row.attempt_id,store:{attempts:[row]}};
  const r=w.PhysicsReporting.create({enabled:true,identity:{current:()=>person},viewer:()=>v});
  r.report({status:"answered",item_id:q.id,extra_json:JSON.stringify({attempt_id:row.attempt_id})});
  const a=sent[0];assert.equal(a.status,"assisted");assert.equal(a.row_type,"attempt");assert.equal(a.assisted,"ai_or_other");assert.equal(a.item_id,q.id);assert.equal(a.correct,null);assert(!("marks_awarded" in a));
  row.get_it_now_marks=1;r.report({status:"understood",item_id:q.id,extra_json:JSON.stringify({attempt_id:row.attempt_id,get_it_now_marks:1,marks_max:2})});
  const u=sent[1];assert.equal(u.row_type,"understanding");assert.equal(u.event_status,"understood");assert.equal(u.get_it_now_marks,1);assert.equal(u.marks_max,2);assert.equal(u.attempt_id,row.attempt_id);assert.equal(u.item_id,"","Only attempts carry item_id");
  r.report({status:"understood",item_id:q.id,extra_json:JSON.stringify({attempt_id:"no-such-attempt"})});assert.equal(sent.length,2,"No orphan judgment without its attempt");
  delete row.assisted;row.marks_awarded=2;row.correct=true;row.get_it_now_marks=2;r.report({status:"answered",item_id:q.id,extra_json:JSON.stringify({attempt_id:row.attempt_id})});
  assert.equal(sent[2].status,"correct");assert.equal(sent[2].get_it_now_marks,2,"A prefilled get it now rides on the attempt");
 });
 console.log(checks+" got-it-then / get-it-now journeys passed");
}finally{for(const p of opened){try{p.v.destroy();}catch(_){}try{(p.dom.window||p.dom).close();}catch(_){}}}
