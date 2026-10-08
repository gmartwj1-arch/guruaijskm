from sqlalchemy.orm import Session

from backend.database.models import User


class AuthService:

    # ==========================================
    # LOGIN
    # ==========================================

    def login(self, db: Session, username: str, password: str):

        user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if not user:

            return {
                "success": False,
                "message": "Username tidak ditemukan."
            }

        if user.password != password:

            return {
                "success": False,
                "message": "Password salah."
            }

        return {

            "success": True,

            "user": {

                "id": user.id,

                "nama": user.nama,

                "username": user.username,

                "role": user.role,

                "kelas": user.kelas,

                "jurusan": user.jurusan

            }

        }


auth_service = AuthService()