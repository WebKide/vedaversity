/**
 * js/list_page.js
 * A single list's detail view: songs in order, drag-to-reorder (Sortable),
 * delete individual songs, add more via Search, and a toolbar menu to
 * rename/delete the whole list.
 */

function list_page_init(page) {
  const listName = page.data.listName;
  page.querySelector('.center').innerText = listName;

  const menuBtn = page.querySelector('#listMenuBtn');
  menuBtn.onclick = () => showListContextMenu(page, menuBtn, listName, 0);

  render_songsInList(page, listName);

  const listElement = page.querySelector('#list-list');
  if (window.Sortable) {
    Sortable.create(listElement, {
      delay: 400,
      filter: '.no-drag',
      onMove: (evt) => evt.related.id !== 'addSongToListBtn',
      onEnd: () => saveCurrentListOrder(listElement, listName)
    });
  }
}

function gen_addBtn(listName) {
  const btn = ons.createElement(`
    <ons-list-item id="addSongToListBtn" class="no-drag" tappable modifier="md-outline">
      <svg class="add-icon"
           viewBox="0 0 24 24"
           height="24px" 
           width="24px" 
           fill="var(--highlight-color)"
           aria-hidden="true"
           focusable="false">
        <path d="M11 17h2v-4h4v-2h-4V7h-2v4H7v2h4zm-8 2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2m2 0h14V5H5zM5 5v14z"/>
      </svg>
      Add a song to this list
    </ons-list-item>
  `);
  btn.onclick = () => {
    document.getElementById('navigator').pushPage('tmpl-search', { data: { listName } });
  };
  return btn;
}

function render_songsInList(page, listName) {
  const listElement = page.querySelector('#list-list');
  const infoBlurb = page.querySelector('#infoBlurb');
  if (!listElement) return;

  const songs = appState.lists[listName] || [];
  listElement.innerHTML = '';

  if (songs.length === 0) {
    infoBlurb.style.display = 'none';
    listElement.classList.remove('glassy');
    listElement.appendChild(gen_addBtn(listName));

    const emptyState = document.createElement('div');
    emptyState.className = 'default_img_container';
    emptyState.innerHTML = `<img src="img/list_default.png">`;
    listElement.appendChild(emptyState);
    fitElementToPage(emptyState);
  } else {
    infoBlurb.style.display = '';
    listElement.classList.add('glassy');

    appendListItems(
      listElement,
      songs,
      (songId) => window.getSongTitle(songId),
      (songId) => showSongViewUI(songId, listName),
      (element, songId, index) => showListSongContextMenu(page, element, songId, listName, index)
    );

    listElement.appendChild(gen_addBtn(listName));
  }
}

function showListSongContextMenu(page, element, songId, listName, index) {
  const { popover, shareButton, deleteButton } = setupPopover(element, index);
  shareButton.style.display = 'none';

  deleteButton.onclick = () => {
    popover.hide();
    deleteSongFromList(songId, listName, page);
  };

  popover.show(element);
}

function deleteSongFromList(songId, listName, page) {
  const list = appState.lists[listName];
  if (list) appState.lists[listName] = list.filter((id) => id !== songId);

  const title = window.getSongTitle(songId) || songId;
  ons.notification.toast(`Deleted "${title}" from "${listName}"`, { timeout: 2000 });

  saveListsToDB();
  removeListSongFromRecents(listName, songId);
  render_songsInList(page, listName);
}

function saveCurrentListOrder(listElement, listName) {
  const order = Array.from(listElement.children)
    .map((child) => child.dataset.songId)
    .filter((id) => id !== undefined)
    .map((id) => (isNaN(id) ? id : Number(id)));

  if (order.length) {
    appState.lists[listName] = order;
    saveListsToDB();
  }
}
