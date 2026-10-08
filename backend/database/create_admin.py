from backend.database.database import SessionLocal
from backend.database.models import User


def create_admin():

    db = SessionLocal()

    try:

        # cek apakah admin sudah ada
        admin = (
            db.query(User)
            .filter(User.username == "admin")
            .first()
        )

        if admin:

            print("=" * 50)
            print("Admin sudah ada.")
            print("=" * 50)

            print("Username :", admin.username)
            print("Password : admin123")
            print("Role     :", admin.role)

            return

        admin = User(

            nama="Administrator",

            username="admin",

            password="admin123",

            role="admin",

            kelas="-",

            jurusan="DKV",

            active=True

        )

        db.add(admin)

        db.commit()

        db.refresh(admin)

        print("=" * 50)
        print("ADMIN BERHASIL DIBUAT")
        print("=" * 50)

        print("Username :", admin.username)
        print("Password :", admin.password)

    finally:

        db.close()


if __name__ == "__main__":

    create_admin()