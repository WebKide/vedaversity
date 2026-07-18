/**
 * sw.js — Wisdom Oracle Service Worker
 * Cache-first for static assets; stale-while-revalidate for navigation.
 * Update SHELL_VERSION to bust the cache on new deployments.
 */

'use strict';

const SHELL_VERSION = 'v1.23'; /* manually bumped with each deployment */
const SHELL_CACHE = `vedaversity-shell-${SHELL_VERSION}`;
const RUNTIME_CACHE = 'vedaversity-runtime'; // no version — persists across deploys

// Tier 1: small, known, core files — safe to precache in full
/**
 * Deployment base.
 * Works correctly both from localhost and GitHub Pages subdirectories.
 */
// const BASE = new URL('./', self.location.href).href.replace(/\/$/, '');
const BASE = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/'));

const ASSETS = [
  BASE + '/index.html', /* SPA landing and main page */
  BASE + '/site.webmanifest',
  BASE + '/favicon.ico',
  BASE + '/css/dependencies/offline-onsenui.css', /* NEW */
  BASE + '/css/fonts.css',
  BASE + '/css/styles.css',
  BASE + '/css/dependencies/ios-safe-area-fix-v2.css',
  BASE + '/fonts/gentium-plus-v2-latin-ext-700.woff2', /* serif */
  BASE + '/fonts/gentium-plus-v2-latin-ext-700italic.woff2', /* serif */
  BASE + '/fonts/gentium-plus-v2-latin-ext-italic.woff2', /* serif */
  BASE + '/fonts/gentium-plus-v2-latin-ext-regular.woff2', /* serif */
  BASE + '/fonts/nunito-v32-latin-ext-700.woff2', /* round */
  BASE + '/fonts/nunito-v32-latin-ext-700italic.woff2', /* round */
  BASE + '/fonts/nunito-v32-latin-ext-italic.woff2', /* round */
  BASE + '/fonts/nunito-v32-latin-ext-regular.woff2', /* round */
  BASE + '/fonts/noto-serif-v33-latin-ext-regular.woff2', /* book */
  BASE + '/fonts/noto-serif-v33-latin-ext-italic.woff2', /* book */
  BASE + '/fonts/noto-serif-v33-latin-ext-700.woff2', /* book */
  BASE + '/fonts/noto-serif-v33-latin-ext-700italic.woff2', /* book */
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-600.woff2', /* modern */
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-600italic.woff2', /* modern */
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-italic.woff2', /* modern */
  BASE + '/fonts/ubuntu-sans-v4-latin-ext-regular.woff2', /* modern */
  BASE + '/fonts/charis-sil-v2-latin-ext-italic.woff2', /* beautiful */
  BASE + '/fonts/charis-sil-v2-latin-ext-regular.woff2', /* beautiful */
  BASE + '/fonts/tiro-devanagari-sanskrit-v7-latin-ext-italic.woff2', /* elegant */
  BASE + '/fonts/tiro-devanagari-sanskrit-v7-latin-ext-regular.woff2', /* elegant */
  BASE + '/img/icons/apple-touch-icon.png',
  BASE + '/img/icons/nitaig.png', /* icon for song list */
  BASE + '/img/icons/radhak.png',
  BASE + '/img/icons/sgaura.png',
  BASE + '/img/icons/skrsna.png',
  BASE + '/img/icons/snitai.png',
  BASE + '/img/icons/sradha.png',
  BASE + '/img/icons/ssguru.png',
  BASE + '/img/icons/vaishn.png',
  BASE + '/img/home_default.png',
  BASE + '/img/list_default.png', /* background image for empty list */
  BASE + '/img/search_default.png', /* background image before searching */
  BASE + '/js/dependencies/fuse.min.js', /* library for fuzy search */
  BASE + '/js/dependencies/offline-onsenui.js', /* NEW */
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
  BASE + '/SO/IDX.json', /* index for all the songs, sample included */
];

const SONGS_JSON = [
  'SO/0N.json', 'SO/1C.json', 'SO/21.json', 'SO/2Q.json', 'SO/3F.json', 'SO/44.json', 'SO/4T.json',
  'SO/5I.json', 'SO/67.json', 'SO/6W.json', 'SO/7L.json', 'SO/8A.json', 'SO/8Z.json', 'SO/9O.json',
  'SO/aD.json', 'SO/b2.json', 'SO/bR.json', 'SO/cG.json', 'SO/d5.json', 'SO/0O.json', 'SO/1D.json',
  'SO/22.json', 'SO/2R.json', 'SO/3G.json', 'SO/45.json', 'SO/4U.json', 'SO/5J.json', 'SO/68.json',
  'SO/6X.json', 'SO/7M.json', 'SO/8B.json', 'SO/90.json', 'SO/9P.json', 'SO/aE.json', 'SO/b3.json',
  'SO/bS.json', 'SO/cH.json', 'SO/d6.json', 'SO/00.json', 'SO/0P.json', 'SO/1E.json', 'SO/23.json',
  'SO/2S.json', 'SO/3H.json', 'SO/46.json', 'SO/4V.json', 'SO/5K.json', 'SO/69.json', 'SO/6Y.json',
  'SO/7N.json', 'SO/8C.json', 'SO/91.json', 'SO/9Q.json', 'SO/aF.json', 'SO/b4.json', 'SO/bT.json',
  'SO/cI.json', 'SO/d7.json', 'SO/01.json', 'SO/0Q.json', 'SO/1F.json', 'SO/24.json', 'SO/2T.json',
  'SO/3I.json', 'SO/47.json', 'SO/4W.json', 'SO/5L.json', 'SO/6A.json', 'SO/6Z.json', 'SO/7O.json',
  'SO/8D.json', 'SO/92.json', 'SO/9R.json', 'SO/aG.json', 'SO/b5.json', 'SO/bU.json', 'SO/cJ.json',
  'SO/d8.json', 'SO/02.json', 'SO/0R.json', 'SO/1G.json', 'SO/25.json', 'SO/2U.json', 'SO/3J.json',
  'SO/48.json', 'SO/4X.json', 'SO/5M.json', 'SO/6B.json', 'SO/70.json', 'SO/7P.json', 'SO/8E.json',
  'SO/93.json', 'SO/9S.json', 'SO/aH.json', 'SO/b6.json', 'SO/bV.json', 'SO/cK.json', 'SO/d9.json',
  'SO/03.json', 'SO/0S.json', 'SO/1H.json', 'SO/26.json', 'SO/2V.json', 'SO/3K.json', 'SO/49.json',
  'SO/4Y.json', 'SO/5N.json', 'SO/6C.json', 'SO/71.json', 'SO/7Q.json', 'SO/8F.json', 'SO/94.json',
  'SO/9T.json', 'SO/aI.json', 'SO/b7.json', 'SO/bW.json', 'SO/cL.json', 'SO/da.json', 'SO/04.json',
  'SO/0T.json', 'SO/1I.json', 'SO/27.json', 'SO/2W.json', 'SO/3L.json', 'SO/4A.json', 'SO/4Z.json',
  'SO/5O.json', 'SO/6D.json', 'SO/72.json', 'SO/7R.json', 'SO/8G.json', 'SO/95.json', 'SO/9U.json',
  'SO/aJ.json', 'SO/b8.json', 'SO/bX.json', 'SO/cm.json', 'SO/db.json', 'SO/05.json', 'SO/0U.json',
  'SO/1J.json', 'SO/28.json', 'SO/2X.json', 'SO/3M.json', 'SO/4B.json', 'SO/50.json', 'SO/5P.json',
  'SO/6E.json', 'SO/73.json', 'SO/7S.json', 'SO/8H.json', 'SO/96.json', 'SO/9V.json', 'SO/aK.json',
  'SO/b9.json', 'SO/bY.json', 'SO/cN.json', 'SO/dc.json', 'SO/06.json', 'SO/0V.json', 'SO/1K.json',
  'SO/29.json', 'SO/2Y.json', 'SO/3N.json', 'SO/4C.json', 'SO/51.json', 'SO/5Q.json', 'SO/6F.json',
  'SO/74.json', 'SO/7T.json', 'SO/8I.json', 'SO/97.json', 'SO/9W.json', 'SO/aL.json', 'SO/bA.json',
  'SO/bZ.json', 'SO/cO.json', 'SO/dd.json', 'SO/07.json', 'SO/0W.json', 'SO/1L.json', 'SO/2A.json',
  'SO/2Z.json', 'SO/3O.json', 'SO/4D.json', 'SO/52.json', 'SO/5R.json', 'SO/6G.json', 'SO/75.json',
  'SO/7U.json', 'SO/8J.json', 'SO/98.json', 'SO/9X.json', 'SO/aM.json', 'SO/bB.json', 'SO/c0.json',
  'SO/cP.json', 'SO/de.json', 'SO/08.json', 'SO/0X.json', 'SO/1M.json', 'SO/2B.json', 'SO/30.json',
  'SO/3P.json', 'SO/4E.json', 'SO/53.json', 'SO/5S.json', 'SO/6H.json', 'SO/76.json', 'SO/7V.json',
  'SO/8K.json', 'SO/99.json', 'SO/9Y.json', 'SO/aN.json', 'SO/bC.json', 'SO/c1.json', 'SO/cQ.json',
  'SO/df.json', 'SO/09.json', 'SO/0Y.json', 'SO/1N.json', 'SO/2C.json', 'SO/31.json', 'SO/3Q.json',
  'SO/4F.json', 'SO/54.json', 'SO/5T.json', 'SO/6I.json', 'SO/77.json', 'SO/7W.json', 'SO/8L.json',
  'SO/9A.json', 'SO/9Z.json', 'SO/aO.json', 'SO/bD.json', 'SO/c2.json', 'SO/cR.json', 'SO/dg.json',
  'SO/0A.json', 'SO/0Z.json', 'SO/1O.json', 'SO/2D.json', 'SO/32.json', 'SO/3R.json', 'SO/4G.json',
  'SO/55.json', 'SO/5U.json', 'SO/6J.json', 'SO/78.json', 'SO/7X.json', 'SO/8M.json', 'SO/9B.json',
  'SO/a0.json', 'SO/aP.json', 'SO/bE.json', 'SO/c3.json', 'SO/cS.json', 'SO/dh.json', 'SO/0B.json',
  'SO/10.json', 'SO/1P.json', 'SO/2E.json', 'SO/33.json', 'SO/3S.json', 'SO/4H.json', 'SO/56.json',
  'SO/5V.json', 'SO/6K.json', 'SO/79.json', 'SO/7Y.json', 'SO/8N.json', 'SO/9C.json', 'SO/a1.json',
  'SO/aQ.json', 'SO/bF.json', 'SO/c4.json', 'SO/cT.json', 'SO/di.json', 'SO/0C.json', 'SO/11.json',
  'SO/1Q.json', 'SO/2F.json', 'SO/34.json', 'SO/3T.json', 'SO/4I.json', 'SO/57.json', 'SO/5W.json',
  'SO/6L.json', 'SO/7A.json', 'SO/7Z.json', 'SO/8O.json', 'SO/9D.json', 'SO/a2.json', 'SO/aR.json',
  'SO/bG.json', 'SO/c5.json', 'SO/cU.json', 'SO/dj.json', 'SO/0D.json', 'SO/12.json', 'SO/1R.json',
  'SO/2G.json', 'SO/35.json', 'SO/3U.json', 'SO/4J.json', 'SO/58.json', 'SO/5X.json', 'SO/6M.json',
  'SO/7B.json', 'SO/80.json', 'SO/8P.json', 'SO/9E.json', 'SO/a3.json', 'SO/aS.json', 'SO/bH.json',
  'SO/c6.json', 'SO/cV.json', 'SO/dk.json', 'SO/0E.json', 'SO/13.json', 'SO/1S.json', 'SO/2H.json',
  'SO/36.json', 'SO/3V.json', 'SO/4K.json', 'SO/59.json', 'SO/5Y.json', 'SO/6N.json', 'SO/7C.json',
  'SO/81.json', 'SO/8Q.json', 'SO/9F.json', 'SO/a4.json', 'SO/aT.json', 'SO/bI.json', 'SO/c7.json',
  'SO/cW.json', 'SO/dl.json', 'SO/0F.json', 'SO/14.json', 'SO/1T.json', 'SO/2I.json', 'SO/37.json',
  'SO/3W.json', 'SO/4L.json', 'SO/5A.json', 'SO/5Z.json', 'SO/6O.json', 'SO/7D.json', 'SO/82.json',
  'SO/8R.json', 'SO/9G.json', 'SO/a5.json', 'SO/aU.json', 'SO/bJ.json', 'SO/c8.json', 'SO/cX.json',
  'SO/dm.json', 'SO/0G.json', 'SO/15.json', 'SO/1U.json', 'SO/2J.json', 'SO/38.json', 'SO/3X.json',
  'SO/4M.json', 'SO/5B.json', 'SO/60.json', 'SO/6P.json', 'SO/7E.json', 'SO/83.json', 'SO/8S.json',
  'SO/9H.json', 'SO/a6.json', 'SO/aV.json', 'SO/bK.json', 'SO/c9.json', 'SO/cY.json', 'SO/dn.json',
  'SO/0H.json', 'SO/16.json', 'SO/1V.json', 'SO/2K.json', 'SO/39.json', 'SO/3Y.json', 'SO/4N.json',
  'SO/5C.json', 'SO/61.json', 'SO/6Q.json', 'SO/7F.json', 'SO/84.json', 'SO/8T.json', 'SO/9I.json',
  'SO/a7.json', 'SO/aW.json', 'SO/bL.json', 'SO/cA.json', 'SO/cZ.json', 'SO/d4.json', 'SO/0I.json',
  'SO/17.json', 'SO/1W.json', 'SO/2L.json', 'SO/3A.json', 'SO/3Z.json', 'SO/4O.json', 'SO/5D.json',
  'SO/62.json', 'SO/6R.json', 'SO/7G.json', 'SO/85.json', 'SO/8U.json', 'SO/9J.json', 'SO/a8.json',
  'SO/aX.json', 'SO/bM.json', 'SO/cB.json', 'SO/d0.json', 'SO/0J.json', 'SO/18.json', 'SO/1X.json',
  'SO/2M.json', 'SO/3B.json', 'SO/40.json', 'SO/4P.json', 'SO/5E.json', 'SO/63.json', 'SO/6S.json',
  'SO/7H.json', 'SO/86.json', 'SO/8V.json', 'SO/9K.json', 'SO/a9.json', 'SO/aY.json', 'SO/bN.json',
  'SO/cC.json', 'SO/d1.json', 'SO/0K.json', 'SO/19.json', 'SO/1Y.json', 'SO/2N.json', 'SO/3C.json',
  'SO/41.json', 'SO/4Q.json', 'SO/5F.json', 'SO/64.json', 'SO/6T.json', 'SO/7I.json', 'SO/87.json',
  'SO/8W.json', 'SO/9L.json', 'SO/aA.json', 'SO/aZ.json', 'SO/bO.json', 'SO/cD.json', 'SO/d2.json',
  'SO/0L.json', 'SO/1A.json', 'SO/1Z.json', 'SO/2O.json', 'SO/3D.json', 'SO/42.json', 'SO/4R.json',
  'SO/5G.json', 'SO/65.json', 'SO/6U.json', 'SO/7J.json', 'SO/88.json', 'SO/8X.json', 'SO/9M.json',
  'SO/aB.json', 'SO/b0.json', 'SO/bP.json', 'SO/cE.json', 'SO/d3.json', 'SO/0M.json', 'SO/1B.json',
  'SO/20.json', 'SO/2P.json', 'SO/3E.json', 'SO/43.json', 'SO/4S.json', 'SO/5H.json', 'SO/66.json',
  'SO/6V.json', 'SO/7K.json', 'SO/89.json', 'SO/8Y.json', 'SO/9N.json', 'SO/aC.json', 'SO/b1.json',
  'SO/bQ.json', 'SO/cF.json', 'SO/do.json', 'SO/dp.json', /* each JSON contains one song */
];


// Tier 2: folders that are too large to enumerate — cached on first on-line use
const RUNTIME_PREFIXES = ['img/icons/'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {

    const cache = await caches.open(SHELL_CACHE);

    // Combine shell assets and song JSONs into one list
    const allUrls = [
      ...ASSETS,
      ...SONGS_JSON.map(p => new URL(p, BASE).href)
    ];

    for (const url of allUrls) {
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
          'Wisdom Oracle is offline. Please check your connection.',
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