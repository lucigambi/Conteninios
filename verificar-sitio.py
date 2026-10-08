"""Pruebas reales en Chrome, file:// y offline. Solo para desarrollo.
Uso: python verificar-sitio.py [--teclado]
Requiere playwright y Chrome instalado. No instala nada en el sitio final.
"""
from pathlib import Path
from io import BytesIO
import argparse, json
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parent
parser=argparse.ArgumentParser();parser.add_argument('--teclado',action='store_true');parser.add_argument('--compacto',action='store_true');args=parser.parse_args()
report={'resolutions':[],'errors':[],'external_requests':[],'interactions':{}}
if not args.teclado and (ROOT/'docs/verificacion.json').exists():
    previous=json.loads((ROOT/'docs/verificacion.json').read_text(encoding='utf-8'))
    if 'keyboard' in previous: report['keyboard']=previous['keyboard']
    if args.compacto:
        report=previous
        report['resolutions']=[r for r in report['resolutions'] if r['viewport']!=[1366,650]]

with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    resolutions=[(1366,650)] if args.compacto else [(1280,720),(1366,768),(1440,900),(1536,864),(1920,1080),(390,844),(1366,650)]
    for w,h in resolutions:
        context=browser.new_context(viewport={'width':w,'height':h},offline=True,device_scale_factor=1)
        page=context.new_page();errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.on('request',lambda req:report['external_requests'].append(req.url) if req.url.startswith(('http:','https:')) else None)
        page.goto((ROOT/'index.html').as_uri());page.wait_for_timeout(1400)
        page.evaluate('document.fonts.ready');page.wait_for_timeout(350)
        stops=page.evaluate('presentationState().stops')
        captures=[];checks=[]
        for stop in stops:
            page.evaluate('(y)=>window.scrollTo(0,y)',stop['y']);page.wait_for_timeout(550)
            if w<=900:
                page.wait_for_timeout(120)
            result=page.evaluate('''() => ({
                horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
                brokenImages:[...document.images].filter(i=>!i.closest('svg')&&i.loading!=='lazy'&&i.complete&&!i.naturalWidth).map(i=>i.getAttribute('src')),
                section:document.elementFromPoint(innerWidth/2,innerHeight/2)?.closest('.chapter')?.id,
                clipped:[...document.querySelectorAll('.pinned-character .stage-panel[aria-hidden="false"] button,.pinned-character .stage-panel[aria-hidden="false"] p,.pinned-character .stage-panel[aria-hidden="false"] .origin-key,.pinned-character .turn-controls,.pinned-character .character-heading')].filter(e=>{const sec=e.closest('.character-inner').getBoundingClientRect();if(Math.abs(sec.top)>2)return false;const r=e.getBoundingClientRect();return r.bottom>innerHeight-48||r.top<76}).map(e=>({class:e.className,bottom:e.getBoundingClientRect().bottom,top:e.getBoundingClientRect().top}))
            })''')
            result.update(id=stop['id'],stage=stop['stage']);checks.append(result)
            shot=page.screenshot();im=Image.open(BytesIO(shot)).convert('RGB');im.thumbnail((400,300) if w>900 else (195,422))
            captures.append((stop,im.copy()))
            if w==1366 and h==768 and (stop['id'] in ['inicio','charlie','alma','trailer','flexflix','cierre']):
                (ROOT/f'docs/revision-{stop["id"]}-{stop["stage"]}.png').write_bytes(shot)
        tw,th=(400,320) if w>900 else (195,450)
        sheet=Image.new('RGB',(tw*4,th*((len(captures)+3)//4)),'#d0d0d0');draw=ImageDraw.Draw(sheet)
        for i,(stop,im) in enumerate(captures):
            x=(i%4)*tw;y=(i//4)*th;sheet.paste(im,(x,y+22));draw.text((x+6,y+5),f'{w}x{h} {stop["id"]} / {stop["stage"]}',fill='black')
        sheet.save(ROOT/f'docs/revision-{w}x{h}.jpg',quality=90)
        report['resolutions'].append({'viewport':[w,h],'checks':checks,'errors':errors})
        print(f'{w}x{h}: {len(stops)} estados revisados, {len(errors)} errores JS',flush=True)
        if w==1366:
            page.locator('.bank-library > summary').click()
            # Combinaciones de filtros, detalle y CTA pendiente.
            page.locator('[data-character="charlie"]').click();page.locator('#origin-filter').select_option('curricula')
            report['interactions']['charlie_curricula']=page.locator('#topic-grid .topic-card').count()
            page.locator('[data-character="alma"]').click();page.locator('#origin-filter').select_option('propuesta')
            report['interactions']['alma_propuesta']=page.locator('#topic-grid .topic-card').count()
            page.locator('#topic-grid .topic-card').first.click();report['interactions']['topic_dialog']=page.locator('dialog').evaluate('(e)=>e.open')
            page.keyboard.press('Escape');report['interactions']['escape_close']=not page.locator('dialog').evaluate('(e)=>e.open')
            page.locator('[data-character="all"]').click();page.locator('#origin-filter').select_option('all')
            report['interactions']['all_topics']=page.locator('#topic-grid .topic-card').count()
            page.locator('[data-cta]').click();report['interactions']['cta_pending']=page.locator('dialog').inner_text().find('todavía está por definir')>=0;page.keyboard.press('Escape')
        if w==390:
            page.locator('.bank-library > summary').click()
            page.locator('#more-topics').scroll_into_view_if_needed();report['interactions']['mobile_initial']=page.locator('#topic-grid .topic-card').count()
            page.locator('#more-topics').click();report['interactions']['mobile_more']=page.locator('#topic-grid .topic-card').count()
            report['interactions']['mobile_no_pins']=page.locator('.pinned-character').count()==0
            page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(200);page.screenshot(path=str(ROOT/'docs/revision-mobile.png'))
        context.close()
    context=browser.new_context(viewport={'width':1366,'height':768},offline=True,reduced_motion='reduce')
    page=context.new_page();page.goto((ROOT/'index.html').as_uri());page.wait_for_timeout(700)
    report['reduced_motion']=page.evaluate('''()=>({pins:document.querySelectorAll('.pinned-character').length,hiddenPanels:document.querySelectorAll('.stage-panel[aria-hidden="true"]').length,cssAnimations:document.getAnimations().filter(a=>a.playState==='running').length,topics:document.querySelectorAll('#topic-grid .topic-card').length})''')
    page.locator('#charlie').scroll_into_view_if_needed();page.screenshot(path=str(ROOT/'docs/revision-reduced-motion.png'))
    context.close()
    if args.teclado:
        context=browser.new_context(viewport={'width':1366,'height':768},offline=True);page=context.new_page();page.goto((ROOT/'index.html').as_uri());page.wait_for_timeout(1600)
        stops=page.evaluate('presentationState().stops');forward=[];backward=[]
        for stop in stops[1:]:
            page.keyboard.press('ArrowRight');page.wait_for_timeout(2500)
            y=page.evaluate('scrollY');forward.append({'id':stop['id'],'stage':stop['stage'],'delta':round(y-stop['y'],2)})
        for stop in list(reversed(stops))[1:]:
            page.keyboard.press('ArrowLeft');page.wait_for_timeout(2500)
            y=page.evaluate('scrollY');backward.append({'id':stop['id'],'stage':stop['stage'],'delta':round(y-stop['y'],2)})
        report['keyboard']={'forward':forward,'backward':backward}
        print('Navegación completa por teclado revisada',flush=True);context.close()
    browser.close()
(ROOT/'docs/verificacion.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('Reporte: docs/verificacion.json',flush=True)
