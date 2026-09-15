"""Private read-only A1/C1 assessment evidence; never writes to source folders."""
import argparse
import collections
import csv
import hashlib
import json
import re
import unicodedata
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree

WORKSPACE = Path(__file__).resolve().parent.parent
PAPERDB = Path(r"C:\CodexProjects\PaperDatabases")
REL = Path("Physics Categorisation/reference/tests/3. Assessments")
SHARED = Path(r"H:\Shared drives\0. Physics (Teachers)\1- IB Folder\3. Assessments")

def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

def chosen(relative):
    return relative.startswith("A/A.1/") or (relative.startswith("C/") and re.search(r"C\.?1", relative, re.I))

def tokens(text):
    return re.findall(r"[a-z0-9]+", unicodedata.normalize("NFKC", text or "").lower())

def parent_label(row):
    return f"{row['year'][-2:]}{row['session'][:1].upper()}.P{row['paper']}.{row['level']}.{row['time_zone'] or 'TZ0'}.Q{row['question']}"

def extract(file):
    if file.suffix.lower() == ".pdf":
        from pypdf import PdfReader
        return [page.extract_text() or "" for page in PdfReader(file).pages]
    with zipfile.ZipFile(file) as archive:
        root = ElementTree.fromstring(archive.read("word/document.xml"))
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        return ["\n".join("".join(p.itertext()) for p in root.findall(".//w:p", ns))]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--freshness", action="store_true", help="Hash current H documents and compare the read-only local snapshots")
    parser.add_argument("--output", type=Path, default=WORKSPACE / "dist/physics-audit/a1-c1-assessments")
    parser.add_argument("--render", action="store_true", help="Render latest test PDF pages and private contact sheets")
    args = parser.parse_args()
    out = args.output.resolve()
    if not out.is_relative_to(WORKSPACE):
        raise SystemExit("Output must stay within the viewer workspace")
    out.mkdir(parents=True, exist_ok=True)
    root = SHARED if args.freshness else PAPERDB / REL
    files = sorted(file for folder in [root / "A/A.1", root / "C"] for file in folder.rglob("*")
                   if file.is_file() and file.suffix.lower() in (".pdf", ".docx") and not file.name.startswith("~")
                   and chosen(file.relative_to(root).as_posix()))
    if not files:
        raise SystemExit("No A1/C1 assessment sources discovered")
    source_files = []
    for file in files:
        rel = file.relative_to(root).as_posix()
        row = {"relative_path": rel, "sha256": sha(file), "bytes": file.stat().st_size}
        if args.freshness:
            snapshot = PAPERDB / REL / rel
            row["snapshot_sha256"] = sha(snapshot) if snapshot.is_file() else None
            row["same_bytes_as_local_snapshot"] = row["sha256"] == row["snapshot_sha256"]
        source_files.append(row)
    if args.freshness:
        result = {"schema_version": 1, "checked_at": datetime.now(timezone.utc).isoformat(), "source_root": str(root), "source_files": source_files,
                  "all_identical": all(row["same_bytes_as_local_snapshot"] for row in source_files)}
        (out / "freshness.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"files": len(files), "all_identical": result["all_identical"]}))
        return

    corpus_path = PAPERDB / "outputs/exports/ib_physics_archive_flat_v5.csv"
    with corpus_path.open(encoding="utf-8-sig", newline="") as stream:
        corpus = list(csv.DictReader(stream))
    by_parent = collections.defaultdict(list)
    index = collections.defaultdict(set)
    for row in corpus:
        key = row["preview"] + ":" + row["question"]
        by_parent[key].append(row)
        words = tokens(" ".join(row.get(k, "") for k in ["question_text", "shared_stem", "parent_context"]))
        for i in range(len(words) - 7):
            gram = tuple(words[i:i+8])
            if sum(map(len, gram)) >= 28:
                index[gram].add(key)
    docs = []
    for file, source in zip(files, source_files):
        pages = []
        for number, text in enumerate(extract(file), 1):
            hits = collections.defaultdict(set)
            words = tokens(text)
            for i in range(len(words) - 7):
                gram = tuple(words[i:i+8])
                parents = index.get(gram, ())
                if len(parents) <= 20:
                    for key in parents:
                        hits[key].add(gram)
            candidates = []
            for key, grams in sorted(hits.items(), key=lambda item: -len(item[1]))[:24]:
                rows = by_parent[key]
                candidates.append({"parent_id": parent_label(rows[0]), "preview": rows[0]["preview"],
                                   "source_ids": [r["part_id"] for r in rows], "exact_word_runs": len(grams),
                                   "evidence_runs": [" ".join(g) for g in sorted(grams)[:4]]})
            pages.append({"page": number, "text": text, "candidate_parents": candidates})
        docs.append({**source, "pages": pages})
    (out / "native-review.json").write_text(json.dumps({"corpus_sha256": sha(corpus_path), "documents": docs}, indent=2) + "\n", encoding="utf-8")
    if args.render:
        import pypdfium2 as pdfium
        from PIL import Image, ImageDraw
        latest = ["A/A.1/A.1 Test 2026.pdf", "C/C1-C2-C5 test 2026.pdf", "C/C.1 Mini-Test.pdf"]
        for rel in latest:
            folder = out / "pages" / re.sub(r"[^A-Za-z0-9]+", "_", Path(rel).stem)
            folder.mkdir(parents=True, exist_ok=True)
            with pdfium.PdfDocument(root / rel) as doc:
                thumbnails = []
                for i, page in enumerate(doc):
                    im = page.render(scale=1.3).to_pil().convert("RGB")
                    dest = folder / f"p{i+1:02}.png"; im.save(dest)
                    im.thumbnail((480, 660))
                    thumb = Image.new("RGB", (500, 700), "#ddd"); thumb.paste(im, ((500-im.width)//2, 28)); ImageDraw.Draw(thumb).text((12, 7), f"{Path(rel).stem} / page {i+1}", fill="black")
                    thumbnails.append(thumb)
                for start in range(0, len(thumbnails), 4):
                    sheet = Image.new("RGB", (1000, 1400), "white")
                    for j, thumb in enumerate(thumbnails[start:start+4]): sheet.paste(thumb, ((j % 2)*500, (j // 2)*700))
                    sheet.save(folder / f"contact{start//4+1:02}.jpg", quality=90)
    print(json.dumps({"files": len(files), "pages_or_docx": sum(len(d["pages"]) for d in docs), "corpus_rows": len(corpus)}))

if __name__ == "__main__":
    main()
