/**
 * ui-shell.js — Shell UI Helpers
 * SIPADU CBT v5.1.0
 *
 * Fungsi untuk komponen shell utama:
 * - Sidebar collapse/expand/ripple
 * - Navbar clock, date, timezone
 * - Bell dropdown (notifikasi)
 * - Command palette (CmdK)
 * - Violation panel
 * Sumber: index.html L15301-15480, L20260-20545
 */

/* ─── Sidebar & Navbar helpers (L15301-15480) ─── */
// formatScore ada di utils.js

function _updateCollapseIcon() {
  const sidebar = document.getElementById('admin-sidebar');
  const icon    = document.getElementById('collapse-icon');
  if (!sidebar || !icon) return;
  icon.className = sidebar.classList.contains('collapsed')
    ? 'fas fa-outdent text-xs'
    : 'fas fa-indent text-xs';
}

/* ── Sidebar item mouse-position ripple ── */
function _initSidebarRipple() {
  document.querySelectorAll('#admin-sidebar .sidebar-item').forEach(el => {
    el.addEventListener('mousemove', function(e) {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      el.style.setProperty('--mx', x);
      el.style.setProperty('--my', y);
    });
  });
}

/* ── Navbar bell active state sync ── */
function _syncBellActiveState() {
  const btn = document.getElementById('dash-bell-btn');
  const dd  = document.getElementById('dash-bell-dropdown');
  if (!btn || !dd) return;
  if (dd.classList.contains('show')) btn.classList.add('bell-active');
  else btn.classList.remove('bell-active');
}

function toggleDesktopSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  _updateCollapseIcon();

  try {
    localStorage.setItem('sipadu_sidebar_collapsed',
      sidebar.classList.contains('collapsed') ? '1' : '0');
  } catch (e) {  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('mobile-overlay');
  if (!sidebar || !overlay) return;

  sidebar.classList.toggle('-translate-x-full');
  const isClosed = sidebar.classList.contains('-translate-x-full');

  overlay.classList.toggle('hidden', isClosed);
  document.body.style.overflow = isClosed ? '' : 'hidden';
}

window.addEventListener('resize', function() {
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('mobile-overlay');
  if (!sidebar) return;

  if (window.innerWidth >= 768) {

    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
  } else {

    if (!sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full');
      if (overlay) overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
});

// setDateDisplay: sudah ditangani oleh _tickClock — tidak perlu dipanggil terpisah.
// Tetap ada sebagai alias aman untuk pemanggil lama.
function setDateDisplay() {
  _tickClock();
}

// Inisialisasi clock state — jangan timpa nilai yang sudah di-set bootstrap.
if (!window._clockInterval) window._clockInterval = null;

function _triggerDirectDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '';
  a.target   = '_self';
  a.rel      = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() { if (a.parentNode) a.parentNode.removeChild(a); }, 300);
}

function fetchAndStartClock() {
  // VERCEL: timezone set by api-client.js bootstrap from GAS getConfig().
  function _startWithTz(tz) {
    window._appTimezone = tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
    _tickClock();
    if (window._clockInterval) clearInterval(window._clockInterval);
    window._clockInterval = setInterval(_tickClock, 1000);
  }
  if (window._appTimezone) {
    _startWithTz(window._appTimezone);
  } else {
    document.addEventListener('gasConfigLoaded', function(ev) {
      _startWithTz((ev.detail && ev.detail.timezone) || 'Asia/Jakarta');
    }, { once: true });
  }
}

function _tickClock() {
  const now = new Date();
  const tz  = window._appTimezone || 'Asia/Jakarta';

  const dtf = new Intl.DateTimeFormat('id-ID', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const timeParts = dtf.formatToParts(now);
  const H = (timeParts.find(p => p.type === 'hour')   || {}).value || '--';
  const M = (timeParts.find(p => p.type === 'minute') || {}).value || '--';
  const S = (timeParts.find(p => p.type === 'second') || {}).value || '--';
  const timeStr = H + ':' + M + ':' + S;

  const dateStr = now.toLocaleDateString('id-ID', {
    timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const tzLabel = _getTimezoneLabel(tz);

  const loginClock = document.getElementById('login-clock');
  const loginDate  = document.getElementById('login-date-display');
  const loginTz    = document.getElementById('login-tz-label');
  if (loginClock) {
    loginClock.innerHTML = H
      + '<span class="lp-clock-sep">:</span>'
      + M
      + '<span class="lp-clock-sep">:</span>'
      + S;
  }
  if (loginDate)  loginDate.innerText  = dateStr;
  if (loginTz)    loginTz.innerText    = tzLabel;

  const navTime = document.getElementById('current-time-display');
  const navDate = document.getElementById('current-date-display');
  const navTz   = document.getElementById('current-tz-label');
  if (navTime) navTime.innerText = timeStr;
  if (navDate) navDate.innerText = dateStr;
  if (navTz)   navTz.innerText   = (tzLabel.split(' ')[0] || tzLabel);
}

function _getTimezoneLabel(tz) {
  const tzMap = {
    'Asia/Jakarta':       'WIB (UTC+7)',
    'Asia/Pontianak':     'WIB (UTC+7)',
    'Asia/Makassar':      'WITA (UTC+8)',
    'Asia/Ujung_Pandang': 'WITA (UTC+8)',
    'Asia/Jayapura':      'WIT (UTC+9)',
  };
  return tzMap[tz] || tz;
}

// ─────────────────────────────────────────────────────────────────────────────
// #4: Sumber kebenaran peran login — SATU getter, tanpa hidden checkbox
//
// Sebelumnya peran disimpan di hidden <input id="isAdmin"> yang disinkronkan
// manual ke tombol tab. Kini state otoritatif adalah class "active" pada
// tombol tab itu sendiri. _lpIsAdminMode() membaca DOM sekali, konsisten
// di mana pun dipanggil. togglePinInput() dipertahankan sebagai alias agar
// kode lama yang masih memanggilnya tidak perlu diubah semua sekaligus.

/* ─── Dashboard Bell & CmdK (L20260-20545) ─── */
function _dashBellItems() {
  const items = [];
  const exams = Array.isArray(cachedExams) ? cachedExams : [];
  if (!exams.length) return items;

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
  exams.forEach(e => {
    if (!e.startDate) return;
    let d;
    try { d = new Date(e.startDate); } catch (err) { return; }
    if (isNaN(d.getTime())) return;
    const dStr = d.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
    const isToday = (dStr === todayStr);
    const isActive = String(e.status || '').toLowerCase() === 'aktif';
    if (isToday) {
      items.push({
        type: 'today',
        icon: 'fa-calendar-day',
        color: isActive ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50',
        title: `Ujian Hari Ini: ${e.subject}`,
        desc: `${e.class} · ${e.dateStr || ''} · ${isActive ? 'Aktif' : 'Belum aktif'}`,
        examId: e.id
      });
    }
  });
  // No-soal warnings: only when admin
  if (currentUser && currentUser.role === 'Admin') {
    const noSoal = exams.filter(e => isFinite(parseInt(e.questionCount)) && parseInt(e.questionCount) === 0);
    if (noSoal.length > 0 && noSoal.length <= 5) {
      noSoal.forEach(e => {
        items.push({
          type: 'no-soal',
          icon: 'fa-circle-exclamation',
          color: 'text-red-600 bg-red-50',
          title: `Belum ada soal: ${e.subject}`,
          desc: `${e.class} — segera tambahkan soal`,
          examId: e.id
        });
      });
    }
  }
  return items;
}

function updateDashBellBadge() {
  const items = _dashBellItems();
  const badge = document.getElementById('dash-bell-badge');
  const sub   = document.getElementById('dash-bell-sub');
  if (badge) {
    if (items.length > 0) {
      badge.textContent = items.length > 9 ? '9+' : String(items.length);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
  if (sub) sub.textContent = items.length > 0 ? `${items.length} item perlu perhatian` : 'Tidak ada notifikasi baru';
}

function refreshDashBell() {
  const list = document.getElementById('dash-bell-list');
  if (list) list.innerHTML = '<div class="dash-bell-empty"><i class="fas fa-circle-notch fa-spin mr-1"></i> Menyegarkan...</div>';
  if (!currentUser) { _renderDashBellList(); return; }
  google.script.run
    .withSuccessHandler(function(exams) {
      cachedExams = Array.isArray(exams) ? exams : [];
      _renderDashBellList();
      updateDashBellBadge();
    })
    .withFailureHandler(function() {
      if (list) list.innerHTML = '<div class="dash-bell-empty">Gagal memuat. Coba lagi.</div>';
    })
    .getExamList(currentUser.userID, currentUser.token);
}

function _renderDashBellList() {
  const list = document.getElementById('dash-bell-list');
  if (!list) return;
  const items = _dashBellItems();
  if (!items.length) {
    list.innerHTML = `
      <div class="dash-bell-empty">
        <i class="fas fa-check-circle text-emerald-400 text-2xl mb-2 block"></i>
        Tidak ada notifikasi.
      </div>`;
    return;
  }
  list.innerHTML = items.map(it => `
    <div class="dash-bell-item" onclick="showAdminTab('dash-exams'); closeDashBell();">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center ${it.color} flex-shrink-0 text-sm">
        <i class="fas ${it.icon}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-bold text-slate-700 truncate">${it.title}</div>
        <div class="text-[11px] text-slate-500 truncate">${it.desc}</div>
      </div>
    </div>
  `).join('');
}

function toggleDashBell(e) {
  if (e) { e.stopPropagation(); }
  const dd  = document.getElementById('dash-bell-dropdown');
  const btn = document.getElementById('dash-bell-btn');
  if (!dd) return;
  const showing = dd.classList.toggle('show');
  if (btn) btn.setAttribute('aria-expanded', showing);
  _syncBellActiveState();
  if (showing) _renderDashBellList();
}
function closeDashBell() {
  const dd  = document.getElementById('dash-bell-dropdown');
  const btn = document.getElementById('dash-bell-btn');
  if (dd)  dd.classList.remove('show');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  _syncBellActiveState();
}

// Click outside to close bell
document.addEventListener('click', function(e) {
  const wrap = e.target.closest('.dash-bell-wrap');
  if (!wrap) closeDashBell();
});

// ───── Command Palette (Ctrl+K) ─────
// Setiap item bisa punya properti:
//   tab        – navigasi ke tab Admin/Guru
//   svTab      – navigasi ke tab Pengawas (showSvTab)
//   action     – nama fungsi global yang dipanggil
//   adminOnly  – hanya tampil untuk role Admin
//   guruOnly   – hanya tampil untuk role Guru
//   roles      – array role yang boleh melihat item ini (override semua filter lain)
const _DASH_CMDK_ITEMS = [
  // ── Menu yang tersedia untuk Admin & Guru ──
  { label: 'Dashboard',          icon: 'fa-house-chimney',    tab: 'dash-home',         keys: ['dashboard','home','beranda'] },
  { label: 'Jadwal Ujian',       icon: 'fa-calendar-check',   tab: 'dash-exams',        keys: ['ujian','jadwal','exam'] },
  { label: 'Bank Soal',          icon: 'fa-layer-group',      tab: 'dash-questions',    keys: ['soal','question','bank'] },
  { label: 'Progress Soal',      icon: 'fa-chart-pie',        tab: 'dash-progress-soal',keys: ['progress','progres'] },
  { label: 'Progres Koreksi Esai', icon: 'fa-pen-to-square',  tab: 'dash-essay-grading',keys: ['koreksi','esai','essay','grading','penilaian'], adminOnly: true },
  { label: 'Hasil & Nilai',      icon: 'fa-chart-column',     tab: 'dash-results',      keys: ['hasil','nilai','result','grade'] },
  { label: 'Manajemen Pengguna', icon: 'fa-users',            tab: 'dash-users',        keys: ['user','pengguna','siswa','guru','admin'] },
  { label: 'Kartu Ujian Siswa',  icon: 'fa-id-card',          tab: 'dash-kartu-siswa',  keys: ['kartu','card','peserta'],        adminOnly: true },
  { label: 'Folder Gambar',      icon: 'fa-images',           tab: 'dash-images',       keys: ['gambar','image','folder'] },
  { label: 'Folder Audio',       icon: 'fa-music',            tab: 'dash-audio',        keys: ['audio','suara','folder'] },
  { label: 'Konfigurasi Sistem', icon: 'fa-sliders',          tab: 'dash-config',       keys: ['config','konfigurasi','setting'],  adminOnly: true },
  { label: 'Data Master',        icon: 'fa-database',         tab: 'dash-master-data',  keys: ['master','data','kelas','mapel'],   adminOnly: true },
  { label: 'Analisis Butir Soal',icon: 'fa-flask',            tab: 'dash-item-analysis',keys: ['analisis','butir','item analysis'] },
  { label: 'Log Aktivitas',      icon: 'fa-scroll',           tab: 'dash-admin-logs',   keys: ['log','aktivitas','audit'] },
  { label: 'Manajemen Pengawas', icon: 'fa-user-shield',      tab: 'dash-supervisors',  keys: ['pengawas','supervisor','ruang','sesi'], adminOnly: true },
  // ── Menu khusus Pengawas ──
  { label: 'Dashboard',          icon: 'fa-house-chimney',    svTab: 'dash-home',       keys: ['dashboard','home','beranda'],      roles: ['Pengawas'] },
  { label: 'Monitor Ujian Saya', icon: 'fa-satellite-dish',   svTab: 'dash-sv-monitor', keys: ['monitor','ujian','live','pantau'], roles: ['Pengawas'] },
  // ── Actions ──
  { label: 'Buat Jadwal Ujian Baru',  icon: 'fa-plus',                      action: 'openExamModal',     keys: ['buat ujian','tambah ujian','new exam'], adminOnly: true },
  { label: 'Refresh Dashboard',       icon: 'fa-rotate',                    action: 'refreshDashboard',  keys: ['refresh','reload','muat ulang'] },
  { label: 'Keluar / Logout',         icon: 'fa-arrow-right-from-bracket',  action: 'logout',            keys: ['logout','keluar','sign out'] },
];

let _dashCmdKActive = 0;

function _dashCmdKVisible() {
  const q    = (document.getElementById('dash-cmdk-input') || {}).value || '';
  const role = (currentUser && currentUser.role) || 'Admin';
  // Tab yang tidak boleh diakses Guru
  const restrictedForGuru = ['dash-config','dash-master-data','dash-kartu-siswa','dash-supervisors'];
  const search = q.toLowerCase().trim();

  return _DASH_CMDK_ITEMS.filter(it => {
    // Item dengan roles[] hanya muncul untuk role yang ada di dalam array itu
    if (it.roles && it.roles.length) {
      if (!it.roles.includes(role)) return false;
    } else {
      // Item tanpa roles[] tidak muncul untuk Pengawas
      // (Pengawas hanya pakai item yang punya roles:['Pengawas'])
      if (role === 'Pengawas') return false;
      // adminOnly: hanya Admin
      if (it.adminOnly && role !== 'Admin') return false;
      // guruOnly: hanya Guru
      if (it.guruOnly && role !== 'Guru') return false;
      // Tab yang restricted untuk Guru
      if (it.tab && role === 'Guru' && restrictedForGuru.includes(it.tab)) return false;
    }
    // Filter pencarian
    if (!search) return true;
    if (it.label.toLowerCase().includes(search)) return true;
    return (it.keys || []).some(k => k.includes(search) || search.includes(k));
  });
}

function renderDashCmdK() {
  const list = document.getElementById('dash-cmdk-list');
  if (!list) return;
  const visible = _dashCmdKVisible();
  _dashCmdKActive = 0;
  if (!visible.length) {
    list.innerHTML = '<div class="dash-cmdk-empty">Tidak ada hasil.</div>';
    return;
  }
  list.innerHTML = visible.map((it, idx) => `
    <div class="dash-cmdk-item ${idx === 0 ? 'active' : ''}" data-idx="${idx}" onmouseover="_dashCmdKHover(${idx})" onclick="_dashCmdKExec(${idx})">
      <i class="fas ${it.icon}"></i>
      <span>${it.label}</span>
    </div>
  `).join('');
}
function _dashCmdKHover(idx) {
  _dashCmdKActive = idx;
  document.querySelectorAll('#dash-cmdk-list .dash-cmdk-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
}
function _dashCmdKExec(idx) {
  const visible = _dashCmdKVisible();
  const it = visible[idx];
  if (!it) return;
  closeDashCmdK();
  if (it.svTab) {
    // Navigasi untuk role Pengawas — pakai showSvTab
    if (typeof showSvTab === 'function') showSvTab(it.svTab);
  } else if (it.tab) {
    showAdminTab(it.tab);
  } else if (it.action && typeof window[it.action] === 'function') {
    window[it.action]();
  }
}
function handleDashCmdKKey(e) {
  const visible = _dashCmdKVisible();
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    e.stopPropagation();
    _dashCmdKHover(Math.min(_dashCmdKActive + 1, visible.length - 1));
    _dashCmdKScrollIntoView();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    e.stopPropagation();
    _dashCmdKHover(Math.max(_dashCmdKActive - 1, 0));
    _dashCmdKScrollIntoView();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    e.stopPropagation();
    _dashCmdKExec(_dashCmdKActive);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    closeDashCmdK();
  }
}
function _dashCmdKScrollIntoView() {
  const el = document.querySelector('#dash-cmdk-list .dash-cmdk-item.active');
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
}
function openDashCmdK() {
  const palette = document.getElementById('dash-cmdk');
  const input   = document.getElementById('dash-cmdk-input');
  if (!palette) return;
  // Force-clear any inline display:none (e.g. residual from switchPage())
  palette.style.display = '';
  palette.classList.add('show');
  if (input) {
    input.value = '';
    setTimeout(() => { try { input.focus({ preventScroll: true }); } catch(e){ try { input.focus(); } catch(e2){} } }, 30);
  }
  renderDashCmdK();
}
function closeDashCmdK() {
  const palette = document.getElementById('dash-cmdk');
  if (!palette) return;
  palette.classList.remove('show');
  // Keep inline display empty so CSS class controls visibility next time.
  palette.style.display = '';
}

// Global Ctrl+K binding (only when admin page visible).
// Uses capture phase + getComputedStyle so it reliably opens even from inputs.
document.addEventListener('keydown', function(e) {
  const isCtrlK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
  if (!isCtrlK) return;
  const adminPage = document.getElementById('page-admin');
  if (!adminPage) return;
  const cs = window.getComputedStyle(adminPage);
  const visible = cs.display !== 'none' && !adminPage.classList.contains('hidden');
  if (!visible) return;
  e.preventDefault();
  e.stopPropagation();
  const palette = document.getElementById('dash-cmdk');
  if (palette && palette.classList.contains('show')) closeDashCmdK();
  else openDashCmdK();
});
