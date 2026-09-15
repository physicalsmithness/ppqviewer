"use strict";
const assert=require("assert"), fs=require("fs"), path=require("path"), os=require("os"), crypto=require("crypto");
const {buildOriginalEvidence}=require("../tools/ib-topic-originals");
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
let checked=0;
function test(label,run){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"ppq-topic-originals-"));
  try{
    const preview="ib_physics_fixture",id="ibchem_part_123456789abcdef0",parentId="08M.P3.SL.TZ1.QA1";
    const part={source_part_id:id,part_id:parentId+"(a)",label:"(a)",marks:3,self_mark:"manual"};
    const parent={id:parentId,preview,year:"2008",paper:"3",level:"SL",session:"May",time_zone:"TZ1",question:"A1",parts:[part]};
    const row={part_id:id,preview,year:"2008",paper:"3",paper_variant:"",level:"SL",session:"May",time_zone:"TZ1",question:"A1",question_source:"original/qp.pdf",mark_scheme_source:"original/ms.pdf"};
    const source=(relative_path,document_type)=>({relative_path,document_type,subject:"Physics",year:"2008",paper:"3",paper_variant:"",level:"SL",series:"May",time_zone:"TZ1"});
    const qp={source:source(row.question_source,"question_paper")},ms={source:source(row.mark_scheme_source,"mark_scheme")};
    const record={id:part.part_id,parent_id:parentId,source_part_id:id,year:"2008",paper:"3",level:"SL",question_number:"A1",topic_codes:["C.1"],marks:3};
    const write=(p,b)=>{const full=path.join(root,p);fs.mkdirSync(path.dirname(full),{recursive:true});fs.writeFileSync(full,b);};
    function sync(){
      write("Physics Categorisation/viewer/ibphysics_catalogue.js","window.IBPHYS_QUESTIONS="+JSON.stringify([parent])+";");
      write("outputs/exports/ib_physics_archive_flat_v5.csv",Object.keys(row).join(",")+"\n"+Object.values(row).join(",")+"\n");
      write("outputs/previews/"+preview+"/question_preview.json",JSON.stringify(qp));
      write("outputs/previews/"+preview+"/mark_scheme_preview.json",JSON.stringify(ms));
    }
    write(row.question_source,"%PDF-1.4\nquestion fixture");write(row.mark_scheme_source,"%PDF-1.4\nscheme fixture");sync();
    const build=(records=[record])=>buildOriginalEvidence(records,{paperdbRoot:root});
    run({root,id,parent,part,row,qp,ms,record,write,sync,build});checked++;console.log("PASS "+label);
  }finally{assert(path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep+"ppq-topic-originals-"));fs.rmSync(root,{recursive:true,force:true});}
}
test("Manual multi-mark parts bind both original PDFs, both metadata files and identity sources",f=>{
  const before=JSON.stringify(f.record),r=f.build();assert.equal(r.originals.length,1);assert.equal(r.fingerprints.length,7);
  assert.equal(r.originals[0].part_id,f.record.id);assert.equal(r.originals[0].parent_id,f.parent.id);
  assert.equal(r.originals[0].question_source.path,path.join(f.root,f.row.question_source));
  assert.equal(r.originals[0].markscheme_source.path,path.join(f.root,f.row.mark_scheme_source));
  for(const file of r.fingerprints)assert.equal(file.sha256,sha(fs.readFileSync(file.path)));
  assert.equal(JSON.stringify(f.record),before);
});
test("Wrong consumer parent and ambiguous native source IDs fail closed",f=>{
  f.record.parent_id+="wrong";assert.throws(()=>f.build(),/parent\/part identity/);f.record.parent_id=f.parent.id;
  f.parent.parts.push({...f.part});f.sync();assert.throws(()=>f.build(),/join is missing or ambiguous/);
});
test("An original PDF must have the same identity as its exact archive part",f=>{
  f.ms.source.relative_path="original/unrelated.pdf";f.sync();assert.throws(()=>f.build(),/attribution differs/);
  f.ms.source.relative_path=f.row.mark_scheme_source;f.ms.source.time_zone="TZ2";f.sync();assert.throws(()=>f.build(),/time_zone differs/);
});
test("Subject, paper variant and document roles cannot be substituted",f=>{
  f.qp.source.subject="Chemistry";f.sync();assert.throws(()=>f.build(),/subject\/type/);
  f.qp.source.subject="Physics";f.qp.source.paper_variant="extra";f.sync();assert.throws(()=>f.build(),/paper_variant differs/);
  f.qp.source.paper_variant="";f.qp.source.document_type="mark_scheme";f.sync();assert.throws(()=>f.build(),/subject\/type/);
});
test("The original year embargo applies even when every metadata layer agrees",f=>{
  f.record.year=f.parent.year=f.row.year=f.qp.source.year=f.ms.source.year="2026";f.sync();assert.throws(()=>f.build(),/permitted range/);
});
test("Matching archive and metadata paths still cannot escape the source root",f=>{
  f.row.question_source=f.qp.source.relative_path="../outside.pdf";f.sync();assert.throws(()=>f.build(),/escapes its root/);
});
test("Changed original PDF bytes change the witness; corrupt originals fail",f=>{
  const before=f.build().originals[0].markscheme_source.sha256;
  f.write(f.row.mark_scheme_source,"%PDF-1.4\nnew original bytes");assert.notEqual(f.build().originals[0].markscheme_source.sha256,before);
  f.write(f.row.mark_scheme_source,"invalid PDF");assert.throws(()=>f.build(),/PDF header/);
});
test("Duplicate selected IDs fail and existing A5 remains outside this check",f=>{
  assert.throws(()=>f.build([f.record,{...f.record}]),/missing or repeated/);
  assert.equal(f.build([{...f.record,topic_codes:["A.5"]}]).originals.length,0);
});
console.log(checked+" IB topic original-source checks passed");
