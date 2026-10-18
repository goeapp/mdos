/* sw.js — M2 v1.0.1 · service worker mínimo (hace a M2 instalable y abre la app sin red)
   · Solo toca archivos del propio sitio (index, manifest, íconos): primero la red, si no hay, el caché.
   · Supabase, pdf.js, marked y las fuentes pasan directo (no se cachean acá).
   Al subir una versión nueva, cambiar CACHE para que se renueve. */
const CACHE = 'mdos-v1.0.1';
const BASE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mdos-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(r => {
      if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./')))
  );
});
