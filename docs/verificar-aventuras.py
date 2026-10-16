from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
report = []
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    for w,h in [(1280,720),(1366,650),(1366,768),(1440,900),(1536,864),(1920,1080),(320,740),(360,800),(390,844),(430,932),(768,1024)]:
        context = browser.new_context(viewport={'width':w,'height':h}, offline=True,device_scale_factor=2 if w<=900 else 1,is_mobile=w<=900,has_touch=w<=900)
        page = context.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto((ROOT/'index.html').as_uri())
        page.evaluate('document.fonts.ready')
        page.locator('#aventuras').evaluate('(e)=>window.scrollTo(0,e.offsetTop)')
        for person in ['charlie','ed','vamp','alma']:
            tab=page.locator('#adventure-tab-'+person)
            tab.tap() if w<=900 else tab.click()
            page.wait_for_timeout(220)
            panel=page.locator('#adventure-panel-'+person)
            panel.locator('img').evaluate_all('(imgs)=>Promise.all(imgs.map(i=>i.decode()))')
            check=page.evaluate('''()=>{
                const section=document.querySelector('#aventuras');
                const panel=section.querySelector('[role=tabpanel]:not([hidden])');
                return {overflow:document.documentElement.scrollWidth>innerWidth,
                  bottom:section.getBoundingClientRect().bottom,
                  links:panel.querySelectorAll('a').length,
                  cardLinks:panel.querySelectorAll('figure a,figure button').length,
                  cta:panel.querySelector('a').href===CTA_URL,
                  broken:[...panel.querySelectorAll('img')].filter(i=>!i.naturalWidth).length,
                  sources:[...panel.querySelectorAll('img')].map(i=>i.currentSrc),
                  tabs:[...section.querySelectorAll('[role=tab]')].every(t=>t.getBoundingClientRect().width>=44&&t.getBoundingClientRect().height>=44),
                  panels:section.querySelectorAll('[role=tabpanel]:not([hidden])').length};
            }''')
            assert check['tabs'] and all(src.endswith(('.webp','.avif')) for src in check['sources'])
            assert not check['overflow'] and not check['broken'] and check['cta'] and check['panels']==1 and check['cardLinks']==0,check
            if w>900: assert check['bottom']<=h+2,check
            if (w,h)==(1366,768) or w in [320,390,768]:
                page.locator('#aventuras').screenshot(style='.site-header,.skip{visibility:hidden!important}',path=str(ROOT/f'docs/aventuras-{person}-{w}.png'))
            report.append({'viewport':[w,h],'person':person,**check})
        page.locator('#adventure-tab-charlie').focus()
        page.keyboard.press('ArrowRight')
        assert page.locator('#adventure-tab-ed').get_attribute('aria-selected')=='true'
        page.keyboard.press('End')
        assert page.locator('#adventure-tab-alma').get_attribute('aria-selected')=='true'
        page.keyboard.press('Home')
        assert page.locator('#adventure-tab-charlie').get_attribute('aria-selected')=='true'
        assert not errors,errors
        print(f'{w}x{h}: cuatro solapas, enlaces, imágenes y teclado OK',flush=True)
        context.close()
    context=browser.new_context(viewport={'width':1366,'height':768},offline=True,reduced_motion='reduce')
    page=context.new_page();page.goto((ROOT/'index.html').as_uri())
    page.locator('#adventure-tab-vamp').click()
    assert page.locator('#adventure-panel-vamp').is_visible()
    print('Reduced motion OK',flush=True)
    browser.close()
(ROOT/'docs/verificacion-aventuras.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
