"""Independent invariants for the private A1 projection; no source writes."""
import hashlib
import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("a1_builder", ROOT / "tools/build_ib_a1_analysis.py")
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class A1Projection(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.result = builder.compile_input()
        cls.parts = cls.result["parts"]
        cls.corpus = {row["part_id"]: row for row in builder.rows(builder.CORPUS)}

    def test_supplied_workbooks_are_the_exact_current_sources(self):
        comparisons = self.result["report"]["supplied_backup_comparison"]
        self.assertEqual(len(comparisons), 2)
        for row in comparisons:
            self.assertTrue(row["identical"])
            self.assertEqual(row["current"]["sha256"], row["supplied_backup"]["sha256"])
        self.assertEqual(len(self.result["atoms"]), 52)
        self.assertEqual(len(self.result["teaching_taxonomy"]["types"]), 51)
        self.assertEqual(len(self.result["teaching_taxonomy"]["families"]), 8)

    def test_all_direct_memberships_have_current_literal_evidence(self):
        vocabulary = {a["code"] for a in self.result["atoms"]}
        for sid, part in self.parts.items():
            if part["status"] != "included":
                continue
            self.assertTrue(part["scope_reviewed"])
            self.assertEqual(part["current_levels"], ["SL", "HL"])
            self.assertTrue(2004 <= int(self.corpus[sid]["year"]) < 2026)
            self.assertTrue(set(part["atom_codes"]) <= vocabulary)
            for code in part["atom_codes"]:
                evidence = [e for e in part["membership_evidence"] if e["type_code"] == code]
                self.assertTrue(evidence, sid + ": " + code)
                for row in evidence:
                    fields = [row["source_field"]] if "source_field" in row else ["question_text", "shared_stem", "ms_text"]
                    self.assertTrue(any(builder.norm(row["literal_evidence"]) in builder.norm(self.corpus[sid].get(field)) for field in fields))

    def test_split_descriptors_are_not_invented_from_scope_only_review(self):
        for sid in ["ibchem_part_8bd2c23dcde39394", "ibchem_part_7a6e4a69c8e772f8", "ibchem_part_a79f3ba7d342aa0f"]:
            part = self.parts[sid]
            self.assertEqual(part["status"], "included")
            self.assertTrue(part["scope_reviewed"])
            self.assertEqual(part["atom_codes"], [])
            self.assertEqual(part["group_codes"], [])
            self.assertTrue(part["pending_shape_branches"])

    def test_unrelated_wave_relativistic_force_and_uncertainty_demands_stay_out(self):
        for sid in ["ibchem_part_be4b3ae52af07d9b", "ibchem_part_60afc3b6fce07a3f", "ibchem_part_746ab6d54a0f2891", "ibchem_part_045bea79c7760faa"]:
            part = self.parts[sid]
            self.assertEqual(part["status"], "excluded")
            self.assertFalse(part["scope_reviewed"])
            self.assertEqual(part["atom_codes"], [])
        self.assertFalse(any(a["code"].startswith("A1.X") for a in self.result["atoms"]))

    def test_no_implicit_prerequisites_or_teaching_crosswalk(self):
        for part in self.parts.values():
            self.assertEqual(part["used_atom_codes"], [])
            self.assertEqual(part["optional_atom_codes"], [])
            self.assertFalse(any(code.startswith("K") for code in part["atom_codes"]))
        self.assertIn("no exhaustive", self.result["teaching_taxonomy"]["membership_status"])
        self.assertIn("demand_role", self.result["report"]["analyst_handoff"]["required_fields"])

    def test_reviewed_scope_has_exact_evidence_and_provenance(self):
        report = self.result["report"]
        self.assertFalse(report["conflicts"])
        self.assertEqual(report["scope_only_review"]["corpus_sha256"], builder.sha(builder.CORPUS))
        reviews = report["scope_only_review"]["decisions"]
        self.assertEqual(len(reviews), 36)
        self.assertEqual(sum(row["included"] for row in reviews), 27)
        for row in reviews:
            source = self.corpus[row["source_part_id"]]
            data = {field: source.get(field, "") for field in ["question_text", "shared_stem", "parent_context", "ms_text"]}
            self.assertEqual(row["evidence_sha256"], hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False).encode()).hexdigest())
        for row in [*report["source_files"], report["builder"]]:
            self.assertEqual(builder.sha(row["path"]), row["sha256"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
