// DEOERP service worker — network-first (v2)
// แก้: ไม่แคชคำตอบที่ผิดพลาด (404/500) และไม่แคช config.js เลย
const CACHE='deoerp-v2';
self.addEventListener('install', e=>{ self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()); });
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const url=e.request.url||'';
  // config.js = ค่าตั้งค่าบริษัท ต้องสดเสมอ ห้ามแคช
  if(url.includes('config.js')){
    e.respondWith(fetch(e.request, {cache:'no-store'}).catch(()=>new Response('', {status:504})));
    return;
  }
  e.respondWith((async()=>{
    try{
      const fresh=await fetch(e.request);
      // แคชเฉพาะคำตอบที่สำเร็จจริง (ไม่แคช 404/500)
      if(fresh && fresh.ok && fresh.status===200){
        try{ const c=await caches.open(CACHE); c.put(e.request, fresh.clone()); }catch(_){}
      }
      return fresh;
    }catch(err){
      const cached=await caches.match(e.request);
      if(cached) return cached;
      throw err;
    }
  })());
});
