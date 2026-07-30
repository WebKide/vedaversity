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
    { icon: "ssguru", label: "Śrī Guru", files: [
      { 
        title: 'śrī-guru-caraṇa-padma, kevala bhakati-sadma', 
        firstline: 'sri guru carana padma kevala bhakati sadma', 
        file: '1V.json' },
      { 
        title: 'āśraya kariyā vando śrī-guru-caraṇa', 
        firstline: 'asraya kariya vando sri guru carana', 
        file: '1W.json' },
      { 
        title: 'gurudeva! baḍa kṛpā kari’, gauḍa-vana-mājhe', 
        firstline: 'gurudeva bada krpa kari gauda vana majhe', 
        file: '1X.json' },
      { 
        title: 'gurudeva! kṛpā-bindu diyā, kara ei dāse', 
        firstline: 'gurudeva krpa bindu diya kara ei dase', 
        file: '1Y.json' },
      { 
        title: 'gurudeva! kabe mora sei dina habe?', 
        firstline: 'gurudeva kabe mora sei dina habe', 
        file: '1Z.json' },
      { 
        title: 'gurudeva! kabe tava karuṇā prakāśe', 
        firstline: 'gurudeva kabe tava karuna prakase', 
        file: 'dr.json' },
      { 
        title: 'jaya jaya śrī-guru, prema-kalpataru', 
        firstline: 'jaya jaya sri guru prema kalpataru', 
        file: 'ds.json' },
      { 
        title: 'gurudeva! dayāmaya! prāṇera jātanā jānāba ki tomā', 
        firstline: 'gurudeva dayamaya pranera jatana janaba ki toma', 
        file: 'dt.json' },
      { 
        title: 'gurudeva, kṛpā karke mujhko apanā lenā', 
        firstline: 'gurudeva krpa karke mujhko apana lena', 
        file: 'bQ.json' },
    ] },
    { icon: "vaishn", label: "Vaiṣṇava", files: [
      { 
        title: 'ohe! vaiṣṇava ṭhākura, doyāra sāgara', 
        firstline: 'ohe vaisnava thakura doyara sagara', 
        file: 'do.json' },
      { 
        title: 'kṛpā kara vaiṣṇava ṭhākura!', 
        firstline: 'krpa kara vaisnava thakura', 
        file: '03.json' },
      { 
        title: 'kabe mui vaiṣṇava ciniba hari hari', 
        firstline: 'kabe mui vaisnava ciniba hari hari', 
        file: 'dv.json' },
      { 
        title: 'hari hari kabe mora habe hena dina', 
        firstline: 'hari hari kabe mora habe hena dina', 
        file: 'dw.json' },
      { 
        title: 'ṭhākura vaiṣṇava-gaṇa, kari ei nivedana', 
        firstline: 'thakura vaisnava gana kari ei nivedana', 
        file: 'dx.json' },
      { 
        title: 'eibāra karuṇā kara vaiṣṇava gosāī', 
        firstline: 'eibara karuna kara vaisnava gosai', 
        file: '07.json' },
      { 
        title: 'kirūpe pāiba sevā mui durācāra', 
        firstline: 'kirupe paiba seva mui duracara', 
        file: 'dz.json' },
      { 
        title: 'sakala vaiṣṇava gosāī dayā kara more', 
        firstline: 'sakala vaisnava gosai daya kara more', 
        file: 'dA.json' },
      { 
        title: 'ṭhākura vaiṣṇava-pada, avanīra susampada', 
        firstline: 'thakura vaisnava pada avanira susampada', 
        file: '20.json' },
    ] },
    { icon: "snitai", label: "Śrī Nitāi", files: [
      { 
        title: 'nitāi-pada-kamala, koṭicandra-suśītala', 
        firstline: 'nitai pada kamala koticandra susitala', 
        file: '2I.json' },
      { 
        title: 'akrodha paramānanda nityānanda rāya', 
        firstline: 'akrodha paramananda nityananda raya', 
        file: '2K.json' },
      { 
        title: 'bhuvana ānanda kanda, balarāma nityānanda', 
        firstline: 'bhuvana ananda kanda balarama nityananda', 
        file: '2M.json' },
      { 
        title: 'jaya jaya nityānanda rohiṇī-kumāra', 
        firstline: 'jaya jaya nityananda rohini kumara', 
        file: '2R.json' },
      { 
        title: 'nitāi guṇamaṇi āmāra nitāi guṇamaṇi', 
        firstline: 'nitai gunamani amara nitai gunamani', 
        file: '2S.json' },
      { 
        title: 'preme matta nityānanda, sahaje ānanda kanda', 
        firstline: 'preme matta nityananda sahaje ananda kanda', 
        file: '2V.json' },
      { 
        title: 'ānanda-kanda, nitāi-canda', 
        firstline: 'ananda kanda nitai canda', 
        file: '2W.json' },
    ] },
    { icon: "sgaura", label: "Śrī Gaura", files: [
      { 
        title: 'prabhu he! emana durmati, saṁsāra-bhitare', 
        firstline: 'prabhu he emana durmati samsara bhitare', 
        file: 'dC.json' },
      { 
        title: 'jaya nanda-nandana, gopī-jana-vallabha', 
        firstline: 'jaya nanda nandana gopi jana vallabha', 
        file: 'dD.json' },
      { 
        title: 'jaya jaya jagannātha śacīra nandana', 
        firstline: 'jaya jaya jagannatha sacira nandana', 
        file: 'dE.json' },
      { 
        title: 'śrī kṛṣṇa-caitanya gorā śacīra dulāla', 
        firstline: 'sri krsna caitanya gora sacira dulala', 
        file: 'dJ.json' },
      { 
        title: 'devādi-deva gaura-candra gaurīdāsa-mandire', 
        firstline: 'devadi deva gaura candra gauridasa mandire', 
        file: 'eL.json' },
      { 
        title: 'śacī-suta gaura-hari, navadvīpe avatari', 
        firstline: 'saci suta gaura hari navadvipe avatari', 
        file: 'dH.json' },
      { 
        title: 'emana gaurāṅga vinā nāhi āra!', 
        firstline: 'emana gauranga vina nahi ara', 
        file: '1n.json' },
      { 
        title: 'yadi gaurāṅga nahita, tabe ki hoita', 
        firstline: 'yadi gauranga nahita tabe ki hoita', 
        file: 'f4.json' },
      { 
        title: 'emana śacīra nandana bine', 
        firstline: 'emana sacira nandana bine', 
        file: 'eP.json' },
      { 
        title: 'ke jābi ke jābi bhāi bhavasindhu pāra', 
        firstline: 'ke jabi ke jabi bhai bhavasindhu para', 
        file: 'eM.json' },
      { 
        title: 'avatāra sāra, gorā-avatāra', 
        firstline: 'avatara sara gora avatara', 
        file: 'er.json' },
      { 
        title: 'gaurāṅgera du’ṭī pada, jā’ra dhana sampada', 
        firstline: 'gaurangera duti pada jara dhana sampada', 
        file: 'eR.json' },
      { 
        title: 'gaurāṅga tumi more dayā nā chāḍiha', 
        firstline: 'gauranga tumi more daya na chadiha', 
        file: '1p.json' },
      { 
        title: 'ohe premera ṭhākura gorā', 
        firstline: 'ohe premera thakura gora', 
        file: '3A.json' },
      { 
        title: 'kabe śrī-caitanya more karibena dayā', 
        firstline: 'kabe sri caitanya more karibena daya', 
        file: '3C.json' },
      { 
        title: 'gaurāṅga karuṇā kara, dīna hīna jane', 
        firstline: 'gauranga karuna kara dina hina jane', 
        file: '3E.json' },
      { 
        title: 'hā hā mora gaura-kiśora', 
        firstline: 'ha ha mora gaura kisora', 
        file: '3F.json' },
      { 
        title: 'kabe āhā gaurāṅga baliyā', 
        firstline: 'kabe aha gauranga baliya', 
        file: '3G.json' },
      { 
        title: 'āre bhāi! bhaja mora gaurāṅga-caraṇa', 
        firstline: 'are bhai bhaja mora gauranga carana', 
        file: '3H.json' },
      { 
        title: 'mana re! kahanā gaura-kathā', 
        firstline: 'mana re kahana gaura katha', 
        file: '3K.json' },
      { 
        title: 'gorā paṁhu nā bhajiyā mainu', 
        firstline: 'gora pamhu na bhajiya mainu', 
        file: '3L.json' },
    ] },
    { icon: "nitaig", label: "Nitāi & Gaurāṅga", files: [
      { 
        title: 'parama karuṇa, paṁhu duijana', 
        firstline: 'parama karuna pamhu duijana', 
        file: '3P.json' },
      { 
        title: 'nitāi caitanya dohe baḍa avatāra', 
        firstline: 'nitai caitanya dohe bada avatara', 
        file: 'dG.json' },
      { 
        title: 'eibāra karuṇā kara caitanya⋅ nitāi', 
        firstline: 'eibara karuna kara caitanya nitai', 
        file: '0g.json' },
      { 
        title: 'kabe ha’be bala se-dina āmāra', 
        firstline: 'kabe habe bala se dina amara', 
        file: '3T.json' },
      { 
        title: 'e ghora saṁsāre, paḍiyā mānava', 
        firstline: 'e ghora samsare padiya manava', 
        file: '3U.json' },
      { 
        title: '‘gaurāṅga’ balite habe pulaka śarīra', 
        firstline: 'gauranga balite habe pulaka sarira', 
        file: '3V.json' },
      { 
        title: 'kabe ha’be hena daśā mora', 
        firstline: 'kabe habe hena dasa mora', 
        file: '3W.json' },
      { 
        title: 'dhana mora nityānanda, pati mora gaura-candra', 
        firstline: 'dhana mora nityananda pati mora gaura candra', 
        file: 'dM.json' },
      { 
        title: 'nitāi-gaura-nāma, ānandera dhāma', 
        firstline: 'nitai gaura nama anandera dhama', 
        file: '3Z.json' },
      { 
        title: 'e’lo gaura-rasa-nadī kādambinī ha’ye', 
        firstline: 'elo gaura rasa nadi kadambini haye', 
        file: 'dO.json' },
      { 
        title: 'jaya jaya śrī-kṛṣṇacaitanya-nityānanda', 
        firstline: 'jaya jaya sri krsnacaitanya nityananda', 
        file: 'dP.json' },
      { 
        title: 'śrī-kṛṣṇacaitanya prabhu dayā kara more', 
        firstline: 'sri krsnacaitanya prabhu daya kara more', 
        file: 'dQ.json' },
      { 
        title: 'jaya jaya nityānandādvaita gaurāṅga', 
        firstline: 'jaya jaya nityanandadvaita gauranga', 
        file: 'dR.json' },
    ] },
    { icon: "sradha", label: "Śrīmatī Rādhā", files: [
      { 
        title: 'rādhikā caraṇa-padma, sakala śreyera sadma', 
        firstline: 'radhika carana padma sakala sreyera sadma', 
        file: '44.json' },
      { 
        title: 'ramaṇī-śiromaṇi, vṛṣabhānu-nandinī', 
        firstline: 'ramani siromani vrsabhanu nandini', 
        file: '46.json' },
      { 
        title: 'mahābhāva-cintāmaṇi, udbhāvita tanukhāni', 
        firstline: 'mahabhava cintamani udbhavita tanukhani', 
        file: '48.json' },
      { 
        title: 'varaja-vipine yamunā-kūle', 
        firstline: 'varaja vipine yamuna kule', 
        file: 'dV.json' },
      { 
        title: 'śatakoṭī gopī mādhava-mana', 
        firstline: 'satakoti gopi madhava mana', 
        file: '4A.json' },
      { 
        title: 'rādhā-bhajane jadi mati nāhi bhelā', 
        firstline: 'radha bhajane jadi mati nahi bhela', 
        file: '4B.json' },
      { 
        title: 'vṛṣabhānu-sutā⋅, caraṇa⋅ sevane', 
        firstline: 'vrsabhanu suta carana sevane', 
        file: 'dY.json' },
      { 
        title: 'śrī-kṛṣṇa-virahe, rādhikāra daśā', 
        firstline: 'sri krsna virahe radhikara dasa', 
        file: '4E.json' },
      { 
        title: 'rādhikā-caraṇareṇu, bhūṣaṇa kariyā tanu', 
        firstline: 'radhika caranarenu bhusana kariya tanu', 
        file: '4F.json' },
      { 
        title: 'rādhā-rāṇī kī jaya! mahārāṇī kī jaya!', 
        firstline: 'radha rani ki jaya maharani ki jaya', 
        file: 'e1.json' },
      { 
        title: 'kothāya go premamayi rādhe rādhe', 
        firstline: 'kothaya go premamayi radhe radhe', 
        file: 'e2.json' },
    ] },
    { icon: "skrsna", label: "Śrī Kṛṣṇa", files: [
      { 
        title: 'janama saphala tā’ra, kṛṣṇa daraśana jā’ra', 
        firstline: 'janama saphala tara krsna darasana jara', 
        file: 'e3.json' },
      { 
        title: 'bandhu-saṅge jadi tava raṅga parihāsa', 
        firstline: 'bandhu sange jadi tava ranga parihasa', 
        file: 'e4.json' },
      { 
        title: 'yamunā-puline, kadamba-kānane', 
        firstline: 'yamuna puline kadamba kanane', 
        file: 'e5.json' },
      { 
        title: 'tumi ta’ dayāra sindhu, adhama janāra bandhu', 
        firstline: 'tumi ta dayara sindhu adhama janara bandhu', 
        file: 'e6.json' },
      { 
        title: 'mora prabhu madana-gopāla, govinda gopīnātha', 
        firstline: 'mora prabhu madana gopala govinda gopinatha', 
        file: 'e7.json' },
      { 
        title: 'gopīnātha (1), mama nivedana śuna', 
        firstline: 'gopinatha 1 mama nivedana suna', 
        file: 'e8.json' },
      { 
        title: 'gopīnātha (2), ghucāo saṁsāra-jvālā', 
        firstline: 'gopinatha 2 ghucao samsara jvala', 
        file: 'e9.json' },
      { 
        title: 'gopīnātha (3), āmāra upāya nāi', 
        firstline: 'gopinatha 3 amara upaya nai', 
        file: 'ea.json' },
      { 
        title: 'prāṇeśvara! nivedana eijana kare', 
        firstline: 'pranesvara nivedana eijana kare', 
        file: 'eb.json' },
      { 
        title: 'hari hari! kṛpā kari’ rākha nija pade', 
        firstline: 'hari hari krpa kari rakha nija pade', 
        file: 'ec.json' },
      { 
        title: 'kṛṣṇa tava puṇya habe bhāi!', 
        firstline: 'krsna tava punya habe bhai', 
        file: 'ed.json' },
      { 
        title: 'hari hari! kabe haba vṛndāvana-vāsī', 
        firstline: 'hari hari kabe haba vrndavana vasi', 
        file: '5A.json' },
      { 
        title: 'mādhava, bahuta minati kari toya', 
        firstline: 'madhava bahuta minati kari toya', 
        file: '5E.json' },
      { 
        title: 'hari he dayāla mora jaya rādhānātha', 
        firstline: 'hari he dayala mora jaya radhanatha', 
        file: '5F.json' },
      { 
        title: 'he govinda he gopāla keśava mādhava dīna-dayāla', 
        firstline: 'he govinda he gopala kesava madhava dina dayala', 
        file: 'eh.json' },
      { 
        title: 'śuna, he rasika jana, kṛṣṇa-gaṇa agaṇana', 
        firstline: 'suna he rasika jana krsna gana aganana', 
        file: '5H.json' },
    ] },
    { icon: "radhak", label: "Śrī Śrī Rādhā & Kṛṣṇa", files: [
      { 
        title: 'kabe gaura-vane, suradhunī-taṭe', 
        firstline: 'kabe gaura vane suradhuni tate', 
        file: 'ej.json' },
      { 
        title: 'rādhā⋅ kṛṣṇa prāṇa mora yugala⋅ kiśora', 
        firstline: 'radha krsna prana mora yugala kisora', 
        file: 'ek.json' },
      { 
        title: 'śrī-rādhā-kṛṣṇa-padakamale mana', 
        firstline: 'sri radha krsna padakamale mana', 
        file: 'el.json' },
      { 
        title: 'rādhā-kṛṣṇa! nivedana ei jana kare', 
        firstline: 'radha krsna nivedana ei jana kare', 
        file: 'em.json' },
      { 
        title: 'āna kathā āna vyathā, nāhi jena jāi tathā', 
        firstline: 'ana katha ana vyatha nahi jena jai tatha', 
        file: '0W.json' },
    ] }
  ];

  container.innerHTML = '';

  const warned = document.createElement('div');
  warned.className = 'list-header--material';
  warned.style.cssText = 'text-align:center; opacity:.6; font-size:16px; font-width:700; width:100%; margin-top:8px; color: var(--highlight-color);';
  warned.textContent = 'Songs arranged by tattva';
  container.appendChild(warned);

  // ── Always-visible intro songs — same "glassy" ons-list-item styling
  // as the songs inside each tattva's expandable-content, but rendered
  // directly into `container` (not inside an <ons-list-item expandable>),
  // so there's nothing to tap open to reach them.
  const introSongs = [
    {
      title: 'maṅgalācaraṇa [auspicious invocation]',
      firstline: 'mangalacarana auspicious invocation',
      file: '00.json'
    },
    {
      title: 'svasti-vācana [prayer for auspiciousness]',
      firstline: 'svasti vacana prayer for auspiciousness',
      file: '0a.json'
    },
    {
      title: 'jaya-dhvani [collective roar of glories]',
      firstline: 'jaya dhvani collective roar of glories',
      file: '0b.json'
    }
  ];

  const introList = document.createElement('div');
  introList.className = 'glassy';

  introSongs.forEach(({ title, file }) => {
    const rec = window.INDEX[file];
    if (rec) {
      introList.appendChild(gen_listItem(title, () => showSongViewUI(file, null)));
    } else {
      console.warn(`File not found in index: ${file}`);
    }
  });

  container.appendChild(introList);

  tattvaLists.forEach((tattva) => {
    const item = ons.createElement(`
      <ons-list-item expandable>
        <div class="left"><img class="list-item__thumbnail" src="img/icons/${tattva.icon}.png"></div>
        <div class="center">${tattva.label}</div>
        <div class="expandable-content glassy"></div>
      </ons-list-item>
    `);

    const expandableContent = item.querySelector('.expandable-content');
    
    tattva.files.forEach(({ title, file }) => {
      // window.INDEX is keyed by file_name — look it up to confirm the
      // song still exists (files can be renamed/removed independently
      // of this hardcoded list), but use the hardcoded `title` for
      // display since that's what keeps this list human-readable/
      // greppable in source.
      const rec = window.INDEX[file];

      if (rec) {
        expandableContent.appendChild(gen_listItem(title, () => showSongViewUI(file, null)));
      } else {
        console.warn(`File not found in index: ${file}`);
      }
    });

    container.appendChild(item);
  });

// ── Ken Burns slideshow — appended once, after all tattva groups ──
  const slideshow = ons.createElement(`
    <div class="intro-thumb ken-burns-frame" data-progressive-load>
      <div class="slide-layer slide-a">
        <img class="slideshow ken-burns" alt="" style="--kb-scale:1.08;">
        <div class="slide-caption">
          <div class="slide-caption-heading"></div>
          <div class="slide-caption-body"></div>
        </div>
      </div>
      <div class="slide-layer slide-b">
        <img class="slideshow ken-burns" alt="" style="--kb-scale:1.08;">
        <div class="slide-caption">
          <div class="slide-caption-heading"></div>
          <div class="slide-caption-body"></div>
        </div>
      </div>
    </div>
  `);
  container.appendChild(slideshow);
  initSlideshow(slideshow);
}

// ---------------------------------------------------------------------
// Ken Burns slideshow — cycles through a fixed list of photos.
//
// A static PWA can't enumerate a folder at runtime (no server-side
// directory listing, and the service worker only caches URLs it's
// explicitly given) — so each photo is declared here, the same way the
// tattva song lists above are hardcoded rather than auto-discovered.
//
// One entry per photo — file, starting crop position, and caption text
// (formatted "Heading | Body", split by parseSlideCaption below) all
// live together, instead of three separate dicts keyed by filename that
// have to be kept in sync by hand. Caption suport: 140 char
// ---------------------------------------------------------------------
const SLIDESHOW_ITEMS = [
  { file: '001.jpg', position: 'top center', caption: 'A.C. Bhaktivedānta Swami Prabhupāda | the Founder-Ācārya of ISKCON and greatest exponent of Kṛṣṇa consciousness in the western world.' },
  { file: '002.jpg', position: 'top center', caption: 'Bhakti Prajñana Keśava Gosvāmī | Ācārya Keśarī, the founder of the Gauḍīya Vedānta Samiti and sannyāsa-guru of BV Nārāyaṇa Gosvāmī, A.C. Bhaktivedānta Swami' },
  { file: '003.jpg', position: 'top center', caption: 'Bhakti Siddhānta Sarasvatī Ṭhākura | prominent religious scholar, astronomer, mathematician and the founder of sixty-four Gauḍīya Maṭhas (Vedic institutes)' },
  { file: '004.jpg', position: 'top center', caption: 'Bhaktivedānta Nārāyaṇa Gosvāmī | Honored as Yugācārya, revealed the inner reasons for the advent of Mahāprabhu and taught about pure bhakti around the world.' },
  { file: '005.jpg', position: 'top center', caption: 'AC Bhaktivedānta Swami Prabhupāda | Studio recording session' },
  { file: '006.jpg', position: 'top center', caption: 'Bhaktivedānta Vāmana Gosvāmī | Founder-Ācārya of the Gauḍīya Vedānta Samiti and renowned preacher of pure Gauḍīya siddhānta.' },
  { file: '007.jpg', position: 'top center', caption: 'Sannyāsa ceremony | [from left to right] Bhaktivedānta Muni Mahārāja, Bhakti Prajñana Keśava Gosvāmī Mahārāja, BV Swami Prabhupāda' },
  { file: '009.jpg', position: 'top center', caption: 'Bhaktivedānta Nārāyaṇa Gosvāmī | Honored as Yugācārya, revealed the inner reasons for the advent of Mahāprabhu and taught about pure bhakti around the world.' },
  { file: '010.jpg', position: 'top center', caption: 'Bhaktivedānta Nārāyaṇa Gosvāmī | Honored as Yugācārya, revealed the inner reasons for the advent of Mahāprabhu and taught about pure bhakti around the world.' },
  { file: '008.jpg', position: 'top center', caption: 'Nitāi Gaurāṅga | In the Age of Kali, intelligent persons perform congregational chanting to worship the incarnation of Godhead who constantly sings the names of Kṛṣṇa.' }
];

// Single source of truth for how long each photo stays on screen. The
// Ken Burns pan/zoom (--kb-duration) is derived from this in JS below,
// so the animation always finishes exactly as the crossfade begins —
// change this one value only; never hardcode a duration anywhere else.
const SLIDESHOW_DURATION_MS = 14000; // was 9000 — slower now

let _slideshowIntervalId = null;

// small shuffle helper
function shuffleArray(arr) {
  const a = arr.slice(); // copy so we don't mutate the original
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Parses "Heading | Body text" into { heading, body }. If there's no
// "|", the whole string is treated as heading-only. Empty/whitespace-only
// caption means no overlay at all for that photo.
function parseSlideCaption(captionText) {
  const raw = (captionText || '').trim();
  if (!raw) return null;

  const parts = raw.split('|');
  const heading = (parts[0] || '').trim();
  const body = parts.slice(1).join('|').trim(); // rejoin in case body itself contains "|"

  if (!heading && !body) return null;
  return { heading, body };
}

function initSlideshow(wrapper) {
  const layerA = wrapper.querySelector('.slide-a');
  const layerB = wrapper.querySelector('.slide-b');

  if (!layerA || !layerB || SLIDESHOW_ITEMS.length === 0) {
    console.warn('[slideshow] missing layers or no images', {
      layerA, layerB, count: SLIDESHOW_ITEMS.length
    });
    return;
  }

  // Random order every time the page opens
  const items = shuffleArray(SLIDESHOW_ITEMS);

  if (_slideshowIntervalId !== null) {
    clearInterval(_slideshowIntervalId);
    _slideshowIntervalId = null;
  }

  // All photos pan straight up — set directly on each layer's <img>
  // (custom properties would inherit from the parent .slide-layer too,
  // but setting them on the actual img being animated is clearer).
  [layerA, layerB].forEach((layer) => {
    const img = layer.querySelector('.slideshow');
    img.style.setProperty('--kb-pan-x', '0%');
    img.style.setProperty('--kb-pan-y', '-8%');
    img.style.setProperty('--kb-duration', (SLIDESHOW_DURATION_MS / 1000) + 's');
  });

  let i = 0;
  let front = layerA;
  let back = layerB;

  // `layer` here is a .slide-layer wrapper div (containing both the
  // <img> and its .slide-caption) — NOT the <img> itself, so every
  // element we touch is looked up as a child of `layer`.
  const setSlide = (layer, item) => {
    const img = layer.querySelector('.slideshow');
    const captionEl = layer.querySelector('.slide-caption');
    const headingEl = layer.querySelector('.slide-caption-heading');
    const bodyEl = layer.querySelector('.slide-caption-body');

    img.src = `img/slideshow/${item.file}`;
    img.alt = item.caption || '';
    img.style.objectPosition = item.position || 'center';

    // Anchor the zoom to the same point as the static crop above. Without
    // this, --kb-origin falls back to its CSS default of "center", so the
    // zoom crops inward from the middle of the frame regardless of where
    // object-position put the face — on a portrait photo squeezed into a
    // square frame there's very little headroom to begin with, so a
    // center-anchored zoom reliably crops the face out as it scales up.
    // Anchoring the zoom origin to "top center" keeps the top of the
    // photo fixed in place as the reference point while it scales, so
    // the face stays in frame throughout the animation instead of
    // sliding out as it zooms.
    img.style.setProperty('--kb-origin', item.position || 'center');

    // Restart the Ken Burns pan/zoom animation cleanly on this layer's
    // image (fixed offsetWidth typo — offsetWith isn't a real property
    // and silently did nothing, so the animation never actually reset).
    img.style.animation = 'none';
    void img.offsetWidth; // force reflow
    img.style.animation = '';

    const parsed = parseSlideCaption(item.caption);
    if (parsed) {
      headingEl.textContent = parsed.heading;
      bodyEl.textContent = parsed.body;
      captionEl.classList.remove('slide-caption-empty');
    } else {
      headingEl.textContent = '';
      bodyEl.textContent = '';
      captionEl.classList.add('slide-caption-empty');
    }
  };

  // Preload the next photo so it's ready before we fade to it
  const preloadNext = (idx) => {
    const nextItem = items[(idx + 1) % items.length];
    new Image().src = `img/slideshow/${nextItem.file}`;
  };

  // Show first slide immediately
  setSlide(front, items[i]);
  front.classList.add('slide-visible');
  preloadNext(i);

  if (items.length > 1) {
    const showNext = () => {
      i = (i + 1) % items.length;
      setSlide(back, items[i]);
      back.classList.add('slide-visible');
      front.classList.remove('slide-visible');

      // Swap pointers
      [front, back] = [back, front];
      preloadNext(i);
    };

    _slideshowIntervalId = setInterval(showNext, SLIDESHOW_DURATION_MS);
  }
}