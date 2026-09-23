/**
 * supervisors.js — Manajemen Pengawas
 * Sumber: index.html L45329-48674
 */

function initSupervisorPanel() {
  // FIX BUG 5: gunakan guard agar pemanggilan _svStopLive() aman
  // meski fungsi dipanggil sebelum semua definisi modul siap
  if (typeof _svStopLive === 'function') _svStopLive();
  if (window._svTimerInterval) { clearInterval(window._svTimerInterval); window._svTimerInterval = null; }

  switchPage('page-admin');

  // Header info
  const nameEl   = document.getElementById('admin-sidebar-name');
  const roleEl   = document.getElementById('sidebar-role-badge');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl)   nameEl.innerText   = currentUser.username || 'Pengawas';
  if (roleEl)   roleEl.textContent = 'Pengawas Ujian';
  if (avatarEl) avatarEl.textContent = (currentUser.username || 'P').charAt(0).toUpperCase();

  setDateDisplay();
  fetchAndStartClock();

  // Sembunyikan semua menu kecuali yang boleh diakses Pengawas
  const svAllowedTabs = ['dash-home', 'dash-sv-monitor'];
  document.querySelectorAll('.sidebar-item').forEach(el => {
    const tab = el.dataset.tab || '';
    if (!svAllowedTabs.includes(tab)) {
      el.classList.add('hidden');
    } else {
      el.classList.remove('hidden');
    }
  });

  // Sembunyikan semua section-label dan divider bawaan, karena menu sangat sedikit
  document.querySelectorAll('.sidebar-section-label, .sidebar-divider').forEach(el => {
    el.classList.add('hidden');
  });

  // Pastikan menu Monitor ada — inject sidebar item jika belum ada
  if (!document.querySelector('.sidebar-item[data-tab="dash-sv-monitor"]')) {
    const nav = document.querySelector('#admin-sidebar nav');
    if (nav) {
      const monitorItem = document.createElement('div');
      monitorItem.className  = 'sidebar-item';
      monitorItem.dataset.tab = 'dash-sv-monitor';
      monitorItem.dataset.tooltip = 'Monitor Ujian Saya';
      monitorItem.setAttribute('onclick', "showSvTab('dash-sv-monitor', this)");
      monitorItem.innerHTML  = `<i class="fas fa-desktop"></i><span class="sidebar-text">Monitor Ujian</span>`;
      nav.appendChild(monitorItem);
    }
  }

  // Ganti onclick sidebar item yang diizinkan agar pakai showSvTab
  document.querySelector('.sidebar-item[data-tab="dash-home"]')
    && document.querySelector('.sidebar-item[data-tab="dash-home"]')
        .setAttribute('onclick', "showSvTab('dash-home', this)");
  document.querySelector('.sidebar-item[data-tab="dash-sv-monitor"]')
    && document.querySelector('.sidebar-item[data-tab="dash-sv-monitor"]')
        .setAttribute('onclick', "showSvTab('dash-sv-monitor', this)");

  try {
    const saved = localStorage.getItem('sipadu_last_tab_' + currentUser.userID);
    const target = (saved === 'dash-sv-monitor') ? 'dash-sv-monitor' : 'dash-home';
    showSvTab(target);
  } catch(e) { showSvTab('dash-home'); }
}

// Router tab khusus Pengawas
function showSvTab(tabId, el) {
  if (_svMonitorLive && tabId !== 'dash-sv-monitor') {
    _svStopLive();
  }

  try { localStorage.setItem('sipadu_last_tab_' + currentUser.userID, tabId); } catch(e) {}

  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  const activeItem = el || document.querySelector(`.sidebar-item[data-tab="${tabId}"]`);
  if (activeItem) activeItem.classList.add('active');

  const content = document.getElementById('admin-content');
  const title   = document.getElementById('admin-header-title');
  if (!content || !title) return;

  if (window.innerWidth < 768) {
    const sb = document.getElementById('admin-sidebar');
    const ov = document.getElementById('mobile-overlay');
    if (sb) sb.classList.add('-translate-x-full');
    if (ov) ov.classList.add('hidden');
    document.body.style.overflow = '';
  }

  content.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400 fade-in">
    <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i> Memuat data...
  </div>`;

  if (tabId === 'dash-home') {
    title.innerText = 'Dashboard Pengawas';
    renderSupervisorHome(content);
  } else if (tabId === 'dash-sv-monitor') {
    title.innerText = 'Monitor Ujian Saya';
    renderSupervisorMonitor(content);
  }
}

// ─────────────────────────────────────────────────────────────────
// Navigasi ke halaman Monitor dengan filter ujian tertentu.
// Dipanggil dari tombol "Buka Monitor Ujian" di kartu ujian aktif.
// examID akan diterapkan ke filter chip setelah data monitor dimuat.
// ─────────────────────────────────────────────────────────────────
function showSvMonitor(examID) {
  // Simpan exam ID yang akan difilter — dibaca oleh renderSupervisorMonitor
  // setelah render shell selesai dan _svSetExamFilter tersedia
  window._svPendingExamFilter = examID || '';
  showSvTab('dash-sv-monitor');
}
// ─────────────────────────────────────────────────────────────────
// CSS ISSUE #4 FIX: inject scoped style hanya sekali dengan ID guard
// agar pemanggilan berulang (refresh) tidak menumpuk elemen <style> di DOM
function _svdInjectStyles() {
  if (document.getElementById('svd-scoped-styles')) return; // sudah ada, skip
  const styleEl = document.createElement('style');
  styleEl.id = 'svd-scoped-styles';
  styleEl.textContent = `
    /* ═══ Dashboard Pengawas — scoped styles ═══ */
    .svd-page { display:flex; flex-direction:column; gap:14px; }

    /* ── Header ── */
    .svd-header-banner {
      background: linear-gradient(135deg,#312e81 0%,#4338ca 55%,#6366f1 100%);
      border-radius: 16px; padding: 14px 16px;
      color: #fff; display: flex; align-items: center; gap: 12px;
      position: relative; overflow: hidden;
      box-shadow: 0 8px 28px rgba(99,102,241,.28);
    }
    .svd-header-banner::before {
      content:''; position:absolute; inset:0; pointer-events:none;
      background:url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M10 10h4v4h-4zM38 10h4v4h-4zM10 38h4v4h-4zM38 38h4v4h-4z'/%3E%3C/g%3E%3C/svg%3E");
    }
    .svd-header-banner::after {
      content:''; position:absolute; top:-50px; right:-30px;
      width:180px; height:180px; pointer-events:none;
      background: radial-gradient(circle, rgba(165,180,252,.2) 0%, transparent 65%);
    }
    .svd-header-avatar {
      width:42px; height:42px; border-radius:13px;
      background:rgba(255,255,255,.2); border:1.5px solid rgba(255,255,255,.3);
      display:flex; align-items:center; justify-content:center;
      font-size:17px; font-weight:900; flex-shrink:0; position:relative; z-index:1;
    }
    .svd-header-text { flex:1; min-width:0; position:relative; z-index:1; }
    /* BUG #19 FIX: font-size lebih kecil di mobile, jangan pakai nowrap agar nama panjang bisa wrap */
    .svd-header-greeting {
      font-size:14px; font-weight:800; line-height:1.3;
      overflow:hidden; text-overflow:ellipsis;
      display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
    }
    @media(min-width:480px){ .svd-header-greeting { font-size:16px; -webkit-line-clamp:1; white-space:nowrap; } }
    .svd-header-date { font-size:11px; color:rgba(255,255,255,.7); margin-top:3px; line-height:1.5; }
    .svd-header-date-sep { margin:0 5px; opacity:.5; }
    @media(max-width:479px){ .svd-header-date-sep, .svd-header-date span { display:none; } }
    .svd-refresh-btn {
      width:34px; height:34px; border-radius:10px; flex-shrink:0;
      background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.25);
      color:#fff; display:flex; align-items:center; justify-content:center;
      font-size:13px; cursor:pointer; transition:background .15s, transform .25s;
      position:relative; z-index:1;
    }
    .svd-refresh-btn:hover { background:rgba(255,255,255,.3); }
    .svd-refresh-btn:active { transform:rotate(180deg); }

    /* ── Stat grid ── */
    .svd-stat-grid {
      display:grid; grid-template-columns:repeat(2,1fr); gap:10px;
    }
    @media(min-width:640px){ .svd-stat-grid { grid-template-columns:repeat(4,1fr); gap:12px; } }
    .svd-stat-card {
      background:#fff; border:1px solid #e2e8f0; border-radius:14px;
      padding:12px 13px; display:flex; align-items:center; gap:10px;
      transition:transform .18s, box-shadow .18s;
    }
    .svd-stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(15,23,42,.07); }
    .svd-stat-icon {
      width:40px; height:40px; border-radius:11px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center; font-size:16px;
    }
    .svd-stat-body { flex:1; min-width:0; }
    .svd-stat-val { font-size:20px; font-weight:900; line-height:1; }
    .svd-stat-lbl { font-size:10px; color:#64748b; font-weight:600; margin-top:3px; line-height:1.3; }

    /* ── Section row ── */
    .svd-section-row {
      display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;
    }
    .svd-section-label {
      font-size:11px; font-weight:800; color:#64748b;
      text-transform:uppercase; letter-spacing:.07em;
    }
    .svd-link-btn {
      font-size:11px; font-weight:700; color:#4f46e5;
      background:#eef2ff; border:1px solid #e0e7ff; border-radius:8px;
      padding:5px 12px; cursor:pointer; transition:background .15s;
      display:inline-flex; align-items:center; gap:5px;
    }
    .svd-link-btn:hover { background:#e0e7ff; }

    /* ── Accordion ── */
    .svd-accordion {
      background:#fff; border:1px solid #e2e8f0; border-radius:14px;
      /* overflow:hidden dihapus — diganti clip pada header saja agar
         box-shadow kartu aktif & transform hover tidak terpotong */
      transition:box-shadow .2s;
    }
    .svd-accordion:hover { box-shadow:0 4px 14px rgba(15,23,42,.06); }
    /* Bulatkan sudut header agar sesuai border-radius accordion */
    .svd-acc-header {
      width:100%; display:flex; align-items:center; justify-content:space-between;
      padding:13px 15px; cursor:pointer; background:transparent; border:none;
      text-align:left; transition:background .15s; gap:12px;
      border-radius:14px 14px 0 0;
    }
    .svd-acc-header:hover { background:#f8fafc; }
    .svd-acc-header-left { display:flex; align-items:center; gap:10px; min-width:0; }
    .svd-acc-icon {
      width:34px; height:34px; border-radius:10px; flex-shrink:0;
      display:flex; align-items:center; justify-content:center; font-size:13px;
    }
    .svd-acc-title-wrap { display:flex; align-items:center; gap:8px; min-width:0; }
    .svd-acc-title { font-size:13px; font-weight:800; color:#1e293b; white-space:nowrap; }
    .svd-acc-badge {
      display:inline-flex; align-items:center; justify-content:center;
      min-width:22px; height:22px; padding:0 6px;
      border-radius:99px; font-size:11px; font-weight:800;
    }
    .svd-acc-chevron {
      color:#94a3b8; font-size:13px; flex-shrink:0;
      transition:transform .25s cubic-bezier(.4,0,.2,1);
    }
    .svd-acc-open .svd-acc-chevron { transform:rotate(180deg); }
    .svd-acc-body {
      /* Saat collapsed: clip konten agar tidak terlihat */
      max-height:0; overflow:hidden;
      transition:max-height .4s cubic-bezier(.4,0,.2,1), padding .25s;
      padding:0 12px;
    }
    /* Saat terbuka tapi animasi belum selesai */
    .svd-acc-open .svd-acc-body {
      max-height:9999px;
      overflow:hidden;
      padding:0 12px 14px;
    }
    /* Setelah animasi selesai: max-height:none agar tinggi dihitung
       benar oleh flex parent → scroll #admin-content bekerja.
       overflow:visible agar shadow & hover kartu tidak terpotong. */
    .svd-acc-expanded .svd-acc-body {
      max-height:none !important;
      overflow:visible !important;
    }

    /* ── Exam grid ── */
    .svd-exam-grid {
      display:grid; grid-template-columns:1fr; gap:10px;
      /* min-width:0 mencegah grid item overflow kontainer */
      min-width:0; width:100%;
    }
    @media(min-width:600px){ .svd-exam-grid { grid-template-columns:repeat(2,1fr); } }
    @media(min-width:1100px){ .svd-exam-grid { grid-template-columns:repeat(3,1fr); } }

    /* ── Exam card ── */
    .svd-exam-card {
      background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;
      padding:13px; display:flex; flex-direction:column; gap:10px;
      /* min-width:0 wajib pada grid item agar tidak overflow kolom */
      min-width:0; width:100%; box-sizing:border-box;
      transition:transform .18s, box-shadow .18s, border-color .18s;
    }
    .svd-exam-card:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(15,23,42,.07); }
    .svd-exam-card-active {
      background:#fff; border-color:#c7d2fe;
      box-shadow:0 0 0 3px rgba(99,102,241,.07);
    }
    .svd-exam-card-active:hover { box-shadow:0 6px 20px rgba(99,102,241,.14), 0 0 0 3px rgba(99,102,241,.09); }
    .svd-exam-card-head { display:flex; align-items:flex-start; gap:10px; }
    .svd-exam-avatar {
      width:38px; height:38px; border-radius:10px; flex-shrink:0;
      background:linear-gradient(135deg,#4f46e5,#818cf8);
      color:#fff; font-size:16px; font-weight:900;
      display:flex; align-items:center; justify-content:center;
    }
    .svd-exam-info { flex:1; min-width:0; }
    .svd-exam-subject {
      font-size:13px; font-weight:800; color:#1e293b;
      line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .svd-exam-kelas { font-size:11px; color:#64748b; margin-top:2px; }
    .svd-status-pill {
      display:inline-flex; align-items:center; gap:4px;
      padding:3px 8px; border-radius:20px; font-size:10px; font-weight:700;
      flex-shrink:0; white-space:nowrap; border:1px solid;
    }
    .svd-status-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
    .svd-status-aktif { background:#d1fae5; color:#065f46; border-color:#a7f3d0; }
    .svd-status-aktif .svd-status-dot {
      background:#10b981;
      animation:svd-pulse .9s ease-in-out infinite;
    }
    @keyframes svd-pulse {
      0%,100%{ box-shadow:0 0 0 0 rgba(16,185,129,.5); }
      50%    { box-shadow:0 0 0 4px rgba(16,185,129,0); }
    }
    .svd-exam-meta {
      display:grid; grid-template-columns:1fr 1fr; gap:5px 8px;
      background:#f1f5f9; border-radius:9px; padding:9px 11px;
    }
    .svd-meta-item {
      display:flex; align-items:center; gap:5px;
      font-size:11px; color:#475569; overflow:hidden;
    }
    .svd-meta-item span { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .svd-meta-icon { font-size:10px; flex-shrink:0; }
    .svd-progress-wrap { display:flex; flex-direction:column; gap:5px; }
    .svd-progress-row { display:flex; align-items:center; justify-content:space-between; }
    .svd-progress-lbl { font-size:11px; color:#64748b; font-weight:600; }
    .svd-progress-val { font-size:12px; font-weight:800; color:#1e293b; }
    .svd-progress-track { height:5px; background:#e2e8f0; border-radius:99px; overflow:hidden; }
    .svd-progress-fill {
      height:100%; background:linear-gradient(90deg,#4f46e5,#818cf8);
      border-radius:99px; transition:width .5s ease;
    }
    .svd-progress-stats { display:flex; gap:6px; flex-wrap:wrap; }
    .svd-prog-badge {
      display:inline-flex; align-items:center; gap:4px;
      padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700;
    }
    .svd-prog-done { background:#d1fae5; color:#065f46; }
    .svd-prog-wip  { background:#fef3c7; color:#92400e; }
    .svd-monitor-btn {
      width:100%; padding:9px; border-radius:10px;
      font-size:12px; font-weight:700;
      background:linear-gradient(135deg,#4f46e5,#6366f1);
      color:#fff; border:none; cursor:pointer;
      display:flex; align-items:center; justify-content:center; gap:7px;
      transition:opacity .15s, transform .15s;
      box-shadow:0 3px 10px rgba(99,102,241,.35);
    }
    .svd-monitor-btn:hover { opacity:.9; }
    .svd-monitor-btn:active { transform:scale(.98); }
    .svd-acc-empty {
      display:flex; flex-direction:column; align-items:center;
      padding:24px 16px; color:#94a3b8; font-size:12px; text-align:center;
    }
    .svd-acc-empty p { margin:0; }
    .svd-acc-section { display:flex; flex-direction:column; gap:8px; width:100%; overflow:hidden; }
    /* Accordion stack juga wajib 100% lebar */
    .svd-acc-stack { display:flex; flex-direction:column; gap:10px; width:100%; }
  `;
  document.head.appendChild(styleEl);
}

function renderSupervisorHome(container) {
  // CSS ISSUE #4 FIX: inject style sekali saja ke <head>
  _svdInjectStyles();

  container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400 fade-in">
    <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i>
    <span class="text-sm font-medium">Memuat data dashboard...</span>
  </div>`;

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.success) {
        container.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation text-2xl mb-2 block"></i><br>${res ? res.message : 'Gagal memuat data.'}</div>`;
        return;
      }
      const d = res.data;

      // ── Stat cards ──────────────────────────────────────────────────
      const totalInProgress = d.examCards.reduce(function(s, c) {
        return s + (c.status === 'aktif' ? c.inProgress : 0);
      }, 0);
      const statCards = [
        { label: 'Total Penugasan',    val: d.totalAssignments, icon: 'fa-clipboard-list', color: '#6366f1', bg: '#eef2ff' },
        { label: 'Ujian Aktif',        val: d.activeExams,      icon: 'fa-circle-play',    color: '#10b981', bg: '#d1fae5' },
        { label: 'Ujian Hari Ini',     val: d.todayExams,       icon: 'fa-calendar-day',   color: '#f59e0b', bg: '#fef3c7' },
        { label: 'Sedang Mengerjakan', val: totalInProgress,    icon: 'fa-pencil-alt',     color: '#0ea5e9', bg: '#e0f2fe' }
      ];

      const statsHtml = statCards.map(function(s) {
        return `
          <div class="svd-stat-card">
            <div class="svd-stat-icon" style="background:${s.bg};color:${s.color};">
              <i class="fas ${s.icon}"></i>
            </div>
            <div class="svd-stat-body">
              <div class="svd-stat-val" style="color:${s.color};">${s.val}</div>
              <div class="svd-stat-lbl">${s.label}</div>
            </div>
          </div>`;
      }).join('');

      // ── Pisah exam cards berdasarkan status ──────────────────────────
      const activeCards   = d.examCards.filter(function(c){ return c.status === 'aktif'; });
      const inactiveCards = d.examCards.filter(function(c){ return c.status !== 'aktif'; });

      // Bug #4 fix: helper escape HTML untuk mencegah XSS dari data server
      function escH(str) {
        return String(str == null ? '' : str)
          .replace(/&/g,'&amp;').replace(/</g,'&lt;')
          .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }

      function buildExamCard(c) {
        const isActive    = c.status === 'aktif';
        const totalSiswa  = (c.inProgress || 0) + (c.finished || 0);
        const progressPct = totalSiswa > 0 ? Math.round((c.finished / totalSiswa) * 100) : 0;
        // Bug #4 fix: escape semua field yang berasal dari data server
        const initial      = escH((c.subject || '?').charAt(0).toUpperCase());
        const safeSubject  = escH(c.subject);
        const safeKelas    = escH(c.kelas);
        const safeRoom     = escH(c.roomName);
        const safeSession  = escH(c.sessionLabel);
        const safeDate     = escH(c.date);
        const safeDuration = escH(c.duration);
        return `
          <div class="svd-exam-card${isActive ? ' svd-exam-card-active' : ''}">
            <div class="svd-exam-card-head">
              <div class="svd-exam-avatar">${initial}</div>
              <div class="svd-exam-info">
                <div class="svd-exam-subject">${safeSubject}</div>
                <div class="svd-exam-kelas">${safeKelas}</div>
              </div>
              ${isActive ? `<span class="svd-status-pill svd-status-aktif"><span class="svd-status-dot"></span>Aktif</span>` : ''}
            </div>
            <div class="svd-exam-meta">
              <div class="svd-meta-item"><i class="fas fa-door-open svd-meta-icon" style="color:#6366f1;"></i><span>${safeRoom}</span></div>
              <div class="svd-meta-item"><i class="fas fa-layer-group svd-meta-icon" style="color:#6366f1;"></i><span>${safeSession}</span></div>
              <div class="svd-meta-item"><i class="fas fa-calendar-day svd-meta-icon" style="color:#94a3b8;"></i><span>${safeDate}</span></div>
              <div class="svd-meta-item"><i class="fas fa-hourglass-half svd-meta-icon" style="color:#94a3b8;"></i><span>${safeDuration} menit</span></div>
            </div>
            ${isActive ? `
            <div class="svd-progress-wrap">
              <div class="svd-progress-row">
                <span class="svd-progress-lbl">Progres Pengerjaan</span>
                <span class="svd-progress-val">${progressPct}%</span>
              </div>
              <div class="svd-progress-track"><div class="svd-progress-fill" style="width:${progressPct}%;"></div></div>
              <div class="svd-progress-stats">
                <span class="svd-prog-badge svd-prog-done"><i class="fas fa-check-circle"></i> ${c.finished} selesai</span>
                <span class="svd-prog-badge svd-prog-wip"><i class="fas fa-pencil-alt"></i> ${c.inProgress} mengerjakan</span>
              </div>
            </div>
            <button onclick="showSvMonitor('${escH(String(c.examID||''))}')" class="svd-monitor-btn">
              <i class="fas fa-desktop"></i> Buka Monitor Ujian
            </button>` : ''}
          </div>`;
      }

      // Bug #5 fix: ganti notasi hex+opacity (mis. #10b9811a) yang tidak valid
      // di beberapa browser menjadi rgba() yang universal
      function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return 'rgba('+r+','+g+','+b+','+alpha+')';
      }

      function buildAccordion(id, title, icon, count, accentColor, cards, openByDefault) {
        const accentBg = hexToRgba(accentColor, 0.1);  // latar ikon & badge
        const emptyHtml = `
          <div class="svd-acc-empty">
            <i class="fas fa-inbox" style="font-size:22px;color:#cbd5e1;margin-bottom:8px;"></i>
            <p>Tidak ada ujian pada kategori ini.</p>
          </div>`;
        return `
          <div class="svd-accordion${openByDefault ? ' svd-acc-open' : ''}" id="${id}">
            <button class="svd-acc-header" onclick="_svdToggleAccordion('${id}')" type="button">
              <div class="svd-acc-header-left">
                <div class="svd-acc-icon" style="background:${accentBg};color:${accentColor};">
                  <i class="fas ${icon}"></i>
                </div>
                <div class="svd-acc-title-wrap">
                  <span class="svd-acc-title">${title}</span>
                  <span class="svd-acc-badge" style="background:${accentBg};color:${accentColor};">${count}</span>
                </div>
              </div>
              <div class="svd-acc-chevron">
                <i class="fas fa-chevron-down"></i>
              </div>
            </button>
            <div class="svd-acc-body">
              <div class="svd-exam-grid">
                ${cards.length > 0 ? cards.map(buildExamCard).join('') : emptyHtml}
              </div>
            </div>
          </div>`;
      }

      // Bug #3 fix: buka accordion aktif jika ada ujian aktif,
      // jika tidak ada buka accordion tidak aktif sebagai fallback
      const openActive   = activeCards.length > 0;
      const openInactive = !openActive && inactiveCards.length > 0;
      const activeAccordion   = buildAccordion('svd-acc-aktif',    'Ujian Aktif',       'fa-circle-play', activeCards.length,   '#10b981', activeCards,   openActive);
      const inactiveAccordion = buildAccordion('svd-acc-nonaktif', 'Ujian Tidak Aktif', 'fa-archive',     inactiveCards.length, '#64748b', inactiveCards, openInactive);

      // ── Inject HTML ──────────────────────────────────────────────────
      container.innerHTML = `
        <div class="fade-in svd-page">

          <!-- ══ HEADER BANNER ══ -->
          <div class="svd-header-banner">
            <div class="svd-header-avatar">${escHtmlGlobal((currentUser.username || 'P').charAt(0).toUpperCase())}</div>
            <div class="svd-header-text">
              <div class="svd-header-greeting">Selamat Datang, ${escHtmlGlobal(currentUser.username || '')}!</div>
              <div class="svd-header-date">
                <i class="fas fa-shield-halved" style="margin-right:5px;opacity:.75;"></i>Pengawas Ujian
                <span class="svd-header-date-sep">·</span>
                ${new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </div>
            </div>
            <button onclick="renderSupervisorHome(document.getElementById('admin-content'))" class="svd-refresh-btn" title="Refresh">
              <i class="fas fa-rotate-right"></i>
            </button>
          </div>

          <!-- ══ STAT CARDS ══ -->
          <div class="svd-stat-grid">${statsHtml}</div>

          <!-- ══ ACCORDION SECTION ══ -->
          <div class="svd-acc-section">
            <div class="svd-section-row">
              <span class="svd-section-label">Jadwal Pengawasan Saya</span>
              <button onclick="showSvTab('dash-sv-monitor')" class="svd-link-btn">
                <i class="fas fa-desktop"></i> Buka Monitor
              </button>
            </div>
            <div class="svd-acc-stack">
              ${activeAccordion}
              ${inactiveAccordion}
            </div>
          </div>

        </div>

      `;

      // Accordion yang terbuka secara default (openByDefault) tidak melewati
      // transitionend, langsung set svd-acc-expanded agar max-height:none aktif
      // dan scroll #admin-content bisa menghitung tinggi dengan benar.
      requestAnimationFrame(function() {
        container.querySelectorAll('.svd-accordion.svd-acc-open').forEach(function(acc) {
          acc.classList.add('svd-acc-expanded');
        });
      });
    })
    .withFailureHandler(function(err) {
      container.innerHTML = `<div class="p-8 text-center text-red-500 text-sm"><i class="fas fa-circle-exclamation text-2xl mb-2 block"></i>${err && err.message ? err.message : 'Koneksi gagal.'}</div>`;
    })
    .getDashboardDataForSupervisor(currentUser.userID, currentUser.token);
}

// ── Toggle accordion — hanya satu yang terbuka ──
function _svdToggleAccordion(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const isOpen = target.classList.contains('svd-acc-open');

  // Tutup semua accordion dalam section yang sama + bersihkan expanded
  const section = target.closest('.svd-acc-stack');
  if (section) {
    section.querySelectorAll('.svd-accordion').forEach(function(acc) {
      acc.classList.remove('svd-acc-open', 'svd-acc-expanded');
    });
  }

  // Toggle: jika sebelumnya tertutup, buka
  if (!isOpen) {
    target.classList.add('svd-acc-open');
    // Setelah transisi max-height selesai (~400ms), set expanded agar
    // max-height:none aktif → parent flex bisa hitung tinggi → scroll bekerja
    const body = target.querySelector('.svd-acc-body');
    if (body) {
      // Hapus listener lama jika ada
      if (body._expandedHandler) {
        body.removeEventListener('transitionend', body._expandedHandler);
      }
      body._expandedHandler = function handler(e) {
        if (e.propertyName !== 'max-height') return;
        body.removeEventListener('transitionend', handler);
        body._expandedHandler = null;
        // Pastikan accordion masih terbuka (user belum menutupnya)
        if (target.classList.contains('svd-acc-open')) {
          target.classList.add('svd-acc-expanded');
        }
      };
      body.addEventListener('transitionend', body._expandedHandler);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// TASK #7 – Monitor Ujian Pengawas (live mode) — UI Modern + Aksi Lengkap
// ─────────────────────────────────────────────────────────────────

// ── State monitor pengawas ──
// BUG #3/#10 FIX: hapus deklarasi duplikat _svMonitorRawData (sudah dideklarasi di atas)
// var _svMonitorRawData sudah dideklarasi di blok state global (baris ~43647)
var _svMonitorActiveTab  = 'semua';
var _svMonitorExamFilter = '';
var _svMonitorSelected   = new Set();   // key = responseId atau 'NOLOGIN_'+userID
var _svMonitorSearch     = '';
var _svMonitorViolMin    = NaN;

// Alias state live (dipakai ulang dari state global yang sudah ada)
// _svMonitorLive, _svMonitorTimer, _svLiveSecs, _svLiveElapsed, _svLiveRingTimer

// ─────────────────────────────────────────────────────────────────
function renderSupervisorMonitor(container) {
  _svMonitorActiveTab  = 'semua';
  _svMonitorExamFilter = '';
  _svMonitorSearch     = '';
  _svMonitorViolMin    = NaN;
  _svMonitorSelected   = new Set();

  container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-slate-400 fade-in">
    <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-indigo-500"></i>
    <span class="text-sm font-medium">Memuat data monitor...</span>
  </div>`;

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.success) {
        container.innerHTML = `<div class="p-8 text-center text-red-500">
          <i class="fas fa-circle-exclamation text-2xl mb-2 block"></i>
          <p class="text-sm font-bold">Gagal memuat data monitor.</p>
          <p class="text-xs mt-1">${res ? res.message : 'Periksa koneksi.'}</p>
          <button onclick="renderSupervisorMonitor(document.getElementById('admin-content'))"
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition">
            <i class="fas fa-rotate-right mr-1"></i>Coba Lagi
          </button>
        </div>`;
        return;
      }
      _svMonitorRawData = res;
      _svRenderMonitorShell(container, res);
      // Live Mode aktif default: set flag dan mulai countdown ring.
      // Data sudah tersedia dari fetch ini, jadi cukup _svResetLiveRing()
      // agar fetch berikutnya dijadwalkan setelah interval, bukan sekarang.
      _svMonitorLive = true;
      const liveBtnInit = document.getElementById('sv-live-btn');
      const liveTxtInit = document.getElementById('sv-live-txt');
      if (liveBtnInit) { liveBtnInit.classList.remove('off'); liveBtnInit.classList.add('on'); }
      if (liveTxtInit) liveTxtInit.textContent = 'Live ON';
      _svResetLiveRing();
      // Terapkan pending exam filter jika navigasi berasal dari tombol "Buka Monitor"
      if (window._svPendingExamFilter) {
        _svSetExamFilter(window._svPendingExamFilter);
        window._svPendingExamFilter = '';
      }
    })
    .withFailureHandler(function(err) {
      container.innerHTML = `<div class="p-8 text-center text-red-500 text-sm">
        <i class="fas fa-circle-exclamation text-2xl mb-2 block"></i>
        ${err && err.message ? err.message : 'Koneksi gagal.'}
      </div>`;
    })
    .getMonitorDataForSupervisor(currentUser.userID, currentUser.token);
}

// ─────────────────────────────────────────────────────────────────
// Shell utama halaman monitor
// ─────────────────────────────────────────────────────────────────
function _svRenderMonitorShell(container, res) {
  const meta  = res.meta  || {};
  const data  = res.data  || {};
  const exams = meta.activeExams || [];
  const rooms = meta.rooms || {};



  // Exam selector chips
  const examChipsHtml = exams.length > 1 ? `
    <div class="sv-exam-bar">
      <span class="sv-exam-label"><i class="fas fa-book-open" style="font-size:10px;color:#6366f1;"></i> Ujian Aktif</span>
      <div class="sv-exam-chips">
        <button class="sv-exam-chip all ${!_svMonitorExamFilter ? 'active' : ''}"
          onclick="_svSetExamFilter('')">
          <i class="fas fa-layer-group" style="font-size:10px;"></i> Semua
        </button>
        ${exams.map(ex => `
          <button class="sv-exam-chip exam ${_svMonitorExamFilter===ex.examID ? 'active' : ''}"
            data-examid="${ex.examID}" onclick="_svSetExamFilter('${ex.examID}')">
            <span class="chip-dot"></span>
            <span style="font-weight:800;">${ex.subject}</span>
            <span style="font-size:10px;opacity:.65;font-weight:600;">${ex.kelas}</span>
            ${ex.pin ? `<span class="sv-exam-pin"><i class="fas fa-key" style="font-size:9px;"></i>${ex.pin}</span>` : ''}
          </button>`).join('')}
      </div>
    </div>` :
  exams.length === 1 ? `
    <div class="sv-exam-bar">
      <span class="sv-exam-label"><i class="fas fa-book-open" style="font-size:10px;color:#6366f1;"></i> Ujian Aktif</span>
      <div class="sv-exam-chips">
        <div class="sv-exam-single">
          <i class="fas fa-graduation-cap" style="color:#4338ca;font-size:14px;"></i>
          <span class="sv-exam-single-subject">${exams[0].subject}</span>
          <span class="sv-exam-single-kelas">${exams[0].kelas}</span>
          ${exams[0].pin ? `<span class="sv-exam-pin"><i class="fas fa-key" style="font-size:9px;opacity:.85;"></i> PIN: ${exams[0].pin}</span>` : ''}
        </div>
      </div>
    </div>` :
  `<div class="sv-exam-bar"><span class="sv-no-exam"><i class="fas fa-info-circle"></i> Tidak ada ujian aktif saat ini.</span></div>`;

  container.innerHTML = `
  <div class="fade-in w-full space-y-4">

    <!-- ══ HEADER BANNER ══ -->
    <div style="background:linear-gradient(135deg,#312e81 0%,#4338ca 60%,#6366f1 100%);border-radius:16px;padding:18px 20px;color:#fff;display:flex;flex-direction:column;gap:12px;">
      <div style="display:flex;flex-direction:column;gap:4px;">
        <h2 style="font-family:'Poppins',sans-serif;font-size:18px;font-weight:900;display:flex;align-items:center;gap:10px;">
          <i class="fas fa-satellite-dish" style="opacity:.85;"></i> Monitor Ujian Real-time
        </h2>
        <p style="font-size:12px;color:rgba(255,255,255,.72);">Hanya menampilkan ujian yang Anda awasi.</p>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-left:auto;">
          <!-- Countdown ring (live mode) -->
          <div id="sv-countdown-wrap" class="monitor-countdown-wrap" style="color:#fff;">
            <svg class="monitor-countdown-ring" viewBox="0 0 28 28">
              <circle class="ring-bg" cx="14" cy="14" r="11" style="stroke:#ffffff33;"/>
              <circle class="ring-fg" id="sv-ring-fg" cx="14" cy="14" r="11"
                stroke-dasharray="69.1" stroke-dashoffset="0" style="stroke:#a5f3fc;"/>
            </svg>
            <span id="sv-countdown-txt" style="font-size:11px;font-weight:700;">30</span>s
          </div>
          <!-- Live button -->
          <button id="sv-live-btn" onclick="_svToggleLive()"
            class="monitor-live-btn off" style="color:#fff;background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.3);">
            <span class="live-dot"></span>
            <span id="sv-live-txt">Live Mode</span>
          </button>
          <!-- Last update -->
          <span id="sv-last-update" class="hidden md:flex items-center text-xs" style="color:rgba(255,255,255,.6);"></span>
          <!-- Refresh -->
          <button onclick="_svLoadMonitorData()" id="sv-refresh-btn"
            style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);color:#fff;font-weight:700;font-size:12px;padding:8px 14px;border-radius:10px;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;"
            onmouseover="this.style.background='rgba(255,255,255,.3)'" onmouseout="this.style.background='rgba(255,255,255,.18)'">
            <i class="fas fa-sync-alt"></i> Refresh
          </button>
          <!-- Kirim Pesan -->
          <button onclick="_svOpenSendNotif('all')"
            style="background:#fff;color:#4338ca;border:none;font-weight:700;font-size:12px;padding:8px 14px;border-radius:10px;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.15);"
            onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='#fff'">
            <i class="fas fa-paper-plane"></i> Kirim Pesan
          </button>
        </div>
      </div>
    </div>

    <!-- ══ FILTER BAR ══ -->
    <div class="dash-card p-4 space-y-3">
      <!-- Status tabs dengan badge angka -->
      <div class="flex gap-1.5 flex-wrap" id="sv-filter-tabs">
        ${(()=>{
          // Hitung count per bucket hanya dari ujian aktif
          const activeIDs = new Set((meta.activeExams||[]).map(e=>e.examID));
          const inScope = e => activeIDs.has(e.examID);
          const cntAll = (data.belumLogin||[]).filter(inScope).length
                       + (data.sudahLogin||[]).filter(inScope).length
                       + (data.mengerjakan||[]).filter(inScope).length
                       + (data.selesai||[]).filter(inScope).length
                       + (data.curang||[]).filter(inScope).length;
          const tabs = [
            ['semua',      'Semua',       'fa-list',         cntAll,                                           'bg-slate-600 text-white',    'sv-tab-badge-semua'],
            ['belumLogin', 'Belum Login', 'fa-user-clock',   (data.belumLogin||[]).filter(inScope).length,     'bg-slate-400 text-white',    'sv-tab-badge-belumLogin'],
            ['sudahLogin', 'Login',       'fa-sign-in-alt',  (data.sudahLogin||[]).filter(inScope).length,     'bg-sky-50 text-sky-600',     'sv-tab-badge-sudahLogin'],
            ['mengerjakan','Mengerjakan', 'fa-pencil-alt',   (data.mengerjakan||[]).filter(inScope).length,    'bg-sky-50 text-black',        'sv-tab-badge-mengerjakan'],
            ['selesai',    'Selesai',     'fa-check-circle', (data.selesai||[]).filter(inScope).length,        'bg-emerald-50 text-emerald-600','sv-tab-badge-selesai'],
            ['curang',     'Curang',      'fa-user-shield',  (data.curang||[]).filter(inScope).length,         'bg-red-50 text-red-600',     'sv-tab-badge-curang']
          ];
          return tabs.map(([t,l,i,c,badgeCls,badgeId])=>`
          <button onclick="_svFilterTab('${t}')" data-tab="${t}"
            class="monitor-filter-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition
                   ${t==='semua' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
            <i class="fas ${i}"></i>${l}
            <span id="${badgeId}"
              class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${badgeCls} ring-1 ring-inset ring-current/20">
              ${c}
            </span>
          </button>`).join('');
        })()}
      </div>
      <!-- Search + filter baris 2 -->
      <div class="flex flex-col md:flex-row gap-2">
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <label class="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <i class="fas fa-exclamation-triangle text-orange-400 text-[10px]"></i> Pelanggaran &gt;
          </label>
          <input type="number" id="sv-filter-viol" min="0" step="1" placeholder="–"
            oninput="_svApplyFilters()"
            class="w-16 border border-slate-300 rounded-lg px-2 py-2 text-sm text-center focus:ring-2 focus:ring-orange-400 outline-none font-bold text-slate-700 bg-white shadow-sm">
          <button onclick="document.getElementById('sv-filter-viol').value='';_svApplyFilters();"
            class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-400 text-xs flex items-center justify-center transition">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <i class="fas fa-search text-xs"></i>
          </div>
          <input type="text" id="sv-search-input" placeholder="Cari nama, ID siswa..."
            oninput="_svApplyFilters()"
            class="pl-9 pr-4 py-2 w-full border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition shadow-sm bg-white">
        </div>
      </div>
    </div>

    <!-- ══ EXAM SELECTOR BAR ══ -->
    ${examChipsHtml}

    <!-- ══ BULK ACTION TOOLBAR ══ -->
    <div id="sv-bulk-toolbar" class="hidden dash-card px-5 py-3 bg-indigo-50 border border-indigo-200">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <i class="fas fa-check-square text-white text-sm"></i>
          </div>
          <span class="font-bold text-indigo-800 text-sm">
            <span id="sv-selected-count">0</span> siswa dipilih
          </span>
          <button onclick="_svClearSelection()" class="text-xs text-indigo-500 hover:text-indigo-700 underline font-medium">Batalkan</button>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button id="sv-btn-bulk-unlock" onclick="_svHandleBulkUnlock()"
            class="hidden px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95">
            <i class="fas fa-lock-open"></i> Buka Blokir
          </button>
          <button onclick="_svOpenSendNotif('selected')"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95">
            <i class="fas fa-paper-plane"></i> Kirim Pesan
          </button>
          <button onclick="_svHandleBulkReset()"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 active:scale-95">
            <i class="fas fa-undo-alt"></i> Reset Ujian
          </button>
        </div>
      </div>
    </div>

    <!-- ══ TABEL MONITOR ══ -->
    <div id="sv-monitor-wrapper" class="dash-card overflow-hidden min-h-[200px]">
      <div class="flex flex-col items-center justify-center h-48 text-slate-400">
        <i class="fas fa-satellite-dish text-3xl mb-2 text-slate-200"></i>
        <p class="text-sm">Data sedang dimuat...</p>
      </div>
    </div>

  </div>`;

  // Isi dropdown kelas & mapel
  _svPopulateDropdowns(meta, data);
  // Render tabel
  _svApplyFilters();
  // BUG 1 FIX: hapus pemanggilan _svStopLive() di sini — live mode sudah
  // diaktifkan di renderSupervisorMonitor() setelah _svRenderMonitorShell()
  // selesai. Memanggil _svStopLive() di sini membatalkan live mode tersebut.
}

// ─────────────────────────────────────────────────────────────────
// (dropdowns kelas/mapel/sesi dihapus)
function _svPopulateDropdowns(meta, data) {
  // Filter kelas, mapel, sesi telah dihapus — fungsi dipertahankan sebagai stub
  // agar referensi pemanggil tidak error.
}

// ─────────────────────────────────────────────────────────────────
// Filter & Render Tabel
// ─────────────────────────────────────────────────────────────────
function _svGetAllRows() {
  if (!_svMonitorRawData) return [];
  const d = _svMonitorRawData.data || {};
  return [
    ...(d.belumLogin  || []).map(r => ({...r, _bucket: 'belumLogin'})),
    ...(d.sudahLogin  || []).map(r => ({...r, _bucket: 'sudahLogin'})),
    ...(d.mengerjakan || []).map(r => ({...r, _bucket: 'mengerjakan'})),
    ...(d.selesai     || []).map(r => ({...r, _bucket: 'selesai'})),
    ...(d.curang      || []).map(r => ({...r, _bucket: 'curang'}))
  ];
}

function _svApplyFilters() {
  const search  = ((document.getElementById('sv-search-input') || {}).value || '').toLowerCase().trim();
  const violRaw = (document.getElementById('sv-filter-viol')   || {}).value;
  const violMin = (violRaw !== '' && violRaw !== null) ? parseInt(violRaw, 10) : NaN;
  _svMonitorSearch  = search;
  _svMonitorViolMin = violMin;

  const d    = _svMonitorRawData ? (_svMonitorRawData.data  || {}) : {};
  const meta = _svMonitorRawData ? (_svMonitorRawData.meta  || {}) : {};
  const limit = meta.violationLimit || 0;

  // Set examID ujian aktif yang diawasi pengawas ini
  const activeIDs = new Set((meta.activeExams || []).map(e => e.examID));

  // Fungsi cek apakah baris termasuk dalam tampilan "ujian aktif pengawas ini"
  // Jika exam filter spesifik dipilih → filter ke examID itu saja
  // Jika "Semua" (filter kosong) → hanya tampilkan yang examID-nya ada di activeIDs
  const isInScope = e => {
    if (_svMonitorExamFilter) return e.examID === _svMonitorExamFilter;
    // "Semua" = hanya ujian aktif milik pengawas ini
    return activeIDs.has(e.examID);
  };

  const matches = e => {
    if (!isInScope(e)) return false;
    if (search && !(String(e.nama||'').toLowerCase().includes(search) || String(e.userID||'').toLowerCase().includes(search))) return false;
    if (!isNaN(violMin) && Number(e.violations||0) <= violMin) return false;
    return true;
  };

  // Perbarui badge angka di setiap pil status (hanya ujian aktif)
  const buckets = ['belumLogin','sudahLogin','mengerjakan','selesai','curang'];
  const badgeMap = {
    semua:       'sv-tab-badge-semua',
    belumLogin:  'sv-tab-badge-belumLogin',
    sudahLogin:  'sv-tab-badge-sudahLogin',
    mengerjakan: 'sv-tab-badge-mengerjakan',
    selesai:     'sv-tab-badge-selesai',
    curang:      'sv-tab-badge-curang'
  };
  let totalActive = 0;
  buckets.forEach(b => {
    const cnt = (d[b]||[]).filter(e => isInScope(e)).length;
    totalActive += cnt;
    const el = document.getElementById(badgeMap[b]);
    if (el) el.textContent = cnt;
  });
  const elTotal = document.getElementById(badgeMap.semua);
  if (elTotal) elTotal.textContent = totalActive;

  // Update tab buttons: aktif = slate-700/text-white, tidak aktif = slate-100/text-slate-600
  document.querySelectorAll('#sv-filter-tabs .monitor-filter-btn').forEach(b => {
    const isAct = b.dataset.tab === _svMonitorActiveTab;
    b.classList.toggle('bg-slate-700', isAct);
    b.classList.toggle('text-white',   isAct);
    b.classList.toggle('bg-slate-100', !isAct);
    b.classList.toggle('text-slate-600', !isAct);
    // Sinkronkan badge background juga agar kontras tetap terjaga saat aktif
    const badge = b.querySelector('[id^="sv-tab-badge-"]');
    if (badge) {
      badge.classList.toggle('bg-white',     isAct);
      badge.classList.toggle('text-slate-700', isAct);
      badge.classList.toggle('bg-current',   !isAct);
    }
  });

  // Kumpulkan & filter baris sesuai tab aktif
  const allRows = _svGetAllRows();
  const filtered = allRows.filter(r => {
    if (_svMonitorActiveTab !== 'semua' && r._bucket !== _svMonitorActiveTab) return false;
    return matches(r);
  });

  _svRenderMonitorTable(filtered, limit);
}

// ─────────────────────────────────────────────────────────────────
// Render tabel — identik dengan monitor Admin
// ─────────────────────────────────────────────────────────────────
function _svRenderMonitorTable(data, violationLimit) {
  const wrapper = document.getElementById('sv-monitor-wrapper');
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

  const limit = violationLimit || 0;

  const statusCfg = {
    belumLogin:  { label: '-',           cls: 'bg-slate-50 text-slate-500 border-slate-200',       icon: 'fa-user-clock' },
    sudahLogin:  { label: 'Login',       cls: 'bg-sky-50 text-sky-700 border-sky-200',             icon: 'fa-sign-in-alt' },
    mengerjakan: { label: 'Mengerjakan', cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: 'fa-pencil-alt' },
    selesai:     { label: 'Selesai',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'fa-check-circle' },
    curang:      { label: 'Curang',      cls: 'bg-red-50 text-red-700 border-red-200',             icon: 'fa-user-shield' }
  };

  function escH(str) {
    return String(str == null ? '' : str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  const isLoginOnly = s => s === 'belumLogin' || s === 'sudahLogin';

  function buildProgressCell(e) {
    if (isLoginOnly(e._bucket)) return '<span class="text-slate-300 text-xs">-</span>';
    const total = Number(e.totalQuestions)||0;
    const ans   = Number(e.answeredCount)||0;
    if (total === 0) return '<span class="text-slate-300 text-xs">-</span>';
    const pct  = Math.min(100, Math.round((ans/total)*100));
    const full = ans >= total;
    return `<div class="monitor-prog-wrap">
      <div class="monitor-prog-bar"><div style="width:${pct}%" class="${full?'full':''}"></div></div>
      <span class="monitor-prog-txt"><span class="${full?'done':''}">${ans}</span><span class="text-slate-400">/${total}</span><span class="text-slate-300 font-normal">(${pct}%)</span></span>
    </div>`;
  }

  function buildTimerCell(e) {
    if (e._bucket !== 'mengerjakan') return '<span class="text-slate-300 text-xs">-</span>';
    const duration = Number(e.duration)||0;
    if (duration===0 || !e.startTime || e.startTime==='-') return '<span class="text-slate-400 text-xs">-</span>';
    const parts = String(e.startTime).split(/[/ :]/);
    if (parts.length < 6) return '<span class="text-slate-400 text-xs">?</span>';
    const startMs = new Date(+parts[2],+parts[1]-1,+parts[0],+parts[3],+parts[4],+parts[5]).getTime();
    const endMs   = startMs + duration*60*1000;
    const remainMs = endMs - Date.now();
    const tid = 'svtimer-' + escH(e.responseId || e.userID);
    if (remainMs <= 0) return `<span class="monitor-timer done" id="${tid}"><i class="fas fa-hourglass-end text-[9px]"></i>Habis</span>`;
    const s   = Math.floor(remainMs/1000);
    const hh  = Math.floor(s/3600), mm = Math.floor((s%3600)/60), ss = s%60;
    const txt = hh > 0 ? `${hh}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}` : `${mm}:${String(ss).padStart(2,'0')}`;
    const cls = remainMs < 5*60*1000 ? 'urgent' : remainMs < 10*60*1000 ? 'warning' : 'ok';
    return `<span class="monitor-timer ${cls}" id="${tid}" data-end="${endMs}"><i class="fas fa-hourglass-half text-[9px]"></i>${txt}</span>`;
  }

  const rows = data.map((e, idx) => {
    const sc  = statusCfg[e._bucket] || statusCfg.sudahLogin;
    const key = e.responseId || ('NOLOGIN_' + e.userID);
    const isChecked = _svMonitorSelected.has(key) ? 'checked' : '';

    const statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${sc.cls}">
      <i class="fas ${sc.icon} text-[9px]"></i>${sc.label}
    </span>`;

    // Pelanggaran badge — klik buka violation panel
    const violLogs  = e.violLogs || [];
    const violBadge = e.violations > 0
      ? `<button type="button" class="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200 viol-clickable-badge"
           title="Klik untuk melihat riwayat pelanggaran"
           onclick="openViolationPanel(${JSON.stringify(escH(e.nama||'-'))}, ${e.violations}, ${JSON.stringify(violLogs).replace(/</g,'\\u003c').replace(/>/g,'\\u003e')})">
           <i class="fas fa-exclamation-triangle text-[8px]"></i>${e.violations}x
         </button>` : '';

    const scoreCell = isLoginOnly(e._bucket) ? '<span class="text-slate-300">-</span>'
      : (e.score !== undefined && e.score !== '-'
          ? `<span class="font-bold text-slate-700">${typeof formatScore==='function' ? formatScore(e.score) : e.score}</span>`
          : '<span class="text-slate-400">-</span>');

    // Tombol aksi per baris
    const safeRid   = escH(e.responseId || '');
    const safeName  = escH(e.nama || '');
    const safeUID   = escH(e.userID || '');

    const btnMsg = (e._bucket === 'mengerjakan' || e._bucket === 'sudahLogin')
      ? `<button onclick="_svOpenSendNotif('single','${safeUID}','${safeName}')"
           class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-blue-500 border border-transparent hover:shadow transition text-xs" title="Kirim Pesan">
           <i class="fas fa-paper-plane"></i></button>` : '';

    const btnUnlock = e._bucket === 'curang'
      ? `<button onclick="_svSingleUnlock('${safeRid}','${safeName}')"
           class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-green-500 border border-transparent hover:shadow transition text-xs" title="Buka Blokir">
           <i class="fas fa-lock-open"></i></button>` : '';

    const btnReset = ['mengerjakan','selesai','curang'].includes(e._bucket)
      ? `<button onclick="_svSingleReset('${safeRid}','${safeName}')"
           class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-red-500 border border-transparent hover:shadow transition text-xs" title="Reset Ujian">
           <i class="fas fa-undo-alt"></i></button>` : '';

    return `
    <tr class="hover:bg-slate-50 transition border-b border-slate-50 last:border-0 group"
        data-key="${escH(key)}" data-status="${e._bucket}" data-response="${safeRid}">
      <td class="p-4 pl-6 text-center w-10">
        <input type="checkbox" class="sv-monitor-cb w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition"
          value="${escH(key)}" onchange="_svToggleSelect('${escH(key)}',this)" ${isChecked}>
      </td>
      <td class="p-4 text-xs text-slate-400 font-bold text-center w-8">${idx+1}</td>
      <td class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 uppercase flex-shrink-0">
            ${escH((e.nama||'?').charAt(0))}
          </div>
          <div>
            <div class="font-bold text-slate-700 text-sm">${escH(e.nama||'-')}</div>
            <div class="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded inline-block mt-0.5">${escH(e.userID)}</div>
          </div>
        </div>
      </td>
      <td class="p-4"><span class="text-sm text-slate-600 font-medium">${escH(e.kelas||'-')}</span></td>
      <td class="p-4">
        ${e.sessionLabel
          ? `<div class="flex flex-col gap-0.5">
               <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 w-fit">
                 <i class="fas fa-clock text-[8px]"></i>${escH(e.sessionLabel)}
               </span>
               ${e.roomName ? `<span class="text-[10px] text-slate-400 pl-0.5"><i class="fas fa-door-open text-[8px]"></i> ${escH(e.roomName)}</span>` : ''}
             </div>`
          : '<span class="text-slate-300 text-xs">-</span>'}
      </td>
      <td class="p-4"><span class="text-sm text-slate-600">${e.mapel ? escH(e.mapel) : '<span class="text-slate-300">-</span>'}</span></td>
      <td class="p-4 text-center">${statusBadge}${violBadge}</td>
      <td class="p-4 text-center">${buildProgressCell(e)}</td>
      <td class="p-4 text-center">${buildTimerCell(e)}</td>
      <td class="p-4 text-center text-xs text-slate-500 tabular-nums">
        ${isLoginOnly(e._bucket) ? '<span class="text-slate-300">-</span>' : escH(e.startTime||'-')}
      </td>
      <td class="p-4 text-center text-xs text-slate-500 tabular-nums">
        ${isLoginOnly(e._bucket) ? '<span class="text-slate-300">-</span>' : escH(e.submitTime||'-')}
      </td>
      <td class="p-4 text-center">${scoreCell}</td>
      <td class="p-4 pr-6 text-right">
        <div class="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
          ${btnMsg}${btnUnlock}${btnReset}
        </div>
      </td>
    </tr>`;
  }).join('');

  const monitorIsLive = typeof _svMonitorLive !== 'undefined' && _svMonitorLive;
  // BUG 5 FIX: _svMonitorLive dibaca saat render — ini sudah benar karena
  // wrapper.innerHTML diset setelah semua row di-build. Pindahkan pembacaan
  // ke tepat sebelum inject ke DOM agar nilai selalu fresh saat eksekusi baris ini.
  wrapper.innerHTML = `
  <div class="overflow-x-auto w-full">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
          <th class="w-10 text-center pl-6 py-3">
            <input type="checkbox" id="sv-check-all" onchange="_svToggleSelectAll(this)"
              class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" title="Pilih Semua">
          </th>
          <th class="w-8 text-center py-3">No</th>
          <th class="py-3 px-4">Identitas Siswa</th>
          <th class="py-3 px-4">Kelas</th>
          <th class="py-3 px-4">Sesi / Ruang</th>
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
    ${monitorIsLive ? `<span class="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      Live — refresh tiap ${_svLiveSecs}d
    </span>` : ''}
  </div>`;

  // Jalankan timer sisa waktu
  _svStartTimers();
}

// ─────────────────────────────────────────────────────────────────
// Selection & Bulk actions
// ─────────────────────────────────────────────────────────────────
function _svToggleSelect(key, cb) {
  if (cb.checked) _svMonitorSelected.add(key);
  else            _svMonitorSelected.delete(key);
  _svUpdateBulkToolbar();
}

function _svToggleSelectAll(source) {
  document.querySelectorAll('.sv-monitor-cb').forEach(cb => {
    cb.checked = source.checked;
    if (source.checked) _svMonitorSelected.add(cb.value);
    else                _svMonitorSelected.delete(cb.value);
  });
  _svUpdateBulkToolbar();
}

function _svClearSelection() {
  _svMonitorSelected.clear();
  document.querySelectorAll('.sv-monitor-cb').forEach(cb => cb.checked = false);
  const ca = document.getElementById('sv-check-all');
  if (ca) ca.checked = false;
  _svUpdateBulkToolbar();
}

function _svUpdateBulkToolbar() {
  const toolbar   = document.getElementById('sv-bulk-toolbar');
  const countEl   = document.getElementById('sv-selected-count');
  const btnUnlock = document.getElementById('sv-btn-bulk-unlock');
  if (!toolbar) return;

  const count = _svMonitorSelected.size;
  if (countEl) countEl.textContent = count;

  if (count > 0) { toolbar.classList.remove('hidden'); toolbar.classList.add('flex'); }
  else           { toolbar.classList.add('hidden');    toolbar.classList.remove('flex'); }

  // Tampilkan tombol buka blokir hanya jika ada siswa curang terpilih
  const hasCurang = [...document.querySelectorAll('.sv-monitor-cb:checked')].some(cb => {
    const tr = cb.closest('tr');
    return tr && tr.dataset.status === 'curang';
  });
  if (btnUnlock) {
    if (hasCurang) { btnUnlock.classList.remove('hidden'); btnUnlock.classList.add('flex'); }
    else           { btnUnlock.classList.add('hidden');    btnUnlock.classList.remove('flex'); }
  }
}

function _svGetSelectedResponseIds() {
  const ids = [];
  _svMonitorSelected.forEach(key => {
    if (key.startsWith('NOLOGIN_')) return;
    ids.push(key);
  });
  return ids;
}

// ─────────────────────────────────────────────────────────────────
// Aksi per baris
// ─────────────────────────────────────────────────────────────────
function _svSingleUnlock(responseId, nama) {
  Swal.fire({
    title: 'Buka Blokir?',
    html: `Siswa <strong>${nama}</strong> akan dapat login kembali dan melanjutkan ujian.`,
    icon: 'question', showCancelButton: true,
    confirmButtonText: '<i class="fas fa-lock-open mr-1"></i> Ya, Buka Blokir',
    cancelButtonText: 'Batal', confirmButtonColor: '#16a34a',
    customClass: { popup: 'lp-swal' }
  }).then(r => {
    if (!r.isConfirmed) return;
    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal',
          text: res.message, timer: 2000, showConfirmButton: false });
        if (res.success) _svLoadMonitorData();
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .unlockStudentExam(responseId, currentUser.userID, currentUser.token);
  });
}

function _svSingleReset(responseId, nama) {
  Swal.fire({
    title: 'Reset Ujian?',
    html: `Semua jawaban <strong>${nama}</strong> akan <strong class="text-red-600">dihapus</strong> dan siswa dapat mengerjakan ulang.`,
    icon: 'warning', showCancelButton: true,
    confirmButtonText: '<i class="fas fa-undo-alt mr-1"></i> Ya, Reset',
    cancelButtonText: 'Batal', confirmButtonColor: '#dc2626',
    customClass: { popup: 'lp-swal' }
  }).then(r => {
    if (!r.isConfirmed) return;
    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal',
          text: res.message, timer: 2000, showConfirmButton: false });
        if (res.success) _svLoadMonitorData();
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .resetStudentExam(responseId, currentUser.userID, currentUser.token);
  });
}

// ─────────────────────────────────────────────────────────────────
// Bulk actions
// ─────────────────────────────────────────────────────────────────
function _svHandleBulkUnlock() {
  const ids = _svGetSelectedResponseIds().filter(id => {
    const tr = document.querySelector(`#sv-monitor-wrapper tr[data-response="${id}"]`);
    return tr && tr.dataset.status === 'curang';
  });
  if (ids.length === 0) { Swal.fire('Info', 'Tidak ada siswa berstatus Curang yang dipilih.', 'info'); return; }
  Swal.fire({
    title: 'Buka Blokir Kolektif?',
    html: `<strong>${ids.length} siswa</strong> yang terdeteksi curang akan dibuka blokirnya.`,
    icon: 'question', showCancelButton: true,
    confirmButtonText: `<i class="fas fa-lock-open mr-1"></i> Ya, Buka ${ids.length} Siswa`,
    cancelButtonText: 'Batal', confirmButtonColor: '#16a34a',
    customClass: { popup: 'lp-swal' }
  }).then(r => {
    if (!r.isConfirmed) return;
    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal',
          text: res.message, timer: 2500, showConfirmButton: false });
        if (res.success) { _svClearSelection(); _svLoadMonitorData(); }
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .bulkUnlockStudents(ids, currentUser.userID, currentUser.token);
  });
}

function _svHandleBulkReset() {
  const ids = _svGetSelectedResponseIds();
  if (ids.length === 0) { Swal.fire('Info', 'Pilih minimal 1 siswa yang memiliki data ujian.', 'info'); return; }
  Swal.fire({
    title: 'Reset Ujian Kolektif?',
    html: `Seluruh jawaban <strong>${ids.length} siswa</strong> terpilih akan <strong class="text-red-600">DIHAPUS PERMANEN</strong>.<br><br>
           <span class="text-sm text-slate-500">Siswa dapat mengerjakan ujian dari awal.</span>`,
    icon: 'warning', showCancelButton: true,
    confirmButtonText: `<i class="fas fa-undo-alt mr-1"></i> Ya, Reset ${ids.length} Siswa`,
    cancelButtonText: 'Batal', confirmButtonColor: '#dc2626',
    input: 'checkbox', inputValue: 0,
    inputPlaceholder: 'Saya mengerti tindakan ini tidak dapat dibatalkan',
    customClass: { popup: 'lp-swal' }
  }).then(r => {
    if (!r.isConfirmed || !r.value) {
      if (r.isConfirmed && !r.value) Swal.fire('Dibatalkan', 'Centang konfirmasi terlebih dahulu.', 'info');
      return;
    }
    Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    google.script.run
      .withSuccessHandler(res => {
        Swal.fire({ icon: res.success ? 'success' : 'error', title: res.success ? 'Berhasil!' : 'Gagal',
          text: res.message, timer: 2500, showConfirmButton: false });
        if (res.success) { _svClearSelection(); _svLoadMonitorData(); }
      })
      .withFailureHandler(err => Swal.fire('Error', String(err), 'error'))
      .bulkResetStudents(ids, currentUser.userID, currentUser.token);
  });
}

// ─────────────────────────────────────────────────────────────────
// Kirim Pesan — memanfaatkan modal & fungsi notifikasi Admin
// ─────────────────────────────────────────────────────────────────
function _svOpenSendNotif(mode, userID, nama) {
  // Selalu override monitorExamList dan monitorRawData dengan data Pengawas.
  // FIX: gunakan assignment langsung ke variabel 'let monitorExamList' (bukan
  // window.monitorExamList) karena openSendNotifModal membaca binding 'let',
  // bukan property window — keduanya berbeda di browser modern.
  const svMeta = _svMonitorRawData ? (_svMonitorRawData.meta || {}) : {};
  monitorExamList = svMeta.activeExams || [];

  if (typeof monitorSelected === 'undefined') window.monitorSelected = new Set();

  // Selalu sync monitorRawData dengan data Pengawas
  monitorRawData = _svMonitorRawData ? _svMonitorRawData.data : null;

  if (mode === 'selected') {
    // Sync selected ke monitorSelected (dipakai openSendNotifModal)
    monitorSelected = new Set();
    _svMonitorSelected.forEach(key => {
      if (!key.startsWith('NOLOGIN_')) monitorSelected.add(key);
    });
  }

  if (typeof openSendNotifModal === 'function') {
    openSendNotifModal(mode, userID, nama);
  }
}

// ─────────────────────────────────────────────────────────────────
// Filter tab
// ─────────────────────────────────────────────────────────────────
function _svFilterTab(tab) {
  _svMonitorActiveTab = tab;
  _svApplyFilters();
}

function _svSetExamFilter(examID) {
  _svMonitorExamFilter = examID || '';
  // BUG 3 FIX: chip "Semua" tidak punya atribut data-examid sehingga
  // dataset.examid bernilai undefined, bukan ''. Normalisasikan ke '' agar
  // perbandingan `=== _svMonitorExamFilter` bekerja untuk kedua kasus.
  document.querySelectorAll('.sv-exam-chip').forEach(btn => {
    const chipId = btn.dataset.examid !== undefined ? btn.dataset.examid : '';
    btn.classList.toggle('active', chipId === _svMonitorExamFilter);
  });
  _svApplyFilters();
}

// ─────────────────────────────────────────────────────────────────
// Load data (refresh)
// ─────────────────────────────────────────────────────────────────
function _svLoadMonitorData() {
  const wrapper   = document.getElementById('sv-monitor-wrapper');
  const refreshBtn = document.getElementById('sv-refresh-btn');
  if (wrapper) wrapper.innerHTML = `<div class="flex flex-col items-center justify-center h-48 text-slate-400">
    <i class="fas fa-circle-notch fa-spin text-3xl mb-2 text-indigo-400"></i>
    <p class="text-sm">Mengambil data monitor...</p>
  </div>`;
  if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memuat...'; }

  google.script.run
    .withSuccessHandler(function(res) {
      if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh'; }
      if (!res || !res.success) {
        if (wrapper) wrapper.innerHTML = `<div class="p-10 text-center text-red-500"><i class="fas fa-exclamation-triangle text-2xl mb-2"></i><p>${res ? res.message : 'Gagal memuat'}</p></div>`;
        if (_svMonitorLive) _svResetLiveRing();
        return;
      }
      _svMonitorRawData = res;
      _svClearSelection();

      // Update timestamp
      const ts = document.getElementById('sv-last-update');
      if (ts) { ts.textContent = 'Update: ' + new Date().toLocaleTimeString('id-ID'); ts.classList.remove('hidden'); }

      // Update stat counts & re-populate dropdowns
      const meta = res.meta || {};
      const data = res.data || {};
      _svPopulateDropdowns(meta, data);
      _svApplyFilters();

      if (_svMonitorLive) _svResetLiveRing();
    })
    .withFailureHandler(function(err) {
      if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh'; }
      if (wrapper) wrapper.innerHTML = `<div class="p-10 text-center text-red-500"><p class="font-bold">Gagal: ${err && err.message ? err.message : err}</p></div>`;
      if (_svMonitorLive) _svResetLiveRing();
    })
    .getMonitorDataForSupervisor(currentUser.userID, currentUser.token);
}

// ─────────────────────────────────────────────────────────────────
// Timer sisa waktu (reuse fungsi admin yang sudah ada)
// ─────────────────────────────────────────────────────────────────
function _svStartTimers() {
  // BUG 7 FIX: pastikan interval lama selalu dibersihkan sebelum membuat yang
  // baru — mencegah double-tick jika _svRenderMonitorTable dipanggil ulang
  // sangat cepat (misalnya filter + live refresh hampir bersamaan).
  // Gunakan flag guard agar tidak ada dua setInterval aktif sekaligus.
  if (window._svTimerInterval) {
    clearInterval(window._svTimerInterval);
    window._svTimerInterval = null;
  }
  // Jika tidak ada elemen timer aktif di DOM, tidak perlu buat interval
  if (!document.querySelector('#sv-monitor-wrapper .monitor-timer[data-end]')) return;

  window._svTimerInterval = setInterval(function() {
    const timerEls = document.querySelectorAll('#sv-monitor-wrapper .monitor-timer[data-end]');
    if (!timerEls.length) {
      clearInterval(window._svTimerInterval);
      window._svTimerInterval = null;
      return;
    }
    const now = Date.now();
    timerEls.forEach(function(el) {
      const endMs = parseInt(el.dataset.end || '0', 10);
      const remainMs = endMs - now;
      if (remainMs <= 0) {
        el.textContent = 'Habis';
        el.className = 'monitor-timer done';
        return;
      }
      const s  = Math.floor(remainMs/1000);
      const hh = Math.floor(s/3600), mm = Math.floor((s%3600)/60), ss = s%60;
      el.innerHTML = `<i class="fas fa-hourglass-half text-[9px]"></i>${
        hh > 0 ? hh+':'+String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0')
               : mm+':'+String(ss).padStart(2,'0')}`;
      el.className = 'monitor-timer ' + (remainMs < 5*60*1000 ? 'urgent' : remainMs < 10*60*1000 ? 'warning' : 'ok');
    });
  }, 1000);
}

// ─────────────────────────────────────────────────────────────────
// Live Mode — menggunakan SVG ring di header
// ─────────────────────────────────────────────────────────────────
function _svToggleLive() {
  if (_svMonitorLive) { _svStopLive(); } else { _svStartLive(); }
}

function _svStartLive() {
  _svMonitorLive = true;
  const btn = document.getElementById('sv-live-btn');
  const txt = document.getElementById('sv-live-txt');
  if (btn) { btn.classList.remove('off'); btn.classList.add('on'); }
  if (txt) txt.textContent = 'Live ON';
  _svLoadMonitorData();
}

function _svStopLive() {
  _svMonitorLive = false;
  if (_svMonitorTimer)  { clearTimeout(_svMonitorTimer);   _svMonitorTimer  = null; }
  if (_svLiveRingTimer) { clearInterval(_svLiveRingTimer); _svLiveRingTimer = null; }
  // BUG 6 FIX: bersihkan juga timer sisa waktu per baris agar tidak terus
  // berjalan di background setelah live mode dimatikan atau halaman berpindah.
  if (window._svTimerInterval) { clearInterval(window._svTimerInterval); window._svTimerInterval = null; }
  const btn  = document.getElementById('sv-live-btn');
  const txt  = document.getElementById('sv-live-txt');
  const wrap = document.getElementById('sv-countdown-wrap');
  if (btn)  { btn.classList.add('off'); btn.classList.remove('on'); }
  if (txt)  txt.textContent = 'Live Mode';
  if (wrap) wrap.classList.remove('show');
}

function _svResetLiveRing() {
  if (!_svMonitorLive) return;
  _svLiveElapsed = 0;
  const wrap = document.getElementById('sv-countdown-wrap');
  const arc  = document.getElementById('sv-ring-fg');
  const txt  = document.getElementById('sv-countdown-txt');
  const C    = 69.1; // 2π×11
  if (wrap) wrap.classList.add('show');
  if (arc)  arc.style.strokeDashoffset = '0';
  if (txt)  txt.textContent = _svLiveSecs;

  if (_svLiveRingTimer) clearInterval(_svLiveRingTimer);
  _svLiveRingTimer = setInterval(function() {
    _svLiveElapsed++;
    const pct = _svLiveElapsed / _svLiveSecs;
    if (arc) arc.style.strokeDashoffset = String(C * pct);
    if (txt) txt.textContent = Math.max(0, _svLiveSecs - _svLiveElapsed);
    if (_svLiveElapsed >= _svLiveSecs) {
      clearInterval(_svLiveRingTimer);
      _svLiveRingTimer = null;
      if (_svMonitorLive) _svLoadMonitorData();
    }
  }, 1000);
}

// ─────────────────────────────────────────────────────────────────
// TASK #4 – Manajemen Pengawas (Admin only)
// ─────────────────────────────────────────────────────────────────
function renderSupervisorManagement(container) {
  window._svMgmtUI = { assignments: [], examList: [], supervisorList: [], editingId: null };
  const ui = window._svMgmtUI;

  container.innerHTML = `
  <div class="svm-page fade-in">

    <!-- ═══ HEADER BANNER ═══ -->
    <div class="svm-header">
      <div class="min-w-0">
        <h2 class="svm-header-title">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;background:rgba(255,255,255,.18);border-radius:9px;font-size:16px;flex-shrink:0;">
            <i class="fas fa-user-shield"></i>
          </span>
          Manajemen Pengawas Ujian
        </h2>
        <p class="svm-header-sub">Tentukan pengawas per ruang ujian dan sesi untuk setiap jadwal yang aktif.</p>
      </div>
      <div class="svm-header-actions">
        <button onclick="_svMgmtRefresh()" class="svm-header-btn"
          title="Muat ulang semua data" aria-label="Refresh data">
          <i class="fas fa-rotate-right"></i>
          <span class="hidden sm:inline">Refresh</span>
        </button>
        <button onclick="_svMgmtSyncAll()" class="svm-header-btn" id="svm-btn-sync"
          title="Sinkronisasi data pengawas ke Ruang Ujian" aria-label="Sinkronisasi data">
          <i class="fas fa-rotate"></i>
          <span class="hidden sm:inline">Sinkronisasi</span>
        </button>
        <button onclick="_svMgmtOpenForm(null)" class="svm-header-btn svm-header-btn-solid"
          aria-label="Tambah penugasan pengawas baru">
          <i class="fas fa-plus"></i>
          <span>Tambah Penugasan</span>
        </button>
      </div>
    </div>

    <!-- ═══ STAT CARDS ═══ -->
    <div class="svm-stat-grid" id="svm-stat-grid" role="list" aria-label="Ringkasan penugasan pengawas">
      <div class="svm-stat" role="listitem">
        <div class="svm-stat-ico" style="background:#e0e7ff;color:#4338ca;">
          <i class="fas fa-clipboard-list" aria-hidden="true"></i>
        </div>
        <div class="min-w-0">
          <div class="svm-stat-num" id="svm-stat-total" aria-live="polite">—</div>
          <div class="svm-stat-lbl">Total Penugasan</div>
        </div>
      </div>
      <div class="svm-stat" role="listitem">
        <div class="svm-stat-ico" style="background:#dcfce7;color:#15803d;">
          <i class="fas fa-book-open" aria-hidden="true"></i>
        </div>
        <div class="min-w-0">
          <div class="svm-stat-num" id="svm-stat-exams" aria-live="polite">—</div>
          <div class="svm-stat-lbl">Ujian Terlibat</div>
        </div>
      </div>
      <div class="svm-stat" role="listitem">
        <div class="svm-stat-ico" style="background:#fef3c7;color:#b45309;">
          <i class="fas fa-user-tie" aria-hidden="true"></i>
        </div>
        <div class="min-w-0">
          <div class="svm-stat-num" id="svm-stat-supervisors" aria-live="polite">—</div>
          <div class="svm-stat-lbl">Pengawas Bertugas</div>
        </div>
      </div>
      <div class="svm-stat" role="listitem">
        <div class="svm-stat-ico" style="background:#fce7f3;color:#be185d;">
          <i class="fas fa-door-open" aria-hidden="true"></i>
        </div>
        <div class="min-w-0">
          <div class="svm-stat-num" id="svm-stat-rooms" aria-live="polite">—</div>
          <div class="svm-stat-lbl">Ruang Digunakan</div>
        </div>
      </div>
    </div>

    <!-- ═══ TOOLBAR: SEARCH + FILTER ═══ -->
    <div class="svm-toolbar">
      <div class="svm-search-wrap" role="search">
        <i class="fas fa-search svm-search-ico" aria-hidden="true"></i>
        <input id="svm-search-input" type="search"
          placeholder="Cari nama pengawas, ruang, sesi…"
          oninput="_svMgmtApplySearch(this.value)"
          class="svm-search-input" autocomplete="off"
          aria-label="Cari penugasan pengawas">
        <button id="svm-search-clear" class="svm-search-clear"
          onclick="_svMgmtApplySearch('',true)" title="Hapus pencarian" aria-label="Hapus pencarian">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <div class="flex items-center gap-1.5">
          <i class="fas fa-filter text-slate-400 text-xs flex-shrink-0" aria-hidden="true"></i>
          <select id="svmgmt-filter-exam" onchange="_svMgmtFilterChanged()"
            class="svm-select" aria-label="Filter berdasarkan ujian">
            <option value="">📋 Semua Ujian</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ═══ TABEL DESKTOP ═══ -->
    <div class="svm-table-wrap" id="svm-table-wrap">
      <div class="svm-loading" id="svmgmt-table-wrap">
        <i class="fas fa-circle-notch fa-spin text-indigo-400 text-2xl" aria-hidden="true"></i>
        <span class="text-slate-500 text-sm font-semibold">Memuat data penugasan...</span>
      </div>
    </div>

    <!-- ═══ CARD MOBILE ═══ -->
    <div class="svm-cards" id="svm-cards-wrap">
      <div class="svm-loading">
        <i class="fas fa-circle-notch fa-spin text-indigo-400 text-2xl" aria-hidden="true"></i>
        <span class="text-slate-500 text-sm font-semibold">Memuat data penugasan...</span>
      </div>
    </div>

  </div>

  <!-- ═══════════════════════════════════════════════
       MODAL FORM — TAMBAH / EDIT PENUGASAN
  ═══════════════════════════════════════════════ -->
  <div id="svmgmt-modal" class="svm-modal-backdrop hidden" onclick="_svMgmtBackdropClick(event)">
    <div class="svm-modal-box" role="dialog" aria-modal="true" aria-labelledby="svmgmt-modal-title">

      <!-- Modal Header -->
      <div class="svm-modal-head">
        <div class="flex items-center gap-3 min-w-0">
          <div class="svm-modal-head-ico" id="svmgmt-modal-ico">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="min-w-0">
            <h3 id="svmgmt-modal-title" class="font-bold text-base text-white truncate">Tambah Penugasan</h3>
            <p class="text-indigo-200 text-[11px] mt-0.5">Field bertanda <span style="color:#fca5a5;">*</span> wajib diisi</p>
          </div>
        </div>
        <button onclick="_svMgmtCloseForm()"
          class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition flex-shrink-0"
          aria-label="Tutup modal penugasan">
          <i class="fas fa-times text-xs" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="svm-modal-body">

        <!-- Field: Ujian -->
        <div class="svm-field-group">
          <label class="svm-label" for="svmgmt-f-exam">
            <i class="fas fa-book-open text-indigo-400" aria-hidden="true"></i>
            Ujian <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <select id="svmgmt-f-exam" class="svm-input"
            oninput="_svMgmtClearErr()" onchange="_svMgmtOnExamChange(this.value)"
            aria-label="Pilih ujian" aria-required="true">
            <option value="">— Pilih Ujian —</option>
          </select>
        </div>

        <!-- Grid 2: Ruang + Sesi -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="svm-field-group">
            <label class="svm-label" for="svmgmt-f-room">
              <i class="fas fa-door-open text-indigo-400" aria-hidden="true"></i>
              Ruang Ujian <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <div id="svmgmt-room-wrap">
              <select id="svmgmt-f-room" class="svm-input"
                oninput="_svMgmtClearErr()" style="display:none;"
                aria-label="Pilih ruang ujian" aria-required="true">
                <option value="">— Pilih Ruang —</option>
              </select>
              <input id="svmgmt-f-room-text" type="text"
                placeholder="Mis: Ruang A, Lab Komputer 1"
                class="svm-input" autocomplete="off" oninput="_svMgmtClearErr()"
                aria-label="Nama ruang ujian" aria-required="true">
            </div>
            <p id="svmgmt-room-hint" class="svm-field-hint" style="display:none;">
              <i class="fas fa-info-circle" aria-hidden="true"></i>
              Menampilkan ruang dari Halaman Ruang Ujian. Pilih atau ketik manual.
            </p>
          </div>
          <div class="svm-field-group">
            <label class="svm-label" for="svmgmt-f-session">
              <i class="fas fa-clock text-indigo-400" aria-hidden="true"></i>
              Label Sesi <span class="text-red-500" aria-hidden="true">*</span>
            </label>
            <input id="svmgmt-f-session" type="text"
              placeholder="Mis: Sesi 1 – 07:30"
              class="svm-input" autocomplete="off" oninput="_svMgmtClearErr()"
              aria-label="Label sesi ujian" aria-required="true">
          </div>
        </div>

        <!-- Field: Pengawas -->
        <div class="svm-field-group">
          <label class="svm-label" for="svmgmt-f-supervisor">
            <i class="fas fa-user-tie text-indigo-400" aria-hidden="true"></i>
            Pengawas <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <select id="svmgmt-f-supervisor" class="svm-input"
            oninput="_svMgmtClearErr()"
            aria-label="Pilih pengawas atau guru" aria-required="true">
            <option value="">— Pilih Pengawas / Guru —</option>
          </select>
          <p class="svm-field-hint">
            <i class="fas fa-info-circle" aria-hidden="true"></i>
            Menampilkan akun dengan role <strong>Pengawas</strong> dan <strong>Guru</strong>.
          </p>
        </div>

        <!-- Error banner -->
        <div id="svmgmt-form-err" class="svm-err-banner hidden" role="alert">
          <i class="fas fa-circle-exclamation flex-shrink-0" aria-hidden="true"></i>
          <span id="svmgmt-form-err-text"></span>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="svm-modal-foot">
        <button onclick="_svMgmtCloseForm()" class="svm-btn-secondary">
          <i class="fas fa-times" aria-hidden="true"></i> Batal
        </button>
        <button id="svmgmt-save-btn" onclick="_svMgmtSave()" class="svm-btn-primary">
          <i class="fas fa-floppy-disk" aria-hidden="true"></i> Simpan Penugasan
        </button>
      </div>

    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════
       MODAL TUNJUK PENGAWAS PENGGANTI
  ═══════════════════════════════════════════════════════════════ -->
  <div id="svm-sub-modal" class="svm-modal-backdrop hidden" onclick="_svMgmtSubModalBackdrop(event)">
    <div class="svm-modal-box" role="dialog" aria-modal="true" aria-labelledby="svm-sub-modal-title">

      <!-- Header -->
      <div class="svm-modal-head" style="background:linear-gradient(135deg,#78350f,#b45309,#f59e0b);">
        <div class="flex items-center gap-3 min-w-0">
          <div class="svm-modal-head-ico" style="background:rgba(255,255,255,.25);">
            <i class="fas fa-user-clock" aria-hidden="true"></i>
          </div>
          <div class="min-w-0">
            <h3 id="svm-sub-modal-title" class="font-bold text-base text-white truncate">Tunjuk Pengawas Pengganti</h3>
            <p id="svm-sub-modal-subtitle" class="text-amber-100 text-[11px] mt-0.5">Pengawas asli sementara tidak aktif</p>
          </div>
        </div>
        <button onclick="_svMgmtSubModalClose()"
          class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition flex-shrink-0"
          aria-label="Tutup modal pengganti">
          <i class="fas fa-times text-xs" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="svm-modal-body">
        <input type="hidden" id="svm-sub-assign-id">

        <!-- Info assignment -->
        <div id="svm-sub-assignment-info"
          style="background:#fef9e7;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;">
        </div>

        <!-- Pilih pengganti -->
        <div class="svm-field-group">
          <label class="svm-label" for="svm-sub-f-supervisor">
            <i class="fas fa-user-clock" style="color:#f59e0b;" aria-hidden="true"></i>
            Pengawas Pengganti <span class="text-red-500" aria-hidden="true">*</span>
          </label>
          <select id="svm-sub-f-supervisor" class="svm-input"
            oninput="_svMgmtSubClearErr()"
            aria-label="Pilih pengawas pengganti" aria-required="true">
            <option value="">— Pilih Pengawas / Guru Pengganti —</option>
          </select>
          <p class="svm-field-hint" style="color:#b45309;">
            <i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
            Pengawas asli tidak bisa mengakses ujian ini sampai pengganti dicabut.
          </p>
        </div>

        <!-- Error banner -->
        <div id="svm-sub-err" class="svm-err-banner hidden" role="alert">
          <i class="fas fa-circle-exclamation flex-shrink-0" aria-hidden="true"></i>
          <span id="svm-sub-err-text"></span>
        </div>
      </div>

      <!-- Footer -->
      <div class="svm-modal-foot">
        <button onclick="_svMgmtSubModalClose()" class="svm-btn-secondary">
          <i class="fas fa-times" aria-hidden="true"></i> Batal
        </button>
        <button id="svm-sub-save-btn" onclick="_svMgmtSubSave()"
          class="svm-btn-primary"
          style="background:linear-gradient(135deg,#b45309,#f59e0b);"
          aria-label="Konfirmasi tunjuk pengganti">
          <i class="fas fa-user-check" aria-hidden="true"></i> Tunjuk Pengganti
        </button>
      </div>

    </div>
  </div>`;

  _svMgmtRefresh();
}

// ─── CSS khusus Manajemen Pengawas — inject sekali ───────────────────────────
(function _svMgmtInjectCSS() {
  if (document.getElementById('svm-styles')) return;
  const style = document.createElement('style');
  style.id = 'svm-styles';
  style.textContent = `
/* ── Halaman wrapper ── */
.svm-page { display:flex; flex-direction:column; gap:16px; padding:0; }

/* ── Header banner ── */
.svm-header {
  background: linear-gradient(135deg,#312e81 0%,#4338ca 60%,#6366f1 100%);
  color:#fff; border-radius:16px; padding:18px 20px;
  display:flex; flex-direction:column; gap:12px;
  overflow:hidden; position:relative;
  box-shadow:0 6px 24px rgba(67,56,202,.25);
}
.svm-header::after {
  content:''; position:absolute; top:-50px; right:-40px;
  width:180px; height:180px; border-radius:50%;
  background:radial-gradient(circle,rgba(165,180,252,.18) 0%,transparent 70%);
  pointer-events:none;
}
@media(min-width:640px){
  .svm-header { flex-direction:row; align-items:center; justify-content:space-between; }
}
.svm-header-title {
  font-family:'Poppins',sans-serif;
  font-size:17px; font-weight:900; line-height:1.2;
  display:flex; align-items:center; gap:10px; position:relative; z-index:1;
}
.svm-header-title i { opacity:.85; }
.svm-header-sub { font-size:12px; color:rgba(255,255,255,.72); margin-top:4px; line-height:1.5; }
.svm-header-actions { display:flex; gap:8px; flex-wrap:wrap; flex-shrink:0; position:relative; z-index:1; }
.svm-header-btn {
  background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25);
  color:#fff; font-weight:700; font-size:12px;
  padding:8px 14px; border-radius:10px; cursor:pointer;
  transition:all .18s; display:inline-flex; align-items:center;
  gap:6px; white-space:nowrap; backdrop-filter:blur(4px);
}
.svm-header-btn:hover { background:rgba(255,255,255,.28); transform:translateY(-1px); box-shadow:0 3px 12px rgba(0,0,0,.15); }
.svm-header-btn:active { transform:translateY(0); }
.svm-header-btn.svm-header-btn-solid {
  background:#fff; color:#4338ca; border-color:#fff;
  box-shadow:0 2px 10px rgba(0,0,0,.18); font-weight:800;
}
.svm-header-btn.svm-header-btn-solid:hover { background:#e0e7ff; }

/* ── Stat grid — FIX BUG-12: deduplikasi deklarasi ── */
.svm-stat-grid {
  display:grid; gap:10px;
  grid-template-columns: repeat(2,minmax(0,1fr));
}
/* FIX: 480px breakpoint agar 4 stat cards tidak gepeng di layar kecil */
@media(min-width:480px){ .svm-stat-grid { grid-template-columns:repeat(4,minmax(0,1fr)); } }
.svm-stat {
  background:#fff; border:1px solid #e2e8f0; border-radius:14px;
  padding:12px 14px; /* FIX BUG-14: height konsisten dengan min padding */
  min-height:68px;   /* FIX BUG-14: height guarantee agar tidak collapse saat spinner */
  display:flex; align-items:center; gap:10px;
  transition:all .2s cubic-bezier(.4,0,.2,1);
  box-shadow:0 1px 3px rgba(15,23,42,.04);
  overflow:hidden; min-width:0;
}
.svm-stat:hover {
  border-color:#a5b4fc; box-shadow:0 4px 12px rgba(99,102,241,.12);
  transform:translateY(-2px);
}
.svm-stat:active { transform:translateY(0); }
.svm-stat-ico {
  width:38px; height:38px; border-radius:10px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; font-size:15px;
  transition:transform .2s;
}
.svm-stat:hover .svm-stat-ico { transform:scale(1.08); }
.svm-stat-num { font-size:20px; font-weight:900; color:#1e293b; line-height:1; }
.svm-stat-lbl { font-size:9px; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:.04em; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* ── Toolbar — FIX BUG-7: overflow:hidden ── */
.svm-toolbar {
  background:#fff; border:1px solid #e2e8f0; border-radius:14px;
  padding:10px 14px; display:flex; flex-direction:column; gap:8px;
  overflow:hidden; /* FIX BUG-7 */
}
@media(min-width:640px){ .svm-toolbar { flex-direction:row; align-items:center; gap:10px; } }
.svm-search-wrap {
  position:relative; flex:1; min-width:0;
}
.svm-search-ico {
  position:absolute; left:11px; top:50%; transform:translateY(-50%);
  color:#94a3b8; font-size:12px; pointer-events:none;
}
.svm-search-input {
  width:100%; padding:9px 36px 9px 34px;
  border:1.5px solid #e2e8f0; border-radius:10px;
  font-size:13px; background:#f8fafc; outline:none; color:#1e293b;
  transition:all .15s; box-sizing:border-box;
}
.svm-search-input:focus {
  background:#fff; border-color:#6366f1;
  box-shadow:0 0 0 3px rgba(99,102,241,.12);
}
.svm-search-input::placeholder { color:#94a3b8; }
.svm-search-clear {
  position:absolute; right:8px; top:50%; transform:translateY(-50%);
  width:20px; height:20px; border-radius:50%;
  background:#e2e8f0; border:none; cursor:pointer;
  color:#64748b; font-size:10px;
  display:none; align-items:center; justify-content:center;
  transition:background .12s; flex-shrink:0;
}
.svm-search-clear.show { display:inline-flex; }
.svm-search-clear:hover { background:#cbd5e1; }
.svm-select {
  padding:9px 10px; border:1.5px solid #e2e8f0; border-radius:10px;
  font-size:12px; background:#fff; color:#475569; font-weight:600;
  cursor:pointer; outline:none; transition:all .15s;
  min-width:140px; max-width:none; flex-shrink:0;
}
.svm-select:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
.svm-select:hover { border-color:#94a3b8; }

/* ── Loading state ── */
.svm-loading {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap:10px; padding:48px 20px;
}

/* ── TABEL DESKTOP — FIX BUG-6 + BUG-11: min-width ── */
.svm-table-wrap {
  background:#fff; border:1px solid #e2e8f0; border-radius:16px;
  overflow:hidden; display:none;
  box-shadow:0 1px 4px rgba(15,23,42,.05);
}
@media(min-width:768px){ .svm-table-wrap { display:block; } }
/* FIX BUG-6/11: min-width agar tabel scrollable pada tablet narrow */
.svm-table { width:100%; min-width:700px; border-collapse:separate; border-spacing:0; }
.svm-table thead th {
  background:#f8fafc;
  font-size:10px; font-weight:800; color:#64748b;
  text-transform:uppercase; letter-spacing:.05em;
  padding:12px 14px; text-align:left;
  border-bottom:2px solid #e2e8f0;
  white-space:nowrap;
}
.svm-table thead th:first-child { padding-left:18px; }
.svm-table thead th:last-child  { padding-right:18px; text-align:center; }
.svm-table thead th.sortable { cursor:pointer; user-select:none; }
.svm-table thead th.sortable:hover { color:#1e293b; background:#f1f5f9; }
.svm-table tbody td {
  padding:12px 14px; vertical-align:middle;
  border-bottom:1px solid #f1f5f9;
  font-size:12px; color:#334155;
  transition:background .1s;
}
.svm-table tbody td:first-child { padding-left:18px; }
.svm-table tbody td:last-child  { padding-right:18px; }
.svm-table tbody tr:last-child td { border-bottom:0; }
.svm-table tbody tr:hover td { background:#f8faff; }

/* Exam cell dalam tabel */
.svm-exam-cell { max-width:200px; min-width:120px; }
.svm-exam-name { font-weight:700; color:#1e293b; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.svm-exam-id   { font-size:10px; color:#94a3b8; font-family:'Courier New',monospace; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

/* Badge Ruang / Sesi */
.svm-badge {
  display:inline-flex; align-items:center; gap:4px;
  padding:4px 10px; border-radius:8px;
  font-size:11px; font-weight:700; border:1px solid;
  white-space:nowrap;
}
.svm-badge-room { background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe; }
.svm-badge-sess { background:#faf5ff; color:#7c3aed; border-color:#ddd6fe; }

/* Pengawas cell */
.svm-sv-name { font-weight:700; color:#1e293b; font-size:12px; }
.svm-sv-role-guru     { display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:800;padding:2px 7px;border-radius:99px;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa; white-space:nowrap; }
.svm-sv-role-pengawas { display:inline-flex;align-items:center;gap:3px;font-size:9px;font-weight:800;padding:2px 7px;border-radius:99px;background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0; white-space:nowrap; }
.svm-sv-id { font-size:10px; color:#94a3b8; font-family:'Courier New',monospace; }

/* Tombol aksi di tabel */
.svm-action-wrap { display:flex; align-items:center; justify-content:center; gap:5px; flex-wrap:nowrap; }
.svm-action-btn {
  width:32px; height:32px; border-radius:8px;
  display:inline-flex; align-items:center; justify-content:center;
  border:1.5px solid; cursor:pointer; transition:all .15s;
  font-size:11px; flex-shrink:0;
}
.svm-action-btn:active { transform:scale(.9); }
.svm-action-edit { color:#4338ca; border-color:#c7d2fe; background:#eef2ff; }
.svm-action-edit:hover { background:#4338ca; color:#fff; border-color:#4338ca; box-shadow:0 2px 8px rgba(67,56,202,.3); }
.svm-action-del  { color:#dc2626; border-color:#fecaca; background:#fef2f2; }
.svm-action-del:hover  { background:#dc2626; color:#fff; border-color:#dc2626; box-shadow:0 2px 8px rgba(220,38,38,.3); }
.svm-action-sub  { color:#92400e; border-color:#fde68a; background:#fef9c3; }
.svm-action-sub:hover  { background:#f59e0b; color:#fff; border-color:#f59e0b; box-shadow:0 2px 8px rgba(245,158,11,.3); }

/* ── CARDS MOBILE ── */
.svm-cards { display:flex; flex-direction:column; gap:10px; }
@media(min-width:768px){ .svm-cards { display:none; } }
.svm-card {
  background:#fff; border:1px solid #e2e8f0; border-radius:16px;
  overflow:hidden; box-shadow:0 1px 4px rgba(15,23,42,.05);
  transition:transform .15s, box-shadow .15s, border-color .15s;
}
.svm-card:active { transform:scale(.99); }
.svm-card-head {
  display:flex; align-items:flex-start; gap:12px;
  padding:14px 16px; border-bottom:1px solid #f1f5f9;
  background:linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%);
}
.svm-card-avatar {
  width:42px; height:42px; border-radius:10px;
  background:linear-gradient(135deg,#4338ca,#6366f1);
  color:#fff; font-weight:800; font-size:16px;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; box-shadow:0 2px 8px rgba(99,102,241,.35);
}
.svm-card-title { font-weight:800; color:#1e293b; font-size:13px; line-height:1.3; word-break:break-word; }
.svm-card-sub   { font-size:10px; color:#6d28d9; margin-top:3px; font-weight:600; display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
.svm-card-body  { padding:12px 16px; display:flex; flex-direction:column; gap:8px; }
.svm-card-row   { display:flex; align-items:flex-start; gap:8px; font-size:12px; color:#475569; min-width:0; }
.svm-card-row i { color:#8b5cf6; width:14px; text-align:center; flex-shrink:0; margin-top:1px; }
.svm-card-row b { color:#1e293b; font-weight:700; }
.svm-card-row span { word-break:break-word; min-width:0; }
/* FIX BUG-8: min-height 44px touch target per WCAG */
.svm-card-foot  {
  padding:10px 16px; background:#f8fafc; border-top:1px solid #f1f5f9;
  display:flex; align-items:center; justify-content:flex-end; gap:8px;
  flex-wrap:wrap;
}
.svm-card-foot .svm-action-btn {
  min-height:44px; min-width:44px; /* FIX BUG-8 */
  border-radius:10px;
}

/* ── Empty state ── */
.svm-empty {
  display:flex; flex-direction:column; align-items:center; gap:8px;
  padding:52px 24px; text-align:center;
}
.svm-empty-ico {
  width:72px; height:72px; border-radius:50%;
  background:#f1f5f9; color:#c7d2fe;
  display:flex; align-items:center; justify-content:center;
  font-size:28px; margin-bottom:6px;
  transition:transform .3s;
}
.svm-empty:hover .svm-empty-ico { transform:scale(1.06); }
.svm-empty p { font-size:13px; font-weight:700; color:#475569; }
.svm-empty small { font-size:11px; color:#94a3b8; line-height:1.5; }
.svm-empty-btn {
  margin-top:4px; display:inline-flex; align-items:center; gap:6px;
  padding:9px 18px; border-radius:10px;
  background:linear-gradient(135deg,#4338ca,#6366f1);
  color:#fff; font-size:12px; font-weight:700; border:none; cursor:pointer;
  box-shadow:0 4px 10px rgba(99,102,241,.3); transition:all .15s;
}
.svm-empty-btn:hover { transform:translateY(-1px); box-shadow:0 6px 14px rgba(99,102,241,.4); }

/* ── Footer tabel (info count) ── */
.svm-table-footer {
  padding:10px 18px;
  background:#f8fafc; border-top:1px solid #e2e8f0;
  display:flex; align-items:center; justify-content:space-between;
  flex-wrap:wrap; gap:8px;
  font-size:11px; color:#64748b;
}

/* ── MODAL — FIX BUG-9: dvh fallback iOS Safari ── */
.svm-modal-backdrop {
  position:fixed; inset:0; z-index:200;
  background:rgba(15,23,42,.6); backdrop-filter:blur(4px);
  display:flex; align-items:center; justify-content:center;
  padding:16px;
  animation: svm-fade-in .2s ease;
}
.svm-modal-backdrop.hidden { display:none; }
@keyframes svm-fade-in {
  from { opacity:0; }
  to   { opacity:1; }
}
.svm-modal-box {
  background:#fff; border-radius:20px;
  box-shadow:0 24px 60px -10px rgba(15,23,42,.5);
  width:100%; max-width:500px;
  /* FIX BUG-9: dvh fallback untuk iOS Safari */
  max-height:92dvh; max-height:92vh;
  display:flex; flex-direction:column; overflow:hidden;
  animation: svm-modal-in .25s cubic-bezier(.34,1.56,.64,1);
}
@media(max-width:480px){
  .svm-modal-box {
    border-radius:16px 16px 0 0;
    max-height:96dvh; max-height:96vh;
    /* FIX: modal sebagai bottom sheet di mobile kecil */
  }
  .svm-modal-backdrop {
    align-items:flex-end;
    padding:0;
  }
}
@keyframes svm-modal-in {
  from { opacity:0; transform:scale(.94) translateY(14px); }
  to   { opacity:1; transform:scale(1)   translateY(0);    }
}
.svm-modal-head {
  background:linear-gradient(135deg,#312e81 0%,#4338ca 100%);
  padding:16px 20px; border-radius:20px 20px 0 0;
  display:flex; align-items:center; justify-content:space-between;
  gap:12px; flex-shrink:0;
}
@media(max-width:480px){ .svm-modal-head { border-radius:16px 16px 0 0; } }
.svm-modal-head-ico {
  width:36px; height:36px; border-radius:9px;
  background:rgba(255,255,255,.2);
  display:flex; align-items:center; justify-content:center;
  font-size:16px; color:#fff; flex-shrink:0;
}
.svm-modal-body {
  padding:20px; overflow-y:auto; flex:1;
  display:flex; flex-direction:column; gap:14px;
}
.svm-modal-foot {
  padding:14px 20px; background:#f8fafc; border-top:1px solid #e2e8f0;
  border-radius:0 0 20px 20px;
  display:flex; justify-content:flex-end; gap:10px;
  flex-shrink:0;
}
@media(max-width:480px){ .svm-modal-foot { border-radius:0; } }

/* Form elements */
.svm-field-group { display:flex; flex-direction:column; gap:5px; }
.svm-label {
  font-size:11px; font-weight:800; color:#64748b;
  text-transform:uppercase; letter-spacing:.05em;
  display:flex; align-items:center; gap:5px;
}
.svm-input {
  width:100%; padding:10px 14px;
  border:1.5px solid #e2e8f0; border-radius:10px;
  font-size:13px; color:#1e293b; background:#fff;
  outline:none; transition:all .15s; box-sizing:border-box;
}
.svm-input:focus {
  border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12);
}
.svm-input.err { border-color:#f87171; box-shadow:0 0 0 3px rgba(248,113,113,.15); }
.svm-field-hint {
  font-size:10px; color:#94a3b8; display:flex; align-items:flex-start; gap:4px;
  line-height:1.5;
}
.svm-field-hint i { flex-shrink:0; margin-top:1px; }

.svm-err-banner {
  background:#fef2f2; border:1.5px solid #fecaca; border-radius:10px;
  padding:10px 14px; font-size:12px; font-weight:600; color:#dc2626;
  display:flex; align-items:flex-start; gap:8px;
}
.svm-err-banner.hidden { display:none; }

.svm-btn-primary {
  background:linear-gradient(135deg,#4338ca,#6366f1);
  color:#fff; font-weight:700; font-size:13px;
  padding:10px 20px; border-radius:10px; border:none; cursor:pointer;
  display:inline-flex; align-items:center; gap:7px;
  transition:all .18s; box-shadow:0 4px 12px rgba(99,102,241,.35);
}
.svm-btn-primary:hover  { background:linear-gradient(135deg,#3730a3,#4338ca); box-shadow:0 6px 16px rgba(99,102,241,.45); transform:translateY(-1px); }
.svm-btn-primary:active { transform:scale(.97); }
.svm-btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }

.svm-btn-secondary {
  background:#fff; color:#64748b; font-weight:700; font-size:13px;
  padding:10px 16px; border-radius:10px;
  border:1.5px solid #e2e8f0; cursor:pointer;
  display:inline-flex; align-items:center; gap:7px;
  transition:all .15s;
}
.svm-btn-secondary:hover { background:#f1f5f9; border-color:#cbd5e1; color:#1e293b; }

/* ── Animasi baris tabel ── */
@keyframes svm-row-in {
  from { opacity:0; transform:translateY(5px); }
  to   { opacity:1; transform:translateY(0); }
}
.svm-row-anim { animation: svm-row-in .18s ease both; }
`;
  document.head.appendChild(style);
})();

// ─── State pencarian lokal ────────────────────────────────────────────────────
window._svMgmtSearch = '';
// FIX BUG-3: debounce timer untuk search
var _svMgmtSearchTimer = null;

// FIX BUG-1: ESC listener untuk kedua modal — terdaftar SEKALI dengan flag guard
(function _svMgmtBindEsc() {
  if (window._svMgmtEscBound) return;
  window._svMgmtEscBound = true;
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    // Modal penugasan
    const m1 = document.getElementById('svmgmt-modal');
    if (m1 && !m1.classList.contains('hidden')) {
      e.stopPropagation();
      _svMgmtCloseForm();
      return;
    }
    // Modal pengganti
    const m2 = document.getElementById('svm-sub-modal');
    if (m2 && !m2.classList.contains('hidden')) {
      e.stopPropagation();
      _svMgmtSubModalClose();
    }
  });
})();

function _svMgmtApplySearch(val, clear) {
  if (clear) val = '';
  window._svMgmtSearch = val || '';
  const clearBtn = document.getElementById('svm-search-clear');
  const input    = document.getElementById('svm-search-input');
  if (clearBtn) clearBtn.classList.toggle('show', !!(val && val.length > 0));
  if (input && clear) input.value = '';

  // FIX BUG-3: debounce 250ms — update clear-btn segera, render setelah jeda
  clearTimeout(_svMgmtSearchTimer);
  _svMgmtSearchTimer = setTimeout(function() {
    _svMgmtApplyLocalFilter();
  }, 250);
}

function _svMgmtApplyLocalFilter() {
  const ui = window._svMgmtUI;
  if (!ui) return;
  const q          = (window._svMgmtSearch || '').toLowerCase().trim();
  const filterExam = (document.getElementById('svmgmt-filter-exam') || {}).value || '';
  const filtered   = ui.assignments.filter(a => {
    if (filterExam && a.examID !== filterExam) return false;
    if (q) {
      const hay = [
        a.supervisorName, a.supervisorUserID, a.roomName, a.sessionLabel, a.examID
      ].map(v => String(v||'').toLowerCase()).join(' ');
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  _svMgmtRenderTable(filtered, filterExam);
}

function _svMgmtClearErr() {
  const errEl = document.getElementById('svmgmt-form-err');
  if (errEl) errEl.classList.add('hidden');
}

function _svMgmtBackdropClick(e) {
  if (e.target === e.currentTarget) _svMgmtCloseForm();
}

// FIX BUG-4: sequence counter untuk cegah race condition saat Refresh diklik cepat berulang
var _svMgmtRefreshSeq = 0;

// Perbarui stat cards setelah data dimuat
function _svMgmtUpdateStats(assignments) {
  const total       = assignments.length;
  const uniqueExams = new Set(assignments.map(a => a.examID)).size;
  // Hitung pengawas aktif berdasarkan supervisor efektif (pengganti jika ada, asli jika tidak)
  const uniqueSvs   = new Set(assignments.map(a => a.hasSubstitute ? a.substituteUserID : a.supervisorUserID)).size;
  const uniqueRooms = new Set(assignments.map(a => (a.roomName || '').toLowerCase().trim())).size;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('svm-stat-total',       total);
  set('svm-stat-exams',       uniqueExams);
  set('svm-stat-supervisors', uniqueSvs);
  set('svm-stat-rooms',       uniqueRooms);
}

function _svMgmtRefresh() {
  if (!window._svMgmtUI) {
    window._svMgmtUI = { assignments: [], examList: [], supervisorList: [], editingId: null };
  }
  const ui = window._svMgmtUI;

  // FIX BUG-4: increment sequence, closure capture seq saat ini.
  // Callback hanya diproses jika seq tidak berubah (tidak ada refresh baru yang dimulai).
  _svMgmtRefreshSeq = (_svMgmtRefreshSeq || 0) + 1;
  const mySeq = _svMgmtRefreshSeq;

  window._svMgmtSearch = '';
  // FIX BUG-10: bersihkan debounce timer saat refresh manual
  clearTimeout(_svMgmtSearchTimer);

  // Reset search input
  const searchInput = document.getElementById('svm-search-input');
  const clearBtn    = document.getElementById('svm-search-clear');
  if (searchInput) searchInput.value = '';
  if (clearBtn)    clearBtn.classList.remove('show');

  // Loading state pada tabel dan cards
  const tableWrap = document.getElementById('svm-table-wrap');
  const cardsWrap = document.getElementById('svm-cards-wrap');
  const loadingHtml = `<div class="svm-loading"><i class="fas fa-circle-notch fa-spin text-indigo-400 text-xl"></i><span class="text-slate-500 text-sm font-medium">Memuat data...</span></div>`;
  if (tableWrap) tableWrap.innerHTML = loadingHtml;
  if (cardsWrap) cardsWrap.innerHTML = loadingHtml;

  // Reset stat counts
  ['svm-stat-total','svm-stat-exams','svm-stat-supervisors','svm-stat-rooms'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<i class="fas fa-circle-notch fa-spin text-indigo-300 text-xs"></i>';
  });

  google.script.run
    .withSuccessHandler(function(exRes) {
      // FIX BUG-4: abaikan response jika ada refresh baru yang sudah dimulai
      if (mySeq !== _svMgmtRefreshSeq) return;
      const examArr = Array.isArray(exRes) ? exRes : [];
      ui.examList = examArr;

      const filterSel = document.getElementById('svmgmt-filter-exam');
      const formSel   = document.getElementById('svmgmt-f-exam');
      if (filterSel) {
        filterSel.innerHTML = '<option value="">Semua Ujian</option>' +
          examArr.map(e => `<option value="${e.id||e.examID||''}">${e.subject||''} \u2014 ${e.class||e.kelas||''}</option>`).join('');
      }
      if (formSel) {
        formSel.innerHTML = '<option value="">— Pilih Ujian —</option>' +
          examArr.map(e => {
            const statusBadge = e.status === 'Aktif' ? ' ✅' : '';
            return `<option value="${e.id||e.examID||''}">${e.subject||''} \u2014 ${e.class||e.kelas||''} (${e.status||''})${statusBadge}</option>`;
          }).join('');
      }

      google.script.run
        .withSuccessHandler(function(svRes) {
          if (mySeq !== _svMgmtRefreshSeq) return;
          ui.supervisorList = (svRes && svRes.success && svRes.data) ? svRes.data : [];
          const svSel = document.getElementById('svmgmt-f-supervisor');
          if (svSel) {
            svSel.innerHTML = '<option value="">— Pilih Pengawas / Guru —</option>' +
              ui.supervisorList.map(s => {
                const roleLabel = s.role === 'Guru' ? ' [Guru]' : ' [Pengawas]';
                const inactive  = s.isActive ? '' : ' (Non-Aktif)';
                return `<option value="${s.userID}">${s.name}${roleLabel}${inactive}</option>`;
              }).join('');
          }

          const filterExamID = (document.getElementById('svmgmt-filter-exam') || {}).value || '';
          google.script.run
            .withSuccessHandler(function(asRes) {
              if (mySeq !== _svMgmtRefreshSeq) return;
              ui.assignments = (asRes && asRes.success && asRes.data) ? asRes.data : [];
              _svMgmtUpdateStats(ui.assignments);
              _svMgmtRenderTable(ui.assignments, filterExamID);
            })
            .withFailureHandler(function(err) {
              if (mySeq !== _svMgmtRefreshSeq) return;
              ui.assignments = [];
              _svMgmtUpdateStats([]);
              _svMgmtRenderTable([], '');
              console.error('getSupervisorAssignments gagal:', err);
            })
            .getSupervisorAssignments(currentUser.userID, currentUser.token, filterExamID);
        })
        .withFailureHandler(function(err) {
          if (mySeq !== _svMgmtRefreshSeq) return;
          console.error('getSupervisorUserList gagal:', err);
          ui.supervisorList = [];
          const svSel = document.getElementById('svmgmt-f-supervisor');
          if (svSel) svSel.innerHTML = '<option value="">\u26a0\ufe0f Gagal memuat daftar pengawas</option>';
          const filterExamID = (document.getElementById('svmgmt-filter-exam') || {}).value || '';
          google.script.run
            .withSuccessHandler(function(asRes) {
              if (mySeq !== _svMgmtRefreshSeq) return;
              ui.assignments = (asRes && asRes.success && asRes.data) ? asRes.data : [];
              _svMgmtUpdateStats(ui.assignments);
              _svMgmtRenderTable(ui.assignments, filterExamID);
            })
            .withFailureHandler(function() {
              if (mySeq !== _svMgmtRefreshSeq) return;
              ui.assignments = []; _svMgmtUpdateStats([]); _svMgmtRenderTable([], '');
            })
            .getSupervisorAssignments(currentUser.userID, currentUser.token, filterExamID);
        })
        .getSupervisorUserList(currentUser.userID, currentUser.token);
    })
    .withFailureHandler(function(err) {
      if (mySeq !== _svMgmtRefreshSeq) return;
      ui.examList = [];
      _svMgmtUpdateStats([]);
      _svMgmtRenderTable([], '');
      console.error('getExamList gagal:', err);
    })
    .getExamList(currentUser.userID, currentUser.token);
}

// ─────────────────────────────────────────────────────────────────
// Sinkronisasi bulk: samakan SupervisorAssignID di ExamRooms
// dengan data terkini di sheet Supervisors
// ─────────────────────────────────────────────────────────────────
function _svMgmtSyncAll() {
  Swal && Swal.fire({
    title: 'Sinkronisasi Data Pengawas?',
    html: `
      <div style="text-align:left;font-size:13px;color:#475569;line-height:1.7;">
        <p>Proses ini akan mencocokkan kolom <strong>Pengawas</strong> di semua Ruang Ujian dengan data penugasan pengawas yang ada saat ini.</p>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:10px 14px;margin-top:10px;font-size:12px;color:#0369a1;">
          <i class="fas fa-info-circle" style="margin-right:5px;"></i>
          Hanya baris yang berbeda nilainya yang akan diperbarui.
        </div>
      </div>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#4338ca',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fas fa-rotate mr-1"></i> Ya, Sinkronkan',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(function(result) {
    if (!result.isConfirmed) return;

    // Tampilkan loading di tombol
    const btn = document.getElementById('svm-btn-sync');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span class="hidden sm:inline"> Menyinkronkan...</span>';
    }

    google.script.run
      .withSuccessHandler(function(res) {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-rotate"></i><span class="hidden sm:inline"> Sinkronisasi</span>';
        }
        if (!res || !res.success) {
          Swal && Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: res ? res.message : 'Terjadi kesalahan saat sinkronisasi.',
            confirmButtonColor: '#4338ca',
            customClass: { popup: 'lp-swal' }
          });
          return;
        }
        const isChanged = res.updated > 0;
        Swal && Swal.fire({
          icon: isChanged ? 'success' : 'info',
          title: isChanged ? 'Sinkronisasi Selesai!' : 'Data Sudah Sinkron',
          html: `<div style="font-size:13px;color:#475569;">
            ${res.message}
            ${isChanged ? `<div style="margin-top:8px;font-size:12px;color:#64748b;">
              <i class="fas fa-check-circle text-emerald-500"></i>
              Halaman Ruang Ujian telah diperbarui.
            </div>` : ''}
          </div>`,
          confirmButtonColor: '#4338ca',
          customClass: { popup: 'lp-swal' },
          timer: isChanged ? 3000 : 2500,
          showConfirmButton: !isChanged
        });
        // Refresh tabel Manajemen Pengawas dan Ruang Ujian jika aktif
        if (isChanged) {
          _svMgmtRefresh();
          _erSyncIfActive('');
        }
      })
      .withFailureHandler(function(err) {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-rotate"></i><span class="hidden sm:inline"> Sinkronisasi</span>';
        }
        Swal && Swal.fire({
          icon: 'error',
          title: 'Koneksi Gagal',
          text: err && err.message ? err.message : 'Gagal terhubung ke server.',
          confirmButtonColor: '#4338ca',
          customClass: { popup: 'lp-swal' }
        });
      })
      .syncAllExamRoomSupervisors(currentUser.userID, currentUser.token);
  });
}

function _svMgmtFilterChanged() {
  // FIX BUG-10: bersihkan debounce timer saat filter berubah
  clearTimeout(_svMgmtSearchTimer);
  window._svMgmtSearch = '';
  const searchInput = document.getElementById('svm-search-input');
  const clearBtn    = document.getElementById('svm-search-clear');
  if (searchInput) searchInput.value = '';
  if (clearBtn)    clearBtn.classList.remove('show');
  _svMgmtApplyLocalFilter();
}

function _svMgmtRenderTable(assignments, filterExamID) {
  const tableWrap = document.getElementById('svm-table-wrap');
  const cardsWrap = document.getElementById('svm-cards-wrap');
  if (!tableWrap && !cardsWrap) return;

  // Build examMap dari cache
  const ui = window._svMgmtUI || {};
  const examMap = {};
  (ui.examList || []).forEach(e => {
    const eid = e.id || e.examID || '';
    if (eid) examMap[eid] = `${e.subject||''} \u2014 ${e.class||e.kelas||''}`;
  });

  // Build supervisorMap dari cache (untuk badge role)
  const svMap = {};
  (ui.supervisorList || []).forEach(s => { svMap[s.userID] = s; });

  if (!assignments || assignments.length === 0) {
    const isFiltered = !!(filterExamID || (window._svMgmtSearch || '').trim());
    const emptyHtml = `
      <div class="svm-empty">
        <div class="svm-empty-ico">
          <i class="fas ${isFiltered ? 'fa-filter-circle-xmark' : 'fa-user-slash'}" aria-hidden="true"></i>
        </div>
        <p>${isFiltered ? 'Tidak ada penugasan yang cocok.' : 'Belum ada penugasan pengawas.'}</p>
        <small>${isFiltered
          ? 'Coba ubah filter atau bersihkan kata kunci pencarian.'
          : 'Tentukan pengawas per ruang ujian dan sesi untuk mulai mengatur jadwal.'}
        </small>
        ${isFiltered
          ? `<button class="svm-empty-btn" onclick="_svMgmtFilterChanged()">
               <i class="fas fa-rotate-left"></i> Reset Filter
             </button>`
          : `<button class="svm-empty-btn" onclick="_svMgmtOpenForm(null)">
               <i class="fas fa-plus"></i> Tambah Penugasan Pertama
             </button>`}
      </div>`;
    if (tableWrap) tableWrap.innerHTML = emptyHtml;
    if (cardsWrap) cardsWrap.innerHTML = emptyHtml;
    return;
  }

  // ── HELPER: render role badge ──
  function roleBadge(svID) {
    const sv = svMap[svID];
    if (!sv) return '';
    return sv.role === 'Guru'
      ? `<span class="svm-sv-role-guru"><i class="fas fa-chalkboard-teacher"></i> Guru</span>`
      : `<span class="svm-sv-role-pengawas"><i class="fas fa-user-tie"></i> Pengawas</span>`;
  }

  // ── TABEL DESKTOP ──
  if (tableWrap) {
    const delay = (i) => `animation-delay:${i * 30}ms`;
    const rows = assignments.map((a, idx) => {
      const examLabel = examMap[a.examID] || a.examID;
      const safeId   = (a.id            || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const safeName = (a.supervisorName|| '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const safeRoom = (a.roomName      || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const safeSess = (a.sessionLabel  || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const examLabelSafe = examLabel.replace(/&/g,'&amp;').replace(/</g,'&lt;');
      const examIdSafe    = (a.examID||'').replace(/&/g,'&amp;');

      // Kolom Pengganti
      const safeSubName = (a.substituteName || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const substituteCell = a.hasSubstitute
        ? `<div style="display:flex;flex-direction:column;gap:3px;">
             <span style="display:inline-flex;align-items:center;gap:5px;background:#fef3c7;color:#78350f;
               border:1px solid #fde68a;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:700;
               white-space:nowrap;max-width:180px;">
               <i class="fas fa-user-clock" style="font-size:10px;flex-shrink:0;"></i>
               <span style="overflow:hidden;text-overflow:ellipsis;">${safeSubName}</span>
             </span>
             <span style="font-size:10px;color:#94a3b8;line-height:1.4;">
               <i class="fas fa-reply" style="font-size:8px;color:#f59e0b;margin-right:2px;"></i>
               Menggantikan <b style="color:#64748b;">${safeName}</b>
             </span>
           </div>`
        : `<span style="font-size:11px;color:#cbd5e1;font-style:italic;">—</span>`;

      // BUG-13 FIX: kolom Dibuat dengan fallback teks lebih informatif + title tooltip
      const createdAtDisplay = a.createdAt && a.createdAt !== '-'
        ? `<span title="Dibuat: ${a.createdAt}" style="white-space:nowrap;">${a.createdAt}</span>`
        : `<span style="color:#cbd5e1;font-style:italic;">—</span>`;

      return `
        <tr class="svm-row-anim" style="${delay(idx)}">
          <td class="text-slate-400 font-mono text-xs">${idx + 1}</td>
          <td>
            <div class="svm-exam-cell">
              <div class="svm-exam-name" title="${examIdSafe}">${examLabelSafe}</div>
              <div class="svm-exam-id">${examIdSafe}</div>
            </div>
          </td>
          <td><span class="svm-badge svm-badge-room"><i class="fas fa-door-open"></i> ${safeRoom}</span></td>
          <td><span class="svm-badge svm-badge-sess"><i class="fas fa-clock"></i> ${safeSess}</span></td>
          <td>
            <div class="svm-sv-name${a.hasSubstitute ? ' text-slate-400 line-through' : ''}" title="${safeName}">${safeName}</div>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              ${roleBadge(a.supervisorUserID)}
              <span class="svm-sv-id">${(a.supervisorUserID||'').replace(/&/g,'&amp;')}</span>
            </div>
          </td>
          <td>${substituteCell}</td>
          <td class="text-slate-400 text-[11px]">${createdAtDisplay}</td>
          <td>
            <div class="svm-action-wrap">
              <button class="svm-action-btn svm-action-edit"
                data-assign-id="${safeId}"
                onclick="_svMgmtOpenForm(this.dataset.assignId)"
                title="Edit penugasan" aria-label="Edit penugasan ${safeName}">
                <i class="fas fa-pen" aria-hidden="true"></i>
              </button>
              <button class="svm-action-btn svm-action-sub"
                data-assign-id="${safeId}"
                data-has-sub="${a.hasSubstitute ? '1' : '0'}"
                onclick="_svMgmtSubstituteAction(this.dataset.assignId, this.dataset.hasSub === '1')"
                title="${a.hasSubstitute ? 'Cabut pengawas pengganti' : 'Tunjuk pengawas pengganti'}"
                aria-label="${a.hasSubstitute ? 'Cabut pengganti' : 'Tunjuk pengganti'}"
                style="background:${a.hasSubstitute ? '#fef3c7' : '#ecfdf5'};color:${a.hasSubstitute ? '#92400e' : '#065f46'};border:1px solid ${a.hasSubstitute ? '#fde68a' : '#a7f3d0'};">
                <i class="fas ${a.hasSubstitute ? 'fa-user-xmark' : 'fa-user-clock'}" aria-hidden="true"></i>
              </button>
              <button class="svm-action-btn svm-action-del"
                data-assign-id="${safeId}"
                data-sv-name="${safeName}"
                data-room="${safeRoom}"
                data-sess="${safeSess}"
                onclick="_svMgmtDelete(this.dataset.assignId,this.dataset.svName,this.dataset.room,this.dataset.sess)"
                title="Hapus penugasan" aria-label="Hapus penugasan ${safeName}">
                <i class="fas fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    tableWrap.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="svm-table" role="table" aria-label="Daftar penugasan pengawas">
          <thead>
            <tr>
              <th style="width:40px;">#</th>
              <th>Ujian</th>
              <th>Ruang</th>
              <th>Sesi</th>
              <th>Pengawas Utama</th>
              <th>Pengganti Aktif</th>
              <th title="Tanggal penugasan dibuat" style="white-space:nowrap;">
                <i class="fas fa-calendar-plus text-slate-400 mr-1" aria-hidden="true"></i>Dibuat
              </th>
              <th style="text-align:center;width:110px;">Aksi</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="svm-table-footer">
        <span>
          Menampilkan <strong>${assignments.length}</strong> penugasan
          ${filterExamID || (window._svMgmtSearch||'').trim() ? '<span style="color:#6366f1;font-style:italic;"> (difilter)</span>' : ''}
        </span>
        <span style="color:#6366f1;font-weight:600;font-size:10.5px;">
          <i class="fas fa-info-circle mr-1" aria-hidden="true"></i>
          Klik <i class="fas fa-user-clock" aria-hidden="true"></i> untuk tunjuk / cabut pengawas pengganti
        </span>
      </div>`;
  }

  // ── CARDS MOBILE ──
  if (cardsWrap) {
    const cards = assignments.map((a, idx) => {
      const examLabel = examMap[a.examID] || a.examID;
      const initial   = (a.supervisorName || '?').charAt(0).toUpperCase();
      const safeId    = (a.id            || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const safeName  = (a.supervisorName|| '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const safeRoom  = (a.roomName      || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const safeSess  = (a.sessionLabel  || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const safeSubName = (a.substituteName || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;');

      const substituteBadge = a.hasSubstitute
        ? `<div class="svm-card-row" style="background:#fef9e7;border-radius:8px;padding:7px 10px;gap:7px;">
             <i class="fas fa-user-clock" style="color:#f59e0b;flex-shrink:0;" aria-hidden="true"></i>
             <div style="min-width:0;">
               <div style="font-size:11px;font-weight:700;color:#78350f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                 ${safeSubName}
               </div>
               <div style="font-size:10px;color:#92400e;margin-top:1px;">
                 Menggantikan <b>${safeName}</b>
               </div>
             </div>
           </div>`
        : '';

      return `
        <div class="svm-card svm-row-anim" style="animation-delay:${idx*25}ms">
          <div class="svm-card-head">
            <div class="svm-card-avatar${a.hasSubstitute ? '" style="opacity:.5;filter:grayscale(.4' : ''}"
              aria-hidden="true">${initial}</div>
            <div class="flex-1 min-w-0">
              <div class="svm-card-title${a.hasSubstitute ? ' text-slate-400 line-through' : ''}"
                title="${safeName}">${safeName}</div>
              <div class="svm-card-sub mt-1">
                ${roleBadge(a.supervisorUserID)}
                <span style="font-family:'Courier New',monospace;font-size:10px;color:#94a3b8;">${(a.supervisorUserID||'').replace(/&/g,'&amp;')}</span>
              </div>
            </div>
          </div>
          <div class="svm-card-body">
            <div class="svm-card-row">
              <i class="fas fa-book-open" aria-hidden="true"></i>
              <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;">${(examLabel||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>
            </div>
            <div class="svm-card-row">
              <i class="fas fa-door-open" aria-hidden="true"></i>
              <span><b>Ruang:</b> ${safeRoom}</span>
            </div>
            <div class="svm-card-row">
              <i class="fas fa-clock" aria-hidden="true"></i>
              <span><b>Sesi:</b> ${safeSess}</span>
            </div>
            ${substituteBadge}
            <div class="svm-card-row">
              <i class="fas fa-calendar-plus" aria-hidden="true"></i>
              <span class="text-slate-400 text-[11px]">
                Dibuat: ${a.createdAt && a.createdAt !== '-' ? a.createdAt : '—'}
              </span>
            </div>
          </div>
          <div class="svm-card-foot">
            <button class="svm-action-btn svm-action-edit"
              data-assign-id="${safeId}"
              onclick="_svMgmtOpenForm(this.dataset.assignId)"
              title="Edit penugasan" aria-label="Edit">
              <i class="fas fa-pen" aria-hidden="true"></i>
            </button>
            <button class="svm-action-btn svm-action-sub"
              style="padding:0 12px;width:auto;font-size:11px;gap:6px;
                background:${a.hasSubstitute ? '#fef3c7' : '#ecfdf5'};
                color:${a.hasSubstitute ? '#92400e' : '#065f46'};
                border:1.5px solid ${a.hasSubstitute ? '#fde68a' : '#a7f3d0'};"
              data-assign-id="${safeId}"
              data-has-sub="${a.hasSubstitute ? '1' : '0'}"
              onclick="_svMgmtSubstituteAction(this.dataset.assignId, this.dataset.hasSub === '1')"
              aria-label="${a.hasSubstitute ? 'Cabut pengganti' : 'Tunjuk pengganti'}">
              <i class="fas ${a.hasSubstitute ? 'fa-user-xmark' : 'fa-user-clock'}" aria-hidden="true"></i>
              <span>${a.hasSubstitute ? 'Cabut' : 'Tunjuk Pengganti'}</span>
            </button>
            <button class="svm-action-btn svm-action-del"
              style="padding:0 14px;width:auto;font-size:12px;gap:6px;"
              data-assign-id="${safeId}"
              data-sv-name="${safeName}"
              data-room="${safeRoom}"
              data-sess="${safeSess}"
              onclick="_svMgmtDelete(this.dataset.assignId,this.dataset.svName,this.dataset.room,this.dataset.sess)"
              aria-label="Hapus penugasan">
              <i class="fas fa-trash" aria-hidden="true"></i>
              <span>Hapus</span>
            </button>
          </div>
        </div>`;
    }).join('');

    cardsWrap.innerHTML = cards;
  }
}

function _svMgmtOpenForm(assignId) {
  const ui    = window._svMgmtUI;
  const modal = document.getElementById('svmgmt-modal');
  const title = document.getElementById('svmgmt-modal-title');
  const ico   = document.getElementById('svmgmt-modal-ico');
  const errEl = document.getElementById('svmgmt-form-err');
  if (!modal || !ui) return;

  if (errEl) errEl.classList.add('hidden');

  // Reset field error styling
  ['svmgmt-f-exam','svmgmt-f-room','svmgmt-f-room-text','svmgmt-f-session','svmgmt-f-supervisor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('err');
  });

  if (assignId) {
    const a = ui.assignments.find(x => x.id === assignId);
    if (!a) {
      Swal && Swal.fire({
        icon:'warning', title:'Data tidak ditemukan',
        text:'Penugasan ini tidak lagi ada di daftar. Halaman akan diperbarui.',
        confirmButtonColor:'#4338ca', customClass:{popup:'lp-swal'}, timer:2500, showConfirmButton:false
      });
      _svMgmtRefresh();
      return;
    }
    ui.editingId = assignId;
    if (title) title.textContent = 'Edit Penugasan';
    if (ico)   ico.innerHTML = '<i class="fas fa-pen"></i>';

    const examSel = document.getElementById('svmgmt-f-exam');
    const sessEl  = document.getElementById('svmgmt-f-session');
    if (examSel) examSel.value = a.examID;
    if (sessEl)  sessEl.value  = a.sessionLabel;
    // FIX BUG-5: set nilai supervisor SETELAH _svMgmtOnExamChange selesai memuat dropdown
    // ruang (yang bersifat async). Supervisor disetor via parameter restoreSupervisorID
    // agar getExamRooms callback bisa set nilainya dengan aman.
    _svMgmtOnExamChange(a.examID, a.roomName, a.supervisorUserID);
  } else {
    ui.editingId = null;
    if (title) title.textContent = 'Tambah Penugasan';
    if (ico)   ico.innerHTML = '<i class="fas fa-user-plus"></i>';
    ['svmgmt-f-exam','svmgmt-f-room','svmgmt-f-session','svmgmt-f-supervisor'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const roomText = document.getElementById('svmgmt-f-room-text');
    if (roomText) roomText.value = '';
    _svMgmtResetRoomField();
  }

  modal.classList.remove('hidden');
  // Fokus ke field pertama yang kosong
  setTimeout(function() {
    const examEl = document.getElementById('svmgmt-f-exam');
    if (examEl && !examEl.value) { try { examEl.focus(); } catch(e){} }
    else {
      const roomSel  = document.getElementById('svmgmt-f-room');
      const roomText = document.getElementById('svmgmt-f-room-text');
      const activeRoom = (roomSel && roomSel.style.display !== 'none') ? roomSel : roomText;
      if (activeRoom && !activeRoom.value) { try { activeRoom.focus(); } catch(e){} }
    }
  }, 80);
}

function _svMgmtCloseForm() {
  const modal = document.getElementById('svmgmt-modal');
  if (modal) modal.classList.add('hidden');
  if (window._svMgmtUI) window._svMgmtUI.editingId = null;
}

// ── Reset field ruang ke mode input teks (belum ada ujian dipilih) ────────────
function _svMgmtResetRoomField() {
  const sel  = document.getElementById('svmgmt-f-room');
  const inp  = document.getElementById('svmgmt-f-room-text');
  const hint = document.getElementById('svmgmt-room-hint');
  if (sel)  { sel.style.display  = 'none'; sel.innerHTML = '<option value="">— Pilih Ruang —</option>'; sel.value = ''; }
  if (inp)  { inp.style.display  = '';    inp.value = ''; inp.placeholder = 'Mis: Ruang A / Lab 1'; }
  if (hint) hint.style.display   = 'none';
}

// ── Dipanggil saat ujian berubah — muat dropdown ruang dari ExamRooms ─────────
// FIX BUG-5: tambah param restoreSupervisorID agar supervisor di-set SETELAH room dimuat
function _svMgmtOnExamChange(examID, restoreRoomName, restoreSupervisorID) {
  const sel  = document.getElementById('svmgmt-f-room');
  const inp  = document.getElementById('svmgmt-f-room-text');
  const hint = document.getElementById('svmgmt-room-hint');

  // Kosongkan ujian → kembali ke input teks
  if (!examID) {
    _svMgmtResetRoomField();
    return;
  }

  // Tampilkan state loading di input sementara dropdown dimuat
  if (inp)  { inp.style.display = ''; inp.value = ''; inp.placeholder = 'Memuat ruangan...'; inp.disabled = true; }
  if (sel)  sel.style.display = 'none';
  if (hint) hint.style.display = 'none';

  google.script.run
    .withSuccessHandler(function(res) {
      if (inp) inp.disabled = false;
      const rooms = (res && res.success && Array.isArray(res.data)) ? res.data : [];

      // Deduplikasi nama ruang (case-insensitive, pertahankan urutan pertama muncul)
      const seen = {};
      const uniqueRooms = [];
      rooms.forEach(function(r) {
        const key = (r.roomName || '').trim().toLowerCase();
        if (key && !seen[key]) { seen[key] = true; uniqueRooms.push(r.roomName.trim()); }
      });

      if (uniqueRooms.length > 0) {
        // Ada ruang terdaftar → tampilkan dropdown
        if (sel) {
          let opts = '<option value="">— Pilih Ruang —</option>';
          uniqueRooms.forEach(function(name) {
            opts += '<option value="' + name.replace(/"/g, '&quot;') + '">' + name.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</option>';
          });
          sel.innerHTML = opts;
          // Jika ada nilai yang harus di-restore (mode edit), set sekarang
          if (restoreRoomName) {
            sel.value = restoreRoomName;
            // Jika nilai tidak ada di daftar (ruang dihapus), tambahkan sebagai opsi
            if (!sel.value) {
              const extra = '<option value="' + restoreRoomName.replace(/"/g,'&quot;') + '">' + restoreRoomName.replace(/</g,'&lt;').replace(/>/g,'&gt;') + ' (tidak ditemukan)</option>';
              sel.innerHTML += extra;
              sel.value = restoreRoomName;
            }
          }
          sel.style.display = '';
        }
        if (inp)  inp.style.display = 'none';
        if (hint) hint.style.display = '';
      } else {
        // Belum ada ruang → fallback ke input teks bebas
        if (sel)  { sel.style.display = 'none'; }
        if (inp)  { inp.style.display = ''; inp.placeholder = 'Mis: Ruang A / Lab 1'; }
        if (restoreRoomName && inp) inp.value = restoreRoomName;
        if (hint) {
          hint.style.display = '';
          hint.innerHTML = '<i class="fas fa-info-circle"></i> Belum ada ruang di Halaman Ruang Ujian untuk ujian ini. Ketik nama ruang secara manual.';
        }
      }
      // FIX BUG-5: set supervisor SETELAH ruang selesai dimuat agar nilai tidak ter-reset
      if (restoreSupervisorID) {
        var svSel = document.getElementById('svmgmt-f-supervisor');
        if (svSel) svSel.value = restoreSupervisorID;
      }
    })
    .withFailureHandler(function() {
      // Gagal load → fallback ke input teks
      if (inp)  { inp.disabled = false; inp.style.display = ''; inp.placeholder = 'Mis: Ruang A / Lab 1'; }
      if (sel)  sel.style.display = 'none';
      if (restoreRoomName && inp) inp.value = restoreRoomName;
      if (hint) {
        hint.style.display = '';
        hint.innerHTML = '<i class="fas fa-triangle-exclamation" style="color:#f59e0b;"></i> Gagal memuat daftar ruang. Ketik nama ruang secara manual.';
      }
      // FIX BUG-5: restore supervisor bahkan jika load ruang gagal
      if (restoreSupervisorID) {
        var svSel = document.getElementById('svmgmt-f-supervisor');
        if (svSel) svSel.value = restoreSupervisorID;
      }
    })
    .getExamRooms(currentUser.userID, currentUser.token, examID);
}

function _svMgmtSave() {
  const ui      = window._svMgmtUI;
  const errEl   = document.getElementById('svmgmt-form-err');
  const errTxt  = document.getElementById('svmgmt-form-err-text');
  const saveBtn = document.getElementById('svmgmt-save-btn');

  const examEl    = document.getElementById('svmgmt-f-exam');
  const roomEl    = document.getElementById('svmgmt-f-room');
  const sessionEl = document.getElementById('svmgmt-f-session');
  const svEl      = document.getElementById('svmgmt-f-supervisor');

  const examID  = examEl    ? (examEl.value    || '').trim() : '';
  // Baca nilai dari dropdown ruang jika tampil, fallback ke input text
  const roomSel     = (roomEl && roomEl.style.display !== 'none') ? roomEl : null;
  const roomTextEl  = document.getElementById('svmgmt-f-room-text');
  const roomActiveEl = roomSel || roomTextEl;
  const room    = roomSel    ? (roomSel.value    || '').trim()
                : roomTextEl ? (roomTextEl.value || '').trim() : '';
  const session = sessionEl ? (sessionEl.value || '').trim() : '';
  const svID    = svEl      ? (svEl.value      || '').trim() : '';

  // Validasi dengan highlight field
  const showErr = (msg, ...els) => {
    if (errTxt) errTxt.textContent = msg;
    if (errEl)  { errEl.classList.remove('hidden'); }
    els.forEach(el => el && el.classList.add('err'));
    // Scroll ke error
    if (errEl) errEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
  };

  [examEl, sessionEl, svEl].forEach(el => el && el.classList.remove('err'));
  if (roomActiveEl) roomActiveEl.classList.remove('err');

  if (!examID)  { showErr('Ujian wajib dipilih.',            examEl);         return; }
  if (!room)    { showErr('Ruang ujian tidak boleh kosong.', roomActiveEl);   return; }
  if (!session) { showErr('Label sesi tidak boleh kosong.',  sessionEl);      return; }
  if (!svID)    { showErr('Pengawas wajib dipilih.',         svEl);           return; }

  if (errEl) errEl.classList.add('hidden');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Menyimpan...';
  }

  const form = { examID, roomName: room, sessionLabel: session, supervisorUserID: svID };

  const handler = function(res) {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-floppy-disk"></i> Simpan Penugasan';
    }
    if (!res || !res.success) {
      if (errTxt) errTxt.textContent = res ? res.message : 'Gagal menyimpan.';
      if (errEl)  errEl.classList.remove('hidden');
      return;
    }
    _svMgmtCloseForm();
    Swal && Swal.fire({
      icon:'success', title:'Berhasil!',
      text: res.message || 'Penugasan disimpan.',
      confirmButtonColor:'#4338ca', customClass:{popup:'lp-swal'},
      timer:2000, showConfirmButton:false
    });
    _svMgmtRefresh();
    // SINKRONISASI: jika halaman Ruang Ujian sedang aktif dan menampilkan ujian yang sama,
    // refresh daftar ruang agar nama pengawas langsung terupdate tanpa pindah tab
    _erSyncIfActive(form.examID);
  };
  const failHandler = function(err) {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-floppy-disk"></i> Simpan Penugasan';
    }
    if (errTxt) errTxt.textContent = err && err.message ? err.message : 'Koneksi gagal.';
    if (errEl)  errEl.classList.remove('hidden');
  };

  if (ui && ui.editingId) {
    form.id = ui.editingId;
    google.script.run.withSuccessHandler(handler).withFailureHandler(failHandler)
      .updateSupervisorAssignment(form, currentUser.userID, currentUser.token);
  } else {
    google.script.run.withSuccessHandler(handler).withFailureHandler(failHandler)
      .createSupervisorAssignment(form, currentUser.userID, currentUser.token);
  }
}

function _svMgmtDelete(assignId, supervisorName, roomName, sessionLabel) {
  // Ambil examID dari cache state sebelum dialog dibuka
  const assignData = (window._svMgmtUI && window._svMgmtUI.assignments)
    ? window._svMgmtUI.assignments.find(function(a) { return a.id === assignId; })
    : null;
  const examIDForSync = assignData ? (assignData.examID || '') : '';
  Swal && Swal.fire({
    title: 'Hapus Penugasan?',
    html: `
      <div style="text-align:left;font-size:13px;color:#475569;line-height:1.7;">
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:12px;margin-bottom:10px;">
          <div style="font-weight:800;color:#4338ca;margin-bottom:6px;font-size:12px;">
            <i class="fas fa-user-tie" style="margin-right:5px;"></i>Detail Penugasan
          </div>
          <div><b>Pengawas:</b> ${supervisorName}</div>
          <div><b>Ruang:</b> ${roomName}</div>
          <div><b>Sesi:</b> ${sessionLabel}</div>
        </div>
        <p style="font-size:12px;color:#94a3b8;">Tindakan ini tidak dapat dibatalkan.</p>
      </div>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fas fa-trash mr-1"></i> Ya, Hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(function(result) {
    if (!result.isConfirmed) return;
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.success) {
          Swal && Swal.fire({
            icon:'error', title:'Gagal',
            text: res ? res.message : 'Terjadi kesalahan.',
            confirmButtonColor:'#4338ca', customClass:{popup:'lp-swal'}
          });
          return;
        }
        Swal && Swal.fire({
          icon:'success', title:'Dihapus!',
          text:'Penugasan berhasil dihapus.',
          confirmButtonColor:'#4338ca', customClass:{popup:'lp-swal'},
          timer:1800, showConfirmButton:false
        });
        if (window._svMgmtUI) _svMgmtRefresh();
        // SINKRONISASI: refresh daftar ruang jika halaman Ruang Ujian aktif dengan ujian yang sama
        _erSyncIfActive(examIDForSync);
      })
      .withFailureHandler(function(err) {
        Swal && Swal.fire({
          icon:'error', title:'Error',
          text: err && err.message ? err.message : 'Koneksi gagal.',
          customClass:{popup:'lp-swal'}
        });
      })
      .deleteSupervisorAssignment(assignId, currentUser.userID, currentUser.token);
  });
}

// ─── Fungsi Pengawas Pengganti ────────────────────────────────────────────────

/**
 * Titik masuk tombol aksi Tunjuk/Cabut Pengganti di tabel.
 * @param {string}  assignId   – SupervisorAssignID
 * @param {boolean} hasSub     – true jika sudah ada pengganti (mode cabut)
 */
function _svMgmtSubstituteAction(assignId, hasSub) {
  if (hasSub) {
    // Mode cabut — konfirmasi Swal langsung, tanpa modal
    _svMgmtClearSubstitute(assignId);
  } else {
    // Mode tunjuk — buka modal pilih pengganti
    _svMgmtSubModalOpen(assignId);
  }
}

/** Buka modal Tunjuk Pengganti dan isi dropdown supervisor. */
function _svMgmtSubModalOpen(assignId) {
  const modal   = document.getElementById('svm-sub-modal');
  const idInput = document.getElementById('svm-sub-assign-id');
  const selSup  = document.getElementById('svm-sub-f-supervisor');
  const infoDiv = document.getElementById('svm-sub-assignment-info');
  const errEl   = document.getElementById('svm-sub-err');
  if (!modal) return;

  // Ambil data assignment dari cache
  const ui = window._svMgmtUI || {};
  const a  = (ui.assignments || []).find(function(x) { return x.id === assignId; });
  if (!a) { _svMgmtRefresh(); return; }

  if (idInput) idInput.value = assignId;
  if (errEl)   errEl.classList.add('hidden');
  if (selSup)  selSup.value = ''; // reset pilihan sebelum isi ulang

  // Info assignment
  if (infoDiv) {
    const examMap = {};
    (ui.examList || []).forEach(function(e) {
      const eid = e.id || e.examID || '';
      if (eid) examMap[eid] = (e.subject || '') + ' — ' + (e.class || e.kelas || '');
    });
    const examLabel = examMap[a.examID] || a.examID;
    infoDiv.innerHTML = `
      <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">
        <i class="fas fa-info-circle" style="margin-right:4px;"></i>Detail Penugasan
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:12px;color:#44403c;">
        <span style="font-weight:700;">Ujian</span><span>${(examLabel||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>
        <span style="font-weight:700;">Ruang</span><span>${(a.roomName||'').replace(/&/g,'&amp;')}</span>
        <span style="font-weight:700;">Sesi</span><span>${(a.sessionLabel||'').replace(/&/g,'&amp;')}</span>
        <span style="font-weight:700;">Pengawas Asli</span>
        <span style="color:#dc2626;font-weight:700;">
          ${(a.supervisorName||'').replace(/&/g,'&amp;')}
          <span style="font-weight:400;color:#94a3b8;"> — akan kehilangan akses</span>
        </span>
      </div>`;
  }

  // Isi dropdown: daftar supervisor tersedia
  // Kecualikan: pengawas asli assignment ini, dan siapapun yang sudah jadi pengganti aktif
  if (selSup) {
    selSup.innerHTML = '<option value="">— Pilih Pengawas / Guru Pengganti —</option>';
    const originalID  = (a.supervisorUserID || '').toLowerCase();
    // Kumpulkan semua userID yang sudah jadi pengganti aktif di assignment lain
    const activeSubIDs = new Set();
    (ui.assignments || []).forEach(function(asgn) {
      if (asgn.id === assignId) return; // skip assignment ini sendiri
      if (asgn.hasSubstitute && asgn.substituteUserID) {
        activeSubIDs.add((asgn.substituteUserID || '').toLowerCase());
      }
    });
    (ui.supervisorList || []).forEach(function(s) {
      if (!s.isActive) return;
      if (s.userID.toLowerCase() === originalID) return; // pengawas asli assignment ini
      const opt = document.createElement('option');
      opt.value = s.userID;
      const roleLabel = s.role === 'Guru' ? '[Guru]' : '[Pengawas]';
      const alreadySub = activeSubIDs.has(s.userID.toLowerCase());
      opt.textContent = roleLabel + ' ' + s.name + (alreadySub ? ' (pengganti aktif lain)' : '');
      if (alreadySub) opt.style.color = '#94a3b8'; // visual hint tapi tetap bisa dipilih
      selSup.appendChild(opt);
    });
  }

  modal.classList.remove('hidden');
  setTimeout(function() { if (selSup) try { selSup.focus(); } catch(e){} }, 80);
}

function _svMgmtSubModalClose() {
  const modal = document.getElementById('svm-sub-modal');
  if (modal) modal.classList.add('hidden');
}

function _svMgmtSubModalBackdrop(e) {
  if (e.target === e.currentTarget) _svMgmtSubModalClose();
}

function _svMgmtSubClearErr() {
  const errEl = document.getElementById('svm-sub-err');
  if (errEl) errEl.classList.add('hidden');
}

/** Simpan penugasan pengganti ke backend. */
function _svMgmtSubSave() {
  const assignId   = (document.getElementById('svm-sub-assign-id')   || {}).value || '';
  const subUserID  = (document.getElementById('svm-sub-f-supervisor') || {}).value || '';
  const saveBtn    = document.getElementById('svm-sub-save-btn');
  const errEl      = document.getElementById('svm-sub-err');
  const errTxt     = document.getElementById('svm-sub-err-text');

  if (!subUserID) {
    if (errTxt) errTxt.textContent = 'Pengawas pengganti wajib dipilih.';
    if (errEl)  errEl.classList.remove('hidden');
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Menyimpan...';
  }
  if (errEl) errEl.classList.add('hidden');

  google.script.run
    .withSuccessHandler(function(res) {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-user-check"></i> Tunjuk Pengganti';
      }
      if (!res || !res.success) {
        if (errTxt) errTxt.textContent = res ? res.message : 'Gagal menyimpan.';
        if (errEl)  errEl.classList.remove('hidden');
        return;
      }
      _svMgmtSubModalClose();
      // FIX BUG-2: refresh segera — jangan tunggu Swal timer selesai
      _svMgmtRefresh();
      Swal && Swal.fire({
        icon: 'success', title: 'Pengganti Ditunjuk!',
        html: `<p style="font-size:13px;color:#475569;">${res.message}</p>`,
        confirmButtonColor: '#b45309', customClass: { popup: 'lp-swal' },
        timer: 2500, showConfirmButton: false
      });
    })
    .withFailureHandler(function(err) {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-user-check"></i> Tunjuk Pengganti';
      }
      if (errTxt) errTxt.textContent = err && err.message ? err.message : 'Koneksi gagal.';
      if (errEl)  errEl.classList.remove('hidden');
    })
    .setSubstituteSupervisor(assignId, subUserID, currentUser.userID, currentUser.token);
}

/** Cabut pengganti setelah konfirmasi. */
function _svMgmtClearSubstitute(assignId) {
  const ui = window._svMgmtUI || {};
  const a  = (ui.assignments || []).find(function(x) { return x.id === assignId; });
  const subName  = a ? (a.substituteName  || 'Pengganti') : 'Pengganti';
  const origName = a ? (a.supervisorName  || 'Pengawas Asli') : 'Pengawas Asli';

  Swal && Swal.fire({
    title: 'Cabut Pengawas Pengganti?',
    html: `
      <div style="text-align:left;font-size:13px;color:#475569;line-height:1.7;">
        <div style="background:#fef9e7;border:1px solid #fde68a;border-radius:10px;padding:12px;margin-bottom:10px;">
          <div style="font-weight:800;color:#b45309;margin-bottom:6px;font-size:12px;">
            <i class="fas fa-user-clock" style="margin-right:5px;"></i>Informasi Penggantian
          </div>
          <div><b>Pengganti saat ini:</b> ${subName.replace(/&/g,'&amp;')}</div>
          <div><b>Pengawas asli:</b> ${origName.replace(/&/g,'&amp;')}</div>
        </div>
        <p style="font-size:12px;color:#475569;">
          Setelah dicabut, <b>${origName.replace(/&/g,'&amp;')}</b> akan kembali mendapat akses ke penugasan ini.
        </p>
      </div>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#b45309',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fas fa-user-xmark mr-1"></i> Ya, Cabut Pengganti',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then(function(result) {
    if (!result.isConfirmed) return;
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.success) {
          Swal && Swal.fire({
            icon: 'error', title: 'Gagal',
            text: res ? res.message : 'Terjadi kesalahan.',
            confirmButtonColor: '#b45309', customClass: { popup: 'lp-swal' }
          });
          return;
        }
        Swal && Swal.fire({
          icon: 'success', title: 'Pengganti Dicabut!',
          html: `<p style="font-size:13px;color:#475569;">${res.message}</p>`,
          confirmButtonColor: '#4338ca', customClass: { popup: 'lp-swal' },
          timer: 2500, showConfirmButton: false
        });
        // FIX BUG-2: refresh segera, tidak bergantung pada Swal timer
        _svMgmtRefresh();
      })
      .withFailureHandler(function(err) {
        Swal && Swal.fire({
          icon: 'error', title: 'Error',
          text: err && err.message ? err.message : 'Koneksi gagal.',
          customClass: { popup: 'lp-swal' }
        });
      })
      .clearSubstituteSupervisor(assignId, currentUser.userID, currentUser.token);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// HALAMAN RUANG UJIAN (Admin Only)
// Memungkinkan Admin memasukkan peserta ujian ke ruang-ruang ujian.
// Pengawas hanya melihat daftar siswa di ruangan yang ia awasi.
// ═══════════════════════════════════════════════════════════════════════════════

// ── State halaman Ruang Ujian ─────────────────────────────────────────────────
// FIX B1 + B9: tambahkan activePanelTab di deklarasi global agar selalu defined
var _erState = {
  selectedExamID: '',
  examList:       [],
  rooms:          [],
  students:       [],
  supervisorAssignments: [],
  assignedMap:    {},
  examInfo:       null,
  activeRoomID:   null,
  studentSearch:  '',
  bulkSelected:   new Set(),
  activePanelTab: 'enrolled'   // FIX B1/B9: selalu ada di state global
};

// ── Entry point ───────────────────────────────────────────────────────────────
