"""Estrae le schede del Bestiario dei compagni naturali in sorgenti/bestiario.json.

Uso: python3 sorgenti/parse_bestiario.py [percorso_pdf]
Il PDF è la fonte finché il Bestiario non diventa un .docx: la rarità si legge
dal colore del nome (verde = comune, blu = non comune, arancio = raro).
Gli errori noti del manuale si correggono in correzioni.json, non nel codice."""
import json, os, re, sys
import pymupdf

R = os.path.dirname(os.path.abspath(__file__))
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'pdf', 'Bestiario_compagni_naturali.pdf')

RARITA = {0x00B050: 'comune', 0x0070C0: 'non comune', 0xC45911: 'raro'}
TIPI = {'acquatico', 'aracnide', 'canide', 'cervide', 'dinosauro', 'domestico', 'felino',
        'fungo', 'lucertoloide', 'pesce', 'primate', 'serpente', 'suino', 'urside'}
SEZIONI = {'Elenco dei compagni animali': 'animale', 'Elenco dei compagni parassiti': 'parassita',
           'Elenco dei compagni vegetali': 'vegetale'}
TAGLIE = ['piccolissima', 'minuta', 'minuscola', 'piccola', 'media', 'grande', 'enorme', 'mastodontica', 'colossale']
CAR = [('For', 'Forza'), ('Des', 'Destrezza'), ('Cos', 'Costituzione'), ('Int', 'Int(?:elligenza)?'), ('Sag', 'Sag(?:gezza)?'), ('Car', 'Car(?:isma)?')]


def righe(pdf):
    """Righe del PDF in ordine di lettura: (testo, dimensione, colore, grassetto_iniziale)."""
    out = []
    for pag in pymupdf.open(pdf):
        for b in pag.get_text('dict')['blocks']:
            for l in b.get('lines', []):
                sp = [s for s in l['spans']]
                txt = ''.join(s['text'] for s in sp).strip()
                if not txt:
                    continue
                s0 = next(s for s in sp if s['text'].strip())
                out.append((txt, round(s0['size'], 1), s0['color'], 'Bold' in s0['font']))
    return out


def dividi(s, sep=';'):
    """Divide sul separatore ignorando quelli dentro le parentesi e le virgole decimali (4,5 m)."""
    parti, prof, cur = [], 0, ''
    for i, c in enumerate(s):
        prof += (c == '(') - (c == ')')
        decimale = sep == ',' and i > 0 and s[i - 1].isdigit() and s[i + 1:i + 2].isdigit()
        if c == sep and prof == 0 and not decimale:
            parti.append(cur.strip()); cur = ''
        else:
            cur += c
    if cur.strip():
        parti.append(cur.strip())
    return parti


def attacchi(s):
    """'Morso (1d6), 2 Artigli (1d4, attacco secondario) o Coda (1d8)' → lista di alternative."""
    s = s.strip().rstrip('.')
    alternative = []
    for alt in re.split(r'\)\s+o\s+', s):
        if not alt.endswith(')'):
            alt += ')'
        gruppo = []
        for a in dividi(alt, ','):
            m = re.match(r'^(?:(\d+)\s+)?([^()]+?)\s*\((.*)\)$', a.strip())
            if not m:
                gruppo.append({'testo': a.strip()}); continue
            n, nome, dentro = m.groups()
            pezzi = dividi(dentro, ',')
            danno, extra = pezzi[0], pezzi[1:]
            secondario = any('secondari' in e for e in extra)
            extra = [e for e in extra if 'secondari' not in e]
            dm = re.match(r'^(\d+d\d+(?:\s*\+\s*\d+d\d+)?)(.*)$', danno.strip())
            dado, resto = (dm.group(1).replace(' ', ''), dm.group(2).strip()) if dm else (None, danno.strip())
            if resto.startswith('più '):
                extra = [resto[4:]] + extra; resto = ''
            gruppo.append({'n': int(n or 1), 'nome': nome.strip(), 'dado': dado, 'nota': resto or None,
                           'extra': ', '.join(extra) or None, 'secondario': secondario})
        alternative.append(gruppo)
    return alternative


def velocita(parti):
    v = {}
    for p in parti:
        for m in re.finditer(r'(Velocità di |Velocità |)(Nuotare|Scalare|Scavare|Volare|Propulsione|)\s*(\d+(?:,\d+)?) m(?: \((\w+)\))?', p):
            tipo = (m.group(2) or 'terra').lower()
            v[tipo] = float(m.group(3).replace(',', '.'))
            if m.group(4):
                v['manovrabilita'] = m.group(4)
    return v


def statistiche(testo, avanzamento=False):
    d = {}
    testo = re.sub(r',\s*Attacco:', '; Attacco:', testo)
    testo = re.sub(r'(\d m)\.\s+(?=\S)', r'\1; ', testo)
    for p in dividi(testo.rstrip('.')):
        pl = p.lower()
        if pl.startswith('taglia'):
            d['taglia'] = pl.split()[1]
        elif re.search(r'\bCA\b', p) and 'natural' in pl:
            d['ca_nat'] = int(re.search(r'([+-]\d+)', p).group(1))
        elif pl.startswith('attacco') or re.match(r'^(\d+ )?[A-Za-zÀ-ú ]+\(\d+d\d+', p):
            d['attacchi_testo'] = re.sub(r'^Attacco:?\s*', '', p, flags=re.I).strip()
            d['attacchi'] = attacchi(d['attacchi_testo'])
        elif 'velocità' in pl or re.match(r'^(nuotare|scalare|volare|scavare)', pl):
            d.setdefault('vel_testo', []).append(p)
        elif avanzamento and re.search(r'(Forza|Destrezza|Costituzione|Saggezza|Intelligenza|Carisma)', p):
            mod = {}
            for m in re.finditer(r'([+-]\d+)\s+(Forza|Destrezza|Costituzione|Saggezza|Intelligenza|Carisma)|(Forza|Destrezza|Costituzione|Saggezza|Intelligenza|Carisma)\s*([+-]\d+)', p):
                val = int(m.group(1) or m.group(4)); nome = m.group(2) or m.group(3)
                mod[{'Forza': 'For', 'Destrezza': 'Des', 'Costituzione': 'Cos', 'Saggezza': 'Sag',
                     'Intelligenza': 'Int', 'Carisma': 'Car'}[nome]] = val
            d['mod_car'] = mod
        else:
            d.setdefault('altro', []).append(p)
    if 'vel_testo' in d:
        d['velocita'] = velocita(d.pop('vel_testo'))
    return d


def main():
    L = righe(PDF)
    schede, sezione, cur = [], None, None
    for txt, size, col, bold in L:
        if txt in SEZIONI:
            sezione = SEZIONI[txt]; continue
        if sezione is None:
            continue
        if size >= 13.5 and col in RARITA:
            cur = {'titolo': txt, 'rarita': RARITA[col], 'categoria': sezione, 'righe': []}
            schede.append(cur); continue
        if cur is not None:
            cur['righe'].append(txt)

    out = []
    for s in schede:
        titolo = re.sub(r'\s+', ' ', s['titolo']).strip()
        gruppi = re.findall(r'\(([^()]*)\)', titolo)
        tipi, esclusivo = [], None
        for g in gruppi:
            parole = [x.strip() for x in g.split(',')]
            if g.startswith('solo '):
                esclusivo = g[5:]
                titolo = titolo.replace('(' + g + ')', '')
            elif all(p in TIPI for p in parole):
                tipi = parole
                titolo = titolo.replace('(' + g + ')', '')
        nome = re.sub(r'\s+', ' ', titolo).strip()
        # ricompone le righe: campi, voci con asterisco e continuazioni
        campi, speciali_base, speciali_av, fase, ultimo = {}, [], [], 'base', None
        for r in s['righe']:
            m = re.match(r'^(Habitat|Statistiche iniziali|Sensi|Caratteristiche|Avanzamento al (\d+)° livello)\s*:\s*(.*)$', r)
            if m:
                chiave = 'avanzamento' if m.group(1).startswith('Avanzamento') else m.group(1)
                if m.group(2):
                    campi['livello_avanzamento'] = int(m.group(2)); fase = 'avanzamento'
                campi[chiave] = m.group(3); ultimo = ('campo', chiave); continue
            if r.startswith('Capacità e attacchi spe'):
                ultimo = None; continue
            if r.startswith('*'):
                lista = speciali_av if fase == 'avanzamento' else speciali_base
                lista.append(r[1:].strip()); ultimo = ('spec', lista); continue
            if ultimo and ultimo[0] == 'campo':
                campi[ultimo[1]] += ' ' + r
            elif ultimo and ultimo[0] == 'spec':
                ultimo[1][-1] += ' ' + r
        base = statistiche(campi.get('Statistiche iniziali', ''))
        car = {}
        for k, lab in CAR:
            m = re.search(lab + r'\s+(\d+|—|-)', campi.get('Caratteristiche', ''))
            car[k] = int(m.group(1)) if m and m.group(1).isdigit() else None
        av = statistiche(campi.get('avanzamento', ''), avanzamento=True)
        av['livello'] = campi.get('livello_avanzamento')
        av['speciali'] = speciali_av
        out.append({
            'nome': nome, 'categoria': s['categoria'], 'tipi': tipi, 'rarita': s['rarita'],
            'esclusivo': esclusivo,
            'habitat': campi.get('Habitat', '').strip().rstrip('.'),
            'taglia': base.get('taglia'), 'velocita': base.get('velocita', {}),
            'ca_nat': base.get('ca_nat', 0),
            'attacchi_testo': base.get('attacchi_testo'), 'attacchi': base.get('attacchi', []),
            'altro': base.get('altro', []),
            'sensi': campi.get('Sensi', '').strip().rstrip('.'),
            'car': car, 'speciali': speciali_base, 'avanzamento': av,
        })

    corr = os.path.join(R, 'correzioni.json')
    if os.path.exists(corr):
        C = json.load(open(corr, encoding='utf8'))
        for voce in out:
            for k, v in C.get(voce['nome'], {}).items():
                if isinstance(v, dict) and isinstance(voce.get(k), dict):
                    voce[k].update(v)
                else:
                    voce[k] = v
        for nuova in C.get('__nuove__', []):
            out.append(nuova)
    json.dump(out, open(os.path.join(R, 'bestiario.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('schede:', len(out))


if __name__ == '__main__':
    main()
