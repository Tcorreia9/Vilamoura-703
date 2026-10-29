/* Service worker: rede primeiro (revalida sempre), cache para offline. Build ce40265421 */
const CACHE = 'plano703-ce40265421';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'keys.json', 'payload.bin', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(CORE.map(async u => { try { const r = await fetch(u, { cache: 'reload' }); if (r.ok) await c.put(u, r); } catch (_) {} }));
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
function fetchTimeout(url, ms) {
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms);
  return fetch(url, { cache: 'no-cache', signal: ac.signal }).finally(() => clearTimeout(t));
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const net = await fetchTimeout(u.href, 5000);
      if (net.ok) c.put(r.mode === 'navigate' ? new Request(u.href) : r, net.clone());
      return net;
    } catch (err) {
      const m = (await c.match(r, { ignoreSearch: true })) || (r.mode === 'navigate' ? await c.match('./') : null);
      if (m) return m;
      throw err;
    }
  })());
});
