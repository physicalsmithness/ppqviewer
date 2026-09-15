/* Pupil teacher-help journeys. Both JSONP script loading and fetch are intercepted;
   no real service is contacted. Run: node test/test_teacher_help.js. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path");
const {JSDOM}=require("jsdom");
const ROOT=path.resolve(__dirname,".."),engine=fs.readFileSync(path.join(ROOT,"engine/ppqviewer.js"),"utf8"),consumer=fs.readFileSync(path.join(ROOT,"example/physics-config.js"),"utf8");
const ENDPOINT="https://help.test/exec",PROJECT="ibphysics-test",opened=[];
const clone=x=>JSON.parse(JSON.stringify(x)),tick=()=>new Promise(resolve=>setImmediate(resolve));
let checks=0;
function backend(){
  return {posts:[],gets:[],requests:new Map(),replies:[],accept:true,postError:false,delayPost:null,
    post(body){
      const data=JSON.parse(body);this.posts.push(data);
      // Same explicit allow-list and text limit as Clarifications.gs.
      assert.deepStrictEqual(Object.keys(data).sort(),["action","project","request_id","item_id","question","source_label","source_url","source_context"].sort());
      assert.strictEqual(data.action,"ppq_help_request");assert(data.question.trim()&&data.question.length<=4000);
      assert(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(data.request_id));
      for(const key of Object.keys(data.source_context))assert(["id","parent_id","source_part_id","source_group_id","question_images","context_images","markscheme_images"].includes(key),key);
      const commit=()=>{if(this.accept){const prior=this.requests.get(data.request_id);if(prior)assert.deepStrictEqual(data,prior,"Retry must retain the same immutable request");this.requests.set(data.request_id,clone(data));}};
      if(this.delayPost)return this.delayPost(data,commit);
      commit();return this.postError?Promise.reject(Error("network response lost")):Promise.resolve({type:"opaque"});
    },
    get(url){
      const action=url.searchParams.get("action");this.gets.push({action,url:url.href});
      if(action==="ppq_help_list")return {ok:true,replies:this.replies.filter(r=>r.project===url.searchParams.get("project")&&r.item_id===url.searchParams.get("item_id"))};
      assert.strictEqual(action,"ppq_help_status");const ids=url.searchParams.get("request_ids").split(",");
      return {ok:true,requests:ids.map(id=>({request_id:id,status:this.requests.has(id)?"pending":"not_found"})),replies:this.replies.filter(r=>ids.includes(r.request_id))};
    }
  };
}
function q(id){return {id,parent_id:id,source_part_id:"source-"+id,source_label:"2025 May TZ1 · Paper 2 · HL",year:2025,paper:"2",level:"HL",question_number:id==="q1"?"1":"2",label:"(a)",marks:2,topic_codes:["A.5"],question_images:["assets/"+id+".png"],context_images:[],markscheme_images:["assets/"+id+"-ms.png"]};}
function mount(server=backend(),options={}){
  const dom=new JSDOM('<div id="root"></div>',{url:"https://viewer.test/physics/?topic=A5&email=do-not-send#old",runScripts:"outside-only",pretendToBeVisual:true}),w=dom.window;
  const nativeAppend=w.document.head.appendChild.bind(w.document.head),nativeTimeout=w.setTimeout.bind(w);
  w.setTimeout=(fn,ms,...args)=>nativeTimeout(fn,ms===1000?0:ms,...args);
  w.document.head.appendChild=node=>{
    const result=nativeAppend(node);
    if(node.tagName==="SCRIPT"&&node.src){const url=new URL(node.src);assert.strictEqual(url.origin,"https://help.test");
      queueMicrotask(()=>{const callback=w[url.searchParams.get("callback")];if(typeof callback==="function")callback(server.get(url));});}
    return result;
  };
  w.fetch=(url,opts)=>{assert.strictEqual(url,ENDPOINT);assert.strictEqual(opts.method,"POST");assert.strictEqual(opts.mode,"no-cors");assert.strictEqual(opts.headers["Content-Type"],"text/plain;charset=utf-8");return server.post(opts.body);};
  w.confirm=()=>true;w.PHYSICS_META={course:"ib",topics:{"A.5":"Relativity"},release:true};w.PHYSICS_QUESTIONS=[q("q1"),q("q2")];
  w.eval(engine);w.eval(consumer);Object.assign(w.PPQ_CONFIG,{defaultOrder:"ordered",prefetchAhead:0,teacherHelp:options.disabled?null:{...w.PPQ_CONFIG.teacherHelp,endpoint:ENDPOINT,project:PROJECT,
    sourceLabelOf:record=>record.source_label+" · Question "+record.question_number+record.label,
    sourceUrlOf:()=>w.location.href,
    contextOf:record=>({source_part_id:record.source_part_id,parent_id:record.parent_id,question_images:record.question_images,markscheme_images:record.markscheme_images})}},options.config||{});
  Object.entries(options.saved||{}).forEach(([k,value])=>w.localStorage.setItem(k,value));
  const root=w.document.getElementById("root"),v=w.PPQViewer.mount(root,{config:w.PPQ_CONFIG,questions:w.PHYSICS_QUESTIONS,meta:w.PHYSICS_META});
  const p={w,dom,root,v,server};opened.push(p);return p;
}
const saved=p=>Object.fromEntries(Array.from({length:p.w.localStorage.length},(_,i)=>{const k=p.w.localStorage.key(i);return[k,p.w.localStorage.getItem(k)];}));
function open(p){p.root.querySelector(".ppq-teacher-help").click();assert(p.root.querySelector(".ppq-help-panel"));}
function write(p,text){const node=p.root.querySelector(".ppq-help-message");node.value=text;node.dispatchEvent(new p.w.Event("input",{bubbles:true}));}
function send(p){p.root.querySelector(".ppq-help-form").dispatchEvent(new p.w.Event("submit",{bubbles:true,cancelable:true}));}
const status=p=>p.root.querySelector(".ppq-help-status").textContent;
async function waitFor(test){for(let n=0;n<100;n++){if(test())return;await new Promise(resolve=>setTimeout(resolve,2));}assert(test(),"Expected async state did not settle");}
function progress(p){return {cur:p.v.cur.id,answered:p.v.answered,marksPending:p.v._marksPending,attempt:p.v._attemptId,shownAt:p.v.shownAt,timer:p.v._timerInterval,store:JSON.stringify(p.v.store)};}
async function check(name,run){await run();checks++;console.log("ok "+name);}
(async()=>{try{
  await check("no help configuration means no control, timer, scripts or requests",async()=>{
    const p=mount(backend(),{disabled:true});await tick();assert(!p.root.querySelector(".ppq-teacher-help"));assert.strictEqual(p.v._helpInterval,undefined);
    assert.strictEqual(p.v._openTeacherHelp(),false);assert.strictEqual(p.server.posts.length,0);assert.strictEqual(p.server.gets.length,0);
  });
  await check("opening only reads public history; a written question is required within the service limit",async()=>{
    const p=mount();open(p);await tick();assert.strictEqual(p.server.posts.length,0);assert(p.server.gets.some(g=>g.action==="ppq_help_list"));
    assert.strictEqual(p.root.querySelector(".ppq-help-message").maxLength,4000);
    write(p," ");send(p);assert.match(status(p),/Please write/);write(p,"x".repeat(4001));send(p);assert.match(status(p),/4000/);
    assert.strictEqual(p.server.posts.length,0);assert.strictEqual(p.v._helpData.requests.length,0);
  });
  await check("Physics warns before asking that help is experimental and makes no reply-notification promise",async()=>{
    const p=mount();assert.strictEqual(p.root.querySelector(".ppq-teacher-help").textContent,"Ask your teacher");open(p);
    const panel=p.root.querySelector(".ppq-help-panel"),intro=panel.querySelector(".ppq-help-note"),form=panel.querySelector(".ppq-help-form");
    assert.strictEqual(panel.querySelector("h2").textContent,"Ask your teacher");
    assert.match(intro.textContent,/experimental/i);assert.match(intro.textContent,/check back here for replies/);
    assert.match(intro.textContent,/teacher may reply directly/);assert.match(intro.textContent,/Notifications are planned/);
    assert(intro.compareDocumentPosition(form)&p.w.Node.DOCUMENT_POSITION_FOLLOWING);
    assert(!/notice will appear|notification will appear/i.test(panel.textContent));assert.strictEqual(p.server.posts.length,0);
    write(p,"Can you clarify the frame of reference?");send(p);await waitFor(()=>/has been received/.test(status(p)));
    assert.match(status(p),/experimental/i);assert.match(status(p),/check back here/);assert.match(status(p),/teacher may reply directly/);
    assert.match(status(p),/Notifications are planned/);assert(!/notice will appear|notification will appear/i.test(status(p)));
  });
  await check("a confirmed receipt uses the exact backend schema and source snapshot, preserving learner progress",async()=>{
    const p=mount();p.v.reveal();assert(p.v._marksPending);const before=progress(p);open(p);write(p,"Why is this the proper time?");send(p);
    await waitFor(()=>/has been received/.test(status(p)));assert.strictEqual(p.server.posts.length,1);assert.strictEqual(p.server.requests.size,1);
    const payload=p.server.posts[0];assert.strictEqual(payload.project,PROJECT);assert.strictEqual(payload.item_id,"q1");assert.strictEqual(payload.source_context.source_part_id,"source-q1");
    assert.strictEqual(payload.source_url,"https://viewer.test/physics/?id=q1");assert(!JSON.stringify(payload).includes("do-not-send"));
    assert(!/marks_awarded|time_ms|learner|attempt|scores|confidence/.test(JSON.stringify(payload)));
    assert.strictEqual(p.v._helpData.requests[0].status,"pending");assert(!p.v._helpData.drafts.q1);assert(p.root.querySelector(".ppq-help-send").disabled);
    send(p);await tick();assert.strictEqual(p.server.posts.length,1);p.v.closeModal();assert.deepStrictEqual(progress(p),before);
  });
  await check("a lost POST response can still be confirmed from its actual receipt",async()=>{
    const server=backend();server.postError=true;const p=mount(server);open(p);write(p,"Which frame measures these events?");send(p);
    await waitFor(()=>/has been received/.test(status(p)));assert.strictEqual(server.requests.size,1);assert.strictEqual(server.posts.length,1);
  });
  await check("unconfirmed delivery retries the same saved UUID and text after remount",async()=>{
    const server=backend();server.accept=false;const p=mount(server);open(p);write(p,"How should I choose the frame?");send(p);
    await waitFor(()=>/Receipt could not be confirmed/.test(status(p)));const first=clone(server.posts[0]);assert(!/has been received/.test(status(p)));
    const restored=mount(server,{saved:saved(p)});open(restored);assert(restored.root.querySelector(".ppq-help-message").readOnly);
    assert.strictEqual(restored.root.querySelector(".ppq-help-message").value,first.question);server.accept=true;send(restored);
    await waitFor(()=>/has been received/.test(status(restored)));assert.strictEqual(server.posts.length,2);assert.deepStrictEqual(server.posts[1],first);assert.strictEqual(server.requests.size,1);
  });
  await check("close/reopen and focus cannot duplicate a pending request or strand its receipt",async()=>{
    const server=backend();let finish;server.delayPost=(data,commit)=>new Promise(resolve=>{finish=()=>{commit();resolve({type:"opaque"});};});
    const p=mount(server);open(p);write(p,"Where does this factor come from?");send(p);send(p);assert.strictEqual(server.posts.length,1);
    p.v.closeModal();open(p);assert(p.root.querySelector(".ppq-help-send").disabled);send(p);assert.strictEqual(server.posts.length,1);
    p.w.dispatchEvent(new p.w.Event("focus"));await tick();finish();await waitFor(()=>/has been received/.test(status(p)));
    assert.strictEqual(server.posts.length,1);assert.strictEqual(p.v._helpData.requests[0].status,"pending");assert(!p.v._helpData.drafts.q1);
  });
  await check("focus reload preserves an open unsent draft and its eventual request ID",async()=>{
    const p=mount();open(p);write(p,"First wording");p.w.dispatchEvent(new p.w.Event("focus"));await tick();write(p,"Revised wording");
    assert.strictEqual(JSON.parse(p.w.localStorage.getItem(p.v._helpKey)).drafts.q1.message,"Revised wording");send(p);
    await waitFor(()=>/has been received/.test(status(p)));assert.strictEqual(p.server.posts[0].question,"Revised wording");assert.strictEqual(p.v._helpData.requests.length,1);
  });
  await check("later receipt polling clears a retry draft and refreshes its open form",async()=>{
    const server=backend();server.accept=false;const p=mount(server);open(p);write(p,"Please clarify the first step.");send(p);
    await waitFor(()=>/Receipt could not be confirmed/.test(status(p)));const request=clone(server.posts[0]);
    server.requests.set(request.request_id,request);await p.v._helpPoll();
    assert.match(status(p),/has been received/);assert(!p.v._helpData.drafts.q1);assert(p.root.querySelector(".ppq-help-send").disabled);
    assert.strictEqual(server.posts.length,1);p.v.closeModal();open(p);assert.strictEqual(p.root.querySelector(".ppq-help-message").value,"");
  });
  await check("a source URL hook gives local previews a sanitized canonical public question link",async()=>{
    const p=mount();p.v.cfg.teacherHelp.sourceUrlOf=()=>"https://physicalsmithness.github.io/ibphysicsppqs/?name=private&part=other#answer";
    open(p);write(p,"Please explain this figure.");p.v.cfg.teacherHelp.sourceUrlOf=()=>"https://changed.test/";send(p);
    await waitFor(()=>/has been received/.test(status(p)));
    assert.strictEqual(p.server.posts[0].source_url,"https://physicalsmithness.github.io/ibphysicsppqs/?id=q1");
    const blocked=mount();blocked.v.cfg.teacherHelp.sourceUrlOf=()=>"http://localhost:8000/";open(blocked);write(blocked,"Please explain.");send(blocked);
    assert.match(status(blocked),/public question link/);assert.strictEqual(blocked.server.posts.length,0);
  });
  await check("public history renders reviewed text safely and does not display supplied names",async()=>{
    const server=backend();server.replies=[{id:"public",request_id:"other",project:PROJECT,item_id:"q1",question:'Why <img src=x onerror=alert(1)>?',answer:'Use this frame.\n<script>alert(1)</script>',published_at:"2026-09-10T10:00:00Z",name:"PRIVATE PUPIL",email:"private@example.test"}];
    const p=mount(server);open(p);await tick();const card=p.root.querySelector(".ppq-help-history .ppq-help-reply");assert(card);
    assert.strictEqual(card.querySelector("h4").textContent,server.replies[0].question);assert.strictEqual(card.querySelector("p").textContent,server.replies[0].answer);
    assert(!card.querySelector("img,script"));assert(!p.root.querySelector(".ppq-help-panel").textContent.includes("PRIVATE PUPIL"));assert(!p.root.textContent.includes("private@example.test"));
    assert.strictEqual(p.v._helpData.requests.length,0);assert(!p.root.querySelector(".ppq-help-unread"));
  });
  await check("saved receipts restore reply notifications and Read reply clears only the matching unread state",async()=>{
    const server=backend(),p=mount(server);open(p);write(p,"How do I use the diagram?");send(p);await waitFor(()=>/has been received/.test(status(p)));
    const request=server.posts[0];server.replies=[{id:"answer-1",request_id:request.request_id,project:PROJECT,item_id:"q1",question:"How is the diagram used?",answer:"Identify the two events first.",published_at:"2026-09-12T10:00:00Z"}];
    const restored=mount(server,{saved:saved(p)});await waitFor(()=>!!restored.root.querySelector(".ppq-help-unread"));
    assert.match(restored.root.querySelector(".ppq-help-unread").textContent,/1 new reply/);restored.v.goToId("q2");open(restored);await tick();
    const read=restored.root.querySelector(".ppq-help-inbox .ppq-help-read");assert(read);read.click();
    assert(restored.root.querySelector(".ppq-help-inbox .ppq-help-reply").textContent.includes("Identify the two events first."));assert(!restored.root.querySelector(".ppq-help-unread"));
    const again=mount(server,{saved:saved(restored)});await tick();assert(!again.root.querySelector(".ppq-help-unread"));
    server.replies[0].published_at="2026-09-12T11:00:00Z";await again.v._helpPoll();assert(again.root.querySelector(".ppq-help-unread"),"An updated teacher answer becomes unread again");
  });
  await check("unavailable browser storage blocks sending so a pupil cannot lose the reply receipt",async()=>{
    const p=mount();open(p);write(p,"Please explain the last step.");p.w.Storage.prototype.setItem=function(){throw Error("blocked");};send(p);await tick();
    assert.strictEqual(p.server.posts.length,0);assert.match(status(p),/save browser data/);
  });
  await check("help opens without resetting a live visible clock or its attempt",()=>{
    const p=mount(backend(),{config:{timing:{defaultMode:"clock",targetOf:()=>120}}});assert(p.v._timerInterval);const before=progress(p);
    open(p);p.v.closeModal();assert.deepStrictEqual(progress(p),before);assert.strictEqual(p.server.posts.length,0);
  });
  console.log(checks+" teacher-help pupil journeys passed (JSONP and POST simulated)");
}finally{opened.forEach(p=>{p.v.destroy();p.w.close();});}})().catch(error=>{console.error(error);process.exitCode=1;});
