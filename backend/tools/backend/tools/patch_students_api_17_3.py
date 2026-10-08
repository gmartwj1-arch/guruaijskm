# =========================================================
# GURU AI JSKM
# FILE 17.3C
# PATCH DATA SISWA API KE backend/app.py
# =========================================================

from pathlib import Path
from datetime import datetime
import shutil


BASE_DIR = Path(__file__).resolve().parents[2]
APP_FILE = BASE_DIR / "backend" / "app.py"
BACKUP_DIR = BASE_DIR / "backend" / "backup"

MARKER_START = "# =========================================================\n# DATA SISWA API\n# FILE 17.3\n# AKTIFKAN MENU DATA SISWA\n# ========================================================="
MARKER_END = "# =========================================================\n# END DATA SISWA API FILE 17.3\n# ========================================================="

API_BLOCK = r'''# =========================================================
# DATA SISWA API
# FILE 17.3
# AKTIFKAN MENU DATA SISWA
# =========================================================

class StudentCreateRequest(BaseModel):
    name: str
    username: str = ""
    email: str = ""
    password: str = "123456"
    class_name: str = ""
    major: str = "DKV"


@app.get("/api/admin/students")
async def api_admin_students():
    db = SessionLocal()

    try:
        students = []

        try:
            users = (
                db.query(User)
                .filter(User.role == "student")
                .order_by(User.id.desc())
                .all()
            )
        except Exception:
            users = []

        for user in users:
            students.append(
                {
                    "id": getattr(user, "id", None),
                    "name": (
                        getattr(user, "name", None)
                        or getattr(user, "full_name", None)
                        or getattr(user, "username", None)
                        or "-"
                    ),
                    "username": getattr(user, "username", "-"),
                    "email": getattr(user, "email", "-"),
                    "role": getattr(user, "role", "student"),
                    "class_name": getattr(user, "class_name", "-"),
                    "major": getattr(user, "major", "-"),
                    "created_at": str(getattr(user, "created_at", "-"))
                }
            )

        return {
            "success": True,
            "students": students,
            "total": len(students)
        }

    finally:
        db.close()


@app.post("/api/admin/students")
async def api_admin_create_student(payload: StudentCreateRequest):
    db = SessionLocal()

    try:
        name = str(payload.name or "").strip()
        username = str(payload.username or "").strip()
        email = str(payload.email or "").strip()
        password = str(payload.password or "123456").strip()
        class_name = str(payload.class_name or "").strip()
        major = str(payload.major or "DKV").strip().upper()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="Nama siswa wajib diisi."
            )

        if not username:
            username = (
                name.lower()
                .replace(" ", "_")
                .replace(".", "")
                .replace(",", "")
            )

        try:
            existing_user = (
                db.query(User)
                .filter(User.username == username)
                .first()
            )

            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Username sudah digunakan."
                )

        except HTTPException:
            raise

        except Exception:
            pass

        user_kwargs = {}

        user_columns = User.__table__.columns.keys()

        if "name" in user_columns:
            user_kwargs["name"] = name

        if "full_name" in user_columns:
            user_kwargs["full_name"] = name

        if "username" in user_columns:
            user_kwargs["username"] = username

        if "email" in user_columns:
            user_kwargs["email"] = email

        if "role" in user_columns:
            user_kwargs["role"] = "student"

        if "class_name" in user_columns:
            user_kwargs["class_name"] = class_name

        if "major" in user_columns:
            user_kwargs["major"] = major

        if "password" in user_columns:
            user_kwargs["password"] = password

        if "password_hash" in user_columns:
            user_kwargs["password_hash"] = password

        if "hashed_password" in user_columns:
            user_kwargs["hashed_password"] = password

        new_user = User(**user_kwargs)

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "success": True,
            "message": "Siswa berhasil ditambahkan.",
            "student": {
                "id": getattr(new_user, "id", None),
                "name": name,
                "username": username,
                "email": email,
                "role": "student",
                "class_name": class_name,
                "major": major
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Gagal menambah siswa: " + str(error)
        )

    finally:
        db.close()


@app.delete("/api/admin/students/{student_id}")
async def api_admin_delete_student(student_id: int):
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.id == student_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Siswa tidak ditemukan."
            )

        db.delete(user)
        db.commit()

        return {
            "success": True,
            "message": "Siswa berhasil dihapus."
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Gagal hapus siswa: " + str(error)
        )

    finally:
        db.close()

# =========================================================
# END DATA SISWA API FILE 17.3
# =========================================================
'''


def main():
    if not APP_FILE.exists():
        print("ERROR: backend/app.py tidak ditemukan.")
        print(APP_FILE)
        return

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUP_DIR / f"app_before_students_api_17_3_{timestamp}.py"

    shutil.copy2(APP_FILE, backup_file)

    print("Backup dibuat:")
    print(backup_file)

    text = APP_FILE.read_text(encoding="utf-8")

    if MARKER_START in text and MARKER_END in text:
        before = text.split(MARKER_START)[0]
        after = text.split(MARKER_END, 1)[1]
        new_text = before + API_BLOCK + after
        APP_FILE.write_text(new_text, encoding="utf-8")
        print("API Data Siswa lama diganti dengan versi 17.3.")
        return

    include_marker = "# =========================================================\n# INCLUDE ROUTERS"

    if include_marker not in text:
        print("ERROR: Marker INCLUDE ROUTERS tidak ditemukan.")
        print("Tambahkan API_BLOCK manual sebelum INCLUDE ROUTERS.")
        return

    new_text = text.replace(
        include_marker,
        API_BLOCK + "\n\n" + include_marker
    )

    APP_FILE.write_text(new_text, encoding="utf-8")

    print("SELESAI.")
    print("API Data Siswa 17.3 berhasil ditambahkan ke backend/app.py.")


if __name__ == "__main__":
    main()