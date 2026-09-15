"use strict";
const assert = require("assert/strict"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const {build, identities, focus, sourceHoldClosure} = require("../tools/build_ib_d2_recovery");
const {parseCsv, buildIbExclusions} = require("../tools/physics-test-exclusions");
const ROOT = path.resolve(__dirname, ".."), DB = "C:/CodexProjects/PaperDatabases";
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
let checks = 0;
function check(name, run) { run(); checks++; console.log("PASS " + name); }
const result = build(), records = result.questions.flatMap(q => q.parts), candidateIds = records.map(p => p.source_part_id);
check("all authored memberships are versioned and DATA remains separate", () => {
  assert.equal(result.memberships.length, 639); assert.equal(new Set(result.memberships.map(r => r.part_id)).size, 552);
  assert.equal(result.separate_data_memberships.length, 22); assert.equal(new Set(result.separate_data_memberships.map(r => r.part_id)).size, 17);
  const ordinary = new Set(result.memberships.map(r => r.part_id));
  result.separate_data_memberships.forEach(row => assert(!ordinary.has(row.part_id)));
  result.memberships.forEach(row => assert.equal(row.versioned_type_id, result.source_version + "::" + row.local_code));
});
check("type references do not become independently assessed part tags", () => {
  assert.equal(result.atoms.length, 72); assert.equal(result.type_understanding_mappings.length, 98);
  records.forEach(record => assert.deepEqual(record.primary_codes, ["D.2"]));
  assert.equal(result.atoms.find(atom => atom.local_code === "D2.H1b").scope_status, "uncertain");
  assert(!result.memberships.some(row => row.local_code === "D2.H1b"));
});
check("both disputed keys and their three memberships are preserved but held", () => {
  const ids = ["ibchem_part_0ca679bf2e54c0a0", "ibchem_part_2712dff29cedfa47"];
  assert.equal(result.report.quality_flags.length, 3);
  ids.forEach(id => {
    assert.equal(result.parts[id].status, "included"); assert.equal(result.parts[id].source_quality_status, "uncertain");
    assert(!candidateIds.includes(id));
    assert(result.report.withheld_candidates.find(row => row.source_part_id === id).reasons.includes("authored_uncertain_answer_key_whole_parent_twin_hold"));
  });
  records.forEach(record => { assert.equal(record.self_mark, "marks"); assert(!record.answer && !record.correct_answer && !record.correct_option); });
});
check("ordinary native IDs partition completely into candidates and explicit holds", () => {
  assert.equal(new Set(candidateIds).size, candidateIds.length);
  const held = result.report.withheld_candidates.map(row => row.source_part_id);
  assert.equal(new Set(held).size, held.length); assert(held.every(id => !candidateIds.includes(id)));
  assert.deepEqual([...candidateIds, ...held].sort(), result.report.ordinary_source_ids);
  assert.equal(result.report.counts.absent_from_previous_input, 231);
});
const corpus = parseCsv(fs.readFileSync(path.join(DB, "outputs/exports/ib_physics_archive_flat_v5.csv"), "utf8"));
const byId = new Map(corpus.map(row => [row.part_id, row]));
check("current test closure and source-year embargo independently protect candidates", () => {
  const exclusions = buildIbExclusions({paperdbRoot: DB, questions: result.questions, extraExclusionsPaths: [
    "dist/physics-audit/current-ib-tests.json", "reports/ib-a5-reviewed-test-exclusions.json", "reports/ib-a1-c1-reviewed-test-exclusions.json"
  ].map(file => path.join(ROOT, file))});
  for (const q of result.questions) {
    assert(/^\d{4}$/.test(q.year) && Number(q.year) < 2026); assert(!exclusions.blockedParentIds.has(q.id));
    for (const p of q.parts) { assert(!exclusions.blockedSourceIds.has(p.source_part_id)); assert.equal(focus(byId.get(p.source_part_id)), p.assessment_focus); assert.notEqual(p.assessment_focus, "data_analysis"); }
  }
});
check("real parent and nested part identity derives from original source labels", () => {
  for (const q of result.questions) for (const p of q.parts) {
    const id = identities(byId.get(p.source_part_id));
    assert.equal(id.parent, q.id); assert.equal(id.part, p.part_id); assert.equal(id.label, p.label);
  }
  assert.equal(identities({year:"2025",session:"May",paper:"2",level:"HL",time_zone:"TZ1",question:"7",part_label:"7(a)(ii)"}).part, "25M.P2.HL.TZ1.Q7(a_ii)");
});
check("source holds propagate through omitted sibling, twin and reverse duplicate", () => {
  const row = (id, q, group, duplicate = "") => ({part_id:id,year:"2025",session:"May",paper:"2",level:"HL",time_zone:"TZ1",question:q,part_label:q,cross_level_group_id:group,duplicate_of:duplicate});
  const sample = [row("held","1","g1"),row("sibling","1","g2"),row("twin","2","g2"),row("duplicate","3","g3","twin"),row("clear","4","g4")];
  assert.deepEqual([...sourceHoldClosure(sample, ["held"])].sort(), ["duplicate","held","sibling","twin"]);
});
check("every offered image is a hash-bound crop, never a full-page fallback", () => {
  const assets = new Map(result.report.asset_manifest.map(asset => [asset.preview + "/" + asset.file, asset]));
  for (const q of result.questions) for (const file of [...q.crops, ...q.parts.flatMap(p => [...p.crops, ...p.ms_crops])]) {
    const asset = assets.get(q.preview + "/" + file); assert(asset); assert(asset.relative_path.startsWith("crops/"));
    assert.equal(sha(fs.readFileSync(asset.path)), asset.sha256);
  }
  result.questions.forEach(q => q.parts.forEach(p => { assert(p.crops.length); assert(p.ms_crops.length); }));
});
check("provenance binds current corpus, original PDFs, preview metadata and helper", () => {
  const sources = result.report.source_files;
  assert(sources.some(source => source.path.endsWith("ib_physics_archive_flat_v5.csv")));
  assert(sources.some(source => source.path.endsWith("question_preview.json")));
  assert(sources.some(source => source.path.toLowerCase().endsWith(".pdf")));
  [...sources, result.report.builder].forEach(source => assert.equal(sha(fs.readFileSync(source.path)), source.sha256));
  assert.equal(result.report.assessment_review_complete, false);
});
check("written input, when present, reproduces exactly from read-only sources", () => {
  const file = path.join(ROOT, "dist/physics-inputs/ib-d2-recovered.json");
  if (fs.existsSync(file)) assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), result);
});
console.log(`${checks} D2 recovery checks passed; ${records.length} candidate parts remain private.`);
