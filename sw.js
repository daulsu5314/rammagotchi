// 람마고치 서비스 워커: 한 번 열면 인터넷이 없어도 켜져요.
const VERSION='rammagotchi-v9';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./maskable-512.png','./apple-touch-icon.png','./qr.html','./qrcode.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // 게임 화면: 인터넷이 되면 최신 버전, 안 되면 저장해 둔 버전
  if(req.mode==='navigate'){const isGame=/\/(index\.html)?$/.test(url.pathname);e.respondWith(fetch(req).then(r=>{if(isGame&&r.ok){const cp=r.clone();caches.open(VERSION).then(c=>c.put('./index.html',cp))}return r}).catch(()=>isGame?caches.match('./index.html'):caches.match(req).then(h=>h||caches.match('./index.html'))));return}
  // 글꼴과 아이콘: 저장해 둔 것 먼저
  if(url.origin===location.origin||url.host.endsWith('fonts.googleapis.com')||url.host.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(VERSION).then(c=>c.put(req,cp))}return r})));
  }
});
