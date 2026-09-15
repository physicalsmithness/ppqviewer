"""Read-only source projection of the reviewed A1 vocabulary and exact memberships.

Writes only the private viewer input. Source workbooks, decisions and corpus are
never altered. A shape subsequently split into different demands is not silently
assigned to all of its destinations. The September teaching synthesis is retained
separately because its examples do not constitute a complete membership crosswalk.
"""
from __future__ import annotations
import argparse
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parents[1]
DB = Path(r"C:/CodexProjects/PaperDatabases")
CAT = DB / "Physics Categorisation"
BACKUP = Path(r"C:/Users/patri/OneDrive/Documents/Claude/Projects/_CodexBackups/PaperDatabases/Physics Categorisation")
WORK = CAT / ".work_packet_007b_a1_second"
SECOND = CAT / "returns/PACKET_007B_A1_second/a1_question_types.xlsx"
SEPT = CAT / "outputs/a1_taxonomy_20260909/A1_question_taxonomy.xlsx"
TEACHING = CAT / "work/a1_taxonomy_20260909/taxonomy_data.json"
CORPUS = DB / "outputs/exports/ib_physics_archive_flat_v5.csv"
NATIVE = CAT / "viewer/ibphysics_catalogue.js"
SCOPE_REVIEW_CORPUS_SHA = "6034e8854097c03384922d542b244164603262b1d6b0189d7a5a0ec34c13c17c"
# Bounded topic-scope review of the 36 split-only parts in the existing preview.
# Own prompt, shared stem, parent context and native scheme text were read on
# 2026-09-12. These decisions deliberately add no fine descriptor assignment.
SCOPE_REVIEWS = {
    "ibchem_part_36395de190cb4ceb": (True, "Resultant displacement and perpendicular displacement components are direct motion-vector demands."),
    "ibchem_part_df0da867c8470b0f": (True, "Determine acceleration from a car distance-time graph; direct linear motion-graph interpretation."),
    "ibchem_part_045bea79c7760faa": (False, "The supplied fall relation is used only for uncertainty propagation; no kinematic quantity or model is requested."),
    "ibchem_part_8bd2c23dcde39394": (True, "Qualitative acceleration-time behaviour during resisted vertical ascent, descent and terminal motion."),
    "ibchem_part_33b353f4ef39378d": (True, "Qualitative change of an oblique projectile trajectory with air resistance."),
    "ibchem_part_0ebabf4ad5cdc39e": (True, "Ordinary ultrasound round-trip distance from the given speed and elapsed time, with no frame transformation."),
    "ibchem_part_973a78efe6d53bfe": (True, "Explain the constant-deceleration stopping-distance approximation using speed-dependent air resistance."),
    "ibchem_part_937ebf83bf69a8b9": (True, "Determine free-fall acceleration from displacement and elapsed time for release from rest."),
    "ibchem_part_dc0c10868219d325": (True, "Qualitative speed-time curve for a raindrop approaching terminal speed."),
    "ibchem_part_01307e3ca80c803c": (True, "Select the speed-time graph for a car with increasing acceleration."),
    "ibchem_part_69fa031c9f9ae393": (True, "Select the speed-time graph for a car with increasing acceleration."),
    "ibchem_part_8c34e54944807d9e": (True, "Select the distance-time graph for resisted fall approaching terminal speed."),
    "ibchem_part_f7b1ce262b10dc4c": (True, "Translate a particle acceleration-time graph into instantaneous speed-time behaviour."),
    "ibchem_part_7a6e4a69c8e772f8": (True, "Translate a particle acceleration-time graph into instantaneous speed-time behaviour."),
    "ibchem_part_ef2b43322094c7c6": (False, "Uncertainty propagation through a supplied fall relation is the only requested operation."),
    "ibchem_part_e54cbc745924f160": (True, "Select the speed-time graph during vertical ascent and descent."),
    "ibchem_part_11d7fd9a6ba26c2f": (True, "Identify the highest point after a bounce from the signed velocity-time graph."),
    "ibchem_part_f4dc207229d9e48f": (False, "Uncertainty propagation through a supplied fall relation is the only requested operation."),
    "ibchem_part_692384dd1365818d": (True, "Qualitative speed and acceleration changes before terminal speed."),
    "ibchem_part_8c400c4d0c342686": (True, "Qualitative acceleration-time graph for a falling ball with air resistance."),
    "ibchem_part_08b44870c51909e1": (True, "Qualitative acceleration-time graph for resisted fall from rest."),
    "ibchem_part_61689e5a45b63a19": (True, "Qualitative speed increase and acceleration decrease during resisted fall."),
    "ibchem_part_f7886886cb5faf12": (True, "Qualitative initial acceleration behaviour for an object falling with air resistance."),
    "ibchem_part_069937c06eadab01": (False, "The requested escape trajectory needs the variation of the gravitational field beyond Venus; no independent A1 relation or supplied motion graph establishes the result."),
    "ibchem_part_922f700a04c83d60": (True, "Translate an ordinary speed-time graph into distance-time behaviour."),
    "ibchem_part_63fe4d06d4495cd7": (True, "Distinguish the downward velocity and upward acceleration after a parachute opens."),
    "ibchem_part_f5fd8108ab5d77b9": (True, "Translate an ordinary velocity-time graph into acceleration-time behaviour."),
    "ibchem_part_889c21cc4de7caa8": (True, "Translate an ordinary velocity-time graph into acceleration-time behaviour."),
    "ibchem_part_be4b3ae52af07d9b": (False, "Velocity direction is inferred from two standing-wave displacement profiles; the direct demand is wave-particle motion."),
    "ibchem_part_746ab6d54a0f2891": (False, "The requested output is resultant force from motion data; the final taxonomy excludes force-output branches from current A1."),
    "ibchem_part_96efc8083d7eb753": (False, "Velocity direction is inferred from two standing-wave displacement profiles; the direct demand is wave-particle motion."),
    "ibchem_part_7ed0627009fc0899": (True, "Qualitative acceleration-versus-speed relation during resisted fall."),
    "ibchem_part_60afc3b6fce07a3f": (False, "Elapsed signal time is requested in a moving spacecraft frame and requires relativistic frame reasoning."),
    "ibchem_part_69f8b0617bf36b72": (False, "Particle velocity is inferred from a travelling wave's spatial displacement profile; direct wave motion demand."),
    "ibchem_part_a79f3ba7d342aa0f": (True, "Qualitative changing acceleration of a rising oil droplet from increasing fluid resistance; shared force reasoning does not erase A1."),
    "ibchem_part_e3843f96b737e36f": (True, "Qualitative changing acceleration of a rising oil droplet from increasing fluid resistance; shared force reasoning does not erase A1."),
}


def sha(file):
    return hashlib.sha256(Path(file).read_bytes()).hexdigest()


def fingerprint(file):
    return {"path": str(Path(file).resolve()), "sha256": sha(file)}


def rows(file):
    with Path(file).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def norm(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def unique(values):
    return list(dict.fromkeys(values))


def js_array(file, variable):
    text = Path(file).read_text(encoding="utf-8-sig")
    match = re.search(r"\b" + re.escape(variable) + r"\s*=\s*", text)
    if not match:
        raise ValueError("Missing catalogue variable " + variable)
    return json.JSONDecoder().raw_decode(text[match.end():])[0]


def workbook_rows(file):
    workbook = openpyxl.load_workbook(file, read_only=True, data_only=True)
    try:
        return {sheet.title: list(sheet.iter_rows(values_only=True)) for sheet in workbook}
    finally:
        workbook.close()


def compile_input():
    if sha(CORPUS) != SCOPE_REVIEW_CORPUS_SHA:
        raise ValueError("Current corpus changed since the bounded A1 topic-scope review")
    files = [SECOND, SEPT, TEACHING, CORPUS, NATIVE,
             CAT / "returns/PACKET_007B_A1_second/FEEDBACK_007B.md",
             CAT / "work/a1_taxonomy_20260909/database_review.md",
             CAT / "outputs/a1_taxonomy_20260909/A1_question_taxonomy.md",
             WORK / "blind_pass/shape_evidence.csv"]
    comparisons = []
    for file in [SECOND, SEPT]:
        backup = BACKUP / file.relative_to(CAT)
        if not backup.exists() or sha(backup) != sha(file):
            raise ValueError("User-supplied backup differs from the current source: " + str(file))
        comparisons.append({"current": fingerprint(file), "supplied_backup": fingerprint(backup), "identical": True})
    sheets = workbook_rows(SECOND)
    required = {"Freer families": "freer_families", "Question types": "question_types", "Coverage check": "coverage_check"}
    table = {}
    for sheet, name in required.items():
        file = WORK / ("workbook_draft/" + name + ".csv")
        files.append(file)
        table[sheet] = rows(file)
        matrix = sheets[sheet]
        header = list(matrix[0])
        actual = [{key: "" if value is None else str(value) for key, value in zip(header, row)} for row in matrix[1:]]
        if actual != table[sheet]:
            raise ValueError("Workbook and final companion CSV differ: " + sheet)
    teaching = json.loads(TEACHING.read_text(encoding="utf-8-sig"))
    sept_sheets = workbook_rows(SEPT)
    for row, entry in zip(sept_sheets["Detailed taxonomy"][6:], teaching["types"], strict=True):
        expected = [entry["id"], next(f["name"] for f in teaching["families"] if f["id"] == entry["family"]),
                    entry["type"], "\n".join("• " + item for item in entry["subtypes"]), entry["route"],
                    entry["spine"], entry["examples"], entry["boundary"]]
        if list(row) != expected:
            raise ValueError("September workbook and authored JSON differ: " + entry["id"])
    types = {row["code"]: row for row in table["Question types"]}
    coverage = {row["shape_id"]: row for row in table["Coverage check"]}
    family_by_label, shape_family, groups = {}, {}, []
    for row in table["Freer families"]:
        family_by_label[row["family_name"]] = "A1." + row["family_id"]
        shape_family[row["shape_id"]] = row["family_name"]
        code = "A1." + row["family_id"]
        if not any(group["code"] == code for group in groups):
            groups.append({"code": code, "label": row["family_name"], "summary": row["family_definition"],
                           "checks": [row["solving_feel"]], "source_code": row["family_id"]})
    current_types = {code: row for code, row in types.items() if row["built_on"] != "legacy" and not code.startswith("A1.X")}
    groups = [g for g in groups if any(family_by_label.get(t["freer_family"]) == g["code"] for t in current_types.values())]
    atoms = [{"code": code, "label": row["question_type"], "summary": row["core_solving_route"],
              "checks": [row["recognition_trigger"]], "classification_note": row["typical_setups"],
              "group_codes": [family_by_label[row["freer_family"]]], "current_levels": ["SL", "HL"],
              "source_code": code, "source_sheet": "Question types", "source_row": list(types).index(code) + 2}
             for code, row in current_types.items()]
    decisions = {}
    for file in sorted((WORK / "blind_pass/decisions").glob("tranche_*_decisions.csv")):
        files.append(file)
        for row_no, row in enumerate(rows(file), 2):
            sid = row["part_id"]
            if sid in decisions:
                raise ValueError("Repeated decision ID: " + sid)
            decisions[sid] = {**row, "file": str(file), "row": row_no}
    corpus = {row["part_id"]: row for row in rows(CORPUS)}
    evidence = defaultdict(list)
    for row in rows(WORK / "blind_pass/shape_evidence.csv"):
        evidence[(row["part_id"], row["shape_id"])].append(row)
    native = js_array(NATIVE, "IBPHYS_QUESTIONS")
    native_parts = {part["source_part_id"]: (q, part) for q in native for part in q.get("parts", [])}
    # Explicit workbook examples are the only source-owned branch assignments
    # available for split shapes. Their literal evidence must still exist in v5.
    examples = defaultdict(list)
    for code, row in current_types.items():
        for number in [1, 2]:
            sid, quote = row["example_" + str(number) + "_part_id"], row["evidence_" + str(number)]
            if sid:
                examples[sid].append((code, quote))
    parts, conflicts, unmatched_evidence = {}, [], []
    for sid in sorted(set(decisions) | set(examples) | {sid for sid, (_, part) in native_parts.items() if "A.1" in part.get("topic_codes", [])}):
        decision, source = decisions.get(sid), corpus.get(sid)
        member_evidence, codes, pending_shapes = [], [], []
        if decision and decision["gate"] == "keep" and decision["confidence"] == "sure" and source:
            for shape in filter(None, decision["shape_ids"].split(";")):
                mapping = coverage.get(shape)
                if not mapping:
                    raise ValueError("Decision shape lacks final coverage row: " + shape)
                destinations = [code.strip() for code in mapping["question_type_codes"].split("|") if code.strip() in current_types]
                if mapping["pass2_fate"] != "carried intact" or len(destinations) != 1:
                    if destinations:
                        pending_shapes.append({"shape_id": shape, "candidate_type_codes": destinations, "reason": mapping["explanation"]})
                    continue
                valid = [row for row in evidence[(sid, shape)] if norm(row["candidate_phrase"]) and
                         norm(row["candidate_phrase"]) in norm(source.get(row["source_field"], ""))]
                if valid:
                    codes.append(destinations[0])
                    member_evidence.append({"type_code": destinations[0], "method": "reviewed_part_shape_and_final_unsplit_type",
                                            "shape_id": shape, "decision_file": decision["file"], "decision_row": decision["row"],
                                            "source_field": valid[0]["source_field"], "literal_evidence": valid[0]["candidate_phrase"]})
                else:
                    unmatched_evidence.append({"source_part_id": sid, "shape_id": shape, "reason": "No authored literal evidence survives in the same current v5 field."})
        for code, quote in examples.get(sid, []):
            found = source and norm(quote) and any(norm(quote) in norm(source.get(field, "")) for field in ["question_text", "shared_stem", "ms_text"])
            if found and not (decision and decision["gate"] != "keep"):
                codes.append(code)
                member_evidence.append({"type_code": code, "method": "explicit_final_workbook_example", "source_sheet": "Question types",
                                        "source_row": list(types).index(code) + 2, "literal_evidence": quote})
            elif found:
                conflicts.append({"source_part_id": sid, "type_code": code, "reason": "Final workbook example conflicts with the part quarantine decision."})
        codes = [code for code in current_types if code in codes]
        status, reason = "unmapped", "No exact reviewed part-to-current-type membership is available."
        if not source:
            reason = "Source ID is absent from the current v5 corpus."
        elif not re.fullmatch(r"\d{4}", source.get("year", "")) or not 2004 <= int(source["year"]) < 2026:
            status, reason, codes = "excluded", "Outside the permitted 2004–2025 source years.", []
        elif decision and decision["gate"] == "quarantine":
            status, reason, codes = "excluded", decision["gate_reason"], []
        elif codes:
            status, reason = "included", "Exact source-owned current question-type membership with matching current v5 literal evidence."
        elif decision and decision["gate"] == "keep":
            all_shapes = [coverage[shape] for shape in decision["shape_ids"].split(";") if shape]
            if all_shapes and all(not any(code.strip() in current_types for code in row["question_type_codes"].split("|")) for row in all_shapes):
                status, reason = "excluded", "Final shape coverage gives no current A.1 home (including explicitly retired A1.Xa)."
            elif pending_shapes:
                reason = "Authored shape was split; this source part has no explicit final branch assignment."
            elif decision["confidence"] != "sure":
                reason = "The authored part decision remains unsure."
        if sid in SCOPE_REVIEWS:
            allowed, scope_reason = SCOPE_REVIEWS[sid]
            status, reason = ("included" if allowed else "excluded"), scope_reason
            if not allowed:
                codes = []
        q, native_part = native_parts.get(sid, ({}, {}))
        parts[sid] = {"status": status, "scope_reviewed": status == "included", "reason": reason, "group_codes": unique(family_by_label[current_types[code]["freer_family"]] for code in codes),
                      "atom_codes": codes, "type_codes": [], "used_atom_codes": [], "optional_atom_codes": [],
                      "primary_atom_code": codes[0] if len(codes) == 1 else None, "canonical_row_ids": codes,
                      "source_part_id": sid, "native_part_id": native_part.get("part_id"), "parent_id": q.get("id"),
                      "current_levels": ["SL", "HL"] if status == "included" else [], "membership_evidence": member_evidence if codes else [],
                      "pending_shape_branches": pending_shapes, "authored_part_confidence": decision["confidence"] if decision else None,
                      "source_corpus_defect": decision["corpus_defect"] if decision else ""}
    native_a1 = [sid for sid, (_, part) in native_parts.items() if "A.1" in part.get("topic_codes", [])]
    preview_ids = []
    pointer = ROOT / "dist/physics-preview/latest.json"
    if pointer.exists():
        preview = json.loads(pointer.read_text(encoding="utf-8"))
        file = Path(preview["root"]) / "ib/data/physics_catalogue.js"
        if file.exists():
            preview_ids = [q["source_part_id"] for q in js_array(file, "PHYSICS_QUESTIONS") if "A.1" in q.get("topic_codes", [])]
    counts = lambda ids: dict(Counter(parts.get(sid, {"status": "unmapped"})["status"] for sid in ids))
    return {"schema_version": 1, "topic": "A.1", "label": "Kinematics", "groups": groups, "atoms": atoms, "types": [], "parts": parts,
            "teaching_taxonomy": {**teaching, "membership_status": "Vocabulary and examples only; no exhaustive part-to-K-code crosswalk is supplied."},
            "report": {"source_files": [fingerprint(file) for file in unique(files)], "builder": fingerprint(__file__),
                       "supplied_backup_comparison": comparisons, "source_namespace": "PACKET_007B_A1_second_20260827",
                       "counts": {"decision_rows": len(decisions), "decision_gates": dict(Counter(d["gate"] for d in decisions.values())),
                                  "current_type_atoms": len(atoms), "teaching_families": len(teaching["families"]), "teaching_types": len(teaching["types"]),
                                  "all_parts": counts(parts), "native_a1_total": len(native_a1), "native_a1": counts(native_a1),
                                  "previous_preview_a1_total": len(preview_ids), "previous_preview_a1": counts(preview_ids)},
                       "previous_preview_unmapped_source_ids": [sid for sid in preview_ids if parts.get(sid, {}).get("status", "unmapped") == "unmapped"],
                       "scope_only_review": {"review_date": "2026-09-12", "corpus_sha256": SCOPE_REVIEW_CORPUS_SHA,
                           "method": "Read each exact own prompt, shared stem, parent context and native scheme text. Resolve current A1 topic demand only; descriptor and image correctness are not certified.",
                           "decisions": [{"source_part_id": sid, "included": allowed, "reason": reason,
                               "evidence_sha256": hashlib.sha256(json.dumps({field: corpus[sid].get(field, "") for field in ["question_text", "shared_stem", "parent_context", "ms_text"]}, sort_keys=True, ensure_ascii=False).encode()).hexdigest()}
                               for sid, (allowed, reason) in SCOPE_REVIEWS.items()]},
                       "analyst_handoff": {"preferred_vocabulary": str(SEPT), "existing_membership_source": str(SECOND),
                           "join_key": "source_part_id, identical to current v5 part_id, never a human exam reference alone",
                           "required_fields": ["source_part_id", "source_corpus_sha256", "own_question_text_sha256", "scope_status", "scope_reason", "taxonomy_version", "descriptor_code", "demand_role", "route_scope", "evidence_quote", "evidence_field", "review_status", "source_locator"],
                           "role_contract": "Separate directly assessed descriptors from prerequisite, optional, shared-context and alternative-route descriptors. One row per exact part/descriptor/role/route; preserve multiple direct demands.",
                           "scope_contract": "Explicit current A1 included/excluded/unresolved decision per part. Preserve A1 current SL+HL eligibility; printed historic source level is independent.",
                           "fine_mapping_gap": "Provide the actual part-to-K1–K8 / Kx.y assignments. The September workbook lists examples, not universal mappings. Do not expand an example citation to every member of its older type.",
                           "ids_needing_scope_or_fine_review": [sid for sid in preview_ids if parts.get(sid, {}).get("status") == "unmapped" or not parts.get(sid, {}).get("atom_codes")]},
                       "conflicts": conflicts, "unmatched_literal_evidence": unmatched_evidence,
                       "limitations": ["This is taxonomy projection, not assessment or crop release clearance.",
                           "The blind keep pool is broader than current A1. Final exclusions and split boundaries are retained.",
                           "Unsure decisions, split-only membership, missing current evidence and absent IDs remain unmapped.",
                           "September K-codes are a teaching synthesis, not a full assignment table; their example references are not expanded into universal memberships.",
                           "Secondary family names do not establish prerequisites. No prerequisite or optional demand is inferred."]}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(ROOT / "dist/physics-inputs/ib-a1-analysis.json"))
    args = parser.parse_args()
    output = Path(args.output).resolve()
    if ROOT not in output.parents:
        raise ValueError("Output must remain in the viewer workspace")
    result = compile_input()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(output), "sha256": sha(output), **result["report"]["counts"]}))


if __name__ == "__main__":
    main()
