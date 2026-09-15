/* Pure optional help configuration checks; no service requests are made.
   Run: node test/test_teacher_help_config.js. Client journeys have separate tests. */
"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path");
const {JSDOM}=require("jsdom");
const dom=new JSDOM('<div id="root"></div>',{url:"https://viewer.test/",runScripts:"outside-only",pretendToBeVisual:true});
const w=dom.window;let networkCalls=0,checks=0;
w.fetch=()=>{networkCalls++;throw Error("Configuration must never send a request");};
w.eval(fs.readFileSync(path.join(__dirname,"../engine/ppqviewer.js"),"utf8"));
const v=w.PPQViewer.mount(w.document.getElementById("root"),{config:{storageKey:"help-config-test",prefetchAhead:0},questions:[]});
const normalize=(teacherHelp,extra={})=>v._withDefaults({storageKey:"help-config-test",title:"Subject practice",teacherHelp,...extra});
const check=(name,run)=>{run();checks++;console.log("ok "+name);};
try {
  check("unconfigured, disabled and insecure endpoints leave teacher help off",()=>{
    for(const value of [undefined,null,false,{}, {endpoint:""},{endpoint:"http://service.test/"},{endpoint:"javascript:alert(1)"},{endpoint:"/relative"},{endpoint:"https://service.test/",enabled:false}]){
      assert.strictEqual(normalize(value).teacherHelp,null);
    }
  });
  check("a configured HTTPS service retains its exact endpoint and source hooks",()=>{
    const sourceLabelOf=q=>"Question "+q.id,sourceUrlOf=q=>"https://public.test/?part="+q.id,contextOf=q=>({source_id:q.id});
    const cfg=normalize({endpoint:"https://service.test/help?project=physics",project:"ibphysics",sourceLabelOf,sourceUrlOf,contextOf});
    assert.strictEqual(cfg.teacherHelp.endpoint,"https://service.test/help?project=physics");assert.strictEqual(cfg.teacherHelp.project,"ibphysics");
    assert.strictEqual(cfg.teacherHelp.sourceLabelOf,sourceLabelOf);assert.strictEqual(cfg.teacherHelp.contextOf,contextOf);
    assert.strictEqual(cfg.teacherHelp.sourceUrlOf,sourceUrlOf);
  });
  check("defaults use the host title and its source label without inventing context",()=>{
    const cfg=normalize({endpoint:"https://service.test/help"},{metaLine:q=>"Paper 3, question "+q.id});
    assert.strictEqual(cfg.teacherHelp.project,"Subject practice");assert.strictEqual(cfg.teacherHelp.sourceLabelOf({id:"7(a)"}),"Paper 3, question 7(a)");
    assert.strictEqual(cfg.teacherHelp.contextOf,null);
    assert.strictEqual(cfg.teacherHelp.sourceUrlOf({id:"7(a)"}),"https://viewer.test/");
  });
  check("malformed optional hooks are ignored and the supplied configuration is not changed",()=>{
    const input={endpoint:"https://service.test/help",project:42,sourceLabelOf:"bad",contextOf:{source_id:"invented"}};
    const before=JSON.stringify(input),cfg=normalize(input);
    assert.strictEqual(cfg.teacherHelp.project,"42");assert.strictEqual(cfg.teacherHelp.sourceLabelOf({id:"native-id"}),"native-id");
    assert.strictEqual(cfg.teacherHelp.contextOf,null);assert.strictEqual(JSON.stringify(input),before);assert.notStrictEqual(cfg.teacherHelp,input);
  });
  check("teacher help and display reporting keep separate endpoints and projects",()=>{
    const cfg=normalize({endpoint:"https://help.test/service",project:"teaching"},{problemReport:{endpoint:"https://display.test/service",project:"display"}});
    assert.strictEqual(cfg.teacherHelp.endpoint,"https://help.test/service");assert.strictEqual(cfg.problemReport.endpoint,"https://display.test/service");
    assert.strictEqual(cfg.teacherHelp.project,"teaching");assert.strictEqual(cfg.problemReport.project,"display");assert.strictEqual(networkCalls,0);
  });
  console.log(checks+" teacher-help configuration checks passed");
} finally {v.destroy();w.close();}
