"""Genera variantes locales WebP/AVIF sin modificar los PNG originales.
Uso: python optimizar-aventuras.py
"""
from pathlib import Path
import json
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent
IMG = ROOT / 'assets/img'
GROUPS = [('thumbs', '*.png', (320,640,960,1280)),
          ('personajes', '*Thumbs.png', (320,640,960)),
          ('iconos', '*circulo.png', (96,192)),
          ('fondos', '*sintesis.png', (360,627))]
report = []
for folder, pattern, widths in GROUPS:
    for original in sorted((IMG/folder).glob(pattern)):
        with Image.open(original) as source:
            source = ImageOps.exif_transpose(source).convert('RGBA')
            variants = []
            for width in widths:
                if width > source.width:
                    continue
                resized = source.resize((width,round(source.height*width/source.width)),Image.Resampling.LANCZOS)
                for fmt, quality in [('webp',84),('avif',65)]:
                    dest = original.with_name(f'{original.stem}-{width}.{fmt}')
                    if not dest.exists() or dest.stat().st_mtime < original.stat().st_mtime:
                        resized.save(dest, quality=quality, **({'method':6} if fmt=='webp' else {'speed':6}))
                    variants.append({'file':str(dest.relative_to(ROOT)), 'bytes':dest.stat().st_size,'width':width})
            report.append({'original':str(original.relative_to(ROOT)), 'bytes':original.stat().st_size,'variants':variants})
    print(f'{folder}: listo',flush=True)
(ROOT/'docs/optimizacion-aventuras.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(report)} originales conservados; variantes generadas.')
