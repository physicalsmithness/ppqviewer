/* Independent three-order practice journeys. No source eligibility changes.
   Run: node test/test_physics_shuffle.js. Uses the latest local release if present. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const {JSDOM} = require("jsdom");
const ROOT = path.resolve(__dirname, "..");
const engine = fs.readFileSync(path.join(ROOT, "engine/ppqviewer.js"), "utf8");
const consumer = fs.readFileSync(path.join(ROOT, "example/physics-config.js"), "utf8");
const opened = [];
let checks = 0;
function check(name, run) { run(); checks++; console.log("ok " + name); }
function question(parent, label, extra = {}) {
  const slug = label.replace(/\)\s*\(/g, "_").replace(/[()]/g, "") || "whole";
  return {id:parent+"("+slug+")",parent_id:parent,source_part_id:parent+"-"+slug,
    topic_codes:["A.5"],year:"2025",paper:"2",level:"HL",question_number:parent.split("Q").pop(),
    label,marks:1,question_images:[],context_images:[],markscheme_images:[],...extra};
}
function seededRandom(w, seed = 27641) {
  w.Math.random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
}
function mount(questions, overrides = {}, course = "ib", physics = true, stored = null, metadata = null) {
  const dom = new JSDOM('<div id="root"></div>', {url:"https://shuffle.test/",runScripts:"outside-only",pretendToBeVisual:true});
  const w = dom.window; seededRandom(w); w.confirm = () => true;
  w.PHYSICS_META = metadata || {course,title:"Physics",topics:{"A.5":"Relativity","A.1":"Kinematics"},default_topic:"A.5"};
  w.PHYSICS_QUESTIONS = questions; w.eval(engine);
  if (physics) w.eval(consumer);
  const config = {...(physics ? w.PPQ_CONFIG : {storageKey:"legacy-shuffle",defaultOrder:"shuffle",questionTextOf:()=>"",questionType:()=>"flashcard"}),prefetchAhead:0,...overrides};
  if (stored) w.localStorage.setItem(config.storageKey,JSON.stringify(stored));
  const root = w.document.getElementById("root"), v = w.PPQViewer.mount(root,{config,questions});
  const p = {dom,w,root,v}; opened.push(p); return p;
}
function ids(rows) { return rows.map(q=>q.id).join("|"); }
function base(p) { return p.v._practiceBaseView || p.v.view; }
function chooseOrder(p, value) {
  const select = p.root.querySelector(".ppq-order"); select.value = value;
  select.dispatchEvent(new p.w.Event("change",{bubbles:true}));
}
function assertParentRuns(rows) {
  const closed = new Set(); let previous;
  for (const q of rows) {
    const parent = q.parent_id || q.id;
    if (parent !== previous) {
      assert(!closed.has(parent), "Parent must not reappear after another question: " + parent);
      if (previous != null) closed.add(previous);
      previous = parent;
    }
  }
}
function assertLevelScope(rows, pool, level) {
  // d029: every unpaired part survives; each cross-level group contributes exactly
  // one native printing. Assert the rule against catalogue groups, not a snapshot count.
  const actual = new Set(rows.map(q=>q.id)), eligible = new Set(pool.map(q=>q.id)), groups = new Map();
  assert.strictEqual(actual.size,rows.length,"A printing must not appear twice");
  for (const q of rows) assert(eligible.has(q.id),"A topic must not restore a part outside its leading scope: "+q.id);
  for (const q of pool) {
    if (!q.source_group_id) { assert(actual.has(q.id),"Ungrouped part must remain reachable: "+q.id); continue; }
    if (!groups.has(q.source_group_id)) groups.set(q.source_group_id,[]);
    groups.get(q.source_group_id).push(q);
  }
  for (const [key,members] of groups) {
    const selected=members.filter(q=>actual.has(q.id));
    if (new Set(members.map(q=>q.level)).size>1) {
      assert.strictEqual(selected.length,1,"A cross-level group contributes one printing: "+key);
      if (members.some(q=>q.level===level)) assert.strictEqual(selected[0].level,level,"The learner gets their native printing: "+key);
    } else assert.strictEqual(selected.length,members.length,"Same-level siblings must all survive: "+key);
  }
}
function nativeEnter(p, target) {
  // jsdom does not implement native keyboard activation. Model its default
  // button click only when the engine has not consumed the Enter keydown.
  const event = new p.w.KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true});
  target.dispatchEvent(event);
  if (!event.defaultPrevented && target.tagName==="BUTTON") target.click();
  return event;
}
const fixture = [question("P.Q3","(b)"),question("P.Q1","(b)"),question("P.Q2",""),
  question("P.Q1","(a)(ii)"),question("P.Q3","(a)"),question("P.Q1","(a)(i)")];
try {
  check("IB offers three order choices and defaults to shuffling whole questions", () => {
    const p = mount(fixture);
    const select = p.root.querySelector(".ppq-order");
    assert.strictEqual(select.value,"shuffle");
    assert.deepStrictEqual(Object.fromEntries(Array.from(select.options,o=>[o.value,o.textContent])),{
      shuffle:"Shuffle questions; keep parts in order","shuffle-parts":"Shuffle all parts",order:"In order"
    });
    assert.strictEqual(p.v.cfg.shuffleGroupKeyOf(fixture[2]),"P.Q2");
    assert.strictEqual(p.v.cfg.shuffleGroupKeyOf({id:"standalone"}),"standalone");
    const trilogy = mount(fixture,{},"trilogy");
    assert.strictEqual(trilogy.root.querySelector(".ppq-order").value,"order");
  });
  check("previously attempted parts are included by default", () => {
    const attempted = fixture[0].id;
    const p = mount(fixture,{},"ib",true,{attempts:[{id:attempted,correct:true,marks_awarded:1,marks_max:1}],scores:{}});
    assert.strictEqual(p.v._practiceMode(),"mix");
    assert.strictEqual(p.v._practiceCandidates().length,fixture.length);
    assert(p.v._practiceCandidates().some(q=>q.id===attempted));
    const before = ids(base(p));
    p.v._commitMarks(p.v.cur,{max:1,awarded:1,sure:true}); p.v.next();
    assert.strictEqual(p.v._practiceCandidates().length,fixture.length);
    assert.strictEqual(ids(base(p)),before);
  });
  check("Shuffle moves whole questions and keeps their printed parts consecutive", () => {
    const p = mount(fixture,{practiceSelection:{enabled:true,defaultMode:"mix"}}), rows = base(p);
    assertParentRuns(rows);
    assert.deepStrictEqual(Array.from(rows.filter(q=>q.parent_id==="P.Q1"),q=>q.label),["(a)(i)","(a)(ii)","(b)"]);
    assert.deepStrictEqual(Array.from(rows.filter(q=>q.parent_id==="P.Q3"),q=>q.label),["(a)","(b)"]);
    assert.strictEqual(new Set(rows.map(q=>q.id)).size,fixture.length);
    assert.notStrictEqual(rows.map(q=>q.parent_id).join("|"),"P.Q1|P.Q1|P.Q1|P.Q2|P.Q3|P.Q3","Seeded Shuffle must actually move the parent order");
    const sequence = [];
    for (let i=0;i<rows.length;i++) { sequence.push(p.v.cur.id); p.v.next(); }
    assert.strictEqual(sequence.join("|"),ids(rows));
    assert.strictEqual(p.v.cur.id,rows[0].id,"Complete mix wraps to the stable start after a full traversal");
  });
  check("printed labels sort semantically, including nested Roman numerals", () => {
    const labels = ["(b)","(a)(ix)","(a)(iv)","(a)(x)","(a)(v)","(a)(iii)","(a)(ii)","(a)(i)","(a)"];
    const p = mount(labels.map(label=>question("P.Q1",label)),{defaultOrder:"ordered"});
    assert.deepStrictEqual(Array.from(base(p),q=>q.label),["(a)","(a)(i)","(a)(ii)","(a)(iii)","(a)(iv)","(a)(v)","(a)(ix)","(a)(x)","(b)"]);
  });
  check("Shuffle all parts scrambles siblings once, traverses stably and can return to In order", () => {
    const p = mount(fixture);
    chooseOrder(p,"shuffle-parts");
    assert.strictEqual(p.root.querySelector(".ppq-order").value,"shuffle-parts");
    assert.strictEqual(p.root.querySelector(".ppq-start").style.display,"none");
    const rows = base(p), original = ids(rows), visited=[];
    assert.throws(()=>assertParentRuns(rows),/Parent must not reappear/,"The fixed-seed all-parts mode must split at least one parent into separate runs");
    assert.notDeepStrictEqual(Array.from(rows.filter(q=>q.parent_id==="P.Q1"),q=>q.label),["(a)(i)","(a)(ii)","(b)"],"All-parts mode must be allowed to scramble printed part order");
    for(let i=0;i<rows.length;i++) { visited.push(p.v.cur.id); p.v.next(); assert.strictEqual(ids(base(p)),original); }
    assert.strictEqual(visited.join("|"),original);
    assert.strictEqual(p.v.cur.id,rows[0].id);
    chooseOrder(p,"order");
    assert.strictEqual(p.root.querySelector(".ppq-start").style.display,"inline-block");
    assert.deepStrictEqual(Array.from(base(p),q=>q.id),["P.Q1(a_i)","P.Q1(a_ii)","P.Q1(b)","P.Q2(whole)","P.Q3(a)","P.Q3(b)"]);
  });
  check("explicit unattempted selection prunes either shuffle mode without skipping or reshuffling", () => {
    for (const defaultOrder of ["shuffle","shuffle-parts"]) {
      const p = mount(fixture,{defaultOrder,practiceSelection:{enabled:true,defaultMode:"unattempted"}});
      assert.strictEqual(p.root.querySelector(".ppq-order").value,defaultOrder);
      const original = ids(base(p)), expected = base(p).map(q=>q.id), visited = [];
      while (p.v.cur) {
        visited.push(p.v.cur.id);
        p.v._commitMarks(p.v.cur,{max:1,awarded:1,sure:true});
        p.v.next();
        assert.strictEqual(ids(base(p)),original);
        assert(visited.length<=fixture.length,"Practice must terminate after each part has been attempted");
      }
      assert.strictEqual(visited.join("|"),expected.join("|"));
      assert.strictEqual(p.v.store.attempts.length,fixture.length);
    }
  });
  check("filtering never restores an excluded sibling, and reviewing preserves shuffled scope", () => {
    const rows = fixture.concat(question("P.Q1","(c)",{topic_codes:["A.1"]}));
    const p = mount(rows), order = ids(base(p)), initial = p.v.cur.id;
    assert(!base(p).some(q=>q.label==="(c)"));
    p.v.goToId(rows.at(-1).id); p.v.goToId(fixture.find(q=>q.id!==initial).id); p.v.next();
    assert.strictEqual(p.v.cur.id,initial);
    assert.strictEqual(ids(base(p)),order);
    assert(!p.v._practiceCandidates().some(q=>q.label==="(c)"));
  });
  check("Enter after a C rating advances exactly one printed part in both navigation modes", () => {
    const rows = ["(a)(i)","(a)(ii)","(b)(i)"].map(label=>question("25M.P2.HL.TZ1.Q7",label));
    for (const enabled of [false,true]) {
      const p = mount(rows,{defaultOrder:"ordered",practiceSelection:{enabled,defaultMode:"unattempted"}});
      p.v.reveal(); p.v._commitMarks(p.v.cur,{max:1,awarded:1,sure:true});
      p.root.querySelector('.ppq-competence .ppq-scale-btn[data-val="4"]').click();
      const next = p.root.querySelector(".ppq-next");
      assert.strictEqual(p.w.document.activeElement,next,"A C rating places keyboard focus on Next");
      const event = nativeEnter(p,next);
      assert.strictEqual(p.v.cur.label,"(a)(ii)","Enter must not skip directly from (a)(i) to (b)(i)");
      assert(event.defaultPrevented,"A globally handled Enter must cancel the button's second activation");
      p.v.reveal(); p.v._commitMarks(p.v.cur,{max:1,awarded:1,sure:true}); next.click();
      assert.strictEqual(p.v.cur.label,"(b)(i)","A normal Next click also advances only once");
      assert.strictEqual(p.v.store.attempts.length,2);
    }
  });
  check("Enter on a pending mark button still records that native mark selection", () => {
    const p = mount([question("P.Q1","(a)")],{defaultOrder:"ordered"});
    p.v.reveal();
    const mark = p.root.querySelector('.ppq-mark-btn[data-mark="1"]'); mark.focus();
    const event = nativeEnter(p,mark);
    assert(!event.defaultPrevented,"An unhandled mark-button Enter must retain its native activation");
    assert.strictEqual(p.v.store.attempts.length,1);
    assert.strictEqual(p.v.store.attempts[0].marks_awarded,1);
    assert.strictEqual(p.v.cur.label,"(a)");
  });
  check("Enter on C, Preferences and context controls does not hijack their native action", () => {
    const p = mount([question("P.Q1","(a)"),question("P.Q2","")],{defaultOrder:"ordered"});
    p.v.reveal(); p.v._commitMarks(p.v.cur,{max:1,awarded:1,sure:true});
    const id = p.v.cur.id, scale = p.root.querySelector('.ppq-competence .ppq-scale-btn[data-val="5"]');
    scale.focus(); assert(!nativeEnter(p,scale).defaultPrevented);
    assert.strictEqual(p.v.cur.id,id);
    assert.strictEqual(p.v.store.scores[id],5);
    const preferences = p.root.querySelector(".ppq-timing-btn"); preferences.focus();
    assert(!nativeEnter(p,preferences).defaultPrevented);
    assert.strictEqual(p.v.cur.id,id); assert(p.root.querySelector(".ppq-modal.show"));
    p.v.closeModal();
    const details = p.w.document.createElement("details"), summary = p.w.document.createElement("summary");
    summary.textContent="Question context"; details.appendChild(summary); p.root.appendChild(details);
    summary.focus(); assert(!nativeEnter(p,summary).defaultPrevented);
    assert.strictEqual(p.v.cur.id,id);
  });
  check("unknown grouping keys remain individual questions and legacy consumers retain flat Shuffle", () => {
    const rows = Array.from({length:8},(_,i)=>({id:"q"+(i+1),parent_id:i<4?"first":"second"}));
    const singleton = mount(rows,{shuffleGroupKeyOf:()=>null},"ib",false);
    assert.notStrictEqual(ids(singleton.v.view),ids(rows),"A null key must not collapse the pool to one unshuffled group");
    assert.strictEqual(singleton.v.view.length,rows.length);
    const legacy = mount(rows,{},"ib",false);
    assert.notStrictEqual(typeof legacy.v.cfg.shuffleGroupKeyOf,"function");
    assert.deepStrictEqual(Array.from(legacy.root.querySelector(".ppq-order").options,o=>o.value).sort(),["order","shuffle"]);
    assert.throws(()=>assertParentRuns(legacy.v.view),/Parent must not reappear/,"Flat Shuffle remains the legacy behavior without the hook");
  });
  const latestPath = path.join(ROOT,"dist/ibphysics-release/latest.json");
  if (fs.existsSync(latestPath)) check("real released topics traverse their leading parts and each learner's whole-question runs", () => {
    const latest = JSON.parse(fs.readFileSync(latestPath,"utf8")), sandbox = {window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(latest.root,"data/physics_catalogue.js"),"utf8"),sandbox);
    const released = JSON.parse(JSON.stringify(sandbox.window.PHYSICS_QUESTIONS));
    const metadata=JSON.parse(JSON.stringify(sandbox.window.PHYSICS_META));
    const p = mount(released,{practiceSelection:{enabled:true,defaultMode:"mix"}},"ib",true,null,metadata);
    const topicIndex=p.v.cfg.filters.findIndex(f=>f.field==="topic_codes");
    const topicSelect=p.root.querySelector('.ppq-select[data-fidx="'+topicIndex+'"]');
    function chooseTopic(topic){topicSelect.value=topic;topicSelect.dispatchEvent(new p.w.Event("change",{bubbles:true}));}
    chooseTopic("A.5");
    const rows=base(p),a5=released.filter(q=>q.topic_codes[0]==="A.5");
    assertLevelScope(rows,a5,"HL");
    assertParentRuns(rows);
    assert(rows.some(q=>p.v.cfg.questionType(q)==="mcq"),"The released A5 journey includes multiple-choice questions");
    assert(rows.slice(0,4).some(q=>p.v.cfg.questionType(q)!=="mcq"),"This fixed seed must exercise written work at the start too");
    const visited=[];
    for(let i=0;i<rows.length;i++){visited.push(p.v.cur.id);p.v.next();}
    assert.strictEqual(visited.join("|"),ids(rows));
    const currentRoman = Array.from(rows.filter(q=>q.parent_id==="16M.P3.HL.TZ0.Q5"),q=>q.label);
    assert.deepStrictEqual(currentRoman,["(b)(i)","(b)(iii)","(b)(iv)"]);
    for(const topic of [...p.v.cfg.filters[topicIndex].values,"ALL"]){
      // d030 filtering precedes d029 collapse, including when twins have different topics.
      const eligible=topic==="ALL"?released:released.filter(q=>q.topic_codes[0]===topic),reached=new Set();
      assert(eligible.length>0,"Each offered topic must have practice parts");
      for(const level of ["HL","SL"]){
        p.v.store.prefs.learnerLevel=level;chooseTopic(topic);
        const scoped=base(p);
        assertLevelScope(scoped,eligible,level);
        assertParentRuns(scoped);
        const stable=ids(scoped),journey=[];
        for(let i=0;i<scoped.length;i++){journey.push(p.v.cur.id);reached.add(p.v.cur.id);p.v.next();assert.strictEqual(ids(base(p)),stable);}
        assert.strictEqual(journey.join("|"),stable);
      }
      assert.deepStrictEqual([...reached].sort(),eligible.map(q=>q.id).sort(),"Both levels together retain every eligible printing in "+topic);
    }
    for(const q of released) assert(p.v.byId[q.id],"Every released printing stays addressable by a shared link");
  });
  console.log(checks + " question-order and navigation journeys passed");
} finally {
  opened.forEach(({dom,v})=>{v.destroy();dom.window.close();});
}
