# =========================================================
# GURU AI JSKM
# AUTH ROUTER
# LOGIN / LOGOUT / USER SESSION
# =========================================================

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.models import User

router = APIRouter(
    tags=["Authentication"]
)


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    nama: str
    username: str
    password: str
    role: Optional[str] = "student"
    kelas: Optional[str] = ""
    jurusan: Optional[str] = "DKV"
    email: Optional[str] = ""


@router.post("/api/login")
async def api_login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    username = data.username.strip()
    password = data.password.strip()

    if not username or not password:
        return {
            "success": False,
            "message": "Username dan password wajib diisi."
        }

    # Query user from DB
    user = db.query(User).filter(User.username.ilike(username)).first()

    # Fallback default admin if DB doesn't have it yet
    if not user and username.lower() == "admin" and password in ["admin", "admin123"]:
        # Auto-create admin in DB
        admin_user = User(
            nama="Administrator",
            username="admin",
            password="admin123",
            role="admin",
            kelas="-",
            jurusan="DKV",
            active=True
        )
        db.add(admin_user)
        try:
            db.commit()
            db.refresh(admin_user)
            user = admin_user
        except Exception:
            db.rollback()
            return {
                "success": True,
                "message": "Login berhasil sebagai Administrator.",
                "user": {
                    "id": 1,
                    "nama": "Administrator",
                    "username": "admin",
                    "role": "admin",
                    "kelas": "-",
                    "jurusan": "DKV"
                }
            }

    if not user:
        return {
            "success": False,
            "message": "Username tidak ditemukan."
        }

    # Password check
    if user.password != password:
        return {
            "success": False,
            "message": "Password salah. Silakan coba lagi."
        }

    if not user.active:
        return {
            "success": False,
            "message": "Akun Anda dinonaktifkan. Hubungi admin."
        }

    return {
        "success": True,
        "message": "Login berhasil.",
        "user": {
            "id": user.id,
            "nama": user.nama,
            "username": user.username,
            "email": getattr(user, "email", "") or "",
            "role": user.role,
            "kelas": user.kelas or "-",
            "jurusan": user.jurusan or "DKV"
        }
    }


@router.post("/api/logout")
async def api_logout():
    return {
        "success": True,
        "message": "Logout berhasil."
    }


@router.get("/api/me")
async def api_me(
    username: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if not username:
        return {
            "success": False,
            "message": "Username tidak diberikan."
        }

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {
            "success": False,
            "message": "User tidak ditemukan."
        }

    return {
        "success": True,
        "user": {
            "id": user.id,
            "nama": user.nama,
            "username": user.username,
            "email": getattr(user, "email", "") or "",
            "role": user.role,
            "kelas": user.kelas,
            "jurusan": user.jurusan,
            "active": user.active
        }
    }