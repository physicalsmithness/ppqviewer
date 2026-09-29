/* Read-only pre-commit audit. The index must contain the reviewed release
 * bytes exactly, including their line endings. No writes, fetches or commits. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto"), {execFileSync} = require("child_process"), {isDeepStrictEqual} = require("util");
const {verifyBuild} = require("./stage_chemistry_release");
const ROOT = path.resolve(__dirname, ".."), HOME = path.join(ROOT, "dist/chemistry-release");
const CHECKOUT = path.resolve("C:/Claude (not on Gdrive, nor OneDrive)/chemistrydriller");
const ORIGIN = "https://github.com/physicalsmithness/chemistrydriller.git";
function ensure(condition, message) { if (!condition) throw new Error(message); }
function blobHash(bytes) {
  return crypto.createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0", "utf8")).update(bytes).digest("hex");
}
function nulRecords(output) {
  ensure(output === "" || output.endsWith("\0"), "Git output is not NUL terminated");
  return output ? output.slice(0, -1).split("\0") : [];
}
function indexEntries(output) {
  return nulRecords(output).map(record => {
    const match = /^([0-7]{6}) ([a-f\d]{40}) ([0-3])\t([\s\S]+)$/.exec(record);
    ensure(match, "Unexpected Git index entry format");
    return {mode:match[1], object:match[2], stage:Number(match[3]), path:match[4]};
  });
}
function verifyIndex() {
  const build = verifyBuild();
  const staged = JSON.parse(fs.readFileSync(path.join(HOME, "staged.json"), "utf8"));
  ensure(staged.written === true && staged.build_id === build.latest.build_id && path.resolve(staged.root) === build.root,
    "Staging receipt does not identify the current release");
  ensure(path.resolve(staged.checkout) === CHECKOUT && fs.realpathSync(staged.checkout) === fs.realpathSync(CHECKOUT), "Staging receipt names another checkout");
  ensure(staged.files === build.assets.length && isDeepStrictEqual(staged.assets, build.assets), "Staging receipt differs from the reviewed release manifest");
  ensure(/^[a-f\d]{40}$/.test(staged.previous_commit || ""), "Staging receipt lacks a valid previous commit");
  const git = args => execFileSync("git", ["-c", "safe.directory=" + CHECKOUT, "-C", CHECKOUT, ...args],
    {encoding:"utf8", maxBuffer:32 * 1024 * 1024, env:{...process.env, GIT_OPTIONAL_LOCKS:"0"}});
  ensure(path.resolve(git(["rev-parse", "--show-toplevel"]).trim()) === CHECKOUT, "Unexpected Git worktree root");
  ensure(git(["remote", "get-url", "origin"]).trim() === ORIGIN && git(["branch", "--show-current"]).trim() === "main", "Unexpected Chemistry deployment target");
  ensure(git(["rev-parse", "--show-object-format"]).trim() === "sha1", "This verifier requires the canonical SHA-1 repository");
  ensure(git(["rev-parse", "HEAD"]).trim() === staged.previous_commit, "HEAD changed since reviewed files were staged");
  ensure(git(["rev-parse", "origin/main"]).trim() === staged.previous_commit, "Origin tracking ref differs from the staged baseline");
  const expectedNames = build.assets.map(asset => asset.path).sort();
  const changedNames = nulRecords(git(["diff", "--cached", "--name-only", "--no-renames", "-z", "--"])).sort();
  ensure(isDeepStrictEqual(changedNames, expectedNames), "Git index changes do not exactly match the release manifest; unrelated or missing staged files");
  const indexOutput = git(["ls-files", "--stage", "-z", "--"]), entries = indexEntries(indexOutput);
  ensure(entries.every(entry => entry.stage === 0), "Git index contains unresolved conflicts");
  const entriesByName = new Map();
  for (const entry of entries) {
    ensure(!entriesByName.has(entry.path), "Duplicate Git index entry");
    entriesByName.set(entry.path, entry);
  }
  for (const asset of build.assets) {
    const entry = entriesByName.get(asset.path);
    ensure(entry && entry.mode === "100644" && entry.stage === 0, "Release index entry must be an ordinary 100644 file: " + asset.path);
    const expectedBlob = blobHash(fs.readFileSync(path.join(build.root, asset.path)));
    ensure(entry.object === expectedBlob, "Git staged bytes differ from reviewed release (including line endings): " + asset.path);
  }
  ensure(git(["rev-parse", "HEAD"]).trim() === staged.previous_commit && git(["ls-files", "--stage", "-z", "--"]) === indexOutput,
    "HEAD or index changed during verification; run the audit again");
  return {result:"PASS", build_id:build.latest.build_id, checkout:CHECKOUT, branch:"main", origin:ORIGIN,
    previous_commit:staged.previous_commit, files_verified:build.assets.length, exact_git_blob_bytes:true};
}
if (require.main === module) {
  try {
    ensure(process.argv.length === 2, "Usage: node tools/verify_chemistry_git_index.js");
    console.log(JSON.stringify(verifyIndex(), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = {verifyIndex, blobHash, nulRecords, indexEntries};
