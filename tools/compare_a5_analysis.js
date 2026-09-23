"use strict";
// Compare a freshly built A5 analysis against the one currently in dist/.
//
// The assembler fingerprints every source the A5 analysis was built from, and refuses
// to build when one of them changes. That refusal is correct and must never be answered
// by editing a recorded sha. The honest answer is to rebuild the analysis and prove that
// the rebuild changed nothing a learner sees.
//
// So this compares everything EXCEPT report.source_files and report.builder, which are
// the fingerprints themselves. Identical => the source change did not reach the release,
// and the rebuilt analysis can be promoted. Different => stop, and a human looks.
//
// Usage: node tools/compare_a5_analysis.js <candidate.json> <current.json>
// Exit 0 identical apart from fingerprints, 1 otherwise.

const fs = require("fs");

function load(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function withoutFingerprints(doc) {
  const copy = JSON.parse(JSON.stringify(doc));
  if (copy.report) {
    delete copy.report.source_files;
    delete copy.report.builder;
  }
  return copy;
}

function differences(a, b, path, out) {
  if (out.length >= 40) return out;
  const ta = a === null ? "null" : Array.isArray(a) ? "array" : typeof a;
  const tb = b === null ? "null" : Array.isArray(b) ? "array" : typeof b;
  if (ta !== tb) {
    out.push(path + ": type " + ta + " -> " + tb);
    return out;
  }
  if (ta === "array") {
    if (a.length !== b.length) out.push(path + ": length " + a.length + " -> " + b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) differences(a[i], b[i], path + "[" + i + "]", out);
    return out;
  }
  if (ta === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      if (!(key in a)) { out.push(path + "." + key + ": added"); continue; }
      if (!(key in b)) { out.push(path + "." + key + ": removed"); continue; }
      differences(a[key], b[key], path + "." + key, out);
    }
    return out;
  }
  if (a !== b) out.push(path + ": " + JSON.stringify(a) + " -> " + JSON.stringify(b));
  return out;
}

function fingerprintDelta(candidate, current) {
  const before = new Map((current.report.source_files || []).map(f => [f.path, f.sha256]));
  const after = new Map((candidate.report.source_files || []).map(f => [f.path, f.sha256]));
  const moved = [];
  for (const [file, sha] of after) {
    const was = before.get(file);
    if (was === undefined) moved.push("NEW    " + file);
    else if (was !== sha) moved.push("CHANGED " + file + "\n         " + was.slice(0, 16) + " -> " + sha.slice(0, 16));
  }
  for (const file of before.keys()) if (!after.has(file)) moved.push("GONE   " + file);
  const builderBefore = current.report.builder && current.report.builder.sha256;
  const builderAfter = candidate.report.builder && candidate.report.builder.sha256;
  if (builderBefore !== builderAfter) moved.push("CHANGED (builder) " + candidate.report.builder.path);
  return moved;
}

const [candidatePath, currentPath] = process.argv.slice(2);
if (!candidatePath || !currentPath) {
  console.error("Usage: node tools/compare_a5_analysis.js <candidate.json> <current.json>");
  process.exit(2);
}

const candidate = load(candidatePath), current = load(currentPath);
const found = differences(withoutFingerprints(candidate), withoutFingerprints(current), "analysis", []);
const moved = fingerprintDelta(candidate, current);

console.log("Fingerprints that moved: " + (moved.length || "none"));
for (const line of moved) console.log("  " + line);
console.log("");
const size = value => value === undefined || value === null ? "n/a"
  : Array.isArray(value) ? value.length : Object.keys(value).length;
console.log("Groups: " + size(candidate.groups) + " (was " + size(current.groups) + ")");
console.log("Parts:  " + size(candidate.parts) + " (was " + size(current.parts) + ")");
console.log("");

if (!found.length) {
  console.log("IDENTICAL apart from fingerprints. The source change did not reach the release.");
  process.exit(0);
}
console.log("DIFFERENT in " + found.length + " place(s). The source change DOES reach the release:");
for (const line of found) console.log("  " + line);
process.exit(1);
