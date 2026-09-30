"use strict";
// Merge cleared A.2 parts into the other topics' records. A part already served under
// another topic keeps its record and gains A.2. Under d035 a part is served under the
// latest topic it involves, so a touched record's lead (topic_codes[0]) becomes the
// latest in syllabus order: A.1 + A.2 leads A.2; A.5 + A.2 still leads A.5.
const assert=require("node:assert/strict");
const memberships=["analysis_groups","analysis_atoms","analysis_types","analysis_used_atoms","analysis_optional_atoms","analysis_canonical_ids"];
const content=["id","parent_id","source_part_id","source_group_id","year","paper","level","question_number","label","marks","question_images","context_images","markscheme_images"];
const syllabusKey=code=>{const m=/^([A-E])\.(\d+)$/.exec(code);return m?m[1].charCodeAt(0)*100+Number(m[2]):-1;};
function latestFirst(codes){
  const topics=codes.filter(c=>syllabusKey(c)>=0).sort((a,b)=>syllabusKey(b)-syllabusKey(a));
  return [...topics,...codes.filter(c=>syllabusKey(c)<0)];
}
// The E merge's sibling order: nested Roman numerals are ordinal values.
function compareParts(a,b){
  const tokens=q=>/^(?:\(?whole\)?|)$/i.test(q.label||"")?[]:String(q.label).toLowerCase().match(/[a-z]+|\d+/g)||[];
  const left=tokens(a),right=tokens(b);
  function rank(token,depth){
    if(/^\d+$/.test(token))return Number(token);
    if(depth>0&&/^[ivxlcdm]+$/.test(token)){
      const values={i:1,v:5,x:10,l:50,c:100,d:500,m:1000};let total=0;
      for(let i=0;i<token.length;i++)total+=values[token[i]]<(values[token[i+1]]||0)?-values[token[i]]:values[token[i]];
      return total;
    }
    return null;
  }
  for(let i=0;i<Math.min(left.length,right.length);i++){
    const l=rank(left[i],i),r=rank(right[i],i);
    const difference=l!==null&&r!==null?l-r:left[i].localeCompare(right[i],undefined,{numeric:true});
    if(difference)return difference;
  }
  return left.length-right.length||String(a.id).localeCompare(String(b.id),undefined,{numeric:true});
}
function mergeA2Release(existing,cleared,topic="A.2"){
  const result=structuredClone(existing),bySource=new Map(),byId=new Map(),seen=new Set();
  for(const q of result){
    assert(q.id&&q.source_part_id&&!bySource.has(q.source_part_id)&&!byId.has(q.id),"Duplicate existing source identity");
    bySource.set(q.source_part_id,q);byId.set(q.id,q);
  }
  for(const q of cleared){
    assert(/^ibchem_part_[a-f0-9]+$/.test(q.source_part_id||"")&&q.id&&!seen.has(q.source_part_id),"Duplicate or missing "+topic+" source identity");
    seen.add(q.source_part_id);
    assert(q.topic_codes.length===1&&q.topic_codes[0]===topic,topic+" release scope crossed into another topic");
    assert(/^\d{4}$/.test(String(q.year))&&Number(q.year)>=2004&&Number(q.year)<2026,"Reserved "+topic+" source year");
    assert(["SL","HL","HLSL"].includes(q.current_topic_levels[topic]),"Invalid "+topic+" current level");
    const prior=bySource.get(q.source_part_id);
    if(!prior){
      assert(!byId.has(q.id),topic+" part aliases another source part");
      const added=structuredClone(q);result.push(added);bySource.set(q.source_part_id,added);byId.set(q.id,added);continue;
    }
    for(const field of content)assert.deepEqual(q[field],prior[field],topic+" source content differs from an existing topic: "+q.id+" "+field);
    if(q.correct_option&&prior.correct_option)assert.equal(q.correct_option,prior.correct_option,"Conflicting original answer keys");
    prior.topic_codes=latestFirst([...new Set([...prior.topic_codes,topic])]);
    for(const field of memberships)prior[field]=[...new Set([...(prior[field]||[]),...(q[field]||[])])];
    prior.current_topic_levels={...(prior.current_topic_levels||{}),[topic]:q.current_topic_levels[topic]};
    if(!prior.correct_option&&q.correct_option){prior.correct_option=q.correct_option;prior.answer_status=q.answer_status;}
  }
  for(const parent of new Set(cleared.map(q=>q.parent_id))){
    const slots=result.flatMap((q,index)=>q.parent_id===parent?[index]:[]);
    const siblings=slots.map(index=>result[index]).sort(compareParts);
    slots.forEach((index,ordinal)=>{result[index]=siblings[ordinal];});
  }
  return result;
}
module.exports={mergeA2Release,latestFirst};
