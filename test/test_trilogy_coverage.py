"""Focused coverage/reservation checks; upstream corpora are always read-only.

Run with the PaperDatabases Python (PyMuPDF):
    python -m unittest discover -s test -p test_trilogy_coverage.py -v
"""
import copy
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import fitz
import build_trilogy_physics as trilogy
import build_preib_physics as preib


class PlanSelectionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.plan = Path(self.temp.name) / "plan.md"
        self.groups = {
            "trilogy_2025_p1h::Q03": {"exam_paper_id": "trilogy_2025_p1h", "course": "Trilogy", "year": "2025", "paper": "P1", "tier": "H"},
            "synergy_2025_4h::Q07": {"exam_paper_id": "synergy_2025_4h", "course": "Synergy", "year": "2025", "paper": "4", "tier": "H"},
        }
        self.parents = {"trilogy_2025_p1h::03.1": "trilogy_2025_p1h::Q03", "synergy_2025_4h::07.2": "synergy_2025_4h::Q07"}

    def select(self, text):
        self.plan.write_text("Assembled from June 2025 AQA past papers\n" + text, encoding="utf-8")
        return trilogy.selected_plan_parts(self.plan, self.groups, self.parents)

    def test_modified_synergy_and_ordinary_trilogy_are_both_reserved(self):
        selected = self.select("**1H 03.1 [3m]** `IN_PAPER`\n**Syn4H 07.2 [3m]** `IN_PAPER (MODIFIED)`\n**1H 99.9 [2m]** `ALTERNATIVE`")
        self.assertEqual(selected, set(self.parents))

    def test_unknown_part_fails_instead_of_disappearing(self):
        with self.assertRaises(ValueError):
            self.select("**1H 03.1 [3m]** `IN_PAPER`\n**1H 99.9 [2m]** `IN_PAPER (MODIFIED)`")

    def test_unrecognised_selector_does_not_silently_reduce_reservations(self):
        with self.assertRaises(ValueError):
            self.select("**1H 03.1 [3m]** `IN_PAPER`\n**1H 99 [2m]** `IN_PAPER`")

    def test_ambiguous_paper_fails(self):
        self.groups["other::Q03"] = {**self.groups["trilogy_2025_p1h::Q03"], "exam_paper_id": "other"}
        with self.assertRaises(ValueError):
            self.select("**1H 03.1 [3m]** `IN_PAPER`")

    def test_changed_plan_source_year_requires_review(self):
        self.plan.write_text("Assembled from June 2026 AQA past papers\n**1H 03.1 [3m]** `IN_PAPER`", encoding="utf-8")
        with self.assertRaises(ValueError):
            trilogy.selected_plan_parts(self.plan, self.groups, self.parents)

    def test_linked_parent_closure_reaches_through_other_parts(self):
        parents = {"a1": "A", "b1": "B", "b2": "B", "c1": "C"}
        self.assertEqual(trilogy.exclusion_closure({"A"}, parents, [("b2", "c1"), ("a1", "b1")]), {"A", "B", "C"})


class CoverDateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.document = {"source": {"relative_path": "paper.pdf"}}

    def write_cover(self, text):
        with fitz.open() as pdf:
            pdf.new_page().insert_text((72, 72), text)
            pdf.save(self.directory / "paper.pdf")

    def test_undated_specimen_is_rejected(self):
        self.write_cover("Combined Science - Specimen Paper\nFirst teaching September 2016")
        with self.assertRaises(ValueError):
            trilogy.source_year({"year": "specimen"}, self.document, self.directory)

    def test_unlabelled_year_is_rejected(self):
        with self.assertRaises(ValueError):
            trilogy.source_year({"year": "unknown"}, self.document, self.directory)

    def test_printed_specimen_date_and_actual_pdf_hash_are_retained(self):
        self.write_cover("Specimen 2018")
        year, witness = trilogy.source_year({"year": "specimen_set2"}, self.document, self.directory)
        self.assertEqual(year, "2018")
        self.assertEqual(witness["sha256"], hashlib.sha256((self.directory / "paper.pdf").read_bytes()).hexdigest())

    def test_2026_specimen_is_reserved_even_when_database_year_is_symbolic(self):
        self.write_cover("Specimen 2026")
        with self.assertRaises(ValueError):
            trilogy.source_year({"year": "specimen"}, self.document, self.directory)

    def test_changing_pdf_bytes_changes_crop_identity_at_same_path(self):
        self.write_cover("Original question")
        first = trilogy.render_crops(self.document, {1: [60, 50, 400, 130]}, self.directory, self.directory / "crops", "q")
        (self.directory / "paper.pdf").unlink()
        self.write_cover("Corrected question")
        second = trilogy.render_crops(self.document, {1: [60, 50, 400, 130]}, self.directory, self.directory / "crops", "q")
        self.assertNotEqual(first, second)
        self.assertNotEqual(Path(first[0]).read_bytes(), Path(second[0]).read_bytes())


SOURCE = trilogy.DEFAULT_SOURCE
DATABASE = SOURCE / "Trilogy Categorisation/aqa_extraction_plus_calc.db"
PLAN = SOURCE / "Trilogy Categorisation/2026 Y10 exam design.md"
TRILOGY_INPUT = ROOT / "dist/physics-inputs/trilogy.json"


IDENTITY_PREVIEW = SOURCE / "outputs/previews/trilogy_specimen_set2_p1f"
IDENTITY_REVIEW = ROOT / "reports/trilogy-reviewed-part-identities.json"


@unittest.skipUnless((IDENTITY_PREVIEW / "question_preview.json").is_file() and IDENTITY_REVIEW.is_file(),
                     "Reviewed duplicate-number source is required")
class ReviewedPartIdentityTests(unittest.TestCase):
    def setUp(self):
        self.paper = "trilogy_specimen_set2_p1f"
        self.parent = self.paper + "::Q02"
        self.preview_path = IDENTITY_PREVIEW / "question_preview.json"
        question = trilogy.read_json(self.preview_path)
        self.parts = next(g["parts"] for g in question["question_groups"] if str(g["question_number"]) == "02")
        preview = trilogy.read_json(IDENTITY_PREVIEW / "preview.json")
        self.document = next(d for d in preview["documents"] if d["source"]["document_type"] == "question_paper")
        self.rules = trilogy.read_json(IDENTITY_REVIEW)["rules"]

    def test_original_numbering_typo_keeps_two_prompts_and_correct_scheme_alignment(self):
        original = copy.deepcopy(self.parts)
        resolved = trilogy.resolve_part_appearances(self.parent, self.paper, self.parts, self.document,
                                                    self.preview_path, SOURCE, self.rules)
        self.assertEqual(self.parts, original, "Source preview records must remain unchanged")
        self.assertEqual([p["label"] for p in resolved], [p["label"] for p in original])
        self.assertEqual(len(resolved), 8)
        self.assertEqual(len({p["consumer_part_id"] for p in resolved}), 8)
        temperature, light = [p for p in resolved if p["label"] == "02.3"]
        self.assertIn("temperature increases", temperature["text"])
        self.assertIn("light intensity increases", light["text"])
        self.assertEqual((temperature["page_start"], temperature["consumer_part_id"], temperature["markscheme_label"]),
                         (4, self.paper + "::02.3", "02.3"))
        self.assertEqual((light["page_start"], light["consumer_part_id"], light["markscheme_label"]),
                         (5, self.paper + "::02.3@p005", "02.4"))
        self.assertEqual(light["reviewed_topic_codes"], ["electricity"])
        self.assertEqual(sum(p["marks"] for p in resolved), 11)

    def test_changed_original_pdf_bytes_revoke_duplicate_number_override(self):
        # Change a local copy of the source bytes, retaining the reviewed hash.
        # No file in the upstream corpus is modified.
        original = SOURCE / self.document["source"]["relative_path"]
        with tempfile.TemporaryDirectory() as directory:
            source_root = Path(directory)
            changed = source_root / "paper.pdf"
            changed.write_bytes(original.read_bytes() + b"\n% changed source witness\n")
            document = copy.deepcopy(self.document)
            document["source"]["relative_path"] = "paper.pdf"
            rules = copy.deepcopy(self.rules)
            for rule in rules:
                rule["source_relative_path"] = "paper.pdf"
            with self.assertRaisesRegex(ValueError, "source changed"):
                trilogy.resolve_part_appearances(self.parent, self.paper, self.parts, document,
                                                self.preview_path, source_root, rules)


@unittest.skipUnless(DATABASE.is_file() and PLAN.is_file() and TRILOGY_INPUT.is_file(), "Local source corpus and generated input are required")
class RealTrilogyCoverageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with sqlite3.connect(DATABASE.resolve().as_uri() + "?mode=ro", uri=True) as connection:
            connection.row_factory = sqlite3.Row
            cls.parents = {row["question_part_id"]: row["question_group_id"] for row in connection.execute("SELECT question_part_id, question_group_id FROM question_parts")}
            cls.links = [tuple(row) for row in connection.execute("SELECT foundation_part_id,higher_part_id FROM cross_tier_links")]
            cls.groups = {row["question_group_id"]: dict(row) for row in connection.execute("SELECT g.*,e.course,e.year,e.paper,e.tier FROM question_groups g JOIN exam_papers e USING(exam_paper_id)")}
        cls.data = trilogy.read_json(TRILOGY_INPUT)

    def test_every_explicit_plan_line_matches_report_including_modified(self):
        # Independently enumerate selected lines, then resolve their source
        # identifiers without using the implementation's selection regex.
        selectors = []
        for line in PLAN.read_text(encoding="utf-8-sig").splitlines():
            if not line.startswith("**") or "`IN_PAPER" not in line:
                continue
            selector, label, _marks = line.split("**")[1].split()
            synergy = selector.startswith("Syn")
            paper_tier = selector[3:] if synergy else selector
            course = "Synergy" if synergy else "Trilogy"
            found = {g["exam_paper_id"] for g in self.groups.values() if g["course"] == course and str(g["year"]) == "2025" and str(g["paper"]).lower().lstrip("p") == paper_tier[0] and g["tier"] == paper_tier[1]}
            self.assertEqual(len(found), 1, line)
            selectors.append(f"{next(iter(found))}::{label}")
        self.assertEqual(len(selectors), 23)
        self.assertIn("synergy_2025_4h::07.2", selectors)
        evidence = self.data["report"]["known_exclusions"][0]
        self.assertEqual(set(selectors), set(evidence["part_ids"]))
        self.assertEqual(evidence["sha256"], hashlib.sha256(PLAN.read_bytes()).hexdigest())
        self.assertEqual(set(selectors), trilogy.selected_plan_parts(PLAN, self.groups, self.parents))

    def test_independent_plan_parent_and_tier_closure_is_unserved(self):
        selected = self.data["report"]["known_exclusions"][0]["part_ids"]
        expected = {self.parents[part] for part in selected}
        adjacency = {}
        for left, right in self.links:
            if left not in self.parents or right not in self.parents:
                continue
            a, b = self.parents[left], self.parents[right]
            adjacency.setdefault(a, set()).add(b)
            adjacency.setdefault(b, set()).add(a)
        frontier = list(expected)
        while frontier:
            for neighbour in adjacency.get(frontier.pop(), set()):
                if neighbour not in expected:
                    expected.add(neighbour)
                    frontier.append(neighbour)
        self.assertEqual(len(expected), 17)
        self.assertTrue(expected.issubset(self.data["report"]["excluded_parent_ids"]))
        self.assertFalse(expected.intersection(q["parent_id"] for q in self.data["questions"]))

    def test_all_eight_actual_specimen_covers_and_served_years_agree(self):
        dates = self.data["report"]["specimen_dates"]
        self.assertEqual(len(dates), 8)
        for paper, evidence in dates.items():
            with self.subTest(paper=paper):
                content = Path(evidence["source"]).read_bytes()
                with fitz.open(stream=content, filetype="pdf") as pdf:
                    cover = pdf[0].get_text()
                self.assertRegex(cover, r"(?i)Specimen\s+2018")
                self.assertEqual(evidence["sha256"], hashlib.sha256(content).hexdigest())
                questions = [q for q in self.data["questions"] if q["parent_id"].startswith(paper + "::")]
                self.assertTrue(questions)
                self.assertTrue(all(q["year"] == "2018" for q in questions))

    def test_no_reserved_source_year_is_served(self):
        self.assertTrue(self.data["questions"])
        for question in self.data["questions"]:
            self.assertRegex(question["year"], r"^\d{4}$")
            self.assertLess(int(question["year"]), 2026, question["id"])


PREIB_INPUT = ROOT / "dist/physics-inputs/preib.json"
PREIB_AUDIT = ROOT / "dist/physics-audit/preib-current-assessments/candidate-review.json"


@unittest.skipUnless(PREIB_INPUT.is_file() and PREIB_AUDIT.is_file(), "Local Pre-IB input and audit required")
class PreibFreshnessTests(unittest.TestCase):
    def setUp(self):
        self.data = preib.read_json(PREIB_INPUT)

    def test_unchanged_real_evidence_clears_current_batch(self):
        preib.attach_available_visual_review(self.data)
        self.assertTrue(self.data["meta"]["exclusion_review_complete"])

    def test_fresh_fingerprint_of_changed_source_bytes_revokes_clearance(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "mapping.csv"
            source.write_bytes(b"original source bytes")
            first = preib.fingerprint(source)["sha256"]
            source.write_bytes(b"changed source bytes")
            second = preib.fingerprint(source)["sha256"]
        self.assertNotEqual(first, second)
        # build() regenerates these fingerprints from source files on every run.
        self.data["report"]["sources"][0]["sha256"] = second
        preib.attach_available_visual_review(self.data)
        self.assertFalse(self.data["meta"]["exclusion_review_complete"])

    def test_changed_test_snapshot_fingerprint_revokes_clearance(self):
        self.data["report"]["test_sources"][0]["sha256"] = "f" * 64
        preib.attach_available_visual_review(self.data)
        self.assertFalse(self.data["meta"]["exclusion_review_complete"])


if __name__ == "__main__":
    unittest.main()
