// =========================================================
// GURU AI JSKM
// EZVIZ TALKBACK SPEAKER INTEGRATION
// FILE 15.1
// HUB SUARA GURU AI KE EZVIZ / SPEAKER KOMPUTER
// =========================================================

console.log("EZVIZ Talkback JS 15.1 Loaded");


// =========================================================
// STATE
// =========================================================

var ezvizTalkbackMode = "pc";
var ezvizTalkbackReady = false;


// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    createEzvizTalkbackPanel();

    loadEzvizTalkbackConfig();

    setTimeout(function () {

        patchClassCameraSpeakerButtons();
        patchGlobalGuruAiSpeaker();

    }, 800);

});


// =========================================================
// CREATE PANEL
// =========================================================

function createEzvizTalkbackPanel() {

    if (document.getElementById("ezvizTalkbackPanel")) {
        return;
    }

    var target = document.getElementById("classCameraStatus");

    if (!target) {
        return;
    }

    var html = `
        <div
            id="ezvizTalkbackPanel"
            style="
                background: #020617;
                border: 1px solid #334155;
                border-radius: 18px;
                padding: 18px;
                margin-top: 16px;
            "
        >

            <h3 style="margin-top: 0; color: #bfdbfe;">
                🔊 EZVIZ Talkback Speaker Integration
            </h3>

            <div
                style="
                    background: #450a0a;
                    border: 1px solid #dc2626;
                    border-radius: 14px;
                    padding: 14px;
                    color: #ffffff;
                    line-height: 1.7;
                    margin-bottom: 14px;
                "
            >
                RTSP hanya untuk preview kamera. Untuk suara keluar langsung dari speaker kamera EZVIZ,
                sistem membutuhkan EZVIZ SDK Bridge. Jika bridge belum tersedia, suara otomatis keluar
                dari speaker komputer / TV / proyektor.
            </div>

            <div
                style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 12px;
                "
            >

                <div>

                    <label style="display:block; color:#bfdbfe; font-weight:900; margin-bottom:8px;">
                        Mode Speaker
                    </label>

                    <select
                        id="ezvizTalkbackModeSelect"
                        style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 12px;
                            border: 1px solid #475569;
                            background: #0b1220;
                            color: #ffffff;
                            font-weight: 800;
                        "
                    >
                        <option value="pc">Speaker Komputer / TV / Proyektor</option>
                        <option value="ezviz_sdk">Speaker Kamera EZVIZ via SDK Bridge</option>
                    </select>

                </div>

                <div>

                    <label style="display:block; color:#bfdbfe; font-weight:900; margin-bottom:8px;">
                        Camera No
                    </label>

                    <input
                        id="ezvizCameraNoInput"
                        type="number"
                        value="1"
                        min="1"
                        style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 12px;
                            border: 1px solid #475569;
                            background: #0b1220;
                            color: #ffffff;
                            font-weight: 800;
                        "
                    >

                </div>

            </div>

            <div
                style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 12px;
                "
            >

                <div>

                    <label style="display:block; color:#bfdbfe; font-weight:900; margin-bottom:8px;">
                        Device Serial EZVIZ
                    </label>

                    <input
                        id="ezvizDeviceSerialInput"
                        type="text"
                        placeholder="Isi serial kamera EZVIZ"
                        style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 12px;
                            border: 1px solid #475569;
                            background: #0b1220;
                            color: #ffffff;
                            font-weight: 800;
                        "
                    >

                </div>

                <div>

                    <label style="display:block; color:#bfdbfe; font-weight:900; margin-bottom:8px;">
                        Verification Code
                    </label>

                    <input
                        id="ezvizVerificationCodeInput"
                        type="password"
                        placeholder="Kode verifikasi kamera"
                        style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 12px;
                            border: 1px solid #475569;
                            background: #0b1220;
                            color: #ffffff;
                            font-weight: 800;
                        "
                    >

                </div>

            </div>

            <div style="margin-bottom: 12px;">

                <label style="display:block; color:#bfdbfe; font-weight:900; margin-bottom:8px;">
                    Lokasi EZVIZ SDK Bridge
                </label>

                <input
                    id="ezvizBridgePathInput"
                    type="text"
                    placeholder="Contoh: E:\\EGURU_AI_DKV\\backend\\ezviz_bridge\\ezviz_talkback_bridge.exe"
                    style="
                        width: 100%;
                        padding: 12px;
                        border-radius: 12px;
                        border: 1px solid #475569;
                        background: #0b1220;
                        color: #ffffff;
                        font-weight: 800;
                    "
                >

            </div>

            <div
                style="
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 12px;
                "
            >

                <button
                    class="btn-green"
                    id="saveEzvizTalkbackButton"
                >
                    💾 Simpan Talkback
                </button>

                <button
                    class="btn-blue"
                    id="checkEzvizTalkbackButton"
                >
                    🔍 Cek Status
                </button>

                <button
                    class="btn-purple"
                    id="testEzvizTalkbackButton"
                >
                    🔊 Tes Suara
                </button>

            </div>

            <div
                id="ezvizTalkbackStatus"
                style="
                    background: #0b1220;
                    border: 1px dashed #475569;
                    border-radius: 14px;
                    padding: 14px;
                    color: #e5e7eb;
                    line-height: 1.7;
                    white-space: pre-line;
                "
            >
                Status EZVIZ Talkback: belum dicek.
            </div>

        </div>
    `;

    target.insertAdjacentHTML(
        "afterend",
        html
    );

    document.getElementById("saveEzvizTalkbackButton").onclick = saveEzvizTalkbackConfig;
    document.getElementById("checkEzvizTalkbackButton").onclick = checkEzvizTalkbackStatus;
    document.getElementById("testEzvizTalkbackButton").onclick = testEzvizTalkback;

}


// =========================================================
// LOAD CONFIG
// =========================================================

async function loadEzvizTalkbackConfig() {

    try {

        var response = await fetch("/api/ezviz/talkback/config");

        var result = await response.json();

        if (!result.success) {

            setEzvizTalkbackStatus(
                "Gagal membaca setting EZVIZ Talkback."
            );

            return;

        }

        var data = result.data || {};

        setValue(
            "ezvizDeviceSerialInput",
            data.device_serial || ""
        );

        setValue(
            "ezvizVerificationCodeInput",
            data.verification_code || ""
        );

        setValue(
            "ezvizCameraNoInput",
            data.camera_no || 1
        );

        setValue(
            "ezvizTalkbackModeSelect",
            data.talkback_mode || "pc"
        );

        setValue(
            "ezvizBridgePathInput",
            data.bridge_path || ""
        );

        ezvizTalkbackMode = data.talkback_mode || "pc";

        setEzvizTalkbackStatus(
            "Setting EZVIZ Talkback dimuat.\nMode aktif: " +
            getTalkbackModeText(ezvizTalkbackMode)
        );

    } catch (error) {

        console.error("Load EZVIZ Talkback Error:", error);

        setEzvizTalkbackStatus(
            "Gagal membaca setting EZVIZ Talkback dari server."
        );

    }

}


// =========================================================
// SAVE CONFIG
// =========================================================

async function saveEzvizTalkbackConfig() {

    try {

        var payload = {
            device_serial: getValue("ezvizDeviceSerialInput", ""),
            verification_code: getValue("ezvizVerificationCodeInput", ""),
            camera_no: Number(getValue("ezvizCameraNoInput", "1")),
            talkback_mode: getValue("ezvizTalkbackModeSelect", "pc"),
            bridge_path: getValue("ezvizBridgePathInput", "")
        };

        var response = await fetch(
            "/api/ezviz/talkback/config",
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

            setEzvizTalkbackStatus(
                "Gagal menyimpan setting EZVIZ Talkback."
            );

            return;

        }

        ezvizTalkbackMode = payload.talkback_mode;

        setEzvizTalkbackStatus(
            "Setting EZVIZ Talkback berhasil disimpan.\nMode: " +
            getTalkbackModeText(ezvizTalkbackMode)
        );

        patchClassCameraSpeakerButtons();
        patchGlobalGuruAiSpeaker();

    } catch (error) {

        console.error("Save EZVIZ Talkback Error:", error);

        setEzvizTalkbackStatus(
            "Gagal menyimpan setting EZVIZ Talkback."
        );

    }

}


// =========================================================
// STATUS
// =========================================================

async function checkEzvizTalkbackStatus() {

    try {

        setEzvizTalkbackStatus(
            "Mengecek status EZVIZ Talkback..."
        );

        var response = await fetch(
            "/api/ezviz/talkback/status?t=" + Date.now()
        );

        var result = await response.json();

        ezvizTalkbackReady = !!result.ready;

        setEzvizTalkbackStatus(
            "Mode: " +
            getTalkbackModeText(result.mode || "pc") +
            "\nReady: " +
            (result.ready ? "Ya" : "Belum") +
            "\n" +
            (result.message || "-")
        );

    } catch (error) {

        console.error("Check EZVIZ Talkback Error:", error);

        setEzvizTalkbackStatus(
            "Gagal cek status EZVIZ Talkback."
        );

    }

}


// =========================================================
// SPEAK HUB
// =========================================================

async function testEzvizTalkback() {

    await speakToEzvizOrPcSpeaker(
        "Tes suara Guru AI JSKM. Jika mode speaker komputer aktif, suara keluar dari komputer. Jika mode EZVIZ SDK sudah siap, suara akan diarahkan ke speaker kamera."
    );

}


async function speakToEzvizOrPcSpeaker(text) {

    try {

        var cleanText = String(text || "").trim();

        if (!cleanText) {
            return;
        }

        var response = await fetch(
            "/api/ezviz/talkback/speak",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: cleanText
                })
            }
        );

        var result = await response.json();

        if (result.success && result.mode === "pc") {

            speakByComputerSpeaker(cleanText);

            setEzvizTalkbackStatus(
                "Suara dikirim ke speaker komputer.\n" +
                result.message
            );

            return;

        }

        if (result.success && result.mode === "ezviz_sdk") {

            setEzvizTalkbackStatus(
                "Perintah suara dikirim ke EZVIZ SDK Bridge.\n" +
                result.message
            );

            return;

        }

        speakByComputerSpeaker(cleanText);

        setEzvizTalkbackStatus(
            "EZVIZ Talkback belum siap.\n" +
            (result.message || "Suara dialihkan ke speaker komputer.")
        );

    } catch (error) {

        console.error("Speak EZVIZ Error:", error);

        speakByComputerSpeaker(text);

        setEzvizTalkbackStatus(
            "Gagal menghubungi API Talkback. Suara dialihkan ke speaker komputer."
        );

    }

}


function speakByComputerSpeaker(text) {

    if (!("speechSynthesis" in window)) {
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
// PATCH EXISTING CAMERA BUTTONS
// =========================================================

function patchClassCameraSpeakerButtons() {

    var greetButton = document.getElementById("classGreetStudentsButton");
    var warnButton = document.getElementById("classWarnStudentsButton");
    var focusButton = document.getElementById("classFocusStudentsButton");

    if (greetButton) {

        greetButton.onclick = function () {

            speakToEzvizOrPcSpeaker(
                "Halo siswa semua. Selamat datang di kelas Guru AI JSKM. Silakan duduk dengan rapi, siapkan catatan, dan fokus mengikuti pembelajaran."
            );

        };

    }

    if (warnButton) {

        warnButton.onclick = function () {

            speakToEzvizOrPcSpeaker(
                "Perhatian untuk semua siswa. Silakan fokus ke pembelajaran. Kurangi bercanda, perhatikan materi, dan ikuti arahan pembimbing."
            );

        };

    }

    if (focusButton) {

        focusButton.onclick = function () {

            speakToEzvizOrPcSpeaker(
                "Guru AI mengingatkan. Silakan semua siswa fokus, lihat ke layar pembelajaran, siapkan catatan, dan dengarkan penjelasan dengan baik."
            );

        };

    }

}


// =========================================================
// PATCH GLOBAL GURU AI SPEAKER
// UNTUK BREAK, SMART CAMERA, DAN TEGURAN OTOMATIS
// =========================================================

function patchGlobalGuruAiSpeaker() {

    try {

        window.speakClassCameraText = function (text) {

            speakToEzvizOrPcSpeaker(text);

        };

        if (typeof speakClassCameraText !== "undefined") {

            speakClassCameraText = function (text) {

                speakToEzvizOrPcSpeaker(text);

            };

        }

        console.log("Global Guru AI speaker patched to EZVIZ Talkback Hub.");

    } catch (error) {

        console.error("Patch Global Speaker Error:", error);

    }

}


// =========================================================
// HELPER
// =========================================================

function getValue(id, fallback) {

    var element = document.getElementById(id);

    if (!element) {
        return fallback;
    }

    var value = String(element.value || "").trim();

    if (!value) {
        return fallback;
    }

    return value;

}


function setValue(id, value) {

    var element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.value = value;

}


function setEzvizTalkbackStatus(text) {

    var element = document.getElementById("ezvizTalkbackStatus");

    if (element) {
        element.textContent = text;
    }

}


function getTalkbackModeText(mode) {

    if (mode === "ezviz_sdk") {
        return "Speaker Kamera EZVIZ via SDK Bridge";
    }

    return "Speaker Komputer / TV / Proyektor";

}