from pathlib import Path
import os
from dotenv import load_dotenv

# ==========================================================
# LOAD ENV
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / ".env")

# ==========================================================
# PROJECT
# ==========================================================

PROJECT_NAME = "GURU AI JSKM"

VERSION = "1.0.0"

DEBUG = True

# ==========================================================
# OPENAI
# ==========================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# ==========================================================
# PATH
# ==========================================================

FRONTEND_DIR = BASE_DIR / "frontend"

ASSET_DIR = FRONTEND_DIR / "assets"

PAGES_DIR = FRONTEND_DIR / "pages"

MODULE_DIR = BASE_DIR / "modules"

MODULE_FILE = MODULE_DIR / "modul_dkv_lengkap.json"

DATABASE_DIR = BASE_DIR / "database"

DATABASE_FILE = DATABASE_DIR / "eguru.db"

UPLOAD_DIR = BASE_DIR / "uploads"

BACKUP_DIR = BASE_DIR / "backup"

TEMP_DIR = BASE_DIR / "temp"

LOG_DIR = BASE_DIR / "logs"

DOC_DIR = BASE_DIR / "docs"

# ==========================================================
# AUTO CREATE DIRECTORY
# ==========================================================

DIRECTORIES = [

    DATABASE_DIR,

    UPLOAD_DIR,

    BACKUP_DIR,

    TEMP_DIR,

    LOG_DIR,

    DOC_DIR

]

for directory in DIRECTORIES:

    directory.mkdir(parents=True, exist_ok=True)

# ==========================================================
# SYSTEM PROMPT
# ==========================================================

SYSTEM_PROMPT = """
Kamu adalah Guru AI DKV.

Tugasmu adalah:

1. Mengajar siswa SMK jurusan Desain Komunikasi Visual.

2. Jawaban harus sesuai materi modul.

3. Bila materi tidak ada di modul,
tetap jawab menggunakan pengetahuan profesional
tetapi jelaskan bahwa jawaban berasal dari pengetahuan umum.

4. Gunakan Bahasa Indonesia.

5. Berikan contoh.

6. Berikan tips.

7. Jangan menjawab terlalu singkat.

8. Jawaban mudah dipahami siswa SMK.

"""