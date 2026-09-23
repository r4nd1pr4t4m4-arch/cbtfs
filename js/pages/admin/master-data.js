/**
 * master-data.js — Halaman Data Master
 * renderMasterDataPage() + _md* helpers
 * Sumber: index.html L16834-17439
 */

function renderMasterDataPage(container) {
  // Initialize state
  if (!window._masterUI) {
    window._masterUI = {
      classes: [],          // current items (after filter applied for display only; persisted state)
      subjects: [],
      original: { classes: [], subjects: [] },  // baseline from server for change detection
      sortMode: { class: 'natural', subject: 'natural' }, // natural | az | za
      search: { class: '', subject: '' },
      lastDeleted: null     // { type, value, idx } for undo
    };
  }
  const ui = window._masterUI;

  container.innerHTML = `
    <div class="md-page fade-in">

      <div class="md-header">
        <div class="min-w-0">
          <h2><i class="fas fa-database mr-2"></i>Manajemen Data Master</h2>
          <p>Kelola daftar Kelas dan Mata Pelajaran untuk seluruh sistem.</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <span id="md-changes-pill" class="md-changes-pill" style="display:none;">
            <span class="dot"></span>
            <span id="md-changes-count">0 perubahan</span>
          </span>
          <button id="md-save-btn" class="md-save-btn" onclick="_mdSave()" disabled>
            <i class="fas fa-floppy-disk"></i> Simpan Perubahan
          </button>
        </div>
      </div>

      <div class="md-cards-grid">
        <!-- KELAS -->
        <div class="md-card">
          <div class="md-card-head">
            <div class="md-card-ico" style="background:#e0e7ff;color:#4f46e5;"><i class="fas fa-chalkboard-teacher"></i></div>
            <div class="flex-1 min-w-0">
              <div class="md-card-title">Daftar Kelas</div>
              <div class="text-xs text-slate-400 font-medium mt-0.5">Contoh: VII A, VIII B, IX C</div>
            </div>
            <span class="md-card-count" id="md-count-class">0</span>
          </div>
          <div class="md-card-body">
            <div class="md-input-row">
              <input type="text" id="md-input-class" class="md-input" placeholder="Ketik nama kelas baru, lalu Enter..."
                maxlength="50" onkeydown="_mdInputKey(event, 'class')">
              <button class="md-add-btn" style="background:#4f46e5;" onclick="_mdAddItem('class')" title="Tambah">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="md-toolbar">
              <button class="md-toolbar-btn" onclick="_mdToggleSort('class')" id="md-sort-class">
                <i class="fas fa-arrow-up-a-z"></i> <span id="md-sort-class-lbl">A-Z</span>
              </button>
              <button class="md-toolbar-btn" onclick="_mdOpenBulkPaste('class')">
                <i class="fas fa-paste"></i> Tempel Banyak
              </button>
              <div class="md-search" style="flex:1; min-width:120px;">
                <i class="fas fa-search"></i>
                <input id="md-search-class" type="text" placeholder="Cari kelas..." oninput="_mdSetSearch('class', this.value)">
                <button class="md-search-clear" onclick="_mdSetSearch('class','')"><i class="fas fa-times"></i></button>
              </div>
            </div>
            <div class="md-list" id="md-list-class"></div>
          </div>
        </div>

        <!-- MAPEL -->
        <div class="md-card">
          <div class="md-card-head">
            <div class="md-card-ico" style="background:#ccfbf1;color:#0d9488;"><i class="fas fa-book"></i></div>
            <div class="flex-1 min-w-0">
              <div class="md-card-title">Daftar Mata Pelajaran</div>
              <div class="text-xs text-slate-400 font-medium mt-0.5">Contoh: Matematika, Bahasa Indonesia, IPA</div>
            </div>
            <span class="md-card-count" id="md-count-subject">0</span>
          </div>
          <div class="md-card-body">
            <div class="md-input-row">
              <input type="text" id="md-input-subject" class="md-input" placeholder="Ketik nama mapel baru, lalu Enter..."
                maxlength="60" onkeydown="_mdInputKey(event, 'subject')">
              <button class="md-add-btn" style="background:#0d9488;" onclick="_mdAddItem('subject')" title="Tambah">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="md-toolbar">
              <button class="md-toolbar-btn" onclick="_mdToggleSort('subject')" id="md-sort-subject">
                <i class="fas fa-arrow-up-a-z"></i> <span id="md-sort-subject-lbl">A-Z</span>
              </button>
              <button class="md-toolbar-btn" onclick="_mdOpenBulkPaste('subject')">
                <i class="fas fa-paste"></i> Tempel Banyak
              </button>
              <div class="md-search" style="flex:1; min-width:120px;">
                <i class="fas fa-search"></i>
                <input id="md-search-subject" type="text" placeholder="Cari mapel..." oninput="_mdSetSearch('subject', this.value)">
                <button class="md-search-clear" onclick="_mdSetSearch('subject','')"><i class="fas fa-times"></i></button>
              </div>
            </div>
            <div class="md-list" id="md-list-subject"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  _mdRenderList('class');
  _mdRenderList('subject');
  _mdLoadFromServer();

  // Warn before navigating away with unsaved changes
  if (!window._mdBeforeUnloadBound) {
    window.addEventListener('beforeunload', function(e) {
      if (_mdHasChanges()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });
    window._mdBeforeUnloadBound = true;
  }
}

// ───── Helpers ─────
function _mdEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function _mdSanitizeInput(value) {
  // Reject characters that conflict with class/subject separators in user.class field (',' ':')
  return String(value || '').trim().replace(/[,:]/g, '').replace(/\s+/g, ' ');
}

function _mdLoadFromServer() {
  const ui = window._masterUI;
  ['class','subject'].forEach(t => {
    const list = document.getElementById('md-list-' + t);
    if (list) list.innerHTML = '<div class="md-empty"><i class="fas fa-circle-notch fa-spin"></i> Memuat data...</div>';
  });

  google.script.run
    .withSuccessHandler(data => {
      ui.classes  = Array.isArray(data && data.classes)  ? data.classes.slice()  : [];
      ui.subjects = Array.isArray(data && data.subjects) ? data.subjects.slice() : [];
      ui.original.classes  = ui.classes.slice();
      ui.original.subjects = ui.subjects.slice();
      ui.lastDeleted = null;
      // Sync legacy global
      masterData = { classes: ui.classes.slice(), subjects: ui.subjects.slice() };
      _mdRenderList('class');
      _mdRenderList('subject');
      _mdUpdateChangesUI();
    })
    .withFailureHandler(err => {
      ['class','subject'].forEach(t => {
        const list = document.getElementById('md-list-' + t);
        if (list) {
          list.innerHTML = `
            <div class="md-empty">
              <i class="fas fa-triangle-exclamation" style="color:#ef4444;"></i>
              <div class="font-bold text-red-600">Gagal memuat data</div>
              <button onclick="_mdLoadFromServer()" class="md-toolbar-btn" style="background:#fef2f2;border-color:#fecaca;color:#dc2626;">
                <i class="fas fa-rotate-right"></i> Coba Lagi
              </button>
            </div>`;
        }
      });
      Swal.fire({
        title:'Gagal Memuat',
        html:`<p style="font-size:13px;color:#475569;">Tidak dapat mengambil data master dari server.</p>
              <p style="font-size:11px;color:#dc2626;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:8px;margin-top:8px;">${(err && err.message) || err}</p>`,
        icon:'error', confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      });
    })
    .getMasterData();
}

function _mdGetItems(type) {
  return type === 'class' ? window._masterUI.classes : window._masterUI.subjects;
}
function _mdSetItems(type, arr) {
  if (type === 'class') window._masterUI.classes = arr;
  else                  window._masterUI.subjects = arr;
}

function _mdRenderList(type) {
  const ui = window._masterUI;
  const list = document.getElementById('md-list-' + type);
  const countEl = document.getElementById('md-count-' + type);
  if (!list) return;

  const items = _mdGetItems(type);
  if (countEl) countEl.textContent = items.length;

  // Apply search + sort
  const search = (ui.search[type] || '').toLowerCase();
  let display = items.map((v, idx) => ({ v, idx }));
  if (search) display = display.filter(o => String(o.v).toLowerCase().includes(search));

  const mode = ui.sortMode[type];
  if (mode === 'az') display.sort((a, b) => String(a.v).localeCompare(String(b.v), 'id', { numeric: true }));
  else if (mode === 'za') display.sort((a, b) => String(b.v).localeCompare(String(a.v), 'id', { numeric: true }));

  // Update sort label
  const sortLbl = document.getElementById('md-sort-' + type + '-lbl');
  const sortBtn = document.getElementById('md-sort-' + type);
  if (sortLbl && sortBtn) {
    if (mode === 'az')      { sortLbl.textContent = 'A-Z'; sortBtn.classList.add('active'); sortBtn.querySelector('i').className = 'fas fa-arrow-up-a-z'; }
    else if (mode === 'za') { sortLbl.textContent = 'Z-A'; sortBtn.classList.add('active'); sortBtn.querySelector('i').className = 'fas fa-arrow-down-z-a'; }
    else                    { sortLbl.textContent = 'A-Z'; sortBtn.classList.remove('active'); sortBtn.querySelector('i').className = 'fas fa-arrow-up-a-z'; }
  }

  // Update search clear button
  const clearBtn = document.querySelector(`#md-search-${type} ~ .md-search-clear`);
  // Actually the clear button is sibling — find via parent
  const searchInput = document.getElementById('md-search-' + type);
  if (searchInput) {
    const parent = searchInput.parentElement;
    if (parent) {
      const cb = parent.querySelector('.md-search-clear');
      if (cb) cb.classList.toggle('show', !!ui.search[type]);
    }
  }

  // Render
  if (items.length === 0) {
    list.innerHTML = `
      <div class="md-empty">
        <i class="fas fa-folder-open"></i>
        <div>Belum ada data ${type === 'class' ? 'kelas' : 'mata pelajaran'}.</div>
        <div class="text-xs">Tambahkan data baru dengan kotak input di atas.</div>
      </div>`;
    return;
  }
  if (display.length === 0) {
    list.innerHTML = `
      <div class="md-empty">
        <i class="fas fa-search-minus"></i>
        <div>Tidak ada hasil pencarian.</div>
      </div>`;
    return;
  }

  const orig = window._masterUI.original[type === 'class' ? 'classes' : 'subjects'];
  list.innerHTML = display.map(o => {
    const isNew = !orig.includes(o.v);
    return `
      <div class="md-item ${isNew ? 'is-new' : ''}" data-idx="${o.idx}" data-type="${type}">
        <span class="md-item-text" ondblclick="_mdStartEdit('${type}', ${o.idx})" title="Klik dua kali untuk edit">${_mdEsc(o.v)}</span>
        <div class="md-item-actions">
          <button class="md-item-btn md-item-btn-edit" onclick="_mdStartEdit('${type}', ${o.idx})" title="Edit">
            <i class="fas fa-pen"></i>
          </button>
          <button class="md-item-btn md-item-btn-del" onclick="_mdDeleteItem('${type}', ${o.idx})" title="Hapus">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>`;
  }).join('');
}

function _mdInputKey(e, type) {
  if (e.key === 'Enter') {
    e.preventDefault();
    _mdAddItem(type);
  }
}

function _mdAddItem(type) {
  const inp = document.getElementById('md-input-' + type);
  if (!inp) return;
  const raw = inp.value;
  const value = _mdSanitizeInput(raw);

  if (!value) {
    inp.focus();
    return;
  }
  if (value !== raw.trim()) {
    Swal.fire({
      title:'Karakter Tidak Diizinkan',
      html:'<p style="font-size:13px;color:#475569;">Karakter <code style="background:#f1f5f9;padding:2px 5px;border-radius:4px;">,</code> dan <code style="background:#f1f5f9;padding:2px 5px;border-radius:4px;">:</code> tidak boleh digunakan karena dipakai sebagai pemisah data.</p>',
      icon:'warning', confirmButtonColor:'#4f46e5',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }

  const items = _mdGetItems(type);
  if (items.some(x => String(x).toLowerCase() === value.toLowerCase())) {
    const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
    Toast.fire({ icon:'warning', title:`"${value}" sudah ada di daftar` });
    inp.focus();
    return;
  }

  items.push(value);
  _mdSetItems(type, items);
  inp.value = '';
  inp.focus();
  _mdRenderList(type);
  _mdUpdateChangesUI();
}

function _mdDeleteItem(type, idx) {
  const items = _mdGetItems(type);
  if (idx < 0 || idx >= items.length) return;
  const value = items[idx];

  // Animation
  const card = document.querySelector(`.md-item[data-type="${type}"][data-idx="${idx}"]`);
  if (card) card.classList.add('removing');

  setTimeout(() => {
    items.splice(idx, 1);
    _mdSetItems(type, items);
    window._masterUI.lastDeleted = { type, value, idx };
    _mdRenderList(type);
    _mdUpdateChangesUI();

    const Toast = Swal.mixin({
      toast:true, position:'top-end', showConfirmButton:true,
      confirmButtonText:'Undo', timer:3500, timerProgressBar:true,
      customClass:{ popup:'lp-swal' }
    });
    Toast.fire({ icon:'info', title:`"${value}" dihapus` }).then(r => {
      if (r.isConfirmed && window._masterUI.lastDeleted &&
          window._masterUI.lastDeleted.type === type &&
          window._masterUI.lastDeleted.value === value) {
        const arr = _mdGetItems(type);
        const insertIdx = Math.min(window._masterUI.lastDeleted.idx, arr.length);
        arr.splice(insertIdx, 0, value);
        _mdSetItems(type, arr);
        window._masterUI.lastDeleted = null;
        _mdRenderList(type);
        _mdUpdateChangesUI();
      }
    });
  }, 180);
}

function _mdStartEdit(type, idx) {
  const items = _mdGetItems(type);
  if (idx < 0 || idx >= items.length) return;
  const card = document.querySelector(`.md-item[data-type="${type}"][data-idx="${idx}"]`);
  if (!card) return;
  const original = items[idx];
  card.classList.add('is-edit');
  card.innerHTML = `
    <input class="md-item-edit-input" id="md-edit-${type}-${idx}" value="${_mdEsc(original)}" maxlength="${type==='class'?50:60}">
    <div class="md-item-actions">
      <button class="md-item-btn md-item-btn-ok" onclick="_mdCommitEdit('${type}', ${idx})" title="Simpan">
        <i class="fas fa-check"></i>
      </button>
      <button class="md-item-btn md-item-btn-cancel" onclick="_mdCancelEdit('${type}', ${idx})" title="Batal">
        <i class="fas fa-times"></i>
      </button>
    </div>`;
  const input = document.getElementById(`md-edit-${type}-${idx}`);
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter')      { e.preventDefault(); _mdCommitEdit(type, idx); }
      else if (e.key === 'Escape'){ e.preventDefault(); _mdCancelEdit(type, idx); }
    });
  }
}
function _mdCommitEdit(type, idx) {
  const input = document.getElementById(`md-edit-${type}-${idx}`);
  if (!input) return;
  const raw = input.value;
  const value = _mdSanitizeInput(raw);
  const items = _mdGetItems(type);
  if (!value) { _mdCancelEdit(type, idx); return; }
  if (value !== raw.trim()) {
    Swal.fire({
      title:'Karakter Tidak Diizinkan',
      html:'<p style="font-size:13px;color:#475569;">Karakter <code style="background:#f1f5f9;padding:2px 5px;border-radius:4px;">,</code> dan <code style="background:#f1f5f9;padding:2px 5px;border-radius:4px;">:</code> tidak diizinkan.</p>',
      icon:'warning', confirmButtonColor:'#4f46e5',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  // Duplicate check (skip same idx)
  if (items.some((x, i) => i !== idx && String(x).toLowerCase() === value.toLowerCase())) {
    Swal.fire({
      title:'Duplikat',
      html:`<p style="font-size:13px;color:#475569;">"${_mdEsc(value)}" sudah ada di daftar.</p>`,
      icon:'warning', confirmButtonColor:'#4f46e5',
      customClass:{ popup:'lp-swal' }
    });
    return;
  }
  items[idx] = value;
  _mdSetItems(type, items);
  _mdRenderList(type);
  _mdUpdateChangesUI();
}
function _mdCancelEdit(type, idx) {
  _mdRenderList(type);
}

function _mdToggleSort(type) {
  const ui = window._masterUI;
  const cur = ui.sortMode[type];
  ui.sortMode[type] = (cur === 'natural') ? 'az' : (cur === 'az' ? 'za' : 'natural');
  _mdRenderList(type);
}
function _mdSetSearch(type, value) {
  window._masterUI.search[type] = value || '';
  // Sync DOM if called externally
  const inp = document.getElementById('md-search-' + type);
  if (inp && inp.value !== (value || '')) inp.value = value || '';
  _mdRenderList(type);
}

function _mdHasChanges() {
  const ui = window._masterUI;
  if (!ui) return false;
  const o = ui.original;
  return JSON.stringify(o.classes) !== JSON.stringify(ui.classes) ||
         JSON.stringify(o.subjects) !== JSON.stringify(ui.subjects);
}

function _mdUpdateChangesUI() {
  const ui = window._masterUI;
  const orig = ui.original;
  let added = 0, removed = 0, modified = 0;

  ['classes','subjects'].forEach(key => {
    const cur = ui[key];
    const ori = orig[key];
    cur.forEach(v => { if (!ori.includes(v)) added++; });
    ori.forEach(v => { if (!cur.includes(v)) removed++; });
  });
  // simple approximation: edits show as 1 add + 1 remove. so modified count = pairs.
  const total = added + removed;

  const pill = document.getElementById('md-changes-pill');
  const cnt  = document.getElementById('md-changes-count');
  const btn  = document.getElementById('md-save-btn');

  if (total > 0) {
    if (pill) pill.style.display = 'inline-flex';
    if (cnt)  cnt.textContent = `${total} perubahan`;
    if (btn)  btn.disabled = false;
  } else {
    if (pill) pill.style.display = 'none';
    if (btn)  btn.disabled = true;
  }
}

function _mdOpenBulkPaste(type) {
  const label = type === 'class' ? 'Kelas' : 'Mata Pelajaran';
  Swal.fire({
    title: `<i class="fas fa-paste mr-2"></i>Tempel Banyak ${label}`,
    html: `
      <p style="font-size:13px;color:#475569;text-align:left;margin-bottom:8px;">Tempel daftar ${label.toLowerCase()} (satu per baris). Duplikat akan diabaikan.</p>
      <textarea id="md-bulk-input" class="md-bulk-textarea" placeholder="${type === 'class' ? 'VII A\nVII B\nVII C\nVIII A' : 'Matematika\nBahasa Indonesia\nIPA\nIPS'}"></textarea>
      <p style="font-size:11px;color:#94a3b8;text-align:left;margin-top:6px;"><i class="fas fa-info-circle"></i> Maksimal ${type==='class'?50:60} karakter per baris. Karakter <code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;">,</code> dan <code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;">:</code> akan dihapus otomatis.</p>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-plus mr-1"></i> Tambahkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: type === 'class' ? '#4f46e5' : '#0d9488',
    cancelButtonColor: '#64748b',
    reverseButtons: true,
    width: 480,
    customClass:{ popup:'lp-swal' },
    didOpen: () => {
      const ta = document.getElementById('md-bulk-input');
      if (ta) ta.focus();
    },
    preConfirm: () => {
      const ta = document.getElementById('md-bulk-input');
      const raw = ta ? ta.value : '';
      const lines = raw.split(/\r?\n/).map(l => _mdSanitizeInput(l)).filter(Boolean);
      if (lines.length === 0) {
        Swal.showValidationMessage('Tidak ada item yang valid untuk ditambahkan.');
        return false;
      }
      return lines;
    }
  }).then(result => {
    if (!result.isConfirmed || !Array.isArray(result.value)) return;
    const items = _mdGetItems(type);
    const lower = items.map(x => String(x).toLowerCase());
    let added = 0, skipped = 0;
    result.value.forEach(v => {
      const cap = type === 'class' ? 50 : 60;
      const truncated = v.slice(0, cap);
      if (lower.includes(truncated.toLowerCase())) { skipped++; return; }
      items.push(truncated);
      lower.push(truncated.toLowerCase());
      added++;
    });
    _mdSetItems(type, items);
    _mdRenderList(type);
    _mdUpdateChangesUI();

    const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2400, timerProgressBar:true });
    Toast.fire({
      icon: added > 0 ? 'success' : 'info',
      title: `${added} item ditambahkan${skipped > 0 ? `, ${skipped} duplikat dilewati` : ''}`
    });
  });
}

function _mdSave() {
  const ui = window._masterUI;
  if (!ui) return;
  if (!_mdHasChanges()) return;

  const orig = ui.original;
  const cur  = { classes: ui.classes.slice(), subjects: ui.subjects.slice() };
  const cAdd = cur.classes.filter(v => !orig.classes.includes(v)).length;
  const cDel = orig.classes.filter(v => !cur.classes.includes(v)).length;
  const sAdd = cur.subjects.filter(v => !orig.subjects.includes(v)).length;
  const sDel = orig.subjects.filter(v => !cur.subjects.includes(v)).length;

  const summaryRows = [];
  if (cAdd) summaryRows.push(`<li><b>${cAdd}</b> kelas ditambah</li>`);
  if (cDel) summaryRows.push(`<li><b>${cDel}</b> kelas dihapus</li>`);
  if (sAdd) summaryRows.push(`<li><b>${sAdd}</b> mapel ditambah</li>`);
  if (sDel) summaryRows.push(`<li><b>${sDel}</b> mapel dihapus</li>`);

  Swal.fire({
    title: 'Simpan Perubahan?',
    html: `
      <p style="font-size:13px;color:#475569;">Perubahan akan disimpan ke server:</p>
      <ul style="text-align:left;font-size:12px;color:#1e293b;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 14px 10px 28px;margin-top:8px;list-style:disc;">
        ${summaryRows.join('')}
      </ul>
      <p style="font-size:11px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:8px;margin-top:8px;">
        <i class="fas fa-triangle-exclamation"></i> Penghapusan kelas/mapel <b>tidak otomatis</b> mengupdate data siswa/guru/ujian yang sudah ada.
      </p>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText: '<i class="fas fa-floppy-disk mr-1"></i> Ya, Simpan',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass:{ popup:'lp-swal' }
  }).then(result => {
    if (!result.isConfirmed) return;

    document.getElementById('global-loading').classList.remove('hidden');
    const btn = document.getElementById('md-save-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...'; }

    google.script.run
      .withSuccessHandler(res => {
        document.getElementById('global-loading').classList.add('hidden');
        if (btn) btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Simpan Perubahan';
        if (res && res.success) {
          // Update baseline & global
          ui.original.classes  = ui.classes.slice();
          ui.original.subjects = ui.subjects.slice();
          masterData = { classes: ui.classes.slice(), subjects: ui.subjects.slice() };
          _mdRenderList('class');
          _mdRenderList('subject');
          _mdUpdateChangesUI();
          const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2200, timerProgressBar:true });
          Toast.fire({ icon:'success', title: (res.message) || 'Data master diperbarui' });
        } else {
          if (btn) btn.disabled = false;
          Swal.fire({
            title:'Gagal',
            html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
            icon:'error', confirmButtonColor:'#dc2626',
            customClass:{ popup:'lp-swal' }
          });
        }
      })
      .withFailureHandler(err => {
        document.getElementById('global-loading').classList.add('hidden');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Simpan Perubahan'; }
        Swal.fire({
          title:'Error Server',
          html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
          icon:'error', confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        });
      })
      .saveMasterData(cur, currentUser.userID, currentUser.token);
  });
}
