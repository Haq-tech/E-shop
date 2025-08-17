const CACHE_NAME = 'e-shop-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/cart.html',
  '/checkout.html',
  '/product.html',
  '/wishlist.html',
  '/login.html',
  '/assets/css/style.css',
  '/assets/js/script.js',
  '/assets/images/images.jpeg',
  '/assets/images/images_2.jpeg',
  '/assets/images/images_3.jpeg',
  '/assets/images/splash.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
