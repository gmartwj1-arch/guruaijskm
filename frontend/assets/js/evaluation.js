// =========================================================
// GURU AI JSKM
// EVALUATION JS
// FILE 12.19
// RAPORT EVALUASI SISWA / CETAK PDF + FIX TANDA TANGAN
// =========================================================

console.log("Evaluation JS 12.19 Loaded");


let allEvaluationData = [];
let filteredEvaluationData = [];
let currentPrintItem = null;


const searchInput = document.getElementById("searchInput");
const modeFilter = document.getElementById("modeFilter");
const scoreFilter = document.getElementById("scoreFilter");
const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");

const emptyState = document.getElementById("emptyState");
const tableWrapper = document.getElementById("tableWrapper");
const evaluationTable = document.getElementById("evaluationTable");

const detailPanel = document.getElementById("detailPanel");
const closeDetailButton = document.getElementById("closeDetailButton");

const detailNote = document.getElementById("detailNote");


document.addEventListener("DOMContentLoaded", function () {

    setupEvents();

    loadEvaluationData();

});


function setupEvents() {

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (modeFilter) {
        modeFilter.addEventListener("change", applyFilters);
    }

    if (scoreFilter) {
        scoreFilter.addEventListener("change", applyFilters);
    }

    if (refreshButton) {
        refreshButton.addEventListener("click", loadEvaluationData);
    }

    if (exportButton) {
        exportButton.addEventListener("click", exportEvaluationData);
    }

    if (closeDetailButton) {
        closeDetailButton.addEventListener("click", closeDetailPanel);
    }

}


async function loadEvaluationData() {

    try {

        showLoading();

        const response = await fetch("/api/quiz-results");

        if (!response.ok) {
            throw new Error("Gagal mengambil data nilai evaluasi.");
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Data nilai gagal dimuat.");
        }

        allEvaluationData = Array.isArray(result.data)
            ? result.data
            : [];

        filteredEvaluationData = [...allEvaluationData];

        updateSummary(filteredEvaluationData);

        renderEvaluationTable(filteredEvaluationData);

    } catch (error) {

        console.error("Evaluation Load Error:", error);

        showEmpty("Gagal memuat data nilai evaluasi. Pastikan API /api/quiz-results sudah berjalan.");

    }

}


function applyFilters() {

    const keyword = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const selectedMode = modeFilter
        ? modeFilter.value
        : "all";

    const selectedScore = scoreFilter
        ? scoreFilter.value
        : "all";

    filteredEvaluationData = allEvaluationData.filter(function (item) {

        const studentName = String(item.student_name || "").toLowerCase();
        const chapterCode = String(item.chapter_code || "").toLowerCase();
        const chapterTitle = String(item.chapter_title || "").toLowerCase();
        const quizMode = String(item.quiz_mode || "").toLowerCase();
        const score = Number(item.score || 0);

        const matchKeyword =
            !keyword
            || studentName.includes(keyword)
            || chapterCode.includes(keyword)
            || chapterTitle.includes(keyword)
            || quizMode.includes(keyword);

        const matchMode =
            selectedMode === "all"
            || quizMode === selectedMode;

        let matchScore = true;

        if (selectedScore === "good") {
            matchScore = score >= 80;
        } else if (selectedScore === "mid") {
            matchScore = score >= 60 && score < 80;
        } else if (selectedScore === "low") {
            matchScore = score < 60;
        }

        return matchKeyword && matchMode && matchScore;

    });

    updateSummary(filteredEvaluationData);

    renderEvaluationTable(filteredEvaluationData);

}


function updateSummary(data) {

    const total = data.length;

    const scores = data.map(function (item) {
        return Number(item.score || 0);
    });

    const average = total > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / total)
        : 0;

    const highest = total > 0
        ? Math.max(...scores)
        : 0;

    const lowest = total > 0
        ? Math.min(...scores)
        : 0;

    setText("totalResults", total);
    setText("averageScore", average);
    setText("highestScore", highest);
    setText("lowestScore", lowest);

}


function renderEvaluationTable(data) {

    if (!evaluationTable) {
        return;
    }

    if (!data || data.length === 0) {

        showEmpty("Belum ada data nilai evaluasi. Silakan kerjakan quiz terlebih dahulu.");

        return;

    }

    hideEmpty();

    evaluationTable.innerHTML = "";

    data.forEach(function (item, index) {

        const row = document.createElement("tr");

        const score = Number(item.score || 0);

        const scoreClass = getScoreClass(score);

        row.innerHTML = `
            <td>${index + 1}</td>

            <td>
                <strong>${escapeHtml(item.student_name || "Siswa")}</strong>
                <br>
                <small>ID: ${escapeHtml(item.student_id || "-")}</small>
            </td>

            <td>
                <strong>${escapeHtml(item.chapter_code || "-")}</strong>
                <br>
                <small>${escapeHtml(item.chapter_title || "-")}</small>
            </td>

            <td>
                <span class="mode-badge">
                    ${escapeHtml(formatMode(item.quiz_mode))}
                </span>
            </td>

            <td>${escapeHtml(item.total_questions || 0)}</td>

            <td>${escapeHtml(item.correct_answers || 0)}</td>

            <td>${escapeHtml(item.wrong_answers || 0)}</td>

            <td>
                <span class="score-badge ${scoreClass}">
                    ${score}
                </span>
            </td>

            <td>${escapeHtml(formatDate(item.created_at))}</td>

            <td>
                <button
                    class="btn btn-blue btn-small detail-result-btn"
                    data-id="${escapeHtml(item.id || "")}"
                >
                    Detail
                </button>

                <button
                    class="btn btn-red btn-small delete-result-btn"
                    data-id="${escapeHtml(item.id || "")}"
                    style="margin-left:6px;"
                >
                    Hapus
                </button>
            </td>
        `;

        row.addEventListener("click", function () {
            showDetail(item);
        });

        const detailButton = row.querySelector(".detail-result-btn");

        if (detailButton) {

            detailButton.addEventListener("click", function (event) {

                event.stopPropagation();

                showDetail(item);

            });

        }

        const deleteButton = row.querySelector(".delete-result-btn");

        if (deleteButton) {

            deleteButton.addEventListener("click", function (event) {

                event.stopPropagation();

                deleteEvaluationResult(item.id);

            });

        }

        evaluationTable.appendChild(row);

    });

}


function showDetail(item) {

    if (!detailPanel) {
        return;
    }

    currentPrintItem = item;

    const score = Number(item.score || 0);

    setText("detailStudent", item.student_name || "Siswa");

    setText(
        "detailChapter",
        (item.chapter_code || "-") + " - " + (item.chapter_title || "-")
    );

    setText("detailMode", formatMode(item.quiz_mode));

    setText("detailScore", score);

    const predicate = getPredicate(score);

    const answerReviewHtml = renderAnswerReview(item);

    if (detailNote) {

        detailNote.innerHTML = `
            <div style="text-align:left; line-height:1.7;">
                <strong>Catatan Evaluasi:</strong>
                <br><br>
                Siswa memperoleh nilai <strong>${score}</strong>
                dengan predikat <strong>${predicate}</strong>.
                <br>
                Benar <strong>${escapeHtml(item.correct_answers || 0)}</strong>
                dari <strong>${escapeHtml(item.total_questions || 0)}</strong> soal,
                dan salah <strong>${escapeHtml(item.wrong_answers || 0)}</strong> soal.
                <br><br>
                Data ini dapat digunakan sebagai dasar rekap nilai,
                evaluasi pembelajaran, dan raport digital siswa.
            </div>

            ${answerReviewHtml}
        `;

    }

    detailPanel.classList.add("active");

    detailPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function closeDetailPanel() {

    if (detailPanel) {
        detailPanel.classList.remove("active");
    }

}


function renderAnswerReview(item) {

    const questions = toArray(item.questions);
    const answers = toArray(item.answers);

    const total = Math.max(
        questions.length,
        answers.length
    );

    if (total === 0) {

        return `
            <div class="answer-review-wrapper">
                <h3 class="answer-review-title">
                    Detail Jawaban Siswa
                </h3>

                <div class="answer-card neutral">
                    Detail jawaban belum tersedia pada data ini.
                </div>
            </div>
        `;

    }

    let html = `
        <div class="answer-review-wrapper">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:12px;
                flex-wrap:wrap;
                margin-bottom:16px;
            ">
                <h3 class="answer-review-title">
                    Detail Jawaban Siswa
                </h3>

                <button
                    class="btn btn-print btn-small"
                    onclick="printEvaluationReport()"
                >
                    Cetak / Simpan PDF
                </button>
            </div>
    `;

    for (let index = 0; index < total; index++) {

        const questionItem = questions[index] || {};
        const answerItem = answers[index];

        const questionText =
            getValue(
                questionItem,
                [
                    "question",
                    "question_text",
                    "soal",
                    "text",
                    "title"
                ]
            )
            || `Soal ${index + 1}`;

        const options = getOptions(questionItem);

        const userAnswerRaw = getUserAnswer(answerItem, questionItem);

        const correctAnswerRaw = getCorrectAnswer(questionItem, answerItem);

        const explanation =
            getValue(
                questionItem,
                [
                    "explanation",
                    "pembahasan",
                    "reason"
                ]
            )
            || getValue(
                answerItem,
                [
                    "explanation",
                    "pembahasan",
                    "reason"
                ]
            );

        const userAnswer = answerToText(userAnswerRaw, options);

        const correctAnswer = answerToText(correctAnswerRaw, options);

        const emptyAnswer = isEmptyAnswer(userAnswerRaw);

        let statusLabel = "Salah";
        let statusClass = "wrong";

        if (emptyAnswer) {

            statusLabel = "Tidak Dijawab";
            statusClass = "neutral";

        } else {

            const isCorrect = detectCorrectStatus(
                answerItem,
                questionItem,
                userAnswer,
                correctAnswer
            );

            if (isCorrect === true) {

                statusLabel = "Benar";
                statusClass = "correct";

            } else {

                statusLabel = "Salah";
                statusClass = "wrong";

            }

        }

        html += `
            <div class="answer-card ${statusClass}">

                <div class="answer-header">

                    <div class="answer-number">
                        Soal ${index + 1}
                    </div>

                    <span class="answer-status ${statusClass}">
                        ${statusLabel}
                    </span>

                </div>

                <div class="question-text">
                    ${escapeHtml(questionText)}
                </div>

                ${renderOptions(options)}

                <div class="answer-compare-grid">

                    <div class="answer-box student">
                        <small>Jawaban Siswa</small>
                        <strong>
                            ${emptyAnswer ? "Tidak dijawab" : escapeHtml(userAnswer || "-")}
                        </strong>
                    </div>

                    <div class="answer-box correct-answer">
                        <small>Jawaban Benar</small>
                        <strong>
                            ${escapeHtml(correctAnswer || "-")}
                        </strong>
                    </div>

                </div>

                ${
                    explanation
                    ? `
                        <div class="explanation-box">
                            <strong>Pembahasan:</strong>
                            <br>
                            ${escapeHtml(explanation)}
                        </div>
                    `
                    : ""
                }

            </div>
        `;

    }

    html += `
        </div>
    `;

    return html;

}


function renderOptions(options) {

    if (!Array.isArray(options) || options.length === 0) {
        return "";
    }

    let html = `
        <div class="option-grid">
    `;

    options.forEach(function (option, index) {

        html += `
            <div class="option-item">
                <strong>${String.fromCharCode(65 + index)}.</strong>
                ${escapeHtml(valueToText(option))}
            </div>
        `;

    });

    html += `
        </div>
    `;

    return html;

}


function getUserAnswer(answerItem, questionItem) {

    if (
        typeof answerItem === "string"
        || typeof answerItem === "number"
        || typeof answerItem === "boolean"
    ) {

        return answerItem;

    }

    const fromAnswerObject = getValue(
        answerItem,
        [
            "student_answer",
            "user_answer",
            "selected_answer",
            "selectedAnswer",
            "jawaban_siswa",
            "answer",
            "selected"
        ]
    );

    if (!isEmptyAnswer(fromAnswerObject)) {
        return fromAnswerObject;
    }

    return getValue(
        questionItem,
        [
            "student_answer",
            "user_answer",
            "selected_answer",
            "selectedAnswer",
            "jawaban_siswa"
        ]
    );

}


function getCorrectAnswer(questionItem, answerItem) {

    const fromQuestion = getValue(
        questionItem,
        [
            "correct_answer",
            "correctAnswer",
            "right_answer",
            "answer_key",
            "kunci_jawaban",
            "correct",
            "answer"
        ]
    );

    if (!isEmptyAnswer(fromQuestion)) {
        return fromQuestion;
    }

    return getValue(
        answerItem,
        [
            "correct_answer",
            "correctAnswer",
            "right_answer",
            "answer_key",
            "kunci_jawaban",
            "correct"
        ]
    );

}


function detectCorrectStatus(answerItem, questionItem, userAnswer, correctAnswer) {

    const statusFromAnswer = getValue(
        answerItem,
        [
            "is_correct",
            "correct",
            "benar",
            "status"
        ]
    );

    if (statusFromAnswer === true) {
        return true;
    }

    if (statusFromAnswer === false) {
        return false;
    }

    if (String(statusFromAnswer).toLowerCase() === "true") {
        return true;
    }

    if (String(statusFromAnswer).toLowerCase() === "false") {
        return false;
    }

    const statusFromQuestion = getValue(
        questionItem,
        [
            "is_correct",
            "correct",
            "benar",
            "status"
        ]
    );

    if (statusFromQuestion === true) {
        return true;
    }

    if (statusFromQuestion === false) {
        return false;
    }

    if (String(statusFromQuestion).toLowerCase() === "true") {
        return true;
    }

    if (String(statusFromQuestion).toLowerCase() === "false") {
        return false;
    }

    if (
        userAnswer
        && correctAnswer
        && userAnswer !== "-"
        && correctAnswer !== "-"
    ) {

        return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);

    }

    return false;

}


async function deleteEvaluationResult(id) {

    if (!id) {

        alert("ID data nilai tidak ditemukan.");

        return;

    }

    const confirmDelete = confirm("Yakin ingin menghapus data nilai ini?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `/api/quiz-results/${id}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.json();

        if (!result.success) {

            alert(result.message || "Data gagal dihapus.");

            return;

        }

        alert("Data nilai berhasil dihapus.");

        closeDetailPanel();

        await loadEvaluationData();

    } catch (error) {

        console.error("Delete Evaluation Error:", error);

        alert("Terjadi kesalahan saat menghapus data.");

    }

}


function exportEvaluationData() {

    if (!filteredEvaluationData || filteredEvaluationData.length === 0) {

        alert("Belum ada data yang bisa diexport.");

        return;

    }

    const rows = [];

    rows.push([
        "No",
        "Nama Siswa",
        "ID Siswa",
        "BAB",
        "Judul BAB",
        "Mode",
        "Total Soal",
        "Benar",
        "Salah",
        "Skor",
        "Tanggal"
    ]);

    filteredEvaluationData.forEach(function (item, index) {

        rows.push([
            index + 1,
            item.student_name || "Siswa",
            item.student_id || "-",
            item.chapter_code || "-",
            item.chapter_title || "-",
            formatMode(item.quiz_mode),
            item.total_questions || 0,
            item.correct_answers || 0,
            item.wrong_answers || 0,
            item.score || 0,
            formatDate(item.created_at)
        ]);

    });

    const csvContent = rows.map(function (row) {

        return row.map(function (cell) {

            return '"' + String(cell).replace(/"/g, '""') + '"';

        }).join(",");

    }).join("\n");

    const blob = new Blob(
        [csvContent],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "nilai_evaluasi_siswa.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


function showLoading() {

    if (emptyState) {
        emptyState.style.display = "block";
        emptyState.innerHTML = "Memuat data nilai evaluasi...";
    }

    if (tableWrapper) {
        tableWrapper.style.display = "none";
    }

}


function showEmpty(message) {

    if (emptyState) {
        emptyState.style.display = "block";
        emptyState.innerHTML = message;
    }

    if (tableWrapper) {
        tableWrapper.style.display = "none";
    }

}


function hideEmpty() {

    if (emptyState) {
        emptyState.style.display = "none";
    }

    if (tableWrapper) {
        tableWrapper.style.display = "block";
    }

}


function getScoreClass(score) {

    if (score >= 80) {
        return "score-good";
    }

    if (score >= 60) {
        return "score-mid";
    }

    return "score-low";

}


function getPredicate(score) {

    if (score >= 90) {
        return "Sangat Baik";
    }

    if (score >= 80) {
        return "Baik";
    }

    if (score >= 70) {
        return "Cukup Baik";
    }

    if (score >= 60) {
        return "Cukup";
    }

    return "Perlu Perbaikan";

}


function formatMode(mode) {

    if (mode === "exam") {
        return "Ujian";
    }

    if (mode === "practice") {
        return "Latihan";
    }

    return mode || "-";

}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    let date = new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    date = new Date(
        date.getTime() + (7 * 60 * 60 * 1000)
    );

    return date.toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    );

}


function setText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function toArray(value) {

    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {

        try {

            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {
                return parsed;
            }

        } catch (error) {
            return [];
        }

    }

    return [];

}


function getValue(object, keys) {

    if (!object || typeof object !== "object") {
        return "";
    }

    for (let index = 0; index < keys.length; index++) {

        const key = keys[index];

        if (
            object[key] !== undefined
            && object[key] !== null
            && object[key] !== ""
        ) {
            return object[key];
        }

    }

    return "";

}


function getOptions(questionItem) {

    const options = getValue(
        questionItem,
        [
            "options",
            "choices",
            "pilihan"
        ]
    );

    if (Array.isArray(options)) {
        return options;
    }

    return [];

}


function answerToText(answer, options) {

    if (isEmptyAnswer(answer)) {
        return "-";
    }

    if (
        typeof answer === "number"
        && Array.isArray(options)
        && options[answer] !== undefined
    ) {

        return String.fromCharCode(65 + answer)
            + ". "
            + valueToText(options[answer]);

    }

    if (
        typeof answer === "string"
        && /^[0-9]+$/.test(answer)
        && Array.isArray(options)
        && options[Number(answer)] !== undefined
    ) {

        return String.fromCharCode(65 + Number(answer))
            + ". "
            + valueToText(options[Number(answer)]);

    }

    return valueToText(answer);

}


function valueToText(value) {

    if (isEmptyAnswer(value)) {
        return "-";
    }

    if (typeof value === "object") {

        if (value.text) {
            return value.text;
        }

        if (value.label) {
            return value.label;
        }

        if (value.answer) {
            return value.answer;
        }

        return JSON.stringify(value);

    }

    return String(value);

}


function isEmptyAnswer(value) {

    if (value === undefined || value === null) {
        return true;
    }

    if (typeof value === "string" && value.trim() === "") {
        return true;
    }

    if (typeof value === "string" && value.trim() === "-") {
        return true;
    }

    return false;

}


function normalizeAnswer(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/^[a-z]\.\s*/i, "")
        .replace(/\s+/g, " ")
        .trim();

}


// =========================================================
// PRINT / PDF REPORT
// =========================================================

function printEvaluationReport() {

    if (!currentPrintItem) {

        alert("Pilih data siswa terlebih dahulu.");

        return;

    }

    const item = currentPrintItem;

    const printWindow = window.open(
        "",
        "_blank",
        "width=900,height=700"
    );

    if (!printWindow) {

        alert("Popup diblokir browser. Izinkan popup untuk mencetak raport.");

        return;

    }

    const reportHtml = buildPrintableReport(item);

    printWindow.document.open();

    printWindow.document.write(reportHtml);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(function () {

        printWindow.print();

    }, 700);

}


function buildPrintableReport(item) {

    const score = Number(item.score || 0);
    const predicate = getPredicate(score);
    const studentName = getPrintableStudentName(item);

    const questions = toArray(item.questions);
    const answers = toArray(item.answers);

    const total = Math.max(
        questions.length,
        answers.length
    );

    let answerRows = "";

    for (let index = 0; index < total; index++) {

        const questionItem = questions[index] || {};
        const answerItem = answers[index];

        const questionText =
            getValue(
                questionItem,
                [
                    "question",
                    "question_text",
                    "soal",
                    "text",
                    "title"
                ]
            )
            || `Soal ${index + 1}`;

        const options = getOptions(questionItem);

        const userAnswerRaw = getUserAnswer(answerItem, questionItem);
        const correctAnswerRaw = getCorrectAnswer(questionItem, answerItem);

        const userAnswer = answerToText(userAnswerRaw, options);
        const correctAnswer = answerToText(correctAnswerRaw, options);

        const emptyAnswer = isEmptyAnswer(userAnswerRaw);

        let statusLabel = "Salah";

        if (emptyAnswer) {

            statusLabel = "Tidak Dijawab";

        } else {

            const isCorrect = detectCorrectStatus(
                answerItem,
                questionItem,
                userAnswer,
                correctAnswer
            );

            statusLabel = isCorrect ? "Benar" : "Salah";

        }

        const explanation =
            getValue(
                questionItem,
                [
                    "explanation",
                    "pembahasan",
                    "reason"
                ]
            )
            || getValue(
                answerItem,
                [
                    "explanation",
                    "pembahasan",
                    "reason"
                ]
            )
            || "-";

        answerRows += `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHtml(questionText)}</td>
                <td>${emptyAnswer ? "Tidak dijawab" : escapeHtml(userAnswer || "-")}</td>
                <td>${escapeHtml(correctAnswer || "-")}</td>
                <td>${statusLabel}</td>
                <td>${escapeHtml(explanation)}</td>
            </tr>
        `;

    }

    return `
        <!DOCTYPE html>
        <html lang="id">

        <head>
            <meta charset="UTF-8">
            <title>Raport Evaluasi Siswa</title>

            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    color: #111827;
                    background: #ffffff;
                    margin: 0;
                    padding: 24px;
                }

                .report-page {
                    width: 100%;
                    max-width: 960px;
                    margin: 0 auto;
                }

                .header {
                    border-bottom: 4px solid #2563eb;
                    padding-bottom: 16px;
                    margin-bottom: 22px;
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    align-items: flex-start;
                }

                .brand h1 {
                    margin: 0;
                    font-size: 26px;
                    color: #111827;
                }

                .brand p {
                    margin: 6px 0 0 0;
                    color: #4b5563;
                    font-size: 14px;
                }

                .badge {
                    background: #2563eb;
                    color: #ffffff;
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 13px;
                    white-space: nowrap;
                }

                .title {
                    text-align: center;
                    margin: 22px 0;
                }

                .title h2 {
                    margin: 0;
                    font-size: 24px;
                    text-transform: uppercase;
                }

                .title p {
                    margin: 8px 0 0 0;
                    color: #4b5563;
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .summary-card {
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    padding: 14px;
                    background: #f9fafb;
                }

                .summary-card small {
                    display: block;
                    color: #6b7280;
                    font-weight: 700;
                    margin-bottom: 6px;
                }

                .summary-card strong {
                    font-size: 18px;
                    color: #111827;
                }

                .score-box {
                    border: 2px solid #2563eb;
                    border-radius: 14px;
                    padding: 18px;
                    margin-bottom: 22px;
                    text-align: center;
                    background: #eff6ff;
                }

                .score-box h3 {
                    margin: 0 0 8px 0;
                    font-size: 20px;
                }

                .score-number {
                    font-size: 46px;
                    font-weight: 900;
                    color: #2563eb;
                    margin: 6px 0;
                }

                .score-box p {
                    margin: 6px 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 14px;
                    font-size: 12px;
                }

                th {
                    background: #111827;
                    color: #ffffff;
                    padding: 9px;
                    border: 1px solid #111827;
                    text-align: left;
                }

                td {
                    padding: 9px;
                    border: 1px solid #d1d5db;
                    vertical-align: top;
                    line-height: 1.45;
                }

                tr:nth-child(even) td {
                    background: #f9fafb;
                }

                .section-title {
                    margin: 22px 0 8px 0;
                    font-size: 18px;
                    color: #111827;
                }

                .signature {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    margin-top: 40px;
                    text-align: center;
                }

                .signature-box {
                    min-height: 120px;
                }

                .signature-line {
                    margin-top: 70px;
                    border-top: 1px solid #111827;
                    padding-top: 8px;
                    font-weight: 700;
                }

                .footer-note {
                    margin-top: 26px;
                    font-size: 11px;
                    color: #6b7280;
                    text-align: center;
                }

                @page {
                    size: A4;
                    margin: 14mm;
                }

                @media print {
                    body {
                        padding: 0;
                    }

                    .report-page {
                        max-width: 100%;
                    }
                }
            </style>
        </head>

        <body>

            <div class="report-page">

                <div class="header">

                    <div class="brand">
                        <h1>GURU AI JSKM</h1>
                        <p>Raport Digital Evaluasi Pembelajaran</p>
                    </div>

                    <div class="badge">
                        RAPORT EVALUASI
                    </div>

                </div>

                <div class="title">
                    <h2>Raport Evaluasi Siswa</h2>
                    <p>Hasil quiz berdasarkan materi pembelajaran</p>
                </div>

                <div class="summary-grid">

                    <div class="summary-card">
                        <small>Nama Siswa</small>
                        <strong>${escapeHtml(studentName)}</strong>
                    </div>

                    <div class="summary-card">
                        <small>ID Siswa</small>
                        <strong>${escapeHtml(item.student_id || "-")}</strong>
                    </div>

                    <div class="summary-card">
                        <small>BAB</small>
                        <strong>${escapeHtml(item.chapter_code || "-")}</strong>
                    </div>

                    <div class="summary-card">
                        <small>Judul Materi</small>
                        <strong>${escapeHtml(item.chapter_title || "-")}</strong>
                    </div>

                    <div class="summary-card">
                        <small>Mode Quiz</small>
                        <strong>${escapeHtml(formatMode(item.quiz_mode))}</strong>
                    </div>

                    <div class="summary-card">
                        <small>Tanggal Pengerjaan</small>
                        <strong>${escapeHtml(formatDate(item.created_at))}</strong>
                    </div>

                </div>

                <div class="score-box">
                    <h3>Nilai Akhir</h3>
                    <div class="score-number">
                        ${score}
                    </div>
                    <p>
                        Predikat: <strong>${predicate}</strong>
                    </p>
                    <p>
                        Benar ${escapeHtml(item.correct_answers || 0)}
                        dari ${escapeHtml(item.total_questions || 0)} soal,
                        salah ${escapeHtml(item.wrong_answers || 0)} soal.
                    </p>
                </div>

                <h3 class="section-title">
                    Detail Jawaban Siswa
                </h3>

                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Soal</th>
                            <th>Jawaban Siswa</th>
                            <th>Jawaban Benar</th>
                            <th>Status</th>
                            <th>Pembahasan</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${answerRows}
                    </tbody>
                </table>

                <div class="signature">

                    <div class="signature-box">
                        <p>Mengetahui,</p>
                        <div class="signature-line">
                            Pembimbing
                        </div>
                    </div>

                    <div class="signature-box">
                        <p>Siswa,</p>
                        <div class="signature-line">
                            ${escapeHtml(studentName)}
                        </div>
                    </div>

                </div>

                <div class="footer-note">
                    Dokumen ini dicetak melalui sistem GURU AI JSKM.
                    Untuk menyimpan sebagai PDF, pilih printer “Save as PDF” atau “Microsoft Print to PDF”.
                </div>

            </div>

        </body>

        </html>
    `;

}


function getPrintableStudentName(item) {

    const name = String(item.student_name || "").trim();

    if (!name) {
        return "Nama Siswa";
    }

    if (
        name.toLowerCase() === "admin"
        || name.toLowerCase() === "administrator"
    ) {
        return "Nama Siswa";
    }

    return name;

}


function printEvaluationDetail() {

    printEvaluationReport();

}