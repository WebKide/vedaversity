/**
 * js/list_page.js
 * A single list's detail view: songs in order, drag-to-reorder (Sortable),
 * delete individual songs, add more via Search, and a toolbar menu to
 * rename/delete the whole list.
 */

function list_page_init(page) {
  let listName = page.data.listName;
  const titleEl = page.querySelector('.center');
  titleEl.innerText = listName;
  titleEl.style.cursor = 'pointer';
  titleEl.title = 'Tap to rename list';

  titleEl.onclick = () => {
    ons.notification.prompt({
      title: 'Rename List',
      message: 'Enter a new name for this list:',
      defaultValue: listName,
      buttonLabels: ['Cancel', 'Rename'],
      primaryButtonIndex: 1,
      cancelable: true
    }).then((input) => {
      if (input === null || input === undefined) return;
      const newName = input.trim();
      if (!newName || newName === listName) return;

      if (appState.lists[newName]) {
        ons.notification.toast(`A list named "${newName}" already exists`, { timeout: 2500 });
        return;
      }

      // Perform rename
      appState.lists[newName] = appState.lists[listName];
      delete appState.lists[listName];
      saveListsToDB();

      // Update recents that reference this list
      appState.recents = appState.recents.map(r => {
        if (r.listName === listName) return { ...r, listName: newName };
        return r;
      });
      dbSetItem('recents', appState.recents);

      // Update local variable and page data so all closures see the new name
      listName = newName;
      page.data.listName = newName;
      titleEl.innerText = newName;

      ons.notification.toast(`Renamed to "${newName}"`, { timeout: 2000 });
    });
  };

  const menuBtn = page.querySelector('#listMenuBtn');
  menuBtn.onclick = () => {
    ons.notification.confirm(`Delete list "${listName}"?`, {
      buttonLabels: ['Cancel', 'Delete']
    }).then((idx) => {
      if (idx === 1) {
        deleteList(listName);
        document.getElementById('navigator').popPage();
      }
    });
  };

  const listElement = page.querySelector('#list-list');

  function initSortable() {
    if (!window.Sortable || !listElement) return;
    if (listElement._sortable) listElement._sortable.destroy();
    listElement._sortable = Sortable.create(listElement, {
      delay: 400,
      handle: '.drag-handle',
      filter: '.no-drag',
      forceFallback: true,
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      onMove: (evt) => evt.related.id !== 'addSongToListBtn',
      onEnd: () => saveCurrentListOrder(listElement, listName)
    });
  }

  function refreshList() {
    render_songsInList(page, listName);
    initSortable();
  }

  refreshList();

  page.onShow = refreshList;
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

function gen_swipeableListItem(text, songId, onClick, onDelete) {
  const item = document.createElement('ons-list-item');
  item.setAttribute('tappable', '');
  item.className = 'recent-swipe-item';
  item.style.cssText = 'position:relative; overflow:hidden; touch-action:pan-y; user-select:none; -webkit-user-select:none;';
  item.dataset.songId = songId;

  item.innerHTML = `
    <div class="left drag-handle" style="display:flex;align-items:center;justify-content:center;padding:0 8px;z-index:3;cursor:grab;touch-action:none;">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--sub-text-color)">
        <path d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z"/>
      </svg>
    </div>
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
      <svg viewBox="0 -960 960 960" width="32" height="32" fill="#fff" aria-hidden="true" focusable="false">
        <path d="M600-240v-80h160v80H600Zm0-320v-80h280v80H600Zm0 160v-80h240v80H600ZM120-640H80v-80h160v-60h160v60h160v80h-40v360q0 33-23.5 56.5T440-200H200q-33 0-56.5-23.5T120-280v-360Zm80 0v360h240v-360H200Zm0 0v360-360Z"/>
      </svg>
      <span>DEL</span>
    </div>
  `;

  const center    = item.querySelector('.center');
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

  /* Swipe on the item body */
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

  /* Tap: navigate, close swipe, or ignore the first click after long-press */
  item.addEventListener('click', (e) => {
    if (e.target.closest('.recent-delete-btn')) return;
    if (e.target.closest('.drag-handle')) return; // let Sortable handle the handle
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    if (isOpen) { closeSwipe(); return; }
    onClick();
  });

  /* Long-press / right-click on the text area only → DEL swipe */
  center.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    longPressTimer = setTimeout(() => {
      openSwipe();
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt =>
    center.addEventListener(evt, () => clearTimeout(longPressTimer))
  );

  center.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    openSwipe();
  });

  /* Tap elsewhere on the page to close this swipe */
  document.addEventListener('click', (e) => {
    if (isOpen && !item.contains(e.target)) closeSwipe();
  });

  return item;
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

    songs.forEach((songId) => {
      const title = window.getSongTitle(songId);
      if (!title) return;

      const el = gen_swipeableListItem(
        title,
        songId,
        () => showSongViewUI(songId, listName),
        () => deleteSongFromList(songId, listName, page)
      );

      listElement.appendChild(el);
    });

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
