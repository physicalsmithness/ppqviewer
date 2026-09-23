"use strict";
// Temporary fixtures only. No source evidence or deployment artifacts are used.
const assert = require("assert/strict"), fs = require("fs"), os = require("os"), path = require("path");
const {install} = require("../tools/ib-evidence-overlay");
async function main() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "ib-evidence-overlay-"));
  const active = path.join(fixture, "active"), candidates = path.join(fixture, "candidates");
  fs.mkdirSync(active); fs.mkdirSync(candidates);
  const canonical = path.join(active, "record.json"), candidate = path.join(candidates, "record.json");
  const source = path.join(active, "source.txt"), extra = path.join(active, "extra.txt");
  fs.writeFileSync(canonical, "original evidence"); fs.writeFileSync(source, "source evidence");
  const escape = path.join(candidates, "escape");
  let hasJunction = false;
  try { fs.symlinkSync(active, escape, process.platform === "win32" ? "junction" : "dir"); hasJunction = true; }
  catch (error) { if (!["EPERM", "EACCES", "ENOSYS"].includes(error.code)) throw error; }
  const originalRead = fs.readFileSync, originalWrite = fs.writeFileSync, originalPromiseWrite = fs.promises.writeFile;
  let restore;
  try {
    assert.throws(() => install({replacements:new Map([[canonical, extra]]), writableRoot:candidates}), /outside writableRoot/);
    if (hasJunction)
      assert.throws(() => install({replacements:new Map([[canonical, path.join(escape, "record.json")]]), writableRoot:candidates}), /symlink/);
    assert.equal(fs.readFileSync, originalRead, "rejected installation leaves fs unchanged");
    restore = install({replacements:new Map([[canonical, candidate]]), writableRoot:candidates});
    assert.equal(fs.existsSync(canonical), false, "missing candidate must not fall back to active evidence");
    assert.throws(() => fs.readFileSync(canonical), /ENOENT/);
    assert.equal(fs.readFileSync(source, "utf8"), "source evidence");
    fs.mkdirSync(active, {recursive:true});
    assert.throws(() => fs.mkdirSync(path.join(active, "new-dir")), /forbids/);
    fs.writeFileSync(canonical, "candidate evidence");
    if (hasJunction) assert.throws(() => fs.writeFileSync(path.join(escape, "source.txt"), "bad"), /symlink/);
    assert.equal(fs.readFileSync(canonical, "utf8"), "candidate evidence");
    assert.equal(fs.readFileSync(candidate, "utf8"), "candidate evidence");
    assert.equal(fs.statSync(canonical).size, Buffer.byteLength("candidate evidence"));
    assert.equal(fs.lstatSync(canonical).isFile(), true);
    assert.equal(fs.realpathSync(canonical), fs.realpathSync(candidate));
    assert.equal(originalRead(canonical, "utf8"), "original evidence");
    const copied = path.join(candidates, "copied.txt"), renamed = path.join(candidates, "renamed.txt");
    fs.copyFileSync(source, copied);
    fs.renameSync(copied, renamed);
    assert.equal(fs.readFileSync(renamed, "utf8"), "source evidence");
    for (const mutate of [
      () => fs.writeFileSync(source, "bad"), () => fs.appendFileSync(source, "bad"),
      () => fs.copyFileSync(candidate, extra), () => fs.renameSync(candidate, extra),
      () => fs.renameSync(source, renamed), () => fs.unlinkSync(source),
      () => fs.rmSync(active, {recursive:true, force:true}), () => fs.openSync(source, "w"),
      () => fs.writeFile(source, "bad", () => {}), () => fs.createWriteStream(source)
    ]) assert.throws(mutate, /Evidence overlay/);
    await assert.rejects(fs.promises.writeFile(source, "bad"), /Evidence overlay/);
    fs.unlinkSync(renamed);
    assert.equal(fs.existsSync(renamed), false);
    // A builder exception must not leave this process with patched fs methods.
    assert.throws(() => { try { throw Error("builder failed"); } finally { restore(); } }, /builder failed/);
    restore(); // Idempotent cleanup must be safe in a second finally block.
    restore = null;
    assert.equal(fs.readFileSync, originalRead);
    assert.equal(fs.writeFileSync, originalWrite);
    assert.equal(fs.promises.writeFile, originalPromiseWrite);
    assert.equal(fs.readFileSync(canonical, "utf8"), "original evidence");
    assert.equal(fs.readFileSync(source, "utf8"), "source evidence");
    assert.equal(fs.existsSync(extra), false);
    assert.equal(fs.readFileSync(candidate, "utf8"), "candidate evidence");
    console.log("PASS evidence overlay: staging, forbidden mutations, async rejection, restoration, and unchanged active bytes");
  } finally {
    if (restore) restore();
    const resolved = path.resolve(fixture), tempRoot = path.resolve(os.tmpdir());
    assert(path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("ib-evidence-overlay-"));
    fs.rmSync(resolved, {recursive:true, force:true});
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
