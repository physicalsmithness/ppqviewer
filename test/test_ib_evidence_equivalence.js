"use strict";
const assert=require("assert/strict"),path=require("path");
const {rebind,assertEquivalent,verifyRetiredImpacts}=require("../tools/migrate_ib_release_evidence");
const source=path.resolve("source.json"),pinned=path.resolve("pinned.json");
const a={reviewed_on:"2026-09-12",questions:[{id:"q",text:"original",images:["question.png","context.png"]}],report:{candidate_source_ids:["q"],source_files:[{path:source,sha256:"old"}]}};
const ids=new Map([[source,{oldHashes:["old"],sha256:"new"}]]),aliases=new Map([[source,pinned]]);
const b=structuredClone(a);b.report.source_files[0]={path:pinned,sha256:"new"};
assertEquivalent("only declared provenance",rebind(a,ids,aliases),b);
for(const mutate of [d=>d.questions[0].text="changed",d=>d.questions[0].images.reverse(),d=>d.report.candidate_source_ids.push("new"),d=>d.reviewed_on="today",d=>d.questions.push(structuredClone(d.questions[0])),d=>d.new_field=true]){
  const changed=structuredClone(b);mutate(changed);assert.throws(()=>assertEquivalent("unexpected mutation",rebind(a,ids,aliases),changed),/changed substantive evidence/);
}
const wrong=structuredClone(a);wrong.report.source_files[0].sha256="unknown";assert.throws(()=>rebind(wrong,ids,aliases),/Unexpected previous fingerprint/);
console.log("PASS full evidence equality rejects content, report, date, image-order, duplicate and unknown-fingerprint changes");
const impact={id:"q",source_part_id:"source",parent_id:"parent"};
verifyRetiredImpacts([impact],[],[],new Set(["parent"]));
assert.throws(()=>verifyRetiredImpacts([impact],[],[],new Set()),/no longer reserved/);
assert.throws(()=>verifyRetiredImpacts([impact],[],[impact],new Set(["parent"])),/still public/);
assert.throws(()=>verifyRetiredImpacts([], [impact],[],new Set(["parent"])),/Unexpected new/);
console.log("PASS historical removals require continued reservation and absence from the public bundle");
