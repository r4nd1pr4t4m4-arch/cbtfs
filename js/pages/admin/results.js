/**
 * results.js — Hasil dan Nilai
 * renderResults() + _rs* helpers + unlockStudent + downloadResultPDF + viewStudentAnswers
 * Sumber: index.html L24441-25829
 */

function renderResults(container) {
  // UI state
  if (!window._resultsUI) {
    window._resultsUI = {
      examId: '',
      filterStatus:  '',  // ''|selesai|progress|cheat|timeout  (status kategori)
      filterPassing: '',  // ''|lulus|tidakLulus              (status kelulusan KKM)
      filterClass:   '',
      search: '',
      sortBy: 'name',
      sortDir:'asc',
      page: 1,
      pageSize: 25
    };
  }
  // Migrasi state lama (jika sebelumnya filterStatus berisi 'lulus'/'tidakLulus')
  if (window._resultsUI.filterStatus === 'lulus' || window._resultsUI.filterStatus === 'tidakLulus') {
    window._resultsUI.filterPassing = window._resultsUI.filterStatus;
    window._resultsUI.filterStatus = '';
  }
  if (typeof window._resultsUI.filterPassing === 'undefined') {
    window._resultsUI.filterPassing = '';
  }

  // Build exam options
  const opts = (cachedExams || []).map(e => {
    const safe = String(e.subject || '').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    const cls  = String(e.class   || '').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    return `<option value="${e.id}">${safe} (${cls})</option>`;
  }).join('');

  container.innerHTML = `
    <div class="rs-page fade-in">

      <!-- ── Header Banner ── -->
      <div class="rs-header">
        <div class="min-w-0">
          <h2 class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white text-sm flex-shrink-0">
              <i class="fas fa-chart-column"></i>
            </span>
            Laporan Hasil & Penilaian
          </h2>
          <p>Pilih ujian untuk melihat nilai siswa, koreksi esai, dan unduh rekap.</p>
        </div>
        <div class="rs-header-actions">
          <button id="btn-pdf-recap" class="rs-header-btn" onclick="downloadResultPDF()" style="display:none;" aria-label="Download rekap PDF">
            <i class="fas fa-file-pdf"></i>
            <span class="hidden sm:inline">Rekap PDF</span>
          </button>
          <button id="btn-excel-recap" class="rs-header-btn solid" onclick="downloadResultsAsExcel()" style="display:none;" aria-label="Download rekap Excel">
            <i class="fas fa-file-excel"></i>
            <span class="hidden sm:inline">Rekap Excel</span>
          </button>
        </div>
      </div>

      <!-- ── Toolbar: Pilih Ujian ── -->
      <div class="rs-toolbar">
        <div class="rs-toolbar-top">
          <div class="flex-1 min-w-0">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5" for="select-result-exam">
              <i class="fas fa-book-open text-blue-500"></i> Pilih Mata Pelajaran
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                <i class="fas fa-graduation-cap"></i>
              </span>
              <select id="select-result-exam"
                class="pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl w-full bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 shadow-sm transition-all appearance-none font-semibold cursor-pointer text-sm"
                onchange="loadResultsTable(this.value)"
                aria-label="Pilih mata pelajaran ujian">
                <option value="">— Pilih Mata Pelajaran —</option>${opts}
              </select>
              <span class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <i class="fas fa-chevron-down text-xs"></i>
              </span>
            </div>
          </div>
        </div>

        <!-- Stat cards + filter row dimount di sini setelah data dimuat -->
        <div id="rs-stats-mount" style="display:none;"></div>
        <div id="rs-filter-mount" style="display:none;"></div>
      </div>

      <!-- ── Content Area: empty state awal ── -->
      <div id="res-content-area">
        <div class="bg-white rounded-2xl border border-slate-200" style="text-align:center;padding:52px 24px;color:#94a3b8;">
          <div style="width:72px;height:72px;border-radius:50%;background:#f0f9ff;color:#93c5fd;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">
            <i class="fas fa-chart-bar"></i>
          </div>
          <p class="font-bold text-slate-600 text-sm">Belum ada ujian dipilih</p>
          <p class="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Pilih mata pelajaran di atas untuk menampilkan daftar nilai dan rekap hasil ujian siswa.
          </p>
        </div>
      </div>

    </div>`;

  // Reset state on tab open
  window._resultsUI.examId = '';
  window._resultsUI.search = '';
  window._resultsUI.filterStatus = '';
  window._resultsUI.filterPassing = '';  // BUG FIX RS-7: filterPassing harus di-reset agar tidak tertinggal dari ujian sebelumnya
  window._resultsUI.filterClass = '';
  window._resultsUI.page = 1;

  // Reset legacy globals
  allResultsData = [];
  filteredResults = [];
  currentPage = 1;
}

function loadResultsTable(eid) {
  const ui = window._resultsUI;
  const area = document.getElementById('res-content-area');
  const btnPdf = document.getElementById('btn-pdf-recap');
  const btnExcel = document.getElementById('btn-excel-recap');
  const statsMount  = document.getElementById('rs-stats-mount');
  const filterMount = document.getElementById('rs-filter-mount');

  if (!eid) {
    if (btnPdf)   btnPdf.style.display   = 'none';
    if (btnExcel) btnExcel.style.display = 'none';
    if (statsMount)  statsMount.style.display  = 'none';
    if (filterMount) filterMount.style.display = 'none';
    if (area) {
      area.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200" style="text-align:center;padding:52px 24px;color:#94a3b8;">
          <div style="width:72px;height:72px;border-radius:50%;background:#f0f9ff;color:#93c5fd;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">
            <i class="fas fa-chart-bar"></i>
          </div>
          <p class="font-bold text-slate-600 text-sm">Belum ada ujian dipilih</p>
          <p class="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Pilih mata pelajaran di atas untuk menampilkan daftar nilai siswa.
          </p>
        </div>`;
    }
    ui.examId = '';
    return;
  }

  ui.examId = eid;
  ui.page = 1;
  // BUG FIX RS-7b: reset semua filter saat ujian berganti agar filter dari ujian
  // sebelumnya (misalnya filter kelas atau KKM) tidak diterapkan ke data baru.
  ui.filterStatus  = '';
  ui.filterPassing = '';
  ui.filterClass   = '';
  ui.search        = '';

  if (btnPdf)   btnPdf.style.display   = 'inline-flex';
  if (btnExcel) btnExcel.style.display = 'inline-flex';

  // Skeleton loading state
  area.innerHTML = `
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div class="rs-skel-row" style="height:16px;width:140px;border-radius:6px;"></div>
        <div class="rs-skel-row" style="height:16px;width:80px;border-radius:6px;"></div>
      </div>
      <div class="p-5 space-y-3">
        ${Array(6).fill(0).map(() => `<div class="rs-skel-row"></div>`).join('')}
      </div>
    </div>`;
  if (statsMount)  statsMount.style.display  = '';
  if (filterMount) filterMount.style.display = '';

  google.script.run
    .withSuccessHandler(res => {
      allResultsData  = Array.isArray(res) ? res : [];
      filteredResults = allResultsData.slice();
      _refreshResultsUI();
    })
    .withFailureHandler(err => {
      _renderResultsError((err && err.message) ? err.message : String(err || 'Gagal mengambil data.'));
    })
    .getExamResults(eid, currentUser.userID, currentUser.token);
}

function _renderResultsError(msg) {
  const area = document.getElementById('res-content-area');
  if (!area) return;
  area.innerHTML = `
    <div class="dash-error-state max-w-md mx-auto">
      <div class="ico"><i class="fas fa-triangle-exclamation"></i></div>
      <h3 class="font-bold text-base text-red-700 mb-1">Gagal Memuat Hasil</h3>
      <p class="text-xs text-red-600 mb-4">${String(msg || '').replace(/</g,'&lt;')}</p>
      <button onclick="loadResultsTable(window._resultsUI && window._resultsUI.examId || '')" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
        <i class="fas fa-rotate-right"></i> Coba Lagi
      </button>
    </div>`;
}

// Re-compute & render UI from state
function _refreshResultsUI() {
  const ui = window._resultsUI;
  const raw = Array.isArray(allResultsData) ? allResultsData : [];

  // Filter
  const search = (ui.search || '').toLowerCase().trim();
  const filtered = raw.filter(r => {
    const name  = String(r.name || '').toLowerCase();
    const sid   = String(r.studentId || '').toLowerCase();
    const cls   = String(r.class || '');
    const cat   = _rsCategory(r);

    // Filter status kategori (Selesai / Mengerjakan / Waktu Habis / Diblokir)
    if (ui.filterStatus && cat !== ui.filterStatus) return false;

    // Filter kelulusan KKM (Lulus / Tidak Lulus) — independen dari status kategori
    if (ui.filterPassing) {
      const _pg = (r.passingGrade && r.passingGrade > 0) ? r.passingGrade : 0;
      const score = parseFloat(r.score);
      // Hanya berlaku untuk yang sudah selesai/timeout dan punya KKM
      if (cat !== 'selesai' && cat !== 'timeout') return false;
      if (_pg <= 0 || isNaN(score)) return false;
      if (ui.filterPassing === 'lulus'      && !(score >= _pg)) return false;
      if (ui.filterPassing === 'tidakLulus' && !(score <  _pg)) return false;
    }

    if (ui.filterClass && cls !== ui.filterClass) return false;
    if (search && !name.includes(search) && !sid.includes(search)) return false;
    return true;
  });

  // Sort
  const dir = ui.sortDir === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    let va, vb;
    switch (ui.sortBy) {
      case 'score':
        va = parseFloat(a.score); vb = parseFloat(b.score);
        if (isNaN(va)) va = -1; if (isNaN(vb)) vb = -1;
        break;
      case 'submitTime':
        va = String(a.submitTime || ''); vb = String(b.submitTime || '');
        break;
      case 'status':
        va = String(a.status || ''); vb = String(b.status || '');
        break;
      case 'name':
      default:
        va = String(a.name || '').toLowerCase(); vb = String(b.name || '').toLowerCase();
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return  1 * dir;
    return 0;
  });

  filteredResults = filtered;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
  if (ui.page > totalPages) ui.page = totalPages;
  const startIdx = (ui.page - 1) * ui.pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + ui.pageSize);

  _rsRenderStats(raw);
  _rsRenderFilter(raw);
  _rsRenderContent(pageItems, filtered.length, ui.page, totalPages, startIdx);
}

function _rsCategory(r) {
  // FIX BUG-14: normalize ke lowercase trim agar variasi kapitalisasi tertangani
  const s = String(r.status || '').toLowerCase().trim();
  if (s === 'curang' || s === 'cheating') return 'cheat';
  if (s === 'waktu habis' || s === 'timeout' || s === 'time_out') return 'timeout';
  if (s === 'completed' || s === 'selesai' || s === 'sudah submit' || s === 'submitted' || s === 'submit') return 'selesai';
  return 'progress';
}

function _rsRenderStats(raw) {
  const mount = document.getElementById('rs-stats-mount');
  if (!mount) return;
  mount.style.display = '';

  const ui = window._resultsUI;
  const total = raw.length;
  const sCounts = { selesai:0, progress:0, timeout:0, cheat:0 };
  let scoreSum = 0, scoreCount = 0, lulus = 0, tidakLulus = 0, hasPassingGrade = false;
  raw.forEach(r => {
    const cat = _rsCategory(r);
    sCounts[cat]++;
    const score = parseFloat(r.score);
    if (!isNaN(score) && (cat === 'selesai' || cat === 'timeout')) {
      scoreSum += score;
      scoreCount++;
      const pg = parseFloat(r.passingGrade);
      if (pg > 0) {
        hasPassingGrade = true;
        if (score >= pg) lulus++;
        else tidakLulus++;
      }
    }
  });
  const avg = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(2) : '-';
  const lulusPct = (lulus + tidakLulus) > 0 ? Math.round(lulus / (lulus + tidakLulus) * 100) : 0;

  const stat = (key, ico, activeIco, color, activeColor, label, value) => `
    <div class="rs-stat ${ui.filterStatus===key?'active':''}"
      onclick="_rsSetFilter('status', '${key}')" tabindex="0" role="button"
      aria-pressed="${ui.filterStatus===key}"
      onkeydown="if(event.key==='Enter'||event.key===' ')_rsSetFilter('status','${key}')">
      <div class="rs-stat-ico ${ui.filterStatus===key ? activeColor : color}">
        <i class="fas ${ui.filterStatus===key ? activeIco : ico}"></i>
      </div>
      <div class="min-w-0">
        <div class="rs-stat-num">${value}</div>
        <div class="rs-stat-lbl">${label}</div>
      </div>
    </div>`;

  mount.innerHTML = `
    <div class="rs-stat-grid">
      <div class="rs-stat ${ui.filterStatus===''?'active':''}"
        onclick="_rsSetFilter('status','')" tabindex="0" role="button"
        aria-pressed="${ui.filterStatus===''}"
        onkeydown="if(event.key==='Enter'||event.key===' ')_rsSetFilter('status','')">
        <div class="rs-stat-ico ${ui.filterStatus==='' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'}">
          <i class="fas fa-users"></i>
        </div>
        <div class="min-w-0">
          <div class="rs-stat-num">${total}</div>
          <div class="rs-stat-lbl">Semua</div>
        </div>
      </div>
      ${stat('selesai',  'fa-circle-check',      'fa-circle-check',     'bg-emerald-100 text-emerald-600', 'bg-emerald-200 text-emerald-700', 'Selesai',     sCounts.selesai)}
      ${stat('progress', 'fa-spinner',            'fa-spinner',          'bg-amber-100 text-amber-600',    'bg-amber-200 text-amber-700',    'Mengerjakan', sCounts.progress)}
      ${stat('timeout',  'fa-clock',              'fa-clock',            'bg-orange-100 text-orange-600',  'bg-orange-200 text-orange-700',  'Waktu Habis', sCounts.timeout)}
      ${stat('cheat',    'fa-triangle-exclamation','fa-triangle-exclamation','bg-red-100 text-red-600',    'bg-red-200 text-red-700',        'Diblokir',    sCounts.cheat)}
      <div class="rs-stat" title="Rata-rata skor ${hasPassingGrade ? `· ${lulusPct}% lulus KKM` : ''}">
        <div class="rs-stat-ico bg-blue-100 text-blue-600"><i class="fas fa-calculator"></i></div>
        <div class="min-w-0">
          <div class="rs-stat-num">${avg}</div>
          <div class="rs-stat-lbl">Rata-rata${hasPassingGrade ? ` · ${lulusPct}%` : ''}</div>
        </div>
      </div>
    </div>`;
}

function _rsRenderFilter(raw) {
  const mount = document.getElementById('rs-filter-mount');
  if (!mount) return;
  mount.style.display = '';
  const ui = window._resultsUI;
  const escAttr = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  const escHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const classes = [...new Set(raw.map(r => String(r.class || '').trim()).filter(Boolean))].sort();

  // Get passing-grade flag
  const pg = raw.find(r => parseFloat(r.passingGrade) > 0);
  const hasPG = !!pg;

  const hasFilters = !!(ui.filterStatus || ui.filterPassing || ui.filterClass || ui.search);

  // Active filter chips for clarity
  const statusLabel = { selesai:'Selesai', progress:'Mengerjakan', timeout:'Waktu Habis', cheat:'Diblokir' };
  const passingLabel = { lulus:'Lulus KKM', tidakLulus:'Tidak Lulus' };
  const chips = [];
  if (ui.filterStatus)  chips.push({ label: `Status: ${statusLabel[ui.filterStatus] || ui.filterStatus}`, key:'status' });
  if (ui.filterPassing) chips.push({ label: `KKM: ${passingLabel[ui.filterPassing] || ui.filterPassing}`, key:'passing' });
  if (ui.filterClass)   chips.push({ label: `Kelas: ${ui.filterClass}`, key:'class' });
  if (ui.search)        chips.push({ label: `Cari: "${ui.search}"`, key:'search' });

  const chipsHtml = chips.length > 0 ? `
    <div class="rs-active-chips">
      <span class="rs-active-chips-label"><i class="fas fa-filter"></i> Filter aktif:</span>
      ${chips.map(c => `
        <span class="rs-active-chip">
          ${escHtml(c.label)}
          <button onclick="_rsSetFilter('${c.key}', '')" title="Hapus filter ini" aria-label="Hapus filter ${escHtml(c.label)}">
            <i class="fas fa-times"></i>
          </button>
        </span>
      `).join('')}
      <button class="rs-active-chips-reset" onclick="_rsResetFilters()" title="Reset semua filter">
        Reset semua
      </button>
    </div>
  ` : '';

  mount.innerHTML = `
    <div class="rs-filter">
      <div class="ex-search" style="flex:1 1 200px; min-width:0;" role="search">
        <i class="fas fa-search" aria-hidden="true"></i>
        <input id="result-search-input" type="search"
          placeholder="Cari nama atau ID siswa…"
          value="${escAttr(ui.search)}"
          oninput="_rsSetFilter('search', this.value)"
          autocomplete="off"
          aria-label="Cari nama atau ID siswa">
        <button class="ex-search-clear ${ui.search ? 'show' : ''}" id="rs-search-clear-btn"
          onclick="_rsSetFilter('search','')" title="Hapus pencarian" aria-label="Hapus pencarian">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      ${classes.length > 1 ? `
        <select class="ex-select" onchange="_rsSetFilter('class', this.value)" aria-label="Filter kelas">
          <option value="">🏫 Semua Kelas</option>
          ${classes.map(c => `<option value="${escAttr(c)}" ${ui.filterClass===c?'selected':''}>${escHtml(c)}</option>`).join('')}
        </select>` : ''}
      ${hasPG ? `
        <select class="ex-select" onchange="_rsSetFilter('passing', this.value)" aria-label="Filter kelulusan KKM">
          <option value="">📊 Semua Kelulusan</option>
          <option value="lulus"      ${ui.filterPassing==='lulus'?'selected':''}>✅ Lulus KKM</option>
          <option value="tidakLulus" ${ui.filterPassing==='tidakLulus'?'selected':''}>❌ Tidak Lulus</option>
        </select>` : ''}
      <select class="ex-select" onchange="_rsSetPageSize(this.value)" aria-label="Baris per halaman">
        <option value="10"  ${ui.pageSize===10?'selected':''}>10 baris</option>
        <option value="25"  ${ui.pageSize===25?'selected':''}>25 baris</option>
        <option value="50"  ${ui.pageSize===50?'selected':''}>50 baris</option>
        <option value="100" ${ui.pageSize===100?'selected':''}>100 baris</option>
        <option value="500" ${ui.pageSize===500?'selected':''}>500 baris</option>
      </select>
      ${hasFilters ? `
        <button onclick="_rsResetFilters()" class="rs-reset-btn" title="Reset semua filter" aria-label="Reset semua filter">
          <i class="fas fa-times-circle" aria-hidden="true"></i>
          <span class="hidden sm:inline">Reset</span>
        </button>` : ''}
    </div>
    ${chipsHtml}
  `;
}

function _rsRenderContent(items, totalFiltered, page, totalPages, startIdx) {
  const area = document.getElementById('res-content-area');
  if (!area) return;
  const raw = Array.isArray(allResultsData) ? allResultsData : [];

  if (raw.length === 0) {
    area.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200" style="text-align:center;padding:52px 24px;color:#94a3b8;">
        <div style="width:72px;height:72px;border-radius:50%;background:#f0fdf4;color:#86efac;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">
          <i class="fas fa-inbox"></i>
        </div>
        <p class="font-bold text-slate-700 text-sm">Belum Ada Hasil Ujian</p>
        <p class="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
          Belum ada siswa yang mengumpulkan jawaban untuk ujian ini.
        </p>
      </div>`;
    return;
  }
  if (totalFiltered === 0) {
    area.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200" style="text-align:center;padding:52px 24px;color:#94a3b8;">
        <div style="width:72px;height:72px;border-radius:50%;background:#fafafa;color:#cbd5e1;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">
          <i class="fas fa-filter-circle-xmark"></i>
        </div>
        <p class="font-bold text-slate-700 text-sm">Tidak ada hasil yang cocok</p>
        <p class="text-xs text-slate-400 mt-1.5 mb-4 max-w-xs mx-auto leading-relaxed">
          Bersihkan filter atau ubah kata kunci pencarian.
        </p>
        <button onclick="_rsResetFilters()"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition active:scale-95">
          <i class="fas fa-rotate-left"></i> Reset Semua Filter
        </button>
      </div>`;
    return;
  }

  const tableHtml = _rsBuildTable(items, startIdx);
  const cardsHtml = _rsBuildCards(items, startIdx);
  const pagi      = _rsPagination(totalFiltered, page, totalPages);

  area.innerHTML = `
    <div class="rs-table-wrap">
      <div style="overflow-x:auto;">${tableHtml}</div>
      ${pagi}
    </div>
    <div class="rs-cards" style="margin-top:0;">
      ${cardsHtml}
      <div class="bg-white rounded-xl border border-slate-200">${pagi}</div>
    </div>`;
}

function _rsBuildTable(items, startIdx) {
  const ui = window._resultsUI;
  const sortIco = (key) => {
    if (ui.sortBy !== key) return '<i class="fas fa-sort rs-sort"></i>';
    return ui.sortDir === 'asc' ? '<i class="fas fa-sort-up rs-sort"></i>' : '<i class="fas fa-sort-down rs-sort"></i>';
  };
  const sortedHead = (key) => ui.sortBy === key ? 'sorted' : '';

  const rows = items.map((r, i) => _rsBuildTableRow(r, startIdx + i + 1)).join('');

  return `
    <table class="rs-table">
      <thead>
        <tr>
          <th style="width:44px;text-align:center;">#</th>
          <th class="sortable ${sortedHead('name')}" onclick="_rsSetSort('name')" title="Urutkan berdasarkan nama">
            Identitas Siswa ${sortIco('name')}
          </th>
          <th class="sortable ${sortedHead('submitTime')}" onclick="_rsSetSort('submitTime')" style="width:160px;" title="Urutkan berdasarkan waktu submit">
            Waktu Submit ${sortIco('submitTime')}
          </th>
          <th class="sortable ${sortedHead('score')}" onclick="_rsSetSort('score')" style="width:120px;text-align:center;" title="Urutkan berdasarkan nilai">
            Nilai ${sortIco('score')}
          </th>
          <th class="sortable ${sortedHead('status')}" onclick="_rsSetSort('status')" style="width:130px;text-align:center;" title="Urutkan berdasarkan status">
            Status ${sortIco('status')}
          </th>
          <th style="width:150px;text-align:right;">Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function _rsBuildTableRow(r, idx) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  const cat = _rsCategory(r);
  const initial = ((r.name || '?').charAt(0) || '?').toUpperCase();
  const rid = escAttr(r.responseId);
  const rname = escAttr(r.name || '');

  // Score block
  let scoreBlock = '';
  if (cat === 'cheat') {
    scoreBlock = `<span class="rs-score rs-score-na"><span class="rs-score-num line-through opacity-70">${formatScore(r.score)}</span><span class="rs-score-lbl">Diblokir</span></span>`;
  } else if (cat === 'progress') {
    scoreBlock = `<span class="rs-score rs-score-na"><span class="rs-score-num">—</span><span class="rs-score-lbl">Belum selesai</span></span>`;
  } else {
    const sc = parseFloat(r.score);
    const pg = parseFloat(r.passingGrade);
    let cls = 'rs-score-na';
    if (!isNaN(sc)) {
      if (pg > 0) cls = sc >= pg ? 'rs-score-lulus' : (sc >= pg * 0.67 ? 'rs-score-mid' : 'rs-score-low');
      else cls = sc >= 75 ? 'rs-score-lulus' : (sc >= 50 ? 'rs-score-mid' : 'rs-score-low');
    }
    let pill = '';
    if (pg > 0 && !isNaN(sc)) {
      pill = sc >= pg
        ? '<div class="rs-passing-pill rs-passing-yes"><i class="fas fa-check-circle"></i> LULUS</div>'
        : '<div class="rs-passing-pill rs-passing-no"><i class="fas fa-times-circle"></i> TIDAK LULUS</div>';
    }
    scoreBlock = `<span class="rs-score"><span class="rs-score-num ${cls}">${formatScore(r.score)}</span><span class="rs-score-lbl">${pg > 0 ? 'KKM ' + pg : 'Skor'}</span>${pill}</span>`;
  }

  // Status badge
  let statusBadge = '';
  if (cat === 'cheat')    statusBadge = '<span class="rs-status rs-st-cheat"><span class="dot"></span> DIBLOKIR</span>';
  else if (cat === 'timeout')  statusBadge = '<span class="rs-status rs-st-timeout"><i class="fas fa-clock"></i> WAKTU HABIS</span>';
  else if (cat === 'progress') statusBadge = '<span class="rs-status rs-st-progress"><span class="dot"></span> MENGERJAKAN</span>';
  else                          statusBadge = '<span class="rs-status rs-st-selesai"><span class="dot"></span> SELESAI</span>';

  // Actions
  let actions = '';
  if (cat === 'cheat') {
    actions = `
      <div class="rs-actions">
        <button class="ex-action-btn rs-action-unlock" onclick="unlockStudent('${rid}', '${rname}')" title="Buka akses (jawaban dipertahankan)">
          <i class="fas fa-lock-open"></i>
        </button>
        <button class="ex-action-btn rs-action-reset" onclick="resetExamAttempt('${rid}', '${rname}')" title="Reset & ulangi ujian dari awal">
          <i class="fas fa-rotate-right"></i>
        </button>
      </div>`;
  } else if (cat === 'progress') {
    actions = `<span class="text-slate-300 text-xs">—</span>`;
  } else {
    actions = `
      <div class="rs-actions">
        <button class="ex-action-btn rs-action-view"  onclick="viewStudentAnswers('${rid}')" title="Lihat Jawaban">
          <i class="fas fa-eye"></i>
        </button>
        <button class="ex-action-btn rs-action-pdf"   onclick="downloadStudentPDF('${rid}', this)" title="Download PDF">
          <i class="fas fa-print"></i>
        </button>
        <button class="ex-action-btn rs-action-xls"   onclick="downloadSingleStudentAnswers('${rid}', '${rname}')" title="Download Excel">
          <i class="fas fa-file-excel"></i>
        </button>
        <button class="ex-action-btn rs-action-grade" onclick="openGradingModal('${rid}')" title="Koreksi Esai">
          <i class="fas fa-pen-to-square"></i>
        </button>
      </div>`;
  }

  return `
    <tr>
      <td style="text-align:center;color:#94a3b8;font-weight:700;font-size:12px;">${idx}</td>
      <td>
        <div class="flex items-center gap-3">
          <div class="rs-card-avatar" style="width:36px;height:36px;border-radius:9px;font-size:14px;flex-shrink:0;">${escHtml(initial)}</div>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 truncate leading-tight" title="${escAttr(r.name)}">${escHtml(r.name || '-')}</div>
            <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span class="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">${escHtml(r.studentId || '-')}</span>
              ${r.class ? `<span class="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">${escHtml(r.class)}</span>` : ''}
            </div>
          </div>
        </div>
      </td>
      <td style="font-size:12px;color:#64748b;white-space:nowrap;">
        <div class="flex items-center gap-1.5">
          <i class="far fa-clock text-slate-300 flex-shrink-0"></i>
          <span>${escHtml(r.submitTime || '-')}</span>
        </div>
      </td>
      <td style="text-align:center;">${scoreBlock}</td>
      <td style="text-align:center;">${statusBadge}</td>
      <td style="text-align:right;">${actions}</td>
    </tr>`;
}

function _rsBuildCards(items, startIdx) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  return items.map(r => {
    const cat = _rsCategory(r);
    const initial = ((r.name || '?').charAt(0) || '?').toUpperCase();
    const rid = escAttr(r.responseId);
    const rname = escAttr(r.name || '');

    const sc = parseFloat(r.score);
    const pg = parseFloat(r.passingGrade);
    let scoreCls = 'rs-score-na';
    if ((cat === 'selesai' || cat === 'timeout') && !isNaN(sc)) {
      if (pg > 0) scoreCls = sc >= pg ? 'rs-score-lulus' : (sc >= pg * 0.67 ? 'rs-score-mid' : 'rs-score-low');
      else scoreCls = sc >= 75 ? 'rs-score-lulus' : (sc >= 50 ? 'rs-score-mid' : 'rs-score-low');
    }

    let statusBadge = '';
    if (cat === 'cheat')    statusBadge = '<span class="rs-status rs-st-cheat"><span class="dot"></span>DIBLOKIR</span>';
    else if (cat === 'timeout')  statusBadge = '<span class="rs-status rs-st-timeout"><i class="fas fa-clock"></i>WAKTU HABIS</span>';
    else if (cat === 'progress') statusBadge = '<span class="rs-status rs-st-progress"><span class="dot"></span>MENGERJAKAN</span>';
    else                          statusBadge = '<span class="rs-status rs-st-selesai"><span class="dot"></span>SELESAI</span>';

    let pill = '';
    if (pg > 0 && !isNaN(sc) && (cat === 'selesai' || cat === 'timeout')) {
      pill = sc >= pg
        ? '<div class="rs-passing-pill rs-passing-yes"><i class="fas fa-check-circle"></i> LULUS</div>'
        : '<div class="rs-passing-pill rs-passing-no"><i class="fas fa-times-circle"></i> TIDAK LULUS</div>';
    }

    let footer = '';
    if (cat === 'cheat') {
      footer = `
        <div class="rs-card-foot">
          <button class="rs-action-unlock" onclick="unlockStudent('${rid}', '${rname}')" style="color:#fff;border:none;background:#3b82f6;border-radius:10px;"><i class="fas fa-lock-open mr-1"></i>Buka Akses</button>
          <button class="rs-action-reset" onclick="resetExamAttempt('${rid}', '${rname}')" style="border-color:#fed7aa;"><i class="fas fa-rotate-right mr-1"></i>Reset Ulang</button>
        </div>`;
    } else if (cat === 'progress') {
      footer = `
        <div class="rs-card-foot">
          <span style="font-size:11px;color:#94a3b8;font-style:italic;display:flex;align-items:center;gap:6px;">
            <i class="fas fa-spinner fa-spin text-amber-400"></i> Siswa sedang mengerjakan…
          </span>
        </div>`;
    } else {
      footer = `
        <div class="rs-card-foot">
          <button class="rs-action-view"  onclick="viewStudentAnswers('${rid}')"><i class="fas fa-eye mr-1"></i>Jawaban</button>
          <button class="rs-action-grade" onclick="openGradingModal('${rid}')"><i class="fas fa-pen-to-square mr-1"></i>Koreksi</button>
          <button class="rs-action-pdf"   onclick="downloadStudentPDF('${rid}', this)"><i class="fas fa-file-pdf mr-1"></i>PDF</button>
          <button class="rs-action-xls"   onclick="downloadSingleStudentAnswers('${rid}', '${rname}')"><i class="fas fa-file-excel mr-1"></i>Excel</button>
        </div>`;
    }

    return `
      <div class="rs-card">
        <div class="rs-card-head">
          <div class="rs-card-avatar">${escHtml(initial)}</div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-800 text-sm truncate">${escHtml(r.name || '-')}</div>
            <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span class="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">${escHtml(r.studentId || '-')}</span>
              ${r.class ? `<span class="text-[10px] font-bold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">${escHtml(r.class)}</span>` : ''}
              ${statusBadge}
            </div>
          </div>
        </div>
        <div class="rs-card-body">
          <div class="rs-card-row">
            <div class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Submit</div>
            <div><i class="far fa-clock text-slate-300 mr-1"></i>${escHtml(r.submitTime || '-')}</div>
          </div>
          <div class="rs-card-row">
            <div class="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Nilai</div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-2xl font-black ${scoreCls}">${cat==='progress' ? '—' : formatScore(r.score)}</span>
              ${pill}
            </div>
            ${pg > 0 ? `<div class="text-[10px] text-slate-400 mt-0.5">KKM ${pg}</div>` : ''}
          </div>
        </div>
        ${footer}
      </div>`;
  }).join('');
}

function _rsPagination(total, page, totalPages) {
  if (totalPages <= 1) {
    return `<div class="rs-pagination"><span>Menampilkan <b class="text-slate-700">${total}</b> siswa</span></div>`;
  }
  const ws = Math.max(1, page - 2);
  const we = Math.min(totalPages, page + 2);
  let nums = '';
  if (ws > 1) nums += `<button class="rs-page-btn" onclick="_rsSetPage(1)">1</button>` + (ws > 2 ? '<span class="text-slate-400">…</span>' : '');
  for (let p = ws; p <= we; p++) nums += `<button class="rs-page-btn ${p===page?'active':''}" onclick="_rsSetPage(${p})">${p}</button>`;
  if (we < totalPages) nums += (we < totalPages - 1 ? '<span class="text-slate-400">…</span>' : '') + `<button class="rs-page-btn" onclick="_rsSetPage(${totalPages})">${totalPages}</button>`;

  return `
    <div class="rs-pagination">
      <span>Halaman <b>${page}</b> / <b>${totalPages}</b> · ${total} siswa</span>
      <div class="rs-pagination-btns">
        <button class="rs-page-btn" onclick="_rsSetPage(${page-1})" ${page<=1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
        ${nums}
        <button class="rs-page-btn" onclick="_rsSetPage(${page+1})" ${page>=totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>`;
}

// FIX BUG-5: debounce timer untuk search agar tidak full-rebuild DOM setiap keystroke
var _rsSearchDebounceTimer = null;

// State setters
function _rsSetFilter(key, value) {
  const ui = window._resultsUI; if (!ui) return;

  // toggle hanya untuk status & passing; assign langsung untuk class/search
  if (key === 'status')  ui.filterStatus  = (ui.filterStatus  === value && value !== '') ? '' : (value || '');
  else if (key === 'passing') ui.filterPassing = (ui.filterPassing === value && value !== '') ? '' : (value || '');
  else if (key === 'class')   ui.filterClass   = value || '';
  else if (key === 'search')  ui.search        = value || '';
  ui.page = 1;

  if (key === 'search') {
    // FIX BUG-5: debounce 280ms — update tombol X segera, render setelah jeda
    const clrBtn = document.getElementById('rs-search-clear-btn');
    if (clrBtn) clrBtn.classList.toggle('show', !!(value && value.length > 0));
    clearTimeout(_rsSearchDebounceTimer);
    _rsSearchDebounceTimer = setTimeout(function() {
      const wasFocused = document.activeElement && document.activeElement.id === 'result-search-input';
      const caretPos   = wasFocused ? (document.activeElement.selectionStart || 0) : null;
      _refreshResultsUI();
      if (wasFocused) {
        const inp = document.getElementById('result-search-input');
        if (inp) {
          inp.focus();
          try { inp.setSelectionRange(caretPos, caretPos); } catch(e) {}
        }
      }
    }, 280);
  } else {
    _refreshResultsUI();
  }
}
function _rsResetFilters() {
  const ui = window._resultsUI; if (!ui) return;
  clearTimeout(_rsSearchDebounceTimer);
  Object.assign(ui, { filterStatus:'', filterPassing:'', filterClass:'', search:'', page:1 });
  _refreshResultsUI();
}
function _rsSetSort(key) {
  const ui = window._resultsUI; if (!ui) return;
  if (ui.sortBy === key) ui.sortDir = ui.sortDir === 'asc' ? 'desc' : 'asc';
  else { ui.sortBy = key; ui.sortDir = 'asc'; }
  _refreshResultsUI();
}
function _rsSetPage(p) {
  const ui = window._resultsUI; if (!ui) return;
  ui.page = Math.max(1, parseInt(p) || 1);
  _refreshResultsUI();
  const c = document.getElementById('admin-content');
  if (c) c.scrollTo({ top:0, behavior:'smooth' });
}
function _rsSetPageSize(val) {
  const ui = window._resultsUI; if (!ui) return;
  ui.pageSize = parseInt(val) || 25;
  ui.page = 1;
  _refreshResultsUI();
}

// Backwards-compat shims for legacy callers
function renderInternalTable() { _refreshResultsUI(); }
function handleResultSearch(keyword) { _rsSetFilter('search', keyword); }
function changeRowsPerPage(val) { _rsSetPageSize(val === 'all' ? 1000 : val); }
function changePage(direction) {
  const ui = window._resultsUI; if (!ui) return;
  if (direction === 'prev') _rsSetPage(ui.page - 1);
  else _rsSetPage(ui.page + 1);
}

function unlockStudent(responseId, studentName) {
    Swal.fire({
        title: 'Buka Akses Siswa?',
        html: `<p style="font-size:13px;color:#475569;">Izinkan <b>${(studentName||'siswa').replace(/</g,'&lt;')}</b> melanjutkan ujian?</p>
               <p style="font-size:12px;color:#1d4ed8;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;margin-top:8px;">
                 <i class="fas fa-circle-info"></i> Jawaban yang sudah diisi <b>tidak akan hilang</b>.
               </p>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-lock-open mr-1"></i> Ya, Buka Akses',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: { popup: 'lp-swal' }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Memproses...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); },
                customClass: { popup: 'lp-swal' }
            });

            google.script.run
                .withSuccessHandler((res) => {
                    if (res.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Akses Dibuka',
                            html: '<p style="font-size:13px;color:#475569;">Silakan minta siswa <b>login kembali</b> sekarang.</p>',
                            timer: 2200,
                            showConfirmButton: false,
                            customClass: { popup: 'lp-swal' }
                        });
                        const examId = (window._resultsUI && window._resultsUI.examId) ||
                                       (document.getElementById('select-result-exam') && document.getElementById('select-result-exam').value);
                        if (examId) loadResultsTable(examId);
                    } else {
                        Swal.fire({
                            title:'Gagal', html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
                            icon:'error', confirmButtonColor:'#dc2626',
                            customClass:{ popup:'lp-swal' }
                        });
                    }
                })
                .withFailureHandler((err) => {
                    Swal.fire({
                        title:'Error Server',
                        html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
                        icon:'error', confirmButtonColor:'#dc2626',
                        customClass:{ popup:'lp-swal' }
                    });
                })
                .unlockStudentExam(responseId, currentUser.userID, currentUser.token);
        }
    });
}

function downloadResultPDF() {
  const examId = (window._resultsUI && window._resultsUI.examId) ||
                 (document.getElementById('select-result-exam') && document.getElementById('select-result-exam').value);

  if (!examId) {
    Swal.fire({
      title:'Pilih Ujian', html:'<p style="font-size:13px;color:#475569;">Silakan pilih Mata Pelajaran terlebih dahulu.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }

  // Tampilkan modal konfirmasi urutan sebelum proses PDF
  Swal.fire({
    title: '<i class="fas fa-sort-amount-down" style="color:#9333ea;margin-right:8px;"></i>Urutan Nama Siswa',
    html: `
      <style>
        .pdf-sort-lbl {
          display:flex; align-items:center; gap:10px;
          padding:10px 14px; border:2px solid #e2e8f0; border-radius:10px;
          cursor:pointer; transition:border-color .15s, background .15s;
        }
        .pdf-sort-lbl:hover { border-color:#c084fc; background:#fdf4ff; }
        .pdf-sort-lbl.selected { border-color:#9333ea; background:#faf5ff; }
      </style>
      <p style="font-size:13px;color:#475569;margin-bottom:16px;">Pilih urutan tampilan nama siswa pada Rekap PDF:</p>
      <div id="pdf-sort-options" style="display:flex;flex-direction:column;gap:8px;text-align:left;">
        <label class="pdf-sort-lbl selected">
          <input type="radio" name="pdf-sort" value="default" checked style="accent-color:#9333ea;width:16px;height:16px;">
          <span style="font-size:13px;color:#334155;"><i class="fas fa-list" style="color:#94a3b8;margin-right:6px;"></i>Default <span style="font-size:11px;color:#94a3b8;">(urutan masuk data)</span></span>
        </label>
        <label class="pdf-sort-lbl">
          <input type="radio" name="pdf-sort" value="score_asc" style="accent-color:#9333ea;width:16px;height:16px;">
          <span style="font-size:13px;color:#334155;"><i class="fas fa-arrow-up" style="color:#0891b2;margin-right:6px;"></i>Nilai Terendah → Tertinggi</span>
        </label>
        <label class="pdf-sort-lbl">
          <input type="radio" name="pdf-sort" value="score_desc" style="accent-color:#9333ea;width:16px;height:16px;">
          <span style="font-size:13px;color:#334155;"><i class="fas fa-arrow-down" style="color:#dc2626;margin-right:6px;"></i>Nilai Tertinggi → Terendah</span>
        </label>
        <label class="pdf-sort-lbl">
          <input type="radio" name="pdf-sort" value="name_asc" style="accent-color:#9333ea;width:16px;height:16px;">
          <span style="font-size:13px;color:#334155;"><i class="fas fa-sort-alpha-down" style="color:#059669;margin-right:6px;"></i>Nama A → Z</span>
        </label>
        <label class="pdf-sort-lbl">
          <input type="radio" name="pdf-sort" value="name_desc" style="accent-color:#9333ea;width:16px;height:16px;">
          <span style="font-size:13px;color:#334155;"><i class="fas fa-sort-alpha-up-alt" style="color:#d97706;margin-right:6px;"></i>Nama Z → A</span>
        </label>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-file-pdf"></i>&nbsp; Buat PDF',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#9333ea',
    cancelButtonColor: '#94a3b8',
    customClass: { popup: 'lp-swal' },
    width: '420px',
    didOpen: () => {
      // BUG FIX 6: Hapus onmouseover/onmouseout inline yang konflik dengan state
      // "selected". Gunakan class CSS untuk hover, dan event 'change' hanya
      // mengatur class 'selected' — keduanya tidak saling menimpa.
      document.querySelectorAll('#pdf-sort-options input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
          document.querySelectorAll('#pdf-sort-options .pdf-sort-lbl').forEach(lbl => {
            lbl.classList.remove('selected');
          });
          radio.closest('.pdf-sort-lbl').classList.add('selected');
        });
      });
    },
    preConfirm: () => {
      const selected = document.querySelector('#pdf-sort-options input[type="radio"]:checked');
      return selected ? selected.value : 'default';
    }
  }).then(result => {
    if (!result.isConfirmed) return;
    _doGenerateRecapPDF(examId, result.value);
  });
}

function _doGenerateRecapPDF(examId, sortOrder) {
  // BUG FIX 5: Simpan referensi btn di closure saat fungsi dipanggil.
  // Saat callback tiba, btn bisa sudah null (user pindah tab & DOM di-re-render),
  // sehingga akses .disabled / .innerHTML harus diulang lewat getElementById
  // dan selalu di-null-check agar tidak throw TypeError.
  const originalText = (document.getElementById('btn-pdf-recap') || {}).innerHTML || '';

  const _setBtnLoading = () => {
    const b = document.getElementById('btn-pdf-recap');
    if (b) { b.disabled = true; b.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="hidden sm:inline">Memproses...</span>'; }
  };
  const _restoreBtn = () => {
    const b = document.getElementById('btn-pdf-recap');
    if (b) { b.disabled = false; b.innerHTML = originalText; }
  };

  _setBtnLoading();

  google.script.run
    .withSuccessHandler(res => {
      _restoreBtn();
      if (res && res.success) {
        _triggerDirectDownload(res.url);
        const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
        Toast.fire({ icon:'success', title:'Rekap PDF siap diunduh' });
      } else {
        Swal.fire({
          title:'Gagal', html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
          icon:'error', confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        });
      }
    })
    .withFailureHandler(err => {
      _restoreBtn();
      Swal.fire({
        title:'Error Server', html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
        icon:'error', confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      });
    })
    .generateExamRecapPDF(examId, currentUser.userID, currentUser.token, sortOrder);
}

function viewStudentAnswers(responseId) {

  if (!document.getElementById('modal-view-answers')) {
    if (typeof createViewAnswersModal === 'function') {
      createViewAnswersModal();
    } else {
      console.error("Fungsi createViewAnswersModal tidak ditemukan");
      alert("Terjadi kesalahan: Modal template belum dimuat.");
      return;
    }
  }

  const modal = document.getElementById('modal-view-answers');
  const content = document.getElementById('view-answers-content');
  const title = document.getElementById('view-answers-title');

  modal.classList.remove('hidden');
  title.innerText = "Memuat Data...";
  content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 text-slate-400">
           <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-teal-500"></i>
           <p>Mengambil data jawaban...</p>
        </div>`;

  const toPlainText = (html) => {
    try {
      const d = document.createElement('div');
      d.innerHTML = html || '';
      return (d.textContent || d.innerText || '').trim();
    } catch(e) { return String(html || ''); }
  };
  const formatJodohForDisplay = (pairs, studentAnswer, isKey) => {
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return '<i class="text-slate-400">Data kunci tidak valid.</i>';
    }
    let html = '<ul class="text-sm space-y-2">';
    pairs.forEach(pair => {
      const left        = pair.q;
      const correctRight = pair.a;
      const leftHtml         = prepContent(left)   || left   || '';
      const correctRightHtml = prepContent(correctRight) || correctRight || '';

      if (isKey) {
        html += `<li class="flex items-center">
          <b class="w-2/5 truncate" title="${toPlainText(left)}">${leftHtml}</b>
          <i class="fas fa-long-arrow-alt-right mx-2 text-slate-300"></i>
          <span class="truncate" title="${toPlainText(correctRight)}">${correctRightHtml}</span>
        </li>`;
      } else {
        const studentChoice = studentAnswer ? studentAnswer[left] : undefined;
        const isMatch = String(studentChoice).trim().toLowerCase() === String(correctRight).trim().toLowerCase();
        const icon = isMatch ? '<i class="fas fa-check-circle text-emerald-500 ml-2"></i>' : '<i class="fas fa-times-circle text-red-500 ml-2"></i>';
        const displayChoiceHtml = studentChoice
          ? (prepContent(studentChoice) || studentChoice)
          : '<i class="text-slate-400">(Kosong)</i>';

        html += `<li class="flex items-center ${isMatch ? '' : 'text-red-600 font-semibold'}">
          <b class="w-2/5 font-medium text-slate-800 truncate" title="${toPlainText(left)}">${leftHtml}</b>
          <i class="fas fa-long-arrow-alt-right mx-2 text-slate-300"></i>
          <span>${displayChoiceHtml}</span> ${icon}
        </li>`;
      }
    });
    html += '</ul>';
    return html;
  };

  google.script.run
    .withSuccessHandler(res => {
      if (!res || !res.success) {
        content.innerHTML = `
                    <div class="flex flex-col items-center justify-center h-64 text-red-500">
                        <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                        <p class="font-bold">Gagal memuat data.</p>
                        <p class="text-sm text-slate-500">${res ? res.message : 'Respon server kosong.'}</p>
                    </div>`;
        title.innerText = "Error";
        return;
      }

      title.innerHTML = `
                <div class="flex justify-between items-center w-full">
                    <span class="truncate max-w-[60%]">Jawab: ${res.name}</span>
                    <span class="bg-blue-600 text-white px-3 py-1 rounded text-sm shadow whitespace-nowrap">Nilai Akhir: ${formatScore(res.finalScore)}</span>
                </div>`;

      let html = '<div class="space-y-4">';

      if (!res.data || res.data.length === 0) {
        html += '<div class="text-center text-slate-400 py-10">Tidak ada data soal yang ditemukan.</div>';
      } else {
        res.data.forEach((item, idx) => {
          let statusIcon = '';
          let borderClass = 'border-slate-200';
          let bgClass = 'bg-white';
          let studentAnswerHTML = '';
          let keyAnswerHTML = '';

          let pointClean = Number.isInteger(item.point) ? item.point : parseFloat(item.point).toFixed(2);
          
          // BUG FIX RS-5: isEssayPending harus berdasarkan status dari backend (item.status
          // atau keberadaan skor yang tersimpan), bukan hanya item.point === 0.
          // Guru bisa saja sengaja memberi nilai 0 — itu bukan "menunggu koreksi".
          // Backend getStudentAnswerDetail mengembalikan statusText "MENUNGGU KOREKSI"
          // vs "DINILAI (x)" — gunakan itu sebagai sumber kebenaran.
          const essayStatusUpper = item.type === 'Esai' ? String(item.status || '').toUpperCase() : '';
          const isEssayGraded  = item.type === 'Esai' && !essayStatusUpper.includes('MENUNGGU');
          const isEssayPending = item.type === 'Esai' && essayStatusUpper.includes('MENUNGGU');
          let scoreBadge = '';
          if (isEssayPending) {
            scoreBadge = `<div class="ml-2 px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-300 text-[10px] font-bold whitespace-nowrap">Menunggu Koreksi</div>`;
          } else {
            scoreBadge = `<div class="ml-2 px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold whitespace-nowrap">Poin: ${pointClean} / ${item.maxPoint}</div>`;
          }

          if (item.type === 'Esai') {
            statusIcon = '<span class="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-bold">ESAI</span>';
            borderClass = isEssayGraded ? 'border-emerald-200' : 'border-purple-200';
            bgClass     = isEssayGraded ? 'bg-emerald-50/20'  : 'bg-white';
            studentAnswerHTML = item.studentAns || '<i class="text-slate-400">(Tidak Dijawab)</i>';
            if (isEssayGraded) {
              keyAnswerHTML = `<span class="text-emerald-600 font-bold"><i class="fas fa-check-circle mr-1"></i>Sudah Dinilai: ${pointClean} / ${item.maxPoint} Poin</span>`;
            } else {
              keyAnswerHTML = '<span class="text-amber-500 font-bold"><i class="fas fa-clock mr-1"></i>Menunggu Koreksi Guru</span>';
            }

          } else if (item.type === 'JODOH') {
            let pairs = Array.isArray(item.pairs) ? item.pairs : [];
            if (pairs.length === 0) {
              try {
                const p = JSON.parse(item.key);
                if (Array.isArray(p)) pairs = p;
              } catch(e) {}
            }

            let studentAnsObj = item.rawStudentAns || {};
            if (!studentAnsObj || typeof studentAnsObj !== 'object' || Array.isArray(studentAnsObj)) {
              studentAnsObj = {};
            }

            const realPairsDisplay = pairs.filter(p => p.q && String(p.q).trim() !== '');

            let matchedCount = 0;
            const totalPairs = realPairsDisplay.length;
            if (totalPairs > 0) {
              realPairsDisplay.forEach(pair => {
                const stuVal = String(studentAnsObj[pair.q] || '').trim().toLowerCase();
                if (stuVal && stuVal === String(pair.a || '').trim().toLowerCase()) matchedCount++;
              });
            }

            if (totalPairs === 0) {
              statusIcon = '<span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border font-bold">MENJODOHKAN</span>';
            } else if (matchedCount === totalPairs) {
              statusIcon = `<span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold"><i class="fas fa-check mr-1"></i>BENAR (${matchedCount}/${totalPairs})</span>`;
              borderClass = 'border-emerald-200'; bgClass = 'bg-emerald-50/20';
            } else if (matchedCount > 0) {
              statusIcon = `<span class="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-bold">SEBAGIAN (${matchedCount}/${totalPairs})</span>`;
              borderClass = 'border-amber-200'; bgClass = 'bg-amber-50/20';
            } else {
              statusIcon = `<span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold"><i class="fas fa-times mr-1"></i>SALAH (${matchedCount}/${totalPairs})</span>`;
              borderClass = 'border-red-200'; bgClass = 'bg-red-50/20';
            }

            studentAnswerHTML = formatJodohForDisplay(pairs, studentAnsObj, false);
            keyAnswerHTML     = formatJodohForDisplay(pairs, null, true);

          } else {
            if (item.isCorrect) {
              statusIcon = '<span class="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold"><i class="fas fa-check mr-1"></i>BENAR</span>';
              borderClass = 'border-emerald-200';
              bgClass = 'bg-emerald-50/30';
            } else {
              statusIcon = '<span class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold"><i class="fas fa-times mr-1"></i>SALAH</span>';
              borderClass = 'border-red-200';
              bgClass = 'bg-red-50/30';
            }
            studentAnswerHTML = item.studentAns
              ? (prepContent(item.studentAns) || item.studentAns)
              : '<i class="text-slate-400">(Tidak Dijawab)</i>';
            keyAnswerHTML = prepContent(item.key) || item.key;
          }

          let imgHtml = item.image ? `<div class="mb-3"><img src="${item.image}" referrerpolicy="no-referrer" class="max-h-40 rounded border border-slate-200 shadow-sm"></div>` : '';

          html += `
                    <div class="p-4 rounded-xl border ${borderClass} ${bgClass} transition hover:shadow-md">
                        <div class="flex justify-between items-start mb-2">
                            <div class="flex items-center">
                                <span class="text-xs font-bold text-slate-400 uppercase mr-2">No. ${idx + 1}</span>
                                ${scoreBadge}
                            </div>
                            ${statusIcon}
                        </div>
                        
                        <div class="mb-3 text-slate-800 font-medium text-sm leading-relaxed math-content">${prepContent(item.q)}</div>
                        ${imgHtml}

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-slate-100">
                            <div class="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Jawaban Siswa</p>
                                <div class="font-bold break-words ${item.isCorrect ? 'text-emerald-600' : 'text-red-600'}">
                                    ${studentAnswerHTML}
                                </div>
                            </div>
                            <div class="bg-slate-50 p-3 rounded border border-slate-200 shadow-inner">
                                <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Kunci Jawaban</p>
                                <div class="font-mono text-slate-600 font-medium break-words text-xs">
                                    ${keyAnswerHTML}
                                </div>
                            </div>
                        </div>
                    </div>`;
        });
      }

      if (res.data && res.data.length > 0) {
        const totalPerolehan  = res.data.reduce((s, i) => s + (Number(i.point)    || 0), 0);
        const totalBobot      = res.data.reduce((s, i) => s + (Number(i.maxPoint) || 0), 0);
        const totalObjektif   = res.data.filter(i => i.type !== 'Esai').reduce((s, i) => s + (Number(i.point) || 0), 0);
        const totalEsai       = res.data.filter(i => i.type === 'Esai').reduce((s, i) => s + (Number(i.point) || 0), 0);
        // BUG FIX RS-6: gunakan status dari backend bukan point===0 untuk deteksi esai pending
        const adaEsaiBelumDinilai = res.data.some(i => i.type === 'Esai' && String(i.status || '').toUpperCase().includes('MENUNGGU'));

        html += `
          <div class="mt-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <p class="text-xs font-bold text-slate-400 uppercase mb-3">Ringkasan Poin</p>
            <div class="grid grid-cols-2 gap-2 text-sm mb-3">
              <div class="flex justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <span class="text-slate-500">Poin Objektif (PG/BS/JODOH)</span>
                <span class="font-bold text-slate-700">${Number(totalObjektif.toFixed(2))}</span>
              </div>
              <div class="flex justify-between px-3 py-2 rounded-lg ${adaEsaiBelumDinilai ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}">
                <span class="${adaEsaiBelumDinilai ? 'text-amber-600' : 'text-emerald-600'}">Poin Esai (Koreksi Guru)</span>
                <span class="font-bold ${adaEsaiBelumDinilai ? 'text-amber-600' : 'text-emerald-700'}">${adaEsaiBelumDinilai ? '(Belum)' : Number(totalEsai.toFixed(2))}</span>
              </div>
            </div>
            <div class="flex justify-between items-center px-4 py-3 rounded-xl bg-blue-600 text-white font-bold">
              <span>Total Poin: ${Number(totalPerolehan.toFixed(2))} / ${totalBobot}</span>
              <span class="text-xl">${formatScore(res.finalScore)}</span>
            </div>
          </div>`;
      }

      html += '</div>';
      content.innerHTML = html;
      renderMath(content);

    })
    .withFailureHandler(error => {
      console.error(error);
      title.innerText = "Error Sistem";
      content.innerHTML = `
                <div class="flex flex-col items-center justify-center h-64 text-red-500">
                   <i class="fas fa-wifi text-4xl mb-3"></i>
                   <p class="font-bold">Gagal menghubungi server.</p>
                   <p class="text-sm text-center px-4">Pastikan internet lancar atau refresh halaman.<br><span class="text-xs text-slate-400">${error.message}</span></p>
                </div>`;
    })
    .getStudentAnswerDetail(responseId);
}


function closeViewAnswersModal() {
  document.getElementById('modal-view-answers').classList.add('hidden');
}

function createViewAnswersModal() {
  const modalHtml = `
    <div id="modal-view-answers" class="fixed inset-0 z-[100] hidden flex items-center justify-center p-2 sm:p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="closeViewAnswersModal()"></div>

        <div class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-[fadeIn_0.3s_ease-out] z-[101]">
            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center bg-teal-50 rounded-t-2xl shrink-0">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0"><i class="fas fa-list-check"></i></div>
                    <h3 class="font-bold text-base sm:text-lg text-teal-900 truncate" id="view-answers-title">Detail Jawaban</h3>
                </div>
                <button onclick="closeViewAnswersModal()" class="text-slate-400 hover:text-red-500 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 flex-shrink-0" aria-label="Tutup">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50" id="view-answers-content">
            </div>

            <div class="p-3 sm:p-4 border-t bg-white rounded-b-2xl flex justify-end shrink-0">
                <button onclick="closeViewAnswersModal()" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition">
                    Tutup
                </button>
            </div>
        </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // FIX BUG-4: gunakan flag agar ESC listener hanya terdaftar SEKALI.
  // Sebelumnya dipanggil ulang setiap viewStudentAnswers → listener menumpuk.
  if (!window._viewAnswersEscBound) {
    window._viewAnswersEscBound = true;
    document.addEventListener('keydown', function _vaEscHandler(e) {
      if (e.key !== 'Escape') return;
      const m = document.getElementById('modal-view-answers');
      if (m && !m.classList.contains('hidden')) {
        e.stopPropagation();
        closeViewAnswersModal();
      }
    });
  }
}

function downloadStudentPDF(responseId, btnElement) {
  const originalHtml = btnElement ? btnElement.innerHTML : '';
  if (btnElement) {
    btnElement.disabled = true;
    btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  }

  google.script.run.withSuccessHandler(res => {
    if (btnElement) { btnElement.disabled = false; btnElement.innerHTML = originalHtml; }

    if (res && res.success) {
      _triggerDirectDownload(res.url);
      const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1600, timerProgressBar:true });
      Toast.fire({ icon:'success', title:'PDF jawaban siap diunduh' });
    } else {
      Swal.fire({
        title:'Gagal', html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
        icon:'error', confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      });
    }
  }).withFailureHandler(err => {
    if (btnElement) { btnElement.disabled = false; btnElement.innerHTML = originalHtml; }
    Swal.fire({
      title:'Error Server', html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
      icon:'error', confirmButtonColor:'#dc2626',
      customClass:{ popup:'lp-swal' }
    });
  }).generateStudentDetailPDF(responseId);
}

function getStudentHeaderColor(userID) {
  const palette = [
    { bg: '#1e40af', shadow: 'rgba(30,64,175,0.4)'  }, 
    { bg: '#7c3aed', shadow: 'rgba(124,58,237,0.4)' }, 
    { bg: '#059669', shadow: 'rgba(5,150,105,0.4)'  }, 
    { bg: '#dc2626', shadow: 'rgba(220,38,38,0.4)'  }, 
    { bg: '#d97706', shadow: 'rgba(217,119,6,0.4)'  }, 
    { bg: '#0891b2', shadow: 'rgba(8,145,178,0.4)'  }, 
    { bg: '#be185d', shadow: 'rgba(190,24,93,0.4)'  }, 
    { bg: '#4338ca', shadow: 'rgba(67,56,202,0.4)'  }, 
    { bg: '#0f766e', shadow: 'rgba(15,118,110,0.4)' }, 
    { bg: '#c2410c', shadow: 'rgba(194,65,12,0.4)'  }, 
    { bg: '#5b21b6', shadow: 'rgba(91,33,182,0.4)'  }, 
    { bg: '#065f46', shadow: 'rgba(6,95,70,0.4)'    }, 
    { bg: '#92400e', shadow: 'rgba(146,64,14,0.4)'  }, 
    { bg: '#831843', shadow: 'rgba(131,24,67,0.4)'  }, 
    { bg: '#1e3a5f', shadow: 'rgba(30,58,95,0.4)'   }, 
    { bg: '#6b21a8', shadow: 'rgba(107,33,168,0.4)' }, 
    { bg: '#0369a1', shadow: 'rgba(3,105,161,0.4)'  }, 
    { bg: '#166534', shadow: 'rgba(22,101,52,0.4)'  }, 
    { bg: '#7f1d1d', shadow: 'rgba(127,29,29,0.4)'  }, 
    { bg: '#4a044e', shadow: 'rgba(74,4,78,0.4)'    }, 
  ];

  let hash = 5381;
  for (let i = 0; i < userID.length; i++) {
    hash = ((hash << 5) + hash) + userID.charCodeAt(i);
    hash |= 0; 
  }

  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

function applyStudentHeaderColor(userID) {
  const colorObj = getStudentHeaderColor(userID);
  const header = document.querySelector('#page-exam .exam-header');

  document.documentElement.style.setProperty('--exam-bg', colorObj.bg);

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  };
  const rgb = hexToRgb(colorObj.bg);
  document.documentElement.style.setProperty('--exam-btn-bg',    `rgba(255,255,255,0.15)`);
  document.documentElement.style.setProperty('--exam-btn-hover', `rgba(255,255,255,0.25)`);
  document.documentElement.style.setProperty('--exam-btn-border',`rgba(255,255,255,0.25)`);

  const fab = document.getElementById('btn-nav-fab');
  if (fab) fab.style.backgroundColor = colorObj.bg;

  if (!header) return;
  header.style.background = colorObj.bg;
  header.style.backgroundColor = colorObj.bg;
  header.style.boxShadow = `0 4px 15px ${colorObj.shadow}`;
  header.style.transition = 'background 0.5s ease, box-shadow 0.5s ease';

  console.log(`[CBT] Header warna untuk ${userID}: ${colorObj.bg}`);
}


// Orientation gate helpers (_isMobileDevice, _isPortrait, _requestLandscapeBeforeLogin)
// ada di exam.js — tidak perlu didefinisikan ulang di sini.
