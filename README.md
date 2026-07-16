<div align="center">
   <img src="https://github.com/WebKide/vedaversity/blob/main/img/icons/android-chrome-512x512.png" alt="project logo" width="20%" />
</div>

------

<div align="center">
   <img src="https://img.shields.io/badge/Project%20by-WebKide-black.svg?style=popout&logo=github&logoColor=white" alt="Author" />
   <img src="https://img.shields.io/github/commit-activity/t/WebKide/vedaversity?color=%23f5a623" alt="Version" />
   <img src="https://img.shields.io/badge/Version-v1.06-magenta.svg?style=popout" alt="Version" />
</div>

<div align="center">
   <img src="https://img.shields.io/badge/Made%20with-JavaScript-blue.svg?style=popout&logo=javascript&logoColor=yellow" alt="JavaScript" />
   <img src="https://img.shields.io/badge/Data-LocalJSON-%234ea94b.svg?style=popout&logo=git&logoColor=white" alt="Local JSON" />
</div>

<div align="center">
   <img src="https://img.shields.io/badge/Library-OnsenUI-orange?style=popout" alt="Onsen UI" />
   <img src="https://img.shields.io/badge/Library-fuse.js-red?style=popout" alt="fuse.min.js" />
   <img src="https://img.shields.io/badge/Library-SortableJS-9cf?style=popout" alt="Sortable.min.js" />
</div>

<div align="center">
   <img src="http://forthebadge.com/images/badges/built-with-love.svg?style=for-the-badge" alt="built with love" />
</div>

<div align="center">
   <h1>✦ Kīrtan App ✦</h1>
   <p>॥ oṁ namo bhagavate vāsudevāya ॥</p>
</div>

A clean, dark-themed (saffron theme supported) Kīrtan songbook that works fully offline. Browse and search hundreds of songs, organize them into your own lists, group them by tattva, and read along verse-by-verse — all rendered locally, with nothing to install but a home-screen icon.

### 「Original app [Vedaversity](https://github.com/vedaversity/kirtan) was developed by Keshto, this port of it as a **SPA** (single page app) was forked and developed to function totally offline as a **PWA** (progresive web app) that can be installed on any device」

## 🗃️ Features

- **Song Library** — every song, alphabetized, one tap away.
- **Search** — find a song instantly by title or lyric, fuzzy support.
- **Custom Lists** — build your own playlists, add songs from Search, and reorder them by drag-and-drop.
- **Tattva Collections** — songs pre-grouped by theme [TODO]:
  - Śrī Guru, Vaiṣṇava, Śrī Nitāi, Śrī Gaura, Nitāi & Gaurāṅga, Śrīmatī Rādhā, Śrī Kṛṣṇa, and Śrī Śrī Rādhā & Kṛṣṇa.
- **Recents** — jump back into whatever you were reading last, or turn your history into a new list in one tap.
- **Pronunciation Guide** — a quick reference for getting the Sanskrit/Bengali right.
- **Adjustable Text Size** — pinch-to-zoom on the verse view, remembered for next time.
- **Translations on Demand** — tap a verse to reveal its translation, double-tap to toggle them all at once.
- **Swipe Navigation** — swipe between songs while browsing a list.
- **Copy / Share** — share a song's text straight from the verse view.
- **Dark & Light Themes** — matches your system, or set it yourself.
- **Fully Offline** — works completely offline after the initial load.
- **Auto-Updates** — the service worker fetches new content and improvements automatically.
- **Ad-Free** — no data collection, no accounts required, no subscription fees, free to use now and forever.

## 📦 Installation

### Desktop (Windows/MacOS):

1. Open [Kirtan](https://webkide.github.io/vedaversity) in **Chrome Browser** or **Safari** or **Edge**
2. Tap the three-dot menu (⋮) top right.
3. Tap **"Add to Home screen"**.
4. Confirm the name and tap **Add**.
5. The app icon appears on your home screen and works offline.

### Android (Chrome):

1. Open [Kirtan](https://webkide.github.io/vedaversity) in **Chrome Browser**.
2. Tap the three-dot menu (⋮) top right.
3. Tap **"Add to Home screen"**.
4. Confirm the name and tap **Add**.
5. The app icon appears on your home screen and works offline.

### iPhone (Safari):

1. Open [Kirtan](https://webkide.github.io/vedaversity) in **Safari**.
2. Tap the **Share button** (the box with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm the name and tap **Add**.
5. The app icon appears on your home screen and works offline.

---

## 📖 Usage

- Browse **All Songs** alphabetized, or use **Search** to jump straight to one.
- Tap a verse to reveal its translation; double-tap anywhere to toggle every translation at once.
- Pinch to resize the text — your preferred size is remembered.
- Build a **List**, drag to reorder it, and swipe between its songs while reading.
- Group songs by **tattva** from the Lists tab, or revisit your **Recents**.
- Works offline after the initial load, even in airplane mode.

### 🔰 Behavior

- All content is rendered locally from JSON files — no server round-trips after the first load.
- Lists, recents, theme, and text-size and font-family preferences are all saved on-device.
- The service worker precaches the song library and app shell for instant, offline-first loading, and checks for updates automatically.

### 📱 Mobile Support

<div align="center">
   <img src="https://github.com/WebKide/vedaversity/blob/main/screenshot/Screenshot_v1-06.png" alt="app screenshot" width="40%" />
</div>

## 🌟 FOSS and Privacy

**Kirtan** is a free and open-source project (FOSS). This means all the code and content are publicly available, so anyone can inspect, modify, or contribute. No accounts or subscriptions are required to use the app, and it does not collect, track, or share any personal data.

Your privacy matters. The idea that **"if you have nothing to hide, you have nothing to fear"** is often used as a slogan to justify surveillance. In reality, it is a form of propaganda designed to strip people of their personal liberties and freedoms. True privacy and autonomy are fundamental rights, not privileges.

By keeping **Kirtan** offline-capable and free from tracking, the app gives you the freedom to sing and read without surrendering your personal information.

## 🛠️ Support

For issues or feature requests, please open an issue on [GitHub](https://github.com/WebKide/vedaversity).

---

### ✨ Technical Details

- **Developer:** [WebKide](https://webkide.github.io/vedaversity/)
- **Libraries used:** [`onsenui`](https://onsen.io/) (styling), [`fuse.min.js`](https://fusejs.io/) (search), [`Sortable.min.js`](https://sortablejs.github.io/Sortable/) (drag-to-reorder)
- **Data source:** local kirtan song collection, one JSON file per song plus a generated index
- **Repository:** [GitHub: WebKide/vedaversity](https://github.com/WebKide/vedaversity)
- **Live URL:** [https://webkide.github.io/vedaversity](https://webkide.github.io/vedaversity)

### 🤔 TODOs

- [x] Rebuild the page-stack navigation as a custom, dependency-free SPA router
- [x] Consolidate all page-specific stylesheets into a single `styles.css`
- [x] Replace native keep-awake plugin with the Screen Wake Lock API
- [x] Regenerate `IDX.json` directly from the `/SO/` song files via a build script
- [ ] TODO: organize by tattva: Śrī Guru, Vaiṣṇava, Śrī Nitāi, Śrī Gaura, Nitāi & Gaurāṅga, Śrīmatī Rādhā, Śrī Kṛṣṇa, and Śrī Śrī Rādhā & Kṛṣṇa.
- [x] Wire up Fuse.js search with the final index configuration
- [ ] Confirm no load-bearing styles were left behind in the legacy stylesheets
- [ ] Full integration testing across the rebuilt SPA
- [ ] Letter-group dividers for the All Songs list
- [ ] Include more fonts with IAST support
- [ ] Add more JSON song files to include extra bhajans and kīrtans

###### No accounts, subscriptions or personal data required. Responsive design for desktop and mobile. Runs entirely in your browser.
