/**
 * js/pronounce_page.js
 * Static pronunciation reference — Bengali script + IAST romanization.
 * No audio playback (deprecated per spec). The `note` field is where the
 * "as in ___" comparisons go; only the vowels are filled in below as a
 * starting point — fill in consonant notes as you finalize the copy.
 *
 * NOTE: this table was reconstructed from the original (obfuscated)
 * guide's character list to serve as a working starting point — double
 * check the Bengali glyphs/romanization against your source before
 * shipping.
 */

const PRONOUNCE_GUIDE = [
  ['অ — अ', 'a', '“A” as in “<highlight>a</highlight>pple”'],
  ['আ — आ', 'ā', '“AA” as in “f<highlight>a</highlight>r”'],
  ['ই — इ', 'i', '“I” as in “m<highlight>i</highlight>lk”'],
  ['ঈ — ई', 'ī', '“EA” as in “<highlight>ea</highlight>t”'],
  ['উ — उ', 'u', '“U” as in “p<highlight>u</highlight>ll”'],
  ['ঊ — ऊ', 'ū', '“OO” as in “bl<highlight>u</highlight>e”'],
  ['ঋ — ऋ', 'ṛ', '“RI” as in “<highlight>ri</highlight>m”'],
  ['এ — ए', 'e', '“E” as in “th<highlight>ey</highlight>”'],
  ['ঐ — ऐ', 'ai', '“AI” as in “<highlight>ai</highlight>sle”'],
  ['ও — ओ', 'o', '“O” as in “g<highlight>o</highlight>ld”'],
  ['ঔ — औ', 'au', '“AU” as in “h<highlight>ow</highlight>”'],
  ['ळ', 'ḷ', '“Ḷ” tongue flexed back “<highlight>l</highlight>ake”'],

  ['ক — क', 'ka', '“K” as in “<highlight>k</highlight>ite”'],
  ['খ — ख', 'kha', '“KH” as in “loc<highlight>k-h</highlight>orn”'],
  ['গ — ग', 'ga', '“G” as in “<highlight>g</highlight>ive”'],
  ['ঘ — घ', 'gha', '“GH” as in “di<highlight>g-h</highlight>ard”'],
  ['ঙ — ङ', 'ṅa', '“NG” as in “si<highlight>ng</highlight>”'],
  ['চ — च', 'ca', '“C” as in “<highlight>ch</highlight>eese”'],
  ['ছ — छ', 'cha', '“CH” as in “mu<highlight>ch-h</highlight>arder”'],
  ['জ — ज', 'ja', '“J” as in “<highlight>j</highlight>oy”'],
  ['ঝ — झ', 'jha', '“JH” as in “hed<highlight>geh</highlight>og”'],
  ['ঞ — ञ', 'ña', '“Ñ” as in “ca<highlight>ny</highlight>on”'],
  ['ট — ट', 'ṭa', '“Ṭ” as in “<highlight>t</highlight>ub”'],
  ['ঠ — ठ', 'ṭha', '“ṬH” as in “ligh<highlight>t-h</highlight>ouse”'],
  ['ড — ड', 'ḍa', '“Ḍ” as in “<highlight>d</highlight>ove”'],
  ['ঢ — ढ', 'ḍha', '“ḌH” as in “re<highlight>d-h</highlight>ot”'],
  ['ণ — ण', 'ṇa', '“Ṇ” as in “<highlight>n</highlight>ut”'],
  ['ত — त', 'ta', '“T” as in “<highlight>t</highlight>ango”'],
  ['থ — थ', 'tha', '“TH” as in “au<highlight>th</highlight>or”'],
  ['দ — द', 'da', '“d” as in “<highlight>d</highlight>ice”'],
  ['ধ — ध', 'dha', '“DH” as in “re<highlight>dh</highlight>ead”'],
  ['ন — न', 'na', '“N” as in “<highlight>n</highlight>ame”'],
  ['প — प', 'pa', '“P” as in “<highlight>p</highlight>ine”'],
  ['ফ — फ', 'pha', '“F” as in “co<highlight>ff</highlight>ee”'],
  ['ব — ब', 'ba', '“B” as in “<highlight>b</highlight>oat”'],
  ['ভ — भ', 'bha', '“BH” as in “clu<highlight>b-h</highlight>ouse”'],
  ['ম — म', 'ma', '“M” as in “<highlight>m</highlight>oon”'],
  ['য — य', 'ya', '“Y” as in “<highlight>y</highlight>es”'],
  ['র — र', 'ra', '“R” as in “<highlight>r</highlight>un”'],
  ['ল — ल', 'la', '“L” as in “<highlight>l</highlight>ight”'],
  ['व — व', 'va', '“V” as in “<highlight>v</highlight>iolet”'],
  ['শ — श', 'śa', '“SH” as in “<highlight>sh</highlight>ine”'],
  ['ষ — ष', 'ṣa', '“Ṣ” as in “<highlight>s</highlight>ugar”'],
  ['স — स', 'sa', '“S” as in “<highlight>s</highlight>and”'],
  ['হ — ह', 'ha', '“H” as in “<highlight>h</highlight>ome”'],
  ['ড় — ड़', 'ṛa', '“Ṛ” as in “butte<highlight>ry</highlight>”'],
  ['ঢ় — ढ़', 'ṛha', '“ṚH” as in “bi<highlight>r</highlight>d”'],
  ['য় — य़', 'ẏa', '“Ẏ” as in “<highlight>y</highlight>ard”'],

  ['क्ष — ক্ষ', 'kṣa', '“KṢA” as in “boo<highlight>k-sh</highlight>elf”'],
  ['त्र — ত্র', 'tra', '“TRA” as in “<highlight>tr</highlight>affic”'],
  ['ज्ञ — জ্ঞ', 'jña', '“JÑA” as in “<highlight>gya</highlight>”'],
  ['श्र — শ্র', 'śra', '“ŚRA” as in “ca<highlight>sh-r</highlight>ing”'],

  ['ঃ — ः', 'ḥ (visarga)', 'aspirate “aḥ” as in “<highlight>aha</highlight>”'],
  ['ঃ — ः', 'ḥ (visarga)', 'aspirate “iḥ” as in “<highlight>ihi</highlight>”'],
  ['ং — ं', 'ṁ (anusvāra)', 'pure nasal “N” as in (FR) “bo<highlight>n</highlight>”'],
  ['ঁ — ँ', '̐ (candrabindu)', '“M” as in “mu<highlight>m</highlight>”']
];

function pronounce_page_init(page) {
  const container = page.querySelector('#pronounce-list');
  container.innerHTML = '';

  const guideIntro = document.createElement('div');
  guideIntro.className = 'glassy list-item__subtitle';
  /* touch-action: manipulation prevents the browser from zooming on double-tap */
  guideIntro.style.cssText = 'text-align:left; font-size:16px; padding:16px; margin:12px 6px; touch-action: manipulation;';

  const teaser = 'Throughout the centuries, the Sanskrit language has been written in a variety of alphabets. The mode of writing most widely used throughout India, however, is called <i>devanāgarī</i> <highlight>(देवनागरी)</highlight>, which literally means <b>“the city writing of the <i>devas</i>, or gods.”</b>';

  const rest = 'The <i>devanāgarī</i> alphabet consists of forty-eight characters, including thirteen vowels and thirty-five consonants. The ancient Sanskrit grammarians arranged the alphabet according to concise linguistic principles, and this arrangement has been accepted by all Western scholars. <br/>The system of transliteration used in this songbook conforms to a system that scholars in the last fifty years have almost universally accepted to indicate the pronunciation of each Sanskrit sound. <br/>Some of the Sanskrit consonants have no exact equivalent in the English language. Wherever possible, the nearest English sound has been chosen to illustrate the pronunciation. In a few instances, however, the closest approximation can be obtained only by combining the final sound of one English word with the initial sound of the next. Thus <b>“GH”</b> is pronounced as in “di<highlight>g-h</highlight>ard”. These combinations preserve the distinct consonant and following breath that characterize the aspirated sounds of Sanskrit. <br/>Since no single English word contains these sounds exactly, the examples are intended merely as practical approximations.';

  /* Build DOM — NOTE: no display:none here. We use max-height:0 for the transition. */
  guideIntro.innerHTML = `
    <p style="margin:0 0 0.5em 0; color: var(--text-color);">${teaser}</p>
    <div class="guide-rest" style="max-height:0px; overflow:hidden; transition:max-height 0.4s ease;">
      <p style="margin:0; color: var(--text-color);">${rest}</p>
    </div>
    <p class="guide-prompt" style="margin:0.8em 0 0 0; opacity:.8; font-style:bold; font-size:0.85em; text-align:center; user-select:none; -webkit-user-select:none; color: var(--highlight-color);">[DOUBLETAP TO READ MORE]</p>
  `;

  const restWrapper = guideIntro.querySelector('.guide-rest');
  const promptEl    = guideIntro.querySelector('.guide-prompt');
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
  guideIntro.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      e.preventDefault();           /* stop zoom and synthetic click */
      toggleGuide();
    }
    lastTap = now;
  });

  /* Desktop double-click */
  guideIntro.addEventListener('dblclick', (e) => {
    e.preventDefault();
    toggleGuide();
  });

  container.appendChild(guideIntro);

  /* Render pronunciation table */
  PRONOUNCE_GUIDE.forEach(([script, roman, note]) => {
    const item = ons.createElement(`
      <ons-list-item modifier="nodivider">
        <div class="left" 
             style="font-size: 1.4rem; min-width: 28px; width: 32px; color: var(--highlight-color);">
          ${script}
        </div>
        <div class="center">
          <span class="list-item__title" 
                style="color: var(--second-highlight-color);">
            ${roman}
          </span>
          ${note ? `<span class="list-item__subtitle; margin-right=0;">${note}</span>` : '“” as in “”'}
        </div>
      </ons-list-item>
    `);
    container.appendChild(item);
  });
}