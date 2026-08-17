/* tools/state.js — the derived wake surface for ppqviewer.
 *
 * WHY THIS EXISTS. Three successive architect sessions (2026-07-30, 08-03,
 * 08-04) each spent an hour, and a large part of their context, reconstructing
 * the same handful of facts from ROADMAP + DECISIONS + CHANGELOG + REGISTRY +
 * inbox before they could do any work. Two of them then made a claim about
 * live state from memory rather than from disk and got it wrong (the
 * chemistry "Paper 1 only" claim; a publish instruction that was already
 * stale when written). The estate rule is derive-never-remember; this script
 * makes deriving cost one command instead of an hour.
 *
 * It also answers the question nothing else answers: IS WHAT IS PUBLISHED THE
 * SAME AS WHAT IS TESTED? Canonical source can move after a sync and before a
 * push, or after a push, and until now nothing said so. On 2026-08-04 exactly
 * that happened: three engine commits landed after Smith's push, so the live
 * ESAT site carried an unpinned corrupt record while head was clean and green.
 *
 * READ-ONLY. It computes, it never writes, it never assembles, it never
 * deploys. Run it on wake, and again before telling Smith anything is safe.
 *
 *   node tools/state.js
 *
 * Optional environment overrides (same names the suites use), needed when the
 * content trees are mounted somewhere other than their Windows paths:
 *   ESAT_ANALYSIS_ROOT   ESAT_APP_ROOT   MATHS_CATALOGUE_JS
 *
 * Claude (ppq architect), 2026-08-05.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const out = [];
const say = (s) => out.push(s === undefined ? "" : s);

function sh(cmd, cwd) {
  try {
    return execSync(cmd, { cwd: cwd || ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch (e) {
    return null;
  }
}

/* Raw-byte sha, matching what the assemblers stamp into build-info.json
   (assemble_ibmaths_site.js sha12(); sync_esat_website.ps1 Get-ShortHash). */
function sha12(file) {
  try {
    return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 12);
  } catch (e) {
    return null;
  }
}

/* Line-ending-insensitive sha. The working copy lives on Windows (CRLF) but is
   often read through a Linux mount, and a raw sha alone cannot tell "genuinely
   different" from "same file, different newlines". When the raw shas disagree
   but these agree, the difference is newlines and nothing else. */
function shaLF(file) {
  try {
    const buf = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
    return crypto.createHash("sha256").update(buf, "utf8").digest("hex").slice(0, 12);
  } catch (e) {
    return null;
  }
}

function exists(p) {
  try { fs.accessSync(p); return true; } catch (e) { return false; }
}

function ageDays(p) {
  try { return (Date.now() - fs.statSync(p).mtimeMs) / 86400000; } catch (e) { return null; }
}

/* ---------------------------------------------------------------- repository */

say("=".repeat(72));
say("ppqviewer state, derived " + new Date().toISOString().replace("T", " ").slice(0, 16) + "Z");
say("=".repeat(72));
say();

const head = sh("git log -1 --format='%h %ad %an | %s' --date=format:'%Y-%m-%d %H:%M'");
say("SOURCE REPO");
say("  head        " + (head ? head.replace(/^'|'$/g, "") : "(no git history)"));

const dirtyRaw = (sh("git status --porcelain") || "").split("\n").filter(Boolean);
const modified = dirtyRaw.filter((l) => /^ ?M/.test(l)).map((l) => l.slice(3));
const untracked = dirtyRaw.filter((l) => /^\?\?/.test(l)).map((l) => l.slice(3));

/* Separate real edits from newline-only phantoms: a file whose diff is N
   insertions and N deletions across its whole length is the classic signature,
   and it is why no seat may ever run `git add -A` here. */
const numstat = (sh("git diff --numstat") || "").split("\n").filter(Boolean);
const phantom = [];
const realEdits = [];
numstat.forEach((line) => {
  const [add, del, file] = line.split(/\t/);
  const blobHasCR = /\r/.test(sh('git show "HEAD:' + file + '" | head -c 20000') || "");
  const diskHasCR = /\r/.test((() => { try { return fs.readFileSync(path.join(ROOT, file), "utf8").slice(0, 20000); } catch (e) { return ""; } })());
  if (add === del && blobHasCR !== diskHasCR) phantom.push(file); else realEdits.push(file + " (+" + add + "/-" + del + ")");
});

say("  edits       " + (realEdits.length ? realEdits.join(", ") : "none"));
if (phantom.length) {
  say("  newline-only phantoms (" + phantom.length + "): " + phantom.slice(0, 4).join(", ") + (phantom.length > 4 ? ", ..." : ""));
  say("              NOT real changes. Commit by name, never `git add -A`.");
}
if (untracked.length) say("  untracked   " + untracked.length + ": " + untracked.slice(0, 3).join(", ") + (untracked.length > 3 ? ", ..." : ""));

const enginePath = path.join(ROOT, "engine", "ppqviewer.js");
const engineSrc = exists(enginePath) ? fs.readFileSync(enginePath, "utf8") : "";
const vm = engineSrc.match(/VERSION\s*[:=]\s*["']([\d.]+)["']/) || engineSrc.match(/version\s*[:=]\s*["']([\d.]+)["']/);
say("  engine      v" + (vm ? vm[1] : "?") + "  (" + Math.round(engineSrc.length / 1024) + " KB, sha " + sha12(enginePath) + ")");
say();

/* --------------------------------------------------------------- deployments */

/* Each consumer: what the deploy checkout carries versus what head carries.
   `pushed` compares HEAD to origin/main inside the deploy checkout, so a build
   that was assembled but never pushed cannot masquerade as live. */
const CONSUMERS = [
  { name: "ESAT (esatwallop)", dir: "esatwallop", wrapper: "example/esat-compare.html" },
  { name: "IB Maths (ibmathsdriller)", dir: "ibmathsdriller", wrapper: "example/ibmaths.html" }
];

say("DEPLOYMENTS  (canonical head vs the checkout Smith pushes)");
CONSUMERS.forEach((c) => {
  const dep = path.join(ROOT, "deploy", c.dir);
  say();
  say("  " + c.name);
  if (!exists(dep)) { say("    no deploy checkout at deploy/" + c.dir); return; }

  let info = {};
  try { info = JSON.parse(fs.readFileSync(path.join(dep, "build-info.json"), "utf8")); } catch (e) {}
  say("    build       " + (info.build_id || "?") + "   assembled " + (info.built_at_utc || "?").replace("T", " ").slice(0, 16) + "  by " + (info.maintainer || "?"));

  const depEngine = path.join(dep, "engine", "ppqviewer.js");
  const rawSame = sha12(enginePath) === sha12(depEngine);
  const lfSame = shaLF(enginePath) === shaLF(depEngine);
  say("    engine      " + (rawSame ? "MATCHES head" : lfSame ? "matches head apart from newlines" : "*** BEHIND HEAD *** (deployed " + sha12(depEngine) + ", head " + sha12(enginePath) + ")"));

  /* The withheld pin list is the one config block where drift is a pupil-safety
     matter rather than a cosmetic one, so it is compared explicitly. */
  const pinsOf = (file) => {
    let src = "";
    try { src = fs.readFileSync(file, "utf8"); } catch (e) { return null; }
    const block = src.match(/withheld:\s*\{([\s\S]*?)\n\s*\}/);
    if (!block) return [];
    return (block[1].match(/"([A-Za-z0-9_]+)"\s*:/g) || []).map((s) => s.replace(/["\s:]/g, ""));
  };
  const canon = pinsOf(path.join(ROOT, c.wrapper));
  const live = pinsOf(path.join(dep, "index.html"));
  if (canon && live) {
    const missing = canon.filter((id) => live.indexOf(id) < 0);
    say("    pins        head " + canon.length + ", deployed " + live.length +
      (missing.length ? "   *** " + missing.length + " PINNED AT HEAD BUT LIVE TO PUPILS: " + missing.join(", ") + " ***" : "   (no pin is missing from the deployment)"));
  }

  /* "Pushed" is not the same as "nothing owed". The architect re-assembles
     site files; Smith runs the native sync (which verifies assets and stamps
     build-info) and pushes. Between those two acts the checkout holds a fresh
     index.html under a stale stamp, and a plain commit check calls that
     clean. Comparing the assembled index against the hash the stamp claims is
     cheap and says exactly what is owed. */
  const STAMPED = [
    ["index_sha256_12", "index.html"],
    ["engine_sha256_12", path.join("engine", "ppqviewer.js")],
    ["css_sha256_12", path.join("engine", "ppqviewer.css")],
    ["login_sha256_12", "ppq-login.js"]
  ];
  const restamp = STAMPED.filter(([key, rel]) => {
    const want = info[key];
    if (!want) return false;
    const got = sha12(path.join(dep, rel));
    return got && got !== want;
  }).map(([, rel]) => rel);
  say("    assembly    " + (restamp.length
    ? "*** RE-ASSEMBLED SINCE THE LAST STAMP (" + restamp.join(", ") + "): Smith owes a sync + push ***"
    : (STAMPED.some(([k]) => info[k]) ? "matches its build stamp" : "no stamp to compare")));

  /* A shared consumer file can drift even when the deployed index does not,
     because it is a separate file with its own stamp. The ESAT pulse fix of
     2026-08-06 lived entirely in ppq-login.js and would have looked clean on
     an index-only check. */
  const sharedLogin = path.join(ROOT, "example", "ppq-login.js");
  const depLogin = path.join(dep, "ppq-login.js");
  if (exists(depLogin) && exists(sharedLogin) && sha12(sharedLogin) !== sha12(depLogin)) {
    say("    sign-in     *** deployed ppq-login.js is BEHIND canonical ***");
  }

  const local = sh("git rev-parse --short HEAD", dep);
  const remote = sh("git rev-parse --short origin/main", dep);
  const ahead = sh("git rev-list --count origin/main..HEAD", dep);
  say("    checkout    " + (local || "?") + (local && remote ? (local === remote ? " = origin/main (last commit pushed)" : " *** " + ahead + " commit(s) NOT PUSHED ***") : " (origin unknown)"));
});
say();

/* -------------------------------------------------------------------- inbox */

/* Packets are the only channel content seats have. A packet that arrived after
   the last commit touching inbox/ has almost certainly not been acted on. */
say("INBOX");
const inboxDir = path.join(ROOT, "inbox");
const packets = fs.readdirSync(inboxDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}_from-/.test(f))
  .map((f) => ({ f, age: ageDays(path.join(inboxDir, f)), tracked: !untracked.some((u) => u.indexOf(f) >= 0) }))
  .sort((a, b) => a.age - b.age);
say("  " + packets.length + " packets; most recent:");
packets.slice(0, 6).forEach((p) => {
  say("    " + (p.age < 1.5 ? "NEW  " : "     ") + p.f + "   (" + (p.age < 1 ? Math.round(p.age * 24) + "h" : Math.round(p.age) + "d") + " old" + (p.tracked ? "" : ", uncommitted") + ")");
});
say();

/* -------------------------------------------------------------------- gates */

say("GATES  (run all seven before telling Smith anything is releasable)");
say("  node test/test_ppqviewer.js                  # engine contract");
say("  node test/test_chem.js                       # donor capability parity");
say("  node test/test_content_safety.js             # pin accounting + corpus sweep");
say("  node test/verify_analysis_presentation.js    # pupil journey, ESAT + maths");
say("  node test/test_categorisation_integration.js # ESAT teaching catalogue");
say("  node test/test_economics.js                  # economics consumer");
say("  node test/test_pulse.js                      # attempt-pulse transport");
say();
say("  Sandbox note: jsdom resolved across a Windows mount takes minutes.");
say("  Copy engine/ test/ example/ tools/ and node_modules to local disk and");
say("  run there; the suites read everything else by absolute path.");
say();
say("=".repeat(72));

process.stdout.write(out.join("\n") + "\n");
