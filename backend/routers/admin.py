# =========================================================
# GURU AI JSKM
# ADMIN ROUTER
# FULL CRUD: STUDENTS, TEACHERS, SETTINGS, PROGRESS, BOOKMARKS
# =========================================================

import os
import shutil
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from backend.database.database import get_db
from backend.database.models import (
    User,
    ChatHistory,
    LearningProgress,
    Bookmark,
    QuizResult,
)
from backend.config.settings import (
    BASE_DIR,
    DATABASE_FILE,
    BACKUP_DIR,
)
MODULE_FILE_DKV = BASE_DIR / "modules" / "modul_dkv_lengkap.json"

router = APIRouter(
    prefix="/api/admin",
    tags=["Administrator"]
)


# =========================================================
# SCHEMAS
# =========================================================

class StudentCreateRequest(BaseModel):
    name: Optional[str] = ""
    nama: Optional[str] = ""
    username: str
    email: Optional[str] = ""
    password: Optional[str] = "123456"
    class_name: Optional[str] = ""
    kelas: Optional[str] = ""
    major: Optional[str] = "DKV"
    jurusan: Optional[str] = "DKV"


class TeacherCreateRequest(BaseModel):
    name: Optional[str] = ""
    nama: Optional[str] = ""
    username: str
    email: Optional[str] = ""
    nip: Optional[str] = ""
    password: Optional[str] = "guru123"
    subject: Optional[str] = "Desain Komunikasi Visual"
    mapel: Optional[str] = ""
    kelas: Optional[str] = ""
    jurusan: Optional[str] = "DKV"
    status: Optional[str] = "Aktif"


class SettingsUpdateRequest(BaseModel):
    app_name: Optional[str] = "GURU AI JSKM"
    school_name: Optional[str] = "SMK Negeri 1"
    academic_year: Optional[str] = "2026/2027"
    default_major: Optional[str] = "DKV"
    openai_api_key: Optional[str] = ""
    openai_model: Optional[str] = "gpt-5.6-luna"
    rtsp_url: Optional[str] = ""
    ezviz_serial: Optional[str] = ""
    ezviz_code: Optional[str] = ""
    voice_speed: Optional[float] = 1.0


class BookmarkCreateRequest(BaseModel):
    user_id: Optional[int] = 1
    chapter: int
    section: Optional[str] = ""
    title: str
    major: Optional[str] = "DKV"


class ProgressRecordRequest(BaseModel):
    user_id: Optional[int] = 1
    chapter: int
    section: Optional[str] = ""
    major: Optional[str] = "DKV"
    completed: Optional[bool] = True
    score: Optional[float] = 100.0


# =========================================================
# DASHBOARD
# =========================================================

@router.get("/dashboard")
async def api_dashboard(db: Session = Depends(get_db)):
    total_students = db.query(User).filter(User.role == "student").count()
    total_teachers = db.query(User).filter(User.role.in_(["teacher", "guru"])).count()
    total_chats = db.query(ChatHistory).count()
    total_quiz_results = db.query(QuizResult).count()
    total_bookmarks = db.query(Bookmark).count()

    # Hitung total materi BAB
    dkv_json = BASE_DIR / "modules" / "modul_dkv_lengkap.json"
    tkj_json = BASE_DIR / "modules" / "modul_tkj_lengkap.json"

    dkv_count = 12
    tkj_count = 12
    total_sections_dkv = 0
    total_sections_tkj = 0

    if dkv_json.exists():
        try:
            with open(dkv_json, "r", encoding="utf-8") as f:
                d = json.load(f)
                ch = d if isinstance(d, list) else d.get("chapters", [])
                dkv_count = len(ch)
                total_sections_dkv = sum(len(c.get("sections", [])) for c in ch)
        except Exception:
            pass

    if tkj_json.exists():
        try:
            with open(tkj_json, "r", encoding="utf-8") as f:
                d = json.load(f)
                ch = d if isinstance(d, list) else d.get("chapters", [])
                tkj_count = len(ch)
                total_sections_tkj = sum(len(c.get("sections", [])) for c in ch)
        except Exception:
            pass

    return {
        "success": True,
        "summary": {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_quiz_results": total_quiz_results,
            "total_chats": total_chats,
            "total_bookmarks": total_bookmarks,
            "total_dkv_chapters": dkv_count,
            "total_tkj_chapters": tkj_count,
            "total_chapters": dkv_count + tkj_count,
            "total_dkv_sections": total_sections_dkv,
            "total_tkj_sections": total_sections_tkj,
            "total_sections": total_sections_dkv + total_sections_tkj
        }
    }


# =========================================================
# ACTIVITIES
# =========================================================

@router.get("/activities")
async def api_activities(db: Session = Depends(get_db)):
    activities = []

    # Ambil hasil quiz terbaru
    quizzes = db.query(QuizResult).order_by(QuizResult.id.desc()).limit(6).all()
    for q in quizzes:
        t = q.created_at.strftime("%d/%m/%Y %H:%M") if q.created_at else "-"
        activities.append({
            "type": "quiz",
            "icon": "📝",
            "waktu": t,
            "time": t,
            "title": f"Quiz: {q.chapter_code or 'Materi'}",
            "description": f"{q.student_name or 'Siswa'} memperoleh skor {q.score or 0}/100",
            "status": "success" if (q.score or 0) >= 70 else "warning"
        })

    # Ambil siswa/guru terbaru
    users = db.query(User).order_by(User.id.desc()).limit(6).all()
    for u in users:
        t = u.created_at.strftime("%d/%m/%Y %H:%M") if u.created_at else "-"
        role_label = "Guru" if u.role in ["teacher", "guru"] else "Siswa"
        activities.append({
            "type": "user",
            "icon": "👨‍🏫" if role_label == "Guru" else "👨‍🎓",
            "waktu": t,
            "time": t,
            "title": f"{role_label} terdaftar: {u.nama}",
            "description": f"Jurusan {u.jurusan or 'DKV'} ({u.kelas or 'Reguler'})",
            "status": "info"
        })

    if not activities:
        activities = [
            {
                "type": "system",
                "icon": "✅",
                "waktu": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "time": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "title": "Sistem Guru AI Aktif",
                "description": "Server dan database pembelajaran siap digunakan.",
                "status": "success"
            }
        ]

    return {
        "success": True,
        "activities": activities,
        "data": activities
    }


# =========================================================
# STUDENTS CRUD
# =========================================================

@router.get("/students")
async def get_students(
    q: Optional[str] = Query(None),
    major: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == "student")

    if major and major != "ALL":
        query = query.filter(User.jurusan.ilike(f"%{major}%"))

    if q:
        kw = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                User.nama.ilike(kw),
                User.username.ilike(kw),
                User.email.ilike(kw),
                User.kelas.ilike(kw)
            )
        )

    students = query.order_by(User.nama.asc()).all()
    result = []

    for s in students:
        result.append({
            "id": s.id,
            "name": s.nama,
            "nama": s.nama,
            "username": s.username,
            "email": s.email or "-",
            "class_name": s.kelas or "-",
            "kelas": s.kelas or "-",
            "major": s.jurusan or "DKV",
            "jurusan": s.jurusan or "DKV",
            "active": bool(s.active),
            "created_at": s.created_at.strftime("%d/%m/%Y %H:%M") if s.created_at else "-"
        })

    return {
        "success": True,
        "students": result,
        "data": result,
        "total": len(result)
    }


@router.post("/students")
async def create_student(
    data: StudentCreateRequest,
    db: Session = Depends(get_db)
):
    nama = (data.name or data.nama or "").strip()
    username = data.username.strip()
    email = (data.email or "").strip()
    kelas = (data.class_name or data.kelas or "").strip()
    jurusan = (data.major or data.jurusan or "DKV").strip().upper()
    password = (data.password or "123456").strip()

    if not nama:
        raise HTTPException(status_code=400, detail="Nama siswa wajib diisi.")
    if not username:
        raise HTTPException(status_code=400, detail="Username siswa wajib diisi.")

    # Cek duplikat username
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Username '{username}' sudah digunakan.")

    new_student = User(
        nama=nama,
        username=username,
        email=email,
        password=password,
        role="student",
        kelas=kelas,
        jurusan=jurusan,
        active=True
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return {
        "success": True,
        "message": f"Siswa '{nama}' berhasil ditambahkan.",
        "student": {
            "id": new_student.id,
            "name": new_student.nama,
            "username": new_student.username,
            "email": new_student.email,
            "class_name": new_student.kelas,
            "major": new_student.jurusan
        }
    }


@router.delete("/students/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Data siswa tidak ditemukan.")

    db.delete(student)
    db.commit()

    return {
        "success": True,
        "message": "Data siswa berhasil dihapus."
    }


# =========================================================
# TEACHERS CRUD
# =========================================================

@router.get("/teachers")
async def get_teachers(
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role.in_(["teacher", "guru"]))

    if q:
        kw = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                User.nama.ilike(kw),
                User.username.ilike(kw),
                User.email.ilike(kw),
                User.nip.ilike(kw),
                User.jurusan.ilike(kw)
            )
        )

    teachers = query.order_by(User.nama.asc()).all()
    teacher_list = []
    active_count = 0
    dkv_count = 0
    mapel_set = set()

    for t in teachers:
        status_label = "Aktif" if t.active else "Nonaktif"
        if t.active:
            active_count += 1
        if (t.jurusan or "").upper() == "DKV":
            dkv_count += 1

        mapel = t.kelas or t.jurusan or "DKV"
        mapel_set.add(mapel)

        teacher_list.append({
            "id": t.id,
            "name": t.nama,
            "nama": t.nama,
            "username": t.username,
            "email": t.email or "-",
            "nip": t.nip or "-",
            "subject": mapel,
            "mapel": mapel,
            "status": status_label,
            "active": bool(t.active),
            "created_at": t.created_at.strftime("%d/%m/%Y %H:%M") if t.created_at else "-",
            "tanggal_daftar": t.created_at.strftime("%d/%m/%Y") if t.created_at else "-"
        })

    return {
        "success": True,
        "teachers": teacher_list,
        "data": teacher_list,
        "total": len(teacher_list),
        "statistics": {
            "total_guru": len(teacher_list),
            "guru_aktif": active_count,
            "guru_dkv": dkv_count,
            "total_mapel": len(mapel_set) if mapel_set else 1
        }
    }


@router.post("/teachers")
async def create_teacher(
    data: TeacherCreateRequest,
    db: Session = Depends(get_db)
):
    nama = (data.name or data.nama or "").strip()
    username = data.username.strip()
    email = (data.email or "").strip()
    nip = (data.nip or "").strip()
    subject = (data.subject or data.mapel or "Desain Komunikasi Visual").strip()
    jurusan = (data.jurusan or "DKV").strip().upper()
    password = (data.password or "guru123").strip()
    is_active = (data.status or "Aktif").lower() in ["aktif", "active", "1", "true"]

    if not nama:
        raise HTTPException(status_code=400, detail="Nama guru wajib diisi.")
    if not username:
        raise HTTPException(status_code=400, detail="Username guru wajib diisi.")

    existing = db.query(User).filter(User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Username '{username}' sudah digunakan.")

    new_teacher = User(
        nama=nama,
        username=username,
        email=email,
        nip=nip,
        password=password,
        role="teacher",
        kelas=subject,
        jurusan=jurusan,
        active=is_active
    )
    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)

    return {
        "success": True,
        "message": f"Guru '{nama}' berhasil ditambahkan.",
        "teacher": {
            "id": new_teacher.id,
            "name": new_teacher.nama,
            "username": new_teacher.username,
            "email": new_teacher.email,
            "nip": new_teacher.nip,
            "mapel": new_teacher.kelas
        }
    }


@router.delete("/teachers/{teacher_id}")
async def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db)
):
    teacher = db.query(User).filter(User.id == teacher_id, User.role.in_(["teacher", "guru"])).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Data guru tidak ditemukan.")

    db.delete(teacher)
    db.commit()

    return {
        "success": True,
        "message": "Data guru berhasil dihapus."
    }


# =========================================================
# SETTINGS API
# =========================================================

SETTINGS_FILE = BASE_DIR / "backend" / "app_settings.json"


def read_system_settings() -> Dict[str, Any]:
    defaults = {
        "app_name": "GURU AI JSKM",
        "school_name": "SMK GURU AI INDONESIA",
        "academic_year": "2026/2027",
        "default_major": "DKV",
        "openai_model": os.getenv("OPENAI_MODEL", "gpt-5.6-luna"),
        "openai_api_key": os.getenv("OPENAI_API_KEY", ""),
        "rtsp_url": "rtsp://admin:EBWPAC@192.168.10.145:554/ch1/main",
        "ezviz_serial": "BD7424262",
        "ezviz_code": "ebwpac",
        "voice_speed": 1.0,
        "system_prompt": "Kamu adalah Guru AI DKV dan TKJ ramah, interaktif, dan mendalam."
    }

    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                defaults.update(saved)
        except Exception:
            pass

    # Read camera config if exists
    cam_file = BASE_DIR / "backend" / "camera_config.json"
    if cam_file.exists():
        try:
            with open(cam_file, "r", encoding="utf-8") as f:
                c = json.load(f)
                if c.get("rtsp_url"):
                    defaults["rtsp_url"] = c["rtsp_url"]
        except Exception:
            pass

    # Read ezviz config if exists
    ezviz_file = BASE_DIR / "backend" / "ezviz_talkback_config.json"
    if ezviz_file.exists():
        try:
            with open(ezviz_file, "r", encoding="utf-8") as f:
                ez = json.load(f)
                if ez.get("device_serial"):
                    defaults["ezviz_serial"] = ez["device_serial"]
                if ez.get("verification_code"):
                    defaults["ezviz_code"] = ez["verification_code"]
        except Exception:
            pass

    return defaults


@router.get("/settings")
async def get_settings():
    settings = read_system_settings()

    # Mask API key for security
    api_key = settings.get("openai_api_key", "")
    masked_key = ""
    if api_key:
        if len(api_key) > 10:
            masked_key = api_key[:7] + "..." + api_key[-4:]
        else:
            masked_key = "********"

    return {
        "success": True,
        "settings": settings,
        "masked_api_key": masked_key,
        "database_file": str(DATABASE_FILE),
        "database_size": os.path.getsize(DATABASE_FILE) if DATABASE_FILE.exists() else 0,
        "status": {
            "openai_connected": bool(api_key),
            "database_ready": DATABASE_FILE.exists(),
            "camera_configured": bool(settings.get("rtsp_url"))
        }
    }


@router.post("/settings")
async def save_settings(data: SettingsUpdateRequest):
    current = read_system_settings()

    if data.app_name:
        current["app_name"] = data.app_name
    if data.school_name:
        current["school_name"] = data.school_name
    if data.academic_year:
        current["academic_year"] = data.academic_year
    if data.default_major:
        current["default_major"] = data.default_major.upper()
    if data.openai_model:
        current["openai_model"] = data.openai_model
    if data.openai_api_key and not data.openai_api_key.startswith("sk-..."):
        current["openai_api_key"] = data.openai_api_key.strip()
    if data.rtsp_url:
        current["rtsp_url"] = data.rtsp_url.strip()
    if data.ezviz_serial:
        current["ezviz_serial"] = data.ezviz_serial.strip()
    if data.ezviz_code:
        current["ezviz_code"] = data.ezviz_code.strip()
    if data.voice_speed:
        current["voice_speed"] = data.voice_speed

    # Save to app_settings.json
    try:
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(current, f, indent=4)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan file pengaturan: {e}")

    # Also sync .env safely preserving other variables like DATABASE_URL
    env_file = BASE_DIR / ".env"
    try:
        env_lines = []
        existing_keys = set()
        if env_file.exists():
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    stripped = line.strip()
                    if stripped.startswith("OPENAI_API_KEY="):
                        env_lines.append(f"OPENAI_API_KEY={current.get('openai_api_key', '')}\n")
                        existing_keys.add("OPENAI_API_KEY")
                    elif stripped.startswith("OPENAI_MODEL="):
                        env_lines.append(f"OPENAI_MODEL={current.get('openai_model', 'gpt-5.6-luna')}\n")
                        existing_keys.add("OPENAI_MODEL")
                    else:
                        env_lines.append(line)
        if "OPENAI_API_KEY" not in existing_keys:
            env_lines.append(f"OPENAI_API_KEY={current.get('openai_api_key', '')}\n")
        if "OPENAI_MODEL" not in existing_keys:
            env_lines.append(f"OPENAI_MODEL={current.get('openai_model', 'gpt-5.6-luna')}\n")
        with open(env_file, "w", encoding="utf-8") as f:
            f.writelines(env_lines)
    except Exception:
        pass

    # Sync camera_config.json
    cam_file = BASE_DIR / "backend" / "camera_config.json"
    try:
        cam_data = {
            "camera_name": "Kamera Kelas",
            "camera_location": "Ruang Kelas",
            "rtsp_url": current.get("rtsp_url", ""),
            "speaker_mode": "ipcam",
            "speaker_api_url": ""
        }
        with open(cam_file, "w", encoding="utf-8") as f:
            json.dump(cam_data, f, indent=4)
    except Exception:
        pass

    # Sync ezviz_talkback_config.json
    ez_file = BASE_DIR / "backend" / "ezviz_talkback_config.json"
    try:
        ez_data = {
            "device_serial": current.get("ezviz_serial", ""),
            "verification_code": current.get("ezviz_code", ""),
            "camera_no": 1,
            "talkback_mode": "pc",
            "bridge_path": "jskm"
        }
        with open(ez_file, "w", encoding="utf-8") as f:
            json.dump(ez_data, f, indent=4)
    except Exception:
        pass

    return {
        "success": True,
        "message": "Pengaturan berhasil diperbarui dan disinkronkan ke seluruh modul.",
        "settings": current
    }


@router.post("/system/backup")
async def backup_database():
    if not DATABASE_FILE.exists():
        raise HTTPException(status_code=404, detail="File database tidak ditemukan.")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"eguru_backup_{timestamp}.db"

    try:
        shutil.copy2(DATABASE_FILE, backup_file)
        return {
            "success": True,
            "message": f"Backup database berhasil dibuat: {backup_file.name}",
            "filename": backup_file.name,
            "size": os.path.getsize(backup_file),
            "timestamp": timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan backup: {e}")


# =========================================================
# BOOKMARKS API
# =========================================================

@router.get("/bookmarks")
async def get_bookmarks(
    major: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Bookmark)
    if major and major != "ALL":
        query = query.filter(Bookmark.major == major.upper())

    bookmarks = query.order_by(Bookmark.id.desc()).all()
    result = []

    for b in bookmarks:
        result.append({
            "id": b.id,
            "chapter": b.chapter,
            "section": b.section or "-",
            "title": b.title,
            "major": getattr(b, "major", "DKV") or "DKV",
            "created_at": b.created_at.strftime("%d/%m/%Y %H:%M") if b.created_at else "-",
            "target_url": f"/admin/modules/{b.chapter}?major={getattr(b, 'major', 'DKV') or 'DKV'}"
        })

    return {
        "success": True,
        "bookmarks": result,
        "data": result,
        "total": len(result),
        "total_dkv": sum(1 for b in result if b["major"] == "DKV"),
        "total_tkj": sum(1 for b in result if b["major"] == "TKJ")
    }


@router.post("/bookmarks")
async def add_bookmark(
    data: BookmarkCreateRequest,
    db: Session = Depends(get_db)
):
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Judul bookmark wajib diisi.")

    major = (data.major or "DKV").upper()

    # Cek duplikat
    existing = db.query(Bookmark).filter(
        Bookmark.chapter == data.chapter,
        Bookmark.title == title,
        Bookmark.major == major
    ).first()

    if existing:
        return {
            "success": True,
            "message": "Materi sudah ada di bookmark.",
            "bookmark_id": existing.id
        }

    bookmark = Bookmark(
        user_id=data.user_id or 1,
        chapter=data.chapter,
        section=data.section or f"BAB {data.chapter}",
        title=title,
        major=major
    )
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)

    return {
        "success": True,
        "message": f"Materi '{title}' berhasil disimpan ke bookmark.",
        "bookmark": {
            "id": bookmark.id,
            "chapter": bookmark.chapter,
            "section": bookmark.section,
            "title": bookmark.title,
            "major": bookmark.major
        }
    }


@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db)
):
    b = db.query(Bookmark).filter(Bookmark.id == bookmark_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bookmark tidak ditemukan.")

    db.delete(b)
    db.commit()

    return {
        "success": True,
        "message": "Bookmark berhasil dihapus."
    }


# =========================================================
# PROGRESS API
# =========================================================

@router.get("/progress")
async def get_learning_progress(
    major: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    total_students = db.query(User).filter(User.role == "student").count()
    students = db.query(User).filter(User.role == "student").all()
    quiz_results = db.query(QuizResult).all()

    # Hitung rata-rata nilai quiz
    avg_score = 0
    if quiz_results:
        avg_score = round(sum(q.score or 0 for q in quiz_results) / len(quiz_results), 1)

    # Progres per siswa
    student_progress_list = []
    for s in students:
        s_quizzes = [q for q in quiz_results if q.student_id == s.id or (q.student_name and q.student_name.lower() == s.nama.lower())]
        s_score = round(sum(q.score or 0 for q in s_quizzes) / len(s_quizzes), 1) if s_quizzes else 0

        # Ambil progress materi
        read_count = db.query(LearningProgress).filter(
            LearningProgress.user_id == s.id,
            LearningProgress.completed == True
        ).count()

        total_target_chapters = 12
        pct = min(100, int((read_count / total_target_chapters) * 100)) if total_target_chapters else 0
        if s_quizzes and pct < 20:
            pct = min(100, len(s_quizzes) * 20)

        student_progress_list.append({
            "student_id": s.id,
            "name": s.nama,
            "username": s.username,
            "kelas": s.kelas or "-",
            "jurusan": s.jurusan or "DKV",
            "quiz_completed": len(s_quizzes),
            "average_score": s_score,
            "material_completed": read_count,
            "progress_percent": pct,
            "status": "Tuntas" if pct >= 75 else ("Sedang Belajar" if pct >= 25 else "Baru Memulai")
        })

    # Progres bab DKV (BAB 1 - 12)
    dkv_chapter_stats = []
    for ch in range(1, 13):
        ch_quizzes = [q for q in quiz_results if q.chapter_number == ch and "TKJ" not in (q.chapter_code or "").upper()]
        comp_count = db.query(LearningProgress).filter(
            LearningProgress.chapter == ch,
            LearningProgress.major == "DKV",
            LearningProgress.completed == True
        ).count()

        pct = min(100, int((max(comp_count, len(ch_quizzes)) / max(total_students, 1)) * 100))
        dkv_chapter_stats.append({
            "chapter": ch,
            "major": "DKV",
            "code": f"DKV-BAB{ch}",
            "completed_by": max(comp_count, len(ch_quizzes)),
            "percent": pct
        })

    # Progres bab TKJ (BAB 1 - 12)
    tkj_chapter_stats = []
    for ch in range(1, 13):
        ch_quizzes = [q for q in quiz_results if q.chapter_number == ch and "TKJ" in (q.chapter_code or "").upper()]
        comp_count = db.query(LearningProgress).filter(
            LearningProgress.chapter == ch,
            LearningProgress.major == "TKJ",
            LearningProgress.completed == True
        ).count()

        pct = min(100, int((max(comp_count, len(ch_quizzes)) / max(total_students, 1)) * 100))
        tkj_chapter_stats.append({
            "chapter": ch,
            "major": "TKJ",
            "code": f"TKJ-BAB{ch}",
            "completed_by": max(comp_count, len(ch_quizzes)),
            "percent": pct
        })

    overall_pct = 0
    if student_progress_list:
        overall_pct = int(sum(sp["progress_percent"] for sp in student_progress_list) / len(student_progress_list))

    return {
        "success": True,
        "summary": {
            "total_students": total_students,
            "total_quiz_submissions": len(quiz_results),
            "average_score": avg_score,
            "overall_completion_rate": overall_pct,
            "dkv_chapters_total": 12,
            "tkj_chapters_total": 12
        },
        "students_progress": student_progress_list,
        "dkv_chapters": dkv_chapter_stats,
        "tkj_chapters": tkj_chapter_stats
    }


@router.post("/progress/record")
async def record_progress(
    data: ProgressRecordRequest,
    db: Session = Depends(get_db)
):
    major = (data.major or "DKV").upper()
    existing = db.query(LearningProgress).filter(
        LearningProgress.user_id == (data.user_id or 1),
        LearningProgress.chapter == data.chapter,
        LearningProgress.major == major
    ).first()

    if existing:
        existing.completed = True
        existing.last_access = datetime.utcnow()
        if data.score:
            existing.score = data.score
    else:
        new_lp = LearningProgress(
            user_id=data.user_id or 1,
            chapter=data.chapter,
            section=data.section or f"BAB {data.chapter}",
            major=major,
            completed=True,
            score=data.score or 100.0,
            last_access=datetime.utcnow()
        )
        db.add(new_lp)

    db.commit()

    return {
        "success": True,
        "message": f"Progress BAB {data.chapter} ({major}) berhasil dicatat."
    }