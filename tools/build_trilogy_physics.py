"""Build a local Trilogy Physics input for the shared viewer.

The upstream database and PDFs are opened read-only. Only bounded question and
mark-scheme crops are written beside the output JSON; source pages and assessment
workbooks are never copied. This is a preview input until assessment matching is
complete. Run with the bundled Python runtime (PyMuPDF required).
"""

import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import sys

import fitz
sys.path.insert(0, str(Path(__file__).resolve().parent))
from trilogy_reviewed_topics import load_reviewed_topics


DEFAULT_SOURCE = Path(r"C:\CodexProjects\PaperDatabases")
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "dist/physics-inputs/trilogy.json"
TOPICS = {"6.2": "electricity", "6.5": "forces"}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def exclusion_closure(initial_parents, part_parent, links):
    """Withhold full parents and all linked F/H equivalents to a fixed point."""
    excluded = set(initial_parents)
    changed = True
    while changed:
        changed = False
        for left, right in links:
            parents = {part_parent[x] for x in (left, right) if x in part_parent}
            if excluded.intersection(parents) and not parents.issubset(excluded):
                excluded.update(parents)
                changed = True
    return excluded


def selected_plan_parts(plan, groups, part_parent):
    """Resolve the dated plan's explicit selections to existing source parts."""
    text = plan.read_text(encoding="utf-8-sig")
    if "Assembled from June 2025 AQA past papers" not in text:
        raise ValueError("Recheck the assessment plan's source year before rebuilding")
    selections = []
    for line in text.splitlines():
        if not (line.lstrip().startswith("**") and re.search(r"`IN_PAPER[^`]*`", line)):
            continue
        match = re.match(r"\*\*(Syn)?([1-4])([FH])\s+(\d+\.\d+)\s+\[\d+m\]\*\*\s+`IN_PAPER(?: \(MODIFIED\))?`", line.strip())
        if not match:
            raise ValueError(f"Unrecognised IN_PAPER selection: {line}")
        selections.append(match.groups())
    if not selections:
        raise ValueError("No explicit IN_PAPER selections found in the current plan")
    selected = set()
    for synergy, paper, tier, label in selections:
        course = "Synergy" if synergy else "Trilogy"
        papers = {g["exam_paper_id"] for g in groups.values()
                  if g["course"] == course and str(g["year"]) == "2025"
                  and str(g["paper"]).lower().lstrip("p") == paper
                  and str(g["tier"]).upper() == tier}
        if len(papers) != 1:
            raise ValueError(f"Ambiguous assessment source: {course} 2025 {paper}{tier}")
        part_id = f"{next(iter(papers))}::{label}"
        if part_id not in part_parent:
            raise ValueError(f"Assessment selection is missing from the database: {part_id}")
        selected.add(part_id)
    return selected


def source_year(metadata, document, source_root):
    """Recover a specimen's date only from its original printed cover."""
    year = str(metadata["year"])
    if re.fullmatch(r"\d{4}", year):
        if int(year) >= 2026:
            raise ValueError("2026 and later papers are reserved for mocks")
        return year, None
    if not year.startswith("specimen"):
        raise ValueError("Source has no verified exam or specimen year")
    source_path = (source_root / document["source"]["relative_path"]).resolve()
    if not source_path.is_relative_to(source_root.resolve()):
        raise ValueError("Specimen source is outside PaperDatabases")
    source_bytes = source_path.read_bytes()
    with fitz.open(stream=source_bytes, filetype="pdf") as pdf:
        cover = pdf[0].get_text()
    match = re.search(r"\bSpecimen\s+(20\d{2})\b", cover, re.IGNORECASE)
    if not match:
        raise ValueError("Specimen cover has no explicit date")
    if int(match[1]) >= 2026:
        raise ValueError("2026 and later specimens are reserved for mocks")
    return match[1], {"source": str(source_path), "sha256": hashlib.sha256(source_bytes).hexdigest(),
                      "source_page": 1, "printed_date": match.group(0), "source_series": year}


def collect_regions(items):
    regions = defaultdict(list)
    for item in items:
        for region in item.get("crop_regions", []):
            bbox = region.get("bbox", [])
            if len(bbox) == 4 and bbox[2] > bbox[0] and bbox[3] > bbox[1]:
                regions[int(region["page_number"])].append(bbox)
    return regions


def union_bounds(regions):
    return {page: [min(b[0] for b in boxes), min(b[1] for b in boxes),
                   max(b[2] for b in boxes), max(b[3] for b in boxes)]
            for page, boxes in regions.items()}


def crop_bounds_without_neighbours(bounds, other_bounds):
    """Reject interleaved groups; cap padding at the nearest neighbouring group."""
    result = {}
    for page, box in bounds.items():
        top, bottom = box[1] - 6, box[3] + 8
        for other in other_bounds:
            if page not in other:
                continue
            neighbour = other[page]
            if min(box[3], neighbour[3]) > max(box[1], neighbour[1]) + 0.5:
                raise ValueError(f"Question boundaries overlap another parent on page {page}")
            if neighbour[3] <= box[1]:
                top = max(top, (neighbour[3] + box[1]) / 2)
            if neighbour[1] >= box[3]:
                bottom = min(bottom, (neighbour[1] + box[3]) / 2)
        # Include printed question numbers at the left of AQA's text column.
        result[page] = [min(42, box[0] - 6), top, max(545, box[2] + 6), bottom]
    return result


def apply_reviewed_crop_rules(parent, raw_bounds, padded_bounds, other_bounds,
                             document, source_root, rules):
    """Apply only source-bound visual corrections to the consumer's crops."""
    result = {page: list(box) for page, box in padded_bounds.items()}
    for rule in rules:
        if rule["parent_id"] != parent:
            continue
        relative = document["source"]["relative_path"]
        source = (source_root / relative).resolve()
        if (not source.is_relative_to(source_root.resolve())
                or relative.replace("\\", "/") != rule["source_relative_path"].replace("\\", "/")
                or hashlib.sha256(source.read_bytes()).hexdigest() != rule["source_sha256"]):
            raise ValueError(f"Reviewed crop source changed: {parent}")
        evidence = rule["evidence"]
        preview = (source_root / evidence["question_preview_relative_path"]).resolve()
        if (not preview.is_relative_to(source_root.resolve())
                or hashlib.sha256(preview.read_bytes()).hexdigest() != evidence["question_preview_sha256"]):
            raise ValueError(f"Reviewed question extraction changed: {parent}")
        page = int(rule["page"])
        actual = raw_bounds.get(page, [])
        expected = rule["expected_raw_bounds"]
        if len(actual) != 4 or len(expected) != 4 or any(abs(a - b) > 0.02 for a, b in zip(actual, expected)):
            raise ValueError(f"Reviewed crop geometry changed: {parent} page {page}")
        if rule["action"] == "drop_page":
            del result[page]
        elif rule["action"] == "set_top":
            top = float(rule["top"])
            if not 0 <= top < result[page][3]:
                raise ValueError("Invalid reviewed crop top")
            for neighbour in other_bounds:
                if page in neighbour and min(result[page][3], neighbour[page][3]) > max(top, neighbour[page][1]) + 0.5:
                    raise ValueError("Reviewed crop would include another question")
            result[page][1] = top
        else:
            raise ValueError("Unknown reviewed crop action")
    return result


def resolve_part_appearances(parent, paper, parts, document, preview_path, source_root, rules):
    """Preserve a printed numbering typo while distinguishing its two prompts."""
    resolved = []
    for part in parts:
        copy = {**part, "consumer_part_id": f"{paper}::{part['label']}", "markscheme_label": part["label"]}
        matches = [r for r in rules if r["parent_id"] == parent
                   and r["printed_label"] == part["label"] and r["page_start"] == part["page_start"]]
        if len(matches) > 1:
            raise ValueError("Ambiguous reviewed part identity")
        if matches:
            rule = matches[0]
            relative = document["source"]["relative_path"]
            source = (source_root / relative).resolve()
            if (not source.is_relative_to(source_root.resolve())
                    or relative.replace("\\", "/") != rule["source_relative_path"].replace("\\", "/")
                    or hashlib.sha256(source.read_bytes()).hexdigest() != rule["source_sha256"]
                    or hashlib.sha256(preview_path.read_bytes()).hexdigest() != rule["question_preview_sha256"]):
                raise ValueError("Reviewed duplicate-number source changed")
            scheme = (source_root / rule["markscheme_source_relative_path"]).resolve()
            if (not scheme.is_relative_to(source_root.resolve())
                    or hashlib.sha256(scheme.read_bytes()).hexdigest() != rule["markscheme_source_sha256"]
                    or hashlib.sha256(preview_path.with_name("mark_scheme_preview.json").read_bytes()).hexdigest() != rule["markscheme_preview_sha256"]):
                raise ValueError("Reviewed duplicate-number markscheme changed")
            copy.update(consumer_part_id=rule["part_id"], markscheme_label=rule["markscheme_label"],
                        reviewed_topic_codes=rule["topic_codes"])
        resolved.append(copy)
    if len({part["consumer_part_id"] for part in resolved}) != len(resolved):
        raise ValueError("Duplicate printed part identities require source review")
    return resolved


def render_crops(document, bounds, source_root, output_dir, prefix):
    source_path = (source_root / document["source"]["relative_path"]).resolve()
    if not source_path.is_relative_to(source_root.resolve()) or not source_path.is_file():
        raise ValueError("Missing or invalid source PDF")
    source_pages = {int(p["page_number"]): int(p.get("source_page_number") or p["page_number"])
                    for p in document.get("pages", [])}
    output_dir.mkdir(parents=True, exist_ok=True)
    result = []
    # Hash and render the same bytes so a corrected PDF at the same path cannot
    # reuse an old crop, including when a source changes between build runs.
    source_bytes = source_path.read_bytes()
    source_digest = hashlib.sha256(source_bytes).hexdigest()
    with fitz.open(stream=source_bytes, filetype="pdf") as pdf:
        for page_number, bounds_on_page in sorted(bounds.items()):
            source_number = source_pages.get(page_number, page_number)
            if not 1 <= source_number <= len(pdf):
                raise ValueError("Invalid source page mapping")
            page = pdf[source_number - 1]
            rect = fitz.Rect(bounds_on_page) & page.rect
            if rect.width < 30 or rect.height < 10:
                raise ValueError("Empty or implausibly small question crop")
            # Never accept a full-page fallback, even if an upstream region is bad.
            if rect.width * rect.height >= page.rect.width * page.rect.height * 0.94:
                raise ValueError("Crop would expose an entire source page")
            digest = hashlib.sha256(
                f"{source_path}|{source_digest}|{source_number}|{list(rect)}|dpi=150|alpha=False".encode()).hexdigest()[:12]
            target = output_dir / f"{prefix}-p{page_number:03d}-{digest}.png"
            if not target.exists():
                page.get_pixmap(clip=rect, dpi=150, alpha=False).save(target)
            result.append(str(target.resolve()))
    return result


def build(source_root, output, extra_exclusions=None):
    database = source_root / "Trilogy Categorisation/aqa_extraction_plus_calc.db"
    plan = source_root / "Trilogy Categorisation/2026 Y10 exam design.md"
    if not plan.is_file():
        raise FileNotFoundError(f"Required exclusion evidence is missing: {plan}")
    crop_rules_path = Path(__file__).resolve().parents[1] / "reports/trilogy-reviewed-crop-rules.json"
    crop_rules = read_json(crop_rules_path)
    if crop_rules.get("schema_version") != 1:
        raise ValueError("Unsupported Trilogy crop review schema")
    identity_rules_path = crop_rules_path.with_name("trilogy-reviewed-part-identities.json")
    identity_rules = read_json(identity_rules_path)
    if identity_rules.get("schema_version") != 1:
        raise ValueError("Unsupported Trilogy part identity review schema")
    connection = sqlite3.connect(database.resolve().as_uri() + "?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    part_parent = {r["question_part_id"]: r["question_group_id"] for r in connection.execute(
        "SELECT question_part_id, question_group_id FROM question_parts")}
    links = [tuple(r) for r in connection.execute(
        "SELECT foundation_part_id, higher_part_id FROM cross_tier_links")]
    groups = {r["question_group_id"]: dict(r) for r in connection.execute(
        "SELECT g.*, e.course, e.year, e.series, e.paper, e.tier "
        "FROM question_groups g JOIN exam_papers e USING(exam_paper_id)")}
    plan_parts = selected_plan_parts(plan, groups, part_parent)
    seeds = {key for key, group in groups.items() if str(group["year"]).isdigit() and int(group["year"]) >= 2026}
    seeds.update(part_parent[part] for part in plan_parts)
    evidence = [{"source": str(plan), "sha256": hashlib.sha256(plan.read_bytes()).hexdigest(),
                 "part_ids": sorted(plan_parts),
                 "policy": "Withhold every explicitly selected IN_PAPER part, including modified selections, its whole parent and linked tier variants."},
                {"source": "User instruction, 2026-09-10", "policy": "All 2026 and later source papers are reserved for mocks."}]
    unresolved = []
    reviewed_exclusions = Path(__file__).resolve().parents[1] / "reports/trilogy-reviewed-test-exclusions.json"
    certification = read_json(reviewed_exclusions)
    if not certification.get("complete_test_exclusion_certified"):
        unresolved.append("The other school assessment collection has not yet been fully matched to source questions.")
    current_exclusions = Path(__file__).resolve().parents[1] / "dist/physics-inputs/trilogy-test-exclusions.json"
    # A standalone rebuild must retain the broad current-test reservations.
    # Optional extra rules can only add reservations, never replace that base.
    exclusion_files = [current_exclusions, reviewed_exclusions]
    if extra_exclusions and extra_exclusions.resolve() != current_exclusions.resolve():
        exclusion_files.append(extra_exclusions)
    for exclusion_file in exclusion_files:
        supplied = read_json(exclusion_file)
        evidence.append({"source": str(exclusion_file.resolve()), "sha256": hashlib.sha256(exclusion_file.read_bytes()).hexdigest(),
                         "policy": "Current assessment reservations, including printed-page review of short and image-only questions.",
                         "tests_read": len(supplied.get("tests", [])), "unresolved": supplied.get("unresolved", [])})
        for part in supplied.get("part_ids", []):
            if part in part_parent:
                seeds.add(part_parent[part])
            else:
                unresolved.append(f"Unmatched exclusion part: {part}")
        for parent in supplied.get("parent_ids", []):
            if parent in groups:
                seeds.add(parent)
            else:
                if exclusion_file == reviewed_exclusions:
                    raise ValueError(f"Reviewed test reservation refers to an unknown source parent: {parent}")
                unresolved.append(f"Unmatched exclusion parent: {parent}")
        for paper in supplied.get("paper_ids", []):
            matches = {key for key, group in groups.items() if group["exam_paper_id"] == paper}
            seeds.update(matches)
            if not matches:
                unresolved.append(f"Unmatched exclusion paper: {paper}")
    excluded = exclusion_closure(seeds, part_parent, links)
    selected = defaultdict(set)
    part_topics = defaultdict(set)
    for row in connection.execute(
        "SELECT p.question_part_id, p.question_group_id, t.section_no FROM question_part_syllabus_tags t "
        "JOIN question_parts p USING(question_part_id) "
        "JOIN question_groups g USING(question_group_id) JOIN exam_papers e USING(exam_paper_id) "
        "WHERE e.course='Trilogy' AND t.role='examined' "
        "AND (t.section_no LIKE '6.2%' OR t.section_no LIKE '6.5%')"):
        selected[row["question_group_id"]].add(TOPICS[row["section_no"][:3]])
        part_topics[row["question_part_id"]].add(TOPICS[row["section_no"][:3]])
    connection.close()
    reviewed = load_reviewed_topics(source_root)
    for part_id, topics in reviewed["part_topics"].items():
        if part_id not in part_parent:
            raise ValueError(f"Reviewed topic refers to an unknown source part: {part_id}")
        part_topics[part_id].update(topics)
        selected[part_parent[part_id]].update(topics)
    output = output.resolve()
    assets = output.parent / "trilogy-assets"
    questions, skipped, specimen_dates = [], [], {}
    by_paper = defaultdict(list)
    for parent in sorted(selected):
        if parent not in excluded:
            by_paper[groups[parent]["exam_paper_id"]].append(parent)
    for paper, parents in by_paper.items():
        preview_dir = source_root / "outputs/previews" / paper
        try:
            question_doc = read_json(preview_dir / "question_preview.json")
            ms_doc = read_json(preview_dir / "mark_scheme_preview.json")
            preview = read_json(preview_dir / "preview.json")
            documents = {d["source"]["document_type"]: d for d in preview["documents"]}
            dated_year, specimen = source_year(groups[parents[0]], documents["question_paper"], source_root)
            if specimen:
                set_match = re.search(r"_specimen_set(\d+)_", paper)
                if not set_match:
                    raise ValueError("Specimen source has no identifiable set number")
                specimen["set"] = int(set_match[1])
                specimen_dates[paper] = specimen
            question_groups = {str(g["question_number"]): g for g in question_doc["question_groups"]}
            qbounds = {number: union_bounds(collect_regions(g.get("stems", []) + g["parts"]))
                       for number, g in question_groups.items()}
            ms_entries = defaultdict(list)
            for entry in ms_doc["entries"]:
                ms_entries[str(entry.get("question_number") or entry["label"].split(".")[0])].append(entry)
            mbounds = {number: union_bounds(collect_regions(entries)) for number, entries in ms_entries.items()}
        except (OSError, KeyError, ValueError) as error:
            skipped.extend({"parent_id": parent, "reason": str(error)} for parent in parents)
            continue
        for parent in parents:
            metadata = groups[parent]
            number = str(metadata["question_number"])
            try:
                group = question_groups[number]
                parts = resolve_part_appearances(parent, paper, group["parts"], documents["question_paper"],
                                                 preview_dir / "question_preview.json", source_root, identity_rules["rules"])
                answers = {entry["label"]: entry for entry in ms_entries[number]}
                if not parts or not qbounds[number] or not mbounds[number]:
                    raise ValueError("Missing question, shared context or mark-scheme bounds")
                for part in parts:
                    if not part.get("crop_regions") or part["markscheme_label"] not in answers:
                        raise ValueError(f"Missing visual or mark-scheme alignment for {part['label']}")
                    answer = answers[part["markscheme_label"]]
                    if (not answer.get("crop_regions") or not isinstance(part.get("marks"), (int, float))
                            or part["marks"] <= 0 or part["marks"] != answer.get("marks")):
                        raise ValueError(f"Uncertain marks or visual alignment for {part['label']}")
                question_bounds = crop_bounds_without_neighbours(
                    qbounds[number], [v for k, v in qbounds.items() if k != number])
                question_bounds = apply_reviewed_crop_rules(
                    parent, qbounds[number], question_bounds, [v for k, v in qbounds.items() if k != number],
                    documents["question_paper"], source_root, crop_rules["rules"])
                answer_bounds = crop_bounds_without_neighbours(
                    mbounds[number], [v for k, v in mbounds.items() if k != number])
                question_images = render_crops(documents["question_paper"], question_bounds,
                                               source_root, assets, f"{paper}-Q{number}-question")
                answer_images = render_crops(documents["mark_scheme"], answer_bounds,
                                             source_root, assets, f"{paper}-Q{number}-markscheme")
                if not question_images or not answer_images:
                    raise ValueError("No bounded images produced")
                questions.append({
                    "id": parent, "parent_id": parent, "topic_codes": sorted(selected[parent]),
                    "year": dated_year, "paper": metadata["paper"], "level": metadata["tier"],
                    "question_number": number, "label": "",
                    "marks": sum(part.get("marks") or 0 for part in parts),
                    "question_images": question_images, "markscheme_images": answer_images,
                    "source_label": f"AQA Trilogy {dated_year} {'Specimen set ' + str(specimen['set']) if specimen else metadata['series']} {metadata['paper']}{metadata['tier']}",
                    "source_series": metadata["series"], "specimen": specimen,
                    "part_ids": [part["consumer_part_id"] for part in parts],
                    "topic_part_ids": {topic: [part["consumer_part_id"] for part in parts
                                               if topic in part.get("reviewed_topic_codes", part_topics[f"{paper}::{part['label']}"])]
                                       for topic in sorted(selected[parent])},
                })
            except (OSError, KeyError, ValueError) as error:
                skipped.append({"parent_id": parent, "reason": str(error)})
    assert not excluded.intersection(q["parent_id"] for q in questions)
    assert all(Path(path).is_file() for q in questions for kind in ("question_images", "markscheme_images") for path in q[kind])
    # The exclusion flag is derived, never asserted. The Trilogy Categorisation seat
    # certifies a scope; this build must fall inside that scope for the flag to stand.
    # Widen the topics, or admit a second award to serving, and it drops on its own.
    served_topics = {topic for q in questions for topic in q["topic_codes"]}
    scope = certification.get("certification_scope", {})
    scope_reasons = []
    if not certification.get("complete_test_exclusion_certified"):
        scope_reasons.append("The reviewed test exclusions do not certify a complete assessment comparison.")
    if set(scope.get("topic_codes", [])) != set(TOPICS.values()):
        scope_reasons.append(f"Certified topics {sorted(scope.get('topic_codes', []))} do not match the builder's topics {sorted(set(TOPICS.values()))}.")
    if not served_topics <= set(scope.get("topic_codes", [])):
        scope_reasons.append(f"Served topics {sorted(served_topics)} fall outside the certified topics {sorted(scope.get('topic_codes', []))}.")
    if set(scope.get("serving_courses", [])) != {"Trilogy"}:
        scope_reasons.append(f"Certified serving courses {sorted(scope.get('serving_courses', []))} are not Trilogy alone.")
    if unresolved:
        scope_reasons.append("Unresolved reservations remain in this build.")
    exclusion_review_complete = not scope_reasons
    result = {
        "meta": {"course": "trilogy", "title": "Trilogy Physics",
                 "topics": {"electricity": "Electricity", "forces": "Forces"},
                 "exclusion_review_complete": exclusion_review_complete,
                 "exclusion_review": {"certified_on": certification.get("closing_pass_on"),
                                      "scope": scope,
                                      "withheld_reasons": scope_reasons,
                                      "evidence": certification.get("certification_evidence", {})}},
        "questions": questions,
        "report": {"sources": [str(database.resolve()), str(source_root / "outputs/previews")],
                   "known_exclusions": evidence, "excluded_parent_ids": sorted(excluded),
                   "candidate_parent_count": len(selected),
                   "excluded_candidate_parent_count": len(set(selected).intersection(excluded)),
                   "served_parent_count": len(questions),
                   "specimen_dates": specimen_dates,
                   "reviewed_topic_sources": reviewed["provenance"],
                   "reviewed_topic_part_ids": reviewed["reviewed_part_ids"],
                   "crop_review": {"source": str(crop_rules_path), "sha256": hashlib.sha256(crop_rules_path.read_bytes()).hexdigest(),
                                   "rules": crop_rules["rules"]},
                   "part_identity_review": {"source": str(identity_rules_path), "sha256": hashlib.sha256(identity_rules_path.read_bytes()).hexdigest(),
                                            "rules": identity_rules["rules"]},
                   "topic_counts": dict(Counter(topic for q in questions for topic in q["topic_codes"])),
                   "skipped": skipped, "unresolved": unresolved,
                   "representation": "Whole parent questions with shared stems, bounded PDF crops and complete matching mark-scheme parts."},
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output), "questions": len(questions),
                      "topics": result["report"]["topic_counts"], "skipped": len(skipped),
                      "exclusion_review_complete": exclusion_review_complete,
                      "exclusion_review_withheld_reasons": scope_reasons}))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--exclusions", type=Path, help="JSON containing reviewed part_ids, parent_ids and/or paper_ids")
    args = parser.parse_args()
    build(args.source_root, args.output, args.exclusions)
