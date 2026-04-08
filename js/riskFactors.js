addMdToPage('# Riskfaktorer för depression');
dbQuery.use('studentsDepression');


//  Är depression vanligare bland män eller kvinnor ? 
addMdToPage('### Kön spelar mindre roll än man tror, depression drabbar alla');

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
      0: { color: '#AFC4D6' },
      1: { color: '#7B6CBF' }
    }
  }
});

// Lägger till per kön, då fler män deltagit i studien

let gendersDepression = await dbQuery(`
  SELECT
    gender,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) AS depression_rate
  FROM students
  GROUP BY gender
  ORDER BY gender
`);

let combinedGenderDepression = [
  ['Kön', 'Andel deprimerade (%)'],
  ...gendersDepression.map(r => [String(r.gender), r.depression_rate])
];

drawGoogleChart({
  type: "ColumnChart",
  data: combinedGenderDepression,
  options: {
    colors: ['#AFC4D6', '#7B6CBF'],
    backgroundColor: 'transparent',
    vAxis: { minValue: 0, maxValue: 60 }

  }

});


addMdToPage(` 
  En första titt på kön visar att depression är nästan lika vanligt bland män och kvinnor.
  Även om fler män deltog i studien, rapporterar 58,6 % av männen och 58,5 % av kvinnorna att de är deprimerade.
  Det visar att depression inte är begränsat till något kön, 
  utan är ett problem som berör både män och kvinnor i lika hög grad.

  Slutsatsen är att kön inte verkar vara en stark riskfaktor i denna population, 
  vilket är anledningen till att vi inte inkluderar det i resten av analysen.
`);


// Skiljer sig depressionsgraden mellan olika åldrar ? 
addMdToPage('### Unga vuxna är mest sårbara');

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
    colors: ['#AFC4D6'],
    backgroundColor: 'transparent',
    legend: { position: 'none' }
  }
});

addMdToPage(` 
  När vi tittar på olika åldersgrupper finns ingen tydlig trend.
  - De yngsta deltagarna (18 år) rapporterar en hög depressionsgrad på 76,6 %.
  - Efter 32 års ålder sjunker andelen deprimerade, men det kan bero på färre deltagare i de äldre åldersgrupperna, vilket gör resultaten mindre tillförlitliga.

  Sammanfattningsvis kan vi säga att depression finns i alla åldrar, 
  men unga vuxna i början av studierna verkar särskilt utsatta.
`);



// Hur påverkar familyHistory risken för depression ?
addMdToPage('### Familjehistoria: en riskfaktor men inte hela förklaringen');
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
    colors: ['#AFC4D6', '#7B6CBF'],
    backgroundColor: 'transparent'
  }
});

addMdToPage(` 
  Studenternas uppgifter om familjehistoria visar att depression är något vanligare bland dem med familjehistoria av psykisk ohälsa.
  Samtidigt är andelen deprimerade hög även bland studenter utan sådan historia.
  Detta tyder på att familjehistoria kan öka risken, men att många andra faktorer också påverkar depression. 
  Psykisk ohälsa är alltså multifaktoriell.
`);



// Vilka faktorer påverkar depressionsgraden mest 
addMdToPage('### Det som tynger studenter mest: akademisk press, stress och sömn');

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
    colors: ['#7B6CBF'],
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    chartArea: { bottom: 120 }
  }
});

addMdToPage(`
  Analysen av olika livsstils- och studieparametrar visar tydligt vilka faktorer som är mest kopplade till depression:
  1. Hög akademisk press – påverkar 81,6 % av de drabbade
  2. Finansiell stress
  3. Ohälsosamma kostvanor
  4. Otillräcklig sömn
  5. Låg studietillfredsställelse

Faktorer som jobbpress och låg arbetstillfredsställelse har minst påverkan i denna population.

Denna ranking visar att stress från studier och ekonomi är de starkaste riskfaktorerna för depression bland studenter. 
Livsstil och sömn spelar också en betydande roll.
`);

addMdToPage(`
  ### Insikter från data: Vilka behöver mest stöd?
  Sammanfattningsvis visar analysen att:
  - Depression är utbrett bland studenter och påverkar både män och kvinnor.
  - Ungdomar i början av studierna verkar mer sårbara.
  - Familjehistoria ökar risken, men är inte avgörande.
  - Akademisk press, finansiell stress, sömn och kostvanor är de faktorer som mest påverkar depressionsnivån.

Dessa insikter kan användas för att förstå vilka grupper som är mest utsatta och vilka faktorer som bör prioriteras i förebyggande insatser på universitet och högskolor.
`);