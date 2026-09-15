"use strict";
// Private source-evidence regression. No source regeneration or network calls.
const fs = require("fs"), path = require("path"), crypto = require("crypto"), assert = require("assert"), vm = require("vm");
const { buildIbExclusions, parseCsv } = require("../tools/physics-test-exclusions");
const root = path.resolve(__dirname, ".."), paperdb = "C:/CodexProjects/PaperDatabases";
const reportPath = path.join(root, "reports/ib-a1-c1-reviewed-test-exclusions.json");
const read = p => JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
const sha = p => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
let checks = 0;
function check(name, fn) { fn(); checks++; console.log("PASS " + name); }
const report = read(reportPath);
const candidatesPath = path.join(root, "dist/physics-audit/a1-c1-assessments/candidate-parts.json");
const candidates = read(candidatesPath);
check("review is complete only for the fixed A1/C1 candidate scope", () => {
  assert.equal(report.review_complete, true);
  assert.deepEqual(report.unresolved_relevant_items, []);
  assert.deepEqual(report.topics, ["A.1", "C.1"]);
  assert.equal(report.reviewed_candidate_source_ids.length, 226);
  assert.equal(report.reviewed_candidate_sha256, sha(candidatesPath));
  assert.deepEqual(report.reviewed_candidate_source_ids, candidates.map(q => q.source_part_id).sort());
  assert.deepEqual(report.reviewed_candidate_counts, { "A.1": 197, "C.1": 29 });
});
check("all review/source fingerprints still match the reviewed bytes", () => {
  assert.equal(report.source_files.length, 28);
  report.source_files.forEach(file => assert.equal(sha(path.isAbsolute(file.path) ? file.path : path.join(paperdb, file.path)), file.sha256, file.path));
  assert.deepEqual(report.read_failures, []);
});
const corpus = parseCsv(fs.readFileSync(path.join(paperdb, "outputs/exports/ib_physics_archive_flat_v5.csv"), "utf8"));
const rows = new Map(corpus.map(q => [q.part_id, q]));
check("source evidence includes inherited instructions and exact recall prompts", () => {
  const frequency = rows.get("ibchem_part_a74ae9842532244d");
  assert.match(frequency.parent_context, /Define, for a wave/i);
  assert.match(frequency.question_text, /frequency/i);
  assert.match(rows.get("ibchem_part_4c2bba1f12b969b0").question_text, /horizontal.*vertical acceleration/is);
  assert.match(rows.get("ibchem_part_63fe4d06d4495cd7").question_text, /direction of her velocity vector.*direction of her acceleration/is);
  assert(report.blocked_source_ids.includes(frequency.part_id));
  candidates.forEach(q => assert(Number(rows.get(q.source_part_id).year) < 2026));
});
const basePaths = ["dist/physics-audit/current-ib-tests.json", "reports/ib-a5-reviewed-test-exclusions.json"].map(p => path.join(root, p));
const base = buildIbExclusions({ paperdbRoot: paperdb, questions: [], extraExclusionsPaths: basePaths });
const after = buildIbExclusions({ paperdbRoot: paperdb, questions: [], extraExclusionsPaths: [...basePaths, reportPath] });
check("manual seeds close over unselected sibling parts and cross-level twins", () => {
  assert.equal(report.blocked_source_ids.length, 32);
  report.blocked_source_ids.forEach(id => assert(after.blockedSourceIds.has(id), id));
  ["ibchem_part_248753616d974103", "ibchem_part_30c229a2e29b2c23", "ibchem_part_f15feb6d113a5168"].forEach(id => assert(after.blockedSourceIds.has(id), id));
  const heldC = candidates.find(q => q.id === "15N.P2.HL.TZ0.Q3(c)");
  assert(heldC && after.blockedSourceIds.has(heldC.source_part_id));
});
check("closure removes the eight reviewed candidate appearances", () => {
  assert.equal(candidates.filter(q => base.blockedSourceIds.has(q.source_part_id)).length, 0);
  const held = candidates.filter(q => after.blockedSourceIds.has(q.source_part_id));
  assert.equal(held.length, 8);
  assert.equal(held.filter(q => q.topic_codes.includes("A.1")).length, 5);
  assert.equal(held.filter(q => q.topic_codes.includes("C.1")).length, 3);
  assert.equal(after.blockedSourceIds.size - base.blockedSourceIds.size, 19);
});
check("the approved A5 boundary is unaffected by the additional A1/C1 holds", () => {
  const a5 = read(path.join(root, "reports/ib-a5-release-clearance.json")).reviewed_source_part_ids;
  const correctionIds=["ibchem_part_71630df3bdf6ab2f","ibchem_part_c07207339d141b80"];
  const cropReview=read(path.join(root,"reports/ib-a5-shared-parent-crop-review.json"));
  const cropHolds=read(path.join(root,"reports/ib-reviewed-crop-exclusions.json"));
  assert.equal(cropReview.review_complete,true);assert.deepEqual(cropReview.requires_correction_source_ids.slice().sort(),correctionIds);
  assert.equal(a5.length,146-correctionIds.length);
  const baselinePath=path.join(root,"dist/ibphysics-release/ab0aa88396caf624-1789233551012/data/physics_catalogue.js");
  assert.equal(sha(baselinePath),"f32aef8b1941bce59cfb49c0c7fce93ef5109064c34af000c289108b4c9fd1ca");
  const baseline={window:{}};vm.runInNewContext(fs.readFileSync(baselinePath,"utf8"),baseline,{timeout:20000});
  const originalIds=Array.from(baseline.window.PHYSICS_QUESTIONS).filter(q=>q.topic_codes.includes("A.5")).map(q=>q.source_part_id);
  assert.equal(originalIds.length,146);assert.deepEqual(a5.slice().sort(),originalIds.filter(id=>!correctionIds.includes(id)).sort());
  correctionIds.forEach(id=>{assert(cropHolds.source_part_ids.includes(id));assert(!a5.includes(id));});
  a5.forEach(id => assert(!after.blockedSourceIds.has(id), id));
});
console.log(`${checks} A1/C1 assessment review checks passed.`);
