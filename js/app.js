/**
 * js/app.js
 * Global app state, persistence, song index loading, theme, and boot sequence.
 */

// ---------------------------------------------------------------------
// Global state
// Song loader — fetches individual song JSON files
// ---------------------------------------------------------------------

window.songCache = {}; // in-memory cache

window.loadSong = async function(filename) {
  if (window.songCache[filename]) {
    return window.songCache[filename];
  }
  try {
    const res = await fetch('SO/' + filename);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    window.songCache[filename] = data;
    return data;
  } catch (err) {
    console.error('Failed to load song:', filename, err);
    return null;
  }
};

window.getSongById = async function(id) {
  const rec = window.INDEX && window.INDEX[id];
  if (!rec) return null;
  const filename = rec[window.IDX_FILE];
  return window.loadSong(filename);
};

// ---------------------------------------------------------------------
// localStorage-backed key/value store
// (Promise-returning so call sites written as `await dbGetItem(...)` still work;
// swap the bodies below for an IndexedDB wrapper later if storage needs grow.)
// ---------------------------------------------------------------------

const DB_PREFIX = 'kirtan:';

async function dbGetItem(key) {
  try {
    const raw = localStorage.getItem(DB_PREFIX + key);
    return raw === null ? null : JSON.parse(raw);
  } catch (e) {
    console.error('dbGetItem failed for', key, e);
    return null;
  }
}

async function dbSetItem(key, value) {
  try {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('dbSetItem failed for', key, e);
    return false;
  }
}

/* to add to history */
window.addRecent = async function(songId, filename) {
  // Remove if already exists to move it to the top/front
  appState.recents = appState.recents.filter(item => item.id !== songId);

  // Add to the beginning of the array
  appState.recents.unshift({ id: songId, file: filename, time: Date.now() });

  // Limit to most recent 50 items
  if (appState.recents.length > 50) {
    appState.recents = appState.recents.slice(0, 50);
  }

  // Persist to localStorage
  await dbSetItem('recents', appState.recents);
};

// Clear all recent items
window.clearRecents = async function() {
  const confirmed = await ons.notification.confirm({
    message: 'Are you sure you want to clear your recent history?',
    title: 'Clear Recent Songs',
    buttonLabels: ['Cancel', 'Clear'],
    primaryButtonIndex: 1
  });

  if (confirmed === 1) { // 1 corresponds to 'Clear' (index 1 in buttonLabels)
    appState.recents = [];
    await dbSetItem('recents', []);

    // Refresh the UI
    if (typeof renderRecents === 'function') {
      renderRecents();
    }

    ons.notification.toast('History cleared', { timeout: 2000 });
  }
};

// Create a new list and clear recents
window.createListFromRecents = async function() {
  if (appState.recents.length === 0) {
    ons.notification.alert("No recent songs to create a list from.");
    return;
  }

  const listName = await ons.notification.prompt({
    title: 'New List',
    message: 'Enter a name for your list:',
    defaultValue: 'My Recent Songs',
    buttonLabels: ['Cancel', 'Create'], // Add this line
    primaryButtonIndex: 1,  // Makes 'Create' the bold/primary choice
    cancelable: true        // Allows closing by tapping outside
  });

  // Important: When there are two buttons, listName will be null if 'Cancel' is pressed
  if (listName === null || listName === undefined) {
    return; // User cancelled
  }

  if (listName) {
    // Save to lists
    appState.lists[listName] = appState.recents.map(item => item.id);
    await dbSetItem('lists', appState.lists);

    // Clear history
    appState.recents = [];
    await dbSetItem('recents', []);

    ons.notification.toast(`List "${listName}" created!`, { timeout: 2000 });
    if (typeof renderRecents === 'function') renderRecents();
  }
};

window.appState = {
  lists: {},
  recents: [],
  langCode: 'EN',
  themeMode: 'dark',
  zoomSize: 22,
  fontFamily: "'Ubuntu Sans', sans-serif",
  trans: false,
  deviceInfo: null
};

async function loadPersistedState() {
  const [lists, recents, langCode, themeMode, zoomSize, trans, fontFamily] = await Promise.all([
    dbGetItem('lists'),
    dbGetItem('recents'),
    dbGetItem('langCode'),
    dbGetItem('themeMode'),
    dbGetItem('zoomSize'),
    dbGetItem('trans'),
    dbGetItem('fontFamily')
  ]);

  if (lists) appState.lists = lists;
  if (recents) appState.recents = recents;
  if (langCode) appState.langCode = langCode;
  if (themeMode !== null && themeMode !== undefined) appState.themeMode = themeMode;
  if (zoomSize) appState.zoomSize = zoomSize;
  if (trans !== null && trans !== undefined) appState.trans = trans;
  if (fontFamily) appState.fontFamily = fontFamily;
}

// ---------------------------------------------------------------------
// Song index
// window.INDEX[i] = [title, slug, searchBlob, firstLineRomanized, filename]
// ---------------------------------------------------------------------

window.IDX_TITLE       = 0;  // "he govinda he gopāla"
window.IDX_TITLE_NORM  = 1;  // "hegovindahegopala"
window.IDX_SEARCHBLOB  = 2;  // "hegovindahegopalakesavamadhava...."
window.IDX_FIRSTLINE   = 3;  // "he govinda he gopāla"
window.IDX_FILE        = 4;  // "5G.json"

window.indexPromise = fetch('SO/IDX.json')
  .then((r) => r.json())
  .then((data) => {
    window.INDEX = data;
    return data;
  })
  .catch((err) => {
    console.error('Failed to load song index (SO/IDX.json):', err);
    window.INDEX = [];
    return [];
  });

window.getSongTitle = function (id) {
  const rec = window.INDEX && window.INDEX[id];
  if (!rec) return '';
  return rec[window.IDX_TITLE] || rec[window.IDX_FIRSTLINE] || '';
};


function apply_font() {
  const font = appState.fontFamily;
  document.documentElement.style.setProperty('--font-family', font);
}

// ---------------------------------------------------------------------
// iOS in standalone mode
// ---------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true;

  if (isIOS && isStandalone) {
    // Inject a hard utility flag directly onto the root body element
    document.body.classList.add("ios-pwa-notch-fix");
  }
});

// ---------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------

function apply_theme() {
  const mode = appState.themeMode; // 'dark' | 'light' | null (system)
  let effective = mode;
  if (!effective) {
    effective = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.documentElement.classList.add('theme-' + effective);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', effective === 'light' ? '#ffffff' : '#0d0d0d');
}

if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  const onChange = () => { if (!appState.themeMode) apply_theme(); };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  else if (mq.addListener) mq.addListener(onChange); // older Safari
}

// ---------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------

async function boot() {
  await loadPersistedState();
  apply_theme();
  apply_font();
  await window.indexPromise;
  document.getElementById('navigator').resetToPage('tmpl-shell');
}

document.addEventListener('DOMContentLoaded', boot);
