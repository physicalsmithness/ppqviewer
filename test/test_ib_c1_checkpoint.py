"""The approved C1 checkpoint cannot grow or change through live append files."""
from copy import deepcopy
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import build_ib_c1_analysis as builder


class CheckpointTests(unittest.TestCase):
    def test_current_append_keeps_exact_approved_scope(self):
        rows, report = builder.reviewed_checkpoint()
        self.assertEqual(len({row["part_id"] for row in rows["syllabus_tags.csv"]}), 352)
        self.assertEqual(len(rows["syllabus_tags.csv"]), 997)
        self.assertEqual(len(rows["mark_categories.csv"]), 588)
        self.assertTrue(all(row["ordered_prefix_equal"] and row["all_approved_id_rows_equal"] for row in report["continuity"]))

    def test_change_within_original_prefix_fails(self):
        read = builder.read_csv
        def changed(path):
            rows = read(path)
            if path == builder.RETURN / "syllabus_tags.csv":
                rows[0]["reason"] += " Modified classification"
            return rows
        with patch.object(builder, "read_csv", changed):
            with self.assertRaisesRegex(ValueError, "within the approved checkpoint"):
                builder.reviewed_checkpoint()

    def test_appended_correction_to_old_part_cannot_evade_prefix_check(self):
        read = builder.read_csv
        def changed(path):
            rows = read(path)
            if path == builder.RETURN / "mark_categories.csv":
                rows.append(deepcopy(rows[0]))
            return rows
        with patch.object(builder, "read_csv", changed):
            with self.assertRaisesRegex(ValueError, "within the approved checkpoint"):
                builder.reviewed_checkpoint()

    def test_new_appended_source_id_is_observed_but_not_adopted(self):
        read = builder.read_csv
        new_id = "ibchem_part_ffffffffffffffff"
        def changed(path):
            rows = read(path)
            if path == builder.RETURN / "syllabus_tags.csv":
                rows.append({**rows[0], "part_id": new_id})
            return rows
        with patch.object(builder, "read_csv", changed):
            rows, _ = builder.reviewed_checkpoint()
        self.assertFalse(any(row["part_id"] == new_id for row in rows["syllabus_tags.csv"]))

    def test_snapshot_bytes_are_immutable_not_just_a_named_folder(self):
        read = Path.read_bytes
        def changed(path):
            if path == builder.CHECKPOINT / "syllabus_tags.csv":
                return b"changed approved snapshot"
            return read(path)
        with patch.object(Path, "read_bytes", changed):
            with self.assertRaisesRegex(ValueError, "checkpoint snapshot changed"):
                builder.reviewed_checkpoint()


if __name__ == "__main__":
    unittest.main()
