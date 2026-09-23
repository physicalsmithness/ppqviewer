"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),os=require("os"),crypto=require("crypto"),{execFileSync}=require("child_process");
const {stage,parseArgs,FIXED}=require("../tools/stage_ibphysics_release");
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex"),OLD="1111111111111111",NEW="2222222222222222";
let checks=0;
function test(name,run){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"ppq-stage-release-")),repo=path.join(root,"deploy/ibphysicsppqs"),buildRoot=path.join(root,"dist/ibphysics-release");
  const write=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,value);};
  const git=args=>execFileSync("git",args,{cwd:repo,encoding:"utf8",stdio:["ignore","pipe","pipe"]}).trim();
  try{
    fs.mkdirSync(repo,{recursive:true});git(["init","--initial-branch=main"]);git(["config","user.name","Release fixture"]);git(["config","user.email","fixture@example.invalid"]);git(["config","core.autocrlf","false"]);
    git(["remote","add","origin","https://github.com/physicalsmithness/ibphysicsppqs.git"]);
    const source=path.join(root,"source.txt");write(source,"reviewed source\n");
    const record={schema_version:1,review_complete:true,unresolved_relevant_items:[],fingerprints:[{path:source,sha256:sha(fs.readFileSync(source))}]};
    const clearance=path.join(root,"clearance.json"),additional=path.join(root,"additional.json");write(clearance,JSON.stringify(record));write(additional,JSON.stringify(record));
    function build(id,assetText){
      const directory=path.join(buildRoot,id+"-1"),content=new Map(FIXED.map(file=>[file,file===".nojekyll"?"":file+" "+id+"\n"]));
      content.set("build-info.json",JSON.stringify({build_id:id}));
      const asset=Buffer.concat([Buffer.from([0x89,0x50,0x4e,0x47,13,10,26,10,0]),Buffer.from(assetText)]),assetPath="assets/"+sha(asset)+".png";content.set(assetPath,asset);
      for(const [file,bytes]of content)write(path.join(directory,file),bytes);
      return {id,directory,content,assetPath};
    }
    const baseline=build("0000000000000000","baseline"),old=build(OLD,"old staged asset"),next=build(NEW,"new checked asset");
    for(const[file,bytes]of baseline.content)write(path.join(repo,file),bytes);
    git(["add","--all"]);git(["commit","-m","Fixture baseline"]);const expected=git(["rev-parse","HEAD"]);git(["update-ref","refs/remotes/origin/main",expected]);
    const latestFor=build=>({build_id:build.id,root:build.directory,clearance:{path:clearance,sha256:sha(fs.readFileSync(clearance))},topic_clearance:{path:clearance,sha256:sha(fs.readFileSync(clearance))},
      additional_clearances:[{path:additional,sha256:sha(fs.readFileSync(additional))}],shared_files:[{path:"source.txt",sha256:sha(fs.readFileSync(source))}]});
    const latestPath=path.join(buildRoot,"latest.json");write(latestPath,JSON.stringify(latestFor(old)));
    const first=stage({root,expected});assert.equal(first.build_id,OLD);assert.equal(first.removed_obsolete_assets,1);
    write(latestPath,JSON.stringify(latestFor(next)));
    const walk=(dir=repo)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.name===".git"?[]:entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
    const snapshot=()=>JSON.stringify({index:git(["ls-files","--stage","-z"]),files:walk().sort().map(file=>[path.relative(repo,file),sha(fs.readFileSync(file))])});
    const reject=(mutate,pattern)=>{mutate();const before=snapshot();assert.throws(()=>stage({root,expected,replaceStagedBuild:OLD}),pattern);assert.equal(snapshot(),before,"Rejected stage mutated the checkout or index");};
    run({root,repo,source,clearance,additional,old,next,expected,git,write,latestPath,latestFor,snapshot,reject,stage:options=>stage({root,expected,replaceStagedBuild:OLD,...options})});
    checks++;console.log("PASS "+name);
  }finally{
    const resolved=path.resolve(root),base=path.resolve(os.tmpdir());
    assert(resolved.startsWith(base+path.sep+"ppq-stage-release-")&&fs.realpathSync(root)===resolved);
    fs.rmSync(resolved,{recursive:true,force:true});
  }
}
test("explicit replacement changes only the checked staged package and stale tracked assets",f=>{
  const result=f.stage();assert.equal(result.replaced_staged_build,OLD);assert.equal(result.build_id,NEW);assert.equal(result.removed_obsolete_assets,1);
  assert.equal(f.git(["rev-parse","HEAD"]),f.expected);assert.equal(f.git(["rev-parse","origin/main"]),f.expected);
  for(const[file,bytes]of f.next.content)assert(fs.readFileSync(path.join(f.repo,file)).equals(Buffer.from(bytes)));
  assert(!fs.existsSync(path.join(f.repo,f.old.assetPath)));assert.equal(f.git(["diff","--name-only"]),"");
});
test("dirty staging still requires the explicit replacement option",f=>{
  const before=f.snapshot();assert.throws(()=>stage({root:f.root,expected:f.expected}),/not clean/);assert.equal(f.snapshot(),before);
  assert.deepEqual(parseArgs([f.expected,"--replace-staged-build",OLD]),{expected:f.expected,replaceStagedBuild:OLD});
  assert.throws(()=>parseArgs([f.expected,"--force"]),/Usage/);
});
test("an unstaged edit cannot be overwritten by replacement",f=>f.reject(()=>f.write(path.join(f.repo,"index.html"),"teacher edit"),/worktree content differs/));
test("an index-only edit is rejected even when worktree bytes match the old build",f=>f.reject(()=>{
  f.write(path.join(f.repo,"index.html"),"index edit");f.git(["add","index.html"]);f.write(path.join(f.repo,"index.html"),f.old.content.get("index.html"));
},/index content differs/));
test("untracked and ignored files stop replacement without removal",f=>f.reject(()=>{
  f.write(path.join(f.repo,".git/info/exclude"),"private-note.txt\n");f.write(path.join(f.repo,"private-note.txt"),"private note");
},/untracked files/));
test("unrelated tracked additions cannot be staged or deleted",f=>f.reject(()=>{
  f.write(path.join(f.repo,"teacher-notes.txt"),"teacher notes");f.git(["add","teacher-notes.txt"]);
},/index file set differs/));
test("a removed staged asset makes the old package verification fail",f=>f.reject(()=>{
  fs.unlinkSync(path.join(f.repo,f.old.assetPath));f.git(["add","--all","assets"]);
},/index file set differs/));
test("additional D2 source fingerprints are verified before copying",f=>f.reject(()=>{
  const other=path.join(f.root,"d2-source.txt");f.write(other,"reviewed D2");
  f.write(f.additional,JSON.stringify({schema_version:1,review_complete:true,fingerprints:[{path:other,sha256:sha(Buffer.from("reviewed D2"))}]}));
  f.write(f.latestPath,JSON.stringify(f.latestFor(f.next)));f.write(other,"changed D2");
},/Reviewed source changed/));
test("a wrapped or incomplete additional clearance cannot pass staging",f=>f.reject(()=>{
  f.write(f.additional,JSON.stringify({clearance:{schema_version:1,review_complete:true,fingerprints:[]}}));f.write(f.latestPath,JSON.stringify(f.latestFor(f.next)));
},/top-level clearance/));
test("hidden index flags cannot conceal deployment changes",f=>f.reject(()=>f.git(["update-index","--assume-unchanged","index.html"]),/hidden assume-unchanged/));
test("unknown or ambiguous old build identities do not authorize replacement",f=>{
  const before=f.snapshot();assert.throws(()=>f.stage({replaceStagedBuild:"3333333333333333"}),/missing or ambiguous/);assert.equal(f.snapshot(),before);
  const second=path.join(path.dirname(f.old.directory),OLD+"-2");fs.mkdirSync(second);assert.throws(()=>f.stage(),/missing or ambiguous/);assert.equal(f.snapshot(),before);
});
test("baseline drift and modified old generated assets fail before deployment writes",f=>{
  const before=f.snapshot();assert.throws(()=>f.stage({expected:"f".repeat(40)}),/baseline changed/);assert.equal(f.snapshot(),before);
  f.write(path.join(f.old.directory,f.old.assetPath),"corrupted source asset");assert.throws(()=>f.stage(),/image hash mismatch/);assert.equal(f.snapshot(),before);
});
function mixedText(f,autocrlf="true"){
  f.git(["config","core.autocrlf",autocrlf]);
  for(const file of ["engine/ppqviewer.css","physics-config.js"]){
    for(const build of [f.old,f.next]){
      const bytes=Buffer.from(file+" "+build.id+"\r\nsecond line\nthird line\r\n");
      build.content.set(file,bytes);f.write(path.join(build.directory,file),bytes);
      if(build===f.old)f.write(path.join(f.repo,file),bytes);
    }
    f.git(["add","--",file]);
  }
}
test("declared autocrlf normalization accepts the exact mixed-ending package and keeps binary assets raw",f=>{
  mixedText(f);
  const oldIndex=execFileSync("git",["show",":engine/ppqviewer.css"],{cwd:f.repo});
  assert(oldIndex.equals(Buffer.from(f.old.content.get("engine/ppqviewer.css").toString().replace(/\r\n/g,"\n"))));
  assert(!oldIndex.equals(f.old.content.get("engine/ppqviewer.css")));
  const result=f.stage();assert.equal(result.build_id,NEW);
  for(const[file,bytes]of f.next.content)assert(fs.readFileSync(path.join(f.repo,file)).equals(Buffer.from(bytes)),"The raw worktree must remain byte-exact");
  for(const file of ["engine/ppqviewer.css","physics-config.js"]){
    const staged=execFileSync("git",["show",":"+file],{cwd:f.repo});assert(staged.equals(Buffer.from(f.next.content.get(file).toString().replace(/\r\n/g,"\n"))));
  }
  assert(execFileSync("git",["show",":"+f.next.assetPath],{cwd:f.repo}).equals(f.next.content.get(f.next.assetPath)));
});
test("explicit Git text and eol attributes use the same canonical index check",f=>{
  f.write(path.join(f.repo,".git/info/attributes"),"engine/ppqviewer.css text eol=lf\nphysics-config.js text eol=lf\n");
  mixedText(f,"false");assert.equal(f.stage().build_id,NEW);
  assert(fs.readFileSync(path.join(f.repo,"engine/ppqviewer.css")).equals(f.next.content.get("engine/ppqviewer.css")));
});
test("normalization does not permit a genuine staged edit with restored generated worktree bytes",f=>{
  mixedText(f);f.reject(()=>{const file="engine/ppqviewer.css";f.write(path.join(f.repo,file),"different staged content\r\n");f.git(["add","--",file]);f.write(path.join(f.repo,file),f.old.content.get(file));},/index content differs/);
});
test("even a raw newline-only worktree edit is rejected when the normalized index still matches",f=>{
  mixedText(f);f.reject(()=>{const file="engine/ppqviewer.css";f.write(path.join(f.repo,file),f.old.content.get(file).toString().replace(/\r\n/g,"\n"));},/worktree content differs/);
});
test("without declared text conversion a normalized index cannot substitute for raw generated bytes",f=>{
  mixedText(f,"false");f.reject(()=>{const file="engine/ppqviewer.css";f.write(path.join(f.repo,file),f.old.content.get(file).toString().replace(/\r\n/g,"\n"));f.git(["add","--",file]);f.write(path.join(f.repo,file),f.old.content.get(file));},/index content differs/);
});
test("clean filters, encoding, ident and binary text conversion are refused before copying",f=>{
  for(const [rule,pattern]of [["engine/ppqviewer.css filter=unreviewed",/Unexpected Git filter/],["engine/ppqviewer.css working-tree-encoding=UTF-16LE",/Unexpected Git working-tree-encoding/],["engine/ppqviewer.css ident",/Unexpected Git ident/],["assets/*.png text eol=lf",/binary public asset/]]){
    f.reject(()=>f.write(path.join(f.repo,".git/info/attributes"),rule+"\n"),pattern);
  }
});
test("an unfinished evidence promotion blocks staging without changing the checkout",f=>{
  f.reject(()=>f.write(path.join(f.root,"reports/ib-evidence-promotion.pending.json"),"{}\n"),/Evidence promotion is incomplete/);
});
console.log(`${checks} isolated release staging checks passed; no real deployment was touched.`);
