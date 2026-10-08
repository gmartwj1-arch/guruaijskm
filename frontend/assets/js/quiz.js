// =========================================================
// GURU AI JSKM
// QUIZ JS
// FILE 12.15
// WAJIB MENJAWAB SEMUA SOAL SEBELUM LANJUT / SUBMIT
// =========================================================

console.log("Quiz JS 12.15 Loaded");


// =========================================================
// GLOBAL VARIABLE
// =========================================================

let allChapters = [];
let currentChapter = null;
let quizQuestions = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let quizStarted = false;
let quizSubmitted = false;


// =========================================================
// ELEMENT
// =========================================================

const quizChapterSelect = document.getElementById("quizChapterSelect");
const quizModeSelect = document.getElementById("quizModeSelect");

const startQuizBtn = document.getElementById("startQuizBtn");
const resetQuizBtn = document.getElementById("resetQuizBtn");

const totalQuestionInfo = document.getElementById("totalQuestionInfo");
const activeQuestionInfo = document.getElementById("activeQuestionInfo");
const answeredInfo = document.getElementById("answeredInfo");
const quizStatusInfo = document.getElementById("quizStatusInfo");

const quizPanelTitle = document.getElementById("quizPanelTitle");
const questionCounter = document.getElementById("questionCounter");

const emptyQuizState = document.getElementById("emptyQuizState");
const questionBox = document.getElementById("questionBox");
const questionText = document.getElementById("questionText");
const optionList = document.getElementById("optionList");

const quizNavigation = document.getElementById("quizNavigation");
const prevQuestionBtn = document.getElementById("prevQuestionBtn");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const submitQuizBtn = document.getElementById("submitQuizBtn");

const resultPanel = document.getElementById("resultPanel");
const resultScore = document.getElementById("resultScore");
const resultSummary = document.getElementById("resultSummary");
const reviewList = document.getElementById("reviewList");


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setupEvents();

    loadChapters();

    resetQuizView();

});


// =========================================================
// SETUP EVENTS
// =========================================================

function setupEvents() {

    if (startQuizBtn) {

        startQuizBtn.addEventListener("click", function () {

            startQuiz();

        });

    }

    if (resetQuizBtn) {

        resetQuizBtn.addEventListener("click", function () {

            resetQuiz();

        });

    }

    if (prevQuestionBtn) {

        prevQuestionBtn.addEventListener("click", function () {

            goToPreviousQuestion();

        });

    }

    if (nextQuestionBtn) {

        nextQuestionBtn.addEventListener("click", function () {

            goToNextQuestion();

        });

    }

    if (submitQuizBtn) {

        submitQuizBtn.addEventListener("click", function () {

            submitQuiz();

        });

    }

}


// =========================================================
// LOAD CHAPTERS
// =========================================================

async function loadChapters() {

    try {

        setStatus(
            "Memuat daftar BAB..."
        );

        const response = await fetch(
            "/api/admin/modules"
        );

        if (!response.ok) {

            throw new Error(
                "Gagal memuat data BAB."
            );

        }

        const result = await response.json();

        allChapters = extractChapters(
            result
        );

        renderChapterOptions();

        setStatus(
            "Pilih BAB, lalu klik Mulai Quiz."
        );

    } catch (error) {

        console.error(
            "Load Chapters Error:",
            error
        );

        setStatus(
            "Gagal memuat daftar BAB."
        );

        if (quizChapterSelect) {

            quizChapterSelect.innerHTML = `
                <option value="">
                    Gagal memuat BAB
                </option>
            `;

        }

    }

}


function extractChapters(result) {

    if (Array.isArray(result)) {

        return result;

    }

    if (Array.isArray(result.data)) {

        return result.data;

    }

    if (Array.isArray(result.chapters)) {

        return result.chapters;

    }

    if (
        result.data
        && Array.isArray(result.data.chapters)
    ) {

        return result.data.chapters;

    }

    if (
        result.module
        && Array.isArray(result.chapters)
    ) {

        return result.chapters;

    }

    return [];

}


function renderChapterOptions() {

    if (!quizChapterSelect) {

        return;

    }

    quizChapterSelect.innerHTML = "";

    if (!allChapters || allChapters.length === 0) {

        quizChapterSelect.innerHTML = `
            <option value="">
                Belum ada BAB
            </option>
        `;

        return;

    }

    const defaultOption = document.createElement("option");

    defaultOption.value = "";
    defaultOption.textContent = "Pilih BAB / Materi";

    quizChapterSelect.appendChild(
        defaultOption
    );

    allChapters.forEach(function (chapter, index) {

        const chapterNumber = getChapterNumber(
            chapter,
            index
        );

        const chapterCode = getChapterCode(
            chapter,
            chapterNumber
        );

        const chapterTitle = getChapterTitle(
            chapter
        );

        const option = document.createElement("option");

        option.value = chapterNumber;

        option.textContent = `${chapterCode} - ${chapterTitle}`;

        quizChapterSelect.appendChild(
            option
        );

    });

}


// =========================================================
// START QUIZ
// =========================================================

async function startQuiz() {

    const selectedChapterNumber = quizChapterSelect
        ? Number(quizChapterSelect.value)
        : 0;

    const selectedMode = quizModeSelect
        ? quizModeSelect.value
        : "practice";

    if (!selectedChapterNumber) {

        alert(
            "Pilih BAB terlebih dahulu."
        );

        return;

    }

    try {

        setStatus(
            "Menyiapkan soal quiz..."
        );

        const response = await fetch(
            `/api/admin/modules/${selectedChapterNumber}`
        );

        if (!response.ok) {

            throw new Error(
                "Gagal mengambil detail BAB."
            );

        }

        const result = await response.json();

        currentChapter = extractChapterDetail(
            result
        );

        if (!currentChapter) {

            throw new Error(
                "Detail BAB tidak ditemukan."
            );

        }

        quizQuestions = buildQuizQuestions(
            currentChapter,
            selectedMode
        );

        if (!quizQuestions || quizQuestions.length === 0) {

            alert(
                "Soal quiz belum tersedia untuk BAB ini."
            );

            resetQuizView();

            return;

        }

        userAnswers = new Array(
            quizQuestions.length
        ).fill(null);

        currentQuestionIndex = 0;
        quizStarted = true;
        quizSubmitted = false;

        showQuizView();

        renderQuestion();

        updateQuizInfo();

        setStatus(
            "Quiz dimulai. Semua soal wajib dijawab."
        );

    } catch (error) {

        console.error(
            "Start Quiz Error:",
            error
        );

        alert(
            "Gagal memulai quiz. Periksa data materi atau server."
        );

        setStatus(
            "Gagal memulai quiz."
        );

    }

}


function extractChapterDetail(result) {

    if (!result) {

        return null;

    }

    if (result.data && typeof result.data === "object") {

        return result.data;

    }

    if (result.chapter && typeof result.chapter === "object") {

        return result.chapter;

    }

    if (result.success && result.data) {

        return result.data;

    }

    if (result.sections || result.title || result.code) {

        return result;

    }

    return null;

}


// =========================================================
// BUILD QUESTIONS
// =========================================================

function buildQuizQuestions(chapter, mode) {

    const sections = getSections(
        chapter
    );

    const questionTarget = mode === "exam"
        ? 15
        : 10;

    const questionPool = [];

    sections.forEach(function (section, index) {

        const sectionTitle = getSectionTitle(
            section,
            index
        );

        const sectionCode = getSectionCode(
            section,
            chapter,
            index
        );

        const otherTitles = sections
            .map(function (item, itemIndex) {

                return getSectionTitle(
                    item,
                    itemIndex
                );

            })
            .filter(function (title) {

                return title && title !== sectionTitle;

            });

        const titleOptions = buildOptions(
            sectionTitle,
            otherTitles,
            [
                "Layout Feed Instagram",
                "Smart Guides",
                "Grouping Layer",
                "Workspace Photoshop",
                "Grid System",
                "Target Audiens"
            ]
        );

        questionPool.push({
            question: `Apa topik utama dari submateri ${sectionCode} dalam ${getChapterCode(chapter, getChapterNumber(chapter, 0))}?`,
            options: titleOptions,
            answer: sectionTitle,
            explanation: `Jawaban yang benar adalah ${sectionTitle}, karena submateri ${sectionCode} membahas topik tersebut.`
        });

        questionPool.push({
            question: `Mengapa materi ${sectionTitle} penting untuk siswa PKL DKV?`,
            options: [
                "Karena membantu siswa memahami konsep dan menerapkannya dalam karya desain.",
                "Karena hanya perlu dihafal tanpa praktik.",
                "Karena hanya digunakan untuk teori tanpa proyek.",
                "Karena tidak berhubungan dengan karya visual."
            ],
            answer: "Karena membantu siswa memahami konsep dan menerapkannya dalam karya desain.",
            explanation: "Materi DKV penting karena membantu siswa memahami konsep, membuat karya, menerima revisi, dan menjelaskan hasil desain."
        });

        questionPool.push({
            question: `Dalam pembelajaran DKV, materi ${sectionTitle} paling berkaitan dengan apa?`,
            options: [
                "Mengabaikan konsep dan langsung membuat karya tanpa brief.",
                "Pembuatan karya visual, konsep desain, dan penerapan di proyek.",
                "Mengumpulkan tugas tanpa revisi dan evaluasi.",
                "Membuat desain tanpa memperhatikan target audiens."
            ],
            answer: "Pembuatan karya visual, konsep desain, dan penerapan di proyek.",
            explanation: `Materi ${sectionTitle} berkaitan dengan pembelajaran DKV, terutama karya visual, konsep, dan praktik desain.`
        });

    });

    if (questionPool.length === 0) {

        questionPool.push({
            question: `Apa tujuan utama mempelajari ${getChapterTitle(chapter)}?`,
            options: [
                "Untuk memahami konsep desain dan menerapkannya dalam karya.",
                "Untuk menghafal tanpa praktik.",
                "Untuk mengabaikan proses desain.",
                "Untuk membuat karya tanpa evaluasi."
            ],
            answer: "Untuk memahami konsep desain dan menerapkannya dalam karya.",
            explanation: "Pembelajaran DKV menekankan pemahaman konsep, praktik, evaluasi, dan penerapan karya visual."
        });

    }

    const shuffledQuestions = shuffleArray(
        questionPool
    );

    const finalQuestions = [];

    let pointer = 0;

    while (
        finalQuestions.length < questionTarget
        && shuffledQuestions.length > 0
    ) {

        const source = shuffledQuestions[
            pointer % shuffledQuestions.length
        ];

        finalQuestions.push({
            question: source.question,
            options: shuffleOptionsKeepingAnswer(
                source.options,
                source.answer
            ).options,
            answer: source.answer,
            explanation: source.explanation
        });

        pointer += 1;

        if (
            pointer > shuffledQuestions.length * 3
            && finalQuestions.length >= shuffledQuestions.length
        ) {

            break;

        }

    }

    return finalQuestions.slice(
        0,
        questionTarget
    );

}


function getSections(chapter) {

    if (
        chapter
        && Array.isArray(chapter.sections)
        && chapter.sections.length > 0
    ) {

        return chapter.sections;

    }

    if (
        chapter
        && Array.isArray(chapter.materials)
        && chapter.materials.length > 0
    ) {

        return chapter.materials;

    }

    return [
        {
            title: getChapterTitle(
                chapter
            ),
            code: getChapterCode(
                chapter,
                getChapterNumber(
                    chapter,
                    0
                )
            )
        }
    ];

}


function getSectionTitle(section, index) {

    return section.title
        || section.name
        || section.sub_title
        || section.heading
        || `Submateri ${index + 1}`;

}


function getSectionCode(section, chapter, index) {

    return section.code
        || section.number
        || section.section
        || `${getChapterNumber(chapter, 0)}.${index + 1}`;

}


function buildOptions(correctAnswer, sourceOptions, fallbackOptions) {

    const options = [];

    options.push(
        correctAnswer
    );

    sourceOptions.forEach(function (item) {

        if (
            item
            && item !== correctAnswer
            && !options.includes(item)
            && options.length < 4
        ) {

            options.push(
                item
            );

        }

    });

    fallbackOptions.forEach(function (item) {

        if (
            item
            && item !== correctAnswer
            && !options.includes(item)
            && options.length < 4
        ) {

            options.push(
                item
            );

        }

    });

    while (options.length < 4) {

        options.push(
            `Pilihan ${options.length + 1}`
        );

    }

    return shuffleArray(
        options
    );

}


function shuffleOptionsKeepingAnswer(options, answer) {

    return {
        options: shuffleArray(
            options
        ),
        answer: answer
    };

}


// =========================================================
// RENDER QUESTION
// =========================================================

function renderQuestion() {

    if (
        !quizQuestions
        || quizQuestions.length === 0
    ) {

        return;

    }

    const currentQuestion = quizQuestions[
        currentQuestionIndex
    ];

    if (questionText) {

        questionText.textContent = currentQuestion.question;

    }

    if (questionCounter) {

        questionCounter.textContent = `Soal ${currentQuestionIndex + 1} dari ${quizQuestions.length}`;

    }

    if (quizPanelTitle) {

        quizPanelTitle.textContent = getChapterTitle(
            currentChapter
        );

    }

    if (optionList) {

        optionList.innerHTML = "";

        currentQuestion.options.forEach(function (option, index) {

            const optionButton = document.createElement("button");

            optionButton.type = "button";

            optionButton.className = "quiz-option-button";

            const isSelected = userAnswers[currentQuestionIndex] === option;

            optionButton.innerHTML = `
                <span style="
                    display:inline-flex;
                    width:28px;
                    height:28px;
                    align-items:center;
                    justify-content:center;
                    border-radius:999px;
                    background:${isSelected ? "#22c55e" : "#334155"};
                    color:#ffffff;
                    font-weight:900;
                    margin-right:10px;
                ">
                    ${String.fromCharCode(65 + index)}
                </span>
                <span>${escapeHtml(option)}</span>
            `;

            optionButton.style.width = "100%";
            optionButton.style.textAlign = "left";
            optionButton.style.padding = "16px";
            optionButton.style.marginBottom = "12px";
            optionButton.style.borderRadius = "14px";
            optionButton.style.border = isSelected
                ? "2px solid #22c55e"
                : "1px solid #334155";
            optionButton.style.background = isSelected
                ? "#064e3b"
                : "#111827";
            optionButton.style.color = "#ffffff";
            optionButton.style.cursor = "pointer";
            optionButton.style.fontWeight = "700";

            optionButton.addEventListener("click", function () {

                selectAnswer(
                    option
                );

            });

            optionList.appendChild(
                optionButton
            );

        });

    }

    updateNavigationButtons();

    updateQuizInfo();

}


// =========================================================
// ANSWER
// =========================================================

function selectAnswer(answer) {

    if (quizSubmitted) {

        return;

    }

    userAnswers[currentQuestionIndex] = answer;

    renderQuestion();

    setStatus(
        `Soal ${currentQuestionIndex + 1} sudah dijawab.`
    );

}


function isCurrentQuestionAnswered() {

    return !isEmptyAnswer(
        userAnswers[currentQuestionIndex]
    );

}


function findFirstUnansweredIndex() {

    for (
        let index = 0;
        index < userAnswers.length;
        index++
    ) {

        if (
            isEmptyAnswer(
                userAnswers[index]
            )
        ) {

            return index;

        }

    }

    return -1;

}


function countAnsweredQuestions() {

    return userAnswers.filter(function (answer) {

        return !isEmptyAnswer(
            answer
        );

    }).length;

}


// =========================================================
// NAVIGATION
// =========================================================

function goToPreviousQuestion() {

    if (currentQuestionIndex <= 0) {

        return;

    }

    currentQuestionIndex -= 1;

    renderQuestion();

}


function goToNextQuestion() {

    if (!isCurrentQuestionAnswered()) {

        alert(
            "Soal ini wajib dijawab dulu sebelum lanjut ke soal berikutnya."
        );

        setStatus(
            `Soal ${currentQuestionIndex + 1} belum dijawab.`
        );

        return;

    }

    if (
        currentQuestionIndex
        >= quizQuestions.length - 1
    ) {

        return;

    }

    currentQuestionIndex += 1;

    renderQuestion();

}


function updateNavigationButtons() {

    if (prevQuestionBtn) {

        prevQuestionBtn.disabled = currentQuestionIndex === 0;

    }

    if (nextQuestionBtn) {

        nextQuestionBtn.style.display =
            currentQuestionIndex < quizQuestions.length - 1
                ? "inline-block"
                : "none";

    }

    if (submitQuizBtn) {

        submitQuizBtn.style.display =
            currentQuestionIndex === quizQuestions.length - 1
                ? "inline-block"
                : "none";

    }

}


// =========================================================
// SUBMIT QUIZ
// =========================================================

async function submitQuiz() {

    if (!quizStarted || quizSubmitted) {

        return;

    }

    const firstUnanswered = findFirstUnansweredIndex();

    if (firstUnanswered !== -1) {

        alert(
            `Masih ada soal yang belum dijawab, yaitu Soal ${firstUnanswered + 1}. Semua soal wajib dijawab sebelum selesai.`
        );

        currentQuestionIndex = firstUnanswered;

        renderQuestion();

        setStatus(
            `Soal ${firstUnanswered + 1} wajib dijawab.`
        );

        return;

    }

    const confirmSubmit = confirm(
        "Semua soal sudah dijawab. Yakin ingin menyelesaikan quiz?"
    );

    if (!confirmSubmit) {

        return;

    }

    quizSubmitted = true;

    const result = calculateResult();

    await saveQuizResult(
        result
    );

    showResult(
        result
    );

}


// =========================================================
// CALCULATE RESULT
// =========================================================

function calculateResult() {

    let correctCount = 0;

    quizQuestions.forEach(function (question, index) {

        const studentAnswer = userAnswers[index];

        if (
            normalizeText(studentAnswer)
            === normalizeText(question.answer)
        ) {

            correctCount += 1;

        }

    });

    const totalQuestions = quizQuestions.length;

    const wrongCount = totalQuestions - correctCount;

    const score = totalQuestions > 0
        ? Math.round(
            (correctCount / totalQuestions) * 100
        )
        : 0;

    return {
        totalQuestions: totalQuestions,
        correctCount: correctCount,
        wrongCount: wrongCount,
        score: score
    };

}


// =========================================================
// SAVE RESULT
// =========================================================

async function saveQuizResult(result) {

    const student = getCurrentStudent();

    const chapterNumber = getChapterNumber(
        currentChapter,
        0
    );

    const payload = {
        student_id: student.id,
        student_name: student.name,
        chapter_number: chapterNumber,
        chapter_code: getChapterCode(
            currentChapter,
            chapterNumber
        ),
        chapter_title: getChapterTitle(
            currentChapter
        ),
        quiz_mode: quizModeSelect
            ? quizModeSelect.value
            : "practice",
        total_questions: result.totalQuestions,
        correct_answers: result.correctCount,
        wrong_answers: result.wrongCount,
        score: result.score,
        answers: userAnswers,
        questions: quizQuestions
    };

    try {

        const response = await fetch(
            "/api/quiz-results",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    payload
                )
            }
        );

        const data = await response.json();

        if (!data.success) {

            alert(
                "Nilai quiz tersimpan sementara di browser, tetapi belum berhasil masuk database."
            );

            console.error(
                "Save Quiz Result Failed:",
                data
            );

            return;

        }

        setStatus(
            "Nilai berhasil disimpan ke database."
        );

    } catch (error) {

        console.error(
            "Save Quiz Result Error:",
            error
        );

        alert(
            "Nilai quiz tersimpan sementara di browser, tetapi gagal masuk database."
        );

    }

}


function getCurrentStudent() {

    const possibleKeys = [
        "eguru_user",
        "currentUser",
        "user",
        "loginUser"
    ];

    for (
        let index = 0;
        index < possibleKeys.length;
        index++
    ) {

        const key = possibleKeys[index];

        const raw = localStorage.getItem(
            key
        );

        if (!raw) {

            continue;

        }

        try {

            const parsed = JSON.parse(
                raw
            );

            return {
                id: parsed.id || parsed.user_id || 1,
                name: parsed.full_name || parsed.name || parsed.username || "admin"
            };

        } catch (error) {

            if (raw) {

                return {
                    id: 1,
                    name: raw
                };

            }

        }

    }

    return {
        id: 1,
        name: "admin"
    };

}


// =========================================================
// RESULT VIEW
// =========================================================

function showResult(result) {

    if (resultPanel) {

        resultPanel.style.display = "block";

    }

    if (resultScore) {

        resultScore.textContent = result.score;

    }

    if (resultSummary) {

        resultSummary.textContent = `Benar ${result.correctCount} dari ${result.totalQuestions} soal. Salah ${result.wrongCount} soal.`;

    }

    if (reviewList) {

        reviewList.innerHTML = "";

        quizQuestions.forEach(function (question, index) {

            const studentAnswer = userAnswers[index];

            const isCorrect =
                normalizeText(studentAnswer)
                === normalizeText(question.answer);

            const reviewCard = document.createElement("div");

            reviewCard.style.background = "#0b1220";
            reviewCard.style.border = isCorrect
                ? "1px solid #22c55e"
                : "1px solid #ef4444";
            reviewCard.style.borderLeft = isCorrect
                ? "6px solid #22c55e"
                : "6px solid #ef4444";
            reviewCard.style.borderRadius = "16px";
            reviewCard.style.padding = "18px";
            reviewCard.style.marginBottom = "14px";
            reviewCard.style.color = "#ffffff";

            reviewCard.innerHTML = `
                <strong>
                    Soal ${index + 1}
                </strong>

                <p>
                    ${escapeHtml(question.question)}
                </p>

                <p>
                    <strong>Jawaban kamu:</strong>
                    ${escapeHtml(studentAnswer)}
                </p>

                <p>
                    <strong>Jawaban benar:</strong>
                    ${escapeHtml(question.answer)}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${isCorrect ? "Benar" : "Salah"}
                </p>

                <p>
                    <strong>Pembahasan:</strong>
                    ${escapeHtml(question.explanation || "-")}
                </p>
            `;

            reviewList.appendChild(
                reviewCard
            );

        });

    }

    if (quizNavigation) {

        quizNavigation.style.display = "none";

    }

    setStatus(
        "Quiz selesai. Nilai sudah dihitung."
    );

    if (resultPanel) {

        resultPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


// =========================================================
// RESET
// =========================================================

function resetQuiz() {

    const confirmReset = confirm(
        "Yakin ingin mengulang quiz?"
    );

    if (!confirmReset) {

        return;

    }

    resetQuizView();

}


function resetQuizView() {

    currentChapter = null;
    quizQuestions = [];
    userAnswers = [];
    currentQuestionIndex = 0;
    quizStarted = false;
    quizSubmitted = false;

    if (emptyQuizState) {

        emptyQuizState.style.display = "block";

    }

    if (questionBox) {

        questionBox.style.display = "none";

    }

    if (quizNavigation) {

        quizNavigation.style.display = "none";

    }

    if (resultPanel) {

        resultPanel.style.display = "none";

    }

    if (questionText) {

        questionText.textContent = "";

    }

    if (optionList) {

        optionList.innerHTML = "";

    }

    if (questionCounter) {

        questionCounter.textContent = "Belum mulai";

    }

    updateQuizInfo();

    setStatus(
        "Pilih BAB dan mode quiz terlebih dahulu."
    );

}


function showQuizView() {

    if (emptyQuizState) {

        emptyQuizState.style.display = "none";

    }

    if (questionBox) {

        questionBox.style.display = "block";

    }

    if (quizNavigation) {

        quizNavigation.style.display = "flex";

    }

    if (resultPanel) {

        resultPanel.style.display = "none";

    }

}


// =========================================================
// INFO
// =========================================================

function updateQuizInfo() {

    const totalQuestions = quizQuestions.length;

    const answeredQuestions = countAnsweredQuestions();

    if (totalQuestionInfo) {

        totalQuestionInfo.textContent = totalQuestions;

    }

    if (activeQuestionInfo) {

        activeQuestionInfo.textContent = quizStarted
            ? currentQuestionIndex + 1
            : 0;

    }

    if (answeredInfo) {

        answeredInfo.textContent = `${answeredQuestions}/${totalQuestions}`;

    }

}


function setStatus(message) {

    if (quizStatusInfo) {

        quizStatusInfo.textContent = message;

    }

}


// =========================================================
// HELPER
// =========================================================

function getChapterNumber(chapter, index) {

    return Number(
        chapter.chapter
        || chapter.number
        || chapter.chapter_number
        || chapter.id
        || index + 1
    );

}


function getChapterCode(chapter, chapterNumber) {

    return chapter.code
        || chapter.chapter_code
        || `BAB ${toRoman(chapterNumber)}`;

}


function getChapterTitle(chapter) {

    return chapter.title
        || chapter.chapter_title
        || chapter.name
        || "Materi DKV";

}


function toRoman(number) {

    const map = [
        [1000, "M"],
        [900, "CM"],
        [500, "D"],
        [400, "CD"],
        [100, "C"],
        [90, "XC"],
        [50, "L"],
        [40, "XL"],
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"]
    ];

    let result = "";
    let num = Number(number) || 0;

    map.forEach(function (item) {

        while (num >= item[0]) {

            result += item[1];

            num -= item[0];

        }

    });

    return result || number;

}


function shuffleArray(array) {

    const copiedArray = [
        ...array
    ];

    for (
        let index = copiedArray.length - 1;
        index > 0;
        index--
    ) {

        const randomIndex = Math.floor(
            Math.random() * (index + 1)
        );

        const temp = copiedArray[index];

        copiedArray[index] = copiedArray[randomIndex];

        copiedArray[randomIndex] = temp;

    }

    return copiedArray;

}


function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}


function isEmptyAnswer(value) {

    return (
        value === undefined
        || value === null
        || String(value).trim() === ""
        || String(value).trim() === "-"
    );

}


function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}