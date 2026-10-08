// =========================================================
// GURU AI JSKM
// GURU AI LAYOUT PLUS
// FILE 15.6
// LAYOUT LENGKAP SEPERTI GAMBAR PERTAMA
// =========================================================

console.log("Guru AI Layout Plus JS 15.6 Loaded");


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setupHeroControlButtons();

    setupExtraLearningTabs();

    startRealTimeClock();

    setTimeout(function () {

        refreshHeroLayout();

        renderLearningPack("tools");

    }, 1200);

    setInterval(function () {

        refreshHeroLayout();

    }, 2000);

});


// =========================================================
// HERO BUTTON PATCH
// =========================================================

function setupHeroControlButtons() {

    var heroStartButton = document.getElementById("heroStartButton");
    var heroPauseButton = document.getElementById("heroPauseButton");
    var heroRepeatButton = document.getElementById("heroRepeatButton");
    var heroStopButton = document.getElementById("heroStopButton");

    if (heroStartButton) {

        heroStartButton.onclick = function () {

            clickButtonById("startVoiceBtn");

        };

    }

    if (heroPauseButton) {

        heroPauseButton.onclick = function () {

            clickButtonById("pauseVoiceBtn");

        };

    }

    if (heroRepeatButton) {

        heroRepeatButton.onclick = function () {

            clickButtonById("repeatVoiceBtn");

        };

    }

    if (heroStopButton) {

        heroStopButton.onclick = function () {

            clickButtonById("stopVoiceBtn");

        };

    }

}


function clickButtonById(id) {

    var button = document.getElementById(id);

    if (button) {
        button.click();
    }

}


// =========================================================
// REAL TIME CLOCK
// =========================================================

function startRealTimeClock() {

    updateRealTimeClock();

    setInterval(function () {

        updateRealTimeClock();

    }, 1000);

}


function updateRealTimeClock() {

    var clock = document.getElementById("realTimeClock");

    if (!clock) {
        return;
    }

    var now = new Date();

    var hour = String(now.getHours()).padStart(2, "0");
    var minute = String(now.getMinutes()).padStart(2, "0");
    var second = String(now.getSeconds()).padStart(2, "0");

    clock.textContent = hour + ":" + minute + ":" + second;

}


// =========================================================
// REFRESH HERO
// =========================================================

function refreshHeroLayout() {

    var chapter = getLayoutActiveChapter();
    var major = getLayoutActiveMajor();

    var heroBadge = document.getElementById("heroGuruBadge");
    var heroTitle = document.getElementById("heroGuruTitle");
    var heroSubtitle = document.getElementById("heroGuruSubtitle");
    var estimate = document.getElementById("materialEstimate");

    if (!chapter) {

        if (heroBadge) {
            heroBadge.textContent = "AI GURU " + major + " • MATERI LENGKAP + PELATIHAN";
        }

        if (heroTitle) {
            heroTitle.textContent = "Guru AI JSKM";
        }

        if (heroSubtitle) {
            heroSubtitle.textContent = "Pilih jurusan dan BAB untuk menampilkan materi lengkap.";
        }

        if (estimate) {
            estimate.textContent = "00:00";
        }

        renderLearningOutcomes(null, major);

        return;

    }

    var code = getLayoutChapterCode(chapter);
    var title = getLayoutChapterTitle(chapter);
    var sections = getLayoutSections(chapter);

    if (heroBadge) {
        heroBadge.textContent = "AI GURU " + major + " • " + code + " LENGKAP + PELATIHAN";
    }

    if (heroTitle) {
        heroTitle.textContent = code + " — " + title;
    }

    if (heroSubtitle) {

        heroSubtitle.textContent =
            "Materi utama " +
            getSectionRangeText(sections) +
            " dimasukkan lengkap, ditambah pelatihan praktik, panduan tools, lembar kerja, shortcut, checklist, dan evaluasi.";

    }

    if (estimate) {

        var minuteEstimate = calculateEstimateMinutes(sections);

        estimate.textContent = minuteEstimate + ":00";

    }

    renderLearningOutcomes(chapter, major);

}


// =========================================================
// LEARNING OUTCOMES
// =========================================================

function renderLearningOutcomes(chapter, major) {

    var box = document.getElementById("learningOutcomesBox");

    if (!box) {
        return;
    }

    var title = "materi yang dipilih";

    if (chapter) {
        title = getLayoutChapterTitle(chapter);
    }

    var outcomes = [];

    if (major === "DKV") {

        outcomes = [
            "Memahami konsep " + title + " dalam industri kreatif.",
            "Mengenal istilah, tools, dan proses kerja yang berkaitan dengan materi.",
            "Mampu menerapkan materi dalam karya desain, latihan, atau proyek sederhana.",
            "Mampu menjelaskan alasan desain, proses kerja, dan hasil akhir kepada pembimbing.",
            "Mampu mengevaluasi kesalahan umum dan memperbaiki hasil karya.",
            "Mampu membuat latihan praktik sesuai standar pembelajaran DKV."
        ];

    } else {

        outcomes = [
            "Memahami konsep " + title + " dalam praktik kerja TKJ.",
            "Mengenal alat, prosedur, dan standar kerja teknisi.",
            "Mampu menerapkan materi dalam simulasi atau praktik lapangan.",
            "Mampu menjelaskan langkah kerja secara runtut.",
            "Mampu melakukan pengecekan dan evaluasi hasil kerja.",
            "Mampu bekerja sesuai SOP dan keselamatan kerja."
        ];

    }

    var html = "";

    outcomes.forEach(function (item) {

        html += `
            <div class="cp-item">
                ✓ ${escapeLayoutHtml(item)}
            </div>
        `;

    });

    box.innerHTML = html;

}


// =========================================================
// EXTRA TABS
// =========================================================

function setupExtraLearningTabs() {

    var buttons = document.querySelectorAll(".extra-tab-btn");

    buttons.forEach(function (button) {

        button.onclick = function () {

            buttons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            var tabName = button.getAttribute("data-extra-tab") || "tools";

            renderLearningPack(tabName);

        };

    });

}


function renderLearningPack(tabName) {

    if (tabName === "tools") {
        renderToolsGuide();
        return;
    }

    if (tabName === "pelatihan") {
        renderPracticeTraining();
        return;
    }

    if (tabName === "lembar") {
        renderWorksheet();
        return;
    }

    if (tabName === "shortcut") {
        renderShortcuts();
        return;
    }

    if (tabName === "rubrik") {
        renderRubric();
        return;
    }

    renderToolsGuide();

}


// =========================================================
// PANDUAN TOOLS
// =========================================================

function renderToolsGuide() {

    var box = document.getElementById("learningPackBox");

    if (!box) {
        return;
    }

    var chapter = getLayoutActiveChapter();
    var major = getLayoutActiveMajor();
    var title = chapter ? getLayoutChapterTitle(chapter) : "Materi";

    var html = `
        <h3>Panduan Tools — ${escapeLayoutHtml(title)}</h3>

        <p>
            Bagian ini membantu siswa memahami alat atau fitur yang digunakan saat praktik.
            Guru AI tidak hanya menjelaskan teori, tetapi juga mengarahkan siswa agar tahu
            bagian mana yang harus dicoba langsung.
        </p>
    `;

    if (major === "DKV") {

        html += `
            <h3>Tools DKV yang Disarankan</h3>

            <ol>
                <li><strong>Move Tool:</strong> memindahkan objek, teks, gambar, atau elemen desain.</li>
                <li><strong>Selection Tool:</strong> memilih area tertentu untuk diedit.</li>
                <li><strong>Crop Tool:</strong> memotong kanvas atau gambar agar komposisi lebih rapi.</li>
                <li><strong>Text Tool:</strong> membuat judul, subjudul, keterangan, dan informasi desain.</li>
                <li><strong>Shape Tool:</strong> membuat bentuk dasar seperti kotak, lingkaran, garis, dan elemen visual.</li>
                <li><strong>Brush Tool:</strong> menggambar, memberi efek, atau membuat sentuhan visual.</li>
                <li><strong>Layer Panel:</strong> mengatur susunan elemen agar desain mudah diedit.</li>
                <li><strong>Align & Distribute:</strong> merapikan posisi objek agar sejajar dan seimbang.</li>
                <li><strong>Color Picker:</strong> memilih warna utama, warna pendukung, dan warna aksen.</li>
                <li><strong>Export:</strong> menyimpan hasil desain ke JPG, PNG, PDF, atau format lain.</li>
            </ol>

            <h3>Cara Guru AI Menjelaskan Tools</h3>

            <p>
                Siswa diminta membuka software desain, memilih satu tools, mencoba fungsinya,
                lalu menjelaskan hasilnya. Pembimbing dapat meminta siswa membandingkan hasil
                sebelum dan sesudah tools digunakan.
            </p>
        `;

    } else {

        html += `
            <h3>Tools TKJ yang Disarankan</h3>

            <ol>
                <li><strong>Obeng Set:</strong> membuka casing komputer atau laptop.</li>
                <li><strong>Multimeter:</strong> mengecek tegangan dan jalur listrik.</li>
                <li><strong>Flashdisk Bootable:</strong> instalasi sistem operasi dan recovery.</li>
                <li><strong>LAN Tester:</strong> mengecek kabel jaringan.</li>
                <li><strong>Thermal Paste:</strong> membantu pendinginan processor.</li>
                <li><strong>Software Diagnosa:</strong> mengecek HDD, SSD, RAM, suhu, dan performa.</li>
            </ol>
        `;

    }

    box.innerHTML = html;

}


// =========================================================
// PELATIHAN
// =========================================================

function renderPracticeTraining() {

    var box = document.getElementById("learningPackBox");

    if (!box) {
        return;
    }

    var chapter = getLayoutActiveChapter();
    var major = getLayoutActiveMajor();
    var title = chapter ? getLayoutChapterTitle(chapter) : "Materi";

    var html = `
        <h3>Pelatihan Praktik — ${escapeLayoutHtml(title)}</h3>

        <p>
            Latihan ini dibuat agar siswa tidak hanya mendengar penjelasan Guru AI,
            tetapi langsung mencoba praktik secara bertahap.
        </p>

        <h3>Langkah Pelatihan</h3>

        <ol>
            <li>Guru AI menjelaskan tujuan materi.</li>
            <li>Siswa mencatat istilah penting.</li>
            <li>Pembimbing menunjukkan contoh hasil.</li>
            <li>Siswa mencoba praktik dasar.</li>
            <li>Siswa mengulang praktik dengan variasi sendiri.</li>
            <li>Siswa mengecek hasil pekerjaan.</li>
            <li>Pembimbing memberikan koreksi.</li>
            <li>Siswa memperbaiki hasil akhir.</li>
        </ol>
    `;

    if (major === "DKV") {

        html += `
            <h3>Tugas Praktik DKV</h3>

            <ol>
                <li>Buat satu desain sederhana sesuai BAB yang dipilih.</li>
                <li>Tentukan tujuan desain dan target audiens.</li>
                <li>Gunakan minimal 3 elemen visual seperti teks, warna, bentuk, dan gambar.</li>
                <li>Susun layout agar mudah dibaca.</li>
                <li>Simpan hasil dalam format PNG/JPG.</li>
                <li>Jelaskan konsep desain di depan pembimbing.</li>
            </ol>
        `;

    } else {

        html += `
            <h3>Tugas Praktik TKJ</h3>

            <ol>
                <li>Lakukan simulasi pengecekan sesuai BAB yang dipilih.</li>
                <li>Catat alat yang digunakan.</li>
                <li>Ikuti langkah SOP dengan benar.</li>
                <li>Catat hasil pengecekan.</li>
                <li>Jelaskan solusi dari masalah yang ditemukan.</li>
            </ol>
        `;

    }

    box.innerHTML = html;

}


// =========================================================
// LEMBAR KERJA
// =========================================================

function renderWorksheet() {

    var box = document.getElementById("learningPackBox");

    if (!box) {
        return;
    }

    var chapter = getLayoutActiveChapter();
    var title = chapter ? getLayoutChapterTitle(chapter) : "Materi";

    var html = `
        <h3>Lembar Kerja Siswa — ${escapeLayoutHtml(title)}</h3>

        <p>
            Lembar kerja ini dapat digunakan pembimbing saat siswa mengikuti materi Guru AI.
        </p>

        <h3>Identitas</h3>

        <ol>
            <li>Nama siswa:</li>
            <li>Kelas:</li>
            <li>Jurusan:</li>
            <li>Tanggal:</li>
            <li>Materi BAB:</li>
        </ol>

        <h3>Bagian A — Pemahaman Materi</h3>

        <ol>
            <li>Jelaskan pengertian materi dengan bahasa sendiri.</li>
            <li>Sebutkan 3 hal penting dari materi ini.</li>
            <li>Apa fungsi materi ini dalam pekerjaan nyata?</li>
            <li>Sebutkan contoh penerapan materi ini.</li>
        </ol>

        <h3>Bagian B — Praktik</h3>

        <ol>
            <li>Apa tugas praktik yang dikerjakan?</li>
            <li>Tools atau alat apa yang digunakan?</li>
            <li>Bagaimana langkah pengerjaannya?</li>
            <li>Apa hasil akhirnya?</li>
        </ol>

        <h3>Bagian C — Refleksi</h3>

        <ol>
            <li>Bagian mana yang paling mudah?</li>
            <li>Bagian mana yang paling sulit?</li>
            <li>Apa kesalahan yang terjadi?</li>
            <li>Bagaimana cara memperbaikinya?</li>
        </ol>
    `;

    box.innerHTML = html;

}


// =========================================================
// SHORTCUT
// =========================================================

function renderShortcuts() {

    var box = document.getElementById("learningPackBox");

    if (!box) {
        return;
    }

    var major = getLayoutActiveMajor();

    var html = `
        <h3>Shortcut dan Perintah Cepat</h3>
    `;

    if (major === "DKV") {

        html += `
            <p>
                Shortcut membantu siswa bekerja lebih cepat saat menggunakan software desain.
            </p>

            <ol>
                <li><strong>Ctrl + N:</strong> membuat dokumen baru.</li>
                <li><strong>Ctrl + O:</strong> membuka file.</li>
                <li><strong>Ctrl + S:</strong> menyimpan file.</li>
                <li><strong>Ctrl + Z:</strong> membatalkan langkah terakhir.</li>
                <li><strong>Ctrl + T:</strong> transform objek.</li>
                <li><strong>Ctrl + J:</strong> duplikat layer.</li>
                <li><strong>Ctrl + G:</strong> membuat grup layer.</li>
                <li><strong>Ctrl + D:</strong> menghilangkan seleksi.</li>
                <li><strong>Ctrl + Plus:</strong> zoom in.</li>
                <li><strong>Ctrl + Minus:</strong> zoom out.</li>
                <li><strong>Space:</strong> menggeser tampilan kanvas.</li>
                <li><strong>Alt + Scroll:</strong> zoom cepat.</li>
            </ol>

            <h3>Latihan Shortcut</h3>

            <p>
                Siswa diminta membuka satu file desain, lalu mencoba minimal 10 shortcut.
                Setelah itu siswa menjelaskan shortcut mana yang paling membantu proses kerja.
            </p>
        `;

    } else {

        html += `
            <ol>
                <li><strong>Win + R:</strong> membuka Run.</li>
                <li><strong>Ctrl + Shift + Esc:</strong> membuka Task Manager.</li>
                <li><strong>Win + X:</strong> membuka menu teknisi Windows.</li>
                <li><strong>Win + E:</strong> membuka File Explorer.</li>
                <li><strong>ipconfig:</strong> melihat konfigurasi jaringan.</li>
                <li><strong>ping:</strong> mengetes koneksi jaringan.</li>
                <li><strong>diskmgmt.msc:</strong> membuka Disk Management.</li>
                <li><strong>devmgmt.msc:</strong> membuka Device Manager.</li>
            </ol>
        `;

    }

    box.innerHTML = html;

}


// =========================================================
// RUBRIK
// =========================================================

function renderRubric() {

    var box = document.getElementById("learningPackBox");

    if (!box) {
        return;
    }

    var major = getLayoutActiveMajor();

    var html = `
        <h3>Rubrik Penilaian</h3>

        <p>
            Rubrik ini digunakan untuk menilai pemahaman, proses kerja, hasil praktik,
            kerapian, dan kemampuan siswa menjelaskan hasil pekerjaan.
        </p>

        <ol>
            <li>
                <strong>Pemahaman konsep — 20 poin</strong><br>
                Siswa memahami pengertian, fungsi, dan tujuan materi.
            </li>

            <li>
                <strong>Proses kerja — 20 poin</strong><br>
                Siswa mengikuti langkah kerja dengan runtut dan tidak asal mencoba.
            </li>

            <li>
                <strong>Hasil praktik — 25 poin</strong><br>
                Hasil pekerjaan sesuai instruksi dan menunjukkan penerapan materi.
            </li>

            <li>
                <strong>Kerapian dan ketelitian — 15 poin</strong><br>
                Hasil kerja rapi, konsisten, dan tidak banyak kesalahan.
            </li>

            <li>
                <strong>Presentasi / penjelasan — 10 poin</strong><br>
                Siswa mampu menjelaskan hasil pekerjaannya.
            </li>

            <li>
                <strong>Sikap kerja — 10 poin</strong><br>
                Siswa disiplin, bertanggung jawab, dan mau menerima koreksi.
            </li>
        </ol>
    `;

    if (major === "DKV") {

        html += `
            <h3>Catatan Khusus DKV</h3>

            <p>
                Penilaian DKV harus memperhatikan konsep visual, komposisi, tipografi,
                warna, keterbacaan, kreativitas, dan kesesuaian dengan tujuan desain.
            </p>
        `;

    } else {

        html += `
            <h3>Catatan Khusus TKJ</h3>

            <p>
                Penilaian TKJ harus memperhatikan ketepatan diagnosa, penggunaan alat,
                SOP kerja, keamanan, dokumentasi, dan hasil pengecekan.
            </p>
        `;

    }

    box.innerHTML = html;

}


// =========================================================
// DATA HELPER
// =========================================================

function getLayoutActiveChapter() {

    try {

        if (typeof currentChapter !== "undefined" && currentChapter) {
            return currentChapter;
        }

    } catch (error) {}

    if (window.currentChapter) {
        return window.currentChapter;
    }

    return null;

}


function getLayoutActiveMajor() {

    try {

        if (typeof currentMajor !== "undefined" && currentMajor) {
            return currentMajor;
        }

    } catch (error) {}

    if (window.currentMajor) {
        return window.currentMajor;
    }

    var select = document.getElementById("majorSelect");

    if (select && select.value) {
        return select.value;
    }

    return "DKV";

}


function getLayoutChapterCode(chapter) {

    return String(
        chapter.code ||
        chapter.kode ||
        ("BAB " + (chapter.chapter || chapter.number || ""))
    );

}


function getLayoutChapterTitle(chapter) {

    return String(
        chapter.title ||
        chapter.judul ||
        chapter.name ||
        "Materi"
    );

}


function getLayoutSections(chapter) {

    if (!chapter) {
        return [];
    }

    if (Array.isArray(chapter.sections)) {
        return chapter.sections;
    }

    if (Array.isArray(chapter.materi)) {
        return chapter.materi;
    }

    if (Array.isArray(chapter.sub_materi)) {
        return chapter.sub_materi;
    }

    return [];

}


function getSectionRangeText(sections) {

    if (!sections || sections.length === 0) {
        return "dimasukkan lengkap";
    }

    return "1–" + sections.length;

}


function calculateEstimateMinutes(sections) {

    var total = 60;

    if (sections && sections.length > 0) {
        total = 35 + (sections.length * 12);
    }

    if (total < 60) {
        total = 60;
    }

    return total;

}


function escapeLayoutHtml(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}