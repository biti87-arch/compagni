// Helper di formattazione per il Bestiario dei compagni naturali (stile Collana).
// docx@9.6.1 — ricordare: export NODE_PATH=$(npm root -g) prima di node.
const {
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType,
  BorderStyle, Bookmark, InternalHyperlink, TabStopType, LeaderType, VerticalAlign,
} = require('docx');

const C = {
  titolo: 'C45911', nero: '000000', condizione: 'C00000',
  oroBordo: '8B6914', oroIntest: 'D4A84B', riga1: 'F5EDD0', riga2: 'FAF3E0',
  vantaggio: '1E7A1E',
  rarita: { 'comune': '00B050', 'non comune': '0070C0', 'raro': 'C45911' },
};
const LARGH = 10206; // larghezza utile in DXA
const PAGINA = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1134, bottom: 1134, left: 850, right: 850 },
};
const CORPO = 20;  // 10 pt (half-point)

// ---- condizioni di stato (regex case-insensitive, con flessioni) ----
const radici = [
  ['azzoppat', 'oaie'], ['offuscat', 'oaie'], ['affaticat', 'oaie'], ['abbagliat', 'oaie'],
  ['accecat', 'oaie'], ['accovacciat', 'oaie'], ['affascinat', 'oaie'], ['assordat', 'oaie'],
  ['barcollant', 'ei'], ['confus', 'oaie'], ['esaust', 'oaie'], ['frastornat', 'oaie'],
  ['immobilizzat', 'oaie'], ['impreparat', 'oaie'], ['inabil', 'ei'], ['incorpore', 'oaie'],
  ['indifes', 'oaie'], ['inferm', 'oaie'], ['intralciat', 'oaie'], ['invisibil', 'ei'],
  ['morent', 'ei'], ['nauseat', 'oaie'], ['paralizzat', 'oaie'], ['scoss', 'oaie'],
  ['spaventat', 'oaie'], ['pietrificat', 'oaie'], ['pron', 'oaie'], ['rott', 'oaie'],
  ['sanguinant', 'ei'], ['scheggiat', 'oaie'], ['stabilizzat', 'oaie'], ['stordit', 'oaie'],
];
const fisse = ['colt[oaie] alla sprovvista', 'sempre pront[oaie]', 'in lotta', 'in preda al panico',
  'priv[oaie] di sensi', 'mort[oai]'];
const COND_RE = new RegExp('(?<![\\p{L}])(' + fisse.concat(radici.map(([r, f]) => r + '[' + f + ']')).join('|') + ')(?![\\p{L}])', 'giu');

// Dopo "effetto di"/"effetti di" i tag tra parentesi quadre vanno in MAIUSCOLO, anche concatenati.
function tagMaiuscoli(t) {
  return t.replace(/(effett[oi] di\s+)(\[[^\]]+\](?:(?:,\s*|\s+[eo]\s+(?:di\s+)?)\[[^\]]+\])*)/giu,
    (m, a, b) => a + b.replace(/\[[^\]]+\]/g, x => x.toUpperCase()));
}

// Trasforma un testo in run: condizioni in rosso, tag in grassetto.
function runs(testo, o = {}) {
  const base = { font: o.font || 'Times New Roman', size: o.size || CORPO, bold: o.bold, italics: o.italics, color: o.color || C.nero };
  const t = tagMaiuscoli(testo);
  const out = [];
  const re = new RegExp(COND_RE.source + '|(\\[[^\\]]+\\])', 'giu');
  let i = 0, m;
  while ((m = re.exec(t))) {
    if (m.index > i) out.push(new TextRun({ ...base, text: t.slice(i, m.index) }));
    if (m[1]) out.push(new TextRun({ ...base, text: m[0], color: C.condizione }));
    else out.push(new TextRun({ ...base, text: m[0], bold: true }));
    i = m.index + m[0].length;
  }
  if (i < t.length) out.push(new TextRun({ ...base, text: t.slice(i) }));
  return out;
}

function par(children, o = {}) {
  return new Paragraph({
    children, alignment: o.align, keepNext: o.keepNext, keepLines: true,
    pageBreakBefore: o.pageBreakBefore,
    spacing: { before: o.before ?? 0, after: o.after ?? 40, line: o.line },
    indent: o.indent,
  });
}

// Titolo di capitolo (con segnalibro per il sommario)
function titoloCapitolo(testo, id, o = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER, pageBreakBefore: o.pageBreakBefore !== false, keepNext: true,
    spacing: { before: 0, after: 240 },
    children: [new Bookmark({ id, children: [new TextRun({ text: testo, font: 'Georgia', size: 36, bold: true, color: C.titolo })] })],
  });
}

function titoloSezione(testo, id) {
  const tr = new TextRun({ text: testo, font: 'Georgia', size: 26, bold: true, color: C.titolo });
  return new Paragraph({ keepNext: true, spacing: { before: 220, after: 80 },
    children: [id ? new Bookmark({ id, children: [tr] }) : tr] });
}

// Voce di regola: "Etichetta: testo" (etichetta in grassetto)
function voce(etichetta, testo, o = {}) {
  const ch = [new TextRun({ text: etichetta + (o.aCapo ? '' : ' '), font: 'Times New Roman', size: CORPO, bold: true })];
  return par(ch.concat(runs(testo)), { align: AlignmentType.JUSTIFY, after: o.after ?? 80, keepNext: o.keepNext });
}

function titoloPrivilegio(testo) {
  return par([new TextRun({ text: testo, font: 'Times New Roman', size: 22, bold: true })], { before: 120, after: 30, keepNext: true });
}

function corpo(testo, o = {}) {
  return par(runs(testo, o), { align: AlignmentType.JUSTIFY, after: o.after ?? 80, keepNext: o.keepNext });
}

// "* Nome: testo" → punto elenco con nome in corsivo e rientro sporgente
function speciale(testo, o = {}) {
  const m = testo.match(/^([^:.\[\]]{2,60}):\s*(.*)$/);
  const ch = [new TextRun({ text: '* ', font: 'Times New Roman', size: CORPO })];
  if (m) {
    ch.push(new TextRun({ text: m[1] + ':', font: 'Times New Roman', size: CORPO, italics: true }));
    ch.push(...runs(' ' + m[2]));
  } else ch.push(...runs(testo));
  return par(ch, { align: AlignmentType.JUSTIFY, after: 20, indent: { left: 180, hanging: 180 }, keepNext: o.keepNext });
}

// ---- tabelle in stile Collana ----
const bordo = { style: BorderStyle.SINGLE, size: 6, color: C.oroBordo };
const bordi = { top: bordo, bottom: bordo, left: bordo, right: bordo, insideHorizontal: bordo, insideVertical: bordo };

function cella(contenuto, larg, o = {}) {
  const children = Array.isArray(contenuto) ? contenuto : runs(String(contenuto), { size: o.size || 18, bold: o.bold, color: o.color });
  return new TableCell({
    width: { size: larg, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: { top: 30, bottom: 30, left: 60, right: 60 },
    children: [new Paragraph({ alignment: o.align ?? AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children })],
  });
}

// intest: array di stringhe; righe: array di array (stringhe o array di run); larghezze in DXA
function tabella(intest, righe, larghezze, o = {}) {
  const tot = larghezze.reduce((a, b) => a + b, 0);
  const rows = [new TableRow({ tableHeader: true, cantSplit: true,
    children: intest.map((h, j) => cella(h, larghezze[j], { bold: true, fill: C.oroIntest, size: o.sizeIntest || 18 })) })];
  righe.forEach((r, i) => rows.push(new TableRow({ cantSplit: true,
    children: r.map((v, j) => cella(v, larghezze[j], { fill: i % 2 ? C.riga2 : C.riga1, size: o.size || 18,
      align: (o.allinea && o.allinea[j]) || AlignmentType.CENTER, bold: o.grassettoPrima && j === 0 })) })));
  return new Table({ width: { size: tot, type: WidthType.DXA }, columnWidths: larghezze, borders: bordi, rows,
    alignment: AlignmentType.CENTER });
}

function vuoto(after = 0) { return new Paragraph({ spacing: { before: 0, after }, children: [] }); }

// Riga del sommario con collegamento interno e numero di pagina allineato a destra
function rigaSommario(testo, id, pagina, livello = 0) {
  return new Paragraph({
    spacing: { before: livello ? 20 : 100, after: 20 }, indent: { left: livello * 400 },
    tabStops: [{ type: TabStopType.RIGHT, position: LARGH, leader: LeaderType.DOT }],
    children: [new InternalHyperlink({ anchor: id, children: [
      new TextRun({ text: testo, font: livello ? 'Times New Roman' : 'Georgia', size: livello ? 20 : 24, bold: !livello, color: livello ? C.nero : C.titolo }),
      new TextRun({ text: '\t' + (pagina ?? '…'), font: 'Times New Roman', size: livello ? 20 : 22, bold: !livello }),
    ] })],
  });
}

module.exports = { C, LARGH, PAGINA, CORPO, runs, par, titoloCapitolo, titoloSezione, voce, titoloPrivilegio,
  corpo, speciale, tabella, cella, vuoto, rigaSommario, COND_RE, tagMaiuscoli };
