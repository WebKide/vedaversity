/**
 * js/home_page.js
 * The persistent root "shell" — Home and Lists tabs, plus the search box,
 * recents list, and the 3-item grid (All Songs / Pronunciation / Settings).
 */

function shell_page_init(page) {
  const navEl = document.getElementById('navigator');

  const tabHome = page.querySelector('#tab-home');
  const tabLists = page.querySelector('#tab-lists');
  const btnHome = page.querySelector('#tabBtnHome');
  const btnLists = page.querySelector('#tabBtnLists');

  function activateTab(name) {
    const isHome = name === 'home';
    tabHome.style.display = isHome ? 'block' : 'none';
    tabLists.style.display = isHome ? 'none' : 'block';
    btnHome.classList.toggle('active', isHome);
    btnLists.classList.toggle('active', !isHome);

    if (isHome) {
      render_recentListItems(page);
    } else {
      render_customLists(page);
      render_tattvaLists(page);
    }
  }

  btnHome.onclick = () => activateTab('home');
  btnLists.onclick = () => activateTab('lists');

  // --- Home tab wiring ---
  const searchTrigger = page.querySelector('#search-trigger');
  if (searchTrigger) {
    searchTrigger.onclick = () => navEl.pushPage('tmpl-search');
  }

  page.querySelector('#allSongs').onclick = () => navEl.pushPage('tmpl-all-songs');
  page.querySelector('#authorsBtn').onclick = () => navEl.pushPage('tmpl-authors');
  page.querySelector('#pronounceGuide').onclick = () => navEl.pushPage('tmpl-pronounce');
  page.querySelector('#settingsBtn').onclick = () => navEl.pushPage('tmpl-settings');

  // --- Home image version caption tap ---
  const imgWrap = page.querySelector('.home-image-wrap');
  let captionTimer;
  if (imgWrap) {
    imgWrap.addEventListener('click', () => {
      imgWrap.classList.add('is-visible');
      clearTimeout(captionTimer);
      captionTimer = setTimeout(() => {
        console.log('Hiding caption...'); // Debug check
        imgWrap.classList.remove('is-visible');
      }, 5200);
    });
  }

  // --- Lists tab wiring ---
  page.querySelector('#createListBtn').onclick = () => inputDialogAddListUI(page);

  // Recents can change while we're away (e.g. song viewed from a list),
  // so refresh whenever the shell comes back into view.
  page.onShow = () => {
    if (btnHome.classList.contains('active')) render_recentListItems(page);
    else { render_customLists(page); render_tattvaLists(page); }
  };

  // --- Recents action buttons (popover) ---
  const menuBtn = page.querySelector('#recentsMenuBtn');
  const popover = page.querySelector('#recentsPopover');

  if (menuBtn && popover) {
    menuBtn.onclick = () => {
      popover.show(menuBtn);
    };
  }

  const clearBtn = page.querySelector('#btn-clear-recents');
  const createBtn = page.querySelector('#btn-create-list-from-recents');

  if (clearBtn) clearBtn.onclick = () => {
    popover.hide();
    window.clearRecents();
  };
  if (createBtn) createBtn.onclick = () => {
    popover.hide();
    window.createListFromRecents();
  };

  activateTab('home');
}

function gen_swipeableRecentItem(text, onClick, onDelete) {
  const item = document.createElement('ons-list-item');
  item.setAttribute('tappable', '');
  item.className = 'recent-swipe-item';
  item.style.cssText = 'position:relative; overflow:hidden; touch-action:pan-y; user-select:none; -webkit-user-select:none;';

  item.innerHTML = `
    <div class="center" style="position:relative; z-index:2; background:inherit; transition:margin-right .25s ease; padding-right:16px;">${text}</div>
    <div class="right recent-delete-btn"
         style="
           position:absolute;
           right:0; top:0; bottom:0;
           width:90px;
           background:#c62828;
           display:flex;
           flex-direction:column;
           align-items:center;
           justify-content:space-between;
           padding:12px 0;
           z-index:1;
           transform:translateX(100%);
           transition:transform .25s ease;
           color:#fff;
           font-weight:400;
           font-size:.65rem;">

      <svg viewBox="0 -960 960 960"
           width="32"
           height="32"
           fill="#fff"
           aria-hidden="true"
           focusable="false">
        <path d="M600-240v-80h160v80H600Zm0-320v-80h280v80H600Zm0 160v-80h240v80H600ZM120-640H80v-80h160v-60h160v60h160v80h-40v360q0 33-23.5 56.5T440-200H200q-33 0-56.5-23.5T120-280v-360Zm80 0v360h240v-360H200Zm0 0v360-360Z"/>
      </svg>

      <span>DEL</span>
    </div>
  `;

  const center   = item.querySelector('.center');
  const deleteBtn = item.querySelector('.recent-delete-btn');

  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  let startX = 0, startY = 0, isHorizontal = false, isOpen = false, longPressTimer = null;
  let suppressNextClick = false;

  const openSwipe = () => {
    if (isOpen) return;
    isOpen = true;
    center.style.marginRight = '90px';
    deleteBtn.style.transform = 'translateX(0)';
    item.classList.add('swiped');
    suppressNextClick = true;
  };

  const closeSwipe = () => {
    if (!isOpen) return;
    isOpen = false;
    center.style.marginRight = '0';
    deleteBtn.style.transform = 'translateX(100%)';
    item.classList.remove('swiped');
  };

  /* ---- Swipe ---- */
  item.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isHorizontal = false;
  }, { passive: true });

  item.addEventListener('touchmove', (e) => {
    const diffX = Math.abs(startX - e.touches[0].clientX);
    const diffY = Math.abs(startY - e.touches[0].clientY);
    if (diffX > diffY && diffX > 10) isHorizontal = true;
  }, { passive: true });

  item.addEventListener('touchend', (e) => {
    if (!isHorizontal) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 60) openSwipe();
    else if (diff < -40) closeSwipe();
  });

  /* ---- Tap to navigate, or tap-to-close when open ---- */
  item.addEventListener('click', (e) => {
    if (e.target.closest('.recent-delete-btn')) return;
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    if (isOpen) { closeSwipe(); return; }
    onClick();
  });

  /* ---- Long-press / right-click to reveal delete button ---- */
  item.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    longPressTimer = setTimeout(() => {
      openSwipe();
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt =>
    item.addEventListener(evt, () => clearTimeout(longPressTimer))
  );

  item.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    openSwipe();
  });

  /* Tap elsewhere on the page to close this swipe */
  document.addEventListener('click', (e) => {
    if (isOpen && !item.contains(e.target)) closeSwipe();
  });

  return item;
}

function render_recentListItems(page) {
  const scope = page || document;
  const container = scope.querySelector('#recents-items');
  const header = scope.querySelector('#recentHeader');
  const recentsWrap = scope.querySelector('#recents');
  if (!container) return;

  container.innerHTML = '';

  appState.recents.forEach((entry) => {
    let label, onClick;

    if (entry.listName && appState.lists[entry.listName]) {
      const list = appState.lists[entry.listName];
      const pos = list.indexOf(entry.id);
      if (pos === -1) return;
      label = `${entry.listName} (${pos + 1})`;
      onClick = () => showSongViewUI(entry.id, entry.listName);
    } else {
      label = window.getSongTitle(entry.id);
      onClick = () => showSongViewUI(entry.id, null);
    }

    if (!label) return;

    const el = gen_swipeableRecentItem(label, onClick, () => {
      removeFromRecents(entry.id, entry.listName || null);
      render_recentListItems(page);
      const title = window.getSongTitle(entry.id) || entry.id;
      if (window.ons) ons.notification.toast(`Removed "${title}" from recents`, { timeout: 1800 });
    });

    const idValue = entry.id;
    if (idValue !== undefined && idValue !== null) {
      el.dataset.songId = idValue;
    }

    container.appendChild(el);
  });

  const hasRecents = container.children.length > 0;
  header.style.display = hasRecents ? '' : 'none';
  recentsWrap.classList.toggle('glassy', hasRecents);
}

// Alias for backward compatibility with app.js
window.renderRecents = render_recentListItems;