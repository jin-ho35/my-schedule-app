const CACHE_NAME = "app-cache-v3";

const APP_FILES = [
  "./index.html",
  "./calendar.html",
  "./view.html",
  "./checklist.html",
  "./app.js",
  "./manifest.json",
  "./icon.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) =>
            (name === "app-cache" || name.startsWith("app-cache-")) &&
            name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
