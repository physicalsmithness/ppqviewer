"use strict";
// A.2 source projection, on the E1/E2 pattern: native parents and parts are built
// straight from the archive, so no other topic's inputs or clearances are touched.
// Scope is instinctivelymechanical's delivery (pinned in reports/ib-release-inputs),
// narrowed by d035 in reports/ib-a2-release-scope.json.
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const {parseCsv}=require("./physics-test-exclusions");
const {identities}=require("./build_ib_d2_recovery");
const {orderPartsByOriginal}=require("./ib-e-topics-input");
const ROOT=path.resolve(__dirname,".."),DB=path.resolve(process.env.PHYSICS_PAPERDB_ROOT||"C:/CodexProjects/PaperDatabases");
const scopePath=path.join(ROOT,"reports/ib-a2-release-scope.json");
const TOPIC="A.2",sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const unique=a=>[...new Set(a.filter(Boolean))];

function build(){
  const files=new Map(),cache=new Map();
  function read(file,expected){
    file=path.resolve(file);const bytes=fs.readFileSync(file),hash=sha(bytes);
    ensure(!expected||hash===expected,"A.2 source fingerprint changed: "+file);
    ensure(!files.has(file)||files.get(file).sha256===hash,"A.2 source changed during projection: "+file);
    files.set(file,{path:file,sha256:hash});return bytes;
  }
  const json=file=>JSON.parse(read(file).toString("utf8").replace(/^\uFEFF/,""));
  const scope=json(scopePath);
  ensure(scope.schema_version===1&&scope.topic===TOPIC&&Array.isArray(scope.eligible_source_ids)&&scope.eligible_source_ids.length,"A.2 release scope is missing");
  const analysis=JSON.parse(read(path.join(ROOT,scope.analysis.path),scope.analysis.sha256));
  ensure(analysis.schema_version===1&&analysis.topic===TOPIC&&analysis.parts&&analysis.atoms.length,"A.2 analysis is not the pinned delivery");
  // The bank decided d035's later-topic holds. It moves as categorisation continues, so
  // a changed bank is reported for a scope rebuild rather than blocking a release.
  let bankState="absent";
  if(fs.existsSync(scope.bank.path))bankState=sha(fs.readFileSync(scope.bank.path))===scope.bank.sha256?"unchanged":"changed_since_scope";
  const rows=parseCsv(read(path.join(DB,"outputs/exports/ib_physics_archive_flat_v5.csv")).toString("utf8"));
  const corpus=new Map(rows.map(row=>[row.part_id,row]));
  ensure(rows.length===18308&&corpus.size===rows.length,"A.2 archive identity changed");
  const parts={},selected=[],withheld=[];
  for(const sid of scope.eligible_source_ids){
    const record=analysis.parts[sid],row=corpus.get(sid);
    ensure(record&&record.status==="included"&&record.serve_under_a2===true,"A.2 scope names a part the delivery does not serve: "+sid);
    if(!row){withheld.push({source_part_id:sid,reason:"missing_archive_row"});continue;}
    if(!/^\d{4}$/.test(row.year)||Number(row.year)<2004||Number(row.year)>=2026){withheld.push({source_part_id:sid,reason:"source_year_hold"});continue;}
    const levels=record.current_levels||[];
    ensure(levels.length&&levels.every(l=>["SL","HL"].includes(l)),"A.2 part lacks its current levels: "+sid);
    parts[sid]={source_part_id:sid,record,current_level:levels.includes("SL")&&levels.includes("HL")?"HLSL":levels[0]};
    selected.push(row);
  }
  const parentRows=new Map(),add=(map,key,value)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(value);};
  for(const row of selected)add(parentRows,identities(row).parent,row);
  const metadata=(preview,kind)=>{
    const file=path.join(DB,"outputs/previews",preview,kind+"_preview.json");
    if(!cache.has(file))cache.set(file,json(file));return cache.get(file);
  };
  const names=values=>unique((Array.isArray(values)?values:String(values||"").split(";")).filter(Boolean).map(value=>{
    ensure(/^crops[\\/](question|mark)_.*\.png$/.test(value),"A.2 source crop path is not bounded");
    return path.basename(value);
  }));
  const questions=[];
  for(const [parentId,group]of parentRows){
    const first=group[0];let qp;
    try{qp=metadata(first.preview,"question");}catch(error){withheld.push(...group.map(r=>({source_part_id:r.part_id,reason:"missing_preview_metadata"})));continue;}
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
  const usedAtoms=new Set(Object.values(parts).flatMap(p=>p.record.atom_codes||[]));
  const atoms=analysis.atoms.filter(a=>usedAtoms.has(a.code));
  const usedGroups=new Set([...Object.values(parts).flatMap(p=>p.record.group_codes||[]),...atoms.flatMap(a=>a.group_codes||[])]);
  const groups=analysis.groups.filter(g=>usedGroups.has(g.code));
  read(__filename);read(path.join(ROOT,"tools/physics-test-exclusions.js"));read(path.join(ROOT,"tools/build_ib_d2_recovery.js"));read(path.join(ROOT,"tools/ib-e-topics-input.js"));
  return {schema_version:1,topic:TOPIC,label:analysis.label,parts,questions,atoms,groups,corpus:rows,
    report:{scope:{path:scopePath,sha256:files.get(path.resolve(scopePath)).sha256},analysis:scope.analysis,bank_state:bankState,
      candidate_source_ids:questions.flatMap(q=>q.parts.map(p=>p.source_part_id)).sort(),withheld,
      source_files:[...files.values()].sort((a,b)=>a.path.localeCompare(b.path))}};
}
function project(input){
  return input.questions.flatMap(parent=>parent.parts.map(part=>{
    const p=input.parts[part.source_part_id],r=p.record;
    const img=name=>path.join(DB,"outputs/previews",parent.preview,"crops",name);
    return {id:part.part_id,parent_id:parent.id,source_part_id:part.source_part_id,source_group_id:part.cross_level_group_id||"",
      topic_codes:[TOPIC],analysis_groups:unique(r.group_codes||[]),analysis_atoms:unique(r.atom_codes||[]),analysis_types:[],
      analysis_used_atoms:unique(r.used_atom_codes||[]),analysis_optional_atoms:unique(r.optional_atom_codes||[]),analysis_canonical_ids:[],
      current_topic_levels:{[TOPIC]:p.current_level},
      year:String(parent.year),paper:parent.paper,level:parent.level,question_number:parent.question,
      label:part.label===parent.question?"":part.label,marks:part.marks,
      question_images:part.crops.map(img),context_images:/^1A?$/.test(parent.paper)?[]:parent.crops.map(img),
      markscheme_images:part.ms_crops.map(img),question_text:"",markscheme_text:"",
      source_label:[parent.session,parent.year,parent.time_zone,parent.level,"Paper "+parent.paper].filter(Boolean).join(" · "),source_notice:""};
  }));
}
function publicTaxonomy(input){
  return {groups:input.groups.map(({code,label,summary})=>({code,topic:TOPIC,label,...(summary?{summary}:{})})),
    atoms:input.atoms.map(({code,label,summary,checks})=>({code,topic:TOPIC,display_code:code.replace(/^A2T\./,"A2."),label,
      ...(summary?{summary}:{}),...(checks&&checks.length?{checks}:{})})),types:[]};
}
module.exports={build,project,publicTaxonomy,scopePath,ROOT,DB,TOPIC};
