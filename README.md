# Naturfagverkstedet

Nettsted med 3D-verksteder for naturfag VG1. Eleven bygger, forutsier og tester.
All tekst finnes i to registre: `enkel` (norsk A2–B1) og `fag` (VG1-fagspråk).

## Verksteder

| Verksted | Mappe | Status | Innhold |
| --- | --- | --- | --- |
| Molekylverkstedet | `molekyl/` | Klart | Atomer, kovalent binding, ioner |
| Reaksjonsverkstedet | `reaksjon/` | Klart | Balansering, bindingsbrudd og energi, forbrenning, redoks, fotosyntese og celleånding (18 oppdrag) |
| Celleverkstedet, DNA-verkstedet, Energiverkstedet, Strålingsverkstedet, Økosystemverkstedet | | Planlagt | |

Nytt verksted legges til som en oppføring i `verksteder.js`.

## Kjøre

```bash
npm install
npm run dev      # http://localhost:5180
npm test         # vitest, 262 tester
```

Ingen byggesteg. three.js (0.160.0) og skriftene lastes fra CDN, så siden trenger nett.
Lærersnarvei: legg til `#alle` bak adressen i et verksted for å åpne alle oppdrag.

## Struktur

| Sti | Innhold |
| --- | --- |
| `index.html`, `portal/`, `verksteder.js` | Forsiden og registeret over verksteder |
| `molekyl/js/data.js` | Grunnstoffer, molekyler, nivåer, tester og tekster (ren data) |
| `molekyl/js/chem.js` | Bindingslogikk (`World`), uten DOM og three |
| `molekyl/js/engine.js` | 3D-motoren (three.js) |
| `molekyl/js/ui.js` | Brukergrensesnittet |
| `molekyl/js/main.js` | Kobler alt sammen |
| `molekyl/css/style.css` | Stiler for Molekylverkstedet |
| `reaksjon/js/data.js` | Reaksjoner, oppdrag, tester og bindingsenergier |
| `reaksjon/js/react.js` | Ren reaksjonslogikk (balansering, energiregnskap, produktsjekk) |
| `reaksjon/js/strings.js` | UI-tekster |
| `reaksjon/js/main.js` | Spillflyt |
| `reaksjon/css/reaksjon.css` | Stiler for Reaksjonsverkstedet |
| `tests/` | Vitest-tester |
| `server.mjs` | Statisk utviklingsserver |

Reaksjonsverkstedet gjenbruker motoren, UI-et og molekylkatalogen fra `molekyl/`.

## Lagring

Fremgang lagres i nettleserens `localStorage` per verksted (`molekylverkstedet.v2`, `reaksjonsverkstedet.v1`). Forsiden leser `stars` derfra.

## Opphav

Molekylverkstedet stammer fra artifacten https://claude.ai/artifact/P2zzaf8VUp61mBHVYQA1Bv.
