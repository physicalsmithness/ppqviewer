"""Regression boundaries for authored A5 scope, duplicate and guidance projection."""
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("a5_analysis", ROOT / "tools/build_ib_a5_analysis.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class AuthoredA5AnalysisTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = MODULE.build()

    def test_exact_authored_positive_and_retired_rejections(self):
        parts = self.data["parts"]
        self.assertEqual(parts["ibchem_part_9801e2389b881dbe"]["status"], "included")
        self.assertEqual(parts["ibchem_part_9801e2389b881dbe"]["group_codes"], ["A5.POST"])
        self.assertEqual(parts["ibchem_part_c78237e042ebf1d0"]["status"], "excluded")
        self.assertIn("outside A5", parts["ibchem_part_c78237e042ebf1d0"]["reason"])
        self.assertEqual(parts["ibchem_part_122a19eaab307de1"]["status"], "excluded")

    def test_mixed_tasks_cannot_inherit_live_sibling_status(self):
        for source_id in ("ibchem_part_c77d3df1afff751b", "ibchem_part_0191dec27115f375",
                          "ibchem_part_a0f4d6f45bec7760"):
            with self.subTest(source_id=source_id):
                item = self.data["parts"][source_id]
                self.assertEqual(item["status"], "mixed")
                self.assertTrue(item["group_codes"])
                self.assertTrue(item["exclude_reasons"])

    def test_confirmed_duplicate_inherits_canonical_scope_not_broad_tag(self):
        parts = self.data["parts"]
        examples = {row: item for item in parts.values() for row in item["source_row_ids"]}
        self.assertEqual(examples["Q191"]["canonical_row_ids"], ["Q185"])
        self.assertEqual(examples["Q191"]["status"], "included")
        self.assertEqual(examples["Q188"]["canonical_row_ids"], ["Q182"])
        self.assertEqual(examples["Q188"]["status"], "excluded")
        self.assertEqual(examples["Q244"]["canonical_row_ids"], ["Q239"])
        self.assertEqual(examples["Q244"]["status"], "included")
        self.assertEqual(examples["Q043"]["status"], "mixed")

    def test_bare_routing_and_retired_code_do_not_create_analysis_membership(self):
        for source_id in ("ibchem_part_ff47c6f7cc59a6b2", "ibchem_part_9fecfc67c348f76b"):
            item = self.data["parts"][source_id]
            self.assertEqual(item["status"], "unmapped")
            self.assertEqual(item["group_codes"], [])

    def test_authored_checks_preserved_without_inventing_part_atom_assignment(self):
        guidance = MODULE.read_json(MODULE.GUIDANCE / "A5_atom_guidance.json")
        source_checks = {check["text"] for atom in guidance["atoms"] for check in atom["watch_out"]}
        self.assertEqual(len(self.data["groups"]), 14)
        registry = MODULE.load_registry(MODULE.REGISTRY)
        self.assertEqual(len(self.data["reviewed_question_types"]["atoms"]), 45)
        for source_id, item in self.data["parts"].items():
            if item["status"] == "included":
                expected = MODULE.part_projection(registry, source_id)
                self.assertEqual(item["atom_codes"], expected["analysis_atoms"], source_id)
                self.assertEqual(item["type_codes"], expected["analysis_types"], source_id)
                self.assertEqual(item["used_atom_codes"], expected["analysis_used_atoms"], source_id)
                self.assertEqual(item["optional_atom_codes"], expected["analysis_optional_atoms"], source_id)
                self.assertTrue(item["atom_codes"], source_id)
            else:
                self.assertEqual(item["atom_codes"], [], source_id)
        for group in self.data["groups"]:
            self.assertTrue(set(group["checks"]) <= source_checks)
            self.assertTrue(group["atom_codes"])
            self.assertNotIn("direct_pct", group)
            self.assertNotIn("marks", group)


if __name__ == "__main__":
    unittest.main()
