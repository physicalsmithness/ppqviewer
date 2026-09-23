"use strict";
// Legacy diagnostic only. Promotion must use the replacement migration, which
// validates the whole evidence chain before replacing any reviewed record.
const fs = require("fs"), path = require("path"), { isDeepStrictEqual } = require("util");
const ROOT = path.resolve(__dirname, "..");
const REFUSAL = "--promote is disabled: the legacy chain replaces evidence before all checks pass. The completed migration is documented in reports/ib-evidence-migration-2026-09-23/README.md; this command is diagnostic only.";

function main(args = process.argv.slice(2)) {
  // Refuse before loading a builder or creating any file/directory.
  if (args.includes("--promote")) { console.error(REFUSAL); return 1; }
  if (args.length) { console.error("Usage: node tools/d2_forward_assessment.js (diagnostic only)"); return 1; }
  try {
    const rebuilt = require("./build_ib_d2_assessment_review").build();
    const frozen = JSON.parse(fs.readFileSync(path.join(ROOT, "reports/frozen-d2-2026-09-23/ib-d2-reviewed-test-exclusions.json"), "utf8"));
    const candidatePath = path.join(ROOT, "tmp/ib-d2-reviewed-test-exclusions.candidate.json");
    fs.mkdirSync(path.dirname(candidatePath), { recursive: true });
    fs.writeFileSync(candidatePath, JSON.stringify(rebuilt, null, 2) + "\n");
    console.log("Assessment candidate written to " + path.relative(ROOT, candidatePath));
    const fields = [...new Set([...Object.keys(frozen), ...Object.keys(rebuilt)])];
    const changed = fields.filter(field => !Object.hasOwn(frozen, field) || !Object.hasOwn(rebuilt, field) || !isDeepStrictEqual(frozen[field], rebuilt[field]));
    console.log("Fields with differences anywhere in their content: " + changed.length);
    changed.forEach(field => console.log("  DIFFERENT " + field));
    console.log("Nothing has been promoted. Equality in this diagnostic is not release approval.");
    return changed.length ? 1 : 0;
  } catch (error) {
    console.error("Assessment diagnostic refused: " + error.message);
    console.error("Nothing has been promoted.");
    return 1;
  }
}
if (require.main === module) process.exitCode = main();
module.exports = { main };
