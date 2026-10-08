// =========================================================
// GURU AI JSKM
// MATERIAL NAVIGATION
// FILE 15.7
// NAVIGASI SUBMATERI OTOMATIS
// =========================================================

console.log("Guru AI Navigation JS 15.7 Loaded");

var selectedNavigationSectionIndex = -1;


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setTimeout(function () {

        renderMaterialNavigation();

        setupNavigationChapterWatcher();

    }, 1200);

});


// =========================================================
// WATCH CHAPTER CHANGE
// =========================================================

function setupNavigationChapterWatcher() {

    var chapterSelect = document.getElementById("chapterSelect");
    var majorSelect = document.getElementById("majorSelect");

    if (chapterSelect) {

        chapterSelect.addEventListener("change", function () {

            selectedNavigationSectionIndex = -1;

            setTimeout(function () {

                renderMaterialNavigation();

            }, 700);

        });

    }

    if (majorSelect) {

        majorSelect.addEventListener("change", function () {

            selectedNavigationSectionIndex = -1;

            setTimeout(function () {

                renderMaterialNavigation();

            }, 1000);

        });

    }

    // Backup watcher jika data chapter selesai dimuat terlambat
    setInterval(function () {

        refreshMaterialNavigationIfNeeded();

    }, 2500);

}


// =========================================================
// RENDER NAVIGATION
// =========================================================

function renderMaterialNavigation() {

    var grid = document.getElementById("materialNavigationGrid");
    var titleBox = document.getElementById("materialNavigationTitle");

    if (!grid) {
        return;
    }

    var chapter = getNavigationCurrentChapter();

    if (!chapter) {

        grid.innerHTML = `
            <div style="
                grid-column:1/-1;
                background:#1e293b;
                border:1px solid #334155;
                border-radius:14px;
                padding:18px;
                color:#cbd5e1;
            ">
                Pilih BAB terlebih dahulu.
            </div>
        `;

        return;
    }

    var chapterNumber = getNavigationChapterNumber(chapter);
    var sections = getNavigationSections(chapter);

    if (titleBox) {

        titleBox.textContent =
            "Navigasi Materi " +
            chapterNumber +
            ".1–" +
            chapterNumber +
            "." +
            sections.length;

    }

    if (!sections.length) {

        grid.innerHTML = `
            <div style="
                grid-column:1/-1;
                background:#1e293b;
                border:1px solid #334155;
                border-radius:14px;
                padding:18px;
                color:#cbd5e1;
            ">
                Submateri BAB ini belum tersedia.
            </div>
        `;

        return;
    }

    var html = "";

    sections.forEach(function (section, index) {

        var code = getNavigationSectionCode(
            section,
            chapterNumber,
            index
        );

        var title = getNavigationSectionTitle(section);

        var content = getNavigationSectionContent(section);

        var estimatedMinutes = calculateSectionMinutes(content);

        var activeClass =
            selectedNavigationSectionIndex === index
                ? "navigation-active"
                : "";

        html += `
            <button
                type="button"
                class="material-navigation-card ${activeClass}"
                data-section-index="${index}"
                style="
                    width:100%;
                    min-height:92px;
                    text-align:left;
                    background:${
                        selectedNavigationSectionIndex === index
                            ? "#1d4ed8"
                            : "#1e293b"
                    };
                    border:1px solid ${
                        selectedNavigationSectionIndex === index
                            ? "#60a5fa"
                            : "#334155"
                    };
                    border-radius:14px;
                    padding:16px;
                    color:#ffffff;
                    cursor:pointer;
                    transition:0.2s;
                "
            >

                <div
                    style="
                        font-size:15px;
                        font-weight:900;
                        margin-bottom:3px;
                    "
                >
                    ${escapeNavigationHtml(code)}
                </div>

                <div
                    style="
                        font-size:15px;
                        font-weight:900;
                        line-height:1.35;
                    "
                >
                    ${escapeNavigationHtml(title)}
                </div>

                <div
                    style="
                        margin-top:4px;
                        color:${
                            selectedNavigationSectionIndex === index
                                ? "#dbeafe"
                                : "#93c5fd"
                        };
                        font-size:14px;
                    "
                >
                    ± ${estimatedMinutes} menit
                </div>

            </button>
        `;

    });

    grid.innerHTML = html;

    bindMaterialNavigationCards(sections);

}


// =========================================================
// BIND CARDS
// =========================================================

function bindMaterialNavigationCards(sections) {

    var cards = document.querySelectorAll(
        ".material-navigation-card"
    );

    cards.forEach(function (card) {

        card.onclick = function () {

            var index = Number(
                card.getAttribute("data-section-index")
            );

            if (
                Number.isNaN(index)
                || !sections[index]
            ) {
                return;
            }

            selectedNavigationSectionIndex = index;

            renderMaterialNavigation();

            openNavigationSection(
                sections[index],
                index
            );

        };

    });

}


// =========================================================
// OPEN SELECTED SECTION
// =========================================================

function openNavigationSection(section, index) {

    var materialBox = document.getElementById("materialBox");

    if (!materialBox) {
        return;
    }

    var chapter = getNavigationCurrentChapter();

    if (!chapter) {
        return;
    }

    var chapterNumber = getNavigationChapterNumber(chapter);

    var code = getNavigationSectionCode(
        section,
        chapterNumber,
        index
    );

    var title = getNavigationSectionTitle(section);
    var content = getNavigationSectionContent(section);

    var html = `
        <div
            style="
                background:#172554;
                border:1px solid #2563eb;
                border-radius:16px;
                padding:18px;
                margin-bottom:18px;
            "
        >

            <div
                style="
                    display:inline-flex;
                    background:#2563eb;
                    border-radius:999px;
                    padding:7px 12px;
                    font-weight:900;
                    margin-bottom:10px;
                "
            >
                ${escapeNavigationHtml(code)}
            </div>

            <h2
                style="
                    margin:0;
                    color:#ffffff;
                "
            >
                ${escapeNavigationHtml(title)}
            </h2>

        </div>


        <h3>Pengantar Guru AI</h3>

        <p>
            Sekarang kita akan mempelajari
            <strong>${escapeNavigationHtml(title)}</strong>.
            Materi ini merupakan bagian dari
            <strong>${escapeNavigationHtml(
                getNavigationChapterTitle(chapter)
            )}</strong>.
            Pelajari pengertian, fungsi, proses, contoh,
            praktik, serta kesalahan yang perlu dihindari.
        </p>


        <h3>Materi Utama</h3>

        <div
            style="
                background:#111827;
                border:1px solid #334155;
                border-radius:16px;
                padding:18px;
                white-space:pre-line;
            "
        >
            ${
                content
                    ? formatNavigationContent(content)
                    : "Isi materi belum tersedia pada modul."
            }
        </div>


        <h3>Penjelasan Guru AI</h3>

        <p>
            ${buildNavigationTeacherExplanation(
                title,
                content
            )}
        </p>


        <h3>Contoh Penerapan</h3>

        <p>
            ${buildNavigationExample(title)}
        </p>


        <h3>Praktik Siswa</h3>

        <ol>
            <li>
                Pelajari fungsi utama dari
                ${escapeNavigationHtml(title)}.
            </li>

            <li>
                Buka software atau alat yang sesuai dengan materi.
            </li>

            <li>
                Ikuti contoh yang diberikan Guru AI atau pembimbing.
            </li>

            <li>
                Buat satu latihan mandiri.
            </li>

            <li>
                Simpan hasil pekerjaan.
            </li>

            <li>
                Jelaskan langkah kerja dan hasilnya kepada pembimbing.
            </li>
        </ol>


        <h3>Kesalahan yang Harus Dihindari</h3>

        <ul>
            <li>Melakukan praktik tanpa memahami tujuan.</li>
            <li>Meniru contoh tanpa memahami prosesnya.</li>
            <li>Tidak memperhatikan kerapian hasil.</li>
            <li>Tidak menyimpan file pekerjaan secara berkala.</li>
            <li>Tidak melakukan pengecekan ulang.</li>
        </ul>


        <h3>Pertanyaan Pemahaman</h3>

        <ol>
            <li>
                Apa fungsi utama
                ${escapeNavigationHtml(title)}?
            </li>

            <li>
                Bagaimana cara menerapkannya dalam pekerjaan nyata?
            </li>

            <li>
                Kesalahan apa yang harus dihindari?
            </li>

            <li>
                Buat satu contoh penggunaan materi ini.
            </li>
        </ol>


        <div
            style="
                display:flex;
                flex-wrap:wrap;
                gap:10px;
                margin-top:20px;
            "
        >

            <button
                type="button"
                id="speakSelectedNavigationMaterial"
                style="
                    background:#22c55e;
                    color:#052e16;
                    border:none;
                    border-radius:12px;
                    padding:13px 18px;
                    font-weight:900;
                    cursor:pointer;
                "
            >
                🔊 Bacakan Submateri Ini
            </button>

            <button
                type="button"
                id="backFullChapterMaterial"
                style="
                    background:#2563eb;
                    color:#ffffff;
                    border:none;
                    border-radius:12px;
                    padding:13px 18px;
                    font-weight:900;
                    cursor:pointer;
                "
            >
                📚 Kembali ke Penjelasan BAB
            </button>

        </div>
    `;

    materialBox.innerHTML = html;

    var materialPanel = materialBox.closest(".panel");

    if (materialPanel) {

        materialPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    var speakButton = document.getElementById(
        "speakSelectedNavigationMaterial"
    );

    if (speakButton) {

        speakButton.onclick = function () {

            speakNavigationSection(
                code,
                title,
                content
            );

        };

    }


    var backButton = document.getElementById(
        "backFullChapterMaterial"
    );

    if (backButton) {

        backButton.onclick = function () {

            selectedNavigationSectionIndex = -1;

            renderMaterialNavigation();

            if (
                typeof window.renderFullDetailedExplanation
                === "function"
            ) {

                window.renderFullDetailedExplanation();

            } else if (
                typeof renderFullDetailedExplanation
                === "function"
            ) {

                renderFullDetailedExplanation();

            } else if (
                typeof renderDetailedExplanation
                === "function"
            ) {

                renderDetailedExplanation();

            }

        };

    }

}


// =========================================================
// SPEAK SELECTED MATERIAL
// =========================================================

function speakNavigationSection(
    code,
    title,
    content
) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    var text =
        "Sekarang kita akan mempelajari " +
        code +
        ", " +
        title +
        ". " +
        cleanNavigationSpeechText(content) +
        ". Setelah materi ini selesai, silakan bertanya jika ada bagian yang belum dipahami.";

    var utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    var voiceSelect = document.getElementById("voiceSelect");

    if (
        voiceSelect
        && window.speechSynthesis.getVoices().length
    ) {

        var voices = window.speechSynthesis.getVoices();

        var selectedIndex = Number(
            voiceSelect.value
        );

        if (
            !Number.isNaN(selectedIndex)
            && voices[selectedIndex]
        ) {

            utterance.voice = voices[selectedIndex];

        } else {

            var indonesiaVoice = voices.find(
                function (voice) {

                    return String(
                        voice.lang || ""
                    )
                    .toLowerCase()
                    .includes("id");

                }
            );

            if (indonesiaVoice) {
                utterance.voice = indonesiaVoice;
            }

        }

    }

    window.speechSynthesis.speak(utterance);

}


// =========================================================
// AUTO REFRESH
// =========================================================

var navigationLastChapterKey = "";


function refreshMaterialNavigationIfNeeded() {

    var chapter = getNavigationCurrentChapter();

    if (!chapter) {
        return;
    }

    var key =
        getNavigationChapterNumber(chapter)
        + "-"
        + getNavigationChapterTitle(chapter)
        + "-"
        + getNavigationSections(chapter).length;

    if (key !== navigationLastChapterKey) {

        navigationLastChapterKey = key;

        selectedNavigationSectionIndex = -1;

        renderMaterialNavigation();

    }

}


// =========================================================
// ESTIMATE TIME
// =========================================================

function calculateSectionMinutes(content) {

    var text = cleanNavigationSpeechText(content);

    if (!text) {
        return 8;
    }

    var words = text
        .split(/\s+/)
        .filter(Boolean)
        .length;

    // Penjelasan modul + penjelasan Guru AI + praktik
    var minutes = Math.ceil(
        words / 85
    ) + 5;

    if (minutes < 8) {
        minutes = 8;
    }

    if (minutes > 25) {
        minutes = 25;
    }

    return minutes;

}


// =========================================================
// TEACHER EXPLANATION
// =========================================================

function buildNavigationTeacherExplanation(
    title,
    content
) {

    var lower = String(title || "").toLowerCase();

    if (
        lower.includes("photoshop")
        || lower.includes("interface")
        || lower.includes("workspace")
    ) {

        return "Materi ini perlu dipahami langsung melalui Adobe Photoshop. Guru AI menyarankan siswa membuka Photoshop sambil mengikuti penjelasan, mengenali posisi panel, menu, toolbar, area kerja, dan mencoba setiap fungsi secara langsung.";

    }

    if (
        lower.includes("grid")
        || lower.includes("guide")
        || lower.includes("alignment")
        || lower.includes("spacing")
    ) {

        return "Bagian ini berkaitan dengan kerapian dan ketepatan layout. Grid, guide, alignment, dan spacing membantu desainer menyusun objek secara konsisten sehingga desain terlihat profesional dan tidak berantakan.";

    }

    if (
        lower.includes("layer")
        || lower.includes("group")
    ) {

        return "Layer merupakan bagian penting dalam workflow Photoshop. Setiap elemen sebaiknya ditempatkan pada layer yang jelas dan diberi nama agar file desain mudah diedit. Group digunakan untuk mengelompokkan layer yang memiliki fungsi atau bagian yang sama.";

    }

    if (
        lower.includes("instagram")
        || lower.includes("poster")
        || lower.includes("banner")
        || lower.includes("company profile")
    ) {

        return "Pada materi ini siswa akan menerapkan kemampuan desain ke media nyata. Perhatikan ukuran media, hierarki informasi, tipografi, warna, gambar, alignment, ruang kosong, serta kesesuaian desain dengan target audiens.";

    }

    if (
        lower.includes("praktik")
        || lower.includes("studi kasus")
    ) {

        return "Materi ini menekankan latihan langsung. Siswa diharapkan menggabungkan beberapa keterampilan yang telah dipelajari sebelumnya untuk menyelesaikan sebuah proyek secara mandiri dan sistematis.";

    }

    if (
        lower.includes("evaluasi")
    ) {

        return "Evaluasi digunakan untuk mengukur sejauh mana siswa memahami teori dan praktik. Siswa perlu mampu menjelaskan fungsi tools, langkah pengerjaan, alasan desain, serta memperbaiki kesalahan pada hasil pekerjaan.";

    }

    return "Guru AI akan membantu siswa memahami materi ini mulai dari konsep dasar, fungsi, cara penggunaan, contoh penerapan, hingga latihan praktik. Materi sebaiknya langsung dicoba agar siswa tidak hanya memahami teori.";

}


// =========================================================
// EXAMPLE
// =========================================================

function buildNavigationExample(title) {

    var lower = String(title || "").toLowerCase();

    if (lower.includes("grid")) {

        return "Contohnya saat membuat feed Instagram tiga kolom, grid digunakan untuk menjaga posisi teks, gambar, margin, dan elemen visual agar setiap posting memiliki struktur yang konsisten.";

    }

    if (lower.includes("smart guide")) {

        return "Contohnya saat memindahkan teks di Photoshop, Smart Guides membantu menunjukkan kapan posisi teks sudah sejajar dengan objek lain.";

    }

    if (lower.includes("layer")) {

        return "Contohnya sebuah poster dapat memiliki layer Background, Foto Produk, Judul, Harga, Tombol CTA, Logo, dan Ornamen. Penamaan layer yang jelas membuat proses revisi lebih cepat.";

    }

    if (lower.includes("poster")) {

        return "Contohnya poster promosi memiliki headline utama, gambar produk, harga atau informasi penting, deskripsi singkat, serta call to action yang disusun berdasarkan hierarki visual.";

    }

    if (lower.includes("banner")) {

        return "Contohnya banner toko harus menggunakan teks yang besar, kontras tinggi, informasi yang singkat, dan visual yang tetap terbaca dari jarak jauh.";

    }

    return "Contohnya siswa dapat membuat satu desain sederhana menggunakan materi ini, lalu membandingkan hasil sebelum dan sesudah teknik tersebut diterapkan.";

}


// =========================================================
// DATA HELPERS
// =========================================================

function getNavigationCurrentChapter() {

    try {

        if (
            typeof currentChapter !== "undefined"
            && currentChapter
        ) {
            return currentChapter;
        }

    } catch (error) {}

    if (window.currentChapter) {
        return window.currentChapter;
    }

    return null;

}


function getNavigationSections(chapter) {

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


function getNavigationChapterNumber(chapter) {

    var number =
        chapter.chapter
        || chapter.number
        || chapter.no
        || chapter.bab
        || "";

    var parsed = parseInt(number);

    if (!Number.isNaN(parsed)) {
        return parsed;
    }

    var code = String(
        chapter.code
        || chapter.kode
        || ""
    );

    var match = code.match(/\d+/);

    if (match) {
        return Number(match[0]);
    }

    return 1;

}


function getNavigationChapterTitle(chapter) {

    return String(
        chapter.title
        || chapter.judul
        || chapter.name
        || "Materi"
    );

}


function getNavigationSectionCode(
    section,
    chapterNumber,
    index
) {

    var possible =
        section.code
        || section.kode
        || section.section_code
        || section.section
        || section.number
        || "";

    if (possible) {

        var text = String(possible);

        if (text.includes(".")) {
            return text;
        }

    }

    return (
        chapterNumber
        + "."
        + (index + 1)
    );

}


function getNavigationSectionTitle(section) {

    return String(
        section.title
        || section.judul
        || section.name
        || section.subtitle
        || section.sub_title
        || "Submateri"
    );

}


function getNavigationSectionContent(section) {

    return String(
        section.content
        || section.materi
        || section.description
        || section.isi
        || section.text
        || section.body
        || ""
    ).trim();

}


// =========================================================
// TEXT HELPERS
// =========================================================

function escapeNavigationHtml(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatNavigationContent(text) {

    return escapeNavigationHtml(text)
        .replace(/\n/g, "<br>");

}


function cleanNavigationSpeechText(text) {

    return String(text || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}