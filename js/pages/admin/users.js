/**
 * users.js — Manajemen User + Monitor Ujian
 * renderUserManagement() + _um* + monitor functions
 * Sumber: index.html L30185-32337
 */

function renderUserManagement(container) {
  // State
  if (!window._userUI) {
    window._userUI = {
      filterRole: '',
      filterStatus: '',  // ''|'TRUE'|'FALSE'
      filterClass: '',
      search: '',
      sortBy: 'username',  // username | id | role | class | status
      sortDir: 'asc',
      page: 1,
      pageSize: 25,
      revealedPwd: new Set()
    };
  }

  container.innerHTML = `
  <div class="fade-in w-full space-y-4">

    <!-- TAB BAR -->
    <div class="um-tabbar">
      <button id="tab-btn-users" class="um-tab active" onclick="switchUserMgmtTab('users')">
        <i class="fas fa-users-cog"></i><span>Data Pengguna</span>
      </button>
      <button id="tab-btn-monitor" class="um-tab" onclick="switchUserMgmtTab('monitor')">
        <i class="fas fa-satellite-dish"></i><span>Monitor Ujian</span>
        <span id="monitor-live-badge" class="um-live-dot hidden"></span>
      </button>
    </div>

    <!-- ── TAB PANEL: DATA PENGGUNA ── -->
    <div id="tab-panel-users" class="w-full space-y-3">
      <div class="um-header">
        <div>
          <h2><i class="fas fa-users-cog mr-2"></i>Data Pengguna</h2>
          <p>Kelola akun Siswa, Guru, dan Admin di seluruh sistem.</p>
        </div>
        <div class="um-header-actions">
          <button id="btn-bulk-download" onclick="handleBulkDownload()" class="um-header-btn" style="display:none;">
            <i class="fas fa-file-archive"></i> <span class="hidden sm:inline">Download ZIP</span>
            <span class="um-count-badge" id="count-badge">0</span>
          </button>
          <button onclick="openImportUserModal()" class="um-header-btn">
            <i class="fas fa-file-excel"></i> <span class="hidden sm:inline">Import Excel</span>
          </button>
          <button onclick="openUserModal()" class="um-header-btn solid">
            <i class="fas fa-user-plus"></i> <span class="hidden sm:inline">Tambah User</span>
          </button>
        </div>
      </div>

      <!-- Stats + filter mounts -->
      <div id="um-stats-mount"></div>
      <div id="um-filter-mount"></div>
      <div id="um-bulk-mount"></div>

      <!-- Content -->
      <div id="um-content-area">
        <div class="um-table-wrap"><div class="p-6">
          ${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}
        </div></div>
      </div>
    </div>

    <!-- ── TAB PANEL: MONITOR UJIAN (existing) ── -->
    <div id="tab-panel-monitor" class="w-full space-y-4 hidden">

      <!-- Header + Kontrol Live Mode -->
      <div class="dash-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i class="fas fa-satellite-dish text-green-500"></i> Monitor Ujian Real-time
          </h2>
          <p class="text-sm text-slate-500 mt-1">Pantau status siswa saat ujian berlangsung.</p>
        </div>
        <div class="flex gap-2 items-center flex-wrap">
          <!-- Countdown ring (tampil saat live mode ON) -->
          <div id="monitor-countdown-wrap" class="monitor-countdown-wrap">
            <svg class="monitor-countdown-ring" viewBox="0 0 28 28">
              <circle class="ring-bg" cx="14" cy="14" r="11"/>
              <circle class="ring-fg" id="monitor-ring-fg" cx="14" cy="14" r="11"
                stroke-dasharray="69.1" stroke-dashoffset="0"/>
            </svg>
            <span id="monitor-countdown-txt">30</span>d
          </div>
          <!-- Tombol Live Mode -->
          <button id="btn-live-mode" onclick="toggleMonitorLiveMode()"
            class="monitor-live-btn off" title="Aktifkan auto-refresh otomatis">
            <span class="live-dot"></span>
            <span id="btn-live-label">Live Mode</span>
          </button>
          <span id="monitor-last-update" class="text-xs text-slate-400 font-mono"></span>
          <!-- Tombol Export -->
          <button onclick="exportMonitorToExcel()" id="btn-export-monitor"
            class="monitor-export-btn" title="Export data monitor ke Excel">
            <i class="fas fa-file-excel"></i> Export
          </button>
          <button onclick="loadMonitorData()" id="btn-refresh-monitor"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow transition flex items-center gap-2 active:scale-95">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <!-- Tombol Kirim Pesan -->
          <button onclick="openSendNotifModal('all')"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow transition flex items-center gap-2 active:scale-95" title="Kirim pesan notifikasi ke siswa">
            <i class="fas fa-paper-plane"></i> Kirim Pesan
          </button>
        </div>
      </div>

      <!-- EXAM SELECTOR BAR -->
      <div class="monitor-exam-bar" id="monitor-exam-bar">
        <span class="monitor-exam-label">
          <i class="fas fa-book-open"></i> Ujian Aktif
          <span id="monitor-exam-active-count" class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black">0</span>
        </span>
        <div class="monitor-exam-chips" id="monitor-exam-chips">
          <span class="monitor-exam-empty"><i class="fas fa-circle-notch fa-spin text-xs"></i> Memuat ujian...</span>
        </div>
      </div>

      <!-- STAT CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div id="stat-belum-login" onclick="filterMonitorTab('belumLogin')"
          class="monitor-stat-card dash-card p-4 cursor-pointer border-2 border-transparent hover:border-slate-300 transition select-none">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-base"><i class="fas fa-user-clock"></i></div>
            <span id="count-belum-login" class="text-3xl font-black text-slate-500">-</span>
          </div>
          <p class="text-sm font-bold text-slate-600">Belum Login</p>
          <p class="text-xs text-slate-400 mt-0.5">Belum masuk sistem</p>
        </div>
        <div id="stat-login" onclick="filterMonitorTab('sudahLogin')"
          class="monitor-stat-card dash-card p-4 cursor-pointer border-2 border-transparent hover:border-sky-300 transition select-none">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-base"><i class="fas fa-sign-in-alt"></i></div>
            <span id="count-login" class="text-3xl font-black text-sky-600">-</span>
          </div>
          <p class="text-sm font-bold text-slate-600">Sudah Login</p>
          <p class="text-xs text-slate-400 mt-0.5">Belum mulai ujian</p>
        </div>
        <div id="stat-mengerjakan" onclick="filterMonitorTab('mengerjakan')"
          class="monitor-stat-card dash-card p-4 cursor-pointer border-2 border-transparent hover:border-amber-300 transition select-none">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-base"><i class="fas fa-pencil-alt"></i></div>
            <span id="count-mengerjakan" class="text-3xl font-black text-amber-600">-</span>
          </div>
          <p class="text-sm font-bold text-slate-600">Mengerjakan</p>
          <p class="text-xs text-slate-400 mt-0.5">Sedang dalam ujian</p>
        </div>
        <div id="stat-selesai" onclick="filterMonitorTab('selesai')"
          class="monitor-stat-card dash-card p-4 cursor-pointer border-2 border-transparent hover:border-emerald-300 transition select-none">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-base"><i class="fas fa-check-circle"></i></div>
            <span id="count-selesai" class="text-3xl font-black text-emerald-600">-</span>
          </div>
          <p class="text-sm font-bold text-slate-600">Selesai</p>
          <p class="text-xs text-slate-400 mt-0.5">Ujian telah dikumpulkan</p>
        </div>
        <div id="stat-curang" onclick="filterMonitorTab('curang')"
          class="monitor-stat-card dash-card p-4 cursor-pointer border-2 border-transparent hover:border-red-300 transition select-none">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-base"><i class="fas fa-user-shield"></i></div>
            <span id="count-curang" class="text-3xl font-black text-red-600">-</span>
          </div>
          <p class="text-sm font-bold text-slate-600">Curang</p>
          <p class="text-xs text-slate-400 mt-0.5">Diblokir sistem</p>
        </div>
      </div>

      <!-- FILTER BAR: Status + Kelas + Mapel + Search -->
      <div class="dash-card p-4 space-y-3">
        <!-- Baris 1: Tab Status -->
        <div class="flex gap-1 flex-wrap" id="monitor-filter-tabs">
          <button onclick="filterMonitorTab('semua')" data-tab="semua"
            class="monitor-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-700 text-white">
            <i class="fas fa-list mr-1"></i>Semua
          </button>
          <button onclick="filterMonitorTab('belumLogin')" data-tab="belumLogin"
            class="monitor-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700">
            <i class="fas fa-user-clock mr-1"></i>Belum Login
          </button>
          <button onclick="filterMonitorTab('sudahLogin')" data-tab="sudahLogin"
            class="monitor-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-100 text-slate-600 hover:bg-sky-100 hover:text-sky-700">
            <i class="fas fa-sign-in-alt mr-1"></i>Login
          </button>
          <button onclick="filterMonitorTab('mengerjakan')" data-tab="mengerjakan"
            class="monitor-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700">
            <i class="fas fa-pencil-alt mr-1"></i>Mengerjakan
          </button>
          <button onclick="filterMonitorTab('selesai')" data-tab="selesai"
            class="monitor-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700">
            <i class="fas fa-check-circle mr-1"></i>Selesai
          </button>
          <button onclick="filterMonitorTab('curang')" data-tab="curang"
            class="monitor-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700">
            <i class="fas fa-user-shield mr-1"></i>Curang
          </button>
        </div>
        <!-- Baris 2: Filter Kelas, Mapel, Pelanggaran, Search -->
        <div class="flex flex-col md:flex-row gap-2">
          <select id="monitor-filter-kelas" onchange="applyMonitorFilters()"
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 bg-white cursor-pointer shadow-sm flex-shrink-0 md:w-44">
            <option value="">Semua Kelas</option>
          </select>
          <select id="monitor-filter-mapel" onchange="applyMonitorFilters()"
            class="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700 bg-white cursor-pointer shadow-sm flex-shrink-0 md:w-52">
            <option value="">Semua Mata Pelajaran</option>
          </select>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <label class="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
              <i class="fas fa-exclamation-triangle text-orange-400 text-[10px]"></i>
              Pelanggaran &gt;
            </label>
            <input type="number" id="monitor-filter-viol" min="0" step="1" value=""
              placeholder="–" oninput="applyMonitorFilters()"
              title="Tampilkan hanya siswa dengan pelanggaran lebih dari N kali"
              class="w-16 border border-slate-300 rounded-lg px-2 py-2 text-sm text-center focus:ring-2 focus:ring-orange-400 outline-none font-bold text-slate-700 bg-white shadow-sm">
            <button onclick="document.getElementById('monitor-filter-viol').value='';applyMonitorFilters();"
              title="Reset filter pelanggaran"
              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-400 text-xs flex items-center justify-center transition">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><i class="fas fa-search text-xs"></i></div>
            <input type="text" id="monitor-search-input" placeholder="Cari nama, ID siswa..."
              oninput="applyMonitorFilters()"
              class="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm bg-white">
          </div>
        </div>
      </div>

      <!-- BULK ACTION TOOLBAR -->
      <div id="monitor-bulk-toolbar" class="hidden dash-card px-5 py-3 bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-check-square text-white text-sm"></i>
          </div>
          <span class="font-bold text-blue-800 text-sm">
            <span id="monitor-selected-count">0</span> siswa dipilih
          </span>
          <button onclick="monitorClearSelection()" class="text-xs text-blue-500 hover:text-blue-700 underline font-medium">Batalkan</button>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button id="btn-bulk-unlock" onclick="handleBulkUnlock()"
            class="hidden px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95">
            <i class="fas fa-lock-open"></i> Buka Blokir Terpilih
          </button>
          <button id="btn-bulk-msg" onclick="openSendNotifModal('selected')"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95">
            <i class="fas fa-paper-plane"></i> Kirim Pesan Terpilih
          </button>
          <button id="btn-bulk-reset" onclick="handleBulkReset()"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95">
            <i class="fas fa-undo-alt"></i> Reset Ujian Terpilih
          </button>
        </div>
      </div>

      <!-- TABEL MONITOR -->
      <div id="monitor-table-wrapper" class="dash-card overflow-hidden min-h-[200px]">
        <div class="flex flex-col items-center justify-center h-48 text-slate-400">
          <i class="fas fa-satellite-dish text-3xl mb-2 text-slate-200"></i>
          <p class="text-sm">Klik <strong>Refresh</strong> untuk memuat data monitor.</p>
        </div>
      </div>

    </div>
  </div>`;

  const isGuru = currentUser && currentUser.role === 'Guru';
  const tabUsersBtn   = document.getElementById('tab-btn-users');
  const tabMonitorBtn = document.getElementById('tab-btn-monitor');
  const panelUsers    = document.getElementById('tab-panel-users');
  const panelMonitor  = document.getElementById('tab-panel-monitor');

  // ── Sync state UI monitor setelah DOM di-render ulang ──────────────────
  // Setiap kali renderUserManagement() dipanggil, container.innerHTML di-overwrite
  // sehingga tombol/elemen monitor yang baru harus di-sync dengan state JS.
  _syncMonitorUIState();

  if (isGuru) {
    if (tabUsersBtn) tabUsersBtn.style.display = 'none';
    if (panelUsers)  panelUsers.classList.add('hidden');
    if (panelMonitor) panelMonitor.classList.remove('hidden');
    if (tabMonitorBtn) tabMonitorBtn.classList.add('active');
    if (tabUsersBtn)   tabUsersBtn.classList.remove('active');
    // Live Mode aktif secara default saat Guru masuk panel monitor
    _startMonitorLive();
  } else {
    if (tabUsersBtn) tabUsersBtn.style.display = '';
    if (panelUsers)  panelUsers.classList.remove('hidden');
    if (panelMonitor) panelMonitor.classList.add('hidden');
    if (tabUsersBtn) tabUsersBtn.classList.add('active');
    if (tabMonitorBtn) tabMonitorBtn.classList.remove('active');
    if (typeof selectedUsers !== 'undefined') selectedUsers.clear();
    loadUserTable();
  }

  if (!document.getElementById('modal-user')) createUserModalHTML();
  if (!document.getElementById('modal-import-user')) {
    if (typeof createImportUserModalHTML === 'function') createImportUserModalHTML();
  }
}


function updateUserSelection(id, checkbox) {
    if (checkbox.checked) {
        selectedUsers.add(id);
    } else {
        selectedUsers.delete(id);
    }
    updateBulkButtonState();
    if (typeof _umRenderBulk === 'function') _umRenderBulk();
    // Highlight selected row in the table without full re-render
    document.querySelectorAll('.um-table tbody tr').forEach((tr, idx) => {
      const cb = tr.querySelector('.user-checkbox');
      if (cb && cb.value === id) tr.classList.toggle('selected', !!checkbox.checked);
    });
}

function toggleSelectAllUsers(source) {
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = source.checked;
        if (source.checked) selectedUsers.add(cb.value);
        else selectedUsers.delete(cb.value);
    });
    updateBulkButtonState();
    if (typeof _umRenderBulk === 'function') _umRenderBulk();
    document.querySelectorAll('.um-table tbody tr').forEach(tr => {
      tr.classList.toggle('selected', !!source.checked);
    });
}

function updateBulkButtonState() {
    const btn = document.getElementById('btn-bulk-download');
    const badge = document.getElementById('count-badge');
    const count = (typeof selectedUsers !== 'undefined' && selectedUsers) ? selectedUsers.size : 0;

    if (badge) badge.innerText = count;

    if (btn) {
      if (count > 0) btn.style.display = 'inline-flex';
      else           btn.style.display = 'none';
    }
}

function _validateKartuConfig(onValid) {
    function _showKartuCfgError(tplSet, folSet) {
        var missing = [];
        if (!tplSet) missing.push('<li class="flex items-center gap-2"><i class="fas fa-times-circle text-red-400"></i><span><b>Template ID</b> belum diisi</span></li>');
        if (!folSet) missing.push('<li class="flex items-center gap-2"><i class="fas fa-times-circle text-red-400"></i><span><b>Folder ID</b> belum diisi</span></li>');

        Swal.fire({
            icon: 'warning',
            title: 'Konfigurasi Kartu Belum Lengkap',
            html: '<p class="text-sm text-slate-600 mb-3">Sebelum mencetak kartu ujian, pastikan Admin telah mengisi konfigurasi berikut di halaman <b>Konfigurasi &rarr; Kartu Ujian Siswa</b>:</p>' +
                  '<ul class="text-left text-sm text-slate-700 space-y-2 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3">' +
                  missing.join('') +
                  '</ul>' +
                  '<p class="text-xs text-slate-400">Hubungi Admin jika Anda bukan pengelola konfigurasi.</p>',
            confirmButtonText: '<i class="fas fa-cog mr-1"></i> Buka Konfigurasi',
            confirmButtonColor: '#2563eb',
            showCancelButton: true,
            cancelButtonText: 'Tutup',
            cancelButtonColor: '#64748b',
            reverseButtons: true
        }).then(function(r) {
            if (r.isConfirmed) {
                var cfgMenu = document.querySelector('[data-tab="dash-config"]');
                if (cfgMenu) cfgMenu.click();
                setTimeout(function() { switchCfgTab('kartu'); }, 400);
            }
        });
    }

    if (window._kartuCfg && window._kartuCfg.loaded) {
        if (window._kartuCfg.tplSet && window._kartuCfg.folSet) {
            onValid();
        } else {
            _showKartuCfgError(window._kartuCfg.tplSet, window._kartuCfg.folSet);
        }
        return;
    }

    Swal.fire({
        title: 'Memeriksa Konfigurasi...',
        html: '<p class="text-sm text-slate-500">Memvalidasi pengaturan kartu ujian.</p>',
        allowOutsideClick: false,
        didOpen: function() { Swal.showLoading(); }
    });

    google.script.run
        .withSuccessHandler(function(res) {
            Swal.close();
            if (res && res.success && res.data) {
                var d = res.data;
                window._kartuCfg = {
                    tplSet : !!d.kartu_template_id_set,
                    folSet : !!d.kartu_folder_id_set,
                    loaded : true
                };
                if (window._kartuCfg.tplSet && window._kartuCfg.folSet) {
                    onValid();
                } else {
                    _showKartuCfgError(window._kartuCfg.tplSet, window._kartuCfg.folSet);
                }
            } else {
                console.warn('_validateKartuConfig: gagal baca config, lanjutkan tanpa validasi.');
                onValid();
            }
        })
        .withFailureHandler(function() {
            Swal.close();
            console.warn('_validateKartuConfig: koneksi gagal, lanjutkan tanpa validasi.');
            onValid();
        })
        .getAppConfig();
}

function handleBulkDownload() {
    const idsToDownload = Array.from(selectedUsers);

    if (idsToDownload.length === 0) return;

    _validateKartuConfig(function() {
        _doBulkDownload(idsToDownload);
    });
}

function _doBulkDownload(idsToDownload) {
    const processId = 'PROC-' + new Date().getTime();
    let progressInterval; 
    Swal.fire({
        title: 'Memproses Download',
        html: `
            <div class="text-sm text-slate-500 mb-2">Mohon jangan tutup halaman ini...</div>
            
            <div class="w-full bg-slate-200 rounded-full h-4 mb-2 overflow-hidden">
                <div id="swal-progress-bar" class="bg-purple-600 h-4 rounded-full transition-all duration-300" style="width: 0%"></div>
            </div>
            
            <div id="swal-progress-text" class="font-bold text-slate-700">Menyiapkan data...</div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false, 
        didOpen: () => {
            progressInterval = setInterval(() => {
                google.script.run
                    .withSuccessHandler(status => {
                        if (status) {
                            const parts = status.split('/');
                            const current = parseInt(parts[0]);
                            const total = parseInt(parts[1]);
                            const percent = Math.round((current / total) * 100);

                            const bar = document.getElementById('swal-progress-bar');
                            const text = document.getElementById('swal-progress-text');

                            if (bar && text) {
                                bar.style.width = percent + '%';
                                text.innerText = `Memproses ${current} dari ${total} kartu (${percent}%)`;
                            }
                        }
                    })
                    .checkDownloadProgress(processId);
            }, 1000);
        }
    });

    google.script.run
        .withSuccessHandler(res => {
            clearInterval(progressInterval); 
            Swal.close(); 

            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Selesai!',
                    text: res.message,
                    confirmButtonText: '<i class="fas fa-download"></i> Download ZIP',
                    confirmButtonColor: '#9333ea',
                    preConfirm: () => {
                        window.open(res.url, '_blank');
                    }
                });
                selectedUsers.clear();
                document.querySelectorAll('.user-checkbox').forEach(cb => cb.checked = false);
                if(typeof updateBulkButtonState === 'function') updateBulkButtonState();
            } else {
                Swal.fire('Gagal', res.message, 'error');
            }
        })
        .withFailureHandler(err => {
            clearInterval(progressInterval); 
            Swal.fire('Error', err.message, 'error');
        })
        .downloadKartuMassal(idsToDownload, processId); 
}

function handleDownloadKartu(userId) {
    _validateKartuConfig(function() {
        _doDownloadKartu(userId);
    });
}

function _doDownloadKartu(userId) {
    Swal.fire({
        title: 'Sedang Memproses PDF...',
        text: 'Mohon tunggu sebentar.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    google.script.run
        .withSuccessHandler(res => {
            Swal.close();
            if (res.success) {
                const win = window.open(res.url, '_blank');
                if (!win) {
                    Swal.fire('Info', 'Mohon izinkan popup untuk mengunduh kartu.', 'info');
                }
            } else {
                Swal.fire('Gagal', res.message, 'error');
            }
        })
        .withFailureHandler(err => {
            Swal.close();
            Swal.fire('Error', 'Terjadi kesalahan sistem: ' + err, 'error');
        })
        .downloadKartuSiswa(userId); 
}

function loadUserTable() {
    const area = document.getElementById('um-content-area');

    if (!currentUser || !currentUser.userID || !currentUser.token) {
        Swal.fire({
          title:'Sesi Tidak Valid',
          html:'<p style="font-size:13px;color:#475569;">Silakan login ulang untuk melanjutkan.</p>',
          icon:'error', confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        }).then(() => location.reload());
        return;
    }

    if (area) {
      area.innerHTML = `
        <div class="um-table-wrap"><div class="p-6">
          ${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}
        </div></div>`;
    }

    google.script.run
        .withSuccessHandler(users => {
            allUsersData = Array.isArray(users) ? users : [];
            filteredUsers = allUsersData.slice();
            currentUserPage = 1;
            if (window._userUI) window._userUI.page = 1;
            _refreshUsersUI();
        })
        .withFailureHandler(error => {
            console.error("Gagal memuat user:", error);
            const msg = (error && error.message) ? error.message : String(error);
            if (area) {
                area.innerHTML = `
                  <div class="dash-error-state max-w-md mx-auto">
                    <div class="ico"><i class="fas fa-shield-halved"></i></div>
                    <h3 class="font-bold text-base text-red-700 mb-1">Gagal Memuat Data Pengguna</h3>
                    <p class="text-xs text-red-600 mb-4">${String(msg).replace(/</g,'&lt;')}</p>
                    <button onclick="loadUserTable()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
                      <i class="fas fa-rotate-right"></i> Coba Lagi
                    </button>
                  </div>`;
            }
        })
        .getUserList(currentUser.userID, currentUser.token);
}

function _refreshUsersUI() {
  const ui  = window._userUI;
  const raw = Array.isArray(allUsersData) ? allUsersData : [];
  const isGuru = currentUser && currentUser.role === 'Guru';

  // Filter
  const search = String(ui.search || '').toLowerCase().trim();
  const filtered = raw.filter(u => {
    const username = String(u.username || '');
    const id       = String(u.id || '');
    const cls      = String(u.class || '');
    const role     = String(u.role || '');
    const isAct    = String(u.isActive || '').toUpperCase().trim() === 'TRUE';

    if (ui.filterRole   && role !== ui.filterRole) return false;
    if (ui.filterStatus === 'TRUE'  && !isAct) return false;
    if (ui.filterStatus === 'FALSE' && isAct)  return false;
    if (ui.filterClass) {
      const list = cls.split(',').map(c => c.split(':').pop().trim());
      if (!list.includes(ui.filterClass)) return false;
    }
    if (search) {
      const hay = (username + ' ' + id + ' ' + role + ' ' + cls).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  // Sort
  const dir = ui.sortDir === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    let va, vb;
    switch (ui.sortBy) {
      case 'id':       va = String(a.id||'').toLowerCase(); vb = String(b.id||'').toLowerCase(); break;
      case 'role':     va = String(a.role||'').toLowerCase(); vb = String(b.role||'').toLowerCase(); break;
      case 'class':    va = String(a.class||'').toLowerCase(); vb = String(b.class||'').toLowerCase(); break;
      case 'status':   va = String(a.isActive||'').toUpperCase()==='TRUE' ? 0 : 1;
                       vb = String(b.isActive||'').toUpperCase()==='TRUE' ? 0 : 1; break;
      case 'username':
      default:         va = String(a.username||'').toLowerCase(); vb = String(b.username||'').toLowerCase();
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return  1 * dir;
    return 0;
  });

  filteredUsers = filtered;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
  if (ui.page > totalPages) ui.page = totalPages;
  const startIdx = (ui.page - 1) * ui.pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + ui.pageSize);

  _umRenderStats(raw, isGuru);
  _umRenderFilter(raw, isGuru);
  _umRenderBulk();
  _umRenderContent(pageItems, filtered.length, ui.page, totalPages, startIdx, isGuru);
  if (typeof updateBulkButtonState === 'function') updateBulkButtonState();
}

function _umRenderStats(raw, isGuru) {
  const mount = document.getElementById('um-stats-mount');
  if (!mount) return;
  if (raw.length === 0) { mount.innerHTML = ''; return; }

  const ui = window._userUI;
  const cAdmin    = raw.filter(u => u.role === 'Admin').length;
  const cGuru     = raw.filter(u => u.role === 'Guru').length;
  const cSiswa    = raw.filter(u => u.role === 'Siswa').length;
  const cPengawas = raw.filter(u => u.role === 'Pengawas').length;
  const cActive   = raw.filter(u => String(u.isActive||'').toUpperCase().trim() === 'TRUE').length;

  if (isGuru) {
    // For Guru, only siswa visible — show simpler stats
    mount.innerHTML = `
      <div class="um-stat-grid">
        <div class="um-stat ${ui.filterRole===''?'active':''}" onclick="_umSetFilter('role','')">
          <div class="um-stat-ico bg-slate-100 text-slate-600"><i class="fas fa-users"></i></div>
          <div><div class="um-stat-num">${raw.length}</div><div class="um-stat-lbl">Total Siswa</div></div>
        </div>
        <div class="um-stat ${ui.filterStatus==='TRUE'?'active':''}" onclick="_umSetFilter('status','TRUE')">
          <div class="um-stat-ico bg-emerald-100 text-emerald-600"><i class="fas fa-circle-check"></i></div>
          <div><div class="um-stat-num">${cActive}</div><div class="um-stat-lbl">Aktif</div></div>
        </div>
        <div class="um-stat ${ui.filterStatus==='FALSE'?'active':''}" onclick="_umSetFilter('status','FALSE')">
          <div class="um-stat-ico bg-red-100 text-red-600"><i class="fas fa-ban"></i></div>
          <div><div class="um-stat-num">${raw.length - cActive}</div><div class="um-stat-lbl">Non-Aktif</div></div>
        </div>
      </div>`;
    return;
  }

  mount.innerHTML = `
    <div class="um-stat-grid">
      <div class="um-stat ${ui.filterRole===''?'active':''}" onclick="_umSetFilter('role','')">
        <div class="um-stat-ico bg-slate-100 text-slate-600"><i class="fas fa-users"></i></div>
        <div><div class="um-stat-num">${raw.length}</div><div class="um-stat-lbl">Semua</div></div>
      </div>
      <div class="um-stat ${ui.filterRole==='Admin'?'active':''}" onclick="_umSetFilter('role','Admin')">
        <div class="um-stat-ico bg-purple-100 text-purple-600"><i class="fas fa-user-shield"></i></div>
        <div><div class="um-stat-num">${cAdmin}</div><div class="um-stat-lbl">Admin</div></div>
      </div>
      <div class="um-stat ${ui.filterRole==='Guru'?'active':''}" onclick="_umSetFilter('role','Guru')">
        <div class="um-stat-ico bg-orange-100 text-orange-600"><i class="fas fa-chalkboard-teacher"></i></div>
        <div><div class="um-stat-num">${cGuru}</div><div class="um-stat-lbl">Guru</div></div>
      </div>
      <div class="um-stat ${ui.filterRole==='Siswa'?'active':''}" onclick="_umSetFilter('role','Siswa')">
        <div class="um-stat-ico bg-blue-100 text-blue-600"><i class="fas fa-user-graduate"></i></div>
        <div><div class="um-stat-num">${cSiswa}</div><div class="um-stat-lbl">Siswa</div></div>
      </div>
      <div class="um-stat ${ui.filterRole==='Pengawas'?'active':''}" onclick="_umSetFilter('role','Pengawas')">
        <div class="um-stat-ico bg-emerald-100 text-emerald-600"><i class="fas fa-user-tie"></i></div>
        <div><div class="um-stat-num">${cPengawas}</div><div class="um-stat-lbl">Pengawas</div></div>
      </div>
    </div>`;
}

function _umRenderFilter(raw, isGuru) {
  const mount = document.getElementById('um-filter-mount');
  if (!mount) return;
  const ui = window._userUI;
  const escAttr = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  // Build class list
  const classSet = new Set();
  raw.forEach(u => {
    String(u.class || '').split(',').forEach(item => {
      const c = item.split(':').pop().trim();
      if (c && c !== '-') classSet.add(c);
    });
  });
  const classes = [...classSet].sort();

  const hasFilters = !!(ui.filterRole || ui.filterStatus || ui.filterClass || ui.search);

  mount.innerHTML = `
    <div class="um-filter">
      <div class="ex-search" style="flex:1; min-width:160px;">
        <i class="fas fa-search"></i>
        <input id="user-search-input" type="text" placeholder="Cari nama, ID, role, kelas..."
          value="${escAttr(ui.search)}" oninput="_umSetFilter('search', this.value)" autocomplete="off">
        <button class="ex-search-clear ${ui.search ? 'show' : ''}" onclick="_umSetFilter('search','')" title="Bersihkan">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${classes.length > 0 ? `
        <select class="ex-select" onchange="_umSetFilter('class', this.value)">
          <option value="">Semua Kelas</option>
          ${classes.map(c => `<option value="${escAttr(c)}" ${ui.filterClass===c?'selected':''}>${escAttr(c)}</option>`).join('')}
        </select>` : ''}
      <select class="ex-select" onchange="_umSetFilter('status', this.value)">
        <option value="">Semua Status</option>
        <option value="TRUE"  ${ui.filterStatus==='TRUE'?'selected':''}>✅ Aktif</option>
        <option value="FALSE" ${ui.filterStatus==='FALSE'?'selected':''}>🚫 Non-Aktif</option>
      </select>
      <select class="ex-select" onchange="_umSetPageSize(this.value)">
        <option value="10"  ${ui.pageSize===10?'selected':''}>10 baris</option>
        <option value="25"  ${ui.pageSize===25?'selected':''}>25 baris</option>
        <option value="50"  ${ui.pageSize===50?'selected':''}>50 baris</option>
        <option value="100" ${ui.pageSize===100?'selected':''}>100 baris</option>
        <option value="500" ${ui.pageSize===500?'selected':''}>500 baris</option>
      </select>
      ${hasFilters ? `
        <button onclick="_umResetFilters()" class="ex-select" style="background:#fef2f2;border-color:#fecaca;color:#dc2626;">
          <i class="fas fa-times-circle mr-1"></i> Reset
        </button>` : ''}
    </div>`;
}

function _umRenderBulk() {
  const mount = document.getElementById('um-bulk-mount');
  if (!mount) return;
  const count = (typeof selectedUsers !== 'undefined' && selectedUsers) ? selectedUsers.size : 0;
  if (count === 0) { mount.innerHTML = ''; return; }

  mount.innerHTML = `
    <div class="um-bulk">
      <div class="um-bulk-info">
        <i class="fas fa-check-square text-blue-600"></i>
        <span><b>${count}</b> pengguna dipilih</span>
        <button onclick="_umClearSelection()" class="text-xs text-blue-500 hover:text-blue-700 underline ml-2">Batal</button>
      </div>
      <div class="um-bulk-actions">
        <button class="um-bulk-btn um-bulk-zip" onclick="handleBulkDownload()"><i class="fas fa-file-archive"></i> Download Kartu (ZIP)</button>
        <button class="um-bulk-btn um-bulk-disable" onclick="_umBulkToggleStatus(false)"><i class="fas fa-ban"></i> Nonaktifkan</button>
        <button class="um-bulk-btn um-bulk-zip" style="background:#10b981;border-color:#10b981;" onclick="_umBulkToggleStatus(true)"><i class="fas fa-circle-check"></i> Aktifkan</button>
      </div>
    </div>`;
}

function _umClearSelection() {
  if (typeof selectedUsers !== 'undefined') selectedUsers.clear();
  _refreshUsersUI();
}

function _umBulkToggleStatus(activate) {
  const ids = Array.from(selectedUsers || []);
  if (ids.length === 0) return;
  Swal.fire({
    title: `${activate ? 'Aktifkan' : 'Nonaktifkan'} ${ids.length} pengguna?`,
    html: `<p style="font-size:13px;color:#475569;">Status semua pengguna terpilih akan diubah menjadi <b>${activate ? 'Aktif' : 'Non-Aktif'}</b>.</p>`,
    icon: activate ? 'question' : 'warning',
    showCancelButton: true,
    confirmButtonColor: activate ? '#10b981' : '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: `Ya, ${activate ? 'Aktifkan' : 'Nonaktifkan'} Semua`,
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(res => {
    if (!res.isConfirmed) return;
    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), customClass: { popup: 'lp-swal' } });

    let pending = ids.length;
    let success = 0, failed = 0;
    ids.forEach(uid => {
      const user = (allUsersData || []).find(u => String(u.id) === String(uid));
      const cur = user ? (String(user.isActive || '').toUpperCase().trim() === 'TRUE') : false;
      // Only call if status differs
      if (cur === activate) { pending--; success++; if (pending === 0) finish(); return; }
      const rawStatus = cur ? 'TRUE' : 'FALSE';
      google.script.run
        .withSuccessHandler(r => { if (r && r.success) success++; else failed++; pending--; if (pending === 0) finish(); })
        .withFailureHandler(() => { failed++; pending--; if (pending === 0) finish(); })
        .toggleUserStatus(uid, rawStatus);
    });

    function finish() {
      const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2500, timerProgressBar:true });
      if (failed === 0) Toast.fire({ icon:'success', title:`${success} pengguna diperbarui` });
      else Toast.fire({ icon:'warning', title:`${success} berhasil, ${failed} gagal` });
      selectedUsers.clear();
      loadUserTable();
    }
  });
}

function _umRenderContent(items, totalFiltered, page, totalPages, startIdx, isGuru) {
  const area = document.getElementById('um-content-area');
  if (!area) return;
  const raw = Array.isArray(allUsersData) ? allUsersData : [];

  if (raw.length === 0) {
    area.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 dash-empty">
        <div class="dash-empty-icon"><i class="fas fa-user-slash"></i></div>
        <p class="font-bold text-slate-700 text-sm">Belum Ada Pengguna</p>
        <p class="text-xs text-slate-400 mt-1 mb-4">${isGuru ? 'Belum ada siswa di kelas Anda.' : 'Tambahkan pengguna pertama atau import dari Excel.'}</p>
        ${isGuru ? '' : `
          <div class="flex flex-wrap justify-center gap-2">
            <button onclick="openUserModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
              <i class="fas fa-user-plus"></i> Tambah User
            </button>
            <button onclick="openImportUserModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
              <i class="fas fa-file-excel"></i> Import Excel
            </button>
          </div>`}
      </div>`;
    return;
  }
  if (totalFiltered === 0) {
    area.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 dash-empty">
        <div class="dash-empty-icon"><i class="fas fa-search-minus"></i></div>
        <p class="font-bold text-slate-700 text-sm">Tidak ada pengguna yang cocok.</p>
        <p class="text-xs text-slate-400 mt-1 mb-3">Bersihkan filter atau ubah kata kunci pencarian.</p>
        <button onclick="_umResetFilters()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-2">
          <i class="fas fa-rotate-left"></i> Reset Filter
        </button>
      </div>`;
    return;
  }

  const tableHtml = _umBuildTable(items, startIdx, isGuru);
  const cardsHtml = _umBuildCards(items, isGuru);
  const pagi      = _umPagination(totalFiltered, page, totalPages);

  area.innerHTML = `
    <div class="um-table-wrap">
      <div style="overflow-x:auto;">${tableHtml}</div>
      ${pagi}
    </div>
    <div class="um-cards">
      ${cardsHtml}
      <div class="bg-white rounded-xl border border-slate-200">${pagi}</div>
    </div>`;
}

function _umBuildTable(items, startIdx, isGuru) {
  const ui = window._userUI;
  const sortIco = (key) => {
    if (ui.sortBy !== key) return '<i class="fas fa-sort um-sort"></i>';
    return ui.sortDir === 'asc' ? '<i class="fas fa-sort-up um-sort"></i>' : '<i class="fas fa-sort-down um-sort"></i>';
  };
  const sortedHead = (key) => ui.sortBy === key ? 'sorted' : '';

  const rows = items.map((u, i) => _umBuildTableRow(u, startIdx + i + 1, isGuru)).join('');

  if (isGuru) {
    return `
      <table class="um-table">
        <thead>
          <tr>
            <th style="width:48px;text-align:center;">#</th>
            <th class="sortable ${sortedHead('username')}" onclick="_umSetSort('username')">Identitas Siswa ${sortIco('username')}</th>
            <th class="sortable ${sortedHead('class')}" onclick="_umSetSort('class')">Kelas ${sortIco('class')}</th>
            <th class="sortable ${sortedHead('status')}" onclick="_umSetSort('status')" style="text-align:center;width:120px;">Status ${sortIco('status')}</th>
            <th style="text-align:right;width:80px;">Kartu</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  return `
    <table class="um-table">
      <thead>
        <tr>
          <th style="width:40px;text-align:center;">
            <input type="checkbox" id="check-all-users" onchange="toggleSelectAllUsers(this)" class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
          </th>
          <th style="width:40px;text-align:center;">#</th>
          <th class="sortable ${sortedHead('username')}" onclick="_umSetSort('username')">Identitas ${sortIco('username')}</th>
          <th class="sortable ${sortedHead('role')}"     onclick="_umSetSort('role')" style="width:130px;">Role & Kelas ${sortIco('role')}</th>
          <th style="width:140px;">Password</th>
          <th class="sortable ${sortedHead('status')}" onclick="_umSetSort('status')" style="text-align:center;width:110px;">Status ${sortIco('status')}</th>
          <th style="text-align:right;width:140px;">Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function _umBuildTableRow(u, idx, isGuru) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  const ui = window._userUI;

  const isAct = String(u.isActive || '').toUpperCase().trim() === 'TRUE';
  const initial = ((u.username || '?').charAt(0) || '?').toUpperCase();

  const statusBtn = isAct
    ? `<button class="um-status um-st-active" onclick="handleToggleUser('${escAttr(u.id)}', '${escAttr(u.isActive)}')" title="Klik untuk Nonaktifkan">
         <span class="dot" style="background:#10b981;"></span>AKTIF
       </button>`
    : `<button class="um-status um-st-inactive" onclick="handleToggleUser('${escAttr(u.id)}', '${escAttr(u.isActive)}')" title="Klik untuk Aktifkan">
         <i class="fas fa-ban text-[8px]"></i> NON-AKTIF
       </button>`;

  if (isGuru) {
    return `
      <tr>
        <td style="text-align:center;color:#94a3b8;font-weight:600;">${idx}</td>
        <td>
          <div class="flex items-center gap-3">
            <div class="um-card-avatar" style="width:36px;height:36px;border-radius:9px;font-size:14px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);">${escHtml(initial)}</div>
            <div class="min-w-0">
              <div class="font-bold text-slate-800 truncate">${escHtml(u.username || '-')}</div>
              <div class="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-slate-200">${escHtml(u.id || '-')}</div>
            </div>
          </div>
        </td>
        <td><span class="text-sm text-slate-600 font-medium"><i class="fas fa-layer-group text-slate-300 mr-1"></i>${escHtml(u.class || '-')}</span></td>
        <td style="text-align:center;">${statusBtn}</td>
        <td style="text-align:right;">
          <button class="um-action-btn um-action-kartu" onclick="handleDownloadKartu('${escAttr(u.id)}')" title="Download Kartu Ujian">
            <i class="fas fa-id-card"></i>
          </button>
        </td>
      </tr>`;
  }

  const isChecked = (typeof selectedUsers !== 'undefined' && selectedUsers.has(u.id)) ? 'checked' : '';
  const roleClass = u.role === 'Admin' ? 'um-role-admin' : (u.role === 'Guru' ? 'um-role-guru' : (u.role === 'Pengawas' ? 'um-role-pengawas' : 'um-role-siswa'));
  const roleIcon  = u.role === 'Admin' ? 'fa-user-shield' : (u.role === 'Guru' ? 'fa-chalkboard-teacher' : (u.role === 'Pengawas' ? 'fa-user-tie' : 'fa-user-graduate'));

  // Password display
  const pwdShown = ui.revealedPwd && ui.revealedPwd.has(String(u.id));
  const pwdHtml = `
    <span class="um-pwd">
      <span class="${pwdShown ? 'um-pwd-shown' : ''}">${pwdShown ? escHtml(u.password || '-') : '••••••••'}</span>
      <button type="button" class="um-pwd-toggle" onclick="_umTogglePwd('${escAttr(u.id)}')" title="${pwdShown ? 'Sembunyikan' : 'Tampilkan'} password">
        <i class="fas ${pwdShown ? 'fa-eye-slash' : 'fa-eye'}"></i>
      </button>
    </span>`;

  return `
    <tr class="${(typeof selectedUsers !== 'undefined' && selectedUsers.has(u.id)) ? 'selected' : ''}">
      <td style="text-align:center;">
        <input type="checkbox" class="user-checkbox w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          value="${escAttr(u.id)}" onchange="updateUserSelection('${escAttr(u.id)}', this)" ${isChecked}>
      </td>
      <td style="text-align:center;color:#94a3b8;font-weight:600;">${idx}</td>
      <td>
        <div class="flex items-center gap-3">
          <div class="um-card-avatar" style="width:36px;height:36px;border-radius:9px;font-size:14px;">${escHtml(initial)}</div>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 truncate">${escHtml(u.username || '-')}</div>
            <div class="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5 border border-slate-200">${escHtml(u.id || '-')}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="flex flex-col items-start gap-1">
          <span class="um-role ${roleClass}"><i class="fas ${roleIcon} text-[8px]"></i>${escHtml(u.role || '-')}</span>
          ${u.class && u.class !== '-' ? `<span class="text-xs text-slate-500 font-medium" title="${escAttr(u.class)}"><i class="fas fa-layer-group text-slate-300 mr-1"></i>${escHtml(u.class)}</span>` : ''}
        </div>
      </td>
      <td>${pwdHtml}</td>
      <td style="text-align:center;">${statusBtn}</td>
      <td style="text-align:right;">
        <div class="flex justify-end gap-1.5">
          ${u.role === 'Siswa' ? `
            <button class="um-action-btn um-action-kartu" onclick="handleDownloadKartu('${escAttr(u.id)}')" title="Download Kartu Ujian">
              <i class="fas fa-id-card"></i>
            </button>` : ''}
          <button class="um-action-btn um-action-edit" onclick="openUserModalById('${escAttr(u.id)}')" title="Edit">
            <i class="fas fa-pen-to-square"></i>
          </button>
          <button class="um-action-btn um-action-del" onclick="handleDeleteUser('${escAttr(u.id)}')" title="Hapus">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>`;
}

function _umBuildCards(items, isGuru) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  const ui = window._userUI;

  return items.map(u => {
    const isAct   = String(u.isActive || '').toUpperCase().trim() === 'TRUE';
    const initial = ((u.username || '?').charAt(0) || '?').toUpperCase();
    const isSelected = (typeof selectedUsers !== 'undefined' && selectedUsers.has(u.id));

    const statusBtn = isAct
      ? `<button class="um-status um-st-active" onclick="handleToggleUser('${escAttr(u.id)}', '${escAttr(u.isActive)}')"><span class="dot" style="background:#10b981;"></span>AKTIF</button>`
      : `<button class="um-status um-st-inactive" onclick="handleToggleUser('${escAttr(u.id)}', '${escAttr(u.isActive)}')"><i class="fas fa-ban text-[8px]"></i> NON-AKTIF</button>`;

    const roleClass = u.role === 'Admin' ? 'um-role-admin' : (u.role === 'Guru' ? 'um-role-guru' : (u.role === 'Pengawas' ? 'um-role-pengawas' : 'um-role-siswa'));
    const roleIcon  = u.role === 'Admin' ? 'fa-user-shield' : (u.role === 'Guru' ? 'fa-chalkboard-teacher' : (u.role === 'Pengawas' ? 'fa-user-tie' : 'fa-user-graduate'));

    const pwdShown = ui.revealedPwd && ui.revealedPwd.has(String(u.id));

    const checkboxHtml = isGuru ? '' : `
      <input type="checkbox" class="user-checkbox w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        value="${escAttr(u.id)}" onchange="updateUserSelection('${escAttr(u.id)}', this)" ${isSelected ? 'checked' : ''}>`;

    let footer = '';
    if (isGuru) {
      footer = `
        <div class="um-card-foot">
          <button class="um-action-kartu" onclick="handleDownloadKartu('${escAttr(u.id)}')" style="border:1px solid #a7f3d0;background:#ecfdf5;color:#059669;"><i class="fas fa-id-card"></i> Kartu</button>
        </div>`;
    } else {
      footer = `
        <div class="um-card-foot">
          ${u.role === 'Siswa' ? `
            <button class="um-action-kartu" onclick="handleDownloadKartu('${escAttr(u.id)}')" style="border:1px solid #a7f3d0;background:#ecfdf5;color:#059669;"><i class="fas fa-id-card"></i> Kartu</button>` : ''}
          <button class="um-action-edit" onclick="openUserModalById('${escAttr(u.id)}')" style="border:1px solid #bfdbfe;background:#eff6ff;color:#2563eb;"><i class="fas fa-pen-to-square"></i> Edit</button>
          <button class="um-action-del" onclick="handleDeleteUser('${escAttr(u.id)}')" style="border:1px solid #fecaca;background:#fef2f2;color:#dc2626;"><i class="fas fa-trash-can"></i> Hapus</button>
        </div>`;
    }

    return `
      <div class="um-card ${isSelected ? 'selected' : ''}">
        <div class="um-card-head">
          ${checkboxHtml}
          <div class="um-card-avatar">${escHtml(initial)}</div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-800 text-sm truncate">${escHtml(u.username || '-')}</div>
            <div class="flex flex-wrap gap-1.5 mt-0.5">
              <span class="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">${escHtml(u.id || '-')}</span>
              <span class="um-role ${roleClass}"><i class="fas ${roleIcon} text-[8px]"></i>${escHtml(u.role || '-')}</span>
            </div>
          </div>
          ${statusBtn}
        </div>
        <div class="um-card-body">
          ${u.class && u.class !== '-' ? `
            <div class="um-card-row">
              <i class="fas fa-layer-group text-slate-300"></i>
              <span class="break-words" title="${escAttr(u.class)}">${escHtml(u.class)}</span>
            </div>` : ''}
          ${!isGuru ? `
            <div class="um-card-row">
              <i class="fas fa-key text-slate-300"></i>
              <span class="um-pwd"><span class="${pwdShown ? 'um-pwd-shown' : ''}">${pwdShown ? escHtml(u.password || '-') : '••••••••'}</span>
                <button type="button" class="um-pwd-toggle" onclick="_umTogglePwd('${escAttr(u.id)}')">
                  <i class="fas ${pwdShown ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </button>
              </span>
            </div>` : ''}
        </div>
        ${footer}
      </div>`;
  }).join('');
}

function _umPagination(total, page, totalPages) {
  if (totalPages <= 1) {
    return `<div class="um-pagination"><span>Menampilkan <b class="text-slate-700">${total}</b> pengguna</span></div>`;
  }
  const ws = Math.max(1, page - 2);
  const we = Math.min(totalPages, page + 2);
  let nums = '';
  if (ws > 1) nums += `<button class="um-page-btn" onclick="_umSetPage(1)">1</button>` + (ws > 2 ? '<span class="text-slate-400">…</span>' : '');
  for (let p = ws; p <= we; p++) nums += `<button class="um-page-btn ${p===page?'active':''}" onclick="_umSetPage(${p})">${p}</button>`;
  if (we < totalPages) nums += (we < totalPages - 1 ? '<span class="text-slate-400">…</span>' : '') + `<button class="um-page-btn" onclick="_umSetPage(${totalPages})">${totalPages}</button>`;

  return `
    <div class="um-pagination">
      <span>Halaman <b>${page}</b> / <b>${totalPages}</b> · ${total} pengguna</span>
      <div class="flex gap-1">
        <button class="um-page-btn" onclick="_umSetPage(${page-1})" ${page<=1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
        ${nums}
        <button class="um-page-btn" onclick="_umSetPage(${page+1})" ${page>=totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>`;
}

// State setters
function _umSetFilter(key, value) {
  const ui = window._userUI; if (!ui) return;
  if (key === 'role')   ui.filterRole   = (ui.filterRole === value && value) ? '' : value;
  if (key === 'status') ui.filterStatus = (ui.filterStatus === value && value) ? '' : value;
  if (key === 'class')  ui.filterClass  = value || '';
  if (key === 'search') ui.search       = value || '';
  ui.page = 1;
  const wasFocused = document.activeElement && document.activeElement.id === 'user-search-input';
  const caretPos   = wasFocused ? document.activeElement.selectionStart : null;
  _refreshUsersUI();
  if (wasFocused) {
    const inp = document.getElementById('user-search-input');
    if (inp) {
      inp.focus();
      try { inp.setSelectionRange(caretPos, caretPos); } catch(e){}
    }
  }
}
function _umResetFilters() {
  const ui = window._userUI; if (!ui) return;
  Object.assign(ui, { filterRole:'', filterStatus:'', filterClass:'', search:'', page:1 });
  _refreshUsersUI();
}
function _umSetSort(key) {
  const ui = window._userUI; if (!ui) return;
  if (ui.sortBy === key) ui.sortDir = ui.sortDir === 'asc' ? 'desc' : 'asc';
  else { ui.sortBy = key; ui.sortDir = 'asc'; }
  _refreshUsersUI();
}
function _umSetPage(p) {
  const ui = window._userUI; if (!ui) return;
  ui.page = Math.max(1, parseInt(p) || 1);
  _refreshUsersUI();
  const c = document.getElementById('admin-content');
  if (c) c.scrollTo({ top:0, behavior:'smooth' });
}
function _umSetPageSize(val) {
  const ui = window._userUI; if (!ui) return;
  ui.pageSize = parseInt(val) || 25;
  ui.page = 1;
  _refreshUsersUI();
}
function _umTogglePwd(uid) {
  const ui = window._userUI; if (!ui) return;
  if (!ui.revealedPwd) ui.revealedPwd = new Set();
  if (ui.revealedPwd.has(String(uid))) ui.revealedPwd.delete(String(uid));
  else ui.revealedPwd.add(String(uid));
  _refreshUsersUI();
}

// Helpers to open modal by id (avoid embedding JSON in onclick)
function openUserModalById(uid) {
  const u = (allUsersData || []).find(x => String(x.id) === String(uid));
  if (!u) {
    Swal.fire({ icon:'error', title:'Data tidak ditemukan', customClass:{popup:'lp-swal'} });
    return;
  }
  openUserModal(u);
}

// Backwards-compat shims
function renderUserTableInternal() { _refreshUsersUI(); }
function handleUserSearch(keyword) { _umSetFilter('search', keyword); }
function changeUserRowsPerPage(val) { _umSetPageSize(val === 'all' ? 1000 : val); }
function changeUserPage(direction) {
  const ui = window._userUI; if (!ui) return;
  if (direction === 'prev') _umSetPage(ui.page - 1);
  else _umSetPage(ui.page + 1);
}

let monitorRawData    = null;
let monitorTabData    = [];   
let monitorFiltered   = [];   
let monitorActiveTab  = 'semua';
let monitorSelected   = new Set();

// ── State: Live Mode ──
let monitorLiveMode      = false;   // apakah auto-refresh aktif
let monitorLiveInterval  = null;    // setInterval handle
let monitorLiveCountdown = 0;       // detik tersisa hingga refresh berikutnya
let monitorLiveTimer     = null;    // setInterval handle untuk countdown tick
const MONITOR_LIVE_SECS  = 30;     // interval refresh (detik)

// ── State: Exam Selector ──
let monitorActiveExam    = null;    // null = semua; string = examID terpilih
let monitorExamList      = [];      // [{examID, subject, kelas, status}] ujian aktif

/**
 * Sinkronisasi state JS monitor ke elemen DOM yang baru di-render.
 * Dipanggil setiap kali renderUserManagement() mengeset container.innerHTML.
 */
function _syncMonitorUIState() {
  // 1. Sync tombol live mode
  _updateLiveBtn();

  // 2. Sync countdown UI
  if (monitorLiveMode) {
    _updateCountdownUI(monitorLiveCountdown, true);
  } else {
    _updateCountdownUI(0, false);
  }

  // 3. Sync exam chips jika daftar ujian sudah ada
  if (monitorExamList.length > 0) {
    _renderExamChips({ activeExams: monitorExamList });
  }

  // 4. Jika data monitor sudah ada, render ulang tabel tanpa fetch
  if (monitorRawData) {
    // Update stat cards (null-safe)
    const _elBL = document.getElementById('count-belum-login');
    const _elL  = document.getElementById('count-login');
    const _elM  = document.getElementById('count-mengerjakan');
    const _elS  = document.getElementById('count-selesai');
    const _elC  = document.getElementById('count-curang');
    if (_elBL) _elBL.innerText = (monitorRawData.belumLogin  || []).length;
    if (_elL)  _elL.innerText  = (monitorRawData.sudahLogin  || []).length;
    if (_elM)  _elM.innerText  = (monitorRawData.mengerjakan || []).length;
    if (_elS)  _elS.innerText  = (monitorRawData.selesai     || []).length;
    if (_elC)  _elC.innerText  = (monitorRawData.curang      || []).length;
    // Re-apply filter & render tabel — defer sedikit agar DOM selesai paint
    setTimeout(() => filterMonitorTab(monitorActiveTab), 0);

    const ts = document.getElementById('monitor-last-update');
    if (ts && ts.innerText === '') ts.innerText = 'Data sudah dimuat';
  }

  // 5. Sync bulk toolbar
  updateMonitorBulkToolbar();
}
function switchUserMgmtTab(tab) {
  const panelUsers   = document.getElementById('tab-panel-users');
  const panelMonitor = document.getElementById('tab-panel-monitor');
  const btnUsers     = document.getElementById('tab-btn-users');
  const btnMonitor   = document.getElementById('tab-btn-monitor');
  const liveBadge    = document.getElementById('monitor-live-badge');

  if (currentUser && currentUser.role === 'Guru' && tab === 'users') {
    Swal.fire({
      title: 'Akses Ditolak',
      html: '<p style="font-size:13px;color:#475569;">Hanya <b>Administrator</b> yang dapat mengelola data pengguna.</p>',
      icon: 'warning',
      confirmButtonColor: '#dc2626',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }

  if (tab === 'users') {
    if (panelUsers)   panelUsers.classList.remove('hidden');
    if (panelMonitor) panelMonitor.classList.add('hidden');
    if (btnUsers)   btnUsers.classList.add('active');
    if (btnMonitor) btnMonitor.classList.remove('active');
    // BUG FIX #2: Reset seleksi monitor saat keluar dari tab monitor agar
    // bulk toolbar tidak menampilkan jumlah seleksi lama saat kembali.
    monitorSelected.clear();
    updateMonitorBulkToolbar();
    // Matikan live mode saat pindah tab agar tidak polling di background
    if (monitorLiveMode) _stopMonitorLive();
  } else {
    if (panelUsers)   panelUsers.classList.add('hidden');
    if (panelMonitor) panelMonitor.classList.remove('hidden');
    if (btnMonitor) btnMonitor.classList.add('active');
    if (btnUsers)   btnUsers.classList.remove('active');
    if (liveBadge)  liveBadge.classList.remove('hidden');
    // Live Mode aktif secara default saat tab Monitor dibuka
    _startMonitorLive();
  }
}
 
function loadMonitorData() {
  const wrapper    = document.getElementById('monitor-table-wrapper');
  const btnRefresh = document.getElementById('btn-refresh-monitor');
  if (!currentUser || !currentUser.userID) return;

  // Simpan snapshot status sebelumnya untuk deteksi perubahan baris (highlight)
  const prevSnapshot = _buildMonitorSnapshot(monitorRawData);
 
  if (wrapper) wrapper.innerHTML = `
    <div class="flex flex-col items-center justify-center h-48 text-slate-400">
      <i class="fas fa-circle-notch fa-spin text-3xl mb-2 text-blue-400"></i>
      <p class="text-sm">Mengambil data monitor...</p>
    </div>`;
  if (btnRefresh) { btnRefresh.disabled = true; btnRefresh.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memuat...'; }
 
  google.script.run
    .withSuccessHandler(res => {
      if (btnRefresh) { btnRefresh.disabled = false; btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh'; }
      if (!res || !res.success) {
        if (wrapper) wrapper.innerHTML = `<div class="p-10 text-center text-red-500"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>${res ? res.message : 'Gagal memuat'}</p></div>`;
        // Jika live mode aktif, reset countdown agar retry tetap berjalan
        if (monitorLiveMode) _resetLiveCountdown();
        return;
      }
 
      monitorRawData = res.data;
      monitorSelected.clear();
      updateMonitorBulkToolbar();
 
      const ts = document.getElementById('monitor-last-update');
      if (ts) ts.innerText = 'Update: ' + new Date().toLocaleTimeString('id-ID');
 
      // Null-check pada elemen count
      const _elBL = document.getElementById('count-belum-login');
      const _elL  = document.getElementById('count-login');
      const _elM  = document.getElementById('count-mengerjakan');
      const _elS  = document.getElementById('count-selesai');
      const _elC  = document.getElementById('count-curang');
      if (_elBL) _elBL.innerText = (res.data.belumLogin  || []).length;
      if (_elL)  _elL.innerText  = (res.data.sudahLogin  || []).length;
      if (_elM)  _elM.innerText  = (res.data.mengerjakan || []).length;
      if (_elS)  _elS.innerText  = (res.data.selesai     || []).length;
      if (_elC)  _elC.innerText  = (res.data.curang      || []).length;

      // Update exam selector chips dari meta.activeExams
      _renderExamChips(res.meta || {});

      // Baca violation_limit dari meta dan set input filter jika belum diisi user
      if (res.meta && typeof res.meta.violationLimit === 'number') {
        monitorViolationLimit = res.meta.violationLimit;
        const violInput = document.getElementById('monitor-filter-viol');
        // Set placeholder agar guru/admin tahu batas default dari konfigurasi
        if (violInput) {
          violInput.placeholder = monitorViolationLimit > 0 ? '≥' + monitorViolationLimit : '–';
        }
      }

      populateMonitorDropdowns(res.data, res.meta || {});
      filterMonitorTab(monitorActiveTab);

      // Setelah render, highlight baris yang berubah status
      _highlightChangedRows(prevSnapshot);

      // Jika live mode aktif, reset countdown untuk siklus berikutnya
      if (monitorLiveMode) _resetLiveCountdown();
    })
    .withFailureHandler(err => {
      if (btnRefresh) { btnRefresh.disabled = false; btnRefresh.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh'; }
      if (wrapper) wrapper.innerHTML = `<div class="p-10 text-center text-red-500"><i class="fas fa-shield-alt text-2xl mb-2"></i><p class="font-bold">Gagal: ${err.message || err}</p></div>`;
      if (monitorLiveMode) _resetLiveCountdown();
    })
    .getExamMonitorData(currentUser.userID, currentUser.token);
}
 
// ═══════════════════════════════════════════════════════════════
// ── LIVE MODE ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function toggleMonitorLiveMode() {
  if (monitorLiveMode) {
    _stopMonitorLive();
  } else {
    _startMonitorLive();
  }
}

function _startMonitorLive() {
  monitorLiveMode = true;
  _updateLiveBtn();
  // loadMonitorData() akan memanggil _resetLiveCountdown() setelah fetch selesai.
  // Tampilkan countdown penuh dulu agar UI responsif sebelum fetch kembali.
  _updateCountdownUI(MONITOR_LIVE_SECS, true);
  loadMonitorData();
}

function _stopMonitorLive() {
  monitorLiveMode = false;
  if (monitorLiveInterval) { clearTimeout(monitorLiveInterval); monitorLiveInterval = null; }
  if (monitorLiveTimer)    { clearInterval(monitorLiveTimer);   monitorLiveTimer    = null; }
  // Hentikan juga countdown timer baris tabel
  if (_monitorTimerHandle) { clearInterval(_monitorTimerHandle); _monitorTimerHandle = null; }
  _updateLiveBtn();
  _updateCountdownUI(0, false);
}

/**
 * Reset countdown ke MONITOR_LIVE_SECS dan jadwalkan satu refresh berikutnya.
 * Menggunakan setTimeout (bukan setInterval) agar tidak tumpuk saat fetch lambat.
 * Countdown ticker (setInterval 1 detik) hanya mengupdate UI, tidak trigger fetch.
 */
function _resetLiveCountdown() {
  // Bersihkan schedule lama
  if (monitorLiveInterval) { clearTimeout(monitorLiveInterval);  monitorLiveInterval = null; }
  if (monitorLiveTimer)    { clearInterval(monitorLiveTimer);     monitorLiveTimer    = null; }
  if (!monitorLiveMode) return;

  monitorLiveCountdown = MONITOR_LIVE_SECS;
  _updateCountdownUI(monitorLiveCountdown, true);

  // Ticker UI: update ring setiap detik
  monitorLiveTimer = setInterval(() => {
    if (!monitorLiveMode) { clearInterval(monitorLiveTimer); monitorLiveTimer = null; return; }
    monitorLiveCountdown = Math.max(0, monitorLiveCountdown - 1);
    _updateCountdownUI(monitorLiveCountdown, true);
  }, 1000);

  // Satu tembakan setelah MONITOR_LIVE_SECS: panggil loadMonitorData.
  // loadMonitorData() akan memanggil _resetLiveCountdown() kembali di akhir
  // (setelah fetch selesai) sehingga siklus berlanjut tanpa tumpang tindih.
  monitorLiveInterval = setTimeout(() => {
    monitorLiveInterval = null;
    if (!monitorLiveMode) return;
    loadMonitorData();
  }, MONITOR_LIVE_SECS * 1000);
}

function _updateLiveBtn() {
  const btn   = document.getElementById('btn-live-mode');
  const label = document.getElementById('btn-live-label');
  if (!btn) return;
  if (monitorLiveMode) {
    btn.classList.remove('off'); btn.classList.add('on');
    if (label) label.textContent = 'Live ON';
    btn.title = 'Klik untuk mematikan auto-refresh';
  } else {
    btn.classList.remove('on'); btn.classList.add('off');
    if (label) label.textContent = 'Live Mode';
    btn.title = 'Aktifkan auto-refresh otomatis';
  }
}

/** Update SVG countdown ring dan teks detik. */
function _updateCountdownUI(secs, show) {
  const wrap = document.getElementById('monitor-countdown-wrap');
  const txt  = document.getElementById('monitor-countdown-txt');
  const fg   = document.getElementById('monitor-ring-fg');
  if (!wrap) return;

  if (!show) { wrap.classList.remove('show'); return; }
  wrap.classList.add('show');
  if (txt) txt.textContent = secs;

  // Hitung stroke-dashoffset: 0 = penuh, circumference = kosong
  if (fg) {
    const circumference = 2 * Math.PI * 11; // r=11 → ≈69.1
    const offset = circumference * (1 - secs / MONITOR_LIVE_SECS);
    fg.style.strokeDashoffset = offset.toFixed(2);
  }
}

// ═══════════════════════════════════════════════════════════════
// ── EXAM SELECTOR (Filter per Ujian Aktif) ─────────────────────
// ═══════════════════════════════════════════════════════════════

/** Render chip-chip ujian aktif berdasarkan meta.activeExams dari backend. */
function _renderExamChips(meta) {
  const chipsEl   = document.getElementById('monitor-exam-chips');
  const countEl   = document.getElementById('monitor-exam-active-count');
  if (!chipsEl) return;

  const exams = (meta && Array.isArray(meta.activeExams)) ? meta.activeExams : [];
  monitorExamList = exams;

  // Pastikan monitorActiveExam masih valid; reset jika ujian sudah tidak ada
  if (monitorActiveExam !== null && !exams.find(e => e.examID === monitorActiveExam)) {
    monitorActiveExam = null;
  }

  if (countEl) countEl.textContent = exams.length;

  if (exams.length === 0) {
    chipsEl.innerHTML = `<span class="monitor-exam-empty"><i class="fas fa-info-circle text-xs"></i> Tidak ada ujian aktif saat ini</span>`;
    return;
  }

  let html = `<button class="monitor-exam-chip all ${monitorActiveExam === null ? 'active' : ''}"
    onclick="setMonitorActiveExam(null)">
    <i class="fas fa-layer-group text-[9px]"></i> Semua Ujian
  </button>`;

  exams.forEach(ex => {
    const isActive = monitorActiveExam === ex.examID;
    html += `<button class="monitor-exam-chip exam ${isActive ? 'active' : ''}"
      onclick="setMonitorActiveExam('${ex.examID}')">
      <span class="chip-dot"></span>
      ${escHtmlGlobal(ex.subject)}
      <span class="text-[9px] opacity-70 font-medium">${escHtmlGlobal(ex.kelas)}</span>
    </button>`;
  });

  chipsEl.innerHTML = html;
}

/** Ganti ujian yang sedang di-filter dan re-apply filter tanpa fetch ulang. */
function setMonitorActiveExam(examID) {
  monitorActiveExam = examID || null;
  _renderExamChips({ activeExams: monitorExamList }); // re-render chips (update active state)
  applyMonitorFilters();
}

// ═══════════════════════════════════════════════════════════════
// ── FITUR KIRIM PESAN / NOTIFIKASI KE SISWA ─────────────────
// ═══════════════════════════════════════════════════════════════

// State modal notifikasi
let _notifTargetType     = 'all';     // 'all' | 'exam' | 'selected'
let _notifTargetUserIDs  = [];        // array {userID, nama} untuk mode 'selected'/'single'
let _notifTargetExamID   = '';

/**
 * Buka modal kirim pesan.
 * @param {string} mode      - 'all' | 'exam' | 'selected' | 'single'
 * @param {string} [userID]  - jika mode='single'
 * @param {string} [nama]    - nama siswa jika mode='single'
 */
function openSendNotifModal(mode, userID, nama) {
  const modal = document.getElementById('modal-send-notif');
  if (!modal) return;

  // Reset state
  _notifTargetType    = 'all';
  _notifTargetUserIDs = [];
  _notifTargetExamID  = '';

  // Isi dropdown ujian
  const examSel = document.getElementById('notif-exam-select');
  if (examSel) {
    examSel.innerHTML = '<option value="">-- Pilih Ujian Aktif --</option>';
    (monitorExamList || []).forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.examID;
      opt.textContent = ex.subject + ' (' + ex.kelas + ')';
      examSel.appendChild(opt);
    });
  }

  if (mode === 'single' && userID) {
    // Mode satu siswa: set target selected langsung
    _notifTargetType    = 'selected';
    _notifTargetUserIDs = [{ userID: userID, nama: nama || userID }];
    setNotifTarget('selected');
  } else if (mode === 'selected') {
    // Ambil dari monitorSelected
    _notifTargetType    = 'selected';
    _notifTargetUserIDs = [];
    monitorSelected.forEach(key => {
      if (key.startsWith('NOLOGIN_')) return; // skip belum login
      // BUG FIX NOTIF-2: key di monitorSelected adalah responseId, bukan userID.
      // Harus ambil userID sebenarnya dari monitorRawData.
      let namaFound  = key;
      let userIDFound = key; // fallback
      if (monitorRawData) {
        const all = ['sudahLogin','mengerjakan','selesai','curang','belumLogin'];
        for (const b of all) {
          const entry = (monitorRawData[b] || []).find(e => (e.responseId || ('NOLOGIN_' + e.userID)) === key);
          if (entry) {
            namaFound   = entry.nama   || key;
            userIDFound = entry.userID || key; // ambil userID sebenarnya
            break;
          }
        }
      }
      _notifTargetUserIDs.push({ userID: userIDFound, nama: namaFound });
    });
    if (_notifTargetUserIDs.length === 0) {
      Swal.fire('Info', 'Tidak ada siswa yang bisa dikirimi pesan dari pilihan ini (pastikan memilih siswa yang sedang login/mengerjakan).', 'info');
      return;
    }
    setNotifTarget('selected');
  } else if (mode === 'exam') {
    _notifTargetType   = 'exam';
    _notifTargetExamID = monitorActiveExam || '';
    setNotifTarget('exam');
    if (_notifTargetExamID && examSel) examSel.value = _notifTargetExamID;
  } else {
    setNotifTarget('all');
  }

  // Reset textarea
  const ta = document.getElementById('notif-message-input');
  if (ta) ta.value = '';
  const cc = document.getElementById('notif-char-count');
  if (cc) cc.textContent = '0';

  modal.classList.add('show');
  // Pastikan display tidak di-override oleh switchPage (yang bisa memaksa display:none)
  modal.style.display = 'flex';
  setTimeout(() => { if (ta) ta.focus(); }, 100);
}

function closeSendNotifModal() {
  const modal = document.getElementById('modal-send-notif');
  if (!modal) return;
  modal.classList.remove('show');
  // Pastikan display dikembalikan ke none agar tidak tampil di atas halaman lain
  modal.style.display = 'none';
}

function setNotifTarget(type) {
  _notifTargetType = type;

  // Update tombol aktif
  document.querySelectorAll('.notif-target-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === type);
  });

  // Tampilkan/sembunyikan section
  const examSec     = document.getElementById('notif-exam-selector');
  const selectedSec = document.getElementById('notif-selected-info');
  if (examSec)     examSec.classList.toggle('hidden', type !== 'exam');
  if (selectedSec) selectedSec.classList.toggle('hidden', type !== 'selected');

  // Update daftar siswa terpilih
  if (type === 'selected') {
    const listEl = document.getElementById('notif-selected-list');
    if (listEl) {
      if (_notifTargetUserIDs.length === 0) {
        listEl.innerHTML = '<span class="text-slate-400 italic text-xs">Belum ada siswa dipilih</span>';
      } else {
        listEl.innerHTML = _notifTargetUserIDs.map(u =>
          `<span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-semibold">
            <i class="fas fa-user text-[9px]"></i>${_escHtmlNotif(u.nama)}
           </span>`
        ).join('');
      }
    }
  }
}

function setNotifMessage(text) {
  const ta = document.getElementById('notif-message-input');
  if (ta) {
    ta.value = text;
    const cc = document.getElementById('notif-char-count');
    if (cc) cc.textContent = text.length;
    ta.focus();
  }
}

function submitSendNotif() {
  // BUG FIX NOTIF-7: Guard currentUser sebelum mengakses propertinya.
  // Jika modal entah bagaimana terbuka tanpa sesi aktif, ini mencegah crash.
  if (!currentUser || !currentUser.userID || !currentUser.token) {
    Swal.fire({ icon: 'error', title: 'Sesi Tidak Valid', text: 'Silakan login ulang.', timer: 2000, showConfirmButton: false });
    closeSendNotifModal();
    return;
  }

  const ta = document.getElementById('notif-message-input');
  const message = ta ? ta.value.trim() : '';

  if (!message) {
    Swal.fire({ icon: 'warning', title: 'Pesan kosong', text: 'Ketik pesan terlebih dahulu.', timer: 2000, showConfirmButton: false });
    if (ta) ta.focus();
    return;
  }

  let examID       = '';
  let targetIDs    = [];
  const targetType = _notifTargetType;

  if (targetType === 'exam') {
    const examSel = document.getElementById('notif-exam-select');
    examID = examSel ? examSel.value.trim() : '';
    if (!examID) {
      Swal.fire({ icon: 'warning', title: 'Pilih Ujian', text: 'Pilih ujian target terlebih dahulu.', timer: 2000, showConfirmButton: false });
      return;
    }
  } else if (targetType === 'selected') {
    targetIDs = _notifTargetUserIDs.map(u => u.userID);
    if (targetIDs.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Tidak ada siswa', text: 'Pilih minimal 1 siswa.', timer: 2000, showConfirmButton: false });
      return;
    }
  }

  // Tutup modal
  closeSendNotifModal();

  Swal.fire({ title: 'Mengirim Pesan...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  google.script.run
    .withSuccessHandler(res => {
      Swal.fire({
        icon: res.success ? 'success' : 'error',
        title: res.success ? '✅ Pesan Terkirim!' : 'Gagal',
        text: res.message || '',
        timer: 2500,
        showConfirmButton: false
      });
    })
    .withFailureHandler(err => {
      Swal.fire('Error', String(err), 'error');
    })
    .sendStudentNotification(
      currentUser.userID,
      currentUser.token,
      message,
      targetType,
      examID,
      targetIDs
    );
}

// Keyboard ESC untuk tutup modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (document.getElementById('modal-send-notif') &&
        document.getElementById('modal-send-notif').classList.contains('show')) {
      closeSendNotifModal();
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// ── POLLING NOTIFIKASI DI HALAMAN UJIAN SISWA ────────────────
// ═══════════════════════════════════════════════════════════════

const NOTIF_POLL_INTERVAL_MS = 30000; // 30 detik
let _notifPollTimer = null;
let _notifShownIds  = new Set(); // ID yang sudah ditampilkan di sesi ini

/** Mulai polling notifikasi saat siswa membuka halaman ujian. */
function startNotificationPolling() {
  // BUG FIX NOTIF-6: Hentikan polling lama sebelum memulai yang baru,
  // agar tidak ada polling ganda jika startNotificationPolling dipanggil ulang
  // (misal siswa kembali ke halaman ujian setelah sempat keluar).
  // Juga clear _notifShownIds agar notifikasi lama tidak tersaring
  // (sesi ujian baru = set ID bersih).
  stopNotificationPolling();
  _notifShownIds = new Set();
  _pollNotifications(); // langsung cek sekali
  _notifPollTimer = setInterval(_pollNotifications, NOTIF_POLL_INTERVAL_MS);
}

/** Hentikan polling notifikasi saat siswa selesai ujian. */
function stopNotificationPolling() {
  if (_notifPollTimer) {
    clearInterval(_notifPollTimer);
    _notifPollTimer = null;
  }
  // BUG FIX NOTIF-9: JANGAN clear _notifShownIds di sini.
  // Jika di-clear setiap stop, notifikasi yang sudah ditampilkan bisa muncul
  // lagi saat polling restart (misal saat tab difokus ulang).
  // Reset _notifShownIds hanya dilakukan di startNotificationPolling()
  // saat ujian baru benar-benar dimulai.
}

function _pollNotifications() {
  // Hanya poll jika halaman ujian aktif
  const examPage = document.getElementById('page-exam');
  if (!examPage || examPage.classList.contains('hidden')) return;
  if (!currentUser || !currentUser.userID || !currentUser.token) return;
  // BUG FIX NOTIF-1: currentExam.examId → currentExam.id
  // Properti ID ujian di objek currentExam adalah 'id', bukan 'examId'.
  // 'examId' selalu undefined sehingga polling tidak pernah menemukan notifikasi.
  if (!currentExam || !currentExam.id) return;

  google.script.run
    .withSuccessHandler(res => {
      if (!res || !res.success) return;
      const msgs = res.messages || [];
      msgs.forEach(notif => {
        if (_notifShownIds.has(notif.notifID)) return;
        _notifShownIds.add(notif.notifID);
        showStudentNotifToast(notif);
      });
    })
    .withFailureHandler(() => { /* silent fail */ })
    // BUG FIX NOTIF-1 (lanjutan): ganti currentExam.examId → currentExam.id
    .getStudentNotifications(currentUser.userID, currentUser.token, currentExam.id);
}

/**
 * Tampilkan toast notifikasi di layar ujian siswa.
 * @param {{notifID, senderName, message, sentAt}} notif
 */
function showStudentNotifToast(notif) {
  const container = document.getElementById('student-notif-container');
  if (!container) return;

  const AUTO_DISMISS_MS = 8000; // 8 detik
  // BUG FIX NOTIF-5: notifID bisa mengandung karakter '-' dan angka.
  // Gunakan index counter sebagai suffix untuk ID DOM yang aman, bukan notifID mentah.
  const domId = 'ntst-' + (++showStudentNotifToast._counter);

  const toast = document.createElement('div');
  toast.id = domId;
  toast.className = 'student-notif-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.style.setProperty('--notif-duration', (AUTO_DISMISS_MS / 1000) + 's');

  // BUG FIX NOTIF-5 (lanjutan): onclick string menggunakan domId yang aman,
  // sehingga tidak perlu khawatir karakter khusus dalam notifID.
  toast.innerHTML = `
    <button class="student-notif-close" onclick="_dismissNotifToast('${domId}')" title="Tutup">
      <i class="fas fa-times"></i>
    </button>
    <div class="student-notif-header">
      <span class="notif-dot"></span>
      Pesan dari Pengawas
    </div>
    <div class="student-notif-body">${_escHtmlNotif(notif.message)}</div>
    <div class="student-notif-footer">
      <span><i class="fas fa-clock mr-1 opacity-60"></i>${_escHtmlNotif(notif.senderName)}</span>
      <span>${_escHtmlNotif(notif.sentAt)}</span>
    </div>
    <div class="student-notif-progress"></div>
  `;

  container.appendChild(toast);

  // Auto dismiss setelah AUTO_DISMISS_MS
  setTimeout(() => _dismissNotifToast(domId), AUTO_DISMISS_MS);
}
showStudentNotifToast._counter = 0;

function _dismissNotifToast(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('removing');
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
}

function _escHtmlNotif(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════════════════════════════
// ── SNAPSHOT & HIGHLIGHT PERUBAHAN BARIS ───────────────────────
// ═══════════════════════════════════════════════════════════════

/**
 * Buat map { responseId|userID → _status } dari rawData saat ini
 * sebagai snapshot sebelum refresh berikutnya.
 */
function _buildMonitorSnapshot(rawData) {
  const snap = {};
  if (!rawData) return snap;
  const buckets = ['belumLogin','sudahLogin','mengerjakan','selesai','curang'];
  buckets.forEach(bucket => {
    (rawData[bucket] || []).forEach(e => {
      const key = e.responseId || ('NOLOGIN_' + e.userID);
      snap[key] = bucket;
    });
  });
  return snap;
}

/** Setelah render, cari baris yang statusnya berbeda dari snapshot lama dan flash. */
function _highlightChangedRows(prevSnapshot) {
  if (!prevSnapshot || Object.keys(prevSnapshot).length === 0) return;
  // Jalankan setelah DOM selesai di-paint
  requestAnimationFrame(() => {
    document.querySelectorAll('#monitor-table-wrapper tr[data-key]').forEach(tr => {
      const key = tr.dataset.key;
      const newStatus = tr.dataset.status;
      if (key && prevSnapshot[key] && prevSnapshot[key] !== newStatus) {
        tr.classList.remove('monitor-row-changed');
        // Trigger reflow agar animasi restart
        void tr.offsetWidth;
        tr.classList.add('monitor-row-changed');
      }
    });
  });
}

/** escHtml versi global untuk dipakai di luar renderMonitorTable */
function escHtmlGlobal(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════════════════════════════
// ── VIOLATION DETAIL SLIDE PANEL ───────────────────────────────
// ═══════════════════════════════════════════════════════════════

/**
 * Buka slide panel riwayat pelanggaran.
 * @param {string} namaHtml - nama siswa (sudah di-escHtml, aman untuk innerHTML)
 * @param {number} total    - jumlah total pelanggaran
 * @param {Array}  logs     - array { waktu, jenis, detail } dari server
 */
function openViolationPanel(namaHtml, total, logs) {
  const overlay  = document.getElementById('viol-panel-overlay');
  const title    = document.getElementById('viol-panel-title');
  const subtitle = document.getElementById('viol-panel-subtitle');
  const body     = document.getElementById('viol-panel-body');
  if (!overlay || !body) return;

  // Set header
  if (title)    title.textContent  = 'Riwayat Pelanggaran';
  if (subtitle) subtitle.textContent = namaHtml + ' — ' + total + ' pelanggaran';

  // Build body
  const safeEsc = s => String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  if (!Array.isArray(logs) || logs.length === 0) {
    body.innerHTML = `<div class="viol-empty">
      <i class="fas fa-check-circle text-emerald-400 text-2xl mb-2 block"></i>
      Tidak ada riwayat pelanggaran tercatat.
    </div>`;
  } else {
    const rows = logs.map((row, i) => `
      <div class="viol-row">
        <span class="viol-row-time">${safeEsc(row.waktu || '-')}</span>
        <span class="viol-row-jenis">
          <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-100 text-orange-600 text-[9px] font-black mr-1">${i+1}</span>
          ${safeEsc(row.jenis || '-')}
        </span>
        <span class="viol-row-detail">${safeEsc(row.detail || '')}</span>
      </div>`).join('');

    body.innerHTML = `
      <div class="viol-thead">
        <span>Waktu</span>
        <span>Jenis Pelanggaran</span>
        <span>Detail</span>
      </div>
      <div>${rows}</div>
      <div class="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-700 font-semibold flex items-center gap-2">
        <i class="fas fa-exclamation-triangle text-orange-400"></i>
        Total: <strong>${total} pelanggaran</strong> tercatat
      </div>`;
  }

  // Tampilkan overlay
  overlay.classList.add('show');
  document.addEventListener('keydown', _violPanelEscHandler);
}

function closeViolationPanel() {
  const overlay = document.getElementById('viol-panel-overlay');
  if (overlay) overlay.classList.remove('show');
  document.removeEventListener('keydown', _violPanelEscHandler);
}

function _violPanelEscHandler(e) {
  if (e.key === 'Escape') closeViolationPanel();
}

// State: batas pelanggaran dari Konfigurasi (diisi saat loadMonitorData berhasil)
let monitorViolationLimit = 0;

// ═══════════════════════════════════════════════════════════════
// ── SISA WAKTU — Live Countdown Timers ─────────────────────────
// ═══════════════════════════════════════════════════════════════

let _monitorTimerHandle = null; // setInterval handle untuk tick timer

/** Format milisecond sisa → "MM:SS" atau "HH:MM:SS" */
function _formatRemainMs(ms) {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Mulai setInterval yang update semua elemen [data-end] di tabel monitor.
 * Dipanggil setelah setiap renderMonitorTable().
 * Membersihkan interval sebelumnya agar tidak tumpuk.
 */
function _startMonitorTimers() {
  if (_monitorTimerHandle) { clearInterval(_monitorTimerHandle); _monitorTimerHandle = null; }

  // Cek apakah ada baris yang perlu countdown
  const timerEls = document.querySelectorAll('#monitor-table-wrapper [data-end]');
  if (timerEls.length === 0) return;

  _monitorTimerHandle = setInterval(() => {
    const els = document.querySelectorAll('#monitor-table-wrapper .monitor-timer[data-end]');
    if (els.length === 0) { clearInterval(_monitorTimerHandle); _monitorTimerHandle = null; return; }
    const now = Date.now();
    els.forEach(el => {
      const endMs    = Number(el.dataset.end);
      const remainMs = endMs - now;
      if (remainMs <= 0) {
        el.innerHTML = '<i class="fas fa-hourglass-end text-[9px]"></i>Habis';
        el.className = 'monitor-timer done';
        delete el.dataset.end; // Hapus agar tidak diproses lagi
        return;
      }
      const txt = _formatRemainMs(remainMs);
      // Update class berdasarkan urgensi
      el.className = 'monitor-timer ' + (
        remainMs < 5  * 60 * 1000 ? 'urgent'  :
        remainMs < 10 * 60 * 1000 ? 'warning' : 'ok'
      );
      // Update teks saja (preserve icon)
      const icon = el.querySelector('i');
      el.textContent = txt;
      if (icon) el.prepend(icon);
    });
  }, 1000);
}

// Bersihkan timer saat reload atau navigasi keluar
window.addEventListener('beforeunload', () => {
  if (_monitorTimerHandle) { clearInterval(_monitorTimerHandle); _monitorTimerHandle = null; }
  // BUG FIX NOTIF-10: Hentikan polling notifikasi siswa saat halaman di-reload/tutup
  // agar tidak ada call orphan yang tertunda.
  if (typeof stopNotificationPolling === 'function') stopNotificationPolling();
});

// ═══════════════════════════════════════════════════════════════
// ── EXPORT KE EXCEL ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

function exportMonitorToExcel() {
  if (!monitorRawData) {
    Swal.fire({ icon:'info', title:'Belum ada data', text:'Klik Refresh terlebih dahulu untuk memuat data monitor.', customClass:{popup:'lp-swal'} });
    return;
  }

  // Gunakan data yang sedang ditampilkan (filtered) atau semua jika filter kosong
  const sourceData = (monitorFiltered && monitorFiltered.length > 0) ? monitorFiltered : (() => {
    const add = (arr, s) => (arr || []).map(e => ({...e, _status: s}));
    return [
      ...add(monitorRawData.belumLogin,  'belumLogin'),
      ...add(monitorRawData.sudahLogin,  'sudahLogin'),
      ...add(monitorRawData.mengerjakan, 'mengerjakan'),
      ...add(monitorRawData.selesai,     'selesai'),
      ...add(monitorRawData.curang,      'curang')
    ];
  })();

  if (sourceData.length === 0) {
    Swal.fire({ icon:'info', title:'Data kosong', text:'Tidak ada siswa untuk diekspor.', customClass:{popup:'lp-swal'} });
    return;
  }

  const statusLabel = { belumLogin:'Belum Login', sudahLogin:'Sudah Login', mengerjakan:'Mengerjakan', selesai:'Selesai', curang:'Curang' };

  // ── Header ──
  const header = ['No', 'Nama Siswa', 'ID Siswa', 'Kelas', 'Mata Pelajaran', 'Status',
    'Progress', 'Sisa Waktu (mnt)', 'Waktu Mulai', 'Waktu Selesai/Submit', 'Nilai', 'Pelanggaran'];

  // ── Rows ──
  const rows = sourceData.map((e, i) => {
    // Hitung sisa waktu dalam menit
    let sisaWaktu = '-';
    if (e._status === 'mengerjakan' && e.duration && e.startTime && e.startTime !== '-') {
      const parts = String(e.startTime).split(/[/ :]/);
      if (parts.length >= 6) {
        const startMs  = new Date(+parts[2], +parts[1]-1, +parts[0], +parts[3], +parts[4], +parts[5]).getTime();
        const endMs    = startMs + (Number(e.duration) || 0) * 60 * 1000;
        const remainMs = endMs - Date.now();
        sisaWaktu = remainMs > 0 ? Math.ceil(remainMs / 60000) : 0;
      }
    }

    const total    = Number(e.totalQuestions) || 0;
    const answered = Number(e.answeredCount)  || 0;
    const progress = total > 0 ? `${answered}/${total}` : '-';
    const score    = (e.score !== undefined && e.score !== '-') ? parseFloat(e.score) : '-';

    return [
      i + 1,
      e.nama || '-',
      e.userID || '-',
      e.kelas  || '-',
      e.mapel  || '-',
      statusLabel[e._status] || e._status || '-',
      progress,
      sisaWaktu,
      (e.startTime  && e.startTime  !== '-') ? e.startTime  : '-',
      (e.submitTime && e.submitTime !== '-') ? e.submitTime : '-',
      score,
      e.violations || 0
    ];
  });

  // ── Buat workbook ──
  if (typeof XLSX === 'undefined') {
    Swal.fire({ icon:'error', title:'Library tidak tersedia', text:'Pastikan koneksi internet aktif (XLSX library perlu dimuat).', customClass:{popup:'lp-swal'} });
    return;
  }

  const wb = XLSX.utils.book_new();
  const wsData = [header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ── Styling header ──
  const headerStyle = {
    font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    fill:      { fgColor: { rgb: '1E3A8A' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: { bottom: { style: 'thin', color: { rgb: 'CBD5E0' } } }
  };
  const colRange = XLSX.utils.decode_range(ws['!ref']);
  for (let c = colRange.s.c; c <= colRange.e.c; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[cellAddr]) ws[cellAddr].s = headerStyle;
  }

  // ── Styling baris data (zebra + warna per status) ──
  const statusColors = { 'Belum Login':'F8FAFC', 'Sudah Login':'EFF6FF', 'Mengerjakan':'FFFBEB', 'Selesai':'F0FDF4', 'Curang':'FEF2F2' };
  for (let r = 1; r < wsData.length; r++) {
    const rowStatus = wsData[r][5];
    const bgColor   = statusColors[rowStatus] || (r % 2 === 0 ? 'F9FAFB' : 'FFFFFF');
    for (let c = colRange.s.c; c <= colRange.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      if (!ws[cellAddr]) ws[cellAddr] = { t: 's', v: '' };
      ws[cellAddr].s = {
        fill:      { fgColor: { rgb: bgColor } },
        font:      { sz: 10 },
        alignment: { vertical: 'center', wrapText: false },
        border: { bottom: { style: 'hair', color: { rgb: 'E2E8F0' } } }
      };
    }
  }

  // ── Lebar kolom otomatis ──
  ws['!cols'] = [
    { wch: 4 },  // No
    { wch: 24 }, // Nama
    { wch: 14 }, // ID
    { wch: 12 }, // Kelas
    { wch: 20 }, // Mapel
    { wch: 14 }, // Status
    { wch: 10 }, // Progress
    { wch: 14 }, // Sisa Waktu
    { wch: 18 }, // Mulai
    { wch: 18 }, // Selesai
    { wch: 8  }, // Nilai
    { wch: 10 }  // Pelanggaran
  ];

  // ── Freeze baris header ──
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws, 'Monitor Ujian');

  // ── Nama file ──
  const now      = new Date();
  const pad      = n => String(n).padStart(2, '0');
  const tStamp   = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const examLabel = monitorActiveExam
    ? (monitorExamList.find(ex => ex.examID === monitorActiveExam) || {}).subject || 'Ujian'
    : 'Semua';
  const fileName = `Monitor_${examLabel}_${tStamp}.xlsx`.replace(/[^a-zA-Z0-9_\-.]/g, '_');

  XLSX.writeFile(wb, fileName);
}
