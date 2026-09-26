// Blocco A — regole del compagno naturale, fonti, ritrovamento, riassunto dei tipi.
const { AlignmentType, TextRun } = require('docx');
const H = require('./helpers');
const { C } = H;

const TABELLA = [
  // liv, DV, BAB, Tem, Rif, Vol, Abilità, Talenti, AN, For/Des, privilegi
  [1, 2, 1, 3, 3, 0, 2, 1, 0, 0, 'Legame, Cavalcatura, Condividere incantesimi'],
  [2, 3, 2, 3, 3, 1, 3, 2, 0, 0, 'Bardatura'],
  [3, 3, 2, 3, 3, 1, 3, 2, 1, 1, 'Eludere'],
  [4, 4, 3, 4, 4, 1, 4, 2, 1, 1, 'Possibile avanzamento'],
  [5, 5, 3, 4, 4, 1, 5, 3, 1, 1, '—'],
  [6, 6, 4, 5, 5, 2, 6, 3, 2, 2, 'Devozione'],
  [7, 6, 4, 5, 5, 2, 6, 3, 2, 2, 'Possibile avanzamento'],
  [8, 7, 5, 5, 5, 2, 7, 4, 2, 2, 'Aumento di caratteristica'],
  [9, 8, 6, 6, 6, 2, 8, 4, 3, 3, 'Multiattacco'],
  [10, 9, 6, 6, 6, 3, 9, 5, 3, 3, '—'],
  [11, 9, 6, 6, 6, 3, 9, 5, 3, 3, '—'],
  [12, 10, 7, 7, 7, 3, 10, 5, 4, 4, '—'],
  [13, 11, 8, 7, 7, 3, 11, 6, 4, 4, 'Aumento di caratteristica'],
  [14, 12, 9, 8, 8, 4, 12, 6, 4, 4, '—'],
  [15, 12, 9, 8, 8, 4, 12, 6, 5, 5, 'Eludere migliorato'],
  [16, 13, 9, 8, 8, 4, 13, 7, 5, 5, '—'],
  [17, 14, 10, 9, 9, 4, 14, 7, 5, 5, '—'],
  [18, 15, 11, 9, 9, 5, 15, 8, 6, 6, '—'],
  [19, 15, 11, 9, 9, 5, 15, 8, 6, 6, '—'],
  [20, 16, 12, 10, 10, 5, 16, 8, 6, 6, 'Aumento di caratteristica'],
];
const segno = n => (n >= 0 ? '+' : '') + n;

// Modificatori di taglia: Vol. 1 con i segni di Volare e BMC/DMC corretti
const TAGLIE = [
  ['Piccolissima', '+8', '+8', '+8', '-8', '0 / 0', '—'],
  ['Minuta', '+4', '+6', '+4', '-4', '0 / 0', '—'],
  ['Minuscola', '+2', '+4', '+3', '-2', '0 / 0', '—'],
  ['Piccola', '+1', '+2', '+2', '-1', '1 cs / 1,5 m', '—'],
  ['Media', '+0', '+0', '+0', '+0', '1 cs / 1,5 m', '—'],
  ['Grande', '-1', '-2', '-2', '+1', '2×2 cs / 3 m', '2×1 cs / 1,5 m'],
  ['Enorme', '-2', '-4', '-3', '+2', '3×3 cs / 4,5 m', '3×3 cs / 3 m'],
  ['Mastodontica', '-4', '-6', '-4', '+4', '4×4 cs / 6 m', '4×4 cs / 4,5 m'],
  ['Colossale', '-8', '-8', '-8', '+8', '6×6 cs / 9 m', '6×6 cs / 6 m'],
];

const FONTI = [
  ['Druido — Legame con la natura', '1°', 'livello di druido', 'animali, parassiti, vegetali'],
  ['↳ Cantore degli alberi', '1°', 'livello di druido +2', 'solo vegetali'],
  ['↳ Druido della piaga', '1°', 'livello di druido', 'solo parassiti'],
  ['Ranger — Legame del cacciatore', '4°', 'livello di ranger −3', 'domestico, serpente o felino piccolo'],
  ['↳ Falconiere', '1°', 'livello di ranger −3 (metà PF fino al 3°)', 'Uccello rapace gigante'],
  ['↳ Signore della sella', '4°', 'livello di ranger −3; pieno dall’8°', 'domestico, serpente o felino piccolo'],
  ['Erudito — ricerca applicata Addestratore', '4°', 'livello di erudito −3 (−1 con Simbiosi)', 'domestico'],
  ['↳ Naturalista', '1°', 'livello di erudito', 'animali, parassiti, vegetali'],
  ['Barbaro — Cane rabbioso', '1°', 'livello di barbaro', 'animali, parassiti, vegetali'],
  ['Barbaro — Furia in sella', '5°', 'livello di barbaro', 'domestico'],
  ['Inquisitore — Custode del serraglio', '1°', 'livello di inquisitore', 'domestico'],
  ['Inquisitore — Equites', '5°', 'livello di inquisitore', 'domestico'],
  ['Paladino — Destriero divino', '5°', 'livello di paladino', 'domestico'],
  ['Guardia nera — Destriero sacrilego', '5°', 'livello di guardia nera', 'domestico'],
  ['Cavaliere — Cavalcaonde', '1°', 'livello di cavaliere', 'acquatico, Ippocampo gigante'],
  ['Cavaliere — Cavaliere del Nuovo mondo', '1°', 'livello di cavaliere', 'lucertoloide o dinosauro'],
  ['Cavaliere — Ricognitore, Cavaliere leggero, Cavaliere pesante', '1°', 'livello di cavaliere', 'domestico'],
  ['Ammazzamostri — Inseguitore', '1°', 'livello di ammazzamostri', 'domestico cavalcabile'],
  ['Marzialista — Cacciatore bataar', '1°', 'livello di marzialista', 'domestico'],
  ['Nobile — Cavaliere errante', '7°', 'livello di nobile', 'domestico cavalcabile'],
];

function riassunto(bestiario) {
  const perTipo = {};
  for (const b of bestiario) for (const t of b.tipi) (perTipo[t] = perTipo[t] || []).push(b);
  const out = [];
  for (const t of Object.keys(perTipo).sort((a, b) => a.localeCompare(b, 'it'))) {
    const ch = [new TextRun({ text: t[0].toUpperCase() + t.slice(1) + ': ', font: 'Times New Roman', size: H.CORPO, bold: true })];
    perTipo[t].sort((a, b) => a.nome.localeCompare(b.nome, 'it')).forEach((b, i) => {
      if (i) ch.push(new TextRun({ text: '; ', font: 'Times New Roman', size: H.CORPO }));
      ch.push(new TextRun({ text: b.nome, font: 'Times New Roman', size: H.CORPO, color: C.rarita[b.rarita] }));
    });
    ch.push(new TextRun({ text: '.', font: 'Times New Roman', size: H.CORPO }));
    out.push(H.par(ch, { align: AlignmentType.JUSTIFY, after: 80 }));
  }
  return out;
}

function raritaRun(r) { return [new TextRun({ text: r[0].toUpperCase() + r.slice(1), font: 'Times New Roman', size: 18, bold: true, color: C.rarita[r] })]; }

function bloccoA(bestiario) {
  const X = [];
  X.push(H.titoloCapitolo('Compagni naturali', 'cap_regole', { pageBreakBefore: false }));
  X.push(H.voce('Dado Vita:', 'd8.', { after: 30 }));
  X.push(H.voce('Abilità di classe:', 'Acrobazia, Artista della Fuga, Furtività, Intimidire, Nuotare, Percezione, Scalare, Sopravvivenza, Volare.', { after: 30 }));
  X.push(H.voce('Competenze offensive:', 'Tutti gli attacchi naturali posseduti. Non possono acquisire talenti di competenza nelle armi.', { after: 30 }));
  X.push(H.voce('Competenze difensive:', 'Nessuna. Non possono acquisire talenti di competenza nelle armature o negli scudi.', { after: 120 }));

  X.push(H.titoloSezione('Tabella del compagno naturale', 'sez_tabella'));
  const W = [700, 500, 600, 750, 750, 750, 700, 700, 1100, 700, 2956];
  X.push(H.tabella(['Livello', 'DV', 'BAB', 'Tempra', 'Riflessi', 'Volontà', 'Abilità', 'Talenti', 'Armatura naturale', 'For/Des', 'Privilegi di classe'],
    TABELLA.map(r => [r[0] + '°', r[1], segno(r[2]), segno(r[3]), segno(r[4]), segno(r[5]), r[6], r[7], segno(r[8]), segno(r[9]), r[10]]),
    W, { allinea: { 10: AlignmentType.LEFT } }));
  X.push(H.vuoto(120));

  X.push(H.voce('Livello:', 'Il livello effettivo del compagno naturale, cioè il livello della classe che lo fornisce modificato come indicato in “Chi ottiene un compagno naturale”. I livelli forniti da fonti diverse si cumulano. Se il livello effettivo è inferiore al 1°, si usa la riga del 1° livello.'));
  X.push(H.voce('DV:', 'Il numero totale dei Dadi Vita del compagno naturale, su ognuno dei quali si applica il bonus di Costituzione. I Punti Ferita così ottenuti si dividono tra Punti Ferita e Punti Fatica come per i personaggi (vedi Volume 1).'));
  X.push(H.voce('BAB:', 'Il bonus di attacco base del compagno naturale. Salvo diversamente indicato, tutti gli attacchi del compagno naturale sono effettuati al bonus di attacco base migliore e aggiungono il bonus di Forza ai tiri per i danni, a meno che non abbia un solo attacco, nel qual caso lo si aggiunge una volta e mezzo. Si ricorda che gli attacchi secondari sono effettuati con -5 al tiro per colpire e applicano metà bonus di Forza al danno.'));
  X.push(H.voce('Tempra/Riflessi/Volontà:', 'Il bonus ai Tiri Salvezza del compagno naturale.'));
  X.push(H.voce('Abilità:', 'I punti abilità totali del compagno naturale. Se un compagno naturale aumenta la sua Intelligenza a 10 o più, ottiene punti abilità bonus come di norma. Un compagno naturale non può avere in un’abilità più gradi dei suoi Dadi Vita.'));
  X.push(H.voce('Talenti:', 'Il numero totale di talenti posseduti dal compagno naturale, scelti tra quelli che è in grado fisicamente di usare. Si consiglia di dare un’occhiata ai Talenti Selvatici descritti nel Volume 3, espressamente pensati per compagni naturali e i relativi padroni.'));
  X.push(H.voce('Armatura naturale:', 'Il bonus di armatura naturale del compagno naturale, cumulabile con quello base della creatura e con quello derivante dall’avanzamento al 4° o al 7° livello, entrambi indicati nella sua descrizione.'));
  X.push(H.voce('For/Des:', 'Il bonus alla Forza e alla Destrezza del compagno naturale.'));

  X.push(H.titoloSezione('Privilegi di classe del compagno naturale', 'sez_privilegi'));
  const P = [
    ['Legame', 'Il padrone può gestire le azioni del suo compagno naturale parlandogli come un’azione gratuita. Il DM può imporre limiti alle azioni del compagno naturale come più ritiene opportuno.'],
    ['Cavalcatura', 'Il padrone può cavalcare il proprio compagno animale o parassita fintanto che quest’ultimo è di taglia superiore alla sua. I compagni vegetali non possono essere cavalcati. Quando è in sella al suo compagno naturale, il padrone non subisce penalità di armatura alle prove di Cavalcare e supera automaticamente quelle per “Guidare con le ginocchia” ed “Entrare in combattimento con cavalcatura addestrata”.'],
    ['Condividere incantesimi', 'Il padrone può lanciare qualsiasi incantesimo che abbia come bersaglio “sé stessi” sul suo compagno naturale (se è in vista), al posto di sé stesso. Può farlo anche se l’incantesimo normalmente non ha effetto su animali, parassiti o vegetali. Gli incantesimi così lanciati devono provenire dalla lista di incantesimi della classe che ha garantito il compagno naturale. Questa capacità non permette di condividere con il compagno capacità magiche.'],
    ['Bardatura', 'I compagni animali e i compagni parassiti ottengono Addestramento nelle bardature leggere come talento bonus e possono indossare le bardature (vedi Volume 3). Possono indossare anche bardature magiche ritrovate nei tesori, ma queste andranno prima riadattate al fisico della creatura, spendendo 1/10 del valore totale della bardatura (compreso quello dei potenziamenti e delle capacità speciali) e 8 ore di lavoro nella relativa Professione. I compagni vegetali compensano la mancanza di bardatura con una CA naturale leggermente più alta e tratti razziali vantaggiosi.'],
    ['Eludere', 'Il compagno naturale ottiene eludere (vedi privilegi di classe del ladro).'],
    ['Possibile avanzamento', 'Al 4° o al 7° livello il compagno naturale ottiene l’avanzamento indicato nella sua descrizione. Anziché ottenere i benefici dell’avanzamento, il compagno naturale può ottenere +2 Destrezza e +2 Costituzione. Quando un compagno naturale cambia di taglia in seguito all’avanzamento o a un altro effetto, applica i modificatori della tabella seguente (vedi Volume 1).'],
  ];
  for (const [t, c] of P) { X.push(H.titoloPrivilegio(t)); X.push(H.corpo(c, { keepNext: t === 'Possibile avanzamento' })); }
  X.push(H.tabella(['Taglia', 'Tiri e CA', 'Furtività', 'Volare', 'BMC e DMC', 'Spazio / Portata (alta)', 'Spazio / Portata (lunga)'],
    TAGLIE, [1500, 1000, 1000, 1000, 1100, 2303, 2303], { grassettoPrima: true }));
  X.push(H.vuoto(60));
  const P2 = [
    ['Devozione', 'Il compagno naturale riceve bonus morale +4 ai Tiri Salvezza contro incantesimi ed effetti di [ammaliamento: charme e compulsione].'],
    ['Aumento di caratteristica', 'Il compagno naturale aggiunge +1 a un punteggio di caratteristica a scelta.'],
    ['Multiattacco', 'Il compagno naturale ottiene Multiattacco come talento bonus. Se il compagno non soddisfa il requisito di tre o più attacchi naturali, ottiene un secondo attacco naturale primario effettuato con penalità -5.'],
    ['Eludere migliorato', 'Il compagno naturale ottiene la dote da ladro avanzata Eludere migliorato.'],
  ];
  for (const [t, c] of P2) { X.push(H.titoloPrivilegio(t)); X.push(H.corpo(c)); }

  // --- Chi ottiene un compagno naturale (nuovo) ---
  X.push(H.titoloCapitolo('Chi ottiene un compagno naturale', 'cap_fonti'));
  X.push(H.corpo('Le classi e gli archetipi seguenti forniscono un compagno naturale o una cavalcatura speciale. Tutti funzionano come l’opzione Compagno naturale di legame con la natura del druido, con il livello effettivo e le restrizioni di tipo indicati; le altre capacità della cavalcatura (resistenze, talenti bonus, eccezioni) sono descritte nella classe o nell’archetipo (vedi Volume 2).', { after: 120 }));
  X.push(H.tabella(['Classe o archetipo', 'Dal', 'Livello effettivo', 'Compagni ammessi'],
    FONTI, [3700, 700, 2906, 2900], { size: 17, allinea: { 0: AlignmentType.LEFT, 2: AlignmentType.LEFT, 3: AlignmentType.LEFT } }));
  X.push(H.vuoto(100));
  X.push(H.titoloPrivilegio('Più fonti'));
  X.push(H.corpo('Se un personaggio ottiene un compagno naturale o una cavalcatura speciale da più fonti (ad esempio un multiclasse), i livelli effettivi forniti da ciascuna fonte si cumulano al fine di determinarne statistiche e capacità. Il compagno deve rispettare le restrizioni di tipo di tutte le fonti.'));
  X.push(H.titoloPrivilegio('Cavalcatura d’ordinanza'));
  X.push(H.corpo('Alcuni archetipi forniscono ai livelli più bassi una cavalcatura d’ordinanza (cammello, cane, cavallo, delfino o pony) in attesa della cavalcatura speciale. La cavalcatura d’ordinanza usa le statistiche di un compagno naturale di 1° livello, ma non ottiene legame né condividere incantesimi.'));
  X.push(H.titoloPrivilegio('Talenti che aumentano il livello effettivo'));
  X.push(H.corpo('Gli effetti del talento Ottimo Compagno e del talento selvatico Legame speciale non si cumulano tra loro.'));

  // --- Ritrovamento ---
  X.push(H.titoloCapitolo('Procurarsi un compagno naturale', 'cap_ritrovamento'));
  X.push(H.titoloSezione('Morte del compagno e procurarsene uno nuovo'));
  X.push(H.corpo('Se il compagno naturale muore o viene liberato dal suo servizio, il personaggio può ottenerne uno nuovo seguendo le regole seguenti:'));
  for (const t of ['Si deve trascorrere un’intera giornata di ricerca nell’ambiente in cui il compagno naturale vive (indicato nella sua descrizione) o presso le bancarelle di un mercato, di una fiera, di un serraglio o di un negozio specialistico.',
    'Indipendentemente se li si cerca in natura o negli insediamenti, è possibile ricercare i compagni naturali una sola volta a settimana.',
    'Indipendentemente se lo si cerca in natura o negli insediamenti, è possibile cercare il medesimo compagno una sola volta al mese.']) X.push(H.speciale(t));
  X.push(H.titoloSezione('Habitat'));
  X.push(H.corpo('Ogni creatura può essere trovata in natura in uno o più ambienti specifici e caratterizzati da un clima ben definito, come indicato nell’elenco seguente:'));
  X.push(H.voce('Caldo:', 'deserti, savane, zone tropicali, ambienti vulcanici o magmatici, acque molto calde e zone generiche con una temperatura di 40° o più.', { after: 30 }));
  X.push(H.voce('Freddo:', 'zone innevate, zone ghiacciate e zone generiche con una temperatura inferiore agli 0°.', { after: 30 }));
  X.push(H.voce('Temperato:', 'zone con una temperatura mite intorno ai 20°.'));
  X.push(H.titoloSezione('Ritrovamento'));
  X.push(H.corpo('La probabilità che il personaggio ha di trovare uno specifico compagno varia in base alla sua rarità, come mostrato nella tabella seguente. Il colore del nome di ogni creatura ne indica la rarità.', { keepNext: true }));
  X.push(H.tabella(['Rarità', 'Probabilità in natura', 'Probabilità in un insediamento', 'Costo'],
    [[raritaRun('comune'), '75%', '95%', '25 mo per Dado Vita'], [raritaRun('non comune'), '50%', '75%', '50 mo per Dado Vita'], [raritaRun('raro'), '15%', '25%', '100 mo per Dado Vita']],
    [2200, 2300, 2900, 2806]));
  X.push(H.vuoto(100));
  X.push(H.corpo('In base alla grandezza dell’insediamento, tramite la stessa ricerca è possibile informarsi riguardo la disponibilità di un numero variabile di compagni, come mostrato nella tabella seguente. Una volta determinati quali compagni sono disponibili tra quelli ricercati, si può procedere all’acquisto di un singolo esemplare. I compagni naturali presenti in un insediamento sono esemplari catturati in tutte le parti del mondo, magari in transito poiché destinati a fiere più grandi e importanti: pertanto, gli esemplari presenti nei mercati non devono rispettare l’ambiente in cui il compagno naturale solitamente vive (verosimilmente in una fiera nel deserto è possibile trovare un orso polare che sta viaggiando verso nord, in direzione di una capitale lontana).', { keepNext: true }));
  X.push(H.tabella(['Insediamento', 'Numero e tipo di compagni ricercabili'], [
    ['Piccolo insediamento', 'Uno comune'], ['Borgo', 'Due comuni'], ['Villaggio', 'Due comuni e uno non comune'],
    ['Piccolo paese', 'Tre comuni e uno non comune'], ['Grande paese', 'Quattro comuni e due non comuni'],
    ['Piccola città', 'Quattro comuni e tre non comuni'], ['Grande città', 'Quattro comuni, tre non comuni e uno raro'],
    ['Capitale o metropoli', 'Quattro comuni, tre non comuni e due rari']], [3400, 6806], { allinea: { 0: AlignmentType.LEFT, 1: AlignmentType.LEFT } }));
  X.push(H.vuoto(60));
  X.push(H.corpo('Il costo di uno specifico compagno dipende dalla sua rarità e dai suoi Dadi Vita. La rarità rappresenta la difficoltà nel trovare la creatura nel suo habitat, nel catturarla, nel trasportarla o una commistione di tutte queste cose.'));

  X.push(H.titoloCapitolo('Riassunto dei compagni per tipo', 'cap_riassunto'));
  X.push(H.corpo('I compagni naturali che non appartengono ad alcun tipo non sono mostrati in questo elenco.', { italics: true, after: 160 }));
  X.push(...riassunto(bestiario));
  return X;
}

module.exports = { bloccoA };
