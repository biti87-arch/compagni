"""Sostituzioni di testo in un .docx preservando la formattazione dei run.
Uso: python3 sostituisci.py <entrata.docx> <uscita.docx>
Il testo cercato può essere spezzato su più run dello stesso paragrafo:
il testo nuovo va nel primo run coinvolto, i caratteri successivi si tolgono dagli altri."""
import sys, zipfile, re
from lxml import etree

W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
q = lambda t: '{%s}%s' % (W, t)

SOSTITUZIONI = [
    ('funziona (ma non conta) come', 'funziona come'),
    ('Libro dei compagni naturali', 'Bestiario dei compagni naturali'),
]

def sostituisci_par(p, da, a):
    n = 0
    while True:
        ts = [t for t in p.iter(q('t'))]
        testo = ''.join(t.text or '' for t in ts)
        i = testo.find(da)
        if i < 0:
            return n
        fine = i + len(da)
        pos = 0
        inserito = False
        for t in ts:
            s = t.text or ''
            a0, a1 = pos, pos + len(s)
            pos = a1
            if a1 <= i or a0 >= fine:
                continue
            lo, hi = max(i, a0) - a0, min(fine, a1) - a0
            if not inserito:
                t.text = s[:lo] + a + s[hi:]
                inserito = True
            else:
                t.text = s[:lo] + s[hi:]
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        n += 1

def main(src, dst):
    conteggi = {da: 0 for da, _ in SOSTITUZIONI}
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
        for it in zin.infolist():
            data = zin.read(it.filename)
            if it.filename == 'word/document.xml':
                root = etree.fromstring(data)
                for p in root.iter(q('p')):
                    for da, a in SOSTITUZIONI:
                        conteggi[da] += sostituisci_par(p, da, a)
                data = etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)
            zout.writestr(it, data)
    for da, c in conteggi.items():
        print('  %-35s %d' % (da, c))

if __name__ == '__main__':
    main(*sys.argv[1:3])
