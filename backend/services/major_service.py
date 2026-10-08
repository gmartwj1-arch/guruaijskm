# =========================================================
# GURU AI JSKM
# MAJOR SERVICE
# FILE 13.1
# SISTEM MULTI JURUSAN DKV DAN TKJ
# =========================================================

from pathlib import Path
import json


# =========================================================
# BASE PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODULES_DIR = BASE_DIR / "modules"


# =========================================================
# DAFTAR JURUSAN
# =========================================================

MAJORS = {
    "DKV": {
        "code": "DKV",
        "name": "Desain Komunikasi Visual",
        "short_name": "DKV",
        "description": "Materi pembelajaran untuk siswa jurusan Desain Komunikasi Visual.",
        "module_file": "modul_dkv_lengkap.json"
    },
    "TKJ": {
        "code": "TKJ",
        "name": "Teknik Komputer dan Jaringan",
        "short_name": "TKJ",
        "description": "Materi pembelajaran untuk siswa jurusan Teknik Komputer dan Jaringan.",
        "module_file": "modul_tkj_lengkap.json"
    }
}


# =========================================================
# HELPER
# =========================================================

def normalize_major(major_code: str | None):

    if not major_code:

        return "DKV"

    major_code = str(major_code).strip().upper()

    if major_code not in MAJORS:

        return "DKV"

    return major_code


def get_major_info(major_code: str | None):

    major_code = normalize_major(
        major_code
    )

    return MAJORS.get(
        major_code
    )


def get_all_majors():

    return list(
        MAJORS.values()
    )


def get_module_file_path(major_code: str | None):

    major = get_major_info(
        major_code
    )

    return MODULES_DIR / major["module_file"]


def load_module_data(major_code: str | None):

    major_code = normalize_major(
        major_code
    )

    module_file = get_module_file_path(
        major_code
    )

    if not module_file.exists():

        return {
            "success": False,
            "major": get_major_info(
                major_code
            ),
            "message": f"File modul untuk jurusan {major_code} belum tersedia.",
            "module": {
                "major": major_code,
                "title": get_major_info(major_code)["name"]
            },
            "chapters": []
        }

    try:

        with open(
            module_file,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(
                file
            )

        if isinstance(data, list):

            data = {
                "module": {
                    "major": major_code,
                    "title": get_major_info(major_code)["name"]
                },
                "chapters": data
            }

        if "module" not in data:

            data["module"] = {
                "major": major_code,
                "title": get_major_info(major_code)["name"]
            }

        if "chapters" not in data:

            data["chapters"] = []

        data["module"]["major"] = major_code

        return {
            "success": True,
            "major": get_major_info(
                major_code
            ),
            "message": f"Modul jurusan {major_code} berhasil dimuat.",
            "module": data.get(
                "module",
                {}
            ),
            "chapters": data.get(
                "chapters",
                []
            )
        }

    except Exception as e:

        return {
            "success": False,
            "major": get_major_info(
                major_code
            ),
            "message": str(e),
            "module": {
                "major": major_code,
                "title": get_major_info(major_code)["name"]
            },
            "chapters": []
        }


def get_chapters_by_major(major_code: str | None):

    data = load_module_data(
        major_code
    )

    return data.get(
        "chapters",
        []
    )


def get_chapter_by_major(major_code: str | None, chapter_number: int):

    chapters = get_chapters_by_major(
        major_code
    )

    for chapter in chapters:

        if int(chapter.get("chapter", 0)) == int(chapter_number):

            return chapter

    return None


def get_module_summary(major_code: str | None):

    data = load_module_data(
        major_code
    )

    chapters = data.get(
        "chapters",
        []
    )

    total_sections = 0

    for chapter in chapters:

        sections = chapter.get(
            "sections",
            []
        )

        if isinstance(sections, list):

            total_sections += len(
                sections
            )

    return {
        "success": data.get(
            "success",
            False
        ),
        "major": data.get(
            "major",
            {}
        ),
        "module": data.get(
            "module",
            {}
        ),
        "total_chapters": len(
            chapters
        ),
        "total_sections": total_sections,
        "chapters": chapters,
        "message": data.get(
            "message",
            ""
        )
    }


# =========================================================
# INSTANCE
# =========================================================

major_service = {
    "get_all_majors": get_all_majors,
    "get_major_info": get_major_info,
    "load_module_data": load_module_data,
    "get_chapters_by_major": get_chapters_by_major,
    "get_chapter_by_major": get_chapter_by_major,
    "get_module_summary": get_module_summary,
}