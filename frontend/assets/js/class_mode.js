// =========================================================
// GURU AI JSKM
// CLASS MODE JS
// FILE 14.6
// GURU AI SMART CLASSROOM INDONESIA
// =========================================================

console.log("Class Mode JS 14.6 Loaded");


var classMajor = localStorage.getItem("selected_major") || "DKV";
var classChapters = [];
var classChapter = null;
var classSections = [];

var classVoice = null;
var classSpeechParts = [];
var classSpeechIndex = 0;

var classInteractiveMode = false;
var classIsTeaching = false;
var classIsAnswering = false;
var classPaused = false;

var classRecognition = null;
var classListening = false;
var recognitionMode = "question";

var lastClassQuestion = "";
var lastClassAnswer = "";
var lastSpokenText = "";
var currentSpeakingText = "";

var discussionMode = false;
var interruptHandled = false;
var autoInterruptEnabled = true;


// =========================================================
// ELEMENT
// =========================================================

var classMajorSelect = document.getElementById("classMajorSelect");
var classChapterSelect = document.getElementById("classChapterSelect");

var classChapterCode = document.getElementById("classChapterCode");
var classChapterTitle = document.getElementById("classChapterTitle");
var classChapterDescription = document.getElementById("classChapterDescription");

var startClassButton = document.getElementById("startClassButton");
var askSessionButton = document.getElementById("askSessionButton");
var pauseClassButton = document.getElementById("pauseClassButton");
var repeatClassButton = document.getElementById("repeatClassButton");
var nextChapterButton = document.getElementById("nextChapterButton");
var stopClassButton = document.getElementById("stopClassButton");

var classVoiceSelect = document.getElementById("classVoiceSelect");
var testClassVoiceButton = document.getElementById("testClassVoiceButton");
var greetClassButton = document.getElementById("greetClassButton");
var focusReminderButton = document.getElementById("focusReminderButton");

var classVoiceStatus = document.getElementById("classVoiceStatus");
var classProgressBar = document.getElementById("classProgressBar");
var classProgressText = document.getElementById("classProgressText");

var classQuestionInput = document.getElementById("classQuestionInput");
var sendQuestionButton = document.getElementById("sendQuestionButton");
var startMicClassButton = document.getElementById("startMicClassButton");
var stopMicClassButton = document.getElementById("stopMicClassButton");

var classMicStatus = document.getElementById("classMicStatus");
var classAnswerBox = document.getElementById("classAnswerBox");
var classLessonList = document.getElementById("classLessonList");

var stopAnswerButton = document.getElementById("stopAnswerButton");
var summarizeAnswerButton = document.getElementById("summarizeAnswerButton");
var easyAnswerButton = document.getElementById("easyAnswerButton");
var exampleAnswerButton = document.getElementById("exampleAnswerButton");
var continueAnswerButton = document.getElementById("continueAnswerButton");
var studentResponseButton = document.getElementById("studentResponseButton");


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    classMajor = normalizeMajor(classMajor);

    if (classMajorSelect) {
        classMajorSelect.value = classMajor;
    }

    setupClassEvents();

    setupClassRecognition();

    loadClassVoices();

    loadClassChapters(classMajor);

});


if ("speechSynthesis" in window) {

    window.speechSynthesis.onvoiceschanged = function () {
        loadClassVoices();
    };

}


// =========================================================
// EVENTS
// =========================================================

function setupClassEvents() {

    if (classMajorSelect) {

        classMajorSelect.onchange = function () {

            classMajor = normalizeMajor(classMajorSelect.value);

            localStorage.setItem("selected_major", classMajor);

            stopClassMode();

            loadClassChapters(classMajor);

        };

    }

    if (classChapterSelect) {

        classChapterSelect.onchange = function () {

            var chapterNumber = Number(classChapterSelect.value || 0);

            if (chapterNumber) {

                localStorage.setItem("selected_chapter", chapterNumber);

                stopClassMode();

                loadClassChapterDetail(classMajor, chapterNumber);

            }

        };

    }

    if (startClassButton) {
        startClassButton.onclick = startClassTeaching;
    }

    if (askSessionButton) {
        askSessionButton.onclick = startQuestionSession;
    }

    if (pauseClassButton) {
        pauseClassButton.onclick = pauseClassVoice;
    }

    if (repeatClassButton) {
        repeatClassButton.onclick = repeatClassTeaching;
    }

    if (nextChapterButton) {
        nextChapterButton.onclick = goNextChapter;
    }

    if (stopClassButton) {
        stopClassButton.onclick = stopClassMode;
    }

    if (testClassVoiceButton) {
        testClassVoiceButton.onclick = testClassVoice;
    }

    if (greetClassButton) {
        greetClassButton.onclick = greetClass;
    }

    if (focusReminderButton) {
        focusReminderButton.onclick = focusReminder;
    }

    if (classVoiceSelect) {

        classVoiceSelect.onchange = function () {

            var voices = window.speechSynthesis.getVoices();

            classVoice = voices.find(function (voice) {
                return voice.name === classVoiceSelect.value;
            }) || null;

        };

    }

    if (sendQuestionButton) {
        sendQuestionButton.onclick = function () {
            answerClassQuestion(false);
        };
    }

    if (classQuestionInput) {

        classQuestionInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter") {
                answerClassQuestion(false);
            }

        });

    }

    if (startMicClassButton) {
        startMicClassButton.onclick = startClassMic;
    }

    if (stopMicClassButton) {
        stopMicClassButton.onclick = stopClassMic;
    }

    if (stopAnswerButton) {
        stopAnswerButton.onclick = stopCurrentAnswer;
    }

    if (summarizeAnswerButton) {
        summarizeAnswerButton.onclick = summarizeLastAnswer;
    }

    if (easyAnswerButton) {
        easyAnswerButton.onclick = explainEasyAnswer;
    }

    if (exampleAnswerButton) {
        exampleAnswerButton.onclick = giveExampleAnswer;
    }

    if (continueAnswerButton) {
        continueAnswerButton.onclick = continueLastAnswer;
    }

    if (studentResponseButton) {
        studentResponseButton.onclick = startStudentResponse;
    }

}


// =========================================================
// LOAD MODULE
// =========================================================

async function loadClassChapters(majorCode) {

    try {

        classMajor = normalizeMajor(majorCode);

        setText(classChapterTitle, "Memuat modul " + classMajor + "...");
        setText(classChapterDescription, "Mengambil data BAB untuk mode kelas.");

        if (classChapterSelect) {

            classChapterSelect.innerHTML = `
                <option value="">
                    Memuat BAB...
                </option>
            `;

        }

        var response = await fetch("/api/majors/" + classMajor + "/modules");

        if (!response.ok) {
            throw new Error("API modul gagal dibuka.");
        }

        var result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Modul gagal dimuat.");
        }

        classChapters = normalizeChapters(result.chapters || result.data || []);

        renderClassChapterOptions();

        var savedChapter = Number(localStorage.getItem("selected_chapter") || 0);

        var firstChapter = classChapters[0]
            ? classChapters[0].chapter
            : 0;

        var targetChapter = classChapters.some(function (item) {
            return Number(item.chapter) === savedChapter;
        })
            ? savedChapter
            : firstChapter;

        if (targetChapter) {

            if (classChapterSelect) {
                classChapterSelect.value = targetChapter;
            }

            loadClassChapterDetail(classMajor, targetChapter);

        } else {

            showClassNoModule();

        }

    } catch (error) {

        console.error("Load Class Chapters Error:", error);

        setText(classChapterTitle, "Modul gagal dimuat");
        setText(classChapterDescription, "Pastikan file modul tersedia dan server berjalan.");

    }

}


function renderClassChapterOptions() {

    if (!classChapterSelect) {
        return;
    }

    classChapterSelect.innerHTML = "";

    if (!classChapters || classChapters.length === 0) {

        classChapterSelect.innerHTML = `
            <option value="">
                Belum ada BAB
            </option>
        `;

        return;

    }

    classChapters.forEach(function (chapter) {

        var option = document.createElement("option");

        option.value = chapter.chapter;
        option.textContent = chapter.code + " — " + chapter.title;

        classChapterSelect.appendChild(option);

    });

}


async function loadClassChapterDetail(majorCode, chapterNumber) {

    try {

        var response = await fetch(
            "/api/majors/" + majorCode + "/modules/" + chapterNumber
        );

        if (!response.ok) {
            throw new Error("Detail BAB gagal dibuka.");
        }

        var result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.message || "BAB tidak ditemukan.");
        }

        classChapter = normalizeChapter(result.data, chapterNumber);

        classSections = classChapter.sections || [];

        renderClassChapter();

        renderClassLessonList();

        buildClassSpeechParts();

    } catch (error) {

        console.error("Load Class Detail Error:", error);

        setText(classChapterTitle, "Detail BAB gagal dimuat");

    }

}


// =========================================================
// NORMALIZE MODULE
// =========================================================

function normalizeChapters(chapters) {

    if (!Array.isArray(chapters)) {
        return [];
    }

    return chapters.map(function (chapter, index) {
        return normalizeChapter(chapter, index + 1);
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
        return normalizeSection(section, index + 1);
    });

    return {
        chapter: Number(number),
        code: code,
        title: title,
        sections: sections
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
// RENDER
// =========================================================

function renderClassChapter() {

    if (!classChapter) {
        return;
    }

    setText(classChapterCode, classChapter.code + " • " + classMajor);
    setText(classChapterTitle, classChapter.title);

    setText(
        classChapterDescription,
        "Guru AI menggunakan Bahasa Indonesia. Anti echo aktif. Saat Guru AI berbicara, siswa bisa menyela dengan perintah pendek: stop, ringkas, jelaskan lebih mudah, kasih contoh, ulangi, atau awali pertanyaan panjang dengan kata Guru."
    );

}


function renderClassLessonList() {

    if (!classLessonList) {
        return;
    }

    classLessonList.innerHTML = "";

    if (!classSections || classSections.length === 0) {

        classLessonList.innerHTML = `
            <div class="lesson-item">
                <h4>Belum ada submateri</h4>
                <p>Submateri belum tersedia pada BAB ini.</p>
            </div>
        `;

        return;

    }

    classSections.forEach(function (section) {

        var item = document.createElement("div");

        item.className = "lesson-item";

        item.innerHTML = `
            <h4>${escapeHtml(section.code)} - ${escapeHtml(section.title)}</h4>
            <p>${escapeHtml(shortText(section.content, 260))}</p>
        `;

        classLessonList.appendChild(item);

    });

}


function showClassNoModule() {

    setText(classChapterCode, "BAB");
    setText(classChapterTitle, "Belum ada modul");
    setText(classChapterDescription, "Modul untuk jurusan ini belum tersedia.");

}


function showClassAnswer(answer) {

    if (classAnswerBox) {

        classAnswerBox.style.display = "block";
        classAnswerBox.textContent = answer;

    }

}


// =========================================================
// VOICE
// =========================================================

function loadClassVoices() {

    if (!classVoiceSelect || !("speechSynthesis" in window)) {
        return;
    }

    var voices = window.speechSynthesis.getVoices();

    classVoiceSelect.innerHTML = "";

    if (!voices || voices.length === 0) {

        classVoiceSelect.innerHTML = `
            <option value="">
                Suara belum tersedia
            </option>
        `;

        return;

    }

    var preferredVoices = voices.filter(function (voice) {

        var name = voice.name.toLowerCase();
        var lang = voice.lang.toLowerCase();

        return (
            lang.includes("id")
            || name.includes("indonesia")
            || name.includes("google bahasa indonesia")
        );

    });

    var finalVoices = preferredVoices.length > 0
        ? preferredVoices
        : voices;

    finalVoices.forEach(function (voice) {

        var option = document.createElement("option");

        option.value = voice.name;
        option.textContent = voice.name + " — " + voice.lang;

        classVoiceSelect.appendChild(option);

    });

    classVoice = finalVoices[0] || null;

    if (classVoice) {
        classVoiceSelect.value = classVoice.name;
    }

    setText(
        classVoiceStatus,
        "Status suara: siap. Bahasa Indonesia aktif."
    );

}


function buildClassSpeechParts() {

    classSpeechParts = [];

    if (!classChapter) {
        return;
    }

    classSpeechParts.push(
        "Halo semua. Selamat datang di kelas Guru AI JSKM. Hari ini kita belajar " +
        classChapter.code + ", yaitu " + classChapter.title +
        ", untuk jurusan " + classMajor + "."
    );

    classSpeechParts.push(
        "Dengarkan penjelasan dengan baik. Jika jawaban terlalu panjang, siswa boleh menyela dengan perintah pendek seperti: stop, ringkas, jelaskan lebih mudah, atau kasih contoh."
    );

    classSections.forEach(function (section) {

        var text =
            "Submateri " + section.code + ". " +
            section.title + ". " +
            cleanText(section.content);

        splitLongText(text, 520).forEach(function (part) {
            classSpeechParts.push(part);
        });

    });

    classSpeechParts.push(
        "Penjelasan materi selesai. Apakah ada pertanyaan? Silakan bertanya melalui mikrofon."
    );

    classSpeechIndex = 0;

    updateClassProgress();

}


function startClassTeaching() {

    if (!("speechSynthesis" in window)) {
        alert("Browser belum mendukung fitur suara.");
        return;
    }

    if (!classChapter) {
        alert("Pilih BAB terlebih dahulu.");
        return;
    }

    classInteractiveMode = true;
    classIsTeaching = true;
    classIsAnswering = false;
    classPaused = false;

    stopClassMic();

    buildClassSpeechParts();

    window.speechSynthesis.cancel();

    speakClassPart();

}


function speakClassPart() {

    if (classSpeechIndex >= classSpeechParts.length) {

        classIsTeaching = false;

        setText(
            classVoiceStatus,
            "Status suara: materi selesai. Guru AI menunggu pertanyaan siswa."
        );

        updateClassProgress();

        if (classInteractiveMode) {
            startClassMicAfterDelay();
        }

        return;

    }

    var text = classSpeechParts[classSpeechIndex];

    currentSpeakingText = text;
    lastSpokenText = text;

    var utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (classVoice) {
        utterance.voice = classVoice;
    }

    utterance.onstart = function () {

        setText(
            classVoiceStatus,
            "Status suara: menjelaskan bagian " + (classSpeechIndex + 1) + " dari " + classSpeechParts.length + "."
        );

        updateClassProgress();

    };

    utterance.onend = function () {

        if (classPaused) {
            return;
        }

        classSpeechIndex += 1;

        updateClassProgress();

        speakClassPart();

    };

    window.speechSynthesis.speak(utterance);

}


function speakClassText(text, afterFinish, enableInterrupt) {

    if (!("speechSynthesis" in window)) {
        alert("Browser belum mendukung fitur suara.");
        return;
    }

    if (!text) {
        return;
    }

    window.speechSynthesis.cancel();

    currentSpeakingText = text;
    lastSpokenText = text;

    if (enableInterrupt) {

        setTimeout(function () {
            startInterruptListening();
        }, 700);

    }

    var parts = splitLongText(text, 560);
    var index = 0;

    function speakNext() {

        if (index >= parts.length) {

            if (enableInterrupt) {
                stopInterruptListeningOnly();
            }

            currentSpeakingText = "";

            if (typeof afterFinish === "function") {
                afterFinish();
            }

            return;

        }

        if (enableInterrupt && !classIsAnswering) {
            return;
        }

        var utterance = new SpeechSynthesisUtterance(parts[index]);

        utterance.lang = "id-ID";
        utterance.rate = 0.9;
        utterance.pitch = 1;

        if (classVoice) {
            utterance.voice = classVoice;
        }

        utterance.onend = function () {

            if (enableInterrupt && !classIsAnswering) {
                return;
            }

            index += 1;

            speakNext();

        };

        window.speechSynthesis.speak(utterance);

    }

    speakNext();

}


function pauseClassVoice() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {

        classPaused = true;
        window.speechSynthesis.pause();

        setText(classVoiceStatus, "Status suara: dijeda.");

    } else if (window.speechSynthesis.paused) {

        classPaused = false;
        window.speechSynthesis.resume();

        setText(classVoiceStatus, "Status suara: dilanjutkan.");

    }

}


function repeatClassTeaching() {

    stopClassMode();

    classInteractiveMode = true;
    classSpeechIndex = 0;

    startClassTeaching();

}


function stopClassMode() {

    classInteractiveMode = false;
    classIsTeaching = false;
    classIsAnswering = false;
    classPaused = false;
    classSpeechIndex = 0;
    discussionMode = false;
    interruptHandled = false;

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    stopClassMic();

    updateClassProgress();

    setText(classVoiceStatus, "Status suara: mode kelas dihentikan.");

}


function goNextChapter() {

    if (!classChapter || !classChapters.length) {
        return;
    }

    var currentIndex = classChapters.findIndex(function (item) {
        return Number(item.chapter) === Number(classChapter.chapter);
    });

    var nextIndex = currentIndex + 1;

    if (nextIndex >= classChapters.length) {
        alert("Ini sudah BAB terakhir.");
        return;
    }

    var nextChapter = classChapters[nextIndex];

    if (classChapterSelect) {
        classChapterSelect.value = nextChapter.chapter;
    }

    localStorage.setItem("selected_chapter", nextChapter.chapter);

    stopClassMode();

    loadClassChapterDetail(classMajor, nextChapter.chapter);

}


function updateClassProgress() {

    var total = classSpeechParts.length || 0;
    var current = Math.min(classSpeechIndex, total);

    var percent = total > 0
        ? Math.round((current / total) * 100)
        : 0;

    if (classProgressBar) {
        classProgressBar.style.width = percent + "%";
    }

    setText(classProgressText, "Bagian " + current + " dari " + total);

}


function testClassVoice() {

    speakClassText(
        "Halo, saya Guru AI JSKM. Suara Bahasa Indonesia sudah siap digunakan.",
        null,
        false
    );

}


function greetClass() {

    speakClassText(
        "Halo siswa semua. Silakan duduk rapi, siapkan catatan, dan fokus mengikuti pembelajaran bersama Guru AI JSKM.",
        null,
        false
    );

}


function focusReminder() {

    speakClassText(
        "Perhatian untuk semua siswa. Silakan fokus ke materi, kurangi bercanda, dan catat bagian penting yang dijelaskan.",
        null,
        false
    );

}


// =========================================================
// MICROPHONE
// =========================================================

function setupClassRecognition() {

    var SpeechRecognition =
        window.SpeechRecognition
        || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        setText(
            classMicStatus,
            "Status mikrofon: browser belum mendukung Speech Recognition. Gunakan Google Chrome atau Microsoft Edge."
        );

        return;

    }

    classRecognition = new SpeechRecognition();

    classRecognition.lang = "id-ID";
    classRecognition.continuous = false;
    classRecognition.interimResults = true;

    classRecognition.onstart = function () {

        classListening = true;

        if (recognitionMode === "interrupt") {

            setText(
                classMicStatus,
                "Mode interupsi aktif. Perintah pendek: stop, ringkas, jelaskan mudah, kasih contoh, ulangi, lanjutkan. Pertanyaan panjang awali dengan kata Guru."
            );

            return;

        }

        if (discussionMode) {

            setText(
                classMicStatus,
                "Mikrofon aktif. Siswa boleh menanggapi jawaban Guru AI sekarang."
            );

        } else {

            setText(
                classMicStatus,
                "Mikrofon aktif. Siswa boleh bertanya sekarang."
            );

        }

    };

    classRecognition.onresult = function (event) {

        var transcript = "";
        var isFinal = false;

        for (var i = event.resultIndex; i < event.results.length; i++) {

            transcript += event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                isFinal = true;
            }

        }

        transcript = cleanText(transcript);

        if (!transcript) {
            return;
        }

        if (recognitionMode === "interrupt") {

            setText(classMicStatus, "Interupsi terdengar: " + transcript);

            if (isLikelyEchoTranscript(transcript)) {

                console.log("Echo diabaikan:", transcript);

                return;

            }

            var command = detectSmartIntent(transcript);

            if (command && isSafeInterrupt(transcript)) {

                handleInterruptCommand(command, transcript);

                return;

            }

            if (isFinal && hasWakeCommand(transcript)) {

                var cleanQuestion = removeWakeCommand(transcript);

                if (isMeaningfulQuestion(cleanQuestion)) {

                    handleInterruptCommand("question", cleanQuestion);

                    return;

                }

            }

            return;

        }

        if (isLikelyEchoTranscript(transcript)) {

            console.log("Echo saat mode tanya diabaikan:", transcript);

            setText(
                classMicStatus,
                "Suara Guru AI terdeteksi dan diabaikan. Silakan siswa bertanya lebih jelas."
            );

            return;

        }

        if (classQuestionInput) {
            classQuestionInput.value = transcript;
        }

        setText(classMicStatus, "Terdengar: " + transcript);

    };

    classRecognition.onerror = function (event) {

        classListening = false;

        if (recognitionMode === "interrupt") {

            if (classIsAnswering && autoInterruptEnabled) {

                setTimeout(function () {
                    startInterruptListening();
                }, 900);

            }

            return;

        }

        setText(
            classMicStatus,
            "Status mikrofon error: " + event.error + ". Jika muncul izin microphone, klik Allow / Izinkan."
        );

    };

    classRecognition.onend = function () {

        classListening = false;

        if (recognitionMode === "interrupt") {

            if (
                classIsAnswering
                && autoInterruptEnabled
                && !interruptHandled
            ) {

                setTimeout(function () {
                    startInterruptListening();
                }, 800);

            }

            return;

        }

        var question = classQuestionInput
            ? cleanText(classQuestionInput.value)
            : "";

        if (!question) {

            setText(classMicStatus, "Tidak ada suara yang tertangkap.");

            if (classInteractiveMode && !classIsTeaching && !classIsAnswering) {
                startClassMicAfterDelay();
            }

            return;

        }

        if (isLikelyEchoTranscript(question)) {

            if (classQuestionInput) {
                classQuestionInput.value = "";
            }

            setText(
                classMicStatus,
                "Suara Guru AI terdeteksi dan diabaikan. Silakan siswa bertanya lagi."
            );

            if (classInteractiveMode && !classIsTeaching && !classIsAnswering) {
                startClassMicAfterDelay();
            }

            return;

        }

        if (discussionMode) {

            setText(
                classMicStatus,
                "Tanggapan siswa ditangkap. Guru AI sedang memahami maksud siswa."
            );

            answerStudentResponse(true);

            return;

        }

        setText(
            classMicStatus,
            "Pertanyaan ditangkap. Guru AI sedang memahami pertanyaan siswa."
        );

        answerClassQuestion(true);

    };

}


function startClassMicAfterDelay() {

    setTimeout(function () {

        if (!classInteractiveMode || classIsTeaching || classIsAnswering) {
            return;
        }

        startClassMic();

    }, 1300);

}


function startClassMic() {

    discussionMode = false;
    recognitionMode = "question";

    if (!classRecognition) {
        alert("Browser belum mendukung microphone. Gunakan Chrome atau Edge.");
        return;
    }

    if (classListening) {
        return;
    }

    try {

        if (classQuestionInput) {
            classQuestionInput.value = "";
        }

        classRecognition.start();

    } catch (error) {

        console.error("Start mic error:", error);

        setText(
            classMicStatus,
            "Mikrofon gagal dimulai. Coba klik lagi atau refresh halaman."
        );

    }

}


function stopClassMic() {

    if (classRecognition && classListening) {

        try {
            classRecognition.stop();
        } catch (error) {
            console.log("Stop mic skipped:", error);
        }

    }

    classListening = false;
    discussionMode = false;
    recognitionMode = "question";

    setText(classMicStatus, "Status mikrofon: dihentikan.");

}


function startQuestionSession() {

    classInteractiveMode = true;
    discussionMode = false;

    var text =
        "Baik, sekarang kita masuk sesi tanya jawab. Apakah ada pertanyaan? Silakan siswa bertanya melalui mikrofon.";

    setText(classMicStatus, "Guru AI membuka sesi tanya jawab.");

    speakClassText(
        text,
        function () {
            startClassMicAfterDelay();
        },
        false
    );

}


// =========================================================
// INTERRUPT
// =========================================================

function startInterruptListening() {

    if (!autoInterruptEnabled) {
        return;
    }

    if (!classRecognition) {
        return;
    }

    if (!classIsAnswering) {
        return;
    }

    if (classListening) {
        return;
    }

    recognitionMode = "interrupt";
    interruptHandled = false;

    try {
        classRecognition.start();
    } catch (error) {
        console.log("Interrupt mic start skipped:", error);
    }

}


function stopInterruptListeningOnly() {

    if (
        classRecognition
        && classListening
        && recognitionMode === "interrupt"
    ) {

        try {
            classRecognition.stop();
        } catch (error) {
            console.log("Interrupt stop skipped:", error);
        }

    }

    recognitionMode = "question";
    interruptHandled = false;

}


function handleInterruptCommand(command, transcript) {

    if (interruptHandled) {
        return;
    }

    interruptHandled = true;

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    if (classRecognition && classListening) {

        try {
            classRecognition.stop();
        } catch (error) {
            console.log("Stop recognition skipped:", error);
        }

    }

    recognitionMode = "question";

    setText(classMicStatus, "Siswa menyela: " + transcript);

    if (command === "no_more") {
        closeQuestionSession();
        return;
    }

    if (command === "stop") {
        stopCurrentAnswer();
        return;
    }

    if (command === "summary") {
        summarizeLastAnswer();
        return;
    }

    if (command === "easy") {
        explainEasyAnswer();
        return;
    }

    if (command === "example") {
        giveExampleAnswer();
        return;
    }

    if (command === "repeat") {
        repeatAnswerSimple();
        return;
    }

    if (command === "continue") {
        continueLastAnswer();
        return;
    }

    if (command === "question") {

        if (classQuestionInput) {
            classQuestionInput.value = transcript;
        }

        answerClassQuestion(true);

        return;

    }

}


// =========================================================
// SMART INTENT
// =========================================================

function detectSmartIntent(text) {

    var q = normalizeText(text);

    if (!q) {
        return "";
    }

    if (
        q === "tidak"
        || q === "tidak ada"
        || q === "tidak ada lagi"
        || q === "ga ada"
        || q === "gak ada"
        || q === "nggak ada"
        || q.includes("tidak ada pertanyaan")
        || q.includes("tidak ada lagi")
        || q.includes("ga ada lagi")
        || q.includes("gak ada lagi")
        || q.includes("nggak ada lagi")
        || q.includes("sudah cukup")
        || q.includes("cukup")
        || q.includes("sudah jelas")
        || q.includes("sudah paham")
    ) {
        return "no_more";
    }

    if (
        q === "stop"
        || q.includes("stop")
        || q.includes("berhenti")
        || q.includes("diam dulu")
        || q.includes("cukup dulu")
    ) {
        return "stop";
    }

    if (
        q === "ringkas"
        || q.includes("ringkas")
        || q.includes("singkat")
        || q.includes("terlalu panjang")
        || q.includes("jawaban pendek")
    ) {
        return "summary";
    }

    if (
        q.includes("mudah")
        || q.includes("lebih mudah")
        || q.includes("bahasa mudah")
        || q.includes("sederhana")
        || q.includes("sederhanakan")
        || q.includes("belum paham")
        || q.includes("tidak paham")
        || q.includes("gak paham")
        || q.includes("nggak paham")
        || q.includes("pelan")
    ) {
        return "easy";
    }

    if (
        q.includes("contoh")
        || q.includes("kasih contoh")
        || q.includes("beri contoh")
        || q.includes("contohnya")
        || q.includes("misalnya")
    ) {
        return "example";
    }

    if (
        q.includes("ulangi")
        || q.includes("ulang")
        || q.includes("sekali lagi")
    ) {
        return "repeat";
    }

    if (
        q.includes("lanjut")
        || q.includes("lanjutkan")
        || q.includes("teruskan")
    ) {
        return "continue";
    }

    return "";

}


function handleSmartIntentBeforeAnswer(text) {

    var intent = detectSmartIntent(text);

    if (!intent) {
        return false;
    }

    if (intent === "no_more") {
        closeQuestionSession();
        return true;
    }

    if (intent === "stop") {
        stopCurrentAnswer();
        return true;
    }

    if (intent === "summary") {
        summarizeLastAnswer();
        return true;
    }

    if (intent === "easy") {
        explainEasyAnswer();
        return true;
    }

    if (intent === "example") {
        giveExampleAnswer();
        return true;
    }

    if (intent === "repeat") {
        repeatAnswerSimple();
        return true;
    }

    if (intent === "continue") {
        continueLastAnswer();
        return true;
    }

    return false;

}


function closeQuestionSession() {

    classInteractiveMode = false;
    discussionMode = false;
    classIsTeaching = false;

    stopClassMic();

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    var text =
        "Baik, jika tidak ada pertanyaan lagi, sesi tanya jawab kita cukupkan. Pembimbing dapat melanjutkan ke materi berikutnya, mengulang materi, atau menutup pembelajaran.";

    lastClassAnswer = text;

    showClassAnswer(text);

    setText(
        classMicStatus,
        "Sesi tanya jawab selesai. Kalimat tersebut tidak dianggap sebagai pertanyaan materi."
    );

    classIsAnswering = true;

    speakClassText(
        text,
        function () {
            classIsAnswering = false;
            setText(classVoiceStatus, "Status suara: sesi tanya jawab selesai.");
        },
        false
    );

}


// =========================================================
// ANSWER ENGINE
// =========================================================

function answerClassQuestion(fromMic) {

    var question = classQuestionInput
        ? cleanText(classQuestionInput.value)
        : "";

    if (!question) {
        alert("Tulis atau ucapkan pertanyaan terlebih dahulu.");
        return;
    }

    if (handleSmartIntentBeforeAnswer(question)) {
        return;
    }

    if (!isMeaningfulQuestion(question)) {

        var askAgain =
            "Saya belum menangkap pertanyaan dengan jelas. Silakan ulangi dengan menyebutkan topiknya. Contoh: Guru, kenapa komputer tidak tampil?";

        showClassAnswer(askAgain);

        speakClassText(
            askAgain,
            function () {
                startClassMicAfterDelay();
            },
            false
        );

        return;

    }

    lastClassQuestion = question;

    classIsAnswering = true;
    interruptHandled = false;

    showClassAnswer("Guru AI sedang menyusun jawaban Bahasa Indonesia yang mudah dipahami...");

    var answer = buildClassAnswer(question);

    finishClassAnswer(answer);

}


function finishClassAnswer(answer) {

    lastClassAnswer = answer;

    showClassAnswer(answer);

    classIsAnswering = true;
    interruptHandled = false;

    speakClassText(
        answer,
        function () {

            classIsAnswering = false;
            stopInterruptListeningOnly();

            if (classInteractiveMode) {

                var followUp =
                    "Apakah jawaban sudah jelas? Jika belum, siswa boleh bertanya lagi, meminta ringkasan, meminta contoh, atau mengatakan tidak ada lagi.";

                setText(classMicStatus, followUp);

                speakClassText(
                    followUp,
                    function () {
                        startClassMicAfterDelay();
                    },
                    false
                );

            }

        },
        true
    );

}


function buildClassAnswer(question) {

    var intent = detectSmartIntent(question);

    if (intent && intent !== "") {

        return (
            "Saya memahami maksud siswa sebagai perintah kelas, bukan pertanyaan materi. Silakan gunakan tombol atau ucapkan perintah singkat seperti ringkas, contoh, atau jelaskan lebih mudah."
        );

    }

    var matches = findRelevantSections(question);

    if (matches.length > 0) {
        return buildSmartMaterialAnswer(question, matches);
    }

    if (classMajor === "TKJ") {
        return buildSmartTKJAnswer(question);
    }

    return buildSmartDKVAnswer(question);

}


function buildSmartMaterialAnswer(question, matches) {

    var best = matches[0];
    var related = matches[1] || null;

    var answer = "";

    answer += "Pertanyaan siswa:\n";
    answer += question + "\n\n";

    answer += "Jawaban inti:\n";
    answer += buildDirectAnswer(question, best) + "\n\n";

    answer += "Penjelasan mudah:\n";
    answer += buildEasyExplanationFromQuestion(question, best) + "\n\n";

    answer += "Langkah praktik:\n";
    answer += buildPracticeSteps(question, best) + "\n\n";

    answer += "Contoh:\n";
    answer += buildContextExample(question, best) + "\n\n";

    answer += "Dasar materi dari modul:\n";
    answer += best.chapterCode + " - " + best.chapterTitle + "\n";
    answer += "Submateri: " + best.section.title + "\n";
    answer += shortText(best.section.content, 420) + "\n\n";

    if (related) {

        answer += "Materi terkait:\n";
        answer += related.chapterCode + " - " + related.chapterTitle + ", submateri " + related.section.title + ".\n\n";

    }

    answer += "Pertanyaan balik untuk siswa:\n";
    answer += "Bagian mana yang belum jelas: pengertian, langkah praktik, penyebab masalah, atau contohnya?";

    return answer;

}


function buildDirectAnswer(question, match) {

    var q = normalizeText(question);
    var title = match && match.section ? match.section.title : "materi ini";

    if (classMajor === "TKJ") {

        if (hasAny(q, ["merakit", "rakit", "perakitan"])) {

            return "Merakit komputer adalah memasang dan menghubungkan komponen utama seperti motherboard, processor, RAM, media penyimpanan, power supply, casing, dan kabel dengan urutan yang benar dan aman.";

        }

        if (hasAny(q, ["tidak tampil", "no display", "layar mati", "monitor mati", "tidak keluar gambar"])) {

            return "Komputer tidak tampil harus diperiksa secara bertahap, mulai dari monitor, kabel display, RAM, VGA, power supply, sampai motherboard. Tujuannya agar teknisi tidak salah menebak kerusakan.";

        }

        if (hasAny(q, ["instal", "install", "windows", "sistem operasi", "os"])) {

            return "Instalasi sistem operasi dilakukan dengan menyiapkan bootable, mengatur boot di BIOS, memilih partisi dengan benar, menjalankan instalasi, memasang driver, lalu mengecek hasil akhir.";

        }

        if (hasAny(q, ["jaringan", "internet", "lan", "ip", "router", "switch"])) {

            return "Dalam jaringan komputer, siswa perlu memahami perangkat jaringan, alamat IP, media koneksi, konfigurasi, dan cara menguji koneksi.";

        }

        return "Pertanyaan ini berkaitan dengan " + title + ". Intinya, siswa perlu memahami konsep, langkah kerja, dan cara menerapkannya dalam praktik TKJ.";

    }

    if (classMajor === "DKV") {

        if (hasAny(q, ["poster", "desain", "layout"])) {

            return "Desain yang baik bukan hanya terlihat bagus, tetapi harus jelas tujuannya, mudah dibaca, komposisinya rapi, warnanya sesuai, dan pesan visualnya mudah dipahami.";

        }

        if (hasAny(q, ["logo", "branding", "brand"])) {

            return "Logo dan branding berfungsi membangun identitas agar mudah dikenali. Logo harus sederhana, jelas, konsisten, dan sesuai karakter brand.";

        }

        if (hasAny(q, ["warna", "font", "tipografi"])) {

            return "Warna dan tipografi berpengaruh pada kesan visual. Pemilihannya harus sesuai tujuan desain, target audiens, dan identitas brand.";

        }

        return "Pertanyaan ini berkaitan dengan " + title + ". Intinya, siswa perlu memahami tujuan visual, pesan desain, dan cara menerapkannya ke karya.";

    }

    return "Pertanyaan ini berkaitan dengan " + title + ".";

}


function buildEasyExplanationFromQuestion(question, match) {

    var q = normalizeText(question);

    if (classMajor === "TKJ") {

        if (hasAny(q, ["merakit", "rakit", "perakitan"])) {

            return "Bayangkan komputer seperti satu tim. Processor adalah otak, RAM membantu kerja sementara, storage menyimpan data, motherboard menjadi papan penghubung, dan power supply memberi daya. Merakit komputer berarti memasang semua bagian itu agar bisa bekerja bersama.";

        }

        if (hasAny(q, ["tidak tampil", "no display", "layar mati"])) {

            return "Kalau komputer tidak tampil, jangan langsung menebak motherboard rusak. Cek dari yang paling mudah dulu: monitor, kabel, RAM, VGA, lalu power supply. Jadi teknisi bekerja berdasarkan urutan pemeriksaan.";

        }

        return "Dalam TKJ, cara mudah memahami materi adalah melihat gejala, mencari penyebab, lalu melakukan pengecekan secara berurutan.";

    }

    if (classMajor === "DKV") {

        return "Dalam DKV, cara mudah memahami materi adalah melihat tujuan desain, pesan yang ingin disampaikan, lalu mengatur warna, tulisan, gambar, dan layout agar mudah dipahami.";

    }

    return "Pahami dulu inti materinya, lalu lihat contoh, kemudian praktikkan pelan-pelan.";

}


function buildPracticeSteps(question, match) {

    var q = normalizeText(question);

    if (classMajor === "TKJ") {

        if (hasAny(q, ["merakit", "rakit", "perakitan"])) {

            return (
                "1. Matikan sumber listrik.\n" +
                "2. Siapkan komponen dan alat.\n" +
                "3. Pasang processor, RAM, dan storage dengan hati-hati.\n" +
                "4. Pasang motherboard ke casing.\n" +
                "5. Hubungkan power supply dan kabel panel.\n" +
                "6. Nyalakan komputer dan cek tampilan BIOS."
            );

        }

        if (hasAny(q, ["tidak tampil", "no display", "layar mati"])) {

            return (
                "1. Pastikan monitor menyala.\n" +
                "2. Cek kabel HDMI atau VGA.\n" +
                "3. Lepas dan pasang ulang RAM.\n" +
                "4. Coba slot RAM lain.\n" +
                "5. Cek VGA atau onboard display.\n" +
                "6. Lanjut cek power supply dan motherboard."
            );

        }

        return (
            "1. Pahami gejala atau tujuan pekerjaan.\n" +
            "2. Siapkan alat.\n" +
            "3. Lakukan pengecekan bertahap.\n" +
            "4. Catat hasil.\n" +
            "5. Buat kesimpulan teknis."
        );

    }

    if (classMajor === "DKV") {

        return (
            "1. Tentukan tujuan desain.\n" +
            "2. Tentukan target audiens.\n" +
            "3. Pilih warna dan tipografi.\n" +
            "4. Susun layout.\n" +
            "5. Cek keterbacaan.\n" +
            "6. Revisi sampai pesan visual jelas."
        );

    }

    return "Pahami konsep, lihat contoh, lalu praktikkan.";

}


function buildContextExample(question, match) {

    var q = normalizeText(question);

    if (classMajor === "TKJ") {

        if (hasAny(q, ["merakit", "rakit", "perakitan"])) {

            return "Contoh: setelah RAM dipasang, komputer menyala tetapi tidak tampil. Siswa perlu mematikan listrik, melepas RAM, membersihkan pin RAM, memasang ulang sampai terkunci, lalu mencoba menyalakan kembali.";

        }

        if (hasAny(q, ["tidak tampil", "no display", "layar mati"])) {

            return "Contoh: CPU menyala, kipas berputar, tetapi monitor gelap. Langkah awal adalah cek kabel display, coba monitor lain, bersihkan RAM, lalu cek VGA atau motherboard.";

        }

        if (hasAny(q, ["instal", "windows", "sistem operasi"])) {

            return "Contoh: siswa membuat flashdisk bootable Windows, masuk BIOS, memilih boot USB, mengatur partisi, memasang driver, lalu mengecek Device Manager.";

        }

        return "Contoh TKJ: saat komputer bermasalah, teknisi tidak langsung mengganti komponen. Teknisi mengecek dari bagian paling sederhana sampai bagian yang lebih teknis.";

    }

    if (classMajor === "DKV") {

        if (hasAny(q, ["poster", "desain", "layout"])) {

            return "Contoh: poster lomba harus memiliki judul besar, informasi tanggal yang jelas, warna sesuai tema, dan gambar pendukung yang tidak mengganggu teks utama.";

        }

        if (hasAny(q, ["logo", "branding"])) {

            return "Contoh: toko komputer ingin terlihat profesional, maka logo dibuat sederhana, warna konsisten, font mudah dibaca, dan dipakai di spanduk, nota, website, serta media sosial.";

        }

        return "Contoh DKV: saat membuat desain media sosial, siswa harus memperhatikan tujuan pesan, ukuran desain, warna, font, gambar, dan keseimbangan layout.";

    }

    return "Contoh akan lebih jelas jika siswa menyebutkan kasus atau karya yang sedang dibahas.";

}


function buildSmartTKJAnswer(question) {

    return (
        "Pertanyaan siswa:\n" +
        question + "\n\n" +
        "Jawaban inti:\n" +
        "Pertanyaan ini masuk ke pembelajaran TKJ. Untuk menjawabnya, siswa perlu memahami perangkat keras, perangkat lunak, jaringan, prosedur kerja, dan troubleshooting.\n\n" +
        "Penjelasan mudah:\n" +
        "Dalam TKJ, jangan langsung menebak. Pahami gejala, cek bagian paling sederhana, lalu lanjut ke bagian yang lebih teknis.\n\n" +
        "Contoh:\n" +
        "Jika komputer bermasalah, cek kabel, RAM, monitor, storage, power supply, lalu simpulkan penyebabnya.\n\n" +
        "Agar Guru AI menjawab lebih tepat, sebutkan masalahnya. Contoh: komputer tidak tampil, Windows error, jaringan tidak konek, atau laptop mati total."
    );

}


function buildSmartDKVAnswer(question) {

    return (
        "Pertanyaan siswa:\n" +
        question + "\n\n" +
        "Jawaban inti:\n" +
        "Pertanyaan ini masuk ke pembelajaran DKV. Untuk menjawabnya, siswa perlu memahami tujuan desain, pesan visual, target audiens, warna, tipografi, layout, dan proses berkarya.\n\n" +
        "Penjelasan mudah:\n" +
        "Desain bukan hanya soal bagus, tetapi apakah pesan visualnya mudah dipahami oleh orang yang melihat.\n\n" +
        "Contoh:\n" +
        "Saat membuat poster, siswa harus menentukan judul, informasi utama, warna, gambar, dan susunan layout agar poster mudah dibaca.\n\n" +
        "Agar Guru AI menjawab lebih tepat, sebutkan karya atau masalah desainnya. Contoh: poster, logo, branding, portofolio, warna, tipografi, atau layout."
    );

}


// =========================================================
// DISCUSSION CONTROL
// =========================================================

function stopCurrentAnswer() {

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    stopInterruptListeningOnly();

    classIsAnswering = false;

    setText(classVoiceStatus, "Status suara: jawaban dihentikan.");

    setText(
        classMicStatus,
        "Jawaban dihentikan. Siswa bisa meminta ringkas, contoh, penjelasan mudah, atau bertanya ulang."
    );

    showClassAnswer(
        "Jawaban Guru AI dihentikan.\n\nSilakan pilih: Ringkas Jawaban, Jelaskan Lebih Mudah, Beri Contoh, Lanjutkan Jawaban, atau Siswa Menanggapi."
    );

}


function summarizeLastAnswer() {

    if (!lastClassAnswer) {

        var textEmpty =
            "Belum ada jawaban yang bisa diringkas. Silakan siswa bertanya terlebih dahulu.";

        showClassAnswer(textEmpty);
        speakClassText(textEmpty, null, false);

        return;

    }

    var text =
        "Baik, saya ringkas jawabannya.\n\n" +
        buildSummaryFromText(lastClassAnswer) +
        "\n\n" +
        "Intinya: pahami konsep utama, lihat contoh, lalu praktikkan secara bertahap.";

    finishDiscussionControlAnswer(text);

}


function explainEasyAnswer() {

    var source = lastClassAnswer || "";

    if (!source) {

        var textEmpty =
            "Belum ada jawaban sebelumnya. Silakan siswa bertanya dulu, nanti saya jelaskan dengan bahasa yang mudah.";

        showClassAnswer(textEmpty);
        speakClassText(textEmpty, null, false);

        return;

    }

    var text =
        "Baik, saya jelaskan dengan bahasa yang lebih mudah.\n\n" +
        "Intinya begini:\n\n" +
        buildEasyExplanation(source);

    finishDiscussionControlAnswer(text);

}


function giveExampleAnswer() {

    var question = lastClassQuestion || "materi yang sedang dibahas";

    var text = "";

    if (classMajor === "TKJ") {

        text =
            "Baik, saya beri contoh TKJ.\n\n" +
            "Misalnya pertanyaannya tentang komputer tidak tampil. Jangan langsung menyimpulkan motherboard rusak. Cek dulu monitor, kabel display, RAM, VGA, power supply, lalu motherboard.\n\n" +
            "Hubungannya dengan pertanyaan \"" + question + "\" adalah siswa harus belajar menganalisis masalah secara bertahap.";

    } else {

        text =
            "Baik, saya beri contoh DKV.\n\n" +
            "Misalnya siswa membuat poster. Poster harus memiliki judul jelas, warna sesuai, teks mudah dibaca, gambar pendukung, dan layout yang rapi.\n\n" +
            "Hubungannya dengan pertanyaan \"" + question + "\" adalah siswa harus memahami tujuan desain dan cara menyampaikan pesan visual.";

    }

    finishDiscussionControlAnswer(text);

}


function continueLastAnswer() {

    if (!lastClassQuestion) {

        var textEmpty =
            "Belum ada pertanyaan sebelumnya untuk dilanjutkan. Silakan siswa bertanya terlebih dahulu.";

        showClassAnswer(textEmpty);
        speakClassText(textEmpty, null, false);

        return;

    }

    var text =
        "Baik, saya lanjutkan.\n\n" +
        "Agar pembelajaran lebih dalam, siswa perlu melakukan tiga hal:\n\n" +
        "1. Temukan kata kunci dari jawaban.\n" +
        "2. Hubungkan kata kunci itu dengan praktik.\n" +
        "3. Tanyakan bagian yang belum jelas.\n\n" +
        "Jadi, jangan hanya mendengar jawaban. Coba praktikkan, lalu bandingkan hasilnya dengan materi di modul.";

    finishDiscussionControlAnswer(text);

}


function repeatAnswerSimple() {

    if (!lastClassAnswer) {

        var textEmpty =
            "Belum ada jawaban untuk diulangi. Silakan siswa bertanya terlebih dahulu.";

        showClassAnswer(textEmpty);
        speakClassText(textEmpty, null, false);

        return;

    }

    var text =
        "Baik, saya ulangi bagian pentingnya.\n\n" +
        buildSummaryFromText(lastClassAnswer);

    finishDiscussionControlAnswer(text);

}


function startStudentResponse() {

    discussionMode = true;
    classInteractiveMode = true;

    var text =
        "Baik, siswa boleh menanggapi. Sampaikan pendapat, sanggahan, atau bagian yang belum dipahami.";

    setText(classMicStatus, "Mode diskusi siswa aktif.");

    speakClassText(
        text,
        function () {
            startStudentResponseMic();
        },
        false
    );

}


function startStudentResponseMic() {

    discussionMode = true;
    recognitionMode = "discussion";

    if (!classRecognition) {
        alert("Browser belum mendukung microphone. Gunakan Chrome atau Edge.");
        return;
    }

    if (classListening) {
        return;
    }

    try {

        if (classQuestionInput) {
            classQuestionInput.value = "";
        }

        classRecognition.start();

    } catch (error) {

        console.error("Start student response mic error:", error);

        setText(
            classMicStatus,
            "Mikrofon diskusi gagal dimulai. Coba klik Siswa Menanggapi lagi."
        );

    }

}


function answerStudentResponse(fromMic) {

    var response = classQuestionInput
        ? cleanText(classQuestionInput.value)
        : "";

    if (!response) {
        alert("Belum ada tanggapan siswa.");
        return;
    }

    if (handleSmartIntentBeforeAnswer(response)) {
        return;
    }

    if (!isMeaningfulQuestion(response)) {

        var textNotClear =
            "Saya menangkap suara siswa, tetapi belum jelas maksudnya. Coba sampaikan ulang dengan menyebutkan topik atau bagian yang belum dipahami.";

        showClassAnswer(textNotClear);
        speakClassText(textNotClear, null, false);

        return;

    }

    lastClassQuestion = response;

    classIsAnswering = true;

    var text =
        "Baik, saya tanggapi pendapat siswa.\n\n" +
        "Tanggapan siswa:\n" +
        response + "\n\n" +
        buildClassAnswer(response);

    finishDiscussionControlAnswer(text);

}


function finishDiscussionControlAnswer(text) {

    lastClassAnswer = text;

    showClassAnswer(text);

    classIsAnswering = true;
    interruptHandled = false;

    speakClassText(
        text,
        function () {

            classIsAnswering = false;
            stopInterruptListeningOnly();

            if (classInteractiveMode) {

                var followUp =
                    "Apakah masih ada pertanyaan atau tanggapan lain? Jika tidak ada, siswa bisa mengatakan tidak ada lagi.";

                setText(classMicStatus, followUp);

                speakClassText(
                    followUp,
                    function () {
                        startClassMicAfterDelay();
                    },
                    false
                );

            }

        },
        true
    );

}


// =========================================================
// SMART SEARCH
// =========================================================

function findRelevantSections(question) {

    var results = [];
    var keywords = extractSmartKeywords(question);

    if (keywords.length === 0) {
        return [];
    }

    classChapters.forEach(function (chapter) {

        var sections = chapter.sections || [];

        sections.forEach(function (section) {

            var title = normalizeText(section.title);
            var content = normalizeText(section.content);
            var chapterTitle = normalizeText(chapter.title);

            var combined = title + " " + chapterTitle + " " + content;

            var score = 0;

            keywords.forEach(function (word) {

                if (title.includes(word)) {
                    score += 9;
                }

                if (chapterTitle.includes(word)) {
                    score += 6;
                }

                if (content.includes(word)) {
                    score += 2;
                }

                if (combined.includes(word)) {
                    score += 1;
                }

            });

            if (score > 0) {

                results.push({
                    score: score,
                    chapterCode: chapter.code,
                    chapterTitle: chapter.title,
                    section: section
                });

            }

        });

    });

    results.sort(function (a, b) {
        return b.score - a.score;
    });

    return results;

}


function extractSmartKeywords(text) {

    var q = normalizeText(text);

    var stopwords = [
        "saya",
        "ingin",
        "mau",
        "bertanya",
        "tanya",
        "bagaimana",
        "gimana",
        "apa",
        "apakah",
        "kenapa",
        "mengapa",
        "cara",
        "yang",
        "untuk",
        "dengan",
        "dari",
        "pada",
        "dalam",
        "dan",
        "atau",
        "itu",
        "ini",
        "lagi",
        "tidak",
        "ada",
        "tolong",
        "jelaskan",
        "materi",
        "dong",
        "pak",
        "bu",
        "kak",
        "guru",
        "ai"
    ];

    var words = q
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(function (word) {

            return (
                word.length >= 3
                && stopwords.indexOf(word) === -1
            );

        });

    var expanded = words.slice();

    function addWords(list) {

        list.forEach(function (word) {

            if (expanded.indexOf(word) === -1) {
                expanded.push(word);
            }

        });

    }

    if (hasAny(q, ["merakit", "rakit", "perakitan"])) {

        addWords([
            "komputer",
            "hardware",
            "motherboard",
            "prosesor",
            "processor",
            "ram",
            "ssd",
            "harddisk",
            "power",
            "supply",
            "psu",
            "casing",
            "komponen"
        ]);

    }

    if (hasAny(q, ["tidak tampil", "no display", "layar mati", "monitor mati", "tidak keluar gambar"])) {

        addWords([
            "komputer",
            "tampil",
            "display",
            "monitor",
            "ram",
            "vga",
            "motherboard",
            "troubleshooting",
            "kerusakan"
        ]);

    }

    if (hasAny(q, ["install", "instal", "windows", "sistem operasi", "os"])) {

        addWords([
            "instalasi",
            "sistem",
            "operasi",
            "windows",
            "bootable",
            "driver",
            "partisi"
        ]);

    }

    if (hasAny(q, ["jaringan", "lan", "ip", "wifi", "internet", "router", "switch"])) {

        addWords([
            "jaringan",
            "komputer",
            "ip",
            "router",
            "switch",
            "kabel",
            "lan",
            "koneksi"
        ]);

    }

    if (hasAny(q, ["poster", "desain", "layout"])) {

        addWords([
            "desain",
            "poster",
            "layout",
            "warna",
            "tipografi",
            "visual",
            "komposisi"
        ]);

    }

    if (hasAny(q, ["logo", "branding", "brand"])) {

        addWords([
            "logo",
            "branding",
            "identitas",
            "visual",
            "warna",
            "font",
            "brand"
        ]);

    }

    return uniqueArray(expanded);

}


// =========================================================
// ANTI ECHO
// =========================================================

function isLikelyEchoTranscript(text) {

    var q = normalizeText(text);

    if (!q) {
        return false;
    }

    var teacherPhrases = [
        "pertanyaan siswa",
        "jawaban inti",
        "jawaban singkat",
        "dasar materi",
        "penjelasan mudah",
        "langkah praktik",
        "contoh",
        "pertanyaan balik",
        "materi terkait",
        "guru ai",
        "apakah jawaban sudah jelas",
        "jika belum siswa boleh",
        "baik saya jawab",
        "saya menemukan materi",
        "submateri",
        "intinya",
        "kesimpulannya"
    ];

    for (var i = 0; i < teacherPhrases.length; i++) {

        if (q.includes(teacherPhrases[i])) {
            return true;
        }

    }

    var similarity = textSimilarity(
        q,
        normalizeText(lastSpokenText)
    );

    if (similarity >= 0.45 && q.length > 25) {
        return true;
    }

    return false;

}


function isSafeInterrupt(text) {

    var q = normalizeText(text);

    if (hasWakeCommand(q)) {
        return true;
    }

    var words = q
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(function (word) {
            return word.length > 0;
        });

    if (words.length <= 5) {
        return true;
    }

    return false;

}


function hasWakeCommand(text) {

    var q = " " + normalizeText(text) + " ";

    return (
        q.includes(" guru ")
        || q.includes(" guru ai ")
        || q.includes(" pak guru ")
        || q.includes(" bu guru ")
    );

}


function removeWakeCommand(text) {

    return String(text || "")
        .replace(/guru ai/gi, "")
        .replace(/pak guru/gi, "")
        .replace(/bu guru/gi, "")
        .replace(/guru/gi, "")
        .replace(/^\s*,?\s*/, "")
        .trim();

}


function isMeaningfulQuestion(text) {

    var q = normalizeText(text);

    if (!q) {
        return false;
    }

    if (detectSmartIntent(q)) {
        return true;
    }

    if (hasWakeCommand(q)) {
        return true;
    }

    var keywords = extractSmartKeywords(q);

    if (keywords.length >= 1 && q.length >= 6) {
        return true;
    }

    return false;

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


function buildSummaryFromText(text) {

    text = cleanText(text);

    var sentences = text.split(/(?<=[.!?])\s+/);

    var summary = sentences.slice(0, 3).join(" ");

    if (!summary) {
        summary = "Jawaban ini membahas inti materi yang sedang dipelajari.";
    }

    return summary;

}


function buildEasyExplanation(text) {

    text = cleanText(text);

    var clean = text
        .replace(/Pertanyaan siswa:/gi, "")
        .replace(/Jawaban inti:/gi, "")
        .replace(/Jawaban singkat:/gi, "")
        .replace(/Dasar materi dari modul:/gi, "")
        .replace(/Penjelasan mudah:/gi, "")
        .replace(/Langkah praktik:/gi, "")
        .replace(/Contoh:/gi, "");

    return (
        shortText(clean, 520) +
        "\n\n" +
        "Cara memahaminya: cari inti masalahnya, lihat contoh, lalu praktikkan pelan-pelan."
    );

}


function hasAny(text, list) {

    var q = normalizeText(text);

    for (var i = 0; i < list.length; i++) {

        if (q.includes(list[i])) {
            return true;
        }

    }

    return false;

}


function uniqueArray(list) {

    var result = [];

    list.forEach(function (item) {

        if (result.indexOf(item) === -1) {
            result.push(item);
        }

    });

    return result;

}


function textSimilarity(a, b) {

    if (!a || !b) {
        return 0;
    }

    var wordsA = uniqueArray(
        a.split(/\s+/).filter(function (word) {
            return word.length >= 4;
        })
    );

    var wordsB = uniqueArray(
        b.split(/\s+/).filter(function (word) {
            return word.length >= 4;
        })
    );

    if (wordsA.length === 0 || wordsB.length === 0) {
        return 0;
    }

    var same = 0;

    wordsA.forEach(function (word) {

        if (wordsB.indexOf(word) !== -1) {
            same += 1;
        }

    });

    return same / Math.max(wordsA.length, wordsB.length);

}


function escapeHtml(value) {

    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}