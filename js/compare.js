// Det nya datasetet är genererad data från ett ospecifierat land, därav utgår jag ifrån att det är globalt. 

addMdToPage(`## Jämförelse mellan datasettet från inden och ett utanför indien
  För att se hur studenters mentala hälsa skiljer sig i indien mot globalt.
`);

let valtInriktning = addDropdown('Visa inriktning', ['Kön', 'Sömn', 'Ålder', 'CGPA']);

if (valtInriktning === 'Kön') {
  addMdToPage('## Depression hos män vs kvinnor');
  // StudentDepression har en ganska jämn fördelning av Män/kvinnor och student lifestyle är 50/50
  dbQuery.use('studentsDepression');
  let genderDepression = await dbQuery(`
  SELECT gender, COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY gender
`);

  dbQuery.use('studentLifestyle');
  let genderLifestyle = await dbQuery(`
  SELECT gender, COUNT(*) as count
  FROM students
  WHERE depression = 1
  GROUP BY gender
`);

  // Pie chart för studentsDepression
  addMdToPage('### Studenter i indien');
  drawGoogleChart({
    type: 'PieChart',
    data: [
      ['Kön', 'Antal'],
      ...genderDepression.map(r => [r.gender, r.count])
    ],
    options: {
      colors: ['#FFB6C1', '#9d67f5'],
      backgroundColor: 'transparent'
    }
  });

  // Pie chart för studentLifestyle
  addMdToPage('### Studenter globalt');
  drawGoogleChart({
    type: 'PieChart',
    data: [
      ['Kön', 'Antal'],
      ...genderLifestyle.map(r => [r.gender, r.count])
    ],
    options: {
      colors: ['#FFB6C1', '#9d67f5'],
      backgroundColor: 'transparent'
    }
  });

} else if (valtInriktning === 'Sömn') {
  // din kod för sömnanalys
} else if (valtInriktning === 'Ålder') {
  // din kod för åldersanalys
} else if (valtInriktning === 'CGPA') {
  // din kod för CGPA-analys
}
