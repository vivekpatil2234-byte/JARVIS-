
const CACHE = "jarvis-v1";

const FILES = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method === "GET" &&
      new URL(event.request.url).origin === location.origin &&
      !new URL(event.request.url).pathname.startsWith("/api/")) {
    event.respondWith(
      caches.match(event.request).then(
        cached => cached || fetch(event.request)
      )
    );
  }
});
