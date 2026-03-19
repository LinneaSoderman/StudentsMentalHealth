// Hur stor andel av studenterna är deprimerade ?
//  Är depression vanligare bland män eller kvinnor ?
// Skiljer sig medelåldern mellan deprimerade och icke - deprimerade ?;

dbQuery.use('studentDepression');
let students = await dbQuery('SELECT * FROM students');

addMdToPage('# Titel');

addMdToPage('### Hur stor andel av studenterna är deprimerade?');

addMdToPage('### Är depression vanligare bland män eller kvinnor ?');

addMdToPage('### Skiljer sig medelåldern mellan deprimerade och icke - deprimerade ?');
