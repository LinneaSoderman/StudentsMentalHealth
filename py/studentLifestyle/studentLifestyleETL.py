import pandas as pd
import numpy as np
import sqlite3
import re
import os

# EXTRACT
print("Extracting...")
df = pd.read_csv("student_lifestyle.csv")
print(f"  {len(df)} rows, {len(df.columns)} columns")


#Inga saknade värden (0 nulls i alla kolumner)
# Inga duplicerade rader eller duplicerade Student_ID
# CGPA håller sig korrekt inom 0–4
# Gender och Department har inga stavfel eller okategoriserade värden
# Age ligger rimligt inom 18–24 år

# TRANSFORM
print("Transforming...")


# Ta bort kolumner
df = df.drop(columns=['Social_Media_Hours', 'Department', 'Stress_Level', 'Physical_Activity'])
 
# Byt namn till camelCase
df = df.rename(columns={
    'Student_ID':     'studentId',
    'Age':            'age',
    'Gender':         'gender',
    'CGPA':           'cgpa',
    'Sleep_Duration': 'sleepDuration',
    'Study_Hours':    'studyHours',
    'Depression':     'depression',
})
 
# Mappa om sleepDuration till kategori 1-4
def map_sleep(hours):
    if hours < 5:
        return 1
    elif hours <= 6:
        return 2
    elif hours <= 8:
        return 3
    else:
        return 4
 
df['sleepDuration'] = df['sleepDuration'].apply(map_sleep)
 
# LOAD
print("Loading...")
os.makedirs("../../databases/sqlite-dbs", exist_ok=True)
output_path = "../../databases/sqlite-dbs/studentLifestyle.db"
with sqlite3.connect(output_path) as conn:
    df.to_sql("students", conn, if_exists="replace", index=False)
    df.to_sql("studentLifestyle", conn, if_exists="replace", index=False)
    count = len(df)

print(f"  {count} rader skrivna till studentLifestyle.db")
print("Klar!")

