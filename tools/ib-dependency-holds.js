"use strict";
// d035 (a topic serves nothing that needs a topic the pupil has not met).
// Smith, 2026-09-30: "withold all 65 for the moment". A hold subtracts parts from the
// cleared scope for serving; it never edits a clearance, so a part comes back the moment
// its line is removed here, with no new review. The list is written from evidence in
// reports/topic-dependency-leaks-2026-09-30.json and pinned by that file's sha256.
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const ROOT=path.resolve(__dirname,"..");
const holdsPath=path.join(ROOT,"reports/ib-dependency-holds.json");
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const TWIN=/^ibchem_xlvl_/;

function loadHolds(file=holdsPath){
  if(!fs.existsSync(file))return null;
  const text=fs.readFileSync(file),record=JSON.parse(text);
  ensure(record.schema_version===1&&Array.isArray(record.holds),"Dependency holds are not a schema-1 record");
  ensure(/^d035\b/.test(record.decision||""),"Dependency holds must cite d035");
  const evidence=path.join(ROOT,record.evidence&&record.evidence.path||"");
  ensure(fs.existsSync(evidence)&&sha(fs.readFileSync(evidence))===record.evidence.sha256,"Dependency hold evidence is missing or changed: "+(record.evidence&&record.evidence.path));
  const ids=new Set();
  for(const h of record.holds){
    ensure(/^ibchem_part_[0-9a-f]{16}$/.test(h.source_part_id||"")&&h.served_id&&h.served_under,"A dependency hold needs its source ID, served ID and topic");
    ensure(Array.isArray(h.reasons)&&h.reasons.length&&h.reasons.every(r=>["later_topic","route_atom_only","twin_of_held"].includes(r.kind)),"A dependency hold needs a stated reason: "+h.served_id);
    ensure(!ids.has(h.source_part_id),"A dependency hold is listed twice: "+h.served_id);
    ids.add(h.source_part_id);
  }
  return {record,ids,sha256:sha(text),path:file};
}

// Returns the served subset, the held parts, holds that name no cleared part, and any
// twin group left half-held. The assembler refuses the last two; the suite asserts them.
// A later-topic hold lifts by itself once the site serves the part under every later
// topic that caused it: d035 then has it where it belongs (A.1 + A.2 served under A.2).
// A twin held only for its twin lifts with it. Route-atom holds never lift here.
function liftedIds(questions,holds){
  const bySource=new Map(questions.map(q=>[q.source_part_id,q])),lifted=new Set();
  for(const h of holds.record.holds){
    const q=bySource.get(h.source_part_id);if(!q)continue;
    const later=h.reasons.filter(r=>r.kind==="later_topic"),other=h.reasons.filter(r=>!["later_topic","twin_of_held"].includes(r.kind));
    if(!later.length||other.length)continue;
    const named=later.flatMap(r=>r.topics||[]);
    if(named.length&&named.every(t=>q.topic_codes.includes(t))&&named.includes(q.topic_codes[0]))lifted.add(h.source_part_id);
  }
  const byServedId=new Map(holds.record.holds.map(h=>[h.served_id,h.source_part_id]));
  for(const h of holds.record.holds){
    const twin=h.reasons.filter(r=>r.kind==="twin_of_held");
    if(twin.length&&h.reasons.length===twin.length&&twin.every(r=>lifted.has(byServedId.get(r.twin_of))))lifted.add(h.source_part_id);
  }
  return lifted;
}

function applyHolds(questions,holds){
  if(!holds)return {served:questions,held:[],missing:[],twinGaps:[],lifted:[]};
  const cleared=new Set(questions.map(q=>q.source_part_id)),lifted=liftedIds(questions,holds);
  const active=id=>holds.ids.has(id)&&!lifted.has(id);
  const served=questions.filter(q=>!active(q.source_part_id));
  const held=questions.filter(q=>active(q.source_part_id));
  const missing=holds.record.holds.filter(h=>!cleared.has(h.source_part_id)).map(h=>h.served_id);
  const heldGroups=new Set(held.map(q=>q.source_group_id).filter(g=>TWIN.test(g||"")));
  const twinGaps=served.filter(q=>heldGroups.has(q.source_group_id)).map(q=>q.id);
  return {served,held,missing,twinGaps,lifted:[...lifted].sort()};
}

module.exports={holdsPath,loadHolds,applyHolds};
