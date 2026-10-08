'use strict';
// Único lugar para definir el destino comercial. Vacío = aviso visible, sin enlace ficticio.
const CTA_URL = '';
const PERSONAJES = [
  {id:'charlie',name:'Charlie',quote:'Pregunta, observa y descubre.',description:'Lengua, Matemática y Ciencias Naturales mediante curiosidad, imaginación, libros y música.',short:'Lengua · Matemática · Ciencias',loop:'Charlie leyendo con auriculares entre pilas de libros.',loopTitle:'Cada libro abre una aventura.',scenes:[
    {code:'C13',title:'La semilla',text:'La pregunta nace frente a la maceta. El libro acompaña el seguimiento del crecimiento con dibujos de distintos días.',explore:'Observar cambios en una planta a lo largo del tiempo y explorar los cuidados que acompañan su crecimiento.'},
    {code:'C09',title:'Figuras geométricas',text:'Charlie combina piezas y prueba posiciones. La construcción vuelve visible un problema matemático cercano.',explore:'Reconocer formas geométricas sencillas y explorar cómo combinarlas para componer figuras.'}]},
  {id:'ed',name:'ED',quote:'Conoce el pasado porque estuvo allí.',description:'El pasado y el paso del tiempo, con recuerdos, cambios cotidianos y amistad.',short:'Historia · Memoria · Amistad',loop:'ED enamorado, con corazones, de noche.',loopTitle:'Hay recuerdos que se comparten.',scenes:[
    {code:'E01',title:'Historia de los juguetes',text:'Recreación ficcional de época: una plaza inspirada en el siglo XIX. ED comparte el trompo con sus amigos; el juego conecta pasado y presente.',explore:'Comparar un juego de antes con su práctica actual y reconocer que jugar juntos puede unir a distintas generaciones.'},
    {code:'E07',title:'Las cartas',text:'Una carta abre un recuerdo: el mensaje se escribe, se transporta y llega a otra persona. ED comparte una experiencia que vivió.',explore:'Comparar maneras de comunicarse a distancia en diferentes épocas y reconocer qué tienen en común.'}]},
  {id:'vamp',name:'Vamp',quote:'Explora lugares y formas de vivir.',description:'Lugares, paisajes, culturas y formas de vivir, integrando inclusión y respeto.',short:'Mundo · Culturas · Geografía',loop:'Vamp con anteojos de sol tocando la guitarra eléctrica.',loopTitle:'El mundo tiene muchos ritmos.',scenes:[
    {code:'V15',title:'Carnavales',text:'Vamp explora máscaras, vestuarios y música en un carnaval de barrio. La celebración permite conocer una forma de vida en comunidad.',explore:'Descubrir maneras de celebrar el carnaval mediante músicas, máscaras, vestuarios y encuentros comunitarios.'},
    {code:'V03',title:'Montañas, llanuras y costas',text:'Las montañas cambian el entorno del viaje. Vamp mira el relieve y encuentra nuevas personas y recorridos.',explore:'Observar y comparar rasgos visibles de diferentes paisajes, incorporando palabras para describirlos.'}]},
  {id:'alma',name:'Alma',quote:'Reconoce lo que siente y pide lo que necesita.',description:'Emociones, expresión de necesidades, cuidado y vínculos, con acompañamiento de los miedos cotidianos.',short:'Emociones · Cuidado · Vínculos',loop:'Alma flotando, come una galletita y toma leche.',loopTitle:'Sentir también es descubrir.',scenes:[
    {code:'A01',title:'Las emociones',text:'Frente al espejo y con tarjetas de emociones, Alma reconoce y nombra alegría, tristeza y enojo.',explore:'Reconocer y nombrar alegría, tristeza y enojo a partir de gestos y situaciones cotidianas.'},
    {code:'A16',title:'Puedo reparar un error',text:'Alma vuelca leche por accidente. Reconoce lo ocurrido y participa en una reparación concreta: limpiar la mesa con un paño.',explore:'Reconocer el efecto de una acción y proponer una reparación relacionada con lo ocurrido.'}]}
];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function picture(path,alt,sizes='(max-width: 900px) 85vw, 30vw') {
  return `<picture><source type="image/avif" srcset="${path}-400.avif 400w, ${path}-800.avif 800w, ${path}-1200.avif 1200w" sizes="${sizes}"><source type="image/webp" srcset="${path}-400.webp 400w, ${path}-800.webp 800w, ${path}-1200.webp 1200w" sizes="${sizes}"><img src="${path}.png" alt="${escapeHTML(alt)}" width="1672" height="941" loading="lazy"></picture>`;
}
function videoSlot(name,description,options={}) {
  const spec=options.teaser?'Con audio y controles · 1:1 · 2 a 4 MB':options.intro?'Mudo · Sin loop · 1:1':'Mudo · Loop · 1:1 · Menos de 1 MB';
  return `<div class="video-placeholder${options.teaser?' has-controls':''}" data-video="${name}" data-kind="${options.teaser?'teaser':options.intro?'intro':'loop'}"><div class="video-info"><span class="play-symbol" aria-hidden="true">▷</span><span class="mini-label">${options.teaser?'TEASER · 23 SEGUNDOS':'VIDEO POR INCORPORAR'}</span><strong>${name}.mp4</strong><p>${escapeHTML(description)}</p><p>${spec}</p><p class="poster-spec">Póster: ${name}.jpg</p></div></div>`;
}
const mobileQuery=matchMedia('(max-width:900px)');
const reducedQuery=matchMedia('(prefers-reduced-motion:reduce)');
// La preferencia del sistema manda hasta que se elige explícitamente un modo.
// Conservar esa elección evita volver al modo estático en cada recarga.
const MOTION_STORAGE_KEY='conteninos-motion';
let savedMotion=null;
try{savedMotion=localStorage.getItem(MOTION_STORAGE_KEY);}catch{}
let motionPaused=savedMotion==='paused';
let motionOverride=savedMotion==='active';
const isMotionReduced=()=>reducedQuery.matches&&!motionOverride;
const frameCache = new Map();
function preloadFrames(id) {
  if(frameCache.has(id))return;
  frameCache.set(id,Array.from({length:8},(_,n)=>{const im=new Image();im.src=`assets/img/giros/${id}/${id}-${String(n).padStart(2,'0')}.webp`;im.decode().catch(()=>{});return im;}));
}
function setFrame(section,n) {
  const index=((n%8)+8)%8;
  if(Number(section.dataset.frame)===index)return;
  section.dataset.frame=index;
  section.querySelector('.turn-image').src=`assets/img/giros/${section.id}/${section.id}-${String(index).padStart(2,'0')}.webp`;
  section.querySelector('.frame-number').textContent=`${String(index+1).padStart(2,'0')} / 08`;
}
function buildCharacters() {
  document.querySelector('#personajes').innerHTML=PERSONAJES.map((p,i)=>{
    const summaries={
      charlie:[['Lengua','Cuentos, rimas y juegos con palabras.'],['Matemática','Números y formas para jugar y construir.'],['Ciencias','Plantas, animales y pequeños descubrimientos.']],
      ed:[['Otros tiempos','Juguetes, escuelas y costumbres de antes.'],['Inventos','Cartas, trenes y objetos con historia.'],['Recuerdos','Música, culturas y amistades que crecen.']],
      vamp:[['Paisajes','Selvas, montañas y mundos bajo el agua.'],['Viajes','Mapas, transportes y formas de vivir.'],['Culturas','Fiestas, juegos y un lugar para todos.']],
      alma:[['Emociones','Reconocer y poner en palabras lo que sentimos.'],['Cuidado','Pedir ayuda, poner límites y encontrar calma.'],['Amistad','Compartir, escuchar y aprender a reparar.']]
    };
    return `<section class="character ${p.id} chapter" id="${p.id}" data-label="${p.name}" data-frame="0"><div class="character-inner">
      <div class="section-top"><p class="eyebrow">0${i+2} / EL MUNDO DE ${p.name.toUpperCase()}</p><span class="section-note">UNA MIRADA PROPIA PARA APRENDER</span></div>
      <div class="character-heading"><h2>${p.name}<span aria-hidden="true">.</span></h2><p>${p.quote}</p></div>
      <div class="character-stage">
        <div class="turntable"><img class="turn-image" src="assets/img/giros/${p.id}/${p.id}-00.webp" alt="Giro de ocho vistas de ${p.name}" width="420" height="610" loading="lazy" draggable="false"><div class="turn-controls"><button data-turn="-1" aria-label="Vista anterior de ${p.name}">‹</button><span class="frame-number">01 / 08</span><button data-turn="1" aria-label="Vista siguiente de ${p.name}">›</button></div><span class="turn-hint">${mobileQuery.matches?'DESLIZÁ SOBRE EL PERSONAJE':'GIRÁ CON EL SCROLL O LAS FLECHAS'}</span></div>
        <div class="character-content"><div class="content-types">${summaries[p.id].map(([title,text])=>`<article><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
          <div class="scene-grid">${p.scenes.map((scene,n)=>`<button class="scene-card" data-scene="${p.id}:${n}">${picture(`assets/img/escenas/${p.id}-escena-${n+1}`,scene.title)}<h3>${scene.title}</h3><span class="scene-more">Descubrí esta aventura ↗</span></button>`).join('')}</div>
          <details class="character-video"><summary>Conocé a ${p.name} en movimiento <span>+</span></summary>${videoSlot(`${p.id}-loop`,p.loop)}</details>
        </div>
      </div>
    </div></section>`;

  }).join('');
  document.querySelectorAll('.character').forEach(section=>{
    section.querySelectorAll('[data-turn]').forEach(b=>b.addEventListener('click',()=>{preloadFrames(section.id);setFrame(section,Number(section.dataset.frame)+Number(b.dataset.turn));}));
    let startX=0,startY=0;
    const img=section.querySelector('.turn-image');
    img.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX;startY=e.changedTouches[0].clientY;preloadFrames(section.id);},{passive:true});
    img.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>25&&Math.abs(dx)>Math.abs(dy))setFrame(section,Number(section.dataset.frame)+(dx<0?1:-1));},{passive:true});
  });
  const preloadObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){preloadFrames(e.target.id);preloadObserver.unobserve(e.target);}}),{rootMargin:'400px'});
  document.querySelectorAll('.character').forEach(s=>preloadObserver.observe(s));
}
buildCharacters();
document.querySelector('#intro-inline').innerHTML=videoSlot('intro-logo','Logo ensamblándose.',{intro:true});
document.querySelector('#teaser-slot').innerHTML=videoSlot('teaser','Teaser completo de 23 s. Cierra con «by FlexFlix.ai».',{teaser:true});

const dialog=document.querySelector('#detail-dialog');
let dialogReturnFocus;
function openDialog(html) {
  dialogReturnFocus=document.activeElement;
  document.querySelector('#dialog-content').innerHTML=html;
  dialog.showModal();document.body.style.overflow='hidden';
  dialog.querySelector('.dialog-close').focus();
  initVideos(dialog);window.syncMedia?.();
}
function closeDialog(){dialog.close();}
dialog.querySelector('.dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
dialog.addEventListener('close',()=>{dialog.querySelectorAll('video').forEach(v=>v.pause());document.body.style.overflow='';document.querySelector('#dialog-content').innerHTML='';dialogReturnFocus?.focus({preventScroll:true});window.syncMedia?.();});
document.addEventListener('click',e=>{
  const topic=e.target.closest('[data-topic]');
  if(topic){const t=TEMAS.find(t=>t.codigo===topic.dataset.topic);const p=PERSONAJES.find(p=>p.id===t.personaje);openDialog(`<p class="mini-label">${t.codigo} / ${p.name} / ${t.origen==='curricula'?'Currícula FlexFlix':'Propuesta'}</p><h2 id="dialog-title">${t.titulo}</h2><p>${t.descripcion}</p><p class="explore"><strong>${t.area}</strong><br>Una de las 18 ideas del mundo de ${p.name}.</p>`);dialog.setAttribute('aria-labelledby','dialog-title');}
  const scene=e.target.closest('[data-scene]');
  if(scene){const[id,n]=scene.dataset.scene.split(':');const p=PERSONAJES.find(p=>p.id===id),s=p.scenes[n];openDialog(`${picture(`assets/img/escenas/${id}-escena-${Number(n)+1}`,s.title,'80vw')}<p class="mini-label">${s.code} / ${p.name}</p><h2 id="dialog-title">${s.title}</h2><p>${s.text}</p><p class="explore"><strong>Explora</strong><br>${s.explore}</p>`);dialog.setAttribute('aria-labelledby','dialog-title');}
  if(e.target.closest('[data-intro]')){openDialog(`<h2 id="dialog-title">Una entrada con magia.</h2>${videoSlot('intro-logo','El logo se ensambla con piezas volando (0–3 s del teaser).',{intro:true})}`);dialog.setAttribute('aria-labelledby','dialog-title');}
});
document.querySelectorAll('[data-cta]').forEach(a=>{
  if(CTA_URL){a.href=CTA_URL;a.rel='noopener';}
  else a.addEventListener('click',e=>{e.preventDefault();openDialog('<p class="mini-label">CONTENIÑOS × FLEXFLIX</p><h2 id="dialog-title">El próximo paso empieza acá.</h2><p>El enlace de contacto todavía está por definir.</p><p class="explore">Esta propuesta está lista para conversar sobre el desarrollo de Conteniños con FlexFlix.</p>');dialog.setAttribute('aria-labelledby','dialog-title');});
});

let selectedCharacter='all',selectedOrigin='all',visiblePerCharacter=6;
const topicGrid=document.querySelector('#topic-grid');
function renderBank(animate=false){
  const oldRects=new Map([...topicGrid.children].map(el=>[el.dataset.topic,el.getBoundingClientRect()]));
  const filtered=TEMAS.filter(t=>(selectedCharacter==='all'||t.personaje===selectedCharacter)&&(selectedOrigin==='all'||t.origen===selectedOrigin));
  const counts={};
  const visible=filtered.filter(t=>{counts[t.personaje]=(counts[t.personaje]||0)+1;return counts[t.personaje]<=visiblePerCharacter;});
  topicGrid.innerHTML=visible.map(t=>`<button class="topic-card" data-topic="${t.codigo}" data-personaje="${t.personaje}"><span class="topic-card-top"><span>${t.codigo}</span><span>${PERSONAJES.find(p=>p.id===t.personaje).name.toUpperCase()}</span></span><h3>${t.titulo}</h3><span class="topic-card-bottom"><span>${t.origen==='curricula'?'● Currícula FlexFlix':'○ Propuesta'}</span><span aria-hidden="true">↗</span></span></button>`).join('');
  document.querySelector('#filter-count').textContent=`${visible.length} de ${filtered.length} temas${selectedCharacter==='all'?'':` · ${PERSONAJES.find(p=>p.id===selectedCharacter).name}`}`;
  document.querySelector('#more-topics').hidden=visible.length===filtered.length;
  if(animate&&!isMotionReduced()&&!motionPaused){
    [...topicGrid.children].forEach((el,i)=>{const old=oldRects.get(el.dataset.topic),now=el.getBoundingClientRect();el.animate(old?[{transform:`translate(${old.left-now.left}px,${old.top-now.top}px)`,opacity:.6},{transform:'translate(0,0)',opacity:1}]:[{transform:'translateY(16px)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:350,delay:Math.min(i*9,120),easing:'cubic-bezier(.2,.7,.3,1)'});});
  }
  window.refreshPresentation?.();
}
document.querySelectorAll('[data-character]').forEach(b=>b.addEventListener('click',()=>{selectedCharacter=b.dataset.character;visiblePerCharacter=6;document.querySelectorAll('[data-character]').forEach(x=>{const on=x===b;x.classList.toggle('active',on);x.setAttribute('aria-pressed',on);});renderBank(true);}));
document.querySelector('#origin-filter').addEventListener('change',e=>{selectedOrigin=e.target.value;visiblePerCharacter=6;renderBank(true);});
document.querySelector('#more-topics').addEventListener('click',()=>{visiblePerCharacter+=6;renderBank(true);});
mobileQuery.addEventListener('change',()=>{document.querySelectorAll('.turn-hint').forEach(el=>el.textContent=mobileQuery.matches?'DESLIZÁ SOBRE EL PERSONAJE':'GIRÁ CON EL SCROLL O LAS FLECHAS');renderBank();});
renderBank();

const videoObservers=[];
function initVideos(scope=document){
  scope.querySelectorAll('[data-video]:not([data-initialized])').forEach(slot=>{
    slot.dataset.initialized='true';
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      observer.disconnect();
      const name=slot.dataset.video,kind=slot.dataset.kind;
      const poster=new Image();poster.onload=()=>{poster.className='video-poster';poster.alt='';slot.prepend(poster);};poster.src=`assets/video/${name}.jpg`;
      const video=document.createElement('video');video.preload='metadata';video.playsInline=true;video.muted=kind!=='teaser';video.loop=kind==='loop';video.controls=false;video.setAttribute('aria-label',name==='teaser'?'Teaser de Conteniños':name==='intro-logo'?'Introducción del logo':`Animación de ${name.split('-')[0]}`);
      video.addEventListener('loadedmetadata',()=>{slot.classList.add('ready');poster.remove();if(kind==='teaser')addVideoControls(slot,video);syncMedia();},{once:true});
      video.addEventListener('error',()=>{video.remove();slot.dataset.missing='true';},{once:true});
      poster.addEventListener('load',()=>video.poster=poster.src,{once:true});
      slot.append(video);video.src=`assets/video/${name}.mp4`;video.load();
    }),{rootMargin:'150px'});
    observer.observe(slot);videoObservers.push(observer);
  });
}
initVideos();
function addVideoControls(slot,video){
  const bar=document.createElement('div');bar.className='video-toolbar';
  bar.innerHTML='<button class="video-play" aria-label="Reproducir teaser">▶</button><input type="range" min="0" max="1000" value="0" aria-label="Posición del teaser"><span class="video-time">0:00</span><button class="video-mute" aria-label="Silenciar teaser" aria-pressed="false">♪</button>';
  const big=document.createElement('button');big.className='video-big-play';big.setAttribute('aria-label','Reproducir teaser con audio');big.textContent='▶';
  slot.append(bar,big);
  const play=bar.querySelector('.video-play'),seek=bar.querySelector('input'),mute=bar.querySelector('.video-mute');
  const toggle=()=>video.paused?video.play().catch(()=>{}):video.pause();
  play.addEventListener('click',toggle);big.addEventListener('click',toggle);
  function update(){play.textContent=video.paused?'▶':'Ⅱ';play.setAttribute('aria-label',video.paused?'Reproducir teaser':'Pausar teaser');big.hidden=!video.paused;}
  video.addEventListener('play',update);video.addEventListener('pause',update);video.addEventListener('ended',update);
  video.addEventListener('timeupdate',()=>{seek.value=video.duration?Math.round(video.currentTime/video.duration*1000):0;bar.querySelector('.video-time').textContent=`${Math.floor(video.currentTime/60)}:${String(Math.floor(video.currentTime%60)).padStart(2,'0')}`;});
  seek.addEventListener('input',()=>{if(Number.isFinite(video.duration))video.currentTime=Number(seek.value)/1000*video.duration;});
  mute.addEventListener('click',()=>{video.muted=!video.muted;mute.textContent=video.muted?'×':'♪';mute.setAttribute('aria-label',video.muted?'Activar audio del teaser':'Silenciar teaser');mute.setAttribute('aria-pressed',video.muted);});
}
const lotties=[];
document.querySelectorAll('.flex-logo').forEach(container=>{
  container.innerHTML='<img src="assets/img/lottie/flexflix-logo-estatico.png" alt="by FlexFlix.ai" width="1000" height="160">';
  if(!window.lottie||!window.FLEXFLIX_LOGO)return;
  const layer=document.createElement('div');layer.className='lottie-layer';layer.setAttribute('aria-hidden','true');container.append(layer);
  const anim=lottie.loadAnimation({container:layer,renderer:'svg',loop:true,autoplay:false,animationData:JSON.parse(JSON.stringify(FLEXFLIX_LOGO)),rendererSettings:{preserveAspectRatio:'xMidYMid meet'}});
  anim.addEventListener('DOMLoaded',()=>syncMedia());
  lotties.push({container,anim,layer});
});
function inViewport(el){const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0&&r.height>0;}
function syncMedia(){
  const staticMode=isMotionReduced()||motionPaused||document.hidden;
  document.body.classList.toggle('ambient-inactive',staticMode||dialog.open||!inViewport(document.querySelector('.hero')));
  document.body.classList.toggle('closing-inactive',staticMode||dialog.open||!inViewport(document.querySelector('.closing')));
  lotties.forEach(({container,anim,layer})=>{const play=!staticMode&&!dialog.open&&inViewport(container);layer.hidden=!play;container.querySelector('img').style.opacity=play?'0':'1';play?anim.play():anim.pause();});
  document.querySelectorAll('video').forEach(v=>{
    const visible=inViewport(v)&&!v.closest('[aria-hidden="true"]')&&(!dialog.open||dialog.contains(v));
    if(!visible||staticMode)v.pause();else if(v.closest('[data-video]')?.dataset.kind!=='teaser'&&v.muted&&v.readyState>=1)v.play().catch(()=>{});
  });
}
window.syncMedia=syncMedia;
let mediaTick=false;
addEventListener('scroll',()=>{if(!mediaTick){mediaTick=true;requestAnimationFrame(()=>{syncMedia();mediaTick=false;});}},{passive:true});
document.addEventListener('visibilitychange',syncMedia);
function updateMotionControls(){
  const stopped=isMotionReduced()||motionPaused;
  document.body.classList.toggle('motion-paused',motionPaused);
  document.body.classList.toggle('motion-enabled',motionOverride&&!motionPaused);
  document.querySelectorAll('[data-motion-toggle]').forEach(button=>{
    button.setAttribute('aria-pressed',stopped);
    button.setAttribute('aria-label',stopped?'Activar animaciones':'Pausar animaciones');
    button.title=isMotionReduced()?'El sistema solicita movimiento reducido. Podés activar las animaciones para esta presentación.':stopped?'Activar animaciones':'Pausar animaciones';
    const label=button.querySelector('.motion-label');
    if(label)label.textContent=isMotionReduced()?'Movimiento reducido':motionPaused?'Movimiento pausado':'Movimiento activo';
    else button.textContent=stopped?'▷':'Ⅱ';
  });
}
document.querySelectorAll('[data-motion-toggle]').forEach(button=>button.addEventListener('click',()=>{
  if(isMotionReduced()){motionOverride=true;motionPaused=false;}else motionPaused=!motionPaused;
  if(!motionPaused)motionOverride=true;
  try{localStorage.setItem(MOTION_STORAGE_KEY,motionPaused?'paused':'active');}catch{}
  updateMotionControls();syncMedia();window.rebuildPresentation?.();
}));
reducedQuery.addEventListener('change',()=>{updateMotionControls();syncMedia();window.rebuildPresentation?.();});
updateMotionControls();
syncMedia();

// Desactivar el cierre accidental de las áreas en desktop; en móvil son acordeones nativos.
document.querySelectorAll('.area summary').forEach(summary=>summary.addEventListener('click',e=>{if(!mobileQuery.matches)e.preventDefault();}));
