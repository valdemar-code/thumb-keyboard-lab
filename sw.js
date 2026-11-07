// Thumb Keyboard Lab PWA — muuta versiota, kun julkaiset uusia tiedostoja.
const CACHE_NAME = "thumb-keyboard-lab-v03";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("thumb-keyboard-lab-") && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});

// Online: always request newest version. Offline: use local cached copy.
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch (_) {
      const saved = await caches.match(request, {ignoreSearch: true});
      if (saved) return saved;
      if (request.mode === "navigate") {
        const fallback = await caches.match("./index.html");
        if (fallback) return fallback;
      }
      return new Response("Offline eikä tiedostoa ole tallennettu", {status: 503, headers: {"Content-Type":"text/plain; charset=utf-8"}});
    }
  })());
});
