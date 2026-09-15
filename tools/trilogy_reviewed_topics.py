"""Add narrowly reviewed historical StL topic mappings to Trilogy selection.

This module reads its upstream database and reviewed return only. It does not
clear assessment reservations: callers must apply full-parent/twin exclusions
after merging these per-part topic mappings with their ordinary SQL selection.
"""
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import unicodedata


REVIEW_RELATIVE_PATH = "Trilogy Categorisation/returns/FORCES_2026_UPDATE_V4_20260910/analysis_data.json"
REVIEW_SHA256 = "9a5d1e71826c93b4000a99f507358f71fa694cf8d54416aa0b67523c191e3773"
DATABASE_RELATIVE_PATH = "Trilogy Categorisation/aqa_extraction_plus_calc.db"


def _normalized(value):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", value or "")).lower()


def _text_sha(value):
    return hashlib.sha256(_normalized(value).encode("utf-8")).hexdigest()


def _validate_reviewed_part(reviewed, native, mark_schemes):
    """Reject stale, renumbered or resegmented source evidence."""
    part_id = reviewed["id"]
    if not native or native["course"] != "Trilogy":
        raise ValueError(f"Reviewed Trilogy part is absent from its native course: {part_id}")
    if str(reviewed["year"]) != str(native["year"]) or reviewed["tier"] != native["tier"]:
        raise ValueError(f"Reviewed Trilogy source year/tier changed: {part_id}")
    if reviewed["raw_tariff"] != native["marks"]:
        raise ValueError(f"Reviewed Trilogy source marks changed: {part_id}")
    if not _normalized(reviewed["question_text"]) or _normalized(reviewed["question_text"]) != _normalized(native["question_text"]):
        raise ValueError(f"Reviewed Trilogy question text changed: {part_id}")
    matches = [row for row in mark_schemes if _normalized(reviewed["ms_text"])
               and _normalized(reviewed["ms_text"]) == _normalized(row["raw_text"])]
    if not matches:
        raise ValueError(f"Reviewed Trilogy mark-scheme text changed: {part_id}")
    return matches


def load_reviewed_topics(source_root):
    """Return additive per-part topics and auditable provenance; never serve data."""
    source_root = Path(source_root).resolve()
    review_path = source_root / REVIEW_RELATIVE_PATH
    review_bytes = review_path.read_bytes()
    digest = hashlib.sha256(review_bytes).hexdigest()
    # Pin the reviewed artifact. A replacement return must be reviewed before it
    # can silently introduce new topics or an expanded source-year range.
    if digest != REVIEW_SHA256:
        raise ValueError("The reviewed Trilogy topic artifact changed; its new evidence needs review")
    analysis = json.loads(review_bytes.decode("utf-8-sig"))
    database_path = source_root / DATABASE_RELATIVE_PATH
    con = sqlite3.connect(database_path.resolve().as_uri() + "?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    part_topics, evidence = {}, []
    try:
        for reviewed in analysis["questions"]:
            if reviewed["course"] != "Trilogy" or reviewed.get("cross_subject"):
                continue
            year = str(reviewed["year"])
            if not ((year.isdigit() and int(year) < 2026) or year == "specimen"):
                continue
            if not any(unit in {"Forces 1", "Forces 2", "Forces 3", "Forces 4"}
                       for unit in reviewed.get("stl_units", [])):
                continue
            part_id = reviewed["id"]
            native_row = con.execute(
                "SELECT p.*,g.exam_paper_id,e.course,e.year,e.tier,e.is_specimen "
                "FROM question_parts p JOIN question_groups g USING(question_group_id) "
                "JOIN exam_papers e USING(exam_paper_id) WHERE p.question_part_id=?", (part_id,)).fetchone()
            native = dict(native_row) if native_row else None
            if not native:
                raise ValueError(f"Reviewed historical forces part is missing from SQL: {part_id}")
            if year == "specimen" and not native["is_specimen"]:
                raise ValueError(f"Reviewed specimen is not a source specimen: {part_id}")
            already_mapped = con.execute(
                "SELECT 1 FROM question_part_syllabus_tags WHERE question_part_id=? "
                "AND role='examined' AND section_no LIKE '6.5%' LIMIT 1", (part_id,)).fetchone()
            if already_mapped:
                continue
            mark_schemes = [dict(row) for row in con.execute(
                "SELECT m.raw_text,m.marks,m.source_id,s.relative_path,s.content_sha256 "
                "FROM mark_scheme_entries m JOIN source_documents s USING(source_id) "
                "WHERE m.question_part_id=?", (part_id,))]
            matches = _validate_reviewed_part(reviewed, native, mark_schemes)
            allocations = [row for row in analysis["allocations"] if row["id"] == part_id
                           and row.get("stl_unit") in {"Forces 1", "Forces 2", "Forces 3", "Forces 4"}
                           and row.get("marks", 0) > 0]
            if not allocations or sum(row["marks"] for row in allocations) > native["marks"]:
                raise ValueError(f"Reviewed forces allocation has no valid source-mark evidence: {part_id}")
            part_topics[part_id] = ["forces"]
            evidence.append({
                "part_id": part_id, "parent_id": native["question_group_id"],
                "source_paper_id": native["exam_paper_id"], "source_year": native["year"],
                "topic_codes": ["forces"], "original_part_marks": native["marks"],
                "reviewed_forces_marks": sum(row["marks"] for row in allocations),
                "question_text_sha256": _text_sha(native["question_text"]),
                "markscheme_text_sha256": _text_sha(reviewed["ms_text"]),
                "markscheme_sources": [{k: row[k] for k in ("source_id", "relative_path", "content_sha256")} for row in matches],
                "reviewed_allocations": [{k: row.get(k) for k in
                    ("category_id", "marks", "syllabus_point", "stl_unit", "stl_point", "evidence")} for row in allocations],
            })
    finally:
        con.close()
    return {"part_topics": part_topics, "reviewed_part_ids": sorted(part_topics),
        "provenance": [{"source": str(review_path), "sha256": digest,
            "source_database": str(database_path),
            "source_database_sha256": hashlib.sha256(database_path.read_bytes()).hexdigest(),
            "policy": "Add reviewed historical StL Forces 1–4 parts whose question text, mark-scheme text and original marks match native SQL. All ordinary assessment and source-year exclusions still apply. No electricity overlay was found: all imported StL Electricity sections are within the existing 6.2 selection.",
            "part_count": len(part_topics), "parts": evidence}]}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=Path(r"C:\CodexProjects\PaperDatabases"))
    parser.add_argument("--output", type=Path)
    options = parser.parse_args()
    result = load_reviewed_topics(options.source_root)
    if options.output:
        options.output.parent.mkdir(parents=True, exist_ok=True)
        options.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"reviewed_part_count": len(result["part_topics"]),
                      "provenance_sha256": result["provenance"][0]["sha256"]}))
