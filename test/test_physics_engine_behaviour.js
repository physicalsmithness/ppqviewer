"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),{JSDOM}=require("jsdom");
const engine=fs.readFileSync(path.join(__dirname,"../engine/ppqviewer.js"),"utf8");
const opened=[];let checks=0;
function check(name,fn){fn();checks++;console.log("ok "+name);}
function mount(questions,extra={},prepareWindow){
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:"https://localhost/",runScripts:"outside-only",pretendToBeVisual:true});
 const w=dom.window,requests=[];w.confirm=()=>true;
 w.Image=function(){Object.defineProperty(this,"src",{set:url=>requests.push(url)});};
 if(prepareWindow)prepareWindow(w);
 w.eval(engine);const root=w.document.getElementById("root");
 const config={storageKey:"physics-engine-test",defaultOrder:"ordered",questionTextOf:()=>"A prompt",groupKey:q=>q.group||"A5",groupLabel:q=>q.group||"A5",cropsOf:q=>q.crops||[],contextCropsOf:q=>q.context||[],msCropsOf:q=>q.ms||[],...extra};
 const v=w.PPQViewer.mount(root,{config,questions});const p={dom,w,root,v,requests};opened.push(p);return p;
}
function key(p,key,target=p.root,extra={}){const e=new p.w.KeyboardEvent("keydown",{key,bubbles:true,cancelable:true,...extra});target.dispatchEvent(e);return e;}
const simple=[1,2,3].map(i=>({id:"q"+i,crops:["q"+i+".png"],context:["context"+i+".png","q"+i+".png"],ms:["ms"+i+".png"]}));
try{
 check("current and look-ahead question/context/answer images warm once",()=>{
  const p=mount(simple,{prefetchAhead:1});
  assert.deepStrictEqual([...p.requests].sort(),["context1.png","context2.png","ms1.png","ms2.png","q1.png","q2.png"].sort());
  p.v.render();assert.strictEqual(p.requests.length,6);
  p.v.next();assert(p.requests.includes("ms3.png")&&p.requests.includes("context3.png"));
  assert.strictEqual(new Set(p.requests).size,p.requests.length);
 });
 check("one warming batch and retained cache are bounded",()=>{
  const p=mount([{id:"many",crops:Array.from({length:120},(_,i)=>"large"+i+".png")}],{prefetchAhead:Infinity});
  assert.strictEqual(p.requests.length,80);assert.strictEqual(p.v._preloaded.size,80);
  p.v.render();assert.strictEqual(p.requests.length,80);
  const normal=mount(simple,{prefetchAhead:999});assert.strictEqual(normal.v.cfg.prefetchAhead,12);
  const off=mount(simple,{prefetchAhead:-3});assert.strictEqual(off.v.cfg.prefetchAhead,0);assert(!off.requests.includes("q2.png"));
 });
 const parts=[{id:"paper.Q7(a)",label:"(a)",group:"first",marks:2,crops:["a.png"],context:["whole.png"],ms:["a-ms.png"]},{id:"paper.Q7(b)",label:"(b)",group:"second",marks:3,crops:["b.png"],context:["whole.png"],ms:["b-ms.png"]}];
 check("next three part images precede large context and markscheme sets within the cache limit",()=>{
  const questions=[1,2,3,4,5].map(i=>({id:"priority"+i,crops:["part"+i+".png"],context:Array.from({length:90},(_,j)=>"context"+i+"-"+j+".png"),ms:["answer"+i+".png"]}));
  const p=mount(questions,{prefetchAhead:3});
  assert.deepStrictEqual(p.requests.slice(0,4),["part1.png","part2.png","part3.png","part4.png"]);
  assert.strictEqual(p.requests.length,80);assert.strictEqual(p.v._preloaded.size,80);
  for(const url of p.requests.slice(0,4))assert(p.v._preloaded.has(url));
  assert(!p.requests.includes("part5.png"));
  p.v.next();assert(p.v._preloaded.has("part5.png"));
  assert.strictEqual(p.requests.filter(url=>url==="part2.png").length,1);
  assert(!p.root.querySelector(".ppq-markscheme img"));assert.strictEqual(p.v.store.attempts.length,0);
 });
 const structured={prefetchAhead:0,modules:{structuredPaper:true},blockKeyOf:()=>"paper.Q7",partLabelOf:q=>q.label,partMarksOf:q=>q.marks,stemUrlOf:()=>null,structuredNavigationOnly:true,structuredNavBeforeStem:true,structuredQuestionLabelOf:()=>"Question 7",targetPartHeadingOf:q=>"Answer part "+q.label,questionTextOf:()=>'<details class="test-context" open><summary>Context</summary><img src="whole.png"></details>'};
 check("structured siblings preload their answer crops with shared context deduplicated",()=>{
  const p=mount(parts,structured);assert(p.requests.includes("b-ms.png"));assert.strictEqual(p.requests.filter(x=>x==="whole.png").length,1);
 });
 check("opt-in target label precedes context and repeats with marks before own crop",()=>{
  const p=mount(parts,structured),heading=p.root.querySelector(".ppq-target-part"),context=p.root.querySelector(".test-context"),lead=p.root.querySelector(".ppq-stem-partlead");
  assert.strictEqual(heading.textContent,"Answer part (a)");assert.strictEqual(lead.textContent,"Answer part (a), 2 marks");
  assert(heading.compareDocumentPosition(context)&p.w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert(context.compareDocumentPosition(lead)&p.w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert(p.root.querySelector(".ppq-struct").compareDocumentPosition(p.root.querySelector(".ppq-draw-container"))&p.w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.strictEqual(p.root.querySelector(".ppq-wq-jump").textContent,"Question 7, jump to part:");
  assert(!p.root.querySelector(".ppq-mode-toggle")&&!p.root.querySelector(".ppq-whole"));
  p.v.cfg.targetPartHeadingOf=()=>'<b>unsafe</b>';p.v.render();assert.strictEqual(p.root.querySelector(".ppq-target-part").textContent,'<b>unsafe</b>');assert(!p.root.querySelector(".ppq-target-part b"));
 });
 check("part chips work across an active topic filter and reset only the chosen scroller",()=>{
  const p=mount(parts,{...structured,questionScrollContainer:".test-centre"});
  const centre=p.w.document.createElement("div");centre.className="test-centre";p.root.appendChild(centre);centre.appendChild(p.root.querySelector(".ppq-card"));
  const side=p.root.querySelector(".ppq-dash");side.scrollTop=71;centre.scrollTop=900;
  p.v.setGroupFilter("first");assert.strictEqual(p.v.view.length,1);centre.scrollTop=600;
  p.root.querySelector('.ppq-part-chip[data-id="paper.Q7(b)"]').click();
  assert.strictEqual(p.v.cur.id,"paper.Q7(b)");assert.strictEqual(p.v.groupFilter,"first");assert.strictEqual(centre.scrollTop,0);assert.strictEqual(side.scrollTop,71);
  centre.scrollTop=500;p.v._jumpToQuestion("paper.Q7(a)");assert.strictEqual(centre.scrollTop,0);assert.strictEqual(side.scrollTop,71);
 });
 const mcq={questionType:()=>"mcq",choicesOf:()=>["one","two","three","four"],answerKeyOf:()=>"B",prefetchAhead:0};
 check("A-D and 1-4 choose the same unanswered MCQ options",()=>{
  const p=mount([{id:"mcq"}],mcq);
  for(const k of ["A","b","C","d","1","2","3","4"]){p.v.render();key(p,k);assert(p.v.answered);assert.strictEqual(p.v._chosenLabel,/\d/.test(k)?"ABCD"[Number(k)-1]:k.toUpperCase());}
  p.v.render();key(p,"4");const chosen=p.v._chosenLabel;key(p,"2");assert.strictEqual(p.v._chosenLabel,chosen);assert.strictEqual(p.v.store.scores.mcq,2);
 });
 check("typing, modifier shortcuts and a picture modal never answer the underlying MCQ",()=>{
  const p=mount([{id:"mcq"}],mcq);
  for(const tag of ["input","textarea","select","div"]){const target=p.w.document.createElement(tag);if(tag==="div")Object.defineProperty(target,"isContentEditable",{value:true});p.root.appendChild(target);key(p,"1",target);assert.strictEqual(p.v.answered,false);target.remove();}
  for(const extra of [{ctrlKey:true},{metaKey:true},{altKey:true}]){key(p,"a",p.root,extra);assert.strictEqual(p.v.answered,false);}
  p.v.openModal("question.png");key(p,"1");assert.strictEqual(p.v.answered,false);key(p,"Escape");assert(!p.root.querySelector(".ppq-modal").classList.contains("show"));
  key(p,"1");assert(p.v.answered);
 });
 check("MCQ markscheme is prefetched but revealed only after answering, with accessible zoom",()=>{
  const p=mount([{id:"mcq",ms:["answer-crop.png","answer-crop.png"]}],mcq);
  assert.strictEqual(p.requests.filter(x=>x==="answer-crop.png").length,1);
  assert(!p.root.querySelector(".ppq-markscheme img"));assert(!p.root.querySelector(".ppq-answer-panel.show"));
  key(p,"B");assert.strictEqual(p.v._wasRight,true);assert(p.root.querySelector('.ppq-option[data-label="B"]').classList.contains("correct"));
  const image=p.root.querySelector(".ppq-answer-panel.show .ppq-markscheme img");
  assert(image);assert.strictEqual(p.root.querySelectorAll(".ppq-markscheme img").length,1);assert.strictEqual(image.getAttribute("src"),"answer-crop.png");
  assert.strictEqual(p.root.querySelector(".ppq-ms-header").textContent,"Markscheme");assert.strictEqual(p.root.querySelector(".ppq-examiner-body").textContent,"");
  assert.strictEqual(image.style.cursor,"zoom-in");assert.strictEqual(image.tabIndex,0);assert.strictEqual(image.getAttribute("role"),"button");
  image.click();assert(p.root.querySelector(".ppq-modal.show .ppq-modal-body img"));key(p,"Escape");
  key(p,"Enter",image);assert(p.root.querySelector(".ppq-modal.show"));assert.strictEqual(p.v.cur.id,"mcq");key(p,"Escape");
  key(p,"5");assert.strictEqual(p.v.store.scores.mcq,5);assert.strictEqual(p.v.store.attempts.length,1);
 });
 check("MCQs without supplied crops keep their examiner feedback and no stale answer images",()=>{
  const p=mount([{id:"with",ms:["old.png"]},{id:"without",examiner:"Examiner comment"},{id:"plain"}],{...mcq,examinerOf:q=>q.examiner||""});
  p.v.goToId("with");key(p,"B");assert(p.root.querySelector(".ppq-markscheme img"));p.v.goToId("without");
  assert(!p.root.querySelector(".ppq-markscheme img"));key(p,"A");assert.strictEqual(p.v._wasRight,false);assert(p.root.querySelector('.ppq-option[data-label="A"]').classList.contains("incorrect"));
  assert.strictEqual(p.root.querySelector(".ppq-examiner-body").textContent,"Examiner comment");assert(!p.root.querySelector(".ppq-markscheme img"));
  p.v.goToId("plain");key(p,"B");assert(!p.root.querySelector(".ppq-answer-panel.show"));assert.strictEqual(p.root.querySelector(".ppq-examiner-body").textContent,"");
 });
 check("concealed-answer MCQs do not expose their markscheme crops",()=>{
  const p=mount([{id:"concealed",ms:["concealed.png"]}],{...mcq,revealCorrect:false});key(p,"A");
  assert(p.v.answered);assert(!p.root.querySelector(".ppq-markscheme img"));assert(!p.root.querySelector(".ppq-option.correct"));
 });
 check("structured markscheme zoom works and marks-entry controls cannot leak into the next MCQ",()=>{
  const p=mount([{id:"structured",marks:3,ms:["structured-ms.png"]},{id:"mcq",ms:["mcq-ms.png"]}],{...mcq,questionType:q=>q.id==="structured"?"marksSelfAssess":"mcq",marksOf:q=>q.marks});
  p.v.goToId("structured");p.v.reveal();const image=p.root.querySelector(".ppq-ms-crop");image.click();assert(p.root.querySelector(".ppq-modal.show"));key(p,"Escape");assert(p.root.querySelector(".ppq-marksbar"));
  p.v.goToId("mcq");key(p,"B");assert(p.root.querySelector(".ppq-answer-panel.show .ppq-ms-crop"));assert(!p.root.querySelector(".ppq-marksbar"));
 });
 check("marks-entry numbers keep priority over confidence ratings",()=>{
  const p=mount([{id:"structured",marks:3}],{questionType:()=>"marksSelfAssess",marksOf:q=>q.marks});p.v.reveal();assert(p.v._marksPending);key(p,"2");assert.strictEqual(p.v._marksOutcome.awarded,2);assert(!p.v.store.scores.structured);
 });
 const finderQuestions=[{id:"inside1",group:"A5",year:"2005",level:"HL"},{id:"inside2",group:"A5",year:"2005",level:"HL"},{id:"outside",group:"A1",year:"2006",level:"SL"}];
 const finderConfig={...mcq,questionFinder:true,questionScrollContainer:".ppq-card",filters:[{field:"year",label:"Year",default:"2005"},{field:"level",label:"Level",multi:true,default:["HL"]}]};
 check("opt-in finder keeps current filters, group and order through answering an in-view question",()=>{
  const p=mount(finderQuestions,{...finderConfig,finderPreserveFilters:true});p.v.setGroupFilter("A5");p.v._groupFilterLabel="Special relativity";
  p.root.querySelector(".ppq-order").value="shuffle";
  const before=p.v.view.map(q=>q.id).join("|");p.v._jumpToQuestion("inside2");
  assert.strictEqual(p.v.cur.id,"inside2");assert.strictEqual(p.v.groupFilter,"A5");assert.strictEqual(p.v._groupFilterLabel,"Special relativity");assert.strictEqual(p.v.view.map(q=>q.id).join("|"),before);
  assert.strictEqual(p.root.querySelector('.ppq-select[data-fidx="0"]').value,"2005");assert.deepStrictEqual(Array.from(p.v._multiSel[1]),["HL"]);assert.strictEqual(p.root.querySelector(".ppq-order").value,"shuffle");
  key(p,"B");key(p,"5");p.v.renderDashboard();assert.strictEqual(p.v.groupFilter,"A5");assert.strictEqual(p.root.querySelector('.ppq-select[data-fidx="0"]').value,"2005");assert.strictEqual(p.v.store.scores.inside2,5);
 });
 check("opt-in finder still clears filters when the chosen question is outside the current view",()=>{
  const p=mount(finderQuestions,{...finderConfig,finderPreserveFilters:true});p.v.setGroupFilter("A5");p.root.querySelector(".ppq-order").value="shuffle";p.v._jumpToQuestion("outside");
  assert.strictEqual(p.v.cur.id,"outside");assert.strictEqual(p.v.groupFilter,null);assert.strictEqual(p.root.querySelector('.ppq-select[data-fidx="0"]').value,"ALL");assert.strictEqual(p.v._multiSel[1],null);assert.strictEqual(p.root.querySelector(".ppq-order").value,"order");
 });
 check("legacy finder keeps its existing reset behaviour for an in-view question",()=>{
  const p=mount(finderQuestions,finderConfig);p.v.setGroupFilter("A5");p.v._jumpToQuestion("inside2");assert.strictEqual(p.v.cur.id,"inside2");assert.strictEqual(p.v.groupFilter,null);assert.strictEqual(p.root.querySelector('.ppq-select[data-fidx="0"]').value,"ALL");assert.strictEqual(p.v._multiSel[1],null);
 });
 check("practice exhaustion can open and close Preferences, then reset restores available questions",()=>{
  const p=mount([{id:"only"}],{...mcq,practiceSelection:{enabled:true,defaultMode:"unattempted"}});key(p,"B");p.v.next();
  assert.strictEqual(p.v.cur,null);assert.strictEqual(p.v.view.length,0);p.root.querySelector(".ppq-practice-preferences").click();assert(p.root.querySelector(".ppq-modal.show"));key(p,"Escape");assert(!p.root.querySelector(".ppq-modal.show"));
  p.v.reset();assert.strictEqual(p.v.cur.id,"only");assert.strictEqual(p.v.view.length,1);assert.strictEqual(p.v.store.attempts.length,0);assert(!p.root.querySelector(".ppq-practice-empty"));
 });
 check("finding the same unanswered practice question does not make Next silently repeat it",()=>{
  const p=mount([{id:"first"},{id:"second"}],{...mcq,practiceSelection:{enabled:true},finderPreserveFilters:true,questionScrollContainer:".ppq-card"});
  assert.strictEqual(p.v.cur.id,"first");p.v._jumpToQuestion("first");p.v.next();assert.strictEqual(p.v.cur.id,"second");
 });
 check("all six canonical meanings stay intact with only the requested timing phrase",()=>{
  const p=mount([{id:"scale"}],{});
  assert.deepStrictEqual(Array.from(p.v.cfg.selfReport.meanings),["No idea","Don't fully understand","Got it wrong, but now I've seen the answer I get it","Got it right, but it's not stable — I might miss it tomorrow/next week","Got it — strong and comfortable","Trivial — never need to see this again"]);
  assert.strictEqual(p.root.querySelectorAll(".ppq-competence .ppq-scale-btn").length,6);
 });
 check("side scale keeps exact meanings, uses the mobile disclosure and releases its breakpoint listener",()=>{
  let changed,removed=0;
  const p=mount([{id:"side"}],{...mcq,sideRating:{enabled:true},targetPartHeadingOf:()=>"Question 7(a)(i)"},w=>{
   w.matchMedia=query=>{assert.strictEqual(query,"(max-width: 820px)");return {matches:true,addEventListener:(type,fn)=>{assert.strictEqual(type,"change");changed=fn;},removeEventListener:(type,fn)=>{assert.strictEqual(fn,changed);removed++;}};};
  });
  const side=p.root.querySelector(".ppq-side-rating"),help=side.querySelector("details.ppq-side-scale-help");
  assert.strictEqual(help.open,false);assert.strictEqual(help.querySelector("summary").textContent,"Scale");
  assert.strictEqual(p.root.querySelectorAll(".ppq-competence").length,1);assert(!p.root.querySelector(".ppq-card .ppq-competence"));
  assert.strictEqual(side.querySelector(".ppq-side-rating-current").tagName,"STRONG");
  assert.strictEqual(help.querySelectorAll(".ppq-scale-legend-item").length,6);
  Array.from(help.querySelectorAll(".ppq-scale-legend-item")).forEach((item,i)=>assert.strictEqual(item.textContent,(i+1)+" "+p.v.cfg.selfReport.meanings[i]));
  changed({matches:false});assert.strictEqual(help.open,true);changed({matches:true});assert.strictEqual(help.open,false);
  key(p,"B");assert.strictEqual(side.hidden,false);assert.strictEqual(side.querySelector("strong").textContent,"Question 7(a)(i)");
  const event=key(p,"Enter",help.querySelector("summary"));assert.strictEqual(event.defaultPrevented,false);assert.strictEqual(p.v.cur.id,"side");
  p.v.destroy();assert.strictEqual(removed,1);opened.splice(opened.indexOf(p),1);p.dom.window.close();
 });
 check("handled Enter suppresses native double activation and held-key repeats",()=>{
  const p=mount([{id:"a_i"},{id:"a_ii"},{id:"b_i"}],mcq);key(p,"B");key(p,"4");
  const next=p.root.querySelector(".ppq-next"),event=key(p,"Enter",next);
  if(!event.defaultPrevented)next.click();
  assert(event.defaultPrevented);assert.strictEqual(p.v.cur.id,"a_ii");
  key(p,"B");key(p,"Enter",next,{repeat:true});assert.strictEqual(p.v.cur.id,"a_ii");
 });
 console.log(checks+" physics engine behaviour checks passed");
}finally{for(const p of opened){p.v.destroy();p.dom.window.close();}}
