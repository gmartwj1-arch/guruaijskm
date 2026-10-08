"""
==========================================================
GURU AI JSKM
Database Initializer
==========================================================
"""

from backend.database.database import Base, engine
from backend.database import models


def create_database():

    print("=" * 60)
    print("Membuat Database GURU AI JSKM...")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)

    print("")

    print("Database berhasil dibuat.")

    print("")

    print("Tabel yang aktif :")

    for table in Base.metadata.tables.keys():

        print(f" - {table}")

    print("")
    print("=" * 60)
    print("SELESAI")
    print("=" * 60)


if __name__ == "__main__":

    create_database()