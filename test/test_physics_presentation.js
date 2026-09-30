/* Physics presentation journeys through the real wrapper and shared engine.
   Run: node test/test_physics_presentation.js
   DOM/interaction checks only; viewport fit and scroll geometry need a browser. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const page = read("example/physics.html"), config = read("example/physics-config.js"), engine = read("engine/ppqviewer.js");
const canonicalMeanings = ["No idea","Only half understand","Mostly understand","Fully understand, but I might miss it tomorrow","Fully understand, comfortable with this","Trivial — never need to see this again"];
const opened = [];
let checks = 0;
function check(label, fn) { fn(); checks++; console.log("ok " + label); }
const metadata = {
  course:"ib",title:"IB Physics past papers",release:true,default_topic:"A.5",
  topics:{"A.5":"Galilean and special relativity"},
  preview_notice:"Teacher preview: assessment questions are excluded and2026 papers reserved for mocks.",
  analysis:{topic:"A.5",groups:[{code:"A5.TD",label:"Time dilation",summary:"Identify the two events.",checks:["Name their frame."]}]}
};
function question(id, label, extra = {}) {
  return {id,parent_id:"paper-Q1",source_part_id:id,topic_codes:["A.5"],analysis_groups:["A5.TD"],analysis_atoms:[],
    year:"2025",paper:"2",level:"HL",question_number:"1",label,marks:2,
    question_images:["assets/"+id.replace(/[^a-z0-9]/gi,"_")+".png"],context_images:["assets/context.png"],markscheme_images:["assets/ms.png"],
    source_notice:"Assessment clearance is incomplete;2026 papers are reserved for mocks.",...extra};
}
function mount(questions, meta = metadata) {
  const dom = new JSDOM(page, {url:"https://example.test/ibphysicsppqs/?topic=A.5",runScripts:"outside-only",pretendToBeVisual:true});
  const w = dom.window;
  w.confirm = () => true;
  w.PHYSICS_META = JSON.parse(JSON.stringify(meta));
  w.PHYSICS_QUESTIONS = JSON.parse(JSON.stringify(questions));
  w.localStorage.setItem("smithics_fields_identity_v1", JSON.stringify({anonymous_id:"presentation",display_name:"Fixture Pupil",signed_in:true,
    contexts:{physics:{anonymous_id:"presentation",display_name:"Fixture Pupil",cohort:"Test"}}}));
  w.eval(read("example/physics-identity.js")); w.eval(read("example/physics-login.js"));
  w.eval(engine); w.eval(config);
  w.PPQ_CONFIG.defaultOrder = "ordered"; // This journey checks exact sibling transitions; shuffle defaults have a separate test.
  for (const m of page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    if (m[1].includes("window.physicsViewer =")) w.eval(m[1]);
  const result = {dom,w,root:w.document.getElementById("ppq-root"),v:w.physicsViewer};
  assert(result.v, "Physics must mount successfully");
  opened.push(result);
  return result;
}
function pupilText(p) {
  const body = p.w.document.body.cloneNode(true);
  body.querySelectorAll("script,style,[hidden]").forEach(node => node.remove());
  return body.textContent;
}
function assertTargetBeforeContext(p, label) {
  const target=p.root.querySelector(".ppq-target-part"), text=target.cloneNode(true), context=p.root.querySelector('img[src="assets/context.png"]');
  text.querySelectorAll(".ppq-target-marks").forEach(node=>node.remove());
  assert.strictEqual(text.textContent,"Answer question 1"+label);
  assert(target.compareDocumentPosition(context)&p.w.Node.DOCUMENT_POSITION_FOLLOWING,"The exact active part heading precedes its context");
}
function key(p, value) {
  p.root.dispatchEvent(new p.w.Event("pointerdown",{bubbles:true}));
  p.root.dispatchEvent(new p.w.KeyboardEvent("keydown",{key:value,bubbles:true,cancelable:true}));
}
try {
  const a = question("paper-Q1(a)","(a)"), b = question("paper-Q1(b)","(b)");
  const p = mount([a,b]);
  check("pupil pages ignore old assessment and mock notices", () => {
    assert(!/assessment|reserved for mocks|teacher preview/i.test(pupilText(p)));
    const preview = mount([a],{...metadata,release:false});
    assert(!/assessment|reserved for mocks|teacher preview/i.test(pupilText(preview)));
  });
  check("six-point scale has compact heading and the exact requested meanings", () => {
    assert.strictEqual(p.v.cfg.selfReport.levels,6);
    assert.deepStrictEqual(Array.from(p.v.cfg.selfReport.meanings),canonicalMeanings);
    assert.strictEqual(p.root.querySelector(".ppq-competence-prompt").textContent.trim(),"C");
    const buttons = Array.from(p.root.querySelectorAll(".ppq-competence .ppq-scale-btn"));
    assert.deepStrictEqual(buttons.map(button=>button.textContent.trim()),["1","2","3","4","5","6"]);
    buttons.forEach((button,i)=>assert(button.title.includes(canonicalMeanings[i])));
    assert(!/1\s*=\s*lost|6\s*=\s*easy/i.test(pupilText(p)));
  });
  check("timer is off by default while the timer control remains available", () => {
    assert.strictEqual(p.v._timingModeNow(),"off");
    assert.strictEqual(p.root.querySelector(".ppq-timer").style.display,"none");
    assert(p.root.querySelector(".ppq-timing-btn"));
    assert.strictEqual(p.v.store.attempts.length,0);
  });
  check("context is visible once beside a clearly identified current part", () => {
    const context = p.root.querySelector('img[src="assets/context.png"]');
    assert(context);
    assert(!context.closest("details:not([open])"));
    assert.strictEqual(p.root.querySelectorAll('img[src="assets/context.png"]').length,1);
    assert.strictEqual(p.root.querySelectorAll('img[src="'+a.question_images[0]+'"]').length,1);
    assertTargetBeforeContext(p,"(a)");
    assert.strictEqual(p.root.querySelector(".ppq-current-part-label").textContent,"Current part");
    assert.strictEqual(p.root.querySelectorAll(".ppq-part-chip").length,2);
    assert(!p.root.querySelector(".ppq-mode-toggle"));
    assert(!p.root.querySelector(".ppq-wq-part img"));
  });
  check("sibling navigation retains context and resets only the question column", () => {
    const centre = p.root.querySelector(".ppq-centre"), dashboard = p.root.querySelector(".ppq-dash");
    centre.scrollTop=420; dashboard.scrollTop=170;
    p.root.querySelector('.ppq-part-chip[data-id="paper-Q1(b)"]').click();
    assert.strictEqual(p.v.cur.id,b.id);
    assert.strictEqual(p.root.querySelectorAll('img[src="assets/context.png"]').length,1);
    assert(!p.root.querySelector('img[src="'+a.question_images[0]+'"]'));
    assert.strictEqual(p.root.querySelectorAll('img[src="'+b.question_images[0]+'"]').length,1);
    assertTargetBeforeContext(p,"(b)");
    assert.strictEqual(p.root.querySelector(".ppq-current-part-label").textContent,"Current part");
    assert.strictEqual(centre.scrollTop,0);
    assert.strictEqual(dashboard.scrollTop,170);
    assert.strictEqual(p.v.store.attempts.length,0);
  });
  check("structured parts retain markscheme reveal and manual mark allocation", () => {
    key(p,"Enter");
    assert(p.v._marksPending);
    assert.strictEqual(p.v.store.attempts.length,0);
    key(p,"1");
    assert.strictEqual(p.v.store.attempts.length,1);
    assert.strictEqual(p.v.store.attempts[0].marks_awarded,1);
    assert.strictEqual(p.v.store.attempts[0].marks_max,2);
    key(p,"2"); // d033: IB asks how many marks you understand now before C
    assert.strictEqual(p.v.store.attempts[0].get_it_now_marks,2);
    key(p,"5");
    assert.strictEqual(p.v.store.attempts.length,1);
    assert.strictEqual(p.v.store.scores[b.id],5);
  });
  check("A-D and1-4 automatically mark reviewed MCQs without a manual marks step", () => {
    for (const pressed of ["A","b","C","d","1","2","3","4"]) {
      const q = question("mcq-"+pressed,"",{parent_id:"mcq-"+pressed,paper:"1A",marks:1,context_images:[],correct_option:"B",answer_status:"reviewed_source_key"});
      const mcq=mount([q]);
      key(mcq,pressed);
      assert.strictEqual(mcq.v.store.attempts.length,1,pressed);
      assert.strictEqual(mcq.v.store.attempts[0].correct,pressed.toUpperCase()==="B"||pressed==="2",pressed);
      assert(!mcq.v._marksPending,pressed);
      assert(mcq.v.answered,pressed);
      key(mcq,"6");
      assert.strictEqual(mcq.v.store.attempts.length,1);
      assert.strictEqual(mcq.v.store.scores[q.id],6);
    }
  });
  check("uncertain MCQ keys cannot trigger automatic grading", () => {
    for (const answer_status of ["ambiguous","conflict",""]) {
      const q=question("uncertain-"+answer_status,"",{parent_id:"uncertain",paper:"1A",marks:1,context_images:[],correct_option:"B",answer_status});
      const uncertain=mount([q]);
      key(uncertain,"2");
      assert.strictEqual(uncertain.v.store.attempts.length,0);
      key(uncertain,"Enter");
      assert(uncertain.v._marksPending);
    }
  });
  console.log(JSON.stringify({checks,result:"PASS",limitation:"Viewport fit and independent scroll geometry require browser validation."}));
} finally { opened.forEach(p=>{p.v.destroy();p.dom.window.close();}); }
