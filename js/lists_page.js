/**
 * js/lists_page.js
 * Renders the "Lists" tab content inside the shell page: the user's
 * custom lists (with create/delete), and the hardcoded tattva (theme)
 * groups with their icons.
 */

function render_customLists(page) {
  const container = page.querySelector('#custom-lists');
  if (!container) return;

  container.innerHTML = '';
  const names = Object.keys(appState.lists);

  appendListItems(
    container,
    names,
    (name) => name,
    (name) => showListUI(name),
    (element, name, index) => showListContextMenu(page, element, name, index)
  );

  container.classList.toggle('glassy', names.length > 0);
}

function showListUI(listName) {
  document.getElementById('navigator').pushPage('tmpl-list', { data: { listName } });
}

function inputDialogAddListUI(page, defaultValue) {
  const options = {
    title: 'New List',
    buttonLabels: ['Cancel', 'Create'],
    primaryButtonIndex: 1,
    cancelable: true,
    defaultValue: defaultValue || '',
    placeholder: 'List name'
  };

  ons.notification.prompt('Enter a name for the new list:', options).then((input) => {
    if (!input || !input.trim()) return;
    const name = input.trim();
    if (!appState.lists[name]) addList(name);
    render_customLists(page);
    // Jump straight into the new list, ready to add a song via Search.
    showListUI(name);
  });
}

function showListContextMenu(page, element, listName, index) {
  const { popover, shareButton, deleteButton } = setupPopover(element, index);
  shareButton.style.display = 'none'; // list sharing isn't part of this build

  deleteButton.onclick = () => {
    popover.hide();
    ons.notification.confirm(`Delete list "${listName}"?`, { buttonLabels: ['Cancel', 'Delete'] }).then((idx) => {
      if (idx === 1) {
        deleteList(listName);
        render_customLists(page);
      }
    });
  };

  popover.show(element);
}

function render_tattvaLists(page) {
  const container = page.querySelector('#tattva-lists');
  if (!container) return;

  // Use filenames instead of hex IDs
  const tattvaLists = [
    { icon: 'ssguru', label: 'Śrī Guru', files: ["dp.json"] },
    { icon: 'vaishn', label: 'Vaiṣṇava', files: ["dp.json"] },
    { icon: 'snitai', label: 'Śrī Nitāi', files: ["dp.json"] },
    { icon: 'sgaura', label: 'Śrī Gaura', files: ["dp.json"] },
    { icon: 'nitaig', label: 'Nitāi & Gaurāṅga', files: ["dp.json"] },
    { icon: 'sradha', label: 'Śrīmatī Rādhā', files: ["dp.json"] },
    { icon: 'skrsna', label: 'Śrī Kṛṣṇa', files: ["dp.json"] },
    { icon: 'radhak', label: 'Śrī Śrī Rādhā & Kṛṣṇa', files: ["dp.json"] },
  ];

  container.innerHTML = '';

  const warned = document.createElement('div');
  warned.className = 'list-header--material';
  warned.style.cssText = 'text-align:center; opacity:.6; font-size:20px; font-width:700; width:100%; margin-top:8px; color: var(--highlight-color);';
  warned.textContent = 'LISTS ARE NOT YET SORTED, WAIT FOR NEXT UPDATE';
  container.appendChild(warned);

  tattvaLists.forEach((tattva) => {
    const item = ons.createElement(`
      <ons-list-item expandable>
        <div class="left"><img class="list-item__thumbnail" src="img/icons/${tattva.icon}.png"></div>
        <div class="center">${tattva.label}</div>
        <div class="expandable-content glassy"></div>
      </ons-list-item>
    `);

    const expandableContent = item.querySelector('.expandable-content');
    
    tattva.files.forEach((filename) => {
      // Find the numerical ID by searching the INDEX for the filename
      const id = window.INDEX.findIndex(rec => rec && rec[window.IDX_FILE] === filename);
      
      if (id !== -1) {
        const title = window.getSongTitle(id);
        expandableContent.appendChild(gen_listItem(title, () => showSongViewUI(id, null)));
      } else {
        console.warn(`File not found in index: ${filename}`);
      }
    });

    container.appendChild(item);
  });
}

/* changed from HEX to songID
function render_tattvaLists(page) {
  const container = page.querySelector('#tattva-lists');
  if (!container) return;

  const tattvaLists = [
    { icon: 'ssguru', label: 'Śrī Guru', ids: [0xa6, 0xa8, 0xa9, 0xaa, 0xb0, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xbc, 0xc4, 0xc6, 0xc8, 0xc9, 0xca, 0xcb, 0xce, 0xcf] },
    { icon: 'vaishn', label: 'Vaiṣṇava', ids: [0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7c] },
    { icon: 'snitai', label: 'Śrī Nitāi', ids: [0xf5, 0x10b, 0x119, 0x11e, 0x11f] },
    { icon: 'sgaura', label: 'Śrī Gaura', ids: [0x8e, 0x8f, 0x90, 0x92, 0x97, 0x98, 0x9b, 0x9c] },
    { icon: 'nitaig', label: 'Nitāi & Gaurāṅga', ids: [0xd3, 0xd4, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xdc, 0xdd, 0xdf, 0xe1, 0xe2, 0xe5] },
    { icon: 'sradha', label: 'Śrīmatī Rādhā', ids: [0xfc, 0xfe, 0x100, 0x101, 0x102, 0x103, 0x105, 0x106, 0x107, 0x108, 0x109] },
    { icon: 'skrsna', label: 'Śrī Kṛṣṇa', ids: [0x124, 0x125, 0x129, 0x12a, 0x12b, 0x12d, 0x12e, 0x12f, 0x134, 0x135, 0x137, 0x140, 0x144, 0x145, 0x146, 0x147] },
    { icon: 'radhak', label: 'Śrī Śrī Rādhā & Kṛṣṇa', ids: [0x5d, 0x5e, 0x5f, 0x60, 0x61, 0x62, 0x63, 0x64] }
  ];

  container.innerHTML = '';

  tattvaLists.forEach((tattva) => {
    const item = ons.createElement(`
      <ons-list-item expandable>
        <div class="left"><img class="list-item__thumbnail" src="img/icons/${tattva.icon}.png"></div>
        <div class="center">${tattva.label}</div>
        <div class="expandable-content glassy"></div>
      </ons-list-item>
    `);

    const expandableContent = item.querySelector('.expandable-content');
    tattva.ids.forEach((id) => {
      const title = window.getSongTitle(id);
      if (!title) return;
      expandableContent.appendChild(gen_listItem(title, () => showSongViewUI(id, null)));
    });

    container.appendChild(item);
  });
}
*/