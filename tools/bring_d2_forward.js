"use strict";
// Diagnostic only: rebuild a candidate in tmp/ and compare every JSON field.
// This legacy workflow cannot promote release evidence. Its previous ID-only
// comparison missed changed memberships and discarded the entire report.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const HISTORICAL_INPUT = path.join(ROOT, "dist/physics-inputs/ib-d2.json");
const REFUSAL = "--promote is disabled: the legacy chain replaces evidence before all checks pass. The completed migration is documented in reports/ib-evidence-migration-2026-09-23/README.md; this command is diagnostic only.";

function compareRecovery(before, after) {
  const differences = [], allowedFingerprintChanges = [];
  function visit(a, b, keys, parentA, parentB) {
    if (Object.is(a, b)) return;
    const location = keys.join(".") || "<root>";
    // Only this exact source's hash may differ. Its path, array position and
    // every other fingerprint/report/data field must still compare equal.
    if (keys.length === 4 && keys[0] === "report" && keys[1] === "source_files" &&
        keys[3] === "sha256" && /^\d+$/.test(keys[2]) &&
        parentA?.path === HISTORICAL_INPUT && parentB?.path === HISTORICAL_INPUT &&
        typeof a === "string" && typeof b === "string" &&
        /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b)) {
      allowedFingerprintChanges.push({ field: location, path: HISTORICAL_INPUT, before: a, after: b });
      return;
    }
    if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) !== Array.isArray(b)) {
      differences.push(location);
      return;
    }
    if (Array.isArray(a) && a.length !== b.length) differences.push(location + ".length");
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!Object.hasOwn(a, key) || !Object.hasOwn(b, key)) differences.push([...keys, key].join("."));
      else visit(a[key], b[key], [...keys, key], a, b);
    }
  }
  visit(before, after, []);
  return { equal: differences.length === 0, differences, allowedFingerprintChanges };
}

function main(args = process.argv.slice(2)) {
  // Refuse before loading a builder or creating any file/directory.
  if (args.includes("--promote")) { console.error(REFUSAL); return 1; }
  if (args.length) { console.error("Usage: node tools/bring_d2_forward.js (diagnostic only)"); return 1; }
  const tmp = path.join(ROOT, "tmp");
  fs.mkdirSync(tmp, { recursive: true });
  const candidatePath = path.join(tmp, "ib-d2-recovered.candidate.json");
  console.log("Rebuilding a D2 recovery candidate into tmp/; release evidence is unchanged.");
  try {
    const built = require("./build_ib_d2_recovery").write(candidatePath);
    const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
    const result = compareRecovery(read(path.join(ROOT, "reports/frozen-d2-2026-09-23/ib-d2-recovered.json")), read(candidatePath));
    console.log("Candidate sha256: " + built.sha256);
    console.log("Allowed historical-input fingerprint changes: " + result.allowedFingerprintChanges.length);
    for (const change of result.allowedFingerprintChanges) console.log("  " + change.field + ": " + change.before + " -> " + change.after);
    console.log("Other changed fields: " + result.differences.length);
    result.differences.slice(0, 60).forEach(field => console.log("  DIFFERENT " + field));
    if (result.differences.length > 60) console.log("  ... " + (result.differences.length - 60) + " more");
    console.log("Nothing has been promoted. Equality in this diagnostic is not release approval.");
    return result.equal ? 0 : 1;
  } catch (error) {
    console.error("Diagnostic refused: " + error.message);
    console.error("Nothing has been promoted.");
    return 1;
  }
}
if (require.main === module) process.exitCode = main();
module.exports = { compareRecovery, main };
