/* Private read-only source audit. Writes only its own workspace report. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto"), assert = require("assert/strict");
const {parseCsv, buildIbExclusions} = require("./physics-test-exclusions.js");
const ROOT = path.resolve(__dirname, ".."), DB = "C:/CodexProjects/PaperDatabases";
const SNAPSHOTS = path.join(DB, "Physics Categorisation/reference/tests/3. Assessments");
const SHARED = "H:/Shared drives/0. Physics (Teachers)/1- IB Folder/3. Assessments";
const sha = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const abs = file => path.resolve(ROOT, file);
const ids = value => String(value || "").match(/ibchem_(?:part|xlvl)_[a-f0-9]+/g) || [];
const unique = values => [...new Set(values)].sort();
const pageNumber = file => (/_p(\d+)(?:_|\.)/.exec(file) || [])[1];
const parentKey = row => row.preview + "\0" + row.question;
// These are observations from a successful, explicitly approved read-only
// Get-FileHash call on 12 September. Rerunning this helper does NOT refresh H:.
const observations = [
  {relative_path:"C/C1-C2-C5 test 2026.pdf", location:"local", sha256:"56eb2be04d6342d5de8950a40bb39a06551d6b38ce6f7fafc348d0e7852a31ca", bytes:484032},
  {relative_path:"C/C1-C2-C5 test.pdf", location:"shared", sha256:"d3d26021b75604b23902499796f4702e9e85b7b3299dd950eaca41517eef1604", bytes:393512},
  {relative_path:"A/A.1/A.1 Test 2024.pdf", location:"shared", sha256:"4dea58263039e979388bfc7e0dfde6d161c000bfe4807e209f92947434cc8f05", bytes:433457},
  {relative_path:"A/A.1/A.1 Test 2025.pdf", location:"shared", sha256:"d872cda4575e52dd6d8899f06bff10bcd4db6745eb7ab49426c00f2aac7b010d", bytes:510591},
  {relative_path:"A/A.1/A.1 Test 2026.pdf", location:"shared", sha256:"c4ddebc6ad090a0ccdeb995b4fe9b8b4667b68d335b7a35f278c86d62d9ea235", bytes:511805}
];
const corpusPath = path.join(DB, "outputs/exports/ib_physics_archive_flat_v5.csv");
const ledgerPath = path.join(DB, "Physics Categorisation/returns/PACKET_006D/source_results_v4.csv");
const matchesPath = path.join(DB, "Physics Categorisation/returns/PACKET_006D/matches.csv");
const nativePath = path.join(DB, "Physics Categorisation/viewer/ibphysics_catalogue.js");
const currentPath = abs("dist/physics-audit/current-ib-tests.json");
const additional = [abs("reports/ib-a5-reviewed-test-exclusions.json"), abs("reports/ib-a1-c1-reviewed-test-exclusions.json")];
const current = read(currentPath), review = read(additional[1]);
const corpus = parseCsv(fs.readFileSync(corpusPath,"utf8"));
const ledger = parseCsv(fs.readFileSync(ledgerPath,"utf8"));
const matches = parseCsv(fs.readFileSync(matchesPath,"utf8"));
const box = {window:{}}; vm.runInNewContext(fs.readFileSync(nativePath,"utf8"),box);
const native = box.window.IBPHYS_QUESTIONS, byNative = new Map(native.map(q=>[q.id,q]));
const closure = buildIbExclusions({paperdbRoot:DB, questions:native, extraExclusionsPath:currentPath, extraExclusionsPaths:additional});
const byId = new Map(corpus.map(row=>[row.part_id,row])), byGroup = new Map(), byParent = new Map(), duplicates = new Map();
function index(map,key,id) { if (!key) return; if (!map.has(key)) map.set(key,new Set()); map.get(key).add(id); }
for (const row of corpus) {
  index(byGroup,row.cross_level_group_id,row.part_id); index(byParent,parentKey(row),row.part_id);
  if (row.duplicate_of) { index(duplicates,row.part_id,row.duplicate_of); index(duplicates,row.duplicate_of,row.part_id); }
}
function expand(seeds) {
  const pending = [], found = new Set();
  const put = id => { assert(byId.has(id),"Unknown source ID: "+id); if (!found.has(id)) {found.add(id);pending.push(id);} };
  for (const id of seeds) { if (byId.has(id)) put(id); else {assert(byGroup.has(id),"Unknown source group: "+id);for(const member of byGroup.get(id))put(member);} }
  const directlyResolved = new Set(found);
  for(let i=0;i<pending.length;i++) { const row=byId.get(pending[i]); for(const member of byParent.get(parentKey(row)))put(member); for(const member of byGroup.get(row.cross_level_group_id)||[])put(member); for(const member of duplicates.get(row.part_id)||[])put(member); }
  return {directlyResolved,found};
}
const sourceFiles = observations.map(observation=>{
  const local = path.join(SNAPSHOTS,observation.relative_path), saved = current.source_files.find(row=>row.relative_path===observation.relative_path);
  assert(saved,"Named source absent from saved evidence"); assert.equal(sha(local),observation.sha256); assert.equal(saved.sha256,observation.sha256); assert.equal(fs.statSync(local).size,observation.bytes);
  const rows = ledger.filter(row=>row.source_kind==="test" && row.source_file.replace(/\\/g,"/").endsWith("/"+observation.relative_path)); assert(rows.length,"Named source absent from ledger");
  const testIds = new Set(rows.map(row=>row.source_part_id));
  const candidateRows = matches.filter(row=>testIds.has(row.source_part_id));
  const currentLinks = current.candidate_links.filter(row=>row.source_file===observation.relative_path);
  const manual = review.manual_reservations.filter(row=>row.test_relative_path===observation.relative_path);
  const seeds = unique([
    ...rows.flatMap(row=>["matched_part_id","matched_group_id","rank1_part_id","rank1_group_id","derived_from"].flatMap(k=>ids(row[k]))),
    ...candidateRows.flatMap(row=>["candidate_part_id","candidate_group_id","derived_from"].flatMap(k=>ids(row[k]))),
    ...currentLinks.map(row=>row.source_part_id), ...manual.flatMap(row=>row.source_ids)
  ]);
  const expanded = expand(seeds), missing = [...expanded.found].filter(id=>!closure.blockedSourceIds.has(id)); assert.deepEqual(missing,[]);
  return {...observation, observed_on:"2026-09-12", requested_path:observation.location==="shared"?path.join(SHARED,observation.relative_path):local, local_path:local, matches_saved_evidence:true,
    pages:saved.pages_or_docx_text_blocks, ledger_rows:rows.length, proposed_verdict_counts:rows.reduce((o,r)=>(o[r.proposed_verdict||"blank"]=(o[r.proposed_verdict||"blank"]||0)+1,o),{}),
    all_proposal_rows:candidateRows.length, saved_scan_candidates:currentLinks.length, directly_resolved_source_ids:[...expanded.directlyResolved].sort(), closed_source_ids:[...expanded.found].sort(), missing_reservations:missing};
});
const latest = read(abs("dist/ibphysics-release/latest.json"));
const releaseRoot = process.argv[2] ? path.resolve(process.argv[2]) : latest.root;
const cataloguePath = path.join(releaseRoot,"data/physics_catalogue.js"), pub = {window:{}};
vm.runInNewContext(fs.readFileSync(cataloguePath,"utf8"),pub);
const questions = pub.window.PHYSICS_QUESTIONS;
const blockedPages = new Set([...closure.blockedQuestionPageKeys].map(key=>key.split("/")[0]+"/"+pageNumber(key)));
const leaks = [];
for(const q of questions) {
  const parent=byNative.get(q.parent_id); assert(parent,"Released native parent missing");
  if(closure.blockedSourceIds.has(q.source_part_id)||closure.blockedParentIds.has(q.parent_id))leaks.push({source_part_id:q.source_part_id,reason:"reserved part or parent"});
  if(parent.parts.some(p=>closure.blockedSourceIds.has(p.source_part_id)))leaks.push({source_part_id:q.source_part_id,reason:"reserved sibling in full parent context"});
  if([...(parent.pages||[]),...(parent.crops||[]),...parent.parts.flatMap(p=>p.crops||[])].some(f=>blockedPages.has(parent.preview+"/"+pageNumber(f))))leaks.push({source_part_id:q.source_part_id,reason:"reserved question page in parent context"});
  assert(Number(q.year)<2026,"Forbidden exam year");
}
assert.deepEqual(leaks,[]);
const report = {
  schema_version:1, generated_utc:new Date().toISOString(), private_evidence:true,
  scope:"Byte identity and conservative linked-question closure for five explicitly named assessments; current released source-ID/parent/context-page check. Not blanket clearance of future candidates.",
  source_files:sourceFiles, all_five_match_saved_evidence:true,
  visual_review:{reviewed_on:"2026-09-12", prior_full_document_review:review.visually_reviewed_documents,
    additional_pages:[{relative_path:"A/A.1/A.1 Test 2024.pdf",pages:[19,20,21,22]},{relative_path:"A/A.1/A.1 Test 2025.pdf",pages:[19,20,21]},{relative_path:"A/A.1/A.1 Test 2026.pdf",pages:[19,20,21]},{relative_path:"C/C1-C2-C5 test.pdf",pages:[1]},{relative_path:"C/C1-C2-C5 test 2026.pdf",pages:[1]}],
    findings:["A1 2024 page20 is genuinely blank, with no hidden scanned question.","A1 2024/2025 final questions are earlier versions of the already reviewed 2026 numerical and authored recall tasks; existing candidate and equivalent-recall reservations remain additive.","C undated Q1 is an electromagnetic-spectrum task; 2026 replaces it with an authored SHM phase-constant task. Their Q2 is unchanged. Changed wavelength/frequency and Doppler tasks retain separate saved candidate evidence."]},
  current_release:{root:releaseRoot,catalogue_sha256:sha(cataloguePath),parts:questions.length,source_part_ids:unique(questions.map(q=>q.source_part_id)),linked_part_parent_sibling_page_leaks:leaks},
  additional_exclusions_required_for_this_verified_release:[],
  future_candidate_requirements:["Preserve all base ledger proposals, saved scan candidates and manual recall holds, expanded through full parents, cross-level groups, duplicates and reserved source pages.","Any newly recovered source IDs outside the 226 previously reviewed A1/C1 candidates require comparison with the authored and rewritten tasks; file freshness and no text hit do not certify them.","Every new crop, context and markscheme requires existing image ownership/overlap and original-PDF validation. This audit does not replace those gates."],
  unresolved_future_scope:review.reviewed_nonmatches.filter(row=>["C/C1-C2-C5 test 2026.pdf","A/A.1/A.1 Test 2026.pdf"].includes(row.test_relative_path)),
  fingerprints:[corpusPath,ledgerPath,matchesPath,nativePath,currentPath,...additional,abs("dist/physics-audit/a1-c1-assessments/native-review.json"),cataloguePath,__filename].map(file=>({path:file,sha256:sha(file)}))
};
const output=abs("reports/ib-five-named-assessments-review.json");fs.writeFileSync(output,JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({report:output,files:sourceFiles.map(f=>({name:f.relative_path,scan:f.saved_scan_candidates,direct:f.directly_resolved_source_ids.length,closed:f.closed_source_ids.length,missing:f.missing_reservations.length})),release_parts:questions.length,leaks:leaks.length}));
