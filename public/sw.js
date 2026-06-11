const CACHE_VERSION = 'v1.0.4'; // Increment this version when you deploy updates
const CACHE_NAME = `tiffica-cache-${CACHE_VERSION}`;

// Assets to cache - only existing files
const urlsToCache = [
  '/',
  '/home',
  '/manifest.json',
  '/logo.jpeg'
];

self.addEventListener('install', event => {
  console.log('[SW] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        // Cache files one by one to avoid failures
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn('[SW] Failed to cache:', url, err);
              return Promise.resolve(); // Continue even if one fails
            });
          })
        );
      })
      .then(() => self.skipWaiting()) // Force activation immediately
      .catch(err => {
        console.error('[SW] Cache installation failed:', err);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim(); // Take control of all pages immediately
    })
  );
});

// Network-first strategy for API calls
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // API calls - always fetch from network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Network error' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Skip caching large files (APKs, etc)
  if (url.pathname.endsWith('.apk') || url.pathname.endsWith('.ipa')) {
    event.respondWith(fetch(request).catch(() => {
      return new Response('Download failed', { status: 503 });
    }));
    return;
  }

  // For other requests, try network first, then cache
  event.respondWith(
    fetch(request)
      .then(response => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Don't cache if request scheme is not http(s)
        try {
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the fetched response
          caches.open(CACHE_NAME).then(cache => {
            try {
              cache.put(request, responseToCache).catch(err => {
                console.warn('[SW] Cache put failed:', err);
              });
            } catch (err) {
              console.warn('[SW] Cache put error:', err);
            }
          });
        } catch (err) {
          console.warn('[SW] Response clone error:', err);
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(request).then(cachedResponse => {
          // Return cached response or offline page
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return offline response for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/home').then(response => {
              return response || new Response('Offline - please check your connection', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
          }
          
          // For other requests, return a generic error response
          return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  let data = { title: 'Tiffica', body: 'You have a new notification' };
  try { 
    data = JSON.parse(event.data.text()); 
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
  }

  const typeIcons = { offer: '🎁', order: '📦', alert: '⚠️', info: 'ℹ️' };
  const icon = typeIcons[data.type] || 'ℹ️';

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.jpeg',
      badge: '/logo.jpeg',
      tag: data.notifId || 'tiffica-notif',
      data: { url: '/home' },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/home';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  
  // Handle cache version updates
  if (event.data?.type === 'UPDATE_CACHE_VERSION') {
    const newVersion = event.data.version;
    console.log('[SW] Updating cache version to:', newVersion);
    // Cache will be invalidated on next page load/activation
  }
});
