addMdToPage('# Demografi');

addMdToPage('### Depression är utbrett bland studenter');
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
      0: { color: '#AFC4D6' },
      1: { color: '#7B6CBF' }
    }
  }
});
addMdToPage(`
  Analysen visar att en majoritet av studenterna, 58,5 % (cirka 16 000 personer), rapporterar att de är deprimerade.
  Detta indikerar att psykisk ohälsa är ett utbrett problem bland studenter i den undersökta populationen.
  Eftersom data är självrapporterad är det viktigt att notera att det kan finnas bias, 
  vissa studenter kan underskatta eller överskatta sin situation.
`);


// Hur stor andel av studenterna har självmordstankar?
addMdToPage('### Självmordstankar kopplas starkt till depression – men inte alltid');
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
    colors: ['#AFC4D6', '#7B6CBF'],
    backgroundColor: 'transparent',
    hAxis: { minValue: 0 }
  }
});

addMdToPage(`
  När vi jämför studenter med och utan depression, ser vi ett tydligt mönster: självmordstankar är vanligare bland deprimerade studenter.
  Samtidigt rapporterar omkring 4 000 studenter som inte identifierar sig som deprimerade att de ändå har haft självmordstankar.
  Detta tyder på att andra faktorer än depression kan bidra till självmordstankar, eller att vissa studenter inte känner igen eller vill rapportera sin depression.
  Bland de som inte har självmordstankar är majoriteten utan depression, men det finns fortfarande en betydande grupp deprimerade studenter.
  Sammantaget visar detta att psykisk ohälsa är ett komplex fenomen med flera samverkande faktorer.
`);

// Skiljer sig depressionsgraden mellan olika utbildningsnivåer ? 

addMdToPage('### Vem är mest utsatt? Depression efter utbildningsnivå');
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
    colors: ['#AFC4D6'],
    backgroundColor: 'transparent',
    hAxis: { minValue: 0 }
  }
});

addMdToPage(`
  När vi tittar på utbildningsnivå framgår att kandidatstudenter utgör den största gruppen bland de deprimerade, 
  följt av gymnasienivå och masterstudenter.
  PhD-studenter har den lägsta andelen deprimerade individer.
  Eftersom kandidatstudenter också är den största delen av populationen är detta mönster väntat, 
  men det är intressant att se att gymnasienivå (class 12) har en relativt hög andel deprimerade, 
  vilket kan tyda på att unga vuxna i övergången till högre utbildning är särskilt utsatta.
`);

addMdToPage(`
  ### Insikter från data: vilka behöver mest stöd?
  Sammantaget visar analysen att:
  - Depression är utbrett bland studenter, särskilt på kandidatnivå.
  - Självmordstankar hänger starkt ihop med depression, men förekommer även hos vissa utan diagnos.
  - Ungdomar i gymnasieålder kan vara en extra sårbar grupp när det gäller psykisk ohälsa.
  
  Denna statistiska berättelse kan användas för att förstå vilka grupper som behöver stöd och för att utveckla förebyggande program på universitet och gymnasier.
`);