// =========================================================
// GURU AI JSKM
// STUDENTS PAGE JS
// AKTIFKAN DATA SISWA (SEARCH, FILTER, CRUD)
// =========================================================

console.log("Students JS Loaded");

document.addEventListener("DOMContentLoaded", function () {
    setupStudentButtons();
    loadStudents();
});

function setupStudentButtons() {
    var saveButton = document.getElementById("saveStudentButton");
    var refreshButton = document.getElementById("refreshStudentButton");
    var searchInput = document.getElementById("searchStudentInput");

    if (saveButton) {
        saveButton.onclick = saveStudent;
    }

    if (refreshButton) {
        refreshButton.onclick = loadStudents;
    }

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            loadStudents();
        });
    }
}

async function loadStudents() {
    var body = document.getElementById("studentsTableBody");
    if (!body) return;

    var searchInput = document.getElementById("searchStudentInput");
    var q = searchInput ? searchInput.value.trim() : "";
    var url = "/api/admin/students" + (q ? "?q=" + encodeURIComponent(q) : "");

    setStudentStatus("Memuat data siswa...");

    try {
        var response = await fetch(url);
        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Gagal memuat data siswa.");
        }

        var students = data.students || data.data || [];

        if (students.length === 0) {
            body.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-row" style="text-align:center; padding:24px; color:#94a3b8;">
                        ${q ? "Tidak ada siswa yang cocok dengan pencarian '" + escapeHtml(q) + "'." : "Belum ada data siswa. Silakan tambahkan siswa baru di atas."}
                    </td>
                </tr>
            `;
            setStudentStatus(q ? "Pencarian selesai (0 siswa)." : "Belum ada data siswa.");
            return;
        }

        var html = "";
        students.forEach(function (student, index) {
            var majorBadgeColor = (student.major || student.jurusan || "").toUpperCase() === "TKJ" ? "#0284c7" : "#7c3aed";
            html += `
                <tr>
                    <td style="font-weight:700;">${index + 1}</td>
                    <td style="font-weight:700; color:#0f172a;">${escapeHtml(student.name || student.nama || "-")}</td>
                    <td><code>${escapeHtml(student.username || "-")}</code></td>
                    <td>${escapeHtml(student.email || "-")}</td>
                    <td><strong>${escapeHtml(student.class_name || student.kelas || "-")}</strong></td>
                    <td>
                        <span style="background:${majorBadgeColor}; color:white; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:800;">
                            ${escapeHtml(student.major || student.jurusan || "DKV")}
                        </span>
                    </td>
                    <td>
                        <button
                            class="btn-red"
                            style="padding:8px 14px; font-size:13px;"
                            onclick="deleteStudent(${student.id})"
                        >
                            🗑️ Hapus
                        </button>
                    </td>
                </tr>
            `;
        });

        body.innerHTML = html;
        setStudentStatus("Data siswa berhasil dimuat. Total: " + students.length + " siswa.");

    } catch (error) {
        console.error(error);
        body.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row" style="text-align:center; color:#ef4444; padding:20px;">
                    Gagal memuat data siswa: ${escapeHtml(error.message)}
                </td>
            </tr>
        `;
        setStudentStatus("Gagal memuat: " + error.message);
    }
}

async function saveStudent() {
    var nameInput = document.getElementById("studentNameInput");
    var usernameInput = document.getElementById("studentUsernameInput");
    var emailInput = document.getElementById("studentEmailInput");
    var passwordInput = document.getElementById("studentPasswordInput");
    var classInput = document.getElementById("studentClassInput");
    var majorInput = document.getElementById("studentMajorInput");

    var payload = {
        name: nameInput ? nameInput.value.trim() : "",
        username: usernameInput ? usernameInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        password: passwordInput ? passwordInput.value.trim() : "123456",
        class_name: classInput ? classInput.value.trim() : "",
        major: majorInput ? majorInput.value : "DKV"
    };

    if (!payload.name) {
        setStudentStatus("Nama siswa wajib diisi.");
        if (nameInput) nameInput.focus();
        return;
    }

    if (!payload.username) {
        setStudentStatus("Username siswa wajib diisi.");
        if (usernameInput) usernameInput.focus();
        return;
    }

    setStudentStatus("Menyimpan data siswa...");

    try {
        var response = await fetch(
            "/api/admin/students",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        var data = await response.json();

        if (!response.ok) {
            setStudentStatus(data.detail || data.message || "Gagal menyimpan siswa.");
            return;
        }

        setStudentStatus("✅ Siswa '" + payload.name + "' berhasil ditambahkan!");

        if (nameInput) nameInput.value = "";
        if (usernameInput) usernameInput.value = "";
        if (emailInput) emailInput.value = "";
        if (passwordInput) passwordInput.value = "123456";
        if (classInput) classInput.value = "";

        loadStudents();

    } catch (error) {
        console.error(error);
        setStudentStatus("Gagal menyimpan siswa: " + error.message);
    }
}

async function deleteStudent(studentId) {
    var confirmDelete = confirm("Apakah Anda yakin ingin menghapus data siswa ini?");
    if (!confirmDelete) return;

    setStudentStatus("Menghapus siswa...");

    try {
        var response = await fetch(
            "/api/admin/students/" + studentId,
            {
                method: "DELETE"
            }
        );

        var data = await response.json();

        if (!response.ok) {
            setStudentStatus(data.detail || "Gagal hapus siswa.");
            return;
        }

        setStudentStatus("✅ Siswa berhasil dihapus.");
        loadStudents();

    } catch (error) {
        console.error(error);
        setStudentStatus("Gagal hapus siswa: " + error.message);
    }
}

function setStudentStatus(text) {
    var box = document.getElementById("studentStatusBox");
    if (box) {
        box.textContent = "Status: " + text;
    }
}

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.deleteStudent = deleteStudent;
window.loadStudents = loadStudents;
