'use strict';
(() => {
  const chapters=[...document.querySelectorAll('.chapter')];
  const header=document.querySelector('.site-header');
  let context,stops=[],scrollTween,refreshTimer,activeChapter=0;
  const motionAvailable=()=>!isMotionReduced()&&!motionPaused&&!!window.gsap&&!!window.ScrollTrigger;
  const animated=()=>!mobileQuery.matches&&motionAvailable();
  const naturalTop=el=>el.getBoundingClientRect().top+scrollY;
  function collectStops(){
    stops=chapters.map(section=>({y:naturalTop(section),section,stage:0}));
    const max=document.documentElement.scrollHeight-innerHeight;
    stops=stops.map(s=>({...s,y:Math.max(0,Math.min(max,s.y))}));
  }
  function updateChapter(){
    let i=0;
    chapters.forEach((s,n)=>{const r=s.getBoundingClientRect();if(r.top<=innerHeight*.4)i=n;});
    activeChapter=i;
    header.classList.toggle('light',!chapters[i].classList.contains('dark'));
    header.classList.toggle('scrolled',scrollY>16);
  }
  function go(y){
    scrollTween?.kill();
    if(!animated()){scrollTo({top:y,behavior:'instant'});return;}
    const position={y:scrollY};
    const distance=Math.abs(y-scrollY);
    scrollTween=gsap.to(position,{y,duration:Math.min(2.3,Math.max(.65,distance/2000)),ease:'power2.inOut',onUpdate:()=>scrollTo(0,position.y),onComplete:()=>{scrollTween=null;updateChapter();}});
  }
  function step(direction){
    collectStops();
    const target=direction>0?stops.find(s=>s.y>scrollY+8):[...stops].reverse().find(s=>s.y<scrollY-8);
    if(target)go(target.y);
    else if(direction>0)go(document.documentElement.scrollHeight-innerHeight);
  }
  document.addEventListener('keydown',e=>{
    if(mobileQuery.matches||dialog.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable],button,summary,video')||(e.code==='Space'&&e.target.closest('a')))return;
    let direction=0;
    if(e.code==='ArrowRight')direction=1;
    if(e.code==='ArrowLeft')direction=-1;
    if(direction){e.preventDefault();if(!scrollTween)step(direction);}
    if(e.code==='Home'){e.preventDefault();go(0);}
    if(e.code==='End'){e.preventDefault();go(document.documentElement.scrollHeight-innerHeight);}
  });
  addEventListener('wheel',()=>{scrollTween?.kill();scrollTween=null;},{passive:true});
  addEventListener('touchstart',()=>{scrollTween?.kill();scrollTween=null;},{passive:true});
  document.addEventListener('click',e=>{
    const anchor=e.target.closest('a[href^="#"]');
    if(!anchor||anchor.hasAttribute('data-cta')||anchor.classList.contains('skip'))return;
    const id=anchor.getAttribute('href').slice(1),target=document.getElementById(id);
    if(!target)return;
    e.preventDefault();collectStops();const stop=stops.find(s=>s.section===target);go(stop?stop.y:naturalTop(target));
  });
  function build(){
    scrollTween?.kill();scrollTween=null;
    context?.revert();
    if(motionAvailable()){
      gsap.registerPlugin(ScrollTrigger);
      context=gsap.context(()=>{
        if(animated()){
        document.querySelectorAll('.character').forEach(section=>{
          ScrollTrigger.create({trigger:section,start:'top top',end:'bottom top',
            onUpdate:self=>setFrame(section,Math.min(7,Math.floor(self.progress*8)))});
        });
        gsap.to('.hero .nebula',{y:100,scale:1.05,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
        gsap.to('.hero-world',{y:-65,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
        gsap.from('.hero-copy > *',{y:32,opacity:0,stagger:.13,duration:1,ease:'power2.out',clearProps:'transform,opacity'});
        gsap.from('.hero-character',{y:100,opacity:0,scale:.82,stagger:.16,duration:1.5,ease:'power3.out'});
        }
        const defaults={duration:.8,ease:'power2.out',clearProps:'transform,opacity'};
        const reveal=(target,offset=26)=>gsap.from(target,{...defaults,y:offset,opacity:0,scrollTrigger:{trigger:target,start:'top 92%',toggleActions:'restart none restart reset'}});
        document.querySelectorAll('.character').forEach(section=>{
          const stage=section.querySelector('.turntable');
          const heading=section.querySelector('.character-heading');
          const description=section.querySelector('.character-description');
          const cards=section.querySelectorAll('.content-types article');
          if(mobileQuery.matches){
            // Cada tarjeta espera a entrar en pantalla en la columna mobile.
            [stage,heading,description,...cards].forEach(el=>reveal(el,22));
          }else{
            gsap.timeline({defaults,scrollTrigger:{trigger:section,start:'top 78%',toggleActions:'restart none restart reset'}})
              .from(stage,{x:-30,y:18,opacity:0},0)
              .from(heading,{y:24,opacity:0},.15)
              .from(description,{y:20,opacity:0},.27)
              .from(cards,{y:35,opacity:0,stagger:.14},.4);
          }
        });
        if(mobileQuery.matches){
          reveal('.hero-intro',18);
          document.querySelectorAll('.hero-copy > *').forEach(el=>reveal(el,18));
        }
        document.querySelectorAll('.trailer-copy > *,#teaser-slot').forEach(el=>reveal(el,28));
        document.querySelectorAll('.footer-grid > *,.footer-bottom').forEach(el=>reveal(el,18));
      });
      ScrollTrigger.refresh();
    }
    collectStops();
    updateChapter();syncMedia();
  }
  window.rebuildPresentation=build;
  window.refreshPresentation=()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{if(motionAvailable())ScrollTrigger.refresh();collectStops();},100);};
  if(window.ScrollTrigger)ScrollTrigger.addEventListener('refresh',collectStops);
  let ticking=false;
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{updateChapter();ticking=false;});}},{passive:true});
  addEventListener('resize',()=>window.refreshPresentation());
  document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>{window.refreshPresentation();syncMedia();}));
  mobileQuery.addEventListener('change',build);
  const hero=document.querySelector('.hero');
  hero.addEventListener('pointermove',e=>{
    if(!animated()||e.pointerType!=='mouse')return;
    const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
    document.querySelectorAll('.hero-character').forEach(el=>gsap.to(el,{x:x*Number(el.dataset.depth),y:y*Number(el.dataset.depth),duration:.6,overwrite:'auto'}));
  });
  hero.addEventListener('pointerleave',()=>{if(animated())gsap.to('.hero-character',{x:0,y:0,duration:.7,overwrite:'auto'});});
  document.fonts.ready.then(build);
  addEventListener('load',()=>window.refreshPresentation());
  // Lectura de solo estado para las verificaciones automáticas.
  window.presentationState=()=>({stops:stops.map(s=>({id:s.section.id,stage:s.stage,y:s.y})),activeChapter,pins:[]});
})();
