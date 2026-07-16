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
  const searchInput = page.querySelector('#search-input');
  searchInput.onfocus = () => {
    searchInput.blur();
    navEl.pushPage('tmpl-search');
  };

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

  // --- Recents action buttons ---
  const clearBtn = page.querySelector('#btn-clear-recents');
  const createBtn = page.querySelector('#btn-create-list-from-recents');

  if (clearBtn) clearBtn.onclick = window.clearRecents;
  if (createBtn) createBtn.onclick = window.createListFromRecents;

  activateTab('home');
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
    container.appendChild(gen_listItem(label, onClick));
  });

  const hasRecents = container.children.length > 0;
  header.style.display = hasRecents ? '' : 'none';
  recentsWrap.classList.toggle('glassy', hasRecents);
}

// Alias for backward compatibility with app.js
window.renderRecents = render_recentListItems;