addMdToPage('# När faktorer samverkar: Hög press, dålig sömn och depression');
dbQuery.use('studentsDepression');



// Finns det studenter med hög academicPressure OCH lågt sleepScore — hur deprimerade är de?
addMdToPage('### Hög akademisk press och dålig sömn, den farligaste kombinationen');
let combinedSleepAcademicData = await dbQuery(`
  SELECT 
    academicPressure,
    sleepScore,
    COUNT(*) as total,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) as depression_rate
  FROM students
  WHERE academicPressure IS NOT NULL AND sleepScore IS NOT NULL
  GROUP BY academicPressure, sleepScore
  ORDER BY academicPressure, sleepScore
`);
let sortedData = [...combinedSleepAcademicData].sort((a, b) => b.depression_rate - a.depression_rate);

let tableData = [
  ['Kombination', 'Depressionsfrekvens (%)'],
  ...sortedData.map(r => [
    `Press ${r.academicPressure} / Sömn ${r.sleepScore}`,
    r.depression_rate
  ])
];

drawGoogleChart({
  type: 'BarChart',
  data: tableData,
  options: {
    hAxis: { title: 'Depressionsfrekvens (%)', viewWindow: { min: 0, max: 100 } },
    vAxis: { title: '' },
    colors: ['#AFC4D6'],
    backgroundColor: 'transparent',
    legend: { position: 'none' },
  }
});

addMdToPage(`
  När vi tittar på studenter som både upplever mycket akademisk press och dålig sömn, blir mönstret tydligt:
  - Ju högre press och ju sämre sömn, desto högre depressionsfrekvens.
  - Studenter med pressnivå 5 och sömnnivå 1 har den högsta andelen depression, 89,6 %.
  - Kombinationen av dessa två faktorer verkar särskilt problematisk och kan öka risken för depression dramatiskt.

  Detta visar att flera riskfaktorer samverkar, 
  hög arbetsbelastning förstärker effekten av dålig sömn på studenters mentala hälsa.
`);




// Vilken kombination av faktorer är vanligast hos deprimerade studenter ?
addMdToPage('### Vilken kombination av riskfaktorer är vanligast bland deprimerade studenter?');
//Utifrån resultaten från " Vilka faktorer påverkar depressionsgraden mest" bland riskfaktorerna valde jag att använda akademisk press, finansiel stress och diet. 

let mostCommonData = await dbQuery(`
  SELECT 
    academicPressure,
    financialStress,
    dietaryHabits,
    COUNT(*) as depressedCount
  FROM students
  WHERE depression = 1
  GROUP BY academicPressure, financialStress, dietaryHabits
  ORDER BY depressedCount DESC
  LIMIT 10
`);

let mostCommonChartData = [
  ['Kombination', 'Antal deprimerade'],
  ...mostCommonData.map(r => [
    `Press ${r.academicPressure} / Stress ${r.financialStress} / ${r.dietaryHabits}`,
    r.depressedCount
  ])
];

drawGoogleChart({
  type: 'BarChart',
  data: mostCommonChartData,
  options: {
    hAxis: { title: 'Antal deprimerade studenter' },
    vAxis: { title: '' },
    colors: ['#7B6CBF'],
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    chartArea: { left: 250 }
  }
});

addMdToPage(`
  Genom att kombinera de tre mest påverkande faktorerna: akademisk press, ekonomisk stress och matvanor, ser vi att:
  - Studenter med dålig diet, hög akademisk press och hög finansiell stress utgör den största gruppen av deprimerade.
  - Även de med hög press och finansiell stress men bättre matvanor är starkt drabbade.
  - Studenter med lägre press och stress men dålig diet har betydligt lägre depressionsfrekvens.

  Detta visar att riskfaktorer inte verkar isolerat, utan samverkar. 
  Den kombination som innebär störst risk är hög press, hög stress och ogynnsamma livsstilsvanor.
`);

addMdToPage(`### Insikter från data: vilka behöver mest stöd?
  Sammanfattningsvis kan vi dra flera lärdomar:
  1. Kombinationen av hög akademisk press och dålig sömn är särskilt problematisk, med nästan 9 av 10 studenter drabbade.
  2. Livsstilsfaktorer förstärker effekten av stress, exempelvis dålig kost i kombination med hög press och ekonomisk stress ökar risken för depression.
  3. Förebyggande åtgärder bör ta hänsyn till flera faktorer samtidigt, 
  att endast minska akademisk press eller förbättra sömn kan vara otillräckligt om andra risker kvarstår.

  Att förstå hur faktorer samverkar kan hjälpa skolor och universitet att utforma mer effektiva stödprogram för studenters psykiska hälsa.
`);