addMdToPage('# Demografi');
// Hur stor andel av studenterna är deprimerade ?
dbQuery.use('studentsDepression');
addMdToPage('### Hur stor andel av studenterna är deprimerade ?');
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
    title: 'Andel deprimerade studenter',
    slices: {
      0: { color: '#FFB6C1' },
      1: { color: '#FF69B4' }
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


let depressedGendersChart = makeChartFriendly(depressedGenders);

drawGoogleChart({
  type: 'PieChart',
  data: depressedGendersChart,
  options: {
    title: 'Deprimerade studenter efter kön',
    slices: {
      0: { color: '#FFB6C1' },
      1: { color: '#FF69B4' }
    }
  }
});

// Skiljer sig depressionsgraden mellan olika degree - nivåer ? 
dbQuery.use('studentsDepression');
addMdToPage('### Skiljer sig depressionsgraden mellan olika degree - nivåer ?');
let depressedDegrees = await dbQuery(`
  SELECT
  CASE WHEN degree = 'Bachelor' THEN 'Bachelor'
  WHEN degree = 'Master' THEN 'Master'
  WHEN degree = 'PhD' THEN 'PhD'
  WHEN degree = 'Class 12' THEN 'Class 12'
  ELSE 'Other' END as status,
  COUNT(*) as count
  FROM students
  GROUP BY degree
`);
let depressedDegreesChart = makeChartFriendly(depressedDegrees);
