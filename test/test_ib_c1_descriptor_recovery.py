"""Read-only source validation and scope-preservation checks; no workbook writes."""
from copy import deepcopy
import json
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import ib_c1_descriptor_recovery as recovery


def base_analysis(parts):
    return {"topic": "C.1", "groups": [{"code": "C1-1", "label": "Existing family"}],
            "atoms": [{"code": "C1-1.1", "label": "Existing checklist definition"}], "types": [],
            "parts": {source_id: {"status": status, "reason": "Existing reviewed scope", "scope_reviewed": status == "included",
                                   "scope_review": {"source": "original checkpoint", "row": 42},
                                   "group_codes": [], "atom_codes": [], "type_codes": [], "used_atom_codes": [],
                                   "optional_atom_codes": [], "primary_atom_code": None, "canonical_row_ids": ["original alias"],
                                   "reviewed_syllabus_roles": {"central": ["C.1.1"], "step": ["A.1.1"], "assumed": []},
                                   "reviewed_level_hints": ["HL"]} for source_id, status in parts.items()},
            "report": {"source_files": [], "counts": {}, "limitations": []}}


class RecoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = recovery.load_recovery()
        cls.one = next(row for row in cls.data["assignments"] if row["current_scope"] == "current_type" and row["later_checkpoint_c1_conflict"] == "false")

    def test_exact_versioned_labels_and_authored_guidance_preserved(self):
        base = base_analysis({self.one["part_id"]: "included"})
        result = recovery.apply_recovery(base, self.data)
        descriptor = next(row for row in self.data["types"] if row["type_id"] == self.one["type_id"])
        atom = next(row for row in result["atoms"] if row["code"] == self.one["type_id"])
        self.assertEqual(atom["label"], descriptor["question_type"])
        self.assertEqual(atom["summary"], descriptor["recognition_trigger"])
        self.assertEqual(atom["checks"], [descriptor["core_solving_route"]])
        self.assertEqual(result["atoms"][0], base["atoms"][0])
        self.assertTrue(atom["code"].startswith(self.data["version"] + ":"))

    def test_scope_dependencies_identity_and_input_are_unchanged(self):
        base = base_analysis({self.one["part_id"]: "included"})
        before = deepcopy(base)
        result = recovery.apply_recovery(base, self.data)
        self.assertEqual(base, before)
        self.assertEqual(set(result["parts"]), set(base["parts"]))
        allowed = {"group_codes", "atom_codes", "primary_atom_code"}
        for key, value in before["parts"][self.one["part_id"]].items():
            if key not in allowed:
                self.assertEqual(result["parts"][self.one["part_id"]][key], value)
        self.assertFalse(result["report"]["fine_classification_complete"])
        self.assertFalse(result["report"]["descriptor_example_recovery"]["assessment_exclusions_applied"])

    def test_excluded_unmapped_and_absent_examples_cannot_add_questions(self):
        for status in ["excluded", "unmapped"]:
            base = base_analysis({self.one["part_id"]: status})
            result = recovery.apply_recovery(base, self.data)
            self.assertEqual(result["parts"], base["parts"])
        self.assertEqual(recovery.apply_recovery(base_analysis({}), self.data)["parts"], {})

    def test_later_scope_conflicts_and_retired_types_never_gain_memberships(self):
        excluded_rows = [row for row in self.data["assignments"] if row["later_checkpoint_c1_conflict"] == "true" or row["current_scope"] == "retired"]
        base = base_analysis({row["part_id"]: "included" for row in excluded_rows})
        result = recovery.apply_recovery(base, self.data)
        for row in excluded_rows:
            self.assertNotIn(row["type_id"], result["parts"][row["part_id"]]["atom_codes"])
        private = result["report"]["descriptor_example_recovery"]["skipped"]
        self.assertTrue(all(any(item["source_part_id"] == row["part_id"] and item["type_id"] == row["type_id"] for item in private) for row in excluded_rows))

    def test_two_authored_examples_do_not_invent_a_primary_or_dependency_role(self):
        source_id = "ibchem_part_00c030e18982b908"
        result = recovery.apply_recovery(base_analysis({source_id: "included"}), self.data)
        part = result["parts"][source_id]
        self.assertEqual(len(part["atom_codes"]), 2)
        self.assertIsNone(part["primary_atom_code"])
        self.assertEqual(part["used_atom_codes"], [])
        self.assertEqual(part["optional_atom_codes"], [])

    def test_source_year_boundary_does_not_change_scope(self):
        data = deepcopy(self.data)
        data["corpus"][self.one["part_id"]]["year"] = "2026"
        base = base_analysis({self.one["part_id"]: "included"})
        result = recovery.apply_recovery(base, data)
        self.assertEqual(result["parts"], base["parts"])
        self.assertTrue(any("reserved" in row["reason"] for row in result["report"]["descriptor_example_recovery"]["skipped"]))

    def test_changed_workbook_or_corpus_bytes_invalidate_recovery(self):
        original = Path.read_bytes
        for target, error in [(recovery.WORKBOOK, "workbook bytes changed"), (recovery.CORPUS, "corpus bytes changed")]:
            def read(file, target=target):
                return b"changed source bytes" if file.resolve() == target.resolve() else original(file)
            with patch.object(Path, "read_bytes", read):
                with self.assertRaisesRegex(ValueError, error):
                    recovery.load_recovery()

    def test_delivered_label_and_current_quote_are_independently_rechecked(self):
        original = recovery.read_csv
        def label_changed(file):
            rows = original(file)
            if file.name == "versioned_types.csv":
                rows[0]["question_type"] = "A different interpretation of the old code"
            return rows
        with patch.object(recovery, "read_csv", label_changed):
            with self.assertRaisesRegex(ValueError, "delivered workbook row"):
                recovery.load_recovery()
        def quote_changed(file):
            rows = original(file)
            if file == recovery.CORPUS:
                for row in rows:
                    if row["part_id"] == self.one["part_id"]:
                        for field in self.one["literal_evidence_fields"].split("|"):
                            row[field] = "Unrelated replacement question"
            return rows
        with patch.object(recovery, "read_csv", quote_changed):
            with self.assertRaisesRegex(ValueError, "evidence quotation changed"):
                recovery.load_recovery()

    def test_duplicate_application_is_rejected(self):
        enriched = recovery.apply_recovery(base_analysis({self.one["part_id"]: "included"}), self.data)
        with self.assertRaisesRegex(ValueError, "already been applied"):
            recovery.apply_recovery(enriched, self.data)

    def test_actual_current_scope_recovers_only_seven_published_parts(self):
        from build_ib_c1_analysis import build
        result = build()
        scope = result["parts"]
        self.assertEqual(sum(part["status"] == "included" for part in scope.values()), 133)
        self.assertEqual(sum(part["status"] == "excluded" for part in scope.values()), 219)
        self.assertEqual(sum(part["status"] == "unmapped" for part in scope.values()), 420)
        report = result["report"]["descriptor_example_recovery"]
        self.assertEqual(report["counts"]["included_parts"], 18)
        self.assertEqual(report["counts"]["included_memberships"], 19)
        clearance = json.loads((ROOT / "reports/ib-a1-c1-release-clearance.json").read_text(encoding="utf-8-sig"))
        published = set(clearance["reviewed_source_part_ids"])
        matches = [row for row in report["included"] if row["source_part_id"] in published]
        self.assertEqual((len({row["source_part_id"] for row in matches}), len(matches), len({row["type_id"] for row in matches})), (7, 8, 7))


if __name__ == "__main__":
    unittest.main()
