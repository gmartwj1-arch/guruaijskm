from pathlib import Path
import shutil

BASE_DIR = Path(__file__).resolve().parent

backup_files = list(
    BASE_DIR.rglob("*.bak_branding_13_4")
)

print("=" * 60)
print("RESTORE BRANDING BACKUP")
print("PROJECT:", BASE_DIR)
print("TOTAL BACKUP:", len(backup_files))
print("=" * 60)

restored = 0

for backup_file in backup_files:

    original_name = backup_file.name.replace(
        ".bak_branding_13_4",
        ""
    )

    original_file = backup_file.with_name(
        original_name
    )

    shutil.copy2(
        backup_file,
        original_file
    )

    print(
        "RESTORED:",
        original_file.relative_to(BASE_DIR)
    )

    restored += 1

print("=" * 60)
print("SELESAI RESTORE")
print("Total file direstore:", restored)
print("=" * 60)
