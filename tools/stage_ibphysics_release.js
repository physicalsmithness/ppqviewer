"use strict";
// Stage a reviewed generated site in the existing deployment repository.
// No push, source-corpus writes, recursive deletion or untracked-file removal.
const fs=require("fs"),path=require("path"),crypto=require("crypto"),{execFileSync}=require("child_process");
const ROOT=path.resolve(__dirname,".."),ORIGIN="https://github.com/physicalsmithness/ibphysicsppqs.git";
const FIXED=[".nojekyll","build-info.json","data/physics_catalogue.js","engine/ppqviewer.css","engine/ppqviewer.js","index.html","physics-config.js","physics-identity.js","physics-login.js","physics-reporting.js"];
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
function within(root,file){const rel=path.relative(root,file);return rel&&!rel.startsWith("..")&&!path.isAbsolute(rel);}
function walk(root,directory=root,omitGit=false){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  if(omitGit&&directory===root&&entry.name===".git")return [];
  ensure(!entry.isSymbolicLink(),"Linked files are not permitted in a public package or deployment checkout");
  const file=path.join(directory,entry.name);
  ensure(entry.isDirectory()||entry.isFile(),"Only ordinary files and directories are permitted");
  return entry.isDirectory()?walk(root,file,omitGit):[path.relative(root,file).replace(/\\/g,"/")];
});}
function generatedBuild(buildRoot,source,expectedId){
  source=path.resolve(source);
  ensure(within(buildRoot,source)&&fs.realpathSync(source)===source,"Release root is outside the build directory or is linked");
  const files=walk(source).sort(),info=JSON.parse(fs.readFileSync(path.join(source,"build-info.json")));
  ensure(/^[a-f0-9]{16}$/.test(expectedId||"")&&info.build_id===expectedId,"Release pointer does not match its build");
  ensure(FIXED.every(file=>files.includes(file))&&files.every(file=>FIXED.includes(file)||/^assets\/[a-f0-9]{64}\.png$/.test(file)),"Unexpected public file set");
  const content=new Map(files.map(file=>[file,fs.readFileSync(path.join(source,file))]));
  for(const file of files.filter(file=>file.startsWith("assets/")))ensure(sha(content.get(file))===path.basename(file,".png"),"Public image hash mismatch");
  return {source,files,content,info};
}
function stage(options={}){
  const root=path.resolve(options.root||ROOT),repo=path.join(root,"deploy/ibphysicsppqs"),buildRoot=path.join(root,"dist/ibphysics-release");
  const expected=options.expected,replace=options.replaceStagedBuild;
  const git=(args,input)=>execFileSync("git",args,{cwd:repo,input,encoding:"utf8",maxBuffer:16*1024*1024}).trim();
  ensure(/^[a-f0-9]{40}$/.test(expected||""),"Pass the reviewed deployment baseline commit");
  ensure(replace===undefined||/^[a-f0-9]{16}$/.test(replace),"The staged replacement ID must be an exact generated build ID");
  ensure(fs.realpathSync(repo)===repo,"Deployment path must resolve to the named local repository");
  ensure(git(["remote","get-url","origin"])===ORIGIN,"Unexpected deployment origin");
  ensure(git(["branch","--show-current"])==="main"&&git(["rev-parse","HEAD"])===expected&&git(["rev-parse","origin/main"])===expected,"Deployment baseline changed");
  if(!replace)ensure(!git(["status","--porcelain"]),"Deployment checkout is not clean; replacement requires --replace-staged-build");
  const latest=JSON.parse(fs.readFileSync(path.join(buildRoot,"latest.json")));
  const next=generatedBuild(buildRoot,latest.root,latest.build_id);
  ensure(!replace||replace!==latest.build_id,"The replacement must name a different checked build");
  ensure(!latest.additional_clearances||Array.isArray(latest.additional_clearances),"Additional release clearances must be an array");
  for(const clearance of [latest.clearance,latest.topic_clearance,...(latest.additional_clearances||[])]){
    ensure(clearance&&sha(fs.readFileSync(clearance.path))===clearance.sha256,"Release clearance changed after assembly");
    const record=JSON.parse(fs.readFileSync(clearance.path));
    ensure(record.schema_version===1&&record.review_complete===true&&Array.isArray(record.fingerprints)&&record.fingerprints.length,"Release clearance is incomplete or not a top-level clearance record");
    ensure(!record.unresolved_relevant_items?.length,"Release clearance contains unresolved relevant items");
    for(const file of record.fingerprints)ensure(sha(fs.readFileSync(file.path))===file.sha256,"Reviewed source changed before staging: "+file.path);
  }
  ensure(Array.isArray(latest.shared_files)&&latest.shared_files.length,"Shared viewer source fingerprints are missing");
  for(const file of latest.shared_files){
    const filename=path.resolve(root,file.path);ensure(within(root,filename),"Shared source path escapes the workspace");
    ensure(sha(fs.readFileSync(filename))===file.sha256,"Shared viewer source changed after assembly: "+file.path);
  }
  const index=git(["ls-files","--stage","-z"]).split("\0").filter(Boolean).map(line=>{
    const match=/^(\d+) ([a-f0-9]+) (\d)\t(.+)$/.exec(line);ensure(match&&match[3]==="0","Deployment index contains unresolved entries");
    ensure(match[1]==="100644","Deployment index contains an unexpected file mode");
    return {mode:match[1],oid:match[2],file:match[4]};
  });
  ensure(git(["ls-files","-v","-z"]).split("\0").filter(Boolean).every(line=>line.startsWith("H ")),"Deployment index contains hidden assume-unchanged or skip-worktree flags");
  const tracked=index.map(entry=>entry.file),worktree=walk(repo,repo,true).sort();
  ensure(same(worktree,tracked),"Deployment checkout has missing, ignored or untracked files");
  let previous=null;
  const objectFormat=git(["rev-parse","--show-object-format"]);
  ensure(["sha1","sha256"].includes(objectFormat),"Unknown Git object hash format");
  const blobHash=bytes=>crypto.createHash(objectFormat).update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest("hex");
  function canonicalIndexHashes(build){
    const attributes=["text","eol","crlf","filter","working-tree-encoding","ident"];
    const output=git(["check-attr","-z",...attributes,"--stdin"],Buffer.from(build.files.join("\0")+"\0"));
    const fields=output.split("\0");ensure(fields.pop()===""&&fields.length===build.files.length*attributes.length*3,"Git did not return exact public-file attributes");
    const declared=new Map(build.files.map(file=>[file,new Map()]));
    for(let i=0;i<fields.length;i+=3){
      const [file,attribute,value]=fields.slice(i,i+3),values=declared.get(file);
      ensure(values&&attributes.includes(attribute)&&!values.has(attribute),"Unexpected or repeated Git public-file attribute");values.set(attribute,value);
    }
    // Attributes capable of invoking a command or transforming content are
    // forbidden before hash-object or add can invoke conversion. Only Git's
    // normal text/eol rules are allowed for the fixed public text files.
    for(const [file,values]of declared){
      for(const attribute of ["filter","working-tree-encoding","ident"])ensure(values.get(attribute)==="unspecified","Unexpected Git "+attribute+" conversion for public file: "+file);
      if(file.startsWith("assets/")){
        ensure(["unspecified","unset"].includes(values.get("text"))&&values.get("eol")==="unspecified"&&["unspecified","unset"].includes(values.get("crlf")),"Unexpected Git text normalization for binary public asset: "+file);
      }else{
        ensure(FIXED.includes(file)&&["unspecified","set","unset","auto"].includes(values.get("text"))&&["unspecified","unset","lf","crlf"].includes(values.get("eol"))&&["unspecified","set","unset","input"].includes(values.get("crlf")),"Unexpected Git text normalization for public file: "+file);
      }
    }
    return new Map(build.files.map(file=>{
      const bytes=build.content.get(file),raw=blobHash(bytes);
      if(file.startsWith("assets/"))return [file,raw];
      const canonical=git(["hash-object","--path="+file,"--stdin"],bytes);
      // Work on bytes, not UTF-8 strings: the only permitted content change
      // removes CR immediately before LF, preserving all other bytes exactly.
      const normalized=Buffer.from(bytes.filter((byte,i)=>!(byte===13&&bytes[i+1]===10)));
      ensure(canonical===raw||canonical===blobHash(normalized),"Git applied an unsupported public-file transformation: "+file);
      return [file,canonical];
    }));
  }
  function assertMatches(build,label){
    ensure(same(tracked,build.files),label+" index file set differs from the generated build");
    ensure(same(worktree,build.files),label+" worktree file set differs from the generated build");
    // Raw worktree identity is independent of Git's canonical index identity.
    // Even a newline-only user edit must not be overwritten by this helper.
    for(const entry of index)ensure(fs.readFileSync(path.join(repo,entry.file)).equals(build.content.get(entry.file)),label+" worktree content differs from the generated build: "+entry.file);
    const canonical=canonicalIndexHashes(build);
    for(const entry of index){
      const bytes=build.content.get(entry.file);
      ensure(entry.oid===canonical.get(entry.file),label+" index content differs from the generated build: "+entry.file);
    }
  }
  if(replace){
    const roots=fs.readdirSync(buildRoot,{withFileTypes:true}).filter(entry=>entry.isDirectory()&&entry.name.startsWith(replace+"-")).map(entry=>path.join(buildRoot,entry.name));
    ensure(roots.length===1,"The previously staged generated build is missing or ambiguous");
    previous=generatedBuild(buildRoot,roots[0],replace);
    assertMatches(previous,"Previously staged release");
  }
  const stale=tracked.filter(file=>!next.files.includes(file));
  for(const file of stale){
    ensure(/^assets\/[a-f0-9]{64}\.png$/.test(file),"Refusing to remove an unexpected tracked deployment file: "+file);
    const target=path.resolve(repo,file);ensure(within(repo,target),"Stale asset path escapes deployment repository");
    ensure(fs.lstatSync(target).isFile()&&!fs.lstatSync(target).isSymbolicLink(),"Stale asset is not an ordinary tracked file");
  }
  const nextIndexHashes=canonicalIndexHashes(next);
  // All baseline, source, old index/worktree and deletion checks finish before
  // the first write. Only the named generated package may replace staged work.
  for(const file of next.files){
    const target=path.resolve(repo,file);ensure(within(repo,target),"Destination path escapes deployment repository");
    fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,next.content.get(file));
  }
  for(const file of stale)fs.unlinkSync(path.resolve(repo,file));
  for(const file of next.files)ensure(fs.readFileSync(path.join(repo,file)).equals(next.content.get(file)),"Staged file differs from reviewed build: "+file);
  git(["add","--all","--",...FIXED,"assets"]);git(["diff","--cached","--check"]);
  const staged=git(["ls-files","--stage","-z"]).split("\0").filter(Boolean);
  ensure(staged.length===next.files.length&&staged.every(line=>{
    const match=/^100644 ([a-f0-9]+) 0\t(.+)$/.exec(line);return match&&next.content.has(match[2])&&match[1]===nextIndexHashes.get(match[2]);
  }),"New deployment index differs from the generated build");
  return {build_id:latest.build_id,baseline:expected,...(previous?{replaced_staged_build:replace}:{}),files:next.files.length,removed_obsolete_assets:stale.length,staged:git(["diff","--cached","--stat"]).split("\n").slice(-1)[0]};
}
function parseArgs(args){
  const [expected,...rest]=args;let replaceStagedBuild;
  if(rest.length){ensure(rest.length===2&&rest[0]==="--replace-staged-build","Usage: baseline-commit [--replace-staged-build build-id]");replaceStagedBuild=rest[1];}
  return {expected,replaceStagedBuild};
}
if(require.main===module)console.log(JSON.stringify(stage(parseArgs(process.argv.slice(2))),null,2));
module.exports={stage,parseArgs,generatedBuild,FIXED};
