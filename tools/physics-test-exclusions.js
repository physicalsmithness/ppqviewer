"use strict";

// Publication reservations deliberately include uncertain candidate links. They
// are not adjudicated claims that the test and archive questions are identical.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/** Parse UTF-8 CSV, including quoted newlines, commas and escaped quotes. */
function parseCsv(input, selectedColumns) {
  const text = String(input).replace(/^\uFEFF/, "");
  const records = [], selected = selectedColumns ? new Set(selectedColumns) : null;
  let headers = null, record = {}, column = 0, fieldStart = 0, quoted = false, fieldQuoted = false;
  let headerFields = [], rowHasValue = false, closedQuote = false;
  function finishField(end) {
    let value = text.slice(fieldStart, end);
    if (fieldQuoted) value = value.slice(1, -1).replace(/""/g, '"');
    if (value) rowHasValue = true;
    if (!headers) headerFields.push(value);
    else if (!selected || selected.has(headers[column])) record[headers[column]] = value;
    column += 1; fieldQuoted = false; closedQuote = false;
  }
  function finishRecord() {
    if (rowHasValue || column > 1) {
      if (!headers) {
        headers = headerFields; headerFields = [];
        if (new Set(headers).size !== headers.length) throw new Error("Duplicate CSV header");
      } else {
        if (column !== headers.length) throw new Error(`CSV row ${records.length + 2} has ${column} columns; expected ${headers.length}`);
        records.push(record);
      }
    }
    record = {}; column = 0; rowHasValue = false;
  }
  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];
    if (quoted) {
      if (character === '"' && text[i + 1] === '"') i += 1;
      else if (character === '"') { quoted = false; closedQuote = true; }
    } else if (character === '"' && i === fieldStart) { quoted = true; fieldQuoted = true; }
    else if (character === ",") { finishField(i); fieldStart = i + 1; }
    else if (character === "\r" || character === "\n") {
      finishField(i); finishRecord();
      if (character === "\r" && text[i + 1] === "\n") i += 1;
      fieldStart = i + 1;
    } else if (closedQuote) throw new Error("Unexpected content after closing CSV quote");
  }
  if (quoted) throw new Error("Unterminated quoted CSV field");
  if (column || fieldStart < text.length) { finishField(text.length); finishRecord(); }
  return records;
}

function increment(counts, key) { counts[key || "blank"] = (counts[key || "blank"] || 0) + 1; }
function addIndex(index, key, value) {
  if (!key) return;
  if (!index.has(key)) index.set(key, []);
  index.get(key).push(value);
}
function identifiers(value) { return String(value || "").match(/ibchem_(?:part|xlvl)_[a-f0-9]+/g) || []; }
function parentKey(row) { return `${row.preview}\u0000${row.question}`; }
function viewerParentId(row) {
  return `${row.year.slice(-2)}${row.session[0].toUpperCase()}.P${row.paper}.${row.level}.${row.time_zone || "TZ0"}.Q${row.question}`;
}

/**
 * Reserve all archive candidates associated with tests, including proposals.
 * Uses the entire corpus before mapping reservations onto the selected viewer
 * records, so an omitted sibling cannot reappear through a whole-question crop.
 * Reads only; callers own all output and asset publication decisions.
 */
function buildIbExclusions({ paperdbRoot, questions, extraExclusionsPath, extraExclusionsPaths = [] }) {
  if (!paperdbRoot || !Array.isArray(questions)) throw new Error("paperdbRoot and questions are required");
  const root = path.resolve(paperdbRoot);
  const sourceFiles = [];
  function readCsv(relativePath, requiredColumns) {
    const filename = path.join(root, ...relativePath.split("/"));
    const bytes = fs.readFileSync(filename);
    const rows = parseCsv(bytes.toString("utf8"), requiredColumns);
    if (!rows.length || requiredColumns.some(column => !(column in rows[0]))) {
      throw new Error(`Missing rows or required columns in ${relativePath}`);
    }
    sourceFiles.push({ path: relativePath, sha256: crypto.createHash("sha256").update(bytes).digest("hex"), rows: rows.length });
    return rows;
  }
  const corpus = readCsv("outputs/exports/ib_physics_archive_flat_v5.csv", ["part_id", "preview", "question", "cross_level_group_id", "duplicate_of", "year", "session", "paper", "level", "time_zone", "page_render_paths"]);
  const packet = "Physics Categorisation/returns/PACKET_006D/";
  const ledger = readCsv(packet + "source_results_v4.csv", ["source_part_id", "source_file", "source_kind", "final_status", "proposed_verdict", "stage2_status", "matched_part_id", "matched_group_id", "rank1_part_id", "rank1_group_id", "derived_from"]);
  const matches = readCsv(packet + "matches.csv", ["source_part_id", "candidate_part_id", "candidate_group_id", "derived_from"]);
  const tests = ledger.filter(row => row.source_kind === "test");
  if (!tests.length) throw new Error("No test rows available: refusing an unprotected IB build");
  const testIds = new Set(tests.map(row => row.source_part_id));
  const byPart = new Map(), byParent = new Map(), byGroup = new Map(), duplicateLinks = new Map();
  for (const row of corpus) {
    if (byPart.has(row.part_id)) throw new Error(`Duplicate archive source part: ${row.part_id}`);
    byPart.set(row.part_id, row);
    addIndex(byParent, parentKey(row), row.part_id);
    addIndex(byGroup, row.cross_level_group_id, row.part_id);
    if (row.duplicate_of) {
      addIndex(duplicateLinks, row.part_id, row.duplicate_of);
      addIndex(duplicateLinks, row.duplicate_of, row.part_id);
    }
  }

  const blockedSourceIds = new Set(), blockedGroups = new Set(), blockedParentKeys = new Set();
  const unknownLinkedIds = new Set(), directLinkedSourceIds = new Set(), testIdsWithKnownLinks = new Set();
  const queue = [], reservationReasons = {}, proposalCounts = {}, stage2Counts = {};
  function reservePart(id, reason, direct) {
    if (!byPart.has(id)) { unknownLinkedIds.add(id); return false; }
    if (direct) directLinkedSourceIds.add(id);
    if (!blockedSourceIds.has(id)) {
      blockedSourceIds.add(id); queue.push(id); increment(reservationReasons, reason);
    }
    return true;
  }
  function reserveGroup(id, reason, direct) {
    if (byPart.has(id)) return reservePart(id, reason, direct);
    const members = byGroup.get(id);
    if (!members) { unknownLinkedIds.add(id); return false; }
    if (!blockedGroups.has(id)) {
      blockedGroups.add(id);
      members.forEach(member => reservePart(member, reason, direct));
    } else if (direct) members.forEach(member => directLinkedSourceIds.add(member));
    return true;
  }
  function seed(value, reason, sourceId) {
    for (const id of identifiers(value)) {
      if (reserveGroup(id, reason, true)) testIdsWithKnownLinks.add(sourceId);
    }
  }
  let candidateRows = 0;
  for (const row of matches) {
    if (!testIds.has(row.source_part_id)) continue;
    candidateRows += 1;
    seed(row.candidate_part_id, "test_candidate_or_proposal", row.source_part_id);
    seed(row.candidate_group_id, "test_candidate_or_proposal", row.source_part_id);
    seed(row.derived_from, "test_derived_candidate", row.source_part_id);
  }
  for (const row of tests) {
    increment(proposalCounts, row.proposed_verdict);
    increment(stage2Counts, row.stage2_status);
    for (const column of ["matched_part_id", "matched_group_id", "rank1_part_id", "rank1_group_id"]) {
      seed(row[column], "test_ledger_link_or_proposal", row.source_part_id);
    }
    seed(row.derived_from, "test_derived_candidate", row.source_part_id);
  }
  let currentTestComparison = null;
  const additionalTestComparisons = [];
  for (const comparisonPath of [...new Set([extraExclusionsPath,...extraExclusionsPaths].filter(Boolean))]) {
    const bytes = fs.readFileSync(comparisonPath);
    const additional = JSON.parse(bytes.toString("utf8"));
    if (additional.schema_version !== 1 || !Array.isArray(additional.blocked_source_ids) || !Array.isArray(additional.source_files)) {
      throw new Error("Invalid additional IB test comparison schema");
    }
    if (additional.read_failures?.length) throw new Error("Current IB test comparison contains unreadable source files");
    if (additional.corpus_sha256 !== sourceFiles[0].sha256) throw new Error("Current IB test comparison used a different archive revision");
    sourceFiles.push({ path: path.resolve(comparisonPath), sha256: crypto.createHash("sha256").update(bytes).digest("hex"), rows: additional.blocked_source_ids.length });
    for (const id of additional.blocked_source_ids) {
      if (!reservePart(id, "current_shared_drive_test_candidate", true)) throw new Error("Reviewed test reservation is missing from the current archive: " + id);
    }
    const comparison = {
      path: path.resolve(comparisonPath),
      sourceRoot: additional.source_root,
      createdUtc: additional.created_utc,
      counts: additional.counts,
      sources: additional.source_files,
      limitations: additional.limitations,
      completeTestExclusionCertified: false
    };
    if (!currentTestComparison) currentTestComparison = comparison;
    additionalTestComparisons.push(comparison);
  }

  // Breadth-first closure across whole questions, cross-level twins and both
  // directions of duplicate links. Each newly reached part is processed once.
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const id = queue[cursor], row = byPart.get(id), parent = parentKey(row);
    if (!blockedParentKeys.has(parent)) {
      blockedParentKeys.add(parent);
      byParent.get(parent).forEach(sibling => reservePart(sibling, "whole_question_sibling", false));
    }
    if (row.cross_level_group_id) reserveGroup(row.cross_level_group_id, "cross_level_twin", false);
    for (const duplicate of duplicateLinks.get(id) || []) reservePart(duplicate, "duplicate_link", false);
  }

  const blockedParentIds = new Set(), blockedQuestionPageKeys = new Set();
  for (const id of blockedSourceIds) {
    const row = byPart.get(id);
    blockedParentIds.add(viewerParentId(row));
    for (const relativePath of String(row.page_render_paths || "").split(";")) {
      const file = relativePath.replace(/\\/g, "/").split("/").pop();
      if (/^question_.*\.png$/i.test(file)) blockedQuestionPageKeys.add(`${row.preview}/${file}`);
    }
  }
  let selectedParts = 0, blockedSelectedParts = 0, blockedSelectedParents = 0;
  const remainingTopicParts = {}, remainingPaperParts = {};
  for (const question of questions) {
    let blocked = blockedParentKeys.has(parentKey(question)) || blockedParentIds.has(question.id);
    for (const part of question.parts || []) {
      if (!byPart.has(part.source_part_id)) throw new Error(`Viewer part missing from source corpus: ${part.source_part_id}`);
      if (blockedSourceIds.has(part.source_part_id)) blocked = true;
    }
    if (blocked) { blockedParentIds.add(question.id); blockedSelectedParents += 1; }
    for (const part of question.parts || []) {
      selectedParts += 1;
      if (blocked) blockedSelectedParts += 1;
      else {
        (part.topic_codes || question.topic_codes || []).forEach(topic => increment(remainingTopicParts, topic));
        increment(remainingPaperParts, question.paper);
      }
    }
  }

  const unresolvedWithoutKnownArchiveLink = tests.filter(row => !testIdsWithKnownLinks.has(row.source_part_id));
  const report = {
    policy: "Conservative publication reservation of every test candidate and proposal, expanded through full archive questions, HL/SL twins and duplicate links.",
    candidatesAreConfirmedMatches: false,
    completeTestExclusionCertified: false,
    sourceFiles,
    counts: {
      corpusParts: corpus.length, testRows: tests.length,
      testSourceFiles: new Set(tests.map(row => row.source_file)).size,
      testCandidateRows: candidateRows, directlyLinkedArchiveParts: directLinkedSourceIds.size,
      blockedArchiveParts: blockedSourceIds.size, blockedArchiveParents: blockedParentKeys.size,
      blockedCrossLevelGroups: blockedGroups.size, blockedQuestionPages: blockedQuestionPageKeys.size,
      selectedParents: questions.length, selectedParts,
      blockedSelectedParents, blockedSelectedParts,
      remainingSelectedParents: questions.length - blockedSelectedParents,
      remainingSelectedParts: selectedParts - blockedSelectedParts,
      testRowsWithoutFinalAdjudication: tests.filter(row => !row.final_status).length,
      testRowsWithNoCandidate: tests.filter(row => row.stage2_status === "no_candidate").length,
      testRowsWithoutKnownArchiveLink: unresolvedWithoutKnownArchiveLink.length,
      unresolvedNonBespokeRowsWithoutKnownArchiveLink: unresolvedWithoutKnownArchiveLink.filter(row => row.proposed_verdict !== "bespoke").length,
      unknownLinkedIdentifiers: unknownLinkedIds.size
    },
    reservationReasons, proposalCounts, stage2Counts, remainingTopicParts, remainingPaperParts,
    currentTestComparison, additionalTestComparisons,
    unknownLinkedIdentifiers: [...unknownLinkedIds].sort(),
    limitations: [
      "Candidate and semantic proposal links are withheld as a precaution; these are not confirmed test matches.",
      "Unmatched, ambiguous and extraction-limited test rows remain in the source evidence. Absence of a candidate is not proof that a practice question is absent from tests.",
      "Whole parent questions are reserved using the complete corpus, including siblings omitted from the selected catalogue.",
      "A shared page or incorrectly broad crop can still expose adjacent reserved content. Publish only independently checked question crops, or reject any asset overlapping blockedQuestionPageKeys; do not offer full-page or original-document fallbacks.",
      "Only the supplied PACKET_006D test population is covered; tests added or changed after that evidence was produced need another matching pass."
    ]
  };
  return { blockedParentIds, blockedSourceIds, blockedGroups, blockedQuestionPageKeys, report };
}

module.exports = { buildIbExclusions, parseCsv };
