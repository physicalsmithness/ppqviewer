"""Render the local current-test snapshot for the bounded visual exclusion audit."""
from pathlib import Path
import fitz
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "dist/physics-audit/preib-current-test"
snapshot, = root.glob("*.pdf")
output = root / "visual-review"
output.mkdir(parents=True, exist_ok=True)
with fitz.open(snapshot) as document:
    pages = []
    for index, page in enumerate(document):
        target = output / f"test-page-{index + 1:02d}.png"
        page.get_pixmap(dpi=105, alpha=False).save(target)
        pages.append(target)
    for start in range(0, len(pages), 4):
        canvas = Image.new("RGB", (1220, 1780), "#dddddd")
        draw = ImageDraw.Draw(canvas)
        for offset, path in enumerate(pages[start:start + 4]):
            image = Image.open(path)
            image.thumbnail((596, 842))
            x, y = (offset % 2) * 610 + 7, (offset // 2) * 890 + 30
            canvas.paste(image, (x, y))
            draw.text((x, y - 22), f"Test page {start + offset + 1}", fill="black")
        canvas.save(output / f"contact-{start // 4 + 1}.png")
print(f"Rendered {len(pages)} pages for review in {output}")
