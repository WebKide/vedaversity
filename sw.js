/**
 * sw.js — Kīrtan by Vedaversity
 * Cache-first for static assets; stale-while-revalidate for navigation.
 * Update CACHE_VERSION to bust the cache on new deployments.
 */

'use strict';

const SHELL_VERSION = 'v1.01';
const SHELL_CACHE = `vedaversity-shell-${SHELL_VERSION}`;
const RUNTIME_CACHE = 'vedaversity-runtime'; // no version — persists across deploys

// Tier 1: small, known, core files — safe to precache in full
const PRECACHE_URLS = [
  "index.html",
  "site.webmanifest",
  "favicon.png",
  "data.a",
  "data.b",
  "css/theme.css",
  "css/dark-theme.css",
  "css/capacitor.css",
  "css/home_content_page.css",
  "css/all_songs_page.css",
  "css/pronounce_page.css",
  "css/songView_page.css",
  "css/dependencies/material-design-iconic-font/css/material-design-iconic-font.min.css",
  "css/dependencies/baloo-da-2-font/css/font.css",
  "js/home_page.js",
  "js/home_content_page.js",
  "js/all_songs_page.js",
  "js/search_page.js",
  "js/songView_page.js",
  "js/pronounce_page.js",
  "js/lists_page.js",
  "js/list_page.js",
  "js/sharedLists_page.js",
  "js/settings_page.js",
  "js/capacitor_plugins_bundle.js",
  "js/dependencies/core-js.min.js",
  "templates/home.html",
  "templates/home_content.html",
  "templates/all_songs.html",
  "templates/search.html",
  "templates/songView.html",
  "templates/pronounce.html",
  "templates/lists.html",
  "templates/list.html",
  "templates/sharedLists.html",
  "templates/settings.html",
  "fonts/Material-Design-Iconic-Font.woff",
  "fonts/Material-Design-Iconic-Font.woff2",
  "fonts/baloo-da-2.woff",
  "img/home_default.png",
  "img/list_default.png",
  "img/search_default.png"
];

// Tier 2: folders that grow/are too large to enumerate — cached on first use
const RUNTIME_PREFIXES = ["SO/", "audio/", "img/icons/"];

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
