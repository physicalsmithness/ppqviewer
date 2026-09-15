"""Build local assessment page/embedded-image galleries for source comparison."""
import hashlib
import io
import json
from pathlib import Path
import zipfile
import fitz
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[1]/"dist/physics-audit/preib-current-assessments"
manifest=json.loads((root/"manifest.json").read_text(encoding="utf-8"))
output=root/"visual-review"
output.mkdir(parents=True,exist_ok=True)
seen=set()
index=[]
for entry in manifest['files']:
    if entry.get('error') or entry['sha256'] in seen:
        continue
    seen.add(entry['sha256'])
    path=Path(entry['snapshot_path'])
    images=[]
    unsupported=[]
    if path.suffix.lower()=='.pdf':
        with fitz.open(path) as document:
            for number,page in enumerate(document,1):
                pixmap=page.get_pixmap(dpi=65,alpha=False)
                images.append((f"page {number}",Image.open(io.BytesIO(pixmap.tobytes('png')))))
    else:
        with zipfile.ZipFile(path) as document:
            for name in document.namelist():
                if name.startswith('word/media/'):
                    try:
                        image=Image.open(io.BytesIO(document.read(name)))
                        image.load()
                        images.append((name.split('/')[-1],image.convert('RGB')))
                    except (OSError,ValueError):
                        unsupported.append(name)
    files=[]
    for start in range(0,len(images),9):
        canvas=Image.new('RGB',(1230,1800),'#dddddd')
        draw=ImageDraw.Draw(canvas)
        for offset,(label,image) in enumerate(images[start:start+9]):
            image=image.copy()
            image.thumbnail((395,558))
            x=(offset%3)*410+7
            y=(offset//3)*600+26
            canvas.paste(image,(x,y))
            draw.text((x,y-20),label,fill='black')
        target=output/f"{entry['sha256'][:12]}-gallery-{start//9+1}.png"
        canvas.save(target)
        files.append(str(target.resolve()))
    index.append({'source':entry['original_path'],'sha256':entry['sha256'],'image_count':len(images),
                  'gallery_files':files,'unsupported_embedded_images':unsupported})
(output/'index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'unique_sources':len(index),'galleries':sum(len(x['gallery_files']) for x in index),
                  'unsupported_embedded_images':sum(len(x['unsupported_embedded_images']) for x in index)}))
