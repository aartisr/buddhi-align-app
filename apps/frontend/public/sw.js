/* Buddhi Align PWA service worker — intentionally dependency-free. */
const CACHE_PREFIX = "buddhi-align";
const SHELL_CACHE = `${CACHE_PREFIX}-shell-v1`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v1`;
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/buddhi-align-icon.svg",
  "/buddhi-align-icon-maskable.svg",
];

const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin;
const isApiOrPrivateRoute = (url) => /\/(api|auth|admin|settings)(?:\/|$)/.test(url.pathname);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (await cache.match(request)) || (await caches.match("/offline.html"));
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => undefined);
  return cached || network || caches.match("/offline.html");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !isSameOrigin(request)) return;

  const url = new URL(request.url);
  if (isApiOrPrivateRoute(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (["style", "script", "image", "font", "audio", "video"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
