"""Targeted read-only assessment snapshot and local review preparation.

--snapshot-current reads exactly the nine named current test files below from H.
It writes snapshots and extracted text only under dist/physics-audit, never to a
served preview. Run without that flag to re-audit existing local snapshots.
--render RELATIVE_PATH --pages 1,2 renders selected PDF pages for visual review.
This helper does not add exclusions or assert that an assessment is cleared.
"""
import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
import fitz

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "dist/physics-audit/trilogy-current-tests"
SOURCE = Path(r"H:\Shared drives\0. Physics (Teachers)\2 - AQA GCSE\Assessments")
TARGETS = [
    "2. Electricity/2023 electricity test.pdf",
    "2. Electricity/2023 Foundation electricity test.pdf",
    "2. Electricity/Electricity test (whole unit).docx",
    "5. Forces and motion/1. Early test/Motion wk4 test 2025.pdf",
    "5. Forces and motion/2. Test before car safety etc/2025 test before momentum and car safety (forces 2).pdf",
    "5. Forces and motion/2. Test before car safety etc/2024 Foundation test b4 car safety.pdf",
    "5. Forces and motion/2. Test before car safety etc/resit motion+forces test b4 car safety 2025.docx",
    "5. Forces and motion/3. Test at end focusing on momentum car safety/motion and forces test 3 2026.docx",
    "5. Forces and motion/3. Test at end focusing on momentum car safety/Motion and forces test 3 FOUNDATION 2024.pdf",
]
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def under(root, relative):
    result = (root / relative).resolve()
    if not result.is_relative_to(root.resolve()):
        raise ValueError("Path outside requested audit scope")
    return result


def extract(local, relative):
    raw = local.read_bytes()
    row = {"relative_path": relative, "local_snapshot": str(local),
           "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    if local.suffix.lower() == ".pdf":
        with fitz.open(stream=raw, filetype="pdf") as doc:
            row["pages"] = [{"page": number + 1, "text": page.get_text("text"),
                             "native_words": len(page.get_text("words")),
                             "images": len(page.get_images())}
                            for number, page in enumerate(doc)]
    else:
        with zipfile.ZipFile(local) as archive:
            document = ET.fromstring(archive.read("word/document.xml"))
            relations = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
            relation_map = {item.attrib["Id"]: item.attrib.get("Target", "") for item in relations}
            blocks = []
            for paragraph in document.iter(W + "p"):
                text = "".join(node.text or "" for node in paragraph.iter(W + "t"))
                media = [relation_map.get(node.attrib.get(R + "embed", ""), "") for node in paragraph.iter(A + "blip")]
                if text or media:
                    blocks.append({"text": text, "media": media})
            row["blocks"] = blocks
            row["native_words"] = sum(len(re.findall(r"\w+", block["text"])) for block in blocks)
            row["embedded_media"] = [item for item in archive.namelist() if item.startswith("word/media/") and not item.endswith("/")]
    return row


def candidate_review(report):
    """Rank local native-text leads for manual comparison; never auto-exclude."""
    database = Path(r"C:\CodexProjects\PaperDatabases\Trilogy Categorisation\aqa_extraction_plus_calc.db")
    connection = sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    def words(text):
        return re.findall(r"[a-z0-9]+", unicodedata.normalize("NFKC", text or "").casefold())
    def grams(tokens):
        return {" ".join(tokens[i:i + 5]) for i in range(len(tokens) - 4)}
    segments, index = [], defaultdict(set)
    for row in connection.execute(
        "SELECT p.question_part_id,p.question_group_id,p.question_text,g.shared_stem_text "
        "FROM question_parts p JOIN question_groups g USING(question_group_id) "
        "JOIN exam_papers e USING(exam_paper_id) WHERE e.course IN ('Trilogy','Synergy')"):
        for kind, text in [("question", row["question_text"]), ("stem", row["shared_stem_text"])]:
            tokens = words(text)
            if len(tokens) < 8:
                continue
            item = {"part_id": row["question_part_id"], "parent_id": row["question_group_id"],
                    "kind": kind, "text": text, "grams": grams(tokens)}
            number = len(segments)
            segments.append(item)
            for gram in item["grams"]:
                index[gram].add(number)
    connection.close()
    parent_frequency = {gram: len({segments[i]["parent_id"] for i in numbers}) for gram, numbers in index.items()}
    old = json.loads((ROOT / "dist/physics-inputs/trilogy-test-exclusions.json").read_text(encoding="utf-8"))
    already = set(old["parent_ids"])
    served = json.loads((ROOT / "dist/physics-inputs/trilogy.json").read_text(encoding="utf-8"))
    served_ids = {q["parent_id"] for q in served["questions"]}
    results = []
    for document in report["documents"]:
        if "pages" in document:
            blocks = [(p["page"], p["text"]) for p in document["pages"]]
        else:
            # Preserve approximate paragraph context without matching across the
            # entire assessment as an unordered bag of generic question phrases.
            blocks = [(f"blocks {i + 1}-{min(i + 12, len(document['blocks']))}",
                       "\n".join(b["text"] for b in document["blocks"][i:i + 12]))
                      for i in range(0, len(document["blocks"]), 8)]
        for location, text in blocks:
            available = grams(words(text))
            hits = defaultdict(set)
            for gram in available:
                if parent_frequency.get(gram, 1000) > 8:
                    continue
                for number in index.get(gram, ()):
                    hits[number].add(gram)
            ranked = []
            for number, overlap in hits.items():
                item = segments[number]
                score = sum(1 / parent_frequency[gram] for gram in overlap)
                if len(overlap) < 2 or score < 1.5:
                    continue
                ranked.append({k: item[k] for k in ["part_id", "parent_id", "kind", "text"]} |
                              {"score": round(score, 3), "distinctive_five_word_runs": len(overlap),
                               "matched_phrases": sorted(overlap)[:8],
                               "previously_reserved": item["parent_id"] in already,
                               "currently_in_preview_input": item["parent_id"] in served_ids})
            ranked.sort(key=lambda item: item["score"], reverse=True)
            seen, top = set(), []
            for candidate in ranked:
                if candidate["parent_id"] in seen:
                    continue
                seen.add(candidate["parent_id"]); top.append(candidate)
                if len(top) == 5:
                    break
            results.append({"test": document["relative_path"], "location": location,
                            "native_text": text, "candidates_for_visual_review": top})
    output = AUDIT / "candidate-review.json"
    output.write_text(json.dumps({"policy": "Distinctive short phrase leads for human visual review only; no automatic identity claim or exclusion.",
                                 "items": results}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"candidate_review": str(output), "locations": len(results),
                      "locations_with_candidates": sum(bool(item["candidates_for_visual_review"]) for item in results)}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot-current", action="store_true")
    parser.add_argument("--render")
    parser.add_argument("--pages", default="")
    parser.add_argument("--candidates", action="store_true")
    parser.add_argument("--extract-media", help="Extract original embedded images from one named local DOCX snapshot")
    args = parser.parse_args()
    snapshots = AUDIT / "snapshots"
    snapshots.mkdir(parents=True, exist_ok=True)
    if args.extract_media:
        if args.extract_media not in TARGETS or not args.extract_media.endswith(".docx"):
            raise ValueError("Media target must be one of the named DOCX tests")
        local = under(snapshots, args.extract_media)
        destination = AUDIT / "review" / re.sub(r"[^a-zA-Z0-9]+", "_", local.stem)
        destination.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(local) as archive:
            for entry in archive.infolist():
                if entry.filename.startswith("word/media/") and not entry.is_dir():
                    if entry.file_size > 20_000_000:
                        raise ValueError("Embedded image exceeds 20 MB audit limit")
                    target = under(destination, Path(entry.filename).name)
                    target.write_bytes(archive.read(entry))
                    print(str(target))
        return
    if args.render:
        if args.render not in TARGETS:
            raise ValueError("Render target outside the nine named tests")
        local = under(snapshots, args.render)
        pages = [int(value) for value in args.pages.split(",") if value]
        if not pages or len(pages) > 15:
            raise ValueError("Choose 1 to 15 pages")
        rendered = AUDIT / "review"
        rendered.mkdir(exist_ok=True)
        with fitz.open(local) as doc:
            for number in pages:
                if not 1 <= number <= len(doc):
                    raise ValueError("Page outside document")
                name = re.sub(r"[^a-zA-Z0-9]+", "_", local.stem) + f"-p{number:02d}.png"
                target = rendered / name
                doc[number - 1].get_pixmap(dpi=120, alpha=False).save(target)
                print(str(target))
        return
    rows, failures = [], []
    previous_path = AUDIT / "targeted-native-audit.json"
    previous_rows = {}
    if previous_path.exists():
        previous_rows = {row["relative_path"]: row for row in json.loads(previous_path.read_text(encoding="utf-8"))["documents"]}
    for relative in TARGETS:
        local = under(snapshots, relative)
        try:
            if args.snapshot_current:
                original = under(SOURCE, relative)
                if original.stat().st_size > 20_000_000:
                    raise ValueError("Assessment exceeds 20 MB bounded snapshot limit")
                raw = original.read_bytes()
                local.parent.mkdir(parents=True, exist_ok=True)
                local.write_bytes(raw)
            row = extract(local, relative)
            if args.snapshot_current:
                row["current_source"] = str(under(SOURCE, relative))
                row["source_last_modified_ns"] = original.stat().st_mtime_ns
            elif previous_rows.get(relative, {}).get("sha256") == row["sha256"]:
                # Local reruns preserve provenance only while snapshot bytes agree.
                for key in ("current_source", "source_last_modified_ns"):
                    if key in previous_rows[relative]:
                        row[key] = previous_rows[relative][key]
            rows.append(row)
            print(json.dumps({"relative_path": relative, "pages": len(row.get("pages", [])),
                              "words": sum(p["native_words"] for p in row.get("pages", [])) if "pages" in row else row["native_words"]}))
        except Exception as error:
            failures.append({"relative_path": relative, "error": str(error)})
    report = {"scope": "Nine specifically named latest electricity/forces test documents, not the answer/revision archive.",
              "assessment_root": str(SOURCE), "complete_test_exclusion_certified": False,
              "documents": rows, "failures": failures}
    AUDIT.mkdir(parents=True, exist_ok=True)
    (AUDIT / "targeted-native-audit.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"documents_read": len(rows), "failures": len(failures), "output": str(AUDIT / "targeted-native-audit.json")}))
    if args.candidates:
        candidate_review(report)


if __name__ == "__main__":
    main()
