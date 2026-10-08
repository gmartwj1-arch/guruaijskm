from openai import OpenAI
from dotenv import load_dotenv
import os
import json
from pathlib import Path

load_dotenv()

# =====================================================
# OPENAI CLIENT
# =====================================================

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

MODEL = os.getenv("OPENAI_MODEL", "gpt-5.5")

# =====================================================
# LOAD MODUL DKV
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODULE_FILE = BASE_DIR / "modules" / "modul_dkv_lengkap.json"

MODULE_TEXT = ""

if MODULE_FILE.exists():

    with open(MODULE_FILE, "r", encoding="utf-8") as f:

        MODULE_TEXT = json.dumps(
            json.load(f),
            ensure_ascii=False
        )


# =====================================================
# SYSTEM PROMPT
# =====================================================

SYSTEM_PROMPT = f"""
Kamu adalah Guru AI SMK jurusan Desain Komunikasi Visual (DKV).

Tugasmu:

- Mengajar siswa SMK.
- Jawab menggunakan Bahasa Indonesia.
- Jelaskan dengan mudah dipahami.
- Berikan contoh.
- Bila pertanyaan sesuai modul gunakan modul.
- Bila tidak ada di modul gunakan pengetahuan umum.

MODUL:

{MODULE_TEXT}
"""


# =====================================================
# CHAT AI
# =====================================================

def ask_ai(question: str):

    response = client.responses.create(

        model=MODEL,

        input=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": question
            }
        ]
    )

    return response.output_text