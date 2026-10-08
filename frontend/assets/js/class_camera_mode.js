// =========================================================
// GURU AI JSKM
// CLASS CAMERA MODE JS
// FILE 15.4
// FINALISASI MODE KELAS + KAMERA EZVIZ + SMART CAMERA + BREAK
// =========================================================

console.log("Class Camera Mode JS 15.4 Loaded");


// =========================================================
// ELEMENT CAMERA
// =========================================================

var classIpCameraPreview = document.getElementById("classIpCameraPreview");
var classIpCameraPlaceholder = document.getElementById("classIpCameraPlaceholder");

var startClassCameraButton = document.getElementById("startClassCameraButton");
var stopClassCameraButton = document.getElementById("stopClassCameraButton");

var classGreetStudentsButton = document.getElementById("classGreetStudentsButton");
var classWarnStudentsButton = document.getElementById("classWarnStudentsButton");
var classFocusStudentsButton = document.getElementById("classFocusStudentsButton");

var classCameraStatus = document.getElementById("classCameraStatus");

var cameraMiniStatus = document.getElementById("cameraMiniStatus");
var smartMiniStatus = document.getElementById("smartMiniStatus");
var breakMiniStatus = document.getElementById("breakMiniStatus");


// =========================================================
// ELEMENT SMART CAMERA
// =========================================================

var smartCameraStatus = document.getElementById("smartCameraStatus");
var smartCameraLevel = document.getElementById("smartCameraLevel");
var smartCameraMotion = document.getElementById("smartCameraMotion");
var smartCameraRecommendation = document.getElementById("smartCameraRecommendation");

var smartCameraIntervalSelect = document.getElementById("smartCameraIntervalSelect");
var smartCameraWarnModeSelect = document.getElementById("smartCameraWarnModeSelect");

var startSmartCameraButton = document.getElementById("startSmartCameraButton");
var stopSmartCameraButton = document.getElementById("stopSmartCameraButton");
var analyzeSmartCameraButton = document.getElementById("analyzeSmartCameraButton");


// =========================================================
// ELEMENT BREAK
// =========================================================

var breakStartInput = document.getElementById("breakStartInput");
var breakEndInput = document.getElementById("breakEndInput");

var saveBreakScheduleButton = document.getElementById("saveBreakScheduleButton");
var startBreakNowButton = document.getElementById("startBreakNowButton");
var endBreakNowButton = document.getElementById("endBreakNowButton");

var breakScheduleStatus = document.getElementById("breakScheduleStatus");


// =========================================================
// STATE
// =========================================================

var classCameraActive = false;

var smartCameraActive = false;
var smartCameraTimer = null;
var lastSmartWarningTime = 0;
var smartWarningCooldown = 120000;

var breakCheckerInterval = null;
var lastBreakStartKey = "";
var lastBreakEndKey = "";


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setupClassCameraEvents();

    loadCameraInfoForClass();

    loadBreakSchedule();

    startBreakScheduleChecker();

});


// =========================================================
// EVENTS
// =========================================================

function setupClassCameraEvents() {

    if (startClassCameraButton) {
        startClassCameraButton.onclick = startClassIpCamera;
    }

    if (stopClassCameraButton) {
        stopClassCameraButton.onclick = stopClassIpCamera;
    }

    if (classGreetStudentsButton) {
        classGreetStudentsButton.onclick = greetStudentsFromClassCamera;
    }

    if (classWarnStudentsButton) {
        classWarnStudentsButton.onclick = warnStudentsFromClassCamera;
    }

    if (classFocusStudentsButton) {
        classFocusStudentsButton.onclick = focusStudentsFromClassCamera;
    }

    if (startSmartCameraButton) {
        startSmartCameraButton.onclick = startSmartCameraMonitor;
    }

    if (stopSmartCameraButton) {
        stopSmartCameraButton.onclick = stopSmartCameraMonitor;
    }

    if (analyzeSmartCameraButton) {
        analyzeSmartCameraButton.onclick = analyzeSmartCameraNow;
    }

    if (saveBreakScheduleButton) {
        saveBreakScheduleButton.onclick = saveBreakSchedule;
    }

    if (startBreakNowButton) {
        startBreakNowButton.onclick = startBreakNow;
    }

    if (endBreakNowButton) {
        endBreakNowButton.onclick = endBreakNow;
    }

}


// =========================================================
// CAMERA INFO
// =========================================================

async function loadCameraInfoForClass() {

    try {

        var response = await fetch(
            "/api/camera/config?t=" + Date.now()
        );

        var result = await response.json();

        if (!result.success) {

            setClassCameraStatus(
                "Setting kamera belum tersedia. Buka menu Setting Kamera terlebih dahulu."
            );

            setMiniText(
                cameraMiniStatus,
                "Belum"
            );

            return;

        }

        var data = result.data || {};

        if (!data.rtsp_url) {

            setClassCameraStatus(
                "RTSP kamera belum diisi. Buka Setting Kamera, isi RTSP EZVIZ, lalu simpan."
            );

            setMiniText(
                cameraMiniStatus,
                "RTSP Kosong"
            );

            return;

        }

        setClassCameraStatus(
            "Kamera EZVIZ siap digunakan.\nNama: " +
            (data.camera_name || "Kamera Kelas") +
            "\nLokasi: " +
            (data.camera_location || "Ruang Kelas")
        );

        setMiniText(
            cameraMiniStatus,
            "Siap"
        );

    } catch (error) {

        console.error("Load Camera Info Class Error:", error);

        setClassCameraStatus(
            "Gagal membaca setting kamera. Pastikan server berjalan."
        );

        setMiniText(
            cameraMiniStatus,
            "Error"
        );

    }

}


// =========================================================
// CAMERA PREVIEW
// =========================================================

function startClassIpCamera() {

    if (!classIpCameraPreview) {
        return;
    }

    classCameraActive = true;

    stopClassIpCamera();

    setTimeout(function () {

        classCameraActive = true;

        classIpCameraPreview.src = "/api/camera/stream?t=" + Date.now();
        classIpCameraPreview.style.display = "block";

        if (classIpCameraPlaceholder) {
            classIpCameraPlaceholder.style.display = "none";
        }

        setClassCameraStatus(
            "Kamera kelas EZVIZ aktif.\nGunakan hanya untuk pembelajaran dan beritahu siswa bahwa kamera aktif."
        );

        setMiniText(
            cameraMiniStatus,
            "Aktif"
        );

    }, 300);

}


function stopClassIpCamera() {

    classCameraActive = false;

    if (classIpCameraPreview) {

        classIpCameraPreview.src = "";
        classIpCameraPreview.style.display = "none";

    }

    if (classIpCameraPlaceholder) {
        classIpCameraPlaceholder.style.display = "flex";
    }

    setClassCameraStatus(
        "Kamera kelas dihentikan."
    );

    setMiniText(
        cameraMiniStatus,
        "Stop"
    );

}


// =========================================================
// SPEAKING CONTROL
// =========================================================

function greetStudentsFromClassCamera() {

    var text =
        "Halo siswa semua. Selamat datang di kelas Guru AI JSKM. Silakan duduk dengan rapi, siapkan catatan, dan fokus mengikuti pembelajaran.";

    speakClassCameraText(text);

    setClassCameraStatus(
        "Guru AI menyapa siswa."
    );

}


function warnStudentsFromClassCamera() {

    var text =
        "Perhatian untuk semua siswa. Silakan fokus ke pembelajaran. Kurangi bercanda, duduk dengan rapi, dan ikuti arahan pembimbing.";

    speakClassCameraText(text);

    setClassCameraStatus(
        "Guru AI memberi teguran umum kepada siswa."
    );

}


function focusStudentsFromClassCamera() {

    var text =
        "Guru AI mengingatkan. Silakan semua siswa fokus, lihat ke layar pembelajaran, siapkan catatan, dan dengarkan penjelasan dengan baik.";

    speakClassCameraText(text);

    setClassCameraStatus(
        "Guru AI mengingatkan siswa agar fokus."
    );

}


function speakClassCameraText(text) {

    var cleanText = String(text || "").trim();

    if (!cleanText) {
        return;
    }

    if (typeof window.speakToEzvizOrPcSpeaker === "function") {

        window.speakToEzvizOrPcSpeaker(cleanText);

        return;

    }

    speakByComputerSpeakerFallback(cleanText);

}


function speakByComputerSpeakerFallback(text) {

    if (!("speechSynthesis" in window)) {

        setClassCameraStatus(
            "Browser belum mendukung fitur suara."
        );

        return;

    }

    window.speechSynthesis.cancel();

    var utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    var voices = window.speechSynthesis.getVoices();

    var indonesianVoice = voices.find(function (voice) {

        return (
            voice.lang.toLowerCase().includes("id")
            || voice.name.toLowerCase().includes("indonesia")
        );

    });

    if (indonesianVoice) {
        utterance.voice = indonesianVoice;
    }

    window.speechSynthesis.speak(utterance);

}


// =========================================================
// SMART CAMERA
// =========================================================

function startSmartCameraMonitor() {

    smartCameraActive = true;

    setSmartCameraStatus(
        "Smart Camera aktif.\nGuru AI akan mengecek aktivitas kelas secara berkala."
    );

    setMiniText(
        smartMiniStatus,
        "Aktif"
    );

    analyzeSmartCameraNow();

    if (smartCameraTimer) {
        clearInterval(smartCameraTimer);
    }

    var intervalMs = Number(
        getInputValue(
            smartCameraIntervalSelect,
            "30000"
        )
    );

    smartCameraTimer = setInterval(function () {

        if (smartCameraActive) {
            analyzeSmartCameraNow();
        }

    }, intervalMs);

}


function stopSmartCameraMonitor() {

    smartCameraActive = false;

    if (smartCameraTimer) {
        clearInterval(smartCameraTimer);
        smartCameraTimer = null;
    }

    setSmartCameraStatus(
        "Smart Camera dihentikan."
    );

    setMiniText(
        smartMiniStatus,
        "Stop"
    );

}


async function analyzeSmartCameraNow() {

    try {

        setSmartCameraStatus(
            "Menganalisa aktivitas kelas dari IP Camera EZVIZ..."
        );

        var response = await fetch(
            "/api/camera/activity?t=" + Date.now()
        );

        var result = await response.json();

        updateSmartCameraResult(result);

    } catch (error) {

        console.error("Analyze Smart Camera Error:", error);

        setSmartCameraStatus(
            "Gagal menganalisa kamera. Pastikan server aktif dan RTSP kamera benar."
        );

        setSmartCameraLevel("-");
        setSmartCameraMotion("0%");
        setSmartCameraRecommendation(
            "Pastikan kamera EZVIZ aktif dan tidak sedang dibuka di banyak aplikasi."
        );

        setMiniText(
            smartMiniStatus,
            "Error"
        );

    }

}


function updateSmartCameraResult(result) {

    if (!result || !result.success) {

        var message = "Smart Camera gagal membaca aktivitas.";

        if (result && result.message) {
            message = result.message;
        }

        setSmartCameraStatus(message);

        setSmartCameraLevel("-");
        setSmartCameraMotion("0%");
        setSmartCameraRecommendation(
            "Pastikan kamera aktif, RTSP benar, dan OpenCV sudah terpasang."
        );

        setMiniText(
            smartMiniStatus,
            "Gagal"
        );

        return;

    }

    var level = result.level || "unknown";
    var levelText = result.level_text || "Tidak diketahui";
    var motionPercent = result.motion_percent || 0;
    var recommendation = result.recommendation || "-";

    setSmartCameraStatus(
        "Analisa berhasil.\nStatus: " +
        levelText +
        "\nGerakan terdeteksi: " +
        motionPercent +
        "%"
    );

    setSmartCameraLevel(levelText);
    setSmartCameraMotion(motionPercent + "%");
    setSmartCameraRecommendation(recommendation);

    setMiniText(
        smartMiniStatus,
        levelText
    );

    handleSmartCameraAutoWarning(
        level,
        motionPercent
    );

}


function handleSmartCameraAutoWarning(level, motionPercent) {

    var warnMode = getInputValue(
        smartCameraWarnModeSelect,
        "on"
    );

    if (warnMode !== "on") {
        return;
    }

    if (level !== "ramai") {
        return;
    }

    var now = Date.now();

    if ((now - lastSmartWarningTime) < smartWarningCooldown) {
        return;
    }

    lastSmartWarningTime = now;

    var text =
        "Perhatian untuk semua siswa. Kelas terlihat terlalu banyak aktivitas. " +
        "Silakan kembali tenang, duduk dengan rapi, dan fokus mengikuti pembelajaran.";

    speakClassCameraText(text);

    setSmartCameraStatus(
        "Smart Camera mendeteksi kelas terlalu ramai.\nGuru AI memberi teguran otomatis.\nGerakan: " +
        motionPercent +
        "%"
    );

}


function setSmartCameraStatus(text) {

    if (smartCameraStatus) {
        smartCameraStatus.textContent = text;
    }

}


function setSmartCameraLevel(text) {

    if (smartCameraLevel) {
        smartCameraLevel.textContent = text;
    }

}


function setSmartCameraMotion(text) {

    if (smartCameraMotion) {
        smartCameraMotion.textContent = text;
    }

}


function setSmartCameraRecommendation(text) {

    if (smartCameraRecommendation) {
        smartCameraRecommendation.textContent = text;
    }

}


// =========================================================
// BREAK SCHEDULE
// =========================================================

function saveBreakSchedule() {

    var startTime = getInputValue(
        breakStartInput,
        "10:00"
    );

    var endTime = getInputValue(
        breakEndInput,
        "10:15"
    );

    localStorage.setItem(
        "class_break_start_time",
        startTime
    );

    localStorage.setItem(
        "class_break_end_time",
        endTime
    );

    setBreakStatus(
        "Jadwal istirahat disimpan.\nMulai: " +
        startTime +
        "\nSelesai: " +
        endTime +
        "\nGuru AI akan memberi pengumuman otomatis saat waktunya tiba."
    );

    setMiniText(
        breakMiniStatus,
        startTime + " - " + endTime
    );

}


function loadBreakSchedule() {

    var startTime = localStorage.getItem("class_break_start_time") || "10:00";
    var endTime = localStorage.getItem("class_break_end_time") || "10:15";

    if (breakStartInput) {
        breakStartInput.value = startTime;
    }

    if (breakEndInput) {
        breakEndInput.value = endTime;
    }

    setBreakStatus(
        "Jadwal istirahat aktif.\nMulai: " +
        startTime +
        "\nSelesai: " +
        endTime
    );

    setMiniText(
        breakMiniStatus,
        startTime + " - " + endTime
    );

}


function startBreakScheduleChecker() {

    if (breakCheckerInterval) {
        clearInterval(breakCheckerInterval);
    }

    checkBreakScheduleNow();

    breakCheckerInterval = setInterval(function () {

        checkBreakScheduleNow();

    }, 15000);

}


function checkBreakScheduleNow() {

    var startTime = getInputValue(
        breakStartInput,
        localStorage.getItem("class_break_start_time") || "10:00"
    );

    var endTime = getInputValue(
        breakEndInput,
        localStorage.getItem("class_break_end_time") || "10:15"
    );

    var now = new Date();

    var todayKey = getTodayKey(now);
    var currentTime = getCurrentTimeHHMM(now);

    var startKey = todayKey + "_start_" + startTime;
    var endKey = todayKey + "_end_" + endTime;

    var savedStartKey = localStorage.getItem("last_break_start_key") || "";
    var savedEndKey = localStorage.getItem("last_break_end_key") || "";

    lastBreakStartKey = savedStartKey;
    lastBreakEndKey = savedEndKey;

    if (currentTime === startTime && lastBreakStartKey !== startKey) {

        lastBreakStartKey = startKey;

        localStorage.setItem(
            "last_break_start_key",
            startKey
        );

        announceBreakStart(startTime, endTime);

        return;

    }

    if (currentTime === endTime && lastBreakEndKey !== endKey) {

        lastBreakEndKey = endKey;

        localStorage.setItem(
            "last_break_end_key",
            endKey
        );

        announceBreakEnd();

        return;

    }

}


function startBreakNow() {

    var startTime = getCurrentTimeHHMM(new Date());

    var endTime = getInputValue(
        breakEndInput,
        localStorage.getItem("class_break_end_time") || "10:15"
    );

    announceBreakStart(
        startTime,
        endTime
    );

}


function endBreakNow() {

    announceBreakEnd();

}


function announceBreakStart(startTime, endTime) {

    var text =
        "Perhatian untuk semua siswa. Sekarang sudah waktunya istirahat. " +
        "Silakan beristirahat dengan tertib. Jangan meninggalkan barang berharga sembarangan. " +
        "Istirahat dimulai pukul " +
        formatTimeForSpeech(startTime) +
        " dan akan selesai pukul " +
        formatTimeForSpeech(endTime) +
        ".";

    speakClassCameraText(text);

    setBreakStatus(
        "Guru AI mengumumkan waktu istirahat.\nMulai: " +
        startTime +
        "\nSelesai: " +
        endTime
    );

    setMiniText(
        breakMiniStatus,
        "Istirahat"
    );

}


function announceBreakEnd() {

    var text =
        "Perhatian untuk semua siswa. Waktu istirahat sudah selesai. Silakan kembali duduk dengan rapi, siapkan catatan, dan lanjutkan pembelajaran bersama pembimbing.";

    speakClassCameraText(text);

    setBreakStatus(
        "Guru AI mengumumkan bahwa waktu istirahat sudah selesai."
    );

    setMiniText(
        breakMiniStatus,
        "Selesai"
    );

}


// =========================================================
// HELPER
// =========================================================

function getInputValue(element, fallback) {

    if (!element) {
        return fallback;
    }

    var value = String(element.value || "").trim();

    if (!value) {
        return fallback;
    }

    return value;

}


function setClassCameraStatus(text) {

    if (classCameraStatus) {
        classCameraStatus.textContent = text;
    }

}


function setBreakStatus(text) {

    if (breakScheduleStatus) {
        breakScheduleStatus.textContent = text;
    }

}


function setMiniText(element, text) {

    if (element) {
        element.textContent = text;
    }

}


function getTodayKey(date) {

    var year = date.getFullYear();

    var month = String(date.getMonth() + 1).padStart(2, "0");

    var day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;

}


function getCurrentTimeHHMM(date) {

    var hour = String(date.getHours()).padStart(2, "0");

    var minute = String(date.getMinutes()).padStart(2, "0");

    return hour + ":" + minute;

}


function formatTimeForSpeech(value) {

    var parts = String(value || "00:00").split(":");

    var hour = parts[0] || "00";
    var minute = parts[1] || "00";

    return hour + " " + minute;

}