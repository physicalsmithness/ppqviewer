"use strict";
// Read current E assessment originals; write only the local freshness receipt.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');
const live='H:/Shared drives/0. Physics (Teachers)/1- IB Folder/3. Assessments';
const snapshot='C:/CodexProjects/PaperDatabases/Physics Categorisation/reference/tests/3. Assessments';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const folders=['E','z. end of course mini-tests'];
const relevant=(folder,name)=>/\.(pdf|docx)$/i.test(name)&&(folder==='E'||/^E[12]\b/i.test(name));
function inventory(root){return folders.flatMap(folder=>fs.readdirSync(path.join(root,folder),{withFileTypes:true})
  .filter(file=>file.isFile()&&relevant(folder,file.name)).map(file=>folder+'/'+file.name)).sort();}
const originals=inventory(live),copies=inventory(snapshot),all=[...new Set([...originals,...copies])].sort();
const files=all.map(relative_path=>{
  const original=path.join(live,relative_path),copy=path.join(snapshot,relative_path);
  const current_sha256=fs.existsSync(original)?sha(original):null,snapshot_sha256=fs.existsSync(copy)?sha(copy):null;
  return {relative_path,path:original,snapshot_path:copy,sha256:current_sha256,snapshot_sha256,
    matches_snapshot:Boolean(current_sha256&&current_sha256===snapshot_sha256)};
});
const result={schema_version:1,topics:['E.1','E.2'],checked_at:new Date().toISOString(),source_root:live,snapshot_root:snapshot,
  complete:files.length>0&&files.every(f=>f.matches_snapshot),source_files:files,
  inventory_matches:JSON.stringify(originals)===JSON.stringify(copies),
  policy:'Read-only original/snapshot byte comparison. This is freshness evidence, not question-level assessment clearance.'};
const out=path.join(ROOT,'reports/ib-e1-e2-current-assessment-freshness.json');
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({path:out,files:files.length,complete:result.complete,inventory_matches:result.inventory_matches,
  differences:files.filter(f=>!f.matches_snapshot).map(f=>f.relative_path)}));
if(!result.complete||!result.inventory_matches)process.exitCode=1;
