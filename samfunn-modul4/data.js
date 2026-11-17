'use strict';
const SOURCES={
  "udir": {
    "title": "Udir · Samfunnsfag FOV, modul 4",
    "url": "https://www.udir.no/lk20/saf03-01/kompetansemaal-og-vurdering/kv833",
    "note": "Kompetansemål og vurdering. Løpet dekker deler av modul 4."
  },
  "ww1": {
    "title": "National Army Museum · First World War",
    "url": "https://www.nam.ac.uk/explore/first-world-war",
    "note": "Oversikt over første verdenskrig, allianser, krigføring og følger."
  },
  "causes": {
    "title": "Imperial War Museums · How the World Went to War in 1914",
    "url": "https://www.iwm.org.uk/history/how-the-world-went-to-war-in-1914",
    "note": "Bakgrunnen for krigsutbruddet i 1914."
  },
  "rise": {
    "title": "USHMM · The Nazi Rise to Power",
    "url": "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power",
    "note": "Økonomisk krise, politiske valg og demokratiets sammenbrudd."
  },
  "ww2": {
    "title": "National Army Museum · Second World War",
    "url": "https://www.nam.ac.uk/explore/second-world-war",
    "note": "Oversikt over krigen i Europa og Asia."
  },
  "europe": {
    "title": "USHMM · World War II in Europe",
    "url": "https://encyclopedia.ushmm.org/content/en/article/world-war-ii-in-europe",
    "note": "Angrepet på Polen og hovedtrekk ved krigen i Europa."
  },
  "holocaust": {
    "title": "USHMM · Introduction to the Holocaust",
    "url": "https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust",
    "note": "Dokumentasjon av forfølgelsen og folkemordet på Europas jøder."
  },
  "norway": {
    "title": "Universitetet i Oslo · Holocaust i Norge",
    "url": "https://www.norgeshistorie.no/aktuelt/dagsaktuelle-tema/holocaust-i-norge.html",
    "note": "Norsk deltakelse, forfølgelse, deportasjon og flukt."
  },
  "cold": {
    "title": "Library of Congress · The Soviet Union and the United States",
    "url": "https://www.loc.gov/exhibits/archives/sovi.html",
    "note": "Arkivmateriale om forholdet mellom USA og Sovjetunionen."
  },
  "berlin": {
    "title": "Bundeszentrale für politische Bildung · Mauerbau",
    "url": "https://www.bpb.de/themen/deutsche-teilung/60-jahre-mauerbau/",
    "note": "DDR, byggingen av Berlinmuren og grensepolitikken."
  },
  "cuba": {
    "title": "Office of the Historian · The Cuban Missile Crisis, 1962",
    "url": "https://history.state.gov/milestones/1961-1968/cuban-missile-crisis",
    "note": "USAs utenrikshistoriske framstilling. Les også med blikk for avsender."
  },
  "truman": {
    "title": "National Archives · Truman Doctrine (1947)",
    "url": "https://www.archives.gov/milestone-documents/truman-doctrine",
    "note": "Primærkilde: Trumans tale til Kongressen 12. mars 1947."
  },
  "warsaw": {
    "title": "Yale, Avalon Project · Warsaw Pact (1955)",
    "url": "https://avalon.law.yale.edu/20th_century/warsaw.asp",
    "note": "Primærkilde: traktaten 14. mai 1955, særlig innledningen."
  },
  "un": {
    "title": "FN · Verdenserklæringen om menneskerettighetene",
    "url": "https://www.un.org/en/about-us/universal-declaration-of-human-rights/",
    "note": "Primærkilde: vedtatt i 1948. Erklæringen er ikke i seg selv en bindende traktat."
  },
  "charter": {
    "title": "FN · FN-pakten, artikkel 1",
    "url": "https://legal.un.org/repertory/art1.shtml",
    "note": "Primærkilde: formålene med FN, blant annet internasjonal fred og sikkerhet."
  },
  "nato": {
    "title": "NATO · A short history of NATO",
    "url": "https://www.nato.int/en/about-us/nato-history/a-short-history-of-nato",
    "note": "NATOs egen framstilling av alliansens historie. Avsenderen er en part i historien."
  },
  "donau": {
    "title": "HL-senteret · Deportasjonen fra Oslo",
    "url": "https://www.hlsenteret.no/utstillinger/qr/gormley/english.html",
    "note": "Minnesmerke og historisk bakgrunn. Donau forlot Oslo 26. november 1942."
  },
  "pst": {
    "title": "PST · Radikalisering",
    "url": "https://www.pst.no/kunnskapsbank/pa-hvilken-mate-trues-norge/politisk-motivert-vold/radikalisering/",
    "note": "Definisjon og forklaring. PST er en sikkerhetstjeneste med et forebyggende samfunnsoppdrag."
  },
  "juli": {
    "title": "22. juli-senteret · Årsaker til terroren",
    "url": "https://www.22julisenteret.no/no/undervisning/undervisningsopplegg/8-trinn-vg3/arsaker-til-terroren-22-juli",
    "note": "Flere årsaker må undersøkes. Utviklingen mot terror var ikke forutbestemt."
  },
  "ukraina": {
    "title": "FN · Resolusjon ES-11/1 om Ukraina",
    "url": "https://digitallibrary.un.org/record/3965290/",
    "note": "Primærkilde: vedtatt 2. mars 2022. Dokumenterer vedtaket på den datoen, ikke dagens situasjon."
  },
  "cubaPhoto": {
    "title": "National Archives · Flyfoto fra Cuba, 1962",
    "url": "https://www.archives.gov/milestone-documents/aerial-photograph-of-missiles-in-cuba",
    "note": "Faktisk historisk flyfoto med arkivopplysninger. Sammenlignes med en KI-illustrasjon i kildeverkstedet."
  }
};
const WORDS=[
  [
    "konflikt",
    "En motsetning mellom personer, grupper eller stater.",
    "En konflikt kan løses uten krig."
  ],
  [
    "årsak",
    "Noe som bidrar til at noe skjer.",
    "Kapprustning var en årsak til økt spenning."
  ],
  [
    "utløsende hendelse",
    "Hendelsen som setter et forløp i gang.",
    "Attentatet i Sarajevo utløste en internasjonal krise."
  ],
  [
    "konsekvens",
    "En følge av noe som har skjedd.",
    "Ødelagte hjem er en konsekvens av krig."
  ],
  [
    "allianse",
    "Et samarbeid der land støtter hverandre.",
    "En militærallianse kan avtale felles forsvar."
  ],
  [
    "nasjonalisme",
    "Ideer som setter nasjonen og nasjonalt fellesskap i sentrum.",
    "Nasjonalisme kan samle mennesker, men også stenge andre ute."
  ],
  [
    "imperialisme",
    "Når en stat utvider makten sin over andre land og folk.",
    "Europeiske stater konkurrerte om kolonier."
  ],
  [
    "kapprustning",
    "Når stater konkurrerer om å få flere eller sterkere våpen.",
    "USA og Sovjetunionen utviklet stadig flere atomvåpen."
  ],
  [
    "ideologi",
    "Ideer om hvordan samfunnet bør styres og organiseres.",
    "Fascisme og kommunisme er ulike ideologier."
  ],
  [
    "demokrati",
    "Et styresett med folkestyre, frie valg og rettigheter.",
    "I et demokrati skal opposisjonen kunne kritisere makten."
  ],
  [
    "diktatur",
    "Et styresett der makten er samlet og opposisjonen undertrykkes.",
    "Et diktatur mangler frie og reelle valg om makten."
  ],
  [
    "propaganda",
    "Budskap som prøver å påvirke holdninger i en bestemt retning.",
    "Propaganda kan bruke både sanne og falske opplysninger."
  ],
  [
    "okkupasjon",
    "Når en fremmed makt tar kontroll over et område med militærmakt.",
    "Tyskland okkuperte Norge under andre verdenskrig."
  ],
  [
    "sivil",
    "En person som ikke er medlem av de væpnede styrkene.",
    "Sivile kan miste hjemmene sine i en krig."
  ],
  [
    "antisemittisme",
    "Fordommer, fiendtlighet eller hat mot jøder.",
    "Nazismen bygde på ekstrem antisemittisme."
  ],
  [
    "folkemord",
    "Å prøve å ødelegge en folkegruppe helt eller delvis.",
    "Holocaust var et folkemord på Europas jøder."
  ],
  [
    "holocaust",
    "Nazistenes og deres medhjelperes folkemord på Europas jøder.",
    "Omtrent seks millioner jøder ble drept."
  ],
  [
    "supermakt",
    "En stat med svært stor militær, økonomisk og politisk makt.",
    "USA og Sovjetunionen var supermakter under den kalde krigen."
  ],
  [
    "stedfortrederkrig",
    "Krig der stormakter støtter ulike parter uten først og fremst å krige direkte mot hverandre.",
    "I Koreakrigen støttet USA Sør-Korea. Sovjetunionen støttet Nord-Korea."
  ],
  [
    "kilde",
    "Noe vi bruker for å få kunnskap om et spørsmål.",
    "Et brev, et bilde og en historiebok kan være kilder."
  ],
  [
    "perspektiv",
    "Et ståsted som påvirker hva man legger merke til og framhever.",
    "En statsleder og en flyktning kan framheve ulike sider ved samme hendelse."
  ],
  [
    "menneskerettigheter",
    "Grunnleggende rettigheter som alle mennesker har.",
    "Mennesker har rettigheter uansett bakgrunn."
  ],
  [
    "diplomati",
    "Kontakt og forhandlinger mellom stater.",
    "Diplomati kan dempe en konflikt."
  ],
  [
    "algoritme",
    "Regler et datasystem følger for å løse en oppgave.",
    "En anbefalingsalgoritme velger hvilke videoer du får se."
  ],
  [
    "sentralmakter",
    "En gruppe land under første verdenskrig. Tyskland og Østerrike-Ungarn var blant dem.",
    "Sentralmaktene kjempet mot ententemaktene."
  ],
  [
    "ententemakter",
    "En gruppe land under første verdenskrig. Frankrike, Storbritannia og Russland var viktige medlemmer.",
    "Flere land kjempet på ententemaktenes side."
  ],
  [
    "skyttergrav",
    "En grøft soldater bruker som beskyttelse i krig.",
    "På vestfronten levde soldatene ofte i skyttergraver."
  ],
  [
    "krigserstatninger",
    "Penger et land må betale for skader etter en krig.",
    "Versaillestraktaten stilte krav om tyske krigserstatninger."
  ],
  [
    "rikskansler",
    "Navnet på stillingen som regjeringssjef i Tyskland i denne perioden.",
    "Hitler ble utnevnt til rikskansler i 1933."
  ],
  [
    "aksemakter",
    "Tyskland, Italia og Japan og deres samarbeidspartnere under andre verdenskrig.",
    "Aksemaktene kjempet mot de allierte."
  ],
  [
    "allierte",
    "Land som samarbeider i en konflikt eller krig.",
    "USA og Sovjetunionen ble allierte mot aksemaktene."
  ],
  [
    "marineblokade",
    "Krigsskip prøver å stanse eller kontrollere skipstrafikk til et område.",
    "USA brukte en marineblokade under Cubakrisen."
  ],
  [
    "planøkonomi",
    "Staten bestemmer mye av det som skal produseres, og hvordan ressurser skal brukes.",
    "Sovjetunionen hadde planøkonomi."
  ],
  [
    "ettpartidiktatur",
    "Ett parti styrer alene. Andre kan ikke fritt konkurrere om makten.",
    "Sovjetunionen var et ettpartidiktatur."
  ],
  [
    "rettslig bindende",
    "Noe som gir plikter etter lov eller en bindende avtale.",
    "En traktat kan gi land rettslig bindende plikter."
  ],
  [
    "erklæring",
    "Et dokument som uttrykker et standpunkt eller mål. Det er ikke nødvendigvis en bindende avtale.",
    "FN vedtok en menneskerettighetserklæring i 1948."
  ],
  [
    "traktat",
    "En bindende avtale mellom land.",
    "FN-pakten er en traktat."
  ],
  [
    "radikalisering mot vold",
    "En prosess der en person begynner å godta eller støtte vold for politiske eller religiøse mål.",
    "En person kan begynne å forsvare vold. Det betyr ikke at personen sikkert vil utføre terror."
  ],
  [
    "terror",
    "Alvorlig vold eller trusler som skal skape frykt eller presse fram politiske eller religiøse mål.",
    "Angrepene i Norge 22. juli 2011 var terror."
  ],
  [
    "forebygge",
    "Å prøve å hindre at noe skadelig skjer.",
    "Vern av rettigheter kan bidra til å forebygge overgrep."
  ],
  [
    "invasjon",
    "Når militære styrker går inn i et annet land for å bruke makt.",
    "Russland startet en fullskala invasjon av Ukraina i 2022."
  ],
  [
    "resolusjon",
    "Et vedtak fra en organisasjon eller forsamling.",
    "FNs generalforsamling vedtok en resolusjon om Ukraina i mars 2022."
  ]
];
const EVENTS=[
  {
    "year": "1914",
    "title": "Første verdenskrig begynner",
    "text": "En krise etter attentatet i Sarajevo utvikler seg til storkrig. Langvarige spenninger og politiske valg bidrar.",
    "id": "ww1"
  },
  {
    "year": "1918",
    "title": "Våpenhvile",
    "text": "Kampene på vestfronten stanser 11. november. Krigen har endret samfunn og maktforhold.",
    "id": "ww1"
  },
  {
    "year": "1919",
    "title": "Versaillestraktaten",
    "text": "Tyskland må godta tap av land, begrenset militærmakt og krigserstatninger. Fredsordningen møter sterk motstand.",
    "id": "mellomkrig"
  },
  {
    "year": "1933",
    "title": "Hitler blir rikskansler",
    "text": "Hitler blir utnevnt til regjeringssjef. Nazistene avvikler demokratiet og bygger et diktatur.",
    "id": "mellomkrig"
  },
  {
    "year": "1939",
    "title": "Andre verdenskrig begynner i Europa",
    "text": "Tyskland angriper Polen 1. september. Storbritannia og Frankrike erklærer Tyskland krig.",
    "id": "ww2"
  },
  {
    "year": "1942",
    "title": "26. november: Donau forlater Oslo",
    "text": "Jøder fra Norge blir deportert med Donau og sendt videre til Auschwitz. Norske myndigheter og politi deltar i forfølgelsen.",
    "id": "holocaust"
  },
  {
    "year": "1945",
    "title": "Verdenskrigen slutter",
    "text": "Tyskland kapitulerer i mai. Japan kapitulerer senere samme år. FN blir opprettet.",
    "id": "ww2"
  },
  {
    "year": "1949",
    "title": "To tyske stater og NATO",
    "text": "Vest-Tyskland og Øst-Tyskland blir opprettet. NATO dannes, med Norge som ett av medlemslandene.",
    "id": "kaldkrig"
  },
  {
    "year": "1961",
    "title": "Berlinmuren bygges",
    "text": "Østtyske myndigheter stenger grensen mot Vest-Berlin for å stanse flukten fra DDR.",
    "id": "kriser"
  },
  {
    "year": "1962",
    "title": "Cubakrisen",
    "text": "Sovjetiske atomraketter på Cuba utløser en farlig konflikt med USA. Forhandlinger avverger krig.",
    "id": "kriser"
  },
  {
    "year": "1989",
    "title": "Berlinmuren åpnes",
    "text": "Protester, reformer og svekket kontroll endrer Øst-Europa. Grenseovergangene i Berlin åpnes 9. november.",
    "id": "kaldkrig"
  },
  {
    "year": "1991",
    "title": "Sovjetunionen oppløses",
    "text": "Sovjetunionen går i oppløsning. Den kalde krigen regnes vanligvis som avsluttet rundt 1989–1991.",
    "id": "kaldkrig"
  },
  {
    "year": "2011",
    "title": "Terroren 22. juli",
    "text": "Et høyreekstremt angrep rammer Regjeringskvartalet og AUFs sommerleir på Utøya. Vi undersøker årsaker, følger og forebygging.",
    "id": "idag"
  },
  {
    "year": "2022",
    "title": "Invasjon og et FN-vedtak",
    "text": "Russland innleder fullskala invasjon 24. februar. FNs generalforsamling krever tilbaketrekking 2. mars. Dette er et datert kildecase.",
    "id": "idag"
  }
];
const LESSONS=[
  {
    "id": "aarsaker",
    "nav": "Konflikt",
    "title": "Hvorfor oppstår konflikter?",
    "intro": "Skill mellom årsak, utløsende hendelse og konsekvens.",
    "easy": [
      "En <strong>konflikt</strong> er en motsetning mellom mennesker, grupper eller land. De kan være uenige om makt, land eller ressurser. En konflikt kan løses med samtaler. Den trenger ikke bli til krig.",
      "En <strong>årsak</strong> bidrar til at noe skjer. Flere årsaker kan virke sammen. En <strong>utløsende hendelse</strong> setter en krise i gang. En <strong>konsekvens</strong> er en følge av det som skjer.",
      "Før første verdenskrig konkurrerte flere land om makt og kolonier. Land bygde også flere våpen. De laget <strong>allianser</strong>, altså avtaler om å støtte hverandre. Lederne tok valg. Krigen var ikke bestemt på forhånd."
    ],
    "normal": [
      "Konflikter oppstår når interesser, verdier eller mål står mot hverandre. Strid om territorium, ressurser og politisk makt kan virke sammen med frykt og ideologi. Konflikt betyr ikke nødvendigvis vold: forhandlinger og politiske institusjoner kan håndtere motsetninger.",
      "Historikere skiller gjerne mellom <strong>langsiktige årsaker</strong> og en <strong>utløsende hendelse</strong>. Før 1914 bidro imperialisme, nasjonalisme, allianser og kapprustning til spenninger. Attentatet i Sarajevo utløste krisen, men forklarer ikke alene hvorfor den ble til verdenskrig.",
      "En forklaring må også vise hvordan noe virket: En allianse kunne gjøre at flere stater ble trukket inn. Samtidig var ikke krig automatisk. Myndighetenes valg, feilvurderinger og beslutninger om mobilisering fikk betydning."
    ],
    "note": "Én hendelse er sjelden hele forklaringen.",
    "words": [
      "årsak",
      "utløsende hendelse",
      "konsekvens",
      "allianse"
    ],
    "activity": "causes",
    "task": "Forklar forskjellen på en årsak og en utløsende hendelse. Bruk første verdenskrig som eksempel.",
    "frame": "En langsiktig årsak var … Dette økte spenningen fordi … Den utløsende hendelsen var …",
    "model": "Allianser var en langsiktig årsak. De knyttet flere stater til hverandre og kunne spre en krig. Attentatet i Sarajevo var den utløsende hendelsen som startet krisen i 1914. Flere beslutninger måtte til før krisen ble til storkrig.",
    "sources": [
      "causes",
      "ww1"
    ],
    "taskEasy": "Hva er en årsak? Hva er en utløsende hendelse? Bruk et historisk eksempel."
  },
  {
    "id": "ww1",
    "nav": "1. verdenskrig",
    "title": "Første verdenskrig",
    "intro": "1914–1918 · Fra internasjonal krise til verdenskrig.",
    "easy": [
      "I 1914 ble en tronfølger drept i Sarajevo. Han skulle bli keiser i Østerrike-Ungarn. Landet gikk til krig mot Serbia. Flere land ble trukket inn.",
      "Tyskland og Østerrike-Ungarn kjempet på samme side. Gruppen ble kalt <strong>sentralmaktene</strong>. Frankrike, Storbritannia og Russland kjempet på den andre siden. Gruppen ble kalt <strong>ententemaktene</strong>. Flere land ble med senere.",
      "På vestfronten kjempet soldatene ofte fra grøfter. De kalles <strong>skyttergraver</strong>. Våpen gjorde angrep svært farlige. Krigen rammet også andre verdensdeler. Koloniene bidro med soldater og ressurser.",
      "Krigen sluttet i 1918. Flere keiserriker brøt sammen. Land fikk nye grenser. Fredsavtalen i Versailles kom i 1919. Tyskland fikk strenge vilkår. Mange var misfornøyde med freden."
    ],
    "normal": [
      "Første verdenskrig begynte i 1914 etter en internasjonal krise utløst av attentatet i Sarajevo. Østerrike-Ungarns krig mot Serbia og stormaktenes mobilisering og krigserklæringer gjorde krisen til en større krig. Tyskland og Østerrike-Ungarn sto sentralt blant sentralmaktene; Frankrike, Storbritannia og Russland blant ententemaktene.",
      "Krigen var global. Europeiske imperier brukte kolonienes soldater, arbeid og ressurser, og det ble kjempet i blant annet Afrika og Midtøsten. Skyttergravskrigen preget særlig vestfronten. Andre fronter var mer bevegelige. Industrien gjorde det mulig å produsere enorme mengder våpen.",
      "I 1917 gikk USA inn i krigen, mens revolusjon i Russland bidro til at Russland senere trakk seg ut. I 1918 ble sentralmaktene beseiret. Krigen bidro til sammenbrudd i det tyske, østerriksk-ungarske, russiske og osmanske keiserriket. Fredsordningen skapte nye stater, men også nye motsetninger."
    ],
    "note": "Verdenskrig betyr mer enn krig i Europa. Kolonier og befolkninger utenfor Europa var også en del av historien.",
    "words": [
      "sentralmakter",
      "ententemakter",
      "skyttergrav",
      "allianse"
    ],
    "activity": "timeline",
    "task": "Velg én årsak til første verdenskrig. Forklar hvordan den kunne gjøre en krig større. Nevn også én konsekvens.",
    "frame": "En årsak var … Den kunne gjøre krigen større fordi … En konsekvens var …",
    "model": "Alliansene bandt stater sammen. Da noen stater gikk til krig, kunne andre bli trukket inn for å støtte sine samarbeidspartnere. En konsekvens var at flere keiserriker brøt sammen.",
    "sources": [
      "ww1",
      "causes"
    ],
    "taskEasy": "Velg én årsak til første verdenskrig. Hvordan virket den? Skriv også én følge."
  },
  {
    "id": "mellomkrig",
    "nav": "Mellomkrigstiden",
    "title": "En vanskelig fred",
    "intro": "1919–1939 · Økonomisk krise, ideologier og politiske valg.",
    "easy": [
      "Fredsavtalen i Versailles stilte strenge krav til Tyskland. Landet måtte gi fra seg områder. Det måtte også betale <strong>krigserstatninger</strong>, altså penger etter krigen. Mange tyskere mente avtalen var urettferdig.",
      "Fra 1929 rammet en stor økonomisk krise. Mange mistet arbeidet. Nazistene lovet arbeid og et sterkt Tyskland. De brukte propaganda, vold og falske fiendebilder. De la blant annet skylden på jødene.",
      "Hitler ble utnevnt til regjeringssjef i 1933. Stillingen het <strong>rikskansler</strong>. Han ble ikke valgt til diktator. Andre politikere hjalp ham til makten. Nazistene fjernet demokratiet og bygde et diktatur.",
      "Krise og misnøye forklarer ikke alt. Mennesker tok valg. En ny krig var ikke bestemt på forhånd."
    ],
    "normal": [
      "Versaillestraktaten skapte sterk tysk misnøye gjennom territorielle tap, militære begrensninger og krigserstatninger. Den økonomiske verdenskrisen fra 1929 svekket tilliten til demokratiske myndigheter og økte oppslutningen om ytterliggående partier. Men verken traktaten eller krisen gjorde nazismen eller en ny krig uunngåelig.",
      "Nazismen kombinerte diktatur, aggressiv nasjonalisme, rasisme og antisemittisme. Nazistene brukte propaganda, vold og konspirasjonsfortellinger for å mobilisere støtte og peke ut fiender. Hitler ble <strong>utnevnt</strong> til rikskansler i januar 1933. Han ble ikke valgt til diktator av et flertall i et fritt valg.",
      "Konservative makthavere bidro til utnevnelsen. Deretter avviklet nazistene demokratiet ved å kombinere lovendringer, tvang og vold. Politiske motstandere ble undertrykt, og jøder ble fratatt rettigheter. For å forstå utviklingen må vi undersøke både samfunnsforhold, ideologi og aktørenes ansvar."
    ],
    "note": "Økonomisk krise kan svekke tillit. Den fører ikke automatisk til diktatur eller krig.",
    "words": [
      "krigserstatninger",
      "rikskansler",
      "diktatur",
      "propaganda"
    ],
    "activity": "ideology",
    "task": "Hvordan kunne økonomisk krise og propaganda svekke demokratiet? Forklar med ett eksempel fra mellomkrigstiden.",
    "frame": "Da mange mistet arbeidet, … Nazistene brukte propaganda til å … Dette kunne svekke demokratiet fordi …",
    "model": "Arbeidsledighet og utrygghet kunne gjøre at flere mistet tilliten til myndighetene. Nazistene lovet enkle løsninger og brukte falske fiendebilder. Sammen med vold og politiske beslutninger bidro dette til at de kunne bygge et diktatur.",
    "sources": [
      "rise",
      "ww2"
    ],
    "taskEasy": "Hvordan kunne krise og propaganda svekke demokratiet? Bruk ett eksempel."
  },
  {
    "id": "ww2",
    "nav": "2. verdenskrig",
    "title": "Andre verdenskrig",
    "intro": "1939–1945 · Angrepskrig, okkupasjon og sivile liv.",
    "easy": [
      "Tyskland angrep Polen 1. september 1939. Da begynte andre verdenskrig i Europa. Storbritannia og Frankrike erklærte Tyskland krig. Sovjetunionen angrep Polen fra øst senere samme måned. Japan førte allerede krig i Kina.",
      "Tyskland, Italia og Japan var <strong>aksemaktene</strong>. Storbritannia, Sovjetunionen og USA ble viktige <strong>allierte</strong>. Det betyr at de samarbeidet mot aksemaktene. USA og Sovjetunionen ble med i denne kampen i 1941.",
      "Norge ble angrepet 9. april 1940. Tyskland tok kontroll over landet med militærmakt. Norge var <strong>okkupert</strong> til 1945.",
      "Krigen rammet sivile hardt. Mange mistet hjemmene sine eller måtte flykte. Mennesker ble forfulgt og drept. Tyskland overga seg i mai 1945. Japan overga seg senere samme år."
    ],
    "normal": [
      "Andre verdenskrig i Europa begynte med Tysklands angrep på Polen 1. september 1939. Den tysk-sovjetiske ikkeangrepspakten hadde en hemmelig avtale om interessesfærer. Sovjetunionen invaderte Polen fra øst 17. september. Krigen må også forstås globalt: Japans krig i Kina hadde allerede pågått i flere år.",
      "Nazistisk ekspansjon og erobring sto sentralt. Tyskland okkuperte store områder og angrep Sovjetunionen i 1941. Japans angrep på Pearl Harbor samme år førte USA inn i krigen. Aksemaktene Tyskland, Italia og Japan ble beseiret av en allianse der blant andre Storbritannia, Sovjetunionen og USA var sentrale.",
      "Norge ble angrepet 9. april 1940. Under okkupasjonen fantes både motstand og samarbeid med okkupasjonsmakten. Krigen rammet sivile gjennom bombing, sult, tvangsarbeid, forfølgelse og folkemord. Tyskland kapitulerte i mai 1945. Krigen i Asia tok slutt senere samme år, etter blant annet USAs atombomber og Sovjetunionens krig mot Japan."
    ],
    "note": "Allianser endret seg. USA og Sovjetunionen var allierte under krigen, men ble rivaler etterpå.",
    "words": [
      "aksemakter",
      "allierte",
      "okkupasjon",
      "sivil"
    ],
    "activity": "sequence",
    "task": "Forklar hva okkupasjon betyr. Beskriv to ulike konsekvenser andre verdenskrig fikk for sivile.",
    "frame": "Okkupasjon betyr … For sivile kunne krigen føre til … En annen konsekvens var …",
    "model": "Okkupasjon betyr at en fremmed makt tar militær kontroll over et område. Sivile kunne miste hjemmene sine gjennom bombing eller måtte flykte. Noen grupper ble systematisk forfulgt og drept.",
    "sources": [
      "europe",
      "ww2",
      "norway"
    ],
    "taskEasy": "Hva betyr okkupasjon? Skriv to følger krigen fikk for sivile."
  },
  {
    "id": "holocaust",
    "nav": "Holocaust",
    "title": "Holocaust og menneskeverd",
    "intro": "Forfølgelse og folkemord · Hvordan kunne det skje?",
    "easy": [
      "<strong>Holocaust</strong> var folkemordet på Europas jøder. Nazistene og deres medhjelpere gjennomførte det. Omtrent seks millioner jøder ble drept. Nazistene forfulgte og drepte også andre grupper. Blant dem var romer og personer med funksjonsnedsettelser.",
      "Forfølgelsen utviklet seg over tid. Propaganda spredte hat mot jøder. Jøder mistet rettigheter. Under krigen organiserte nazistene systematiske massedrap. Hat, diktatur og krig gjorde dette mulig. Mennesker tok beslutninger og hadde ansvar.",
      "Også i Norge ble jøder arrestert og sendt ut av landet. Norske myndigheter og politi deltok. Andre hjalp mennesker med å flykte. Skipet Donau forlot Oslo 26. november 1942. Jødene om bord ble sendt videre til Auschwitz.",
      "Kunnskap og vern av rettigheter kan bidra til forebygging. Å forebygge betyr å prøve å hindre nye overgrep."
    ],
    "normal": [
      "Holocaust var det systematiske folkemordet på Europas jøder, gjennomført av Nazi-Tyskland med allierte og medhjelpere. Omtrent seks millioner jøder ble drept. Nazistene forfulgte og drepte også andre grupper; disse overgrepene må forstås både i sammenheng med Holocaust og ut fra gruppenes ulike erfaringer.",
      "Langvarig antisemittisme ble koblet til nazistisk raseideologi og statsmakt. Propaganda, utestenging og tap av rettigheter bidro til å normalisere forfølgelse. Under krigen utviklet regimet en politikk for systematiske massedrap. Folkemordet ble gjennomført blant annet ved masseskyting og i drapssentre. Det var et resultat av beslutninger, organisering og menneskers deltakelse.",
      "I Norge deltok norske myndigheter og politi i arrestasjoner og deportasjoner. Andre gjorde motstand og hjalp mennesker på flukt. Forebygging handler om mer enn å kjenne historien: rettsstaten, minoritetsvern, kritisk tenkning og motstand mot avhumanisering er også nødvendig. Ingen enkelt handling eller institusjon gir en sikker garanti."
    ],
    "note": "Å forklare årsakene er ikke å unnskylde gjerningspersonene. Vi kan undersøke ansvar uten å legge kollektiv skyld på et helt folk.",
    "words": [
      "holocaust",
      "antisemittisme",
      "folkemord",
      "menneskerettigheter"
    ],
    "activity": "rights",
    "task": "Forklar hvordan propaganda og tap av rettigheter kunne bidra til forfølgelse. Nevn ett tiltak som kan beskytte mennesker i dag, og begrunn hvorfor.",
    "frame": "Propaganda kunne … Når en gruppe mistet rettigheter, … Et tiltak i dag er … fordi …",
    "model": "Propaganda kunne spre antisemittiske fiendebilder og få flere til å godta diskriminering. Tap av rettigheter gjorde jøder mer utsatt. Et uavhengig rettsvesen og vern mot diskriminering kan beskytte minoriteter, men må også fungere i praksis.",
    "sources": [
      "holocaust",
      "norway",
      "rise"
    ],
    "taskEasy": "Hvordan kunne propaganda og tap av rettigheter bidra til forfølgelse? Nevn ett tiltak mot overgrep."
  },
  {
    "id": "kaldkrig",
    "nav": "Den kalde krigen",
    "title": "En delt verden",
    "intro": "Omtrent 1945–1991 · Supermakter, ideologi og frykt.",
    "easy": [
      "Etter 1945 ble USA og Sovjetunionen <strong>supermakter</strong>. Det betyr land med svært stor makt. De konkurrerte om innflytelse i verden.",
      "I USA var mange bedrifter eid av private. Landet hadde valg med flere partier. Rettighetene var likevel ikke like for alle. I Sovjetunionen styrte ett parti alene. Opposisjonen ble undertrykt. Staten planla økonomien. Dette kalles <strong>planøkonomi</strong>.",
      "Landene bygde allianser og mange atomvåpen. NATO ble opprettet i 1949. Norge var med fra starten. Warszawapakten kom i 1955, under sovjetisk ledelse. Mange land var utenfor begge alliansene.",
      "Krigen var «kald» mellom supermaktene. De unngikk en direkte storkrig mot hverandre. Men krigene i Korea og Vietnam kostet mange liv. Perioden tok slutt rundt 1989–1991. Berlinmuren ble åpnet i 1989. Sovjetunionen ble oppløst i 1991."
    ],
    "normal": [
      "Den kalde krigen vokste fram etter 1945. USA og Sovjetunionen konkurrerte om sikkerhet, ideologi og global innflytelse. USA kombinerte kapitalistisk økonomi med et demokratisk styresett, selv om rettigheter var svært ulikt fordelt. Sovjetunionen hadde statlig planøkonomi og et kommunistisk ettpartidiktatur.",
      "Begge supermaktene oppfattet den andre som en trussel. USA og vestlige allierte etablerte NATO i 1949, mens Warszawapakten ble dannet i 1955 under sovjetisk ledelse. Sovjetunionen dominerte store deler av Øst-Europa. USA støttet også autoritære regimer når det tjente egne interesser. Verden kan derfor ikke deles enkelt i to leirer av bare «gode» og «onde».",
      "Atomvåpen bidro til avskrekking: Et angrep kunne utløse et ødeleggende motangrep. Samtidig var perioden preget av reelle kriger, blant annet i Korea og Vietnam. Lokale aktører hadde egne mål. Reformer, økonomiske problemer, protester og politiske beslutninger bidro til at den kalde krigen tok slutt rundt 1989–1991."
    ],
    "note": "«Kald» betyr ikke fredelig for alle. En økonomisk modell og et politisk styresett er heller ikke det samme.",
    "words": [
      "supermakt",
      "planøkonomi",
      "ettpartidiktatur",
      "stedfortrederkrig"
    ],
    "activity": "coldcompare",
    "task": "Hvorfor kalles perioden den kalde krigen? Forklar også hvorfor ordet «kald» kan skjule viktige deler av historien.",
    "frame": "Krigen kalles kald fordi … Likevel … Et eksempel er …",
    "model": "USA og Sovjetunionen unngikk en direkte storkrig mot hverandre. Likevel var perioden voldelig mange steder. Krigene i Korea og Vietnam viser at «kald» ikke betydde fred for alle.",
    "sources": [
      "cold",
      "nato",
      "berlin"
    ],
    "taskEasy": "Hvorfor kalles krigen «kald»? Hvorfor var perioden likevel ikke fredelig?"
  },
  {
    "id": "kriser",
    "nav": "Berlin og Cuba",
    "title": "To steder. En farlig konflikt.",
    "intro": "Berlin 1961 · Cuba 1962 · Mennesker mellom stormaktene.",
    "easy": [
      "Tyskland og Berlin ble delt etter andre verdenskrig. Vest-Berlin lå inne i Øst-Tyskland. I 1961 stengte østtyske myndigheter grensen til Vest-Berlin. Muren skulle stoppe mennesker fra å forlate Øst-Tyskland. Familier og venner ble skilt.",
      "I 1962 plasserte Sovjetunionen atomraketter på Cuba. Øya ligger nær USA. USA krevde at rakettene ble fjernet. Amerikanske krigsskip skulle stanse og kontrollere skip på vei til Cuba. Dette kalles en <strong>marineblokade</strong>.",
      "Verden var nær atomkrig. Cuba hadde også egne interesser. Landets ledere fryktet et nytt amerikansk angrep.",
      "Partene forhandlet. Sovjetunionen fjernet rakettene fra Cuba. USA lovet å ikke invadere Cuba. I hemmelighet avtalte USA å fjerne egne raketter fra Tyrkia. Forhandlinger bidro til å løse krisen."
    ],
    "normal": [
      "Berlin lå inne i den sovjetiske okkupasjonssonen, men byen var selv delt mellom de fire seiersmaktene. Etter opprettelsen av to tyske stater i 1949 ble Vest-Berlin en vestlig enklave inne i DDR. I august 1961 stengte DDR-regimet grensen for å stoppe flukten vestover. Det var en beslutning som fikk store følger for enkeltmenneskers bevegelsesfrihet.",
      "Cubakrisen i 1962 fulgte etter økende spenning mellom Cuba og USA. Sovjetiske atomraketter på Cuba utfordret USAs sikkerhet. Sovjetunionen søkte også å endre den strategiske balansen, mens den cubanske ledelsen ville beskytte revolusjonen og hindre en ny invasjon. USA hadde allerede atomraketter i Tyrkia.",
      "USAs marineblokade og trusselen om videre militære handlinger økte risikoen for atomkrig. En forhandlet løsning innebar sovjetisk tilbaketrekking fra Cuba og et amerikansk løfte om ikke å invadere øya. En hemmelig avtale gjaldt amerikanske raketter i Tyrkia. Krisen viser betydningen av kommunikasjon, men også faren for feilvurderinger."
    ],
    "note": "Perspektiver er ulike, men påstander må fortsatt kontrolleres. At Cuba hadde egne interesser, forsvinner lett i fortellingen om to supermakter.",
    "words": [
      "marineblokade",
      "perspektiv",
      "diplomati",
      "supermakt"
    ],
    "activity": "berlin",
    "task": "Velg Berlin eller Cuba. Forklar én årsak, én beslutning og én konsekvens. Vis også hvordan en berørt gruppe kunne oppleve hendelsen.",
    "frame": "Jeg velger … En årsak var … Myndighetene valgte å … Dette førte til … For … kunne det bety …",
    "model": "DDR-regimet ville stanse flukten fra Øst-Tyskland. I 1961 stengte myndighetene grensen mot Vest-Berlin. En konsekvens var at mennesker mistet muligheten til å reise fritt og møte familie. Regimet framstilte dette som beskyttelse, mens mange innbyggere opplevde det som ufrihet.",
    "sources": [
      "berlin",
      "cuba",
      "cold"
    ],
    "taskEasy": "Velg Berlin eller Cuba. Skriv én årsak, ett valg og én følge."
  },
  {
    "id": "kilder",
    "nav": "Kildeverksted",
    "title": "Hvem forteller historien?",
    "intro": "Undersøk avsender, formål, sammenheng og dokumentasjon.",
    "easy": [
      "En <strong>kilde</strong> gir informasjon. Det kan være en tale, et bilde eller en bok. Spør: Hvem laget den? Når? Hvorfor? Hva kan den gi svar på?",
      "En tale kan vise hvordan en leder ville påvirke folk. Den viser ikke alene at lederen hadde rett. Begge sider kan beskrive seg selv som fredelige. Vi må undersøke påstandene og bruke flere kilder.",
      "Propaganda prøver å påvirke holdninger. Den kan bruke både sanne og falske opplysninger. Den kan også skjule viktig informasjon.",
      "På nettet velger <strong>algoritmer</strong> hvilke innlegg vi ser. En algoritme er regler et datasystem følger. Vi kan få se samme syn mange ganger. Gjentakelse gjør ikke en påstand sann. Finn den første kilden. Se etter uavhengig støtte."
    ],
    "normal": [
      "En kildes verdi avhenger av spørsmålet vi stiller. En politisk tale er ofte en god kilde til avsenderens budskap og forsøk på påvirkning. Den er ikke nødvendigvis en pålitelig beskrivelse av motpartens mål. Vi undersøker avsender, tidspunkt, mottaker, formål og historisk sammenheng.",
      "Kilder fra ulike ideologiske ståsteder kan framheve egne forsvarshensyn og motpartens aggresjon. Perspektiv innebærer utvalg og fortolkning, men betyr ikke at alle påstander er like godt dokumentert. Vi må kontrollere innholdet mot uavhengige kilder og være åpne om hva kildene ikke gir grunnlag for å si.",
      "Anbefalingsalgoritmer kan forsterke ensidig innhold fordi de prioriterer det vi reagerer på. Mange delinger er ikke dokumentasjon, og flere nettsteder kan ha kopiert samme opprinnelige påstand. Falske nyheter, manipulerte bilder og manglende kontekst krever at vi følger opplysninger tilbake til opphavet."
    ],
    "note": "En partisk kilde kan være svært nyttig. Spørsmålet er hva den kan brukes som kilde til.",
    "words": [
      "kilde",
      "perspektiv",
      "propaganda",
      "algoritme"
    ],
    "activity": "sources",
    "task": "Sammenlign kilde A og B nedenfor. Hvordan beskriver de egen side? Forklar hva kildene kan brukes til, og hva du må undersøke i andre kilder.",
    "frame": "Kilde A ble laget av … for å … Kilde B … Begge … En forskjell er … Kildene kan vise … Men for å undersøke … trenger jeg …",
    "model": "Trumans tale skulle blant annet overbevise Kongressen om støtte til Hellas og Tyrkia. Warszawapakten begrunner et militært samarbeid med en trussel fra vest. Begge framstiller egne handlinger som beskyttelse. De viser hvordan partene begrunnet politikken sin. Vi trenger flere kilder for å undersøke faktiske handlinger og følger. Kildene er fra ulike år og svarer ikke direkte på hverandre.",
    "sources": [
      "truman",
      "warsaw",
      "udir"
    ],
    "taskEasy": "Hvem laget kilde A og B? Hva vil de vise? Hva må du sjekke i andre kilder?"
  },
  {
    "id": "fred",
    "nav": "Fred og rettigheter",
    "title": "Hvordan kan vi forebygge konflikt?",
    "intro": "Samarbeid, rettigheter og valg · Historien gir spørsmål, ikke en enkel oppskrift.",
    "easy": [
      "FN ble opprettet i 1945. Landene ville hindre nye store kriger. FN arbeider for fred, sikkerhet og menneskerettigheter. Landene er ofte uenige. FN klarer ikke å stoppe alle kriger.",
      "FN-pakten er en avtale mellom land. Den gir landene plikter. I 1948 vedtok FN også en menneskerettighetserklæring. Den sier at alle mennesker har samme verdi og grunnleggende rettigheter.",
      "Erklæringen er ikke en bindende avtale i seg selv. Senere avtaler gjør mange rettigheter til plikter for landene. Landene må ha sluttet seg til slike avtaler.",
      "Forhandlinger og vern av minoriteter kan bidra til fred. Allianser kan gjøre et angrep mindre fristende. Men de kan også øke andres frykt. Vi må undersøke hvordan tiltak virker i praksis."
    ],
    "normal": [
      "Etter 1945 ble FN opprettet for blant annet å opprettholde internasjonal fred og sikkerhet. FN-pakten er en internasjonal traktat. Medlemsstatene samarbeider, men organisasjonen er avhengig av statenes handlinger og vilje. Stormaktenes motsetninger kan begrense muligheten for felles tiltak.",
      "Verdenserklæringen om menneskerettighetene fra 1948 formulerer universelle rettigheter og likeverd. Den er en erklæring og ikke i seg selv en bindende traktat. Senere menneskerettighetskonvensjoner gir rettslige forpliktelser for stater som er bundet av dem. Skill derfor mellom en viktig norm og en konkret traktatforpliktelse.",
      "Forebygging kan innebære diplomati, avtaler, demokratiske institusjoner, rettsvern og arbeid mot fiendebilder. Tiltak kan også ha spenninger: Militære allianser kan avskrekke angrep, men oppfattes som truende av andre. En faglig vurdering bør undersøke virkemåten, dokumentasjonen og mulige utilsiktede konsekvenser."
    ],
    "note": "En fredsavtale og et fredelig samfunn er ikke det samme. Avtaler må følges opp i praksis.",
    "words": [
      "erklæring",
      "traktat",
      "rettslig bindende",
      "menneskerettigheter"
    ],
    "activity": "peace",
    "task": "Velg ett tiltak som kan forebygge krig eller forfølgelse. Forklar hvordan det kan virke. Nevn også en begrensning eller utfordring.",
    "frame": "Et tiltak er … Det kan bidra fordi … Et historisk eksempel er … En utfordring er likevel …",
    "model": "Diplomati kan bidra til at stater forstår hverandres krav og finner kompromisser. Under Cubakrisen bidro forhandlinger til tilbaketrekking av raketter og gjensidige løfter. En utfordring er at partene må være villige til å forhandle og ha tillit til at avtaler blir fulgt.",
    "sources": [
      "charter",
      "un",
      "nato"
    ],
    "taskEasy": "Velg ett tiltak for fred. Hvordan kan det virke? Hva kan være vanskelig?"
  },
  {
    "id": "idag",
    "nav": "Konflikt i dag",
    "title": "Vold, valg og kilder i vår tid",
    "intro": "To ulike temaer: radikalisering og terror; kilder til en nåtidig konflikt.",
    "easy": [
      "Vi kan være sterkt uenige og demonstrere fredelig. Dette er demokratisk deltakelse. Her bruker vi begrepet <strong>radikalisering mot vold</strong>. Det betyr å begynne å godta eller støtte vold for bestemte mål. Målene kan være politiske eller religiøse.",
      "Radikalisering ender ikke alltid i terror. Flere årsaker kan virke sammen. <strong>Terror</strong> bruker alvorlig vold eller trusler for å skape frykt. Den skal også påvirke samfunnet eller myndighetene. Terroren 22. juli 2011 rammet mennesker og demokratisk deltakelse i Norge.",
      "Krig mellom land er et annet tema enn terror. Russland startet en fullskala <strong>invasjon</strong> av Ukraina 24. februar 2022. Invasjon betyr at militære styrker går inn i et annet land. Krigen rammet sivile.",
      "FNs generalforsamling gjorde et vedtak 2. mars 2022. FN krevde at Russland skulle trekke styrkene ut. Vedtaket kalles en <strong>resolusjon</strong>. Vi kan undersøke avsender, dato og formål. Kilden viser ikke alt som skjer i krigen i dag."
    ],
    "normal": [
      "Radikalisering mot vold betyr at en person utvikler aksept for eller vilje til å støtte vold for politiske, religiøse eller ideologiske mål. Fredelig demonstrasjon og sterk kritikk er ikke i seg selv voldelig ekstremisme. Ideologi, sosiale miljøer og personlige erfaringer kan virke sammen. Prosessen følger ikke faste trinn og ender ikke nødvendigvis i terror.",
      "Terroren 22. juli 2011 rammet Regjeringskvartalet og AUFs sommerleir på Utøya. Det var et høyreekstremt angrep på mennesker og demokratisk deltakelse. Følgene omfatter tap, sorg og langvarig utrygghet. Å forklare årsaker er ikke å unnskylde vold. Arbeid mot hat og støtte til tilhørighet kan bidra til forebygging, men ingen enkeltfaktor forklarer alle tilfeller.",
      "En mellomstatlig krig er et annet fenomen enn terror. Russlands fullskala invasjon av Ukraina begynte 24. februar 2022. FNs generalforsamling krevde russisk tilbaketrekking i resolusjon ES-11/1 den 2. mars. Dette er et datert kildecase. Resolusjonen er en kilde til hva forsamlingen vedtok, men forklarer ikke alle årsakene til krigen eller utviklingen fram til i dag.",
      "For å undersøke hvordan en nåtidig konflikt framstilles, trenger vi flere daterte kilder. Spør hvem som forteller, hva som framheves, og hvilken dokumentasjon påstandene bygger på. Uenighet betyr ikke at alle forklaringer har like god støtte."
    ],
    "note": "Du trenger ikke fortelle om egne erfaringer. Du kan avtale et historisk eksempel og arbeide skriftlig alene.",
    "words": [
      "radikalisering mot vold",
      "terror",
      "forebygge",
      "resolusjon"
    ],
    "activity": "today",
    "task": "Velg radikalisering/forebygging eller en datert konfliktkilde. Forklar årsak, mulige valg, konsekvens og perspektiv. Oppgi kilden og én begrensning.",
    "taskEasy": "Velg ett av de to temaene. Forklar en årsak, et mulig valg og en følge. Hvilken kilde brukte du?",
    "frame": "Jeg undersøker … En årsak kan være … Et mulig valg er … En følge kan være … Avsenderen framhever … Kilden er fra … Den kan vise … Men den viser ikke …",
    "model": "En datert FN-resolusjon kan vise hva generalforsamlingen vedtok. Den er ikke en full forklaring på konflikten og viser ikke alene dagens situasjon. For å undersøke andre perspektiver må jeg sammenligne daterte kilder og dokumentasjon. Jeg kan ikke anta at sannheten alltid ligger midt mellom to påstander.",
    "sources": [
      "pst",
      "juli",
      "ukraina",
      "udir"
    ]
  }
];
const STATIONS=[{id:'start',nav:'Start'},{id:'ord',nav:'Ord'},...LESSONS,{id:'vis',nav:'Vis hva du kan'}];
