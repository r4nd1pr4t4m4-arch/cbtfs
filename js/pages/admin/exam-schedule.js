/**
 * exam-schedule.js — Jadwal Ujian
 * renderExamForm(), examUI*, examCopyPin, openExamModalById, duplicateExam,
 * initExamModalComponent, handleExamSubmit, examToggleSelect*, handleBulkDeleteExams,
 * handleDeleteExam, toggleExamStatus, refreshExamList, refreshDashboard
 * Sumber: index.html L18493-20258
 */

function renderExamForm(container) {
  const isAdmin = currentUser && currentUser.role === 'Admin';

  // ───────────── State for filters/sort/pagination ─────────────
  if (!window._examUI) {
    window._examUI = {
      filterStatus: '',
      filterClass:  '',
      filterSubject:'',
      search: '',
      sortBy: 'date',     // 'date' | 'subject' | 'class' | 'duration'
      sortDir: 'asc',     // 'asc' | 'desc'
      page: 1,
      pageSize: 10
    };
  }
  const ui = window._examUI;

  // ───────────── Helpers ─────────────
  const exams = Array.isArray(cachedExams) ? cachedExams.slice() : [];
  const now = Date.now();

  // FIX: gunakan helper global _examLiveStatus_ (konsisten dengan handleDeleteAllExams)
  function liveStatus(e) { return _examLiveStatus_(e, now); }
  function statusPill(e) {
    const s = liveStatus(e);
    const map = {
      live:     { cls:'ex-status-live',     icon:'fa-circle', text:'BERLANGSUNG' },
      upcoming: { cls:'ex-status-upcoming', icon:'fa-hourglass-half', text:'AKAN DATANG' },
      ended:    { cls:'ex-status-ended',    icon:'fa-circle-stop', text:'BERAKHIR' },
      aktif:    { cls:'ex-status-aktif',    icon:'fa-circle-check', text:'AKTIF' },
      nonaktif: { cls:'ex-status-nonaktif', icon:'fa-circle-pause', text:'NON-AKTIF' }
    };
    const c = map[s];
    return `<span class="ex-status-pill ${c.cls}"><span class="ex-status-dot"></span>${c.text}</span>`;
  }
  function escAttr(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
  function escHtml(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // ───────────── Apply filters ─────────────
  let filtered = exams.filter(e => {
    if (ui.filterStatus) {
      const s = liveStatus(e);
      if (ui.filterStatus === 'aktif'    && !(s === 'aktif' || s === 'live'))   return false;
      if (ui.filterStatus === 'nonaktif' && !(s === 'nonaktif' || s === 'ended')) return false;
      if (ui.filterStatus === 'live'     && s !== 'live')     return false;
      if (ui.filterStatus === 'upcoming' && s !== 'upcoming') return false;
      if (ui.filterStatus === 'ended'    && s !== 'ended')    return false;
    }
    if (ui.filterSubject && e.subject !== ui.filterSubject) return false;
    if (ui.filterClass) {
      const list = String(e.class || '').split(',').map(c => c.trim());
      if (!list.includes(ui.filterClass)) return false;
    }
    if (ui.search) {
      const q = ui.search.toLowerCase();
      const hay = [
        e.subject, e.class, e.pin, e.dateStr, e.endDateStr, e.duration
      ].map(v => String(v || '').toLowerCase()).join(' | ');
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // ───────────── Sort ─────────────
  const dir = ui.sortDir === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    let va, vb;
    switch (ui.sortBy) {
      case 'subject':  va = String(a.subject||'').toLowerCase(); vb = String(b.subject||'').toLowerCase(); break;
      case 'class':    va = String(a.class||'').toLowerCase();   vb = String(b.class||'').toLowerCase();   break;
      case 'duration': va = parseInt(a.duration)||0;             vb = parseInt(b.duration)||0;             break;
      case 'date':
      default:         va = a.date ? new Date(a.date).getTime() : 0;
                       vb = b.date ? new Date(b.date).getTime() : 0;
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return  1 * dir;
    return 0;
  });

  // ───────────── Stats ─────────────
  const stats = {
    total:    exams.length,
    aktif:    exams.filter(e => { const s = liveStatus(e); return s === 'aktif' || s === 'live'; }).length,
    upcoming: exams.filter(e => liveStatus(e) === 'upcoming').length,
    ended:    exams.filter(e => liveStatus(e) === 'ended' || liveStatus(e) === 'nonaktif').length
  };

  // Available filter options
  const subjects = [...new Set(exams.map(e => (e.subject || '').trim()).filter(Boolean))].sort();
  const allClasses = [];
  exams.forEach(e => String(e.class || '').split(',').map(c => c.trim()).forEach(c => { if (c && !allClasses.includes(c)) allClasses.push(c); }));
  allClasses.sort();

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
  if (ui.page > totalPages) ui.page = totalPages;
  const startIdx = (ui.page - 1) * ui.pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + ui.pageSize);

  // ───────────── Build HTML ─────────────
  const sortIco = (key) => {
    if (ui.sortBy !== key) return '<i class="fas fa-sort ex-sort-ico"></i>';
    return ui.sortDir === 'asc'
      ? '<i class="fas fa-sort-up ex-sort-ico"></i>'
      : '<i class="fas fa-sort-down ex-sort-ico"></i>';
  };
  const sortedHead = (key) => ui.sortBy === key ? 'sorted' : '';

  const headerHtml = `
    <div class="ex-toolbar">

      <!-- ── Top: Judul + Aksi ── -->
      <div class="ex-toolbar-top">
        <div class="min-w-0">
          <h2 class="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 leading-tight">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm flex-shrink-0">
              <i class="fas fa-calendar-alt"></i>
            </span>
            Manajemen Jadwal Ujian
          </h2>
          <p class="text-xs text-slate-500 mt-1 ml-10">
            ${isAdmin ? 'Kelola jadwal, durasi, PIN sesi, dan tipe soal yang diizinkan.' : 'Lihat daftar jadwal ujian yang tersedia.'}
          </p>
        </div>
        ${isAdmin ? `
          <div class="flex items-center gap-2 flex-wrap flex-shrink-0">
            <button onclick="openExamModal()"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition shadow-md shadow-blue-500/25 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
              <i class="fas fa-plus text-xs"></i><span>Buat Jadwal</span>
            </button>
            <button onclick="handleDeleteAllExams()"
              title="${(ui.filterStatus||ui.filterSubject||ui.filterClass||ui.search)?'Hapus jadwal yang tampil sesuai filter':'Hapus semua jadwal'}"
              class="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-95 transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1">
              <i class="fas fa-trash-can text-xs"></i>
              <span class="hidden sm:inline">${(ui.filterStatus||ui.filterSubject||ui.filterClass||ui.search)?'Hapus Hasil Filter':'Hapus Semua'}</span>
            </button>
          </div>
        ` : `
          <div class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 flex-shrink-0">
            <i class="fas fa-eye text-amber-500"></i> Mode Lihat Saja
          </div>
        `}
      </div>

      <!-- ── Bulk Action Bar ── -->
      ${isAdmin ? `
      <div id="ex-bulk-bar" class="${(window._selectedExams && window._selectedExams.size > 0) ? 'flex' : 'hidden'} items-center justify-between px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl gap-3 flex-wrap">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-rose-100 text-rose-600 text-xs flex-shrink-0">
            <i class="fas fa-check-square"></i>
          </span>
          <span class="text-sm font-bold text-rose-700 whitespace-nowrap">
            <span id="ex-bulk-count">${(window._selectedExams && window._selectedExams.size) || 0}</span> dipilih
          </span>
          <button onclick="examClearSelection()" class="text-xs text-rose-400 hover:text-rose-600 underline whitespace-nowrap ml-1">Batal</button>
        </div>
        <button onclick="handleBulkDeleteExams()"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition active:scale-95 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-rose-500">
          <i class="fas fa-trash-alt text-xs"></i> Hapus Terpilih
        </button>
      </div>` : ''}

      <!-- ── Status Filter Cards ── -->
      <div class="ex-stat-row" role="tablist" aria-label="Filter berdasarkan status">
        <div class="ex-stat ${ui.filterStatus===''         ? 'active' : ''}"
          onclick="examUISetFilter('status','')" tabindex="0" role="tab"
          aria-selected="${ui.filterStatus===''}" onkeydown="if(event.key==='Enter'||event.key===' ')examUISetFilter('status','')">
          <div class="ex-stat-ico ${ui.filterStatus==='' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-500'}"><i class="fas fa-list"></i></div>
          <div class="min-w-0">
            <div class="ex-stat-num">${stats.total}</div>
            <div class="ex-stat-lbl">Semua</div>
          </div>
        </div>
        <div class="ex-stat ${ui.filterStatus==='aktif'    ? 'active' : ''}"
          onclick="examUISetFilter('status','aktif')" tabindex="0" role="tab"
          aria-selected="${ui.filterStatus==='aktif'}" onkeydown="if(event.key==='Enter'||event.key===' ')examUISetFilter('status','aktif')">
          <div class="ex-stat-ico ${ui.filterStatus==='aktif' ? 'bg-emerald-200 text-emerald-700' : 'bg-emerald-100 text-emerald-600'}"><i class="fas fa-circle-check"></i></div>
          <div class="min-w-0">
            <div class="ex-stat-num">${stats.aktif}</div>
            <div class="ex-stat-lbl">Aktif</div>
          </div>
        </div>
        <div class="ex-stat ${ui.filterStatus==='upcoming' ? 'active' : ''}"
          onclick="examUISetFilter('status','upcoming')" tabindex="0" role="tab"
          aria-selected="${ui.filterStatus==='upcoming'}" onkeydown="if(event.key==='Enter'||event.key===' ')examUISetFilter('status','upcoming')">
          <div class="ex-stat-ico ${ui.filterStatus==='upcoming' ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-600'}"><i class="fas fa-hourglass-half"></i></div>
          <div class="min-w-0">
            <div class="ex-stat-num">${stats.upcoming}</div>
            <div class="ex-stat-lbl">Akan Datang</div>
          </div>
        </div>
        <div class="ex-stat ${ui.filterStatus==='ended'    ? 'active' : ''}"
          onclick="examUISetFilter('status','ended')" tabindex="0" role="tab"
          aria-selected="${ui.filterStatus==='ended'}" onkeydown="if(event.key==='Enter'||event.key===' ')examUISetFilter('status','ended')">
          <div class="ex-stat-ico ${ui.filterStatus==='ended' ? 'bg-rose-200 text-rose-700' : 'bg-rose-100 text-rose-600'}"><i class="fas fa-circle-stop"></i></div>
          <div class="min-w-0">
            <div class="ex-stat-num">${stats.ended}</div>
            <div class="ex-stat-lbl">Berakhir</div>
          </div>
        </div>
      </div>

      <!-- ── Search + Filter ── -->
      <div class="ex-filter-row">
        <div class="ex-search" role="search">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input id="ex-search-input" type="search" placeholder="Cari mapel, kelas, PIN…"
            value="${escAttr(ui.search)}"
            oninput="examUISetFilter('search', this.value)"
            autocomplete="off" aria-label="Cari jadwal ujian">
          <button class="ex-search-clear ${ui.search ? 'show' : ''}" id="ex-search-clear-btn"
            onclick="examUISetFilter('search','')" title="Hapus pencarian" aria-label="Hapus pencarian">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <select class="ex-select" onchange="examUISetFilter('subject', this.value)" aria-label="Filter mata pelajaran">
          <option value="">📚 Semua Mapel</option>
          ${subjects.map(s => `<option value="${escAttr(s)}" ${ui.filterSubject===s?'selected':''}>${escHtml(s)}</option>`).join('')}
        </select>
        <select class="ex-select" onchange="examUISetFilter('class', this.value)" aria-label="Filter kelas">
          <option value="">🏫 Semua Kelas</option>
          ${allClasses.map(c => `<option value="${escAttr(c)}" ${ui.filterClass===c?'selected':''}>${escHtml(c)}</option>`).join('')}
        </select>
        ${(ui.search || ui.filterStatus || ui.filterSubject || ui.filterClass) ? `
          <button onclick="examUIResetFilters()"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition active:scale-95 whitespace-nowrap">
            <i class="fas fa-times-circle"></i> Reset Filter
          </button>` : ''}
      </div>

    </div>
  `;

  // ── EMPTY STATE (belum ada data sama sekali) ──
  if (exams.length === 0) {
    container.innerHTML = `
      <div class="ex-page fade-in">
        ${headerHtml}
        <div class="bg-white rounded-2xl border border-slate-200 ex-empty">
          <div class="ex-empty-ico bg-blue-50 text-blue-300">
            <i class="fas fa-calendar-plus"></i>
          </div>
          <p class="font-bold text-slate-700 text-sm mt-1">Belum ada jadwal ujian</p>
          <p class="text-xs text-slate-400 mt-1 mb-5 max-w-xs mx-auto leading-relaxed">
            Buat jadwal pertama untuk mulai memberikan ujian kepada siswa.
          </p>
          ${isAdmin ? `
            <button onclick="openExamModal()"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
              <i class="fas fa-plus text-xs"></i> Buat Jadwal Pertama
            </button>` : ''}
        </div>
      </div>`;
    if (!document.getElementById('examModal')) initExamModalComponent();
    return;
  }

  // ── NO RESULT (setelah filter) ──
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="ex-page fade-in">
        ${headerHtml}
        <div class="bg-white rounded-2xl border border-slate-200 ex-empty">
          <div class="ex-empty-ico bg-slate-50 text-slate-300">
            <i class="fas fa-filter-circle-xmark"></i>
          </div>
          <p class="font-bold text-slate-700 text-sm mt-1">Tidak ada jadwal yang cocok</p>
          <p class="text-xs text-slate-400 mt-1 mb-5 max-w-xs mx-auto leading-relaxed">
            Coba ubah atau hapus filter yang aktif, atau cari dengan kata kunci berbeda.
          </p>
          <button onclick="examUIResetFilters()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition active:scale-95">
            <i class="fas fa-rotate-left"></i> Reset Semua Filter
          </button>
        </div>
      </div>`;
    if (!document.getElementById('examModal')) initExamModalComponent();
    return;
  }

  // ───────────── Build TABLE rows (desktop) ─────────────
  const tableRows = pageItems.map((exam, idx) => {
    const realIdx = startIdx + idx + 1;
    const initial = exam.subject ? exam.subject.charAt(0).toUpperCase() : '?';
    const endDateDisplay = exam.endDateStr || '?';
    const examDataAttr = encodeURIComponent(JSON.stringify(exam));

    const statusInteractive = isAdmin
      ? `<span style="cursor:pointer" onclick="switchStatus('${escAttr(exam.id)}', '${escAttr(exam.status)}')" title="Klik untuk ubah status">${statusPill(exam)}</span>`
      : statusPill(exam);

    const aksi = isAdmin ? `
      <td class="text-right" style="width:120px;">
        <div class="ex-actions">
          <button class="ex-action-btn ex-action-edit"  onclick='openExamModalById("${escAttr(exam.id)}")' title="Edit jadwal" aria-label="Edit">
            <i class="fas fa-pen-to-square"></i>
          </button>
          <button class="ex-action-btn ex-action-dup"   onclick='duplicateExam("${escAttr(exam.id)}")' title="Duplikat jadwal" aria-label="Duplikat">
            <i class="fas fa-clone"></i>
          </button>
          <button class="ex-action-btn ex-action-del"   onclick="handleDeleteExam('${escAttr(exam.id)}')" title="Hapus jadwal" aria-label="Hapus">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      </td>` : '';

    const tcBadge = (() => {
      const tc = exam.typeConfig;
      if (!tc) return `<span class="text-[10px] text-slate-400 italic">Semua tipe</span>`;
      const typeDef = [
        { key:'PG',          label:'PG',    color:'bg-blue-50 text-blue-700 border-blue-200'      },
        { key:'PG_KOMPLEKS', label:'PGK',   color:'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { key:'BS',          label:'BS',    color:'bg-orange-50 text-orange-700 border-orange-200' },
        { key:'JODOH',       label:'Jodoh', color:'bg-teal-50 text-teal-700 border-teal-200'       },
        { key:'Esai',        label:'Esai',  color:'bg-rose-50 text-rose-700 border-rose-200'       }
      ];
      return typeDef.map(({key,label,color}) => {
        const cfg = tc[key] || { enabled:true, max:0 };
        if (cfg.enabled === false) {
          return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60" title="${label}: Diblokir">${label}</span>`;
        }
        const max = parseInt(cfg.max) || 0;
        return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${color}" title="${label}${max>0?': maks '+max+' soal':': tidak dibatasi'}">${label}${max>0?':'+max:''}</span>`;
      }).join(' ');
    })();

    const isCheckedExam = (window._selectedExams && window._selectedExams.has(String(exam.id))) ? 'checked' : '';

    return `
      <tr class="${isCheckedExam ? 'ex-row-selected' : ''}">
        ${isAdmin ? `<td style="width:40px;text-align:center;">
          <input type="checkbox" class="ex-row-check w-4 h-4 rounded border-slate-300 cursor-pointer accent-red-500"
            value="${escAttr(exam.id)}" ${isCheckedExam} onchange="examToggleSelect('${escAttr(exam.id)}', this)"
            aria-label="Pilih ${escAttr(exam.subject)}">
        </td>` : ''}
        <td style="width:44px;text-align:center;color:#94a3b8;font-size:11px;font-weight:700;">${realIdx}</td>
        <td style="min-width:160px;max-width:220px;">
          <div class="flex items-center gap-3">
            <div class="ex-card-avatar" style="width:34px;height:34px;border-radius:9px;font-size:14px;flex-shrink:0;">${escHtml(initial)}</div>
            <div class="min-w-0">
              <div class="font-bold text-slate-800 text-sm leading-tight truncate" title="${escAttr(exam.subject)}">${escHtml(exam.subject || '—')}</div>
              <div class="flex flex-wrap gap-1 mt-1">
                ${String(exam.class||'').split(',').map(c=>c.trim()).filter(Boolean).map(c=>`
                  <span class="inline-block text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md leading-none">${escHtml(c)}</span>
                `).join('')}
              </div>
            </div>
          </div>
        </td>
        <td style="min-width:190px;">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs text-slate-600">
              <i class="far fa-calendar-alt text-blue-400 w-3.5 text-center flex-shrink-0"></i>
              <span class="font-semibold text-slate-500 flex-shrink-0">Mulai</span>
              <span class="text-slate-700 font-bold truncate">${escHtml(exam.dateStr || '—')}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <i class="far fa-calendar-check text-slate-400 w-3.5 text-center flex-shrink-0"></i>
              <span class="font-semibold text-slate-400 flex-shrink-0">Selesai</span>
              <span class="truncate">${escHtml(endDateDisplay)}</span>
            </div>
            <div class="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span><i class="far fa-clock mr-1"></i>${parseInt(exam.duration)||0} menit</span>
              ${parseFloat(exam.passingGrade)>0 ? `<span class="text-emerald-600 font-bold"><i class="fas fa-award mr-0.5"></i>KKM ${exam.passingGrade}</span>` : ''}
            </div>
          </div>
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <div class="ex-pin inline-flex">
            <span class="tracking-widest">${escHtml(exam.pin)}</span>
            <button class="ex-pin-copy" onclick="examCopyPin('${escAttr(exam.pin)}', this)" title="Salin PIN" aria-label="Salin PIN ${escAttr(exam.pin)}">
              <i class="far fa-copy"></i>
            </button>
          </div>
        </td>
        <td style="min-width:130px;">
          <div class="flex flex-wrap gap-1">${tcBadge}</div>
        </td>
        <td style="text-align:center;white-space:nowrap;">${statusInteractive}</td>
        ${aksi}
      </tr>
    `;
  }).join('');

  const tableHtml = `
    <div class="ex-table-wrap">
      <div style="overflow-x:auto;">
        <table class="ex-table">
          <thead>
            <tr>
              ${isAdmin ? `<th style="width:40px;text-align:center;">
                <input type="checkbox" id="ex-check-all" onchange="examToggleSelectAll(this.checked)"
                  class="w-4 h-4 rounded border-slate-300 cursor-pointer accent-red-500" title="Pilih Semua">
              </th>` : ''}
              <th style="width:48px;">#</th>
              <th class="sortable ${sortedHead('subject')}" onclick="examUISetSort('subject')">Mapel & Kelas ${sortIco('subject')}</th>
              <th class="sortable ${sortedHead('date')}"    onclick="examUISetSort('date')">Waktu ${sortIco('date')}</th>
              <th style="text-align:center;">PIN</th>
              <th>Konfigurasi</th>
              <th style="text-align:center;">Status</th>
              ${isAdmin ? `<th style="text-align:right;">Aksi</th>` : ''}
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${_examPaginationHtml(filtered.length, ui.page, totalPages)}
    </div>
  `;

  // ───────────── Build CARDS (mobile) ─────────────
  const cardsHtml = `
    <div class="ex-cards">
      ${pageItems.map(exam => {
        const initial = exam.subject ? exam.subject.charAt(0).toUpperCase() : '?';
        const endDateDisplay = exam.endDateStr || '?';
        const tc = exam.typeConfig;
        const tcBadges = (() => {
          if (!tc) return '<span class="text-[10px] text-slate-400 italic">Semua tipe diizinkan</span>';
          const typeDef = [
            { key:'PG', label:'PG', cls:'bg-blue-50 text-blue-700 border-blue-200' },
            { key:'PG_KOMPLEKS', label:'PGK', cls:'bg-indigo-50 text-indigo-700 border-indigo-200' },
            { key:'BS', label:'BS', cls:'bg-orange-50 text-orange-700 border-orange-200' },
            { key:'JODOH', label:'Jodoh', cls:'bg-teal-50 text-teal-700 border-teal-200' },
            { key:'Esai', label:'Esai', cls:'bg-rose-50 text-rose-700 border-rose-200' },
          ];
          return typeDef.map(({key,label,cls}) => {
            const cfg = tc[key] || { enabled:true, max:0 };
            if (cfg.enabled === false) return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-400 border border-slate-200 line-through opacity-60">${label}</span>`;
            const max = parseInt(cfg.max) || 0;
            return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${cls}">${label}${max>0?':'+max:''}</span>`;
          }).join('');
        })();

        const isCardChecked = (window._selectedExams && window._selectedExams.has(String(exam.id))) ? 'checked' : '';
        return `
          <div class="ex-card ${isCardChecked ? 'ex-card-selected' : ''}">
            <div class="ex-card-head">
              ${isAdmin ? `<input type="checkbox" class="ex-row-check w-4 h-4 rounded border-slate-300 cursor-pointer accent-red-500 flex-shrink-0 mt-1"
                value="${escAttr(exam.id)}" ${isCardChecked} onchange="examToggleSelect('${escAttr(exam.id)}', this)">` : ''}
              <div class="ex-card-avatar">${escHtml(initial)}</div>
              <div class="flex-1 min-w-0">
                <div class="ex-card-title">${escHtml(exam.subject || '-')}</div>
                <div class="ex-card-sub">
                  <span class="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold text-slate-600">${escHtml(exam.class)}</span>
                  ${statusPill(exam)}
                </div>
              </div>
            </div>
            <div class="ex-card-body">
              <div class="ex-card-row"><i class="far fa-calendar-alt"></i><span><b>Mulai:</b> ${escHtml(exam.dateStr || '-')}</span></div>
              <div class="ex-card-row"><i class="far fa-calendar-check"></i><span><b>Selesai:</b> ${escHtml(endDateDisplay)}</span></div>
              <div class="ex-card-row"><i class="far fa-clock"></i><span><b>${parseInt(exam.duration)||0}</b> menit${parseFloat(exam.passingGrade)>0?` · <b>KKM</b> ${exam.passingGrade}`:''}</span></div>
              <div class="ex-card-row">
                <i class="fas fa-key"></i>
                <span class="ex-pin" style="font-size:12px;padding:3px 8px;letter-spacing:2px;">
                  ${escHtml(exam.pin)}
                  <button class="ex-pin-copy" onclick="examCopyPin('${escAttr(exam.pin)}', this)" title="Salin"><i class="far fa-copy"></i></button>
                </span>
              </div>
            </div>
            <div class="ex-card-types">${tcBadges}</div>
            ${isAdmin ? `
              <div class="ex-card-foot">
                <button class="ex-action-btn ex-action-edit" onclick='openExamModalById("${escAttr(exam.id)}")' title="Edit"><i class="fas fa-pen-to-square"></i></button>
                <div class="flex gap-2">
                  <button class="ex-action-btn ex-action-dup" onclick='duplicateExam("${escAttr(exam.id)}")' title="Duplikat"><i class="fas fa-clone"></i></button>
                  <button onclick="switchStatus('${escAttr(exam.id)}', '${escAttr(exam.status)}')" class="text-xs px-3 py-1.5 rounded-lg font-bold border transition ${liveStatus(exam) === 'aktif' || liveStatus(exam) === 'live' ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}">
                    ${liveStatus(exam) === 'aktif' || liveStatus(exam) === 'live' ? '<i class="fas fa-pause"></i> Nonaktifkan' : '<i class="fas fa-power-off"></i> Aktifkan'}
                  </button>
                  <button class="ex-action-btn ex-action-del" onclick="handleDeleteExam('${escAttr(exam.id)}')" title="Hapus"><i class="fas fa-trash-can"></i></button>
                </div>
              </div>` : ''}
          </div>
        `;
      }).join('')}
      <div class="bg-white rounded-xl border border-slate-200 mt-1">
        ${_examPaginationHtml(filtered.length, ui.page, totalPages)}
      </div>
    </div>
  `;

  container.innerHTML = `<div class="ex-page fade-in">${headerHtml}${tableHtml}${cardsHtml}</div>`;

  if (!document.getElementById('examModal')) {
    initExamModalComponent();
  }
}

// ───────────── Pagination block ─────────────
function _examPaginationHtml(total, page, totalPages) {
  if (totalPages <= 1) {
    return `<div class="ex-pagination">
      <span>Menampilkan <b class="text-slate-700">${total}</b> jadwal</span>
    </div>`;
  }
  // Build window of page numbers around current
  const ws = Math.max(1, page - 2);
  const we = Math.min(totalPages, page + 2);
  let nums = '';
  if (ws > 1) nums += `<button class="ex-page-btn" onclick="examUISetPage(1)">1</button>` + (ws > 2 ? '<span class="text-slate-400">…</span>' : '');
  for (let p = ws; p <= we; p++) {
    nums += `<button class="ex-page-btn ${p===page?'active':''}" onclick="examUISetPage(${p})">${p}</button>`;
  }
  if (we < totalPages) nums += (we < totalPages - 1 ? '<span class="text-slate-400">…</span>' : '') + `<button class="ex-page-btn" onclick="examUISetPage(${totalPages})">${totalPages}</button>`;

  return `
    <div class="ex-pagination">
      <span>Halaman <b>${page}</b> dari <b>${totalPages}</b> · ${total} jadwal</span>
      <div class="ex-pagination-btns">
        <button class="ex-page-btn" onclick="examUISetPage(${page-1})" ${page<=1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
        ${nums}
        <button class="ex-page-btn" onclick="examUISetPage(${page+1})" ${page>=totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
  `;
}

// ───────────── Filter / sort / paging actions ─────────────
// FIX: debounce timer untuk search agar tidak rebuild DOM setiap keystroke
var _examSearchDebounceTimer = null;

function examUISetFilter(key, value) {
  const ui = window._examUI;
  if (!ui) return;

  // FIX: toggle hanya berlaku untuk 'status'; select & search langsung set
  if (key === 'status') {
    ui.filterStatus = (ui.filterStatus === value && value !== '') ? '' : (value || '');
  } else if (key === 'subject') {
    ui.filterSubject = value || '';
  } else if (key === 'class') {
    ui.filterClass = value || '';
  } else if (key === 'search') {
    ui.search = value || '';
  }
  ui.page = 1;

  // FIX: debounce 280ms untuk search; langsung render untuk filter lain
  if (key === 'search') {
    clearTimeout(_examSearchDebounceTimer);
    // Update clear-button visibility immediately (tanpa full re-render)
    const clr = document.getElementById('ex-search-clear-btn');
    if (clr) clr.classList.toggle('show', !!(value && value.length > 0));
    _examSearchDebounceTimer = setTimeout(function() {
      const wasFocused = document.activeElement && document.activeElement.id === 'ex-search-input';
      const caretPos   = wasFocused ? (document.activeElement.selectionStart || 0) : null;
      renderExamForm(document.getElementById('admin-content'));
      if (wasFocused) {
        const inp = document.getElementById('ex-search-input');
        if (inp) {
          inp.focus();
          try { inp.setSelectionRange(caretPos, caretPos); } catch(e) {}
        }
      }
    }, 280);
  } else {
    renderExamForm(document.getElementById('admin-content'));
  }
}

function examUIResetFilters() {
  if (!window._examUI) return;
  Object.assign(window._examUI, {
    filterStatus:'', filterClass:'', filterSubject:'', search:'', page:1
  });
  clearTimeout(_examSearchDebounceTimer);
  renderExamForm(document.getElementById('admin-content'));
}
function examUISetSort(key) {
  const ui = window._examUI;
  if (!ui) return;
  if (ui.sortBy === key) ui.sortDir = (ui.sortDir === 'asc') ? 'desc' : 'asc';
  else { ui.sortBy = key; ui.sortDir = 'asc'; }
  renderExamForm(document.getElementById('admin-content'));
}
function examUISetPage(p) {
  const ui = window._examUI;
  if (!ui) return;
  ui.page = Math.max(1, parseInt(p) || 1);
  renderExamForm(document.getElementById('admin-content'));
  // Smooth scroll to top of content
  const c = document.getElementById('admin-content');
  if (c) c.scrollTo({ top: 0, behavior: 'smooth' });
}

// PIN copy
function examCopyPin(pin, btn) {
  if (!pin) return;
  const showOk = () => {
    if (btn) {
      const ico = btn.querySelector('i');
      if (ico) {
        const prev = ico.className;
        ico.className = 'fas fa-check';
        setTimeout(() => { ico.className = prev; }, 1200);
      }
    }
    const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1400, timerProgressBar:true });
    Toast.fire({ icon:'success', title:`PIN ${pin} disalin` });
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(String(pin)).then(showOk).catch(() => _examFallbackCopy(String(pin), showOk));
  } else {
    _examFallbackCopy(String(pin), showOk);
  }
}
function _examFallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); cb && cb(); } catch(e) {}
  document.body.removeChild(ta);
}

// Open modal by id (avoids embedding raw JSON in onclick attributes)
function openExamModalById(examId) {
  const exam = (cachedExams || []).find(e => String(e.id) === String(examId));
  if (!exam) {
    Swal.fire({ icon:'error', title:'Data tidak ditemukan', customClass:{popup:'lp-swal'} });
    return;
  }
  openExamModal(exam);
}

// Duplicate an exam (open modal pre-filled but as new)
function duplicateExam(examId) {
  if (!currentUser || currentUser.role !== 'Admin') {
    Swal.fire({
      title: 'Akses Ditolak',
      html: '<p style="font-size:13px;color:#475569;">Hanya <b>Administrator</b> yang dapat menduplikasi jadwal ujian.</p>',
      icon:'error', confirmButtonColor:'#dc2626',
      customClass:{popup:'lp-swal'}
    });
    return;
  }
  const exam = (cachedExams || []).find(e => String(e.id) === String(examId));
  if (!exam) return;
  const clone = JSON.parse(JSON.stringify(exam));
  delete clone.id;                                      // -> creates new
  clone.subject  = exam.subject;
  clone.pin      = String(Math.floor(10000 + Math.random()*90000));
  // Push start to "now+1h" and keep duration
  const now = new Date();
  const startIso = new Date(now.getTime() + 60 * 60 * 1000);
  const endIso   = new Date(startIso.getTime() + (parseInt(exam.duration) || 60) * 60 * 1000);
  clone.date    = startIso.toISOString();
  clone.endDate = endIso.toISOString();
  clone.status  = 'Non-Aktif';
  openExamModal(clone);
  // Inform user
  setTimeout(() => {
    const Toast = Swal.mixin({ toast:true, position:'top', showConfirmButton:false, timer:2200, timerProgressBar:true });
    Toast.fire({ icon:'info', title:'Duplikat dibuat — sesuaikan waktu lalu simpan' });
  }, 350);
}

function initExamModalComponent() {
  if (!document.getElementById('examModal')) {
    const modalHtml = `
      <div id="examModal" class="fixed inset-0 z-[100] hidden items-center justify-center p-3 sm:p-4">
         <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="closeExamModal()"></div>

         <div class="relative exm-modal-wrap bg-white rounded-2xl shadow-2xl flex flex-col animate-[fadeIn_0.25s_ease-out] z-[101]">

             <div class="px-4 sm:px-6 py-3.5 border-b flex justify-between items-center bg-slate-50 shrink-0 rounded-t-2xl">
                 <h3 class="font-bold text-base sm:text-lg text-slate-800 flex items-center gap-2 min-w-0">
                     <i class="far fa-calendar-alt text-blue-600 flex-shrink-0"></i>
                     <span id="examModalTitle" class="truncate">Jadwal Ujian</span>
                 </h3>
                 <button type="button" onclick="closeExamModal()" class="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition focus:outline-none flex-shrink-0" aria-label="Tutup">
                     <i class="fas fa-times"></i>
                 </button>
             </div>

             <div class="overflow-y-auto p-4 sm:p-6 custom-scrollbar" style="flex:1 1 auto;">
                 <form id="examForm" onsubmit="handleExamSubmit(event)" class="space-y-3" novalidate>
                     <input type="hidden" name="examId" id="input-examId">

                     <!-- SECTION 1: BASIC INFO -->
                     <div class="exm-section">
                       <div class="exm-section-head">
                         <i class="fas fa-info-circle text-blue-500"></i>
                         <span>Informasi Dasar</span>
                       </div>
                       <div class="exm-section-body">
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-subject">Mata Pelajaran</label>
                             <select name="subject" id="input-subject" class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white text-slate-700" required>
                               <option value="">-- Pilih Mapel --</option>
                             </select>
                           </div>
                           <div>
                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1">
                               Pilih Kelas <span class="text-slate-400 font-normal normal-case">(centang ≥ 1 kelas)</span>
                             </label>
                             <div id="input-class-container" class="max-h-32 overflow-y-auto p-2.5 bg-slate-50 border border-slate-300 rounded-lg space-y-1.5">
                               <p class="text-xs text-slate-400">Memuat daftar kelas...</p>
                             </div>
                             <p id="exm-class-helper" class="exm-helper" style="display:none;"></p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <!-- SECTION 2: TIME & DURATION -->
                     <div class="exm-section">
                       <div class="exm-section-head">
                         <i class="far fa-clock text-blue-500"></i>
                         <span>Waktu & Durasi</span>
                       </div>
                       <div class="exm-section-body">
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-date">Waktu Mulai</label>
                             <input type="datetime-local" name="date" id="input-date" oninput="examTimeChanged()"
                               class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-600" required>
                           </div>
                           <div>
                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-endDate">Waktu Selesai</label>
                             <input type="datetime-local" name="endDate" id="input-endDate" oninput="examTimeChanged()"
                               class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm text-slate-600" required>
                           </div>
                         </div>
                         <p id="exm-time-helper" class="exm-helper" style="display:none;"></p>

                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                           <div>
                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-duration">Durasi (Menit)</label>
                             <div class="relative">
                               <span class="absolute left-3 top-2.5 text-slate-400"><i class="far fa-clock"></i></span>
                               <input type="number" name="duration" id="input-duration" min="1" max="600"
                                 oninput="examTimeChanged()"
                                 class="pl-9 w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" placeholder="60" required>
                             </div>
                             <div id="exm-suggested-duration" class="exm-suggested" style="display:none;"
                               onclick="examApplySuggestedDuration()" role="button" tabindex="0">
                               <i class="fas fa-bolt"></i> <span></span>
                             </div>
                           </div>
                           <div>
                             <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-passing-grade">
                               <i class="fas fa-award text-emerald-500 mr-1"></i>Passing Grade (KKM)
                             </label>
                             <div class="relative">
                               <span class="absolute left-3 top-2.5 text-emerald-500"><i class="fas fa-percent"></i></span>
                               <input type="number" name="passingGrade" id="input-passing-grade" min="0" max="100"
                                 class="pl-9 w-full border border-emerald-200 bg-emerald-50 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition text-sm"
                                 placeholder="0 = tidak digunakan" value="0">
                             </div>
                             <p class="exm-helper">0 berarti KKM tidak diaktifkan.</p>
                           </div>
                         </div>
                       </div>
                     </div>

                     <!-- SECTION 3: PIN -->
                     <div class="exm-section">
                       <div class="exm-section-head">
                         <i class="fas fa-key text-yellow-500"></i>
                         <span>PIN Sesi Ujian</span>
                       </div>
                       <div class="exm-section-body">
                         <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-pin">PIN (5–8 digit, angka saja)</label>
                         <div class="exm-pin-wrap">
                           <input type="text" name="pin" id="input-pin" inputmode="numeric" pattern="[0-9]{5,8}" maxlength="8" required
                             class="w-full bg-yellow-50 border border-yellow-200 p-2.5 pr-12 rounded-lg font-mono tracking-widest font-bold focus:ring-2 focus:ring-yellow-400 outline-none transition text-slate-800 text-base text-center" placeholder="••••••">
                           <button type="button" class="exm-pin-regen" onclick="examRegenPin()" title="Buat PIN acak baru">
                             <i class="fas fa-rotate"></i>
                           </button>
                         </div>
                         <p class="exm-helper"><i class="fas fa-info-circle"></i> PIN akan dibagikan ke siswa untuk membuka ujian.</p>
                       </div>
                     </div>

                     <!-- SECTION 4: SHUFFLE -->
                     <div class="exm-section">
                       <div class="exm-section-head">
                         <i class="fas fa-random text-indigo-500"></i>
                         <span>Pengacakan Soal per Tipe</span>
                       </div>
                       <div class="exm-section-body">
                         <p class="text-xs text-slate-500 mb-3">Aktifkan untuk mengacak urutan soal saat siswa memulai ujian.</p>
                         <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                           <label class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                             <span class="text-xs font-semibold text-slate-600"><i class="fas fa-list-ul mr-1 text-blue-400"></i>Pilihan Ganda (PG)</span>
                             <div class="relative inline-flex">
                               <input type="checkbox" id="shuffle-PG" class="sr-only peer">
                               <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200"></div>
                               <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                             </div>
                           </label>
                           <label class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                             <span class="text-xs font-semibold text-slate-600"><i class="fas fa-list-check mr-1 text-purple-400"></i>PG Kompleks</span>
                             <div class="relative inline-flex">
                               <input type="checkbox" id="shuffle-PG_KOMPLEKS" class="sr-only peer">
                               <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200"></div>
                               <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                             </div>
                           </label>
                           <label class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                             <span class="text-xs font-semibold text-slate-600"><i class="fas fa-check-double mr-1 text-green-400"></i>Benar/Salah (BS)</span>
                             <div class="relative inline-flex">
                               <input type="checkbox" id="shuffle-BS" class="sr-only peer">
                               <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200"></div>
                               <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                             </div>
                           </label>
                           <label class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                             <span class="text-xs font-semibold text-slate-600"><i class="fas fa-link mr-1 text-orange-400"></i>Menjodohkan</span>
                             <div class="relative inline-flex">
                               <input type="checkbox" id="shuffle-JODOH" class="sr-only peer">
                               <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200"></div>
                               <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                             </div>
                           </label>
                           <label class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer sm:col-span-2">
                             <span class="text-xs font-semibold text-slate-600"><i class="fas fa-pen-nib mr-1 text-rose-400"></i>Esai</span>
                             <div class="relative inline-flex">
                               <input type="checkbox" id="shuffle-Esai" class="sr-only peer">
                               <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200"></div>
                               <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                             </div>
                           </label>
                         </div>
                       </div>
                     </div>

                     <!-- SECTION 5: TYPE CONFIG -->
                     <div class="exm-section" style="border-color:#ddd6fe;">
                       <div class="exm-section-head" style="background:#f5f3ff;border-color:#ddd6fe;color:#5b21b6;">
                         <i class="fas fa-filter text-purple-500"></i>
                         <span>Izin Tipe Soal & Batas Maksimal</span>
                       </div>
                       <div class="exm-section-body">
                         <p class="text-xs text-slate-500 mb-3">Aktifkan tipe soal yang boleh dibuat guru. <b>Maks: 0</b> = tidak dibatasi.</p>

                         <div class="space-y-2">
                           <!-- PG -->
                           <div class="typeconfig-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-lg border border-blue-100 bg-blue-50/40 transition" id="typerow-PG">
                             <div class="flex items-center gap-3 min-w-0">
                               <label class="relative inline-flex cursor-pointer flex-shrink-0">
                                 <input type="checkbox" id="typeconfig-enabled-PG" checked class="sr-only peer" onchange="toggleTypeMaxInput('PG', this.checked)">
                                 <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 transition-colors duration-200"></div>
                                 <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                               </label>
                               <span class="text-xs font-semibold text-slate-600 truncate"><i class="fas fa-list-ul mr-1.5 text-blue-400"></i>Pilihan Ganda (PG)</span>
                             </div>
                             <div class="flex items-center gap-2 flex-wrap">
                               <div class="flex items-center gap-1.5 flex-shrink-0" id="typeconfig-optcount-wrapper-PG">
                                 <span class="text-[10px] text-slate-400 whitespace-nowrap">Opsi:</span>
                                 <input type="number" id="typeconfig-optcount-PG" min="2" max="6" value="5"
                                   class="w-14 text-center border border-blue-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-400 outline-none transition">
                               </div>
                               <div class="flex items-center gap-1.5 flex-shrink-0">
                                 <span class="text-[10px] text-slate-400 whitespace-nowrap">Maks:</span>
                                 <input type="number" id="typeconfig-max-PG" min="0" value="0"
                                   class="w-16 text-center border border-blue-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-400 outline-none transition">
                                 <span class="text-[10px] text-slate-400 whitespace-nowrap">soal</span>
                               </div>
                             </div>
                           </div>

                           <!-- PG Kompleks -->
                           <div class="typeconfig-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 transition" id="typerow-PG_KOMPLEKS">
                             <div class="flex items-center gap-3 min-w-0">
                               <label class="relative inline-flex cursor-pointer flex-shrink-0">
                                 <input type="checkbox" id="typeconfig-enabled-PG_KOMPLEKS" checked class="sr-only peer" onchange="toggleTypeMaxInput('PG_KOMPLEKS', this.checked)">
                                 <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors duration-200"></div>
                                 <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                               </label>
                               <span class="text-xs font-semibold text-slate-600 truncate"><i class="fas fa-list-check mr-1.5 text-indigo-400"></i>PG Kompleks</span>
                             </div>
                             <div class="flex items-center gap-2 flex-wrap">
                               <div class="flex items-center gap-1.5 flex-shrink-0" id="typeconfig-optcount-wrapper-PG_KOMPLEKS">
                                 <span class="text-[10px] text-slate-400 whitespace-nowrap">Opsi:</span>
                                 <input type="number" id="typeconfig-optcount-PG_KOMPLEKS" min="2" max="6" value="5"
                                   class="w-14 text-center border border-indigo-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition">
                               </div>
                               <div class="flex items-center gap-1.5 flex-shrink-0">
                                 <span class="text-[10px] text-slate-400 whitespace-nowrap">Maks:</span>
                                 <input type="number" id="typeconfig-max-PG_KOMPLEKS" min="0" value="0"
                                   class="w-16 text-center border border-indigo-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition">
                                 <span class="text-[10px] text-slate-400 whitespace-nowrap">soal</span>
                               </div>
                             </div>
                           </div>

                           <!-- Benar/Salah -->
                           <div class="typeconfig-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-lg border border-orange-100 bg-orange-50/40 transition" id="typerow-BS">
                             <div class="flex items-center gap-3 min-w-0">
                               <label class="relative inline-flex cursor-pointer flex-shrink-0">
                                 <input type="checkbox" id="typeconfig-enabled-BS" checked class="sr-only peer" onchange="toggleTypeMaxInput('BS', this.checked)">
                                 <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 transition-colors duration-200"></div>
                                 <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                               </label>
                               <span class="text-xs font-semibold text-slate-600 truncate"><i class="fas fa-check-double mr-1.5 text-orange-400"></i>Benar/Salah (BS)</span>
                             </div>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Maks:</span>
                               <input type="number" id="typeconfig-max-BS" min="0" value="0"
                                 class="w-16 text-center border border-orange-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-orange-400 outline-none transition">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">soal</span>
                             </div>
                           </div>

                           <!-- Menjodohkan -->
                           <div class="typeconfig-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-lg border border-teal-100 bg-teal-50/40 transition" id="typerow-JODOH">
                             <div class="flex items-center gap-3 min-w-0">
                               <label class="relative inline-flex cursor-pointer flex-shrink-0">
                                 <input type="checkbox" id="typeconfig-enabled-JODOH" checked class="sr-only peer" onchange="toggleTypeMaxInput('JODOH', this.checked)">
                                 <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-teal-500 transition-colors duration-200"></div>
                                 <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                               </label>
                               <span class="text-xs font-semibold text-slate-600 truncate"><i class="fas fa-link mr-1.5 text-teal-400"></i>Menjodohkan</span>
                             </div>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Maks:</span>
                               <input type="number" id="typeconfig-max-JODOH" min="0" value="0"
                                 class="w-16 text-center border border-teal-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-teal-400 outline-none transition">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">soal</span>
                             </div>
                           </div>

                           <!-- Esai -->
                           <div class="typeconfig-row flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2.5 rounded-lg border border-rose-100 bg-rose-50/40 transition" id="typerow-Esai">
                             <div class="flex items-center gap-3 min-w-0">
                               <label class="relative inline-flex cursor-pointer flex-shrink-0">
                                 <input type="checkbox" id="typeconfig-enabled-Esai" checked class="sr-only peer" onchange="toggleTypeMaxInput('Esai', this.checked)">
                                 <div class="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-rose-500 transition-colors duration-200"></div>
                                 <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform duration-200"></div>
                               </label>
                               <span class="text-xs font-semibold text-slate-600 truncate"><i class="fas fa-pen-nib mr-1.5 text-rose-400"></i>Esai</span>
                             </div>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Maks:</span>
                               <input type="number" id="typeconfig-max-Esai" min="0" value="0"
                                 class="w-16 text-center border border-rose-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-rose-400 outline-none transition">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">soal</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                     <!-- SECTION 6: JADWAL INPUT BYPASS -->
                     <div class="exm-section" style="border-color:#fecdd3;">
                       <div class="exm-section-head" style="background:#fff1f2;border-color:#fecdd3;color:#be123c;">
                         <i class="fas fa-unlock-alt text-rose-500"></i>
                         <span>Pengecualian Jadwal Input Soal</span>
                       </div>
                       <div class="exm-section-body">
                         <label class="flex items-center gap-3 p-3 border border-rose-100 bg-rose-50/50 rounded-lg cursor-pointer hover:bg-rose-50 transition">
                           <div class="relative inline-flex flex-shrink-0">
                             <input type="checkbox" id="input-bypass-period" class="sr-only peer">
                             <div class="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-rose-500 transition-colors duration-200"></div>
                             <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform duration-200"></div>
                           </div>
                           <div class="flex flex-col">
                             <span class="text-xs font-bold text-slate-700">Izinkan Bypass Jadwal Global</span>
                             <span class="text-[10px] text-slate-500 leading-tight mt-0.5">Guru tetap bisa menambah/edit soal pada ujian ini meskipun jadwal input soal global sedang ditutup.</span>
                           </div>
                         </label>
                       </div>
                     </div>

                     <!-- SECTION 7: POIN DEFAULT TIPE SOAL -->
                     <div class="exm-section" style="border-color:#bfdbfe;">
                       <div class="exm-section-head" style="background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8;">
                         <i class="fas fa-star text-blue-500"></i>
                         <span>Poin Default per Tipe Soal</span>
                       </div>
                       <div class="exm-section-body">
                         <p class="text-xs text-slate-500 mb-3">
                           Nilai poin ini akan otomatis menjadi nilai awal saat soal baru dibuat.
                           Poin yang sudah disimpan pada soal tidak akan berubah.
                         </p>
                         <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">

                           <!-- PG -->
                           <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-blue-100 bg-blue-50/40">
                             <span class="text-xs font-semibold text-slate-600 truncate">
                               <i class="fas fa-list-ul mr-1.5 text-blue-400"></i>Pilihan Ganda (PG)
                             </span>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Poin:</span>
                               <input type="number" id="typeconfig-defaultpoint-PG"
                                 min="0.1" step="0.1" value="1"
                                 class="w-16 text-center border border-blue-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-blue-400 outline-none transition">
                             </div>
                           </div>

                           <!-- PG Kompleks -->
                           <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40">
                             <span class="text-xs font-semibold text-slate-600 truncate">
                               <i class="fas fa-list-check mr-1.5 text-indigo-400"></i>PG Kompleks
                             </span>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Poin:</span>
                               <input type="number" id="typeconfig-defaultpoint-PG_KOMPLEKS"
                                 min="0.1" step="0.1" value="1"
                                 class="w-16 text-center border border-indigo-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition">
                             </div>
                           </div>

                           <!-- Benar/Salah -->
                           <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-orange-100 bg-orange-50/40">
                             <span class="text-xs font-semibold text-slate-600 truncate">
                               <i class="fas fa-check-double mr-1.5 text-orange-400"></i>Benar/Salah (BS)
                             </span>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Poin:</span>
                               <input type="number" id="typeconfig-defaultpoint-BS"
                                 min="0.1" step="0.1" value="1"
                                 class="w-16 text-center border border-orange-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-orange-400 outline-none transition">
                             </div>
                           </div>

                           <!-- Menjodohkan -->
                           <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-teal-100 bg-teal-50/40">
                             <span class="text-xs font-semibold text-slate-600 truncate">
                               <i class="fas fa-link mr-1.5 text-teal-400"></i>Menjodohkan
                             </span>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Poin:</span>
                               <input type="number" id="typeconfig-defaultpoint-JODOH"
                                 min="0.1" step="0.1" value="1"
                                 class="w-16 text-center border border-teal-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-teal-400 outline-none transition">
                             </div>
                           </div>

                           <!-- Esai -->
                           <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-rose-100 bg-rose-50/40 sm:col-span-2">
                             <span class="text-xs font-semibold text-slate-600 truncate">
                               <i class="fas fa-pen-nib mr-1.5 text-rose-400"></i>Esai
                             </span>
                             <div class="flex items-center gap-1.5 flex-shrink-0">
                               <span class="text-[10px] text-slate-400 whitespace-nowrap">Poin:</span>
                               <input type="number" id="typeconfig-defaultpoint-Esai"
                                 min="0.1" step="0.1" value="5"
                                 class="w-16 text-center border border-rose-200 rounded-lg p-1.5 text-xs font-bold bg-white focus:ring-2 focus:ring-rose-400 outline-none transition">
                             </div>
                           </div>

                         </div>
                         <p class="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                           <i class="fas fa-info-circle"></i>
                           Berlaku untuk soal <b>baru</b>. Poin soal yang sudah tersimpan tidak berubah.
                         </p>
                       </div>
                     </div>
                 </form>
             </div>

             <!-- Sticky footer with submit -->
             <div class="px-4 sm:px-6 py-3 border-t bg-slate-50 rounded-b-2xl flex items-center justify-end gap-2 shrink-0">
               <button type="button" onclick="closeExamModal()" class="px-4 py-2.5 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition">
                 Batal
               </button>
               <button type="submit" form="examForm" id="btnSaveExam" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition active:scale-95 flex justify-center items-center gap-2">
                 <i class="fas fa-save"></i> Simpan Jadwal
               </button>
             </div>
         </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // FIX: Bind ESC key SEKALI menggunakan named function yang bisa diperiksa
    // agar tidak menumpuk tiap kali renderExamForm memanggil initExamModalComponent.
    if (!window._examModalEscBound) {
      window._examModalEscBound = true;
      document.addEventListener('keydown', function _examModalEscHandler(e) {
        if (e.key !== 'Escape') return;
        const m = document.getElementById('examModal');
        if (m && !m.classList.contains('hidden')) {
          e.stopPropagation(); // jangan tutup modal lain
          closeExamModal();
        }
      });
    }

    // Enforce digits-only on PIN input
    const pinIn = document.getElementById('input-pin');
    if (pinIn) {
      pinIn.addEventListener('input', function() {
        const v = this.value.replace(/\D/g, '').slice(0, 8);
        if (v !== this.value) this.value = v;
      });
    }
  }
}

// PIN regenerator
function examRegenPin() {
  const inp = document.getElementById('input-pin');
  if (!inp) return;
  inp.value = String(Math.floor(10000 + Math.random() * 90000));
  inp.classList.add('ring-2','ring-yellow-400');
  setTimeout(() => inp.classList.remove('ring-2','ring-yellow-400'), 500);
}

// Helper messages on time change
function examTimeChanged() {
  const startEl   = document.getElementById('input-date');
  const endEl     = document.getElementById('input-endDate');
  const durEl     = document.getElementById('input-duration');
  const helper    = document.getElementById('exm-time-helper');
  const sugBox    = document.getElementById('exm-suggested-duration');
  if (!startEl || !endEl || !helper) return;

  const startVal = startEl.value;
  const endVal   = endEl.value;
  if (!startVal || !endVal) {
    helper.style.display = 'none';
    if (sugBox) sugBox.style.display = 'none';
    return;
  }

  const startTs = new Date(startVal).getTime();
  const endTs   = new Date(endVal).getTime();

  if (isNaN(startTs) || isNaN(endTs)) {
    helper.style.display = 'none';
    return;
  }

  if (endTs <= startTs) {
    helper.className = 'exm-helper warn';
    helper.style.display = 'flex';
    helper.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Waktu selesai harus lebih besar dari waktu mulai.';
    if (sugBox) sugBox.style.display = 'none';
    return;
  }

  const totalMinutes = Math.floor((endTs - startTs) / 60000);
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const windowText = (hh > 0 ? `${hh} jam` : '') + (hh > 0 && mm > 0 ? ' ' : '') + (mm > 0 ? `${mm} menit` : '') || '0 menit';
  helper.className = 'exm-helper ok';
  helper.style.display = 'flex';
  helper.innerHTML = `<i class="fas fa-clock"></i> Window ujian terbuka selama <b>${windowText}</b>.`;

  // Suggest duration if it's significantly different from window
  if (sugBox && durEl) {
    const cur = parseInt(durEl.value) || 0;
    // Saran: maks 90 menit atau window penuh, minimal 15 menit.
    // Sebelumnya: Math.min(X, Math.max(15, X)) selalu = X — tidak ada batas atas.
    const suggestion = Math.max(15, Math.min(90, totalMinutes));
    if (cur === 0 || cur > totalMinutes) {
      sugBox.style.display = 'inline-flex';
      const span = sugBox.querySelector('span');
      if (span) span.innerHTML = `Saran durasi: <b>${suggestion} menit</b> — klik untuk terapkan`;
      sugBox.dataset.suggest = String(suggestion);
    } else {
      sugBox.style.display = 'none';
    }
  }
}

function examApplySuggestedDuration() {
  const sugBox = document.getElementById('exm-suggested-duration');
  const durEl  = document.getElementById('input-duration');
  if (!sugBox || !durEl) return;
  const v = parseInt(sugBox.dataset.suggest) || 0;
  if (v > 0) {
    durEl.value = v;
    durEl.classList.add('ring-2','ring-blue-300');
    setTimeout(() => durEl.classList.remove('ring-2','ring-blue-300'), 600);
    examTimeChanged();
  }
}

function closeExamModal() {
  const modal = document.getElementById('examModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function handleExamSubmit(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());

  const selectedClasses = [];
  const classCheckboxes = document.querySelectorAll('#input-class-container input[type="checkbox"]:checked');
  classCheckboxes.forEach(cb => { selectedClasses.push(cb.value); });

  // ── Client-side validation ──
  if (!data.subject) {
    Swal.fire({
      title:'Mata Pelajaran Belum Dipilih',
      html:'<p style="font-size:13px;color:#475569;">Pilih salah satu Mata Pelajaran terlebih dahulu.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  if (selectedClasses.length === 0) {
    Swal.fire({
      title:'Kelas Belum Dipilih',
      html:'<p style="font-size:13px;color:#475569;">Anda harus memilih setidaknya satu kelas.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  const startTs = data.date    ? new Date(data.date).getTime()    : NaN;
  const endTs   = data.endDate ? new Date(data.endDate).getTime() : NaN;
  if (isNaN(startTs) || isNaN(endTs)) {
    Swal.fire({
      title:'Waktu Tidak Valid',
      html:'<p style="font-size:13px;color:#475569;">Masukkan waktu mulai dan waktu selesai yang valid.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  if (endTs <= startTs) {
    Swal.fire({
      title:'Waktu Tidak Valid',
      html:'<p style="font-size:13px;color:#475569;">Waktu selesai harus <b>lebih besar</b> dari waktu mulai.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  const dur = parseInt(data.duration);
  if (!isFinite(dur) || dur <= 0) {
    Swal.fire({
      title:'Durasi Tidak Valid',
      html:'<p style="font-size:13px;color:#475569;">Durasi harus berupa angka lebih besar dari 0.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  const windowMinutes = Math.floor((endTs - startTs) / 60000);
  if (dur > windowMinutes) {
    Swal.fire({
      title:'Durasi Melebihi Window Waktu',
      html:`<p style="font-size:13px;color:#475569;">Durasi <b>${dur} menit</b> melebihi rentang waktu mulai–selesai (<b>${windowMinutes} menit</b>).</p>
            <p style="font-size:12px;color:#64748b;margin-top:6px;">Sesuaikan durasi atau perpanjang waktu selesai.</p>`,
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  if (!/^[0-9]{5,8}$/.test(String(data.pin || ''))) {
    Swal.fire({
      title:'PIN Tidak Valid',
      html:'<p style="font-size:13px;color:#475569;">PIN harus berupa <b>5–8 digit angka</b>.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }

  data.class = selectedClasses.join(',');
  data.shuffleConfig = {
    PG:          document.getElementById('shuffle-PG')?.checked || false,
    PG_KOMPLEKS: document.getElementById('shuffle-PG_KOMPLEKS')?.checked || false,
    BS:          document.getElementById('shuffle-BS')?.checked || false,
    JODOH:       document.getElementById('shuffle-JODOH')?.checked || false,
    Esai:        document.getElementById('shuffle-Esai')?.checked || false
  };
  data.passingGrade = parseFloat(document.getElementById('input-passing-grade')?.value || '0') || 0;
  data.bypassInputPeriod = document.getElementById('input-bypass-period')?.checked || false;

  data.typeConfig = {};
  const _dpFallback = { PG:1, PG_KOMPLEKS:1, BS:1, JODOH:1, Esai:5 };
  ['PG', 'PG_KOMPLEKS', 'BS', 'JODOH', 'Esai'].forEach(t => {
    const enableEl = document.getElementById('typeconfig-enabled-' + t);
    const maxEl    = document.getElementById('typeconfig-max-' + t);
    const optEl    = document.getElementById('typeconfig-optcount-' + t);
    const dpEl     = document.getElementById('typeconfig-defaultpoint-' + t);
    data.typeConfig[t] = {
      enabled:      enableEl ? enableEl.checked : true,
      max:          maxEl    ? (parseInt(maxEl.value) || 0) : 0,
      defaultPoint: dpEl     ? (parseFloat(dpEl.value) || _dpFallback[t]) : _dpFallback[t]
    };
    if (optEl) data.typeConfig[t].optCount = parseInt(optEl.value) || 5;
  });

  // Validate at least one type is enabled
  const anyEnabled = Object.values(data.typeConfig).some(c => c.enabled !== false);
  if (!anyEnabled) {
    Swal.fire({
      title:'Tipe Soal Belum Dipilih',
      html:'<p style="font-size:13px;color:#475569;">Aktifkan minimal satu tipe soal yang diizinkan.</p>',
      icon:'warning', confirmButtonColor:'#2563eb',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }

  closeExamModal();
  document.getElementById('global-loading').classList.remove('hidden');

  const onSuccess = (res) => {
    document.getElementById('global-loading').classList.add('hidden');
    if (res && res.success === false) {
      Swal.fire({
        title:'Gagal Menyimpan',
        html:`<p style="font-size:13px;color:#475569;">${res.message || 'Terjadi kesalahan'}</p>`,
        icon:'error', confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      });
    } else {
      const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
      Toast.fire({ icon:'success', title: data.examId ? 'Jadwal diperbarui' : 'Jadwal dibuat' });
      refreshExamList();
    }
  };
  const onFailure = (err) => {
    document.getElementById('global-loading').classList.add('hidden');
    Swal.fire({
      title:'Error Server',
      html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) ? err.message : err}</p>`,
      icon:'error', confirmButtonColor:'#dc2626',
      customClass:{ popup:'lp-swal' }
    });
  };

  if (data.examId) {
    google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFailure)
      .updateExam(data, currentUser.userID, currentUser.token);
  } else {
    google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFailure)
      .createExam(data, currentUser.userID, currentUser.token);
  }
}

// ───────────── Exam Bulk-Select State ─────────────
if (!window._selectedExams) window._selectedExams = new Set();

function examToggleSelect(examId, checkbox) {
  if (!window._selectedExams) window._selectedExams = new Set();
  if (checkbox.checked) window._selectedExams.add(String(examId));
  else                  window._selectedExams.delete(String(examId));
  _examUpdateBulkBar();
  // sync semua checkbox dengan value yang sama (tabel & card)
  document.querySelectorAll(`.ex-row-check[value="${CSS.escape(String(examId))}"]`).forEach(cb => {
    cb.checked = checkbox.checked;
    const row = cb.closest('tr') || cb.closest('.ex-card');
    if (row) row.classList.toggle('ex-row-selected', checkbox.checked);
    if (row) row.classList.toggle('ex-card-selected', checkbox.checked);
  });
}

function examToggleSelectAll(checked) {
  if (!window._selectedExams) window._selectedExams = new Set();
  document.querySelectorAll('.ex-row-check').forEach(cb => {
    cb.checked = checked;
    const id = String(cb.value);
    if (checked) window._selectedExams.add(id);
    else         window._selectedExams.delete(id);
    const row = cb.closest('tr') || cb.closest('.ex-card');
    if (row) row.classList.toggle('ex-row-selected', checked);
    if (row) row.classList.toggle('ex-card-selected', checked);
  });
  _examUpdateBulkBar();
}

function examClearSelection() {
  if (window._selectedExams) window._selectedExams.clear();
  document.querySelectorAll('.ex-row-check').forEach(cb => {
    cb.checked = false;
    const row = cb.closest('tr') || cb.closest('.ex-card');
    if (row) { row.classList.remove('ex-row-selected'); row.classList.remove('ex-card-selected'); }
  });
  const all = document.getElementById('ex-check-all');
  if (all) { all.checked = false; all.indeterminate = false; }
  _examUpdateBulkBar();
}

function _examUpdateBulkBar() {
  const sel   = window._selectedExams || new Set();
  const count = sel.size;
  const bar   = document.getElementById('ex-bulk-bar');
  const badge = document.getElementById('ex-bulk-count');
  if (bar)   { bar.classList.toggle('hidden', count === 0); bar.classList.toggle('flex', count > 0); }
  if (badge) badge.textContent = count;

  // Sync header checkbox state
  const all   = document.getElementById('ex-check-all');
  const total = document.querySelectorAll('.ex-row-check').length;
  if (all) {
    all.indeterminate = (count > 0 && count < total);
    all.checked       = (total > 0 && count === total);
  }
}

function handleBulkDeleteExams() {
  if (!currentUser || currentUser.role !== 'Admin') {
    Swal.fire({ title:'Akses Ditolak', html:'<p style="font-size:13px;color:#475569;">Hanya <b>Administrator</b> yang dapat menghapus jadwal ujian.</p>', icon:'error', confirmButtonColor:'#dc2626', customClass:{popup:'lp-swal'} });
    return;
  }
  const ids = Array.from(window._selectedExams || []);
  if (ids.length === 0) return;

  Swal.fire({
    title: `Hapus ${ids.length} Jadwal?`,
    html: `<p style="font-size:13px;color:#475569;"><span class="font-bold text-red-600">${ids.length} jadwal ujian</span> yang dipilih akan <b>dihapus permanen</b>.</p>
           <p style="font-size:12px;color:#dc2626;margin-top:8px;background:#fef2f2;padding:8px 12px;border-radius:8px;border:1px solid #fecaca;">
             <i class="fas fa-triangle-exclamation"></i> Data nilai dan respons siswa terkait juga dapat hilang. Tindakan ini tidak dapat dibatalkan.
           </p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: `<i class="fas fa-trash-alt" style="margin-right:6px;"></i> Ya, Hapus ${ids.length} Jadwal`,
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(result => {
    if (!result.isConfirmed) return;
    document.getElementById('global-loading').classList.remove('hidden');
    google.script.run
      .withSuccessHandler(res => {
        document.getElementById('global-loading').classList.add('hidden');
        if (res && res.success) {
          window._selectedExams.clear();
          const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2000, timerProgressBar:true });
          Toast.fire({ icon:'success', title:`${res.deleted} jadwal dihapus` });
          refreshExamList();
        } else {
          Swal.fire({ title:'Gagal Menghapus', html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`, icon:'error', confirmButtonColor:'#dc2626', customClass:{popup:'lp-swal'} });
        }
      })
      .withFailureHandler(err => {
        document.getElementById('global-loading').classList.add('hidden');
        Swal.fire({ title:'Error Server', html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) ? err.message : String(err)}</p>`, icon:'error', confirmButtonColor:'#dc2626', customClass:{popup:'lp-swal'} });
      })
      .deleteExamsBulk(ids, currentUser.userID, currentUser.token);
  });
}

function handleDeleteAllExams() {
  if (!currentUser || currentUser.role !== 'Admin') {
    Swal.fire({ title:'Akses Ditolak', html:'<p style="font-size:13px;color:#475569;">Hanya <b>Administrator</b> yang dapat menghapus jadwal ujian.</p>', icon:'error', confirmButtonColor:'#dc2626', customClass:{popup:'lp-swal'} });
    return;
  }
  // Ambil semua ID dari filter yang sedang aktif (bukan semua cachedExams)
  const ui = window._examUI || {};
  const exams = Array.isArray(cachedExams) ? cachedExams : [];
  const now   = Date.now();
  // FIX: gunakan _examLiveStatus_ yang dibagi (helper global) agar konsisten
  // dengan filter yang ditampilkan di tabel. Duplikasi _lsLocal dihapus.
  let filtered = exams.filter(e => {
    if (ui.filterStatus) {
      const s = _examLiveStatus_(e, now);
      if (ui.filterStatus === 'aktif'    && !(s === 'aktif' || s === 'live'))        return false;
      if (ui.filterStatus === 'nonaktif' && !(s === 'nonaktif' || s === 'ended'))    return false;
      if (ui.filterStatus === 'live'     && s !== 'live')     return false;
      if (ui.filterStatus === 'upcoming' && s !== 'upcoming') return false;
      if (ui.filterStatus === 'ended'    && s !== 'ended')    return false;
    }
    if (ui.filterSubject && e.subject !== ui.filterSubject) return false;
    if (ui.filterClass) {
      const list = String(e.class || '').split(',').map(c => c.trim());
      if (!list.includes(ui.filterClass)) return false;
    }
    if (ui.search) {
      const q   = ui.search.toLowerCase();
      const hay = [e.subject, e.class, e.pin, e.dateStr, e.endDateStr, e.duration].map(v => String(v||'').toLowerCase()).join(' | ');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const ids = filtered.map(e => e.id);
  if (ids.length === 0) {
    Swal.fire({ icon:'info', title:'Tidak ada jadwal', text:'Tidak ada jadwal yang tampil untuk dihapus.', customClass:{popup:'lp-swal'} });
    return;
  }

  const isFiltered = !!(ui.filterStatus || ui.filterSubject || ui.filterClass || ui.search);
  const desc = isFiltered
    ? `<b>${ids.length} jadwal</b> yang cocok dengan filter aktif`
    : `<b>semua ${ids.length} jadwal ujian</b>`;

  Swal.fire({
    title: 'Hapus Semua Jadwal?',
    html: `<p style="font-size:13px;color:#475569;">Anda akan menghapus ${desc}.</p>
           <p style="font-size:12px;color:#dc2626;margin-top:8px;background:#fef2f2;padding:8px 12px;border-radius:8px;border:1px solid #fecaca;">
             <i class="fas fa-triangle-exclamation"></i> Data nilai dan respons siswa terkait juga dapat hilang. Tindakan ini <b>tidak dapat dibatalkan</b>.
           </p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: `<i class="fas fa-trash-can" style="margin-right:6px;"></i> Ya, Hapus Semua (${ids.length})`,
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(result => {
    if (!result.isConfirmed) return;
    document.getElementById('global-loading').classList.remove('hidden');
    google.script.run
      .withSuccessHandler(res => {
        document.getElementById('global-loading').classList.add('hidden');
        if (res && res.success) {
          if (window._selectedExams) window._selectedExams.clear();
          const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2000, timerProgressBar:true });
          Toast.fire({ icon:'success', title:`${res.deleted} jadwal dihapus` });
          refreshExamList();
        } else {
          Swal.fire({ title:'Gagal Menghapus', html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`, icon:'error', confirmButtonColor:'#dc2626', customClass:{popup:'lp-swal'} });
        }
      })
      .withFailureHandler(err => {
        document.getElementById('global-loading').classList.add('hidden');
        Swal.fire({ title:'Error Server', html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) ? err.message : String(err)}</p>`, icon:'error', confirmButtonColor:'#dc2626', customClass:{popup:'lp-swal'} });
      })
      .deleteExamsBulk(ids, currentUser.userID, currentUser.token);
  });
}

function handleDeleteExam(examId) {
  if (!currentUser || currentUser.role !== 'Admin') {
    Swal.fire({
      title: 'Akses Ditolak',
      html: '<p style="font-size:13px;color:#475569;">Hanya <b>Administrator</b> yang dapat menghapus jadwal ujian.</p>',
      icon: 'error', confirmButtonColor: '#dc2626',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }

  const exam = (cachedExams || []).find(e => String(e.id) === String(examId));
  const subj = exam ? `<b>${exam.subject}</b> (${exam.class})` : 'jadwal ini';

  Swal.fire({
    title: 'Hapus Jadwal Ujian?',
    html: `<p style="font-size:13px;color:#475569;">Anda akan menghapus ${subj}.</p>
           <p style="font-size:12px;color:#dc2626;margin-top:8px;background:#fef2f2;padding:8px 12px;border-radius:8px;border:1px solid #fecaca;">
             <i class="fas fa-triangle-exclamation"></i> Data nilai dan respons siswa terkait ujian ini juga dapat hilang. Tindakan ini tidak dapat dibatalkan.
           </p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fas fa-trash-can" style="margin-right:6px;"></i> Ya, Hapus Permanen',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then((result) => {
    if (result.isConfirmed) {
      document.getElementById('global-loading').classList.remove('hidden');

      google.script.run
        .withSuccessHandler(res => {
          document.getElementById('global-loading').classList.add('hidden');
          // BUG FIX #11: tambahkan null-check — res bisa null jika server error
          if (res && res.success) {
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1800, timerProgressBar: true });
            Toast.fire({ icon: 'success', title: 'Jadwal ujian dihapus' });
            refreshExamList();
          } else {
            Swal.fire({
              title: 'Gagal Menghapus', html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
              icon: 'error', confirmButtonColor: '#dc2626',
              customClass: { popup: 'lp-swal' }
            });
          }
        })
        .withFailureHandler(err => {
          document.getElementById('global-loading').classList.add('hidden');
          Swal.fire({
            title: 'Error Server', html: `<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) ? err.message : String(err)}</p>`,
            icon: 'error', confirmButtonColor: '#dc2626',
            customClass: { popup: 'lp-swal' }
          });
        })
        .deleteExam(examId, currentUser.userID, currentUser.token);
    }
  });
}

function switchStatus(examId, currentStatus) {
  if (!currentUser || currentUser.role !== 'Admin') {
    Swal.fire({
      title: 'Akses Ditolak',
      html: '<p style="font-size:13px;color:#475569;">Hanya <b>Administrator</b> yang dapat mengubah status jadwal ujian.</p>',
      icon: 'error', confirmButtonColor: '#dc2626',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }

  // FIX: tentukan newStatus di sisi frontend untuk konfirmasi UI,
  // tapi backend toggleExamStatus() menerima currentStatus dan menentukan sendiri.
  // Normalkan: live/upcoming/ended → 'Aktif'; nonaktif → 'Aktif'; aktif → 'Non-Aktif'
  const savedStatus = String(currentStatus || '').toLowerCase();
  const isCurrentlyActive = (savedStatus === 'aktif');
  const newStatus    = isCurrentlyActive ? 'Non-Aktif' : 'Aktif';
  const willActivate = !isCurrentlyActive;

  const exam = (cachedExams || []).find(e => String(e.id) === String(examId));
  const subj = exam ? `<b>${exam.subject}</b> (${exam.class})` : 'jadwal ujian';

  Swal.fire({
    title: `${willActivate ? 'Aktifkan' : 'Nonaktifkan'} Ujian?`,
    html: `<p style="font-size:13px;color:#475569;">Status ${subj} akan diubah menjadi:</p>
           <p style="margin-top:8px;">
             <span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;
               ${willActivate ? 'background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;' : 'background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;'}">
               <span style="width:6px;height:6px;border-radius:50%;background:${willActivate?'#10b981':'#94a3b8'};"></span>
               ${newStatus.toUpperCase()}
             </span>
           </p>
           ${!willActivate ? '<p style="font-size:11px;color:#dc2626;margin-top:10px;background:#fef2f2;padding:8px 12px;border-radius:8px;border:1px solid #fecaca;"><i class="fas fa-triangle-exclamation"></i> Menonaktifkan akan mereset waktu mulai ujian. Siswa tidak dapat mengakses sampai diaktifkan kembali.</p>' : ''}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: willActivate ? '#10b981' : '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: willActivate ? '<i class="fas fa-power-off" style="margin-right:6px;"></i> Aktifkan' : '<i class="fas fa-pause" style="margin-right:6px;"></i> Nonaktifkan',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then((result) => {
    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Memproses...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      customClass: { popup: 'lp-swal' }
    });

    google.script.run
      .withSuccessHandler(function(res) {
        Swal.close();
        if (res && res.success) {
          const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1800, timerProgressBar: true });
          // FIX: gunakan res.newStatus dari backend sebagai sumber kebenaran
          Toast.fire({ icon: 'success', title: `Status diubah ke ${res.newStatus || newStatus}` });
          refreshExamList();
        } else {
          Swal.fire({
            title: 'Gagal', html: `<p style="font-size:13px;color:#475569;">${(res && res.message) ? res.message : 'Terjadi kesalahan'}</p>`,
            icon: 'error', confirmButtonColor: '#dc2626',
            customClass: { popup: 'lp-swal' }
          });
        }
      })
      .withFailureHandler(function(err) {
        Swal.close();
        Swal.fire({
          title: 'Error Server', html: `<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) ? err.message : String(err)}</p>`,
          icon: 'error', confirmButtonColor: '#dc2626',
          customClass: { popup: 'lp-swal' }
        });
      })
      // FIX: kirim currentStatus (bukan newStatus) ke backend agar backend
      // menentukan toggle sendiri — konsisten dengan signature toggleExamStatus(examId, currentStatus)
      .toggleExamStatus(examId, currentStatus, currentUser.userID, currentUser.token);
  });
}

function refreshExamList() {
  // FIX: tampilkan skeleton loading saat menunggu data
  const content = document.getElementById('admin-content');
  if (content && content.querySelector('.ex-page')) {
    const loadOverlay = document.createElement('div');
    loadOverlay.id = 'ex-loading-overlay';
    loadOverlay.style.cssText = 'position:absolute;inset:0;background:rgba(255,255,255,.6);z-index:10;display:flex;align-items:center;justify-content:center;border-radius:16px;';
    loadOverlay.innerHTML = '<div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#3b82f6;font-weight:700;"><i class="fas fa-circle-notch fa-spin"></i> Memperbarui data...</div>';
    content.style.position = 'relative';
    // hapus overlay lama jika ada
    const old = document.getElementById('ex-loading-overlay');
    if (old) old.remove();
    content.appendChild(loadOverlay);
  }

  google.script.run
    .withSuccessHandler(exams => {
      // hapus overlay
      const ov = document.getElementById('ex-loading-overlay');
      if (ov) ov.remove();
      cachedExams = Array.isArray(exams) ? exams : [];
      renderExamForm(document.getElementById('admin-content'));
      if (typeof updateDashBellBadge === 'function') updateDashBellBadge();
    })
    .withFailureHandler(err => {
      const ov = document.getElementById('ex-loading-overlay');
      if (ov) ov.remove();
      Swal.fire({
        title: 'Gagal Memuat Daftar Ujian',
        html: `<p style="font-size:12px;color:#475569;">${(err && err.message) ? err.message : String(err)}</p>`,
        icon: 'error', confirmButtonColor: '#dc2626',
        customClass: { popup: 'lp-swal' }
      });
    })
    .getExamList(currentUser.userID, currentUser.token);
}

function refreshDashboard() {
  const content = document.getElementById('admin-content');
  if (!content) return;
  content.innerHTML = `
    <div class="fade-in space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="dash-skel"></div>
        <div class="dash-skel"></div>
        <div class="dash-skel"></div>
        <div class="dash-skel"></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="dash-skel lg:col-span-2" style="height:280px;"></div>
        <div class="dash-skel" style="height:280px;"></div>
      </div>
    </div>`;

  google.script.run
    .withSuccessHandler(exams => {
      cachedExams = Array.isArray(exams) ? exams : [];
      renderAdminHome(content);
      if (typeof updateDashBellBadge === 'function') updateDashBellBadge();
      const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1600, timerProgressBar: true });
      Toast.fire({ icon: 'success', title: 'Data dashboard diperbarui' });
    })
    .withFailureHandler(err => {
      content.innerHTML = `
        <div class="flex items-center justify-center min-h-[60vh]">
          <div class="dash-error-state max-w-md w-full">
            <div class="ico"><i class="fas fa-triangle-exclamation"></i></div>
            <h3 class="font-bold text-base text-red-700 mb-1">Refresh Gagal</h3>
            <p class="text-xs text-red-600 mb-4">${(err && err.message) ? err.message : 'Periksa koneksi Anda lalu coba lagi.'}</p>
            <button onclick="refreshDashboard()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
              <i class="fas fa-rotate-right"></i> Coba Lagi
            </button>
          </div>
        </div>`;
    })
    .getExamList(currentUser.userID, currentUser.token);
}
