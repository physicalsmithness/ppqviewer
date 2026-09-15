/* Actual downloaded TeacherViewer code; all generation writes and Apps Script services are local mocks. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),vm=require("vm"),crypto=require("crypto");
const root=path.resolve(__dirname,".."),dir=path.join(root,"integration/teacher-clarifications");
const toolPath=path.join(root,"tools/prepare_teacher_clarifications.js");
const tool=fs.readFileSync(toolPath,"utf8"),read=p=>fs.readFileSync(p,"utf8").replace(/\r\n/g,"\n");
const sha=s=>crypto.createHash("sha256").update(s).digest("hex"),clone=v=>JSON.parse(JSON.stringify(v));
let checks=0;function check(name,run){run();checks++;console.log("ok "+name);}
function generate(endpoint="https://script.google.com/macros/s/synthetic-owner/exec",mode="teacher",overrides=new Map()){
  const writes=new Map(),reads=new Map(),directories=[];
  const fakeFs={readFileSync(p,encoding){const absolute=path.resolve(p),value=overrides.has(absolute)?(encoding?String(overrides.get(absolute)):Buffer.from(overrides.get(absolute))):fs.readFileSync(absolute,encoding);reads.set(absolute,sha(value));return value;},
    mkdirSync(p){directories.push(path.resolve(p));},writeFileSync(p,data){writes.set(path.resolve(p),String(data));}};
  const ctx={__dirname:path.dirname(toolPath),process:{argv:["node",toolPath,endpoint,mode]},console:{log(){}},
    require(name){if(name==="fs")return fakeFs;if(name==="path")return path;if(name==="crypto")return crypto;throw Error("Unexpected capability in staging helper: "+name);}};
  vm.runInNewContext(tool,ctx,{filename:toolPath});
  return {writes,reads,directories,get:name=>writes.get(path.join(dir,name))};
}
function harness(source){
  let active="",effectiveCalls=0,htmlCalls=0;const readSheets=[];
  const values=new Map([["teachers",[["email"],["teacher@example.test"],["owner@example.test"]]],
    ["physics",[["project","item_id","correct"],["physics","Q7",true]]]]);
  for(const name of ["ppq_help_requests","ppq_help_replies","ppq_help_nonces"])values.set(name,[["private"],["NEVER RETURN THIS"]]);
  const ctx={console,Date,Number,Session:{getActiveUser:()=>({getEmail:()=>active}),getEffectiveUser:()=>{effectiveCalls++;return{getEmail:()=>"owner@example.test"};}},
    SpreadsheetApp:{getActive:()=>({getSheetByName(name){readSheets.push(name);return values.has(name)?{getDataRange:()=>({getValues:()=>clone(values.get(name))})}:null;}})},
    ContentService:{MimeType:{TEXT:"text/plain",JSON:"application/json",JAVASCRIPT:"application/javascript"},createTextOutput:text=>({text,setMimeType(mime){this.mime=mime;return this;}})},
    HtmlService:{createHtmlOutputFromFile(name){htmlCalls++;return{file:name,setTitle(title){this.title=title;return this;}};},createHtmlOutput(text){htmlCalls++;return{text,setTitle(title){this.title=title;return this;}};}}};
  vm.createContext(ctx);vm.runInContext(source,ctx,{filename:"generated-staged-Code.js"});
  return{ctx,readSheets,active:value=>{active=value;},effectiveCalls:()=>effectiveCalls,htmlCalls:()=>htmlCalls};
}
const teacher=generate(),owner=generate(undefined,"owner"),code=teacher.get("staged/Code.js");
check("generation uses the complete downloaded live baseline and keeps proposed canonical work separate",()=>{
  const receipt=JSON.parse(teacher.get("staging-receipt.json")),stage=receipt.receipts.find(r=>r.target==="staged");
  assert.strictEqual(path.resolve(stage.sourceCode),path.join(dir,"remote-before/Code.js"));assert.strictEqual(path.resolve(stage.sourceHtml),path.join(dir,"remote-before/teacherviewer.html"));
  assert.strictEqual(stage.sourceCodeSha256,sha(read(stage.sourceCode)));assert.strictEqual(stage.codeSha256,sha(code));
  const addition="<!-- PPQ TEACHER CLARIFICATIONS PANEL BEGIN -->\n<script>\n"+read(path.join(dir,"teacher-panel.js")).trimEnd()+"\n</script>\n<!-- PPQ TEACHER CLARIFICATIONS PANEL END -->\n</body>";
  assert.strictEqual(sha(teacher.get("staged/teacherviewer.html").replace(addition,"</body>")),sha(read(stage.sourceHtml)),"unrelated live HTML unchanged");
  assert(!teacher.get("staged/teacherviewer.html").includes('data-tab="records"'));assert(teacher.get("canonical-proposed/teacherviewer.html"));
  assert.strictEqual((code.match(/function tvHelpInbox\(/g)||[]).length,1);
});
check("anonymous visitors with an effective owner cannot render the teacher page or read attempts",()=>{
  const h=harness(code),response=h.ctx.doGet({parameter:{}});
  assert.strictEqual(response.mime,"text/plain");assert.match(response.text,/endpoint is live/);assert.strictEqual(h.htmlCalls(),0);
  assert.throws(()=>h.ctx.tvGetRows("physics",null),/not authorised/);assert.throws(()=>h.ctx.tvHelpInbox(),/authorised teacher/);
  assert.strictEqual(h.effectiveCalls(),0);assert(!h.readSheets.includes("physics"));
});
check("an authorised teacher keeps normal coverage reads but cannot use them to bypass the clarification queue",()=>{
  const h=harness(code);h.active("teacher@example.test");assert.strictEqual(h.ctx.doGet({parameter:{}}).file,"teacherviewer");
  assert.deepStrictEqual(clone(h.ctx.tvGetRows("physics",null)),[{project:"physics",item_id:"Q7",correct:true}]);
  for(const name of ["ppq_help_requests","ppq_help_replies","ppq_help_nonces"]){
    for(const supplied of [name,name.toUpperCase(),name.replace(/_/g,"/"),name.replace("ppq_help_","ppq_help/"),name.replace("ppq_help_","ppq_help:")])assert.throws(()=>h.ctx.tvGetRows(supplied,null),/authorised clarification queue/,supplied);
    assert(!h.readSheets.includes(name));
  }
  assert.strictEqual(h.effectiveCalls(),0);
});
check("a signed-in unlisted account cannot read the viewer, generic rows or private questions",()=>{
  const h=harness(code);h.active("outsider@example.test");const page=h.ctx.doGet({parameter:{}});
  assert(!page.file);assert.match(page.title,/not authorised/);assert.throws(()=>h.ctx.tvGetRows("physics"),/not authorised/);assert.throws(()=>h.ctx.tvHelpInbox(),/authorised teacher/);
});
check("teacher and dedicated public owner manifests have the exact distinct execution roles",()=>{
  for(const [output,role]of [[teacher,{executeAs:"USER_ACCESSING",access:"ANYONE"}],[owner,{executeAs:"USER_DEPLOYING",access:"ANYONE_ANONYMOUS"}]]){
    const manifest=JSON.parse(output.get("staged/appsscript.json"));assert.deepStrictEqual(manifest.webapp,role);
    assert.deepStrictEqual(manifest.oauthScopes,["https://www.googleapis.com/auth/spreadsheets.currentonly","https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/script.external_request"]);
    const baseline=JSON.parse(read(path.join(dir,"remote-before/appsscript.json")));delete baseline.oauthScopes;delete baseline.webapp;
    const rest={...manifest};delete rest.oauthScopes;delete rest.webapp;assert.deepStrictEqual(rest,baseline);
    assert.deepStrictEqual(JSON.parse(output.get("canonical-proposed/appsscript.json")).webapp,{executeAs:"USER_ACCESSING",access:"ANYONE"});
  }
  assert.strictEqual(owner.get("staged/Code.js"),code);
});
check("the pinned original pupil version has no callable teacher reader or teacher HTML",()=>{
  const pupil=read(path.join(dir,"pupil-v1-before/Code.js")),h=harness(pupil);
  for(const fn of ["tvGetRows","tvListProjects","tvGetRoster","tvGetClasses","tvHelpInbox","tvHelpPublish","signedInEmail_"])assert.strictEqual(typeof h.ctx[fn],"undefined",fn);
  assert(!/HtmlService|createHtmlOutput/.test(pupil));assert.match(h.ctx.doGet().text,/endpoint is live/);assert.strictEqual(h.htmlCalls(),0);
  assert.deepStrictEqual(JSON.parse(read(path.join(dir,"pupil-v1-before/appsscript.json"))).webapp,{executeAs:"USER_DEPLOYING",access:"ANYONE_ANONYMOUS"});
});
check("the preparation helper has only isolated local outputs and cannot change the old pupil deployment or inputs",()=>{
  const allowed=new Set(["staged/Code.js","staged/teacherviewer.html","staged/appsscript.json","staged/.clasp.json","canonical-proposed/Code.js","canonical-proposed/teacherviewer.html","canonical-proposed/appsscript.json","staging-receipt.json"].map(p=>path.join(dir,p)));
  for(const output of [teacher,owner]){
    assert.deepStrictEqual(new Set(output.writes.keys()),allowed);
    assert.deepStrictEqual(output.directories,[path.join(dir,"staged"),path.join(dir,"canonical-proposed")]);
    for(const [file,digest]of output.reads)assert.strictEqual(sha(fs.readFileSync(file)),digest,file+" unchanged");
    assert(![...output.writes.keys()].some(p=>/pupil-v1-before|remote-before/.test(p)));
  }
});
check("invalid role and non-Apps-Script owner addresses are rejected before staging",()=>{
  assert.throws(()=>generate("https://example.test/exec"),/Invalid endpoint/);assert.throws(()=>generate(undefined,"pupil"),/Invalid deployment role/);
});
const canonicalCode=path.resolve("C:/Claude (not on Gdrive, nor OneDrive)/TeacherViewer/shared_script/teacher-tracking.gs"),canonicalHtml=path.resolve("C:/Claude (not on Gdrive, nor OneDrive)/TeacherViewer/app/teacherviewer.html");
const installedOverrides=()=>new Map([[canonicalCode,teacher.get("canonical-proposed/Code.js")],[canonicalHtml,teacher.get("canonical-proposed/teacherviewer.html")]]);
check("repeated generation after canonical installation is byte-stable with one module, panel and guard set",()=>{
  const again=generate(undefined,"teacher",installedOverrides()),third=generate(undefined,"teacher",new Map([[canonicalCode,again.get("canonical-proposed/Code.js")],[canonicalHtml,again.get("canonical-proposed/teacherviewer.html")]]));
  for(const name of ["staged/Code.js","staged/teacherviewer.html","canonical-proposed/Code.js","canonical-proposed/teacherviewer.html"]){assert.strictEqual(sha(again.get(name)),sha(teacher.get(name)),name);assert.strictEqual(sha(third.get(name)),sha(teacher.get(name)),name);}
  const result=again.get("canonical-proposed/Code.js");for(const token of ["function tvHelpInbox(","ppq_help_requests: true","var help = helpDoPost_(","var help = helpPublicGetOutput_(","Use the authorised clarification queue."])assert.strictEqual(result.split(token).length-1,1,token);
  assert.strictEqual(again.get("canonical-proposed/teacherviewer.html").split("/* Optional TeacherViewer extension.").length-1,1);
  const h=harness(result);assert.strictEqual(h.ctx.doGet({parameter:{}}).mime,"text/plain");assert.throws(()=>h.ctx.tvGetRows("physics"),/not authorised/);h.active("teacher@example.test");assert.throws(()=>h.ctx.tvGetRows("ppq/help/requests"),/authorised clarification queue/);
});
check("installed bounded modules are replaced by refreshed source and endpoint, never appended twice",()=>{
  const overrides=installedOverrides();overrides.set(path.join(dir,"Clarifications.gs"),read(path.join(dir,"Clarifications.gs"))+"\n// SYNTHETIC_REFRESHED_MODULE\n");overrides.set(path.join(dir,"teacher-panel.js"),read(path.join(dir,"teacher-panel.js"))+"\n// SYNTHETIC_REFRESHED_PANEL\n");
  const refreshed=generate("https://script.google.com/macros/s/updated-owner/exec","teacher",overrides);
  for(const target of ["staged","canonical-proposed"]){const server=refreshed.get(target+"/Code.js"),html=refreshed.get(target+"/teacherviewer.html");assert(server.includes("SYNTHETIC_REFRESHED_MODULE"));assert(server.includes("/updated-owner/exec"));assert(!server.includes("/synthetic-owner/exec"));assert.strictEqual(server.split("function tvHelpInbox(").length-1,1);assert(html.includes("SYNTHETIC_REFRESHED_PANEL"));assert.strictEqual(html.split("/* Optional TeacherViewer extension.").length-1,1);}
});
check("unknown legacy edits, malformed markers and changed routing forms still fail closed",()=>{
  let overrides=installedOverrides();overrides.set(canonicalCode,overrides.get(canonicalCode).replace("function doGet(e) {","function doGet(options) {"));assert.throws(()=>generate(undefined,"teacher",overrides),/Source changed/);
  overrides=installedOverrides();overrides.set(canonicalHtml,overrides.get(canonicalHtml)+"\n<!-- PPQ TEACHER CLARIFICATIONS PANEL BEGIN -->");assert.throws(()=>generate(undefined,"teacher",overrides),/Ambiguous/);
  overrides=new Map([[canonicalCode,read(canonicalCode)+"\n// unexpected code after legacy module\n"]]);assert.throws(()=>generate(undefined,"teacher",overrides),/Unknown unmarked|Unexpected source after/);
});
const saved=path.join(dir,"staged/Code.js");
const receiptPath=path.join(dir,"staging-receipt.json");
if(fs.existsSync(saved)&&fs.existsSync(receiptPath)){
  const savedReceipt=JSON.parse(read(receiptPath)),current=generate(savedReceipt.endpoint,savedReceipt.mode);
  if(sha(read(saved))!==sha(current.get("staged/Code.js")))console.log("note saved staged Code.js differs from current generator output for its recorded endpoint/role; regenerate after module freeze");
}
console.log(checks+" TeacherViewer staging security integration checks passed (no live calls or filesystem writes)");
