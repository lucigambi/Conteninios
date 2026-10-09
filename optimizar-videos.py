"""Copias web con alfa; conserva los MOV. Uso: python optimizar-videos.py RUTA_FFMPEG"""
from pathlib import Path
import json
import subprocess
import sys
from PIL import Image

root = Path(__file__).resolve().parent
ffmpeg = sys.argv[1]
report = []
for character in ('CHARLIE', 'ED', 'VAMP', 'ALMA'):
    source = root / 'assets/video' / f'{character} (landing).mov'
    output = source.with_name(f'{character.lower()}-alpha.webm')
    poster = source.with_name(f'{character.lower()}-alpha.png')
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
                    '-map', '0:v:0', '-an', '-vf', 'fps=24,scale=640:640:flags=lanczos',
                    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '34',
                    '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-threads', '4',
                    '-auto-alt-ref', '0', str(output)], check=True)
    subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(source),
                    '-frames:v', '1', '-vf', 'scale=640:640', '-pix_fmt', 'rgba',
                    str(poster)], check=True)
    web_poster = poster.with_suffix('.webp')
    Image.open(poster).save(web_poster, quality=85, method=6)
    row = {'personaje': character, 'original_bytes': source.stat().st_size,
           'web_bytes': output.stat().st_size, 'poster_bytes': web_poster.stat().st_size}
    report.append(row)
    print(json.dumps(row), flush=True)
(root / 'docs/videos-alpha-pesos.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
