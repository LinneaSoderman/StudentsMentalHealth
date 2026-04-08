addMdToPage('## Akademisk press och depression');
dbQuery.use('studentsDepression');

// Är academicPressure högre hos deprimerade studenter? 
addMdToPage('### Är akademisk press högre hos deprimerade studenter?');
let academicPressureWhenDepressed = await dbQuery(`
  SELECT academicPressure, COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY academicPressure
`);
let academicPressureWhenNotDepressed = await dbQuery(`
SELECT academicPressure, COUNT(*) as count
FROM students
WHERE depression = 0
GROUP BY academicPressure
`);

// Slå ihop till ett Google Chart-vänligt format med två kolumner
let depressedAcademicPressureMap = Object.fromEntries(
  academicPressureWhenDepressed.map(r => [String(r.academicPressure), r.count])
);
let notDepressedAcademicPressureMap = Object.fromEntries(
  academicPressureWhenNotDepressed.map(r => [String(r.academicPressure), r.count])
);

let combinedAcademicPressureData = [
  ['Academic Pressure', 'Med depression', 'Utan depression'],
  ...Array.from({ length: 5 }, (_, i) => [
    String(i + 1),
    academicPressureWhenDepressed.find(r => r.academicPressure === i + 1)?.count || 0,
    academicPressureWhenNotDepressed.find(r => r.academicPressure === i + 1)?.count || 0
  ])
];

drawGoogleChart({
  type: 'ColumnChart',
  data: combinedAcademicPressureData,
  options: {
    hAxis: { title: 'Akademisk press' },
    vAxis: { title: 'Antal studenter', minValue: 0 },
    colors: ['#AFC4D6', '#7B6CBF'],
    backgroundColor: 'transparent'
  }
});

//Google Charts tolkar '0' som en ogiltig eller tom kategori. 
// Jag valde att flitrera bort det eftersom filtrera bort det eftersom det bara är 9 studenter av ~28 000

addMdToPage(`
  Kontrasten mellan de deprimerade och icke-deprimerade deltagarna är tydligast vid akademisk press-nivå 1 och 5. 
  Vid press-nivå 1 är det en högre andel icke depprimerade deltagare, medan vid press-nivå 5 är det en högre andel deprimerade deltagare.
  Men från press-nivå 3 och högre är en högre andel deprimerade deltagare än icke-deprimerade, vilket tyder på att hög akademisk press kan vara kopplat till depression. 
  Eller att depprision gör att individer upplever sin akademiska press som högre. Det är dock viktigt att notera att detta inte bevisar orsakssamband, utan bara en korrelation mellan akademisk press och depression.
`);


// Är studySatisfaction lägre hos deprimerade studenter?
addMdToPage('### Är studietillfredsställelse lägre hos deprimerade studenter?');
let studySatisfactionWhenDepressed = await dbQuery(`
  SELECT studySatisfaction, COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY studySatisfaction
`);
let studySatisfactionWhenNotDepressed = await dbQuery(`
SELECT studySatisfaction, COUNT(*) as count
FROM students
WHERE depression = 0
GROUP BY studySatisfaction
`);


let combinedStudySatisfactionData = [
  ['Study Satisfaction', 'Med depression', 'Utan depression'],
  ...Array.from({ length: 5 }, (_, i) => [
    String(i + 1),
    studySatisfactionWhenDepressed.find(r => r.studySatisfaction === i + 1)?.count || 0,
    studySatisfactionWhenNotDepressed.find(r => r.studySatisfaction === i + 1)?.count || 0
  ])
];
//Google Charts tolkar '0' som en ogiltig eller tom kategori. 
// Jag valde att flitrera bort det eftersom filtrera bort det eftersom det bara är 9 studenter av ~28 000


drawGoogleChart({
  type: 'ColumnChart',
  data: combinedStudySatisfactionData,
  options: {
    hAxis: { title: 'Studietillfredsställelse' },
    vAxis: { title: 'Antal studenter', minValue: 0 },
    colors: ['#AFC4D6', '#7B6CBF'],
    backgroundColor: 'transparent'
  }
});

addMdToPage(`
  Det är en tydlig skillnad bland studietillfredställelsen hos de deprimerade och icke-deprimerade deltagarna i de lägre nivåerna. 
  Vid studietillfredsställelse-nivå 1 är det en högre andel deprimerade deltagare, medan vid nivå 5 är det en högre andel icke-deprimerade deltagare. 
  Kopplat med resultaten från akademisk press kan det tyda på att hög akademisk press och låg studietillfredsställelse är kopplat till depression.
`);

// skiljer sig cgpa mellan deprimerade och icke - deprimerade ?;
addMdToPage('### Skiljer sig CGPA, "Cumulative Grade Point Average", mellan deprimerade och icke-deprimerade studenter?');
let cgpaWhenDepressed = await dbQuery(`
  SELECT ROUND(cgpa, 1) as cgpa, COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY ROUND(cgpa, 1)
  ORDER BY cgpa
`);
let cgpaWhenNotDepressed = await dbQuery(`
  SELECT ROUND(cgpa, 1) as cgpa, COUNT(*) as count
  FROM students
  WHERE depression = 0
  GROUP BY ROUND(cgpa, 1)
  ORDER BY cgpa
`);

const depTotal = cgpaWhenDepressed.reduce((sum, r) => sum + r.count, 0);
const notDepTotal = cgpaWhenNotDepressed.reduce((sum, r) => sum + r.count, 0);

let allCgpa = [...new Set([
  ...cgpaWhenDepressed.map(r => r.cgpa),
  ...cgpaWhenNotDepressed.map(r => r.cgpa)
])].sort((a, b) => a - b);

let combinedCgpaData = [
  ['CGPA', 'Med depression', 'Utan depression'],
  ...allCgpa.map(cgpa => [
    String(cgpa),
    parseFloat((((cgpaWhenDepressed.find(r => r.cgpa === cgpa)?.count || 0) / depTotal) * 100).toFixed(1)),
    parseFloat((((cgpaWhenNotDepressed.find(r => r.cgpa === cgpa)?.count || 0) / notDepTotal) * 100).toFixed(1))
  ])
];


drawGoogleChart({
  type: 'LineChart',
  data: combinedCgpaData,
  options: {
    hAxis: {
      title: 'CGPA',
      ticks: allCgpa
    },
    vAxis: { title: 'Andel av gruppen (%)', viewWindow: { min: 0 } },
    colors: ['#AFC4D6', '#7B6CBF'],
    backgroundColor: 'transparent',
    curveType: 'function',
    lineWidth: 2,
    pointSize: 3,
  }
});
addMdToPage(`
  Kurvorna följer varandra ganska nära, den största skillnaden är vid cgpa 8 där det är 1% fler depprimerade än icke-deprimerade. 
  Det tyder på att det inte är någon större skillnad i CGPA mellan de deprimerade och icke-deprimerade deltagarna.
`);