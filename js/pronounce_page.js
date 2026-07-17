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
  ['ই — इ', 'i', '“I” as in “p<highlight>i</highlight>n”'],
  ['ঈ — ई', 'ī', '“EA” as in “<highlight>ea</highlight>t”'],
  ['উ — उ', 'u', '“U” as in “p<highlight>u</highlight>ll”'],
  ['ঊ — ऊ', 'ū', '“OO” as in “r<highlight>u</highlight>le”'],
  ['ঋ — ऋ', 'ṛ', '“RI” as in “<highlight>ri</highlight>m”'],
  ['এ — ए', 'e', '“E” as in “th<highlight>ey</highlight>”'],
  ['ঐ — ऐ', 'ai', '“AI” as in “<highlight>ai</highlight>sle”'],
  ['ও — ओ', 'o', '“O” as in “g<highlight>o</highlight>”'],
  ['ঔ — औ', 'au', '“AU” as in “h<highlight>ow</highlight>”'],

  ['ক — क', 'ka', '“K” as in “<highlight>k</highlight>ite”'],
  ['খ — ख', 'kha', '“KH” as in “Ec<highlight>kh</highlight>art”'],
  ['গ — ग', 'ga', '“G” as in “<highlight>g</highlight>ive”'],
  ['ঘ — घ', 'gha', '“GH” as in “di<highlight>g h</highlight>ard”'],
  ['ঙ — ङ', 'ṅa', '“NG” as in “si<highlight>ng</highlight>”'],
  ['চ — च', 'ca', '“C” as in “<highlight>c</highlight>hair”'],
  ['ছ — छ', 'cha', '“CH” as in “staun<highlight>ch h</highlight>eart”'],
  ['জ — ज', 'ja', '“J” as in “<highlight>j</highlight>oy”'],
  ['ঝ — झ', 'jha', '“JH” as in “he<highlight>deh</highlight>og”'],
  ['ঞ — ञ', 'ña', '“Ñ” as in “ca<highlight>ny</highlight>on”'],
  ['ট — ट', 'ṭa', '“Ṭ” as in “<highlight>t</highlight>ub”'],
  ['ঠ — ठ', 'ṭha', '“ṬH” as in “ligh<highlight>t h</highlight>eart”'],
  ['ড — ड', 'ḍa', '“Ḍ” as in “<highlight>d</highlight>ove”'],
  ['ঢ — ढ', 'ḍha', '“ḌH” as in “re<highlight>d-h</highlight>ot”'],
  ['ণ — ण', 'ṇa', '“Ṇ” as in “<highlight>n</highlight>ut”'],
  ['ত — त', 'ta', '“T” as in “<highlight>t</highlight>ango”'],
  ['থ — थ', 'tha', '“TH” as in “Mar<highlight>th</highlight>a”'],
  ['দ — द', 'da', '“d” as in “Wan<highlight>d</highlight>a”'],
  ['ধ — ध', 'dha', '“DH” as in “han<highlight>d h</highlight>eld”'],
  ['ন — न', 'na', '“N” as in “<highlight>n</highlight>asal”'],
  ['প — प', 'pa', '“P” as in “<highlight>p</highlight>ine”'],
  ['ফ — फ', 'pha', '“F” as in “u<highlight>ph</highlight>ill”'],
  ['ব — ब', 'ba', '“B” as in “<highlight>b</highlight>ird”'],
  ['ভ — भ', 'bha', '“BH” as in “ru<highlight>b h</highlight>ard”'],
  ['ম — म', 'ma', '“M” as in “<highlight>m</highlight>other”'],
  ['য — य', 'ya', '“Y” as in “<highlight>y</highlight>es”'],
  ['র — र', 'ra', '“R” as in “<highlight>r</highlight>un”'],
  ['ল — ल', 'la', '“L” as in “<highlight>l</highlight>ight”'],
  ['শ — श', 'śa', '“SH” as in “<highlight>sh</highlight>ine”'],
  ['ষ — ष', 'ṣa', '“Ṣ” as in “<highlight></highlight>”'],
  ['স — स', 'sa', '“S” as in “<highlight>s</highlight>and”'],
  ['হ — ह', 'ha', '“H” as in “<highlight>h</highlight>ome”'],
  ['ড় — ड़', 'ṛa', '“Ṛ” as in “<highlight></highlight>”'],
  ['ঢ় — ढ़', 'ṛha', '“ṚH” as in “<highlight></highlight>”'],
  ['য় — य़', 'ẏa', '“Ẏ” as in “<highlight></highlight>”'],

  ['ঃ — ः', 'ḥ (visarga)', 'aspirate “aḥ” as in “<highlight>aha</highlight>”'],
  ['ঃ — ः', 'ḥ (visarga)', 'aspirate “iḥ” as in “<highlight>ihi</highlight>”'],
  ['ং — ं', 'ṁ (anusvāra)', 'pure nasal as in (FR) “bo<highlight>n</highlight>”'],
  ['ঁ — ँ', '̐ (candrabindu)', '“M” as in “mu<highlight>m</highlight>”']
];

function pronounce_page_init(page) {
  const container = page.querySelector('#pronounce-list');
  container.innerHTML = '';

  const heading3 = document.createElement('div');
  heading3.className = 'list-header--material';
  heading3.style.cssText = 'text-align:center; opacity:.6; font-size:16px; width:100%; margin-top:8px;';
  heading3.textContent = 'Bengali, Hindi and Sanskrit pronunciation guide';
  container.appendChild(heading3);

  PRONOUNCE_GUIDE.forEach(([script, roman, note]) => {
    const item = ons.createElement(`
      <ons-list-item modifier="nodivider">
        <div class="left" style="font-size: 1.4rem; min-width: 28px; color: var(--highlight-color);">
          ${script}
        </div>
        <div class="center">
          <span class="list-item__title" style="color: var(--second-highlight-color);">
            ${roman}
          </span>
          ${note ? `<span class="list-item__subtitle; margin-right=0;">${note}</span>` : '“” as in “”'}
        </div>
      </ons-list-item>
    `);
    container.appendChild(item);
  });
}
