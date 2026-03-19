import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "..", "databases", "sqlite-dbs", "studentDepression.db")

with sqlite3.connect(db_path) as conn:
    result = conn.execute("SELECT * FROM students LIMIT 5").fetchall()
    print(result)