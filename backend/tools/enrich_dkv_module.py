# =========================================================
# GURU AI JSKM
# FILE 15.8
# ENRICH DKV MODULE ALL CHAPTERS
# MEMPERKAYA ISI modules/modul_dkv_lengkap.json
# =========================================================

from pathlib import Path
from datetime import datetime
import json
import shutil


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODULE_FILE = BASE_DIR / "modules" / "modul_dkv_lengkap.json"

BACKUP_DIR = BASE_DIR / "modules" / "backup"


# =========================================================
# HELPER TEXT
# =========================================================

def safe_text(value, fallback=""):
    if value is None:
        return fallback

    text = str(value).strip()

    if not text:
        return fallback

    return text


def normalize_chapter_number(chapter, fallback):
    value = (
        chapter.get("chapter")
        or chapter.get("number")
        or chapter.get("bab")
        or chapter.get("id")
        or fallback
    )

    try:
        return int(value)
    except Exception:
        return fallback


def get_chapter_code(chapter, chapter_number):
    return safe_text(
        chapter.get("code") or chapter.get("kode"),
        "BAB " + str(chapter_number)
    )


def get_chapter_title(chapter, chapter_number):
    return safe_text(
        chapter.get("title") or chapter.get("judul") or chapter.get("name"),
        "Materi DKV BAB " + str(chapter_number)
    )


def get_section_title(section, fallback_number):
    if isinstance(section, str):
        return section

    return safe_text(
        section.get("title")
        or section.get("judul")
        or section.get("name")
        or section.get("sub_title")
        or section.get("subtitle"),
        "Submateri " + str(fallback_number)
    )


def get_section_content(section):
    if isinstance(section, str):
        return ""

    return safe_text(
        section.get("content")
        or section.get("materi")
        or section.get("description")
        or section.get("isi")
        or section.get("text")
        or section.get("body"),
        ""
    )


def get_sections(chapter):
    sections = (
        chapter.get("sections")
        or chapter.get("materi")
        or chapter.get("sub_materi")
        or chapter.get("items")
        or []
    )

    if not isinstance(sections, list):
        return []

    return sections


# =========================================================
# TOPIC CATEGORY
# =========================================================

def detect_topic_category(title, chapter_title):
    text = (title + " " + chapter_title).lower()

    if any(word in text for word in [
        "photoshop",
        "adobe photoshop",
        "auto layout",
        "layout feed",
        "layout story",
        "poster",
        "banner",
        "company profile",
        "layer",
        "workspace",
        "smart guides",
        "ruler",
        "guide",
        "grid"
    ]):
        return "photoshop_layout"

    if any(word in text for word in [
        "tipografi",
        "font",
        "huruf",
        "teks",
        "lettering"
    ]):
        return "typography"

    if any(word in text for word in [
        "warna",
        "color",
        "palet",
        "rgb",
        "cmyk",
        "gradient"
    ]):
        return "color"

    if any(word in text for word in [
        "logo",
        "branding",
        "brand",
        "identitas visual",
        "personal branding"
    ]):
        return "branding"

    if any(word in text for word in [
        "portofolio",
        "portfolio",
        "behance",
        "dribbble"
    ]):
        return "portfolio"

    if any(word in text for word in [
        "komposisi",
        "layout",
        "grid",
        "balance",
        "hierarki",
        "spacing"
    ]):
        return "composition"

    if any(word in text for word in [
        "ilustrasi",
        "illustration",
        "vektor",
        "vector",
        "digital painting"
    ]):
        return "illustration"

    if any(word in text for word in [
        "fotografi",
        "kamera",
        "foto",
        "lighting"
    ]):
        return "photography"

    if any(word in text for word in [
        "ui",
        "ux",
        "website",
        "aplikasi",
        "interface"
    ]):
        return "uiux"

    if any(word in text for word in [
        "cv",
        "curriculum vitae",
        "lamaran"
    ]):
        return "cv"

    return "general_dkv"


# =========================================================
# EXPLANATION TEMPLATE
# =========================================================

def build_topic_opening(section_title, chapter_title, category):
    if category == "photoshop_layout":
        return (
            f"{section_title} adalah bagian penting dalam penggunaan Adobe Photoshop "
            f"untuk membuat susunan desain yang rapi, terukur, dan siap digunakan pada media digital maupun cetak. "
            f"Dalam materi {chapter_title}, siswa tidak hanya mengenal fitur Photoshop, tetapi juga belajar "
            f"bagaimana mengatur objek, teks, gambar, layer, jarak, dan komposisi agar hasil desain terlihat profesional."
        )

    if category == "typography":
        return (
            f"{section_title} membahas penggunaan huruf dalam desain. Dalam DKV, huruf bukan hanya tulisan, "
            f"tetapi juga elemen visual yang dapat membentuk karakter desain, memperjelas informasi, "
            f"dan membantu audiens memahami pesan yang ingin disampaikan."
        )

    if category == "color":
        return (
            f"{section_title} membahas penggunaan warna dalam desain. Warna sangat penting karena dapat "
            f"membangun suasana, emosi, identitas visual, dan fokus perhatian audiens. "
            f"Pemilihan warna yang tepat membuat desain lebih menarik dan mudah dipahami."
        )

    if category == "branding":
        return (
            f"{section_title} berkaitan dengan pembentukan identitas dan citra visual. Dalam DKV, branding "
            f"digunakan agar seseorang, produk, usaha, atau perusahaan lebih mudah dikenali melalui logo, warna, "
            f"tipografi, gaya desain, dan konsistensi visual."
        )

    if category == "portfolio":
        return (
            f"{section_title} membahas cara menampilkan karya terbaik secara profesional. Portofolio sangat penting "
            f"bagi siswa DKV karena menjadi bukti kemampuan, proses kerja, gaya desain, dan kesiapan untuk magang, "
            f"freelance, atau bekerja di industri kreatif."
        )

    if category == "composition":
        return (
            f"{section_title} membahas cara menyusun elemen visual agar terlihat rapi, seimbang, dan mudah dipahami. "
            f"Komposisi yang baik membuat desain memiliki arah baca yang jelas dan pesan visual lebih kuat."
        )

    if category == "illustration":
        return (
            f"{section_title} membahas pembuatan gambar visual untuk menyampaikan ide, cerita, atau pesan. "
            f"Ilustrasi dalam DKV dapat digunakan pada poster, buku, media sosial, kemasan, maskot, dan konten digital."
        )

    if category == "photography":
        return (
            f"{section_title} membahas penggunaan foto sebagai media komunikasi visual. Fotografi dalam DKV "
            f"membantu memperkuat pesan desain melalui komposisi, pencahayaan, sudut pengambilan, dan editing gambar."
        )

    if category == "uiux":
        return (
            f"{section_title} membahas desain antarmuka dan pengalaman pengguna. Dalam DKV, UI/UX membantu siswa "
            f"memahami cara membuat tampilan aplikasi atau website yang menarik, mudah digunakan, dan sesuai kebutuhan pengguna."
        )

    if category == "cv":
        return (
            f"{section_title} membahas cara menyusun CV kreatif yang rapi, informatif, dan profesional. "
            f"CV kreatif penting bagi siswa DKV karena menjadi media untuk memperkenalkan kemampuan, pengalaman, "
            f"skill, dan portofolio."
        )

    return (
        f"{section_title} adalah bagian dari materi {chapter_title} yang perlu dipahami siswa DKV. "
        f"Materi ini membantu siswa memahami konsep desain, fungsi visual, proses kerja, dan penerapan dalam karya nyata."
    )


def build_function_text(section_title, category):
    if category == "photoshop_layout":
        return (
            "Fungsi materi ini adalah membantu siswa menggunakan Photoshop secara lebih terarah. "
            "Siswa belajar menata objek, mengatur layer, membuat layout, menggunakan bantuan grid atau guide, "
            "serta memastikan desain memiliki ukuran, jarak, dan komposisi yang konsisten."
        )

    if category == "typography":
        return (
            "Fungsinya adalah membantu siswa memilih dan mengatur huruf agar informasi mudah dibaca. "
            "Tipografi juga berfungsi membangun kesan visual, membedakan judul dan isi, serta menciptakan hierarki informasi."
        )

    if category == "color":
        return (
            "Fungsinya adalah memperkuat pesan desain, membangun suasana, menarik perhatian, dan memperjelas identitas visual. "
            "Warna juga dapat digunakan untuk membedakan informasi penting dan menciptakan kesatuan visual."
        )

    if category == "branding":
        return (
            "Fungsinya adalah membangun identitas yang mudah dikenali. Dengan branding yang baik, sebuah karya, produk, "
            "atau jasa akan terlihat lebih profesional, konsisten, dan dipercaya oleh audiens."
        )

    if category == "portfolio":
        return (
            "Fungsinya adalah menampilkan bukti kemampuan siswa. Portofolio membantu pembimbing, klien, atau perusahaan "
            "melihat kualitas karya, proses berpikir, dan perkembangan kemampuan desain siswa."
        )

    if category == "composition":
        return (
            "Fungsinya adalah membuat desain lebih tertata. Dengan komposisi yang baik, audiens dapat memahami informasi "
            "dengan cepat karena setiap elemen visual memiliki posisi dan peran yang jelas."
        )

    return (
        "Fungsi materi ini adalah membantu siswa memahami konsep utama, mengenal penerapannya, "
        "serta mampu menggunakannya dalam tugas praktik atau proyek desain."
    )


def build_example_text(section_title, category):
    if category == "photoshop_layout":
        return (
            "Contoh penerapannya adalah membuat layout feed Instagram promosi produk. "
            "Siswa menyiapkan ukuran kanvas, mengatur grid, memasukkan foto produk, menambahkan teks promo, "
            "menata layer, merapikan jarak antar elemen, lalu mengekspor hasil desain ke format PNG atau JPG."
        )

    if category == "typography":
        return (
            "Contohnya saat membuat poster acara sekolah. Judul dibuat besar dan tebal, subjudul dibuat lebih kecil, "
            "sedangkan informasi tanggal, lokasi, dan kontak dibuat rapi agar mudah dibaca."
        )

    if category == "color":
        return (
            "Contohnya saat membuat desain makanan pedas. Siswa dapat menggunakan warna merah dan kuning untuk memberi kesan "
            "berani, panas, dan menarik perhatian. Warna latar dan teks juga harus kontras agar informasi tetap terbaca."
        )

    if category == "branding":
        return (
            "Contohnya membuat identitas visual untuk UMKM. Siswa membuat logo, memilih warna utama, menentukan font, "
            "membuat template media sosial, dan menjaga gaya visual agar konsisten."
        )

    if category == "portfolio":
        return (
            "Contohnya siswa membuat portofolio digital berisi desain logo, poster, feed Instagram, kemasan, dan karya branding. "
            "Setiap karya diberi penjelasan tujuan, konsep, tools, dan proses pengerjaan."
        )

    if category == "composition":
        return (
            "Contohnya membuat poster promosi. Siswa menempatkan judul di area paling terlihat, gambar utama di tengah, "
            "dan informasi tambahan di bawah agar alur baca jelas."
        )

    return (
        "Contohnya siswa membuat karya desain sederhana sesuai tema, lalu menjelaskan tujuan, elemen visual, "
        "proses pengerjaan, dan alasan pemilihan desain."
    )


def build_practice_text(section_title, category):
    if category == "photoshop_layout":
        return (
            "Tugas praktik: siswa membuat satu desain layout menggunakan Adobe Photoshop. "
            "Langkahnya: buat dokumen baru, tentukan ukuran desain, aktifkan grid atau guide, susun gambar dan teks, "
            "atur layer, rapikan alignment, lalu ekspor hasil akhir. Setelah selesai, siswa menjelaskan konsep dan prosesnya."
        )

    if category == "typography":
        return (
            "Tugas praktik: siswa membuat poster sederhana dengan dua jenis font. "
            "Siswa harus menentukan judul utama, subjudul, isi informasi, ukuran huruf, dan jarak antar teks."
        )

    if category == "color":
        return (
            "Tugas praktik: siswa membuat palet warna untuk satu brand atau poster. "
            "Tentukan warna utama, warna pendukung, warna aksen, lalu terapkan pada desain sederhana."
        )

    if category == "branding":
        return (
            "Tugas praktik: siswa membuat identitas visual mini untuk sebuah usaha. "
            "Buat nama brand, logo sederhana, warna brand, pilihan font, dan contoh penerapan pada media sosial."
        )

    if category == "portfolio":
        return (
            "Tugas praktik: siswa memilih 5 karya terbaik, menyusun cover portofolio, menambahkan profil singkat, "
            "menjelaskan setiap karya, dan mencantumkan kontak atau link media sosial profesional."
        )

    return (
        "Tugas praktik: siswa membuat satu karya atau simulasi berdasarkan materi ini. "
        "Hasil praktik harus memiliki tujuan, proses, hasil akhir, dan evaluasi sederhana."
    )


def build_mistake_text(section_title, category):
    if category == "photoshop_layout":
        return (
            "Kesalahan umum: layer tidak diberi nama, objek tidak sejajar, ukuran desain salah, teks terlalu kecil, "
            "gambar pecah, warna kurang kontras, terlalu banyak elemen, dan file tidak disimpan dalam format yang benar."
        )

    if category == "typography":
        return (
            "Kesalahan umum: terlalu banyak font, font sulit dibaca, ukuran huruf tidak seimbang, jarak antar huruf terlalu rapat, "
            "dan tidak ada hierarki antara judul, subjudul, dan isi."
        )

    if category == "color":
        return (
            "Kesalahan umum: warna terlalu banyak, warna teks tidak kontras dengan latar, pemilihan warna tidak sesuai tema, "
            "dan tidak konsisten antara satu elemen dengan elemen lain."
        )

    if category == "branding":
        return (
            "Kesalahan umum: logo terlalu rumit, warna tidak konsisten, font berubah-ubah, tidak ada pedoman visual, "
            "dan identitas brand tidak sesuai dengan target audiens."
        )

    if category == "portfolio":
        return (
            "Kesalahan umum: memasukkan semua karya tanpa seleksi, tidak memberi penjelasan proyek, tampilan tidak rapi, "
            "file terlalu besar, dan kontak tidak dicantumkan."
        )

    return (
        "Kesalahan umum: mengerjakan tanpa konsep, meniru karya tanpa memahami tujuan, tidak memperhatikan kerapian, "
        "tidak mengecek hasil akhir, dan tidak bisa menjelaskan proses kerja."
    )


def build_tips_text(section_title, category):
    if category == "photoshop_layout":
        return (
            "Tips Guru AI: biasakan menggunakan layer dengan rapi, aktifkan guide atau grid, gunakan shortcut, "
            "cek ukuran kanvas sebelum mulai, dan simpan file kerja dalam format PSD sebelum mengekspor hasil akhir."
        )

    if category == "typography":
        return (
            "Tips Guru AI: gunakan maksimal dua sampai tiga font, pastikan teks mudah dibaca, buat judul lebih menonjol, "
            "dan cek desain dari layar HP untuk memastikan keterbacaan."
        )

    if category == "color":
        return (
            "Tips Guru AI: gunakan palet warna terbatas, perhatikan kontras, sesuaikan warna dengan target audiens, "
            "dan gunakan warna aksen hanya untuk informasi penting."
        )

    if category == "branding":
        return (
            "Tips Guru AI: buat logo sederhana, gunakan warna dan font secara konsisten, dan pastikan identitas visual "
            "bisa digunakan di berbagai media."
        )

    if category == "portfolio":
        return (
            "Tips Guru AI: pilih karya terbaik, susun dengan rapi, jelaskan proses dan tujuan desain, serta tampilkan kontak profesional."
        )

    return (
        "Tips Guru AI: pahami tujuan materi, buat konsep sebelum praktik, kerjakan secara bertahap, "
        "minta masukan pembimbing, lalu lakukan revisi agar hasil lebih baik."
    )


# =========================================================
# BUILD FULL CONTENT
# =========================================================

def build_full_section_content(section_title, old_content, chapter_title, chapter_code, section_code):
    category = detect_topic_category(section_title, chapter_title)

    opening = build_topic_opening(section_title, chapter_title, category)
    function_text = build_function_text(section_title, category)
    example_text = build_example_text(section_title, category)
    practice_text = build_practice_text(section_title, category)
    mistake_text = build_mistake_text(section_title, category)
    tips_text = build_tips_text(section_title, category)

    old_material = safe_text(old_content)

    if not old_material:
        old_material = (
            f"Materi {section_title} membahas konsep penting yang berkaitan dengan {chapter_title}. "
            f"Siswa perlu memahami pengertian, fungsi, contoh penerapan, dan praktik agar mampu menerapkan materi ini "
            f"dalam karya desain komunikasi visual."
        )

    content = f"""
{section_code} {section_title}

Pengertian
{opening}

Materi Utama
{old_material}

Fungsi dan Manfaat
{function_text}

Penjelasan Guru AI
Pada bagian ini Guru AI menjelaskan bahwa {section_title} tidak boleh dipahami hanya sebagai teori. 
Siswa perlu melihat hubungan antara konsep, proses kerja, dan hasil akhir. Dalam DKV, setiap keputusan desain harus memiliki alasan, misalnya alasan memilih warna, font, layout, gambar, ukuran, atau format file. 
Dengan memahami materi ini, siswa akan lebih mudah membuat karya yang rapi, komunikatif, dan sesuai kebutuhan.

Contoh Penerapan DKV
{example_text}

Langkah Praktik Siswa
{practice_text}

Checklist Praktik
1. Apakah tujuan desain sudah jelas?
2. Apakah ukuran dokumen atau media sudah sesuai?
3. Apakah elemen visual tersusun rapi?
4. Apakah teks mudah dibaca?
5. Apakah warna sudah sesuai dan kontras?
6. Apakah file kerja sudah disimpan?
7. Apakah hasil akhir sudah diekspor dengan format yang benar?

Kesalahan Umum
{mistake_text}

Tips Guru AI
{tips_text}

Pertanyaan Pemahaman
1. Jelaskan pengertian {section_title} dengan bahasa sendiri.
2. Apa fungsi utama dari materi ini?
3. Berikan satu contoh penerapan {section_title} dalam karya DKV.
4. Apa kesalahan yang harus dihindari?
5. Bagaimana cara menerapkan materi ini dalam tugas praktik?

Tugas Praktik
Buat satu karya atau latihan kecil yang menerapkan materi {section_title}. 
Tuliskan tujuan karya, konsep desain, tools yang digunakan, langkah pengerjaan, hasil akhir, dan evaluasi singkat.

Rangkuman
{section_title} adalah bagian penting dalam materi {chapter_title}. 
Siswa harus memahami konsep, fungsi, contoh penerapan, dan praktiknya agar mampu menghasilkan karya yang lebih profesional. 
Materi ini juga melatih siswa untuk berpikir terstruktur, bekerja rapi, dan mampu menjelaskan proses desain secara jelas.
""".strip()

    return content


def build_chapter_description(chapter_title, chapter_code, total_sections):
    return (
        f"{chapter_code} membahas materi {chapter_title} untuk siswa DKV. "
        f"Materi ini terdiri dari {total_sections} submateri yang dilengkapi penjelasan, contoh DKV, "
        f"praktik siswa, checklist, kesalahan umum, tips Guru AI, dan evaluasi pemahaman."
    )


def enrich_chapter(chapter, index):
    chapter_number = normalize_chapter_number(chapter, index + 1)

    chapter_code = get_chapter_code(chapter, chapter_number)

    chapter_title = get_chapter_title(chapter, chapter_number)

    sections = get_sections(chapter)

    enriched_sections = []

    for section_index, section in enumerate(sections):
        section_number = section_index + 1

        section_title = get_section_title(section, section_number)

        old_content = get_section_content(section)

        section_code = f"{chapter_number}.{section_number}"

        enriched_content = build_full_section_content(
            section_title=section_title,
            old_content=old_content,
            chapter_title=chapter_title,
            chapter_code=chapter_code,
            section_code=section_code
        )

        if isinstance(section, dict):
            new_section = dict(section)
        else:
            new_section = {}

        new_section["section"] = section_number
        new_section["code"] = section_code
        new_section["title"] = section_title
        new_section["content"] = enriched_content

        new_section["guru_ai"] = {
            "mode": "full_explanation",
            "estimated_minutes": estimate_minutes(enriched_content),
            "has_practice": True,
            "has_checklist": True,
            "has_reflection": True,
            "has_summary": True
        }

        enriched_sections.append(new_section)

    new_chapter = dict(chapter)

    new_chapter["chapter"] = chapter_number
    new_chapter["code"] = chapter_code
    new_chapter["title"] = chapter_title
    new_chapter["description"] = build_chapter_description(
        chapter_title,
        chapter_code,
        len(enriched_sections)
    )
    new_chapter["sections"] = enriched_sections
    new_chapter["total_sections"] = len(enriched_sections)

    new_chapter["guru_ai"] = {
        "mode": "complete_chapter",
        "estimated_minutes": sum(
            section.get("guru_ai", {}).get("estimated_minutes", 0)
            for section in enriched_sections
        ),
        "format": [
            "pengertian",
            "materi utama",
            "fungsi dan manfaat",
            "penjelasan guru ai",
            "contoh penerapan dkv",
            "langkah praktik siswa",
            "checklist praktik",
            "kesalahan umum",
            "tips guru ai",
            "pertanyaan pemahaman",
            "tugas praktik",
            "rangkuman"
        ]
    }

    return new_chapter


def estimate_minutes(text):
    words = len(str(text).split())

    minutes = round(words / 110)

    if minutes < 8:
        minutes = 8

    if minutes > 30:
        minutes = 30

    return minutes


# =========================================================
# MAIN
# =========================================================

def main():
    if not MODULE_FILE.exists():
        print("ERROR: File modul DKV tidak ditemukan:")
        print(MODULE_FILE)
        return

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    backup_file = BACKUP_DIR / f"modul_dkv_lengkap_backup_{timestamp}.json"

    shutil.copy2(MODULE_FILE, backup_file)

    print("Backup dibuat:")
    print(backup_file)

    with open(MODULE_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    if isinstance(data, list):
        module_info = {
            "major": "DKV",
            "title": "Modul DKV Lengkap",
            "version": "15.8"
        }
        chapters = data
    else:
        module_info = data.get("module", {})
        chapters = data.get("chapters", [])

    if not isinstance(chapters, list):
        print("ERROR: Format chapters tidak valid.")
        return

    enriched_chapters = []

    for index, chapter in enumerate(chapters):
        enriched_chapters.append(
            enrich_chapter(chapter, index)
        )

    module_info["major"] = "DKV"
    module_info["title"] = module_info.get("title") or "Modul DKV Lengkap"
    module_info["version"] = "15.8"
    module_info["guru_ai_mode"] = "full_explanation_all_chapters"
    module_info["updated_at"] = datetime.now().isoformat()

    result = {
        "module": module_info,
        "chapters": enriched_chapters
    }

    with open(MODULE_FILE, "w", encoding="utf-8") as file:
        json.dump(
            result,
            file,
            ensure_ascii=False,
            indent=2
        )

    total_sections = sum(
        len(chapter.get("sections", []))
        for chapter in enriched_chapters
    )

    total_minutes = sum(
        chapter.get("guru_ai", {}).get("estimated_minutes", 0)
        for chapter in enriched_chapters
    )

    print("SELESAI.")
    print("Modul DKV berhasil diperkaya.")
    print("Total BAB:", len(enriched_chapters))
    print("Total Submateri:", total_sections)
    print("Estimasi total menit:", total_minutes)
    print("File output:", MODULE_FILE)


if __name__ == "__main__":
    main()