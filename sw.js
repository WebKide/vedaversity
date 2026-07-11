/**
 * sw.js — Kīrtan by Vedaversity
 * Cache-first for static assets; stale-while-revalidate for navigation.
 * Update CACHE_VERSION to bust the cache on new deployments.
 */

'use strict';

const SHELL_VERSION = 'v1.02';
const SHELL_CACHE = `vedaversity-shell-${SHELL_VERSION}`;
const RUNTIME_CACHE = 'vedaversity-runtime'; // no version — persists across deploys

// Tier 1: small, known, core files — safe to precache in full
const PRECACHE_URLS = [
  "index.html",
  "site.webmanifest",
  "favicon.png",
  "data.a",
  "data.b",
  "css/all_songs_page.css",
  "css/capacitor.css",
  "css/dark-theme.css",
  "css/dependencies/baloo-da-2-font/css/font.css",
  "css/dependencies/material-design-iconic-font/css/material-design-iconic-font.min.css",
  "css/home_content_page.css",
  "css/pronounce_page.css",
  "css/songView_page.css",
  "css/theme.css",
  "fonts/baloo-da-2.woff",
  "fonts/Material-Design-Iconic-Font.woff",
  "fonts/Material-Design-Iconic-Font.woff2",
  "img/home_default.png",
  "img/icons/apple-touch-icon.png",
  "img/icons/nitaig.png",
  "img/icons/radhak.png",
  "img/icons/sgaura.png",
  "img/icons/skrsna.png",
  "img/icons/snitai.png",
  "img/icons/sradha.png",
  "img/icons/ssguru.png",
  "img/icons/vaishn.png",
  "img/list_default.png",
  "img/search_default.png",
  "js/all_songs_page.js",
  "js/capacitor_plugins_bundle.js",
  "js/dependencies/core-js.min.js",
  "js/home_content_page.js",
  "js/home_page.js",
  "js/list_page.js",
  "js/lists_page.js",
  "js/pronounce_page.js",
  "js/search_page.js",
  "js/settings_page.js",
  "js/sharedLists_page.js",
  "js/songView_page.js",
  "templates/all_songs.html",
  "templates/home.html",
  "templates/home_content.html",
  "templates/list.html",
  "templates/lists.html",
  "templates/pronounce.html",
  "templates/search.html",
  "templates/settings.html",
  "templates/sharedLists.html",
  "templates/songView.html",
  "SO/0N.O", "SO/1C.O", "SO/21.O", "SO/2Q.O", "SO/3F.O", "SO/44.O", "SO/4T.O",
  "SO/5I.O", "SO/67.O", "SO/6W.O", "SO/7L.O", "SO/8A.O", "SO/8Z.O", "SO/9O.O",
  "SO/aD.O", "SO/b2.O", "SO/bR.O", "SO/cG.O", "SO/d5.O", "SO/0O.O", "SO/1D.O",
  "SO/22.O", "SO/2R.O", "SO/3G.O", "SO/45.O", "SO/4U.O", "SO/5J.O", "SO/68.O",
  "SO/6X.O", "SO/7M.O", "SO/8B.O", "SO/90.O", "SO/9P.O", "SO/aE.O", "SO/b3.O",
  "SO/bS.O", "SO/cH.O", "SO/d6.O", "SO/00.O", "SO/0P.O", "SO/1E.O", "SO/23.O",
  "SO/2S.O", "SO/3H.O", "SO/46.O", "SO/4V.O", "SO/5K.O", "SO/69.O", "SO/6Y.O",
  "SO/7N.O", "SO/8C.O", "SO/91.O", "SO/9Q.O", "SO/aF.O", "SO/b4.O", "SO/bT.O",
  "SO/cI.O", "SO/d7.O", "SO/01.O", "SO/0Q.O", "SO/1F.O", "SO/24.O", "SO/2T.O",
  "SO/3I.O", "SO/47.O", "SO/4W.O", "SO/5L.O", "SO/6A.O", "SO/6Z.O", "SO/7O.O",
  "SO/8D.O", "SO/92.O", "SO/9R.O", "SO/aG.O", "SO/b5.O", "SO/bU.O", "SO/cJ.O",
  "SO/d8.O", "SO/02.O", "SO/0R.O", "SO/1G.O", "SO/25.O", "SO/2U.O", "SO/3J.O",
  "SO/48.O", "SO/4X.O", "SO/5M.O", "SO/6B.O", "SO/70.O", "SO/7P.O", "SO/8E.O",
  "SO/93.O", "SO/9S.O", "SO/aH.O", "SO/b6.O", "SO/bV.O", "SO/cK.O", "SO/d9.O",
  "SO/03.O", "SO/0S.O", "SO/1H.O", "SO/26.O", "SO/2V.O", "SO/3K.O", "SO/49.O",
  "SO/4Y.O", "SO/5N.O", "SO/6C.O", "SO/71.O", "SO/7Q.O", "SO/8F.O", "SO/94.O",
  "SO/9T.O", "SO/aI.O", "SO/b7.O", "SO/bW.O", "SO/cL.O", "SO/da.O", "SO/04.O",
  "SO/0T.O", "SO/1I.O", "SO/27.O", "SO/2W.O", "SO/3L.O", "SO/4A.O", "SO/4Z.O",
  "SO/5O.O", "SO/6D.O", "SO/72.O", "SO/7R.O", "SO/8G.O", "SO/95.O", "SO/9U.O",
  "SO/aJ.O", "SO/b8.O", "SO/bX.O", "SO/cm.O", "SO/db.O", "SO/05.O", "SO/0U.O",
  "SO/1J.O", "SO/28.O", "SO/2X.O", "SO/3M.O", "SO/4B.O", "SO/50.O", "SO/5P.O",
  "SO/6E.O", "SO/73.O", "SO/7S.O", "SO/8H.O", "SO/96.O", "SO/9V.O", "SO/aK.O",
  "SO/b9.O", "SO/bY.O", "SO/cN.O", "SO/dc.O", "SO/06.O", "SO/0V.O", "SO/1K.O",
  "SO/29.O", "SO/2Y.O", "SO/3N.O", "SO/4C.O", "SO/51.O", "SO/5Q.O", "SO/6F.O",
  "SO/74.O", "SO/7T.O", "SO/8I.O", "SO/97.O", "SO/9W.O", "SO/aL.O", "SO/bA.O",
  "SO/bZ.O", "SO/cO.O", "SO/dd.O", "SO/07.O", "SO/0W.O", "SO/1L.O", "SO/2A.O",
  "SO/2Z.O", "SO/3O.O", "SO/4D.O", "SO/52.O", "SO/5R.O", "SO/6G.O", "SO/75.O",
  "SO/7U.O", "SO/8J.O", "SO/98.O", "SO/9X.O", "SO/aM.O", "SO/bB.O", "SO/c0.O",
  "SO/cP.O", "SO/de.O", "SO/08.O", "SO/0X.O", "SO/1M.O", "SO/2B.O", "SO/30.O",
  "SO/3P.O", "SO/4E.O", "SO/53.O", "SO/5S.O", "SO/6H.O", "SO/76.O", "SO/7V.O",
  "SO/8K.O", "SO/99.O", "SO/9Y.O", "SO/aN.O", "SO/bC.O", "SO/c1.O", "SO/cQ.O",
  "SO/df.O", "SO/09.O", "SO/0Y.O", "SO/1N.O", "SO/2C.O", "SO/31.O", "SO/3Q.O",
  "SO/4F.O", "SO/54.O", "SO/5T.O", "SO/6I.O", "SO/77.O", "SO/7W.O", "SO/8L.O",
  "SO/9A.O", "SO/9Z.O", "SO/aO.O", "SO/bD.O", "SO/c2.O", "SO/cR.O", "SO/dg.O",
  "SO/0A.O", "SO/0Z.O", "SO/1O.O", "SO/2D.O", "SO/32.O", "SO/3R.O", "SO/4G.O",
  "SO/55.O", "SO/5U.O", "SO/6J.O", "SO/78.O", "SO/7X.O", "SO/8M.O", "SO/9B.O",
  "SO/a0.O", "SO/aP.O", "SO/bE.O", "SO/c3.O", "SO/cS.O", "SO/dh.O", "SO/0B.O",
  "SO/10.O", "SO/1P.O", "SO/2E.O", "SO/33.O", "SO/3S.O", "SO/4H.O", "SO/56.O",
  "SO/5V.O", "SO/6K.O", "SO/79.O", "SO/7Y.O", "SO/8N.O", "SO/9C.O", "SO/a1.O",
  "SO/aQ.O", "SO/bF.O", "SO/c4.O", "SO/cT.O", "SO/di.O", "SO/0C.O", "SO/11.O",
  "SO/1Q.O", "SO/2F.O", "SO/34.O", "SO/3T.O", "SO/4I.O", "SO/57.O", "SO/5W.O",
  "SO/6L.O", "SO/7A.O", "SO/7Z.O", "SO/8O.O", "SO/9D.O", "SO/a2.O", "SO/aR.O",
  "SO/bG.O", "SO/c5.O", "SO/cU.O", "SO/dj.O", "SO/0D.O", "SO/12.O", "SO/1R.O",
  "SO/2G.O", "SO/35.O", "SO/3U.O", "SO/4J.O", "SO/58.O", "SO/5X.O", "SO/6M.O",
  "SO/7B.O", "SO/80.O", "SO/8P.O", "SO/9E.O", "SO/a3.O", "SO/aS.O", "SO/bH.O",
  "SO/c6.O", "SO/cV.O", "SO/dk.O", "SO/0E.O", "SO/13.O", "SO/1S.O", "SO/2H.O",
  "SO/36.O", "SO/3V.O", "SO/4K.O", "SO/59.O", "SO/5Y.O", "SO/6N.O", "SO/7C.O",
  "SO/81.O", "SO/8Q.O", "SO/9F.O", "SO/a4.O", "SO/aT.O", "SO/bI.O", "SO/c7.O",
  "SO/cW.O", "SO/dl.O", "SO/0F.O", "SO/14.O", "SO/1T.O", "SO/2I.O", "SO/37.O",
  "SO/3W.O", "SO/4L.O", "SO/5A.O", "SO/5Z.O", "SO/6O.O", "SO/7D.O", "SO/82.O",
  "SO/8R.O", "SO/9G.O", "SO/a5.O", "SO/aU.O", "SO/bJ.O", "SO/c8.O", "SO/cX.O",
  "SO/dm.O", "SO/0G.O", "SO/15.O", "SO/1U.O", "SO/2J.O", "SO/38.O", "SO/3X.O",
  "SO/4M.O", "SO/5B.O", "SO/60.O", "SO/6P.O", "SO/7E.O", "SO/83.O", "SO/8S.O",
  "SO/9H.O", "SO/a6.O", "SO/aV.O", "SO/bK.O", "SO/c9.O", "SO/cY.O", "SO/dn.O",
  "SO/0H.O", "SO/16.O", "SO/1V.O", "SO/2K.O", "SO/39.O", "SO/3Y.O", "SO/4N.O",
  "SO/5C.O", "SO/61.O", "SO/6Q.O", "SO/7F.O", "SO/84.O", "SO/8T.O", "SO/9I.O",
  "SO/a7.O", "SO/aW.O", "SO/bL.O", "SO/cA.O", "SO/cZ.O", "SO/ZZ.O", "SO/0I.O",
  "SO/17.O", "SO/1W.O", "SO/2L.O", "SO/3A.O", "SO/3Z.O", "SO/4O.O", "SO/5D.O",
  "SO/62.O", "SO/6R.O", "SO/7G.O", "SO/85.O", "SO/8U.O", "SO/9J.O", "SO/a8.O",
  "SO/aX.O", "SO/bM.O", "SO/cB.O", "SO/d0.O", "SO/0J.O", "SO/18.O", "SO/1X.O",
  "SO/2M.O", "SO/3B.O", "SO/40.O", "SO/4P.O", "SO/5E.O", "SO/63.O", "SO/6S.O",
  "SO/7H.O", "SO/86.O", "SO/8V.O", "SO/9K.O", "SO/a9.O", "SO/aY.O", "SO/bN.O",
  "SO/cC.O", "SO/d1.O", "SO/0K.O", "SO/19.O", "SO/1Y.O", "SO/2N.O", "SO/3C.O",
  "SO/41.O", "SO/4Q.O", "SO/5F.O", "SO/64.O", "SO/6T.O", "SO/7I.O", "SO/87.O",
  "SO/8W.O", "SO/9L.O", "SO/aA.O", "SO/aZ.O", "SO/bO.O", "SO/cD.O", "SO/d2.O",
  "SO/0L.O", "SO/1A.O", "SO/1Z.O", "SO/2O.O", "SO/3D.O", "SO/42.O", "SO/4R.O",
  "SO/5G.O", "SO/65.O", "SO/6U.O", "SO/7J.O", "SO/88.O", "SO/8X.O", "SO/9M.O",
  "SO/aB.O", "SO/b0.O", "SO/bP.O", "SO/cE.O", "SO/d3.O", "SO/0M.O", "SO/1B.O",
  "SO/20.O", "SO/2P.O", "SO/3E.O", "SO/43.O", "SO/4S.O", "SO/5H.O", "SO/66.O",
  "SO/6V.O", "SO/7K.O", "SO/89.O", "SO/8Y.O", "SO/9N.O", "SO/aC.O", "SO/b1.O",
  "SO/bQ.O", "SO/cF.O", "SO/d4.O",
  "audio/aa.mp3", "audio/ai.mp3", "audio/anusvara.mp3", "audio/visarga.mp3", 
  "audio/au.mp3", "audio/b.mp3", "audio/bh.mp3", "audio/c.mp3", "audio/ch.mp3",
  "audio/d.mp3", "audio/dd.mp3", "audio/ddh.mp3", "audio/dh.mp3", "audio/e.mp3",
  "audio/g.mp3", "audio/gh.mp3", "audio/h.mp3", "audio/i.mp3", "audio/ii.mp3",
  "audio/j.mp3", "audio/jh.mp3", "audio/jy.mp3", "audio/k.mp3", "audio/kh.mp3",
  "audio/l.mp3", "audio/m.mp3", "audio/n.mp3", "audio/ng.mp3", "audio/nn.mp3",
  "audio/ny.mp3", "audio/o.mp3", "audio/p.mp3", "audio/ph.mp3", "audio/r.mp3",
  "audio/rd.mp3", "audio/rdh.mp3", "audio/ri.mp3", "audio/rri.mp3", "audio/s.mp3",
  "audio/sh.mp3", "audio/ss.mp3", "audio/t.mp3", "audio/th.mp3", "audio/tt.mp3",
  "audio/a.mp3", "audio/tth.mp3", "audio/u.mp3", "audio/uu.mp3", "audio/yy.mp3"
];

// Tier 2: folders that grow/are too large to enumerate — cached on first use
const RUNTIME_PREFIXES = ["SO/RU/", "audio/", "img/icons/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

function isRuntimeAsset(url) {
  const path = new URL(url).pathname.replace(/^\//, "");
  return RUNTIME_PREFIXES.some((prefix) => path.startsWith(prefix));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const { request } = event;

  // Runtime tier: cache-first, then fetch + store (grows the cache over time)
  if (isRuntimeAsset(request.url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Shell tier: cache-first, fall back to network, fall back to shell on nav failure
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const clone = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") return caches.match("index.html");
        });
    })
  );
});
