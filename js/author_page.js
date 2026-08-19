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
          <svg viewBox="0 0 24 24"
               width="20"
               height="20"
               fill="var(--highlight-color)"
               aria-hidden="true">
            <path d="M17.6 12.3c0-1.6 1.3-3 2.9-3 .9 0 1.7.4 2.3 1.1-.9-6.1-6.6-10.3-12.7-9.3-4.8.7-8.6 4.5-9.3 9.3 1.1-1.2 3-1.4 4.2-.3s1.4 2.9.3 4.2c-.6.7-1.4 1.1-2.3 1-.8 0-1.6-.3-2.1-.9 1.3 6 7.3 9.8 13.3 8.4 4.2-.9 7.5-4.2 8.4-8.4-.5.6-1.3.9-2.1.9-1.5 0-2.9-1.3-2.9-3m-3.5-.5c-.1 1-.8 1.8-1.7 2 1 .2 1.7 1.1 1.7 2.1s-1.6 4.2-2 5.1v.1c-.1 0-.1 0-.2-.1-.4-.9-2-4.1-2-5.1s.7-1.9 1.7-2.1c-.9-.2-1.6-1-1.7-2V3.1l1-.2v8.7c.1.7.7 1.2 1.4 1.1.6-.1.9-.5 1-1.1V2.9l1 .2z"/>
          </svg>
        </div>

        <div class="center author-row-center">
          <div class="author-marquee-viewport">
            <span class="author-marquee-text">
              ${escapeHtml(author)}
              <span class="total-songs-num">[${songs.length}]</span>
            </span>
          </div>
        </div>

        <div class="right author-chevron">
          <ons-icon icon="md-chevron-right"></ons-icon>
        </div>

        <div class="expandable-content glassy"></div>
      </ons-list-item>
    `);

    // Activate marquee scrolling for long author names.
    requestAnimationFrame(() => {
      const viewport = item.querySelector('.author-marquee-viewport');
      const text = item.querySelector('.author-marquee-text');

      if (!viewport || !text) return;

      const overflow = text.scrollWidth - viewport.clientWidth;

      if (overflow > 0) {
        const duration = Math.max(5, Math.min(16, overflow / 20));

        text.style.setProperty('--marquee-offset', `-${overflow}px`);
        text.style.setProperty('--marquee-duration', `${duration}s`);
        text.classList.add('marquee');
      }
    });

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