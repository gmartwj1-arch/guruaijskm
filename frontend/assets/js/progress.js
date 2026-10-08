// =========================================================
// GURU AI JSKM
// PROGRESS PAGE JS
// MONITORING & ANALITIK PERKEMBANGAN BELAJAR SISWA
// =========================================================

console.log("Progress JS Loaded");

var currentFilter = "ALL";

document.addEventListener("DOMContentLoaded", function () {
    loadProgress();
    setupProgressEvents();
});

function setupProgressEvents() {
    var refreshBtn = document.getElementById("refreshProgressBtn");
    var filterBtns = document.querySelectorAll(".filter-btn");

    if (refreshBtn) {
        refreshBtn.onclick = function () {
            loadProgress();
        };
    }

    filterBtns.forEach(function (btn) {
        btn.onclick = function () {
            filterBtns.forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter") || "ALL";
            loadProgress();
        };
    });
}

async function loadProgress() {
    var statusText = document.getElementById("progressStatusNotice");
    if (statusText) statusText.textContent = "Memuat data progress...";

    try {
        var response = await fetch("/api/admin/progress");
        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Gagal memuat analitik.");
        }

        var summary = data.summary || {};
        var students = data.students_progress || [];
        var dkvChapters = data.dkv_chapters || [];
        var tkjChapters = data.tkj_chapters || [];

        // 1. Update ringkasan kartu
        updateText("avgScoreCard", (summary.average_score || 0) + "/100");
        updateText("overallCompletionCard", (summary.overall_completion_rate || 0) + "%");
        updateText("totalStudentsCard", summary.total_students || 0);
        updateText("totalQuizzesCard", summary.total_quiz_submissions || 0);

        // 2. Render Progres BAB DKV & TKJ
        renderChapterProgress("dkvChapterProgressGrid", dkvChapters, "#7c3aed");
        renderChapterProgress("tkjChapterProgressGrid", tkjChapters, "#0284c7");

        // 3. Render Tabel Siswa
        renderStudentsTable(students);

        if (statusText) statusText.textContent = "Data terbarui secara realtime.";

    } catch (err) {
        console.error("Gagal load progress:", err);
        if (statusText) statusText.textContent = "Gagal memuat: " + err.message;
    }
}

function renderChapterProgress(elementId, chapters, color) {
    var grid = document.getElementById(elementId);
    if (!grid) return;

    if (!chapters || chapters.length === 0) {
        grid.innerHTML = "<p style='color:#94a3b8;'>Data BAB belum tersedia.</p>";
        return;
    }

    var html = "";
    chapters.forEach(function (ch) {
        var pct = ch.percent || 0;
        html += `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px;">
                <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:800; margin-bottom:6px; color:#1e293b;">
                    <span>BAB ${ch.chapter}</span>
                    <span style="color:${color};">${pct}%</span>
                </div>
                <div style="height:8px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:${color}; border-radius:999px; transition:width 0.4s ease;"></div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = html;
}

function renderStudentsTable(students) {
    var tbody = document.getElementById("studentsProgressTableBody");
    if (!tbody) return;

    var filtered = students;
    if (currentFilter !== "ALL") {
        filtered = students.filter(function (s) {
            return (s.jurusan || "").toUpperCase().indexOf(currentFilter) !== -1;
        });
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">
                    Belum ada data progres siswa untuk filter ini.
                </td>
            </tr>
        `;
        return;
    }

    var html = "";
    filtered.forEach(function (s, index) {
        var isDkv = (s.jurusan || "").toUpperCase() === "DKV";
        var badgeColor = isDkv ? "#7c3aed" : "#0284c7";
        var statusColor = s.status === "Tuntas" ? "#16a34a" : (s.status === "Sedang Belajar" ? "#2563eb" : "#f59e0b");

        html += `
            <tr>
                <td style="font-weight:700;">${index + 1}</td>
                <td style="font-weight:800; color:#0f172a;">${escapeHtml(s.name || "-")}</td>
                <td><strong>${escapeHtml(s.kelas || "-")}</strong></td>
                <td>
                    <span style="background:${badgeColor}; color:white; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:800;">
                        ${escapeHtml(s.jurusan || "DKV")}
                    </span>
                </td>
                <td style="font-weight:700; color:#2563eb;">${s.quiz_completed} kali (${s.average_score} avg)</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="flex:1; height:8px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                            <div style="height:100%; width:${s.progress_percent}%; background:#22c55e; border-radius:999px;"></div>
                        </div>
                        <span style="font-weight:800; font-size:13px; color:#0f172a;">${s.progress_percent}%</span>
                    </div>
                </td>
                <td>
                    <span style="color:${statusColor}; font-weight:800; font-size:13px;">
                        ● ${escapeHtml(s.status)}
                    </span>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function updateText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.loadProgress = loadProgress;
