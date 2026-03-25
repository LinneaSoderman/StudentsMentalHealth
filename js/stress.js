addMdToPage('# Stress och depression');
// Finns det samband mellan financialStress och depression ?
addMdToPage("### Finns det samband mellan inkomsstress och depression ?");
dbQuery.use('studentsDepression');
let financialStressAndDepression = await dbQuery(`
  SELECT
    financialStress,
    COUNT(*) as total,
    SUM(depression) as depressed,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) as depression_rate
  FROM students
  GROUP BY financialStress
  ORDER BY financialStress
`);

let financialStressAndDepressionChart = makeChartFriendly(financialStressAndDepression);

drawGoogleChart({
  type: 'AreaChart',
  data: financialStressAndDepressionChart,
  options: {
    colors: ['#888888', '#e2a04a', '#3266ad'],
    backgroundColor: 'transparent',
    curveType: 'function',
  }
});

// Hur ser fördelningen av workStudyHours ut för deprimerade vs icke - deprimerade ?
