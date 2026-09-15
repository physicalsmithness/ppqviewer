"""Record this task's completed visual review; never infer review for new files."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "dist/physics-audit/preib-current-assessments"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def fingerprint(path):
    return {"path": str(path.resolve()), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


manifest_path = DIRECTORY / "manifest.json"
manifest = read(manifest_path)
input_path = ROOT / "dist/physics-inputs/preib.json"
data = read(input_path)
named_path = ROOT / "dist/physics-audit/preib-current-test/candidate-review.json"
named = read(named_path)
galleries_path = DIRECTORY / "visual-review/index.json"
galleries = read(galleries_path)

# These are the exact document snapshots visually inspected in this task.
expected_hash_prefixes = {
    "bdb1dd7352b3", "897eaac57492", "8583830375be", "e476c3f7eb24",
    "685090e9fc7b", "3457e2e76df1", "25df44adacfe", "4ef860e0d0bb",
    "65eebd2e1eee", "e70bd455b5e9", "056e3eb94816", "bcf183afa52b",
    "9f8ccc9a5242", "a2407d88f046", "0b1fb741b59e", "31d30a2018b1",
    "a05f1685634b", "2fd4c0d945b3", "e115fc48d351",
}
assert len(manifest["files"]) == 20
assert {entry["sha256"][:12] for entry in manifest["files"]} == expected_hash_prefixes
assert {entry["sha256"][:12] for entry in galleries} == expected_hash_prefixes
assert set(named["keep_parent_ids"]) == {question["id"] for question in data["questions"]}
assert data["report"]["served_part_count"] == 6
assert all(not entry["unsupported_embedded_images"] for entry in galleries)

evidence = {
    "edexcel_4sd0_1p_2024_jun::Q03": "The 1.5 m infrared-lamp travel-time calculation is absent. Waves tests include gamma-ray frequency, ground radar wavelength and an ultrasound echo over 2.35 m at 345 m/s; these have different apparatus, values and tasks. Energy uses a 52 W light bulb, without this lamp photograph or travel-time question.",
    "edexcel_4sd0_1p_2024_jun::Q10": "The 250 g load on a bent wooden strip and its weight calculation are absent. Energy tests show a 0.52 kg dropped ball, an 830 N skier and a motor lifting 1.0 kg. Solids/liquids/gases tests show a lorry stabiliser and camel pressure, rather than the cantilever apparatus. The forces comet question asks for field strength from different data.",
    "edexcel_4sd0_1p_2024_jun::Q12": "No test contains this smooth car velocity-time curve with 0-100 s and 0-80 m/s axes, tangent at 20 s, area over 80 s and force-balance task after 80 s. Forces versions show braking, piecewise linear toy-car/train plots or qualitative graphs. The superficially similar electricity curve is current against voltage, with different axes and tasks. Energy's cars appear in a power/mass/speed table.",
    "edexcel_4ss0_1p_2019_jun::Q04": "The floating-magnet toy, existing upward repulsion arrow and equal downward labelled weight-arrow task are absent. Magnetism tests contain rotating coils, bar-magnet field lines and two horizontal neodymium magnets X/Y with a uniform-field drawing task. These differ from the two floating toy magnets A/B. Forces' comet arrow task has a different scenario and diagram.",
}

gallery_by_hash = {entry["sha256"]: entry for entry in galleries}
documents = []
for entry in manifest["files"]:
    snapshot = Path(entry["snapshot_path"])
    assert fingerprint(snapshot)["sha256"] == entry["sha256"]
    gallery = gallery_by_hash[entry["sha256"]]
    documents.append({**entry, "comparison_status": "No additional overlap with the four retained candidate sets",
                      "text_evidence": fingerprint(Path(entry["text_path"])),
                      "visual_method": "PDF page contact sheets" if snapshot.suffix.lower() == ".pdf" else "Extracted Word text and all embedded raster diagrams; no unsupported image formats",
                      "visual_item_count": gallery["image_count"],
                      "reviewed_galleries": [fingerprint(Path(path)) for path in gallery["gallery_files"]]})

candidates = []
for question in data["questions"]:
    assets = []
    for kind in ("question_images", "markscheme_images"):
        for path in question[kind]:
            assets.append({"kind": kind, **fingerprint(Path(path))})
    candidates.append({"parent_id": question["id"], "part_ids": question["part_ids"],
                       "specification_codes": question["specification_codes"], "decision": "keep_against_available_snapshots",
                       "evidence": evidence[question["id"]], "reviewed_assets": assets,
                       "compared_test_sha256s": sorted(gallery_by_hash)})

reviewed_input = DIRECTORY / "reviewed-input.json"
reviewed_input.write_bytes(input_path.read_bytes())
gap = {"source": r"H:\Shared drives\0. Physics (Teachers)\3 - Pre-IB\PreIB forces and motion test 2024.gdoc",
       "status": "unread_not_selected_as_current_assessment", "access_attempts": "Coordinating task reports three Google Drive connector searches returned zero results; an approved H-drive Get-Content read failed with 'Incorrect function'.",
       "source_selection": "On 2026-09-10 the coordinating task confirmed the user's selection of the PDF and Word versions as the authoritative current Forces test for this batch.",
       "consequence": "The Google Doc was not read and is not assumed identical to PDF or DOCX. It is not a required assessment version for this user-selected batch."}
result = {
    "review_date": "2026-09-10", "review_kind": "Completed agent visual comparison plus extracted-text matching",
    "available_snapshots_review_complete": True, "broader_assessment_inventory_review_complete": True,
    "manifest": fingerprint(manifest_path), "gallery_index": fingerprint(galleries_path),
    "reviewed_input": fingerprint(reviewed_input), "source_fingerprints": data["report"]["sources"],
    "document_count": 20, "unique_document_count": 19,
    "scope": manifest["scope"], "document_reviews": documents, "candidate_reviews": candidates,
    "named_forces_review": fingerprint(named_path), "named_forces_test_pages_reviewed": 14,
    "excluded_candidate_parent_ids": ["edexcel_4ss0_1p_2019_jun::Q03"],
    "excluded_candidate_evidence": "The average-speed formula-recall prompt is repeated verbatim in the current forces test on pages 5 and 13; the entire 2019 Single Award Q3 parent is withheld, including the nonmatching aeroplane calculation.",
    "unresolved_sources": [], "user_selected_version_exceptions": [gap],
    "limitations": ["This comparison covers only the four retained candidate sets and exact captured bytes, not all source-bank questions.",
                    "Word documents were compared by extracted text and embedded diagram galleries; their page layouts were not rendered.",
                    "Current and archived/bad-rendering energy PDFs have identical bytes. Their clipped diagrams were additionally checked in the complete Word media and energy temp PDF.",
                    "The historical Cambridge subfolder was not traversed; all top-level PDF/DOCX test versions were retained, including the newer Waves Word document."]}
(DIRECTORY / "candidate-review.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
lines = ["# Pre-IB assessment comparison", "", "Reviewed 10 September 2026. Four retained question sets (six assessed parts) were compared against 20 top-level assessment PDF/Word snapshots, representing 19 distinct byte sequences. No further overlap was found in the available snapshots.", "", "All PDF pages were visually screened. All embedded Word diagrams were screened alongside extracted text, including the newer Waves Word version. The named current Forces PDF received a separate full 14-page review.", "", "| Retained source | Comparison evidence |", "|---|---|"]
for question in candidates:
    lines.append(f"| {question['parent_id']} | {question['evidence']} |")
lines += ["", "**Held back:** 2019 Single Award Q3, because its average-speed formula prompt appears in the current forces test twice. Whole-parent exclusion prevents its other part from being served.", "", "**Assessment-version selection:** " + gap["source_selection"], "", gap["source"], "", gap["access_attempts"], "", gap["consequence"], "", "Scope includes Forces (current and older draft), energy (current, temp, archived PDF and Word), electricity, magnetism, radioactivity, solids/liquids/gases, astrophysics and Waves (both PDFs and newer Word). Answers were omitted and the historical Cambridge child folder was not traversed.", "", "The unserved machine-readable companion records the manifest hash, original paths, modification timestamps, exact PDF/Word hashes, extracted-text hashes, reviewed gallery hashes, canonical source hashes and per-candidate image hashes. Recheck if any evidence changes."]
(DIRECTORY / "candidate-review.md").write_text("\n".join(lines)+"\n", encoding="utf-8")
(ROOT / "reports").mkdir(exist_ok=True)
(ROOT / "reports/preib-assessment-review.md").write_text("\n".join(lines[:4] + ["", "The retained parts are 2024 Double Award 3(c), 10(a), 12(a-c), and 2019 Single Award 4(b)(i), each explicitly mapped to the school's 4SS0 Pre-IB scope.", "", "2019 Single Award Q3 is withheld in full: its short average-speed formula prompt is repeated on pages 5 and 13 of the named Forces test. All 14 pages of that test were reviewed.", "", "The available collection includes PDF and Word versions of Forces, energy, electricity, magnetism, radioactivity, solids/liquids/gases, astrophysics and Waves. The newer Waves Word file was included independently. All top-level test versions were retained; answers and the historical Cambridge child folder were omitted.", "", gap["source_selection"], "", "This Google Doc remains unread, but is not required by that selection:", "", "`" + gap["source"] + "`", "", gap["access_attempts"], "", "It is not assumed identical to either the PDF or Word test. Clearance applies only to the four retained sets against the selected assessment snapshots.", "", "Full local evidence is in `dist/physics-audit/preib-current-assessments/candidate-review.json` and its Markdown companion. That unserved audit binds every retained asset, source dataset, PDF/Word snapshot, text extraction and reviewed gallery to SHA-256 hashes. It also retains original source modification times and the exact reviewed viewer input."])+"\n", encoding="utf-8")
print("Recorded selected-assessment visual review: 20 files, 19 unique documents, 4 sets / 6 parts; PDF and Word selected as current Forces test.")
