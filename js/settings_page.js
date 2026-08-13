/**
 * js/settings_page.js
 * Theme (dark default / light opt-in / system), and a contact footer.
 */

function settings_page_init(page) {
  const content = page.querySelector('.gutter');
  content.innerHTML = '';

  /* ─── Theme ─── */
  const themeList = ons.createElement(`
    <ons-list class="glassy" style="margin:15px 0;">
      <ons-list-header modifier="material" style="text-align:center; opacity:.6; font-size:16px; font-weight:700; width:100%; margin-top:8px; color:var(--highlight-color);">Theme Colour</ons-list-header>
    </ons-list>
  `);

  const themes = [
    { mode: null, label: 'System Default' },
    { mode: 'light', label: 'Aruṇa (Light)' },
    { mode: 'dark', label: 'Śyāma (Dark)' }
  ];

  let activeThemeSwitch = null;

  themes.forEach((theme) => {
    const isChecked = appState.themeMode === theme.mode;

    const item = ons.createElement(`
      <ons-list-item tappable>
        <div class="center">${theme.label}</div>
        <div class="right">
          <ons-switch ${isChecked ? 'checked' : ''}></ons-switch>
        </div>
      </ons-list-item>
    `);

    const sw = item.querySelector('ons-switch');
    if (isChecked) activeThemeSwitch = sw;

    sw.addEventListener('change', (e) => {
      // Prevent unchecking the already-selected option
      if (!e.target.checked) {
        if (activeThemeSwitch === e.target) {
          e.target.checked = true; // bounce back
        }
        return;
      }

      // Uncheck previous
      if (activeThemeSwitch && activeThemeSwitch !== e.target) {
        activeThemeSwitch.checked = false;
      }
      activeThemeSwitch = e.target;

      appState.themeMode = theme.mode;
      dbSetItem('themeMode', theme.mode);
      apply_theme();
    });

    themeList.appendChild(item);
  });

  content.appendChild(themeList);

  /* Footer */
  content.appendChild(ons.createElement(`
    <ons-list-header style="text-transform:none; font-size:.85rem; background-image:none; text-align:center;">
      ✦ For donations contact: <a href="mailto:keshto@gmail.com">keshto@gmail.com</a><br/>
      ✦ For questions, suggestions, or bugs contact: <a href="https://github.com/WebKide/vedaversity/tree/main">WebKide</a>
    </ons-list-header>
  `));

  /* ─── Font ─── */
  const fontList = ons.createElement(`
    <ons-list class="glassy" style="margin:15px 0;">
      <ons-list-header modifier="material" style="text-align:center; opacity:.6; font-size:16px; font-weight:700; width:100%; margin-top:8px; color:var(--highlight-color);">Font Style</ons-list-header>
    </ons-list>
  `);

  const fonts = [
    { value: "'Ubuntu Sans', sans-serif", label: 'Ubuntu Sans (Modern)' },
    { value: "'Charis SIL', serif", label: 'Charis SIL (Beautiful)' },
    { value: "'Noto Serif', serif", label: 'Noto Serif (Traditional)' },
    { value: "'Gentium Plus', serif", label: 'Gentium Plus (Classic IAST)' },
    { value: "'Nunito Sans', sans-serif", label: 'Nunito Sans (Rounded)' },
    { value: "'Tiro Devanagari Sanskrit', sans-serif", label: 'Tiro Devanagari (Elegant)' }
  ];

  let activeFontSwitch = null;

  fonts.forEach((font) => {
    const isChecked = appState.fontFamily === font.value;

    const item = ons.createElement(`
      <ons-list-item tappable>
        <div class="center" style="font-family: ${font.value}">${font.label}</div>
        <div class="right">
          <ons-switch ${isChecked ? 'checked' : ''}></ons-switch>
        </div>
      </ons-list-item>
    `);

    const sw = item.querySelector('ons-switch');
    if (isChecked) activeFontSwitch = sw;

    sw.addEventListener('change', (e) => {
      // Prevent unchecking the already-selected option
      if (!e.target.checked) {
        if (activeFontSwitch === e.target) {
          e.target.checked = true; // bounce back
        }
        return;
      }

      // Uncheck previous
      if (activeFontSwitch && activeFontSwitch !== e.target) {
        activeFontSwitch.checked = false;
      }
      activeFontSwitch = e.target;

      appState.fontFamily = font.value;
      dbSetItem('fontFamily', font.value);
      apply_font();
    });

    fontList.appendChild(item);
  });

  fontList.appendChild(ons.createElement(`
    <ons-list>
      <ons-list-header
        modifier="material"
        style="text-align:center; opacity:.6; font-size:16px; font-weight:700; width:100%; margin-top:8px;">
        Sample Text
      </ons-list-header>

      <ons-list-header class="sample-text">
        khaḍgaḥ śāntaṁ jñānaṁ dadāti ।<br />
        gaṅgāyāṁ ṛṣiḥ kuṇḍe tiṣṭhati ।<br />
        pañca ṭīkāḥ, ṣaḍ granthāḥ ।<br />
        (kḷptaḥ) śubhaṁ bhavatu ॥
      </ons-list-header>
    </ons-list>
  `));

  content.appendChild(fontList);
}