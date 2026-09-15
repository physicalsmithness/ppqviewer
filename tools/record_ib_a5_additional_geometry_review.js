"use strict";
// Records a completed, bounded visual review. The archive is read-only; fixed
// source/image hashes prevent this evidence being regenerated over new crops.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),DB='C:/CodexProjects/PaperDatabases';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const CASES=[
 ['04N.P3.SL.TZ0.QG1',['E2'],['ibchem_part_b1ace3fe5c6091b2','ibchem_part_f69d37f76949ec45'],[11],14,'G1 postulates and muon experimental evidence are wholly on PDF page 14; E2(d)(ii) is on page 11.'],
 ['04N.P3.HL.TZ0.QG1',['E2'],['ibchem_part_9801e2389b881dbe','ibchem_part_ee8cddffbfb04dc7'],[8],13,'G1 postulates and muon experimental evidence are wholly on PDF page 13; E2(d)(ii) is on page 8.'],
 ['05M.P3.SL.TZ1.QG1',['A1','F2'],['ibchem_part_d5bafcbf33e0763e','ibchem_part_bbdd12309133a4cb','ibchem_part_050be984f7e4b23c'],[4,14],15,'G1 answer page 15 is separate from A1 page 4 and F2 page 14. Nevertheless this entire parent is held: original question PDF page 25 lacks the spacecraft observation and diagram required by (i)/(ii).'],
 ['05M.P3.HL.TZ1.QG1',['F2'],['ibchem_part_a4f7d8a928b5d3c7','ibchem_part_785a21d4fa5495cb','ibchem_part_d6fde5a2ee12c7df'],[11],12,'G1 postulates and relative-spacecraft answers occupy PDF page 12; F2(c)(ii) occupies page 11. The HL question original page 19 retains the complete spacecraft stem/diagram.'],
 ['07M.P3.SL.TZ2.QG3',['A3'],['ibchem_part_c71b068ddcae2ed6'],[4],10,'The complete four-mark G3 carriage simultaneity answer is at the bottom of PDF page 10; A3(b)(ii) is on page 4. The second assigned image is only the next Option H heading on page 11 and is suppressed exactly.'],
 ['07N.P3.SL.TZ0.QG1',['A2'],['ibchem_part_4cff34812183cf56'],[5],12,'The complete four-mark G1 Lucinda/Simon answer occupies the top of PDF page 12; reserved A2(b) is on page 5.'],
 ['07N.P3.SL.TZ0.QG2',['A2'],['ibchem_part_40756e64530ff5c1','ibchem_part_0a9a760cb6a98e05'],[5],12,'G2(a)(ii) gamma/time calculation and G2(b) same-position astronaut answer are on PDF page 12; A2(b) is on page 5.'],
 ['10N.P3.SL.TZ0.QD1',['B1'],['ibchem_part_75329d9d7800e637','ibchem_part_e5b8f78121481cc1'],[6],9,'D1(c) c-delta-t and D1(e) 0.90c answers occupy PDF page 9 (printed 11); B1(a)(i) photoelectric explanation is PDF page 6 (printed 8). Exact current crops agree with these two D1 rows.'],
 ['11M.P3.HL.TZ1.QH2',['E2'],['ibchem_part_767169686398263f','ibchem_part_428d2dd936506382','ibchem_part_b8053874d0dd85e7'],[5],15,'H2 velocity-transform and validity answers occupy PDF page 15; E2(a)(iii) HR-diagram line is on page 5. H2(a)(ii) has an overlapping partial first image, but its second image contains the full two-mark result and alternative-answer instruction. Neither image contains reserved E2.']
];
const APPROVED_MS={
 'mark_scheme_g1_a_v014_p014_01_662db53aef.png':'6e0ff80bbd485f901be97e4be4de16be438cef754023bbf5489b88b04f8703f2',
 'mark_scheme_g1_c_v014_p014_01_cc3df453ec.png':'867a3b9b4c24d3e1d53504bd021fc01631bd3c14d5e6cb1178076555a7ca8da0',
 'mark_scheme_g1_a_v013_p013_01_82ed8e2acb.png':'6e0ff80bbd485f901be97e4be4de16be438cef754023bbf5489b88b04f8703f2',
 'mark_scheme_g1_c_v013_p013_01_a417d8720c.png':'867a3b9b4c24d3e1d53504bd021fc01631bd3c14d5e6cb1178076555a7ca8da0',
 'mark_scheme_g1_a_v015_p015_01_4c8a199037.png':'388696dd9588d390014a1c6b17926c90743c5615a360b04881737d409c5220c1',
 'mark_scheme_g1_a__i_v015_p015_01_2fa8b6fe67.png':'cabd69f58a3dfc685e8c4d000b6f14e9769c9627ad7c14a2549e930012e21a29',
 'mark_scheme_g1_a__ii_v015_p015_01_9ab386a4a0.png':'237deebee4131b0feeb9dd0c3505720f4381df21072dc04177123bcba38c747a',
 'mark_scheme_g1_a_v012_p012_01_5e4a908f16.png':'cd00352df369c0c18945b0e256d3a5255a8a8c330706abbc7dbb019d62f97b44',
 'mark_scheme_g1_b__i_v012_p012_01_1ab586ef8a.png':'418480072354bbe6f4a37d768f80808ebd0f54bb0e6a1db79c579ab0ccb93a18',
 'mark_scheme_g1_b__ii_v012_p012_01_312e1913b6.png':'160deef3465c02059c4a32ae762ab876a2f837749a9b647aef005d10b7dc56f1',
 'mark_scheme_g3_v010_p010_01_64413c83c0.png':'142d31c1425d13c0c198dd3677d838a17d4417776cc51e31b50c9a255c228cd6',
 'mark_scheme_g3_v011_p011_02_208ffebced.png':'5b264b496281b71588dc91fe13680a2f0a7a482053e7ccbc25912f3310e4f030',
 'mark_scheme_g1_v012_p012_01_868a46fd96.png':'947b926e6858ea474542e8422a0357451dc249ea61b3eeba45ecc6a73a23f5aa',
 'mark_scheme_g2_a__ii_v012_p012_01_48bf008408.png':'20ac43e80cca77056ef79c341de5727619aedad318cdd2be0dace0a82072fbb6',
 'mark_scheme_g2_b_v012_p012_01_779d9a0335.png':'5f1e5281ed554963b4ec9a4ef0148fa30133a1ac4b4ee855d14a4f35a8531dfe',
 'mark_scheme_d1_c_v009_p009_01_ac0b1c1c1c.png':'94d3bdd0b7ca762e2b17d875d0e99fb664e223d62fa596962435524b20da7f4d',
 'mark_scheme_d1_e_v009_p009_01_fcf8c2c5ca.png':'f77ce22c1baf7d75603d63175efa7977dca8eed2ab538332877551c3ae72d105',
 'mark_scheme_h2_a__i_v015_p015_01_3c5b014028.png':'41bd9b60f542d51b42a8120e7b426bb097cafcca2c2e5e2adfab83d33164317c',
 'mark_scheme_h2_a__ii_v015_p015_01_adaf2753be.png':'79e9e16fc4b3f283c9a3f257e9bc6804e3cb9228f92b1fa506f24538012aeb95',
 'mark_scheme_h2_a__ii_v015_p015_02_d07cf0881c.png':'c1860a0fd2cf0cc49dfd85b51cd0dbf2cc7ceb0e5f64c150ead7476f5644af29',
 'mark_scheme_h2_b_v015_p015_01_9f783eb5f3.png':'050aeb69a4612ead1a64829d18a2f63f4ab472972f50c7737b6a9940244b91ac'
};
function build(){
 const files=new Map();
 function read(f,expected){f=path.resolve(f);const bytes=fs.readFileSync(f),digest=sha(bytes);ensure(!expected||digest===expected,'Reviewed source changed: '+f);files.set(f,{path:f,sha256:digest});return bytes;}
 const nativePath=path.join(DB,'Physics Categorisation/viewer/ibphysics_catalogue.js');
 const box={window:{}};vm.runInNewContext(read(nativePath,'050e5203246af6f79f667353c7a8b3668b0657cdaf412a9a0809b1be4e584448').toString('utf8'),box);
 read(path.join(DB,'outputs/exports/ib_physics_archive_flat_v5.csv'),'6034e8854097c03384922d542b244164603262b1d6b0189d7a5a0ec34c13c17c');
 const pages=JSON.parse(read(path.join(ROOT,'dist/physics-audit/a5-additional-geometry/source-pages.json'),'f94f3ca9136e88862656ded2675b4fd37b66b8b8974cb0f016aeb5b610539c1a'));
 const held=['05M.P3.SL.TZ1.QG1'],retained=[],suppressed=[],required=[],dispositions=[];
 for(const [parentId,missing,ids,reservedPages,answerPage,finding] of CASES){
  const parent=box.window.IBPHYS_QUESTIONS.find(q=>q.id===parentId);ensure(parent,'Missing native parent');
  const proof=pages.cases.find(c=>c.preview===parent.preview);ensure(proof,'Missing original page review');
  read(proof.source.path,proof.source.sha256);const ms=JSON.parse(read(proof.metadata.path,proof.metadata.sha256));
  for(const p of proof.rendered_pages)read(p.path,p.sha256);
  const qpPath=path.join(DB,'outputs/previews',parent.preview,'question_preview.json'),qp=JSON.parse(read(qpPath));
  const questionSource=path.join(DB,qp.source.relative_path);read(questionSource);
  const reserved=ms.entries.filter(e=>missing.includes(String(e.question_number))&&!(e.crop_regions||[]).length).map(e=>({question_number:e.question_number,part_label:e.part_label,page_start:e.page_start,page_end:e.page_end,crop_regions:e.crop_regions||[]}));
  ensure(new Set(reserved.map(r=>r.question_number)).size===missing.length,'Missing reserved identity changed');
  for(const sourceId of ids){
   const part=parent.parts.find(p=>p.source_part_id===sourceId);ensure(part,'Native source part changed');
   for(const file of part.ms_crops){
    const full=path.join(DB,'outputs/previews',parent.preview,'crops',path.basename(file)),expected=APPROVED_MS[path.basename(file)];ensure(expected,'Unreviewed answer image');read(full,expected);
    const record={parent_id:parentId,source_part_id:sourceId,role:'markscheme',path:path.resolve(full),sha256:expected};
    if(path.basename(file)==='mark_scheme_g3_v011_p011_02_208ffebced.png')suppressed.push({...record,reason:'This image contains only the following Option H — Optics heading. Original PDF page 10 contains the complete four-mark G3 answer; page 11 starts a different option.',remaining_answer_complete:true});
    else if(!held.includes(parentId))retained.push({...record,missing_reserved_questions:missing,review_complete:true,reserved_content_found:false,source_pdf:proof.source,source_page:answerPage,reserved_pdf_pages:reservedPages,reserved_original_entries:reserved,finding});
    if(path.basename(file)==='mark_scheme_g3_v010_p010_01_64413c83c0.png')required.push({...record,reason:'Complete four-mark G3 answer, including its award-zero instruction, visually matched to original PDF page 10.',remaining_answer_complete:true});
   }
  }
  if(parentId==='05M.P3.SL.TZ1.QG1'||parentId==='05M.P3.HL.TZ1.QG1'){
   for(const f of parent.crops)read(path.join(DB,'outputs/previews',parent.preview,'crops',path.basename(f)));
   if(parentId==='05M.P3.SL.TZ1.QG1')read(path.join(DB,'outputs/previews',parent.preview,'pages/question_v025_p025.png'));
  }
  dispositions.push({parent_id:parentId,source_part_ids:ids,disposition:held.includes(parentId)?'hold_whole_parent':'retain_exact_reviewed_assets',finding,source_pdf:proof.source,reserved_original_entries:reserved,reserved_pdf_pages:reservedPages,answer_pdf_page:answerPage,question_source_pdf:files.get(path.resolve(questionSource)),question_page:qp.question_groups.find(g=>String(g.question_number)===String(parent.question)).page_start});
 }
 read(__filename);read(path.join(ROOT,'tools/review_ib_a5_additional_geometry.py'));
 for(const f of ['reports/ib-review-note-reservations.json','reports/ib-d2-reviewed-test-exclusions.json'])read(path.join(ROOT,f));
 return {schema_version:1,review_complete:true,reviewed_at:'2026-09-12T22:59:04Z',method:'Independent visual comparison of every scoped answer image with 27 freshly rendered original markscheme PDF pages; direct original question PDF rendering for the SL/HL May 2005 G1 source defect. Missing geometry is never treated as proof of non-overlap.',reviewed_parent_ids:CASES.map(c=>c[0]),reviewed_source_part_ids:CASES.flatMap(c=>c[2]),held_parent_ids:held,retained_records:retained,suppressed_assets:suppressed,required_assets:required,dispositions,unresolved_relevant_items:[],read_failures:[],source_files:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path))};
}
function write(){const result=build(),out=path.join(ROOT,'reports/ib-a5-additional-geometry-review.json');fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');return {output:out,sha256:sha(fs.readFileSync(out)),parents:result.reviewed_parent_ids.length,parts:result.reviewed_source_part_ids.length,held:result.held_parent_ids,retained_records:result.retained_records.length,suppressed:result.suppressed_assets.length,source_files:result.source_files.length};}
module.exports={build,write};if(require.main===module)console.log(JSON.stringify(write(),null,2));
