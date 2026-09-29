/* First Chemistry shared-viewer migration. Copies only the reviewed consumer
 * folder and legacy-route redirect. No deletions, commits, or pushes. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), {execFileSync} = require("child_process");
const {isDeepStrictEqual} = require("util");
const {inside} = require("./assemble_chemistry_preview");
const {safeRelative, PRODUCTION_URL} = require("./assemble_chemistry_release");
const ROOT = path.resolve(__dirname, ".."), HOME = path.join(ROOT, "dist/chemistry-release");
const CHECKOUT = "C:/Claude (not on Gdrive, nor OneDrive)/chemistrydriller";
const ORIGIN = "https://github.com/physicalsmithness/chemistrydriller.git";
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const json = file => JSON.parse(fs.readFileSync(file, "utf8"));
function ensure(ok, message) { if (!ok) throw new Error(message); }
function walk(root, dir = root) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    ensure(!entry.isSymbolicLink(), "Release must not contain symlinks");
    return entry.isDirectory() ? walk(root, full) : [path.relative(root, full).split(path.sep).join("/")];
  });
}
function verifyBuild() {
  const latest = json(path.join(HOME, "latest.json")), root = path.resolve(latest.root);
  ensure(latest.release === true && latest.production_url === PRODUCTION_URL && inside(HOME, root), "Invalid release pointer");
  ensure(inside(fs.realpathSync(HOME), fs.realpathSync(root)), "Release root escapes output folder");
  ensure(inside(HOME, path.resolve(latest.report)) && !inside(root, path.resolve(latest.report)), "Private report belongs outside public root");
  const report = json(latest.report), infoPath = path.join(root, "ppqviewer/build-info.json"), info = json(infoPath);
  ensure(info.release === true && info.build_id === latest.build_id && info.build_id === report.build_id, "Release identity mismatch");
  ensure(hash(infoPath) === report.public_info_sha256, "Release manifest changed");
  ensure(isDeepStrictEqual(report.authorization, json(path.join(ROOT, "CHEMISTRY_RELEASE_SETTINGS.json"))), "Release settings changed");
  ensure(hash(report.catalogue) === report.catalogue_sha256 && hash(report.legacy_catalogue) === report.legacy_catalogue_sha256, "Source catalogue changed");
  for (const entry of report.source_fingerprints) ensure(hash(path.join(ROOT, entry.source)) === entry.sha256, "Viewer source changed: " + entry.source);
  const assets = [...info.assets, {path:"ppqviewer/build-info.json", sha256:report.public_info_sha256}];
  const names = assets.map(a => a.path);
  ensure(new Set(names).size === names.length && isDeepStrictEqual(names.slice().sort(), walk(root).sort()), "Release files do not exactly match manifest");
  for (const asset of assets) {
    ensure(safeRelative(asset.path) && (asset.path === "ppq.html" || asset.path.startsWith("ppqviewer/")), "Unexpected deployment path");
    ensure(inside(root, path.resolve(root, asset.path)) && hash(path.join(root, asset.path)) === asset.sha256, "Release asset changed: " + asset.path);
  }
  ensure(hash(path.join(ROOT, "example/chemistry-redirect.html")) === assets.find(a => a.path === "ppq.html").sha256, "Redirect source changed");
  return {latest, root, report, assets};
}
function stage(write = false) {
  const build = verifyBuild(), checkout = path.resolve(CHECKOUT);
  ensure(fs.existsSync(path.join(checkout, ".git")), "Missing Chemistry deployment repository");
  const git = args => execFileSync("git", ["-c", "safe.directory=" + CHECKOUT, "-C", checkout, ...args], {encoding:"utf8"}).trim();
  ensure(git(["remote", "get-url", "origin"]) === ORIGIN && git(["branch", "--show-current"]) === "main", "Unexpected Chemistry deployment target");
  ensure(!git(["status", "--porcelain", "--untracked-files=no"]), "Existing tracked changes must be resolved before deployment");
  const head = git(["rev-parse", "HEAD"]);
  ensure(head === git(["rev-parse", "origin/main"]), "Deployment checkout has unpushed or divergent changes");
  ensure(!fs.existsSync(path.join(checkout, "ppqviewer")), "Migration destination already exists; review it before a subsequent release");
  ensure(!fs.lstatSync(path.join(checkout, "ppq.html")).isSymbolicLink(), "Legacy route must be an ordinary file");
  const result = {build_id:build.latest.build_id, checkout, previous_commit:head, files:build.assets.length, written:write};
  if (write) {
    const backup = path.join(HOME, build.latest.build_id + "-rollback");
    fs.mkdirSync(backup, {recursive:false});
    fs.copyFileSync(path.join(checkout, "ppq.html"), path.join(backup, "ppq.html"));
    fs.writeFileSync(path.join(backup, "receipt.json"), JSON.stringify({...result, old_route_sha256:hash(path.join(checkout, "ppq.html"))}, null, 2) + "\n");
    // The root page/button stays intact. Install the complete viewer before
    // replacing its former ppq.html entry, and never delete donor assets.
    const ordered = build.assets.filter(a => a.path !== "ppq.html").concat(build.assets.filter(a => a.path === "ppq.html"));
    for (const asset of ordered) {
      const target = path.resolve(checkout, asset.path);
      ensure(inside(checkout, target), "Destination escaped Chemistry checkout");
      fs.mkdirSync(path.dirname(target), {recursive:true});
      fs.copyFileSync(path.join(build.root, asset.path), target);
      ensure(hash(target) === asset.sha256, "Staged file differs: " + asset.path);
    }
    fs.writeFileSync(path.join(HOME, "staged.json"), JSON.stringify({...result, root:build.root, assets:build.assets}, null, 2) + "\n");
  }
  return result;
}
if (require.main === module) {
  try {
    ensure(process.argv.slice(2).every(arg => arg === "--write"), "Usage: node tools/stage_chemistry_release.js [--write]");
    console.log(JSON.stringify(stage(process.argv.includes("--write")), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {verifyBuild, stage};
