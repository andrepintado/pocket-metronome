importScripts('./version.js');

const CACHE_NAME = `metronome-v${VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/version.js',
  // Language files
  '/lang/en.json',
  '/lang/es.json',
  '/lang/fr.json',
  '/lang/de.json',
  '/lang/pt-BR.json',
  '/lang/pt-PT.json',
  // Voice samples
  '/voice/1.wav',
  '/voice/2.wav',
  '/voice/3.wav',
  '/voice/4.wav',
  '/voice/5.wav',
  '/voice/6.wav',
  '/voice/7.wav',
  '/voice/8.wav',
  '/voice/9.wav',
  '/voice/10.wav',
  '/voice/11.wav',
  '/voice/12.wav',
  '/voice/13.wav',
  '/voice/14.wav',
  '/voice/15.wav',
  '/voice/16.wav',
  '/voice/17.wav',
  '/voice/18.wav',
  '/voice/19.wav',
  '/voice/20.wav',
  '/voice/21.wav',
  '/voice/22.wav',
  '/voice/23.wav',
  '/voice/24.wav',
  '/voice/25.wav',
  '/voice/26.wav',
  '/voice/27.wav',
  '/voice/28.wav',
  '/voice/29.wav',
  '/voice/30.wav',
  '/voice/31.wav',
  '/voice/32.wav'
];

// Message handler for skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  return self.clients.claim();
});
