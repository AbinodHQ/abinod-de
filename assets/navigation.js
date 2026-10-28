(() => {
 const nav = document.querySelector('.primary-nav');
 if (!nav) return;
 const groups = [...nav.querySelectorAll('.nav-group')];
 const close = (except) => groups.forEach(group => {
   if (group === except) return;
   group.querySelector('button').setAttribute('aria-expanded','false');
   group.querySelector('.nav-panel').hidden = true;
 });
 const open = group => { close(group); group.querySelector('button').setAttribute('aria-expanded','true'); group.querySelector('.nav-panel').hidden = false; };
 const desktopHover = () => matchMedia('(hover:hover) and (min-width:1101px)').matches;
 groups.forEach(group => {
   const button = group.querySelector('button');
   button.addEventListener('click', event => { if(event.detail > 0 && desktopHover()) open(group); else button.getAttribute('aria-expanded') === 'true' ? close() : open(group); });
   group.addEventListener('pointerenter', () => { if(desktopHover()) open(group); });
   group.addEventListener('pointerleave', () => { if(desktopHover() && !group.contains(document.activeElement)) close(); });
   group.addEventListener('focusout', event => { if (!group.contains(event.relatedTarget)) close(); });
   button.addEventListener('keydown', event => { if(event.key === 'ArrowDown'){ event.preventDefault(); open(group); group.querySelector('a').focus(); } });
 });
 document.addEventListener('click', event => { if(!nav.contains(event.target)) close(); });
 document.addEventListener('keydown', event => {
   if(event.key !== 'Escape') return;
   const active = groups.find(group => group.querySelector('button').getAttribute('aria-expanded') === 'true');
   close();
   if(active) active.querySelector('button').focus();
   else if(document.body.classList.contains('menu-open')) { document.body.classList.remove('menu-open'); const toggle=document.querySelector('[data-menu-toggle]');toggle?.setAttribute('aria-expanded','false');toggle?.focus(); }
 });
 nav.addEventListener('click', event => { if(event.target.closest('a')){ close();document.body.classList.remove('menu-open');document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded','false'); } });
 matchMedia('(max-width:1100px)').addEventListener('change', () => {close();document.body.classList.remove('menu-open');document.querySelector('[data-menu-toggle]')?.setAttribute('aria-expanded','false');});
})();
