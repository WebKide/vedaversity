/**
 * sw.js — Service Worker
 * Update VERSION to bust the cache on new deployments.
 */

'use strict';

const VERSION = 'v1.45';
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
  BASE + '/fonts/balooda-v21-latin-ext.woff2',
  BASE + '/fonts/charis-sil-v2-latin-ext.woff2',
  BASE + '/fonts/gentium-plus-v2-latin-ext.woff2',
  BASE + '/fonts/noto-serif-v33-latin-ext.woff2',
  BASE + '/fonts/nunito-v32-latin-ext.woff2',
  BASE + '/fonts/ubuntusans-v4-latin-ext.woff2',
  BASE + '/img/icons/apple-touch-icon.png',
  BASE + '/img/icons/earati.png',
  BASE + '/img/icons/marati.png',
  BASE + '/img/icons/narati.png',
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
  BASE + '/img/slideshow/001.jpg',
  BASE + '/img/slideshow/002.jpg',
  BASE + '/img/slideshow/003.jpg',
  BASE + '/img/slideshow/004.jpg',
  BASE + '/img/slideshow/005.jpg',
  BASE + '/img/slideshow/006.jpg',
  BASE + '/img/slideshow/007.jpg',
  BASE + '/img/slideshow/008.jpg',
  BASE + '/img/slideshow/009.jpg',
  BASE + '/img/slideshow/010.jpg',
  BASE + '/js/dependencies/fuse.min.js',
  BASE + '/js/dependencies/offline-onsenui.js',
  BASE + '/js/dependencies/Sortable.min.js',
  BASE + '/js/all_songs_page.js',
  BASE + '/js/app.js',
  BASE + '/js/author_page.js',
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
    // await cache.addAll(ASSETS);
    for (const url of ASSETS) {
        const response = await fetch(url, {
            cache: 'reload'
        });
        if (!response.ok) {
            throw new Error(`Failed to cache ${url}`);
        }
        await cache.put(url, response);
    }

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
  console.log('[SW fetch]', event.request.mode, event.request.url);

  const request = event.request;

  if (request.method !== 'GET')
    return;

  if (!request.url.startsWith(self.location.origin))
    return;

  event.respondWith((async () => {

    const cache = await caches.open(CACHE);

    // SPA routing.
    if (request.mode === 'navigate') {
      // return await cache.match(`${BASE}/index.html`);
      const page = await cache.match(`${BASE}/index.html`);
      return page || fetch(request);
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