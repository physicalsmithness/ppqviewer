"""Turn the crop seat's band-fault screen into verdicts on the served pictures, and
write the notice list the IB Physics release attaches to affected parts.

Smith's ruling, 2026-09-22 (B(b)): the parts whose question picture also shows the
previous sub-part stay served, with a notice saying which part to answer, until the
crop repair lands. The notice is keyed to the exact faulty image hash, so a repaired
crop drops its notice by itself.

Inputs
  The geometry return from Physics Categorisation (flagged_pairs_geometry.csv and
  equal_height_twins.csv), the source crops under outputs/previews, and the latest
  assembled release (dist/ibphysics-release/latest.json) for the served set.
Output
  reports/ib-crop-notices.json  (schema_version 1)

Verdicts
  band  contained      the later sibling's top band is pixel-identical to the earlier
                       sibling: the fault. Notice.
        not_contained  real growth (a taller sub-part after a shorter one). No notice.
        page_mismatch  the seat's tightest-run pick put the two crops on different
                       pages, so containment cannot be tested. No notice; listed.
  twin  identical      the same picture is served for two sub-parts. Notice on both.
        different      the heights match by coincidence. No notice.
  missing              a crop file could not be read. No notice; listed.

Environment
  PHYSICS_PAPERDB_ROOT       default C:/CodexProjects/PaperDatabases
  PHYSICS_PREVIEWS_ROOT      default <PAPERDB_ROOT>/outputs/previews
  PHYSICS_CROP_GEOMETRY_DIR  default <PAPERDB_ROOT>/Physics Categorisation/returns/
                             QUESTION_CROP_BAND_GEOMETRY_2026-09-21
Reads only. Writes one file under reports/.
"""
import csv, hashlib, json, os, re, sys, datetime
from PIL import Image, ImageChops, ImageStat

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB = os.environ.get("PHYSICS_PAPERDB_ROOT", "C:/CodexProjects/PaperDatabases")
PREVIEWS = os.environ.get("PHYSICS_PREVIEWS_ROOT", os.path.join(DB, "outputs", "previews"))
GEOMETRY = os.environ.get("PHYSICS_CROP_GEOMETRY_DIR",
                          os.path.join(DB, "Physics Categorisation", "returns", "QUESTION_CROP_BAND_GEOMETRY_2026-09-21"))
OUT = os.path.join(ROOT, "reports", "ib-crop-notices.json")
ROMAN = {1: "i", 2: "ii", 3: "iii", 4: "iv", 5: "v", 6: "vi", 7: "vii", 8: "viii"}


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def release():
    latest = json.load(open(os.path.join(ROOT, "dist", "ibphysics-release", "latest.json"), encoding="utf-8"))
    root = os.path.join(ROOT, "dist", "ibphysics-release", os.path.basename(latest["root"].replace("\\", "/")))
    catalogue = open(os.path.join(root, "data", "physics_catalogue.js"), encoding="utf-8").read()
    m = re.search(r"window\.PHYSICS_QUESTIONS=(\[.*\]);\s*$", catalogue, re.S)
    if not m:
        sys.exit("release catalogue is not in the expected shape")
    questions = json.loads(m.group(1))
    assets = {f[:-4] for f in os.listdir(os.path.join(root, "assets")) if f.endswith(".png")}
    return latest["build_id"], questions, assets


def fingerprints():
    """(preview_dir, crop basename) -> sha256, from the four release clearances, which
    fingerprint every served crop by source path. Saves hashing thousands of files."""
    out = {}
    for name in ("ib-a5-release-clearance.json", "ib-a1-c1-release-clearance.json",
                 "ib-d2-release-clearance.json", "ib-e1-e2-release-clearance.json"):
        path = os.path.join(ROOT, "reports", name)
        if not os.path.exists(path):
            continue
        for f in json.load(open(path, encoding="utf-8")).get("fingerprints", []):
            p = f.get("path", "").replace("\\", "/")
            if not p.lower().endswith(".png") or "/crops/" not in p:
                continue
            parts = p.split("/")
            out.setdefault((parts[-3], parts[-1]), set()).add(f["sha256"])
    return out


def crop_path(row, key):
    return os.path.join(PREVIEWS, row["preview_dir"], "crops", row[key])


def label(row, roman_key):
    n = int(row[roman_key])
    return "(%s)(%s)" % (row["part_letter"], ROMAN.get(n, str(n)))


def page_of(name):
    m = re.search(r"_p(\d+)(?:_|\.)", name)
    return m.group(1) if m else None


def same(a, b):
    diff = ImageChops.difference(a, b)
    mean = ImageStat.Stat(diff).mean[0]
    extrema = diff.getextrema()[1]
    return (extrema == 0 or (mean < 0.5 and extrema < 24)), {"mean_diff": round(mean, 3), "max_diff": extrema}


def band_verdict(earlier, later):
    """Is the earlier crop the top band of the later one? Crops of one page can differ
    by a few pixels of width (a different crop box on the same render), so a narrower
    image is slid across the wider one; crops of different pages are not comparable."""
    if page_of(os.path.basename(earlier)) != page_of(os.path.basename(later)):
        return "page_mismatch", None
    try:
        a = Image.open(earlier).convert("L")
        b = Image.open(later).convert("L")
    except OSError:
        return "missing", None
    if a.height > b.height:
        return "not_contained", {"reason": "earlier crop is taller"}
    top = b.crop((0, 0, b.width, a.height))
    if a.width == top.width:
        ok, measure = same(a, top)
        return ("contained" if ok else "not_contained"), measure
    narrow, wide = (a, top) if a.width < top.width else (top, a)
    best = None
    for x in range(0, wide.width - narrow.width + 1):
        ok, measure = same(narrow, wide.crop((x, 0, x + narrow.width, narrow.height)))
        measure["x_offset"] = x
        if ok:
            return "contained", measure
        if best is None or measure["mean_diff"] < best["mean_diff"]:
            best = measure
    return "not_contained", best


def twin_verdict(one, other):
    try:
        a = Image.open(one).convert("L")
        b = Image.open(other).convert("L")
    except OSError:
        return "missing", None
    if a.size != b.size:
        return "different", None
    diff = ImageChops.difference(a, b)
    stat = ImageStat.Stat(diff)
    mean = stat.mean[0]
    extrema = diff.getextrema()[1]
    if extrema == 0 or (mean < 0.5 and extrema < 24):
        return "identical", {"mean_diff": round(mean, 3), "max_diff": extrema}
    return "different", {"mean_diff": round(mean, 3), "max_diff": extrema}


def main():
    build_id, questions, assets = release()
    by_asset = {}
    for q in questions:
        for url in q.get("question_images", []):
            by_asset.setdefault(url.split("/")[-1][:-4], []).append(q)
    flagged = read_csv(os.path.join(GEOMETRY, "flagged_pairs_geometry.csv"))
    twins = read_csv(os.path.join(GEOMETRY, "equal_height_twins.csv"))
    notices, listed, seen = [], [], set()
    known = fingerprints()

    def served_parts(row, key):
        """The served parts whose question image is this crop, without reading it:
        the clearances already fingerprint every served crop by source path."""
        for digest in known.get((row["preview_dir"], row[key]), ()):
            if digest in assets:
                return digest, by_asset.get(digest, [])
        return None, []

    for row in flagged:
        later = crop_path(row, "later_crop")
        digest, parts = served_parts(row, "later_crop")
        if not parts:
            continue
        verdict, measure = band_verdict(crop_path(row, "earlier_crop"), later)
        for q in parts:
            key = (q["id"], digest)
            if key in seen:
                continue
            seen.add(key)
            entry = {
                "served_id": q["id"], "source_part_id": q["source_part_id"], "kind": "band", "verdict": verdict,
                "this_label": q.get("label") or label(row, "later_roman"), "other_label": label(row, "earlier_roman"),
                "crop_sha256": digest, "crop_file": row["later_crop"], "earlier_crop_file": row["earlier_crop"],
                "preview_dir": row["preview_dir"], "growth_ratio": row["growth_ratio"], "same_width": row["same_width"] == "1",
                "measure": measure,
            }
            (notices if verdict == "contained" else listed).append(entry)

    for row in twins:
        one, other = crop_path(row, "earlier_crop"), crop_path(row, "later_crop")
        hits = [(path, key, this_key, other_key) for path, key, this_key, other_key in
                ((one, "earlier_crop", "earlier_roman", "later_roman"), (other, "later_crop", "later_roman", "earlier_roman"))
                if served_parts(row, key)[1]]
        if not hits:
            continue
        verdict, measure = twin_verdict(one, other)
        for path, key, this_key, other_key in hits:
            digest, parts = served_parts(row, key)
            for q in parts:
                key = (q["id"], digest)
                if key in seen:
                    continue
                seen.add(key)
                entry = {
                    "served_id": q["id"], "source_part_id": q["source_part_id"], "kind": "twin", "verdict": verdict,
                    "this_label": q.get("label") or label(row, this_key), "other_label": label(row, other_key),
                    "crop_sha256": digest, "crop_file": os.path.basename(path),
                    "earlier_crop_file": os.path.basename(other if path == one else one),
                    "preview_dir": row["preview_dir"], "growth_ratio": "1.00", "same_width": True, "measure": measure,
                }
                (notices if verdict == "identical" else listed).append(entry)

    notices.sort(key=lambda e: (e["served_id"], e["crop_sha256"]))
    listed.sort(key=lambda e: (e["served_id"], e["crop_sha256"]))
    counts = {}
    for e in notices + listed:
        counts[e["kind"] + ":" + e["verdict"]] = counts.get(e["kind"] + ":" + e["verdict"], 0) + 1
    report = {
        "schema_version": 1,
        "built_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "release_build": build_id,
        "geometry_dir": GEOMETRY,
        "geometry_files": {name: sha256(os.path.join(GEOMETRY, name)) for name in ("flagged_pairs_geometry.csv", "equal_height_twins.csv")},
        "rule": "A notice applies only while the served question image still has the recorded sha256; a repaired crop drops it.",
        "counts": counts,
        "notices": notices,
        "no_notice": listed,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=1, ensure_ascii=False)
        f.write("\n")
    print(json.dumps({"path": OUT, "release_build": build_id, "notices": len(notices), "no_notice": len(listed), "counts": counts}, indent=1))


if __name__ == "__main__":
    main()
