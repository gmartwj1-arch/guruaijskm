# =========================================================
# RESET QUIZ RESULTS TABLE
# Untuk memperbaiki tabel quiz_results lama
# =========================================================

from pathlib import Path
import sys


BASE_DIR = Path(__file__).resolve().parents[2]

if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))


from backend.database.database import engine
from backend.database.models import QuizResult


def main():

    print("Menghapus tabel quiz_results lama...")

    QuizResult.__table__.drop(
        bind=engine,
        checkfirst=True
    )

    print("Membuat tabel quiz_results baru...")

    QuizResult.__table__.create(
        bind=engine,
        checkfirst=True
    )

    print("SELESAI. Tabel quiz_results sudah diperbaiki.")


if __name__ == "__main__":

    main()