# Compagni e Cavalcature

App della Collana per i compagni naturali e le cavalcature speciali: fonti di classe e d'archetipo cumulabili (Vol. 2), Bestiario dei compagni naturali con ricerca e acquisto, scheda calcolata del compagno (PF divisi in Fatica e Ferita, CA, TS, attacchi, abilità, talenti selvatici), modificatori temporanei e permanenti con cambio di taglia, gestione in gioco (danni, cure, Rifiatare).

## Scaricare l'app
Nella pagina **Releases** del repository:
- **Android**: il file `Compagni-N.apk` (release `v1.0.N`). Scaricalo dal telefono e aprilo per installarlo.
- **Windows**: release `win-1.0.N`, versione *portatile* (doppio clic, niente installazione) o *installazione*.

Le app si ricompilano da sole a ogni aggiornamento del ramo `main`.

## Come si aggiorna quando cambiano i manuali
1. Bestiario: `python3 sorgenti/parse_bestiario.py` (dal PDF in `sorgenti/pdf/`; le correzioni ai dati vanno in `sorgenti/correzioni.json`) → `sorgenti/bestiario.json`
2. Talenti selvatici: `python3 sorgenti/parse_talenti.py` (dal testo del Vol. 3 in `sorgenti/txt/`) → `sorgenti/talenti.json`
3. Fonti di classe: `sorgenti/fonti.json`, scritto a mano dal Vol. 2
4. `python3 sorgenti/build.py` → `www/index.html`

Il Bestiario in .docx si genera dagli stessi dati: vedi `sorgenti/docx_bestiario/LEGGIMI.md`.
Icone e splash: `python3 sorgenti/icona/genera_icone.py`.

## Decisioni di design
Vedi `Compagni_app_design_v1.md`.
