"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const {selectIbTopics, validateIbDataSupplement, ibInput} = require("../tools/assemble_physics_preview");
const root = path.resolve(__dirname,"..");
const plain = value => JSON.parse(JSON.stringify(value));
const topics = {DATA:"Data analysis and experimental method", "A.1":"Kinematics"};
const dataPart = {topic_codes:["DATA"],assessment_focus:"data_analysis"};

assert.deepStrictEqual(selectIbTopics({year:"2004",paper:"2"},dataPart,topics),["DATA"],"historical Paper 2 data analysis must be selected");
assert.deepStrictEqual(selectIbTopics({year:"2017",paper:"3"},dataPart,topics),["DATA"],"historical Paper 3 Section A data analysis must be selected");
assert.deepStrictEqual(selectIbTopics({year:"2025",paper:"1B"},dataPart,topics),["DATA"],"modern Paper 1B belongs to the same DATA collection");
assert.deepStrictEqual(selectIbTopics({year:"2025",paper:"1B"},{topic_codes:["A.1"]},topics),["A.1","DATA"],"modern paper membership must preserve any existing selected topic association");
assert.deepStrictEqual(selectIbTopics({year:"2026",paper:"1B"},dataPart,topics),[],"2026 mock papers must remain excluded");
assert.deepStrictEqual(selectIbTopics({year:"2027",paper:"2"},dataPart,topics),[],"later mock papers must remain excluded");
assert.deepStrictEqual(selectIbTopics({year:"unknown",paper:"1B"},dataPart,topics),[],"undated records must not bypass the mock embargo");
assert.deepStrictEqual(selectIbTopics({year:"2003",paper:"2"},dataPart,topics),[],"the requested historical DATA range starts at 2004");
assert.deepStrictEqual(selectIbTopics({year:"2017",paper:"3"},{topic_codes:["C.1"],assessment_focus:"option_content"},topics),[],"historical option questions are not inferred to be data analysis");

const config = fs.readFileSync(path.join(root,"example/physics-config.js"),"utf8");
function configure(meta, records, query) {
  const box = {window:{PHYSICS_META:meta,PHYSICS_QUESTIONS:records,location:{search:query}}, URLSearchParams};
  vm.runInNewContext(config,box);
  return box.window.PPQ_CONFIG;
}
const records = [{id:"old",topic_codes:["DATA"],year:"2005",paper:"2"},{id:"new",topic_codes:["DATA"],year:"2025",paper:"1B"}];
const ibMeta = {course:"ib",topics};
const alias = configure(ibMeta,records,"?topic=1B");
assert.deepStrictEqual(plain(alias.filters[0].default),["DATA"],"existing topic=1B bookmarks must select historical and modern data analysis");
assert.strictEqual(alias.filters[0].friendlyLabels.DATA,"Data analysis and experimental method","the DATA implementation code must not be appended to the human label");
const practicePaper = alias.filters.find(f=>f.field === "practice_paper");
assert.deepStrictEqual(plain(practicePaper.values),["1","2"],"the practice paper filter must offer the two requested groups");
assert.strictEqual(practicePaper.valueOf(records[1]),"1","modern Paper 1B must be available in the Paper 1 practice group");
assert.strictEqual(practicePaper.valueOf(records[0]),"2","historical Paper 2 must remain in the Paper 2 practice group");
assert.strictEqual(records[1].paper,"1B","the paper projection must preserve original Paper 1B provenance");
assert.deepStrictEqual(plain(configure(ibMeta,records,"?topic=data").filters[0].default),["DATA"]);
assert.deepStrictEqual(plain(configure({course:"ib",topics:{"1B":"Paper 1B"}},[{id:"legacy",topic_codes:["1B"]}],"?topic=1B").filters[0].default),["1B"],"old catalogues without DATA must still resolve their own 1B topic");
assert.strictEqual(configure({course:"trilogy",topics},records,"?topic=1B").filters[0].default,undefined,"the IB bookmark alias must not change another course");

const inputPath = path.join(root,"dist/physics-inputs/ib-data-analysis.json");
const paperdb = process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases";
if (fs.existsSync(inputPath) && fs.existsSync(path.join(paperdb,"Physics Categorisation/viewer/ibphysics_catalogue.js"))) {
  const supplement = JSON.parse(fs.readFileSync(inputPath));
  const box = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(paperdb,"Physics Categorisation/viewer/ibphysics_catalogue.js"),"utf8"),box);
  const native = box.window.IBPHYS_QUESTIONS, before = JSON.stringify(native);
  validateIbDataSupplement(native,supplement);
  assert.strictEqual(JSON.stringify(native),before,"DATA validation must never alter native status or source metadata");
  const changed = plain(supplement);
  changed.questions[0].parts[0].spec_status = "out";
  assert.throws(()=>validateIbDataSupplement(native,changed),/records differ/,'even status-only supplement changes must be rejected');
  const stale = plain(supplement);
  stale.report.source_files.find(source=>source.path.endsWith("ibphysics_catalogue.js")).sha256 = "0".repeat(64);
  assert.throws(()=>validateIbDataSupplement(native,stale),/source changed/,'stale source fingerprints must be rejected');
  const staleBuilder = plain(supplement);
  staleBuilder.report.builder.sha256 = "0".repeat(64);
  assert.throws(()=>validateIbDataSupplement(native,staleBuilder),/current builder/,'the recorded local builder must be current');
  const input = ibInput();
  const data = input.questions.filter(q=>q.topic_codes.includes("DATA"));
  assert(data.some(q=>q.id === "05M.P2.SL.TZ2.QA1(a)"),"retained historical Paper 2 witness must reach the assembled input");
  assert(data.some(q=>q.id === "17M.P3.SL.TZ2.Q1(a)"),"retained historical Paper 3 witness must reach the assembled input");
  assert(data.some(q=>q.paper === "1B" && q.year === "2025"),"modern data-analysis practice must remain present");
  assert(input.questions.every(q=>Number(q.year)<2026),"the actual input must exclude all 2026 and later questions");
  assert(!data.some(q=>/^15M\.P2\.(HL|SL)\.TZ2\.Q1/.test(q.parent_id)),"scanned pendulum test parent and its level twin must remain reserved");
  assert(data.every(q=>q.context_images.length && q.question_images.length && q.markscheme_images.length),"historical practice needs original context, a question crop and a scheme crop");
  console.log("Historical DATA input:",data.length,"parts;",new Set(data.map(q=>q.parent_id)).size,"parents.");
}
console.log("Historical DATA selection, provenance, mock embargo and bookmark alias passed.");
