addMdToPage(`
# Psykisk ohälsa bland studerande

#### Analys av en enkätundersökning kring om studerande i Indien anser sig vara deprimerade eller inte.

Samt hur detta korrelerar till deras studiebörda, arbetsbörda, antal timmar de arbetar / studerar per dag, hur mycket de sover, om de upplever att de äter hälsosamt eller inte etc.

## Bakgrund

Psykisk ohälsa är en växande folkhälsoutmaning i Indien, särskilt bland unga vuxna.
Redan 2017 var ungefär var sjunde person drabbad, och andelen har nästan fördubblats sedan 1990.

Studenter är en särskilt utsatt grupp på grund av hög prestationspress, konkurrens och osäker framtid. Denna studie undersöker vilka faktorer i studenters vardag som hänger ihop med depression.

## Begränsningar

- Data baseras på självrapportering, vilket kan innebära subjektiva bias.
- Korrelationer betyder inte nödvändigtvis orsakssamband.
- Resultaten är specifika för denna population och bör inte generaliseras utan försiktighet.

## Datan 
Datan fokuserar på att analysera depression bland studenter och identifiera faktorer som påverkar deras mentala hälsa. 
Varje rad i datan representerar en enskild student och innehåller information om demografi, studier, livsstil och psykiskt välbefinnande.

### Variabler i datasetet
Demografi
- ID - Unikt ID för varje student
- Gender - Endast man/kvinna tillgängligt 
- Age - Studentens ålder
- City - Stad eller region där studenten bor

Studier
- Degree - Utbildningsprogram eller examen som studenten läser
- CGPA - Studentens genomsnittliga betyg (studieresultat)
- Academic Pressure - Upplevd press från studier (t.ex. prov och deadlines)
- Study Satisfaction - Hur nöjd studenten är med sina studier

Livsstil
- Work/Study Hours - Antal timmar per dag som läggs på arbete eller studier utanför skoltid
- Sleep Score - en skala från 1-4 baserat på hur mycket studenten sover
- Dietary Habits - Studentens kostvanor

Psykisk hälsa
- Depression - Målvariabel: om studenten upplever depression, självskattad (ja/nej)
- Suicidal Thoughts - Om studenten någon gång haft självmordstankar (ja/nej)
- Family History - Om det finns psykisk ohälsa i familjen (ja/nej)
`);