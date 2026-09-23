/**
 * audio.js — Folder Audio
 * renderAudioFolder() + audio picker + upload handlers
 * Sumber: index.html L33554-34538
 */

function renderAudioFolder(container) {
    if (!container) return;

    const isAdmin = currentUser && currentUser.role === 'Admin';

    container.innerHTML = `
      <div class="if-page fade-in">
        <div class="if-header">
          <div>
            <h2><i class="fas fa-music mr-2"></i>Folder Audio</h2>
            <p>Galeri audio (mp3) yang siap dilampirkan ke soal ujian melalui Direct Link.</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button onclick="loadAudioTable()" class="um-header-btn"><i class="fas fa-rotate"></i> <span class="hidden sm:inline">Refresh</span></button>
          </div>
        </div>

        ${isAdmin ? `
          <div id="audio-upload-folder-status" class="if-card hidden">
            <div class="if-card-body" id="audio-upload-folder-status-body"></div>
          </div>
        ` : ''}

        <!-- Mount point for task 10.5 (Admin folder import) -->
        <div id="audio-import-mount"></div>

        <!-- Mount point for task 10.4 (upload controls) -->
        <div id="audio-upload-mount"></div>

        <div class="if-card">
          <div class="if-card-head">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i class="fas fa-music text-indigo-600"></i>Riwayat Audio Tersimpan
            </h3>
          </div>
          <div id="audio-table-container">
            <div class="p-6">
              ${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    loadAudioTable();

    // Task 10.4 — mount upload controls into #audio-upload-mount
    _mountAudioUpload();

    // Task 10.5 — mount the Admin-only Drive folder import card into
    // #audio-import-mount. The mount function itself is a no-op for non-Admin
    // users so the AC 5.1 visibility rule is enforced in one place.
    _mountAudioImport();

    if (isAdmin) {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success && res.folderId) _showAudioUploadFolderStatus('set');
          else _showAudioUploadFolderStatus('unset');
        })
        .withFailureHandler(() => { _showAudioUploadFolderStatus('unset'); })
        .getAudioUploadFolderId(currentUser.userID, currentUser.token);
    }
}

function _showAudioUploadFolderStatus(state) {
  const wrap = document.getElementById('audio-upload-folder-status');
  const body = document.getElementById('audio-upload-folder-status-body');
  if (!wrap || !body) return;
  wrap.classList.remove('hidden');
  if (state === 'set') {
    body.innerHTML = `
      <div class="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <i class="fas fa-circle-check"></i>
        <span>Folder upload audio sudah dikonfigurasi. Unggahan akan disimpan ke folder tersebut.</span>
      </div>`;
  } else {
    body.innerHTML = `
      <div class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        <i class="fas fa-triangle-exclamation"></i>
        <span>Folder upload audio belum dikonfigurasi. Atur lewat halaman <b>Konfigurasi Sistem</b> sebelum mengunggah file.</span>
      </div>`;
  }
}

function loadAudioTable() {
    const container = document.getElementById('audio-table-container');
    if (!container) return;
    container.innerHTML = `<div class="p-6">${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}</div>`;

    google.script.run
      .withSuccessHandler(data => {
        allAudioData = Array.isArray(data) ? data : [];
        _afRenderGallery(allAudioData);
      })
      .withFailureHandler(err => {
        container.innerHTML = `
          <div class="dash-error-state max-w-md mx-auto m-6">
            <div class="ico"><i class="fas fa-triangle-exclamation"></i></div>
            <h3 class="font-bold text-base text-red-700 mb-1">Gagal Memuat Galeri Audio</h3>
            <p class="text-xs text-red-600 mb-4">${((err && err.message) || err || '').toString().replace(/</g,'&lt;')}</p>
            <button onclick="loadAudioTable()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
              <i class="fas fa-rotate-right"></i> Coba Lagi
            </button>
          </div>`;
      })
      .getSavedAudio();
}

function _afRenderGallery(items) {
  const container = document.getElementById('audio-table-container');
  if (!container) return;

  if (!Array.isArray(items) || items.length === 0) {
    container.innerHTML = `
      <div class="dash-empty">
        <div class="dash-empty-icon"><i class="fas fa-music"></i></div>
        <p class="font-bold text-slate-700 text-sm">Belum ada audio tersimpan.</p>
        <p class="text-xs text-slate-400 mt-1 mb-3">Unggah file mp3 atau impor dari folder Drive untuk mulai mengisi galeri.</p>
      </div>`;
    return;
  }

  const cardsHtml = items.map((aud, i) => _afBuildCard(aud, i)).join('');
  container.innerHTML = `
    <div class="if-cards" style="display:grid;">${cardsHtml}</div>
    <div class="if-pagination"><span>Menampilkan <b class="text-slate-700">${items.length}</b> audio</span></div>
  `;
}

function _afBuildCard(aud, idx) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  const isProtected = !!aud.uploaderID;
  const isMine = isProtected && currentUser && String(aud.uploaderID) === String(currentUser.userID);
  const inputId = `af-link-${idx}`;
  const link = String(aud.link || '');

  return `
    <div class="if-card-img">
      <div class="if-card-img-body">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-slate-700 text-sm break-all flex-1 min-w-0" title="${escAttr(aud.name)}">
            <i class="fas fa-file-audio text-indigo-400 mr-1"></i>${escHtml(aud.name || '-')}
          </span>
          ${isProtected ? `<span class="if-protected-badge"><i class="fas fa-lock"></i>${isMine ? 'Milikku' : 'Dilindungi'}</span>` : ''}
        </div>
        <div class="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
          <span><i class="far fa-clock"></i> ${escHtml(aud.date || '-')}</span>
          ${isProtected ? `<span class="font-mono">· ${escHtml(aud.uploaderID)}</span>` : ''}
        </div>
        ${link ? _driveAudioHtml(link, aud.name || 'Audio MP3', '') : ''}
        <div class="if-link-box">
          <input type="text" value="${escAttr(link)}" readonly id="${inputId}">
          <button class="if-link-copy" onclick="copyLink('${inputId}')" title="Salin link">
            <i class="fas fa-copy"></i> <span>Copy</span>
          </button>
        </div>
      </div>
      <div class="if-card-img-foot">
        <span class="text-[10px] text-slate-400 font-mono"><i class="fas fa-fingerprint mr-1"></i>${escHtml(aud.id || '-')}</span>
        <button class="um-action-btn um-action-del" onclick="deleteAudio('${escAttr(aud.id)}')" title="Hapus dari list">
          <i class="fas fa-trash-can"></i>
        </button>
      </div>
    </div>`;
}

// ============================================================================
// Task 10.4 — Audio upload controls + frontend Mp3_Guard
// Mirrors handleImgFileSelect / startImageUpload but for mp3. The upload UI
// is injected into the #audio-upload-mount placeholder owned by task 10.2.
// ============================================================================

// ============================================================================
// Audio Playback Helper
// Google Drive "uc?export=download" links trigger a 302 redirect to a
// cookie-authenticated URL with CORS headers that are incompatible with the
// native <audio> element when the page is served from Apps Script
// (script.googleusercontent.com). The browser silently drops the request.
//
// The fix: extract the Drive fileId from the stored link and use
// https://drive.google.com/file/d/<id>/preview inside a sandboxed <iframe>.
// This URL serves a Google-hosted player page directly — no redirect, no
// CORS issue, and it supports mp3 natively.
//
// _driveFileIdFromLink(link) → fileId string or '' if not extractable.
// _driveAudioHtml(link, fileName, variant) → HTML string: premium player card or ''.
// _driveAudioEl(link, fileName, variant) → DOM element: same but returns an Element.
// ============================================================================

function _driveFileIdFromLink(link) {
  if (!link) return '';
  var s = String(link);
  // Pattern 1: "uc?export=download&id=<id>" or "uc?id=<id>&export=..."
  var m = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return m[1];
  // Pattern 2: "/file/d/<id>/..."
  var m2 = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m2 && m2[1]) return m2[1];
  return '';
}

/**
 * Builds a premium audio player card wrapping the Drive /preview iframe.
 *
 * @param {string} link        - Drive direct link stored in DB.
 * @param {string} [fileName]  - Display name shown above the iframe.
 * @param {string} [variant]   - '' (gallery default) | 'compact' | 'exam' | 'editor'
 * @returns {string} HTML string, or '' when fileId cannot be extracted.
 */
function _driveAudioHtml(link, fileName, variant) {
  var fileId = _driveFileIdFromLink(link);
  if (!fileId) return '';
  var name   = (typeof fileName === 'string' && fileName.trim()) ? fileName.trim() : 'Audio MP3';
  var varCls = variant === 'compact' ? ' aud-compact'
             : variant === 'exam'    ? ' aud-exam'
             : variant === 'editor'  ? ' aud-editor'
             : '';
  var eName  = name.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  var src    = 'https://drive.google.com/file/d/' + fileId + '/preview';
  return '<div class="aud-player-wrap' + varCls + '">'
    + '<div class="aud-player-top">'
    +   '<div class="aud-player-icon"><i class="fas fa-music"></i></div>'
    +   '<div class="aud-player-meta">'
    +     '<div class="aud-player-name" title="' + eName + '">' + eName + '</div>'
    +     '<div class="aud-player-sub">'
    +       '<span class="aud-pulse-dot"></span>'
    +       '<span class="aud-player-badge"><i class="fas fa-headphones" style="font-size:7px"></i>&nbsp;MP3 &middot; Drive</span>'
    +     '</div>'
    +   '</div>'
    + '</div>'
    + '<div class="aud-player-iframe-wrap">'
    +   '<iframe src="' + src + '" allow="autoplay" sandbox="allow-scripts allow-same-origin" title="Audio player"></iframe>'
    + '</div>'
    + '</div>';
}

/** Returns a DOM Element version of _driveAudioHtml (for JS-based DOM insertion). */
function _driveAudioEl(link, fileName, variant) {
  var html = _driveAudioHtml(link, fileName, variant);
  if (!html) return null;
  var tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.firstElementChild;
}

// ============================================================================
// Frontend Mp3_Guard. Mirrors `isMp3File` from audio/audioLogic.js in or-mode
// (extension OR MIME) per AC 4.4/4.5: a file is accepted when its name ends
// with ".mp3" (case-insensitive) OR its MIME is audio/mpeg | audio/mp3.
function _isMp3FileFE(file) {
  if (!file) return false;
  var name = String(file.name || '');
  var mime = String(file.type || '').toLowerCase();
  var extOk  = /\.mp3$/i.test(name);
  var mimeOk = (mime === 'audio/mpeg' || mime === 'audio/mp3');
  return extOk || mimeOk;
}

let _audioUploadQueue = [];

// Mount the upload card into #audio-upload-mount. Called from renderAudioFolder
// after the page HTML is in place. Visible to any authenticated user (mirrors
// the image upload card visibility); folder-import controls (task 10.5) are
// the Admin-only piece and live in #audio-import-mount.
function _mountAudioUpload() {
  const mount = document.getElementById('audio-upload-mount');
  if (!mount) return;
  if (!currentUser) { mount.innerHTML = ''; return; }

  mount.innerHTML = `
    <div class="if-card">
      <div class="if-card-head">
        <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
          <i class="fas fa-cloud-upload-alt text-indigo-600"></i>Upload Audio
        </h3>
      </div>
      <div class="if-card-body">
        <div id="audio-upload-drop-area" class="if-drop"
             onclick="document.getElementById('audio-file-input').click()"
             ondragover="event.preventDefault(); this.classList.add('dragover');"
             ondragleave="this.classList.remove('dragover');"
             ondrop="handleAudioFileDrop(event)">
          <div class="if-drop-ico"><i class="fas fa-file-audio"></i></div>
          <p class="font-bold text-slate-700 text-sm">Klik atau Seret &amp; Lepas file mp3 ke sini</p>
          <p class="text-xs text-slate-400 mt-1">Format: <b>MP3</b> · Maks <b>20 MB</b> per file</p>
          <input type="file" id="audio-file-input" class="hidden" accept=".mp3,audio/mpeg" multiple onchange="handleAudioFileSelect(this.files)">
        </div>

        <div id="audio-upload-queue" class="if-queue hidden"></div>

        <div class="mt-3 flex justify-end gap-2" id="audio-upload-actions" style="display:none;">
          <button onclick="_clearAudioUploadQueue()" class="px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Bersihkan</button>
          <button id="btn-start-audio-upload" onclick="startAudioUpload()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold shadow transition flex items-center gap-2 active:scale-95">
            <i class="fas fa-upload"></i> Upload Semua
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleAudioFileSelect(files) {
  _addAudioFilesToQueue(Array.from(files || []));
}

function handleAudioFileDrop(e) {
  e.preventDefault();
  const area = document.getElementById('audio-upload-drop-area');
  if (area) area.classList.remove('dragover');
  _addAudioFilesToQueue(Array.from((e.dataTransfer && e.dataTransfer.files) || []));
}

function _addAudioFilesToQueue(files) {
  const MAX_BYTES = 20 * 1024 * 1024; // 20 MB cap (audio is heavier than images).
  const rejected = [];
  files.forEach(f => {
    // Mp3_Guard frontend (AC 4.4 / 4.5): reject non-mp3 before queueing and do
    // not call the service. Inline message goes into the rejection summary.
    if (!_isMp3FileFE(f)) {
      rejected.push(`${f.name} (Hanya file mp3 yang diizinkan)`);
      return;
    }
    if (f.size > MAX_BYTES) {
      rejected.push(`${f.name} (>${(MAX_BYTES/1024/1024).toFixed(0)} MB)`);
      return;
    }
    // Surface duplicate adds (same name+size already queued) instead of
    // silently dropping them — the user otherwise wonders why the file
    // didn't show up in the upload queue.
    if (_audioUploadQueue.find(q => q.name === f.name && q.size === f.size)) {
      rejected.push(`${f.name} (sudah ada di antrian)`);
      return;
    }
    _audioUploadQueue.push({ file: f, name: f.name, size: f.size, status: 'pending', progress: 0 });
  });
  if (rejected.length) {
    Swal.fire({
      title: 'Sebagian File Ditolak',
      html: `<p style="font-size:13px;color:#475569;">${rejected.length} file tidak bisa ditambahkan:</p>
             <ul style="text-align:left;font-size:12px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px 12px;margin-top:8px;list-style:disc;padding-left:24px;">
               ${rejected.map(r => `<li>${r.replace(/</g,'&lt;')}</li>`).join('')}
             </ul>`,
      icon: 'warning', confirmButtonColor: '#db2777',
      customClass: { popup: 'lp-swal' }
    });
  }
  _renderAudioUploadQueue();
}

function _renderAudioUploadQueue() {
  const container = document.getElementById('audio-upload-queue');
  const actions   = document.getElementById('audio-upload-actions');
  if (!container) return;
  if (_audioUploadQueue.length === 0) {
    container.classList.add('hidden');
    if (actions) actions.style.display = 'none';
    return;
  }
  container.classList.remove('hidden');
  if (actions) actions.style.display = 'flex';

  const iconMap = {
    pending:   { ico: 'fa-clock',                 cls: 'text-slate-400'   },
    uploading: { ico: 'fa-circle-notch fa-spin',  cls: 'text-blue-500'    },
    done:      { ico: 'fa-check-circle',          cls: 'text-emerald-500' },
    error:     { ico: 'fa-circle-exclamation',    cls: 'text-red-500'     }
  };

  container.innerHTML = _audioUploadQueue.map((item, i) => {
    const ic = iconMap[item.status] || iconMap.pending;
    return `
      <div class="if-queue-item">
        <i class="if-q-ico fas ${ic.ico} ${ic.cls}"></i>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="if-q-name">${String(item.name || '').replace(/</g,'&lt;')}</span>
            <span class="if-q-size">${(item.size/1024).toFixed(1)} KB</span>
            ${item.status === 'pending'
              ? `<button class="if-q-rm" onclick="_removeAudioFromQueue(${i})" title="Hapus dari antrian"><i class="fas fa-times"></i></button>`
              : ''}
          </div>
          ${item.status === 'uploading' ? `<div class="if-q-progress"><div class="if-q-progress-bar" style="width:${item.progress || 30}%;"></div></div>` : ''}
          ${item.status === 'error' ? `<div class="text-[11px] text-red-500 mt-1">${(item.error || 'Gagal').replace(/</g,'&lt;')}</div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function _removeAudioFromQueue(idx) {
  _audioUploadQueue.splice(idx, 1);
  _renderAudioUploadQueue();
}

function _clearAudioUploadQueue() {
  if (_audioUploadQueue.some(q => q.status === 'uploading')) {
    Swal.fire({
      title: 'Sedang Mengupload',
      html: '<p style="font-size:13px;color:#475569;">Tunggu sampai upload selesai sebelum membersihkan antrian.</p>',
      icon: 'info', confirmButtonColor: '#6366f1',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }
  _audioUploadQueue = [];
  _renderAudioUploadQueue();
}

function startAudioUpload() {
  const pending = _audioUploadQueue.filter(q => q.status === 'pending');
  if (!pending.length) {
    Swal.fire({
      title: 'Tidak Ada File',
      html: '<p style="font-size:13px;color:#475569;">Tidak ada file menunggu untuk diupload.</p>',
      icon: 'info', confirmButtonColor: '#6366f1',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }
  const btn = document.getElementById('btn-start-audio-upload');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...'; }
  _audioUploadNext();
}

function _audioUploadNext() {
  const idx = _audioUploadQueue.findIndex(q => q.status === 'pending');
  if (idx < 0) {
    const btn = document.getElementById('btn-start-audio-upload');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Upload Semua'; }
    const doneCount  = _audioUploadQueue.filter(q => q.status === 'done').length;
    const errorCount = _audioUploadQueue.filter(q => q.status === 'error').length;
    const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2400, timerProgressBar: true });
    if (errorCount === 0) Toast.fire({ icon: 'success', title: `${doneCount} audio berhasil diupload` });
    else Toast.fire({ icon: 'warning', title: `${doneCount} berhasil, ${errorCount} gagal` });
    if (doneCount > 0) loadAudioTable();
    _audioUploadQueue = _audioUploadQueue.filter(q => q.status !== 'done');
    _renderAudioUploadQueue();
    return;
  }

  _audioUploadQueue[idx].status = 'uploading';
  _audioUploadQueue[idx].progress = 30;
  _renderAudioUploadQueue();

  const item = _audioUploadQueue[idx];
  const reader = new FileReader();
  reader.onprogress = (ev) => {
    if (ev.lengthComputable) {
      const pct = Math.min(60, Math.round(ev.loaded / ev.total * 60));
      if (_audioUploadQueue[idx]) {
        _audioUploadQueue[idx].progress = pct;
        _renderAudioUploadQueue();
      }
    }
  };
  reader.onload = function(e) {
    if (_audioUploadQueue[idx]) {
      _audioUploadQueue[idx].progress = 75;
      _renderAudioUploadQueue();
    }
    const base64Full = e.target.result;
    const commaIdx   = String(base64Full).indexOf(',');
    const base64Data = commaIdx >= 0 ? base64Full.substring(commaIdx + 1) : base64Full;
    google.script.run
      .withSuccessHandler(res => {
        if (_audioUploadQueue[idx]) {
          _audioUploadQueue[idx].status = (res && res.success) ? 'done' : 'error';
          _audioUploadQueue[idx].progress = 100;
          if (!res || !res.success) _audioUploadQueue[idx].error = (res && res.message) || 'Gagal';
        }
        _renderAudioUploadQueue();
        _audioUploadNext();
      })
      .withFailureHandler(err => {
        if (_audioUploadQueue[idx]) {
          _audioUploadQueue[idx].status = 'error';
          _audioUploadQueue[idx].error  = (err && err.message) || String(err) || 'Error';
        }
        _renderAudioUploadQueue();
        _audioUploadNext();
      })
      .uploadAudioFile(base64Data, item.name, item.file.type, currentUser.userID, currentUser.token);
  };
  reader.onerror = function() {
    if (_audioUploadQueue[idx]) {
      _audioUploadQueue[idx].status = 'error';
      _audioUploadQueue[idx].error  = 'Gagal membaca file';
    }
    _renderAudioUploadQueue();
    _audioUploadNext();
  };
  reader.readAsDataURL(item.file);
}

// ============================================================================
// Task 10.5 — Admin folder import + delete handlers
// Mounts the Drive_Audio_Folder import card (Admin-only) into
// #audio-import-mount, and implements `handleGenerateAudio` (mirror of
// `handleGenerateImages`) plus `deleteAudio` (confirm-and-delete; mirrors
// `deleteImage`). Both are wired to backend functions in `Code.gs`:
// `processFolderAudio(folderId, requestorID, requestorToken)` and
// `deleteSavedAudio(audioId, enteredPassword, requestorID, requestorToken)`.
// ============================================================================

// Mount the Admin-only Drive folder import card. Visibility (AC 5.1) is
// gated here in one place: non-Admin users get an empty mount.
function _mountAudioImport() {
  const mount = document.getElementById('audio-import-mount');
  if (!mount) return;
  const isAdmin = currentUser && currentUser.role === 'Admin';
  if (!isAdmin) { mount.innerHTML = ''; return; }

  mount.innerHTML = `
    <div class="if-card">
      <div class="if-card-head">
        <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
          <i class="fab fa-google-drive text-pink-600"></i>Generator Link dari Folder Drive (Audio)
        </h3>
      </div>
      <div class="if-card-body">
        <p class="text-xs text-slate-500 mb-3">
          Paste URL Folder Google Drive — sistem akan mengekstrak semua file <b>mp3</b> di dalamnya.
          Pastikan akses folder: <b>Anyone with the link</b>.
        </p>

        <label for="af-folder-url" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          <i class="fas fa-link mr-1 text-pink-500"></i>URL Folder Google Drive
        </label>

        <div class="if-folder-input-row">
          <div class="if-folder-input-wrap">
            <i class="fab fa-google-drive if-folder-input-ico"></i>
            <input type="url" id="af-folder-url"
              placeholder="Tempel link folder di sini..."
              autocomplete="off" spellcheck="false"
              onkeydown="if(event.key==='Enter'){event.preventDefault();handleGenerateAudio();}"
              class="if-folder-input">
            <button type="button" id="af-folder-clear" class="if-folder-clear-btn" onclick="_afClearFolderUrl()" title="Bersihkan input" aria-label="Bersihkan">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <button onclick="handleGenerateAudio()" class="if-folder-submit-btn">
            <i class="fas fa-magic"></i> <span>Hasilkan Link</span>
          </button>
        </div>
        <p class="text-[11px] text-slate-400 mt-2 flex items-start gap-1">
          <i class="fas fa-info-circle text-slate-300 mt-0.5"></i>
          <span>Format yang didukung: <code class="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">drive.google.com/drive/folders/...</code></span>
        </p>
      </div>
    </div>
  `;
}

function _afClearFolderUrl() {
  const inp = document.getElementById('af-folder-url');
  if (!inp) return;
  inp.value = '';
  inp.focus();
}

// Frontend mirror of `extractDriveFolderId` from audio/audioLogic.js (AC 5.2).
// The Node module isn't loadable in the browser, so the same three-step
// extraction (`folders/<id>` → `?id=<id>` → raw fallback) is reproduced here.
function _extractAudioFolderIdFE(input) {
  const s = String(input == null ? '' : input);
  const m1 = s.match(/folders\/([^/?]+)/);
  if (m1) return m1[1];
  const m2 = s.match(/[?&]id=([^&]+)/);
  if (m2) return m2[1];
  return s.trim();
}

// AC 5.1 — Admin pastes a Drive folder URL/id, the handler extracts the folder
// id, validates it, then dispatches to the backend `processFolderAudio`.
function handleGenerateAudio() {
  const url = (document.getElementById('af-folder-url') || {}).value;
  const cleaned = String(url || '').trim();

  if (!cleaned) {
    Swal.fire({
      title: 'Link Folder Kosong',
      html: '<p style="font-size:13px;color:#475569;">Masukkan link folder Google Drive terlebih dahulu.</p>',
      icon: 'warning', confirmButtonColor: '#db2777',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }

  const folderId = _extractAudioFolderIdFE(cleaned);
  if (!folderId) {
    Swal.fire({
      title: 'Folder ID Tidak Valid',
      html: '<p style="font-size:13px;color:#475569;">Tidak dapat mengekstrak ID folder dari input ini.</p>',
      icon: 'warning', confirmButtonColor: '#db2777',
      customClass: { popup: 'lp-swal' }
    });
    return;
  }

  // Soft URL-shape check (mirror handleGenerateImages). If the input doesn't
  // look like a Drive URL nor a raw id (≥10 url-safe chars), confirm before
  // proceeding instead of rejecting outright — admins sometimes paste raw ids.
  const looksLikeDriveUrl = /drive\.google\.com\/(drive\/folders|drive\/u\/\d+\/folders|open\?id=|folders\/)/i.test(cleaned);
  const looksLikeRawId    = /^[A-Za-z0-9_-]{10,}$/.test(cleaned);
  if (!looksLikeDriveUrl && !looksLikeRawId) {
    Swal.fire({
      title: 'Format URL Tidak Dikenali',
      html: `<p style="font-size:13px;color:#475569;">Sepertinya bukan URL folder Google Drive yang valid.</p>
             <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Contoh format yang benar:<br>
             <code style="background:#f8fafc;padding:2px 6px;border-radius:4px;font-size:11px;">https://drive.google.com/drive/folders/...</code></p>`,
      icon: 'warning', confirmButtonColor: '#db2777',
      showCancelButton: true, confirmButtonText: 'Lanjutkan Saja', cancelButtonText: 'Batal',
      customClass: { popup: 'lp-swal' }
    }).then(res => { if (res.isConfirmed) _runGenerateAudio(folderId); });
    return;
  }

  _runGenerateAudio(folderId);
}

function _runGenerateAudio(folderId) {
  const btn = document.querySelector('button[onclick="handleGenerateAudio()"]');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Memproses...</span>'; }

  google.script.run
    .withSuccessHandler(res => {
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      if (res && res.success) {
        const msg = res.count > 0
          ? `<b>${res.count}</b> audio baru ditambahkan${res.skipped > 0 ? `, ${res.skipped} sudah ada sebelumnya` : ''}.`
          : `Tidak ada audio baru. ${res.skipped || 0} audio sudah ada di database.`;
        Swal.fire({
          icon: res.count > 0 ? 'success' : 'info',
          title: res.count > 0 ? 'Berhasil' : 'Selesai',
          html: `<p style="font-size:13px;color:#475569;">${msg}</p>`,
          confirmButtonColor: '#db2777',
          customClass: { popup: 'lp-swal' }
        });
        _afClearFolderUrl();
        loadAudioTable();
      } else {
        Swal.fire({
          title: 'Gagal',
          html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
          icon: 'error', confirmButtonColor: '#dc2626',
          customClass: { popup: 'lp-swal' }
        });
      }
    })
    .withFailureHandler(err => {
      if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
      Swal.fire({
        title: 'Error Server',
        html: `<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
        icon: 'error', confirmButtonColor: '#dc2626',
        customClass: { popup: 'lp-swal' }
      });
    })
    .processFolderAudio(folderId, currentUser.userID, currentUser.token);
}

// AC 9.1 — Confirm-and-delete handler. Mirrors `deleteImage`: Admin or owner
// (uploader) deletes without password; otherwise the upload owner's password
// must be verified via `verifyAudioAccess` before the deletion proceeds.
function deleteAudio(id) {
  const isAdmin = currentUser && currentUser.role === 'Admin';
  const aud = (allAudioData || []).find(a => String(a.id) === String(id));
  const name = aud ? (aud.name || '') : '';
  const uploaderID = aud ? (aud.uploaderID || '') : '';
  const isOwner = uploaderID && currentUser && String(uploaderID) === String(currentUser.userID);
  const needsPassword = !isAdmin && uploaderID && !isOwner;

  const _doConfirm = (pwd) => {
    Swal.fire({
      title: 'Hapus Audio?',
      html: `<p style="font-size:13px;color:#475569;">Anda akan menghapus <b>${(name || 'audio ini').replace(/</g,'&lt;')}</b> dari daftar database.</p>
             <p style="font-size:11px;color:#1d4ed8;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:8px 12px;margin-top:8px;">
               <i class="fas fa-circle-info"></i> File asli di Google Drive <b>tidak akan dihapus</b>.
             </p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: '<i class="fas fa-trash-can mr-1"></i> Ya, Hapus dari Daftar',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: { popup: 'lp-swal' }
    }).then(res => {
      if (!res.isConfirmed) return;

      google.script.run
        .withSuccessHandler(r => {
          if (r && r.success) {
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1600, timerProgressBar: true });
            Toast.fire({ icon: 'success', title: 'Audio dihapus dari daftar' });
            loadAudioTable();
          } else {
            Swal.fire({
              title: 'Gagal', html: `<p style="font-size:13px;color:#475569;">${(r && r.message) || 'Terjadi kesalahan'}</p>`,
              icon: 'error', confirmButtonColor: '#dc2626',
              customClass: { popup: 'lp-swal' }
            });
          }
        })
        .withFailureHandler(err => {
          Swal.fire({
            title: 'Error Server',
            html: `<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
            icon: 'error', confirmButtonColor: '#dc2626',
            customClass: { popup: 'lp-swal' }
          });
        })
        .deleteSavedAudio(id, pwd, currentUser.userID, currentUser.token);
    });
  };

  if (!needsPassword) { _doConfirm(''); return; }

  // Reuse the shared password-prompt helper. The modal is media-agnostic; the
  // title/subtitle make the audio context clear to the user.
  _showImagePasswordModal('Konfirmasi Hapus',
    'Audio ini dilindungi. Masukkan password pengguna pengupload untuk menghapus dari database.',
    (pwd) => {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success) _doConfirm(pwd);
          else Swal.fire({
            icon: 'error', title: 'Akses Ditolak',
            html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Password salah.'}</p>`,
            confirmButtonColor: '#dc2626',
            customClass: { popup: 'lp-swal' }
          });
        })
        .withFailureHandler(err => {
          Swal.fire({
            title: 'Error Server',
            html: `<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
            icon: 'error', confirmButtonColor: '#dc2626',
            customClass: { popup: 'lp-swal' }
          });
        })
        .verifyAudioAccess(id, pwd, currentUser.userID, currentUser.token);
    }
  );
}

// ============================================================================
// Task 11.1 — Audio_Picker modal + selection
// Mirrors the Image_Picker pattern (`_openImgPickerModal` / `_filterImgPickerResults`
// / `_selectImgPickerItem`) but exposes a generic callback-based entry point,
// `openAudioPicker(callback)`, so the caller (Bank_Soal editor) can persist the
// chosen Direct_Link onto the question being edited.
//
// Element ids/classes match the design (AC 6.1/6.2/6.3/6.5/6.6):
//   - modal: #audio-picker-modal
//   - search input: #audio-picker-search
//   - list container: #audio-picker-list
//   - item rows: .audio-picker-item
//
// Selection authorization mirrors the image flow: Admins bypass; for non-Admins
// with an uploader-protected audio the modal collects a password via the shared
// `_showImagePasswordModal` helper and verifies it through `verifyAudioAccess`
// before invoking the caller's callback with the audio object.
// ============================================================================

// Public entry. `callback` receives the selected audio object
// `{ id, name, link, folderId?, date?, uploaderID? }` after authorization.
// If `allAudioData` is empty, fetches via `getSavedAudio` first (AC 6.2/6.6).
function openAudioPicker(callback) {
  const cb = typeof callback === 'function' ? callback : null;

  if (!Array.isArray(allAudioData) || allAudioData.length === 0) {
    google.script.run
      .withSuccessHandler(data => {
        allAudioData = Array.isArray(data) ? data : [];
        _openAudioPickerModal(cb);
      })
      .withFailureHandler(err => {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Memuat Audio',
          html: `<p style="font-size:13px;color:#475569;">${(err && err.message) || err || 'Terjadi kesalahan.'}</p>`,
          confirmButtonColor: '#dc2626',
          customClass: { popup: 'lp-swal' }
        });
      })
      .getSavedAudio();
  } else {
    _openAudioPickerModal(cb);
  }
}

// Build the picker modal DOM, render the list (or empty-state), and wire up
// the close affordances (X button, backdrop click, ESC key).
function _openAudioPickerModal(callback) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  const auds = Array.isArray(allAudioData) ? allAudioData : [];
  const modalId = 'audio-picker-modal';

  const existing = document.getElementById(modalId);
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = modalId;
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" data-audio-picker-card>
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <i class="fas fa-music text-indigo-500"></i>
          <span class="font-bold text-slate-700 text-sm">Pilih Audio dari Folder</span>
        </div>
        <button type="button" id="audio-picker-close" class="text-slate-400 hover:text-slate-600 transition text-lg leading-none" aria-label="Tutup">&times;</button>
      </div>
      <div class="px-5 py-3 border-b border-slate-100">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none"><i class="fas fa-search text-xs"></i></span>
          <input type="text" id="audio-picker-search" placeholder="Cari nama audio..."
                 class="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition"
                 oninput="_filterAudioPickerResults(this.value)" autocomplete="off">
        </div>
      </div>
      <div id="audio-picker-list" class="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-1">
        ${auds.length === 0
          ? '<p class="text-center text-xs text-slate-400 italic py-8">Folder audio kosong atau belum dimuat.</p>'
          : auds.map(aud => {
              const link       = String(aud.link || '');
              const uploader   = aud.uploaderID || '';
              const isProtected = !!uploader;
              return `
                <div class="audio-picker-item flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50 cursor-pointer transition"
                     data-name="${escAttr((aud.name || '').toLowerCase())}"
                     data-link="${escAttr(link)}"
                     data-id="${escAttr(aud.id || '')}"
                     data-uploader="${escAttr(uploader)}"
                     onclick="_selectAudioPickerItem(this)">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-500 shrink-0">
                    <i class="fas fa-file-audio"></i>
                  </div>
                  <div class="overflow-hidden flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-700 truncate flex items-center gap-1.5">
                      <span class="truncate">${escHtml(aud.name || '-')}</span>
                      ${isProtected ? '<i class="fas fa-lock text-[9px] text-amber-500 shrink-0" title="Dilindungi password"></i>' : ''}
                    </p>
                    <p class="text-[10px] text-slate-400 truncate font-mono">${escHtml(aud.date || '')}</p>
                    ${link ? `<div onclick="event.stopPropagation()">${_driveAudioHtml(link, aud.name || 'Audio MP3', 'compact')}</div>` : ''}
                  </div>
                  <button type="button"
                          class="audio-picker-select-btn shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition"
                          onclick="event.stopPropagation(); _selectAudioPickerItem(this.closest('.audio-picker-item'))">
                    Pilih
                  </button>
                </div>`;
            }).join('')}
      </div>
      <div class="px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Audio yang dipilih akan dilampirkan ke soal sebagai Direct Link.
      </div>
    </div>`;

  // Stash the caller's callback on the modal element so the selection handler
  // can dispatch back to it after authorization (mirrors how the image picker
  // stashes `_targetEl`/`_tinyEditor`).
  modal._audioCallback = callback || null;

  // Close affordances: X button, backdrop click, ESC key.
  const closeBtn = modal.querySelector('#audio-picker-close');
  if (closeBtn) closeBtn.addEventListener('click', _closeAudioPickerModal);

  modal.addEventListener('click', ev => {
    // Click on the backdrop (modal element itself) closes; clicks inside the
    // card bubble up but their target is a descendant, so contains() catches
    // them.
    const card = modal.querySelector('[data-audio-picker-card]');
    if (card && !card.contains(ev.target)) {
      _closeAudioPickerModal();
    }
  });

  // ESC key: bind on document and remove when the modal closes.
  modal._escHandler = ev => {
    if (ev.key === 'Escape' || ev.key === 'Esc') _closeAudioPickerModal();
  };
  document.addEventListener('keydown', modal._escHandler);

  document.body.appendChild(modal);

  setTimeout(() => {
    const s = document.getElementById('audio-picker-search');
    if (s) s.focus();
  }, 80);
}

// Filter the rendered list by name (case-insensitive substring), mirroring
// the image picker's data-attribute approach. The AC 6.5 acceptance is that
// the displayed items are exactly those whose name contains the term; an
// empty term shows all.
function _filterAudioPickerResults(term) {
  const list = document.getElementById('audio-picker-list');
  if (!list) return;
  const q = String(term || '').toLowerCase().trim();
  list.querySelectorAll('.audio-picker-item').forEach(item => {
    item.style.display = (!q || (item.dataset.name || '').includes(q)) ? '' : 'none';
  });
}

// Selection: read the audio metadata from data-* attributes; if the caller is
// non-Admin and the audio is uploader-protected, prompt for password and
// verify via `verifyAudioAccess` before invoking the callback (AC 6.3).
function _selectAudioPickerItem(itemEl) {
  const modal = document.getElementById('audio-picker-modal');
  if (!modal || !itemEl) return;

  const callback = modal._audioCallback;
  const link     = itemEl.dataset.link || '';
  const audioId  = itemEl.dataset.id || '';
  const name     = (allAudioData || []).find(a => String(a.id) === String(audioId));
  const audObj   = name || { id: audioId, name: '', link };
  // Always carry the freshest Direct_Link from the picker DOM in case the
  // cached entry is stale.
  audObj.link = link;
  const uploader = itemEl.dataset.uploader || '';

  if (!link) { _closeAudioPickerModal(); return; }

  const isAdmin       = currentUser && currentUser.role === 'Admin';
  const isOwner       = uploader && currentUser && String(uploader) === String(currentUser.userID);
  const needsPassword = !isAdmin && uploader && !isOwner;

  const _doDispatch = () => {
    _closeAudioPickerModal();
    if (typeof callback === 'function') callback(audObj);
  };

  if (!needsPassword) {
    _doDispatch();
    return;
  }

  // Close the picker before opening the password prompt so the two modals
  // don't stack visually (matches the image picker's pattern).
  _closeAudioPickerModal();
  _showImagePasswordModal(
    'Konfirmasi Penggunaan Audio',
    'Audio ini dilindungi. Masukkan password pemilik audio untuk menggunakannya di soal ini.',
    (pwd) => {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success) {
            if (typeof callback === 'function') callback(audObj);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Akses Ditolak',
              html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Password salah.'}</p>`,
              confirmButtonColor: '#dc2626',
              customClass: { popup: 'lp-swal' }
            });
          }
        })
        .withFailureHandler(err => {
          Swal.fire({
            icon: 'error',
            title: 'Error Server',
            html: `<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
            confirmButtonColor: '#dc2626',
            customClass: { popup: 'lp-swal' }
          });
        })
        .verifyAudioAccess(audioId, pwd, currentUser.userID, currentUser.token);
    }
  );
}

// Removes the picker modal from the DOM and tears down its ESC keydown listener.
function _closeAudioPickerModal() {
  const modal = document.getElementById('audio-picker-modal');
  if (!modal) return;
  if (modal._escHandler) {