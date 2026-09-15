"use strict";

// Read-only source audit. Written candidate references are precautionary
// reservations, not a semantic assertion that an examination task is in a test.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');
const { parseCsv, buildIbExclusions } = require('./physics-test-exclusions');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const parentKey = row => `${row.preview}\0${row.question}`;
const parentId = row => `${row.year.slice(-2)}${row.session[0].toUpperCase()}.P${row.paper}.${row.level}.${row.time_zone || 'TZ0'}.Q${row.question}`;
function references(text) {
  const found = [];
  const re = /\b(20\d\d)\s+(May|Nov(?:ember)?)(?:\s+(TZ[0123]))?\s+P(1A|1B|[123])\s+(HL|SL)\s+Q([A-Z]?\d+)\b/gi;
  for (const m of String(text || '').matchAll(re)) found.push({kind:'sitting',text:m[0],offset:m.index,year:m[1],session:/^May$/i.test(m[2])?'May':'Nov',time_zone:(m[3] || '').toUpperCase(),paper:m[4].toUpperCase(),level:m[5].toUpperCase(),question:m[6].toUpperCase()});
  for (const m of String(text || '').matchAll(/\bibchem_(?:part|xlvl)_[a-f0-9]+\b/g)) found.push({kind:'identifier',text:m[0],offset:m.index});
  return found;
}
function resolveReference(ref, corpus) {
  if (ref.kind === 'identifier') return corpus.filter(r => r.part_id === ref.text || r.cross_level_group_id === ref.text);
  return corpus.filter(r => r.year === ref.year && r.session.slice(0,3).toLowerCase() === ref.session.toLowerCase() && r.paper === ref.paper && r.level === ref.level && r.question === ref.question && (!ref.time_zone || (r.time_zone || 'TZ0') === ref.time_zone));
}
function closeParts(corpus, seeds) {
  const byId = new Map(corpus.map(r => [r.part_id,r])), parents = new Map(), groups = new Map(), duplicates = new Map();
  function add(map,key,id) { if (!key) return; if (!map.has(key)) map.set(key,[]); map.get(key).push(id); }
  for (const r of corpus) { add(parents,parentKey(r),r.part_id); add(groups,r.cross_level_group_id,r.part_id); if (r.duplicate_of) {add(duplicates,r.duplicate_of,r.part_id); add(duplicates,r.part_id,r.duplicate_of);} }
  const closure = new Set(seeds), queue = [...seeds], origins = new Map([...seeds].map(id => [id,{reason:'text_reference_seed',from:id}]));
  for (let i=0;i<queue.length;i++) {
    const r=byId.get(queue[i]); if (!r) throw new Error('Unknown seed: '+queue[i]);
    for (const [reason, ids] of [['whole_question',parents.get(parentKey(r))],['declared_cross_level_group',groups.get(r.cross_level_group_id)],['declared_duplicate',duplicates.get(r.part_id)]]) for (const id of ids || []) if (byId.has(id) && !closure.has(id)) { closure.add(id); queue.push(id); origins.set(id,{reason,from:r.part_id}); }
  }
  const pages = new Set();
  for (const id of closure) { const r=byId.get(id); for (const part of String(r.page_render_paths || '').split(';')) {const file=path.basename(part);if (/^question_.*\.png$/i.test(file)) pages.add(`${r.preview}/${file}`);} }
  return {closure,origins,pages};
}
function audit(options={}) {
  const paperdbRoot = options.paperdbRoot || 'C:/CodexProjects/PaperDatabases';
  const repo = path.resolve(__dirname,'..');
  const packet = path.join(paperdbRoot,'Physics Categorisation/returns/PACKET_006D');
  const sourceFiles = new Map();
  function read(file) {const data=fs.readFileSync(file);sourceFiles.set(path.resolve(file),{path:path.resolve(file),sha256:sha(data)});return data.toString('utf8');}
  const corpusPath=path.join(paperdbRoot,'outputs/exports/ib_physics_archive_flat_v5.csv');
  const corpus = parseCsv(read(corpusPath),['part_id','preview','question','cross_level_group_id','duplicate_of','year','session','paper','level','time_zone','page_render_paths','question_text','shared_stem']);
  if (new Set(corpus.map(r=>r.part_id)).size !== corpus.length) throw new Error('Ambiguous corpus IDs');
  const ledger = parseCsv(read(path.join(packet,'source_results_v4.csv')));
  const byIndex = new Map(ledger.map(r=>[r.source_index,r]));
  const bySource = new Map(ledger.map(r=>[r.source_part_id,r]));
  if (byIndex.size !== ledger.length || bySource.size !== ledger.length) throw new Error('Ambiguous test source identity');
  const evidence = [], unresolved = [], scanned = [];
  function scanText(file,rowNumber,field,text,owner) {
    if (!text || owner.source_kind !== 'test') return;
    const refs=references(text);
    // A residual complete-looking date cannot silently acquire an inferred ID.
    let residual=text;
    for (const ref of [...refs].sort((a,b)=>b.offset-a.offset)) residual=residual.slice(0,ref.offset)+'<REFERENCE>'+residual.slice(ref.offset+ref.text.length);
    if (/\b20\d\d\s+(?:May|Nov)|\b(?:May|November|Nov)\s+20\d\d|\b\d\d[MN]\.P|\b[MN]\d\d\//.test(residual)) unresolved.push({file,row_number:rowNumber,field,source_index:owner.source_index,source_part_id:owner.source_part_id,reason:'Unparsed date or sitting notation',text});
    for (const ref of refs) {
      const rows=resolveReference(ref,corpus);
      const item={file,row_number:rowNumber,field,source_index:owner.source_index,source_part_id:owner.source_part_id,source_file:owner.source_file,source_page:owner.source_page,source_q_label:owner.source_q_label,proposed_verdict:owner.proposed_verdict || '',reference:ref,quote:text,resolved_source_ids:rows.map(r=>r.part_id).sort(),resolved_parent_ids:[...new Set(rows.map(parentId))].sort(),timezone_policy:ref.kind==='sitting'&&!ref.time_zone?'All archive time zones for this complete sitting/question tuple':'Exact supplied identity',disposition:'precautionary_pending_review'};
      if (!rows.length) unresolved.push({...item,reason:'Explicit reference has no current archive counterpart'});
      else evidence.push(item);
    }
  }
  const csvSpecs = [
    ['source_results_v4.csv',['notes']],['final_results.csv',['notes']],
    ['stage3_proposals.csv',['proposed_match_part_id','proposed_match_sitting','proposed_group_id','derived_from','review_note']],
    ['stage3_weak_proposals.csv',['proposed_match_part_id','proposed_match_sitting','proposed_group_id','derived_from','review_note']],
    ['stage3_strong_proposals.csv',['proposed_match_part_id','proposed_match_sitting','proposed_group_id','derived_from','review_note']],
    ['stage3_crop_proposals.csv',['proposed_match_part_id','proposed_match_sitting','proposed_group_id','derived_from','review_note']],
    ['stage3_weak_qa_patch_inventory.csv',['before_target_or_parent','after_target_or_parent','reason']]
  ];
  for (const [name,fields] of csvSpecs) {
    const file=path.join(packet,name),rows=parseCsv(read(file)); let count=0;
    rows.forEach((r,i)=>{const owner=byIndex.get(r.source_index);if (!owner) throw new Error(`${name}: unbound source index ${r.source_index}`);if (r.source_part_id && owner.source_part_id!==r.source_part_id) throw new Error(`${name}: source ID/index disagreement ${r.source_index}`);if(owner.source_kind!=='test')return; count++;for(const field of fields)scanText(file,i+2,field,r[field],owner);});
    scanned.push({file,rows:rows.length,test_rows:count,fields});
  }
  // Only individually attributable markdown rows are parsed. Narrative lists of
  // source ordinals are not treated as a guessed source-to-candidate crosswalk.
  for (const name of ['stage3_weak_qa.md','stage3_strong_qa.md','stage3_crop_qa.md']) {
    const file=path.join(packet,name),lines=read(file).split(/\r?\n/);let count=0;
    lines.forEach((line,i)=>{let ids=[];const weak=line.match(/^-\s+`([\d,]+)`\s*→/);const crop=name==='stage3_crop_qa.md'&&line.match(/^\|\s*\d+\s*\|\s*(\d+)\s*\|/);if(weak)ids=weak[1].split(',');if(crop)ids=[crop[1]];for(const id of ids){const owner=byIndex.get(id);if (!owner)throw new Error('Unbound markdown source index '+id);if(owner.source_kind!=='test')continue;count++;scanText(file,i+1,'attributed_qa_line',line,owner);}});
    scanned.push({file,lines:lines.length,attributed_test_rows:count});
  }
  // Two individually attributed QA notes name a bounded family but omit the
  // complete sitting. Preserve the exact text-matching possibilities as holds;
  // this is not a claim of unique lineage or semantic clearance.
  const boundedReferences = [
    {source_index:'318',quote_contains:'f = k/h²',ids:['ibchem_part_2333bad78edc6987','ibchem_part_f407caa38ba8a148'],description:'2012 May graph task; exact f = k/h^2 statement in both TZ2 levels',check:r=>r.year==='2012'&&r.session==='May'&&r.question_text.includes('f = k/h^2')},
    {source_index:'1340',quote_contains:'Define power',ids:['ibchem_part_41f868b9bd326a49','ibchem_part_00237463e81cd1ac','ibchem_part_7074976ee479aefd','ibchem_part_78105b19e0acd12c'],description:'Every 2006/2008 exact Define power task named by the QA note',check:r=>['2006','2008'].includes(r.year)&&r.question_text==='(a) Define power. [answer space] [1]'}
  ];
  const boundedReferenceDispositions=[];
  for(const item of boundedReferences) {
    const index=unresolved.findIndex(r=>r.source_index===item.source_index&&r.text?.includes(item.quote_contains));
    if(index<0)throw new Error('Bounded QA witness changed: '+item.source_index);
    const note=unresolved.splice(index,1)[0], owner=byIndex.get(item.source_index),rows=item.ids.map(id=>corpus.find(r=>r.part_id===id));
    if(rows.some(r=>!r||!item.check(r)))throw new Error('Bounded QA archive witness changed: '+item.source_index);
    const ref={kind:'reviewed_bounded_reference',text:item.description};
    const record={file:note.file,row_number:note.row_number,field:note.field,source_index:owner.source_index,source_part_id:owner.source_part_id,source_file:owner.source_file,source_page:owner.source_page,source_q_label:owner.source_q_label,proposed_verdict:owner.proposed_verdict||'',reference:ref,quote:note.text,resolved_source_ids:item.ids.slice().sort(),resolved_parent_ids:[...new Set(rows.map(parentId))].sort(),disposition:'precautionary_bounded_candidates_held',archive_text_witnesses:rows.map(r=>({source_part_id:r.part_id,question_text:r.question_text,shared_stem:r.shared_stem}))};
    evidence.push(record);boundedReferenceDispositions.push(record);
  }
  const semanticReviewPath=path.join(repo,'reports/ib-a1-skydiver-note-review.json');
  const semanticReview=JSON.parse(read(semanticReviewPath));
  if(!semanticReview.blocked_source_ids?.includes('ibchem_part_df4014d007195024'))throw new Error('Skydiver review no longer preserves its hold');
  for(const f of semanticReview.source_files||[]) {const bytes=read(f.path);if(sha(Buffer.from(bytes,'utf8'))!==f.sha256&&sha(fs.readFileSync(f.path))!==f.sha256)throw new Error('Skydiver review source changed: '+f.path);}
  const defaultExtras=['dist/physics-audit/current-ib-tests.json','reports/ib-a5-reviewed-test-exclusions.json','reports/ib-a1-c1-reviewed-test-exclusions.json'].map(x=>path.join(repo,x));
  const extraPaths=options.extraExclusionsPaths || defaultExtras;
  for(const file of extraPaths)read(file);
  read(path.join(packet,'matches.csv'));read(__filename);read(require.resolve('./physics-test-exclusions'));
  const baseline=buildIbExclusions({paperdbRoot,questions:[],extraExclusionsPaths:extraPaths});
  const seeds=new Set(evidence.flatMap(r=>r.resolved_source_ids));
  const expanded=closeParts(corpus,seeds);
  const added=[...expanded.closure].filter(id=>!baseline.blockedSourceIds.has(id)).sort();
  // This is an immutable review boundary, deliberately independent of latest.
  // Rebuilding after removal must not erase the evidence of the original impact.
  const baselineRoot=options.baselineRoot||path.join(repo,'dist/ibphysics-release/18a6bc2d3b649210-1789252118734');
  const latest={...JSON.parse(read(path.join(baselineRoot,'build-info.json'))),root:baselineRoot},publicPath=path.join(latest.root,'data/physics_catalogue.js'),ctx={window:{}};
  if(latest.build_id!=='18a6bc2d3b649210')throw new Error('The reviewed 321-part baseline changed');
  vm.runInNewContext(read(publicPath),ctx,{timeout:3000});
  const questions=ctx.window.PHYSICS_QUESTIONS;
  if(!Array.isArray(questions))throw new Error('Public catalogue is missing');
  const corpusById=new Map(corpus.map(r=>[r.part_id,r]));
  function publicItem(q) {const r=corpusById.get(q.source_part_id);if(!r)throw new Error('Public source is absent from archive: '+q.source_part_id);return {source_part_id:q.source_part_id,id:q.id,parent_id:parentId(r),topics:q.topic_codes,closure_origin:expanded.origins.get(q.source_part_id)||null};}
  const directPublic=questions.filter(q=>seeds.has(q.source_part_id)).map(publicItem);
  const closurePublic=questions.filter(q=>expanded.closure.has(q.source_part_id)).map(publicItem);
  const pagePublic=[];
  for(const q of questions) {const r=corpusById.get(q.source_part_id);if(!r)throw new Error('Unknown public source');const pages=String(r.page_render_paths||'').split(';').map(x=>`${r.preview}/${path.basename(x)}`).filter(x=>expanded.pages.has(x));if(pages.length)pagePublic.push({...publicItem(q),question_page_keys:pages,already_source_held:expanded.closure.has(q.source_part_id),disposition:'Shared page requires bounded-crop overlap check; this alone is not an inferred test match'});}
  const topicCounts={};for(const q of closurePublic)for(const topic of q.topics||[])topicCounts[topic]=(topicCounts[topic]||0)+1;
  for(const item of evidence) {item.resolved_ids_outside_existing_closure=item.resolved_source_ids.filter(id=>!baseline.blockedSourceIds.has(id));}
  const compactEvidence=new Map();
  for(const e of evidence){const identity=JSON.stringify({source_part_id:e.source_part_id,reference:e.reference.text,kind:e.reference.kind,ids:e.resolved_source_ids});if(!compactEvidence.has(identity))compactEvidence.set(identity,{...e,reference_id:sha(identity).slice(0,20),occurrences:[],quote_variants:[]});const item=compactEvidence.get(identity);item.occurrences.push({file:e.file,row_number:e.row_number,field:e.field});if(!item.quote_variants.includes(e.quote))item.quote_variants.push(e.quote);}
  const referenceEvidence=[...compactEvidence.values()];
  const referencesBySeed=new Map();for(const e of referenceEvidence)for(const id of e.resolved_source_ids){if(!referencesBySeed.has(id))referencesBySeed.set(id,new Set());referencesBySeed.get(id).add(e.reference_id);}
  function lineage(id){const chain=[];let current=id;const seen=new Set();while(!seen.has(current)&&expanded.origins.has(current)){seen.add(current);const origin=expanded.origins.get(current);chain.push({source_part_id:current,...origin});if(origin.from===current)break;current=origin.from;}return {chain,reference_ids:[...(referencesBySeed.get(current)||[])]};}
  const nativeBox={window:{}};const nativePath=path.join(paperdbRoot,'Physics Categorisation/viewer/ibphysics_catalogue.js');vm.runInNewContext(read(nativePath),nativeBox,{timeout:3000});
  const nativeById=new Map(nativeBox.window.IBPHYS_QUESTIONS.map(q=>[q.id,q]));
  const pageNo=f=>(/_p(\d+)(?:_|\.)/.exec(f)||[])[1];
  const blockedPageNumbers=new Set([...expanded.pages].map(key=>key.split('/')[0]+'/'+pageNo(key)));
  const reviewedPublicRemovals=[];
  for(const q of questions){const native=nativeById.get(q.parent_id);if(!native)throw new Error('Missing native baseline parent '+q.parent_id);const base=publicItem(q);const pageKeys=[...new Set([...(native.pages||[]),...(native.crops||[]),...(native.parts||[]).flatMap(p=>p.crops||[])].map(f=>native.preview+'/'+pageNo(f)).filter(k=>blockedPageNumbers.has(k)))];const held=expanded.closure.has(q.source_part_id);if(!held&&!pageKeys.length)continue;const relatedPageIds=corpus.filter(r=>expanded.closure.has(r.part_id)&&String(r.page_render_paths||'').split(';').some(f=>/^question_/.test(path.basename(f))&&pageKeys.includes(r.preview+'/'+pageNo(f)))).map(r=>r.part_id);const refIds=[...new Set((held?[q.source_part_id]:relatedPageIds).flatMap(id=>lineage(id).reference_ids))].sort();if(!refIds.length)throw new Error('Removal lacks source-reference lineage: '+q.id);reviewedPublicRemovals.push({...base,topic_codes:q.topic_codes,reason:held?(seeds.has(q.source_part_id)?'text_review_reference':expanded.origins.get(q.source_part_id).reason):'shares_question_page_with_text_review_reserved_content',reference_ids:refIds,source_lineage:held?lineage(q.source_part_id).chain:[],question_page_keys:pageKeys,page_related_reserved_source_ids:relatedPageIds.sort(),baseline_build_id:latest.build_id,baseline_catalogue_sha256:sourceFiles.get(path.resolve(publicPath)).sha256});}
  const removalTopics={};for(const q of reviewedPublicRemovals)for(const topic of q.topic_codes)removalTopics[topic]=(removalTopics[topic]||0)+1;
  return {schema_version:1,created_utc:new Date().toISOString(),course:'ib',scope:'All attributable PACKET_006D test-review references, with complete archive parent/twin/duplicate closure; fixed 321-part public A1/A5/C1 baseline impact',review_complete:unresolved.length===0,unresolved_relevant_items:unresolved,complete_test_exclusion_certified:false,corpus_sha256:sourceFiles.get(path.resolve(corpusPath)).sha256,source_files:[...sourceFiles.values()],read_failures:[],blocked_source_ids:[...seeds].sort(),reference_evidence:referenceEvidence,reviewed_nonmatches:[],bounded_reference_dispositions:boundedReferenceDispositions,semantic_review_files:[semanticReviewPath],unresolved_references:unresolved,scanned_sources:scanned,reviewed_public_removals:reviewedPublicRemovals,counts:{test_rows:ledger.filter(r=>r.source_kind==='test').length,reference_occurrences:evidence.length,unique_references:referenceEvidence.length,unique_test_sources_with_references:new Set(evidence.map(r=>r.source_part_id)).size,reference_seed_parts:seeds.size,already_reserved_seed_parts:[...seeds].filter(id=>baseline.blockedSourceIds.has(id)).length,baseline_reserved_parts:baseline.blockedSourceIds.size,reference_parent_twin_closure:expanded.closure.size,newly_reserved_parts:added.length,current_public_parts:questions.length,direct_public_parts:directPublic.length,closure_public_parts:closurePublic.length,closure_public_topics:topicCounts,page_overlap_public_parts:pagePublic.length,reviewed_public_removals:reviewedPublicRemovals.length,reviewed_public_removal_topics:removalTopics},newly_reserved_source_ids:added,current_public_impact:{build_id:latest.build_id,root:latest.root,catalogue_sha256:sourceFiles.get(path.resolve(publicPath)).sha256,direct:directPublic,parent_twin_closure:closurePublic,question_page_overlap:pagePublic},policy:['Every resolved textual candidate remains a precautionary hold unless a separate source-bound review positively establishes a different task. Existing structured-ID holds are never cleared by this report.','Complete sitting references reserve every part of the exactly identified archive parent. An omitted time zone conservatively resolves all matching zones.','The reviewed public removal list also applies the exact native whole-parent page gate used by ibInput, including sibling/context crop pages. This is conservative publication scope, not an automatic equivalence assertion.','No absence-of-match semantic clearance is inferred from this mechanical audit. Incomplete references are resolved only against their explicit bounded wording/date witnesses, with all resulting candidates held.','The public baseline is permanently fixed to build18a6bc2d3b649210. A later catalogue that already omits these parts cannot erase this review boundary.','Private assessment paths, review text and all evidence in this report must remain outside the public release.']};
}
if(require.main===module) {
  const result=audit();const output=process.argv.indexOf('--output');
  if(output>=0){if(!process.argv[output+1])throw new Error('Missing --output path');fs.writeFileSync(process.argv[output+1],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({counts:result.counts,current_public_impact:result.current_public_impact,unresolved:result.unresolved_references.length}));}
  else console.log(JSON.stringify(result));
}
module.exports={audit,references,resolveReference,closeParts};
