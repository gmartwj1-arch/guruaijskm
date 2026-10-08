// =========================================================
// GURU AI JSKM
// MODULES JS
// FILE 13.7
// FIX DROPDOWN JURUSAN DKV / TKJ + FIX CACHE
// =========================================================

console.log("Modules JS 13.7 Loaded");


var currentMajor = localStorage.getItem("selected_major") || "DKV";
var allModules = [];
var filteredModules = [];


// =========================================================
// ELEMENT
// =========================================================

var majorSelect = document.getElementById("majorSelect");
var selectedMajorTitle = document.getElementById("selectedMajorTitle");
var selectedMajorDescription = document.getElementById("selectedMajorDescription");

var totalBab = document.getElementById("totalBab");
var totalMateri = document.getElementById("totalMateri");
var totalQuiz = document.getElementById("totalQuiz");
var totalVideo = document.getElementById("totalVideo");

var moduleSubtitle = document.getElementById("moduleSubtitle");
var moduleSearch = document.getElementById("moduleSearch");
var refreshModulesBtn = document.getElementById("refreshModulesBtn");
var modulesTableBody = document.getElementById("modulesTableBody");


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Modules page ready");

    currentMajor = normalizeMajor(currentMajor);

    if (majorSelect) {
        majorSelect.value = currentMajor;
    }

    setupEvents();

    loadModulesByMajor(currentMajor);

});


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

            loadModulesByMajor(currentMajor);

        };

    }

    if (moduleSearch) {

        moduleSearch.oninput = function () {

            applySearch();

        };

    }

    if (refreshModulesBtn) {

        refreshModulesBtn.onclick = function () {

            loadModulesByMajor(currentMajor);

        };

    }

}


// =========================================================
// LOAD MODULES BY MAJOR
// =========================================================

async function loadModulesByMajor(majorCode) {

    try {

        currentMajor = normalizeMajor(majorCode);

        console.log("Load major:", currentMajor);

        showLoading();

        updateMajorHeaderBeforeLoad(currentMajor);

        var url = "/api/majors/" + currentMajor + "/modules";

        console.log("Fetch URL:", url);

        var response = await fetch(url);

        if (!response.ok) {

            throw new Error("API gagal dibuka.");

        }

        var result = await response.json();

        console.log("API Result:", result);

        if (!result.success) {

            throw new Error(result.message || "Data modul gagal dimuat.");

        }

        var chapters = extractChapters(result);

        allModules = normalizeModules(chapters);

        filteredModules = allModules.slice();

        updateMajorInfo(
            result.major,
            result.module
        );

        updateSummary(
            result,
            allModules
        );

        renderModulesTable(
            filteredModules
        );

    } catch (error) {

        console.error("LOAD MODULE ERROR:", error);

        showEmpty(
            "Gagal memuat data modul. Cek Console / API /api/majors/" + currentMajor + "/modules"
        );

    }

}


// =========================================================
// EXTRACT DATA
// =========================================================

function extractChapters(result) {

    if (Array.isArray(result)) {
        return result;
    }

    if (result && Array.isArray(result.data)) {
        return result.data;
    }

    if (result && Array.isArray(result.chapters)) {
        return result.chapters;
    }

    if (
        result
        && result.data
        && Array.isArray(result.data.chapters)
    ) {
        return result.data.chapters;
    }

    return [];

}


function normalizeModules(chapters) {

    if (!Array.isArray(chapters)) {
        return [];
    }

    var fixed = [];

    for (var i = 0; i < chapters.length; i++) {

        var chapter = chapters[i] || {};

        var chapterNumber =
            chapter.chapter
            || chapter.number
            || chapter.chapter_number
            || chapter.id
            || (i + 1);

        var chapterCode =
            chapter.code
            || chapter.kode
            || chapter.bab
            || chapter.chapter_code
            || ("BAB " + chapterNumber);

        var chapterTitle =
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

        fixed.push({
            original: chapter,
            id: chapterNumber,
            chapter: chapterNumber,
            number: chapterNumber,
            code: chapterCode,
            bab: chapterCode,
            title: chapterTitle,
            judul: chapterTitle,
            sections: sections,
            jumlah_materi: sections.length,
            status: chapter.status || "Aktif"
        });

    }

    return fixed;

}


// =========================================================
// UPDATE HEADER
// =========================================================

function updateMajorHeaderBeforeLoad(majorCode) {

    if (selectedMajorTitle) {

        selectedMajorTitle.textContent =
            "Memuat jurusan " + majorCode + "...";

    }

    if (selectedMajorDescription) {

        selectedMajorDescription.textContent =
            "Sedang mengambil data modul jurusan " + majorCode + ".";

    }

}


function updateMajorInfo(major, module) {

    var majorCode = currentMajor;

    var majorName = getMajorName(majorCode);
    var majorDescription = "Materi pembelajaran jurusan " + majorCode + ".";

    if (major && major.name) {
        majorName = major.name;
    } else if (module && module.title) {
        majorName = module.title;
    }

    if (major && major.description) {
        majorDescription = major.description;
    } else if (module && module.description) {
        majorDescription = module.description;
    }

    if (selectedMajorTitle) {

        selectedMajorTitle.textContent =
            majorCode + " - " + majorName;

    }

    if (selectedMajorDescription) {

        selectedMajorDescription.textContent =
            majorDescription;

    }

    if (moduleSubtitle) {

        moduleSubtitle.textContent =
            "Menampilkan modul jurusan " + majorCode + ".";

    }

}


// =========================================================
// UPDATE SUMMARY
// =========================================================

function updateSummary(result, modules) {

    var totalModuleBab = 0;
    var totalModuleMateri = 0;

    if (result && result.total_bab) {
        totalModuleBab = result.total_bab;
    } else if (result && result.total) {
        totalModuleBab = result.total;
    } else {
        totalModuleBab = modules.length;
    }

    if (result && result.total_materi) {

        totalModuleMateri = result.total_materi;

    } else {

        for (var i = 0; i < modules.length; i++) {

            totalModuleMateri += Number(
                modules[i].jumlah_materi || 0
            );

        }

    }

    setText(totalBab, totalModuleBab);
    setText(totalMateri, totalModuleMateri);
    setText(totalQuiz, result && result.total_quiz ? result.total_quiz : 0);
    setText(totalVideo, result && result.total_video ? result.total_video : 0);

}


// =========================================================
// SEARCH
// =========================================================

function applySearch() {

    var keyword = "";

    if (moduleSearch) {
        keyword = moduleSearch.value.toLowerCase().trim();
    }

    if (!keyword) {

        filteredModules = allModules.slice();

    } else {

        filteredModules = allModules.filter(function (item) {

            var code = String(item.code || "").toLowerCase();
            var title = String(item.title || "").toLowerCase();

            return (
                code.indexOf(keyword) !== -1
                || title.indexOf(keyword) !== -1
            );

        });

    }

    renderModulesTable(filteredModules);

}


// =========================================================
// RENDER TABLE
// =========================================================

function renderModulesTable(modules) {

    if (!modulesTableBody) {
        return;
    }

    modulesTableBody.innerHTML = "";

    if (!modules || modules.length === 0) {

        showEmpty("Belum ada data modul untuk jurusan ini.");

        return;

    }

    for (var i = 0; i < modules.length; i++) {

        var item = modules[i];

        var row = document.createElement("tr");

        row.innerHTML =
            "<td>" + (i + 1) + "</td>" +

            "<td>" +
                "<strong>" + escapeHtml(item.code || "-") + "</strong>" +
            "</td>" +

            "<td>" +
                "<strong>" + escapeHtml(item.title || "-") + "</strong>" +
            "</td>" +

            "<td>" +
                escapeHtml(item.jumlah_materi || 0) +
            "</td>" +

            "<td>" +
                "<span class='module-status-badge'>" +
                    escapeHtml(item.status || "Aktif") +
                "</span>" +
            "</td>" +

            "<td>" +
                "<button class='module-action' data-chapter='" + escapeHtml(item.chapter || item.id || i + 1) + "'>" +
                    "Lihat" +
                "</button>" +
            "</td>";

        bindActionButton(row, item);

        modulesTableBody.appendChild(row);

    }

}


function bindActionButton(row, item) {

    var button = row.querySelector(".module-action");

    if (!button) {
        return;
    }

    button.onclick = function () {

        openModuleDetail(item);

    };

}


function openModuleDetail(item) {

    var chapterNumber =
        item.chapter
        || item.number
        || item.id;

    localStorage.setItem(
        "selected_major",
        currentMajor
    );

    localStorage.setItem(
        "selected_chapter",
        chapterNumber
    );

    window.location.href =
        "/admin/modules/" + chapterNumber + "?major=" + currentMajor;

}


// =========================================================
// STATE
// =========================================================

function showLoading() {

    if (!modulesTableBody) {
        return;
    }

    modulesTableBody.innerHTML =
        "<tr>" +
            "<td colspan='6' class='empty-row'>" +
                "Memuat data modul..." +
            "</td>" +
        "</tr>";

}


function showEmpty(message) {

    if (!modulesTableBody) {
        return;
    }

    modulesTableBody.innerHTML =
        "<tr>" +
            "<td colspan='6' class='empty-row'>" +
                escapeHtml(message) +
            "</td>" +
        "</tr>";

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


function getMajorName(majorCode) {

    if (majorCode === "TKJ") {
        return "Teknik Komputer dan Jaringan";
    }

    return "Desain Komunikasi Visual";

}


function setText(element, value) {

    if (element) {
        element.textContent = value;
    }

}


function escapeHtml(value) {

    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}