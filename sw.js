// Service Worker for Quản Lý Hội Thánh & Ban Ngành PWA
const CACHE_NAME = 'qlht-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './ban-nganh.html',
  './thanh-trang.html',
  './manifest.json',
  './icons/icon.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('SW asset pre-cache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first for Google Apps Script API calls, Stale-while-revalidate for static assets
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Do not intercept or cache Google Script REST API endpoints
  if (url.includes('script.google.com') || url.includes('google.com/macros')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached or offline fallback
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
