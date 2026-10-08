// =========================================================
// GURU AI JSKM
// EXPORT GURU AI MATERIAL TO PDF
// FILE 15.9
// =========================================================

console.log("Guru AI Export PDF JS 15.9 Loaded");


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setTimeout(function () {

        createExportPdfPanel();

    }, 1000);

});


// =========================================================
// CREATE PANEL
// =========================================================

function createExportPdfPanel() {

    if (document.getElementById("exportPdfPanel")) {
        return;
    }

    var target = document.getElementById("learningPackBox");

    if (!target) {
        target = document.getElementById("materialBox");
    }

    if (!target) {
        return;
    }

    var html = `
        <section
            id="exportPdfPanel"
            style="
                background:#111827;
                border:1px solid #334155;
                border-radius:22px;
                padding:24px;
                margin-bottom:22px;
            "
        >

            <h2
                style="
                    margin-top:0;
                    color:#ffffff;
                "
            >
                Export PDF / Modul Cetak
            </h2>

            <div
                style="
                    background:#172554;
                    border:1px solid #2563eb;
                    border-radius:16px;
                    padding:16px;
                    color:#ffffff;
                    line-height:1.8;
                    margin-bottom:16px;
                "
            >
                Gunakan tombol ini untuk mencetak materi Guru AI menjadi PDF.
                PDF berisi cover, daftar materi, materi lengkap, lembar kerja siswa, dan rubrik penilaian.
            </div>

            <div
                style="
                    display:flex;
                    flex-wrap:wrap;
                    gap:12px;
                "
            >

                <button
                    class="btn-green"
                    id="exportCurrentChapterPdfButton"
                >
                    📄 Export PDF BAB Ini
                </button>

                <button
                    class="btn-purple"
                    id="exportAllChaptersPdfButton"
                >
                    📚 Export PDF Semua BAB
                </button>

                <button
                    class="btn-blue"
                    id="openExportFolderInfoButton"
                >
                    📁 Info Folder Export
                </button>

            </div>

            <div
                id="exportPdfStatus"
                style="
                    margin-top:14px;
                    background:#020617;
                    border:1px dashed #475569;
                    border-radius:16px;
                    padding:16px;
                    color:#e5e7eb;
                    line-height:1.7;
                    white-space:pre-line;
                "
            >
                Status export: siap digunakan.
            </div>

        </section>
    `;

    target.insertAdjacentHTML(
        "beforebegin",
        html
    );

    var exportCurrentButton = document.getElementById("exportCurrentChapterPdfButton");
    var exportAllButton = document.getElementById("exportAllChaptersPdfButton");
    var infoButton = document.getElementById("openExportFolderInfoButton");

    if (exportCurrentButton) {

        exportCurrentButton.onclick = function () {

            exportCurrentChapterPdf();

        };

    }

    if (exportAllButton) {

        exportAllButton.onclick = function () {

            exportAllChaptersPdf();

        };

    }

    if (infoButton) {

        infoButton.onclick = function () {

            setExportPdfStatus(
                "File PDF akan otomatis terdownload dari browser.\\nSalinan file juga dibuat di folder project:\\nexports/pdf/"
            );

        };

    }

}


// =========================================================
// EXPORT CURRENT CHAPTER
// =========================================================

function exportCurrentChapterPdf() {

    var major = getExportMajor();

    var chapter = getExportChapter();

    if (!chapter) {

        setExportPdfStatus(
            "BAB belum dipilih. Pilih BAB terlebih dahulu."
        );

        return;

    }

    var url =
        "/api/export/module-pdf?major="
        + encodeURIComponent(major)
        + "&chapter="
        + encodeURIComponent(chapter);

    setExportPdfStatus(
        "Membuat PDF BAB " + chapter + "...\\nTunggu sampai file terdownload."
    );

    window.open(
        url,
        "_blank"
    );

}


// =========================================================
// EXPORT ALL CHAPTERS
// =========================================================

function exportAllChaptersPdf() {

    var major = getExportMajor();

    var confirmExport = confirm(
        "Export semua BAB ke PDF bisa memakan waktu lebih lama. Lanjutkan?"
    );

    if (!confirmExport) {
        return;
    }

    var url =
        "/api/export/module-pdf?major="
        + encodeURIComponent(major)
        + "&chapter=all";

    setExportPdfStatus(
        "Membuat PDF semua BAB " + major + "...\\nTunggu sampai file terdownload."
    );

    window.open(
        url,
        "_blank"
    );

}


// =========================================================
// GET SELECTED DATA
// =========================================================

function getExportMajor() {

    var majorSelect = document.getElementById("majorSelect");

    if (majorSelect && majorSelect.value) {
        return majorSelect.value;
    }

    try {

        if (typeof currentMajor !== "undefined" && currentMajor) {
            return currentMajor;
        }

    } catch (error) {}

    if (window.currentMajor) {
        return window.currentMajor;
    }

    return "DKV";

}


function getExportChapter() {

    var chapterSelect = document.getElementById("chapterSelect");

    if (chapterSelect && chapterSelect.value) {
        return chapterSelect.value;
    }

    try {

        if (
            typeof currentChapter !== "undefined"
            && currentChapter
            && currentChapter.chapter
        ) {
            return currentChapter.chapter;
        }

    } catch (error) {}

    if (window.currentChapter && window.currentChapter.chapter) {
        return window.currentChapter.chapter;
    }

    return "";

}


// =========================================================
// STATUS
// =========================================================

function setExportPdfStatus(text) {

    var status = document.getElementById("exportPdfStatus");

    if (status) {
        status.textContent = text;
    }

}