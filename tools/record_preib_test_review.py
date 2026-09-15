"""Persist the completed 2026-09-10 visual comparison, bound to source hashes.

This records the actual review performed in this task. It is not an automatic
reviewer and must not be reused for a different test or candidate collection.
"""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
directory = root / "dist/physics-audit/preib-current-test"
data_path = root / "dist/physics-inputs/preib.json"
data = json.loads(data_path.read_text(encoding="utf-8"))
test, = directory.glob("*.pdf")
expected_test_hash = "e70bd455b5e9ff7accfb981ea7e99e654cc7b71a7e1e3331e71c5f4a114f6653"
assert hashlib.sha256(test.read_bytes()).hexdigest() == expected_test_hash, "A different test requires a new visual review"

decisions = {
    "edexcel_4sd0_1p_2024_jun::Q03": ("keep", [1, 4, 5, 10, 13],
        "Source 3(c) asks for infrared-wave travel time over 1.5 m using 3.0 x 10^8 m/s. No infrared lamps, this distance/speed pair, or this light-travel question appears in the test. Test speed-camera and reaction-time questions use different situations, numbers and requested quantities."),
    "edexcel_4sd0_1p_2024_jun::Q10": ("keep", [1, 10, 11],
        "Source 10(a) asks for the weight of a 250 g load attached to a bent wooden strip. The complete diagram and question are absent from the test. Test Q8 instead gives comet weight 4.4 x 10^9 N and mass 2.2 x 10^14 kg to calculate field strength; this is a different source question."),
    "edexcel_4sd0_1p_2024_jun::Q12": ("keep", [2, 4, 6, 7, 8, 9, 12],
        "Source 12(a-c) uses a smooth rising car velocity-time curve, axes 0-100 s and 0-80 m/s, plateau about 64 m/s, tangent at 20 s, area over 80 s, and a force-balance explanation after 80 s. None of the test graphs matches: test graphs show braking/linear pieces, a toy car up to 0.6 s, or four qualitative motion graphs. The diagram and three source tasks are absent."),
    "edexcel_4ss0_1p_2019_jun::Q03": ("exclude", [5, 13],
        "Source 3(a)(i), 'State the formula linking average speed, distance moved and time taken', is repeated verbatim by test Q2(d)(i) on page 5 and Q10(a)(i) on page 13. Withhold the entire source parent, including the aeroplane calculation 3(a)(ii), even though that aeroplane graph itself is absent."),
    "edexcel_4ss0_1p_2019_jun::Q04": ("keep", [1, 9, 11],
        "Source 4(b)(i) shows a toy with two magnets, one floating above another, and an upward magnetic-repulsion arrow; pupils add a downward labelled weight arrow of equal length. No floating-magnet photograph/diagram or this drawing task appears in any test page. Test Q1 asks to name a horizontal car force, which is a different task."),
}
questions = {question["id"]: question for question in data["questions"]}
assert set(questions) == set(decisions), "Review input has changed; inspect candidates again"
reviewed = []
for key, (decision, closest_pages, explanation) in decisions.items():
    question = questions[key]
    images = []
    for kind in ("question_images", "markscheme_images"):
        for value in question[kind]:
            path = Path(value)
            images.append({"kind": kind, "path": str(path), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    reviewed.append({"parent_id": key, "part_ids": question["part_ids"],
                     "specification_codes": question["specification_codes"], "decision": decision,
                     "all_test_pages_reviewed": list(range(1, 15)), "closest_comparison_pages": closest_pages,
                     "evidence": explanation, "reviewed_assets": images})

page_descriptions = [
    "Q1 car horizontal-force diagram, 2900 N and 1200 kg acceleration calculation.",
    "Q1 continued: braking graph, reaction 0.5 s and braking 2.5 s, braking-distance area.",
    "Intentionally blank page, visually confirmed.",
    "Q2 thinking/braking-distance versus speed graph and stopping-distance questions.",
    "Q2 continued: identical average-speed formula recall and driver reaction-time calculation.",
    "Q3 braking velocity-time graph and four distance-time graph options.",
    "Q4 toy car ramp/table investigation, velocity-time graph from 0 to 0.6 s.",
    "Q5 train braking from about 45 m/s to zero in 40 s, acceleration from graph.",
    "Q6 four qualitative motion graphs and a classification table.",
    "Q7 van braking, 2500 kg, 14 kN and 18 m/s, time to stop.",
    "Q8 comet orbit, weight 4.4 x 10^9 N and mass 2.2 x 10^14 kg, field-strength calculation.",
    "Q9 reaction-time reading from a car braking graph.",
    "Q10 speed camera photograph, 0.25 s, 6.5 m; identical average-speed formula recall.",
    "Q11 ramp-surface investigation planning and bar-chart justification.",
]
pages = []
for index, description in enumerate(page_descriptions, 1):
    path = directory / "visual-review" / f"test-page-{index:02d}.png"
    pages.append({"page": index, "status": "visually_reviewed", "description": description,
                  "render_sha256": hashlib.sha256(path.read_bytes()).hexdigest()})

reviewed_input = directory / "reviewed-input.json"
reviewed_input.write_bytes(data_path.read_bytes())
result = {"review_date": "2026-09-10", "review_kind": "Agent visual comparison, including diagrams and short recall questions",
          "test": {"path": str(test), "sha256": expected_test_hash, "page_count":14},
          "reviewed_input": {"path": str(reviewed_input), "original_path": str(data_path), "sha256": hashlib.sha256(reviewed_input.read_bytes()).hexdigest()},
          "source_fingerprints": data["report"]["sources"], "candidate_reviews": reviewed,
          "test_page_reviews": pages, "keep_parent_ids": [key for key,value in decisions.items() if value[0]=='keep'],
          "exclude_parent_ids": [key for key,value in decisions.items() if value[0]=='exclude'],
          "current_named_test_review_complete": True, "broader_assessment_inventory_review_complete": False,
          "limitation": "This clears only these source images against this exact 14-page current test. Broader Pre-IB assessment inventory confirmation remains with the coordinating task."}
(directory / "candidate-review.json").write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
lines = ["# Pre-IB forces test comparison", "", "Reviewed on 10 September 2026. All 14 pages of the current forces and motion test were inspected, including graphs, diagrams and the intentionally blank page.", "", "**Result: keep four question sets containing six assessed parts. Remove 2019 Single Award Q3 because its formula-recall part appears verbatim twice in the test.**", "", "| Source | Decision | Evidence |", "|---|---|---|"]
for row in reviewed:
    lines.append(f"| {row['parent_id']} | {row['decision']} | {row['evidence']} |")
lines += ["", "The machine-readable audit records every inspected asset hash, all 14 test-page render hashes, the exact test SHA256 and the canonical source-data hashes. It applies only to this source/test snapshot.", "", "The wider assessment-folder inventory has not been independently cleared by this audit. No claim is made about other tests."]
(directory / "candidate-review.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
print("Recorded full current-test visual review: 4 keep, 1 exclude; broader inventory confirmation pending.")
