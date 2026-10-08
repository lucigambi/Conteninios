"""Preparación reproducible. No modifica las grillas originales ni procesa video.
Uso: python procesar-assets.py [--aprobar-defringe]
Dependencias de preparación: Pillow, numpy, scipy (no son necesarias para el sitio).
"""
from pathlib import Path
import argparse, base64, json, re, shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parent
IMG = ROOT / 'assets/img'
NAMES = ['charlie', 'ed', 'vamp', 'alma']

def rename_assets():
    pairs = [('personajes/charlie.png','personajes/charlie-corriendo.png'),
             ('personajes/ed.png','personajes/ed-corriendo.png'),
             ('personajes/vamp.png','personajes/vamp-volando.png'),
             ('personajes/alma.png','personajes/alma-flotando.png'),
             ('personajes/personajes-transparente.png','personajes/personajes-grupo.png'),
             ('hero/Fondo.png','hero/hero-fondo.png'),('logo-conte/Logo.png','logo-conte/logo-conteninos.png')]
    for i, name in enumerate(NAMES):
        for j in range(2):
            pairs.append((f'escenas/Conteninos_FlexFlix_Temas_y_Trailer_3_Minutos-(1)-{10+i*2+j}.png',f'escenas/{name}-escena-{j+1}.png'))
    for a,b in pairs:
        if (IMG/a).exists() and not (IMG/b).exists():
            (IMG/a).rename(IMG/b)

def extract_data():
    text = (ROOT/'AGENTS.md').read_text(encoding='utf-8-sig')
    topics=[]
    for i,name in enumerate(NAMES):
        title = ['Charlie','ED','Vamp','Alma'][i]
        block=text.split(f'### {title} —')[1].split('\n### ')[0]
        area=''
        for line in block.splitlines():
            if line.startswith('**') and line.endswith('**'): area=line.strip('*')
            match=re.match(r'- ([CEVA]\d{2}) (.+?) \((Currícula|Propuesta)\): (.+)',line)
            if match:
                code,label,origin,description=match.groups()
                topics.append(dict(codigo=code,personaje=name,area=area,titulo=label,origen='curricula' if origin=='Currícula' else 'propuesta',descripcion=description))
    assert len(topics)==72
    assert sum(t['origen']=='curricula' for t in topics)==43
    (ROOT/'data').mkdir(exist_ok=True)
    (ROOT/'data/temas.js').write_text('window.TEMAS = '+json.dumps(topics,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')

def frames_for(name):
    arr=np.array(Image.open(IMG/f'giros/{name}-8-views-transparent.png').convert('RGBA'))
    alpha=arr[:,:,3]
    assert alpha.min()==0 and alpha.max()==255, f'{name}: no tiene alfa real'
    labels,count=ndimage.label(alpha>127)
    sizes=np.bincount(labels.ravel()); sizes[0]=0
    ids=np.argsort(sizes)[-8:]
    objects=ndimage.find_objects(labels)
    figures=[]
    for id in ids:
        sy,sx=objects[id-1]
        figures.append((id,sx.start,sy.start,sx.stop,sy.stop))
    figures.sort(key=lambda r:(r[2]+r[4])/2)
    figures=sorted(figures[:4],key=lambda r:r[1])+sorted(figures[4:],key=lambda r:r[1])
    # Associate semitransparent edge pixels to the closest solid component.
    near=ndimage.distance_transform_edt(alpha<=127,return_distances=False,return_indices=True)
    nearest=labels[tuple(near)]
    frames=[]; metrics=[]
    for id,x0,y0,x1,y1 in figures:
        assert min(x0,y0)>0 and x1<arr.shape[1] and y1<arr.shape[0],f'{name}: figura toca borde'
        feet=np.where((labels==id)&(np.indices(alpha.shape)[0]>=y1-int((y1-y0)*.15)))
        axis=int(round((feet[1].min()+feet[1].max())/2))
        margin=5
        lx=max(0,x0-margin); ty=max(0,y0-margin); rx=min(arr.shape[1],x1+margin); by=min(arr.shape[0],y1+margin)
        tile=arr[ty:by,lx:rx].copy()
        if name!='alma':
            keep=(nearest[ty:by,lx:rx]==id)
            tile[:,:,3]=np.where(keep,tile[:,:,3],0)
        # Alma: source alpha is copied exactly, without cleaning or defringe.
        frames.append((Image.fromarray(tile),axis-lx,y1-1-ty))
        metrics.append(dict(bbox=[x0,y0,x1,y1],axis=axis,floor=y1-1,scale=1))
    width=2*(max(max(axis,im.width-axis) for im,axis,floor in frames)+16)
    height=max(floor for im,axis,floor in frames)+32
    result=[]
    for im,axis,floor in frames:
        canvas=Image.new('RGBA',(width,height))
        canvas.paste(im,(width//2-axis,height-17-floor))
        result.append(canvas)
    return result,metrics

def defringe(im):
    a=np.array(im); alpha=a[:,:,3]
    solid=alpha>=245
    nearest=ndimage.distance_transform_edt(~solid,return_distances=False,return_indices=True)
    edge=(alpha>0)&(alpha<245)
    colors=a[:,:,:3][tuple(nearest)]
    a[:,:,:3][edge]=colors[edge]
    return Image.fromarray(a)

def contact(frames,path):
    w,h=220,290
    sheet=Image.new('RGB',(w*4,h*2),'#11162b'); draw=ImageDraw.Draw(sheet)
    for i,im in enumerate(frames):
        im=im.copy(); im.thumbnail((w-24,h-35))
        x=(i%4)*w+(w-im.width)//2; y=(i//4)*h+h-22-im.height
        sheet.paste(im,(x,y),im)
        draw.line(((i%4)*w,(i//4)*h+h-22,(i%4+1)*w,(i//4)*h+h-22),fill='#507c92')
        draw.text(((i%4)*w+12,(i//4)*h+8),f'{i:02}',fill='white')
    sheet.save(path)

def build_turns(approved):
    report={}
    for name in NAMES:
        out=IMG/'giros'/name; out.mkdir(exist_ok=True)
        frames,metrics=frames_for(name)
        if name=='vamp':
            before=frames[0]; after=defringe(before)
            # Explicit enlarged comparison before applying to all views.
            a=before.crop((0,0,before.width,int(before.height*.65)))
            b=after.crop((0,0,after.width,int(after.height*.65)))
            sample=Image.new('RGB',(a.width*4,a.height*2+32),'#18223d')
            for i,im in enumerate([a,b]):
                im=im.resize((im.width*2,im.height*2))
                sample.paste(im,(i*im.width,32),im)
            ImageDraw.Draw(sample).text((12,8),'ANTES                                      DESPUES (solo RGB del borde)',fill='white')
            sample.save(out/'defringe-comparacion.jpg')
            if approved: frames=[defringe(im) for im in frames]
        for i,im in enumerate(frames):
            im.save(out/f'{name}-{i:02}.png',optimize=True)
            im.save(out/f'{name}-{i:02}.webp',quality=88,method=6)
        contact(frames,out/'hoja-contacto.jpg')
        report[name]=metrics
    (ROOT/'docs/giros-mediciones.json').write_text(json.dumps(report,indent=2),encoding='utf-8')

def optimize():
    for folder in ['personajes','escenas','hero','logo-conte']:
        for path in (IMG/folder).glob('*.png'):
            im=Image.open(path)
            widths=[400,800,1200] if folder!='hero' else [800,1440,1920]
            for width in widths:
                width=min(width,im.width)
                size=(width,round(im.height*width/im.width))
                resized=im.resize(size,Image.Resampling.LANCZOS)
                for ext in ['webp','avif']:
                    target=path.with_name(f'{path.stem}-{width}.{ext}')
                    if not target.exists(): resized.save(target,quality=82 if ext=='webp' else 65)

def lottie():
    path=IMG/'lottie/flexflix-logo.json'
    data=json.loads(path.read_text(encoding='utf-8-sig'))
    for a in data.get('assets',[]):
        if 'p' in a and not a['p'].startswith('data:'):
            raw=(path.parent/'images'/a['p']).read_bytes()
            a['p']='data:image/png;base64,'+base64.b64encode(raw).decode()
            a['u']=''; a['e']=1
    (path.parent/'flexflix-logo.js').write_text('window.FLEXFLIX_LOGO = '+json.dumps(data,separators=(',',':'))+';',encoding='utf-8')
    pieces=[Image.open(path.parent/'images'/f'img_{n}.png').convert('RGBA') for n in range(7)]
    merged=Image.new('RGBA',pieces[0].size)
    for piece in pieces: merged=Image.alpha_composite(merged,piece)
    merged=merged.crop(merged.getbbox()); merged.thumbnail((1000,200))
    merged.save(path.parent/'flexflix-logo-estatico.png')

def social():
    old=IMG/'og-image.jpg'
    backup=IMG/'og-image-original.jpg'
    if old.exists() and not backup.exists(): shutil.copy2(old,backup)
    bg=Image.open(IMG/'hero/hero-fondo.png').convert('RGB').resize((1200,1074))
    bg=bg.crop((0,120,1200,750)).convert('RGBA')
    logo=Image.open(IMG/'logo-conte/logo-conteninos.png').convert('RGBA')
    logo=logo.crop(logo.getbbox()); logo.thumbnail((570,360))
    bg.alpha_composite(logo,(50,100))
    group=Image.open(IMG/'personajes/personajes-grupo.png').convert('RGBA'); group.thumbnail((540,580))
    bg.alpha_composite(group,(650,25))
    signature=Image.open(IMG/'lottie/flexflix-logo-estatico.png'); signature.thumbnail((400,100))
    bg.alpha_composite(signature,(110,470))
    bg.convert('RGB').save(old,quality=92)

if __name__=='__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--aprobar-defringe',action='store_true'); parser.add_argument('--solo-giros',action='store_true'); args=parser.parse_args()
    rename_assets(); build_turns(args.aprobar_defringe)
    if not args.solo_giros: extract_data(); optimize(); lottie(); social()
    print('Assets preparados; grillas originales conservadas.')
