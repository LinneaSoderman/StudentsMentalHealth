addMdToPage('## Akademisk press och depression');
dbQuery.use('studentsDepression');

// Är academicPressure högre hos deprimerade studenter? 
addMdToPage('### Hög akademisk press kopplas till högre risk för depression');
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
  Analysen visar en tydlig skillnad mellan de deprimerade och icke-deprimerade deltagarna när det gäller upplevd akademisk press:
  - Vid press-nivå 1 är det fler icke-deprimerade studenter.
  - Vid press-nivå 5 dominerar de deprimerade studenterna.
  - Från nivå 3 och uppåt är andelen deprimerade konsekvent högre än de icke-deprimerade.

  Detta tyder på att hög akademisk press kan vara kopplat till depression. 
  Samtidigt är det möjligt att depression gör att studenter upplever sin akademiska press som högre. 
  Data visar korrelation, inte orsakssamband.
`);


// Är studySatisfaction lägre hos deprimerade studenter?
addMdToPage('### Låg studietillfredsställelse är kopplat till depression');
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
  När vi tittar på studietillfredsställelse ser vi ett liknande mönster:
  - Vid nivå 1 (mycket låg tillfredsställelse) är en större andel deprimerade studenter.
  - Vid nivå 5 (mycket hög tillfredsställelse) dominerar de icke-deprimerade.

  Kombinerat med resultaten om akademisk press tyder detta på att hög press och låg studietillfredsställelse ofta går hand i hand med depression.
`);

// skiljer sig cgpa mellan deprimerade och icke - deprimerade ?;
addMdToPage('### CGPA påverkas inte nämnvärt av depression');
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
  När vi analyserar studieresultat (CGPA) ser vi att kurvorna för de deprimerade och icke-deprimerade deltagarna följer varandra nära.
  - Den största skillnaden är vid CGPA 8, där det är 1 % fler deprimerade än icke-deprimerade.
  - Överlag finns alltså ingen tydlig skillnad i akademiska prestationer mellan grupperna.

  Detta visar att depression inte nödvändigtvis påverkar betyg i denna population, 
  även om den påverkar välbefinnande och upplevelse av studier.
`);

addMdToPage(` 
  ### Insikter från data: Betyg och prestationer är inte allt
  Sammanfattningsvis visar analysen att:
  - Hög akademisk press är starkt kopplat till depression, särskilt vid nivå 3–5.
  - Låg studietillfredsställelse ökar risken, vilket ofta samverkar med hög press.
  - CGPA påverkas inte signifikant, vilket tyder på att depression kan förekomma även hos studenter med goda akademiska resultat.

  För universitet och högskolor är detta en tydlig signal om att stödjande insatser bör fokusera på att minska upplevd press och öka studietillfredsställelse, 
  inte bara på betyg och prestationer.
`);