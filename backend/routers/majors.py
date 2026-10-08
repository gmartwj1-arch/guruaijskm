# =========================================================
# GURU AI JSKM
# MAJORS ROUTER
# FILE 13.1
# API MULTI JURUSAN DKV DAN TKJ
# =========================================================

from fastapi import APIRouter

from backend.services.major_service import (
    get_all_majors,
    get_major_info,
    get_module_summary,
    get_chapter_by_major,
    normalize_major
)


router = APIRouter()


# =========================================================
# GET ALL MAJORS
# =========================================================

@router.get("/api/majors")
async def api_get_majors():

    return {
        "success": True,
        "total": len(
            get_all_majors()
        ),
        "data": get_all_majors()
    }


# =========================================================
# GET MAJOR DETAIL
# =========================================================

@router.get("/api/majors/{major_code}")
async def api_get_major_detail(major_code: str):

    major_code = normalize_major(
        major_code
    )

    return {
        "success": True,
        "data": get_major_info(
            major_code
        )
    }


# =========================================================
# GET MODULES BY MAJOR
# =========================================================

@router.get("/api/majors/{major_code}/modules")
async def api_get_modules_by_major(major_code: str):

    major_code = normalize_major(
        major_code
    )

    summary = get_module_summary(
        major_code
    )

    return {
        "success": summary.get(
            "success",
            False
        ),
        "major": summary.get(
            "major",
            {}
        ),
        "module": summary.get(
            "module",
            {}
        ),
        "total": summary.get(
            "total_chapters",
            0
        ),
        "total_materi": summary.get(
            "total_sections",
            0
        ),
        "chapters": summary.get(
            "chapters",
            []
        ),
        "data": summary.get(
            "chapters",
            []
        ),
        "message": summary.get(
            "message",
            ""
        )
    }


# =========================================================
# GET CHAPTER BY MAJOR
# =========================================================

@router.get("/api/majors/{major_code}/modules/{chapter_number}")
async def api_get_chapter_by_major(
    major_code: str,
    chapter_number: int
):

    major_code = normalize_major(
        major_code
    )

    chapter = get_chapter_by_major(
        major_code,
        chapter_number
    )

    if not chapter:

        return {
            "success": False,
            "message": "BAB tidak ditemukan.",
            "major": get_major_info(
                major_code
            ),
            "data": None
        }

    return {
        "success": True,
        "major": get_major_info(
            major_code
        ),
        "data": chapter
    }