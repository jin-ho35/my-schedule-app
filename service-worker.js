const CACHE_NAME = "my-schedule-app-cache-v1";
const urlsToCache = [
  "/my-schedule-app/",
  "/my-schedule-app/index.html",
  "/my-schedule-app/checklist.html",
  "/my-schedule-app/calendar.html",
  "/my-schedule-app/view.html",
  "/my-schedule-app/app.js",
  "/my-schedule-app/manifest.json"
];

// インストール（初回起動時）
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// オフライン対応（キャッシュ優先）
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// 古いキャッシュの削除
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});
