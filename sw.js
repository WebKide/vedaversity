/**
 * sw.js — Service Worker
 * Update VERSION to bust the cache on new deployments.
 */

'use strict';

const VERSION = 'v1.30';
const CACHE = `vedaversity-${VERSION}`;

const BASE = self.location.pathname.substring(
  0,
  self.location.pathname.lastIndexOf('/')
);

const ASSETS = [
  BASE + '/index.html',
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
  BASE + '/js/dependencies/fuse.min.js',
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

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    // Install succeeds ONLY if every asset is cached.
    await cache.addAll(ASSETS);

    // Activate immediately.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {

    // Delete every old cache.
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key !== CACHE)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();

    const clients = await self.clients.matchAll();

    for (const client of clients) {
      client.postMessage({
        type: 'SW_UPDATED',
        version: VERSION
      });
    }

  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {

  const request = event.request;

  if (request.method !== 'GET')
    return;

  if (!request.url.startsWith(self.location.origin))
    return;

  event.respondWith((async () => {

    const cache = await caches.open(CACHE);

    // SPA routing.
    if (request.mode === 'navigate') {
      return await cache.match(`${BASE}/index.html`);
    }

    // Cache-first for everything else.
    const cached = await cache.match(request, {
      ignoreSearch: true
    });

    if (cached)
      return cached;

    // Should almost never happen, but supports
    // future assets that weren't precached.
    try {
      const response = await fetch(request);

      if (response.ok && response.type === 'basic') {
        await cache.put(request, response.clone());
      }

      return response;

    } catch {
      return Response.error();
    }

  })());

});