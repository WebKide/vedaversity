/**
 * js/songView_page.js
 * Song view: loads /SO/<filename>.json directly (no fflate decompression —
 * data is plain JSON now), renders verses + translation, handles
 * double-tap-to-toggle-translation, pinch-to-zoom (persisted), swipe/
 * pagination between songs when opened from a list, and add-to-list /
 * copy-share from the toolbar menu.
 */
 
const songDataCache = {};
 
window.escapeHtml = function(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
};
 
/**
 * Returns the song record from the unified in-memory index.
 * All verse data is already inline — no secondary fetch required.
 */
async function loadSongData(songId) {
  const rec = window.INDEX && window.INDEX[songId];
  if (!rec) throw new Error('Unknown song id: ' + songId);
  return rec;
}
 
async function songView_page_init(page) {
  // 1. Data extraction & validation
  const data = page.data || {};
  const songId = data.songId || data.id;
  const listName = data.listName;
  const songList = data.songList;
 
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
    const firstLine = rec.first_line || '';
    const author = song.author || '';
    const fileName = rec.file_name || songId || '';
 
    if (author) {
      titleElement.innerHTML = `
        <div class="title-line">
          <span class="title-text">${escapeHtml(firstLine)}</span>
        </div>
        <div class="author-line">
          <span class="author-text">
            <i>by ${escapeHtml(author)}</i>
            <span class="song-file-name"> “${escapeHtml(fileName)}”</span>
          </span>
        </div>
      `;
      titleElement.classList.add('author-container');
    } else {
      titleElement.textContent = firstLine;
    }
 
    // Independent marquee for each line
    requestAnimationFrame(() => {
      const measureAndScroll = (lineSelector, textSelector) => {
        const line = titleElement.querySelector(lineSelector);
        if (!line) return;
        const span = line.querySelector(textSelector);
        if (!span) return;
        const overflow = span.scrollWidth - line.clientWidth;
        if (overflow > 0) {
          const duration = Math.max(5, Math.min(16, overflow / 20));
          span.style.setProperty('--marquee-offset', `-${overflow}px`);
          span.style.setProperty('--marquee-duration', `${duration}s`);
          span.classList.add('marquee');
          line.classList.add('scrolls');
        }
      };
 
      measureAndScroll('.title-line', '.title-text');
      measureAndScroll('.author-line', '.author-text');
    });
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
  setupFooterNav(page, songId, listName, songList);
  setupMenuButtons(page, songId, rec.first_line);
  gestureInit(verseList, page);
 
  // 6. Desktop listener: Ctrl++ / Ctrl+- to zoom
  page.addEventListener('keydown', (e) => {
    if (!e.ctrlKey) return;
 
    let changed = false;
    if (e.key === '+' || e.key === '.') {
      appState.zoomSize = Math.min(42, appState.zoomSize + 2);
      changed = true;
    } else if (e.key === '-' || e.key === ',') {
      appState.zoomSize = Math.max(10, appState.zoomSize - 2);
      changed = true;
    }
 
    if (changed) {
      e.preventDefault();
      fontSizeUpdate();
      dbSetItem('zoomSize', appState.zoomSize);
    }
  });
 
  // 7. Lifecycle & Analytics
  if (typeof addRecent === 'function' && !data.skipRecent) addRecent(songId);
 
  page.onShow = (typeof keepAwake === 'function') ? keepAwake : null;
 
  const _origOnHide = (typeof allowSleep === 'function') ? allowSleep : null;
  page.onHide = () => {
    if (_origOnHide) _origOnHide();
    // Clean up outside-click listener
    if (page._closePopoverOnOutside) {
      document.removeEventListener('click', page._closePopoverOnOutside);
      page._closePopoverOnOutside = null;
    }
    // Also close popover if still open when leaving the page
    const popover = page.querySelector('#songViewPopover');
    if (popover && popover.visible) popover.hide();
  };
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
 
function setupMenuButtons(page, songId, songTitle) {
  const menuBtn = page.querySelector('#songViewMenuBtn');
  const popover = page.querySelector('#songViewPopover');
  menuBtn.onclick = () => popover.show(menuBtn);
 
  // Close centered popover when tapping outside its content
  const closeOnOutside = (e) => {
    if (!popover.visible) return;
    if (menuBtn.contains(e.target)) return;
    const content = popover.querySelector('.popover__content');
    if (content && content.contains(e.target)) return;
    popover.hide();
  };
  document.addEventListener('click', closeOnOutside);
  page._closePopoverOnOutside = closeOnOutside;
 
  // Font-size toolbar buttons (+ / −)
  const decBtn = page.querySelector('#lb-font-decrease');
  const incBtn = page.querySelector('#lb-font-increase');
  if (decBtn) {
    decBtn.onclick = () => {
      appState.zoomSize = Math.max(10, appState.zoomSize - 2);
      fontSizeUpdate();
      dbSetItem('zoomSize', appState.zoomSize);
    };
  }
  if (incBtn) {
    incBtn.onclick = () => {
      appState.zoomSize = Math.min(42, appState.zoomSize + 2);
      fontSizeUpdate();
      dbSetItem('zoomSize', appState.zoomSize);
    };
  }
 
  page.querySelector('#listBtn').onclick = () => {
    popover.hide();
    selectListDialog(songId);
  };
 
  const shareBtn = page.querySelector('#shareBtn');
  const titleEl = page.querySelector('#songTitle');
 
  // Tap title to share (helpful when toolbar buttons crowd the menu on small screens)
  if (titleEl && shareBtn) {
    titleEl.title = 'Tap to share';
    titleEl.addEventListener('click', () => shareBtn.click());
  }
 
  if (shareBtn) {
    shareBtn.onclick = debouncify(async () => {
      popover.hide();
      const song = window.INDEX[songId];
 
      const titleLine = `*${songTitle}*`;
      const authorLine = song.author ? `by ${song.author}` : '';
 
      // 1. Get raw verses
      let formattedVerses = song.verses;
 
      // 2. Replace tags (<b>, <highlight>, <i>, <em>) and their closing counterparts with '*'
      formattedVerses = formattedVerses.replace(/<\/?(b|highlight|i|em|mark)>/gi, '*');
 
      // 3. Remove the special dot character and construct final text
      const text = `${titleLine}\n${authorLine}\n\n${formattedVerses.replace(/⋅/g, '')}`;
 
      try {
        if (navigator.share) {
          await navigator.share({ title: songTitle, text: text });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          ons.notification.toast('Copied to clipboard', { timeout: 1800 });
        }
      } catch (err) {
        console.error("Share failed:", err);
      }
    });
  }
}
 
/**
 * Smart footer navigation — appears at the bottom of the scrollable
 * content (after #footerSpacer) so it is only seen once the user has
 * scrolled through the whole song.
 */
function setupFooterNav(page, songId, listName, songList) {
  // Clean up any previous footer on this page instance
  page.querySelectorAll('.song-footer-nav').forEach(el => el.remove());
 
  const list = (listName && appState.lists[listName]) || songList;
  if (!Array.isArray(list) || list.length === 0) return;
 
  const currentIndex = list.indexOf(songId);
  if (currentIndex === -1) return;
 
  // Wrap-around indices
  const prevIndex = (currentIndex - 1 + list.length) % list.length;
  const nextIndex = (currentIndex + 1) % list.length;
  const prevId = list[prevIndex];
  const nextId = list[nextIndex];
 
  const prevRec = window.INDEX[prevId];
  const nextRec = window.INDEX[nextId];
  if (!prevRec || !nextRec) return;
 
  // Build footer matching Home | Lists tabbar structure exactly
  const footer = document.createElement('div');
  footer.className = 'song-footer-nav tabbar ons-tabbar__footer';
  
  footer.innerHTML = `
    <div class="bottom-tabbar__row">
      <button class="footer-nav-prev tabbar-btn" data-song-id="${escapeHtml(prevId)}">
        <div class="left">
          <svg class="footer-nav-icon" viewBox="0 -960 960 960" height="20px" width="20px" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/>
          </svg>
        </div>
        <span class="footer-nav-title">${escapeHtml(prevRec.first_line || prevRec.title || 'Unknown')}</span>
      </button>
      <div class="footer-nav-divider">|</div>
      <button class="footer-nav-next tabbar-btn" data-song-id="${escapeHtml(nextId)}">
        <span class="footer-nav-title">${escapeHtml(nextRec.first_line || nextRec.title || 'Unknown')}</span>
        <div class="left">
          <svg class="footer-nav-icon" viewBox="0 -960 960 960" height="20px" width="20px" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/>
          </svg>
        </div>
      </button>
    </div>
  `;
 
  // Tap/click handlers — replacePage to avoid back-history stack
  footer.querySelector('.footer-nav-prev').onclick = () => {
    document.getElementById('navigator').replacePage('tmpl-songview', {
      data: { songId: prevId, listName, songList, skipRecent: true }
    });
  };
  footer.querySelector('.footer-nav-next').onclick = () => {
    document.getElementById('navigator').replacePage('tmpl-songview', {
      data: { songId: nextId, listName, songList, skipRecent: true }
    });
  };
 
  // Place immediately after the footer spacer so it sits at the very end
  const spacer = page.querySelector('#footerSpacer');
  if (spacer && spacer.parentNode) {
    spacer.parentNode.insertBefore(footer, spacer.nextSibling);
  } else {
    const content = page.querySelector('.page__content');
    if (content) content.appendChild(footer);
  }
 
  // Activate marquee scrolling for long titles
  requestAnimationFrame(() => {
    footer.querySelectorAll('.footer-nav-title').forEach(span => {
      const overflow = span.scrollWidth - span.clientWidth;
      if (overflow > 0) {
        const duration = Math.max(5, Math.min(16, overflow / 20));
        span.style.setProperty('--marquee-offset', `-${overflow}px`);
        span.style.setProperty('--marquee-duration', `${duration}s`);
        span.classList.add('marquee');
      }
    });
  });
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
 
/**
 * Touch screen gestures, need to make sure scroll up/down work well
 * each verse must snap to the bottom of the top nav-bar.
 */
function gestureInit(verseList, page) {
  const pageContent = page.querySelector('.page__content');
  let startScrollTop;
  let isPinching = false;
  let pinchStartSize = 0;
 
  const gestureDetector = ons.GestureDetector(verseList);
  const toolbarBottom = () =>
    page.querySelector('ons-toolbar')?.getBoundingClientRect().bottom || 0;
 
  gestureDetector.on('dragstart', () => {
    if (!isPinching) startScrollTop = pageContent.scrollTop;
  });
 
  gestureDetector.on('dragmove', (event) => {
    if (isPinching) return;
    event.gesture.preventDefault();
 
    const distance =
      event.gesture.distance *
      (event.gesture.direction === 'down' ? -1 : 1);
 
    pageContent.scrollTop = startScrollTop + distance;
  });
 
  // Swipe left/right navigates to next/prev song
  gestureDetector.on('swipeleft swiperight', (event) => {
    if (isPinching) return;
 
    const isPrev = event.type === 'swiperight';
    const footerBtn = page.querySelector(
      isPrev ? '.footer-nav-prev' : '.footer-nav-next'
    );
 
    if (footerBtn) {
      footerBtn.click();
    } else {
      const btnSelector = isPrev ? '.prevSongBtn' : '.nextSongBtn';
      const btn = page.querySelector(btnSelector);
 
      if (btn && !btn.disabled) btn.click();
    }
  });
 
  gestureDetector.on('pinchstart', () => {
    isPinching = true;
    pinchStartSize = appState.zoomSize;
  });
 
  gestureDetector.on('pinch', (event) => {
    if (!isPinching) return;
 
    const scale = 1 + 0.5 * (event.gesture.scale - 1);
 
    appState.zoomSize = Math.min(
      42,
      Math.max(10, Math.round(pinchStartSize * scale))
    );
 
    fontSizeUpdate();
  });
 
  gestureDetector.on('pinchend', () => {
    isPinching = false;
    dbSetItem('zoomSize', appState.zoomSize);
  });
 
  // Double-tap toggles ALL translations while keeping
  // the tapped verse fixed at the same screen position.
  gestureDetector.on('doubletap', (event) => {
    const expandableItems =
      verseList.querySelectorAll('ons-list-item[expandable]');
 
    if (expandableItems.length === 0 || !pageContent) return;
 
    const tapEl =
      event.target instanceof Element
        ? event.target
        : event.target?.parentElement;
 
    const targetItem =
      tapEl?.closest('ons-list-item[expandable]');
 
    if (!targetItem) return;
 
    // Remember the exact visual position of the tapped verse.
    const anchorY =
      targetItem.getBoundingClientRect().top;
 
    // Prevent the browser from independently moving the scroll
    // position while the list changes height.
    const previousOverflowAnchor =
      pageContent.style.overflowAnchor;
 
    pageContent.style.overflowAnchor = 'none';
 
    const willExpand =
      !targetItem.hasAttribute('expanded');
 
    appState.trans = willExpand;
 
    expandableItems.forEach((item) => {
      if (willExpand) {
        item.setAttribute('expanded', '');
      } else {
        item.removeAttribute('expanded');
      }
    });
 
    dbSetItem('trans', appState.trans);
 
    // Wait until the target's position has stopped changing.
    let lastY = null;
    let stableFrames = 0;
    const requiredStableFrames = 3;
 
    function settle() {
      const currentY =
        targetItem.getBoundingClientRect().top;
 
      if (lastY !== null && Math.abs(currentY - lastY) < 0.5) {
        stableFrames++;
      } else {
        stableFrames = 0;
      }
 
      lastY = currentY;
 
      if (stableFrames < requiredStableFrames) {
        requestAnimationFrame(settle);
        return;
      }
 
      // How far did the anchor move?
      const delta = currentY - anchorY;
 
      // Move the scroll position by exactly that amount.
      pageContent.scrollTop += delta;
 
      // Restore normal browser scroll anchoring.
      pageContent.style.overflowAnchor =
        previousOverflowAnchor;
    }
 
    requestAnimationFrame(settle);
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
 
    // Double-tap toggles all translations
    item.toggleExpansion = () => {};
 
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
  const verseSize = appState.zoomSize;
  const transSize = Math.max(10, appState.zoomSize - 2);
 
  document.querySelectorAll('.verse-container').forEach((el) => {
    el.style.fontSize = verseSize + 'px';
    el.style.lineHeight = '1.5';   /* unitless — scales with the font-size */
  });
 
  document.querySelectorAll('.trans-container').forEach((el) => {
    el.style.fontSize = transSize + 'px';
    el.style.lineHeight = '1.5';
  });
}