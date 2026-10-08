// =========================================================
// GURU AI JSKM
// CAMERA SETTINGS JS
// FILE 15.3
// KHUSUS IP CAMERA EZVIZ - TANPA WEBCAM KOMPUTER
// =========================================================

console.log("Camera Settings JS 15.3 Loaded");


// =========================================================
// ELEMENTS
// =========================================================

var cameraNameInput = document.getElementById("cameraNameInput");
var cameraLocationInput = document.getElementById("cameraLocationInput");
var rtspUrlInput = document.getElementById("rtspUrlInput");
var speakerModeSelect = document.getElementById("speakerModeSelect");
var speakerApiInput = document.getElementById("speakerApiInput");

var saveCameraButton = document.getElementById("saveCameraButton");
var loadCameraButton = document.getElementById("loadCameraButton");
var testCameraButton = document.getElementById("testCameraButton");

var cameraStatusBox = document.getElementById("cameraStatusBox");

var ipCameraPreview = document.getElementById("ipCameraPreview");
var ipCameraPlaceholder = document.getElementById("ipCameraPlaceholder");

var startIpPreviewButton = document.getElementById("startIpPreviewButton");
var stopIpPreviewButton = document.getElementById("stopIpPreviewButton");

var warningTextInput = document.getElementById("warningTextInput");

var greetStudentsButton = document.getElementById("greetStudentsButton");
var warnStudentsButton = document.getElementById("warnStudentsButton");
var checkClassButton = document.getElementById("checkClassButton");
var stopWarningButton = document.getElementById("stopWarningButton");

var speakerStatusBox = document.getElementById("speakerStatusBox");


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setupCameraEvents();

    loadCameraSetting();

});


// =========================================================
// EVENTS
// =========================================================

function setupCameraEvents() {

    if (saveCameraButton) {
        saveCameraButton.onclick = saveCameraSetting;
    }

    if (loadCameraButton) {
        loadCameraButton.onclick = loadCameraSetting;
    }

    if (testCameraButton) {
        testCameraButton.onclick = testIpCamera;
    }

    if (startIpPreviewButton) {
        startIpPreviewButton.onclick = startIpCameraPreview;
    }

    if (stopIpPreviewButton) {
        stopIpPreviewButton.onclick = stopIpCameraPreview;
    }

    if (greetStudentsButton) {
        greetStudentsButton.onclick = greetStudents;
    }

    if (warnStudentsButton) {
        warnStudentsButton.onclick = warnStudents;
    }

    if (checkClassButton) {
        checkClassReady;
        checkClassButton.onclick = checkClassReady;
    }

    if (stopWarningButton) {
        stopWarningButton.onclick = stopSpeaker;
    }

}


// =========================================================
// LOAD CAMERA CONFIG
// =========================================================

async function loadCameraSetting() {

    try {

        setCameraStatus(
            "Memuat setting kamera..."
        );

        var response = await fetch(
            "/api/camera/config?t=" + Date.now()
        );

        var result = await response.json();

        if (!result.success) {

            setCameraStatus(
                "Gagal memuat setting kamera."
            );

            return;

        }

        var data = result.data || {};

        setInputValue(
            cameraNameInput,
            data.camera_name || "Kamera Kelas"
        );

        setInputValue(
            cameraLocationInput,
            data.camera_location || "Ruang Kelas"
        );

        setInputValue(
            rtspUrlInput,
            data.rtsp_url || "rtsp://admin:EBWPAC@192.168.10.145:554/ch1/main"
        );

        setInputValue(
            speakerModeSelect,
            data.speaker_mode || "pc"
        );

        setInputValue(
            speakerApiInput,
            data.speaker_api_url || ""
        );

        setCameraStatus(
            "Setting kamera dimuat.\n\nNama: " +
            getInputValue(cameraNameInput, "Kamera Kelas") +
            "\nLokasi: " +
            getInputValue(cameraLocationInput, "Ruang Kelas") +
            "\n\nIP Camera EZVIZ siap digunakan."
        );

        updateSpeakerStatus();

    } catch (error) {

        console.error("Load Camera Setting Error:", error);

        setCameraStatus(
            "Gagal memuat setting kamera dari server."
        );

    }

}


// =========================================================
// SAVE CAMERA CONFIG
// =========================================================

async function saveCameraSetting() {

    try {

        var payload = {
            camera_name: getInputValue(cameraNameInput, "Kamera Kelas"),
            camera_location: getInputValue(cameraLocationInput, "Ruang Kelas"),
            rtsp_url: getInputValue(rtspUrlInput, ""),
            speaker_mode: getInputValue(speakerModeSelect, "pc"),
            speaker_api_url: getInputValue(speakerApiInput, "")
        };

        var response = await fetch(
            "/api/camera/config",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        var result = await response.json();

        if (!result.success) {

            setCameraStatus(
                "Gagal menyimpan setting kamera."
            );

            return;

        }

        setCameraStatus(
            "Setting kamera berhasil disimpan.\n\nNama: " +
            payload.camera_name +
            "\nLokasi: " +
            payload.camera_location +
            "\nRTSP: " +
            payload.rtsp_url
        );

        updateSpeakerStatus();

    } catch (error) {

        console.error("Save Camera Setting Error:", error);

        setCameraStatus(
            "Gagal menyimpan setting kamera."
        );

    }

}


// =========================================================
// TEST IP CAMERA
// =========================================================

async function testIpCamera() {

    try {

        await saveCameraSetting();

        setCameraStatus(
            "Test IP Camera dimulai.\nJika preview tampil di kanan, kamera EZVIZ berhasil tersambung."
        );

        startIpCameraPreview();

    } catch (error) {

        console.error("Test IP Camera Error:", error);

        setCameraStatus(
            "Gagal test IP Camera."
        );

    }

}


// =========================================================
// IP CAMERA PREVIEW
// =========================================================

function startIpCameraPreview() {

    if (!ipCameraPreview) {
        return;
    }

    stopIpCameraPreview();

    setTimeout(function () {

        ipCameraPreview.src = "/api/camera/stream?t=" + Date.now();
        ipCameraPreview.style.display = "block";

        if (ipCameraPlaceholder) {
            ipCameraPlaceholder.style.display = "none";
        }

        setCameraStatus(
            "Preview IP Camera EZVIZ aktif.\nKamera berhasil ditampilkan dari RTSP."
        );

    }, 300);

}


function stopIpCameraPreview() {

    if (ipCameraPreview) {

        ipCameraPreview.src = "";
        ipCameraPreview.style.display = "none";

    }

    if (ipCameraPlaceholder) {
        ipCameraPlaceholder.style.display = "flex";
    }

    setCameraStatus(
        "Preview IP Camera dihentikan."
    );

}


// =========================================================
// SPEAKER / TEGURAN
// =========================================================

function greetStudents() {

    var text =
        "Halo siswa semua. Selamat datang di kelas Guru AI JSKM. Silakan duduk dengan rapi, siapkan catatan, dan fokus mengikuti pembelajaran.";

    speakText(text);

}


function warnStudents() {

    var text = getInputValue(
        warningTextInput,
        "Perhatian untuk semua siswa. Silakan fokus mengikuti pembelajaran."
    );

    speakText(text);

}


function checkClassReady() {

    var text =
        "Guru AI mengecek kesiapan kelas. Silakan semua siswa duduk dengan rapi, siapkan catatan, dan dengarkan arahan pembimbing.";

    speakText(text);

}


function stopSpeaker() {

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    setSpeakerStatus(
        "Suara Guru AI dihentikan."
    );

}


function speakText(text) {

    var mode = getInputValue(
        speakerModeSelect,
        "pc"
    );

    if (mode === "ipcam") {

        setSpeakerStatus(
            "Mode speaker IP Camera dipilih.\nUntuk EZVIZ, talkback langsung membutuhkan EZVIZ SDK Bridge.\nSaat ini suara dialihkan ke speaker komputer."
        );

    } else {

        setSpeakerStatus(
            "Suara keluar dari speaker komputer / laptop pembimbing."
        );

    }

    speakByComputerSpeaker(text);

}


function speakByComputerSpeaker(text) {

    if (!("speechSynthesis" in window)) {

        setSpeakerStatus(
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


function updateSpeakerStatus() {

    var mode = getInputValue(
        speakerModeSelect,
        "pc"
    );

    if (mode === "ipcam") {

        setSpeakerStatus(
            "Mode speaker IP Camera dipilih.\nUntuk EZVIZ, talkback langsung membutuhkan EZVIZ SDK Bridge.\nSementara suara tetap keluar dari speaker komputer."
        );

        return;

    }

    setSpeakerStatus(
        "Mode speaker komputer aktif."
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


function setInputValue(element, value) {

    if (!element) {
        return;
    }

    element.value = value;

}


function setCameraStatus(text) {

    if (cameraStatusBox) {
        cameraStatusBox.textContent = text;
    }

}


function setSpeakerStatus(text) {

    if (speakerStatusBox) {
        speakerStatusBox.textContent = text;
    }

}