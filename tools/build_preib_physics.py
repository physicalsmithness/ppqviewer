"""Build a small, reviewed 4SS0-scope Pre-IB forces viewer input.

Reads the canonical Edexcel part mappings, the specification scope spine and
original PDFs. Only generated question crops and the input JSON are written.
Supply --test with the current school test for conservative test matching.
The output remains a teacher preview until its source-bound exclusion audit validates.
"""

import argparse
from collections import defaultdict
import csv
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_trilogy_physics import read_json, render_crops
from match_trilogy_current_tests import normalise, read_text, shingles


DEFAULT_SOURCE = Path(r"C:\CodexProjects\PaperDatabases")
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "dist/physics-inputs/preib.json"
EXPECTED_TEST = r"H:\Shared drives\0. Physics (Teachers)\3 - Pre-IB\PreIB forces and motion test 2024.pdf"

# These clean content tags still require an out-of-scope sibling's spring-force
# calculation/diagram setup. A content tag alone does not clear the dependency.
DEPENDENCY_RESERVATIONS = {
    "edexcel_4sd0_1p_2024_jun::05.b.ii": "Acceleration uses the net force obtained in 5(b)(i), whose 1.14/1.15 mapping is outside 4SS0.",
    "edexcel_4sd0_1p_2024_jun::05.b.iii": "Spring motion refers to the same preceding out-of-scope force and Hooke-law setup; withhold this context-dependent fragment.",
}

# Source questions identified by comparing the rendered school assessments.
# Extracted strings omit or interleave diagram labels, so text matching alone
# does not reliably find these. A matching part reserves its entire parent.
VISUAL_TEST_RESERVATIONS = {
    "edexcel_4sd0_1p_2019_jun::Q04": "Current Forces test page 12 Q9 repeats the car hazard/reaction-time graph (15 m/s, 0.9 s reaction).",
    "edexcel_4sd0_1pr_2019_jun::Q10": "Current Forces test page 10 Q7 repeats the loaded-van braking question: 2500 kg, 14 kN, 18 m/s; the school text consolidates the original setup.",
    "edexcel_4sd0_1p_2020_nov::Q02": "Current Forces test page 8 Q5 repeats the train braking graph and acceleration task; the extracted original graph labels interrupt its context text.",
    "edexcel_4sd0_1pr_2020_nov::Q11": "Current Forces test pages 4-5 Q2 reuse this thinking/braking-distance graph, with the school questions following the graph.",
}


def csv_rows(path):
    with path.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def parent_id(row):
    return f"{row['paper_slug']}::Q{row['label'].split('.')[0]}"


def fingerprint(path):
    return {"path": str(path.resolve()), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


def load_mappings(category):
    """Read merged mappings plus the three completed source-reviewed returns.

    Returns remain separate from masters. Their existing spec-ref evidence is
    validated and this consumer performs its own crop/exclusion review.
    """
    paths = [category / "masters/parts.csv", category / "masters/tags.csv"]
    merged = csv_rows(paths[0])
    rows = [{**row, "consumer_mapping_source": "architect_merged_master"} for row in merged]
    ids = {row["part_id"] for row in rows}
    source_counts = [{"source": str(paths[0]), "mapping_status": "architect_merged", "parts": len(merged)}]
    issues = []
    for block in ("B01", "B02", "B03"):
        directory = category / "returns" / f"PACKET_006_{block}"
        parts_path, tags_path = directory / "parts.csv", directory / "tags.csv"
        feedback = directory / f"FEEDBACK_006_{block}.md"
        if not all(path.is_file() for path in (parts_path, tags_path, feedback)):
            continue
        paths.extend([parts_path, tags_path, feedback])
        spec_tags = defaultdict(list)
        for tag in csv_rows(tags_path):
            if tag["tag_type"] == "spec_ref":
                spec_tags[tag["part_id"]].append(tag)
        returned = csv_rows(parts_path)
        accepted = 0
        for row in returned:
            key = row["part_id"]
            if key in ids:
                issues.append({"part_id": key, "reason": "Return duplicates an earlier mapping; earlier canonical mapping retained."})
                continue
            refs = {value.strip() for value in row["specRefs"].split(";") if value.strip()}
            tags = spec_tags[key]
            if refs != {tag["tag_value"] for tag in tags} or any(not tag["evidence"].strip() for tag in tags):
                issues.append({"part_id": key, "reason": "Return's specRefs disagree with its per-code evidence tags."})
                continue
            rows.append({**row, "consumer_mapping_source": f"source_reviewed_return_PACKET_006_{block}"})
            ids.add(key)
            accepted += 1
        source_counts.append({"source": str(parts_path), "mapping_status": "source_reviewed_return_not_architect_merged", "parts": len(returned), "consistent_parts": accepted})
    return rows, paths, source_counts, issues


def test_matches(source_rows, tests, snapshot_provenance=None):
    excluded, evidence, inventories, pending = set(), [], [], []
    test_grams = set()
    for test in tests:
        try:
            raw, pages = read_text(test)
            text = normalise(raw)
            grams = shingles(text.split())
            test_grams.update(grams)
            matched = set()
            for row in source_rows:
                for field in ("context_text", "question_text"):
                    source = normalise(row.get(field, ""))
                    words = source.split()
                    short_formula = field == "question_text" and bool(re.match(r"^(state|write|give) the (formula|equation) linking ", source))
                    if not short_formula and (len(words) < 14 or len(source) < 85):
                        continue
                    source_grams = shingles(words)
                    overlap = len(source_grams.intersection(grams))
                    coverage = overlap / max(1, len(source_grams))
                    exact = source in text
                    if exact or (len(words) >= 32 and overlap >= 18 and coverage >= 0.8):
                        parent = parent_id(row)
                        excluded.add(parent)
                        matched.add(parent)
                        evidence.append({"test": str(test.resolve()), "parent_id": parent,
                                         "part_id": row["part_id"], "source_field": field,
                                         "method": "exact_formula_recall_prompt" if exact and short_formula else "exact_normalised_source_phrase" if exact else "extensive_source_phrase_overlap",
                                         "source_excerpt": source[:220], "phrase_coverage": round(coverage, 3)})
            inventories.append({**fingerprint(test), **(snapshot_provenance or {}).get(str(test.resolve()), {}), "pages": pages,
                                "extracted_words": len(text.split()), "matched_parent_count": len(matched)})
            if len(text.split()) < 80:
                pending.append({"test": str(test), "reason": "Too little extractable text; visual matching is required."})
            if not matched:
                pending.append({"test": str(test), "reason": "No long source-text match found; this does not clear scanned, short or rewritten questions."})
        except (OSError, ValueError) as error:
            inventories.append({"path": str(test), "error": str(error)})
            pending.append({"test": str(test), "reason": str(error)})
    if not tests:
        pending.append({"test": EXPECTED_TEST, "reason": "Current school test has not yet been supplied to this build."})
    # Identical long source text in another parent is the same reservation even
    # when it appears under a different paper code or sitting.
    signatures = defaultdict(set)
    for row in source_rows:
        for field in ("context_text", "question_text"):
            value = normalise(row.get(field, ""))
            if len(value.split()) >= 14 and len(value) >= 85:
                signatures[value].add(parent_id(row))
    changed = True
    while changed:
        changed = False
        for parents in signatures.values():
            if parents.intersection(excluded) and not parents.issubset(excluded):
                excluded.update(parents)
                changed = True
    return excluded, evidence, inventories, pending, test_grams


def bounded_regions(items):
    """Deduplicate shared context and merge only touching/overlapping regions.

    Disjoint regions stay disjoint: filling the space between a diagram and a
    later part could expose another question, an answer or off-syllabus content.
    """
    per_page = defaultdict(list)
    for item in items:
        for region in item.get("crop_regions", []):
            box = region.get("bbox", [])
            if len(box) != 4 or box[2] <= box[0] or box[3] <= box[1]:
                raise ValueError("Invalid extracted crop region")
            per_page[int(region["page_number"])].append(list(box))
    result = []
    for page, boxes in sorted(per_page.items()):
        boxes.sort(key=lambda box: (box[1], box[3]))
        merged = []
        for box in boxes:
            if merged and box[1] <= merged[-1][3]:
                previous = merged[-1]
                merged[-1] = [min(previous[0], box[0]), previous[1],
                              max(previous[2], box[2]), max(previous[3], box[3])]
            else:
                merged.append(box)
        for box in merged:
            # Padding is intentionally small to avoid neighbouring printed parts.
            result.append((page, [max(25, box[0] - 5), box[1] - 3,
                                  min(568, box[2] + 5), box[3] + 4]))
    return result


def render_items(document, items, root, directory, prefix):
    regions = bounded_regions(items)
    if not regions:
        raise ValueError("No authentic question crop regions")
    images = []
    for number, (page, box) in enumerate(regions, 1):
        images.extend(render_crops(document, {page: box}, root, directory,
                                   f"{prefix}-region{number:02d}"))
    return images


def reviewed_crop_item(item, part_id, kind):
    """Corrections verified against the source page; never edit the corpus."""
    item = deepcopy(item)
    if part_id == "edexcel_4sd0_1pr_2019_jun::08.a.ii":
        if kind == "question":
            # The extraction box includes sibling 8(a)(i), an out-of-scope
            # terminal-velocity MCQ. Retain only the graph and area MCQ.
            item["crop_regions"] = [
                {"page_number": 20, "bbox": [70.87, 87.84, 534.66, 347]},
                {"page_number": 20, "bbox": [70.87, 536, 534.66, 667.74]},
            ]
        else:
            item["crop_regions"] = [{"page_number": 12, "bbox": [123.35, 169.88, 534.38, 259.5]}]
    if part_id == "edexcel_4sd0_1p_2020_jan::05.a.i" and kind == "question":
        # Preserve the printed one-mark label below this page's final prompt.
        item["crop_regions"][0]["bbox"][3] += 15
    return item


def attach_available_visual_review(result):
    """Attach an existing human/agent audit only while all reviewed bytes match.

    The user selected PDF/Word as the current Forces assessment on 2026-09-10;
    that exact unread Google Doc may be recorded as an unselected version. A new
    candidate, source revision, test or crop still requires a new visual review.
    """
    result["meta"]["exclusion_review_complete"] = False
    audit_path = Path(__file__).resolve().parents[1] / "dist/physics-audit/preib-current-assessments/candidate-review.json"
    if not audit_path.is_file():
        return
    audit = read_json(audit_path)
    inventory = result["report"]["assessment_inventory"]
    checks = []
    try:
        assert inventory and inventory["sha256"] == audit["manifest"]["sha256"]
        assert result["report"]["sources"] == audit["source_fingerprints"]
        reviewed = {entry["parent_id"]: entry for entry in audit["candidate_reviews"]}
        assert set(reviewed) == {question["id"] for question in result["questions"]}
        assert {entry["sha256"] for entry in result["report"]["test_sources"]} == {entry["sha256"] for entry in audit["document_reviews"]}
        for question in result["questions"]:
            entry = reviewed[question["id"]]
            assert question["part_ids"] == entry["part_ids"]
            assert question["specification_codes"] == entry["specification_codes"]
            actual = [{"kind": kind, **fingerprint(Path(path))}
                      for kind in ("question_images", "markscheme_images") for path in question[kind]]
            assert actual == entry["reviewed_assets"]
        for entry in audit["document_reviews"]:
            checks.extend(entry["reviewed_galleries"])
            checks.append(entry["text_evidence"])
        for entry in checks:
            assert fingerprint(Path(entry["path"]))["sha256"] == entry["sha256"]
    except (AssertionError, OSError, KeyError) as error:
        result["report"]["unresolved"].append("Saved visual comparison no longer matches all current source, test or candidate assets; review it again.")
        return
    allowed_unselected = r"H:\Shared drives\0. Physics (Teachers)\3 - Pre-IB\PreIB forces and motion test 2024.gdoc"
    selections = [entry for entry in audit.get("user_selected_version_exceptions", [])
                  if entry.get("source") == allowed_unselected
                  and entry.get("status") == "unread_not_selected_as_current_assessment"]
    unselected = {entry["source"] for entry in selections}
    unresolved_variants = [entry for entry in inventory["unsupported"] if entry.get("path") not in unselected]
    unresolved = [*audit["unresolved_sources"], *inventory["errors"], *unresolved_variants]
    cleared = bool(audit.get("broader_assessment_inventory_review_complete") and not unresolved)
    result["meta"]["exclusion_review_complete"] = cleared
    result["report"]["available_assessment_visual_review"] = {
        **fingerprint(audit_path), "available_snapshots_review_complete": True,
        "document_count": audit["document_count"], "unique_document_count": audit["unique_document_count"],
        "retained_set_count": len(reviewed), "unresolved_sources": unresolved,
        "user_selected_version_exceptions": selections,
        "full_assessment_clearance": cleared,
        "clearance_scope": "Only these retained question sets against the exact selected PDF/Word assessment snapshots"}
    for entry in result["report"]["candidate_exclusion_checks"]:
        if entry["parent_id"] in reviewed:
            entry["status"] = "Text and visual comparison complete against the user-selected PDF/Word assessment snapshots"
    result["report"]["unresolved"] = unresolved


def build(root, output, tests, snapshot_test=False, test_manifest=None):
    category = root / "Edexcel Categorisation"
    master_path = category / "masters/parts.csv"
    spine_path = category / "syllabus_spine.csv"
    archive_path = root / "outputs/exports/edexcel_physics_flat_v1.csv"
    project_path = category / "PROJECT.md"
    # The source project explicitly identifies 4SS0 as the school's Pre-IB
    # course. Do not infer this from the exam-board name or GCSE level.
    project = project_path.read_text(encoding="utf-8-sig")
    if "course this school calls Pre-IB" not in project or "4SS0" not in project:
        raise ValueError("Missing authoritative Pre-IB-to-4SS0 course mapping")
    masters, mapping_paths, mapping_counts, mapping_issues = load_mappings(category)
    spine = {row["code"]: row for row in csv_rows(spine_path)}
    archive = csv_rows(archive_path)
    flat = {row["part_id"]: row for row in archive}
    selected, skipped = defaultdict(list), []
    forces_mapping_count, scope_count = 0, 0
    for row in masters:
        codes = [value.strip() for value in re.split(r"[;,]", row["specRefs"]) if value.strip()]
        # Use assessed content codes, including force calculations whose parent
        # apparatus is tagged magnetism; do not infer a new syllabus code.
        if row["primaryTopic"] != "topic1_forces" and not (codes and all(code.startswith("1.") for code in codes)):
            continue
        forces_mapping_count += 1
        reason = None
        if row["specAttribution"] != "clear" or not codes:
            reason = "The canonical mapping has no clear assessed 4SS0 content code."
        elif any(code not in spine or spine[code]["in_4SS0"] != "yes" for code in codes):
            reason = "At least one assessed source code is outside 4SS0 scope."
        else:
            scope_count += 1
        if not reason and row["part_id"] in DEPENDENCY_RESERVATIONS:
            reason = DEPENDENCY_RESERVATIONS[row["part_id"]]
        elif not reason and row["part_id"] not in flat:
            reason = "Canonical part missing from the aligned extraction archive."
        if reason:
            skipped.append({"part_id": row["part_id"], "reason": reason})
            continue
        source = flat[row["part_id"]]
        if source["year"].isdigit() and int(source["year"]) >= 2026:
            skipped.append({"part_id": row["part_id"], "reason": "2026 and later papers are reserved for mocks."})
            continue
        selected[parent_id(source)].append({"mapping": row, "source": source, "codes": codes})
    assessment_inventory = None
    if test_manifest:
        manifest = read_json(test_manifest)
        tests = sorted(set(tests + [Path(entry["snapshot_path"]) for entry in manifest["files"] if entry.get("snapshot_path")]))
        assessment_inventory = {**fingerprint(test_manifest), "source_root": manifest.get("source_root"),
                                "snapshot_count": len(manifest["files"]), "unsupported": manifest.get("unsupported", []),
                                "errors": [entry for entry in manifest["files"] if "error" in entry],
                                "scope": manifest.get("scope")}
    snapshot_provenance = {}
    if snapshot_test:
        snapshot_dir = Path(__file__).resolve().parents[1] / "dist/physics-audit/preib-current-test"
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        local_tests = []
        for test in tests:
            content = test.read_bytes()
            digest = hashlib.sha256(content).hexdigest()
            snapshot = snapshot_dir / f"{digest[:12]}-{test.name}"
            if not snapshot.exists() or hashlib.sha256(snapshot.read_bytes()).hexdigest() != digest:
                snapshot.write_bytes(content)
            snapshot_provenance[str(snapshot.resolve())] = {
                "original_path": str(test), "snapshot_path": str(snapshot.resolve()),
                "sha256": digest, "snapshot_bytes": len(content),
                "snapshot_policy": "Exact source bytes retained in the unserved local audit directory."}
            snapshot.with_name(snapshot.name + ".provenance.json").write_text(
                json.dumps(snapshot_provenance[str(snapshot.resolve())], ensure_ascii=False, indent=2), encoding="utf-8")
            local_tests.append(snapshot)
        tests = local_tests
    else:
        for test in tests:
            sidecar = test.with_name(test.name + ".provenance.json")
            if sidecar.is_file():
                prior = read_json(sidecar)
                if prior.get("sha256") == hashlib.sha256(test.read_bytes()).hexdigest():
                    snapshot_provenance[str(test.resolve())] = prior
    excluded, evidence, inventories, pending, test_grams = test_matches(archive, tests, snapshot_provenance)
    excluded.update(VISUAL_TEST_RESERVATIONS)
    evidence.extend({"parent_id": parent, "method": "visual_question_and_diagram_match", "evidence": reason,
                     "assessment_snapshot_sha256": "e70bd455b5e9ff7accfb981ea7e99e654cc7b71a7e1e3331e71c5f4a114f6653"}
                    for parent, reason in VISUAL_TEST_RESERVATIONS.items())
    if assessment_inventory:
        pending.extend(assessment_inventory["unsupported"])
        pending.extend(assessment_inventory["errors"])
    output = output.resolve()
    assets = output.parent / "preib-assets"
    questions, crop_errors, candidate_checks = [], [], []
    previews = {}
    for parent, records in sorted(selected.items()):
        strongest = 0
        for record in records:
            for field in ("context_text", "question_text"):
                phrases = shingles(normalise(record["source"].get(field, "")).split())
                strongest = max(strongest, len(phrases.intersection(test_grams)))
        candidate_checks.append({"parent_id": parent, "withheld": parent in excluded,
                                 "shared_eight_word_phrases": strongest,
                                 "status": "Withheld on a source-text match" if parent in excluded else "No strong text match; visual check outstanding"})
        if parent in excluded:
            continue
        paper = records[0]["source"]["paper_slug"]
        try:
            if paper not in previews:
                directory = root / "outputs/previews" / paper
                qdoc = read_json(directory / "question_preview.json")
                mdoc = read_json(directory / "mark_scheme_preview.json")
                raw = read_json(directory / "preview.json")
                previews[paper] = {
                    "parts": {part["label"]: part for group in qdoc["question_groups"] for part in group["parts"]},
                    "answers": {entry["label"]: entry for entry in mdoc["entries"]},
                    "documents": {doc["source"]["document_type"]: doc for doc in raw["documents"]},
                }
            preview = previews[paper]
            qparts, answers = [], []
            for record in records:
                source = record["source"]
                label = source["label"]
                part = preview["parts"][label]
                answer = preview["answers"][label]
                expected = int(float(source["question_marks"]))
                if (source["alignment_status"] != "matched" or expected <= 0
                        or expected != int(float(source["mark_scheme_marks"]))
                        or expected != part.get("marks") or expected != answer.get("marks")):
                    raise ValueError(f"Uncertain marks or scheme alignment for {label}")
                qparts.append(reviewed_crop_item(part, source["part_id"], "question"))
                answers.append(reviewed_crop_item(answer, source["part_id"], "markscheme"))
            number = records[0]["source"]["label"].split(".")[0]
            qimages = render_items(preview["documents"]["question_paper"], qparts, root,
                                   assets, f"{paper}-Q{number}-question")
            mimages = render_items(preview["documents"]["mark_scheme"], answers, root,
                                   assets, f"{paper}-Q{number}-markscheme")
            source = records[0]["source"]
            labels = [record["source"]["label_display"] for record in records]
            questions.append({"id": parent, "parent_id": parent, "topic_codes": ["forces"],
                              "year": source["year"], "paper": source["paper"], "level": "4SS0 scope",
                              "question_number": number, "label": ", ".join(labels),
                              "marks": sum(part["marks"] for part in qparts),
                              "question_images": qimages, "markscheme_images": mimages,
                              "source_label": f"Edexcel {source['syllabus']} {source['year']} {source['series']} {source['paper']}",
                              "part_ids": [record["source"]["part_id"] for record in records],
                              "mapping_provenance": sorted({record["mapping"]["consumer_mapping_source"] for record in records}),
                              "specification_codes": sorted({code for record in records for code in record["codes"]})})
        except (OSError, ValueError, KeyError) as error:
            crop_errors.append({"parent_id": parent, "reason": str(error)})
    assert not excluded.intersection(question["parent_id"] for question in questions)
    assert all(Path(path).is_file() for question in questions
               for kind in ("question_images", "markscheme_images") for path in question[kind])
    result = {
        "meta": {"course": "preib", "title": "Pre-IB Physics", "topics": {"forces": "Forces and motion"},
                 "exclusion_review_complete": False, "syllabus": "4SS0"},
        "questions": questions,
        "report": {"sources": [fingerprint(path) for path in [project_path, spine_path, archive_path, *mapping_paths]],
                   "scope_policy": "School Pre-IB is 4SS0. Every displayed assessed code must be explicitly in_4SS0=yes in the canonical specification spine.",
                   "selection_policy": "Merged exemplar plus completed B01-B03 source-reviewed returns. Existing per-code evidence must agree with part mappings. Only explicit in-scope forces codes are used; ambiguous/unknown mappings and unresolved dependencies are withheld. Returns are consumer-reviewed without modifying or claiming a merge into the source masters.",
                   "mapping_sources": mapping_counts, "mapping_issues": mapping_issues,
                   "filter_counts": {"extracted_archive_parts": len(archive), "mapped_parts": len(masters),
                                     "forces_mapped_parts": forces_mapping_count, "clear_4ss0_scope_parts": scope_count,
                                     "after_dependency_and_year_parts": sum(len(records) for records in selected.values()),
                                     "before_tests_parent_sets": len(selected),
                                     "after_tests_parent_sets": len(set(selected).difference(excluded)),
                                     "rendered_parent_sets": len(questions), "rendered_parts": sum(len(question["part_ids"]) for question in questions)},
                   "representation": "Selected assessed parts with their original diagrams and source context. Disjoint crop regions remain separate to avoid exposing other parts.",
                   "candidate_parent_count": len(selected), "candidate_part_count": sum(len(records) for records in selected.values()),
                   "served_parent_count": len(questions), "served_part_count": sum(len(question["part_ids"]) for question in questions),
                   "topic_counts": {"forces": len(questions)}, "excluded_parent_ids": sorted(excluded),
                   "excluded_candidate_parent_count": len(set(selected).intersection(excluded)),
                   "known_exclusions": evidence, "test_sources": inventories,
                   "assessment_inventory": assessment_inventory,
                   "candidate_exclusion_checks": candidate_checks,
                   "skipped": skipped, "crop_errors": crop_errors,
                   "unresolved": ["Short, scanned or rewritten test questions require a visual comparison before pupil publication.", *pending]},
    }
    attach_available_visual_review(result)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output), "questions": len(questions),
                      "parts": result["report"]["served_part_count"], "tests_read": len(inventories),
                      "excluded_candidate_parents": result["report"]["excluded_candidate_parent_count"],
                      "skipped_parts": len(skipped), "crop_errors": len(crop_errors),
                      "exclusion_review_complete": result["meta"]["exclusion_review_complete"]}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--test", action="append", type=Path, default=[], help="Current school assessment PDF/DOCX; repeat for additional current tests")
    parser.add_argument("--snapshot-test", action="store_true", help="Save exact supplied test bytes in the unserved dist/physics-audit/preib-current-test folder and match from that local snapshot")
    parser.add_argument("--test-manifest", type=Path, help="Read all local assessment snapshots listed by snapshot_preib_current_assessments.py")
    args = parser.parse_args()
    build(args.source_root, args.output, args.test, args.snapshot_test, args.test_manifest)
