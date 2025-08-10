
const CACHE = "reply-translator-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://unpkg.com/franc-min@6.2.0/min.js"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e=>{
  const req=e.request;
  if (req.url.includes("/translate")||req.url.includes("/detect")||req.url.includes("deepl.com")||req.url.includes("translation.googleapis.com")||req.url.includes("/v1/chat/completions")) {
    e.respondWith(fetch(req).catch(()=>caches.match(req)));
  } else {
    e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req, copy)); return res;}).catch(()=>cached)));
  }
});
