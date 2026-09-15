"use strict";
// Mandatory completed reviews added after the original ID-based test ledger.
// Used by every IB topic, including sibling/context and crop-rectangle audits.
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const ROOT=path.resolve(__dirname,".."),DB=path.resolve(process.env.PHYSICS_PAPERDB_ROOT||"C:/CodexProjects/PaperDatabases");
const reviewPaths=["reports/ib-review-note-reservations.json","reports/ib-d2-reviewed-test-exclusions.json",
  "reports/ib-e1-learner-scope-review.json","reports/ib-e2-learner-scope-review.json"].map(file=>path.join(ROOT,file));
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
function loadCurrentReviewAdditions(){
  const witnesses=new Map();
  const witness=(file,expected)=>{
    const full=path.resolve(file),hash=sha(fs.readFileSync(full));
    if(expected&&hash!==expected)throw Error("Additional assessment evidence changed: "+full);
    witnesses.set(full,{path:full,sha256:hash});
  };
  for(const file of reviewPaths){
    const report=JSON.parse(fs.readFileSync(file,"utf8"));
    if(report.schema_version!==1||report.review_complete!==true||!Array.isArray(report.unresolved_relevant_items)||report.unresolved_relevant_items.length||
       !Array.isArray(report.blocked_source_ids)||!Array.isArray(report.source_files)||!report.source_files.length||report.read_failures?.length)
      throw Error("Additional assessment review is incomplete: "+file);
    witness(file);
    for(const source of report.source_files){
      if(!source.path||!source.sha256)throw Error("Additional assessment source fingerprint is missing");
      witness(path.isAbsolute(source.path)?source.path:path.join(DB,source.path),source.sha256);
    }
  }
  witness(__filename);
  return {paths:[...reviewPaths],fingerprints:[...witnesses.values()]};
}
module.exports={loadCurrentReviewAdditions,reviewPaths};
