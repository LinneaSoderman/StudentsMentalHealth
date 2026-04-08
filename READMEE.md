# StudentsMentalHealth

Ett dataprojekt som analyserar samband mellan studenters levnadsvanor och depression, baserat på `student_depression_dataset.csv`.

## Datakälla

`student_depression_dataset.csv` – dataset med ~28 000 studentposter från Indien.

## ETL

Scriptet `etl.py` läser in rådata, transformerar den och sparar resultatet som en SQLite-databas.

### Köra scriptet

```bash
cd py/StudentDepressionIndia
python etl.py
```
```bash
cd py/studentLifestyle
python studentLifestyleETL.py
```

### Transformationer i huvuddataset (StudentDepression)

**Rensning**
- `sleepScore` och `profession`: citattecken strippades bort från rådata

**Typkonverteringar**
- `age` och `workStudyHours`: konverterades från float till int
- `financialStress`: konverterades från sträng till int — 3 rader med ogiltigt värde (`?`) sparas som NULL

**Boolean**
- `suicidalThoughts`: Yes/No → true/false
- `familyHistory`: Yes/No → true/false
- `depression`: 0/1 → true/false

**Omvandlingar**
- `sleepScore`: text → ordinal skala 1–4
  - `1` = Less than 5 hours
  - `2` = 5–6 hours
  - `3` = 7–8 hours
  - `4` = More than 8 hours
  - 18 rader med värdet `Others` sparas som NULL
- `degree`: 28 unika värden grupperade till `Class 12`, `Bachelor`, `Master`, `PhD`, `Others`

**Kolumnnamn**
- Alla kolumner döptes om till camelCase
- `haveYouEverHadSuicidalThoughts` → `suicidalThoughts`
- `familyHistoryOfMentalIllness` → `familyHistory`
- `sleepDuration` → `sleepScore`

### Kolumner i databasen

| Kolumn | Typ | Beskrivning |
|---|---|---|
| id | int | Unikt rad-id |
| gender | text | Male / Female |
| age | int | Ålder |
| city | text | Stad |
| profession | text | Yrke/roll |
| academicPressure | int | Skala 0–5 |
| workPressure | int | Skala 0–5 |
| cgpa | float | Betygspoäng |
| studySatisfaction | int | Skala 0–5 |
| jobSatisfaction | int | Skala 0–5 |
| sleepScore | int | Ordinal skala 1–4, NULL om okänt |
| dietaryHabits | text | Healthy / Moderate / Unhealthy / Others |
| degree | text | Class 12 / Bachelor / Master / PhD / Others |
| suicidalThoughts | bool | Har haft självmordstankar |
| workStudyHours | int | Timmar arbete/studier per dag (0–12) |
| financialStress | int | Skala 1–5, NULL om okänt |
| familyHistory | bool | Familjehistorik av psykisk ohälsa |
| depression | bool | Diagnostiserad depression |

## Analys

Projektet innehåller flera analyssidor som undersöker samband mellan levnadsvanor och depression:

- **Kön och ålder** – jämförelse av depressionsnivåer mellan demografiska grupper
- **Akademisk press och studietillfredsställelse** – samband med depression
- **Livsstil** – sömn, kost och arbetsbelastning
- **Finansiell stress** – koppling till mental ohälsa
- **Global jämförelse** – mönster i globala dataset jämfört med indiska data

### Statistiska metoder
- Shapiro-Wilk test för normalfördelning
- Tvåstickprovs t-test med nollhypotesprövning (α = 0.05)
- Pearsons korrelationstest (pcorrtest)