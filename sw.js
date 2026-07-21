/**
 * sw.js — Wisdom Oracle Service Worker
 * Cache-first for static assets; stale-while-revalidate for navigation.
 * Update CACHE_VERSION to bust the cache on new deployments.
 */

'use strict';

const CACHE_VERSION = 'wisdom-oracle-v1.1.57';
const BASE = new URL('./', self.location.href).href.replace(/\/$/, '');

const ASSETS = [
  BASE + '/index.html',        // splash screen entry point
  BASE + '/oracle.html',       // main progressive web app
  BASE + '/site.webmanifest',
  BASE + '/favicon.ico',

  // Scripts
  BASE + '/js/app.js',
  BASE + '/js/bookmarks.js',
  BASE + '/js/fuse-search.js',
  BASE + '/js/fuse.min.js',
  BASE + '/js/gitacore.js',
  BASE + '/js/html2canvas.min.js',
  BASE + '/js/ichingcore.js',
  BASE + '/js/lightbox.js',
  BASE + '/js/oracle-forms.js',
  BASE + '/js/router.js',
  BASE + '/js/search-ui.js',
  BASE + '/js/share-utils.js',
  BASE + '/js/slideshow-panel.js',
  BASE + '/js/splash.js',
  BASE + '/js/wisdomoracle.js',

  // Styles
  BASE + '/css/fonts.css',
  BASE + '/css/slideshow-panel.css',
  BASE + '/css/splash.css',
  BASE + '/css/styles.css',
  BASE + '/css/variables.css',

  // Images
  BASE + '/assets/images/card_bg.png',
  BASE + '/assets/images/iching.jpg',
  BASE + '/assets/images/iching.png',
  BASE + '/assets/images/ichingcoin.png',
  BASE + '/assets/images/imgfooter.png',
  BASE + '/assets/images/prabhupada.jpg',
  BASE + '/assets/images/prabhupada.png',
  BASE + '/assets/images/signature.svg',
  BASE + '/assets/images/wisdomoracle.svg',
  BASE + '/assets/images/wisdomoracle_logo.svg',

  // Icons
  BASE + '/assets/icons/android-chrome-192x192.png',
  BASE + '/assets/icons/android-chrome-512x512.png',
  BASE + '/assets/icons/apple-touch-icon.png',
  BASE + '/assets/icons/favicon-16x16.png',
  BASE + '/assets/icons/favicon-32x32.png',

  // Fonts
  BASE + '/assets/fonts/kelvinch-v42-latin-regular.woff2',
  BASE + '/assets/fonts/kelvinch-v42-latin-italic.woff2',
  BASE + '/assets/fonts/kelvinch-v42-latin-700.woff2',
  BASE + '/assets/fonts/kelvinch-v42-latin-700italic.woff2',

  BASE + '/assets/fonts/gentium-plus-v2-latin_latin-ext-regular.woff2',
  BASE + '/assets/fonts/gentium-plus-v2-latin_latin-ext-italic.woff2',
  BASE + '/assets/fonts/gentium-plus-v2-latin_latin-ext-700.woff2',
  BASE + '/assets/fonts/gentium-plus-v2-latin_latin-ext-700italic.woff2',

  BASE + '/assets/fonts/sansita-v12-latin_latin-ext-700.woff2',
  BASE + '/assets/fonts/sansita-v12-latin_latin-ext-700italic.woff2',

  BASE + '/assets/fonts/ubuntu-sans-v4-latin-ext-600.woff2',
  BASE + '/assets/fonts/ubuntu-sans-v4-latin-ext-600italic.woff2',
  BASE + '/assets/fonts/ubuntu-sans-v4-latin-ext-italic.woff2',
  BASE + '/assets/fonts/ubuntu-sans-v4-latin-ext-regular.woff2',

  // Gita JSON
  BASE + '/assets/gita/bg_ch01.json',
  BASE + '/assets/gita/bg_ch02.json',
  BASE + '/assets/gita/bg_ch03.json',
  BASE + '/assets/gita/bg_ch04.json',
  BASE + '/assets/gita/bg_ch05.json',
  BASE + '/assets/gita/bg_ch06.json',
  BASE + '/assets/gita/bg_ch07.json',
  BASE + '/assets/gita/bg_ch08.json',
  BASE + '/assets/gita/bg_ch09.json',
  BASE + '/assets/gita/bg_ch10.json',
  BASE + '/assets/gita/bg_ch11.json',
  BASE + '/assets/gita/bg_ch12.json',
  BASE + '/assets/gita/bg_ch13.json',
  BASE + '/assets/gita/bg_ch14.json',
  BASE + '/assets/gita/bg_ch15.json',
  BASE + '/assets/gita/bg_ch16.json',
  BASE + '/assets/gita/bg_ch17.json',
  BASE + '/assets/gita/bg_ch18.json',

  // iChing JSON
  BASE + '/assets/iching/iching.json',

  // Info card data
  BASE + '/assets/data/about.json',
  BASE + '/assets/data/oracle.json',
  BASE + '/assets/data/search.json',
  BASE + '/assets/data/usage.json',
  BASE + '/README.md',
];

/* ────────────────────────────────────────────────────────────────────────── */
// ─── Install: cache all assets for offline use ────────────────────────────
/* ────────────────────────────────────────────────────────────────────────── */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
// ─── Activate: delete old caches ──────────────────────────────────────────
/* ────────────────────────────────────────────────────────────────────────── */

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ────────────────────────────────────────────────────────────────────────── */
// ─── Fetch: Cache-first with background refresh for navigation ────────────
/* ────────────────────────────────────────────────────────────────────────── */

self.addEventListener('fetch', event => {
  const request = event.request;
  
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(async cache => {
      const url = new URL(request.url);
      
      // Clean query strings/hashes for reliable cache matching
      const cleanUrl = url.origin + url.pathname; 

      // 1. Handle Navigation Requests (HTML Pages)
      if (request.mode === 'navigate') {
        const isRoot = cleanUrl === self.location.origin + '/' || cleanUrl === BASE || cleanUrl === BASE + '/';
        const targetKey = isRoot ? BASE + '/index.html' : request;

        const cachedResponse = await cache.match(targetKey, { ignoreSearch: true });
        if (cachedResponse) return cachedResponse;

        // Fallback strategy if page isn't explicitly cached
        return cache.match(BASE + '/index.html', { ignoreSearch: true });
      }

      // 2. Handle Sub-resources (JS, CSS, Images, JSON)
      const cachedAsset = await cache.match(request, { ignoreSearch: true });
      if (cachedAsset) return cachedAsset;

      // Network fallback + runtime caching if online
      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Ultimate safe fallback fallback for content text assets
        if (request.headers.get('accept').includes('text/html')) {
          return cache.match(BASE + '/index.html');
        }
        return new Response('[SW] Asset fetch failed (offline?):', { status: 404 });
      }
    })
  );
});
