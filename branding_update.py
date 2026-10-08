from pathlib import Path
import shutil

BASE_DIR = Path(__file__).resolve().parent

TARGET_DIRS = [
    BASE_DIR / "backend",
    BASE_DIR / "frontend",
    BASE_DIR / "modules",
]

ALLOWED_EXTENSIONS = {
    ".py",
    ".html",
    ".css",
    ".js",
    ".json",
    ".txt",
}

IGNORE_DIRS = {
    "venv",
    ".venv",
    "__pycache__",
    ".git",
    "node_modules",
}

REPLACEMENTS = {
    "E-Guru AI DKV": "GURU AI JSKM",
    "E-GURU AI DKV": "GURU AI JSKM",
    "E-Guru AI": "GURU AI JSKM",
    "E-GURU AI": "GURU AI JSKM",
    "Guru AI DKV": "GURU AI JSKM",
    "Guru AI Desain Komunikasi Visual": "GURU AI JSKM Multi Jurusan",
    "E-Guru": "GURU AI JSKM",
    "e-Guru": "GURU AI JSKM",
    "Raport Digital Evaluasi Pembelajaran DKV": "Raport Digital Evaluasi Pembelajaran",
    "Hasil quiz berdasarkan materi pembelajaran DKV": "Hasil quiz berdasarkan materi pembelajaran",
}

def is_allowed_file(file_path):
    if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
        return False

    for part in file_path.parts:
        if part in IGNORE_DIRS:
            return False

    return True

def backup_file(file_path):
    backup_path = file_path.with_suffix(
        file_path.suffix + ".bak_branding_13_4"
    )

    if not backup_path.exists():
        shutil.copy2(file_path, backup_path)

def update_file(file_path):
    try:
        original_text = file_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            original_text = file_path.read_text(encoding="latin-1")
        except Exception:
            return False
    except Exception:
        return False

    new_text = original_text

    for old_text, new_text_value in REPLACEMENTS.items():
        new_text = new_text.replace(old_text, new_text_value)

    if new_text != original_text:
        backup_file(file_path)
        file_path.write_text(new_text, encoding="utf-8")
        print("UPDATED:", file_path.relative_to(BASE_DIR))
        return True

    return False

def main():
    print("=" * 60)
    print("GURU AI JSKM - FULL BRANDING UPDATE")
    print("PROJECT:", BASE_DIR)
    print("=" * 60)

    total_updated = 0

    for target_dir in TARGET_DIRS:
        if not target_dir.exists():
            print("SKIP:", target_dir)
            continue

        for file_path in target_dir.rglob("*"):
            if not file_path.is_file():
                continue

            if not is_allowed_file(file_path):
                continue

            if update_file(file_path):
                total_updated += 1

    print("=" * 60)
    print("SELESAI")
    print("Total file diupdate:", total_updated)
    print("=" * 60)

if __name__ == "__main__":
    main()
