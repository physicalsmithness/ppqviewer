/* Read-only exact identity check for a local ESAT preview assembly. */
"use strict";
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
function arg(name, fallback) {
  const at = process.argv.indexOf(name);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
}
function hash12(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 12); }
const root = path.resolve(arg("--root", ""));
if (!arg("--root", "")) throw new Error("--root is required");
const infoFile = path.join(root, "build-info.json");
const indexFile = path.join(root, "index.html");
if (!fs.existsSync(infoFile) || !fs.existsSync(indexFile)) throw new Error("preview is incomplete: " + root);
const info = JSON.parse(fs.readFileSync(infoFile, "utf8"));
const checks = [
  [info.preview_only === true, "assembly is explicitly preview-only"],
  [info.analysis_records === 720, "analysis record count is 720"],
  [info.classified_questions === 738, "classification count is 738"],
  [hash12(indexFile) === info.index_sha256_12, "index hash matches build-info"],
  [hash12(path.join(root, "engine", "ppqviewer.js")) === info.engine_sha256_12, "engine hash matches"],
  [hash12(path.join(root, "engine", "ppqviewer.css")) === info.css_sha256_12, "CSS hash matches"],
  [hash12(path.join(root, "data", "esat_analysis_v2.js")) === info.analysis_sha256_12, "analysis hash matches"],
  [hash12(path.join(root, "data", "esat_classification.js")) === info.classification_sha256_12, "classification hash matches"],
  [hash12(path.join(root, "data", "esat_catalogue.js")) === info.catalogue_sha256_12, "catalogue hash matches"]
];
const html = fs.readFileSync(indexFile, "utf8");
checks.push([html.indexOf('name="ppq-build" content="' + info.build_id + '"') >= 0, "index embeds build id"]);
checks.push([html.indexOf('name="ppq-source-html" content="' + info.source_html_sha256_12 + '"') >= 0,
  "index embeds canonical wrapper identity"]);
const missing = [];
Array.from(html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)).forEach((match) => {
  if (/^(?:https?:|data:|#)/i.test(match[1])) return;
  const file = path.resolve(root, match[1]);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) missing.push(match[1]);
});
checks.push([missing.length === 0, "every local script, stylesheet and asset entry exists"]);
let failed = 0;
checks.forEach((check) => {
  console.log((check[0] ? "PASS " : "FAIL ") + check[1]);
  if (!check[0]) failed++;
});
if (missing.length) console.log("Missing: " + missing.join(", "));
console.log("Build " + info.build_id + ": " + (checks.length - failed) + " passed, " + failed + " failed");
process.exitCode = failed ? 1 : 0;
