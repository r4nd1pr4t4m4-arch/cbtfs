/**
 * exam-rooms.js — Ruang Ujian
 * renderExamRoomPage() + _er* helpers
 * Sumber: index.html L48675-50837
 */

function renderExamRoomPage(container) {
  // Reset state
  _erState = {
    selectedExamID: '', examList: [], rooms: [], students: [],
    supervisorAssignments: [], assignedMap: {}, examInfo: null,
    activeRoomID: null, studentSearch: '', bulkSelected: new Set(),
    activePanelTab: 'enrolled'
  };
  // Reset sequence counter agar handler dari sesi sebelumnya tidak tertinggal
  _erLoadSeq = 0;
  // FIX U5: pastikan Escape key listener selalu fresh tiap render
  _erBindEscKey();

  container.innerHTML = `
  <div id="er-page" class="fade-in er-page-wrap">

    <!-- HEADER BANNER -->
    <div class="er-header-banner">
      <div class="er-header-left">
        <div class="er-header-icon-wrap">
          <i class="fas fa-door-open"></i>
        </div>
        <div>
          <h2 class="er-header-title">Ruang Ujian</h2>
          <p class="er-header-sub">Atur pembagian peserta ke setiap ruangan. Pengawas hanya melihat siswa di ruangannya.</p>
        </div>
      </div>
      <div class="er-header-stats" id="er-header-stats" style="display:none;">
        <div class="er-hstat">
          <span class="er-hstat-num" id="er-hstat-rooms">0</span>
          <span class="er-hstat-lbl">Ruang</span>
        </div>
        <div class="er-hstat-divider"></div>
        <div class="er-hstat">
          <span class="er-hstat-num" id="er-hstat-students">0</span>
          <span class="er-hstat-lbl">Peserta</span>
        </div>
        <div class="er-hstat-divider"></div>
        <div class="er-hstat">
          <span class="er-hstat-num" id="er-hstat-unassigned">0</span>
          <span class="er-hstat-lbl">Belum Masuk</span>
        </div>
      </div>
    </div>

    <!-- PILIH UJIAN -->
    <div class="er-section-card er-exam-select-wrap">
      <label class="er-field-label">
        <i class="fas fa-book-open er-label-icon"></i>Pilih Ujian
      </label>
      <div class="er-exam-select-row">
        <div class="er-select-wrap">
          <i class="fas fa-chevron-down er-select-arrow"></i>
          <select id="er-exam-select"
            onchange="_erOnExamChange(this.value)"
            class="er-select-input" aria-label="Pilih ujian">
            <option value="">-- Pilih Ujian --</option>
          </select>
        </div>
        <button onclick="_erOnExamChange(document.getElementById('er-exam-select').value, true)"
          class="er-btn er-btn-primary er-btn-refresh"
          title="Muat ulang data" aria-label="Muat ulang data ujian">
          <i class="fas fa-rotate-right"></i>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- KONTEN UTAMA (tersembunyi sampai ujian dipilih) -->
    <div id="er-main" style="display:none;">

      <!-- INFO UJIAN + TOMBOL TAMBAH RUANG -->
      <div id="er-exam-info-bar" class="er-info-bar">
        <div class="er-info-bar-left">
          <i class="fas fa-graduation-cap er-info-icon"></i>
          <div id="er-exam-info-text" class="er-info-text"></div>
        </div>
        <button onclick="_erOpenRoomForm(null)" class="er-btn er-btn-primary er-btn-add-room">
          <i class="fas fa-plus"></i>
          <span>Tambah Ruang</span>
        </button>
      </div>

      <!-- LAYOUT RESPONSIF: desktop=2-kolom, mobile=stack -->
      <div class="er-layout-grid">

        <!-- KOLOM KIRI: Daftar Ruang -->
        <div class="er-rooms-col">
          <div class="er-col-header">
            <span class="er-col-title">
              <i class="fas fa-list"></i> Daftar Ruang
            </span>
            <span class="er-col-count" id="er-rooms-count">0</span>
          </div>
          <!-- FIX C1+C10: wrapper tambahan agar horizontal scroll ter-contain -->
          <div class="er-room-list-outer">
            <div id="er-room-list" class="er-room-list-wrap">
              <div class="er-spinner-wrap">
                <i class="fas fa-circle-notch fa-spin er-spinner-icon"></i>
                <span>Memuat ruangan...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- KOLOM KANAN: Panel Peserta -->
        <div id="er-student-panel" class="er-panel-col">
          <div class="er-panel-placeholder">
            <div class="er-placeholder-icon-wrap">
              <i class="fas fa-door-open"></i>
            </div>
            <p class="er-placeholder-title">Pilih Ruang</p>
            <p class="er-placeholder-sub">Klik salah satu ruang untuk mengatur peserta ujiannya.</p>
          </div>
        </div>

      </div>
    </div>

    <!-- LOADING STATE -->
    <div id="er-loading" style="display:none;" class="er-loading-wrap">
      <div class="er-loading-inner">
        <div class="er-loading-spinner">
          <i class="fas fa-circle-notch fa-spin"></i>
        </div>
        <p class="er-loading-text">Memuat data...</p>
        <p class="er-loading-sub">Mohon tunggu sebentar</p>
      </div>
    </div>

    <!-- MODAL FORM RUANG -->
    <div id="er-room-modal" class="er-modal-backdrop" onclick="_erModalBackdrop(event)"
      role="dialog" aria-modal="true" aria-labelledby="er-modal-title">
      <div class="er-modal-box" id="er-modal-box">
        <!-- Modal Header -->
        <div class="er-modal-header">
          <div class="er-modal-header-icon">
            <i class="fas fa-door-open"></i>
          </div>
          <h3 id="er-modal-title" class="er-modal-title">Tambah Ruang Ujian</h3>
          <button onclick="_erCloseRoomForm()" class="er-modal-close" aria-label="Tutup modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <!-- Modal Body -->
        <div class="er-modal-body">
          <input type="hidden" id="er-modal-room-id">

          <div class="er-modal-field">
            <label class="er-modal-label" for="er-modal-room-name">
              Nama Ruang <span class="er-required" aria-hidden="true">*</span>
            </label>
            <div class="er-modal-input-wrap">
              <i class="fas fa-door-open er-modal-input-icon" aria-hidden="true"></i>
              <input type="text" id="er-modal-room-name"
                placeholder="Contoh: Ruang 1, Lab Komputer A"
                class="er-modal-input" autocomplete="off"
                aria-required="true" aria-describedby="er-modal-err">
            </div>
          </div>

          <div class="er-modal-field">
            <label class="er-modal-label">
              <i class="fas fa-user-tie" style="color:#94a3b8;font-size:11px;" aria-hidden="true"></i>
              Pengawas Terkait
            </label>
            <div class="er-modal-sv-readonly" id="er-modal-sv-readonly" aria-label="Status pengawas">
              <i class="fas fa-user-slash er-modal-input-icon" style="color:#cbd5e1;" aria-hidden="true"></i>
              <span id="er-modal-sv-display" style="color:#94a3b8;font-style:italic;">Belum ada penugasan pengawas</span>
            </div>
            <input type="hidden" id="er-modal-sv-assign" value="">
            <p class="er-modal-hint">
              <i class="fas fa-info-circle" aria-hidden="true"></i>
              Pengawas ditetapkan melalui menu <b>Manajemen Pengawas</b>, bukan di sini.
            </p>
          </div>

          <div class="er-modal-field">
            <label class="er-modal-label" for="er-modal-capacity">
              Kapasitas Ruangan
              <span class="er-optional-tag">Opsional</span>
            </label>
            <div class="er-modal-input-wrap">
              <i class="fas fa-users er-modal-input-icon" aria-hidden="true"></i>
              <input type="number" id="er-modal-capacity"
                placeholder="0 = tidak dibatasi"
                min="0" max="999" step="1"
                class="er-modal-input" autocomplete="off"
                aria-describedby="er-cap-hint">
            </div>
            <p class="er-modal-hint" id="er-cap-hint">
              <i class="fas fa-info-circle" aria-hidden="true"></i>
              Jumlah maksimum peserta. Isi <b>0</b> atau kosongkan jika tidak ingin membatasi.
            </p>
          </div>

          <div id="er-modal-err" class="er-modal-err" style="display:none;" role="alert"></div>

          <div class="er-modal-actions">
            <button onclick="_erCloseRoomForm()" class="er-btn er-btn-ghost">
              <i class="fas fa-times" aria-hidden="true"></i> Batal
            </button>
            <button onclick="_erSaveRoom()" class="er-btn er-btn-primary er-btn-save" id="er-modal-save-btn">
              <i class="fas fa-save" aria-hidden="true"></i> Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>`;

  // Inject CSS jika belum ada
  _erInjectCSS();

  // FIX U8: tampilkan loading sementara daftar ujian dimuat
  var selEl = document.getElementById('er-exam-select');
  if (selEl) {
    selEl.innerHTML = '<option value="">Memuat daftar ujian...</option>';
    selEl.disabled = true;
  }

  // Load daftar ujian
  _erLoadExamList();
}

// ── CSS ───────────────────────────────────────────────────────────────────────
function _erInjectCSS() {
  if (document.getElementById('er-styles')) return;
  const style = document.createElement('style');
  style.id = 'er-styles';
  style.textContent = `
    /* ══════════════════════════════════════════════
       RUANG UJIAN — Base & Page Wrapper
    ══════════════════════════════════════════════ */
    .er-page-wrap {
      padding: 0;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    @media (min-width: 640px) {
      .er-page-wrap { gap: 16px; }
    }

    /* ══════════════════════════════════════════════
       HEADER BANNER
    ══════════════════════════════════════════════ */
    .er-header-banner {
      background: linear-gradient(135deg, #064e3b 0%, #065f46 55%, #059669 100%);
      border-radius: 16px;
      /* FIX S2: kurangi padding mobile */
      padding: 14px 16px;
      color: #fff;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(5,150,105,.25), 0 2px 8px rgba(5,150,105,.15);
    }
    @media (min-width: 640px) {
      .er-header-banner { padding: 18px 20px; gap: 14px; }
    }
    .er-header-banner::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      pointer-events: none;
    }
    .er-header-banner::after {
      content: '';
      position: absolute;
      top: -60px; right: -40px;
      width: 180px; height: 180px;
      background: radial-gradient(circle, rgba(167,243,208,.18) 0%, transparent 70%);
      pointer-events: none;
    }
    .er-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 1;
      min-width: 0;
      flex: 1;
    }
    @media (min-width: 640px) {
      .er-header-left { gap: 14px; flex: unset; }
    }
    .er-header-icon-wrap {
      width: 44px; height: 44px;
      background: rgba(255,255,255,.15);
      border: 1.5px solid rgba(255,255,255,.25);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      backdrop-filter: blur(4px);
    }
    @media (min-width: 640px) {
      .er-header-icon-wrap { width: 48px; height: 48px; font-size: 20px; border-radius: 14px; }
    }
    .er-header-title {
      font-size: 16px; font-weight: 900;
      margin: 0 0 2px;
      letter-spacing: -.01em;
    }
    @media (min-width: 640px) { .er-header-title { font-size: 18px; margin: 0 0 3px; } }
    .er-header-sub {
      font-size: 11px;
      color: rgba(255,255,255,.72);
      margin: 0;
      line-height: 1.4;
    }
    @media (min-width: 640px) { .er-header-sub { font-size: 12px; } }
    /* FIX C3+C4: stats bar — compact mobile, proper wrap behavior */
    .er-header-stats {
      display: flex;
      align-items: center;
      gap: 0;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 10px;
      padding: 8px 12px;
      backdrop-filter: blur(4px);
      position: relative; z-index: 1;
      flex-shrink: 0;
      /* FIX C4: agar saat wrap stats mengambil full width dan bisa centered */
      width: 100%;
      justify-content: center;
    }
    @media (min-width: 480px) {
      .er-header-stats { width: auto; padding: 10px 14px; border-radius: 12px; }
    }
    @media (min-width: 640px) {
      .er-header-stats { padding: 10px 16px; }
    }
    .er-hstat {
      display: flex; flex-direction: column; align-items: center;
      min-width: 44px;
    }
    @media (min-width: 480px) { .er-hstat { min-width: 52px; } }
    .er-hstat-num {
      font-size: 18px; font-weight: 900; line-height: 1;
      transition: all .3s ease;
    }
    @media (min-width: 640px) { .er-hstat-num { font-size: 20px; } }
    .er-hstat-lbl {
      font-size: 9px; font-weight: 700; color: rgba(255,255,255,.65);
      text-transform: uppercase; letter-spacing: .04em; margin-top: 3px;
      white-space: nowrap;
    }
    @media (min-width: 640px) { .er-hstat-lbl { font-size: 10px; } }
    .er-hstat-divider {
      width: 1px; height: 28px;
      background: rgba(255,255,255,.2);
      margin: 0 10px;
      flex-shrink: 0;
    }
    @media (min-width: 640px) { .er-hstat-divider { height: 32px; margin: 0 12px; } }

    /* ══════════════════════════════════════════════
       SECTION CARD (reusable)
    ══════════════════════════════════════════════ */
    .er-section-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 16px;
      transition: box-shadow .2s;
    }
    @media (min-width: 640px) {
      .er-section-card { padding: 16px 18px; }
    }
    .er-section-card:focus-within {
      box-shadow: 0 0 0 3px rgba(5,150,105,.1);
      border-color: #6ee7b7;
    }

    /* ══════════════════════════════════════════════
       FIELD LABELS
    ══════════════════════════════════════════════ */
    .er-field-label {
      font-size: 11px; font-weight: 800; color: #64748b;
      text-transform: uppercase; letter-spacing: .07em;
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 10px;
    }
    .er-label-icon { color: #059669; }

    /* ══════════════════════════════════════════════
       EXAM SELECT ROW
    ══════════════════════════════════════════════ */
    .er-exam-select-row {
      display: flex; gap: 8px; align-items: stretch;
    }
    .er-select-wrap {
      position: relative; flex: 1; min-width: 0;
    }
    .er-select-arrow {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      color: #94a3b8; font-size: 11px; pointer-events: none;
    }
    .er-select-input {
      width: 100%; padding: 10px 34px 10px 14px;
      border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 13px; font-weight: 600; color: #1e293b;
      background: #f8fafc; outline: none; cursor: pointer;
      appearance: none; -webkit-appearance: none;
      transition: border-color .15s, box-shadow .15s;
      box-sizing: border-box;
    }
    .er-select-input:focus {
      border-color: #059669; background: #fff;
      box-shadow: 0 0 0 3px rgba(5,150,105,.12);
    }
    .er-select-input:disabled {
      color: #94a3b8; cursor: not-allowed;
    }

    /* ══════════════════════════════════════════════
       BUTTONS
    ══════════════════════════════════════════════ */
    .er-btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 6px; border: none; border-radius: 10px;
      font-size: 13px; font-weight: 700; cursor: pointer;
      transition: all .18s cubic-bezier(.4,0,.2,1);
      white-space: nowrap; position: relative; overflow: hidden;
    }
    .er-btn:active { transform: scale(.97); }
    .er-btn:disabled { opacity: .6; pointer-events: none; }
    .er-btn-primary {
      background: #059669; color: #fff;
      padding: 10px 18px;
      box-shadow: 0 2px 8px rgba(5,150,105,.3);
    }
    .er-btn-primary:hover {
      background: #047857;
      box-shadow: 0 4px 14px rgba(5,150,105,.4);
      transform: translateY(-1px);
    }
    .er-btn-ghost {
      background: #f1f5f9; color: #475569;
      padding: 10px 18px;
      border: 1px solid #e2e8f0;
    }
    .er-btn-ghost:hover {
      background: #e2e8f0; color: #1e293b;
    }
    .er-btn-danger {
      background: #dc2626; color: #fff;
      padding: 10px 18px;
      box-shadow: 0 2px 8px rgba(220,38,38,.3);
    }
    .er-btn-danger:hover {
      background: #b91c1c;
      box-shadow: 0 4px 14px rgba(220,38,38,.4);
    }
    .er-btn-refresh { padding: 10px 14px; flex-shrink: 0; }
    @media (max-width: 479px) {
      .er-btn-refresh span { display: none; }
      .er-btn-refresh { padding: 10px 13px; }
    }
    /* FIX U6: tambah min touch target pada tombol add-room mobile */
    .er-btn-add-room {
      padding: 9px 14px; font-size: 12px; flex-shrink: 0;
      min-height: 40px;
    }
    @media (min-width: 640px) { .er-btn-add-room { padding: 9px 16px; } }
    .er-btn-sm {
      padding: 6px 12px; font-size: 11px; border-radius: 8px;
    }
    /* FIX U6: tombol icon sedikit lebih besar untuk touch */
    .er-btn-icon {
      width: 36px; height: 36px; padding: 0; border-radius: 9px;
      flex-shrink: 0;
    }
    @media (min-width: 640px) { .er-btn-icon { width: 34px; height: 34px; } }
    .er-btn-icon-edit {
      background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;
    }
    .er-btn-icon-edit:hover { background: #0369a1; color: #fff; border-color: #0369a1; }
    .er-btn-icon-del {
      background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;
    }
    .er-btn-icon-del:hover { background: #dc2626; color: #fff; border-color: #dc2626; }

    /* ══════════════════════════════════════════════
       INFO BAR
    ══════════════════════════════════════════════ */
    .er-info-bar {
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    @media (min-width: 640px) { .er-info-bar { padding: 12px 16px; } }
    .er-info-bar-left {
      /* FIX C5: min-width:0 agar text bisa truncate, tidak memaksa overflow */
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;
    }
    .er-info-icon { color: #059669; font-size: 14px; flex-shrink: 0; }
    .er-info-text {
      font-size: 13px; color: #065f46; font-weight: 600;
      line-height: 1.4; min-width: 0;
      word-break: break-word;
    }

    /* ══════════════════════════════════════════════
       LAYOUT GRID (desktop 2-col → mobile stack)
    ══════════════════════════════════════════════ */
    .er-layout-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      /* FIX C1: min-width:0 mencegah overflow dari children */
      min-width: 0;
    }
    @media (min-width: 768px) {
      .er-layout-grid {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: 16px;
        align-items: start;
      }
    }
    @media (min-width: 1024px) {
      .er-layout-grid {
        grid-template-columns: 320px 1fr;
      }
    }

    /* ══════════════════════════════════════════════
       ROOMS COLUMN
    ══════════════════════════════════════════════ */
    /* FIX C10: overflow:hidden agar horizontal scroll ter-contain */
    .er-rooms-col {
      display: flex; flex-direction: column; gap: 8px;
      min-width: 0;
    }
    .er-col-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2px 6px;
      flex-shrink: 0;
    }
    .er-col-title {
      font-size: 11px; font-weight: 800; color: #475569;
      text-transform: uppercase; letter-spacing: .07em;
      display: flex; align-items: center; gap: 6px;
    }
    .er-col-title i { color: #059669; }
    .er-col-count {
      background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;
      border-radius: 20px; padding: 2px 10px;
      font-size: 11px; font-weight: 800;
    }
    /* FIX C1+C10: outer wrapper menampung horizontal scroll agar tidak overflow parent */
    .er-room-list-outer {
      overflow: hidden; /* clip overflow ke luar container */
      min-width: 0;
    }
    .er-room-list-wrap {
      display: flex; flex-direction: column; gap: 8px;
    }
    /* Mobile: horizontal scroll for room cards */
    @media (max-width: 767px) {
      .er-room-list-wrap {
        flex-direction: row;
        gap: 10px;
        overflow-x: auto;
        padding-bottom: 8px;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        /* FIX C1: padding kanan agar card terakhir tidak terpotong */
        padding-right: 4px;
      }
      .er-room-list-wrap::-webkit-scrollbar { height: 4px; }
      .er-room-list-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    }

    /* ══════════════════════════════════════════════
       ROOM CARD
    ══════════════════════════════════════════════ */
    .er-room-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
      cursor: pointer;
      transition: border-color .18s, box-shadow .18s, background .18s, transform .15s;
      position: relative;
      overflow: hidden;
    }
    .er-room-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #059669, #10b981);
      border-radius: 4px 0 0 4px;
      transform: scaleY(0);
      transition: transform .2s cubic-bezier(.34,1.56,.64,1);
    }
    .er-room-card:hover {
      border-color: #6ee7b7;
      box-shadow: 0 4px 12px rgba(5,150,105,.12);
      transform: translateY(-1px);
    }
    .er-room-card:active { transform: scale(.99); }
    .er-room-card.active {
      border-color: #059669;
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      box-shadow: 0 0 0 3px rgba(5,150,105,.15), 0 4px 12px rgba(5,150,105,.1);
    }
    .er-room-card.active::before { transform: scaleY(1); }
    /* FIX C2: mobile cards dengan lebar adaptif — cukup 160px, max 80vw */
    @media (max-width: 767px) {
      .er-room-card {
        min-width: 160px;
        max-width: 80vw;
        scroll-snap-align: start;
        flex-shrink: 0;
      }
    }
    .er-room-card-top {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 8px;
    }
    .er-room-card-info { flex: 1; min-width: 0; }
    .er-room-card-actions { display: flex; gap: 5px; flex-shrink: 0; }
    .er-room-name {
      font-size: 13px; font-weight: 800; color: #1e293b;
      margin: 0 0 5px; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .er-room-meta { font-size: 11px; color: #64748b; margin: 0 0 6px; }
    .er-room-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 20px;
      font-size: 10px; font-weight: 700;
    }
    .er-badge-green { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .er-badge-slate { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
    .er-badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .er-badge-red   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .er-room-progress { margin-top: 8px; }
    .er-progress-bar-track {
      height: 4px; background: #e2e8f0; border-radius: 99px; overflow: hidden;
    }
    .er-progress-bar-fill {
      height: 100%; background: linear-gradient(90deg, #059669, #10b981);
      border-radius: 99px; transition: width .4s ease;
    }
    .er-active-indicator {
      display: none;
      position: absolute; top: 10px; right: 10px;
      width: 8px; height: 8px; border-radius: 50%;
      background: #059669;
      box-shadow: 0 0 0 2px rgba(5,150,105,.3);
      animation: er-pulse-dot .9s ease-in-out infinite;
    }
    .er-room-card.active .er-active-indicator { display: block; }
    @keyframes er-pulse-dot {
      0%,100% { box-shadow: 0 0 0 0 rgba(5,150,105,.4); }
      50%      { box-shadow: 0 0 0 5px rgba(5,150,105,0); }
    }

    /* ══════════════════════════════════════════════
       PANEL PESERTA (kolom kanan)
    ══════════════════════════════════════════════ */
    .er-panel-col { min-width: 0; }
    /* FIX C8+S3: kurangi padding placeholder pada mobile */
    .er-panel-placeholder {
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 28px 20px;
      text-align: center;
      color: #94a3b8;
    }
    @media (min-width: 640px) {
      .er-panel-placeholder { padding: 48px 24px; }
    }
    .er-placeholder-icon-wrap {
      width: 56px; height: 56px;
      background: #f1f5f9; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; color: #cbd5e1;
      margin: 0 auto 12px;
    }
    @media (min-width: 640px) {
      .er-placeholder-icon-wrap { width: 64px; height: 64px; font-size: 26px; margin: 0 auto 14px; }
    }
    .er-placeholder-title {
      font-size: 14px; font-weight: 700; color: #64748b;
      margin: 0 0 6px;
    }
    .er-placeholder-sub {
      font-size: 12px; margin: 0; line-height: 1.5;
    }

    /* ══════════════════════════════════════════════
       STUDENT PANEL INNER
    ══════════════════════════════════════════════ */
    .er-panel-box {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
    }
    .er-panel-head {
      background: linear-gradient(135deg, #064e3b, #065f46);
      padding: 12px 16px;
      display: flex; flex-wrap: wrap;
      align-items: center; justify-content: space-between; gap: 8px;
    }
    @media (min-width: 640px) { .er-panel-head { padding: 14px 18px; gap: 10px; } }
    .er-panel-head-title {
      font-size: 14px; font-weight: 800; color: #fff;
      margin: 0 0 2px; display: flex; align-items: center; gap: 8px;
      min-width: 0; word-break: break-word;
    }
    @media (min-width: 640px) { .er-panel-head-title { font-size: 15px; } }
    .er-panel-head-sub {
      font-size: 11px; color: rgba(255,255,255,.65); margin: 0;
    }

    /* TABS (mobile: tab bar, desktop: 2-col split) */
    .er-panel-tabs {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
    }
    @media (min-width: 640px) {
      .er-panel-tabs { display: none; }
    }
    .er-panel-tab {
      flex: 1; padding: 11px 8px;
      font-size: 12px; font-weight: 700; color: #64748b;
      background: transparent; border: none; cursor: pointer;
      border-bottom: 2.5px solid transparent;
      transition: color .15s, border-color .15s, background .15s;
      display: flex; align-items: center; justify-content: center; gap: 6px;
      /* FIX U6: min touch height */
      min-height: 44px;
    }
    .er-panel-tab.active {
      color: #059669; border-bottom-color: #059669;
      background: #f0fdf4;
    }
    .er-panel-tab-count {
      background: #e2e8f0; color: #475569;
      border-radius: 20px; padding: 1px 7px;
      font-size: 10px; font-weight: 800;
      min-width: 20px; text-align: center;
    }
    .er-panel-tab.active .er-panel-tab-count {
      background: #d1fae5; color: #065f46;
    }
    /* Desktop 2-col layout */
    .er-panel-split { display: none; }
    @media (min-width: 640px) {
      .er-panel-split {
        display: grid;
        grid-template-columns: 1fr 1fr;
        /* FIX C7: gunakan min-height yang lebih konservatif */
        min-height: 280px;
      }
    }
    /* Mobile single pane */
    .er-panel-pane-mobile { display: block; }
    @media (min-width: 640px) {
      .er-panel-pane-mobile { display: none; }
    }
    .er-split-pane {
      display: flex; flex-direction: column;
      min-width: 0;
    }
    .er-split-pane:first-child {
      border-right: 1px solid #f1f5f9;
    }
    .er-split-head {
      padding: 11px 14px;
      border-bottom: 1px solid #f1f5f9;
      background: #f8fafc;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
      gap: 8px;
      min-width: 0;
    }
    .er-split-head-title {
      font-size: 11px; font-weight: 800;
      text-transform: uppercase; letter-spacing: .06em;
      display: flex; align-items: center; gap: 5px;
    }
    .er-split-head-title.enrolled { color: #059669; }
    .er-split-head-title.available { color: #0369a1; }
    /* FIX C7: cap split-body height lebih masuk akal */
    .er-split-body {
      padding: 10px;
      flex: 1;
      overflow-y: auto;
      display: flex; flex-direction: column; gap: 6px;
      max-height: 380px;
    }
    @media (min-width: 768px) {
      .er-split-body { max-height: 420px; }
    }

    /* ══════════════════════════════════════════════
       ADD SECTION HEADER (search + bulk)
    ══════════════════════════════════════════════ */
    .er-add-section-head {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      background: #f8fafc;
      display: flex; flex-direction: column; gap: 8px;
      flex-shrink: 0;
    }
    @media (min-width: 640px) {
      .er-add-section-head { padding: 12px 14px; }
    }
    .er-add-top-row {
      display: flex; align-items: center; gap: 8px;
      min-width: 0;
    }
    .er-search-wrap {
      position: relative; flex: 1; min-width: 0;
    }
    .er-search-icon {
      position: absolute; left: 10px; top: 50%;
      transform: translateY(-50%);
      color: #94a3b8; font-size: 12px; pointer-events: none;
    }
    .er-search-input {
      width: 100%; padding: 8px 10px 8px 30px;
      border: 1.5px solid #e2e8f0; border-radius: 9px;
      font-size: 12px; outline: none; background: #fff;
      box-sizing: border-box; transition: border-color .15s, box-shadow .15s;
      /* FIX U6: min touch height */
      min-height: 36px;
    }
    .er-search-input:focus {
      border-color: #059669;
      box-shadow: 0 0 0 3px rgba(5,150,105,.1);
    }
    .er-bulk-add-btn {
      flex-shrink: 0;
      padding: 8px 12px;
      font-size: 11px; border-radius: 8px;
      background: #059669; color: #fff; border: none;
      font-weight: 800; cursor: pointer;
      display: inline-flex; align-items: center; gap: 5px;
      transition: all .15s;
      box-shadow: 0 2px 6px rgba(5,150,105,.3);
      animation: er-btn-appear .2s ease;
      white-space: nowrap;
      min-height: 36px;
    }
    .er-bulk-add-btn:hover { background: #047857; }
    .er-bulk-add-btn:active { transform: scale(.97); }
    .er-bulk-add-btn:disabled { opacity: .6; pointer-events: none; }
    @keyframes er-btn-appear {
      from { opacity:0; transform: scale(.9); }
      to   { opacity:1; transform: scale(1); }
    }
    .er-select-all-label {
      display: flex; align-items: center; gap: 7px;
      font-size: 11px; color: #64748b; cursor: pointer;
      padding: 4px 6px; border-radius: 6px;
      transition: background .12s;
    }
    .er-select-all-label:hover { background: #f0fdf4; }
    .er-select-all-label input[type=checkbox] {
      width: 14px; height: 14px; cursor: pointer;
      accent-color: #059669; flex-shrink: 0;
    }

    /* ══════════════════════════════════════════════
       STUDENT ROWS
    ══════════════════════════════════════════════ */
    .er-student-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 9px;
      background: #fff; border: 1px solid #e2e8f0;
      transition: background .1s, border-color .1s, box-shadow .1s;
      min-width: 0;
    }
    .er-student-row:hover {
      background: #f8fafc; border-color: #cbd5e1;
      box-shadow: 0 1px 4px rgba(15,23,42,.04);
    }
    .er-student-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff; font-size: 13px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .er-student-info { flex: 1; min-width: 0; }
    .er-student-name { font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .er-student-sub  { font-size: 10px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .er-remove-btn {
      padding: 6px 10px; background: #fee2e2; color: #dc2626;
      border: 1px solid #fecaca; border-radius: 7px;
      font-size: 10px; font-weight: 700; cursor: pointer;
      flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px;
      transition: all .14s;
      /* FIX U6: min touch target */
      min-height: 32px;
    }
    .er-remove-btn:hover { background: #dc2626; color: #fff; border-color: #dc2626; }
    .er-remove-btn:active { transform: scale(.96); }

    /* ══════════════════════════════════════════════
       ADD ROWS (bulk select)
    ══════════════════════════════════════════════ */
    .er-add-row {
      padding: 9px 12px; border-radius: 9px;
      cursor: pointer; background: #fff;
      border: 1.5px solid #e2e8f0;
      display: flex; align-items: center; gap: 10px;
      transition: all .14s; user-select: none;
      min-width: 0;
      /* FIX U6: min touch height */
      min-height: 44px;
    }
    .er-add-row:hover { background: #f0fdf4; border-color: #6ee7b7; }
    .er-add-row:active { transform: scale(.99); }
    .er-add-row.selected { background: #ecfdf5; border-color: #059669; }
    .er-checkbox {
      width: 16px; height: 16px; border-radius: 4px;
      border: 2px solid #cbd5e1; background: #fff;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: all .12s; font-size: 9px;
    }
    .er-add-row.selected .er-checkbox {
      background: #059669; border-color: #059669; color: #fff;
    }

    /* ══════════════════════════════════════════════
       EMPTY / SPINNER STATES
    ══════════════════════════════════════════════ */
    .er-empty {
      text-align: center; padding: 24px 12px;
      color: #94a3b8; font-size: 12px;
    }
    @media (min-width: 640px) { .er-empty { padding: 28px 16px; } }
    .er-empty-icon {
      font-size: 26px; margin-bottom: 8px;
      display: block; opacity: .45;
    }
    .er-empty-title { font-weight: 700; color: #64748b; margin: 0 0 4px; }
    .er-empty p { margin: 0; line-height: 1.5; }
    .er-spinner-wrap {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 28px 16px; color: #94a3b8;
      font-size: 13px; gap: 10px;
    }
    .er-spinner-icon { font-size: 22px; color: #059669; }

    /* ══════════════════════════════════════════════
       LOADING STATE
    ══════════════════════════════════════════════ */
    .er-loading-wrap {
      display: flex; align-items: center; justify-content: center;
      min-height: 180px;
    }
    @media (min-width: 640px) { .er-loading-wrap { min-height: 200px; } }
    .er-loading-inner { text-align: center; }
    .er-loading-spinner {
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; color: #059669; margin: 0 auto 12px;
      box-shadow: 0 4px 16px rgba(5,150,105,.2);
    }
    @media (min-width: 640px) {
      .er-loading-spinner { width: 56px; height: 56px; font-size: 22px; margin: 0 auto 14px; }
    }
    .er-loading-text {
      font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 4px;
    }
    .er-loading-sub {
      font-size: 12px; color: #94a3b8; margin: 0;
    }

    /* ══════════════════════════════════════════════
       MODAL
    ══════════════════════════════════════════════ */
    .er-modal-backdrop {
      display: none;
      position: fixed; inset: 0;
      background: rgba(10,16,32,.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 9990;
      align-items: flex-end;
      justify-content: center;
      padding: 0;
    }
    @media (min-width: 480px) {
      .er-modal-backdrop {
        align-items: center;
        padding: 20px;
      }
    }
    .er-modal-backdrop.open {
      display: flex;
      animation: er-backdrop-in .2s ease;
    }
    @keyframes er-backdrop-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .er-modal-box {
      background: #fff;
      border-radius: 20px 20px 0 0;
      width: 100%; max-width: 500px;
      box-shadow: 0 -8px 40px rgba(0,0,0,.2);
      overflow: hidden;
      animation: er-modal-slide-up .28s cubic-bezier(.34,1.2,.64,1);
      max-height: 92vh;
      overflow-y: auto;
      /* FIX C6: box-sizing agar padding tidak overflow */
      box-sizing: border-box;
    }
    @media (min-width: 480px) {
      .er-modal-box {
        border-radius: 20px;
        animation: er-modal-pop .26s cubic-bezier(.34,1.2,.64,1);
        max-height: 90vh;
      }
    }
    @keyframes er-modal-slide-up {
      from { transform: translateY(100%); opacity: .8; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes er-modal-pop {
      from { transform: scale(.93) translateY(-10px); opacity: 0; }
      to   { transform: scale(1)   translateY(0);     opacity: 1; }
    }
    .er-modal-header {
      background: linear-gradient(135deg, #064e3b 0%, #059669 100%);
      padding: 14px 18px;
      display: flex; align-items: center; gap: 12px;
    }
    @media (min-width: 480px) { .er-modal-header { padding: 16px 20px; } }
    .er-modal-header-icon {
      width: 36px; height: 36px;
      background: rgba(255,255,255,.2);
      border: 1.5px solid rgba(255,255,255,.3);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; color: #fff; flex-shrink: 0;
    }
    @media (min-width: 480px) { .er-modal-header-icon { width: 38px; height: 38px; font-size: 16px; } }
    .er-modal-title {
      flex: 1; font-size: 14px; font-weight: 800; color: #fff;
      margin: 0; min-width: 0;
    }
    @media (min-width: 480px) { .er-modal-title { font-size: 15px; } }
    .er-modal-close {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,.2); border: none;
      color: #fff; font-size: 14px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s;
      flex-shrink: 0;
    }
    .er-modal-close:hover { background: rgba(255,255,255,.35); }
    /* FIX C6: modal-body dengan box-sizing dan padding yang aman */
    .er-modal-body {
      padding: 16px 16px 20px;
      box-sizing: border-box;
    }
    @media (min-width: 480px) { .er-modal-body { padding: 20px 20px 24px; } }
    .er-modal-field { margin-bottom: 14px; }
    @media (min-width: 480px) { .er-modal-field { margin-bottom: 16px; } }
    .er-modal-field:last-of-type { margin-bottom: 0; }
    .er-modal-label {
      font-size: 11px; font-weight: 800; color: #475569;
      text-transform: uppercase; letter-spacing: .07em;
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 8px;
    }
    .er-required { color: #ef4444; font-size: 14px; font-weight: 900; }
    .er-optional-tag {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0;
      border-radius: 20px; padding: 1px 7px; letter-spacing: .04em;
      margin-left: auto;
    }
    .er-modal-input-wrap { position: relative; }
    .er-modal-input-icon {
      position: absolute; left: 12px; top: 50%;
      transform: translateY(-50%);
      color: #94a3b8; font-size: 13px; pointer-events: none;
    }
    /* FIX C6: input box-sizing + min-height touch target */
    .er-modal-input {
      width: 100%; padding: 11px 14px 11px 36px;
      border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 13px; outline: none; box-sizing: border-box;
      transition: border-color .15s, box-shadow .15s;
      background: #f8fafc;
      min-height: 44px;
    }
    .er-modal-input:focus {
      border-color: #059669; background: #fff;
      box-shadow: 0 0 0 3px rgba(5,150,105,.12);
    }
    .er-modal-input.er-input-error { border-color: #ef4444; }
    .er-modal-input.er-input-error:focus {
      box-shadow: 0 0 0 3px rgba(239,68,68,.12);
    }
    .er-modal-sv-readonly {
      display: flex; align-items: center; gap: 0;
      padding: 10px 14px 10px 36px;
      border: 1.5px solid #e2e8f0; border-radius: 10px;
      background: #f8fafc; font-size: 13px;
      min-height: 44px; position: relative;
      box-sizing: border-box;
    }
    .er-modal-hint {
      font-size: 11px; color: #94a3b8; margin: 6px 0 0;
      display: flex; align-items: flex-start; gap: 5px; line-height: 1.4;
    }
    .er-modal-hint i { color: #cbd5e1; font-size: 11px; flex-shrink: 0; margin-top: 1px; }
    /* FIX C11: overflow:hidden mencegah shake animation keluar batas modal */
    .er-modal-err {
      background: #fef2f2; border: 1px solid #fca5a5;
      border-radius: 9px; padding: 10px 14px;
      font-size: 12px; color: #dc2626;
      margin-bottom: 14px;
      display: flex; align-items: flex-start; gap: 8px;
      overflow: hidden;
    }
    .er-modal-err.er-shake {
      animation: er-shake .3s ease;
    }
    @keyframes er-shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-4px); }
      60%     { transform: translateX(4px); }
      80%     { transform: translateX(-2px); }
    }
    .er-modal-actions {
      display: flex; gap: 10px; justify-content: flex-end;
      margin-top: 18px; padding-top: 14px;
      border-top: 1px solid #f1f5f9;
    }
    @media (min-width: 480px) { .er-modal-actions { margin-top: 20px; padding-top: 16px; } }
    .er-btn-save { min-width: 100px; }
    @media (min-width: 480px) { .er-btn-save { min-width: 110px; } }
    .er-btn-save.er-loading-btn { pointer-events: none; opacity: .75; }

    /* ══════════════════════════════════════════════
       FADE-IN KEYFRAME (dipastikan ada untuk er-page)
    ══════════════════════════════════════════════ */
    @keyframes er-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ── Load daftar ujian ─────────────────────────────────────────────────────────
function _erLoadExamList() {
  google.script.run
    .withSuccessHandler(function(exams) {
      _erState.examList = Array.isArray(exams) ? exams : [];
      const sel = document.getElementById('er-exam-select');
      if (!sel) return;
      sel.innerHTML = '<option value="">-- Pilih Ujian --</option>';
      // FIX U8: re-enable select setelah data dimuat
      sel.disabled = false;
      _erState.examList.forEach(function(e) {
        const opt = document.createElement('option');
        opt.value = e.id || '';
        opt.textContent = (e.subject || e.name || '') + ' — ' + (e.class || '') + ' (' + (e.status || '') + ')';
        sel.appendChild(opt);
      });
      if (_erState.examList.length === 0) {
        sel.innerHTML = '<option value="">-- Belum ada ujian tersedia --</option>';
      }
    })
    .withFailureHandler(function(err) {
      console.error('Gagal load exam list:', err);
      const sel = document.getElementById('er-exam-select');
      if (sel) {
        sel.innerHTML = '<option value="">-- Gagal memuat ujian --</option>';
        sel.disabled = false;
      }
    })
    .getExamList(currentUser.userID, currentUser.token);
}

// ── Saat ujian dipilih ────────────────────────────────────────────────────────
// Counter untuk mencegah race condition — hanya response terbaru yang diproses
var _erLoadSeq = 0;

function _erOnExamChange(examID, forceRefresh, restoreRoomID) {
  _erState.selectedExamID = examID || '';
  _erState.activeRoomID   = null;

  const main    = document.getElementById('er-main');
  const loading = document.getElementById('er-loading');
  const panel   = document.getElementById('er-student-panel');
  const stats   = document.getElementById('er-header-stats');

  if (!examID) {
    if (main)    main.style.display    = 'none';
    if (loading) loading.style.display = 'none';
    // FIX B8: reset stats saat ujian di-deselect
    if (stats)   stats.style.display   = 'none';
    return;
  }

  // Naikkan sequence setiap kali request baru dimulai
  var mySeq = ++_erLoadSeq;

  if (forceRefresh) {
    var sel = document.getElementById('er-exam-select');
    if (sel && sel.value !== examID) sel.value = examID;
  }

  if (main)    main.style.display    = 'none';
  if (loading) loading.style.display = 'flex';
  // FIX B8: sembunyikan stats saat loading agar tidak muncul nilai stale
  if (stats)   stats.style.display   = 'none';

  google.script.run
    .withSuccessHandler(function(res) {
      // Abaikan response dari request yang sudah usang
      if (mySeq !== _erLoadSeq) return;

      if (loading) loading.style.display = 'none';
      if (!res || !res.success) {
        Swal && Swal.fire({
          icon:'error', title:'Gagal',
          text: res ? res.message : 'Terjadi kesalahan.',
          confirmButtonColor:'#059669', customClass:{popup:'lp-swal'}
        });
        return;
      }
      _erState.rooms                 = res.rooms                 || [];
      _erState.students              = res.students              || [];
      _erState.supervisorAssignments = res.supervisorAssignments || [];
      _erState.assignedMap           = res.assignedMap           || {};
      _erState.examInfo              = res.examInfo              || null;
      _erState.studentSearch = '';
      _erState.bulkSelected  = new Set();
      _erState.activePanelTab = 'enrolled';

      // Update header stats
      const unassigned    = (_erState.students || []).filter(function(s) { return !s.assignedRoom; }).length;
      const totalStudents = (_erState.students || []).length;
      const roomsCount    = (_erState.rooms || []).length;
      const elRooms      = document.getElementById('er-hstat-rooms');
      const elStudents   = document.getElementById('er-hstat-students');
      const elUnassigned = document.getElementById('er-hstat-unassigned');
      if (elRooms)      elRooms.textContent      = roomsCount;
      if (elStudents)   elStudents.textContent   = totalStudents;
      if (elUnassigned) elUnassigned.textContent = unassigned;
      if (stats)        stats.style.display      = 'flex';

      // Update rooms count badge
      const roomsCountEl = document.getElementById('er-rooms-count');
      if (roomsCountEl) roomsCountEl.textContent = roomsCount;

      // Render info bar
      const infoText = document.getElementById('er-exam-info-text');
      if (infoText && res.examInfo) {
        const ei = res.examInfo;
        const statusLower = String(ei.status || '').toLowerCase();
        const isAktif = statusLower === 'aktif';
        infoText.innerHTML =
          '<b>' + _erEsc(ei.subject) + '</b>' +
          '<span style="color:#94a3b8;margin:0 4px;">&middot;</span>' +
          'Kelas: <b>' + _erEsc(ei.kelas) + '</b>' +
          '<span style="color:#94a3b8;margin:0 4px;">&middot;</span>' +
          _erEsc(ei.date) +
          '<span style="display:inline-flex;align-items:center;gap:4px;margin-left:8px;' +
            'padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;' +
            'background:' + (isAktif ? '#d1fae5' : '#f1f5f9') + ';' +
            'color:' + (isAktif ? '#065f46' : '#475569') + ';' +
            'border:1px solid ' + (isAktif ? '#a7f3d0' : '#e2e8f0') + ';">' +
            '<span style="width:5px;height:5px;border-radius:50%;' +
              'background:' + (isAktif ? '#059669' : '#94a3b8') + ';display:inline-block;"></span>' +
            _erEsc(ei.status) +
          '</span>';
      }

      // Isi dropdown pengawas di modal
      _erPopulateSvDropdown();

      if (main) main.style.display = 'block';

      // Jika ada ruang yang harus di-restore (setelah add/remove siswa), buka langsung
      if (restoreRoomID) {
        const stillExists = (_erState.rooms || []).some(function(r) { return r.id === restoreRoomID; });
        if (stillExists) {
          _erState.activeRoomID = restoreRoomID;
          _erRenderRoomList();
          _erRenderStudentPanel();
          return;
        }
      }

      // Default: reset panel kanan ke placeholder
      if (panel) {
        const isMobile = window.innerWidth < 768;
        panel.innerHTML =
          '<div class="er-panel-placeholder">' +
            '<div class="er-placeholder-icon-wrap"><i class="fas fa-door-open"></i></div>' +
            '<p class="er-placeholder-title">Pilih Ruang</p>' +
            '<p class="er-placeholder-sub">Klik salah satu ruang di ' +
              (isMobile ? 'atas' : 'sebelah kiri') +
            ' untuk mengatur peserta ujiannya.</p>' +
          '</div>';
      }

      _erRenderRoomList();
    })
    .withFailureHandler(function(err) {
      // Abaikan jika bukan request terbaru
      if (mySeq !== _erLoadSeq) return;
      if (loading) loading.style.display = 'none';
      Swal && Swal.fire({
        icon:'error', title:'Koneksi Gagal',
        text: err && err.message ? err.message : 'Gagal menghubungi server.',
        confirmButtonColor:'#059669', customClass:{popup:'lp-swal'}
      });
    })
    .getExamRoomStudentData(examID, currentUser.userID, currentUser.token);
}

// ── Isi display pengawas di modal (read-only) ────────────────────────────────
function _erPopulateSvDropdown() {
  const hiddenSel = document.getElementById('er-modal-sv-assign');
  const display   = document.getElementById('er-modal-sv-display');
  const icon      = document.querySelector('#er-modal-sv-readonly .er-modal-input-icon');
  if (!display) return;

  const currentID = hiddenSel ? hiddenSel.value : '';
  if (!currentID) {
    display.textContent      = 'Belum ada penugasan pengawas';
    display.style.color      = '#94a3b8';
    display.style.fontStyle  = 'italic';
    if (icon) { icon.className = 'fas fa-user-slash er-modal-input-icon'; icon.style.color = '#cbd5e1'; }
    return;
  }

  const assignment = (_erState.supervisorAssignments || []).find(function(a) { return a.id === currentID; });
  if (assignment) {
    const label = assignment.supervisorName +
      (assignment.sessionLabel ? ' · ' + assignment.sessionLabel : '');
    display.textContent      = label;
    display.style.color      = '#1e293b';
    display.style.fontStyle  = 'normal';
    if (icon) { icon.className = 'fas fa-user-tie er-modal-input-icon'; icon.style.color = '#059669'; }
  } else {
    display.textContent      = 'Pengawas (ID: ' + currentID + ')';
    display.style.color      = '#64748b';
    display.style.fontStyle  = 'normal';
    if (icon) { icon.className = 'fas fa-user-tie er-modal-input-icon'; icon.style.color = '#94a3b8'; }
  }
}

// ── Render daftar ruang (kolom kiri) ─────────────────────────────────────────
function _erRenderRoomList() {
  var wrap = document.getElementById('er-room-list');
  if (!wrap) return;

  var rooms = _erState.rooms || [];

  var countEl = document.getElementById('er-rooms-count');
  if (countEl) countEl.textContent = rooms.length;

  if (rooms.length === 0) {
    wrap.innerHTML =
      '<div class="er-empty">' +
        '<i class="fas fa-inbox er-empty-icon"></i>' +
        '<p class="er-empty-title">Belum ada ruang</p>' +
        '<p>Klik <b>Tambah Ruang</b> di atas untuk membuat ruangan baru.</p>' +
      '</div>';
    return;
  }

  var roomStudentMap = {};
  (_erState.students || []).forEach(function(s) {
    if (s.assignedRoom && s.assignedRoom.roomID) {
      roomStudentMap[s.assignedRoom.roomID] = (roomStudentMap[s.assignedRoom.roomID] || 0) + 1;
    }
  });
  var totalStudents = (_erState.students || []).length;

  wrap.innerHTML = rooms.map(function(room) {
    var isActive = room.id === _erState.activeRoomID;
    var stuCount = roomStudentMap[room.id] || room.studentCount || 0;
    var cap      = room.capacity || 0;
    var pct      = cap > 0
      ? Math.min(100, Math.round((stuCount / cap) * 100))
      : (totalStudents > 0 ? Math.round((stuCount / totalStudents) * 100) : 0);
    var isFull     = cap > 0 && stuCount >= cap;
    var isNearFull = cap > 0 && stuCount >= Math.ceil(cap * 0.8) && !isFull;

    var svBadge;
    if (!room.supervisorName) {
      svBadge = '<span class="er-room-badge er-badge-slate"><i class="fas fa-user-slash"></i> Belum ada pengawas</span>';
    } else if (room.hasSubstitute) {
      svBadge =
        '<span class="er-room-badge er-badge-amber" title="Pengganti: ' + _erEsc(room.supervisorName) + '">' +
          '<i class="fas fa-user-clock"></i> ' + _erEsc(_erTrunc(room.supervisorName, 18)) +
          '<span style="background:#f59e0b;color:#fff;border-radius:10px;padding:0 5px;font-size:9px;margin-left:2px;">Pengganti</span>' +
        '</span>' +
        '<span style="display:block;font-size:9px;color:#94a3b8;margin-top:3px;">' +
          '<i class="fas fa-arrow-right-arrow-left" style="font-size:8px;color:#fbbf24;margin-right:2px;"></i>' +
          'asli: ' + _erEsc(_erTrunc(room.originalSvName || '', 16)) +
        '</span>';
    } else {
      svBadge = '<span class="er-room-badge er-badge-amber"><i class="fas fa-user-tie"></i> ' + _erEsc(_erTrunc(room.supervisorName, 18)) + '</span>';
    }

    var barColor = isFull
      ? 'linear-gradient(90deg,#dc2626,#ef4444)'
      : isNearFull
        ? 'linear-gradient(90deg,#d97706,#f59e0b)'
        : 'linear-gradient(90deg,#059669,#10b981)';

    var progressHTML = (cap > 0 || totalStudents > 0)
      ? '<div class="er-room-progress">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<span style="font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">' + (cap > 0 ? 'Kapasitas' : 'Proporsi') + '</span>' +
            '<span style="font-size:9px;font-weight:800;color:' + (isFull ? '#dc2626' : isNearFull ? '#d97706' : '#64748b') + ';">' + pct + '%</span>' +
          '</div>' +
          '<div class="er-progress-bar-track">' +
            '<div class="er-progress-bar-fill" style="width:' + pct + '%;background:' + barColor + ';"></div>' +
          '</div>' +
        '</div>'
      : '';

    var capBadge = cap > 0
      ? '<span class="er-room-badge ' + (isFull ? 'er-badge-red' : isNearFull ? 'er-badge-amber' : 'er-badge-slate') + '" style="margin-left:4px;" title="Kapasitas">' +
          '<i class="fas fa-' + (isFull ? 'lock' : 'door-open') + '"></i> ' + stuCount + '/' + cap +
          (isFull ? ' <span style="color:#ef4444;font-size:9px;">PENUH</span>' : '') +
        '</span>'
      : '';

    return (
      '<div class="er-room-card' + (isActive ? ' active' : '') + '" onclick="_erSelectRoom(\'' + _erEsc(room.id) + '\')">' +
        '<div class="er-active-indicator"></div>' +
        '<div class="er-room-card-top">' +
          '<div class="er-room-card-info">' +
            '<p class="er-room-name"><i class="fas fa-door-open" style="color:#059669;margin-right:5px;font-size:11px;"></i>' + _erEsc(room.roomName) + '</p>' +
            '<p class="er-room-meta">' +
              '<span class="er-room-badge er-badge-green"><i class="fas fa-users"></i> ' + stuCount + ' peserta</span>' + capBadge +
            '</p>' +
            '<div style="margin-top:6px;">' + svBadge + '</div>' +
          '</div>' +
          '<div class="er-room-card-actions">' +
            '<button onclick="event.stopPropagation();_erOpenRoomForm(\'' + _erEsc(room.id) + '\')" ' +
              'class="er-btn er-btn-icon er-btn-icon-edit" title="Edit ruang" aria-label="Edit ' + _erEsc(room.roomName) + '">' +
              '<i class="fas fa-pen"></i>' +
            '</button>' +
            '<button onclick="event.stopPropagation();_erDeleteRoom(\'' + _erEsc(room.id) + '\')" ' +
              'class="er-btn er-btn-icon er-btn-icon-del" title="Hapus ruang" aria-label="Hapus ' + _erEsc(room.roomName) + '">' +
              '<i class="fas fa-trash"></i>' +
            '</button>' +
          '</div>' +
        '</div>' +
        progressHTML +
      '</div>'
    );
  }).join('');
}

// ── Pilih ruang → tampilkan panel peserta ────────────────────────────────────
function _erSelectRoom(roomID) {
  _erState.activeRoomID   = roomID;
  _erState.bulkSelected   = new Set();
  _erState.studentSearch  = '';
  _erState.activePanelTab = 'enrolled';
  _erRenderRoomList();
  _erRenderStudentPanel();
  // Mobile: scroll panel ke view
  if (window.innerWidth < 768) {
    var panel = document.getElementById('er-student-panel');
    if (panel) { setTimeout(function() { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }
  }
}
// ── Panel peserta (kolom kanan) ───────────────────────────────────────────────
function _erRenderStudentPanel() {
  var panel = document.getElementById('er-student-panel');
  if (!panel) return;

  var room = (_erState.rooms || []).find(function(r) { return r.id === _erState.activeRoomID; });
  if (!room) return;

  // Siswa yang sudah di ruang ini
  var assignedIDs = new Set();
  (_erState.students || []).forEach(function(s) {
    if (s.assignedRoom && s.assignedRoom.roomID === _erState.activeRoomID) {
      assignedIDs.add(s.userID);
    }
  });
  var enrolledStudents = (_erState.students || []).filter(function(s) {
    return assignedIDs.has(s.userID);
  });
  // Siswa yang bisa ditambahkan (belum di ruang manapun)
  var availableStudents = (_erState.students || []).filter(function(s) {
    return !s.assignedRoom;
  });

  var searchVal = (_erState.studentSearch || '').toLowerCase().trim();
  var filteredAvailable = searchVal
    ? availableStudents.filter(function(s) {
        return s.nama.toLowerCase().includes(searchVal) ||
               s.kelas.toLowerCase().includes(searchVal) ||
               s.userID.toLowerCase().includes(searchVal);
      })
    : availableStudents;

  var bulkCheckedAll = filteredAvailable.length > 0 &&
    filteredAvailable.every(function(s) { return _erState.bulkSelected.has(s.userID); });

  var activeTab = _erState.activePanelTab || 'enrolled';

  // ── HTML Peserta Terdaftar ─────────────────────────────────────────────────
  var enrolledHTML = enrolledStudents.length > 0
    ? enrolledStudents.map(function(s) {
        return (
          '<div class="er-student-row">' +
            '<div class="er-student-avatar">' + (s.nama || 'S').charAt(0).toUpperCase() + '</div>' +
            '<div class="er-student-info">' +
              '<div class="er-student-name">' + _erEsc(s.nama) + '</div>' +
              '<div class="er-student-sub">' + _erEsc(s.userID) + ' &middot; ' + _erEsc(s.kelas) + '</div>' +
            '</div>' +
            '<button onclick="_erRemoveStudent(\'' + _erEsc(room.id) + '\',\'' + _erEsc(s.userID) + '\')" ' +
              'class="er-remove-btn" title="Keluarkan dari ruang" aria-label="Keluarkan ' + _erEsc(s.nama) + '">' +
              '<i class="fas fa-times" aria-hidden="true"></i> Keluarkan' +
            '</button>' +
          '</div>'
        );
      }).join('')
    : '<div class="er-empty"><i class="fas fa-inbox er-empty-icon"></i><p style="margin:0;">Belum ada peserta di ruang ini.</p></div>';

  // ── HTML Tambah Peserta ────────────────────────────────────────────────────
  var availableHTML = _erBuildAvailableHTML(filteredAvailable, searchVal);

  // ── Add Section Header (Search + Bulk) ────────────────────────────────────
  var bulkBtn = _erState.bulkSelected.size > 0
    ? '<button onclick="_erBulkAdd()" class="er-bulk-add-btn" aria-label="Tambah ' + _erState.bulkSelected.size + ' siswa terpilih">' +
        '<i class="fas fa-plus" aria-hidden="true"></i> Tambah (' + _erState.bulkSelected.size + ')' +
      '</button>'
    : '';

  var selectAllHTML = filteredAvailable.length > 0
    ? '<label class="er-select-all-label">' +
        '<input type="checkbox" id="er-check-all" ' + (bulkCheckedAll ? 'checked' : '') +
          ' onchange="_erToggleAllBulk(this.checked)" aria-label="Pilih semua siswa">' +
        ' Pilih semua (' + filteredAvailable.length + ')' +
      '</label>'
    : '';

  var addSectionHead =
    '<div class="er-add-section-head">' +
      '<div class="er-add-top-row">' +
        '<div class="er-search-wrap">' +
          '<i class="fas fa-search er-search-icon" aria-hidden="true"></i>' +
          '<input type="text" placeholder="Cari nama / ID / kelas..."' +
            ' value="' + _erEsc(_erState.studentSearch || '') + '"' +
            ' oninput="_erStudentSearch(this.value)"' +
            ' class="er-search-input" aria-label="Cari siswa">' +
        '</div>' +
        bulkBtn +
      '</div>' +
      '<div class="er-select-all-wrap">' + selectAllHTML + '</div>' +
    '</div>';

  // Desktop split-head bulk btn (terpisah di header kolom kanan)
  var desktopBulkBtn = _erState.bulkSelected.size > 0
    ? '<button onclick="_erBulkAdd()" class="er-bulk-add-btn" style="font-size:10px;padding:5px 10px;" aria-label="Tambah ' + _erState.bulkSelected.size + ' siswa">' +
        '<i class="fas fa-plus" aria-hidden="true"></i> Tambah (' + _erState.bulkSelected.size + ')' +
      '</button>'
    : '';

  panel.innerHTML =
    '<div class="er-panel-box">' +

      // Panel Header
      '<div class="er-panel-head">' +
        '<div style="flex:1;min-width:0;">' +
          '<h3 class="er-panel-head-title">' +
            '<i class="fas fa-door-open" style="opacity:.85;" aria-hidden="true"></i>' + _erEsc(room.roomName) +
          '</h3>' +
          '<p class="er-panel-head-sub">' +
            '<i class="fas fa-users" style="margin-right:4px;" aria-hidden="true"></i>' + enrolledStudents.length + ' peserta terdaftar' +
            '&nbsp;&middot;&nbsp;' +
            '<i class="fas fa-user-plus" style="margin-right:4px;" aria-hidden="true"></i>' + availableStudents.length + ' siswa tersedia' +
          '</p>' +
        '</div>' +
      '</div>' +

      // TAB BAR (hanya mobile)
      '<div class="er-panel-tabs" role="tablist">' +
        '<button class="er-panel-tab' + (activeTab === 'enrolled' ? ' active' : '') + '" ' +
          'onclick="_erSwitchPanelTab(\'enrolled\')" role="tab" aria-selected="' + (activeTab === 'enrolled') + '">' +
          '<i class="fas fa-users" aria-hidden="true"></i> Peserta' +
          '<span class="er-panel-tab-count">' + enrolledStudents.length + '</span>' +
        '</button>' +
        '<button class="er-panel-tab' + (activeTab === 'add' ? ' active' : '') + '" ' +
          'onclick="_erSwitchPanelTab(\'add\')" role="tab" aria-selected="' + (activeTab === 'add') + '">' +
          '<i class="fas fa-user-plus" aria-hidden="true"></i> Tambah' +
          '<span class="er-panel-tab-count">' + availableStudents.length + '</span>' +
        '</button>' +
      '</div>' +

      // DESKTOP: 2-kolom split
      '<div class="er-panel-split">' +

        // Kiri: Peserta Terdaftar
        '<div class="er-split-pane">' +
          '<div class="er-split-head">' +
            '<span class="er-split-head-title enrolled">' +
              '<i class="fas fa-users" aria-hidden="true"></i> Peserta (' + enrolledStudents.length + ')' +
            '</span>' +
          '</div>' +
          '<div class="er-split-body" id="er-enrolled-body">' + enrolledHTML + '</div>' +
        '</div>' +

        // Kanan: Tambah Peserta
        '<div class="er-split-pane">' +
          '<div class="er-split-head">' +
            '<span class="er-split-head-title available">' +
              '<i class="fas fa-user-plus" aria-hidden="true"></i> Tambah Peserta' +
            '</span>' +
            desktopBulkBtn +
          '</div>' +
          addSectionHead +
          '<div class="er-split-body er-available-body" style="padding-top:6px;">' + availableHTML + '</div>' +
        '</div>' +

      '</div>' +

      // MOBILE: single pane
      '<div class="er-panel-pane-mobile">' +
        (activeTab === 'enrolled'
          ? '<div class="er-split-body" style="max-height:none;padding:12px;gap:6px;display:flex;flex-direction:column;">' + enrolledHTML + '</div>'
          : '<div>' + addSectionHead + '<div class="er-split-body er-available-body" style="max-height:none;padding:10px;">' + availableHTML + '</div></div>'
        ) +
      '</div>' +

    '</div>';
}

// Helper: build HTML daftar siswa tersedia (reusable)
function _erBuildAvailableHTML(filteredAvailable, searchVal) {
  if (filteredAvailable.length > 0) {
    return filteredAvailable.map(function(s) {
      var isSel = _erState.bulkSelected.has(s.userID);
      return (
        '<div class="er-add-row' + (isSel ? ' selected' : '') + '" onclick="_erToggleBulk(\'' + _erEsc(s.userID) + '\')" ' +
          'role="checkbox" aria-checked="' + isSel + '" tabindex="0">' +
          '<div class="er-checkbox" aria-hidden="true">' + (isSel ? '<i class="fas fa-check"></i>' : '') + '</div>' +
          '<div class="er-student-avatar" style="width:28px;height:28px;font-size:11px;" aria-hidden="true">' + (s.nama || 'S').charAt(0).toUpperCase() + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="er-student-name" style="font-size:12px;">' + _erEsc(s.nama) + '</div>' +
            '<div class="er-student-sub">' + _erEsc(s.userID) + ' &middot; ' + _erEsc(s.kelas) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }
  var icon  = searchVal ? 'fas fa-search' : 'fas fa-check-circle';
  var color = !searchVal ? 'color:#059669;opacity:.6;' : '';
  var msg   = searchVal ? 'Tidak ada hasil pencarian.' : 'Semua siswa sudah terdaftar di ruangan.';
  return '<div class="er-empty"><i class="' + icon + ' er-empty-icon" style="' + color + '" aria-hidden="true"></i><p style="margin:0;">' + msg + '</p></div>';
}

// ── Switch tab panel (mobile) ─────────────────────────────────────────────────
function _erSwitchPanelTab(tab) {
  _erState.activePanelTab = tab;
  if (tab === 'add') {
    _erState.studentSearch = '';
    _erState.bulkSelected  = new Set();
  }
  _erRenderStudentPanel();
  if (tab === 'add') {
    setTimeout(function() {
      var inp = document.querySelector('#er-student-panel .er-search-input');
      if (inp) inp.focus();
    }, 80);
  }
}

// ── Toggle bulk select ────────────────────────────────────────────────────────
function _erToggleBulk(userID) {
  if (_erState.bulkSelected.has(userID)) {
    _erState.bulkSelected.delete(userID);
  } else {
    _erState.bulkSelected.add(userID);
  }
  _erRenderStudentPanel();
}

function _erToggleAllBulk(checked) {
  var searchVal = (_erState.studentSearch || '').toLowerCase().trim();
  var available = (_erState.students || []).filter(function(s) {
    if (s.assignedRoom) return false;
    if (!searchVal) return true;
    return s.nama.toLowerCase().includes(searchVal) ||
           s.kelas.toLowerCase().includes(searchVal) ||
           s.userID.toLowerCase().includes(searchVal);
  });
  if (checked) {
    available.forEach(function(s) { _erState.bulkSelected.add(s.userID); });
  } else {
    available.forEach(function(s) { _erState.bulkSelected.delete(s.userID); });
  }
  _erRenderStudentPanel();
}

// FIX B2-B4: _erStudentSearch diperbaiki — partial re-render yang benar-benar
// memperbarui SEMUA bagian terkait termasuk tombol bulk di desktop split-head
function _erStudentSearch(val) {
  _erState.studentSearch = val || '';
  _erState.bulkSelected  = new Set();
  _erRenderAvailableOnly();
}

// ── Partial re-render: hanya update daftar siswa tersedia (hemat re-render penuh) ──
// FIX B2-B4: rebuild tombol bulk di SEMUA lokasi (bukan hanya cek existing)
function _erRenderAvailableOnly() {
  var panel = document.getElementById('er-student-panel');
  if (!panel || !_erState.activeRoomID) return;

  var availableStudents = (_erState.students || []).filter(function(s) { return !s.assignedRoom; });
  var searchVal = (_erState.studentSearch || '').toLowerCase().trim();
  var filteredAvailable = searchVal
    ? availableStudents.filter(function(s) {
        return s.nama.toLowerCase().includes(searchVal) ||
               s.kelas.toLowerCase().includes(searchVal) ||
               s.userID.toLowerCase().includes(searchVal);
      })
    : availableStudents;

  var bulkCheckedAll = filteredAvailable.length > 0 &&
    filteredAvailable.every(function(s) { return _erState.bulkSelected.has(s.userID); });

  var availableHTML = _erBuildAvailableHTML(filteredAvailable, searchVal);

  var selectAllHTML = filteredAvailable.length > 0
    ? '<label class="er-select-all-label">' +
        '<input type="checkbox" id="er-check-all" ' + (bulkCheckedAll ? 'checked' : '') +
          ' onchange="_erToggleAllBulk(this.checked)" aria-label="Pilih semua siswa">' +
        ' Pilih semua (' + filteredAvailable.length + ')' +
      '</label>'
    : '';

  // Buat tombol bulk baru (FIX B3: rebuild, bukan update innerHTML existing)
  var bulkBtnHtml = _erState.bulkSelected.size > 0
    ? '<button onclick="_erBulkAdd()" class="er-bulk-add-btn">' +
        '<i class="fas fa-plus" aria-hidden="true"></i> Tambah (' + _erState.bulkSelected.size + ')' +
      '</button>'
    : '';
  var desktopBulkBtnHtml = _erState.bulkSelected.size > 0
    ? '<button onclick="_erBulkAdd()" class="er-bulk-add-btn" style="font-size:10px;padding:5px 10px;">' +
        '<i class="fas fa-plus" aria-hidden="true"></i> Tambah (' + _erState.bulkSelected.size + ')' +
      '</button>'
    : '';

  // Update daftar available di semua container
  panel.querySelectorAll('.er-available-body').forEach(function(container) {
    container.innerHTML = availableHTML;
  });

  // Update select-all wrap
  panel.querySelectorAll('.er-select-all-wrap').forEach(function(container) {
    container.innerHTML = selectAllHTML;
  });

  // FIX B2: Update tombol bulk di er-add-top-row (mobile & desktop add-section-head)
  panel.querySelectorAll('.er-add-top-row').forEach(function(wrap) {
    var existing = wrap.querySelector('.er-bulk-add-btn');
    if (existing) existing.remove();
    if (bulkBtnHtml) wrap.insertAdjacentHTML('beforeend', bulkBtnHtml);
  });

  // FIX B2: Update tombol bulk di desktop split-head (er-split-head kanan)
  var splitHeads = panel.querySelectorAll('.er-split-head');
  // splitHeads[1] adalah header kolom kanan (Tambah Peserta)
  if (splitHeads.length >= 2) {
    var rightHead = splitHeads[1];
    var existingDesktop = rightHead.querySelector('.er-bulk-add-btn');
    if (existingDesktop) existingDesktop.remove();
    if (desktopBulkBtnHtml) rightHead.insertAdjacentHTML('beforeend', desktopBulkBtnHtml);
  }

  // Update counter tab badge mobile
  var tabBadges = panel.querySelectorAll('.er-panel-tab-count');
  if (tabBadges.length >= 2) tabBadges[1].textContent = availableStudents.length;

  // Update checkbox "Pilih semua" jika sudah terender sebagai element
  var checkAll = document.getElementById('er-check-all');
  if (checkAll) checkAll.checked = bulkCheckedAll;

  // Fallback: jika struktur panel belum punya container yang diharapkan, full re-render
  if (!panel.querySelector('.er-available-body')) _erRenderStudentPanel();
}

// ── Tambah peserta (bulk) ─────────────────────────────────────────────────────
function _erBulkAdd() {
  var roomID = _erState.activeRoomID;
  if (!roomID || _erState.bulkSelected.size === 0) return;

  var ids = Array.from(_erState.bulkSelected);
  var prevRoomID = _erState.activeRoomID;

  // Disable semua tombol bulk-add agar tidak double-submit
  document.querySelectorAll('.er-bulk-add-btn').forEach(function(btn) {
    btn.disabled = true;
  });

  google.script.run
    .withSuccessHandler(function(res) {
      document.querySelectorAll('.er-bulk-add-btn').forEach(function(btn) {
        btn.disabled = false;
      });
      if (!res || !res.success) {
        Swal && Swal.fire({
          icon:'error', title:'Gagal',
          text: res ? res.message : 'Terjadi kesalahan.',
          confirmButtonColor:'#059669', customClass:{popup:'lp-swal'}
        });
        return;
      }
      var skipInfo = '';
      if (res.skipped > 0 && Array.isArray(res.skippedReasons) && res.skippedReasons.length > 0) {
        skipInfo = '<p style="font-size:11px;color:#94a3b8;margin-top:6px;">' +
          '<i class="fas fa-info-circle" style="margin-right:4px;"></i>' +
          res.skipped + ' siswa dilewati: ' +
          _erEsc(res.skippedReasons.slice(0, 3).join('; ')) +
          (res.skippedReasons.length > 3 ? '...' : '') + '</p>';
      }
      Swal && Swal.fire({
        icon:'success', title:'Berhasil!',
        html: '<p style="font-size:13px;">' + _erEsc(res.message) + '</p>' + skipInfo,
        confirmButtonColor:'#059669', customClass:{popup:'lp-swal'},
        timer: 2500, showConfirmButton: false
      });
      _erOnExamChange(_erState.selectedExamID, false, prevRoomID);
    })
    .withFailureHandler(function(err) {
      document.querySelectorAll('.er-bulk-add-btn').forEach(function(btn) {
        btn.disabled = false;
      });
      Swal && Swal.fire({
        icon:'error', title:'Error',
        text: err && err.message ? err.message : 'Koneksi gagal.',
        confirmButtonColor:'#059669', customClass:{popup:'lp-swal'}
      });
    })
    .addStudentsToRoom(roomID, ids, currentUser.userID, currentUser.token);
}

// ── Keluarkan peserta ─────────────────────────────────────────────────────────
function _erRemoveStudent(roomID, studentID) {
  var s = (_erState.students || []).find(function(st) { return st.userID === studentID; });
  var studentName = s ? s.nama : studentID;
  var prevRoomID = _erState.activeRoomID;

  Swal && Swal.fire({
    title: 'Keluarkan Peserta?',
    html: '<p style="font-size:13px;color:#475569;">Yakin mengeluarkan <b>' + _erEsc(studentName) + '</b> dari ruangan ini?</p>',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: '<i class="fas fa-times"></i> Keluarkan',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(function(result) {
    if (!result.isConfirmed) return;
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.success) {
          Swal && Swal.fire({ icon:'error', title:'Gagal', text: res ? res.message : 'Terjadi kesalahan.', confirmButtonColor:'#059669', customClass:{popup:'lp-swal'} });
          return;
        }
        _erOnExamChange(_erState.selectedExamID, false, prevRoomID);
      })
      .withFailureHandler(function(err) {
        Swal && Swal.fire({ icon:'error', title:'Error', text: err && err.message ? err.message : 'Koneksi gagal.', confirmButtonColor:'#059669', customClass:{popup:'lp-swal'} });
      })
      .removeStudentFromRoom(roomID, studentID, currentUser.userID, currentUser.token);
  });
}

// ── Form Tambah / Edit Ruang ──────────────────────────────────────────────────
function _erOpenRoomForm(roomID) {
  var modal   = document.getElementById('er-room-modal');
  var title   = document.getElementById('er-modal-title');
  var nameIn  = document.getElementById('er-modal-room-name');
  var svSel   = document.getElementById('er-modal-sv-assign');
  var idIn    = document.getElementById('er-modal-room-id');
  var capIn   = document.getElementById('er-modal-capacity');
  var errEl   = document.getElementById('er-modal-err');
  if (!modal) return;

  if (errEl) { errEl.style.display = 'none'; errEl.innerHTML = ''; errEl.classList.remove('er-shake'); }
  if (nameIn) nameIn.classList.remove('er-input-error');
  if (capIn)  capIn.classList.remove('er-input-error');

  if (roomID) {
    var room = (_erState.rooms || []).find(function(r) { return r.id === roomID; });
    if (!room) return;
    if (title)  title.innerHTML = '<i class="fas fa-pen" style="margin-right:8px;opacity:.85;" aria-hidden="true"></i>Edit Ruang Ujian';
    if (nameIn) nameIn.value = room.roomName;
    if (idIn)   idIn.value   = roomID;
    if (capIn)  capIn.value  = (room.capacity && room.capacity > 0) ? room.capacity : '';
    if (svSel)  svSel.value  = room.supervisorAssignID || '';
    _erPopulateSvDropdown();
  } else {
    if (title)  title.innerHTML = '<i class="fas fa-plus" style="margin-right:8px;opacity:.85;" aria-hidden="true"></i>Tambah Ruang Ujian';
    if (nameIn) nameIn.value = '';
    if (idIn)   idIn.value   = '';
    if (capIn)  capIn.value  = '';
    if (svSel)  svSel.value  = '';
    _erPopulateSvDropdown();
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (nameIn) setTimeout(function() { nameIn.focus(); }, 160);
}

function _erCloseRoomForm() {
  var modal = document.getElementById('er-room-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function _erModalBackdrop(e) {
  if (e.target === e.currentTarget) _erCloseRoomForm();
}

// FIX U5: Escape key handler untuk menutup modal
function _erBindEscKey() {
  // Hapus listener lama jika ada (dari sesi sebelumnya)
  if (window._erEscHandler) {
    document.removeEventListener('keydown', window._erEscHandler);
  }
  window._erEscHandler = function(e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('er-room-modal');
      if (modal && modal.classList.contains('open')) {
        _erCloseRoomForm();
      }
    }
  };
  document.addEventListener('keydown', window._erEscHandler);
}

function _erSaveRoom() {
  var nameIn  = document.getElementById('er-modal-room-name');
  var svSel   = document.getElementById('er-modal-sv-assign');
  var idIn    = document.getElementById('er-modal-room-id');
  var capIn   = document.getElementById('er-modal-capacity');
  var errEl   = document.getElementById('er-modal-err');
  var saveBtn = document.getElementById('er-modal-save-btn');

  var roomName = (nameIn ? nameIn.value : '').trim();
  var svAssign = svSel ? svSel.value : '';
  var roomID   = idIn  ? idIn.value  : '';
  var capRaw   = capIn ? capIn.value.trim() : '';
  var capacity = capRaw === '' ? 0 : parseInt(capRaw, 10);

  // Bersihkan error lama
  if (errEl) { errEl.style.display = 'none'; errEl.innerHTML = ''; errEl.classList.remove('er-shake'); }
  if (nameIn) nameIn.classList.remove('er-input-error');
  if (capIn)  capIn.classList.remove('er-input-error');

  // Validasi nama
  if (!roomName) {
    if (nameIn) { nameIn.classList.add('er-input-error'); nameIn.focus(); }
    if (errEl) {
      errEl.innerHTML = '<i class="fas fa-exclamation-circle" style="flex-shrink:0;" aria-hidden="true"></i> Nama ruang tidak boleh kosong.';
      errEl.style.display = 'flex';
      // FIX C11: tambahkan shake class (bukan inline animation) agar overflow terkontrol
      errEl.classList.add('er-shake');
      setTimeout(function() { if (errEl) errEl.classList.remove('er-shake'); }, 400);
    }
    return;
  }

  // Validasi kapasitas
  if (capRaw !== '' && (isNaN(capacity) || capacity < 0 || !Number.isInteger(capacity))) {
    if (capIn) { capIn.classList.add('er-input-error'); capIn.focus(); }
    if (errEl) {
      errEl.innerHTML = '<i class="fas fa-exclamation-circle" style="flex-shrink:0;" aria-hidden="true"></i> Kapasitas harus berupa angka bulat &ge; 0.';
      errEl.style.display = 'flex';
      errEl.classList.add('er-shake');
      setTimeout(function() { if (errEl) errEl.classList.remove('er-shake'); }, 400);
    }
    return;
  }

  var form = {
    examID:             _erState.selectedExamID,
    roomName:           roomName,
    supervisorAssignID: svAssign,
    capacity:           capacity
  };

  var isEdit = !!roomID;

  // Loading state
  if (saveBtn) {
    saveBtn.classList.add('er-loading-btn');
    saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Menyimpan...';
    saveBtn.disabled = true;
  }

  var runner = google.script.run
    .withSuccessHandler(function(res) {
      if (saveBtn) {
        saveBtn.classList.remove('er-loading-btn');
        saveBtn.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> Simpan';
        saveBtn.disabled = false;
      }
      if (!res || !res.success) {
        if (errEl) {
          errEl.innerHTML = '<i class="fas fa-exclamation-circle" style="flex-shrink:0;" aria-hidden="true"></i> ' + _erEsc(res ? res.message : 'Terjadi kesalahan.');
          errEl.style.display = 'flex';
          errEl.classList.add('er-shake');
          setTimeout(function() { if (errEl) errEl.classList.remove('er-shake'); }, 400);
        }
        return;
      }
      _erCloseRoomForm();
      Swal && Swal.fire({
        icon:'success', title: isEdit ? 'Diperbarui!' : 'Dibuat!',
        text: res.message,
        confirmButtonColor:'#059669', customClass:{popup:'lp-swal'},
        timer: 1800, showConfirmButton: false
      });
      var prevRoomID = isEdit ? (_erState.activeRoomID === roomID ? roomID : _erState.activeRoomID) : null;
      _erOnExamChange(_erState.selectedExamID, false, prevRoomID);
      if (isEdit) _svMgmtSyncIfActive();
      if (isEdit && res.roomNameChanged && res.examID && res.oldRoomName && res.newRoomName) {
        _svMgmtUpdateRoomNameCache(res.examID, res.oldRoomName, res.newRoomName);
      }
    })
    .withFailureHandler(function(err) {
      if (saveBtn) {
        saveBtn.classList.remove('er-loading-btn');
        saveBtn.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> Simpan';
        saveBtn.disabled = false;
      }
      if (errEl) {
        errEl.innerHTML = '<i class="fas fa-exclamation-circle" style="flex-shrink:0;" aria-hidden="true"></i> ' + _erEsc(err && err.message ? err.message : 'Koneksi gagal.');
        errEl.style.display = 'flex';
        errEl.classList.add('er-shake');
        setTimeout(function() { if (errEl) errEl.classList.remove('er-shake'); }, 400);
      }
    });

  if (isEdit) {
    runner.updateExamRoom({ id: roomID, roomName: roomName, supervisorAssignID: svAssign, capacity: capacity },
                          currentUser.userID, currentUser.token);
  } else {
    runner.createExamRoom(form, currentUser.userID, currentUser.token);
  }
}

// ── Hapus ruang ───────────────────────────────────────────────────────────────
function _erDeleteRoom(roomID) {
  var room = (_erState.rooms || []).find(function(r) { return r.id === roomID; });
  var roomName = room ? room.roomName : roomID;

  Swal && Swal.fire({
    title: 'Hapus Ruang Ujian?',
    html: '<p style="font-size:13px;color:#475569;">Yakin menghapus ruang <b>' + _erEsc(roomName) + '</b>?<br>' +
          '<span style="color:#dc2626;font-size:11px;">Semua data peserta di ruang ini juga akan dihapus.</span></p>',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: '<i class="fas fa-trash"></i> Hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(function(result) {
    if (!result.isConfirmed) return;
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.success) {
          Swal && Swal.fire({ icon:'error', title:'Gagal', text: res ? res.message : 'Terjadi kesalahan.', confirmButtonColor:'#059669', customClass:{popup:'lp-swal'} });
          return;
        }
        if (_erState.activeRoomID === roomID) _erState.activeRoomID = null;
        // FIX B6: langsung reload tanpa menunggu Swal timer selesai
        _erOnExamChange(_erState.selectedExamID);
        Swal && Swal.fire({
          icon:'success', title:'Dihapus!', text:'Ruang ujian berhasil dihapus.',
          confirmButtonColor:'#059669', customClass:{popup:'lp-swal'},
          timer: 1800, showConfirmButton: false
        });
      })
      .withFailureHandler(function(err) {
        Swal && Swal.fire({ icon:'error', title:'Error', text: err && err.message ? err.message : 'Koneksi gagal.', confirmButtonColor:'#059669', customClass:{popup:'lp-swal'} });
      })
      .deleteExamRoom(roomID, currentUser.userID, currentUser.token);
  });
}

// ── Util ──────────────────────────────────────────────────────────────────────
function _erEsc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function _erTrunc(str, max) {
  var s = String(str || '');
  return s.length > max ? s.substring(0, max) + '\u2026' : s;
}

// ── Sinkronisasi dari halaman lain (mis. Manajemen Pengawas) ─────────────────
// Dipanggil setelah operasi CRUD pengawas berhasil di halaman manapun.
// Jika halaman Ruang Ujian sedang aktif (DOM ada) dan menampilkan ujian yang
// relevan, refresh daftar ruang agar nama pengawas langsung terupdate.
function _erSyncIfActive(examID) {
  if (!examID) return;
  if (!document.getElementById('er-page')) return;
  if (!_erState || _erState.selectedExamID !== examID) return;
  _erOnExamChange(examID, false, _erState.activeRoomID || null);
}

// ── Sinkronisasi balik ke Manajemen Pengawas (dari Ruang Ujian) ───────────────
function _svMgmtSyncIfActive() {
  if (!document.getElementById('svm-table-wrap')) return;
  if (typeof _svMgmtRefresh === 'function') _svMgmtRefresh();
}

// ── Update cache assignments Manajemen Pengawas secara in-place ──────────────
function _svMgmtUpdateRoomNameCache(examID, oldRoomName, newRoomName) {