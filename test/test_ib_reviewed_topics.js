/* Private reviewed-topic loader regressions. All witnesses are synthetic files;
   no source catalogue, workbook or assessment is edited by this test. */
"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path"),os=require("os"),crypto=require("crypto");
const {loadReviewedTopics,topicMemberships,publicTaxonomy}=require("../tools/ib-reviewed-topics");
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
const clone=value=>JSON.parse(JSON.stringify(value));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),"ppq-reviewed-topic-test-"));
const source=path.join(temporary,"reviewed-source.txt"),builder=path.join(temporary,"builder.js");
fs.writeFileSync(source,"Authored scope and descriptor evidence.\n");fs.writeFileSync(builder,"// Fixture projection builder\n");
const witness=file=>({path:file,sha256:sha(fs.readFileSync(file))});
const id="ibchem_part_0123456789abcdef",other="ibchem_part_fedcba9876543210";
let checks=0,serial=0;
function check(label,run){run();checks++;console.log("ok "+label);}
function part(extra={}){return {status:"included",group_codes:["A1.GRAPH"],atom_codes:["A1.GRADIENT"],type_codes:["A1.GRADIENT.TANGENT"],used_atom_codes:["A1.AREA"],optional_atom_codes:["A1.EQUATION"],canonical_row_ids:["row-7"],...extra};}
function input(extra={}){return {schema_version:1,topic:"A.1",label:"Kinematics",current_level:"HLSL",
 groups:[{code:"A1.GRAPH",label:"Graphs",summary:"Read motion graphs.",checks:["Check both axes."]}],
 atoms:[{code:"A1.GRADIENT",label:"Find a gradient"},{code:"A1.AREA",label:"Find an area"},{code:"A1.EQUATION",label:"Use a motion equation"}],
 types:[{code:"A1.GRADIENT.TANGENT",label:"Draw a tangent"}],parts:{[id]:part()},
 report:{source_files:[witness(source)],builder:witness(builder)},...extra};}
function load(value){const file=path.join(temporary,"input-"+(++serial)+".json");fs.writeFileSync(file,JSON.stringify(value));return {file,topics:loadReviewedTopics([file])};}
function invalid(label,mutate,pattern){check(label,()=>{const value=input();mutate(value);assert.throws(()=>load(value),pattern);});}
try{
 check("authored inputs retain stable IDs, labels, order and exact file fingerprints",()=>{
  const value=input(),{file,topics}=load(value),loaded=topics[0];
  assert.equal(loaded.input_path,file);assert.equal(loaded.input_sha256,sha(fs.readFileSync(file)));
  assert.deepEqual(loaded.parts,value.parts);assert.deepEqual(loaded.atoms,value.atoms);assert.deepEqual(loaded.report,value.report);
 });
 check("direct types, prerequisites and optional routes remain separate",()=>{
  const {topics}=load(input()),m=topicMemberships(id,["A.1"],topics);
  assert.deepEqual(m.analysis_groups,["A1.GRAPH"]);assert.deepEqual(m.analysis_atoms,["A1.GRADIENT"]);
  assert.deepEqual(m.analysis_types,["A1.GRADIENT.TANGENT"]);assert.deepEqual(m.analysis_used_atoms,["A1.AREA"]);
  assert.deepEqual(m.analysis_optional_atoms,["A1.EQUATION"]);assert.deepEqual(m.analysis_canonical_ids,["A.1:row-7"]);
  assert.deepEqual(m.current_topic_levels,{"A.1":"HLSL"});
 });
 check("an explicit current-scope review can retain a part with no fine descriptors",()=>{
  const value=input({parts:{[id]:part({scope_reviewed:true,group_codes:[],atom_codes:[],type_codes:[],used_atom_codes:[],optional_atom_codes:[],canonical_row_ids:[]})}});
  const {topics}=load(value),m=topicMemberships(id,["A.1"],topics);
  assert.equal(topics[0].parts[id].status,"included");for(const field of ["analysis_groups","analysis_atoms","analysis_types","analysis_used_atoms","analysis_optional_atoms","analysis_canonical_ids"])assert.deepEqual(m[field],[]);
 });
 invalid("dependency-only tagging cannot certify direct topic inclusion",v=>{v.parts[id].atom_codes=[];v.parts[id].scope_reviewed=false;},/lacks both a direct question type/);
 invalid("a truthy string is not a completed scope review",v=>{v.parts[id].atom_codes=[];v.parts[id].scope_reviewed="true";},/lacks both/);
 check("excluded, unmapped and absent source IDs cannot be projected by a topic tag",()=>{
  for(const status of ["excluded","unmapped"]){const value=input();value.parts[id].status=status;assert.throws(()=>topicMemberships(id,["A.1"],load(value).topics),/not directly included/);}
  assert.throws(()=>topicMemberships(other,["A.1"],load(input()).topics),/not directly included/);
 });
 check("only selected topics contribute memberships and duplicate memberships are removed",()=>{
  const a=load(input()).topics[0];const c=input({topic:"C.1",label:"Simple harmonic motion",current_level:"HL"});
  c.parts[id]=part({group_codes:["A1.GRAPH","A1.GRAPH"],current_level:"SL"});
  const cs=load(c).topics[0],both=topicMemberships(id,["A.1","C.1"],[a,cs]);
  assert.deepEqual(both.analysis_groups,["A1.GRAPH"]);assert.deepEqual(both.analysis_atoms,["A1.GRADIENT"]);
  assert.deepEqual(both.analysis_canonical_ids,["A.1:row-7","C.1:row-7"]);assert.deepEqual(both.current_topic_levels,{"A.1":"HLSL","C.1":"SL"});
  assert.deepEqual(topicMemberships(id,["A.1"],[a,cs]).analysis_canonical_ids,["A.1:row-7"]);
 });
 check("authored current-level arrays are projected without borrowing historical paper hints",()=>{
  for(const [levels,expected]of [[["SL","HL"],"HLSL"],[["HL"],"HL"],[["SL"],"SL"]]){
   const value=input();delete value.current_level;value.parts[id].current_levels=levels;
   assert.deepEqual(topicMemberships(id,["A.1"],load(value).topics).current_topic_levels,{"A.1":expected});
  }
  const historical=input();delete historical.current_level;historical.parts[id].reviewed_level="HL";historical.parts[id].level="HL";
  assert.deepEqual(topicMemberships(id,["A.1"],load(historical).topics).current_topic_levels,{});
 });
 check("a source edited after projection cannot pass on its old recorded fingerprint",()=>{
  const value=input(),original=fs.readFileSync(source);fs.writeFileSync(source,"Different reviewed source content.\n");
  try{assert.throws(()=>load(value),/source changed/);}finally{fs.writeFileSync(source,original);}
 });
 for(const field of ["group_codes","atom_codes","type_codes","used_atom_codes","optional_atom_codes"])
  invalid("unknown "+field+" are rejected before projection",v=>v.parts[id][field]=["UNKNOWN"],new RegExp("Unknown "+field));
 invalid("archive source IDs cannot be replaced with display IDs",v=>{v.parts={"25M.P2.HL.TZ1.Q1(a)":part()};},/archive source-part IDs/);
 invalid("unknown review statuses cannot be treated as inclusion",v=>v.parts[id].status="probably",/Unreviewed topic disposition/);
 invalid("unsupported topic schemas fail closed",v=>v.topic="D.2",/Unsupported reviewed IB topic/);
 invalid("repeated authored type codes cannot silently overwrite a descriptor",v=>v.atoms.push(clone(v.atoms[0])),/Repeated taxonomy code/);
 invalid("missing source provenance is rejected",v=>v.report.source_files=[],/provenance is missing/);
 invalid("missing builder provenance is rejected",v=>delete v.report.builder,/provenance is missing/);
 invalid("changed source bytes revoke the previously authored mapping",v=>v.report.source_files[0].sha256="0".repeat(64),/source changed/);
 invalid("changed builder bytes revoke the previously authored projection",v=>v.report.builder.sha256="f".repeat(64),/source changed/);
 invalid("missing witness files cannot be accepted from a saved hash",v=>v.report.source_files[0].path=path.join(temporary,"absent.txt"),/source changed/);
 invalid("invalid current-level labels cannot substitute historical paper level",v=>v.parts[id].current_level="possibly-HL",/Unknown current level/);
 for(const levelOwner of ["topic","part"]){
  for(const [label,levels]of [["string","SL HL"],["unknown member",["SL","HL","unknown"]],["duplicate member",["HL","HL"]],["null",null]])
   invalid(levelOwner+" current levels reject a "+label,v=>{(levelOwner==="topic"?v:v.parts[id]).current_levels=levels;},/current[- ]level/i);
 }
 invalid("an invalid topic default cannot become a current-level badge",v=>v.current_level="historically-HL",/current level/i);
 check("duplicate topic files cannot merge ambiguous source decisions",()=>{const {file}=load(input());assert.throws(()=>loadReviewedTopics([file,file]),/Duplicate reviewed topic/);});
 check("public taxonomy strips private evidence without paraphrasing authored guidance",()=>{
  const value={code:"A1.GRAPH",label:"Graph interpretation",summary:"Read the axes first.",checks:["Use the tangent at the stated instant."],classification_note:"A required technique may be assessed in context.",source_files:[witness(source)],canonical_row_ids:["private"],evidence:"Private quoted question",reviewed_level:"HL"};
  assert.deepEqual(publicTaxonomy([value]),[{code:value.code,label:value.label,summary:value.summary,checks:value.checks,classification_note:value.classification_note}]);
  assert.deepEqual(publicTaxonomy([{code:"C1.TYPE",label:"Displacement and time"}]),[{code:"C1.TYPE",label:"Displacement and time"}]);
 });
 console.log(checks+" reviewed-topic loader checks passed");
}finally{
 const resolved=path.resolve(temporary),base=path.resolve(os.tmpdir());
 assert.equal(path.dirname(resolved),base);assert(path.basename(resolved).startsWith("ppq-reviewed-topic-test-"));fs.rmSync(resolved,{recursive:true,force:true});
}
