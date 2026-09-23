/* Student controls through the real consumer and shared engine.
   All network calls are stubbed; this test never sends feedback.
   Run: node test/test_physics_usability.js. Geometry is browser-reviewed. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path");
const {JSDOM} = require("jsdom");
const ROOT = path.resolve(__dirname,".."), read = p => fs.readFileSync(path.join(ROOT,p),"utf8");
const engine = read("engine/ppqviewer.js"), config = read("example/physics-config.js");
const ENDPOINT = "https://script.google.com/macros/s/AKfycbwMbhGFHSd2D1IwpnDlYhbVNLqc7IBk88iDUQcjYHZGPLAnNvVLq4QRm6lMFSM8nqrkfQ/exec";
const opened = []; let checks = 0;
const clone = value => JSON.parse(JSON.stringify(value));
const metadata = {course:"ib",title:"IB Physics",release:true,default_topic:"A.5",topics:{"A.5":"Relativity"},analysis:{groups:[
  {code:"A5.FRAME",label:"Frames",summary:"Identify the observer. Name the frame. State the events. Check their order.",checks:["Compare the same events.","<img src=x onerror=alert(1)> stays text."]},
  {code:"A5.TIME",label:"Time dilation",summary:"Find the proper time.",checks:["Check the two events."]}
]}};
function question(id,group) {
  return {id,parent_id:id,source_part_id:"source-"+id,source_label:"2025 May TZ1 · Paper 2 · HL",year:2025,paper:"2",level:"HL",question_number:id==="q1"?"1":"2",label:"(a)",marks:2,
    topic_codes:["A.5"],analysis_groups:[group],question_images:["assets/"+id+".png"],context_images:["assets/context.png"],markscheme_images:["assets/"+id+"-ms.png"]};
}
function mount(extra={},course="ib") {
  const dom = new JSDOM('<div id="root"></div>',{url:"https://example.test/ibphysicsppqs/?topic=A5",runScripts:"outside-only",pretendToBeVisual:true});
  const w=dom.window, calls=[]; w.confirm=()=>true;
  w.fetch=(url,options)=>{calls.push({url,options});return Promise.resolve({type:"opaque",ok:false,status:0});};
  w.XMLHttpRequest=()=>{throw Error("Unexpected XMLHttpRequest");};w.navigator.sendBeacon=()=>{throw Error("Unexpected beacon");};
  w.PHYSICS_META={...clone(metadata),course};w.PHYSICS_QUESTIONS=[question("q1","A5.FRAME"),question("q2","A5.TIME")];
  w.eval(engine);w.eval(config);Object.assign(w.PPQ_CONFIG,{defaultOrder:"ordered",prefetchAhead:0},extra);
  const root=w.document.getElementById("root"),v=w.PPQViewer.mount(root,{config:w.PPQ_CONFIG,questions:w.PHYSICS_QUESTIONS,meta:w.PHYSICS_META});
  const p={dom,w,root,v,calls};opened.push(p);return p;
}
function open(p,reason="bad_crop"){const button=p.root.querySelector('.ppq-report-reason[data-reason="'+reason+'"]')||p.root.querySelector(".ppq-problem-report");assert(button,"Visible report control required: "+reason);button.click();assert(p.root.querySelector(".ppq-problem-form"));}
function field(p,selector,value,event="input"){const node=p.root.querySelector(selector);node.value=value;node.dispatchEvent(new p.w.Event(event,{bubbles:true}));return node;}
function submit(p){p.root.querySelector(".ppq-problem-form").dispatchEvent(new p.w.Event("submit",{bubbles:true,cancelable:true}));}
const settled = () => new Promise(resolve=>setImmediate(resolve));
function state(p){return {id:p.v.cur&&p.v.cur.id,attemptId:p.v._attemptId,shownAt:p.v.shownAt,timer:p.v._timerInterval,answered:p.v.answered,
  marksPending:p.v._marksPending,marksOutcome:JSON.stringify(p.v._marksOutcome),visitTarget:p.v._visitTargetMs,visitLevel:p.v._visitLearnerLevel,store:JSON.stringify(p.v.store)};}
async function check(name,run){await run();checks++;console.log("ok "+name);}
(async()=>{
  try {
    await check("reporting is opt-in and does not create requests on mount, open or close",async()=>{
      const legacy=mount({problemReport:null});assert.strictEqual(legacy.v.cfg.problemReport,null);assert(!legacy.root.querySelector(".ppq-problem-report, .ppq-report-reason"));
      assert.strictEqual(legacy.v._openProblemReport(),false);
      const bad=mount({problemReport:{endpoint:"javascript:bad"}});assert.strictEqual(bad.v.cfg.problemReport,null);
      const p=mount();assert.strictEqual(p.v.cfg.problemReport.endpoint,ENDPOINT);assert.strictEqual(p.calls.length,0);
      assert.deepStrictEqual(Array.from(p.root.querySelectorAll(".ppq-report-reason"),b=>[b.dataset.reason,b.textContent]),[
        ["wrong_topic","Wrong topic?"],["wrong_type","Wrong question type?"],["qa_mismatch","Q&A don't match?"],
        ["bad_crop","Bad cropping?"],["broken","Something broken?"],["improve","Could be better?"]
      ]);
      assert(!p.root.querySelector(".ppq-problem-report"));
      open(p);assert.strictEqual(p.root.querySelector(".ppq-progress-title").textContent,"Bad cropping");
      assert(!p.root.querySelector(".ppq-problem-type"),"A named reason replaces the classification dropdown");
      const note=p.root.querySelector(".ppq-problem-message");assert.strictEqual(note.required,false);assert.strictEqual(note.maxLength,5000);
      assert.strictEqual(note.ariaLabel,"Anything to add? (optional)");assert.strictEqual(p.w.document.activeElement,p.root.querySelector(".ppq-problem-send"));
      await settled();assert.strictEqual(p.calls.length,0);assert(!/thanks/i.test(p.root.querySelector(".ppq-problem-status").textContent));
      p.root.querySelector(".ppq-problem-close").click();assert.strictEqual(p.calls.length,0);
    });
    await check("every named reason can send its source and reason without typing or changing progress",async()=>{
      for(const [id,note] of [["q1",""],["q2","   "]]){
        const p=mount();p.v.goToId(id);const before=state(p);
        for(const reason of p.v.cfg.problemReport.reasons){
          const count=p.calls.length;open(p,reason.code);
          const source=p.v.cfg.problemReport.sourceLabelOf(p.v.cur);
          assert.strictEqual(p.root.querySelector(".ppq-problem-source").textContent,"Currently viewing "+source);
          field(p,".ppq-problem-message",note);p.root.querySelector(".ppq-problem-send").click();await settled();
          assert.strictEqual(p.calls.length,count+1);const payload=JSON.parse(p.calls.at(-1).options.body);
          assert.strictEqual(payload.message,reason.label+": Please check this question: "+source+".");
          assert.strictEqual(payload.context.issue_type,reason.label);assert.strictEqual(payload.context.reason_code,reason.code);
          assert.strictEqual(payload.context.item_id,id);assert.strictEqual(payload.context.source_label,source);
          assert.strictEqual(payload.context.source_part_id,"source-"+id);assert.deepStrictEqual(payload.context.question_images,["assets/"+id+".png"]);
          assert.strictEqual(p.root.querySelector(".ppq-problem-status").textContent,"Thanks for reporting.");
          p.root.querySelector(".ppq-problem-close").click();assert.deepStrictEqual(state(p),before);
        }
      }
    });
    await check("consumers without named reasons retain a working report button and validated dropdown",async()=>{
      const p=mount({problemReport:{endpoint:ENDPOINT,project:"legacy-report",sourceLabelOf:q=>q.source_label}});
      assert.strictEqual(p.root.querySelector(".ppq-problem-report").textContent,"Report a display problem");
      assert(!p.root.querySelector(".ppq-report-reason"));open(p);
      const type=p.root.querySelector(".ppq-problem-type");
      assert.deepStrictEqual(Array.from(type.options,o=>o.value),["Bad crop or missing content","Question image","Markscheme image","Answer or marks","Other"]);
      assert.strictEqual(type.value,"Bad crop or missing content");
      field(p,".ppq-problem-type","invalid","change");submit(p);await settled();
      assert.strictEqual(p.calls.length,0);assert.match(p.root.querySelector(".ppq-problem-status").textContent,/choose a problem type/);
      field(p,".ppq-problem-type","Markscheme image","change");field(p,".ppq-problem-message","A label is missing.");submit(p);await settled();
      assert.strictEqual(p.calls.length,1);const payload=JSON.parse(p.calls[0].options.body);
      assert.strictEqual(payload.message,"Markscheme image: A label is missing.");assert.strictEqual(payload.context.issue_type,"Markscheme image");
      assert(!Object.hasOwn(payload.context,"reason_code"));assert.strictEqual(p.root.querySelector(".ppq-problem-status").textContent,"Thanks for reporting.");
    });
    await check("optional notes keep their length limit without silently truncating or sending",async()=>{
      const p=mount();open(p);field(p,".ppq-problem-message","x".repeat(5001));submit(p);await settled();
      assert.strictEqual(p.calls.length,0);assert.match(p.root.querySelector(".ppq-problem-status").textContent,/5000/);
      assert.strictEqual(p.root.querySelector(".ppq-problem-message").value.length,5001);
    });
    await check("opening and closing preserves an active answer, timing and unsent draft",()=>{
      const p=mount();p.v.reveal();assert(p.v._marksPending);const before=state(p);
      open(p);field(p,".ppq-problem-message","Diagram is cut off.");
      p.root.querySelector(".ppq-modal-close").click();assert.deepStrictEqual(state(p),before);
      open(p);assert.strictEqual(p.root.querySelector(".ppq-problem-message").value,"Diagram is cut off.");
      assert.strictEqual(p.root.querySelector(".ppq-progress-title").textContent,"Bad cropping");
      p.root.querySelector(".ppq-problem-close").click();assert.deepStrictEqual(state(p),before);assert.strictEqual(p.calls.length,0);
    });
    await check("a visible running timer keeps the same interval and attempt when the report closes",()=>{
      const p=mount({timing:{defaultMode:"clock",targetOf:()=>120}});assert(p.v._timerInterval,"This fixture must have a running visible timer");
      const before=state(p);open(p);field(p,".ppq-problem-message","The axis label is unclear.");
      p.root.querySelector(".ppq-problem-close").click();assert.deepStrictEqual(state(p),before);
      assert.strictEqual(p.calls.length,0);assert.notStrictEqual(p.root.querySelector(".ppq-timer").style.display,"none");
    });
    await check("explicit Send uses the estate protocol, exact source snapshot and no learner performance",async()=>{
      const p=mount();p.v.store.attempts=[{id:"q1",marks_awarded:1,correct:false,time_ms:5555}];p.v.store.scores.q1=4;
      open(p,"qa_mismatch");const source=p.v.cfg.problemReport.sourceLabelOf(p.v.cur);
      assert.strictEqual(p.root.querySelector(".ppq-problem-source").textContent,"Currently viewing "+source);
      assert.match(source,/2025 May TZ1.*Question 1\(a\)/);
      field(p,".ppq-problem-message","The shown answer belongs to another part.");
      // Prove the sent context was copied when the form opened, not at submission.
      p.v.cur.topic_codes.push("changed-after-opening");p.v.cur=p.v.byId.q2;
      submit(p);await settled();assert.strictEqual(p.calls.length,1);
      const call=p.calls[0],payload=JSON.parse(call.options.body);
      assert.strictEqual(call.url,ENDPOINT);assert.strictEqual(call.options.method,"POST");assert.strictEqual(call.options.mode,"no-cors");
      assert.strictEqual(call.options.headers["Content-Type"],"text/plain;charset=utf-8");
      assert.strictEqual(payload.project,"physics-ppq-ib");assert.strictEqual(payload.name,"");assert.strictEqual(payload.email,"");
      assert.strictEqual(payload.url,"https://example.test/ibphysicsppqs/?topic=A5");assert(!isNaN(Date.parse(payload.ts)));
      assert.strictEqual(payload.message,"Q&A don't match?: The shown answer belongs to another part.");
      assert.strictEqual(payload.context.reason_code,"qa_mismatch");assert.strictEqual(payload.context.issue_type,"Q&A don't match?");
      assert.strictEqual(payload.context.item_id,"q1");assert.strictEqual(payload.context.source_part_id,"source-q1");assert.strictEqual(payload.context.source_label,source);
      assert.deepStrictEqual(payload.context.topic_codes,["A.5"]);assert.deepStrictEqual(payload.context.question_images,["assets/q1.png"]);
      const serialized=JSON.stringify(payload);assert(!/marks_awarded|correct|time_ms|learner|attempt|scores|confidence|picked/i.test(serialized));
      assert.strictEqual(p.root.querySelector(".ppq-problem-status").textContent,"Thanks for reporting.");
      assert(!/received|recorded|noted/i.test(p.root.querySelector(".ppq-problem-status").textContent));
      submit(p);await settled();assert.strictEqual(p.calls.length,1,"A completed dispatch is not silently sent twice");
    });
    await check("failed dispatch retains the reason and description for an explicit retry",async()=>{
      const p=mount();let calls=0;p.w.fetch=()=>{calls++;return Promise.reject(new Error("offline"));};
      open(p);field(p,".ppq-problem-message","The diagram is missing.");submit(p);await settled();
      assert.strictEqual(calls,1);assert.match(p.root.querySelector(".ppq-problem-status").textContent,/could not be sent/);
      assert(!/thanks/i.test(p.root.querySelector(".ppq-problem-status").textContent));
      assert.strictEqual(p.root.querySelector(".ppq-problem-message").value,"The diagram is missing.");assert(!p.root.querySelector(".ppq-problem-send").disabled);
      p.root.querySelector(".ppq-problem-close").click();open(p);assert.match(p.root.querySelector(".ppq-problem-status").textContent,/could not be sent/);
      assert.strictEqual(p.root.querySelector(".ppq-progress-title").textContent,"Bad cropping");
      p.w.fetch=()=>{calls++;return Promise.resolve({type:"opaque"});};submit(p);await settled();assert.strictEqual(calls,2);
      assert.strictEqual(p.root.querySelector(".ppq-problem-status").textContent,"Thanks for reporting.");
    });
    await check("a pending request cannot double-submit and updates a reopened form when settled",async()=>{
      const p=mount();let finish,calls=0;p.w.fetch=()=>{calls++;return new Promise(resolve=>{finish=resolve;});};
      open(p);field(p,".ppq-problem-message","Missing axes.");submit(p);submit(p);assert.strictEqual(calls,1);
      assert(!/thanks/i.test(p.root.querySelector(".ppq-problem-status").textContent));
      assert(p.root.querySelector(".ppq-problem-message").disabled);
      p.root.querySelector(".ppq-problem-close").click();open(p);assert(p.root.querySelector(".ppq-problem-send").disabled);
      finish({type:"opaque"});await settled();assert.strictEqual(p.root.querySelector(".ppq-problem-status").textContent,"Thanks for reporting.");
      assert.strictEqual(calls,1);field(p,".ppq-problem-message","A different issue.");assert(!p.root.querySelector(".ppq-problem-send").disabled);
    });
    await check("drafts are isolated by source part and reason and never persisted into learner storage",()=>{
      const p=mount();open(p);field(p,".ppq-problem-message","Draft for first part.");p.v.closeModal();
      open(p,"wrong_topic");assert.strictEqual(p.root.querySelector(".ppq-problem-message").value,"");
      field(p,".ppq-problem-message","A different reason.");p.v.closeModal();
      p.v.goToId("q2");open(p);assert.strictEqual(p.root.querySelector(".ppq-problem-message").value,"");
      p.v.closeModal();p.v.goToId("q1");open(p);assert.strictEqual(p.root.querySelector(".ppq-problem-message").value,"Draft for first part.");
      assert(!JSON.stringify(p.v.store).includes("Draft for first part"));assert(!Array.from({length:p.w.localStorage.length},(_,i)=>p.w.localStorage.getItem(p.w.localStorage.key(i))).join("").includes("Draft for first part"));
    });
    await check("source labels remain plain text and broken optional metadata cannot block a report",()=>{
      const p=mount({problemReport:{endpoint:ENDPOINT,project:"test",sourceLabelOf:()=>'<img src="bad"> Question 1',contextOf:()=>{throw Error("broken");}}});
      open(p);const source=p.root.querySelector(".ppq-problem-source");assert.strictEqual(source.textContent,'Currently viewing <img src="bad"> Question 1');assert(!source.querySelector("img"));
      assert.strictEqual(p.calls.length,0);
    });
    await check("IB Draw and Report belong to the question column with Reset only in Preferences",()=>{
      const p=mount(),column=p.root.querySelector(".ppq-question-column");assert(column);assert(column.querySelector(".ppq-centre"));
      const toolbar=column.querySelector(".ppq-question-tools");assert(toolbar);assert(toolbar.querySelector(".ppq-draw-toggle"));assert(toolbar.querySelector(".ppq-report-block .ppq-report-reason"));
      assert(!p.root.querySelector(".ppq-right-column .ppq-draw-toggle"));assert(!p.root.querySelector(".ppq-toolbar .ppq-reset"));
      p.root.querySelector(".ppq-timing-btn").click();assert(p.root.querySelector(".ppq-timing-panel .ppq-reset"));
      const legacy=mount({},"trilogy");assert(!legacy.root.querySelector(".ppq-question-column"));assert(legacy.root.querySelector(".ppq-toolbar .ppq-reset"));
    });
    await check("Reset in Preferences preserves cancellation and clears only this course's progress",()=>{
      const p=mount();p.v.store.attempts=[{id:"q1",correct:false}];p.v.store.scores.q1=2;p.v._saveStore();
      p.w.localStorage.setItem("unrelated-course",'{"attempts":[1]}');p.root.querySelector(".ppq-timing-btn").click();
      p.w.confirm=()=>false;p.root.querySelector(".ppq-reset").click();assert.strictEqual(p.v.store.attempts.length,1);assert.strictEqual(p.v.store.scores.q1,2);
      let confirmations=0;p.w.confirm=()=>{confirmations++;return true;};p.root.querySelector(".ppq-reset").click();
      assert.strictEqual(confirmations,1);assert.strictEqual(p.v.store.attempts.length,0);assert.deepStrictEqual(Object.keys(p.v.store.scores),[]);
      assert.strictEqual(p.w.localStorage.getItem("unrelated-course"),'{"attempts":[1]}');
    });
    await check("group clicks and selector changes offer closed Key tips with preserved escaped bullets",()=>{
      const p=mount(),dash=p.root.querySelector(".ppq-dash"),index=p.v.cfg.filters.findIndex(f=>f.field==="analysis_groups");
      dash.scrollTop=560;p.root.querySelector('.ppq-cat[data-fidx="'+index+'"][data-value="A5.FRAME"]').click();
      assert.strictEqual(dash.scrollTop,0);let guidance=p.root.querySelector(".ppq-facet-guidance");assert(!guidance.open);
      assert.strictEqual(guidance.querySelector("summary").textContent,"Key tips");assert.strictEqual(p.w.document.activeElement,guidance.querySelector("summary"));
      assert.strictEqual(p.root.querySelector(".ppq-facet-cat.active").dataset.value,"A5.FRAME");
      assert.strictEqual(guidance.querySelectorAll("li").length,2);assert.strictEqual(guidance.querySelectorAll("p").length,2);assert(!guidance.querySelector("img"));
      assert(guidance.compareDocumentPosition(p.root.querySelector(".ppq-dash-content .ppq-cat")) & p.w.Node.DOCUMENT_POSITION_FOLLOWING);
      guidance.querySelector("summary").click();assert(guidance.open,"Reading tips is explicit");
      dash.scrollTop=175;p.v.renderDashboard();assert.strictEqual(dash.scrollTop,175,"Routine progress rerenders must not move the analysis reading position");
      assert(!p.root.querySelector(".ppq-facet-guidance").open);
      const selector=p.root.querySelector('.ppq-select[data-fidx="'+index+'"]');selector.value="A5.TIME";selector.dispatchEvent(new p.w.Event("change",{bubbles:true}));
      assert.strictEqual(dash.scrollTop,0);guidance=p.root.querySelector(".ppq-facet-guidance");assert.strictEqual(guidance.querySelector("summary").textContent,"Key tips");assert(!guidance.open);
      assert.strictEqual(p.root.querySelector(".ppq-facet-cat.active").dataset.value,"A5.TIME");
    });
    console.log(checks+" Physics usability checks passed (all feedback requests stubbed)");
  } finally {opened.forEach(p=>{p.v.destroy();p.dom.window.close();});}
})().catch(error=>{console.error(error);process.exitCode=1;});
