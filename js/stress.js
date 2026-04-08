addMdToPage('# Stress och depression');
// Finns det samband mellan financialStress och depression ?
addMdToPage("### Finns det samband mellan inkomsstress och depression ?");
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
  Vi ser en tydlig trend där högre inkomsstress är kopplat till högre andel deprimerade studenter. 
  Det tyder på att ekonomisk stress kan vara en betydande faktor i studenters mentala hälsa.
  `);

// Hur ser fördelningen av workStudyHours ut för deprimerade vs icke - deprimerade ?
addMdToPage("### Hur ser fördelningen av jobb/studie timmar ut för deprimerade vs icke-deprimerade ?");
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
  Fram till studenterna lägger 7 timmar på jobb eller studier per dag är en högre andel av studenterna inte depprimerade.
  De icke deppprimerade är även jämnare fördelade över timmarna, medan de deprimerade har en tydlig topp vid 10 timmar.
  Vid 10 timmar är även den största konstrasten mellan depprimerade och icke depprimerade. 
  Det skulle kunna tyda på att en större arbetsbelastning kan kopplas till högre risk för deprision. 
  Dock är det självrapporterad data och deprision skulle kunna påvärka upplevd arbetsbelastning.
  `);