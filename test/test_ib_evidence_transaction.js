"use strict";
const fs = require("fs"), os = require("os"), path = require("path"), crypto = require("crypto"), assert = require("assert/strict");
const { promoteFiles } = require("../tools/ib-evidence-transaction");
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
let passed = 0;
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ppq-evidence-transaction-"));
  const files = [0, 1, 2].map(i => {
    const target = path.join(root, "active-" + i), candidate = path.join(root, "candidate-" + i), backup = path.join(root, "before-" + i);
    fs.writeFileSync(target, "old-" + i); fs.writeFileSync(backup, "old-" + i); fs.writeFileSync(candidate, "new-" + i);
    return { target, candidate, backup, beforeSha256: hash("old-" + i), afterSha256: hash("new-" + i) };
  });
  return { root, files, journal: path.join(root, "pending.json"), receiptPath: path.join(root, "receipt.json") };
}
function check(label, run) {
  const f = fixture();
  run(f);
  const relative = path.relative(path.resolve(os.tmpdir()), path.resolve(f.root));
  assert(relative && !relative.startsWith("..") && !path.isAbsolute(relative), "Cleanup must stay in the test temp directory");
  fs.rmSync(f.root, { recursive: true });
  console.log("ok " + label); passed++;
}
function originals(f) {
  f.files.forEach((file, i) => assert.equal(fs.readFileSync(file.target, "utf8"), "old-" + i));
}
function rolledBack(f) {
  originals(f); assert(!fs.existsSync(f.journal)); assert(!fs.existsSync(f.receiptPath));
  assert(!fs.readdirSync(f.root).some(name => name.startsWith(".ib-evidence-")));
}

check("verified candidates replace every original and leave a completion receipt", f => {
  const result = promoteFiles(f);
  assert.equal(result.result, "PASS");
  f.files.forEach((file, i) => assert.equal(fs.readFileSync(file.target, "utf8"), "new-" + i));
  assert(!fs.existsSync(f.journal)); assert.equal(JSON.parse(fs.readFileSync(f.receiptPath)).files.length, 3);
});
for (const field of ["target", "candidate", "backup"]) check("changed " + field + " refuses before any active write", f => {
  fs.writeFileSync(f.files[1][field], "changed");
  assert.throws(() => promoteFiles(f), /changed/);
  assert(!fs.existsSync(f.journal)); assert(!fs.existsSync(f.receiptPath));
  if (field !== "target") originals(f);
  else assert.equal(fs.readFileSync(f.files[1].target, "utf8"), "changed");
});
check("an existing journal is never replaced or removed", f => {
  fs.writeFileSync(f.journal, "someone else's transaction");
  assert.throws(() => promoteFiles(f), /EEXIST/);
  originals(f); assert.equal(fs.readFileSync(f.journal, "utf8"), "someone else's transaction");
});
for (const index of [0, 1]) check("rename failure at target " + index + " restores every original", f => {
  let failed = false;
  const io = { ...fs, renameSync(from, to) {
    if (to === f.files[index].target && !failed) { failed = true; throw Error("injected target rename failure"); }
    return fs.renameSync(from, to);
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /every original evidence file was restored/);
  rolledBack(f);
});
check("partial temporary copy cannot corrupt any active target", f => {
  const io = { ...fs, copyFileSync(from, to, ...args) {
    if (from === f.files[1].candidate) { fs.writeFileSync(to, "partial"); throw Error("injected disk-full copy"); }
    return fs.copyFileSync(from, to, ...args);
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /every original evidence file was restored/);
  rolledBack(f);
});
check("receipt rename failure rolls all promoted targets back", f => {
  const io = { ...fs, renameSync(from, to) {
    if (to === f.receiptPath) throw Error("injected receipt failure");
    return fs.renameSync(from, to);
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /every original evidence file was restored/);
  rolledBack(f);
});
check("failed rollback retains its journal and remaining new bytes", f => {
  let rollingBack = false;
  const io = { ...fs, renameSync(from, to) {
    if (to === f.receiptPath) { rollingBack = true; throw Error("injected receipt failure"); }
    if (rollingBack && to === f.files[1].target) throw Error("injected rollback failure");
    return fs.renameSync(from, to);
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /journal preserved/);
  assert(fs.existsSync(f.journal)); assert(!fs.existsSync(f.receiptPath));
  assert.equal(fs.readFileSync(f.files[1].target, "utf8"), "new-1");
  assert.equal(fs.readFileSync(f.files[0].target, "utf8"), "old-0");
  assert.equal(fs.readFileSync(f.files[2].target, "utf8"), "old-2");
});
check("a concurrent edit before a later swap is preserved and blocks completion", f => {
  const io = { ...fs, renameSync(from, to) {
    const result = fs.renameSync(from, to);
    if (to === f.files[0].target && fs.readFileSync(to, "utf8") === "new-0") fs.writeFileSync(f.files[1].target, "concurrent");
    return result;
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /journal preserved/);
  assert(fs.existsSync(f.journal)); assert(!fs.existsSync(f.receiptPath));
  assert.equal(fs.readFileSync(f.files[1].target, "utf8"), "concurrent");
  assert.equal(fs.readFileSync(f.files[0].target, "utf8"), "old-0");
});
check("a concurrent edit before rollback is never replaced by backup bytes", f => {
  const io = { ...fs, renameSync(from, to) {
    if (to === f.receiptPath) { fs.writeFileSync(f.files[0].target, "concurrent"); throw Error("injected receipt failure"); }
    return fs.renameSync(from, to);
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /journal preserved/);
  assert(fs.existsSync(f.journal)); assert.equal(fs.readFileSync(f.files[0].target, "utf8"), "concurrent");
});
check("a changed backup is never used for rollback", f => {
  const io = { ...fs, renameSync(from, to) {
    if (to === f.receiptPath) { fs.writeFileSync(f.files[0].backup, "corrupt backup"); throw Error("injected receipt failure"); }
    return fs.renameSync(from, to);
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /journal preserved/);
  assert(fs.existsSync(f.journal)); assert.equal(fs.readFileSync(f.files[0].target, "utf8"), "new-0");
});
check("journal cleanup failure retains the completed receipt and promoted bytes", f => {
  const io = { ...fs, unlinkSync(file) {
    if (file === f.journal) throw Error("injected journal cleanup failure");
    return fs.unlinkSync(file);
  } };
  assert.throws(() => promoteFiles({ ...f, fs: io }), /promoted but journal cleanup failed/);
  assert(fs.existsSync(f.journal)); assert(fs.existsSync(f.receiptPath));
  f.files.forEach((file, i) => assert.equal(fs.readFileSync(file.target, "utf8"), "new-" + i));
});
console.log(passed + " evidence transaction checks passed");
