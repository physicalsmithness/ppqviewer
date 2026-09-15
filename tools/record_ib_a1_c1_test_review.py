"""Build private A1/C1 assessment evidence from reviewed notes; never rebuild sources."""
import argparse
import collections
import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAPERDB = Path(r"C:\CodexProjects\PaperDatabases")
ASSESSMENTS = Path("Physics Categorisation/reference/tests/3. Assessments")
AUDIT = ROOT / "dist/physics-audit/a1-c1-assessments"
NOTES = ROOT / "reports/ib-a1-c1-test-review-notes.json"
OUT = ROOT / "reports/ib-a1-c1-reviewed-test-exclusions.json"

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))

def build():
    notes = read(NOTES)
    freshness = read(AUDIT / "freshness.json")
    extraction = read(AUDIT / "native-review.json")
    candidates_path = AUDIT / "candidate-parts.json"
    candidates = read(candidates_path)
    corpus_path = PAPERDB / "outputs/exports/ib_physics_archive_flat_v5.csv"
    corpus_hash = sha(corpus_path)
    if extraction["corpus_sha256"] != corpus_hash:
        raise ValueError("Native review is stale against the source corpus")
    with corpus_path.open(encoding="utf-8-sig", newline="") as stream:
        rows = {r["part_id"]: r for r in csv.DictReader(stream)}
    fresh = {r["relative_path"]: r for r in freshness["source_files"]}
    if len(fresh) != 22 or not freshness.get("all_identical"):
        raise ValueError("Expected 22 freshly checked identical school-test snapshots")
    source_files = [{"path": "outputs/exports/ib_physics_archive_flat_v5.csv", "sha256": corpus_hash}]
    for doc in extraction["documents"]:
        rel = doc["relative_path"]
        source_path = PAPERDB / ASSESSMENTS / rel
        actual = sha(source_path)
        if rel not in fresh or actual != doc["sha256"] or actual != fresh[rel]["sha256"] or not fresh[rel]["same_bytes_as_local_snapshot"]:
            raise ValueError("Assessment changed since the current-drive check: " + rel)
        source_files.append({"path": (ASSESSMENTS / rel).as_posix(), "sha256": actual})
    if len(source_files) != 23:
        raise ValueError("Native extraction and freshness source scopes disagree")
    candidate_ids = [q["source_part_id"] for q in candidates]
    if len(candidate_ids) != len(set(candidate_ids)) or len(candidate_ids) != 226:
        raise ValueError("Reviewed candidate scope must remain the original 226 unique parts")
    if collections.Counter(t for q in candidates for t in q["topic_codes"] if t in ("A.1", "C.1")) != {"A.1": 197, "C.1": 29}:
        raise ValueError("Candidate topic scope changed")
    if any(i not in rows or int(rows[i]["year"]) >= 2026 for i in candidate_ids):
        raise ValueError("Unknown or embargoed reviewed source part")
    blocked = sorted({i for reservation in notes["manual_reservations"] for i in reservation["source_ids"]})
    evidence = []
    for reservation in notes["manual_reservations"]:
        rel = reservation["test_relative_path"]
        if rel not in fresh:
            raise ValueError("Manual evidence has no current source fingerprint: " + rel)
        resolved = []
        for source_id in reservation["source_ids"]:
            if source_id not in rows:
                raise ValueError("Unknown manual source identity: " + source_id)
            row = rows[source_id]
            resolved.append({"source_id": source_id, "preview": row["preview"],
                "source_parent": f"{row['year'][-2:]}{row['session'][:1].upper()}.P{row['paper']}.{row['level']}.{row['time_zone'] or 'TZ0'}.Q{row['question']}",
                "part": row.get("part_label", ""),
                **{key: row.get(key, "") for key in ("question_text", "shared_stem", "parent_context", "ms_text")}})
        evidence.append({**reservation, "test_sha256": fresh[rel]["sha256"], "resolved_source_parts": resolved})
    # Workspace evidence uses explicit absolute paths; PaperDB source paths above
    # remain relative to PaperDB, matching the established exclusion schema.
    for path in [Path(__file__), NOTES, AUDIT / "freshness.json", AUDIT / "native-review.json", candidates_path]:
        source_files.append({"path": str(path.resolve()), "sha256": sha(path)})
    complete = notes.get("review_complete") is True
    return {"schema_version": 1, "created_utc": datetime.now(timezone.utc).isoformat(),
        "course": "ib", "topics": ["A.1", "C.1"], "scope": notes["scope"],
        "review_complete": complete,
        "unresolved_relevant_items": [] if complete else ["Final scoped review record has not yet been signed off"],
        "complete_test_exclusion_certified": False,
        "corpus_sha256": corpus_hash, "source_files": source_files, "read_failures": [],
        "assessment_freshness_checked_at": freshness["checked_at"],
        "reviewed_candidate_file": str(candidates_path), "reviewed_candidate_sha256": sha(candidates_path),
        "reviewed_candidate_source_ids": sorted(candidate_ids),
        "reviewed_candidate_counts": {"A.1": 197, "C.1": 29},
        "blocked_source_ids": blocked, "manual_reservations": evidence,
        "visually_reviewed_documents": notes["visually_reviewed_documents"],
        "reviewed_nonmatches": notes["reviewed_nonmatches"],
        "required_additive_exclusions": ["dist/physics-audit/current-ib-tests.json", "reports/ib-a5-reviewed-test-exclusions.json"],
        "limitations": notes["limitations"]}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate and summarize without writing")
    args = parser.parse_args()
    result = build()
    if not args.check:
        OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"review_complete": result["review_complete"], "reviewed_candidates": len(result["reviewed_candidate_source_ids"]),
        "blocked_seeds": len(result["blocked_source_ids"]), "source_files": len(result["source_files"]),
        "candidate_sha256": result["reviewed_candidate_sha256"], "output": str(OUT) if not args.check else None}))
