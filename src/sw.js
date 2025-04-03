
// Service Worker for Reels Counter App
const CACHE_NAME = 'reels-counter-cache-v2';
const APP_TITLE = 'Reels Counter';
const AUTHOR = 'Lucky Yaduvanshi';
const WEBSITE = 'miniai.online';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/1bba0a93-769e-42c9-be4d-603a33e840e4.png'
];

// Counter state
let isTracking = false;
let trackingInterval = 30; // seconds
let trackingTimer = null;

// Install event - cache important assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and content');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  
  // Immediately claim clients to take control
  return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone();
      
      return fetch(fetchRequest).then((response) => {
        // Check for valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response because it's a one-time use stream
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Fallback for image requests
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return caches.match('/placeholder.svg');
        }
      });
    })
  );
});

// Helper function to update counter in main app
const updateReelsCounter = () => {
  if (!isTracking) return;
  
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_UPDATE',
        timestamp: new Date().toISOString()
      });
    });
  });
  
  // If there's no active client, store the updates for when app opens
  if (self.indexedDB) {
    // We could store pending updates in IndexedDB here
    // but for simplicity we just continue tracking
  }
};

// Background sync for offline changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reels-data') {
    console.log('[Service Worker] Background sync triggered');
    
    // We could implement more complex sync logic here
    updateReelsCounter();
  }
});

// Push notification listener
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const data = event.data.json();
  
  self.registration.showNotification(APP_TITLE, {
    body: data.message || 'New notification from Reels Counter',
    icon: '/lovable-uploads/1bba0a93-769e-42c9-be4d-603a33e840e4.png',
    badge: '/lovable-uploads/1bba0a93-769e-42c9-be4d-603a33e840e4.png',
    data: {
      url: self.location.origin
    }
  });
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Open the app and focus it
  event.waitUntil(
    self.clients.matchAll({type: 'window'}).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow(event.notification.data.url || '/');
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'UPDATE_COUNTER') {
    // Handle counter updates in the background
    isTracking = event.data.tracking;
    
    if (event.data.interval) {
      trackingInterval = event.data.interval;
    }
    
    // Clear existing timer
    if (trackingTimer) {
      clearInterval(trackingTimer);
      trackingTimer = null;
    }
    
    // Set up new timer if tracking is active
    if (isTracking) {
      trackingTimer = setInterval(() => {
        updateReelsCounter();
      }, trackingInterval * 1000);
      
      console.log(`[Service Worker] Tracking started with interval ${trackingInterval}s`);
    } else {
      console.log('[Service Worker] Tracking stopped');
    }
  }
});

// Periodic background sync (if supported by browser)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'reels-counter-daily-sync') {
    console.log('[Service Worker] Periodic sync');
    
    // Check for day change and prepare for reset
    // This would be handled by the main app when it opens
  }
});

console.log(`[Service Worker] Initialized - ${APP_TITLE} by ${AUTHOR} (${WEBSITE})`);
