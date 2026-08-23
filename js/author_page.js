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

  const authorIntro = document.createElement('div');
  authorIntro.className = 'glassy list-item__subtitle';
  /* touch-action: manipulation prevents the browser from zooming on double-tap */
  authorIntro.style.cssText = 'text-align:left; font-size:16px; padding:16px; margin:12px 6px; touch-action: manipulation;';

  const teaser = 'An unprecedented collection of Sanskrit, Bengali, Hindi, and Brajbhasa devotional poems, prayers and songs written by the <i>Gauḍīya Vaiṣṇava ācāryas</i>.';

  const rest = 'Compiled under the direction of our most worshipful <i>Gurudeva</i>, <i>oṁ viṣṇupāda paramahaṁsa parivrājakācārya aṣṭottara-śata Śrī Śrīmad Bhaktivedānta Nārāyaṇa Mahārāja</i>. <br/><br/>The devotional songs of the <i>Gauḍīya Vaiṣṇava</i> tradition were first brought to the Western world through the preaching of <i>Śrī Śrīmad A. C. Bhaktivedānta Swami Prabhupāda</i>, founder-ācārya of the International Society for Kṛṣṇa Consciousness. He carried the teachings and mission of <i>Śrī Caitanya Mahāprabhu</i> beyond India. The preaching of <i>Śrīla Prabhupāda</i> was subsequently continued by <i>Śrīla Bhaktivedānta Nārāyaṇa Mahārāja</i>, who travelled extensively throughout the West and helped introduce many more traditional devotional songs. <br/><br/><b>Śrī Gauḍīya Gīti-guccha</b>, first published by <i>Śrīla Bhakti Prajñāna Keśava Gosvāmī</i>, is a collection of devotional poems, prayers and songs expressing the pure devotion found in the hearts of the great <i>Vaiṣṇava ācāryas</i>, including <i>Śrīla Rūpa Gosvāmī</i>, <i>Śrīla Raghunātha dāsa Gosvāmī</i>, <i>Śrīla Kṛṣṇadāsa Kavirāja Gosvāmī</i>, <i>Śrīla Narottama Ṭhākura</i>, <i>Śrīla Locanadāsa Ṭhākura</i>, <i>Śrīla Bhaktivinoda Ṭhākura</i>, and <i>Śrīla Bhakti Prajñāna Keśava Mahārāja</i>. <br/><br/>By learning and regularly reciting these prayers under the guidance of an accomplished <i>Vaiṣṇava</i>, one not only meditates upon the divine qualities of <i>Śrī Guru</i>, <i>Śrī Gaurāṅga-deva</i> and <i>Śrī Śrī Rādhā-Kṛṣṇa</i>, but may also begin to appreciate the particular devotional moods expressed by their exalted authors. <br/><br/><i>Kīrtana</i>, being <i>bhagavat-priya</i>—especially dear to <i>Śrī Kṛṣṇa</i>—is one of the most important forms of devotional service and should not be neglected.';

  authorIntro.innerHTML = `
    <p style="margin:0 0 0.5em 0; color: var(--text-color);">${teaser}</p>

    <div class="guide-rest"
         style="max-height:0; overflow:hidden; transition:max-height 0.4s ease; padding-top:1em;">
      <p style="margin:0; color:var(--text-color);">${rest}</p>
    </div>

    <p class="guide-prompt"
       style="margin:0.8em 0 0; opacity:.8; font-style:normal; font-size:0.85em; text-align:center; user-select:none; -webkit-user-select:none; color:var(--highlight-color);">
      [DOUBLETAP TO READ MORE]
    </p>
  `;

  const restWrapper = authorIntro.querySelector('.guide-rest');
  const promptEl    = authorIntro.querySelector('.guide-prompt');
  let isExpanded   = false;

  const toggleGuide = () => {
    isExpanded = !isExpanded;
    if (isExpanded) {
      restWrapper.style.maxHeight = restWrapper.scrollHeight + 'px';
      promptEl.textContent = '[DOUBLETAP TO CLOSE]';
    } else {
      restWrapper.style.maxHeight = '0px';
      promptEl.textContent = '[DOUBLETAP TO READ MORE]';
    }
  };

  /* Mobile double-tap: track timestamps on touchend */
  let lastTap = 0;
  authorIntro.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      e.preventDefault(); /* stop zoom and synthetic click */
      toggleGuide();
    }
    lastTap = now;
  });

  /* Desktop double-click */
  authorIntro.addEventListener('dblclick', (e) => {
    e.preventDefault();
    toggleGuide();
  });

  container.appendChild(authorIntro);

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
            </span>
            <span class="total-songs-num">[${songs.length}]</span>
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

    // Make author groups behave like a fixed accordion.
    item.addEventListener('expand', () => {
      // Remember where the tapped item was before the expansion.
      const topBefore = item.getBoundingClientRect().top;

      // Close any other expanded author.
      container.querySelectorAll('ons-list-item[expandable]').forEach((otherItem) => {
        if (otherItem !== item && otherItem.hasAttribute('expanded')) {
          otherItem.removeAttribute('expanded');
        }
      });

      // Onsen updates the expandable layout asynchronously.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const topAfter = item.getBoundingClientRect().top;
          const difference = topAfter - topBefore;

          // Compensate for the layout shift so the tapped author
          // remains at the same vertical position on screen.
          if (Math.abs(difference) > 1) {
            window.scrollBy({
              top: difference,
              behavior: 'instant'
            });
          }
        });
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

  const authorFooter = document.createElement('div');
  authorFooter.className = 'glassy list-item__subtitle';

  authorFooter.style.cssText =
    'text-align:left; font-size:16px; padding:16px; margin:12px 6px; touch-action:manipulation;';

  const footerMsg =
    '✦ The <highlight>Quick Shortcuts</highlight> section contains songs that are used repeatedly throughout the day, regardless of the particular time, occasion, or type of devotional activity. These have been placed at the top of this section for quick and convenient access. <br/>✦ The songs in the <highlight>Lists by Tattva</highlight> have been selected and arranged according to their principal devotional subject, with the aim of making the songbook easier to navigate and use at home or in any <i>Maṭha</i>. The selections are based primarily on <i>Śrī Gauḍīya Gīti-guccha</i>, together with songs found in the traditional repertoire of <i>Gauḍīya Maṭha</i> temples and songs associated with particular times of the day. The categories are intended as a <b>practical devotional arrangement</b> rather than as a rigid classification. Some songs naturally express more than one <i>tattva</i>, and in such cases they have been placed according to how they are sung in <i>Gauḍīya Maṭha</i>. <br/>✦ The <highlight>Ārati & Pūjā</highlight> section is arranged separately according to the three traditional times of worship, while the <i>Tattva</i> sections gather songs according to the mood or personality. The resulting selection is therefore <b>curated rather than exhaustive</b>: it represents a practical collection of songs suitable for meditation, personal <i>bhajana</i>, and congregational chanting, while preserving the devotional character of the traditional <i>Gauḍīya Vaiṣṇava</i> repertoire.<br/>✦ The <highlight>Gauḍīya Gallery</highlight> section contains some photographs and paintings to serve as windows to the spiritual world.';

  authorFooter.innerHTML = `
    <p text-align:left; font-size:16; padding:16px; margin:12px 6px; touch-action: manipulation;>${footerMsg}</p>
  `;

  container.appendChild(authorFooter);
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