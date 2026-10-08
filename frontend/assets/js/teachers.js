// =========================================================
// GURU AI JSKM
// TEACHERS PAGE JS
// AKTIFKAN DATA GURU (SEARCH, STATS, CRUD)
// =========================================================

console.log("Teachers JS Loaded");

document.addEventListener("DOMContentLoaded", function () {
    setupTeacherEvents();
    loadTeachers();
});

function setupTeacherEvents() {
    var searchInput = document.getElementById("searchTeacher");
    var refreshBtn = document.getElementById("refreshTeacherButton");
    var addBtn = document.getElementById("addTeacherBtn");
    var saveBtn = document.getElementById("saveTeacherButton");
    var cancelBtn = document.getElementById("cancelTeacherButton");

    if (searchInput) {
        searchInput.addEventListener("input", function () {
            loadTeachers();
        });
    }

    if (refreshBtn) {
        refreshBtn.onclick = function () {
            loadTeachers();
        };
    }

    if (addBtn) {
        addBtn.onclick = function () {
            toggleAddTeacherModal(true);
        };
    }

    if (cancelBtn) {
        cancelBtn.onclick = function () {
            toggleAddTeacherModal(false);
        };
    }

    if (saveBtn) {
        saveBtn.onclick = saveTeacher;
    }
}

function toggleAddTeacherModal(show) {
    var modal = document.getElementById("addTeacherModal");
    if (modal) {
        modal.style.display = show ? "flex" : "none";
    }
}

async function loadTeachers() {
    var tbody = document.getElementById("teacherTable");
    if (!tbody) return;

    var searchInput = document.getElementById("searchTeacher");
    var q = searchInput ? searchInput.value.trim() : "";
    var url = "/api/admin/teachers" + (q ? "?q=" + encodeURIComponent(q) : "");

    try {
        var response = await fetch(url);
        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Gagal memuat data guru.");
        }

        var teachers = data.teachers || data.data || [];
        var stats = data.statistics || {};

        // Update statistics cards
        updateText("totalTeachers", stats.total_guru !== undefined ? stats.total_guru : teachers.length);
        updateText("activeTeachers", stats.guru_aktif !== undefined ? stats.guru_aktif : teachers.length);
        updateText("dkvTeachers", stats.guru_dkv !== undefined ? stats.guru_dkv : teachers.length);
        updateText("totalSubjects", stats.total_mapel !== undefined ? stats.total_mapel : 1);

        if (teachers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:30px; color:#94a3b8;">
                        ${q ? "Tidak ada guru yang sesuai dengan pencarian '" + escapeHtml(q) + "'." : "Belum ada data guru. Klik tombol Tambah Guru untuk menambahkan."}
                    </td>
                </tr>
            `;
            return;
        }

        var html = "";
        teachers.forEach(function (teacher, index) {
            var statusBadge = teacher.status === "Aktif" || teacher.active
                ? `<span style="background:#22c55e; color:#052e16; padding:4px 10px; border-radius:999px; font-weight:800; font-size:12px;">Aktif</span>`
                : `<span style="background:#ef4444; color:#ffffff; padding:4px 10px; border-radius:999px; font-weight:800; font-size:12px;">Nonaktif</span>`;

            html += `
                <tr>
                    <td style="font-weight:700;">${index + 1}</td>
                    <td style="font-weight:800; color:#0f172a;">${escapeHtml(teacher.name || teacher.nama || "-")}</td>
                    <td><code>${escapeHtml(teacher.username || "-")}</code></td>
                    <td>${escapeHtml(teacher.nip || "-")}</td>
                    <td><strong>${escapeHtml(teacher.mapel || teacher.subject || "-")}</strong></td>
                    <td>${escapeHtml(teacher.email || "-")}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button
                            class="btn-red"
                            style="background:#ef4444; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:700; cursor:pointer;"
                            onclick="deleteTeacher(${teacher.id})"
                        >
                            🗑️ Hapus
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

    } catch (err) {
        console.error("Gagal load guru:", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center; padding:30px; color:#ef4444;">
                    Gagal memuat data guru: ${escapeHtml(err.message)}
                </td>
            </tr>
        `;
    }
}

async function saveTeacher() {
    var nameInput = document.getElementById("teacherNameInput");
    var usernameInput = document.getElementById("teacherUsernameInput");
    var emailInput = document.getElementById("teacherEmailInput");
    var nipInput = document.getElementById("teacherNipInput");
    var subjectInput = document.getElementById("teacherSubjectInput");
    var statusInput = document.getElementById("teacherStatusInput");

    var payload = {
        name: nameInput ? nameInput.value.trim() : "",
        username: usernameInput ? usernameInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        nip: nipInput ? nipInput.value.trim() : "",
        subject: subjectInput ? subjectInput.value.trim() : "Desain Komunikasi Visual",
        status: statusInput ? statusInput.value : "Aktif",
        password: "guru123"
    };

    if (!payload.name) {
        alert("Nama guru wajib diisi!");
        if (nameInput) nameInput.focus();
        return;
    }

    if (!payload.username) {
        alert("Username guru wajib diisi!");
        if (usernameInput) usernameInput.focus();
        return;
    }

    try {
        var response = await fetch("/api/admin/teachers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        var data = await response.json();

        if (!response.ok) {
            alert(data.detail || data.message || "Gagal menyimpan guru.");
            return;
        }

        alert("✅ Guru '" + payload.name + "' berhasil ditambahkan!");
        toggleAddTeacherModal(false);

        // Reset form
        if (nameInput) nameInput.value = "";
        if (usernameInput) usernameInput.value = "";
        if (emailInput) emailInput.value = "";
        if (nipInput) nipInput.value = "";

        loadTeachers();

    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function deleteTeacher(teacherId) {
    if (!confirm("Apakah Anda yakin ingin menghapus guru ini?")) return;

    try {
        var response = await fetch("/api/admin/teachers/" + teacherId, {
            method: "DELETE"
        });

        var data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Gagal menghapus guru.");
            return;
        }

        alert("✅ Data guru berhasil dihapus.");
        loadTeachers();

    } catch (err) {
        alert("Error: " + err.message);
    }
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

window.deleteTeacher = deleteTeacher;
window.loadTeachers = loadTeachers;
window.toggleAddTeacherModal = toggleAddTeacherModal;
