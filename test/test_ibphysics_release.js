/* Validate an assembled multi-topic release, retaining the exact A5 boundary.
   Run: node test/test_ibphysics_release.js [release-root]
   Defaults to dist/ibphysics-release/latest.json; requires local source evidence. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm"), crypto = require("crypto");
const { JSDOM } = require("jsdom");
const ROOT = path.resolve(__dirname, "..");
const DB = path.resolve(process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases");
const read = p => fs.readFileSync(p, "utf8"), json = p => JSON.parse(read(p));
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const sorted = values => [...new Set(values)].sort();
const clone = value => JSON.parse(JSON.stringify(value));
const imageFields = ["question_images", "context_images", "markscheme_images"];
const { validateClearance } = require("../tools/assemble_ibphysics_release");
const { ibInput } = require("../tools/assemble_physics_preview");
const {reviewedInput,auditCrops,validateTopicClearance,clearancePath:topicClearancePath,analysisPaths}=require("../tools/ib-topic-release");
const {loadReviewedTopics,publicTaxonomy}=require("../tools/ib-reviewed-topics");
const {prepareRelease:prepareD2Release}=require("../tools/ib-d2-release");
const {mergeD2Release}=require("../tools/merge_ib_d2_release");
const {prepareRelease:prepareERelease,clearancePath:eClearancePath}=require("../tools/ib-e-topics-release");
const {mergeERelease}=require("../tools/merge_ib_e_topics_release");
const {loadA5AdditionalGeometry}=require("../tools/ib-a5-additional-geometry");
const {loadVerifiedUi,canReuseQuestion}=require("./helpers/ib_verified_ui");
const latestPath = path.join(ROOT, "dist/ibphysics-release/latest.json");
const latest = fs.existsSync(latestPath) ? json(latestPath) : null;
const releaseRoot = path.resolve(process.argv[2] || process.env.IBPHYSICS_RELEASE_ROOT || (latest && latest.root) || "missing-release");
assert(fs.existsSync(path.join(releaseRoot, "build-info.json")), "Assemble the cleared release before this check");
const info = json(path.join(releaseRoot, "build-info.json"));
const eTopicCodes=["E.1","E.2"].filter(topic=>info.topics.includes(topic));
const topicCodes=["A.1","A.5","C.1",...(info.topics.includes("D.2")?["D.2"]:[]),...eTopicCodes];
assert.deepStrictEqual(sorted(info.topics),topicCodes,"Only explicitly supported and separately cleared topics may be offered");
const d2=info.topics.includes("D.2")?prepareD2Release():null;
const eTopics=eTopicCodes.length?prepareERelease():null;
const eTaxonomies=eTopicCodes.map(topic=>({topic,...Object.fromEntries(["groups","atoms","types"].map(kind=>[kind,eTopics.taxonomy[kind].filter(item=>item.topic===topic)]))}));
const catalogueText = read(path.join(releaseRoot, "data/physics_catalogue.js"));
const box = { window: {} };
vm.runInNewContext(catalogueText, box, { timeout: 20000 });
const allQuestions = clone(box.window.PHYSICS_QUESTIONS), meta = clone(box.window.PHYSICS_META);
const reusedUiQuestions=process.argv.includes("--reuse-verified-ui")
  ?loadVerifiedUi({root:ROOT,releaseRoot,receipt:json(path.join(ROOT,"reports/ib-verified-ui-reference.json"))}):new Map();
// All pre-existing A5 UI/key/markscheme assertions continue to use this exact
// subset. Additional topics must pass their own source and clearance checks.
const questions=allQuestions.filter(q=>q.topic_codes.includes("A.5"));
const analysis = json(path.join(ROOT, "dist/physics-inputs/ib-a5-analysis.json"));
const clearance = json(path.join(ROOT, "reports/ib-a5-release-clearance.json"));
const a5CropReview=json(path.join(ROOT,"reports/ib-a5-shared-parent-crop-review.json"));
const cropExclusions=json(path.join(ROOT,"reports/ib-reviewed-crop-exclusions.json"));
const a5NewCropHolds=["ibchem_part_71630df3bdf6ab2f","ibchem_part_c07207339d141b80"];
const baselineFile=path.join(ROOT,"dist/ibphysics-release/ab0aa88396caf624-1789233551012/data/physics_catalogue.js");
const baselineText=read(baselineFile),baselineBox={window:{}};
assert.strictEqual(sha(baselineText),"f32aef8b1941bce59cfb49c0c7fce93ef5109064c34af000c289108b4c9fd1ca","The original 146-part A5 baseline must remain immutable");
vm.runInNewContext(baselineText,baselineBox,{timeout:20000});
const baselineA5=clone(baselineBox.window.PHYSICS_QUESTIONS).filter(q=>q.topic_codes.includes("A.5"));
const baseline144=baselineA5.filter(q=>!a5NewCropHolds.includes(q.source_part_id));
const a5Geometry=loadA5AdditionalGeometry();
const noteReview=json(path.join(ROOT,"reports/ib-review-note-reservations.json"));
assert.strictEqual(noteReview.review_complete,true);assert.deepStrictEqual(noteReview.unresolved_relevant_items,[]);
const a5NoteRemovals=noteReview.reviewed_public_removals.filter(r=>r.topic_codes.includes("A.5"));
assert.strictEqual(new Set(a5NoteRemovals.map(r=>r.source_part_id)).size,a5NoteRemovals.length);
for(const r of a5NoteRemovals){assert.strictEqual(r.baseline_build_id,"18a6bc2d3b649210");assert(baseline144.some(q=>q.source_part_id===r.source_part_id&&q.parent_id===r.parent_id));assert(r.reference_ids.length);}
for(const id of a5Geometry.heldParentIds)assert(baseline144.some(q=>q.parent_id===id),"A geometry hold must be inside the fixed A5 baseline");
const a5NoteHeld=new Set(a5NoteRemovals.map(r=>r.source_part_id));
const retainedBaselineA5=baseline144.filter(q=>!a5NoteHeld.has(q.source_part_id)&&!a5Geometry.heldParentIds.has(q.parent_id));
const expected = ibInput().questions.filter(q => q.topic_codes.includes("A.5"));
const reviewedTopics=loadReviewedTopics(analysisPaths),expandedInput=reviewedInput(),expandedAudit=auditCrops(expandedInput);
const beforeE=d2?mergeD2Release(expandedAudit.questions,d2.questions):expandedAudit.questions;
const expectedAll=eTopics?mergeERelease(beforeE,eTopics.questions):beforeE,expectedById = new Map(expectedAll.map(q => [q.id, q]));
const topicClearance=json(topicClearancePath);
const fingerprints = new Map(clearance.fingerprints.map(f => [path.resolve(f.path), f.sha256]));
let checked = 0;
/* Smith, 2026-09-19: "can you get errors to be more red, please? both the last two I've
   almost not given to you due to their general greenness." A wall of ok lines ending in
   an uncoloured Node stack reads as success at a glance. A failure now stops with a red
   banner naming the check, and the run ends in a red FAILED line rather than a stack. */
const RED = "[97;41m", RED_TEXT = "[31;1m", OFF = "[0m";
const red = (text, block) => process.stdout.isTTY ? (block ? RED : RED_TEXT) + text + OFF : text;
function fail(label, error) {
  console.error("\n" + red("  FAILED: " + label + "  ", true));
  console.error(red((error && error.message ? error.message : String(error)).split("\n").slice(0, 12).join("\n")));
  if (error && error.expected !== undefined) {
    console.error(red("  expected: " + JSON.stringify(error.expected).slice(0, 300)));
    console.error(red("  actual:   " + JSON.stringify(error.actual).slice(0, 300)));
  }
  console.error("\n" + red("  " + checked + " checks passed before this one. The release is NOT safe to publish.  ", true) + "\n");
  process.exit(1);
}
function check(label, run) {
  try { run(); } catch (error) { fail(label, error); }
  checked++; console.log("ok " + label);
}
/* Assertions outside a named check would otherwise still end in a bare stack. */
process.on("uncaughtException", (error) => fail("an assertion outside a named check", error));
function rejects(label, mutate) { check(label, () => { const changed = clone(clearance); mutate(changed); assert.throws(() => validateClearance(changed, expected)); }); }
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    assert(!entry.isSymbolicLink(), "Public package must not contain linked files");
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [path.relative(releaseRoot, file).replace(/\\/g, "/")];
  });
}
check("the A5 subset permits only the exact original crop, reviewed note and geometry removals", () => {
  assert.strictEqual(meta.release, true);
  assert.deepStrictEqual(Object.keys(meta.topics).sort(), topicCodes);
  assert.strictEqual(baselineA5.length,146);
  assert.strictEqual(baseline144.length,144);assert.strictEqual(new Set(baseline144.map(q=>q.parent_id)).size,70);
  assert.strictEqual(questions.length,retainedBaselineA5.length);
  assert.strictEqual(new Set(questions.map(q=>q.parent_id)).size,new Set(retainedBaselineA5.map(q=>q.parent_id)).size);
  assert.deepStrictEqual(sorted(questions.map(q=>q.source_part_id)),sorted(retainedBaselineA5.map(q=>q.source_part_id)));
  assert.deepStrictEqual(sorted(questions.map(q=>q.id)),sorted(retainedBaselineA5.map(q=>q.id)));
  assert.strictEqual(new Set(questions.map(q => q.id)).size, questions.length);
  assert.strictEqual(new Set(questions.map(q => q.source_part_id)).size, questions.length);
  assert.deepStrictEqual(sorted(questions.map(q => q.id)), sorted(expected.map(q => q.id)));
  assert.deepStrictEqual(sorted(questions.map(q => q.source_part_id)), sorted(clearance.reviewed_source_part_ids));
  assert.strictEqual(info.parts, allQuestions.length);
  for (const q of questions) {
    assert(q.topic_codes.includes("A.5"));
    assert(/^\d{4}$/.test(q.year) && Number(q.year) < 2026, q.id);
    assert.strictEqual(analysis.parts[q.source_part_id].status, "included", q.id);
    const a5Codes=values=>values.filter(code=>/^A5[._]/.test(code));
    assert.deepStrictEqual(sorted(a5Codes(q.analysis_groups)), sorted(analysis.parts[q.source_part_id].group_codes), q.id);
    assert(a5Codes(q.analysis_groups).length > 0);
    assert.deepStrictEqual(a5Codes(q.analysis_atoms), analysis.parts[q.source_part_id].atom_codes, q.id + " reviewed atoms");
    assert.deepStrictEqual(a5Codes(q.analysis_types), analysis.parts[q.source_part_id].type_codes, q.id + " reviewed finer types");
    assert.deepStrictEqual(a5Codes(q.analysis_used_atoms), analysis.parts[q.source_part_id].used_atom_codes, q.id + " required uses");
    assert.deepStrictEqual(a5Codes(q.analysis_optional_atoms), analysis.parts[q.source_part_id].optional_atom_codes, q.id + " optional routes");
    const source = expected.find(part=>part.id===q.id);
    for (const field of ["parent_id", "source_part_id", "marks", "paper", "level", "year", "question_number", "label", "correct_option", "answer_status"])
      assert.deepStrictEqual(q[field], source[field], q.id + " " + field);
  }
});
check("clearance binds the exact IDs,15 test questions and all current input bytes", () => {
  validateClearance(clearance, expected);
  assert.deepStrictEqual(clearance.test_questions.map(q => Number(q.question)).sort((a,b) => a-b), Array.from({length:15},(_,i) => i+1));
  const sourceImages = sorted(expected.flatMap(q => imageFields.flatMap(field => q[field] || [])));
  for (const file of sourceImages) {
    assert.strictEqual(fingerprints.get(path.resolve(file)), sha(fs.readFileSync(file)), "Missing current image witness: " + file);
  }
});
rejects("adding or dropping a reviewed part revokes clearance", c => c.reviewed_source_part_ids.pop());
rejects("unresolved test coverage revokes clearance", c => c.unresolved_relevant_items.push({question:1,reason:"pending"}));
rejects("duplicate test numbers cannot stand in for all15 questions", c => c.test_questions[14].question = c.test_questions[0].question);
rejects("changed evidence bytes revoke clearance", c => c.fingerprints[0].sha256 = "0".repeat(64));
rejects("missing required taxonomy fingerprint revokes clearance", c => {
  c.fingerprints = c.fingerprints.filter(f => path.resolve(f.path) !== path.join(ROOT, "dist/physics-inputs/ib-a5-analysis.json"));
});
rejects("missing served-image fingerprint revokes clearance", c => {
  const file = path.resolve(expected[0].question_images[0]);
  c.fingerprints = c.fingerprints.filter(f => path.resolve(f.path) !== file);
});
rejects("repeated evidence cannot replace independent fingerprints", c => c.fingerprints.push(clone(c.fingerprints[0])));
check("the entire package contains exactly the additional cleared topic memberships",()=>{
  assert.strictEqual(new Set(allQuestions.map(q=>q.id)).size,allQuestions.length);
  assert.strictEqual(new Set(allQuestions.map(q=>q.source_part_id)).size,allQuestions.length);
  assert.deepStrictEqual(sorted(allQuestions.map(q=>q.id)),sorted(expectedAll.map(q=>q.id)));
  assert.deepStrictEqual(sorted(allQuestions.flatMap(q=>q.topic_codes)),topicCodes);
  for(const q of allQuestions){
    const source=expectedById.get(q.id);assert(source,q.id);assert(Number(q.year)<2026,q.id);
    assert.deepStrictEqual(q.topic_codes,source.topic_codes.filter(code=>topicCodes.includes(code)),q.id);
    for(const field of ["source_part_id","parent_id","source_group_id","year","paper","level","marks","question_number","label","correct_option","answer_status","analysis_groups","analysis_atoms","analysis_types","analysis_used_atoms","analysis_optional_atoms","analysis_canonical_ids","current_topic_levels","practice_scope_notes"])
      assert.deepStrictEqual(q[field],source[field],q.id+" exact source "+field);
    for(const topic of reviewedTopics.filter(t=>q.topic_codes.includes(t.topic))){
      const part=topic.parts[q.source_part_id];assert(part,q.id+" reviewed source ID");assert.strictEqual(part.status,"included");
      assert(part.atom_codes.length>0||part.scope_reviewed===true,q.id+" direct descriptor or reviewed current scope");
      for(const [field,expectedField]of [["analysis_groups","group_codes"],["analysis_atoms","atom_codes"],["analysis_types","type_codes"],["analysis_used_atoms","used_atom_codes"],["analysis_optional_atoms","optional_atom_codes"]]){
        const availableCodes=new Set(topic[field==="analysis_groups"?"groups":field==="analysis_types"?"types":"atoms"].map(item=>item.code));
        assert.deepStrictEqual(q[field].filter(code=>availableCodes.has(code)),part[expectedField],q.id+" direct/dependency separation "+field);
      }
    }
  }
});
check("the two whole-parent removals agree with the completed visual review and global crop holds",()=>{
  assert.strictEqual(a5CropReview.schema_version,1);assert.strictEqual(a5CropReview.review_complete,true);
  assert.strictEqual(a5CropReview.topic,"A.5");assert.strictEqual(a5CropReview.baseline_build,"ab0aa88396caf624");
  assert.deepStrictEqual(sorted(a5CropReview.requires_correction_source_ids),a5NewCropHolds);
  for(const id of a5NewCropHolds){
    const reviewed=a5CropReview.records.find(row=>row.source_part_id===id),baseline=baselineA5.find(q=>q.source_part_id===id);
    assert(reviewed&&baseline,id);assert.strictEqual(reviewed.review_complete,true);assert.strictEqual(reviewed.disposition,"requires_presentation_correction_or_hold");
    assert.strictEqual(reviewed.parent_id,baseline.parent_id);assert(cropExclusions.source_part_ids.includes(id),id+" is globally withheld");
    assert(cropExclusions.reviewed_evidence.some(row=>row.source_part_id===id&&row.review_status==="withhold_question"),id+" has a recorded whole-question hold");
    assert(!allQuestions.some(q=>q.parent_id===baseline.parent_id),"A sibling cannot reintroduce held whole-parent context");
  }
  for(const id of a5CropReview.retain_unchanged_source_ids)if(retainedBaselineA5.some(q=>q.source_part_id===id))assert(questions.some(q=>q.source_part_id===id),"A visually retained A5 part cannot disappear without an explicit later hold: "+id);
  for(const q of questions){
    const before=retainedBaselineA5.find(part=>part.source_part_id===q.source_part_id);
    for(const field of imageFields){
      const omissions=field==="markscheme_images"?(a5Geometry.report.suppressed_assets||[]).filter(r=>r.source_part_id===q.source_part_id&&r.parent_id===q.parent_id):[];
      const expectedImages=before[field].filter(file=>!omissions.some(r=>r.sha256===sha(fs.readFileSync(path.join(path.dirname(path.dirname(baselineFile)),file)))));
      assert.strictEqual(before[field].length-expectedImages.length,omissions.length,q.id+" only exact reviewed image omissions are allowed");
      assert.deepStrictEqual(q[field],expectedImages,q.id+" other A5 image assignments remain unchanged");
    }
  }
});
check("missing reserved geometry needs exact visual evidence and cannot conceal invalid own crops",()=>{
  for(const file of a5Geometry.fingerprints)assert.strictEqual(fingerprints.get(path.resolve(file.path)),file.sha256,"A5 geometry witness is part of final clearance: "+file.path);
  const assets=clearance.rendered_asset_review.assets;
  for(const asset of assets){assert.strictEqual(asset.own_rectangles_valid,true);if(asset.missing_reserved_questions.length){assert(asset.additional_geometry_review);a5Geometry.requireException(asset);}else assert.strictEqual(asset.additional_geometry_review,null);}
  const example=a5Geometry.report.retained_records[0];assert(example,"The additional geometry review must retain its explicit exceptions");
  assert.throws(()=>a5Geometry.requireException({...example,sha256:"0".repeat(64)}),/Missing exact/);
  assert.throws(()=>a5Geometry.requireException({...example,source_part_id:"ibchem_part_0000000000000000"}),/Missing exact/);
  assert.throws(()=>a5Geometry.requireException({...example,missing_reserved_questions:[...example.missing_reserved_questions,"Z999"]}),/Missing exact/);
});
check("public taxonomy and typed counts retain authored mappings, without inventing fine descriptors",()=>{
  for(const topic of reviewedTopics){
    for(const kind of ["groups","atoms","types"]){
      const codes=new Set(topic[kind].map(item=>item.code));
      assert.deepStrictEqual(meta.analysis[kind].filter(item=>codes.has(item.code)),publicTaxonomy(topic[kind]),topic.topic+" "+kind);
    }
    const selected=allQuestions.filter(q=>q.topic_codes.includes(topic.topic));
    const counts={parts:selected.length,typed_parts:selected.filter(q=>topic.parts[q.source_part_id].atom_codes.length>0).length};
    assert.deepStrictEqual(meta.topic_mapping_counts[topic.topic],counts);assert.deepStrictEqual(info.topic_counts[topic.topic],counts);
    assert.strictEqual(topicClearance.counts[topic.topic].parts,selected.length);
    assert.strictEqual(topicClearance.counts[topic.topic].typed_parts,counts.typed_parts);
  }
  assert.deepStrictEqual(info.topics,topicCodes);
  if(d2){
    const selected=allQuestions.filter(q=>q.topic_codes.includes("D.2"));
    assert.deepStrictEqual(sorted(selected.map(q=>q.source_part_id)),d2.clearance.reviewed_source_part_ids);
    const counts={parts:selected.length,typed_parts:selected.length};
    assert.deepStrictEqual(meta.topic_mapping_counts["D.2"],counts);
    assert.deepStrictEqual(info.topic_counts["D.2"],counts);
    for(const kind of ["groups","atoms","types"]){
      const codes=new Set(d2.taxonomy[kind].map(item=>item.code));
      assert.deepStrictEqual(meta.analysis[kind].filter(item=>codes.has(item.code)),d2.taxonomy[kind]);
    }
    assert(d2.clearance.review_complete && !d2.clearance.unresolved_relevant_items.length);
    const offered=new Set(selected.map(q=>q.source_part_id));
    for(const id of json(d2.clearance.input.path).report.separate_DATA_source_ids)assert(!offered.has(id));
    for(const q of selected)assert(["HL","HLSL"].includes(q.current_topic_levels?.["D.2"]));
  }
  if(eTopics){
    const eSelected=allQuestions.filter(q=>q.topic_codes.some(topic=>eTopicCodes.includes(topic)));
    assert.deepStrictEqual(sorted(eSelected.map(q=>q.source_part_id)),eTopics.clearance.reviewed_source_part_ids);
    assert.deepStrictEqual(sorted(eTopics.questions.flatMap(q=>q.topic_codes)),eTopicCodes,"The combined clearance cannot silently drop an E topic");
    for(const kind of ["groups","atoms","types"]){
      const codes=new Set(eTopics.taxonomy[kind].map(item=>item.code));
      assert.strictEqual(codes.size,eTopics.taxonomy[kind].length,"E taxonomy codes must remain unique");
      assert.deepStrictEqual(meta.analysis[kind].filter(item=>codes.has(item.code)),eTopics.taxonomy[kind]);
    }
    for(const topic of eTaxonomies){
      const selected=eSelected.filter(q=>q.topic_codes.includes(topic.topic)),codes=new Set(topic.atoms.map(atom=>atom.code));
      const counts={parts:selected.length,typed_parts:selected.filter(q=>q.analysis_atoms.some(code=>codes.has(code))).length};
      assert(counts.parts>0,"An offered E topic must have cleared parts");
      assert.deepStrictEqual(meta.topic_mapping_counts[topic.topic],counts);
      assert.deepStrictEqual(info.topic_counts[topic.topic],counts);
      assert.strictEqual(eTopics.clearance.counts[topic.topic].parts,counts.parts);
      assert.strictEqual(eTopics.clearance.counts[topic.topic].typed_parts,counts.typed_parts);
      for(const q of selected)assert(["HL","HLSL"].includes(q.current_topic_levels?.[topic.topic]),q.id+" current E level must be explicit");
    }
    assert.strictEqual(meta.topics["E.1"],"Structure of the atom");
    assert.strictEqual(meta.topics["E.2"],"Quantum physics");
  }
  const a1=reviewedTopics.find(t=>t.topic==="A.1");
  assert.strictEqual(a1.report.counts.previous_preview_a1_total,529);
  assert.strictEqual(a1.report.counts.previous_preview_a1.included,181,"The earlier 181 was a reviewed subset of the old preview, not a cap on full-corpus mappings");
  assert.strictEqual(a1.report.counts.all_parts.included,Object.values(a1.parts).filter(part=>part.status==="included").length);
  console.log("  A1 reviewed old-preview parts: 181; full reviewed source parts: "+a1.report.counts.all_parts.included+"; final A1: "+meta.topic_mapping_counts["A.1"].parts+"; A5: exact reviewed baseline subset = "+questions.length);
});
check("additional-topic clearance binds its exact scope, source evidence and every rendered asset",()=>validateTopicClearance(topicClearance,expectedAll));
if(eTopics)check("E clearance matches freshly regenerated scope, source bytes, crop roles and existing-topic safety",()=>{
  const stored=json(eClearancePath);
  assert.strictEqual(stored.schema_version,1);assert.strictEqual(stored.review_complete,true);
  assert.deepStrictEqual(stored.topics,["E.1","E.2"]);assert.deepStrictEqual(stored.unresolved_relevant_items,[]);
  assert.deepStrictEqual(stored,eTopics.clearance,"Every saved E clearance field must match the fresh independent projection");
  const sourceHashes=new Map(stored.fingerprints.map(file=>[path.resolve(file.path),file.sha256]));
  assert.strictEqual(sourceHashes.size,stored.fingerprints.length,"Repeated E source evidence is not independent evidence");
  for(const file of stored.fingerprints)assert.strictEqual(sha(fs.readFileSync(file.path)),file.sha256,"Current E source witness: "+file.path);
  assert.deepStrictEqual(sorted(stored.reviewed_parent_ids),sorted(eTopics.questions.map(q=>q.parent_id)));
  const roleOf={question_images:"question",context_images:"context",markscheme_images:"markscheme"};
  const tuple=row=>JSON.stringify([row.source_part_id,row.parent_id,row.role,path.resolve(row.path)]);
  assert.deepStrictEqual(sorted(stored.assets.map(tuple)),sorted(eTopics.questions.flatMap(q=>imageFields.flatMap(field=>(q[field]||[]).map(file=>tuple({source_part_id:q.source_part_id,parent_id:q.parent_id,role:roleOf[field],path:file}))))));
  for(const asset of stored.assets){
    assert.strictEqual(sourceHashes.get(path.resolve(asset.path)),asset.sha256,"A rendered E crop must have an exact source fingerprint");
    assert(sourceHashes.has(path.resolve(asset.metadata_path)),"An E crop must bind its original owner metadata");
  }
  for(const q of eTopics.questions){
    for(const role of ["question","mark_scheme"]){
      const originals=stored.originals.filter(row=>row.source_part_id===q.source_part_id&&row.role===role);
      assert.strictEqual(originals.length,1,q.id+" one original PDF per role");
      assert.strictEqual(sourceHashes.get(path.resolve(originals[0].path)),originals[0].sha256);
    }
  }
  for(const q of beforeE){
    assert(!eTopics.safety.blockedParentIds.has(q.parent_id)&&!eTopics.safety.blockedSourceIds.has(q.source_part_id)&&!eTopics.safety.qualityHolds.has(q.source_part_id),"A new E review cannot leave an affected existing-topic record: "+q.id);
    for(const file of [...q.question_images,...q.context_images]){
      const preview=path.basename(path.dirname(path.dirname(file))),page=Number((/_p(\d+)(?:_|\.)/.exec(file)||[])[1]);
      assert(!eTopics.safety.heldPages.has(preview+"/"+page),"An existing topic cannot expose a newly reserved E page: "+q.id);
    }
  }
  if(latest&&latest.build_id===info.build_id){
    const record=latest.additional_clearances.find(file=>path.resolve(file.path)===path.resolve(eClearancePath));
    assert(record,"The staged package must bind its combined E clearance");
    assert.strictEqual(record.sha256,sha(fs.readFileSync(eClearancePath)));
  }
});
function rejectsTopic(label,mutate){check(label,()=>{const changed=clone(topicClearance);mutate(changed);assert.throws(()=>validateTopicClearance(changed,expectedAll));});}
rejectsTopic("a dropped additional-topic source ID invalidates clearance",c=>c.reviewed_source_part_ids.pop());
rejectsTopic("unresolved additional-topic assessment items cannot be published",c=>c.unresolved_relevant_items.push({reason:"Synthetic pending review"}));
rejectsTopic("changed additional-topic source evidence invalidates clearance",c=>c.fingerprints[0].sha256="0".repeat(64));
rejectsTopic("missing additional-topic taxonomy provenance invalidates clearance",c=>{const file=path.resolve(ROOT,analysisPaths[0]);c.fingerprints=c.fingerprints.filter(f=>path.resolve(f.path)!==file);});
rejectsTopic("missing native-catalogue provenance invalidates additional-topic clearance",c=>{const file=path.resolve(DB,"Physics Categorisation/viewer/ibphysics_catalogue.js");c.fingerprints=c.fingerprints.filter(f=>path.resolve(f.path)!==file);});
rejectsTopic("a missing additional-topic crop invalidates clearance",c=>{const omitted=path.resolve(c.assets[0].path);c.assets=c.assets.filter(asset=>path.resolve(asset.path)!==omitted);});
rejectsTopic("repeated additional-topic fingerprints cannot replace required evidence",c=>c.fingerprints.push(clone(c.fingerprints[0])));
check("an existing source ID cannot be relabelled as another native part",()=>{
  const changed=clone(expectedAll),part=changed.find(q=>q.topic_codes.some(code=>["A.1","C.1"].includes(code))&&q.answer_status!=="matched_source_key");
  assert(part,"A structured part exercises native identity independently of the stricter MCQ key lookup");
  part.id+="-not-the-reviewed-part";
  assert.throws(()=>validateTopicClearance(topicClearance,changed),error=>/identity/i.test(error.message)&&/native.*(?:parent|part)/i.test(error.message));
});
const files = walk(releaseRoot), references = new Set();
check("public files contain only the page,viewer,bundle and referenced cropped images", () => {
  const fixed = new Set(["index.html", "physics-config.js", "physics-identity.js", "physics-login.js", "physics-reporting.js", "engine/ppqviewer.js", "engine/ppqviewer.css", "data/physics_catalogue.js", "build-info.json", ".nojekyll"]);
  for (const file of files) assert(fixed.has(file) || /^assets\/[a-f0-9]{64}\.png$/.test(file), "Unexpected public file: " + file);
  for (const q of allQuestions) for (const field of imageFields) {
    const source = expectedById.get(q.id);
    const expectedUrls = (source[field] || []).map(file => {
      const relative = path.relative(path.join(DB, "outputs/previews"), path.resolve(file));
      assert(relative && !relative.startsWith("..") && !path.isAbsolute(relative));
      assert(/[\\/]crops[\\/](?:question|mark)_.*\.png$/i.test(file), "Whole pages must never be served");
      return "assets/" + sha(fs.readFileSync(file)) + ".png";
    });
    assert.deepStrictEqual(q[field], expectedUrls, q.id + " " + field);
    for (const url of q[field]) {
      assert(/^assets\/[a-f0-9]{64}\.png$/.test(url));
      references.add(url);
      assert.strictEqual(sha(fs.readFileSync(path.join(releaseRoot, url))), path.basename(url, ".png"));
    }
  }
  assert.deepStrictEqual(sorted(files.filter(file => file.startsWith("assets/"))), sorted(references));
  assert.strictEqual(info.assets, references.size);
});
check("public metadata contains no private evidence, assessment policy or source paths", () => {
  const metadataText = JSON.stringify({meta, questions:allQuestions, info});
  assert(!/[A-Z]:[\\/]|Shared drives|PaperDatabases|physics-audit|PACKET_006|\.docx?\b|\.xlsx?\b/i.test(metadataText));
  const allowedMeta = new Set(["course", "title", "release", "default_topic", "topics", "analysis", "topic_mapping_counts"]);
  assert(Object.keys(meta).every(key => allowedMeta.has(key)));
  const allowedInfo = new Set(["build_id", "built_at", "topics", "topic_counts", "parts", "groups", "assets", "crop_notices", "analysis_source"]);
  assert(Object.keys(info).every(key => allowedInfo.has(key)));
  assert(meta.analysis.groups.every(group => Object.keys(group).every(key => ["code","label","summary","checks","classification_note","display_code","topic"].includes(key))));
  for(const kind of ["groups","atoms","types"]){
    const owned=new Map([...(d2?d2.taxonomy[kind]:[]),...(eTopics?eTopics.taxonomy[kind]:[])].map(item=>[item.code,item.topic]));
    for(const item of meta.analysis[kind]){
      if(owned.has(item.code)){
        assert(["D.2",...eTopicCodes].includes(owned.get(item.code)),"An explicit taxonomy owner must be an offered, reviewed topic");
        assert.strictEqual(item.topic,owned.get(item.code),"The descriptor must keep its reviewed topic owner and authored stored key");
      }else assert(!Object.hasOwn(item,"topic"),"Explicit topic ownership is restricted to independently reviewed descriptors");
    }
  }
  const privateKeys = /^(?:report|source_report|source_files|fingerprints|reviewed_evidence|candidate_records|blocked_source_ids|school_test_files|source_row_ids|canonical_row_ids|mapping_method|exclusion_review_complete|preview_notice|assessment(?:_.*)?|source_year_policy|clearance|test_questions|reviewed_source_part_ids|unresolved_relevant_items|rendered_asset_review)$/;
  function inspect(value) { if (!value || typeof value !== "object") return; for (const [key, child] of Object.entries(value)) { assert(!privateKeys.test(key), key); inspect(child); } }
  inspect(meta); inspect(allQuestions); inspect(info);
  assert(!/\b(?:mocks?|assessment clearance|reserved (?:for|test)|teacher preview)\b/i.test(metadataText));
  for (const q of allQuestions) assert(!q.source_notice, "No pupil-facing assessment notice: " + q.id);
});
check("release runs the exact frozen shared engine and consumer config", () => {
  assert.strictEqual(sha(fs.readFileSync(path.join(releaseRoot,"physics-reporting.js"))),sha(fs.readFileSync(path.join(ROOT,"example/physics-reporting.js"))));
  for (const [published, source] of [["engine/ppqviewer.js","engine/ppqviewer.js"],["engine/ppqviewer.css","engine/ppqviewer.css"],["physics-config.js","example/physics-config.js"],["physics-identity.js","example/physics-identity.js"],["physics-login.js","example/physics-login.js"]])
    assert.strictEqual(sha(fs.readFileSync(path.join(releaseRoot, published))), sha(fs.readFileSync(path.join(ROOT, source))));
});
/* Smith 2026-09-22 (B(b)): a part whose question picture also shows the previous sub-part
   stays served with a notice, until the crop repair lands. The notice must ride only on the
   exact picture it was proven on, so a repaired crop (new hash) drops it by itself. */
const cropNoticePath = path.join(ROOT, "reports/ib-crop-notices.json");
const cropNoticeList = fs.existsSync(cropNoticePath) ? json(cropNoticePath) : null;
check("crop notices ride only on the exact served picture each was proven on", () => {
  const byId = new Map(allQuestions.map(q => [q.id, q]));
  const expectedNotes = new Map();
  if (cropNoticeList) {
    assert.strictEqual(cropNoticeList.schema_version, 1);
    for (const n of cropNoticeList.notices) {
      assert(["contained", "identical"].includes(n.verdict), "only a proven verdict may carry a notice: " + n.served_id);
      const q = byId.get(n.served_id);
      if (q && q.source_part_id === n.source_part_id && q.question_images.includes("assets/" + n.crop_sha256 + ".png"))
        expectedNotes.set(n.served_id + "|" + n.crop_sha256, {kind:n.kind, this_label:n.this_label, other_label:n.other_label});
    }
  }
  let carried = 0;
  for (const q of allQuestions) {
    const notes = Array.isArray(q.crop_notes) ? q.crop_notes : [];
    assert(!Object.hasOwn(q, "crop_notes") || notes.length, "crop_notes is present only when it holds a notice: " + q.id);
    for (const note of notes) {
      assert(note.kind && note.this_label && note.other_label && Object.keys(note).length === 3, "a public crop note carries labels and kind only: " + q.id);
      const key = [...expectedNotes.keys()].find(k => k.startsWith(q.id + "|") && JSON.stringify(expectedNotes.get(k)) === JSON.stringify(note));
      assert(key, "a served crop note must be proven on this part's exact picture: " + q.id);
      expectedNotes.delete(key); carried++;
    }
  }
  assert.strictEqual(expectedNotes.size, 0, "every proven notice for a served picture must be carried: " + [...expectedNotes.keys()].slice(0, 5).join(", "));
  assert.strictEqual(info.crop_notices || 0, carried, "build-info counts the notices actually carried");
});
const html = read(path.join(releaseRoot, "index.html"));
const dom = new JSDOM(html, {url:"https://example.test/ibphysicsppqs/?topic=A.5", runScripts:"outside-only", pretendToBeVisual:true});
try {
  const w = dom.window;
  w.confirm = () => true;
  // Analytics are checked as document dependencies, never executed by this test.
  w.eval(catalogueText);
  w.eval(read(path.join(releaseRoot, "engine/ppqviewer.js")));
  w.localStorage.setItem("smithics_fields_identity_v1", JSON.stringify({anonymous_id:"release-fixture",display_name:"Fixture Pupil",signed_in:true,
    contexts:{physics:{anonymous_id:"release-fixture",display_name:"Fixture Pupil",cohort:"Test"}}}));
  w.eval(read(path.join(releaseRoot, "physics-identity.js"))); w.eval(read(path.join(releaseRoot, "physics-login.js")));
  w.eval(read(path.join(releaseRoot, "physics-config.js")));
  w.eval(read(path.join(releaseRoot, "physics-reporting.js")));
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))
    if (match[1].includes("window.physicsViewer =")) w.eval(match[1]);
  const v = w.physicsViewer, root = w.document.getElementById("ppq-root");
  /* d029 (HL/SL twins). A question printed in both papers is one question, and the
     pupil meets it in their own level's printing, so a single learner no longer sees
     every cleared part. The release guarantee is therefore stated in three parts, and
     it is stricter than the one it replaces, not looser:
       1. each level's view is exactly the collapse of the cleared set for that level;
       2. the two views TOGETHER are exactly the cleared set, so nothing a clearance
          approved can become unreachable at both levels;
       3. every cross-level pair splits, one printing to each level, never both to one.
     Counts a pupil can click (facet badges) carry the reachable number; progress REPORT
     denominators deliberately still span the whole bank, as noted further down. */
  function collapseFor(list, level) {
    const groups = new Map();
    list.forEach(q => { const key = q.source_group_id; if (!key) return; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(q); });
    const drop = new Set();
    groups.forEach(members => {
      if (members.length < 2 || new Set(members.map(q => q.level)).size < 2) return;
      const native = members.filter(q => q.level === level);
      const keep = native.length ? native[0] : members[0];
      members.forEach(q => { if (q !== keep) drop.add(q.id); });
    });
    return list.filter(q => !drop.has(q.id));
  }
  /* d030: A5 leads every part in its cleared set, so leadOnly is a no-op here; it is
     applied anyway so the expectation is built by the same rule the viewer uses. */
  const leadOnly = (list, topic) => list.filter(q => q.topic_codes[0] === topic);
  const a5HL = collapseFor(leadOnly(questions, "A.5"), "HL"), a5SL = collapseFor(leadOnly(questions, "A.5"), "SL");
  function atLevel(level) { v.store.prefs.learnerLevel = level; v.filterQuestions(); return sorted(v.view.map(q => q.id)); }
  function press(key) {
    root.dispatchEvent(new w.Event("pointerdown", {bubbles:true}));
    root.dispatchEvent(new w.KeyboardEvent("keydown", {key, bubbles:true, cancelable:true}));
  }
  check("published page counts parts and opens its A5 family dashboard", () => {
    assert(v);
    assert.strictEqual(v.cfg.itemNoun, "part");
    assert.strictEqual(v.cfg.defaultOrder, "shuffle");
    assert.strictEqual(v.cfg.practiceSelection.defaultMode, "mix");
    assert(v.cfg.attemptHistory.enabled && v.cfg.attemptHistory.defaultVisible);
    assert.strictEqual(v.cfg.sideRating.enabled,false);
    assert.strictEqual(v.cfg.selfReport.autoReveal,true);
    assert(!root.querySelector(".ppq-side-rating"));
    assert(root.querySelector(".ppq-card > .ppq-competence.ppq-inline-rating"));
    assert.strictEqual(v.view.length, a5HL.length); /* d029: the default learner is HL */
    assert.match(root.querySelector(".ppq-counter").textContent, new RegExp("^" + a5HL.length + " in complete mix\\s*/\\s*" + a5HL.length + " parts"));
    assert(root.querySelector(".ppq-dash-facet-content"));
    assert(!root.querySelector(".ppq-dash-left"), "Keep one dashboard on the right");
    const pupilPage = w.document.body.cloneNode(true);
    pupilPage.querySelectorAll("script,style,[hidden]").forEach(node => node.remove());
    assert(!/\b(?:mocks?|assessment clearance|reserved (?:for|test)|teacher preview)\b/i.test(pupilPage.textContent));
  });
  check("both levels together reach every cleared A5 part, and each twin splits one printing per level", () => {
    const hl = atLevel("HL"), sl = atLevel("SL");
    assert.deepStrictEqual(hl, sorted(a5HL.map(q => q.id)), "the HL view is the HL collapse of the cleared set");
    assert.deepStrictEqual(sl, sorted(a5SL.map(q => q.id)), "the SL view is the SL collapse of the cleared set");
    /* d030: the union is measured against the parts A5 LEADS. A part A5 merely shares
       is reachable through the topic that does lead it, and through a shared link, which
       the byId sweep at the end of this check proves for every cleared printing. */
    const led = leadOnly(questions, "A.5");
    assert.deepStrictEqual(sorted([...new Set([...hl, ...sl])]), sorted(led.map(q => q.id)),
      "no part this topic leads may be unreachable at both levels");
    const pairs = new Map();
    led.forEach(q => { if (!q.source_group_id) return; if (!pairs.has(q.source_group_id)) pairs.set(q.source_group_id, []); pairs.get(q.source_group_id).push(q); });
    let split = 0;
    pairs.forEach(members => {
      if (members.length < 2 || new Set(members.map(q => q.level)).size < 2) return;
      split++;
      const inHL = members.filter(q => hl.includes(q.id)), inSL = members.filter(q => sl.includes(q.id));
      assert.strictEqual(inHL.length, 1, "exactly one printing reaches an HL learner");
      assert.strictEqual(inSL.length, 1, "exactly one printing reaches an SL learner");
      assert.notStrictEqual(inHL[0].id, inSL[0].id, "the two levels must not be served the same printing");
      assert.strictEqual(inHL[0].level, "HL"); assert.strictEqual(inSL[0].level, "SL");
    });
    assert.strictEqual(split, led.length - a5HL.length, "every part the collapse removes is accounted for by a split pair");
    assert(split > 0, "A5 has cross-level pairs; a zero here means the twin key stopped resolving");
    assert.deepStrictEqual(atLevel("HL"), hl, "the HL view is restored for the checks that follow");
    for (const q of questions) assert(v.byId[q.id], "every cleared printing stays addressable by a shared link at either level");
  });
  check("a served part with a proven wide crop tells the pupil which part to answer, above the picture", () => {
    const noticed = allQuestions.filter(q => Array.isArray(q.crop_notes) && q.crop_notes.length);
    if (!noticed.length) { assert(!cropNoticeList || !cropNoticeList.notices.length, "a non-empty notice list must reach at least one served part"); return; }
    const target = noticed.find(q => q.topic_codes[0] === "A.5" && q.level === "HL") || noticed[0];
    const before = v.cur && v.cur.id;
    v.goToId(target.id);
    assert.strictEqual(v.cur.id, target.id);
    const boxes = Array.from(root.querySelectorAll(".ppq-notice-warn")).filter(box => /Answer part .* only\./.test(box.textContent));
    assert.strictEqual(boxes.length, target.crop_notes.length, "one warning per proven notice");
    for (const note of target.crop_notes)
      assert(boxes.some(box => box.textContent.includes("also shows part " + note.other_label) && box.textContent.includes("Answer part " + note.this_label + " only.")), target.id);
    const picture = root.querySelector(".ppq-card img.ppq-crop, .ppq-card img");
    assert(picture && (boxes[0].compareDocumentPosition(picture) & w.Node.DOCUMENT_POSITION_FOLLOWING), "the notice comes before the picture it warns about");
    const clean = allQuestions.find(q => !q.crop_notes && q.topic_codes[0] === "A.5" && q.level === "HL");
    v.goToId(clean.id);
    assert(!Array.from(root.querySelectorAll(".ppq-notice-warn")).some(box => /Answer part .* only\./.test(box.textContent)), "no notice leaks onto a clean part");
    if (before) v.goToId(before);
  });
  check("every offered question-type count and click filter exactly match reviewed part membership", () => {
    const groups = meta.analysis.atoms.filter(group => /^A5\./.test(group.code)&&questions.some(q => q.analysis_atoms.includes(group.code)));
    assert.strictEqual(root.querySelectorAll(".ppq-facet-cat").length, groups.length);
    for (const [index, group] of groups.entries()) {
      const expectedIds = sorted(a5HL.filter(q => q.analysis_atoms.includes(group.code)).map(q => q.id)); /* d029 */
      const button = root.querySelector('.ppq-facet-cat[data-value="' + group.code + '"]');
      assert(button);
      assert(button.textContent.includes(group.label + " (" + group.code + ")"), "Question types use the shared stable labels and IDs");
      assert.strictEqual(Number(button.querySelector(".ppq-cat-count").textContent.replace(/[()]/g,"")), expectedIds.length);
      button.click();
      assert.deepStrictEqual(sorted(v.view.map(q => q.id)), expectedIds);
      assert(root.querySelector(".ppq-facet-guidance"));
      root.querySelector(".ppq-facet-clear").click();
      assert.strictEqual(v.view.length, a5HL.length); /* d029 */
    }
    const stats = v._progressStats().axes.find(axis => axis.key === "question_type");
    // The progress report spans the whole bank; the visible topic facet above
    // remains constrained to A5. Preserve both denominators explicitly.
    for (const row of stats.rows) assert.strictEqual(row.available, allQuestions.filter(q => q.analysis_atoms.includes(row.value)).length);
    for (const row of stats.rows.filter(row=>/^A5\./.test(row.value)))assert.strictEqual(row.available,questions.filter(q=>q.analysis_atoms.includes(row.value)).length);
  });
  check("finer type and legacy-group filters retain exact question identities", () => {
    const atomSelect = root.querySelector('select[aria-label="question type"]');
    const detailSelect = root.querySelector('select[aria-label="detail"]');
    const groupSelect = root.querySelector('select[aria-label="question group"]');
    assert(atomSelect && detailSelect && groupSelect);
    function select(node, value) { node.value=value; node.dispatchEvent(new w.Event("change",{bubbles:true})); }
    for (const child of meta.analysis.types.filter(t=>/^A5\./.test(t.code)&&questions.some(q=>q.analysis_types.includes(t.code)))) {
      select(atomSelect, child.parent_atom);
      select(detailSelect, child.code);
      assert.deepStrictEqual(sorted(v.view.map(q=>q.id)),sorted(a5HL.filter(q=>q.analysis_types.includes(child.code)).map(q=>q.id))); /* d029 */
      select(detailSelect,"ALL"); select(atomSelect,"ALL");
    }
    for (const group of meta.analysis.groups.filter(g=>/^A5\./.test(g.code)&&questions.some(q=>q.analysis_groups.includes(g.code)))) {
      select(groupSelect,group.code);
      assert.deepStrictEqual(sorted(v.view.map(q=>q.id)),sorted(a5HL.filter(q=>q.analysis_groups.includes(group.code)).map(q=>q.id))); /* d029 */
      select(groupSelect,"ALL");
    }
  });
  check("IB paper and year-range filters select the exact source parts without rewriting provenance", () => {
    const paper = root.querySelector('select[aria-label="paper"]'), years = root.querySelector('select[aria-label="year range"]');
    assert(paper && years);
    assert.strictEqual(v.cfg.filters.find(f => f.label === "paper").field,"practice_paper");
    assert.strictEqual(v.cfg.filters.find(f => f.label === "year range").field,"year_range");
    const periods = [[2004,2009],[2010,2015],[2016,2020],[2021,2025]];
    assert.deepStrictEqual(Array.from(paper.options,o=>o.value).filter(x=>x!=="ALL"),["1","2"]);
    assert.deepStrictEqual(Array.from(years.options,o=>o.value).filter(x=>x!=="ALL"),periods.map(([a,b])=>a+"-"+b));
    function select(node,value) { node.value=value; node.dispatchEvent(new w.Event("change",{bubbles:true})); }
    for (const paperValue of ["1","2"]) {
      select(paper,paperValue);
      for (const [lo,hi] of periods) {
        select(years,lo+"-"+hi);
        const expectedIds=a5HL.filter(q => (/^1(?:A|B)?$/.test(q.paper)?"1":"2") === paperValue && Number(q.year)>=lo && Number(q.year)<=hi).map(q=>q.id); /* d029 */
        assert.deepStrictEqual(sorted(v.view.map(q=>q.id)),sorted(expectedIds));
        for (const q of v.view) {
          const source=expectedById.get(q.id);
          assert.strictEqual(q.paper,source.paper);
          assert.strictEqual(q.year,source.year);
        }
      }
      select(years,"ALL");
    }
    select(paper,"ALL");
    assert.strictEqual(v.view.length,a5HL.length); /* d029 */
  });
  check("the real topic selectors keep exact part scope and only their own descriptors",()=>{
    const topicSelect=root.querySelector('select[aria-label="topic"]');
    function select(node,value){node.value=value;node.dispatchEvent(new w.Event("change",{bubbles:true}));}
    for(const topic of [...reviewedTopics,...(d2?[{topic:"D.2",...d2.taxonomy}]:[]),...eTaxonomies]){
      select(topicSelect,topic.topic);
      const selected=allQuestions.filter(q=>q.topic_codes.includes(topic.topic)),allowed=new Set(topic.atoms.map(atom=>atom.code));
      /* d029/d030: `selected` stays the cleared scope, because the clearance comparisons
         below are about what was approved. `reachable` is what this learner is served:
         the parts this topic LEADS (d030), then collapsed to their level (d029). */
      const reachable=collapseFor(selected.filter(q=>q.topic_codes[0]===topic.topic),"HL");
      assert.deepStrictEqual(sorted(v.view.map(q=>q.id)),sorted(reachable.map(q=>q.id)));
      /* d030: the types offered are those with a question behind them in THIS topic's
         pool, not those the cleared scope mentions. E1.6D left E1's list because its
         only question leads with D2, so the button would have opened nothing; the
         question itself is still served, under D2. A dead category is worse than an
         absent one, which is what the emptiness check below states outright. */
      const expectedCodes=sorted(reachable.flatMap(q=>q.analysis_atoms.filter(code=>allowed.has(code))));
      const categories=Array.from(root.querySelectorAll(".ppq-facet-cat"));
      assert.deepStrictEqual(sorted(categories.map(button=>button.dataset.value)),expectedCodes,topic.topic+" facet categories");
      for(const button of categories)assert(reachable.some(q=>q.analysis_atoms.includes(button.dataset.value)),topic.topic+" offers "+button.dataset.value+" with no question behind it");
      for(const button of categories)assert.strictEqual(Number(button.querySelector(".ppq-cat-count").textContent.replace(/[()]/g,"")),reachable.filter(q=>q.analysis_atoms.includes(button.dataset.value)).length,topic.topic+" facet badge must count what clicking it opens"); /* d029 */
      if(topic.topic==="C.1"){
        const version=topic.report.descriptor_example_recovery.taxonomy_version;
        const typeSelect=root.querySelector('select[aria-label="question type"]');
        const typed=selected.filter(q=>q.analysis_atoms.some(code=>allowed.has(code)));
        assert.strictEqual(typed.length,7,"The recovered examples type seven existing C1 parts");
        assert.strictEqual(categories.length,7,"Eight memberships cover seven distinct delivered-workbook types");
        assert.strictEqual(typed.reduce((total,q)=>total+q.analysis_atoms.filter(code=>allowed.has(code)).length,0),8);
        for(const button of categories){
          const code=button.dataset.value,authored=topic.atoms.find(atom=>atom.code===code),published=meta.analysis.atoms.find(atom=>atom.code===code);
          assert(code.startsWith(version+":"),"Stable stored membership retains the exact workbook version");
          assert.strictEqual(published.display_code,authored.authored_code,"Display shorthand comes from the authored code");
          const expectedLabel=authored.label+" ("+authored.authored_code+")";
          const name=button.querySelector(".ppq-cat-name").cloneNode(true);name.querySelector(".ppq-cat-count").remove();
          assert.strictEqual(name.textContent.trim(),expectedLabel,"C1 sidebar uses the concise authored code");
          assert(!/WORKBOOK|cc4e297f2763/.test(name.textContent),"Vocabulary namespace/hash must not become a learner-facing label");
          const option=Array.from(typeSelect.options).find(option=>option.value===code);
          assert(option&&option.textContent.includes(expectedLabel),"The C1 type selector uses the same human label and stable value");
          assert(!/WORKBOOK|cc4e297f2763/.test(option.textContent));
        }
      }
      if(topic.topic==="D.2"){
        assert.strictEqual(selected.length,d2.clearance.counts.parts);
        assert.strictEqual(selected.filter(q=>q.analysis_atoms.some(code=>allowed.has(code))).length,selected.length);
        for(const button of categories){
          const authored=topic.atoms.find(atom=>atom.code===button.dataset.value);
          const name=button.querySelector(".ppq-cat-name").cloneNode(true);name.querySelector(".ppq-cat-count").remove();
          assert.strictEqual(name.textContent.trim(),authored.label+" ("+authored.display_code+")");
          assert(!name.textContent.includes("d2_sort_"),"D2 source version must stay out of the visible type label");
        }
      }
      if(eTopicCodes.includes(topic.topic)){
        assert.strictEqual(selected.length,eTopics.clearance.counts[topic.topic].parts);
        assert.strictEqual(selected.filter(q=>q.analysis_atoms.some(code=>allowed.has(code))).length,eTopics.clearance.counts[topic.topic].typed_parts);
        for(const button of categories){
          const authored=topic.atoms.find(atom=>atom.code===button.dataset.value);
          assert.strictEqual(authored.topic,topic.topic);
          const name=button.querySelector(".ppq-cat-name").cloneNode(true);name.querySelector(".ppq-cat-count").remove();
          assert.strictEqual(name.textContent.trim(),authored.label+" ("+authored.display_code+")","E type labels use their authored shorthand, not their stored namespace");
        }
      }
      for(const [label,entries]of [["question type",topic.atoms],["question group",topic.groups]]){
        const codes=new Set(entries.map(item=>item.code));
        assert(Array.from(root.querySelector('select[aria-label="'+label+'"]').options,option=>option.value).filter(code=>code!=="ALL").every(code=>codes.has(code)),topic.topic+" "+label+" cannot show another topic's descriptors");
      }
      if(!expectedCodes.length){assert.strictEqual(meta.topic_mapping_counts[topic.topic].typed_parts,0);assert.match(root.querySelector(".ppq-dash-facet-content").textContent,/Question types are being added/);}
      else{
        categories[0].click();assert.deepStrictEqual(sorted(v.view.map(q=>q.id)),sorted(reachable.filter(q=>q.analysis_atoms.includes(categories[0].dataset.value)).map(q=>q.id))); /* d029 */
        const tips=root.querySelector("details.ppq-facet-guidance");
        if(tips)assert.strictEqual(tips.open,false,"Selecting a topic's type must keep Key tips closed");
        root.querySelector(".ppq-facet-clear").click();assert.strictEqual(v.view.length,reachable.length); /* d029 */
      }
    }
    select(topicSelect,"A.5");assert.deepStrictEqual(sorted(v.view.map(q=>q.id)),sorted(a5HL.map(q=>q.id))); /* d029 */
    assert(Array.from(root.querySelectorAll(".ppq-facet-cat")).every(button=>/^A5\./.test(button.dataset.value)));
  });
  check("finding and answering a part retains its selected A5 topic or question group", () => {
    /* d029: exercise the finder on a part this learner is actually served, so the
       before/after view comparison below is not measuring a printing they never see. */
    const target = a5HL.find(q => q.answer_status === "reviewed_source_key");
    assert(target && target.analysis_atoms.length, "A reviewed MCQ must exercise the real finder");
    const selectedValues = () => Array.from(root.querySelectorAll(".ppq-select")).map(select => select.value);
    for (const group of [null, target.analysis_atoms[0]]) {
      if (group) root.querySelector('.ppq-facet-cat[data-value="' + group + '"]').click();
      const before = {values:selectedValues(), group:v.groupFilter, ids:sorted(v.view.map(q => q.id))};
      const finder = root.querySelector(".ppq-find-input");
      finder.value = target.id;
      finder.dispatchEvent(new w.Event("input", {bubbles:true}));
      const result = Array.from(root.querySelectorAll(".ppq-find-result")).find(button => button.dataset.id === target.id);
      assert(result, "The finder must offer the exact part");
      result.click();
      assert.strictEqual(v.cur.id, target.id);
      function unchanged() {
        assert.deepStrictEqual(selectedValues(), before.values);
        assert.strictEqual(v.groupFilter, before.group);
        assert.deepStrictEqual(sorted(v.view.map(q => q.id)), before.ids);
        assert(root.querySelector(".ppq-dash-facet-content"), "A5 family dashboard remains visible");
        if (group) assert(root.querySelector(".ppq-facet-guidance"), "Selected-group guidance remains visible");
      }
      unchanged();
      const count = v.store.attempts.length;
      root.querySelector('.ppq-option-mcq[data-label="' + target.correct_option + '"]').click();
      assert.strictEqual(v.store.attempts.length, count + 1);
      assert.strictEqual(v.store.attempts[count].correct, true);
      unchanged();
      if (group) root.querySelector(".ppq-facet-clear").click();
    }
  });
  check("every released reviewed MCQ marks A-D and 1-4 against its verified source key", () => {
    const keyed=q=>["reviewed_source_key","matched_source_key"].includes(q.answer_status);
    const reviewed = allQuestions.filter(keyed);
    const expectedReviewed = expectedAll.filter(keyed);
    assert(reviewed.length > 0, "The reviewed MCQ delivery must reach the public bundle");
    assert.deepStrictEqual(sorted(reviewed.map(q => q.id)), sorted(expectedReviewed.map(q => q.id)));
    const a5Reviewed=reviewed.filter(q=>q.topic_codes.includes("A.5"));
    const baselineA5Reviewed=baselineA5.filter(q=>q.answer_status==="reviewed_source_key");
    assert.strictEqual(baselineA5Reviewed.length,4,"The immutable baseline has four A5 MCQs, exercised by 32 keyboard journeys");
    assert.deepStrictEqual(sorted(a5Reviewed.map(q=>q.id)),sorted(baselineA5Reviewed.map(q=>q.id)),"Every previously reviewed A5 key remains in the release");
    assert.deepStrictEqual(sorted(a5Reviewed.map(q=>q.id)),sorted(expected.filter(q=>q.answer_status==="reviewed_source_key").map(q=>q.id)));
    for (const q of allQuestions) {
      if (q.correct_option) assert(keyed(q),q.id+" must have a reviewed or exactly matched source key");
      if (!keyed(q)) assert.notStrictEqual(v.cfg.questionType(q), "mcq", q.id);
    }
    const matched=reviewed.filter(q=>q.answer_status==="matched_source_key");
    assert(matched.length>0,"New topic source-matched MCQs must reach the interactive answer controls");
    assert.deepStrictEqual(sorted(matched.map(q=>q.source_part_id)),sorted([...topicClearance.mcq_metadata.matched_source_ids,...(d2?d2.clearance.mcq_metadata.matched.map(q=>q.source_part_id):[]),...(eTopics?eTopics.clearance.mcq_metadata.matched.map(q=>q.source_part_id):[])]));
    let reused=0,exercised=0;
    for (const q of reviewed) {
      assert(/^[A-D]$/.test(q.correct_option), q.id);
      assert.strictEqual(v.cfg.questionType(q), "mcq", q.id);
      if(canReuseQuestion(reusedUiQuestions,q)){reused++;continue;}
      exercised++;
      for (const key of ["A", "b", "C", "d", "1", "2", "3", "4"]) {
        v.render(q);
        assert.strictEqual(v.cur.id, q.id);
        const rating = root.querySelector(".ppq-card > .ppq-competence.ppq-inline-rating");
        assert(rating && !rating.classList.contains("show"), "A fresh part cannot inherit an open C panel");
        assert(!root.querySelector(".ppq-side-rating"));
        assert.strictEqual(root.querySelectorAll(".ppq-option-mcq").length, 4);
        const count = v.store.attempts.length;
        press(key);
        const chosen = /^\d$/.test(key) ? "ABCD"[Number(key)-1] : key.toUpperCase();
        assert.strictEqual(v.store.attempts.length, count + 1, q.id + " key " + key);
        const attempt = v.store.attempts[count];
        assert.strictEqual(attempt.id, q.id);
        assert.strictEqual(attempt.chosen_option, chosen);
        assert.strictEqual(attempt.correct, chosen === q.correct_option);
        assert(v.answered && !v._marksPending, q.id);
        assert(rating.classList.contains("show") && rating.parentElement.classList.contains("ppq-card"), "The committed answer opens the original inline C scale beside the question's answer area");
        assert.strictEqual(root.querySelectorAll(".ppq-competence").length, 1);
        for (const image of q.markscheme_images)
          assert(root.querySelector('.ppq-answer-panel.show img.ppq-ms-crop[src="' + image + '"]'), "Reviewed scheme displayed: " + q.id);
        press("6");
        assert.strictEqual(v.store.attempts.length, count + 1, "Rating must update the same attempt");
        assert.strictEqual(v.store.scores[q.id], 6);
        assert.strictEqual(attempt.self_report, 6, "The packaged viewer stores C on this exact attempt");
        assert.strictEqual(rating.querySelector(".ppq-scale-btn.sel").dataset.val,"6", "The inline rating gives visible feedback for the stored C");
      }
    }
    console.log("  " + reviewed.length + " real MCQs; " + exercised * 8 + " fresh keyboard journeys; " + reused * 8 + " reused journeys with identical question records and UI bytes");
  });
  v.destroy();
} finally { dom.window.close(); }
console.log("\n" + (process.stdout.isTTY ? "[97;42m" : "") + "  PASSED: all " + checked + " checks. This build is safe to stage.  " + (process.stdout.isTTY ? "[0m" : ""));
console.log(JSON.stringify({checks:checked, build_id:info.build_id, parts:allQuestions.length, a5_parts:questions.length, topic_counts:info.topic_counts, referenced_assets:references.size, result:"PASS"}));
