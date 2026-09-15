"""Read current school tests and identify source questions to withhold.

Run with the PaperDatabases Python runtime (PyMuPDF). Assessment files are only
read; the output contains source IDs and short matching diagnostics, no student
results or copies of school tests. Text matching is deliberately incomplete:
image-only and rewritten questions require visual review before publication.
"""

import argparse
from collections import defaultdict
import json
from pathlib import Path
import re
import sqlite3
import unicodedata
import zipfile
import xml.etree.ElementTree as ET

import fitz


DEFAULT_GCSE = Path(r"H:\Shared drives\0. Physics (Teachers)\2 - AQA GCSE\Assessments")
DEFAULT_DB = Path(r"C:\CodexProjects\PaperDatabases\Trilogy Categorisation\aqa_extraction_plus_calc.db")
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "dist/physics-inputs/trilogy-test-exclusions.json"


def normalise(text):
    text = unicodedata.normalize("NFKC", text).casefold()
    text = re.sub(r"\[?\s*\d+\s*marks?\s*\]?", " ", text)
    text = re.sub(r"(?:do not write outside the box|turn over|use the physics equations sheet)", " ", text)
    return " ".join(re.findall(r"[a-z0-9]+", text))


def read_text(path):
    if path.suffix.lower() == ".pdf":
        with fitz.open(path) as document:
            pages = [page.get_text("text") for page in document]
        return "\n".join(pages), len(pages)
    if path.suffix.lower() == ".docx":
        with zipfile.ZipFile(path) as archive:
            xml = ET.fromstring(archive.read("word/document.xml"))
        namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
        paragraphs = ["".join(p.itertext()) for p in xml.iter(namespace + "p")]
        return "\n".join(paragraphs), None
    raise ValueError("Only PDF and DOCX tests are supported")


def find_tests(root):
    candidates = []
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in (".pdf", ".docx"):
            continue
        relative = path.relative_to(root)
        if any(part.casefold().startswith("x. examinations") for part in relative.parts):
            continue
        if path.name.startswith("~$") or path.stem.casefold().startswith("backup of"):
            continue
        # The PDF preserves the same authored test as a same-name Word file.
        if path.suffix.lower() == ".docx" and path.with_suffix(".pdf").is_file():
            continue
        candidates.append(path)
    return sorted(candidates)


def load_segments(database):
    connection = sqlite3.connect(database.resolve().as_uri() + "?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    segments = []
    for row in connection.execute(
        "SELECT p.question_part_id, p.question_group_id, p.question_text, "
        "g.shared_stem_text, g.exam_paper_id, e.course, e.year FROM question_parts p "
        "JOIN question_groups g USING(question_group_id) JOIN exam_papers e USING(exam_paper_id) "
        "WHERE e.course IN ('Trilogy', 'Synergy')"):
        for kind, text in (("question", row["question_text"]), ("stem", row["shared_stem_text"])):
            value = normalise(text or "")
            words = value.split()
            if len(words) >= 14 and len(value) >= 85:
                segments.append({"part_id": row["question_part_id"],
                                 "parent_id": row["question_group_id"],
                                 "kind": kind, "text": value, "words": words})
    connection.close()
    return segments


def shingles(words, length=8):
    return {" ".join(words[i:i + length]) for i in range(len(words) - length + 1)}


def match(gcse_root, database, output, explicit_tests=(), preib_test=None, limit=250):
    files = find_tests(gcse_root) if gcse_root.is_dir() else []
    files.extend(Path(path) for path in explicit_tests)
    files = sorted(set(path.resolve() for path in files))
    if len(files) > limit:
        raise ValueError(f"Refusing to read {len(files)} tests; set a narrower root or increase --max-files")
    segments = load_segments(database)
    segment_shingles = [shingles(segment["words"]) for segment in segments]
    index = defaultdict(set)
    for number, grams in enumerate(segment_shingles):
        for gram in grams:
            index[gram].add(number)
    matched_parts, matched_parents = set(), set()
    evidence, inventory, unresolved = [], [], []
    if not files:
        unresolved.append("No GCSE test files could be read from the supplied current assessment root.")
    for test in files:
        try:
            extracted, pages = read_text(test)
            text = normalise(extracted)
            words = text.split()
            row = {"path": str(test), "pages": pages, "extracted_words": len(words), "matched_parents": 0}
            if len(words) < 25:
                unresolved.append({"test": str(test), "reason": "Insufficient text; likely scanned or image-only test."})
            grams = shingles(words)
            candidates = set()
            for gram in grams:
                candidates.update(index.get(gram, ()))
            test_parents = set()
            seen = set()
            for number in candidates:
                segment = segments[number]
                exact = segment["text"] in text
                matched = segment_shingles[number].intersection(grams)
                coverage = len(matched) / max(1, len(segment_shingles[number]))
                # A long complete source phrase or extensive overlapping source
                # text is enough to withhold, not proof of a completed audit.
                strong = exact or (len(segment["words"]) >= 32 and len(matched) >= 18 and coverage >= 0.8)
                if not strong:
                    continue
                matched_parts.add(segment["part_id"])
                matched_parents.add(segment["parent_id"])
                test_parents.add(segment["parent_id"])
                key = (segment["parent_id"], segment["text"])
                if key in seen:
                    continue
                seen.add(key)
                evidence.append({"test": str(test), "part_id": segment["part_id"],
                                 "parent_id": segment["parent_id"], "source_segment": segment["kind"],
                                 "method": "exact_normalised_source_phrase" if exact else "extensive_source_phrase_overlap",
                                 "source_word_count": len(segment["words"]),
                                 "eight_word_phrase_coverage": round(coverage, 3),
                                 "source_excerpt": segment["text"][:240]})
            row["matched_parents"] = len(test_parents)
            inventory.append(row)
            if not test_parents:
                unresolved.append({"test": str(test), "reason": "No sufficiently strong source match; requires visual review."})
        except (OSError, ValueError, KeyError, zipfile.BadZipFile) as error:
            inventory.append({"path": str(test), "error": str(error)})
            unresolved.append({"test": str(test), "reason": str(error)})
    preib = None
    if preib_test:
        try:
            text, pages = read_text(preib_test)
            preib = {"path": str(preib_test.resolve()), "pages": pages,
                     "extracted_words": len(normalise(text).split()),
                     "status": "Read for source readiness only; no reviewed Edexcel-to-test mapping exists yet."}
        except (OSError, ValueError) as error:
            preib = {"path": str(preib_test), "error": str(error)}
    result = {"part_ids": sorted(matched_parts), "parent_ids": sorted(matched_parents), "paper_ids": [],
              "exclusion_review_complete": False, "assessment_root": str(gcse_root),
              "matching_policy": "Conservative withholding from long source-text matches. Builder also excludes whole parents and cross-tier equivalents to a fixed point.",
              "tests": inventory, "evidence": evidence, "preib": preib,
              "unresolved": ["Image-only, rewritten, abbreviated and very short source questions are not cleared by this text audit.", *unresolved]}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(output.resolve()), "tests_read": len(inventory),
                      "matched_source_parts": len(matched_parts), "matched_source_parents": len(matched_parents),
                      "unresolved_tests": len(unresolved), "exclusion_review_complete": False}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--gcse-root", type=Path, default=DEFAULT_GCSE)
    parser.add_argument("--database", type=Path, default=DEFAULT_DB)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--test", action="append", default=[], help="Explicit additional test PDF or DOCX")
    parser.add_argument("--preib-test", type=Path)
    parser.add_argument("--max-files", type=int, default=250)
    args = parser.parse_args()
    match(args.gcse_root, args.database, args.output, args.test, args.preib_test, args.max_files)
