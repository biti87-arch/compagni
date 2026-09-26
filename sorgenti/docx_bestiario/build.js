// Genera il Bestiario dei compagni naturali in .docx.
// Uso: export NODE_PATH=$(npm root -g); node build.js <uscita.docx> [A|B|tutto] [pagine.json]
//   A     = solo regole (anteprima del blocco A)
//   B     = solo schede (anteprima del blocco B)
//   tutto = copertina + sommario + contenuto numerato (default)
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, AlignmentType, Footer, PageNumber } = require('docx');
const H = require('./helpers');
const { bloccoA } = require('./blocco_A');
const { bloccoB, SEZIONI } = require('./blocco_B');

const [, , uscita = 'Bestiario.docx', modo = 'tutto', filePagine] = process.argv;
const bestiario = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'bestiario.json'), 'utf8'));
const pagine = filePagine && fs.existsSync(filePagine) ? JSON.parse(fs.readFileSync(filePagine, 'utf8')) : {};
const VERSIONE = 'Edizione v2.5';

const STRUTTURA = [
  ['Compagni naturali', 'cap_regole', [['Tabella del compagno naturale', 'sez_tabella'], ['Privilegi di classe del compagno naturale', 'sez_privilegi']]],
  ['Chi ottiene un compagno naturale', 'cap_fonti', []],
  ['Procurarsi un compagno naturale', 'cap_ritrovamento', []],
  ['Riassunto dei compagni per tipo', 'cap_riassunto', []],
].concat(SEZIONI.map(([cat, t, id]) => [t, id, []]));

function copertina() {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 4200, after: 200 },
      children: [new TextRun({ text: 'Bestiario dei', font: 'Georgia', size: 60, bold: true, color: H.C.titolo })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 300 },
      children: [new TextRun({ text: 'compagni naturali', font: 'Georgia', size: 60, bold: true, color: H.C.titolo })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [new TextRun({ text: 'Animali, parassiti e vegetali al fianco dei loro padroni', font: 'Georgia', size: 30, italics: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [new TextRun({ text: VERSIONE, font: 'Times New Roman', size: 24 })] }),
  ];
}

function sommario() {
  const X = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
    children: [new TextRun({ text: 'Sommario', font: 'Georgia', size: 36, bold: true, color: H.C.titolo })] })];
  for (const [t, id, sub] of STRUTTURA) {
    X.push(H.rigaSommario(t, id, pagine[id]));
    for (const [st, sid] of sub) X.push(H.rigaSommario(st, sid, pagine[sid], 1));
  }
  return X;
}

const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 18 })] })] });
const vuotoFooter = new Footer({ children: [new Paragraph({ children: [] })] });
const prop = (extra = {}) => ({ page: { ...H.PAGINA, ...extra } });

let sections;
if (modo === 'A') sections = [{ properties: prop(), footers: { default: footer }, children: bloccoA(bestiario) }];
else if (modo === 'B') sections = [{ properties: prop(), footers: { default: footer }, children: bloccoB(bestiario, null, { inizioDocumento: true }) }];
else sections = [
  { properties: prop(), footers: { default: vuotoFooter }, children: copertina() },
  { properties: prop(), footers: { default: vuotoFooter }, children: sommario() },
  { properties: prop({ pageNumbers: { start: 1 } }), footers: { default: footer },
    children: bloccoA(bestiario).concat(bloccoB(bestiario)) },
];

const doc = new Document({
  creator: 'Collana', title: 'Bestiario dei compagni naturali',
  styles: { default: { document: { run: { font: 'Times New Roman', size: H.CORPO } } } },
  sections,
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(uscita, b); console.log('ok', uscita, modo); });
module.exports = { STRUTTURA };
