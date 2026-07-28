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
        ile: 'e6.json' },
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
  warned.textContent = 'Songs grouped and ordered by tattva';
  container.appendChild(warned);

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
}