# =========================================================
# GURU AI JSKM
# BACKEND APP
# FILE 15.2
# FULL APP + STABLE IP CAMERA + SMART CAMERA + EZVIZ TALKBACK
# =========================================================

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Depends

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
from fastapi.responses import Response

from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel

from pathlib import Path

from typing import Optional
from typing import List
from typing import Dict
from typing import Any

import json
import os
import time


# =========================================================
# ENV
# =========================================================

try:

    from dotenv import load_dotenv

    load_dotenv()

except Exception:

    pass


# =========================================================
# DATABASE
# =========================================================

try:

    from backend.database.database import SessionLocal
    from backend.database.database import engine

    from backend.database import models

    from backend.database.models import User
    from backend.database.models import ChatHistory
    from backend.database.models import LearningProgress
    from backend.database.models import Bookmark
    from backend.database.models import QuizResult

    models.Base.metadata.create_all(
        bind=engine
    )

except Exception as error:

    print(
        "DATABASE INIT WARNING:",
        error
    )

    SessionLocal = None
    User = None
    ChatHistory = None
    LearningProgress = None
    Bookmark = None
    QuizResult = None


# =========================================================
# SERVICES
# =========================================================

try:

    from backend.services.module_service import module_service

except Exception as error:

    print(
        "MODULE SERVICE WARNING:",
        error
    )

    module_service = None


# =========================================================
# ROUTERS
# =========================================================

try:

    from backend.routers.auth import router as auth_router

except Exception as error:

    print(
        "AUTH ROUTER WARNING:",
        error
    )

    auth_router = None


try:

    from backend.routers.admin import router as admin_router

except Exception as error:

    print(
        "ADMIN ROUTER WARNING:",
        error
    )

    admin_router = None


# =========================================================
# PATH CONFIG
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIR = BASE_DIR / "frontend"
PAGES_DIR = FRONTEND_DIR / "pages"
ASSETS_DIR = FRONTEND_DIR / "assets"

MODULES_DIR = BASE_DIR / "modules"

MODULE_FILE_DKV = MODULES_DIR / "modul_dkv_lengkap.json"
MODULE_FILE_TKJ = MODULES_DIR / "modul_tkj_lengkap.json"

CAMERA_CONFIG_FILE = BASE_DIR / "backend" / "camera_config.json"
EZVIZ_CONFIG_FILE = BASE_DIR / "backend" / "ezviz_talkback_config.json"


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="GURU AI JSKM",
    version="15.2",
    description="GURU AI JSKM Multi Jurusan DKV dan TKJ"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],
    allow_credentials=True,
    allow_methods=[
        "*"
    ],
    allow_headers=[
        "*"
    ]
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/static",
    StaticFiles(
        directory=str(ASSETS_DIR)
    ),
    name="static"
)


# =========================================================
# DATABASE SESSION
# =========================================================

def get_db():

    if SessionLocal is None:

        raise HTTPException(
            status_code=500,
            detail="Database belum tersedia."
        )

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# =========================================================
# MAJOR CONFIG
# =========================================================

MAJORS = {
    "DKV": {
        "code": "DKV",
        "name": "Desain Komunikasi Visual",
        "description": "Materi pembelajaran DKV untuk siswa SMK."
    },
    "TKJ": {
        "code": "TKJ",
        "name": "Teknik Komputer dan Jaringan",
        "description": "Materi pembelajaran TKJ untuk siswa SMK."
    }
}


def normalize_major(
    major_code: Optional[str]
):

    code = str(
        major_code or "DKV"
    ).strip().upper()

    if code not in MAJORS:
        code = "DKV"

    return code


def get_major_info(
    major_code: Optional[str]
):

    code = normalize_major(
        major_code
    )

    return MAJORS[code]


def get_all_majors():

    return list(
        MAJORS.values()
    )


def get_module_file_by_major(
    major_code: Optional[str]
):

    code = normalize_major(
        major_code
    )

    if code == "TKJ":
        return MODULE_FILE_TKJ

    return MODULE_FILE_DKV


# =========================================================
# MODULE HELPERS
# =========================================================

def load_module_data(
    major_code: Optional[str] = "DKV"
):

    module_file = get_module_file_by_major(
        major_code
    )

    if not module_file.exists():

        return {
            "module": {
                "major": normalize_major(
                    major_code
                ),
                "title": "Modul belum tersedia"
            },
            "chapters": []
        }

    try:

        with open(
            module_file,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        if isinstance(
            data,
            list
        ):

            return {
                "module": {
                    "major": normalize_major(
                        major_code
                    ),
                    "title": "Modul Pembelajaran"
                },
                "chapters": data
            }

        if isinstance(
            data,
            dict
        ):

            if "chapters" not in data:

                data["chapters"] = []

            return data

        return {
            "module": {
                "major": normalize_major(
                    major_code
                ),
                "title": "Modul Pembelajaran"
            },
            "chapters": []
        }

    except Exception as error:

        print(
            "LOAD MODULE ERROR:",
            error
        )

        return {
            "module": {
                "major": normalize_major(
                    major_code
                ),
                "title": "Modul error"
            },
            "chapters": []
        }


def get_value_from_keys(
    data: Dict[str, Any],
    keys: List[str],
    fallback: Any = ""
):

    for key in keys:

        if key in data and data[key] not in [
            None,
            ""
        ]:

            return data[key]

    return fallback


def fix_section_format(
    section: Dict[str, Any],
    index: int = 0
):

    if not isinstance(
        section,
        dict
    ):

        section = {
            "title": str(section),
            "content": str(section)
        }

    title = get_value_from_keys(
        section,
        [
            "title",
            "judul",
            "name",
            "sub_title",
            "subtitle"
        ],
        "Submateri"
    )

    content = get_value_from_keys(
        section,
        [
            "content",
            "materi",
            "description",
            "text",
            "isi",
            "body"
        ],
        ""
    )

    section_number = get_value_from_keys(
        section,
        [
            "section",
            "number",
            "no",
            "id"
        ],
        index + 1
    )

    return {
        "section": section_number,
        "title": title,
        "content": content,
        "raw": section
    }


def fix_chapter_format(
    chapter: Dict[str, Any],
    index: int = 0
):

    if not isinstance(
        chapter,
        dict
    ):

        chapter = {
            "title": str(chapter),
            "sections": []
        }

    chapter_number = get_value_from_keys(
        chapter,
        [
            "chapter",
            "number",
            "no",
            "bab",
            "id"
        ],
        index + 1
    )

    try:

        chapter_number = int(
            chapter_number
        )

    except Exception:

        chapter_number = index + 1

    code = get_value_from_keys(
        chapter,
        [
            "code",
            "kode"
        ],
        "BAB " + str(chapter_number)
    )

    title = get_value_from_keys(
        chapter,
        [
            "title",
            "judul",
            "name"
        ],
        "BAB " + str(chapter_number)
    )

    description = get_value_from_keys(
        chapter,
        [
            "description",
            "deskripsi",
            "summary",
            "ringkasan"
        ],
        ""
    )

    raw_sections = get_value_from_keys(
        chapter,
        [
            "sections",
            "subchapters",
            "sub_materi",
            "materi",
            "items"
        ],
        []
    )

    if not isinstance(
        raw_sections,
        list
    ):

        raw_sections = []

    sections = []

    for section_index, section in enumerate(raw_sections):

        sections.append(
            fix_section_format(
                section,
                section_index
            )
        )

    fixed = dict(
        chapter
    )

    fixed["chapter"] = chapter_number
    fixed["code"] = code
    fixed["title"] = title
    fixed["description"] = description
    fixed["sections"] = sections
    fixed["total_sections"] = len(sections)

    return fixed


def fix_chapters_format(
    chapters: List[Dict[str, Any]]
):

    fixed = []

    for index, chapter in enumerate(chapters):

        fixed.append(
            fix_chapter_format(
                chapter,
                index
            )
        )

    return fixed


def get_chapters_by_major(
    major_code: Optional[str] = "DKV"
):

    data = load_module_data(
        major_code
    )

    chapters = data.get(
        "chapters",
        []
    )

    if not isinstance(
        chapters,
        list
    ):

        chapters = []

    return fix_chapters_format(
        chapters
    )


def get_all_chapters():

    return get_chapters_by_major(
        "DKV"
    )


def get_chapter_by_major(
    major_code: Optional[str],
    chapter_number: int
):

    chapters = get_chapters_by_major(
        major_code
    )

    for chapter in chapters:

        try:

            if int(
                chapter.get(
                    "chapter",
                    0
                )
            ) == int(
                chapter_number
            ):

                return chapter

        except Exception:

            pass

    return None


def get_chapter(
    chapter_number: int
):

    return get_chapter_by_major(
        "DKV",
        chapter_number
    )


def get_section_by_major(
    major_code: Optional[str],
    section_id: str
):

    chapters = get_chapters_by_major(
        major_code
    )

    for chapter in chapters:

        for section in chapter.get(
            "sections",
            []
        ):

            if str(
                section.get(
                    "section",
                    ""
                )
            ) == str(
                section_id
            ):

                return {
                    "chapter": chapter,
                    "section": section
                }

    return None


def get_section(
    section_id: str
):

    return get_section_by_major(
        "DKV",
        section_id
    )


def search_module_by_major(
    major_code: Optional[str],
    query: str
):

    q = str(
        query or ""
    ).strip().lower()

    results = []

    if not q:

        return results

    chapters = get_chapters_by_major(
        major_code
    )

    for chapter in chapters:

        chapter_text = (
            str(
                chapter.get(
                    "title",
                    ""
                )
            )
            + " "
            + str(
                chapter.get(
                    "description",
                    ""
                )
            )
        ).lower()

        if q in chapter_text:

            results.append(
                {
                    "type": "chapter",
                    "chapter": chapter.get(
                        "chapter"
                    ),
                    "code": chapter.get(
                        "code"
                    ),
                    "title": chapter.get(
                        "title"
                    ),
                    "description": chapter.get(
                        "description",
                        ""
                    )
                }
            )

        for section in chapter.get(
            "sections",
            []
        ):

            section_text = (
                str(
                    section.get(
                        "title",
                        ""
                    )
                )
                + " "
                + str(
                    section.get(
                        "content",
                        ""
                    )
                )
            ).lower()

            if q in section_text:

                results.append(
                    {
                        "type": "section",
                        "chapter": chapter.get(
                            "chapter"
                        ),
                        "code": chapter.get(
                            "code"
                        ),
                        "chapter_title": chapter.get(
                            "title"
                        ),
                        "section": section.get(
                            "section"
                        ),
                        "title": section.get(
                            "title"
                        ),
                        "content": section.get(
                            "content",
                            ""
                        )
                    }
                )

    return results


def search_module(
    query: str
):

    return search_module_by_major(
        "DKV",
        query
    )


def get_module_summary(
    major_code: Optional[str] = "DKV"
):

    chapters = get_chapters_by_major(
        major_code
    )

    total_materi = 0

    for chapter in chapters:

        total_materi += len(
            chapter.get(
                "sections",
                []
            )
        )

    return {
        "major": normalize_major(
            major_code
        ),
        "major_info": get_major_info(
            major_code
        ),
        "total_chapters": len(
            chapters
        ),
        "total": len(
            chapters
        ),
        "total_bab": len(
            chapters
        ),
        "total_materi": total_materi,
        "total_quiz": len(
            chapters
        ),
        "total_video": 0,
        "chapters": chapters
    }


# =========================================================
# PAGE ROUTES
# =========================================================

@app.get("/")
async def home():

    return FileResponse(
        PAGES_DIR / "index.html"
    )


@app.get("/login")
async def login_page():

    return FileResponse(
        PAGES_DIR / "login.html"
    )


@app.get("/admin")
async def admin_page():
    return FileResponse(
        PAGES_DIR / "admin.html"
    )

    # =========================================================
# EXTRA ADMIN PAGES
# FILE 17.0
# FIX MENU SIDEBAR
# =========================================================

@app.get("/admin/bookmarks")
async def admin_bookmarks_page():
    return FileResponse(PAGES_DIR / "bookmarks.html")


@app.get("/admin/progress")
async def admin_progress_page():
    return FileResponse(PAGES_DIR / "progress.html")


@app.get("/admin/settings")
async def admin_settings_page():
    return FileResponse(PAGES_DIR / "settings.html")


@app.get("/admin/evaluations")
async def admin_evaluations_alias_page():
    return FileResponse(PAGES_DIR / "evaluation.html")


@app.get("/admin/camera")
async def admin_camera_alias_page():
    return FileResponse(PAGES_DIR / "camera_settings.html")

    return FileResponse(
        PAGES_DIR / "admin.html"
    )


@app.get("/admin/students")
async def students_page():

    return FileResponse(
        PAGES_DIR / "students.html"
    )


@app.get("/admin/teachers")
async def teachers_page():

    return FileResponse(
        PAGES_DIR / "teachers.html"
    )


@app.get("/admin/modules")
async def modules_page():

    return FileResponse(
        PAGES_DIR / "modules.html"
    )


@app.get("/admin/modules/{chapter_number}")
async def module_detail_page(
    chapter_number: int
):

    return FileResponse(
        PAGES_DIR / "module_detail.html"
    )


@app.get("/admin/guru-ai")
async def guru_ai_page():

    return FileResponse(
        PAGES_DIR / "guru_ai.html"
    )


@app.get("/admin/class-mode")
async def class_mode_page():

    return FileResponse(
        PAGES_DIR / "class_mode.html"
    )


@app.get("/admin/camera-settings")
async def camera_settings_page():

    return FileResponse(
        PAGES_DIR / "camera_settings.html"
    )


@app.get("/admin/quiz")
async def quiz_page():

    return FileResponse(
        PAGES_DIR / "quiz.html"
    )


@app.get("/admin/evaluation")
async def evaluation_page():

    return FileResponse(
        PAGES_DIR / "evaluation.html"
    )


# =========================================================
# STATUS
# =========================================================

@app.get("/api/status")
async def api_status():

    return {
        "success": True,
        "message": "GURU AI JSKM Backend aktif.",
        "version": "15.2",
        "app": "GURU AI JSKM"
    }


@app.get("/ping")
async def ping():

    return {
        "success": True,
        "message": "pong"
    }


# =========================================================
# MAJOR API
# =========================================================

@app.get("/api/majors")
async def api_get_majors():

    return {
        "success": True,
        "data": get_all_majors()
    }


@app.get("/api/majors/{major_code}")
async def api_get_major(
    major_code: str
):

    return {
        "success": True,
        "data": get_major_info(
            major_code
        )
    }


@app.get("/api/majors/{major_code}/modules")
async def api_get_major_modules(
    major_code: str
):

    summary = get_module_summary(
        major_code
    )

    return {
        "success": True,
        "data": summary,
        "chapters": summary.get(
            "chapters",
            []
        ),
        "total": summary.get(
            "total",
            0
        ),
        "total_chapters": summary.get(
            "total_chapters",
            0
        ),
        "total_bab": summary.get(
            "total_bab",
            0
        ),
        "total_materi": summary.get(
            "total_materi",
            0
        )
    }


@app.get("/api/majors/{major_code}/modules/{chapter_number}")
async def api_get_major_chapter(
    major_code: str,
    chapter_number: int
):

    chapter = get_chapter_by_major(
        major_code,
        chapter_number
    )

    if not chapter:

        raise HTTPException(
            status_code=404,
            detail="BAB tidak ditemukan."
        )

    return {
        "success": True,
        "data": chapter
    }


@app.get("/api/majors/{major_code}/search")
async def api_search_major(
    major_code: str,
    q: str = ""
):

    results = search_module_by_major(
        major_code,
        q
    )

    return {
        "success": True,
        "query": q,
        "total": len(
            results
        ),
        "data": results
    }


# =========================================================
# LEGACY DKV MODULE API
# =========================================================

@app.get("/api/chapters")
async def api_get_chapters():

    chapters = get_all_chapters()

    return {
        "success": True,
        "data": chapters,
        "chapters": chapters,
        "total": len(
            chapters
        )
    }


@app.get("/api/chapter/{chapter_number}")
async def api_get_chapter(
    chapter_number: int
):

    chapter = get_chapter(
        chapter_number
    )

    if not chapter:

        raise HTTPException(
            status_code=404,
            detail="BAB tidak ditemukan."
        )

    return {
        "success": True,
        "data": chapter
    }


@app.get("/api/section/{section_id}")
async def api_get_section(
    section_id: str
):

    result = get_section(
        section_id
    )

    if not result:

        raise HTTPException(
            status_code=404,
            detail="Submateri tidak ditemukan."
        )

    return {
        "success": True,
        "data": result
    }


@app.get("/api/search")
async def api_search(
    q: str = ""
):

    results = search_module(
        q
    )

    return {
        "success": True,
        "query": q,
        "total": len(
            results
        ),
        "data": results
    }


@app.get("/api/admin/modules")
async def api_admin_modules(major: Optional[str] = "DKV"):

    summary = get_module_summary(
        major or "DKV"
    )

    return {
        "success": True,
        "major": major or "DKV",
        "data": summary,
        "chapters": summary.get(
            "chapters",
            []
        )
    }


@app.get("/api/admin/modules/{chapter_number}")
async def api_admin_module_detail(
    chapter_number: int,
    major: Optional[str] = "DKV"
):

    chapter = get_chapter_by_major(
        major or "DKV",
        chapter_number
    )

    if not chapter:

        raise HTTPException(
            status_code=404,
            detail="BAB tidak ditemukan."
        )

    return {
        "success": True,
        "major": major or "DKV",
        "data": chapter
    }


# =========================================================
# CHAT API
# =========================================================

class ChatRequest(BaseModel):

    question: str
    major: Optional[str] = "DKV"


@app.post("/api/chat")
async def api_chat(
    data: ChatRequest
):

    question = str(
        data.question or ""
    ).strip()

    if not question:

        return {
            "success": False,
            "answer": "Pertanyaan masih kosong."
        }

    major = (data.major or "DKV").upper()
    if major == "DKV" and module_service:
        try:
            answer = module_service.answer(
                question
            )
            if isinstance(
                answer,
                dict
            ):
                if "success" not in answer:
                    answer["success"] = True
                return answer

            return {
                "success": True,
                "answer": str(
                    answer
                )
            }
        except Exception as error:
            print(
                "CHAT SERVICE ERROR:",
                error
            )

    results = search_module_by_major(
        major,
        question
    )

    if results:
        first = results[0]
        title = first.get("title", "-")
        content = first.get("content", first.get("description", ""))
        answer = (
            f"Saya menemukan materi yang sesuai di Jurusan {major}:\n\n"
            f"📌 Judul: {title}\n\n"
            f"{content}"
        )

        return {
            "success": True,
            "answer": answer,
            "source": first
        }

    return {
        "success": True,
        "answer": f"Materi terkait '{question}' belum ditemukan secara spesifik di modul {major}. Silakan gunakan kata kunci lain atau pilih sub materi yang relevan."
    }


# =========================================================
# QUIZ RESULT API
# =========================================================

class QuizResultRequest(BaseModel):

    student_id: Optional[int] = None
    student_name: Optional[str] = "Admin"
    chapter_number: Optional[int] = 0
    chapter_code: Optional[str] = ""
    chapter_title: Optional[str] = ""
    quiz_mode: Optional[str] = "quiz"
    total_questions: Optional[int] = 0
    correct_answers: Optional[int] = 0
    wrong_answers: Optional[int] = 0
    score: Optional[float] = 0
    answers: Optional[Any] = None
    questions: Optional[Any] = None


@app.post("/api/quiz-results")
async def save_quiz_result(
    data: QuizResultRequest,
    db=Depends(get_db)
):

    if QuizResult is None:

        raise HTTPException(
            status_code=500,
            detail="Model QuizResult belum tersedia."
        )

    try:

        result = QuizResult(
            student_id=data.student_id,
            student_name=data.student_name or "Admin",
            chapter_number=data.chapter_number or 0,
            chapter_code=data.chapter_code or "",
            chapter_title=data.chapter_title or "",
            quiz_mode=data.quiz_mode or "quiz",
            total_questions=data.total_questions or 0,
            correct_answers=data.correct_answers or 0,
            wrong_answers=data.wrong_answers or 0,
            score=data.score or 0,
            answers_json=json.dumps(
                data.answers or [],
                ensure_ascii=False
            ),
            questions_json=json.dumps(
                data.questions or [],
                ensure_ascii=False
            )
        )

        db.add(
            result
        )

        db.commit()

        db.refresh(
            result
        )

        return {
            "success": True,
            "message": "Nilai quiz berhasil disimpan.",
            "data": {
                "id": result.id
            }
        }

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(
                error
            )
        )


@app.get("/api/quiz-results")
async def get_quiz_results(
    db=Depends(get_db)
):

    if QuizResult is None:

        raise HTTPException(
            status_code=500,
            detail="Model QuizResult belum tersedia."
        )

    results = db.query(
        QuizResult
    ).order_by(
        QuizResult.id.desc()
    ).all()

    data = []

    for item in results:

        try:

            answers = json.loads(
                item.answers_json or "[]"
            )

        except Exception:

            answers = []

        try:

            questions = json.loads(
                item.questions_json or "[]"
            )

        except Exception:

            questions = []

        data.append(
            {
                "id": item.id,
                "student_id": item.student_id,
                "student_name": item.student_name,
                "chapter_number": item.chapter_number,
                "chapter_code": item.chapter_code,
                "chapter_title": item.chapter_title,
                "quiz_mode": item.quiz_mode,
                "total_questions": item.total_questions,
                "correct_answers": item.correct_answers,
                "wrong_answers": item.wrong_answers,
                "score": item.score,
                "answers": answers,
                "questions": questions,
                "created_at": str(
                    item.created_at
                )
            }
        )

    return {
        "success": True,
        "total": len(
            data
        ),
        "data": data
    }


@app.get("/api/quiz-results/{result_id}")
async def get_quiz_result_detail(
    result_id: int,
    db=Depends(get_db)
):

    if QuizResult is None:

        raise HTTPException(
            status_code=500,
            detail="Model QuizResult belum tersedia."
        )

    item = db.query(
        QuizResult
    ).filter(
        QuizResult.id == result_id
    ).first()

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Data nilai tidak ditemukan."
        )

    try:

        answers = json.loads(
            item.answers_json or "[]"
        )

    except Exception:

        answers = []

    try:

        questions = json.loads(
            item.questions_json or "[]"
        )

    except Exception:

        questions = []

    return {
        "success": True,
        "data": {
            "id": item.id,
            "student_id": item.student_id,
            "student_name": item.student_name,
            "chapter_number": item.chapter_number,
            "chapter_code": item.chapter_code,
            "chapter_title": item.chapter_title,
            "quiz_mode": item.quiz_mode,
            "total_questions": item.total_questions,
            "correct_answers": item.correct_answers,
            "wrong_answers": item.wrong_answers,
            "score": item.score,
            "answers": answers,
            "questions": questions,
            "created_at": str(
                item.created_at
            )
        }
    }


@app.delete("/api/quiz-results/{result_id}")
async def delete_quiz_result(
    result_id: int,
    db=Depends(get_db)
):

    if QuizResult is None:

        raise HTTPException(
            status_code=500,
            detail="Model QuizResult belum tersedia."
        )

    item = db.query(
        QuizResult
    ).filter(
        QuizResult.id == result_id
    ).first()

    if not item:

        raise HTTPException(
            status_code=404,
            detail="Data nilai tidak ditemukan."
        )

    db.delete(
        item
    )

    db.commit()

    return {
        "success": True,
        "message": "Data nilai berhasil dihapus."
    }


# =========================================================
# CAMERA CONFIG API
# =========================================================

class CameraConfigRequest(BaseModel):

    camera_name: str = "Kamera Kelas"
    camera_location: str = "Ruang Kelas"
    rtsp_url: str = ""
    speaker_mode: str = "pc"
    speaker_api_url: str = ""


def get_default_camera_config():

    return {
        "camera_name": "Kamera Kelas",
        "camera_location": "Ruang Kelas",
        "rtsp_url": "",
        "speaker_mode": "pc",
        "speaker_api_url": ""
    }


def load_camera_config():

    try:

        if not CAMERA_CONFIG_FILE.exists():

            return get_default_camera_config()

        with open(
            CAMERA_CONFIG_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(
                file
            )

        default = get_default_camera_config()

        default.update(
            data
        )

        return default

    except Exception as error:

        print(
            "LOAD CAMERA CONFIG ERROR:",
            error
        )

        return get_default_camera_config()


def save_camera_config_file(
    data
):

    with open(
        CAMERA_CONFIG_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=4
        )


@app.get("/api/camera/config")
async def get_camera_config():

    data = load_camera_config()

    return {
        "success": True,
        "data": data
    }


@app.post("/api/camera/config")
async def save_camera_config(
    data: CameraConfigRequest
):

    config = {
        "camera_name": data.camera_name,
        "camera_location": data.camera_location,
        "rtsp_url": data.rtsp_url,
        "speaker_mode": data.speaker_mode,
        "speaker_api_url": data.speaker_api_url
    }

    save_camera_config_file(
        config
    )

    return {
        "success": True,
        "message": "Setting kamera berhasil disimpan.",
        "data": config
    }


# =========================================================
# CAMERA STREAM STABLE
# FILE 15.2
# =========================================================

def make_camera_error_frame(
    message: str
):

    try:

        import cv2
        import numpy as np

        image = np.zeros(
            (
                540,
                960,
                3
            ),
            dtype=np.uint8
        )

        image[:] = (
            15,
            23,
            42
        )

        cv2.putText(
            image,
            "GURU AI JSKM - IP CAMERA",
            (
                40,
                80
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.1,
            (
                255,
                255,
                255
            ),
            2,
            cv2.LINE_AA
        )

        cv2.putText(
            image,
            message,
            (
                40,
                160
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.75,
            (
                0,
                220,
                255
            ),
            2,
            cv2.LINE_AA
        )

        cv2.putText(
            image,
            "Cek RTSP, password, koneksi kamera, atau tutup VLC/EZVIZ Studio.",
            (
                40,
                220
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (
                220,
                220,
                220
            ),
            2,
            cv2.LINE_AA
        )

        success, buffer = cv2.imencode(
            ".jpg",
            image
        )

        if success:

            return buffer.tobytes()

    except Exception as error:

        print(
            "MAKE CAMERA ERROR FRAME ERROR:",
            error
        )

    return b""


def open_camera_capture(
    rtsp_url: str
):

    import cv2

    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = (
        "rtsp_transport;tcp|"
        "stimeout;5000000|"
        "max_delay;5000000"
    )

    capture = cv2.VideoCapture(
        rtsp_url,
        cv2.CAP_FFMPEG
    )

    try:

        capture.set(
            cv2.CAP_PROP_BUFFERSIZE,
            1
        )

    except Exception:

        pass

    return capture


def generate_camera_frames(
    rtsp_url: str
):

    import cv2

    capture = None

    try:

        print(
            "MEMBUKA RTSP CAMERA:",
            rtsp_url
        )

        capture = open_camera_capture(
            rtsp_url
        )

        if not capture.isOpened():

            print(
                "CAMERA ERROR: RTSP tidak bisa dibuka."
            )

            error_frame = make_camera_error_frame(
                "Kamera tidak bisa dibuka."
            )

            while True:

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n"
                    + error_frame
                    + b"\r\n"
                )

                time.sleep(
                    1
                )

        failed_count = 0

        while True:

            success, frame = capture.read()

            if not success or frame is None:

                failed_count += 1

                print(
                    "CAMERA WARNING: gagal membaca frame",
                    failed_count
                )

                if failed_count >= 20:

                    try:

                        capture.release()

                    except Exception:

                        pass

                    time.sleep(
                        1
                    )

                    capture = open_camera_capture(
                        rtsp_url
                    )

                    failed_count = 0

                time.sleep(
                    0.1
                )

                continue

            failed_count = 0

            frame = cv2.resize(
                frame,
                (
                    960,
                    540
                )
            )

            success, buffer = cv2.imencode(
                ".jpg",
                frame,
                [
                    int(
                        cv2.IMWRITE_JPEG_QUALITY
                    ),
                    80
                ]
            )

            if not success:

                continue

            frame_bytes = buffer.tobytes()

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + frame_bytes
                + b"\r\n"
            )

            time.sleep(
                0.04
            )

    except Exception as error:

        print(
            "CAMERA STREAM ERROR:",
            error
        )

        error_frame = make_camera_error_frame(
            "Camera stream error."
        )

        while True:

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + error_frame
                + b"\r\n"
            )

            time.sleep(
                1
            )

    finally:

        try:

            if capture:

                capture.release()

        except Exception:

            pass


@app.get("/api/camera/stream")
async def camera_stream():

    config = load_camera_config()

    rtsp_url = str(
        config.get(
            "rtsp_url",
            ""
        )
    ).strip()

    if not rtsp_url:

        frame = make_camera_error_frame(
            "RTSP URL belum diisi."
        )

        return Response(
            content=frame,
            media_type="image/jpeg"
        )

    return StreamingResponse(
        generate_camera_frames(
            rtsp_url
        ),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


# =========================================================
# SMART CAMERA ACTIVITY DETECTION API
# FILE 14.9 / 15.2
# =========================================================

def analyze_camera_activity_from_rtsp(
    rtsp_url: str
):

    try:

        import cv2
        import numpy as np

        capture = open_camera_capture(
            rtsp_url
        )

        if not capture.isOpened():

            return {
                "success": False,
                "message": "RTSP kamera tidak bisa dibuka untuk analisa aktivitas.",
                "motion_percent": 0,
                "level": "error",
                "level_text": "Kamera tidak terbaca",
                "recommendation": "Pastikan kamera aktif, RTSP benar, dan tidak sedang dibatasi koneksinya."
            }

        previous_gray = None
        motion_values = []

        read_count = 0
        max_read = 12

        while read_count < max_read:

            success, frame = capture.read()

            if not success or frame is None:

                time.sleep(
                    0.15
                )

                read_count += 1

                continue

            frame = cv2.resize(
                frame,
                (
                    320,
                    180
                )
            )

            gray = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2GRAY
            )

            gray = cv2.GaussianBlur(
                gray,
                (
                    21,
                    21
                ),
                0
            )

            if previous_gray is not None:

                diff = cv2.absdiff(
                    previous_gray,
                    gray
                )

                threshold = cv2.threshold(
                    diff,
                    25,
                    255,
                    cv2.THRESH_BINARY
                )[1]

                changed_pixels = cv2.countNonZero(
                    threshold
                )

                total_pixels = 320 * 180

                motion_percent = (
                    changed_pixels / total_pixels
                ) * 100

                motion_values.append(
                    motion_percent
                )

            previous_gray = gray

            read_count += 1

            time.sleep(
                0.12
            )

        capture.release()

        if not motion_values:

            return {
                "success": False,
                "message": "Belum cukup data gerakan dari kamera.",
                "motion_percent": 0,
                "level": "unknown",
                "level_text": "Belum cukup data",
                "recommendation": "Coba analisa ulang beberapa detik lagi."
            }

        average_motion = sum(
            motion_values
        ) / len(
            motion_values
        )

        max_motion = max(
            motion_values
        )

        motion_percent = round(
            max(
                average_motion,
                max_motion * 0.65
            ),
            2
        )

        if motion_percent < 0.35:

            level = "tenang"
            level_text = "Kelas Tenang"
            recommendation = "Kondisi kelas terlihat tenang. Pembelajaran bisa dilanjutkan."

        elif motion_percent < 1.5:

            level = "normal"
            level_text = "Aktivitas Normal"
            recommendation = "Ada aktivitas ringan. Kondisi masih normal untuk pembelajaran."

        elif motion_percent < 4.5:

            level = "aktif"
            level_text = "Kelas Aktif"
            recommendation = "Aktivitas siswa cukup banyak. Pembimbing dapat mengingatkan siswa agar tetap fokus."

        else:

            level = "ramai"
            level_text = "Terlalu Banyak Aktivitas"
            recommendation = "Kelas terlihat terlalu ramai. Guru AI dapat memberi teguran umum agar siswa kembali fokus."

        return {
            "success": True,
            "message": "Analisa aktivitas kamera berhasil.",
            "motion_percent": motion_percent,
            "level": level,
            "level_text": level_text,
            "recommendation": recommendation
        }

    except Exception as error:

        print(
            "SMART CAMERA ACTIVITY ERROR:",
            error
        )

        return {
            "success": False,
            "message": str(
                error
            ),
            "motion_percent": 0,
            "level": "error",
            "level_text": "Error Analisa Kamera",
            "recommendation": "Terjadi error saat membaca aktivitas kamera."
        }


@app.get("/api/camera/activity")
async def camera_activity_detection():

    config = load_camera_config()

    rtsp_url = str(
        config.get(
            "rtsp_url",
            ""
        )
    ).strip()

    if not rtsp_url:

        return {
            "success": False,
            "message": "RTSP URL belum diisi.",
            "motion_percent": 0,
            "level": "empty",
            "level_text": "RTSP belum tersedia",
            "recommendation": "Buka Setting Kamera, isi RTSP kamera, lalu simpan."
        }

    result = analyze_camera_activity_from_rtsp(
        rtsp_url
    )

    return result


# =========================================================
# EZVIZ TALKBACK SPEAKER INTEGRATION API
# FILE 15.0 / 15.2
# =========================================================

class EzvizTalkbackConfigRequest(BaseModel):

    device_serial: str = ""
    verification_code: str = ""
    camera_no: int = 1
    talkback_mode: str = "pc"
    bridge_path: str = ""


class EzvizSpeakRequest(BaseModel):

    text: str = ""


def get_default_ezviz_talkback_config():

    return {
        "device_serial": "",
        "verification_code": "",
        "camera_no": 1,
        "talkback_mode": "pc",
        "bridge_path": ""
    }


def load_ezviz_talkback_config():

    try:

        if not EZVIZ_CONFIG_FILE.exists():

            return get_default_ezviz_talkback_config()

        with open(
            EZVIZ_CONFIG_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(
                file
            )

        default = get_default_ezviz_talkback_config()

        default.update(
            data
        )

        return default

    except Exception as error:

        print(
            "LOAD EZVIZ TALKBACK CONFIG ERROR:",
            error
        )

        return get_default_ezviz_talkback_config()


def save_ezviz_talkback_config_file(
    data
):

    with open(
        EZVIZ_CONFIG_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            ensure_ascii=False,
            indent=4
        )


@app.get("/api/ezviz/talkback/config")
async def get_ezviz_talkback_config():

    data = load_ezviz_talkback_config()

    return {
        "success": True,
        "data": data
    }


@app.post("/api/ezviz/talkback/config")
async def save_ezviz_talkback_config(
    data: EzvizTalkbackConfigRequest
):

    config = {
        "device_serial": data.device_serial,
        "verification_code": data.verification_code,
        "camera_no": data.camera_no,
        "talkback_mode": data.talkback_mode,
        "bridge_path": data.bridge_path
    }

    save_ezviz_talkback_config_file(
        config
    )

    return {
        "success": True,
        "message": "Setting EZVIZ Talkback berhasil disimpan.",
        "data": config
    }


@app.get("/api/ezviz/talkback/status")
async def get_ezviz_talkback_status():

    config = load_ezviz_talkback_config()

    mode = str(
        config.get(
            "talkback_mode",
            "pc"
        )
    ).strip()

    bridge_path = str(
        config.get(
            "bridge_path",
            ""
        )
    ).strip()

    if mode == "pc":

        return {
            "success": True,
            "mode": "pc",
            "ready": True,
            "message": "Mode speaker komputer aktif. Suara Guru AI keluar dari speaker komputer / TV / proyektor."
        }

    if mode == "ezviz_sdk":

        if not bridge_path:

            return {
                "success": False,
                "mode": "ezviz_sdk",
                "ready": False,
                "message": "Mode EZVIZ SDK dipilih, tetapi lokasi EZVIZ SDK Bridge belum diisi."
            }

        bridge_file = Path(
            bridge_path
        )

        if not bridge_file.exists():

            return {
                "success": False,
                "mode": "ezviz_sdk",
                "ready": False,
                "message": "File EZVIZ SDK Bridge tidak ditemukan: " + bridge_path
            }

        return {
            "success": True,
            "mode": "ezviz_sdk",
            "ready": True,
            "message": "EZVIZ SDK Bridge ditemukan. Sistem siap mengirim perintah talkback ke bridge."
        }

    return {
        "success": False,
        "mode": mode,
        "ready": False,
        "message": "Mode talkback tidak dikenali."
    }


@app.post("/api/ezviz/talkback/speak")
async def ezviz_talkback_speak(
    data: EzvizSpeakRequest
):

    config = load_ezviz_talkback_config()

    text = str(
        data.text or ""
    ).strip()

    if not text:

        return {
            "success": False,
            "mode": "empty",
            "message": "Teks suara masih kosong."
        }

    mode = str(
        config.get(
            "talkback_mode",
            "pc"
        )
    ).strip()

    if mode == "pc":

        return {
            "success": True,
            "mode": "pc",
            "speak_by_browser": True,
            "text": text,
            "message": "Gunakan browser speech synthesis untuk speaker komputer."
        }

    if mode == "ezviz_sdk":

        bridge_path = str(
            config.get(
                "bridge_path",
                ""
            )
        ).strip()

        device_serial = str(
            config.get(
                "device_serial",
                ""
            )
        ).strip()

        verification_code = str(
            config.get(
                "verification_code",
                ""
            )
        ).strip()

        camera_no = str(
            config.get(
                "camera_no",
                1
            )
        ).strip()

        if not bridge_path:

            return {
                "success": False,
                "mode": "ezviz_sdk",
                "message": "Bridge EZVIZ belum diisi. Untuk speaker kamera EZVIZ langsung, dibutuhkan EZVIZ SDK Bridge."
            }

        bridge_file = Path(
            bridge_path
        )

        if not bridge_file.exists():

            return {
                "success": False,
                "mode": "ezviz_sdk",
                "message": "Bridge EZVIZ tidak ditemukan: " + bridge_path
            }

        try:

            import subprocess

            result = subprocess.run(
                [
                    bridge_path,
                    "--device",
                    device_serial,
                    "--verify",
                    verification_code,
                    "--camera",
                    camera_no,
                    "--text",
                    text
                ],
                capture_output=True,
                text=True,
                timeout=20
            )

            if result.returncode == 0:

                return {
                    "success": True,
                    "mode": "ezviz_sdk",
                    "message": "Perintah talkback berhasil dikirim ke EZVIZ SDK Bridge.",
                    "output": result.stdout
                }

            return {
                "success": False,
                "mode": "ezviz_sdk",
                "message": "EZVIZ SDK Bridge mengembalikan error.",
                "output": result.stderr
            }

        except Exception as error:

            return {
                "success": False,
                "mode": "ezviz_sdk",
                "message": "Gagal menjalankan EZVIZ SDK Bridge: " + str(
                    error
                )
            }

    return {
        "success": False,
        "mode": mode,
        "message": "Mode talkback tidak dikenali."
    }

    # =========================================================
# EXPORT MODULE TO PDF API
# FILE 15.9
# GURU AI PDF / MODUL CETAK
# =========================================================

def clean_pdf_text(
    text
):

    import re

    value = str(
        text or ""
    )

    replacements = {
        "✅": "-",
        "❌": "-",
        "📌": "",
        "⚠️": "PERHATIAN:",
        "→": "->",
        "←": "<-",
        "“": "\"",
        "”": "\"",
        "‘": "'",
        "’": "'",
        "–": "-",
        "—": "-",
        "…": "...",
        "•": "-",
        "✓": "-",
        "✔": "-",
        "✕": "x",
        "×": "x",
        "\t": " "
    }

    for old, new in replacements.items():

        value = value.replace(
            old,
            new
        )

    value = re.sub(
        r"[^\x09\x0A\x0D\x20-\x7EÀ-ž]",
        "",
        value
    )

    value = value.replace(
        "\r\n",
        "\n"
    ).replace(
        "\r",
        "\n"
    )

    return value.strip()


def safe_pdf_filename(
    text
):

    import re

    value = str(
        text or "file"
    ).strip().lower()

    value = value.replace(
        " ",
        "_"
    )

    value = re.sub(
        r"[^a-zA-Z0-9_\-]",
        "",
        value
    )

    if not value:

        value = "file"

    return value


def add_pdf_paragraphs(
    story,
    text,
    styles,
    spacer_height=6
):

    from reportlab.platypus import Paragraph
    from reportlab.platypus import Spacer
    from xml.sax.saxutils import escape

    clean = clean_pdf_text(
        text
    )

    if not clean:

        return

    lines = clean.split(
        "\n"
    )

    for line in lines:

        line = line.strip()

        if not line:

            story.append(
                Spacer(
                    1,
                    spacer_height
                )
            )

            continue

        if line.isupper() and len(line) <= 80:

            story.append(
                Paragraph(
                    escape(line),
                    styles["Heading3"]
                )
            )

        elif line.startswith(
            (
                "1.",
                "2.",
                "3.",
                "4.",
                "5.",
                "6.",
                "7.",
                "8.",
                "9.",
                "10.",
                "- "
            )
        ):

            story.append(
                Paragraph(
                    escape(line),
                    styles["ListText"]
                )
            )

        else:

            story.append(
                Paragraph(
                    escape(line),
                    styles["BodyText"]
                )
            )


def create_module_pdf(
    major_code: str,
    chapter_value: str
):

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.lib import colors

    from reportlab.platypus import SimpleDocTemplate
    from reportlab.platypus import Paragraph
    from reportlab.platypus import Spacer
    from reportlab.platypus import PageBreak
    from reportlab.platypus import Table
    from reportlab.platypus import TableStyle

    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.styles import ParagraphStyle

    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.enums import TA_LEFT

    from datetime import datetime
    from xml.sax.saxutils import escape

    export_dir = BASE_DIR / "exports" / "pdf"

    export_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    major = normalize_major(
        major_code
    )

    if str(chapter_value).lower() == "all":

        chapters = get_chapters_by_major(
            major
        )

        export_mode = "all"

        export_title = "Semua BAB"

    else:

        try:

            chapter_number = int(
                chapter_value
            )

        except Exception:

            chapter_number = 1

        chapter = get_chapter_by_major(
            major,
            chapter_number
        )

        if not chapter:

            raise HTTPException(
                status_code=404,
                detail="BAB tidak ditemukan."
            )

        chapters = [
            chapter
        ]

        export_mode = "chapter"

        export_title = (
            str(
                chapter.get(
                    "code",
                    "BAB " + str(chapter_number)
                )
            )
            + " "
            + str(
                chapter.get(
                    "title",
                    ""
                )
            )
        )

    if not chapters:

        raise HTTPException(
            status_code=404,
            detail="Materi belum tersedia."
        )

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    file_name = (
        "guru_ai_"
        + safe_pdf_filename(major)
        + "_"
        + safe_pdf_filename(export_title)
        + "_"
        + timestamp
        + ".pdf"
    )

    output_path = export_dir / file_name

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=1.6 * cm,
        leftMargin=1.6 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm
    )

    base_styles = getSampleStyleSheet()

    styles = {}

    styles["Title"] = ParagraphStyle(
        "CustomTitle",
        parent=base_styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=28,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#111827"),
        spaceAfter=16
    )

    styles["SubTitle"] = ParagraphStyle(
        "CustomSubTitle",
        parent=base_styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#374151"),
        spaceAfter=12
    )

    styles["Heading1"] = ParagraphStyle(
        "CustomHeading1",
        parent=base_styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=17,
        leading=22,
        textColor=colors.HexColor("#1d4ed8"),
        spaceBefore=12,
        spaceAfter=8
    )

    styles["Heading2"] = ParagraphStyle(
        "CustomHeading2",
        parent=base_styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#111827"),
        spaceBefore=10,
        spaceAfter=6
    )

    styles["Heading3"] = ParagraphStyle(
        "CustomHeading3",
        parent=base_styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#1f2937"),
        spaceBefore=8,
        spaceAfter=4
    )

    styles["BodyText"] = ParagraphStyle(
        "CustomBody",
        parent=base_styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        alignment=TA_LEFT,
        textColor=colors.HexColor("#111827"),
        spaceAfter=5
    )

    styles["ListText"] = ParagraphStyle(
        "CustomList",
        parent=base_styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        leftIndent=12,
        textColor=colors.HexColor("#111827"),
        spaceAfter=4
    )

    styles["Small"] = ParagraphStyle(
        "CustomSmall",
        parent=base_styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#374151")
    )

    story = []

    # =====================================================
    # COVER
    # =====================================================

    story.append(
        Spacer(
            1,
            2.5 * cm
        )
    )

    story.append(
        Paragraph(
            "MODUL CETAK GURU AI JSKM",
            styles["Title"]
        )
    )

    story.append(
        Paragraph(
            escape(
                "Jurusan " + major
            ),
            styles["SubTitle"]
        )
    )

    story.append(
        Paragraph(
            escape(
                export_title
            ),
            styles["Title"]
        )
    )

    story.append(
        Spacer(
            1,
            1 * cm
        )
    )

    cover_data = [
        [
            "Aplikasi",
            "GURU AI JSKM"
        ],
        [
            "Mode",
            "Modul Cetak / PDF"
        ],
        [
            "Jurusan",
            major
        ],
        [
            "Materi",
            export_title
        ],
        [
            "Tanggal Export",
            datetime.now().strftime(
                "%d-%m-%Y %H:%M"
            )
        ]
    ]

    cover_table = Table(
        cover_data,
        colWidths=[
            5 * cm,
            9 * cm
        ]
    )

    cover_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#dbeafe")
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor("#111827")
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "FONTNAME",
                    (1, 0),
                    (1, -1),
                    "Helvetica"
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    10
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#94a3b8")
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(
        cover_table
    )

    story.append(
        Spacer(
            1,
            1 * cm
        )
    )

    story.append(
        Paragraph(
            "Modul ini disusun otomatis dari materi Guru AI. Guru atau pembimbing dapat mencetak PDF ini sebagai bahan ajar, latihan siswa, lembar kerja, dan evaluasi.",
            styles["SubTitle"]
        )
    )

    story.append(
        PageBreak()
    )

    # =====================================================
    # DAFTAR MATERI
    # =====================================================

    story.append(
        Paragraph(
            "DAFTAR MATERI",
            styles["Heading1"]
        )
    )

    toc_data = [
        [
            "No",
            "BAB / Submateri",
            "Estimasi"
        ]
    ]

    number = 1

    for chapter in chapters:

        chapter_code = str(
            chapter.get(
                "code",
                "BAB " + str(
                    chapter.get(
                        "chapter",
                        ""
                    )
                )
            )
        )

        chapter_title = str(
            chapter.get(
                "title",
                ""
            )
        )

        toc_data.append(
            [
                str(number),
                chapter_code + " - " + chapter_title,
                "-"
            ]
        )

        sections = chapter.get(
            "sections",
            []
        )

        if isinstance(
            sections,
            list
        ):

            for section in sections:

                section_code = str(
                    section.get(
                        "code",
                        ""
                    )
                )

                section_title = str(
                    section.get(
                        "title",
                        ""
                    )
                )

                estimated = str(
                    section.get(
                        "guru_ai",
                        {}
                    ).get(
                        "estimated_minutes",
                        ""
                    )
                )

                if estimated:

                    estimated = estimated + " menit"

                toc_data.append(
                    [
                        "",
                        section_code + " " + section_title,
                        estimated
                    ]
                )

        number += 1

    toc_table = Table(
        toc_data,
        colWidths=[
            1.5 * cm,
            12 * cm,
            3 * cm
        ],
        repeatRows=1
    )

    toc_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#1d4ed8")
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "FONTNAME",
                    (0, 1),
                    (-1, -1),
                    "Helvetica"
                ),
                (
                    "FONTSIZE",
                    (0, 0),
                    (-1, -1),
                    9
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    colors.HexColor("#cbd5e1")
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    6
                )
            ]
        )
    )

    story.append(
        toc_table
    )

    story.append(
        PageBreak()
    )

    # =====================================================
    # CONTENT
    # =====================================================

    for chapter_index, chapter in enumerate(chapters):

        chapter_code = str(
            chapter.get(
                "code",
                "BAB " + str(
                    chapter.get(
                        "chapter",
                        chapter_index + 1
                    )
                )
            )
        )

        chapter_title = str(
            chapter.get(
                "title",
                ""
            )
        )

        chapter_description = str(
            chapter.get(
                "description",
                ""
            )
        )

        story.append(
            Paragraph(
                escape(
                    chapter_code + " - " + chapter_title
                ),
                styles["Heading1"]
            )
        )

        if chapter_description:

            add_pdf_paragraphs(
                story,
                chapter_description,
                styles
            )

        sections = chapter.get(
            "sections",
            []
        )

        if not isinstance(
            sections,
            list
        ):

            sections = []

        if not sections:

            story.append(
                Paragraph(
                    "Submateri belum tersedia.",
                    styles["BodyText"]
                )
            )

        for section in sections:

            section_code = str(
                section.get(
                    "code",
                    ""
                )
            )

            section_title = str(
                section.get(
                    "title",
                    "Submateri"
                )
            )

            content = str(
                section.get(
                    "content",
                    ""
                )
            )

            story.append(
                Spacer(
                    1,
                    8
                )
            )

            story.append(
                Paragraph(
                    escape(
                        section_code + " " + section_title
                    ),
                    styles["Heading2"]
                )
            )

            add_pdf_paragraphs(
                story,
                content,
                styles
            )

        # =================================================
        # LEMBAR KERJA
        # =================================================

        story.append(
            PageBreak()
        )

        story.append(
            Paragraph(
                "LEMBAR KERJA SISWA",
                styles["Heading1"]
            )
        )

        story.append(
            Paragraph(
                escape(
                    chapter_code + " - " + chapter_title
                ),
                styles["Heading2"]
            )
        )

        worksheet_text = """
Identitas
1. Nama Siswa:
2. Kelas:
3. Jurusan:
4. Tanggal:
5. Materi BAB:

Bagian A - Pemahaman Materi
1. Jelaskan pengertian materi ini dengan bahasa sendiri.
2. Sebutkan 3 hal penting yang kamu pelajari.
3. Apa fungsi materi ini dalam pekerjaan nyata?
4. Berikan contoh penerapan materi ini.

Bagian B - Praktik
1. Tugas praktik apa yang kamu kerjakan?
2. Tools atau alat apa yang digunakan?
3. Bagaimana langkah pengerjaannya?
4. Apa hasil akhirnya?

Bagian C - Refleksi
1. Bagian mana yang paling mudah?
2. Bagian mana yang paling sulit?
3. Kesalahan apa yang terjadi?
4. Bagaimana cara memperbaikinya?
"""

        add_pdf_paragraphs(
            story,
            worksheet_text,
            styles
        )

        story.append(
            PageBreak()
        )

        # =================================================
        # RUBRIK
        # =================================================

        story.append(
            Paragraph(
                "RUBRIK PENILAIAN",
                styles["Heading1"]
            )
        )

        rubric_data = [
            [
                "Aspek",
                "Deskripsi",
                "Skor"
            ],
            [
                "Pemahaman konsep",
                "Siswa memahami pengertian, fungsi, dan tujuan materi.",
                "20"
            ],
            [
                "Proses kerja",
                "Siswa mengikuti langkah kerja dengan runtut dan benar.",
                "20"
            ],
            [
                "Hasil praktik",
                "Hasil sesuai instruksi dan menerapkan materi.",
                "25"
            ],
            [
                "Kerapian dan ketelitian",
                "Hasil kerja rapi, konsisten, dan minim kesalahan.",
                "15"
            ],
            [
                "Presentasi",
                "Siswa mampu menjelaskan hasil pekerjaannya.",
                "10"
            ],
            [
                "Sikap kerja",
                "Siswa disiplin, bertanggung jawab, dan menerima koreksi.",
                "10"
            ],
            [
                "TOTAL",
                "",
                "100"
            ]
        ]

        rubric_table = Table(
            rubric_data,
            colWidths=[
                4.2 * cm,
                9.2 * cm,
                2.2 * cm
            ],
            repeatRows=1
        )

        rubric_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#1d4ed8")
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),
                    (
                        "FONTNAME",
                        (0, 1),
                        (-1, -1),
                        "Helvetica"
                    ),
                    (
                        "FONTNAME",
                        (0, -1),
                        (-1, -1),
                        "Helvetica-Bold"
                    ),
                    (
                        "FONTSIZE",
                        (0, 0),
                        (-1, -1),
                        9
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.4,
                        colors.HexColor("#cbd5e1")
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP"
                    ),
                    (
                        "PADDING",
                        (0, 0),
                        (-1, -1),
                        6
                    )
                ]
            )
        )

        story.append(
            rubric_table
        )

        if chapter_index < len(chapters) - 1:

            story.append(
                PageBreak()
            )

    def add_page_number(
        canvas,
        doc
    ):

        canvas.saveState()

        canvas.setFont(
            "Helvetica",
            8
        )

        canvas.setFillColor(
            colors.HexColor("#64748b")
        )

        page_text = (
            "GURU AI JSKM - Modul Cetak | Halaman "
            + str(
                doc.page
            )
        )

        canvas.drawRightString(
            A4[0] - 1.6 * cm,
            1 * cm,
            page_text
        )

        canvas.restoreState()

    doc.build(
        story,
        onFirstPage=add_page_number,
        onLaterPages=add_page_number
    )

    return output_path


@app.get("/api/export/module-pdf")
async def export_module_pdf(
    major: str = "DKV",
    chapter: str = "1"
):

    try:

        output_path = create_module_pdf(
            major,
            chapter
        )

        return FileResponse(
            path=str(output_path),
            media_type="application/pdf",
            filename=output_path.name
        )

    except HTTPException:

        raise

    except Exception as error:

        print(
            "EXPORT PDF ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Gagal membuat PDF: " + str(error)
        )

# =========================================================
# ADMIN DASHBOARD API FIX
# FILE 17.1
# FIX 404 /api/admin/dashboard dan /api/admin/activities
# =========================================================

@app.get("/favicon.ico")
async def favicon_fix():
    return Response(status_code=204)


@app.get("/api/admin/dashboard")
async def api_admin_dashboard():
    db = SessionLocal()

    try:
        total_students = 0
        total_teachers = 0
        total_quiz_results = 0

        try:
            total_students = db.query(User).filter(User.role == "student").count()
        except Exception:
            total_students = 0

        try:
            total_teachers = db.query(User).filter(User.role == "teacher").count()
        except Exception:
            total_teachers = 0

        try:
            total_quiz_results = db.query(QuizResult).count()
        except Exception:
            total_quiz_results = 0

        try:
            dkv_chapters = get_chapters_by_major("DKV")
        except Exception:
            dkv_chapters = []

        try:
            tkj_chapters = get_chapters_by_major("TKJ")
        except Exception:
            tkj_chapters = []

        total_dkv_sections = 0
        total_tkj_sections = 0

        for chapter in dkv_chapters:
            sections = chapter.get("sections", [])
            if isinstance(sections, list):
                total_dkv_sections += len(sections)

        for chapter in tkj_chapters:
            sections = chapter.get("sections", [])
            if isinstance(sections, list):
                total_tkj_sections += len(sections)

        return {
            "success": True,
            "app_name": "GURU AI JSKM",
            "summary": {
                "total_students": total_students,
                "total_teachers": total_teachers,
                "total_quiz_results": total_quiz_results,
                "total_majors": 2,
                "total_dkv_chapters": len(dkv_chapters),
                "total_tkj_chapters": len(tkj_chapters),
                "total_dkv_sections": total_dkv_sections,
                "total_tkj_sections": total_tkj_sections,
                "total_chapters": len(dkv_chapters) + len(tkj_chapters),
                "total_sections": total_dkv_sections + total_tkj_sections
            },
            "cards": [
                {
                    "title": "Data Siswa",
                    "value": total_students,
                    "icon": "👨‍🎓"
                },
                {
                    "title": "Data Guru",
                    "value": total_teachers,
                    "icon": "👨‍🏫"
                },
                {
                    "title": "Total BAB",
                    "value": len(dkv_chapters) + len(tkj_chapters),
                    "icon": "📚"
                },
                {
                    "title": "Hasil Quiz",
                    "value": total_quiz_results,
                    "icon": "📝"
                }
            ]
        }

    finally:
        db.close()


@app.get("/api/admin/activities")
async def api_admin_activities():
    db = SessionLocal()

    try:
        activities = []

        try:
            latest_quiz = (
                db.query(QuizResult)
                .order_by(QuizResult.id.desc())
                .limit(5)
                .all()
            )

            for item in latest_quiz:
                activities.append(
                    {
                        "type": "quiz",
                        "icon": "📝",
                        "title": "Quiz selesai",
                        "description": f"{item.student_name or 'Siswa'} menyelesaikan {item.chapter_code or 'materi'} dengan nilai {item.score or 0}.",
                        "time": str(item.created_at) if item.created_at else "-"
                    }
                )

        except Exception:
            pass

        if not activities:
            activities = [
                {
                    "type": "system",
                    "icon": "✅",
                    "title": "Sistem aktif",
                    "description": "GURU AI JSKM berhasil berjalan dan siap digunakan.",
                    "time": "-"
                },
                {
                    "type": "module",
                    "icon": "📚",
                    "title": "Modul tersedia",
                    "description": "Modul DKV dan TKJ sudah tersedia untuk Guru AI.",
                    "time": "-"
                },
                {
                    "type": "online",
                    "icon": "🌐",
                    "title": "Mode akses jaringan",
                    "description": "Aplikasi dapat diakses melalui LAN atau Tailscale jika server aktif.",
                    "time": "-"
                }
            ]

        return {
            "success": True,
            "activities": activities
        }

    finally:
        db.close()
# =========================================================
# INCLUDE ROUTERS
# =========================================================

if auth_router:

    app.include_router(
        auth_router
    )


if admin_router:

    app.include_router(
        admin_router
    )

# =========================================================
# BOOKMARKS & PROGRESS CONVENIENCE ALIASES
# =========================================================

@app.get("/api/bookmarks")
async def api_global_get_bookmarks(major: Optional[str] = None, db = Depends(get_db)):
    from backend.routers.admin import get_bookmarks
    return await get_bookmarks(major, db)

@app.post("/api/bookmarks")
async def api_global_add_bookmark(data: dict, db = Depends(get_db)):
    from backend.routers.admin import add_bookmark, BookmarkCreateRequest
    req = BookmarkCreateRequest(**data)
    return await add_bookmark(req, db)

@app.delete("/api/bookmarks/{bookmark_id}")
async def api_global_delete_bookmark(bookmark_id: int, db = Depends(get_db)):
    from backend.routers.admin import delete_bookmark
    return await delete_bookmark(bookmark_id, db)

@app.post("/api/progress")
async def api_global_record_progress(data: dict, db = Depends(get_db)):
    from backend.routers.admin import record_progress, ProgressRecordRequest
    req = ProgressRecordRequest(**data)
    return await record_progress(req, db)
