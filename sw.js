/**
 * sw.js — Service Worker
 * Cache-first for static assets; stale-while-revalidate for navigation.
 * Update SHELL_VERSION to bust the cache on new deployments.
 */

'use strict';

const SHELL_VERSION = 'v1.25'; /* manually bumped with each deployment */
const SHELL_CACHE = `vedaversity-shell-${SHELL_VERSION}`;
const RUNTIME_CACHE = 'vedaversity-runtime';

// Tier 1: small, known, core files — safe to precache in full
/**
 * Deployment base.
 * Works correctly both from localhost and GitHub Pages subdirectories.
 */
const BASE = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/'));

const ASSETS = [
  BASE + '/index.html', /* SPA landing and main page */
  BASE + '/site.webmanifest',
  BASE + '/favicon.ico',
  BASE + '/css/dependencies/offline-onsenui.css',
  BASE + '/css/fonts.css',
  BASE + '/css/styles.css',
  BASE + '/css/dependencies/ios-safe-area-fix-v2.css',
  BASE + '/fonts/gentium-plus-v2-latin-ext-700.woff2',
  BASE + '/fonts/gentium-plus-v2-latin-ext-700italic.woff2',
  BASE + '/fonts/gentium-plus-v2-latin-ext-italic.woff2',
  BASE + '/fonts/gentium-plus-v2-latin-ext-regular.woff2',
  BASE + '/fonts/nunito-v32-latin-ext-700.woff2',
  BASE + '/fonts/nunito-v32-latin-ext-700italic.woff2',
  BASE + '/fonts/nunito-v32-latin-ext-italic.woff2',
  BASE + '/fonts/nunito-v32-latin-ext-regular.woff2',
  BASE + '/fonts/noto-serif-v33-latin-ext-regular.woff2',
  BASE + '/fonts/noto-serif-v33-latin-ext-italic.woff2',
  BASE + '/fonts/noto-serif-v33-latin-ext-700.woff2',
  BASE + '/fonts/noto-serif-v33-latin-ext-700italic.woff2',
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-600.woff2',
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-600italic.woff2',
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-italic.woff2',
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-regular.woff2',
  BASE + '/fonts/charis-sil-v2-latin-ext-italic.woff2',
  BASE + '/fonts/charis-sil-v2-latin-ext-regular.woff2',
  BASE + '/fonts/tiro-devanagari-sanskrit-v7-latin-ext-italic.woff2',
  BASE + '/fonts/tiro-devanagari-sanskrit-v7-latin-ext-regular.woff2',
  BASE + '/img/icons/apple-touch-icon.png',
  BASE + '/img/icons/nitaig.png',
  BASE + '/img/icons/radhak.png',
  BASE + '/img/icons/sgaura.png',
  BASE + '/img/icons/skrsna.png',
  BASE + '/img/icons/snitai.png',
  BASE + '/img/icons/sradha.png',
  BASE + '/img/icons/ssguru.png',
  BASE + '/img/icons/vaishn.png',
  BASE + '/img/home_default.png',
  BASE + '/img/list_default.png',
  BASE + '/img/search_default.png',
  BASE + '/js/dependencies/fuse.min.js', /* library for fuzzy search */
  BASE + '/js/dependencies/offline-onsenui.js',
  BASE + '/js/dependencies/Sortable.min.js',
  BASE + '/js/all_songs_page.js',
  BASE + '/js/app.js',
  BASE + '/js/home_page.js',
  BASE + '/js/list_page.js',
  BASE + '/js/lists_page.js',
  BASE + '/js/pronounce_page.js',
  BASE + '/js/router.js',
  BASE + '/js/search_page.js',
  BASE + '/js/settings_page.js',
  BASE + '/js/songView_page.js',
  BASE + '/SO/IDX_db.json',
];

// Clean install event listener optimized for single-bundle configuration
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);

    for (const url of ASSETS) {
      try {
        const response = await fetch(url, {
            cache: 'reload'
        });

        if (response.ok) {
          await cache.put(url, response);
        } else {
          console.warn('[SW] Skip caching (HTTP ' + response.status + '):', url);
        }
      } catch (err) {
        console.warn('[SW] Skip caching:', url, err);
      }
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {

    if ('navigationPreload' in self.registration) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (_) {}
    }

    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();

    const clients = await self.clients.matchAll();

    for (const client of clients) {
      client.postMessage({
        type: 'SW_UPDATED',
        version: SHELL_VERSION
      });
    }

  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET')
    return;

  if (!request.url.startsWith(self.location.origin))
    return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const url = new URL(request.url);
      const baseUrl = new URL(BASE);

      let cached = await cache.match(request);

      if (!cached) {
        const isBasePath = url.pathname === baseUrl.pathname ||
                           url.pathname === baseUrl.pathname + '/';
        const isRoot = url.pathname === '/';

        if (isBasePath || isRoot) {
          cached = await cache.match(BASE + '/index.html');
        }
      }

      if (cached) {
        void (async () => {
          try {
            const preload = await event.preloadResponse;
            const response = preload || await fetch(request);

            if (response && response.ok) {
              const clone = response.clone();
              const cache = await caches.open(SHELL_CACHE);
              cache.put(request, clone);
            }
          } catch (_) {}
        })();

        return cached;
      }

      try {
        const preload = await event.preloadResponse;
        const response = preload || await fetch(request);

        if (response && response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        const fallback = await cache.match(BASE + '/index.html');
        if (fallback) return fallback;

        return new Response(
          'Kīrtan App is offline. Please check your connection.',
          { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/plain' } }
        );
      }
    })());

    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match(request);

    if (cached)
      return cached;

    try {
      const response = await fetch(request);
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (err) {
      console.warn('[SW] Asset fetch failed (offline?):', request.url);
      return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
  })());
});