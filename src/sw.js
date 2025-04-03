
// Service Worker for Reels Counter App
const CACHE_NAME = 'reels-counter-cache-v1';

// Install event - cache important assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192x192.png',
        '/icon-512x512.png'
      ]);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Background sync for offline changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reels-data') {
    // Sync data when back online
    console.log('Background sync triggered');
  }
});

// Push notification listener
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  self.registration.showNotification('Reels Counter', {
    body: data.message,
    icon: '/icon-192x192.png'
  });
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_COUNTER') {
    // Handle counter updates in the background
    console.log('Received counter update in SW:', event.data);
  }
});
