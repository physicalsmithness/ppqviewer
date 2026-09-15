/* Local-only physics preview. Serves the latest successful assembly and no
   source corpus, test evidence, obsolete build or arbitrary workspace file. */
"use strict";
const fs = require("fs"), http = require("http"), path = require("path");
const release = process.argv.includes("--ib-release");
const home = path.resolve(__dirname,release ? "../dist/ibphysics-release" : "../dist/physics-preview");
const at = process.argv.indexOf("--port");
const port = at >= 0 ? Number(process.argv[at+1]) : 8788;
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".json":"application/json; charset=utf-8"};
function inside(root,file) { const rel=path.relative(root,file); return rel && !rel.startsWith("..") && !path.isAbsolute(rel); }
const server=http.createServer((req,res)=> {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const info=JSON.parse(fs.readFileSync(path.join(home,"latest.json"),"utf8"));
    const root=path.resolve(info.root);
    if (!inside(home,root)) throw new Error("Invalid build root");
    const urlPath=decodeURIComponent((req.url||"/").split("?")[0]);
    const relative=urlPath.endsWith("/") ? urlPath+"index.html" : urlPath;
    const file=path.resolve(root,relative.replace(/^\/+/,""));
    if (!inside(root,file) || !mime[path.extname(file)]) {res.writeHead(403).end("Forbidden"); return;}
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end("Not found"); return;}
    res.writeHead(200,{"Content-Type":mime[path.extname(file)],"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    if(req.method==='HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  } catch(error) { res.writeHead(error instanceof URIError ? 400 : 503).end("Build the physics preview first."); }
});
server.on("error",error=> {console.error(error.code==='EADDRINUSE' ? "This preview port is already in use. Open the existing preview, or choose --port with another number." : error.message);process.exitCode=1;});
server.listen(port,"127.0.0.1",()=>console.log(`${release ? "IB release check" : "Physics preview"}: http://127.0.0.1:${port}/`));
