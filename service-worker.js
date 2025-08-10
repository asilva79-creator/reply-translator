
const CACHE = "reply-translator-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://unpkg.com/franc-min@6.2.0/min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))  
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  // Network-first for API calls; cache-first for everything else
  if (req.url.includes("/translate") || req.url.includes("deepl.com") || req.url.includes("translation.googleapis.com") || req.url.includes("/v1/chat/completions")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        // Optionally cache new resources
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      }).catch(() => cached))
    );
  }
});
