"""Render bounded original markscheme pages for a private A5 geometry review.

Source PDFs and native metadata are read-only. No source crop is altered.
"""
import hashlib
import json
import re
from pathlib import Path

import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DB = Path(r"C:\CodexProjects\PaperDatabases")
OUT = ROOT / "dist/physics-audit/a5-additional-geometry"
CASES = {
    "ib_physics_2004_nov_3_76f24f38": ("G1",),
    "ib_physics_2004_nov_3_c4d0287e": ("G1",),
    "ib_physics_2005_may_3_6d8c1866": ("G1",),
    "ib_physics_2005_may_3_7e173998": ("G1",),
    "ib_physics_2007_may_3_1d1a90ef": ("G3",),
    "ib_physics_2007_nov_3_820f94e5": ("G1", "G2"),
    "ib_physics_2010_nov_3_1b08d840": ("D1",),
    "ib_physics_2011_may_3_7aa932a7": ("H2",),
}

def digest(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

def main():
    assert OUT.resolve().is_relative_to(ROOT)
    OUT.mkdir(parents=True, exist_ok=True)
    cases = []
    for preview, selected in CASES.items():
        meta_file = DB / "outputs/previews" / preview / "mark_scheme_preview.json"
        meta = json.loads(meta_file.read_text(encoding="utf-8-sig"))
        original = DB / meta["source"]["relative_path"]
        assert original.resolve().is_relative_to(DB)
        reader = PdfReader(original)
        texts = [page.extract_text() or "" for page in reader.pages]
        missing = sorted({entry["question_number"] for entry in meta["entries"] if not entry.get("crop_regions")})
        questions = set(missing) | set(selected)
        pages = sorted({region["page_number"] for entry in meta["entries"] if entry["question_number"] in questions for region in entry.get("crop_regions", [])})
        # Find every literal printed question heading as additional evidence;
        # this is a review locator, never an automatic geometry exemption.
        hits = {number: [i + 1 for i, text in enumerate(texts) if re.search(r"\b" + re.escape(number) + r"\s*\.", text)] for number in questions}
        pages = sorted(set(pages) | {page for values in hits.values() for page in values})
        pdf = pdfium.PdfDocument(original)
        renders = []
        for number in pages:
            file = OUT / f"{preview}-p{number:03}.png"
            page = pdf[number - 1]
            bitmap = page.render(scale=1.35)
            bitmap.to_pil().save(file)
            bitmap.close()
            page.close()
            renders.append({"page": number, "path": str(file), "sha256": digest(file), "text": texts[number - 1]})
        pdf.close()
        cases.append({"preview": preview, "selected_questions": list(selected), "missing_question_refs": missing,
                      "source": {"path": str(original), "sha256": digest(original)},
                      "metadata": {"path": str(meta_file), "sha256": digest(meta_file)},
                      "page_count": len(texts), "literal_heading_pages": hits, "rendered_pages": renders})
    result = {"schema_version": 1, "review_complete": False, "cases": cases}
    (OUT / "source-pages.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"cases": len(cases), "pages": sum(len(case["rendered_pages"]) for case in cases), "output": str(OUT / "source-pages.json")}, indent=2))

if __name__ == "__main__":
    main()
