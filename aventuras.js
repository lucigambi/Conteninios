'use strict';
(() => {
  const section = document.querySelector('#aventuras');
  const stories = [
    {id:'charlie',name:'Charlie',portrait:'Charlie-Thumbs.png',background:'Charlie',speech:'¿Qué descubrimos hoy?',tagline:'Cada pregunta, una aventura.',heading:'El pequeño mundo de las abejas',videos:[['ABEJAS_Charlie.png','Abejas'],['FIGURAS-GEOMÉTRICAS_Charlie.png','Figuras geométricas'],['OBRAS-DE-TEATRO_Charlie.png','Obras de teatro']]},
    {id:'ed',name:'ED',portrait:'ED-Thumbs.png',background:'ED',speech:'¿Viajamos en el tiempo?',tagline:'Cada recuerdo, una aventura.',heading:'Juegos que viajan en el tiempo',videos:[['HISTORIA-DE-LOS-JUGUETES_Ed.png','Historia de los juguetes'],['PIRÁMIDES-DE-EGIPTO_Ed.png','Pirámides de Egipto'],['HISTORIA-DE-LA-ANIMACIÓN_Ed.png','Historia de la animación']]},
    {id:'vamp',name:'Vamp',portrait:'Vamp-Thumbs.png',background:'Vamp',speech:'¿Adónde vamos hoy?',tagline:'Cada viaje, una sorpresa.',heading:'Un viaje a las islas Galápagos',videos:[['ISLAS-GALÁPAGOS_Vamp.png','Islas Galápagos'],['LOS-MEDIOS-DE-TRANSPORTE_Vamp.png','Los medios de transporte'],['MI-COLMILLO-ES-DIFERENTE_Vamp.png','Mi colmillo es diferente']]},
    {id:'alma',name:'Alma',portrait:'Alma - Thumbs.png',background:'Alma',speech:'¿Cómo te sentís hoy?',tagline:'Cada emoción, algo para compartir.',heading:'Un mundo de emociones por descubrir',videos:[['LAS-EMOCIONES_Alma.png','Las emociones'],['EL-DIÁLOGO_Alma.png','El diálogo'],['QUIERES-JUGAR-CONMIGO_Alma.png','¿Quieres jugar conmigo?']]}
  ];
  const asset = (folder, file) => `assets/img/${folder}/${encodeURIComponent(file)}`;
  function responsive(folder,file,widths,alt,sizes,width,height) {
    const stem=file.replace(/\.png$/i,'');
    const srcset=ext=>widths.map(w=>`${asset(folder,`${stem}-${w}.${ext}`)} ${w}w`).join(', ');
    return `<picture><source type="image/avif" srcset="${srcset('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${srcset('webp')}" sizes="${sizes}"><img src="${asset(folder,`${stem}-${widths[1]}.webp`)}" alt="${escapeHTML(alt)}" width="${width}" height="${height}" sizes="${sizes}" loading="lazy" decoding="async"></picture>`;
  }
  const portraits={charlie:[1145,1374],ed:[1024,1536],vamp:[1199,1312],alma:[1024,1536]};
  const background=(name,width)=>`image-set(url("${asset('fondos',`${name} - fondo sintesis-${width}.avif`)}") type("image/avif"),url("${asset('fondos',`${name} - fondo sintesis-${width}.webp`)}") type("image/webp"))`;
  section.querySelector('.adventure-tabs').innerHTML = stories.map((s,i)=>`<button type="button" role="tab" id="adventure-tab-${s.id}" aria-controls="adventure-panel-${s.id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-story="${s.id}">${responsive('iconos',s.name+'-circulo.png',[96,192],'','62px',56,56)}${s.name}</button>`).join('');
  const card = ([file,title], featured) => `<figure class="adventure-card${featured?' adventure-featured':''}" aria-label="${escapeHTML(title)}">${responsive('thumbs',file,[320,640,960,1280],title,featured?'(max-width: 900px) calc(100vw - 44px), 42vw':'(max-width: 480px) calc(100vw - 44px), (max-width: 900px) 45vw, 26vw',1280,718)}<figcaption><span>${escapeHTML(title)}</span><span class="adventure-play" aria-hidden="true">▶</span></figcaption></figure>`;
  section.querySelector('.adventure-panels').innerHTML = stories.map((s,i)=>`<div class="adventure-panel" role="tabpanel" id="adventure-panel-${s.id}" aria-labelledby="adventure-tab-${s.id}" tabindex="0"${i?' hidden':''}>
    <div class="adventure-friend" style='--friend-background:${background(s.background,627)};--friend-background-mobile:${background(s.background,360)}' ><div class="adventure-portrait">${responsive('personajes',s.portrait,[320,640,960],`${s.name} te invita a descubrir una aventura`,'(max-width: 900px) 300px, 28vw',...portraits[s.id])}<p class="adventure-speech">${s.speech}</p></div><p class="adventure-tagline">${s.tagline}</p></div>
    <div class="adventure-main">${card(s.videos[0],true)}<h3>${s.heading}</h3><a class="adventure-cta" href="${CTA_URL}">Descubrí esta aventura <span aria-hidden="true">↗</span></a></div>
    <div class="adventure-secondary">${s.videos.slice(1).map(v=>card(v,false)).join('')}</div>
  </div>`).join('');
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  function select(tab, focus=false) {
    tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});
    section.dataset.friend=tab.dataset.story;
    if(focus)tab.focus({preventScroll:true});
    window.refreshPresentation?.();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',e=>{
      const next=e.key==='ArrowRight'?(i+1)%tabs.length:e.key==='ArrowLeft'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;
      if(next===null)return;e.preventDefault();e.stopPropagation();select(tabs[next],true);
    });
  });
  select(tabs[0]);
})();
