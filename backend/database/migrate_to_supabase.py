# =========================================================
# GURU AI JSKM - SUPABASE MIGRATION SCRIPT
# File: backend/database/migrate_to_supabase.py
# Migrasi data dari SQLite lokal ke Supabase PostgreSQL
# =========================================================

import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Setup path agar bisa import backend
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
load_dotenv(ROOT_DIR / ".env")

from backend.config.settings import DATABASE_FILE
from backend.database import models
from backend.database.models import (
    Base,
    User,
    LearningProgress,
    ChatHistory,
    Bookmark,
    QuizResult,
)

def run_migration():
    print("=" * 60)
    print("🚀 GURU AI JSKM - MIGRASI DATABASE KE SUPABASE")
    print("=" * 60)

    # 1. Cek DATABASE_URL Supabase
    supabase_url = os.getenv("DATABASE_URL", "").strip()
    if not supabase_url:
        print("\n❌ ERROR: Variabel 'DATABASE_URL' belum ditemukan di file .env!")
        print("\nSilakan tambahkan connection string Supabase Anda ke file .env:")
        print("DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres")
        print("\nAtau langsung masukkan connection string di prompt terminal:")
        supabase_url = input("\nMasukkan Supabase DATABASE_URL (tekan Enter untuk batal): ").strip()
        if not supabase_url:
            print("Migrasi dibatalkan.")
            return False

    if supabase_url.startswith("postgres://"):
        supabase_url = supabase_url.replace("postgres://", "postgresql://", 1)

    print(f"\n📡 Menghubungkan ke Supabase...")
    try:
        supabase_engine = create_engine(supabase_url, pool_pre_ping=True)
        # Test koneksi
        with supabase_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Berhasil terhubung ke Supabase PostgreSQL!")
    except Exception as err:
        print(f"❌ Gagal koneksi ke Supabase: {err}")
        return False

    # 2. Buat tabel di Supabase jika belum ada
    print("\n🔨 Menyiapkan tabel di Supabase...")
    Base.metadata.create_all(bind=supabase_engine)
    print("✅ Semua tabel berhasil diverifikasi/dibuat di Supabase!")

    # 3. Hubungkan ke SQLite lokal
    sqlite_url = f"sqlite:///{DATABASE_FILE}"
    print(f"\n📂 Membaca data lokal dari SQLite ({DATABASE_FILE.name})...")
    sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    
    SqliteSession = sessionmaker(bind=sqlite_engine)
    SupabaseSession = sessionmaker(bind=supabase_engine)

    sqlite_db = SqliteSession()
    supabase_db = SupabaseSession()

    try:
        # Migrasi Users
        users = sqlite_db.query(User).all()
        print(f"-> Ditemukan {len(users)} data Users di lokal.")
        migrated_users = 0
        for u in users:
            existing = supabase_db.query(User).filter(User.username == u.username).first()
            if not existing:
                new_u = User(
                    nama=u.nama,
                    username=u.username,
                    email=u.email,
                    nip=u.nip,
                    password=u.password,
                    role=u.role,
                    kelas=u.kelas,
                    jurusan=u.jurusan,
                    active=u.active,
                    created_at=u.created_at
                )
                supabase_db.add(new_u)
                migrated_users += 1
        supabase_db.commit()
        print(f"   ✅ {migrated_users} data Users baru berhasil disalin ke Supabase.")

        # Migrasi Bookmarks
        bookmarks = sqlite_db.query(Bookmark).all()
        print(f"-> Ditemukan {len(bookmarks)} data Bookmarks di lokal.")
        migrated_bookmarks = 0
        for b in bookmarks:
            new_b = Bookmark(
                user_id=b.user_id,
                major=b.major,
                chapter=b.chapter,
                section=b.section,
                title=b.title,
                created_at=b.created_at
            )
            supabase_db.add(new_b)
            migrated_bookmarks += 1
        supabase_db.commit()
        print(f"   ✅ {migrated_bookmarks} data Bookmarks berhasil disalin ke Supabase.")

        # Migrasi Progress
        progresses = sqlite_db.query(LearningProgress).all()
        print(f"-> Ditemukan {len(progresses)} data LearningProgress di lokal.")
        migrated_prog = 0
        for p in progresses:
            new_p = LearningProgress(
                user_id=p.user_id,
                major=p.major,
                chapter=p.chapter,
                section=p.section,
                completed=p.completed,
                score=p.score,
                last_access=p.last_access
            )
            supabase_db.add(new_p)
            migrated_prog += 1
        supabase_db.commit()
        print(f"   ✅ {migrated_prog} data LearningProgress berhasil disalin ke Supabase.")

        # Migrasi Quiz Results
        quiz_res = sqlite_db.query(QuizResult).all()
        print(f"-> Ditemukan {len(quiz_res)} data QuizResult di lokal.")
        migrated_quiz = 0
        for q in quiz_res:
            new_q = QuizResult(
                student_id=q.student_id,
                student_name=q.student_name,
                chapter_number=q.chapter_number,
                chapter_code=q.chapter_code,
                chapter_title=q.chapter_title,
                quiz_mode=q.quiz_mode,
                total_questions=q.total_questions,
                correct_answers=q.correct_answers,
                wrong_answers=q.wrong_answers,
                score=q.score,
                answers_json=q.answers_json,
                questions_json=q.questions_json,
                created_at=q.created_at
            )
            supabase_db.add(new_q)
            migrated_quiz += 1
        supabase_db.commit()
        print(f"   ✅ {migrated_quiz} data QuizResult berhasil disalin ke Supabase.")

        # Migrasi Chat History
        chats = sqlite_db.query(ChatHistory).all()
        print(f"-> Ditemukan {len(chats)} data ChatHistory di lokal.")
        migrated_chats = 0
        for c in chats:
            new_c = ChatHistory(
                user_id=c.user_id,
                question=c.question,
                answer=c.answer,
                chapter=c.chapter,
                section=c.section,
                created_at=c.created_at
            )
            supabase_db.add(new_c)
            migrated_chats += 1
        supabase_db.commit()
        print(f"   ✅ {migrated_chats} data ChatHistory berhasil disalin ke Supabase.")

        print("\n" + "=" * 60)
        print("🎉 SEMUA DATA BERHASIL DIMIGRASIKAN KE SUPABASE!")
        print("=" * 60)
        return True

    except Exception as e:
        supabase_db.rollback()
        print(f"\n❌ Terjadi kesalahan saat migrasi data: {e}")
        return False
    finally:
        sqlite_db.close()
        supabase_db.close()

if __name__ == "__main__":
    run_migration()
