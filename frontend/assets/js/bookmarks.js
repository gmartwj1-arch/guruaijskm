// =========================================================
// GURU AI JSKM
// BOOKMARKS PAGE JS
// INTERACTIVE SAVED CHAPTERS & QUICK NAVIGATION
// =========================================================

console.log("Bookmarks JS Loaded");

var currentFilter = "ALL";

document.addEventListener("DOMContentLoaded", function () {
    loadBookmarks();
    setupBookmarkEvents();
});

function setupBookmarkEvents() {
    var refreshBtn = document.getElementById("refreshBookmarksBtn");
    var filterBtns = document.querySelectorAll(".filter-btn");

    if (refreshBtn) {
        refreshBtn.onclick = function () {
            loadBookmarks();
        };
    }

    filterBtns.forEach(function (btn) {
        btn.onclick = function () {
            filterBtns.forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter") || "ALL";
            loadBookmarks();
        };
    });
}

async function loadBookmarks() {
    var container = document.getElementById("bookmarksListContainer");
    if (!container) return;

    var url = "/api/bookmarks" + (currentFilter !== "ALL" ? "?major=" + encodeURIComponent(currentFilter) : "");

    try {
        var response = await fetch(url);
        var data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Gagal memuat bookmark.");
        }

        var bookmarks = data.bookmarks || data.data || [];

        // Update counts
        updateText("totalBookmarksCount", data.total || bookmarks.length);
        updateText("dkvBookmarksCount", data.total_dkv !== undefined ? data.total_dkv : bookmarks.filter(function(b){ return (b.major || "").toUpperCase() === "DKV"; }).length);
        updateText("tkjBookmarksCount", data.total_tkj !== undefined ? data.total_tkj : bookmarks.filter(function(b){ return (b.major || "").toUpperCase() === "TKJ"; }).length);

        if (bookmarks.length === 0) {
            container.innerHTML = `
                <div style="background:#ffffff; border-radius:18px; padding:40px; text-align:center; box-shadow:0 8px 30px rgba(15,23,42,0.06); color:#64748b;">
                    <div style="font-size:42px; margin-bottom:14px;">⭐</div>
                    <h3 style="margin:0 0 8px 0; color:#0f172a;">Belum Ada Materi Tersimpan</h3>
                    <p style="margin:0 0 18px 0;">Tandai materi penting di halaman Guru AI atau Modul Pembelajaran agar mudah diakses kembali.</p>
                    <a href="/admin/guru-ai" style="display:inline-block; padding:10px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:12px; font-weight:700;">
                        🤖 Buka Guru AI Sekarang
                    </a>
                </div>
            `;
            return;
        }

        var html = "";
        bookmarks.forEach(function (b) {
            var isDkv = (b.major || "").toUpperCase() === "DKV";
            var majorBadgeColor = isDkv ? "#7c3aed" : "#0284c7";
            var majorLabel = isDkv ? "DKV (Desain)" : "TKJ (Jaringan)";
            var targetLink = b.target_url || `/admin/modules/${b.chapter}?major=${b.major || 'DKV'}`;

            html += `
                <div class="bookmark-item" style="background:#ffffff; border-radius:18px; padding:22px; box-shadow:0 8px 30px rgba(15,23,42,0.06); display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; border-left:6px solid ${majorBadgeColor};">
                    <div style="flex:1; min-width:260px;">
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                            <span style="background:${majorBadgeColor}; color:white; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:800;">
                                ${majorLabel}
                            </span>
                            <span style="color:#64748b; font-size:13px; font-weight:700;">
                                BAB ${b.chapter} ${b.section && b.section !== '-' ? '• ' + escapeHtml(b.section) : ''}
                            </span>
                        </div>
                        <h3 style="margin:0 0 6px 0; color:#0f172a; font-size:18px;">
                            ${escapeHtml(b.title)}
                        </h3>
                        <small style="color:#94a3b8;">
                            📅 Disimpan: ${escapeHtml(b.created_at || "-")}
                        </small>
                    </div>

                    <div style="display:flex; gap:10px; align-items:center;">
                        <a
                            href="${targetLink}"
                            style="padding:10px 18px; background:#2563eb; color:white; text-decoration:none; border-radius:10px; font-weight:800; font-size:13px; display:inline-flex; align-items:center; gap:6px;"
                        >
                            📖 Buka Materi
                        </a>
                        <a
                            href="/admin/guru-ai"
                            style="padding:10px 14px; background:#f1f5f9; color:#0f172a; text-decoration:none; border-radius:10px; font-weight:700; font-size:13px;"
                            title="Tanyakan ke Guru AI"
                        >
                            🤖 Guru AI
                        </a>
                        <button
                            class="btn-red"
                            style="padding:10px 14px; background:#fee2e2; color:#dc2626; border:none; border-radius:10px; font-weight:800; cursor:pointer; font-size:13px;"
                            onclick="deleteBookmark(${b.id})"
                        >
                            🗑️ Hapus
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {
        console.error("Gagal load bookmarks:", err);
        container.innerHTML = `
            <div style="background:#ffffff; border-radius:18px; padding:24px; color:#ef4444; text-align:center;">
                Gagal memuat data bookmark: ${escapeHtml(err.message)}
            </div>
        `;
    }
}

async function deleteBookmark(id) {
    if (!confirm("Hapus bookmark ini?")) return;

    try {
        var response = await fetch("/api/bookmarks/" + id, {
            method: "DELETE"
        });

        var data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Gagal menghapus bookmark.");
            return;
        }

        loadBookmarks();

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

window.deleteBookmark = deleteBookmark;
window.loadBookmarks = loadBookmarks;
