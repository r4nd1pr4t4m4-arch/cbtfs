/**
 * essay-grading.js — Progres Koreksi Esai
 * renderEssayGradingProgress() + _eg* helpers
 * Sumber: index.html L40066-40907
 */

function _egSkeletonStatCard() {
  return '<div class="eg-stat-card-skel">' +
    '<div class="eg-skel" style="width:30px;height:30px;border-radius:8px;margin-bottom:5px;"></div>' +
    '<div class="eg-skel" style="width:44px;height:22px;"></div>' +
    '<div class="eg-skel" style="width:72px;height:12px;margin-top:2px;border-radius:4px;"></div>' +
  '</div>';
}

/** N skeleton exam card untuk reserved space di #eg-list */
function _egSkeletonExamCards(n) {
  var out = '<div class="eg-exam-list">';
  for (var i = 0; i < n; i++) {
    out +=
      '<div class="eg-exam-card-skel">' +
        // baris atas: judul + badge
        '<div class="skel-row" style="justify-content:space-between;">' +
          '<div style="flex:1;display:flex;flex-direction:column;gap:6px;">' +
            '<div class="eg-skel" style="height:16px;width:55%;border-radius:5px;"></div>' +
            '<div class="eg-skel" style="height:11px;width:75%;border-radius:4px;"></div>' +
          '</div>' +
          '<div class="eg-skel" style="height:22px;width:90px;border-radius:20px;flex-shrink:0;"></div>' +
        '</div>' +
        // progress bar
        '<div>' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
            '<div class="eg-skel" style="height:10px;width:90px;border-radius:4px;"></div>' +
            '<div class="eg-skel" style="height:10px;width:30px;border-radius:4px;"></div>' +
          '</div>' +
          '<div class="eg-skel" style="height:7px;width:100%;border-radius:20px;"></div>' +
        '</div>' +
        // stats row
        '<div class="skel-stats">' +
          '<div class="eg-skel" style="height:22px;width:80px;border-radius:6px;"></div>' +
          '<div class="eg-skel" style="height:22px;width:70px;border-radius:6px;"></div>' +
          '<div class="eg-skel" style="height:22px;width:85px;border-radius:6px;"></div>' +
          '<div class="eg-skel" style="height:22px;width:80px;border-radius:6px;"></div>' +
        '</div>' +
      '</div>';
  }
  out += '</div>';
  return out;
}

/**
 * Skeleton untuk modal body — struktur mendekati konten nyata sehingga
 * modal tidak berubah tinggi saat data masuk.
 * Jumlah row tabel disesuaikan dengan estimasi peserta umum (5 baris).
 */
function _egSkeletonModalBody() {
  var tableRows = '';
  for (var i = 0; i < 5; i++) {
    tableRows +=
      '<div class="skel-table-row">' +
        '<div class="eg-skel" style="width:20px;height:20px;border-radius:4px;flex-shrink:0;"></div>' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:4px;">' +
          '<div class="eg-skel" style="height:12px;width:55%;border-radius:4px;"></div>' +
          '<div class="eg-skel" style="height:9px;width:40%;border-radius:4px;"></div>' +
        '</div>' +
        '<div class="eg-skel" style="width:40px;height:12px;border-radius:4px;flex-shrink:0;"></div>' +
        '<div class="eg-skel" style="flex:1;height:6px;border-radius:20px;min-width:60px;max-width:110px;"></div>' +
        '<div class="eg-skel" style="width:60px;height:20px;border-radius:20px;flex-shrink:0;"></div>' +
        '<div class="eg-skel" style="width:70px;height:10px;border-radius:4px;flex-shrink:0;"></div>' +
      '</div>';
  }

  return '<div class="eg-modal-body-skel">' +

    // Section 1: ringkasan progress (stats grid + progress bar)
    '<div class="skel-section">' +
      '<div class="eg-skel" style="height:12px;width:130px;border-radius:4px;"></div>' +
      '<div class="skel-grid">' +
        '<div class="skel-grid-item"><div class="eg-skel" style="height:19px;width:36px;border-radius:4px;"></div><div class="eg-skel" style="height:10px;width:60px;border-radius:3px;"></div></div>' +
        '<div class="skel-grid-item"><div class="eg-skel" style="height:19px;width:36px;border-radius:4px;"></div><div class="eg-skel" style="height:10px;width:60px;border-radius:3px;"></div></div>' +
        '<div class="skel-grid-item"><div class="eg-skel" style="height:19px;width:36px;border-radius:4px;"></div><div class="eg-skel" style="height:10px;width:60px;border-radius:3px;"></div></div>' +
        '<div class="skel-grid-item"><div class="eg-skel" style="height:19px;width:36px;border-radius:4px;"></div><div class="eg-skel" style="height:10px;width:60px;border-radius:3px;"></div></div>' +
        '<div class="skel-grid-item"><div class="eg-skel" style="height:19px;width:36px;border-radius:4px;"></div><div class="eg-skel" style="height:10px;width:60px;border-radius:3px;"></div></div>' +
      '</div>' +
      '<div style="margin-top:4px;display:flex;flex-direction:column;gap:6px;">' +
        '<div style="display:flex;justify-content:space-between;">' +
          '<div class="eg-skel" style="height:10px;width:100px;border-radius:4px;"></div>' +
          '<div class="eg-skel" style="height:10px;width:28px;border-radius:4px;"></div>' +
        '</div>' +
        '<div class="eg-skel" style="height:9px;width:100%;border-radius:20px;"></div>' +
      '</div>' +
    '</div>' +

    // Section 2: pengoreksi
    '<div class="skel-section">' +
      '<div class="eg-skel" style="height:12px;width:90px;border-radius:4px;"></div>' +
      '<div style="display:flex;gap:10px;align-items:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;">' +
        '<div class="eg-skel" style="width:28px;height:28px;border-radius:7px;flex-shrink:0;"></div>' +
        '<div class="eg-skel" style="flex:1;height:12px;border-radius:4px;"></div>' +
        '<div class="eg-skel" style="width:80px;height:10px;border-radius:4px;flex-shrink:0;"></div>' +
      '</div>' +
    '</div>' +

    // Section 3: tabel peserta
    '<div class="skel-section">' +
      '<div class="eg-skel" style="height:12px;width:120px;border-radius:4px;"></div>' +
      '<div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">' +
        '<div style="background:#f8fafc;padding:9px 12px;border-bottom:1px solid #e2e8f0;display:flex;gap:8px;">' +
          '<div class="eg-skel" style="height:10px;width:20px;border-radius:3px;flex-shrink:0;"></div>' +
          '<div class="eg-skel" style="height:10px;flex:1;border-radius:3px;"></div>' +
          '<div class="eg-skel" style="height:10px;width:60px;border-radius:3px;flex-shrink:0;"></div>' +
          '<div class="eg-skel" style="height:10px;width:80px;border-radius:3px;flex-shrink:0;"></div>' +
          '<div class="eg-skel" style="height:10px;width:55px;border-radius:3px;flex-shrink:0;"></div>' +
          '<div class="eg-skel" style="height:10px;width:65px;border-radius:3px;flex-shrink:0;"></div>' +
        '</div>' +
        '<div style="padding:0 12px;">' + tableRows + '</div>' +
      '</div>' +
    '</div>' +

  '</div>';
}

function renderEssayGradingProgress(container) {
  // Reset state penuh saat re-mount agar DOM baru selalu sinkron
  window._egUI = {
    data:          null,
    filtered:      [],
    sortMode:      'default',
    filterSubject: '',
    filterKelas:   '',
    filterStatus:  '',
    search:        '',
    subjects:      [],
    kelasArr:      []
  };

  // Render skeleton summary cards (7 kartu, dimensi identik dengan card nyata)
  var skelSummary = '';
  for (var si = 0; si < 7; si++) skelSummary += _egSkeletonStatCard();

  container.innerHTML =
    '<div class="eg-page fade-in" id="eg-root">' +

      '<!-- Header -->' +
      '<div class="eg-header">' +
        '<div class="eg-header-left">' +
          '<h2><i class="fas fa-pen-to-square"></i> Progres Koreksi Esai</h2>' +
          '<p>Pantau status koreksi jawaban Esai per Jadwal Ujian secara real-time.</p>' +
          '<div class="eg-header-stats" id="eg-header-pills"></div>' +
        '</div>' +
        '<button class="eg-refresh-btn" id="eg-refresh-btn" onclick="_egLoad()" title="Perbarui data">' +
          '<i class="fas fa-rotate-right" id="eg-refresh-icon"></i> Perbarui' +
        '</button>' +
      '</div>' +

      '<!-- Summary cards: skeleton awal dengan dimensi sama persis dengan card nyata -->' +
      '<div class="eg-summary-grid" id="eg-summary">' + skelSummary + '</div>' +

      '<!-- Toolbar -->' +
      '<div class="eg-toolbar">' +
        '<div class="eg-search-wrap">' +
          '<i class="fas fa-search"></i>' +
          '<input type="text" id="eg-search" class="eg-search-input"' +
            ' placeholder="Cari mata pelajaran atau kelas..."' +
            ' oninput="_egApplyFilter()" autocomplete="off" spellcheck="false">' +
        '</div>' +
        '<select id="eg-filter-subject" class="eg-filter-select" onchange="_egApplyFilter()" disabled>' +
          '<option value="">Semua Mapel</option>' +
        '</select>' +
        '<select id="eg-filter-kelas" class="eg-filter-select" onchange="_egApplyFilter()" disabled>' +
          '<option value="">Semua Kelas</option>' +
        '</select>' +
        '<select id="eg-filter-status" class="eg-filter-select" onchange="_egApplyFilter()" disabled>' +
          '<option value="">Semua Status</option>' +
          '<option value="none">Belum Dikoreksi</option>' +
          '<option value="partial">Sebagian</option>' +
          '<option value="done">Selesai</option>' +
        '</select>' +
        '<button id="eg-sort-btn" class="eg-sort-btn" onclick="_egToggleSort()" disabled title="Urutkan berdasarkan progres">' +
          '<i class="fas fa-arrow-up-wide-short"></i> Urutan' +
        '</button>' +
        '<span class="eg-results-count" id="eg-results-count"></span>' +
      '</div>' +

      /* List area: reserved space dengan class eg-list-loading + skeleton cards
         min-height di CSS = 4 × 152px + 3 × 10px = 638px, mencegah layout shift
         saat data masuk dan mengganti skeleton dengan card nyata */
      '<div id="eg-list" class="eg-list-loading">' +
        _egSkeletonExamCards(4) +
      '</div>' +

    '</div>' +

    // Modal — di luar eg-root agar tidak terpotong overflow
    '<div class="eg-modal-overlay" id="eg-modal-overlay">' +
      '<div class="eg-modal" id="eg-modal" role="dialog" aria-modal="true" aria-labelledby="eg-modal-title-el">' +
        '<div class="eg-modal-handle"></div>' +
        '<div class="eg-modal-header">' +
          '<div style="min-width:0;flex:1;">' +
            '<p class="eg-modal-title" id="eg-modal-title-el">Detail Koreksi</p>' +
            '<p class="eg-modal-sub"   id="eg-modal-sub-el">—</p>' +
          '</div>' +
          '<button class="eg-modal-close" id="eg-modal-close-btn" title="Tutup (Esc)" aria-label="Tutup">' +
            '<i class="fas fa-times"></i>' +
          '</button>' +
        '</div>' +
        // Modal body: min-height tetap agar modal tidak mengembang setelah data masuk
        '<div class="eg-modal-body" id="eg-modal-body" style="min-height:420px;">' +
          _egSkeletonModalBody() +
        '</div>' +
        // Footer selalu ada di DOM, cukup visibility yg berubah (tidak menyebabkan reflow tinggi modal)
        '<div class="eg-modal-footer" id="eg-modal-footer" style="visibility:hidden;">' +
          '<button class="eg-modal-action-btn secondary" onclick="_egCloseModalBtn()">' +
            '<i class="fas fa-times"></i> Tutup' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  _egBindModalEvents();
  _egLoad();
}

// ── Bind modal events (dipanggil sekali per mount) ────────────────────────────
function _egBindModalEvents() {
  var overlay = document.getElementById('eg-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (!document.getElementById('eg-modal').contains(e.target)) {
        _egCloseModalBtn();
      }
    });
  }
  var closeBtn = document.getElementById('eg-modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', _egCloseModalBtn);
  }
  document.addEventListener('keydown', _egHandleKeyDown);
}

// Escape key handler
function _egHandleKeyDown(e) {
  if (e.key === 'Escape') {
    var overlay = document.getElementById('eg-modal-overlay');
    if (overlay && overlay.classList.contains('open')) {
      _egCloseModalBtn();
    }
  }
}

// ── Load data dari backend ────────────────────────────────────────────────────
function _egLoad() {
  if (!currentUser) return;
  var btn  = document.getElementById('eg-refresh-btn');
  var icon = document.getElementById('eg-refresh-icon');
  if (btn)  btn.disabled = true;
  if (icon) icon.classList.add('eg-spin');

  // Saat refresh (bukan first load): tampilkan skeleton kembali tanpa hapus reserved space
  var listEl = document.getElementById('eg-list');
  if (listEl) {
    // Tambah class reserved space, isi dengan skeleton
    listEl.className = 'eg-list-loading';
    listEl.innerHTML = _egSkeletonExamCards(4);
  }

  // Disable filter/sort selama loading
  ['eg-filter-subject','eg-filter-kelas','eg-filter-status','eg-sort-btn'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.disabled = true;
  });

  // Render skeleton summary (pertahankan grid, ganti isi)
  var sumEl = document.getElementById('eg-summary');
  if (sumEl) {
    var sk = '';
    for (var si = 0; si < 7; si++) sk += _egSkeletonStatCard();
    sumEl.innerHTML = sk;
  }

  google.script.run
    .withSuccessHandler(function(res) {
      if (btn)  btn.disabled = false;
      if (icon) icon.classList.remove('eg-spin');

      // Re-enable filter/sort
      ['eg-filter-subject','eg-filter-kelas','eg-filter-status','eg-sort-btn'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.disabled = false;
      });

      if (!res || !res.success) {
        _egShowError(res ? res.message : 'Gagal memuat data. Coba lagi.');
        return;
      }

      var ui = window._egUI;
      if (!ui) return;
      ui.data = res;

      var subjects = new Set();
      var kelasSet = new Set();
      (res.exams || []).forEach(function(e) {
        if (e.subject) subjects.add(e.subject);
        if (e.kelas) e.kelas.split(',').forEach(function(k) {
          var t = k.trim(); if (t) kelasSet.add(t);
        });
      });
      ui.subjects = Array.from(subjects).sort();
      ui.kelasArr = Array.from(kelasSet).sort();

      _egPopulateFilters();
      _egRenderSummary(res.summary);
      _egRenderHeaderPills(res.summary);
      _egApplyFilter();
    })
    .withFailureHandler(function(err) {
      if (btn)  btn.disabled = false;
      if (icon) icon.classList.remove('eg-spin');
      ['eg-filter-subject','eg-filter-kelas','eg-filter-status','eg-sort-btn'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.disabled = false;
      });
      _egShowError('Terjadi kesalahan koneksi: ' + (err && err.message ? err.message : String(err)));
    })
    .getEssayGradingProgress(currentUser.userID, currentUser.token);
}

// ── Render pills ringkasan di header ─────────────────────────────────────────
function _egRenderHeaderPills(s) {
  var el = document.getElementById('eg-header-pills');
  if (!el || !s) return;
  var pct = s.totalAnswers > 0 ? Math.round((s.totalGraded / s.totalAnswers) * 100) : 0;
  el.innerHTML =
    '<span class="eg-header-pill"><i class="fas fa-layer-group"></i>' + (s.totalExams || 0) + ' jadwal</span>' +
    '<span class="eg-header-pill"><i class="fas fa-check-double"></i>' + pct + '% terkoreksi</span>' +
    '<span class="eg-header-pill"><i class="fas fa-hourglass-half"></i>' + (s.totalPending || 0) + ' menunggu</span>';
}

// ── Isi dropdown filter ───────────────────────────────────────────────────────
function _egPopulateFilters() {
  var ui = window._egUI;
  if (!ui) return;
  var selSubj = document.getElementById('eg-filter-subject');
  var selKls  = document.getElementById('eg-filter-kelas');
  if (!selSubj || !selKls) return;

  var curSubj = ui.filterSubject || '';
  var curKls  = ui.filterKelas  || '';

  selSubj.innerHTML = '<option value="">Semua Mapel</option>' +
    ui.subjects.map(function(s) {
      return '<option value="' + _egEsc(s) + '"' + (s === curSubj ? ' selected' : '') + '>' + _egEsc(s) + '</option>';
    }).join('');
  selKls.innerHTML = '<option value="">Semua Kelas</option>' +
    ui.kelasArr.map(function(k) {
      return '<option value="' + _egEsc(k) + '"' + (k === curKls ? ' selected' : '') + '>' + _egEsc(k) + '</option>';
    }).join('');
}

// ── Render ringkasan dashboard ────────────────────────────────────────────────
function _egRenderSummary(s) {
  var el = document.getElementById('eg-summary');
  if (!el || !s) return;

  var cards = [
    { icon: 'fa-calendar-check',    bg: '#ede9fe', color: '#7c3aed', val: s.totalExams,   label: 'Total Jadwal' },
    { icon: 'fa-circle-check',      bg: '#d1fae5', color: '#059669', val: s.doneCount,    label: 'Selesai' },
    { icon: 'fa-clock-rotate-left', bg: '#fef3c7', color: '#d97706', val: s.partialCount, label: 'Sebagian' },
    { icon: 'fa-circle-xmark',      bg: '#f1f5f9', color: '#64748b', val: s.noneCount,    label: 'Belum Mulai' },
    { icon: 'fa-file-lines',        bg: '#dbeafe', color: '#2563eb', val: s.totalAnswers, label: 'Total Jawaban' },
    { icon: 'fa-check-double',      bg: '#dcfce7', color: '#16a34a', val: s.totalGraded,  label: 'Sudah Dikoreksi' },
    { icon: 'fa-hourglass-half',    bg: '#fce7f3', color: '#db2777', val: s.totalPending, label: 'Perlu Dikoreksi' }
  ];

  // Ganti skeleton dengan card nyata — grid tetap 7 kolom, tidak ada reflow grid
  el.innerHTML = cards.map(function(c) {
    return '<div class="eg-stat-card">' +
      '<div class="eg-stat-icon" style="background:' + c.bg + ';color:' + c.color + ';">' +
        '<i class="fas ' + c.icon + '"></i>' +
      '</div>' +
      '<div class="eg-stat-value">' + (c.val != null ? c.val : 0) + '</div>' +
      '<div class="eg-stat-label">' + c.label + '</div>' +
    '</div>';
  }).join('');
}

// ── Sort toggle ───────────────────────────────────────────────────────────────
function _egToggleSort() {
  var ui = window._egUI;
  if (!ui) return;
  var btn = document.getElementById('eg-sort-btn');
  var modes = ['default', 'pct-desc', 'pct-asc'];
  var labels = {
    'default':  '<i class="fas fa-arrow-up-wide-short"></i> Urutan',
    'pct-desc': '<i class="fas fa-arrow-down-wide-short"></i> % Terbesar',
    'pct-asc':  '<i class="fas fa-arrow-up-wide-short"></i> % Terkecil'
  };
  var cur = ui.sortMode || 'default';
  var idx = modes.indexOf(cur);
  ui.sortMode = modes[(idx + 1) % modes.length];
  if (btn) {
    btn.innerHTML = labels[ui.sortMode];
    btn.classList.toggle('active', ui.sortMode !== 'default');
  }
  _egApplyFilter();
}

// ── Filter & render daftar jadwal ─────────────────────────────────────────────
function _egApplyFilter() {
  var ui = window._egUI;
  if (!ui || !ui.data) return;

  var searchEl  = document.getElementById('eg-search');
  var subjectEl = document.getElementById('eg-filter-subject');
  var kelasEl   = document.getElementById('eg-filter-kelas');
  var statusEl  = document.getElementById('eg-filter-status');

  var search  = searchEl  ? searchEl.value.trim().toLowerCase()  : ui.search;
  var subject = subjectEl ? subjectEl.value : ui.filterSubject;
  var kelas   = kelasEl   ? kelasEl.value   : ui.filterKelas;
  var status  = statusEl  ? statusEl.value  : ui.filterStatus;

  ui.search = search; ui.filterSubject = subject;
  ui.filterKelas = kelas; ui.filterStatus = status;

  var exams = (ui.data.exams || []).filter(function(e) {
    if (search && !(
      e.title.toLowerCase().includes(search)   ||
      e.subject.toLowerCase().includes(search) ||
      e.kelas.toLowerCase().includes(search)
    )) return false;
    if (subject && e.subject !== subject) return false;
    if (kelas && !e.kelas.split(',').map(function(k){ return k.trim(); }).includes(kelas)) return false;
    if (status && e.gradingStatus !== status) return false;
    return true;
  });

  var mode = ui.sortMode || 'default';
  if (mode === 'pct-desc') {
    exams = exams.slice().sort(function(a,b){ return b.progressPct - a.progressPct; });
  } else if (mode === 'pct-asc') {
    exams = exams.slice().sort(function(a,b){ return a.progressPct - b.progressPct; });
  }

  ui.filtered = exams;

  var countEl = document.getElementById('eg-results-count');
  if (countEl) {
    var total = (ui.data.exams || []).length;
    countEl.textContent = exams.length < total
      ? (exams.length + ' dari ' + total + ' jadwal')
      : (total + ' jadwal');
  }

  _egRenderList(exams);
}

// ── Render kartu daftar jadwal ────────────────────────────────────────────────
function _egRenderList(exams) {
  var el = document.getElementById('eg-list');
  if (!el) return;

  // Hapus class reserved space — konten nyata sudah mengisi ruang
  el.classList.remove('eg-list-loading');

  if (!exams || exams.length === 0) {
    var hasData = window._egUI && window._egUI.data && Array.isArray(window._egUI.data.exams);
    var isEmpty = hasData && window._egUI.data.exams.length === 0;
    // Pesan empty state yang kontekstual berdasarkan role
    var isGuru = currentUser && currentUser.role === 'Guru';
    var emptyTitle, emptyMsg, emptyIcon;
    if (isEmpty) {
      emptyIcon = 'fa-clipboard-list';
      if (isGuru) {
        emptyTitle = 'Tidak Ada Jadwal Esai Milik Anda';
        emptyMsg   = 'Belum ada jadwal ujian yang ditugaskan kepada Anda dan memiliki soal tipe Esai. Pastikan mata pelajaran dan kelas pada akun Anda sudah dikonfigurasi oleh Admin.';
      } else {
        emptyTitle = 'Belum Ada Data Esai';
        emptyMsg   = 'Belum ada jadwal ujian yang memiliki soal tipe Esai.';
      }
    } else {
      emptyIcon  = 'fa-magnifying-glass';
      emptyTitle = 'Tidak ada hasil';
      emptyMsg   = 'Tidak ada jadwal yang cocok dengan filter saat ini.';
    }
    el.innerHTML =
      '<div class="eg-empty">' +
        '<i class="fas ' + emptyIcon + '" style="color:#94a3b8;"></i>' +
        '<p>' +
          '<strong>' + emptyTitle + '</strong>' +
          emptyMsg +
        '</p>' +
        (isEmpty ? '' : '<button onclick="_egResetFilter()" style="margin-top:10px;padding:6px 14px;border-radius:8px;background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;font-size:12px;font-weight:600;cursor:pointer;">Reset Filter</button>') +
      '</div>';
    return;
  }

  // Render card nyata — tidak ada fade-in translateY yang menggeser layout
  el.innerHTML = '<div class="eg-exam-list">' +
    exams.map(function(e) { return _egExamCard(e); }).join('') +
  '</div>';
}

// Tombol reset filter
function _egResetFilter() {
  var ui = window._egUI;
  if (!ui) return;
  ui.search = ''; ui.filterSubject = ''; ui.filterKelas = ''; ui.filterStatus = '';
  var s = document.getElementById('eg-search');         if (s) s.value = '';
  var a = document.getElementById('eg-filter-subject'); if (a) a.value = '';
  var b = document.getElementById('eg-filter-kelas');   if (b) b.value = '';
  var c = document.getElementById('eg-filter-status');  if (c) c.value = '';
  _egApplyFilter();
}

// ── Buat HTML kartu satu jadwal ───────────────────────────────────────────────
function _egExamCard(e) {
  var pct      = e.progressPct || 0;
  var sMap     = { done: 'Selesai', partial: 'Sebagian', none: 'Belum Dikoreksi' };
  var sIcon    = { done: 'fa-circle-check', partial: 'fa-clock-rotate-left', none: 'fa-circle-xmark' };
  var label    = sMap[e.gradingStatus]  || 'Belum Dikoreksi';
  var icon     = sIcon[e.gradingStatus] || 'fa-circle-xmark';
  var pctColor = e.gradingStatus === 'done' ? '#059669' : e.gradingStatus === 'partial' ? '#d97706' : '#94a3b8';

  var kelasHtml = e.kelas.split(',').map(function(k) {
    var t = k.trim();
    return t ? '<span style="background:#eef2ff;color:#4338ca;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:600;">' + _egEsc(t) + '</span>' : '';
  }).join(' ');

  var lastGraderHtml = (e.lastGradedBy && e.lastGradedBy !== '-')
    ? '<span><i class="fas fa-user-pen"></i>Terakhir: ' + _egEsc(e.lastGradedBy) + ' &middot; ' + _egEsc(e.lastGradedTime) + '</span>'
    : '';

  // Tidak pakai class fade-in pada kartu list agar tidak ada translateY yang menyebabkan reflow
  return '<div class="eg-exam-card status-' + e.gradingStatus + '"' +
    ' role="button" tabindex="0"' +
    ' data-examid="' + _egEsc(e.examID) + '"' +
    ' title="Klik untuk melihat detail koreksi"' +
    ' onclick="_egOpenDetail(this.dataset.examid)"' +
    ' onkeydown="if(event.key===\'Enter\'||event.key===\' \')_egOpenDetail(this.dataset.examid)">' +

    '<div class="eg-card-top">' +
      '<div style="min-width:0;flex:1;">' +
        '<p class="eg-card-title">' + _egEsc(e.subject) + '</p>' +
        '<div class="eg-card-meta">' +
          '<span><i class="fas fa-chalkboard-teacher"></i>' + kelasHtml + '</span>' +
          '<span><i class="fas fa-calendar-days"></i>' + _egEsc(e.dateStr) + '</span>' +
          lastGraderHtml +
        '</div>' +
      '</div>' +
      '<span class="eg-badge eg-badge-' + e.gradingStatus + '">' +
        '<i class="fas ' + icon + '"></i>' + label +
      '</span>' +
    '</div>' +

    '<div class="eg-progress-wrap">' +
      '<div class="eg-progress-label">' +
        '<span>Progres Koreksi</span>' +
        '<span style="font-weight:800;color:' + pctColor + ';font-size:12px;">' + pct + '%</span>' +
      '</div>' +
      '<div class="eg-progress-track">' +
        '<div class="eg-progress-bar ' + e.gradingStatus + '" style="width:' + pct + '%;"></div>' +
      '</div>' +
    '</div>' +

    '<div class="eg-card-stats">' +
      '<div class="eg-card-stat"><i class="fas fa-file-pen"></i>' + e.essayQuestionCount + ' soal esai</div>' +
      '<div class="eg-card-stat"><i class="fas fa-users"></i>' + e.totalParticipants + ' peserta</div>' +
      '<div class="eg-card-stat"><i class="fas fa-file-lines"></i>' + e.totalAnswers + ' jawaban</div>' +
      '<div class="eg-card-stat" style="color:#059669;border-color:#a7f3d0;background:#f0fdf4;">' +
        '<i class="fas fa-check-double" style="color:#059669;"></i>' + e.gradedCount + ' dikoreksi' +
      '</div>' +
      '<div class="eg-card-stat" style="color:#dc2626;border-color:#fca5a5;background:#fef2f2;">' +
        '<i class="fas fa-hourglass-half" style="color:#dc2626;"></i>' + e.pendingCount + ' perlu koreksi' +
      '</div>' +
    '</div>' +
  '</div>';
}

// ── Buka modal detail ─────────────────────────────────────────────────────────
function _egOpenDetail(examID) {
  if (!examID) return;
  var overlay = document.getElementById('eg-modal-overlay');
  var body    = document.getElementById('eg-modal-body');
  var footer  = document.getElementById('eg-modal-footer');
  var titleEl = document.getElementById('eg-modal-title-el');
  var subEl   = document.getElementById('eg-modal-sub-el');
  if (!overlay || !body) return;

  // Footer: visibility hidden (bukan display:none) agar modal tidak berubah tinggi saat footer muncul
  if (footer) footer.style.visibility = 'hidden';

  // Tampilkan skeleton modal body sebelum modal dibuka —
  // ini penting agar modal tidak berubah ukuran saat data masuk
  body.innerHTML = _egSkeletonModalBody();

  // Tampilkan modal (setelah skeleton sudah di DOM, sehingga ukuran modal stabil sejak awal)
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Judul sementara dari cache
  var cached = null;
  if (window._egUI && window._egUI.data) {
    cached = (window._egUI.data.exams || []).find(function(e) { return e.examID === examID; });
  }
  if (cached) {
    if (titleEl) titleEl.textContent = cached.subject;
    if (subEl)   subEl.textContent   = cached.kelas + ' · ' + cached.dateStr;
  }

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.success) {
        // Error state: ganti skeleton dengan pesan error; modal tidak berubah ukuran signifikan
        body.innerHTML =
          '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
               'height:100%;min-height:200px;gap:12px;padding:32px;text-align:center;">' +
            '<i class="fas fa-triangle-exclamation" style="color:#f59e0b;font-size:32px;"></i>' +
            '<div>' +
              '<p style="font-weight:700;color:#475569;font-size:14px;margin:0 0 4px;">Gagal Memuat Detail</p>' +
              '<p style="color:#94a3b8;font-size:12px;margin:0;">' + _egEsc(res ? res.message : 'Terjadi kesalahan.') + '</p>' +
            '</div>' +
          '</div>';
        if (footer) {
          footer.style.visibility = 'visible';
          footer.innerHTML =
            '<button class="eg-modal-action-btn secondary" onclick="_egCloseModalBtn()">' +
              '<i class="fas fa-times"></i> Tutup' +
            '</button>';
        }
        return;
      }
      _egRenderDetail(res, examID);
    })
    .withFailureHandler(function(err) {
      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
             'height:100%;min-height:200px;gap:12px;padding:32px;text-align:center;">' +
          '<i class="fas fa-circle-exclamation" style="color:#ef4444;font-size:32px;"></i>' +
          '<div>' +
            '<p style="font-weight:700;color:#475569;font-size:14px;margin:0 0 4px;">Koneksi Gagal</p>' +
            '<p style="color:#94a3b8;font-size:12px;margin:0;">' + _egEsc(err && err.message ? err.message : String(err)) + '</p>' +
          '</div>' +
        '</div>';
      if (footer) {
        footer.style.visibility = 'visible';
        footer.innerHTML =
          '<button class="eg-modal-action-btn secondary" onclick="_egCloseModalBtn()">' +
            '<i class="fas fa-times"></i> Tutup' +
          '</button>';
      }
    })
    .getEssayGradingDetail(examID, currentUser.userID, currentUser.token);
}

// ── Render isi modal detail ───────────────────────────────────────────────────
function _egRenderDetail(res, examID) {
  var body    = document.getElementById('eg-modal-body');
  var titleEl = document.getElementById('eg-modal-title-el');
  var subEl   = document.getElementById('eg-modal-sub-el');
  var footer  = document.getElementById('eg-modal-footer');
  if (!body) return;

  var ei = res.examInfo || {};
  var sm = res.summary  || {};
  if (titleEl) titleEl.textContent = ei.subject || 'Detail Koreksi';
  if (subEl)   subEl.textContent   = (ei.kelas || '') + ' · ' + (ei.dateStr || '');

  var totalAnswers = sm.totalAnswers  || 0;
  var graded       = sm.gradedAnswers || 0;
  var pct          = totalAnswers > 0 ? Math.round((graded / totalAnswers) * 100) : 0;
  var gradStatus   = (graded >= totalAnswers && totalAnswers > 0) ? 'done' : (graded > 0 ? 'partial' : 'none');
  var pctColor     = gradStatus === 'done' ? '#059669' : gradStatus === 'partial' ? '#d97706' : '#94a3b8';

  var sumCards = [
    { val: sm.totalParticipants  || 0, lbl: 'Peserta',        color: '#4338ca' },
    { val: sm.essayQuestionCount || 0, lbl: 'Soal Esai',      color: '#0369a1' },
    { val: totalAnswers,               lbl: 'Total Jawaban',   color: '#1e293b' },
    { val: graded,                     lbl: 'Sudah Dikoreksi', color: '#059669' },
    { val: sm.pendingAnswers     || 0, lbl: 'Perlu Dikoreksi', color: '#dc2626' }
  ];

  var sumHtml = sumCards.map(function(c) {
    return '<div class="eg-modal-stat">' +
      '<div class="eg-modal-stat-val" style="color:' + c.color + ';">' + c.val + '</div>' +
      '<div class="eg-modal-stat-lbl">' + c.lbl + '</div>' +
    '</div>';
  }).join('');

  var progressHtml =
    '<div class="eg-modal-progress-wrap">' +
      '<div class="eg-modal-progress-label">' +
        '<span>Progres Keseluruhan</span>' +
        '<span style="color:' + pctColor + ';">' + pct + '%</span>' +
      '</div>' +
      '<div class="eg-progress-track" style="height:9px;">' +
        '<div class="eg-progress-bar ' + gradStatus + '" style="width:' + pct + '%;"></div>' +
      '</div>' +
    '</div>';

  var graders = res.graders || [];
  var gradersHtml;
  if (graders.length > 0) {
    gradersHtml =
      '<div class="eg-grader-list">' +
      graders.map(function(g) {
        var initial = g.actorName ? g.actorName.charAt(0).toUpperCase() : '?';
        return '<div class="eg-grader-item">' +
          '<div class="eg-grader-avatar">' + _egEsc(initial) + '</div>' +
          '<span class="eg-grader-name">' + _egEsc(g.actorName) + '</span>' +
          '<span class="eg-grader-time"><i class="fas fa-clock" style="margin-right:3px;"></i>' + _egEsc(g.lastGraded) + '</span>' +
        '</div>';
      }).join('') +
      '</div>';
  } else {
    gradersHtml =
      '<div style="background:#fafafa;border:1px solid #f1f5f9;border-radius:10px;padding:12px 14px;">' +
        '<p style="margin:0;font-size:12px;color:#94a3b8;">' +
          '<i class="fas fa-info-circle" style="margin-right:4px;"></i>' +
          'Belum ada riwayat koreksi untuk jadwal ini.' +
        '</p>' +
      '</div>';
  }

  var parts = res.participants || [];
  var stMap = { done: 'Selesai', partial: 'Sebagian', none: 'Belum' };
  var stCls = { done: 'eg-badge-done', partial: 'eg-badge-partial', none: 'eg-badge-none' };

  var tableRows;
  if (parts.length > 0) {
    tableRows = parts.map(function(p, i) {
      var pctP = p.totalEssay > 0 ? Math.round((p.gradedCount / p.totalEssay) * 100) : 0;
      return '<tr>' +
        '<td style="font-weight:600;color:#94a3b8;text-align:center;">' + (i + 1) + '</td>' +
        '<td>' +
          '<div style="font-weight:600;color:#1e293b;word-break:break-word;">' + _egEsc(p.studentName) + '</div>' +
          '<div style="font-size:10px;color:#94a3b8;">' + _egEsc(p.studentClass) + ' &middot; ' + _egEsc(p.studentID) + '</div>' +
        '</td>' +
        '<td style="text-align:center;font-weight:600;">' + p.gradedCount + '/' + p.totalEssay + '</td>' +
        '<td>' +
          '<div class="mini-bar-wrap">' +
            '<div class="mini-bar-track">' +
              '<div class="mini-bar-fill ' + p.gradingStatus + '" style="width:' + pctP + '%;"></div>' +
            '</div>' +
            '<span class="mini-bar-pct">' + pctP + '%</span>' +
          '</div>' +
        '</td>' +
        '<td><span class="eg-badge ' + (stCls[p.gradingStatus] || 'eg-badge-none') + '" style="font-size:10px;padding:3px 8px;">' + (stMap[p.gradingStatus] || 'Belum') + '</span></td>' +
        '<td style="font-size:10px;color:#94a3b8;white-space:nowrap;">' + _egEsc(p.submitTimeStr) + '</td>' +
      '</tr>';
    }).join('');
  } else {
    tableRows = '<tr><td colspan="6" style="text-align:center;padding:24px 12px;color:#94a3b8;font-size:12px;">Belum ada peserta yang menyelesaikan ujian ini.</td></tr>';
  }

  // Ganti skeleton body dengan konten nyata — satu kali innerHTML assignment, tidak bertahap
  body.innerHTML =
    '<div>' +
      '<div class="eg-section-title"><i class="fas fa-chart-bar"></i>Ringkasan Progres</div>' +
      '<div class="eg-modal-summary">' + sumHtml + '</div>' +
      progressHtml +
    '</div>' +

    '<div>' +
      '<div class="eg-section-title"><i class="fas fa-user-pen"></i>Pengoreksi</div>' +
      gradersHtml +
    '</div>' +

    '<div>' +
      '<div class="eg-section-title"><i class="fas fa-users"></i>Detail Per Peserta</div>' +
      '<div class="eg-table-wrap">' +
        '<table class="eg-table">' +
          '<thead><tr>' +
            '<th style="width:36px;text-align:center;">#</th>' +
            '<th>Peserta</th>' +
            '<th style="text-align:center;width:74px;">Terkoreksi</th>' +
            '<th style="min-width:110px;">Progres</th>' +
            '<th style="width:90px;">Status</th>' +
            '<th style="width:100px;">Submit</th>' +
          '</tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</div>' +
      (parts.length > 0
        ? '<p style="font-size:10px;color:#94a3b8;margin:5px 2px 0;"><i class="fas fa-info-circle" style="margin-right:3px;"></i>Urutan: belum &rarr; sebagian &rarr; selesai</p>'
        : '') +
    '</div>';

  // Tampilkan footer — gunakan visibility bukan display agar modal tidak berubah tinggi
  if (footer) {
    var hasPending = (sm.pendingAnswers || 0) > 0;
    footer.style.visibility = 'visible';
    footer.innerHTML =
      (hasPending
        ? '<button class="eg-modal-action-btn primary" onclick="_egGoToGrading();_egCloseModalBtn();">' +
            '<i class="fas fa-pen-to-square"></i> Koreksi Esai Sekarang' +
          '</button>'
        : '<button class="eg-modal-action-btn primary" style="opacity:.6;cursor:default;" disabled>' +
            '<i class="fas fa-circle-check"></i> Semua Sudah Dikoreksi' +
          '</button>') +
      '<button class="eg-modal-action-btn secondary" onclick="_egCloseModalBtn()">' +
        '<i class="fas fa-times"></i> Tutup' +
      '</button>';
  }
}

// Navigasi ke halaman Koreksi Esai
function _egGoToGrading() {
  if (typeof showAdminTab === 'function') {
    showAdminTab('dash-item-analysis');
  }
}

// ── Tutup modal ───────────────────────────────────────────────────────────────
function _egCloseModalBtn() {
  var overlay = document.getElementById('eg-modal-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Error state ───────────────────────────────────────────────────────────────
function _egShowError(msg) {
  var listEl = document.getElementById('eg-list');
  if (listEl) {
    listEl.classList.remove('eg-list-loading');
    listEl.innerHTML =
      '<div class="eg-empty">' +
        '<i class="fas fa-circle-exclamation" style="color:#ef4444;"></i>' +
        '<p><strong>Gagal Memuat Data</strong>' + _egEsc(msg || 'Terjadi kesalahan tidak diketahui.') + '</p>' +
      '</div>';
  }
  var ui = window._egUI;
  if (ui) {
    ui.data = null; ui.subjects = []; ui.kelasArr = [];
    _egPopulateFilters();
  }
  var emptySum = { totalExams:0, doneCount:0, partialCount:0, noneCount:0, totalAnswers:0, totalGraded:0, totalPending:0 };
  _egRenderSummary(emptySum);
  _egRenderHeaderPills(emptySum);
}

// ── Escape HTML ───────────────────────────────────────────────────────────────
function _egEsc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
