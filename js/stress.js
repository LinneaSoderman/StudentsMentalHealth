addMdToPage('# Stress och depression');
// Finns det samband mellan financialStress och depression ?
addMdToPage('### Ekonomisk stress kopplas till högre depressionsnivåer');
dbQuery.use('studentsDepression');
let financialStressAndDepression = await dbQuery(`
  SELECT
    financialStress,
    COUNT(*) as total,
    SUM(depression) as depressed,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) as depression_rate
  FROM students
  GROUP BY financialStress
  ORDER BY financialStress
`);

let financialStressAndDepressionChart = makeChartFriendly(financialStressAndDepression);

drawGoogleChart({
  type: 'ComboChart',
  data: financialStressAndDepressionChart,
  options: {
    seriesType: 'bars',
    series: { 1: { type: 'line' } },
    colors: ['#AFC4D6', '#7B6CBF'],
    vAxes: {
      0: { title: 'Antal studenter' },
      1: { title: 'Depressionsfrekvens (%)', minValue: 0, maxValue: 100 }
    },
    series: {
      0: { targetAxisIndex: 0 },
      1: { targetAxisIndex: 1, type: 'line', lineWidth: 2, pointSize: 6 }
    },
    backgroundColor: 'transparent',
    curveType: 'function',
  }
});

addMdToPage(`
  Analysen visar en tydlig trend: ju högre inkomsstress, desto större andel studenter rapporterar depression.
  Detta antyder att ekonomiska bekymmer kan vara en betydande riskfaktor för studenters psykiska hälsa.

  Diagrammet visar både antalet studenter i varje kategori och andelen deprimerade, 
  vilket gör det tydligt hur stressnivåerna påverkar gruppen.
`);

// Hur ser fördelningen av workStudyHours ut för deprimerade vs icke - deprimerade ?
addMdToPage("### Jobb- och studietimmar: när belastningen blir för hög");
dbQuery.use('studentsDepression');

let raw = await dbQuery(`
  SELECT
    workStudyHours,
    depression,
    COUNT(*) as count
  FROM students
  GROUP BY workStudyHours, depression
  ORDER BY workStudyHours
`);

// Bygg två separata serier
let hours = [...new Set(raw.map(r => r.workStudyHours))].sort((a, b) => a - b);

let notDepressedData = hours.map(h => {
  const row = raw.find(r => r.workStudyHours === h && r.depression === 0);
  return row ? row.count : 0;
});

let depressedData = hours.map(h => {
  const row = raw.find(r => r.workStudyHours === h && r.depression === 1);
  return row ? row.count : 0;
});

// Normalisera till andel
const sum = arr => arr.reduce((a, b) => a + b, 0);
const notDepTotal = sum(notDepressedData);
const depTotal = sum(depressedData);

notDepressedData = notDepressedData.map(v => +(100 * v / notDepTotal).toFixed(1));
depressedData = depressedData.map(v => +(100 * v / depTotal).toFixed(1));

drawGoogleChart({
  type: 'ColumnChart',
  data: [
    ['Timmar', 'Inte deprimerad', 'Deprimerad'],
    ...hours.map((h, i) => [String(h), notDepressedData[i], depressedData[i]])
  ],
  options: {
    colors: ['#AFC4D6', '#7B6CBF'],
    backgroundColor: 'transparent',
    bar: { groupWidth: '85%' },
    vAxis: { title: 'Andel av gruppen (%)' },
    hAxis: { title: 'Jobb/studietimmar per dag' },
    isStacked: false,
  }
});
// Jag har tolkat WorkStudyHours som antal timmar lagda utanför skoltid på jobb eller studier eftersom många svarat 0. 

addMdToPage(`
  När vi tittar på antalet timmar som studenter lägger på arbete eller studier utanför skoltid, ser vi ett intressant mönster:
  - Upp till 7 timmar per dag är de flesta studenter inte deprimerade.
  - Vid 10 timmar per dag är skillnaden mellan deprimerade och icke-deprimerade som störst – deprimerade studenter är tydligt överrepresenterade.
  - För de icke-deprimerade är fördelningen relativt jämn, medan de deprimerade har en tydlig topp vid höga timmar.

  Detta tyder på att en större arbetsbelastning kan öka risken för depression. 
  Samtidigt är det viktigt att notera att data är självrapporterad, och depression kan påverka hur studenter upplever sin arbetsbörda.
`);

addMdToPage(` 
  ### Insikter från data: Vad statistiken lär oss om stress och depression
  Sammanfattningsvis visar analysen att:
  - Ekonomisk stress är starkt kopplat till depression, vilket pekar på behovet av ekonomiskt stöd och rådgivning.
  - Långa arbets- och studietimmar utanför skoltid ökar risken för depression, särskilt vid 10 timmar per dag eller mer.
  - Det finns ett tydligt samband mellan stress och psykisk ohälsa, men det är också viktigt att komma ihåg att självrapporterad data kan påverka resultaten.

  Dessa insikter kan användas för att identifiera riskgrupper och utveckla strategier för att minska stress och stödja studenters mentala hälsa.
`);