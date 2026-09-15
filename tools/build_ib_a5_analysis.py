"""Project authored A5 classifications/guidance into a source-ID keyed viewer input.

Read-only source projects; output is unserved build input. Group membership comes
only from the reviewed corpus and its confirmed duplicate map. General group
guidance is not a per-question atom classification or a learner diagnosis.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import sys

import yaml

ROOT = Path(__file__).resolve().parents[1]
PAPERDB = Path(r"C:\CodexProjects\PaperDatabases")
SR = Path(r"C:\Claude (not on Gdrive, nor OneDrive)\Special Relativity Driller")
ANALYSIS = PAPERDB / "Physics Categorisation/work/a5_dependencies_20260908"
REGISTRY = PAPERDB / "Physics Categorisation/masters/a5_reviewed_types.json"
ADAPTER = PAPERDB / "Physics Categorisation/viewer/a5_type_adapter.py"
sys.path.insert(0, str(ADAPTER.parent))
from a5_type_adapter import load_registry, part_projection, public_vocabulary
GUIDANCE = SR / "inbox/2026-09-09_from-codex_A5_common_slips"

# The reviewed corpus supplies the concept-to-understanding bridge in its
# summary.metrics[].syllabus. Contextual H16 links stay secondary guidance;
# SIGNAL uses the explicitly authored messages/reception atom H13d.
GROUP_POINTS = {
    "REF": [1], "GAL": [2, 3, 4], "POST": [5], "GAMMA": [9],
    "LORENTZ": [6, 7, 8], "VEL": [10], "INTERVAL": [11],
    "PROPER": [12], "TD": [13], "LC": [14], "SIM": [15],
    "WORLDLINE": [16, 17], "SIGNAL": [], "MUON": [18],
}


def read_json(file):
    return json.loads(Path(file).read_text(encoding="utf-8-sig"))


def fingerprint(file):
    return {"path": str(file.resolve()), "sha256": hashlib.sha256(file.read_bytes()).hexdigest()}


def unique(values):
    return list(dict.fromkeys(values))


def exclusion_kind(reason):
    """Audit buckets only; the exact authored reason remains authoritative."""
    if re.search(r"ordinary.kinematics|pure A1|same.frame|one.frame|no (meaningful|additional) A5|false Galilean|buoyancy", reason, re.I):
        return "contextual_other_topic"
    return "outside_current_A5"


def resolve_rows(row, by_item, duplicate_map, seen=()):
    key = row["item_id"]
    if key in seen:
        raise ValueError("Cycle in authored duplicate map: " + key)
    target = duplicate_map.get(key)
    if target:
        if target not in by_item:
            raise ValueError("Duplicate target missing from authored analysis: " + target)
        return [result for candidate in by_item[target]
                for result in resolve_rows(candidate, by_item, duplicate_map, (*seen, key))]
    return [row]


def compile_parts(rows, duplicate_map, native_parts):
    by_item, by_source = defaultdict(list), defaultdict(list)
    for row in rows:
        by_item[row["item_id"]].append(row)
        for source_id in row.get("original_ids", []):
            by_source[source_id].append(row)
    parts = {}
    for source_id, source_rows in by_source.items():
        canonical = [result for row in source_rows
                     for result in resolve_rows(row, by_item, duplicate_map)]
        canonical = list({row["item_id"]: row for row in canonical}.values())
        included = [row for row in canonical if row["disposition"] == "include"]
        rejected = [row for row in canonical if row["disposition"] != "include"]
        status = "mixed" if included and rejected else "included" if included else "excluded"
        # The taxonomy can identify the idea in a corrupt extraction, but cannot
        # certify that extraction's crop or markscheme for publication.
        corrupt = any(re.search(r"corrupt part label|shifted marks/markscheme", row.get("reason", ""), re.I) for row in source_rows)
        if corrupt:
            status = "mixed"
        reason = " | ".join(unique(row.get("reason") or row.get("exclude_reason") or "" for row in canonical))
        if corrupt:
            reason += " | Authored duplicate review flags corrupt extraction; source crop/markscheme review required."
        group_codes = unique("A5." + row["primary"] for row in included if row.get("primary"))
        if status == "included" and not group_codes:
            raise ValueError("Included source lacks authored primary group: " + source_id)
        parts[source_id] = {
            "status": status, "group_codes": group_codes,
            # The 14 concept codes do not resolve the 45 atom subletters.
            "atom_codes": [],
            "direct_group_codes": unique("A5." + code for row in included for code in row.get("direct_concepts", [])),
            "used_group_codes": unique("A5." + code for row in included for code in row.get("used_concepts", [])),
            "reason": reason,
            "source_row_ids": unique(row["item_id"] for row in source_rows),
            "canonical_row_ids": unique(row["item_id"] for row in canonical),
            "canonical_source_part_ids": unique(pid for row in canonical for pid in row.get("original_ids", [])),
            "mapping_method": "authored_confirmed_duplicate" if any(row["item_id"] in duplicate_map for row in source_rows) else "authored_original_id",
            "source_exclude_reasons": unique(row.get("exclude_reason", "") for row in source_rows if row.get("exclude_reason")),
            "exclude_reasons": unique(row.get("exclude_reason", "") for row in rejected if row.get("exclude_reason")),
        }
    for source_id, native in native_parts.items():
        if source_id in parts:
            continue
        if "A.5" not in native.get("topic_codes", []):
            continue
        parts[source_id] = {
            "status": "unmapped", "group_codes": [], "atom_codes": [],
            "direct_group_codes": [], "used_group_codes": [],
            "reason": "No authored current-A5 assessment classification or confirmed canonical mapping. Broad topic routing does not establish assessed scope.",
            "mapping_method": "none", "source_row_ids": [], "canonical_row_ids": [],
            "native_primary_codes": native.get("primary_codes", []),
        }
    return parts


def compile_groups(analysis, syllabus, guidance):
    atom_details = {atom["atom_id"]: atom for atom in guidance["atoms"]}
    point_atoms = {int(point["code"].rsplit(".", 1)[1]): [atom["id"] for atom in point["atoms"]]
                   for point in syllabus["points"]}
    groups = []
    for metric in analysis["summary"]["metrics"]:
        concept = metric["code"]
        atoms = [atom for point in GROUP_POINTS[concept] for atom in point_atoms[point]]
        if concept == "SIGNAL":
            atoms = ["A5.H13d", "A5.H15b"]
        if concept == "TD":
            atoms = [atom for atom in atoms if atom != "A5.H13d"]
        atoms = [atom for atom in atoms if atom in atom_details]
        # Preserve each authored atom's complete guidance separately. The group
        # card gets one watch-out per atom before additional watch-outs, bounded
        # to four checks; the ordering is the authored syllabus/atom order.
        watch_lists = [atom_details[atom].get("watch_out", []) for atom in atoms]
        checks = [watch[0] for watch in watch_lists if watch]
        checks += [check for watch in watch_lists for check in watch[1:]]
        checks = list({check["text"]: check for check in checks}.values())[:4]
        summaries = unique(atom_details[atom]["what_it_wants"] for atom in atoms)
        groups.append({
            "code": "A5." + concept, "label": metric["label"],
            "summary": " ".join(summaries),
            "checks": [check["text"] for check in checks],
            "atom_codes": atoms,
            "syllabus": metric["syllabus"],
            "guidance_scope": "General guidance for this group; atom membership is not inferred for individual parts.",
            "check_evidence": [{"text": check["text"], "evidence_ids": check.get("evidence_ids", []), "slip_id": check.get("slip_id", "")} for check in checks],
        })
    return groups


def native_catalogue(path):
    text = path.read_text(encoding="utf-8-sig")
    payload = text.split("window.IBPHYS_QUESTIONS", 1)[1].split("=", 1)[1].lstrip()
    questions, _ = json.JSONDecoder().raw_decode(payload)
    return {part["source_part_id"]: part for question in questions
            if str(question.get("year", "")).isdigit() and 2004 <= int(question["year"]) < 2026
            for part in question["parts"]}


def build():
    source_files = [ANALYSIS / "analysis_all_years.json", ANALYSIS / "confirmed_duplicate_map.json",
                    ANALYSIS / "confirmed_duplicate_map_2025.json", GUIDANCE / "A5_atom_guidance.json",
                    GUIDANCE / "A5_evidence_ledger.json", SR / "data/syllabus_meta.yaml",
                    PAPERDB / "Physics Categorisation/viewer/ibphysics_catalogue.js"]
    analysis = read_json(source_files[0])
    registry = load_registry(REGISTRY)
    duplicate_map = {**read_json(source_files[1]), **read_json(source_files[2])}
    # These two exact common-appearance links are stated in the authored rows
    # but absent from the separately exported duplicate map. Require the prose
    # evidence verbatim before adding either link.
    by_id = {row["item_id"]: row for row in analysis["rows"]}
    assert by_id["Q124"]["exclude_reason"] == "Identical common SL/HL question already counted as Q115."
    assert by_id["Q244"]["reason"].startswith("Same assessed subpart, stem and marks as Q239;")
    duplicate_map.update({"Q124": "Q115", "Q244": "Q239"})
    native = native_catalogue(source_files[-1])
    parts = compile_parts(analysis["rows"], duplicate_map, native)
    groups = compile_groups(analysis, yaml.safe_load(source_files[-2].read_text(encoding="utf-8-sig")), read_json(source_files[3]))
    # The normal source catalogue and this bridge must use one central master.
    catalogue_text = source_files[-1].read_text(encoding="utf-8-sig")
    meta_payload = catalogue_text.split("window.IBPHYS_META", 1)[1].split("=", 1)[1].lstrip()
    native_meta, _ = json.JSONDecoder().raw_decode(meta_payload)
    assert native_meta["reviewed_question_types"]["registry_sha256"] == registry["_fingerprint"]["sha256"], "Rebuild the native Physics catalogue after importing A5 types"
    for source_id, part in parts.items():
        if part["status"] != "included":
            continue
        projected = part_projection(registry, source_id)
        assert projected["analysis_review_status"] == "reviewed", "Included part lacks reviewed type mapping: " + source_id
        assert projected["analysis_canonical_ids"] == [registry["canonical_namespace"] + ":" + key for key in part["canonical_row_ids"]]
        part.update(atom_codes=projected["analysis_atoms"], used_atom_codes=projected["analysis_used_atoms"],
                    optional_atom_codes=projected["analysis_optional_atoms"], type_codes=projected["analysis_types"],
                    primary_atom_code=projected["analysis_primary_atom"], review_status="reviewed")
    source_files += [REGISTRY, ADAPTER]
    valid = {group["code"] for group in groups}
    assert len(valid) == 14
    assert all(set(part["group_codes"]) <= valid for part in parts.values())
    for source_id in ("ibchem_part_c77d3df1afff751b", "ibchem_part_0191dec27115f375"):
        assert parts[source_id]["status"] == "mixed", source_id
    return {
        "schema_version": 1, "topic": "A.5", "label": "A5 Special relativity",
        "groups": groups, "parts": parts, "reviewed_question_types": public_vocabulary(registry),
        "report": {
            "source_files": [fingerprint(file) for file in source_files],
            "builder": fingerprint(Path(__file__)),
            "source_status_counts": dict(Counter(part["status"] for part in parts.values())),
            "authored_source_rows": len(analysis["rows"]),
            "duplicate_links": len(duplicate_map),
            "policy": [
                "Only status included is eligible for A5; assessment, source-year and crop exclusions still apply independently.",
                "Counts in the learner UI are distinct served parts, never source rows, marks or general prerequisite frequencies.",
                "Primary group membership is authored assessment focus; direct and used concepts are separate and not extra primary-group counts.",
                "Per-part atom_codes and type_codes come from the central reviewed A5 master; required-use and optional-route memberships remain separate.",
                "Group checks are authored general advice, not claims that a specific question diagnoses that slip or that a learner made it.",
                "Unmapped broad-A5 routing is withheld from A5. Mixed legacy/current tasks require bounded source review before release.",
                "This build input contains audit source paths and rejected IDs; project only served-part metadata into the public bundle.",
            ],
        },
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "dist/physics-inputs/ib-a5-analysis.json")
    args = parser.parse_args()
    data = build()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "groups": len(data["groups"]), **data["report"]["source_status_counts"]}))


if __name__ == "__main__":
    main()
