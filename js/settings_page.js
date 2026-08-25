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
    { value: "'Kelvinch', serif",          label: 'Kelvinch (Traditional)' },
    { value: "'Ubuntu', sans-serif",       label: 'Ubuntu (Modern)' },
    { value: "'Charis SIL', serif",        label: 'Charis SIL (Elegant)' },
    { value: "'Nunito Sans', sans-serif",  label: 'Nunito Sans (Material)' },
    { value: "'Gentium Book', serif",      label: 'Gentium Book (Classic)' },
    { value: "'Sassoon', sans-serif",      label: 'Sassoon (Readable)' },
    { value: "'MetropolitanParliament', serif", label: 'Metropolitan (Book)' },
    { value: "'Sansita', sans-serif",      label: 'Sansita (Friendly)' }
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
 
  /* ─── App Update ─── */
  const updateBlock = ons.createElement(`
    <ons-list class="glassy" style="margin:15px 0;">
      <ons-list-header modifier="material" style="text-align:center; opacity:.6; font-size:16px; font-weight:700; width:100%; margin-top:8px; color:var(--highlight-color);">App Update</ons-list-header>
      <ons-list-item id="forceUpdateBtn" tappable>
        <div class="left">
          <svg class="update-icon" viewBox="0 0 24 24" width="32" height="32" fill="var(--highlight-color)">
            <path d="M11 7v5.4l3.8 3.8 1.4-1.4-3.2-3.2V7zm10-3h-2v2.3c-1.6-2-4.2-3.3-7-3.3-5 0-9 4-9 9s4 9 9 9c4.4 0 8.1-3.2 8.9-7.5h-2c-.7 3.1-3.5 5.5-6.9 5.5-3.9 0-7-3.1-7-7s3.1-7 7-7c2.4 0 4.5 1.2 5.7 3H15v2h6z"/>
          </svg>
        </div>
        <div class="center">
          <div class="update-title" style="font-weight:600;">Check for updates</div>
          <div class="update-subtitle" style="font-size:0.8rem; opacity:0.7;">manually check for new version</div>
        </div>
      </ons-list-item>
    </ons-list>
  `);
  content.appendChild(updateBlock);
 
  const updateBtn = updateBlock.querySelector('#forceUpdateBtn');
  const uTitle    = updateBtn.querySelector('.update-title');
  const uSub      = updateBtn.querySelector('.update-subtitle');
  const uIcon     = updateBtn.querySelector('.update-icon');
 
  const resetUpdate = () => {
    updateBtn.classList.remove('is-working', 'is-success', 'is-error');
    uTitle.textContent = 'Check for updates';
    uSub.textContent   = 'manually check for new version';
    uIcon.style.fill   = 'var(--highlight-color)';
  };
 
  updateBtn.addEventListener('click', async () => {
    if (updateBtn.classList.contains('is-working')) return;
 
    /* Second tap when update is ready → install & reload */
    if (updateBtn.classList.contains('is-success')) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        return;
      }
    }
 
    if (!('serviceWorker' in navigator)) {
      updateBtn.classList.add('is-error');
      uTitle.textContent = 'Update Unavailable';
      uSub.textContent   = 'service workers not supported';
      uIcon.style.fill   = '#f44336';
      setTimeout(resetUpdate, 2500);
      return;
    }
 
    updateBtn.classList.add('is-working');
    uTitle.textContent = 'Checking for Update';
    uSub.textContent   = 'please wait';
 
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) throw new Error('no registration');
 
      await reg.update();
      await new Promise(r => setTimeout(r, 800));
 
      updateBtn.classList.remove('is-working');
 
      if (reg.waiting) {
        updateBtn.classList.add('is-success');
        uTitle.textContent = 'Update Ready';
        uSub.textContent   = 'tap to install and restart';
        uIcon.style.fill   = '#4caf50';
      } else if (reg.installing) {
        updateBtn.classList.add('is-working');
        uTitle.textContent = 'Downloading Update';
        uSub.textContent   = 'please wait';
        await new Promise(r => setTimeout(r, 2000));
        updateBtn.classList.remove('is-working');
        if (reg.waiting) {
          updateBtn.classList.add('is-success');
          uTitle.textContent = 'Update Ready';
          uSub.textContent   = 'tap to install and restart';
          uIcon.style.fill   = '#4caf50';
        } else {
          updateBtn.classList.add('is-success');
          uTitle.textContent = 'No New Version Found';
          uSub.textContent   = 'you are currently up to date';
          uIcon.style.fill   = '#4caf50';
          setTimeout(resetUpdate, 2500);
        }
      } else {
        updateBtn.classList.add('is-success');
        uTitle.textContent = 'No New Version Found';
        uSub.textContent   = 'you are currently up to date';
        uIcon.style.fill   = '#4caf50';
        setTimeout(resetUpdate, 2500);
      }
    } catch (err) {
      console.error('[ForceUpdate]', err);
      updateBtn.classList.remove('is-working');
      updateBtn.classList.add('is-error');
      uTitle.textContent = 'Check failed';
      uSub.textContent   = 'try again later';
      uIcon.style.fill   = '#f44336';
      setTimeout(resetUpdate, 2500);
    }
  });
}