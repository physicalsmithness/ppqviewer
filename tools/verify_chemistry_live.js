/* Read-only verification of the exact published migration. No sign-in,
 * learner attempts or teacher messages are submitted. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const {verifyBuild} = require("./stage_chemistry_release");
const {loadCatalogue} = require("./assemble_chemistry_preview");
const ROOT = path.resolve(__dirname, ".."), BASE = "https://physicalsmithness.github.io/chemistrydriller/";
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
async function main() {
  const build = verifyBuild(), catalogue = loadCatalogue(path.join(build.root, "ppqviewer/chemistry-catalogue.js"));
  const files = new Set(build.assets.filter(a => !a.path.startsWith("ppqviewer/assets/")).map(a => a.path));
  const samples = ["1A", "1B", "2"].map(paper => catalogue.records.find(q => String(q.paper) === paper));
  samples.push(catalogue.records.find(q => q.id === "16M.2.HL.3(a)(i)"));
  for (const q of samples.filter(Boolean)) for (const file of [...q.question_images, ...q.context_images, ...q.markscheme_images]) files.add("ppqviewer/" + file);
  const booklet = build.assets.filter(a => a.path.startsWith("ppqviewer/assets/") && !a.path.startsWith("ppqviewer/assets/questions/"));
  for (const asset of booklet) files.add(asset.path);
  const queue = [...files], verified = [];
  async function worker() {
    while (queue.length) {
      const file = queue.shift(), expected = build.assets.find(a => a.path === file);
      const response = await fetch(BASE + file + "?build=" + encodeURIComponent(build.latest.build_id), {signal:AbortSignal.timeout(30000)});
      if (!response.ok) throw new Error(file + " returned " + response.status);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (sha(bytes) !== expected.sha256) throw new Error("Live bytes differ: " + file);
      verified.push({path:file, sha256:expected.sha256, bytes:bytes.length});
    }
  }
  await Promise.all(Array.from({length:6}, worker));
  const report = {checked_at:new Date().toISOString(), result:"PASS", build_id:build.latest.build_id,
    url:build.latest.production_url, parts:catalogue.records.length, files_verified:verified.sort((a,b)=>a.path.localeCompare(b.path)),
    production_attempts_submitted:false};
  fs.writeFileSync(path.join(ROOT, "CHEMISTRY_LIVE_VERIFICATION.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({result:report.result, build_id:report.build_id, parts:report.parts, live_files_verified:verified.length}));
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
