"use strict";
// Private, source-bound topic overlays. Only pupil-facing labels and memberships
// are projected into the public catalogue; review evidence remains local.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..");
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const ensure = (ok, message) => { if (!ok) throw Error(message); };
const unique = values => [...new Set(values.filter(Boolean))];
function validateLevelFields(record, label) {
  ensure(!record.current_level || /^(SL|HL|HLSL)$/.test(record.current_level), "Unknown current level: " + label);
  if (Object.hasOwn(record, "current_levels")) ensure(Array.isArray(record.current_levels) &&
    record.current_levels.every(level => ["SL", "HL"].includes(level)) &&
    new Set(record.current_levels).size === record.current_levels.length, "Invalid authored current-level array: " + label);
}

function loadReviewedTopics(files = []) {
  const topics = files.map(file => {
    const filename = path.resolve(ROOT, file);
    const bytes = fs.readFileSync(filename), input = JSON.parse(bytes);
    ensure(input.schema_version === 1 && /^(A\.1|C\.1)$/.test(input.topic), "Unsupported reviewed IB topic: " + filename);
    ensure(input.label && input.parts && Array.isArray(input.atoms) && input.atoms.length, "Reviewed topic lacks its taxonomy: " + filename);
    validateLevelFields(input, input.topic);
    for (const kind of ["groups", "atoms", "types"]) {
      ensure(Array.isArray(input[kind]), "Missing reviewed taxonomy collection: " + kind);
      ensure(input[kind].every(item => item.code && item.label), "Incomplete reviewed taxonomy label");
      ensure(new Set(input[kind].map(item => item.code)).size === input[kind].length, "Repeated taxonomy code");
    }
    const sourceFiles = input.report?.source_files;
    ensure(Array.isArray(sourceFiles) && sourceFiles.length && input.report.builder, "Reviewed topic provenance is missing");
    for (const witness of [...sourceFiles, input.report.builder]) {
      ensure(witness.path && witness.sha256 && fs.existsSync(witness.path) && sha(fs.readFileSync(witness.path)) === witness.sha256,
        "Reviewed topic source changed: " + witness.path);
    }
    const sets = Object.fromEntries(["groups", "atoms", "types"].map(kind => [kind, new Set(input[kind].map(item => item.code))]));
    for (const [id, record] of Object.entries(input.parts)) {
      ensure(/^ibchem_part_[a-f0-9]+$/.test(id), "Topic overlay must use archive source-part IDs");
      ensure(["included", "excluded", "unmapped"].includes(record.status), "Unreviewed topic disposition: " + id);
      for (const [field, kind] of [["group_codes", "groups"], ["atom_codes", "atoms"], ["type_codes", "types"], ["used_atom_codes", "atoms"], ["optional_atom_codes", "atoms"]]) {
        ensure(Array.isArray(record[field]) && record[field].every(code => sets[kind].has(code)), "Unknown " + field + " for " + id);
      }
      ensure(record.status !== "included" || record.atom_codes.length || record.scope_reviewed === true,
        "Included topic part lacks both a direct question type and an explicit scope review: " + id);
      validateLevelFields(record, id);
    }
    return {...input, input_path: filename, input_sha256: sha(bytes)};
  });
  ensure(new Set(topics.map(topic => topic.topic)).size === topics.length, "Duplicate reviewed topic input");
  return topics;
}

function topicMemberships(sourceId, selected, reviewedTopics) {
  const members = reviewedTopics.filter(topic => selected.includes(topic.topic)).map(topic => ({topic, part: topic.parts[sourceId]}));
  ensure(members.every(member => member.part?.status === "included"), "Topic record was not directly included");
  return {
    analysis_groups: unique(members.flatMap(member => member.part.group_codes)),
    analysis_atoms: unique(members.flatMap(member => member.part.atom_codes)),
    analysis_types: unique(members.flatMap(member => member.part.type_codes)),
    analysis_used_atoms: unique(members.flatMap(member => member.part.used_atom_codes)),
    analysis_optional_atoms: unique(members.flatMap(member => member.part.optional_atom_codes)),
    analysis_canonical_ids: unique(members.flatMap(member => (member.part.canonical_row_ids || []).map(id => member.topic.topic + ":" + id))),
    current_topic_levels: Object.fromEntries(members.map(member => {
      const explicit = member.part.current_level || member.topic.current_level;
      const levels = member.part.current_levels || member.topic.current_levels || [];
      const level = explicit || (levels.includes("SL") && levels.includes("HL") ? "HLSL" : levels.length === 1 && /^(SL|HL)$/.test(levels[0]) ? levels[0] : null);
      return [member.topic.topic, level];
    }).filter(([,level]) => level))
  };
}

function publicTaxonomy(items) {
  return items.map(item => ({code: item.code, label: item.label,
    ...(item.authored_code ? {display_code: item.authored_code} : {}),
    ...(item.summary ? {summary: item.summary} : {}),
    ...(item.checks?.length ? {checks: item.checks} : {}),
    ...(item.classification_note ? {classification_note: item.classification_note} : {})}));
}

module.exports = {loadReviewedTopics, topicMemberships, publicTaxonomy};
