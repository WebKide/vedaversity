/**
 * js/utils.js
 * Shared helpers used across pages. Anything that was previously bundled
 * into the obfuscated data.a/data.b files and referenced ambiently
 * (gen_listItem, appendListItems, list/recents persistence, popovers,
 * showSongViewUI, etc.) lives here now, in the open.
 */

// ---------------------------------------------------------------------
// Basic list-item construction
// ---------------------------------------------------------------------

function gen_listItem(text, onClick) {
  const item = document.createElement('ons-list-item');
  item.setAttribute('tappable', '');
  item.innerHTML = `<div class="center">${text}</div>`;
  if (onClick) item.onclick = onClick;
  return item;
}

function midEllipsisSpanLabel(text) {
  return `<span class="mid-ellipsis">${text}</span>`;
}

/**
 * Renders a list of arbitrary items into `container` as ons-list-items.
 * - getLabel(item) -> string (falsy label skips the item)
 * - getOnClick(item) -> tap handler
 * - getContextMenu(element, item, index) -> optional long-press handler
 * Also stamps element.dataset.songId when the item is (or has) an id,
 * so Sortable-based reordering can read the order back out later.
 */
function appendListItems(container, items, getLabel, getOnClick, getContextMenu) {
  items.forEach((item, index) => {
    const label = getLabel(item);
    if (!label) return;

    const el = gen_listItem(label, () => getOnClick(item));

    const idValue = item && typeof item === 'object' && 'id' in item ? item.id : item;
    if (idValue !== undefined && idValue !== null) {
      el.dataset.songId = idValue;
    }

    if (getContextMenu) {
      let pressTimer;
      el.addEventListener('pointerdown', () => {
        pressTimer = setTimeout(() => getContextMenu(el, item, index), 500);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) =>
        el.addEventListener(evt, () => clearTimeout(pressTimer))
      );
    }

    container.appendChild(el);
  });
}

// ---------------------------------------------------------------------
// Context-menu popover (share/delete), reused by lists + list-detail
// ---------------------------------------------------------------------

function createContextPopover() {
  const popover = document.createElement('ons-popover');
  popover.className = 'context-popover';
  popover.setAttribute('cancelable', '');
  popover.setAttribute('direction', 'left');
  popover.innerHTML = `
    <ons-button class="shareBtn" modifier="quiet"><ons-icon size="24px" icon="md-share"></ons-icon></ons-button>
    <ons-button class="deleteBtn" modifier="quiet"><ons-icon size="24px" style="color:red;" icon="md-delete"></ons-icon></ons-button>
  `;
  document.body.appendChild(popover);
  return popover;
}

let _sharedContextPopover = null;
function setupPopover(anchorElement, index) {
  if (!_sharedContextPopover) _sharedContextPopover = createContextPopover();
  // Reset any stale handlers/visibility from the previous use
  const shareButton = _sharedContextPopover.querySelector('.shareBtn');
  const deleteButton = _sharedContextPopover.querySelector('.deleteBtn');
  shareButton.style.display = '';
  shareButton.onclick = null;
  deleteButton.onclick = null;
  return { popover: _sharedContextPopover, shareButton, deleteButton, anchorElement, index };
}

// ---------------------------------------------------------------------
// Misc small helpers
// ---------------------------------------------------------------------

function fitElementToPage(el) {
  requestAnimationFrame(() => {
    const scrollHost = el.closest('.page__content') || el.closest('.page');
    if (!scrollHost) return;
    const rect = el.getBoundingClientRect();
    const hostRect = scrollHost.getBoundingClientRect();
    const available = hostRect.bottom - rect.top;
    if (available > 0) el.style.minHeight = available + 'px';
  });
}

function debouncify(fn, wait) {
  wait = wait || 400;
  let locked = false;
  return (...args) => {
    if (locked) return;
    locked = true;
    Promise.resolve(fn(...args)).finally(() => setTimeout(() => (locked = false), wait));
  };
}

function alertError(err) {
  console.error(err);
  if (window.ons) ons.notification.toast(String((err && err.message) || err), { timeout: 2500 });
}

// Screen Wake Lock (web standard) replaces the old native keepAwake/allowSleep
let _wakeLock = null;
async function keepAwake() {
  try {
    if ('wakeLock' in navigator) _wakeLock = await navigator.wakeLock.request('screen');
  } catch (e) {
    /* not fatal — just means the screen may sleep during long songs */
  }
}
async function allowSleep() {
  try {
    if (_wakeLock) await _wakeLock.release();
  } catch (e) {
    /* ignore */
  }
  _wakeLock = null;
}

// ---------------------------------------------------------------------
// Lists persistence (appState.lists: { [name]: songId[] })
// ---------------------------------------------------------------------

function saveListsToDB() {
  dbSetItem('lists', appState.lists);
}

function addList(name) {
  if (!appState.lists[name]) appState.lists[name] = [];
  saveListsToDB();
}

function deleteList(listName) {
  delete appState.lists[listName];
  saveListsToDB();
  removeListFromRecents(listName);
}

function addSongToList(songId, listName) {
  if (!appState.lists[listName]) appState.lists[listName] = [];
  if (!appState.lists[listName].includes(songId)) {
    appState.lists[listName].push(songId);
    saveListsToDB();
  }
  const title = window.getSongTitle(songId) || songId;
  if (window.ons) ons.notification.toast(`Added "${title}" to "${listName}"`, { timeout: 1800 });
}

// ---------------------------------------------------------------------
// Recents persistence (appState.recents: { songId, listName }[], capped at 15)
// ---------------------------------------------------------------------

const RECENTS_MAX = 15;

function addToRecents(songId, listName) {
  listName = listName || null;
  appState.recents = appState.recents.filter((r) => !(r.id === songId && r.listName === listName));
  appState.recents.unshift({ id: songId, listName });
  appState.recents = appState.recents.slice(0, RECENTS_MAX);
  dbSetItem('recents', appState.recents);
}

function removeListSongFromRecents(listName, songId) {
  appState.recents = appState.recents.filter((r) => !(r.listName === listName && r.id === songId));
  dbSetItem('recents', appState.recents);
}

function removeListFromRecents(listName) {
  appState.recents = appState.recents.filter((r) => r.listName !== listName);
  dbSetItem('recents', appState.recents);
}

// ---------------------------------------------------------------------
// Song view navigation
// ---------------------------------------------------------------------

/**
 * Opens the song view. `mode` controls how it lands in the page stack:
 *  - default / undefined -> pushPage (normal "open a song" tap)
 *  - "replace" / "nav_prev" / "nav_next" -> replacePage (search/all-songs
 *    result taps, and next/prev navigation within a list, so the stack
 *    doesn't grow one entry per song visited)
 */
function showSongViewUI(songId, listName, mode) {
  addToRecents(songId, listName);
  const navEl = document.getElementById('navigator');
  const data = { songId, listName: listName || null };

  if (mode === 'replace' || mode === 'nav_prev' || mode === 'nav_next') {
    navEl.replacePage('tmpl-songview', { data });
  } else {
    navEl.pushPage('tmpl-songview', { data });
  }
}

// ---------------------------------------------------------------------
// Settings: language preview text
//
// NOTE: the old transl() that transliterated actual song content is
// deprecated per spec — songs render exactly as stored in their JSON now.
// This transliterate() stand-in ONLY drives the small sample-text preview
// on the Settings page ("Śrī Śrī Guru Gaurāṅga Jayatāḥ" in different
// scripts). Russian is intentionally omitted: it would need a full
// duplicate song directory to be useful beyond this preview line, so it's
// out of scope for v1 per the brief.
// ---------------------------------------------------------------------

window.LANGUAGES = {
  EN: { label: 'English' },
  EN_PLAIN: { label: 'English (no diacritics)' },
  BN: { label: 'Bengali' },
  DE: { label: 'Devanagari' }
};

const SETTINGS_SAMPLE_TEXT = {
  EN: "Śrī Śrī Guru Gaurāṅga Jayatāḥ",
  EN_PLAIN: 'Sri Sri Guru Gauranga Jayatah',
  BN: 'শ্রী শ্রী গুরু গৌরাঙ্গ জয়তঃ',
  DE: 'श्री श्री गुरु गौराङ्ग जयतः'
};

function transliterate(fromCode, toCode /*, mode */) {
  return SETTINGS_SAMPLE_TEXT[toCode] || SETTINGS_SAMPLE_TEXT.EN;
}

function getScriptCode(langCode) {
  return langCode || 'EN';
}

function apply_font() {
  const font = appState.fontFamily || "'Ubuntu Sans', sans-serif";
  document.documentElement.style.setProperty('--font-family', font);
  document.documentElement.style.setProperty('--material-font-family', font);
  // Apply directly to body to ensure inheritance
  document.body.style.fontFamily = font;
}