/**
 * app.js — Application Bootstrap & Router
 * SIPADU CBT v5.1.0
 *
 * Fungsi:
 * - initAdminPanel()    : inisialisasi panel admin setelah login
 * - showAdminTab()      : router utama untuk tab admin
 * - switchPage()        : beralih antara page-login/page-admin/page-exam/page-result
 * - checkSavedSession() : cek sesi tersimpan saat startup
 * - DOMContentLoaded    : entry point utama
 * Sumber: index.html L16514-16832, L28864-29061, L38182-38201
 */

/* ─── initAdminPanel + showGuruWelcomeModal (L16514-16688) ─── */
function initAdminPanel() {
  switchPage('page-admin');

  // BUG #2 FIX: null-check sebelum akses elemen DOM
  const nameEl = document.getElementById('admin-sidebar-name');
  if (nameEl) nameEl.innerText = currentUser.username || '';

  const avatarEl = document.getElementById('sidebar-avatar');
  if (avatarEl) avatarEl.textContent = (currentUser.username || 'U').charAt(0).toUpperCase();
  const roleEl = document.getElementById('sidebar-role-badge');
  if (roleEl) roleEl.textContent = currentUser.role || 'Pengguna';
  setDateDisplay();
  fetchAndStartClock();

  // BUG #14 FIX: cek localStorage DULU, baru fallback ke auto-collapse untuk tablet
  try {
    const savedCollapsed = localStorage.getItem('sipadu_sidebar_collapsed');
    const sb = document.getElementById('admin-sidebar');
    if (sb && window.innerWidth >= 768) {
      if (savedCollapsed !== null) {
        // Prioritaskan preferensi user yang tersimpan
        sb.classList.toggle('collapsed', savedCollapsed === '1');
      } else if (window.innerWidth < 1024) {
        // Fallback: auto-collapse hanya jika belum ada preferensi & layar tablet
        sb.classList.add('collapsed');
      }
    }
  } catch (e) { /* localStorage tidak tersedia */ }
  _updateCollapseIcon();
  _initSidebarRipple();
  const adminOnlyMenus = ['menu-config', 'menu-master-data', 'menu-kartu-siswa', 'menu-supervisors', 'menu-exam-rooms'];
  const guruOnlyMenus  = [];
 
  if (currentUser && currentUser.role === 'Guru') {
    adminOnlyMenus.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
    guruOnlyMenus.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    });
    const elLogText = document.getElementById('menu-admin-logs-text');
    if (elLogText) elLogText.textContent = 'Log Aktivitas';
    const elUsers = document.getElementById('menu-users');
    if (elUsers) elUsers.classList.remove('hidden');
 
  } else {
    adminOnlyMenus.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('hidden');
    });
 
    guruOnlyMenus.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
 
    const elUsers = document.getElementById('menu-users');
    if (elUsers) elUsers.classList.remove('hidden');
  }
  initExamModalComponent();
  google.script.run
    .withSuccessHandler(exams => {
      cachedExams = Array.isArray(exams) ? exams : [];

      const VALID_TABS = ['dash-home','dash-exams','dash-questions','dash-progress-soal',
                          'dash-essay-grading','dash-results','dash-users','dash-images','dash-audio','dash-config',
                          'dash-master-data','dash-item-analysis','dash-admin-logs','dash-kartu-siswa',
                          'dash-supervisors','dash-exam-rooms'];
      const lastTabKey  = 'sipadu_last_tab_' + currentUser.userID;
      const savedTab    = localStorage.getItem(lastTabKey);
      const targetTab   = (savedTab && VALID_TABS.includes(savedTab)) ? savedTab : 'dash-home';
      showAdminTab(targetTab);
      updateDashBellBadge();

      if (currentUser && currentUser.role === 'Guru') {
        showGuruWelcomeModal();
      }
    })
    .withFailureHandler(err => {
      const content = document.getElementById('admin-content');
      if (content) {
        content.innerHTML = `
          <div class="flex items-center justify-center min-h-[60vh]">
            <div class="dash-error-state max-w-md w-full">
              <div class="ico"><i class="fas fa-triangle-exclamation"></i></div>
              <h3 class="font-bold text-base text-red-700 mb-1">Gagal Memuat Dashboard</h3>
              <p class="text-xs text-red-600 mb-4">${(err && err.message) ? err.message : 'Periksa koneksi Anda lalu coba lagi.'}</p>
              <button onclick="initAdminPanel()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
                <i class="fas fa-rotate-right"></i> Coba Lagi
              </button>
            </div>
          </div>`;
      }
    })
    .getExamList(currentUser.userID, currentUser.token);
}

function showGuruWelcomeModal() {
  if (!currentUser || currentUser.role !== 'Guru') return;
  if (window._guruEmailUnverified) return;

  google.script.run
    .withSuccessHandler(function(res) {
      let scheduleHtml = '';
      if (res && res.success && String(res.enabled) === 'true') {
         scheduleHtml = `
            <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:10px; padding:12px; margin-bottom:16px; text-align:left;">
              <div style="font-weight:700; font-size:13px; color:#92400e; margin-bottom:6px;"><i class="fas fa-calendar-alt mr-2"></i>Jadwal Input Soal</div>
              <table style="width:100%; font-size:12px; color:#b45309;">
                <tr><td style="width:100px; padding:2px 0;">Mulai</td><td>: <b>${res.startStr || '-'}</b></td></tr>
                <tr><td style="padding:2px 0;">Batas Akhir</td><td>: <b>${res.endStr || '-'}</b></td></tr>
              </table>
              <div style="font-size:11px; margin-top:6px; color:#d97706;"><i class="fas fa-info-circle mr-1"></i>Anda hanya dapat menambah/mengedit soal dalam periode ini.</div>
            </div>
         `;
      } else {
         scheduleHtml = `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:12px; margin-bottom:16px; text-align:left;">
              <div style="font-weight:700; font-size:13px; color:#166534; margin-bottom:4px;"><i class="fas fa-calendar-check mr-2"></i>Jadwal Bebas</div>
              <div style="font-size:11px; color:#15803d;">Admin belum menetapkan batasan jadwal. Anda dapat melakukan input/edit soal kapan saja.</div>
            </div>
         `;
      }

      let examsHtml = '';
      const myExams = cachedExams;
      
      if (myExams.length > 0) {
        examsHtml += `<div style="text-align:left; font-weight:700; font-size:13px; color:#374151; margin-bottom:8px;"><i class="fas fa-book mr-2 text-indigo-500"></i>Daftar Ujian Anda:</div>`;
        examsHtml += `<div style="max-height:160px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px; padding:8px; background:#f8fafc;">`;
        
        myExams.forEach(e => {
          let bypassTag = e.bypassInputPeriod ? `<span style="background:#dbeafe; color:#1e40af; padding:2px 6px; border-radius:12px; font-size:9px; font-weight:bold; margin-left:6px;"><i class="fas fa-unlock text-[8px] mr-1"></i>Bypass Jadwal</span>` : '';
          examsHtml += `
            <div style="padding:6px 0; border-bottom:1px solid #e2e8f0; text-align:left; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:12px; font-weight:700; color:#1e293b;">${e.subject}</div>
                <div style="font-size:10px; color:#64748b; margin-top:2px;">Kelas: ${e.class}</div>
              </div>
              <div>${bypassTag}</div>
            </div>
          `;
        });
        examsHtml += `</div>`;
      } else {
        examsHtml += `
          <div style="text-align:center; padding:16px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px;">
            <div style="font-size:24px; margin-bottom:8px;">📭</div>
            <div style="font-size:12px; color:#64748b;">Belum ada jadwal ujian yang ditugaskan kepada Anda.</div>
          </div>
        `;
      }

      Swal.fire({
        title: `Selamat Datang, ${currentUser.username.split(' ')[0]}!`,
        html: `
          <div style="font-size:13px; color:#475569; margin-bottom:16px; line-height:1.5;">
            Berikut adalah ringkasan jadwal dan tugas ujian Anda saat ini:
          </div>
          ${scheduleHtml}
          ${examsHtml}
        `,
        confirmButtonText: '<i class="fas fa-check-circle mr-2"></i>Siap Bekerja',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'lp-swal' }
      });
    })
    .withFailureHandler(function(err) {
      console.log('Gagal memuat jadwal guru:', err);
    })
    .getClientInputPeriod();
}


/* ─── showAdminTab — main tab router (L16689-16832) ─── */
function showAdminTab(tabId, el) {
  if (currentUser && currentUser.role === 'Guru') {
    const restrictedTabs = ['dash-config', 'dash-master-data', 'dash-kartu-siswa', 'dash-supervisors', 'dash-exam-rooms'];
    if (restrictedTabs.includes(tabId)) {
      Swal.fire({
        title: '<i class="fas fa-lock text-red-500" style="margin-right:6px;"></i> Akses Terbatas',
        html: `<p style="font-size:13px;color:#475569;">Menu ini hanya tersedia untuk peran <b>Administrator</b>.</p>
               <p style="font-size:11px;color:#94a3b8;margin-top:6px;">Hubungi Admin sekolah jika Anda memerlukan akses ke menu ini.</p>`,
        icon: 'warning',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Mengerti',
        customClass: { popup: 'lp-swal' }
      });
      return;
    }
  }

  // Matikan Live Mode jika user pindah ke section admin lain agar
  // tidak ada polling yang berjalan di background tanpa panel monitor terbuka
  if (monitorLiveMode && tabId !== 'dash-users') {
    _stopMonitorLive();
    // Reset state monitor agar data lama tidak ditampilkan saat kembali
    monitorRawData   = null;
    monitorExamList  = [];
    monitorActiveExam = null;
  }

  if (currentUser && currentUser.userID) {
    localStorage.setItem('sipadu_last_tab_' + currentUser.userID, tabId);
  }

  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  const activeItem = document.querySelector(`.sidebar-item[data-tab="${tabId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  } else if (el) {

    el.classList.add('active');
  }

  // Hide config FAB when leaving config tab
  const _cfgFab = document.getElementById('cfg-fab-save');
  if (_cfgFab) {
    if (tabId === 'dash-config') _cfgFab.classList.add('show');
    else _cfgFab.classList.remove('show');
  }
 
  const content = document.getElementById('admin-content');
  const title   = document.getElementById('admin-header-title');

  // BUG #1 + #15 FIX: null-check untuk sidebar & overlay sebelum akses classList
  if (window.innerWidth < 768) {
    const _sb = document.getElementById('admin-sidebar');
    const _ov = document.getElementById('mobile-overlay');
    if (_sb) _sb.classList.add('-translate-x-full');
    if (_ov) _ov.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (!content) return;
  content.innerHTML = `
    <div class="flex flex-col items-center justify-center h-full text-slate-400 fade-in">
      <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-blue-500"></i> Memuat data...
    </div>`;

  if (tabId === 'dash-home') {
    title.innerText = 'Dashboard Overview';
    renderAdminHome(content);
 
  } else if (tabId === 'dash-exams') {
    title.innerText = 'Manajemen Jadwal Ujian';
    window._selectedExams = new Set(); // reset pilihan saat tab dibuka
    renderExamForm(content);
 
  } else if (tabId === 'dash-questions') {
    title.innerText = 'Bank Soal';
    renderQuestionBank(content);
 
  } else if (tabId === 'dash-progress-soal') {
    title.innerText = 'Progress Pembuatan Soal';
    renderQuestionProgress(content);
 
  } else if (tabId === 'dash-results') {
    title.innerText = 'Hasil & Nilai';
    renderResults(content);
 
  } else if (tabId === 'dash-users') {
    title.innerText = (currentUser && currentUser.role === 'Guru')
      ? 'Manajemen Siswa Kelas Saya'
      : 'Manajemen Pengguna';
    renderUserManagement(content);
 
  } else if (tabId === 'dash-images') {
    title.innerText = 'Generator Link Gambar';
    renderImageFolder(content);
 
  } else if (tabId === 'dash-audio') {
    title.innerText = 'Folder Audio';
    renderAudioFolder(content);
 
  } else if (tabId === 'dash-config') {
    title.innerText = 'Konfigurasi Sistem';
    renderConfigPage(content);
 
  } else if (tabId === 'dash-kartu-siswa') {
    title.innerText = 'Kartu Ujian Siswa';
    renderKartuSiswaPage(content);
 
  } else if (tabId === 'dash-master-data') {
    title.innerText = 'Data Master';
    renderMasterDataPage(content);

  } else if (tabId === 'dash-essay-grading') {
    title.innerText = 'Progres Koreksi Esai';
    renderEssayGradingProgress(content);

  } else if (tabId === 'dash-item-analysis') {
    title.innerText = 'Analisis Butir Soal';
    renderItemAnalysis(content);

  } else if (tabId === 'dash-admin-logs') {
    title.innerText = (currentUser && currentUser.role === 'Guru') ? 'Log Aktivitas' : 'Log Aktivitas Admin';
    renderAdminLogs(content);

  } else if (tabId === 'dash-supervisors') {
    title.innerText = 'Manajemen Pengawas';
    renderSupervisorManagement(content);

  } else if (tabId === 'dash-exam-rooms') {
    title.innerText = 'Ruang Ujian';
    renderExamRoomPage(content);
  }
  // BUG #13 FIX: pastikan body overflow selalu di-restore saat navigasi antar tab,
  // untuk mencegah body tetap ter-lock jika modal Ruang Ujian tidak ditutup dengan benar
  // FIX #2 (essay grading): lepas keydown handler + tutup modal eg jika masih terbuka
  if (typeof _egHandleKeyDown === 'function') {
    document.removeEventListener('keydown', _egHandleKeyDown);
  }
  var _egOv = document.getElementById('eg-modal-overlay');
  if (_egOv && _egOv.classList.contains('open')) {
    _egOv.classList.remove('open');
  }
  document.body.style.overflow = '';
}

/* ─── switchPage (L38182-38201) ─── */
function switchPage(pid) {
    document.querySelectorAll('#app > div').forEach(d => {
        // Skip overlays and floating UI (command palette, notification modal, toast container)
        // so their display isn't forced to none by page transitions.
        if (d.id && (
            d.id.includes('overlay') ||
            d.id === 'dash-cmdk' ||
            d.id === 'modal-send-notif' ||
            d.id === 'student-notif-container'
        )) return;
        d.classList.add('hidden');
        d.style.display = 'none';
    });
    const target = document.getElementById(pid);
    if (target) {
        target.classList.remove('hidden');
        target.style.display = ''; 
    }
}


/* ─── checkSavedSession (L28864-29044) ─── */
function checkSavedSession() {
    const savedSession = localStorage.getItem('sipadu_session');

    // Pre-fill remembered username
    try {
        const rememberedUser = localStorage.getItem('sipadu_remember_user');
        const userInput = document.getElementById('username');
        const rememberChk = document.getElementById('lp-remember-me');
        if (rememberedUser && userInput) {
            userInput.value = rememberedUser;
            if (rememberChk) rememberChk.checked = true;
            const passInput = document.getElementById('password');
            if (passInput) setTimeout(() => { try { passInput.focus(); } catch(e){} }, 100);
        }
    } catch (e) {}

    if (savedSession) {
        try {
            const sess = JSON.parse(savedSession);

            if (!sess.userID || !sess.token) {
                localStorage.removeItem('sipadu_session');
                return;
            }

            if ((sess.role === 'Admin' || sess.role === 'Guru' || sess.role === 'Pengawas') && sess.loginTime) {
                const lastActivity = parseInt(localStorage.getItem('sipadu_last_activity') || '0', 10) || sess.loginTime;
                const elapsed = Date.now() - lastActivity;
                if (elapsed >= ADMIN_SESSION_DURATION_MS) {
                    localStorage.removeItem('sipadu_session');
                    localStorage.removeItem('sipadu_last_activity');
                    switchPage('page-login');
                    Swal.fire({
                        icon: 'warning',
                        title: 'Sesi Berakhir',
                        html: `<p>Sesi Anda telah berakhir setelah <b>1 jam</b> tidak aktif.</p>
                              <p style="font-size:0.85em;margin-top:8px;color:#64748b;">Silakan login kembali.</p>`,
                        confirmButtonText: '<i class="fas fa-sign-in-alt" style="margin-right:6px;"></i> Login Kembali',
                        confirmButtonColor: '#2563eb',
                        customClass: { popup: 'lp-swal' }
                    });
                    return;
                }
            }

            // Show skeleton instead of bare loading
            _lpShowAutoLoginSkeleton(sess.username || 'pengguna');

            google.script.run.withSuccessHandler(res => {
                _lpHideAutoLoginSkeleton();
                document.getElementById('global-loading').classList.add('hidden');

                if (res.success) {
                    console.log("Auto-login berhasil sebagai:", res.role);

                    // FIX BUG 6: Guru yang sesi tersimpannya role='Pengawas' dan
                    // punya assignment supervisor → arahkan ke panel Pengawas.
                    // checkSession mengembalikan res.role='Guru' + res.isSupervisorEligible=true.
                    // Kita andalkan sess.role (yang disimpan saat login manual) sebagai sinyal.
                    const savedRole = sess.role || res.role;
                    const isGuestSupervisor = (res.isSupervisorEligible && savedRole === 'Pengawas');
                    if (isGuestSupervisor) {
                        res.role = 'Pengawas'; // override agar routing di bawah benar
                    }

                    currentUser = res;
                    window.currentUser = currentUser;

                    if (res.role === 'Admin' || res.role === 'Guru') {
                        handleEmailVerificationGating(res, function() {
                            startAdminSessionTimer();
                            initAdminPanel();
                        });
                    } else if (res.role === 'Pengawas') {
                        startAdminSessionTimer();
                        initSupervisorPanel();
                    } else {
                        // Students must re-enter PIN per session — explain clearly.
                        // Bug fix #4: skeleton harus disembunyikan sebelum switchPage
                        _lpHideAutoLoginSkeleton();
                        localStorage.removeItem('sipadu_session');
                        switchPage('page-login');
                        Swal.fire({
                            title: `Halo kembali, ${res.username || ''}!`,
                            html: `<p style="color:#475569;font-size:13px;">Untuk keamanan, siswa perlu memasukkan <b>PIN Sesi Ujian</b> setiap kali ingin memulai ujian.</p>`,
                            icon: 'info',
                            confirmButtonText: 'Mengerti',
                            confirmButtonColor: '#4f46e5',
                            customClass: { popup: 'lp-swal' }
                        });
                        // Pre-fill username for convenience
                        const userInput = document.getElementById('username');
                        if (userInput && res.userID) userInput.value = res.userID;
                    }

                } else {
                    // Bug fix #4: skeleton harus disembunyikan sebelum switchPage
                    _lpHideAutoLoginSkeleton();
                    localStorage.removeItem('sipadu_session');
                    switchPage('page-login');
                }
            }).withFailureHandler(err => {
                console.error("Gagal cek sesi:", err);
                _lpHideAutoLoginSkeleton();
                document.getElementById('global-loading').classList.add('hidden');
                switchPage('page-login');
            }).checkSession(sess.userID, sess.token);

        } catch (e) {
            console.error("Error parsing session:", e);
            localStorage.removeItem('sipadu_session');
            _lpHideAutoLoginSkeleton();
            switchPage('page-login');
        }
    }
}

// ───── Auto-login skeleton — #11: tampilan lebih informatif ─────
function _lpShowAutoLoginSkeleton(name) {
    if (document.getElementById('lp-skel-overlay')) return;

    // Ambil nama terbaik: prioritaskan parameter `name`, fallback ke sipadu_remember_user
    var displayName = (name && name !== 'pengguna') ? name : '';
    if (!displayName) {
        try {
            var remembered = localStorage.getItem('sipadu_remember_user');
            if (remembered) displayName = remembered;
        } catch(e) {}
    }
    if (!displayName) displayName = 'pengguna';

    // Buat inisial dari display name: ambil huruf pertama dari tiap kata, maks 2 huruf
    var initials = displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(function(w) { return w.charAt(0).toUpperCase(); })
        .join('');
    if (!initials) initials = '?';

    // Escape HTML agar nama tidak bisa inject markup
    function _esc(str) {
        return String(str)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;');
    }

    var overlay = document.createElement('div');
    overlay.id        = 'lp-skel-overlay';
    overlay.className = 'lp-skel';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-label', 'Memulihkan sesi ' + _esc(displayName));
    overlay.innerHTML =
        '<div class="lp-skel-card">' +
            '<div class="lp-skel-avatar" aria-hidden="true">' + _esc(initials) + '</div>' +
            '<div class="lp-skel-name">' + _esc(displayName) + '</div>' +
            '<div class="lp-skel-text">Memulihkan sesi Anda\u2026</div>' +
            '<div class="lp-skel-bar-wrap"><div class="lp-skel-bar"></div></div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:4px;">' +
                '<div class="lp-skel-spinner" aria-hidden="true"></div>' +
                '<span class="lp-skel-sub">Mohon tunggu sebentar</span>' +
            '</div>' +
        '</div>';

    document.body.appendChild(overlay);
    var loginPage = document.getElementById('page-login');
    if (loginPage) {
        loginPage.classList.add('hidden');
        loginPage.style.display = 'none';
    }
}
function _lpHideAutoLoginSkeleton() {
    const overlay = document.getElementById('lp-skel-overlay');
    if (overlay) {
        overlay.style.transition = 'opacity .3s ease';
        overlay.style.opacity = '0';
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 320);
    }
}


/* ─── DOMContentLoaded bootstrap (L29046-29061) ─── */
document.addEventListener('DOMContentLoaded', function() {
    const examPageEl = document.getElementById('page-exam');
    if (examPageEl) {
        initialExamHTML = examPageEl.innerHTML;
    }
    fetchAndStartClock();
    checkSavedSession();
    _lpInitLoginUX();

    // Cleanup Live Mode saat browser refresh / tab ditutup
    window.addEventListener('beforeunload', function() {
      if (typeof _stopMonitorLive === 'function' && monitorLiveMode) {
        _stopMonitorLive();
      }
    });
});
