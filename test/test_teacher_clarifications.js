/* Synthetic Apps Script services only: no live workbook, HTTP or credentials. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),vm=require("vm"),crypto=require("crypto");
const source=fs.readFileSync(path.join(__dirname,"../integration/teacher-clarifications/Clarifications.gs"),"utf8");
const clone=value=>JSON.parse(JSON.stringify(value));let checks=0;
function check(name,run){run();checks++;console.log("ok "+name);}
function harness(){
  const sheets=new Map(),props=new Map(),calls=[];
  let active="teacher@example.test",effective="owner@example.test",writable=true,relayHook=null;
  const allowed=new Set([active,effective]);const scopes=new Map();
  class Sheet{
    constructor(name){this.name=name;this.rows=[];}
    appendRow(row){if(!writable)throw Error("Viewer cannot edit workbook");this.rows.push(clone(row));}
    setFrozenRows(){}
    getDataRange(){return{getValues:()=>{const width=Math.max(0,...this.rows.map(row=>row.length));return this.rows.map(row=>Array.from({length:width},(_,i)=>clone(row[i]??"")));}};}
  }
  const ctx={console,Date,Number,RESERVED_TABS:{classes:true,teachers:true},
    Session:{getActiveUser:()=>({getEmail:()=>active}),getEffectiveUser:()=>({getEmail:()=>effective})},
    isAllowlisted_:email=>allowed.has(email),teacherScope_:email=>scopes.get(email)||{projects:null,classes:null},registryMap_:()=>({ibphysics:{subject:"Physics"},chemistry:{subject:"Chemistry"}}),
    SpreadsheetApp:{getActive:()=>({getSheetByName:name=>sheets.get(name)||null,insertSheet:name=>{if(!writable)throw Error("Viewer cannot edit workbook");const s=new Sheet(name);sheets.set(name,s);return s;}})},
    LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:key=>props.get(key)||null,setProperty:(key,value)=>props.set(key,value)})},
    Utilities:{getUuid:()=>crypto.randomUUID(),Charset:{UTF_8:"utf8"},DigestAlgorithm:{SHA_256:"sha256"},
      computeHmacSha256Signature:(text,key)=>Array.from(crypto.createHmac("sha256",key).update(text).digest()),
      computeDigest:(algorithm,text)=>Array.from(crypto.createHash("sha256").update(text).digest())},
    ContentService:{MimeType:{JSON:"application/json",JAVASCRIPT:"application/javascript"},createTextOutput:text=>({text,mime:null,setMimeType(value){this.mime=value;return this;}})}
  };
  ctx.UrlFetchApp={fetch:(url,options)=>{
    calls.push({url,options:clone(options)});if(relayHook)return relayHook(url,options);
    const was=writable;writable=true;let result;try{result=ctx.helpDoPost_(JSON.parse(options.payload));}finally{writable=was;}
    return{getResponseCode:()=>200,getContentText:()=>JSON.stringify(result)};
  }};
  vm.createContext(ctx);vm.runInContext(source,ctx,{filename:"Clarifications.gs"});ctx.TV_HELP_OWNER_URL="https://script.google.com/macros/s/owner-deployment/exec";
  return {ctx,sheets,props,calls,allowed,scopes,active:value=>{active=value;},writable:value=>{writable=value;},relay:hook=>{relayHook=hook;},
    post:raw=>clone(ctx.helpDoPost_(raw)),get:raw=>clone(ctx.helpDoGet_(raw)),inbox:()=>clone(ctx.tvHelpInbox()),publish:raw=>clone(ctx.tvHelpPublish(raw)),
    legacyPost:raw=>{
      const legacy=vm.createContext({...ctx});vm.runInContext(fs.readFileSync(path.join(__dirname,"../integration/teacher-clarifications/pupil-v1-before/Code.js"),"utf8"),legacy);
      return JSON.parse(legacy.doPost({postData:{contents:JSON.stringify(raw)}}).text);
    },count:name=>(sheets.get(name)?.rows.length||1)-1};
}
function request(extra={}){return{action:"ppq_help_request",request_id:crypto.randomUUID(),project:"ibphysics",item_id:"ibchem_part_1234",
  question:"My name is Alice. Why is the measured length shorter?",source_label:"Alice's private source label",source_url:"https://physicalsmithness.github.io/ibphysics/?topic=A.5&name=Alice#private",
  source_context:{source_part_id:"25M.P2.HL.TZ1.Q1(a)",question_images:["assets/question.png"],context_images:["https://physicalsmithness.github.io/ibphysics/assets/context.png"]},...extra};}
function publication(req,extra={}){return{request_id:req.request_id,question:"Why is the measured length shorter?",answer:"Compare measurements made in the two reference frames.",reviewed_public_question:true,...extra};}
const PUBLIC_KEYS=["id","request_id","project","item_id","question","answer","published_at","source_label","source_url"].sort();
check("a private request is accepted once and identical retries return its original status",()=>{
  const h=harness(),req=request();assert.deepStrictEqual(h.post(req),{ok:true,request_id:req.request_id,status:"pending"});
  assert.strictEqual(h.post(clone(req)).ok,true);assert.strictEqual(h.count("ppq_help_requests"),1);
  assert.strictEqual(h.post({...req,question:"Different"}).ok,false);assert.strictEqual(h.count("ppq_help_requests"),1);
  const inbox=h.inbox().requests[0];assert.strictEqual(inbox.question,req.question);assert.deepStrictEqual(inbox.source_context,req.source_context);assert.strictEqual(inbox.reply,null);
});
check("public list and status never return pending question text, names or source context",()=>{
  const h=harness(),req=request();h.post(req);
  assert.deepStrictEqual(h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id}),{ok:true,replies:[]});
  const status=h.get({action:"ppq_help_status",project:req.project,request_ids:req.request_id+","+crypto.randomUUID()});
  assert.deepStrictEqual(status.requests.map(x=>x.status),["pending","not_found"]);assert.deepStrictEqual(status.replies,[]);
  assert(!JSON.stringify(status).includes("Alice"));assert(!JSON.stringify(status).includes("source_context"));
});
check("request fields, source IDs, URLs, context and lengths are validated before storage",()=>{
  const bad=[{request_id:"guessable"},{project:"ppq_help_replies"},{project:"teachers"},{item_id:"<script>"},{question:""},{question:"x".repeat(4001)},
    {question:"control\u0000text"},{source_url:"javascript:alert(1)"},{source_url:"https://user:pass@example.test/x"},{source_context:{display_name:"Alice"}},
    {source_context:{question_images:["../private.png"]}},{source_context:{question_images:["data:image/png;base64,x"]}},{source_context:{question_images:Array(25).fill("a.png")}},
    {teacher:"owner@example.test"},{row_type:"teacher_reply"},{source_label:"x".repeat(401)}];
  for(const extra of bad){const h=harness();assert.strictEqual(h.post(request(extra)).ok,false,JSON.stringify(extra));assert.strictEqual(h.sheets.size,0);}
});
check("formula-like private text is stored as JSON text, never as a Sheet formula",()=>{
  const h=harness(),req=request({question:'=IMPORTXML("https://bad.test", "x")',source_label:"+private"});assert(h.post(req).ok);
  const rows=h.sheets.get("ppq_help_requests").rows,header=rows[0];assert(rows[1][header.indexOf("question_json")].startsWith('"='));
  assert.strictEqual(h.inbox().requests[0].question,req.question);assert.strictEqual(h.inbox().requests[0].source_label,req.source_label);
});
check("only active allowlisted teachers can read or publish and anonymous calls cannot create a secret",()=>{
  const h=harness(),req=request();h.post(req);h.active("");
  assert.throws(()=>h.inbox(),/authorised teacher/);assert.throws(()=>h.publish(publication(req)),/authorised teacher/);
  assert.throws(()=>h.ctx.helpSecretForTeacher_(),/authorised teacher/);assert.strictEqual(h.props.has("TV_HELP_RELAY_SECRET"),false);assert.strictEqual(h.props.has("TV_HELP_STORAGE_SECRET"),true);assert.strictEqual(h.calls.length,0);
  h.active("intruder@example.test");assert.throws(()=>h.inbox(),/authorised teacher/);
});
check("the anonymous channel is project-scoped including subject grants, independent of pupil class membership",()=>{
  const h=harness(),physics=request(),chem=request({project:"chemistry"});h.post(physics);h.post(chem);
  h.scopes.set("teacher@example.test",{projects:["physics"],classes:["a-different-class"]});
  assert.deepStrictEqual(h.inbox().requests.map(r=>r.project),["ibphysics"]);assert.throws(()=>h.publish(publication(chem)),/unavailable/);
  h.scopes.set("teacher@example.test",{projects:["ibphysics"]});assert.strictEqual(h.inbox().requests.length,1);
});
check("public wording requires explicit review but may retain an already appropriate question",()=>{
  const h=harness(),req=request({question:"Why is the measured length shorter?"});h.post(req);
  assert.throws(()=>h.publish(publication(req,{reviewed_public_question:false})),/Review the public/);
  assert.throws(()=>h.publish(publication(req,{reviewed_public_question:undefined})),/Review the public/);
  assert.throws(()=>h.publish(publication(req,{answer:""})),/required/);assert.strictEqual(h.calls.length,0);
  const result=h.publish(publication(req,{question:req.question}));assert.strictEqual(result.ok,true);assert.strictEqual(result.reply.question,req.question);
});
check("a view-only teacher publishes through the signed owner relay and public output is an exact whitelist",()=>{
  const h=harness(),req=request();h.post(req);h.writable(false);const result=h.publish(publication(req));
  assert.strictEqual(h.calls.length,1);const envelope=JSON.parse(h.calls[0].options.payload);
  assert.strictEqual(envelope.action,"ppq_help_publish");assert.strictEqual(envelope.payload.teacher,"teacher@example.test");assert.strictEqual(envelope.payload.reviewed_public_question,true);
  assert.match(envelope.signature,/^[0-9a-f]{64}$/);assert.strictEqual(h.count("ppq_help_replies"),1);
  const listed=h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id}).replies;assert.strictEqual(listed.length,1);
  assert.deepStrictEqual(Object.keys(listed[0]).sort(),PUBLIC_KEYS);assert(!JSON.stringify(listed).includes("Alice"));assert(!JSON.stringify(listed).includes("teacher@example.test"));
  assert.strictEqual(listed[0].source_url,"https://physicalsmithness.github.io/ibphysics/?topic=A.5");
  assert.strictEqual(listed[0].source_label,"ibphysics · ibchem_part_1234");assert.deepStrictEqual(listed[0],result.reply);
  const status=h.get({action:"ppq_help_status",project:req.project,request_ids:req.request_id});assert.strictEqual(status.requests[0].status,"answered");assert.deepStrictEqual(status.replies,listed);
});
check("publication retries are idempotent while only the latest revision remains public",()=>{
  const h=harness(),req=request();h.post(req);const first=h.publish(publication(req)),same=h.publish(publication(req));
  assert.strictEqual(same.reply.id,first.reply.id);assert.strictEqual(h.count("ppq_help_replies"),1);
  const revised=h.publish(publication(req,{answer:"A revised public explanation."}));assert.notStrictEqual(revised.reply.id,first.reply.id);
  assert.strictEqual(h.count("ppq_help_replies"),2);assert.strictEqual(h.inbox().requests[0].reply.id,revised.reply.id);
  assert.deepStrictEqual(h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id}).replies,[revised.reply]);
  assert.deepStrictEqual(h.get({action:"ppq_help_status",project:req.project,request_ids:req.request_id}).replies,[revised.reply]);
  const restored=h.publish(publication(req));assert.notStrictEqual(restored.reply.id,first.reply.id);assert.strictEqual(h.count("ppq_help_replies"),3);
  assert.deepStrictEqual(h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id}).replies,[restored.reply]);
  assert.strictEqual(h.inbox().requests[0].reply.id,restored.reply.id);
  assert.strictEqual(h.publish(publication(req)).reply.id,restored.reply.id);assert.strictEqual(h.count("ppq_help_replies"),3);
});
check("forged signatures and browser-supplied teacher identities never publish",()=>{
  const h=harness(),req=request();h.post(req);const payload={operation:"publish",timestamp:Date.now(),nonce:crypto.randomUUID(),teacher:"owner@example.test",...publication(req)};
  assert.strictEqual(h.post({action:"ppq_help_publish",payload,signature:"0".repeat(64)}).ok,false);assert.strictEqual(h.props.has("TV_HELP_RELAY_SECRET"),false);
  h.publish(publication(req));const env=JSON.parse(h.calls[0].options.payload);env.payload.answer="tampered";
  assert.strictEqual(h.post(env).ok,false);assert.strictEqual(h.count("ppq_help_replies"),1);
});
check("expired, future and replayed authorisations fail before appending any reply",()=>{
  const h=harness(),req=request();h.post(req);h.publish(publication(req));const original=JSON.parse(h.calls[0].options.payload);
  assert.match(h.post(original).error,/already been used/);
  const secret=h.props.get("TV_HELP_RELAY_SECRET");
  for(const offset of [-301000,31000]){const env=clone(original);env.payload.timestamp=Date.now()+offset;env.payload.nonce=crypto.randomUUID();env.signature=h.ctx.helpSignature_(env.payload,secret);
    assert.match(h.post(env).error,/Expired/);}
  assert.strictEqual(h.count("ppq_help_replies"),1);
});
check("owner receipt rechecks current allowlist and project scope after the teacher signed",()=>{
  const h=harness(),req=request();h.post(req);h.relay((url,options)=>{
    h.allowed.delete("teacher@example.test");const result=h.ctx.helpDoPost_(JSON.parse(options.payload));
    return{getResponseCode:()=>200,getContentText:()=>JSON.stringify(result)};
  });assert.throws(()=>h.publish(publication(req)),/unavailable/);assert.strictEqual(h.count("ppq_help_replies"),0);
  h.allowed.add("teacher@example.test");h.relay((url,options)=>{h.scopes.set("teacher@example.test",{projects:["chemistry"]});const result=h.ctx.helpDoPost_(JSON.parse(options.payload));return{getResponseCode:()=>200,getContentText:()=>JSON.stringify(result)};});
  assert.throws(()=>h.publish(publication(req)),/unavailable/);assert.strictEqual(h.count("ppq_help_replies"),0);
});
check("relay failures are explicit and leave pending requests without a published draft",()=>{
  const h=harness(),req=request();h.post(req);h.relay(()=>({getResponseCode:()=>500,getContentText:()=>"<html>error</html>"}));
  assert.throws(()=>h.publish(publication(req)),/unreadable response/);assert.strictEqual(h.count("ppq_help_replies"),0);
  assert.strictEqual(h.inbox().requests[0].status,"pending");
  h.ctx.TV_HELP_OWNER_URL="__OWNER_ENDPOINT__";assert.throws(()=>h.publish(publication(req)),/not been configured/);
});
check("public JSONP uses one strict callback identifier and never exposes teacher/private actions",()=>{
  const h=harness(),req=request();h.post(req);const params={action:"ppq_help_list",project:req.project,item_id:req.item_id,callback:"ppq_help_cb_123"};
  const ok=h.ctx.helpPublicGetOutput_(params);assert.strictEqual(ok.mime,"application/javascript");assert.strictEqual(ok.text,'ppq_help_cb_123({"ok":true,"replies":[]});');
  for(const callback of ["a.b","x);alert(1)//","for","a[0]","x".repeat(65)]){
    const result=h.ctx.helpPublicGetOutput_({...params,callback});assert.strictEqual(result.mime,"application/json");assert.strictEqual(JSON.parse(result.text).ok,false);
  }
  const privateAttempt=h.ctx.helpPublicGetOutput_({...params,action:"ppq_help_inbox"});assert(!privateAttempt.text.includes("Alice"));assert(privateAttempt.text.includes('"ok":false'));
  assert.strictEqual(h.ctx.helpPublicGetOutput_({action:"tvHelpInbox"}),null);
});
check("published text remains data in JSONP and malformed private storage cannot leak fragments",()=>{
  const h=harness(),req=request();h.post(req);h.publish(publication(req,{answer:"</script><script>alert(1)</script>"}));
  const output=h.ctx.helpPublicGetOutput_({action:"ppq_help_list",project:req.project,item_id:req.item_id,callback:"safe"});assert(!output.text.includes("<script>"));assert(output.text.includes("\\u003c"));
  const sheet=h.sheets.get("ppq_help_requests"),col=sheet.rows[0].indexOf("question_json");sheet.rows[1][col]="Alice private broken JSON";
  const status=h.get({action:"ppq_help_status",project:req.project,request_ids:req.request_id});assert.strictEqual(status.ok,true);assert.strictEqual(status.requests[0].status,"not_found");assert(!JSON.stringify(status).includes("Alice"));
});
check("public reads are isolated by project and source item and status IDs are bounded",()=>{
  const h=harness(),req=request();h.post(req);h.publish(publication(req));
  assert.deepStrictEqual(h.get({action:"ppq_help_list",project:"chemistry",item_id:req.item_id}).replies,[]);
  assert.deepStrictEqual(h.get({action:"ppq_help_list",project:req.project,item_id:"other"}).replies,[]);
  const other=h.get({action:"ppq_help_status",project:"chemistry",request_ids:req.request_id});assert.strictEqual(other.requests[0].status,"not_found");assert.deepStrictEqual(other.replies,[]);
  assert.strictEqual(h.get({action:"ppq_help_status",project:req.project,request_ids:Array(51).fill(req.request_id).join(',')}).ok,false);
});
check("the actual pinned pupil version 1 writer can append but cannot forge any trusted help record",()=>{
  const h=harness(),req=request();h.post(req);h.publish(publication(req));
  const beforeInbox=h.inbox(),beforePublic=h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id});
  for(const project of ["ppq_help_requests","ppq_help_replies","ppq_help_nonces"]){
    assert.strictEqual(h.legacyPost({project,timestamp:req.request_id,anonymous_id:"Alice",display_name:"=bad",cohort:"Private class",item_id:"Forged public text",extra_json:"malformed"}).ok,true);
  }
  assert.deepStrictEqual(h.inbox(),beforeInbox);assert.deepStrictEqual(h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id}),beforePublic);
  const env=JSON.parse(h.calls[0].options.payload);assert.match(h.post(env).error,/already been used/);
  assert.strictEqual(h.ctx.helpRows_(h.ctx.TV_HELP_NONCES_TAB,h.ctx.TV_HELP_NONCE_HEADERS).length,1);
  assert.strictEqual(h.get({action:"ppq_help_status",project:req.project,request_ids:req.request_id}).requests[0].status,"answered");
});
check("unsigned positional records, copied signatures and fake nonce collisions are ignored before parsing",()=>{
  const h=harness(),req=request();h.post(req);h.publish(publication(req));const replySheet=h.sheets.get("ppq_help_replies"),good=clone(replySheet.rows[1]);
  const altered=clone(good);altered[replySheet.rows[0].indexOf("answer_json")]='"Alice forged answer"';replySheet.appendRow(altered);
  const requests=h.sheets.get("ppq_help_requests");requests.appendRow([crypto.randomUUID(),req.project,req.item_id,"Alice broken JSON","", "", "",new Date().toISOString(),"0".repeat(64)]);
  assert.strictEqual(h.inbox().requests.length,1);assert(!JSON.stringify(h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id})).includes("Alice"));
  const env=JSON.parse(h.calls[0].options.payload);env.payload.nonce=crypto.randomUUID();env.payload.answer="New valid public answer";
  h.sheets.get("ppq_help_nonces").appendRow([env.payload.nonce,new Date().toISOString(),"fake","0".repeat(64)]);
  env.signature=h.ctx.helpSignature_(env.payload,h.props.get("TV_HELP_RELAY_SECRET"));assert.strictEqual(h.post(env).ok,true);
  assert.strictEqual(h.get({action:"ppq_help_list",project:req.project,item_id:req.item_id}).replies[0].answer,env.payload.answer);
  assert.notStrictEqual(h.props.get("TV_HELP_STORAGE_SECRET"),h.props.get("TV_HELP_RELAY_SECRET"));
});
check("legacy width pads blank headers without permitting a changed storage schema",()=>{
  const h=harness(),req=request();h.post(req);const sheet=h.sheets.get("ppq_help_requests");
  assert.strictEqual(h.legacyPost({project:"ppq_help_requests",item_id:"legacy"}).ok,true);
  assert(sheet.getDataRange().getValues()[0].length>h.ctx.TV_HELP_REQUEST_HEADERS.length);
  assert.strictEqual(h.inbox().requests.length,1);
  sheet.rows[0].push("unexpected_column");assert.throws(()=>h.inbox(),/headers do not match/);
  const oldSource=fs.readFileSync(path.join(__dirname,"../integration/teacher-clarifications/pupil-v1-before/Code.js"),"utf8");
  assert(!/function\s+tvGetRows\b/.test(oldSource));assert(!/function\s+tvHelpInbox\b/.test(oldSource));
});
console.log(checks+" clarification server security and publication checks passed");
