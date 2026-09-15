"use strict";
// Add only separately cleared D2 records. Preserve stable question identities
// and require the existing topics' source content to agree before merging.
const assert = require("node:assert/strict");
const union = values => [...new Set(values)];
const membershipFields = ["topic_codes", "analysis_groups", "analysis_atoms", "analysis_types",
  "analysis_used_atoms", "analysis_optional_atoms", "analysis_canonical_ids"];
const contentFields = ["id", "parent_id", "source_part_id", "year", "paper", "level",
  "question_number", "label", "marks", "question_images", "context_images", "markscheme_images"];

function mergeD2Release(existing, cleared) {
  assert(Array.isArray(existing) && Array.isArray(cleared));
  const result = existing.map(q => structuredClone(q));
  const bySource = new Map(), byId = new Map();
  for (const q of result) {
    assert(q.id && q.source_part_id && !bySource.has(q.source_part_id) && !byId.has(q.id), "Duplicate existing question identity");
    bySource.set(q.source_part_id, q); byId.set(q.id, q);
  }
  const seen = new Set();
  for (const q of cleared) {
    assert(q.id && /^ibchem_part_[a-f0-9]+$/.test(q.source_part_id || "") && !seen.has(q.source_part_id), "Duplicate or missing cleared D2 source identity");
    seen.add(q.source_part_id);
    assert.deepEqual(q.topic_codes, ["D.2"], "D2 release input must be scoped to D2 only");
    assert(q.analysis_atoms?.length && q.analysis_groups?.length, "D2 part lacks directly authored descriptors");
    assert(/^\d{4}$/.test(String(q.year)) && Number(q.year) >= 2004 && Number(q.year) < 2026, "Reserved or invalid D2 exam year");
    const prior = bySource.get(q.source_part_id);
    if (!prior) {
      assert(!byId.has(q.id), "D2 part ID aliases another source part");
      const added = structuredClone(q);
      result.push(added); bySource.set(q.source_part_id, added); byId.set(q.id, added);
      continue;
    }
    for (const field of contentFields) assert.deepEqual(q[field], prior[field], "D2 source content differs from an existing topic: " + field + " " + q.id);
    if (q.correct_option && prior.correct_option) assert.equal(q.correct_option, prior.correct_option, "Conflicting source answer keys");
    for (const field of membershipFields) prior[field] = union([...(prior[field] || []), ...(q[field] || [])]);
    if (q.current_topic_levels) {
      prior.current_topic_levels ||= {};
      for (const [topic, level] of Object.entries(q.current_topic_levels)) {
        assert.equal(topic, "D.2", "D2 current-level metadata crossed topics");
        assert(!prior.current_topic_levels[topic] || prior.current_topic_levels[topic] === level, "Conflicting current syllabus levels");
        prior.current_topic_levels[topic] = level;
      }
    }
    if (!prior.correct_option && q.correct_option) {
      prior.correct_option = q.correct_option;
      prior.answer_status = q.answer_status;
    }
  }
  return result;
}
module.exports = {mergeD2Release};
