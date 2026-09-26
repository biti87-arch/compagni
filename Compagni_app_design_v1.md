# App COMPAGNI E CAVALCATURE — DESIGN DOC v1

Repo: `biti87-arch/compagni` · Piattaforme: HTML → Android (APK) → Windows · Architettura come le app Sigillatore, Necrarca e Convocatore.

## STATO LAVORO

| Fase | Stato |
|---|---|
| Analisi fonti (Bestiario, Vol. 2, Vol. 3, Vol. 1) | ✅ |
| Incongruenze 1–8 | ✅ confermate 26/09/2026 |
| Regole di calcolo A–K | ✅ confermate 26/09/2026 |
| Cumulo delle fonti + Ottimo Compagno (L–M) | ✅ confermate 26/09/2026 |
| Estrazione Bestiario in JSON (dal PDF) | ✅ prima versione: 122 schede |
| Bestiario in .docx corretto (Collana) | ✅ v2.5 generato da `bestiario.json` (36 pagine), in revisione |
| Correzioni Vol. 2 ("ma non conta") e Vol. 1 (tabella taglie) | ⬜ |
| Fonti di classe in `fonti.json` | ⬜ |
| Motore di calcolo del compagno | ⬜ |
| Interfaccia HTML (mobile-first) | ⬜ |
| Build Android + Windows | ⬜ |

## FONTI DATI

| Fonte | Contenuto | Uso nell'app |
|---|---|---|
| Bestiario dei compagni naturali (PDF, poi .docx) | Tabella del compagno 1°–20°, privilegi, ritrovamento, 122 schede (91 animali, 17 parassiti, 14 vegetali); rarità = colore del nome | `bestiario.json` |
| Vol. 2 Classi 2.5.1 | Classi e archetipi che danno compagno o cavalcatura | `fonti.json` |
| Vol. 3 Miscellanea 2.5.1 | Talenti Selvatici (27), Addestratore, Richiamo naturale, bardature | `talenti.json`, `bardature.json` |
| Vol. 1 Regole 2.5 | Punti Ferita/Fatica, Rifiatare, modificatori di taglia | costanti del motore |

I JSON si rigenerano con gli script in `sorgenti/`; le correzioni ai dati del manuale stanno in `sorgenti/correzioni.json`, non nel codice.

## FONTI DEL COMPAGNO

| Fonte | Dal | Livello effettivo | Tipi ammessi |
|---|---|---|---|
| Druido (Legame con la natura) | 1° | pieno | tutti |
| ↳ Cantore degli alberi | 1° | +2 | vegetali |
| ↳ Druido della piaga | 1° | pieno | parassiti |
| Ranger (Legame del cacciatore) | 4° | −3 | domestico, serpente, felino piccolo |
| ↳ Falconiere | 1° | −3 (metà PF fino al 3°) | Uccello rapace gigante |
| ↳ Signore della sella | 1° ordinanza, 4° compagno | −3, pieno dall'8° | come Ranger |
| ↳ archetipi ambientali, Predatore selvaggio | 4° | −3 | + Addestratore |
| Erudito (ricerca Addestratore) | 4° | −3 (−1 con Simbiosi) | domestico |
| ↳ Naturalista | 1° | pieno | tutti |
| Barbaro: Cane rabbioso | 1° | pieno | tutti |
| Barbaro: Furia in sella | 1° ordinanza, 5° speciale | pieno | domestico |
| Inquisitore: Custode del serraglio | 1° | pieno | domestico |
| Inquisitore: Equites | 1° ordinanza, 5° speciale | pieno | domestico |
| Paladino: Destriero divino | 5° | pieno | domestico · 11° RD 10/male, RE (acido, elettricità, freddo) 15 · 15° RI 11 + liv. |
| ↳ Campione | 1° ordinanza | — | cammello, cane, cavallo, delfino, pony |
| Guardia nera: Destriero sacrilego | 5° | pieno | domestico · 11° RD 10/male, RE (freddo, fuoco) 15 · 15° RI 11 + liv. |
| Cavaliere: Cavalcaonde | 1° | pieno | acquatico + Ippocampo gigante |
| Cavaliere del Nuovo mondo | 1° | pieno | lucertoloide, dinosauro · 9° taglia +1 · 14° Devozione primordiale |
| Ricognitore, Cavaliere leggero, Cavaliere pesante | 1° | pieno | domestico |
| Ammazzamostri: Inseguitore | 1° | pieno | domestico cavalcabile, niente Condividere incantesimi |
| Marzialista: Cacciatore bataar | 1° | pieno | domestico |
| Nobile: Cavaliere errante | 7° | pieno | domestico cavalcabile, +2 For/Cos, niente Condividere incantesimi |

Esclusi: Destriero fantomatico (Ritualista), Cavalca eidolon (app Convocatore), famigli, guardia del corpo del Nobile.

## INCONGRUENZE NEI SORGENTI

| # | Tema | Esito |
|---|---|---|
| 1 | Tabella taglie del Vol. 1: segni invertiti in Volare e BCM/DMC | ✅ L'app usa il Vol. 1 corretto (Grande: Volare −2, BCM/DMC +1); si correggono Vol. 1 e Bestiario |
| 2 | Punti Fatica: punto dispari | ✅ Va ai Punti Ferita (Vol. 1). Da correggere anche la decisione F dell'app Convocatore |
| 3 | Cumulo dei livelli | ✅ Si cumulano **tutte** le fonti di compagno o cavalcatura. Nel Vol. 2 "funziona (ma non conta) come" diventa "funziona come" |
| 4 | Bardatura | ✅ Il privilegio dà il talento Addestramento nelle bardature leggere |
| 5 | Struzzo "solo Hatamoto" | ✅ Restrizione tolta, diventa domestico |
| 6 | Riassunto dei tipi | ✅ Rigenerato dai tipi delle schede; nomi allineati alle schede |
| 7 | Bisonte = copia dell'Alce | ✅ For 14, Des 10, Cos 12, Int 3, Sag 11, Car 4 |
| 8 | Refusi e rimando al "Libro dei compagni naturali" | ✅ Corretti nel .docx |

## REGOLE DI CALCOLO

| # | Tema | Decisione |
|---|---|---|
| A | Livello minimo | Sotto 1 si usa la riga del 1° |
| B | Fonti "(ma non conta)" senza scarto | Livello di classe pieno |
| C | PF | 8 al 1° DV + 5 per DV successivo + Cos × DV; campo manuale. Metà Ferita e metà Fatica (dispari ai Ferita). Riserva per Rifiatare = DV |
| D | Attacchi | Tutti al BAB; primari For (×1,5 se unico), secondari −5 e ½ For; al 9° con meno di 3 attacchi il primario si ripete a −5 |
| E | CD | 10 + ½ DV + caratteristica indicata |
| F | Avanzamento 4°/7° | Avanzamento della creatura oppure +2 Des e +2 Cos |
| G | Cavalcatura d'ordinanza | Scheda al 1° livello, senza Legame né Condividere incantesimi |
| H | Cavalcatura titanica | Modificatori di taglia + dadi di danno di un passo + For/Cos; Devozione primordiale = +6 contro ammaliamento, +3 Tempra e Riflessi |
| I | Abilità | Punti dalla tabella (+ Int se ≥ 10), gradi max = DV, +3 di classe, +8 per le velocità speciali |
| J | Talenti | Numero dalla tabella; menu dei Talenti Selvatici con requisiti; campo libero; talenti bonus automatici |
| K | Talenti del padrone | Legame speciale (+4, max livello del personaggio), Richiamo naturale (+2 a una caratteristica), Addestratore (+1 TS) |
| L | Più fonti insieme | ✅ Spunte per ogni fonte; livelli effettivi sommati; la creatura deve essere ammessa da tutte le fonti spuntate |
| M | Ottimo Compagno | ✅ Spunta: +4 livelli fino al livello del personaggio; non cumulabile con Legame speciale. Talento ufficiale: non si riscrive nei manuali |

## STRUTTURA DELL'APP

1. **Padrone**: fonti spuntabili con livello di classe, livello del personaggio, talenti (Ottimo Compagno, Richiamo naturale, Addestratore) → livello effettivo.
2. **Bestiario**: creature ammesse, filtri per tipo, taglia, habitat e rarità; ricerca e acquisto (insediamento, probabilità, costo).
3. **Compagno**: scheda calcolata (PF Fatica/Ferita, CA con bardatura, TS, attacchi, BMC/DMC, velocità, abilità, talenti, aumenti, bonus della fonte).
4. **In gioco**: contatore PF, riserva per Rifiatare, stampa della scheda.
