/* Assessment reservation invariants, checked against synthetic edge cases and
   the real archive/ledger. Run: node test/test_physics_exclusions.js.
   Source corpora are read-only. No source content or fixtures are written. */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "..");
const PAPERDB = process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases";
const MODULE = path.join(ROOT, "tools/physics-test-exclusions.js");
const { parseCsv, buildIbExclusions } = require(MODULE);
const read = file => fs.readFileSync(file, "utf8");
let passed = 0, failed = 0;
function check(name, condition) { if (condition) passed++; else { failed++; console.error("FAIL " + name); } }
function rejects(name, run) { let rejected = false; try { run(); } catch (_) { rejected = true; } check(name, rejected); }
const partId = suffix => "ibchem_part_" + suffix;
const groupId = suffix => "ibchem_xlvl_" + suffix;
function archiveRow(id, preview, question, group = "", duplicate = "") {
  return { part_id: partId(id), preview, question, cross_level_group_id: group, duplicate_of: duplicate, year: "2020", session: "May", paper: "2", level: "HL", time_zone: "TZ1", page_render_paths: "pages/question_v001_p003.png" };
}
function csv(rows, columns) {
  const esc = value => '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
  return columns.join(",") + "\n" + rows.map(row => columns.map(column => esc(row[column])).join(",")).join("\n");
}
try {
  const parsed = parseCsv('\uFEFFid,text,ignored\r\n1,"two, fields\nand ""quotes""",x\r\n2,"",y', ["id", "text"]);
  check("CSV handles BOM, commas, multiline fields and doubled quotes", parsed.length === 2 && parsed[0].text === 'two, fields\nand "quotes"');
  check("selected CSV columns remain precise", parsed[1].text === "" && !("ignored" in parsed[0]));
  check("final quoted field without newline", parseCsv('a,b\nx,"last"')[0].b === "last");
  rejects("unterminated quoted evidence rejected", () => parseCsv('a,b\nx,"unfinished'));
  rejects("wrong column count rejected", () => parseCsv("a,b\n1,2,3"));
  rejects("duplicate headers rejected", () => parseCsv("id,id\n1,2"));
  rejects("text after closed quote rejected", () => parseCsv('a,b\n1,"valid"garbage'));

  const rows = [
    archiveRow("a1", "parent-a", "1", groupId("a")),
    archiveRow("a2", "parent-a", "1", groupId("b")),
    archiveRow("b1", "parent-b", "2", groupId("b")),
    archiveRow("b2", "parent-b", "2", "", partId("c1")),
    archiveRow("c1", "parent-c", "3"),
    archiveRow("c2", "parent-c", "3"),
    archiveRow("d1", "parent-d", "4", "", partId("c2")),
    archiveRow("e1", "parent-e", "5"),
    archiveRow("f1", "parent-f", "6")
  ];
  const tests = [
    { source_part_id: "test-1", source_kind: "test", source_file: "test.pdf", stage2_status: "ambiguous", rank1_part_id: partId("a1"), proposed_verdict: "possible" },
    { source_part_id: "test-2", source_kind: "test", source_file: "test.pdf", stage2_status: "no_candidate" },
    { source_part_id: "homework", source_kind: "worksheet", source_file: "homework.pdf", matched_part_id: partId("f1") }
  ];
  const matches = [{ source_part_id: "test-1", candidate_part_id: partId("e1"), derived_from: partId("ffff") }];
  const corpusColumns = ["part_id", "preview", "question", "cross_level_group_id", "duplicate_of", "year", "session", "paper", "level", "time_zone", "page_render_paths"];
  const ledgerColumns = ["source_part_id", "source_file", "source_kind", "final_status", "proposed_verdict", "stage2_status", "matched_part_id", "matched_group_id", "rank1_part_id", "rank1_group_id", "derived_from"];
  const matchColumns = ["source_part_id", "candidate_part_id", "candidate_group_id", "derived_from"];
  const files = {
    "outputs/exports/ib_physics_archive_flat_v5.csv": csv(rows, corpusColumns),
    "Physics Categorisation/returns/PACKET_006D/source_results_v4.csv": csv(tests, ledgerColumns),
    "Physics Categorisation/returns/PACKET_006D/matches.csv": csv(matches, matchColumns)
  };
  const sandbox = { module: { exports: {} }, Buffer, require(name) {
    if (name !== "fs") return require(name);
    return { readFileSync(filename) {
      const key = path.relative(PAPERDB, filename).replace(/\\/g, "/");
      if (!(key in files)) throw Error("Unexpected fixture read: " + filename);
      return Buffer.from(files[key], "utf8");
    } };
  } };
  vm.runInNewContext(read(MODULE), sandbox, { filename: MODULE });
  // Only an indirect sibling is in the selected viewer, so closure MUST use the
  // complete archive rather than just the selected topic catalogue.
  const synthetic = sandbox.module.exports.buildIbExclusions({ paperdbRoot: PAPERDB, questions: [
    { id: "selected-parent", preview: "parent-c", question: "3", paper: "2", parts: [{ source_part_id: partId("c2"), topic_codes: ["A.1"] }] }
  ] });
  check("uncertain rank-one link reserved", synthetic.blockedSourceIds.has(partId("a1")));
  check("candidate proposal reserved independently", synthetic.blockedSourceIds.has(partId("e1")));
  check("full parent, twin, twin sibling and duplicate chain reserved", ["a1", "a2", "b1", "b2", "c1", "c2", "d1"].every(id => synthetic.blockedSourceIds.has(partId(id))));
  check("closure catches sibling omitted from viewer catalogue", synthetic.blockedParentIds.has("selected-parent"));
  check("non-test worksheet link not automatically reserved", !synthetic.blockedSourceIds.has(partId("f1")));
  check("unknown linked IDs reported", synthetic.report.unknownLinkedIdentifiers.includes(partId("ffff")));
  check("unmatched tests keep certification false", synthetic.report.completeTestExclusionCertified === false && synthetic.report.counts.testRowsWithoutKnownArchiveLink === 1);
  check("reserved question page evidence survives closure", synthetic.blockedQuestionPageKeys.has("parent-c/question_v001_p003.png"));

  const catalogueFile = path.join(PAPERDB, "Physics Categorisation/viewer/ibphysics_catalogue.js");
  if (!fs.existsSync(catalogueFile)) console.log("Real physics corpus absent; synthetic reservation checks only.");
  else {
    const box = { window: {} };
    vm.runInNewContext(read(catalogueFile), box, { timeout: 20000 });
    const {mergeIbSupplement} = require("../tools/assemble_physics_preview");
    const d2Path = path.join(ROOT,"dist/physics-inputs/ib-d2.json");
    const selected = fs.existsSync(d2Path) ? mergeIbSupplement(box.window.IBPHYS_QUESTIONS,JSON.parse(read(d2Path)).questions) : box.window.IBPHYS_QUESTIONS;
    const currentTests = path.join(ROOT, "dist/physics-audit/current-ib-tests.json");
    const ex = buildIbExclusions({ paperdbRoot: PAPERDB, questions: selected,
      ...(fs.existsSync(currentTests) ? { extraExclusionsPath: currentTests } : {}) });
    // These source pages are scanned or have almost no native text. Their
    // image-reviewed ledger links must survive every catalogue rebuild.
    const scannedMuonParts = ["60adf76c010831ff", "122b539743a90cf4", "6090a899e8047775",
      "e4f58d6b02b604f9", "568ef640a6e2c55f", "0970847778340ab5"];
    check("scanned 3230 m muon test question reserves all six HL/SL parts", scannedMuonParts.every(id => ex.blockedSourceIds.has(partId(id))));
    check("scanned muon test reserves both complete original questions", ["19M.P3.HL.TZ1.Q4", "19M.P3.SL.TZ1.Q4"].every(id => ex.blockedParentIds.has(id)));
    check("scanned photoelectric negative-current graph follow-up remains reserved", ex.blockedSourceIds.has(partId("353ebf785b2f1259")) && ex.blockedParentIds.has("24M.P2.HL.TZ1.Q11"));
    check("scanned potassium-40 radius question and parent remain reserved", ex.blockedSourceIds.has(partId("03aaf7d320927eb2")) && ex.blockedParentIds.has("17N.P2.HL.TZ0.Q3"));
    check("scanned pendulum data-analysis test reserves both original level versions", ["15M.P2.HL.TZ2.Q1", "15M.P2.SL.TZ2.Q1"].every(id => ex.blockedParentIds.has(id)));
    const corpus = parseCsv(read(path.join(PAPERDB, "outputs/exports/ib_physics_archive_flat_v5.csv")), corpusColumns);
    const blockedParents = new Set(corpus.filter(row => ex.blockedSourceIds.has(row.part_id)).map(row => row.preview + "/" + row.question));
    const blockedGroups = new Set(corpus.filter(row => ex.blockedSourceIds.has(row.part_id)).map(row => row.cross_level_group_id).filter(Boolean));
    check("real archive has non-vacuous reservations", ex.blockedSourceIds.size > 0 && ex.blockedSourceIds.size < corpus.length);
    check("every sibling of a reserved source is reserved", corpus.every(row => !blockedParents.has(row.preview + "/" + row.question) || ex.blockedSourceIds.has(row.part_id)));
    check("every twin of a reserved source is reserved", corpus.every(row => !row.cross_level_group_id || !blockedGroups.has(row.cross_level_group_id) || ex.blockedSourceIds.has(row.part_id)));
    check("duplicate closure holds in both directions", corpus.every(row => !row.duplicate_of || ex.blockedSourceIds.has(row.part_id) === ex.blockedSourceIds.has(row.duplicate_of)));
    check("selected parent is blocked whenever any selected part is reserved", selected.every(q => !q.parts.some(p => ex.blockedSourceIds.has(p.source_part_id)) || ex.blockedParentIds.has(q.id)));
    check("source file hashes and counts accompany report", ex.report.sourceFiles.length >= 3 && ex.report.sourceFiles.every(source => source.rows > 0 && /^[a-f0-9]{64}$/.test(source.sha256)));
    const ledger = parseCsv(read(path.join(PAPERDB, "Physics Categorisation/returns/PACKET_006D/source_results_v4.csv")), ledgerColumns);
    const candidateRows = parseCsv(read(path.join(PAPERDB, "Physics Categorisation/returns/PACKET_006D/matches.csv")), matchColumns);
    const testIds = new Set(ledger.filter(row => row.source_kind === "test").map(row => row.source_part_id));
    const links = new Set();
    const seedColumns = ["matched_part_id", "matched_group_id", "rank1_part_id", "rank1_group_id", "derived_from", "candidate_part_id", "candidate_group_id"];
    [...ledger, ...candidateRows].filter(row => testIds.has(row.source_part_id)).forEach(row => {
      seedColumns.forEach(column => (String(row[column] || "").match(/ibchem_(?:part|xlvl)_[a-f0-9]+/g) || []).forEach(id => links.add(id)));
    });
    const unreservedDirect = corpus.filter(row => (links.has(row.part_id) || links.has(row.cross_level_group_id)) && !ex.blockedSourceIds.has(row.part_id));
    check("all real test candidate/rank-one/derived links reserved", links.size > 0 && unreservedDirect.length === 0);
    const pointer = path.join(ROOT, "dist/physics-preview/latest.json");
    if (fs.existsSync(pointer)) {
      const info = JSON.parse(read(pointer)), course = info.courses.find(c => c.course === "ib");
      if (course) {
        const built = { window: {} };
        vm.runInNewContext(read(path.join(info.root, "ib/data/physics_catalogue.js")), built);
        const records = built.window.PHYSICS_QUESTIONS;
        check("assembled IB excludes every known reserved parent/source/twin", records.every(q => !ex.blockedParentIds.has(q.parent_id) && !ex.blockedSourceIds.has(q.source_part_id) && !ex.blockedGroups.has(q.source_group_id)));
        const sourceByPart = new Map(selected.flatMap(q => q.parts.map(p => [p.part_id, { q, p }])));
        const overlapping = [];
        for (const record of records) {
          const source = sourceByPart.get(record.id);
          if (!source) { overlapping.push(record.id + ": no source"); continue; }
          // Inspect both part crops and whole-question context, not just the
          // part's own declared page span. A context crop may reach earlier pages.
          const crops = [...(source.p.crops || []), ...((record.context_images || []).length ? source.q.crops || [] : [])];
          for (const file of crops) {
            const match = /_(v\d+_p\d+)_/.exec(file);
            if (!match || ex.blockedQuestionPageKeys.has(source.q.preview + "/question_" + match[1] + ".png")) {
              overlapping.push(record.id + ": " + file); break;
            }
          }
        }
        check("assembled question/context crops avoid reserved question pages", overlapping.length === 0);
        if (overlapping.length) console.error("Page overlap examples: " + overlapping.slice(0, 4).join("; "));
      }
    }
    console.log("Real corpus: " + corpus.length + " parts; " + ex.blockedSourceIds.size + " reserved, " + ex.blockedQuestionPageKeys.size + " reserved question pages.");
  }
} catch (error) { failed++; console.error(error.stack); }
console.log(passed + " passed, " + failed + " failed");
process.exitCode = failed ? 1 : 0;
