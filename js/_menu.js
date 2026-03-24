createMenu('Students Mental Health', [
  { name: 'Välkommen', script: 'home.js' },
  {
    name: 'Översikt', sub: [
      { name: 'Demografi', script: 'demographics.js' },
      { name: 'Riskfaktorer', script: 'riskFactors.js' }
    ]
  },
  {
    name: 'Stress och Press', sub: [
      { name: 'Stress', script: 'stress.js' },
      { name: 'Akademisk Press', script: 'academicPressure.js' }
    ]
  },
  { name: 'Sömn och livsstil', script: 'sleepAndLifestyle.js' },
  { name: 'Kombinerade samband', script: 'combinations.js' }
]);