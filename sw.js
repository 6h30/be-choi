// Cache everything up front so the site also works without internet
const CACHE = 'be-choi-v6';
const FILES = ['./', 'index.html', 'style.css', 'core.js', 'games-a.js', 'games-b.js', 'games-c.js', 'shell.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(FILES);
    try { // the animal recordings listed in sounds/index.json (skipped quietly if absent)
      const r = await fetch('sounds/index.json');
      const list = await r.clone().json();
      await c.put('sounds/index.json', r);
      await Promise.all(list.map(m => c.add('sounds/' + m.file).catch(() => { })));
    } catch (_) { }
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
