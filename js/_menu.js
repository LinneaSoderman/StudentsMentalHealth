createMenu('Studenters mentala hälsa i indien', [
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
  { name: 'När faktorer samverkar', script: 'combinations.js' },
  { name: 'Jämförelser', script: 'compare.js' },
  { name: 'Statistisk analys', script: 'statisticAnalysis.js' },
  { name: 'Avslut', script: 'conclution.js' }

]);