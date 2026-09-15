"""Flag served IB MCQ crops whose printed ink reaches the lower image edge.

This read-only source audit emits local JSON and review contact sheets. The edge
signal is a review cue, not an automatic assertion that a question is incomplete.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

from PIL import Image, ImageDraw


def main():
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--latest', type=Path, default=root / 'dist/physics-preview/latest.json')
    parser.add_argument('--output', type=Path, default=root / 'dist/physics-audit/ib-native-crop-edges.json')
    args = parser.parse_args()
    output = args.output.resolve()
    if not output.is_relative_to(root):
        raise SystemExit('Audit output must remain inside the PPQ viewer workspace')
    latest = json.loads(args.latest.read_text(encoding='utf-8'))
    site_root = Path(latest['root']).resolve()
    catalogue = site_root / 'ib/data/physics_catalogue.js'
    raw = catalogue.read_text(encoding='utf-8')
    marker = 'window.PHYSICS_QUESTIONS='
    if marker not in raw:
        raise SystemExit('Unexpected served catalogue format')
    questions, end = json.JSONDecoder().raw_decode(raw.split(marker, 1)[1].lstrip())
    selected = [question for question in questions if question['paper'] in ('1', '1A')]
    flags, checked = [], 0
    for question in selected:
        for relative in question['question_images']:
            filename = (site_root / 'ib' / relative).resolve()
            if not filename.is_relative_to(site_root):
                raise ValueError(f'Image escaped the served site: {relative}')
            with Image.open(filename) as original:
                image = original.convert('L')
                pixels = image.crop((0, max(0, image.height - 3), image.width, image.height)).tobytes()
                dark = sum(value < 160 for value in pixels)
                checked += 1
                if dark <= max(8, len(pixels) * 0.002):
                    continue
                flags.append({'part_id': question['id'], 'parent_id': question['parent_id'],
                    'source_part_id': question['source_part_id'], 'source_group_id': question.get('source_group_id', ''),
                    'topic_codes': question['topic_codes'], 'image': str(filename),
                    'image_sha256': hashlib.sha256(filename.read_bytes()).hexdigest(),
                    'width': image.width, 'height': image.height, 'bottom_dark_pixels': dark,
                    'review_status': 'pending_visual_review'})
    output.parent.mkdir(parents=True, exist_ok=True)
    sheets = []
    for start in range(0, len(flags), 6):
        batch = flags[start:start + 6]
        board = Image.new('RGB', (1160, 1860), '#dddddd')
        draw = ImageDraw.Draw(board)
        for i, item in enumerate(batch):
            x, y = (i % 2) * 580, (i // 2) * 620
            with Image.open(item['image']) as source:
                image = source.convert('RGB')
                image.thumbnail((550, 550))
                draw.text((x + 12, y + 10), f"{start + i + 1}: {item['part_id']}", fill='black')
                draw.text((x + 12, y + 27), ', '.join(item['topic_codes']), fill='black')
                board.paste(image, (x + 12, y + 52))
        filename = output.parent / f'{output.stem}-sheet-{start // 6 + 1:02}.png'
        board.save(filename)
        sheets.append(str(filename))
    report = {'catalogue': str(catalogue), 'catalogue_sha256': hashlib.sha256(catalogue.read_bytes()).hexdigest(),
        'counts': {'served_mcq_parts': len(selected), 'images_checked': checked, 'flagged_parts': len({item['part_id'] for item in flags}), 'flagged_images': len(flags)},
        'rule': 'More than eight dark pixels, and more than 0.2% dark pixels where larger, in the final three image rows.',
        'limitation': 'This screen does not detect every clipping defect and can flag harmless lines continuing beyond a crop. Confirm content visually before classifying a flag.',
        'flags': flags, 'contact_sheets': sheets}
    output.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output), 'counts': report['counts'], 'sheets': len(sheets)}, indent=2))


if __name__ == '__main__':
    main()
