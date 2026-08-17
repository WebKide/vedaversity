/**
 * js/author_page.js
 * Groups every song in the index by its author field.
 * Missing authors land in "Anonymous Vaiṣṇava" at the end.
 * Authors are sorted A–Z; songs under each author are sorted by first_line.
 */

function author_page_init(page) {
  const container = page.querySelector('#author-list');
  if (!container) return;
  container.innerHTML = '';

  const idx = window.INDEX || {};
  const authorMap = {};

  // 1. Build the map
  Object.values(idx).forEach((rec) => {
    const raw = (rec.author || '').trim();
    const author = raw
      ? capitalizeAuthorName(raw)
      : 'Anonymous Vaiṣṇava';

    if (!authorMap[author]) authorMap[author] = [];
    authorMap[author].push(rec);
  });

  // 2. Sort authors A–Z, but force Anonymous to the very end
  const authors = Object.keys(authorMap).sort((a, b) => {
    if (a === 'Anonymous Vaiṣṇava') return 1;
    if (b === 'Anonymous Vaiṣṇava') return -1;
    return a.localeCompare(b);
  });

  // 3. Render each author as an expandable group
  authors.forEach((author) => {
    const songs = authorMap[author];

    // Sort songs alphabetically by first_line
    songs.sort((a, b) => {
      const ta = (a.first_line || a.file_name || '').toLowerCase();
      const tb = (b.first_line || b.file_name || '').toLowerCase();
      return ta.localeCompare(tb);
    });

    const item = ons.createElement(`
      <ons-list-item expandable modifier="nodivider">
        <div class="left">
          <svg viewBox="0 -960 960 960"
               width="20"
               height="20"
               fill="var(--highlight-color)"
               aria-hidden="true">
            <path d="M272-160q-30 0-51-21t-21-51q0-21 12-39.5t32-26.5l156-62v-90q-54 63-125.5 96.5T120-320v-80q68 0 123.5-28T344-508l54-64q12-14 28-21t34-7h40q18 0 34 7t28 21l54 64q45 52 100.5 80T840-400v80q-83 0-154.5-33.5T560-450v90l156 62q20 8 32 26.5t12 39.5q0 30-21 51t-51 21H400v-20q0-26 17-43t43-17h120q9 0 14.5-5.5T600-260q0-9-5.5-14.5T580-280H460q-42 0-71 29t-29 71v20h-88Zm151.5-503.5Q400-687 400-720t23.5-56.5Q447-800 480-800t56.5 23.5 23.5 56.5-23.5 56.5Q513-640 480-640t-56.5-23.5Z"/>
          </svg>
        </div>
        <div class="center">
          ${escapeHtml(author)}
          <span class="total-songs-num">[${songs.length}]</span>
        </div>
        <div class="expandable-content glassy"></div>
      </ons-list-item>
    `);

    // Make author groups behave like an accordion.
    item.addEventListener('expand', () => {
      container.querySelectorAll('ons-list-item[expandable]').forEach((otherItem) => {
        if (otherItem !== item && otherItem.hasAttribute('expanded')) {
          otherItem.removeAttribute('expanded');
        }
      });
    });

    const content = item.querySelector('.expandable-content');
    songs.forEach((song) => {
      const label = song.first_line || song.file_name || 'Unknown';
      content.appendChild(gen_listItem(label, () => {
        showSongViewUI(song.file_name, null);
      }));
    });

    container.appendChild(item);
  });

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
}

function capitalizeAuthorName(name) {
  return name
    .split(/\s+/)
    .map(word => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}