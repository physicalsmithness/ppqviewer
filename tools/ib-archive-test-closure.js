"use strict";
// School-test reservation for the archive-built topics (A.2, and A.1 beyond its 12
// September clearance). Same closure as tools/physics-test-exclusions.js, which other
// clearances fingerprint and so is left untouched, with one ruled difference
// (Smith, 2026-09-30, "both"): for the A.2 test files his own part-level matching
// replaces the text-scan links and the matching ledger's guesses. Every other test
// keeps the scan and the guesses. The page rule is not applied by callers of this
// module; the picture-overlap check against reserved questions stands in for it.
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const {parseCsv}=require("./physics-test-exclusions");
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const identifiers=v=>String(v||"").match(/ibchem_(?:part|xlvl)_[a-f0-9]+/g)||[];
const parentKey=row=>`${row.preview}\u0000${row.question}`;
const viewerParentId=row=>`${row.year.slice(-2)}${row.session[0].toUpperCase()}.P${row.paper}.${row.level}.${row.time_zone||"TZ0"}.Q${row.question}`;
const A2_LEDGER_FILE=/(^|\/)A\/A\.2 Tests\//;   // PACKET_006D source_file
const A2_SCAN_FILE=/^A\/A\.2[ \/]/;             // scan relative_path / candidate_links source_file
const add=(map,key,value)=>{if(!key)return;if(!map.has(key))map.set(key,[]);map.get(key).push(value);};

function buildClosure({paperdbRoot,extraExclusionsPaths=[],exactA2TestsPath=null}){
  const root=path.resolve(paperdbRoot),sourceFiles=[];
  const readCsv=(rel,cols)=>{
    const file=path.join(root,...rel.split("/")),bytes=fs.readFileSync(file),rows=parseCsv(bytes.toString("utf8"),cols);
    if(!rows.length||cols.some(c=>!(c in rows[0])))throw Error("Missing rows or required columns in "+rel);
    sourceFiles.push({path:file,sha256:sha(bytes),rows:rows.length});return rows;
  };
  const corpus=readCsv("outputs/exports/ib_physics_archive_flat_v5.csv",["part_id","preview","question","cross_level_group_id","duplicate_of","year","session","paper","level","time_zone","page_render_paths"]);
  const packet="Physics Categorisation/returns/PACKET_006D/";
  const ledger=readCsv(packet+"source_results_v4.csv",["source_part_id","source_file","source_kind","matched_part_id","matched_group_id","rank1_part_id","rank1_group_id","derived_from"]);
  const matches=readCsv(packet+"matches.csv",["source_part_id","candidate_part_id","candidate_group_id","derived_from"]);
  const tests=ledger.filter(r=>r.source_kind==="test");
  if(!tests.length)throw Error("No test rows available: refusing an unprotected IB build");
  const replaced=new Set(exactA2TestsPath?tests.filter(r=>A2_LEDGER_FILE.test(r.source_file.replace(/\\/g,"/"))).map(r=>r.source_part_id):[]);
  const testIds=new Set(tests.map(r=>r.source_part_id));
  const byPart=new Map(),byParent=new Map(),byGroup=new Map(),dup=new Map();
  for(const row of corpus){
    if(byPart.has(row.part_id))throw Error("Duplicate archive source part: "+row.part_id);
    byPart.set(row.part_id,row);add(byParent,parentKey(row),row.part_id);add(byGroup,row.cross_level_group_id,row.part_id);
    if(row.duplicate_of){add(dup,row.part_id,row.duplicate_of);add(dup,row.duplicate_of,row.part_id);}
  }
  const blockedSourceIds=new Set(),blockedGroups=new Set(),blockedParentKeys=new Set(),queue=[],unknown=new Set(),reasons={};
  const reservePart=(id,reason)=>{
    if(!byPart.has(id)){unknown.add(id);return false;}
    if(!blockedSourceIds.has(id)){blockedSourceIds.add(id);queue.push(id);reasons[reason]=(reasons[reason]||0)+1;}
    return true;
  };
  const reserveGroup=(id,reason)=>{
    if(byPart.has(id))return reservePart(id,reason);
    const members=byGroup.get(id);if(!members){unknown.add(id);return false;}
    if(!blockedGroups.has(id)){blockedGroups.add(id);members.forEach(m=>reservePart(m,reason));}
    return true;
  };
  const seed=(value,reason)=>identifiers(value).forEach(id=>reserveGroup(id,reason));
  for(const row of matches){
    if(!testIds.has(row.source_part_id)||replaced.has(row.source_part_id))continue;
    seed(row.candidate_part_id,"test_candidate_or_proposal");seed(row.candidate_group_id,"test_candidate_or_proposal");seed(row.derived_from,"test_derived_candidate");
  }
  for(const row of tests){
    if(replaced.has(row.source_part_id))continue;
    for(const c of ["matched_part_id","matched_group_id","rank1_part_id","rank1_group_id"])seed(row[c],"test_ledger_link_or_proposal");
    seed(row.derived_from,"test_derived_candidate");
  }
  const comparisons=[];
  const files=[...new Set([...extraExclusionsPaths,...(exactA2TestsPath?[exactA2TestsPath]:[])].filter(Boolean))];
  for(const file of files){
    const bytes=fs.readFileSync(file),extra=JSON.parse(bytes.toString("utf8"));
    if(extra.schema_version!==1||!Array.isArray(extra.blocked_source_ids)||!Array.isArray(extra.source_files))throw Error("Invalid additional IB test comparison schema: "+file);
    if(extra.read_failures?.length)throw Error("Current IB test comparison contains unreadable source files: "+file);
    if(extra.corpus_sha256!==sourceFiles[0].sha256)throw Error("Test comparison used a different archive revision: "+file);
    let ids=extra.blocked_source_ids;
    // A scan's links from the A.2 test files are the part the exact list replaces.
    if(exactA2TestsPath&&file!==exactA2TestsPath&&Array.isArray(extra.candidate_links)){
      const other=new Set(extra.candidate_links.filter(l=>!A2_SCAN_FILE.test(l.source_file||"")).map(l=>l.source_part_id));
      const onlyA2=new Set(extra.candidate_links.filter(l=>A2_SCAN_FILE.test(l.source_file||"")).map(l=>l.source_part_id));
      ids=ids.filter(id=>other.has(id)||!onlyA2.has(id));
    }
    for(const id of ids)if(!reservePart(id,file===exactA2TestsPath?"teacher_exact_a2_test_match":"current_shared_drive_test_candidate"))
      throw Error("Reviewed test reservation is missing from the current archive: "+id);
    sourceFiles.push({path:path.resolve(file),sha256:sha(bytes),rows:ids.length});
    comparisons.push({path:path.resolve(file),created_utc:extra.created_utc,reserved:ids.length});
  }
  for(let i=0;i<queue.length;i++){
    const row=byPart.get(queue[i]),parent=parentKey(row);
    if(!blockedParentKeys.has(parent)){blockedParentKeys.add(parent);byParent.get(parent).forEach(s=>reservePart(s,"whole_question_sibling"));}
    if(row.cross_level_group_id)reserveGroup(row.cross_level_group_id,"cross_level_twin");
    for(const d of dup.get(row.part_id)||[])reservePart(d,"duplicate_link");
  }
  const blockedParentIds=new Set([...blockedSourceIds].map(id=>viewerParentId(byPart.get(id))));
  return {blockedParentIds,blockedSourceIds,blockedGroups,
    report:{policy:"Whole questions, HL/SL twins and duplicates of every test link and proposal are reserved; for the A.2 test files the teacher's exact part-level matches replace the scan links and ledger proposals; no page rule.",
      replaced_a2_ledger_rows:replaced.size,reasons,blocked_parts:blockedSourceIds.size,unknown_identifiers:[...unknown].sort(),comparisons,sourceFiles}};
}
module.exports={buildClosure};
