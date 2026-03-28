addMdToPage('# Hur påverkar sömn och livsstil depressionsgraden?');
dbQuery.use('studentsDepression');

//  Är depression vanligare bland studenter med lågt sleepScore? 
// "Less than 5 hours": 1, "5-6 hours": 2,"7-8 hours": 3,"More than 8 hours": 4
addMdToPage('### Är depression vanligare bland studenter med lågt sleepScore?');
let sleepData = await dbQuery(`
  SELECT 
    sleepScore,
    COUNT(*) as total,
    SUM(depression) as depressed,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) as depression_rate
  FROM students
  WHERE sleepScore IS NOT NULL
  GROUP BY sleepScore
  ORDER BY sleepScore
`);

let combinedSleepData = [
  ['Sömnkvalitet', 'Depressionsfrekvens (%)'],
  ...sleepData.map(r => [String(r.sleepScore), r.depression_rate])
];

drawGoogleChart({
  type: 'ColumnChart',
  data: combinedSleepData,
  options: {
    hAxis: { title: 'Sömnkvalitet 1-4' },
    vAxis: { title: 'Andel deprimerade (%)', viewWindow: { min: 0, max: 100 } },
    colors: ['#FFB6C1'],
    backgroundColor: 'transparent',
    legend: { position: 'none' }
  }
});
addMdToPage('1 är mindre än 5 timmar, 2 är 5-6 timmar, 3 är 7-8 timmar och 4 är mer än 8 timmar sömn.');
addMdToPage(`
  Enligt enkätstudien sjunker andelen depprimerade studenter när sömnkvaliteten ökar. Bland de som rapporterade mindre än 5 timmars sömn var 64,5 deprimerade.
   
`);


// Finns det samband mellan dietaryHabits och depression ?;
addMdToPage('### Finns det samband mellan diet och depression ?');
addMdToPage(' Enkätdeltagarna har fått ranka sina kostvanor som Helathy, Moderate eller Unhealthy. Men nästan 28% har även svarat others');

let dietData = await dbQuery(`
  SELECT 
    dietaryHabits,
    COUNT(*) as total,
    SUM(depression) as depressed,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) as depression_rate
  FROM students
  WHERE dietaryHabits IS NOT NULL
  GROUP BY dietaryHabits
  ORDER BY CASE dietaryHabits 
    WHEN 'Healthy' THEN 1 
    WHEN 'Moderate' THEN 2 
    WHEN 'Unhealthy' THEN 3 
  END
`);

let combinedDietData = [
  ['Matvanor', 'Depressionsfrekvens (%)'],
  ...dietData.map(r => [r.dietaryHabits, r.depression_rate])
];

drawGoogleChart({
  type: 'ColumnChart',
  data: combinedDietData,
  options: {
    hAxis: { title: 'Matvanor' },
    vAxis: { title: 'Andel deprimerade (%)', viewWindow: { min: 0, max: 100 } },
    colors: ['#FFB6C1'],
    backgroundColor: 'transparent',
    legend: { position: 'none' }
  }
});
addMdToPage(`
  Depprisionsgraden övar markant bladn dem med sämre matvanor. 
  Men det är även många som svarat others, och 66,7% av dem som svara others är deprimerade.
`);