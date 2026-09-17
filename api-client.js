/**
 * api-client.js
 *
 * GAS API Client untuk Vercel — Drop-in replacement untuk google.script.run.
 *
 * CARA KERJA:
 *   - Di lingkungan GAS (index.html serve oleh doGet), google.script.run
 *     tersedia secara native dan digunakan langsung.
 *   - Di lingkungan Vercel, file ini di-load dan mendefinisikan:
 *       window.google.script.run   — interface yang identik
 *       window.gasApi              — wrapper Promise-based (lebih ergonomis)
 *   - Semua panggilan dikirim sebagai POST ke GAS_URL dengan body:
 *       { "fn": "functionName", "args": [...argumen] }
 *
 * KONFIGURASI:
 *   Set GAS_URL di window.__GAS_URL__ sebelum script ini di-load, atau
 *   melalui meta tag <meta name="gas-url" content="https://...">
 *   atau environment variable yang di-inject saat build.
 *
 * KOMPATIBILITAS:
 *   Mempertahankan interface google.script.run sepenuhnya:
 *     google.script.run
 *       .withSuccessHandler(fn)
 *       .withFailureHandler(fn)
 *       .functionName(arg1, arg2, ...)
 *
 *   Juga menyediakan Promise API baru:
 *     gasApi.call('functionName', arg1, arg2, ...).then(result => ...)
 *     gasApi.call('functionName', arg1, arg2, ...) // auto-resolves
 *
 * @phase 9
 */

(function (root) {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  // KONFIGURASI
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Resolusi GAS URL dari berbagai sumber (prioritas dari atas ke bawah):
   *   1. window.__GAS_URL__  (set manual sebelum script load)
   *   2. <meta name="gas-url" content="...">
   *   3. localStorage.getItem('__gas_url__')  (override runtime)
   *   4. Placeholder — harus diisi sebelum deploy
   */
  function _resolveGasUrl() {
    if (root.__GAS_URL__ && root.__GAS_URL__ !== '__GAS_URL_PLACEHOLDER__') {
      return root.__GAS_URL__;
    }
    var meta = document.querySelector('meta[name="gas-url"]');
    if (meta && meta.content && meta.content !== '__GAS_URL_PLACEHOLDER__') {
      return meta.content;
    }
    var ls = null;
    try { ls = localStorage.getItem('__gas_url__'); } catch(e) {}
    if (ls && ls.startsWith('https://script.google.com')) return ls;

    // Fallback: coba baca dari URL param ?gas=... (untuk testing lokal)
    try {
      var params = new URLSearchParams(root.location.search);
      var gasParam = params.get('gas');
      if (gasParam && gasParam.startsWith('https://')) return gasParam;
    } catch(e) {}

    return '__GAS_URL_PLACEHOLDER__';
  }

  var GAS_URL = _resolveGasUrl();

  /** Timeout default per request (ms). */
  var DEFAULT_TIMEOUT_MS = 60000; // 60s — GAS bisa lambat

  /** Max retry untuk network errors (bukan app errors). */
  var MAX_RETRIES = 1;

  // ═══════════════════════════════════════════════════════════════════════
  // CORE HTTP LAYER
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Kirim satu request ke GAS endpoint.
   *
   * @param {string} fn      - nama fungsi GAS
   * @param {Array}  args    - argumen sebagai array
   * @param {number} [retry] - percobaan ke berapa (internal)
   * @returns {Promise<*>}   - resolve dengan data, reject dengan Error
   */
  function _post(fn, args, retry) {
    retry = retry || 0;
    var url = GAS_URL;
    if (!url || url === '__GAS_URL_PLACEHOLDER__') {
      return Promise.reject(new Error(
        'GAS URL belum dikonfigurasi. Set window.__GAS_URL__ sebelum menggunakan API.'
      ));
    }

    var body = JSON.stringify({ fn: fn, args: args || [] });

    // AbortController untuk timeout
    var controller = null;
    var timeoutId  = null;
    var aborted    = false;

    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      timeoutId  = setTimeout(function () {
        aborted = true;
        controller.abort();
      }, DEFAULT_TIMEOUT_MS);
    }

    var fetchOpts = {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' }, // GAS butuh text/plain agar tidak trigger preflight
      body:    body
    };
    if (controller) fetchOpts.signal = controller.signal;

    return fetch(url, fetchOpts)
      .then(function (resp) {
        if (timeoutId) clearTimeout(timeoutId);
        if (!resp.ok) {
          throw new Error('HTTP ' + resp.status + ' dari GAS endpoint.');
        }
        return resp.text();
      })
      .then(function (text) {
        // GAS mengembalikan JSON string
        var parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          throw new Error('GAS mengembalikan response non-JSON: ' + text.substring(0, 200));
        }

        // Format: { ok: true, data: ... } | { ok: false, code: ..., message: ... }
        if (parsed && parsed.ok === false) {
          var err = new Error(parsed.message || 'GAS error: ' + (parsed.code || 'UNKNOWN'));
          err.code    = parsed.code;
          err.gasError = true;
          throw err;
        }

        // Beberapa fungsi GAS mengembalikan data langsung (bukan wrapped)
        return (parsed && parsed.hasOwnProperty('data')) ? parsed.data : parsed;
      })
      .catch(function (err) {
        if (timeoutId) clearTimeout(timeoutId);

        // Retry untuk network error (bukan app error)
        if (!err.gasError && !aborted && retry < MAX_RETRIES) {
          console.warn('[GasAPI] Network error untuk ' + fn + ', retry ' + (retry + 1));
          return _post(fn, args, retry + 1);
        }

        if (aborted) {
          throw new Error('Permintaan ' + fn + ' melewati batas waktu (' + (DEFAULT_TIMEOUT_MS / 1000) + 's).');
        }
        throw err;
      });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PROMISE-BASED API (gasApi)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * gasApi — API baru berbasis Promise.
   * Gunakan ini untuk kode baru, bukan google.script.run.
   *
   * @example
   *   gasApi.call('getExamList', userID, token).then(exams => ...)
   *   gasApi.call('loginUser', userId, pwd, pin, 'siswa').catch(err => ...)
   */
  var gasApi = {
    /**
     * Panggil fungsi GAS.
     * @param {string} fn
     * @param {...*} args
     * @returns {Promise<*>}
     */
    call: function (fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      return _post(fn, args);
    },

    /**
     * Bootstrap — ambil app config dari GAS (doGet response).
     * Dipanggil sekali saat Vercel app pertama kali load.
     * @returns {Promise<object>} cfg object identik dengan yang di-inject doGet
     */
    getConfig: function () {
      var url = GAS_URL;
      if (!url || url === '__GAS_URL_PLACEHOLDER__') {
        return Promise.resolve({
          app_name:       'SIPADU CBT',
          app_subtitle:   'Sistem Ujian Online',
          app_logo:       '',
          app_background: '',
          timezone:       'Asia/Jakarta'
        });
      }
      return fetch(url)
        .then(function (r) { return r.text(); })
        .then(function (text) {
          var parsed = JSON.parse(text);
          return (parsed && parsed.data) ? parsed.data : parsed;
        });
    },

    /**
     * Set GAS URL secara runtime.
     * @param {string} url
     */
    setUrl: function (url) {
      GAS_URL = url;
      try { localStorage.setItem('__gas_url__', url); } catch(e) {}
      console.log('[GasAPI] URL diset ke: ' + url);
    },

    /**
     * Kembalikan GAS URL saat ini.
     */
    getUrl: function () { return GAS_URL; },

    /**
     * Set timeout per request.
     * @param {number} ms
     */
    setTimeout: function (ms) { DEFAULT_TIMEOUT_MS = ms; }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // google.script.run COMPATIBILITY LAYER
  // ═══════════════════════════════════════════════════════════════════════
  //
  // Menyediakan interface yang IDENTIK dengan google.script.run sehingga
  // semua kode di index.html tidak perlu diubah.
  //
  // Pattern:
  //   google.script.run
  //     .withSuccessHandler(fn)
  //     .withFailureHandler(fn)
  //     .functionName(args...)
  //
  // Di GAS asli, setiap call ke .functionName() langsung mengirim request
  // dan callback dipanggil secara async. Interface ini mereplikasi perilaku
  // yang sama persis.
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Buat proxy object yang menangkap .functionName(args...) sebagai trap.
   * @param {function|null} successHandler
   * @param {function|null} failureHandler
   * @returns {Proxy|object}
   */
  function _makeRunner(successHandler, failureHandler) {
    var _onSuccess = typeof successHandler === 'function' ? successHandler : null;
    var _onFailure = typeof failureHandler === 'function' ? failureHandler : function(err) {
      console.error('[GasAPI] Unhandled failure:', err);
    };

    /**
     * Eksekusi panggilan ke GAS dan route hasilnya ke handler.
     */
    function _exec(fn, args) {
      _post(fn, args)
        .then(function (data) {
          if (_onSuccess) {
            try { _onSuccess(data); }
            catch(e) { console.error('[GasAPI] Error di successHandler untuk ' + fn + ':', e); }
          }
        })
        .catch(function (err) {
          if (_onFailure) {
            try { _onFailure(err); }
            catch(e2) { console.error('[GasAPI] Error di failureHandler untuk ' + fn + ':', e2); }
          }
        });
    }

    // Runner object dengan support untuk Proxy (modern browsers)
    // dan fallback manual untuk browser lama.
    if (typeof Proxy !== 'undefined') {
      return new Proxy({
        withSuccessHandler: function(fn) { return _makeRunner(fn, _onFailure); },
        withFailureHandler: function(fn) { return _makeRunner(_onSuccess, fn); },
        withUserObject:     function()   { return _makeRunner(_onSuccess, _onFailure); }
      }, {
        get: function(target, prop) {
          if (prop in target) return target[prop];
          // Setiap property yang tidak dikenal diperlakukan sebagai nama fungsi GAS
          return function() {
            var args = Array.prototype.slice.call(arguments);
            _exec(prop, args);
            // Kembalikan undefined (sesuai perilaku asli google.script.run)
          };
        }
      });
    }

    // Fallback tanpa Proxy: buat objek dengan semua fungsi yang diketahui
    var runner = {
      withSuccessHandler: function(fn) { return _makeRunner(fn, _onFailure); },
      withFailureHandler: function(fn) { return _makeRunner(_onSuccess, fn); },
      withUserObject:     function()   { return _makeRunner(_onSuccess, _onFailure); }
    };

    // Daftarkan semua fungsi yang ada di whitelist sebagai method
    var KNOWN_FUNCTIONS = [
      'loginUser','logoutUser','checkSession','getScriptTimezone',
      'getAppConfig','saveAppConfig','getMasterData','saveMasterData',
      'getExamList','createExam','updateExam','deleteExam','deleteExamsBulk','toggleExamStatus','validateExamPIN',
      'getQuestionsByExam','addQuestion','updateQuestion','deleteQuestion','deleteQuestionsBulk',
      'saveBatchQuestions','saveImportedQuestions','importQuestionsFromForm','copyQuestions',
      'getExamQuestions','syncAnswers','submitExam','logViolation','getMyExamResult','convertCanvasToLatex',
      'getExamResults','getStudentAnswerDetail','getStudentAnswerDetails','getEssayData','saveEssayGrade','saveAIScoreToResponse',
      'resetStudentExam','unlockStudentExam','bulkUnlockStudents','bulkResetStudents',
      'getUserList','createUser','updateUser','deleteUser','toggleUserStatus','importUsersBulk','getSiswaForGuru',
      'getExamMonitorData','getItemAnalysis','getBSItemAnalysis','getJODOHItemAnalysis','getQuestionProgressData',
      'getAdminLogs',
      'getSavedImages','getSavedAudio','getAllImages','getAllAudio',
      'deleteSavedImage','deleteSavedAudio','verifyImageAccess','verifyAudioAccess',
      'getImageUploadFolderId','getAudioUploadFolderId','uploadImageFile','uploadAudioFile',
      'processFolderImages','processFolderAudio',
      'generateExamRecapPDF','generateStudentDetailPDF','generateLembarSoalPDF',
      'downloadKartuSiswa','downloadKartuMassal','checkDownloadProgress','validateKartuConfig',
      'getSupervisors','createSupervisorAssignment','updateSupervisorAssignment','getExamRooms',
      'getNotifications','sendNotification','markNotifRead',
      'getKartuConfig','manualBackup','autoActivateExams','testAnthropicApiKey','getKopConfig',
      'checkAutoActivateTriggerStatus','setupAutoActivateTrigger','removeAutoActivateTrigger',
      'getInputPeriod','saveInputPeriod'
    ];
    KNOWN_FUNCTIONS.forEach(function(fn) {
      runner[fn] = (function(fnName) {
        return function() {
          var args = Array.prototype.slice.call(arguments);
          _exec(fnName, args);
        };
      })(fn);
    });

    return runner;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INSTALASI DI window
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Pasang google.script.run HANYA jika belum ada (tidak override GAS native).
   * Di Vercel: window.google tidak ada → pasang polyfill.
   * Di GAS:    window.google.script.run ada → biarkan native.
   */
  function _install() {
    // Jika sudah ada google.script.run native (running inside GAS), skip
    if (root.google && root.google.script && root.google.script.run &&
        typeof root.google.script.run.withSuccessHandler === 'function' &&
        !root.google.script.run.__isPolyfill__) {
      console.log('[GasAPI] google.script.run native terdeteksi, polyfill tidak dipasang.');
      // Tetap pasang gasApi untuk penggunaan opsional
      root.gasApi = gasApi;
      return;
    }

    // Pasang polyfill
    if (!root.google) root.google = {};
    if (!root.google.script) root.google.script = {};

    // Buat root runner dengan Proxy
    var rootRunner = _makeRunner(null, null);
    rootRunner.__isPolyfill__ = true;

    // Tambahkan withSuccessHandler + withFailureHandler ke root runner
    Object.defineProperty(rootRunner, 'withSuccessHandler', {
      value: function(fn) { return _makeRunner(fn, null); },
      writable: true, configurable: true
    });
    Object.defineProperty(rootRunner, 'withFailureHandler', {
      value: function(fn) { return _makeRunner(null, fn); },
      writable: true, configurable: true
    });

    root.google.script.run = rootRunner;
    root.gasApi = gasApi;

    console.log('[GasAPI] Polyfill google.script.run terpasang. GAS URL:', GAS_URL);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BOOTSTRAP VERCEL APP
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Bootstrap dipanggil saat DOM siap.
   * Mengambil config dari GAS dan mengisi template-template yang
   * sebelumnya diisi oleh <?= cfg.* ?> di GAS doGet.
   *
   * Elemen yang di-update:
   *   - #login-title       → cfg.app_name
   *   - #login-subtitle    → cfg.app_subtitle
   *   - [data-cfg-logo]    → cfg.app_logo (src)
   *   - [data-cfg-bg]      → cfg.app_background (background-image)
   *   - window.APP_TIMEZONE
   *   - window.__appCfg    → seluruh cfg object
   */
  function _bootstrap() {
    gasApi.getConfig()
      .then(function(cfg) {
        root.__appCfg      = cfg;
        root.APP_TIMEZONE  = cfg.timezone || 'Asia/Jakarta';
        root._appTimezone  = cfg.timezone || 'Asia/Jakarta';

        // Update <title>
        if (cfg.app_name) document.title = cfg.app_name + ' | Ujian Online';

        // Update elemen HTML yang sebelumnya menggunakan <?= cfg.* ?>
        // Semua elemen bertanda data-cfg="*" diisi di bawah.

        // Logo: semua img dengan data-cfg="logo" atau src mengandung placeholder
        document.querySelectorAll('[data-cfg="logo"], img[src*="cfg.app_logo"]').forEach(function(el) {
          if (cfg.app_logo) el.src = cfg.app_logo;
        });

        // App name di semua elemen bertanda data-cfg="app_name"
        document.querySelectorAll('[data-cfg="app_name"]').forEach(function(el) {
          el.textContent = cfg.app_name || '';
        });

        // App subtitle
        document.querySelectorAll('[data-cfg="app_subtitle"]').forEach(function(el) {
          el.textContent = cfg.app_subtitle || '';
        });

        // Background
        var bgTargets = document.querySelectorAll('[data-cfg="background"]');
        if (bgTargets.length && cfg.app_background) {
          bgTargets.forEach(function(el) {
            el.style.backgroundImage = 'url(' + cfg.app_background + ')';
          });
        }

        // Kirim event agar index.html bisa bereaksi
        var ev = new CustomEvent('gasConfigLoaded', { detail: cfg });
        document.dispatchEvent(ev);
      })
      .catch(function(err) {
        console.warn('[GasAPI] Bootstrap config gagal:', err.message);
        // Tetap kirim event dengan cfg kosong agar app tidak hang
        var ev = new CustomEvent('gasConfigLoaded', { detail: {} });
        document.dispatchEvent(ev);
      });
  }

  function _setCfgElement(selector, value) {
    var el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // .env HELPER — untuk dev lokal
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Jika ada div#__GAS_CONFIG__ di halaman (di-inject saat build Vercel),
   * ambil GAS_URL dari sana.
   *
   * Cara pakai di index.html:
   *   <div id="__GAS_CONFIG__" data-gas-url="https://script.google.com/...exec" style="display:none"></div>
   */
  function _readConfigDiv() {
    var div = document.getElementById('__GAS_CONFIG__');
    if (div && div.dataset && div.dataset.gasUrl) {
      var url = div.dataset.gasUrl;
      if (url && url !== '__GAS_URL_PLACEHOLDER__') {
        GAS_URL = url;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════════

  // Pasang polyfill segera (sebelum DOM ready) agar panggilan awal script tidak gagal
  _install();

  // Setelah DOM siap: baca config div dan bootstrap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      _readConfigDiv();
      // Re-resolve URL setelah DOM siap (mungkin ada meta tag atau config div)
      GAS_URL = _resolveGasUrl();
      if (GAS_URL === '__GAS_URL_PLACEHOLDER__') _readConfigDiv();
      _bootstrap();
    });
  } else {
    _readConfigDiv();
    GAS_URL = _resolveGasUrl();
    _bootstrap();
  }

  // Expose gasApi secara global (untuk penggunaan langsung dari console/test)
  root.gasApi = gasApi;

})(window);
