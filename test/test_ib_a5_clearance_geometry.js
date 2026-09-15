"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),crypto=require("crypto"),vm=require("vm");
const {overlap}=require("../tools/build_ib_a5_clearance"),{buildIbExclusions}=require("../tools/physics-test-exclusions");
const ROOT=path.resolve(__dirname,".."),DB=process.env.PHYSICS_PAPERDB_ROOT||"C:/CodexProjects/PaperDatabases",sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const clearance=path.join(ROOT,"reports/ib-a5-release-clearance.json"),before=fs.readFileSync(clearance);
let checks=0;function check(name,fn){fn();checks++;console.log("ok "+name);}
const sources=[
 {preview:"ib_physics_2008_may_3_030c56b9",page:11,bbox:[60,582,568,621],text:[70.92,588.15,555.96,615.23],metadataSha:"2172f89a72f6e6dc5746b90d8bfd1e57e783d70be9b1beb9bc571b700c3c57c1",pageSha:"5ddf4de4be060041d1baef900eecce546c308592f2712e3a78b8e495d338a58e"},
 {preview:"ib_physics_2008_may_3_fce874db",page:10,bbox:[60,609,568,649],text:[70.92,615.75,555.96,642.83],metadataSha:"d8b5b4147ce83531a84a47fe498a300dec5d2b458150c8347cd4c6e7956d1e12",pageSha:"c0337c62b519baf81751c1513c47e83969880f2d6caff3749bab51528e92ebff"}
];
for(const s of sources){
 const dir=path.join(DB,"outputs/previews",s.preview),bytes=fs.readFileSync(path.join(dir,"mark_scheme_preview.json"));
 s.meta=JSON.parse(bytes);s.entry=s.meta.entries.find(e=>e.part_label==="G2(b)(i)");
 check(s.preview+" uses the repaired actual row while separate G1 remains outside",()=>{
  assert.strictEqual(sha(bytes),s.metadataSha);const n=String(s.page).padStart(3,"0");
  assert.strictEqual(sha(fs.readFileSync(path.join(dir,"pages",`mark_v${n}_p${n}.png`))),s.pageSha);
  assert.strictEqual(s.entry.ms_crop_adequacy,"adequate");assert.strictEqual(s.entry.question_number,"G2");assert.strictEqual(s.entry.marks,1);
  assert.deepStrictEqual(s.entry.asset_blocks,[]);assert.strictEqual(s.entry.crop_regions.length,1);
  const r=s.entry.crop_regions[0];assert.strictEqual(r.page_number,s.page);assert.deepStrictEqual(r.bbox,s.bbox);assert.deepStrictEqual(r.original_text_bbox,s.text);assert.strictEqual(r.crop_geometry_revision,"row-graphics-v1");
  assert(/rest frame/.test(s.entry.answer_text));assert(!/40\s*[/÷]|gamma|γ/.test(s.entry.answer_text));
  for(const label of ["G1(a)(i)","G1(a)(ii)"]){const g1=s.meta.entries.find(e=>e.part_label===label);assert(g1);assert(!g1.crop_regions.some(a=>s.entry.crop_regions.some(b=>overlap(a,b))));}
 });
}
check("actual padding remains protected instead of the narrower old text box",()=>{
 for(const s of sources){const edge={page_number:s.page,bbox:[s.bbox[0]+1,s.bbox[1]+1,s.text[0]-1,s.text[1]-1]};assert(overlap(edge,s.entry.crop_regions[0]));assert(!overlap(edge,{page_number:s.page,bbox:s.text}));}
});
check("full-page rectangles retain ordinary conservative overlap with no exception code",()=>{
 for(const s of sources){const full={page_number:s.page,bbox:[0,0,595,842]};assert(overlap(full,s.entry.crop_regions[0]));assert(s.meta.entries.find(e=>e.part_label==="G1(a)(i)").crop_regions.some(r=>overlap(full,r)));}
 const code=fs.readFileSync(path.join(ROOT,"tools/build_ib_a5_clearance.js"),"utf8");assert(!/REVIEWED_RESERVED_REGIONS|reviewedReservedRegions|function reservedRegions/.test(code));assert(code.includes("reserved.some(e=>(e.crop_regions||[]).some"));
});
check("both repaired definition parents and all their parts remain reserved",()=>{
 const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(DB,"Physics Categorisation/viewer/ibphysics_catalogue.js"),"utf8"),box);const native=box.window.IBPHYS_QUESTIONS;
 const closure=buildIbExclusions({paperdbRoot:DB,questions:native,extraExclusionsPaths:[path.join(ROOT,"dist/physics-audit/current-ib-tests.json"),path.join(ROOT,"reports/ib-a5-reviewed-test-exclusions.json")]});
 for(const s of sources){const parents=native.filter(q=>q.preview===s.preview&&q.question==="G2");assert.strictEqual(parents.length,1);for(const q of parents){assert(closure.blockedParentIds.has(q.id));for(const p of q.parts)assert(closure.blockedSourceIds.has(p.source_part_id),p.source_part_id);}}
});
assert(fs.readFileSync(clearance).equals(before));console.log(checks+" A5 actual-source geometry checks passed; canonical clearance unchanged");
