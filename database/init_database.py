# =========================================================
# GURU AI JSKM - DATABASE INITIALIZER
# FILE: database/init_database.py
# Membuat & menginisialisasi database SQLite BERSIH
# Hanya berisi skema tabel dan akun default Administrator
# =========================================================

import os
import sys
import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

DATABASE_FILE = BASE_DIR / "database" / "eguru.db"
SQL_DUMP_FILE = BASE_DIR / "database" / "schema.sql"

def init_clean_database():
    print(f"[*] Inisialisasi Database Bersih: {DATABASE_FILE}")
    os.makedirs(DATABASE_FILE.parent, exist_ok=True)

    con = sqlite3.connect(DATABASE_FILE)
    cur = con.cursor()

    # 1. CREATE TABLES
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama VARCHAR(150) NOT NULL,
        username VARCHAR(100) UNIQUE,
        email VARCHAR(150),
        nip VARCHAR(60),
        password VARCHAR(255),
        role VARCHAR(30) DEFAULT 'student',
        kelas VARCHAR(30),
        jurusan VARCHAR(50) DEFAULT 'DKV',
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS learning_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        major VARCHAR(30) DEFAULT 'DKV',
        chapter INTEGER,
        section VARCHAR(60),
        completed BOOLEAN DEFAULT 0,
        score FLOAT DEFAULT 0,
        last_access DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        question TEXT,
        answer TEXT,
        chapter INTEGER,
        section VARCHAR(30),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        major VARCHAR(30) DEFAULT 'DKV',
        chapter INTEGER,
        section VARCHAR(60),
        title VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS quiz_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        student_name VARCHAR(150),
        chapter_number INTEGER NOT NULL DEFAULT 0,
        chapter_code VARCHAR(50),
        chapter_title VARCHAR(255),
        quiz_mode VARCHAR(50) NOT NULL DEFAULT 'practice',
        total_questions INTEGER NOT NULL DEFAULT 0,
        correct_answers INTEGER NOT NULL DEFAULT 0,
        wrong_answers INTEGER NOT NULL DEFAULT 0,
        score FLOAT NOT NULL DEFAULT 0,
        answers_json TEXT,
        questions_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users (id)
    );
    """)

    print("[+] Tabel users, learning_progress, chat_history, bookmarks, quiz_results siap.")

    # 2. HAPUS DATA DUMMY JIKA ADA
    cur.execute("DELETE FROM quiz_results;")
    cur.execute("DELETE FROM learning_progress;")
    cur.execute("DELETE FROM chat_history;")
    cur.execute("DELETE FROM bookmarks;")
    cur.execute("DELETE FROM users WHERE username != 'admin';")

    # 3. PASTIKAN HANYA ADA 1 AKUN DEFAULT ADMINISTRATOR
    admin = cur.execute("SELECT id FROM users WHERE username = 'admin';").fetchone()
    if not admin:
        cur.execute("""
            INSERT INTO users (id, nama, username, email, nip, password, role, kelas, jurusan, active)
            VALUES (1, 'Administrator', 'admin', 'admin@smk.sch.id', NULL, 'admin123', 'admin', '-', 'DKV', 1);
        """)
        print("[+] Akun default Administrator dibuat (admin / admin123).")
    else:
        print("[+] Akun default Administrator sudah ada.")

    con.commit()

    # 4. EXPORT TO CLEAN SQL DUMP FILE
    print(f"[*] Mengekspor skema bersih ke {SQL_DUMP_FILE}...")
    with open(SQL_DUMP_FILE, "w", encoding="utf-8") as f:
        f.write("-- =========================================================\n")
        f.write("-- GURU AI JSKM CLEAN DATABASE DUMP / SCHEMA\n")
        f.write(f"-- Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-- =========================================================\n\n")
        for line in con.iterdump():
            f.write(f"{line}\n")

    con.close()
    print("[SUCCESS] Database bersih 100% tanpa data dummy!")

if __name__ == "__main__":
    init_clean_database()
