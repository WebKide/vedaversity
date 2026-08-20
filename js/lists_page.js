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

  names.forEach((name) => {
    const el = gen_swipeableListItem(
      name,
      name, // use listName as the ID/key
      () => showListUI(name),
      () => {
        ons.notification.confirm(`Delete list "${name}"?`, { buttonLabels: ['Cancel', 'Delete'] }).then((idx) => {
          if (idx === 1) {
            deleteList(name);
            render_customLists(page);
          }
        });
      }
    );
    container.appendChild(el);
  });

  container.classList.toggle('glassy', names.length > 0);

  /* ---- visibility / height rules ---- */
  const createBtn = document.getElementById('createListBtn');
  if (createBtn) {
    createBtn.style.display = '';               // always visible
  }

  if (names.length > 3) {
    container.style.maxHeight = '180px';        // roughly 3 items
    container.style.overflowY  = 'auto';
  } else {
    container.style.maxHeight = '';
    container.style.overflowY = '';
  }
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

function render_tattvaLists(page) {
  const shortcutsContainer = page.querySelector('#quick-shortcuts');
  const tattvaContainer    = page.querySelector('#tattva-songs');
  const aratiContainer     = page.querySelector('#arati-lists');
  const galleryContainer   = page.querySelector('#gallery-section');

  if (!shortcutsContainer || !tattvaContainer || !aratiContainer || !galleryContainer) return;

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
        file: 'eE.json' },
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
        file: 'dI.json' },
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

  const aratiLists = [
    { icon: "marati", label: "Predawn | Maṅgala Ārati", files: [
      {
        title: 'Śrī Parama-gurudeva Ārati',
        firstline: 'jaya jaya gurudeva śrī bhakti prajñāna',
        file: 'f8.json' },
      {
        title: 'Śrīla Prabhupāda Ārati',
        firstline: 'jaya jaya prabhupādera ārati nehāri',
        file: 'f9.json' },
      {
        title: 'Śrī Gurvāṣṭakam',
        firstline: 'saṁsāra dāvānala līḍha loka',
        file: '06.json' },
      {
        title: 'Śrī Prabhupāda-Padma-Stavakaḥ',
        firstline: 'sujanārbuda rādhita pāda yugaṁ',
        file: '0A.json' },
      {
        title: 'Śrī Maṅgala Ārati',
        firstline: 'maṅgala śrī guru-gaura maṅgala mūrati',
        file: 'eS.json' },
      {
        title: 'Vibhāvarī Śeṣa',
        firstline: 'vibhāvarī śeṣa āloka praveśa',
        file: '5S.json' },
      {
        title: 'Jaya Rādhe Jaya Kṛṣṇa',
        firstline: 'jaya rādhe jaya kṛṣṇa jaya vṛndāvana',
        file: '5M.json' },
      {
        title: 'Śrī Vṛndā-Devyāṣṭakam',
        firstline: 'gāṅgeya cāmpeya taḍid vinindi',
        file: '1E.json' },
      {
        title: 'Śrī Nāma-kīrtana',
        firstline: 'hari haraye namaḥ kṛṣṇa yādavāya namaḥ',
        file: '5L.json' },
    ] },

    { icon: "narati", label: "Noon | Rāja Bhoga Ārati", files: [
      {
        title: 'Śrī Madhyāhna Bhoga Ārati',
        firstline: 'bhaja bhakata vatsala śrī gaura hari',
        file: 'eG.json' },
      {
        title: 'Yaśomatī Nandana',
        firstline: 'yaśomatī nandana vrajavara nāgara',
        file: 'eQ.json' },
      {
        title: 'Jaya Rādhā-Mādhava',
        firstline: 'jaya rādhā mādhava kuñja vihārī',
        file: 'f5.json' },
    ] },

    { icon: "earati", label: "Evening | Gaura Ārati", files: [
      {
        title: 'Śrī Gaura Ārati',
        firstline: 'jaya jaya gorācāṅder āratiko śobhā',
        file: 'f7.json' },
      {
        title: 'Śrī Yugala Ārati',
        firstline: 'jaya jaya rādhā kṛṣṇa yugala milana',
        file: 'fa.json' },

      {
        title: 'Śrī Tulasī Parikramā & Ārati (1)',
        firstline: 'jaya jaya rādhā kṛṣṇa yugala milana',
        file: 'eN.json' },
      {
        title: 'Śrī Tulasī Parikramā & Ārati (2)',
        firstline: 'jaya jaya rādhā kṛṣṇa yugala milana',
        file: 'eF.json' },
      {
        title: 'Śrī Nāma-kīrtana',
        firstline: 'hari haraye namaḥ kṛṣṇa yādavāya namaḥ',
        file: '5L.json' }
    ] }
  ];

  /* ================================================================
     1. QUICK SHORTCUTS  (rendered into its own material box)
     ================================================================ */
  shortcutsContainer.innerHTML = '';

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
      title: 'svasti-vācana [extended prayers]',
      firstline: 'svasti vacana prayer for auspiciousness',
      file: '0a.json'
    },
    {
      title: 'jaya-dhvani [victory roar]',
      firstline: 'jaya śrī śrī guru gaurāṅga',
      file: '0b.json'
    },
    {
      title: 'selected stava-stutis [prayers]',
      firstline: 'yat kiṅkarīṣu bahuśaḥ khalu kāku vāṇī',
      file: 'ai.json'
    },
    {
      title: 'mahā-mantra [hare kṛṣṇa]',
      firstline: 'hare kṛṣṇa hare kṛṣṇa kṛṣṇa kṛṣṇa hare hare',
      file: 'dp.json'
    }
  ];

  const introList = document.createElement('div');
  introList.className = 'glassy';

  introList.style.margin = '15px 0';

  const svgIcon = `
    <div class="left">
      <svg class="shortcut-icon"
           viewBox="0 -960 960 960"
           height="24px"
           width="24px"
           fill="var(--highlight-color)"
           aria-hidden="true"
           focusable="false">
        <path d="M400-280h160v-80H400v80Zm0-160h280v-80H400v80ZM280-600h400v-80H280v80Zm200 120ZM265-80q-79 0-134.5-55.5T75-270q0-57 29.5-102t77.5-68H80v-80h240v240h-80v-97q-37 8-61 38t-24 69q0 46 32.5 78t77.5 32v80Zm135-40v-80h360v-560H200v160h-80v-160q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H400Z"/>
      </svg>
    </div>`;

  introSongs.forEach(({ title, file }) => {
    const rec = window.INDEX[file];
    if (rec) {
      const item = gen_listItem(
        title,
        () => showSongViewUI(file, null),
        rec.author || ''
      );

      // Inject the icon into the 'left' slot of the ons-list-item
      item.insertAdjacentHTML('afterbegin', svgIcon);
     
      introList.appendChild(item);
    } else {
      console.warn(`File not found in index: ${file}`);
    }
  });

  shortcutsContainer.appendChild(introList);

  /* ================================================================
     2. SONGS ARRANGED BY TATTVA  (expandable, glassy content)
     ================================================================ */
  tattvaContainer.innerHTML = '';

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
        expandableContent.appendChild(gen_listItem(title, () => {
          // Build the flat list of files for this tattva/arati group so the footer nav wraps it
          const groupList = tattva.files.map(f => f.file);
          document.getElementById('navigator').pushPage('tmpl-songview', {
            data: { songId: file, songList: groupList }
          });
        }, rec.author || ''));
      } else {
        console.warn(`File not found in index: ${file}`);
      }
    });

    tattvaContainer.appendChild(item);
  });

  /* ================================================================
     3. ĀRATI & PŪJĀ  (expandable, moved out of the old tattva list)
     ================================================================ */
  aratiContainer.innerHTML = '';

  aratiLists.forEach((tattva) => {
    const item = ons.createElement(`
      <ons-list-item expandable>
        <div class="left"><img class="list-item__thumbnail" src="img/icons/${tattva.icon}.png"></div>
        <div class="center">${tattva.label}</div>
        <div class="expandable-content glassy"></div>
      </ons-list-item>
    `);

    const expandableContent = item.querySelector('.expandable-content');

    tattva.files.forEach(({ title, file }) => {
      const rec = window.INDEX[file];
      if (rec) {
        expandableContent.appendChild(gen_listItem(title, () => {
          // Build the flat list of files for this tattva/arati group so the footer nav wraps it
          const groupList = tattva.files.map(f => f.file);
          document.getElementById('navigator').pushPage('tmpl-songview', {
            data: { songId: file, songList: groupList }
          });
        }, rec.author || ''));
      } else {
        console.warn(`File not found in index: ${file}`);
      }
    });

    aratiContainer.appendChild(item);
  });

  /* ================================================================
     4. GALLERY
     ================================================================ */
  // Reuse the existing slideshow element if this page instance already
  // built one — we still want a fresh shuffle + restarted timer on every
  // visit to the Lists tab, but initSlideshow() already handles both of
  // those internally, so calling it again on the same element is enough.
  // Only the rest of the gallery section (which doesn't need to reshuffle)
  // gets cleared and rebuilt.
  const existingSlideshow = galleryContainer.querySelector('.ken-burns-frame');
  galleryContainer.innerHTML = '';

  const slideshow = existingSlideshow || ons.createElement(`
    <div class="intro-thumb ken-burns-frame" data-progressive-load>
      <div class="slide-layer slide-a">
        <img class="slideshow ken-burns" alt="" style="--kb-scale:1.25;" draggable="false">
        <div class="slide-caption">
          <div class="slide-caption-heading"></div>
          <div class="slide-caption-body"></div>
        </div>
      </div>
      <div class="slide-layer slide-b">
        <img class="slideshow ken-burns" alt="" style="--kb-scale:1.25;" draggable="false">
        <div class="slide-caption">
          <div class="slide-caption-heading"></div>
          <div class="slide-caption-body"></div>
        </div>
      </div>
    </div>
  `);
  galleryContainer.appendChild(slideshow);
  initSlideshow(slideshow);

  const warned = document.createElement('div');
  warned.className = 'list-header--material';
  warned.style.cssText =
    'text-align:center; opacity:.6; font-size:16px; font-weight:700; width:100%; margin-top:8px; color:var(--highlight-color);';
  warned.textContent = 'About this section';

  // Append to the actual container that exists in render_tattvaLists()
  galleryContainer.appendChild(warned);


  const listsFooter = document.createElement('div');
  listsFooter.className = 'glassy list-item__subtitle';

  /* touch-action: manipulation prevents the browser from zooming on double-tap */
  listsFooter.style.cssText =
    'text-align:left; font-size:16px; padding:16px; margin:12px 6px; touch-action:manipulation;';

  const footerMsg =
    '✦ The <highlight>Quick Shortcuts</highlight> section contains songs that are used repeatedly throughout the day, regardless of the particular time, occasion, or type of devotional activity. These have been placed at the top of this section for quick and convenient access. <br/>✦ The songs in the <highlight>Lists by Tattva</highlight> have been selected and arranged according to their principal devotional subject, with the aim of making the songbook easier to navigate and use at home or in any <i>Maṭha</i>. The selections are based primarily on <i>Śrī Gauḍīya Gīti-guccha</i>, together with songs found in the traditional repertoire of <i>Gauḍīya Maṭha</i> temples and songs associated with particular times of the day. The categories are intended as a <b>practical devotional arrangement</b> rather than as a rigid classification. Some songs naturally express more than one <i>tattva</i>, and in such cases they have been placed according to how they are sung in <i>Gauḍīya Maṭha</i>. <br/>✦ The <highlight>Ārati & Pūjā</highlight> section is arranged separately according to the three traditional times of worship, while the <i>Tattva</i> sections gather songs according to the mood or personality. The resulting selection is therefore <b>curated rather than exhaustive</b>: it represents a practical collection of songs suitable for meditation, personal <i>bhajana</i>, and congregational chanting, while preserving the devotional character of the traditional <i>Gauḍīya Vaiṣṇava</i> repertoire.<br/>✦ The <highlight>Gauḍīya Gallery</highlight> section contains some photographs and paintings to serve as windows to the spiritual world.';

  listsFooter.innerHTML = `
    <p text-align:left; font-size:16; padding:16px; margin:12px 6px; touch-action: manipulation;>${footerMsg}</p>
  `;

  galleryContainer.appendChild(listsFooter);
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
  { file: '001.jpg', position: 'center', caption: 'Kuñja Kīrtana | Śrī Rādhā has organized a festival, along with Her gopī friends, for the pleasure of Kṛṣṇa. The festival includes singling, dancing, and playing instruments.' },
  { file: '002.jpg', position: 'top center', caption: 'Bhakti Prajñana Keśava Gosvāmī | Ācārya Keśarī, founder of the Gauḍīya Vedānta Samiti and sannyāsa-guru of Bhaktivedānta Nārāyaṇa Gosvāmī, A.C. Bhaktivedānta Swami.' },
  { file: '003.jpg', position: 'top center', caption: 'Bhakti Siddhānta Sarasvatī Ṭhākura | prominent religious scholar, astronomer, mathematician and the founder of sixty-four Gauḍīya Maṭhas (Vedic institutes).' },
  { file: '004.jpg', position: 'center', caption: 'Bhaktivedānta Nārāyaṇa Gosvāmī | Bhaktivedānta Nārāyaṇa Gosvāmī Mahārāja took his divine birth in a devout Vaiṣṇava family in Tivārīpura, in the state of Bihar, India.' },
  { file: '005.jpg', position: 'top center', caption: 'A.C. Bhaktivedānta Swami Prabhupāda | the Founder-Ācārya of ISKCON and greatest exponent of Kṛṣṇa consciousness in the western world. Recording session in 1969 in LA' },
  { file: '006.jpg', position: 'top center', caption: 'Bhaktivedānta Vāmana Gosvāmī | Ācārya of the Gauḍīya Vedānta Samiti and renowned preacher of pure Gauḍīya siddhānta.' },
  { file: '007.jpg', position: 'top center', caption: 'Sannyāsa ceremony | [from left to right] Bhaktivedānta Muni Mahārāja, Bhakti Prajñana Keśava Gosvāmī Mahārāja, Bhaktivedānta Swami Prabhupāda' },
  { file: '008.jpg', position: 'top center', caption: 'Nitāi Gaurāṅga | In the Age of Kali, intelligent persons perform congregational chanting to worship the incarnation of Godhead who constantly sings the names of Kṛṣṇa.' },
  { file: '009.jpg', position: 'top center', caption: 'Old Ratha-yātrā photo | Lord Jagannātha is coming out of the Mandir accompanied by His servants.' },
  { file: '010.jpg', position: 'top center', caption: 'Yugācārya Bhaktivedānta Nārāyaṇa Gosvāmī | Awarded the title of Yugācārya in Varṣānā (2003) for his profound global contribution to pure bhakti.' }
];

// Single source of truth for how long each photo stays on screen. The
// Ken Burns pan/zoom (--kb-duration) is derived from this in JS below,
// so the animation always finishes exactly as the crossfade begins —
// change this one value only; never hardcode a duration anywhere else.
const SLIDESHOW_DURATION_MS = 10000; // was 9000 — slower now

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
    img.style.setProperty('--kb-pan-x', '-2%');  // slightly to the left
    img.style.setProperty('--kb-pan-y', '-2%');  // slightly to the bottom
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

  let isHovering = false;

  // Show first slide immediately
  setSlide(front, items[i]);
  front.classList.add('slide-visible');
  preloadNext(i);

  const showNext = () => {
    if (isHovering) return;
    i = (i + 1) % items.length;
    setSlide(back, items[i]);
    back.classList.add('slide-visible');
    front.classList.remove('slide-visible');
    [front, back] = [back, front];
    preloadNext(i);
  };

  const startInterval = () => {
    if (_slideshowIntervalId !== null) clearInterval(_slideshowIntervalId);
    _slideshowIntervalId = setInterval(showNext, SLIDESHOW_DURATION_MS);
  };

  const stopInterval = () => {
    if (_slideshowIntervalId !== null) {
      clearInterval(_slideshowIntervalId);
      _slideshowIntervalId = null;
    }
  };

  if (items.length > 1) {
    startInterval();
  }

  wrapper.addEventListener('mouseenter', () => {
    isHovering = true;
    stopInterval();
    const visibleImg = wrapper.querySelector('.slide-visible .slideshow');
    if (visibleImg) visibleImg.style.animationIterationCount = 'infinite';
  });

  wrapper.addEventListener('mouseleave', () => {
    isHovering = false;
    const visibleImg = wrapper.querySelector('.slide-visible .slideshow');
    if (visibleImg) {
      visibleImg.style.animationIterationCount = '';
      visibleImg.style.animation = 'none';
      void visibleImg.offsetWidth;
      visibleImg.style.animation = '';
    }
    if (items.length > 1) startInterval();
  });
}