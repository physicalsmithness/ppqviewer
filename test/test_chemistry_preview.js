/* Asset/assembly/server contract tests. Fixtures are created only under dist;
 * source chemistry and paper-corpus files are never modified. No dependencies. */
"use strict";
const assert = require("node:assert/strict"), fs = require("fs"), path = require("path"), http = require("http"), vm = require("vm");
const {pathToFileURL} = require("url");
const {assemble, resolveAsset, validateBundle, loadCatalogue, parseArgs, hasLocalPathValue, preserveMasteryCategory} = require("../tools/assemble_chemistry_preview");
const {createServer} = require("../tools/serve_chemistry_preview");
const ROOT = path.resolve(__dirname, ".."), fixture = path.join(ROOT, "dist/chemistry-preview-tests", Date.now() + "-" + process.pid);
const legacyRoot = path.join(fixture, "donor"), assetsRoot = path.join(fixture, "previews"), outputRoot = path.join(fixture, "output");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==", "base64");
let checks = 0;
function check(name, action) { action(); checks++; console.log("ok " + name); }
function write(relative, bytes = png) { const file = path.join(fixture, relative); fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, bytes); return file; }
function catalogue(name, records, meta = {asset_layout:"crops_and_pages"}) {
  return write(name, "window.CHEM_META = " + JSON.stringify(meta) + ";\nwindow.CHEM_QUESTIONS = " + JSON.stringify(records) + ";");
}
function request(port, url, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = http.request({hostname:"127.0.0.1", port, path:url, method}, res => {
      const chunks = []; res.on("data", data => chunks.push(data)); res.on("end", () => resolve({status:res.statusCode, body:Buffer.concat(chunks).toString("utf8"), headers:res.headers}));
    }); req.on("error", reject); req.end();
  });
}
async function main() {
  check("preserves the deployed mastery category only when explicitly declared in source skills", () => {
    const item = {id:"OLD-ID", paper:"1B", p1b_skill:["7H1", "7H"]};
    preserveMasteryCategory(item, {id:"OLD-ID", paper:"1B", category_code:"7H"});
    assert.equal(item.category_code, "7H");
    assert.deepEqual(item.p1b_skill, ["7H1", "7H"]);
    assert.throws(() => preserveMasteryCategory({id:"BAD", paper:"1B", p1b_skill:["7H1"]}, {paper:"1B", category_code:"7H"}), /not declared/);
    const authored = {paper:"1B", category_code:"4A", p1b_skill:["4A"]};
    preserveMasteryCategory(authored, {paper:"1B", category_code:"7H"});
    assert.equal(authored.category_code, "4A");
    const otherPaper = {paper:"2", p1b_skill:["7H"]};
    preserveMasteryCategory(otherPaper, {paper:"1B", category_code:"7H"});
    assert.equal(otherPaper.category_code, undefined);
  });
  const adapterBox = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "example/chemistry-config.js"), "utf8"), adapterBox);
  const config = adapterBox.window.ChemistryViewer.createConfig({questions:[], meta:{release:false}}), booklet = config.modules.referenceBooklet;
  [...new Set([...booklet.sections.map(file => booklet.assetPrefix + file), ...config.headerButtons.map(button => button.open)])].forEach(file => write("donor/" + file));
  const crop = write("previews/paper/crops/question_q1.png");
  write("previews/paper/crops/question_q1_duplicate.png");
  write("previews/paper/crops/mark_q1.png", Buffer.concat([png, Buffer.from("mark")]));
  write("previews/paper/pages/question_p001.png", Buffer.concat([png, Buffer.from("context1")]));
  write("previews/paper/pages/question_p002.png", Buffer.concat([png, Buffer.from("context2")]));
  write("previews/paper/pages/mark_p001.png", Buffer.concat([png, Buffer.from("markpage")]));
  const source = catalogue("canonical.js", [{id:"PARENT", preview:"paper", paper:"2", level:"SL", stem_text:"Opening passage\nSecond paragraph", stem_pages:["question_p001.png"], parts:[
    {part_id:"25M.2.SL.TZ3.1 (a)(whole)", legacy_id:"25M.2.SL.TZ3.1 (a)", label:"(a)", text:"First line\nSecond line", lead_in:"Group introduction", marks:2, crops:["question_q1.png", "question_q1_duplicate.png"], context_pages:["question_p002.png"], ms_crops:["mark_q1.png"], ms_pages_this_question:["mark_p001.png"]},
    {part_id:"25M.2.SL.TZ3.1 (b)", label:"(b)", text:"Use the table on the next page.", marks:3, crops:["question_missing.png"], context_pages:["question_p002.png"]}
  ]}, {id:"TEXT-ONLY", paper:"2", question_text:"Keep this question visible. \\mathrm{H_2O} \\rightarrow \\ce{H+}", marks:"2", question_images:["https://example.invalid/question.png", "../secret.png", "javascript:alert(1)", "assets/no-such.png"]}],
  {asset_layout:"crops_and_pages", release:true, reporting_enabled:true, paper_reports:{paper:{comment:"Source-grounded note", source:"C:\\Private\\source.pdf", another:"file:///C:/Private/source.pdf"}}});
  const result = assemble({catalogue:source, legacyRoot, assetsRoot, outputRoot});
  check("preserves exact published IDs and separated multiline text", () => {
    assert.deepEqual(result.questions.map(q => q.id), ["25M.2.SL.TZ3.1 (a)", "25M.2.SL.TZ3.1 (b)", "TEXT-ONLY"]);
    assert.equal(result.questions[0].stem_text, "Opening passage\nSecond paragraph");
    assert.equal(result.questions[0].question_text, "First line\nSecond line");
    assert.equal(result.questions[0].lead_in, "Group introduction");
    assert.equal(result.questions[0].parent_id, "PARENT");
  });
  check("bundles the part and both explicit context pages, and deduplicates by content", () => {
    assert.equal(result.questions[0].question_images.length, 1);
    assert.equal(result.questions[0].context_images.length, 2);
    assert.equal(result.questions[0].markscheme_images.length, 2);
    assert.equal(result.report.unique_question_assets, 5);
    assert.ok(result.report.copied_assets.every(asset => /^assets\/questions\/[a-f\d]{64}\.png$/.test(asset.target)));
  });
  check("legacy alias retains canonical provenance and resolves the original part images", () => {
    assert.equal(result.questions[0].legacy_id, "25M.2.SL.TZ3.1 (a)");
    assert.equal(result.questions[0].part_id, "25M.2.SL.TZ3.1 (a)(whole)");
    assert.equal(result.questions[0].id, result.questions[0].legacy_id);
    assert.equal(result.questions[0].question_images.length, 1);
    assert.equal(result.questions[0].markscheme_images.length, 2);
  });
  check("keeps text-only rows and records missing, unsafe and remote asset failures", () => {
    assert.equal(result.questions.length, 3); assert.equal(result.report.text_only, 1);
    assert.equal(result.questions[2].marks, 2); assert.equal(result.questions[2].original_status, "missing");
    assert.deepEqual(result.report.issue_counts, {missing:2, remote:1, unsafe:2});
  });
  check("served catalogue strips all local paths and disables release and reporting", () => {
    const text = fs.readFileSync(path.join(result.latest.root, "chemistry-catalogue.js"), "utf8");
    assert.equal(hasLocalPathValue({meta:result.meta, questions:result.questions}), false); assert.equal(text.includes(fixture), false);
    assert.ok(result.questions[2].question_text.includes("\\mathrm{H_2O} \\rightarrow \\ce{H+}"));
    assert.equal(result.meta.release, false); assert.equal(result.meta.reporting_enabled, false);
    assert.deepEqual(result.meta.paper_reports, {paper:{comment:"Source-grounded note"}});
    assert.equal(path.dirname(result.latest.report), outputRoot);
    assert.ok(!result.latest.report.startsWith(result.latest.root + path.sep));
  });
  check("every bundled image reference exists; missing/traversing paths fail verification", () => {
    assert.ok(validateBundle(result.latest.root, result.questions, []) >= 5);
    assert.throws(() => validateBundle(result.latest.root, [{question_images:["assets/absent.png"], context_images:[], markscheme_images:[]}], []), /Missing bundled reference/);
    assert.throws(() => validateBundle(result.latest.root, [{question_images:["../outside.png"], context_images:[], markscheme_images:[]}], []), /Unsafe bundled reference/);
  });
  const settings = {legacyRoot, assetsRoot, assetLayout:"crops_and_pages"};
  check("rejects canonical traversal, kind confusion, undeclared layouts and external files", () => {
    assert.equal(resolveAsset("question_q1.png", settings, "question_images", "../paper", "crops").error, "unsafe");
    assert.equal(resolveAsset("mark_q1.png", settings, "question_images", "paper", "crops").error, "unsafe");
    assert.equal(resolveAsset("question_q1.png", {...settings, assetLayout:null}, "question_images", "paper", "crops").error, "unsafe");
    assert.equal(resolveAsset(pathToFileURL(path.join(ROOT, "outside.png")).href, settings, "question_images").error, "unsafe");
    assert.equal(resolveAsset("%2e%2e/secret.png", settings, "question_images").error, "unsafe");
    assert.equal(resolveAsset("data:image/png;base64,AAAA", settings, "question_images").error, "unsafe");
  });
  check("supports explicit flat asset layouts", () => {
    const flat = write("previews/flat/question_q1.png");
    assert.equal(resolveAsset("question_q1.png", {...settings, assetLayout:"flat"}, "question_images", "flat", "crops").file, fs.realpathSync(flat));
  });
  const legacySource = write("legacy.js", "window.CHEM_PPQS = " + JSON.stringify([{id:"CANONICAL-FLAT", legacy_id:"ORIGINAL-ID", paper:"1A", marks:"1", question_text:"Original prompt", crop_url:pathToFileURL(crop).href, page_url:"assets/original.png", answer_url:"assets/answer.png"}]) + ";");
  write("donor/assets/original.png", Buffer.concat([png, Buffer.from("page")])); write("donor/assets/answer.png", Buffer.concat([png, Buffer.from("answer")]));
  const legacy = assemble({catalogue:legacySource, legacyRoot, assetsRoot, outputRoot});
  check("legacy file URLs and donor-relative page/answer assets are copied safely", () => {
    assert.equal(legacy.questions[0].id, "ORIGINAL-ID");
    for (const role of ["question_images", "context_images", "markscheme_images"]) assert.equal(legacy.questions[0][role].length, 1);
    assert.equal(legacy.report.issues.length, 0);
    assert.equal(legacy.questions[0].crop_url, undefined);
  });
  check("restricted catalogue VM has no process, require or dynamic code generation", () => {
    assert.throws(() => loadCatalogue(write("bad.js", "window.CHEM_PPQS = require('fs');")), /require is not defined/);
    assert.throws(() => loadCatalogue(write("bad-dynamic.js", "window.CHEM_PPQS = Function('return process')();")), /Code generation from strings disallowed/);
  });
  check("failed assembly leaves the last successful build pointer untouched", () => {
    const pointer = fs.readFileSync(path.join(outputRoot, "latest.json"), "utf8");
    const invalid = catalogue("duplicate.js", [{id:"DUPLICATE"}, {id:"DUPLICATE"}]);
    assert.throws(() => assemble({catalogue:invalid, legacyRoot, assetsRoot, outputRoot}), /Duplicate chemistry question ID/);
    assert.equal(fs.readFileSync(path.join(outputRoot, "latest.json"), "utf8"), pointer);
    assert.throws(() => parseArgs(["--release"]), /preview-only/);
    assert.throws(() => assemble({release:true}), /local preview/);
  });
  const server = createServer(outputRoot);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const port = server.address().port;
    const index = await request(port, "/"), data = await request(port, "/chemistry-catalogue.js"), image = await request(port, "/" + legacy.questions[0].question_images[0]);
    check("loopback server serves only the current successful build", () => {
      assert.equal(server.address().address, "127.0.0.1"); assert.equal(index.status, 200); assert.equal(image.status, 200);
      assert.equal(data.status, 200); assert.ok(data.body.includes("ORIGINAL-ID")); assert.ok(!data.body.includes("TEXT-ONLY"));
      assert.equal(data.headers["cache-control"], "no-store");
    });
    const imageHead = await request(port, "/" + legacy.questions[0].question_images[0], "HEAD");
    const namedImage = await request(port, "/assets/07_periodic-table.png"), script = await request(port, "/chemistry-page.js");
    check("only content-addressed images are cached for next-question preloading", () => {
      assert.equal(image.headers["cache-control"], "private, max-age=31536000, immutable");
      assert.equal(imageHead.headers["cache-control"], image.headers["cache-control"]);
      assert.equal(imageHead.body, "");
      for (const response of [index, data, namedImage, script]) {
        assert.equal(response.status, 200); assert.equal(response.headers["cache-control"], "no-store");
      }
    });
    for (const [url, status] of [["/%2e%2e/source.js", 403], ["/..%5csource.js", 403], ["/%zz", 400], ["/latest.json", 403], ["/" + path.basename(result.latest.root) + "/index.html", 404], ["/" + path.basename(result.latest.report), 403]]) {
      const response = await request(port, url); check("server blocks " + url, () => assert.equal(response.status, status));
    }
    const post = await request(port, "/", "POST"); check("server refuses write methods", () => assert.equal(post.status, 405));
    const pointer = fs.readFileSync(path.join(outputRoot, "latest.json"), "utf8");
    fs.writeFileSync(path.join(outputRoot, "latest.json"), JSON.stringify({...legacy.latest, release:true}));
    const released = await request(port, "/"); check("server refuses any pointer marked as a release", () => assert.equal(released.status, 503));
    fs.writeFileSync(path.join(outputRoot, "latest.json"), pointer);
  } finally { await new Promise(resolve => server.close(resolve)); }
  console.log(checks + " chemistry preview checks passed. Fixtures retained at " + fixture);
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
