/**
 * essay-tools.js — Custom Keyboard Esai + Canvas Draw
 * _ck*, switchEssayMode, renderEssayMathTools, initEssayCanvas, canvas helpers
 * Sumber: index.html L36010-37021
 */

      _ckState.capsOn  = true;
      _ckState.shiftOn = true;
    } else if (_ckState.capsOn) {
      // caps → off
      _ckState.capsOn  = false;
      _ckState.shiftOn = false;
    } else {
      // off → shift (sekali)
      _ckState.shiftOn = true;
      _ckState.capsOn  = false;
    }
  }
  _ckRerenderCurrentPanel();
}

// Auto-off shift setelah satu ketukan (bukan caps)
function _ckAutoOffShift() {
  if (_ckState.shiftOn && !_ckState.capsOn) {
    _ckState.shiftOn = false;
    _ckRerenderCurrentPanel();
  }
}

// ── Switch tab ───────────────────────────────────────────────────────

function _ckSwitchTab(tabId) {
  _ckState.currentTab = tabId;
  const wrapper = document.getElementById(`ck-wrapper-${_ckState.activeQId}`);
  if (!wrapper) return;

  // Update tab buttons
  wrapper.querySelectorAll('.ck-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabId);
  });
  // Update panels
  wrapper.querySelectorAll('.ck-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.panel === tabId);
  });
}

// ── Re-render panel aktif (utk shift/caps) ───────────────────────────

function _ckRerenderCurrentPanel() {
  const qId = _ckState.activeQId;
  if (!qId) return;
  const wrapper = document.getElementById(`ck-wrapper-${qId}`);
  if (!wrapper) return;
  const tab = _ckState.currentTab;

  if (tab === 'abc') {
    const panel = wrapper.querySelector('[data-panel="abc"]');
    if (panel) { panel.innerHTML = ''; _ckFillLatinPanel(panel); }
  } else if (tab === 'arab') {
    const panel = wrapper.querySelector('[data-panel="arab"]');
    if (panel) { panel.innerHTML = ''; _ckFillArabPanel(panel); }
  }
}

// ── Fill panels ──────────────────────────────────────────────────────

function _ckFillLatinPanel(panel) {
  const s = _ckState.shiftOn;
  _CK_LATIN.rows.forEach(row => panel.appendChild(_ckBuildRow(row, s, false, false)));
  // Bottom row
  const bottom = document.createElement('div');
  bottom.className = 'ck-row';
  bottom.appendChild(_ckMakeKey('123', 'special sym-key', () => _ckSwitchTab('num')));
  const spaceBtn = _ckMakeKey('SPASI', 'special space-key', () => { _ckInsert(' '); _ckAutoOffShift(); });
  bottom.appendChild(spaceBtn);
  const enterBtn = _ckMakeKey('↵', 'action enter-key', _ckEnter, 'Enter / Baris baru');
  bottom.appendChild(enterBtn);
  panel.appendChild(bottom);
}

function _ckFillNumPanel(panel) {
  _CK_NUM.rows.forEach(row => panel.appendChild(_ckBuildRow(row, false, false, false)));
  const bottom = document.createElement('div');
  bottom.className = 'ck-row';
  bottom.appendChild(_ckMakeKey('ABC', 'special sym-key', () => _ckSwitchTab('abc')));
  bottom.appendChild(_ckMakeKey('SPASI', 'special space-key', () => _ckInsert(' ')));
  bottom.appendChild(_ckMakeKey('↵', 'action enter-key', _ckEnter));
  panel.appendChild(bottom);
}

function _ckFillSymPanel(panel) {
  _CK_SYM.rows.forEach(row => panel.appendChild(_ckBuildRow(row, false, false, false)));
  const bottom = document.createElement('div');
  bottom.className = 'ck-row';
  bottom.appendChild(_ckMakeKey('123', 'special sym-key', () => _ckSwitchTab('num')));
  bottom.appendChild(_ckMakeKey('SPASI', 'special space-key', () => _ckInsert(' ')));
  bottom.appendChild(_ckMakeKey('↵', 'action enter-key', _ckEnter));
  panel.appendChild(bottom);
}

function _ckFillArabPanel(panel) {
  const rows = _ckState.arabShiftOn ? _CK_ARAB.shiftRows : _CK_ARAB.rows;
  rows.forEach(row => panel.appendChild(_ckBuildRow(row, false, _ckState.arabShiftOn, true)));
  const bottom = document.createElement('div');
  bottom.className = 'ck-row';
  // Di desktop tidak ada tab ABC — kembalikan ke Math; di mobile kembalikan ke ABC
  const _ckIsDesktop = !('ontouchstart' in window) && !(navigator.maxTouchPoints > 0);
  const switchTarget  = _ckIsDesktop ? 'math' : 'abc';
  const switchLabel   = _ckIsDesktop ? '∑ Math ↔ عرب' : 'ABC ↔ عرب';
  const switchBtn = _ckMakeKey(switchLabel, 'lang-switch', () => _ckSwitchTab(switchTarget), _ckIsDesktop ? 'Kembali ke Math' : 'Kembali ke Latin');
  switchBtn.style.minWidth = '80px';
  bottom.appendChild(switchBtn);
  bottom.appendChild(_ckMakeKey('SPASI', 'special space-key', () => _ckInsert(' ')));
  bottom.appendChild(_ckMakeKey('↵', 'action enter-key', _ckEnter));
  panel.appendChild(bottom);
}

function _ckFillMathPanel(panel, qId) {
  const ta = document.getElementById(`essay-text-${qId}`);
  const cats = Object.keys(MATH_KB);
  if (!_ckState.mathSubTab || !MATH_KB[_ckState.mathSubTab]) {
    _ckState.mathSubTab = cats[0];
  }

  // Sub-tab bar
  const subTabBar = document.createElement('div');
  subTabBar.className = 'ck-math-subtabs';
  cats.forEach(cat => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'ck-math-stab' + (cat === _ckState.mathSubTab ? ' active' : '');
    t.textContent = cat;
    t.addEventListener('mousedown', e => e.preventDefault());
    t.addEventListener('click', () => {
      _ckState.mathSubTab = cat;
      subTabBar.querySelectorAll('.ck-math-stab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      _ckRefreshMathGrid(grid, cat, ta, qId);
    });
    t.addEventListener('touchend', e => {
      e.preventDefault();
      _ckState.mathSubTab = cat;
      subTabBar.querySelectorAll('.ck-math-stab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      _ckRefreshMathGrid(grid, cat, ta, qId);
    }, { passive: false });
    subTabBar.appendChild(t);
  });

  // Grid simbol
  const grid = document.createElement('div');
  grid.className = 'ck-math-grid';
  _ckRefreshMathGrid(grid, _ckState.mathSubTab, ta, qId);

  // Preview box
  const preview = document.createElement('div');
  preview.id = `math-preview-${qId}`;
  preview.className = 'ck-preview-box hidden';
  preview.innerHTML = `<div style="font-size:10px;font-weight:700;color:#2563eb;margin-bottom:4px;">👁 PREVIEW JAWABAN</div>
    <div id="math-preview-content-${qId}" style="word-break:break-word;white-space:pre-wrap;"></div>`;

  panel.appendChild(subTabBar);
  panel.appendChild(grid);
  panel.appendChild(preview);
}

function _ckRefreshMathGrid(grid, cat, ta, qId) {
  grid.innerHTML = '';
  const symbols = MATH_KB[cat] || [];
  symbols.forEach(sym => {
    const btn = _ckMakeKey(sym.d, `math-sym${sym.tpl ? ' math-tpl' : ''}`, () => {
      isKeyboardSafeMode = true;
      window._essayKeyboardActive = true;
      // Gunakan _insertMathAtCursor agar posisi kursor tetap dipertahankan
      _insertMathAtCursor(ta, sym.i, qId);
    }, sym.t);
    grid.appendChild(btn);
  });
}

// ── Build full keyboard wrapper ──────────────────────────────────────

function _ckBuild(qId) {
  const existing = document.getElementById(`ck-wrapper-${qId}`);
  if (existing) return existing;

  const wrapper = document.createElement('div');
  wrapper.className = 'ck-wrapper';
  wrapper.id = `ck-wrapper-${qId}`;

  // Tombol tutup
  const closeBtn = _ckMakeKey('✕', 'ck-close-btn', () => _ckHide(qId), 'Tutup keyboard');
  closeBtn.className = 'ck-close-btn';
  closeBtn.querySelector('span').textContent = '✕';
  wrapper.appendChild(closeBtn);

  // Tab bar
  const tabBar = document.createElement('div');
  tabBar.className = 'ck-tab-bar';

  // Desktop = tidak punya layar sentuh → hanya tampilkan tab Math dan Arab
  const _ckIsDesktop = !('ontouchstart' in window) && !(navigator.maxTouchPoints > 0);

  const tabs = _ckIsDesktop
    ? [
        { id: 'math', label: '∑ Math' },
        { id: 'arab', label: 'عرب'    },
      ]
    : [
        { id: 'abc',  label: 'ABC'    },
        { id: 'num',  label: '123'    },
        { id: 'sym',  label: '#=+'    },
        { id: 'math', label: '∑ Math' },
        { id: 'arab', label: 'عرب'    },
      ];

  tabs.forEach(tab => {
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'ck-tab' + (tab.id === _ckState.currentTab ? ' active' : '');
    t.dataset.tab = tab.id;
    t.textContent = tab.label;
    t.addEventListener('mousedown', e => e.preventDefault());
    t.addEventListener('click',    () => _ckSwitchTab(tab.id));
    t.addEventListener('touchend', e => { e.preventDefault(); _ckSwitchTab(tab.id); }, { passive: false });
    tabBar.appendChild(t);
  });
  wrapper.appendChild(tabBar);

  // Panels — di desktop hanya buat panel math dan arab
  const panelDefs = _ckIsDesktop ? ['math','arab'] : ['abc','num','sym','math','arab'];
  panelDefs.forEach(pid => {
    const panel = document.createElement('div');
    panel.className = 'ck-panel' + (pid === _ckState.currentTab ? ' active' : '');
    panel.dataset.panel = pid;

    if      (pid === 'abc')  _ckFillLatinPanel(panel);
    else if (pid === 'num')  _ckFillNumPanel(panel);
    else if (pid === 'sym')  _ckFillSymPanel(panel);
    else if (pid === 'math') _ckFillMathPanel(panel, qId);
    else if (pid === 'arab') _ckFillArabPanel(panel);

    wrapper.appendChild(panel);
  });

  return wrapper;
}

// ── Auto-grow textarea ───────────────────────────────────────────────

function _ckAutoResize(ta) {
  // Reset ke min dulu agar shrinkable saat teks dihapus
  ta.style.height = 'auto';
  const newH = Math.min(ta.scrollHeight, window.innerHeight * 0.7);
  ta.style.height = newH + 'px';
}

// ── Drag handle: resize manual textarea ─────────────────────────────

function _ckAttachDragHandle(handle, ta) {
  let startY    = 0;
  let startH    = 0;
  let dragging  = false;

  function onStart(clientY) {
    startY   = clientY;
    startH   = ta.offsetHeight;
    dragging = true;
    handle.classList.add('dragging');
    document.body.style.userSelect    = 'none';
    document.body.style.cursor        = 'ns-resize';
    isKeyboardSafeMode                = true;
    window._essayKeyboardActive       = true;
  }

  function onMove(clientY) {
    if (!dragging) return;
    const delta  = clientY - startY;
    const minH   = 44;
    const maxH   = Math.floor(window.innerHeight * 0.7);
    const newH   = Math.max(minH, Math.min(maxH, startH + delta));
    ta.style.height = newH + 'px';
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.style.userSelect = '';
    document.body.style.cursor     = '';
  }

  // Mouse events (desktop)
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    onStart(e.clientY);
  });
  document.addEventListener('mousemove', e => onMove(e.clientY));
  document.addEventListener('mouseup',   () => onEnd());

  // Touch events (mobile)
  handle.addEventListener('touchstart', e => {
    e.preventDefault();
    onStart(e.touches[0].clientY);
  }, { passive: false });
  handle.addEventListener('touchmove', e => {
    e.preventDefault();
    onMove(e.touches[0].clientY);
  }, { passive: false });
  handle.addEventListener('touchend', e => {
    e.preventDefault();
    onEnd();
  }, { passive: false });
}

// ── Show / Hide ──────────────────────────────────────────────────────

function _ckShow(qId) {
  _ckState.activeQId  = qId;
  _ckState.shiftOn    = false;
  _ckState.capsOn     = false;
  // Tab default: desktop → 'math', mobile → 'abc'
  const _ckIsDesktop = !('ontouchstart' in window) && !(navigator.maxTouchPoints > 0);
  _ckState.currentTab = _ckIsDesktop ? 'math' : 'abc';

  const ta = document.getElementById(`essay-text-${qId}`);
  if (!ta) return;

  // Lepas readonly agar _ckInsert bisa menulis ke ta.value
  ta.removeAttribute('readonly');
  // Pertahankan inputmode=none agar keyboard sistem tidak muncul
  ta.setAttribute('inputmode', 'none');

  // Styling aktif
  ta.classList.add('ck-active-ta');
  // Tandai ta-wrap agar drag handle ikut berubah warna
  const taWrapEl = document.getElementById(`essay-ta-wrap-${qId}`);
  if (taWrapEl) taWrapEl.classList.add('kb-open');

  // Cek apakah wrapper sudah ada (soal yg sama dibuka ulang)
  let wrapper = document.getElementById(`ck-wrapper-${qId}`);
  if (!wrapper) {
    wrapper = _ckBuild(qId);
    // Sisipkan langsung setelah essay-wrapper (parent dari textarea)
    const essayWrapper = ta.closest('.essay-wrapper');
    if (essayWrapper && essayWrapper.parentNode) {
      essayWrapper.parentNode.insertBefore(wrapper, essayWrapper.nextSibling);
    }
  }
  wrapper.style.display = '';

  // Scroll agar keyboard terlihat
  setTimeout(() => {
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 80);
}

function _ckHide(qId) {
  const ta = document.getElementById(`essay-text-${qId}`);
  if (ta) {
    ta.classList.remove('ck-active-ta');
    // Lepas kb-open dari ta-wrap
    const taWrapEl = document.getElementById(`essay-ta-wrap-${qId}`);
    if (taWrapEl) taWrapEl.classList.remove('kb-open');
    // Lepas readonly agar nilai tetap bisa dibaca
    ta.removeAttribute('readonly');
  }
  const wrapper = document.getElementById(`ck-wrapper-${qId}`);
  if (wrapper) wrapper.style.display = 'none';

  // Grace period agar anti-cheat tidak terpicu
  clearTimeout(window._essayKeyboardTimer);
  window._essayKeyboardTimer = setTimeout(() => {
    window._essayKeyboardActive = false;
    isKeyboardSafeMode = false;
  }, 3000);
}

/* ═══════════════════════════════════════════════════════════════════ */

const _mathPreviewTimers = {};

function _insertMathAtCursor(ta, text, qId) {
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  const before = ta.value.slice(0, start);
  const after  = ta.value.slice(end);
  ta.value = before + text + after;
  const newPos = start + text.length;
  ta.setSelectionRange(newPos, newPos);
  ta.dispatchEvent(new Event('input', { bubbles: true }));

  _scheduleMathPreview(ta, qId);

  saveAnswer(qId, ta.value);

  ta.focus();
}

function _scheduleMathPreview(ta, qId) {
  clearTimeout(_mathPreviewTimers[qId]);
  _mathPreviewTimers[qId] = setTimeout(() => {
    const previewBox = document.getElementById(`math-preview-${qId}`);
    const content    = document.getElementById(`math-preview-content-${qId}`);
    if (!previewBox || !content) return;
    const val = (ta.value || '').trim();
    if (!val) {
      previewBox.classList.add('hidden');
      return;
    }
    content.textContent = val;   
    previewBox.classList.remove('hidden');
    if (typeof MathJax !== 'undefined') {
      try {
        MathJax.typesetClear([content]);
        content.textContent = val;
        MathJax.typesetPromise([content]).catch(() => {});
      } catch(e) {}
    }
  }, 600);
}

function _updateEssayCharCounter(ta, qId) {
  const counter = document.getElementById(`essay-char-counter-${qId}`);
  if (!counter) return;

  const minChar  = parseInt(ta.dataset.minChar || '0');
  const enabled  = ta.dataset.minCharEnabled === 'true';
  if (!enabled || minChar <= 0) { counter.classList.add('hidden'); return; }

  const len = (ta.value || '').length;
  const ok  = len >= minChar;

  counter.classList.remove('hidden');
  counter.innerHTML = ok
    ? `<span class="text-emerald-600 font-semibold"><i class="fas fa-check-circle mr-1"></i>${len} karakter</span>
       <span class="text-slate-400 ml-1">(min. ${minChar})</span>`
    : `<span class="text-red-500 font-semibold"><i class="fas fa-exclamation-circle mr-1"></i>${len} karakter</span>
       <span class="text-red-400 ml-1">(min. ${minChar} — kurang ${minChar - len} karakter lagi)</span>`;
}

function _validateEssayMinChar() {
  const errors = [];
  document.querySelectorAll('textarea[data-essay-input]').forEach(ta => {
    const enabled = ta.dataset.minCharEnabled === 'true';
    const minChar = parseInt(ta.dataset.minChar || '0');
    if (!enabled || minChar <= 0) return;
    if (ta.style.display === 'none') return; 
    const len = (ta.value || '').trim().length;
    if (len < minChar) {
      const qId = ta.id.replace('essay-text-', '');
      const qNum = questions ? questions.findIndex(q => q.id === qId) + 1 : '?';
      errors.push({ qId, qNum, len, minChar });
    }
  });
  return errors;
}

function switchEssayMode(qId, mode, btnEl) {
  const textArea      = document.getElementById(`essay-text-${qId}`);
  const canvasWrap    = document.getElementById(`essay-canvas-wrapper-${qId}`);
  const mathToolsWrap = document.getElementById(`math-tools-wrap-${qId}`);
  const wrapper       = btnEl ? btnEl.closest('.essay-wrapper') : null;

  if (mode === 'text') {
    if (textArea)      textArea.style.display      = '';
    if (canvasWrap)    canvasWrap.style.display     = 'none';
    // mathToolsWrap tidak ditampilkan — digantikan custom keyboard
    if (mathToolsWrap) mathToolsWrap.style.display  = 'none';
    // Tampilkan kembali custom keyboard jika ada
    const ckW = document.getElementById(`ck-wrapper-${qId}`);
    if (ckW) ckW.style.display = '';
  } else {
    if (textArea)      textArea.style.display      = 'none';
    if (canvasWrap)    canvasWrap.style.display     = '';
    if (mathToolsWrap) mathToolsWrap.style.display  = 'none';
    // Sembunyikan custom keyboard saat mode canvas
    const ckW = document.getElementById(`ck-wrapper-${qId}`);
    if (ckW) ckW.style.display = 'none';
    if (typeof initEssayCanvas === 'function') {
      requestAnimationFrame(() => initEssayCanvas(qId, null));
    }
  }

  if (wrapper) {
    wrapper.querySelectorAll('.essay-tab-btn').forEach(btn => {
      const isActive = btn.dataset.mode === mode;
      btn.className = `essay-tab-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
        isActive ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
      }`;
    });
  }
}

function renderEssayMathTools(ta, qId, insertAfter) {
  const categories = Object.keys(MATH_KB);
  let activeTab    = categories[0];

  const wrap = document.createElement('div');
  wrap.className = 'math-kb-wrap';
  wrap.id = `math-kb-${qId}`;

  const header = document.createElement('div');
  header.className = 'math-kb-header';
  header.innerHTML = `
    <div class="flex items-center gap-2">
      <span style="font-size:16px;">🔣</span>
      <span style="font-size:11px; font-weight:700; color:#1d4ed8;">Keyboard Simbol Matematika</span>
      <span style="font-size:10px; color:#64748b; margin-left:2px;">— klik simbol untuk menyisipkan</span>
    </div>
    <span class="math-kb-chevron" style="font-size:11px; color:#64748b; transition:transform 0.2s;">▲</span>`;

  const body = document.createElement('div');
  body.className = 'math-kb-body';

  const guide = document.createElement('div');
  guide.className = 'math-kb-guide';
  guide.innerHTML =
    '💡 <b>Cara pakai:</b> Klik tombol simbol di bawah untuk menyisipkannya ke jawaban. ' +
    'Tombol berwarna <b style="color:#7c3aed;">ungu</b> adalah template rumus — ' +
    'setelah disisipkan, ganti bagian <b>a</b>, <b>b</b>, <b>x</b>, dsb. dengan angka yang sesuai. ' +
    'Hasil akan tampil di <b>Preview</b> secara otomatis.';

  const tabBar = document.createElement('div');
  tabBar.className = 'math-kb-tabs';
  categories.forEach((cat, i) => {
    const tab = document.createElement('button');
    tab.className  = 'math-kb-tab' + (i === 0 ? ' active' : '');
    tab.textContent = cat;
    tab.setAttribute('data-cat', cat);
    tab.addEventListener('mousedown', (e) => { e.preventDefault(); });
    tab.addEventListener('click', () => {
      activeTab = cat;
      tabBar.querySelectorAll('.math-kb-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      _renderMathKbGrid(grid, cat, ta, qId);
    });
    tabBar.appendChild(tab);
  });

  const grid = document.createElement('div');
  grid.className = 'math-kb-grid';

  const previewOuter = document.createElement('div');
  previewOuter.id = `math-preview-${qId}`;
  previewOuter.className = 'math-preview-box hidden';
  previewOuter.innerHTML = `
    <div style="font-size:10px; font-weight:700; color:#2563eb; margin-bottom:4px; letter-spacing:0.04em;">
      👁 PREVIEW JAWABAN
    </div>
    <div id="math-preview-content-${qId}" style="word-break:break-word; white-space:pre-wrap;"></div>`;

  body.appendChild(guide);
  body.appendChild(tabBar);
  body.appendChild(grid);
  body.appendChild(previewOuter);

  _renderMathKbGrid(grid, activeTab, ta, qId);

  wrap.appendChild(header);
  wrap.appendChild(body);
  insertAfter.parentNode.insertBefore(wrap, insertAfter.nextSibling);

  let _expanded = true;
  header.addEventListener('click', () => {
    _expanded = !_expanded;
    body.style.display     = _expanded ? '' : 'none';
    const chevron = header.querySelector('.math-kb-chevron');
    if (chevron) chevron.style.transform = _expanded ? '' : 'rotate(180deg)';
  });

  ta.addEventListener('input', () => _scheduleMathPreview(ta, qId));

  if (ta.value && ta.value.trim()) {
    _scheduleMathPreview(ta, qId);
  }
}

function _renderMathKbGrid(grid, cat, ta, qId) {
  grid.innerHTML = '';
  const symbols = MATH_KB[cat] || [];
  symbols.forEach(sym => {
    const btn = document.createElement('button');
    btn.type  = 'button';
    btn.className = 'math-sym-btn' + (sym.tpl ? ' tpl' : '');
    btn.textContent = sym.d;
    btn.title = sym.t || sym.d;
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); });
    btn.addEventListener('click', () => {
      isKeyboardSafeMode = true;
      window._essayKeyboardActive = true;
      _insertMathAtCursor(ta, sym.i, qId);
    });
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      isKeyboardSafeMode = true;
      window._essayKeyboardActive = true;
      _insertMathAtCursor(ta, sym.i, qId);
    }, { passive: false });
    grid.appendChild(btn);
  });
}

const _canvasState = {};

function initEssayCanvas(qId, savedDataUrl) {
  const canvas = document.getElementById(`essay-canvas-${qId}`);
  if (!canvas) return;

  const wrapper = canvas.parentElement;
  const dpr     = window.devicePixelRatio || 1;
  const W = wrapper.clientWidth  || 600;
  const H = wrapper.clientHeight || 320;

  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth   = 2;

  _canvasState[qId] = {
    ctx, canvas, dpr,
    tool    : 'pen',
    size    : 2,
    color   : '#1e293b',
    drawing : false,
    lastX   : 0,
    lastY   : 0,
    history : [],       
    histIdx : -1,
    qId
  };

  _canvasFillWhite(qId);

  if (savedDataUrl && savedDataUrl.startsWith('data:image/')) {
    const img = new Image();
    img.onload = () => {
      const st = _canvasState[qId];
      if (!st) return;
      st.ctx.drawImage(img, 0, 0, W, H);
      _canvasPushHistory(qId);
      _updateCanvasHint(qId, true);
    };
    img.src = savedDataUrl;
  } else {
    _canvasPushHistory(qId); 
  }

  _attachCanvasEvents(qId);
}

function _canvasFillWhite(qId) {
  const st = _canvasState[qId];
  if (!st) return;
  const { ctx, canvas, dpr } = st;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
}

function _canvasPushHistory(qId) {
  const st = _canvasState[qId];
  if (!st) return;
  st.history = st.history.slice(0, st.histIdx + 1);
  st.history.push(st.canvas.toDataURL('image/png'));
  if (st.history.length > 30) st.history.shift(); 
  st.histIdx = st.history.length - 1;
}

function _updateCanvasHint(qId, hasContent) {
  const hint = document.getElementById(`essay-canvas-hint-${qId}`);
  const status = document.getElementById(`essay-canvas-status-${qId}`);
  if (hint) hint.style.display = hasContent ? 'none' : '';
  if (status) status.textContent = hasContent ? 'Kanvas memiliki coretan' : 'Belum ada coretan';
}

function _attachCanvasEvents(qId) {
  const st = _canvasState[qId];
  if (!st) return;
  const { canvas } = st;

  canvas.replaceWith(canvas.cloneNode(true));
  const freshCanvas = document.getElementById(`essay-canvas-${qId}`);
  if (!freshCanvas) return;
  st.canvas = freshCanvas;
  const dpr = window.devicePixelRatio || 1;
  const ctx2 = freshCanvas.getContext('2d');
  ctx2.scale(dpr, dpr);
  ctx2.lineCap  = 'round';
  ctx2.lineJoin = 'round';
  st.ctx = ctx2;

  if (st.history.length > 0 && st.histIdx >= 0) {
    const img = new Image();
    img.src = st.history[st.histIdx];
    const W = freshCanvas.width / dpr;
    const H = freshCanvas.height / dpr;
    img.onload = () => ctx2.drawImage(img, 0, 0, W, H);
  }

  freshCanvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    freshCanvas.setPointerCapture(e.pointerId);
    st.drawing = true;
    const { x, y } = _getCanvasPos(freshCanvas, e);
    st.lastX = x; st.lastY = y;
    _canvasDraw(qId, x, y, x, y);
  }, { passive: false });

  freshCanvas.addEventListener('pointermove', (e) => {
    e.preventDefault();
    if (!st.drawing) return;
    const { x, y } = _getCanvasPos(freshCanvas, e);
    _canvasDraw(qId, st.lastX, st.lastY, x, y);
    st.lastX = x; st.lastY = y;
  }, { passive: false });

  const _stopDraw = (e) => {
    if (!st.drawing) return;
    st.drawing = false;
    _canvasPushHistory(qId);
    _updateCanvasHint(qId, true);

    _canvasSave(qId);
  };
  freshCanvas.addEventListener('pointerup',     _stopDraw, { passive: false });
  freshCanvas.addEventListener('pointercancel', _stopDraw, { passive: false });
  freshCanvas.addEventListener('pointerleave',  _stopDraw, { passive: false });
}

function _getCanvasPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function _canvasDraw(qId, x0, y0, x1, y1) {
  const st = _canvasState[qId];
  if (!st) return;
  const { ctx } = st;

  if (st.tool === 'eraser') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = st.size * 4; 
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = st.color;
    ctx.lineWidth   = st.size;
  }

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.closePath();

  if (x0 === x1 && y0 === y1) {
    ctx.beginPath();
    ctx.arc(x0, y0, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = st.tool === 'eraser' ? '#ffffff' : st.color;
    ctx.fill();
    ctx.closePath();
  }
}

function _canvasSave(qId) {
  const st = _canvasState[qId];
  if (!st) return;

  const origCanvas = st.canvas;
  const dpr = st.dpr || window.devicePixelRatio || 1;
  const W   = origCanvas.width  / dpr;  
  const H   = origCanvas.height / dpr;

  const tmpCanvas     = document.createElement('canvas');
  const SCALE         = 0.5;            
  tmpCanvas.width     = Math.round(W * SCALE);
  tmpCanvas.height    = Math.round(H * SCALE);
  const tmpCtx        = tmpCanvas.getContext('2d');
  tmpCtx.fillStyle    = '#ffffff';
  tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
  tmpCtx.drawImage(origCanvas, 0, 0, origCanvas.width, origCanvas.height,
                               0, 0, tmpCanvas.width, tmpCanvas.height);

  const dataUrl = tmpCanvas.toDataURL('image/jpeg', 0.45);

  if (typeof saveAnswer === 'function') saveAnswer(qId, dataUrl);
}

function setCanvasTool(qId, tool, btn) {
  const st = _canvasState[qId];
  if (st) st.tool = tool;
  const wrapper = btn ? btn.closest('.essay-canvas-wrapper') : null;
  if (wrapper) {
    wrapper.querySelectorAll('.canvas-tool-btn').forEach(b => b.classList.remove('active'));
  }
  if (btn) btn.classList.add('active');
}

function setCanvasSize(qId, size, btn) {
  const st = _canvasState[qId];
  if (st) st.size = Number(size);
  const wrapper = btn ? btn.closest('.essay-canvas-wrapper') : null;
  if (wrapper) {
    wrapper.querySelectorAll('.canvas-size-btn').forEach(b => b.classList.remove('active'));
  }
  if (btn) btn.classList.add('active');
}

function setCanvasColor(qId, color, btn) {
  const st = _canvasState[qId];
  if (st) {
    st.color = color;
    st.tool = 'pen';
  }
  const wrapper = btn ? btn.closest('.essay-canvas-wrapper') : null;
  if (wrapper) {
    wrapper.querySelectorAll('.canvas-color-btn').forEach(b => b.classList.remove('selected'));
    wrapper.querySelectorAll('.canvas-tool-btn').forEach(b => b.classList.remove('active'));

    const penBtn = wrapper.querySelector('[data-tool="pen"]');
    if (penBtn) penBtn.classList.add('active');
  }
  if (btn && btn.classList.contains('canvas-color-btn')) btn.classList.add('selected');
}

function canvasUndo(qId) {
  const st = _canvasState[qId];
  if (!st || st.histIdx <= 0) return;
  st.histIdx--;
  const img = new Image();
  img.src = st.history[st.histIdx];
  const dpr = st.dpr || window.devicePixelRatio || 1;
  const W = st.canvas.width / dpr;
  const H = st.canvas.height / dpr;
  img.onload = () => {
    st.ctx.clearRect(0, 0, W, H);
    st.ctx.drawImage(img, 0, 0, W, H);
    _canvasSave(qId);
    const isEmpty = (st.histIdx === 0);
    _updateCanvasHint(qId, !isEmpty);
  };
}

function canvasClear(qId) {
  const st = _canvasState[qId];
  if (!st) return;
  const dpr = st.dpr || window.devicePixelRatio || 1;
  const W = st.canvas.width / dpr;
  const H = st.canvas.height / dpr;
  st.ctx.globalCompositeOperation = 'source-over';
  st.ctx.fillStyle = '#ffffff';
  st.ctx.fillRect(0, 0, W, H);
  _canvasPushHistory(qId);
  _updateCanvasHint(qId, false);
  _canvasSave(qId);
}

function convertCanvasToLatex(qId, btnEl) {
  const st = _canvasState[qId];
  if (!st) return;

  const statusEl = document.getElementById(`essay-canvas-status-${qId}`);
  const isEmpty  = statusEl && statusEl.textContent.includes('Belum ada');
  if (isEmpty) {
    Swal.fire({
      icon: 'info',
      title: 'Kanvas Masih Kosong',
      text: 'Tuliskan rumus atau persamaan di kanvas terlebih dahulu, lalu klik Konversi.',
      confirmButtonColor: '#7c3aed'
    });
    return;
  }

  const origHtml = btnEl ? btnEl.innerHTML : '';
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.innerHTML = '<i class="fas fa-circle-notch fa-spin text-[10px]"></i> <span>Menganalisis...</span>';
  }

  const origCanvas = st.canvas;
  const dpr        = st.dpr || window.devicePixelRatio || 1;
  const W          = origCanvas.width  / dpr;
  const H          = origCanvas.height / dpr;

  const tmpCanvas     = document.createElement('canvas');
  tmpCanvas.width     = Math.round(W);
  tmpCanvas.height    = Math.round(H);
  const tmpCtx        = tmpCanvas.getContext('2d');
  tmpCtx.fillStyle    = '#ffffff';
  tmpCtx.fillRect(0, 0, W, H);
  tmpCtx.drawImage(origCanvas, 0, 0, origCanvas.width, origCanvas.height, 0, 0, W, H);

  const dataUrl   = tmpCanvas.toDataURL('image/jpeg', 0.85);
  const base64    = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

  google.script.run
    .withSuccessHandler(res => {
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = origHtml; }

      if (!res.success) {
        Swal.fire({
          icon: 'warning',
          title: 'Konversi Gagal',
          html: `<p class="text-slate-600 text-sm">${res.message}</p>`,
          confirmButtonColor: '#7c3aed'
        });
        return;
      }

      const latex    = (res.latex || '').trim();
      const textArea = document.getElementById(`essay-text-${qId}`);
      if (!textArea) return;

      const existing = textArea.value.trim();
      textArea.value = existing ? existing + '\n' + latex : latex;

      saveAnswer(qId, textArea.value);

      _scheduleMathPreview(textArea, qId);

      const tabBar = textArea.closest('.essay-wrapper') ?
        textArea.closest('.essay-wrapper').querySelector('.essay-tab-bar') : null;
      const textTabBtn = tabBar ?
        tabBar.querySelector('[data-mode="text"]') : null;
      switchEssayMode(qId, 'text', textTabBtn);

      canvasClear(qId);

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Dikonversi!',
        html: `<p class="text-slate-600 text-sm mb-2">Rumus telah dikonversi ke LaTeX dan dimasukkan ke jawaban.</p>
               <p class="text-xs text-slate-400">Periksa dan koreksi hasilnya jika diperlukan — AI tidak selalu 100% tepat.</p>`,
        confirmButtonColor: '#7c3aed',
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: 'OK, Periksa Hasilnya'
      });
    })
    .withFailureHandler(err => {
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = origHtml; }
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghubungi Server',
        html: `<p class="text-slate-600 text-sm">${err.message || String(err)}</p>`,
        confirmButtonColor: '#7c3aed'
      });
    })
    .convertCanvasToLatex(base64, qId);
}

function autoDetectTextDirection(el) {
  const val = el.value || '';
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (arabicRegex.test(val)) {
    el.setAttribute('dir', 'rtl');
    el.style.textAlign = 'right';
    el.style.fontFamily = "'Traditional Arabic', 'Scheherazade New', 'Arial Unicode MS', 'Arial', sans-serif";
    el.style.fontSize = el.style.fontSize || '1.05em';

    el.classList.add('arabic-input');
    el.classList.remove('ltr-input');
  } else {
    el.setAttribute('dir', 'ltr');
    el.style.textAlign = '';
    el.style.fontFamily = '';
    el.classList.remove('arabic-input');
    el.classList.add('ltr-input');
  }
}

document.addEventListener('input', function(e) {
  const tag = e.target.tagName;
  const type = e.target.type;
  if (tag === 'TEXTAREA' || (tag === 'INPUT' && (type === 'text' || type === 'search' || !type))) {
    autoDetectTextDirection(e.target);
  }
});

document.addEventListener('paste', function(e) {
  setTimeout(function() {
    const active = document.activeElement;
    if (active && (active.tagName === 'TEXTAREA' || (active.tagName === 'INPUT' && active.type !== 'password'))) {
      autoDetectTextDirection(active);
    }
  }, 50);
});
