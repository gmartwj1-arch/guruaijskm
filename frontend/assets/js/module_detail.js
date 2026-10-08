// =========================================================
// GURU AI JSKM
// MODULE DETAIL JS
// FILE 16.0
// DETAIL MODUL MULTI-JURUSAN + INTERAKTIF BOOKMARK & GURU AI
// =========================================================

console.log("Module Detail JS 16.0 Loaded");

let allSections = [];
let currentChapterData = null;
let activeSectionIndex = -1;

const urlParams = new URLSearchParams(window.location.search);
let currentMajor = (urlParams.get("major") || localStorage.getItem("selected_major") || "DKV").toUpperCase();
if (currentMajor !== "TKJ") currentMajor = "DKV";

// =========================================================
// GET CHAPTER NUMBER
// =========================================================

function getChapterNumber() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    const num = parseInt(lastPart, 10);
    return isNaN(num) ? 1 : num;
}

// =========================================================
// UPDATE MAJOR BUTTON STYLES
// =========================================================

function updateMajorButtonsUI() {
    const btnDkv = document.getElementById("majorBtnDKV");
    const btnTkj = document.getElementById("majorBtnTKJ");

    if (btnDkv && btnTkj) {
        if (currentMajor === "DKV") {
            btnDkv.style.background = "#7c3aed";
            btnDkv.style.color = "#ffffff";
            btnDkv.style.border = "none";
            btnDkv.style.boxShadow = "0 4px 14px rgba(124,58,237,0.35)";

            btnTkj.style.background = "#f1f5f9";
            btnTkj.style.color = "#475569";
            btnTkj.style.border = "1px solid #cbd5e1";
            btnTkj.style.boxShadow = "none";
        } else {
            btnTkj.style.background = "#0284c7";
            btnTkj.style.color = "#ffffff";
            btnTkj.style.border = "none";
            btnTkj.style.boxShadow = "0 4px 14px rgba(2,132,199,0.35)";

            btnDkv.style.background = "#f1f5f9";
            btnDkv.style.color = "#475569";
            btnDkv.style.border = "1px solid #cbd5e1";
            btnDkv.style.boxShadow = "none";
        }
    }
}

// =========================================================
// SWITCH MAJOR
// =========================================================

function switchMajor(newMajor) {
    newMajor = (newMajor || "DKV").toUpperCase();
    if (newMajor === currentMajor) return;

    currentMajor = newMajor;
    localStorage.setItem("selected_major", currentMajor);

    // Update URL query string without full reload
    const newUrl = `${window.location.pathname}?major=${encodeURIComponent(currentMajor)}`;
    window.history.replaceState({ path: newUrl }, "", newUrl);

    updateMajorButtonsUI();
    closeSectionDetail();
    loadModuleDetail();
}

// =========================================================
// NAVIGATION
// =========================================================

function goBackToModules() {
    window.location.href = `/admin/modules?major=${encodeURIComponent(currentMajor)}`;
}

// =========================================================
// LOAD MODULE DETAIL
// =========================================================

async function loadModuleDetail() {
    updateMajorButtonsUI();
    const chapterNumber = getChapterNumber();

    try {
        const response = await fetch(`/api/admin/modules/${chapterNumber}?major=${encodeURIComponent(currentMajor)}`);

        if (!response.ok) {
            throw new Error(`Modul BAB ${chapterNumber} untuk jurusan ${currentMajor} tidak ditemukan.`);
        }

        const result = await response.json();
        if (!result.success || !result.data) {
            throw new Error(result.message || "Detail modul gagal dimuat.");
        }

        const data = result.data;
        currentChapterData = data;
        allSections = Array.isArray(data.sections) ? data.sections : [];

        const majorLabel = currentMajor === "DKV" ? "DKV (Desain)" : "TKJ (Jaringan)";
        setText("moduleTitle", `${data.code || "BAB " + chapterNumber} - ${data.title}`);
        setText("moduleSubtitle", `Materi Pembelajaran ${majorLabel} • BAB ${chapterNumber}`);
        setText("chapterCode", data.code || `BAB ${chapterNumber}`);
        setText("totalSections", data.total_sections || allSections.length);

        renderSections(allSections);

    } catch (error) {
        console.error("Module Detail Error:", error);
        showSectionError(error.message);
    }
}

// =========================================================
// RENDER SECTIONS
// =========================================================

function renderSections(sections) {
    const table = document.getElementById("sectionTable");
    if (!table) return;

    if (!sections || sections.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:36px; color:#64748b;">
                    <div style="font-size:28px; margin-bottom:8px;">📚</div>
                    Tidak ada sub materi yang sesuai dengan pencarian.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = sections.map(function (item, index) {
        const safeTitle = escapeHtml(item.title || "-");
        const safeId = escapeHtml(item.id || "-");
        const safePages = `${escapeHtml(item.pdf_page_start || "-")} - ${escapeHtml(item.pdf_page_end || "-")}`;

        return `
            <tr>
                <td style="font-weight:700; color:#64748b;">${index + 1}</td>
                <td><span style="background:#e0e7ff; color:#3730a3; padding:3px 8px; border-radius:6px; font-weight:700; font-size:12px;">${safeId}</span></td>
                <td style="font-weight:700; color:#0f172a;">${safeTitle}</td>
                <td>${escapeHtml(item.printed_page || "-")}</td>
                <td>${safePages}</td>
                <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button
                            onclick="showSectionDetail(${index})"
                            style="padding:6px 12px; border:none; border-radius:8px; background:#2563eb; color:white; font-weight:700; cursor:pointer; font-size:12px;"
                            title="Baca materi lengkap"
                        >
                            📖 Baca
                        </button>
                        <button
                            onclick="saveSectionBookmarkDirect('${escapeHtml(item.id)}', '${escapeHtml(item.title)}')"
                            style="padding:6px 10px; border:none; border-radius:8px; background:#fef3c7; color:#b45309; font-weight:700; cursor:pointer; font-size:12px;"
                            title="Simpan ke Bookmark"
                        >
                            ⭐
                        </button>
                        <button
                            onclick="askGuruAiAboutSectionDirect('${escapeHtml(item.title)}')"
                            style="padding:6px 10px; border:none; border-radius:8px; background:#e0e7ff; color:#4338ca; font-weight:700; cursor:pointer; font-size:12px;"
                            title="Tanyakan materi ini ke Guru AI"
                        >
                            🤖
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// =========================================================
// SHOW SECTION DETAIL
// =========================================================

function showSectionDetail(index) {
    const section = allSections[index];
    if (!section) return;

    activeSectionIndex = index;

    setText("sectionDetailBadge", `${currentMajor} • ${section.id || "SUB MATERI"}`);
    setText("sectionDetailTitle", `${section.id ? section.id + ' - ' : ''}${section.title || "Detail Materi"}`);
    setText("sectionDetailContent", section.content || "Konten materi belum tersedia.");

    const panel = document.getElementById("sectionDetailPanel");
    if (panel) {
        panel.style.display = "block";
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function closeSectionDetail() {
    activeSectionIndex = -1;
    const panel = document.getElementById("sectionDetailPanel");
    if (panel) {
        panel.style.display = "none";
    }
}

// =========================================================
// BOOKMARK ACTIONS
// =========================================================

async function saveBookmarkApi(sectionId, sectionTitle) {
    const chapterNum = getChapterNumber();
    const payload = {
        user_id: 1,
        chapter: chapterNum,
        section: sectionId || `BAB ${chapterNum}`,
        title: sectionTitle || `Materi BAB ${chapterNum}`,
        major: currentMajor
    };

    try {
        const response = await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (response.ok) {
            alert(`✅ ${data.message || "Materi berhasil disimpan ke Bookmark!"}`);
        } else {
            alert(`⚠️ Gagal menyimpan bookmark: ${data.detail || data.message || "Terjadi kesalahan"}`);
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

function bookmarkCurrentSection() {
    if (activeSectionIndex < 0 || !allSections[activeSectionIndex]) {
        alert("Pilih sub materi terlebih dahulu.");
        return;
    }
    const sec = allSections[activeSectionIndex];
    saveBookmarkApi(sec.id, sec.title);
}

function saveSectionBookmarkDirect(id, title) {
    saveBookmarkApi(id, title);
}

// =========================================================
// ASK GURU AI
// =========================================================

function askAiCurrentSection() {
    if (activeSectionIndex < 0 || !allSections[activeSectionIndex]) {
        alert("Pilih sub materi terlebih dahulu.");
        return;
    }
    const sec = allSections[activeSectionIndex];
    askGuruAiAboutSectionDirect(sec.title);
}

function askGuruAiAboutSectionDirect(title) {
    const chapterNum = getChapterNumber();
    const prompt = encodeURIComponent(`Tolong jelaskan secara jelas, praktis, dan mendalam tentang materi "${title}" untuk siswa jurusan ${currentMajor}. Berikan contoh kasus dan tips belajar.`);
    window.location.href = `/admin/guru-ai?major=${encodeURIComponent(currentMajor)}&chapter=${chapterNum}&prompt=${prompt}`;
}

// =========================================================
// COPY CONTENT
// =========================================================

function copySectionContent() {
    const contentEl = document.getElementById("sectionDetailContent");
    if (!contentEl) return;

    const text = contentEl.innerText || contentEl.textContent || "";
    if (!text.trim()) {
        alert("Konten materi kosong.");
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
            alert("✅ Konten materi berhasil disalin ke clipboard!");
        }).catch(function () {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand("copy");
        alert("✅ Konten materi berhasil disalin ke clipboard!");
    } catch (e) {
        alert("Gagal menyalin teks.");
    }
    document.body.removeChild(textArea);
}

// =========================================================
// SEARCH SECTIONS
// =========================================================

function searchSections() {
    const input = document.getElementById("searchSection");
    if (!input) return;

    const keyword = input.value.toLowerCase().trim();
    if (!keyword) {
        renderSections(allSections);
        return;
    }

    const filtered = allSections.filter(function (item) {
        const id = String(item.id || "").toLowerCase();
        const title = String(item.title || "").toLowerCase();
        const content = String(item.content || "").toLowerCase();
        return id.includes(keyword) || title.includes(keyword) || content.includes(keyword);
    });

    renderSections(filtered);
}

// =========================================================
// ERROR STATE
// =========================================================

function showSectionError(message) {
    const table = document.getElementById("sectionTable");
    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding:36px; color:#dc2626;">
                <div style="font-size:32px; margin-bottom:8px;">⚠️</div>
                <strong style="font-size:16px;">Gagal memuat detail modul</strong>
                <p style="margin:6px 0 0 0; color:#64748b; font-size:14px;">${escapeHtml(message)}</p>
            </td>
        </tr>
    `;
}

// =========================================================
// HELPERS
// =========================================================

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =========================================================
// INIT
// =========================================================

document.addEventListener("DOMContentLoaded", function () {
    loadModuleDetail();

    const searchInput = document.getElementById("searchSection");
    if (searchInput) {
        searchInput.addEventListener("input", searchSections);
    }
});

// Expose globals for onclick handlers
window.goBackToModules = goBackToModules;
window.switchMajor = switchMajor;
window.showSectionDetail = showSectionDetail;
window.closeSectionDetail = closeSectionDetail;
window.bookmarkCurrentSection = bookmarkCurrentSection;
window.saveSectionBookmarkDirect = saveSectionBookmarkDirect;
window.askAiCurrentSection = askAiCurrentSection;
window.askGuruAiAboutSectionDirect = askGuruAiAboutSectionDirect;
window.copySectionContent = copySectionContent;