# =========================================================
# GURU AI JSKM
# FILE 16.0
# ENRICH TKJ MODULE ALL CHAPTERS
# MEMPERKAYA ISI modules/modul_tkj_lengkap.json
# =========================================================

from pathlib import Path
from datetime import datetime
import json
import shutil


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODULE_FILE = BASE_DIR / "modules" / "modul_tkj_lengkap.json"

BACKUP_DIR = BASE_DIR / "modules" / "backup"


# =========================================================
# BASIC HELPER
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
        "Materi TKJ BAB " + str(chapter_number)
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


def estimate_minutes(text):
    words = len(str(text).split())

    minutes = round(words / 105)

    if minutes < 8:
        minutes = 8

    if minutes > 35:
        minutes = 35

    return minutes


# =========================================================
# DETECT TKJ CATEGORY
# =========================================================

def detect_topic_category(section_title, chapter_title):
    text = (section_title + " " + chapter_title).lower()

    if any(word in text for word in [
        "pkl",
        "pendahuluan",
        "tujuan pkl",
        "manfaat pkl",
        "latar belakang"
    ]):
        return "pkl_intro"

    if any(word in text for word in [
        "observasi",
        "lingkungan kerja",
        "struktur organisasi",
        "etika",
        "disiplin",
        "alur kerja",
        "service komputer"
    ]):
        return "work_environment"

    if any(word in text for word in [
        "profil perusahaan",
        "sejarah perusahaan",
        "visi",
        "misi",
        "motto",
        "bidang usaha"
    ]):
        return "company_profile"

    if any(word in text for word in [
        "relasi",
        "komunikasi pelanggan",
        "pelanggan",
        "customer",
        "kepercayaan",
        "kerja sama"
    ]):
        return "customer_relation"

    if any(word in text for word in [
        "komponen komputer",
        "hardware komputer",
        "processor",
        "cpu",
        "ram",
        "harddisk",
        "ssd",
        "motherboard",
        "power supply",
        "psu",
        "vga",
        "casing"
    ]):
        return "computer_hardware"

    if any(word in text for word in [
        "software",
        "driver",
        "bootable",
        "dual boot",
        "instalasi windows",
        "windows",
        "sistem operasi",
        "os"
    ]):
        return "software_os"

    if any(word in text for word in [
        "sop pembongkaran komputer",
        "pembongkaran komputer",
        "perakitan komputer",
        "rakitan",
        "bongkar komputer",
        "pasang komputer"
    ]):
        return "pc_assembly"

    if any(word in text for word in [
        "troubleshooting komputer",
        "komputer tidak tampil",
        "komputer mati",
        "blue screen",
        "lemot",
        "hang"
    ]):
        return "pc_troubleshooting"

    if any(word in text for word in [
        "komponen laptop",
        "hardware laptop",
        "sop pembongkaran laptop",
        "pembongkaran laptop",
        "troubleshooting laptop",
        "sparepart laptop",
        "keyboard laptop",
        "lcd",
        "baterai",
        "charger",
        "adaptor laptop"
    ]):
        return "laptop"

    if any(word in text for word in [
        "bios",
        "uefi",
        "boot menu",
        "boot laptop",
        "boot komputer",
        "setting boot"
    ]):
        return "bios_boot"

    if any(word in text for word in [
        "cloning",
        "backup",
        "backup data",
        "maintenance",
        "cleaning",
        "repasta",
        "thermal paste",
        "voltase adaptor"
    ]):
        return "maintenance_backup"

    if any(word in text for word in [
        "linux",
        "server",
        "ubuntu",
        "debian",
        "terminal",
        "ssh",
        "nas",
        "file server"
    ]):
        return "linux_server"

    if any(word in text for word in [
        "jaringan",
        "internet",
        "lan",
        "router",
        "ip address",
        "crimping",
        "kabel lan",
        "network",
        "wifi",
        "switch"
    ]):
        return "networking"

    if any(word in text for word in [
        "standar industri",
        "flowchart",
        "checklist teknisi",
        "form diagnosa",
        "tools teknisi",
        "estimasi biaya",
        "quality control",
        "qc",
        "sop teknisi"
    ]):
        return "industry_standard"

    if any(word in text for word in [
        "ai",
        "aplikasi dengan ai",
        "artificial intelligence",
        "antigravity",
        "cursor",
        "windsurf"
    ]):
        return "ai_app"

    if any(word in text for word in [
        "studi kasus",
        "kasus",
        "windows corrupt",
        "overheat",
        "tidak tampil"
    ]):
        return "case_study"

    return "general_tkj"


# =========================================================
# TEMPLATE TEXT
# =========================================================

def build_topic_opening(section_title, chapter_title, category):
    if category == "pkl_intro":
        return (
            f"{section_title} membahas dasar pelaksanaan Praktik Kerja Lapangan untuk siswa TKJ. "
            f"Materi ini penting agar siswa memahami tujuan PKL, manfaat PKL, serta hubungan antara pembelajaran di sekolah "
            f"dengan praktik kerja nyata di dunia industri."
        )

    if category == "work_environment":
        return (
            f"{section_title} membahas cara siswa mengenal lingkungan kerja, aturan perusahaan, alur kerja, "
            f"serta sikap profesional yang harus dimiliki selama PKL. Dalam dunia service komputer, siswa harus memahami "
            f"cara bekerja rapi, disiplin, dan mengikuti SOP."
        )

    if category == "company_profile":
        return (
            f"{section_title} menjelaskan profil perusahaan sebagai tempat siswa belajar dunia kerja. "
            f"Siswa perlu memahami sejarah, visi, misi, motto, dan bidang usaha perusahaan agar mengetahui arah kerja "
            f"serta standar pelayanan yang digunakan."
        )

    if category == "customer_relation":
        return (
            f"{section_title} membahas hubungan dan komunikasi dengan pelanggan, rekan kerja, dan pembimbing. "
            f"Teknisi tidak cukup hanya memiliki kemampuan teknis, tetapi juga harus mampu menjelaskan masalah perangkat "
            f"dengan bahasa yang sopan dan mudah dipahami."
        )

    if category == "computer_hardware":
        return (
            f"{section_title} membahas perangkat keras komputer. Dalam TKJ, siswa harus mengenal fungsi setiap komponen "
            f"seperti processor, RAM, storage, motherboard, PSU, VGA, casing, dan perangkat input-output. "
            f"Pemahaman ini menjadi dasar sebelum melakukan perakitan, perbaikan, atau troubleshooting."
        )

    if category == "software_os":
        return (
            f"{section_title} membahas perangkat lunak, sistem operasi, driver, bootable, dan instalasi Windows. "
            f"Materi ini penting karena banyak pekerjaan teknisi berkaitan dengan instal ulang, perbaikan sistem, "
            f"pemasangan driver, dan penanganan Windows error."
        )

    if category == "pc_assembly":
        return (
            f"{section_title} membahas pembongkaran, pemasangan, dan perakitan komputer. "
            f"Siswa harus memahami urutan kerja, keamanan listrik, posisi komponen, kabel power, kabel data, "
            f"serta cara memastikan komputer dapat menyala dengan normal setelah dirakit."
        )

    if category == "pc_troubleshooting":
        return (
            f"{section_title} membahas cara menganalisis dan menangani kerusakan komputer. "
            f"Troubleshooting dilakukan secara bertahap mulai dari pemeriksaan fisik, pengecekan power, RAM, storage, display, "
            f"sistem operasi, hingga pengujian akhir."
        )

    if category == "laptop":
        return (
            f"{section_title} membahas perangkat laptop, komponen internal, pembongkaran, penggantian sparepart, "
            f"dan troubleshooting. Laptop memiliki struktur lebih padat dibanding komputer desktop sehingga teknisi harus lebih teliti "
            f"dan hati-hati saat membongkar."
        )

    if category == "bios_boot":
        return (
            f"{section_title} membahas BIOS, UEFI, dan Boot Menu. Materi ini penting karena teknisi sering mengatur booting "
            f"saat instalasi sistem operasi, pengecekan storage, pengaturan mode UEFI/Legacy, atau memperbaiki perangkat yang tidak bisa masuk Windows."
        )

    if category == "maintenance_backup":
        return (
            f"{section_title} membahas perawatan perangkat, backup data, cloning, cleaning, repasta, dan pengecekan kondisi perangkat. "
            f"Maintenance membantu menjaga performa komputer atau laptop agar tetap stabil dan mengurangi risiko kerusakan."
        )

    if category == "linux_server":
        return (
            f"{section_title} membahas Linux, server, dan NAS. Materi ini membantu siswa TKJ memahami sistem operasi server, "
            f"pengelolaan file, jaringan, perintah dasar terminal, dan layanan server yang digunakan di dunia industri."
        )

    if category == "networking":
        return (
            f"{section_title} membahas jaringan komputer dan internet. Siswa perlu memahami IP address, kabel LAN, router, switch, "
            f"crimping, sharing jaringan, serta troubleshooting koneksi agar mampu menangani masalah jaringan di lapangan."
        )

    if category == "industry_standard":
        return (
            f"{section_title} membahas standar industri teknisi, seperti flowchart service, checklist teknisi, form diagnosa, "
            f"tools kerja, estimasi biaya, komunikasi pelanggan, dan quality control. Materi ini penting agar kerja teknisi lebih rapi, "
            f"terukur, dan profesional."
        )

    if category == "ai_app":
        return (
            f"{section_title} membahas penggunaan AI dalam pembuatan aplikasi dan produktivitas kerja. "
            f"Siswa TKJ perlu mengenal AI sebagai alat bantu belajar, membuat kode, menyusun dokumentasi, dan mempercepat proses pengembangan aplikasi."
        )

    if category == "case_study":
        return (
            f"{section_title} membahas studi kasus kerusakan yang sering terjadi di lapangan. "
            f"Siswa belajar menganalisis gejala, mencari kemungkinan penyebab, melakukan langkah pengecekan, menentukan solusi, "
            f"dan membuat kesimpulan teknis."
        )

    return (
        f"{section_title} adalah bagian dari materi {chapter_title} yang perlu dipahami siswa TKJ. "
        f"Materi ini membantu siswa memahami teori, prosedur kerja, alat, SOP, dan penerapan langsung di dunia service komputer."
    )


def build_function_text(section_title, category):
    if category == "computer_hardware":
        return (
            "Fungsinya adalah membantu siswa mengenali komponen komputer dan memahami hubungan antar komponen. "
            "Dengan pemahaman ini, siswa lebih mudah melakukan diagnosa saat komputer tidak menyala, tidak tampil, lemot, atau mengalami error hardware."
        )

    if category == "software_os":
        return (
            "Fungsinya adalah membantu siswa menangani masalah software dan sistem operasi. "
            "Siswa dapat melakukan instalasi Windows, memasang driver, membuat bootable, melakukan recovery, dan memperbaiki sistem yang bermasalah."
        )

    if category == "networking":
        return (
            "Fungsinya adalah membantu siswa memahami koneksi antar perangkat. "
            "Materi jaringan digunakan untuk memasang LAN, setting router, mengecek IP address, crimping kabel, dan memperbaiki koneksi internet."
        )

    if category == "laptop":
        return (
            "Fungsinya adalah membantu siswa memahami cara kerja laptop dan cara menangani kerusakan laptop secara hati-hati. "
            "Materi ini berguna untuk pekerjaan bongkar pasang, penggantian sparepart, cleaning, repasta, dan pengecekan kerusakan."
        )

    if category == "industry_standard":
        return (
            "Fungsinya adalah membuat pekerjaan teknisi lebih terarah dan profesional. "
            "Dengan standar industri, teknisi dapat bekerja berdasarkan alur, data diagnosa, checklist, estimasi biaya, dan quality control."
        )

    return (
        "Fungsi materi ini adalah membekali siswa dengan pengetahuan dan keterampilan praktik agar mampu bekerja sesuai SOP, "
        "menyelesaikan masalah teknis, dan menjelaskan hasil kerja secara profesional."
    )


def build_tools_text(category):
    if category == "computer_hardware":
        return (
            "Alat dan bahan yang digunakan: obeng set, kuas pembersih, blower, thermal paste, PSU tester jika ada, RAM cadangan, "
            "kabel SATA, monitor, keyboard, mouse, dan komputer uji."
        )

    if category == "software_os":
        return (
            "Alat dan bahan yang digunakan: flashdisk bootable, file ISO Windows/Linux, driver pack resmi, koneksi internet, "
            "software backup, aplikasi pengecekan storage, dan lisensi software jika diperlukan."
        )

    if category == "networking":
        return (
            "Alat dan bahan yang digunakan: kabel UTP, konektor RJ45, tang crimping, LAN tester, router, switch, access point, "
            "laptop teknisi, dan aplikasi pengecekan jaringan."
        )

    if category == "laptop":
        return (
            "Alat dan bahan yang digunakan: obeng presisi, pick pembuka casing, pinset, kuas, blower, thermal paste, multimeter, "
            "charger sesuai voltase, RAM/SSD cadangan, dan wadah baut."
        )

    if category == "maintenance_backup":
        return (
            "Alat dan bahan yang digunakan: flashdisk atau HDD eksternal untuk backup, software cloning, kuas, blower, thermal paste, "
            "aplikasi pengecek suhu, dan aplikasi pengecek kesehatan HDD/SSD."
        )

    if category == "linux_server":
        return (
            "Alat dan bahan yang digunakan: komputer/laptop server, media instalasi Linux, koneksi jaringan, kabel LAN, router/switch, "
            "terminal Linux, SSH client, dan dokumentasi konfigurasi."
        )

    return (
        "Alat dan bahan disesuaikan dengan pekerjaan, seperti obeng, flashdisk bootable, multimeter, LAN tester, kabel, software diagnosa, "
        "dan formulir pencatatan hasil kerja."
    )


def build_example_text(section_title, category):
    if category == "computer_hardware":
        return (
            "Contoh kasus: komputer pelanggan tidak tampil di monitor. Teknisi mengecek kabel power, monitor, RAM, VGA, dan motherboard. "
            "Jika RAM kotor, teknisi membersihkan pin RAM, memasang kembali, lalu melakukan testing."
        )

    if category == "software_os":
        return (
            "Contoh kasus: laptop tidak bisa masuk Windows. Teknisi mengecek kondisi storage, backup data jika memungkinkan, "
            "membuat bootable, melakukan instalasi Windows, memasang driver, lalu melakukan testing aplikasi dasar."
        )

    if category == "networking":
        return (
            "Contoh kasus: komputer kantor tidak bisa internet. Teknisi mengecek kabel LAN, IP address, koneksi router, hasil ping, "
            "dan konfigurasi jaringan sebelum menentukan solusi."
        )

    if category == "laptop":
        return (
            "Contoh kasus: laptop overheat dan mati sendiri. Teknisi membongkar laptop sesuai SOP, membersihkan kipas dan heatsink, "
            "mengganti thermal paste, lalu mengecek suhu setelah perakitan."
        )

    if category == "bios_boot":
        return (
            "Contoh kasus: flashdisk instalasi tidak terbaca saat boot. Teknisi masuk BIOS/UEFI, mengatur boot priority, "
            "menyesuaikan mode UEFI/Legacy, lalu mencoba boot ulang."
        )

    if category == "maintenance_backup":
        return (
            "Contoh kasus: pelanggan ingin ganti HDD ke SSD tanpa kehilangan data. Teknisi melakukan backup atau cloning, "
            "memasang SSD, melakukan testing booting, lalu memastikan data pelanggan tetap aman."
        )

    if category == "industry_standard":
        return (
            "Contoh kasus: unit service masuk dari pelanggan. Admin mencatat data, teknisi melakukan diagnosa, membuat estimasi, "
            "meminta persetujuan pelanggan, memperbaiki unit, melakukan QC, lalu menyerahkan kembali unit."
        )

    if category == "case_study":
        return (
            "Contoh kasus: perangkat mengalami gejala tertentu seperti tidak tampil, overheat, atau Windows corrupt. "
            "Siswa harus menganalisis gejala, kemungkinan penyebab, langkah pengecekan, solusi, dan hasil akhir."
        )

    return (
        "Contoh penerapan: siswa melakukan simulasi pekerjaan teknisi sesuai materi, mencatat alat yang digunakan, "
        "menjelaskan langkah kerja, dan menyimpulkan hasil pengecekan."
    )


def build_practice_text(section_title, category):
    if category == "computer_hardware":
        return (
            "Praktik siswa: identifikasi komponen komputer pada satu unit PC. Siswa menyebutkan nama komponen, fungsi, posisi, "
            "kabel yang terhubung, dan kemungkinan kerusakan yang sering terjadi pada komponen tersebut."
        )

    if category == "software_os":
        return (
            "Praktik siswa: membuat flashdisk bootable dan melakukan simulasi instalasi sistem operasi. "
            "Siswa mencatat langkah instalasi, driver yang dipasang, dan hasil testing setelah instalasi."
        )

    if category == "networking":
        return (
            "Praktik siswa: membuat kabel LAN straight, mengetes dengan LAN tester, menghubungkan komputer ke router, "
            "mengecek IP address, lalu melakukan ping untuk memastikan koneksi."
        )

    if category == "laptop":
        return (
            "Praktik siswa: mengamati proses pembongkaran laptop oleh pembimbing, mencatat posisi baut, komponen internal, "
            "dan SOP keselamatan. Jika sudah diizinkan, siswa membantu pekerjaan ringan seperti cleaning."
        )

    if category == "bios_boot":
        return (
            "Praktik siswa: masuk ke BIOS/UEFI, melihat informasi storage, RAM, boot priority, dan mencoba mengatur urutan boot "
            "menggunakan flashdisk bootable."
        )

    if category == "maintenance_backup":
        return (
            "Praktik siswa: melakukan backup data contoh, mengecek kesehatan storage, membersihkan perangkat, dan membuat laporan "
            "hasil maintenance."
        )

    if category == "linux_server":
        return (
            "Praktik siswa: instalasi Linux dasar, mencoba perintah terminal sederhana, membuat user, mengecek IP, dan mencoba koneksi SSH "
            "jika perangkat mendukung."
        )

    return (
        "Praktik siswa: lakukan simulasi kerja berdasarkan materi ini. Ikuti SOP, catat alat yang digunakan, dokumentasikan langkah kerja, "
        "lakukan testing, dan buat kesimpulan."
    )


def build_safety_text(category):
    if category in ["computer_hardware", "pc_assembly", "pc_troubleshooting"]:
        return (
            "Keselamatan kerja: matikan komputer sebelum membongkar, cabut kabel listrik, hindari menyentuh komponen dengan tangan basah, "
            "pegang komponen pada bagian tepi, dan jangan memaksa pemasangan komponen."
        )

    if category == "laptop":
        return (
            "Keselamatan kerja: gunakan obeng presisi, lepas baterai jika memungkinkan, simpan baut sesuai posisi, "
            "jangan menarik kabel fleksibel secara paksa, dan hindari tekanan berlebihan pada LCD atau motherboard."
        )

    if category == "networking":
        return (
            "Keselamatan kerja: rapikan kabel agar tidak mengganggu jalan, gunakan tang crimping dengan benar, "
            "pastikan perangkat jaringan tidak terkena air, dan hindari menarik kabel terlalu kuat."
        )

    if category == "software_os":
        return (
            "Keselamatan data: selalu tanyakan izin pelanggan sebelum instal ulang, backup data penting jika memungkinkan, "
            "jangan menghapus partisi sembarangan, dan pastikan sumber software aman."
        )

    return (
        "Keselamatan kerja: ikuti SOP, gunakan alat sesuai fungsi, jangan terburu-buru, catat kondisi awal perangkat, "
        "dan minta arahan pembimbing jika belum yakin."
    )


def build_mistake_text(section_title, category):
    if category == "computer_hardware":
        return (
            "Kesalahan umum: memasang RAM tidak rapat, salah memasang kabel power, lupa memasang kabel display, "
            "tidak mengecek PSU, dan langsung menyimpulkan motherboard rusak tanpa diagnosa bertahap."
        )

    if category == "software_os":
        return (
            "Kesalahan umum: instal ulang tanpa backup, salah memilih partisi, memakai driver tidak sesuai, "
            "tidak mengecek aktivasi atau update, dan tidak melakukan testing setelah instalasi."
        )

    if category == "networking":
        return (
            "Kesalahan umum: urutan kabel LAN salah, konektor kurang masuk, tidak mengetes kabel, IP address bentrok, "
            "dan langsung menyalahkan internet tanpa mengecek perangkat jaringan."
        )

    if category == "laptop":
        return (
            "Kesalahan umum: baut tercampur, kabel fleksibel putus, casing patah karena dibuka paksa, "
            "thermal paste terlalu banyak, dan lupa testing setelah perakitan."
        )

    if category == "maintenance_backup":
        return (
            "Kesalahan umum: tidak backup data, salah memilih drive saat cloning, tidak mengecek suhu setelah repasta, "
            "dan tidak membuat laporan hasil maintenance."
        )

    if category == "industry_standard":
        return (
            "Kesalahan umum: tidak mencatat keluhan pelanggan, tidak membuat estimasi, memperbaiki tanpa persetujuan, "
            "tidak melakukan QC, dan komunikasi ke pelanggan kurang jelas."
        )

    return (
        "Kesalahan umum: bekerja tanpa SOP, tidak mencatat hasil pengecekan, terburu-buru mengambil kesimpulan, "
        "tidak melakukan testing, dan tidak melaporkan hasil kerja kepada pembimbing."
    )


def build_tips_text(section_title, category):
    if category == "computer_hardware":
        return (
            "Tips Guru AI: lakukan diagnosa dari yang paling sederhana. Cek listrik, kabel, RAM, display, storage, dan komponen utama "
            "secara berurutan sebelum menyimpulkan kerusakan berat."
        )

    if category == "software_os":
        return (
            "Tips Guru AI: sebelum instal ulang, pastikan data pelanggan aman. Catat versi Windows, partisi, driver, dan aplikasi penting "
            "agar pekerjaan lebih rapi."
        )

    if category == "networking":
        return (
            "Tips Guru AI: gunakan metode berurutan. Cek kabel, cek lampu indikator, cek IP address, ping gateway, ping internet, "
            "baru cek konfigurasi router."
        )

    if category == "laptop":
        return (
            "Tips Guru AI: foto posisi baut dan kabel sebelum membongkar. Gunakan wadah baut agar tidak tertukar dan jangan memaksa membuka casing."
        )

    if category == "industry_standard":
        return (
            "Tips Guru AI: biasakan bekerja dengan catatan. Teknisi profesional tidak hanya bisa memperbaiki, tetapi juga mampu menjelaskan diagnosa, "
            "estimasi, solusi, dan hasil QC."
        )

    return (
        "Tips Guru AI: pahami gejala, lakukan pengecekan bertahap, gunakan alat dengan benar, catat hasil kerja, dan minta bimbingan saat menemukan kasus sulit."
    )


# =========================================================
# BUILD FULL CONTENT
# =========================================================

def build_full_section_content(section_title, old_content, chapter_title, chapter_code, section_code):
    category = detect_topic_category(section_title, chapter_title)

    opening = build_topic_opening(section_title, chapter_title, category)
    function_text = build_function_text(section_title, category)
    tools_text = build_tools_text(category)
    example_text = build_example_text(section_title, category)
    practice_text = build_practice_text(section_title, category)
    safety_text = build_safety_text(category)
    mistake_text = build_mistake_text(section_title, category)
    tips_text = build_tips_text(section_title, category)

    old_material = safe_text(old_content)

    if not old_material:
        old_material = (
            f"Materi {section_title} membahas konsep penting dalam bidang Teknik Komputer dan Jaringan. "
            f"Siswa perlu memahami pengertian, fungsi, alat yang digunakan, SOP kerja, dan contoh penerapan agar mampu "
            f"melakukan praktik secara aman dan profesional."
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
Pada bagian ini Guru AI menjelaskan bahwa {section_title} harus dipahami sebagai teori dan praktik. 
Siswa TKJ tidak cukup hanya mengetahui istilah, tetapi harus mampu memahami gejala, alat yang digunakan, langkah pengecekan, SOP kerja, dan cara membuat kesimpulan teknis. 
Dalam dunia service komputer, teknisi yang baik harus bekerja secara urut, teliti, aman, dan mampu menjelaskan hasil pekerjaannya kepada pembimbing atau pelanggan.

Alat dan Bahan
{tools_text}

Contoh Kasus di Lapangan
{example_text}

Langkah Praktik Siswa
{practice_text}

SOP Singkat
1. Baca dan pahami instruksi kerja.
2. Siapkan alat dan bahan yang diperlukan.
3. Catat kondisi awal perangkat atau masalah yang diamati.
4. Lakukan pengecekan dari langkah paling sederhana.
5. Gunakan alat sesuai fungsi.
6. Catat hasil pemeriksaan.
7. Tentukan kemungkinan penyebab masalah.
8. Lakukan tindakan perbaikan sesuai arahan pembimbing.
9. Lakukan testing setelah pekerjaan selesai.
10. Buat kesimpulan dan laporan singkat.

Checklist Teknisi
1. Apakah keluhan atau tujuan praktik sudah dicatat?
2. Apakah alat kerja sudah disiapkan?
3. Apakah perangkat sudah aman untuk diperiksa?
4. Apakah pengecekan dilakukan secara bertahap?
5. Apakah hasil pemeriksaan sudah dicatat?
6. Apakah solusi sudah sesuai dengan gejala?
7. Apakah perangkat sudah dites kembali?
8. Apakah hasil akhir sudah dilaporkan kepada pembimbing?

Keselamatan Kerja
{safety_text}

Kesalahan Umum
{mistake_text}

Tips Guru AI
{tips_text}

Pertanyaan Pemahaman
1. Jelaskan pengertian {section_title} dengan bahasa sendiri.
2. Apa fungsi utama materi ini dalam pekerjaan teknisi?
3. Alat apa saja yang digunakan pada materi ini?
4. Sebutkan contoh kasus yang berkaitan dengan materi ini.
5. Apa kesalahan yang harus dihindari?
6. Mengapa teknisi harus mengikuti SOP?
7. Bagaimana cara mengecek hasil pekerjaan setelah praktik?

Tugas Praktik
Buat simulasi praktik berdasarkan materi {section_title}. 
Tuliskan tujuan praktik, alat yang digunakan, langkah kerja, hasil pemeriksaan, kemungkinan penyebab masalah, solusi, dan kesimpulan akhir.

Format Laporan Singkat
1. Nama siswa:
2. Kelas:
3. Materi:
4. Alat yang digunakan:
5. Gejala atau tujuan praktik:
6. Langkah pengecekan:
7. Hasil pemeriksaan:
8. Solusi:
9. Kesimpulan:
10. Tanda tangan pembimbing:

Rangkuman
{section_title} adalah materi penting dalam {chapter_title}. 
Siswa harus memahami pengertian, fungsi, alat, SOP, keselamatan kerja, contoh kasus, dan langkah praktik. 
Dengan memahami materi ini, siswa akan lebih siap menghadapi pekerjaan teknisi di dunia industri dan mampu bekerja dengan lebih profesional.
""".strip()

    return content


def build_chapter_description(chapter_title, chapter_code, total_sections):
    return (
        f"{chapter_code} membahas materi {chapter_title} untuk siswa TKJ. "
        f"Materi ini terdiri dari {total_sections} submateri yang dilengkapi penjelasan Guru AI, contoh kasus teknisi, "
        f"langkah praktik siswa, SOP singkat, checklist teknisi, keselamatan kerja, kesalahan umum, tips, tugas praktik, dan rangkuman."
    )


def enrich_chapter(chapter, index):
    chapter_number = normalize_chapter_number(chapter, index + 1)

    chapter_code = get_chapter_code(chapter, chapter_number)

    chapter_title = get_chapter_title(chapter, chapter_number)

    sections = get_sections(chapter)

    # Kalau ada BAB yang belum punya submateri, buat 1 submateri otomatis
    if not sections:
        sections = [
            {
                "title": chapter_title,
                "content": safe_text(
                    chapter.get("description"),
                    f"Materi {chapter_title} perlu dipelajari sebagai bagian dari kompetensi TKJ."
                )
            }
        ]

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
            "mode": "full_explanation_tkj",
            "estimated_minutes": estimate_minutes(enriched_content),
            "has_practice": True,
            "has_sop": True,
            "has_checklist": True,
            "has_safety": True,
            "has_case_example": True,
            "has_report_format": True,
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
        "mode": "complete_tkj_chapter",
        "estimated_minutes": sum(
            section.get("guru_ai", {}).get("estimated_minutes", 0)
            for section in enriched_sections
        ),
        "format": [
            "pengertian",
            "materi utama",
            "fungsi dan manfaat",
            "penjelasan guru ai",
            "alat dan bahan",
            "contoh kasus di lapangan",
            "langkah praktik siswa",
            "sop singkat",
            "checklist teknisi",
            "keselamatan kerja",
            "kesalahan umum",
            "tips guru ai",
            "pertanyaan pemahaman",
            "tugas praktik",
            "format laporan singkat",
            "rangkuman"
        ]
    }

    return new_chapter


# =========================================================
# MAIN
# =========================================================

def main():
    if not MODULE_FILE.exists():
        print("ERROR: File modul TKJ tidak ditemukan:")
        print(MODULE_FILE)
        return

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    backup_file = BACKUP_DIR / f"modul_tkj_lengkap_backup_{timestamp}.json"

    shutil.copy2(MODULE_FILE, backup_file)

    print("Backup dibuat:")
    print(backup_file)

    with open(MODULE_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    if isinstance(data, list):
        module_info = {
            "major": "TKJ",
            "title": "Modul TKJ Lengkap",
            "version": "16.0"
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

    module_info["major"] = "TKJ"
    module_info["title"] = module_info.get("title") or "Modul TKJ Lengkap"
    module_info["version"] = "16.0"
    module_info["guru_ai_mode"] = "full_explanation_all_tkj_chapters"
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
    print("Modul TKJ berhasil diperkaya.")
    print("Total BAB:", len(enriched_chapters))
    print("Total Submateri:", total_sections)
    print("Estimasi total menit:", total_minutes)
    print("File output:", MODULE_FILE)


if __name__ == "__main__":
    main()