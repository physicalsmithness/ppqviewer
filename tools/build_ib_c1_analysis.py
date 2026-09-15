"""Read authored C1 scope decisions and vocabulary into an unserved viewer input.

No workbook or source-corpus writes. Fine question types are assigned only by an
explicit native-ID crosswalk; syllabus dependencies never fabricate such types.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path
import re
import warnings

import openpyxl
from ib_c1_descriptor_recovery import enrich_analysis

ROOT = Path(__file__).resolve().parents[1]
PAPERDB = Path(r"C:\CodexProjects\PaperDatabases")
PHYSICS = PAPERDB / "Physics Categorisation"
SHM = Path(r"C:\Claude (not on Gdrive, nor OneDrive)\SHMDriller")
TAX = SHM / "tools/taxonomy_build"
RETURN = PHYSICS / "returns/PACKET_015_C1"
CHECKPOINT = RETURN / "_checkpoints/seq_0352"
# This release's assessment comparison covers the completed first checkpoint.
# Later appended source judgements require their own candidate/test review.
CHECKPOINT_HASHES = {
    "syllabus_tags.csv": "de5822b1ab5dcb379a73e876039970d7b5191b9abc06261cb0e643c3a1448c70",
    "mark_categories.csv": "0ac203e5e26b671b15a0caf2b13d1b4192b82bedc7847892bfb9be9541396bd5",
}
NATIVE = PHYSICS / "viewer/ibphysics_parts_index.json"
FLAT = PAPERDB / "outputs/exports/ib_physics_archive_flat_v5.csv"
BOOK = SHM / "reference/C1_counts_dependencies_and_marks.xlsx"
SUPPLIED_BOOKS = [
    Path(r"C:\Users\patri\OneDrive\Documents\Claude\Projects\_ClaudeBackups\SHMDriller\reference\C1_counts_dependencies_and_marks.xlsx"),
    Path(r"C:\Users\patri\Downloads\IB_C1_SHM_question_counts_dependencies_and_marks (1).xlsx"),
]
JOIN_FILE = ROOT / "reports/ib-c1-reviewed-native-joins.json"


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def fingerprint(path):
    return {"path": str(path.resolve()), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def unique(values):
    return list(dict.fromkeys(values))


def row_sha(row):
    return hashlib.sha256(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def words(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def paths(row, key):
    base = PAPERDB / "outputs/previews" / row["preview"]
    return [base / text.strip() for text in row.get(key, "").split(";") if text.strip()]


def reviewed_checkpoint():
    """Validate live continuity, then use the immutable, already-assessed scope."""
    snapshots = {}
    for name, expected in CHECKPOINT_HASHES.items():
        if fingerprint(CHECKPOINT / name)["sha256"] != expected:
            raise ValueError("Approved C1 checkpoint snapshot changed: " + name)
        snapshots[name] = read_csv(CHECKPOINT / name)
    ids = {row["part_id"] for row in snapshots["syllabus_tags.csv"]}
    if len(ids) != 352:
        raise ValueError("Approved C1 checkpoint must contain exactly its 352 reviewed IDs")
    continuity = []
    for name, snapshot in snapshots.items():
        current = read_csv(RETURN / name)
        # Check both the ordered prefix and every occurrence of an approved ID:
        # an appended correction to an old part must not evade this comparison.
        if current[:len(snapshot)] != snapshot or [row for row in current if row["part_id"] in ids] != snapshot:
            raise ValueError("Live C1 source changed within the approved checkpoint: " + name)
        continuity.append({"source": str(RETURN / name), "checkpoint_source": str(CHECKPOINT / name),
                           "approved_rows": len(snapshot), "current_rows": len(current),
                           "current_source_ids": len({row["part_id"] for row in current}),
                           "ordered_prefix_equal": True, "all_approved_id_rows_equal": True})
    return snapshots, {"checkpoint_inputs": 352, "source_directory": str(CHECKPOINT),
                       "continuity": continuity,
                       "policy": "Only the completed, already-assessed 352-ID checkpoint supplies scope and level hints. Later appended IDs remain outside this release until separately reviewed against current assessments."}


def build():
    source_files = [BOOK, *SUPPLIED_BOOKS, SHM / "reference/C1_QUESTION_TYPES.md",
                    SHM / "reference/C1_SOURCES.md", TAX / "tax_content.json", TAX / "items.json",
                    TAX / "typeshares.json", TAX / "typeconcept.json", TAX / "build_tax.py",
                    RETURN / "FEEDBACK_015.md", RETURN / "syllabus_tags.csv",
                    RETURN / "mark_categories.csv", CHECKPOINT / "FEEDBACK_015.md",
                    CHECKPOINT / "syllabus_tags.csv", CHECKPOINT / "mark_categories.csv",
                    PHYSICS / "syllabus_spine.csv", NATIVE, FLAT]
    # Read, never save: openpyxl's unsupported-style warnings concern a write we
    # deliberately do not perform. All three supplied copies must agree exactly.
    fingerprints = [fingerprint(path) for path in source_files]
    checkpoint, checkpoint_report = reviewed_checkpoint()
    book_hashes = {fingerprint(path)["sha256"] for path in [BOOK, *SUPPLIED_BOOKS]}
    if len(book_hashes) != 1:
        raise ValueError("The supplied C1 counting workbooks differ; source selection requires review.")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", UserWarning)
        book = openpyxl.load_workbook(BOOK, read_only=True, data_only=True)
        values = list(book["Question inventory"].values)
        inventory = [dict(zip(values[0], row)) for row in values[1:] if row[0]]
        dependencies = list(book["Dependency edges"].values)
        book.close()
    model, shares, items = read_json(TAX / "tax_content.json"), read_json(TAX / "typeshares.json"), read_json(TAX / "items.json")
    concept_types = read_json(TAX / "typeconcept.json")
    by_alias = {row["Canonical ID"]: row for row in inventory}
    if len(by_alias) != 206 or set(by_alias) != set(shares["map"]) or set(by_alias) != {row["id"] for row in items}:
        raise ValueError("Authored C1 inventory/type mapping identities disagree.")
    for item in items:
        if item["desc"] != by_alias[item["id"]]["Short description"]:
            raise ValueError("Authored C1 inventory description differs: " + item["id"])
    groups, atoms, guidance = [], [], {}
    for family in model["families"]:
        group_code = "C1-" + family["code"]
        groups.append({"code": group_code, "label": family["title"], "summary": family["intro"], "checks": [], "authored_code": family["code"]})
        for item in family["types"]:
            code = "C1-" + item["code"]
            atoms.append({"code": code, "label": item["title"], "summary": item["ask"], "checks": [],
                          "group_code": group_code, "authored_code": item["code"]})
            # Full authored marking commentary stays private: it includes worked
            # source-specific answers and is not an invented pre-answer checklist.
            guidance[code] = {"marks": item["marks"], "note": item.get("note", "")}
    atom_codes = {atom["code"] for atom in atoms}
    if len(atom_codes) != len(atoms) or {"C1-" + code for code in concept_types["codes"]} != atom_codes:
        raise ValueError("The current authored checklist and concept-code vocabulary disagree.")
    checklist = (SHM / "reference/C1_QUESTION_TYPES.md").read_text(encoding="utf-8-sig")
    if len(re.findall(r"^### ", checklist, re.M)) != len(atoms):
        raise ValueError("The current Markdown checklist and structured vocabulary have different type counts.")
    if any("C1-" + code not in atom_codes for code in shares["map"].values()):
        raise ValueError("An authored inventory type is absent from the current checklist.")
    native_list = read_json(NATIVE)
    native = {row["source_part_id"]: row for row in native_list}
    if len(native) != len(native_list):
        raise ValueError("Duplicate native source-part IDs.")
    flat = {row["part_id"]: row for row in read_csv(FLAT)}
    tags = defaultdict(list)
    for ordinal, row in enumerate(checkpoint["syllabus_tags.csv"], start=2):
        tags[row["part_id"]].append({**row, "source_csv_record": ordinal})
    marks = defaultdict(list)
    for row in checkpoint["mark_categories.csv"]:
        marks[row["part_id"]].append(row)
    spine = {row["code"]: row for row in read_csv(PHYSICS / "syllabus_spine.csv")}
    current_codes = {code for code in spine if re.fullmatch(r"C\.1\.(?:H\.)?[1-7]", code)}
    if len(current_codes) != 14:
        raise ValueError("The current C1 understanding spine changed.")
    candidates = set(tags) | {row["source_part_id"] for row in native_list if "C.1" in row["topic_codes"]}
    parts, asset_audit, unavailable, retired = {}, [], [], []
    for source_id in sorted(candidates):
        evidence = tags.get(source_id, [])
        own = [row for row in evidence if row["subtopic"] == "C.1"]
        current = [row for row in own if row["understanding_code"] in current_codes]
        has_retired = any(row["understanding_code"] == "C.1.X" for row in own)
        has_none = any(row["understanding_code"] == "NONE" for row in own)
        if has_none and current:
            raise ValueError("Contradictory C1 scope decisions: " + source_id)
        status, reason = "unmapped", "No completed native-ID C1 scope decision in the current 352-input checkpoint."
        if has_retired:
            status, reason = "excluded", "The current reviewed return identifies retired C1.X demand."
            retired.append(source_id)
        elif current:
            status, reason = "included", "Retained as current C1 by the completed PACKET_015_C1 checkpoint through input 352."
        elif has_none:
            status, reason = "excluded", " | ".join(row["reason"] for row in own if row["understanding_code"] == "NONE")
        if source_id not in native or source_id not in flat:
            unavailable.append(source_id)
            if status == "included":
                status, reason = "unmapped", "Reviewed scope decision has no exact current native/flat source-ID join."
        if source_id in flat and not re.fullmatch(r"20\d\d", flat[source_id]["year"]):
            status, reason = "excluded", "Source examination year is unavailable."
        elif source_id in flat and int(flat[source_id]["year"]) >= 2026:
            status, reason = "excluded", "Source examination is 2026 or later."
        roles = {role: unique(row["understanding_code"] for row in evidence if row["needed_how"] == role and row["understanding_code"] != "NONE")
                 for role in ["central", "step", "assumed"]}
        part = {"status": status, "reason": reason, "scope_reviewed": bool(current and not has_retired),
                "scope_review": {"source": str(RETURN / "syllabus_tags.csv"), "checkpoint_inputs": 352,
                                 "c1_rows": own, "source_native_record_id": native.get(source_id, {}).get("part_id")},
                "group_codes": [], "atom_codes": [], "type_codes": [], "used_atom_codes": [], "optional_atom_codes": [],
                "primary_atom_code": None, "canonical_row_ids": [], "reviewed_syllabus_roles": roles}
        hints = sorted({row["level_hint"].upper() for row in marks[source_id] if row["level_hint"] in ["sl", "hl"]})
        part["reviewed_level_hints"] = hints
        if len(hints) == 1:
            part["reviewed_level"] = hints[0]
        parts[source_id] = part
        if status == "included":
            row = flat[source_id]
            qp, ms = paths(row, "question_crop_paths"), unique(paths(row, "ms_crop_paths") + paths(row, "ms_answer_crop_paths"))
            asset_audit.append({"source_part_id": source_id, "question_images": [str(path) for path in qp],
                                "markscheme_images": [str(path) for path in ms],
                                "all_question_images_exist": bool(qp) and all(path.is_file() for path in qp),
                                "all_markscheme_images_exist": bool(ms) and all(path.is_file() for path in ms)})
    exact_joins = []
    if JOIN_FILE.exists():
        join_data = read_json(JOIN_FILE)
        for record in join_data["joins"]:
            source_id, alias = record["source_part_id"], record["canonical_row_id"]
            if source_id not in flat or row_sha(flat[source_id]) != record["source_row_sha256"]:
                raise ValueError("Reviewed C1 source identity changed: " + source_id)
            if alias not in by_alias or record["authored_type"] != shares["map"][alias]:
                raise ValueError("Reviewed C1 alias/type identity changed: " + alias)
            if source_id not in parts or parts[source_id]["status"] != "included":
                continue
            code = "C1-" + shares["map"][alias]
            part = parts[source_id]
            part["atom_codes"] = unique(part["atom_codes"] + [code])
            part["group_codes"] = unique(part["group_codes"] + [next(atom["group_code"] for atom in atoms if atom["code"] == code)])
            part["primary_atom_code"] = part["atom_codes"][0] if len(part["atom_codes"]) == 1 else None
            part["canonical_row_ids"] = unique(part["canonical_row_ids"] + [alias])
            part["fine_type_review"] = record
            # Workbook concepts have different grain from the current types. Keep
            # their authored roles without broadcasting them to sibling types.
            canonical = next(item for item in items if item["id"] == alias)
            part["authored_concept_roles"] = {"direct": canonical["central"], "required": canonical["pre"],
                                               "supportive": canonical["sup"], "structural_prior": canonical["prior"]}
            exact_joins.append(record)
        fingerprints.append(fingerprint(JOIN_FILE))
    counts = Counter(part["status"] for part in parts.values())
    report = {"source_files": fingerprints, "builder": fingerprint(Path(__file__)),
              "checkpoint_boundary": checkpoint_report,
              "assessment_exclusions_applied": False, "fine_classification_complete": False,
              "counts": {"native_C1_candidates": sum("C.1" in row["topic_codes"] for row in native_list),
                         "reviewed_input_ids": len(tags), "reviewed_C1_retained_including_retired": sum(any(row["subtopic"] == "C.1" and row["understanding_code"] != "NONE" for row in rows) for rows in tags.values()),
                         **counts, "retired_current_checkpoint": len(retired), "authored_families": len(groups), "authored_types": len(atoms),
                         "canonical_workbook_rows": len(inventory), "canonical_workbook_marks": sum(row["Marks"] for row in inventory),
                         "exact_fine_joins_included": len(exact_joins), "included_without_fine_type": sum(part["status"] == "included" and not part["atom_codes"] for part in parts.values()),
                         "question_crops_available": sum(row["all_question_images_exist"] for row in asset_audit),
                         "markscheme_crops_available": sum(row["all_markscheme_images_exist"] for row in asset_audit)},
              "missing_native_or_flat_ids": unavailable, "asset_availability": asset_audit,
              "authored_mark_guidance_private": guidance, "canonical_inventory": inventory,
              "canonical_alias_to_authored_type": shares["map"], "authored_dependency_edges": dependencies,
              "reviewed_syllabus_vocabulary": [{"code": code, "label": spine[code]["text"], "level": spine[code]["level"]} for code in spine if code in current_codes],
              "limitations": ["The current ordered review ends at input 352. Older full drafts are not silently treated as the completed current review.",
                              "The 206-row workbook includes 20 mini-test items and pack aliases; these are not a native source-ID crosswalk.",
                              "The current authored checklist has 127 types. The old-to-new numbering map has 116 entries and is not the current type count.",
                              "Central/step/assumed syllabus roles and workbook concept dependencies are not interchangeable with fine question types.",
                              "Assessment exclusions and final crop/context verification belong to the downstream release review.",
                              "Only confirmed native-ID fine joins populate atom_codes; zero mapped rows do not mean the corpus lacks a type."]}
    return enrich_analysis({"schema_version": 1, "topic": "C.1", "label": "Simple harmonic motion", "groups": groups,
                            "atoms": atoms, "types": [], "parts": parts, "report": report})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist/physics-inputs/ib-c1-analysis.json")
    args = parser.parse_args()
    output = args.output.resolve()
    if not output.is_relative_to(ROOT):
        raise ValueError("Output must stay inside the ppqviewer workspace.")
    result = build()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), **result["report"]["counts"]}))


if __name__ == "__main__":
    main()
