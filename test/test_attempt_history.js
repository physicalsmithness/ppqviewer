/* Independent Physics journeys for per-attempt history and practice preferences.
   Run: node test/test_attempt_history.js. DOM behavior; layout is browser-reviewed. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path");
const {JSDOM} = require("jsdom");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const engine = read("engine/ppqviewer.js"), config = read("example/physics-config.js");
const clone = value => JSON.parse(JSON.stringify(value));
const open = [];
let checks = 0;
function check(name, run) { run(); checks++; console.log("ok " + name); }
const meta = {course:"ib",title:"IB Physics",release:true,default_topic:"A.5",topics:{"A.5":"Relativity"}};
function question(id, extra = {}) {
  return {id,parent_id:id,source_part_id:id,year:"2025",paper:"2",level:"HL",question_number:"1",label:"(a)",
    marks:4,topic_codes:["A.5"],question_images:["assets/"+id+".png"],context_images:[],markscheme_images:["assets/ms.png"],...extra};
}
const q1 = question("q1"), q2 = question("q2"), mcq = question("mcq", {paper:"1A",marks:1,label:"",correct_option:"B",answer_status:"reviewed_source_key"});
function mount(questions = [q1,q2,mcq], stored = null, extra = {practiceSelection:{enabled:false}}, course = "ib") {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {url:"https://example.test/physics/",runScripts:"outside-only",pretendToBeVisual:true});
  const w = dom.window;
  w.confirm = () => true;
  w.PHYSICS_META = {...clone(meta),course}; w.PHYSICS_QUESTIONS = clone(questions);
  w.eval(engine); w.eval(config);
  // These journeys assert specific Next/resume paths. Default random serving is
  // checked separately; deterministic order keeps the history assertions stable.
  Object.assign(w.PPQ_CONFIG, {defaultOrder:"ordered"}, extra);
  if (stored) w.localStorage.setItem(w.PPQ_CONFIG.storageKey, JSON.stringify(stored));
  const root = w.document.getElementById("root");
  const v = w.PPQViewer.mount(root, {config:w.PPQ_CONFIG,questions:w.PHYSICS_QUESTIONS,meta:w.PHYSICS_META});
  const p = {dom,w,root,v}; open.push(p); return p;
}
function columns(p) { return Array.from(p.root.querySelectorAll(".ppq-attempt-history-list > .ppq-attempt-history-column")); }
function cellText(p, selector) { return columns(p).map(column => column.querySelector(selector).textContent.replace(/\s+/g," ").trim()); }
function strength(node) { return Number(node.style.getPropertyValue("--ppq-history-strength")); }
function rate(p, value) { p.root.querySelector('.ppq-competence .ppq-scale-btn[data-val="'+value+'"]').click(); }
function prefs(p, change) {
  p.root.querySelector(".ppq-timing-btn").click();
  change(p.root.querySelector(".ppq-timing-panel"));
  p.root.querySelector(".ppq-timing-save").click();
}
function historyVisible(p, visible) {
  prefs(p, panel => {
    const checkbox = panel.querySelector(".ppq-attempt-history-toggle");
    assert(checkbox, "History visibility is available in Preferences");
    checkbox.checked = visible;
    checkbox.dispatchEvent(new p.w.Event("change", {bubbles:true}));
  });
}
function practiceMode(p, mode) {
  prefs(p, panel => {
    const select=panel.querySelector(".ppq-practice-selection");
    assert(select, "Practice selection is available in Preferences");
    select.value=mode;
    select.dispatchEvent(new p.w.Event("change", {bubbles:true}));
  });
}
function answerMcq(p) { p.root.querySelector('.ppq-option[data-label="B"]').click(); }
function key(p, key) {
  p.root.dispatchEvent(new p.w.Event("pointerdown",{bubbles:true}));
  p.root.dispatchEvent(new p.w.KeyboardEvent("keydown",{key,bubbles:true,cancelable:true}));
}
function state(p) {
  return {id:p.v.cur && p.v.cur.id,attemptId:p.v._attemptId,shownAt:p.v.shownAt,timer:p.v._timerInterval,
    answered:p.v.answered,marksPending:p.v._marksPending,marksOutcome:clone(p.v._marksOutcome),attempts:JSON.stringify(p.v.store.attempts)};
}
try {
  check("IB history defaults on and empty history cannot invent attempts", () => {
    const p = mount();
    assert.strictEqual(p.v.cfg.attemptHistory.enabled,true);
    assert.strictEqual(p.v.cfg.attemptHistory.defaultVisible,true);
    assert(p.root.querySelector(".ppq-question-top .ppq-meta"));
    assert(p.root.querySelector(".ppq-question-top .ppq-attempt-history"));
    assert.strictEqual(columns(p).length,0);
    assert.strictEqual(p.v.store.attempts.length,0);
  });
  check("each previous attempt keeps its own marks and C, including ranges and unrated legacy rows", () => {
    const attempts = [
      {id:q1.id,attempt_id:"old1",correct:false,self_report:1},
      {id:q1.id,attempt_id:"old2",correct:true,self_report:6},
      {id:q1.id,attempt_id:"imported-skip",correct:false,status:"skipped"},
      {id:q1.id,attempt_id:"flagged-skip",correct:false,skipped:true},
      {id:q2.id,attempt_id:"other",correct:true,self_report:2},
      {id:q1.id,attempt_id:"old3",correct:false,marks_awarded:2,marks_max:4,self_report:4},
      {id:q1.id,attempt_id:"old4",correct:false,marks_range:[1,3],marks_max:4,self_report:null},
      {id:q1.id,attempt_id:"old5",correct:true,marks_awarded:0,marks_max:4,self_report:0},
      {id:q1.id,correct:true}
    ];
    const p = mount([q1,q2],{attempts,scores:{[q1.id]:6},flags:{[q1.id]:true}});
    p.v.render(q1);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-outcome"),["0/1","1/1","2/4","1–3/4","0/4","1/1"]);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-confidence"),["C 1","C 6","C 4","C —","C —","C —"]);
    assert.deepStrictEqual(columns(p).map(column=>strength(column.querySelector(".ppq-attempt-outcome"))),[0,1,.5,.5,0,1]);
    const c = columns(p).map(column=>strength(column.querySelector(".ppq-attempt-confidence")));
    assert(c[0] < c[2] && c[2] < c[1], "Higher recorded C has stronger colour");
    assert.strictEqual(JSON.stringify(p.v.store.attempts),JSON.stringify(attempts), "Rendering history cannot rewrite legacy attempts");
  });
  check("completed attempts and their own ratings appear immediately and persist on the next visit", () => {
    const p = mount([mcq,q2]);
    p.v.render(mcq);
    rate(p,3);
    assert.strictEqual(p.v.store.attempts.length,0, "A rating before answering cannot invent an attempt");
    p.root.querySelector('.ppq-option[data-label="A"]').click();
    rate(p,2);
    assert.strictEqual(p.v.store.attempts.length,1);
    assert.strictEqual(p.v.store.attempts[0].self_report,2);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-outcome"),["0/1"], "The completed current attempt appears immediately");
    assert.deepStrictEqual(cellText(p,".ppq-attempt-confidence"),["C 2"]);
    historyVisible(p,false); historyVisible(p,true);
    assert.strictEqual(columns(p).length,1, "Toggling history preserves the completed attempt without duplicating it");
    p.v.render(q2); p.v.render(mcq);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-confidence"),["C 2"]);
    rate(p,5);
    assert.strictEqual(p.v.store.attempts[0].self_report,2, "A fresh unanswered visit must not re-rate the old attempt");
    p.root.querySelector('.ppq-option[data-label="B"]').click(); rate(p,6);
    assert.strictEqual(p.v.store.attempts.length,2);
    assert.deepStrictEqual(Array.from(p.v.store.attempts,a=>a.self_report),[2,6]);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-confidence"),["C 2","C 6"]);
    p.v.render(q2); p.v.render(mcq);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-outcome"),["0/1","1/1"]);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-confidence"),["C 2","C 6"]);
  });
  check("manual marks, uncertain ranges and skips persist faithful histories", () => {
    const p = mount([q1,q2]);
    p.v.render(q1); p.v.reveal();
    p.root.querySelector('.ppq-mark-btn[data-mark="2"]').click(); rate(p,4);
    p.v.render(q2); p.v.render(q1);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-outcome"),["2/4"]);
    p.v.reveal(); p.root.querySelector(".ppq-marks-unsure").click();
    p.root.querySelector('.ppq-mark-btn[data-mark="1"]').click();
    p.root.querySelector('.ppq-mark-btn[data-mark="3"]').click();
    p.v.render(q2); p.v.render(q1);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-outcome"),["2/4","1–3/4"]);
    assert.deepStrictEqual(cellText(p,".ppq-attempt-confidence"),["C 4","C —"]);
    const count=p.v.store.attempts.length;
    p.v.skip();
    assert.strictEqual(p.v.store.attempts.length,count, "Skip cannot add a historical attempt");
  });
  check("popup review ratings update only the exact historical attempt, including legacy rows without IDs", () => {
    const extra={practiceSelection:{enabled:false},modules:{structuredPaper:true,postQuestionReview:true},analysisOf:()=>null};
    for (const oldRating of [2,undefined]) {
      const legacy={id:mcq.id,correct:false,chosen_option:"A"};
      if (oldRating !== undefined) legacy.self_report=oldRating;
      const p=mount([mcq,q2],{attempts:[legacy,{id:mcq.id,attempt_id:"newer",correct:true,self_report:6},{id:q2.id,attempt_id:"other",correct:true,self_report:1}],scores:{[mcq.id]:6}},extra);
      p.v.render(mcq);
      const reviewed=p.v.store.attempts[0];
      p.v._reopenAttempt(reviewed);
      const selected=p.root.querySelector(".ppq-iq-scale-btn.sel");
      if (oldRating === undefined) assert(!selected,"An unrated legacy attempt cannot inherit the latest score");
      else assert(selected && selected.dataset.val===String(oldRating));
      p.root.querySelector('.ppq-iq-scale-btn[data-val="4"]').click();
      assert.strictEqual(reviewed.self_report,4);
      assert.strictEqual(p.v.store.attempts.length,3);
      assert.strictEqual(p.v.store.attempts[1].self_report,6);
      assert.strictEqual(p.v.store.attempts[2].self_report,1);
      p.v.closeModal();
    }
  });
  check("visibility preference persists without resetting the answer, marks or running timer", () => {
    const p = mount([q1,q2],{attempts:[],scores:{},prefs:{timing:{visibility:"show",direction:"up",clock:true,ring:false}}});
    p.v.render(q1);
    assert(p.v._timerInterval, "Running timer exercises the preference-only save path");
    const before=state(p);
    historyVisible(p,false);
    assert.deepStrictEqual(state(p),before);
    assert.strictEqual(p.v.store.prefs.attemptHistory.visible,false);
    p.v.reveal();
    const pending=state(p);
    historyVisible(p,true);
    assert.deepStrictEqual(state(p),pending);
    p.root.querySelector('.ppq-mark-btn[data-mark="3"]').click(); rate(p,5);
    const answered=state(p);
    historyVisible(p,false);
    assert.deepStrictEqual(state(p),answered);
    const saved=JSON.parse(p.w.localStorage.getItem(p.v.cfg.storageKey));
    const reloaded=mount([q1,q2],saved);
    assert.strictEqual(reloaded.v.store.prefs.attemptHistory.visible,false);
    const strip=reloaded.root.querySelector(".ppq-attempt-history");
    assert(strip.hidden || strip.style.display==="none");
    assert.deepStrictEqual(clone(reloaded.v.store.attempts),saved.attempts);
  });
  check("consumers without the opt-in retain their original question header and preferences", () => {
    const p=mount([q1],null,{},"trilogy");
    assert(!p.root.querySelector(".ppq-attempt-history"));
    assert(!p.root.querySelector(".ppq-question-top"));
    p.root.querySelector(".ppq-timing-btn").click();
    assert(!p.root.querySelector(".ppq-attempt-history-toggle"));
    assert(!p.v.store.prefs.attemptHistory);
  });
  const abc=["a","b","c"].map(id=>question(id,{paper:"1A",marks:1,label:"",correct_option:"B",answer_status:"reviewed_source_key"}));
  check("IB includes questions already done by default and keeps full-topic totals", () => {
    const attempts=[{id:"a",attempt_id:"seen-a",correct:true},{id:"b",attempt_id:"seen-b",correct:false}];
    const p=mount(abc,{attempts,scores:{b:2}},{});
    assert.strictEqual(p.v.cfg.practiceSelection.enabled,true);
    assert.strictEqual(p.v.cfg.practiceSelection.defaultMode,"mix");
    assert.deepStrictEqual(Array.from(p.v.view,q=>q.id),["a","b","c"]);
    assert.strictEqual(p.v._practiceBaseView.length,3);
    assert.match(p.root.querySelector(".ppq-counter").textContent,/^3 in complete mix\s*\/\s*3 parts\b/);
    const total=p.root.querySelector(".ppq-cat-count");
    assert(total && Number(total.textContent.replace(/[()]/g,""))===3);
    prefs(p,panel=>{
      assert.strictEqual(panel.querySelector(".ppq-practice-selection").value,"mix");
      assert(panel.querySelector(".ppq-include-attempted-toggle").checked);
      assert.match(panel.querySelector(".ppq-include-attempted-option").textContent,/Include questions already done/);
    });
  });
  check("include-done and practice modes stay synchronized and save without resetting the live question", () => {
    const p=mount(abc,{attempts:[{id:"a",correct:true},{id:"b",correct:false}],scores:{},prefs:{timing:{visibility:"show",direction:"up",clock:true,ring:false}}},{});
    const before=state(p);
    prefs(p,panel=>{
      const checkbox=panel.querySelector(".ppq-include-attempted-toggle"), select=panel.querySelector(".ppq-practice-selection");
      checkbox.checked=false; checkbox.dispatchEvent(new p.w.Event("change",{bubbles:true}));
      assert.strictEqual(select.value,"unattempted");
      assert(!p.v.store.prefs.practiceSelection,"Unsaved controls cannot change stored preferences");
    });
    assert.deepStrictEqual(state(p),before);
    assert.strictEqual(p.v.store.prefs.practiceSelection.mode,"unattempted");
    p.v.next(); assert.deepStrictEqual(Array.from(p.v.view,q=>q.id),["c"]);
    const second=state(p);
    prefs(p,panel=>{
      const checkbox=panel.querySelector(".ppq-include-attempted-toggle"), select=panel.querySelector(".ppq-practice-selection");
      assert(!checkbox.checked && select.value==="unattempted");
      checkbox.checked=true; checkbox.dispatchEvent(new p.w.Event("change",{bubbles:true}));
      assert.strictEqual(select.value,"mix");
      select.value="errors"; select.dispatchEvent(new p.w.Event("change",{bubbles:true}));
      assert(checkbox.checked,"Previous errors deliberately includes completed attempts");
      assert.strictEqual(p.v.store.prefs.practiceSelection.mode,"unattempted");
    });
    assert.deepStrictEqual(state(p),second);
    assert.strictEqual(p.v.store.prefs.practiceSelection.mode,"errors");
    const saved=JSON.parse(p.w.localStorage.getItem(p.v.cfg.storageKey));
    const restored=mount(abc,saved,{});
    assert.deepStrictEqual(Array.from(restored.v.view,q=>q.id),["b"]);
    prefs(restored,panel=>{
      assert(panel.querySelector(".ppq-include-attempted-toggle").checked);
      assert.strictEqual(panel.querySelector(".ppq-practice-selection").value,"errors");
    });
    assert.strictEqual(restored.v.store.prefs.practiceSelection.mode,"errors","Opening and saving cannot replace errors with mix");
    prefs(restored,panel=>{
      const checkbox=panel.querySelector(".ppq-include-attempted-toggle");
      checkbox.checked=false; checkbox.dispatchEvent(new restored.w.Event("change",{bubbles:true}));
      checkbox.checked=true; checkbox.dispatchEvent(new restored.w.Event("change",{bubbles:true}));
    });
    assert.strictEqual(restored.v.store.prefs.practiceSelection.mode,"mix");
    restored.v.next(); assert.strictEqual(restored.v.view.length,3);
  });
  check("Next does not skip after pruning, skips remain unattempted and exhaustion stays explicit", () => {
    const p=mount(abc,{attempts:[],scores:{},prefs:{practiceSelection:{mode:"unattempted"}}},{});
    assert.strictEqual(p.v.cur.id,"a"); answerMcq(p); p.v.next();
    assert.strictEqual(p.v.cur.id,"b", "Pruning answered A must not skip B");
    p.v.skip();
    assert.strictEqual(p.v.cur.id,"c");
    assert(!p.v.store.attempts.some(a=>a.id==="b"));
    answerMcq(p); p.v.next();
    assert.strictEqual(p.v.cur.id,"b", "Skipped B stays available after C");
    answerMcq(p); p.v.next();
    assert.strictEqual(p.v.cur,null);
    assert.strictEqual(p.v.view.length,0);
    assert(p.root.querySelector(".ppq-practice-empty"));
    assert.strictEqual(p.root.querySelector(".ppq-card").style.display,"none");
    assert.strictEqual(p.v.store.attempts.length,3);
    const action=p.root.querySelector('.ppq-practice-empty [data-practice-mode="mix"]');
    assert(action); action.click();
    assert.strictEqual(p.v.store.prefs.practiceSelection.mode,"mix");
    assert(p.v.cur && p.v.view.length===3);
  });
  check("previous errors use the latest exact or ranged mark outcome, never C or an older mistake", () => {
    const qs="abcdefghi".split("").map(id=>question(id,{marks:3}));
    const attempts=[
      {id:"a",correct:false},{id:"a",correct:true},
      {id:"b",correct:true},{id:"b",correct:false},
      {id:"c",correct:false,marks_max:3,marks_awarded:2},
      {id:"d",correct:true,marks_max:3,marks_awarded:3},
      {id:"e",correct:false,marks_max:3,marks_range:[2,3]},
      {id:"f",correct:true,marks_max:3,marks_range:[3,3]},
      {id:"h",correct:false,marks_max:2,marks_awarded:2},
      {id:"i",correct:true,marks_max:3,marks_range:[1,3]}
    ];
    const p=mount(qs,{attempts,scores:{g:1},prefs:{practiceSelection:{mode:"errors"}}},{});
    assert.deepStrictEqual(Array.from(p.v.view,q=>q.id),["b","c","e","i"]);
    assert.strictEqual(p.v.cur.id,"b"); p.v.reveal();
    assert.strictEqual(p.v.store.attempts.length,attempts.length,"Reveal without marks is not an attempt");
    p.root.querySelector('.ppq-mark-btn[data-mark="3"]').click(); p.v.next();
    assert.strictEqual(p.v.cur.id,"c");
    assert(!p.v.view.some(q=>q.id==="b"),"Latest full marks clear the old error");
  });
  check("practice mode saves for the next question without changing the current answer or timer", () => {
    const p=mount(abc,{attempts:[],scores:{},prefs:{timing:{visibility:"show",direction:"up",clock:true,ring:false}}},{});
    const before=state(p); practiceMode(p,"mix");
    assert.deepStrictEqual(state(p),before);
    assert.strictEqual(p.v.store.prefs.practiceSelection.mode,"mix");
    answerMcq(p);
    const answered=state(p); practiceMode(p,"errors");
    assert.deepStrictEqual(state(p),answered);
    const saved=JSON.parse(p.w.localStorage.getItem(p.v.cfg.storageKey));
    const reloaded=mount(abc,saved,{});
    assert.strictEqual(reloaded.v.store.prefs.practiceSelection.mode,"errors");
    assert.strictEqual(reloaded.v.cur,null,"No previous errors cannot silently become complete mix");
    assert(reloaded.root.querySelector(".ppq-practice-empty"));
    assert.strictEqual(reloaded.v._practiceBaseView.length,3);
  });
  check("finder and part chips can revisit attempted siblings and return to the unanswered normal question", () => {
    const qs=[
      question("paper-Q1(a)",{parent_id:"paper-Q1",label:"(a)"}),
      question("paper-Q1(b)",{parent_id:"paper-Q1",label:"(b)"}),
      question("paper-Q2(a)",{parent_id:"paper-Q2",question_number:"2",label:"(a)"})
    ];
    const p=mount(qs,{attempts:[{id:qs[0].id,attempt_id:"prior-a",correct:true}],scores:{},prefs:{practiceSelection:{mode:"unattempted"}}},{});
    assert.strictEqual(p.v.cur.id,qs[1].id);
    const filters=Array.from(p.root.querySelectorAll(".ppq-select"),s=>s.value);
    const finder=p.root.querySelector(".ppq-find-input");
    finder.value=qs[0].id; finder.dispatchEvent(new p.w.Event("input",{bubbles:true}));
    const found=Array.from(p.root.querySelectorAll(".ppq-find-result")).find(b=>b.dataset.id===qs[0].id);
    assert(found); found.click();
    assert.strictEqual(p.v.cur.id,qs[0].id);
    assert.strictEqual(p.v.store.prefs.practiceSelection.mode,"unattempted");
    assert.deepStrictEqual(Array.from(p.root.querySelectorAll(".ppq-select"),s=>s.value),filters);
    p.v.next();
    assert.strictEqual(p.v.cur.id,qs[1].id,"Reviewing A must resume unanswered B");
    const chip=Array.from(p.root.querySelectorAll(".ppq-part-chip")).find(b=>b.dataset.id===qs[0].id);
    assert(chip); chip.click();
    assert.strictEqual(p.v.cur.id,qs[0].id);
    p.v.next(); assert.strictEqual(p.v.cur.id,qs[1].id);
    p.v.reveal(); p.root.querySelector('.ppq-mark-btn[data-mark="4"]').click(); p.v.next();
    assert.strictEqual(p.v.cur.id,qs[2].id);
    p.v.prev();
    assert.strictEqual(p.v.cur.id,qs[1].id,"Previous can still show the just-completed part");
    assert.strictEqual(p.v.store.prefs.practiceSelection.mode,"unattempted");
    assert.deepStrictEqual(Array.from(p.root.querySelectorAll(".ppq-select"),s=>s.value),filters);
    p.v.next(); assert.strictEqual(p.v.cur.id,qs[2].id,"Normal run resumes by ID after its view shrinks");
  });
  check("the single C scale opens on the right after marking and resets when Next changes the part", () => {
    const second=question("q2",{question_number:"2"});
    const p=mount([q1,second],null,{practiceSelection:{enabled:false},sideRating:{enabled:true}});
    const side=p.root.querySelector(".ppq-right-column > .ppq-side-rating");
    assert(side && p.v.cfg.sideRating.enabled);
    assert(side.hidden && !p.root.classList.contains("ppq-side-rating-open"));
    assert.strictEqual(p.root.querySelectorAll(".ppq-competence").length,1,"Move the existing controls instead of duplicating the scale");
    assert(side.querySelector(".ppq-competence"));
    assert(p.root.querySelector(".ppq-right-column > .ppq-dash"));
    p.v.reveal();
    assert(side.hidden,"Manual mark entry precedes C");
    p.root.querySelector('.ppq-mark-btn[data-mark="2"]').click();
    assert(!side.hidden && p.root.classList.contains("ppq-side-rating-open"));
    assert.match(side.querySelector(".ppq-side-rating-current").textContent,/1\(a\)/);
    const scale=Array.from(side.querySelectorAll(".ppq-scale-btn"));
    assert.deepStrictEqual(scale.map(b=>b.textContent.trim()),["1","2","3","4","5","6"]);
    key(p,"4");
    assert.strictEqual(p.v.store.attempts[0].self_report,4);
    const next=side.querySelector(".ppq-next"); assert(next && next.style.display!=="none");
    next.click();
    assert.strictEqual(p.v.cur.id,second.id);
    assert(side.hidden && !p.root.classList.contains("ppq-side-rating-open"));
    assert(!side.querySelector(".ppq-scale-btn.sel"),"The next part does not inherit a selected C");
    p.v.reveal(); p.root.querySelector('.ppq-mark-btn[data-mark="4"]').click();
    assert(!side.hidden);
    assert.match(side.querySelector(".ppq-side-rating-current").textContent,/2\(a\)/);
    assert.strictEqual(p.v.store.attempts.length,2);
  });
  check("MCQ verdict opens side C and exhaustion hides it without leaving an active answer", () => {
    const p=mount([mcq],{attempts:[],scores:{},prefs:{practiceSelection:{mode:"unattempted"}}},{sideRating:{enabled:true}});
    const side=p.root.querySelector(".ppq-side-rating");
    assert(side && side.hidden);
    key(p,"2");
    assert(!side.hidden && p.v.store.attempts[0].correct);
    key(p,"6");
    assert.strictEqual(p.v.store.attempts[0].self_report,6);
    side.querySelector(".ppq-next").click();
    assert.strictEqual(p.v.cur,null);
    assert(side.hidden && !p.root.classList.contains("ppq-side-rating-open"));
    assert(p.root.querySelector(".ppq-practice-empty"));
  });
  console.log(checks+" attempt history and practice preference journeys passed");
} finally { for(const p of open) {p.v.destroy();p.dom.window.close();} }
