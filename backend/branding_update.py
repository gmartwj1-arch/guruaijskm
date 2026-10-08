# =========================================================
# GURU AI JSKM
# FILE 13.4
# FULL BRANDING UPDATE
# =========================================================

from pathlib import Path
import shutil


# =========================================================
# PROJECT ROOT
# =========================================================

BASE_DIR = Path(__file__).resolve().parent


# =========================================================
# FOLDER YANG AKAN DICEK
# =========================================================

TARGET_DIRS = [
    BASE_DIR / "backend",
    BASE_DIR / "frontend",
    BASE_DIR / "modules",
]


# =========================================================
# EXTENSION FILE YANG BOLEH DIUBAH
# =========================================================

ALLOWED_EXTENSIONS = {
    ".py",
    ".html",
    ".css",
    ".js",
    ".json",
    ".txt",
}


# =========================================================
# FOLDER YANG DIABAIKAN
# =========================================================

IGNORE_DIRS = {
    "venv",
    ".venv",
    "__pycache__",
    ".git",
    "node_modules",
    ".idea",
    ".vscode",
}


# =========================================================
# DATA BRANDING
# =========================================================

REPLACEMENTS = {
    "E-Guru AI DKV": "GURU AI JSKM",
    "E-Guru AI": "GURU AI JSKM",
    "E-GURU AI DKV": "GURU AI JSKM",
    "E-GURU AI": "GURU AI JSKM",

    "Guru AI DKV": "GURU AI JSKM",
    "Guru AI Desain Komunikasi Visual": "GURU AI JSKM Multi Jurusan",
    "Guru AI Multi Jurusan": "GURU AI JSKM Multi Jurusan",

    "E-Guru": "GURU AI JSKM",
    "e-Guru": "GURU AI JSKM",

    "E-Guru AI DKV |": "GURU AI JSKM |",
    "Nilai Evaluasi | E-Guru AI DKV": "Nilai Evaluasi | GURU AI JSKM",
    "Quiz | E-Guru AI DKV": "Quiz | GURU AI JSKM",
    "Guru AI | E-Guru AI DKV": "Guru AI | GURU AI JSKM",
    "Modul | E-Guru AI DKV": "Modul | GURU AI JSKM",
    "Dashboard | E-Guru AI DKV": "Dashboard | GURU AI JSKM",

    "Raport Digital Evaluasi Pembelajaran DKV": "Raport Digital Evaluasi Pembelajaran",
    "Hasil quiz berdasarkan materi pembelajaran DKV": "Hasil quiz berdasarkan materi pembelajaran",
    "E-Guru AI DKV.": "GURU AI JSKM.",
    "E-Guru AI.": "GURU AI JSKM.",
}


# =========================================================
# CEK APAKAH FILE BOLEH DIUBAH
# =========================================================

def is_allowed_file(file_path: Path):

    if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:

        return False

    for part in file_path.parts:

        if part in IGNORE_DIRS:

            return False

    return True


# =========================================================
# BACKUP FILE
# =========================================================

def backup_file(file_path: Path):

    backup_path = file_path.with_suffix(
        file_path.suffix + ".bak_branding_13_4"
    )

    if not backup_path.exists():

        shutil.copy2(
            file_path,
            backup_path
        )


# =========================================================
# UPDATE SATU FILE
# =========================================================

def update_file(file_path: Path):

    try:

        original_text = file_path.read_text(
            encoding="utf-8"
        )

    except UnicodeDecodeError:

        try:

            original_text = file_path.read_text(
                encoding="latin-1"
            )

        except Exception:

            return False

    except Exception:

        return False

    new_text = original_text

    for old_text, new_brand in REPLACEMENTS.items():

        new_text = new_text.replace(
            old_text,
            new_brand
        )

    if new_text != original_text:

        backup_file(
            file_path
        )

        file_path.write_text(
            new_text,
            encoding="utf-8"
        )

        print(
            "UPDATED:",
            file_path.relative_to(BASE_DIR)
        )

        return True

    return False


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 60)
    print("GURU AI JSKM - FULL BRANDING UPDATE")
    print("PROJECT:", BASE_DIR)
    print("=" * 60)

    total_updated = 0

    for target_dir in TARGET_DIRS:

        if not target_dir.exists():

            print(
                "SKIP, folder tidak ada:",
                target_dir
            )

            continue

        for file_path in target_dir.rglob("*"):

            if not file_path.is_file():

                continue

            if not is_allowed_file(file_path):

                continue

            updated = update_file(
                file_path
            )

            if updated:

                total_updated += 1

    print("=" * 60)
    print("SELESAI")
    print("Total file diupdate:", total_updated)
    print("=" * 60)

    print("")
    print("Langkah berikutnya:")
    print("1. Restart server")
    print("2. Buka browser")
    print("3. Tekan Ctrl + F5")
    print("")


if __name__ == "__main__":

    main()