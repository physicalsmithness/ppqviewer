/* Pure consumer pacing checks. Primary evidence: reports/ib-physics-timing-evidence.md.
   Engine tests independently cover saved learner preferences, active-attempt
   snapshots and extra-time application. Run: node test/test_ib_physics_pacing.js. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),vm=require("vm");
const ROOT=path.resolve(__dirname,".."),consumer=fs.readFileSync(path.join(ROOT,"example/physics-config.js"),"utf8");
let checks=0;
function check(name,run){run();checks++;console.log("ok "+name);}
function configure(course="ib",records=[]){
  const box={window:{PHYSICS_META:{course,topics:{"A.5":"Relativity",DATA:"Data analysis and experimental method"}},PHYSICS_QUESTIONS:records,location:{search:""}},URLSearchParams};
  vm.runInNewContext(consumer,box);return box.window.PPQ_CONFIG;
}
function question(extra={}){
  return {id:"source-part",parent_id:"source-parent",source_part_id:"stable-source-id",paper:"2",year:"2025",level:"HL",marks:3,topic_codes:["A.5"],...extra};
}
const config=configure(),target=config.timing.targetOf,hl={learnerLevel:"HL"},sl={learnerLevel:"SL"};
check("IB pacing is available with an explicit HL site default but the timer remains off",()=>{
  assert.strictEqual(config.timing.defaultMode,"none");
  assert.strictEqual(config.learnerLevel.enabled,true);
  assert.strictEqual(config.learnerLevel.defaultValue,"HL");
  assert.match(config.timing.description,/Current IB practice pace/);
  assert.match(config.timing.description,/Extra time/);
  assert.strictEqual(target(question()),300,"Missing context uses the explicit site default, not a source-level guess");
});
check("current Paper 2 targets reproduce verified HL 150min/90 and SL 90min/50 totals",()=>{
  assert.strictEqual(target(question(),hl),300);
  assert.strictEqual(target(question(),sl),324);
  assert.strictEqual(target(question({marks:90}),hl),150*60);
  assert.strictEqual(target(question({marks:50}),sl),90*60);
});
check("all Paper 1 variants use the combined-paper average without a fabricated A/B time split",()=>{
  for(const paper of ["1","1A","1B"]){
    assert.strictEqual(target(question({paper,marks:1}),hl),120);
    assert.strictEqual(target(question({paper,marks:1}),sl),120);
  }
  assert.strictEqual(target(question({paper:"1A",marks:40}),hl),80*60);
  assert.strictEqual(target(question({paper:"1B",marks:20}),hl),40*60);
  assert.strictEqual(target(question({paper:"1A",marks:25}),sl)+target(question({paper:"1B",marks:20}),sl),90*60);
});
check("remembered learner level controls written pacing independently of original HL/SL labels",()=>{
  for(const level of ["HL","SL","HLSL",""]){
    assert.strictEqual(target(question({paper:"3",year:"2009",level}),hl),300);
    assert.strictEqual(target(question({paper:"3",year:"2009",level}),sl),324);
  }
  assert.strictEqual(target(question({level:"SL"})),300,"A historical SL source must not silently change the default learner profile");
});
check("former Paper 3 written questions use current pace while historical DATA uses Paper 1B pace",()=>{
  for(const year of ["2004","2009","2016","2024","2025"]){
    assert.strictEqual(target(question({year,paper:"3"}),hl),300);
    assert.strictEqual(target(question({year,paper:"3"}),sl),324);
    for(const paper of ["2","3"]){
      const data=question({year,paper,topic_codes:["A.1","DATA"]});
      assert.strictEqual(target(data,hl),360);
      assert.strictEqual(target(data,sl),360);
    }
  }
});
check("unknown, invalid and non-integer marks do not fabricate a pacing target",()=>{
  for(const marks of [undefined,null,0,-1,"3",NaN,Infinity,2.5,false]){
    assert.strictEqual(target(question({marks}),hl),null);
    assert.strictEqual(target(question({paper:"1A",marks}),sl),null);
  }
});
check("pacing and badges preserve original source metadata and keep historical level distinct",()=>{
  const q=question({paper:"3",year:"2009",level:"SL"}),before=JSON.stringify(q);
  target(q,hl);target(q,sl);
  assert.deepStrictEqual(Array.from(config.questionBadgesOf(q),b=>b.label),["Current: HL","Original paper: SL"]);
  assert.strictEqual(config.attemptFields(q).level,"SL");
  assert.strictEqual(config.attemptFields(q).paper,"3");
  assert.strictEqual(JSON.stringify(q),before);
});
check("Trilogy and pre-IB retain a stopwatch without any assumed IB mark allocation",()=>{
  for(const course of ["trilogy","preib"]){
    const cfg=configure(course);
    assert.strictEqual(cfg.timing.targetOf,null);
    assert.strictEqual(cfg.timing.defaultMode,"none");
    assert.strictEqual(cfg.learnerLevel.enabled,false);
  }
});
const latestPath=path.join(ROOT,"dist/ibphysics-release/latest.json");
if(fs.existsSync(latestPath))check("the real A5 pool has exact per-mark targets with unchanged source records",()=>{
  const latest=JSON.parse(fs.readFileSync(latestPath,"utf8")),box={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(latest.root,"data/physics_catalogue.js"),"utf8"),box);
  const records=JSON.parse(JSON.stringify(box.window.PHYSICS_QUESTIONS)),before=JSON.stringify(records),cfg=configure("ib",records);
  const mcqs=records.filter(q=>cfg.questionType(q)==="mcq");assert.strictEqual(mcqs.length,4);
  mcqs.forEach(q=>{assert.strictEqual(cfg.timing.targetOf(q,hl),120);assert.strictEqual(cfg.timing.targetOf(q,sl),120);});
  const oldSL=records.find(q=>q.paper==="3"&&q.level==="SL"&&Number(q.year)<2016&&Number.isInteger(q.marks)&&q.marks>0);
  assert(oldSL,"Real witness of historical SL relativity content is needed");
  assert.strictEqual(cfg.timing.targetOf(oldSL,hl),oldSL.marks*100);
  assert.strictEqual(cfg.timing.targetOf(oldSL,sl),oldSL.marks*108);
  assert.strictEqual(records.length,latest.parts);
  assert.strictEqual(JSON.stringify(records),before);
});
console.log(checks+" IB pacing and source-level checks passed");
