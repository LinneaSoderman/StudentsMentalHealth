// Det nya datasetet är genererad data från ett ospecifierat land, därav utgår jag ifrån att det är globalt. 

addMdToPage(`## Jämförelse mellan datasettet från inden och ett utanför indien
  För att se hur studenters mentala hälsa skiljer sig i indien mot globalt.
`);

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
  Den globala studien har en högre andel icke deprimerade studenter, samt fler deltagare. 
  Enligt andra källor raporterar ungefär 25–35 % av studenter globalt att de känner sig deprimerade, 
  medan i indien är det mellan 30–60 %. 
  Detta kan tyda på att dataseten inte representerar verkligheten.
    Andelen deprimerade studenter är dock ganska lika i båda dataset, 
    därför utgår jag framöver endast ifrån de deprimerade studenterna i dataseten.    
`);

// Dropdown för att välja inriktning
let valtInriktning = addDropdown('Visa inriktning', ['Kön', 'Sömn', 'Ålder', 'CGPA']);

if (valtInriktning === 'Kön') {
  addMdToPage('## Depression hos män vs kvinnor');
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
      colors: ['#FFB6C1', '#9d67f5'],
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
      colors: ['#FFB6C1', '#9d67f5'],
      backgroundColor: 'transparent'
    }
  });

} else if (valtInriktning === 'Sömn') {
  addMdToPage('## Hur sömn påverkar depression');

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
      colors: ['#FFB6C1', '#9d67f5'],
      backgroundColor: 'transparent'
    }
  });

} else if (valtInriktning === 'Ålder') {
  addMdToPage('## Ålder och depression');

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
      colors: ['#FFB6C1', '#9d67f5'],
      backgroundColor: 'transparent'
    }
  });

} else if (valtInriktning === 'CGPA') {
  addMdToPage('## CGPA och depression');

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
      colors: ['#FFB6C1', '#9d67f5'],
      backgroundColor: 'transparent',
      curveType: 'function', // mjuka linjer
      pointSize: 5,
      legend: { position: 'top' }
    }
  });

};
