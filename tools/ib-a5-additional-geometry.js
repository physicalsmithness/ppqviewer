"use strict";
// An exception is an exact visual review of one existing crop, never a repair
// to source geometry or a declaration that unknown rectangles cannot overlap.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const DB=path.resolve(process.env.PHYSICS_PAPERDB_ROOT||'C:/CodexProjects/PaperDatabases');
const reportPath=path.join(ROOT,'reports/ib-a5-additional-geometry-review.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const validRegion=r=>!!r&&Number.isInteger(r.page_number)&&r.page_number>0&&Array.isArray(r.bbox)&&r.bbox.length===4&&r.bbox.every(Number.isFinite)&&r.bbox[2]>r.bbox[0]&&r.bbox[3]>r.bbox[1];
function missingQuestions(values){
  ensure(Array.isArray(values)&&values.length,'Missing reserved-question identities are required');
  const result=values.map(value=>String(value));
  ensure(result.every(value=>/^[A-Z]?\d+$/.test(value))&&new Set(result).size===result.length,'Reserved-question identities are invalid or repeated');
  return result.sort();
}
function tuple(r){return JSON.stringify([r.source_part_id,r.parent_id,r.role,path.resolve(r.path),r.sha256,missingQuestions(r.missing_reserved_questions)]);}
function loadA5AdditionalGeometry(){
  const witnesses=new Map();
  function read(file,expected){const full=path.resolve(file),bytes=fs.readFileSync(full),digest=sha(bytes);ensure(!expected||digest===expected,'A5 geometry review source changed: '+full);witnesses.set(full,{path:full,sha256:digest});return bytes;}
  const report=JSON.parse(read(reportPath).toString('utf8'));
  ensure(report.schema_version===1&&report.review_complete===true&&Array.isArray(report.unresolved_relevant_items)&&!report.unresolved_relevant_items.length&&Array.isArray(report.read_failures)&&!report.read_failures.length,'A5 additional geometry review is incomplete');
  ensure(Array.isArray(report.source_files)&&report.source_files.length&&Array.isArray(report.held_parent_ids)&&Array.isArray(report.retained_records)&&Array.isArray(report.reviewed_parent_ids)&&report.reviewed_parent_ids.length,'A5 geometry review scope is missing');
  const supplied=new Map();
  for(const f of report.source_files){ensure(path.isAbsolute(f.path||'')&&/^[a-f0-9]{64}$/.test(f.sha256||''),'A5 geometry source fingerprint is invalid');const full=path.resolve(f.path);ensure(!supplied.has(full),'Repeated A5 geometry source witness');supplied.set(full,f.sha256);read(full,f.sha256);}
  function required(file){const full=path.resolve(file);ensure(supplied.has(full),'A5 geometry review lacks source witness: '+full);return read(full,supplied.get(full));}
  const nativePath=path.join(DB,'Physics Categorisation/viewer/ibphysics_catalogue.js');
  const corpusPath=path.join(DB,'outputs/exports/ib_physics_archive_flat_v5.csv');
  required(corpusPath);
  const box={window:{}};vm.runInNewContext(required(nativePath).toString('utf8'),box,{timeout:20000});
  ensure(Array.isArray(box.window.IBPHYS_QUESTIONS),'Native A5 catalogue is missing');
  const parents=new Map(box.window.IBPHYS_QUESTIONS.map(q=>[q.id,q]));
  const reviewedParents=new Set(report.reviewed_parent_ids),heldParentIds=new Set(report.held_parent_ids);
  ensure(reviewedParents.size===report.reviewed_parent_ids.length&&heldParentIds.size===report.held_parent_ids.length,'Repeated A5 geometry parent identity');
  ensure([...reviewedParents].every(id=>parents.has(id))&&[...heldParentIds].every(id=>reviewedParents.has(id)),'A5 geometry review parent is outside its exact reviewed scope');
  const records=new Map(),metadata=new Map();
  for(const r of report.retained_records){
    ensure(r.review_complete===true&&r.reserved_content_found===false&&['question','context','markscheme'].includes(r.role),'A5 geometry record is not positively reviewed');
    ensure(typeof r.source_part_id==='string'&&typeof r.parent_id==='string'&&path.isAbsolute(r.path||'')&&/^[a-f0-9]{64}$/.test(r.sha256||''),'A5 geometry record identity is incomplete');
    const parent=parents.get(r.parent_id),part=parent?.parts.find(p=>p.source_part_id===r.source_part_id);
    ensure(parent&&part&&reviewedParents.has(parent.id)&&!heldParentIds.has(parent.id),'A5 geometry record has an unreviewed or held native parent/part');
    const full=path.resolve(r.path),cropRoot=path.join(DB,'outputs/previews',parent.preview,'crops');
    ensure(full===path.join(cropRoot,path.basename(full)),'A5 geometry record is outside its original crop folder');
    const allowed=r.role==='context'?parent.crops:r.role==='markscheme'?part.ms_crops:part.crops;
    ensure((allowed||[]).some(f=>path.basename(f)===path.basename(full)),'A5 geometry crop does not belong to its exact native role');
    ensure(supplied.get(full)===r.sha256,'A5 geometry record and asset witness disagree');required(full);
    const kind=r.role==='markscheme'?'mark_scheme':'question',metaPath=path.join(DB,'outputs/previews',parent.preview,kind+'_preview.json');
    if(!metadata.has(metaPath))metadata.set(metaPath,JSON.parse(required(metaPath).toString('utf8')));
    const meta=metadata.get(metaPath),entries=r.role==='markscheme'?meta.entries:meta.question_groups.flatMap(g=>[{...g,owner_question:g.question_number},...g.parts.map(p=>({...p,owner_question:g.question_number}))]);
    const matches=entries.filter(e=>(e.crop_image_paths||[]).some(f=>path.basename(f)===path.basename(full)));
    ensure(matches.length===1,'A5 geometry crop attribution is absent or ambiguous');
    const own=matches[0],owner=r.role==='markscheme'?own.question_number:own.owner_question;
    ensure(String(owner)===String(parent.question),'A5 geometry crop belongs to a different printed question');
    ensure(own.crop_regions?.length&&own.crop_regions.every(validRegion),'A5 geometry exception cannot rescue an invalid own crop rectangle');
    const key=tuple(r);ensure(!records.has(key),'Repeated A5 geometry exception');records.set(key,r);
  }
  const suppressed=report.suppressed_assets||[],requiredAssets=report.required_assets||[];
  ensure(Array.isArray(suppressed)&&Array.isArray(requiredAssets),'A5 reviewed asset projection is malformed');
  const assetKey=r=>JSON.stringify([r.source_part_id,r.parent_id,r.role,path.resolve(r.path)]);
  const seenSuppressed=new Set();
  for(const r of suppressed){
    ensure(r.role==='markscheme'&&r.remaining_answer_complete===true&&typeof r.reason==='string'&&r.reason.trim(),'Only a reviewed redundant markscheme image may be suppressed');
    const parent=parents.get(r.parent_id),part=parent?.parts.find(p=>p.source_part_id===r.source_part_id),full=path.resolve(r.path);
    ensure(parent&&part&&reviewedParents.has(parent.id)&&!heldParentIds.has(parent.id),'Suppressed A5 asset has an unreviewed parent/part');
    ensure(full===path.join(DB,'outputs/previews',parent.preview,'crops',path.basename(full))&&(part.ms_crops||[]).some(f=>path.basename(f)===path.basename(full)),'Suppressed A5 asset is not its exact native markscheme crop');
    ensure(supplied.get(full)===r.sha256,'Suppressed A5 asset lacks its exact source fingerprint');required(full);
    const key=assetKey(r);ensure(!seenSuppressed.has(key),'Repeated suppressed A5 asset');seenSuppressed.add(key);
    ensure(!report.retained_records.some(x=>assetKey(x)===key),'An A5 image cannot be both retained and suppressed');
    ensure(requiredAssets.some(x=>x.source_part_id===r.source_part_id&&x.parent_id===r.parent_id&&x.role==='markscheme'),'A suppressed A5 answer image requires a reviewed complete remaining answer');
  }
  for(const r of requiredAssets){
    ensure(r.role==='markscheme'&&suppressed.some(x=>x.source_part_id===r.source_part_id&&x.parent_id===r.parent_id),'Required A5 answer asset has no matching reviewed suppression');
    ensure(report.retained_records.some(x=>assetKey(x)===assetKey(r)&&x.sha256===r.sha256),'Required remaining A5 answer is not exactly visually retained');
  }
  read(__filename);
  return {report,path:reportPath,heldParentIds,fingerprints:[...witnesses.values()],requireException(record){
    ensure(!heldParentIds.has(record.parent_id),'A5 geometry parent is held');
    const found=records.get(tuple(record));ensure(found,'Missing exact A5 visual exception for unlocated reserved content: '+record.path);return found;
  },projectQuestion(question){
    const omissions=suppressed.filter(r=>r.source_part_id===question.source_part_id&&r.parent_id===question.parent_id);
    if(!omissions.length)return question;
    const before=question.markscheme_images||[];
    ensure(omissions.every(r=>before.some(file=>path.resolve(file)===path.resolve(r.path))),'Reviewed A5 omitted image no longer matches the current source assignment');
    const after=before.filter(file=>!omissions.some(r=>path.resolve(r.path)===path.resolve(file)));
    ensure(after.length&&requiredAssets.filter(r=>r.source_part_id===question.source_part_id&&r.parent_id===question.parent_id).every(r=>after.some(file=>path.resolve(file)===path.resolve(r.path))),'A5 complete remaining answer disappeared');
    return {...question,markscheme_images:after};
  }};
}
module.exports={loadA5AdditionalGeometry,validRegion,reportPath};
