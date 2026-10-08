from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship

from datetime import datetime

from backend.database.database import Base


# ==========================================================
# USER
# ==========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    nama = Column(String(150), nullable=False)

    username = Column(String(100), unique=True)

    email = Column(String(150), nullable=True)

    nip = Column(String(60), nullable=True)

    password = Column(String(255))

    role = Column(String(30), default="student")

    kelas = Column(String(30))

    jurusan = Column(String(50), default="DKV")

    active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    progress = relationship("LearningProgress", back_populates="user")

    chats = relationship("ChatHistory", back_populates="user")

    bookmarks = relationship("Bookmark", back_populates="user")


# ==========================================================
# LEARNING PROGRESS
# ==========================================================

class LearningProgress(Base):

    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    major = Column(String(30), default="DKV")

    chapter = Column(Integer)

    section = Column(String(60))

    completed = Column(Boolean, default=False)

    score = Column(Float, default=0)

    last_access = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")


# ==========================================================
# CHAT HISTORY
# ==========================================================

class ChatHistory(Base):

    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    question = Column(Text)

    answer = Column(Text)

    chapter = Column(Integer)

    section = Column(String(30))

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chats")


# ==========================================================
# BOOKMARK
# ==========================================================

class Bookmark(Base):

    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    major = Column(String(30), default="DKV")

    chapter = Column(Integer)

    section = Column(String(60))

    title = Column(String(255))

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookmarks")


# ==========================================================
# QUIZ RESULT
# ==========================================================

# =========================================================
# QUIZ RESULT MODEL
# FILE 12.5 FIX
# HASIL QUIZ / EVALUASI SISWA
# =========================================================

class QuizResult(Base):

    __tablename__ = "quiz_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    student_name = Column(
        String(150),
        nullable=True
    )

    chapter_number = Column(
        Integer,
        nullable=False,
        default=0
    )

    chapter_code = Column(
        String(50),
        nullable=True
    )

    chapter_title = Column(
        String(255),
        nullable=True
    )

    quiz_mode = Column(
        String(50),
        nullable=False,
        default="practice"
    )

    total_questions = Column(
        Integer,
        nullable=False,
        default=0
    )

    correct_answers = Column(
        Integer,
        nullable=False,
        default=0
    )

    wrong_answers = Column(
        Integer,
        nullable=False,
        default=0
    )

    score = Column(
        Float,
        nullable=False,
        default=0
    )

    answers_json = Column(
        Text,
        nullable=True
    )

    questions_json = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

