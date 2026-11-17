'use strict';
const QUIZ_VERSION=2;
const QUIZ_BANK={
  "ord": [
    {
      "stem": {
        "easy": "Hva betyr konsekvens?",
        "normal": "Hva betyr en konsekvens i en historisk forklaring?"
      },
      "options": [
        {
          "text": {
            "easy": "Noe som bidrar til en hendelse",
            "normal": "Et forhold som bidrar til at noe skjer"
          },
          "feedback": {
            "easy": "Se på når dette virker. Les eksemplet til ordet igjen.",
            "normal": "Undersøk om dette beskriver noe som virker før hendelsen. Les ordlisten igjen."
          }
        },
        {
          "text": {
            "easy": "Noe som følger etter en hendelse",
            "normal": "En følge av en hendelse eller handling"
          },
          "feedback": {
            "easy": "Ja. Dette beskriver en følge.",
            "normal": "Ja. Dette beskriver en følge av det som har skjedd."
          }
        },
        {
          "text": {
            "easy": "Hendelsen som starter en større krise",
            "normal": "Hendelsen som setter en større krise i gang"
          },
          "feedback": {
            "easy": "Se på forskjellen mellom starten og følgene.",
            "normal": "Les skillet mellom en utløsende hendelse og det som skjer som følge av den."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "En konsekvens er en følge. Krig kan for eksempel føre til flukt.",
        "normal": "En konsekvens er en følge av en hendelse eller handling. Flukt kan være en konsekvens av krig."
      }
    },
    {
      "stem": {
        "easy": "Hva er en ideologi?",
        "normal": "Hva beskriver begrepet ideologi?"
      },
      "options": [
        {
          "text": {
            "easy": "Avtaler om samarbeid mellom flere land",
            "normal": "Avtaler om politisk samarbeid mellom flere stater"
          },
          "feedback": {
            "easy": "En avtale og et sett ideer er forskjellige ting. Les ordlisten.",
            "normal": "En samarbeidsavtale beskriver en forbindelse mellom aktører. Undersøk hva ordlisten sier om ideer."
          }
        },
        {
          "text": {
            "easy": "Ideer om hvordan samfunnet bør styres",
            "normal": "Ideer om hvordan samfunnet bør styres og organiseres"
          },
          "feedback": {
            "easy": "Ja. Slike ideer kan handle om makt og økonomi.",
            "normal": "Ja. Ideologien gir ideer om blant annet makt, økonomi og fellesskap."
          }
        },
        {
          "text": {
            "easy": "Regler for å gjennomføre et valg",
            "normal": "Regler for hvordan politiske valg skal gjennomføres"
          },
          "feedback": {
            "easy": "Valgregler handler om en bestemt prosess. Les ordets forklaring igjen.",
            "normal": "Valgregler gjelder en avgrenset prosess. Undersøk om begrepet handler om et bredere samfunnssyn."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "En ideologi er ideer om hvordan samfunnet bør styres og organiseres.",
        "normal": "En ideologi uttrykker ideer om hvordan samfunnet bør styres og organiseres, blant annet om makt og økonomi."
      }
    },
    {
      "stem": {
        "easy": "Hva kan propaganda bruke?",
        "normal": "Hvilke opplysninger kan inngå i propaganda?"
      },
      "options": [
        {
          "text": {
            "easy": "Bare opplysninger som er funnet på",
            "normal": "Bare opplysninger som avsenderen selv har funnet på"
          },
          "feedback": {
            "easy": "Les eksemplet i ordlisten. Passer det med ordet «bare»?",
            "normal": "Du knytter påvirkning til oppdiktede opplysninger. Les ordlisten og vurder om avgrensningen holder."
          }
        },
        {
          "text": {
            "easy": "Bare opplysninger som er kontrollert",
            "normal": "Bare opplysninger som uavhengige kilder har kontrollert"
          },
          "feedback": {
            "easy": "Se etter hva propaganda skal gjøre, og hvordan den kan virke.",
            "normal": "Du knytter begrepet til en bestemt kvalitetskontroll. Les om formålet og virkemidlene."
          }
        },
        {
          "text": {
            "easy": "Både sanne og falske opplysninger",
            "normal": "Både sanne og falske opplysninger om en sak"
          },
          "feedback": {
            "easy": "Ja. Utvalg og følelser kan også påvirke oss.",
            "normal": "Ja. Også sanne opplysninger kan velges ut og brukes for å påvirke."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Propaganda vil påvirke oss. Den kan bruke både sant og usant, sterke følelser og et bestemt utvalg.",
        "normal": "Propaganda er budskap som vil påvirke holdninger. Den kan bruke sanne og falske opplysninger, utvalg og følelsesappeller."
      }
    }
  ],
  "aarsaker": [
    {
      "stem": {
        "easy": "Hva er forskjellen på årsak og utløsende hendelse?",
        "normal": "Hvordan skiller vi en langsiktig årsak fra en utløsende hendelse?"
      },
      "options": [
        {
          "text": {
            "easy": "Årsaken er alltid den siste hendelsen",
            "normal": "Årsaken er alltid den siste hendelsen før krigen"
          },
          "feedback": {
            "easy": "Se etter det som virker over tid i teksten.",
            "normal": "Du begrenser forklaringen til den siste hendelsen. Undersøk hva som bygde opp spenninger over tid."
          }
        },
        {
          "text": {
            "easy": "Den utløsende hendelsen forklarer hele konflikten",
            "normal": "Den utløsende hendelsen forklarer alene hele konfliktens utvikling"
          },
          "feedback": {
            "easy": "Kan én hendelse forklare alle valgene? Les teksten igjen.",
            "normal": "Undersøk om hendelsen også forklarer stormaktenes valg og de tidligere spenningene."
          }
        },
        {
          "text": {
            "easy": "Årsaker bygger spenning; en hendelse starter krisen",
            "normal": "Årsaker kan bygge spenning; en hendelse utløser krisen"
          },
          "feedback": {
            "easy": "Ja. Vi må undersøke begge deler.",
            "normal": "Ja. Skillet hjelper oss å undersøke både bakgrunn og hendelsesforløp."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Årsaker kan bygge opp spenning over tid. En utløsende hendelse setter en krise i gang.",
        "normal": "Langsiktige årsaker kan bygge opp spenninger, mens en utløsende hendelse setter et bestemt forløp i gang. Begge må undersøkes."
      }
    },
    {
      "stem": {
        "easy": "Hvordan kunne allianser gjøre krigen større?",
        "normal": "Hvordan kunne allianser bidra til at krigen spredte seg?"
      },
      "options": [
        {
          "text": {
            "easy": "Flere land kunne støtte sine allierte",
            "normal": "Flere stater kunne trekkes inn for å støtte allierte"
          },
          "feedback": {
            "easy": "Ja. Et samarbeid kunne trekke flere inn.",
            "normal": "Ja. Forbindelsene mellom statene kunne bidra til at konflikten spredte seg."
          }
        },
        {
          "text": {
            "easy": "Alle land måtte straks erklære krig",
            "normal": "Alle stater måtte automatisk erklære krig samtidig"
          },
          "feedback": {
            "easy": "Les om ledernes valg. Var alt bestemt på forhånd?",
            "normal": "Ordet «automatisk» gjør påstanden svært sterk. Undersøk hvilken rolle politiske valg hadde."
          }
        },
        {
          "text": {
            "easy": "Alliansene fjernet behovet for politiske valg",
            "normal": "Alliansene fjernet statenes mulighet til å ta politiske valg"
          },
          "feedback": {
            "easy": "Se etter hva myndighetene bestemte under krisen.",
            "normal": "Undersøk beslutningene om mobilisering og krig. Hadde myndighetene fortsatt et handlingsrom?"
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Land kunne støtte sine allierte og bli trukket inn. Lederne måtte likevel ta valg.",
        "normal": "Allianser knyttet stater sammen og kunne trekke flere inn i krigen. De virket sammen med ledernes beslutninger og gjorde ikke krig automatisk."
      }
    },
    {
      "stem": {
        "easy": "To land er uenige. Hvordan kan de løse konflikten?",
        "normal": "Hvordan kan stater håndtere en konflikt uten at den blir krig?"
      },
      "options": [
        {
          "text": {
            "easy": "De kan forhandle om det de er uenige om",
            "normal": "De kan forhandle om motstridende interesser og mulige løsninger"
          },
          "feedback": {
            "easy": "Ja. Samtaler kan bidra til en løsning.",
            "normal": "Ja. Forhandlinger kan håndtere motsetninger og redusere faren for vold."
          }
        },
        {
          "text": {
            "easy": "De må først få helt like interesser",
            "normal": "De må først få helt sammenfallende politiske interesser"
          },
          "feedback": {
            "easy": "Tenk på hvorfor land trenger å forhandle.",
            "normal": "Hvis all uenighet allerede var borte, hva skulle forhandlingene løse? Les om konflikthåndtering."
          }
        },
        {
          "text": {
            "easy": "De må først vise styrke gjennom krig",
            "normal": "De må først bruke krig for å vise styrke"
          },
          "feedback": {
            "easy": "Les om mulighetene for å løse en konflikt.",
            "normal": "Du gjør krig til et nødvendig første steg. Undersøk om teksten gir grunnlag for det."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Land kan forhandle om en løsning. Konflikt betyr uenighet og trenger ikke bli krig.",
        "normal": "Forhandlinger kan håndtere motsetninger uten krig. Det krever at partene arbeider med uenigheten; full enighet på forhånd er ikke nødvendig."
      }
    }
  ],
  "ww1": [
    {
      "stem": {
        "easy": "Når var første verdenskrig?",
        "normal": "Hvilket tidsrom gjelder første verdenskrig?"
      },
      "options": [
        {
          "text": {
            "easy": "Fra 1914 til 1918",
            "normal": "Fra 1914 til 1918"
          },
          "feedback": {
            "easy": "Ja. Dette er krigens tidsrom.",
            "normal": "Ja. Dette er tidsrommet for første verdenskrig."
          }
        },
        {
          "text": {
            "easy": "Fra 1914 til 1919",
            "normal": "Fra 1914 til 1919"
          },
          "feedback": {
            "easy": "Skill mellom krigens slutt og fredsavtalen. Se tidslinjen.",
            "normal": "Undersøk forskjellen mellom våpenhvilen og den senere Versaillestraktaten."
          }
        },
        {
          "text": {
            "easy": "Fra 1918 til 1939",
            "normal": "Fra 1918 til 1939"
          },
          "feedback": {
            "easy": "Se når krigen begynte. Hvilken periode kommer etterpå?",
            "normal": "Dette legger starten etter krigsutbruddet. Sammenlign krigen og mellomkrigstiden på tidslinjen."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Første verdenskrig varte fra 1914 til 1918. Fredsavtalene kom etterpå.",
        "normal": "Første verdenskrig varte fra 1914 til 1918. Versaillestraktaten ble inngått etter krigen, i 1919."
      }
    },
    {
      "stem": {
        "easy": "Hva gjorde første verdenskrig global?",
        "normal": "Hva viser at første verdenskrig også var en global krig?"
      },
      "options": [
        {
          "text": {
            "easy": "Alle verdens land kjempet ved fronten",
            "normal": "Samtlige stater i verden deltok med egne soldater"
          },
          "feedback": {
            "easy": "Må alle land delta for at en krig skal være global?",
            "normal": "Påstanden omfatter alle stater. Undersøk om teksten krever så omfattende deltakelse."
          }
        },
        {
          "text": {
            "easy": "Kampene foregikk bare mellom europeiske stormakter",
            "normal": "Krigen omfattet bare kamper mellom de europeiske stormaktene"
          },
          "feedback": {
            "easy": "Se etter Afrika, Midtøsten og koloniene i teksten.",
            "normal": "Denne beskrivelsen utelater områdene og befolkningene utenfor Europa. Les om imperienes rolle."
          }
        },
        {
          "text": {
            "easy": "Kamper og kolonier knyttet flere verdensdeler sammen",
            "normal": "Krigføring og kolonienes deltakelse knyttet flere verdensdeler til krigen"
          },
          "feedback": {
            "easy": "Ja. Flere verdensdeler ble berørt og deltok.",
            "normal": "Ja. Både krigføring og imperienes ressurser knyttet flere verdensdeler til krigen."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Det ble kjempet i flere verdensdeler. Koloniene bidro også med soldater, arbeid og ressurser.",
        "normal": "Krigen omfattet kamper utenfor Europa og bruk av kolonienes soldater, arbeid og ressurser. Den globale betydningen handler om mer enn europeiske stormakter."
      }
    },
    {
      "stem": {
        "easy": "Hva var en følge av første verdenskrig?",
        "normal": "Hvilken utvikling var en konsekvens av første verdenskrig?"
      },
      "options": [
        {
          "text": {
            "easy": "De gamle keiserrikene beholdt sine grenser",
            "normal": "De gamle keiserrikene beholdt stort sett sine grenser"
          },
          "feedback": {
            "easy": "Se på hva som skjedde med keiserrikene.",
            "normal": "Undersøk sammenbruddene og de nye statsgrensene etter krigen."
          }
        },
        {
          "text": {
            "easy": "Flere keiserriker falt, og grensene endret seg",
            "normal": "Flere keiserriker brøt sammen, og landegrensene ble endret"
          },
          "feedback": {
            "easy": "Ja. Krigen endret statene og maktforholdene.",
            "normal": "Ja. Både statsdannelser og maktforhold ble endret."
          }
        },
        {
          "text": {
            "easy": "Fredsavtalene fjernet motsetningene mellom de europeiske statene",
            "normal": "Fredsavtalene løste de viktigste motsetningene mellom Europas stater"
          },
          "feedback": {
            "easy": "Les om misnøyen med freden. Ble alle fornøyde?",
            "normal": "Undersøk hvilke nye motsetninger fredsordningen skapte, og hvordan den ble mottatt."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Flere keiserriker brøt sammen. Fredsavtalene endret grenser og bidro til nye motsetninger.",
        "normal": "Krigen bidro til sammenbrudd i flere keiserriker. Fredsordningen skapte nye stater og grenser, men også nye motsetninger."
      }
    }
  ],
  "mellomkrig": [
    {
      "stem": {
        "easy": "Hvordan ble Hitler rikskansler i 1933?",
        "normal": "Hvordan fikk Hitler stillingen som rikskansler i 1933?"
      },
      "options": [
        {
          "text": {
            "easy": "Han vant presidentvalget og tok over regjeringen",
            "normal": "Han vant et presidentvalg og overtok deretter regjeringen"
          },
          "feedback": {
            "easy": "Skill mellom president og rikskansler. Les om 1933.",
            "normal": "Du blander to forskjellige embeter. Les hvordan teksten beskriver overføringen av regjeringsmakten."
          }
        },
        {
          "text": {
            "easy": "Han ble utnevnt til leder for regjeringen",
            "normal": "Han ble utnevnt til rikskansler og leder for regjeringen"
          },
          "feedback": {
            "easy": "Ja. Stillingen ble gitt gjennom en utnevnelse.",
            "normal": "Ja. Utnevnelsen var et politisk valg som bidro til nazistenes maktovertakelse."
          }
        },
        {
          "text": {
            "easy": "Han ble valgt til diktator av flertallet",
            "normal": "Han fikk diktatormakt direkte gjennom et fritt parlamentsvalg"
          },
          "feedback": {
            "easy": "Les om stegene fra regjeringsmakt til diktatur.",
            "normal": "Undersøk om regjeringsstillingen og diktatormakten kom på samme måte."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Hitler ble utnevnt til regjeringssjef. Etterpå brukte nazistene lovendringer, tvang og vold til å fjerne demokratiet.",
        "normal": "Hitler ble utnevnt til rikskansler i 1933. Han ble ikke valgt til diktator av et flertall i et fritt valg. Nazistene avviklet deretter demokratiet."
      }
    },
    {
      "stem": {
        "easy": "Hvordan bidro Versaillestraktaten til utviklingen?",
        "normal": "Hvilken vurdering av Versaillestraktatens betydning er best begrunnet?"
      },
      "options": [
        {
          "text": {
            "easy": "Avtalen gjorde en ny krig helt uunngåelig",
            "normal": "Traktaten gjorde en ny krig til en uunngåelig følge"
          },
          "feedback": {
            "easy": "Les om valgene som mennesker tok etter avtalen.",
            "normal": "Ordet «uunngåelig» utelukker andre utviklinger. Undersøk aktørenes valg og de andre årsakene."
          }
        },
        {
          "text": {
            "easy": "Avtalen hadde ingen betydning for tysk politikk",
            "normal": "Traktaten hadde ingen betydning for misnøyen i Tyskland"
          },
          "feedback": {
            "easy": "Se etter hvordan mange tyskere opplevde avtalen.",
            "normal": "Du utelukker traktatens betydning helt. Undersøk forbindelsen mellom fredsvilkårene og misnøyen."
          }
        },
        {
          "text": {
            "easy": "Avtalen skapte misnøye; politiske valg fikk også betydning",
            "normal": "Traktaten skapte misnøye; krise, ideologi og valg virket sammen"
          },
          "feedback": {
            "easy": "Ja. Flere forhold og menneskers valg hadde betydning.",
            "normal": "Ja. Dette forklarer et bidrag uten å gjøre utviklingen forutbestemt."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Avtalen skapte misnøye. Men krise, ideologi og politiske valg virket også inn. Ny krig var ikke bestemt.",
        "normal": "Versaillestraktaten bidro til misnøye, men gjorde ikke nazisme eller ny krig uunngåelig. Økonomisk krise, ideologi og aktørenes valg må også undersøkes."
      }
    },
    {
      "stem": {
        "easy": "Hvordan kunne økonomisk krise svekke demokratiet?",
        "normal": "Hvordan kunne den økonomiske krisen bidra til å svekke demokratiet?"
      },
      "options": [
        {
          "text": {
            "easy": "Arbeidsledighet kunne svekke tilliten til demokratiske ledere",
            "normal": "Arbeidsledighet kunne svekke tilliten til de demokratiske myndighetene"
          },
          "feedback": {
            "easy": "Ja. Utrygghet kunne påvirke hvem folk støttet.",
            "normal": "Ja. Tap av tillit kunne gi ytterliggående partier større oppslutning."
          }
        },
        {
          "text": {
            "easy": "Arbeidsledighet ga nazistene automatisk kontroll over staten",
            "normal": "Arbeidsledighet ga automatisk nazistene full kontroll over statsapparatet"
          },
          "feedback": {
            "easy": "Se etter hvem som tok politiske valg under krisen.",
            "normal": "Du hopper fra samfunnsforhold til automatisk maktovertakelse. Undersøk handlingene mellom disse leddene."
          }
        },
        {
          "text": {
            "easy": "Arbeidsledighet gjorde propaganda mindre viktig for velgerne",
            "normal": "Arbeidsledighet gjorde nazistenes propaganda mindre viktig for velgernes valg"
          },
          "feedback": {
            "easy": "Les om løftene nazistene brukte under krisen.",
            "normal": "Undersøk hvordan nazistene brukte krisen i sin påvirkning, og vurder om påstanden passer med teksten."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Arbeidsledighet kunne svekke tilliten til myndighetene. Det kunne gi ytterliggående partier mer støtte. Det skjedde ikke automatisk.",
        "normal": "Arbeidsledighet og utrygghet kunne svekke tilliten til demokratiske myndigheter og øke støtten til ytterliggående partier. Det forklarer et mulig forløp, ikke en naturlov."
      }
    }
  ],
  "ww2": [
    {
      "stem": {
        "easy": "Hva startet andre verdenskrig i Europa?",
        "normal": "Hvilken hendelse regnes som starten på andre verdenskrig i Europa?"
      },
      "options": [
        {
          "text": {
            "easy": "Tyskland angrep Norge i april 1940",
            "normal": "Tysklands angrep på Norge i april 1940"
          },
          "feedback": {
            "easy": "Se hva som skjedde i Europa før Norge ble angrepet.",
            "normal": "Undersøk rekkefølgen mellom angrepene på Norge og Polen."
          }
        },
        {
          "text": {
            "easy": "Tyskland angrep Sovjetunionen i juni 1941",
            "normal": "Tysklands angrep på Sovjetunionen i juni 1941"
          },
          "feedback": {
            "easy": "Se etter hendelser i Europa før 1941.",
            "normal": "Dette angrepet utvidet en pågående krig. Undersøk tidslinjen før 1941."
          }
        },
        {
          "text": {
            "easy": "Tyskland angrep Polen i september 1939",
            "normal": "Tysklands angrep på Polen i september 1939"
          },
          "feedback": {
            "easy": "Ja. Dette startet krigen i Europa.",
            "normal": "Ja. Dette markerer krigsutbruddet i Europa, med en annen forhistorie i Asia."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Tyskland angrep Polen i september 1939. Storbritannia og Frankrike erklærte Tyskland krig. I Asia pågikk krig allerede.",
        "normal": "Tysklands angrep på Polen 1. september 1939 innledet andre verdenskrig i Europa. Krigen i Asia hadde allerede pågått i flere år."
      }
    },
    {
      "stem": {
        "easy": "Hva betyr det at Norge var okkupert?",
        "normal": "Hva betyr det at Norge var under tysk okkupasjon?"
      },
      "options": [
        {
          "text": {
            "easy": "En fremmed makt tok militær kontroll",
            "normal": "En fremmed makt tok militær kontroll over landet"
          },
          "feedback": {
            "easy": "Ja. Dette beskriver militær kontroll utenfra.",
            "normal": "Ja. Det sentrale er den fremmede maktens militære kontroll."
          }
        },
        {
          "text": {
            "easy": "To land inngikk en frivillig forsvarsavtale",
            "normal": "To selvstendige stater inngikk en frivillig avtale om forsvar"
          },
          "feedback": {
            "easy": "Les om Norge i 1940. Var samarbeidet frivillig?",
            "normal": "Undersøk om en frivillig forsvarsavtale passer med beskrivelsen av Norge i 1940."
          }
        },
        {
          "text": {
            "easy": "Norge ble formelt en del av Tyskland",
            "normal": "Norge ble innlemmet som en vanlig del av Tyskland"
          },
          "feedback": {
            "easy": "Les hva begrepet sier om kontroll over et område.",
            "normal": "Du setter likhetstegn mellom okkupasjon og innlemmelse. Undersøk hvordan teksten beskriver kontrollen."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "En fremmed makt tok militær kontroll over Norge. Det fantes både motstand og samarbeid med okkupasjonsmakten.",
        "normal": "Okkupasjon innebærer at en fremmed makt tar militær kontroll over et område. Norge var under tysk okkupasjon fra 1940 til 1945."
      }
    },
    {
      "stem": {
        "easy": "Hvordan samarbeidet USA og Sovjetunionen under krigen?",
        "normal": "Hva beskriver forholdet mellom USA og Sovjetunionen under andre verdenskrig?"
      },
      "options": [
        {
          "text": {
            "easy": "De kjempet mot hverandre som hovedfiender",
            "normal": "De førte direkte krig mot hverandre som hovedfiender"
          },
          "feedback": {
            "easy": "Skill mellom verdenskrigen og rivaliseringen etterpå.",
            "normal": "Undersøk om du har flyttet forholdet etter krigen tilbake til selve verdenskrigen."
          }
        },
        {
          "text": {
            "easy": "De samarbeidet fordi de hadde samme styresett",
            "normal": "De samarbeidet fordi begge hadde samme politiske styresett"
          },
          "feedback": {
            "easy": "Les om landenes ulike styresett i neste tema.",
            "normal": "Samarbeid krever ikke nødvendigvis politisk likhet. Undersøk hvordan de to landene var organisert."
          }
        },
        {
          "text": {
            "easy": "De var allierte mot de samme aksemaktene",
            "normal": "De var allierte i kampen mot de samme aksemaktene"
          },
          "feedback": {
            "easy": "Ja. De hadde en felles fiende under krigen.",
            "normal": "Ja. En felles fiende gjorde samarbeid mulig til tross for store motsetninger."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "De ble allierte mot aksemaktene. Land kan samarbeide mot en felles fiende selv om de er svært forskjellige.",
        "normal": "USA og Sovjetunionen ble allierte mot aksemaktene. Samarbeidet innebar ikke at de hadde samme styresett eller interesser, og etter krigen ble de rivaler."
      }
    }
  ],
  "holocaust": [
    {
      "stem": {
        "easy": "Hva viser ordet Holocaust til her?",
        "normal": "Hva viser begrepet Holocaust til i dette læringsløpet?"
      },
      "options": [
        {
          "text": {
            "easy": "Folkemordet på jødene i Europa",
            "normal": "Nazistenes og medhjelpernes folkemord på Europas jøder"
          },
          "feedback": {
            "easy": "Ja. Dette er betydningen av begrepet her.",
            "normal": "Ja. Dette angir den bestemte betydningen av Holocaust som brukes her."
          }
        },
        {
          "text": {
            "easy": "Forfølgelsen av alle politiske motstandere",
            "normal": "Nazistenes forfølgelse av samtlige politiske motstandere i Europa"
          },
          "feedback": {
            "easy": "Skill mellom gruppene og begrepene i teksten.",
            "normal": "Politiske motstandere ble også forfulgt. Undersøk hvordan teksten avgrenser selve begrepet."
          }
        },
        {
          "text": {
            "easy": "Alle dødsfall under andre verdenskrig",
            "normal": "Alle dødsfallene som andre verdenskrig førte til"
          },
          "feedback": {
            "easy": "Les om forskjellen mellom krig og folkemord.",
            "normal": "Denne avgrensningen omfatter alle krigsrelaterte dødsfall. Undersøk begrepets mer bestemte betydning."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Holocaust var nazistenes og medhjelpernes folkemord på Europas jøder. Nazistene forfulgte og drepte også andre grupper.",
        "normal": "Holocaust viser her til nazistenes og medhjelpernes folkemord på Europas jøder. Overgrepene mot andre grupper må også undersøkes, med deres ulike erfaringer."
      }
    },
    {
      "stem": {
        "easy": "Hva betyr antisemittisme?",
        "normal": "Hva kjennetegner antisemittisme?"
      },
      "options": [
        {
          "text": {
            "easy": "Motstand mot et bestemt politisk parti",
            "normal": "Motstand mot politikken til et bestemt politisk parti"
          },
          "feedback": {
            "easy": "Se etter hvem hatet i begrepet er rettet mot.",
            "normal": "Du beskriver politisk motstand generelt. Undersøk hvilken gruppe begrepet gjelder."
          }
        },
        {
          "text": {
            "easy": "Fordommer og hat mot jøder",
            "normal": "Fordommer, fiendtlighet eller hat rettet mot jøder"
          },
          "feedback": {
            "easy": "Ja. Begrepet gjelder hat og fordommer mot jøder.",
            "normal": "Ja. Begrepet beskriver fordommer, fiendtlighet og hat mot jøder."
          }
        },
        {
          "text": {
            "easy": "Kritikk av alle former for religion",
            "normal": "Kritikk av religiøse forestillinger og praksiser generelt"
          },
          "feedback": {
            "easy": "Skill mellom kritikk av ideer og hat mot mennesker.",
            "normal": "Religionskritikk og gruppefiendtlighet er ulike forhold. Undersøk hva definisjonen omfatter."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Antisemittisme er fordommer, fiendtlighet eller hat mot jøder. Det var en grunnleggende del av nazismen.",
        "normal": "Antisemittisme er fordommer, fiendtlighet eller hat rettet mot jøder. Nazismen koblet dette til raseideologi og statlig forfølgelse."
      }
    },
    {
      "stem": {
        "easy": "Hva skjedde med jøder i Norge?",
        "normal": "Hva viser teksten om forfølgelsen av jøder i Norge?"
      },
      "options": [
        {
          "text": {
            "easy": "Bare tyske myndigheter deltok i forfølgelsen",
            "normal": "Bare tyske aktører deltok i arrestasjoner og deportasjoner"
          },
          "feedback": {
            "easy": "Les avsnittet om handlinger og aktører i Norge.",
            "normal": "Undersøk om teksten gir støtte til ordet «bare»."
          }
        },
        {
          "text": {
            "easy": "Norsk politi deltok; andre hjalp mennesker på flukt",
            "normal": "Norske aktører deltok; andre hjalp jøder med å flykte"
          },
          "feedback": {
            "easy": "Ja. Mennesker og myndigheter tok ulike valg.",
            "normal": "Ja. Teksten viser både norsk deltakelse i overgrep og hjelp til mennesker på flukt."
          }
        },
        {
          "text": {
            "easy": "Hele befolkningen deltok på samme måte",
            "normal": "Alle norske innbyggere deltok i forfølgelsen på samme måte"
          },
          "feedback": {
            "easy": "Se etter eksempler på at mennesker handlet forskjellig.",
            "normal": "Du gjør ansvaret kollektivt og ensartet. Undersøk hvilke ulike handlinger teksten beskriver."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Norske myndigheter og politi deltok i arrestasjoner og deportasjoner. Andre hjalp jøder med å flykte. Vi må undersøke ansvar konkret.",
        "normal": "Norske myndigheter og politi deltok i arrestasjoner og deportasjoner, mens andre hjalp mennesker på flukt. Ansvaret må knyttes til handlinger og aktører, uten kollektiv skyld."
      }
    }
  ],
  "kaldkrig": [
    {
      "stem": {
        "easy": "Hvorfor kalles perioden den kalde krigen?",
        "normal": "Hva forklarer betegnelsen den kalde krigen?"
      },
      "options": [
        {
          "text": {
            "easy": "Supermaktene sluttet å bruke militær makt",
            "normal": "Supermaktene avsto fra all bruk av militær makt"
          },
          "feedback": {
            "easy": "Les om krigene og støtten til ulike parter.",
            "normal": "Undersøk om påstanden passer med eksemplene på militær aktivitet i teksten."
          }
        },
        {
          "text": {
            "easy": "Væpnede konflikter mellom land tok helt slutt",
            "normal": "Væpnede konflikter mellom stater tok slutt i perioden"
          },
          "feedback": {
            "easy": "Se etter eksemplene fra Korea og Vietnam.",
            "normal": "Sammenlign påstanden med krigene som omtales i teksten."
          }
        },
        {
          "text": {
            "easy": "Supermaktene unngikk direkte storkrig mot hverandre",
            "normal": "Supermaktene unngikk en direkte storkrig mot hverandre"
          },
          "feedback": {
            "easy": "Ja. «Kald» betyr likevel ikke fred for alle.",
            "normal": "Ja. Det beskriver forholdet mellom supermaktene, uten å gjøre perioden fredelig."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "USA og Sovjetunionen unngikk direkte storkrig. Men kriger i blant annet Korea og Vietnam kostet mange liv.",
        "normal": "Supermaktene unngikk en direkte storkrig mot hverandre. Betegnelsen kan likevel skjule de blodige krigene i blant annet Korea og Vietnam."
      }
    },
    {
      "stem": {
        "easy": "Hvilken beskrivelse passer på Sovjetunionen?",
        "normal": "Hvilken kombinasjon beskriver styresett og økonomi i Sovjetunionen?"
      },
      "options": [
        {
          "text": {
            "easy": "Flerpartidemokrati og en økonomi styrt av markedet",
            "normal": "Et flerpartidemokrati med en økonomi styrt av markedet"
          },
          "feedback": {
            "easy": "Se hvem som kontrollerte staten og økonomien.",
            "normal": "Undersøk både opposisjonens stilling og hvordan økonomien ble organisert."
          }
        },
        {
          "text": {
            "easy": "Ettpartidiktatur og en økonomi styrt gjennom planer",
            "normal": "Et kommunistisk ettpartidiktatur med en statlig planlagt økonomi"
          },
          "feedback": {
            "easy": "Ja. Dette beskriver både makten og økonomien.",
            "normal": "Ja. Beskrivelsen skiller samtidig mellom politisk makt og økonomisk organisering."
          }
        },
        {
          "text": {
            "easy": "Ettpartidiktatur og en økonomi styrt av markedet",
            "normal": "Et kommunistisk ettpartidiktatur med en økonomi styrt av markedet"
          },
          "feedback": {
            "easy": "Les delen om hvordan økonomien var organisert.",
            "normal": "Styresett og økonomi må vurderes hver for seg. Undersøk den økonomiske delen av beskrivelsen."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Sovjetunionen hadde kommunistisk ettpartidiktatur og planøkonomi. Styresett og økonomisk system er to ulike sider ved et samfunn.",
        "normal": "Sovjetunionen kombinerte kommunistisk ettpartidiktatur med planøkonomi. Det politiske styresettet må skilles fra måten økonomien organiseres på."
      }
    },
    {
      "stem": {
        "easy": "Hva forbindes med slutten på den kalde krigen?",
        "normal": "Hvilket hendelsespar forbindes med slutten på den kalde krigen?"
      },
      "options": [
        {
          "text": {
            "easy": "Berlinmuren åpnet, og Sovjetunionen ble oppløst",
            "normal": "Berlinmuren ble åpnet, og Sovjetunionen gikk i oppløsning"
          },
          "feedback": {
            "easy": "Ja. Dette skjedde i 1989 og 1991.",
            "normal": "Ja. Hendelsene inngår i avslutningen rundt 1989–1991."
          }
        },
        {
          "text": {
            "easy": "Tyskland kapitulerte, og FN ble opprettet",
            "normal": "Tyskland kapitulerte, og De forente nasjoner ble opprettet"
          },
          "feedback": {
            "easy": "Se hvor disse hendelsene står på tidslinjen.",
            "normal": "Undersøk om dette er hendelser ved periodens begynnelse eller avslutning."
          }
        },
        {
          "text": {
            "easy": "NATO ble dannet, og Berlinmuren ble bygget",
            "normal": "NATO ble dannet, og Berlinmuren ble bygget"
          },
          "feedback": {
            "easy": "Se etter hvordan disse hendelsene påvirket delingen.",
            "normal": "Undersøk om disse hendelsene svekket eller tydeliggjorde den kalde krigens deling."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Berlinmuren åpnet i 1989. Sovjetunionen ble oppløst i 1991. Slutten skjedde over flere år.",
        "normal": "Åpningen av Berlinmuren i 1989 og Sovjetunionens oppløsning i 1991 forbindes med avslutningen. Det var et forløp med flere årsaker og hendelser."
      }
    }
  ],
  "kriser": [
    {
      "stem": {
        "easy": "Hvorfor bygde DDR Berlinmuren?",
        "normal": "Hva var et sentralt formål med DDR-regimets bygging av Berlinmuren?"
      },
      "options": [
        {
          "text": {
            "easy": "Å stanse innvandring fra Vest-Tyskland til DDR",
            "normal": "Å stanse en omfattende innvandring fra Vest-Tyskland til DDR"
          },
          "feedback": {
            "easy": "Se på hvilken vei menneskene flyktet.",
            "normal": "Undersøk bevegelsesretningen i teksten og hva DDR-regimet ønsket å hindre."
          }
        },
        {
          "text": {
            "easy": "Å stanse flukten fra DDR via Vest-Berlin",
            "normal": "Å stanse innbyggernes flukt fra DDR gjennom Vest-Berlin"
          },
          "feedback": {
            "easy": "Ja. Muren skulle hindre folk i å forlate DDR.",
            "normal": "Ja. Det sentrale var å hindre flukten vestover."
          }
        },
        {
          "text": {
            "easy": "Å stanse en varslet invasjon fra Vest-Berlin",
            "normal": "Å stanse en nært forestående militær invasjon fra Vest-Berlin"
          },
          "feedback": {
            "easy": "Skill mellom regimets budskap og formålet teksten forklarer.",
            "normal": "Undersøk skillet mellom regimets framstilling av beskyttelse og den dokumenterte grensepolitikken."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "DDR ville stoppe folk som flyktet fra øst via Vest-Berlin. Muren begrenset bevegelsesfriheten og skilte familier.",
        "normal": "DDR-regimet ville stanse flukten fra Øst-Tyskland via Vest-Berlin. Muren var derfor en begrensning av innbyggernes bevegelsesfrihet, ikke bare et symbol."
      }
    },
    {
      "stem": {
        "easy": "Hvorfor ble rakettene på Cuba en farlig krise?",
        "normal": "Hvorfor utløste de sovjetiske rakettene på Cuba en internasjonal krise?"
      },
      "options": [
        {
          "text": {
            "easy": "Atomraketter nær USA økte faren for storkrig",
            "normal": "Sovjetiske atomraketter nær USA økte faren for direkte storkrig"
          },
          "feedback": {
            "easy": "Ja. Atomvåpen og mottiltak gjorde konflikten farlig.",
            "normal": "Ja. Plasseringen og reaksjonene gjorde konflikten til en fare for direkte storkrig."
          }
        },
        {
          "text": {
            "easy": "Atomrakettene på Cuba hadde allerede rammet USA",
            "normal": "Sovjetiske atomraketter på Cuba hadde allerede rammet amerikansk territorium"
          },
          "feedback": {
            "easy": "Skill mellom fare for et angrep og et faktisk angrep.",
            "normal": "Skill mellom fare for et angrep og et faktisk angrep."
          }
        },
        {
          "text": {
            "easy": "Amerikanske atomraketter på Cuba truet Sovjetunionen",
            "normal": "Amerikanske atomraketter på Cuba truet Sovjetunionens sikkerhet"
          },
          "feedback": {
            "easy": "Kontroller hvem som plasserte raketter på Cuba.",
            "normal": "Kontroller hvem som plasserte raketter på Cuba."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Atomraketter nær USA endret trusselbildet. Supermaktenes reaksjoner skapte fare for atomkrig. Cuba hadde også egne interesser.",
        "normal": "Sovjetiske atomraketter nær USA utfordret sikkerhetsbalansen. Militære mottiltak og mulige feilvurderinger skapte fare for direkte konflikt og atomkrig."
      }
    },
    {
      "stem": {
        "easy": "Hva bidro til å løse Cubakrisen?",
        "normal": "Hva kjennetegnet løsningen på Cubakrisen?"
      },
      "options": [
        {
          "text": {
            "easy": "USA fjernet sine atomraketter fra Cuba",
            "normal": "USA fjernet sine atomraketter fra Cuba etter forhandlingene"
          },
          "feedback": {
            "easy": "Les hvem som hadde plassert rakettene på Cuba.",
            "normal": "Undersøk rakettenes eierskap og plassering før du vurderer tilbaketrekkingen."
          }
        },
        {
          "text": {
            "easy": "Bare Sovjetunionen måtte gi løfter og trekke seg",
            "normal": "Bare Sovjetunionen ga løfter og gjennomførte militære tilbaketrekkinger"
          },
          "feedback": {
            "easy": "Les også om hva USA lovet og avtalte.",
            "normal": "Undersøk både den offentlige og den hemmelige delen av løsningen."
          }
        },
        {
          "text": {
            "easy": "Begge sider ga løfter og avtalte tilbaketrekkinger",
            "normal": "Begge supermaktene ga løfter og avtalte militære tilbaketrekkinger"
          },
          "feedback": {
            "easy": "Ja. Forhandlinger førte til et kompromiss.",
            "normal": "Ja. Løsningen omfattet gjensidige forpliktelser, selv om ikke alt var offentlig."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Begge supermaktene ga løfter. Sovjetunionen fjernet rakettene fra Cuba. USA lovet å ikke invadere og avtalte å fjerne raketter i Tyrkia.",
        "normal": "Forhandlingene omfattet sovjetisk tilbaketrekking fra Cuba, et amerikansk løfte om ikke å invadere og en hemmelig avtale om amerikanske raketter i Tyrkia."
      }
    }
  ],
  "kilder": [
    {
      "stem": {
        "easy": "Hva kan en propagandatale vise oss?",
        "normal": "Hva kan en propagandatale særlig brukes som kilde til?"
      },
      "options": [
        {
          "text": {
            "easy": "Hvordan avsenderen forsøkte å påvirke mottakerne",
            "normal": "Hvordan avsenderen forsøkte å påvirke mottakernes syn på saken"
          },
          "feedback": {
            "easy": "Ja. Formål og budskap er viktig informasjon.",
            "normal": "Ja. Talen er direkte dokumentasjon av det budskapet avsenderen framførte."
          }
        },
        {
          "text": {
            "easy": "Hva motparten faktisk planla å gjøre",
            "normal": "Hva motpartens ledere faktisk planla å gjennomføre"
          },
          "feedback": {
            "easy": "Kan taleren dokumentere hva motparten tenkte? Les om kildens grenser.",
            "normal": "Skill mellom avsenderens framstilling av motparten og dokumentasjon av motpartens egne planer."
          }
        },
        {
          "text": {
            "easy": "Hvordan alle tilhørerne oppfattet det som ble sagt",
            "normal": "Hvordan samtlige mottakere oppfattet det framførte budskapet"
          },
          "feedback": {
            "easy": "Viser talen også hvordan folk reagerte? Les teksten igjen.",
            "normal": "En framført tale og mottakernes reaksjoner er ulike undersøkelsesspørsmål. Vurder hva kilden faktisk dokumenterer."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Talen kan vise hva avsenderen ville at folk skulle tro. Påstandene om det som skjedde, må undersøkes i andre kilder.",
        "normal": "En propagandatale kan vise avsenderens budskap og påvirkningsforsøk. Det betyr ikke at dens beskrivelse av motparten eller hendelsene er pålitelig."
      }
    },
    {
      "stem": {
        "easy": "Tre nettsider bruker samme kilde. Hva betyr det?",
        "normal": "Tre nettsteder har kopiert samme opprinnelige påstand. Hvordan bør det vurderes?"
      },
      "options": [
        {
          "text": {
            "easy": "Tre ulike nettsider gir tre uavhengige bekreftelser",
            "normal": "Tre forskjellige nettsteder gir automatisk tre uavhengige bekreftelser"
          },
          "feedback": {
            "easy": "Se hvor opplysningene kommer fra, ikke bare hvor de står.",
            "normal": "Undersøk opplysningenes felles opphav før du teller nettstedene som selvstendige bekreftelser."
          }
        },
        {
          "text": {
            "easy": "Kopiering viser at påstanden må være falsk",
            "normal": "Felles opphav viser at den opprinnelige påstanden er falsk"
          },
          "feedback": {
            "easy": "Gjør kopiering en opplysning usann? Undersøk innholdet også.",
            "normal": "Kildeavhengighet og sannhetsverdi er ulike spørsmål. Vurder hva kopieringen faktisk kan fortelle."
          }
        },
        {
          "text": {
            "easy": "Nettsidene gir ikke tre uavhengige bekreftelser",
            "normal": "Nettstedene gir ikke tre uavhengige bekreftelser av påstanden"
          },
          "feedback": {
            "easy": "Ja. Opplysningene har samme opphav.",
            "normal": "Ja. Antall nettsteder er ikke det samme som antall uavhengige kilder."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Tre kopier er ikke tre uavhengige bekreftelser. Finn den opprinnelige kilden og undersøk om andre, uavhengige kilder støtter påstanden.",
        "normal": "Nettstedene er ikke uavhengige bekreftelser når opplysningene kommer fra samme opphav. Kildeavhengighet må undersøkes før gjentakelsen brukes som støtte."
      }
    },
    {
      "stem": {
        "easy": "To kilder er uenige. Hva bør du gjøre?",
        "normal": "Hvordan bør motstridende påstander fra to kilder undersøkes?"
      },
      "options": [
        {
          "text": {
            "easy": "Velge påstanden som flest personer har delt",
            "normal": "Velge påstanden som har flest delinger og tilhengere"
          },
          "feedback": {
            "easy": "Viser mange delinger at en påstand er dokumentert?",
            "normal": "Undersøk forholdet mellom popularitet og dokumentasjon. Kan mange ha gjentatt samme opphav?"
          }
        },
        {
          "text": {
            "easy": "Sjekke opplysningene og sammenligne flere kilder",
            "normal": "Undersøke dokumentasjonen og sammenligne flere relevante, uavhengige kilder"
          },
          "feedback": {
            "easy": "Ja. Påstander må vurderes med belegg.",
            "normal": "Ja. Det gir et grunnlag for å vurdere hvor godt påstandene er underbygd."
          }
        },
        {
          "text": {
            "easy": "Velge en forklaring midt mellom de to",
            "normal": "Anta at den riktige forklaringen ligger midt imellom"
          },
          "feedback": {
            "easy": "Må to påstander ha like mye støtte? Les teksten.",
            "normal": "En mellomposisjon er ikke i seg selv dokumentasjon. Undersøk hvor god støtte hver påstand har."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Undersøk dokumentasjonen og sammenlign relevante kilder. Sannheten ligger ikke alltid midt mellom to påstander.",
        "normal": "Undersøk dokumentasjon, avsender, sammenheng og kildeavhengighet. Ulike perspektiver er ikke nødvendigvis like godt underbygd, og sannheten trenger ikke ligge midt imellom."
      }
    }
  ],
  "fred": [
    {
      "stem": {
        "easy": "Hva skal FN blant annet arbeide for?",
        "normal": "Hva er et sentralt formål med FN?"
      },
      "options": [
        {
          "text": {
            "easy": "Å forsvare medlemsland mot militære angrep",
            "normal": "Å forsvare medlemsstatene militært ved ethvert væpnet angrep"
          },
          "feedback": {
            "easy": "Skill mellom FN og en militær forsvarsallianse.",
            "normal": "Undersøk skillet mellom FNs formål og en militærallianses forsvarsforpliktelser."
          }
        },
        {
          "text": {
            "easy": "Å vedta nasjonale lover for medlemslandene",
            "normal": "Å vedta nasjonale lover på vegne av medlemsstatene"
          },
          "feedback": {
            "easy": "Undersøk forskjellen på samarbeid mellom land og nasjonal styring.",
            "normal": "Undersøk hvilken myndighet medlemsstatene har, og hva FN-pakten oppretter."
          }
        },
        {
          "text": {
            "easy": "Å samarbeide om fred og menneskerettigheter",
            "normal": "Å arbeide for internasjonal fred, sikkerhet og menneskerettigheter"
          },
          "feedback": {
            "easy": "Ja. Dette er blant FNs sentrale formål.",
            "normal": "Ja. Det er et formål som organisasjonen søker å oppnå gjennom samarbeid."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "FN skal blant annet arbeide for internasjonal fred og sikkerhet. Uenighet mellom medlemsland kan gjøre arbeidet vanskelig.",
        "normal": "Internasjonal fred og sikkerhet er et sentralt formål. FN er avhengig av medlemsstatenes handlinger, og motsetninger kan begrense felles tiltak."
      }
    },
    {
      "stem": {
        "easy": "Hva er riktig om Verdenserklæringen fra 1948?",
        "normal": "Hvordan bør Verdenserklæringens rettslige status beskrives?"
      },
      "options": [
        {
          "text": {
            "easy": "Den er selv en bindende traktat for alle",
            "normal": "Den er i seg selv en bindende traktat for alle stater"
          },
          "feedback": {
            "easy": "Se forskjellen mellom en erklæring og en traktat.",
            "normal": "Undersøk skillet mellom erklæringens status og forpliktelsene i senere konvensjoner."
          }
        },
        {
          "text": {
            "easy": "Den er viktig, men ikke selv en bindende traktat",
            "normal": "Den er viktig, men ikke i seg selv en bindende traktat"
          },
          "feedback": {
            "easy": "Ja. Senere avtaler har gitt rettslige forpliktelser.",
            "normal": "Ja. Skill mellom erklæringens betydning som norm og konkrete traktatforpliktelser."
          }
        },
        {
          "text": {
            "easy": "Den gjelder bare land som var med i 1948",
            "normal": "Den uttrykker rettigheter bare for innbyggere i medlemsland i 1948"
          },
          "feedback": {
            "easy": "Les hvem som har rettighetene i erklæringen.",
            "normal": "Du begrenser rettighetene til en bestemt gruppe stater. Undersøk hva universelle rettigheter innebærer her."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Den er en viktig erklæring om rettigheter, men er ikke selv en bindende traktat. Senere konvensjoner gir stater rettslige forpliktelser.",
        "normal": "Verdenserklæringen har stor normativ betydning, men er ikke i seg selv en bindende traktat. Senere konvensjoner etablerer traktatforpliktelser for stater som er bundet av dem."
      }
    },
    {
      "stem": {
        "easy": "Hvordan kan vi vurdere en militærallianse?",
        "normal": "Hvilken vurdering av militære allianser tar hensyn til flere mulige virkninger?"
      },
      "options": [
        {
          "text": {
            "easy": "Den kan hindre angrep og øke andres frykt",
            "normal": "Den kan avskrekke angrep og samtidig øke andre staters frykt"
          },
          "feedback": {
            "easy": "Ja. Det samme tiltaket kan ha flere virkninger.",
            "normal": "Ja. Vurderingen åpner for flere virkninger som må undersøkes i sammenheng."
          }
        },
        {
          "text": {
            "easy": "Den reduserer alltid frykten hos alle andre land",
            "normal": "Den reduserer alltid trusselopplevelsen hos samtlige andre stater"
          },
          "feedback": {
            "easy": "Kan alle land oppleve den samme alliansen likt?",
            "normal": "Undersøk om andre stater nødvendigvis tolker alliansens militære styrke slik medlemmene gjør."
          }
        },
        {
          "text": {
            "easy": "Den gjør krig uunngåelig for landene rundt",
            "normal": "Den gjør væpnet konflikt uunngåelig for de omkringliggende statene"
          },
          "feedback": {
            "easy": "Les om mulige virkninger. Er krig bestemt på forhånd?",
            "normal": "Du gjør en mulig spenning til en uunngåelig følge. Undersøk hvilken støtte teksten gir for det."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "En allianse kan gjøre et angrep mindre sannsynlig. Samtidig kan andre land føle seg truet. Vi må undersøke situasjonen og følgene.",
        "normal": "Militære allianser kan avskrekke angrep, men også øke andre staters frykt. En vurdering må undersøke situasjonen, virkemåten og faktiske konsekvenser."
      }
    }
  ],
  "idag": [
    {
      "stem": {
        "easy": "Hva viser radikalisering mot vold?",
        "normal": "Hvilket eksempel viser radikalisering mot vold?"
      },
      "options": [
        {
          "text": {
            "easy": "Å støtte vold for politiske mål",
            "normal": "Å godta vold for å oppnå politiske mål"
          },
          "feedback": {
            "easy": "Ja. Her handler begrepet om å godta vold.",
            "normal": "Ja. Avgjørende her er aksept for vold, ikke graden av politisk uenighet."
          }
        },
        {
          "text": {
            "easy": "Å kritisere en regjering med sterke ord",
            "normal": "Å kritisere en regjering gjennom sterke offentlige uttalelser"
          },
          "feedback": {
            "easy": "Skill mellom sterk kritikk og synet på vold.",
            "normal": "Undersøk om eksemplet sier noe om aksept for vold eller bare om politisk uenighet."
          }
        },
        {
          "text": {
            "easy": "Å delta i en fredelig demonstrasjon",
            "normal": "Å delta i en fredelig demonstrasjon mot regjeringen"
          },
          "feedback": {
            "easy": "Undersøk forskjellen på fredelig deltakelse og støtte til vold.",
            "normal": "Undersøk hvilken handling som beskrives, før du bruker begrepet radikalisering mot vold."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Å godta vold for politiske mål viser radikalisering mot vold. Fredelig protest er demokratisk deltakelse.",
        "normal": "Begrepet handler om utvikling mot aksept for eller støtte til vold. Sterk kritikk og fredelig protest er ikke i seg selv voldelig ekstremisme."
      }
    },
    {
      "stem": {
        "easy": "Hvordan kan vi forklare radikalisering mot vold?",
        "normal": "Hvilken forklaring tar hensyn til hvordan radikalisering kan foregå?"
      },
      "options": [
        {
          "text": {
            "easy": "Utenforskap forklarer alene hvem som blir terrorist",
            "normal": "Utenforskap forklarer alene hvilke personer som blir terrorister"
          },
          "feedback": {
            "easy": "Kan ett forhold forklare både deltakelse og alle valg?",
            "normal": "Undersøk hva en enkeltfaktor kan og ikke kan forklare om menneskers ulike valg."
          }
        },
        {
          "text": {
            "easy": "Prosessen følger de samme trinnene hos alle",
            "normal": "Prosessen følger de samme faste trinnene hos alle personer"
          },
          "feedback": {
            "easy": "Les om forskjellene mellom personer og forløp.",
            "normal": "Undersøk om kilden beskriver én fast utvikling eller ulike forløp."
          }
        },
        {
          "text": {
            "easy": "Flere forhold kan virke sammen over tid",
            "normal": "Flere forhold kan virke sammen på ulike måter"
          },
          "feedback": {
            "easy": "Ja. Årsakene og utviklingen kan være ulike.",
            "normal": "Ja. Ideologi, miljøer og erfaringer kan virke sammen uten et forutbestemt resultat."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Det finnes ingen enkelt årsak eller fast vei til terror. Flere forhold og valg kan ha betydning.",
        "normal": "Radikalisering er ikke en fast trapp. Flere forhold kan virke sammen, og utviklingen fører ikke nødvendigvis til terror."
      }
    },
    {
      "stem": {
        "easy": "Hva kan FN-vedtaket fra mars 2022 vise?",
        "normal": "Hva dokumenterer resolusjon ES-11/1 fra mars 2022 først og fremst?"
      },
      "options": [
        {
          "text": {
            "easy": "Hvordan krigen utvikler seg akkurat nå",
            "normal": "Hvordan krigen utvikler seg på dagens dato"
          },
          "feedback": {
            "easy": "Se på kildens dato og spørsmålet du vil svare på.",
            "normal": "Undersøk tidsavstanden mellom dokumentet og den situasjonen du vil beskrive."
          }
        },
        {
          "text": {
            "easy": "Hva FNs generalforsamling vedtok på den datoen",
            "normal": "Hva FNs generalforsamling vedtok den bestemte datoen"
          },
          "feedback": {
            "easy": "Ja. Dokumentet viser et datert vedtak.",
            "normal": "Ja. Resolusjonen er en primærkilde til generalforsamlingens vedtak på den datoen."
          }
        },
        {
          "text": {
            "easy": "Hvilke årsaker som forklarer hele krigen",
            "normal": "Hvilke årsaker som alene forklarer hele krigen"
          },
          "feedback": {
            "easy": "Undersøk dokumentets formål. Forklarer det alle årsakene?",
            "normal": "Undersøk hva slags dokument dette er, og hvilket spørsmål det kan belyse."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Kilden viser hva generalforsamlingen vedtok i mars 2022. Den viser ikke alene dagens situasjon.",
        "normal": "En datert resolusjon dokumenterer vedtaket, men er ikke alene en oppdatert situasjonsbeskrivelse eller full årsaksforklaring."
      }
    }
  ]
};
