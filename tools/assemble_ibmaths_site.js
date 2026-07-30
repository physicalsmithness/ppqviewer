/* Assemble the deployable IB Maths site into deploy\ibmathsdriller.

   - index.html: example\ibmaths.html with deploy path rewrites, the teacher-only
     strip removed, and the estate GA4 + Clarity blocks injected (WEB_KIT).
   - engine/ppqviewer.js + .css, data/maths_catalogue.js: exact copies.
   - assets/previews/...: every crop/ms-crop the catalogue references, copied
     incrementally (size-match skip). Chunked so it can resume:
       node assemble_ibmaths_site.js            (site files + first chunk)
       node assemble_ibmaths_site.js assets     (keep running until "assets complete")
   - build-info.json when assets are complete.

   Copies only; never deletes, never touches git. Claude, 2026-07-29. */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const PAPERDB = process.env.IBMATHS_PAPERDB_ROOT || "C:\\CodexProjects\\PaperDatabases";
const CATALOGUE = path.join(PAPERDB, "Maths Categorisation", "viewer", "maths_catalogue.js");
const PREVIEWS = path.join(PAPERDB, "outputs", "previews");
const DEPLOY = process.env.IBMATHS_DEPLOY_ROOT || path.join(PROJECT_ROOT, "deploy", "ibmathsdriller");
const WRAPPER = path.join(PROJECT_ROOT, "example", "ibmaths.html");
const ENGINE_JS = path.join(PROJECT_ROOT, "engine", "ppqviewer.js");
const ENGINE_CSS = path.join(PROJECT_ROOT, "engine", "ppqviewer.css");
const CHUNK = parseInt(process.env.IBMATHS_COPY_CHUNK || "2600", 10);

const GA_BLOCK = [
  '  <!-- GA4 — estate standard (WEB_KIT) -->',
  '  <script async src="https://www.googletagmanager.com/gtag/js?id=G-WKYGJYERSR"></script>',
  '  <script>',
  '    window.dataLayer = window.dataLayer || [];',
  '    function gtag(){dataLayer.push(arguments);}',
  "    gtag('js', new Date());",
  "    gtag('config', 'G-WKYGJYERSR');",
  '  </script>',
  '  <!-- Microsoft Clarity — estate standard (WEB_KIT) -->',
  '  <script type="text/javascript">',
  '  (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","xdr2tsc688");',
  '  </script>'
].join("\n");

function must(cond, msg) { if (!cond) { console.error("FAIL: " + msg); process.exit(1); } }
function replaceOnce(s, from, to, label) {
  const i = s.indexOf(from);
  must(i >= 0, "rewrite not found: " + label);
  must(s.indexOf(from, i + 1) < 0, "rewrite ambiguous: " + label);
  return s.slice(0, i) + to + s.slice(i + from.length);
}
function sha12(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 12);
}

// ---- site files ------------------------------------------------------------
/* Guard BOTH phases: a git worktree or partial copy of ppqviewer has no
   deploy checkout (deploy\ is gitignored), and 2026-07-30 one such copy ran
   the assets phase anyway, filling ~700MB of junk and then crashing on the
   never-written index.html. Fail loud, name the real folder. */
must(fs.existsSync(path.join(DEPLOY, ".git")),
  "deploy checkout missing at " + DEPLOY +
  "\n      This copy of ppqviewer has no deploy checkout (worktree or partial copy?)." +
  "\n      Run from the real project: C:\\Claude (not on Gdrive, nor OneDrive)\\ppqviewer");
const assetsOnly = process.argv[2] === "assets";
if (!assetsOnly) {
  let html = fs.readFileSync(WRAPPER, "utf8");
  [["<!-- PPQ-SYNC:TEACHER-ONLY-START (removed from the deployed copy) -->", "<!-- PPQ-SYNC:TEACHER-ONLY-END -->"],
   ["<!-- PPQ-SYNC:LOCAL-NOTE-START (removed from the deployed copy) -->", "<!-- PPQ-SYNC:LOCAL-NOTE-END -->"]].forEach(function (pair) {
    const si = html.indexOf(pair[0]), ei = html.indexOf(pair[1]);
    must(si >= 0 && ei > si, "strip markers: " + pair[0]);
    html = html.slice(0, si) + html.slice(ei + pair[1].length);
  });
  html = replaceOnce(html, "<!-- PPQ-SYNC:HEAD (the sync injects the estate GA4 + Clarity blocks here on deploy) -->", GA_BLOCK, "GA inject");
  html = replaceOnce(html, '<link rel="stylesheet" href="../engine/ppqviewer.css">', '<link rel="stylesheet" href="engine/ppqviewer.css">', "css path");
  html = replaceOnce(html, '<script src="../../../CodexProjects/PaperDatabases/Maths Categorisation/viewer/maths_catalogue.js"></script>', '<script src="data/maths_catalogue.js"></script>', "catalogue path");
  html = replaceOnce(html, '<script src="ibmaths_spine_labels.js"></script>', '<script src="data/ibmaths_spine_labels.js"></script>', "spine labels path");
  html = replaceOnce(html, '<script src="../engine/ppqviewer.js"></script>', '<script src="engine/ppqviewer.js"></script>', "engine path");
  html = replaceOnce(html, 'var BASE = "file:///C:/CodexProjects/PaperDatabases/outputs/previews/";', 'var BASE = "assets/previews/";', "asset base");
  html = replaceOnce(html, "<title>IB Maths driller — teacher preview</title>", "<title>IB Maths driller</title>", "title");
  html = replaceOnce(html, 'versionLabel: "ibmaths v0.2.0 (teacher preview) · engine "', 'versionLabel: "ibmaths v0.2.0 · engine "', "versionLabel");
  html = replaceOnce(html, 'appVersion: "ibmaths-teacher-preview"', 'appVersion: "ibmaths-live"', "appVersion");
  html = replaceOnce(html, 'learnerId: "teacher-preview"', 'learnerId: "local"', "learnerId");
  must(/<\/html>\s*$/.test(html), "index ends with </html>");
  fs.mkdirSync(path.join(DEPLOY, "engine"), { recursive: true });
  fs.mkdirSync(path.join(DEPLOY, "data"), { recursive: true });
  fs.writeFileSync(path.join(DEPLOY, "index.html"), html, "utf8");
  fs.copyFileSync(ENGINE_JS, path.join(DEPLOY, "engine", "ppqviewer.js"));
  fs.copyFileSync(ENGINE_CSS, path.join(DEPLOY, "engine", "ppqviewer.css"));
  fs.copyFileSync(CATALOGUE, path.join(DEPLOY, "data", "maths_catalogue.js"));
  fs.copyFileSync(path.join(PROJECT_ROOT, "example", "ibmaths_spine_labels.js"), path.join(DEPLOY, "data", "ibmaths_spine_labels.js"));
  console.log("site files assembled (index.html rewritten: teacher strip out, GA in, relative paths)");
}

// ---- assets (chunked, resumable) ------------------------------------------
const vm = require("vm");
const cctx = { window: {} };
vm.createContext(cctx);
vm.runInContext(fs.readFileSync(CATALOGUE, "utf8"), cctx);
/* d014 (q12 resolved, publish approved): the deployed site now ships the
   COMPLETE markscheme pages too — cropped markschemes can truncate working
   (VF-15), so ms_pages back the engine's full-pages expander. ms_pages repeat
   per question across a paper, so refs are deduped before copying
   (~41k refs → ~4.3k unique pages, ≈334MB alongside ≈340MB of crops). */
const seen = Object.create(null);
const refs = [];
function addRef(rel) { if (!seen[rel]) { seen[rel] = 1; refs.push(rel); } }
(cctx.window.MATHS_PPQS || []).forEach(function (q) {
  (q.parts || []).forEach(function (p) {
    (p.crops || []).concat(p.ms_crops || []).forEach(function (c) {
      addRef(q.preview + "/" + c);
    });
  });
  (q.ms_pages || []).forEach(function (c) { addRef(q.preview + "/" + c); });
});
let copied = 0, skipped = 0, missing = 0;
const BUDGET_MS = parseInt(process.env.IBMATHS_COPY_BUDGET_MS || "0", 10); /* 0 = no time budget (host runs) */
const t0 = Date.now();
for (let i = 0; i < refs.length; i++) {
  const rel = refs[i];
  const src = path.join(PREVIEWS, rel);
  const dst = path.join(DEPLOY, "assets", "previews", rel);
  let srcStat = null;
  try { srcStat = fs.statSync(src); } catch (e) { missing++; continue; }
  let dstStat = null;
  try { dstStat = fs.statSync(dst); } catch (e) { dstStat = null; }
  if (dstStat && dstStat.size === srcStat.size) { skipped++; continue; }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied++;
  if ((copied >= CHUNK) || (BUDGET_MS && (i % 200 === 0 || copied % 25 === 0) && Date.now() - t0 > BUDGET_MS)) {
    console.log("chunk done: copied " + copied + ", already-present " + skipped + ", missing " + missing +
      ", remaining ~" + (refs.length - i - 1) + " — run again: node tools/assemble_ibmaths_site.js assets");
    process.exit(2);
  }
}
console.log("assets complete: copied " + copied + ", already-present " + skipped + ", missing " + missing + " of " + refs.length + " referenced");
const info = {
  build_id: sha12(path.join(DEPLOY, "index.html")) ,
  built_at_utc: new Date().toISOString(),
  maintainer: "Claude",
  questions: (cctx.window.MATHS_PPQS || []).length,
  engine_sha256_12: sha12(path.join(DEPLOY, "engine", "ppqviewer.js")),
  css_sha256_12: sha12(path.join(DEPLOY, "engine", "ppqviewer.css")),
  catalogue_sha256_12: sha12(path.join(DEPLOY, "data", "maths_catalogue.js")),
  index_sha256_12: sha12(path.join(DEPLOY, "index.html")),
  asset_files: refs.length - missing,
  source_catalogue: "PaperDatabases/Maths Categorisation/viewer/maths_catalogue.js"
};
fs.writeFileSync(path.join(DEPLOY, "build-info.json"), JSON.stringify(info, null, 2), "utf8");
console.log("build-info.json written: " + info.build_id);
