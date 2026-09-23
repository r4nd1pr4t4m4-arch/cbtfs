/**
 * exam.js — Halaman Ujian Siswa
 * initStudentExam(), renderQuestion(), semua handler ujian siswa
 * Sumber: index.html L25831-28863
 */

 * berdasarkan lebar layar fisik (≤ 1024px) dan user-agent touch hints.
 */
function _isMobileDevice() {
  return (
    window.innerWidth <= 1024 ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0)
  );
}

/** Mengembalikan true jika orientasi saat ini portrait (tinggi > lebar). */
function _isPortrait() {
  return window.innerHeight > window.innerWidth;
}

/**
 * Memastikan layar dalam mode landscape sebelum proses login dilanjutkan.
 * @param {Function} proceedCallback  Dipanggil jika/ketika sudah landscape.
 * @param {Function} cancelCallback   Dipanggil jika pengguna membatalkan.
 */
function _requestLandscapeBeforeLogin(proceedCallback, cancelCallback) {
  // Sudah landscape? Langsung lanjut tanpa interupsi.
  if (!_isPortrait()) {
    proceedCallback();
    return;
  }

  // Coba Screen Orientation API terlebih dahulu
  const ori = screen && screen.orientation;
  if (ori && typeof ori.lock === 'function') {
    ori.lock('landscape')
      .then(() => {
        // API berhasil mengunci — lanjut login
        proceedCallback();
      })
      .catch(() => {
        // API ditolak (iOS, browser tanpa izin) — tampilkan fallback Swal
        _showOrientationGateSwal(proceedCallback, cancelCallback);
      });
    return;
  }

  // API tidak tersedia — langsung ke fallback Swal
  _showOrientationGateSwal(proceedCallback, cancelCallback);
}

/** Menampilkan Swal instruksi rotasi layar dengan tombol yang aktif dinamis. */
function _showOrientationGateSwal(proceedCallback, cancelCallback) {
  // Bersihkan listener lama sebelum membuat yang baru
  var _mq   = null;
  var _onMQChange  = null;
  var _onResize    = null;
  var _swalOpen    = true;

  function _cleanup() {
    _swalOpen = false;
    if (_mq && _onMQChange) {
      try { _mq.removeEventListener('change', _onMQChange); } catch(e) {}
      _mq = null;
    }
    if (_onResize) {
      window.removeEventListener('resize', _onResize);
      _onResize = null;
    }
  }

  function _refreshBtn() {
    if (!_swalOpen) return;
    var confirmBtn = Swal.getConfirmButton();
    if (!confirmBtn) return;
    var nowPortrait = _isPortrait();
    if (nowPortrait) {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.45';
      confirmBtn.style.cursor  = 'not-allowed';
      var statusEl = document.getElementById('lp-orient-status');
      if (statusEl) {
        statusEl.className = 'lp-orient-status portrait';
        statusEl.innerHTML = '<i class="fas fa-mobile-screen-button"></i> Masih Portrait';
      }
    } else {
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor  = 'pointer';
      var statusEl = document.getElementById('lp-orient-status');
      if (statusEl) {
        statusEl.className = 'lp-orient-status landscape';
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Landscape Terdeteksi!';
      }
    }
  }

  Swal.fire({
    customClass : { popup: 'lp-orient-swal' },
    showCancelButton   : true,
    confirmButtonText  : '<i class="fas fa-check"></i> Lanjutkan Login',
    cancelButtonText   : 'Batal',
    confirmButtonColor : '#4f46e5',
    cancelButtonColor  : '#94a3b8',
    allowOutsideClick  : false,
    allowEscapeKey     : false,
    html: `
      <div class="lp-orient-body">
        <div class="lp-orient-phone">&#x1F4F1;</div>
        <div>
          <p style="font-size:15px;font-weight:800;color:#1e293b;margin:0 0 6px;">Putar Layar ke Landscape</p>
          <p style="font-size:13px;color:#64748b;margin:0;line-height:1.55;">
            Ujian CBT hanya dapat diikuti dalam mode <b>horizontal (landscape)</b>.
            Putar perangkat Anda terlebih dahulu, lalu tekan <b>Lanjutkan Login</b>.
          </p>
        </div>
        <span id="lp-orient-status" class="lp-orient-status portrait">
          <i class="fas fa-mobile-screen-button"></i> Masih Portrait
        </span>
      </div>`,
    didOpen: () => {
      // Nonaktifkan tombol saat awal (masih portrait)
      _refreshBtn();

      // Pantau perubahan orientasi via matchMedia
      _mq = window.matchMedia('(orientation: portrait)');
      _onMQChange = _refreshBtn;
      try { _mq.addEventListener('change', _onMQChange); } catch(e) {}

      // Guard resize sebagai cadangan
      _onResize = _refreshBtn;
      window.addEventListener('resize', _onResize);
    },
    willClose: () => {
      _cleanup();
    }
  }).then(result => {
    if (result.isConfirmed && !_isPortrait()) {
      proceedCallback();
    } else {
      // Pengguna batal atau masih portrait saat konfirmasi (edge case)
      if (cancelCallback) cancelCallback();
    }
  });
}
// ===== END ORIENTATION GATE =====

// ===== LANDSCAPE LOCK + PORTRAIT TOLERANCE =====
// Mengunci orientasi layar ke landscape saat siswa mengerjakan ujian di mobile.
// Saat portrait terdeteksi, memberikan toleransi 20 detik sebelum memicu anti-cheat.
//
// Alur:
//   Portrait terdeteksi → tampilkan overlay + mulai countdown 20 detik
//   Kembali landscape sebelum 20 detik → batalkan countdown, sembunyikan overlay, TIDAK ada pelanggaran
//   Tetap portrait hingga 20 detik habis → panggil handleSecurityTrigger (mekanisme yang sudah ada)
//
// State:
//   _portraitLockActive      : true saat ujian berlangsung (lock aktif)
//   _portraitToleranceActive : true saat countdown toleransi sedang berjalan
//   _portraitToleranceTimer  : handle setTimeout untuk akhir toleransi 20 detik
//   _portraitCountdownInterval: handle setInterval untuk update UI countdown per detik
//
// Guard di anti-cheat:
//   ac_fsHandler, ac_blurHandler, ac_pageHideHandler, ac_pageFreezeHandler
//   semuanya bail-out bila _portraitToleranceActive === true,
//   karena rotasi ke portrait di Android dapat menyebabkan fullscreen exit
//   dan pagehide/blur secara bersamaan — bukan tindakan curang.

const PORTRAIT_TOLERANCE_SEC = 20; // detik toleransi sebelum dianggap pelanggaran

let _portraitLockActive       = false;
let _orientationMQ            = null;
let _resizeLockBound          = false;

// State toleransi portrait — satu sumber kebenaran
let _portraitToleranceActive   = false;
let _portraitToleranceTimer    = null;
let _portraitCountdownInterval = null;

// -----------------------------------------------------------------
// lockLandscape() — dipanggil saat ujian dimulai
// -----------------------------------------------------------------
function lockLandscape() {
  _portraitLockActive = true;

  // Coba Screen Orientation API terlebih dahulu (Chrome/Android modern)
  const ori = screen.orientation;
  if (ori && typeof ori.lock === 'function') {
    ori.lock('landscape').catch(() => {
      // API ditolak (iOS Safari, beberapa browser) — aktifkan fallback
      _startOrientationFallback();
    });
    // Pasang fallback sebagai jaring pengaman: beberapa implementasi menerima
    // lock() tapi masih memperbolehkan rotasi manual.
    _startOrientationFallback();
  } else {
    _startOrientationFallback();
  }
}

// -----------------------------------------------------------------
// unlockLandscape() — dipanggil saat ujian selesai / logout
// -----------------------------------------------------------------
function unlockLandscape() {
  _portraitLockActive = false;
  _cancelPortraitTolerance(); // hentikan countdown jika masih berjalan
  _stopOrientationFallback();

  try {
    if (screen.orientation && typeof screen.orientation.unlock === 'function') {
      screen.orientation.unlock();
    }
  } catch(e) { /* abaikan */ }
}

// -----------------------------------------------------------------
// _checkAndShowPortraitOverlay()
// Dipanggil setiap kali orientasi berubah (MQL change / resize).
// Tugasnya: memulai atau membatalkan countdown toleransi.
// -----------------------------------------------------------------
function _checkAndShowPortraitOverlay() {
  if (!_portraitLockActive) return;

  const isPortrait = window.innerHeight > window.innerWidth;

  if (isPortrait) {
    // Hanya mulai countdown baru jika belum ada yang berjalan
    if (!_portraitToleranceActive) {
      _startPortraitTolerance();
    }
  } else {
    // Kembali landscape — batalkan tolerance jika masih berjalan
    if (_portraitToleranceActive) {
      _cancelPortraitTolerance();
    }
    // Pastikan overlay bersih
    const overlay = document.getElementById('portrait-lock-overlay');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// -----------------------------------------------------------------
// _startPortraitTolerance()
// Menampilkan overlay + countdown 20 detik. Tidak menyentuh anti-cheat.
// -----------------------------------------------------------------
function _startPortraitTolerance() {
  // Jangan buat timer ganda jika sudah aktif
  if (_portraitToleranceActive) return;

  const overlay = document.getElementById('portrait-lock-overlay');
  const numEl   = document.getElementById('plo-countdown-number');
  const subEl   = document.getElementById('plo-countdown-sublabel');
  const barEl   = document.getElementById('plo-progress-bar');

  // Overlay harus ada di DOM. Jika tidak ditemukan, batalkan tanpa mengubah state.
  if (!overlay) return;

  _portraitToleranceActive = true;

  // Tampilkan overlay
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Inisialisasi UI countdown
  let remaining = PORTRAIT_TOLERANCE_SEC;
  if (numEl) {
    numEl.textContent = remaining;
    numEl.classList.remove('plo-urgent');
  }
  if (subEl) subEl.textContent = 'detik tersisa';
  if (barEl) {
    barEl.classList.remove('plo-urgent-bar');
    // Reset ke lebar penuh, lalu mulai shrink
    barEl.style.transition = 'none';
    barEl.style.transform  = 'scaleX(1)';
    // Paksa reflow sebelum mengaktifkan transisi
    void barEl.offsetWidth;
    barEl.style.transition = `transform ${PORTRAIT_TOLERANCE_SEC}s linear`;
    barEl.style.transform  = 'scaleX(0)';
  }

  // Update countdown per detik
  _portraitCountdownInterval = setInterval(() => {
    remaining--;

    if (numEl) {
      numEl.textContent = remaining;
      if (remaining <= 5) {
        numEl.classList.add('plo-urgent');
        if (barEl) barEl.classList.add('plo-urgent-bar');
      }
    }
    if (subEl) subEl.textContent = remaining === 1 ? 'detik tersisa' : 'detik tersisa';
  }, 1000);

  // Timer utama — habis 20 detik → perlakukan sebagai pelanggaran
  _portraitToleranceTimer = setTimeout(() => {
    // Bersihkan interval UI
    if (_portraitCountdownInterval) {
      clearInterval(_portraitCountdownInterval);
      _portraitCountdownInterval = null;
    }
    _portraitToleranceActive = false;

    // Cek ulang: mungkin siswa baru saja kembali landscape tepat saat timer habis
    const stillPortrait = window.innerHeight > window.innerWidth;
    if (!stillPortrait) {
      // Kembali landscape tepat di batas — tidak ada pelanggaran
      const ov = document.getElementById('portrait-lock-overlay');
      if (ov) ov.classList.remove('active');
      document.body.style.overflow = '';
      return;
    }

    // Masih portrait setelah 20 detik → eskalasi ke mekanisme anti-cheat
    const ov = document.getElementById('portrait-lock-overlay');
    if (ov) ov.classList.remove('active');
    document.body.style.overflow = '';

    handleSecurityTrigger('Orientasi Portrait melebihi batas toleransi 20 detik');
  }, PORTRAIT_TOLERANCE_SEC * 1000);
}

// -----------------------------------------------------------------
// _cancelPortraitTolerance()
// Membatalkan countdown — tidak ada pelanggaran yang dicatat.
// -----------------------------------------------------------------
function _cancelPortraitTolerance() {
  if (_portraitToleranceTimer) {
    clearTimeout(_portraitToleranceTimer);
    _portraitToleranceTimer = null;
  }
  if (_portraitCountdownInterval) {
    clearInterval(_portraitCountdownInterval);
    _portraitCountdownInterval = null;
  }
  _portraitToleranceActive = false;

  // Sembunyikan overlay dan bersihkan state UI
  const overlay = document.getElementById('portrait-lock-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';

  // Reset elemen countdown ke nilai awal (untuk kejadian portrait berikutnya)
  const numEl = document.getElementById('plo-countdown-number');
  const barEl = document.getElementById('plo-progress-bar');
  if (numEl) {
    numEl.textContent = PORTRAIT_TOLERANCE_SEC;
    numEl.classList.remove('plo-urgent');
  }
  if (barEl) {
    barEl.classList.remove('plo-urgent-bar');
    barEl.style.transition = 'none';
    barEl.style.transform  = 'scaleX(1)';
  }
}

// -----------------------------------------------------------------
// _startOrientationFallback() / _stopOrientationFallback()
// Mengelola event listener MQL dan resize.
// -----------------------------------------------------------------
function _startOrientationFallback() {
  _checkAndShowPortraitOverlay();
  if (!_orientationMQ) {
    _orientationMQ = window.matchMedia('(orientation: portrait)');
    _orientationMQ.addEventListener('change', _checkAndShowPortraitOverlay);
  }
  if (!_resizeLockBound) {
    window.addEventListener('resize', _checkAndShowPortraitOverlay);
    _resizeLockBound = true;
  }
}

function _stopOrientationFallback() {
  // Batalkan tolerance sebelum melepas listener
  _cancelPortraitTolerance();

  const overlay = document.getElementById('portrait-lock-overlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';

  if (_orientationMQ) {
    _orientationMQ.removeEventListener('change', _checkAndShowPortraitOverlay);
    _orientationMQ = null;
  }
  if (_resizeLockBound) {
    window.removeEventListener('resize', _checkAndShowPortraitOverlay);
    _resizeLockBound = false;
  }
}
// ===== END LANDSCAPE LOCK + PORTRAIT TOLERANCE =====

function initStudentExam(examData) {
  Swal.fire({
    title: 'PERHATIAN SEBELUM UJIAN',
    html: `
      <div style="text-align:left;margin-top:8px;">
        <p style="color:#475569;font-size:13px;font-weight:500;margin:0 0 12px;">Sistem ini sangat sensitif. Demi kelancaran ujian:</p>
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 14px;border-radius:6px;margin-bottom:14px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:7px;">
            <li style="display:flex;align-items:flex-start;gap:8px;color:#b91c1c;font-size:13px;font-weight:700;line-height:1.45;">
              <span style="flex-shrink:0;margin-top:1px;">&#9679;</span>
              <span>JANGAN mencoba membuka tab lain.</span>
            </li>
            <li style="display:flex;align-items:flex-start;gap:8px;color:#b91c1c;font-size:13px;font-weight:700;line-height:1.45;">
              <span style="flex-shrink:0;margin-top:1px;">&#9679;</span>
              <span>JANGAN keluar dari mode Full Screen.</span>
            </li>
            <li style="display:flex;align-items:flex-start;gap:8px;color:#b91c1c;font-size:13px;font-weight:700;line-height:1.45;">
              <span style="flex-shrink:0;margin-top:1px;">&#9679;</span>
              <span>JANGAN melakukan minimize browser.</span>
            </li>
            ${_isMobileDevice() ? `
            <li style="display:flex;align-items:flex-start;gap:8px;color:#b91c1c;font-size:13px;font-weight:700;line-height:1.45;">
              <span style="flex-shrink:0;margin-top:1px;">&#9679;</span>
              <span>JANGAN ubah orientasi HP kamu saat sedang mengerjakan ujian.</span>
            </li>` : ''}
          </ul>
        </div>
        <p style="color:#64748b;font-size:12px;margin:0;">
          Jika terdeteksi, ujian akan <b style="color:#dc2626;">tertutup otomatis</b> dan jawaban Anda langsung dikirim tanpa peringatan kedua.
        </p>
      </div>
    `,
    icon: 'warning',
    confirmButtonText: 'SAYA MENGERTI &amp; MULAI',
    confirmButtonColor: '#d33',
    allowOutsideClick: false,
    allowEscapeKey: false,
    backdrop: `rgba(0,0,0,0.85)`,
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();

      // Pastikan teks tombol selalu center — gunakan flex layout
      confirmBtn.style.cssText += ';display:inline-flex;align-items:center;justify-content:center;gap:6px;';

      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.55';
      confirmBtn.style.cursor = 'not-allowed';

      // Sisipkan elemen countdown terpisah setelah teks tombol
      const countdownEl = document.createElement('span');
      countdownEl.id = 'swal-countdown';
      countdownEl.style.cssText = 'font-weight:900;opacity:0.85;min-width:28px;text-align:left;';
      countdownEl.textContent = '(15)';
      confirmBtn.appendChild(countdownEl);

      let remaining = 15;
      const tick = setInterval(() => {
        remaining--;
        countdownEl.textContent = `(${remaining})`;
        if (remaining <= 0) {
          clearInterval(tick);
          // Hapus elemen countdown agar tidak ada sisa ruang
          confirmBtn.removeChild(countdownEl);
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = '1';
          confirmBtn.style.cursor = 'pointer';
        }
      }, 1000);
    }
  }).then((result) => {
    if (result.isConfirmed) {
      violationCount = 0;
      fullscreenExitCount = 0; 
      _winKeyJustPressed = false;
      if (_winKeyTimer) { clearTimeout(_winKeyTimer); _winKeyTimer = null; }
      currentExam = examData;

      switchPage('page-exam');
      _examNavDesktopVisible = false;
      const examNav = document.getElementById('exam-nav');
      if (examNav) {
        examNav.style.transition = 'none';
        examNav.classList.add('nav-hidden');
        examNav.classList.add('translate-x-full');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            examNav.style.transition = '';
          });
        });
      }
      const navLabel = document.getElementById('nav-toggle-label');
      if (navLabel) navLabel.textContent = 'Navigasi';
      enterFullscreen();
      applyStudentHeaderColor(currentUser.userID);
      document.getElementById('exam-subject-title').textContent = examData.subject;
      document.getElementById('student-name-display').textContent = currentUser.username;
      document.getElementById('student-id-display').textContent = currentUser.userID;

      google.script.run.withSuccessHandler(res => {
        if (res.error) {
          Swal.fire('Gagal', res.error, 'error').then(() => logout());
          return;
        }

        questions = res.questions;
        if (res.savedAnswers) answers = res.savedAnswers;
        const remainingSeconds = res.remainingTime; 

        window._essayCanvasEnabled = (res.essayCanvasEnabled !== false);

        window._examDurationSec = currentExam && currentExam.duration
            ? currentExam.duration * 60
            : remainingSeconds; 

        renderNavGrid();
        renderQuestion(0);
        startTimer(remainingSeconds); 
        enableAntiCheat();
        lockLandscape(); // Kunci orientasi landscape selama ujian berlangsung

      }).withFailureHandler(err => {
        // BUG FIX #15: err.message bisa undefined; tampilkan pesan fallback
        // dan kembalikan ke halaman login agar siswa tidak terjebak.
        const msg = (err && err.message) ? err.message : String(err || 'Gagal memuat soal ujian.');
        Swal.fire('Error', msg, 'error').then(() => logout());
      }).getExamQuestions(examData.id, currentUser.userID, currentUser.token);
    }
  });
}

function renderQuestion(index) {
  if (!questions || !questions[index]) return;

  currentQIndex = index;
  const q = questions[index];
  if (!answers[q.id]) {
    if (q.type === 'PG_KOMPLEKS') {
      answers[q.id] = [];
    } else if (q.type === 'JODOH' || q.type === 'BS') {
      answers[q.id] = {};
    } else {
      answers[q.id] = '';
    }
  }

  let savedAns = answers[q.id];
  
  if (q.type === 'PG_KOMPLEKS') {
    if (!Array.isArray(savedAns)) savedAns = [];
  } else if ((q.type === 'BS' || q.type === 'JODOH') && (typeof savedAns !== 'object' || savedAns === null)) {
    savedAns = {};
  }
  let typeLabel = q.type;
  if (q.type === 'PG_KOMPLEKS') typeLabel = 'PG KOMPLEKS';

  const container = document.getElementById('question-container');
  container.innerHTML = '';

  const headerHTML = `
    <div class="flex items-start justify-between mb-4 fade-in">
        <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 block">Pertanyaan No.</span>
            <h2 class="text-xl font-bold text-slate-800">${index + 1}</h2>
        </div>
        <div class="flex flex-col items-end gap-1">
             <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">${typeLabel}</span>
             ${(String(q.isRequired) === 'TRUE') ? '<span class="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">WAJIB</span>' : ''}
        </div>
    </div>`;

  const contentHTML = `
    <div class="question-text prose prose-slate max-w-none text-base 
                leading-relaxed font-medium mb-6 fade-in">
        ${prepContent(q.content)}
    </div>`;

  let imageHTML = '';
  if (q.image) {
    // BUG FIX #10: escape atribut src — URL yang mengandung `"` atau karakter
    // HTML khusus bisa memecah atribut dan menyuntikkan markup atau event handler.
    const safeImageSrc = String(q.image)
      .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;');
    imageHTML = `
    <div class="mb-6 p-1.5 border border-slate-100 rounded-xl bg-slate-50 inline-block fade-in">
      <div class="q-img-wrap">
        <div class="q-img-skeleton" id="q-img-skel-${q.id}">
          <div class="q-img-skeleton-icon">
            <i class="far fa-image"></i>
            <span>Memuat gambar...</span>
          </div>
        </div>
        <div class="q-img-error" id="q-img-err-${q.id}">
          <i class="fas fa-exclamation-triangle"></i>
          <span>Gagal memuat gambar soal</span>
        </div>
        <img src="${safeImageSrc}" referrerpolicy="no-referrer"
             class="q-img-el"
             id="q-img-${q.id}"
             onclick="openExamImageModal(this.src)"
             onload="(function(img){
               var skel = document.getElementById('q-img-skel-${q.id}');
               if (skel) skel.style.display = 'none';
               img.classList.add('loaded');
             })(this)"
             onerror="(function(img){
               var skel = document.getElementById('q-img-skel-${q.id}');
               if (skel) skel.style.display = 'none';
               var err = document.getElementById('q-img-err-${q.id}');
               if (err) err.style.display = 'flex';
               img.style.display = 'none';
             })(this)">
      </div>
    </div>`;
  }

  // Task 12.3 — render an audio control bound to q.audio iff non-empty
  // (AC 7.1, 7.3). Mirrors `audioControlHtml` in audio/audioLogic.js; the Node
  // module isn't loadable in the browser, so the same conditional render is
  // inlined here. The Direct_Link is HTML-attribute-escaped before being
  // spliced into `src` so a URL that happens to contain `&`, `"`, or `<`
  // cannot break out of the attribute or inject markup.
  let audioHTML = '';
  if (q.audio) {
    const fileId = _driveFileIdFromLink(q.audio);
    if (fileId) {
      const audName = _resolveQuestionAudioName ? _resolveQuestionAudioName(q.audio) : 'Audio Soal';
      audioHTML = '<div class="mb-6 fade-in">' + _driveAudioHtml(q.audio, audName, 'exam') + '</div>';
    }
  }

  container.insertAdjacentHTML('beforeend', headerHTML + contentHTML + imageHTML + audioHTML);

  const optionsWrapper = document.createElement('div');
  optionsWrapper.className = 'space-y-4 fade-in';
  container.appendChild(optionsWrapper);

  if (q.type === 'PG') {
    q.options.forEach((optContent, idx) => {
      const isChecked = savedAns === optContent;
      const alphabet = String.fromCharCode(65 + idx);

      const optionDiv = document.createElement('div');
      optionDiv.className = `option-label ${isChecked ? 'checked' : ''} py-3 px-4 flex items-center cursor-pointer border border-slate-200 rounded-lg hover:bg-slate-50 transition mb-2 group`;

      optionDiv.onclick = function() {
        selectOption(q.id, optContent, this);
      };

      optionDiv.innerHTML = `
                <div class="custom-radio w-5 h-5 mr-3 flex-shrink-0 border-2 border-slate-300 rounded-full group-hover:border-blue-400 transition"></div> 
                <div class="flex-1 min-w-0">
                    <div class="flex items-center h-full"> <div class="text-slate-700 font-medium text-sm prose prose-sm max-w-none">
                            ${prepContent(optContent)} 
                        </div>
                    </div>
                </div>`;
            optionsWrapper.appendChild(optionDiv);
            makeImgsClickable(optionDiv);
          });
        }

  else if (q.type === 'PG_KOMPLEKS') {
    optionsWrapper.innerHTML += '<p class="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1"><i class="fas fa-check-double"></i> Pilih dua atau lebih jawaban yang benar:</p>';

    q.options.forEach((optContent, idx) => {
      const isChecked = savedAns.includes(optContent);
      const alphabet = String.fromCharCode(65 + idx);

      const boxClass = isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300';
      const containerClass = isChecked ? 'checked ring-1 ring-blue-200 bg-blue-50/30' : 'bg-white hover:bg-slate-50';
      const checkboxIcon = isChecked ? '<i class="fas fa-check text-white text-[10px]"></i>' : '';

      const optionDiv = document.createElement('div');
      optionDiv.className = `option-label ${containerClass} py-3 px-4 cursor-pointer border border-slate-200 rounded-lg flex items-center transition-all duration-200 mb-2 group`;

      optionDiv.onclick = function() {
        toggleComplexPG(q.id, optContent, this);
      };

      optionDiv.innerHTML = `
          <div class="w-5 h-5 mr-3 flex items-center justify-center border rounded ${boxClass} transition-colors box-indicator flex-shrink-0 group-hover:border-blue-400">
               ${checkboxIcon}
          </div>
          <div class="flex-1 min-w-0">
                        <div class="flex items-center h-full">
                            <div class="text-slate-700 font-medium text-sm prose prose-sm max-w-none">
                                ${prepContent(optContent)}
                            </div>
                        </div>
                    </div>`;
      optionsWrapper.appendChild(optionDiv);
      makeImgsClickable(optionDiv);
    });
  }

  else if (q.type === 'BS') {
    const instruction = document.createElement('p');
    instruction.className = "text-xs font-bold text-blue-600 mb-2 flex items-center gap-1";
    instruction.innerHTML = '<i class="fas fa-info-circle"></i> Tentukan Sesuai atau Tidak Sesuai:';
    optionsWrapper.appendChild(instruction);

    const tableDiv = document.createElement('div');
    tableDiv.className = "overflow-hidden border border-slate-200 rounded-xl shadow-sm";

    let tableHTML = `
        <table class="w-full text-sm text-left text-slate-600">
          <thead class="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" class="px-4 py-3 font-bold w-full">Pernyataan</th>
              <th scope="col" class="px-2 py-3 text-center font-bold w-24 border-l border-slate-200 bg-blue-50/50 text-blue-700">Sesuai</th>
              <th scope="col" class="px-2 py-3 text-center font-bold w-28 border-l border-slate-200 bg-red-50/50 text-red-700">Tidak Sesuai</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">`;

    if (!q.shuffledBSIndices) {
      q.shuffledBSIndices = q.options
        .map((_, i) => i)
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
    }

    q.shuffledBSIndices.forEach((originalIdx, displayPos) => {
      const stmt    = q.options[originalIdx];   
      const rowVal  = savedAns[originalIdx];    
      const rowClass = (displayPos % 2 === 0) ? 'bg-white' : 'bg-slate-50/50';

      tableHTML += `
            <tr class="${rowClass} hover:bg-blue-50 transition duration-150">
              <td class="px-4 py-3 font-medium text-slate-800 leading-relaxed prose prose-sm max-w-none">
                ${prepContent(stmt)}
              </td>
              <td class="px-2 py-3 text-center border-l border-slate-100 align-middle">
                <label class="cursor-pointer flex justify-center items-center h-full w-full p-2">
                  <input type="radio" name="bs_${q.id}_${originalIdx}"
                         onchange="saveComplexBS('${q.id}', '${originalIdx}', 'Benar')"
                         ${rowVal === 'Benar' ? 'checked' : ''}
                         class="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer">
                </label>
              </td>
              <td class="px-2 py-3 text-center border-l border-slate-100 align-middle">
                <label class="cursor-pointer flex justify-center items-center h-full w-full p-2">
                  <input type="radio" name="bs_${q.id}_${originalIdx}"
                         onchange="saveComplexBS('${q.id}', '${originalIdx}', 'Salah')"
                         ${rowVal === 'Salah' ? 'checked' : ''}
                         class="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300 cursor-pointer">
                </label>
              </td>
            </tr>`;
    });

    tableHTML += `</tbody></table>`;
    tableDiv.innerHTML = tableHTML;
    optionsWrapper.appendChild(tableDiv);
  }

  else if (q.type === 'JODOH') {
    const pairs = q.options;
    
    const lefts = pairs.map(p => p.q);

    if (!q.shuffledRights) {
        q.shuffledRights = pairs.map(p => p.a)
             .map(value => ({ value, sort: Math.random() }))
             .sort((a, b) => a.sort - b.sort)
             .map(({ value }) => value);
    }
    const rights = q.shuffledRights;

    const palettes = [
      ['emerald', 'border-emerald-500', 'bg-emerald-100', 'text-emerald-800', 'ring-emerald-400'],
      ['red', 'border-red-500', 'bg-red-100', 'text-red-800', 'ring-red-400'],
      ['blue', 'border-blue-500', 'bg-blue-100', 'text-blue-800', 'ring-blue-400'],
      ['amber', 'border-amber-500', 'bg-amber-100', 'text-amber-800', 'ring-amber-400'],
      ['purple', 'border-purple-500', 'bg-purple-100', 'text-purple-800', 'ring-purple-400'],
      ['pink', 'border-pink-500', 'bg-pink-100', 'text-pink-800', 'ring-pink-400'],
    ];

    const jodohGrid = document.createElement('div');
    jodohGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-slate-200";

    const leftCol = document.createElement('div');
    leftCol.className = "space-y-3";
    leftCol.innerHTML = '<p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-2">Pertanyaan</p>';

    lefts.forEach((it, i) => {
      if(!it || String(it).trim() === '') return;

      const theme = palettes[i % palettes.length];
      const isSelected = (typeof selectedLeft !== 'undefined' && selectedLeft === it);
      const isPaired = savedAns && savedAns[it];

      let btnClass = "";
      if (isSelected) {
        btnClass = `${theme[2]} ${theme[1]} ${theme[3]} ring-2 ${theme[4]} border-l-4`;
      } else if (isPaired) {
        btnClass = `${theme[2]} ${theme[1]} ${theme[3]} border-l-4`;
      } else {
        btnClass = `bg-white border-slate-200 text-slate-600 hover:bg-slate-50 border-l-4 border-l-${theme[0]}-400`;
      }

      const btn = document.createElement('button');
      btn.className = `w-full p-3.5 text-left rounded-lg border transition-all duration-200 shadow-sm font-medium text-sm flex justify-between items-center ${btnClass}`;
      btn.onclick = function() {
        selectMatchLeft(q.id, it, this);
      };
      btn.innerHTML = `<span>${prepContent(it)}</span> ${isPaired ? '<i class="fas fa-link text-xs opacity-60"></i>' : ''}`;

      leftCol.appendChild(btn);
      makeImgsClickable(btn);
    });

    const rightCol = document.createElement('div');
    rightCol.className = "space-y-3";
    rightCol.innerHTML = '<p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-2">Pilihan Jawaban</p>';

    rights.forEach((it) => {
      if(!it || String(it).trim() === '') return;

      let pairedColorIndex = -1;
      let isPairedRight = false;

      if (savedAns) {
        const foundKey = Object.keys(savedAns).find(key => savedAns[key] === it);
        if (foundKey) {
          isPairedRight = true;
          pairedColorIndex = lefts.indexOf(foundKey);
        }
      }

      let btnRightClass = "bg-white border-slate-200 text-slate-600 hover:bg-slate-50";
      
      if (isPairedRight && pairedColorIndex !== -1) {
        const theme = palettes[pairedColorIndex % palettes.length];
        if(theme) {
            btnRightClass = `${theme[2]} ${theme[1]} ${theme[3]} border-r-4 border-r-${theme[0]}-500`;
        }
      }

      const btn = document.createElement('button');
      btn.className = `w-full p-3.5 text-right rounded-lg border transition-all duration-200 shadow-sm font-medium text-sm ${btnRightClass}`;
      btn.onclick = function() {
        selectMatchRight(q.id, it, this);
      };
      btn.innerHTML = prepContent(it);

      rightCol.appendChild(btn);
      makeImgsClickable(btn);
    });

    jodohGrid.appendChild(leftCol);
    jodohGrid.appendChild(rightCol);

    const jodohWrapper = document.createElement('div');
    jodohWrapper.className = 'space-y-2';

    const pairedCount = savedAns ? Object.keys(savedAns).length : 0;
    const totalLefts  = lefts.filter(it => it && String(it).trim() !== '').length;

    const resetBar = document.createElement('div');
    resetBar.className = 'flex items-center justify-between px-1 mb-1';
    resetBar.innerHTML = `
      <div class="text-xs text-slate-400 font-medium">
        <i class="fas fa-link mr-1"></i>
        Terpasang: <span id="jodoh-paired-count" class="font-bold text-slate-600">${pairedCount}</span> / ${totalLefts}
      </div>
      <button
        type="button"
        id="btn-reset-jodoh"
        onclick="resetJodohAnswers('${q.id}')"
        ${pairedCount === 0 ? 'disabled' : ''}
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all
               ${pairedCount === 0
                 ? 'text-slate-300 border-slate-200 cursor-not-allowed bg-slate-50'
                 : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 active:scale-95 cursor-pointer'}"
        title="${pairedCount === 0 ? 'Belum ada pasangan yang dibuat' : 'Hapus semua pasangan jawaban'}">
        <i class="fas fa-undo-alt text-[10px]"></i>
        Reset Jawaban
      </button>`;

    jodohWrapper.appendChild(resetBar);
    jodohWrapper.appendChild(jodohGrid);
    optionsWrapper.appendChild(jodohWrapper);
  }

  else {
    const isCanvasAns = typeof savedAns === 'string' && savedAns.startsWith('data:image/');

    const esaiWrapper = document.createElement('div');
    esaiWrapper.className = 'essay-wrapper space-y-3';
    esaiWrapper.setAttribute('data-qid', q.id);

    const canvasEnabled = (window._essayCanvasEnabled !== false);

    const tabBar = document.createElement('div');
    tabBar.className = 'flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit';
    tabBar.style.display = canvasEnabled ? '' : 'none';
    tabBar.innerHTML = `
      <button class="essay-tab-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                     ${!isCanvasAns ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
              data-mode="text" onclick="switchEssayMode('${q.id}', 'text', this)">
        <i class="fas fa-keyboard mr-1.5"></i>Teks
      </button>
      <button class="essay-tab-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                     ${isCanvasAns  ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}"
              data-mode="canvas" onclick="switchEssayMode('${q.id}', 'canvas', this)">
        <i class="fas fa-pen-fancy mr-1.5"></i>Gambar / Rumus
      </button>`;

    const textArea = document.createElement('textarea');
    textArea.id        = `essay-text-${q.id}`;
    textArea.className = 'essay-text-area w-full border border-slate-300 rounded-xl p-4 ' +
                         'focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition ' +
                         'text-sm text-slate-700 leading-relaxed shadow-inner bg-slate-50 focus:bg-white resize-none';
    textArea.placeholder = 'Ketuk di sini untuk mulai mengetik...';
    textArea.setAttribute('data-essay-input', 'true');
    // Opsi B: cegah keyboard sistem muncul — custom keyboard yang dipakai
    textArea.setAttribute('inputmode', 'none');
    textArea.setAttribute('readonly', 'true');

    if (q.minCharEnabled && q.minChar > 0) {
      textArea.dataset.minChar        = String(q.minChar);
      textArea.dataset.minCharEnabled = 'true';
    }

    // Set nilai jawaban sebelum readonly diaplikasikan (aman untuk semua browser)
    if (!isCanvasAns) textArea.value = savedAns || '';
    if (isCanvasAns)  textArea.style.display = 'none';

    textArea.oninput = function() {
      autoDetectTextDirection(this);
      _updateEssayCharCounter(this, q.id);
    };

    const charCounterDiv = document.createElement('div');
    charCounterDiv.id        = `essay-char-counter-${q.id}`;
    charCounterDiv.className = 'hidden text-right text-xs mt-1 transition-colors';
    textArea.addEventListener('focus', () => {
      isKeyboardSafeMode = true;
      window._essayKeyboardActive = true;
      // Tampilkan custom keyboard
      _ckShow(q.id);
    });
    // Juga handle tap/click langsung (beberapa browser tidak trigger focus pada readonly)
    textArea.addEventListener('click', () => {
      isKeyboardSafeMode = true;
      window._essayKeyboardActive = true;
      _ckShow(q.id);
    });
    textArea.addEventListener('touchend', () => {
      isKeyboardSafeMode = true;
      window._essayKeyboardActive = true;
      _ckShow(q.id);
    });
    textArea.addEventListener('blur', function() {
      saveAnswer(q.id, this.value);
      clearTimeout(window._essayKeyboardTimer);
      window._essayKeyboardTimer = setTimeout(() => {
        window._essayKeyboardActive = false;
        isKeyboardSafeMode = false;
      }, 3000);
    });

    const canvasWrapper = document.createElement('div');
    canvasWrapper.id        = `essay-canvas-wrapper-${q.id}`;
    canvasWrapper.className = 'essay-canvas-wrapper rounded-xl border border-slate-300 overflow-hidden shadow-inner bg-white';
    if (!isCanvasAns) canvasWrapper.style.display = 'none';

    canvasWrapper.innerHTML = `
      <!-- Toolbar atas -->
      <div class="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 flex-wrap">

        <!-- Grup: Pena / Tipe garis -->
        <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          <button class="canvas-tool-btn active w-7 h-7 flex items-center justify-center rounded-md transition"
                  data-tool="pen" title="Pena" onclick="setCanvasTool('${q.id}','pen',this)">
            <i class="fas fa-pen text-[11px]"></i>
          </button>
          <button class="canvas-tool-btn w-7 h-7 flex items-center justify-center rounded-md transition"
                  data-tool="eraser" title="Penghapus" onclick="setCanvasTool('${q.id}','eraser',this)">
            <i class="fas fa-eraser text-[11px]"></i>
          </button>
        </div>

        <!-- Grup: Ukuran kuas -->
        <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
          <button class="canvas-size-btn active w-7 h-7 flex items-center justify-center rounded-md transition"
                  data-size="2" title="Tipis" onclick="setCanvasSize('${q.id}',2,this)">
            <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
          </button>
          <button class="canvas-size-btn w-7 h-7 flex items-center justify-center rounded-md transition"
                  data-size="4" title="Sedang" onclick="setCanvasSize('${q.id}',4,this)">
            <span class="w-2.5 h-2.5 rounded-full bg-current"></span>
          </button>
          <button class="canvas-size-btn w-7 h-7 flex items-center justify-center rounded-md transition"
                  data-size="8" title="Tebal" onclick="setCanvasSize('${q.id}',8,this)">
            <span class="w-3.5 h-3.5 rounded-full bg-current"></span>
          </button>
        </div>

        <!-- Pemilih warna -->
        <div class="flex items-center gap-1">
          ${['#1e293b','#2563eb','#dc2626','#16a34a','#9333ea','#ea580c']
              .map(c => `<button class="canvas-color-btn w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 active:scale-95"
                                 style="background:${c}; border-color: ${c === '#1e293b' ? '#94a3b8' : 'transparent'}"
                                 data-color="${c}" title="${c}"
                                 onclick="setCanvasColor('${q.id}','${c}',this)"></button>`).join('')}
          <input type="color" id="canvas-color-custom-${q.id}"
                 class="w-6 h-6 rounded-full cursor-pointer border-2 border-slate-300 p-0 overflow-hidden"
                 title="Warna kustom"
                 onchange="setCanvasColor('${q.id}',this.value,this)"
                 value="#1e293b">
        </div>

        <div class="flex-1"></div>

        <!-- Undo / Clear -->
        <button class="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-slate-500
                       bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                title="Urungkan satu langkah" onclick="canvasUndo('${q.id}')">
          <i class="fas fa-undo text-[10px]"></i> Undo
        </button>
        <button class="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-500
                       bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
                title="Hapus seluruh kanvas" onclick="canvasClear('${q.id}')">
          <i class="fas fa-trash-alt text-[10px]"></i> Hapus Semua
        </button>
      </div>

      <!-- Canvas area -->
      <div class="relative select-none touch-none" style="height:320px; background:#fff; cursor:crosshair;">
        <!-- Garis bantu tipis (grid dot) -->
        <canvas id="essay-canvas-${q.id}"
                class="absolute inset-0 w-full h-full block"
                style="touch-action:none;">
        </canvas>
        <!-- Watermark kosong -->
        <div id="essay-canvas-hint-${q.id}"
             class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-30">
          <i class="fas fa-signature text-5xl text-slate-300 mb-2"></i>
          <p class="text-xs text-slate-400 font-medium">Tulis rumus atau gambar di sini</p>
          <p class="text-[10px] text-slate-300 mt-0.5">Gunakan jari (mobile) atau mouse (desktop)</p>
        </div>
      </div>

      <!-- Status bar bawah -->
      <div class="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400">
        <span id="essay-canvas-status-${q.id}">Belum ada coretan</span>
        <div class="flex items-center gap-2">
          <span>💡 Tip: Gunakan <b>Undo</b> jika salah menggambar</span>
          <!-- Tombol Konversi ke LaTeX -->
          <button id="canvas-convert-btn-${q.id}"
                  onclick="convertCanvasToLatex('${q.id}', this)"
                  class="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold
                         text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800
                         rounded-lg transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Konversi gambar rumus ke LaTeX otomatis menggunakan AI">
            <i class="fas fa-magic text-[10px]"></i>
            <span>Konversi ke LaTeX</span>
          </button>
        </div>
      </div>`;

    esaiWrapper.appendChild(tabBar);

    // Bungkus textarea + charCounter + drag handle dalam satu container
    const taWrap = document.createElement('div');
    taWrap.className = 'essay-ta-wrap';
    taWrap.id = `essay-ta-wrap-${q.id}`;

    taWrap.appendChild(textArea);
    taWrap.appendChild(charCounterDiv);

    // Drag handle untuk resize manual
    const dragHandle = document.createElement('div');
    dragHandle.className = 'essay-ta-drag-handle';
    dragHandle.id = `essay-ta-drag-${q.id}`;
    dragHandle.title = 'Seret untuk mengatur tinggi area jawaban';
    dragHandle.innerHTML = '<span></span>';
    _ckAttachDragHandle(dragHandle, textArea);
    taWrap.appendChild(dragHandle);

    esaiWrapper.appendChild(taWrap);
    esaiWrapper.appendChild(canvasWrapper);

    if (!canvasEnabled) {
      canvasWrapper.style.display = 'none';
      textArea.style.display = ''; 
    }

    const mathToolsWrapper = document.createElement('div');
    mathToolsWrapper.id = `math-tools-wrap-${q.id}`;
    // Math tools lama disembunyikan — simbol matematika sudah digabung ke custom keyboard tab Math
    mathToolsWrapper.style.display = 'none';

    if (isCanvasAns) mathToolsWrapper.style.display = 'none';
    esaiWrapper.insertBefore(mathToolsWrapper, canvasWrapper);

    optionsWrapper.appendChild(esaiWrapper);

    requestAnimationFrame(() => {
      // renderEssayMathTools tidak lagi dipanggil karena digantikan custom keyboard
      // (mathToolsWrapper tetap ada di DOM agar switchEssayMode tidak error)
      initEssayCanvas(q.id, isCanvasAns ? savedAns : null);

      _updateEssayCharCounter(textArea, q.id);
      // Auto-resize berdasarkan nilai jawaban yang sudah tersimpan
      if (!isCanvasAns && textArea.value) _ckAutoResize(textArea);
    });
  }

  if (typeof MathJax !== 'undefined') MathJax.typesetPromise();

  // Aktifkan klik-zoom untuk SEMUA gambar di dalam soal:
  // - gambar di teks konten soal (dari TinyMCE / HTML rich text)
  // - gambar di setiap opsi jawaban (PG, PG_KOMPLEKS, BS, JODOH)
  // makeImgsClickable sudah dipanggil per-opsi di atas, tapi gambar
  // yang tertanam di contentHTML (insertAdjacentHTML) belum tercakup.
  // Memanggil sekali pada seluruh container memastikan tidak ada yang terlewat,
  // termasuk gambar yang di-render oleh MathJax atau konten dinamis lainnya.
  // Flag 'no-zoom' tetap dihormati di dalam makeImgsClickable.
  makeImgsClickable(container);

  const btnPrev = document.getElementById('btn-prev');
  if (btnPrev) {
    btnPrev.className = 'exam-nav-prev';
    btnPrev.disabled = (index === 0);
  }

  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    if (index === questions.length - 1) {
      btnNext.className = 'exam-nav-next';
      btnNext.style.background = '#16a34a'; 
      btnNext.style.boxShadow  = '0 4px 12px rgba(22,163,74,0.35)';
      btnNext.innerHTML = 'Selesai <i class="fas fa-flag-checkered"></i>';
      btnNext.setAttribute('onclick', 'finishExamManual()');
    } else {
      btnNext.className = 'exam-nav-next';
      btnNext.style.background = '';
      btnNext.style.boxShadow  = '';
      btnNext.innerHTML = 'Selanjutnya <i class="fas fa-arrow-right"></i>';
      btnNext.setAttribute('onclick', 'nextQ()');
    }
  }

  if (typeof updateNavStyle === 'function') updateNavStyle();
  const mainArea = document.getElementById('main-exam-area');
  if (mainArea) mainArea.scrollTo(0, 0);
}

function toggleComplexPG(qid, val, el) {
  let curr = answers[qid];
  if (!Array.isArray(curr)) curr = [];

  const idx = curr.indexOf(val);

  if (idx > -1) {

    curr.splice(idx, 1);
    el.classList.remove('checked', 'ring-1', 'ring-blue-200', 'bg-blue-50/30');
    el.classList.add('bg-white');
    const box = el.querySelector('.box-indicator');
    box.classList.remove('bg-blue-600', 'border-blue-600');
    box.classList.add('bg-white', 'border-slate-300');
    box.innerHTML = '';
  } else {
    curr.push(val);
    el.classList.add('checked', 'ring-1', 'ring-blue-200', 'bg-blue-50/30');
    el.classList.remove('bg-white');
    const box = el.querySelector('.box-indicator');
    box.classList.remove('bg-white', 'border-slate-300');
    box.classList.add('bg-blue-600', 'border-blue-600');
    box.innerHTML = '<i class="fas fa-check text-white text-[10px]"></i>';
  }

  answers[qid] = curr;
  updateNavStyle();

  // BUG FIX #14: sebelumnya syncAnswers dipanggil langsung (tanpa debounce)
  // sehingga setiap klik checkbox memicu API call tersendiri — boros dan
  // rawan race condition jika siswa klik cepat. Samakan dengan tipe lain.
  debouncedSync();
}

function selectOption(qid, val, el) {
  const siblings = el.parentElement.querySelectorAll('.option-label');
  siblings.forEach(sib => sib.classList.remove('checked'));

  el.classList.add('checked');
  saveAnswer(qid, val);
}

function renderNavGrid() {
  document.getElementById('nav-grid').innerHTML = questions.map((q, i) =>
    `<button id="nav-btn-${i}" onclick="renderQuestion(${i})" class="nav-btn-modern">
        ${i+1}
     </button>`
  ).join('');
  updateNavStyle();
}

// ── Fungsi handler untuk dropdown filter tipe di control bar ──
// Sinkron dengan filterByTypeCard agar kedua mekanisme filter (card klik & dropdown) konsisten
function _qbFilterBySelectType(type) {
  _activeTypeFilter = type || null;

  const searchInput = document.getElementById('question-search-input');
  const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

  filteredQuestions = allQuestionsData.filter(q => {
    const matchType   = !_activeTypeFilter || q.type === _activeTypeFilter;
    const content = (q.content || '').toLowerCase();
    const qtype   = (q.type || '').toLowerCase();
    const key     = (q.key || '').toLowerCase();
    const matchSearch = !term || content.includes(term) || qtype.includes(term) || key.includes(term);
    return matchType && matchSearch;
  });

  currentQPage = 1;
  _refreshTypeCardVisuals();
  renderQuestionsInternal();
}

function filterByTypeCard(type) {
  if (_activeTypeFilter === type) {
    _activeTypeFilter = null;
  } else {
    _activeTypeFilter = type;
  }

  const searchInput = document.getElementById('question-search-input');
  const term = searchInput ? searchInput.value.toLowerCase().trim() : '';

  filteredQuestions = allQuestionsData.filter(q => {
    const matchType   = !_activeTypeFilter || q.type === _activeTypeFilter;
    // BUG FIX: null guard pada q.content dan q.key agar tidak throw saat data kosong
    const content = (q.content || '').toLowerCase();
    const qtype   = (q.type || '').toLowerCase();
    const key     = (q.key || '').toLowerCase();
    const matchSearch = !term ||
      content.includes(term) ||
      qtype.includes(term) ||
      key.includes(term);
    return matchType && matchSearch;
  });

  currentQPage = 1;

  _refreshTypeCardVisuals();

  // Sync dropdown filter tipe agar konsisten dengan card click
  const typeFilterSel = document.getElementById('q-type-filter-select');
  if (typeFilterSel) typeFilterSel.value = _activeTypeFilter || '';

  renderQuestionsInternal();
}

function _refreshTypeCardVisuals() {
  const allTypes = ['PG', 'PG_KOMPLEKS', 'BS', 'JODOH', 'Esai'];
  allTypes.forEach(t => {
    const card = document.getElementById('type-card-' + t);
    if (!card) return;
    if (_activeTypeFilter === null) {
      card.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500', 'scale-[1.04]', 'shadow-lg', 'opacity-40');
    } else if (_activeTypeFilter === t) {
      card.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500', 'scale-[1.04]', 'shadow-lg');
      card.classList.remove('opacity-40');
    } else {
      card.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500', 'scale-[1.04]', 'shadow-lg');
      card.classList.add('opacity-40');
    }
  });

  const badge = document.getElementById('type-filter-badge');
  if (badge) {
    if (_activeTypeFilter) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

function handleQuestionSearch(keyword) {
    const term = keyword.toLowerCase().trim();
    filteredQuestions = allQuestionsData.filter(q => {
        const matchType   = !_activeTypeFilter || q.type === _activeTypeFilter;
        // BUG FIX: null guard pada q.content dan q.key
        const content = (q.content || '').toLowerCase();
        const qtype   = (q.type || '').toLowerCase();
        const key     = (q.key || '').toLowerCase();
        const matchSearch = !term ||
          content.includes(term) ||
          qtype.includes(term) ||
          key.includes(term);
        return matchType && matchSearch;
    });
    currentQPage = 1;
    renderQuestionsInternal();
}

function changeQRowsPerPage(val) {
    if (val === 'all') {
        // BUG FIX: gunakan allQuestionsData sebagai fallback agar 'all' tidak terkunci ke 10
        // ketika filteredQuestions sedang kosong karena filter/search aktif.
        const total = filteredQuestions.length > 0 ? filteredQuestions.length : (allQuestionsData.length || 10);
        qRowsPerPage = total;
    } else {
        qRowsPerPage = parseInt(val) || 10;
    }
    currentQPage = 1;
    renderQuestionsInternal();
}

function changeQPage(direction) {
    if (direction === 'prev') {
        if (currentQPage > 1) currentQPage--;
    } else if (direction === 'next') {
        const maxPage = Math.ceil(filteredQuestions.length / qRowsPerPage);
        if (currentQPage < maxPage) currentQPage++;
    }
    renderQuestionsInternal();
}

function updateNavStyle() {
    questions.forEach((q, i) => {
      const btn = document.getElementById(`nav-btn-${i}`);
      if (!btn) return;

      // BUG FIX #8: cek Array.isArray lebih dulu sebelum typeof 'object'
      // karena Array juga bertipe 'object'. Ini memastikan jawaban PG_KOMPLEKS
      // (berupa Array) dievaluasi dengan benar.
      let isAns = answers[q.id];
      if (Array.isArray(isAns)) isAns = isAns.length > 0;
      else if (typeof isAns === 'object' && isAns !== null) isAns = Object.keys(isAns).length > 0;
      else if (typeof isAns === 'string') isAns = isAns.trim() !== '';
      else isAns = false;

      btn.className = 'nav-btn-modern';
      btn.classList.remove('nav-btn-answered', 'nav-btn-current');

      if (i === currentQIndex) {
        btn.classList.add('nav-btn-current');
      } else if (isAns) {
        btn.classList.add('nav-btn-answered');
      }
    });
  }

    function selectMatchLeft(qid, val, el) {
        // BUG FIX #4: selector '.match-left' tidak pernah cocok karena tombol
        // kiri JODOH tidak diberi class tersebut saat di-render.
        // Solusi: reset semua tombol di kolom kiri (parent .space-y-3 di leftCol)
        // lalu highlight tombol yang diklik.
        const leftCol = el.closest('.space-y-3');
        if (leftCol) {
          leftCol.querySelectorAll('button').forEach(b => {
            b.classList.remove('ring-2', 'ring-cyan-500', 'bg-cyan-200');
          });
        }
        el.classList.add('ring-2','ring-cyan-500','bg-cyan-200');
        selectedLeft = val;
    }
    
    function selectMatchRight(qid, val, el) {
        if (!selectedLeft) {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'info',
            title: 'Pilih pernyataan di sisi kiri terlebih dahulu!',
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true
          });
          return;
        }

        if (!answers[qid]) answers[qid] = {};

        const existingOwner = Object.keys(answers[qid]).find(k => answers[qid][k] === val);

        if (existingOwner && existingOwner !== selectedLeft) {
          Swal.fire({
            toast: true,
            position: 'top',
            icon: 'warning',
            title: 'Pilihan jawaban ini sudah digunakan!',
            html: `<span style="font-size:0.82rem;color:#475569;">Setiap pernyataan harus memiliki pasangan yang berbeda-beda.<br>Pilih jawaban lain yang belum dipakai.</span>`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: { popup: 'swal2-toast' }
          });
          selectedLeft = null;
          renderQuestion(currentQIndex);
          return;
        }

        answers[qid][selectedLeft] = val;
        selectedLeft = null;
        renderQuestion(currentQIndex);
        debouncedSync();
    }

    function resetJodohAnswers(qid) {
        answers[qid] = {};
        selectedLeft = null;
        renderQuestion(currentQIndex);
        debouncedSync();
    }

    let _syncTimer = null;

    function debouncedSync() {
      clearTimeout(_syncTimer);
      _syncTimer = setTimeout(() => {
        if (currentUser && currentExam) {
          google.script.run
            .withFailureHandler(err => console.error('Auto-save gagal:', err))
            .syncAnswers(currentUser.userID, currentExam.id, answers, violationCount);
        }
      }, 3000);
    }

    function saveAnswer(qid, val) {
      answers[qid] = val;
      updateNavStyle();
      debouncedSync();
    }

function saveComplexBS(qid, index, val) {
    if (!answers[qid] || typeof answers[qid] !== 'object') {
        answers[qid] = {};
    }
    answers[qid][String(index)] = val;
    updateNavStyle();
    console.log(`Tersimpan Soal BS Kompleks [${qid}] Baris [${index}]: ${val}`);
    debouncedSync();
  }
    // BUG FIX #1: Duplikat renderNavGrid dan updateNavStyle dihapus.
    // Versi lama menggunakan class Tailwind inline yang menimpa class
    // nav-btn-modern sehingga styling CSS tidak pernah teraplikasi.
    // Versi modern (di atas) sudah menangani semua kasus dengan benar.

    function prevQ() { if(currentQIndex > 0) renderQuestion(currentQIndex - 1); }

    function validateQuestionAnswer(q) {
        const ans = answers[q.id];
        const isReq = String(q.isRequired).toUpperCase().trim() === 'TRUE';

        if (q.type === 'PG_KOMPLEKS') {
            const checked = Array.isArray(ans) ? ans : [];
            // BUG FIX #7 (diperbarui): Bedakan antara "belum memilih" vs "pilih kurang dari 2":
            // - Soal wajib + 0 pilihan → error "wajib diisi"
            // - Soal opsional + 0 pilihan → lolos (tidak wajib)
            // - Sudah ada pilihan tapi < 2 → error "pilih lebih dari satu" (selalu, wajib/opsional)
            if (checked.length === 0) {
                if (isReq) return '⚠️ Soal ini <b>wajib diisi</b>. Pilih setidaknya dua jawaban yang benar.';
                return null;
            }
            if (checked.length < 2) {
                return '📋 Soal Pilihan Ganda Kompleks:\nAnda harus memilih <b>lebih dari satu</b> jawaban yang benar.';
            }
        }

        else if (q.type === 'BS') {
            const totalRows = Array.isArray(q.options) ? q.options.length : 0;
            const ansObj = (typeof ans === 'object' && ans !== null && !Array.isArray(ans)) ? ans : {};
            const filledRows = Object.keys(ansObj).length;
            if (filledRows === 0 && !isReq) return null; 
            if (filledRows < totalRows) {
                const belum = totalRows - filledRows;
                return `☑️ Soal Benar/Salah:\nMasih ada <b>${belum} baris pernyataan</b> yang belum dipilih.<br>Pastikan setiap baris sudah dipilih Sesuai atau Tidak Sesuai.`;
            }
        }

        else if (q.type === 'Esai') {
            const text = (typeof ans === 'string') ? ans.trim() : '';
            if (text.length === 0 && !isReq) return null; 
        }

        else if (q.type === 'JODOH') {
            const pairs = Array.isArray(q.options) ? q.options : [];
            const validLefts = pairs.filter(p => p.q && String(p.q).trim() !== '');
            const totalPairs = validLefts.length;
            const ansObj = (typeof ans === 'object' && ans !== null && !Array.isArray(ans)) ? ans : {};
            const pairedCount = Object.keys(ansObj).length;
            if (pairedCount === 0 && !isReq) return null; 
            if (pairedCount < totalPairs) {
                const belum = totalPairs - pairedCount;
                return `🔗 Soal Menjodohkan:\nMasih ada <b>${belum} baris pernyataan</b> yang belum dipasangkan.<br>Pastikan semua baris sudah dijodohkan.`;
            }
        }

        else if (isReq) {
            const hasAnswer = ans && String(ans).trim() !== '';
            const isObjFilled = typeof ans === 'object' && ans !== null && Object.keys(ans).length > 0;
            if (!hasAnswer && !isObjFilled) {
                return '⚠️ Soal ini <b>wajib diisi</b> sebelum melanjutkan.';
            }
        }

        return null; 
    }

    function nextQ() {
        const q = questions[currentQIndex];
        // BUG FIX #10: sebelumnya ada dua blok validasi terpisah (cek isReq manual
        // + validateQuestionAnswer). Ini menyebabkan soal PG_KOMPLEKS memunculkan
        // toast "wajib diisi" dulu, lalu dialog "pilih lebih dari satu" jika sudah ada
        // 1 pilihan — dua pesan berbeda untuk kasus yang sama.
        // Solusi: delegasikan semua validasi ke validateQuestionAnswer saja; 
        // hanya untuk soal wajib yang benar-benar kosong tampilkan toast ringkas.
        const validationError = validateQuestionAnswer(q);
        if (validationError) {
            Swal.fire({
                title: 'Jawaban Belum Sesuai!',
                html: `<p class="text-sm text-slate-600 mt-1">${validationError}</p>`,
                icon: 'warning',
                confirmButtonText: 'Perbaiki Jawaban',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        if (currentQIndex < questions.length - 1) {
            renderQuestion(currentQIndex + 1);
        }
    }

    function toggleExamNav() {
      const nav     = document.getElementById('exam-nav');
      const overlay = document.getElementById('exam-nav-overlay');
      if (!nav) return;

      const isHidden = nav.classList.contains('translate-x-full');

      nav.classList.remove('nav-hidden');

      if (isHidden) {
        nav.classList.remove('translate-x-full');
        if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); }
      } else {
        nav.classList.add('translate-x-full');
        if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); }
      }
    }

    let _examNavDesktopVisible = false;

    function toggleExamNavDesktop() {
      const nav   = document.getElementById('exam-nav');
      const label = document.getElementById('nav-toggle-label');
      const btn   = document.getElementById('btn-nav-toggle-desktop');
      if (!nav) return;

      _examNavDesktopVisible = !_examNavDesktopVisible;

      if (_examNavDesktopVisible) {
        nav.classList.remove('nav-hidden');
        if (label) label.textContent = 'Sembunyikan';
        if (btn)   btn.title = 'Sembunyikan Navigasi Soal';
      } else {
        nav.classList.add('nav-hidden');
        if (label) label.textContent = 'Navigasi';
        if (btn)   btn.title = 'Tampilkan Navigasi Soal';
      }
    }

    let _wakeLockVisHandler = null;
    let _wakeLockIntentionalRelease = false;

    async function requestWakeLock() {
      if (!('wakeLock' in navigator)) {
        console.warn("Wake Lock API tidak didukung browser ini.");
        return;
      }
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log("Wake Lock AKTIF — Layar tidak akan mati.");

        wakeLock.addEventListener('release', () => {
          if (!_wakeLockIntentionalRelease) {
            console.log("Wake Lock dilepas browser. Akan dipulihkan saat halaman aktif kembali.");
          }
        });

        if (_wakeLockVisHandler) {
          document.removeEventListener('visibilitychange', _wakeLockVisHandler);
        }
        _wakeLockVisHandler = async () => {
          if (document.visibilityState === 'visible' && !_wakeLockIntentionalRelease) {
            try {
              wakeLock = await navigator.wakeLock.request('screen');
              console.log("Wake Lock dipulihkan setelah halaman kembali aktif.");
            } catch(e) {}
          }
        };
        document.addEventListener('visibilitychange', _wakeLockVisHandler);

      } catch(e) {
        console.warn("Wake Lock gagal diaktifkan:", e.message);
      }
    }

    function releaseWakeLock() {
      _wakeLockIntentionalRelease = true; 
      if (_wakeLockVisHandler) {
        document.removeEventListener('visibilitychange', _wakeLockVisHandler);
        _wakeLockVisHandler = null;
      }
      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
      }
      _wakeLockIntentionalRelease = false; 
    }

    let _fsConfirmActive = false;
    function setExamBlur(active) {
      const examPage = document.getElementById('page-exam');
      if (!examPage) return;
      if (active) {
        examPage.classList.add('exam-content-blur');
      } else {
        examPage.classList.remove('exam-content-blur');
      }
    }

    function showFullscreenExitConfirm(source = 'fullscreen') {
      const isWinKey = (source === 'winkey');

      if (timerInterval) clearInterval(timerInterval);

      setExamBlur(true);

      let countdown = 15;
      let countdownInterval;

      const remainingSec = window.remainingSeconds || 0;
      const h = Math.floor(remainingSec / 3600);
      const m = Math.floor((remainingSec % 3600) / 60);
      const s = remainingSec % 60;
      const timeStr = h > 0
        ? `${h} jam ${m} menit ${s} detik`
        : m > 0
          ? `${m} menit ${s} detik`
          : `${s} detik`;

      const sisaKesempatan = MAX_FULLSCREEN_EXIT - fullscreenExitCount;
      const isLastChance = sisaKesempatan <= 0;

      const badgeColor = sisaKesempatan > 1 ? '#16a34a' : '#dc2626';
      const badgeBg    = sisaKesempatan > 1 ? '#f0fdf4' : '#fef2f2';
      const badgeBorder= sisaKesempatan > 1 ? '#bbf7d0' : '#fecaca';

      Swal.fire({
        title: isWinKey ? '⊞ Tombol Windows Terdeteksi!' : 'Mode Layar Penuh Dinonaktifkan',
        html: `
          <div style="text-align:left; font-size:0.9rem; line-height:1.7;">
            <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:10px; padding:14px 16px; margin-bottom:16px; display:flex; gap:12px; align-items:flex-start;">
              <i class="fas fa-${isWinKey ? 'keyboard' : 'exclamation-triangle'}" style="color:#d97706; font-size:1.3rem; margin-top:2px; flex-shrink:0;"></i>
              <div>
                <p style="font-weight:700; color:#92400e; margin:0 0 4px;">Ujian Sedang Berlangsung!</p>
                <p style="color:#78350f; margin:0; font-size:0.82rem;">
                  ${isWinKey
                    ? 'Sistem mendeteksi penekanan <strong>Tombol Windows (⊞ Win)</strong> pada keyboard Anda. Tombol ini membuka Start Menu dan mengakibatkan layar penuh berakhir.'
                    : 'Sistem mendeteksi Anda keluar dari mode layar penuh.'}
                </p>
              </div>
            </div>

            <p style="color:#374151; margin:0 0 10px;">
              ${isWinKey
                ? 'Ini kemungkinan terjadi karena <strong>tidak sengaja</strong>. Harap lebih berhati-hati — hindari menekan tombol Windows selama ujian berlangsung.'
                : 'Kemungkinan ini terjadi karena <strong>tidak sengaja</strong> — silakan kembali ke mode layar penuh untuk melanjutkan ujian.'}
            </p>

            ${isWinKey ? `
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 14px; margin-bottom:14px; font-size:0.82rem; color:#1e40af; display:flex; gap:8px; align-items:flex-start;">
              <i class="fas fa-lightbulb" style="margin-top:2px; flex-shrink:0;"></i>
              <span>Tips: Tombol <strong>⊞ Win</strong> biasanya berada di pojok kiri bawah keyboard, di antara tombol <strong>Ctrl</strong> dan <strong>Alt</strong>. Hindari area tersebut selama mengerjakan ujian.</span>
            </div>` : ''}

            <div style="background:${badgeBg}; border:1px solid ${badgeBorder}; border-radius:8px; padding:10px 14px; margin-bottom:14px; font-size:0.85rem; display:flex; align-items:center; gap:10px;">
              <i class="fas fa-shield-alt" style="color:${badgeColor}; font-size:1.1rem;"></i>
              <div>
                <strong style="color:${badgeColor};">Pelanggaran ke-${fullscreenExitCount} dari ${MAX_FULLSCREEN_EXIT}</strong><br>
                <span style="color:#374151; font-size:0.78rem;">
                  ${sisaKesempatan > 0
                    ? `Sisa <strong>${sisaKesempatan}</strong> kesempatan. Jika melebihi batas, ujian akan <strong>dihentikan otomatis</strong>.`
                    : `<strong style="color:#dc2626;">Ini adalah kesempatan TERAKHIR Anda!</strong> Jika melanggar lagi, ujian langsung dihentikan.`
                  }
                </span>
              </div>
            </div>

            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px; margin-bottom:14px; font-size:0.82rem; color:#166534;">
              <i class="fas fa-clock" style="margin-right:6px;"></i>
              Sisa waktu ujian Anda: <strong>${timeStr}</strong>
            </div>

            <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:10px 14px; font-size:0.82rem; color:#991b1b;">
              <i class="fas fa-hourglass-half" style="margin-right:6px;"></i>
              Jika tidak kembali dalam <strong id="fs-countdown">${countdown}</strong> detik, 
              ujian Anda akan <strong>dikirim otomatis</strong>.
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-expand" style="margin-right:6px;"></i> Kembali ke Layar Penuh',
        cancelButtonText: 'Kirim & Akhiri Ujian',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#dc2626',
        allowOutsideClick: false,
        allowEscapeKey: false,
        reverseButtons: false,
        didOpen: () => {
          countdownInterval = setInterval(() => {
            countdown--;
            const el = document.getElementById('fs-countdown');
            if (el) {
              el.textContent = countdown;
              if (countdown <= 5) {
                el.style.color = '#dc2626';
                el.style.fontSize = '1.1em';
              }
            }
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              setExamBlur(false); 
              Swal.close();
              _fsConfirmActive = false;
              handleSecurityTrigger(isWinKey
                ? 'Tidak kembali ke layar penuh setelah menekan Tombol Windows (batas waktu habis)'
                : 'Tidak kembali ke layar penuh dalam batas waktu');
            }
          }, 1000);
        },
        willClose: () => {
          clearInterval(countdownInterval);
          setExamBlur(false);
        }
      }).then(result => {
        _fsConfirmActive = false;
        setExamBlur(false); 

        if (result.isConfirmed) {
          enterFullscreen();
          // BUG FIX #6: Gunakan window.remainingSeconds yang sudah tersinkron
          // oleh startTimer. Jika nilainya 0 atau undefined (misalnya ujian belum
          // dimulai dengan benar), fallback ke 60 detik sebagai pengaman.
          const secLeft = (typeof window.remainingSeconds === 'number' && window.remainingSeconds > 0)
            ? window.remainingSeconds
            : 60;
          startTimer(secLeft);

        } else {
          if (result.isDismissed && result.dismiss !== Swal.DismissReason.timer) {
            handleSecurityTrigger(isWinKey
              ? 'Siswa memilih mengakhiri ujian setelah menekan Tombol Windows'
              : 'Siswa memilih mengakhiri ujian saat keluar layar penuh');
          }
        }
      });
    }

    function handleWindowsKeyPress() {
      const examPage = document.getElementById('page-exam');
      if (!examPage || examPage.classList.contains('hidden')) return;

      if (_winKeyJustPressed || _fsConfirmActive) return;

      _winKeyJustPressed = true;
      if (_winKeyTimer) clearTimeout(_winKeyTimer);
      _winKeyTimer = setTimeout(() => {
        _winKeyJustPressed = false;
        _winKeyTimer = null;
      }, 2500); 

      fullscreenExitCount++;

      if (currentUser && currentExam) {
        google.script.run.logViolation(
          currentUser.userID, currentExam.id, 0,
          `Menekan Tombol Windows (pelanggaran ke-${fullscreenExitCount})`
        );
      }

      if (fullscreenExitCount > MAX_FULLSCREEN_EXIT) {
        handleSecurityTrigger(
          `Menekan Tombol Windows berulang kali (${fullscreenExitCount} kali) — melebihi batas toleransi`
        );
        return;
      }

      _fsConfirmActive = true;
      showFullscreenExitConfirm('winkey');
    }

    function enableAntiCheat() {
      console.log("Anti-Cheat Strict Mode Aktif");
      requestWakeLock();
      ac_ctxHandler = e => e.preventDefault();
      ac_keyHandler = e => {
      const allowedKeys = [
          'Backspace', 'Delete', 'Enter', ' ', 'Spacebar',
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
          'Shift', 'CapsLock', 'Tab', 'Home', 'End',
          '.', ',', '?', '!', ':', ';', "'", '"',
          '(', ')', '-', '_', '/', '+', '=', '@',
          '%', '#', '&', '*',
          '،', '؛', '؟', '٪', '٫', '٬',
          '۔', '«', '»', '‌', '‍', '‏', '‎'
      ];

        const isAlphanumeric = /^[a-zA-Z0-9]$/.test(e.key);
        const isArabic = /^[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿‌‍]$/.test(e.key);
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        // BUG FIX #5: INPUT dan contentEditable juga di-skip agar siswa bisa mengetik
        // di semua field input tanpa diblokir anti-cheat keydown handler.
        if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return;
        if (document.activeElement && document.activeElement.isContentEditable) return;
        if (e.ctrlKey || e.altKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            const isWinKey = e.key === 'Meta' || e.key === 'OS'
                          || e.code === 'MetaLeft' || e.code === 'MetaRight';
            if (isWinKey) {
                handleWindowsKeyPress();
            }
            return false;
        }

        if (!allowedKeys.includes(e.key) && !isAlphanumeric && !isArabic) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
      };

      let ac_visGraceTimer = null;
      ac_visHandler = () => {
        if (document.hidden) {
          if (_imgModalOpen) return;
          if (isKeyboardSafeMode) {
            ac_visGraceTimer = setTimeout(() => {
              if (document.hidden && !_imgModalOpen && !isKeyboardSafeMode) {
                handleSecurityTrigger('Berpindah Tab / Keluar dari Halaman Ujian');
              }
            }, 5000);
            return;
          }
          ac_visGraceTimer = setTimeout(() => {
            if (document.hidden && !_imgModalOpen && !isKeyboardSafeMode) {
              handleSecurityTrigger('Berpindah Tab / Keluar dari Halaman Ujian');
            }
          }, 1500);
        } else {
          if (ac_visGraceTimer) { clearTimeout(ac_visGraceTimer); ac_visGraceTimer = null; }
        }
      };
      ac_blurHandler = () => {
          if (isKeyboardSafeMode) return;
          if (_winKeyJustPressed) return;
          if (_imgModalOpen) return;
          // Toleransi portrait: rotasi ke portrait di mobile menyebabkan blur —
          // jangan anggap curang selama countdown toleransi masih berjalan.
          if (_portraitToleranceActive) return;
          setTimeout(() => {
              if (!document.hasFocus() && !isKeyboardSafeMode && !_winKeyJustPressed && !_imgModalOpen && !_portraitToleranceActive) {
                  handleSecurityTrigger('Membuka Aplikasi Lain / Start Menu');
              }
          }, 10);
      };

      ac_fsHandler = () => {
        const examPage = document.getElementById('page-exam');
        const isInFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        const isExamActive = examPage && !examPage.classList.contains('hidden');

        if (!isInFullscreen && isExamActive && !_fsConfirmActive) {
          if (_winKeyJustPressed) return;

          // Toleransi portrait: pada Android Chrome, rotasi ke portrait sering
          // menyebabkan browser keluar dari fullscreen secara otomatis.
          // Selama countdown toleransi portrait masih berjalan, JANGAN hitung
          // sebagai pelanggaran fullscreen.
          if (_portraitToleranceActive) return;

          fullscreenExitCount++;
          if (fullscreenExitCount > MAX_FULLSCREEN_EXIT) {
            handleSecurityTrigger('Keluar dari mode fullscreen lebih dari ' + MAX_FULLSCREEN_EXIT + ' kali (Curang)');
            return;
          }

          _fsConfirmActive = true;
          showFullscreenExitConfirm('fullscreen');
        }
      };
      ac_unloadHandler = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      let ac_pageHideTimer = null;
      ac_pageHideHandler = () => {
        // Toleransi portrait: pagehide bisa terpicu saat rotasi di beberapa browser.
        // Jangan proses selama countdown toleransi masih berjalan.
        if (_portraitToleranceActive) return;
        if (ac_pageHideTimer) clearTimeout(ac_pageHideTimer);
        const grace = isKeyboardSafeMode ? 6000 : 2000;
        ac_pageHideTimer = setTimeout(() => {
          const examPage = document.getElementById('page-exam');
          const stillHidden = document.hidden || document.visibilityState === 'hidden';
          if (examPage && !examPage.classList.contains('hidden') && stillHidden && !isKeyboardSafeMode && !_portraitToleranceActive) {
            handleSecurityTrigger('Berpindah Aplikasi (Mobile)');
          }
        }, grace);
      };
      ac_pageShowHandler = () => {
        if (ac_pageHideTimer) { clearTimeout(ac_pageHideTimer); ac_pageHideTimer = null; }
      };
      ac_pageFreezeHandler = () => {
        if (isKeyboardSafeMode) return;
        // Toleransi portrait: freeze bisa terpicu saat rotasi di Android.
        if (_portraitToleranceActive) return;
        const examPage = document.getElementById('page-exam');
        if (examPage && !examPage.classList.contains('hidden')) {
          handleSecurityTrigger('Berpindah Aplikasi (Android)');
        }
      };

      ac_copyHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const Toast = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 2000, timerProgressBar: true });
        Toast.fire({ icon: 'error', title: '🚫 Fitur Copy tidak diizinkan saat ujian!' });
      };

      ac_cutHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const Toast = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 2000, timerProgressBar: true });
        Toast.fire({ icon: 'error', title: '🚫 Fitur Cut tidak diizinkan saat ujian!' });
      };

      ac_pasteHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const Toast = Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 2000, timerProgressBar: true });
        Toast.fire({ icon: 'error', title: '🚫 Fitur Paste tidak diizinkan saat ujian!' });
      };

      document.addEventListener('contextmenu', ac_ctxHandler);
      document.addEventListener('keydown', ac_keyHandler); 
      document.addEventListener('visibilitychange', ac_visHandler);
      window.addEventListener('blur', ac_blurHandler);
      document.addEventListener('fullscreenchange', ac_fsHandler);
      document.addEventListener('webkitfullscreenchange', ac_fsHandler);
      window.addEventListener('beforeunload', ac_unloadHandler);
      document.addEventListener('copy', ac_copyHandler);
      document.addEventListener('cut', ac_cutHandler);
      document.addEventListener('paste', ac_pasteHandler);

      window.addEventListener('pagehide', ac_pageHideHandler);
      window.addEventListener('pageshow', ac_pageShowHandler);
      document.addEventListener('freeze', ac_pageFreezeHandler);
    }

    function disableAntiCheat() {
      console.log("Anti-Cheat Dimatikan");
      releaseWakeLock();
      document.removeEventListener('contextmenu', ac_ctxHandler); document.removeEventListener('keydown', ac_keyHandler); document.removeEventListener('visibilitychange', ac_visHandler); window.removeEventListener('blur', ac_blurHandler); document.removeEventListener('fullscreenchange', ac_fsHandler); document.removeEventListener('webkitfullscreenchange', ac_fsHandler); window.removeEventListener('beforeunload', ac_unloadHandler);
      document.removeEventListener('copy', ac_copyHandler);
      document.removeEventListener('cut', ac_cutHandler);
      document.removeEventListener('paste', ac_pasteHandler);

      window.removeEventListener('pagehide', ac_pageHideHandler);
      window.removeEventListener('pageshow', ac_pageShowHandler);
      document.removeEventListener('freeze', ac_pageFreezeHandler);
      document.getElementById('warning-overlay').style.display = 'none'; document.getElementById('warning-overlay').classList.add('hidden');
    }

let initialWidth = window.innerWidth;
let isKeyboardSafeMode = false;

/* ── Anti-select / Anti-copy di halaman ujian ──────────────────────────
   Mencegah siswa memblok teks soal, opsi, atau konten ujian apapun.
   Textarea jawaban esai dikecualikan agar kursor tetap bisa ditempatkan.
   ───────────────────────────────────────────────────────────────────── */
(function _initExamAntiSelect() {
  const examPage = document.getElementById('page-exam');
  if (!examPage) {
    // Coba lagi setelah DOM siap jika dipanggil sebelum page-exam ada
    document.addEventListener('DOMContentLoaded', _initExamAntiSelect);
    return;
  }

  // Cegah drag-select teks
  examPage.addEventListener('selectstart', function(e) {
    // Izinkan pada textarea jawaban esai agar kursor bisa ditempatkan
    if (e.target && e.target.getAttribute('data-essay-input') === 'true') return;
    e.preventDefault();
  }, true);

  // Cegah klik kanan / context menu
  examPage.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  }, true);

  // Cegah Ctrl+C / Cmd+C
  examPage.addEventListener('copy', function(e) {
    if (e.target && e.target.getAttribute('data-essay-input') === 'true') return;
    e.preventDefault();
  }, true);

  // Cegah Ctrl+A select all (kecuali di textarea esai)
  examPage.addEventListener('keydown', function(e) {
    if (e.target && e.target.getAttribute('data-essay-input') === 'true') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
    }
  }, true);
})();

document.addEventListener('focusin', function(e) {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
        isKeyboardSafeMode = true;
        console.log("Mode Mengetik: AKTIF (Keamanan dilonggarkan sementara)");
    }
});

document.addEventListener('focusout', function(e) {
    const isEssayTextarea = e.target && e.target.getAttribute('data-essay-input') === 'true';
    const gracePeriod = isEssayTextarea ? 3000 : 2000;
    setTimeout(() => {
        if (window._essayKeyboardActive) return;
        isKeyboardSafeMode = false;
        console.log("Mode Mengetik: NON-AKTIF");
    }, gracePeriod);
});

window.addEventListener('resize', function() {
    if (window.innerWidth === initialWidth) {
        return; 
    }

});

window.addEventListener('blur', function() {
    if (isKeyboardSafeMode) {
        return; 
    }
    console.log("Terdeteksi Blur: Cek apakah curang atau sistem.");
});

function setupTinyMCESecurity() {
    if (typeof tinymce !== 'undefined') {
        tinymce.on('AddEditor', function(e) {
            e.editor.on('focus', function() {
                isKeyboardSafeMode = true;
            });
            e.editor.on('blur', function() {
                setTimeout(() => {
                    isKeyboardSafeMode = false;
                }, 2000);
            });
        });
    }
}
setupTinyMCESecurity();


// Image viewer state — pakai var (bukan let) agar tidak SyntaxError
// "already declared" bila blok script ini dievaluasi lebih dari sekali.
var _examImgScale = 1;
var _examImgTx = 0;
var _examImgTy = 0;
var _examImgDragging = false;
var _examImgDragStartX = 0;
var _examImgDragStartY = 0;
var _examImgDragOriginTx = 0;
var _examImgDragOriginTy = 0;

function _applyExamImgTransform() {
  const img   = document.getElementById('exam-img-viewer');
  const badge = document.getElementById('exam-img-zoom-badge');
  if (!img) return;
  img.style.transform = `translate(${_examImgTx}px, ${_examImgTy}px) scale(${_examImgScale})`;
  if (badge) badge.textContent = Math.round(_examImgScale * 100) + '%';
}

function openExamImageModal(src) {
  _imgModalOpen = true;
  _examImgScale = 1;
  _examImgTx = 0;
  _examImgTy = 0;
  const modal = document.getElementById('exam-img-modal');
  const img   = document.getElementById('exam-img-viewer');
  img.src = src;
  _applyExamImgTransform();
  modal.style.display = 'flex';
}

function makeImgsClickable(el) {
  if (!el) return;
  el.querySelectorAll('img').forEach(img => {
    if (img.classList.contains('no-zoom')) return;
    // Guard idempoten — skip jika sudah pernah diproses, mencegah
    // penumpukan event listener saat makeImgsClickable dipanggil
    // beberapa kali pada elemen yang sama (misal per-opsi lalu sekali
    // lagi pada seluruh container di akhir renderQuestion).
    if (img.dataset.zoomReady === '1') return;
    img.dataset.zoomReady = '1';
    img.style.cursor  = 'zoom-in';
    img.title         = 'Klik untuk memperbesar';
    img.style.pointerEvents = 'auto';
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      openExamImageModal(this.src);
    });
  });
}

function closeExamImageModal() {
  const modal = document.getElementById('exam-img-modal');
  modal.style.display = 'none';
  document.getElementById('exam-img-viewer').src = '';
  _examImgScale = 1;
  _examImgTx = 0;
  _examImgTy = 0;
  _examImgDragging = false;
  setTimeout(() => { _imgModalOpen = false; }, 80);
}

function examImgZoom(delta) {
  _examImgScale = Math.min(5, Math.max(0.25, _examImgScale + delta));
  _applyExamImgTransform();
}

function examImgResetZoom() {
  _examImgScale = 1;
  _examImgTx = 0;
  _examImgTy = 0;
  _applyExamImgTransform();
}

(function() {
  document.addEventListener('keydown', function(e) {
    if (!_imgModalOpen) return;
    if (e.key === 'Escape') { closeExamImageModal(); return; }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); examImgZoom(0.25); return; }
    if (e.key === '-') { e.preventDefault(); examImgZoom(-0.25); return; }
    if (e.key === '0') { e.preventDefault(); examImgResetZoom(); return; }
    const step = 40;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); _examImgTx += step; _applyExamImgTransform(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); _examImgTx -= step; _applyExamImgTransform(); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); _examImgTy += step; _applyExamImgTransform(); }
    if (e.key === 'ArrowDown')  { e.preventDefault(); _examImgTy -= step; _applyExamImgTransform(); }
  });

  document.addEventListener('wheel', function(e) {
    if (!_imgModalOpen) return;
    e.preventDefault();
    examImgZoom(e.deltaY < 0 ? 0.15 : -0.15);
  }, { passive: false });

  document.addEventListener('click', function(e) {
    if (!_imgModalOpen) return;
    const modal = document.getElementById('exam-img-modal');
    if (!modal || modal.style.display === 'none') return;
    if (e.target === modal) closeExamImageModal();
  });

  function _onDragStart(clientX, clientY) {
    if (!_imgModalOpen) return;
    _examImgDragging = true;
    _examImgDragStartX = clientX;
    _examImgDragStartY = clientY;
    _examImgDragOriginTx = _examImgTx;
    _examImgDragOriginTy = _examImgTy;
    const scroll = document.getElementById('exam-img-scroll');
    if (scroll) scroll.style.cursor = 'grabbing';
  }

  function _onDragMove(clientX, clientY) {
    if (!_examImgDragging) return;
    _examImgTx = _examImgDragOriginTx + (clientX - _examImgDragStartX);
    _examImgTy = _examImgDragOriginTy + (clientY - _examImgDragStartY);
    const img = document.getElementById('exam-img-viewer');
    if (img) img.style.transform = `translate(${_examImgTx}px, ${_examImgTy}px) scale(${_examImgScale})`;
  }

  function _onDragEnd() {
    if (!_examImgDragging) return;
    _examImgDragging = false;
    const scroll = document.getElementById('exam-img-scroll');
    if (scroll) scroll.style.cursor = 'grab';
  }

  document.addEventListener('mousedown', function(e) {
    const scroll = document.getElementById('exam-img-scroll');
    if (!scroll || !scroll.contains(e.target)) return;
    if (e.button !== 0) return;
    e.preventDefault();
    _onDragStart(e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', function(e) {
    if (!_examImgDragging) return;
    _onDragMove(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', _onDragEnd);
  document.addEventListener('mouseleave', _onDragEnd);

  document.addEventListener('touchstart', function(e) {
    const scroll = document.getElementById('exam-img-scroll');
    if (!scroll || !scroll.contains(e.target)) return;
    if (e.touches.length !== 1) return;
    _onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (!_examImgDragging || e.touches.length !== 1) return;
    e.preventDefault();
    _onDragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  document.addEventListener('touchend', _onDragEnd);
  document.addEventListener('touchcancel', _onDragEnd);
})();

function handleSecurityTrigger(reason) {
    const examPage = document.getElementById('page-exam');
    if (!examPage || examPage.classList.contains('hidden')) return;

    console.warn("Security Triggered: " + reason);

    if (currentUser && currentExam) {
        google.script.run.logViolation(currentUser.userID, currentExam.id, 1, reason);
    }

    disableAntiCheat();
    
    if (timerInterval) clearInterval(timerInterval);

    const durationSec = currentExam && currentExam.duration
        ? currentExam.duration * 60
        : (window._examDurationSec || 3600); 

    const remaining   = typeof window.remainingSeconds === 'number' ? window.remainingSeconds : 0;
    const elapsedSec  = Math.max(0, durationSec - remaining);

    const answersWithPause = Object.assign({}, answers, { __pausedElapsedSec__: elapsedSec });

    if (currentUser && currentExam) {
        google.script.run.syncAnswers(
            currentUser.userID, currentExam.id, answersWithPause, violationCount
        );
    }

    finishExamManual(true, 'Curang');
    Swal.fire({
        title: 'DISKUALIFIKASI!',
        html: `
            <div class="text-left mt-2">
                <p class="text-slate-600 mb-3">Sistem mendeteksi aktivitas terlarang:</p>
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-4 shadow-sm">
                    <p class="text-red-700 font-bold flex items-center gap-2 text-lg">
                        <i class="fas fa-exclamation-triangle"></i> ${reason}
                    </p>
                </div>
                <p class="text-sm text-slate-500 leading-relaxed">
                    Ujian dihentikan otomatis. Status Anda tercatat sebagai <b>CURANG</b>.
                </p>
            </div>
        `,
        icon: 'error',
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: 'Tutup Aplikasi',
        confirmButtonColor: '#d33',
        width: '500px'
    }).then((result) => {
        if (result.isConfirmed) {
            logout();
        }
    });
}

    function resumeExamFromViolation() {
      const overlay = document.getElementById('warning-overlay'); overlay.style.display = 'none'; overlay.classList.add('hidden'); enterFullscreen();
    }

    function enterFullscreen() { const el = document.documentElement; if(el.requestFullscreen) el.requestFullscreen().catch(()=>{}); }

    function startTimer(seconds) {
      let t = seconds;
      if (isNaN(t) || t <= 0) t = 60 * 60;
      // BUG FIX #3: set window.remainingSeconds SETELAH normalisasi fallback,
      // bukan sebelumnya, agar nilai awal yang tersimpan sudah benar.
      window.remainingSeconds = t;

      if (timerInterval) clearInterval(timerInterval);

      const timerDisplay = document.getElementById('timer-display');
      const timerMobile = document.getElementById('timer-display-mobile');

      // Mulai polling notifikasi saat timer ujian aktif
      startNotificationPolling();

      timerInterval = setInterval(() => {
        // BUG FIX #3: kurangi t lebih dulu, lalu update remainingSeconds,
        // sehingga nilai yang tersimpan selalu sinkron dengan yang ditampilkan.
        t--;
        window.remainingSeconds = t;

        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = t % 60;

        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        const timeStrShort = h > 0 ? timeStr : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        if (timerDisplay) timerDisplay.innerText = timeStr;
        if (timerMobile) timerMobile.innerText = timeStrShort;

        if (t <= 0) {
          clearInterval(timerInterval);
          finishExamManual(true, 'Waktu Habis');
        }
      }, 1000);
    }

function finishExamManual(forced = false, statusLabel = 'Completed') {
   if (forced) {
       executeSubmission(true, statusLabel);
       return;
   }

   const _mcErrors = _validateEssayMinChar();
   if (_mcErrors.length > 0) {
     const errList = _mcErrors.map(e =>
       `<li>Soal No. <b>${e.qNum}</b>: ${e.len} / <b>${e.minChar}</b> karakter</li>`
     ).join('');
     Swal.fire({
       icon: 'warning',
       title: 'Jawaban Esai Terlalu Singkat',
       html: `<p class="text-slate-600 text-sm mb-2">Beberapa jawaban esai belum memenuhi jumlah karakter minimal yang ditetapkan:</p>
              <ul class="text-sm text-left list-disc pl-5 space-y-1 text-red-600">${errList}</ul>
              <p class="text-xs text-slate-400 mt-3">Lengkapi jawaban esai Anda sebelum mengumpulkan.</p>`,
       confirmButtonColor: '#f59e0b',
       confirmButtonText: 'Lengkapi Jawaban'
     });
     return;
   }

   if (window.remainingSeconds > 300) {
       Swal.fire({
           title: 'Informasi',
           text: 'Silakan Periksa Kembali Jawaban Anda Sebelum Anda Menyelesaikan Ujian Ini dan Tunggu Waktunya Hingga Menjadi Kurang dari 5 Menit',
           icon: 'info',
           confirmButtonText: 'Mengerti'
       });
       return;
   }

   const emptyRequired = [];
   questions.forEach((q, index) => {
       const isReq = String(q.isRequired).toUpperCase().trim() === 'TRUE';
       if (!isReq) return;
       const ans = answers[q.id];
       // BUG FIX #11: String(ans) untuk objek menghasilkan "[object Object]" ≠ '',
       // sehingga hasAnswer=true meski objeknya kosong {}. Evaluasi berdasarkan tipe:
       let isEmpty = false;
       if (ans === null || ans === undefined) {
           isEmpty = true;
       } else if (Array.isArray(ans)) {
           isEmpty = ans.length === 0;
       } else if (typeof ans === 'object') {
           isEmpty = Object.keys(ans).length === 0;
       } else {
           isEmpty = String(ans).trim() === '';
       }
       if (isEmpty) {
           emptyRequired.push(index + 1);
       }
   });

   if (emptyRequired.length > 0) {
       Swal.fire({
           title: 'Jawaban Belum Lengkap!',
           html: `<p>Anda tidak bisa mengumpulkan ujian karena soal berikut wajib diisi:</p><br><b class="text-red-600 text-xl">Nomor: ${emptyRequired.join(', ')}</b>`,
           icon: 'error',
           confirmButtonText: 'Lengkapi Jawaban',
           confirmButtonColor: '#d33'
       });
       return;
   }

   const invalidQuestions = [];
   questions.forEach((q, index) => {
       const err = validateQuestionAnswer(q);
       if (err) {
           invalidQuestions.push({ nomor: index + 1, pesan: err });
       }
   });

   if (invalidQuestions.length > 0) {
       const detailList = invalidQuestions.map(item =>
           `<div class="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
               <div class="font-bold text-amber-700 mb-1">Soal No. ${item.nomor}</div>
               <div class="text-sm text-slate-600">${item.pesan}</div>
            </div>`
       ).join('');

       Swal.fire({
           title: 'Jawaban Perlu Diperbaiki!',
           html: `<p class="text-sm text-slate-500 mb-3">Perbaiki jawaban pada soal berikut sebelum mengumpulkan:</p>${detailList}`,
           icon: 'warning',
           confirmButtonText: 'Perbaiki Jawaban',
           confirmButtonColor: '#f59e0b',
           width: '520px'
       });
       return;
   }

   Swal.fire({
       title: 'Selesai Ujian?',
       text: "Yakin ingin mengumpulkan jawaban?",
       icon: 'question',
       showCancelButton: true,
       confirmButtonColor: '#2563eb',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Ya, Kumpulkan!',
       cancelButtonText: 'Batal'
   }).then((result) => {
       if (result.isConfirmed) {
           executeSubmission(false, 'Completed');
       }
   });
}

function resetQuestionForm() {
    document.getElementById('input-question-id').value = '';
    
    document.getElementById('q-type-select').value = 'PG';
    
    if (document.getElementById('input-point')) {
        // Gunakan defaultPoint dari jadwal yang dipilih (tipe PG = tipe default setelah reset).
        // Jika belum ada konfigurasi jadwal, fallback ke 1 (PG) bukan 10.
        const _defPtOnReset = (currentExamTypeConfig && currentExamTypeConfig['PG'] &&
                               currentExamTypeConfig['PG'].defaultPoint != null)
                              ? currentExamTypeConfig['PG'].defaultPoint : 1;
        document.getElementById('input-point').value = _defPtOnReset;
    }

    if (typeof tinymce !== 'undefined' && tinymce.get('editor-content')) {
        tinymce.get('editor-content').setContent('');
    } else {
        document.getElementById('editor-content').value = '';
    }

    document.getElementById('input-image-ac').value = '';
    if(document.getElementById('input-image-size')) {
        document.getElementById('input-image-size').value = 'w1000'; 
    }
    if(document.getElementById('ac-results')) {
        document.getElementById('ac-results').classList.add('hidden');
    }

    // Reset panel upload inline Bank Soal
    _qbImgUploadQueue = [];
    const _qbPanel = document.getElementById('qb-inline-upload-panel');
    if (_qbPanel) _qbPanel.classList.add('hidden');
    const _qbQueue = document.getElementById('qb-upload-queue');
    if (_qbQueue) { _qbQueue.classList.add('hidden'); _qbQueue.innerHTML = ''; }
    const _qbActions = document.getElementById('qb-upload-actions');
    if (_qbActions) _qbActions.classList.add('hidden');

    // Task 12.1 — clear any audio attachment when the question form resets.
    if (typeof clearQuestionAudio === 'function') {
      clearQuestionAudio();
    }

    const reqSelect = document.querySelector('select[name="isRequired"]');
    if(reqSelect) reqSelect.value = 'TRUE'; 

    for(let i=0; i<6; i++) {
        if(typeof tinymce !== 'undefined' && tinymce.get('opt-'+i)) {
            tinymce.get('opt-'+i).setContent('');
        } else {
            const el = document.getElementById('opt-'+i);
            if(el) el.value = '';
        }
    }

    if(document.getElementById('bs-container')) document.getElementById('bs-container').innerHTML = '';
    if(document.getElementById('pairs-container')) document.getElementById('pairs-container').innerHTML = '';

    const _cbE = document.getElementById('input-minchar-enabled');
    const _mcE = document.getElementById('input-minchar');
    const _mcW = document.getElementById('esai-minchar-input-wrap');
    const _mcA = document.getElementById('esai-minchar-area');
    if (_cbE) _cbE.checked = true;   
    if (_mcE) _mcE.value   = 10;     
    if (_mcW) _mcW.classList.remove('hidden'); 
    if (_mcA) _mcA.classList.add('hidden');

    document.getElementById('correct-input').value = '';

    const typeSelectReset = document.getElementById('q-type-select');
    if (typeSelectReset) {
      Array.from(typeSelectReset.options).forEach(opt => {
        if (opt.dataset.wasDisabled === 'true') {
          opt.disabled = true;
          opt.textContent = opt.dataset.origText || opt.textContent;
          delete opt.dataset.wasDisabled;
          delete opt.dataset.origText;
        }
      });
    }

    toggleOptionsInput('PG');

    const btn = document.querySelector('form[onsubmit="handleAddQuestion(event)"] button[type="submit"]');
    if(btn) {
        btn.innerHTML = '<i class="fas fa-save"></i> Simpan Pertanyaan';
        btn.className = 'qb-submit-btn';
        // Bersihkan override warna mode-edit (dari editQuestion)
        btn.style.background = '';
        btn.style.boxShadow  = '';
        btn.disabled = false;
    }
}

function editQuestion(qStr) {
    const q = JSON.parse(decodeURIComponent(qStr));

    document.getElementById('form-add-q').classList.remove('hidden');
    document.getElementById('form-import-q').classList.add('hidden');
    document.getElementById('form-import-excel').classList.add('hidden');
    document.getElementById('form-copy-q').classList.add('hidden');
    document.getElementById('form-batch-q').classList.add('hidden');
    document.getElementById('form-add-q').scrollIntoView({
        behavior: 'smooth'
    });

    document.getElementById('input-question-id').value = q.id;
    document.getElementById('input-exam-id').value = q.examId;

    const typeSelectEl = document.querySelector('select[name="type"]');
    const matchingTypeOpt = Array.from(typeSelectEl.options).find(o => o.value === q.type);
    if (matchingTypeOpt && matchingTypeOpt.disabled) {
      const origText = matchingTypeOpt.textContent;
      matchingTypeOpt.disabled = false;
      matchingTypeOpt.textContent = origText.replace(/—\s*PENUH\s*\(\d+\/\d+\)/, '(Sedang Diedit)').trim();
      matchingTypeOpt.dataset.wasDisabled = 'true';
      matchingTypeOpt.dataset.origText = origText;
    }
    typeSelectEl.value = q.type;

    if (document.getElementById('input-point')) {
        document.getElementById('input-point').value = q.point || 10;
    }
    if (q.type === 'Esai') {
      const cbEnabled = document.getElementById('input-minchar-enabled');
      const minCharEl = document.getElementById('input-minchar');
      const wrapInput = document.getElementById('esai-minchar-input-wrap');
      if (cbEnabled) {
        cbEnabled.checked = !!(q.minCharEnabled);
        cbEnabled.onchange = function() {
          if (wrapInput) wrapInput.classList.toggle('hidden', !this.checked);
        };
      }
      if (minCharEl) minCharEl.value = q.minChar || 30;
      if (wrapInput) wrapInput.classList.toggle('hidden', !q.minCharEnabled);
    }

    if (typeof tinymce !== 'undefined' && tinymce.get('editor-content')) {
        tinymce.get('editor-content').setContent(q.content || '');
    } else {
        document.getElementById('editor-content').value = q.content || '';
    }

    document.querySelector('input[name="image"]').value = q.image || '';

    // Task 12.1 — restore the persisted audio reference (Direct_Link) when editing.
    if (typeof setQuestionAudio === 'function') {
      setQuestionAudio({ link: q.audio || '', name: '' });
    }

    const sizeSelect = document.getElementById('input-image-size');
    if (sizeSelect) {
        if (q.image) {
            if (q.image.includes('sz=w300')) {
                sizeSelect.value = 'w300';
            } else if (q.image.includes('sz=w600')) {
                sizeSelect.value = 'w600';
            } else {
                sizeSelect.value = 'w1000';
            }
        } else {
            sizeSelect.value = 'w1000';
        }
    }

    const reqSelect = document.querySelector('select[name="isRequired"]');
    if (reqSelect) {
        const val = String(q.isRequired).toUpperCase().trim();
        reqSelect.value = (val === 'TRUE') ? 'TRUE' : 'FALSE';
    }

    toggleOptionsInput(q.type);

    let options = [];
    try {
        options = (typeof q.options === 'string') ? JSON.parse(q.options) : q.options;
    } catch (e) {
        options = [];
    }

    if (q.type === 'PG' || q.type === 'PG_KOMPLEKS') {

        for (let i = 0; i < 6; i++) {
            if (typeof tinymce !== 'undefined' && tinymce.get('opt-' + i)) {
                tinymce.get('opt-' + i).setContent('');
            } else {
                const el = document.getElementById('opt-' + i);
                if (el) el.value = '';
            }

            if (Array.isArray(options) && options[i]) {
                if (typeof tinymce !== 'undefined' && tinymce.get('opt-' + i)) {
                    tinymce.get('opt-' + i).setContent(options[i]);
                } else {
                    const el = document.getElementById('opt-' + i);
                    if (el) el.value = options[i];
                }
            }
        }

        let keyDisplay = q.key;

        if (q.type === 'PG_KOMPLEKS') {
            try {
                if (Array.isArray(keyDisplay)) {
                    keyDisplay = keyDisplay.join(', ');
                } else {
                    const parsedKey = JSON.parse(keyDisplay);
                    if (Array.isArray(parsedKey)) {
                        keyDisplay = parsedKey.join(', ');
                    }
                }
            } catch (e) {}
        }

        document.getElementById('correct-input').value = keyDisplay || '';
    }

    else if (q.type === 'BS') {
        const container = document.getElementById('bs-container');
        container.innerHTML = ''; 

        let keys = {};
        try {
            keys = (typeof q.key === 'string') ? JSON.parse(q.key) : q.key;
        } catch (e) {}

        if (Array.isArray(options)) {
            options.forEach((stmt, idx) => {
                // BUG FIX: Kunci BS dapat disimpan dengan key indeks numerik (format baru)
                // ATAU key teks pernyataan (format lama dari Code.gs seed data).
                // Coba indeks numerik dulu, lalu fallback ke teks pernyataan, lalu 'Benar'.
                let keyVal = 'Benar';
                if (keys) {
                    if (keys[idx] !== undefined) {
                        keyVal = keys[idx];
                    } else if (keys[String(idx)] !== undefined) {
                        keyVal = keys[String(idx)];
                    } else if (keys[stmt] !== undefined) {
                        keyVal = keys[stmt];
                    }
                }
                addBsRowInput(stmt, keyVal);
            });
        }
    }

    else if (q.type === 'JODOH') {
        const container = document.getElementById('pairs-container');
        container.innerHTML = ''; 

        if (Array.isArray(options)) {
            options.forEach(pair => {
                
                let qVal = pair.q || '';
                let keyVal = pair.a || '';
                let optVal = pair.a || ''; 

                if (!qVal) {
                   keyVal = pair.a || ''; 
                }

                addPairInput(qVal, optVal, keyVal);
            });
        } else {
            addPairInput();
        }
    }

    else if (q.type === 'Esai') {
        document.getElementById('correct-input').value = q.key || '';
    }

    const btn = document.querySelector('form[onsubmit="handleAddQuestion(event)"] button[type="submit"]');
    if (btn) {
        // FIX: Gunakan class qb-submit-btn + override warna via style agar konsisten
        // dengan CSS baru. Tidak lagi bergantung pada class Tailwind bg-blue-600/bg-orange-600
        // yang bisa konflik karena tombol sudah menggunakan qb-submit-btn.
        btn.innerHTML = '<i class="fas fa-edit mr-1"></i> Update Perubahan';
        btn.className = 'qb-submit-btn';
        btn.style.background = 'linear-gradient(135deg, #ea580c, #dc2626)';
        btn.style.boxShadow  = '0 4px 12px rgba(234,88,12,0.35)';
    }
}

function executeSubmission(forced, statusLabel) {
    if (typeof _syncTimer !== 'undefined') clearTimeout(_syncTimer);

    disableAntiCheat(); 
    clearInterval(timerInterval);
    stopNotificationPolling();

    const CELL_LIMIT = 45000;
    const safeAnswers = {};
    Object.keys(answers).forEach(qId => {
      const val = answers[qId];
      // BUG FIX #6: try/catch sebelumnya berisi dead code (canvas & image tidak dipakai).
      // Keduanya melakukan hal identik; disederhanakan langsung tanpa try/catch.
      if (typeof val === 'string' && val.startsWith('data:') && val.length > CELL_LIMIT) {
        safeAnswers[qId] = val.slice(0, CELL_LIMIT);
      } else {
        safeAnswers[qId] = val;
      }
    });
    document.getElementById('global-loading').classList.remove('hidden');

    google.script.run
    .withFailureHandler(err => {
        document.getElementById('global-loading').classList.add('hidden');
        Swal.fire({
            icon: 'error',
            title: 'Gagal Mengumpulkan',
            html: `<p class="text-slate-600 text-sm">${(err && err.message ? err.message : String(err)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
                   <p class="text-xs text-slate-400 mt-2">Coba lagi. Jika masalah berlanjut, hubungi pengawas ujian.</p>`,
            confirmButtonText: 'Coba Lagi',
            confirmButtonColor: '#2563eb'
        });
    })
    .withSuccessHandler(res => {
        document.getElementById('global-loading').classList.add('hidden');

        // BUG FIX #9: Server bisa mengembalikan { success: false, message: '...' }
        // (misalnya LockService timeout). Sebelumnya tidak dicek sehingga halaman
        // ujian tetap di-replace dengan "Selesai" padahal jawaban belum tersimpan.
        if (!res || res.success === false) {
            const errMsg = (res && res.message)
                ? res.message.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                : 'Server tidak dapat menyimpan jawaban.';
            // Untuk pengumpulan manual (bukan forced), re-aktifkan anti-cheat agar
            // siswa tidak bisa kabur saat retry. Untuk forced (curang/waktu habis),
            // jangan re-aktifkan agar tidak ada konflik dengan alur keamanan.
            if (!forced) {
                enableAntiCheat();
            }
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengumpulkan',
                html: `<p class="text-slate-600 text-sm">${errMsg}</p>
                       <p class="text-xs text-slate-400 mt-2">Coba kumpulkan lagi. Jika masalah berlanjut, hubungi pengawas ujian.</p>`,
                confirmButtonText: forced ? 'Tutup' : 'Coba Lagi',
                confirmButtonColor: '#2563eb',
                allowOutsideClick: false
            });
            return;
        }

        if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
        unlockLandscape(); // Lepas kunci orientasi setelah ujian selesai

        document.getElementById('page-exam').innerHTML = `
        <div class="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6 fade-in">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 text-4xl shadow-lg animate-bounce">
                <i class="fas fa-check"></i>
            </div>
            <h2 class="text-3xl font-bold text-slate-800">Ujian Selesai!</h2>
            <p class="text-slate-500 mt-2">Jawaban Anda telah disimpan ke dalam sistem.</p>
            
            <div class="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 min-w-[300px] shadow-sm">
                <p class="text-sm text-slate-500 uppercase font-bold tracking-wide">Status Akhir</p>
                <p class="text-2xl font-bold ${statusLabel === 'Curang' ? 'text-red-600' : 'text-blue-600'} mt-2">
                    ${statusLabel === 'Curang' ? 'DISKUALIFIKASI (CURANG)' : 'SELESAI'}
                </p>
            </div>
            
            <button onclick="logout()" class="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition shadow-lg transform active:scale-95 flex items-center gap-2">
                <i class="fas fa-sign-out-alt"></i> Keluar Aplikasi
            </button>
        </div>`;
        
        window.scrollTo(0, 0);

        if (!forced) { 
            Swal.fire({
                title: 'Terkirim!', 
                text: 'Jawaban Anda telah disimpan.', 
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        }
    }).submitExam(currentUser.userID, currentExam.id, safeAnswers, statusLabel);
}

function openGradingModal(responseId) {
    // FIX BUG-2: null-check elemen DOM sebelum akses apapun
    const modal       = document.getElementById('modal-grading');
    const content     = document.getElementById('grading-content');
    const nameDisplay = document.getElementById('grading-student-name');
    const scoreInput  = document.getElementById('input-essay-score');

    if (!modal || !content || !nameDisplay || !scoreInput) {
        console.error('[openGradingModal] Elemen modal-grading tidak ditemukan di DOM.');
        Swal.fire({
            title: 'Terjadi Kesalahan',
            html: '<p style="font-size:13px;color:#475569;">Komponen modal koreksi tidak tersedia. Coba muat ulang halaman.</p>',
            icon: 'error', confirmButtonColor: '#dc2626',
            customClass: { popup: 'lp-swal' }
        });
        return;
    }

    currentGradingId = responseId;

    modal.classList.remove('hidden');
    content.innerHTML = '<div class="flex flex-col items-center py-10 text-slate-400"><i class="fas fa-circle-notch fa-spin text-3xl mb-2 text-blue-500"></i> Memuat jawaban esai...</div>';
    scoreInput.value = '';

    google.script.run.withSuccessHandler(res => {
        // FIX BUG-7: cek res !== null sebelum mengakses res.success
        if (!res || !res.success) {
            content.innerHTML = `<div class="text-red-500 text-center p-4 font-bold">
                <i class="fas fa-triangle-exclamation text-2xl mb-2 block"></i>
                ${res ? res.message : 'Server mengembalikan respons kosong. Coba lagi.'}
            </div>`;
            return;
        }

        nameDisplay.innerText = "Siswa: " + (res.studentName || 'Tanpa Nama');

        if (res.data.length === 0) {
            content.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-check-circle text-4xl text-green-300 mb-3"></i>
                    <p class="text-slate-600 font-bold">Tidak ada soal Esai.</p>
                    <p class="text-slate-400 text-sm">Nilai sudah otomatis dari Pilihan Ganda.</p>
                </div>`;
            scoreInput.value = 0;
            scoreInput.disabled = true;
        } else {
            let html = '<div class="space-y-6">';
            res.data.forEach((item, idx) => {
                const maxPt = item.maxPoint !== undefined ? item.maxPoint : 10;
                const existPt = item.existingScore !== undefined ? item.existingScore : 0;
                // BUG FIX #13: Stored XSS — item.question, item.answer, item.id dari server
                // dimasukkan langsung ke innerHTML tanpa escaping. Guru membuka modal ini
                // sehingga XSS terpicu di sisi guru jika data di Sheets mengandung markup.
                // item.question boleh mengandung HTML formatting dari TinyMCE — gunakan as-is
                // tapi data-qid (item.id) dan jawaban teks (item.answer) wajib di-escape.
                const safeQid    = String(item.id || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
                const safeAnswer = String(item.answer || '-').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
                const safeMaxPt  = Number(maxPt);
                const safeExPt   = Number(existPt);
                html += `
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div class="flex justify-between mb-2">
                        <span class="text-xs font-bold text-slate-500 uppercase">Soal Esai #${idx+1}</span>
                        <span class="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">Maks: ${safeMaxPt} poin</span>
                    </div>
                    <p class="text-slate-800 font-medium mb-3">${item.question}</p>
                    <div class="bg-white p-3 rounded border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap font-serif italic mb-3">
                        &ldquo;${safeAnswer}&rdquo;
                    </div>
                    <div class="flex items-center gap-3 bg-white p-2 rounded border border-blue-100">
                        <label class="text-xs font-bold text-slate-600 whitespace-nowrap">Poin Diberikan:</label>
                        <input type="number"
                               class="essay-q-score flex-1 p-2 border border-blue-300 rounded text-right font-bold focus:ring-2 focus:ring-blue-500 outline-none transition"
                               data-qid="${safeQid}"
                               data-max="${safeMaxPt}"
                               value="${safeExPt}"
                               min="0" max="${safeMaxPt}" step="0.1"
                               oninput="updateEssayTotal()"
                               placeholder="0">
                        <span class="text-xs text-slate-400 whitespace-nowrap">/ ${safeMaxPt} poin</span>
                    </div>
                </div>`;
            });
            html += '</div>';
            content.innerHTML = html;
            scoreInput.disabled = false;

            setTimeout(() => updateEssayTotal(), 50);
        }

        if (res.existingScore !== undefined && res.existingScore !== null) {
            if (document.querySelectorAll('.essay-q-score').length === 0) {
                scoreInput.value = res.existingScore;
            }
        } else {
            scoreInput.value = 0;
        }

    }).getEssayData(responseId);
}

// FIX BUG-1: closeGradingModal dipindah ke scope top-level agar dapat
// dipanggil oleh ESC handler global, onclick di HTML statis, dan
// submitEssayGrade tanpa TypeError "not a function".
function closeGradingModal() {
    const modal = document.getElementById('modal-grading');
    if (modal) modal.classList.add('hidden');
    currentGradingId = null;
}

function updateEssayTotal() {
  const inputs = document.querySelectorAll('.essay-q-score');
  let total = 0;
  inputs.forEach(inp => {
    const max = parseFloat(inp.dataset.max) || 0;
    let val = parseFloat(inp.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) {
      inp.value = max;
      val = max;
    }
    total += val;
  });
  const totalInput = document.getElementById('input-essay-score');
  if (totalInput) totalInput.value = Math.round(total * 100) / 100;
}

function submitEssayGrade() {
    const essayInputs = document.querySelectorAll('.essay-q-score');
    
    // BUG FIX RS-4 (KRITIS): currentGradingId harus di-capture SEBELUM google.script.run dipanggil.
    // closeGradingModal() di dalam withSuccessHandler akan men-set currentGradingId = null,
    // sehingga .saveEssayGrade(currentGradingId, ...) di bagian bawah selalu mengirim null.
    // Dengan meng-capture-nya di sini (sinkron, sebelum async call), ID tetap valid.
    const responseIdToGrade = currentGradingId;
    if (!responseIdToGrade) {
        Swal.fire('Error', 'Tidak ada data koreksi yang aktif. Tutup dan buka kembali modal.', 'error');
        return;
    }

    if (essayInputs.length === 0) {
        const inputElem = document.getElementById('input-essay-score');
        const score = inputElem ? parseFloat(inputElem.value) : 0;
        if (score < 0) {
            Swal.fire('Error', 'Poin esai tidak boleh negatif.', 'error');
            return;
        }
    }

    const perQuestionScores = {};
    let isValid = true;

    // BUG FIX #14: `return` di dalam forEach hanya skip satu iterasi, bukan keluar dari loop.
    // Akibatnya: jika ada 3 input invalid, Swal muncul 3 kali bertumpuk. Ganti ke for...of.
    for (const inp of essayInputs) {
        const qid = inp.dataset.qid;
        const max = parseFloat(inp.dataset.max) || 0;
        const val = parseFloat(inp.value) || 0;

        if (val < 0) {
            Swal.fire('Error', 'Poin tidak boleh negatif.', 'error');
            isValid = false;
            break;
        }
        if (val > max) {
            Swal.fire('Error', `Poin soal melebihi bobot maksimal (${max} poin). Harap periksa kembali.`, 'error');
            isValid = false;
            break;
        }
        perQuestionScores[qid] = val;
    }

    if (!isValid) return;

    const btn = document.querySelector('#modal-grading button.btn-primary') || document.querySelector('#modal-grading button[onclick="submitEssayGrade()"]');
    let oldText = 'Simpan';
    if (btn) {
        oldText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    google.script.run.withSuccessHandler(res => {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = oldText;
        }

        if (res.success) {
            // FIX BUG-3: hapus inline DOM update yang fragile (selector onclick tidak selalu cocok).
            // Selalu reload tabel agar data terbaru terefleksi tanpa manipulasi DOM manual.
            closeGradingModal();

            const examSelect = document.getElementById('select-result-exam');
            if (examSelect && examSelect.value) {
                loadResultsTable(examSelect.value);
            }

            const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2000, timerProgressBar:true });
            Toast.fire({
                icon: 'success',
                title: `Koreksi disimpan · Nilai: ${formatScore(res.finalScore)}`
            });
        } else {
            Swal.fire({
                title: 'Gagal Menyimpan',
                html: `<p style="font-size:13px;color:#475569;">${res.message || 'Terjadi kesalahan.'}</p>`,
                icon: 'error', confirmButtonColor: '#dc2626',
                customClass: { popup: 'lp-swal' }
            });
        }
    }).saveEssayGrade(responseIdToGrade, perQuestionScores, currentUser.userID, currentUser.token);
}
