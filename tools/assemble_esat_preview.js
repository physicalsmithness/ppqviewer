/* Dependency-free LOCAL-ONLY ESAT preview assembler. It never writes to a
   public/deployment directory. The required --out directory must not exist. */
"use strict";
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function arg(name, fallback) {
  const at = process.argv.indexOf(name);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
}
function mustExist(file, label) { if (!fs.existsSync(file)) throw new Error(label + " not found: " + file); }
function hash12(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 12); }
function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}
function replaceRequired(text, oldValue, newValue) {
  if (!text.includes(oldValue)) throw new Error("Wrapper contract changed; missing: " + oldValue);
  return text.split(oldValue).join(newValue);
}

const projectRoot = path.resolve(__dirname, "..");
const out = arg("--out", "");
if (!out) throw new Error("--out is required");
const outRoot = path.resolve(out);
if (fs.existsSync(outRoot)) throw new Error("--out must not already exist: " + outRoot);
const paperRoot = arg("--paper-root", "C:\\CodexProjects\\PaperDatabases");
const esatRoot = arg("--esat-root", "C:\\Claude (not on Gdrive, nor OneDrive)\\ESAT Prep App");
const assetRoot = path.resolve(arg("--asset-root",
  "C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer\\deploy\\esatwallop"));
const analysisRoot = path.join(paperRoot, "Esat Categorisation", "analysis_v2");
const source = {
  viewerJs: path.join(projectRoot, "engine", "ppqviewer.js"),
  viewerCss: path.join(projectRoot, "engine", "ppqviewer.css"),
  html: path.join(projectRoot, "example", "esat-compare.html"),
  login: path.join(projectRoot, "example", "ppq-login.js"),
  catalogue: path.join(esatRoot, "app", "data", "esat_catalogue.js"),
  analysis: path.join(analysisRoot, "dist", "esat_analysis_v2.js"),
  classification: path.join(analysisRoot, "dist", "esat_classification.js"),
  legacy: path.join(assetRoot, "data", "analysis"),
  crops: path.join(assetRoot, "assets", "crops")
};
Object.keys(source).forEach((key) => mustExist(source[key], key));

fs.mkdirSync(outRoot, { recursive: false });
fs.cpSync(source.legacy, path.join(outRoot, "data", "analysis"), { recursive: true });
fs.cpSync(source.crops, path.join(outRoot, "assets", "crops"), { recursive: true });
copyFile(source.viewerJs, path.join(outRoot, "engine", "ppqviewer.js"));
copyFile(source.viewerCss, path.join(outRoot, "engine", "ppqviewer.css"));
copyFile(source.login, path.join(outRoot, "ppq-login.js"));
copyFile(source.catalogue, path.join(outRoot, "data", "esat_catalogue.js"));
copyFile(source.analysis, path.join(outRoot, "data", "esat_analysis_v2.js"));
copyFile(source.classification, path.join(outRoot, "data", "esat_classification.js"));

const hashes = {
  engine: hash12(source.viewerJs), css: hash12(source.viewerCss), analysis: hash12(source.analysis),
  classification: hash12(source.classification), catalogue: hash12(source.catalogue),
  login: hash12(source.login), wrapper: hash12(source.html)
};
const buildId = hashes.engine.slice(0, 4) + hashes.analysis.slice(0, 4) +
  hashes.classification.slice(0, 4) + hashes.wrapper.slice(0, 4);
let html = fs.readFileSync(source.html, "utf8");
[
  ['href="../engine/ppqviewer.css"', 'href="engine/ppqviewer.css?v=' + hashes.css + '"'],
  ['src="../../ESAT Prep App/app/data/esat_catalogue.js"', 'src="data/esat_catalogue.js?v=' + hashes.catalogue + '"'],
  ['src="../../ESAT Prep App/data/analysis/', 'src="data/analysis/'],
  ['src="../../../CodexProjects/PaperDatabases/Esat Categorisation/analysis_v2/dist/esat_analysis_v2.js"',
    'src="data/esat_analysis_v2.js?v=' + hashes.analysis + '"'],
  ['src="../../../CodexProjects/PaperDatabases/Esat Categorisation/analysis_v2/dist/esat_classification.js"',
    'src="data/esat_classification.js?v=' + hashes.classification + '"'],
  ['src="../engine/ppqviewer.js"', 'src="engine/ppqviewer.js?v=' + hashes.engine + '"'],
  ['src="ppq-login.js"', 'src="ppq-login.js?v=' + hashes.login + '"'],
  ['var ESAT_BASE = "file:///C:/Claude (not on Gdrive, nor OneDrive)/ESAT Prep App/app/";', 'var ESAT_BASE = "";'],
  ['appVersion: "ppqviewer-esat-compare"', 'appVersion: "ppqviewer-esat-compare-' + buildId + '"']
].forEach((pair) => { html = replaceRequired(html, pair[0], pair[1]); });
html = html.replace(/src="data\/analysis\/([^"]+\.js)"/g, 'src="data/analysis/$1?v=' + buildId + '"');
html = html.replace(/<!doctype html>/i,
  '<!-- GENERATED LOCAL-ONLY ESAT PREVIEW; build ' + buildId + '; do not publish. -->\n<!doctype html>');
html = html.replace("<head>", '<head>\n  <meta name="ppq-build" content="' + buildId + '">\n' +
  '  <meta name="ppq-source-html" content="' + hashes.wrapper + '">\n' +
  '  <meta name="ppq-maintainer" content="Codex">');
const indexPath = path.join(outRoot, "index.html");
fs.writeFileSync(indexPath, html, "utf8");
fs.writeFileSync(path.join(outRoot, ".nojekyll"), "", "utf8");
const indexHash = hash12(indexPath);
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(source.analysis, "utf8"), sandbox, { filename: source.analysis });
vm.runInNewContext(fs.readFileSync(source.classification, "utf8"), sandbox, { filename: source.classification });
const analysis = sandbox.window.ESAT_ANALYSIS_V2 || {};
const classification = sandbox.window.ESAT_CLASSIFICATION || {};
const buildInfo = {
  build_id: buildId,
  built_at_utc: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  maintainer: "Codex", preview_only: true,
  analysis_records: (analysis.records || []).length,
  classified_questions: Number(classification.question_count || 0),
  engine_sha256_12: hashes.engine, css_sha256_12: hashes.css,
  analysis_sha256_12: hashes.analysis, classification_sha256_12: hashes.classification,
  catalogue_sha256_12: hashes.catalogue, login_sha256_12: hashes.login,
  source_html_sha256_12: hashes.wrapper, index_sha256_12: indexHash,
  source_analysis: "PaperDatabases/Esat Categorisation/analysis_v2"
};
fs.writeFileSync(path.join(outRoot, "build-info.json"), JSON.stringify(buildInfo, null, 2) + "\n", "utf8");
console.log("Local-only preview assembled: " + outRoot);
console.log("Build: " + buildId);
console.log("Analysis records: " + buildInfo.analysis_records);
console.log("Classifications: " + buildInfo.classified_questions);
