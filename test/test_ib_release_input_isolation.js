"use strict";
// Read-only release/recovery projections in disposable child processes. Mutated
// preview bytes exist only in a temporary directory; no active input is replaced.
const assert = require("assert/strict"), fs = require("fs"), os = require("os"), path = require("path");
const {spawnSync} = require("child_process");
const ROOT = path.resolve(__dirname, ".."), local = file => path.join(ROOT, file);
const previewData = local("dist/physics-inputs/ib-data-analysis.json");
const previewD2 = local("dist/physics-inputs/ib-d2.json");
const drillerSyllabus = path.resolve(ROOT, "../Special Relativity Driller/data/syllabus_meta.yaml");
const pinnedData = local("reports/ib-release-inputs/ib-data-analysis.json");
const pinnedD2 = local("reports/ib-release-inputs/ib-d2-baseline.json");
const pinnedSyllabus = local("reports/ib-release-inputs/a5-syllabus-meta.yaml");
const samePath = (left, right) => path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase();

function worker(fixture, changed) {
  const {install} = require("../tools/ib-evidence-overlay");
  const replacements = changed ? new Map([
    [previewData, path.join(fixture, "invalid-data.json")],
    [previewD2, path.join(fixture, "different-d2.json")],
    [drillerSyllabus, path.join(fixture, "invalid-syllabus.yaml")]
  ]) : new Map();
  const originalRead = fs.readFileSync, originalWrite = fs.writeFileSync;
  const restore = install({replacements, writableRoot:fixture});
  let result;
  try {
    const {ibInput} = require("../tools/assemble_physics_preview");
    const {build} = require("../tools/build_ib_d2_recovery");
    if (changed) {
      for (const [active, replacement] of replacements)
        assert.equal(fs.readFileSync(active, "utf8"), fs.readFileSync(replacement, "utf8"), "Fixture must actually replace this read: " + active);
      // A control proves ordinary previews still consume their own mutable input.
      assert.throws(() => ibInput(), SyntaxError, "An invalid preview supplement must break the ordinary preview projection");
    }
    const release = ibInput({release:true}), recovery = build();
    assert(release.questions.length && recovery.questions.length, "Isolation must compare nonempty real projections");
    assert(samePath(release.report.data_analysis_supplement.path, pinnedData), "Release DATA must identify its pinned input");
    assert(samePath(release.report.d2_supplement.path, pinnedD2), "Release D2 must identify its pinned baseline");
    assert(recovery.report.source_files.some(file => samePath(file.path, pinnedD2)), "Recovery must fingerprint the pinned historical baseline");
    assert(!recovery.report.source_files.some(file => samePath(file.path, previewD2)), "Recovery must not fingerprint mutable preview D2");
    const a5Sources = release.report.a5_analysis.report.source_files;
    assert(a5Sources.some(file => samePath(file.path, pinnedSyllabus)), "A5 evidence must identify the reviewed syllabus snapshot");
    assert(!a5Sources.some(file => samePath(file.path, drillerSyllabus)), "Release A5 must not depend on the Driller working syllabus");
    result = {release, recovery};
  } finally {
    restore();
    assert.equal(fs.readFileSync, originalRead, "Worker must restore filesystem reads");
    assert.equal(fs.writeFileSync, originalWrite, "Worker must restore filesystem writes");
  }
  process.stdout.write(JSON.stringify(result));
}

function main() {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "ib-release-input-isolation-"));
  const protectedPaths = [previewData, previewD2, drillerSyllabus, pinnedData, pinnedD2, pinnedSyllabus,
    local("dist/physics-inputs/ib-a5-analysis.json")];
  const before = new Map(protectedPaths.map(file => [file, fs.existsSync(file) ? fs.readFileSync(file) : null]));
  const run = changed => {
    const child = spawnSync(process.execPath, [__filename, "--worker", fixture, changed ? "changed" : "baseline"], {
      cwd:ROOT, encoding:"utf8", maxBuffer:128 * 1024 * 1024, timeout:300000, windowsHide:true
    });
    if (child.error) throw child.error;
    assert.equal(child.status, 0, (changed ? "Altered-preview" : "Baseline") + " worker failed:\n" + child.stderr);
    return JSON.parse(child.stdout);
  };
  try {
    fs.writeFileSync(path.join(fixture, "invalid-data.json"), "INVALID PREVIEW DATA: this must never enter a release\n");
    fs.writeFileSync(path.join(fixture, "different-d2.json"), JSON.stringify({questions:[], report:{reviewed_crop_defects:{test:"changed preview"}}}));
    fs.writeFileSync(path.join(fixture, "invalid-syllabus.yaml"), "[invalid: Driller working tree changed\n");
    const baseline = run(false), changed = run(true);
    // Compare every field, including metadata, memberships, holds and source
    // fingerprints. Equal item counts alone would miss changed content/evidence.
    assert(JSON.stringify(changed.release) === JSON.stringify(baseline.release), "Full release projection changed when only mutable previews/Driller syllabus changed");
    console.log("PASS release input is identical with invalid DATA, different D2 and invalid Driller syllabus previews");
    assert(JSON.stringify(changed.recovery) === JSON.stringify(baseline.recovery), "Full D2 recovery changed when only mutable preview inputs changed");
    console.log("PASS D2 recovery retains identical questions, holds, memberships and provenance across preview changes");
    for (const [file, bytes] of before) {
      assert.equal(fs.existsSync(file), bytes !== null, "Active input existence changed: " + file);
      if (bytes) assert(fs.readFileSync(file).equals(bytes), "Active input bytes changed: " + file);
    }
    console.log("PASS ordinary preview control rejects its invalid supplement; active inputs remain byte-for-byte unchanged");
  } finally {
    const resolved = path.resolve(fixture), tempRoot = path.resolve(os.tmpdir());
    assert(path.dirname(resolved) === tempRoot && path.basename(resolved).startsWith("ib-release-input-isolation-"));
    fs.rmSync(resolved, {recursive:true, force:true});
  }
}

try {
  if (process.argv[2] === "--worker") worker(path.resolve(process.argv[3]), process.argv[4] === "changed");
  else main();
} catch (error) { console.error(error); process.exitCode = 1; }
