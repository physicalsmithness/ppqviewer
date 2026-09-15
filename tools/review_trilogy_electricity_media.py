"""Extract the already-snapshotted electricity test's media for visual audit.
Writes only unserved review images, including contact sheets; no source changes.
"""
from pathlib import Path
import hashlib
import io
import json
import zipfile
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "dist/physics-audit/trilogy-current-tests"
SOURCE = AUDIT / "snapshots/2. Electricity/Electricity test (whole unit).docx"
OUTPUT = AUDIT / "review/electricity-whole-unit-media"


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    entries, rendered = [], []
    with zipfile.ZipFile(SOURCE) as archive:
        for name in sorted(archive.namelist()):
            if not name.startswith("word/media/") or name.endswith("/"):
                continue
            data = archive.read(name)
            entry = {"name": name, "sha256": hashlib.sha256(data).hexdigest()}
            try:
                original = Image.open(io.BytesIO(data))
                entry.update(format=original.format, size=list(original.size))
                original.load()
                rgb = original.convert("RGB")
                target = OUTPUT / (Path(name).name + ".png")
                rgb.save(target)
                entry["render"] = str(target.resolve())
                rendered.append((name, rgb))
            except Exception as error:
                entry["error"] = str(error)
            entries.append(entry)
    for start in range(0, len(rendered), 4):
        sheet = Image.new("RGB", (1400, 1300), "white")
        draw = ImageDraw.Draw(sheet)
        for index, (name, img) in enumerate(rendered[start:start+4]):
            x, y = (index % 2) * 700, (index // 2) * 650
            draw.text((x+15, y+10), name, fill="black")
            fitted = ImageOps.contain(img, (670, 605))
            sheet.paste(fitted, (x+15, y+35))
        sheet.save(OUTPUT / ("contact-" + str(start//4+1) + ".png"))
    report = {"source": str(SOURCE), "source_sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(), "media": entries}
    (OUTPUT / "inventory.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"media":len(entries), "rendered":len(rendered), "errors":[e for e in entries if "error" in e], "output":str(OUTPUT)}))


if __name__ == "__main__":
    main()
