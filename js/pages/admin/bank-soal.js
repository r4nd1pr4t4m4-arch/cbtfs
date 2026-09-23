/**
 * bank-soal.js — Bank Soal (Question Bank)
 * renderQuestionBank() + all question bank helpers
 * Sumber: index.html L20548-24440
 */

function renderQuestionBank(container) {
  let examOptions = (cachedExams || []).map(e => {
    const subj = String(e.subject || '').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    const cls  = String(e.class || '').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    return `<option value="${e.id}">${subj} (${cls})</option>`;
  }).join('');

  if (allImagesData.length === 0) {
    google.script.run.withSuccessHandler(imgs => {
      allImagesData = imgs || [];
    }).getSavedImages();
  }

  container.innerHTML = `
    <div class="fade-in w-full space-y-4">

      <!-- ═══ HEADER TOOLBAR ═══ -->
      <div class="qb-toolbar">
        <!-- Baris 1: judul + tombol aksi -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div class="flex items-center gap-3 min-w-0">
            <div class="qb-toolbar-title-icon flex-shrink-0">
              <i class="fas fa-book-open"></i>
            </div>
            <div class="min-w-0">
              <h2 class="qb-toolbar-title">Bank Soal</h2>
              <p class="text-xs text-slate-400 mt-0.5 font-medium">Kelola pertanyaan, bobot, dan kunci jawaban ujian</p>
            </div>
          </div>

          <!-- Tombol-tombol input soal — dibungkus overflow-x agar tidak menyebabkan layout break di mobile kecil -->
          <div class="flex gap-2 flex-wrap sm:flex-nowrap justify-start sm:justify-end flex-shrink-0">
            <button onclick="_qbShowForm('manual')"
              class="qb-action-btn bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              title="Tambah soal manual">
              <i class="fas fa-plus"></i>
              <span>Manual</span>
            </button>

            <button onclick="_qbShowForm('gform')"
              class="qb-action-btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              title="Import dari Google Form">
              <i class="fab fa-google"></i>
              <span class="hidden sm:inline">G-Form</span>
            </button>

            <button onclick="_qbShowForm('excel')"
              class="qb-action-btn bg-green-700 hover:bg-green-800 text-white shadow-md"
              title="Import dari Excel">
              <i class="fas fa-file-excel"></i>
              <span class="hidden sm:inline">Excel</span>
            </button>

            <button onclick="_qbShowForm('copy')"
              class="qb-action-btn bg-sky-600 hover:bg-sky-700 text-white shadow-md"
              title="Salin soal dari ujian lain">
              <i class="fas fa-copy"></i>
              <span class="hidden sm:inline">Salin</span>
            </button>

            <button onclick="_qbShowForm('batch')"
              class="qb-action-btn bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              title="Input batch massal">
              <i class="fas fa-layer-group"></i>
              <span class="hidden sm:inline">Batch</span>
            </button>
          </div>
        </div>

        <!-- Baris 2: Dropdown pilih mata pelajaran -->
        <div>
          <label class="qb-field-label mb-2 block">
            <i class="fas fa-graduation-cap mr-1 text-blue-400"></i>
            Pilih Mata Pelajaran / Ujian
          </label>
          <div class="qb-exam-select-wrap">
            <i class="fas fa-chevron-down qb-select-icon" style="left:auto;right:14px;font-size:11px;"></i>
            <i class="fas fa-book qb-select-icon"></i>
            <select id="select-exam-q"
              class="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm font-medium
                     text-slate-700 bg-slate-50 outline-none appearance-none cursor-pointer
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition shadow-sm"
              onchange="loadQuestionsTable(this.value)">
              <option value="">— Pilih Mata Pelajaran —</option>
              ${examOptions}
            </select>
          </div>
        </div>
      </div>

      <!-- ═══ FORM PANELS (hidden by default) ═══ -->

      <div id="form-import-q" class="hidden dash-card p-6 bg-emerald-50 border-emerald-100 fade-in">
            <div class="flex items-center justify-between mb-4 border-b border-emerald-200 pb-3">
                <div class="flex items-center gap-3 text-emerald-800">
                    <div class="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm"><i class="fab fa-google text-lg"></i></div>
                    <h3 class="font-bold text-lg">Import dari Google Form</h3>
                </div>
                <button onclick="document.getElementById('form-import-q').classList.add('hidden')" class="text-emerald-600 hover:bg-emerald-100 p-2 rounded-full transition"><i class="fas fa-times"></i></button>
            </div>
            <div class="bg-white/60 p-4 rounded-xl border border-emerald-100 mb-4 text-sm text-emerald-700 flex items-start gap-3">
              <i class="fas fa-info-circle mt-0.5 text-lg"></i>
              <div>
                  <p class="font-bold">Panduan Import:</p>
                  <ul class="list-disc list-inside mt-1 space-y-1 text-xs">
                      <li>Pastikan Anda adalah <b>Pemilik (Owner)</b> formulir.</li>
                      <li>Salin link dari address bar saat membuka mode edit (akhiran <b>/edit</b>).</li>
                      <li>Fitur ini mendukung: Pilihan Ganda & Isian Singkat.</li>
                  </ul>
              </div>
            </div>
            
            <div class="flex flex-col md:flex-row gap-4">
              <div class="relative flex-1 group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-500"><i class="fas fa-link"></i></div>
                  <input type="text" id="input-form-url" placeholder="Tempel Link Google Form di sini..." class="pl-10 w-full border border-emerald-200 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white transition shadow-sm">
              </div>
              <button onclick="triggerImport()" class="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg flex items-center justify-center gap-2 transform active:scale-95 whitespace-nowrap">
                  <i class="fas fa-file-import"></i> Mulai Import
              </button>
            </div>
        </div>

        <div id="form-import-excel" class="hidden dash-card p-6 bg-green-50 border-green-200 fade-in">
            <div class="flex items-center justify-between mb-4 border-b border-green-200 pb-3">
                <div class="flex items-center gap-3 text-green-800">
                    <div class="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center text-green-700 shadow-sm"><i class="fas fa-file-excel text-lg"></i></div>
                    <h3 class="font-bold text-lg">Import Soal dari Excel</h3>
                </div>
                <button onclick="document.getElementById('form-import-excel').classList.add('hidden')" class="text-green-600 hover:bg-green-100 p-2 rounded-full transition"><i class="fas fa-times"></i></button>
            </div>
            
            <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-1 space-y-4">
                    <div class="bg-white p-4 rounded-xl border border-green-200 text-sm text-slate-600">
                        <p class="font-bold text-green-700 mb-2"><i class="fas fa-info-circle"></i> Aturan Format Excel:</p>
                        <ul class="list-disc list-inside space-y-1 text-xs">
                            <li>Template memiliki <b>4 sheet</b> terpisah per tipe soal.</li>
                            <li>Baris pertama = <b>Header</b>. Data dimulai baris ke-2.</li>
                            <li><b>PG & PG_Kompleks:</b> Tipe | Pertanyaan | Opsi A-E | Kunci | Bobot | Wajib</li>
                            <li><b>Benar/Salah:</b> Tipe | Pertanyaan | Pernyataan+Kunci (maks 5 pasang) | Bobot | Wajib</li>
                            <li><b>Menjodohkan:</b> Tipe | Pertanyaan | Kiri+Kanan (maks 5 pasang) | Pengecoh | Bobot | Wajib</li>
                            <li><b>Esai:</b> Tipe | Pertanyaan | Kunci (opsional) | Bobot | Wajib</li>
                            <li>Kunci PG: huruf (A/B/C/D/E). PG Kompleks: "A, C, E".</li>
                            <li>Jumlah opsi PG/PG Kompleks otomatis menyesuaikan <b>batas opsi</b> yang Admin atur (mis. A-D).</li>
                            <li>Parser memakai <b>nama header</b>, jadi urutan kolom boleh berubah selama nama header tetap.</li>
                            <li>Sistem membaca <b>semua sheet</b> dalam file sekaligus.</li>
                        </ul>
                        <button onclick="downloadTemplateExcel()" class="mt-3 text-xs font-bold text-blue-600 hover:underline"><i class="fas fa-download"></i> Download Template Excel</button>
                    </div>
                </div>

                <div class="flex-1 flex flex-col justify-center">
                    <label class="block mb-2 text-sm font-bold text-slate-600">Upload File (.xlsx)</label>
                    <input type="file" id="input-excel-file" accept=".xlsx, .xls" class="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-100 file:text-green-700
                      hover:file:bg-green-200
                      cursor-pointer border border-green-200 rounded-xl bg-white p-2
                    "/>
                    <button onclick="processExcelImport()" class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95">
                        <i class="fas fa-upload"></i> Proses Import
                    </button>
                </div>
            </div>
        </div>

        <div id="form-copy-q" class="hidden dash-card p-6 bg-sky-50 border-sky-200 fade-in">
            <div class="flex items-center justify-between mb-4 border-b border-sky-200 pb-3">
                <div class="flex items-center gap-3 text-sky-800">
                    <div class="w-10 h-10 rounded-lg bg-sky-200 flex items-center justify-center text-sky-700 shadow-sm"><i class="fas fa-copy text-lg"></i></div>
                    <h3 class="font-bold text-lg">Salin Soal Antar Jadwal Ujian</h3>
                </div>
                <button onclick="document.getElementById('form-copy-q').classList.add('hidden')" class="text-sky-600 hover:bg-sky-100 p-2 rounded-full transition"><i class="fas fa-times"></i></button>
            </div>
            
             <div class="bg-white/60 p-4 rounded-xl border border-sky-100 mb-4 text-sm text-sky-700 flex items-start gap-3">
              <i class="fas fa-info-circle mt-0.5 text-lg"></i>
              <div>
                  <p class="font-bold">Cara Penggunaan:</p>
                  <ul class="list-disc list-inside mt-1 space-y-1 text-xs">
                      <li>Pilih jadwal ujian <b>sumber</b> (soal akan disalin dari sini).</li>
                      <li>Pilih jadwal ujian <b>tujuan</b> (soal akan ditempelkan ke sini).</li>
                      <li>Semua soal dari sumber akan diduplikasi ke tujuan.</li>
                  </ul>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">1. Salin Dari Mapel (Sumber)</label>
                  <select id="copy-source-exam" class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white text-slate-700"></select>
              </div>
              <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-1">2. Tempel Ke Mapel (Tujuan)</label>
                  <select id="copy-destination-exam" class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white text-slate-700"></select>
              </div>
            </div>
             <div class="mt-4">
                 <button onclick="handleCopyQuestions()" class="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95">
                     <i class="fas fa-clone"></i> Mulai Proses Penyalinan
                 </button>
             </div>
        </div>

      <style id="batch-multi-tipe-styles">
        /* Container default — kelonggaran teme purple lembut, agar kartu summary kontras */
        #form-batch-q.batch-form-shell {
          border-color: #ddd6fe;
          background: linear-gradient(180deg, #ffffff 0%, #faf5ff 100%);
        }
        /* Sticky action bar respect notch / gesture nav */
        #batch-action-bar {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
          backdrop-filter: saturate(120%) blur(6px);
          -webkit-backdrop-filter: saturate(120%) blur(6px);
        }
        /* Progress bar tipis di tepi atas action bar */
        #batch-progress-bar {
          height: 2px;
          background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%);
          width: 0%;
          transition: width 200ms ease-out;
        }
        /* xs (< 360px) — padding lebih ramping, judul sub disembunyikan */
        @media (max-width: 359px) {
          #form-batch-q.batch-form-shell { padding: 12px; }
          #form-batch-q .batch-header-subtitle { display: none; }
          #form-batch-q .batch-action-label { display: none; }
          #batch-textarea-wrapper textarea { min-height: 280px; }
        }
        /* sm 360–639 — tetap stacked, padding 12px */
        @media (min-width: 360px) and (max-width: 639px) {
          #form-batch-q.batch-form-shell { padding: 12px; }
          #form-batch-q .batch-header-subtitle { display: none; }
          #batch-textarea-wrapper textarea { min-height: 280px; }
        }
        /* md 640–767 — single col, drawer panduan & summary */
        @media (min-width: 640px) and (max-width: 767px) {
          #form-batch-q.batch-form-shell { padding: 16px; }
          #batch-textarea-wrapper textarea { min-height: 320px; }
        }
        /* lg 768–1023 — 2 kolom (textarea + summary) */
        @media (min-width: 768px) and (max-width: 1023px) {
          #form-batch-q.batch-form-shell { padding: 20px; }
          #batch-textarea-wrapper textarea { min-height: 360px; }
        }
        /* xl 1024–1279 — 3 kolom 25 / 50 / 25 */
        @media (min-width: 1024px) and (max-width: 1279px) {
          #form-batch-q.batch-form-shell { padding: 24px; }
          #batch-textarea-wrapper textarea { min-height: 420px; }
        }
        /* 2xl 1280–1535 — 3 kolom 28 / 44 / 28 */
        @media (min-width: 1280px) and (max-width: 1535px) {
          #form-batch-q.batch-form-shell { padding: 28px; }
          #batch-textarea-wrapper textarea { min-height: 480px; }
        }
        /* 3xl ≥ 1536 — 3 kolom 32 / 36 / 32 dalam container 1600px ter-center */
        @media (min-width: 1536px) {
          #form-batch-q.batch-form-shell {
            padding: 28px;
            max-width: 1600px;
            margin-left: auto;
            margin-right: auto;
          }
          #batch-grid-area {
            grid-template-columns: 32% 36% 32% !important;
          }
          #batch-textarea-wrapper textarea { min-height: 520px; }
        }
        /* Hover hanya di pointer presisi */
        @media (hover: hover) and (pointer: fine) {
          #form-batch-q .batch-action-btn:hover { transform: translateY(-1px); }
        }
        /* Tap highlight off + transisi pendek saat ditekan */
        #form-batch-q .batch-action-btn,
        #form-batch-q [role="button"],
        #form-batch-q button {
          -webkit-tap-highlight-color: transparent;
          transition: background-color 120ms, transform 120ms, box-shadow 120ms;
        }
        /* Akordeon <details> styling minimal — Task 5.2 akan refine */
        #form-batch-q details.batch-collapse > summary {
          cursor: pointer;
          list-style: none;
          user-select: none;
        }
        #form-batch-q details.batch-collapse > summary::-webkit-details-marker { display: none; }

        /* ===== Task 5.2 — Tabbed Format Guide ===== */
        .batch-format-tab {
          padding: 6px 10px;
          border-bottom: 2px solid transparent;
          color: #64748b;             /* slate-500 */
          font-weight: 600;
          font-size: 12px;
          border-radius: 6px 6px 0 0;
        }
        .batch-format-tab[aria-selected="true"] {
          color: var(--bsfg-color, #2563eb);
          border-bottom-color: var(--bsfg-color, #2563eb);
          background-color: var(--bsfg-soft, #dbeafe);
        }
        .batch-format-tab:focus { outline: 2px solid #a78bfa; outline-offset: 2px; }
        .batch-format-example {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 11px;
          line-height: 1.55;
          white-space: pre-wrap;
          overflow-x: auto;
        }
        .batch-format-rules {
          background: #faf5ff;
          border: 1px solid #ede9fe;
          border-radius: 8px;
          padding: 10px;
          margin-top: 10px;
          font-size: 11.5px;
          color: #4c1d95;
        }
        .batch-format-action-btn {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
        }
        .batch-format-action-btn:hover { background: #f1f5f9; }
        .batch-format-toast {
          font-size: 11px;
          color: #15803d;
          margin-left: 6px;
          opacity: 0;
          transition: opacity 200ms;
        }
        .batch-format-toast.show { opacity: 1; }
        /* Mobile accordion items per tipe */
        #form-batch-q .batch-format-mobile-item {
          border: 1px solid #ede9fe;
          border-radius: 8px;
          background: #ffffff;
        }
        #form-batch-q .batch-format-mobile-item > summary.batch-format-mobile-summary {
          list-style: none;
          cursor: pointer;
          user-select: none;
          padding: 8px 12px;
          font-weight: 600;
          font-size: 12px;
          color: #4c1d95;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        #form-batch-q .batch-format-mobile-item > summary.batch-format-mobile-summary::-webkit-details-marker { display: none; }
        #form-batch-q .batch-format-mobile-item > .batch-format-mobile-body {
          padding: 8px 12px 12px;
          border-top: 1px solid #ede9fe;
        }

        /* ===== Smart Textarea (Task 5.3) ===== */
        .batch-toolbar-btn {
          font-size: 11px;
          padding: 6px 8px;
          border-radius: 6px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          min-height: 36px;
          cursor: pointer;
          transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
        }
        .batch-toolbar-btn:hover { background: #f1f5f9; }
        .batch-toolbar-btn:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
        .batch-toolbar-btn-danger { color: #b91c1c; }
        .batch-toolbar-btn-danger:hover { background: #fee2e2; }

        #batch-toolbar-insert-menu li {
          display: block;
        }
        #batch-toolbar-insert-menu button {
          width: 100%;
          text-align: left;
          padding: 6px 8px;
          background: transparent;
          border: 0;
          font-size: 11px;
          color: #334155;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        #batch-toolbar-insert-menu button:hover { background: #f3e8ff; color: #6d28d9; }
        #batch-toolbar-insert-menu button:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
        #batch-toolbar-insert-menu .bsm-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          flex: 0 0 8px;
        }

        .batch-editor {
          display: grid;
          grid-template-columns: 48px 1fr;
          background: #ffffff;
          border: 2px solid #ddd6fe;
          border-radius: 12px;
          overflow: hidden;
          /* Cegah mobile (iOS/Android) menggelembungkan ukuran teks secara
             otomatis dengan faktor berbeda antara kolom nomor (sempit) dan
             textarea (lebar) — penyebab nomor baris tidak sejajar di mobile. */
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        .batch-editor:focus-within { border-color: #7c3aed; }
        .batch-gutter {
          margin: 0;
          padding: 16px 6px 16px 12px;
          background: #faf5ff;
          border-right: 1px solid #ede9fe;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 13px;
          line-height: 19.5px;
          color: #94a3b8;
          white-space: pre;
          text-align: right;
          user-select: none;
          overflow: hidden;
          align-self: stretch;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        .batch-gutter .gutter-scroll {
          display: block;
          will-change: transform;
        }
        .batch-gutter .gutter-line {
          display: block;
          height: 19.5px;
          min-height: 19.5px;
          line-height: 19.5px;
        }
        .batch-gutter .gutter-badge {
          display: inline-block;
          margin-right: 4px;
          padding: 0 5px;
          font-size: 9px;
          line-height: 14px;
          border-radius: 4px;
          font-weight: 700;
          vertical-align: middle;
          letter-spacing: 0.02em;
        }
        #batch-editor textarea#batch-input-text {
          border: none !important;
          border-radius: 0 !important;
          width: 100%;
          resize: vertical;
          outline: none !important;
          padding: 16px 12px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 13px;
          line-height: 19.5px;
          box-shadow: none !important;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }
        .batch-counter-warning { color: #d97706 !important; font-weight: 600; }
        .batch-counter-danger { color: #b91c1c !important; font-weight: 700; }
        #batch-input-toast { position: absolute; right: 8px; bottom: 8px; }

        /* ===== Live Summary Panel (Task 5.4) ===== */
        /* Status pill */
        .batch-summary-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.02em;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .batch-summary-pill-idle    { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
        .batch-summary-pill-parsing { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
        .batch-summary-pill-valid   { background: #dcfce7; color: #15803d; border-color: #bbf7d0; }
        .batch-summary-pill-partial { background: #fef3c7; color: #b45309; border-color: #fde68a; }
        .batch-summary-pill-error   { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
        .batch-summary-pill-parsing .fa-circle-notch,
        .batch-summary-pill-parsing .fa-spinner {
          animation: bsm-spin 0.9s linear infinite;
        }
        @keyframes bsm-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* Counter cards */
        .batch-summary-counter {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px 4px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: #f8fafc;
          line-height: 1.1;
          min-height: 56px;
        }
        .batch-summary-counter .num {
          font-size: 22px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .batch-summary-counter .lbl {
          margin-top: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          opacity: 0.8;
        }
        .batch-counter-valid   { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
        .batch-counter-invalid { background: #fff1f2; border-color: #fecdd3; color: #be123c; }
        .batch-counter-total   { background: #f1f5f9; border-color: #cbd5e1; color: #334155; }

        /* Lists Soal_Valid / Soal_Invalid */
        .batch-summary-list {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 8px;
          background: #ffffff;
          overflow: hidden;
        }
        .batch-summary-list-summary {
          list-style: none;
          cursor: pointer;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 10px;
          font-weight: 700;
          font-size: 12px;
          background: #f8fafc;
          border-bottom: 1px solid transparent;
        }
        .batch-summary-list-summary::-webkit-details-marker { display: none; }
        .batch-summary-list-summary::before {
          content: '\f054'; /* fa-chevron-right */
          font-family: 'Font Awesome 6 Free', 'Font Awesome 5 Free', FontAwesome;
          font-weight: 900;
          font-size: 9px;
          opacity: 0.5;
          margin-right: 4px;
          transition: transform 150ms ease;
          display: inline-block;
        }
        .batch-summary-list[open] > .batch-summary-list-summary::before {
          transform: rotate(90deg);
        }
        .batch-summary-list[open] > .batch-summary-list-summary {
          border-bottom-color: #e2e8f0;
        }
        .batch-summary-list-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 18px;
          padding: 0 6px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 800;
          background: #ffffff;
          border: 1px solid currentColor;
        }
        .batch-summary-list-body {
          margin: 0;
          padding: 0;
          list-style: none;
          max-height: 280px;
          overflow-y: auto;
        }
        .batch-summary-list-body li {
          padding: 8px 10px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 11.5px;
          color: #334155;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .batch-summary-list-body li:last-child { border-bottom: 0; }
        .batch-summary-list-body li:hover { background: #faf5ff; }
        .batch-summary-list-body li.empty {
          color: #94a3b8;
          font-style: italic;
          text-align: center;
          justify-content: center;
        }
        .batch-summary-row-head {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .batch-summary-row-head-left {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          min-width: 0;
          flex: 1 1 auto;
        }
        .batch-summary-snippet {
          color: #475569;
          font-size: 11px;
          flex: 1 1 100%;
        }
        .batch-summary-errors {
          margin: 2px 0 0;
          padding-left: 18px;
          color: #b91c1c;
          font-size: 11px;
          line-height: 1.45;
        }
        .batch-summary-errors li {
          padding: 0;
          border: 0;
          background: transparent;
          display: list-item;
          list-style: disc;
          color: #b91c1c;
        }
        .batch-summary-block-num {
          font-weight: 700;
          color: #6d28d9;
          font-size: 11px;
        }
        .batch-summary-type-badge {
          display: inline-flex;
          align-items: center;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.02em;
          line-height: 1.4;
          border: 1px solid transparent;
        }
        .batch-summary-type-badge-unknown {
          background: #f1f5f9;
          color: #64748b;
          border-color: #cbd5e1;
        }
        .batch-summary-meta-tag {
          display: inline-flex;
          align-items: center;
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 9.5px;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .batch-summary-meta-tag.req {
          background: #fef3c7;
          color: #92400e;
          border-color: #fde68a;
        }
        .batch-summary-jump-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 6px;
          background: #f5f3ff;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
          cursor: pointer;
          transition: background-color 120ms, color 120ms;
        }
        .batch-summary-jump-btn:hover {
          background: #6d28d9;
          color: #ffffff;
          border-color: #6d28d9;
        }
        .batch-summary-jump-btn:focus-visible {
          outline: 2px solid #7c3aed;
          outline-offset: 1px;
        }
        /* Konfigurasi Ujian */
        #batch-summary-config-body .batch-cfg-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        #batch-summary-config-body .batch-cfg-disabled {
          background: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fecaca;
          border-radius: 4px;
          padding: 0 5px;
          font-size: 10px;
          font-weight: 700;
        }
        #batch-summary-config-body .batch-cfg-quota-warn { color: #b45309; font-weight: 700; }
        #batch-summary-config-body .batch-cfg-quota-full { color: #b91c1c; font-weight: 800; }

        /* Donut legend swatch */
        #batch-summary-legend li {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        #batch-summary-legend .bsl-swatch {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          flex: 0 0 10px;
          display: inline-block;
        }
        #batch-summary-legend .bsl-name { color: #334155; flex: 1; }
        #batch-summary-legend .bsl-count {
          font-variant-numeric: tabular-nums;
          color: #64748b;
          font-weight: 600;
        }

        /* Highlight effect untuk "Lompat ke baris" */
        #batch-editor.batch-textarea-highlight {
          animation: bsm-textarea-glow 3s ease-out;
        }
        @keyframes bsm-textarea-glow {
          0%   { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); border-color: #ddd6fe; }
          15%  { box-shadow: 0 0 0 6px rgba(250, 204, 21, 0.55); border-color: #facc15; }
          70%  { box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.25); border-color: #fde047; }
          100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); border-color: #ddd6fe; }
        }

        @media (prefers-reduced-motion: reduce) {
          .batch-summary-pill-parsing .fa-circle-notch,
          .batch-summary-pill-parsing .fa-spinner { animation: none; }
          #batch-editor.batch-textarea-highlight { animation: none; box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.5); }
        }
      </style>

      <div id="form-batch-q"
           class="hidden dash-card fade-in batch-form-shell p-4 md:p-5 lg:p-6"
           data-role-required="Admin,Guru"
           role="region"
           aria-label="Formulir Input Soal Batch Multi-Tipe">

        <!-- ===== Header ===== -->
        <header class="flex items-start justify-between gap-3 mb-4 border-b border-purple-200 pb-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 shrink-0 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 shadow-sm">
              <i class="fas fa-layer-group text-lg"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-bold text-lg text-purple-900 truncate">Input Soal Batch (Multi-Tipe)</h3>
                <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                  <i class="fas fa-flask text-[9px]"></i> Beta · Multi-Tipe
                </span>
              </div>
              <p class="text-xs text-purple-500 batch-header-subtitle">Tempel banyak soal sekaligus untuk 5 tipe yang didukung</p>
            </div>
          </div>
          <button type="button"
            onclick="document.getElementById('form-batch-q').classList.add('hidden')"
            class="text-purple-400 hover:text-purple-700 hover:bg-purple-100 p-2 rounded-full transition shrink-0"
            aria-label="Tutup formulir batch">
            <i class="fas fa-times"></i>
          </button>
        </header>

        <div id="batch-grid-area"
             class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[1fr_22rem] xl:grid-cols-[25%_50%_25%] 2xl:grid-cols-[28%_44%_28%] gap-4 mb-4">

          <aside id="batch-format-guide"
                 class="hidden lg:block bg-white border border-purple-100 rounded-xl p-4 text-sm order-1 lg:order-1"
                 aria-label="Panduan format soal batch"
                 role="complementary">
            <h4 class="font-bold text-purple-800 mb-3 flex items-center justify-between gap-2">
              <span class="flex items-center gap-2"><i class="fas fa-book"></i> Panduan Format</span>
              <button id="batch-rules-toggle" type="button" class="text-xs font-medium text-purple-600 hover:underline">
                Tampilkan Aturan Lengkap
              </button>
            </h4>
            <div role="tablist" aria-label="Pilih tipe panduan format" class="flex flex-wrap gap-1 mb-3 border-b border-slate-200">
              <button role="tab" aria-selected="true"  data-batch-tab="PG"           class="batch-format-tab" id="batch-tab-PG" tabindex="0">PG</button>
              <button role="tab" aria-selected="false" data-batch-tab="PG_KOMPLEKS"  class="batch-format-tab" id="batch-tab-PG_KOMPLEKS" tabindex="-1">PG Kompleks</button>
              <button role="tab" aria-selected="false" data-batch-tab="BS"           class="batch-format-tab" id="batch-tab-BS" tabindex="-1">Benar/Salah</button>
              <button role="tab" aria-selected="false" data-batch-tab="JODOH"        class="batch-format-tab" id="batch-tab-JODOH" tabindex="-1">Menjodohkan</button>
              <button role="tab" aria-selected="false" data-batch-tab="Esai"         class="batch-format-tab" id="batch-tab-Esai" tabindex="-1">Esai</button>
              <button role="tab" aria-selected="false" data-batch-tab="PG_LEGACY"    class="batch-format-tab" id="batch-tab-PG_LEGACY" tabindex="-1">PG Lama</button>
            </div>
            <div id="batch-format-panels">
              <div role="tabpanel" data-batch-panel="PG"           aria-labelledby="batch-tab-PG"></div>
              <div role="tabpanel" data-batch-panel="PG_KOMPLEKS"  aria-labelledby="batch-tab-PG_KOMPLEKS" class="hidden"></div>
              <div role="tabpanel" data-batch-panel="BS"           aria-labelledby="batch-tab-BS" class="hidden"></div>
              <div role="tabpanel" data-batch-panel="JODOH"        aria-labelledby="batch-tab-JODOH" class="hidden"></div>
              <div role="tabpanel" data-batch-panel="Esai"         aria-labelledby="batch-tab-Esai" class="hidden"></div>
              <div role="tabpanel" data-batch-panel="PG_LEGACY"    aria-labelledby="batch-tab-PG_LEGACY" class="hidden"></div>
            </div>
          </aside>

          <details class="batch-collapse lg:hidden bg-white border border-purple-100 rounded-xl text-sm order-1"
                   aria-label="Panduan format soal batch (mobile)">
            <summary class="flex items-center justify-between gap-2 px-4 py-3 font-bold text-purple-800">
              <span class="flex items-center gap-2"><i class="fas fa-book"></i> Panduan Format</span>
              <i class="fas fa-chevron-down text-xs text-purple-500"></i>
            </summary>
            <div id="batch-format-mobile" class="px-4 pb-4 border-t border-purple-100 pt-3 space-y-2">
              <details class="batch-format-mobile-item" data-batch-mobile="PG">
                <summary class="batch-format-mobile-summary"><span>PG</span><i class="fas fa-chevron-down text-xs text-slate-400"></i></summary>
                <div class="batch-format-mobile-body"></div>
              </details>
              <details class="batch-format-mobile-item" data-batch-mobile="PG_KOMPLEKS">
                <summary class="batch-format-mobile-summary"><span>PG Kompleks</span><i class="fas fa-chevron-down text-xs text-slate-400"></i></summary>
                <div class="batch-format-mobile-body"></div>
              </details>
              <details class="batch-format-mobile-item" data-batch-mobile="BS">
                <summary class="batch-format-mobile-summary"><span>Benar/Salah</span><i class="fas fa-chevron-down text-xs text-slate-400"></i></summary>
                <div class="batch-format-mobile-body"></div>
              </details>
              <details class="batch-format-mobile-item" data-batch-mobile="JODOH">
                <summary class="batch-format-mobile-summary"><span>Menjodohkan</span><i class="fas fa-chevron-down text-xs text-slate-400"></i></summary>
                <div class="batch-format-mobile-body"></div>
              </details>
              <details class="batch-format-mobile-item" data-batch-mobile="Esai">
                <summary class="batch-format-mobile-summary"><span>Esai</span><i class="fas fa-chevron-down text-xs text-slate-400"></i></summary>
                <div class="batch-format-mobile-body"></div>
              </details>
              <details class="batch-format-mobile-item" data-batch-mobile="PG_LEGACY">
                <summary class="batch-format-mobile-summary"><span>PG Lama</span><i class="fas fa-chevron-down text-xs text-slate-400"></i></summary>
                <div class="batch-format-mobile-body"></div>
              </details>
            </div>
          </details>

          <section id="batch-textarea-wrapper"
                   class="bg-white border border-purple-100 rounded-xl p-4 order-2 xl:order-2"
                   aria-label="Area input soal batch">
            <header class="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label for="batch-input-text" class="text-xs font-bold text-purple-700 uppercase">
                <i class="fas fa-paste mr-1"></i> Tempel Soal Di Sini
              </label>
              <div class="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Toolbar editor batch">
                <div class="relative" id="batch-toolbar-insert-wrap">
                  <button type="button" id="batch-toolbar-insert" class="batch-toolbar-btn"
                          aria-haspopup="true" aria-expanded="false" aria-controls="batch-toolbar-insert-menu">
                    <i class="fas fa-paste"></i>
                    <span class="hidden md:inline">Sisipkan Template</span>
                    <i class="fas fa-caret-down ml-1"></i>
                  </button>
                  <ul id="batch-toolbar-insert-menu" role="menu" aria-labelledby="batch-toolbar-insert"
                      class="hidden absolute right-0 mt-1 z-20 min-w-[170px] bg-white border border-slate-200 rounded-md shadow-lg p-1 text-xs"></ul>
                </div>
                <button type="button" id="batch-toolbar-paste" class="batch-toolbar-btn"
                        aria-label="Pasang teks dari clipboard">
                  <i class="fas fa-clipboard"></i>
                  <span class="hidden md:inline">Pasang dari Clipboard</span>
                </button>
                <button type="button" id="batch-toolbar-format" class="batch-toolbar-btn"
                        aria-label="Format otomatis isi textarea">
                  <i class="fas fa-magic-wand-sparkles"></i>
                  <span class="hidden md:inline">Format Otomatis</span>
                </button>
                <button type="button" id="batch-toolbar-clear" class="batch-toolbar-btn batch-toolbar-btn-danger"
                        aria-label="Hapus semua isi textarea">
                  <i class="fas fa-trash-alt"></i>
                  <span class="hidden md:inline">Hapus Semua</span>
                </button>
              </div>
            </header>

            <div id="batch-editor" class="batch-editor relative">
              <pre id="batch-gutter" class="batch-gutter" aria-hidden="true"></pre>
              <textarea id="batch-input-text"
                class="w-full h-72 resize-y outline-none transition font-mono bg-white text-slate-800 shadow-inner"
                placeholder="Tempel soal-soal di sini sesuai format...

1. Contoh soal pertama?
A. Pilihan A
B. Pilihan B
C. Pilihan C
D. Pilihan D
Jawaban: A

2. Contoh soal kedua?
..."
                oninput="if(!(window.BatchSoal&&window.BatchSoal.UI&&window.BatchSoal.UI.scheduleParse)){updateBatchPreviewCount();}"
                spellcheck="false"
                autocorrect="off"
                autocapitalize="off"></textarea>
              <span id="batch-input-toast" class="batch-format-toast" aria-live="polite"></span>
            </div>

            <div id="batch-counters" class="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
              <span id="batch-char-counter">0 / 200.000 karakter</span>
              <span class="text-slate-300" aria-hidden="true">|</span>
              <span id="batch-block-counter">0 / 500 blok</span>
              <span class="ml-auto text-purple-500" id="batch-autosave-label" aria-live="polite"></span>
            </div>

            <div id="batch-preview-status" class="mt-4 hidden flex flex-wrap gap-2"></div>
          </section>

          <aside id="batch-summary-panel"
                 class="bg-white border border-purple-100 rounded-xl p-4 text-sm order-3 xl:order-3"
                 aria-label="Ringkasan validasi"
                 aria-live="polite"
                 role="complementary">
            <h4 class="font-bold text-purple-800 mb-3 flex items-center justify-between gap-2">
              <span class="flex items-center gap-2"><i class="fas fa-chart-pie"></i> Ringkasan Validasi</span>
              <span id="batch-summary-status" class="batch-summary-pill batch-summary-pill-idle">
                <i class="fas fa-circle text-[6px]"></i> Menunggu input
              </span>
            </h4>

            <div id="batch-summary-counters" class="grid grid-cols-3 gap-2 mb-3">
              <div class="batch-summary-counter batch-counter-valid"><span class="num" data-counter="valid">0</span><span class="lbl">Valid</span></div>
              <div class="batch-summary-counter batch-counter-invalid"><span class="num" data-counter="invalid">0</span><span class="lbl">Invalid</span></div>
              <div class="batch-summary-counter batch-counter-total"><span class="num" data-counter="total">0</span><span class="lbl">Total</span></div>
            </div>

            <div id="batch-summary-donut-wrap" class="flex items-center gap-3 mb-3 hidden">
              <svg id="batch-summary-donut" width="96" height="96" viewBox="0 0 36 36" aria-hidden="true">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" stroke-width="3"></circle>
              </svg>
              <ul id="batch-summary-legend" class="text-[11px] space-y-1 flex-1"></ul>
            </div>

            <details id="batch-summary-invalid" class="batch-summary-list" open>
              <summary class="batch-summary-list-summary text-rose-700">
                <span><i class="fas fa-exclamation-triangle text-rose-500 mr-1"></i> Soal_Invalid</span>
                <span class="batch-summary-list-count" data-counter="invalid-list">0</span>
              </summary>
              <ul id="batch-summary-invalid-list" class="batch-summary-list-body"></ul>
            </details>

            <details id="batch-summary-valid" class="batch-summary-list">
              <summary class="batch-summary-list-summary text-emerald-700">
                <span><i class="fas fa-check-circle text-emerald-500 mr-1"></i> Soal_Valid</span>
                <span class="batch-summary-list-count" data-counter="valid-list">0</span>
              </summary>
              <ul id="batch-summary-valid-list" class="batch-summary-list-body"></ul>
            </details>

            <div id="batch-summary-config" class="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div class="font-semibold text-slate-700">Konfigurasi Ujian</div>
              <div id="batch-summary-config-body">Belum dipilih.</div>
            </div>
          </aside>
        </div>

        <div id="batch-action-bar"
             class="sticky bottom-0 -mx-4 md:-mx-5 lg:-mx-6 px-4 md:px-5 lg:px-6 pt-3 bg-white/95 border-t border-purple-200 rounded-b-xl"
             role="toolbar"
             aria-label="Aksi formulir batch">
          <div class="absolute left-0 right-0 top-0 h-[2px] overflow-hidden">
            <div id="batch-progress-bar" aria-hidden="true"></div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button type="button"
              id="batch-btn-reset"
              class="batch-action-btn order-3 sm:order-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-600 px-4 py-3 rounded-xl font-bold border border-slate-300 flex items-center justify-center gap-2"
              aria-label="Reset formulir batch">
              <i class="fas fa-rotate-left"></i>
              <span class="batch-action-label">Reset</span>
            </button>

            <button type="button"
              id="btn-batch-preview"
              onclick="previewBatchInput()"
              class="batch-action-btn order-2 sm:order-2 flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold border border-slate-300 flex items-center justify-center gap-2"
              aria-label="Pratinjau soal batch">
              <i class="fas fa-eye"></i>
              <span class="batch-action-label">Pratinjau</span>
            </button>

            <button type="button"
              id="btn-batch-save"
              onclick="processBatchInput()"
              class="batch-action-btn order-1 sm:order-3 flex-1 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 transform active:scale-95"
              aria-label="Simpan semua soal batch">
              <i class="fas fa-upload"></i>
              <span class="batch-action-label" id="batch-btn-text">Simpan Semua Soal</span>
            </button>
          </div>
        </div>
      </div>


      <div id="form-add-q" class="hidden qb-form-card fade-in">
          <!-- Form header yang lebih modern + info konteks -->
          <div class="qb-form-header">
            <div class="qb-form-header-left">
              <div class="qb-form-header-icon">
                <i class="fas fa-pen-to-square"></i>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-base text-blue-900 leading-tight">Input Soal Manual</h3>
                <p class="text-xs text-blue-500 mt-0.5">Buat satu soal baru atau edit soal yang sudah ada</p>
              </div>
            </div>
            <button type="button"
              onclick="resetQuestionForm(); document.getElementById('form-add-q').classList.add('hidden')"
              class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition text-sm font-bold">
              <i class="fas fa-times"></i>
              <span class="hidden sm:inline">Tutup</span>
            </button>
          </div>

          <div class="qb-form-body">
          <form onsubmit="handleAddQuestion(event)" class="space-y-5">
             <input type="hidden" name="examId" id="input-exam-id">
             <input type="hidden" name="questionId" id="input-question-id">

             <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div>
                   <label class="qb-field-label">Tipe Soal</label>
                   <select name="type" id="q-type-select" class="qb-input cursor-pointer" onchange="toggleOptionsInput(this.value)">
                      <option value="">-- Pilih Tipe Soal --</option>
                      <option value="PG">Pilihan Ganda</option>
                      <option value="PG_KOMPLEKS">Pilihan Ganda Kompleks</option>
                      <option value="BS">Benar/Salah (AKM)</option>
                      <option value="JODOH">Menjodohkan</option>
                      <option value="Esai">Esai</option>
                   </select>
               </div>
               <div>
                   <label class="qb-field-label">Status Wajib</label>
                   <select name="isRequired" class="qb-input cursor-pointer font-semibold">
                      <option value="TRUE">Wajib Diisi</option>
                      <option value="FALSE">Opsional</option>
                   </select>
               </div>
               <div>
                    <label class="qb-field-label">Bobot (Poin)</label>
                    <div class="relative">
                        <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-sm">
                            <i class="fas fa-star"></i>
                        </span>
                        <input type="number" name="point" id="input-point"
                            class="qb-input pl-9 font-bold"
                            placeholder="10" value="10" min="0.1" step="0.1">
                    </div>
               </div>

             </div>

             <div class="relative group">
                   <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Media Gambar (Link/Upload)</label>
                   <div class="flex gap-2">
                       <div class="relative flex-1">
                           <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><i class="far fa-image"></i></span>
                           <input type="text" name="image" id="input-image-ac" 
                               placeholder="Nama file gambar..." 
                               class="w-full border border-slate-200 p-3 pl-10 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                               autocomplete="off"
                               onkeyup="handleImageAutocomplete(this)"
                               onfocus="handleImageAutocomplete(this)"
                               onblur="setTimeout(() => document.getElementById('ac-results').classList.add('hidden'), 200)">
                           
                           <div id="ac-results" class="hidden absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto custom-scrollbar"></div>
                       </div>

                       <div class="w-1/3 md:w-1/4">
                           <select id="input-image-size" class="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-slate-700 cursor-pointer">
                               <option value="w300">Kecil</option>
                               <option value="w600">Sedang</option>
                               <option value="w1000" selected>Besar</option>
                           </select>
                       </div>

                       <!-- Tombol upload langsung dari Bank Soal -->
                       <button type="button" onclick="_qbToggleInlineUpload()"
                               title="Upload gambar baru"
                               class="shrink-0 px-3 py-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 font-bold text-sm hover:bg-violet-100 transition flex items-center gap-2 active:scale-95">
                           <i class="fas fa-cloud-upload-alt"></i>
                           <span class="hidden sm:inline">Upload</span>
                       </button>
                   </div>

                   <!-- Panel upload inline (tersembunyi secara default) -->
                   <div id="qb-inline-upload-panel" class="hidden mt-3 p-4 rounded-xl border border-violet-200 bg-violet-50">
                       <div class="flex items-center justify-between mb-3">
                           <p class="text-xs font-bold text-violet-700 flex items-center gap-1.5">
                               <i class="fas fa-cloud-upload-alt"></i> Upload Gambar Baru
                           </p>
                           <button type="button" onclick="_qbToggleInlineUpload()" class="text-violet-400 hover:text-violet-700 transition text-sm" aria-label="Tutup panel upload"><i class="fas fa-times"></i></button>
                       </div>

                       <!-- Drop area -->
                       <div id="qb-upload-drop-area"
                            class="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-violet-300 rounded-xl cursor-pointer bg-white hover:bg-violet-50 transition"
                            onclick="document.getElementById('qb-img-file-input').click()"
                            ondragover="event.preventDefault(); this.classList.add('!border-violet-500','!bg-violet-100');"
                            ondragleave="this.classList.remove('!border-violet-500','!bg-violet-100');"
                            ondrop="_qbHandleImgFileDrop(event)">
                           <i class="fas fa-file-image text-2xl text-violet-400"></i>
                           <p class="text-xs font-bold text-slate-600">Klik atau Seret &amp; Lepas file ke sini</p>
                           <p class="text-[11px] text-slate-400">Format: <b>JPG, JPEG, PNG</b> · Maks <b>5 MB</b></p>
                           <input type="file" id="qb-img-file-input" class="hidden" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onchange="_qbHandleFileSelect(this.files)">
                       </div>

                       <!-- Antrian file -->
                       <div id="qb-upload-queue" class="hidden mt-3 space-y-2"></div>

                       <!-- Tombol aksi upload -->
                       <div id="qb-upload-actions" class="hidden mt-3 flex gap-2 justify-end">
                           <button type="button" onclick="_qbClearUploadQueue()"
                                   class="px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition active:scale-95">
                               Bersihkan
                           </button>
                           <button type="button" id="btn-qb-start-upload" onclick="_qbStartUpload()"
                                   class="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg font-bold shadow transition flex items-center gap-2 active:scale-95">
                               <i class="fas fa-upload"></i> Upload
                           </button>
                       </div>
                   </div>
             </div>

             <!-- Task 12.1 — Audio attachment (mirrors the image media row) -->
             <div class="relative group">
                   <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Media Audio (mp3)</label>
                   <input type="hidden" name="audio" id="input-question-audio" value="">
                   <div class="flex flex-col gap-2">
                       <div class="flex gap-2 items-center flex-wrap">
                           <button type="button" id="btn-pick-question-audio" onclick="openAudioPickerForQuestion()"
                                   class="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm hover:bg-indigo-100 transition flex items-center gap-2 shrink-0">
                               <i class="fas fa-music"></i> Pilih Audio
                           </button>
                           <div id="question-audio-preview" class="hidden flex-1 flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 min-w-0">
                               <i class="fas fa-file-audio text-indigo-500 shrink-0"></i>
                               <span id="question-audio-name" class="text-xs font-bold text-slate-700 truncate flex-1 min-w-0">-</span>
                               <button type="button" onclick="clearQuestionAudio()"
                                       class="text-rose-500 hover:text-rose-700 text-sm shrink-0" title="Hapus audio dari soal" aria-label="Hapus audio dari soal">
                                   <i class="fas fa-times-circle"></i>
                               </button>
                           </div>
                           <span id="question-audio-empty" class="text-xs text-slate-400 italic">Belum ada audio dilampirkan.</span>
                       </div>
                       <audio id="question-audio-player" controls preload="none" class="w-full hidden"></audio>
                   </div>
             </div>

             <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Konten / Pertanyaan / Cerita</label>
                 <textarea id="editor-content" name="content" placeholder="Tulis teks pertanyaan atau pengantar cerita di sini..." class="w-full border border-slate-200 p-4 rounded-xl bg-slate-50 focus:bg-white h-32 focus:ring-2 focus:ring-blue-500 outline-none transition resize-y font-serif leading-relaxed"></textarea>
             </div>
             
             <div id="options-area" class="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p class="text-xs font-bold text-slate-500 mb-3 flex items-center gap-2"><i class="fas fa-list-ul"></i> PILIHAN JAWABAN <span id="options-area-label">(A-E)</span></p>
                
                <div class="space-y-4">
                    <div class="flex flex-col gap-1" id="opt-wrapper-0">
                        <span class="font-bold text-slate-500 text-xs">Pilihan A</span>
                        <textarea id="opt-0" class="editor-option w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-2" placeholder="Tulis jawaban A..."></textarea>
                    </div>
                    <div class="flex flex-col gap-1" id="opt-wrapper-1">
                        <span class="font-bold text-slate-500 text-xs">Pilihan B</span>
                        <textarea id="opt-1" class="editor-option w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-2" placeholder="Tulis jawaban B..."></textarea>
                    </div>
                    <div class="flex flex-col gap-1" id="opt-wrapper-2">
                        <span class="font-bold text-slate-500 text-xs">Pilihan C</span>
                        <textarea id="opt-2" class="editor-option w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-2" placeholder="Tulis jawaban C..."></textarea>
                    </div>
                    <div class="flex flex-col gap-1" id="opt-wrapper-3">
                        <span class="font-bold text-slate-500 text-xs">Pilihan D</span>
                        <textarea id="opt-3" class="editor-option w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-2" placeholder="Tulis jawaban D..."></textarea>
                    </div>
                    <div class="flex flex-col gap-1" id="opt-wrapper-4">
                        <span class="font-bold text-slate-500 text-xs">Pilihan E</span>
                        <textarea id="opt-4" class="editor-option w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-2" placeholder="Tulis jawaban E..."></textarea>
                    </div>
                    <div class="flex flex-col gap-1 hidden" id="opt-wrapper-5">
                        <span class="font-bold text-slate-500 text-xs">Pilihan F</span>
                        <textarea id="opt-5" class="editor-option w-full border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-2" placeholder="Tulis jawaban F..."></textarea>
                    </div>
                </div>
             </div>

             <div id="pairs-area" class="hidden bg-slate-50 p-5 rounded-xl border border-slate-200">
                 <div class="flex justify-between items-center mb-2">
                   <p class="text-xs font-bold text-slate-500"><i class="fas fa-random"></i> PASANGAN (KIRI - KANAN)</p>
                   <button type="button" onclick="addPairInput()" class="text-blue-600 text-xs font-bold hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition">+ Tambah Baris</button>
                </div>
                <div class="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[10px] text-blue-700 leading-relaxed">
                  <i class="fas fa-info-circle mr-1"></i>
                  <b>Panduan 3 Kolom:</b>
                  <span class="text-blue-600"> (1) <b>Pernyataan</b> = teks soal di sisi kiri siswa &nbsp;|&nbsp; (2) <b>Opsi (Tampil di Siswa)</b> = teks pilihan jawaban di sisi kanan siswa, sekaligus dipakai sebagai kunci &nbsp;|&nbsp; (3) <b>Kunci Jawaban</b> = terisi otomatis dari Opsi. Biarkan Pernyataan kosong untuk membuat opsi pengacoh.</span>
                </div>
                <div id="pairs-container" class="space-y-2"></div>
             </div>
             
             <div id="bs-area" class="hidden bg-slate-50 p-5 rounded-xl border border-slate-200">
                 <div class="flex justify-between items-center mb-3">
                   <p class="text-xs font-bold text-slate-500"><i class="fas fa-tasks"></i> PERNYATAAN & KUNCI JAWABAN</p>
                   <button type="button" onclick="addBsRowInput()" class="text-emerald-600 text-xs font-bold hover:underline bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition">+ Tambah Pernyataan</button>
                </div>
                
                <div class="grid grid-cols-12 gap-2 mb-2 px-1 text-[10px] font-bold text-slate-400 uppercase">
                    <div class="col-span-8">Isi Pernyataan</div>
                    <div class="col-span-3">Kunci Jawaban</div>
                    <div class="col-span-1 text-center">Hapus</div>
                </div>
                
                <div id="bs-container" class="space-y-2"></div>
             </div>

             <div id="simple-key-area">
                 <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Kunci Jawaban</label>
                 <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-600"><i class="fas fa-key"></i></div>
                    <input type="text" name="correct" id="correct-input" placeholder="Contoh: Pilihan A (Harus sama persis dengan teks opsi)" class="pl-10 w-full border border-green-200 p-3 rounded-xl font-medium bg-green-50 text-green-800 focus:ring-2 focus:ring-green-500 outline-none transition placeholder-green-700/50">
                 </div>
                 <p class="text-[10px] text-slate-400 mt-1 ml-1">*Untuk Esai, isi kata kunci jawaban.</p>
             </div>

             <!-- Validasi Minimal Karakter (hanya untuk Esai) -->
             <div id="esai-minchar-area" class="hidden bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
               <p class="text-xs font-bold text-violet-700 uppercase flex items-center gap-2">
                 <i class="fas fa-text-width"></i> Validasi Panjang Jawaban Esai
               </p>
               <label class="flex items-center gap-3 cursor-pointer">
                 <div class="relative inline-block">
                   <input type="checkbox" id="input-minchar-enabled" class="sr-only peer" checked>
                   <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-violet-500 transition-colors"></div>
                   <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
                 </div>
                 <span class="text-sm font-semibold text-slate-700">Aktifkan validasi jumlah karakter</span>
               </label>
               <div id="esai-minchar-input-wrap">
                 <label class="block text-xs font-medium text-slate-600 mb-1">Minimal karakter jawaban siswa</label>
                 <div class="flex items-center gap-2">
                   <input type="number" id="input-minchar" min="1" max="5000" value="10"
                          class="w-28 border border-violet-300 rounded-lg p-2 text-sm font-bold text-violet-800 bg-white focus:ring-2 focus:ring-violet-400 outline-none"
                          placeholder="10">
                   <span class="text-sm text-slate-500">karakter</span>
                 </div>
                 <p class="text-[10px] text-slate-400 mt-1">Siswa tidak dapat menyimpan/mengirim jika jawaban kurang dari jumlah ini.</p>
               </div>
             </div>
             
             <button type="submit" class="qb-submit-btn">
                 <i class="fas fa-save"></i> Simpan Pertanyaan
             </button>
          </form>
          </div><!-- /qb-form-body -->
      </div>

      <div id="q-table-container" class="w-full mt-4 transition-all duration-300">
          <div class="qb-empty" style="padding: 48px 24px;">
              <div class="qb-empty-icon" style="background:linear-gradient(135deg,#eff6ff,#eef2ff);border-color:#bfdbfe;">
                  <i class="fas fa-graduation-cap" style="color:#3b82f6;font-size:26px;"></i>
              </div>
              <h3 class="text-base font-bold text-slate-600 mt-4">Pilih Mata Pelajaran / Ujian</h3>
              <p class="text-sm text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">Gunakan dropdown <b class="text-slate-500">Pilih Mata Pelajaran / Ujian</b> di atas untuk melihat dan mengelola bank soal.</p>
              <div class="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                <span class="flex items-center gap-1.5"><i class="fas fa-plus-circle text-blue-400"></i> Tambah soal manual</span>
                <span class="flex items-center gap-1.5"><i class="fas fa-file-import text-green-400"></i> Import dari Excel / G-Form</span>
                <span class="flex items-center gap-1.5"><i class="fas fa-layer-group text-purple-400"></i> Input batch massal</span>
              </div>
          </div>
      </div>
    </div>
    `;
  setTimeout(() => {
    initRichEditor();
  }, 100);

  // Re-enforce role gate untuk fitur Batch — formulir & tombol pemicu
  // baru saja dirender ulang lewat innerHTML, jadi reset flag enforced
  // di RoleGate sebelum memanggil enforce() agar non-Admin/Guru tetap
  // tidak melihat form/tombol Batch (Req 15.2).
  try {
    var RG = window.BatchSoal && window.BatchSoal.UI && window.BatchSoal.UI.RoleGate;
    if (RG) {
      if (typeof RG._resetForRender === 'function') RG._resetForRender();
      if (typeof RG.enforce === 'function') RG.enforce();
    }
  } catch (e) { /* swallow */ }

  // Jika Bank Soal dibuka via tombol "Kelola Soal" (Halaman/ Modal Progress Soal),
  // langsung pilih mata pelajaran yang dimaksud dan muat tabel soalnya.
  // DOM (termasuk <select> beserta opsi) sudah jadi di titik ini, jadi tidak
  // perlu polling — cukup terapkan stash window._progPendingExamId sekali.
  try {
    var _pendingExam = window._progPendingExamId;
    if (_pendingExam) {
      window._progPendingExamId = null;
      var _sel = document.getElementById('select-exam-q');
      if (_sel) {
        _sel.value = String(_pendingExam);
        // Pastikan opsi benar-benar terpilih; jika tidak cocok, biarkan loader
        // tetap memuat tabel berdasarkan examId yang diminta.
        if (typeof loadQuestionsTable === 'function') {
          loadQuestionsTable(_pendingExam);
        } else {
          try { _sel.dispatchEvent(new Event('change')); } catch (e) {   }
        }
      }
    }
  } catch (e) { /* swallow */ }
}

function addBsRowInput(text = '', key = 'Benar') {
  const container = document.getElementById('bs-container');
  const div = document.createElement('div');
  div.className = 'grid grid-cols-12 gap-2 items-center bs-row';

  div.innerHTML = `
        <div class="col-span-8">
            <div class="bs-editor-wrap border border-slate-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition">
              <div class="bs-toolbar flex items-center gap-0.5 px-1.5 py-1 bg-slate-100 border-b border-slate-200">
                <button type="button" onclick="bsFormatText(this, 'bold')" class="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition" title="Bold (Ctrl+B)"><i class="fas fa-bold text-[10px]"></i></button>
                <button type="button" onclick="bsFormatText(this, 'italic')" class="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition" title="Italic (Ctrl+I)"><i class="fas fa-italic text-[10px]"></i></button>
              </div>
              <div class="bs-text w-full p-2 text-sm outline-none min-h-[36px] bg-white" contenteditable="true" data-placeholder="Tulis pernyataan..."></div>
            </div>
        </div>
        <div class="col-span-3">
            <select class="bs-key w-full border border-slate-300 rounded p-2 text-sm bg-white cursor-pointer">
                <option value="Benar" ${key === 'Benar' ? 'selected' : ''}>Sesuai / Benar</option>
                <option value="Salah" ${key === 'Salah' ? 'selected' : ''}>Tidak Sesuai / Salah</option>
            </select>
        </div>
        <div class="col-span-1 text-center">
             <button type="button" onclick="this.parentElement.parentElement.remove()" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
        </div>
    `;
  container.appendChild(div);

  const editable = div.querySelector('.bs-text');
  if (text) {
    const hasHtmlTag = /<(b|i|strong|em|u|br|span|div|p)\b[^>]*>/i.test(text);
    const hasHtmlEntity = /&(lt|gt|amp|quot|nbsp|#\d+|#x[0-9a-f]+);/i.test(text);
    if (hasHtmlTag || hasHtmlEntity) {
      editable.innerHTML = text;
    } else {
      editable.textContent = text;
    }
  }
}

function bsFormatText(btn, command) {
  const wrapper = btn.closest('.bs-editor-wrap');
  const editable = wrapper.querySelector('.bs-text[contenteditable]');
  editable.focus();
  document.execCommand(command, false, null);
}

function toggleOptionsInput(type) {
  const pgArea = document.getElementById('options-area');
  const pairsArea = document.getElementById('pairs-area');
  const bsArea = document.getElementById('bs-area');
  const simpleKeyArea = document.getElementById('simple-key-area');

  const keyInput = document.getElementById('correct-input');

  pgArea.classList.add('hidden');
  pairsArea.classList.add('hidden');
  bsArea.classList.add('hidden');
  simpleKeyArea.classList.add('hidden');

  if (type === 'PG' || type === 'PG_KOMPLEKS') {
    pgArea.classList.remove('hidden');
    simpleKeyArea.classList.remove('hidden');

    let optCount = 5; 
    if (currentExamTypeConfig && currentExamTypeConfig[type] && currentExamTypeConfig[type].optCount) {
      optCount = parseInt(currentExamTypeConfig[type].optCount) || 5;
    }
    optCount = Math.max(2, Math.min(6, optCount));

    const labels = ['A','B','C','D','E','F'];
    for (let i = 0; i < 6; i++) {
      const wrapper = document.getElementById('opt-wrapper-' + i);
      if (wrapper) {
        if (i < optCount) {
          wrapper.classList.remove('hidden');
        } else {
          wrapper.classList.add('hidden');
          if (typeof tinymce !== 'undefined' && tinymce.get('opt-' + i)) {
            tinymce.get('opt-' + i).setContent('');
          } else {
            const el = document.getElementById('opt-' + i);
            if (el) el.value = '';
          }
        }
      }
    }

    const labelEl = document.getElementById('options-area-label');
    if (labelEl) {
      labelEl.textContent = '(A-' + labels[optCount - 1] + ')';
    }

    if (keyInput) {
      if (type === 'PG_KOMPLEKS') {
        keyInput.placeholder = 'Contoh: A, C (Pisahkan dengan koma, maks. 7 karakter)';
      } else {
        keyInput.placeholder = 'Contoh: A (Hanya satu huruf kapital)';
      }
      keyInput.oninput = function() {
        const pos = this.selectionStart;
        const cleaned = this.value.replace(/[^A-Za-z ,]/g, '');
        this.value = cleaned.toUpperCase();
        const newPos = Math.min(pos, this.value.length);
        this.setSelectionRange(newPos, newPos);
      };
    }
  }
  else if (type === 'BS') {
    bsArea.classList.remove('hidden');
    if (keyInput) keyInput.oninput = null;
  }
  else if (type === 'JODOH') {
    pairsArea.classList.remove('hidden');
    if (keyInput) keyInput.oninput = null;
  }
  else if (type === 'Esai') {
    simpleKeyArea.classList.remove('hidden');
    document.getElementById('esai-minchar-area').classList.remove('hidden');
    if (keyInput) {
      keyInput.placeholder = 'Masukkan kata kunci atau jawaban singkat...';
      keyInput.oninput = null;
    }
    const cbEnabled = document.getElementById('input-minchar-enabled');
    const wrapInput = document.getElementById('esai-minchar-input-wrap');
    if (cbEnabled && wrapInput) {
      cbEnabled.onchange = null;
      cbEnabled.onchange = function() {
        wrapInput.classList.toggle('hidden', !this.checked);
      };
      wrapInput.classList.toggle('hidden', !cbEnabled.checked);
    }
  }
  else {
    document.getElementById('esai-minchar-area').classList.add('hidden');
  }

  // ── Auto-fill poin default berdasarkan jadwal + tipe soal ──
  // Hanya berlaku saat membuat soal BARU (input-question-id kosong).
  // Saat edit soal, poin yang tersimpan pada soal TIDAK diubah.
  try {
    const qIdEl = document.getElementById('input-question-id');
    const isNewQuestion = !qIdEl || qIdEl.value.trim() === '';
    if (isNewQuestion && type && currentExamTypeConfig) {
      const cfg = currentExamTypeConfig[type];
      if (cfg && cfg.defaultPoint != null && cfg.defaultPoint > 0) {
        const pointEl = document.getElementById('input-point');
        if (pointEl) pointEl.value = cfg.defaultPoint;
      }
    }
  } catch(e) { /* silent — jangan ganggu alur utama */ }
}

function addPairInput(qVal = '', optVal = '', keyVal = '') {
  const container = document.getElementById('pairs-container');
  const div = document.createElement('div');
  div.className = 'grid grid-cols-12 gap-2 mb-2 items-start pair-row';

  div.innerHTML = `
      <div class="col-span-5">
          <label class="text-[10px] text-slate-400 font-bold uppercase ml-1 mb-1 block">Soal / Pernyataan <span class="text-slate-300 normal-case font-normal">(sisi kiri)</span></label>
          <div class="pair-editor-wrap border border-slate-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition">
            <div class="pair-toolbar flex items-center gap-0.5 px-1.5 py-1 bg-slate-100 border-b border-slate-200">
              <button type="button" onclick="pairFormatText(this, 'bold')" class="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition" title="Bold (Ctrl+B)"><i class="fas fa-bold text-[10px]"></i></button>
              <button type="button" onclick="pairFormatText(this, 'italic')" class="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 transition" title="Italic (Ctrl+I)"><i class="fas fa-italic text-[10px]"></i></button>
              <button type="button" class="pair-img-btn w-6 h-6 flex items-center justify-center rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition ml-auto" title="Sisipkan gambar dari Folder Gambar"><i class="far fa-image text-[10px]"></i></button>
            </div>
            <div class="pair-left w-full p-2 text-sm outline-none min-h-[36px] bg-white" contenteditable="true" data-placeholder="Contoh: Ibu Kota Jawa Barat"></div>
          </div>
          <div class="pair-left-preview mt-1 hidden"></div>
      </div>

      <div class="col-span-3">
          <label class="text-[10px] text-amber-600 font-bold uppercase ml-1 mb-1 block">Opsi <span class="text-amber-400 normal-case font-normal">(tampil &amp; kunci)</span></label>
          <div class="pair-editor-wrap border border-amber-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-amber-500 transition">
            <div class="pair-toolbar flex items-center gap-0.5 px-1.5 py-1 bg-amber-50 border-b border-amber-200">
              <button type="button" onclick="pairFormatText(this, 'bold')" class="w-6 h-6 flex items-center justify-center rounded hover:bg-amber-100 text-slate-600 transition" title="Bold (Ctrl+B)"><i class="fas fa-bold text-[10px]"></i></button>
              <button type="button" onclick="pairFormatText(this, 'italic')" class="w-6 h-6 flex items-center justify-center rounded hover:bg-amber-100 text-slate-600 transition" title="Italic (Ctrl+I)"><i class="fas fa-italic text-[10px]"></i></button>
              <button type="button" class="pair-img-btn w-6 h-6 flex items-center justify-center rounded hover:bg-amber-100 text-slate-400 hover:text-amber-600 transition ml-auto" title="Sisipkan gambar dari Folder Gambar"><i class="far fa-image text-[10px]"></i></button>
            </div>
            <div class="pair-middle w-full p-2 text-sm outline-none min-h-[36px] bg-white" contenteditable="true" data-placeholder="Teks pilihan di sisi kanan"></div>
          </div>
          <div class="pair-middle-preview mt-1 hidden"></div>
      </div>

      <div class="col-span-3">
          <label class="text-[10px] text-slate-400 font-bold uppercase ml-1 mb-1 flex items-center gap-1 block">
            Kunci Jawaban
            <span class="normal-case font-normal text-slate-300">(otomatis)</span>
          </label>
          <div class="pair-right w-full border border-emerald-300 p-2 rounded text-sm bg-emerald-50 font-medium text-emerald-800 min-h-[36px] mt-[30px] opacity-70 cursor-not-allowed select-none"
               title="Kunci jawaban otomatis diambil dari kolom Opsi (Tampil di Siswa)"></div>
      </div>

      <div class="col-span-1 flex items-end justify-center h-full pb-1">
          <button type="button" class="del-pair-btn text-slate-300 hover:text-red-500 transition-colors p-2 mt-5" title="Hapus Baris">
              <i class="fas fa-trash-alt"></i>
          </button>
      </div>
  `;

  const leftInput   = div.querySelector('.pair-left');
  const midInput    = div.querySelector('.pair-middle');
  const rightInput  = div.querySelector('.pair-right');
  const leftPreview = div.querySelector('.pair-left-preview');
  const midPreview  = div.querySelector('.pair-middle-preview');

  if (qVal)   _setPairEditableContent(leftInput, qVal);
  if (optVal) _setPairEditableContent(midInput, optVal);
  rightInput.innerHTML = optVal || keyVal || '';

  _updatePairPreviewCE(leftInput, leftPreview);
  _updatePairPreviewCE(midInput, midPreview);

  midInput.addEventListener('input', function() {
    rightInput.innerHTML = this.innerHTML;
    _updatePairPreviewCE(this, midPreview);
  });
  leftInput.addEventListener('input', function() {
    _updatePairPreviewCE(this, leftPreview);
  });

  const imgBtns = div.querySelectorAll('.pair-img-btn');
  imgBtns[0].addEventListener('click', () => openImgPickerForPairCE(leftInput, leftPreview));
  imgBtns[1].addEventListener('click', () => openImgPickerForPairCE(midInput, midPreview, rightInput));

  div.querySelector('.del-pair-btn').addEventListener('click', () => div.remove());

  container.appendChild(div);
}

function _setPairEditableContent(el, text) {
  if (!el || !text) return;
  const hasHtmlTag = /<(b|i|strong|em|u|br|span|div|p|img)\b[^>]*>/i.test(text);
  const hasHtmlEntity = /&(lt|gt|amp|quot|nbsp|#\d+|#x[0-9a-f]+);/i.test(text);
  if (hasHtmlTag || hasHtmlEntity) {
    el.innerHTML = text;
  } else {
    el.textContent = text;
  }
}

function _updatePairPreviewCE(el, preview) {
  if (!el || !preview) return;
  const val = el.innerHTML || '';
  const imgMatch = val.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch) {
    preview.innerHTML = `<img src="${imgMatch[1]}" referrerpolicy="no-referrer" class="w-12 h-12 rounded border border-slate-200 object-cover bg-slate-100">`;
    preview.classList.remove('hidden');
  } else {
    preview.innerHTML = '';
    preview.classList.add('hidden');
  }
}

function openImgPickerForPairCE(el, preview, rightSync) {
  if (!el) return;
  _openImgPickerModalCE(el, preview, rightSync);
}

function pairFormatText(btn, command) {
  const wrapper = btn.closest('.pair-editor-wrap');
  const editable = wrapper.querySelector('[contenteditable]');
  editable.focus();
  document.execCommand(command, false, null);
}

function _openImgPickerModalCE(targetEl, preview, rightSync) {
  const _doOpen = () => {
    const imgs = allImagesData || [];
    const modalId = 'img-picker-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <i class="far fa-image text-blue-500"></i>
            <span class="font-bold text-slate-700 text-sm">Pilih Gambar dari Folder</span>
          </div>
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="text-slate-400 hover:text-slate-600 transition text-lg leading-none">&times;</button>
        </div>
        <div class="px-5 py-3 border-b border-slate-100">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><i class="fas fa-search text-xs"></i></span>
            <input type="text" id="img-picker-search" placeholder="Cari nama gambar..."
                   class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                   oninput="_filterImgPickerResults(this.value)">
          </div>
        </div>
        <div id="img-picker-list" class="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
          ${imgs.length === 0
            ? '<p class="text-center text-xs text-slate-400 italic py-8">Folder gambar kosong atau belum dimuat.</p>'
            : imgs.map(img => `
              <div class="img-picker-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition" data-name="${img.name.toLowerCase()}" data-link="${img.link}" data-id="${img.id}" data-uploader="${img.uploaderID||''}" onclick="_selectImgPickerItemCE(this)">
                <img src="${img.link}" referrerpolicy="no-referrer" class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100">
                <div class="overflow-hidden">
                  <p class="text-xs font-bold text-slate-700 truncate">${img.name}</p>
                  <p class="text-[10px] text-slate-400 truncate font-mono">...${img.link.slice(-18)}</p>
                </div>
              </div>`).join('')}
        </div>
        <div class="px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Gambar akan disisipkan ke dalam isian soal menjodohkan.
        </div>
      </div>`;

    modal._targetEl  = targetEl;
    modal._preview   = preview   || null;
    modal._rightSync = rightSync || null;
    document.body.appendChild(modal);

    setTimeout(() => {
      const s = document.getElementById('img-picker-search');
      if (s) s.focus();
    }, 80);
  };

  if (!allImagesData || allImagesData.length === 0) {
    google.script.run.withSuccessHandler(imgs => {
      allImagesData = imgs || [];
      _doOpen();
    }).getSavedImages();
  } else {
    _doOpen();
  }
}

function _selectImgPickerItemCE(itemEl) {
  const modal = document.getElementById('img-picker-modal');
  if (!modal) return;
  const targetEl  = modal._targetEl;
  const preview   = modal._preview   || null;
  const rightSync = modal._rightSync || null;
  const link      = itemEl.dataset.link;
  const imageId   = itemEl.dataset.id;
  const uploader  = itemEl.dataset.uploader;

  if (!targetEl || !link) { modal.remove(); return; }

  const isAdmin      = currentUser && currentUser.role === 'Admin';
  const needsPassword = !isAdmin && uploader;

  const _doInsert = () => {
    const imgTag = `<img src="${link}" referrerpolicy="no-referrer" class="max-w-full rounded my-1">`;

    targetEl.focus();
    document.execCommand('insertHTML', false, imgTag);
    targetEl.dispatchEvent(new Event('input', { bubbles: true }));

    if (preview) _updatePairPreviewCE(targetEl, preview);

    if (rightSync) rightSync.innerHTML = targetEl.innerHTML;

    targetEl.classList.add('ring-2', 'ring-green-400', 'bg-green-50');
    setTimeout(() => targetEl.classList.remove('ring-2', 'ring-green-400', 'bg-green-50'), 900);
    modal.remove();
  };

  if (!needsPassword) {
    _doInsert();
  } else {
    modal.remove();
    _showImagePasswordModal(
      'Konfirmasi Penggunaan Gambar',
      'Gambar ini dilindungi. Masukkan password akun pemilik gambar untuk menggunakannya di soal ini.',
      (pwd, resolve, reject) => {
        google.script.run
          .withSuccessHandler(res => {
            if (res && res.success) {
              resolve();
              _doInsert();
            } else {
              resolve(); // tutup modal loading
              Swal.fire({ icon: 'error', title: 'Akses Ditolak',
                html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Password salah.'}</p>`,
                confirmButtonColor: '#dc2626', customClass:{ popup:'lp-swal' } });
            }
          })
          .withFailureHandler(err => {
            resolve();
            Swal.fire({ title:'Error Server',
              html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${((err && err.message) || String(err)).replace(/</g,'&lt;')}</p>`,
              icon:'error', confirmButtonColor:'#dc2626', customClass:{ popup:'lp-swal' } });
          })
          .verifyImageAccess(imageId, pwd, currentUser.userID, currentUser.token);
      }
    );
  }
}

function _updatePairPreview(input, preview) {
  if (!input || !preview) return;
  const val = input.value || '';

  const imgMatch = val.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch) {
    const src = imgMatch[1];
    preview.innerHTML = `
      <div class="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
        <img src="${src}" referrerpolicy="no-referrer"
             class="w-12 h-10 object-cover rounded border border-slate-200 bg-white shrink-0">
        <div class="overflow-hidden flex-1">
          <p class="text-[10px] text-slate-500 truncate font-mono leading-tight">${val.replace(/<[^>]+>/g,'').trim() || '(hanya gambar)'}</p>
          <p class="text-[9px] text-slate-400 truncate">...${src.slice(-22)}</p>
        </div>
      </div>`;
    preview.classList.remove('hidden');
  } else {
    preview.innerHTML = '';
    preview.classList.add('hidden');
  }
}

function openImgPickerForTarget(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  _openImgPickerModal(el);
}

function openImgPickerForEditor(editor) {
  const _doOpen = () => {
    const imgs = allImagesData || [];
    const modalId = 'img-picker-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <i class="far fa-image text-blue-500"></i>
            <span class="font-bold text-slate-700 text-sm">Pilih Gambar dari Folder</span>
          </div>
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="text-slate-400 hover:text-slate-600 transition text-lg leading-none">&times;</button>
        </div>
        <div class="px-5 py-3 border-b border-slate-100">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><i class="fas fa-search text-xs"></i></span>
            <input type="text" id="img-picker-search" placeholder="Cari nama gambar..."
                   class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                   oninput="_filterImgPickerResults(this.value)">
          </div>
        </div>
        <div id="img-picker-list" class="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
          ${imgs.length === 0
            ? '<p class="text-center text-xs text-slate-400 italic py-8">Folder gambar kosong atau belum dimuat.</p>'
            : imgs.map(img => `
              <div class="img-picker-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition" data-name="${img.name.toLowerCase()}" data-link="${img.link}" data-id="${img.id}" data-uploader="${img.uploaderID||''}">
                <img src="${img.link}" referrerpolicy="no-referrer" class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100">
                <div class="overflow-hidden">
                  <p class="text-xs font-bold text-slate-700 truncate">${img.name}</p>
                  <p class="text-[10px] text-slate-400 truncate font-mono">...${img.link.slice(-18)}</p>
                </div>
              </div>`).join('')}
        </div>
        <div class="px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Gambar akan disisipkan ke dalam editor opsi jawaban.
        </div>
      </div>`;

    modal._tinyEditor = editor;

    modal.querySelector('#img-picker-list').addEventListener('click', (ev) => {
      const item = ev.target.closest('.img-picker-item');
      if (!item) return;
      _selectImgPickerItemForEditor(item, modal._tinyEditor);
    });

    document.body.appendChild(modal);
    setTimeout(() => {
      const s = document.getElementById('img-picker-search');
      if (s) s.focus();
    }, 80);
  };

  if (!allImagesData || allImagesData.length === 0) {
    google.script.run.withSuccessHandler(imgs => {
      allImagesData = imgs || [];
      _doOpen();
    }).getSavedImages();
  } else {
    _doOpen();
  }
}

function _selectImgPickerItemForEditor(itemEl, editor) {
  const modal    = document.getElementById('img-picker-modal');
  const link     = itemEl.dataset.link;
  const imageId  = itemEl.dataset.id;
  const uploader = itemEl.dataset.uploader;

  if (!editor || !link) { if (modal) modal.remove(); return; }

  const isAdmin       = currentUser && currentUser.role === 'Admin';
  const needsPassword = !isAdmin && uploader;

  const _doInsert = () => {
    editor.insertContent(`<img src="${link}" referrerpolicy="no-referrer" class="max-w-full rounded my-1">`);
    if (modal) modal.remove();
  };

  if (!needsPassword) {
    _doInsert();
  } else {
    if (modal) modal.remove();
    _showImagePasswordModal(
      'Konfirmasi Penggunaan Gambar',
      'Masukkan password akun pemilik gambar untuk menggunakannya di soal ini.',
      (pwd, resolve, reject) => {
        google.script.run
          .withSuccessHandler(res => {
            if (res && res.success) {
              resolve();
              _doInsert();
            } else {
              resolve();
              Swal.fire({ icon: 'error', title: 'Akses Ditolak',
                html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Password salah.'}</p>`,
                confirmButtonColor: '#dc2626', customClass:{ popup:'lp-swal' } });
            }
          })
          .withFailureHandler(err => {
            resolve();
            Swal.fire({ title:'Error Server',
              html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${((err && err.message) || String(err)).replace(/</g,'&lt;')}</p>`,
              icon:'error', confirmButtonColor:'#dc2626', customClass:{ popup:'lp-swal' } });
          })
          .verifyImageAccess(imageId, pwd, currentUser.userID, currentUser.token);
      }
    );
  }
}

function openImgPickerForInput(el, preview, rightSync, midSync) {
  if (!el) return;
  _openImgPickerModal(el, preview, rightSync);
}

function _openImgPickerModal(targetEl, preview, rightSync) {

  const _doOpen = () => {
    const imgs = allImagesData || [];

    const modalId = 'img-picker-modal';
    let existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <i class="far fa-image text-blue-500"></i>
            <span class="font-bold text-slate-700 text-sm">Pilih Gambar dari Folder</span>
          </div>
          <button type="button" onclick="document.getElementById('${modalId}').remove()" class="text-slate-400 hover:text-slate-600 transition text-lg leading-none">&times;</button>
        </div>
        <div class="px-5 py-3 border-b border-slate-100">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><i class="fas fa-search text-xs"></i></span>
            <input type="text" id="img-picker-search" placeholder="Cari nama gambar..." 
                   class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
                   oninput="_filterImgPickerResults(this.value)">
          </div>
        </div>
        <div id="img-picker-list" class="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
          ${imgs.length === 0
            ? '<p class="text-center text-xs text-slate-400 italic py-8">Folder gambar kosong atau belum dimuat.</p>'
            : imgs.map(img => `
              <div class="img-picker-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition" data-name="${img.name.toLowerCase()}" data-link="${img.link}" data-id="${img.id}" data-uploader="${img.uploaderID||''}" onclick="_selectImgPickerItem(this)">
                <img src="${img.link}" referrerpolicy="no-referrer" class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100">
                <div class="overflow-hidden">
                  <p class="text-xs font-bold text-slate-700 truncate">${img.name}</p>
                  <p class="text-[10px] text-slate-400 truncate font-mono">...${img.link.slice(-18)}</p>
                </div>
              </div>`).join('')}
        </div>
        <div class="px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Gambar akan disisipkan sebagai tag &lt;img&gt; ke dalam isian opsi jawaban.
        </div>
      </div>`;

    modal._targetEl  = targetEl;
    modal._preview   = preview   || null;
    modal._rightSync = rightSync || null;
    document.body.appendChild(modal);

    setTimeout(() => {
      const s = document.getElementById('img-picker-search');
      if (s) s.focus();
    }, 80);
  };

  if (!allImagesData || allImagesData.length === 0) {
    google.script.run.withSuccessHandler(imgs => {
      allImagesData = imgs || [];
      _doOpen();
    }).getSavedImages();
  } else {
    _doOpen();
  }
}

function _filterImgPickerResults(term) {
  const list = document.getElementById('img-picker-list');
  if (!list) return;
  const q = term.toLowerCase().trim();
  list.querySelectorAll('.img-picker-item').forEach(item => {
    item.style.display = (!q || item.dataset.name.includes(q)) ? '' : 'none';
  });
}

function _selectImgPickerItem(itemEl) {
  const modal    = document.getElementById('img-picker-modal');
  if (!modal) return;
  const targetEl  = modal._targetEl;
  const preview   = modal._preview   || null;
  const rightSync = modal._rightSync || null;
  const link      = itemEl.dataset.link;
  const imageId   = itemEl.dataset.id;
  const uploader  = itemEl.dataset.uploader;

  if (!targetEl || !link) { modal.remove(); return; }

  const isAdmin      = currentUser && currentUser.role === 'Admin';
  const needsPassword = !isAdmin && uploader;

  const _doInsert = () => {
    const imgTag = `<img src="${link}" referrerpolicy="no-referrer" class="max-w-full rounded my-1">`;
    if (targetEl.tagName === 'TEXTAREA') {

      const start = targetEl.selectionStart || targetEl.value.length;
      const end   = targetEl.selectionEnd   || targetEl.value.length;
      targetEl.value = targetEl.value.slice(0, start) + imgTag + targetEl.value.slice(end);
      targetEl.dispatchEvent(new Event('input', { bubbles: true }));
    } else {

      targetEl.value = (targetEl.value ? targetEl.value + ' ' : '') + imgTag;
      targetEl.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (preview) _updatePairPreview(targetEl, preview);
    if (rightSync) rightSync.value = targetEl.value;

    targetEl.classList.add('ring-2', 'ring-green-400', 'bg-green-50');
    setTimeout(() => targetEl.classList.remove('ring-2', 'ring-green-400', 'bg-green-50'), 900);
    modal.remove();
  };

  if (!needsPassword) {
    _doInsert();
  } else {
    modal.remove();
    _showImagePasswordModal(
      'Konfirmasi Penggunaan Gambar',
      'Gambar ini dilindungi. Masukkan password akun pemilik gambar untuk menggunakannya di soal ini.',
      (pwd, resolve, reject) => {
        google.script.run
          .withSuccessHandler(res => {
            if (res && res.success) {
              resolve();
              _doInsert();
            } else {
              resolve();
              Swal.fire({ icon: 'error', title: 'Akses Ditolak',
                html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Password salah.'}</p>`,
                confirmButtonColor: '#dc2626', customClass:{ popup:'lp-swal' } });
            }
          })
          .withFailureHandler(err => {
            resolve();
            Swal.fire({ title:'Error Server',
              html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${((err && err.message) || String(err)).replace(/</g,'&lt;')}</p>`,
              icon:'error', confirmButtonColor:'#dc2626', customClass:{ popup:'lp-swal' } });
          })
          .verifyImageAccess(imageId, pwd, currentUser.userID, currentUser.token);
      }
    );
  }
}

function handleImageAutocomplete(input) {
  const term = input.value.toLowerCase().trim();
  const resultDiv = document.getElementById('ac-results');
  if (!allImagesData || allImagesData.length === 0) {
    google.script.run.withSuccessHandler(imgs => {
      allImagesData = imgs || [];
    }).getSavedImages();
    return;
  }

  if (!term) {
    resultDiv.classList.add('hidden');
    return;
  }

  const matches = allImagesData.filter(img => img.name.toLowerCase().includes(term));

  if (matches.length === 0) {
    resultDiv.innerHTML = `<div class="p-3 text-xs text-slate-400 italic text-center">Tidak ada gambar ditemukan</div>`;
    resultDiv.classList.remove('hidden');
    return;
  }

  resultDiv.innerHTML = matches.map(img => `
        <div onclick="selectImageSuggestion('${img.link}','${img.id}','${img.uploaderID||''}')" class="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition">
            <img src="${img.link}" class="w-10 h-10 rounded bg-slate-100 object-cover border border-slate-200 shrink-0">
            <div class="overflow-hidden">
                <p class="text-xs font-bold text-slate-700 truncate">${img.name}</p>
                <p class="text-[10px] text-slate-400 truncate font-mono">...${img.link.slice(-15)}</p>
            </div>
        </div>
    `).join('');

  resultDiv.classList.remove('hidden');
}

function selectImageSuggestion(link, imageId, uploaderID) {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'Admin';
  const needsPassword = !isAdmin && uploaderID;

  const _doInsert = () => {
    const input = document.getElementById('input-image-ac');
    if (!input) return;
    input.value = link;
    document.getElementById('ac-results').classList.add('hidden');
    input.classList.add('ring-2', 'ring-green-500', 'bg-green-50');
    setTimeout(() => input.classList.remove('ring-2', 'ring-green-500', 'bg-green-50'), 1000);
  };

  if (!needsPassword) { _doInsert(); return; }

  document.getElementById('ac-results').classList.add('hidden');
  _showImagePasswordModal('Konfirmasi Penggunaan Gambar',
    'Gambar ini dilindungi. Masukkan password akun pemilik gambar untuk menggunakannya di soal ini.',
    (pwd, resolve, reject) => {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success) {
            resolve();
            _doInsert();
          } else {
            resolve();
            Swal.fire({ icon: 'error', title: 'Akses Ditolak',
              html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Password salah.'}</p>`,
              confirmButtonColor: '#dc2626', customClass:{ popup:'lp-swal' } });
          }
        })
        .withFailureHandler(err => {
          resolve();
          Swal.fire({ title:'Error Server',
            html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${((err && err.message) || String(err)).replace(/</g,'&lt;')}</p>`,
            icon:'error', confirmButtonColor:'#dc2626', customClass:{ popup:'lp-swal' } });
        })
        .verifyImageAccess(imageId, pwd, currentUser.userID, currentUser.token);
    }
  );
}

// ─── Inline Image Upload di Bank Soal ────────────────────────────────────────
// Menggunakan mekanisme CRUD yang sama persis dengan Halaman Folder Gambar:
// - File validation: JPG/JPEG/PNG, maks 5 MB
// - Backend: google.script.run.uploadImageFile() → sheet Gambar
// - Setelah berhasil: link langsung dimasukkan ke #input-image-ac
// ─────────────────────────────────────────────────────────────────────────────

let _qbImgUploadQueue = [];

function _qbToggleInlineUpload() {
  const panel = document.getElementById('qb-inline-upload-panel');
  if (!panel) return;
  const isHidden = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !isHidden);
  if (isHidden) {
    // Reset antrian setiap kali panel dibuka
    _qbImgUploadQueue = [];
    _qbRenderUploadQueue();
  }
}

function _qbHandleFileSelect(files) {
  _qbAddFilesToQueue(Array.from(files));
  // Reset input agar file yang sama bisa dipilih lagi
  const inp = document.getElementById('qb-img-file-input');
  if (inp) inp.value = '';
}

function _qbHandleImgFileDrop(e) {
  e.preventDefault();
  const area = document.getElementById('qb-upload-drop-area');
  if (area) area.classList.remove('!border-violet-500', '!bg-violet-100');
  _qbAddFilesToQueue(Array.from(e.dataTransfer.files));
}

function _qbAddFilesToQueue(files) {
  const allowed  = ['image/jpeg', 'image/jpg', 'image/png'];
  const MAX_SIZE = 5 * 1024 * 1024;
  const rejected = [];

  files.forEach(f => {
    if (!allowed.includes(String(f.type || '').toLowerCase())) {
      rejected.push(`${f.name} (format tidak didukung)`);
      return;
    }
    if (f.size > MAX_SIZE) {
      rejected.push(`${f.name} (>${(MAX_SIZE / 1024 / 1024).toFixed(0)} MB)`);
      return;
    }
    // Hindari duplikat di antrian
    if (_qbImgUploadQueue.find(q => q.name === f.name && q.size === f.size)) return;
    _qbImgUploadQueue.push({ file: f, name: f.name, size: f.size, status: 'pending', link: null });
  });

  if (rejected.length) {
    Swal.fire({
      title: 'Sebagian File Ditolak',
      html: `<p style="font-size:13px;color:#475569;">${rejected.length} file tidak bisa ditambahkan:</p>
             <ul style="text-align:left;font-size:12px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px 12px;margin-top:8px;list-style:disc;padding-left:24px;">
               ${rejected.map(r => `<li>${r.replace(/</g,'&lt;')}</li>`).join('')}
             </ul>`,
      icon: 'warning', confirmButtonColor: '#7c3aed',
      customClass: { popup: 'lp-swal' }
    });
  }

  _qbRenderUploadQueue();
}

function _qbRenderUploadQueue() {
  const container = document.getElementById('qb-upload-queue');
  const actions   = document.getElementById('qb-upload-actions');
  if (!container) return;

  if (_qbImgUploadQueue.length === 0) {
    container.classList.add('hidden');
    if (actions) actions.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  if (actions) actions.classList.remove('hidden');

  const iconMap = {
    pending:   { ico: 'fa-clock',            cls: 'text-slate-400' },
    uploading: { ico: 'fa-circle-notch fa-spin', cls: 'text-violet-500' },
    done:      { ico: 'fa-check-circle',     cls: 'text-emerald-500' },
    error:     { ico: 'fa-circle-exclamation', cls: 'text-red-500' }
  };

  container.innerHTML = _qbImgUploadQueue.map((item, i) => {
    const ic = iconMap[item.status] || iconMap.pending;
    return `
      <div class="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-sm">
        <i class="fas ${ic.ico} ${ic.cls} shrink-0 w-4 text-center"></i>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-slate-700 truncate">${String(item.name).replace(/</g,'&lt;')}</span>
            <span class="text-[10px] text-slate-400 shrink-0">${(item.size/1024).toFixed(1)} KB</span>
            ${item.status === 'pending'
              ? `<button type="button" class="text-slate-400 hover:text-red-500 transition shrink-0" onclick="_qbRemoveFromQueue(${i})" aria-label="Hapus"><i class="fas fa-times text-xs"></i></button>`
              : ''}
          </div>
          ${item.status === 'error' ? `<div class="text-[11px] text-red-500 mt-0.5">${(item.error || 'Gagal').replace(/</g,'&lt;')}</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function _qbRemoveFromQueue(idx) {
  _qbImgUploadQueue.splice(idx, 1);
  _qbRenderUploadQueue();
}

function _qbClearUploadQueue() {
  if (_qbImgUploadQueue.some(q => q.status === 'uploading')) {
    Swal.fire({
      title: 'Sedang Mengupload',
      html: '<p style="font-size:13px;color:#475569;">Tunggu sampai upload selesai sebelum membersihkan antrian.</p>',
      icon: 'info', confirmButtonColor: '#7c3aed',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }
  _qbImgUploadQueue = [];
  _qbRenderUploadQueue();
}

function _qbStartUpload() {
  const pending = _qbImgUploadQueue.filter(q => q.status === 'pending');
  if (!pending.length) {
    Swal.fire({
      title: 'Tidak Ada File',
      html: '<p style="font-size:13px;color:#475569;">Tidak ada file yang menunggu untuk diupload.</p>',
      icon: 'info', confirmButtonColor: '#7c3aed',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }

  const btn = document.getElementById('btn-qb-start-upload');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...'; }

  _qbUploadNext();
}

function _qbUploadNext() {
  const idx = _qbImgUploadQueue.findIndex(q => q.status === 'pending');

  if (idx < 0) {
    // Semua selesai
    const btn = document.getElementById('btn-qb-start-upload');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Upload'; }

    const doneItems  = _qbImgUploadQueue.filter(q => q.status === 'done');
    const errorItems = _qbImgUploadQueue.filter(q => q.status === 'error');

    if (doneItems.length > 0) {
      // Sinkronkan allImagesData agar modal Pilih Gambar langsung mengenali gambar baru
      doneItems.forEach(item => {
        if (!allImagesData) allImagesData = [];
        const newEntry = {
          id:         item.resultId  || '',
          name:       item.name,
          link:       item.link,
          uploaderID: (currentUser && currentUser.userID) || ''
        };
        // Sisipkan di depan (newest-first, konsisten dengan getSavedImages().reverse())
        allImagesData.unshift(newEntry);
        // Jika modal Pilih Gambar sedang terbuka, tambahkan item baru di paling atas daftar
        _qbInjectIntoPickerModal(newEntry);
      });

      // Bersihkan item done dari antrian
      _qbImgUploadQueue = _qbImgUploadQueue.filter(q => q.status !== 'done');
      _qbRenderUploadQueue();

      // Tutup panel jika tidak ada error
      if (errorItems.length === 0) {
        setTimeout(() => {
          const panel = document.getElementById('qb-inline-upload-panel');
          if (panel) panel.classList.add('hidden');
        }, 300);
      }
    }

    // Tampilkan modal ringkasan (berhasil + gagal beserta alasan)
    _showUploadSummaryModal(doneItems, errorItems);
    return;
  }

  _qbImgUploadQueue[idx].status = 'uploading';
  _qbRenderUploadQueue();

  const item   = _qbImgUploadQueue[idx];
  const reader = new FileReader();

  reader.onload = function(e) {
    const base64Full = e.target.result;
    const commaIdx   = String(base64Full).indexOf(',');
    const base64Data = commaIdx >= 0 ? base64Full.substring(commaIdx + 1) : base64Full;

    google.script.run
      .withSuccessHandler(res => {
        if (_qbImgUploadQueue[idx]) {
          if (res && res.success) {
            _qbImgUploadQueue[idx].status   = 'done';
            _qbImgUploadQueue[idx].link     = res.link;
            _qbImgUploadQueue[idx].resultId = res.id;
          } else {
            _qbImgUploadQueue[idx].status = 'error';
            _qbImgUploadQueue[idx].error  = (res && res.message) || 'Gagal';
          }
        }
        _qbRenderUploadQueue();
        _qbUploadNext();
      })
      .withFailureHandler(err => {
        if (_qbImgUploadQueue[idx]) {
          _qbImgUploadQueue[idx].status = 'error';
          _qbImgUploadQueue[idx].error  = (err && err.message) || String(err) || 'Error server';
        }
        _qbRenderUploadQueue();
        _qbUploadNext();
      })
      .uploadImageFile(base64Data, item.name, item.file.type, currentUser.userID, currentUser.token);
  };

  reader.onerror = function() {
    if (_qbImgUploadQueue[idx]) {
      _qbImgUploadQueue[idx].status = 'error';
      _qbImgUploadQueue[idx].error  = 'Gagal membaca file';
    }
    _qbRenderUploadQueue();
    _qbUploadNext();
  };

  reader.readAsDataURL(item.file);
}
// ─── End Inline Image Upload di Bank Soal ────────────────────────────────────

// Sisipkan satu item gambar baru ke img-picker-list jika modal sedang terbuka,
// tanpa menutup atau me-render ulang seluruh modal.
function _qbInjectIntoPickerModal(img) {
  const list = document.getElementById('img-picker-list');
  if (!list) return;

  // Hapus pesan "kosong" jika ada
  const emptyMsg = list.querySelector('p.text-center');
  if (emptyMsg) emptyMsg.remove();

  const item = document.createElement('div');
  item.className = 'img-picker-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition';
  item.dataset.name     = String(img.name || '').toLowerCase();
  item.dataset.link     = img.link;
  item.dataset.id       = img.id;
  item.dataset.uploader = img.uploaderID || '';
  item.setAttribute('onclick', '_selectImgPickerItem(this)');
  item.innerHTML = `
    <img src="${img.link}" referrerpolicy="no-referrer"
         class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100">
    <div class="overflow-hidden">
      <p class="text-xs font-bold text-slate-700 truncate">${String(img.name || '').replace(/</g,'&lt;')}</p>
      <p class="text-[10px] text-slate-400 truncate font-mono">...${img.link.slice(-18)}</p>
    </div>`;

  // Sisipkan di paling atas daftar (newest-first)
  list.insertBefore(item, list.firstChild);

  // Soroti item baru sebentar agar pengguna tahu gambar mana yang baru
  item.classList.add('ring-2', 'ring-violet-400', 'bg-violet-50');
  setTimeout(() => item.classList.remove('ring-2', 'ring-violet-400', 'bg-violet-50'), 1500);
}

/**
 * _showUploadSummaryModal(doneItems, errorItems)
 * Modal ringkasan hasil upload gambar — dipakai bersama oleh Folder Gambar
 * dan fitur upload inline di Bank Soal.
 *
 * @param {Array} doneItems  — array item dengan { name }
 * @param {Array} errorItems — array item dengan { name, error }
 */
function _showUploadSummaryModal(doneItems, errorItems) {
  const total  = doneItems.length + errorItems.length;
  const allOk  = errorItems.length === 0;
  const allFail = doneItems.length === 0;

  const icon  = allOk ? 'success' : (allFail ? 'error' : 'warning');
  const color = allOk ? '#059669'  : (allFail ? '#dc2626' : '#d97706');
  const title = allOk
    ? `${doneItems.length} Gambar Berhasil Diupload`
    : (allFail
        ? 'Semua Upload Gagal'
        : `${doneItems.length} Berhasil, ${errorItems.length} Gagal`);

  let html = '';

  if (doneItems.length > 0) {
    html += `
      <div class="text-left mb-3">
        <p class="text-xs font-bold text-emerald-700 uppercase mb-1.5 flex items-center gap-1">
          <i class="fas fa-check-circle"></i> Berhasil (${doneItems.length})
        </p>
        <ul class="space-y-1 max-h-36 overflow-y-auto pr-1">
          ${doneItems.map(i => `
            <li class="flex items-center gap-2 text-xs text-slate-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5">
              <i class="fas fa-image text-emerald-400 shrink-0"></i>
              <span class="truncate">${String(i.name).replace(/</g,'&lt;')}</span>
            </li>`).join('')}
        </ul>
      </div>`;
  }

  if (errorItems.length > 0) {
    html += `
      <div class="text-left">
        <p class="text-xs font-bold text-red-700 uppercase mb-1.5 flex items-center gap-1">
          <i class="fas fa-times-circle"></i> Gagal (${errorItems.length})
        </p>
        <ul class="space-y-1 max-h-48 overflow-y-auto pr-1">
          ${errorItems.map(i => `
            <li class="text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
              <div class="flex items-center gap-2 font-bold text-slate-700">
                <i class="fas fa-file-image text-red-400 shrink-0"></i>
                <span class="truncate">${String(i.name).replace(/</g,'&lt;')}</span>
              </div>
              <div class="text-red-600 mt-0.5 pl-5">${String(i.error || 'Gagal').replace(/</g,'&lt;')}</div>
            </li>`).join('')}
        </ul>
      </div>`;
  }

  Swal.fire({
    icon,
    title,
    html: `<div style="font-size:13px;">${html}</div>`,
    confirmButtonColor: color,
    confirmButtonText: 'Oke',
    customClass: { popup: 'lp-swal' }
  });
}

function loadQuestionsTable(examId) {
  if (!examId) return;
  // BUG FIX: resetQuestionForm + input-exam-id mungkin belum ada di DOM jika
  // fungsi ini dipanggil sebelum renderQuestionBank selesai. Wrap dengan try-catch.
  try {
    if (typeof resetQuestionForm === 'function') resetQuestionForm();
  } catch(e) {}
  const _examIdEl = document.getElementById('input-exam-id');
  if (_examIdEl) _examIdEl.value = examId;

  const container = document.getElementById('q-table-container');
  if (!container) return;
  container.className = 'w-full mt-4 transition-all duration-300';

  // Skeleton loader — representasi proporsional dari layout tabel
  container.innerHTML = `
    <div class="space-y-3">
      <!-- Status panel skeleton -->
      <div class="bg-white rounded-xl border border-purple-100 overflow-hidden">
        <div class="px-4 py-3 bg-purple-50/60 border-b border-purple-100">
          <div class="qb-skeleton h-4 w-48 rounded-full"></div>
        </div>
        <div class="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          ${[1,2,3,4,5].map(() => `<div class="qb-skeleton h-20 rounded-xl"></div>`).join('')}
        </div>
      </div>
      <!-- Control bar skeleton -->
      <div class="qb-skeleton h-12 w-full rounded-xl"></div>
      <!-- Table skeleton -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="qb-skeleton h-10 w-full" style="border-radius:0;"></div>
        ${[1,2,3,4,5].map(() => `<div class="border-b border-slate-100 px-4 py-3 flex gap-3 items-center">
          <div class="qb-skeleton w-4 h-4 rounded flex-shrink-0"></div>
          <div class="qb-skeleton w-6 h-4 rounded flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="qb-skeleton h-4 w-full max-w-sm rounded-full"></div>
            <div class="qb-skeleton h-3 w-32 rounded-full"></div>
          </div>
          <div class="qb-skeleton w-20 h-8 rounded-lg flex-shrink-0"></div>
        </div>`).join('')}
      </div>
      <!-- Pagination skeleton -->
      <div class="qb-skeleton h-11 w-full rounded-xl"></div>
    </div>`;

  google.script.run
    .withSuccessHandler(result => {
      const qs = Array.isArray(result) ? result : (result.questions || []);
      currentExamTypeConfig = Array.isArray(result) ? null : (result.typeConfig || null);

      allQuestionsData = qs;
      window.allQuestionsData = qs;
      filteredQuestions = qs;
      currentQPage = 1;
      _activeTypeFilter = null;

      updateTypeDropdownForExam(currentExamTypeConfig);

      // ── Empty state ──
      if (qs.length === 0) {
        const tcPanel = buildTypeConfigStatusPanel(currentExamTypeConfig, []);
        container.innerHTML = `
          <div class="space-y-4 fade-in">
            ${tcPanel}
            <div class="qb-empty">
              <div class="qb-empty-icon"><i class="fas fa-folder-open"></i></div>
              <h3 class="text-slate-700 font-bold text-base">Belum Ada Soal</h3>
              <p class="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Bank soal untuk ujian ini masih kosong.</p>
              <div class="flex flex-wrap gap-2 justify-center mt-5">
                <button onclick="_qbShowForm('manual')"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition active:scale-95">
                  <i class="fas fa-plus"></i> Tambah Manual
                </button>
                <button onclick="_qbShowForm('excel')"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow transition active:scale-95">
                  <i class="fas fa-file-excel"></i> Import Excel
                </button>
                <button onclick="_qbShowForm('batch')"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow transition active:scale-95">
                  <i class="fas fa-layer-group"></i> Input Batch
                </button>
              </div>
            </div>
          </div>`;
        return;
      }

      // ── Tabel utama ──
      const tcPanel = buildTypeConfigStatusPanel(currentExamTypeConfig, qs);
      container.innerHTML = `
        <div class="space-y-3 fade-in">
          ${tcPanel}

          <!-- Control bar: show rows + search + filter tipe + preview -->
          <div class="qb-control-bar">
            <!-- Kiri: Tampilkan N soal -->
            <div class="flex items-center gap-2 text-sm text-slate-600 flex-shrink-0">
              <span class="text-xs font-semibold text-slate-500 hidden sm:inline">Tampilkan</span>
              <select onchange="changeQRowsPerPage(this.value)"
                class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">Semua</option>
              </select>
              <span class="text-xs font-semibold text-slate-500 hidden sm:inline">soal</span>
            </div>

            <!-- Tengah/Kanan: Filter tipe + search + preview -->
            <div class="flex items-center gap-2 flex-1 min-w-0 flex-wrap sm:flex-nowrap justify-end">
              <!-- Filter tipe dropdown — tampil hanya jika ada data -->
              <select id="q-type-filter-select" onchange="_qbFilterBySelectType(this.value)"
                class="flex-shrink-0 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                title="Filter berdasarkan tipe soal">
                <option value="">Semua Tipe</option>
                <option value="PG">Pilihan Ganda</option>
                <option value="PG_KOMPLEKS">PG Kompleks</option>
                <option value="BS">Benar/Salah</option>
                <option value="JODOH">Menjodohkan</option>
                <option value="Esai">Esai</option>
              </select>

              <div class="qb-search-wrap flex-1 min-w-0" style="min-width:120px;">
                <i class="fas fa-search"></i>
                <input type="text" id="question-search-input"
                  oninput="handleQuestionSearch(this.value)"
                  placeholder="Cari soal..."
                  autocomplete="off">
              </div>
              <button onclick="previewAllQuestions()"
                class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold shadow transition active:scale-95"
                title="Preview semua soal">
                <i class="fas fa-eye"></i>
                <span class="hidden sm:inline">Preview</span>
              </button>
            </div>
          </div>

          <!-- Tabel -->
          <div class="qb-table-wrap">
            <!-- Bulk action bar -->
            <div id="bulk-action-bar" class="qb-bulk-bar">
              <div class="flex items-center gap-3 min-w-0">
                <i class="fas fa-check-square text-red-400"></i>
                <span class="text-sm font-bold text-red-700 whitespace-nowrap"><span id="bulk-count">0</span> soal dipilih</span>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="cancelBulkSelect()"
                  class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition font-semibold border border-slate-200 flex items-center gap-1">
                  <i class="fas fa-times"></i> Batal
                </button>
                <button onclick="bulkDeleteQuestions()"
                  class="px-4 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-lg transition font-bold shadow-sm flex items-center gap-1.5">
                  <i class="fas fa-trash-alt"></i> Hapus Dipilih
                </button>
              </div>
            </div>

            <!-- Table scroll wrapper -->
            <div class="qb-table-outer">
              <table class="qb-table">
                <thead>
                  <tr>
                    <th class="text-center w-10 px-3">
                      <input type="checkbox" id="check-all-q"
                        onchange="toggleAllQCheckboxes(this.checked)"
                        class="w-4 h-4 rounded border-slate-300 cursor-pointer accent-red-500"
                        title="Pilih Semua">
                    </th>
                    <th class="text-center w-9 px-2">#</th>
                    <th class="px-3">Soal &amp; Metadata</th>
                    <th class="px-3 qb-col-key" style="width:22%;">Kunci Jawaban</th>
                    <th class="px-3 text-right" style="width:90px;">Aksi</th>
                  </tr>
                </thead>
                <tbody id="q-table-body" class="divide-y divide-slate-100 bg-white">
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination -->
          <div class="qb-pagination" id="q-pagination-controls">
            <span class="qb-pagination-info" id="q-pagination-info">Memuat...</span>
            <div class="flex items-center gap-2">
              <button onclick="changeQPage('prev')" id="btn-q-prev" class="qb-page-btn">
                <i class="fas fa-chevron-left text-[10px]"></i>
                <span class="hidden sm:inline">Sebelumnya</span>
              </button>
              <span id="q-page-indicator" class="text-xs font-bold text-slate-500 px-1 whitespace-nowrap">1 / 1</span>
              <button onclick="changeQPage('next')" id="btn-q-next" class="qb-page-btn">
                <span class="hidden sm:inline">Berikutnya</span>
                <i class="fas fa-chevron-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>`;

      renderQuestionsInternal();
    })
    .withFailureHandler(err => {
      container.innerHTML = `
        <div class="bg-white border border-red-200 rounded-xl p-10 text-center">
          <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400 text-2xl">
            <i class="fas fa-circle-exclamation"></i>
          </div>
          <h3 class="font-bold text-red-700 text-base">Gagal Memuat Soal</h3>
          <p class="text-slate-500 text-sm mt-1 max-w-xs mx-auto">${(err && err.message) || 'Terjadi kesalahan saat mengambil data.'}</p>
          <button onclick="loadQuestionsTable('${examId}')"
            class="mt-4 px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow transition active:scale-95">
            <i class="fas fa-rotate-right mr-1"></i> Coba Lagi
          </button>
        </div>`;
    })
    .getQuestionsByExam(examId, currentUser.userID, currentUser.token);
}

function buildTypeConfigStatusPanel(tc, questions) {
  if (!tc) return '';

  const typeMeta = {
    PG:          { label: 'Pilihan Ganda',  icon: 'fa-list-ul',    color: 'blue'   },
    PG_KOMPLEKS: { label: 'PG Kompleks',    icon: 'fa-list-check', color: 'indigo' },
    BS:          { label: 'Benar/Salah',    icon: 'fa-check-double', color: 'orange' },
    JODOH:       { label: 'Menjodohkan',    icon: 'fa-link',       color: 'teal'   },
    Esai:        { label: 'Esai',           icon: 'fa-pen-nib',    color: 'rose'   }
  };

  const colorMap = {
    blue:   { bg:'bg-blue-50',   border:'border-blue-200',   text:'text-blue-700',   bar:'bg-blue-500',   iconBg:'bg-blue-100'   },
    indigo: { bg:'bg-indigo-50', border:'border-indigo-200', text:'text-indigo-700', bar:'bg-indigo-500', iconBg:'bg-indigo-100' },
    orange: { bg:'bg-orange-50', border:'border-orange-200', text:'text-orange-700', bar:'bg-orange-500', iconBg:'bg-orange-100' },
    teal:   { bg:'bg-teal-50',   border:'border-teal-200',   text:'text-teal-700',   bar:'bg-teal-500',   iconBg:'bg-teal-100'   },
    rose:   { bg:'bg-rose-50',   border:'border-rose-200',   text:'text-rose-700',   bar:'bg-rose-500',   iconBg:'bg-rose-100'   }
  };

  const countByType = { PG:0, PG_KOMPLEKS:0, BS:0, JODOH:0, Esai:0 };
  (questions || []).forEach(q => {
    if (countByType.hasOwnProperty(q.type)) countByType[q.type]++;
  });

  const cards = Object.entries(typeMeta).map(([key, meta]) => {
    const cfg     = tc[key] || { enabled: true, max: 0 };
    const enabled = cfg.enabled !== false;
    const max     = parseInt(cfg.max) || 0;
    const current = countByType[key] || 0;
    const c       = colorMap[meta.color];

    if (!enabled) {
      return `
        <div id="type-card-${key}"
             class="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/60 opacity-60 cursor-not-allowed"
             title="Tipe ini tidak diizinkan admin">
          <div class="flex items-center gap-2 min-w-0">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 shrink-0">
              <i class="fas ${meta.icon} text-slate-400 text-xs"></i>
            </span>
            <span class="text-xs font-bold text-slate-400 truncate flex-1 min-w-0">${meta.label}</span>
          </div>
          <div class="flex items-center justify-between gap-1 flex-wrap">
            <span class="text-xl font-black text-slate-300 leading-none">—</span>
            <span class="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap shrink-0">
              <i class="fas fa-ban mr-1" style="font-size:7px"></i>DIBLOKIR
            </span>
          </div>
          <div class="text-[10px] text-slate-400 font-medium">Tidak boleh dibuat</div>
        </div>`;
    }

    const pct    = (max > 0) ? Math.min(Math.round((current / max) * 100), 100) : -1;
    const isOver = (max > 0 && current >= max);
    const isWarn = (!isOver && max > 0 && pct >= 80);

    // Badge — rendered on its own row, no ml-auto fights
    const badgeHtml = isOver
      ? `<span class="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 whitespace-nowrap shrink-0"><i class="fas fa-lock mr-1" style="font-size:7px"></i>PENUH</span>`
      : isWarn
        ? `<span class="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap shrink-0"><i class="fas fa-triangle-exclamation mr-1" style="font-size:7px"></i>HAMPIR</span>`
        : (max > 0
            ? `<span class="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border} whitespace-nowrap shrink-0">${current}/${max}</span>`
            : `<span class="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap shrink-0"><i class="fas fa-infinity mr-1" style="font-size:7px"></i>BEBAS</span>`);

    const optCountInfo = (cfg.optCount && (key === 'PG' || key === 'PG_KOMPLEKS'))
      ? `<div class="text-[9px] text-slate-400 font-medium flex items-center gap-1"><i class="fas fa-th-list text-[8px]"></i>${cfg.optCount} opsi</div>`
      : '';

    const barHtml = (max > 0) ? `
      <div class="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div class="${isOver ? 'bg-red-500' : isWarn ? 'bg-amber-400' : c.bar} h-full rounded-full transition-all duration-500" style="width:${pct}%"></div>
      </div>` : '';

    return `
      <div id="type-card-${key}"
           onclick="filterByTypeCard('${key}')"
           class="flex flex-col gap-2 p-3 rounded-xl border ${c.border} ${c.bg} cursor-pointer select-none transition-all duration-150 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
           title="${meta.label}: ${current} soal${max > 0 ? ' dari maks. '+max : ' (tidak dibatasi)'} — Klik untuk filter">
        <!-- Baris 1: ikon + label (tidak bersaing dengan badge) -->
        <div class="flex items-center gap-2 min-w-0">
          <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg ${c.iconBg} shrink-0">
            <i class="fas ${meta.icon} ${c.text} text-xs"></i>
          </span>
          <span class="text-xs font-bold text-slate-600 truncate flex-1 min-w-0">${meta.label}</span>
        </div>
        <!-- Baris 2: angka besar + badge (flex-wrap aman) -->
        <div class="flex items-end justify-between gap-1 flex-wrap min-w-0">
          <div class="flex items-baseline gap-1 min-w-0">
            <span class="text-2xl font-black leading-none ${isOver ? 'text-red-600' : c.text}">${current}</span>
            ${max > 0 ? `<span class="text-[10px] text-slate-400 font-medium whitespace-nowrap">/ ${max}</span>` : `<span class="text-[10px] text-slate-400 font-medium">soal</span>`}
          </div>
          ${badgeHtml}
        </div>
        <!-- Baris 3: progress bar -->
        ${barHtml}
        <!-- Baris 4: info tambahan -->
        <div class="flex items-center justify-between gap-1 flex-wrap min-w-0">
          ${optCountInfo}
          <div class="text-[9px] text-slate-400 font-medium flex items-center gap-1 ml-auto shrink-0">
            <i class="fas fa-filter text-[8px]"></i>Filter
          </div>
        </div>
      </div>`;
  }).join('');

  // Cek apakah semua tipe yang enabled=true dan max>0 sudah penuh
  // Tipe dengan max=0 (BEBAS) atau enabled=false diabaikan dari pengecekan
  const enabledWithMax = Object.entries(tc).filter(([key, cfg]) => {
    const enabled = cfg.enabled !== false;
    const max = parseInt(cfg.max) || 0;
    return enabled && max > 0;
  });
  const allTypesFull = enabledWithMax.length > 0 && enabledWithMax.every(([key]) => {
    return (countByType[key] || 0) >= (parseInt(tc[key].max) || 0);
  });

  return `
    <div class="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-purple-100 bg-purple-50/60 flex items-center gap-2 flex-wrap">
        <i class="fas fa-chart-bar text-purple-500 text-sm"></i>
        <span class="text-xs font-bold text-slate-600 uppercase tracking-wide">Status Progress Soal per Tipe</span>
        <span id="type-filter-badge" class="hidden ml-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 animate-pulse">
          <i class="fas fa-filter text-[9px]"></i> Filter Aktif
        </span>
        <span class="ml-auto text-[10px] text-slate-400 font-medium">Dikonfigurasi oleh Admin</span>
      </div>
      <div class="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        ${cards}
      </div>
      ${allTypesFull ? `
      <div class="px-4 py-3 border-t border-green-200 bg-green-50/70 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 shrink-0">
            <i class="fas fa-check-circle text-green-600 text-sm"></i>
          </span>
          <div class="min-w-0">
            <p class="text-xs font-bold text-green-800">Semua Kuota Soal Terpenuhi!</p>
            <p class="text-[11px] text-green-600 mt-0.5">Seluruh tipe soal yang diizinkan sudah mencapai jumlah maksimal. Lembar soal siap diunduh.</p>
          </div>
        </div>
        <button
          onclick="downloadLembarSoalPDF()"
          id="btn-download-lembar-soal"
          class="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-bold rounded-xl shadow-md transition-all duration-150 active:scale-95 whitespace-nowrap">
          <i class="fas fa-file-pdf text-base"></i>
          <span>Download PDF Lembar Soal</span>
        </button>
      </div>` : ''}
    </div>`;
}

/**
 * Dipanggil oleh tombol "Download PDF Lembar Soal" di panel status tipe soal.
 * Mengambil examId yang aktif, lalu memanggil backend generateLembarSoalPDF().
 */
function downloadLembarSoalPDF() {
  const examId = document.getElementById('input-exam-id')
    ? document.getElementById('input-exam-id').value
    : (document.getElementById('select-exam-q') ? document.getElementById('select-exam-q').value : '');

  if (!examId) {
    Swal.fire({
      icon: 'warning',
      title: 'Mata Pelajaran Belum Dipilih',
      text: 'Silakan pilih mata pelajaran terlebih dahulu.',
      confirmButtonColor: '#16a34a'
    });
    return;
  }

  const btn = document.getElementById('btn-download-lembar-soal');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Memproses PDF...</span>';
  }

  Swal.fire({
    title: 'Membuat Lembar Soal PDF...',
    html: '<p class="text-sm text-slate-500 mt-1">Harap tunggu, sedang memproses gambar dan konten soal.</p>',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  google.script.run
    .withSuccessHandler(function(res) {
      if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }

      if (res && res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Lembar Soal Siap!',
          html: `<p class="text-sm text-slate-600 mt-1">PDF berhasil dibuat. Klik tombol di bawah untuk mengunduh.</p>`,
          confirmButtonText: '<i class="fas fa-download mr-2"></i> Unduh PDF',
          confirmButtonColor: '#16a34a',
          showCancelButton: true,
          cancelButtonText: 'Tutup'
        }).then(function(r) {
          if (r.isConfirmed) {
            // Coba buka di tab baru; fallback ke anchor download jika diblokir
            const opened = window.open(res.url, '_blank');
            if (!opened || opened.closed || typeof opened.closed === 'undefined') {
              // Popup diblokir — pakai anchor element sebagai fallback
              const a = document.createElement('a');
              a.href = res.downloadUrl || res.url;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          }
        });
      } else {
        Swal.fire('Gagal', (res && res.message) || 'Terjadi kesalahan saat membuat PDF.', 'error');
      }
    })
    .withFailureHandler(function(err) {
      if (btn) { btn.disabled = false; btn.innerHTML = origHtml; }
      Swal.fire('Error', (err && err.message) || 'Terjadi kesalahan sistem.', 'error');
    })
    .generateLembarSoalPDF(examId, currentUser.userID, currentUser.token);
}

function updateTypeDropdownForExam(tc) {
  const select = document.getElementById('q-type-select');
  if (!select) return;

  const allTypes = [
    { value: 'PG',          label: 'Pilihan Ganda'     },
    { value: 'PG_KOMPLEKS', label: 'Pilihan Ganda Kompleks' },
    { value: 'BS',          label: 'Benar/Salah (AKM)' },
    { value: 'JODOH',       label: 'Menjodohkan'       },
    { value: 'Esai',        label: 'Esai'              }
  ];

  const countByType = { PG:0, PG_KOMPLEKS:0, BS:0, JODOH:0, Esai:0 };
  (allQuestionsData || []).forEach(q => {
    if (countByType.hasOwnProperty(q.type)) countByType[q.type]++;
  });

  select.innerHTML = '';

  const placeholderOpt = document.createElement('option');
  placeholderOpt.value = '';
  placeholderOpt.textContent = '-- Pilih Tipe Soal --';
  placeholderOpt.disabled = true;
  select.appendChild(placeholderOpt);

  let firstEnabled = null;

  allTypes.forEach(t => {
    const opt    = document.createElement('option');
    opt.value    = t.value;

    if (!tc) {
      opt.textContent = t.label;
      opt.disabled = false;
    } else {
      const cfg     = tc[t.value] || { enabled: true, max: 0 };
      const enabled = cfg.enabled !== false;
      const max     = parseInt(cfg.max) || 0;
      const current = countByType[t.value] || 0;
      const isFull  = (max > 0 && current >= max);

      if (!enabled) {
        opt.textContent = `${t.label} ✗ (Diblokir Admin)`;
        opt.disabled = true;
        opt.style.color = '#94a3b8';
      } else if (isFull) {
        opt.textContent = `${t.label} — PENUH (${current}/${max})`;
        opt.disabled = true;
        opt.style.color = '#ef4444';
      } else if (max > 0) {
        opt.textContent = `${t.label} (${current}/${max})`;
        opt.disabled = false;
      } else {
        opt.textContent = t.label;
        opt.disabled = false;
      }
    }

    if (!opt.disabled && !firstEnabled) firstEnabled = t.value;
    select.appendChild(opt);
  });

  if (firstEnabled) {
    select.value = firstEnabled;
    toggleOptionsInput(firstEnabled);
  }
}

function toggleTypeMaxInput(type, enabled) {
  const row    = document.getElementById('typerow-' + type);
  const maxEl  = document.getElementById('typeconfig-max-' + type);
  const optEl  = document.getElementById('typeconfig-optcount-' + type);
  const optWrapper = document.getElementById('typeconfig-optcount-wrapper-' + type);
  if (!row || !maxEl) return;

  if (enabled) {
    row.classList.remove('opacity-40');
    maxEl.disabled = false;
    maxEl.classList.remove('bg-slate-100', 'text-slate-300', 'cursor-not-allowed');
    maxEl.classList.add('bg-white');
    if (optEl) {
      optEl.disabled = false;
      optEl.classList.remove('bg-slate-100', 'text-slate-300', 'cursor-not-allowed');
      optEl.classList.add('bg-white');
    }
    if (optWrapper) optWrapper.classList.remove('opacity-40');
  } else {
    row.classList.add('opacity-40');
    maxEl.disabled = true;
    maxEl.value = 0;
    maxEl.classList.add('bg-slate-100', 'text-slate-300', 'cursor-not-allowed');
    maxEl.classList.remove('bg-white');
    if (optEl) {
      optEl.disabled = true;
      optEl.classList.add('bg-slate-100', 'text-slate-300', 'cursor-not-allowed');
      optEl.classList.remove('bg-white');
    }
    if (optWrapper) optWrapper.classList.add('opacity-40');
  }
}

function validateTypeConfigBeforeAdd(selectedType) {
  if (!currentExamTypeConfig) return null; 

  const cfg = currentExamTypeConfig[selectedType];
  if (!cfg) return null;

  if (cfg.enabled === false) {
    const labels = { PG:'Pilihan Ganda', PG_KOMPLEKS:'PG Kompleks', BS:'Benar/Salah', JODOH:'Menjodohkan', Esai:'Esai' };
    return `Tipe soal <b>${labels[selectedType] || selectedType}</b> tidak diizinkan oleh Admin untuk ujian ini.`;
  }

  const max = parseInt(cfg.max) || 0;
  if (max <= 0) return null; 

  const current = (allQuestionsData || []).filter(q => q.type === selectedType).length;
  if (current >= max) {
    const labels = { PG:'Pilihan Ganda', PG_KOMPLEKS:'PG Kompleks', BS:'Benar/Salah', JODOH:'Menjodohkan', Esai:'Esai' };
    return `Batas maksimal soal tipe <b>${labels[selectedType] || selectedType}</b> sudah tercapai (<b>${current}/${max}</b>).<br>Hapus beberapa soal terlebih dahulu jika ingin menambah.`;
  }

  return null;
}

function filterQuestionsForTypeConfig(questionsArr) {
  if (!currentExamTypeConfig) return { allowed: questionsArr, blocked: [] };

  const labels = { PG:'Pilihan Ganda', PG_KOMPLEKS:'PG Kompleks', BS:'Benar/Salah', JODOH:'Menjodohkan', Esai:'Esai' };

  const existingCount = { PG:0, PG_KOMPLEKS:0, BS:0, JODOH:0, Esai:0 };
  (allQuestionsData || []).forEach(q => {
    if (existingCount.hasOwnProperty(q.type)) existingCount[q.type]++;
  });

  const incoming = { PG:0, PG_KOMPLEKS:0, BS:0, JODOH:0, Esai:0 };
  questionsArr.forEach(q => {
    if (incoming.hasOwnProperty(q.type)) incoming[q.type]++;
  });

  const blocked = [];

  Object.keys(incoming).forEach(type => {
    if (incoming[type] === 0) return;
    const cfg = currentExamTypeConfig[type] || { enabled: true, max: 0 };
    const label = labels[type] || type;

    if (cfg.enabled === false) {
      blocked.push(`Tipe <b>${label}</b>: tidak diizinkan Admin (${incoming[type]} soal ditolak)`);
      return;
    }

    const max     = parseInt(cfg.max) || 0;
    const current = existingCount[type] || 0;
    if (max > 0) {
      const sisa = max - current;
      if (sisa <= 0) {
        blocked.push(`Tipe <b>${label}</b>: sudah penuh (${current}/${max}), ${incoming[type]} soal ditolak`);
      } else if (incoming[type] > sisa) {
        blocked.push(`Tipe <b>${label}</b>: hanya tersisa <b>${sisa}</b> slot, namun Anda coba memasukkan <b>${incoming[type]}</b> soal`);
      }
    }
  });

  const allowed = blocked.length === 0 ? questionsArr : [];
  return { allowed, blocked };
}

function renderQuestionsInternal() {
  // FIX: Fungsi tidak menerima parameter — semua state diambil dari variabel global
  // (filteredQuestions, currentQPage, qRowsPerPage). Parameter yang sebelumnya dikirim
  // dari caller (examId) tidak diperlukan karena tidak dipakai di dalam fungsi ini.
  const tbody = document.getElementById('q-table-body');
  const infoDisplay = document.getElementById('q-pagination-info');
  const btnPrev = document.getElementById('btn-q-prev');
  const btnNext = document.getElementById('btn-q-next');

  if (filteredQuestions.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center">
      <div class="flex flex-col items-center gap-3">
        <span class="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl text-slate-300"><i class="fas fa-search"></i></span>
        <p class="text-slate-500 font-semibold text-sm">Tidak ada soal yang cocok.</p>
        <p class="text-slate-400 text-xs">Coba ubah kata kunci pencarian atau filter tipe.</p>
      </div>
    </td></tr>`;
    if (infoDisplay) infoDisplay.textContent = 'Menampilkan 0 data';
    const pageInd = document.getElementById('q-page-indicator');
    if (pageInd) pageInd.textContent = '0 / 0';
    if (btnPrev) { btnPrev.disabled = true; btnPrev.classList.add('opacity-50','cursor-not-allowed'); }
    if (btnNext) { btnNext.disabled = true; btnNext.classList.add('opacity-50','cursor-not-allowed'); }
    return;
  }

  const totalData = filteredQuestions.length;
  const maxPage = Math.ceil(totalData / qRowsPerPage);
  if (currentQPage > maxPage) currentQPage = maxPage;
  if (currentQPage < 1) currentQPage = 1;

  const startIndex = (currentQPage - 1) * qRowsPerPage;
  const endIndex = Math.min(startIndex + qRowsPerPage, totalData);
  const pageData = filteredQuestions.slice(startIndex, endIndex);

  // Peta tipe ke badge config
  const typeMap = {
    PG:          { label:'PG',     shortLabel:'PG',    icon:'fa-list-ul',     cls:'bg-blue-50 text-blue-700 border-blue-200' },
    PG_KOMPLEKS: { label:'PG Kom', shortLabel:'PGK',   icon:'fa-list-check',  cls:'bg-indigo-50 text-indigo-700 border-indigo-200' },
    Esai:        { label:'Esai',   shortLabel:'ESA',   icon:'fa-pen-nib',     cls:'bg-purple-50 text-purple-700 border-purple-200' },
    BS:          { label:'B/S',    shortLabel:'BS',    icon:'fa-check-double',cls:'bg-orange-50 text-orange-700 border-orange-200' },
    JODOH:       { label:'Jodoh',  shortLabel:'JDH',   icon:'fa-link',        cls:'bg-teal-50 text-teal-700 border-teal-200' }
  };

  const currentExamId = (document.getElementById('input-exam-id') || {}).value || '';

  const rowsHtml = pageData.map((q, i) => {
    const realIndex = startIndex + i + 1;
    const tm = typeMap[q.type] || { label: q.type, shortLabel: q.type.substring(0,3), icon:'fa-question', cls:'bg-slate-100 text-slate-600 border-slate-200' };

    // ── Kunci / pasangan display ──
    let keyDisplay = q.key || '-';
    if (q.type === 'JODOH') {
      try {
        const opts = (typeof q.options === 'string') ? JSON.parse(q.options) : q.options;
        if (Array.isArray(opts)) {
          const validPairs = opts.filter(p => p.q).map(p =>
            `<div class="flex items-center gap-1 text-[11px] leading-tight">
               <span class="truncate max-w-[90px] text-slate-700">${p.q}</span>
               <i class="fas fa-arrow-right text-[8px] text-slate-400 flex-shrink-0"></i>
               <span class="font-bold text-emerald-700 truncate max-w-[90px]">${p.a}</span>
             </div>`
          );
          keyDisplay = `<div class="space-y-1">${validPairs.join('')}</div>`;
          const distractors = opts.filter(p => !p.q).map(p => p.a);
          if (distractors.length > 0) keyDisplay += `<div class="mt-1.5 pt-1.5 border-t border-emerald-100 text-[10px] text-slate-500">Pengacoh: ${distractors.join(', ')}</div>`;
        }
      } catch (e) { keyDisplay = '<span class="text-red-500 text-xs">Error Data</span>'; }
    } else if (q.type === 'PG_KOMPLEKS') {
      try { const k = JSON.parse(q.key); if (Array.isArray(k)) keyDisplay = k.join(', '); } catch(e) {}
    } else if (q.type === 'BS') {
      try {
        const k = JSON.parse(q.key);
        // Gunakan Object.entries agar nomor urut sesuai key (bisa numerikal atau teks pernyataan)
        const entries = Object.entries(k);
        keyDisplay = entries.map(([, v], idx) =>
          `<span class="inline-flex items-center gap-1 mr-1 mb-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${v==='Benar'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}">${idx+1}. ${v}</span>`
        ).join('');
      } catch(e) {}
    }

    const isReq = (String(q.isRequired).toUpperCase() === 'TRUE');
    const pointVal = q.point ? parseFloat(q.point) : 0;

    // Ambil gambar dari content jika tidak ada image URL
    const divTemp = document.createElement('div');
    divTemp.innerHTML = q.content || '';
    let finalImageSrc = q.image;
    if (!finalImageSrc || finalImageSrc.length < 5) {
      const embeddedImg = divTemp.querySelector('img');
      if (embeddedImg) finalImageSrc = embeddedImg.src;
    }
    const hasImg = (finalImageSrc && finalImageSrc.length > 5);

    // FIX: Encode JSON soal sekali di sini — aman untuk onclick attribute
    const qStr = encodeURIComponent(JSON.stringify(q)).replace(/'/g, '%27');

    return `
      <tr class="hover:bg-slate-50/80 transition-colors duration-100">
        <td class="py-3 px-3 text-center w-10">
          <input type="checkbox" class="q-row-check w-4 h-4 rounded border-slate-300 cursor-pointer accent-red-500"
            value="${q.id}" onchange="updateBulkBar()">
        </td>
        <td class="py-3 px-2 text-center text-slate-400 font-semibold text-xs w-9">${realIndex}</td>
        <td class="py-3 px-3">
          <div class="flex gap-3 items-start">

            ${hasImg ? `
            <div class="flex-shrink-0 cursor-pointer" onclick="showQuestionPreview('${qStr}')">
              <img src="${finalImageSrc}"
                class="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg border border-slate-200 shadow-sm bg-white
                       hover:scale-[2.2] hover:z-50 hover:shadow-xl transition-all duration-200 relative z-10 origin-top-left"
                alt="Gambar soal">
            </div>
            ` : `
            <div class="flex-shrink-0 mt-0.5">
              <span class="qb-type-badge ${tm.cls}">
                <i class="fas ${tm.icon}"></i>${tm.shortLabel}
              </span>
            </div>
            `}

            <div class="flex-1 min-w-0">
              <div class="text-slate-700 font-medium text-sm leading-relaxed line-clamp-3 math-content">
                ${prepContent(q.content)}
              </div>
              <div class="flex flex-wrap items-center gap-2 mt-2">
                ${hasImg ? `<span class="qb-type-badge ${tm.cls} !w-auto !h-auto px-2 py-0.5 text-[10px] flex-row gap-1"><i class="fas ${tm.icon}"></i>${tm.label}</span>` : ''}
                ${isReq ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Wajib</span>` : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100">Opsional</span>`}
                ${pointVal > 0 ? `<span class="qb-point-badge"><i class="fas fa-star text-[9px]"></i>${pointVal} poin</span>` : ''}
              </div>
            </div>
          </div>
        </td>

        <td class="py-3 px-3 qb-col-key align-top" style="width:22%;">
          <div class="qb-key-cell">${keyDisplay}</div>
        </td>

        <td class="py-3 px-3 align-top" style="width:90px;">
          <!-- FIX: Tombol TIDAK lagi opacity-0/group-hover — selalu visible agar dapat ditekan di mobile -->
          <div class="qb-row-actions">
            <button class="qb-row-btn edit"
              onclick="editQuestion('${qStr}')"
              title="Edit soal">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="qb-row-btn preview"
              onclick="showQuestionPreview('${qStr}')"
              title="Preview soal">
              <i class="fas fa-eye"></i>
            </button>
            <button class="qb-row-btn del"
              onclick="deleteQuestion('${q.id}','${currentExamId}')"
              title="Hapus soal">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');

  tbody.innerHTML = rowsHtml;
  renderMath(tbody);

  // Update info & pagination
  if (infoDisplay) infoDisplay.textContent = `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalData} soal`;

  // Update page indicator (nomor halaman / total halaman)
  const pageIndicator = document.getElementById('q-page-indicator');
  if (pageIndicator) pageIndicator.textContent = `${currentQPage} / ${maxPage}`;

  if (btnPrev) {
    btnPrev.disabled = (currentQPage <= 1);
    btnPrev.classList.toggle('opacity-50', currentQPage <= 1);
    btnPrev.classList.toggle('cursor-not-allowed', currentQPage <= 1);
  }
  if (btnNext) {
    const isLast = (currentQPage >= maxPage);
    btnNext.disabled = isLast;
    btnNext.classList.toggle('opacity-50', isLast);
    btnNext.classList.toggle('cursor-not-allowed', isLast);
  }

  // Sync dropdown filter tipe agar konsisten dengan state aktif
  const typeFilterSel = document.getElementById('q-type-filter-select');
  if (typeFilterSel) typeFilterSel.value = _activeTypeFilter || '';
}

function handleAddQuestion(e) {
  e.preventDefault();

  if (typeof tinymce !== 'undefined' && tinymce.get('editor-content')) {
    tinymce.triggerSave();
  }

  for (let i = 0; i < 6; i++) {
    if (typeof tinymce !== 'undefined' && tinymce.get('opt-' + i)) {
      tinymce.get('opt-' + i).save();
    }
  }

  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  const qId = document.getElementById('input-question-id').value;

  // BUG FIX: selectedExamId sebelumnya dideklarasikan tapi tidak pernah dipakai.
  // Sekarang nilai dari dropdown diutamakan agar soal tersimpan ke ujian yang benar.
  const selectedExamId = document.getElementById('select-exam-q') ? document.getElementById('select-exam-q').value : data.examId;
  if (selectedExamId) data.examId = selectedExamId;

  if (!data.examId || data.examId.trim() === '') {
    Swal.fire({
      icon: 'info',
      title: 'Mata Pelajaran Belum Dipilih',
      html: '<p class="text-slate-600 mt-1">Silakan pilih <b>Mata Pelajaran</b> dari dropdown di atas terlebih dahulu sebelum menyimpan pertanyaan.</p>',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: '<i class="fas fa-arrow-up mr-1"></i> Pilih Mata Pelajaran',
      footer: '<span class="text-slate-400 text-xs"><i class="fas fa-info-circle mr-1"></i>Gunakan dropdown "Pilih Mata Pelajaran Untuk Diedit" di bagian Bank Soal</span>'
    });
    return;
  }

  if (!data.type || data.type.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Tipe Soal Belum Dipilih',
      html: '<p class="text-slate-600 mt-1">Silakan pilih <b>Tipe Soal</b> terlebih dahulu sebelum menyimpan pertanyaan.</p>',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Pilih Tipe Soal'
    });
    return;
  }

  const cleanContent = data.content ? data.content.replace(/<p><br><\/p>|<p>&nbsp;<\/p>/g, '').trim() : '';

  if (!cleanContent && (!data.image || data.image.trim() === '')) {
    Swal.fire('Data Belum Lengkap', 'Silakan isi pertanyaan (teks) atau masukkan gambar soal.', 'warning');
    return;
  }

  if (!qId) {
    const typeError = validateTypeConfigBeforeAdd(data.type);
    if (typeError) {
      Swal.fire({
        icon: 'warning',
        title: 'Tipe Soal Tidak Diizinkan',
        html: `<p class="text-slate-600 text-sm mt-1">${typeError}</p>`,
        confirmButtonColor: '#7c3aed',
        confirmButtonText: 'Mengerti'
      });
      return;
    }
  }

  const sizeSelect = document.getElementById('input-image-size');
  const size = sizeSelect ? sizeSelect.value : 'w1000';

  if (data.image && data.image.includes('drive.google.com/thumbnail')) {
    let cleanUrl = data.image.replace(/&sz=[^&]+/, '');
    data.image = cleanUrl + `&sz=${size}`;
  }

  if (data.type === 'PG' || data.type === 'PG_KOMPLEKS') {
    let opts = [];

    let optCount = 5;
    if (currentExamTypeConfig && currentExamTypeConfig[data.type] && currentExamTypeConfig[data.type].optCount) {
      optCount = parseInt(currentExamTypeConfig[data.type].optCount) || 5;
    }
    optCount = Math.max(2, Math.min(6, optCount));

    // BUG FIX (Race condition): baca semua nilai opsi SEKALI dari DOM/TinyMCE,
    // lalu gunakan array ini untuk semua validasi berikutnya — mencegah ketidakkonsistenan.
    const optRawValues = [];
    for (let i = 0; i < optCount; i++) {
      let val = '';
      if (typeof tinymce !== 'undefined' && tinymce.get('opt-' + i)) {
        val = tinymce.get('opt-' + i).getContent();
      } else {
        val = (document.getElementById('opt-' + i) || {}).value || '';
      }
      optRawValues.push(val);
    }

    // Loop validasi kelengkapan (pakai optRawValues, bukan baca DOM ulang)
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let i = 0; i < optCount; i++) {
      const cleanRaw = optRawValues[i].replace(/<p><br><\/p>|<p>&nbsp;<\/p>/g, '').trim();
      if (!cleanRaw) {
        Swal.fire({
          icon: 'warning',
          title: 'Pilihan Jawaban Belum Lengkap',
          html: `<p class="text-slate-600 mt-1">Pilihan jawaban <b>${optionLabels[i]}</b> belum diisi.<br>Semua pilihan jawaban <b>A sampai ${optionLabels[optCount - 1]}</b> wajib diisi.</p>`,
          confirmButtonColor: '#f59e0b',
          confirmButtonText: 'Lengkapi Pilihan Jawaban'
        });
        return;
      }
    }

    // Validasi duplikat (pakai optRawValues)
    const filledOptTexts = [];
    for (let i = 0; i < optCount; i++) {
      const stripped = optRawValues[i].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
      const cleaned = stripped.replace(/<p><br><\/p>|<p>&nbsp;<\/p>/g, '').trim();
      if (cleaned) filledOptTexts.push({ idx: i, text: cleaned });
    }
    const optLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let x = 0; x < filledOptTexts.length; x++) {
      for (let y = x + 1; y < filledOptTexts.length; y++) {
        if (filledOptTexts[x].text === filledOptTexts[y].text) {
          Swal.fire({
            icon: 'warning',
            title: 'Pilihan Jawaban Duplikat',
            html: `<p class="text-slate-600 mt-1">Pilihan <b>${optLabels[filledOptTexts[x].idx]}</b> dan pilihan <b>${optLabels[filledOptTexts[y].idx]}</b> memiliki isi yang <b>sama persis</b>.<br><br>Setiap pilihan jawaban harus <b>unik</b> — perbedaan spasi, tanda baca, dan huruf kecil/besar ikut diperhitungkan.</p>`,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Perbaiki Pilihan Jawaban'
          });
          return;
        }
      }
    }

    // Isi opts dari optRawValues (konsisten dengan yang sudah divalidasi)
    opts = optRawValues
      .map(v => v)
      .filter(v => v.replace(/<p><br><\/p>|<p>&nbsp;<\/p>/g, '').trim());

    const rawCorrect = (data.correct || '').trim();

    if (rawCorrect.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Kunci Jawaban Belum Diisi',
        html: `<p class="text-slate-600 mt-1">Kunci jawaban <b>wajib diisi</b> untuk soal tipe <b>${data.type === 'PG' ? 'Pilihan Ganda' : 'Pilihan Ganda Kompleks'}</b>.<br>Contoh: <b>${data.type === 'PG' ? 'A' : 'A, B, C'}</b></p>`,
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Isi Kunci Jawaban'
      });
      return;
    }

    if (data.type === 'PG') {
      // BUG FIX #3: normalisasi ke uppercase dulu, lalu validasi pakai charCodeAt
      // bukan perbandingan string lexicographic (misal 'a' > 'E' = true karena ASCII).
      const upperCorrect = rawCorrect.toUpperCase();
      const validLetters = Array.from({length: optCount}, (_, i) => String.fromCharCode(65 + i));
      if (upperCorrect.length !== 1 || !validLetters.includes(upperCorrect)) {
        const maxLetter = String.fromCharCode(64 + optCount);
        Swal.fire({
          icon: 'warning',
          title: 'Kunci Jawaban Tidak Valid',
          html: `<p class="text-slate-600 mt-1">Kunci jawaban hanya boleh <b>1 huruf</b> dalam rentang <b>A–${maxLetter}</b> (${optCount} opsi).<br>Contoh: <b>A</b> atau <b>B</b>.</p>`,
          confirmButtonColor: '#f59e0b',
          confirmButtonText: 'Perbaiki Kunci Jawaban'
        });
        return;
      }
      data.correct = upperCorrect; // normalisasi sebelum dikirim ke server
    } else if (data.type === 'PG_KOMPLEKS') {
      // BUG FIX #4: validasi berdasarkan JUMLAH huruf valid, bukan panjang string karakter.
      // Panjang string "A,B" = 3 (salah ditolak), "A, B" = 4 (benar diterima) — tidak konsisten.
      const maxLetterK = String.fromCharCode(64 + optCount);
      const validLettersK = Array.from({length: optCount}, (_, i) => String.fromCharCode(65 + i));
      const keyLetters = rawCorrect.split(',').map(k => k.trim().toUpperCase()).filter(k => k);
      const invalidKey = keyLetters.find(k => !validLettersK.includes(k));
      if (keyLetters.length < 2) {
        Swal.fire({
          icon: 'warning',
          title: 'Kunci Jawaban Kurang',
          html: `<p class="text-slate-600 mt-1">Pilihan Ganda Kompleks memerlukan <b>minimal 2 huruf kunci jawaban</b> yang valid.<br>Contoh: <b>A, B</b> atau <b>A, B, C</b></p>`,
          confirmButtonColor: '#f59e0b',
          confirmButtonText: 'Perbaiki Kunci Jawaban'
        });
        return;
      }
      if (invalidKey) {
        Swal.fire({
          icon: 'warning',
          title: 'Kunci Jawaban Tidak Valid',
          html: `<p class="text-slate-600 mt-1">Kunci jawaban mengandung huruf <b>${invalidKey}</b> yang tidak valid.<br>Opsi yang tersedia hanya <b>A sampai ${maxLetterK}</b> (${optCount} opsi).</p>`,
          confirmButtonColor: '#f59e0b',
          confirmButtonText: 'Perbaiki Kunci Jawaban'
        });
        return;
      }
      // Normalisasi: simpan sebagai huruf uppercase terpisah koma-spasi
      data.correct = keyLetters.join(', ');
    }

    const jsonLength = JSON.stringify(opts).length;
    if (jsonLength > 48000) {
      Swal.fire({
        icon: 'error',
        title: 'Data Terlalu Besar',
        text: `Ukuran opsi jawaban (${Math.round(jsonLength / 1024)} KB) melebihi batas Google Sheets. Mohon gunakan gambar yang lebih kecil/sedikit pada pilihan jawaban.`
      });
      return; 
    }

    data.options = opts;

    if (data.type === 'PG_KOMPLEKS') {
      const rawKey = data.correct;
      const keyArr = rawKey.split(',').map(k => k.trim()).filter(k => k);
      data.correct = JSON.stringify(keyArr);
    }
  }

  else if (data.type === 'BS') {
    let statements = [];
    let keys = {};

    const rows = document.querySelectorAll('.bs-row');
    rows.forEach((row, idx) => {
      const bsEl = row.querySelector('.bs-text');
      const txt = bsEl.isContentEditable ? bsEl.innerHTML : bsEl.value;
      const k = row.querySelector('.bs-key').value;

      const cleanTxt = txt.replace(/<br\s*\/?>$/i, '').trim();

      if (cleanTxt && cleanTxt !== '' && cleanTxt !== '<br>') {
        statements.push(cleanTxt);
        keys[idx] = k;
      }
    });

    if (statements.length < 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Pernyataan Kurang',
        html: `<p class="text-slate-600 mt-1">Soal tipe <b>Benar/Salah Kompleks</b> memerlukan <b>minimal 3 pernyataan</b> yang terisi.<br>Saat ini hanya ada <b>${statements.length} pernyataan</b>.<br><span class="text-xs text-slate-400 mt-1 block">Tambahkan pernyataan menggunakan tombol <b>+ Tambah Pernyataan</b>.</span></p>`,
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Tambah Pernyataan'
      });
      return;
    }

    const bsSeen = new Set();
    for (let i = 0; i < statements.length; i++) {
      const norm = statements[i].trim();
      if (bsSeen.has(norm)) {
        const dupNum = i + 1;
        const origNum = statements.findIndex(s => s.trim() === norm) + 1;
        Swal.fire({
          icon: 'warning',
          title: 'Pernyataan Duplikat',
          html: `<p class="text-slate-600 mt-1">Pernyataan baris ke-<b>${origNum}</b> dan baris ke-<b>${dupNum}</b> memiliki isi yang <b>sama persis</b>.<br><br>Setiap pernyataan harus <b>unik</b> — perbedaan spasi, tanda baca, dan huruf kecil/besar ikut diperhitungkan.</p>`,
          confirmButtonColor: '#f59e0b',
          confirmButtonText: 'Perbaiki Pernyataan'
        });
        return;
      }
      bsSeen.add(norm);
    }

    data.options = statements;
    data.correct = JSON.stringify(keys);
  }

  else if (data.type === 'JODOH') {
    let pairs = [];
    const rows = document.querySelectorAll('.pair-row');

    rows.forEach(row => {
      const leftEl = row.querySelector('.pair-left');
      const midEl  = row.querySelector('.pair-middle');
      const rightEl = row.querySelector('.pair-right');

      const qVal   = (leftEl.isContentEditable ? leftEl.innerHTML : leftEl.value).replace(/<br\s*\/?>$/i, '').trim();
      const midVal = (midEl.isContentEditable ? midEl.innerHTML : midEl.value).replace(/<br\s*\/?>$/i, '').trim();
      const keyVal = (rightEl.innerHTML !== undefined && rightEl.tagName !== 'INPUT' ? rightEl.innerHTML : (rightEl.value || '')).replace(/<br\s*\/?>$/i, '').trim();

      const answerVal = midVal || keyVal;

      if (!answerVal) return;

      if (qVal) {
        pairs.push({ q: qVal, a: answerVal });
      } else {
        pairs.push({ q: '', a: answerVal });
      }
    });

    if (pairs.length === 0) {
        Swal.fire('Data Kosong', 'Mohon isi minimal satu pasang soal dan jawaban/opsi.', 'warning');
        return;
    }

    const realPairs = pairs.filter(p => p.q && p.q.trim() !== '');
    if (realPairs.length < 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Pernyataan Kurang',
        html: `<p class="text-slate-600 mt-1">Soal tipe <b>Menjodohkan</b> memerlukan <b>minimal 3 baris pernyataan</b> yang terisi (kolom sisi kiri).<br>Saat ini hanya ada <b>${realPairs.length} pernyataan</b> terisi.<br><span class="text-xs text-slate-400 mt-1 block">Isi kolom <b>Soal / Pernyataan (sisi kiri)</b> pada setiap baris yang ingin dijadikan pasangan.</span></p>`,
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Tambah Pernyataan'
      });
      return;
    }

    const distractors = pairs.filter(p => !p.q || p.q.trim() === '');

    if (distractors.length < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Pengacoh Belum Ada',
        html: `<p class="text-slate-600 mt-1">Soal tipe <b>Menjodohkan</b> memerlukan <b>minimal 1 baris pengacoh</b>.<br><br>
               Cara membuat pengacoh:<br>
               <span class="text-xs text-slate-500 block mt-1">
                 Tambahkan baris baru menggunakan tombol <b>+ Tambah Baris</b>,
                 lalu <b>biarkan kolom kiri (Soal / Pernyataan) kosong</b>
                 dan hanya isi kolom tengah (Opsi) dengan teks pengacoh.
               </span></p>`,
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Tambah Pengacoh'
      });
      return;
    }

    if (distractors.length > 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Pengacoh Terlalu Banyak',
        html: `<p class="text-slate-600 mt-1">Soal tipe <b>Menjodohkan</b> boleh memiliki maksimal <b>3 baris pengacoh</b>.<br>Saat ini ada <b>${distractors.length} pengacoh</b> (baris dengan kolom Pernyataan kosong).<br><span class="text-xs text-slate-400 mt-1 block">Hapus beberapa baris pengacoh hingga tersisa maksimal 3.</span></p>`,
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Kurangi Pengacoh'
      });
      return;
    }

    const jLeftSeen = new Set();
    const jRightSeen = new Set();
    for (let i = 0; i < pairs.length; i++) {
      const lv = pairs[i].q;
      const rv = pairs[i].a;
      if (lv) {
        if (jLeftSeen.has(lv)) {
          const origIdx = pairs.findIndex(p => p.q === lv);
          Swal.fire({
            icon: 'warning',
            title: 'Pernyataan (Kiri) Duplikat',
            html: `<p class="text-slate-600 mt-1">Pernyataan pada baris ke-<b>${origIdx + 1}</b> dan baris ke-<b>${i + 1}</b> memiliki isi yang <b>sama persis</b>.<br><br>Setiap pernyataan sisi kiri harus <b>unik</b> — perbedaan spasi, tanda baca, dan huruf kecil/besar ikut diperhitungkan.</p>`,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Perbaiki Pernyataan'
          });
          return;
        }
        jLeftSeen.add(lv);
      }
      if (rv) {
        if (jRightSeen.has(rv)) {
          const origIdx = pairs.findIndex(p => p.a === rv);
          Swal.fire({
            icon: 'warning',
            title: 'Jawaban/Opsi (Kanan) Duplikat',
            html: `<p class="text-slate-600 mt-1">Jawaban/opsi pada baris ke-<b>${origIdx + 1}</b> dan baris ke-<b>${i + 1}</b> memiliki isi yang <b>sama persis</b>.<br><br>Setiap jawaban/opsi sisi kanan harus <b>unik</b> — perbedaan spasi, tanda baca, dan huruf kecil/besar ikut diperhitungkan.</p>`,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Perbaiki Jawaban/Opsi'
          });
          return;
        }
        jRightSeen.add(rv);
      }
    }

    data.options = pairs;
    data.correct = "";
  }

  else {
    data.options = [];
  }

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

  data.minChar        = 0;
  data.minCharEnabled = false;
  if (data.type === 'Esai') {
    const cbEnabled = document.getElementById('input-minchar-enabled');
    const minCharEl = document.getElementById('input-minchar');
    data.minCharEnabled = !!(cbEnabled && cbEnabled.checked);
    data.minChar = (minCharEl && data.minCharEnabled) ? (parseInt(minCharEl.value) || 0) : 0;
  }

  if (qId) {

    data.questionId = qId;
    google.script.run.withSuccessHandler(res => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      if (res.success) {
        Swal.fire('Berhasil', 'Soal berhasil diperbarui!', 'success');
        resetQuestionForm();
        loadQuestionsTable(data.examId);
      } else {
        Swal.fire('Gagal', res.message, 'error');
      }
    }).updateQuestion(data, currentUser.userID, currentUser.token);
  } else {
    google.script.run
      .withSuccessHandler(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;

        Swal.fire({
          icon: 'success',
          title: 'Tersimpan!',
          text: 'Soal berhasil ditambahkan ke Bank Soal.',
          timer: 1500,
          showConfirmButton: false
        });

        const currentExamId = document.getElementById('input-exam-id').value;

        resetQuestionForm();

        document.getElementById('input-exam-id').value = currentExamId;

        loadQuestionsTable(data.examId);
      })
      .withFailureHandler(err => {
        // BUG FIX #5: tanpa handler ini tombol tetap disabled selamanya jika server error.
        btn.disabled = false;
        btn.innerHTML = originalText;
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan Soal',
          html: `<p style="font-size:13px;color:#475569;">${(err && err.message) ? err.message : String(err)}</p>`,
          confirmButtonColor: '#dc2626',
          customClass: { popup: 'lp-swal' }
        });
      })
      .addQuestion(data, currentUser.userID, currentUser.token);
  }
}

function handleConfigLogoSearch(input) {
  const term = input.value.toLowerCase();
  const resultDiv = document.getElementById('cfg-logo-results');

  // Bug fix: gunakan getSavedImages() bukan getAllImages() agar format data konsisten
  // (getSavedImages mengembalikan uploaderID yang dibutuhkan oleh _ifRenderStats dan filter).
  if (typeof allImagesData === 'undefined' || allImagesData.length === 0) {
    google.script.run.withSuccessHandler(data => {
      allImagesData = Array.isArray(data) ? data : [];
      if (input.value.length > 0) handleConfigLogoSearch(input);
    }).getSavedImages();

    resultDiv.innerHTML = '<div class="p-3 text-xs text-slate-400">Memuat data gambar...</div>';
    resultDiv.classList.remove('hidden');
    return;
  }

  if (term.length < 1) {
    resultDiv.classList.add('hidden');
    return;
  }

  const matches = allImagesData.filter(img => img.name.toLowerCase().includes(term));

  if (matches.length > 0) {
    resultDiv.innerHTML = matches.map(img => `
            <div class="flex items-center gap-3 p-2 hover:bg-blue-50 cursor-pointer border-b border-slate-50 transition"
                 onclick="selectConfigLogo('${img.link}')">
                <img src="${img.link}" referrerpolicy="no-referrer" class="w-8 h-8 rounded bg-slate-200 object-cover">
                <div class="overflow-hidden">
                    <div class="text-xs font-bold text-slate-700 truncate">${img.name}</div>
                    <div class="text-[10px] text-slate-400 truncate">${img.id}</div>
                </div>
            </div>
        `).join('');
    resultDiv.classList.remove('hidden');
  } else {
    resultDiv.innerHTML = '<div class="p-3 text-xs text-slate-400 text-center">Tidak ada gambar ditemukan</div>';
    resultDiv.classList.remove('hidden');
  }
}

function selectConfigLogo(link) {
  document.getElementById('cfg-app-logo').value = link;
  document.getElementById('cfg-logo-results').classList.add('hidden');
  updateLogoPreview(link);
}

function triggerImport() {
  const examId = document.getElementById('select-exam-q').value;
  const urlInput = document.getElementById('input-form-url');
  const url = urlInput.value.trim();

  if (!examId) {
    Swal.fire('Peringatan', 'Silakan pilih Ujian (Mata Pelajaran) terlebih dahulu di dropdown atas!', 'warning');
    return;
  }
  if (!url) {
    Swal.fire('Peringatan', 'Link Google Form tidak boleh kosong!', 'warning');
    return;
  }

  const btn = document.querySelector('button[onclick="triggerImport()"]');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

  google.script.run
    .withSuccessHandler(res => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      if (res.success) {
        const skippedMsg = res.skipped > 0
          ? `<br><span class="text-amber-600 text-xs">⚠️ ${res.skipped} soal dilewati karena tidak sesuai konfigurasi tipe yang diizinkan admin.</span>`
          : '';
        Swal.fire({
          icon: 'success',
          title: 'Import Berhasil!',
          html: `Sukses mengimport <b>${res.count}</b> soal!${skippedMsg}`
        });
        urlInput.value = '';
        loadQuestionsTable(examId);
        document.getElementById('form-import-q').classList.add('hidden');
      } else {
        Swal.fire('Gagal Import', res.message, 'error');
      }
    })
    .withFailureHandler(err => {
      btn.disabled = false;
      btn.innerHTML = originalText;
      Swal.fire('Error Sistem', err.message, 'error');
    })
    .importQuestionsFromForm(examId, url, currentUser.userID, currentUser.token);
}

function deleteQuestion(qid, eid) {
  Swal.fire({
    title: 'Hapus Soal?',
    text: 'Soal yang dihapus tidak dapat dikembalikan.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fas fa-trash-alt mr-1"></i> Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then(r => {
    if (r.isConfirmed) {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success) {
            loadQuestionsTable(eid);
          } else {
            Swal.fire('Gagal Menghapus', (res && res.message) || 'Terjadi kesalahan saat menghapus soal.', 'error');
          }
        })
        .withFailureHandler(err => {
          Swal.fire('Error', (err && err.message) || 'Terjadi kesalahan sistem.', 'error');
        })
        .deleteQuestion(qid, currentUser.userID, currentUser.token);
    }
  });
}


function toggleAllQCheckboxes(checked) {
  document.querySelectorAll('.q-row-check').forEach(cb => cb.checked = checked);
  updateBulkBar();
}

function updateBulkBar() {
  const checked = document.querySelectorAll('.q-row-check:checked');
  const bar = document.getElementById('bulk-action-bar');
  const countEl = document.getElementById('bulk-count');
  const checkAll = document.getElementById('check-all-q');

  if (bar) {
    if (checked.length > 0) {
      // FIX: gunakan class qb-bulk-bar show — konsisten dengan CSS baru
      bar.classList.add('show');
    } else {
      bar.classList.remove('show');
    }
  }
  if (countEl) countEl.textContent = checked.length;

  const all = document.querySelectorAll('.q-row-check');
  if (checkAll) {
    checkAll.indeterminate = (checked.length > 0 && checked.length < all.length);
    checkAll.checked = (all.length > 0 && checked.length === all.length);
  }
}

function cancelBulkSelect() {
  document.querySelectorAll('.q-row-check').forEach(cb => cb.checked = false);
  const checkAll = document.getElementById('check-all-q');
  if (checkAll) { checkAll.checked = false; checkAll.indeterminate = false; }
  const bar = document.getElementById('bulk-action-bar');
  if (bar) bar.classList.remove('show');
}

function bulkDeleteQuestions() {
  const checked = document.querySelectorAll('.q-row-check:checked');
  if (checked.length === 0) return;

  const ids = Array.from(checked).map(cb => cb.value);
  const examId = document.getElementById('input-exam-id').value;

  Swal.fire({
    title: `Hapus ${ids.length} Soal?`,
    html: `<span class="text-red-600 font-bold">${ids.length} soal</span> akan <b>dihapus permanen</b>.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: `Ya, Hapus ${ids.length} Soal`,
    cancelButtonText: 'Batal'
  }).then(result => {
    if (!result.isConfirmed) return;

    Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    google.script.run
      .withSuccessHandler(res => {
        if (res && res.success) {
          Swal.fire({ icon: 'success', title: 'Berhasil!', text: `${res.deleted} soal dihapus.`, timer: 1800, showConfirmButton: false });
          loadQuestionsTable(examId);
        } else {
          Swal.fire('Gagal', (res && res.message) || 'Terjadi kesalahan.', 'error');
        }
      })
      .withFailureHandler(err => Swal.fire('Error', (err && err.message) || 'Terjadi kesalahan sistem.', 'error'))
      .deleteQuestionsBulk(ids, currentUser.userID, currentUser.token);
  });
}
