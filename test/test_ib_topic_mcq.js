"use strict";
const assert = require("assert"), fs = require("fs"), os = require("os"), path = require("path"), crypto = require("crypto");
const {buildMetadata} = require("../tools/ib-topic-mcq");
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
let passed = 0;
function fixture(run) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "ppq-topic-mcq-"));
  try {
    const preview = "ib_physics_fixture", prefix = "outputs/previews/" + preview + "/";
    const sourceId = "ibchem_part_123456789abcdef0";
    const qpCrop = "crops/question_4_v003_p003_01_fixture.png", msCrop = "crops/mark_scheme_4_v002_p002_01_fixture.png";
    const nativePart = {part_id:"04N.P1.HL.TZ0.Q4(whole)",source_part_id:sourceId,label:"4",marks:1,
      self_mark:"mcq",answer_status:"source_key",answer:"D",correct_answer:"D",markscheme_text:"Answer: D",
      crops:[path.basename(qpCrop)],ms_crops:[path.basename(msCrop)]};
    const parent = {id:"04N.P1.HL.TZ0.Q4",preview,question:"4",year:"2004",paper:"1",level:"HL",session:"Nov",time_zone:"",parts:[nativePart],crops:[]};
    const row = {part_id:sourceId,preview,year:"2004",session:"Nov",level:"HL",time_zone:"",paper:"1",question:"4",marks:"1",ms_text:"Answer: D",
      question_source:"original/question.pdf",mark_scheme_source:"original/scheme.pdf",question_crop_paths:qpCrop,ms_crop_paths:msCrop};
    const source = (relative_path, document_type) => ({relative_path,document_type,subject:"Physics",year:"2004",series:"Nov",level:"HL",time_zone:"",paper:"1"});
    const qp = {source:source(row.question_source,"question_paper"),question_groups:[{question_number:"4",crop_image_paths:[],parts:[{part_label:"4",marks:1,crop_image_paths:[qpCrop]}]}]};
    const ms = {source:source(row.mark_scheme_source,"mark_scheme"),entries:[{question_number:"4",part_label:"4",marks:1,text:"Answer: D",answer_text:"Answer: D",source_lines:["4.","D"],page_start:2,page_end:2,crop_image_paths:[msCrop]}]};
    const record = {id:nativePart.part_id,parent_id:parent.id,source_part_id:sourceId,topic_codes:["A.1"],year:"2004",paper:"1",level:"HL",question_number:"4",marks:1,
      question_images:[path.join(temp,prefix,qpCrop)],markscheme_images:[path.join(temp,prefix,msCrop)],context_images:[]};
    function write(file, bytes) { const target = path.join(temp,file); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,bytes); }
    function sync() {
      write("Physics Categorisation/viewer/ibphysics_catalogue.js", "window.IBPHYS_QUESTIONS="+JSON.stringify([parent])+";");
      write("outputs/exports/ib_physics_archive_flat_v5.csv",Object.keys(row).join(",")+"\n"+Object.values(row).join(",")+"\n");
      write(prefix+"question_preview.json",JSON.stringify(qp)); write(prefix+"mark_scheme_preview.json",JSON.stringify(ms));
    }
    write(row.question_source,"%PDF-1.4\nquestion fixture"); write(row.mark_scheme_source,"%PDF-1.4\nscheme fixture");
    write(prefix+qpCrop,Buffer.from("89504e470d0a1a0a", "hex")); write(prefix+msCrop,Buffer.from("89504e470d0a1a0a", "hex")); sync();
    const build = records => buildMetadata(records || [record], {paperdbRoot:temp});
    run({temp,preview,prefix,sourceId,record,parent,nativePart,row,qp,ms,sync,write,build});
  } finally {
    assert(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep+"ppq-topic-mcq-"));
    fs.rmSync(temp,{recursive:true,force:true});
  }
}
function test(name, run) { fixture(run); passed++; console.log("PASS "+name); }
const missing = (result,id,pattern) => { assert(!result.parts[id]); assert(result.report.findings.some(f=>f.source_part_id===id && pattern.test(f.reason))); };

test("Exact original key agreement projects two public fields without mutating source records", f => {
  const before=JSON.stringify(f.record), r=f.build(), item=r.parts[f.sourceId];
  assert.equal(item.correct_option,"D"); assert.equal(item.answer_status,"matched_source_key");
  assert.equal(item.evidence.visual_review,false); assert.deepEqual(item.evidence.source_lines,["4.","D"]);
  assert.equal(r.report.matched_count,1); assert.equal(r.report.findings.length,0); assert.equal(JSON.stringify(f.record),before);
  assert.equal(r.report.source_files.length,8);
  for(const file of [...r.report.source_files,r.report.builder]) assert.equal(sha(fs.readFileSync(file.path)),file.sha256);
});
test("A conflicting native key keeps manual marking", f => {
  f.nativePart.answer="B"; f.sync(); missing(f.build(),f.sourceId,/Native key/);
});
test("Archive answer disagreement cannot override the original key", f => {
  f.row.ms_text="Answer: A"; f.sync(); missing(f.build(),f.sourceId,/keys conflict/);
});
test("Wrong printed question number in the source lines refuses an otherwise matching key", f => {
  f.ms.entries[0].source_lines=["5.","D"]; f.sync(); missing(f.build(),f.sourceId,/source lines/);
});
test("Duplicate original answer entries are ambiguous", f => {
  f.ms.entries.push(JSON.parse(JSON.stringify(f.ms.entries[0]))); f.sync(); missing(f.build(),f.sourceId,/answer entry is absent or ambiguous/);
});
test("Consumer parent identity and a same-named foreign crop must both match", f => {
  f.record.parent_id+="wrong"; missing(f.build(),f.sourceId,/parent\/part/); f.record.parent_id=f.parent.id;
  f.record.question_images=[path.join(f.temp,"foreign",path.basename(f.record.question_images[0]))];
  missing(f.build(),f.sourceId,/crop assignment/);
});
test("Full source year embargo and exact one-mark contract apply", f => {
  f.row.year=f.parent.year=f.record.year="2026"; f.sync(); missing(f.build(),f.sourceId,/permitted range/);
  f.row.year=f.parent.year=f.record.year="2004"; f.record.marks=2; f.sync(); missing(f.build(),f.sourceId,/one mark/);
});
test("Original PDF attribution and bytes are checked and freshly fingerprinted", f => {
  const before=f.build(), original=path.join(f.temp,f.row.mark_scheme_source), oldHash=before.report.source_files.find(x=>x.path===original).sha256;
  f.write(f.row.mark_scheme_source,"%PDF-1.4\nscheme fixture changed");
  const after=f.build(); assert.equal(after.report.matched_count,1);
  assert.notEqual(after.report.source_files.find(x=>x.path===original).sha256,oldHash);
  f.write(f.row.mark_scheme_source,"not a PDF"); missing(f.build(),f.sourceId,/PDF header/);
  f.ms.source.relative_path="original/unrelated.pdf"; f.sync(); missing(f.build(),f.sourceId,/document identity/);
});
test("Missing source crops and incomplete crop sets retain manual marking", f => {
  f.qp.question_groups[0].parts[0].crop_image_paths=[]; f.sync(); missing(f.build(),f.sourceId,/crop metadata/);
  f.qp.question_groups[0].parts[0].crop_image_paths=[f.row.question_crop_paths]; f.sync();
  fs.unlinkSync(f.record.question_images[0]); missing(f.build(),f.sourceId,/ENOENT/);
});
test("Existing A5 answers are outside this helper and duplicate IDs cannot silently overwrite", f => {
  const old={...f.record,topic_codes:["A.5"]}; const skipped=f.build([old]); assert.equal(skipped.report.outside_topic_count,1); assert.deepEqual(skipped.parts,{});
  missing(f.build([f.record,{...f.record}]),f.sourceId,/duplicate input/);
});
console.log(passed+" IB topic MCQ checks passed");
