# =========================================================
# GURU AI JSKM
# MODULE SERVICE
# FILE 11.8.4
# GURU AI PEMBIMBING PKL DKV - GENERATIVE STYLE
# =========================================================

import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv


# =========================================================
# OPTIONAL OPENAI IMPORT
# =========================================================

try:

    from openai import OpenAI

except Exception:

    OpenAI = None


# =========================================================
# LOAD ENV
# =========================================================

load_dotenv()


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODULE_FILE = (
    BASE_DIR
    / "modules"
    / "modul_dkv_lengkap.json"
)


# =========================================================
# MODULE SERVICE
# =========================================================

class ModuleService:

    def __init__(self):

        self.modules = self.load_modules()

        self.openai_api_key = os.getenv(
            "OPENAI_API_KEY",
            ""
        )

        self.model = os.getenv(
            "OPENAI_MODEL",
            "gpt-4o-mini"
        )

        self.client = None

        if OpenAI and self.openai_api_key:

            try:

                self.client = OpenAI(
                    api_key=self.openai_api_key
                )

            except Exception as e:

                print(
                    "OpenAI client gagal dibuat:",
                    e
                )

                self.client = None


    # =====================================================
    # LOAD MODULES
    # =====================================================

    def load_modules(self):

        try:

            if not MODULE_FILE.exists():

                return {
                    "module": {},
                    "chapters": []
                }

            with open(
                MODULE_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                return json.load(file)

        except Exception as e:

            print(
                "Gagal memuat modul:",
                e
            )

            return {
                "module": {},
                "chapters": []
            }


    # =====================================================
    # ANSWER
    # =====================================================

    def answer(
        self,
        question: str
    ):

        question = str(
            question or ""
        ).strip()

        if not question:

            return {
                "answer":
                    "Silakan tuliskan pertanyaan terlebih dahulu. "
                    "Saya siap membantu menjelaskan materi DKV seperti guru pembimbing PKL."
            }

        lower_question = question.lower()


        # =================================================
        # SAPAAN
        # =================================================

        if self.is_greeting(
            lower_question
        ):

            return {
                "answer":
                    "Halo! 👋\n\n"
                    "Saya Guru AI DKV. Saya akan membantu siswa PKL DKV memahami materi "
                    "seperti guru pembimbing di kelas.\n\n"
                    "Kamu bisa bertanya tentang:\n"
                    "1. Personal Branding\n"
                    "2. Portofolio Digital\n"
                    "3. UI/UX Design\n"
                    "4. Adobe Photoshop\n"
                    "5. Adobe Illustrator\n"
                    "6. After Effects\n"
                    "7. AI untuk Produktivitas\n"
                    "8. Proyek Akhir / PKL\n\n"
                    "Contoh:\n"
                    "\"Jelaskan personal branding untuk siswa PKL DKV seperti guru.\""
            }


        # =================================================
        # BLOKIR DI LUAR DKV
        # =================================================

        if self.is_outside_dkv_question(
            lower_question
        ):

            return {
                "answer":
                    self.outside_dkv_answer()
            }


        # =================================================
        # AMBIL KONTEKS MATERI
        # =================================================

        context = self.build_context(
            question
        )


        # =================================================
        # JAWAB DENGAN OPENAI JIKA ADA
        # =================================================

        if self.client:

            try:

                answer = self.answer_with_openai(
                    question,
                    context
                )

                return {
                    "answer": answer
                }

            except Exception as e:

                print(
                    "OpenAI answer error:",
                    e
                )


        # =================================================
        # FALLBACK LOKAL
        # =================================================

        return {
            "answer":
                self.local_teacher_answer(
                    question,
                    context
                )
        }


    # =====================================================
    # ANSWER WITH OPENAI
    # =====================================================

    def answer_with_openai(
        self,
        question,
        context
    ):

        system_prompt = """
Anda adalah Guru AI DKV untuk siswa PKL Desain Komunikasi Visual.

Peran Anda:
- Berbicara seperti guru pembimbing PKL.
- Menjelaskan materi dengan bahasa Indonesia yang jelas, ramah, bertahap, dan mudah dipahami.
- Menjabarkan materi secara lengkap, bukan jawaban pendek.
- Memberikan contoh penerapan di dunia PKL DKV.
- Memberikan latihan kecil atau tugas praktik.
- Mengajak siswa berpikir dengan pertanyaan lanjutan.
- Menjawab hanya materi yang berhubungan dengan DKV, desain, branding, portofolio, UI/UX, software desain, AI produktivitas, dan PKL DKV.
- Jika pertanyaan di luar DKV, jawab bahwa materi tersebut di luar modul DKV.

Format jawaban:
1. Pembukaan singkat seperti guru.
2. Penjelasan materi.
3. Contoh penerapan untuk siswa PKL DKV.
4. Kesimpulan.
5. Pertanyaan balik untuk siswa.
"""

        user_prompt = f"""
Pertanyaan siswa:
{question}

Konteks dari modul DKV:
{context}

Jawablah seperti guru pembimbing PKL DKV.
Jangan hanya menyalin modul mentah.
Jelaskan ulang dengan bahasa guru yang mudah dipahami siswa.
"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.6,
            max_tokens=1600
        )

        return (
            response
            .choices[0]
            .message
            .content
            .strip()
        )


    # =====================================================
    # LOCAL FALLBACK
    # =====================================================

    def local_teacher_answer(
        self,
        question,
        context
    ):

        if not context.strip():

            return self.outside_dkv_answer()

        return (
            "Baik, saya jelaskan seperti guru pembimbing PKL DKV.\n\n"
            "Materi yang sesuai dengan pertanyaan kamu adalah:\n\n"
            f"{context}\n\n"
            "Penjelasan Guru:\n"
            "Materi ini perlu dipahami bukan hanya sebagai teori, tetapi juga sebagai bekal praktik "
            "saat siswa PKL membuat karya desain seperti poster, logo, konten media sosial, "
            "portofolio, layout, UI/UX, atau branding.\n\n"
            "Contoh penerapan:\n"
            "Saat siswa mendapatkan tugas desain dari pembimbing atau klien, siswa perlu memahami "
            "konsep, tujuan desain, target audiens, pemilihan warna, tipografi, layout, dan hasil akhir "
            "agar karya terlihat profesional.\n\n"
            "Kesimpulan:\n"
            "Materi ini membantu siswa DKV bekerja lebih terarah, kreatif, dan siap menghadapi dunia industri.\n\n"
            "Pertanyaan untuk kamu:\n"
            "Bagian mana yang ingin kamu bahas lebih dalam?"
        )


    # =====================================================
    # BUILD CONTEXT
    # =====================================================

    def build_context(
        self,
        question
    ):

        lower_question = question.lower()

        chapter_number = self.extract_chapter_number(
            lower_question
        )

        if chapter_number:

            chapter = self.get_chapter(
                chapter_number
            )

            if chapter:

                return self.chapter_context(
                    chapter
                )


        if self.is_chapter_list_question(
            lower_question
        ):

            return self.chapter_list_context()


        sections = self.search_sections(
            question
        )

        if not sections:

            return self.module_overview_context()

        context_parts = []

        for item in sections[:5]:

            chapter = item["chapter"]

            section = item["section"]

            part = (
                f"{chapter.get('code', '-')}"
                f" - {chapter.get('title', '-')}\n"
                f"{section.get('id', '-')}"
                f" - {section.get('title', '-')}\n"
                f"{self.limit_text(section.get('content', ''), 1200)}"
            )

            context_parts.append(
                part
            )

        return "\n\n---\n\n".join(
            context_parts
        )


    # =====================================================
    # CHAPTER CONTEXT
    # =====================================================

    def chapter_context(
        self,
        chapter
    ):

        code = chapter.get(
            "code",
            "-"
        )

        title = chapter.get(
            "title",
            "-"
        )

        sections = chapter.get(
            "sections",
            []
        )

        text = (
            f"{code} - {title}\n\n"
        )

        text += (
            "Daftar submateri:\n"
        )

        for section in sections:

            text += (
                f"- {section.get('id', '-')}"
                f" {section.get('title', '-')}\n"
            )

        text += "\nIsi materi utama:\n\n"

        for section in sections[:8]:

            text += (
                f"{section.get('id', '-')}"
                f" - {section.get('title', '-')}\n"
                f"{self.limit_text(section.get('content', ''), 900)}\n\n"
            )

        return text


    # =====================================================
    # MODULE OVERVIEW CONTEXT
    # =====================================================

    def module_overview_context(self):

        chapters = self.get_chapters()

        text = (
            "Modul GURU AI JSKM berisi BAB berikut:\n\n"
        )

        for chapter in chapters:

            text += (
                f"{chapter.get('code', '-')}"
                f" - {chapter.get('title', '-')}\n"
            )

        return text


    # =====================================================
    # CHAPTER LIST CONTEXT
    # =====================================================

    def chapter_list_context(self):

        chapters = self.get_chapters()

        text = (
            "Daftar BAB dalam modul DKV:\n\n"
        )

        for chapter in chapters:

            sections = chapter.get(
                "sections",
                []
            )

            text += (
                f"{chapter.get('code', '-')}"
                f" - {chapter.get('title', '-')}"
                f" ({len(sections)} submateri)\n"
            )

        return text


    # =====================================================
    # SEARCH SECTIONS
    # =====================================================

    def search_sections(
        self,
        question
    ):

        text = question.lower()

        words = self.extract_keywords(
            text
        )

        if not words:

            return []

        results = []

        for chapter in self.get_chapters():

            chapter_title = str(
                chapter.get(
                    "title",
                    ""
                )
            ).lower()

            for section in chapter.get(
                "sections",
                []
            ):

                title = str(
                    section.get(
                        "title",
                        ""
                    )
                ).lower()

                content = str(
                    section.get(
                        "content",
                        ""
                    )
                ).lower()

                combined = (
                    chapter_title
                    + " "
                    + title
                    + " "
                    + content
                )

                score = 0

                for word in words:

                    if word in title:

                        score += 8

                    if word in chapter_title:

                        score += 5

                    if word in content:

                        score += 1

                if text in combined:

                    score += 10

                if score >= 3:

                    results.append({

                        "score": score,

                        "chapter": chapter,

                        "section": section

                    })

        results.sort(
            key=lambda item: item["score"],
            reverse=True
        )

        return results


    # =====================================================
    # EXTRACT KEYWORDS
    # =====================================================

    def extract_keywords(
        self,
        text
    ):

        stopwords = {
            "apa",
            "itu",
            "adalah",
            "jelaskan",
            "penjelasan",
            "tentang",
            "materi",
            "soal",
            "dalam",
            "yang",
            "dan",
            "di",
            "ke",
            "dengan",
            "secara",
            "buatkan",
            "contoh",
            "saya",
            "kamu",
            "bagaimana",
            "kenapa",
            "mengapa",
            "tolong",
            "dong",
            "kak",
            "min",
            "bang",
            "coba",
            "mohon",
            "full",
            "lengkap",
            "jabarkan",
            "jelasin",
            "seperti",
            "guru"
        }

        words = re.findall(
            r"[a-zA-Z0-9]+",
            text.lower()
        )

        return [
            word
            for word in words
            if word not in stopwords
            and len(word) > 2
        ]


    # =====================================================
    # OUTSIDE DKV CHECK
    # =====================================================

    def is_outside_dkv_question(
        self,
        text
    ):

        outside_keywords = [
            "pc",
            "komputer",
            "laptop",
            "hardware",
            "perangkat keras",
            "cpu",
            "processor",
            "prosesor",
            "ram",
            "ssd",
            "hdd",
            "vga",
            "gpu",
            "motherboard",
            "mainboard",
            "power supply",
            "psu",
            "bios",
            "windows",
            "printer",
            "jaringan",
            "router",
            "server",
            "mikrotik",
            "lan",
            "wifi",
            "internet",
            "instal ulang",
            "service laptop",
            "service komputer"
        ]

        dkv_keywords = [
            "dkv",
            "desain",
            "branding",
            "portofolio",
            "ui",
            "ux",
            "photoshop",
            "illustrator",
            "after effects",
            "layout",
            "poster",
            "logo",
            "tipografi",
            "warna",
            "visual",
            "grafis",
            "ilustrasi",
            "animasi",
            "video",
            "editing",
            "ai produktivitas",
            "proyek akhir",
            "pkl",
            "cv kreatif",
            "identitas visual",
            "personal branding"
        ]

        has_outside = any(
            self.contains_keyword(
                text,
                keyword
            )
            for keyword in outside_keywords
        )

        has_dkv = any(
            self.contains_keyword(
                text,
                keyword
            )
            for keyword in dkv_keywords
        )

        if has_outside and not has_dkv:

            return True

        return False


    # =====================================================
    # OUTSIDE DKV ANSWER
    # =====================================================

    def outside_dkv_answer(self):

        return (
            "Maaf, pertanyaan tersebut di luar materi DKV yang tersedia.\n\n"
            "Saya dibuat khusus sebagai Guru AI untuk siswa PKL DKV, jadi saya hanya menjawab materi "
            "yang berhubungan dengan Desain Komunikasi Visual.\n\n"
            "Silakan tanyakan materi seperti personal branding, portofolio digital, UI/UX, desain grafis, "
            "branding, layout, tipografi, warna, software desain, AI untuk produktivitas, atau proyek PKL DKV."
        )


    # =====================================================
    # CHAPTER LIST QUESTION CHECK
    # =====================================================

    def is_chapter_list_question(
        self,
        text
    ):

        keywords = [
            "daftar bab",
            "bab apa saja",
            "materi apa saja",
            "list bab",
            "daftar materi",
            "isi modul",
            "materi dkv apa saja"
        ]

        return any(
            keyword in text
            for keyword in keywords
        )


    # =====================================================
    # EXTRACT CHAPTER NUMBER
    # =====================================================

    def extract_chapter_number(
        self,
        text
    ):

        roman_map = {
            "i": 1,
            "ii": 2,
            "iii": 3,
            "iv": 4,
            "v": 5,
            "vi": 6,
            "vii": 7,
            "viii": 8,
            "ix": 9,
            "x": 10,
            "xi": 11,
            "xii": 12
        }

        match = re.search(
            r"bab\s+(\d+)",
            text
        )

        if match:

            return int(
                match.group(1)
            )

        match = re.search(
            r"bab\s+([ivx]+)",
            text
        )

        if match:

            roman = match.group(1).lower()

            return roman_map.get(
                roman
            )

        return None


    # =====================================================
    # GET CHAPTERS
    # =====================================================

    def get_chapters(self):

        chapters = self.modules.get(
            "chapters",
            []
        )

        if not isinstance(
            chapters,
            list
        ):

            return []

        return chapters


    # =====================================================
    # GET CHAPTER
    # =====================================================

    def get_chapter(
        self,
        number
    ):

        for chapter in self.get_chapters():

            if chapter.get(
                "chapter"
            ) == number:

                return chapter

        return None


    # =====================================================
    # GREETING CHECK
    # =====================================================

    def is_greeting(
        self,
        text
    ):

        greetings = [
            "halo",
            "hallo",
            "hai",
            "hi",
            "hello",
            "assalamualaikum",
            "pagi",
            "siang",
            "sore",
            "malam"
        ]

        text = text.strip().lower()

        return (
            text in greetings
            or (
                len(text) <= 20
                and any(
                    word in text
                    for word in greetings
                )
            )
        )


    # =====================================================
    # CONTAINS KEYWORD
    # =====================================================

    def contains_keyword(
        self,
        text,
        keyword
    ):

        keyword = keyword.lower()

        if " " in keyword:

            return keyword in text

        pattern = (
            r"\b"
            + re.escape(keyword)
            + r"\b"
        )

        return re.search(
            pattern,
            text
        ) is not None


    # =====================================================
    # LIMIT TEXT
    # =====================================================

    def limit_text(
        self,
        text,
        limit=1200
    ):

        text = str(
            text or ""
        ).strip()

        if len(text) <= limit:

            return text

        return (
            text[:limit]
            + "...\n\n"
            + "Materi masih panjang, jadi saya ambil bagian pentingnya dulu."
        )


# =========================================================
# INSTANCE
# =========================================================

module_service = ModuleService()