/* Consumer-only IB practice groupings. Original source metadata must stay exact.
   Run: node test/test_physics_filters.js. No build or source files are written. */
"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const {JSDOM} = require("jsdom");
const ROOT = path.resolve(__dirname,"..");
const consumer = fs.readFileSync(path.join(ROOT,"example/physics-config.js"),"utf8");
const engine = fs.readFileSync(path.join(ROOT,"engine/ppqviewer.js"),"utf8");
const clone = value => JSON.parse(JSON.stringify(value));
const opened = [];
let checks = 0;
function check(name,run) { run(); checks++; console.log("ok "+name); }
function question(id,year,paper,groups=[]) {
  return {id,parent_id:id,source_part_id:"source-"+id,topic_codes:["A.5"],analysis_groups:groups,
    year,paper,level:"HL",question_number:"1",label:"(a)",marks:1,
    question_images:[id+".png"],context_images:[],markscheme_images:[id+"-ms.png"]};
}
const authored = [
  {code:"A5.REF",label:"Frames",summary:"Frame summary",checks:["Frame check"]},
  {code:"A5.GAMMA",label:"Empty Lorentz factor",summary:"Unused",checks:[]},
  {code:"A5.VEL",label:"Velocity addition",summary:"Velocity summary",checks:["Velocity check"]},
  {code:"A5.MUON",label:"Muon evidence",summary:"Muon summary",checks:["Muon check"]}
];
const meta = {course:"ib",title:"IB Physics",default_topic:"A.5",topics:{"A.5":"Relativity"},analysis:{groups:authored}};
function configure(records,metadata=meta) {
  const box = {window:{PHYSICS_META:metadata,PHYSICS_QUESTIONS:records,location:{search:""}},URLSearchParams};
  vm.runInNewContext(consumer,box); return box.window.PPQ_CONFIG;
}
function mount(records,metadata=meta) {
  const dom = new JSDOM('<div id="root"></div>',{url:"https://filter.test/",runScripts:"outside-only",pretendToBeVisual:true});
  const w=dom.window; w.confirm=()=>true; w.PHYSICS_META=metadata; w.PHYSICS_QUESTIONS=records;
  w.eval(engine); w.eval(consumer);
  const v=w.PPQViewer.mount(w.document.getElementById("root"),{questions:records,config:{...w.PPQ_CONFIG,defaultOrder:"ordered",prefetchAhead:0}});
  const p={dom,w,v,root:v.root};opened.push(p);return p;
}
function select(p,field,value) {
  const index=p.v.cfg.filters.findIndex(f=>f.field===field);
  assert(index>=0,"Missing consumer filter "+field);
  const node=p.root.querySelector('.ppq-select[data-fidx="'+index+'"]');node.value=value;
  node.dispatchEvent(new p.w.Event("change",{bubbles:true}));return node;
}
function poolIds(p) { return Array.from(p.v._practiceBaseView||p.v.view,q=>q.id).sort(); }
function filterValues(filter,source,parentValue) {
  return Array.from(typeof filter.values === "function" ? filter.values(source,parentValue) : filter.values || []);
}
function authoredTopic(entry) {
  if(entry.topic)return entry.topic;
  const match=/^([A-E])\.?([0-9]+)/.exec(entry.code);
  return match?match[1]+"."+match[2]:null;
}
try {
  check("four bounded year ranges include every endpoint without rewriting any source year",()=>{
    const years=[2003,2004,2009,2010,2015,2016,2020,2021,2025,2026,"unknown",null];
    const records=years.map((year,i)=>question("year"+i,year,"2")), before=JSON.stringify(records);
    const cfg=configure(records), filter=cfg.filters.find(f=>f.field==="year_range");
    assert.strictEqual(filter.label,"year range");
    assert.deepStrictEqual(Array.from(filter.values),["2004-2009","2010-2015","2016-2020","2021-2025"]);
    assert.deepStrictEqual(Array.from(filter.values,value=>filter.friendlyLabels[value]),["2004–2009","2010–2015","2016–2020","2021–2025"]);
    assert.deepStrictEqual(records.map(q=>filter.valueOf(q)),["","2004-2009","2004-2009","2010-2015","2010-2015","2016-2020","2016-2020","2021-2025","2021-2025","","",""]);
    assert.strictEqual(JSON.stringify(records),before);
    assert(!cfg.filters.some(f=>f.field==="year"));
  });
  check("Paper 1 covers 1A and 1B; Paper 2 includes former Paper 3 with original identities intact",()=>{
    const records=["1","1A","1B","2","3","unknown"].map((paper,i)=>question("paper"+i,2025,paper));
    records[1].answer_status="reviewed_source_key";records[1].correct_option="B";
    const before=JSON.stringify(records),cfg=configure(records),filter=cfg.filters.find(f=>f.field==="practice_paper");
    assert.strictEqual(filter.label,"paper");
    assert.deepStrictEqual(Array.from(filter.values),["1","2"]);
    assert.strictEqual(filter.friendlyLabels["2"],"Paper 2 (including former Paper 3)");
    assert.deepStrictEqual(records.map(q=>filter.valueOf(q)),["1","1","1","2","2",""]);
    assert.strictEqual(cfg.questionType(records[1]),"mcq");
    assert.strictEqual(cfg.questionType(records[2]),"marksSelfAssess","The practice grouping must not turn Paper 1B into an MCQ");
    assert.match(cfg.metaLine(records[4]),/Paper 3/);
    assert.strictEqual(cfg.attemptFields(records[4]).paper,"3");
    assert.strictEqual(JSON.stringify(records),before);
  });
  check("paper, year-range and level controls compose while showing the exact source paper",()=>{
    const records=[question("modern-mcq",2025,"1A",["A5.REF"]),question("modern-data",2025,"1B",["A5.VEL"]),
      question("written",2024,"2",["A5.REF"]),question("old-option",2009,"3",["A5.VEL"]),question("middle-option",2016,"3",["A5.MUON"])];
    records[4].level="SL";
    const before=JSON.stringify(records),p=mount(records);
    select(p,"practice_paper","1");assert.deepStrictEqual(poolIds(p),["modern-data","modern-mcq"]);
    select(p,"practice_paper","2");assert.deepStrictEqual(poolIds(p),["middle-option","old-option","written"]);
    select(p,"year_range","2004-2009");assert.deepStrictEqual(poolIds(p),["old-option"]);
    assert.match(p.root.querySelector(".ppq-qid").textContent,/2009.*Paper 3/);
    select(p,"year_range","2016-2020");assert.deepStrictEqual(poolIds(p),["middle-option"]);
    select(p,"level","HL");assert.deepStrictEqual(poolIds(p),[]);
    select(p,"level","ALL");select(p,"year_range","ALL");select(p,"practice_paper","ALL");
    assert.strictEqual(poolIds(p).length,records.length);
    assert.strictEqual(JSON.stringify(records),before);
  });
  check("A5 numbering follows authored nonempty groups without gaps or renumbering after a filter",()=>{
    const records=[question("frames",2025,"1A",["A5.REF"]),question("velocity",2004,"3",["A5.VEL"]),question("muon",2016,"3",["A5.MUON"])];
    const metadata=clone(meta),before=JSON.stringify(metadata),p=mount(records,metadata);
    const filter=p.v.cfg.filters.find(f=>f.field==="analysis_groups");
    const groupValues=filterValues(filter,records,"A.5");
    assert.deepStrictEqual(groupValues,["A5.REF","A5.VEL","A5.MUON"]);
    assert.deepStrictEqual(groupValues.map(code=>filter.friendlyLabels[code]),["A5.1 Frames","A5.2 Velocity addition","A5.3 Muon evidence"]);
    const axis=p.v.cfg.progressAxes.find(axis=>axis.key==="question_group");
    assert.strictEqual(axis.labelOf("A5.VEL"),"A5.2 Velocity addition");
    assert.deepStrictEqual(clone(filter.facetGuidanceOf("A5.VEL")),{summary:"Velocity summary",checks:["Velocity check"]});
    select(p,"year_range","2004-2009");
    assert.strictEqual(filter.friendlyLabels["A5.VEL"],"A5.2 Velocity addition");
    assert.match(p.root.querySelector('.ppq-facet-cat[data-value="A5.VEL"] .ppq-cat-name').textContent,/A5\.2 Velocity addition/);
    assert.strictEqual(JSON.stringify(metadata),before);
  });
  check("Trilogy and pre-IB keep their individual source paper and year controls",()=>{
    for(const course of ["trilogy","preib"]){
      const records=[question("first","2023","1"),question("second","2025","2")],before=JSON.stringify(records);
      const cfg=configure(records,{course,topics:{"A.5":"Forces"}});
      assert.deepStrictEqual(Array.from(cfg.filters.find(f=>f.field==="paper").values),["1","2"]);
      assert.deepStrictEqual(Array.from(cfg.filters.find(f=>f.field==="year").values),["2023","2025"]);
      assert(!cfg.filters.some(f=>f.field==="practice_paper"||f.field==="year_range"));
      assert.strictEqual(JSON.stringify(records),before);
    }
  });
  check("explicit D2 ownership exposes versioned lowercase groups and types without leaking another topic",()=>{
    const groupCodes=["d2_reviewed_v1:family:field","d2_reviewed_v1:family:force"];
    const atomCodes=["d2_reviewed_v1:type:field-strength","d2_reviewed_v1:type:particle-force"];
    const detailCodes=["d2_reviewed_v1:detail:field-strength","d2_reviewed_v1:detail:particle-force"];
    const records=groupCodes.map((code,i)=>({...question("d2-"+i,2025,"2",[code]),topic_codes:["D.2"],analysis_atoms:[atomCodes[i]],analysis_types:[detailCodes[i]]}));
    records.push({...question("other-a1",2025,"2",["D2.DECLARED_A1"]),topic_codes:["A.1"],analysis_atoms:["D2.DECLARED_A1_TYPE"],analysis_types:["D2.DECLARED_A1_DETAIL"]});
    records.push({...question("legacy-a5",2025,"2",["A5.REF"]),analysis_atoms:["A5.FRAME"],analysis_types:[]});
    const metadata={course:"ib",default_topic:"D.2",topics:{"A.1":"Kinematics","A.5":"Relativity","D.2":"Fields"},analysis:{
      groups:[...groupCodes.map((code,i)=>({code,topic:"D.2",label:"Fields group "+i,summary:"Fields guidance",checks:[]})),{code:"D2.DECLARED_A1",topic:"A.1",label:"Kinematics group"},{code:"A5.REF",label:"Frames"}],
      atoms:[...atomCodes.map((code,i)=>({code,topic:"D.2",label:"Fields type "+i,summary:"Fields type guidance",checks:[]})),{code:"D2.DECLARED_A1_TYPE",topic:"A.1",label:"Kinematics type"},{code:"A5.FRAME",label:"Frame type"}],
      types:[...detailCodes.map((code,i)=>({code,topic:"D.2",parent_atom:atomCodes[i],label:"Fields detail "+i})),{code:"D2.DECLARED_A1_DETAIL",topic:"A.1",parent_atom:"D2.DECLARED_A1_TYPE",label:"Kinematics detail"}]
    }};
    const before=JSON.stringify({records,metadata}),p=mount(records,metadata),filters=p.v.cfg.filters;
    const groups=filters.find(f=>f.field==="analysis_groups"),atoms=filters.find(f=>f.field==="analysis_atoms"),details=filters.find(f=>f.field==="analysis_types");
    const d2=records.filter(q=>q.topic_codes.includes("D.2"));
    assert.deepStrictEqual(filterValues(groups,d2,"D.2"),groupCodes);
    assert.deepStrictEqual(filterValues(atoms,d2,"D.2"),atomCodes);
    assert.deepStrictEqual(filterValues(groups,records,"A.1"),["D2.DECLARED_A1"]);
    assert.deepStrictEqual(filterValues(atoms,records,"A.1"),["D2.DECLARED_A1_TYPE"]);
    assert.deepStrictEqual(filterValues(groups,records,"A.5"),["A5.REF"],"Legacy authored topic codes still work");
    select(p,"topic_codes","D.2");assert.deepStrictEqual(poolIds(p),["d2-0","d2-1"]);
    for(let i=0;i<atomCodes.length;i++){
      select(p,"analysis_atoms",atomCodes[i]);assert.deepStrictEqual(poolIds(p),["d2-"+i]);
      assert.deepStrictEqual(filterValues(details,d2,atomCodes[i]),[detailCodes[i]]);
      select(p,"analysis_atoms","ALL");
    }
    for(let i=0;i<groupCodes.length;i++){
      select(p,"analysis_groups",groupCodes[i]);assert.deepStrictEqual(poolIds(p),["d2-"+i]);
      select(p,"analysis_groups","ALL");
    }
    assert.strictEqual(JSON.stringify({records,metadata}),before);
  });
  const latestPath=path.join(ROOT,"dist/ibphysics-release/latest.json");
  if(fs.existsSync(latestPath))check("real multi-topic release keeps A5 numbering and isolates each topic's group values without losing parts",()=>{
    const latest=JSON.parse(fs.readFileSync(latestPath,"utf8")),box={window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(latest.root,"data/physics_catalogue.js"),"utf8"),box);
    const records=clone(box.window.PHYSICS_QUESTIONS),metadata=clone(box.window.PHYSICS_META),before=JSON.stringify(records);
    const cfg=configure(records,metadata),paper=cfg.filters.find(f=>f.field==="practice_paper"),years=cfg.filters.find(f=>f.field==="year_range"),groups=cfg.filters.find(f=>f.field==="analysis_groups");
    const a5=records.filter(q=>q.topic_codes.includes("A.5")),a5Groups=filterValues(groups,a5,"A.5");
    const authoredA5=metadata.analysis.groups.filter(entry=>authoredTopic(entry)==="A.5"&&a5.some(q=>(q.analysis_groups||[]).includes(entry.code)));
    assert(authoredA5.length>0);assert.deepStrictEqual(a5Groups,authoredA5.map(entry=>entry.code));
    authoredA5.forEach((entry,i)=>assert.strictEqual(groups.friendlyLabels[entry.code],"A5."+(i+1)+" "+entry.label));
    for(const entry of metadata.analysis.groups.filter(entry=>authoredTopic(entry)==="A.5"&&!authoredA5.includes(entry)))assert(!a5Groups.includes(entry.code),"An empty reviewed group must not consume a numbered position");
    const topicGroups=[];
    for(const topic of cfg.filters.find(f=>f.field==="topic_codes").values){
      const source=records.filter(q=>q.topic_codes.includes(topic)),values=filterValues(groups,source,topic);
      assert(source.length>0,"Each offered topic must have practice parts");
      const expectedGroups=metadata.analysis.groups.filter(entry=>authoredTopic(entry)===topic&&(topic!=="A.5"||source.some(q=>(q.analysis_groups||[]).includes(entry.code))));
      assert.deepStrictEqual(values,expectedGroups.map(entry=>entry.code),"Each topic must expose its authored groups, retaining the A5 nonempty numbering policy");
      topicGroups.push(...values);
    }
    assert.deepStrictEqual(filterValues(groups,records,"ALL").sort(),Array.from(new Set(topicGroups)).sort());
    const muonIndex=authoredA5.findIndex(entry=>entry.code==="A5.MUON");
    assert(muonIndex>=0);assert.strictEqual(groups.friendlyLabels["A5.MUON"],"A5."+(muonIndex+1)+" "+authoredA5[muonIndex].label);
    assert.strictEqual(records.length,latest.parts);
    assert(records.every(q=>paper.values.includes(paper.valueOf(q))&&years.values.includes(years.valueOf(q))));
    assert.strictEqual(a5.filter(q=>paper.valueOf(q)==="1").length,4);
    assert.strictEqual(a5.filter(q=>paper.valueOf(q)==="2").length,a5.length-4);
    assert.strictEqual(JSON.stringify(records),before);
  });
  console.log(checks+" physics filter and source-identity journeys passed");
}finally{opened.forEach(({v,dom})=>{v.destroy();dom.window.close();});}
