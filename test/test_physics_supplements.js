"use strict";
const assert = require("assert");
const fs = require("fs"),path = require("path"),vm = require("vm"),crypto = require("crypto");
const {mergeIbSupplement} = require("../tools/assemble_physics_preview");
const {parseCsv} = require("../tools/physics-test-exclusions");
const root = path.resolve(__dirname,"..");
const p = (id,topic,status) => ({part_id:id,source_part_id:"source-"+id,topic_codes:[topic],spec_status:status});
const q = parts => ({id:"parent",preview:"paper",question:"1",parts,crops:["question_p001_a.png"],pages:["question_p001.png"]});
const native = [q([p("a","E.1","in"),p("b","E.1","out"),p("c","A.1","in")])];
const added = [q([p("a","D.2","out"),p("b","D.2","in"),p("c","D.2","in"),p("d","D.2","unreviewed"),
  {...p("e","D.2","mixed"),primary_codes:["D.2.X"],secondary_codes:["B.5.1"]}])];
const merged = mergeIbSupplement(native,added)[0];
assert.deepStrictEqual(merged.parts.find(p=>p.part_id === "a").topic_codes,["E.1"],"retired D2 must not inherit live E1 status");
assert.deepStrictEqual(merged.parts.find(p=>p.part_id === "b").topic_codes,["D.2"],"live D2 must not promote retired E1");
assert.deepStrictEqual(merged.parts.find(p=>p.part_id === "c").topic_codes,["A.1","D.2"],"two live classifications preserve stable identity");
assert.strictEqual(merged.parts.length,4);
assert(!merged.parts.some(p=>p.part_id === "e"),"current secondary topic cannot rescue retired assessed D2 content");
assert.strictEqual(merged.parts.find(p=>p.part_id === "d").spec_status,"unreviewed");
assert.strictEqual(native[0].parts.length,3,"source catalogue stays unchanged");
assert.throws(()=>mergeIbSupplement(native,[{...added[0],preview:"another-paper"}]),/identity conflict/);
assert.throws(()=>mergeIbSupplement(native,[q([{...p("c","D.2","in"),source_part_id:"different"}])]),/identity conflict/);

const infoPath = path.join(root,"dist/physics-preview/latest.json");
if (fs.existsSync(infoPath)) {
  const info = JSON.parse(fs.readFileSync(infoPath));
  const records = course => {
    const box = {window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(info.root,course,"data/physics_catalogue.js"),"utf8"),box);
    return box.window.PHYSICS_QUESTIONS;
  };
  if (info.courses.some(c=>c.course === "preib")) {
    const input = JSON.parse(fs.readFileSync(path.join(root,"dist/physics-inputs/preib.json")));
    const excluded = new Set(input.report.excluded_parent_ids);
    assert(input.report.test_sources.length > 0 && input.report.test_sources.every(t=>t.sha256 && !t.error));
    assert(records("preib").every(q=>!excluded.has(q.parent_id)),"Pre-IB test exclusions must reach served catalogue");
    assert(!records("preib").some(q=>q.parent_id === "edexcel_4ss0_1p_2019_jun::Q03"),"short speed-formula test question and sibling stay withheld");
  }
  const review = path.join(root,"reports/trilogy-reviewed-test-exclusions.json");
  if (info.courses.some(c=>c.course === "trilogy") && fs.existsSync(review)) {
    const blocked = new Set(JSON.parse(fs.readFileSync(review)).parent_ids);
    assert(blocked.size > 0);
    assert(records("trilogy").every(q=>!blocked.has(q.parent_id)),"visual Trilogy reservations must reach served catalogue");
    // A default rebuild formerly retained the seven manual reservations while
    // dropping the broader assessment scan. Check that independent source too.
    const basePath = path.join(root,"dist/physics-inputs/trilogy-test-exclusions.json");
    const baseBytes = fs.readFileSync(basePath), base = JSON.parse(baseBytes);
    const input = JSON.parse(fs.readFileSync(path.join(root,"dist/physics-inputs/trilogy.json")));
    const closure = new Set(base.parent_ids);
    assert(closure.size >= 102,"the broad current-test reservation set must not be replaced by the manual subset");
    assert(closure.has("trilogy_2018_p1h::Q06") && !blocked.has("trilogy_2018_p1h::Q06"),"regression witness must come from the broad scan alone");
    const linksPath = path.join(process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases",
      "Trilogy Categorisation/returns/SWEEP_XTIER/cross_tier_links.csv");
    if (fs.existsSync(linksPath)) {
      // Independent published link witnesses, rather than the builder's closure
      // output, establish which whole-question tier variants are reserved.
      const parentOf = id => {
        const match = /^(.*)::(\d+)(?:\.|$)/.exec(id);
        assert(match,"unrecognised source part identity: " + id);
        return match[1] + "::Q" + match[2].padStart(2,"0");
      };
      const links = parseCsv(fs.readFileSync(linksPath,"utf8")).map(row=>
        [parentOf(row.foundation_part_id),parentOf(row.higher_part_id)]);
      let size;
      do {
        size = closure.size;
        for (const [left,right] of links) if (closure.has(left) || closure.has(right)) {
          closure.add(left); closure.add(right);
        }
      } while (size !== closure.size);
      assert(closure.has("trilogy_specimen_set2_p2h::Q02"),"reserved Foundation ripple-tank question must reserve its Higher-tier parent");
    }
    const reported = new Set(input.report.excluded_parent_ids);
    assert([...closure].every(id=>reported.has(id)),"all broad reservations and linked parent variants must reach the input exclusion closure");
    assert(records("trilogy").every(q=>!closure.has(q.parent_id)),"broad Trilogy test reservations and whole tier variants must reach the served catalogue");
    const digest = crypto.createHash("sha256").update(baseBytes).digest("hex");
    assert(input.report.known_exclusions.some(e=>e.source && path.resolve(e.source) === basePath && e.sha256 === digest),
      "Trilogy input must carry the current broad assessment fingerprint");
  }
  if (info.courses.some(c=>c.course === "ib")) {
    const holds = JSON.parse(fs.readFileSync(path.join(root,"reports/ib-reviewed-crop-exclusions.json")));
    const badSources = new Set(holds.source_part_ids), ib = records("ib");
    assert(badSources.size >= 39,"reviewed incomplete IB source crops and twins must remain reserved");
    assert(ib.every(q=>!badSources.has(q.source_part_id)),"reviewed incomplete question crops and declared twins must not be served");
    const badParents = new Set(holds.reviewed_evidence.filter(e=>e.review_status === "withhold_question").map(e=>e.parent_id));
    assert(ib.every(q=>!badParents.has(q.parent_id)),"incomplete IB question holds must cover the whole parent");
    const disclaimer = "4526c4cfc2de080f1c5846744afe1767118772394d1aaa2cd40259580952055e";
    assert(holds.suppressed_image_sha256s.includes(disclaimer),"the reviewed disclaimer-only image must remain suppressed");
    const imageUrls = new Set(ib.flatMap(q=>[...q.question_images,...(q.context_images || []),...q.markscheme_images]));
    for (const digest of holds.suppressed_image_sha256s) {
      const url = "assets/" + digest + ".png";
      assert(!imageUrls.has(url),"suppressed disclaimer must not occur in any question, context or markscheme reference");
      assert(!fs.existsSync(path.join(info.root,"ib",url)),"suppressed disclaimer must not remain as an unreferenced served file");
    }
  }
  if (info.courses.find(c=>c.course === "ib").topics["D.2"]) {
    const d2 = JSON.parse(fs.readFileSync(path.join(root,"dist/physics-inputs/ib-d2.json")));
    const retired = new Set(d2.questions.flatMap(q=>q.parts.filter(p=>p.spec_status === "out").map(p=>p.source_part_id)));
    assert(records("ib").every(q=>!q.topic_codes.includes("D.2") || !retired.has(q.source_part_id)),"retired D2 classifications must stay out of D2 filter");
    const oldMagnetism = new Set(["ibchem_part_38585ecdae342b15","ibchem_part_f6f2ffe21f640fb4"]);
    assert(records("ib").every(q=>!q.topic_codes.includes("D.2") || !oldMagnetism.has(q.source_part_id)),"mixed-status retired D2 examples must stay out of D2 filter");
  }
}
console.log("Physics supplemental identity, syllabus and assessment reservations passed.");
