// Hur påverkar familyHistory risken för depression ?
// Är depression vanligare bland studenter med suicidalThoughts ?



// Skiljer sig medelåldern mellan deprimerade och icke - deprimerade ?
dbQuery.use('studentsDepression');
addMdToPage('### Skiljer sig medelåldern mellan deprimerade och icke - deprimerade ?');
let ageData = await dbQuery(`
  SELECT age, depression
  FROM students
`);

// Separera i två grupper
let depressedAges = ageData.filter(s => s.depression === 1).map(s => s.age);
let notDepressedAges = ageData.filter(s => s.depression === 0).map(s => s.age);

// Använd simple-statistics
let meanDepressed = s.mean(depressedAges);
let meanNotDepressed = s.mean(notDepressedAges);

let data3 = [
  ['Status', 'Medelålder'],
  ['Depressed', meanDepressed],
  ['Not depressed', meanNotDepressed]
];

drawGoogleChart({
  type: 'BarChart',
  data: data3,
  options: {
    title: 'Medelålder: deprimerade vs icke-deprimerade',
    legend: { position: 'none' },
    colors: ['#e3a6c3'],
    hAxis: { minValue: 0 }
  }
});
