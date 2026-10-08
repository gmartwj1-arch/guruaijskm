-- =========================================================
-- GURU AI JSKM - SUPABASE POSTGRESQL SCHEMA
-- File: database/supabase_schema.sql
-- Siap di-copy & paste langsung ke Supabase SQL Editor
-- =========================================================

-- 1. TABEL USERS (Pengguna / Guru / Siswa / Admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(150),
    nip VARCHAR(60),
    password VARCHAR(255),
    role VARCHAR(30) DEFAULT 'student',
    kelas VARCHAR(30),
    jurusan VARCHAR(50) DEFAULT 'DKV',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL LEARNING PROGRESS (Progres Belajar Siswa)
CREATE TABLE IF NOT EXISTS learning_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    major VARCHAR(30) DEFAULT 'DKV',
    chapter INTEGER,
    section VARCHAR(60),
    completed BOOLEAN DEFAULT FALSE,
    score DOUBLE PRECISION DEFAULT 0,
    last_access TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL CHAT HISTORY (Riwayat Percakapan AI)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    question TEXT,
    answer TEXT,
    chapter INTEGER,
    section VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL BOOKMARKS (Materi Disimpan)
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    major VARCHAR(30) DEFAULT 'DKV',
    chapter INTEGER,
    section VARCHAR(60),
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL QUIZ RESULTS (Hasil Evaluasi / Nilai Ujian Siswa)
CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    student_name VARCHAR(150),
    chapter_number INTEGER NOT NULL DEFAULT 0,
    chapter_code VARCHAR(50),
    chapter_title VARCHAR(255),
    quiz_mode VARCHAR(50) NOT NULL DEFAULT 'practice',
    total_questions INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    answers_json TEXT,
    questions_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INDEXES UNTUK PERFORMA QUERY
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results (student_id);

-- 7. DEFAULT ADMINISTRATOR ACCOUNT
INSERT INTO users (nama, username, email, password, role, kelas, jurusan, active)
VALUES ('Administrator', 'admin', 'admin@smk.sch.id', 'admin123', 'admin', '-', 'DKV', TRUE)
ON CONFLICT (username) DO NOTHING;
