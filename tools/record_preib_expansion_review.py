"""Persist the actual 2026-09-10 review of the expanded Pre-IB batch."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "dist/physics-audit/preib-current-assessments"
INPUT = ROOT / "dist/physics-inputs/preib-expanded.json"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def fingerprint(path):
    return {"path": str(path.resolve()), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


original_audit = AUDIT / "candidate-review-initial-four.json"
if not original_audit.exists():
    original_audit.write_bytes((AUDIT / "candidate-review.json").read_bytes())
prior = read(original_audit)
data = read(INPUT)
evidence = {row["parent_id"]: row["evidence"] for row in prior["candidate_reviews"]}
evidence.update({
    "edexcel_4sd0_1p_2020_jan::Q05": "The bus photograph and segmented A-G distance-time graph (0-8 km, 0-14 minutes), its three questions and a separate 7.0 km / 14 minute velocity-graph completion are absent from the 20 selected test snapshots. School Forces graphs concern braking, a ramp toy car, train motion or qualitative motion graphs; none uses this bus journey. All four question and four scheme regions were inspected; printed marks total 9.",
    "edexcel_4sd0_1p_2020_jan::Q08": "The acceleration-formula recall and car acceleration from 26 to 35 m/s at 1.2 m/s2 are absent from the selected tests. The short prompt was checked independently of the long-text threshold. All question and scheme regions were inspected; the numerical answer is 7.5 s and marks total 4.",
    "edexcel_4sd0_1pr_2019_jun::Q08": "The parachute-jumper velocity-time graph (0-120 s; peak/plateau about 54 m/s; falling sharply after B) and distance-to-A options 50/1300/2300/2700 m are absent from all selected tests. Graph, MCQ and one-mark scheme C=2300 m were inspected. The source extraction included sibling 8(a)(i); consumer crops now retain only the graph and selected area-under-graph MCQ, excluding that terminal-velocity sibling.",
    "edexcel_4sd0_1pr_2020_jan::Q03": "Two truck stopping-distance MCQs ask which factor affects thinking distance (alcohol) and which affects both distances (speed). These exact question/option sets and the truck drawing are absent from the selected tests. Current Forces Q2 instead asks which does not affect thinking distance and which increases braking distance, with different options. Question and both scheme regions were inspected; total 2 marks.",
    "edexcel_4sd0_1pr_2020_jan::Q12": "The single wire supported between magnet poles, its mass 6.5 g and weight calculation in mN are absent from all selected tests. Magnetism test apparatus uses rotating coils or field-line drawings, without this wire-mass calculation. The actual assessed code is the existing 1.18 weight formula despite a magnetism primary topic. Both context/question regions and scheme were inspected; 65 mN (or accepted 63.7/63.8 mN), 2 marks.",
    "edexcel_4ss0_1p_2019_jun::Q04": "Both retained floating-magnet tasks are absent from all selected tests: draw the downward weight arrow for magnet B, then explain the new equilibrium when magnet C is added. The school magnetism documents contain coil motors, bar fields and two horizontal magnets X/Y, with no floating toy photographs or these force tasks. Newly added 4(d)(i) and its 3-mark scheme were inspected; existing 4(b)(i) remains 2 marks. The canonical master already maps 4(d)(i) to 1.11.",
})
expected = {
    "edexcel_4sd0_1p_2020_jan::Q05": ["05.a.i", "05.a.ii", "05.a.iii", "05.b"],
    "edexcel_4sd0_1p_2020_jan::Q08": ["08.a.i", "08.a.ii"],
    "edexcel_4sd0_1p_2024_jun::Q03": ["03.c"],
    "edexcel_4sd0_1p_2024_jun::Q10": ["10.a"],
    "edexcel_4sd0_1p_2024_jun::Q12": ["12.a", "12.b", "12.c"],
    "edexcel_4sd0_1pr_2019_jun::Q08": ["08.a.ii"],
    "edexcel_4sd0_1pr_2020_jan::Q03": ["03.a.i", "03.a.ii"],
    "edexcel_4sd0_1pr_2020_jan::Q12": ["12.b.i"],
    "edexcel_4ss0_1p_2019_jun::Q04": ["04.b.i", "04.d.i"],
}
assert {q["id"] for q in data["questions"]} == set(expected)
assert data["report"]["served_part_count"] == 17
assert prior["manifest"]["sha256"] == data["report"]["assessment_inventory"]["sha256"]
reviews = []
for question in data["questions"]:
    assert [value.split("::")[1] for value in question["part_ids"]] == expected[question["id"]]
    reviews.append({"parent_id": question["id"], "part_ids": question["part_ids"],
                    "specification_codes": question["specification_codes"],
                    "mapping_provenance": question["mapping_provenance"],
                    "decision": "keep_against_selected_assessments", "evidence": evidence[question["id"]],
                    "reviewed_assets": [{"kind": kind, **fingerprint(Path(path))}
                                        for kind in ("question_images", "markscheme_images") for path in question[kind]],
                    "compared_test_sha256s": sorted({entry["sha256"] for entry in prior["document_reviews"]})})
snapshot = AUDIT / "reviewed-input-expanded.json"
snapshot.write_bytes(INPUT.read_bytes())
result = {**prior, "review_date": "2026-09-10", "review_kind": "Expanded consumer review of merged exemplar and completed source-reviewed B01-B03 returns",
          "reviewed_input": fingerprint(snapshot), "initial_four_review": fingerprint(original_audit),
          "candidate_reviews": reviews, "source_fingerprints": data["report"]["sources"],
          "filter_counts": data["report"]["filter_counts"], "mapping_sources": data["report"]["mapping_sources"],
          "mapping_issues": data["report"]["mapping_issues"],
          "mapping_qa_notes": ["B01-B03 are completed source-reviewed returns, not architect-merged masters; this consumer inspected the retained questions, schemes, scope codes and test exclusion evidence independently.",
                               "B02 bus 5(b) evidence inaccurately describes a stated 30 km/h. Actual question gives 7 km in 14 minutes and scheme credits 0.5 km/minute. Existing codes 1.4 and 1.7 are supported by the real crop and scheme; no source tags were modified."],
          "excluded_candidate_parent_ids": [row["parent_id"] for row in data["report"]["candidate_exclusion_checks"] if row["withheld"]],
          "excluded_candidate_evidence": [row for row in data["report"]["known_exclusions"] if row["parent_id"] in {entry["parent_id"] for entry in data["report"]["candidate_exclusion_checks"] if entry["withheld"]}],
          "limitations": ["Clearance covers only these 9 sets / 17 parts and the exact user-selected assessment snapshots.",
                          "Word documents were compared by extracted text and every embedded diagram, not rendered page layout.",
                          "The remainder of the extracted archive is not represented as fully syllabus-tagged. B04-B16 have dispatch worklists but no completed returns in this source folder.",
                          "The Google Doc remains unread and is not assumed equivalent to PDF or Word; the user's PDF/Word version selection is recorded separately."]}
for document in result["document_reviews"]:
    document["comparison_status"] = "No overlap with the nine retained sets; manual whole-parent reservations applied to school-test matches"
(AUDIT / "candidate-review.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
lines = ["# Pre-IB expanded assessment review", "", "The expanded consumer selection contains 9 question sets, 17 assessed parts and 40 marks. Every retained question crop and scheme was inspected against the same 20 selected assessment snapshots (19 unique byte sequences).", "", "## What limited the initial selection", "", "The initial adapter read only 77 architect-merged rows covering two papers. The wider source has three completed, source-reviewed returns with another 298 mapped rows. They are consumed with their own provenance and have not been merged into the source masters.", "", "| Stage | Parts or sets |", "|---|---:|", "| Extracted archive | 2,234 parts |", "| Master plus completed returns | 375 parts |", "| Internally consistent mappings | 372 parts |", "| Forces topic or explicit forces content codes | 68 parts |", "| Clear 4SS0 scope | 39 parts |", "| After dependency and source-year checks | 37 parts in 17 sets |", "| After whole-parent test reservations | 17 parts in 9 sets |", "", "## Retained questions", "", "| Source | Review evidence |", "|---|---|"]
for row in reviews:
    lines.append(f"| {row['parent_id']} | {row['evidence']} |")
lines += ["", "Eight candidate parents are held because they contain test questions. Four additional visual reservations catch the original car reaction graph, loaded-van braking, train graph and thinking/braking-distance graph despite disrupted extracted text. The earlier short average-speed formula exclusion remains in force.", "", "The B04-B16 dispatch worklists have no completed returns. Their questions exist in the extracted archive but are not being advertised as reviewed syllabus mappings. Additional expansion requires reviewing those source questions or another mapped source.", "", "The source reviewed returns are not uniformly reliable: B02 bus 5(b) cites 30 km/h as though stated, while the original asks pupils to derive 0.5 km/minute from 7 km in 14 minutes. The actual crop and scheme support its existing speed/velocity-graph codes. No source tags were edited.", "", "The user's choice of PDF and Word as the current Forces assessment versions remains authoritative. The Google Doc is unread, is not assumed identical, and is not required for this selected batch. All freshness hashes, original assessment versions, source mappings, candidate images and exclusions remain in the unserved JSON companion."]
(AUDIT / "candidate-review.md").write_text("\n".join(lines)+"\n", encoding="utf-8")
(ROOT / "reports/preib-expansion-review.md").write_text("\n".join(lines)+"\n", encoding="utf-8")
print("Recorded expanded review: 9 sets, 17 parts, 40 marks; 20 selected assessment snapshots; eight candidate parents reserved.")
