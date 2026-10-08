// =========================================================
// GURU AI JSKM
// SETTINGS PAGE JS
// CONFIGURATION, AI ENGINE, BACKUP & CAMERA MANAGEMENT
// =========================================================

console.log("Settings JS Loaded");

document.addEventListener("DOMContentLoaded", function () {
    loadSettings();
    setupSettingsEvents();
});

function setupSettingsEvents() {
    var saveBtn = document.getElementById("saveSettingsBtn");
    var backupBtn = document.getElementById("backupDbBtn");
    var toggleKeyBtn = document.getElementById("toggleApiKeyBtn");

    if (saveBtn) {
        saveBtn.onclick = saveSettings;
    }

    if (backupBtn) {
        backupBtn.onclick = backupDatabase;
    }

    if (toggleKeyBtn) {
        toggleKeyBtn.onclick = function () {
            var input = document.getElementById("openaiApiKeyInput");
            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    toggleKeyBtn.textContent = "🙈 Sembunyikan";
                } else {
                    input.type = "password";
                    toggleKeyBtn.textContent = "👁️ Tampilkan";
                }
            }
        };
    }
}

async function loadSettings() {
    var statusText = document.getElementById("settingsStatusNotice");
    if (statusText) statusText.textContent = "Memuat konfigurasi sistem...";

    try {
        var response = await fetch("/api/admin/settings");
        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Gagal memuat pengaturan.");
        }

        var s = data.settings || {};

        // Populate fields
        setValue("appNameInput", s.app_name || "GURU AI JSKM");
        setValue("schoolNameInput", s.school_name || "SMK GURU AI INDONESIA");
        setValue("academicYearInput", s.academic_year || "2026/2027");
        setValue("defaultMajorSelect", s.default_major || "DKV");
        setValue("openaiModelSelect", s.openai_model || "gpt-5.6-luna");
        setValue("openaiApiKeyInput", s.openai_api_key || "");
        setValue("rtspUrlInput", s.rtsp_url || "");
        setValue("ezvizSerialInput", s.ezviz_serial || "");
        setValue("ezvizCodeInput", s.ezviz_code || "");
        setValue("voiceSpeedSelect", s.voice_speed || "1.0");

        // Status badges
        var dbBadge = document.getElementById("dbStatusBadge");
        if (dbBadge) {
            var sz = (data.database_size / 1024).toFixed(1);
            dbBadge.innerHTML = `✅ Aktif (${sz} KB)`;
            dbBadge.style.color = "#22c55e";
        }

        var aiBadge = document.getElementById("aiStatusBadge");
        if (aiBadge) {
            if (s.openai_api_key) {
                aiBadge.innerHTML = "✅ Terhubung (API Key Aktif)";
                aiBadge.style.color = "#22c55e";
            } else {
                aiBadge.innerHTML = "⚠️ Kunci API belum diisi";
                aiBadge.style.color = "#f59e0b";
            }
        }

        var camBadge = document.getElementById("camStatusBadge");
        if (camBadge) {
            if (s.rtsp_url) {
                camBadge.innerHTML = "✅ RTSP Terkonfigurasi";
                camBadge.style.color = "#22c55e";
            } else {
                camBadge.innerHTML = "ℹ️ Belum ada URL";
                camBadge.style.color = "#94a3b8";
            }
        }

        if (statusText) statusText.textContent = "Konfigurasi siap.";

    } catch (err) {
        console.error("Gagal load settings:", err);
        if (statusText) statusText.textContent = "Gagal memuat: " + err.message;
    }
}

async function saveSettings() {
    var saveBtn = document.getElementById("saveSettingsBtn");
    var statusText = document.getElementById("settingsStatusNotice");

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "⏳ Menyimpan...";
    }

    var payload = {
        app_name: getValue("appNameInput"),
        school_name: getValue("schoolNameInput"),
        academic_year: getValue("academicYearInput"),
        default_major: getValue("defaultMajorSelect"),
        openai_model: getValue("openaiModelSelect"),
        openai_api_key: getValue("openaiApiKeyInput"),
        rtsp_url: getValue("rtspUrlInput"),
        ezviz_serial: getValue("ezvizSerialInput"),
        ezviz_code: getValue("ezvizCodeInput"),
        voice_speed: parseFloat(getValue("voiceSpeedSelect")) || 1.0
    };

    try {
        var response = await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Gagal menyimpan.");
        }

        if (statusText) {
            statusText.style.color = "#22c55e";
            statusText.textContent = "✅ " + (data.message || "Pengaturan berhasil disimpan dan disinkronkan.");
        }

        alert("✅ Pengaturan berhasil diperbarui ke seluruh sistem!");
        loadSettings();

    } catch (err) {
        console.error("Gagal simpan:", err);
        if (statusText) {
            statusText.style.color = "#ef4444";
            statusText.textContent = "❌ " + err.message;
        }
        alert("Gagal menyimpan: " + err.message);
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "💾 Simpan Semua Pengaturan";
        }
    }
}

async function backupDatabase() {
    var btn = document.getElementById("backupDbBtn");
    var info = document.getElementById("backupInfoText");

    if (btn) {
        btn.disabled = true;
        btn.textContent = "⏳ Memproses backup...";
    }

    try {
        var response = await fetch("/api/admin/system/backup", {
            method: "POST"
        });

        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Gagal backup.");
        }

        var kb = (data.size / 1024).toFixed(1);
        if (info) {
            info.innerHTML = `✅ <strong>Backup Berhasil:</strong> <code>${escapeHtml(data.filename)}</code> (${kb} KB pada ${escapeHtml(data.timestamp)})`;
            info.style.color = "#22c55e";
        }
        alert("✅ Backup database berhasil dibuat di folder backup: " + data.filename);

    } catch (err) {
        console.error("Backup error:", err);
        if (info) {
            info.textContent = "❌ Gagal: " + err.message;
            info.style.color = "#ef4444";
        }
        alert("Gagal backup: " + err.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "📦 Backup Database Sekarang";
        }
    }
}

function getValue(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function setValue(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
