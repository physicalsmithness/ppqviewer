"""Source-backed regressions for the narrow reviewed Trilogy topic overlay."""
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
from trilogy_reviewed_topics import (DATABASE_RELATIVE_PATH, REVIEW_RELATIVE_PATH,
    REVIEW_SHA256, _validate_reviewed_part, load_reviewed_topics)


SOURCE = Path(r"C:\CodexProjects\PaperDatabases")


class ReviewedTrilogyTopics(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = load_reviewed_topics(SOURCE)
        cls.analysis = json.loads((SOURCE / REVIEW_RELATIVE_PATH).read_text(encoding="utf-8-sig"))
        cls.connection = sqlite3.connect((SOURCE / DATABASE_RELATIVE_PATH).resolve().as_uri() + "?mode=ro", uri=True)
        cls.connection.row_factory = sqlite3.Row

    @classmethod
    def tearDownClass(cls):
        cls.connection.close()

    def test_reviewed_scope_adds_only_three_whole_parents(self):
        self.assertEqual(55, len(self.result["part_topics"]))
        current = {row[0] for row in self.connection.execute(
            "SELECT DISTINCT p.question_group_id FROM question_part_syllabus_tags t "
            "JOIN question_parts p USING(question_part_id) WHERE t.role='examined' AND t.section_no LIKE '6.5%'")}
        additional = {row["parent_id"] for row in self.result["provenance"][0]["parts"]} - current
        self.assertEqual({"trilogy_2023_p1h::Q05", "trilogy_2023_p2f::Q03", "trilogy_2025_p1f::Q03"}, additional)

    def test_no_new_2026_or_recovered_energy_part(self):
        for part_id, topics in self.result["part_topics"].items():
            self.assertEqual(["forces"], topics)
            self.assertTrue(part_id.startswith("trilogy_"))
            self.assertNotIn("2026", part_id)
        self.assertNotIn("trilogy_specimen_set1_p1f::07.4", self.result["part_topics"])
        for part in self.result["provenance"][0]["parts"]:
            self.assertTrue(part["source_year"] == "specimen" or int(part["source_year"]) < 2026)
            self.assertGreater(part["reviewed_forces_marks"], 0)
            self.assertLessEqual(part["reviewed_forces_marks"], part["original_part_marks"])

    def test_reviewed_return_has_a_pinned_source_and_native_markschemes(self):
        source = self.result["provenance"][0]
        self.assertEqual(REVIEW_SHA256, source["sha256"])
        self.assertEqual(55, source["part_count"])
        for part in source["parts"]:
            self.assertTrue(part["markscheme_sources"])
            self.assertTrue(all(len(row["content_sha256"]) == 64 for row in part["markscheme_sources"]))
            self.assertEqual(64, len(part["question_text_sha256"]))
            self.assertEqual(64, len(part["markscheme_text_sha256"]))

    def test_changed_native_question_marks_or_scheme_are_rejected(self):
        part_id = "trilogy_2023_p1h::05.1"
        reviewed = next(q for q in self.analysis["questions"] if q["id"] == part_id)
        native = dict(self.connection.execute(
            "SELECT p.*,e.course,e.year,e.tier FROM question_parts p "
            "JOIN question_groups g USING(question_group_id) JOIN exam_papers e USING(exam_paper_id) "
            "WHERE p.question_part_id=?", (part_id,)).fetchone())
        schemes = [dict(row) for row in self.connection.execute(
            "SELECT raw_text FROM mark_scheme_entries WHERE question_part_id=?", (part_id,))]
        self.assertTrue(_validate_reviewed_part(reviewed, native, schemes))
        for change in ({"marks": native["marks"] + 1}, {"question_text": "Different reserved source question"},
                       {"year": "2026"}, {"course": "Synergy"}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                _validate_reviewed_part(reviewed, {**native, **change}, schemes)
        with self.assertRaises(ValueError):
            _validate_reviewed_part(reviewed, native, [{"raw_text": "Different source mark scheme"}])

    def test_unreviewed_artifact_replacement_fails_before_sql_read(self):
        with tempfile.TemporaryDirectory() as temporary:
            changed = Path(temporary) / REVIEW_RELATIVE_PATH
            changed.parent.mkdir(parents=True)
            changed.write_text('{"questions": []}', encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "artifact changed"):
                load_reviewed_topics(temporary)


if __name__ == "__main__":
    unittest.main()
