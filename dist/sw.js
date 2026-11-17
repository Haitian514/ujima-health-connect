'use strict';
const CACHE='ujima-shell-real4';
const ASSETS=['./','./index.html','./styles.css?v=real4','./data.js?v=real4','./directory.js?v=real4','./geography.js?v=real4','./app.js?v=real4','./vendor/leaflet.js','./vendor/leaflet.css','./vendor/leaflet.markercluster.js','./vendor/MarkerCluster.css','./brand.svg','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','./icons/maskable-512.png','./vendor/supabase.js?v=real4','./supabase-client.js?v=real4'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(url=>new Request(url,{credentials:'same-origin',cache:'reload'})));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('ujima-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 // External map tiles and provider photos are never prefetched or stored in this app cache.
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){event.respondWith((async()=>{try{const response=await fetch(event.request);if(response.ok&&!response.redirected&&response.headers.get('content-type')?.includes('text/html')){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());}return response;}catch{return(await caches.match('./index.html'))||Response.error();}})());return;}
 const path=url.pathname.replace(self.registration.scope.replace(url.origin,''),'');if(!ASSETS.some(asset=>asset.replace('./','').split('?')[0]===path))return;
 event.respondWith((async()=>{const cached=await caches.match(event.request);return cached||fetch(event.request);})());
});
