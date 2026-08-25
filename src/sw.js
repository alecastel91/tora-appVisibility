/**
 * TORA service worker (bundled by vite-plugin-pwa in injectManifest mode).
 * Same caching contract as the old generateSW config — shell precached,
 * API NEVER cached, Supabase media bounded cache-first — plus web push.
 */
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkOnly, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// SPA deep links → shell; never intercept the API.
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html'), {
  denylist: [/^\/api\//],
}));

// Backend API: always network — stale bookings/messages would lie.
registerRoute(
  ({ url }) => /^tora-backend-.*\.railway\.app$/.test(url.hostname),
  new NetworkOnly()
);

// Supabase storage media: immutable objects at unique URLs.
registerRoute(
  ({ url }) => url.hostname.endsWith('.supabase.co') && url.pathname.startsWith('/storage/'),
  new CacheFirst({
    cacheName: 'tora-media',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 3600 })],
  })
);

// ---- Web push ----
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { /* opaque payload */ }
  const title = data.title || 'TORA';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || 'You have a new notification',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    data: { url: data.url || '/' },
    tag: data.tag, // same-tag notifications collapse instead of stacking
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // App already open: focus it and let it navigate.
    for (const win of wins) {
      if ('focus' in win) {
        await win.focus();
        win.postMessage({ type: 'tora:push-navigate', url });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
