import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base

from backend.config.settings import DATABASE_FILE
from dotenv import load_dotenv

load_dotenv()

# ==========================================================
# DATABASE URL (Support Online Cloud DB & Local SQLite)
# ==========================================================

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if not DATABASE_URL:
    DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

# Auto-fix postgres:// -> postgresql:// untuk penyedia cloud (Supabase, Neon, Render, Railway)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# ==========================================================
# ENGINE
# ==========================================================

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False
)

# ==========================================================
# SESSION
# ==========================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ==========================================================
# BASE MODEL
# ==========================================================

Base = declarative_base()

# ==========================================================
# DEPENDENCY
# ==========================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()