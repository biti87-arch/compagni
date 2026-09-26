# Bestiario dei compagni naturali — sorgenti del .docx

Il manuale è generato dagli stessi dati dell'app (`sorgenti/bestiario.json`).

## Rigenerare
```bash
python3 sorgenti/parse_bestiario.py            # PDF → bestiario.json (+ correzioni.json)
D=sorgenti/docx_bestiario; OUT=/tmp/out; mkdir -p $OUT
$D/genera.sh $OUT tutto                        # passaggio 1 (sommario con segnaposto)
python3 $D/sommario.py $OUT/Bestiario_tutto.pdf $OUT/pagine.json
$D/genera.sh $OUT tutto $OUT/pagine.json       # passaggio 2 (numeri reali)
```
Anteprime dei singoli blocchi: `genera.sh $OUT A` (regole) o `genera.sh $OUT B` (schede).

## File
- `helpers.js` — stile Collana (Georgia #C45911, Times New Roman, tabelle oro, condizioni in rosso, tag in maiuscolo dopo "effetto di")
- `blocco_A.js` — regole, fonti del compagno, ritrovamento, riassunto per tipo (generato dai tipi delle schede)
- `blocco_B.js` — schede delle creature (nome colorato per rarità)
- `build.js` — copertina, sommario, contenuto numerato da 1
- `ritocchi.py` — rinumera gli id dei segnalibri (bug di docx@9.6.1)
- `sommario.py` — calcola le pagine del sommario dal PDF

## Correzioni ai dati
Vanno in `sorgenti/correzioni.json` (`__testo__` per sostituzioni di testo, oppure per nome della creatura).
Quando il .docx diventa la fonte principale, `parse_bestiario.py` andrà adattato a leggere il .docx.
