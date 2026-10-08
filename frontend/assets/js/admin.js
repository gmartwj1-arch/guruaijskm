// =========================================================
// GURU AI JSKM
// ADMIN DASHBOARD JS
// FILE 17.2
// FIX DASHBOARD DATA + ACTIVITY
// =========================================================

console.log("Admin Dashboard JS 17.2 Loaded");

document.addEventListener("DOMContentLoaded", function () {

    loadDashboardData();

    loadActivities();

});


// =========================================================
// LOAD DASHBOARD
// =========================================================

async function loadDashboardData() {

    try {

        var response = await fetch("/api/admin/dashboard");

        var data = await response.json();

        console.log("Dashboard data:", data);

        var summary = data.summary || data || {};

        var totalStudents =
            summary.total_students ||
            data.total_students ||
            data.total_users ||
            0;

        var totalTeachers =
            summary.total_teachers ||
            data.total_teachers ||
            data.total_guru ||
            0;

        var totalQuizResults =
            summary.total_quiz_results ||
            data.total_quiz_results ||
            data.total_chat ||
            0;

        var totalChapters =
            summary.total_chapters ||
            data.total_chapters ||
            data.total_modul ||
            0;

        var totalSections =
            summary.total_sections ||
            data.total_sections ||
            0;

        var totalDkvChapters =
            summary.total_dkv_chapters ||
            data.total_dkv_chapters ||
            0;

        var totalTkjChapters =
            summary.total_tkj_chapters ||
            data.total_tkj_chapters ||
            0;

        setText("totalStudents", totalStudents);
        setText("totalTeachers", totalTeachers);
        setText("totalChapters", totalChapters);
        setText("totalQuizResults", totalQuizResults);

        setText("valueChapters", totalChapters);
        setText("valueSections", totalSections);
        setText("valueDkv", totalDkvChapters);
        setText("valueTkj", totalTkjChapters);

        setBar("barChapters", percent(totalChapters, Math.max(totalChapters, 1)));
        setBar("barSections", percent(totalSections, Math.max(totalSections, 1)));
        setBar("barDkv", percent(totalDkvChapters, Math.max(totalChapters, 1)));
        setBar("barTkj", percent(totalTkjChapters, Math.max(totalChapters, 1)));

    } catch (error) {

        console.error("Gagal load dashboard:", error);

    }

}


// =========================================================
// LOAD ACTIVITIES
// =========================================================

async function loadActivities() {

    var body = document.getElementById("activitiesTableBody");

    if (!body) {
        return;
    }

    try {

        var response = await fetch("/api/admin/activities");

        var data = await response.json();

        console.log("Activities data:", data);

        var activities = data.activities || [];

        if (!activities || activities.length === 0) {

            body.innerHTML = `
                <tr>
                    <td>-</td>
                    <td>Belum ada aktivitas.</td>
                    <td>Normal</td>
                </tr>
            `;

            return;

        }

        var html = "";

        activities.forEach(function (item) {

            html += `
                <tr>
                    <td>${escapeHtml(item.time || "-")}</td>
                    <td>
                        <strong>${escapeHtml(item.icon || "✅")} ${escapeHtml(item.title || "Aktivitas")}</strong>
                        <br>
                        <small>${escapeHtml(item.description || "")}</small>
                    </td>
                    <td>${escapeHtml(item.status || "Aktif")}</td>
                </tr>
            `;

        });

        body.innerHTML = html;

    } catch (error) {

        console.error("Gagal load activities:", error);

        body.innerHTML = `
            <tr>
                <td>-</td>
                <td>Gagal memuat aktivitas.</td>
                <td>Error</td>
            </tr>
        `;

    }

}


// =========================================================
// HELPER
// =========================================================

function setText(id, value) {

    var element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


function setBar(id, value) {

    var element = document.getElementById(id);

    if (element) {
        element.style.width = value + "%";
    }

}


function percent(value, max) {

    value = Number(value || 0);
    max = Number(max || 1);

    if (max <= 0) {
        return 0;
    }

    var result = Math.round((value / max) * 100);

    if (result < 0) {
        result = 0;
    }

    if (result > 100) {
        result = 100;
    }

    return result;

}


function escapeHtml(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}