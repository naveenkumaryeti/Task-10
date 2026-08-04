// Minimal service worker: caches the app shell so the site opens
// instantly on repeat visits and shows something usable if the network
// drops mid-browse. Intentionally simple — no complex cache strategies,
// just enough for a real "installable app" feel.
const CACHE_NAME = "quikkart-shell-v1";
const SHELL_FILES = [
  "index.html",
  "css/style.css",
  "js/demo-data.js",
  "js/api.js",
  "js/cart.js",
  "js/wishlist.js",
  "js/toast.js",
  "js/app.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Never cache API calls — always go to network for live data.
  if (event.request.url.includes("/api/")) return;

  // Network-first: always try to get the LATEST version first (so a
  // fresh deploy is never masked by a stale cache), only falling back
  // to the cached shell if the network is unreachable (offline).
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("index.html")))
  );
});
