// Goldblick Service Worker: App offline startbar, Kurse, News und Wikipedia-Abfragen immer live
const V='goldblick-v2';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{}))))); self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  const keep=u.origin===location.origin||['cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com','upload.wikimedia.org'].includes(u.hostname);
  if(!keep) return; // Kurse, News, Wikipedia-Abfragen: immer live, nie aus dem Cache
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(V).then(c=>c.put('index.html',cp)); return res; }).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok||res.type==='opaque'){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; })));
});
