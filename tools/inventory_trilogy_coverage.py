"""Read-only inventory of source Trilogy coverage and the current local preview."""
from collections import Counter, defaultdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\CodexProjects\PaperDatabases\Trilogy Categorisation")
DB = SOURCE / "aqa_extraction_plus_calc.db"
LATEST_ANALYSIS = SOURCE / "returns/FORCES_2026_UPDATE_V4_20260910/analysis_data.json"
TOPICS = {"6.2": "electricity", "6.5": "forces"}


def read(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main():
    con = sqlite3.connect(DB.resolve().as_uri() + "?mode=ro", uri=True)
    con.row_factory = sqlite3.Row
    parts = {r["question_part_id"]: dict(r) for r in con.execute(
        "SELECT p.*, g.exam_paper_id, e.year,e.tier,e.paper FROM question_parts p "
        "JOIN question_groups g USING(question_group_id) JOIN exam_papers e USING(exam_paper_id) "
        "WHERE e.course='Trilogy'")}
    tags = defaultdict(list)
    for row in con.execute("SELECT * FROM question_part_syllabus_tags"):
        if row["question_part_id"] in parts:
            tags[row["question_part_id"]].append(dict(row))
    part_topics = {pid: sorted({TOPICS[t["section_no"][:3]] for t in tags[pid]
        if t["role"] == "examined" and t["section_no"][:3] in TOPICS}) for pid in parts}
    groups = defaultdict(list)
    for pid, part in parts.items():
        groups[part["question_group_id"]].append(pid)
    latest = read(ROOT / "dist/physics-preview/latest.json")
    bundle = Path(latest["root"]) / "trilogy/data/physics_catalogue.js"
    served = json.loads(bundle.read_text(encoding="utf-8").split("window.PHYSICS_QUESTIONS=", 1)[1].strip().removesuffix(";"))
    served_ids = {q["parent_id"] for q in served}
    input_bundle = read(ROOT / "dist/physics-inputs/trilogy.json")
    input_ids = {q["parent_id"] for q in input_bundle["questions"]}
    parent_records = []
    for parent, pids in sorted(groups.items()):
        example = parts[pids[0]]
        topics = sorted({t for pid in pids for t in part_topics[pid]})
        parent_records.append({
            "parent_id": parent, "paper_id": example["exam_paper_id"], "year": example["year"],
            "tier": example["tier"], "topic_codes": topics,
            "original_part_count": len(pids), "original_marks": sum(parts[p]["marks"] or 0 for p in pids),
            "original_part_ids": sorted(pids),
            "topic_examined": {topic: {"part_count": sum(topic in part_topics[p] for p in pids),
                "part_ids": sorted(p for p in pids if topic in part_topics[p]),
                "whole_part_marks": sum(parts[p]["marks"] or 0 for p in pids if topic in part_topics[p])}
                for topic in topics},
            "in_input": parent in input_ids, "in_served_build": parent in served_ids,
        })

    def summarize(rows, topic):
        rows = [r for r in rows if topic in r["topic_codes"]]
        return {"whole_questions": len(rows), "original_parts": sum(r["original_part_count"] for r in rows),
            "original_marks": sum(r["original_marks"] for r in rows),
            "topic_examined_parts": sum(r["topic_examined"][topic]["part_count"] for r in rows),
            "topic_examined_whole_part_marks": sum(r["topic_examined"][topic]["whole_part_marks"] for r in rows)}

    by_year_tier = []
    for year, tier in sorted({(str(p["year"]), p["tier"]) for p in parts.values()}):
        pids = [pid for pid,p in parts.items() if str(p["year"]) == year and p["tier"] == tier]
        rows = [r for r in parent_records if str(r["year"]) == year and r["tier"] == tier]
        by_year_tier.append({"year": year, "tier": tier, "all_parts": len(pids),
            "parts_with_any_syllabus_tag": sum(bool(tags[p]) for p in pids),
            "parts_with_examined_syllabus_tag": sum(any(t["role"] == "examined" for t in tags[p]) for p in pids),
            "source_candidates": {topic: summarize(rows, topic) for topic in TOPICS.values()},
            "served": {topic: summarize([r for r in rows if r["in_served_build"]], topic) for topic in TOPICS.values()}})

    analysis = read(LATEST_ANALYSIS)
    historical = [q for q in analysis["questions"] if q["course"] == "Trilogy"
                  and (not str(q["year"]).isdigit() or int(q["year"]) < 2026)]
    analysis_forces = [q for q in historical if any(u.startswith("Forces") for u in q.get("stl_units", []))
                       and not q.get("cross_subject")]
    missing_parts = [q for q in historical if q["id"] not in parts]
    source_candidates = {r["parent_id"] for r in parent_records if "forces" in r["topic_codes"]}
    analysis_additions = []
    for q in analysis_forces:
        pid = q["id"]
        if pid in parts and "forces" not in part_topics[pid]:
            parent = parts[pid]["question_group_id"]
            analysis_additions.append({"id": pid, "parent_id": parent, "year": q["year"], "tier": q["tier"],
                "marks": q["tariff"], "task": q["task"], "stl_units": q["stl_units"], "notes": q["notes"],
                "new_parent_outside_candidate_set": parent not in source_candidates,
                "in_input": parent in input_ids, "in_served_build": parent in served_ids,
                "source_tags": tags[pid],
                "reviewed_allocations": [a for a in analysis["allocations"] if a["id"] == pid]})
    out = {"generated_at": datetime.now(timezone.utc).isoformat(), "read_only_source": str(DB),
        "database_sha256": hashlib.sha256(DB.read_bytes()).hexdigest(),
        "build_id": latest["build_id"], "build_root": latest["root"],
        "counting_note": "Original parts and marks include all content within whole-question crops. Topic-examined counts use distinct numbered source parts with an examined 6.2/6.5 tag; their full tariff can include mixed content. Neither count deduplicates repeated F/H appearances. No mark-level split is inferred from syllabus tags.",
        "served": {topic: summarize([r for r in parent_records if r["in_served_build"]], topic) for topic in TOPICS.values()},
        "input": {topic: summarize([r for r in parent_records if r["in_input"]], topic) for topic in TOPICS.values()},
        "source_candidates": {topic: summarize(parent_records, topic) for topic in TOPICS.values()},
        "by_year_tier": by_year_tier, "parents": parent_records,
        "analysis_review": {"path": str(LATEST_ANALYSIS), "sha256": hashlib.sha256(LATEST_ANALYSIS.read_bytes()).hexdigest(),
            "historical_retained_appearances": len(historical), "historical_forces_appearances": len(analysis_forces),
            "missing_historical_parts": missing_parts, "forces_mappings_absent_from_db_topic_tags": analysis_additions,
            "classification_corrections": analysis.get("middle_corrections"),
            "reviewed_default_through_2025": analysis["period_summaries"].get("Through 2025", {}).get("Trilogy", {})}}
    target = ROOT / "dist/physics-audit/trilogy-coverage-inventory.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    served_rows = [r for r in parent_records if r["in_served_build"]]
    input_rows = [r for r in parent_records if r["in_input"]]
    lines = ["# Trilogy coverage inventory", "", f"Read-only audit of local build `{latest['build_id']}` on {out['generated_at']}.", "",
        f"The current {len(served_rows)} entries are whole numbered questions. They contain {sum(r['original_part_count'] for r in served_rows)} original numbered parts and {sum(r['original_marks'] for r in served_rows)} marks; not all those parts examine the selected topic. Counts below retain both printed F/H appearances. Syllabus-tagged marks are full numbered-part tariffs, not an inferred allocation of individual marks.", "",
        "| Topic | Whole questions | All original parts | All marks | Parts with examined topic tag | Their full-part marks |",
        "|---|---:|---:|---:|---:|---:|"]
    for topic, counts in out["served"].items():
        lines.append(f"| {topic.title()} | {counts['whole_questions']} | {counts['original_parts']} | {counts['original_marks']} | {counts['topic_examined_parts']} | {counts['topic_examined_whole_part_marks']} |")
    lines += ["", "## What reduces the displayed total", "",
        f"The database has {out['source_candidates']['electricity']['whole_questions']} electricity and {out['source_candidates']['forces']['whole_questions']} forces candidate whole questions under examined 6.2/6.5 selection. The input contains {out['input']['electricity']['whole_questions']} electricity and {out['input']['forces']['whole_questions']} forces questions after its reservations. {len(input_ids - served_ids)} input parents are absent from the assembled preview. The input report records {len(input_bundle['report'].get('skipped', []))} crop/alignment skips. See the input's known_exclusions and the assembler report for the policies in force at this snapshot.", "",
        "At the initial a5576b3e1f17a146 snapshot, all 22 extra input parents were specimens (8 electricity, 14 forces), discarded because their database year was `specimen`. Root is revising specimen dating and the overly broad 2025 hold. Those initial counts should not be used as final revised coverage.", "",
        "## Source and tagging coverage", "",
        "The current source database contains all four Trilogy physics papers for each 2018–2025 sitting and eight specimen papers: 40 papers total. All 1,097 dated numbered source parts have an examined syllabus/WS/maths tag. Specimens have examined tags on 265 of 266 source records. The one untagged specimen record contains a bundled ice/heater question; general tag presence does not establish that every physics interpretation has its own content tag.", "",
        "These figures use current SQL data. CODEX_DISPATCH's August calculation-packet gaps concern formula/variable/unit/mark breakdowns and should not be mistaken for missing September whole-course syllabus tags.", "",
        "### Candidate counts before assessment reservations", "",
        "Each cell is whole questions / distinct source parts with an examined topic tag.", "",
        "| Source year | Tier | Electricity | Forces |", "|---|---|---:|---:|"]
    for row in by_year_tier:
        a, b = row["source_candidates"]["electricity"], row["source_candidates"]["forces"]
        lines.append(f"| {row['year']} | {row['tier']} | {a['whole_questions']} / {a['topic_examined_parts']} | {b['whole_questions']} / {b['topic_examined_parts']} |")
    lines += ["", "## Latest reviewed forces analysis outside SQL topic selection", "",
        "The 10 September V4 forces analysis leaves the source database unchanged. It contains 55 historical forces mappings absent from a direct examined 6.5 tag. 52 sit within already selected whole-question parents and therefore do not add new whole-question entries. Three potentially add a parent:", "",
        "| Source part | Reviewed forces interpretation | Part marks | Existing input status |", "|---|---|---:|---|"]
    for q in analysis_additions:
        if q["new_parent_outside_candidate_set"]:
            status = "Not selected by current topic rule"
            if q["parent_id"] in input_bundle["report"].get("excluded_parent_ids", []):
                status += "; currently reserved by exclusion policy"
            lines.append(f"| `{q['id']}` | {q['task']} | {q['marks']} | {status} |")
    lines += ["", "The reviewed interpretations use broader StL forces ownership: measuring maximum toy height; reading 3.6 N from a newtonmeter; and injury risk after a higher fall. They are not missing source-paper extractions. Any added parent still needs the same full-parent/cross-tier assessment reservation checks and bounded-crop checks.", "",
        "The sole historical Trilogy part recovered outside SQL in this V4 dataset is specimen set 1 P1F 07.4 (motor efficiency, 2 marks). It is Energy, and its parent is outside the current electricity/forces candidate set. No recovered historical default-forces source part is missing from SQL. New 2026 material in that analysis is outside the user-authorized source-year range.", "",
        "The V4 default historical Trilogy forces total of 244 parts / 502 direct marks uses StL Forces 1–4 and deduplicates confirmed shared F/H tasks, while excluding specimens, independent Energy and cross-subject options. It is not directly comparable to this viewer's 42 whole questions or 213 printed parts.", "",
        "## Reusable count evidence and limits", "",
        "`trilogy-coverage-inventory.json` records all parents and their original source part IDs, whole tariffs and per-topic examined part IDs, plus candidate totals by year/tier. The read-only helper can regenerate these against a later local build. Counts assume the current normalized source segmentation; a source-record count alone does not certify perfect extraction. This inventory does not clear unresolved image-only assessments, add questions, or change any source/consumer rule.", "",
        "The bounded diagram comparison from the preceding task is preserved separately in `trilogy-current-tests/bounded-diagram-followup.md`: all 162 question images from the initial a5576b3e1f17a146 build's 42 served forces parents were inspected; the targeted unresolved diagrams were not exact matches. That result is scoped visual evidence, not general assessment clearance.", "",
        f"Source DB: `{DB}`", "", f"Reviewed analysis: `{LATEST_ANALYSIS}`", ""]
    target.with_suffix(".md").write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({k:out[k] for k in ("build_id","served","input","source_candidates")}, indent=2))
    print("missing historical parts", [(q["id"],q["stl_units"]) for q in missing_parts])
    print("new mapping candidates", [(q["id"],q["new_parent_outside_candidate_set"],q["task"]) for q in analysis_additions])
    print("tag completeness", [(r["year"],r["tier"],r["all_parts"],r["parts_with_examined_syllabus_tag"]) for r in by_year_tier])


if __name__ == "__main__":
    main()
