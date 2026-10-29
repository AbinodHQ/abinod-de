(() => {
 const carousel=document.querySelector('[data-print-carousel]');
 if(!carousel)return;
 const track=carousel.querySelector('[data-print-track]');
 const slides=[...track.querySelectorAll('.print-slide')];
 if(slides.length<2)return;
 const dots=[...carousel.querySelectorAll('[data-print-dot]')];
 const prev=carousel.querySelector('[data-print-prev]'),next=carousel.querySelector('[data-print-next]');
 const pause=carousel.querySelector('[data-print-pause]'),status=carousel.querySelector('[data-print-status]');
 const de=document.documentElement.lang.startsWith('de');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const clone=slides[0].cloneNode(true);clone.setAttribute('aria-hidden','true');clone.inert=true;track.append(clone);
 const all=[...slides,clone];let index=0,timer,settle,paused=motion.matches,hover=false,focused=false,visible=true;
 const left=i=>all[i].offsetLeft-all[0].offsetLeft;
 function update(i){index=i;dots.forEach((d,n)=>d.setAttribute('aria-current',String(n===i%slides.length)));prev.disabled=false;next.disabled=false;}
 function schedule(){clearTimeout(timer);if(!paused&&!motion.matches&&!hover&&!focused&&visible&&!document.hidden)timer=setTimeout(()=>go(index+1,false),4500);}
 function go(i,announce=true){clearTimeout(timer);if(i<0)i=slides.length-1;if(i>slides.length)i=0;update(i);track.scrollTo({left:left(i),behavior:motion.matches?'instant':'smooth'});if(announce&&status)status.textContent=de?`Bild ${i%slides.length+1} von ${slides.length}`:`Slide ${i%slides.length+1} of ${slides.length}`;schedule();}
 function label(){pause.textContent=paused?(de?'Abspielen':'Play'):(de?'Pause':'Pause');pause.setAttribute('aria-label',paused?(de?'Automatischen Bildwechsel starten':'Start automatic slides'):(de?'Automatischen Bildwechsel pausieren':'Pause automatic slides'));}
 pause.addEventListener('click',()=>{paused=!paused;label();schedule();});
 prev.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(index+(e.key==='ArrowRight'?1:-1));}});
 track.addEventListener('scroll',()=>{clearTimeout(settle);settle=setTimeout(()=>{let i=all.reduce((best,s,n)=>Math.abs(left(n)-track.scrollLeft)<Math.abs(left(best)-track.scrollLeft)?n:best,0);if(i===slides.length){track.scrollTo({left:0,behavior:'instant'});i=0;}update(i);schedule();},160);},{passive:true});
 carousel.addEventListener('mouseenter',()=>{hover=true;schedule();});carousel.addEventListener('mouseleave',()=>{hover=false;schedule();});
 carousel.addEventListener('focusin',()=>{focused=true;schedule();});carousel.addEventListener('focusout',e=>{focused=carousel.contains(e.relatedTarget);schedule();});
 document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',()=>{paused=motion.matches;label();schedule();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(carousel);
 new ResizeObserver(()=>{track.scrollTo({left:left(index),behavior:'instant'});}).observe(track);
 update(0);label();schedule();
})();
