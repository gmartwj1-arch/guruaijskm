// =========================================================
// GURU AI JSKM
// GURU AI JS
// FILE 13.8
// DETAIL MATERI + TANYA JAWAB + MIKROFON
// =========================================================

console.log("Guru AI JS 13.8 Loaded");


var currentMajor = localStorage.getItem("selected_major") || "DKV";
var allChapters = [];
var currentChapter = null;
var currentSections = [];

var speechParts = [];
var currentSpeechIndex = 0;
var selectedVoice = null;
var isPaused = false;

var recognition = null;
var isListening = false;
var lastAnswerText = "";


// =========================================================
// ELEMENT
// =========================================================

var majorSelect = document.getElementById("majorSelect");
var chapterSelect = document.getElementById("chapterSelect");

var chapterLabel = document.getElementById("chapterLabel");
var chapterTitle = document.getElementById("chapterTitle");
var chapterDescription = document.getElementById("chapterDescription");

var startVoiceBtn = document.getElementById("startVoiceBtn");
var pauseVoiceBtn = document.getElementById("pauseVoiceBtn");
var repeatVoiceBtn = document.getElementById("repeatVoiceBtn");
var stopVoiceBtn = document.getElementById("stopVoiceBtn");

var voiceSelect = document.getElementById("voiceSelect");
var testVoiceBtn = document.getElementById("testVoiceBtn");
var voiceStatus = document.getElementById("voiceStatus");
var voiceProgress = document.getElementById("voiceProgress");
var voiceCounter = document.getElementById("voiceCounter");

var materialBox = document.getElementById("materialBox");

var questionInput = document.getElementById("questionInput");
var askButton = document.getElementById("askButton");
var answerBox = document.getElementById("answerBox");
var answerActions = document.getElementById("answerActions");
var speakAnswerButton = document.getElementById("speakAnswerButton");
var stopAnswerVoiceButton = document.getElementById("stopAnswerVoiceButton");

var micButton = document.getElementById("micButton");
var stopMicButton = document.getElementById("stopMicButton");
var micStatus = document.getElementById("micStatus");


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    var urlParams = new URLSearchParams(window.location.search);
    var paramMajor = urlParams.get("major");
    if (paramMajor) {
        currentMajor = normalizeMajor(paramMajor);
    } else {
        currentMajor = normalizeMajor(currentMajor);
    }

    if (majorSelect) {
        majorSelect.value = currentMajor;
    }

    var paramPrompt = urlParams.get("prompt") || urlParams.get("q");
    if (paramPrompt && questionInput) {
        questionInput.value = paramPrompt;
    }

    setupEvents();

    setupSpeechRecognition();

    loadVoices();

    loadChaptersByMajor(currentMajor);

});


if ("speechSynthesis" in window) {

    window.speechSynthesis.onvoiceschanged = function () {

        loadVoices();

    };

}


// =========================================================
// EVENTS
// =========================================================

function setupEvents() {

    if (majorSelect) {

        majorSelect.onchange = function () {

            currentMajor = normalizeMajor(majorSelect.value);

            localStorage.setItem(
                "selected_major",
                currentMajor
            );

            stopVoice();

            stopMic();

            loadChaptersByMajor(currentMajor);

        };

    }

    if (chapterSelect) {

        chapterSelect.onchange = function () {

            var chapterNumber = Number(chapterSelect.value || 0);

            if (chapterNumber) {

                localStorage.setItem(
                    "selected_chapter",
                    chapterNumber
                );

                loadChapterDetail(
                    currentMajor,
                    chapterNumber
                );

            }

        };

    }

    if (startVoiceBtn) {
        startVoiceBtn.onclick = startVoice;
    }

    if (pauseVoiceBtn) {
        pauseVoiceBtn.onclick = pauseVoice;
    }

    if (repeatVoiceBtn) {
        repeatVoiceBtn.onclick = repeatVoice;
    }

    if (stopVoiceBtn) {
        stopVoiceBtn.onclick = stopVoice;
    }

    if (testVoiceBtn) {
        testVoiceBtn.onclick = testVoice;
    }

    if (voiceSelect) {

        voiceSelect.onchange = function () {

            var voices = window.speechSynthesis.getVoices();

            selectedVoice = voices.find(function (voice) {
                return voice.name === voiceSelect.value;
            }) || null;

        };

    }

    var tabButtons = document.querySelectorAll("[data-tab]");

    tabButtons.forEach(function (button) {

        button.onclick = function () {

            renderTabContent(
                button.getAttribute("data-tab")
            );

        };

    });

    var quickButtons = document.querySelectorAll(".quick-question");

    quickButtons.forEach(function (button) {

        button.onclick = function () {

            var question = button.getAttribute("data-question") || "";

            if (questionInput) {
                questionInput.value = question;
            }

            askGuruAI();

        };

    });

    if (askButton) {
        askButton.onclick = askGuruAI;
    }

    if (questionInput) {

        questionInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {

                askGuruAI();

            }

        });

    }

    if (micButton) {
        micButton.onclick = startMic;
    }

    if (stopMicButton) {
        stopMicButton.onclick = stopMic;
    }

    if (speakAnswerButton) {
        speakAnswerButton.onclick = speakLastAnswer;
    }

    if (stopAnswerVoiceButton) {
        stopAnswerVoiceButton.onclick = stopVoice;
    }

    var bookmarkBtn = document.getElementById("bookmarkCurrentChapterBtn");
    if (bookmarkBtn) {
        bookmarkBtn.onclick = async function () {
            if (!currentChapter) {
                alert("Pilih bab materi terlebih dahulu.");
                return;
            }
            try {
                var res = await fetch("/api/bookmarks", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chapter: currentChapter.number || currentChapter.chapter || 1,
                        title: currentChapter.title || ("BAB " + (currentChapter.number || 1)),
                        major: currentMajor || "DKV",
                        section: "Materi Utama"
                    })
                });
                var d = await res.json();
                if (res.ok) {
                    alert("⭐ " + (d.message || "BAB berhasil disimpan ke Bookmark!"));
                } else {
                    alert("Gagal: " + (d.detail || d.message || "Error"));
                }
            } catch (err) {
                alert("Error: " + err.message);
            }
        };
    }

}


// =========================================================
// LOAD CHAPTERS
// =========================================================

async function loadChaptersByMajor(majorCode) {

    try {

        currentMajor = normalizeMajor(majorCode);

        setText(
            chapterTitle,
            "Memuat modul " + currentMajor + "..."
        );

        setText(
            chapterDescription,
            "Sedang mengambil daftar BAB dari modul jurusan " + currentMajor + "."
        );

        if (chapterSelect) {

            chapterSelect.innerHTML = `
                <option value="">
                    Memuat BAB...
                </option>
            `;

        }

        var response = await fetch(
            "/api/majors/" + currentMajor + "/modules"
        );

        if (!response.ok) {

            throw new Error("Gagal mengambil modul.");

        }

        var result = await response.json();

        if (!result.success) {

            throw new Error(
                result.message || "Modul gagal dimuat."
            );

        }

        allChapters = normalizeChapters(
            result.chapters || result.data || []
        );

        renderChapterOptions();

        var urlParams = new URLSearchParams(window.location.search);
        var paramChapter = Number(urlParams.get("chapter") || 0);

        var savedChapter = Number(
            localStorage.getItem("selected_chapter") || 0
        );

        var firstChapter = allChapters[0]
            ? allChapters[0].chapter
            : 0;

        var targetChapter = (paramChapter && allChapters.some(function (item) {
            return Number(item.chapter) === paramChapter;
        })) ? paramChapter : (allChapters.some(function (item) {
            return Number(item.chapter) === savedChapter;
        }) ? savedChapter : firstChapter);

        if (targetChapter) {

            if (chapterSelect) {
                chapterSelect.value = targetChapter;
            }

            loadChapterDetail(
                currentMajor,
                targetChapter
            );

        } else {

            showNoModule();

        }

    } catch (error) {

        console.error("Load Guru AI Chapters Error:", error);

        setText(
            chapterTitle,
            "Modul tidak berhasil dimuat"
        );

        setText(
            chapterDescription,
            "Pastikan file modul tersedia dan API berjalan."
        );

        renderMaterialMessage(
            "Gagal memuat modul " + currentMajor + "."
        );

    }

}


function renderChapterOptions() {

    if (!chapterSelect) {
        return;
    }

    chapterSelect.innerHTML = "";

    if (!allChapters || allChapters.length === 0) {

        chapterSelect.innerHTML = `
            <option value="">
                Belum ada BAB
            </option>
        `;

        return;

    }

    allChapters.forEach(function (chapter) {

        var option = document.createElement("option");

        option.value = chapter.chapter;

        option.textContent =
            chapter.code + " — " + chapter.title;

        chapterSelect.appendChild(option);

    });

}


async function loadChapterDetail(majorCode, chapterNumber) {

    try {

        stopVoice();

        setText(
            chapterTitle,
            "Memuat BAB..."
        );

        var response = await fetch(
            "/api/majors/" + majorCode + "/modules/" + chapterNumber
        );

        if (!response.ok) {

            throw new Error("Detail BAB gagal dibuka.");

        }

        var result = await response.json();

        if (!result.success || !result.data) {

            throw new Error(
                result.message || "BAB tidak ditemukan."
            );

        }

        currentChapter = normalizeChapter(
            result.data,
            chapterNumber
        );

        currentSections = currentChapter.sections || [];

        renderChapter();

        renderTabContent("detail");

        buildSpeechParts();

    } catch (error) {

        console.error("Load Guru AI Detail Error:", error);

        renderMaterialMessage(
            "Gagal memuat detail BAB."
        );

    }

}


// =========================================================
// NORMALIZE DATA
// =========================================================

function normalizeChapters(chapters) {

    if (!Array.isArray(chapters)) {
        return [];
    }

    return chapters.map(function (chapter, index) {

        return normalizeChapter(
            chapter,
            index + 1
        );

    });

}


function normalizeChapter(chapter, fallbackNumber) {

    chapter = chapter || {};

    var number =
        chapter.chapter
        || chapter.number
        || chapter.chapter_number
        || chapter.id
        || fallbackNumber;

    var code =
        chapter.code
        || chapter.kode
        || chapter.bab
        || chapter.chapter_code
        || "BAB " + number;

    var title =
        chapter.title
        || chapter.judul
        || chapter.chapter_title
        || chapter.name
        || "-";

    var sections =
        chapter.sections
        || chapter.materials
        || chapter.materi
        || chapter.submateri
        || [];

    if (!Array.isArray(sections)) {
        sections = [];
    }

    sections = sections.map(function (section, index) {

        return normalizeSection(
            section,
            index + 1
        );

    });

    return {
        original: chapter,
        chapter: Number(number),
        code: code,
        title: title,
        sections: sections,
        description:
            chapter.description
            || chapter.content
            || "Materi pembelajaran " + code + " - " + title + "."
    };

}


function normalizeSection(section, fallbackNumber) {

    if (!section || typeof section !== "object") {

        return {
            code: String(fallbackNumber),
            title: String(section || "Submateri"),
            content: ""
        };

    }

    return {
        original: section,
        code:
            section.code
            || section.kode
            || section.number
            || section.id
            || String(fallbackNumber),

        title:
            section.title
            || section.judul
            || section.name
            || section.heading
            || "Submateri " + fallbackNumber,

        content:
            section.content
            || section.isi
            || section.description
            || section.text
            || section.body
            || ""
    };

}


// =========================================================
// RENDER CHAPTER
// =========================================================

function renderChapter() {

    if (!currentChapter) {
        return;
    }

    setText(
        chapterLabel,
        currentChapter.code + " • " + currentMajor
    );

    setText(
        chapterTitle,
        currentChapter.title
    );

    setText(
        chapterDescription,
        "Guru AI JSKM akan menjelaskan " + currentChapter.code + " untuk jurusan " + currentMajor + ". Total submateri: " + currentSections.length + ". Siswa dapat mendengarkan penjelasan, membaca materi, dan bertanya langsung memakai teks atau mikrofon."
    );

}


function renderTabContent(tabName) {

    if (!currentChapter) {

        renderMaterialMessage(
            "Pilih jurusan dan BAB terlebih dahulu."
        );

        return;

    }

    if (tabName === "detail") {
        renderDetailedExplanation();
    } else if (tabName === "contoh") {
        renderCaseExamples();
    } else if (tabName === "praktik") {
        renderPracticeGuide();
    } else if (tabName === "kesalahan") {
        renderCommonMistakes();
    } else if (tabName === "ringkasan") {
        renderSummary();
    } else {
        renderDetailedExplanation();
    }

}


// =========================================================
// DETAIL MATERIAL
// =========================================================

function renderDetailedExplanation() {

    var html = `
        <h3>Penjelasan Detail ${escapeHtml(currentChapter.code)} - ${escapeHtml(currentChapter.title)}</h3>

        <div class="teacher-note">
            <strong>Pengantar Guru AI:</strong><br>
            Pada materi ini, siswa jurusan <strong>${escapeHtml(currentMajor)}</strong>
            akan mempelajari topik <strong>${escapeHtml(currentChapter.title)}</strong>.
            Penjelasan berikut dibuat seperti guru pembimbing yang menerangkan konsep,
            tujuan, contoh penerapan, dan hal penting yang harus dipahami siswa.
        </div>
    `;

    if (!currentSections || currentSections.length === 0) {

        html += `
            <p>Belum ada submateri pada BAB ini.</p>
        `;

        setMaterialHtml(html);

        return;

    }

    currentSections.forEach(function (section, index) {

        html += `
            <div class="detail-section">

                <small>Submateri ${escapeHtml(section.code)}</small>

                <h4>${escapeHtml(section.title)}</h4>

                <p>
                    <strong>Penjelasan:</strong><br>
                    ${escapeHtml(section.content || "Materi ini perlu dipelajari sebagai bagian dari kompetensi siswa.")}
                </p>

                <p>
                    <strong>Tujuan Pembelajaran:</strong><br>
                    Setelah mempelajari bagian ini, siswa diharapkan mampu memahami konsep
                    ${escapeHtml(section.title)}, menjelaskan kembali dengan bahasa sendiri,
                    serta menerapkan konsep tersebut dalam kegiatan praktik atau pekerjaan.
                </p>

                <p>
                    <strong>Contoh Penerapan:</strong><br>
                    ${escapeHtml(generateExampleForSection(section))}
                </p>

                <p>
                    <strong>Catatan Guru:</strong><br>
                    Fokus utama pada submateri ini adalah memahami inti materi, bukan hanya menghafal.
                    Siswa sebaiknya mencatat istilah penting, mencoba praktik, dan bertanya jika ada bagian yang belum jelas.
                </p>

            </div>
        `;

    });

    setMaterialHtml(html);

}


function renderCaseExamples() {

    var html = `
        <h3>Contoh Kasus Berdasarkan Materi</h3>

        <div class="teacher-note">
            Contoh kasus membantu siswa memahami bagaimana materi digunakan dalam dunia nyata,
            terutama saat PKL, praktik sekolah, atau pekerjaan teknis.
        </div>
    `;

    currentSections.slice(0, 10).forEach(function (section, index) {

        html += `
            <div class="detail-section">

                <h4>Kasus ${index + 1}: ${escapeHtml(section.title)}</h4>

                <p>
                    <strong>Situasi:</strong><br>
                    Seorang siswa sedang menghadapi pekerjaan yang berkaitan dengan
                    ${escapeHtml(section.title)}.
                </p>

                <p>
                    <strong>Masalah:</strong><br>
                    Siswa belum memahami langkah yang benar sehingga hasil pekerjaan bisa kurang rapi,
                    tidak sesuai standar, atau membutuhkan revisi.
                </p>

                <p>
                    <strong>Solusi:</strong><br>
                    Pelajari inti materi berikut: ${escapeHtml(shortText(section.content, 500))}
                </p>

                <p>
                    <strong>Kesimpulan:</strong><br>
                    Materi ini penting karena membantu siswa bekerja lebih terarah,
                    memahami prosedur, dan menyelesaikan masalah dengan cara yang benar.
                </p>

            </div>
        `;

    });

    setMaterialHtml(html);

}


function renderPracticeGuide() {

    var html = `
        <h3>Latihan Praktik Siswa</h3>

        <div class="teacher-note">
            Latihan berikut dapat digunakan guru atau pembimbing untuk mengecek pemahaman siswa.
        </div>

        <ol>
    `;

    currentSections.forEach(function (section) {

        html += `
            <li>
                Baca dan pahami materi <strong>${escapeHtml(section.title)}</strong>.
                Setelah itu, tuliskan pengertian, fungsi, dan contoh penerapannya.
            </li>
        `;

    });

    html += `
        </ol>

        <div class="detail-section">
            <h4>Tugas Praktik</h4>
            <p>
                Buat laporan singkat berisi:
            </p>
            <ul>
                <li>Judul materi yang dipelajari.</li>
                <li>Tujuan pembelajaran.</li>
                <li>Alat atau software yang digunakan jika ada.</li>
                <li>Langkah kerja.</li>
                <li>Masalah yang ditemukan.</li>
                <li>Solusi atau kesimpulan.</li>
            </ul>
        </div>
    `;

    setMaterialHtml(html);

}


function renderCommonMistakes() {

    var html = `
        <h3>Kesalahan Umum yang Harus Dihindari</h3>

        <div class="teacher-note">
            Bagian ini membantu siswa mengetahui kesalahan yang sering terjadi saat belajar atau praktik.
        </div>

        <div class="detail-section">
            <h4>Kesalahan Umum</h4>
            <ul>
                <li>Hanya menghafal teori tanpa memahami konsep.</li>
                <li>Tidak membaca instruksi atau prosedur kerja sampai selesai.</li>
                <li>Langsung praktik tanpa persiapan alat, bahan, atau data.</li>
                <li>Tidak mencatat kendala saat praktik.</li>
                <li>Tidak bertanya saat menemukan masalah.</li>
                <li>Tidak melakukan pengecekan ulang hasil pekerjaan.</li>
            </ul>
        </div>

        <div class="detail-section">
            <h4>Cara Menghindari Kesalahan</h4>
            <ul>
                <li>Baca materi secara bertahap.</li>
                <li>Pahami istilah penting.</li>
                <li>Ikuti langkah kerja dengan urutan yang benar.</li>
                <li>Catat masalah dan solusi.</li>
                <li>Diskusikan dengan guru, pembimbing, atau teman.</li>
            </ul>
        </div>
    `;

    setMaterialHtml(html);

}


function renderSummary() {

    var html = `
        <h3>Ringkasan Materi</h3>

        <div class="teacher-note">
            Ringkasan ini membantu siswa mengingat inti pembelajaran dari BAB yang dipilih.
        </div>

        <ul>
    `;

    currentSections.forEach(function (section) {

        html += `
            <li>
                <strong>${escapeHtml(section.title)}:</strong>
                ${escapeHtml(shortText(section.content, 260))}
            </li>
        `;

    });

    html += `
        </ul>

        <div class="detail-section">
            <h4>Kesimpulan Guru AI</h4>
            <p>
                Materi ${escapeHtml(currentChapter.title)} penting untuk siswa jurusan
                ${escapeHtml(currentMajor)} karena membantu memahami konsep, proses kerja,
                dan penerapan materi dalam kegiatan belajar, praktik, maupun PKL.
            </p>
        </div>
    `;

    setMaterialHtml(html);

}


function setMaterialHtml(html) {

    if (materialBox) {
        materialBox.innerHTML = html;
    }

}


function renderMaterialMessage(message) {

    if (materialBox) {

        materialBox.innerHTML = `
            <h3>Informasi</h3>
            <p>${escapeHtml(message)}</p>
        `;

    }

}


function showNoModule() {

    setText(
        chapterTitle,
        "Belum ada modul"
    );

    setText(
        chapterDescription,
        "Modul untuk jurusan ini belum tersedia."
    );

    renderMaterialMessage(
        "Belum ada data modul."
    );

}


// =========================================================
// VOICE / TEXT TO SPEECH
// =========================================================

function loadVoices() {

    if (!voiceSelect || !("speechSynthesis" in window)) {
        return;
    }

    var voices = window.speechSynthesis.getVoices();

    voiceSelect.innerHTML = "";

    if (!voices || voices.length === 0) {

        voiceSelect.innerHTML = `
            <option value="">
                Suara belum tersedia
            </option>
        `;

        return;

    }

    var preferredVoices = voices.filter(function (voice) {

        return (
            voice.lang.toLowerCase().includes("id")
            || voice.name.toLowerCase().includes("indonesia")
            || voice.name.toLowerCase().includes("google")
        );

    });

    var finalVoices = preferredVoices.length > 0
        ? preferredVoices
        : voices;

    finalVoices.forEach(function (voice) {

        var option = document.createElement("option");

        option.value = voice.name;

        option.textContent =
            voice.name + " — " + voice.lang;

        voiceSelect.appendChild(option);

    });

    selectedVoice = finalVoices[0] || null;

    if (selectedVoice) {
        voiceSelect.value = selectedVoice.name;
    }

    setText(
        voiceStatus,
        "Status: Suara siap digunakan. Pilih suara guru lalu klik Jelaskan Materi."
    );

}


function buildSpeechParts() {

    speechParts = [];

    if (!currentChapter) {
        return;
    }

    speechParts.push(
        "Halo, saya Guru AI JSKM. Kita akan mempelajari " +
        currentChapter.code + ", yaitu " + currentChapter.title +
        ", untuk jurusan " + currentMajor + "."
    );

    speechParts.push(
        "Materi ini akan dijelaskan secara bertahap. Perhatikan pengertian, tujuan, contoh penerapan, dan kesalahan yang harus dihindari."
    );

    currentSections.forEach(function (section) {

        var text =
            "Submateri " + section.code + ". " +
            section.title + ". " +
            cleanText(section.content) +
            ". Tujuan dari bagian ini adalah agar siswa memahami " +
            section.title +
            " dan mampu menerapkannya dalam praktik.";

        splitLongText(text, 550).forEach(function (part) {

            speechParts.push(part);

        });

    });

    speechParts.push(
        "Kesimpulan materi. Siswa harus memahami konsep utama, mencoba latihan praktik, mencatat kendala, dan bertanya jika ada bagian yang belum jelas."
    );

    currentSpeechIndex = 0;

    updateVoiceProgress();

}


function startVoice() {

    if (!("speechSynthesis" in window)) {

        alert("Browser belum mendukung fitur suara.");

        return;

    }

    if (!speechParts || speechParts.length === 0) {

        buildSpeechParts();

    }

    if (!speechParts || speechParts.length === 0) {

        alert("Materi suara belum tersedia.");

        return;

    }

    isPaused = false;

    window.speechSynthesis.cancel();

    speakCurrentPart();

}


function speakCurrentPart() {

    if (
        currentSpeechIndex >= speechParts.length
    ) {

        setText(
            voiceStatus,
            "Status: Materi selesai dibacakan."
        );

        updateVoiceProgress();

        return;

    }

    var text = speechParts[currentSpeechIndex];

    var utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.onstart = function () {

        setText(
            voiceStatus,
            "Status: Membacakan bagian " + (currentSpeechIndex + 1) + " dari " + speechParts.length + "."
        );

        updateVoiceProgress();

    };

    utterance.onend = function () {

        if (isPaused) {
            return;
        }

        currentSpeechIndex += 1;

        updateVoiceProgress();

        speakCurrentPart();

    };

    window.speechSynthesis.speak(utterance);

}


function pauseVoice() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {

        isPaused = true;

        window.speechSynthesis.pause();

        setText(
            voiceStatus,
            "Status: Suara dijeda."
        );

    } else if (window.speechSynthesis.paused) {

        isPaused = false;

        window.speechSynthesis.resume();

        setText(
            voiceStatus,
            "Status: Suara dilanjutkan."
        );

    }

}


function repeatVoice() {

    stopVoice();

    currentSpeechIndex = 0;

    startVoice();

}


function stopVoice() {

    if ("speechSynthesis" in window) {

        window.speechSynthesis.cancel();

    }

    isPaused = false;

    currentSpeechIndex = 0;

    updateVoiceProgress();

    setText(
        voiceStatus,
        "Status: Suara dihentikan."
    );

}


function testVoice() {

    if (!("speechSynthesis" in window)) {

        alert("Browser belum mendukung fitur suara.");

        return;

    }

    window.speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(
        "Halo, saya Guru AI JSKM. Saya siap membantu menjelaskan materi jurusan " + currentMajor + "."
    );

    utterance.lang = "id-ID";
    utterance.rate = 0.9;

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);

}


function speakText(text) {

    if (!("speechSynthesis" in window)) {

        alert("Browser belum mendukung fitur suara.");

        return;

    }

    if (!text) {
        return;
    }

    window.speechSynthesis.cancel();

    var parts = splitLongText(text, 650);

    var index = 0;

    function speakNext() {

        if (index >= parts.length) {
            return;
        }

        var utterance = new SpeechSynthesisUtterance(parts[index]);

        utterance.lang = "id-ID";
        utterance.rate = 0.9;
        utterance.pitch = 1;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onend = function () {

            index += 1;

            speakNext();

        };

        window.speechSynthesis.speak(utterance);

    }

    speakNext();

}


function speakLastAnswer() {

    if (!lastAnswerText) {

        alert("Belum ada jawaban untuk dibacakan.");

        return;

    }

    speakText(lastAnswerText);

}


function updateVoiceProgress() {

    var total = speechParts.length || 0;
    var current = Math.min(currentSpeechIndex, total);

    var percent = total > 0
        ? Math.round((current / total) * 100)
        : 0;

    if (voiceProgress) {
        voiceProgress.style.width = percent + "%";
    }

    setText(
        voiceCounter,
        "Bagian " + current + " dari " + total
    );

}


// =========================================================
// MICROPHONE / SPEECH TO TEXT
// =========================================================

function setupSpeechRecognition() {

    var SpeechRecognition =
        window.SpeechRecognition
        || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        setText(
            micStatus,
            "Status mikrofon: browser belum mendukung Speech Recognition. Gunakan Google Chrome atau Microsoft Edge."
        );

        return;

    }

    recognition = new SpeechRecognition();

    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = function () {

        isListening = true;

        setText(
            micStatus,
            "Status mikrofon: aktif. Silakan bicara..."
        );

    };

    recognition.onresult = function (event) {

        var transcript = "";

        for (var i = event.resultIndex; i < event.results.length; i++) {

            transcript += event.results[i][0].transcript;

        }

        if (questionInput) {
            questionInput.value = transcript;
        }

        setText(
            micStatus,
            "Terdengar: " + transcript
        );

    };

    recognition.onerror = function (event) {

        isListening = false;

        setText(
            micStatus,
            "Status mikrofon error: " + event.error + ". Pastikan izin microphone sudah diizinkan."
        );

    };

    recognition.onend = function () {

        isListening = false;

        var finalQuestion = questionInput
            ? questionInput.value.trim()
            : "";

        if (finalQuestion) {

            setText(
                micStatus,
                "Pertanyaan berhasil ditangkap. Guru AI sedang menjawab..."
            );

            askGuruAI();

        } else {

            setText(
                micStatus,
                "Status mikrofon berhenti. Tidak ada pertanyaan yang tertangkap."
            );

        }

    };

}


function startMic() {

    if (!recognition) {

        alert("Browser belum mendukung microphone untuk tanya jawab. Gunakan Chrome atau Edge.");

        return;

    }

    if (isListening) {
        return;
    }

    try {

        if (questionInput) {
            questionInput.value = "";
        }

        recognition.start();

    } catch (error) {

        console.error("Mic start error:", error);

        setText(
            micStatus,
            "Mikrofon gagal dimulai. Coba klik lagi atau refresh halaman."
        );

    }

}


function stopMic() {

    if (recognition && isListening) {

        recognition.stop();

    }

    isListening = false;

    setText(
        micStatus,
        "Status mikrofon: dihentikan."
    );

}


// =========================================================
// ASK GURU AI
// =========================================================

async function askGuruAI() {

    var question = questionInput
        ? questionInput.value.trim()
        : "";

    if (!question) {

        alert("Tulis pertanyaan terlebih dahulu.");

        return;

    }

    showAnswer(
        "Guru AI sedang menganalisis pertanyaan berdasarkan modul " + currentMajor + "..."
    );

    var localAnswer = answerFromCurrentMaterial(question);

    if (localAnswer) {

        showAnswer(localAnswer);

        return;

    }

    try {

        var context = buildModuleContext();

        var response = await fetch(
            "/api/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question:
                        "Jawab sebagai Guru AI JSKM. Jurusan: " + currentMajor +
                        ". BAB: " + (currentChapter ? currentChapter.title : "-") +
                        ". Gunakan konteks modul berikut: " + context +
                        ". Pertanyaan siswa: " + question,
                    major: currentMajor
                })
            }
        );

        var result = await response.json();

        var answer =
            result.answer
            || result.message
            || generateGeneralAnswer(question);

        showAnswer(answer);

    } catch (error) {

        console.error("Ask Guru AI Error:", error);

        showAnswer(
            generateGeneralAnswer(question)
        );

    }

}


function answerFromCurrentMaterial(question) {

    if (!currentChapter || !currentSections || currentSections.length === 0) {
        return "";
    }

    var q = normalizeText(question);

    if (
        q.includes("jelaskan")
        || q.includes("materi ini")
        || q.includes("bahasa sederhana")
        || q.includes("ringkas")
        || q.includes("apa itu")
        || q.includes("pengertian")
    ) {

        return buildDetailedAnswer();

    }

    if (
        q.includes("contoh")
        || q.includes("kasus")
        || q.includes("dunia kerja")
        || q.includes("penerapan")
    ) {

        return buildCaseAnswer();

    }

    if (
        q.includes("langkah")
        || q.includes("praktik")
        || q.includes("cara")
        || q.includes("prosedur")
    ) {

        return buildPracticeAnswer();

    }

    if (
        q.includes("salah")
        || q.includes("kesalahan")
        || q.includes("kendala")
        || q.includes("troubleshooting")
        || q.includes("masalah")
    ) {

        return buildMistakeAnswer();

    }

    var matchedSections = findRelevantSections(q);

    if (matchedSections.length > 0) {

        return buildSectionAnswer(
            question,
            matchedSections
        );

    }

    return "";

}


function buildDetailedAnswer() {

    var answer =
        "Baik, saya jelaskan materi " + currentChapter.title +
        " untuk jurusan " + currentMajor + " secara bertahap.\n\n";

    answer +=
        "1. Pengertian umum\n" +
        "Materi ini membahas topik " + currentChapter.title +
        ". Siswa perlu memahami konsep utamanya agar tidak hanya menghafal, tetapi mampu menerapkan saat praktik.\n\n";

    answer +=
        "2. Tujuan pembelajaran\n" +
        "Setelah mempelajari BAB ini, siswa diharapkan mampu menjelaskan isi materi, memahami istilah penting, dan menerapkannya dalam tugas atau kegiatan PKL.\n\n";

    answer +=
        "3. Pokok materi\n";

    currentSections.slice(0, 8).forEach(function (section, index) {

        answer +=
            "- " + section.title + ": " +
            shortText(section.content, 350) + "\n";

    });

    answer +=
        "\n4. Kesimpulan guru\n" +
        "Intinya, siswa harus memahami materi secara konsep, mencatat poin penting, mencoba latihan praktik, dan bertanya jika ada bagian yang belum jelas.";

    return answer;

}


function buildCaseAnswer() {

    var answer =
        "Contoh kasus untuk materi " + currentChapter.title +
        " jurusan " + currentMajor + ":\n\n";

    currentSections.slice(0, 5).forEach(function (section, index) {

        answer +=
            "Kasus " + (index + 1) + " - " + section.title + "\n" +
            "Situasi: Siswa menemukan pekerjaan yang berkaitan dengan " + section.title + ".\n" +
            "Masalah: Jika siswa belum memahami materi, hasil pekerjaan bisa salah, kurang rapi, atau tidak sesuai prosedur.\n" +
            "Solusi: Pahami inti materi berikut: " + shortText(section.content, 300) + "\n\n";

    });

    answer +=
        "Kesimpulan: contoh kasus membantu siswa memahami hubungan antara teori dan pekerjaan nyata.";

    return answer;

}


function buildPracticeAnswer() {

    var answer =
        "Langkah praktik yang bisa dilakukan siswa pada materi " + currentChapter.title + ":\n\n";

    answer +=
        "1. Baca tujuan pembelajaran.\n" +
        "2. Catat istilah penting.\n" +
        "3. Pilih salah satu submateri untuk dipraktikkan.\n" +
        "4. Siapkan alat, software, atau bahan yang diperlukan.\n" +
        "5. Ikuti langkah kerja secara berurutan.\n" +
        "6. Catat masalah yang muncul.\n" +
        "7. Buat kesimpulan hasil praktik.\n\n";

    answer +=
        "Latihan berdasarkan submateri:\n";

    currentSections.slice(0, 8).forEach(function (section) {

        answer +=
            "- Praktikkan atau jelaskan ulang materi: " + section.title + ".\n";

    });

    return answer;

}


function buildMistakeAnswer() {

    var answer =
        "Kesalahan umum pada materi " + currentChapter.title + ":\n\n";

    answer +=
        "1. Hanya menghafal tanpa memahami konsep.\n" +
        "2. Tidak membaca instruksi sampai selesai.\n" +
        "3. Tidak menyiapkan alat atau data sebelum praktik.\n" +
        "4. Tidak mencatat kendala yang muncul.\n" +
        "5. Tidak mengecek ulang hasil pekerjaan.\n" +
        "6. Tidak bertanya saat menemukan masalah.\n\n";

    answer +=
        "Cara menghindarinya:\n" +
        "- Pahami konsep dasar.\n" +
        "- Ikuti prosedur kerja.\n" +
        "- Catat masalah dan solusinya.\n" +
        "- Diskusikan dengan guru atau pembimbing.\n" +
        "- Lakukan evaluasi hasil kerja.";

    return answer;

}


function buildSectionAnswer(question, sections) {

    var answer =
        "Saya menemukan materi yang berkaitan dengan pertanyaan: \"" + question + "\".\n\n";

    sections.slice(0, 4).forEach(function (section, index) {

        answer +=
            (index + 1) + ". " + section.title + "\n" +
            shortText(section.content, 600) + "\n\n";

    });

    answer +=
        "Kesimpulan guru: materi tersebut perlu dipahami dengan cara membaca konsep, melihat contoh penerapan, lalu mencoba latihan praktik.";

    return answer;

}


function generateGeneralAnswer(question) {

    return (
        "Pertanyaan: " + question + "\n\n" +
        "Guru AI belum menemukan bagian yang sangat spesifik dari modul, tetapi berdasarkan BAB yang sedang dipilih, siswa bisa memahami materi dengan langkah berikut:\n\n" +
        "1. Pahami judul BAB dan tujuan pembelajaran.\n" +
        "2. Baca setiap submateri secara bertahap.\n" +
        "3. Catat istilah yang belum dimengerti.\n" +
        "4. Hubungkan materi dengan contoh praktik.\n" +
        "5. Tanyakan lagi dengan kata kunci yang lebih spesifik, misalnya nama submateri atau masalah yang sedang dialami."
    );

}


function findRelevantSections(q) {

    var results = [];

    currentSections.forEach(function (section) {

        var title = normalizeText(section.title);
        var content = normalizeText(section.content);

        var words = q.split(" ").filter(function (word) {
            return word.length >= 4;
        });

        var score = 0;

        words.forEach(function (word) {

            if (title.includes(word)) {
                score += 3;
            }

            if (content.includes(word)) {
                score += 1;
            }

        });

        if (score > 0) {

            results.push({
                score: score,
                section: section
            });

        }

    });

    results.sort(function (a, b) {
        return b.score - a.score;
    });

    return results.map(function (item) {
        return item.section;
    });

}


function buildModuleContext() {

    var context = "";

    if (!currentChapter) {
        return context;
    }

    context += currentChapter.title + ". ";

    currentSections.slice(0, 8).forEach(function (section) {

        context += section.title + ": " + shortText(section.content, 250) + ". ";

    });

    return context;

}


function showAnswer(answer) {

    lastAnswerText = answer;

    if (answerBox) {

        answerBox.style.display = "block";
        answerBox.textContent = answer;

    }

    if (answerActions) {

        answerActions.style.display = "flex";

    }

}


// =========================================================
// HELPER
// =========================================================

function normalizeMajor(value) {

    var major = String(value || "DKV").toUpperCase();

    if (major === "TKJ") {
        return "TKJ";
    }

    return "DKV";

}


function setText(element, value) {

    if (element) {
        element.textContent = value;
    }

}


function cleanText(value) {

    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();

}


function normalizeText(value) {

    return cleanText(value)
        .toLowerCase();

}


function shortText(value, maxLength) {

    var text = cleanText(value);

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength) + "...";

}


function splitLongText(text, maxLength) {

    text = cleanText(text);

    if (!text) {
        return [];
    }

    var parts = [];
    var sentences = text.split(/(?<=[.!?])\s+/);
    var current = "";

    sentences.forEach(function (sentence) {

        if ((current + " " + sentence).length > maxLength) {

            if (current.trim()) {
                parts.push(current.trim());
            }

            current = sentence;

        } else {

            current += " " + sentence;

        }

    });

    if (current.trim()) {
        parts.push(current.trim());
    }

    return parts;

}


function generateExampleForSection(section) {

    if (currentMajor === "TKJ") {

        return "Contohnya, saat siswa melakukan pekerjaan teknisi komputer atau jaringan, materi " + section.title + " dapat digunakan untuk memahami langkah kerja, menganalisis masalah, dan menentukan solusi yang tepat.";

    }

    return "Contohnya, saat siswa membuat karya desain, materi " + section.title + " dapat digunakan untuk menyusun konsep, memilih elemen visual, dan menghasilkan desain yang lebih terarah.";

}


function escapeHtml(value) {

    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}