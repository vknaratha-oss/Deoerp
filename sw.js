// DEOERP service worker — network-first (ไม่ cache ทับของใหม่)
const CACHE='deoerp-v1';
self.addEventListener('install', e=>{ self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()); });
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith((async()=>{
    try{
      const fresh=await fetch(e.request);
      // cache สำเนาไว้ใช้ตอนออฟไลน์เท่านั้น
      try{ const c=await caches.open(CACHE); c.put(e.request, fresh.clone()); }catch(_){}
      return fresh;
    }catch(err){
      const cached=await caches.match(e.request);
      if(cached) return cached;
      throw err;
    }
  })());
});
