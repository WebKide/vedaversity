/**
 * js/all_songs_page.js
 * All songs, alphabetized and grouped by Sanskrit alphabetical order.
 * Uses ons-lazy-repeat for performance with large lists.
 *
 * Prerequisites (defined in app.js / utils.js):
 *   window.getSongTitle(index)
 *   gen_listItem(text, onClick)
 *   showSongViewUI(songId, listName, mode)
 */

let sortedToc = null;

// ---------------------------------------------------------------------
// Sanskrit alphabet groups (Devanagari | Bengali (Romanized))
// ---------------------------------------------------------------------
const SANSKRIT_GROUPS = [
  { key: 'a', dev: 'अ - অ - A', rom: 'a', 
  match: t => t.startsWith('a') && !t.startsWith('ā') && !t.startsWith('ai') && !t.startsWith('au') && !t.startsWith('aṁ') && !t.startsWith('aḥ') },
  { key: 'ā', dev: 'आ - আ - Ā', rom: 'ā', match: t => t.startsWith('ā') },
  { key: 'i', dev: 'इ - ই - I', rom: 'i', match: t => t.startsWith('i') && !t.startsWith('ī') },
  { key: 'ī', dev: 'ई - ঈ - Ī', rom: 'ī', match: t => t.startsWith('ī') },
  { key: 'u', dev: 'उ - উ - U', rom: 'u', match: t => t.startsWith('u') && !t.startsWith('ū') },
  { key: 'ū', dev: 'ऊ - ঊ - Ū', rom: 'ū', match: t => t.startsWith('ū') },
  { key: 'ṛ', dev: 'ऋ - ঋ - Ṛ', rom: 'ṛ', match: t => t.startsWith('ṛ') },
  { key: 'e', dev: 'ए - এ - E', rom: 'e', match: t => t.startsWith('e') },
  { key: 'ai', dev: 'ऐ - ঐ - AI', rom: 'ai', match: t => t.startsWith('ai') },
  { key: 'o', dev: 'ओ - ও - O', rom: 'o', match: t => t.startsWith('o') && !t.startsWith('au') },
  { key: 'au', dev: 'औ - ঔ - AU', rom: 'au', match: t => t.startsWith('au') },
  { key: 'aṁ', dev: 'अं - অং - AṀ', rom: 'aṁ', match: t => t.startsWith('aṁ') },
  { key: 'aḥ', dev: 'अः - অঃ - AḤ', rom: 'aḥ', match: t => t.startsWith('aḥ') },
  { key: 'ka', dev: 'क - ক - KA', rom: 'ka', match: t => t.startsWith('k')  && !t.startsWith('kh') && !t.startsWith('kṣ') },
  { key: 'kha', dev: 'ख - খ - KHA', rom: 'kha', match: t => t.startsWith('kh') },
  { key: 'ga', dev: 'ग - গ - GA', rom: 'ga', match: t => t.startsWith('g')  && !t.startsWith('gh') },
  { key: 'gha', dev: 'घ - ঘ - GHA', rom: 'gha', match: t => t.startsWith('gh') },
  { key: 'ṅa', dev: 'ङ - ঙ - ṄA', rom: 'ṅa', match: t => t.startsWith('ṅ') },
  { key: 'ca', dev: 'च - চ - CA', rom: 'ca', match: t => t.startsWith('c')  && !t.startsWith('ch') },
  { key: 'cha', dev: 'छ - ছ - CHA', rom: 'cha', match: t => t.startsWith('ch') },
  { key: 'ja', dev: 'ज - জ - JA', rom: 'ja', match: t => t.startsWith('j')  && !t.startsWith('jh') && !t.startsWith('jñ') },
  { key: 'jha', dev: 'झ - ঝ - JHA', rom: 'jha', match: t => t.startsWith('jh') },
  { key: 'ña', dev: 'ञ - ঞ - ÑA', rom: 'ña', match: t => t.startsWith('ñ') },
  { key: 'ṭa', dev: 'ट - ট - ṬA', rom: 'ṭa', match: t => t.startsWith('ṭ')  && !t.startsWith('ṭh') },
  { key: 'ṭha', dev: 'ठ - ঠ - ṬHA', rom: 'ṭha', match: t => t.startsWith('ṭh') },
  { key: 'ḍa', dev: 'ड - ড - ḌA', rom: 'ḍa', match: t => t.startsWith('ḍ')  && !t.startsWith('ḍh') },
  { key: 'ḍha', dev: 'ढ - ঢ - ḌHA', rom: 'ḍha', match: t => t.startsWith('ḍh') },
  { key: 'ṇa', dev: 'ण - ণ - ṆA', rom: 'ṇa', match: t => t.startsWith('ṇ') },
  { key: 'ta', dev: 'त - ত - TA', rom: 'ta', match: t => t.startsWith('t') && !t.startsWith('th') && !t.startsWith('tra') },
  { key: 'tha', dev: 'थ - থ - THA', rom: 'tha', match: t => t.startsWith('th') },
  { key: 'da', dev: 'द - দ - DA', rom: 'da', match: t => t.startsWith('d')  && !t.startsWith('dh') },
  { key: 'dha', dev: 'ध - ধ - DHA', rom: 'dha', match: t => t.startsWith('dh') },
  { key: 'na', dev: 'न - ন - NA', rom: 'na', match: t => t.startsWith('n') },
  { key: 'pa', dev: 'प - প - PA', rom: 'pa', match: t => t.startsWith('p')  && !t.startsWith('ph') },
  { key: 'pha', dev: 'फ - ফ - PHA', rom: 'pha', match: t => t.startsWith('ph') },
  { key: 'ba', dev: 'ब - ব - BA', rom: 'ba', match: t => t.startsWith('b')  && !t.startsWith('bh') },
  { key: 'bha', dev: 'भ - ভ - BHA', rom: 'bha', match: t => t.startsWith('bh') },
  { key: 'ma', dev: 'म - ম - MA', rom: 'ma', match: t => t.startsWith('m') },
  { key: 'ya', dev: 'य - য - YA', rom: 'ya', match: t => t.startsWith('y') },
  { key: 'ra', dev: 'र - র - RA', rom: 'ra', match: t => t.startsWith('r') },
  { key: 'la', dev: 'ल - ল - LA', rom: 'la', match: t => t.startsWith('l') },
  { key: 'va', dev: 'व - ব/ৱ - VA', rom: 'va', match: t => t.startsWith('v') },
  { key: 'śa', dev: 'श - শ - ŚA', rom: 'śa', match: t => t.startsWith('ś')  && !t.startsWith('śr') },
  { key: 'ṣa', dev: 'ष - ষ - ṢA', rom: 'ṣa', match: t => t.startsWith('ṣ') },
  { key: 'sa', dev: 'स - স - SA', rom: 'sa', match: t => t.startsWith('s') },
  { key: 'ha', dev: 'ह - হ - HA', rom: 'ha', match: t => t.startsWith('h') },
  { key: 'kṣa', dev: 'क्ष - ক্ষ - KṢA', rom: 'kṣa', match: t => t.startsWith('kṣ') },
  { key: 'tra', dev: 'त्र - ত্র - TRA', rom: 'tra', match: t => t.startsWith('tr') },
  { key: 'jña', dev: 'ज्ञ - জ্ঞ - JÑA', rom: 'jña', match: t => t.startsWith('jñ') },
  { key: 'śra', dev: 'श्र - শ্র - ŚRA', rom: 'śra', match: t => t.startsWith('śr') }
];

// ---------------------------------------------------------------------
// Build the grouped, sorted TOC
// ---------------------------------------------------------------------
function buildSortedToc() {
  if (sortedToc) return sortedToc;

  if (window.INDEX === undefined) {
    console.error('window.INDEX not loaded!');
    return [];
  }

  // 1. Collect all songs with titles
  const songs = window.INDEX
    .map((_, index) => ({ id: index, title: window.getSongTitle(index) }))
    .filter((item) => item.title);

  // 2. Sort alphabetically, ignoring leading punctuation
  songs.sort((a, b) => {
    const aClean = a.title.replace(/^\p{P}+/u, '');
    const bClean = b.title.replace(/^\p{P}+/u, '');
    return aClean.localeCompare(bClean);
  });

  // 3. Group by Sanskrit alphabet
  const groupMap = new Map();
  SANSKRIT_GROUPS.forEach(g => groupMap.set(g.key, { group: g, songs: [] }));

  songs.forEach(song => {
    const clean = song.title.replace(/^\p{P}+/u, '').trim().toLowerCase();
    let placed = false;
    for (const g of SANSKRIT_GROUPS) {
      if (g.match(clean)) {
        groupMap.get(g.key).songs.push(song);
        placed = true;
        break;
      }
    }
    if (!placed) {
      // Fallback bucket for anything that doesn't match
      if (!groupMap.has('#')) {
        groupMap.set('#', { group: { key: '#', dev: '#', rom: '#' }, songs: [] });
      }
      groupMap.get('#').songs.push(song);
    }
  });

  // 4. Build flat list: header + songs for each non-empty group
  const flat = [];
  SANSKRIT_GROUPS.forEach(g => {
    const entry = groupMap.get(g.key);
    if (entry.songs.length > 0) {
      flat.push({ type: 'header', group: entry.group });
      entry.songs.forEach(s => flat.push({ type: 'song', ...s }));
    }
  });

  // Append uncategorized if any
  if (groupMap.has('#') && groupMap.get('#').songs.length > 0) {
    flat.push({ type: 'header', group: { key: '#', dev: '#', rom: '#' } });
    groupMap.get('#').songs.forEach(s => flat.push({ type: 'song', ...s }));
  }

  sortedToc = flat;
  return sortedToc;
}

// ---------------------------------------------------------------------
// Header factory — lighter glass, centered Devanagari character
// ---------------------------------------------------------------------
function createSanskritHeader(group) {
  const wrapper = document.createElement('ons-list-item');
  wrapper.setAttribute('modifier', 'nodivider');
  wrapper.style.cssText = 'min-height:56px; padding:0; background:transparent;';

  const inner = document.createElement('div');
  inner.style.cssText = `
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 6px;
    padding-bottom: 18px;
    margin-bottom: -18px !important;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--highlight);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.22) 0%,
      rgba(255, 255, 255, 0.16) 30%,
      rgba(255, 255, 255, 0.10) 70%,
      rgba(255, 255, 255, 0.14) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.28);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3),
                inset 0 -1px 0 rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(25px) saturate(180%);
    -webkit-backdrop-filter: blur(25px) saturate(180%);
    letter-spacing: 3px;
  `;
  inner.textContent = group.dev;

  wrapper.appendChild(inner);
  return wrapper;
}

// ---------------------------------------------------------------------
// Letter-jump nav grid — one button per SANSKRIT_GROUPS entry that
// actually has songs; clicking opens a dedicated page showing just
// that group's songs (sidesteps lazy-repeat's incremental scrollHeight
// entirely — no scroll math needed).
// ---------------------------------------------------------------------
function render_groupNav(page) {
  const nav = page.querySelector('#group-nav');
  if (!nav || !sortedToc) return;
  nav.innerHTML = '';

  const heading = document.createElement('div');
  heading.className = 'list-header--material';
  heading.style.cssText = 'text-align:center; opacity:.6; font-size:16px; width:100%; margin-bottom:8px;';
  heading.textContent = 'TAP A BUTTON TO NAVIGATE';
  nav.appendChild(heading);

  SANSKRIT_GROUPS.forEach((g) => {
    const hasSongs = sortedToc.some((row) => row.type === 'header' && row.group.key === g.key);
    if (!hasSongs) return; // hide unpopulated letters

    const btn = document.createElement('button');
    btn.className = 'group-nav-btn';
    btn.textContent = g.dev;
    btn.onclick = () => {
      document.getElementById('navigator').pushPage('tmpl-group-detail', { data: { groupKey: g.key } });
    };
    nav.appendChild(btn);
  });

  const heading2 = document.createElement('div');
  heading2.className = 'list-header--material';
  heading2.style.cssText = 'text-align:center; opacity:.6; font-size:16px; width:100%; margin-top:8px;';
  heading2.textContent = 'SCROLL DOWN TO NAVIGATE';
  nav.appendChild(heading2);
}

// ---------------------------------------------------------------------
// Pulls a single group's header + songs out of sortedToc.
// ---------------------------------------------------------------------
function getGroupData(groupKey) {
  buildSortedToc();
  let group = null;
  const songs = [];
  let inGroup = false;

  for (const row of sortedToc) {
    if (row.type === 'header') {
      if (inGroup) break; // we've reached the next group — stop
      if (row.group.key === groupKey) {
        inGroup = true;
        group = row.group;
      }
      continue;
    }
    if (inGroup && row.type === 'song') songs.push(row);
  }

  return { group, songs };
}

// ---------------------------------------------------------------------
// Group-detail page init — plain ons-list, no lazy-repeat needed since
// a single letter's song count is small.
// ---------------------------------------------------------------------
function group_detail_page_init(page) {
  const groupKey = page.data && page.data.groupKey;
  const { group, songs } = getGroupData(groupKey);

  const titleEl = page.querySelector('.center');
  if (titleEl) titleEl.textContent = group ? group.dev : '';

  const listElement = page.querySelector('#group-detail-list');
  if (!listElement) return;
  listElement.innerHTML = '';

  songs.forEach((song) => {
    listElement.appendChild(
      gen_listItem(song.title, () => showSongViewUI(song.id, null, 'replace'))
    );
  });
}

// ---------------------------------------------------------------------
// Page init
// ---------------------------------------------------------------------
function all_songs_page_init(page) {
  if (window.INDEX === undefined) {
    console.error('window.INDEX not loaded!');
    return;
  }

  buildSortedToc();
  render_groupNav(page);

  /* ── scroll-to-top FAB wiring ── */
  const scrollArea = page.querySelector(".page__content");
  const fab = page.querySelector("#toTop");
  if (scrollArea && fab) {
    scrollArea.addEventListener('scroll', () => {
      if (scrollArea.scrollTop > 300) {
        fab.style.opacity = "1";
        fab.style.pointerEvents = "auto";
        fab.style.visibility = "visible";
      } else {
        fab.style.opacity = "0";
        fab.style.pointerEvents = "none";
      }
    });
  }

  render_songList(sortedToc);
}

// ---------------------------------------------------------------------
// Render the lazy-repeat list
// ---------------------------------------------------------------------
const render_songList = (songs) => {
  const listElement = document.getElementById('all-songs-list');

  listElement.delegate = {
    createItemContent: (index) => {
      const entry = songs[index];
      if (entry.type === 'header') {
        return createSanskritHeader(entry.group);
      }
      return gen_listItem(entry.title, () => showSongViewUI(entry.id, null, 'replace'));
    },
    countItems: () => songs.length,
    calculateItemHeight: (index) => {
      const entry = songs[index];
      return entry.type === 'header' ? 56 : 62;
    }
  };

  listElement.refresh();
};