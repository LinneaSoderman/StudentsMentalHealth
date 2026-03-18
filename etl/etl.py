import pandas as pd
import numpy as np
import sqlite3
import re
import os

# EXTRACT
print("Extracting...")
df = pd.read_csv("student_depression_dataset.csv")
print(f"  {len(df)} rows, {len(df.columns)} columns")

# TRANSFORM
print("Transforming...")

# 1. Rensa bort citattecken i Sleep Duration och Profession
df["Sleep Duration"] = df["Sleep Duration"].str.strip("'")
df["Profession"]     = df["Profession"].str.strip("'")

# 2. Financial Stress: strang -> nullable int ('?' blir NULL)
df["Financial Stress"] = pd.to_numeric(df["Financial Stress"].replace("?", np.nan), errors="coerce")
df["Financial Stress"] = df["Financial Stress"].astype("Int64")

# 3. Age och Work/Study Hours: float -> int
df["Age"]              = df["Age"].astype(int)
df["Work/Study Hours"] = df["Work/Study Hours"].astype(int)

# 4. Sleep Duration -> ordinal skala (1-4)
sleep_map = {
    "Less than 5 hours": 1,
    "5-6 hours":         2,
    "7-8 hours":         3,
    "More than 8 hours": 4
}
df["Sleep Duration"] = df["Sleep Duration"].map(sleep_map)

# 5. Degree -> grupperade textvärden
df["Degree"] = df["Degree"].str.strip("'")
degree_map = {
    "Class 12": "Class 12",
    "B.Arch": "Bachelor", "B.Com": "Bachelor", "B.Ed": "Bachelor", "B.Pharm": "Bachelor", "B.Tech": "Bachelor",
    "BA": "Bachelor", "BBA": "Bachelor", "BCA": "Bachelor", "BE": "Bachelor", "BHM": "Bachelor",
    "BSc": "Bachelor", "LLB": "Bachelor", "MBBS": "Bachelor",
    "M.Com": "Master", "M.Ed": "Master", "M.Pharm": "Master", "M.Tech": "Master",
    "MA": "Master", "MBA": "Master", "MCA": "Master", "MD": "Master", "ME": "Master",
    "MHM": "Master", "MSc": "Master", "LLM": "Master",
    "PhD": "PhD",
    "Others": "Others"
}
df["Degree"] = df["Degree"].map(degree_map)

# 6. Verifiera nulls innan rename
null_counts = df.isnull().sum()
fs_nulls = null_counts["Financial Stress"]
sl_nulls = null_counts["Sleep Duration"]
other_nulls = null_counts.drop(["Financial Stress", "Sleep Duration"]).sum()
assert other_nulls == 0, "Oväntat: null-värden i andra kolumner!"
if fs_nulls > 0:
    print(f"  OBS: {fs_nulls} rader med '?' i Financial Stress -> sparas som NULL")
if sl_nulls > 0:
    print(f"  OBS: {sl_nulls} rader med 'Others' i Sleep Duration -> sparas som NULL")

# 7. Kolumnnamn -> camelCase
def to_camel(name):
    name = name.strip().lower()
    name = re.sub(r"[^a-z0-9]+", "_", name).strip("_")
    parts = name.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])

df.columns = [to_camel(c) for c in df.columns]
df.rename(columns={"haveYouEverHadSuicidalThoughts": "suicidalThoughts", "familyHistoryOfMentalIllness": "familyHistory", "sleepDuration": "sleepScore"}, inplace=True)

# 8. Konvertera Yes/No och 0/1 till boolean
df["suicidalThoughts"] = df["suicidalThoughts"].map({"Yes": True, "No": False})
df["familyHistory"]    = df["familyHistory"].map({"Yes": True, "No": False})
df["depression"]       = df["depression"].astype(bool)

print(f"  Kolumner: {list(df.columns)}")

# LOAD
print("Loading...")
os.makedirs("../databases/sqlite-dbs", exist_ok=True)
output_path = "../databases/sqlite-dbs/studentDepression.db"
with sqlite3.connect(output_path) as conn:
    df.to_sql("students", conn, if_exists="replace", index=False)
    count = conn.execute("SELECT COUNT(*) FROM students").fetchone()[0]

print(f"  {count} rader skrivna till studentDepression.db")
print("Klar!")