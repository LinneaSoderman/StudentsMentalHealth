addMdToPage('# Statistisk analys');
dbQuery.use('studentsDepression');

const formatP = (p) => {
  if (p === 0) return '< 5e-324 (under JavaScripts precision)';
  if (p < 0.0001) {
    const exp = Math.floor(Math.log10(p));
    const coeff = (p / Math.pow(10, exp)).toFixed(2);
    return `< 0.0001 (${coeff}×10^${exp})`;
  }
  return p.toFixed(4);
};

// ── AKADEMISK PRESS ──────────────────────────────────────────

addMdToPage(`
## Akademisk press
Variabeln mäts på en diskret 1–5 skala och kan därför inte vara 
perfekt normalfördelad. Jag undersöker fördelningen visuellt med 
ett histogram och formellt med Shapiro-Wilk, men kommer behöva 
förhålla mig kritiskt till resultaten givet datastorleken (~28 000 obs.).
`);

let apRaw = await dbQuery(`
  SELECT academicPressure FROM students
  WHERE academicPressure IS NOT NULL AND academicPressure >= 1
`);
let apValues = apRaw.map(r => r.academicPressure);

drawGoogleChart({
  type: 'Histogram',
  data: makeChartFriendly(apRaw, 'Akademisk press'),
  options: {
    height: 400,
    colors: ['#9d67f5'],
    backgroundColor: 'transparent',
    histogram: { bucketSize: 1 },
    hAxis: { viewWindow: { min: 1, max: 6 } },
    title: 'Fördelning av akademisk press'
  }
});

addMdToPage(` 
  Av de variabler i jag använt är akademisk press den som mest liknar en normalfördelning, med en tydlig topp kring nivå 3. 
  Nivå 2 och 4 är dock lägre än vad en perfekt normalfördelning skulle förväntas, och nivå 1 och 5 är mer frekventa än väntat.
`);

let apShapiro = stdLib.stats.shapiroWilkTest(apValues);

addMdToPage(`
### Normalfördelning – Shapiro-Wilk
* **p-värde: ${formatP(apShapiro.p)}**
* Shapiro-Wilk **förkastar** normalfördelning, vilket är väntat av två skäl:
  1. Variabeln är diskret och kan aldrig vara perfekt normalfördelad.
  2. Med ~28 000 observationer är testet extremt känsligt och förkastar även minimala avvikelser.
* Visuellt ser fördelningen relativt symmetrisk ut kring mitten (nivå 3).
`);

// T-test: deprimerade vs icke-deprimerade
let apDepressed = await dbQuery(`
  SELECT academicPressure FROM students
  WHERE depression = 1 AND academicPressure IS NOT NULL
`);
let apNotDepressed = await dbQuery(`
  SELECT academicPressure FROM students
  WHERE depression = 0 AND academicPressure IS NOT NULL
`);

let apDep = apDepressed.map(r => r.academicPressure);
let apNotDep = apNotDepressed.map(r => r.academicPressure);

let apTtest = stdLib.stats.ttest2(apDep, apNotDep);

// Cohen's d
const cohensD = (group1, group2) => {
  const pooledStd = Math.sqrt((s.variance(group1) + s.variance(group2)) / 2);
  return (s.mean(group1) - s.mean(group2)) / pooledStd;
};
let apD = cohensD(apDep, apNotDep);

addMdToPage(`
### Nollhypotesprövning – skiljer sig akademisk press mellan deprimerade och icke-deprimerade?

* **H₀:** Ingen skillnad i medelakademisk press mellan grupperna  
* **H₁:** Det finns en skillnad  
* **Signifikansnivå:** α = 0.05
* **Metod:** Tvåstickprovs t-test. Trots att datan är diskret och inte 
  strikt normalfördelad är t-testet försvarbart tack vare centrala 
  gränsvärdessatsen vid detta stickprovsstorlek. Resultaten bör ändå 
  tolkas med viss försiktighet.

### Resultat
| Mått | Deprimerade | Icke-deprimerade |
|------|------------|-----------------|
| Medelvärde | ${s.mean(apDep).toFixed(2)} | ${s.mean(apNotDep).toFixed(2)} |
| Standardavvikelse | ${s.standardDeviation(apDep).toFixed(2)} | ${s.standardDeviation(apNotDep).toFixed(2)} |

* **p-värde:** ${formatP(apTtest.pValue)}
* **Cohen's d:** ${apD.toFixed(3)} (${Math.abs(apD) < 0.2 ? 'försumbar' : Math.abs(apD) < 0.5 ? 'liten' : Math.abs(apD) < 0.8 ? 'medel' : 'stor'} effektstorlek)

${apTtest.rejected
    ? `Jag **förkastar nollhypotesen**, deprimerade studenter upplever 
    statistiskt signifikant högre akademisk press. Effektstorleken 
    (Cohen's d = ${apD.toFixed(2)}) är dock ${Math.abs(apD) < 0.2 ? 'försumbar' : Math.abs(apD) < 0.5 ? 'liten' : 'medelstor'}, 
    vilket betyder att skillnaden är statistiskt säkerställd men 
    kanske inte stor i praktiken.`
    : `Jag kan **inte förkasta nollhypotesen**.`}
`);

// ── FINANSIELL STRESS ─────────────────────────────────────────

addMdToPage(`
## Finansiell stress
Samma förutsättningar gäller här – diskret 1–5 skala med stort stickprov.
`);

let fsRaw = await dbQuery(`
  SELECT financialStress FROM students WHERE financialStress IS NOT NULL
`);
let fsValues = fsRaw.map(r => r.financialStress);

drawGoogleChart({
  type: 'Histogram',
  data: makeChartFriendly(fsRaw, 'Finansiell stress'),
  options: {
    height: 400,
    colors: ['#FFB6C1'],
    backgroundColor: 'transparent',
    histogram: { bucketSize: 1 },
    hAxis: { viewWindow: { min: 1, max: 6 } },
    title: 'Fördelning av finansiell stress'
  }
});

let fsShapiro = stdLib.stats.shapiroWilkTest(fsValues);

addMdToPage(`
### Normalfördelning – Shapiro-Wilk
* **p-värde: ${formatP(fsShapiro.p)}**
* Samma slutsats som för akademisk press, förkastning är väntad 
  och bör inte tolkas som att datan är oanvändbar.
`);

let fsDepressed = await dbQuery(`
  SELECT financialStress FROM students
  WHERE depression = 1 AND financialStress IS NOT NULL
`);
let fsNotDepressed = await dbQuery(`
  SELECT financialStress FROM students
  WHERE depression = 0 AND financialStress IS NOT NULL
`);

let fsDep = fsDepressed.map(r => r.financialStress);
let fsNotDep = fsNotDepressed.map(r => r.financialStress);
let fsTtest = stdLib.stats.ttest2(fsDep, fsNotDep);
let fsD = cohensD(fsDep, fsNotDep);

addMdToPage(`
### Nollhypotesprövning – skiljer sig finansiell stress mellan grupperna?

* **H₀:** Ingen skillnad i finansiell stress mellan deprimerade och icke-deprimerade  
* **H₁:** Det finns en skillnad  
* **Signifikansnivå:** α = 0.05

### Resultat
| Mått | Deprimerade | Icke-deprimerade |
|------|------------|-----------------|
| Medelvärde | ${s.mean(fsDep).toFixed(2)} | ${s.mean(fsNotDep).toFixed(2)} |
| Standardavvikelse | ${s.standardDeviation(fsDep).toFixed(2)} | ${s.standardDeviation(fsNotDep).toFixed(2)} |

* **p-värde:** ${formatP(fsTtest.pValue)}
* **Cohen's d:** ${fsD.toFixed(3)} (${Math.abs(fsD) < 0.2 ? 'försumbar' : Math.abs(fsD) < 0.5 ? 'liten' : Math.abs(fsD) < 0.8 ? 'medel' : 'stor'} effektstorlek)

${fsTtest.rejected
    ? `Jag **förkastar nollhypotesen**, finansiell stress skiljer sig 
    signifikant mellan grupperna. Cohen's d = ${fsD.toFixed(2)} tyder 
    på en ${Math.abs(fsD) < 0.2 ? 'försumbar' : Math.abs(fsD) < 0.5 ? 'liten' : 'medelstor'} praktisk skillnad.`
    : `Jag kan **inte förkasta nollhypotesen**.`}
`);

// ── SÖMN ──────────────────────────────────────────────────────

addMdToPage(`
## Sömnpoäng
Sömnpoäng mäts på en diskret 1–4 skala vilket gör normalfördelning 
ännu mer osannolik än för 1–5 skalorna ovan.
`);

let sleepRaw = await dbQuery(`
  SELECT sleepScore FROM students WHERE sleepScore IS NOT NULL
`);
let sleepValues = sleepRaw.map(r => r.sleepScore);

drawGoogleChart({
  type: 'Histogram',
  data: makeChartFriendly(sleepRaw, 'Sömnpoäng'),
  options: {
    height: 400,
    colors: ['#9d67f5'],
    backgroundColor: 'transparent',
    histogram: { bucketSize: 1 },
    hAxis: { viewWindow: { min: 1, max: 5 } },
    title: 'Fördelning av sömnpoäng'
  }
});

let sleepShapiro = stdLib.stats.shapiroWilkTest(sleepValues);

addMdToPage(`
### Normalfördelning – Shapiro-Wilk
* **p-värde: ${formatP(sleepShapiro.p)}**
* Med endast fyra möjliga värden (1–4) är normalfördelning i princip 
  omöjlig. Shapiro-Wilk är därför extra missvisande här.
`);

let sleepDepressed = await dbQuery(`
  SELECT sleepScore FROM students
  WHERE depression = 1 AND sleepScore IS NOT NULL
`);
let sleepNotDepressed = await dbQuery(`
  SELECT sleepScore FROM students
  WHERE depression = 0 AND sleepScore IS NOT NULL
`);

let sleepDep = sleepDepressed.map(r => r.sleepScore);
let sleepNotDep = sleepNotDepressed.map(r => r.sleepScore);
let sleepTtest = stdLib.stats.ttest2(sleepDep, sleepNotDep);
let sleepD = cohensD(sleepDep, sleepNotDep);

addMdToPage(`
### Nollhypotesprövning – skiljer sig sömnpoäng mellan grupperna?

* **H₀:** Ingen skillnad i sömnpoäng mellan deprimerade och icke-deprimerade  
* **H₁:** Det finns en skillnad  
* **Signifikansnivå:** α = 0.05

### Resultat
| Mått | Deprimerade | Icke-deprimerade |
|------|------------|-----------------|
| Medelvärde | ${s.mean(sleepDep).toFixed(2)} | ${s.mean(sleepNotDep).toFixed(2)} |
| Standardavvikelse | ${s.standardDeviation(sleepDep).toFixed(2)} | ${s.standardDeviation(sleepNotDep).toFixed(2)} |

* **p-värde:** ${formatP(sleepTtest.pValue)}
* **Cohen's d:** ${sleepD.toFixed(3)} (${Math.abs(sleepD) < 0.2 ? 'försumbar' : Math.abs(sleepD) < 0.5 ? 'liten' : Math.abs(sleepD) < 0.8 ? 'medel' : 'stor'} effektstorlek)

${sleepTtest.rejected
    ? `Jag **förkastar nollhypotesen**,  sömnpoäng skiljer sig 
    signifikant mellan grupperna. Cohen's d = ${sleepD.toFixed(2)} 
    indikerar en ${Math.abs(sleepD) < 0.2 ? 'försumbar' : Math.abs(sleepD) < 0.5 ? 'liten' : 'medelstor'} praktisk skillnad.`
    : `Jag kan **inte förkasta nollhypotesen**.`}
`);

// ── SAMMANFATTNING ────────────────────────────────────────────

addMdToPage(`
---
## Sammanfattning

### Metodologiska begränsningar
Alla tre variabler är mätta på diskreta skalor (1–4 eller 1–5) och 
följer därför inte normalfördelning i strikt mening. Shapiro-Wilk 
förkastar normalfördelning för samtliga, vilket är ett väntat resultat 
vid detta stickprovsstorlek. T-testerna är ändå försvarsbara tack vare 
centrala gränsvärdessatsen, men ett icke-parametriskt alternativ som 
Mann-Whitney U-test hade varit mer korrekt.

### Resultat
| Variabel | Medel deprimerade | Medel icke-dep. | p-värde | Cohen's d | Effekt |
|----------|------------------|-----------------|---------|-----------|--------|
| Akademisk press | ${s.mean(apDep).toFixed(2)} | ${s.mean(apNotDep).toFixed(2)} | ${formatP(apTtest.pValue)} | ${apD.toFixed(2)} | ${Math.abs(apD) < 0.2 ? 'Försumbar' : Math.abs(apD) < 0.5 ? 'Liten' : 'Medel'} |
| Finansiell stress | ${s.mean(fsDep).toFixed(2)} | ${s.mean(fsNotDep).toFixed(2)} | ${formatP(fsTtest.pValue)} | ${fsD.toFixed(2)} | ${Math.abs(fsD) < 0.2 ? 'Försumbar' : Math.abs(fsD) < 0.5 ? 'Liten' : 'Medel'} |
| Sömnpoäng | ${s.mean(sleepDep).toFixed(2)} | ${s.mean(sleepNotDep).toFixed(2)} | ${formatP(sleepTtest.pValue)} | ${sleepD.toFixed(2)} | ${Math.abs(sleepD) < 0.2 ? 'Försumbar' : Math.abs(sleepD) < 0.5 ? 'Liten' : 'Medel'} |

### Slutsats
Alla tre variabler visar statistiskt signifikanta skillnader mellan 
deprimerade och icke-deprimerade studenter. Cohen's d ger dock ett 
mer nyanserat perspektiv. Trots signifikanta p-värden är de praktiska 
skillnaderna relativt små, vilket är typiskt för stora dataset. 
Akademisk press visar den största praktiska skillnaden mellan grupperna.
`);