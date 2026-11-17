'use strict';
const QUIZ_VERSION=1;
const QUIZ_BANK={
  "ord": [
    {
      "stem": {
        "easy": "Hva er inntekt?",
        "normal": "Hva betyr inntekt?"
      },
      "options": [
        {
          "text": {
            "easy": "Penger som kommer inn",
            "normal": "Penger som kommer inn"
          },
          "feedback": {
            "easy": "Riktig. Inntekt er penger som kommer inn over en periode.",
            "normal": "Riktig. Inntekt er penger som kommer inn over en periode."
          }
        },
        {
          "text": {
            "easy": "Verdien av alt du eier",
            "normal": "Verdien av alt du eier"
          },
          "feedback": {
            "easy": "Tenk på hva du eier, og hva som kommer inn.",
            "normal": "Tenk på hva du eier, og hva som kommer inn."
          }
        },
        {
          "text": {
            "easy": "Penger som du skylder",
            "normal": "Penger som du skylder"
          },
          "feedback": {
            "easy": "Se på ordet gjeld i ordlisten.",
            "normal": "Se på ordet gjeld i ordlisten."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Inntekt er penger som kommer inn over en periode.",
        "normal": "Inntekt er penger som kommer inn over en periode."
      }
    },
    {
      "stem": {
        "easy": "Hva er gjeld?",
        "normal": "Hva betyr gjeld?"
      },
      "options": [
        {
          "text": {
            "easy": "Penger du får fra arbeid",
            "normal": "Penger du får fra arbeid"
          },
          "feedback": {
            "easy": "Se på forklaringen av inntekt.",
            "normal": "Se på forklaringen av inntekt."
          }
        },
        {
          "text": {
            "easy": "Penger du skal betale tilbake",
            "normal": "Penger du skal betale tilbake"
          },
          "feedback": {
            "easy": "Riktig. Gjeld er penger du skylder og må betale tilbake.",
            "normal": "Riktig. Gjeld er penger du skylder og må betale tilbake."
          }
        },
        {
          "text": {
            "easy": "Verdier som du selv eier",
            "normal": "Verdier som du selv eier"
          },
          "feedback": {
            "easy": "Undersøk forskjellen mellom eiendeler og lån.",
            "normal": "Undersøk forskjellen mellom eiendeler og lån."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Gjeld er penger du skylder og må betale tilbake.",
        "normal": "Gjeld er penger du skylder og må betale tilbake."
      }
    },
    {
      "stem": {
        "easy": "Hva er formue?",
        "normal": "Hvordan finner vi formue?"
      },
      "options": [
        {
          "text": {
            "easy": "Inntekt minus faste utgifter",
            "normal": "Inntekt minus faste utgifter"
          },
          "feedback": {
            "easy": "Se på forskjellen mellom formue og budsjett.",
            "normal": "Se på forskjellen mellom formue og budsjett."
          }
        },
        {
          "text": {
            "easy": "Gjeld pluss alle eiendeler",
            "normal": "Gjeld pluss alle eiendeler"
          },
          "feedback": {
            "easy": "Tenk på hvordan gjeld påvirker det du eier.",
            "normal": "Tenk på hvordan gjeld påvirker det du eier."
          }
        },
        {
          "text": {
            "easy": "Eiendeler minus all gjeld",
            "normal": "Eiendeler minus all gjeld"
          },
          "feedback": {
            "easy": "Riktig. Formue er verdien av eiendelene minus gjelden.",
            "normal": "Riktig. Formue er verdien av eiendelene minus gjelden."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Formue er verdien av eiendelene minus gjelden.",
        "normal": "Formue er verdien av eiendelene minus gjelden."
      }
    }
  ],
  "lk-levekar": [
    {
      "stem": {
        "easy": "Hva betyr levekår?",
        "normal": "Hva betyr levekår?"
      },
      "options": [
        {
          "text": {
            "easy": "Penger og eiendeler en person har",
            "normal": "Penger og eiendeler en person har"
          },
          "feedback": {
            "easy": "Se hvordan teksten skiller mellom penger og flere sider av hverdagen.",
            "normal": "Se hvordan teksten skiller mellom penger og flere sider av hverdagen."
          }
        },
        {
          "text": {
            "easy": "Bolig, helse og andre livsforhold",
            "normal": "Bolig, helse og andre livsforhold"
          },
          "feedback": {
            "easy": "Dette omfatter flere sider av livet.",
            "normal": "Dette omfatter flere sider av livet."
          }
        },
        {
          "text": {
            "easy": "Følelsene en person har om livet",
            "normal": "Følelsene en person har om livet"
          },
          "feedback": {
            "easy": "Undersøk forskjellen mellom forholdene vi lever under og hvordan vi opplever livet.",
            "normal": "Undersøk forskjellen mellom forholdene vi lever under og hvordan vi opplever livet."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Levekår omfatter blant annet bolig, helse, utdanning, arbeid og trygghet.",
        "normal": "Levekår omfatter blant annet bolig, helse, utdanning, arbeid og trygghet."
      }
    },
    {
      "stem": {
        "easy": "Hva er livskvalitet?",
        "normal": "Hva betyr livskvalitet?"
      },
      "options": [
        {
          "text": {
            "easy": "Hvordan en opplever livet",
            "normal": "Hvordan en opplever livet"
          },
          "feedback": {
            "easy": "Riktig. Livskvalitet handler om hvordan en person opplever livet.",
            "normal": "Riktig. Livskvalitet handler om hvordan en person opplever livet."
          }
        },
        {
          "text": {
            "easy": "Hvor mye en eier",
            "normal": "Hvor mye en eier"
          },
          "feedback": {
            "easy": "Se på forskjellen mellom levestandard og livskvalitet.",
            "normal": "Se på forskjellen mellom levestandard og livskvalitet."
          }
        },
        {
          "text": {
            "easy": "Hvor stor lønna er",
            "normal": "Hvor stor lønna er"
          },
          "feedback": {
            "easy": "Tenk på om lønn forteller hele historien.",
            "normal": "Tenk på om lønn forteller hele historien."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Livskvalitet handler om hvordan en person opplever livet.",
        "normal": "Livskvalitet handler om hvordan en person opplever livet."
      }
    },
    {
      "stem": {
        "easy": "Inntekten øker, mens helsen blir verre. Hva kan vi slutte?",
        "normal": "Inntekten øker, mens helsen blir verre. Hva kan vi slutte?"
      },
      "options": [
        {
          "text": {
            "easy": "Høyere inntekt viser høyere livskvalitet",
            "normal": "Høyere inntekt viser høyere livskvalitet"
          },
          "feedback": {
            "easy": "Undersøk om ett inntektstall forteller alt om personens liv.",
            "normal": "Undersøk om ett inntektstall forteller alt om personens liv."
          }
        },
        {
          "text": {
            "easy": "Dårligere helse viser at lønnen faller",
            "normal": "Dårligere helse viser at lønnen faller"
          },
          "feedback": {
            "easy": "Hvilke opplysninger om lønn står faktisk i situasjonen?",
            "normal": "Hvilke opplysninger om lønn står faktisk i situasjonen?"
          }
        },
        {
          "text": {
            "easy": "Livskvaliteten kan fortsatt være lav",
            "normal": "Livskvaliteten kan fortsatt være lav"
          },
          "feedback": {
            "easy": "Flere forhold kan påvirke opplevelsen.",
            "normal": "Flere forhold kan påvirke opplevelsen."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Penger kan gjøre hverdagen lettere, men helse og andre forhold påvirker også livskvaliteten.",
        "normal": "Penger kan gjøre hverdagen lettere, men helse og andre forhold påvirker også livskvaliteten."
      }
    }
  ],
  "lk-fattigdom": [
    {
      "stem": {
        "easy": "Hva betyr relativ fattigdom?",
        "normal": "Hva betyr relativ fattigdom?"
      },
      "options": [
        {
          "text": {
            "easy": "Lavere lønn enn landets gjennomsnitt",
            "normal": "Lavere lønn enn landets gjennomsnitt"
          },
          "feedback": {
            "easy": "Se om en plassering under gjennomsnittet forteller nok om behov og deltakelse.",
            "normal": "Se om en plassering under gjennomsnittet forteller nok om behov og deltakelse."
          }
        },
        {
          "text": {
            "easy": "For lite til mat og bolig",
            "normal": "For lite til mat og bolig"
          },
          "feedback": {
            "easy": "Sammenlign forklaringene av absolutt og relativ fattigdom.",
            "normal": "Sammenlign forklaringene av absolutt og relativ fattigdom."
          }
        },
        {
          "text": {
            "easy": "For lite til vanlig sosial deltakelse",
            "normal": "For lite til vanlig sosial deltakelse"
          },
          "feedback": {
            "easy": "Dette knytter økonomien til deltakelse.",
            "normal": "Dette knytter økonomien til deltakelse."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Relativ fattigdom handler om så begrensede ressurser at rimelig deltakelse i samfunnet blir vanskelig.",
        "normal": "Relativ fattigdom handler om så begrensede ressurser at rimelig deltakelse i samfunnet blir vanskelig."
      }
    },
    {
      "stem": {
        "easy": "Hva betyr absolutt fattigdom?",
        "normal": "Hva betyr absolutt fattigdom?"
      },
      "options": [
        {
          "text": {
            "easy": "Mangel på nødvendig mat og bolig",
            "normal": "Mangel på nødvendig mat og bolig"
          },
          "feedback": {
            "easy": "Dette gjelder grunnleggende behov.",
            "normal": "Dette gjelder grunnleggende behov."
          }
        },
        {
          "text": {
            "easy": "Lite penger til vanlige sosiale aktiviteter",
            "normal": "Lite penger til vanlige sosiale aktiviteter"
          },
          "feedback": {
            "easy": "Undersøk hvilke behov begrepet særlig handler om.",
            "normal": "Undersøk hvilke behov begrepet særlig handler om."
          }
        },
        {
          "text": {
            "easy": "Lav inntekt sammenlignet med andre innbyggere",
            "normal": "Lav inntekt sammenlignet med andre innbyggere"
          },
          "feedback": {
            "easy": "Sammenlign en inntektsplassering med hva personen faktisk mangler.",
            "normal": "Sammenlign en inntektsplassering med hva personen faktisk mangler."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Absolutt fattigdom handler om at grunnleggende behov som mat, klær og bolig ikke er dekket.",
        "normal": "Absolutt fattigdom handler om at grunnleggende behov som mat, klær og bolig ikke er dekket."
      }
    },
    {
      "stem": {
        "easy": "Hvorfor undersøke mer enn inntekt?",
        "normal": "Hvorfor undersøke mer enn inntekt?"
      },
      "options": [
        {
          "text": {
            "easy": "Lik lønn gir samme kjøpekraft",
            "normal": "Lik lønn gir samme kjøpekraft"
          },
          "feedback": {
            "easy": "Hva vet vi om priser og utgifter for personene?",
            "normal": "Hva vet vi om priser og utgifter for personene?"
          }
        },
        {
          "text": {
            "easy": "Gjeld, eiendeler og utgifter varierer",
            "normal": "Gjeld, eiendeler og utgifter varierer"
          },
          "feedback": {
            "easy": "Flere forhold påvirker økonomien.",
            "normal": "Flere forhold påvirker økonomien."
          }
        },
        {
          "text": {
            "easy": "Inntekt og formue måler samme verdi",
            "normal": "Inntekt og formue måler samme verdi"
          },
          "feedback": {
            "easy": "Se hva som kommer inn over tid, og hva som eies på et tidspunkt.",
            "normal": "Se hva som kommer inn over tid, og hva som eies på et tidspunkt."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Lik inntekt kan gi ulike muligheter når utgifter, eiendeler og gjeld er forskjellige.",
        "normal": "Lik inntekt kan gi ulike muligheter når utgifter, eiendeler og gjeld er forskjellige."
      }
    }
  ],
  "lk-maling": [
    {
      "stem": {
        "easy": "Hva viser BNP per innbygger?",
        "normal": "Hva viser BNP per innbygger?"
      },
      "options": [
        {
          "text": {
            "easy": "Verdiskaping delt på innbyggere",
            "normal": "Verdiskaping delt på innbyggere"
          },
          "feedback": {
            "easy": "Riktig. BNP per innbygger er et gjennomsnitt for verdiskaping. Det viser ikke hver persons inntekt.",
            "normal": "Riktig. BNP per innbygger er et gjennomsnitt for verdiskaping. Det viser ikke hver persons inntekt."
          }
        },
        {
          "text": {
            "easy": "Lønn til hver enkelt innbygger",
            "normal": "Lønn til hver enkelt innbygger"
          },
          "feedback": {
            "easy": "Se på forskjellen mellom verdiskaping og personlig lønn.",
            "normal": "Se på forskjellen mellom verdiskaping og personlig lønn."
          }
        },
        {
          "text": {
            "easy": "Inntekt fordelt helt likt",
            "normal": "Inntekt fordelt helt likt"
          },
          "feedback": {
            "easy": "Tenk på hva et gjennomsnitt kan skjule.",
            "normal": "Tenk på hva et gjennomsnitt kan skjule."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "BNP per innbygger er et gjennomsnitt for verdiskaping. Det viser ikke hver persons inntekt.",
        "normal": "BNP per innbygger er et gjennomsnitt for verdiskaping. Det viser ikke hver persons inntekt."
      }
    },
    {
      "stem": {
        "easy": "Hva er med i HDI?",
        "normal": "Hvilke forhold kombineres i HDI?"
      },
      "options": [
        {
          "text": {
            "easy": "Natur, handel og trygghet",
            "normal": "Natur, handel og trygghet"
          },
          "feedback": {
            "easy": "Se etter hvilke tre områder teksten nevner.",
            "normal": "Se etter hvilke tre områder teksten nevner."
          }
        },
        {
          "text": {
            "easy": "Bolig, arbeid og trygghet",
            "normal": "Bolig, arbeid og trygghet"
          },
          "feedback": {
            "easy": "Undersøk hvilke områder indeksen faktisk måler.",
            "normal": "Undersøk hvilke områder indeksen faktisk måler."
          }
        },
        {
          "text": {
            "easy": "Helse, utdanning og inntekt",
            "normal": "Helse, utdanning og inntekt"
          },
          "feedback": {
            "easy": "Riktig. HDI kombinerer helse, utdanning og BNI per innbygger.",
            "normal": "Riktig. HDI kombinerer helse, utdanning og BNI per innbygger."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "HDI kombinerer helse, utdanning og BNI per innbygger.",
        "normal": "HDI kombinerer helse, utdanning og BNI per innbygger."
      }
    },
    {
      "stem": {
        "easy": "Hva kan et gjennomsnitt skjule?",
        "normal": "Hva kan landsgjennomsnitt skjule?"
      },
      "options": [
        {
          "text": {
            "easy": "Antall personer som bor der",
            "normal": "Antall personer som bor der"
          },
          "feedback": {
            "easy": "Tenk på forskjellen mellom antall og fordeling.",
            "normal": "Tenk på forskjellen mellom antall og fordeling."
          }
        },
        {
          "text": {
            "easy": "Store forskjeller mellom mennesker",
            "normal": "Store forskjeller mellom mennesker"
          },
          "feedback": {
            "easy": "Riktig. Et gjennomsnitt kan skjule ulikhet mellom mennesker.",
            "normal": "Riktig. Et gjennomsnitt kan skjule ulikhet mellom mennesker."
          }
        },
        {
          "text": {
            "easy": "Hvilket år tallene gjelder",
            "normal": "Hvilket år tallene gjelder"
          },
          "feedback": {
            "easy": "Se på hva vi trenger i tillegg til gjennomsnittet.",
            "normal": "Se på hva vi trenger i tillegg til gjennomsnittet."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Et gjennomsnitt kan skjule ulikhet mellom mennesker.",
        "normal": "Et gjennomsnitt kan skjule ulikhet mellom mennesker."
      }
    }
  ],
  "lk-historie": [
    {
      "stem": {
        "easy": "Hva betyr kolonialisme?",
        "normal": "Hva kjennetegner kolonialisme?"
      },
      "options": [
        {
          "text": {
            "easy": "Land handler varer med hverandre",
            "normal": "Land handler varer med hverandre"
          },
          "feedback": {
            "easy": "Tenk på forskjellen mellom handel og politisk kontroll.",
            "normal": "Tenk på forskjellen mellom handel og politisk kontroll."
          }
        },
        {
          "text": {
            "easy": "En stat styrer andre områder",
            "normal": "En stat styrer andre områder"
          },
          "feedback": {
            "easy": "Riktig. Kolonialisme innebar at en stat tok kontroll over andre områder og mennesker.",
            "normal": "Riktig. Kolonialisme innebar at en stat tok kontroll over andre områder og mennesker."
          }
        },
        {
          "text": {
            "easy": "Folk flytter til nye steder",
            "normal": "Folk flytter til nye steder"
          },
          "feedback": {
            "easy": "Se etter hvem som hadde makt i teksten.",
            "normal": "Se etter hvem som hadde makt i teksten."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Kolonialisme innebar at en stat tok kontroll over andre områder og mennesker.",
        "normal": "Kolonialisme innebar at en stat tok kontroll over andre områder og mennesker."
      }
    },
    {
      "stem": {
        "easy": "En kolonimakt bygger bane fra gruven til havnen. Hvilket formål passer best?",
        "normal": "En kolonimakt bygger bane fra gruven til havnen. Hvilket formål passer best?"
      },
      "options": [
        {
          "text": {
            "easy": "Å knytte boligområder til lokale skoler",
            "normal": "Å knytte boligområder til lokale skoler"
          },
          "feedback": {
            "easy": "Undersøk hvilke steder banen i eksemplet knytter sammen.",
            "normal": "Undersøk hvilke steder banen i eksemplet knytter sammen."
          }
        },
        {
          "text": {
            "easy": "Å gjøre landet mindre avhengig av eksport",
            "normal": "Å gjøre landet mindre avhengig av eksport"
          },
          "feedback": {
            "easy": "Tenk på hva en forbindelse til en havn kan brukes til.",
            "normal": "Tenk på hva en forbindelse til en havn kan brukes til."
          }
        },
        {
          "text": {
            "easy": "Å frakte råvarer ut for salg",
            "normal": "Å frakte råvarer ut for salg"
          },
          "feedback": {
            "easy": "Dette passer med forbindelsen mellom gruve og havn.",
            "normal": "Dette passer med forbindelsen mellom gruve og havn."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Transport til havnen kan gjøre eksport av råvarer lettere. Undersøk hvem som bestemte og fikk inntektene.",
        "normal": "Transport til havnen kan gjøre eksport av råvarer lettere. Undersøk hvem som bestemte og fikk inntektene."
      }
    },
    {
      "stem": {
        "easy": "Hvorfor er olje alene en svak forklaring på norsk velstand?",
        "normal": "Hvorfor er olje alene en svak forklaring på norsk velstand?"
      },
      "options": [
        {
          "text": {
            "easy": "Industri og handel var viktige tidligere",
            "normal": "Industri og handel var viktige tidligere"
          },
          "feedback": {
            "easy": "Dette viser en lengre utvikling.",
            "normal": "Dette viser en lengre utvikling."
          }
        },
        {
          "text": {
            "easy": "Olje finansierte landets første industrielle vekst",
            "normal": "Olje finansierte landets første industrielle vekst"
          },
          "feedback": {
            "easy": "Undersøk hvilken utvikling som kom før oljeinntektene.",
            "normal": "Undersøk hvilken utvikling som kom før oljeinntektene."
          }
        },
        {
          "text": {
            "easy": "Norge hadde få ressurser før oljealderen",
            "normal": "Norge hadde få ressurser før oljealderen"
          },
          "feedback": {
            "easy": "Se etter andre naturressurser og næringer i teksten.",
            "normal": "Se etter andre naturressurser og næringer i teksten."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Norge hadde blant annet industri, skipsfart og handel før oljeinntektene. Kunnskap, organisering og politiske valg hadde også betydning.",
        "normal": "Norge hadde blant annet industri, skipsfart og handel før oljeinntektene. Kunnskap, organisering og politiske valg hadde også betydning."
      }
    }
  ],
  "lk-geografi": [
    {
      "stem": {
        "easy": "Et land finner olje. Hva kan vi slutte?",
        "normal": "Et land finner olje. Hva kan vi slutte?"
      },
      "options": [
        {
          "text": {
            "easy": "Store funn gir jevnt fordelte inntekter",
            "normal": "Store funn gir jevnt fordelte inntekter"
          },
          "feedback": {
            "easy": "Kan vi lese fordelingen direkte ut av størrelsen på funnet?",
            "normal": "Kan vi lese fordelingen direkte ut av størrelsen på funnet?"
          }
        },
        {
          "text": {
            "easy": "Landet får god tilgang til skole",
            "normal": "Landet får god tilgang til skole"
          },
          "feedback": {
            "easy": "Hva må skje mellom et ressursfunn og tilgjengelige tjenester?",
            "normal": "Hva må skje mellom et ressursfunn og tilgjengelige tjenester?"
          }
        },
        {
          "text": {
            "easy": "Fordelingen av inntektene har også betydning",
            "normal": "Fordelingen av inntektene har også betydning"
          },
          "feedback": {
            "easy": "Fordeling og bruk må undersøkes.",
            "normal": "Fordeling og bruk må undersøkes."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Naturressurser kan gi inntekter. Eierskap, fordeling og samfunnets valg påvirker hvem som får nytte av dem.",
        "normal": "Naturressurser kan gi inntekter. Eierskap, fordeling og samfunnets valg påvirker hvem som får nytte av dem."
      }
    },
    {
      "stem": {
        "easy": "Hva er infrastruktur?",
        "normal": "Hva er et eksempel på infrastruktur?"
      },
      "options": [
        {
          "text": {
            "easy": "Mat, klær og fritidsutstyr",
            "normal": "Mat, klær og fritidsutstyr"
          },
          "feedback": {
            "easy": "Tenk på hvilke systemer som gjør transport og kontakt mulig.",
            "normal": "Tenk på hvilke systemer som gjør transport og kontakt mulig."
          }
        },
        {
          "text": {
            "easy": "Veier, strøm og internett",
            "normal": "Veier, strøm og internett"
          },
          "feedback": {
            "easy": "Riktig. Infrastruktur er systemer som veier, strømnett og internett.",
            "normal": "Riktig. Infrastruktur er systemer som veier, strømnett og internett."
          }
        },
        {
          "text": {
            "easy": "Skog, fisk og andre råvarer",
            "normal": "Skog, fisk og andre råvarer"
          },
          "feedback": {
            "easy": "Se på forskjellen mellom naturressurser og samfunnets systemer.",
            "normal": "Se på forskjellen mellom naturressurser og samfunnets systemer."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Infrastruktur er systemer som veier, strømnett og internett.",
        "normal": "Infrastruktur er systemer som veier, strømnett og internett."
      }
    },
    {
      "stem": {
        "easy": "Hva er en god geografisk forklaring på levekår?",
        "normal": "Hva er en god geografisk forklaring på levekår?"
      },
      "options": [
        {
          "text": {
            "easy": "Sted virker sammen med samfunnets valg",
            "normal": "Sted virker sammen med samfunnets valg"
          },
          "feedback": {
            "easy": "Her virker flere forhold sammen.",
            "normal": "Her virker flere forhold sammen."
          }
        },
        {
          "text": {
            "easy": "Naturressurser viser hvordan inntektene blir fordelt",
            "normal": "Naturressurser viser hvordan inntektene blir fordelt"
          },
          "feedback": {
            "easy": "Undersøk om ressursene forteller hvem som eier dem og får inntektene.",
            "normal": "Undersøk om ressursene forteller hvem som eier dem og får inntektene."
          }
        },
        {
          "text": {
            "easy": "Avstanden til markedet forklarer hele livssituasjonen",
            "normal": "Avstanden til markedet forklarer hele livssituasjonen"
          },
          "feedback": {
            "easy": "Se etter andre forhold enn én avstand i teksten.",
            "normal": "Se etter andre forhold enn én avstand i teksten."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Naturforhold og avstander kan påvirke muligheter, sammen med historie, infrastruktur, økonomi og politikk.",
        "normal": "Naturforhold og avstander kan påvirke muligheter, sammen med historie, infrastruktur, økonomi og politikk."
      }
    }
  ],
  "lk-utdanning": [
    {
      "stem": {
        "easy": "Hva kan utdanning gi?",
        "normal": "Hva kan utdanning bidra til?"
      },
      "options": [
        {
          "text": {
            "easy": "Kunnskap og flere jobbmuligheter",
            "normal": "Kunnskap og flere jobbmuligheter"
          },
          "feedback": {
            "easy": "Riktig. Utdanning kan gi kunnskap og åpne muligheter, men garanterer ikke jobb.",
            "normal": "Riktig. Utdanning kan gi kunnskap og åpne muligheter, men garanterer ikke jobb."
          }
        },
        {
          "text": {
            "easy": "Sikker jobb med høy lønn",
            "normal": "Sikker jobb med høy lønn"
          },
          "feedback": {
            "easy": "Tenk på om det også må finnes ledige jobber.",
            "normal": "Tenk på om det også må finnes ledige jobber."
          }
        },
        {
          "text": {
            "easy": "Lik lønn for alle ansatte",
            "normal": "Lik lønn for alle ansatte"
          },
          "feedback": {
            "easy": "Se på forholdet mellom utdanning og lønn.",
            "normal": "Se på forholdet mellom utdanning og lønn."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Utdanning kan gi kunnskap og åpne muligheter, men garanterer ikke jobb.",
        "normal": "Utdanning kan gi kunnskap og åpne muligheter, men garanterer ikke jobb."
      }
    },
    {
      "stem": {
        "easy": "En kvalifisert søker får ikke jobb. Hva bør undersøkes?",
        "normal": "En kvalifisert søker får ikke jobb. Hva bør undersøkes?"
      },
      "options": [
        {
          "text": {
            "easy": "Om avslaget viser at søkeren mangler kunnskap",
            "normal": "Om avslaget viser at søkeren mangler kunnskap"
          },
          "feedback": {
            "easy": "Gir ett avslag nok informasjon til denne slutningen?",
            "normal": "Gir ett avslag nok informasjon til denne slutningen?"
          }
        },
        {
          "text": {
            "easy": "Jobbtilgang og arbeidsgiverens behandling av søkere",
            "normal": "Jobbtilgang og arbeidsgiverens behandling av søkere"
          },
          "feedback": {
            "easy": "Undersøk både arbeidstilgang og mulige hindringer.",
            "normal": "Undersøk både arbeidstilgang og mulige hindringer."
          }
        },
        {
          "text": {
            "easy": "Om et nytt kurs vil sikre ansettelse",
            "normal": "Om et nytt kurs vil sikre ansettelse"
          },
          "feedback": {
            "easy": "Hva vet vi om kravene og om det finnes arbeid?",
            "normal": "Hva vet vi om kravene og om det finnes arbeid?"
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Et avslag forklares ikke nødvendigvis av mangel på kompetanse. Jobbtilgang, krav og diskriminering kan også ha betydning.",
        "normal": "Et avslag forklares ikke nødvendigvis av mangel på kompetanse. Jobbtilgang, krav og diskriminering kan også ha betydning."
      }
    },
    {
      "stem": {
        "easy": "En forelder mangler transport til opplæringen. Hva kan hjelpe?",
        "normal": "En forelder mangler transport til opplæringen. Hva kan hjelpe?"
      },
      "options": [
        {
          "text": {
            "easy": "Vurdere motivasjon uten å undersøke praktiske hindringer",
            "normal": "Vurdere motivasjon uten å undersøke praktiske hindringer"
          },
          "feedback": {
            "easy": "Hvilken konkret hindring står i situasjonen?",
            "normal": "Hvilken konkret hindring står i situasjonen?"
          }
        },
        {
          "text": {
            "easy": "Tilby nytt vitnemål uten å endre transportmulighetene",
            "normal": "Tilby nytt vitnemål uten å endre transportmulighetene"
          },
          "feedback": {
            "easy": "Undersøk hvordan dette vil påvirke muligheten til å møte opp.",
            "normal": "Undersøk hvordan dette vil påvirke muligheten til å møte opp."
          }
        },
        {
          "text": {
            "easy": "Samordne transport og opplæring med personens hverdag",
            "normal": "Samordne transport og opplæring med personens hverdag"
          },
          "feedback": {
            "easy": "Tiltaket retter seg mot en praktisk hindring.",
            "normal": "Tiltaket retter seg mot en praktisk hindring."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Tilgjengelig transport og tilpasset opplæring kan åpne muligheter. Egen innsats er ikke den eneste faktoren.",
        "normal": "Tilgjengelig transport og tilpasset opplæring kan åpne muligheter. Egen innsats er ikke den eneste faktoren."
      }
    }
  ],
  "lk-forbruk": [
    {
      "stem": {
        "easy": "Hva viser et budsjett?",
        "normal": "Hva viser et budsjett?"
      },
      "options": [
        {
          "text": {
            "easy": "Verdien av eiendeler minus samlet gjeld",
            "normal": "Verdien av eiendeler minus samlet gjeld"
          },
          "feedback": {
            "easy": "Sammenlign forklaringene av formue og budsjett.",
            "normal": "Sammenlign forklaringene av formue og budsjett."
          }
        },
        {
          "text": {
            "easy": "Pengene som er brukt siste måned",
            "normal": "Pengene som er brukt siste måned"
          },
          "feedback": {
            "easy": "Undersøk forskjellen mellom det som har skjedd, og en plan.",
            "normal": "Undersøk forskjellen mellom det som har skjedd, og en plan."
          }
        },
        {
          "text": {
            "easy": "Planlagte inntekter og utgifter i en periode",
            "normal": "Planlagte inntekter og utgifter i en periode"
          },
          "feedback": {
            "easy": "Dette beskriver en økonomisk plan.",
            "normal": "Dette beskriver en økonomisk plan."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Et budsjett er en plan for inntekter og utgifter. Et regnskap viser faktiske inntekter og utgifter.",
        "normal": "Et budsjett er en plan for inntekter og utgifter. Et regnskap viser faktiske inntekter og utgifter."
      }
    },
    {
      "stem": {
        "easy": "Hva hvis utgiftene er høyere?",
        "normal": "Hva skjer når utgiftene er høyere enn inntekten?"
      },
      "options": [
        {
          "text": {
            "easy": "Budsjettet går med underskudd",
            "normal": "Budsjettet går med underskudd"
          },
          "feedback": {
            "easy": "Riktig. Når utgiftene er større enn inntekten, er det underskudd.",
            "normal": "Riktig. Når utgiftene er større enn inntekten, er det underskudd."
          }
        },
        {
          "text": {
            "easy": "Budsjettet går med overskudd",
            "normal": "Budsjettet går med overskudd"
          },
          "feedback": {
            "easy": "Sammenlign hvor mye som kommer inn og går ut.",
            "normal": "Sammenlign hvor mye som kommer inn og går ut."
          }
        },
        {
          "text": {
            "easy": "Budsjettet er i god balanse",
            "normal": "Budsjettet er i god balanse"
          },
          "feedback": {
            "easy": "Regn ut forskjellen mellom inntekter og utgifter.",
            "normal": "Regn ut forskjellen mellom inntekter og utgifter."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Når utgiftene er større enn inntekten, er det underskudd.",
        "normal": "Når utgiftene er større enn inntekten, er det underskudd."
      }
    },
    {
      "stem": {
        "easy": "Inntekten dekker ikke mat og husleie. Hva kan et budsjett vise?",
        "normal": "Inntekten dekker ikke mat og husleie. Hva kan et budsjett vise?"
      },
      "options": [
        {
          "text": {
            "easy": "En bedre plan vil redusere husleien automatisk",
            "normal": "En bedre plan vil redusere husleien automatisk"
          },
          "feedback": {
            "easy": "Hva endrer en oversikt i selve avtalen om husleie?",
            "normal": "Hva endrer en oversikt i selve avtalen om husleie?"
          }
        },
        {
          "text": {
            "easy": "Nødvendige utgifter kan være høyere enn inntekten",
            "normal": "Nødvendige utgifter kan være høyere enn inntekten"
          },
          "feedback": {
            "easy": "Oversikten kan vise et problem som krever flere tiltak.",
            "normal": "Oversikten kan vise et problem som krever flere tiltak."
          }
        },
        {
          "text": {
            "easy": "Alle utgifter kan flyttes uten endret deltakelse",
            "normal": "Alle utgifter kan flyttes uten endret deltakelse"
          },
          "feedback": {
            "easy": "Undersøk hvilke utgifter som dekker nødvendige behov.",
            "normal": "Undersøk hvilke utgifter som dekker nødvendige behov."
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "En oversikt kan vise underskudd. Hvis nødvendige utgifter overstiger inntekten, trengs mer enn bedre planlegging.",
        "normal": "En oversikt kan vise underskudd. Hvis nødvendige utgifter overstiger inntekten, trengs mer enn bedre planlegging."
      }
    }
  ],
  "lk-tiltak": [
    {
      "stem": {
        "easy": "Bussen passer ikke med skoledagen. Hvilket tiltak retter seg mest mot hindringen?",
        "normal": "Bussen passer ikke med skoledagen. Hvilket tiltak retter seg mest mot hindringen?"
      },
      "options": [
        {
          "text": {
            "easy": "Flere undervisningstimer uten endring av transport",
            "normal": "Flere undervisningstimer uten endring av transport"
          },
          "feedback": {
            "easy": "Vil dette endre elevenes mulighet til å komme fram?",
            "normal": "Vil dette endre elevenes mulighet til å komme fram?"
          }
        },
        {
          "text": {
            "easy": "Bedre transport mellom boligene og skolen",
            "normal": "Bedre transport mellom boligene og skolen"
          },
          "feedback": {
            "easy": "Tiltaket retter seg mot transporthindringen.",
            "normal": "Tiltaket retter seg mot transporthindringen."
          }
        },
        {
          "text": {
            "easy": "Mer informasjon om hvor viktig utdanning er",
            "normal": "Mer informasjon om hvor viktig utdanning er"
          },
          "feedback": {
            "easy": "Hva vet vi om den konkrete grunnen til at elevene ikke kommer?",
            "normal": "Hva vet vi om den konkrete grunnen til at elevene ikke kommer?"
          }
        }
      ],
      "correct": 1,
      "explanation": {
        "easy": "Når transport hindrer deltakelse, kan et bedre tilbud gi lettere tilgang. Behov og kostnader må også vurderes.",
        "normal": "Når transport hindrer deltakelse, kan et bedre tilbud gi lettere tilgang. Behov og kostnader må også vurderes."
      }
    },
    {
      "stem": {
        "easy": "Hva bør undersøkes når vi velger tiltak?",
        "normal": "Hva bør undersøkes når vi velger tiltak?"
      },
      "options": [
        {
          "text": {
            "easy": "Hvilket tiltak har flest omtaler på nettet",
            "normal": "Hvilket tiltak har flest omtaler på nettet"
          },
          "feedback": {
            "easy": "Er antall omtaler dokumentasjon på effekt og behov?",
            "normal": "Er antall omtaler dokumentasjon på effekt og behov?"
          }
        },
        {
          "text": {
            "easy": "Hvilket tiltak passer likt i alle land",
            "normal": "Hvilket tiltak passer likt i alle land"
          },
          "feedback": {
            "easy": "Undersøk om behov og forutsetninger er like på ulike steder.",
            "normal": "Undersøk om behov og forutsetninger er like på ulike steder."
          }
        },
        {
          "text": {
            "easy": "Hvem får hjelp, og hva velges bort",
            "normal": "Hvem får hjelp, og hva velges bort"
          },
          "feedback": {
            "easy": "Dette undersøker virkninger og prioriteringer.",
            "normal": "Dette undersøker virkninger og prioriteringer."
          }
        }
      ],
      "correct": 2,
      "explanation": {
        "easy": "Tiltak må vurderes ut fra behov, virkninger, ressurser og hvem som berøres. Det finnes ikke én løsning som passer overalt.",
        "normal": "Tiltak må vurderes ut fra behov, virkninger, ressurser og hvem som berøres. Det finnes ikke én løsning som passer overalt."
      }
    },
    {
      "stem": {
        "easy": "To kilder gir ulike fattigdomstall. Hva sjekker du først?",
        "normal": "To kilder gir ulike fattigdomstall. Hva sjekker du først?"
      },
      "options": [
        {
          "text": {
            "easy": "År, grense og hvem som telles",
            "normal": "År, grense og hvem som telles"
          },
          "feedback": {
            "easy": "Disse opplysningene viser om tallene er sammenlignbare.",
            "normal": "Disse opplysningene viser om tallene er sammenlignbare."
          }
        },
        {
          "text": {
            "easy": "Hvilket av tallene som er størst",
            "normal": "Hvilket av tallene som er størst"
          },
          "feedback": {
            "easy": "Hva kan gjøre at begge tallene har et faglig grunnlag?",
            "normal": "Hva kan gjøre at begge tallene har et faglig grunnlag?"
          }
        },
        {
          "text": {
            "easy": "Hvilket tall som er sist publisert",
            "normal": "Hvilket tall som er sist publisert"
          },
          "feedback": {
            "easy": "Undersøk også hvilket år tallene måler, og hvordan de er laget.",
            "normal": "Undersøk også hvilket år tallene måler, og hvordan de er laget."
          }
        }
      ],
      "correct": 0,
      "explanation": {
        "easy": "Tall kan gjelde ulike år, befolkningsgrupper og fattigdomsgrenser. Publiseringsdato alene er ikke nok til å sammenligne.",
        "normal": "Tall kan gjelde ulike år, befolkningsgrupper og fattigdomsgrenser. Publiseringsdato alene er ikke nok til å sammenligne."
      }
    }
  ]
};
