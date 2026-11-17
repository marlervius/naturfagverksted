'use strict';
const SOURCES={
  "udir": {
    "title": "Udir · Samfunnsfag FOV, modul 4",
    "url": "https://www.udir.no/lk20/saf03-01/kompetansemaal-og-vurdering/kv833",
    "note": "Kompetansemål om levekår, utdanning, arbeid, forbruk, ulikhet og faglig kildearbeid."
  },
  "ssbPoverty": {
    "title": "SSB · Hvor mange er fattige i Norge?",
    "url": "https://www.ssb.no/inntekt-og-forbruk/inntekt-og-formue/artikler/hvor-mange-er-fattige-i-norge",
    "note": "Forklarer ulike mål. Lavinntekt er en indikator, ikke en full beskrivelse av fattigdom."
  },
  "worldbank": {
    "title": "Verdensbanken · Internasjonale fattigdomsgrenser",
    "url": "https://www.worldbank.org/en/news/factsheet/2025/06/05/june-2025-update-to-global-poverty-lines",
    "note": "Endring fra juni 2025: 3 internasjonale dollar per person per dag, målt med kjøpekraft i 2021. Ikke en vanlig valutakurs."
  },
  "hdi": {
    "title": "UNDP · Hva måler HDI?",
    "url": "https://hdr.undp.org/data-center/human-development-index",
    "note": "Metode for helse, utdanning og inntekt. HDI er et gjennomsnitt og viser ikke all ulikhet eller livskvalitet."
  },
  "hdiData": {
    "title": "UNDP · Human Development Report 2025, tabell 1",
    "url": "https://hdr.undp.org/system/files/documents/global-report-document/hdr2025reporten.pdf",
    "note": "Landtabellen bruker måleåret 2023 fra rapporten publisert i 2025. HDI og forventet levealder er hentet fra samme tabell."
  },
  "povertyCauses": {
    "title": "Verdensbanken · Årsaker og hindringer for fattigdomsreduksjon",
    "url": "https://worldbank.github.io/atlas-global-development/extreme-poverty/",
    "note": "Økonomi, konflikt, styresett og andre samvirkende forhold. Verdensbanken er en utviklingsinstitusjon med et eget samfunnsoppdrag."
  },
  "fnPoverty": {
    "title": "FN-sambandet · Fattigdom",
    "url": "https://fn.no/tema/baerekraftig-utvikling-fattigdom-og-befolkning/fattigdom",
    "note": "Pedagogisk oversikt fra den norske organisasjonen FN-sambandet. Bruk original statistikk for tall; oversikter kan oppdateres på ulike tidspunkter."
  },
  "inequality": {
    "title": "FN-sambandet · Mindre ulikhet",
    "url": "https://fn.no/om-fn/fns-baerekraftsmaal/mindre-ulikhet",
    "note": "Bærekraftsmål 10: forskjeller i og mellom land, deltakelse og muligheter."
  },
  "sustainable": {
    "title": "FN-sambandet · Utrydde fattigdom",
    "url": "https://fn.no/om-fn/fns-baerekraftsmaal/utrydde-fattigdom",
    "note": "Bærekraftsmål 1 og eksempler på sosiale tiltak. Kontroller dato og målemetode ved bruk av tall."
  },
  "norwayHistory": {
    "title": "Universitetet i Oslo · Norge blir et industriland",
    "url": "https://www.norgeshistorie.no/artikler/industrialisering-og-demokrati/1504-norge-blir-et-industriland.html",
    "note": "Historisk fagartikkel om industri, skipsfart, handel og samfunnsendring før oljealderen."
  },
  "nationalAccounts": {
    "title": "SSB · Nasjonalregnskap",
    "url": "https://www.ssb.no/nasjonalregnskap-og-konjunkturer/nasjonalregnskap/statistikk/nasjonalregnskap",
    "note": "Definisjoner av BNP og BNI. BNP måler verdiskaping, ikke summen av alle salg."
  },
  "consumption": {
    "title": "FN-sambandet · Ansvarlig forbruk og produksjon",
    "url": "https://fn.no/om-fn/fns-baerekraftsmaal/ansvarlig-forbruk-og-produksjon",
    "note": "Bærekraftsmål 12: ressursbruk, avfall, reparasjon og gjenbruk."
  }
};
const WORDS=[
  [
    "levekår",
    "forholdene mennesker lever under",
    "Bolig, helse og trygghet er deler av levekårene."
  ],
  [
    "levestandard",
    "hvor mye materielle goder en person eller familie har",
    "En familie har bolig, klær og råd til transport."
  ],
  [
    "livskvalitet",
    "hvordan en person opplever livet sitt",
    "Trygge venner kan gi en person bedre livskvalitet."
  ],
  [
    "materielle goder",
    "ting og tjenester som dekker praktiske behov",
    "Bolig, klær og transport er materielle goder."
  ],
  [
    "inntekt",
    "penger som kommer inn i en periode",
    "Lønn i en måned er inntekt."
  ],
  [
    "formue",
    "verdien av eiendeler minus gjeld",
    "En person har eiendeler verdt 100 000 kr og gjeld på 20 000 kr. Formuen er 80 000 kr."
  ],
  [
    "eiendel",
    "noe du eier som har verdi",
    "En sparekonto er en eiendel."
  ],
  [
    "gjeld",
    "penger du skylder",
    "Et boliglån er gjeld."
  ],
  [
    "fattigdom",
    "å ha for lite ressurser til å dekke viktige behov",
    "En familie har ikke råd til nødvendig mat og bolig."
  ],
  [
    "relativ fattigdom",
    "å ha så lite ressurser at vanlig deltakelse i samfunnet blir vanskelig",
    "En ungdom har ikke råd til aktiviteter som mange jevnaldrende deltar i."
  ],
  [
    "ekstrem fattigdom",
    "svært alvorlig mangel på ressurser til grunnleggende behov",
    "En person har ikke nok ressurser til nødvendig mat og bolig."
  ],
  [
    "ulikhet",
    "forskjeller i ressurser eller muligheter mellom mennesker",
    "Noen har mye høyere inntekt enn andre."
  ],
  [
    "indikator",
    "et mål som gir informasjon om et forhold",
    "Forventet levealder kan si noe om helse."
  ],
  [
    "gjennomsnitt",
    "en samlet verdi delt på antall enheter",
    "100 kroner delt på fem personer gir 20 kroner per person i gjennomsnitt."
  ],
  [
    "BNP",
    "verdiskapingen innenfor et lands grenser i en periode",
    "BNP kan vise størrelsen på produksjonen i et land."
  ],
  [
    "BNI",
    "BNP justert for lønns- og formuesinntekter til og fra utlandet",
    "BNI brukes i en sammenligning av utvikling mellom land."
  ],
  [
    "HDI",
    "en indeks som kombinerer helse, utdanning og BNI per innbygger",
    "HDI kan brukes til å sammenligne flere sider ved utvikling."
  ],
  [
    "kjøpekraft",
    "hvor mye varer og tjenester penger kan kjøpe",
    "Samme beløp kan kjøpe ulik mengde mat på to steder."
  ],
  [
    "kolonialisme",
    "når en stat tar kontroll over et annet område og menneskene der",
    "En kolonimakt styrte et område og hentet ut råvarer."
  ],
  [
    "industrialisering",
    "utvikling der produksjon i fabrikker og med maskiner blir viktigere",
    "En fabrikk bruker maskiner til å produsere tekstiler."
  ],
  [
    "naturressurs",
    "noe fra naturen som mennesker kan bruke",
    "Fisk, skog og olje er naturressurser."
  ],
  [
    "infrastruktur",
    "systemer som trengs for at et samfunn skal fungere",
    "Veier, strømnett og internett er infrastruktur."
  ],
  [
    "verdiskaping",
    "å skape varer og tjenester som har verdi",
    "En bedrift lager møbler av tre og selger dem."
  ],
  [
    "handel",
    "kjøp og salg av varer og tjenester",
    "En bedrift selger møbler til en kunde i et annet land."
  ],
  [
    "utdanning",
    "organisert læring som kan gi kunnskap og kvalifikasjoner",
    "En voksen tar fagbrev gjennom opplæring."
  ],
  [
    "kvalifikasjon",
    "kunnskap eller erfaring som kreves eller er nyttig i en jobb",
    "Et fagbrev kan være en kvalifikasjon."
  ],
  [
    "diskriminering",
    "usaklig forskjellsbehandling av mennesker",
    "En søker blir valgt bort på grunn av etnisitet, selv om hun er kvalifisert."
  ],
  [
    "budsjett",
    "en plan for inntekter og utgifter",
    "En familie planlegger hva den kan bruke på mat og husleie."
  ],
  [
    "forbruk",
    "bruk av varer og tjenester",
    "Å kjøpe mat og bruke strøm er forbruk."
  ],
  [
    "tiltak",
    "en handling som skal bidra til en ønsket endring",
    "Gratis skolemat kan være et tiltak for å støtte elever."
  ],
  [
    "kildekritikk",
    "å undersøke om informasjon er relevant og troverdig",
    "Vi sjekker hvem som har laget en statistikk og hvilket år den gjelder."
  ],
  [
    "absolutt fattigdom",
    "mangel på ressurser til helt grunnleggende behov",
    "En person mangler nødvendig mat og et trygt sted å bo."
  ],
  [
    "lavinntekt",
    "inntekt under en bestemt grense i statistikken",
    "SSB sammenligner inntekt etter skatt, justert for størrelsen på husholdningen."
  ],
  [
    "median",
    "verdien i midten når tall er sortert",
    "I tallene 2, 3, 4, 7 og 9 er medianen 4."
  ],
  [
    "fordeling",
    "hvordan noe er delt mellom mennesker eller grupper",
    "Et land kan ha høy gjennomsnittsinntekt og en svært ulik fordeling."
  ],
  [
    "råvare",
    "et materiale fra naturen som kan brukes i produksjon",
    "Trevirke kan bli til møbler."
  ],
  [
    "prioritering",
    "å velge hva som skal få mest tid eller ressurser",
    "Et samfunn prioriterer skolebygg før en ny idrettshall."
  ],
  [
    "forventet levealder",
    "beregnet antall leveår ut fra dødeligheten i en bestemt periode",
    "Målet beskriver befolkningen, ikke hvor lenge én bestemt person vil leve."
  ],
  [
    "underskudd",
    "når utgiftene er større enn inntektene i en periode",
    "14 000 kr inn og 14 500 kr ut gir et underskudd på 500 kr."
  ],
  [
    "overskudd",
    "når inntektene er større enn utgiftene i en periode",
    "14 000 kr inn og 13 000 kr ut gir et overskudd på 1 000 kr."
  ],
  [
    "institusjon",
    "regler og organisasjoner som former hvordan samfunnet fungerer",
    "Domstoler og regler for eiendom påvirker økonomiske muligheter."
  ],
  [
    "eksport",
    "varer og tjenester som selges til andre land",
    "En bedrift i Norge selger fisk til et annet land."
  ]
];
const LESSONS=[
  {
    "id": "lk-levekar",
    "nav": "Levekår",
    "title": "Hva betyr gode levekår?",
    "intro": "Levekår handler om flere sider ved livet.",
    "easy": [
      "Levekår er forholdene mennesker lever under. Bolig, helse og trygghet er noen eksempler.",
      "Levestandard handler om ting og tjenester vi har tilgang til. Det kan være bolig, klær og transport.",
      "Livskvalitet er hvordan en person opplever livet sitt. Venner, helse og trygghet kan påvirke denne opplevelsen.",
      "God råd kan gjøre hverdagen lettere. Men penger viser ikke alt om livet til en person."
    ],
    "normal": [
      "Levekår omfatter blant annet bolig, helse, arbeid, utdanning og trygghet. Forholdene virker sammen.",
      "Levestandard handler særlig om materielle goder og tjenester. Inntekt kan gi tilgang til slike goder.",
      "Livskvalitet handler om hvordan mennesker selv opplever livet. Helse, relasjoner og samfunnsforhold kan påvirke opplevelsen.",
      "En person kan ha høy levestandard og likevel oppleve lav livskvalitet. Derfor gir ett mål alene et ufullstendig bilde."
    ],
    "note": "Ikke alle opplever samme situasjon likt. Sammenlign flere sider ved levekår.",
    "words": [
      "levekår",
      "levestandard",
      "livskvalitet",
      "materielle goder"
    ],
    "activity": "dimensions",
    "taskEasy": "Velg to ting som kan påvirke levekår. Forklar kort hvorfor.",
    "task": "Forklar forskjellen mellom levestandard og livskvalitet. Gi et eksempel på at de kan utvikle seg ulikt.",
    "frame": "Levestandard handler om …, mens livskvalitet handler om …",
    "model": "En person kan ha god råd og en trygg bolig, men samtidig føle seg ensom. Levestandarden kan være høy selv om livskvaliteten oppleves som lav.",
    "sources": [
      "fnPoverty",
      "hdi"
    ]
  },
  {
    "id": "lk-fattigdom",
    "nav": "Fattigdom",
    "title": "Hva er fattigdom?",
    "intro": "Fattigdom handler om mangel på ressurser til viktige behov og deltakelse.",
    "easy": [
      "Inntekt er penger du får i en periode. Eiendeler er ting du eier. Gjeld er penger du skylder.",
      "Formue er verdien av det du eier, minus gjelden. Inntekt og formue er altså ulike ting.",
      "Absolutt fattigdom betyr mangel på helt grunnleggende behov. Det kan være mat, klær og et sted å bo.",
      "Relativ fattigdom handler om samfunnet du lever i. Lite penger kan gjøre det vanskelig å delta sammen med andre."
    ],
    "normal": [
      "Inntekt er penger som kommer inn over tid. Eiendeler har verdi, mens gjeld er penger man skylder. Formue er verdien av eiendeler minus gjeld.",
      "Absolutt fattigdom handler om å ikke kunne dekke grunnleggende behov som mat, klær og bolig. Relativ fattigdom vurderes i forhold til samfunnet man lever i.",
      "Relativ fattigdom vurderes i forhold til samfunnet man lever i. Det handler om så begrensede ressurser at rimelig deltakelse blir vanskelig, ikke om alle som tjener under gjennomsnittet.",
      "Statistiske grenser kan hjelpe oss å undersøke fattigdom. En inntektsgrense fanger likevel ikke hele livssituasjonen til hver enkelt."
    ],
    "note": "En person kan ha lav inntekt en periode og samtidig ha eiendeler eller gjeld. Se på hele situasjonen.",
    "words": [
      "inntekt",
      "eiendel",
      "gjeld",
      "relativ fattigdom"
    ],
    "activity": "poverty",
    "taskEasy": "Hva er forskjellen på inntekt og gjeld?",
    "task": "Forklar relativ fattigdom med et eksempel. Hvorfor forteller en inntektsgrense ikke alt om en persons situasjon?",
    "frame": "Relativ fattigdom betyr … Et eksempel kan være …",
    "model": "En familie kan ha for lite penger til å delta i vanlige aktiviteter der den bor. En inntektsgrense gir et signal, men forteller ikke alene om gjeld, eiendeler eller nødvendige utgifter.",
    "sources": [
      "ssbPoverty",
      "fnPoverty"
    ]
  },
  {
    "id": "lk-maling",
    "nav": "Måle og sammenligne",
    "title": "Hvordan måler vi levekår?",
    "intro": "Tall kan vise mønstre, men ulike mål forteller ulike ting.",
    "easy": [
      "En indikator er et mål som viser noe om et forhold. Forventet levealder er ett eksempel.",
      "BNP måler verdiskapingen i et land. BNP per innbygger deler dette på antall mennesker i landet.",
      "Dette gjennomsnittet er ikke inntekten til hver person. Store forskjeller kan skjule seg bak ett tall.",
      "HDI kombinerer helse, utdanning og inntekt per innbygger. Også dette målet viser bare deler av bildet."
    ],
    "normal": [
      "En indikator er et mål som gir informasjon om et forhold. Forventet levealder kan for eksempel si noe om helse.",
      "BNP måler verdiskapingen innenfor et lands grenser i en periode. BNP per innbygger deler dette på befolkningen. Det er et gjennomsnitt, ikke den personlige inntekten til hver innbygger.",
      "HDI kombinerer forventet levealder, utdanning og BNI per innbygger. BNI tar utgangspunkt i BNP og justerer for lønns- og formuesinntekter til og fra utlandet.",
      "Et høyt gjennomsnitt kan skjule store forskjeller. Sammenlign derfor flere indikatorer og undersøk ulikhet innenfor landet."
    ],
    "note": "Verdensbankens internasjonale fattigdomsgrense er 3 internasjonale dollar per person per dag, justert for kjøpekraft med 2021-priser. Den er ett mål, ikke et mål på all fattigdom.",
    "words": [
      "indikator",
      "gjennomsnitt",
      "BNP",
      "HDI"
    ],
    "activity": "indicators",
    "taskEasy": "Hva forteller et gjennomsnitt? Hva forteller det ikke?",
    "task": "Hvorfor kan to land med likt BNP per innbygger ha ulike levekår? Bruk minst én annen indikator.",
    "frame": "BNP per innbygger viser …, men skjuler …",
    "model": "To land kan ha lik produksjon per innbygger i gjennomsnitt, men ulik fordeling og ulik forventet levealder. Derfor trenger vi flere indikatorer.",
    "sources": [
      "hdi",
      "hdiData",
      "nationalAccounts"
    ]
  },
  {
    "id": "lk-historie",
    "nav": "Historiske spor",
    "title": "Hvordan påvirker historien levekår?",
    "intro": "Levekår i dag er knyttet til mange historiske prosesser.",
    "easy": [
      "Historiske hendelser kan påvirke mulighetene i dag. Vi trenger flere forklaringer på hvorfor land har ulike levekår.",
      "Kolonialisme betyr at en stat tar kontroll over andre områder og mennesker. Kolonimakter hentet blant annet ut råvarer og brukte lokal arbeidskraft.",
      "Industrialisering gjorde maskiner og fabrikker viktigere. Det ga nye jobber, men også vanskelige arbeidsforhold.",
      "Norge hadde industri, skipsfart og handel før oljeinntektene kom. Naturressurser, kunnskap og politiske valg har også hatt betydning."
    ],
    "normal": [
      "Dagens forskjeller har ofte lange og sammensatte historiske røtter. Krig, politiske valg, handel og teknologisk utvikling har virket ulikt fra sted til sted.",
      "Kolonialisme innebar kontroll over andre områder og mennesker. Utvinning og handel kunne gi kolonimakten store verdier, mens lokale samfunn kunne miste ressurser og selvbestemmelse.",
      "Noen steder ble infrastruktur bygd for å frakte råvarer til eksport. Følgene var ulike, og historien alene bestemmer ikke et samfunns framtid.",
      "Industrialisering endret arbeid og produksjon. Norges velstand har vokst fram gjennom flere forhold, blant annet naturressurser, arbeid, institusjoner, handel og etter hvert oljeinntekter."
    ],
    "note": "Unngå å forklare et lands situasjon med én hendelse eller én årsak.",
    "words": [
      "kolonialisme",
      "industrialisering",
      "infrastruktur",
      "handel"
    ],
    "activity": "history",
    "taskEasy": "Nevn én måte historiske hendelser kan påvirke et samfunn på.",
    "task": "Forklar hvordan kolonialisme og industrialisering kan ha påvirket levekår ulikt. Hvorfor er én årsak sjelden nok?",
    "frame": "En historisk prosess var … Den kan ha påvirket …",
    "model": "En kolonimakt kunne bygge en jernbane for å frakte råvarer til eksport. Den kunne lette transport, men ble ikke nødvendigvis bygd for å dekke lokale behov.",
    "sources": [
      "fnPoverty",
      "norwayHistory",
      "povertyCauses"
    ]
  },
  {
    "id": "lk-geografi",
    "nav": "Sted og muligheter",
    "title": "Hvorfor betyr stedet noe?",
    "intro": "Natur, samfunn og politiske valg påvirker mulighetene der mennesker bor.",
    "easy": [
      "En naturressurs er noe fra naturen vi kan bruke. Fisk, skog og olje er eksempler.",
      "Ressurser kan gi arbeid og inntekter. Det betyr også noe hvem som eier dem og får inntektene.",
      "Veier, strømnett og internett kalles infrastruktur. De kan gjøre det lettere å nå skole, arbeid og helsetjenester.",
      "Krig, sykdom og klimaendringer kan gjøre livet vanskeligere. Stedet alene bestemmer likevel ikke hvordan mennesker lever."
    ],
    "normal": [
      "Naturressurser kan gi arbeid og inntekter, men er ingen garanti for gode levekår. Fordeling, myndighetenes valg og hvordan ressursene brukes, har betydning.",
      "Infrastruktur som veier, strøm og internett kan gi tilgang til markeder, skole og helsetjenester. Handel og lokal verdiskaping kan skape arbeidsplasser og inntekter.",
      "Krig, sykdom og klimaendringer kan skade livsgrunnlag og gjøre utvikling vanskeligere. Mennesker og samfunn kan samtidig finne ulike løsninger og tilpasse seg.",
      "Sted gir muligheter og utfordringer, men avgjør ikke alene hvordan mennesker lever. Historie, økonomi og politikk virker sammen med naturforhold."
    ],
    "note": "Ikke anta at alle mennesker i et land eller en verdensdel lever på samme måte.",
    "words": [
      "naturressurs",
      "infrastruktur",
      "verdiskaping",
      "handel"
    ],
    "activity": "geography",
    "taskEasy": "Velg en naturressurs. Hvordan kan mennesker bruke den?",
    "task": "Forklar hvorfor naturressurser ikke automatisk gir gode levekår. Bruk to forhold i svaret.",
    "frame": "Naturressurser kan …, men resultatet påvirkes også av …",
    "model": "Skog kan gi arbeid og inntekter. Om folk får nytte av verdiene, påvirkes også av eierskap, arbeidsvilkår og hvordan inntektene brukes.",
    "sources": [
      "povertyCauses",
      "fnPoverty"
    ]
  },
  {
    "id": "lk-utdanning",
    "nav": "Skole og arbeid",
    "title": "Hvilke muligheter gir skole og arbeid?",
    "intro": "Utdanning kan åpne dører, men mulighetene avhenger også av samfunnet.",
    "easy": [
      "Utdanning gir kunnskap og ferdigheter. Det kan gi flere muligheter til å delta i samfunnet.",
      "En kvalifikasjon kan være utdanning eller erfaring for en jobb. Det må også finnes arbeid som passer.",
      "Utdanning kan gjøre det lettere å få arbeid. Den er ikke en garanti for jobb eller høy lønn.",
      "Diskriminering betyr usaklig forskjellsbehandling. Det kan hindre noen i å bruke kunnskapen sin."
    ],
    "normal": [
      "Utdanning kan gi kunnskap, ferdigheter og kvalifikasjoner som åpner muligheter i arbeidslivet. Den kan også gi større mulighet til å delta i samfunnet.",
      "Utdanning gir ikke automatisk jobb eller høy inntekt. Tilgang på arbeid, kvalifikasjonskrav og anerkjennelse av utdanning har også betydning.",
      "Diskriminering og dårlig helse kan hindre mennesker i å bruke kompetansen sin. Omsorgsansvar, transport og økonomi kan også påvirke valgene deres.",
      "Samfunnet kan gjøre mulighetene bedre gjennom tilgang til utdanning og arbeid. Fattigdom kan ikke forklares som en enkelt persons mangel på innsats."
    ],
    "note": "En utdanning kan øke mulighetene uten å garantere et bestemt resultat.",
    "words": [
      "utdanning",
      "kvalifikasjon",
      "diskriminering",
      "ulikhet"
    ],
    "activity": "opportunities",
    "taskEasy": "Nevn én mulighet utdanning kan gi, og ett hinder for å få jobb.",
    "task": "Forklar hvorfor utdanning kan være viktig, men ikke er en garanti for arbeid. Drøft to hindringer.",
    "frame": "Utdanning kan … Samtidig kan … gjøre det vanskeligere å …",
    "model": "Et fagbrev kan gi kompetanse arbeidsgivere trenger. Likevel kan det være få ledige jobber der personen bor, eller en søker kan møte diskriminering.",
    "sources": [
      "inequality",
      "povertyCauses"
    ]
  },
  {
    "id": "lk-forbruk",
    "nav": "Forbruk og livskvalitet",
    "title": "Valg i hverdagen",
    "intro": "Forbruk kan dekke behov og påvirke økonomi, livskvalitet og miljø.",
    "easy": [
      "Forbruk er å bruke varer og tjenester. Mat, strøm og transport er eksempler.",
      "Et budsjett er en plan for inntekter og utgifter. Det kan gi oversikt over pengene.",
      "Noen utgifter er vanskelige å kutte. Mat og bolig koster penger selv med et stramt budsjett.",
      "Forbruk påvirker både livet vårt og miljøet. Reparasjon og gjenbruk kan spare ressurser."
    ],
    "normal": [
      "Forbruk er bruk av varer og tjenester. Mat, bolig, transport og fritid dekker ulike behov og kan påvirke livskvaliteten.",
      "Et budsjett er en plan for inntekter og utgifter. Det kan gi oversikt over hva en husholdning har råd til, og hva den må prioritere.",
      "Produksjon og bruk av varer krever ressurser og kan belaste miljøet. Reparasjon, gjenbruk og mindre avfall kan redusere belastningen i noen tilfeller.",
      "Muligheten til å velge er ulikt fordelt. Småsparing kan hjelpe noen med oversikt, men løser ikke fattigdom når inntekten ikke dekker nødvendige utgifter."
    ],
    "note": "Et budsjett er et verktøy, ikke en forklaring på hvorfor noen har dårlig råd.",
    "words": [
      "forbruk",
      "budsjett",
      "inntekt",
      "livskvalitet"
    ],
    "activity": "budget",
    "taskEasy": "Skriv to utgifter som kan stå i et budsjett.",
    "task": "En husholdning må prioritere mellom flere behov. Forklar hvordan et budsjett kan hjelpe, og hvorfor det ikke alltid er nok.",
    "frame": "Et budsjett kan hjelpe ved å … Det er likevel ikke nok dersom …",
    "model": "Et budsjett viser hvor mye som går til husleie og mat. Dersom inntekten er lavere enn nødvendige utgifter, trengs også andre løsninger.",
    "sources": [
      "udir",
      "consumption",
      "ssbPoverty"
    ]
  },
  {
    "id": "lk-tiltak",
    "nav": "Tiltak og kilder",
    "title": "Hva kan redusere fattigdom og ulikhet?",
    "intro": "Tiltak krever valg, og påstander må undersøkes kritisk.",
    "easy": [
      "Et tiltak er en handling som skal endre noe. Skole, helsetjenester og økonomisk støtte kan være tiltak.",
      "Tiltak koster penger og krever prioriteringer. Hvem får hjelp, og hvem betaler?",
      "Land kan også samarbeide om handel, utdanning og utvikling. Flere tiltak kan virke sammen.",
      "Sjekk kilden: Hvem laget tallene, og når? Undersøk også hva tallene måler."
    ],
    "normal": [
      "Myndigheter kan bruke tiltak som utdanning, helsetjenester, sosiale støtteordninger og arbeidsmarkedspolitikk. Samarbeid mellom land kan blant annet støtte helse, handel og utdanning.",
      "Tiltak kan hjelpe ulike grupper på ulike måter. De koster ressurser, og penger brukt på ett område kan begrense andre prioriteringer.",
      "Et tiltak kan også ha ulemper eller virke annerledes enn planlagt. Derfor bør vi spørre hvem som får hjelp, hvem som betaler, og om resultatene blir undersøkt.",
      "Bruk kildekritikk når du sammenligner tall: Sjekk hvem som står bak, hvilket år og hvilken enhet tallene gjelder, og hvordan de er målt. Ulike metoder kan gi ulike resultater."
    ],
    "note": "Sammenlign tall bare når år, enhet og metode passer til spørsmålet.",
    "words": [
      "tiltak",
      "kildekritikk",
      "indikator",
      "ulikhet"
    ],
    "activity": "measures",
    "taskEasy": "Nevn ett tiltak mot fattigdom. Hvem kan tiltaket hjelpe?",
    "task": "Foreslå ett tiltak og drøft en mulig fordel og en mulig ulempe. Hvilken informasjon trenger du for å vurdere om tiltaket virker?",
    "frame": "Et mulig tiltak er … Fordelen kan være … En ulempe kan være …",
    "model": "Gratis skolemat kan hjelpe elever som ellers ikke får nok mat i løpet av skoledagen. Tiltaket koster penger. Vi kan undersøke hvem som nås, og hvordan tiltaket påvirker skolehverdagen.",
    "sources": [
      "inequality",
      "sustainable",
      "udir"
    ]
  }
];
const STATIONS=[{id:'start',nav:'Start'},{id:'ord',nav:'Ord'},...LESSONS,{id:'vis',nav:'Vis hva du kan'}];
const EVENTS=[];
