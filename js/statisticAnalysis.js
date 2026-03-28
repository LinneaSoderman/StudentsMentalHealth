addMdToPage('# Statistisk analys');
dbQuery.use('studentsDepression');

// Hjälpfunktion för p-värden i vetenskaplig notation

const formatP = (p) => {
  if (p === 0) return '< 5e-324 (under JavaScripts precision)';
  if (p < 0.0001) {
    const exp = Math.floor(Math.log10(p));
    const coeff = (p / Math.pow(10, exp)).toFixed(2);
    return `< 0.0001 (${coeff}×10^${exp})`;
  }
  return p.toFixed(4);
};

// Akademisk press – Normalfördelning + t-test

addMdToPage(`
## Är akademisk press normalfördelad?
Vi undersöker om fördelningen av akademisk press bland studenterna följer en normalfördelning – ett viktigt steg innan hypotesprövning.
`);

let apRaw = await dbQuery(`
  SELECT academicPressure as academicPressure
  FROM students
  WHERE academicPressure IS NOT NULL
  AND academicPressure >= 1
`);

drawGoogleChart({
  type: 'Histogram',
  data: makeChartFriendly(apRaw, 'Akademisk press'),
  options: {
    height: 400,
    histogram: { bucketSize: 1 },
    hAxis: {
      viewWindow: { min: 1, max: 6 }
    }
  }
});

let apValues = apRaw.map(r => r.academicPressure);
let apShapiro = stdLib.stats.shapiroWilkTest(apValues);
let apShapiroP = apShapiro.p;

addMdToPage(`
Vid visuell inspektion ser fördelningen relativt symmetrisk ut med en topp kring mitten (nivå 3), 
vilket liknar en normalfördelning. Variabeln är diskret (heltal 1–5), vilket begränsar hur perfekt normalfördelad den kan vara.

### Shapiro-Wilk-test – Akademisk press
* **p-värde: ${formatP(apShapiroP)}**
* ${apShapiroP > 0.05
    ? 'P-värdet är större än α = 0.05 — vi kan *inte* förkasta att datan är normalfördelad.'
    : 'P-värdet understiger α = 0.05, vilket formellt innebär avvikelse från normalfördelning. Med ~28 000 observationer är Shapiro-Wilk extremt känsligt och ger nästan alltid signifikanta resultat för stora dataset. Visuell inspektion och centrala gränsvärdessatsen gör t-testet ändå robust.'}
`);

addMdToPage(`
## Nollhypotesprövning – Akademisk press
Vi testar om studenternas genomsnittliga akademiska press skiljer sig från **3** (neutralt på 1–5-skalan).

* **H₀ (nollhypotes):** Medelakademisk press = 3  
* **H₁ (alternativhypotes):** Medelakademisk press ≠ 3  
* **Signifikansnivå:** α = 0.05
`);

let apTest = stdLib.stats.ttest(apValues, { mu: 3 });

addMdToPage(`
### Resultat
* **Faktiskt medelvärde:** ${apTest.mean.toFixed(3)}
* **p-värde:** ${formatP(apTest.pValue)}
* **Konfidensintervall (95%):** [${apTest.ci[0].toFixed(3)}, ${apTest.ci[1].toFixed(3)}]

${apTest.rejected
    ? `P-värdet är **lägre** än α = 0.05 — vi **förkastar nollhypotesen**. 
Studenterna upplever en akademisk press som är statistiskt signifikant ${apTest.mean > 3 ? 'högre' : 'lägre'} än neutral nivå. 
Medelvärdet på ${apTest.mean.toFixed(2)} bekräftar att studenter i genomsnitt upplever ${apTest.mean > 3 ? 'något högre' : 'något lägre'} press än mittpunkten på skalan.`
    : `P-värdet är **högre** än α = 0.05 — vi kan *inte* förkasta nollhypotesen.`}
`);



// Finansiell stress – Normalfördelning + t-test

addMdToPage(`
## Är finansiell stress normalfördelad?
`);

let fsRaw = await dbQuery(`
  SELECT financialStress as financialStress
  FROM students
  WHERE financialStress IS NOT NULL

`);

drawGoogleChart({
  type: 'Histogram',
  data: makeChartFriendly(fsRaw, 'Finansiell stress'),
  options: {
    height: 400,
    histogram: { bucketSize: 1 },
    hAxis: {
      viewWindow: { min: 1, max: 6 }
    }
  }
});

let fsValues = fsRaw.map(r => r.financialStress);
let fsShapiro = stdLib.stats.shapiroWilkTest(fsValues);
let fsShapiroP = fsShapiro.p;

addMdToPage(`
### Shapiro-Wilk-test – Finansiell stress
* **p-värde: ${formatP(fsShapiroP)}**
* ${fsShapiroP > 0.05
    ? 'P-värdet är större än α = 0.05 — datan kan anses normalfördelad.'
    : 'P-värdet understiger α = 0.05. Likt akademisk press är detta förväntat för en diskret 1–5-skala med stort stickprov. Fördelningen är visuellt symmetrisk och t-testet är ändå tillförlitligt.'}
`);

addMdToPage(`
## Nollhypotesprövning – Finansiell stress
Vi testar om den genomsnittliga finansiella stressen skiljer sig från **3** (neutral nivå).

* **H₀:** Medel finansiell stress = 3  
* **H₁:** Medel finansiell stress ≠ 3  
* **Signifikansnivå:** α = 0.05
`);

let fsTest = stdLib.stats.ttest(fsValues, { mu: 3 });

addMdToPage(`
### Resultat
* **Faktiskt medelvärde:** ${fsTest.mean.toFixed(3)}
* **p-värde:** ${formatP(fsTest.pValue)}
* **Konfidensintervall (95%):** [${fsTest.ci[0].toFixed(3)}, ${fsTest.ci[1].toFixed(3)}]

${fsTest.rejected
    ? `P-värdet är **lägre** än α = 0.05 — vi **förkastar nollhypotesen**. 
Den finansiella stressen är statistiskt signifikant ${fsTest.mean > 3 ? 'högre' : 'lägre'} än neutral nivå, med ett medelvärde på ${fsTest.mean.toFixed(2)}.`
    : `P-värdet är **högre** än α = 0.05 — vi kan *inte* förkasta nollhypotesen.`}
`);


// Sömn – Normalfördelning + t-test

addMdToPage(`
## Är sömnpoäng normalfördelad?
`);

let sleepRaw = await dbQuery(`
  SELECT sleepScore as sleepScore
  FROM students
  WHERE sleepScore IS NOT NULL
`);

drawGoogleChart({
  type: 'Histogram',
  data: makeChartFriendly(sleepRaw, 'Sömnpoäng'),
  options: {
    height: 400,
    histogram: { bucketSize: 1 },
    hAxis: {
      viewWindow: { min: 1, max: 5 }
    }
  }
});

let sleepValues = sleepRaw.map(r => r.sleepScore);
let sleepShapiro = stdLib.stats.shapiroWilkTest(sleepValues);
let sleepShapiroP = sleepShapiro.p;

addMdToPage(`
### Shapiro-Wilk-test – Sömnpoäng
* **p-värde: ${formatP(sleepShapiroP)}**
* ${sleepShapiroP > 0.05
    ? 'P-värdet är större än α = 0.05 — datan kan anses normalfördelad.'
    : 'P-värdet understiger α = 0.05. Även här är det stora stickprovet en bidragande orsak. Visuell inspektion avgör om fördelningen är tillräckligt symmetrisk för t-test.'}
`);

addMdToPage(`
## Nollhypotesprövning – Sömnpoäng
Vi testar om studenternas genomsnittliga sömnpoäng skiljer sig från **2.5** 
(gränsen mellan otillräcklig och tillräcklig sömn, dvs. mellan kategori 5–6h och 7–8h).

* **H₀:** Medel sömnpoäng = 2.5 *(1 = <5h, 2 = 5–6h, 3 = 7–8h, 4 = >8h)*
* **H₁:** Medel sömnpoäng ≠ 2.5  
* **Signifikansnivå:** α = 0.05
`);

let sleepTest = stdLib.stats.ttest(sleepValues, { mu: 2.5 });
const sleepLabel = sleepTest.mean < 2 ? '<5h' : sleepTest.mean < 3 ? '5–6h' : '7–8h';

addMdToPage(`
### Resultat
* **Faktiskt medelvärde:** ${sleepTest.mean.toFixed(3)}
* **p-värde:** ${formatP(sleepTest.pValue)}
* **Konfidensintervall (95%):** [${sleepTest.ci[0].toFixed(3)}, ${sleepTest.ci[1].toFixed(3)}]

${sleepTest.rejected
    ? `P-värdet är **lägre** än α = 0.05 — vi **förkastar nollhypotesen**. 
Studenternas genomsnittliga sömn är statistiskt signifikant ${sleepTest.mean > 2.5 ? 'bättre' : 'sämre'} än gränsvärdet 2.5. 
Medelvärdet på ${sleepTest.mean.toFixed(2)} placerar genomsnittsstudenten i sömnkategorin **${sleepLabel}**.`
    : `P-värdet är **högre** än α = 0.05 — vi kan *inte* förkasta nollhypotesen.`}
`);



// Sammanfattningstabell

addMdToPage(`
---
## Sammanfattning av statistiska tester

| Test | Variabel | H₀ | p-värde | Förkasta H₀? |
|------|----------|----|---------|--------------|
| Shapiro-Wilk | Akademisk press | Normalfördelad | ${formatP(apShapiroP)} | ${apShapiroP < 0.05 ? 'Ja*' : 'Nej'} |
| Shapiro-Wilk | Finansiell stress | Normalfördelad | ${formatP(fsShapiroP)} | ${fsShapiroP < 0.05 ? 'Ja*' : 'Nej'} |
| Shapiro-Wilk | Sömnpoäng | Normalfördelad | ${formatP(sleepShapiroP)} | ${sleepShapiroP < 0.05 ? 'Ja*' : 'Nej'} |
| t-test | Akademisk press | Medel = 3 | ${formatP(apTest.pValue)} | ${apTest.rejected ? 'Ja' : 'Nej'} |
| t-test | Finansiell stress | Medel = 3 | ${formatP(fsTest.pValue)} | ${fsTest.rejected ? 'Ja' : 'Nej'} |
| t-test | Sömnpoäng | Medel = 2.5 | ${formatP(sleepTest.pValue)} | ${sleepTest.rejected ? 'Ja' : 'Nej'} |

*\\*Shapiro-Wilk är extremt känsligt vid stora stickprov (~28 000 obs.). Även minimala avvikelser från normalfördelning ger signifikanta resultat. Visuell inspektion och centrala gränsvärdessatsen motiverar ändå användning av t-test.*
`);