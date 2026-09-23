"use strict";
// One bounded evidence migration, not a general checksum refresh command.
// prepare preserves inputs and builds candidates; validate runs the real builders
// in a child-only file overlay; promote requires the complete validation receipt.
const fs=require("fs"),path=require("path"),crypto=require("crypto"),assert=require("assert/strict"),cp=require("child_process");
const ROOT=path.resolve(__dirname,".."),BASE=path.join(ROOT,"reports/ib-evidence-migration-2026-09-23");
const abs=p=>path.resolve(ROOT,p),hash=b=>crypto.createHash("sha256").update(b).digest("hex"),sha=p=>hash(fs.readFileSync(p));
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const write=(p,d)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(d,null,2)+"\n");};
const artifacts=["dist/physics-inputs/ib-a5-analysis.json","dist/physics-inputs/ib-d2-recovered.json",
  "reports/ib-d2-reviewed-test-exclusions.json","reports/ib-d2-reviewed-scope-holds.json",
  "reports/ib-e1-learner-scope-review.json","reports/ib-e2-learner-scope-review.json","reports/ib-a5-additional-geometry-review.json",
  "reports/ib-a5-release-clearance.json","reports/ib-a1-c1-release-clearance.json","reports/ib-d2-release-clearance.json","reports/ib-e1-e2-release-clearance.json"];
const before=p=>path.join(BASE,"before",p),candidate=p=>path.join(BASE,"candidate",p);
const changedCode=["tools/build_ib_a5_analysis.py","tools/build_ib_d2_recovery.js","tools/build_ib_d2_assessment_review.js",
  "tools/assemble_physics_preview.js","tools/build_ib_a5_clearance.js","tools/ib-topic-release.js"];
const oldBaseline=abs("dist/physics-inputs/ib-d2.json"),newBaseline=abs("reports/ib-release-inputs/ib-d2-baseline.json");
const oldSyllabus="C:\\Claude (not on Gdrive, nor OneDrive)\\Special Relativity Driller\\data\\syllabus_meta.yaml";
const newSyllabus=abs("reports/ib-release-inputs/a5-syllabus-meta.yaml");
const baselineHash="d8a94d29e2207a573b08c2f542dfb67868950ceaf642c2439bf666b37c336ec0";
const originalBaselineHash="450948180803eb95";
const aliases=new Map([[path.resolve(oldBaseline),newBaseline],[path.resolve(oldSyllabus),newSyllabus]]);
const mapping=()=>new Map(artifacts.map(p=>[abs(p),candidate(p)]));

// Only an explicitly named dependency can acquire a new identity. All other
// values, including review dates, questions, dispositions and image roles, stay.
function rebind(document,identities,renames=new Map()) {
  function walk(value,key="") {
    if(Array.isArray(value)) {
      const out=value.map(item=>walk(item));
      if(["fingerprints","source_files","sourceFiles"].includes(key)&&out.length&&out.every(x=>x&&typeof x.path==="string"&&typeof x.sha256==="string"&&Object.keys(x).length===2))
        out.sort((a,b)=>a.path.localeCompare(b.path));
      return out;
    }
    if(!value||typeof value!=="object")return value;
    const out=Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(v,k)]));
    if(typeof value.path==="string"&&typeof value.sha256==="string") {
      const canonical=path.resolve(value.path);
      if(identities.has(canonical)) {
        const change=identities.get(canonical);
        assert(change.oldHashes.includes(value.sha256),"Unexpected previous fingerprint: "+value.path);
        out.path=renames.get(canonical)||value.path;out.sha256=change.sha256;
      }
    }
    if(typeof value.reviewed_candidate_file==="string"&&typeof value.reviewed_candidate_sha256==="string") {
      const key=path.resolve(value.reviewed_candidate_file),change=identities.get(key);
      if(change){assert(change.oldHashes.includes(value.reviewed_candidate_sha256));out.reviewed_candidate_sha256=change.sha256;}
    }
    return out;
  }
  return walk(document);
}
function differences(a,b,at="$",out=[]) {
  if(Object.is(a,b))return out;
  if(a&&b&&typeof a==="object"&&typeof b==="object"&&Array.isArray(a)===Array.isArray(b)) {
    for(const k of new Set([...Object.keys(a),...Object.keys(b)]))differences(a[k],b[k],at+"."+k,out);
  }else out.push({path:at,before:a,after:b});
  return out;
}
function assertEquivalent(label,expected,actual) {
  const diff=differences(rebind(expected,new Map()),rebind(actual,new Map()));
  assert.equal(diff.length,0,label+" changed substantive evidence: "+JSON.stringify(diff.slice(0,12)));
  console.log("IDENTICAL substantive evidence: "+label);
}
function oldHashesFor(file) {
  const hashes=new Set();
  function scan(v){if(v&&typeof v==="object"){if(typeof v.path==="string"&&path.resolve(v.path)===file&&v.sha256)hashes.add(v.sha256);Object.values(v).forEach(scan);}}
  for(const rel of artifacts)scan(read(before(rel)));
  const item=read(path.join(BASE,"originals.json")).files.find(f=>abs(f.path)===file);
  if(item)hashes.add(item.sha256);
  return [...hashes];
}
function identities() {
  const result=new Map();
  for(const rel of artifacts)if(fs.existsSync(candidate(rel)))result.set(abs(rel),{oldHashes:oldHashesFor(abs(rel)),sha256:sha(candidate(rel))});
  for(const rel of changedCode)result.set(abs(rel),{oldHashes:oldHashesFor(abs(rel)),sha256:sha(abs(rel))});
  for(const [old,pinned]of aliases)result.set(old,{oldHashes:oldHashesFor(old),sha256:sha(pinned)});
  return result;
}
function prepare() {
  fs.mkdirSync(BASE,{recursive:true});
  const manifest=path.join(BASE,"originals.json");
  if(!fs.existsSync(manifest)) {
    const files=artifacts.map(rel=>{const bytes=fs.readFileSync(abs(rel));fs.mkdirSync(path.dirname(before(rel)),{recursive:true});fs.writeFileSync(before(rel),bytes);return {path:rel,sha256:hash(bytes)};});
    write(manifest,{schema_version:1,created_utc:new Date().toISOString(),files});
  }
  for(const f of read(manifest).files){assert.equal(sha(abs(f.path)),f.sha256,"Active evidence changed since snapshot");assert.equal(sha(before(f.path)),f.sha256,"Snapshot changed");}
  const pins=[
    {source:abs("tmp/syllabus_meta.reviewed.yaml"),destination:newSyllabus,expected:"60a3c7aa927ebd642e3d6aec78b60aa1b1cf8e4fad1385ff831489865bd9d2e4"},
    {source:oldBaseline,destination:newBaseline,expected:baselineHash},
    {source:abs("dist/physics-inputs/ib-data-analysis.json"),destination:abs("reports/ib-release-inputs/ib-data-analysis.json"),expected:"87f9803dd2de8e736db4abf5de80d63957d55ba261e3df4494d1cc900c6bbfb0"}
  ];
  for(const pin of pins){assert.equal(sha(pin.source),pin.expected);fs.mkdirSync(path.dirname(pin.destination),{recursive:true});if(fs.existsSync(pin.destination))assert.equal(sha(pin.destination),pin.expected);else fs.copyFileSync(pin.source,pin.destination);}
  write(abs("reports/ib-release-inputs/manifest.json"),{schema_version:1,purpose:"Immutable release inputs; preview builders write only dist/physics-inputs.",files:pins.map(p=>({path:path.relative(ROOT,p.destination).replaceAll("\\","/"),sha256:p.expected,source_path:p.source})),d2_baseline_note:"Replacement input frozen on 2026-09-23. Its recovery must be fully equivalent to the original reviewed recovery; this is not the lost original baseline."});
  // Preserve every ignored local input used by the old clearances, including
  // rendered assessment pages. These copies are evidence, never build outputs.
  const preserved=new Map();
  for(const rel of artifacts.slice(-4))for(const f of read(before(rel)).fingerprints){
    const local=path.relative(ROOT,f.path);
    if(!/^(dist|tmp)[\\/]/.test(local)||artifacts.includes(local.replaceAll("\\","/")))continue;
    const destination=path.join(BASE,"preserved-inputs",local),actual=sha(f.path);
    if(f.path===oldBaseline)assert(actual===baselineHash&&f.sha256.startsWith(originalBaselineHash));else assert.equal(actual,f.sha256,"Unrelated input moved: "+f.path);
    if(!fs.existsSync(destination)){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(f.path,destination);}else assert.equal(sha(destination),actual);
    preserved.set(f.path,{path:local,sha256:actual,previous_expected_sha256:f.sha256});
  }
  write(path.join(BASE,"preserved-inputs.json"),{files:[...preserved.values()]});
  const a5=candidate(artifacts[0]);fs.mkdirSync(path.dirname(a5),{recursive:true});
  cp.execFileSync("C:/CodexProjects/PaperDatabases/tools/python/python.exe",[abs("tools/build_ib_a5_analysis.py"),"--output",a5],{cwd:ROOT,stdio:"inherit"});
  require("./build_ib_d2_recovery").write(candidate(artifacts[1]));
  const ids=identities();
  for(const rel of artifacts.slice(0,2))assertEquivalent(rel,rebind(read(before(rel)),ids,aliases),read(candidate(rel)));
  const rawProof={schema_version:1,original_recovery_sha256:sha(before(artifacts[1])),candidate_recovery_sha256:sha(candidate(artifacts[1])),allowed_changes:["Pinned D2 baseline path and its fingerprint","Recovery builder fingerprint"],complete_recursive_comparison:"passed",a5_complete_recursive_comparison:"passed"};
  write(path.join(BASE,"recovery-equivalence.json"),rawProof);console.log(JSON.stringify(rawProof,null,2));
}
function validate() {
  for(const f of read(path.join(BASE,"originals.json")).files){assert.equal(sha(before(f.path)),f.sha256,"Original snapshot changed");assert.equal(sha(abs(f.path)),f.sha256,"Active evidence changed");}
  const proof=read(path.join(BASE,"recovery-equivalence.json"));
  assert.equal(proof.candidate_recovery_sha256,sha(candidate(artifacts[1])));
  for(const rel of artifacts.slice(2)){fs.mkdirSync(path.dirname(candidate(rel)),{recursive:true});fs.copyFileSync(before(rel),candidate(rel));}
  const restore=require("./ib-evidence-overlay").install({replacements:mapping(),writableRoot:path.join(BASE,"candidate")});
  try {
    // This still uses the assessment builder's fixed expected hash. The explicit
    // source edit advancing that pin is made only after prepare proves equality.
    const assessment=require("./build_ib_d2_assessment_review").build();
    write(abs(artifacts[2]),assessment);
    for(const rel of artifacts.slice(3,7))write(abs(rel),rebind(read(before(rel)),identities(),aliases));
    require("./build_ib_a5_clearance").main();
    require("./ib-topic-release").buildClearance();
    require("./ib-d2-release").write();
    write(abs(artifacts[10]),require("./ib-e-topics-release").prepareRelease().clearance);
    const historicalChanges=[];
    for(const rel of artifacts){
      const previous=read(before(rel)),next=read(candidate(rel));
      if(Object.hasOwn(previous,"reviewed_utc")){next.reviewed_utc=previous.reviewed_utc;write(abs(rel),next);}
      if(rel==="reports/ib-d2-release-clearance.json" && differences(previous.existing_public_assessment_impacts,next.existing_public_assessment_impacts).length){
        // This report field is relative to the *previous public bundle*, not a
        // reviewed eligibility decision. Only already-removed, still-reserved
        // questions may disappear from this historical list during migration.
        const latest=read(abs("dist/ibphysics-release/latest.json")),catalogue=path.join(latest.root,"data/physics_catalogue.js"),box={window:{}};
        require("vm").runInNewContext(fs.readFileSync(catalogue,"utf8"),box);
        const extra=["dist/physics-audit/current-ib-tests.json","reports/ib-a5-reviewed-test-exclusions.json","reports/ib-a1-c1-reviewed-test-exclusions.json",artifacts[2]].map(abs);
        extra.push(...require("./ib-current-review-additions").loadCurrentReviewAdditions().paths);
        const closure=require("./physics-test-exclusions").buildIbExclusions({paperdbRoot:"C:/CodexProjects/PaperDatabases",questions:read(abs(artifacts[1])).questions,extraExclusionsPaths:extra});
        verifyRetiredImpacts(previous.existing_public_assessment_impacts,next.existing_public_assessment_impacts,box.window.PHYSICS_QUESTIONS,closure.blockedParentIds);
        historicalChanges.push({field:rel+"/existing_public_assessment_impacts",before:previous.existing_public_assessment_impacts,after:next.existing_public_assessment_impacts,
          reason:"Previously removed questions remain reserved and are absent from the current bundle.",catalogue:{path:catalogue,sha256:sha(catalogue)}});
        previous.existing_public_assessment_impacts=next.existing_public_assessment_impacts;
      }
      assertEquivalent(rel,rebind(previous,identities(),aliases),next);
    }
    const witnesses=new Map();
    for(const rel of artifacts.slice(-4))for(const f of read(candidate(rel)).fingerprints){assert.equal(sha(f.path),f.sha256,"Candidate source changed: "+f.path);witnesses.set(f.path,f);}
    write(path.join(BASE,"candidate/validation.json"),{schema_version:1,validated_utc:new Date().toISOString(),result:"PASS",original_review_dates_preserved:true,
      files:artifacts.map(rel=>({path:rel,sha256:sha(candidate(rel))})),code:changedCode.map(rel=>({path:rel,sha256:sha(abs(rel))})),witnesses:[...witnesses.values(),...historicalChanges.map(x=>x.catalogue)],historicalChanges,comparisons:"Complete recursive records; exact declared provenance identities and separately verified historical impact updates only."});
  } finally {restore();}
  console.log("Complete candidate chain validated. Active evidence is unchanged.");
}
function verifyRetiredImpacts(previous,next,questions,blockedParents){
  for(const item of next)assert(previous.some(old=>differences(old,item).length===0),"Unexpected new public impact");
  for(const item of previous)if(!next.some(current=>differences(current,item).length===0)){
    assert(blockedParents.has(item.parent_id),"Previously removed question is no longer reserved: "+item.id);
    assert(!questions.some(q=>q.source_part_id===item.source_part_id||q.id===item.id),"Previously removed question is still public: "+item.id);
  }
}
function promote() {
  const receipt=read(path.join(BASE,"candidate/validation.json")),originals=read(path.join(BASE,"originals.json"));
  assert.equal(receipt.result,"PASS");
  assert.deepEqual(receipt.files.map(f=>f.path).sort(),[...artifacts].sort(),"Validation receipt must name exactly the migration artifacts");
  assert.deepEqual(originals.files.map(f=>f.path).sort(),[...artifacts].sort(),"Original snapshot must name exactly the migration artifacts");
  for(const f of originals.files){assert.equal(sha(abs(f.path)),f.sha256,"Active record changed; do not overwrite it");assert.equal(sha(before(f.path)),f.sha256,"Original snapshot changed");}
  for(const f of receipt.files)assert.equal(sha(candidate(f.path)),f.sha256,"Candidate changed since validation");
  for(const f of receipt.code)assert.equal(sha(abs(f.path)),f.sha256,"Builder changed since validation");
  const replacements=mapping();
  for(const f of receipt.witnesses)assert.equal(sha(replacements.get(path.resolve(f.path))||f.path),f.sha256,"Source changed since validation: "+f.path);
  const pending=abs("reports/ib-evidence-promotion.pending.json");
  require("./ib-evidence-transaction").promoteFiles({journal:pending,receiptPath:path.join(BASE,"promotion.json"),files:receipt.files.map(f=>({
    target:abs(f.path),candidate:candidate(f.path),backup:before(f.path),beforeSha256:originals.files.find(x=>x.path===f.path).sha256,afterSha256:f.sha256}))});
  console.log("Validated evidence promoted with retained before/after copies. No deployment files changed.");
}
if(require.main===module){const action=process.argv[2];assert(["prepare","validate","promote"].includes(action),"Usage: node tools/migrate_ib_release_evidence.js prepare|validate|promote");({prepare,validate,promote})[action]();}
module.exports={rebind,differences,assertEquivalent,verifyRetiredImpacts};
