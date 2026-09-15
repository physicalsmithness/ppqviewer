"""Render unserved contact sheets of the current Trilogy forces question crops.

This is a visual-review helper only. It never changes source files, exclusions,
or the served preview. Contact sheets must not be substituted for source crops.
"""
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]


def main():
    info = json.loads((ROOT / "dist/physics-preview/latest.json").read_text(encoding="utf-8"))
    served = Path(info["root"]).resolve() / "trilogy"
    if not served.is_relative_to((ROOT / "dist/physics-preview").resolve()):
        raise ValueError("Preview outside workspace")
    bundle = (served / "data/physics_catalogue.js").read_text(encoding="utf-8")
    questions = json.loads(bundle.split("window.PHYSICS_QUESTIONS=", 1)[1].strip().removesuffix(";"))
    questions = [q for q in questions if "forces" in q["topic_codes"]]
    output = ROOT / "dist/physics-audit/trilogy-current-tests/diagram-contacts" / info["build_id"]
    output.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 15)
    entries = []
    for q in questions:
        for number, url in enumerate(q["question_images"], 1):
            image = (served / url).resolve()
            if not image.is_relative_to(served) or image.suffix.lower() != ".png":
                raise ValueError("Unexpected served question image")
            entries.append({"parent_id": q["parent_id"], "image_number": number,
                            "image_url": url, "image_path": str(image),
                            "sha256": hashlib.sha256(image.read_bytes()).hexdigest()})
    cell_width, cell_height, columns, rows = 350, 440, 4, 4
    for start in range(0, len(entries), columns * rows):
        sheet = Image.new("RGB", (cell_width * columns, cell_height * rows), "#dce2e8")
        draw = ImageDraw.Draw(sheet)
        for position, entry in enumerate(entries[start:start + columns * rows]):
            x, y = position % columns * cell_width, position // columns * cell_height
            label = entry["parent_id"].replace("trilogy_", "").replace("::", " ")
            draw.text((x + 7, y + 5), f"{start + position + 1}. {label} / {entry['image_number']}", font=font, fill="black")
            with Image.open(entry["image_path"]) as original:
                thumb = original.convert("RGB")
                thumb.thumbnail((cell_width - 12, cell_height - 36))
            sheet.paste(thumb, (x + (cell_width - thumb.width) // 2, y + 28))
            entry["contact_sheet"] = f"sheet-{start // (columns * rows) + 1:02d}.jpg"
            entry["sheet_position"] = position + 1
        filename = output / f"sheet-{start // (columns * rows) + 1:02d}.jpg"
        sheet.save(filename, quality=92)
        print(str(filename))
    (output / "index.json").write_text(json.dumps({"build_id": info["build_id"],
        "served_parent_count": len(questions), "question_images": entries,
        "policy": "Unserved visual comparison index; absence of a contact-sheet match does not clear an assessment."},
        indent=2), encoding="utf-8")
    print(json.dumps({"parents": len(questions), "images": len(entries), "output": str(output)}))


if __name__ == "__main__":
    main()
