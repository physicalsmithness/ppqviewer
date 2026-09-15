"use strict";
// Private E1/E2 source projection. Eligibility and the original producer
// attributions remain separate; only exact direct type IDs become counted tags.
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const {parseCsv}=require("./physics-test-exclusions");
const {identities}=require("./build_ib_d2_recovery");
const ROOT=path.resolve(__dirname,".."), DB=path.resolve(process.env.PHYSICS_PAPERDB_ROOT||"C:/CodexProjects/PaperDatabases");
const CAT=path.join(DB,"Physics Categorisation");
const SNAPSHOT=path.join(CAT,"returns/E1_E2_REVIEW_2026-09-13/checkpoint_004");
const SNAPSHOT_SHA="a8fc936a6c8998a4912020ec73da9068b8632d52fa96ea83543861877cea6739";
const pinPath=path.join(ROOT,"reports/ib-e1-e2-eligibility-pin.json");
const topics=["E.1","E.2"],sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const unique=a=>[...new Set(a.filter(Boolean))];
const inside=(root,file)=>{const rel=path.relative(root,file);return rel&&!rel.startsWith("..")&&!path.isAbsolute(rel);};
function orderPartsByOriginal(rows,question){
  ensure(Array.isArray(question?.parts),"Original question has no part sequence");
  const seen=new Set();
  const ordered=rows.map(row=>{
    ensure(String(question.question_number)===String(row.question),"Archive part belongs to another original question");
    ensure(!seen.has(row.part_label),"Repeated archive label cannot determine original part order");seen.add(row.part_label);
    const positions=question.parts.flatMap((part,index)=>part.part_label===row.part_label?[index]:[]);
    ensure(positions.length===1,"Archive label has no unique original part position: "+row.part_label);
    return {row,index:positions[0]};
  });
  return ordered.sort((a,b)=>a.index-b.index).map(item=>item.row);
}
function build(options={}){
  const files=new Map(),cache=new Map();
  function read(file,expected){
    file=path.resolve(file);const bytes=fs.readFileSync(file),hash=sha(bytes);
    ensure(!expected||hash===expected,"E1/E2 source fingerprint changed: "+file);
    ensure(!files.has(file)||files.get(file).sha256===hash,"E1/E2 source changed during projection: "+file);
    files.set(file,{path:file,sha256:hash});return bytes;
  }
  const json=file=>JSON.parse(read(file).toString("utf8").replace(/^\uFEFF/,""));
  const csv=file=>parseCsv(read(file).toString("utf8"));
  const manifest=JSON.parse(read(path.join(SNAPSHOT,"snapshot_manifest.json"),SNAPSHOT_SHA));
  ensure(Array.isArray(manifest)&&manifest.length===96,"Unexpected E1/E2 snapshot inventory");
  for(const entry of manifest){
    const file=path.resolve(SNAPSHOT,entry.relative_path);
    ensure(inside(SNAPSHOT,file),"E1/E2 snapshot path escapes source root");read(file,entry.sha256);
  }
  const pin=json(options.pinPath||pinPath);
  ensure(pin.schema_version===1&&pin.eligibility?.path&&pin.eligibility.sha256,"Missing pinned E1/E2 eligibility overlay");
  const eligibility=JSON.parse(read(pin.eligibility.path,pin.eligibility.sha256));
  for(const item of pin.source_files||[])read(item.path,item.sha256);
  ensure(eligibility.schema_version===1&&eligibility.review_complete===true&&eligibility.parts&&
    topics.every(topic=>eligibility.topics.includes(topic)),"Incomplete normalized E1/E2 eligibility");
  ensure(path.resolve(eligibility.source_snapshot.path)===SNAPSHOT&&eligibility.source_snapshot.manifest_sha256===SNAPSHOT_SHA,
    "Eligibility does not bind the accepted E1/E2 snapshot");
  ensure(eligibility.source_files?.length,"Eligibility has no source witnesses");
  eligibility.source_files.forEach(file=>read(file.path,file.sha256));
  const scopeNotes=json(path.join(ROOT,"reports/ib-e1-e2-public-scope-notes.json"));
  ensure(scopeNotes.schema_version===1&&scopeNotes.review_complete===true&&scopeNotes.source_files?.length&&scopeNotes.notes,
    "E1/E2 public scope wording has not been reviewed");
  scopeNotes.source_files.forEach(file=>read(file.path,file.sha256));
  for(const [id,notes]of Object.entries(scopeNotes.notes))for(const [topic,note]of Object.entries(notes))
    ensure(eligibility.parts[id]?.topics?.[topic]?.status==="current_mixed_component"&&typeof note==="string"&&note.trim(),
      "Public scope wording does not match a mixed-component source decision");
  const rows=csv(path.join(DB,"outputs/exports/ib_physics_archive_flat_v5.csv"));
  const corpus=new Map(rows.map(row=>[row.part_id,row]));
  ensure(rows.length===18308&&corpus.size===rows.length,"E1/E2 archive identity changed");
  const assignments=csv(path.join(SNAPSHOT,"part_type_assignments.csv"));
  const scope=csv(path.join(SNAPSHOT,"candidate_scope_outcomes.csv"));
  const demands=csv(path.join(SNAPSHOT,"reconciled_individual_demands.csv"));
  ensure(assignments.length===1278&&scope.length===1238&&demands.length===1581,"Accepted E1/E2 record totals changed");
  const assigned=new Map(),definitions=new Map(),groupMap=new Map();
  const add=(map,key,value)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(value);};
  for(const row of assignments)add(assigned,row.part_id,row);
  function type(row){
    let value;
    if(row.Unit){
      const group="E1_E2_SUPPLIED_PACK_MAP_2026-09-12:family:"+row.Unit+":"+row["Main question type"];
      value={code:row.type_id,topic:row.Unit,display_code:row.Code,label:row["Main question type"]+" — "+row.Subtype,
        summary:row["Core method / decision rule"],checks:[row["Common trap"]].filter(Boolean),
        group_code:group,group_label:row["Main question type"],source_status:row.Status};
    }else{
      const fields=JSON.parse(row.source_original_fields_json||"{}");
      const family=fields.freer_family||row.title;
      const group="E1_E2_REVIEW_2026-09-13:family:"+row.subtopic+":"+family;
      value={code:row.type_id,topic:row.subtopic,display_code:row.source_code||row.locator,label:row.title,
        summary:row.solving_route,checks:[fields.recognition_trigger].filter(Boolean),
        group_code:group,group_label:family,source_status:row.status};
    }
    ensure(value.code&&topics.includes(value.topic)&&value.label,"Invalid E1/E2 authored type definition");
    const old=definitions.get(value.code);
    ensure(!old||JSON.stringify(old)===JSON.stringify(value),"Colliding versioned E1/E2 type definition");
    definitions.set(value.code,value);
    if(!groupMap.has(value.group_code))groupMap.set(value.group_code,{code:value.group_code,topic:value.topic,label:value.group_label});
  }
  csv(path.join(SNAPSHOT,"inputs/baseline_versioned_types.csv")).forEach(type);
  csv(path.join(SNAPSHOT,"inputs/retained_type_versions.csv")).forEach(type);
  const liveType=definition=>/^(Current\b|live$)/i.test(definition.source_status);
  const parts={},withheld=[],selected=[];
  for(const [sid,record]of Object.entries(eligibility.parts)){
    ensure(/^ibchem_part_[a-f0-9]+$/.test(sid)&&corpus.has(sid),"Unknown E1/E2 eligibility source ID");
    const row=corpus.get(sid),members=[];
    for(const topic of topics){
      const decision=record.topics?.[topic];if(!decision)continue;
      ensure(typeof decision.eligible==="boolean"&&decision.status&&decision.reason&&Array.isArray(decision.direct_type_ids),
        "Incomplete per-topic eligibility: "+sid+" "+topic);
      if(!decision.eligible)continue;
      ensure(["current_direct","current_mixed_component"].includes(decision.status)&&decision.evidence?.length,
        "Eligible E1/E2 part lacks an explicit assessed-scope decision");
      ensure(["HL","HLSL"].includes(decision.current_level),"Eligible E1/E2 part lacks a current-level decision");
      const codes=unique(decision.direct_type_ids);
      ensure(codes.length===decision.direct_type_ids.length,"Repeated E1/E2 direct type ID");
      for(const code of codes){
        const definition=definitions.get(code);
        ensure(definition&&definition.topic===topic&&liveType(definition),"Invalid or historical E1/E2 direct type: "+code);
        const witnesses=(assigned.get(sid)||[]).filter(a=>a.type_id===code);
        ensure(witnesses.length&&witnesses.some(a=>["assessed","assessed_operation"].includes(a.role)),
          "E1/E2 counted type has no reviewed assessed attribution");
      }
      members.push({topic,decision,codes});
    }
    if(!members.length)continue;
    if(record.learner_use_hold||!/^\d{4}$/.test(row.year)||Number(row.year)<2004||Number(row.year)>=2026){
      withheld.push({source_part_id:sid,reason:record.learner_use_hold?"source_learner_use_hold":"source_year_hold"});continue;
    }
    parts[sid]={source_part_id:sid,topics:Object.fromEntries(members.map(m=>[m.topic,m.decision])),
      scope_notes:scopeNotes.notes[sid]||{},
      direct_type_ids:unique(members.flatMap(m=>m.codes)),attributions:assigned.get(sid)||[],
      candidate_scope:scope.filter(s=>s.part_id===sid),reconciled_demands:demands.filter(d=>d.part_id===sid)};
    selected.push(row);
  }
  const parentRows=new Map();
  for(const row of selected)add(parentRows,identities(row).parent,row);
  const metadata=(preview,kind)=>{
    const file=path.join(DB,"outputs/previews",preview,kind+"_preview.json");
    if(!cache.has(file))cache.set(file,json(file));return cache.get(file);
  };
  const names=values=>unique((Array.isArray(values)?values:String(values||"").split(";")).filter(Boolean).map(value=>{
    ensure(/^crops[\\/](question|mark)_.*\.png$/.test(value),"E1/E2 source crop path is not bounded");
    return path.basename(value);
  }));
  const questions=[];
  for(const [parentId,group]of parentRows){
    const first=group[0],qp=metadata(first.preview,"question");
    const own=qp.question_groups.filter(q=>String(q.question_number)===first.question);
    if(own.length!==1){withheld.push(...group.map(r=>({source_part_id:r.part_id,reason:"missing_unique_original_parent"})));continue;}
    let ordered;
    try{ordered=orderPartsByOriginal(group,own[0]);}
    catch(error){withheld.push(...group.map(row=>({source_part_id:row.part_id,reason:"unverified_original_part_order",detail:error.message})));continue;}
    const children=ordered.map(row=>{
      const id=identities(row);
      return {part_id:id.part,source_part_id:row.part_id,label:id.label,cross_level_group_id:row.cross_level_group_id,
        marks:/^\d+$/.test(row.marks)?Number(row.marks):null,crops:names(row.question_crop_paths),ms_crops:names(row.ms_crop_paths),
        pages:String(row.page_render_paths||"").split(";").filter(file=>/^pages\/question_/.test(file)).map(file=>path.basename(file))};
    });
    questions.push({id:parentId,preview:first.preview,year:first.year,session:first.session,time_zone:first.time_zone,paper:first.paper,
      level:first.level,question:first.question,crops:names(own[0].crop_image_paths),parts:children,pages:unique(children.flatMap(p=>p.pages))});
  }
  const usedTypes=new Set(Object.values(parts).flatMap(p=>p.direct_type_ids));
  const atoms=[...definitions.values()].filter(a=>usedTypes.has(a.code));
  const usedGroups=new Set(atoms.map(a=>a.group_code));
  const groups=[...groupMap.values()].filter(g=>usedGroups.has(g.code));
  read(__filename);read(path.join(ROOT,"tools/physics-test-exclusions.js"));read(path.join(ROOT,"tools/build_ib_d2_recovery.js"));
  return {schema_version:1,topics,parts,questions,atoms,groups,types:[],corpus:rows,
    report:{source_snapshot:{path:SNAPSHOT,manifest_sha256:SNAPSHOT_SHA},eligibility:{path:pin.eligibility.path,sha256:pin.eligibility.sha256},
      candidate_source_ids:questions.flatMap(q=>q.parts.map(p=>p.source_part_id)).sort(),withheld,
      learner_hold_source_ids:Object.entries(eligibility.parts).filter(([,r])=>r.learner_use_hold).map(([id])=>id).sort(),
      source_files:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path)),
      source_records:{attributions:assignments,scope_outcomes:scope,reconciled_demands:demands}}};
}
function project(input){
  const atoms=new Map(input.atoms.map(a=>[a.code,a]));
  return input.questions.flatMap(parent=>parent.parts.map(part=>{
    const membership=input.parts[part.source_part_id],topicCodes=Object.keys(membership.topics),codes=membership.direct_type_ids;
    const img=name=>path.join(DB,"outputs/previews",parent.preview,"crops",name);
    return {id:part.part_id,parent_id:parent.id,source_part_id:part.source_part_id,source_group_id:part.cross_level_group_id||"",
      topic_codes:topicCodes,analysis_groups:unique(codes.map(code=>atoms.get(code).group_code)),analysis_atoms:[...codes],analysis_types:[],
      analysis_used_atoms:[],analysis_optional_atoms:[],analysis_canonical_ids:[],
      current_topic_levels:Object.fromEntries(topicCodes.map(topic=>[topic,membership.topics[topic].current_level])),
      practice_scope_notes:unique(topicCodes.filter(topic=>membership.topics[topic].status==="current_mixed_component").map(topic=>membership.scope_notes[topic])),
      year:String(parent.year),paper:parent.paper,level:parent.level,question_number:parent.question,
      label:part.label===parent.question?"":part.label,marks:part.marks,
      question_images:part.crops.map(img),context_images:/^1A?$/.test(parent.paper)?[]:parent.crops.map(img),
      markscheme_images:part.ms_crops.map(img),question_text:"",markscheme_text:"",
      source_label:[parent.session,parent.year,parent.time_zone,parent.level,"Paper "+parent.paper].filter(Boolean).join(" · "),source_notice:""};
  }));
}
function publicTaxonomy(input){
  return {groups:input.groups.map(({code,topic,label})=>({code,topic,label})),
    atoms:input.atoms.map(({code,topic,display_code,label,summary,checks})=>({code,topic,display_code,label,summary,checks})),types:[]};
}
module.exports={build,project,publicTaxonomy,orderPartsByOriginal,DB,ROOT,SNAPSHOT,SNAPSHOT_SHA,pinPath};
