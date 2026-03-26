addMdToPage('# Demografi');

addMdToPage('### Andel deprimerade studenter');
// Hur stor andel av studenterna är deprimerade ?
dbQuery.use('studentsDepression');
let depressedStudents = await dbQuery(`
  SELECT 
    CASE WHEN depression = 1 THEN 'Depressed' ELSE 'Not depressed' END as status,
    COUNT(*) as count
  FROM students
  GROUP BY depression
`);

let depressedStudentsChart = makeChartFriendly(depressedStudents);

drawGoogleChart({
  type: 'PieChart',
  data: depressedStudentsChart,
  options: {
    backgroundColor: 'transparent',
    slices: {
      0: { color: '#FFB6C1' },
      1: { color: '#9d67f5' }
    }
  }
});
addMdToPage(`En majoritet av studentarna i undersökningen, 58,5% vilket motsvarar cirka 16 000 studenter, 
            rapporterade att de var deprimerade. 
    Detta indikerar att psykisk ohälsa är ett utbrett problem bland studenterna i denna population, men det är viktigt att notera att data är självrapporterad och kan vara påverkad av bias.
  
  `);


// Hur stor andel av studenterna har självmordstankar?
addMdToPage('### Självmordstankar bland deprimerade och icke-deprimerade studenter');
dbQuery.use('studentsDepression');

// Deprimerade studenters självmordstankar
let suicidalDepressed = await dbQuery(`
  SELECT 
    CASE WHEN suicidalThoughts = 1 THEN 'Självmordstankar' 
    ELSE 'Inga självmordstankar' END as status,  
    COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY suicidalThoughts
`);

// Icke-deprimerade studenters självmordstankar
let suicidalNotDepressed = await dbQuery(`
  SELECT 
    CASE WHEN suicidalThoughts = 1 THEN 'Självmordstankar' 
    ELSE 'Inga självmordstankar' END as status,  
    COUNT(*) as count
  FROM students
  WHERE depression = 0
  GROUP BY suicidalThoughts
`);

// Slå ihop till ett Google Chart-vänligt format med två kolumner
let depressedMap = Object.fromEntries(suicidalDepressed.map(r => [r.status, r.count]));
let notDepressedMap = Object.fromEntries(suicidalNotDepressed.map(r => [r.status, r.count]));

let combinedData = [
  ['Status', 'Med depression', 'Utan depression'],
  ['Självmordstankar', depressedMap['Självmordstankar'] || 0, notDepressedMap['Självmordstankar'] || 0],
  ['Inga självmordstankar', depressedMap['Inga självmordstankar'] || 0, notDepressedMap['Inga självmordstankar'] || 0]
];

drawGoogleChart({
  type: 'BarChart',
  data: combinedData,
  options: {
    chartArea: { left: 160, right: 20 },
    colors: ['#FFB6C1', '#9d67f5'],
    backgroundColor: 'transparent',
    hAxis: { minValue: 0 }
  }
});

addMdToPage(`Bland de studenter som har/haft självmordstankar anger övervägande majoritet att dem är depprimerade,
  men ungefär 4 000 studenter som inte rapporterar att de är deprimerade, rapporterar ändå att de har/har haft självmordstankar.
  Detta kan tyda på att det finns andra faktorer än depression som bidrar till självmordstankar, eller att vissa studenter inte identifierar sig som deprimerade trots att de har självmordstankar.
  Bland de studenter som inte har självmordstankar, är det en större andel som inte är deprimerade, 
  men det finns fortfarande en betydande andel deprimerade studenter som inte har självmordstankar.
`);

// Skiljer sig depressionsgraden mellan olika utbildningsnivåer ? 

addMdToPage('### Samband mellan utbildningsnivå och depression');
dbQuery.use('studentsDepression');
let depressedDegrees = await dbQuery(`
  SELECT
    degree,
    COUNT(*) as count
  FROM students
  WHERE depression = 1
  AND degree != 'Others'
  GROUP BY degree
`);


let depressedDegreesChart = makeChartFriendly(depressedDegrees);

drawGoogleChart({
  type: 'BarChart',
  data: depressedDegreesChart,
  options: {
    legend: { position: 'none' },
    chartArea: { left: 160, right: 20 },
    colors: ['#FFB6C1'],
    backgroundColor: 'transparent',
    hAxis: { minValue: 0 }
  }
});

addMdToPage(`En större andel av de deprimerade studenterna är på kandidatnivå, följt av gymnaiseelever och master studenter. 
  PHD-studenter utgör den minsta andelen av de deprimerade studenterna. Kandidatstudenterna utgör dock även 
  den största andelen av den totala studentpopulationen. 
  Medans class 12 är den näst minsta, vilket kan tyda på att gymnasieelever är den grupp med flest depprimerade elever.
  `);