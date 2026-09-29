/* Local production-package check. The wrapper disables reporting and analytics
 * on loopback; private build reports are outside the served directory. */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const {inside} = require("./assemble_chemistry_preview");
const HOME = path.resolve(__dirname, "../dist/chemistry-release");
const MIME = {".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".png":"image/png",
  ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".gif":"image/gif", ".webp":"image/webp", ".pdf":"application/pdf", ".json":"application/json"};
http.createServer((req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {res.writeHead(405).end(); return;}
    const info = JSON.parse(fs.readFileSync(path.join(HOME, "latest.json"), "utf8")), root = path.resolve(info.root);
    if (info.release !== true || !inside(HOME, root) || !inside(fs.realpathSync(HOME), fs.realpathSync(root))) throw Error("Invalid release root");
    const raw = decodeURIComponent(req.url.split("?")[0]);
    if (!raw.startsWith("/chemistrydriller/") || raw.includes("\\") || raw.includes("\0") || raw.split("/").some(p => p === "." || p === "..")) {res.writeHead(403).end(); return;}
    const relative = raw.slice("/chemistrydriller/".length) + (raw.endsWith("/") ? "index.html" : "");
    const file = path.resolve(root, relative), mime = MIME[path.extname(file)];
    if (!mime || !inside(root, file) || !(relative === "ppq.html" || relative.startsWith("ppqviewer/"))) {res.writeHead(403).end(); return;}
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end(); return;}
    if (!inside(fs.realpathSync(root), fs.realpathSync(file))) {res.writeHead(403).end(); return;}
    res.writeHead(200, {"Content-Type":mime, "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff"});
    if (req.method === "HEAD") res.end(); else fs.createReadStream(file).pipe(res);
  } catch (_) {res.writeHead(503).end("Build the release first.");}
}).listen(8792, "127.0.0.1", () => console.log("Release check: http://127.0.0.1:8792/chemistrydriller/ppq.html?preview"));
