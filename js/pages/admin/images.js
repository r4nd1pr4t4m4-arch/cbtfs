/**
 * images.js — Folder Gambar
 * renderImageFolder() + upload + image picker + _if* helpers
 * Sumber: index.html L34539-36009
 */

    document.removeEventListener('keydown', modal._escHandler);
    modal._escHandler = null;
  }
  modal.remove();
}

// ============================================================================
// Task 12.1 — Persist the audio reference on the Bank_Soal question editor
// Wires the Audio_Picker into the question form (mirrors the image media row):
//   - `openAudioPickerForQuestion()` opens the picker; on selection persists
//     the chosen Direct_Link into the hidden `name="audio"` input so the
//     existing `handleAddQuestion` FormData serialization carries `data.audio`
//     to `addQuestion`/`updateQuestion`.
//   - `setQuestionAudio(aud)` updates the hidden input + preview + player.
//   - `clearQuestionAudio()` removes the attachment.
//   - `_resolveQuestionAudioName(link)` resolves a friendly file name from
//     `allAudioData` when available; falls back to the Drive id or the link.
// ============================================================================
function openAudioPickerForQuestion() {
  if (typeof openAudioPicker !== 'function') return;
  openAudioPicker(function(aud) {
    if (!aud) return;
    setQuestionAudio({
      link: aud.link || '',
      name: aud.name || _resolveQuestionAudioName(aud.link || '')
    });
  });
}

function setQuestionAudio(aud) {
  const link    = (aud && aud.link) ? String(aud.link) : '';
  const display = (aud && aud.name) ? String(aud.name) : (link ? _resolveQuestionAudioName(link) : '');

  const hidden       = document.getElementById('input-question-audio');
  const previewWrap  = document.getElementById('question-audio-preview');
  const nameEl       = document.getElementById('question-audio-name');
  const emptyEl      = document.getElementById('question-audio-empty');
  const playerWrap   = document.getElementById('question-audio-player');

  if (hidden) hidden.value = link;

  if (link) {
    if (nameEl)      nameEl.textContent = display || link;
    if (previewWrap) previewWrap.classList.remove('hidden');
    if (emptyEl)     emptyEl.classList.add('hidden');
    // Replace the <audio> element with a Drive iframe player to avoid
    // the CORS/redirect issue with uc?export=download links.
    if (playerWrap) {
      const iframeEl = _driveAudioEl(link, display || 'Audio MP3', 'editor');
      if (iframeEl) {
        playerWrap.parentNode.replaceChild(iframeEl, playerWrap);
        iframeEl.id = 'question-audio-player';
        iframeEl.classList.remove('hidden');
      } else {
        // Fallback if fileId can't be extracted: show raw <audio>
        playerWrap.src = link;
        playerWrap.classList.remove('hidden');
      }
    }
  } else {
    if (nameEl)      nameEl.textContent = '-';
    if (previewWrap) previewWrap.classList.add('hidden');
    if (emptyEl)     emptyEl.classList.remove('hidden');
    if (playerWrap) {
      // Replace any iframe back to the original hidden <audio> element
      const isIframe = playerWrap.tagName === 'IFRAME';
      if (isIframe) {
        const newAudio = document.createElement('audio');
        newAudio.id = 'question-audio-player';
        newAudio.controls = true;
        newAudio.preload = 'none';
        newAudio.className = 'w-full hidden';
        playerWrap.parentNode.replaceChild(newAudio, playerWrap);
      } else {
        try { playerWrap.pause && playerWrap.pause(); } catch (e) {}
        playerWrap.removeAttribute('src');
        try { playerWrap.load && playerWrap.load(); } catch (e) {}
        playerWrap.classList.add('hidden');
      }
    }
  }
}

function clearQuestionAudio() {
  setQuestionAudio({ link: '', name: '' });
}

function _resolveQuestionAudioName(link) {
  if (!link) return '';
  try {
    if (Array.isArray(allAudioData)) {
      const found = allAudioData.find(a => String(a.link) === String(link));
      if (found && found.name) return found.name;
    }
  } catch (e) {}
  // Fallback: extract Drive file id from the Direct_Link, otherwise show the URL.
  const m = String(link).match(/[?&]id=([^&]+)/);
  if (m && m[1]) return 'Audio (' + m[1].substring(0, 8) + ')';
  return link;
}

function renderImageFolder(container) {
    const isAdmin = currentUser && currentUser.role === 'Admin';

    // State
    // Bug fix: selalu reset state saat halaman di-render ulang agar filter/pencarian
    // dari kunjungan sebelumnya tidak "bocor" ke sesi baru.
    window._imageUI = {
      search: '',
      sortBy: 'date',     // date | name
      sortDir: 'desc',
      page: 1,
      pageSize: 25,
      filterProtected: ''  // ''|'mine'|'protected'|'free'
    };

    container.innerHTML = `
      <div class="if-page fade-in">
        <div class="if-header">
          <div>
            <h2><i class="fas fa-images mr-2"></i>Folder Gambar</h2>
            <p>Galeri gambar yang siap dipasang ke soal ujian melalui Direct Link.</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button onclick="loadImageTable()" class="um-header-btn"><i class="fas fa-rotate"></i> <span class="hidden sm:inline">Refresh</span></button>
          </div>
        </div>

        ${isAdmin ? `
          <div class="if-card">
            <div class="if-card-head">
              <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                <i class="fab fa-google-drive text-pink-600"></i>Generator Link dari Folder Drive
              </h3>
            </div>
            <div class="if-card-body">
              <p class="text-xs text-slate-500 mb-3">
                Paste URL Folder Google Drive — sistem akan mengekstrak semua gambar di dalamnya.
                Pastikan akses folder: <b>Anyone with the link</b>.
              </p>

              <label for="input-folder-url" class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <i class="fas fa-link mr-1 text-pink-500"></i>URL Folder Google Drive
              </label>

              <div class="if-folder-input-row">
                <div class="if-folder-input-wrap">
                  <i class="fab fa-google-drive if-folder-input-ico"></i>
                  <input type="url" id="input-folder-url"
                    placeholder="Tempel link folder di sini..."
                    autocomplete="off" spellcheck="false"
                    onkeydown="if(event.key==='Enter'){event.preventDefault();handleGenerateImages();}"
                    class="if-folder-input">
                  <button type="button" id="if-folder-clear" class="if-folder-clear-btn" onclick="_ifClearFolderUrl()" title="Bersihkan input" aria-label="Bersihkan">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button onclick="handleGenerateImages()" class="if-folder-submit-btn">
                  <i class="fas fa-magic"></i> <span>Hasilkan Link</span>
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mt-2 flex items-start gap-1">
                <i class="fas fa-info-circle text-slate-300 mt-0.5"></i>
                <span>Format yang didukung: <code class="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">drive.google.com/drive/folders/...</code></span>
              </p>
            </div>
          </div>
        ` : ''}

        <div class="if-card">
          <div class="if-card-head">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i class="fas fa-cloud-upload-alt text-indigo-600"></i>Upload Gambar
            </h3>
          </div>
          <div class="if-card-body">
            <div id="upload-folder-status" class="hidden mb-3"></div>

            <div id="img-upload-drop-area" class="if-drop"
                 onclick="document.getElementById('img-file-input').click()"
                 ondragover="event.preventDefault(); this.classList.add('dragover');"
                 ondragleave="this.classList.remove('dragover');"
                 ondrop="handleImgFileDrop(event)">
              <div class="if-drop-ico"><i class="fas fa-file-image"></i></div>
              <p class="font-bold text-slate-700 text-sm">Klik atau Seret &amp; Lepas file ke sini</p>
              <p class="text-xs text-slate-400 mt-1">Format: <b>JPG, JPEG, PNG</b> · Maks <b>5 MB</b> per file</p>
              <input type="file" id="img-file-input" class="hidden" accept=".jpg,.jpeg,.png,image/jpeg,image/png" multiple onchange="handleImgFileSelect(this.files)">
            </div>

            <div id="img-upload-queue" class="if-queue hidden"></div>

            <div class="mt-3 flex justify-end gap-2" id="img-upload-actions" style="display:none;">
              <button onclick="_clearUploadQueue()" class="px-4 py-2 rounded-lg text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Bersihkan</button>
              <button id="btn-start-upload" onclick="startImageUpload()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold shadow transition flex items-center gap-2 active:scale-95">
                <i class="fas fa-upload"></i> Upload Semua
              </button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div id="if-stats-mount"></div>

        <div class="if-card">
          <div class="if-card-head">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i class="far fa-images text-pink-600"></i>Riwayat Gambar Tersimpan
            </h3>
          </div>
          <div id="if-filter-mount"></div>
          <div id="img-table-container">
            <div class="p-6">
              ${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}
            </div>
          </div>
        </div>
      </div>

      <div id="if-lightbox" onclick="if(event.target===this)_imgCloseLightbox()" role="dialog" aria-modal="true">
        <button class="if-lightbox-close" onclick="_imgCloseLightbox()" aria-label="Tutup">
          <i class="fas fa-times"></i>
        </button>
        <img id="if-lightbox-img" src="" referrerpolicy="no-referrer" alt="Preview">
        <div id="if-lightbox-info" class="if-lightbox-info"></div>
      </div>
    `;

    loadImageTable();

    if (isAdmin) {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success) _showUploadFolderStatus(res.folderId ? 'set' : 'unset');
          else _showUploadFolderStatus('unset');
        })
        .withFailureHandler(() => { _showUploadFolderStatus('unset'); })
        .getImageUploadFolderId(currentUser.userID, currentUser.token);
    }

    // ESC closes lightbox
    // Bug fix: removeEventListener dulu agar listener tidak menumpuk
    // setiap kali tab ini di-render ulang (mencegah memory leak & multiple triggers).
    document.removeEventListener('keydown', _ifGlobalKeyHandler);
    document.addEventListener('keydown', _ifGlobalKeyHandler);
}

function _ifGlobalKeyHandler(e) {
  if (e.key === 'Escape') {
    const lb = document.getElementById('if-lightbox');
    if (lb && lb.classList.contains('show')) _imgCloseLightbox();
  }
}

function handleGenerateImages() {
    const url = (document.getElementById('input-folder-url') || {}).value;
    const cleaned = String(url || '').trim();
    if (!cleaned) {
        Swal.fire({
          title:'Link Folder Kosong',
          html:'<p style="font-size:13px;color:#475569;">Masukkan link folder Google Drive terlebih dahulu.</p>',
          icon:'warning', confirmButtonColor:'#db2777',
          customClass:{ popup:'lp-swal' }
        });
        return;
    }
    if (!/drive\.google\.com\/(drive\/folders|drive\/u\/\d+\/folders|open\?id=|folders\/)/i.test(cleaned)) {
        Swal.fire({
          title:'Format URL Tidak Dikenali',
          html:`<p style="font-size:13px;color:#475569;">Sepertinya bukan URL folder Google Drive yang valid.</p>
                <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Contoh format yang benar:<br>
                <code style="background:#f8fafc;padding:2px 6px;border-radius:4px;font-size:11px;">https://drive.google.com/drive/folders/...</code></p>`,
          icon:'warning', confirmButtonColor:'#db2777',
          showCancelButton:true, confirmButtonText:'Lanjutkan Saja', cancelButtonText:'Batal',
          customClass:{ popup:'lp-swal' }
        }).then(res => { if (res.isConfirmed) _runGenerateImages(cleaned); });
        return;
    }
    _runGenerateImages(cleaned);
}

function _runGenerateImages(url) {
    const btn = document.querySelector('button[onclick="handleGenerateImages()"]');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Memproses...</span>'; }

    google.script.run
      .withSuccessHandler(res => {
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
        if (res && res.success) {
          const msg = res.count > 0
            ? `<b>${res.count}</b> gambar baru ditambahkan${res.skipped > 0 ? `, ${res.skipped} sudah ada sebelumnya` : ''}.`
            : `Tidak ada gambar baru. ${res.skipped || 0} gambar sudah ada di database.`;
          Swal.fire({
            icon: res.count > 0 ? 'success' : 'info',
            title: res.count > 0 ? 'Berhasil' : 'Selesai',
            html:`<p style="font-size:13px;color:#475569;">${msg}</p>`,
            confirmButtonColor:'#db2777',
            customClass:{ popup:'lp-swal' }
          });
          _ifClearFolderUrl();
          loadImageTable();
        } else {
          Swal.fire({
            title:'Gagal', html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
            icon:'error', confirmButtonColor:'#dc2626',
            customClass:{ popup:'lp-swal' }
          });
        }
      })
      .withFailureHandler(err => {
        if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
        Swal.fire({
          title:'Error Server',
          html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
          icon:'error', confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        });
      })
      .processFolderImages(url, currentUser.userID, currentUser.token);
}

// Clear folder URL input + sync clear button visibility
function _ifClearFolderUrl() {
  const inp = document.getElementById('input-folder-url');
  if (!inp) return;
  inp.value = '';
  inp.focus();
  _ifSyncFolderClearBtn();
}
function _ifSyncFolderClearBtn() {
  const inp = document.getElementById('input-folder-url');
  const btn = document.getElementById('if-folder-clear');
  if (!inp || !btn) return;
  if (inp.value && inp.value.length > 0) btn.classList.add('show');
  else btn.classList.remove('show');
}
// Auto-bind input listener (non-fatal if element not present yet)
document.addEventListener('input', function(e) {
  if (e.target && e.target.id === 'input-folder-url') _ifSyncFolderClearBtn();
});

let _imgUploadQueue = [];

function _showUploadFolderStatus(state) {
    const el = document.getElementById('upload-folder-status');
    if (!el) return;
    if (state === 'set') {
      el.innerHTML = '<div class="if-status ok"><i class="fas fa-check-circle"></i><span>Folder upload telah dikonfigurasi. Anda dapat mengupload gambar.</span></div>';
    } else {
      el.innerHTML = `
        <div class="if-status warn">
          <i class="fas fa-triangle-exclamation"></i>
          <div class="flex-1">
            <div class="font-bold mb-0.5">Folder Upload Belum Dikonfigurasi</div>
            <div class="text-[11px] font-normal">Hubungi Administrator untuk mengisi <b>Folder ID</b> di menu Konfigurasi.</div>
          </div>
        </div>`;
    }
    el.classList.remove('hidden');
}

function handleImgFileSelect(files) {
    _addFilesToQueue(Array.from(files));
}

function handleImgFileDrop(e) {
    e.preventDefault();
    const area = document.getElementById('img-upload-drop-area');
    if (area) area.classList.remove('dragover');
    _addFilesToQueue(Array.from(e.dataTransfer.files));
}

function _addFilesToQueue(files) {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    const MAX_BYTES = 5 * 1024 * 1024;
    let rejected = [];
    files.forEach(f => {
        if (!allowed.includes(String(f.type || '').toLowerCase())) { rejected.push(`${f.name} (format tidak didukung)`); return; }
        if (f.size > MAX_BYTES) { rejected.push(`${f.name} (>${(MAX_BYTES/1024/1024).toFixed(0)} MB)`); return; }
        if (_imgUploadQueue.find(q => q.name === f.name && q.size === f.size)) return;
        _imgUploadQueue.push({ file: f, name: f.name, size: f.size, status: 'pending', progress: 0 });
    });
    if (rejected.length) {
        Swal.fire({
          title:'Sebagian File Ditolak',
          html:`<p style="font-size:13px;color:#475569;">${rejected.length} file tidak bisa ditambahkan:</p>
                <ul style="text-align:left;font-size:12px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:8px 12px;margin-top:8px;list-style:disc;padding-left:24px;">
                  ${rejected.map(r => `<li>${r.replace(/</g,'&lt;')}</li>`).join('')}
                </ul>`,
          icon:'warning', confirmButtonColor:'#db2777',
          customClass:{ popup:'lp-swal' }
        });
    }
    _renderUploadQueue();
}

function _renderUploadQueue() {
    const container = document.getElementById('img-upload-queue');
    const actions   = document.getElementById('img-upload-actions');
    if (!container) return;
    if (_imgUploadQueue.length === 0) {
        container.classList.add('hidden');
        if (actions) actions.style.display = 'none';
        return;
    }
    container.classList.remove('hidden');
    if (actions) actions.style.display = 'flex';

    const iconMap = {
      pending:   { ico:'fa-clock', cls:'text-slate-400' },
      uploading: { ico:'fa-circle-notch fa-spin', cls:'text-blue-500' },
      done:      { ico:'fa-check-circle', cls:'text-emerald-500' },
      error:     { ico:'fa-circle-exclamation', cls:'text-red-500' }
    };

    container.innerHTML = _imgUploadQueue.map((item, i) => {
        const ic = iconMap[item.status] || iconMap.pending;
        return `
          <div class="if-queue-item">
            <i class="if-q-ico fas ${ic.ico} ${ic.cls}"></i>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="if-q-name">${String(item.name || '').replace(/</g,'&lt;')}</span>
                <span class="if-q-size">${(item.size/1024).toFixed(1)} KB</span>
                ${item.status === 'pending'
                  ? `<button class="if-q-rm" onclick="_removeFromQueue(${i})" title="Hapus dari antrian"><i class="fas fa-times"></i></button>`
                  : ''}
              </div>
              ${item.status === 'uploading' ? `<div class="if-q-progress"><div class="if-q-progress-bar" style="width:${item.progress || 30}%;"></div></div>` : ''}
              ${item.status === 'error' ? `<div class="text-[11px] text-red-500 mt-1">${(item.error || 'Gagal').replace(/</g,'&lt;')}</div>` : ''}
            </div>
          </div>`;
    }).join('');
}

function _removeFromQueue(idx) {
    _imgUploadQueue.splice(idx, 1);
    _renderUploadQueue();
}

function _clearUploadQueue() {
    if (_imgUploadQueue.some(q => q.status === 'uploading')) {
      Swal.fire({
        title:'Sedang Mengupload',
        html:'<p style="font-size:13px;color:#475569;">Tunggu sampai upload selesai sebelum membersihkan antrian.</p>',
        icon:'info', confirmButtonColor:'#6366f1',
        customClass:{ popup:'lp-swal' }
      });
      return;
    }
    _imgUploadQueue = [];
    _renderUploadQueue();
}

function startImageUpload() {
    const pending = _imgUploadQueue.filter(q => q.status === 'pending');
    if (!pending.length) {
      Swal.fire({ title:'Tidak Ada File', html:'<p style="font-size:13px;color:#475569;">Tidak ada file menunggu untuk diupload.</p>',
        icon:'info', confirmButtonColor:'#6366f1', customClass:{ popup:'lp-swal' }});
      return;
    }
    const btn = document.getElementById('btn-start-upload');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...'; }
    _uploadNext();
}

function _uploadNext() {
    const idx = _imgUploadQueue.findIndex(q => q.status === 'pending');
    if (idx < 0) {
        const btn = document.getElementById('btn-start-upload');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-upload"></i> Upload Semua'; }
        const doneItems  = _imgUploadQueue.filter(q => q.status === 'done');
        const errorItems = _imgUploadQueue.filter(q => q.status === 'error');
        if (doneItems.length > 0) loadImageTable();
        _imgUploadQueue = _imgUploadQueue.filter(q => q.status !== 'done');
        _renderUploadQueue();
        // Modal ringkasan berhasil/gagal beserta alasan
        _showUploadSummaryModal(doneItems, errorItems);
        return;
    }

    _imgUploadQueue[idx].status = 'uploading';
    _imgUploadQueue[idx].progress = 30;
    _renderUploadQueue();

    const item = _imgUploadQueue[idx];
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.min(60, Math.round(ev.loaded / ev.total * 60));
        if (_imgUploadQueue[idx]) {
          _imgUploadQueue[idx].progress = pct;
          _renderUploadQueue();
        }
      }
    };
    reader.onload = function(e) {
        _imgUploadQueue[idx].progress = 75;
        _renderUploadQueue();
        const base64Full = e.target.result;
        const commaIdx   = String(base64Full).indexOf(',');
        const base64Data = commaIdx >= 0 ? base64Full.substring(commaIdx + 1) : base64Full;
        google.script.run
          .withSuccessHandler(res => {
            if (_imgUploadQueue[idx]) {
              _imgUploadQueue[idx].status = (res && res.success) ? 'done' : 'error';
              _imgUploadQueue[idx].progress = 100;
              if (!res || !res.success) _imgUploadQueue[idx].error = (res && res.message) || 'Gagal';
            }
            _renderUploadQueue();
            _uploadNext();
          })
          .withFailureHandler(err => {
            if (_imgUploadQueue[idx]) {
              _imgUploadQueue[idx].status = 'error';
              _imgUploadQueue[idx].error  = (err && err.message) || String(err) || 'Error';
            }
            _renderUploadQueue();
            _uploadNext();
          })
          .uploadImageFile(base64Data, item.name, item.file.type, currentUser.userID, currentUser.token);
    };
    reader.onerror = function() {
        if (_imgUploadQueue[idx]) {
          _imgUploadQueue[idx].status = 'error';
          _imgUploadQueue[idx].error = 'Gagal membaca file';
        }
        _renderUploadQueue();
        _uploadNext();
    };
    reader.readAsDataURL(item.file);
}

function loadImageTable() {
    const container = document.getElementById('img-table-container');
    if (!container) return;
    container.innerHTML = `<div class="p-6">${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}</div>`;

    google.script.run
      .withSuccessHandler(data => {
        allImagesData = Array.isArray(data) ? data : [];
        filteredImages = allImagesData.slice();
        currentImgPage = 1;
        if (window._imageUI) window._imageUI.page = 1;
        _refreshImageUI();
      })
      .withFailureHandler(err => {
        container.innerHTML = `
          <div class="dash-error-state max-w-md mx-auto m-6">
            <div class="ico"><i class="fas fa-triangle-exclamation"></i></div>
            <h3 class="font-bold text-base text-red-700 mb-1">Gagal Memuat Galeri</h3>
            <p class="text-xs text-red-600 mb-4">${((err && err.message) || err || '').toString().replace(/</g,'&lt;')}</p>
            <button onclick="loadImageTable()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
              <i class="fas fa-rotate-right"></i> Coba Lagi
            </button>
          </div>`;
      })
      .getSavedImages();
}

function _refreshImageUI() {
  // Bug fix: null-guard agar tidak crash jika dipanggil sebelum renderImageFolder
  if (!window._imageUI) return;
  const ui  = window._imageUI;
  const raw = Array.isArray(allImagesData) ? allImagesData : [];

  // Filter
  const search = String(ui.search || '').toLowerCase().trim();
  const myUserId = (currentUser && currentUser.userID) ? String(currentUser.userID).toLowerCase() : '';
  const filtered = raw.filter(img => {
    const name = String(img.name || '').toLowerCase();
    const uploaderID = String(img.uploaderID || '').toLowerCase();
    if (ui.filterProtected === 'mine' && uploaderID !== myUserId) return false;
    if (ui.filterProtected === 'protected' && !uploaderID) return false;
    if (ui.filterProtected === 'free' && uploaderID) return false;
    if (search && !name.includes(search)) return false;
    return true;
  });

  // Sort
  const dir = ui.sortDir === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    let va, vb;
    switch (ui.sortBy) {
      case 'name':
        va = String(a.name || '').toLowerCase(); vb = String(b.name || '').toLowerCase();
        break;
      case 'date':
      default:
        va = String(a.date || ''); vb = String(b.date || '');
    }
    if (va < vb) return -1 * dir;
    if (va > vb) return  1 * dir;
    return 0;
  });

  filteredImages = filtered;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
  if (ui.page > totalPages) ui.page = totalPages;
  const startIdx = (ui.page - 1) * ui.pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + ui.pageSize);

  _ifRenderStats(raw);
  _ifRenderFilter(raw);
  _ifRenderContent(pageItems, filtered.length, ui.page, totalPages, startIdx);
}

function _ifRenderStats(raw) {
  const mount = document.getElementById('if-stats-mount');
  if (!mount) return;
  if (raw.length === 0) { mount.innerHTML = ''; return; }

  const myUserId = (currentUser && currentUser.userID) ? String(currentUser.userID).toLowerCase() : '';
  const total = raw.length;
  const protectedCount = raw.filter(i => i.uploaderID).length;
  const freeCount = total - protectedCount;
  const myCount = raw.filter(i => String(i.uploaderID || '').toLowerCase() === myUserId).length;

  mount.innerHTML = `
    <div class="if-stat-grid">
      <div class="if-stat" title="Total semua gambar di database">
        <div class="if-stat-ico bg-pink-100 text-pink-600"><i class="far fa-images"></i></div>
        <div><div class="if-stat-num">${total}</div><div class="if-stat-lbl">Total Gambar</div></div>
      </div>
      <div class="if-stat" title="Gambar tanpa proteksi (publik)">
        <div class="if-stat-ico bg-emerald-100 text-emerald-600"><i class="fas fa-globe"></i></div>
        <div><div class="if-stat-num">${freeCount}</div><div class="if-stat-lbl">Publik</div></div>
      </div>
      <div class="if-stat" title="Gambar dilindungi password upload">
        <div class="if-stat-ico bg-amber-100 text-amber-600"><i class="fas fa-lock"></i></div>
        <div><div class="if-stat-num">${protectedCount}</div><div class="if-stat-lbl">Dilindungi</div></div>
      </div>
      <div class="if-stat" title="Gambar yang Anda upload">
        <div class="if-stat-ico bg-blue-100 text-blue-600"><i class="fas fa-user"></i></div>
        <div><div class="if-stat-num">${myCount}</div><div class="if-stat-lbl">Milik Saya</div></div>
      </div>
    </div>`;
}

function _ifRenderFilter(raw) {
  const mount = document.getElementById('if-filter-mount');
  if (!mount) return;
  if (raw.length === 0) { mount.innerHTML = ''; return; }
  const ui = window._imageUI;
  const escAttr = s => String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  const hasFilters = !!(ui.search || ui.filterProtected);

  mount.innerHTML = `
    <div class="if-filter">
      <div class="ex-search" style="flex:1; min-width:160px;">
        <i class="fas fa-search"></i>
        <input id="img-search-input" type="text" placeholder="Cari nama file..."
          value="${escAttr(ui.search)}" oninput="_ifSetFilter('search', this.value)" autocomplete="off">
        <button class="ex-search-clear ${ui.search ? 'show' : ''}" onclick="_ifSetFilter('search','')" title="Bersihkan">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <select class="ex-select" onchange="_ifSetFilter('protected', this.value)">
        <option value="">Semua Gambar</option>
        <option value="free"      ${ui.filterProtected==='free'?'selected':''}>🌐 Publik</option>
        <option value="protected" ${ui.filterProtected==='protected'?'selected':''}>🔒 Dilindungi</option>
        <option value="mine"      ${ui.filterProtected==='mine'?'selected':''}>👤 Milik Saya</option>
      </select>
      <select class="ex-select" onchange="_ifSetPageSize(this.value)">
        <option value="10"  ${ui.pageSize===10?'selected':''}>10 baris</option>
        <option value="25"  ${ui.pageSize===25?'selected':''}>25 baris</option>
        <option value="50"  ${ui.pageSize===50?'selected':''}>50 baris</option>
        <option value="100" ${ui.pageSize===100?'selected':''}>100 baris</option>
        <option value="500" ${ui.pageSize===500?'selected':''}>500 baris</option>
      </select>
      ${hasFilters ? `
        <button onclick="_ifResetFilters()" class="ex-select" style="background:#fef2f2;border-color:#fecaca;color:#dc2626;">
          <i class="fas fa-times-circle mr-1"></i> Reset
        </button>` : ''}
    </div>`;
}

function _ifRenderContent(items, totalFiltered, page, totalPages, startIdx) {
  const container = document.getElementById('img-table-container');
  if (!container) return;
  const raw = Array.isArray(allImagesData) ? allImagesData : [];

  if (raw.length === 0) {
    container.innerHTML = `
      <div class="dash-empty">
        <div class="dash-empty-icon"><i class="far fa-images"></i></div>
        <p class="font-bold text-slate-700 text-sm">Belum ada gambar tersimpan.</p>
        <p class="text-xs text-slate-400 mt-1 mb-3">Upload gambar lewat drag-and-drop atau pakai Generator Link.</p>
      </div>`;
    return;
  }
  if (totalFiltered === 0) {
    container.innerHTML = `
      <div class="dash-empty">
        <div class="dash-empty-icon"><i class="fas fa-search-minus"></i></div>
        <p class="font-bold text-slate-700 text-sm">Tidak ada gambar yang cocok.</p>
        <p class="text-xs text-slate-400 mt-1 mb-3">Bersihkan filter atau ubah kata kunci pencarian.</p>
        <button onclick="_ifResetFilters()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-2">
          <i class="fas fa-rotate-left"></i> Reset Filter
        </button>
      </div>`;
    return;
  }

  const tableHtml = _ifBuildTable(items, startIdx);
  const cardsHtml = _ifBuildCards(items);
  const pagi      = _ifPagination(totalFiltered, page, totalPages);

  container.innerHTML = `
    <div class="if-table-wrap">
      <div style="overflow-x:auto;">${tableHtml}</div>
      ${pagi}
    </div>
    <div class="if-cards">
      ${cardsHtml}
      ${pagi}
    </div>`;
}

function _ifBuildTable(items, startIdx) {
  const ui = window._imageUI;
  const sortIco = (key) => {
    if (ui.sortBy !== key) return '<i class="fas fa-sort if-sort"></i>';
    return ui.sortDir === 'asc' ? '<i class="fas fa-sort-up if-sort"></i>' : '<i class="fas fa-sort-down if-sort"></i>';
  };
  const sortedHead = (key) => ui.sortBy === key ? 'sorted' : '';

  const rows = items.map((img, i) => _ifBuildTableRow(img, startIdx + i + 1)).join('');

  return `
    <table class="if-table">
      <thead>
        <tr>
          <th style="width:40px;text-align:center;">#</th>
          <th style="width:64px;">Preview</th>
          <th class="sortable ${sortedHead('name')}" onclick="_ifSetSort('name')">Nama File ${sortIco('name')}</th>
          <th class="sortable ${sortedHead('date')}" onclick="_ifSetSort('date')" style="width:130px;">Tanggal ${sortIco('date')}</th>
          <th>Direct Link</th>
          <th style="width:60px;text-align:right;">Aksi</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function _ifBuildTableRow(img, idx) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  const isProtected = !!img.uploaderID;
  const linkSafe = String(img.link || '');
  const inputId = `if-link-${idx}`;

  return `
    <tr>
      <td style="text-align:center;color:#94a3b8;font-weight:600;">${idx}</td>
      <td>
        <div class="if-thumb" onclick="_imgOpenLightbox('${escAttr(img.link)}', '${escAttr(img.name)}')">
          <img src="${escAttr(img.link)}" referrerpolicy="no-referrer" alt="${escAttr(img.name)}" onerror="this.src='https://via.placeholder.com/64?text=Err'">
        </div>
      </td>
      <td>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-slate-700 text-sm break-all" title="${escAttr(img.name)}">${escHtml(img.name || '-')}</span>
          ${isProtected ? `<span class="if-protected-badge"><i class="fas fa-lock"></i>${img.uploaderID === (currentUser && currentUser.userID) ? ' Milikku' : ' Dilindungi'}</span>` : ''}
        </div>
        ${isProtected ? `<div class="text-[10px] text-slate-400 mt-1 font-mono"><i class="fas fa-user-circle text-indigo-300"></i> ${escHtml(img.uploaderID)}</div>` : ''}
      </td>
      <td><span class="text-xs text-slate-500"><i class="far fa-clock text-slate-300 mr-1"></i>${escHtml(img.date || '-')}</span></td>
      <td>
        <div class="if-link-box">
          <input type="text" value="${escAttr(linkSafe)}" readonly id="${inputId}">
          <button class="if-link-copy" onclick="copyLink('${inputId}')" title="Salin link">
            <i class="fas fa-copy"></i> <span>Copy</span>
          </button>
        </div>
      </td>
      <td style="text-align:right;">
        <button class="um-action-btn um-action-del" onclick="deleteImage('${escAttr(img.id)}')" title="Hapus dari list">
          <i class="fas fa-trash-can"></i>
        </button>
      </td>
    </tr>`;
}

function _ifBuildCards(items) {
  const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const escAttr = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');

  return items.map((img, i) => {
    const isProtected = !!img.uploaderID;
    const inputId = `if-card-link-${i}`;
    return `
      <div class="if-card-img">
        <div class="if-card-img-thumb" onclick="_imgOpenLightbox('${escAttr(img.link)}', '${escAttr(img.name)}')">
          <img src="${escAttr(img.link)}" referrerpolicy="no-referrer" alt="${escAttr(img.name)}" onerror="this.src='https://via.placeholder.com/200?text=Err'">
        </div>
        <div class="if-card-img-body">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-slate-700 text-sm break-all flex-1 min-w-0" title="${escAttr(img.name)}">${escHtml(img.name || '-')}</span>
            ${isProtected ? `<span class="if-protected-badge"><i class="fas fa-lock"></i>${img.uploaderID === (currentUser && currentUser.userID) ? 'Milikku' : 'Dilindungi'}</span>` : ''}
          </div>
          <div class="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
            <span><i class="far fa-clock"></i> ${escHtml(img.date || '-')}</span>
            ${isProtected ? `<span class="font-mono">· ${escHtml(img.uploaderID)}</span>` : ''}
          </div>
          <div class="if-link-box">
            <input type="text" value="${escAttr(img.link)}" readonly id="${inputId}">
            <button class="if-link-copy" onclick="copyLink('${inputId}')"><i class="fas fa-copy"></i></button>
          </div>
        </div>
        <div class="if-card-img-foot">
          <button onclick="_imgOpenLightbox('${escAttr(img.link)}', '${escAttr(img.name)}')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition flex items-center gap-1.5">
            <i class="fas fa-eye"></i> Preview
          </button>
          <button class="um-action-btn um-action-del" onclick="deleteImage('${escAttr(img.id)}')" title="Hapus dari list">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      </div>`;
  }).join('');
}

function _ifPagination(total, page, totalPages) {
  if (totalPages <= 1) {
    return `<div class="if-pagination"><span>Menampilkan <b class="text-slate-700">${total}</b> gambar</span></div>`;
  }
  const ws = Math.max(1, page - 2);
  const we = Math.min(totalPages, page + 2);
  let nums = '';
  if (ws > 1) nums += `<button class="if-page-btn" onclick="_ifSetPage(1)">1</button>` + (ws > 2 ? '<span class="text-slate-400">…</span>' : '');
  for (let p = ws; p <= we; p++) nums += `<button class="if-page-btn ${p===page?'active':''}" onclick="_ifSetPage(${p})">${p}</button>`;
  if (we < totalPages) nums += (we < totalPages - 1 ? '<span class="text-slate-400">…</span>' : '') + `<button class="if-page-btn" onclick="_ifSetPage(${totalPages})">${totalPages}</button>`;

  return `
    <div class="if-pagination">
      <span>Halaman <b>${page}</b> / <b>${totalPages}</b> · ${total} gambar</span>
      <div class="flex gap-1">
        <button class="if-page-btn" onclick="_ifSetPage(${page-1})" ${page<=1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
        ${nums}
        <button class="if-page-btn" onclick="_ifSetPage(${page+1})" ${page>=totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>`;
}

// State setters
function _ifSetFilter(key, value) {
  const ui = window._imageUI; if (!ui) return;
  if (key === 'search')    ui.search = value || '';
  if (key === 'protected') ui.filterProtected = value || '';
  ui.page = 1;

  const wasFocused = document.activeElement && document.activeElement.id === 'img-search-input';
  const caretPos   = wasFocused ? document.activeElement.selectionStart : null;
  _refreshImageUI();
  if (wasFocused) {
    const inp = document.getElementById('img-search-input');
    if (inp) {
      inp.focus();
      try { inp.setSelectionRange(caretPos, caretPos); } catch(e){}
    }
  }
}
function _ifResetFilters() {
  const ui = window._imageUI; if (!ui) return;
  Object.assign(ui, { search:'', filterProtected:'', page:1 });
  _refreshImageUI();
}
function _ifSetSort(key) {
  const ui = window._imageUI; if (!ui) return;
  if (ui.sortBy === key) ui.sortDir = ui.sortDir === 'asc' ? 'desc' : 'asc';
  else { ui.sortBy = key; ui.sortDir = key === 'date' ? 'desc' : 'asc'; }
  _refreshImageUI();
}
function _ifSetPage(p) {
  const ui = window._imageUI; if (!ui) return;
  ui.page = Math.max(1, parseInt(p) || 1);
  _refreshImageUI();
  const c = document.getElementById('admin-content');
  if (c) c.scrollTo({ top:0, behavior:'smooth' });
}
function _ifSetPageSize(val) {
  const ui = window._imageUI; if (!ui) return;
  ui.pageSize = parseInt(val) || 25;
  ui.page = 1;
  _refreshImageUI();
}

// Lightbox
function _imgOpenLightbox(url, name) {
  const lb  = document.getElementById('if-lightbox');
  const img = document.getElementById('if-lightbox-img');
  const inf = document.getElementById('if-lightbox-info');
  if (!lb || !img) return;
  img.src = url;
  if (inf) inf.textContent = name || '';
  lb.classList.add('show');
}
function _imgCloseLightbox() {
  const lb = document.getElementById('if-lightbox');
  if (lb) lb.classList.remove('show');
  const img = document.getElementById('if-lightbox-img');
  if (img) img.src = '';
}

function copyLink(elementId) {
    const copyText = document.getElementById(elementId);
    if (!copyText) return;
    try { copyText.select(); copyText.setSelectionRange(0, 99999); } catch(e){}
    const text = copyText.value;

    const showToast = () => {
      const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1400, timerProgressBar:true });
      Toast.fire({ icon:'success', title:'Link disalin!' });
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showToast).catch(() => {
        try { document.execCommand('copy'); showToast(); } catch(e) {
          Swal.fire({
            title:'Gagal Menyalin',
            html:'<p style="font-size:13px;color:#475569;">Browser memblokir akses clipboard. Silakan salin manual.</p>',
            icon:'warning', confirmButtonColor:'#db2777',
            customClass:{ popup:'lp-swal' }
          });
        }
      });
    } else {
      try { document.execCommand('copy'); showToast(); } catch(e) {}
    }
}

function _showImagePasswordModal(title, subtitle, onConfirm) {
  Swal.fire({
    title: `<i class="fas fa-lock text-amber-500" style="margin-right:6px;"></i>${title}`,
    html: `
      <p style="font-size:13px;color:#475569;margin-bottom:14px;">${subtitle}</p>
      <div style="position:relative;">
        <span style="position:absolute;inset-y:0;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;">
          <i class="fas fa-key text-sm"></i>
        </span>
        <input id="swal-img-pwd" type="password" placeholder="Masukkan password..."
          class="swal2-input" autocomplete="off" style="margin:0;width:100%;padding-left:36px;box-sizing:border-box;">
      </div>`,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-unlock-alt mr-1"></i> Verifikasi',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    focusConfirm: false,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    customClass:{ popup:'lp-swal' },
    didOpen: () => {
      const inp = document.getElementById('swal-img-pwd');
      if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key === 'Enter') Swal.clickConfirm(); }); }
    },
    preConfirm: () => {
      const pwd = (document.getElementById('swal-img-pwd') || {}).value || '';
      if (!pwd) { Swal.showValidationMessage('Password tidak boleh kosong.'); return false; }
      // Serahkan ke caller — kembalikan Promise agar Swal menunggu dan tetap
      // menampilkan loading spinner selama request server berjalan.
      return new Promise((resolve, reject) => {
        onConfirm(pwd, resolve, reject);
      });
    }
  }).then(result => {
    if (!result.isConfirmed) return;
  });
}

function deleteImage(id) {
  const isAdmin = currentUser && currentUser.role === 'Admin';
  const img = (allImagesData || []).find(i => String(i.id) === String(id));
  const name = img ? (img.name || '') : '';
  const uploaderID = img ? (img.uploaderID || '') : '';
  const isOwner = uploaderID && currentUser && String(uploaderID) === String(currentUser.userID);
  const needsPassword = !isAdmin && uploaderID && !isOwner;

  const _doConfirm = (pwd) => {
    Swal.fire({
      title: 'Hapus Gambar?',
      html: `<p style="font-size:13px;color:#475569;">Anda akan menghapus <b>${(name || 'gambar ini').replace(/</g,'&lt;')}</b> dari daftar database.</p>
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
      customClass:{ popup:'lp-swal' },
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(resolve => {
          google.script.run
            .withSuccessHandler(r => resolve(r))
            .withFailureHandler(err => resolve({ success: false, _err: (err && err.message) || String(err) }))
            .deleteSavedImage(id, pwd, currentUser.userID, currentUser.token);
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(res => {
      if (!res.isConfirmed) return;
      const r = res.value;
      if (r && r._err) {
        Swal.fire({
          title:'Error Server',
          html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${r._err.replace(/</g,'&lt;')}</p>`,
          icon:'error', confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        });
      } else if (r && r.success) {
        const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1600, timerProgressBar:true });
        Toast.fire({ icon:'success', title:'Gambar dihapus dari daftar' });
        loadImageTable();
      } else {
        Swal.fire({
          title:'Gagal', html:`<p style="font-size:13px;color:#475569;">${((r && r.message) || 'Terjadi kesalahan').replace(/</g,'&lt;')}</p>`,
          icon:'error', confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        });
      }
    });
  };

  if (!needsPassword) { _doConfirm(''); return; }

  _showImagePasswordModal('Konfirmasi Hapus',
    'Gambar ini milik pengguna lain. Masukkan password akun pemilik gambar untuk menghapus dari database.',
    (pwd, resolve, reject) => {
      google.script.run
        .withSuccessHandler(res => {
          if (res && res.success) {
            resolve(); // tutup loading, lanjut ke dialog konfirmasi hapus
            _doConfirm(pwd);
          } else {
            resolve();
            Swal.fire({
              icon:'error', title:'Akses Ditolak',
              html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Password salah.'}</p>`,
              confirmButtonColor:'#dc2626',
              customClass:{ popup:'lp-swal' }
            });
          }
        })
        .withFailureHandler(err => {
          resolve();
          Swal.fire({
            title:'Error Server',
            html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${((err && err.message) || String(err)).replace(/</g,'&lt;')}</p>`,
            icon:'error', confirmButtonColor:'#dc2626',
            customClass:{ popup:'lp-swal' }
          });
        })
        .verifyImageAccess(id, pwd, currentUser.userID, currentUser.token);
    }
  );
}

// Backwards-compat shims
function renderImageTableInternal() { _refreshImageUI(); }
function handleImageSearch(keyword) { _ifSetFilter('search', keyword); }
function changeImgRowsPerPage(val) { _ifSetPageSize(val === 'all' ? 1000 : val); }
function changeImgPage(direction) {
  const ui = window._imageUI; if (!ui) return;
  if (direction === 'prev') _ifSetPage(ui.page - 1);
  else _ifSetPage(ui.page + 1);
}

const MATH_KB = {
  'Aritmatika': [
    { d:'±', i:'±', t:'Plus-minus' },
    { d:'×', i:'×', t:'Perkalian' },
    { d:'÷', i:'÷', t:'Pembagian' },
    { d:'=', i:'=', t:'Sama dengan' },
    { d:'≠', i:'≠', t:'Tidak sama dengan' },
    { d:'≈', i:'≈', t:'Hampir sama' },
    { d:'<', i:'<', t:'Kurang dari' },
    { d:'>', i:'>', t:'Lebih dari' },
    { d:'≤', i:'≤', t:'Kurang dari atau sama' },
    { d:'≥', i:'≥', t:'Lebih dari atau sama' },
    { d:'√', i:'√', t:'Akar kuadrat (tulis angkanya setelah simbol)' },
    { d:'∛', i:'∛', t:'Akar pangkat tiga' },
    { d:'∞', i:'∞', t:'Tak hingga' },
    { d:'²', i:'²', t:'Pangkat 2 (superskrip)' },
    { d:'³', i:'³', t:'Pangkat 3 (superskrip)' },
    { d:'|x|', i:'|  |', t:'Nilai mutlak — ketik angka di antara dua garis', tpl:true },
    { d:'a/b', i:'$\\frac{a}{b}$', t:'Pecahan — ganti a dan b dengan angkamu', tpl:true },
    { d:'√x', i:'$\\sqrt{x}$', t:'Akar kuadrat (format rumus) — ganti x', tpl:true },
    { d:'ˣ√', i:'$\\sqrt[n]{x}$', t:'Akar pangkat-n — ganti n dan x', tpl:true },
    { d:'xⁿ', i:'$x^{n}$', t:'Pangkat n — ganti x dan n', tpl:true },
    { d:'log', i:'log', t:'Logaritma' },
    { d:'log₁₀', i:'$\\log_{10}$', t:'Logaritma basis 10', tpl:true },
    { d:'logₙ', i:'$\\log_{n}$', t:'Logaritma basis n — ganti n', tpl:true },
    { d:'ln', i:'ln', t:'Logaritma natural' },
    { d:'|', i:'|', t:'Garis tegak' },
    { d:'(', i:'(', t:'Kurung buka' },
    { d:')', i:')', t:'Kurung tutup' },
    { d:'[', i:'[', t:'Kurung siku buka' },
    { d:']', i:']', t:'Kurung siku tutup' },
    { d:'{', i:'{', t:'Kurung kurawal buka' },
    { d:'}', i:'}', t:'Kurung kurawal tutup' },
  ],
  'Kalkulus': [
    { d:'∫', i:'∫', t:'Integral' },
    { d:'∬', i:'∬', t:'Integral ganda' },
    { d:'∮', i:'∮', t:'Integral loop' },
    { d:'∂', i:'∂', t:'Turunan parsial' },
    { d:'∇', i:'∇', t:'Nabla/Del' },
    { d:'Δ', i:'Δ', t:'Delta (perubahan)' },
    { d:'∞', i:'∞', t:'Tak hingga' },
    { d:'∫dx', i:"$\\int f(x)\\,dx$", t:'Integral tak tentu — ubah f(x)', tpl:true },
    { d:'∫ₐᵇ', i:"$\\int_{a}^{b} f(x)\\,dx$", t:'Integral tentu — ganti a, b, dan f(x)', tpl:true },
    { d:'lim', i:"$\\lim_{x \\to 0} f(x)$", t:'Limit — ganti x→0 dan f(x)', tpl:true },
    { d:'Σ', i:'$\\sum_{i=1}^{n} a_i$', t:'Sigma (penjumlahan) — ganti i=1, n, dan aᵢ', tpl:true },
    { d:'∏', i:'$\\prod_{i=1}^{n} a_i$', t:'Produk (perkalian beruntun) — ganti indeks', tpl:true },
    { d:'d/dx', i:"$\\frac{d}{dx}[f(x)]$", t:'Turunan pertama — ganti f(x)', tpl:true },
    { d:'d²/dx²', i:"$\\frac{d^2}{dx^2}[f(x)]$", t:'Turunan kedua — ganti f(x)', tpl:true },
    { d:"f'(x)", i:"f'(x)", t:'Notasi turunan Lagrange' },
    { d:'dy/dx', i:"$\\frac{dy}{dx}$", t:'Turunan dy terhadap dx', tpl:true },
    { d:'∂/∂x', i:"$\\frac{\\partial}{\\partial x}[f]$", t:'Turunan parsial terhadap x — ganti f', tpl:true },
  ],
  'Trigonometri': [
    { d:'sin', i:'sin', t:'Sinus' },
    { d:'cos', i:'cos', t:'Kosinus' },
    { d:'tan', i:'tan', t:'Tangen' },
    { d:'cot', i:'cot', t:'Kotangen' },
    { d:'sec', i:'sec', t:'Sekan' },
    { d:'csc', i:'csc', t:'Kosekan' },
    { d:'sin⁻¹', i:'$\\sin^{-1}$', t:'Arcsin (invers sinus)', tpl:true },
    { d:'cos⁻¹', i:'$\\cos^{-1}$', t:'Arccos (invers kosinus)', tpl:true },
    { d:'tan⁻¹', i:'$\\tan^{-1}$', t:'Arctan (invers tangen)', tpl:true },
    { d:'sin²+cos²=1', i:'$\\sin^2(x) + \\cos^2(x) = 1$', t:'Identitas Pythagoras dasar', tpl:true },
    { d:'π', i:'π', t:'Pi (3,14159...)' },
    { d:'θ', i:'θ', t:'Theta (sudut)' },
    { d:'°', i:'°', t:'Derajat' },
    { d:'30°', i:'30°', t:'Sudut 30 derajat' },
    { d:'45°', i:'45°', t:'Sudut 45 derajat' },
    { d:'60°', i:'60°', t:'Sudut 60 derajat' },
    { d:'90°', i:'90°', t:'Sudut 90 derajat' },
    { d:'180°', i:'180°', t:'Sudut 180 derajat' },
    { d:'360°', i:'360°', t:'Sudut 360 derajat' },
    { d:'rad', i:' rad', t:'Radian' },
    { d:'π/2', i:'$\\frac{\\pi}{2}$', t:'Pi per 2 (90°)', tpl:true },
    { d:'π/3', i:'$\\frac{\\pi}{3}$', t:'Pi per 3 (60°)', tpl:true },
    { d:'π/4', i:'$\\frac{\\pi}{4}$', t:'Pi per 4 (45°)', tpl:true },
    { d:'π/6', i:'$\\frac{\\pi}{6}$', t:'Pi per 6 (30°)', tpl:true },
  ],
  'Kimia': [
    { d:'→', i:'→', t:'Panah reaksi (satu arah)' },
    { d:'⇌', i:'⇌', t:'Reaksi kesetimbangan (dua arah)' },
    { d:'↑', i:'↑', t:'Gas yang dihasilkan (panah atas)' },
    { d:'↓', i:'↓', t:'Endapan yang terbentuk (panah bawah)' },
    { d:'Δ', i:'Δ', t:'Pemanasan' },
    { d:'+', i:' + ', t:'Ditambah (antar zat)' },
    { d:'⁺', i:'⁺', t:'Muatan positif (ion +1)' },
    { d:'⁻', i:'⁻', t:'Muatan negatif (ion -1)' },
    { d:'²⁺', i:'²⁺', t:'Muatan +2 (mis. Ca²⁺)' },
    { d:'²⁻', i:'²⁻', t:'Muatan -2 (mis. O²⁻)' },
    { d:'³⁺', i:'³⁺', t:'Muatan +3 (mis. Al³⁺)' },
    { d:'₀', i:'₀', t:'Subskrip angka 0' },
    { d:'₁', i:'₁', t:'Subskrip angka 1' },
    { d:'₂', i:'₂', t:'Subskrip angka 2' },
    { d:'₃', i:'₃', t:'Subskrip angka 3' },
    { d:'₄', i:'₄', t:'Subskrip angka 4' },
    { d:'₅', i:'₅', t:'Subskrip angka 5' },
    { d:'₆', i:'₆', t:'Subskrip angka 6' },
    { d:'₇', i:'₇', t:'Subskrip angka 7' },
    { d:'₈', i:'₈', t:'Subskrip angka 8' },
    { d:'₉', i:'₉', t:'Subskrip angka 9' },
    { d:'H₂O', i:'H₂O', t:'Air' },
    { d:'CO₂', i:'CO₂', t:'Karbon dioksida' },
    { d:'H₂SO₄', i:'H₂SO₄', t:'Asam sulfat' },
    { d:'HCl', i:'HCl', t:'Asam klorida' },
    { d:'NaOH', i:'NaOH', t:'Natrium hidroksida' },
    { d:'Ca(OH)₂', i:'Ca(OH)₂', t:'Kalsium hidroksida' },
    { d:'NH₃', i:'NH₃', t:'Amonia' },
    { d:'O₂', i:'O₂', t:'Gas oksigen' },
    { d:'N₂', i:'N₂', t:'Gas nitrogen' },
    { d:'ΔH', i:'ΔH', t:'Entalpi reaksi' },
    { d:'ΔH°', i:'ΔH° =', t:'Entalpi standar' },
  ],
  'Set & Logika': [
    { d:'∈', i:'∈', t:'Elemen dari (adalah anggota himpunan)' },
    { d:'∉', i:'∉', t:'Bukan elemen dari' },
    { d:'∪', i:'∪', t:'Gabungan (union) dua himpunan' },
    { d:'∩', i:'∩', t:'Irisan (intersection) dua himpunan' },
    { d:'⊂', i:'⊂', t:'Himpunan bagian (subset) sejati' },
    { d:'⊃', i:'⊃', t:'Superset sejati' },
    { d:'⊆', i:'⊆', t:'Himpunan bagian atau sama dengan' },
    { d:'⊇', i:'⊇', t:'Superset atau sama dengan' },
    { d:'∅', i:'∅', t:'Himpunan kosong' },
    { d:'ℝ', i:'ℝ', t:'Himpunan bilangan real' },
    { d:'ℤ', i:'ℤ', t:'Himpunan bilangan bulat' },
    { d:'ℕ', i:'ℕ', t:'Himpunan bilangan asli' },
    { d:'ℚ', i:'ℚ', t:'Himpunan bilangan rasional' },
    { d:'ℂ', i:'ℂ', t:'Himpunan bilangan kompleks' },
    { d:'∀', i:'∀', t:'Untuk semua (universal)' },
    { d:'∃', i:'∃', t:'Ada/terdapat (eksistensial)' },
    { d:'∄', i:'∄', t:'Tidak ada yang' },
    { d:'¬', i:'¬', t:'Negasi (tidak)' },
    { d:'∧', i:'∧', t:'Konjungsi (dan)' },
    { d:'∨', i:'∨', t:'Disjungsi (atau)' },
    { d:'⟹', i:'⟹', t:'Implikasi (maka / jika...maka)' },
    { d:'⟺', i:'⟺', t:'Biimplikasi (jika dan hanya jika)' },
    { d:'→', i:'→', t:'Implikasi (panah)' },
    { d:'↔', i:'↔', t:'Biimplikasi (panah dua arah)' },
    { d:'∴', i:'∴', t:'Oleh karena itu (therefore)' },
    { d:'∵', i:'∵', t:'Karena (because)' },
  ],
  'Yunani': [
    { d:'α', i:'α', t:'Alpha (kecil)' },
    { d:'β', i:'β', t:'Beta (kecil)' },
    { d:'γ', i:'γ', t:'Gamma (kecil)' },
    { d:'δ', i:'δ', t:'Delta (kecil)' },
    { d:'ε', i:'ε', t:'Epsilon (kecil)' },
    { d:'ζ', i:'ζ', t:'Zeta (kecil)' },
    { d:'η', i:'η', t:'Eta (kecil)' },
    { d:'θ', i:'θ', t:'Theta (kecil)' },
    { d:'ι', i:'ι', t:'Iota (kecil)' },
    { d:'κ', i:'κ', t:'Kappa (kecil)' },
    { d:'λ', i:'λ', t:'Lambda (kecil)' },
    { d:'μ', i:'μ', t:'Mu (kecil)' },
    { d:'ν', i:'ν', t:'Nu (kecil)' },
    { d:'ξ', i:'ξ', t:'Xi (kecil)' },
    { d:'π', i:'π', t:'Pi (kecil) = 3,14159...' },
    { d:'ρ', i:'ρ', t:'Rho (kecil)' },
    { d:'σ', i:'σ', t:'Sigma (kecil)' },
    { d:'τ', i:'τ', t:'Tau (kecil)' },
    { d:'υ', i:'υ', t:'Upsilon (kecil)' },
    { d:'φ', i:'φ', t:'Phi (kecil)' },
    { d:'χ', i:'χ', t:'Chi (kecil)' },
    { d:'ψ', i:'ψ', t:'Psi (kecil)' },
    { d:'ω', i:'ω', t:'Omega (kecil)' },
    { d:'Γ', i:'Γ', t:'Gamma (besar)' },
    { d:'Δ', i:'Δ', t:'Delta (besar)' },
    { d:'Θ', i:'Θ', t:'Theta (besar)' },
    { d:'Λ', i:'Λ', t:'Lambda (besar)' },
    { d:'Ξ', i:'Ξ', t:'Xi (besar)' },
    { d:'Π', i:'Π', t:'Pi (besar)' },
    { d:'Σ', i:'Σ', t:'Sigma (besar)' },
    { d:'Φ', i:'Φ', t:'Phi (besar)' },
    { d:'Ψ', i:'Ψ', t:'Psi (besar)' },
    { d:'Ω', i:'Ω', t:'Omega (besar)' },
  ]
};

/* ═══════════════════════════════════════════════════════════════════
   CUSTOM KEYBOARD ESAI — Layout Definitions & Core Engine
   ═══════════════════════════════════════════════════════════════════ */

// ── Layout rows ─────────────────────────────────────────────────────

const _CK_LATIN = {
  rows: [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['SHIFT','z','x','c','v','b','n','m','BACKSPACE'],
  ],
  bottom: ['SWITCH_NUM', 'SPACE', 'ENTER']
};

const _CK_NUM = {
  rows: [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['-','/','.',',','?','!','"',"'",'(', ')'],
    ['#+=','@','%','&','_','=','<','>','BACKSPACE'],
  ],
  bottom: ['ABC', 'SPACE', 'ENTER']
};

const _CK_SYM = {
  rows: [
    ['[',']','{','}','#','%','^','*','+','='],
    ['_','\\','|','~','<','>','€','£','¥','•'],
    ['ABC','…','©','®','™','§','¶','°','BACKSPACE'],
  ],
  bottom: ['123', 'SPACE', 'ENTER']
};

// Huruf Arab — layout standar (baris atas→bawah)
const _CK_ARAB_ROWS = [
  ['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج'],
  ['ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط'],
  ['ARAB_SHIFT','ئ','ء','ؤ','ر','لا','ى','ة','و','ز','ظ','BACKSPACE'],
];
const _CK_ARAB_SHIFT_ROWS = [
  ['َ','ُ','ِ','ً','ٌ','ٍ','ْ','ّ','ـ','ء','أ'],
  ['إ','آ','ؤ','ئ','لأ','لإ','لآ','لا','ى','ة','ط'],
  ['ARAB_SHIFT','ٰ','ٱ','ؿ','ؾ','ؽ','ٮ','ڈ','ژ','ڑ','ک','BACKSPACE'],
];
const _CK_ARAB = {
  rows: _CK_ARAB_ROWS,
  shiftRows: _CK_ARAB_SHIFT_ROWS,
  bottom: ['SWITCH_LATIN', 'SPACE', 'ENTER']
};

// ── State ────────────────────────────────────────────────────────────

const _ckState = {
  activeQId    : null,   // qId textarea yang sedang aktif
  shiftOn      : false,  // shift Latin
  capsOn       : false,  // caps lock Latin
  arabShiftOn  : false,  // harakat mode Arab
  currentTab   : 'abc',  // abc | num | sym | math | arab
  mathSubTab   : null,   // kategori aktif di tab Math
};

// ── Helpers ─────────────────────────────────────────────────────────

function _ckGetTA() {
  if (!_ckState.activeQId) return null;
  return document.getElementById(`essay-text-${_ckState.activeQId}`);
}

function _ckInsert(text) {
  const ta = _ckGetTA();
  if (!ta) return;
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
  const pos = start + text.length;
  ta.setSelectionRange(pos, pos);
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  _ckAutoResize(ta);
  saveAnswer(_ckState.activeQId, ta.value);
  _ckSchedulePreview();
}

function _ckBackspace() {
  const ta = _ckGetTA();
  if (!ta) return;
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  if (start !== end) {
    ta.value = ta.value.slice(0, start) + ta.value.slice(end);
    ta.setSelectionRange(start, start);
  } else if (start > 0) {
    // Handle surrogate pairs (emoji, Arab multi-char)
    const before = ta.value.slice(0, start);
    const arr = [...before];
    arr.pop();
    const newBefore = arr.join('');
    ta.value = newBefore + ta.value.slice(end);
    ta.setSelectionRange(newBefore.length, newBefore.length);
  }
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  _ckAutoResize(ta);
  saveAnswer(_ckState.activeQId, ta.value);
  _ckSchedulePreview();
}

function _ckEnter() {
  _ckInsert('\n');
}

function _ckSchedulePreview() {
  const qId = _ckState.activeQId;
  if (!qId) return;
  const ta = _ckGetTA();
  if (ta) _scheduleMathPreview(ta, qId);
}

// ── Render satu tombol ───────────────────────────────────────────────

function _ckMakeKey(label, extraClass, onClick, title) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `ck-key ${extraClass || ''}`;
  if (title) btn.title = title;

  const inner = document.createElement('span');
  inner.innerHTML = label;
  btn.appendChild(inner);

  // Prevent focus-steal dari textarea
  btn.addEventListener('mousedown', e => e.preventDefault());
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    btn.classList.add('pressed');
    isKeyboardSafeMode = true;
    window._essayKeyboardActive = true;
  }, { passive: false });
  btn.addEventListener('touchend', e => {
    e.preventDefault();
    btn.classList.remove('pressed');
    onClick();
  }, { passive: false });
  btn.addEventListener('click', () => {
    isKeyboardSafeMode = true;
    window._essayKeyboardActive = true;
    onClick();
  });

  return btn;
}

// ── Render row helper ────────────────────────────────────────────────

function _ckBuildRow(keys, shiftOn, arabShiftOn, isArab) {
  const row = document.createElement('div');
  row.className = 'ck-row';

  keys.forEach(k => {
    let btn;
    const ku = k.toUpperCase();

    if (ku === 'BACKSPACE') {
      btn = _ckMakeKey('<i class="fas fa-delete-left"></i>', 'special danger', _ckBackspace, 'Hapus');
      btn.style.minWidth = '44px';
    } else if (ku === 'SHIFT' || ku === 'ARAB_SHIFT') {
      const isActive = isArab ? arabShiftOn : shiftOn;
      btn = _ckMakeKey(
        '<i class="fas fa-arrow-up"></i>',
        `special ${isActive ? 'shift-active' : ''}`,
        () => _ckToggleShift(isArab),
        isArab ? 'Harakat' : 'Shift/Caps'
      );
      btn.style.minWidth = '44px';
    } else if (ku === 'SWITCH_NUM') {
      btn = _ckMakeKey('123', 'special sym-key', () => _ckSwitchTab('num'));
      btn.style.minWidth = '42px';
    } else if (ku === 'SWITCH_LATIN' || ku === 'ABC') {
      btn = _ckMakeKey('ABC', 'special sym-key', () => _ckSwitchTab('abc'));
      btn.style.minWidth = '42px';
    } else if (ku === '#+=') {
      btn = _ckMakeKey('#+=', 'special sym-key', () => _ckSwitchTab('sym'));
      btn.style.minWidth = '42px';
    } else if (ku === '123') {
      btn = _ckMakeKey('123', 'special sym-key', () => _ckSwitchTab('num'));
      btn.style.minWidth = '42px';
    } else {
      // Karakter biasa
      let display = k;
      let insertChar = k;

      if (!isArab) {
        if (shiftOn) {
          display    = k.toUpperCase();
          insertChar = k.toUpperCase();
        }
      }
      // Untuk Arab: tampilkan apa adanya (sudah karakter Arab)
      const isTinyChar = display.length > 1;
      btn = _ckMakeKey(display, isArab ? 'arabic' : '', () => {
        _ckInsert(insertChar);
        if (!isArab) _ckAutoOffShift();
      });
      if (isTinyChar) btn.querySelector('span').style.fontSize = '12px';
    }

    row.appendChild(btn);
  });

  return row;
}

// ── Toggle shift / caps ──────────────────────────────────────────────

function _ckToggleShift(isArab) {
  if (isArab) {
    _ckState.arabShiftOn = !_ckState.arabShiftOn;
  } else {
    if (_ckState.shiftOn && !_ckState.capsOn) {
      // shift → caps