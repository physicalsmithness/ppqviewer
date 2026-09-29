/* Serves only the latest successful chemistry preview, bound to loopback. */
"use strict";
const fs = require("fs"), http = require("http"), path = require("path");
const {inside} = require("./assemble_chemistry_preview");
const HOME = path.resolve(__dirname, "../dist/chemistry-preview");
const MIME = {".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8",
  ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".gif":"image/gif", ".pdf":"application/pdf"};
function createServer(home = HOME) {
  home = path.resolve(home);
  return http.createServer((req, res) => {
    try {
      if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405, {Allow:"GET, HEAD"}).end(); return; }
      const info = JSON.parse(fs.readFileSync(path.join(home, "latest.json"), "utf8")), root = path.resolve(info.root);
      if (info.release !== false || !inside(home, root) || path.dirname(root) !== home || !inside(fs.realpathSync(home), fs.realpathSync(root))) throw new Error("Invalid preview root");
      const raw = decodeURIComponent((req.url || "/").split("?")[0]);
      if (raw.includes("\\") || raw.includes("\0") || raw.split("/").some(piece => piece === ".." || piece === ".")) { res.writeHead(403).end("Forbidden"); return; }
      const relative = (raw.endsWith("/") ? raw + "index.html" : raw).replace(/^\/+/, ""), file = path.resolve(root, relative);
      if (!inside(root, file) || !MIME[path.extname(file).toLowerCase()]) { res.writeHead(403).end("Forbidden"); return; }
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end("Not found"); return; }
      if (!inside(fs.realpathSync(root), fs.realpathSync(file))) { res.writeHead(403).end("Forbidden"); return; }
      // Only assembler-generated content hashes are immutable across builds.
      // Caching these lets the engine's image preloads survive navigation;
      // catalogue, wrapper and named booklet assets must always stay fresh.
      const immutableImage = /^assets\/questions\/[a-f0-9]{64}\.(?:png|jpe?g|webp|gif)$/.test(relative);
      res.writeHead(200, {"Content-Type":MIME[path.extname(file).toLowerCase()],
        "Cache-Control":immutableImage ? "private, max-age=31536000, immutable" : "no-store", "X-Content-Type-Options":"nosniff"});
      if (req.method === "HEAD") res.end(); else fs.createReadStream(file).pipe(res);
    } catch (error) { res.writeHead(error instanceof URIError ? 400 : 503).end("Build the chemistry preview first."); }
  });
}
if (require.main === module) {
  const args = process.argv.slice(2), port = args.length ? Number(args[1]) : 8791;
  if ((args.length && (args.length !== 2 || args[0] !== "--port")) || !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Usage: node tools/serve_chemistry_preview.js [--port 8791]"); process.exitCode = 1;
  } else {
    const server = createServer();
    server.on("error", error => { console.error(error.code === "EADDRINUSE" ? "Preview port is already in use; choose another --port." : error.message); process.exitCode = 1; });
    server.listen(port, "127.0.0.1", () => console.log("Chemistry preview: http://127.0.0.1:" + port + "/"));
  }
}
module.exports = {createServer};
