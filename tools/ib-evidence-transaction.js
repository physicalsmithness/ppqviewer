"use strict";
// A journal blocks release assembly/staging while these local evidence files move.
// Each replacement is a verified same-directory rename. This is not an OS-wide
// lock: all evidence writers must respect the journal during the transaction.
const fs = require("fs"), path = require("path"), crypto = require("crypto");

function promoteFiles({ files, journal, receiptPath, fs: io = fs }) {
  const ensure = (ok, message) => { if (!ok) throw Error(message); };
  const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
  const sha = file => hash(io.readFileSync(file));
  const ordinary = file => {
    const stat = io.lstatSync(file);
    ensure(stat.isFile() && !stat.isSymbolicLink(), "Expected an ordinary evidence file: " + file);
  };
  ensure(Array.isArray(files) && files.length, "Promotion needs an explicit nonempty file list");
  const records = files.map(file => {
    for (const key of ["target", "candidate", "backup"])
      ensure(typeof file[key] === "string" && path.isAbsolute(file[key]), "Promotion paths must be absolute");
    for (const key of ["beforeSha256", "afterSha256"])
      ensure(/^[a-f0-9]{64}$/.test(file[key] || ""), "Promotion requires exact SHA-256 identities");
    return { ...file, target: path.resolve(file.target), candidate: path.resolve(file.candidate), backup: path.resolve(file.backup) };
  });
  ensure(typeof journal === "string" && path.isAbsolute(journal) && typeof receiptPath === "string" && path.isAbsolute(receiptPath), "Journal and receipt paths must be absolute");
  journal = path.resolve(journal); receiptPath = path.resolve(receiptPath);
  const key = file => process.platform === "win32" ? file.toLowerCase() : file;
  const allPaths = records.flatMap(file => [file.target, file.candidate, file.backup]).concat(journal, receiptPath).map(key);
  ensure(new Set(allPaths).size === allPaths.length, "Promotion paths must be distinct");
  ensure(!io.existsSync(receiptPath), "Promotion receipt already exists; inspect it before retrying");
  for (const file of records) {
    for (const name of [file.target, file.candidate, file.backup]) ordinary(name);
    ensure(sha(file.target) === file.beforeSha256, "Active evidence changed: " + file.target);
    ensure(sha(file.backup) === file.beforeSha256, "Original evidence backup changed: " + file.backup);
    ensure(sha(file.candidate) === file.afterSha256, "Validated candidate changed: " + file.candidate);
  }

  const temps = new Set(), attempted = [], prepared = new Map();
  let journalOwned = false, committed = false;
  const state = { schema_version: 1, status: "preparing", files: records, attempted: [] };
  function reserve(target) {
    const temp = path.join(path.dirname(target), ".ib-evidence-" + crypto.randomBytes(12).toString("hex") + ".tmp");
    const fd = io.openSync(temp, "wx");
    temps.add(temp);
    io.closeSync(fd);
    return temp;
  }
  function copyVerified(source, target, expected) {
    ordinary(source);
    ensure(sha(source) === expected, "Evidence source changed before copying: " + source);
    const temp = reserve(target);
    io.copyFileSync(source, temp);
    ensure(sha(temp) === expected, "Evidence copy does not match its expected bytes: " + source);
    return temp;
  }
  function atomicJson(target, value) {
    const temp = reserve(target), bytes = Buffer.from(JSON.stringify(value, null, 2) + "\n");
    io.writeFileSync(temp, bytes, { flush: true });
    ensure(sha(temp) === hash(bytes), "Transaction record write was incomplete: " + target);
    io.renameSync(temp, target);
    temps.delete(temp);
  }
  function recordIntent(file) {
    attempted.push(file);
    state.status = "promoting";
    state.attempted.push(file.target);
    atomicJson(journal, state);
  }
  function cleanupTemps() {
    const failures = [];
    for (const temp of temps) {
      try { if (io.existsSync(temp)) io.unlinkSync(temp); temps.delete(temp); }
      catch (error) { failures.push(temp + ": " + error.message); }
    }
    return failures;
  }
  try {
    // Reserve the journal exclusively before preparing or replacing any file.
    const fd = io.openSync(journal, "wx");
    journalOwned = true;
    try { io.writeFileSync(fd, JSON.stringify(state, null, 2) + "\n"); io.fsyncSync(fd); }
    finally { io.closeSync(fd); }
    for (const file of records) prepared.set(file.target, copyVerified(file.candidate, file.target, file.afterSha256));
    for (const file of records) {
      recordIntent(file); // Persist intent before any target can change.
      ordinary(file.target);
      ensure(sha(file.target) === file.beforeSha256, "Concurrent active edit prevents promotion: " + file.target);
      io.renameSync(prepared.get(file.target), file.target);
      temps.delete(prepared.get(file.target));
      ensure(sha(file.target) === file.afterSha256, "Promoted evidence verification failed: " + file.target);
    }
    for (const file of records) ensure(sha(file.target) === file.afterSha256, "Evidence changed during promotion: " + file.target);
    const receipt = { schema_version: 1, result: "PASS", promoted_utc: new Date().toISOString(), files: records };
    ensure(!io.existsSync(receiptPath), "Concurrent receipt creation prevents completion");
    atomicJson(receiptPath, receipt);
    committed = true;
    // If cleanup fails now, retain the journal and completed receipt for recovery.
    io.unlinkSync(journal);
    journalOwned = false;
    return receipt;
  } catch (error) {
    if (!journalOwned) { cleanupTemps(); throw error; }
    if (committed) throw Error("Evidence was promoted but journal cleanup failed; preserve the receipt and journal. " + error.message, { cause: error });
    const rollbackFailures = [];
    for (const file of [...attempted].reverse()) {
      try {
        ordinary(file.target);
        const current = sha(file.target);
        if (current === file.beforeSha256) continue;
        ensure(current === file.afterSha256, "Concurrent edit prevents rollback: " + file.target);
        const temp = copyVerified(file.backup, file.target, file.beforeSha256);
        ensure(sha(file.target) === file.afterSha256, "Concurrent edit prevents rollback: " + file.target);
        io.renameSync(temp, file.target);
        temps.delete(temp);
        ensure(sha(file.target) === file.beforeSha256, "Rollback verification failed: " + file.target);
      } catch (rollbackError) { rollbackFailures.push(rollbackError.message); }
    }
    // Include unattempted files: another writer may have changed one of them.
    for (const file of records) {
      try {
        ordinary(file.target);
        ensure(sha(file.target) === file.beforeSha256, "Original evidence has not been restored: " + file.target);
        ensure(sha(file.backup) === file.beforeSha256, "Original backup changed during promotion: " + file.backup);
      } catch (verificationError) { rollbackFailures.push(verificationError.message); }
    }
    rollbackFailures.push(...cleanupTemps());
    if (!rollbackFailures.length) {
      try { io.unlinkSync(journal); journalOwned = false; }
      catch (cleanupError) { rollbackFailures.push(cleanupError.message); }
    }
    if (rollbackFailures.length)
      throw Error("Promotion failed; journal preserved because rollback could not be verified. " + error.message + "\n" + rollbackFailures.join("\n"), { cause: error });
    throw Error("Promotion failed; every original evidence file was restored and verified. " + error.message, { cause: error });
  }
}

module.exports = { promoteFiles };
