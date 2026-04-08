addMdToPage('# Kombinerade faktorer och depression');
dbQuery.use('studentsDepression');



// Finns det studenter med hög academicPressure OCH lågt sleepScore — hur deprimerade är de?
addMdToPage('### Finns det studenter med mycket akademisk press OCH dålig sömn — hur deprimerade är de?');
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
  Ju högre akademisk press och ju sämre sömnkvalitet, desto högre är depressionsfrekvensen. 
  De studenter som rapporterar både hög akademisk press(5) och dålig sömn(1) har den högsta depressionsfrekvensen på 89.6%. 
  Därav verkar det finnas en stark koppling mellan dessa två faktorer och depression, där kombinationen av hög press och dålig sömn är särskilt problematisk.
  `);




// Vilken kombination av faktorer är vanligast hos deprimerade studenter ?
addMdToPage('### Vilken kombination av faktorer de faktorer som orsakar mest deprision är vanligast hos deprimerade studenter ?');
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
  De studenter med dålig diet, mycket akademisk press och finansiell stress är de mest deprimerade studenterna. 
  Men Även de med mycket akademisk press och finansiell stress men bättre diet är väldigt deprimerade. 
  De studenter med lägre akademisk press och finansiell stress men dålig diet är mindre deprimerade. 
`);