"use strict";
const assert=require("node:assert/strict");
const memberships=["topic_codes","analysis_groups","analysis_atoms","analysis_types","analysis_used_atoms","analysis_optional_atoms","analysis_canonical_ids"];
const content=["id","parent_id","source_part_id","source_group_id","year","paper","level","question_number","label","marks","question_images","context_images","markscheme_images"];
// Match the consumer's logical part order for existing siblings from other
// topics. Nested Roman numerals are ordinal values, not lexical strings.
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
function mergeERelease(existing,cleared){
  const result=structuredClone(existing),bySource=new Map(),byId=new Map(),seen=new Set();
  for(const q of result){
    assert(q.id&&q.source_part_id&&!bySource.has(q.source_part_id)&&!byId.has(q.id),"Duplicate existing source identity");
    bySource.set(q.source_part_id,q);byId.set(q.id,q);
  }
  for(const q of cleared){
    assert(/^ibchem_part_[a-f0-9]+$/.test(q.source_part_id||"")&&q.id&&!seen.has(q.source_part_id),"Duplicate or missing E source identity");
    seen.add(q.source_part_id);
    assert(q.topic_codes.length&&q.topic_codes.every(t=>["E.1","E.2"].includes(t)),"E release scope crossed into another topic");
    assert(/^\d{4}$/.test(String(q.year))&&Number(q.year)>=2004&&Number(q.year)<2026,"Reserved E source year");
    const prior=bySource.get(q.source_part_id);
    if(!prior){
      assert(!byId.has(q.id),"E part aliases another source part");
      const added=structuredClone(q);result.push(added);bySource.set(q.source_part_id,added);byId.set(q.id,added);continue;
    }
    for(const field of content)assert.deepEqual(q[field],prior[field],"E source content differs from an existing topic: "+q.id+" "+field);
    if(q.correct_option&&prior.correct_option)assert.equal(q.correct_option,prior.correct_option,"Conflicting original answer keys");
    for(const field of memberships)prior[field]=[...new Set([...(prior[field]||[]),...(q[field]||[])])];
    prior.practice_scope_notes=[...new Set([...(prior.practice_scope_notes||[]),...(q.practice_scope_notes||[])])];
    prior.current_topic_levels||={};
    for(const [topic,level]of Object.entries(q.current_topic_levels||{})){
      assert(["E.1","E.2"].includes(topic)&&["HL","HLSL"].includes(level),"Invalid E current-level projection");
      assert(!prior.current_topic_levels[topic]||prior.current_topic_levels[topic]===level,"Conflicting current topic level");
      prior.current_topic_levels[topic]=level;
    }
    if(!prior.correct_option&&q.correct_option){prior.correct_option=q.correct_option;prior.answer_status=q.answer_status;}
  }
  // Sort only the occupied slots of parents touched by this E addition. This
  // fixes part chips across topic boundaries without moving unrelated records.
  for(const parent of new Set(cleared.map(q=>q.parent_id))){
    const slots=result.flatMap((q,index)=>q.parent_id===parent?[index]:[]);
    const siblings=slots.map(index=>result[index]).sort(compareParts);
    slots.forEach((index,ordinal)=>{result[index]=siblings[ordinal];});
  }
  return result;
}
module.exports={mergeERelease};
