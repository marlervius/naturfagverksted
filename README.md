# Naturfagverkstedet

Nettsted med 3D-verksteder for naturfag VG1. Eleven bygger, forutsier og tester.
All tekst finnes i to registre: `enkel` (norsk A2–B1) og `fag` (VG1-fagspråk).

## Verksteder

| Verksted | Mappe | Status | Innhold |
| --- | --- | --- | --- |
| Molekylverkstedet | `molekyl/` | Klart | Atomer, kovalent binding, ioner |
| Reaksjonsverkstedet | `reaksjon/` | Klart | Balansering, bindingsbrudd og energi, forbrenning, redoks, fotosyntese og celleånding (18 oppdrag) |
| Celleverkstedet | `celle/` | Klart | Bygg dyre-, plante- og bakteriecelle, transport gjennom membranen, osmose, celleånding og fotosyntese (18 oppdrag) |
| DNA-verkstedet | `dna/` | Klart for visuell utprøving | Nukleotider, baseparing, replikasjon, transkripsjon, translasjon og mutasjoner (18 oppdrag, 3 kapitteltester) |
| Energiverkstedet, Strålingsverkstedet, Økosystemverkstedet | | Planlagt | |

Nytt verksted legges til som en oppføring i `verksteder.js`.

## Kjøre

```bash
npm install
npm run dev      # http://localhost:5180
npm test         # vitest
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
| `celle/js/data.js` | Organeller, celletyper, stoffer, oppdrag og tester |
| `celle/js/sim.js` | Ren logikk: organellbygging, energi, membrantransport og osmose |
| `celle/js/scene.js`, `celle3d.js`, `membran3d.js`, `energi3d.js` | 3D-scenene (three.js) |
| `celle/js/main.js`, `strings.js`, `ikoner.js` | Spillflyt for verkstedet, UI-tekster og ikoner |
| `celle/css/celle.css` | Stiler for Celleverkstedet |
| `dna/js/data.js`, `strings.js` | DNA-oppdrag, tester, kodonnavn, fagkilder og tekster i begge språkregistre |
| `dna/js/sim.js` | Ren DNA/RNA-logikk: baseparing, transkripsjon, standard genetisk kode, translasjon og sammenligning av mutasjoner |
| `dna/js/scene.js`, `main.js` | 3D-modeller og arbeidsbenk for DNA-verkstedet |
| `dna/css/dna.css` | Stiler for DNA-verkstedet |
| `felles/flyt.js` | Delt spillflyt (lagring, stier, tenk-først, stjerner, tester). Brukes av Celleverkstedet og DNA-verkstedet og skal brukes av nye verksteder |
| `tests/` | Vitest-tester |
| `server.mjs` | Statisk utviklingsserver |

Reaksjonsverkstedet gjenbruker motoren, UI-et og molekylkatalogen fra `molekyl/`. Celleverkstedet har egne 3D-scener, men gjenbruker UI-et fra `molekyl/js/ui.js`. DNA-verkstedet gjenbruker samme UI og renderer/kamera fra `celle/js/scene.js`, med egne DNA- og ribosommodeller.

## Lagring

Fremgang lagres i nettleserens `localStorage` per verksted (`molekylverkstedet.v2`, `reaksjonsverkstedet.v1`, `celleverkstedet.v1`, `dnaverkstedet.v1`). Forsiden leser `stars` derfra. Et påbegynt oppdrag starter fra begynnelsen ved gjenåpning; fullførte oppdrag, språk, støtte og testsvar (bestått/ikke bestått) beholdes.

## DNA-verkstedet: fagmodell og utprøving

Åpne `http://localhost:5180/dna/`, eller `/dna/#alle` for alle oppdrag uten testsperrer.
Eleven bygger et nukleotid, fyller komplementære DNA-tråder, lager to dattermolekyler,
skriver mRNA fra en DNA-mal og bygger korte aminosyrekjeder med et kodonkort.
Tre mutasjonsoppdrag sammenligner endret aminosyre, samme aminosyrer og tidlig stopp.

DNA-mal ved transkripsjon vises 3′–5′, og mRNA 5′–3′. I mutasjonsoppdrag vises
den **kodende DNA-tråden** 5′–3′, som tilsvarer mRNA med T erstattet av U.
Translasjonen bruker standard genetisk kode (NCBI tabell 1), AUG som start og UAA/UAG/UGA som stopp.
Et stoppsignal legges aldri til som en aminosyre.

Modellen er skjematisk: korte sekvenser, forenklede former og fri plasseringsrekkefølge ved kopiering.
DNA syntetiseres biologisk 5′–3′; primere, Okazaki-fragmenter, RNA-bearbeiding og proteinfolding er utelatt.
Avgrensninger og lenker til NHGRI/NCBI ligger under «En forenklet modell» i verkstedet.

Automatiske tester kontrollerer at alle 18 oppdrag kan løses, begge kopier kreves ved replikasjon,
feilvalg ikke endrer sekvensen, kodoner og stopp behandles riktig, og at fagdata har begge språkregistre.
UI-tester i Happy DOM løser oppdragene gjennom det reelle grensesnittet og kontrollerer lagring,
språkbytte, støtte, fokus, gjenopptak og testsperrer. Geometritester bruker samme Three.js-versjon som CDN-et
og kontrollerer oppbygging av alle scenene og opprydding av ressurser. Happy DOM og Three.js er kun lokale testavhengigheter.
Manuell nettleserkontroll av WebGL-rendering, panelplassering på mobil og tastaturflyt gjenstår.

## Opphav

Molekylverkstedet stammer fra artifacten https://claude.ai/artifact/P2zzaf8VUp61mBHVYQA1Bv.
