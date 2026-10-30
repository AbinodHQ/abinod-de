/* The localized blog index is the single source for dated article cards. */
(() => {
  const homepage = document.querySelector('#blog .blog-grid');
  const listing = document.querySelector('.blog-grid');
  if (!listing) return;
  function published(cards) {
    const today = new Date().toISOString().slice(0, 10);
    return cards.filter(card => {
      const date = card.querySelector('time[datetime]')?.getAttribute('datetime');
      return /^\d{4}-\d{2}-\d{2}$/.test(date || '') && Number.isFinite(Date.parse(date)) && date <= today;
    }).sort((a, b) => b.querySelector('time').dateTime.localeCompare(a.querySelector('time').dateTime));
  }
  if (!homepage) {
    const cards = published([...listing.querySelectorAll(':scope > .blog-card')]);
    if (cards.length) listing.replaceChildren(...cards);
    return;
  }
  async function refresh() {
    try {
      const source = new URL('/blog/', location.origin);
      const response = await fetch(source, {cache: 'no-store', headers: {Accept: 'text/html'}});
      if (!response.ok) return;
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const cards = published([...doc.querySelectorAll('.blog-grid > .blog-card')]).slice(0, 2);
      if (!cards.length) return;
      for (const card of cards) {
        for (const node of [card, ...card.querySelectorAll('[href], [src]')]) {
          for (const attr of ['href', 'src']) {
            const value = node.getAttribute(attr);
            if (value) node.setAttribute(attr, new URL(value, source).href);
          }
        }
      }
      homepage.replaceChildren(...cards.map(card => document.importNode(card, true)));
    } catch { /* Keep server-delivered fallback cards when offline. */ }
  }
  refresh();
  window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
})();
