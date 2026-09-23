/**
 * progress-soal.js — Progress Pembuatan Soal
 * renderQuestionProgress() + _prog* helpers
 * Sumber: index.html L17440-18206
 */

function renderQuestionProgress(container) {
  // Initialize UI state
  if (!window._progressUI) {
    window._progressUI = {
      filterStatus: '',
      filterWork:   '',
      filterSubj:   '',
      search:       '',
      sortBy:       'subject',  // subject | total | work
      sortDir:      'asc',
      page:         1,
      pageSize:     12
    };
  }

  // First-time skeleton
  container.innerHTML = `
    <div class="pr-page fade-in">
      <div class="pr-hero">
        <div>
          <h2><i class="fas fa-chart-pie mr-2"></i>Progress Pembuatan Soal</h2>
          <p>Memantau kelengkapan soal per mata pelajaran dan tipe.</p>
        </div>
        <div class="pr-hero-actions">
          <button class="pr-hero-btn" onclick="loadProgressData()" title="Muat ulang data">
            <i class="fas fa-rotate"></i> <span class="hidden sm:inline">Refresh</span>
          </button>
          <button class="pr-hero-btn solid" id="btn-progress-excel" onclick="downloadProgressExcel()" style="display:none;">
            <i class="fas fa-file-excel"></i> <span class="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      <div id="prog-stats-mount" class="pr-stat-grid">
        ${Array(8).fill(0).map(() => `<div class="pr-skel-row" style="height:70px;border-radius:12px;"></div>`).join('')}
      </div>

      <div id="prog-filter-mount"></div>

      <div id="progress-table-wrapper">
        <div class="pr-table-wrap"><div class="p-6">
          ${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}
        </div></div>
      </div>
    </div>`;

  window._progressRawData  = [];
  window._progressFiltered = [];

  loadProgressData();
}

function loadProgressData() {
  const tableWrapper = document.getElementById('progress-table-wrapper');
  if (!tableWrapper) return;

  // Show skeleton in table area
  tableWrapper.innerHTML = `
    <div class="pr-table-wrap"><div class="p-6">
      ${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}
    </div></div>`;

  google.script.run
    .withSuccessHandler(res => {
      if (!res || !res.success) {
        _renderProgressError(res ? res.message : 'Gagal memuat data');
        return;
      }
      const data = Array.isArray(res.data) ? res.data : [];
      window._progressRawData  = data;

      _refreshProgressUI();

      const btnExcel = document.getElementById('btn-progress-excel');
      if (btnExcel) btnExcel.style.display = data.length > 0 ? 'inline-flex' : 'none';
    })
    .withFailureHandler(err => {
      _renderProgressError((err && err.message) ? err.message : String(err || 'Gagal terhubung ke server'));
    })
    .getQuestionProgressData(currentUser.userID, currentUser.token);
}

function _renderProgressError(msg) {
  const tableWrapper = document.getElementById('progress-table-wrapper');
  if (!tableWrapper) return;
  tableWrapper.innerHTML = `
    <div class="dash-error-state max-w-md mx-auto">
      <div class="ico"><i class="fas fa-triangle-exclamation"></i></div>
      <h3 class="font-bold text-base text-red-700 mb-1">Gagal Memuat Progress</h3>
      <p class="text-xs text-red-600 mb-4">${String(msg || '').replace(/</g,'&lt;')}</p>
      <button onclick="loadProgressData()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
        <i class="fas fa-rotate-right"></i> Coba Lagi
      </button>
    </div>`;
}

// Refresh entire progress UI from current state + data
function _refreshProgressUI() {
  const ui = window._progressUI;
  const raw = Array.isArray(window._progressRawData) ? window._progressRawData : [];

  // Apply filters
  const search = (ui.search || '').toLowerCase().trim();
  const filtered = raw.filter(d => {
    const subject = String(d.subject || '');
    const kelas   = String(d.kelas || '');
    const status  = String(d.status || '');
    const work    = computeWorkStatus(d);
    if (ui.filterStatus && status !== ui.filterStatus) return false;
    if (ui.filterWork   && work   !== ui.filterWork)   return false;
    if (ui.filterSubj   && subject !== ui.filterSubj)  return false;
    if (search) {
      const hay = (subject + ' ' + kelas).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  // Apply sort
  const dir = ui.sortDir === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    let va, vb;
    switch (ui.sortBy) {
      case 'total':
        va = (a.counts && a.counts.total) || 0;
        vb = (b.counts && b.counts.total) || 0;
        break;
      case 'work':
        va = computeWorkStatus(a) === 'Selesai' ? 1 : (computeWorkStatus(a) === 'NA' ? 2 : 0);
        vb = computeWorkStatus(b) === 'Selesai' ? 1 : (computeWorkStatus(b) === 'NA' ? 2 : 0);
        break;
      case 'subject':
      default:
        va = String(a.subject || '').toLowerCase();
        vb = String(b.subject || '').toLowerCase();
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return  1 * dir;
    return 0;
  });

  window._progressFiltered = filtered;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
  if (ui.page > totalPages) ui.page = totalPages;
  const startIdx = (ui.page - 1) * ui.pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + ui.pageSize);

  // Update parts
  _renderProgressStats(raw, filtered);
  _renderProgressFilter(raw, ui);
  _renderProgressContent(pageItems, filtered.length, ui.page, totalPages, startIdx);
}

function _renderProgressStats(raw, filtered) {
  const statsRoot = document.getElementById('prog-stats-mount');
  if (!statsRoot) return;
  // Use ALL data (raw) for global stats, but show filtered totals where relevant.
  const sumOf = (arr, key) => arr.reduce((s, d) => s + ((d.counts && d.counts[key]) || 0), 0);
  const totalExams   = raw.length;
  const totalSoal    = sumOf(raw, 'total');
  const totPG        = sumOf(raw, 'PG');
  const totPGK       = sumOf(raw, 'PG_KOMPLEKS');
  const totBS        = sumOf(raw, 'BS');
  const totJodoh     = sumOf(raw, 'JODOH');
  const totEsai      = sumOf(raw, 'Esai');
  const selesai      = raw.filter(d => computeWorkStatus(d) === 'Selesai').length;
  const proses       = raw.filter(d => computeWorkStatus(d) === 'Proses').length;
  const naCount      = raw.filter(d => computeWorkStatus(d) === 'NA').length;
  const selesaiPct   = totalExams > 0 ? Math.round((selesai / totalExams) * 100) : 0;

  statsRoot.innerHTML = `
    <div class="pr-stat" title="Jumlah jadwal/mapel"><span class="pr-stat-lbl">Total Ujian</span><span class="pr-stat-val text-indigo-600">${totalExams}</span></div>
    <div class="pr-stat" title="Total semua soal yang sudah dibuat"><span class="pr-stat-lbl">Total Soal</span><span class="pr-stat-val text-slate-700">${totalSoal}</span></div>
    <div class="pr-stat"><span class="pr-stat-lbl">PG</span><span class="pr-stat-val text-blue-600">${totPG}</span></div>
    <div class="pr-stat"><span class="pr-stat-lbl">PG Kompleks</span><span class="pr-stat-val text-indigo-600">${totPGK}</span></div>
    <div class="pr-stat"><span class="pr-stat-lbl">Benar/Salah</span><span class="pr-stat-val text-orange-600">${totBS}</span></div>
    <div class="pr-stat"><span class="pr-stat-lbl">Jodoh</span><span class="pr-stat-val text-teal-600">${totJodoh}</span></div>
    <div class="pr-stat"><span class="pr-stat-lbl">Esai</span><span class="pr-stat-val text-purple-600">${totEsai}</span></div>
    <div class="pr-stat" title="Mapel dengan target tipe soal terpenuhi">
      <span class="pr-stat-lbl">Selesai</span>
      <div class="flex items-baseline gap-1">
        <span class="pr-stat-val text-emerald-600">${selesai}</span>
        <span class="text-[10px] text-slate-400 font-bold">/ ${totalExams}</span>
      </div>
      <span class="pr-stat-sub">${selesaiPct}% mapel · ${proses} proses · ${naCount} no-target</span>
    </div>
  `;

  // Update hero progress
  // Add a hero-progress block dynamically into the hero card if not yet present
  const hero = document.querySelector('.pr-hero');
  if (hero) {
    let heroProg = hero.querySelector('.pr-hero-progress');
    if (!heroProg) {
      heroProg = document.createElement('div');
      heroProg.className = 'pr-hero-progress';
      hero.appendChild(heroProg);
    }
    heroProg.innerHTML = `
      <div class="pr-hero-progress-row">
        <span><i class="fas fa-bullseye mr-1"></i>Kelengkapan Mapel</span>
        <span><b>${selesai}</b> / ${totalExams} (${selesaiPct}%)</span>
      </div>
      <div class="pr-hero-bar"><div style="width:${selesaiPct}%;"></div></div>
      <div class="pr-hero-progress-row" style="margin-top:6px;">
        <span><i class="fas fa-pen-nib mr-1"></i>Total Soal</span>
        <span><b>${totalSoal}</b> soal di seluruh sistem</span>
      </div>
    `;
  }
}

function _renderProgressFilter(raw, ui) {
  const root = document.getElementById('prog-filter-mount');
  if (!root) return;
  const subjects = [...new Set(raw.map(d => String(d.subject || '').trim()).filter(Boolean))].sort();
  const escAttr = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  const hasFilters = !!(ui.filterStatus || ui.filterWork || ui.filterSubj || ui.search);

  root.innerHTML = `
    <div class="pr-filter">
      <div class="pr-filter-group" style="flex:1;">
        <div class="ex-search" style="flex:1; min-width:160px;">
          <i class="fas fa-search"></i>
          <input id="prog-search" type="text" placeholder="Cari mapel atau kelas..."
            value="${escAttr(ui.search)}"
            oninput="_progSetFilter('search', this.value)"
            autocomplete="off">
          <button class="ex-search-clear ${ui.search ? 'show' : ''}" onclick="_progSetFilter('search','')" title="Bersihkan">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      <div class="pr-filter-group">
        <select class="ex-select" onchange="_progSetFilter('subject', this.value)">
          <option value="">Semua Mapel</option>
          ${subjects.map(s => `<option value="${escAttr(s)}" ${ui.filterSubj===s?'selected':''}>${escAttr(s)}</option>`).join('')}
        </select>
        <select class="ex-select" onchange="_progSetFilter('status', this.value)">
          <option value="">Semua Status</option>
          <option value="Aktif"     ${ui.filterStatus==='Aktif'?'selected':''}>Aktif</option>
          <option value="Non-Aktif" ${ui.filterStatus==='Non-Aktif'?'selected':''}>Non-Aktif</option>
        </select>
        <select class="ex-select" onchange="_progSetFilter('work', this.value)">
          <option value="">Semua Pengerjaan</option>
          <option value="Selesai" ${ui.filterWork==='Selesai'?'selected':''}>✅ Selesai</option>
          <option value="Proses"  ${ui.filterWork==='Proses'?'selected':''}>🔄 Proses</option>
          <option value="NA"      ${ui.filterWork==='NA'?'selected':''}>📋 No-target</option>
        </select>
        ${hasFilters ? `
          <button onclick="_progResetFilters()" class="ex-select" style="background:#fef2f2;border-color:#fecaca;color:#dc2626;">
            <i class="fas fa-times-circle mr-1"></i> Reset
          </button>` : ''}
      </div>
    </div>
  `;
}

function _renderProgressContent(items, totalFiltered, page, totalPages, startIdx) {
  const wrapper = document.getElementById('progress-table-wrapper');
  if (!wrapper) return;
  const raw = Array.isArray(window._progressRawData) ? window._progressRawData : [];
  const ui  = window._progressUI;

  // No data at all
  if (raw.length === 0) {
    wrapper.innerHTML = `
      <div class="dash-empty bg-white border border-slate-200 rounded-2xl">
        <div class="dash-empty-icon"><i class="fas fa-clipboard-list"></i></div>
        <p class="font-bold text-slate-700">Belum ada jadwal ujian.</p>
        <p class="text-xs text-slate-400 mt-1 mb-4">Buat jadwal terlebih dahulu di menu <b>Jadwal Ujian</b>, lalu kembali ke sini.</p>
        <button onclick="showAdminTab('dash-exams')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
          <i class="fas fa-arrow-right"></i> Buka Jadwal Ujian
        </button>
      </div>`;
    return;
  }

  // No data after filter
  if (totalFiltered === 0) {
    wrapper.innerHTML = `
      <div class="dash-empty bg-white border border-slate-200 rounded-2xl">
        <div class="dash-empty-icon"><i class="fas fa-search-minus"></i></div>
        <p class="font-bold text-slate-700">Tidak ada hasil yang cocok.</p>
        <p class="text-xs text-slate-400 mt-1 mb-4">Bersihkan filter atau ubah kata kunci pencarian.</p>
        <button onclick="_progResetFilters()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-2">
          <i class="fas fa-rotate-left"></i> Reset Filter
        </button>
      </div>`;
    return;
  }

  const tableHtml  = _progBuildTable(items, startIdx, ui);
  const cardsHtml  = _progBuildCards(items, startIdx);
  const pagiHtml   = _progPagination(totalFiltered, page, totalPages);

  wrapper.innerHTML = `
    <div class="pr-table-wrap">
      <div style="overflow-x:auto;">${tableHtml}</div>
      ${pagiHtml}
    </div>
    <div class="pr-cards" style="margin-top:0;">
      ${cardsHtml}
      <div class="bg-white rounded-xl border border-slate-200 mt-1">${pagiHtml}</div>
    </div>
  `;
}

function _progBuildTable(items, startIdx, ui) {
  const sortIco = (key) => {
    if (ui.sortBy !== key) return '<i class="fas fa-sort pr-sort"></i>';
    return ui.sortDir === 'asc' ? '<i class="fas fa-sort-up pr-sort"></i>' : '<i class="fas fa-sort-down pr-sort"></i>';
  };
  const sortedHead = (key) => ui.sortBy === key ? 'sorted' : '';

  const rows = items.map((d, i) => {
    const idx = startIdx + i + 1;
    return _progBuildTableRow(d, idx);
  }).join('');

  return `
    <table class="pr-table">
      <thead>
        <tr>
          <th style="width:48px; text-align:center;">#</th>
          <th class="sortable ${sortedHead('subject')}" onclick="_progSetSort('subject')">Mapel & Kelas ${sortIco('subject')}</th>
          <th class="sortable ${sortedHead('total')}" onclick="_progSetSort('total')" style="text-align:center; width:96px;">Total ${sortIco('total')}</th>
          <th>Breakdown per Tipe</th>
          <th class="sortable ${sortedHead('work')}" onclick="_progSetSort('work')" style="text-align:center; width:160px;">Status Pengerjaan ${sortIco('work')}</th>
          <th style="text-align:right; width:120px;">Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function _progBuildTableRow(d, idx) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  const counts  = d.counts || { total:0, PG:0, PG_KOMPLEKS:0, BS:0, JODOH:0, Esai:0 };
  const total   = counts.total || 0;
  const isActive = String(d.status || '').toLowerCase() === 'aktif';
  const initial = (d.subject || '?').charAt(0).toUpperCase();

  const statusBadge = isActive
    ? `<span class="pr-status pr-status-aktif"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Aktif</span>`
    : `<span class="pr-status pr-status-nonaktif"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>Non-Aktif</span>`;

  const typeCfg = {
    PG:          { label: 'PG',    color: 'bg-blue-50 text-blue-700 border-blue-200',     bar: '#3b82f6' },
    PG_KOMPLEKS: { label: 'PGK',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200', bar: '#6366f1' },
    BS:          { label: 'BS',    color: 'bg-orange-50 text-orange-700 border-orange-200', bar: '#f97316' },
    JODOH:       { label: 'Jodoh', color: 'bg-teal-50 text-teal-700 border-teal-200',      bar: '#14b8a6' },
    Esai:        { label: 'Esai',  color: 'bg-purple-50 text-purple-700 border-purple-200', bar: '#8b5cf6' }
  };

  const typeBadges = Object.entries(typeCfg).map(([key, cfg]) => {
    const cnt = counts[key] || 0;
    const tcCfg = (d.typeConfig && d.typeConfig[key]) || null;
    const max   = tcCfg ? (parseInt(tcCfg.max) || 0) : 0;
    const enabled = !tcCfg || tcCfg.enabled !== false;

    if (!enabled) {
      return `<span class="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-400 line-through opacity-70" title="${cfg.label}: Tipe diblokir">${cfg.label}</span>`;
    }
    if (max > 0) {
      const isFull = cnt >= max;
      return `<span class="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold border ${isFull ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : cfg.color}" title="${cfg.label}: ${cnt} dari target ${max}">${cfg.label}: <b>${cnt}/${max}</b></span>`;
    }
    return `<span class="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold border ${cnt === 0 ? 'bg-slate-50 text-slate-400 border-slate-200' : cfg.color}" title="${cfg.label}: ${cnt} (tidak ada batas)">${cfg.label}: ${cnt}</span>`;
  }).join('');

  // Stacked bar — based on TARGET (max) when set, else proportion of total
  const barSegments = (() => {
    if (total === 0) return '';
    return Object.entries(typeCfg).map(([key, cfg]) => {
      const cnt = counts[key] || 0;
      if (cnt === 0) return '';
      const pct = (cnt / total) * 100;
      return `<div style="width:${pct}%;background:${cfg.bar};" title="${cfg.label}: ${cnt} soal (${Math.round(pct)}%)"></div>`;
    }).join('');
  })();

  const totalColor = total === 0 ? 'text-red-500' : (total < 5 ? 'text-amber-500' : 'text-emerald-600');
  const totalIcon  = total === 0 ? 'fa-exclamation-circle text-red-400' : (total < 5 ? 'fa-exclamation-triangle text-amber-400' : 'fa-check-circle text-emerald-500');

  const work = computeWorkStatus(d);
  const workBadge = work === 'Selesai'
    ? `<span class="pr-status pr-status-selesai"><i class="fas fa-check-circle"></i> Selesai</span>`
    : work === 'NA'
      ? `<span class="pr-status pr-status-na"><i class="fas fa-circle-info"></i> Tidak Ada Target</span>`
      : `<span class="pr-status pr-status-proses"><i class="fas fa-spinner" style="animation:lp-spin 1.6s linear infinite;"></i> Proses</span>`;

  const workDetail = (() => {
    if (!d.typeConfig) return '';
    const labels = { PG:'PG', PG_KOMPLEKS:'PGK', BS:'BS', JODOH:'Jodoh', Esai:'Esai' };
    const items = ['PG','PG_KOMPLEKS','BS','JODOH','Esai'].filter(t => {
      const cfg = d.typeConfig[t];
      return cfg && cfg.enabled !== false && parseInt(cfg.max||0) > 0;
    }).map(t => {
      const cur = counts[t] || 0;
      const max = parseInt(d.typeConfig[t].max);
      const full = cur >= max;
      return `<span class="inline-flex items-center gap-1 text-[9px] font-bold ${full ? 'text-emerald-600' : 'text-amber-600'}">
        <i class="fas ${full ? 'fa-check' : 'fa-minus'}"></i>${labels[t]} ${cur}/${max}</span>`;
    });
    return items.length ? `<div class="flex flex-wrap justify-center gap-1.5 mt-1">${items.join('')}</div>` : '';
  })();

  return `
    <tr>
      <td style="text-align:center; color:#94a3b8; font-weight:600;">${idx}</td>
      <td>
        <div class="flex items-center gap-3">
          <div class="pr-card-avatar" style="width:34px;height:34px;border-radius:8px;font-size:14px;">${escHtml(initial)}</div>
          <div class="min-w-0">
            <div class="font-bold text-slate-800 truncate" title="${escAttr(d.subject)}">${escHtml(d.subject || '-')}</div>
            <div class="flex items-center gap-1 mt-1 flex-wrap">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">${escHtml(d.kelas || '-')}</span>
              ${statusBadge}
            </div>
          </div>
        </div>
      </td>
      <td style="text-align:center;">
        <div class="flex flex-col items-center gap-0.5">
          <i class="fas ${totalIcon} text-base"></i>
          <span class="text-xl font-black ${totalColor}">${total}</span>
          <span class="text-[9px] text-slate-400 font-medium">soal</span>
        </div>
      </td>
      <td style="min-width:280px;">
        <div class="flex flex-wrap gap-1.5 mb-2">${typeBadges}</div>
        ${total > 0 ? `<div class="pr-bar">${barSegments}</div>` : `<div class="text-xs text-red-400 font-medium flex items-center gap-1"><i class="fas fa-exclamation-circle"></i> Belum ada soal</div>`}
      </td>
      <td style="text-align:center;">
        <div class="flex flex-col items-center gap-1">
          ${workBadge}
          ${workDetail}
        </div>
      </td>
      <td style="text-align:right;">
        <div class="flex justify-end gap-2">
          <button onclick="_progGoToQuestionBank('${escAttr(d.examId)}')" class="ex-action-btn ex-action-edit" title="Kelola Soal">
            <i class="fas fa-pen-to-square"></i>
          </button>
          <button onclick="_progShowDetail('${escAttr(d.examId)}')" class="ex-action-btn ex-action-dup" title="Detail">
            <i class="fas fa-info"></i>
          </button>
        </div>
      </td>
    </tr>`;
}

function _progBuildCards(items, startIdx) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  return items.map(d => {
    const counts = d.counts || { total:0, PG:0, PG_KOMPLEKS:0, BS:0, JODOH:0, Esai:0 };
    const total = counts.total || 0;
    const initial = (d.subject || '?').charAt(0).toUpperCase();
    const isActive = String(d.status || '').toLowerCase() === 'aktif';

    const statusBadge = isActive
      ? `<span class="pr-status pr-status-aktif"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>Aktif</span>`
      : `<span class="pr-status pr-status-nonaktif"><span class="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>Non-Aktif</span>`;

    const typeCfg = {
      PG:          { label: 'PG',    color: 'bg-blue-50 text-blue-700 border-blue-200',     bar: '#3b82f6' },
      PG_KOMPLEKS: { label: 'PGK',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200', bar: '#6366f1' },
      BS:          { label: 'BS',    color: 'bg-orange-50 text-orange-700 border-orange-200', bar: '#f97316' },
      JODOH:       { label: 'Jodoh', color: 'bg-teal-50 text-teal-700 border-teal-200',      bar: '#14b8a6' },
      Esai:        { label: 'Esai',  color: 'bg-purple-50 text-purple-700 border-purple-200', bar: '#8b5cf6' }
    };

    const typeBadges = Object.entries(typeCfg).map(([key, cfg]) => {
      const cnt = counts[key] || 0;
      const tcCfg = (d.typeConfig && d.typeConfig[key]) || null;
      const max   = tcCfg ? (parseInt(tcCfg.max) || 0) : 0;
      const enabled = !tcCfg || tcCfg.enabled !== false;
      if (!enabled) return `<span class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-400 line-through opacity-70">${cfg.label}</span>`;
      if (max > 0) {
        const full = cnt >= max;
        return `<span class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${full ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : cfg.color}">${cfg.label}: <b>${cnt}/${max}</b></span>`;
      }
      return `<span class="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${cnt===0?'bg-slate-50 text-slate-400 border-slate-200':cfg.color}">${cfg.label}: ${cnt}</span>`;
    }).join('');

    const barSegments = total > 0 ? Object.entries(typeCfg).map(([key, cfg]) => {
      const cnt = counts[key] || 0;
      if (cnt === 0) return '';
      const pct = (cnt / total) * 100;
      return `<div style="width:${pct}%;background:${cfg.bar};"></div>`;
    }).join('') : '';

    const work = computeWorkStatus(d);
    const workBadge = work === 'Selesai'
      ? `<span class="pr-status pr-status-selesai"><i class="fas fa-check-circle"></i> Selesai</span>`
      : work === 'NA'
        ? `<span class="pr-status pr-status-na"><i class="fas fa-circle-info"></i> No Target</span>`
        : `<span class="pr-status pr-status-proses"><i class="fas fa-spinner" style="animation:lp-spin 1.6s linear infinite;"></i> Proses</span>`;

    return `
      <div class="pr-card">
        <div class="pr-card-head">
          <div class="pr-card-avatar">${escHtml(initial)}</div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-800 text-sm truncate" title="${escAttr(d.subject)}">${escHtml(d.subject || '-')}</div>
            <div class="flex flex-wrap gap-1 mt-1 items-center">
              <span class="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">${escHtml(d.kelas || '-')}</span>
              ${statusBadge}
              ${workBadge}
            </div>
          </div>
        </div>
        <div class="pr-card-body">
          <div class="pr-card-row">
            <i class="fas fa-pen-nib text-indigo-500"></i>
            <span><b>${total}</b> soal total</span>
          </div>
          <div class="flex flex-wrap gap-1.5">${typeBadges}</div>
          ${total > 0 ? `<div class="pr-bar">${barSegments}</div>` : ''}
        </div>
        <div class="pr-card-foot">
          <button class="pr-act pr-act-ghost" onclick="_progShowDetail('${escAttr(d.examId)}')">
            <i class="fas fa-info-circle"></i> Detail
          </button>
          <button class="pr-act pr-act-primary" onclick="_progGoToQuestionBank('${escAttr(d.examId)}')">
            <i class="fas fa-pen-to-square"></i> Kelola Soal
          </button>
        </div>
      </div>`;
  }).join('');
}

function _progPagination(total, page, totalPages) {
  if (totalPages <= 1) {
    return `<div class="pr-pagination">
      <span>Menampilkan <b class="text-slate-700">${total}</b> mata pelajaran</span>
    </div>`;
  }
  const ws = Math.max(1, page - 2);
  const we = Math.min(totalPages, page + 2);
  let nums = '';
  if (ws > 1) nums += `<button class="pr-page-btn" onclick="_progSetPage(1)">1</button>` + (ws > 2 ? '<span class="text-slate-400">…</span>' : '');
  for (let p = ws; p <= we; p++) nums += `<button class="pr-page-btn ${p===page?'active':''}" onclick="_progSetPage(${p})">${p}</button>`;
  if (we < totalPages) nums += (we < totalPages - 1 ? '<span class="text-slate-400">…</span>' : '') + `<button class="pr-page-btn" onclick="_progSetPage(${totalPages})">${totalPages}</button>`;

  return `
    <div class="pr-pagination">
      <span>Halaman <b>${page}</b> / <b>${totalPages}</b> · ${total} mapel</span>
      <div class="flex gap-1">
        <button class="pr-page-btn" onclick="_progSetPage(${page-1})" ${page<=1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
        ${nums}
        <button class="pr-page-btn" onclick="_progSetPage(${page+1})" ${page>=totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>`;
}

// ───── Progress UI actions ─────
function _progSetFilter(key, value) {
  const ui = window._progressUI; if (!ui) return;
  if (key === 'search')  ui.search = value || '';
  if (key === 'status')  ui.filterStatus = value || '';
  if (key === 'work')    ui.filterWork   = value || '';
  if (key === 'subject') ui.filterSubj   = value || '';
  ui.page = 1;

  const wasFocused = document.activeElement && document.activeElement.id === 'prog-search';
  const caretPos   = wasFocused ? document.activeElement.selectionStart : null;
  _refreshProgressUI();
  if (wasFocused) {
    const inp = document.getElementById('prog-search');
    if (inp) {
      inp.focus();
      try { inp.setSelectionRange(caretPos, caretPos); } catch(e){}
    }
  }
}
function _progResetFilters() {
  Object.assign(window._progressUI || {}, { search:'', filterStatus:'', filterWork:'', filterSubj:'', page:1 });
  _refreshProgressUI();
}
function _progSetSort(key) {
  const ui = window._progressUI; if (!ui) return;
  if (ui.sortBy === key) ui.sortDir = ui.sortDir === 'asc' ? 'desc' : 'asc';
  else { ui.sortBy = key; ui.sortDir = 'asc'; }
  _refreshProgressUI();
}
function _progSetPage(p) {
  const ui = window._progressUI; if (!ui) return;
  ui.page = Math.max(1, parseInt(p) || 1);
  _refreshProgressUI();
  const c = document.getElementById('admin-content');
  if (c) c.scrollTo({ top:0, behavior:'smooth' });
}

// ───── Drill-down: Open Bank Soal pre-filtered to this exam ─────
function _progGoToQuestionBank(examId) {
  if (!examId) return;
  // Stash mata pelajaran tujuan; renderQuestionBank akan menerapkannya secara
  // sinkron setelah markup (termasuk dropdown) selesai dibangun, lalu memuat
  // tabel soalnya. Tidak perlu polling.
  window._progPendingExamId = examId;
  showAdminTab('dash-questions');

  // Jaring pengaman: bila karena suatu hal stash belum sempat diterapkan
  // (mis. render tertunda), coba terapkan sekali setelah render seharusnya
  // selesai. Idempoten — _progPendingExamId sudah di-null-kan saat diterapkan.
  let tries = 0;
  const t = setInterval(() => {
    if (!window._progPendingExamId) { clearInterval(t); return; }
    const sel = document.getElementById('select-exam-q');
    if (sel) {
      window._progPendingExamId = null;
      sel.value = String(examId);
      try {
        if (typeof loadQuestionsTable === 'function') loadQuestionsTable(examId);
        else sel.dispatchEvent(new Event('change'));
      } catch (e) {}
      clearInterval(t);
    } else if (++tries > 30) {
      clearInterval(t);
    }
  }, 150);
}

// ───── Detail modal ─────
function _progShowDetail(examId) {
  const d = (window._progressRawData || []).find(x => String(x.examId) === String(examId));
  if (!d) return;
  const counts = d.counts || {};
  const total  = counts.total || 0;
  const types  = ['PG','PG_KOMPLEKS','BS','JODOH','Esai'];
  const labels = { PG:'Pilihan Ganda', PG_KOMPLEKS:'PG Kompleks', BS:'Benar/Salah', JODOH:'Menjodohkan', Esai:'Esai' };

  const rows = types.map(t => {
    const cfg = (d.typeConfig && d.typeConfig[t]) || null;
    const enabled = !cfg || cfg.enabled !== false;
    const max   = cfg ? (parseInt(cfg.max) || 0) : 0;
    const cnt   = counts[t] || 0;
    let badge;
    if (!enabled) badge = '<span style="background:#f1f5f9;color:#94a3b8;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;">DIBLOKIR</span>';
    else if (max === 0) badge = '<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;">TANPA BATAS</span>';
    else if (cnt >= max) badge = '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;">LENGKAP</span>';
    else badge = `<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;">${cnt}/${max}</span>`;
    return `
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:8px 4px; font-size:12px; color:#475569; font-weight:600;">${labels[t]}</td>
        <td style="padding:8px 4px; text-align:center; font-size:13px; font-weight:800; color:${enabled?'#1e293b':'#cbd5e1'};">${cnt}</td>
        <td style="padding:8px 4px; text-align:center;">${badge}</td>
      </tr>`;
  }).join('');

  const work = computeWorkStatus(d);
  const workTxt = work === 'Selesai' ? 'Selesai (target tipe terpenuhi)' : (work === 'NA' ? 'Tidak ada target diset' : 'Masih dalam proses');

  Swal.fire({
    title: `<div style="font-size:15px;line-height:1.3;"><i class="fas fa-clipboard-check text-indigo-500" style="margin-right:6px;"></i>Detail Progress</div>
            <div style="font-size:13px;font-weight:700;color:#1e293b;margin-top:4px;">${(d.subject||'-')}</div>
            <div style="font-size:11px;color:#94a3b8;font-weight:600;margin-top:2px;">${d.kelas||'-'} · ${d.status||'-'}</div>`,
    html: `
      <div style="text-align:left; font-size:12px; color:#475569;">
        <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;padding:10px 12px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div><b>${total}</b> soal total dibuat</div>
            <div>${workTxt}</div>
          </div>
        </div>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="text-align:left; padding:6px 4px; font-size:10px; color:#94a3b8; text-transform:uppercase;">Tipe</th>
              <th style="text-align:center; padding:6px 4px; font-size:10px; color:#94a3b8; text-transform:uppercase;">Jumlah</th>
              <th style="text-align:center; padding:6px 4px; font-size:10px; color:#94a3b8; text-transform:uppercase;">Target</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `,
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: '<i class="fas fa-pen-to-square" style="margin-right:6px;"></i> Kelola Soal',
    cancelButtonText:  'Tutup',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor:  '#64748b',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' },
    width: 460
  }).then(res => {
    if (res.isConfirmed) _progGoToQuestionBank(examId);
  });
}

// Backwards-compat shims (in case anything still calls these names)
function applyProgressFilter() { _refreshProgressUI(); }
function updateProgressSummaryCards() {
  const raw = window._progressRawData || [];
  _renderProgressStats(raw, raw);
}
function renderProgressTable() { _refreshProgressUI(); }

function computeWorkStatus(d) {
  if (!d || !d.typeConfig) return 'NA';
  const types = ['PG', 'PG_KOMPLEKS', 'BS', 'JODOH', 'Esai'];
  const relevant = types.filter(t => {
    const cfg = d.typeConfig[t];
    return cfg && cfg.enabled !== false && parseInt(cfg.max || 0) > 0;
  });
  if (relevant.length === 0) return 'NA';
  const counts = d.counts || {};
  const allFull = relevant.every(t => (counts[t] || 0) >= parseInt(d.typeConfig[t].max));
  return allFull ? 'Selesai' : 'Proses';
}

function downloadProgressExcel() {
  const data = window._progressFiltered || window._progressRawData || [];
  if (data.length === 0) {
    Swal.fire({
      title:'Tidak Ada Data',
      html:'<p style="font-size:13px;color:#475569;">Tidak ada data progress yang dapat diunduh.</p>',
      icon:'info', confirmButtonColor:'#4f46e5',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }

  const headers = ['No', 'Mata Pelajaran', 'Kelas', 'Status', 'Status Pengerjaan', 'PG', 'PG Kompleks', 'BS', 'JODOH', 'Esai', 'Total Soal'];
  const rows = data.map((d, i) => {
    const work = computeWorkStatus(d);
    const workLabel = work === 'NA' ? 'No Target' : work;
    return [
      i + 1, d.subject || '-', d.kelas || '-', d.status || '-', workLabel,
      (d.counts && d.counts.PG) || 0,
      (d.counts && d.counts.PG_KOMPLEKS) || 0,
      (d.counts && d.counts.BS) || 0,
      (d.counts && d.counts.JODOH) || 0,
      (d.counts && d.counts.Esai) || 0,
      (d.counts && d.counts.total) || 0
    ];
  });

  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws['!cols'] = [{wch:5},{wch:30},{wch:20},{wch:12},{wch:16},{wch:8},{wch:12},{wch:8},{wch:8},{wch:8},{wch:12}];
    XLSX.utils.book_append_sheet(wb, ws, 'Progress Soal');
    const ts = new Date().toISOString().slice(0,16).replace(/[T:]/g,'-');
    XLSX.writeFile(wb, `Progress_Soal_${ts}.xlsx`);
    const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
    Toast.fire({ icon:'success', title:'File Excel diunduh' });
  } catch (err) {
    Swal.fire({
      title:'Gagal Membuat File',
      html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) ? err.message : err}</p>`,
      icon:'error', confirmButtonColor:'#dc2626',
      customClass:{ popup:'lp-swal' }
    });
  }
}