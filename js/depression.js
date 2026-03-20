// Hur stor andel av studenterna är deprimerade ?
// Skiljer sig medelåldern mellan deprimerade och icke - deprimerade ?;
dbQuery.use('studentsDepression');
addMdToPage('### Hur stor andel av studenterna är deprimerade ?');
let depressedStudents = await dbQuery(`
  SELECT 
    CASE WHEN depression = 1 THEN 'Depressed' ELSE 'Not depressed' END as status,
    COUNT(*) as count
  FROM students
  GROUP BY depression
`);


let data1 = makeChartFriendly(depressedStudents);

drawGoogleChart({
  type: 'PieChart',
  data: data1,
  options: {
    title: 'Andel deprimerade studenter',
    slices: {
      0: { color: '#FFB6C1' },  // första tårtan
      1: { color: '#FF69B4' }   // andra tårtan
    }
  }
});


//  Är depression vanligare bland män eller kvinnor ?
dbQuery.use('studentsDepression');
addMdToPage('### Är depression vanligare bland män eller kvinnor ?');
let depressedGenders = await dbQuery(`
  SELECT 
    CASE WHEN gender = 'Female' THEN 'female' ELSE 'male' END as status,
    COUNT(*) as count
  FROM students
  GROUP BY gender
`);


let data2 = makeChartFriendly(depressedGenders);

drawGoogleChart({
  type: 'PieChart',
  data: data2,
  options: {
    title: 'Deprimerade studenter efter kön',
    slices: {
      0: { color: '#FFB6C1' },  // första tårtan
      1: { color: '#FF69B4' }   // andra tårtan
    }
  }
});


// Skiljer sig medelåldern mellan deprimerade och icke - deprimerade ?
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
