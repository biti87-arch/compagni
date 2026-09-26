// Blocco B — schede delle creature, generate da bestiario.json.
const { TextRun, AlignmentType, Bookmark } = require('docx');
const H = require('./helpers');
const { C } = H;

const NOMI_CAR = { For: 'Forza', Des: 'Destrezza', Cos: 'Costituzione', Int: 'Int', Sag: 'Sag', Car: 'Car' };
const num = n => String(n).replace('.', ',');

function velocita(v) {
  if (!v || !Object.keys(v).length) return null;
  const altri = ['scalare', 'nuotare', 'scavare', 'volare', 'propulsione'].filter(k => v[k] != null)
    .map(k => k[0].toUpperCase() + k.slice(1) + ' ' + num(v[k]) + ' m' + (k === 'volare' && v.manovrabilita ? ' (' + v.manovrabilita + ')' : ''));
  if (v.terra != null) return ['Velocità ' + num(v.terra) + ' m'].concat(altri).join(', ');
  return 'Velocità di ' + altri.join(', ');
}

function statistiche(s, avanz) {
  const p = [];
  if (s.taglia) p.push('Taglia ' + s.taglia);
  if (!avanz) { const v = velocita(s.velocita); if (v) p.push(v); }
  if (s.ca_nat) p.push((s.ca_nat > 0 ? '+' : '') + s.ca_nat + ' CA naturale');
  if (avanz) {
    if (s.mod_car && Object.keys(s.mod_car).length)
      p.push(Object.entries(s.mod_car).map(([k, v]) => (v > 0 ? '+' : '') + v + ' ' + ({ For: 'Forza', Des: 'Destrezza', Cos: 'Costituzione', Int: 'Intelligenza', Sag: 'Saggezza', Car: 'Carisma' })[k]).join(', '));
    const v = velocita(s.velocita); if (v) p.push(v);
  }
  for (const a of s.altro || []) p.push(a);
  if (s.attacchi_testo) p.push('Attacco: ' + s.attacchi_testo);
  return p.join('; ') + '.';
}

function scheda(b, primo) {
  const out = [];
  const colore = C.rarita[b.rarita];
  const nome = [new TextRun({ text: b.nome, font: 'Georgia', size: 26, bold: true, color: colore })];
  const coda = [];
  if (b.tipi.length) coda.push(new TextRun({ text: ' (' + b.tipi.join(', ') + ')', font: 'Times New Roman', size: 20, bold: true }));
  if (b.esclusivo) coda.push(new TextRun({ text: ' — solo ' + b.esclusivo, font: 'Times New Roman', size: 20, italics: true }));
  out.push(H.par([new Bookmark({ id: 'cr_' + b.id, children: nome })].concat(coda), { before: primo ? 0 : 220, after: 30, keepNext: true }));
  const righe = [
    ['Habitat:', b.habitat + '.'],
    ['Statistiche iniziali:', statistiche(b, false)],
  ];
  if (b.sensi) righe.push(['Sensi:', b.sensi + '.']);
  righe.push(['Caratteristiche:', Object.keys(NOMI_CAR).map(k => NOMI_CAR[k] + ' ' + (b.car[k] ?? '—')).join(', ') + '.']);
  for (const [e, t] of righe) out.push(H.voce(e, t, { after: 10, keepNext: true }));
  if (b.speciali.length) {
    out.push(H.par([new TextRun({ text: 'Capacità e attacchi speciali', font: 'Times New Roman', size: H.CORPO, bold: true })], { before: 40, after: 10, keepNext: true }));
    b.speciali.forEach(s => out.push(H.speciale(s, { keepNext: true })));
  }
  const av = b.avanzamento || {};
  if (av.livello) {
    out.push(H.par([new TextRun({ text: 'Avanzamento al ' + av.livello + '° livello: ', font: 'Times New Roman', size: H.CORPO, bold: true })]
      .concat(H.runs(statistiche(av, true))), { before: 60, after: 10, align: AlignmentType.JUSTIFY, keepNext: av.speciali && av.speciali.length > 0 }));
    (av.speciali || []).forEach((s, i) => out.push(H.speciale(s, { keepNext: i < av.speciali.length - 1 })));
  }
  return out;
}

const SEZIONI = [
  ['animale', 'Elenco dei compagni animali', 'cap_animali'],
  ['parassita', 'Elenco dei compagni parassiti', 'cap_parassiti'],
  ['vegetale', 'Elenco dei compagni vegetali', 'cap_vegetali'],
];

function bloccoB(bestiario, soloCategorie, o = {}) {
  const X = [];
  for (const [cat, titolo, id] of SEZIONI) {
    if (soloCategorie && !soloCategorie.includes(cat)) continue;
    X.push(H.titoloCapitolo(titolo, id, { pageBreakBefore: X.length > 0 || !o.inizioDocumento }));
    bestiario.filter(b => b.categoria === cat).forEach((b, i) => X.push(...scheda(b, i === 0)));
  }
  return X;
}

module.exports = { bloccoB, SEZIONI, statistiche };
