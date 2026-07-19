/**
 * js/songView_page.js
 * Song view: loads /SO/<filename>.json directly (no fflate decompression —
 * data is plain JSON now), renders verses + translation, handles
 * double-tap-to-toggle-translation, pinch-to-zoom (persisted), swipe/
 * pagination between songs when opened from a list, and add-to-list /
 * copy-share from the toolbar menu.
 *
 * Dropped vs. the original: GunDB "Announce" broadcast feature, Russian
 * translation loading, native-only branching (this build treats every
 * platform as "web").
 */

const songDataCache = {};

window.escapeHtml = function(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
};

async function loadSongData(songId) {
  const rec = window.INDEX && window.INDEX[songId];
  if (!rec) throw new Error('Unknown song id: ' + songId);
  return rec; // verses / en_translation / author / translation_intro already inline
}

async function songView_page_init(page) {
  // 1. Data extraction & validation
  const data = page.data || {};
  const songId = data.songId || data.id;
  const listName = data.list_name;

  if (songId === undefined || songId === null) {
    console.error("No songId provided. Data found:", data);
    return;
  }

  const rec = window.INDEX && window.INDEX[songId];
  if (!rec) {
    console.error('Song not found in index:', songId);
    return;
  }

  // 2. Initialize UI State (Zoom, etc)
  await initPageState();

  // 3. Load full song data
  let song;
  try {
    song = await loadSongData(songId);
  } catch (err) {
    if (typeof alertError === 'function') alertError(err);
    const nav = document.getElementById('navigator');
    if (nav) nav.popPage();
    return;
  }

  // 4. Render Header (Title & Author)
  const titleElement = page.querySelector('#songTitle');
  if (titleElement) {
    const firstLine = rec[window.IDX_TITLE] || rec[window.IDX_FIRSTLINE] || '';
    const author = song.author || '';

    if (author) {
      titleElement.innerHTML = `
        <div class="author-wrapper">
          ${escapeHtml(firstLine)}<br>
          <span class="author-text"><i>by ${escapeHtml(author)}</i></span>
        </div>
      `;
      titleElement.classList.add('author-container');
    } else {
      titleElement.textContent = firstLine;
    }
  }

  // 5. Initialize Core Functionality
  const verseList = page.querySelector('#verseList');

  // Use the advanced renderer if available, otherwise fallback to simple
  if (typeof render_verses === 'function') {
    render_verses(verseList, page, songId, song);
  }

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

  setupNavButtons(page, songId, listName);
  setupMenuButtons(page, songId, rec[window.IDX_TITLE]);
  gestureInit(verseList, page);

  // 6. Lifecycle & Analytics
  if (typeof addRecent === 'function') addRecent(songId, rec[window.IDX_FILE]);

  page.onShow = (typeof keepAwake === 'function') ? keepAwake : null;
  page.onHide = (typeof allowSleep === 'function') ? allowSleep : null;
}

function setupMenuButtons(page, songId, songTitle) {
  const menuBtn = page.querySelector('#songViewMenuBtn');
  const popover = page.querySelector('#songViewPopover');
  menuBtn.onclick = () => popover.show(menuBtn);

  page.querySelector('#listBtn').onclick = () => {
    popover.hide();
    selectListDialog(songId);
  };

  const shareBtn = page.querySelector('#shareBtn');
  if (shareBtn) {
    shareBtn.onclick = debouncify(async () => {
      popover.hide();
      const song = window.INDEX[songId];
      const text = `${songTitle}\n\n${song.verses.replace(/⋅/g, '')}`;

      try {
        if (navigator.share) {
          await navigator.share({ title: songTitle, text });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          ons.notification.toast('Copied to clipboard', { timeout: 1800 });
        }
      } catch (err) {
        // user cancelled the native share sheet — not an error
      }
    });
  }
}

function setupNavButtons(page, songId, listName) {
  page.querySelectorAll('.listSongView').forEach((bar) => bar.remove());
  if (!listName) return;

  page.querySelector('#listBtn').style.display = 'none';

  const list = appState.lists[listName] || [];
  const currentIndex = list.indexOf(songId);
  const navText = `(${currentIndex + 1}/${list.length}) ${listName}`;

  const createNavBar = () => {
    const isFirst = currentIndex <= 0;
    const isLast = currentIndex === -1 || currentIndex === list.length - 1;

    const navBar = ons.createElement(`
      <div class="listSongView">
        <ons-button class="prevSongBtn" modifier="quiet" ${isFirst ? 'disabled' : ''}>
          <ons-icon icon="md-caret-left"></ons-icon>
        </ons-button>
        <span>${navText}</span>
        <ons-button class="nextSongBtn" modifier="quiet" ${isLast ? 'disabled' : ''}>
          <ons-icon icon="md-caret-right"></ons-icon>
        </ons-button>
      </div>
    `);

    navBar.querySelector('.prevSongBtn').onclick = () => {
      if (currentIndex > 0) showSongViewUI(list[currentIndex - 1], listName, 'nav_prev');
    };
    navBar.querySelector('.nextSongBtn').onclick = () => {
      if (currentIndex > -1 && currentIndex < list.length - 1) {
        showSongViewUI(list[currentIndex + 1], listName, 'nav_next');
      }
    };

    return navBar;
  };

  const content = page.querySelector('.page__content');
  content.after(createNavBar());
}

async function initPageState() {
  const initSetting = async (key, defaultValue) => {
    if (appState[key] === undefined) {
      const stored = await dbGetItem(key);
      appState[key] = stored !== null ? stored : defaultValue;
      if (stored === null) dbSetItem(key, defaultValue);
    }
  };
  await Promise.all([initSetting('zoomSize', 22), initSetting('trans', false)]);
}

function gestureInit(verseList, page) {
  const pageContent = page.querySelector('.page__content');
  let startScrollTop;
  let isPinching = false;
  let pinchStartSize = 0;

  const gestureDetector = ons.GestureDetector(verseList);
  const toolbarBottom = () => page.querySelector('ons-toolbar')?.getBoundingClientRect().bottom || 0;

  gestureDetector.on('dragstart', () => {
    if (!isPinching) startScrollTop = pageContent.scrollTop;
  });

  gestureDetector.on('dragmove', (event) => {
    if (isPinching) return;
    const distance = event.gesture.distance * (event.gesture.direction === 'down' ? -1 : 1);
    pageContent.scrollTop = startScrollTop + distance;
  });

  gestureDetector.on('dragend', (event) => {
    if (isPinching) return;
    const snapOffset = (pageContent.clientHeight - 25) * (event.gesture.direction === 'left' ? -1 : 1);
    pageContent.scrollTo({ top: startScrollTop + snapOffset, behavior: 'smooth' });
  });

  // Swipe left/right navigates to next/prev song (only meaningful in list context)
  gestureDetector.on('swipeleft swiperight', (event) => {
    if (isPinching) return;
    const btnSelector = event.type === 'swiperight' ? '.prevSongBtn' : '.nextSongBtn';
    page.querySelector(btnSelector)?.click();
  });

  gestureDetector.on('pinchstart', () => {
    isPinching = true;
    pinchStartSize = appState.zoomSize;
  });

  gestureDetector.on('pinch', (event) => {
    if (!isPinching) return;
    const scale = 1 + 0.5 * (event.gesture.scale - 1);
    appState.zoomSize = Math.min(42, Math.max(10, Math.round(pinchStartSize * scale)));
    fontSizeUpdate();
  });

  gestureDetector.on('pinchend', () => {
    isPinching = false;
    dbSetItem('zoomSize', appState.zoomSize);
  });

  // Double-tap toggles translation visibility (only meaningful if a
  // translation exists — expandable-content is empty otherwise anyway).
  gestureDetector.on('doubletap', () => {
    const expandableItems = verseList.querySelectorAll('ons-list-item[expandable]');
    if (expandableItems.length === 0) return;

    appState.trans = !expandableItems[0].hasAttribute('expanded');
    expandableItems.forEach((item) => {
      if (appState.trans) item.setAttribute('expanded', '');
      else item.removeAttribute('expanded');
    });
    dbSetItem('trans', appState.trans);
  });
}

function gen_versePart(verseText, index) {
  const lines = verseText.split('\n');
  return `
    <hr class="hr-text" data-content="${index + 1}">
    <div class="verse-container">
      ${lines
        .map((line, lineIndex) => {
          const isIndent = lines.length === 5 ? lineIndex === 2 : lines.length > 3 && lineIndex % 2 !== 0;
          return `<div class="${isIndent ? 'lineIndent' : 'line'}">${line.replace(/⋅/g, '<wbr>')}</div>`;
        })
        .join('')}
    </div>
  `;
}

function render_verses(verseList, page, songId, song) {
  const translation = song.en_translation ? song.en_translation.split('\n\n') : null;
  page.querySelector('#transAvail').innerText = translation ? '' : 'No translation available.';

  const fragment = document.createDocumentFragment();
  const expandedAttr = appState.trans ? 'expanded' : '';

  song.verses.split('\n\n').forEach((verse, index) => {
    let transText = (translation && translation[index]) || '';
    if (index === 0 && song.translation_intro) {
      transText = `<div class="trans-intro">${song.translation_intro}</div>` + transText;
    }

    const item = ons.createElement(`
      <ons-list-item ${expandedAttr} expandable modifier="nodivider">
        <div class="center isCard">
          <ons-card class="verse-card">${gen_versePart(verse, index)}</ons-card>
        </div>
        <div class="right"></div>
        <div class="expandable-content trans-container">${transText}</div>
      </ons-list-item>
    `);

    fragment.appendChild(item);
  });

  verseList.innerHTML = '';
  verseList.appendChild(fragment);
  fontSizeUpdate();
}

function selectListDialog(songId) {
  const listNames = Object.keys(appState.lists);

  const dialogOptions = {
    title: 'Add to List',
    id: 'selectListDialog',
    buttonLabels: ['Cancel', 'Create'],
    primaryButtonIndex: 1,
    cancelable: true,
    placeholder: 'New list name',
    messageHTML: `
      <div class="dialog-label">${listNames.length > 0 ? 'Select a list:' : ''}</div>
      <ons-list id="dialogList" class="glassy dialog-list"></ons-list>
      <div class="dialog-label">${listNames.length > 0 ? 'Or create new:' : 'Create a new list:'}</div>
    `,
    autofocus: listNames.length === 0
  };

  ons.notification.prompt(dialogOptions).then((input) => {
    if (input && input.trim()) {
      const listName = input.trim();
      if (!appState.lists[listName]) addList(listName);
      addSongToList(songId, listName);
      document.getElementById('selectListDialog')?.remove();
    }
  });

  const dialogList = document.getElementById('dialogList');
  if (dialogList) {
    listNames.forEach((name) => {
      const item = gen_listItem(name);
      item.onclick = () => {
        const dialog = document.getElementById('selectListDialog');
        dialog.hide().then(() => dialog.remove());
        addSongToList(songId, name);
      };
      dialogList.appendChild(item);
    });
  }
}

function fontSizeUpdate() {
  document.querySelectorAll('.verse-container').forEach((el) => (el.style.fontSize = appState.zoomSize + 'px'));
  document.querySelectorAll('.trans-container').forEach((el) => (el.style.fontSize = appState.zoomSize - 2 + 'px'));
}
