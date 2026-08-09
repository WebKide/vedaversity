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
  page.querySelector('#pronounceGuide').onclick = () => navEl.pushPage('tmpl-pronounce');
  page.querySelector('#settingsBtn').onclick = () => navEl.pushPage('tmpl-settings');

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

  item.innerHTML = `
    <div class="center">${text}</div>
    <div class="right recent-delete-btn">
      <ons-icon icon="md-delete" style="color:#c62828; font-size: 22px;"></ons-icon>
    </div>
  `;

  const deleteBtn = item.querySelector('.recent-delete-btn');
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    onDelete();
  };

  let startX = 0;
  let startY = 0;
  let isHorizontal = false;

  item.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isHorizontal = false;
  }, { passive: true });

  item.addEventListener('touchmove', (e) => {
    const diffX = Math.abs(startX - e.touches[0].clientX);
    const diffY = Math.abs(startY - e.touches[0].clientY);
    // Only flag as horizontal if X movement clearly dominates Y
    if (diffX > diffY && diffX > 10) {
      isHorizontal = true;
    }
  }, { passive: true });

  item.addEventListener('touchend', (e) => {
    if (!isHorizontal) return; // ignore — let the vertical scroll happen

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (diff > 60) {
      item.classList.add('swiped');
    } else if (diff < -40) {
      item.classList.remove('swiped');
    }
  });

  item.onclick = () => {
    if (item.classList.contains('swiped')) {
      item.classList.remove('swiped');
      return;
    }
    onClick();
  };

  item.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    onDelete();
  });

  return item;
}

function render_recentListItems(page) {
  const container = page.querySelector('#recents-items');
  const header = page.querySelector('#recentHeader');
  const recentsWrap = page.querySelector('#recents');
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