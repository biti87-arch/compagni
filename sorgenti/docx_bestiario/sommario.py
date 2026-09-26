"""Sommario a due passaggi: legge il PDF del passaggio 1 e scrive pagine.json.
Uso: python3 sommario.py <Bestiario_tutto.pdf> <pagine.json>
Pagine del contenuto = pagina PDF - 2 (copertina e sommario non numerati)."""
import json, subprocess, sys
TITOLI = {
    'cap_regole': 'Compagni naturali', 'sez_tabella': 'Tabella del compagno naturale',
    'sez_privilegi': 'Privilegi di classe del compagno naturale', 'cap_fonti': 'Chi ottiene un compagno naturale',
    'cap_ritrovamento': 'Procurarsi un compagno naturale', 'cap_riassunto': 'Riassunto dei compagni per tipo',
    'cap_animali': 'Elenco dei compagni animali', 'cap_parassiti': 'Elenco dei compagni parassiti',
    'cap_vegetali': 'Elenco dei compagni vegetali',
}
pdf, uscita = sys.argv[1:3]
n = int([l for l in subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout.splitlines() if l.startswith('Pages')][0].split()[1])
pagine = {}
for p in range(3, n + 1):
    txt = subprocess.run(['pdftotext', '-layout', '-f', str(p), '-l', str(p), pdf, '-'], capture_output=True, text=True).stdout
    righe = {r.strip() for r in txt.splitlines()}
    for k, t in TITOLI.items():
        if k not in pagine and t in righe:
            pagine[k] = p - 2
mancanti = set(TITOLI) - set(pagine)
assert not mancanti, mancanti
json.dump(pagine, open(uscita, 'w'), indent=1)
print(pagine)
