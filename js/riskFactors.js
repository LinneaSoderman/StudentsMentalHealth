//  Är depression vanligare bland män eller kvinnor ? Mucke fler män har deltagit i studien
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



// Skiljer sig depressionsgraden mellan olika åldrar ? 
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




// Hur påverkar familyHistory risken för depression ?
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

