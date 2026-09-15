"use strict";
// Reviewed-topic public bundle. Source records, exclusions and assessment evidence stay local.
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const {ibInput}=require("./assemble_physics_preview");
const {reviewedInput,auditCrops,validateTopicClearance,clearancePath:topicClearancePath}=require("./ib-topic-release");
const {prepareRelease:prepareD2Release,clearancePath:d2ClearancePath}=require("./ib-d2-release");
const {mergeD2Release}=require("./merge_ib_d2_release");
const {prepareRelease:prepareERelease,clearancePath:eClearancePath}=require("./ib-e-topics-release");
const {mergeERelease}=require("./merge_ib_e_topics_release");
const {loadCurrentReviewAdditions}=require("./ib-current-review-additions");
const {loadA5AdditionalGeometry}=require("./ib-a5-additional-geometry");
const ROOT=path.resolve(__dirname,".."),DB=path.resolve(process.env.PHYSICS_PAPERDB_ROOT || "C:/CodexProjects/PaperDatabases");
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const read=p=>fs.readFileSync(p,"utf8");
const ensure=(ok,message)=>{if(!ok)throw Error(message);};
const within=(root,file)=>{const rel=path.relative(root,file);return rel && !rel.startsWith("..") && !path.isAbsolute(rel);};
const unique=a=>[...new Set(a)];
function validateClearance(clearance,questions) {
  ensure(clearance.schema_version===1 && clearance.topic==="A.5" && clearance.review_complete===true,"A5 assessment review is not complete");
  ensure(Array.isArray(clearance.unresolved_relevant_items) && !clearance.unresolved_relevant_items.length,"Unresolved A5 test items remain");
  const expected=unique(questions.map(q=>q.source_part_id)).sort();
  ensure(JSON.stringify(expected)===JSON.stringify([...clearance.reviewed_source_part_ids].sort()),"A5 served parts differ from the reviewed release scope");
  const mcqPath=path.join(ROOT,"dist/physics-inputs/ib-physics-mcq.json");
  const mcq=JSON.parse(read(mcqPath));
  ensure(mcq.schema_version===1&&mcq.course==="ib"&&mcq.parts&&Array.isArray(mcq.report?.source_files),"A5 release MCQ provenance is missing");
  const required=[...loadCurrentReviewAdditions().fingerprints.map(file=>file.path),...loadA5AdditionalGeometry().fingerprints.map(file=>file.path),path.join(DB,"Physics Categorisation/viewer/ibphysics_catalogue.js"),
    path.join(DB,"outputs/exports/ib_physics_archive_flat_v5.csv"),
    ...["dist/physics-inputs/ib-a5-analysis.json","reports/ib-a5-reviewed-test-exclusions.json",
      "dist/physics-audit/current-ib-tests.json","dist/physics-audit/a5-current-assessment-freshness.json",
      "reports/ib-reviewed-crop-exclusions.json","reports/ib-a5-shared-parent-crop-review.json","dist/physics-inputs/ib-physics-mcq.json",
      "reports/ib-physics-reviewed-mcq.json","tools/build_ib_physics_mcq.js",
      "tools/assemble_physics_preview.js","tools/ib-reviewed-topics.js","tools/build_ib_a5_clearance.js"].map(p=>path.join(ROOT,p)),
    ...mcq.report.source_files.map(f=>path.resolve(f.path)),
    ...unique(questions.flatMap(q=>[...q.question_images,...q.context_images,...q.markscheme_images])).map(p=>path.resolve(p))];
  const fingerprintPaths=clearance.fingerprints.map(f=>path.resolve(f.path));
  ensure(new Set(fingerprintPaths).size===fingerprintPaths.length && required.every(p=>fingerprintPaths.includes(p)),"A5 release evidence fingerprints are incomplete or repeated");
  for(const f of clearance.fingerprints) ensure(fs.existsSync(f.path) && sha(fs.readFileSync(f.path))===f.sha256,"A5 clearance input changed: "+f.path);
  const requiredAssets=unique(questions.flatMap(q=>[...q.question_images,...q.context_images,...q.markscheme_images])).map(p=>path.resolve(p)).sort();
  const reviewedAssets=clearance.rendered_asset_review?.assets || [];
  ensure(JSON.stringify(unique(reviewedAssets.map(f=>path.resolve(f.path))).sort())===JSON.stringify(requiredAssets),"A5 rendered asset review differs from the served images");
  for(const f of reviewedAssets) ensure(clearance.fingerprints.some(p=>path.resolve(p.path)===path.resolve(f.path) && p.sha256===f.sha256),"A5 image review lacks its matching fingerprint");
  ensure(clearance.test_questions.length===15 && clearance.test_questions.every(q=>q.review_complete===true) &&
    JSON.stringify(clearance.test_questions.map(q=>Number(q.question)).sort((a,b)=>a-b))===JSON.stringify(Array.from({length:15},(_,i)=>i+1)),"All 15 current A5 test questions require distinct scoped review");
}
function assemble() {
  const baseline=ibInput(),a5Questions=baseline.questions.filter(q=>q.topic_codes.includes("A.5"));
  ensure(a5Questions.length && a5Questions.every(q=>/^\d{4}$/.test(q.year) && Number(q.year)<2026 && q.analysis_groups.length),"A5 release has missing groups or reserved years");
  const clearancePath=path.join(ROOT,"reports/ib-a5-release-clearance.json");
  const clearance=JSON.parse(read(clearancePath));
  validateClearance(clearance,a5Questions);
  const input=reviewedInput(),cropAudit=auditCrops(input);
  let questions=cropAudit.questions;
  ensure(questions.length && questions.every(q=>/^\d{4}$/.test(q.year) && Number(q.year)<2026),"A reserved exam year reached the release");
  ensure(JSON.stringify(questions.filter(q=>q.topic_codes.includes("A.5")).map(q=>q.source_part_id).sort())===JSON.stringify(a5Questions.map(q=>q.source_part_id).sort()),"New topic checks changed the reviewed A5 scope");
  const topicClearance=JSON.parse(read(topicClearancePath));
  validateTopicClearance(topicClearance,questions);
  const additionalClearances=[];
  let d2=null;
  if(fs.existsSync(d2ClearancePath)){
    d2=prepareD2Release();
    const stored=JSON.parse(read(d2ClearancePath));
    ensure(stored.review_complete===true && stored.topic==="D.2","D2 release clearance is incomplete");
    for(const field of ["reviewed_source_part_ids","reviewed_parent_ids","counts","assets","fingerprints"])
      ensure(JSON.stringify(stored[field])===JSON.stringify(d2.clearance[field]),"D2 release evidence changed: "+field);
    questions=mergeD2Release(questions,d2.questions);
    const remaining=new Set(questions.map(q=>q.source_part_id));
    ensure(d2.report.existing_public_assessment_impacts.every(q=>!remaining.has(q.source_part_id)),"A newly identified assessment question remains in an existing topic");
    additionalClearances.push({path:d2ClearancePath,sha256:sha(read(d2ClearancePath))});
  }
  let eTopics=null;
  if(fs.existsSync(eClearancePath)){
    eTopics=prepareERelease();
    const stored=JSON.parse(read(eClearancePath));
    ensure(stored.review_complete===true && JSON.stringify(stored.topics)===JSON.stringify(["E.1","E.2"]),"E1/E2 release clearance is incomplete");
    for(const field of ["reviewed_source_part_ids","reviewed_parent_ids","counts","assets","fingerprints"])
      ensure(JSON.stringify(stored[field])===JSON.stringify(eTopics.clearance[field]),"E1/E2 release evidence changed: "+field);
    for(const q of questions){
      ensure(!eTopics.safety.blockedParentIds.has(q.parent_id)&&!eTopics.safety.blockedSourceIds.has(q.source_part_id)&&
        !eTopics.safety.qualityHolds.has(q.source_part_id),"New E review requires updating an existing topic hold: "+q.id);
      ensure([...q.question_images,...q.context_images].every(file=>{
        const preview=path.basename(path.dirname(path.dirname(file))),page=Number((/_p(\d+)(?:_|\.)/.exec(file)||[])[1]);
        return !eTopics.safety.heldPages.has(preview+"/"+page);
      }),"New E review reserves an existing topic's context page: "+q.id);
    }
    questions=mergeERelease(questions,eTopics.questions);
    additionalClearances.push({path:eClearancePath,sha256:sha(read(eClearancePath))});
  }
  const assetFiles=unique(questions.flatMap(q=>[...q.question_images,...q.context_images,...q.markscheme_images]));
  const assets=new Map();
  for(const file of assetFiles) {
    ensure(within(path.join(DB,"outputs/previews"),file) && /[\\/]crops[\\/](?:question|mark)_.*\.png$/i.test(file),"Only attributed question and markscheme crops may be published");
    const bytes=fs.readFileSync(file);assets.set(file,{url:"assets/"+sha(bytes)+".png",bytes});
  }
  const topicLabels={"A.1":"Kinematics","A.5":"Galilean and special relativity","C.1":"Simple harmonic motion",...(d2?{"D.2":"Electric and magnetic fields"}:{}),
    ...(eTopics?{"E.1":"Structure of the atom","E.2":"Quantum physics"}:{})};
  const d2Atoms=new Set(d2?d2.taxonomy.atoms.map(atom=>atom.code):[]);
  const eAtoms=new Map(eTopics?eTopics.taxonomy.atoms.map(atom=>[atom.code,atom.topic]):[]);
  const topicMappingCounts=Object.fromEntries(Object.keys(topicLabels).map(topic=>[topic,{
    parts:questions.filter(q=>q.topic_codes.includes(topic)).length,
    typed_parts:questions.filter(q=>q.topic_codes.includes(topic)&&q.analysis_atoms.some(code=>topic.startsWith("E.")?eAtoms.get(code)===topic:
      topic==="D.2"?d2Atoms.has(code):code.replace(/\./g,"").startsWith(topic.replace(".","")))).length
  }]));
  const meta={course:"ib",title:"IB Physics past-paper question viewer",release:true,default_topic:"A.5", // QoderWork 2026-09-14
    topics:topicLabels,topic_mapping_counts:topicMappingCounts,
    analysis:{...input.meta.analysis,...Object.fromEntries(["groups","atoms","types"].map(kind=>[kind,[...input.meta.analysis[kind],...(d2?d2.taxonomy[kind]:[]),...(eTopics?eTopics.taxonomy[kind]:[])]]))}};
  const publicQuestions=questions.map(q=>({...q,source_notice:"",topic_codes:q.topic_codes.filter(topic=>Object.hasOwn(topicLabels,topic)),
    question_images:q.question_images.map(f=>assets.get(f).url),
    context_images:q.context_images.map(f=>assets.get(f).url),
    markscheme_images:q.markscheme_images.map(f=>assets.get(f).url)}));
  const shared=["engine/ppqviewer.js","engine/ppqviewer.css","example/physics.html","example/physics-config.js","example/physics-identity.js","example/physics-login.js","tools/assemble_ibphysics_release.js","tools/ib-topic-release.js","tools/ib-reviewed-topics.js","tools/ib-topic-originals.js","tools/ib-topic-mcq.js"];
  shared.push("example/physics-reporting.js");
  if(d2)shared.push("tools/ib-d2-release.js","tools/build_ib_d2_recovery.js","tools/merge_ib_d2_release.js");
  if(eTopics)shared.push("tools/ib-e-topics-input.js","tools/ib-e-topics-release.js","tools/merge_ib_e_topics_release.js");
  const tracking=read(path.join(ROOT,"deploy/ibmathsppqs/index.html")).match(/<!-- GA4[\s\S]*?<\/script>\s*<!-- Microsoft Clarity[\s\S]*?<\/script>/);
  ensure(tracking && tracking[0].includes("G-WKYGJYERSR") && tracking[0].includes("xdr2tsc688"),"Estate analytics blocks are missing");
  const catalogue="window.PHYSICS_META="+JSON.stringify(meta)+";\nwindow.PHYSICS_QUESTIONS="+JSON.stringify(publicQuestions)+";\n";
  const buildId=sha(catalogue+sha(read(clearancePath))+sha(read(topicClearancePath))+additionalClearances.map(c=>c.sha256).join("|")+shared.map(f=>sha(read(path.join(ROOT,f)))).join("|")+tracking[0]).slice(0,16);
  const out=path.join(ROOT,"dist/ibphysics-release",buildId+"-"+Date.now());
  for(const folder of ["assets","engine","data"])fs.mkdirSync(path.join(out,folder),{recursive:true});
  for(const {url,bytes} of assets.values())fs.writeFileSync(path.join(out,url),bytes);
  for(const name of ["ppqviewer.js","ppqviewer.css"])fs.copyFileSync(path.join(ROOT,"engine",name),path.join(out,"engine",name));
  fs.copyFileSync(path.join(ROOT,"example/physics-config.js"),path.join(out,"physics-config.js"));
  for(const name of ["physics-identity.js","physics-login.js","physics-reporting.js"])fs.copyFileSync(path.join(ROOT,"example",name),path.join(out,name));
  fs.writeFileSync(path.join(out,"index.html"),read(path.join(ROOT,"example/physics.html")).replace("</head>",tracking[0]+"\n</head>"));
  fs.writeFileSync(path.join(out,"data/physics_catalogue.js"),catalogue);
  fs.writeFileSync(path.join(out,".nojekyll"),"");
  const info={build_id:buildId,built_at:new Date().toISOString(),topics:Object.keys(topicLabels),topic_counts:topicMappingCounts,parts:publicQuestions.length,
    groups:Object.fromEntries(meta.analysis.groups.map(g=>[g.code,publicQuestions.filter(q=>q.analysis_groups.includes(g.code)).length])),
    assets:new Set([...assets.values()].map(a=>a.url)).size,
    analysis_source:"Reviewed A1 taxonomy, Special Relativity taxonomy and SHM question types"+(d2?", with the authored D2 question types":"")+
      (eTopics?", and reviewed E1/E2 question types":"")+"; fine memberships are included only where mapped"};
  fs.writeFileSync(path.join(out,"build-info.json"),JSON.stringify(info,null,2)+"\n");
  const local={...info,root:out,clearance:{path:clearancePath,sha256:sha(read(clearancePath))},
    topic_clearance:{path:topicClearancePath,sha256:sha(read(topicClearancePath))},
    additional_clearances:additionalClearances,source_report:{...input.report,...(d2?{d2_release:d2.report}:{}),...(eTopics?{e_topics_release:eTopics.report}:{})},shared_files:shared.map(f=>({path:f,sha256:sha(read(path.join(ROOT,f)))}))};
  fs.writeFileSync(path.join(ROOT,"dist/ibphysics-release/latest.json"),JSON.stringify(local,null,2)+"\n");
  console.log(JSON.stringify({root:out,...info},null,2));
  return local;
}
if(require.main===module)assemble();
module.exports={assemble,validateClearance};
