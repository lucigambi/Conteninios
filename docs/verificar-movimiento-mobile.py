from pathlib import Path
from playwright.sync_api import sync_playwright

url=(Path(__file__).resolve().parents[1]/'index.html').as_uri()
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    for mode in ['normal','paused','reduce','blocked']:
        context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce' if mode=='reduce' else 'no-preference')
        if mode=='paused': context.add_init_script("localStorage.setItem('conteninos-motion','paused')")
        if mode=='blocked':
            context.add_init_script('''const nativePlay=HTMLMediaElement.prototype.play;
              window.allowVideo=false;
              HTMLMediaElement.prototype.play=function(){return window.allowVideo?nativePlay.call(this):Promise.reject(new DOMException('Blocked','NotAllowedError'));};
              document.addEventListener('click',e=>{if(e.target.closest('.media-resume'))window.allowVideo=true;},true);''')
        page=context.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(url);page.wait_for_timeout(800)
        button=page.locator('[data-motion-toggle]')
        assert button.is_visible()
        if mode in ['paused','reduce']:
            assert button.get_attribute('aria-label')=='Activar animaciones'
            assert page.evaluate('ScrollTrigger.getAll().length')==0
            button.tap()
        video=page.locator('.hero-intro video')
        video.scroll_into_view_if_needed()
        if mode=='blocked':
            page.locator('.hero-intro .media-resume').wait_for(state='visible')
            page.locator('.hero-intro .media-resume').tap()
        page.wait_for_function('document.querySelector(".hero-intro video").currentTime>0.2')
        assert page.evaluate('ScrollTrigger.getAll().length')>0
        assert button.get_attribute('aria-label')=='Pausar animaciones'
        button.tap()
        assert video.evaluate('(v)=>v.paused')
        assert page.evaluate('ScrollTrigger.getAll().length')==0
        button.tap()
        page.wait_for_function('!document.querySelector(".hero-intro video").paused')
        page.locator('.alpha-preview-card').first.scroll_into_view_if_needed()
        page.wait_for_function('document.querySelector(".alpha-preview-card video").currentTime>0.2')
        assert not errors,errors
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        print(mode+': activar, pausar, scroll y videos OK',flush=True)
        context.close()
    browser.close()
