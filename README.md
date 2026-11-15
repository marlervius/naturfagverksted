# Molekylverkstedet

3D-spill der eleven bygger atomer og molekyler og lærer skallmodellen, kovalent binding og ionebinding.
All tekst finnes i to registre: `enkel` (norsk A2–B1) og `fag` (VG1-fagspråk).

Koden er hentet fra artifacten https://claude.ai/artifact/P2zzaf8VUp61mBHVYQA1Bv og er uendret.

## Kjøre

```bash
npm install
npm run dev      # http://localhost:5180
npm test         # vitest: bindingslogikk og dataintegritet
```

Ingen byggesteg. three.js (0.160.0) og skriftene lastes fra CDN, så spillet trenger nett.
Lærersnarvei: åpne `/#alle` for å låse opp alle nivåer.

## Filer

| Fil | Innhold |
| --- | --- |
| `index.html` | Skall, importmap for three.js |
| `js/data.js` | Grunnstoffer, molekyler, nivåer, tester og tekster (ren data) |
| `js/chem.js` | Bindingslogikk (`World`) – ingen DOM, ingen three |
| `js/engine.js` | 3D-motoren (three.js) |
| `js/ui.js` | Brukergrensesnittet |
| `js/main.js` | Kobler alt sammen, lagrer fremgang i `localStorage` |
| `css/style.css` | Stiler |
| `server.mjs` | Statisk utviklingsserver |
| `tests/` | Vitest-tester |

## Publisere

Artifacten bruker de samme filstiene (`index.html`, `css/style.css`, `js/*.js`), så mappa kan publiseres direkte til samme lenke.
