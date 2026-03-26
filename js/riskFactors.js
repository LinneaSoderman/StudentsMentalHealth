addMdToPage('# Riskfaktorer för depression');
//  Är depression vanligare bland män eller kvinnor ? Mucke fler män har deltagit i studien
addMdToPage('### Är depression vanligare bland män eller kvinnor ?');

dbQuery.use('studentsDepression');
let depressedGenders = await dbQuery(`
  SELECT 
    CASE WHEN gender = 'Female' THEN 'female' 
    WHEN gender = 'Male' THEN 'male' END as status,
    COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY gender
`);


let depressedGendersChart = makeChartFriendly(depressedGenders);

drawGoogleChart({
  type: 'PieChart',
  data: depressedGendersChart,
  options: {
    backgroundColor: 'transparent',
    slices: {
      0: { color: '#FFB6C1' },
      1: { color: '#9d67f5' }
    }
  }
});

addMdToPage(` 
  Enligt enkätsvaren är depprission vanligare bland män, 55,8%. Dock är det viktigt att notera att det är fler
  män som deltagit i studien. Analyserar man inom könen är  58,2 % av kvinnorna deprimerade, medan 57,5 % av männen är deprimerade. Det tyder på att det inte är någon större skillnad i depressionsgrad mellan könen. 
  Men att bristen på kvinnliga deltagare har påverkat resultatet. 
  `);

// Skiljer sig depressionsgraden mellan olika åldrar ? 
addMdToPage('### Skiljer sig depressionsgraden mellan olika åldrar ?');
dbQuery.use('studentsDepression');

let avgByAge = await dbQuery(`
  SELECT 
    age,
    ROUND(AVG(depression) * 100, 1) as depressionsProcent
  FROM students
  GROUP BY age
  HAVING COUNT(*) >= 10
  ORDER BY age
`);

drawGoogleChart({
  type: 'ColumnChart',
  data: makeChartFriendly(avgByAge),
  options: {
    hAxis: { title: 'Ålder' },
    vAxis: { title: 'Andel deprimerade (%)', minValue: 0, maxValue: 100 },
    colors: ['#FFB6C1'],
    backgroundColor: 'transparent',
    legend: { position: 'none' }
  }
});

addMdToPage(` 
  Det finns ingen tydlig trend i depressionsgraden över åldrarna. De yngsta deltagarna (18 år) har en depressionsgrad på 76,6%. 
  Efter 32 års ålder sjunker depressionsgraden kraftigt. Det kan bero på att det är färre deltagare i de högre åldersgrupperna, vilket gör resultaten mindre tillförlitliga.
  `);


// Hur påverkar familyHistory risken för depression ?
addMdToPage('### Hur påverkar familjehistoria risken för depression ?');
dbQuery.use('studentsDepression');
let familyHistoryWhenDepressed = await dbQuery(` 
  SELECT 
    CASE WHEN familyHistory = 1 THEN 'Family history' ELSE 'No family history' END as status,
    COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY familyHistory
`);

let familyHistoryWhenNotDepressed = await dbQuery(`
  SELECT
    CASE WHEN familyHistory = 1 THEN 'Family history' ELSE 'No family history' END as status,
    COUNT(*) as count
FROM students
WHERE depression = 0
GROUP BY familyHistory
`);

// Slå ihop till ett Google Chart-vänligt format med två kolumner
let depressedFamilyHistoryMap = Object.fromEntries(familyHistoryWhenDepressed.map(r => [r.status, r.count]));
let notDepressedFamilyHistoryMap = Object.fromEntries(familyHistoryWhenNotDepressed.map(r => [r.status, r.count]));

let combinedFamilyHistoryData = [
  ['Status', 'Med depression', 'Utan depression'],
  ['Family history', depressedFamilyHistoryMap['Family history']
    || 0, notDepressedFamilyHistoryMap['Family history'] || 0],
  ['No family history', depressedFamilyHistoryMap['No family history']
    || 0, notDepressedFamilyHistoryMap['No family history'] || 0]
];

drawGoogleChart({
  type: 'ColumnChart',
  data: combinedFamilyHistoryData,
  options: {
    hAxis: { title: 'Familjehistoria' },
    vAxis: { title: 'Antal studenter', minValue: 0 },
    colors: ['#FFB6C1', '#9d67f5'],
    backgroundColor: 'transparent'
  }
});

addMdToPage(` 
  Det är en svagt högrte andel av deltagare med depression som har en familjehistoria av depression, 
  men även bland de som inte har en familjehistoria är det en hög andel som är deprimerade. 
  Det tyder på att familjehistoria kan vara en riskfaktor, men att det finns många andra faktorer som också påverkar risken för depression.
  `);



// Vilka faktorer påverkar depressionsgraden mest 
addMdToPage('### Vilka faktorer påverkar depressionsgraden mest?');

let correlationData = await dbQuery(`
  SELECT
    'academicPressure' as factor,
    ROUND(100.0 * SUM(CASE WHEN academicPressure >= 4 AND depression = 1 THEN 1 ELSE 0 END) / 
    SUM(CASE WHEN academicPressure >= 4 THEN 1 ELSE 0 END), 1) as depression_rate
  FROM students
  UNION ALL
  SELECT 'financialStress',
    ROUND(100.0 * SUM(CASE WHEN financialStress >= 4 AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN financialStress >= 4 THEN 1 ELSE 0 END), 1)
  FROM students
  UNION ALL
  SELECT 'sleepScore',
    ROUND(100.0 * SUM(CASE WHEN sleepScore <= 2 AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN sleepScore <= 2 THEN 1 ELSE 0 END), 1)
  FROM students
  UNION ALL
  SELECT 'studySatisfaction',
    ROUND(100.0 * SUM(CASE WHEN studySatisfaction <= 2 AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN studySatisfaction <= 2 THEN 1 ELSE 0 END), 1)
  FROM students
  UNION ALL
  SELECT 'workStudyHours',
    ROUND(100.0 * SUM(CASE WHEN workStudyHours >= 8 AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN workStudyHours >= 8 THEN 1 ELSE 0 END), 1)
  FROM students
  UNION ALL
  SELECT 'dietaryHabits',
    ROUND(100.0 * SUM(CASE WHEN dietaryHabits = 'Unhealthy' AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN dietaryHabits = 'Unhealthy' THEN 1 ELSE 0 END), 1)
  FROM students
  UNION ALL
  SELECT 'familyHistory',
    ROUND(100.0 * SUM(CASE WHEN familyHistory = 1 AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN familyHistory = 1 THEN 1 ELSE 0 END), 1)
  FROM students
  UNION ALL
  SELECT 'workPressure',
    ROUND(100.0 * SUM(CASE WHEN workPressure >= 4 AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN workPressure >= 4 THEN 1 ELSE 0 END), 1)
  FROM students
  UNION ALL
  SELECT 'jobSatisfaction',
    ROUND(100.0 * SUM(CASE WHEN jobSatisfaction <= 2 AND depression = 1 THEN 1 ELSE 0 END) /
    SUM(CASE WHEN jobSatisfaction <= 2 THEN 1 ELSE 0 END), 1)
  FROM students
`);

let sortedCorrelation = [...correlationData].sort((a, b) => b.depression_rate - a.depression_rate);

let correlationChartData = [
  ['Faktor', 'Depressionsfrekvens (%) vid ogynnsamt värde'],
  ...sortedCorrelation.map(r => [r.factor, r.depression_rate])
];

drawGoogleChart({
  type: 'ColumnChart',
  data: correlationChartData,
  options: {
    height: 500,
    vAxis: { title: 'Andel deprimerade (%)', viewWindow: { min: 0, max: 100 } },
    hAxis: { title: '', slantedText: true, slantedTextAngle: 30 },
    colors: ['#9d67f5'],
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    chartArea: { bottom: 120 }
  }
});

addMdToPage(`
  Hög akademisk press är den faktor som orsakar högst grad av depression bland studenterna, 81,6%. 
  Därefter finansiell stress och dålig diet. 
  Jobb press och låg arbetstillfredsställelse är de faktorer som har minst påverkan på depressionsgraden, skulle kunna bero på att få studenter har jobb.
`);