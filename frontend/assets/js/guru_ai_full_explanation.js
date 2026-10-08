// =========================================================
// GURU AI JSKM
// GURU AI FULL EXPLANATION MODE
// FILE 15.5
// SEMUA BAB DIBUAT PENJABARAN LENGKAP
// =========================================================

console.log("Guru AI Full Explanation JS 15.5 Loaded");


// =========================================================
// INIT PATCH
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    setTimeout(function () {

        installFullExplanationMode();

    }, 800);

});


// =========================================================
// INSTALL
// =========================================================

function installFullExplanationMode() {

    window.renderDetailedExplanation = renderFullDetailedExplanation;
    window.renderSummary = renderFullSummary;
    window.renderCaseExamples = renderFullCaseExamples;
    window.renderPracticeGuide = renderFullPracticeGuide;
    window.renderCommonMistakes = renderFullCommonMistakes;
    window.renderRecommendation = renderFullRecommendation;
    window.buildSpeechParts = buildFullSpeechParts;
    window.renderTabContent = renderFullTabContent;

    setupFullTabButtons();

    rerenderCurrentFullTab();

    console.log("Guru AI Full Explanation Mode aktif.");

}


// =========================================================
// TAB CONTROL
// =========================================================

function setupFullTabButtons() {

    var tabButtons = document.querySelectorAll(".tab-btn");

    tabButtons.forEach(function (button) {

        button.onclick = function () {

            tabButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            var tabName = button.getAttribute("data-tab") || "detail";

            renderFullTabContent(tabName);

        };

    });

}


function rerenderCurrentFullTab() {

    var activeTab = document.querySelector(".tab-btn.active");

    var tabName = "detail";

    if (activeTab) {
        tabName = activeTab.getAttribute("data-tab") || "detail";
    }

    renderFullTabContent(tabName);

}


function renderFullTabContent(tabName) {

    if (tabName === "detail") {
        renderFullDetailedExplanation();
        return;
    }

    if (tabName === "contoh") {
        renderFullCaseExamples();
        return;
    }

    if (tabName === "ringkasan") {
        renderFullSummary();
        return;
    }

    if (tabName === "kesalahan") {
        renderFullCommonMistakes();
        return;
    }

    if (tabName === "rekomendasi") {
        renderFullRecommendation();
        return;
    }

    renderFullDetailedExplanation();

}


// =========================================================
// MAIN RENDER DETAIL
// =========================================================

function renderFullDetailedExplanation() {

    var materialBox = document.getElementById("materialBox");

    if (!materialBox) {
        return;
    }

    var chapter = getActiveGuruChapter();

    if (!chapter) {

        materialBox.innerHTML = `
            <h3>Materi belum dipilih</h3>
            <p>
                Pilih jurusan dan BAB terlebih dahulu agar Guru AI dapat membuat penjabaran lengkap.
            </p>
        `;

        return;

    }

    var major = getActiveGuruMajor();
    var sections = getChapterSections(chapter);

    var html = "";

    html += `
        <h3>
            Penjelasan Lengkap ${escapeHtml(getChapterCode(chapter))} - ${escapeHtml(getChapterTitle(chapter))}
        </h3>

        <p>
            <strong>Pengantar Guru AI:</strong><br>
            Pada materi ini, siswa jurusan ${escapeHtml(major)} akan mempelajari topik
            <strong>${escapeHtml(getChapterTitle(chapter))}</strong>.
            Guru AI akan menjelaskan materi ini secara bertahap mulai dari pengertian,
            fungsi, konsep penting, contoh penerapan, kesalahan umum, hingga praktik
            yang bisa dikerjakan siswa.
        </p>

        <p>
            Materi ini penting karena menjadi bagian dari kompetensi dasar yang harus
            dipahami siswa sebelum masuk ke praktik yang lebih kompleks. Dalam pembelajaran
            kejuruan, siswa tidak cukup hanya mengetahui teori, tetapi juga harus memahami
            bagaimana teori tersebut diterapkan dalam pekerjaan nyata.
        </p>

        <h3>Tujuan Pembelajaran</h3>

        <ol>
            <li>Siswa mampu memahami pengertian dasar dari materi ${escapeHtml(getChapterTitle(chapter))}.</li>
            <li>Siswa mampu menjelaskan fungsi dan manfaat materi dalam bidang ${escapeHtml(major)}.</li>
            <li>Siswa mampu menghubungkan materi dengan contoh pekerjaan nyata.</li>
            <li>Siswa mampu menerapkan materi ke dalam tugas praktik atau proyek sederhana.</li>
            <li>Siswa mampu menghindari kesalahan umum yang sering terjadi pada materi ini.</li>
        </ol>
    `;

    if (sections.length > 0) {

        html += `
            <h3>Peta Materi BAB Ini</h3>
            <ol>
        `;

        sections.forEach(function (section) {

            html += `
                <li>
                    ${escapeHtml(getSectionTitle(section))}
                </li>
            `;

        });

        html += `
            </ol>
        `;

    }

    html += `
        <h3>Pembahasan Detail Materi</h3>
    `;

    if (sections.length === 0) {

        html += `
            <p>
                Data submateri pada BAB ini belum tersedia lengkap di file modul.
                Guru AI tetap dapat menjelaskan berdasarkan judul BAB, tetapi hasil terbaik
                akan diperoleh jika setiap submateri memiliki isi penjelasan di modul.
            </p>

            ${buildGenericChapterExplanation(chapter, major)}
        `;

    } else {

        sections.forEach(function (section, index) {

            html += buildFullSectionExplanation(
                section,
                index + 1,
                chapter,
                major
            );

        });

    }

    html += `
        <h3>Latihan Pemahaman</h3>

        <ol>
            <li>Jelaskan kembali pengertian ${escapeHtml(getChapterTitle(chapter))} dengan bahasa sendiri.</li>
            <li>Sebutkan minimal 3 hal penting yang kamu pelajari dari BAB ini.</li>
            <li>Berikan contoh penerapan materi ini dalam pekerjaan nyata.</li>
            <li>Apa kesalahan yang harus dihindari saat menerapkan materi ini?</li>
            <li>Buat satu tugas praktik sederhana berdasarkan materi BAB ini.</li>
        </ol>

        <h3>Penutup Guru AI</h3>

        <p>
            Kesimpulannya, ${escapeHtml(getChapterTitle(chapter))} adalah materi penting
            yang harus dipahami secara teori dan praktik. Siswa perlu membaca materi,
            memperhatikan contoh, mencoba praktik, dan mengevaluasi hasil pekerjaannya.
            Dengan memahami BAB ini secara lengkap, siswa akan lebih siap mengikuti
            pembelajaran berikutnya dan menerapkan kompetensi di dunia kerja.
        </p>
    `;

    materialBox.innerHTML = html;

}


// =========================================================
// SECTION EXPLANATION
// =========================================================

function buildFullSectionExplanation(section, number, chapter, major) {

    var title = getSectionTitle(section);
    var content = getSectionContent(section);

    var html = "";

    html += `
        <div style="
            background:#020617;
            border:1px solid #334155;
            border-radius:18px;
            padding:18px;
            margin:18px 0;
        ">

            <h3>
                ${number}. ${escapeHtml(title)}
            </h3>

            <p>
                <strong>Pengertian:</strong><br>
                ${buildDefinitionText(title, content, major)}
            </p>
    `;

    if (content) {

        html += `
            <p>
                <strong>Materi inti dari modul:</strong><br>
                ${escapeHtml(content)}
            </p>
        `;

    }

    html += `
            <p>
                <strong>Penjelasan Guru AI:</strong><br>
                ${buildTeacherExplanation(title, content, major)}
            </p>

            <p>
                <strong>Mengapa materi ini penting?</strong><br>
                ${buildImportanceText(title, major)}
            </p>

            <p>
                <strong>Contoh penerapan dalam ${escapeHtml(major)}:</strong><br>
                ${buildExampleText(title, major)}
            </p>

            <p>
                <strong>Praktik siswa:</strong><br>
                ${buildPracticeText(title, major)}
            </p>

            <p>
                <strong>Kesalahan yang harus dihindari:</strong><br>
                ${buildMistakeText(title, major)}
            </p>

            <p>
                <strong>Tips Guru AI:</strong><br>
                ${buildTipsText(title, major)}
            </p>

        </div>
    `;

    return html;

}


// =========================================================
// CONTENT BUILDER
// =========================================================

function buildDefinitionText(title, content, major) {

    if (content && content.length > 40) {

        return "Secara sederhana, " + escapeHtml(title) +
            " adalah bagian dari materi " + escapeHtml(major) +
            " yang perlu dipahami siswa karena berkaitan langsung dengan kompetensi praktik. " +
            "Materi ini menjelaskan konsep, fungsi, dan penerapan yang harus dikuasai siswa.";

    }

    return escapeHtml(title) +
        " adalah materi yang membahas konsep penting dalam bidang " +
        escapeHtml(major) +
        ". Materi ini perlu dipahami agar siswa mampu menerapkannya dalam tugas, proyek, dan pekerjaan nyata.";

}


function buildTeacherExplanation(title, content, major) {

    var lower = title.toLowerCase();

    if (lower.includes("tipografi") || lower.includes("font") || lower.includes("huruf")) {

        return "Dalam DKV, tipografi bukan hanya memilih font yang terlihat bagus. Tipografi adalah cara mengatur huruf agar pesan mudah dibaca, memiliki karakter, dan sesuai dengan tujuan desain. Siswa harus memperhatikan jenis font, ukuran huruf, jarak antar huruf, jarak antar baris, warna teks, serta susunan hierarki visual.";

    }

    if (lower.includes("warna")) {

        return "Warna adalah unsur penting dalam desain karena dapat membangun suasana, emosi, identitas brand, dan fokus visual. Pemilihan warna harus disesuaikan dengan pesan yang ingin disampaikan. Siswa perlu memahami warna utama, warna pendukung, warna aksen, kontras, serta kombinasi warna yang harmonis.";

    }

    if (lower.includes("layout") || lower.includes("komposisi")) {

        return "Layout atau komposisi adalah cara menyusun elemen visual agar desain terlihat rapi, seimbang, dan mudah dipahami. Dalam DKV, layout membantu menentukan posisi teks, gambar, warna, ruang kosong, dan elemen pendukung lainnya. Layout yang baik membuat pesan desain lebih jelas.";

    }

    if (lower.includes("logo") || lower.includes("branding") || lower.includes("brand")) {

        return "Branding adalah proses membangun identitas dan citra agar mudah dikenali. Dalam DKV, branding dapat diwujudkan melalui logo, warna, tipografi, gaya visual, template, dan konsistensi desain. Logo dan identitas visual harus mencerminkan karakter brand serta mudah digunakan di berbagai media.";

    }

    if (lower.includes("poster") || lower.includes("banner") || lower.includes("media promosi")) {

        return "Media promosi seperti poster, banner, dan flyer digunakan untuk menyampaikan informasi kepada audiens secara cepat dan menarik. Desain media promosi harus memiliki judul yang jelas, gambar yang mendukung, informasi yang mudah dibaca, serta ajakan yang kuat.";

    }

    if (lower.includes("portofolio")) {

        return "Portofolio adalah kumpulan karya terbaik yang digunakan untuk menunjukkan kemampuan, gaya desain, proses kerja, dan pengalaman siswa. Portofolio yang baik tidak hanya menampilkan hasil akhir, tetapi juga menjelaskan konsep, tujuan, proses, tools, dan hasil desain.";

    }

    if (lower.includes("personal branding")) {

        return "Personal branding adalah cara siswa membangun citra diri sebagai desainer. Dalam DKV, personal branding dapat dilihat dari gaya karya, konsistensi visual, cara berkomunikasi, portofolio, dan sikap profesional. Personal branding membantu siswa lebih mudah dikenal dan dipercaya.";

    }

    return "Pada bagian ini, Guru AI menjelaskan bahwa " + escapeHtml(title) +
        " harus dipahami sebagai konsep sekaligus keterampilan praktik. Siswa perlu mengetahui pengertiannya, memahami fungsinya, melihat contoh penggunaannya, lalu mencoba menerapkannya dalam karya. Dalam bidang " +
        escapeHtml(major) +
        ", pemahaman seperti ini penting agar siswa tidak hanya meniru desain, tetapi mampu membuat karya yang memiliki tujuan dan pesan yang jelas.";

}


function buildImportanceText(title, major) {

    return "Materi ini penting karena membantu siswa memahami dasar pekerjaan di bidang " +
        escapeHtml(major) +
        ". Jika siswa memahami " +
        escapeHtml(title) +
        ", maka siswa akan lebih mudah membuat karya yang rapi, komunikatif, dan sesuai kebutuhan. Materi ini juga membantu siswa berpikir lebih sistematis sebelum membuat karya.";

}


function buildExampleText(title, major) {

    var lower = title.toLowerCase();

    if (lower.includes("tipografi") || lower.includes("font")) {

        return "Contohnya saat membuat poster lomba desain, judul dibuat besar dan tebal, subjudul dibuat lebih kecil, sedangkan informasi tanggal dan tempat dibuat rapi agar mudah dibaca.";

    }

    if (lower.includes("warna")) {

        return "Contohnya saat membuat desain brand makanan pedas, siswa dapat memakai warna merah dan kuning untuk memberi kesan berani, panas, dan menarik perhatian.";

    }

    if (lower.includes("logo")) {

        return "Contohnya saat membuat logo toko komputer, siswa memilih bentuk sederhana, warna profesional, dan font yang mudah dibaca agar logo bisa digunakan di spanduk, nota, stiker, dan media sosial.";

    }

    if (lower.includes("portofolio")) {

        return "Contohnya siswa membuat portofolio digital berisi desain logo, poster, feed Instagram, dan proyek branding lengkap dengan penjelasan konsep serta tools yang digunakan.";

    }

    return "Contohnya siswa dapat menerapkan materi " +
        escapeHtml(title) +
        " pada proyek desain seperti poster, logo, feed media sosial, banner, kemasan produk, presentasi, atau portofolio digital.";

}


function buildPracticeText(title, major) {

    return "Buat satu karya sederhana yang menerapkan materi " +
        escapeHtml(title) +
        ". Tentukan tujuan karya, target audiens, konsep visual, elemen yang digunakan, dan alasan pemilihan desain. Setelah selesai, siswa menjelaskan hasil karya di depan kelas atau kepada pembimbing.";

}


function buildMistakeText(title, major) {

    return "Kesalahan yang sering terjadi adalah membuat karya tanpa konsep, meniru desain tanpa memahami tujuan, menggunakan elemen terlalu banyak, tidak memperhatikan keterbacaan, warna kurang sesuai, layout berantakan, dan tidak mengevaluasi hasil desain sebelum dikumpulkan.";

}


function buildTipsText(title, major) {

    return "Biasakan membuat sketsa atau konsep terlebih dahulu sebelum membuka software desain. Perhatikan tujuan desain, audiens, kerapian, konsistensi, dan keterbacaan. Setelah selesai, lihat ulang desain dari jarak jauh atau dari layar HP untuk memastikan desain tetap jelas.";

}


// =========================================================
// OTHER TABS
// =========================================================

function renderFullSummary() {

    var materialBox = document.getElementById("materialBox");
    var chapter = getActiveGuruChapter();

    if (!materialBox || !chapter) {
        return;
    }

    var sections = getChapterSections(chapter);

    var html = `
        <h3>Ringkasan Lengkap ${escapeHtml(getChapterCode(chapter))} - ${escapeHtml(getChapterTitle(chapter))}</h3>

        <p>
            BAB ini membahas materi ${escapeHtml(getChapterTitle(chapter))}.
            Secara umum, siswa harus memahami pengertian, fungsi, contoh penerapan,
            praktik, dan kesalahan umum dari materi ini.
        </p>

        <h3>Poin Penting</h3>
        <ol>
    `;

    if (sections.length > 0) {

        sections.forEach(function (section) {

            html += `
                <li>
                    <strong>${escapeHtml(getSectionTitle(section))}</strong>:
                    ${escapeHtml(shortenText(getSectionContent(section), 180))}
                </li>
            `;

        });

    } else {

        html += `
            <li>Memahami konsep dasar materi.</li>
            <li>Mengenal fungsi dan manfaat materi.</li>
            <li>Menerapkan materi dalam praktik.</li>
            <li>Menghindari kesalahan umum.</li>
        `;

    }

    html += `
        </ol>

        <h3>Kesimpulan Guru AI</h3>
        <p>
            Materi ini perlu dipahami secara bertahap. Siswa sebaiknya tidak hanya membaca,
            tetapi juga mencoba membuat karya atau praktik agar pemahamannya lebih kuat.
        </p>
    `;

    materialBox.innerHTML = html;

}


function renderFullCaseExamples() {

    var materialBox = document.getElementById("materialBox");
    var chapter = getActiveGuruChapter();

    if (!materialBox || !chapter) {
        return;
    }

    var sections = getChapterSections(chapter);

    var html = `
        <h3>Contoh Penerapan ${escapeHtml(getChapterTitle(chapter))}</h3>

        <p>
            Berikut contoh penerapan materi ini dalam pembelajaran DKV/TKJ atau praktik kejuruan.
        </p>
    `;

    if (sections.length > 0) {

        sections.forEach(function (section, index) {

            html += `
                <div style="
                    background:#020617;
                    border:1px solid #334155;
                    border-radius:18px;
                    padding:18px;
                    margin:14px 0;
                ">
                    <h3>Contoh ${index + 1}: ${escapeHtml(getSectionTitle(section))}</h3>
                    <p>${buildExampleText(getSectionTitle(section), getActiveGuruMajor())}</p>
                </div>
            `;

        });

    } else {

        html += buildGenericExampleList(chapter);

    }

    materialBox.innerHTML = html;

}


function renderFullPracticeGuide() {

    var materialBox = document.getElementById("materialBox");
    var chapter = getActiveGuruChapter();

    if (!materialBox || !chapter) {
        return;
    }

    var html = `
        <h3>Panduan Praktik ${escapeHtml(getChapterTitle(chapter))}</h3>

        <ol>
            <li>Baca dan pahami pengertian materi.</li>
            <li>Tentukan tujuan praktik atau proyek.</li>
            <li>Buat konsep awal sebelum praktik.</li>
            <li>Siapkan alat, software, atau bahan yang dibutuhkan.</li>
            <li>Kerjakan praktik secara bertahap.</li>
            <li>Periksa hasil pekerjaan.</li>
            <li>Catat kesalahan dan perbaikan yang perlu dilakukan.</li>
            <li>Presentasikan hasil kepada pembimbing atau teman.</li>
        </ol>

        <h3>Tugas Praktik</h3>
        <p>
            Buat satu karya atau simulasi praktik berdasarkan BAB
            ${escapeHtml(getChapterTitle(chapter))}. Jelaskan konsep, proses, tools,
            hasil akhir, dan evaluasi pekerjaan.
        </p>

        <h3>Pertanyaan Refleksi</h3>
        <ol>
            <li>Apa tujuan praktik yang kamu buat?</li>
            <li>Bagian mana yang paling sulit?</li>
            <li>Kesalahan apa yang kamu temukan?</li>
            <li>Bagaimana cara memperbaikinya?</li>
            <li>Apa manfaat materi ini untuk pekerjaan nyata?</li>
        </ol>
    `;

    materialBox.innerHTML = html;

}


function renderFullCommonMistakes() {

    var materialBox = document.getElementById("materialBox");
    var chapter = getActiveGuruChapter();

    if (!materialBox || !chapter) {
        return;
    }

    var html = `
        <h3>Kesalahan Umum pada ${escapeHtml(getChapterTitle(chapter))}</h3>

        <ol>
            <li>Tidak membaca instruksi atau materi dengan teliti.</li>
            <li>Langsung praktik tanpa membuat konsep atau rencana.</li>
            <li>Hanya meniru contoh tanpa memahami alasan desain atau langkah kerja.</li>
            <li>Tidak memperhatikan kerapian dan konsistensi.</li>
            <li>Tidak mengecek ulang hasil pekerjaan.</li>
            <li>Tidak bisa menjelaskan alasan dari keputusan yang dibuat.</li>
            <li>Kurang menerima kritik atau revisi dari pembimbing.</li>
        </ol>

        <h3>Cara Menghindari Kesalahan</h3>

        <ol>
            <li>Pahami tujuan materi terlebih dahulu.</li>
            <li>Buat catatan kecil sebelum praktik.</li>
            <li>Gunakan contoh sebagai referensi, bukan untuk ditiru mentah-mentah.</li>
            <li>Lakukan evaluasi sebelum mengumpulkan tugas.</li>
            <li>Minta masukan dari pembimbing atau teman.</li>
        </ol>
    `;

    materialBox.innerHTML = html;

}


function renderFullRecommendation() {

    var materialBox = document.getElementById("materialBox");
    var chapter = getActiveGuruChapter();

    if (!materialBox || !chapter) {
        return;
    }

    var html = `
        <h3>Rekomendasi Belajar ${escapeHtml(getChapterTitle(chapter))}</h3>

        <ol>
            <li>Baca materi secara bertahap, jangan langsung loncat ke praktik.</li>
            <li>Catat istilah penting dari setiap submateri.</li>
            <li>Lihat contoh karya atau contoh kasus yang relevan.</li>
            <li>Latih praktik kecil sebelum membuat proyek besar.</li>
            <li>Bandingkan hasil pekerjaan dengan contoh profesional.</li>
            <li>Minta feedback dari pembimbing.</li>
            <li>Perbaiki hasil karya berdasarkan evaluasi.</li>
        </ol>

        <h3>Rekomendasi Tugas</h3>

        <p>
            Siswa membuat satu proyek kecil berdasarkan materi BAB ini.
            Hasil tugas harus memiliki konsep, proses pengerjaan, hasil akhir,
            dan penjelasan singkat.
        </p>
    `;

    materialBox.innerHTML = html;

}


// =========================================================
// FULL SPEECH PARTS
// =========================================================

function buildFullSpeechParts() {

    var chapter = getActiveGuruChapter();

    if (!chapter) {
        return [
            "Silakan pilih materi terlebih dahulu."
        ];
    }

    var major = getActiveGuruMajor();
    var sections = getChapterSections(chapter);

    var parts = [];

    parts.push(
        "Baik, sekarang Guru AI akan menjelaskan " +
        getChapterCode(chapter) +
        ", yaitu " +
        getChapterTitle(chapter) +
        ", untuk jurusan " +
        major +
        "."
    );

    parts.push(
        "Pada materi ini, siswa akan mempelajari pengertian, fungsi, contoh penerapan, praktik, kesalahan umum, dan rangkuman materi."
    );

    if (sections.length > 0) {

        sections.forEach(function (section, index) {

            var title = getSectionTitle(section);
            var content = getSectionContent(section);

            parts.push(
                "Submateri " +
                (index + 1) +
                ". " +
                title +
                ". " +
                stripHtmlText(buildDefinitionText(title, content, major))
            );

            if (content) {
                parts.push(
                    "Materi inti. " +
                    stripHtmlText(content)
                );
            }

            parts.push(
                "Penjelasan Guru AI. " +
                stripHtmlText(buildTeacherExplanation(title, content, major))
            );

            parts.push(
                "Contoh penerapan. " +
                stripHtmlText(buildExampleText(title, major))
            );

            parts.push(
                "Praktik siswa. " +
                stripHtmlText(buildPracticeText(title, major))
            );

        });

    } else {

        parts.push(
            "Data submateri belum lengkap di modul. Guru AI akan menjelaskan berdasarkan judul BAB."
        );

        parts.push(
            stripHtmlText(buildGenericChapterExplanation(chapter, major))
        );

    }

    parts.push(
        "Kesimpulannya, materi " +
        getChapterTitle(chapter) +
        " harus dipahami melalui teori dan praktik. Siswa perlu mencoba membuat tugas, mengevaluasi hasil, dan memperbaiki kesalahan."
    );

    parts.push(
        "Setelah penjelasan ini, silakan siswa bertanya jika ada bagian yang belum dipahami."
    );

    return parts;

}


// =========================================================
// GENERIC FALLBACK
// =========================================================

function buildGenericChapterExplanation(chapter, major) {

    return `
        <p>
            Materi ${escapeHtml(getChapterTitle(chapter))} membahas konsep penting yang berkaitan
            dengan kompetensi ${escapeHtml(major)}. Siswa harus memahami pengertian, fungsi,
            manfaat, langkah penerapan, contoh nyata, dan kesalahan yang perlu dihindari.
        </p>

        <p>
            Dalam praktik, siswa perlu memulai dari memahami tujuan, melihat contoh,
            membuat rencana kerja, melakukan praktik, lalu mengevaluasi hasil. Cara belajar
            seperti ini membuat siswa tidak hanya hafal teori, tetapi juga mampu menerapkannya.
        </p>
    `;

}


function buildGenericExampleList(chapter) {

    return `
        <ol>
            <li>Membuat karya atau simulasi berdasarkan materi ${escapeHtml(getChapterTitle(chapter))}.</li>
            <li>Menjelaskan alasan pemilihan elemen atau langkah kerja.</li>
            <li>Mempresentasikan hasil pekerjaan kepada pembimbing.</li>
            <li>Menerima masukan dan melakukan revisi.</li>
        </ol>
    `;

}


// =========================================================
// HELPER DATA
// =========================================================

function getActiveGuruChapter() {

    if (typeof currentChapter !== "undefined" && currentChapter) {
        return currentChapter;
    }

    if (window.currentChapter) {
        return window.currentChapter;
    }

    return null;

}


function getActiveGuruMajor() {

    if (typeof currentMajor !== "undefined" && currentMajor) {
        return currentMajor;
    }

    if (window.currentMajor) {
        return window.currentMajor;
    }

    var select = document.getElementById("majorSelect");

    if (select && select.value) {
        return select.value;
    }

    return "DKV";

}


function getChapterSections(chapter) {

    if (!chapter) {
        return [];
    }

    if (Array.isArray(chapter.sections)) {
        return chapter.sections;
    }

    if (Array.isArray(chapter.materi)) {
        return chapter.materi;
    }

    if (Array.isArray(chapter.sub_materi)) {
        return chapter.sub_materi;
    }

    return [];

}


function getChapterCode(chapter) {

    return String(
        chapter.code ||
        chapter.kode ||
        ("BAB " + (chapter.chapter || chapter.number || ""))
    );

}


function getChapterTitle(chapter) {

    return String(
        chapter.title ||
        chapter.judul ||
        chapter.name ||
        "Materi"
    );

}


function getSectionTitle(section) {

    return String(
        section.title ||
        section.judul ||
        section.name ||
        section.sub_title ||
        "Submateri"
    );

}


function getSectionContent(section) {

    return String(
        section.content ||
        section.materi ||
        section.description ||
        section.isi ||
        section.text ||
        section.body ||
        ""
    ).trim();

}


// =========================================================
// HELPER TEXT
// =========================================================

function escapeHtml(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function stripHtmlText(text) {

    return String(text || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


function shortenText(text, maxLength) {

    var clean = stripHtmlText(text);

    if (!clean) {
        return "Materi ini perlu dipahami melalui pengertian, contoh, praktik, dan evaluasi.";
    }

    if (clean.length <= maxLength) {
        return clean;
    }

    return clean.substring(0, maxLength) + "...";

}