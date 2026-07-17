/**
 * js/search_page.js
 * Search shell — real flow (open standalone, or "add to list" mode when
 * pushed with { listName }), backed by a real Fuse.js index built over
 * window.INDEX.
 *
 * window.INDEX[i] = [title, title_norm, searchBlob, firstLineRomanized, filename]
 *   - title_norm and searchBlob are already lowercase, diacritic-stripped,
 *     and space-stripped (see app.js IDX_* constants).
 *   - Query text is normalized the same way before it's handed to Fuse, so
 *     a search for "krsna" or "kṛṣṇa" or "krishna" all line up against the
 *     stored blob.
 *
 * Fuse indexes searchBlob (primary) and title_norm (secondary boost)
 * directly via array-index keys ('2' / '1') — no need to remap
 * window.INDEX into objects first.
 */

// --- Fuse wiring --------------------------------------------------
let fuse = null;

const FUSE_OPTIONS = {
  includeScore: true,
  ignoreLocation: true, /* searchBlob is one long concatenated string per song, not a bag of separately-located words — location-constrained matching would miss hits deep in the blob. */
  distance: 3600, // generous, for the same reason as above.
  threshold: 0.3,
  minMatchCharLength: 3,
  keys: [
    { name: String(window.IDX_SEARCHBLOB), weight: 0.6 }, // '2'
    { name: String(window.IDX_TITLE_NORM), weight: 0.4 }  // '1'
  ]
};

window.indexPromise.then(() => {
  if (typeof Fuse === 'undefined') {
    console.error('[search_page] Fuse is not loaded. Reload the app.');
    return;
  }
  fuse = new Fuse(window.INDEX, FUSE_OPTIONS);
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

  const searchInput = page.querySelector('.search-box');
  searchInput.onkeyup = () => render_searchUI(page, searchInput.value, clickHandler, 'search-list-page');
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
    .replace(/[^a-z0-9]/g, ''); // strip punctuation/spaces
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

  const idx = window.INDEX.findIndex((rec) => rec[window.IDX_FILE] === 'dp.json');
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
    const titleNorm = rec[window.IDX_TITLE_NORM] || '';
    if (titleNorm.startsWith(q)) {
      prefixIds.push(idx);
      prefixSeen.add(idx);
    }
  })

  /* Tier 2: fuzzy fallback (typo tolerance, mid-lyric matches, etc */
  let results = fuse.search(q);

  if (results.length < 2) {
    const originalThreshold = fuse.options.threshold;
    fuse.options.threshold = originalThreshold + 0.2;
    results = fuse.search(q);
    fuse.options.threshold = originalThreshold;
  }

  return results.slice(0, 30).map((result) => ({
    id: result.refIndex,
    title: window.getSongTitle(result.refIndex)
  }));
}

let last_query = '';

function render_searchUI(page, query, clickHandler, listId) {
  if (query === last_query) return;
  last_query = query;

  const results = search(query);
  const listElement = page.querySelector('#' + listId);
  if (!listElement) return;

  if (results && results.length > 0) {
    listElement.innerHTML = '';
    appendListItems(listElement, results, (item) => item.title, (item) => clickHandler(item));
  } else if (query.length > 0) {
    listElement.innerHTML =
      "<span style='padding:20px; display:block; background-color: var(--gray-darker); color: var(--highlight);'>Found this match for your query:</span>";

    const fallbackId = getFallbackSongId();
    if (fallbackId !== -1) {
      appendListItems(
        listElement,
        [{ id: fallbackId, title: window.getSongTitle(fallbackId) }],
        (item) => item.title,
        (item) => clickHandler(item)
      );
    }
  } else {
    listElement.innerHTML = `<div class="default_img_container"><img src="img/search_default.png"></div>`;
  }
}