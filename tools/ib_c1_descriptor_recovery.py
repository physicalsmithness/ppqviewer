"""Apply delivered-workbook C1 example descriptors without changing part scope.

All sources, including the workbook, are read only. Versioned exemplar links
remain separate from the later 127-type SHMDriller vocabulary and dependencies.
"""
from __future__ import annotations

from collections import Counter
from copy import deepcopy
import csv
import hashlib
import json
from pathlib import Path
import re

import openpyxl

PAPERDB = Path(r"C:\CodexProjects\PaperDatabases")
RECOVERY = PAPERDB / "Physics Categorisation/outputs/priority_membership_recovery_c1_2026-09-12"
WORKBOOK = PAPERDB / "Physics Categorisation/returns/PACKET_007B_C1/c1_question_types.xlsx"
CORPUS = PAPERDB / "outputs/exports/ib_physics_archive_flat_v5.csv"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def witness(path):
    return {"path": str(path.resolve()), "sha256": digest(path.read_bytes())}


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def text(value):
    return "" if value is None else str(value)


def words(value):
    return re.sub(r"\s+", " ", text(value)).strip()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def load_recovery():
    files = [RECOVERY / name for name in ["manifest.json", "versioned_types.csv", "part_type_assignments.csv", "source_issues.csv", "HANDOVER.md"]]
    manifest = json.loads(files[0].read_text(encoding="utf-8-sig"))
    require(digest(WORKBOOK.read_bytes()) == manifest["source_workbook_sha256"], "Delivered C1 workbook bytes changed")
    require(digest(CORPUS.read_bytes()) == manifest["corpus_sha256"], "Recovered C1 corpus bytes changed")
    version = manifest["taxonomy_version"]
    require(version == "C1_007B_WORKBOOK_" + manifest["source_workbook_sha256"][:12], "C1 vocabulary version does not identify its workbook")
    types, assignments, issues = (read_csv(file) for file in files[1:4])
    book = openpyxl.load_workbook(WORKBOOK, read_only=True, data_only=True)
    try:
        values = list(book["Question types"].values)
        type_rows = {index: dict(zip(values[0], row)) for index, row in enumerate(values[1:], 2) if row[0]}
        values = list(book["Freer families"].values)
        family_rows = [dict(zip(values[0], row)) for row in values[1:] if row[0]]
    finally:
        book.close()
    require(len(types) == manifest["counts"]["types"] == len(type_rows), "Delivered C1 type count differs")
    require(len(assignments) == manifest["counts"]["memberships"], "Recovered C1 membership count differs")
    require(len({row["part_id"] for row in assignments}) == manifest["counts"]["distinct_parts"], "Recovered C1 source-part count differs")
    require(len({row["type_id"] for row in types}) == len(types), "Repeated recovered C1 type ID")
    require(len({(row["part_id"], row["type_id"]) for row in assignments}) == len(assignments), "Repeated recovered C1 example link")
    by_type = {}
    for row in types:
        source = type_rows.get(int(row["source_row"]))
        require(source is not None and all(row[key] == text(value) for key, value in source.items()), "Exported C1 type differs from its delivered workbook row")
        require(row["type_id"] == version + ":" + row["code"], "Recovered C1 code belongs to another vocabulary version")
        by_type[row["type_id"]] = row
    families = {}
    for row in family_rows:
        label = row["freer_family"]
        description = {"label": label, "summary": text(row["definition"]), "checks": [text(row["what_solving_one_feels_like"])]}
        require(label not in families or families[label] == description, "Conflicting delivered C1 family guidance")
        families[label] = description
    require(all(row["freer_family"] in families for row in types), "Recovered C1 type lacks its authored family")
    corpus_rows = read_csv(CORPUS)
    corpus = {row["part_id"]: row for row in corpus_rows}
    require(len(corpus) == len(corpus_rows), "Repeated C1 source-part IDs in corpus")
    conflict_pairs = {(row["part_id"], row["type_code"]) for row in issues}
    allowed_fields = {"question_text", "shared_stem", "parent_context", "ms_text", "ms_answer_text", "ms_notes_text"}
    for row in assignments:
        descriptor = by_type.get(row["type_id"])
        require(descriptor is not None and row["part_id"] in corpus, "Recovered C1 example has no exact type/source-ID join")
        require(re.fullmatch(r"ibchem_part_[a-f0-9]+", row["part_id"]), "Recovered C1 example lacks a native source ID")
        require(row["topic"] == "C.1" and row["source_type_code"] == descriptor["code"] and row["question_type"] == descriptor["question_type"], "Recovered C1 example/type identity differs")
        require(Path(row["source_workbook"]).resolve() == WORKBOOK.resolve() and row["source_sheet"] == "Question types" and row["source_row"] == descriptor["source_row"], "Recovered C1 workbook attribution differs")
        example = row["source_example"]
        require(example in ["1", "2"] and descriptor["example_" + example + "_part_id"] == row["part_id"] and descriptor["evidence_" + example] == row["source_evidence_quote"], "Recovered C1 exemplar is not present in the delivered workbook")
        require(row["join_confidence"] == "exact_source_id" and row["assignment_review_status"] == "recovered_explicit_example" and row["literal_evidence_status"] == "matched", "Recovered C1 example lacks an exact reviewed evidence match")
        require(row["needed_how"] == "" and row["role_status"] == "not assigned by this source", "Recovered C1 source role semantics changed")
        fields = row["literal_evidence_fields"].split("|")
        quote = words(row["source_evidence_quote"])
        require(quote and fields and set(fields).issubset(allowed_fields) and all(quote in words(corpus[row["part_id"]][field]) for field in fields), "Recovered C1 evidence quotation changed in the current source part")
        conflict = (row["part_id"], row["source_type_code"]) in conflict_pairs
        require(row["later_checkpoint_c1_conflict"] == str(conflict).lower(), "Recovered C1 conflict flags differ from the source issue list")
        retired = row["source_type_code"].startswith("C.1.X")
        require(row["current_scope"] == ("retired" if retired else "current_type"), "Recovered C1 current/retired type scope differs")
    return {"version": version, "types": types, "families": list(families.values()), "assignments": assignments,
            "corpus": corpus, "source_files": [witness(file) for file in [*files, WORKBOOK, CORPUS, Path(__file__)]]}


def apply_recovery(analysis, recovery):
    require(analysis["topic"] == "C.1", "C1 descriptors cannot enrich another topic")
    output = deepcopy(analysis)
    require("descriptor_example_recovery" not in output["report"], "C1 recovered descriptors have already been applied; rebuild from scope sources")
    initial_scope = {key: {field: deepcopy(value) for field, value in part.items() if field not in {"group_codes", "atom_codes", "primary_atom_code"}}
                     for key, part in output["parts"].items()}
    version = recovery["version"]
    family_codes = {}
    for index, family in enumerate(recovery["families"], 1):
        code = version + ":family:" + str(index)
        family_codes[family["label"]] = code
        output["groups"].append({**family, "code": code, "taxonomy_version": version})
    by_type = {row["type_id"]: row for row in recovery["types"]}
    for row in recovery["types"]:
        output["atoms"].append({"code": row["type_id"], "label": row["question_type"], "summary": row["recognition_trigger"],
                                "checks": [row["core_solving_route"]] if row["core_solving_route"] else [],
                                "group_code": family_codes[row["freer_family"]], "taxonomy_version": version,
                                "authored_code": row["code"], "authored_typical_setups": row["typical_setups"],
                                "authored_shape": row["freer_shape"]})
    require(len({item["code"] for item in output["atoms"]}) == len(output["atoms"]), "Recovered C1 vocabulary collides with an existing code")
    included, skipped = [], []
    for row in recovery["assignments"]:
        source_id = row["part_id"]
        part = output["parts"].get(source_id)
        reason = None
        if row["later_checkpoint_c1_conflict"] == "true":
            reason = "Conflicts with the later C1 checkpoint; no descriptor applied."
        elif row["current_scope"] != "current_type":
            reason = "Retired descriptor; no current membership applied."
        elif part is None or part["status"] != "included":
            reason = "The existing C1 scope does not include this source part."
        elif not re.fullmatch(r"20\d\d", recovery["corpus"][source_id]["year"]) or int(recovery["corpus"][source_id]["year"]) >= 2026:
            reason = "Source examination year is unavailable or reserved."
        if reason:
            skipped.append({"source_part_id": source_id, "type_id": row["type_id"], "reason": reason, "source_example": row})
            continue
        descriptor = by_type[row["type_id"]]
        for field, value in [("atom_codes", row["type_id"]), ("group_codes", family_codes[descriptor["freer_family"]])]:
            if value not in part[field]:
                part[field].append(value)
        part["primary_atom_code"] = part["atom_codes"][0] if len(part["atom_codes"]) == 1 else None
        included.append({"source_part_id": source_id, "type_id": row["type_id"], "source_example": row})
    # Scope, dependencies, canonical aliases and learner-level evidence are not
    # rewritten by examples from a different workbook vocabulary.
    final_scope = {key: {field: value for field, value in part.items() if field not in {"group_codes", "atom_codes", "primary_atom_code"}}
                   for key, part in output["parts"].items()}
    require(initial_scope == final_scope, "C1 descriptor enrichment changed scope or non-membership evidence")
    files = {item["path"]: item for item in output["report"]["source_files"]}
    for item in recovery["source_files"]:
        require(item["path"] not in files or files[item["path"]]["sha256"] == item["sha256"], "C1 source changed during descriptor enrichment")
        files[item["path"]] = item
    output["report"]["source_files"] = list(files.values())
    output["report"]["fine_classification_complete"] = False
    output["report"]["descriptor_example_recovery"] = {
        "taxonomy_version": version, "method": "Exact authored example memberships from the delivered versioned workbook; no extrapolation of scope, counts or roles.",
        "counts": {"versioned_types": len(recovery["types"]), "authored_families": len(recovery["families"]),
                   "source_example_memberships": len(recovery["assignments"]), "included_memberships": len(included),
                   "included_parts": len({row["source_part_id"] for row in included}), "skipped_memberships": len(skipped)},
        "included": included, "skipped": skipped,
        "role_note": "Example type membership is recorded. The source assigns no directly-assessed/prerequisite/alternative-route roles; used and optional atoms and reviewed syllabus roles remain unchanged.",
        "scope_sha256": digest(json.dumps(initial_scope, sort_keys=True, separators=(",", ":")).encode()),
        "assessment_exclusions_applied": False}
    counts = output["report"]["counts"]
    counts.update({"authored_types": len(output["atoms"]), "authored_families": len(output["groups"]),
                   "recovered_descriptor_memberships": len(included), "recovered_descriptor_parts": len({row["source_part_id"] for row in included}),
                   "included_without_fine_type": sum(part["status"] == "included" and not part["atom_codes"] for part in output["parts"].values())})
    output["report"]["limitations"].append("Delivered-workbook exemplar descriptors are versioned separately from the later SHMDriller checklist. Examples add labels to already included source parts; the mapping remains partial and all downstream test exclusions still apply.")
    return output


def enrich_analysis(analysis):
    return apply_recovery(analysis, load_recovery())
