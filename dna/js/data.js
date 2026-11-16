// Fagdata og oppdrag. Ingen DOM eller 3D-avhengigheter.
const T = (enkel, fag = enkel) => ({ enkel, fag });
export const BASES = {
  A: { name: T('adenin'), color: '#ffd76a' }, T: { name: T('tymin'), color: '#b49cff' },
  C: { name: T('cytosin'), color: '#7cc8ff' }, G: { name: T('guanin'), color: '#6fe3a5' },
  U: { name: T('uracil'), color: '#ff9f92' },
};
export const PARTS = {
  fosfat: T('Fosfat'), sukker: T('DNA-sukker', 'Deoksyribose'), base: T('En base', 'Nitrogenbase'),
  fett: T('Fett', 'Lipid'), protein: T('Protein'), ribose: T('RNA-sukker', 'Ribose'),
};
export const AMINO = {
  Met: T('Met · metionin'), Ala: T('Ala · alanin'), Phe: T('Phe · fenylalanin'),
  Gly: T('Gly · glysin'), Lys: T('Lys · lysin'), Asp: T('Asp · aspartat'),
  Val: T('Val · valin'), Ser: T('Ser · serin'), STOP: T('Stopp', 'Stopp (ingen aminosyre)'),
};
export const EFFECTS = {
  silent: T('Samme aminosyrer', 'Stille mutasjon: samme aminosyrer'),
  changed: T('En annen aminosyre', 'Endret aminosyre (missense)'),
  early: T('Kjeden stopper tidligere', 'Tidlig stoppkodon (nonsense)'),
};
const CH1 = T('Kapittel 1: Bygg DNA', 'Kapittel 1: Nukleotider og baseparing');
const CH2 = T('Kapittel 2: Kopier og skriv av', 'Kapittel 2: Replikasjon og transkripsjon');
const CH3 = T('Kapittel 3: Fra gen til protein', 'Kapittel 3: Translasjon og mutasjoner');
const Q = (q, options, correct, why, fagQ) => ({ q: T(q, fagQ || q), options: options.map(o => typeof o === 'string' ? T(o) : o), correct, why: typeof why === 'string' ? T(why) : why });
const questions = [
  Q('Hva består én byggestein i DNA av?', ['Fett, vann og salt', 'Sukker, fosfat og en base', 'Tre baser', 'Et helt protein'], 1,
    T('En byggestein har et sukker, et fosfat og én base. Den heter et nukleotid.', 'Et DNA-nukleotid består av deoksyribose, en fosfatgruppe og en nitrogenbase.')),
  Q('Hvilken base passer sammen med A i DNA?', ['C', 'G', 'U', 'T'], 3, 'A passer med T i DNA. I RNA brukes U i stedet for T.'),
  Q('Hvilken base passer sammen med C?', ['G', 'A', 'T', 'C'], 0, 'C og G danner et basepar. A og T danner det andre paret.'),
  Q('Hva holder de to DNA-trådene sammen mellom basene?', ['Fett', 'Peptidbindinger', 'Hydrogenbindinger', 'Celleveggen'], 2,
    T('Hydrogenbindinger holder baseparene sammen. Langs hver tråd er det sterke bindinger mellom sukker og fosfat.', 'Hydrogenbindinger forbinder komplementære baser. Sukker-fosfat-ryggraden har kovalente bindinger.')),
  Q('Hvor ligger informasjonen i DNA?', ['I rekkefølgen av basene', 'Bare i antall sukker', 'Bare i fosfatet', 'I fargen på DNA'], 0, 'Rekkefølgen av A, T, C og G bærer informasjon. Fargene er bare hjelp i modellen.'),
  Q('Hva betyr det at DNA-trådene går hver sin vei?', ['De har ulike baser', 'De ligger i ulike celler', 'Begge går fra 5′ til 3′ samme vei', 'Den ene går 5′–3′, den andre 3′–5′'], 3,
    T('Trådene har motsatt retning. Merkene 5′ og 3′ viser retningen.', 'DNA-trådene er antiparallelle. 5′ og 3′ viser til karbonatomene i sukkeret.')),
  Q('Hvilke deler danner sidene i DNA-stigen?', ['Bare baser', 'Sukker og fosfat', 'Aminosyrer', 'Fett og proteiner'], 1, 'Sukker og fosfat danner ryggraden. Basene peker inn og danner trinnene.'),
  Q('Hva er den andre tråden til 5′–ATCG–3′, vist rett under?', ['5′–ATCG–3′', '3′–ATCG–5′', '3′–TAGC–5′', '3′–UAGC–5′'], 2, 'A–T og C–G. Tråden under har motsatt retning: 3′–TAGC–5′.'),
  Q('Hvor mange hydrogenbindinger har et G–C-par?', ['Én', 'To', 'Fire', 'Tre'], 3, 'G–C har tre hydrogenbindinger. A–T har to.'),
  Q('Hvordan er DNA vanligvis formet?', ['Som en dobbel spiral', 'Som en kule uten tråder', 'Som én rett proteintråd', 'Som fire separate tråder'], 0, 'To DNA-tråder snor seg rundt hverandre og danner en dobbelheliks.'),
  Q('Hva er et gen?', ['En hel celle', 'Et DNA-område med informasjon for et funksjonelt produkt', 'En type sukker', 'Bare én base'], 1,
    T('Et gen er et område av DNA. Mange gener gir oppskrifter på proteiner. Andre gir RNA som har en egen jobb.', 'Et gen er en DNA-sekvens som gir opphav til et funksjonelt RNA eller proteinprodukt.')),
  Q('Er fargene og størrelsene i DNA-modellen naturtro?', ['Ja, DNA lyser gult', 'Ja, baser har disse fargene', 'Nei, de er hjelp for å se delene', 'Bare fosfatet har riktig farge'], 2, 'Farger og størrelser er forenklet. Modellen gjør delene lettere å skille.'),
  Q('Hvorfor kopieres DNA før celledeling?', ['For å lage fett', 'For å fjerne alle gener', 'For å lage RNA i stedet', 'For at begge cellene skal få arvestoff'], 3, 'DNA kopieres før celledeling. Da kan begge dattercellene få et komplett sett med arvestoff.'),
  Q('Hva får hvert nytt DNA-molekyl etter kopiering?', ['Én gammel og én ny tråd', 'Bare to nye tråder', 'Bare to gamle tråder', 'Én DNA-tråd og ett protein'], 0,
    T('Hver gammel tråd brukes som mal for en ny. Hvert molekyl får én gammel og én ny tråd.', 'Replikasjonen er semikonservativ: hvert dattermolekyl har én foreldrestreng og én nysyntetisert streng.')),
  Q('Hva gjør helikase når DNA skal kopieres?', ['Lager aminosyrer', 'Skiller DNA-trådene', 'Bytter alle A til C', 'Lager ribosomer'], 1, 'Helikase åpner dobbelheliksen ved å skille trådene. Bindingene mellom baseparene brytes.'),
  Q('Hva gjør DNA-polymerase?', ['Fjerner alle gener', 'Lager fett', 'Bygger en ny DNA-tråd etter en mal', 'Oversetter mRNA til protein'], 2, 'DNA-polymerase setter sammen en ny DNA-tråd ved å bruke baseparingsreglene.'),
  Q('Hvilken vei vokser en ny DNA-tråd?', ['5′ til 3′', '3′ til 5′', 'Begge veier samtidig', 'Den har ingen retning'], 0, 'Nye nukleotider festes til 3′-enden. Derfor vokser den nye tråden fra 5′ til 3′.'),
  Q('Hvilken base brukes i RNA i stedet for T?', ['G', 'C', 'A', 'U'], 3, 'RNA bruker uracil (U) der DNA bruker tymin (T).'),
  Q('Hva er transkripsjon?', ['Å kopiere hele DNA før deling', 'Å lage RNA fra en DNA-mal', 'Å lage protein av aminosyrer', 'Å bryte ned et protein'], 1, 'Ved transkripsjon brukes én DNA-tråd som mal for RNA. DNA blir ikke brukt opp.'),
  Q('Hva blir RNA fra DNA-malen 3′–TAC–5′?', ['5′–TAC–3′', '5′–ATG–3′', '5′–AUG–3′', '5′–UAC–3′'], 2, 'T gir A, A gir U og C gir G. RNA bygges fra 5′ til 3′.'),
  Q('Hvilken tråd brukes som mal når mRNA lages?', ['Begge trådene blandet', 'Et protein', 'En fettkjede', 'Én av DNA-trådene'], 3, 'RNA-polymerase leser én maltråd for genet. Det lages en komplementær RNA-tråd.'),
  Q('Hvor går mRNA fra kjernen i en dyrecelle?', ['Til et ribosom i cytoplasma', 'Til celleveggen', 'Ut av organismen', 'Til en kloroplast'], 0, 'mRNA frakter informasjon fra DNA til ribosomer. Ribosomene setter sammen aminosyrer.'),
  Q('Hva er likt ved replikasjon og transkripsjon?', ['Begge lager protein', 'Begge bruker en DNA-mal', 'Begge lager to DNA-molekyler', 'Begge bruker T i RNA'], 1, 'Begge bruker baseparing med en DNA-mal. Replikasjon lager DNA, transkripsjon lager RNA.'),
  Q('Blir DNA-malen brukt opp når RNA lages?', ['Ja, den blir til RNA', 'Ja, den blir til protein', 'Nei, DNA kan brukes igjen', 'Bare A-basene forsvinner'], 2, 'DNA-tråden beholdes og kan brukes til å lage flere RNA-kopier.'),
  Q('Hvor mange baser er det i ett kodon?', ['To', 'Fire', 'Én', 'Tre'], 3, 'Et kodon er tre baser i mRNA. Det angir en aminosyre eller et stoppsignal.'),
  Q('Hvor settes aminosyrer sammen til en kjede?', ['I ribosomet', 'I DNA-ryggraden', 'I celleveggen', 'Mellom DNA-baseparene'], 0, 'Ribosomet leser mRNA. tRNA leverer aminosyrene som settes sammen.'),
  Q('Hva angir AUG i oppdragene våre?', ['Stopp', 'Start og aminosyren metionin', 'Fosfat', 'At RNA skal kopieres'], 1, 'Vi bruker AUG som startkodon. AUG koder også for metionin i standardkoden.'),
  Q('Hva skjer når ribosomet møter UAA?', ['En ny aminosyre legges til', 'DNA kopieres', 'Kjeden avsluttes', 'RNA blir til DNA'], 2, 'UAA er et stoppkodon. Det koder ikke for en aminosyre.'),
  Q('Kan ulike kodoner angi samme aminosyre?', ['Ja, for eksempel GCU og GCC', 'Nei, aldri', 'Bare i DNA, ikke RNA', 'Bare stoppkodoner kan det'], 0, 'Den genetiske koden har flere kodoner for mange aminosyrer. GCU og GCC angir alanin.'),
  Q('Hva er en mutasjon?', ['Et nytt ribosom', 'Enhver endring i et protein', 'Vanlig baseparing', 'En endring i DNA-sekvensen'], 3, 'En mutasjon er en endring i DNA-sekvensen. Den kan påvirke et protein, men må ikke gjøre det.'),
  Q('GCU endres til GCC i mRNA. Begge angir alanin. Hva skjer med aminosyren?', ['Den blir glysin', 'Den er den samme', 'Den blir alltid et stoppsignal', 'Den forsvinner'], 1, 'Begge kodonene angir alanin. Denne endringen gir samme aminosyresekvens i modellen.'),
  Q('Hva kan et nytt stoppkodon tidlig i et gen føre til?', ['Alltid et lengre protein', 'Mer DNA i hver celle', 'En kortere aminosyrekjede', 'Ingen mulighet for endring'], 2, 'Et tidlig stoppkodon kan avslutte translasjonen før hele kjeden er laget.'),
  Q('Er alle mutasjoner skadelige?', ['Ja, alltid', 'Bare de som endrer en base', 'Ja, de stopper alle proteiner', 'Nei, virkningen varierer'], 3, 'Mutasjoner kan være nøytrale, skadelige eller fordelaktige. Virkningen avhenger av hva som endres og sammenhengen.'),
  Q('Hva gjør tRNA under proteinsyntesen?', ['Leverer aminosyrer til ribosomet', 'Kopierer hele DNA', 'Danner sukker-fosfat-ryggraden', 'Lager celleveggen'], 0, 'tRNA har et antikodon og bærer en aminosyre. Det kobler mRNA-kodon til riktig aminosyre.'),
  Q('Hva kan arves av et barn?', ['Alle endringer i hudceller', 'DNA-endringer i kjønnscellen som gir opphav til barnet', 'Bare endringer i muskelceller', 'Alt som skjer med foreldrenes proteiner'], 1, 'DNA-endringer i kjønnsceller kan overføres til barn. Endringer bare i kroppsceller arves vanligvis ikke av barn.'),
  Q('Hva viser en kort aminosyrekjede i modellen?', ['Et helt menneske', 'Et komplett kromosom', 'Et lite, forenklet utdrag av proteinsyntesen', 'At alle proteiner har tre aminosyrer'], 2, 'Ekte proteiner har ofte mange flere aminosyrer. Her bruker vi korte sekvenser for å se prinsippet.'),
];

const L = (id, chapter, title, brief, goal, qi, hint, learn) => ({ id, chapter, title: typeof title === 'string' ? T(title) : title, brief: typeof brief === 'string' ? T(brief) : brief, goal, predict: questions[qi], hint: typeof hint === 'string' ? T(hint) : hint, learn: typeof learn === 'string' ? T(learn) : learn });
export const LEVELS = [
  L('d01', CH1, T('Én byggestein', 'Bygg et DNA-nukleotid'), T('Velg de tre delene i én byggestein i DNA. Se hvordan delene henger sammen.', 'Sett sammen et DNA-nukleotid av deoksyribose, fosfat og en nitrogenbase.'),
    { type: 'parts', parts: ['fosfat', 'sukker', 'base'], tray: ['fosfat', 'fett', 'sukker', 'protein', 'base', 'ribose'] }, 0,
    'Velg fosfat, DNA-sukker og en base. RNA-sukkeret heter ribose.',
    T('DNA er bygd av mange nukleotider. Hvert nukleotid har et sukker, et fosfat og én base.', 'DNA er en polymer av nukleotider. Hvert nukleotid består av deoksyribose, fosfat og en nitrogenbase.')),
  L('d02', CH1, 'A finner T', 'Bygg den andre DNA-tråden. Velg en tom plass og sett inn basen som passer.', { type: 'pair', template: 'ATTA' }, 1,
    'A passer med T. T passer med A.', 'A og T danner et basepar med to hydrogenbindinger. Basene binder de to DNA-trådene sammen.'),
  L('d03', CH1, 'C finner G', 'Nå møter du to nye baser. Fyll de tomme plassene med C eller G.', { type: 'pair', template: 'CGGCCG' }, 2,
    'C passer med G. G passer med C.', 'C og G danner et basepar med tre hydrogenbindinger. DNA har fire typer baser: A, T, C og G.'),
  L('d04', CH1, T('Alle fire basene', 'Komplementære DNA-tråder'), 'Bygg en hel tråd med alle fire basene. Bokstavene er viktige, også når du ser basene fra en annen vinkel.', { type: 'pair', template: 'ATGCCA' }, 4,
    'Bruk A–T og C–G. Du kan trykke på en tom plass både i modellen og i rekken under.', 'Når du kjenner én DNA-tråd, kan du finne den andre med baseparingsreglene. Rekkefølgen av basene bærer informasjonen.'),
  L('d05', CH1, T('To motsatte veier', 'Antiparallelle tråder'), T('Se merkene 5′ og 3′. Fyll tråden under. De to trådene går hver sin vei.', 'Fyll den komplementære tråden 3′–5′ under tråden som er vist 5′–3′. Legg merke til antiparallell retning.'), { type: 'pair', template: 'GATCTAGC' }, 5,
    'Basene står rett overfor partneren sin. Den øvre raden går 5′–3′, den nedre går 3′–5′.', 'DNA-trådene har motsatt retning. Merkene 5′ og 3′ viser hvordan sukkerdelene i tråden er orientert.'),
  L('d06', CH1, 'Gjør spiralen ferdig', 'Noen baser er på plass. Fyll resten. Snu modellen og finn sukker, fosfat og basepar.', { type: 'pair', template: 'TACGATCG', given: ['A G  A C'] }, 3,
    'Sjekk én plass om gangen med A–T og C–G. Sukker og fosfat ligger langs sidene.', 'DNA danner en dobbelheliks. Sukker og fosfat danner sidene. Mellom basene er det hydrogenbindinger. Modellen viser forenklede former og farger.'),
  L('d07', CH2, T('Åpne og kopier', 'Replikasjon: to dattermolekyler'), 'Åpne DNA med knappen. Bruk hver gammel tråd som mal, og bygg to nye tråder.', { type: 'replicate', template: 'ATGC' }, 12,
    'Trykk «Åpne DNA». Fyll begge kopiene med A–T og C–G.', 'DNA kopieres før en celle deler seg. Hver gammel tråd blir mal for en ny tråd. De to DNA-molekylene har samme informasjon.'),
  L('d08', CH2, T('Gammel og ny', 'Semikonservativ replikasjon'), 'Bygg ferdig begge DNA-kopiene. Følg merkene: Hver kopi skal ha én gammel og én ny tråd.', { type: 'replicate', template: 'TACGGA' }, 13,
    'De to malene er forskjellige. Nye baser skal passe til den gamle tråden i hver kopi.', T('Hvert nytt DNA-molekyl har én gammel og én ny tråd. Ingen av kopiene får bare nye tråder.', 'Semikonservativ replikasjon bevarer én foreldrestreng i hvert dattermolekyl. Den andre strengen nysyntetiseres.')),
  L('d09', CH2, T('Enzymenes jobb', 'Helikase og DNA-polymerase'), 'Åpne trådene slik helikase gjør. Velg så riktige byggesteiner til begge nye trådene, slik DNA-polymerase gjør.', { type: 'replicate', template: 'GCTATC' }, 15,
    'Helikase skiller trådene. DNA-polymerase bygger nye tråder etter baseparingsreglene.', 'Helikase åpner DNA. DNA-polymerase bygger nye tråder fra 5′ til 3′. Her velger du plassene fritt. Modellen viser ikke primere eller små DNA-fragmenter.'),
  L('d10', CH2, 'To komplette kopier', 'Kopier en lengre DNA-bit. Begge gamle trådene må få en ny partner før oppdraget er ferdig.', { type: 'replicate', template: 'ATGCCGTA' }, 16,
    'Fyll kopi 1 og kopi 2. Merk retningen på hver ny tråd.', 'DNA-polymerase bygger bare fra 5′ til 3′. I cellen lages den ene nye tråden i biter. Her har vi forenklet prosessen til riktig baseparing.'),
  L('d11', CH2, T('En beskjed fra DNA', 'Transkripsjon: DNA → mRNA'), 'Lag RNA fra DNA-malen. I RNA bruker du U i stedet for T. Malen leses fra 3′ mot 5′.', { type: 'transcribe', template: 'TACCGAAAT' }, 17,
    'DNA → RNA: T gir A, A gir U, C gir G og G gir C.', 'RNA-polymerase leser én DNA-mal og lager RNA fra 5′ til 3′. mRNA kan frakte informasjon til et ribosom. DNA-malen beholdes.'),
  L('d12', CH2, 'Skriv av et lite gen', 'Lag en kort mRNA-beskjed som senere kan leses av et ribosom. Bruk baseparing og riktig RNA-base.', { type: 'transcribe', template: 'TACCGAAAATTCATT' }, 18,
    'RNA fra denne malen starter med AUG. Bruk U, ikke T, overfor A.', 'Et protein-kodende gen kan skrives av til mRNA. RNA bruker ribose og uracil, mens DNA bruker deoksyribose og tymin. Dette er et kort utdrag uten RNA-bearbeiding.'),
  L('d13', CH3, T('Les tre og tre', 'Translasjon: kodoner og aminosyrer'), 'Ribosomet leser tre RNA-baser om gangen. Bruk kodonkortet og velg riktig aminosyre. Avslutt med Stopp.', { type: 'translate', rna: 'AUGGCUUUUUAA', tray: ['Ala', 'Phe', 'Met', 'Gly', 'STOP'] }, 24,
    'Les kodonkortet: AUG → Met, GCU → Ala, UUU → Phe, UAA → Stopp.', 'Ribosomet leser mRNA i kodoner med tre baser. tRNA leverer aminosyrer. Aminosyrene bindes sammen til en kjede. Stopp er et signal, ingen aminosyre.'),
  L('d14', CH3, 'Flere ord, samme byggestein', 'Les RNA-kjeden med kodonkortet. Se at to ulike kodoner kan gi samme aminosyre.', { type: 'translate', rna: 'AUGGCUGCCUAG', tray: ['Gly', 'Met', 'Ala', 'Ser', 'STOP'] }, 28,
    'GCU og GCC gir begge Ala. AUG gir Met. UAG er Stopp.', 'Flere kodoner kan kode for samme aminosyre. GCU og GCC koder begge for alanin. Det er én grunn til at noen DNA-endringer ikke endrer aminosyrekjeden.'),
  L('d15', CH3, 'Stopp på riktig sted', 'Bygg kjeden og stopp når ribosomet møter stoppsignalet. RNA-baser etter stopp skal ikke bli aminosyrer i denne kjeden.', { type: 'translate', rna: 'AUGGGUAAAUGAUUU', tray: ['Lys', 'Met', 'Phe', 'Gly', 'STOP'] }, 27,
    'AUG → Met, GGU → Gly, AAA → Lys. UGA betyr Stopp. Ikke legg til Phe fra UUU etterpå.', 'UAA, UAG og UGA er stoppkodoner i standardkoden. De avslutter translasjonen. Ribosomet fortsetter ikke med neste kodon i den samme aminosyrekjeden.'),
  L('d16', CH3, T('Én base, ny byggestein', 'Mutasjon: endret aminosyre'), 'Én DNA-base er endret. Bygg den nye aminosyrekjeden. Sammenlign med den gamle, og velg hva som har skjedd.', { type: 'mutation', original: 'ATGGCTTTTTAA', changed: 'ATGGATTTTTAA', tray: ['Ala', 'Asp', 'Met', 'Phe', 'STOP'] }, 29,
    'GCU er Ala, men GAU er Asp. Bygg den nye kjeden før du velger forklaring.', 'En baseendring kan endre et kodon slik at en annen aminosyre settes inn. Det kan påvirke proteinet. Modellen alene sier ikke om endringen er skadelig.'),
  L('d17', CH3, T('Ny base, samme kjede', 'Stille mutasjon'), 'Sjekk en annen DNA-endring. Bruk kodonkortet, bygg den nye kjeden og sammenlign aminosyrene.', { type: 'mutation', original: 'ATGGCTTTTTAA', changed: 'ATGGCCTTTTAA', tray: ['Met', 'Gly', 'Ala', 'Phe', 'STOP'] }, 30,
    'GCU og GCC gir begge alanin. Sammenlign kjedene, ikke bare bokstavene i DNA.', 'DNA er endret, men aminosyrekjeden er lik. Det kalles en stille mutasjon. Det betyr ikke at slike endringer alltid er uten andre virkninger i en ekte celle.'),
  L('d18', CH3, T('Beskjeden blir for kort', 'Tidlig stopp: fra DNA-endring til kortere kjede'), 'To baser er endret i ett kodon. Bygg den nye kjeden, stopp på riktig sted og forklar forskjellen.', { type: 'mutation', original: 'ATGGCTTTTTAA', changed: 'ATGTAATTTTAA', tray: ['Phe', 'Met', 'Ala', 'Gly', 'STOP'] }, 31,
    'Etter AUG kommer UAA i det nye mRNA-et. UAA betyr Stopp, ikke en aminosyre.', 'DNA-endringen gir et tidlig stoppkodon. Den nye kjeden blir kortere. Mutasjoner kan ha ulike virkninger, og endringer i kjønnsceller kan arves av barn.'),
];
export const TEST_DRAW = 6;
export const TEST_PASS = 5;
export const TESTS = [
  { id: 'dt1', from: 'd01', after: 'd06', title: T('Test 1: Bygg DNA', 'Test 1: DNA-struktur og baseparing'), questions: questions.slice(0, 12) },
  { id: 'dt2', from: 'd07', after: 'd12', title: T('Test 2: Kopier og skriv av', 'Test 2: Replikasjon og transkripsjon'), questions: questions.slice(12, 24) },
  { id: 'dt3', from: 'd13', after: 'd18', title: T('Test 3: Fra gen til protein', 'Test 3: Translasjon og mutasjoner'), questions: questions.slice(24) },
];
export const SOURCES = [
  { title: 'NHGRI: DNA', href: 'https://www.genome.gov/genetics-glossary/Deoxyribonucleic-Acid-DNA' },
  { title: 'NHGRI: DNA replication', href: 'https://www.genome.gov/genetics-glossary/DNA-Replication' },
  { title: 'NHGRI: Transcription', href: 'https://www.genome.gov/genetics-glossary/Transcription' },
  { title: 'NCBI: Standard genetic code (table 1)', href: 'https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi' },
  { title: 'NHGRI: Mutation', href: 'https://www.genome.gov/genetics-glossary/Mutation' },
];
