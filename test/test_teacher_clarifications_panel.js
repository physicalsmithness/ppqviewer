"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), {JSDOM} = require("jsdom");
const source = fs.readFileSync(path.join(__dirname, "../integration/teacher-clarifications/teacher-panel.js"), "utf8");
const opened = []; let checks = 0;
function check(name, fn) { fn(); checks++; console.log("ok " + name); }
function mount(api = true) {
  const dom = new JSDOM('<!doctype html><html><head></head><body><div class="topbar"><label>Project <select id="f-project"><option>existing-project</option></select></label><div class="tabs"><button class="tab active" data-tab="grid">Coverage</button><button class="tab" data-tab="misc">Misconceptions</button><button class="tab" data-tab="ticker">Ticker</button><button class="tab" data-tab="records">Records</button></div><button id="btn-refresh-top">Refresh</button><span id="refreshed"></span><span id="status"></span></div><div class="controls"><label>Cohort <select id="f-cohort"><option>My class</option></select></label></div><div class="legend">Legend</div><section id="tab-grid">Coverage body</section><section id="tab-misc" hidden>Misconceptions body</section><section id="tab-ticker" hidden>Ticker body</section><section id="tab-records" hidden>Records body</section><div id="detail">Current detail</div></body></html>', {url:"https://teacher.test/",runScripts:"outside-only"});
  const w = dom.window, calls = [], state = {tab:"grid"};
  // Existing TeacherViewer binds individual buttons and toggles only its four sections.
  w.document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => {
    w.document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active")); b.classList.add("active"); state.tab=b.dataset.tab;
    ["grid","misc","ticker","records"].forEach(t=>w.document.getElementById("tab-"+t).hidden=state.tab!==t);
  }));
  function runner(success, failure) { return {
    withSuccessHandler(fn) { return runner(fn,failure); }, withFailureHandler(fn) { return runner(success,fn); },
    tvHelpInbox() { calls.push({method:"inbox",success,failure}); },
    tvHelpPublish(payload) { calls.push({method:"publish",payload:JSON.parse(JSON.stringify(payload)),success,failure}); }
  }; }
  if (api) w.google={script:{run:runner()}};
  w.eval(source); const instance=w.TeacherClarificationsPanel.mount();
  const p={dom,w,calls,state,instance,q:selector=>w.document.querySelector(selector),qa:selector=>Array.from(w.document.querySelectorAll(selector))}; opened.push(p); return p;
}
function request(id="r1", extra={}) { return {request_id:id,project:"ibphysicsppqs",item_id:"Q7(b_i)",question:"I am Alex. Why does this line pass through the origin?",source_label:"Question 7(b)(i)",source_url:"https://physicalsmithness.github.io/ibphysicsppqs/?q=7",created_at:"2026-09-12T15:00:00Z",status:"pending",reply:null,...extra}; }
function open(p, requests=[request()]) { p.q('[data-tab="help"]').click(); p.calls.at(-1).success({ok:true,requests}); }
function input(p, selector, value) { const field=p.q(selector); field.value=value; field.dispatchEvent(new p.w.Event("input",{bubbles:true})); }
function confirm(p) { const field=p.q(".tv-help-reviewed"); field.checked=true; field.dispatchEvent(new p.w.Event("change",{bubbles:true})); }
function fill(p, question="Why must this worldline pass through the origin?", answer="The two frame origins coincide at this event.") { input(p,".tv-help-question",question); input(p,".tv-help-answer",answer); }
function reply(payload, extra={}) { return {id:"a1",request_id:payload.request_id,project:"ibphysicsppqs",item_id:"Q7(b_i)",question:payload.question,answer:payload.answer,published_at:"2026-09-12T16:00:00Z",...extra}; }
try {
  check("mount is idempotent, does not contact server, and preserves existing tab/control state",()=>{
    const p=mount(); p.w.TeacherClarificationsPanel.mount(); assert.strictEqual(p.qa('[data-tab="help"]').length,1); assert.strictEqual(p.calls.length,0);
    assert(p.q("#tab-help").hidden); open(p); assert.strictEqual(p.calls.length,1); assert.strictEqual(p.state.tab,"grid"); assert.strictEqual(p.q("#tab-grid").hidden,false); assert(p.q("#tab-grid").classList.contains("tv-help-host-hidden")); assert(p.q("#f-cohort").closest(".controls").classList.contains("tv-help-host-hidden"));
    p.q('[data-tab="misc"]').click(); assert.strictEqual(p.state.tab,"misc"); assert(p.q("#tab-help").hidden); assert(p.q("#tab-grid").hidden); assert(!p.q("#tab-misc").hidden); assert(!p.q("#tab-misc").classList.contains("tv-help-host-hidden")); assert.strictEqual(p.q("#f-cohort").value,"My class"); assert.strictEqual(p.q("#f-project").value,"existing-project");
  });
  check("queue filters come only from authorised projects and distinguish answered requests",()=>{
    const p=mount(); open(p,[request(),request("r2",{project:"chemistry",status:"answered",reply:reply({request_id:"r2",question:"Published question",answer:"Published answer"},{project:"chemistry"})})]);
    assert.deepStrictEqual(p.qa(".tv-help-project option").map(x=>x.value),["","chemistry","ibphysicsppqs"]); assert.strictEqual(p.qa(".tv-help-request").length,2);
    p.q(".tv-help-status-filter").value="answered"; p.q(".tv-help-status-filter").dispatchEvent(new p.w.Event("change")); assert.strictEqual(p.qa(".tv-help-request").length,1); assert.strictEqual(p.q(".tv-help-public-answer").textContent,"Published answer");
    p.q(".tv-help-project").value="ibphysicsppqs"; p.q(".tv-help-project").dispatchEvent(new p.w.Event("change")); assert.strictEqual(p.qa(".tv-help-request").length,0); assert.strictEqual(p.calls.length,1);
  });
  check("untrusted question/reply text stays literal and identity fields are not rendered",()=>{
    const p=mount(); open(p,[request("r1",{question:'<img src=x onerror="alert(1)">',display_name:"DO NOT SHOW LEARNER",anonymous_id:"PRIVATE-ID",source_url:"javascript:alert(1)"})]);
    assert.strictEqual(p.q(".tv-help-private").textContent,'<img src=x onerror="alert(1)">'); assert(!p.q("#tab-help img")); assert(!p.q(".tv-help-source")); assert(!p.q("#tab-help").textContent.includes("DO NOT SHOW LEARNER")); assert(!p.q("#tab-help").textContent.includes("PRIVATE-ID")); assert.strictEqual(p.q(".tv-help-question").value,"");
    for(const url of ["data:text/html,<script>alert(1)</script>","//example.com/q","https://user:secret@example.com/q"]){p.q(".tv-help-refresh").click();p.calls.at(-1).success({ok:true,requests:[request("r1",{source_url:url})]});assert(!p.q(".tv-help-source"));}
    p.q(".tv-help-refresh").click();p.calls.at(-1).success({ok:true,requests:[request()]});assert.strictEqual(p.q(".tv-help-source").protocol,"https:");assert.strictEqual(p.q(".tv-help-source").rel,"noopener noreferrer");
  });
  check("publication requires explicit privacy acknowledgement; editing clears it and sends nothing",()=>{
    const p=mount();open(p);fill(p);p.q(".tv-help-publish").click();assert.strictEqual(p.calls.length,1);assert.match(p.q(".tv-help-publish-status").textContent,/tick the confirmation/);
    confirm(p);input(p,".tv-help-answer","A clearer explanation.");assert(!p.q(".tv-help-reviewed").checked);assert.strictEqual(p.calls.length,1);
    confirm(p);p.q(".tv-help-publish").click();p.q(".tv-help-publish").click();assert.strictEqual(p.calls.length,2);assert.deepStrictEqual(p.calls[1].payload,{request_id:"r1",question:"Why must this worldline pass through the origin?",answer:"A clearer explanation.",reviewed_public_question:true});assert(!JSON.stringify(p.calls[1].payload).includes("Alex"));assert(p.q(".tv-help-publish").disabled);
  });
  check("server rejection and network failure preserve both drafts and never claim publication",()=>{
    const p=mount();open(p);fill(p);confirm(p);p.q(".tv-help-publish").click();p.calls.at(-1).success({ok:false,error:"Not authorised"});
    assert.strictEqual(p.q(".tv-help-question").value,"Why must this worldline pass through the origin?");assert.strictEqual(p.q(".tv-help-answer").value,"The two frame origins coincide at this event.");assert.match(p.q(".tv-help-publish-status").textContent,/Could not publish/);assert(!p.q(".tv-help-publication"));assert(!p.q(".tv-help-publish").disabled);
    p.q(".tv-help-publish").click();p.calls.at(-1).failure(new Error("Offline"));assert.strictEqual(p.q(".tv-help-answer").value,"The two frame origins coincide at this event.");assert.match(p.q(".tv-help-publish-status").textContent,/Offline/);
    p.q(".tv-help-publish").click();const call=p.calls.at(-1);call.success({ok:true,reply:reply(call.payload)});assert.strictEqual(p.q(".tv-help-public-answer").textContent,call.payload.answer);assert.match(p.q(".tv-help-feedback").textContent,/Published for everyone/);assert(!p.q(".tv-help-reviewed").checked);
  });
  check("existing public answers can be edited by stable request ID, including appropriate unchanged question wording",()=>{
    const r=request("r1",{question:"Why is this constant?"});r.reply=reply({request_id:r.request_id,question:r.question,answer:"The previous explanation."});r.status="answered";
    const p=mount();open(p,[r]);assert.strictEqual(p.q(".tv-help-question").value,r.question);input(p,".tv-help-answer","The revised explanation.");confirm(p);p.q(".tv-help-publish").click();const call=p.calls.at(-1);assert.strictEqual(call.method,"publish");assert.strictEqual(call.payload.request_id,"r1");assert.strictEqual(call.payload.question,r.question);call.success({ok:true,reply:reply(call.payload)});assert.strictEqual(p.q(".tv-help-public-answer").textContent,"The revised explanation.");
  });
  check("filtering, tab changes and refresh keep unsent drafts and do not publish them",()=>{
    const p=mount();open(p,[request(),request("r2")]);fill(p);confirm(p);p.qa(".tv-help-request")[1].click();p.qa(".tv-help-request")[0].click();assert.strictEqual(p.q(".tv-help-question").value,"Why must this worldline pass through the origin?");assert(p.q(".tv-help-reviewed").checked);
    p.q('[data-tab="grid"]').click();p.q('[data-tab="help"]').click();p.calls.at(-1).success({ok:true,requests:[request(),request("r2")]});assert.strictEqual(p.q(".tv-help-answer").value,"The two frame origins coincide at this event.");assert(p.calls.every(c=>c.method==="inbox"));
  });
  check("late inbox reads cannot overwrite a confirmed publication and unrelated reply receipts fail closed",()=>{
    const p=mount();open(p);fill(p);confirm(p);p.q(".tv-help-refresh").click();const stale=p.calls.at(-1);p.q(".tv-help-publish").click();const publish=p.calls.at(-1);assert(p.q(".tv-help-refresh").disabled);publish.success({ok:true,reply:reply(publish.payload,{request_id:"someone-else"})});assert(!p.q(".tv-help-publication"));assert.match(p.q(".tv-help-publish-status").textContent,/did not confirm/);
    p.q(".tv-help-publish").click();const good=p.calls.at(-1);good.success({ok:true,reply:reply(good.payload)});stale.success({ok:true,requests:[request()]});assert.strictEqual(p.q(".tv-help-public-answer").textContent,good.payload.answer);assert.strictEqual(p.q(".tv-help-question").value,good.payload.question);
  });
  check("missing server support is explicit, and destroy restores the host",()=>{
    const p=mount(false);p.q('[data-tab="help"]').click();assert.match(p.q(".tv-help-feedback").textContent,/signed-in TeacherViewer/);assert(!p.q(".tv-help-publish"));p.instance.destroy();assert(!p.q("#tab-help"));assert.strictEqual(p.qa(".tv-help-host-hidden").length,0);assert(!p.q("#tv-help-panel-style"));assert(p.q('[data-tab="grid"]').classList.contains("active"));
  });
  const livePath=path.join(__dirname,"../integration/teacher-clarifications/remote-before/teacherviewer.html");
  if(fs.existsSync(livePath)) check("downloaded live three-tab TeacherViewer keeps its own rendering, controls and navigation",()=>{
    const dom=new JSDOM(fs.readFileSync(livePath,"utf8"),{url:"https://teacher.test/",runScripts:"outside-only"});
    const w=dom.window,calls=[];
    // Run the actual downloaded app in its local sample mode; this test makes no network calls.
    w.fetch=()=>{throw new Error("Unexpected network request in live-baseline test");};
    Array.from(w.document.querySelectorAll("script:not([src])")).forEach(s=>w.eval(s.textContent+"\nif (typeof state !== 'undefined') window.__liveState = state;"));
    const liveState=w.__liveState;
    assert.strictEqual(liveState.phase,"ready");assert.strictEqual(liveState.tab,"grid");
    assert.deepStrictEqual(Array.from(w.document.querySelectorAll(".tab")).map(b=>b.dataset.tab),["grid","misc","ticker"]);
    const before={project:liveState.project,rows:liveState.rows,raw:liveState.raw,collapsed:liveState.collapsed};
    const values={};["f-project","f-cohort","f-class","f-topic","f-learner","f-time","f-auto"].forEach(id=>{values[id]=w.document.getElementById(id).value;});
    function runner(success,failure){return {withSuccessHandler(fn){return runner(fn,failure);},withFailureHandler(fn){return runner(success,fn);},tvHelpInbox(){calls.push({method:"inbox",success,failure});},tvHelpPublish(payload){calls.push({method:"publish",payload:JSON.parse(JSON.stringify(payload)),success,failure});}};}
    w.google={script:{run:runner()}};w.eval(source);const instance=w.TeacherClarificationsPanel.mount();
    const p={dom,w,calls,instance,q:s=>w.document.querySelector(s),qa:s=>Array.from(w.document.querySelectorAll(s))};opened.push(p);
    assert.strictEqual(calls.length,0);open(p);fill(p);confirm(p);p.q(".tv-help-publish").click();const call=calls.at(-1);call.success({ok:true,reply:reply(call.payload)});
    assert.strictEqual(liveState.tab,"grid");assert.strictEqual(p.q(".tv-help-public-answer").textContent,call.payload.answer);
    for(const tab of ["misc","ticker","grid"]){p.q('[data-tab="'+tab+'"]').click();assert.strictEqual(liveState.tab,tab);assert.strictEqual(liveState.phase,"ready");assert(p.q("#tab-help").hidden);assert(!p.q("#tab-"+tab).hidden);assert.strictEqual(p.qa(".tv-help-host-hidden").length,0);}
    assert.strictEqual(liveState.project,before.project);assert.strictEqual(liveState.rows,before.rows);assert.strictEqual(liveState.raw,before.raw);assert.strictEqual(liveState.collapsed,before.collapsed);
    Object.keys(values).forEach(id=>assert.strictEqual(p.q("#"+id).value,values[id],id+" preserved"));
    assert.deepStrictEqual(calls.map(c=>c.method),["inbox","publish"]);assert.strictEqual(p.qa('[data-tab="records"]').length,0);
  });
  else console.log("skip downloaded live-baseline integration (snapshot not present)");
  console.log(checks+" teacher clarification panel journeys passed");
} finally { opened.forEach(p=>{p.instance.destroy();p.dom.window.close();}); }
