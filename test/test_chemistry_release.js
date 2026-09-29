/* Synthetic release fixtures stay under dist. No donor writes or network. */
"use strict";
const assert = require("assert/strict"), fs = require("fs"), path = require("path"), crypto = require("crypto"), vm = require("vm"), {JSDOM} = require("jsdom");
const {assemble:previewAssembly, loadCatalogue} = require("../tools/assemble_chemistry_preview");
const {assemble, safeRelative, RUNTIME, PRODUCTION_URL, PARTS} = require("../tools/assemble_chemistry_release");
const ROOT = path.resolve(__dirname, ".."), fixture = path.join(ROOT, "dist/chemistry-release-tests", Date.now() + "-" + process.pid);
const repo = path.join(fixture, "repo"), donor = path.join(fixture, "donor"), previews = path.join(fixture, "previews");
const outputRoot = path.join(fixture, "release"), sourcePath = path.join(fixture, "source.js"), settingsPath = path.join(fixture, "settings.json"), verificationPath = path.join(fixture, "verification.json");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==", "base64");
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex"), fileHash = file => hash(fs.readFileSync(file));
const clone = value => JSON.parse(JSON.stringify(value));
function write(file, bytes) { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, bytes); }
function json(file, value) { write(file, JSON.stringify(value, null, 2) + "\n"); }
function catalogue(file, records, meta = {}) { write(file, "window.CHEMISTRY_META=" + JSON.stringify(meta) + ";window.CHEMISTRY_QUESTIONS=" + JSON.stringify(records) + ";\n"); }
function withFiles(files, action) { const before = files.map(file => [file, fs.readFileSync(file)]); try { return action(); } finally { before.forEach(([file, bytes]) => fs.writeFileSync(file, bytes)); } }
let checks = 0;
function check(name, action) { action(); checks++; console.log("ok " + name); }
for (const [source] of RUNTIME) write(path.join(repo, source), fs.readFileSync(path.join(ROOT, source)));
write(path.join(repo, "example/chemistry-redirect.html"), fs.readFileSync(path.join(ROOT, "example/chemistry-redirect.html")));
const adapterBox = {window:{}}; vm.runInNewContext(fs.readFileSync(path.join(repo, "example/chemistry-config.js"), "utf8"), adapterBox);
const config = adapterBox.window.ChemistryViewer.createConfig({questions:[], meta:{}}), booklet = config.modules.referenceBooklet;
const bookletAssets = [...new Set([...booklet.sections.map(file => booklet.assetPrefix + file), ...config.headerButtons.map(button => button.open)])];
bookletAssets.forEach(relative => write(path.join(donor, relative), png));
write(path.join(donor, "assets/question.png"), png); write(path.join(donor, "assets/mark.png"), Buffer.concat([png, Buffer.from("mark")]));
fs.mkdirSync(previews, {recursive:true});
const questions = Array.from({length:PARTS}, (_, i) => ({id:"CHEM-" + i, source_part_id:"source-" + i, paper:"2", year:2025, level:"SL", marks:2,
  question_text:"First line\nSecond line", question_images:["assets/question.png"], markscheme_images:["assets/mark.png"]}));
questions[0].paper = "1B"; questions[0].p1b_skill = ["7H1", "7H"];
catalogue(sourcePath, questions);
const donorQuestions = clone(questions); donorQuestions[0].category_code = "7H";
catalogue(path.join(donor, "ppqs.js"), donorQuestions);
const preview = previewAssembly({repositoryRoot:repo, catalogue:sourcePath, legacyRoot:donor, assetsRoot:previews, outputRoot:path.join(fixture, "preview")});
const latestPath = path.join(fixture, "preview/latest.json"), previewCatalogue = path.join(preview.latest.root, "chemistry-catalogue.js");
const verification = {build_id:preview.latest.build_id, release:false, catalogue_sha256:fileHash(sourcePath), parts:PARTS, legacy_ids_retained:PARTS, originals:PARTS, text_only:0,
  issues:{missing:0, remote:0, unsafe:0}, source_fingerprints:RUNTIME.map(([source, target]) => ({source, sha256:fileHash(path.join(repo, source)), assembled_sha256:fileHash(path.join(preview.latest.root, target))}))};
const settings = {authorization:"authorized", authorization_quote:"Publish this synthetic same-bank fixture.", production_url:PRODUCTION_URL,
  catalogue_sha256:fileHash(sourcePath), legacy_catalogue_sha256:fileHash(path.join(donor, "ppqs.js")), exclusion_record:"PRIVATE GOVERNANCE NOTE"};
json(verificationPath, verification); json(settingsPath, settings);
const options = {repositoryRoot:repo, latestPath, verificationPath, settingsPath, outputRoot};
let result;
check("assembles only the unchanged authorised bank with production flags", () => {
  result = assemble(options);
  assert.equal(result.questions.length, PARTS); assert.equal(result.meta.release, true); assert.equal(result.meta.local_preview, false); assert.equal(result.meta.reporting_enabled, true);
  assert.notEqual(result.latest.build_id, preview.latest.build_id);
  assert.deepEqual(result.questions, preview.questions);
  const changed = Object.keys(result.meta).filter(key => result.meta[key] !== preview.meta[key]).sort();
  assert.deepEqual(changed, ["build_id", "local_preview", "release", "reporting_enabled"]);
});
check("public manifest contains relative hashes and no source paths or governance", () => {
  const manifest = fs.readFileSync(path.join(result.latest.public_root, "build-info.json"), "utf8"), data = JSON.parse(manifest);
  assert(!manifest.includes(fixture)); assert(!manifest.includes(settings.authorization_quote)); assert(!manifest.includes("PRIVATE GOVERNANCE NOTE"));
  for (const item of data.assets) { assert(safeRelative(item.path)); assert.equal(fileHash(path.join(result.latest.root, item.path)), item.sha256); }
  assert.equal(path.dirname(result.latest.report), outputRoot); assert(!result.latest.report.startsWith(result.latest.root + path.sep));
});
check("unreferenced reports and files in preview cannot enter the release", () => {
  write(path.join(preview.latest.root, "private-notes.json"), '{"private":"PRIVATE GOVERNANCE NOTE"}');
  write(path.join(preview.latest.root, "assets/private.png"), png);
  const fresh = assemble(options);
  assert(!fs.existsSync(path.join(fresh.latest.public_root, "private-notes.json")));
  assert(!fs.existsSync(path.join(fresh.latest.public_root, "assets/private.png")));
  assert(!fs.existsSync(path.join(fresh.latest.public_root, "latest.json")));
});
check("old ppq.html links preserve query strings and fragments through the exact template", () => {
  const redirect = fs.readFileSync(path.join(result.latest.root, "ppq.html"), "utf8");
  assert.equal(redirect, fs.readFileSync(path.join(repo, "example/chemistry-redirect.html"), "utf8"));
  for (const search of ["?id=CHEM-0", "?preview=1&id=CHEM-1"]) {
    let destination; const box = {window:{location:{search, hash:"#answer", replace:value => { destination = value; }}}};
    for (const match of redirect.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) vm.runInNewContext(match[1], box);
    assert.equal(destination, "ppqviewer/" + search + "#answer");
  }
});
check("stale source or assembled runtime fingerprints fail before latest changes", () => {
  const pointer = fs.readFileSync(path.join(outputRoot, "latest.json"), "utf8");
  for (const file of [path.join(repo, "engine/ppqviewer.js"), path.join(preview.latest.root, "ppqviewer.js")]) withFiles([file], () => {
    fs.appendFileSync(file, "\n// drift\n"); assert.throws(() => assemble(options), /Stale runtime fingerprint/);
  });
  withFiles([verificationPath], () => { json(verificationPath, {...verification, source_fingerprints:verification.source_fingerprints.slice(1)}); assert.throws(() => assemble(options), /seven runtime fingerprints/); });
  assert.equal(fs.readFileSync(path.join(outputRoot, "latest.json"), "utf8"), pointer);
});
check("changed source or donor hashes cannot be approved by a boolean", () => {
  for (const file of [sourcePath, path.join(donor, "ppqs.js")]) withFiles([file], () => { fs.appendFileSync(file, "\n// new content revision\n"); assert.throws(() => assemble(options), /catalogue changed or was not authorized/); });
  for (const changed of [{...settings, authorization:true}, {...settings, authorization_quote:""}, {...settings, catalogue_sha256:""}, {...settings, production_url:"https://example.test/"}]) withFiles([settingsPath], () => {
    json(settingsPath, changed); assert.throws(() => assemble(options), /authorization|hashes|canonical Chemistry/);
  });
});
function changedSource(next, action) {
  withFiles([sourcePath, settingsPath, verificationPath, preview.latest.report], () => {
    catalogue(sourcePath, next); const sha = fileHash(sourcePath);
    json(settingsPath, {...settings, catalogue_sha256:sha}); json(verificationPath, {...verification, catalogue_sha256:sha});
    json(preview.latest.report, {...preview.report, catalogue_sha256:sha}); action();
  });
}
check("widened or replaced question selections fail even with updated source hash records", () => {
  changedSource(questions.concat({...questions[0], id:"NEW-PART"}), () => assert.throws(() => assemble(options), /2465 unique legacy IDs/));
  const changed = clone(questions); changed[0].id = "REPLACEMENT";
  changedSource(changed, () => assert.throws(() => assemble(options), /widens or changes/));
});
check("2026 content is refused even under an existing ID", () => {
  const changed = clone(questions); changed[0].year = 2026;
  changedSource(changed, () => assert.throws(() => assemble(options), /2026 is not authorized/));
});
check("altered preview text and additional metadata fail source equivalence", () => {
  withFiles([previewCatalogue], () => {
    const changed = clone(preview.questions); changed[0].question_text = "Tampered question"; catalogue(previewCatalogue, changed, preview.meta);
    assert.throws(() => assemble(options), /Preview question differs/);
    catalogue(previewCatalogue, preview.questions, {...preview.meta, authorization_quote:"PRIVATE"});
    assert.throws(() => assemble(options), /metadata differs/);
  });
});
check("unsafe public paths and changed image bytes cannot be packaged", () => {
  for (const reference of ["../outside.png", "%2e%2e/private.png", "assets\\private.png", "C:/private.png", "assets/x.png?secret", "assets/./x.png"]) assert.equal(safeRelative(reference), false);
  withFiles([previewCatalogue], () => {
    const changed = clone(preview.questions); changed[0].question_images = ["../private.png"]; catalogue(previewCatalogue, changed, preview.meta);
    assert.throws(() => assemble(options), /Preview question differs/);
  });
  const image = path.join(preview.latest.root, preview.questions[0].question_images[0]);
  withFiles([image], () => { fs.appendFileSync(image, "corrupt"); assert.throws(() => assemble(options), /image hash mismatch/); });
});
check("missing originals, booklet drift and stale build verification are rejected", () => {
  const bookletFile = path.join(preview.latest.root, bookletAssets[0]);
  withFiles([bookletFile], () => { fs.appendFileSync(bookletFile, "drift"); assert.throws(() => assemble(options), /Booklet differs/); });
  withFiles([verificationPath], () => { json(verificationPath, {...verification, build_id:"old"}); assert.throws(() => assemble(options), /Stale preview verification/); });
  const image = path.join(preview.latest.root, preview.questions[0].question_images[0]), bytes = fs.readFileSync(image);
  try { fs.unlinkSync(image); assert.throws(() => assemble(options), /Missing public file/); } finally { fs.writeFileSync(image, bytes); }
});
check("released page reports only on its production route and separates preview progress", () => {
  for (const [url, count] of [[PRODUCTION_URL, 1], [PRODUCTION_URL + "?preview=1", 0], ["http://127.0.0.1:8789/", 0], ["https://physicalsmithness.github.io/chemistrydriller/ppqviewer-copy/", 0]]) {
    const dom = new JSDOM(fs.readFileSync(path.join(result.latest.public_root, "index.html"), "utf8"), {url, runScripts:"outside-only"}), w = dom.window, sent = [];
    try {
      w.fetch = (address, args) => { sent.push(JSON.parse(args.body)); return Promise.resolve({type:"opaque"}); };
      w.localStorage.setItem("smithics_fields_identity_v1", JSON.stringify({anonymous_id:"release-fixture", display_name:"Fixture", signed_in:true,
        contexts:{chemistry:{anonymous_id:"release-fixture", display_name:"Fixture", cohort:"SL"}}}));
      w.CHEMISTRY_META = result.meta; w.CHEMISTRY_QUESTIONS = result.questions.slice(0, 1);
      const q = w.CHEMISTRY_QUESTIONS[0], row = {id:q.id, attempt_id:"new-attempt", learner_id:"release-fixture", marks_max:2, marks_awarded:2};
      let mounted;
      w.ChemistryViewer = {createConfig:opts => ({...opts, idOf:item => item.id, migrate(){}})};
      w.PPQViewer = {mount:(root, opts) => (mounted = {cfg:opts.config, cur:q, byId:{[q.id]:q}, store:{attempts:[row]}, report:opts.report})};
      for (const file of ["subject-identity.js", "ppq-reporting.js", "chemistry-page.js"]) w.eval(fs.readFileSync(path.join(result.latest.public_root, file), "utf8"));
      assert(mounted); mounted.report({status:"answered", item_id:q.id, extra_json:JSON.stringify({attempt_id:row.attempt_id})});
      assert.equal(sent.length, count); assert.equal(mounted.cfg.storageKey, count ? "chemistrydriller_ppq_v2" : "chemistrydriller_ppq_preview_v1");
      if (!count) assert.equal(mounted.cfg.migrate, null);
    } finally { w.close(); }
  }
});
console.log(checks + " chemistry release checks passed. Fixtures retained at " + fixture);
