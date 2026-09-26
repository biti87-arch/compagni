"""Estrae i Talenti Selvatici (più Addestratore e Richiamo naturale) dal testo del Vol. 3.
Uso: python3 sorgenti/parse_talenti.py  →  sorgenti/talenti.json"""
import json, os, re
R = os.path.dirname(os.path.abspath(__file__))
L = [l.strip() for l in open(os.path.join(R, 'txt', 'Vol3_Miscellanea_2.5.1.txt'), encoding='utf8') if l.strip()]

def slug(s):
    import unicodedata
    s = unicodedata.normalize('NFD', s.lower())
    return re.sub(r'[^a-z0-9]+', '_', ''.join(c for c in s if not unicodedata.combining(c))).strip('_')

def blocco(inizio, fine):
    out, cur = [], None
    for i in range(inizio, fine):
        l = L[i]
        nxt = L[i + 1] if i + 1 < fine else ''
        # un titolo di talento è una riga corta seguita dalla frase descrittiva
        if cur is None or (len(l) < 45 and not l.endswith('.') and not l.startswith(('Requisiti', 'Speciale', 'Normale', 'Nota'))):
            if cur: out.append(cur)
            cur = {'id': slug(l), 'nome': l, 'descrizione': '', 'requisiti': '', 'testo': [], 'speciale': ''}
            continue
        if not cur['descrizione'] and not l.startswith('Requisiti'):
            cur['descrizione'] = l; continue
        if l.startswith('Requisiti:'):
            cur['requisiti'] = l.split(':', 1)[1].strip(); continue
        if l.startswith('Speciale:'):
            cur['speciale'] = l.split(':', 1)[1].strip(); continue
        cur['testo'].append(l)
    if cur: out.append(cur)
    for t in out: t['testo'] = ' '.join(t['testo'])
    return out

i0 = L.index('Talenti Selvatici') + 2           # salta il titolo e la frase introduttiva
i1 = L.index('Talenti del Sigillatore')
selvatici = blocco(i0, i1)
padrone = []
for nome in ['Addestratore', 'Richiamo naturale']:
    i = L.index(nome)
    padrone += blocco(i, i + 5)[:1]
json.dump({'selvatici': selvatici, 'padrone': padrone}, open(os.path.join(R, 'talenti.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print(len(selvatici), [t['nome'] for t in selvatici])
print([ (t['nome'], t['requisiti'][:40]) for t in padrone])
