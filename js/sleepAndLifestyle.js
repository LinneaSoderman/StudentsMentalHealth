addMdToPage('# Hur påverkar sömn och livsstil depressionsgraden?');
dbQuery.use('studentsDepression');

//  Är depression vanligare bland studenter med lågt sleepScore? 
// "Less than 5 hours": 1, "5-6 hours": 2,"7-8 hours": 3,"More than 8 hours": 4
addMdToPage('### Kort sömn kopplas till högre risk för depression');
let sleepData = await dbQuery(`
  SELECT 
    sleepScore,
    COUNT(*) as total,
    SUM(depression) as depressed,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) as depression_rate
  FROM students
  WHERE sleepScore IS NOT NULL
  GROUP BY sleepScore
  ORDER BY sleepScore
`);

let combinedSleepData = [
  ['Sömnkvalitet', 'Depressionsfrekvens (%)'],
  ...sleepData.map(r => [String(r.sleepScore), r.depression_rate])
];

drawGoogleChart({
  type: 'ColumnChart',
  data: combinedSleepData,
  options: {
    hAxis: { title: 'Sömnkvalitet 1-4' },
    vAxis: { title: 'Andel deprimerade (%)', viewWindow: { min: 0, max: 100 } },
    colors: ['#AFC4D6'],
    backgroundColor: 'transparent',
    legend: { position: 'none' }
  }
});
addMdToPage('1 är mindre än 5 timmar, 2 är 5-6 timmar, 3 är 7-8 timmar och 4 är mer än 8 timmar sömn.');
addMdToPage(`
  Analysen visar ett tydligt samband mellan sömn och depressionsgrad: 
  - Bland studenter som sover mindre än 5 timmar per natt är 64,5 % deprimerade.
  - Andelen deprimerade sjunker gradvis när sömnkvaliteten ökar, och de som sover mer än 8 timmar har den lägsta andelen depression.

  Detta tyder på att otillräcklig sömn är en stark riskfaktor för depression, 
  och att bättre sömn kan fungera som en skyddande faktor.
`);


// Finns det samband mellan dietaryHabits och depression ?;
addMdToPage('### Sämre matvanor är kopplade till högre depressionsnivåer');
addMdToPage(' Enkätdeltagarna har fått ranka sina kostvanor som Helathy, Moderate eller Unhealthy. Men nästan 28% har även svarat others');

let dietData = await dbQuery(`
  SELECT 
    dietaryHabits,
    COUNT(*) as total,
    SUM(depression) as depressed,
    ROUND(100.0 * SUM(depression) / COUNT(*), 1) as depression_rate
  FROM students
  WHERE dietaryHabits IS NOT NULL
  GROUP BY dietaryHabits
  ORDER BY CASE dietaryHabits 
    WHEN 'Healthy' THEN 1 
    WHEN 'Moderate' THEN 2 
    WHEN 'Unhealthy' THEN 3 
  END
`);

let combinedDietData = [
  ['Matvanor', 'Depressionsfrekvens (%)'],
  ...dietData.map(r => [r.dietaryHabits, r.depression_rate])
];

drawGoogleChart({
  type: 'ColumnChart',
  data: combinedDietData,
  options: {
    hAxis: { title: 'Matvanor' },
    vAxis: { title: 'Andel deprimerade (%)', viewWindow: { min: 0, max: 100 } },
    colors: ['#7B6CBF'],
    backgroundColor: 'transparent',
    legend: { position: 'none' }
  }
});
addMdToPage(`
  När vi tittar på kostvanor ser vi att depressionsgraden ökar bland studenter med ogynnsamma matvanor:
  - Studenter som anger Unhealthy eller Others har högst andel depression, med 66,7 % av “Others” som är deprimerade.
  - De med Healthy kostvanor har betydligt lägre depressionsgrad.

Detta visar att kost och livsstil kan påverka psykiskt välbefinnande, 
även om det finns många andra faktorer som spelar in.
`);

addMdToPage(`
  Insikter från data: sömn och kostvanor är viktiga faktorer för studenters mentala hälsa
  Sammanfattningsvis visar analysen att:
  - Brist på sömn ökar risken för depression, vilket understryker vikten av regelbunden och tillräcklig sömn.
  - Dåliga matvanor är kopplade till högre depressionsnivåer, vilket pekar på att hälsosamma vanor kan ha skyddande effekt.
  - Livsstilsfaktorer samverkar ofta med andra riskfaktorer, såsom hög akademisk press och låg studietillfredsställelse, för att påverka studenters mentala hälsa.

  Dessa insikter kan användas för att främja hälsosamma rutiner och minska risken för depression bland studenter.
`);