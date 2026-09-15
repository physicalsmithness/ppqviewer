"use strict";
// Copy an assembled Trilogy bundle into its deployment checkout. It never commits and
// never pushes: Smith does both. It refuses unless the publication ruling has been
// granted in reports/trilogy-release-settings.json, because the AQA ruling is his and
// does not inherit from the IB Maths one.
//
//   node tools/stage_trilogy_release.js            # report what would change
//   node tools/stage_trilogy_release.js --write    # write the files
const fs = require("fs"), path = require("path"), crypto = require("crypto"), { execFileSync } = require("child_process");
const ROOT = path.resolve(process.env.PPQ_PROJECT_ROOT || path.resolve(__dirname, ".."));
const SETTINGS = path.join(ROOT, "reports/trilogy-release-settings.json");
const sha = b => crypto.createHash("sha256").update(b).digest("hex");
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const json = p => JSON.parse(fs.readFileSync(p, "utf8"));

function walk(root, dir = root) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.name === ".git") return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(root, full) : [path.relative(root, full).split(path.sep).join("/")];
  });
}

function stage(options = {}) {
  const settings = json(SETTINGS);
  const ruling = settings.publication_ruling || {};
  ensure(ruling.granted === true,
    "The AQA publication ruling has not been granted. Record it in reports/trilogy-release-settings.json " +
    "(publication_ruling.granted, granted_on and Smith's wording) before staging. It does not inherit from d014/q12.");
  ensure(typeof ruling.wording === "string" && ruling.wording.trim().length > 20,
    "Record the ruling in Smith's own words, so a later reader can see what was actually agreed");

  const latest = json(path.join(ROOT, "dist/trilogy-release/latest.json"));
  const build = path.resolve(latest.root);
  ensure(fs.existsSync(build), "The assembled build is missing: " + build);
  ensure(sha(fs.readFileSync(latest.clearance.path)) === latest.clearance.sha256, "The clearance changed after assembly");
  ensure(sha(fs.readFileSync(latest.settings.path)) === latest.settings.sha256, "The settings changed after assembly");
  for (const file of latest.shared_files)
    ensure(sha(fs.readFileSync(path.join(ROOT, file.path))) === file.sha256,
      "A shared viewer source changed after assembly: " + file.path + ". Re-assemble before staging.");
  for (const file of latest.evidence_verified)
    ensure(fs.existsSync(file.path) && sha(fs.readFileSync(file.path)) === file.sha256,
      "The exclusion review evidence changed after assembly: " + file.path);

  const checkout = path.resolve(options.checkout || process.env.TRILOGY_CHECKOUT || settings.site.checkout);
  ensure(fs.existsSync(path.join(checkout, ".git")), "The deployment checkout is not a git repository: " + checkout);
  const git = args => execFileSync("git", args, { cwd: checkout, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim();
  ensure(git(["remote", "get-url", "origin"]) === settings.site.origin,
    "Unexpected deployment origin. Expected " + settings.site.origin);
  const status = git(["status", "--porcelain"]);
  ensure(!status || options.force, "The deployment checkout has uncommitted changes:\n" + status);

  const present = walk(build).sort();
  ensure(present.includes("index.html") && present.includes("build-info.json") && present.includes(".nojekyll"),
    "The assembled build is incomplete");
  const existing = fs.existsSync(checkout) ? walk(checkout).sort() : [];
  const added = present.filter(f => !existing.includes(f));
  const removed = existing.filter(f => !present.includes(f));
  const changed = present.filter(f => existing.includes(f) &&
    !fs.readFileSync(path.join(build, f)).equals(fs.readFileSync(path.join(checkout, f))));

  if (options.write) {
    for (const file of removed) fs.rmSync(path.join(checkout, file));
    for (const file of [...added, ...changed]) {
      const target = path.join(checkout, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(build, file), target);
    }
    // Empty directories left by removals would show as nothing in git but confuse a reader.
    for (const dir of ["assets", "data", "engine"]) {
      const full = path.join(checkout, dir);
      if (fs.existsSync(full) && !fs.readdirSync(full).length) fs.rmdirSync(full);
    }
  }

  const result = {
    build_id: latest.build_id, build_root: build, checkout, written: !!options.write,
    files: present.length, added: added.length, removed: removed.length, changed: changed.length,
    publication_ruling: { granted_on: ruling.granted_on, wording: ruling.wording },
    next: options.write
      ? "Review the checkout, then commit and push main. Verify the served build rather than assuming Pages has updated."
      : "Nothing was written. Re-run with --write to stage."
  };
  return result;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  console.log(JSON.stringify(stage({ write: args.includes("--write"), force: args.includes("--force") }), null, 2));
}
module.exports = { stage };
