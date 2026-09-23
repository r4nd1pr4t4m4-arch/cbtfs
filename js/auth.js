/**
 * auth.js — Authentication & Session Management
 * SIPADU CBT v5.1.0
 *
 * Fungsi:
 * - Login mode detection (_lpGetLoginMode, _lpIsAdminMode, _lpIsPengawasMode)
 * - Login form UX (togglePinInput, lpOpenForm, lpCloseForm, lpSetRole)
 * - Focus trap & swipe gesture
 * - handleLogin, _doSubmitLogin, _lpResetSubmitButton, _lpShowError
 * - Email verification gating
 * - Session timer (startAdminSessionTimer, forceLogoutSession)
 * - logout, executeLogout
 * Sumber: index.html L15487-16513
 */

function _lpGetLoginMode() {
  if ((document.getElementById('lp-role-pengawas') || {}).classList.contains('active')) return 'pengawas';
  if ((document.getElementById('lp-role-admin')    || {}).classList.contains('active')) return 'admin';
  return 'siswa';
}

/** Alias lama — true jika tab Admin/Guru aktif. */
function _lpIsAdminMode() {
  return _lpGetLoginMode() === 'admin';
}

/** true jika tab Pengawas aktif. */
function _lpIsPengawasMode() {
  return _lpGetLoginMode() === 'pengawas';
}

/**
 * Terapkan perubahan UI yang bergantung pada role saat ini:
 * tampilkan/sembunyikan PIN container, ubah placeholder & hint.
 * FIX BUG 7: terima parameter `mode` eksplisit dari lpSetRole() agar tidak
 * bergantung pada re-baca DOM (meski sinkron, lebih aman dan lebih jelas).
 * Jika dipanggil tanpa argumen (mis. togglePinInput()), fallback ke _lpGetLoginMode().
 */
function _lpApplyRoleUI(mode) {
  if (!mode) mode = _lpGetLoginMode();
  var pinContainer = document.getElementById('pin-container');
  var pinInput     = document.getElementById('pin');
  var userInput    = document.getElementById('username');
  var formHint     = document.getElementById('lp-form-hint');

  // Sembunyikan PIN untuk Admin dan Pengawas
  if (mode === 'admin' || mode === 'pengawas') {
    if (pinContainer) pinContainer.style.display = 'none';
    if (pinInput) {
      pinInput.removeAttribute('required');
      pinInput.value = '';
      // Bersihkan state error PIN saat disembunyikan
      pinInput.classList.remove('is-invalid');
    }
    if (mode === 'admin') {
      if (userInput) userInput.placeholder = 'Username Admin / Guru';
      if (formHint)  formHint.textContent  = 'Login khusus untuk pengelola sistem';
    } else {
      if (userInput) userInput.placeholder = 'Username Guru / Pengawas';
      if (formHint)  formHint.textContent  = 'Login sebagai Pengawas Ujian';
    }
  } else {
    // Siswa: tampilkan PIN
    if (pinContainer) pinContainer.style.display = 'block';
    if (pinInput) pinInput.setAttribute('required', 'true');
    if (userInput) userInput.placeholder = 'Contoh: SIS-001';
    if (formHint)  formHint.textContent  = 'Pilih peran lalu masukkan kredensial Anda';
  }
}

/** Alias backward-compatible — kode lama yang memanggil togglePinInput() tetap bekerja. */
function togglePinInput() { _lpApplyRoleUI(); }

function lpOpenForm() {
  const right    = document.getElementById('lp-right');
  const sheet    = right ? right.querySelector('.lp-mobile-sheet') : null;
  const cta      = document.getElementById('lp-mobile-cta');
  const backdrop = document.getElementById('lp-backdrop');
  const leftPanel = document.getElementById('page-login') ? document.getElementById('page-login').querySelector('.lp-left') : null;
  if (right) {
    right.classList.add('mobile-open');
    // Bug fix #7: tandai dialog sebagai visible untuk screen reader
    right.setAttribute('aria-hidden', 'false');
  }
  // Bug fix #7: sembunyikan panel kiri dari screen reader saat sheet terbuka
  if (leftPanel) leftPanel.setAttribute('aria-hidden', 'true');
  if (sheet) {
    // Bug fix #5: reset scroll ke atas setiap kali sheet dibuka agar
    // user tidak melihat posisi scroll terakhir (misal setelah error)
    sheet.scrollTop = 0;
    // Re-trigger animasi setiap kali dibuka
    sheet.style.animation = 'none';
    void sheet.offsetWidth;
    sheet.style.animation = 'sheetUp .35s cubic-bezier(.32,1.25,.4,1) forwards';
    // Pasang ulang listener swipe-to-dismiss setiap kali sheet dibuka
    _lpInitSwipe();
  }
  if (cta)      cta.style.display = 'none';
  if (backdrop) {
    backdrop.classList.add('show');
    // Bug fix #7: saat sheet terbuka, backdrop bukan lagi aria-hidden
    backdrop.removeAttribute('aria-hidden');
    backdrop.setAttribute('aria-modal', 'true');
  }
  document.body.style.overflow = 'hidden';
  // #10: aktifkan focus trap agar Tab tidak keluar dari sheet
  _lpStartFocusTrap();
  setTimeout(function() {
    var u = document.getElementById('username');
    if (u && !u.value) u.focus();
  }, 380);
}
function lpCloseForm() {
  const right    = document.getElementById('lp-right');
  const sheet    = right ? right.querySelector('.lp-mobile-sheet') : null;
  const cta      = document.getElementById('lp-mobile-cta');
  const backdrop = document.getElementById('lp-backdrop');
  const leftPanel = document.getElementById('page-login') ? document.getElementById('page-login').querySelector('.lp-left') : null;
  if (backdrop) {
    backdrop.classList.remove('show');
    // Bersihkan inline opacity yang mungkin tersisa dari gesture swipe
    backdrop.style.opacity = '';
    // Bug fix #7: kembalikan aria-hidden saat sheet ditutup
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.removeAttribute('aria-modal');
  }
  // #10: lepas focus trap dan kembalikan fokus ke tombol CTA
  // Bug fix #7: tunda _lpStopFocusTrap sampai SETELAH animasi close selesai (320ms)
  // agar user tidak bisa Tab keluar ke elemen di luar sheet selama animasi
  setTimeout(function() { _lpStopFocusTrap(); }, 330);
  var ctaBtn = document.querySelector('.lp-mobile-cta-btn');
  if (ctaBtn) setTimeout(function() { try { ctaBtn.focus(); } catch(e){} }, 340);
  // Bug fix #7: panel kiri kembali accessible saat sheet ditutup
  if (leftPanel) leftPanel.removeAttribute('aria-hidden');
  if (sheet) {
    // Bug fix #8: durasi setTimeout harus >= durasi animasi sheetDown (300ms)
    // Sebelumnya 280ms < 300ms → sheet "jump" ke posisi awal sebelum animasi selesai
    // Bersihkan sisa transform dari gesture swipe sebelum animasi berjalan
    sheet.style.transform  = '';
    sheet.style.transition = '';
    sheet.style.animation = 'sheetDown .3s cubic-bezier(.4,0,.2,1) forwards';
    setTimeout(function() {
      if (right) {
        right.classList.remove('mobile-open');
        // Bug fix #7: sembunyikan dari screen reader saat sheet tertutup
        right.setAttribute('aria-hidden', 'true');
      }
      if (sheet) sheet.style.animation = '';
      if (cta)   cta.style.display = '';
      document.body.style.overflow = '';
    }, 320); // 320ms > 300ms animasi — buffer agar animasi selesai sempurna
  } else {
    if (right) {
      right.classList.remove('mobile-open');
      right.setAttribute('aria-hidden', 'true');
    }
    if (cta)   cta.style.display = '';
    document.body.style.overflow = '';
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// SWIPE-TO-DISMISS — Bottom Sheet Login (Mobile)
//
// Cara kerja:
//   1. touchstart  → catat posisi Y awal & tandai "sedang dragging"
//   2. touchmove   → hitung delta Y, terapkan transform ke sheet secara real-time.
//                    Hanya izinkan drag ke BAWAH (deltaY > 0).
//                    Jika sheet masih bisa di-scroll (scrollTop > 0), tahan gesture
//                    hingga sudah di posisi paling atas agar scroll tidak terganggu.
//   3. touchend    → jika sudah melewati threshold (80px atau velocity cukup),
//                    panggil lpCloseForm(). Jika belum, snap sheet kembali ke posisi awal.
//
// Listener dipasang ulang setiap lpOpenForm() dipanggil (via _lpInitSwipe)
// agar selalu mengacu pada elemen yang benar. Listener lama dihapus dulu
// melalui AbortController agar tidak menumpuk.
// ─────────────────────────────────────────────────────────────────────────────
var _lpSwipeAbortCtrl  = null; // AbortController aktif untuk listener swipe

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS TRAP — #10
//
// Saat bottom sheet terbuka di mobile, Tab/Shift+Tab harus terjebak di dalam
// elemen-elemen focusable yang ada di dalam sheet, tidak boleh keluar ke panel
// kiri di belakang backdrop. Implementasi ini:
//   - Mengumpulkan semua elemen focusable di dalam #lp-right saat sheet dibuka
//   - Menangkap Tab/Shift+Tab dan memutar fokus di dalam daftar tersebut
//   - Melepas listener saat sheet ditutup via AbortController
// ─────────────────────────────────────────────────────────────────────────────
var _lpTrapAbortCtrl = null; // AbortController untuk focus trap listener

function _lpStartFocusTrap() {
  // Lepas trap sebelumnya jika masih aktif
  if (_lpTrapAbortCtrl) {
    try { _lpTrapAbortCtrl.abort(); } catch(e) {}
    _lpTrapAbortCtrl = null;
  }

  // Hanya aktifkan di mobile (sheet tampil sebagai bottom sheet)
  if (window.matchMedia('(min-width: 769px)').matches) return;

  var ctrl   = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  var signal = ctrl ? ctrl.signal : undefined;
  _lpTrapAbortCtrl = ctrl;

  // Selector semua elemen yang bisa menerima fokus keyboard
  var FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;

    // Hanya aktif saat sheet benar-benar terbuka
    var right = document.getElementById('lp-right');
    if (!right || !right.classList.contains('mobile-open')) return;

    // Kumpulkan elemen focusable yang visible di dalam sheet
    var focusables = Array.from(right.querySelectorAll(FOCUSABLE)).filter(function(el) {
      // Bug fix #6: offsetParent gagal mendeteksi elemen visibility:hidden.
      // Gunakan getClientRects().length > 0 yang lebih akurat untuk semua kasus.
      return !el.closest('[aria-hidden="true"]') &&
             el.getClientRects().length > 0;
    });

    if (!focusables.length) return;

    var first = focusables[0];
    var last  = focusables[focusables.length - 1];
    var active = document.activeElement;

    if (e.shiftKey) {
      // Shift+Tab dari elemen pertama → loncat ke elemen terakhir
      if (active === first || !right.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab dari elemen terakhir → loncat ke elemen pertama
      if (active === last || !right.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  }, { signal: signal });
}

function _lpStopFocusTrap() {
  if (_lpTrapAbortCtrl) {
    try { _lpTrapAbortCtrl.abort(); } catch(e) {}
    _lpTrapAbortCtrl = null;
  }
}

function _lpInitSwipe() {
  // Cabut listener swipe sebelumnya (jika ada) sebelum pasang yang baru
  if (_lpSwipeAbortCtrl) {
    try { _lpSwipeAbortCtrl.abort(); } catch(e) {}
  }
  _lpSwipeAbortCtrl = null;

  const sheet = document.getElementById('lp-mobile-sheet');
  if (!sheet) return;

  // Hanya aktifkan di layar yang memang mobile (sheet visible sebagai bottom sheet)
  // Cek via media query agar tidak jalan di desktop
  if (window.matchMedia('(min-width: 769px)').matches) return;

  // AbortController untuk cleanup listener yang terdaftar di sini
  var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  var signal = ctrl ? ctrl.signal : undefined;
  _lpSwipeAbortCtrl = ctrl;

  // ── State per-gesture ──
  var _touchStartY   = 0;   // posisi Y sentuhan pertama
  var _touchStartScrollTop = 0; // scrollTop sheet saat touch dimulai
  var _isDragging    = false;
  var _lastY         = 0;   // posisi Y terakhir (untuk kalkulasi velocity)
  var _lastTime      = 0;   // timestamp terakhir (untuk kalkulasi velocity)
  var _currentDeltaY = 0;   // offset transform saat ini

  // ── Konstanta ──
  var DISMISS_THRESHOLD_PX = 80;    // min drag ke bawah untuk dismiss
  var DISMISS_VELOCITY     = 0.4;   // px/ms — swipe cepat langsung dismiss meski < threshold
  var SNAP_TRANSITION      = 'transform .3s cubic-bezier(.32,1.25,.4,1)';

  function _applyTransform(y) {
    // Clamp: tidak boleh drag ke atas (negatif), batasi bawah di 80% tinggi sheet
    var clamped = Math.max(0, Math.min(y, sheet.offsetHeight * 0.8));
    sheet.style.transform = 'translateY(' + clamped + 'px)';
    _currentDeltaY = clamped;
    // Redupkan backdrop seiring drag turun
    var backdrop = document.getElementById('lp-backdrop');
    if (backdrop) {
      var progress = Math.min(1, clamped / DISMISS_THRESHOLD_PX);
      backdrop.style.opacity = String(1 - progress * 0.6);
    }
  }

  function _resetTransform(animate) {
    if (animate) {
      sheet.style.transition = SNAP_TRANSITION;
    }
    sheet.style.transform = 'translateY(0)';
    var backdrop = document.getElementById('lp-backdrop');
    if (backdrop) backdrop.style.opacity = '';
    if (animate) {
      // Hapus transition setelah selesai agar tidak mengganggu animasi sheetUp/Down
      var once = function() {
        sheet.style.transition = '';
        sheet.removeEventListener('transitionend', once);
      };
      sheet.addEventListener('transitionend', once);
    } else {
      sheet.style.transition = '';
    }
  }

  sheet.addEventListener('touchstart', function(e) {
    // Abaikan jika lebih dari 1 jari (pinch zoom, dsb)
    if (e.touches.length !== 1) return;

    _touchStartY         = e.touches[0].clientY;
    _touchStartScrollTop = sheet.scrollTop;
    _lastY               = _touchStartY;
    _lastTime            = e.timeStamp;
    _isDragging          = false;
    _currentDeltaY       = 0;

    // Pastikan tidak ada transition tersisa dari snap sebelumnya
    sheet.style.transition = '';
  }, { passive: true, signal: signal });

  sheet.addEventListener('touchmove', function(e) {
    if (e.touches.length !== 1) return;

    var currentY = e.touches[0].clientY;
    var deltaY   = currentY - _touchStartY;

    // Hanya proses swipe ke BAWAH
    if (deltaY <= 0) return;

    // Jika sheet belum scroll sampai paling atas, biarkan scroll normal berjalan
    // dulu. Setelah scrollTop = 0, baru ambil alih sebagai gesture dismiss.
    if (_touchStartScrollTop > 0 && sheet.scrollTop > 0) return;

    // Mulai mode dragging: blokir scroll dan animasi CSS
    if (!_isDragging) {
      _isDragging = true;
      sheet.classList.add('is-dragging');
    }

    // Cegah scroll default agar sheet tidak melompat saat di-drag ke bawah
    // Gunakan cancelable check agar tidak error di browser yang strict
    if (e.cancelable) e.preventDefault();

    _applyTransform(deltaY);
    _lastY    = currentY;
    _lastTime = e.timeStamp;
  }, { passive: false, signal: signal });

  sheet.addEventListener('touchend', function(e) {
    if (!_isDragging) return;

    _isDragging = false;
    sheet.classList.remove('is-dragging');

    var endY      = e.changedTouches[0] ? e.changedTouches[0].clientY : _lastY;
    var deltaY    = endY - _touchStartY;
    var deltaTime = e.timeStamp - _lastTime;
    // Velocity: px per ms. Gunakan pergerakan sejak touchmove terakhir
    var velocity  = deltaTime > 0 ? Math.abs(endY - _lastY) / deltaTime : 0;

    var shouldDismiss = (deltaY >= DISMISS_THRESHOLD_PX) ||
                        (deltaY > 20 && velocity >= DISMISS_VELOCITY);

    if (shouldDismiss) {
      // Bersihkan transform sebelum lpCloseForm() menjalankan animasi sheetDown
      sheet.style.transform = '';
      sheet.style.transition = '';
      var backdrop = document.getElementById('lp-backdrop');
      if (backdrop) backdrop.style.opacity = '';
      lpCloseForm();
    } else {
      // Belum melewati threshold — snap kembali ke posisi semula
      _resetTransform(true);
    }
  }, { passive: true, signal: signal });

  // Batalkan gesture jika sentuhan dibatalkan sistem (misal notifikasi muncul)
  sheet.addEventListener('touchcancel', function() {
    if (_isDragging) {
      _isDragging = false;
      sheet.classList.remove('is-dragging');
      _resetTransform(true);
      var backdrop = document.getElementById('lp-backdrop');
      if (backdrop) backdrop.style.opacity = '';
    }
  }, { passive: true, signal: signal });
}

function lpSetRole(role) {
  // ─── NOTE: fungsi swipe-to-dismiss (_lpInitSwipe) didefinisikan di atas, ───
  // ─── dipanggil dari lpOpenForm() setiap kali sheet dibuka.              ───
  const slider       = document.getElementById('lp-role-slider');
  const btnSiswa     = document.getElementById('lp-role-siswa');
  const btnAdmin     = document.getElementById('lp-role-admin');
  const btnPengawas  = document.getElementById('lp-role-pengawas');

  // Geser slider: Siswa=kiri(default), Admin=tengah, Pengawas=kanan
  if (slider) {
    slider.classList.remove('admin', 'pengawas');
    if (role === 'admin')    slider.classList.add('admin');
    if (role === 'pengawas') slider.classList.add('pengawas');
  }

  // Set class active dan ARIA pada semua tombol tab
  const tabs = [
    { el: btnSiswa,    id: 'siswa' },
    { el: btnAdmin,    id: 'admin' },
    { el: btnPengawas, id: 'pengawas' }
  ];
  tabs.forEach(t => {
    if (!t.el) return;
    const isThis = (t.id === role);
    t.el.classList.toggle('active', isThis);
    t.el.setAttribute('aria-selected', String(isThis));
    t.el.setAttribute('tabindex', isThis ? '0' : '-1');
  });

  // Terapkan perubahan UI (PIN, placeholder, hint) — kirim role langsung
  _lpApplyRoleUI(role);

  // Bersihkan error sebelumnya saat role berganti
  const errDiv = document.getElementById('loginError');
  if (errDiv) errDiv.style.display = 'none';
}

// ───── Caps Lock detection ─────
function _lpHandleCapsKey(e) {
  const warn = document.getElementById('caps-warning');
  if (!warn) return;
  let isCapsOn = false;
  try { isCapsOn = e.getModifierState && e.getModifierState('CapsLock'); } catch (err) {}
  warn.classList.toggle('show', !!isCapsOn);
}

// ───── Help dialog ─────
function lpShowHelp(e) {
  if (e) e.preventDefault();
  Swal.fire({
    title: '<i class="fas fa-circle-question" style="color:#4f46e5;margin-right:6px;"></i> Butuh Bantuan?',
    html: `
      <div style="text-align:left;font-size:13px;color:#475569;line-height:1.65;">
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px;margin-bottom:10px;">
          <p style="font-weight:700;color:#1e40af;margin:0 0 6px;font-size:13px;">
            <i class="fas fa-user-graduate" style="margin-right:4px;"></i>Untuk Siswa
          </p>
          <ul style="margin:0;padding-left:18px;font-size:12px;">
            <li><b>Username</b> &amp; <b>Password</b> diberikan oleh sekolah/madrasah Anda.</li>
            <li><b>PIN Sesi</b> diumumkan Pengawas saat ujian akan dimulai.</li>
            <li>Pastikan kelas Anda termasuk dalam daftar peserta ujian.</li>
          </ul>
        </div>
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:12px;margin-bottom:10px;">
          <p style="font-weight:700;color:#5b21b6;margin:0 0 6px;font-size:13px;">
            <i class="fas fa-user-shield" style="margin-right:4px;"></i>Untuk Admin / Guru
          </p>
          <ul style="margin:0;padding-left:18px;font-size:12px;">
            <li>Pilih tab <b>Admin / Guru</b> sebelum login.</li>
            <li>PIN tidak diperlukan untuk peran Admin atau Guru.</li>
            <li>Sesi otomatis berakhir setelah <b>1 jam</b> tidak aktif.</li>
          </ul>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px;margin-bottom:10px;">
          <p style="font-weight:700;color:#166534;margin:0 0 6px;font-size:13px;">
            <i class="fas fa-user-tie" style="margin-right:4px;"></i>Untuk Pengawas Ujian
          </p>
          <ul style="margin:0;padding-left:18px;font-size:12px;">
            <li>Pilih tab <b>Pengawas</b> sebelum login.</li>
            <li>Gunakan username &amp; password akun Guru atau akun Pengawas Anda.</li>
            <li>Guru yang bertugas sebagai pengawas wajib sudah ditugaskan oleh Admin.</li>
            <li>PIN tidak diperlukan. Sesi berakhir setelah <b>1 jam</b> tidak aktif.</li>
          </ul>
        </div>
        <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;text-align:center;">
          <i class="fas fa-headset" style="margin-right:3px;"></i>
          Hubungi Admin/Guru di sekolah Anda jika kendala berlanjut.
        </p>
      </div>
    `,
    confirmButtonText: 'Mengerti',
    confirmButtonColor: '#4f46e5',
    customClass: { popup: 'lp-swal' },
    width: 480
  });
}

// ───── Network status ─────
function _lpUpdateNetStatus() {
  const el  = document.getElementById('lp-net-status');
  const txt = document.getElementById('lp-net-status-text');
  if (!el || !txt) return;
  const loginPage = document.getElementById('page-login');
  const visible = loginPage && !loginPage.classList.contains('hidden') && loginPage.style.display !== 'none';
  if (!visible) { el.classList.remove('online','offline'); return; }
  if (navigator.onLine) {
    el.classList.remove('offline'); el.classList.add('online');
    txt.textContent = 'Online';
    setTimeout(() => { el.classList.remove('online'); }, 2200);
  } else {
    el.classList.remove('online'); el.classList.add('offline');
    txt.textContent = 'Offline · Periksa koneksi internet';
  }
}

function handleLogin(e) {
  e.preventDefault();

  const userInput = document.getElementById('username');
  const passInput = document.getElementById('password');
  const pinInput  = document.getElementById('pin');
  const user    = userInput.value.trim();
  const pass    = passInput.value;
  const pin     = pinInput.value.trim();
  // Baca mode login dari getter tunggal: 'siswa' | 'admin' | 'pengawas'
  const loginMode = _lpGetLoginMode();
  const isSiswa   = (loginMode === 'siswa');
  const btn     = document.getElementById('btnLogin');
  const errDiv  = document.getElementById('loginError');
  const errText = document.getElementById('errorText');
  const formCard = document.querySelector('.lp-form-card');

  // Clear previous invalid state
  [userInput, passInput, pinInput].forEach(el => el && el.classList.remove('is-invalid'));

  // Client-side validation
  if (!user) {
    _lpShowError('Username tidak boleh kosong.', userInput);
    return;
  }
  if (!pass) {
    _lpShowError('Password tidak boleh kosong.', passInput);
    return;
  }
  if (isSiswa && !pin) {
    _lpShowError('PIN Sesi Ujian wajib diisi untuk siswa.', pinInput);
    return;
  }
  if (isSiswa && !/^[0-9]+$/.test(pin)) {
    _lpShowError('PIN harus berupa angka.', pinInput);
    return;
  }
  if (!navigator.onLine) {
    _lpShowError('Tidak ada koneksi internet. Periksa jaringan Anda.', null);
    return;
  }

  // Remember username
  try {
    const remember = document.getElementById('lp-remember-me');
    if (remember && remember.checked) {
      localStorage.setItem('sipadu_remember_user', user);
    } else {
      localStorage.removeItem('sipadu_remember_user');
    }
  } catch (err) {}

  // ── Orientation gate: siswa di mobile harus landscape sebelum lanjut ──
  function _doSubmitLogin() {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Memverifikasi...</span>';
    errDiv.style.display = 'none';

    google.script.run
    .withSuccessHandler(res => {
      if (res.success) {
        btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
        btn.innerHTML = '<i class="fas fa-check-circle"></i><span>Berhasil!</span>';

        localStorage.setItem('sipadu_session', JSON.stringify({
          userID: res.userID, token: res.token, role: res.role,
          username: res.username, loginTime: Date.now()
        }));
        currentUser = res;
        window.currentUser = currentUser;

        const loginPage = document.getElementById('page-login');
        if (loginPage) {
          loginPage.style.transition = 'opacity 0.4s ease';
          loginPage.style.opacity = '0';
        }
        setTimeout(() => {
          if (loginPage) {
            loginPage.style.opacity = '';
            loginPage.style.transition = '';
            loginPage.classList.add('hidden');
            loginPage.style.display = 'none';
          }

          // Bug fix #1: lpOpenForm() men-set body overflow='hidden' untuk mobile sheet.
          // Tanpa reset ini, halaman ujian/admin tidak bisa di-scroll di mobile.
          document.body.style.overflow = '';

          _lpResetSubmitButton();

          if (res.role === 'Admin' || res.role === 'Guru') {
            handleEmailVerificationGating(res, function() {
                startAdminSessionTimer();
                initAdminPanel();
            });
          } else if (res.role === 'Pengawas') {
            startAdminSessionTimer();
            initSupervisorPanel();
          } else if (res.viewResultsOnly && res.responseId) {
            if (res.showExamResult === false) {
              switchPage('page-login');
              _lpResetSubmitButton(); // Bug fix #2: reset tombol SEBELUM Swal agar tidak stuck disabled
              Swal.fire({
                icon: 'info', title: 'Ujian Selesai',
                html: `<p class="text-slate-600">Halo <b>${res.username}</b>, Anda telah menyelesaikan ujian ini.</p>
                      <p class="text-sm text-slate-500 mt-2">Hasil ujian belum dapat ditampilkan saat ini. Silakan hubungi guru/admin Anda.</p>`,
                confirmButtonText: 'Mengerti', confirmButtonColor: '#3b82f6',
                customClass: { popup: 'lp-swal' }
              });
            } else {
              showStudentResultPage(res);
            }
          } else {
            if (!res.examData) {
              // Kembalikan halaman login dulu sebelum tampilkan error
              if (loginPage) {
                loginPage.classList.remove('hidden');
                loginPage.style.display = '';
                loginPage.style.opacity = '1';
              }
              _lpResetSubmitButton();
              _lpShowError('Data ujian tidak tersedia. Periksa PIN atau hubungi Pengawas.', document.getElementById('pin'));
              return;
            }
            initStudentExam(res.examData);
          }
        }, 400);
      } else {
        _lpResetSubmitButton();
        // Bug fix #3: shake dikelola sepenuhnya oleh _lpShowError() — hapus
        // shake duplikat di sini agar animasi tidak saling cancel.
        const msg = res.message || 'ID, password, atau PIN salah.';
        // Highlight likely-wrong field based on message keywords
        let target = null;
        const m = msg.toLowerCase();
        if (m.includes('pin') || m.includes('kelas') || m.includes('ujian')) target = pinInput;
        else if (m.includes('password')) target = passInput;
        else if (m.includes('user') || m.includes('id')) target = userInput;
        _lpShowError(msg, target);
      }
    })
    .withFailureHandler(err => {
      _lpResetSubmitButton();
      Swal.fire({
        icon: 'error',
        title: 'Gagal Terhubung ke Server',
        html: `<p style="font-size:13px;color:#475569;">Periksa koneksi internet Anda lalu coba lagi.</p>
               <p style="font-size:11px;color:#94a3b8;margin-top:8px;font-family:monospace;">${err && err.message ? err.message : err}</p>`,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'lp-swal' }
      });
    })
    // Kirim loginMode ke backend:
    //   'siswa'    → false  (Siswa)
    //   'admin'    → true   (Admin/Guru panel)
    //   'pengawas' → 'pengawas' (Pengawas panel)
    .loginUser(user, pass, pin, loginMode === 'siswa' ? false : loginMode);
  } // end _doSubmitLogin

  // Jika siswa di perangkat mobile → pastikan landscape dulu, baru submit
  if (isSiswa && _isMobileDevice()) {
    _requestLandscapeBeforeLogin(
      function() { _doSubmitLogin(); },          // proceed: orientasi sudah landscape
      function() { _lpResetSubmitButton(); }     // cancel: pengguna membatalkan
    );
  } else {
    _doSubmitLogin();
  }
}

// ───── Login helpers ─────
function _lpResetSubmitButton() {
  const btn = document.getElementById('btnLogin');
  if (!btn) return;
  btn.disabled = false;
  btn.style.background = '';
  btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i><span>Masuk Aplikasi</span>';
}
function _lpShowError(msg, focusEl) {
  const errDiv  = document.getElementById('loginError');
  const errText = document.getElementById('errorText');
  const formCard = document.querySelector('.lp-form-card');
  if (errText) errText.textContent = msg;
  if (errDiv)  errDiv.style.display = 'flex';
  if (formCard) {
    formCard.classList.remove('lp-shake');
    void formCard.offsetWidth;
    formCard.classList.add('lp-shake');
  }
  if (focusEl) {
    focusEl.classList.add('is-invalid');
    try { focusEl.focus(); } catch(e){}
  }
}

function handleEmailVerificationGating(res, proceedCallback) {
  proceedCallback();
  
  if (res.role === 'Guru') {
    google.script.run
      .withSuccessHandler(function(statusRes) {
        if (statusRes && statusRes.success) {
          console.log("Status verifikasi email guru:", statusRes.verified);
          if (!statusRes.verified) {
            window._guruEmailUnverified = true;
            showEmailVerificationModal(res);
          }
        }
      })
      .withFailureHandler(function(err) {
        console.error("Gagal mengecek verifikasi email secara asinkron:", err);
      })
      .recheckEmailVerification(res.userID, res.token);
  }
}

function showEmailVerificationModal(res) {
  Swal.fire({
    icon: 'warning',
    title: 'Verifikasi Email Diperlukan',
    html: `
      <div style="text-align:left; font-size:13px; color:#475569; line-height:1.6;">
        <p>Halo <b>${res.username || 'Guru'}</b>,</p>
        <p style="margin-top:8px;">Email akun Bapak/Ibu belum terverifikasi. Mohon selesaikan verifikasi email melalui aplikasi SiM-Murid untuk membuka akses fitur input/edit soal dan layanan CBT lainnya.</p>
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:10px; margin-top:12px;">
          <p style="color:#b45309; margin:0;"><i class="fas fa-info-circle" style="margin-right:5px;"></i> Silakan cek kotak masuk (inbox) atau folder spam pada email Anda di aplikasi SiM-Murid.</p>
        </div>
        <p style="margin-top:12px;">Setelah melakukan verifikasi, silakan klik tombol <b>Saya Sudah Verifikasi</b> di bawah untuk memeriksa kembali.</p>
      </div>
    `,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-sync-alt"></i> Saya Sudah Verifikasi',
    cancelButtonText: '<i class="fas fa-sign-out-alt"></i> Logout',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#dc2626',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then((action) => {
    if (action.isConfirmed) {
      Swal.showLoading();
      google.script.run
        .withSuccessHandler(function(statusRes) {
          Swal.hideLoading();
          if (statusRes && statusRes.success && statusRes.verified) {
            Swal.fire({
              icon: 'success',
              title: 'Email Terverifikasi',
              text: 'Terima kasih, email Anda telah berhasil diverifikasi.',
              confirmButtonColor: '#2563eb',
              confirmButtonText: 'Lanjutkan',
              customClass: { popup: 'lp-swal' }
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Verifikasi Gagal',
              text: 'Sistem mendeteksi email Anda belum terverifikasi. Mohon verifikasi terlebih dahulu di SiM-Murid.',
              allowOutsideClick: false,
              allowEscapeKey: false,
              showCancelButton: true,
              confirmButtonText: '<i class="fas fa-sync-alt"></i> Coba Lagi',
              cancelButtonText: '<i class="fas fa-sign-out-alt"></i> Logout',
              confirmButtonColor: '#2563eb',
              cancelButtonColor: '#dc2626',
              reverseButtons: true,
              customClass: { popup: 'lp-swal' }
            }).then((errAction) => {
              if (errAction.isConfirmed) {
                showEmailVerificationModal(res);
              } else if (errAction.dismiss === Swal.DismissReason.cancel) {
                executeLogout();
              } else {
                setTimeout(function() { showEmailVerificationModal(res); }, 500);
              }
            });
          }
        })
        .withFailureHandler(function(err) {
          Swal.hideLoading();
          Swal.fire({
            icon: 'error',
            title: 'Kesalahan Sistem',
            text: 'Gagal menghubungi server untuk verifikasi: ' + (err.message || err),
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-sync-alt"></i> Coba Lagi',
            cancelButtonText: '<i class="fas fa-sign-out-alt"></i> Logout',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#dc2626',
            reverseButtons: true,
            customClass: { popup: 'lp-swal' }
          }).then((errAction) => {
            if (errAction.isConfirmed) {
              showEmailVerificationModal(res);
            } else if (errAction.dismiss === Swal.DismissReason.cancel) {
              executeLogout();
            } else {
              setTimeout(function() { showEmailVerificationModal(res); }, 500);
            }
          });
        })
        .recheckEmailVerification(res.userID, res.token);
    } else if (action.dismiss === Swal.DismissReason.cancel) {
      executeLogout();
    } else {
      setTimeout(function() { showEmailVerificationModal(res); }, 500);
    }
  });
}

function startAdminSessionTimer() {
  if (adminSessionTimer) {
    clearInterval(adminSessionTimer);
    adminSessionTimer = null;
  }

  // Catat waktu aktivitas terakhir saat timer dimulai
  localStorage.setItem('sipadu_last_activity', String(Date.now()));

  // Reset timer inaktivitas setiap ada interaksi pengguna
  const _updateActivity = () => {
    localStorage.setItem('sipadu_last_activity', String(Date.now()));
  };
  const _ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
  // Hapus listener lama (jika ada) sebelum mendaftar baru agar tidak menumpuk
  _ACTIVITY_EVENTS.forEach(ev => document.removeEventListener(ev, _updateActivity, true));
  _ACTIVITY_EVENTS.forEach(ev => document.addEventListener(ev, _updateActivity, { passive: true, capture: true }));

  adminSessionTimer = setInterval(function() {
    const savedSession = localStorage.getItem('sipadu_session');
    if (!savedSession) return;
    try {
      const sess = JSON.parse(savedSession);
      // BUG FIX: tambahkan 'Pengawas' agar sesi Pengawas juga di-expire
      // saat tidak aktif. Sebelumnya hanya Admin dan Guru yang dicakup.
      if (sess.role !== 'Admin' && sess.role !== 'Guru' && sess.role !== 'Pengawas') return;
      const lastActivity = parseInt(localStorage.getItem('sipadu_last_activity') || '0', 10) || (sess.loginTime || 0);
      const idle = Date.now() - lastActivity;
      if (idle >= ADMIN_SESSION_DURATION_MS) {
        clearInterval(adminSessionTimer);
        adminSessionTimer = null;
        _ACTIVITY_EVENTS.forEach(ev => document.removeEventListener(ev, _updateActivity, true));
        forceLogoutSession();
      }
    } catch(e) {
      clearInterval(adminSessionTimer);
      adminSessionTimer = null;
    }
  }, 30000);
}

function forceLogoutSession() {
  // Bug fix: hentikan timer sesi agar interval tidak terus berjalan setelah sesi dipaksa berakhir
  if (adminSessionTimer) {
    clearInterval(adminSessionTimer);
    adminSessionTimer = null;
  }
  if (typeof disableAntiCheat === 'function') disableAntiCheat();
  // Bug fix: lepas landscape lock agar overlay tidak muncul di halaman login
  if (typeof unlockLandscape === 'function') unlockLandscape();
  if (currentUser && currentUser.userID) {
    localStorage.removeItem('sipadu_last_tab_' + currentUser.userID); 
    google.script.run.logoutUser(currentUser.userID);
  }

  localStorage.removeItem('sipadu_session');
  localStorage.removeItem('sipadu_last_activity');
  currentUser = null;
  window.currentUser = null;
  currentExam = null;
  if (typeof questions !== 'undefined') questions = [];
  if (typeof answers !== 'undefined') answers = {};
  if (typeof violationCount !== 'undefined') violationCount = 0;
  if (typeof fullscreenExitCount !== 'undefined') fullscreenExitCount = 0;
  _winKeyJustPressed = false;
  if (_winKeyTimer) { clearTimeout(_winKeyTimer); _winKeyTimer = null; }
  // Bug fix: hentikan polling notifikasi siswa yang mungkin masih aktif
  stopNotificationPolling();

  if (initialExamHTML) {
    const ep = document.getElementById('page-exam');
    if (ep) ep.innerHTML = initialExamHTML;
  }

  switchPage('page-login');
  document.getElementById('global-loading').classList.add('hidden');

  const loginForm = document.getElementById('loginForm');
  // Bug fix #8: reset form DULU sebelum lpSetRole agar _lpApplyRoleUI tidak
  // langsung di-overwrite oleh efek form.reset() pada input values
  if (loginForm) loginForm.reset();
  // #4: reset role via lpSetRole (tidak ada lagi hidden checkbox untuk direset)
  lpSetRole('siswa');
  const pinContainer = document.getElementById('pin-container');
  if (pinContainer) pinContainer.style.display = 'block';
  const pinInput = document.getElementById('pin');
  if (pinInput) { pinInput.value = ''; pinInput.setAttribute('required', 'true'); }
  // Ini diperlukan jika login terakhir dilakukan via mobile sheet (lpOpenForm).
  document.body.style.overflow = '';
  // Bug fix mobile: pastikan sheet mobile ditutup saat kembali ke halaman login
  const mobileRight = document.getElementById('lp-right');
  if (mobileRight) {
    mobileRight.classList.remove('mobile-open');
    mobileRight.setAttribute('aria-hidden', 'true');
  }
  const mobileBackdrop = document.getElementById('lp-backdrop');
  if (mobileBackdrop) {
    mobileBackdrop.classList.remove('show');
    mobileBackdrop.setAttribute('aria-hidden', 'true');
  }
  const mobileCta = document.getElementById('lp-mobile-cta');
  if (mobileCta) mobileCta.style.display = '';

  window.scrollTo(0, 0);

  Swal.fire({
    icon: 'warning',
    title: 'Sesi Berakhir',
    html: `<p>Sesi Anda telah berakhir karena sudah <b>1 jam</b> tidak aktif.</p>
           <p style="font-size:0.85em;margin-top:8px;color:#64748b;">Silakan login kembali untuk melanjutkan.</p>`,
    confirmButtonText: '<i class="fas fa-sign-in-alt" style="margin-right:6px;"></i> Login Kembali',
    confirmButtonColor: '#2563eb',
    allowOutsideClick: false,
    customClass: { popup: 'lp-swal' }
  });
}

function executeLogout() {
  if (adminSessionTimer) {
    clearInterval(adminSessionTimer);
    adminSessionTimer = null;
  }
  if (typeof disableAntiCheat === 'function') {
    disableAntiCheat();
  }
  // FIX #3: pastikan landscape lock selalu dilepas saat logout,
  // termasuk jalur paksa (timeout sesi, curang, dll.) yang tidak
  // melalui executeSubmission. Tanpa ini, overlay bisa muncul di halaman login.
  if (typeof unlockLandscape === 'function') {
    unlockLandscape();
  }
  localStorage.removeItem('sipadu_session');
  localStorage.removeItem('sipadu_last_activity');
  if (typeof currentUser !== 'undefined' && currentUser && currentUser.userID) {
    localStorage.removeItem('sipadu_last_tab_' + currentUser.userID); 
    google.script.run.logoutUser(currentUser.userID);
  }
  currentUser = null;
  window.currentUser = null;
  currentExam = null;
  questions = [];
  answers = {};
  violationCount = 0;
  fullscreenExitCount = 0;
  _winKeyJustPressed = false;
  if (_winKeyTimer) { clearTimeout(_winKeyTimer); _winKeyTimer = null; }
  stopNotificationPolling();
  if (initialExamHTML) {
    // BUG FIX: tambahkan null check agar tidak throw TypeError jika
    // page-exam tidak ada di DOM (misal logout dari panel Admin/Guru).
    const _ep = document.getElementById('page-exam');
    if (_ep) _ep.innerHTML = initialExamHTML;
  }
  switchPage('page-login');
  document.getElementById('global-loading').classList.add('hidden');
  const loginForm = document.getElementById('loginForm');
  // Bug fix #8: reset form DULU sebelum lpSetRole agar _lpApplyRoleUI tidak
  // langsung di-overwrite oleh efek form.reset() pada input values
  if (loginForm) loginForm.reset();
  // #4: reset role via lpSetRole (tidak ada lagi hidden checkbox untuk direset)
  lpSetRole('siswa');
  const pinContainer2 = document.getElementById('pin-container');
  if (pinContainer2) pinContainer2.style.display = 'block';
  const pinInput2 = document.getElementById('pin');
  if (pinInput2) {
    pinInput2.value = '';
    pinInput2.setAttribute('required', 'true');
  }
  // Bug fix #1: reset overflow agar halaman login bisa di-scroll setelah logout.
  // Diperlukan jika user login via mobile sheet (lpOpenForm sets overflow='hidden').
  document.body.style.overflow = '';
  // Bug fix mobile: tutup mobile sheet jika masih terbuka saat logout
  const mobileRight2 = document.getElementById('lp-right');
  if (mobileRight2) {
    mobileRight2.classList.remove('mobile-open');
    mobileRight2.setAttribute('aria-hidden', 'true');
  }
  const mobileBackdrop2 = document.getElementById('lp-backdrop');
  if (mobileBackdrop2) {
    mobileBackdrop2.classList.remove('show');
    mobileBackdrop2.setAttribute('aria-hidden', 'true');
  }
  const mobileCta2 = document.getElementById('lp-mobile-cta');
  if (mobileCta2) mobileCta2.style.display = '';
  window.scrollTo(0, 0);
}

function logout() {
  Swal.fire({
    title: 'Keluar dari Aplikasi?',
    html: `<p style="color:#475569;font-size:13px;">Sesi Anda akan diakhiri dan Anda perlu login kembali untuk melanjutkan.</p>`,
    icon: 'question',
    iconColor: '#f59e0b',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fas fa-sign-out-alt" style="margin-right:6px;"></i> Ya, Keluar',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: { popup: 'lp-swal' }
  }).then((result) => {
    if (result.isConfirmed) {
      executeLogout();
    }
  });
}
