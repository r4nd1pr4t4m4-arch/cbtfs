/**
 * user-modal.js — Modal Form User (Tambah/Edit/Import)
 * createUserModalHTML(), openUserModal(), handleUserSubmit(), handleDeleteUser(), handleToggleUser()
 * Sumber: index.html L32338-33553
 */

function populateMonitorDropdowns(data, meta) {
  const selKelas = document.getElementById('monitor-filter-kelas');
  const selMapel = document.getElementById('monitor-filter-mapel');
  if (!selKelas || !selMapel) return;

  const isGuru = currentUser && currentUser.role === 'Guru';

  let kelasList = (meta && meta.dropdownKelas && meta.dropdownKelas.length > 0)
    ? meta.dropdownKelas
    : [...new Set([
        ...(data.sudahLogin  || []).map(e => e.kelas),
        ...(data.mengerjakan || []).map(e => e.kelas),
        ...(data.selesai     || []).map(e => e.kelas),
        ...(data.curang      || []).map(e => e.kelas)
      ])].filter(Boolean).sort();

  let mapelList = (meta && meta.dropdownMapel && meta.dropdownMapel.length > 0)
    ? meta.dropdownMapel
    : [...new Set([
        ...(data.sudahLogin  || []).map(e => e.mapel),
        ...(data.mengerjakan || []).map(e => e.mapel),
        ...(data.selesai     || []).map(e => e.mapel),
        ...(data.curang      || []).map(e => e.mapel)
      ])].filter(k => k && k !== '-').sort();

  if (isGuru) {
    selKelas.innerHTML = '';
    kelasList.forEach(k => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = k;
      selKelas.appendChild(o);
    });
    if (kelasList.length > 0) {
      selKelas.value = kelasList[0];
    }

    selMapel.innerHTML = '';
    mapelList.forEach(m => {
      const o = document.createElement('option');
      o.value = m;
      o.textContent = m;
      selMapel.appendChild(o);
    });
    if (mapelList.length > 0) {
      selMapel.value = mapelList[0];
    }
  } else {
    selKelas.innerHTML = '<option value="">Semua Kelas</option>';
    kelasList.forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = k;
      selKelas.appendChild(o);
    });

    selMapel.innerHTML = '<option value="">Semua Mata Pelajaran</option>';
    mapelList.forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = m;
      selMapel.appendChild(o);
    });
  }
}
 
function filterMonitorTab(tab) {
  monitorActiveTab = tab;
 
  document.querySelectorAll('.monitor-filter-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tab;
    btn.classList.toggle('bg-slate-700', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('bg-slate-100', !isActive);
    btn.classList.toggle('text-slate-600', !isActive);
  });
 
  const cardRing = {
    belumLogin:  ['stat-belum-login',  'ring-slate-400'],
    sudahLogin:  ['stat-login',        'ring-sky-400'],
    mengerjakan: ['stat-mengerjakan',  'ring-amber-400'],
    selesai:     ['stat-selesai',      'ring-emerald-400'],
    curang:      ['stat-curang',       'ring-red-400']
  };
  document.querySelectorAll('.monitor-stat-card').forEach(c =>
    c.classList.remove('ring-2','ring-slate-400','ring-sky-400','ring-amber-400','ring-emerald-400','ring-red-400')
  );
  if (cardRing[tab]) { const el = document.getElementById(cardRing[tab][0]); if (el) el.classList.add('ring-2', cardRing[tab][1]); }
 
  if (!monitorRawData) return;
 
  const addStatus = (arr, status) => (arr || []).map(e => ({...e, _status: status}));
  if (tab === 'semua') {
    const allWithStatus = [
      ...addStatus(monitorRawData.belumLogin,  'belumLogin'),
      ...addStatus(monitorRawData.sudahLogin,  'sudahLogin'),
      ...addStatus(monitorRawData.mengerjakan, 'mengerjakan'),
      ...addStatus(monitorRawData.selesai,     'selesai'),
      ...addStatus(monitorRawData.curang,      'curang')
    ];
    // Dedup: jika tidak ada exam aktif dipilih, siswa belumLogin/sudahLogin bisa
    // muncul lebih dari sekali (satu per ujian aktif di kelasnya). Di tab "Semua",
    // tampilkan sekali per siswa dengan mengambil entry pertama.
    if (!monitorActiveExam) {
      const seen = new Set();
      monitorTabData = allWithStatus.filter(e => {
        const dedupKey = e.userID + '|' + e._status;
        // Siswa dengan response (mengerjakan/selesai/curang) selalu unik per responseId
        if (e.responseId) return true;
        if (seen.has(dedupKey)) return false;
        seen.add(dedupKey);
        return true;
      });
    } else {
      monitorTabData = allWithStatus;
    }
  } else {
    const withStatus = addStatus(monitorRawData[tab] || [], tab);
    // Dedup untuk tab login-only jika tidak ada exam dipilih
    if (!monitorActiveExam && (tab === 'belumLogin' || tab === 'sudahLogin')) {
      const seen = new Set();
      monitorTabData = withStatus.filter(e => {
        if (seen.has(e.userID)) return false;
        seen.add(e.userID);
        return true;
      });
    } else {
      monitorTabData = withStatus;
    }
  }
 
  applyMonitorFilters();
}
 
function applyMonitorFilters() {
  const kelas  = (document.getElementById('monitor-filter-kelas')  || {}).value || '';
  const mapel  = (document.getElementById('monitor-filter-mapel')  || {}).value || '';
  const search = ((document.getElementById('monitor-search-input') || {}).value || '').toLowerCase().trim();
  const violRaw = (document.getElementById('monitor-filter-viol')  || {}).value;
  const violMin = (violRaw !== '' && violRaw !== null && violRaw !== undefined)
    ? parseInt(violRaw, 10) : NaN;

  const matchesFilter = e => {
    // Filter exam selector — cek examID jika ada ujian dipilih
    const matchExam   = !monitorActiveExam || String(e.examID || '') === monitorActiveExam;
    const matchKelas  = !kelas  || String(e.kelas  || '').toLowerCase() === kelas.toLowerCase();
    const matchMapel  = !mapel  || String(e.mapel  || '').toLowerCase() === mapel.toLowerCase();
    const matchSearch = !search ||
      String(e.nama   || '').toLowerCase().includes(search) ||
      String(e.userID || '').toLowerCase().includes(search) ||
      String(e.kelas  || '').toLowerCase().includes(search);
    const matchViol   = isNaN(violMin) || Number(e.violations || 0) > violMin;
    return matchExam && matchKelas && matchMapel && matchSearch && matchViol;
  };

  monitorFiltered = monitorTabData.filter(matchesFilter);

  if (monitorRawData) {
    const addStatus = (arr, status) => (arr || []).map(e => ({ ...e, _status: status }));
    const allEntries = [
      ...addStatus(monitorRawData.belumLogin,  'belumLogin'),
      ...addStatus(monitorRawData.sudahLogin,  'sudahLogin'),
      ...addStatus(monitorRawData.mengerjakan, 'mengerjakan'),
      ...addStatus(monitorRawData.selesai,     'selesai'),
      ...addStatus(monitorRawData.curang,      'curang')
    ];

    const filteredAll = allEntries.filter(matchesFilter);

    // Dedup untuk stat counts: siswa login-only yang muncul per-ujian
    // cukup dihitung sekali per status agar angka stat card tidak membengkak
    const dedupCount = (status) => {
      const isLoginOnly = status === 'belumLogin' || status === 'sudahLogin';
      if (isLoginOnly && !monitorActiveExam) {
        const seen = new Set();
        return filteredAll.filter(e => {
          if (e._status !== status) return false;
          if (seen.has(e.userID)) return false;
          seen.add(e.userID);
          return true;
        }).length;
      }
      return filteredAll.filter(e => e._status === status).length;
    };

    const elBL = document.getElementById('count-belum-login');
    const elL  = document.getElementById('count-login');
    const elM  = document.getElementById('count-mengerjakan');
    const elS  = document.getElementById('count-selesai');
    const elC  = document.getElementById('count-curang');
    if (elBL) elBL.innerText = dedupCount('belumLogin');
    if (elL)  elL.innerText  = dedupCount('sudahLogin');
    if (elM)  elM.innerText  = dedupCount('mengerjakan');
    if (elS)  elS.innerText  = dedupCount('selesai');
    if (elC)  elC.innerText  = dedupCount('curang');
  }

  renderMonitorTable(monitorFiltered);
}
 
function renderMonitorTable(data) {
  const wrapper = document.getElementById('monitor-table-wrapper');
  if (!wrapper) return;
 
  if (!data || data.length === 0) {
    wrapper.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <i class="fas fa-users text-2xl text-slate-300"></i>
        </div>
        <p class="text-sm">Tidak ada siswa pada kategori ini.</p>
      </div>`;
    return;
  }
 
  const statusCfg = {
    belumLogin:  { label: '-',           cls: 'bg-slate-50 text-slate-500 border-slate-200',       icon: 'fa-user-clock' },
    sudahLogin:  { label: 'Login',       cls: 'bg-sky-50 text-sky-700 border-sky-200',             icon: 'fa-sign-in-alt' },
    mengerjakan: { label: 'Mengerjakan', cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: 'fa-pencil-alt' },
    selesai:     { label: 'Selesai',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'fa-check-circle' },
    curang:      { label: 'Curang',      cls: 'bg-red-50 text-red-700 border-red-200',             icon: 'fa-user-shield' }
  };
 
  const rowKey = e => e.responseId || ('NOLOGIN_' + e.userID);
  const isCurang    = tab => tab === 'curang';
  const isLoginOnly = tab => tab === 'sudahLogin' || tab === 'belumLogin';
  const canReset    = tab => ['mengerjakan','selesai','curang'].includes(tab);

  // BUG FIX #5: Helper escaping HTML
  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Helper: render sel Progress Soal ──────────────────────────────────
  function buildProgressCell(e) {
    if (isLoginOnly(e._status)) return '<span class="text-slate-300 text-xs">-</span>';
    const total    = Number(e.totalQuestions) || 0;
    const answered = Number(e.answeredCount)  || 0;
    if (total === 0) return '<span class="text-slate-300 text-xs">-</span>';
    const pct  = Math.min(100, Math.round((answered / total) * 100));
    const full = answered >= total;
    return `
      <div class="monitor-prog-wrap">
        <div class="monitor-prog-bar">
          <div style="width:${pct}%" class="${full ? 'full' : ''}"></div>
        </div>
        <span class="monitor-prog-txt">
          <span class="${full ? 'done' : ''}">${answered}</span>
          <span class="text-slate-400">/ ${total}</span>
          <span class="text-slate-300 font-normal">(${pct}%)</span>
        </span>
      </div>`;
  }

  // ── Helper: render sel Sisa Waktu ──────────────────────────────────────
  // Sisa waktu dihitung client-side dari startTime + duration.
  // Mengembalikan HTML string statis; timer live dijalankan terpisah setelah render.
  function buildTimerCell(e) {
    // Hanya untuk siswa yang sedang mengerjakan
    if (e._status !== 'mengerjakan') return '<span class="text-slate-300 text-xs">-</span>';
    const duration = Number(e.duration) || 0;
    if (duration === 0 || !e.startTime || e.startTime === '-') {
      return '<span class="text-slate-400 text-xs">-</span>';
    }
    // Parse "dd/MM/yyyy HH:mm:ss"
    const parts = String(e.startTime).split(/[/ :]/);
    if (parts.length < 6) return '<span class="text-slate-400 text-xs">?</span>';
    const startMs  = new Date(+parts[2], +parts[1]-1, +parts[0], +parts[3], +parts[4], +parts[5]).getTime();
    const endMs    = startMs + duration * 60 * 1000;
    const nowMs    = Date.now();
    const remainMs = endMs - nowMs;

    // Unique ID untuk element timer ini — pakai responseId
    const timerId = 'mtimer-' + escHtml(e.responseId || e.userID);

    if (remainMs <= 0) {
      return `<span class="monitor-timer done" id="${timerId}"><i class="fas fa-hourglass-end text-[9px]"></i>Habis</span>`;
    }
    // Render nilai awal; akan di-update oleh _startMonitorTimers()
    const initTxt = _formatRemainMs(remainMs);
    const urgentCls = remainMs < 5*60*1000 ? 'urgent' : (remainMs < 10*60*1000 ? 'warning' : 'ok');
    return `<span class="monitor-timer ${urgentCls}" id="${timerId}" data-end="${endMs}">
      <i class="fas fa-hourglass-half text-[9px]"></i>${initTxt}
    </span>`;
  }

  const rows = data.map((e, idx) => {
    const sc  = statusCfg[e._status] || statusCfg.sudahLogin;
    const key = rowKey(e);
    const isChecked = monitorSelected.has(key) ? 'checked' : '';
 
    const statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${sc.cls}">
      <i class="fas ${sc.icon} text-[9px]"></i>${sc.label}
    </span>`;
 
    // BUG FIX #5a: Escape violDetail sebelum dimasukkan ke atribut title
    // Klik badge → buka violation detail panel
    const violLogs = e.violLogs || [];
    const violBadge = e.violations > 0
      ? `<button type="button" class="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 viol-clickable-badge" 
           title="Klik untuk melihat riwayat pelanggaran"
           onclick="openViolationPanel(${JSON.stringify(escHtml(e.nama || '-'))}, ${e.violations}, ${JSON.stringify(violLogs).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')})">
           <i class="fas fa-exclamation-triangle text-[8px]"></i>${e.violations}x
         </button>` : '';
 
    const scoreCell = isLoginOnly(e._status) ? '<span class="text-slate-300">-</span>'
      : (e.score !== undefined && e.score !== '-' ? `<span class="font-bold text-slate-700">${formatScore(e.score)}</span>` : '<span class="text-slate-400">-</span>');
 
    // BUG FIX #5b: Escape responseId dan nama menggunakan escHtml agar aman
    // di atribut onclick maupun innerHTML. Mengganti replace(/'/g,"\\'") yang
    // tidak memadai (tidak menangani <, >, &, ").
    const safeResponseId = escHtml(e.responseId || '');
    const safeNamaAttr   = escHtml(e.nama || '');
    const btnUnlock = isCurang(e._status)
      ? `<button onclick="handleSingleUnlock('${safeResponseId}','${safeNamaAttr}',this)"
           class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-green-500 border border-transparent hover:shadow transition text-xs" title="Buka Blokir">
           <i class="fas fa-lock-open"></i></button>` : '';
 
    const btnReset = canReset(e._status)
      ? `<button onclick="handleSingleReset('${safeResponseId}','${safeNamaAttr}',this)"
           class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-red-500 border border-transparent hover:shadow transition text-xs" title="Reset Ujian">
           <i class="fas fa-undo-alt"></i></button>` : '';

    // Tombol kirim pesan — hanya untuk siswa yang sedang mengerjakan
    const safeUserID = escHtml(e.userID || '');
    const btnMsg = (e._status === 'mengerjakan' || e._status === 'sudahLogin')
      ? `<button onclick="openSendNotifModal('single','${safeUserID}','${safeNamaAttr}')"
           class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-blue-500 border border-transparent hover:shadow transition text-xs" title="Kirim Pesan ke ${safeNamaAttr}">
           <i class="fas fa-paper-plane"></i></button>` : '';
 
    // BUG FIX #5c: Escape semua data user yang ditampilkan di innerHTML tabel
    return `
    <tr class="hover:bg-slate-50 transition border-b border-slate-50 last:border-0 group" data-key="${escHtml(key)}" data-status="${escHtml(e._status)}" data-response="${safeResponseId}">
      <td class="p-4 pl-6 text-center w-10">
        <input type="checkbox" class="monitor-checkbox w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition"
          value="${escHtml(key)}" onchange="monitorToggleSelect('${escHtml(key)}', this)" ${isChecked}>
      </td>
      <td class="p-4 text-xs text-slate-400 font-bold text-center w-8">${idx + 1}</td>
      <td class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 uppercase flex-shrink-0">
            ${escHtml((e.nama || '?').charAt(0))}
          </div>
          <div>
            <div class="font-bold text-slate-700 text-sm">${escHtml(e.nama || '-')}</div>
            <div class="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded inline-block mt-0.5">${escHtml(e.userID)}</div>
          </div>
        </div>
      </td>
      <td class="p-4"><span class="text-sm text-slate-600 font-medium">${escHtml(e.kelas || '-')}</span></td>
      <td class="p-4"><span class="text-sm text-slate-600">${e.mapel ? escHtml(e.mapel) : '<span class="text-slate-300">-</span>'}</span></td>
      <td class="p-4 text-center">${statusBadge}${violBadge}</td>
      <td class="p-4 text-center">${buildProgressCell(e)}</td>
      <td class="p-4 text-center">${buildTimerCell(e)}</td>
      <td class="p-4 text-center text-xs text-slate-500 tabular-nums">${isLoginOnly(e._status) ? '<span class="text-slate-300">-</span>' : escHtml(e.startTime || '-')}</td>
      <td class="p-4 text-center text-xs text-slate-500 tabular-nums">${isLoginOnly(e._status) ? '<span class="text-slate-300">-</span>' : escHtml(e.submitTime || '-')}</td>
      <td class="p-4 text-center">${scoreCell}</td>
      <td class="p-4 pr-6 text-right">
        <div class="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
          ${btnMsg}${btnUnlock}${btnReset}
        </div>
      </td>
    </tr>`;
  }).join('');
 
  const hasCurang = data.some(e => e._status === 'curang');
  const hasReset  = data.some(e => ['mengerjakan','selesai','curang'].includes(e._status));

  // Jika ada ujian aktif dipilih, tampilkan info bar di atas tabel
  let examInfoBar = '';
  if (monitorActiveExam) {
    const examInfo = monitorExamList.find(ex => ex.examID === monitorActiveExam);
    if (examInfo) {
      examInfoBar = `
      <div class="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs font-semibold text-blue-700">
        <i class="fas fa-filter text-blue-400"></i>
        Filter ujian aktif:
        <span class="bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">${escHtml(examInfo.subject)}</span>
        <span class="text-blue-500">${escHtml(examInfo.kelas)}</span>
        <button onclick="setMonitorActiveExam(null)" class="ml-auto text-blue-400 hover:text-blue-600 transition" title="Hapus filter ujian">
          <i class="fas fa-times-circle"></i> Semua Ujian
        </button>
      </div>`;
    }
  }

  wrapper.innerHTML = `
  <div class="overflow-x-auto w-full">
    ${examInfoBar}
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
          <th class="w-10 text-center pl-6 py-3">
            <input type="checkbox" id="monitor-check-all" onchange="monitorToggleSelectAll(this)"
              class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" title="Pilih Semua">
          </th>
          <th class="w-8 text-center py-3">No</th>
          <th class="py-3 px-4">Identitas Siswa</th>
          <th class="py-3 px-4">Kelas</th>
          <th class="py-3 px-4">Mata Pelajaran</th>
          <th class="py-3 px-4 text-center">Status</th>
          <th class="py-3 px-4 text-center">Progress</th>
          <th class="py-3 px-4 text-center">Sisa Waktu</th>
          <th class="py-3 px-4 text-center">Mulai</th>
          <th class="py-3 px-4 text-center">Selesai / Submit</th>
          <th class="py-3 px-4 text-center">Nilai</th>
          <th class="py-3 pr-6 px-4 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">${rows}</tbody>
    </table>
  </div>
  <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
    <span>Menampilkan <strong class="text-slate-600">${data.length}</strong> siswa</span>
    ${monitorLiveMode
      ? `<span class="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
           <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
           Live — refresh tiap ${MONITOR_LIVE_SECS}d
         </span>`
      : ''}
  </div>`;

  // Jalankan live countdown timer untuk baris "mengerjakan"
  _startMonitorTimers();
}
 
function monitorToggleSelect(key, cb) {
  if (cb.checked) monitorSelected.add(key);
  else            monitorSelected.delete(key);
  updateMonitorBulkToolbar();
}
 
function monitorToggleSelectAll(source) {
  document.querySelectorAll('.monitor-checkbox').forEach(cb => {
    cb.checked = source.checked;
    if (source.checked) monitorSelected.add(cb.value);
    else                monitorSelected.delete(cb.value);
  });
  updateMonitorBulkToolbar();
}
 
function monitorClearSelection() {
  monitorSelected.clear();
  document.querySelectorAll('.monitor-checkbox').forEach(cb => cb.checked = false);
  const ca = document.getElementById('monitor-check-all');
  if (ca) ca.checked = false;
  updateMonitorBulkToolbar();
}
 
function updateMonitorBulkToolbar() {
  const toolbar   = document.getElementById('monitor-bulk-toolbar');
  const countEl   = document.getElementById('monitor-selected-count');
  const btnUnlock = document.getElementById('btn-bulk-unlock');
  const btnReset  = document.getElementById('btn-bulk-reset');
  if (!toolbar) return;
 
  const count = monitorSelected.size;
  // BUG FIX #3: Tambah null-check sebelum akses .innerText agar tidak
  // melempar TypeError jika elemen belum dirender (misal tab belum dibuka).
  if (countEl) countEl.innerText = count;
 
  if (count > 0) {
    toolbar.classList.remove('hidden');
    toolbar.classList.add('flex');
  } else {
    toolbar.classList.add('hidden');
    toolbar.classList.remove('flex');
  }
 
  const selectedStatuses = [...document.querySelectorAll('.monitor-checkbox:checked')].map(cb => {
    const tr = cb.closest('tr');
    return tr ? tr.dataset.status : '';
  });
  const hasCurangSelected = selectedStatuses.some(s => s === 'curang');
  if (btnUnlock) {
    if (hasCurangSelected) { btnUnlock.classList.remove('hidden'); btnUnlock.classList.add('flex'); }
    else                   { btnUnlock.classList.add('hidden');    btnUnlock.classList.remove('flex'); }
  }
}
 
function getSelectedResponseIds() {
  const ids = [];
  // BUG FIX #4: Key untuk siswa belum login menggunakan prefix 'NOLOGIN_' dan
  // tidak ada prefix 'LOGIN_' di codebase ini. Filter yang benar hanya
  // membuang key 'NOLOGIN_' agar siswa tanpa response tidak ikut direset/unlock.
  monitorSelected.forEach(key => {
    if (!key.startsWith('NOLOGIN_')) ids.push(key);
  });
  return ids;
}
 
function handleSingleUnlock(responseId, nama, btnEl) {
  // BUG FIX #10: Parameter 'nama' datang dari atribut onclick HTML yang sudah
  // di-escape dengan escHtml(). Jika langsung dimasukkan ke Swal html:, entitas
  // HTML (&amp; dll.) akan ditampilkan literal. Gunakan text: untuk nama agar
  // Swal menampilkan teks mentah, dan wrap strong di luar interpolasi.
  Swal.fire({
    title: 'Buka Blokir?',
    html: `Siswa <strong>${nama}</strong> akan dapat login kembali dan melanjutkan ujian.`,
    icon: 'question', showCancelButton: true,
    confirmButtonText: '<i class="fas fa-lock-open mr-1"></i> Ya, Buka Blokir',
    cancelButtonText: 'Batal', confirmButtonColor: '#16a34a'
  }).then(r => {
    if (!r.isConfirmed) return;
    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal', text: res.message, timer: 2000, showConfirmButton: false });
        if (res.success) loadMonitorData();
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .unlockStudentExam(responseId, currentUser.userID, currentUser.token);
  });
}
 
function handleSingleReset(responseId, nama, btnEl) {
  Swal.fire({
    title: 'Reset Ujian?',
    html: `Semua jawaban <strong>${nama}</strong> akan <strong class="text-red-600">dihapus</strong> dan siswa dapat mengerjakan ulang.`,
    icon: 'warning', showCancelButton: true,
    confirmButtonText: '<i class="fas fa-undo-alt mr-1"></i> Ya, Reset',
    cancelButtonText: 'Batal', confirmButtonColor: '#dc2626'
  }).then(r => {
    if (!r.isConfirmed) return;
    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal', text: res.message, timer: 2000, showConfirmButton: false });
        if (res.success) loadMonitorData();
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .resetStudentExam(responseId, currentUser.userID, currentUser.token);
  });
}
 
function handleBulkUnlock() {
  const ids = getSelectedResponseIds().filter(id => {

    const tr = document.querySelector(`tr[data-response="${id}"]`);
    return tr && tr.dataset.status === 'curang';
  });
  if (ids.length === 0) { Swal.fire('Info', 'Tidak ada siswa berstatus Curang yang dipilih.', 'info'); return; }
 
  Swal.fire({
    title: 'Buka Blokir Kolektif?',
    html: `<strong>${ids.length} siswa</strong> yang terdeteksi curang akan dibuka blokirnya dan dapat melanjutkan ujian.`,
    icon: 'question', showCancelButton: true,
    confirmButtonText: `<i class="fas fa-lock-open mr-1"></i> Ya, Buka ${ids.length} Siswa`,
    cancelButtonText: 'Batal', confirmButtonColor: '#16a34a'
  }).then(r => {
    if (!r.isConfirmed) return;
    Swal.fire({ title: 'Memproses...', html: `Membuka blokir <b>${ids.length}</b> siswa...`, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal', text: res.message, timer: 2500, showConfirmButton: false });
        if (res.success) { monitorClearSelection(); loadMonitorData(); }
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .bulkUnlockStudents(ids, currentUser.userID, currentUser.token);
  });
}
 
function handleBulkReset() {
  const ids = getSelectedResponseIds();
  if (ids.length === 0) { Swal.fire('Info', 'Pilih minimal 1 siswa yang memiliki data ujian.', 'info'); return; }
 
  Swal.fire({
    title: 'Reset Ujian Kolektif?',
    html: `Seluruh jawaban <strong>${ids.length} siswa</strong> terpilih akan <strong class="text-red-600">DIHAPUS PERMANEN</strong>.<br><br>
           <span class="text-sm text-slate-500">Siswa dapat mengerjakan ujian dari awal.</span>`,
    icon: 'warning', showCancelButton: true,
    confirmButtonText: `<i class="fas fa-undo-alt mr-1"></i> Ya, Reset ${ids.length} Siswa`,
    cancelButtonText: 'Batal', confirmButtonColor: '#dc2626',
    input: 'checkbox',
    inputValue: 0,
    inputPlaceholder: 'Saya mengerti tindakan ini tidak dapat dibatalkan'
  }).then(r => {
    if (!r.isConfirmed || !r.value) {
      if (r.isConfirmed && !r.value) Swal.fire('Dibatalkan', 'Centang konfirmasi terlebih dahulu.', 'info');
      return;
    }
    Swal.fire({ title: 'Memproses...', html: `Me-reset ujian <b>${ids.length}</b> siswa...`, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal', text: res.message, timer: 2500, showConfirmButton: false });
        if (res.success) { monitorClearSelection(); loadMonitorData(); }
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .bulkResetStudents(ids, currentUser.userID, currentUser.token);
  });
}

function createUserModalHTML() {
    const modalHtml = `
    <div id="modal-user" class="fixed inset-0 z-[100] hidden flex items-center justify-center p-2 sm:p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="closeUserModal()"></div>

        <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] animate-[fadeIn_0.25s_ease-out] z-[101]">

            <div class="px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center bg-blue-50 rounded-t-2xl shrink-0">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user-cog"></i>
                  </div>
                  <h3 class="font-bold text-base sm:text-lg text-blue-900 truncate" id="modal-user-title">Tambah User</h3>
                </div>
                <button onclick="closeUserModal()" class="text-slate-400 hover:text-red-500 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 flex-shrink-0" aria-label="Tutup">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <form onsubmit="handleUserSubmit(event)" class="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1" novalidate>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-userId">User ID (NIS / NIP)</label>
                        <input type="text" name="userId" id="input-userId"
                          class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-mono font-bold text-slate-700"
                          placeholder="12345678" autocomplete="off" required>
                        <p class="text-[10px] text-slate-400 mt-1">ID tidak dapat diubah setelah disimpan.</p>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-role">Role / Peran</label>
                        <select name="role" id="input-role" class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-slate-50 cursor-pointer" onchange="toggleUserClassInput(this.value)">
                            <option value="Siswa">Siswa</option>
                            <option value="Guru">Guru</option>
                            <option value="Admin">Admin</option>
                            <option value="Pengawas">Pengawas Ujian</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-username">Nama Lengkap</label>
                    <input type="text" name="username" id="input-username"
                      class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                      placeholder="Contoh: Budi Santoso" autocomplete="off" required>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-password">Password</label>
                    <div class="relative">
                      <input type="text" name="password" id="input-password"
                        class="w-full border border-slate-300 p-2.5 pr-20 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-mono"
                        placeholder="Minimal 4 karakter" autocomplete="new-password" required>
                      <button type="button" onclick="_umGenRandomPwd()" class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded">
                        <i class="fas fa-rotate"></i> Acak
                      </button>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">Password ditampilkan langsung agar mudah dikelola admin.</p>
                </div>

                <div id="field-class-student" class="hidden">
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1" for="input-student-class">Kelas Siswa</label>
                    <select id="input-student-class" class="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white cursor-pointer">
                        <option value="">-- Pilih Kelas --</option>
                        <option value="">Memuat data...</option>
                    </select>
                    <p class="text-[10px] text-slate-400 mt-1">Data kelas diambil dari menu <b>Data Master</b>.</p>
                </div>

                <div id="field-class-teacher" class="hidden bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                    <div class="flex justify-between items-center mb-2">
                        <label class="block text-xs font-bold text-slate-500 uppercase">Tugas Mengajar</label>
                        <button type="button" onclick="addTeacherAssignmentRow()" class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200 transition">
                            <i class="fas fa-plus"></i> Tambah Mapel
                        </button>
                    </div>
                    <div id="teacher-assignments-container" class="space-y-2"></div>
                    <p class="text-[10px] text-slate-400 mt-2"><i class="fas fa-info-circle"></i> Pilih Mata Pelajaran dan Kelas yang diajar (boleh lebih dari satu).</p>
                </div>

                <input type="hidden" name="class" id="final-class-value">

                <div class="flex gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onclick="closeUserModal()" class="flex-shrink-0 px-4 py-2.5 rounded-lg font-bold text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition">
                    Batal
                  </button>
                  <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-lg transition active:scale-95 flex justify-center items-center gap-2">
                    <i class="fas fa-save"></i> Simpan Data
                  </button>
                </div>
            </form>

        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // ESC closes modal
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      const m = document.getElementById('modal-user');
      if (m && !m.classList.contains('hidden')) closeUserModal();
    });
}

// Random password generator (8 chars, alphanumeric, no ambiguous)
function _umGenRandomPwd() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let p = '';
  for (let i = 0; i < 8; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
  const inp = document.getElementById('input-password');
  if (inp) {
    inp.value = p;
    inp.classList.add('ring-2','ring-blue-300');
    setTimeout(() => inp.classList.remove('ring-2','ring-blue-300'), 500);
  }
}

function toggleUserClassInput(role) {
    const divStudent = document.getElementById('field-class-student');
    const inputStudent = document.getElementById('input-student-class');
    const divTeacher = document.getElementById('field-class-teacher');
    
    divStudent.classList.add('hidden');
    divTeacher.classList.add('hidden');
    
    if(inputStudent) inputStudent.removeAttribute('required');

    if (role === 'Siswa') {

        divStudent.classList.remove('hidden');
        if(inputStudent) inputStudent.setAttribute('required', 'true');
    } 
    else if (role === 'Guru') {
        divTeacher.classList.remove('hidden');
        
        loadMasterDataForUser();
        
        const container = document.getElementById('teacher-assignments-container');
        if (container && container.children.length === 0) {
            addTeacherAssignmentRow();
        }
    }    
}

function openUserModal(data = null) {
    const modal = document.getElementById('modal-user');
    const title = document.getElementById('modal-user-title');
    const idInput = document.getElementById('input-userId');
    const teacherContainer = document.getElementById('teacher-assignments-container');

    document.querySelector('form[onsubmit="handleUserSubmit(event)"]').reset();
    if (teacherContainer) teacherContainer.innerHTML = '';
    idInput.value = '';
    document.getElementById('final-class-value').value = '';
    pendingTeacherAssignments = []; 

    document.getElementById('input-role').value = 'Siswa';
    toggleUserClassInput('Siswa');

    if (data) {
        title.innerText = 'Edit User';
        idInput.value = data.id;
        idInput.readOnly = true;
        idInput.classList.add('bg-slate-100', 'cursor-not-allowed');

        document.getElementById('input-username').value = data.username;
        document.getElementById('input-password').value = data.password;
        document.getElementById('input-role').value = data.role;

        toggleUserClassInput(data.role);

        if (data.role === 'Siswa') {
            loadMasterDataForUser(data.class);

        } else if (data.role === 'Guru') {
            const rawAssignments = data.class;
            if (rawAssignments && rawAssignments !== '-' && rawAssignments.trim() !== '') {
                rawAssignments.split(',').forEach(item => {
                    const parts = item.trim().split(':');
                    if (parts.length >= 2) {
                        pendingTeacherAssignments.push({
                            sub: parts[0].trim(),
                            cls: parts[1].trim()
                        });
                    }
                });
            }
            loadMasterDataForUser();

        } else {
            loadMasterDataForUser();
        }

    } else {
        title.innerText = 'Tambah User Baru';
        idInput.readOnly = false;
        idInput.classList.remove('bg-slate-100', 'cursor-not-allowed');
        loadMasterDataForUser();
    }

    modal.classList.remove('hidden');
}

    function closeUserModal() {
        document.getElementById('modal-user').classList.add('hidden');
    }

function handleUserSubmit(e) {
    e.preventDefault();

    const role = document.getElementById('input-role').value;
    const finalClassInput = document.getElementById('final-class-value');
    const idInput = document.getElementById('input-userId');
    const usernameInput = document.getElementById('input-username');
    const passwordInput = document.getElementById('input-password');

    // Validate
    if (!String(idInput.value || '').trim()) {
        Swal.fire({
          title:'User ID Wajib Diisi',
          html:'<p style="font-size:13px;color:#475569;">Masukkan User ID (NIS untuk siswa, NIP untuk guru/admin).</p>',
          icon:'warning', confirmButtonColor:'#2563eb',
          customClass:{ popup:'lp-swal' }
        });
        try { idInput.focus(); } catch(e){}
        return;
    }
    if (!String(usernameInput.value || '').trim()) {
        Swal.fire({
          title:'Nama Lengkap Wajib Diisi',
          html:'<p style="font-size:13px;color:#475569;">Masukkan nama lengkap pengguna.</p>',
          icon:'warning', confirmButtonColor:'#2563eb',
          customClass:{ popup:'lp-swal' }
        });
        try { usernameInput.focus(); } catch(e){}
        return;
    }
    if (!String(passwordInput.value || '').trim()) {
        Swal.fire({
          title:'Password Wajib Diisi',
          html:'<p style="font-size:13px;color:#475569;">Masukkan password untuk pengguna.</p>',
          icon:'warning', confirmButtonColor:'#2563eb',
          customClass:{ popup:'lp-swal' }
        });
        try { passwordInput.focus(); } catch(e){}
        return;
    }

    if (role === 'Siswa') {
        const cls = document.getElementById('input-student-class').value;
        if (!cls) {
            Swal.fire({
              title:'Kelas Wajib Dipilih',
              html:'<p style="font-size:13px;color:#475569;">Pilih kelas siswa terlebih dahulu.</p>',
              icon:'warning', confirmButtonColor:'#2563eb',
              customClass:{ popup:'lp-swal' }
            });
            return;
        }
        finalClassInput.value = cls;
    } else if (role === 'Guru') {
        const rows = document.querySelectorAll('.assignment-row');
        let assignments = [];
        rows.forEach(row => {
            const sub = row.querySelector('.assign-subject').value.trim();
            const cls = row.querySelector('.assign-class').value.trim();
            if (sub && cls) {
                const cleanSub = sub.replace(/:/g, '');
                const cleanCls = cls.replace(/:/g, '');
                assignments.push(`${cleanSub}:${cleanCls}`);
            }
        });
        if (assignments.length === 0) {
            Swal.fire({
              title:'Tugas Mengajar Belum Lengkap',
              html:'<p style="font-size:13px;color:#475569;">Guru wajib memiliki minimal satu tugas mengajar (Mapel + Kelas).</p>',
              icon:'warning', confirmButtonColor:'#2563eb',
              customClass:{ popup:'lp-swal' }
            });
            return;
        }
        finalClassInput.value = assignments.join(', ');
    } else {
        finalClassInput.value = '-';
    }

    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());

    closeUserModal();
    document.getElementById('global-loading').classList.remove('hidden');

    const isEditMode = !!idInput.readOnly;

    const onSuccess = (res) => {
        document.getElementById('global-loading').classList.add('hidden');
        if (res && res.success) {
            const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
            Toast.fire({ icon:'success', title: isEditMode ? 'Data pengguna diperbarui' : 'Pengguna baru ditambahkan' });
            loadUserTable();
        } else {
            Swal.fire({
              title:'Gagal',
              html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
              icon:'error', confirmButtonColor:'#dc2626',
              customClass:{ popup:'lp-swal' }
            });
        }
    };
    const onFailure = (err) => {
        document.getElementById('global-loading').classList.add('hidden');
        Swal.fire({
          title:'Error Server',
          html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
          icon:'error', confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        });
    };

    if (isEditMode) {
        google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFailure)
          .updateUser(data, currentUser.userID, currentUser.token);
    } else {
        google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFailure)
          .createUser(data, currentUser.userID, currentUser.token);
    }
}

function handleDeleteUser(uid) {
    const u = (allUsersData || []).find(x => String(x.id) === String(uid));
    const subj = u ? `<b>${String(u.username || uid).replace(/</g,'&lt;')}</b> (${String(u.id || '').replace(/</g,'&lt;')})` : 'pengguna ini';
    Swal.fire({
        title: 'Hapus Pengguna?',
        html: `<p style="font-size:13px;color:#475569;">Anda akan menghapus ${subj}.</p>
               <p style="font-size:12px;color:#dc2626;margin-top:8px;background:#fef2f2;padding:8px 12px;border-radius:8px;border:1px solid #fecaca;">
                 <i class="fas fa-triangle-exclamation"></i> Data pengguna dan riwayat ujian terkait dapat hilang. Tindakan ini tidak dapat dibatalkan.
               </p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-trash-can mr-1"></i> Ya, Hapus Permanen',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: { popup: 'lp-swal' }
    }).then(res => {
        if (res.isConfirmed) {
            document.getElementById('global-loading').classList.remove('hidden');

            google.script.run
              .withSuccessHandler(r => {
                document.getElementById('global-loading').classList.add('hidden');
                if (r && r.success) {
                  const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
                  Toast.fire({ icon:'success', title:'Pengguna dihapus' });
                  loadUserTable();
                } else {
                  Swal.fire({
                    title:'Gagal Menghapus',
                    html:`<p style="font-size:13px;color:#475569;">${(r && r.message) || 'Terjadi kesalahan'}</p>`,
                    icon:'error', confirmButtonColor:'#dc2626',
                    customClass:{ popup:'lp-swal' }
                  });
                }
              })
              .withFailureHandler(err => {
                document.getElementById('global-loading').classList.add('hidden');
                Swal.fire({
                  title:'Error Server',
                  html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
                  icon:'error', confirmButtonColor:'#dc2626',
                  customClass:{ popup:'lp-swal' }
                });
              })
              .deleteUser(uid, currentUser.userID, currentUser.token);
        }
    });
}

function handleToggleUser(uid, rawStatus) {
    const isCurrentlyActive = String(rawStatus).toUpperCase().trim() === 'TRUE';
    const u = (allUsersData || []).find(x => String(x.id) === String(uid));
    const subj = u ? `<b>${String(u.username || uid).replace(/</g,'&lt;')}</b>` : 'pengguna ini';

    Swal.fire({
        title: `${isCurrentlyActive ? 'Nonaktifkan' : 'Aktifkan'} Pengguna?`,
        html: `<p style="font-size:13px;color:#475569;">Status ${subj} akan diubah menjadi:</p>
               <p style="margin-top:8px;">
                 <span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:700;
                   ${!isCurrentlyActive ? 'background:#d1fae5;color:#065f46;border:1px solid #a7f3d0;' : 'background:#fee2e2;color:#991b1b;border:1px solid #fecaca;'}">
                   <span style="width:6px;height:6px;border-radius:50%;background:${!isCurrentlyActive?'#10b981':'#dc2626'};"></span>
                   ${!isCurrentlyActive ? 'AKTIF' : 'NON-AKTIF'}
                 </span>
               </p>
               ${isCurrentlyActive ? '<p style="font-size:11px;color:#dc2626;margin-top:10px;background:#fef2f2;padding:8px 12px;border-radius:8px;border:1px solid #fecaca;"><i class="fas fa-triangle-exclamation"></i> Pengguna tidak akan dapat login sampai diaktifkan kembali.</p>' : ''}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: isCurrentlyActive ? '#dc2626' : '#10b981',
        cancelButtonColor: '#64748b',
        confirmButtonText: isCurrentlyActive ? '<i class="fas fa-ban mr-1"></i> Nonaktifkan' : '<i class="fas fa-circle-check mr-1"></i> Aktifkan',
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
                    const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1600, timerProgressBar:true });
                    // BUG FIX #17 (toast): tampilkan status BARU yang aktual, bukan kebalikannya.
                    Toast.fire({ icon:'success', title:`Status diubah ke ${isCurrentlyActive ? 'Non-Aktif' : 'Aktif'}` });
                    loadUserTable();
                } else {
                    Swal.fire({
                      title:'Gagal',
                      html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
                      icon:'error', confirmButtonColor:'#dc2626',
                      customClass:{ popup:'lp-swal' }
                    });
                }
            })
            .withFailureHandler(err => {
                document.getElementById('global-loading').classList.add('hidden');
                Swal.fire({
                  title:'Error Server',
                  html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
                  icon:'error', confirmButtonColor:'#dc2626',
                  customClass:{ popup:'lp-swal' }
                });
            })
            // BUG FIX #17: kirim status SAAT INI — backend akan toggle sendiri ke kebalikannya.
            .toggleUserStatus(uid, isCurrentlyActive ? 'TRUE' : 'FALSE');
    });
}

    function createImportUserModalHTML() {
        const html = `
        <div id="modal-import-user" class="fixed inset-0 z-[100] hidden flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onclick="closeImportUserModal()"></div>
            
            <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col animate-[fadeIn_0.3s_ease-out] z-[101]">
                
                <div class="px-6 py-4 border-b flex justify-between items-center bg-emerald-50 rounded-t-2xl">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><i class="fas fa-file-excel"></i></div>
                        <h3 class="font-bold text-lg text-emerald-900">Import User dari Excel</h3>
                    </div>
                    <button onclick="closeImportUserModal()" class="text-slate-400 hover:text-red-500 transition"><i class="fas fa-times"></i></button>
                </div>

                <div class="p-6 space-y-6">
                    
                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-600">
                        <p class="font-bold text-slate-800 mb-2"><i class="fas fa-info-circle text-blue-500"></i> Aturan Format Excel:</p>
                        <ul class="list-disc list-inside space-y-1 text-xs ml-1">
                            <li><b>Kolom A (Username):</b> Nama lengkap siswa (Wajib).</li>
                            <li><b>Kolom B (Password):</b> Password akun (Wajib).</li>
                            <li><b>Kolom C (Role):</b> Siswa / Guru / Admin.</li>
                            <li><b>Kolom D (Kelas):</b> Wajib diisi jika role Siswa.</li>
                            <li><b>Kolom E (ID/NIS):</b> Opsional. Jika kosong, ID dibuat otomatis.</li>
                        </ul>
                        <button onclick="downloadUserTemplate()" class="mt-3 text-emerald-600 font-bold hover:underline text-xs flex items-center gap-1">
                            <i class="fas fa-download"></i> Download Template Excel
                        </button>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Upload File (.xlsx)</label>
                        <input type="file" id="input-user-excel" accept=".xlsx, .xls" class="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-xl file:border-0
                          file:text-xs file:font-bold
                          file:bg-emerald-50 file:text-emerald-700
                          hover:file:bg-emerald-100
                          cursor-pointer border border-slate-300 rounded-xl p-2 bg-white transition
                        "/>
                    </div>

                    <button onclick="processUserImport()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg transition active:scale-95 flex justify-center items-center gap-2">
                        <i class="fas fa-upload"></i> Proses Import
                    </button>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', html);
    }

    function openImportUserModal() {
        if (!document.getElementById('modal-import-user')) {
            createImportUserModalHTML();
        }
        document.getElementById('input-user-excel').value = ''; 
        document.getElementById('modal-import-user').classList.remove('hidden');
    }

    function closeImportUserModal() {
        document.getElementById('modal-import-user').classList.add('hidden');
    }

    function downloadUserTemplate() {
        const data = [
            ["Username", "Password", "Role", "Mapel", "Kelas", "ID (Opsional)"], 
            ["Ahmad Siswa", "123456", "Siswa", "-", "XII-RPL", "1001"], 
            ["Budi Santoso", "123456", "Siswa", "-", "XII-TKJ", ""],
            ["Pak Guru", "guru123", "Guru", "Matematika", "XII-IPA 1", "GURU-01"], 
            ["Bu Guru", "guru456", "Guru", "Fisika", "XII-IPA 2", "GURU-02"]
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        ws['!cols'] = [{wch:25}, {wch:15}, {wch:10}, {wch:15}, {wch:15}, {wch:15}];
        XLSX.utils.book_append_sheet(wb, ws, "TemplateUser");
        XLSX.writeFile(wb, "Template_Import_User_SIPADU_V2.xlsx");
    }

    function processUserImport() {
        const fileInput = document.getElementById('input-user-excel');
        const file = fileInput.files[0];

        if (!file) {
            Swal.fire('Peringatan', 'Silakan pilih file Excel terlebih dahulu.', 'warning');
            return;
        }

        closeImportUserModal();
        document.getElementById('global-loading').classList.remove('hidden');

        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

                const usersToImport = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length === 0) continue; 
                    
                    const role = row[2] ? String(row[2]).trim() : 'Siswa';
                    let classValue = '-';

                    const rawMapel = row[3] ? String(row[3]).trim() : '';
                    const rawKelas = row[4] ? String(row[4]).trim() : '';

                    if (role.toLowerCase() === 'guru') {
                        if (rawMapel && rawMapel !== '-' && rawKelas && rawKelas !== '-') {
                            classValue = `${rawMapel}:${rawKelas}`;
                        } else {
                            classValue = '-'; 
                        }
                    } else {
                        classValue = rawKelas || '-';
                    }

                    usersToImport.push({
                        username: row[0],
                        password: row[1],
                        role: role,
                        class: classValue, 
                        id: row[5] 
                    });
                }

                if (usersToImport.length === 0) {
                    document.getElementById('global-loading').classList.add('hidden');
                    Swal.fire('Data Kosong', 'Tidak ada data user yang ditemukan di file Excel.', 'info');
                    return;
                }

                google.script.run.withSuccessHandler(res => {
                    document.getElementById('global-loading').classList.add('hidden');
                    
                    let msg = `Berhasil import <b>${res.imported}</b> user.`;
                    if(res.failed > 0) {
                        msg += `<br>Gagal/Duplikat: <b class="text-red-500">${res.failed}</b>`;
                        if(res.details.length > 0) {
                            msg += `<div class="mt-2 text-xs text-left bg-red-50 p-2 rounded text-red-700 border border-red-100">Info: ${res.details.join(', ')}...</div>`;
                        }
                    }

                    Swal.fire({
                        title: res.success ? 'Selesai' : 'Gagal',
                        html: msg,
                        icon: res.success ? 'success' : 'error'
                    }).then(() => {
                        loadUserTable(); 
                    });

                }).importUsersBulk(usersToImport);

            } catch (err) {
                document.getElementById('global-loading').classList.add('hidden');
                Swal.fire('Error', 'Gagal memproses file Excel: ' + err.message, 'error');
            }
        };

        reader.readAsArrayBuffer(file);
    }
    
let allImagesData = [];
let allAudioData = [];
let filteredImages = [];
let currentImgPage = 1;
let imgRowsPerPage = 10;

// ============================================================================
// Audio_Folder_Page (mirror renderImageFolder)
// Task 10.2 — gallery + load + admin folder status. Upload/import handlers are
// owned by tasks 10.4/10.5 and mount into the placeholder containers below.
// ============================================================================