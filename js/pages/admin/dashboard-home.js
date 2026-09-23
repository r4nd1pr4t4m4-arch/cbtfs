/**
 * dashboard-home.js — Dashboard Overview
 * renderAdminHome() + _dashRelTime, _examLiveStatus_
 * Sumber: index.html L18208-18491
 */

function renderAdminHome(container) {
  const exams = Array.isArray(cachedExams) ? cachedExams : [];
  const totalExams  = exams.length;
  const activeExams = exams.filter(e => e.status === 'Aktif' || e.status === 'Open').length;
  const draftExams  = totalExams - activeExams;
  const uniqueSubjects = [...new Set(exams.map(e => (e.subject || '').trim()).filter(Boolean))].length;

  // Today's exams (compare YYYY-MM-DD in app TZ)
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
  const todaysExams = exams.filter(e => {
    if (!e.startDate) return false;
    try {
      const d = new Date(e.startDate);
      return d.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE }) === todayStr;
    } catch (err) { return false; }
  });

  // Activity timeline data — derived from real cachedExams + login event
  const lastSession = (() => {
    try {
      const s = localStorage.getItem('sipadu_session');
      return s ? JSON.parse(s) : null;
    } catch (e) { return null; }
  })();
  const loginAgoStr = lastSession && lastSession.loginTime
    ? _dashRelTime(lastSession.loginTime)
    : 'Baru saja';

  // Activity items
  const activityItems = [];
  activityItems.push({
    color: 'emerald',
    icon: 'fa-right-to-bracket',
    title: 'Sesi Aktif',
    desc: `Anda masuk sebagai <b>${currentUser.role}</b>${currentUser.username ? ' — ' + currentUser.username : ''}.`,
    when: loginAgoStr
  });
  if (activeExams > 0) {
    activityItems.push({
      color: 'blue',
      icon: 'fa-circle-check',
      title: `${activeExams} Ujian Aktif`,
      desc: 'Ada ujian yang siap diakses oleh siswa saat ini.',
      when: 'Status terkini'
    });
  }
  if (todaysExams.length > 0) {
    activityItems.push({
      color: 'amber',
      icon: 'fa-calendar-day',
      title: `${todaysExams.length} Ujian Hari Ini`,
      desc: todaysExams.slice(0,2).map(e => `${e.subject} (${e.class})`).join(' · ')
            + (todaysExams.length > 2 ? ` +${todaysExams.length-2} lainnya` : ''),
      when: 'Hari ini'
    });
  }
  if (draftExams > 0) {
    activityItems.push({
      color: 'slate',
      icon: 'fa-pen-ruler',
      title: `${draftExams} Jadwal Non-Aktif`,
      desc: 'Beberapa jadwal masih dalam mode persiapan / belum dibuka.',
      when: 'Perlu ditinjau'
    });
  }
  activityItems.push({
    color: 'slate',
    icon: 'fa-database',
    title: 'Sistem Siap',
    desc: 'Terhubung ke Google Sheets dan menunggu interaksi pengguna.',
    when: ''
  });

  const colorMap = {
    emerald: 'bg-emerald-500 ring-emerald-50',
    blue:    'bg-blue-500 ring-blue-50',
    amber:   'bg-amber-500 ring-amber-50',
    slate:   'bg-slate-300'
  };
  const activityHtml = activityItems.map((it, idx) => `
    <div class="timeline-item">
      <div class="timeline-dot ${colorMap[it.color] || colorMap.slate} ${idx === 0 ? 'ring-4' : ''}"></div>
      <p class="text-sm font-bold text-slate-700 flex items-center gap-2">
        <i class="fas ${it.icon} text-${it.color}-500 text-xs"></i> ${it.title}
      </p>
      <p class="text-xs text-slate-500 mt-1">${it.desc}</p>
      ${it.when ? `<span class="text-[10px] font-bold text-slate-400 mt-1 block bg-slate-100 w-fit px-2 rounded">${it.when}</span>` : ''}
    </div>
  `).join('');

  container.innerHTML = `
    <div class="fade-in w-full space-y-4 sm:space-y-5">

      <!-- ══ HEADER CARD ══ -->
      <!-- BUG #4,#6,#17 FIX: hapus ml-14 yang menyebabkan overflow mobile;
           ganti gap-6 menjadi gap-3 sm:gap-4 di mobile; perbaiki alignment button group -->
      <div class="dash-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <i class="fas fa-home text-sm"></i>
          </div>
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">Dashboard Overview</h2>
            <p class="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">Selamat datang, <b>${currentUser.username || ''}</b> &mdash; pantau aktivitas ujian.</p>
          </div>
        </div>
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div class="hidden lg:block text-right pr-3 border-r border-slate-200">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari Ini</p>
            <p class="text-xs font-bold text-slate-700">
              ${new Date().toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: APP_TIMEZONE})}
            </p>
          </div>
          <button onclick="refreshDashboard()" class="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-blue-600 shadow-sm transition flex items-center gap-1.5 whitespace-nowrap">
            <i class="fas fa-sync-alt"></i> <span class="hidden xs:inline">Refresh</span>
          </button>
          ${currentUser.role === 'Admin' ? `
          <button onclick="openExamModal()" class="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/25 transition flex items-center gap-1.5 whitespace-nowrap active:scale-95">
            <i class="fas fa-plus"></i> <span>Buat Ujian</span>
          </button>` : ''}
        </div>
      </div>

      <!-- ══ STAT CARDS ══ -->
      <!-- BUG #5,#18 FIX: gap-4 mobile, gap-5 md — lebih proporsional daripada gap-6 di semua breakpoint -->
      <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

        <div class="dash-card p-4 sm:p-5 relative group overflow-visible cursor-pointer" onclick="showAdminTab('dash-exams')">
          <div class="flex justify-between items-start">
            <div class="min-w-0 flex-1 mr-2">
              <p class="text-slate-400 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Total Jadwal</p>
              <h3 class="text-2xl sm:text-3xl font-black text-slate-800 leading-none">${totalExams}</h3>
            </div>
            <div class="stat-card-icon bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
              <i class="fas fa-book"></i>
            </div>
          </div>
          <div class="mt-3 flex items-center flex-wrap gap-1.5 text-xs font-medium">
            <span class="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
              <i class="fas fa-check-circle text-[10px]"></i>${activeExams} Aktif
            </span>
            <span class="text-slate-400">${draftExams} Nonaktif</span>
          </div>
        </div>

        <div class="dash-card p-4 sm:p-5 relative group overflow-visible cursor-pointer" onclick="showAdminTab('dash-exams')" title="Jadwal yang dimulai hari ini">
          <div class="flex justify-between items-start">
            <div class="min-w-0 flex-1 mr-2">
              <p class="text-slate-400 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Ujian Hari Ini</p>
              <h3 class="text-2xl sm:text-3xl font-black text-slate-800 leading-none">${todaysExams.length}</h3>
            </div>
            <div class="stat-card-icon bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex-shrink-0">
              <i class="fas fa-calendar-day"></i>
            </div>
          </div>
          <div class="mt-3 text-xs font-medium">
            ${todaysExams.length > 0
              ? `<span class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1 w-fit"><i class="fas fa-bullseye text-[10px]"></i>Siap dilaksanakan</span>`
              : `<span class="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1 w-fit"><i class="fas fa-coffee text-[10px]"></i>Tidak ada ujian</span>`}
          </div>
        </div>

        <div class="dash-card p-4 sm:p-5 relative group overflow-visible cursor-pointer" onclick="showAdminTab('dash-questions')">
          <div class="flex justify-between items-start">
            <div class="min-w-0 flex-1 mr-2">
              <p class="text-slate-400 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Mata Pelajaran</p>
              <h3 class="text-2xl sm:text-3xl font-black text-slate-800 leading-none">${uniqueSubjects}</h3>
            </div>
            <div class="stat-card-icon bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex-shrink-0">
              <i class="fas fa-layer-group"></i>
            </div>
          </div>
          <div class="mt-3 text-xs font-medium text-slate-500">
            <span class="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 flex items-center gap-1 w-fit">
              <i class="fas fa-database text-[10px]"></i>Terdaftar di sistem
            </span>
          </div>
        </div>

        <div class="dash-card p-4 sm:p-5 relative group overflow-visible">
          <div class="flex justify-between items-start">
            <div class="min-w-0 flex-1 mr-2">
              <p class="text-slate-400 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-1.5">Mode Akses</p>
              <h3 class="text-xl sm:text-2xl font-black text-slate-800 truncate leading-none">${currentUser ? currentUser.role : 'Admin'}</h3>
            </div>
            <div class="stat-card-icon bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors flex-shrink-0">
              <i class="fas fa-user-shield"></i>
            </div>
          </div>
          <div class="mt-3 text-xs font-medium text-slate-500 flex items-center gap-1">
            <i class="far fa-clock"></i> ${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit', timeZone: APP_TIMEZONE})} ${APP_TZ_LABEL}
          </div>
        </div>
      </div>

      <!-- ══ BOTTOM ROW: Aktivitas + Aksi Cepat ══ -->
      <!-- BUG #9 FIX: tambah md:grid-cols-2 agar tablet tidak single-column -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

        <div class="md:col-span-1 lg:col-span-2 dash-card p-4 sm:p-5">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <i class="fas fa-stream text-blue-500"></i> Aktivitas Terkini
            </h3>
            <button onclick="showAdminTab('dash-admin-logs')" class="text-xs text-blue-600 font-bold hover:bg-blue-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1">
              Lihat Log <i class="fas fa-arrow-right text-[10px]"></i>
            </button>
          </div>
          <!-- CSS ISSUE #1 FIX: hapus space-y-1, gunakan padding-bottom di .timeline-item -->
          <div class="pl-1">${activityHtml}</div>
        </div>

        <div class="dash-card p-4 sm:p-5">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <i class="fas fa-bolt text-amber-500"></i> Aksi Cepat
            </h3>
          </div>
          <!-- BUG #16 FIX: pisahkan wrapper ikon (.dash-qa-icon) dari class FA agar Tailwind bg-* tidak konflik -->
          <div class="space-y-1.5">
            ${currentUser.role === 'Admin' ? `
            <button class="dash-quick-action" onclick="openExamModal()">
              <span class="dash-qa-icon bg-blue-100 text-blue-600"><i class="fas fa-plus text-xs"></i></span>
              <span><b class="block text-slate-700 text-xs">Buat Jadwal Ujian</b><span class="text-[10px] text-slate-400 font-medium">Tambah ujian baru</span></span>
            </button>` : ''}
            <button class="dash-quick-action" onclick="showAdminTab('dash-questions')">
              <span class="dash-qa-icon bg-indigo-100 text-indigo-600"><i class="fas fa-pen-to-square text-xs"></i></span>
              <span><b class="block text-slate-700 text-xs">Kelola Bank Soal</b><span class="text-[10px] text-slate-400 font-medium">Tambah / edit pertanyaan</span></span>
            </button>
            <button class="dash-quick-action" onclick="showAdminTab('dash-progress-soal')">
              <span class="dash-qa-icon bg-purple-100 text-purple-600"><i class="fas fa-chart-pie text-xs"></i></span>
              <span><b class="block text-slate-700 text-xs">Progress Soal</b><span class="text-[10px] text-slate-400 font-medium">Pantau kelengkapan soal</span></span>
            </button>
            <button class="dash-quick-action" onclick="showAdminTab('dash-results')">
              <span class="dash-qa-icon bg-emerald-100 text-emerald-600"><i class="fas fa-chart-column text-xs"></i></span>
              <span><b class="block text-slate-700 text-xs">Hasil &amp; Nilai</b><span class="text-[10px] text-slate-400 font-medium">Cek capaian siswa</span></span>
            </button>
            ${currentUser.role === 'Admin' ? `
            <button class="dash-quick-action" onclick="showAdminTab('dash-kartu-siswa')">
              <span class="dash-qa-icon bg-amber-100 text-amber-600"><i class="fas fa-id-card text-xs"></i></span>
              <span><b class="block text-slate-700 text-xs">Kartu Ujian Siswa</b><span class="text-[10px] text-slate-400 font-medium">Cetak kartu peserta</span></span>
            </button>` : ''}
            <button class="dash-quick-action" onclick="openDashCmdK()">
              <span class="dash-qa-icon bg-slate-100 text-slate-500"><i class="fas fa-search text-xs"></i></span>
              <span><b class="block text-slate-700 text-xs">Pencarian Cepat</b><span class="text-[10px] text-slate-400 font-medium">Tekan <kbd class="dash-cmdk-kbd">Ctrl K</kbd></span></span>
            </button>
          </div>
        </div>

      </div>
    </div>`;

  // Refresh notification badge after dashboard render
  if (typeof updateDashBellBadge === 'function') updateDashBellBadge();
}

// ───── Dashboard helpers ─────
function _dashRelTime(ts) {
  if (!ts) return '';
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.round(diff / 1000);
  if (sec < 30)   return 'Baru saja';
  if (sec < 60)   return `${sec} detik lalu`;
  const min = Math.round(sec / 60);
  if (min < 60)   return `${min} menit lalu`;
  const hr  = Math.round(min / 60);
  if (hr  < 24)   return `${hr} jam lalu`;
  const day = Math.round(hr / 24);
  return `${day} hari lalu`;
}

// ── FIX: helper liveStatus yang dibagi antara renderExamForm, handleDeleteAllExams,
//         dan fungsi lain agar kalkulasi status selalu konsisten ──
function _examLiveStatus_(e, now) {
  const _now = now != null ? now : Date.now();
  const start = e.date    ? new Date(e.date).getTime()    : null;
  const end   = e.endDate ? new Date(e.endDate).getTime() : null;
  const saved = String(e.status || '').toLowerCase();
  if (saved === 'aktif' && start && end && _now >= start && _now <= end) return 'live';
  if (start && _now < start) return 'upcoming';
  if (end   && _now > end)   return 'ended';
  if (saved === 'aktif')     return 'aktif';
  return 'nonaktif';
}