"use strict";
// In-memory source fixtures: no source reports or deployment files are edited.
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),vm=require("vm"),crypto=require("crypto");
const filename=path.resolve(__dirname,"../tools/ib-current-review-additions.js"),code=fs.readFileSync(filename,"utf8");
const sha=value=>crypto.createHash("sha256").update(value).digest("hex");
let checks=0;
function test(name,run){
  const dir=path.resolve("C:/ppq-review-fixture/tools"),root=path.dirname(dir),db=path.resolve("C:/ppq-review-source-fixture"),files=new Map();
  const write=(file,value)=>files.set(path.resolve(file),Buffer.from(typeof value==="string"?value:JSON.stringify(value)));
  const source=path.join(db,"reviewed-source.pdf");write(source,"source bytes");
  const report={schema_version:1,review_complete:true,unresolved_relevant_items:[],read_failures:[],blocked_source_ids:["ibchem_part_abc"],source_files:[{path:"reviewed-source.pdf",sha256:sha(files.get(source))}]};
  const notes=path.join(root,"reports/ib-review-note-reservations.json"),d2=path.join(root,"reports/ib-d2-reviewed-test-exclusions.json"),
    e1=path.join(root,"reports/ib-e1-learner-scope-review.json"),e2=path.join(root,"reports/ib-e2-learner-scope-review.json"),helper=path.join(dir,"ib-current-review-additions.js");
  const reports=[notes,d2,e1,e2];reports.forEach(file=>write(file,report));write(helper,code);
  const sandbox={module:{exports:{}},__dirname:dir,__filename:helper,process:{env:{PHYSICS_PAPERDB_ROOT:db}},require:name=>{
    if(name==="fs")return{readFileSync:(file,encoding)=>{const bytes=files.get(path.resolve(file));if(!bytes)throw Error("Missing fixture source: "+file);return encoding?bytes.toString(encoding):bytes;}};
    return require(name);
  }};
  vm.runInNewContext(code,sandbox,{filename:helper});
  const load=()=>JSON.parse(JSON.stringify(sandbox.module.exports.loadCurrentReviewAdditions()));
  run({files,write,source,notes,d2,e1,e2,reports,helper,report,load});checks++;console.log("PASS "+name);
}
test("all four mandatory global reports and their deduplicated byte witnesses are returned",f=>{
  const result=f.load();assert.deepEqual(result.paths,[f.notes,f.d2,f.e1,f.e2]);
  assert.deepEqual(result.fingerprints.map(row=>row.path).sort(),[...f.reports,f.source,f.helper].sort());
  result.fingerprints.forEach(row=>assert.equal(row.sha256,sha(f.files.get(row.path))));
});
test("each incomplete notes, D2, E1 or E2 report blocks every consumer",f=>{
  for(const file of f.reports){f.write(file,{...f.report,review_complete:false});assert.throws(()=>f.load(),/incomplete/);f.write(file,f.report);}
});
test("unresolved or unreadable assessment evidence cannot become a global clearance",f=>{
  for(const file of f.reports)for(const change of[{unresolved_relevant_items:["scan remains unread"]},{read_failures:["missing PDF"]},{source_files:[]},{blocked_source_ids:null}]){
    f.write(file,{...f.report,...change});assert.throws(()=>f.load(),/incomplete/);f.write(file,f.report);
  }
});
test("changed or absent source bytes revoke an otherwise completed report",f=>{
  f.write(f.source,"changed bytes");assert.throws(()=>f.load(),/evidence changed/);
  f.files.delete(f.source);assert.throws(()=>f.load(),/Missing fixture source/);
});
test("a missing source fingerprint or any missing mandatory report fails closed",f=>{
  for(const file of f.reports){
    f.write(file,{...f.report,source_files:[{path:f.source}]});assert.throws(()=>f.load(),/fingerprint is missing/);
    f.files.delete(file);assert.throws(()=>f.load(),/Missing fixture source/);f.write(file,f.report);
  }
});
test("an E-only assessment witness is checked even when every legacy witness remains valid",f=>{
  for(const file of[f.e1,f.e2]){
    const ownSource=path.join(path.dirname(f.source),path.basename(file)+".pdf");f.write(ownSource,"E assessment source bytes");
    f.write(file,{...f.report,source_files:[...f.report.source_files,{path:ownSource,sha256:sha(f.files.get(ownSource))}]});
    assert(f.load().fingerprints.some(row=>row.path===ownSource));
    f.write(ownSource,"changed E assessment source bytes");assert.throws(()=>f.load(),/evidence changed/);
    f.write(file,f.report);
  }
});
console.log(`${checks} global review-addition checks passed with no filesystem writes.`);
