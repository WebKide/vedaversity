/**
 * js/settings_page.js
 * Song Language preview (sample text only — see utils.js note), Theme
 * (dark default / light opt-in / system), and a contact footer.
 */

function settings_page_init(page) {
  const content = page.querySelector('.gutter');
  content.innerHTML = '';

  /* Choose Language */
  /* commented till the language support is implemented

  const langHeader = ons.createElement(`
    <ons-list-header style="text-transform:none; text-align:center; font-size:1.1rem; font-style:italic; margin-top:10px; padding:12px 0 10px 0;">
      Śrī Śrī Guru Gaurāṅga Jayatāḥ
    </ons-list-header>
  `);
  content.appendChild(langHeader);

  const updateHeader = () => {
    langHeader.innerText = transliterate('EN', appState.langCode, 'light');
  };

  const langList = ons.createElement(`
    <ons-list class="glassy" style="margin-top:5px;">
      <ons-list-header>Song Language</ons-list-header>
    </ons-list>
  `);

  Object.keys(window.LANGUAGES).forEach((langCode) => {
    const label = window.LANGUAGES[langCode].label || langCode;
    const isChecked = appState.langCode === langCode ? 'checked' : '';

    const item = ons.createElement(`
      <ons-list-item tappable>
        <label class="left">
          <ons-radio name="lang" input-id="lang-${langCode}" value="${langCode}" ${isChecked}></ons-radio>
        </label>
        <label for="lang-${langCode}" class="center">${label}</label>
      </ons-list-item>
    `);

    item.querySelector('ons-radio').onclick = () => {
      appState.langCode = langCode;
      dbSetItem('langCode', langCode);
      updateHeader();
    };

    langList.appendChild(item);
  });

  content.appendChild(langList);
  updateHeader();
  */

  /* Choose Theme */
  const themeList = ons.createElement(`
    <ons-list class="glassy" style="margin:15px 0;">
      <ons-list-header>Theme</ons-list-header>
    </ons-list>
  `);

  const themes = [
    { mode: null, label: 'System Default' },
    { mode: 'light', label: 'Aruṇa (Light)' },
    { mode: 'dark', label: 'Śyāma (Dark)' }
  ];

  themes.forEach((theme) => {
    const isChecked = appState.themeMode === theme.mode ? 'checked' : '';
    const idSafe = theme.mode || 'system';

    const item = ons.createElement(`
      <ons-list-item tappable>
        <label class="left">
          <ons-radio name="theme" input-id="theme-${idSafe}" value="${idSafe}" ${isChecked}></ons-radio>
        </label>
        <label for="theme-${idSafe}" class="center">${theme.label}</label>
      </ons-list-item>
    `);

    item.querySelector('ons-radio').onclick = () => {
      appState.themeMode = theme.mode;
      dbSetItem('themeMode', theme.mode);
      apply_theme();
    };

    themeList.appendChild(item);
  });

  content.appendChild(themeList);

  content.appendChild(ons.createElement(`
    <ons-list-header style="text-transform:none; background-image:none;">
      Questions, comments, bugs, or donations? Contact keshto@gmail.com
    </ons-list-header>
  `));

  /* Choose Font-family */
  const fontList = ons.createElement(`
    <ons-list class="glassy" style="margin:15px 0;">
      <ons-list-header>Font Style</ons-list-header>
    </ons-list>
  `);

  const fonts = [
    { value: "'Ubuntu Sans', sans-serif", label: 'Ubuntu Sans (Modern)' },
    { value: "'Nunito Sans', sans-serif", label: 'Nunito Sans (Rounded)' },
    { value: "'Gentium Plus', serif", label: 'Gentium Plus (Classic IAST)' }
  ];

  fonts.forEach((font) => {
    const isChecked = appState.fontFamily === font.value ? 'checked' : '';
    const idSafe = font.label.replace(/\s+/g, '-').toLowerCase();

    const item = ons.createElement(`
      <ons-list-item tappable>
        <label class="left">
          <ons-radio name="font" input-id="font-${idSafe}" value="${font.value}" ${isChecked}></ons-radio>
        </label>
        <label for="font-${idSafe}" class="center" style="font-family: ${font.value}">${font.label}</label>
      </ons-list-item>
    `);

    item.querySelector('ons-radio').onclick = () => {
      appState.fontFamily = font.value;
      dbSetItem('fontFamily', font.value);
      apply_font(); // Helper function defined in utils.js 
    };

    fontList.appendChild(item);
  });

  content.appendChild(fontList);
}