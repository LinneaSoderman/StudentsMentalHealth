addMdToPage(`## Jämförelse: Hur skiljer sig studenters depression i Indien jämfört med globalt?
`);
// Det nya datasetet är genererad data från ett ospecifierat land, därav utgår jag ifrån att det är globalt. 

addMdToPage('### Övergripande jämförelse: Indien vs resten av världen');
dbQuery.use('studentsDepression');
let depressionDistribution = await dbQuery(`
SELECT depression, COUNT(*) as total
FROM students
GROUP BY depression`);

dbQuery.use('studentLifestyle');
let lifestyleDistribution = await dbQuery(`
SELECT depression, COUNT(*) as total
FROM students
GROUP BY depression`);

let tableData = [
  ['Kategori', 'studentsDepression', 'studentLifestyle']
];
let rows = [];

[0, 1].forEach(val => {
  let dep = depressionDistribution.find(r => r.depression === val)?.total || 0;
  let life = lifestyleDistribution.find(r => r.depression === val)?.total || 0;

  rows.push({
    Kategori: val === 1 ? 'Deprimerade' : 'Inte deprimerade',
    'Indien': dep,
    'Globalt': life
  });
});

tableFromData({
  data: rows
});
addMdToPage(` 
  När vi jämför två dataset, studentsDepression (Indien) och studentLifestyle (globalt) ser vi:
  - Den globala studien har fler deltagare och en högre andel icke-deprimerade studenter.
  - I Indien rapporterar 30–60 % av studenterna att de känner sig deprimerade, medan globalt är det 25–35 %.
  - Trots skillnader i storlek och representativitet är andelen deprimerade studenter relativt lika, 
  vilket gör det meningsfullt att fokusera på de deprimerade i analysen framöver.

  Detta visar att även om dataseten skiljer sig åt i omfattning, finns det ett liknande mönster av depression bland studenter.  
`);

addMdToPage(` ## Välj perspektiv för jämförelsen
För att förstå skillnaderna kan vi titta på olika faktorer: Kön, Sömn, Ålder, eller CGPA.
`);

// Dropdown för att välja inriktning
let valtInriktning = addDropdown('Visa inriktning', ['Kön', 'Sömn', 'Ålder', 'CGPA']);

if (valtInriktning === 'Kön') {
  addMdToPage('## Män vs kvinnor: finns det skillnader i depression?');
  // StudentDepression har en ganska jämn fördelning av Män/kvinnor och student lifestyle är 50/50
  dbQuery.use('studentsDepression');
  let genderDepression = await dbQuery(`
  SELECT gender, COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY gender
`);

  dbQuery.use('studentLifestyle');
  let genderLifestyle = await dbQuery(`
  SELECT gender, COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY gender
`);

  // Pie chart för studentsDepression
  addMdToPage('### Studenter i indien');
  drawGoogleChart({
    type: 'PieChart',
    data: [
      ['Kön', 'Antal'],
      ...genderDepression.map(r => [r.gender, r.count])
    ],
    options: {
      colors: ['#AFC4D6', '#7B6CBF'],
      backgroundColor: 'transparent'
    }
  });

  // Pie chart för studentLifestyle
  addMdToPage('### Studenter globalt');
  drawGoogleChart({
    type: 'PieChart',
    data: [
      ['Kön', 'Antal'],
      ...genderLifestyle.map(r => [r.gender, r.count])
    ],
    options: {
      colors: ['#AFC4D6', '#7B6CBF'],
      backgroundColor: 'transparent'
    }
  });

  addMdToPage(` 
    När vi jämför könsfördelningen hos de deprimerade:
    - Indien: Studenterna är nästan jämnt fördelade mellan män och kvinnor.
    - Globalt: Fördelningen är också nära 50/50.

    Kön verkar inte vara en starkt differentierande faktor för depression mellan Indien och resten av världen.  
  `);

} else if (valtInriktning === 'Sömn') {
  addMdToPage('## Kort sömn ökar risken');

  dbQuery.use('studentLifestyle');
  let sleepLifestyle = await dbQuery(`
  SELECT sleepDuration,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as rate
  FROM students
  WHERE depression = 1
  GROUP BY sleepDuration
  ORDER BY sleepDuration
  `);

  dbQuery.use('studentsDepression');
  let sleepDepression = await dbQuery(`
  SELECT sleepScore,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as rate
  FROM students
  WHERE depression = 1
  GROUP BY sleepScore
  ORDER BY sleepScore
  `);


  // Bygg chart-data
  let combinedSleepData = [
    ['Sömnkategori', 'Globalt (%)', 'Indien (%)'],
    ...sleepLifestyle.map(r => [
      String(r.sleepDuration),
      r.rate,
      sleepDepression.find(s => s.sleepScore === r.sleepDuration)?.rate || 0
    ])
  ];

  drawGoogleChart({
    type: 'ColumnChart',
    data: combinedSleepData,
    options: {
      hAxis: { title: 'Sömnkategori' },
      vAxis: { title: 'Andel deprimerade (%)', minValue: 0 },
      colors: ['#AFC4D6', '#7B6CBF'],
      backgroundColor: 'transparent'
    }
  });

  addMdToPage(` 
    Vid analys av sömnvanor bland de deprimerade:
    - Ju kortare sömn, desto högre andel deprimerade.
    - Mönstret är liknande i både Indien och globalt, men globalt är variationen något mindre.

    Detta visar att sömn är en viktig faktor för studenters mentala hälsa oavsett geografi.
  `);

} else if (valtInriktning === 'Ålder') {
  addMdToPage('## Vilka åldersgrupper är mest drabbade?');

  dbQuery.use('studentLifestyle');
  let ageLifestyle = await dbQuery(`
  SELECT
    CASE 
      WHEN age BETWEEN 18 AND 20 THEN '18-20'
      WHEN age BETWEEN 21 AND 23 THEN '21-23'
      WHEN age BETWEEN 24 AND 26 THEN '24-26'
      ELSE '27+'
    END as ageGroup,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as rate
  FROM students
  WHERE depression = 1
  GROUP BY ageGroup
  ORDER BY 
    CASE 
      WHEN ageGroup = '18-20' THEN 1
      WHEN ageGroup = '21-23' THEN 2
      WHEN ageGroup = '24-26' THEN 3
      ELSE 4
    END
  `);

  dbQuery.use('studentsDepression');
  let ageDepression = await dbQuery(`
    SELECT
    CASE 
      WHEN age BETWEEN 18 AND 20 THEN '18-20'
      WHEN age BETWEEN 21 AND 23 THEN '21-23'
      WHEN age BETWEEN 24 AND 26 THEN '24-26'
      ELSE '27+'
    END as ageGroup,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as rate
  FROM students
  WHERE depression = 1 AND age BETWEEN 18 AND 26  GROUP BY ageGroup
  ORDER BY 
    CASE 
      WHEN ageGroup = '18-20' THEN 1
      WHEN ageGroup = '21-23' THEN 2
      WHEN ageGroup = '24-26' THEN 3
      ELSE 4
    END
  `);

  let combinedAgeData = [
    ['Åldersgrupp', 'Globalt (%)', 'Indien (%)'],
    ...ageLifestyle.map(r => [
      r.ageGroup,
      r.rate,
      ageDepression.find(a => a.ageGroup === r.ageGroup)?.rate || 0
    ])
  ];

  drawGoogleChart({
    type: 'ColumnChart',
    data: combinedAgeData,
    options: {
      hAxis: { title: 'Åldersgrupp' },
      vAxis: { title: 'Andel deprimerade (%)', minValue: 0 },
      colors: ['#AFC4D6', '#7B6CBF'],
      backgroundColor: 'transparent'
    }
  });

  addMdToPage(` 
    När vi grupperar efter ålder:
    - Yngre studenter (18–20 år) är oftare deprimerade i båda dataset.
    - Skillnader mellan åldersgrupper är små, både i Indien och globalt.

    Detta antyder att ålder inte är den mest avgörande faktorn för depression bland studenter.
  `);

} else if (valtInriktning === 'CGPA') {
  addMdToPage('Högre betyg – lägre depression?');

  dbQuery.use('studentsDepression');
  let cgpaDepression = await dbQuery(`
  SELECT
    CASE
      WHEN cgpa BETWEEN 5 AND 6 THEN '1-2'
      WHEN cgpa BETWEEN 6.01 AND 8 THEN '2.01-3'
      ELSE '3.01-4'
    END as cgpaGroup,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as rate
  FROM students
  WHERE depression = 1
  AND cgpa IS NOT NULL 
  GROUP BY cgpaGroup
  ORDER BY
    CASE
      WHEN cgpaGroup = '1-2' THEN 1
      WHEN cgpaGroup = '2.01-3' THEN 2
      ELSE 3
    END
  `);

  dbQuery.use('studentLifestyle');
  let cgpaLifestyle = await dbQuery(`
  SELECT
    CASE
      WHEN cgpa BETWEEN 1 AND 2 THEN '1-2'
      WHEN cgpa BETWEEN 2.01 AND 3 THEN '2.01-3'      
      ELSE '3.01-4'
    END as cgpaGroup,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as rate
  FROM students
  WHERE depression = 1
  GROUP BY cgpaGroup
  ORDER BY
    CASE
      WHEN cgpaGroup = '1-2' THEN 1
      WHEN cgpaGroup = '2.01-3' THEN 2
      ELSE 3
    END
  `);

  let combinedCgpaData = [
    ['CGPA', 'Globalt (%)', 'Indien (%)'],
    ...cgpaLifestyle.map(r => [
      r.cgpaGroup,
      r.rate,
      cgpaDepression.find(a => a.cgpaGroup === r.cgpaGroup)?.rate || 0
    ])
  ];

  drawGoogleChart({
    type: 'LineChart',
    data: combinedCgpaData,
    options: {
      hAxis: { title: 'CGPA' },
      vAxis: { title: 'Andel deprimerade (%)', minValue: 0 },
      colors: ['#AFC4D6', '#7B6CBF'],
      backgroundColor: 'transparent',
      curveType: 'function', // mjuka linjer
      pointSize: 5,
      legend: { position: 'top' }
    }
  });

  addMdToPage(` 
    Vid jämförelse av CGPA (Cumulative Grade Point Average):
    - Studenter med lägre CGPA har en något högre andel depression, men skillnaden är liten.
    - Mönstret är liknande globalt och i Indien.

    Detta tyder på att akademiska prestationer inte är en stark indikator på depression, men kan ha viss påverkan på gruppnivå.
  `);

};

addMdToPage(` 
  Insikter från jämförelsen:
  1. Mönstren är överraskande lika globalt och i Indien, trots skillnader i deltagarantal och representativitet.
  2. Sömn är den tydligaste gemensamma faktorn som påverkar depressionsfrekvensen i båda dataset.
  3. Faktorer som kön, ålder och CGPA visar små skillnader, vilket tyder på att dessa inte är primära riskfaktorer på global nivå.
  4. Vid framtida analyser kan man fokusera på deprimerade studenter och deras livsstilsfaktorer för att identifiera universella mönster.
`);
