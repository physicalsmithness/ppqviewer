"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),{execFileSync}=require("child_process"),vm=require("vm");
const ROOT=path.resolve(__dirname,".."),deploy=path.join(ROOT,"deploy/ibphysicsppqs");
const base="https://physicalsmithness.github.io/ibphysicsppqs/";
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
async function main(){
 const latest=JSON.parse(fs.readFileSync(path.join(ROOT,"dist/ibphysics-release/latest.json")));
 const commit=execFileSync("git",["rev-parse","HEAD"],{cwd:deploy,encoding:"utf8"}).trim();
 const files=["index.html","data/physics_catalogue.js","engine/ppqviewer.js","engine/ppqviewer.css","physics-config.js","physics-identity.js","physics-login.js","physics-reporting.js","build-info.json"];
 const verified=await Promise.all(files.map(async file=>{
  const response=await fetch(base+file,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(file+" returned "+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  const expected=execFileSync("git",["show","HEAD:"+file],{cwd:deploy,maxBuffer:16*1024*1024});
  if(sha(bytes)!==sha(expected))throw Error("Public file differs from the published commit: "+file);
  return {file,sha256:sha(bytes),bytes};
 }));
 const info=JSON.parse(verified.find(f=>f.file==="build-info.json").bytes);
 if(info.build_id!==latest.build_id || info.parts!==latest.parts)throw Error("The public build is not the current reviewed release");
 const box={window:{}};vm.runInNewContext(verified.find(f=>f.file==="data/physics_catalogue.js").bytes.toString("utf8"),box);
 const samples=(info.topics || Object.keys(box.window.PHYSICS_META.topics)).map(topic=>{
  const question=box.window.PHYSICS_QUESTIONS.find(q=>q.topic_codes.includes(topic));
  if(!question)throw Error("Published topic has no questions: "+topic);
  return question;
 });
 const repaired=box.window.PHYSICS_QUESTIONS.find(q=>q.id==="25M.P2.HL.TZ1.Q7(b_i)");
 for(const file of new Set([...samples.flatMap(q=>[...q.question_images,...q.markscheme_images]),...(repaired?.markscheme_images||[])])){
  const response=await fetch(base+file,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error("Public crop unavailable: "+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  if(sha(bytes)!==path.basename(file,".png"))throw Error("Public crop hash differs");
  verified.push({file,sha256:sha(bytes)});
 }
 const report={checked_at:new Date().toISOString(),url:base,commit,build_id:info.build_id,parts:info.parts,
  topic_counts:info.topic_counts,groups:Object.values(info.groups).filter(n=>n>0).length,verified_files:verified.map(({file,sha256})=>({file,sha256})),result:"PASS"};
 fs.writeFileSync(path.join(ROOT,"dist/physics-audit/ib-a5-live-verification.json"),JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify(report,null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
