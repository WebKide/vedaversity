/**
 * js/search_page.js
 * Search shell — real flow (open standalone, or "add to list" mode when
 * pushed with { listName }), backed by a real Fuse.js index built over
 * window.INDEX.
 *
 * window.INDEX[i] is now an object (from SO/IDX_db.json's "IDX" array):
 *   { first_line, search, author, language, verses, en_translation,
 *     translation_intro, unsorted, file_name }
 *   - "search" is the full lyric blob, lowercase/diacritic-stripped, with
 *     spaces between words (unlike the old space-stripped searchBlob).
 *   - "first_line" keeps its original diacritics (it's the display title),
 *     so a normalized shadow copy is built once below for matching/boost.
 *
 * Fuse is built over a small shadow array {searchIdx, search, title_norm}
 * rather than window.INDEX directly, since window.INDEX no longer carries
 * a precomputed title_norm field. Array order/length match window.INDEX
 * 1:1, so result.refIndex still maps straight to the real song id.
 */

// --- Fuse wiring --------------------------------------------------
let fuse = null;
let titleNormCache = null; // parallel array: normalized first_line per song

const FUSE_OPTIONS = {
  includeScore: true,
  ignoreLocation: true, /* "search" is one long concatenated blob per song, not a bag of separately-located words — location-constrained matching would miss hits deep in the blob. */
  distance: 3600, // generous, for the same reason as above.
  threshold: 0.3,
  minMatchCharLength: 3,
  keys: [
    { name: 'search', weight: 0.6 },
    { name: 'title_norm', weight: 0.4 }
  ]
};

window.indexPromise.then(() => {
  if (typeof Fuse === 'undefined') {
    console.error('[search_page] Fuse is not loaded. Reload the app.');
    return;
  }

  titleNormCache = window.INDEX.map((rec) => normalizeQuery(rec.first_line));

  const fuseData = window.INDEX.map((rec, searchIdx) => ({
    searchIdx,
    search: rec.search || '',
    title_norm: titleNormCache[searchIdx]
  }));

  fuse = new Fuse(fuseData, FUSE_OPTIONS);
});
// ----------------------------------------------------------------------

function search_page_init(page) {
  let clickHandler;
  const listName = page.data && page.data.listName;

  if (listName) {
    // PICKER MODE: Adding a song to a specific list
    clickHandler = (song) => {
      const songId = song.id;
      addSongToList(songId, listName);
      document.getElementById('navigator').popPage();
    };
    const hint = page.querySelector('#search-hint-add');
    if (hint) hint.style.display = '';
  } else {
    // BROWSE MODE: Opening the song to view it
    clickHandler = (song) => {
      const songId = song.id;
      showSongViewUI(songId, null, 'replace');
    };
  }

  const MIN_QUERY_LENGTH = 3;
  const SEARCH_DEBOUNCE_MS = 150;
  let debounceTimer = null;

  const searchInput = page.querySelector('.search-box');
  searchInput.onkeyup = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      render_searchUI(page, searchInput.value, clickHandler, 'search-list-page', MIN_QUERY_LENGTH);
    }, SEARCH_DEBOUNCE_MS);
  };
  // searchInput.focus();
  setTimeout(() => searchInput.focus(), 0);

  const defaultImg = page.querySelector('.default_img_container');
  if (defaultImg) fitElementToPage(defaultImg);
}

/**
 * Normalizes a raw query the same way title_norm/searchBlob were built:
 * lowercase, strip diacritics (NFD decompose + drop combining marks),
 * then drop everything that isn't a-z0-9 (spaces included, since the
 * indexed blob has no spaces either).
 */
function normalizeQuery(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .replace(/[^a-z0-9\s]/g, '') // strip punctuation, keep spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * dp.json's index-array position isn't fixed/known ahead of time (IDX.json
 * is regenerated from the SO/ directory), so we look it up by filename
 * once and cache it, rather than hardcoding a numeric id.
 */
let _fallbackSongId = null;
function getFallbackSongId() {
  if (_fallbackSongId !== null) return _fallbackSongId;
  if (!window.INDEX) return null;

  const idx = window.INDEX.findIndex((rec) => rec.file_name === 'dp.json');
  _fallbackSongId = idx; // -1 if not found; findIndex never returns null
  return idx;
}

/**
 * Searches window.INDEX via Fuse over searchBlob (+ title_norm boost).
 * Returns [{ id, title }], capped to 30, ranked by Fuse score.
 * If too few results come back, the threshold is temporarily widened
 * (typo-tolerance fallback) then restored.
 */
function search(query) {
  if (!fuse) return [];

  const q = normalizeQuery(query);
  if (!q) return [];

  /* Tier 1: exact prefix match */
  const prefixIds = [];
  const prefixSeen = new Set();
  window.INDEX.forEach((rec, idx) => {
    const titleNorm = (titleNormCache && titleNormCache[idx]) || '';
    if (titleNorm.startsWith(q)) {
      prefixIds.push(idx);
      prefixSeen.add(idx);
    }
  });

  /* Tier 2: fuzzy fallback (typo tolerance, mid-lyric matches, etc */
  let results = fuse.search(q);

  if (results.length < 2) {
    const originalThreshold = fuse.options.threshold;
    fuse.options.threshold = originalThreshold + 0.2;
    results = fuse.search(q);
    fuse.options.threshold = originalThreshold;
  }

  return results.slice(0, 30).map((result) => {
    const rec = window.INDEX[result.refIndex];
    return {
      id: result.refIndex,
      title: window.getSongTitle(result.refIndex),
      author: (rec && rec.author) || ''
    };
  });
}

let last_query = '';

function gen_searchResultItem(item, onClick) {
  const el = document.createElement('ons-list-item');
  el.setAttribute('tappable', '');
  el.innerHTML = `
    <div class="center search-result">
      ${item.author ? `<div class="search-result-author">${escapeHtml(item.author)}</div>` : ''}
      <div class="search-result-title">${escapeHtml(item.title)}</div>
    </div>
  `;
  el.onclick = onClick;
  return el;
}

function renderSearchResults(listElement, results, clickHandler) {
  listElement.innerHTML = '';
  results.forEach((item) => {
    listElement.appendChild(gen_searchResultItem(item, () => clickHandler(item)));
  });
}

function render_searchUI(page, query, clickHandler, listId, minLength) {
  minLength = minLength || 1;
  if (query === last_query) return;
  last_query = query;

  const listElement = page.querySelector('#' + listId);
  if (!listElement) return;

  // Below the character threshold: keep the default placeholder up rather
  // than running Fuse or showing a "no match" fallback prematurely.
  if (query.trim().length < minLength) {
    listElement.innerHTML = `<div class="default_img_container"><img src="img/search_default.png"></div>`;
    return;
  }

  const results = search(query);

  if (results && results.length > 0) {
    renderSearchResults(listElement, results, clickHandler);
  } else {
    listElement.innerHTML =
      "<span style='padding:20px; display:block; background-color: var(--gray-darker); color: var(--highlight);'>Found this match for your query:</span>";

    const fallbackId = getFallbackSongId();
    if (fallbackId !== -1) {
      const fallbackRec = window.INDEX[fallbackId];
      renderSearchResults(
        listElement,
        [{ id: fallbackId, title: window.getSongTitle(fallbackId), author: (fallbackRec && fallbackRec.author) || '' }],
        clickHandler
      );
    }
  }
}