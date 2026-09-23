/**
 * batch-soal-ui.js
 * BatchSoal.UI — Komponen UI untuk form input batch soal.
 * Sumber: index.html L9646-15170
 */
/* ─── UI Block L9646-L10087 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    var BATCH_EXAMPLES = {
      PG: [
        'Tipe: PG',
        'Bobot: 10',
        'Wajib: TRUE',
        'Ibu kota Indonesia adalah?',
        'A. Bandung',
        'B. Jakarta',
        'C. Surabaya',
        'D. Medan',
        'E. Makassar',
        'Jawaban: B'
      ].join('\n'),
      PG_KOMPLEKS: [
        'Tipe: PG_KOMPLEKS',
        'Bobot: 15',
        'Pilih bilangan prima berikut:',
        'A. 2',
        'B. 4',
        'C. 5',
        'D. 9',
        'E. 11',
        'Jawaban: A, C, E'
      ].join('\n'),
      BS: [
        'Tipe: BS',
        'Tentukan benar atau salah:',
        'Pernyataan:',
        'Air mendidih pada 100°C di permukaan laut. | Benar',
        'Matahari terbit dari barat. | Salah',
        'Bumi berbentuk bulat sempurna. | Salah',
        'Bulan adalah satelit alami Bumi. | Benar'
      ].join('\n'),
      JODOH: [
        'Tipe: JODOH',
        'Pasangkan ibu kota negara dengan negaranya:',
        'Pasangan:',
        'Indonesia = Jakarta',
        'Jepang = Tokyo',
        'Prancis = Paris',
        'Mesir = Kairo',
        'Pengacoh:',
        '= Madrid',
        '= Roma'
      ].join('\n'),
      Esai: [
        'Tipe: Esai',
        'Bobot: 20',
        'Wajib: TRUE',
        'Jelaskan proses fotosintesis pada tumbuhan hijau secara singkat.',
        'Rubrik: Menyebutkan klorofil, cahaya matahari, air, CO2, glukosa.',
        'KataKunci: klorofil, fotosintesis, glukosa, oksigen',
        'MinKarakter: 100'
      ].join('\n'),
      PG_LEGACY: [
        '1. Hasil dari 7 + 5 adalah?',
        'A. 10',
        'B. 11',
        'C. 12',
        'D. 13',
        'Jawaban: C'
      ].join('\n')
    };

    var DESCRIPTIONS = {
      PG: 'Pilihan Ganda dengan satu jawaban benar. Awali blok dengan baris "Tipe: PG", lalu tuliskan pertanyaan, opsi A–E, dan baris "Jawaban: <huruf>".',
      PG_KOMPLEKS: 'Pilihan Ganda Kompleks dengan dua atau lebih jawaban benar. Tulis kunci sebagai daftar huruf yang dipisahkan koma, contoh "Jawaban: A, C, E".',
      BS: 'Soal Benar/Salah berisi 3–20 pernyataan. Awali dengan "Pernyataan:", lalu tiap baris berformat "<pernyataan> | Benar" atau "<pernyataan> | Salah".',
      JODOH: 'Soal Menjodohkan berisi 3–50 pasangan dan 1–3 pengacoh. Pasangan ditulis "Kiri = Kanan"; pengacoh hanya menyertakan sisi kanan setelah "Pengacoh:".',
      Esai: 'Soal Esai dengan rubrik bebas. Parameter opsional: "Rubrik:", "KataKunci:" (dipisah koma), dan "MinKarakter:" (1–5000).',
      PG_LEGACY: 'Format PG lama tanpa baris "Tipe:". Sistem mendeteksi otomatis bila ada nomor soal, opsi A–E, dan satu baris "Jawaban:".'
    };

    function getOptCount() {
      try {
        if (BatchSoal.UI && BatchSoal.UI.currentExamTypeConfig) {
          var cfg = BatchSoal.UI.currentExamTypeConfig;
          if (cfg.PG && typeof cfg.PG.optCount === 'number') return cfg.PG.optCount;
          if (cfg.PG_KOMPLEKS && typeof cfg.PG_KOMPLEKS.optCount === 'number') return cfg.PG_KOMPLEKS.optCount;
          if (typeof cfg.optCount === 'number') return cfg.optCount;
        }
      } catch (e) {   }
      return 5;
    }

    function esc(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function letterFromIndex(n) {
      var idx = Math.max(1, Math.min(26, n));
      return String.fromCharCode(64 + idx);
    }

    function renderRulesForType(type) {
      var rules = (BatchSoal.Rules && BatchSoal.Rules[type === 'PG_LEGACY' ? 'PG' : type]) || null;
      var common = (BatchSoal.Rules && BatchSoal.Rules.common) || null;
      var optCount = getOptCount();
      var maxLetter = letterFromIndex(optCount);
      var items = [];

      if (type === 'PG_LEGACY') {
        items.push('Format lama (tanpa baris <code>Tipe:</code>) — kompatibel mundur:');
      }

      if (rules && rules.content) {
        items.push('Pertanyaan: ' + rules.content.min + '–' + rules.content.max + ' karakter (setelah trim).');
      }

      if (type === 'PG' || type === 'PG_KOMPLEKS' || type === 'PG_LEGACY') {
        if (rules && rules.options) {
          items.push('Opsi: ' + rules.options.min + '–' + optCount + ' (A..' + maxLetter + '), tiap opsi ' +
            rules.options.perOption.min + '–' + rules.options.perOption.max + ' karakter, tanpa duplikat (case-insensitive).');
        }
        if (type === 'PG' || type === 'PG_LEGACY') {
          items.push('Kunci: tepat satu huruf dalam rentang A..' + maxLetter + '.');
        } else {
          items.push('Kunci: 2–' + optCount + ' huruf unik dipisahkan koma tunggal, dalam rentang A..' + maxLetter + '.');
        }
      } else if (type === 'BS') {
        if (rules && rules.statements) {
          items.push('Pernyataan: ' + rules.statements.min + '–' + rules.statements.max +
            ' baris, masing-masing ' + rules.statements.perStatement.min + '–' + rules.statements.perStatement.max +
            ' karakter, tanpa duplikat (case-insensitive).');
        }
        items.push('Setiap pernyataan diakhiri <code>| Benar</code> atau <code>| Salah</code> (case-insensitive).');
      } else if (type === 'JODOH') {
        if (rules && rules.pairs) {
          items.push('Pasangan lengkap: ' + rules.pairs.min + '–' + rules.pairs.max +
            ' baris dengan format <code>Kiri = Kanan</code> (sisi kiri dan kanan tidak boleh duplikat).');
          items.push('Pengacoh: ' + rules.pairs.distractorMin + '–' + rules.pairs.distractorMax +
            ' baris, sisi kiri kosong, hanya sisi kanan diisi.');
        }
      } else if (type === 'Esai') {
        if (rules && rules.minChar) {
          items.push('<code>MinKarakter:</code> opsional, bilangan bulat ' +
            rules.minChar.min + '–' + rules.minChar.max + '.');
        }
        if (rules && rules.keywords) {
          items.push('<code>KataKunci:</code> opsional, ' + rules.keywords.min + '–' +
            rules.keywords.max + ' entri (≤' + rules.keywords.perEntryMax + ' karakter), dipisahkan koma.');
        }
        items.push('<code>Rubrik:</code> opsional, teks bebas untuk pedoman penilaian manual.');
      }

      if (common) {
        items.push('Bobot: angka ' + common.point.min + '–' + common.point.max +
          ' (default ' + common.point['default'] + ').');
        items.push('Wajib: salah satu dari ' + common.isRequired.values.join(', ') +
          ' (default ' + common.isRequired['default'] + ').');
      }

      var html = '<div class="font-semibold mb-1 text-purple-800">Aturan Lengkap</div>' +
        '<ul style="list-style: disc; padding-left: 18px; margin: 0;">';
      for (var i = 0; i < items.length; i++) {
        html += '<li style="margin-bottom: 4px;">' + items[i] + '</li>';
      }
      html += '</ul>';
      return html;
    }

    function populatePanel(panelEl, type, opts) {
      if (!panelEl) return;
      opts = opts || {};
      var showRulesInline = !!opts.showRulesInline;
      var label = (BatchSoal.TYPE_LABELS && BatchSoal.TYPE_LABELS[type]) ||
        (type === 'PG_LEGACY' ? 'PG Lama' : type);
      var description = DESCRIPTIONS[type] || '';
      var example = BATCH_EXAMPLES[type] || '';
      var color = (BatchSoal.TYPE_COLORS && BatchSoal.TYPE_COLORS[type === 'PG_LEGACY' ? 'PG' : type]) ||
        { main: '#2563eb', soft: '#dbeafe' };

      var html =
        '<p class="text-xs text-slate-600 mb-2" data-batch-desc>' + esc(description) + '</p>' +
        '<pre class="batch-format-example" data-batch-example>' + esc(example) + '</pre>' +
        '<div class="flex flex-wrap items-center gap-2 mt-2">' +
          '<button type="button" class="batch-format-action-btn" data-batch-action="insert-template" ' +
            'data-batch-type="' + esc(type) + '" aria-label="Sisipkan template ' + esc(label) + ' ke textarea">' +
            '<i class="fas fa-paste mr-1"></i>Sisipkan Template</button>' +
          '<button type="button" class="batch-format-action-btn" data-batch-action="copy-example" ' +
            'data-batch-type="' + esc(type) + '" aria-label="Salin contoh ' + esc(label) + ' ke clipboard">' +
            '<i class="fas fa-copy mr-1"></i>Salin Contoh</button>' +
          '<span class="batch-format-toast" data-batch-toast aria-live="polite"></span>' +
        '</div>' +
        '<div class="batch-format-rules' + (showRulesInline ? '' : ' hidden') + '" data-batch-rules>' +
          renderRulesForType(type) +
        '</div>';

      panelEl.innerHTML = html;
      panelEl.setAttribute('data-batch-color', color.main);
      panelEl.setAttribute('data-batch-color-soft', color.soft);
    }

    function applyTabColor(tabEl, type) {
      var color = (BatchSoal.TYPE_COLORS && BatchSoal.TYPE_COLORS[type === 'PG_LEGACY' ? 'PG' : type]) ||
        { main: '#2563eb', soft: '#dbeafe' };
      tabEl.style.setProperty('--bsfg-color', color.main);
      tabEl.style.setProperty('--bsfg-soft', color.soft);
    }

    function activateTab(tabs, panels, targetType, opts) {
      opts = opts || {};
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var isActive = t.getAttribute('data-batch-tab') === targetType;
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.setAttribute('tabindex', isActive ? '0' : '-1');
        if (isActive) {
          applyTabColor(t, targetType);
          if (opts.focus) {
            try { t.focus(); } catch (e) {   }
          }
        }
      }
      for (var j = 0; j < panels.length; j++) {
        var p = panels[j];
        var match = p.getAttribute('data-batch-panel') === targetType;
        if (match) {
          p.classList.remove('hidden');
        } else {
          p.classList.add('hidden');
        }
      }
    }

    function flashToast(scope, msg) {
      if (!scope) return;
      var toast = scope.querySelector('[data-batch-toast]');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      window.setTimeout(function () { toast.classList.remove('show'); }, 1500);
    }

    function handleInsertTemplate(type, scope) {
      var ta = document.getElementById('batch-input-text');
      if (!ta) return;
      var text = BATCH_EXAMPLES[type] || '';
      var existing = ta.value || '';
      var separator = '';
      if (existing.length > 0) {
        var tail = existing.slice(-2);
        if (tail !== '\n\n') {
          separator = (existing.charAt(existing.length - 1) === '\n') ? '\n' : '\n\n';
        }
      }
      var insertion = separator + text + '\n';
      var inserted = false;
      try {
        if (typeof ta.setRangeText === 'function') {
          var start = (typeof ta.selectionStart === 'number') ? ta.selectionStart : ta.value.length;
          var end = (typeof ta.selectionEnd === 'number') ? ta.selectionEnd : ta.value.length;
          ta.setRangeText(insertion, start, end, 'end');
          inserted = true;
        }
      } catch (e) {   }
      if (!inserted) {
        ta.value = existing + insertion;
      }
      try { ta.focus(); } catch (e) {   }
      try {
        var ev = new Event('input', { bubbles: true });
        ta.dispatchEvent(ev);
      } catch (e) {
        if (typeof ta.oninput === 'function') {
          try { ta.oninput(); } catch (er) {   }
        }
      }
      flashToast(scope, 'Disisipkan!');
    }

    function handleCopyExample(type, scope) {
      var text = BATCH_EXAMPLES[type] || '';
      var done = function () { flashToast(scope, 'Tersalin!'); };
      var fail = function () { flashToast(scope, 'Gagal menyalin'); };
      try {
        if (root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') {
          root.navigator.clipboard.writeText(text).then(done, function () {
            execCommandCopy(text) ? done() : fail();
          });
          return;
        }
      } catch (e) {   }
      execCommandCopy(text) ? done() : fail();
    }

    function execCommandCopy(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        return ok;
      } catch (e) {
        return false;
      }
    }

    function toggleRulesOnActivePanel() {
      var panelsRoot = document.getElementById('batch-format-panels');
      var btn = document.getElementById('batch-rules-toggle');
      if (!panelsRoot || !btn) return;
      var activePanel = null;
      var panels = panelsRoot.querySelectorAll('[data-batch-panel]');
      for (var i = 0; i < panels.length; i++) {
        if (!panels[i].classList.contains('hidden')) { activePanel = panels[i]; break; }
      }
      if (!activePanel) return;
      var rulesEl = activePanel.querySelector('[data-batch-rules]');
      if (!rulesEl) return;
      var willShow = rulesEl.classList.contains('hidden');
      for (var j = 0; j < panels.length; j++) {
        var r = panels[j].querySelector('[data-batch-rules]');
        if (!r) continue;
        if (willShow) r.classList.remove('hidden'); else r.classList.add('hidden');
      }
      btn.textContent = willShow ? 'Sembunyikan Aturan Lengkap' : 'Tampilkan Aturan Lengkap';
      btn.setAttribute('aria-expanded', willShow ? 'true' : 'false');
    }

    function findActionScope(triggerEl) {
      var node = triggerEl;
      while (node && node !== document) {
        if (node.matches && (node.matches('[data-batch-panel]') ||
          node.matches('.batch-format-mobile-body'))) {
          return node;
        }
        node = node.parentNode;
      }
      return triggerEl.parentNode;
    }

    function init() {
      var guide = document.getElementById('batch-format-guide');
      var mobileWrap = document.getElementById('batch-format-mobile');
      if (!guide && !mobileWrap) return;

      var tabs = guide ? guide.querySelectorAll('.batch-format-tab') : [];
      var panels = guide ? guide.querySelectorAll('[data-batch-panel]') : [];
      for (var i = 0; i < panels.length; i++) {
        populatePanel(panels[i], panels[i].getAttribute('data-batch-panel'), { showRulesInline: false });
      }

      if (mobileWrap) {
        var mItems = mobileWrap.querySelectorAll('[data-batch-mobile]');
        for (var k = 0; k < mItems.length; k++) {
          var body = mItems[k].querySelector('.batch-format-mobile-body');
          populatePanel(body, mItems[k].getAttribute('data-batch-mobile'), { showRulesInline: true });
        }
      }

      if (tabs.length) {
        var tabsArr = Array.prototype.slice.call(tabs);
        var firstActive = null;
        for (var t = 0; t < tabsArr.length; t++) {
          if (tabsArr[t].getAttribute('aria-selected') === 'true') { firstActive = tabsArr[t]; break; }
        }
        if (firstActive) {
          applyTabColor(firstActive, firstActive.getAttribute('data-batch-tab'));
        }

        tabsArr.forEach(function (tab) {
          tab.addEventListener('click', function () {
            activateTab(tabsArr, panels, tab.getAttribute('data-batch-tab'));
          });
          tab.addEventListener('keydown', function (ev) {
            var key = ev.key;
            if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;
            ev.preventDefault();
            var currentIdx = tabsArr.indexOf(tab);
            var nextIdx = currentIdx;
            if (key === 'ArrowLeft') nextIdx = (currentIdx - 1 + tabsArr.length) % tabsArr.length;
            else if (key === 'ArrowRight') nextIdx = (currentIdx + 1) % tabsArr.length;
            else if (key === 'Home') nextIdx = 0;
            else if (key === 'End') nextIdx = tabsArr.length - 1;
            var nextType = tabsArr[nextIdx].getAttribute('data-batch-tab');
            activateTab(tabsArr, panels, nextType, { focus: true });
          });
        });
      }

      function delegateActions(rootEl) {
        if (!rootEl) return;
        rootEl.addEventListener('click', function (ev) {
          var target = ev.target;
          while (target && target !== rootEl && !(target.matches && target.matches('[data-batch-action]'))) {
            target = target.parentNode;
          }
          if (!target || target === rootEl) return;
          var action = target.getAttribute('data-batch-action');
          var type = target.getAttribute('data-batch-type');
          if (!type) return;
          var scope = findActionScope(target);
          if (action === 'insert-template') handleInsertTemplate(type, scope);
          else if (action === 'copy-example') handleCopyExample(type, scope);
        });
      }
      delegateActions(guide);
      delegateActions(mobileWrap);

      var rulesBtn = document.getElementById('batch-rules-toggle');
      if (rulesBtn) {
        rulesBtn.setAttribute('aria-expanded', 'false');
        rulesBtn.addEventListener('click', toggleRulesOnActivePanel);
      }
    }

    BatchSoal.UI.FormatGuide = {
      init: init,
      EXAMPLES: BATCH_EXAMPLES,
      DESCRIPTIONS: DESCRIPTIONS,
      renderRulesForType: renderRulesForType,
      populatePanel: populatePanel
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      window.setTimeout(init, 0);
    }

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L10089-L10551 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    var LIMITS = (BatchSoal && BatchSoal.LIMITS) || { MAX_TEXT: 200000, MAX_BLOCKS: 500 };
    var MAX_TEXT = LIMITS.MAX_TEXT;
    var MAX_BLOCKS = LIMITS.MAX_BLOCKS;
    var WARN_THRESHOLD = 0.70;
    var DANGER_THRESHOLD = 0.90;
    var DEBOUNCE_MS = 500;

    var INSERT_ORDER = ['PG', 'PG_KOMPLEKS', 'BS', 'JODOH', 'Esai', 'PG_LEGACY'];
    var INSERT_LABELS = {
      PG: 'PG',
      PG_KOMPLEKS: 'PG Kompleks',
      BS: 'Benar/Salah',
      JODOH: 'Menjodohkan',
      Esai: 'Esai',
      PG_LEGACY: 'PG Lama'
    };
    var MAX_GUTTER_LINES = 5000;

    function el(id) { return document.getElementById(id); }
    function escHtml(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    function formatID(n) {
      try { return Number(n).toLocaleString('id-ID'); }
      catch (e) { return String(n); }
    }
    function dispatchInput(ta) {
      try {
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) {
        if (typeof ta.oninput === 'function') {
          try { ta.oninput(); } catch (er) {   }
        }
      }
    }
    function flashToast(msg) {
      var t = el('batch-input-toast');
      if (!t) return;
      t.textContent = msg;
      t.classList.add('show');
      window.setTimeout(function () { t.classList.remove('show'); }, 1500);
    }

    function insertAtCaret(ta, text) {
      if (!ta || !text) return;
      var existing = ta.value || '';
      var inserted = false;
      try {
        if (typeof ta.setRangeText === 'function') {
          var start = (typeof ta.selectionStart === 'number') ? ta.selectionStart : existing.length;
          var end = (typeof ta.selectionEnd === 'number') ? ta.selectionEnd : existing.length;
          ta.setRangeText(text, start, end, 'end');
          inserted = true;
        }
      } catch (e) {   }
      if (!inserted) {
        ta.value = existing + text;
      }
      try { ta.focus(); } catch (e) {   }
      dispatchInput(ta);
    }

    function insertTemplate(type) {
      var ta = el('batch-input-text');
      if (!ta) return;
      var FG = BatchSoal.UI && BatchSoal.UI.FormatGuide;
      var examples = (FG && FG.EXAMPLES) || {};
      var text = examples[type] || '';
      if (!text) return;
      var existing = ta.value || '';
      var separator = '';
      if (existing.length > 0) {
        var tail = existing.slice(-2);
        if (tail !== '\n\n') {
          separator = (existing.charAt(existing.length - 1) === '\n') ? '\n' : '\n\n';
        }
      }
      insertAtCaret(ta, separator + text + '\n');
      flashToast('Disisipkan!');
    }

    function buildInsertMenu() {
      var menu = el('batch-toolbar-insert-menu');
      if (!menu) return;
      var COLORS = BatchSoal.TYPE_COLORS || {};
      var html = '';
      for (var i = 0; i < INSERT_ORDER.length; i++) {
        var t = INSERT_ORDER[i];
        var label = INSERT_LABELS[t] || t;
        var c = COLORS[t === 'PG_LEGACY' ? 'PG' : t] || { main: '#94a3b8' };
        html += '<li role="none">' +
          '<button type="button" role="menuitem" data-bsm-type="' + escHtml(t) + '">' +
          '<span class="bsm-dot" style="background:' + escHtml(c.main) + '"></span>' +
          '<span>' + escHtml(label) + '</span>' +
          '</button></li>';
      }
      menu.innerHTML = html;
    }
    function toggleInsertMenu(forceState) {
      var btn = el('batch-toolbar-insert');
      var menu = el('batch-toolbar-insert-menu');
      if (!btn || !menu) return;
      var willOpen = (typeof forceState === 'boolean')
        ? forceState
        : menu.classList.contains('hidden');
      if (willOpen) {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
      }
    }

    function handlePaste() {
      var ta = el('batch-input-text');
      if (!ta) return;
      var ok = function (txt) {
        if (typeof txt !== 'string' || !txt) {
          flashToast('Clipboard kosong');
          return;
        }
        var existing = ta.value || '';
        var sep = '';
        if (existing.length > 0) {
          var tail = existing.slice(-2);
          if (tail !== '\n\n') {
            sep = (existing.charAt(existing.length - 1) === '\n') ? '\n' : '\n\n';
          }
        }
        insertAtCaret(ta, sep + txt);
        flashToast('Tertempel!');
      };
      var fail = function () { flashToast('Tidak bisa membaca clipboard'); };
      try {
        if (root.navigator && root.navigator.clipboard
            && typeof root.navigator.clipboard.readText === 'function') {
          root.navigator.clipboard.readText().then(ok, fail);
          return;
        }
      } catch (e) {   }
      fail();
    }

    function handleFormat() {
      var ta = el('batch-input-text');
      if (!ta) return;
      var raw = ta.value || '';
      var normalized = raw.replace(/\r\n?/g, '\n');
      var lines = normalized.split('\n');
      for (var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(/[ \t]+$/g, '');
      }
      var rejoined = lines.join('\n');
      var collapsed = rejoined.replace(/\n{3,}/g, '\n\n');
      collapsed = collapsed.replace(/\n+$/, '\n');
      if (collapsed === raw) {
        flashToast('Sudah rapi');
        return;
      }
      ta.value = collapsed;
      try { ta.focus(); } catch (e) {   }
      dispatchInput(ta);
      flashToast('Diformat ulang');
    }

    var clearArmed = false;
    var clearArmTimer = null;
    var clearOriginalLabel = null;
    function disarmClear() {
      var btn = el('batch-toolbar-clear');
      clearArmed = false;
      if (clearArmTimer) { window.clearTimeout(clearArmTimer); clearArmTimer = null; }
      if (btn && clearOriginalLabel != null) {
        btn.innerHTML = clearOriginalLabel;
      }
    }
    function handleClear() {
      var ta = el('batch-input-text');
      var btn = el('batch-toolbar-clear');
      if (!ta || !btn) return;
      if (!ta.value) {
        flashToast('Sudah kosong');
        return;
      }
      if (!clearArmed) {
        clearArmed = true;
        clearOriginalLabel = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-triangle-exclamation"></i>' +
          ' <span class="hidden md:inline">Yakin? Klik lagi</span>' +
          '<span class="md:hidden">Yakin?</span>';
        clearArmTimer = window.setTimeout(disarmClear, 3000);
        return;
      }
      ta.value = '';
      disarmClear();
      try { ta.focus(); } catch (e) {   }
      dispatchInput(ta);
      flashToast('Terhapus');
    }

    function updateCounters(text) {
      var charEl = el('batch-char-counter');
      var blockEl = el('batch-block-counter');
      if (!charEl || !blockEl) return;
      var len = text.length;
      var blocks = 0;
      try {
        if (BatchSoal.Parser && typeof BatchSoal.Parser.splitBlocks === 'function') {
          blocks = BatchSoal.Parser.splitBlocks(text).length;
        }
      } catch (e) { blocks = 0; }
      charEl.textContent = formatID(len) + ' / ' + formatID(MAX_TEXT) + ' karakter';
      blockEl.textContent = formatID(blocks) + ' / ' + formatID(MAX_BLOCKS) + ' blok';

      applyThreshold(charEl, len / MAX_TEXT);
      applyThreshold(blockEl, blocks / MAX_BLOCKS);
    }
    function applyThreshold(node, ratio) {
      node.classList.remove('batch-counter-warning', 'batch-counter-danger');
      if (ratio >= DANGER_THRESHOLD) {
        node.classList.add('batch-counter-danger');
      } else if (ratio >= WARN_THRESHOLD) {
        node.classList.add('batch-counter-warning');
      }
    }

    function buildGutter(text) {
      var gutter = el('batch-gutter');
      if (!gutter) return;
      var COLORS = BatchSoal.TYPE_COLORS || {};
      var lines = text.length === 0 ? [''] : text.split(/\r?\n/);
      var totalLines = lines.length;
      var renderLines = Math.min(totalLines, MAX_GUTTER_LINES);

      var badgeAtLine = {};
      var i = 0;
      while (i < renderLines) {
        while (i < renderLines && /^\s*$/.test(lines[i])) i++;
        if (i >= renderLines) break;
        var startIdx = i;
        var blockLines = [];
        while (i < renderLines && !/^\s*$/.test(lines[i])) {
          blockLines.push(lines[i]);
          i++;
        }
        badgeAtLine[startIdx] = computeBadge(blockLines, COLORS);
      }

      var html = '';
      for (var n = 0; n < renderLines; n++) {
        var num = (n + 1);
        var badge = badgeAtLine[n] || '';
        html += '<span class="gutter-line">' + badge + num + '</span>';
      }
      if (totalLines > MAX_GUTTER_LINES) {
        html += '<span class="gutter-line">…</span>';
      }
      // Bungkus baris-baris dalam wrapper agar yang digeser (translateY) saat
      // scroll hanyalah kontennya, sementara latar/border gutter tetap diam.
      gutter.innerHTML = '<span class="gutter-scroll">' + html + '</span>';
      var ta = el('batch-input-text');
      if (ta) syncGutterScroll(ta, gutter);
    }

    // Sinkronkan posisi nomor baris dengan scroll textarea.
    // Memakai transform pada wrapper konten (bukan scrollTop) agar tetap bekerja
    // walau elemen gutter tidak bisa di-scroll internal (mis. karena layout grid
    // yang membuat tinggi gutter mengikuti kontennya, sehingga scrollTop selalu 0).
    function syncGutterScroll(ta, gutter) {
      if (!ta) ta = el('batch-input-text');
      if (!gutter) gutter = el('batch-gutter');
      if (!ta || !gutter) return;
      // Kunci tinggi gutter agar sama dengan area terlihat textarea sehingga
      // gutter ter-clip (overflow:hidden) dan tidak meregangkan baris grid.
      // clientHeight juga mengikuti perubahan tinggi saat textarea di-resize.
      var visible = ta.clientHeight || 0;
      if (visible > 0) gutter.style.height = visible + 'px';
      var inner = gutter.firstChild;
      if (!inner || inner.className !== 'gutter-scroll') return;
      var offset = ta.scrollTop || 0;
      inner.style.transform = 'translateY(' + (-offset) + 'px)';
    }

    function computeBadge(blockLines, COLORS) {
      var type = null;
      var legacy = false;
      try {
        if (BatchSoal.Parser && typeof BatchSoal.Parser.detectType === 'function') {
          var det = BatchSoal.Parser.detectType(blockLines);
          if (det && det.type) {
            type = det.type;
            legacy = !!det.legacyMode;
          }
        }
      } catch (e) { type = null; }
      if (type) {
        var colorKey = type;
        var c = COLORS[colorKey] || { main: '#475569', soft: '#e2e8f0' };
        var label = legacy ? 'PG*' : badgeLabelForType(type);
        return '<span class="gutter-badge" style="background:' + escHtml(c.soft) +
          ';color:' + escHtml(c.main) + '" title="' + escHtml(legacy ? 'PG (legacy)' : type) + '">' +
          escHtml(label) + '</span>';
      }
      return '<span class="gutter-badge" style="background:#f1f5f9;color:#64748b" title="Tipe tidak dikenali">?</span>';
    }
    function badgeLabelForType(t) {
      if (t === 'PG_KOMPLEKS') return 'PGK';
      if (t === 'JODOH') return 'JD';
      if (t === 'Esai') return 'ES';
      return t;
    }

    function recompute() {
      var ta = el('batch-input-text');
      if (!ta) return;
      var text = ta.value || '';
      updateCounters(text);
      buildGutter(text);
    }

    var debounceTimer = null;
    function debouncedSchedule() {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(function () {
        debounceTimer = null;
        try {
          if (BatchSoal.UI && typeof BatchSoal.UI.scheduleParse === 'function') {
            BatchSoal.UI.scheduleParse();
          }
        } catch (e) {   }
      }, DEBOUNCE_MS);
    }
    function scheduleNow() {
      if (debounceTimer) window.clearTimeout(debounceTimer);
      debounceTimer = null;
      try {
        if (BatchSoal.UI && typeof BatchSoal.UI.scheduleParse === 'function') {
          BatchSoal.UI.scheduleParse();
        }
      } catch (e) {   }
    }

    function applyViewportClamp() {
      var ta = el('batch-input-text');
      if (!ta || !root.visualViewport) return;
      var vh = root.visualViewport.height;
      if (vh && vh < 720) {
        var clamp = Math.max(180, Math.floor(vh - 280));
        ta.style.maxHeight = clamp + 'px';
      } else {
        ta.style.maxHeight = '';
      }
    }

    var initialized = false;
    function init() {
      if (initialized) return;
      var ta = el('batch-input-text');
      var gutter = el('batch-gutter');
      if (!ta || !gutter) return;
      initialized = true;

      buildInsertMenu();

      var insertBtn = el('batch-toolbar-insert');
      var insertMenu = el('batch-toolbar-insert-menu');
      if (insertBtn && insertMenu) {
        insertBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          toggleInsertMenu();
        });
        insertMenu.addEventListener('click', function (ev) {
          var node = ev.target;
          while (node && node !== insertMenu && !(node.matches && node.matches('[data-bsm-type]'))) {
            node = node.parentNode;
          }
          if (!node || node === insertMenu) return;
          var type = node.getAttribute('data-bsm-type');
          toggleInsertMenu(false);
          if (type) insertTemplate(type);
        });
        document.addEventListener('click', function (ev) {
          if (insertMenu.classList.contains('hidden')) return;
          var wrap = el('batch-toolbar-insert-wrap');
          if (wrap && wrap.contains(ev.target)) return;
          toggleInsertMenu(false);
        });
        document.addEventListener('keydown', function (ev) {
          if (ev.key === 'Escape' && !insertMenu.classList.contains('hidden')) {
            toggleInsertMenu(false);
            try { insertBtn.focus(); } catch (e) {   }
          }
        });
      }

      var pasteBtn = el('batch-toolbar-paste');
      if (pasteBtn) pasteBtn.addEventListener('click', handlePaste);
      var formatBtn = el('batch-toolbar-format');
      if (formatBtn) formatBtn.addEventListener('click', handleFormat);
      var clearBtn = el('batch-toolbar-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', handleClear);
        clearBtn.addEventListener('blur', function () {
        });
      }

      ta.addEventListener('input', function () {
        recompute();
        debouncedSchedule();
      });
      ta.addEventListener('scroll', function () {
        syncGutterScroll(ta, gutter);
      });

      // Saat textarea di-resize manual (resize: vertical) tinggi area terlihat
      // berubah; samakan tinggi gutter agar clipping & sinkron scroll tetap pas.
      try {
        if (typeof ResizeObserver === 'function') {
          var ro = new ResizeObserver(function () { syncGutterScroll(ta, gutter); });
          ro.observe(ta);
        }
      } catch (e) {   }

      if (root.visualViewport && typeof root.visualViewport.addEventListener === 'function') {
        try {
          root.visualViewport.addEventListener('resize', applyViewportClamp);
        } catch (e) {   }
        applyViewportClamp();
      }

      recompute();
    }

    BatchSoal.UI.SmartTextarea = {
      init: init,
      recompute: recompute,
      getTextarea: function () { return el('batch-input-text'); },
      scheduleNow: scheduleNow,
      _resetInit: function () { initialized = false; }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      window.setTimeout(init, 0);
    }

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L10553-L11108 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    var TYPE_ORDER = ['PG', 'PG_KOMPLEKS', 'BS', 'JODOH', 'Esai'];

    var STATUS_LABELS = {
      idle:    { text: 'Menunggu input', icon: 'fa-circle text-[6px]' },
      parsing: { text: 'Memproses...',   icon: 'fa-circle-notch' },
      valid:   { text: 'Semua valid',    icon: 'fa-check-circle' },
      partial: { text: 'Sebagian valid', icon: 'fa-triangle-exclamation' },
      error:   { text: 'Ada masalah',    icon: 'fa-circle-xmark' }
    };

    var currentState = {
      status: 'idle',
      valid: [],
      invalid: [],
      globalErrors: [],
      typeConfig: null,
      existingCounts: null
    };

    var initialized = false;

    function el(id) { return document.getElementById(id); }

    function escHtml(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function prefersReducedMotion() {
      try {
        return root.matchMedia &&
               root.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (e) { return false; }
    }

    function typeColor(type) {
      var COLORS = (BatchSoal && BatchSoal.TYPE_COLORS) || {};
      return COLORS[type] || { main: '#64748b', soft: '#f1f5f9' };
    }

    function typeLabel(type) {
      var LABELS = (BatchSoal && BatchSoal.TYPE_LABELS) || {};
      return LABELS[type] || (type || '?');
    }

    function setStatus(status) {
      currentState.status = status;
      renderStatusPill(status);
    }

    function renderStatusPill(status) {
      var node = el('batch-summary-status');
      if (!node) return;
      var key = STATUS_LABELS[status] ? status : 'idle';
      var info = STATUS_LABELS[key];
      node.className = 'batch-summary-pill batch-summary-pill-' + key;
      node.innerHTML = '<i class="fas ' + info.icon + '"></i> ' + escHtml(info.text);
    }

    var counterAnimHandles = {};

    function setCounter(key, target) {
      var spans = document.querySelectorAll('[data-counter="' + key + '"]');
      if (!spans || spans.length === 0) return;

      var current = parseInt(spans[0].textContent, 10);
      if (!isFinite(current)) current = 0;
      var goal = parseInt(target, 10);
      if (!isFinite(goal) || goal < 0) goal = 0;

      if (counterAnimHandles[key] != null) {
        try { cancelAnimationFrame(counterAnimHandles[key]); } catch (e) {}
        counterAnimHandles[key] = null;
      }

      if (current === goal) {
        for (var i = 0; i < spans.length; i++) spans[i].textContent = String(goal);
        return;
      }

      if (prefersReducedMotion()) {
        for (var j = 0; j < spans.length; j++) spans[j].textContent = String(goal);
        return;
      }

      var startTs = null;
      var duration = 200;
      var diff = goal - current;

      function step(ts) {
        if (startTs == null) startTs = ts;
        var t = (ts - startTs) / duration;
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        var eased = 1 - Math.pow(1 - t, 3);
        var val = Math.round(current + diff * eased);
        for (var k = 0; k < spans.length; k++) spans[k].textContent = String(val);
        if (t < 1) {
          counterAnimHandles[key] = requestAnimationFrame(step);
        } else {
          counterAnimHandles[key] = null;
        }
      }
      counterAnimHandles[key] = requestAnimationFrame(step);
    }

    function renderDonut(validList) {
      var wrap = el('batch-summary-donut-wrap');
      var svg = el('batch-summary-donut');
      var legend = el('batch-summary-legend');
      if (!wrap || !svg || !legend) return;

      if (!validList || validList.length === 0) {
        wrap.classList.add('hidden');
        clearDonutSegments(svg);
        legend.innerHTML = '';
        return;
      }

      var counts = {};
      for (var i = 0; i < validList.length; i++) {
        var t = validList[i] && validList[i].type;
        if (!t) continue;
        counts[t] = (counts[t] || 0) + 1;
      }

      var total = 0;
      var ordered = [];
      for (var k = 0; k < TYPE_ORDER.length; k++) {
        var ty = TYPE_ORDER[k];
        var c = counts[ty] || 0;
        if (c > 0) {
          ordered.push({ type: ty, count: c });
          total += c;
        }
      }
      if (total === 0) {
        wrap.classList.add('hidden');
        clearDonutSegments(svg);
        legend.innerHTML = '';
        return;
      }

      wrap.classList.remove('hidden');
      clearDonutSegments(svg);

      var SVG_NS = 'http://www.w3.org/2000/svg';
      var accumulated = 0;
      for (var s = 0; s < ordered.length; s++) {
        var seg = ordered[s];
        var pct = (seg.count / total) * 100;
        var col = typeColor(seg.type).main;
        var circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', '18');
        circle.setAttribute('cy', '18');
        circle.setAttribute('r', '15.9155');
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', col);
        circle.setAttribute('stroke-width', '3');
        var gap = ordered.length > 1 ? 0.4 : 0;
        var len = Math.max(0.0001, pct - gap);
        circle.setAttribute('stroke-dasharray', len.toFixed(4) + ' ' + (100 - len).toFixed(4));
        circle.setAttribute('stroke-dashoffset', String(-accumulated));
        circle.setAttribute('transform', 'rotate(-90 18 18)');
        svg.appendChild(circle);
        accumulated += pct;
      }

      var html = '';
      for (var l = 0; l < ordered.length; l++) {
        var it = ordered[l];
        var color = typeColor(it.type).main;
        html += '<li>'
              +   '<span class="bsl-swatch" style="background:' + color + '"></span>'
              +   '<span class="bsl-name">' + escHtml(typeLabel(it.type)) + '</span>'
              +   '<span class="bsl-count">' + it.count + '</span>'
              + '</li>';
      }
      legend.innerHTML = html;
    }

    function clearDonutSegments(svg) {
      var children = svg.childNodes;
      var keep = null;
      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType === 1 && children[i].tagName.toLowerCase() === 'circle') {
          keep = children[i];
          break;
        }
      }
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (keep) svg.appendChild(keep);
      else {
        var SVG_NS = 'http://www.w3.org/2000/svg';
        var bg = document.createElementNS(SVG_NS, 'circle');
        bg.setAttribute('cx', '18');
        bg.setAttribute('cy', '18');
        bg.setAttribute('r', '15.9155');
        bg.setAttribute('fill', 'none');
        bg.setAttribute('stroke', '#e5e7eb');
        bg.setAttribute('stroke-width', '3');
        svg.appendChild(bg);
      }
    }

    function typeBadgeHtml(type) {
      if (!type) {
        return '<span class="batch-summary-type-badge batch-summary-type-badge-unknown">?</span>';
      }
      var c = typeColor(type);
      return '<span class="batch-summary-type-badge" '
           +   'style="background:' + c.soft + ';color:' + c.main + ';border-color:' + c.main + '">'
           +   escHtml(typeLabel(type))
           + '</span>';
    }

    function renderInvalidList(invalidArr) {
      var ul = el('batch-summary-invalid-list');
      if (!ul) return;
      var arr = Array.isArray(invalidArr) ? invalidArr : [];
      if (arr.length === 0) {
        ul.innerHTML = '<li class="empty">Tidak ada Soal_Invalid.</li>';
        return;
      }
      var html = '';
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i] || {};
        var blockNum = item.blockNumber != null ? item.blockNumber : '?';
        var snippet = typeof item.snippet === 'string' ? item.snippet : '';
        var errs = (item.errors && typeof item.errors.length === 'number') ? item.errors : [];

        var stripPrefix = new RegExp('^\\s*Blok\\s+' + blockNum + '\\s*:\\s*');
        var errHtml = '';
        for (var e = 0; e < errs.length; e++) {
          var msg = String(errs[e] || '').replace(stripPrefix, '');
          errHtml += '<li>' + escHtml(msg) + '</li>';
        }

        html += '<li>'
             +   '<div class="batch-summary-row-head">'
             +     '<div class="batch-summary-row-head-left">'
             +       typeBadgeHtml(item.detectedType || null)
             +       '<span class="batch-summary-block-num">Blok ' + escHtml(String(blockNum)) + '</span>'
             +     '</div>'
             +     '<button type="button" class="batch-summary-jump-btn" '
             +       'data-jump-to-block="' + escHtml(String(blockNum)) + '" '
             +       'aria-label="Lompat ke Blok ' + escHtml(String(blockNum)) + '">'
             +       '<i class="fas fa-arrow-right-to-bracket"></i> Lompat'
             +     '</button>'
             +   '</div>'
             +   (snippet ? '<div class="batch-summary-snippet">' + escHtml(snippet) + '</div>' : '')
             +   (errHtml ? '<ul class="batch-summary-errors">' + errHtml + '</ul>' : '')
             + '</li>';
      }
      ul.innerHTML = html;
    }

    function renderValidList(validArr) {
      var ul = el('batch-summary-valid-list');
      if (!ul) return;
      var arr = Array.isArray(validArr) ? validArr : [];
      if (arr.length === 0) {
        ul.innerHTML = '<li class="empty">Belum ada Soal_Valid.</li>';
        return;
      }
      var html = '';
      for (var i = 0; i < arr.length; i++) {
        var vq = arr[i] || {};
        var blockNum = vq.blockNumber != null ? vq.blockNumber : '?';
        var content = typeof vq.content === 'string' ? vq.content : '';
        var snippet = content.length > 60 ? content.slice(0, 60) + '…' : content;

        var meta = '';
        var pt = (typeof vq.point === 'number' && isFinite(vq.point)) ? vq.point : 10;
        meta += '<span class="batch-summary-meta-tag">' + escHtml(formatPoint(pt)) + ' poin</span>';
        if (vq.isRequired === 'TRUE') {
          meta += '<span class="batch-summary-meta-tag req">Wajib</span>';
        }
        if (vq.legacyMode) {
          meta += '<span class="batch-summary-meta-tag">PG Lama</span>';
        }

        var sub = formatTypeSummary(vq.type, vq.summary);

        html += '<li>'
             +   '<div class="batch-summary-row-head">'
             +     '<div class="batch-summary-row-head-left">'
             +       typeBadgeHtml(vq.type || null)
             +       '<span class="batch-summary-block-num">Blok ' + escHtml(String(blockNum)) + '</span>'
             +       meta
             +     '</div>'
             +     '<button type="button" class="batch-summary-jump-btn" '
             +       'data-jump-to-block="' + escHtml(String(blockNum)) + '" '
             +       'aria-label="Lompat ke Blok ' + escHtml(String(blockNum)) + '">'
             +       '<i class="fas fa-arrow-right-to-bracket"></i> Lompat'
             +     '</button>'
             +   '</div>'
             +   (snippet ? '<div class="batch-summary-snippet">' + escHtml(snippet) + '</div>' : '')
             +   (sub ? '<div class="batch-summary-snippet" style="color:#64748b">' + sub + '</div>' : '')
             + '</li>';
      }
      ul.innerHTML = html;
    }

    function formatPoint(n) {
      if (n === Math.floor(n)) return String(n);
      return String(n).replace('.', ',');
    }

    function formatTypeSummary(type, summary) {
      if (!summary || typeof summary !== 'object') return '';
      switch (type) {
        case 'PG':
          return summary.optionCount
            ? escHtml(summary.optionCount + ' opsi')
            : '';
        case 'PG_KOMPLEKS':
          return escHtml((summary.optionCount || 0) + ' opsi · ' +
                         (summary.keyCount || 0) + ' kunci');
        case 'BS':
          return escHtml((summary.statementCount || 0) + ' pernyataan');
        case 'JODOH':
          return escHtml((summary.pairCount || 0) + ' pasangan · ' +
                         (summary.distractorCount || 0) + ' pengacoh');
        case 'Esai': {
          var parts = [];
          parts.push((summary.keywordCount || 0) + ' kata kunci');
          if (summary.minCharEnabled) parts.push('Min karakter aktif');
          return escHtml(parts.join(' · '));
        }
        default:
          return '';
      }
    }

    function renderConfig(typeConfig, existingCounts, validArr) {
      var body = el('batch-summary-config-body');
      if (!body) return;

      if (!typeConfig || typeof typeConfig !== 'object') {
        body.innerHTML = 'Belum ada ujian dipilih.';
        return;
      }

      var optCount = null;
      if (typeConfig.PG && typeof typeConfig.PG.optCount === 'number') {
        optCount = typeConfig.PG.optCount;
      } else if (typeConfig.PG_KOMPLEKS && typeof typeConfig.PG_KOMPLEKS.optCount === 'number') {
        optCount = typeConfig.PG_KOMPLEKS.optCount;
      }

      var disabled = [];
      for (var i = 0; i < TYPE_ORDER.length; i++) {
        var t = TYPE_ORDER[i];
        var cfg = typeConfig[t];
        if (cfg && cfg.enabled === false) disabled.push(t);
      }

      var inBatch = {};
      if (Array.isArray(validArr)) {
        for (var v = 0; v < validArr.length; v++) {
          var vt = validArr[v] && validArr[v].type;
          if (!vt) continue;
          inBatch[vt] = (inBatch[vt] || 0) + 1;
        }
      }

      var existing = (existingCounts && typeof existingCounts === 'object') ? existingCounts : {};

      var rows = [];

      if (optCount != null) {
        rows.push('<div class="batch-cfg-row">'
                + '<span>Opsi PG/PG Kompleks:</span>'
                + '<span class="batch-summary-meta-tag">' + escHtml(String(optCount)) + '</span>'
                + '</div>');
      }

      if (disabled.length > 0) {
        var disHtml = '<div class="batch-cfg-row"><span>Tipe nonaktif:</span>';
        for (var d = 0; d < disabled.length; d++) {
          disHtml += '<span class="batch-cfg-disabled">' + escHtml(typeLabel(disabled[d])) + '</span>';
        }
        disHtml += '</div>';
        rows.push(disHtml);
      }

      var quotaParts = [];
      for (var q = 0; q < TYPE_ORDER.length; q++) {
        var qt = TYPE_ORDER[q];
        var qc = typeConfig[qt];
        if (!qc || qc.enabled === false) continue;
        var max = (typeof qc.max === 'number' && qc.max > 0) ? qc.max : 0;
        if (max <= 0) continue;
        var ex = parseInt(existing[qt], 10) || 0;
        var inB = parseInt(inBatch[qt], 10) || 0;
        var remaining = max - ex - inB;
        var cls = '';
        if (remaining < 0) cls = 'batch-cfg-quota-full';
        else if (max > 0 && (ex + inB) / max >= 0.9) cls = 'batch-cfg-quota-warn';
        var label = typeLabel(qt) + ' '
                  + (remaining < 0
                      ? ('overrun ' + Math.abs(remaining))
                      : (remaining + '/' + max));
        quotaParts.push('<span class="batch-summary-meta-tag ' + cls + '">' + escHtml(label) + '</span>');
      }
      if (quotaParts.length > 0) {
        rows.push('<div class="batch-cfg-row"><span>Sisa kuota:</span>' + quotaParts.join('') + '</div>');
      }

      if (rows.length === 0) {
        body.innerHTML = 'Konfigurasi default · semua tipe aktif.';
      } else {
        body.innerHTML = rows.join('');
      }
    }

    function render(state) {
      if (!initialized) init();

      var s = {
        status: (state && state.status) || 'idle',
        valid: (state && Array.isArray(state.valid)) ? state.valid : [],
        invalid: (state && Array.isArray(state.invalid)) ? state.invalid : [],
        globalErrors: (state && Array.isArray(state.globalErrors)) ? state.globalErrors : [],
        typeConfig: (state && state.typeConfig) || null,
        existingCounts: (state && state.existingCounts) || null
      };
      currentState = s;

      renderStatusPill(s.status);

      var validCount = s.valid.length;
      var invalidCount = s.invalid.length;
      var totalCount = validCount + invalidCount;
      setCounter('valid', validCount);
      setCounter('invalid', invalidCount);
      setCounter('total', totalCount);
      setCounter('valid-list', validCount);
      setCounter('invalid-list', invalidCount);

      renderDonut(s.valid);
      renderInvalidList(s.invalid);
      renderValidList(s.valid);
      renderConfig(s.typeConfig, s.existingCounts, s.valid);
    }

    function jumpToBlock(blockNumber) {
      var n = parseInt(blockNumber, 10);
      if (!isFinite(n) || n < 1) return;

      var ta = (BatchSoal.UI.SmartTextarea &&
                typeof BatchSoal.UI.SmartTextarea.getTextarea === 'function')
        ? BatchSoal.UI.SmartTextarea.getTextarea()
        : el('batch-input-text');
      if (!ta) return;

      var raw = ta.value || '';
      var lineIndex = computeBlockStartLine(raw, n);

      var lineHeight = 19.5;
      var topPad = 16;
      var targetTop = Math.max(0, (lineIndex - 2) * lineHeight + topPad);
      try { ta.scrollTop = targetTop; } catch (e) {}

      var editor = el('batch-editor');
      if (editor) {
        editor.classList.remove('batch-textarea-highlight');
        void editor.offsetWidth;
        editor.classList.add('batch-textarea-highlight');
        root.setTimeout(function () {
          editor.classList.remove('batch-textarea-highlight');
        }, 3000);
      }

      try { ta.focus({ preventScroll: true }); } catch (e) { try { ta.focus(); } catch (e2) {} }
    }

    function computeBlockStartLine(rawText, blockNumber) {
      if (typeof rawText !== 'string' || rawText === '') return 0;
      var lines = rawText.split(/\r?\n/);
      var blockIdx = 0;
      var inBlock = false;
      var startLineOfCurrentBlock = -1;

      for (var i = 0; i < lines.length; i++) {
        var isBlank = lines[i].trim() === '';
        if (!inBlock && !isBlank) {
          inBlock = true;
          blockIdx++;
          startLineOfCurrentBlock = i;
          if (blockIdx === blockNumber) return startLineOfCurrentBlock;
        } else if (inBlock && isBlank) {
          inBlock = false;
          startLineOfCurrentBlock = -1;
        }
      }
      return 0;
    }

    function onListClick(ev) {
      var target = ev.target;
      while (target && target !== ev.currentTarget) {
        if (target.nodeType === 1 && target.hasAttribute &&
            target.hasAttribute('data-jump-to-block')) {
          ev.preventDefault();
          jumpToBlock(target.getAttribute('data-jump-to-block'));
          return;
        }
        target = target.parentNode;
      }
    }

    function init() {
      if (initialized) return;
      var panel = el('batch-summary-panel');
      if (!panel) return;

      var invalidUl = el('batch-summary-invalid-list');
      var validUl = el('batch-summary-valid-list');
      if (invalidUl) invalidUl.addEventListener('click', onListClick);
      if (validUl) validUl.addEventListener('click', onListClick);

      initialized = true;
      render(currentState);
    }

    BatchSoal.UI.SummaryPanel = {
      init: init,
      render: render,
      setStatus: setStatus,
      jumpToBlock: jumpToBlock,
      _getState: function () { return currentState; },
      _resetInit: function () { initialized = false; }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      window.setTimeout(init, 0);
    }

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L11110-L11443 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    var currentMode = 'idle';

    var lastResult = {
      valid: [],
      invalid: [],
      globalErrors: []
    };

    var handlers = {
      preview: null,
      save: null,
      reset: null
    };

    function el(id) { return document.getElementById(id); }

    function setDisabled(btn, disabled) {
      if (!btn) return;
      btn.disabled = !!disabled;
      if (disabled) {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }

    function clamp(n, lo, hi) {
      n = (typeof n === 'number' && isFinite(n)) ? n : 0;
      if (n < lo) return lo;
      if (n > hi) return hi;
      return n;
    }

    function setEnabled(opts) {
      opts = opts || {};
      var preview = el('btn-batch-preview');
      var save = el('btn-batch-save');
      var reset = el('batch-btn-reset');
      if ('preview' in opts) setDisabled(preview, !opts.preview);
      if ('save' in opts) setDisabled(save, !opts.save);
      if ('reset' in opts) setDisabled(reset, !opts.reset);
    }

    function setProgress(percent) {
      var bar = el('batch-progress-bar');
      if (!bar) return;
      var p = clamp(percent, 0, 100);
      bar.style.width = p + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(p)));
    }

    function update(validationResult) {
      var v = validationResult || {};
      var valid = Array.isArray(v.valid) ? v.valid : [];
      var invalid = Array.isArray(v.invalid) ? v.invalid : [];
      var globalErrors = Array.isArray(v.globalErrors) ? v.globalErrors : [];
      lastResult = { valid: valid, invalid: invalid, globalErrors: globalErrors };

      var hasGlobalError = globalErrors.length > 0;
      var hasValid = valid.length >= 1;
      var hasInvalid = invalid.length >= 1;

      var locked = (currentMode === 'saving' || currentMode === 'parsing');

      var enableSave = !locked && hasValid && !hasGlobalError;
      var enablePreview = !locked && hasValid && !hasGlobalError;
      var enableReset = !locked;

      setEnabled({
        preview: enablePreview,
        save: enableSave,
        reset: enableReset
      });

      var total = valid.length + invalid.length;
      if (hasGlobalError || total === 0) {
        setProgress(0);
      } else {
        setProgress((valid.length / total) * 100);
      }
      void hasInvalid;
    }

    function onPreview(fn) { handlers.preview = (typeof fn === 'function') ? fn : null; }
    function onSave(fn) { handlers.save = (typeof fn === 'function') ? fn : null; }
    function onReset(fn) { handlers.reset = (typeof fn === 'function') ? fn : null; }

    function setMode(mode) {
      currentMode = mode || 'idle';
      update(lastResult);
    }

    function getMode() { return currentMode; }

    function defaultReset() {
      try {
        var ta = el('batch-input-text');

        var STclearCalled = false;
        try {
          var ST = BatchSoal.UI.SmartTextarea;
          if (ST && typeof ST.clear === 'function') {
            ST.clear();
            STclearCalled = true;
          }
        } catch (e) {   }

        if (!STclearCalled && ta) {
          ta.value = '';
          try {
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          } catch (e) {
            var evt = document.createEvent('Event');
            evt.initEvent('input', true, true);
            ta.dispatchEvent(evt);
          }
        }

        try {
          var ST2 = BatchSoal.UI.SmartTextarea;
          if (ST2 && typeof ST2.recompute === 'function') ST2.recompute();
          if (ST2 && typeof ST2.scheduleNow === 'function') ST2.scheduleNow();
        } catch (e) {   }

        try {
          if (BatchSoal.UI && typeof BatchSoal.UI.scheduleParse === 'function') {
            BatchSoal.UI.scheduleParse();
          } else if (BatchSoal.UI.SummaryPanel &&
                     typeof BatchSoal.UI.SummaryPanel.render === 'function') {
            BatchSoal.UI.SummaryPanel.render({
              status: 'idle', valid: [], invalid: [], globalErrors: []
            });
          }
        } catch (e) {   }

        update({ valid: [], invalid: [], globalErrors: [] });
        setProgress(0);

        if (ta && typeof ta.focus === 'function') ta.focus();
      } catch (e) {
        if (typeof console !== 'undefined') {
          console.warn('[BatchSoal.UI.ActionBar] defaultReset error:', e);
        }
      }
    }

    function onPreviewClick(ev) {
      if (ev) { ev.preventDefault(); }
      var btn = el('btn-batch-preview');
      if (btn && btn.disabled) return;
      if (handlers.preview) {
        try { handlers.preview(lastResult); }
        catch (e) { if (typeof console !== 'undefined') console.error(e); }
      } else {
        if (typeof console !== 'undefined') {
          console.debug('[BatchSoal.UI.ActionBar] Preview clicked (stub)', {
            valid: lastResult.valid.length,
            invalid: lastResult.invalid.length
          });
        }
        if (typeof root.previewBatchInput === 'function') {
          try { root.previewBatchInput(); } catch (e) {   }
        }
      }
    }

    function onSaveClick(ev) {
      if (ev) { ev.preventDefault(); }
      var btn = el('btn-batch-save');
      if (btn && btn.disabled) return;
      invokeSave(lastResult);
    }

    function invokeSave(validationResult) {
      var payload = validationResult || lastResult;
      if (handlers.save) {
        try { handlers.save(payload); }
        catch (e) { if (typeof console !== 'undefined') console.error(e); }
        return;
      }
      if (typeof console !== 'undefined') {
        console.debug('[BatchSoal.UI.ActionBar] invokeSave (stub)', {
          valid: (payload && payload.valid && payload.valid.length) || 0,
          invalid: (payload && payload.invalid && payload.invalid.length) || 0
        });
      }
      if (typeof root.processBatchInput === 'function') {
        try { root.processBatchInput(); } catch (e) {   }
      }
    }

    function onResetClick(ev) {
      if (ev) { ev.preventDefault(); }
      var btn = el('batch-btn-reset');
      if (btn && btn.disabled) return;
      if (handlers.reset) {
        try { handlers.reset(); }
        catch (e) { if (typeof console !== 'undefined') console.error(e); }
      } else {
        if (typeof console !== 'undefined') {
          console.debug('[BatchSoal.UI.ActionBar] Reset clicked (default behavior)');
        }
        defaultReset();
      }
    }

    function applyViewportOffset() {
      var bar = el('batch-action-bar');
      if (!bar) return;
      try {
        var vv = root.visualViewport;
        if (vv && typeof vv.height === 'number' && typeof vv.offsetTop === 'number') {
          var layoutH = root.innerHeight || document.documentElement.clientHeight || 0;
          var keyboardH = Math.max(0, layoutH - (vv.height + vv.offsetTop));
          if (keyboardH > 120) {
            bar.style.transform = 'translateY(-' + Math.round(keyboardH) + 'px)';
          } else {
            bar.style.transform = '';
          }
        } else {
          bar.style.transform = '';
        }
      } catch (e) {
        bar.style.transform = '';
      }
    }

    function attachSummaryHook() {
      try {
        var SP = BatchSoal.UI.SummaryPanel;
        if (!SP || typeof SP.render !== 'function' || SP.__actionBarHooked) return;
        var origRender = SP.render;
        SP.render = function (state) {
          var ret = origRender.apply(this, arguments);
          try {
            update({
              valid: (state && Array.isArray(state.valid)) ? state.valid : [],
              invalid: (state && Array.isArray(state.invalid)) ? state.invalid : [],
              globalErrors: (state && Array.isArray(state.globalErrors)) ? state.globalErrors : []
            });
          } catch (e) {   }
          return ret;
        };
        SP.__actionBarHooked = true;
      } catch (e) {   }
    }

    var initialized = false;
    function init() {
      if (initialized) return;
      var bar = el('batch-action-bar');
      if (!bar) return;

      var preview = el('btn-batch-preview');
      var save = el('btn-batch-save');
      var reset = el('batch-btn-reset');

      if (preview) {
        preview.removeAttribute('onclick');
        preview.addEventListener('click', onPreviewClick);
      }
      if (save) {
        save.removeAttribute('onclick');
        save.addEventListener('click', onSaveClick);
      }
      if (reset) {
        reset.addEventListener('click', onResetClick);
      }

      var pb = el('batch-progress-bar');
      if (pb) {
        pb.setAttribute('role', 'progressbar');
        pb.setAttribute('aria-valuemin', '0');
        pb.setAttribute('aria-valuemax', '100');
        pb.setAttribute('aria-valuenow', '0');
        pb.setAttribute('aria-label', 'Persentase soal valid');
      }

      attachSummaryHook();

      try {
        var vv = root.visualViewport;
        if (vv) {
          vv.addEventListener('resize', applyViewportOffset);
          vv.addEventListener('scroll', applyViewportOffset);
        }
        applyViewportOffset();
      } catch (e) {   }

      update({ valid: [], invalid: [], globalErrors: [] });
      setProgress(0);

      initialized = true;
    }

    BatchSoal.UI.ActionBar = {
      init: init,
      update: update,
      setEnabled: setEnabled,
      setProgress: setProgress,
      setMode: setMode,
      getMode: getMode,
      onPreview: onPreview,
      onSave: onSave,
      onReset: onReset,
      invokeSave: invokeSave,
      _getLastResult: function () { return lastResult; },
      _resetInit: function () { initialized = false; }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        init();
        attachSummaryHook();
      }, { once: true });
    } else {
      root.setTimeout(function () {
        init();
        attachSummaryHook();
      }, 0);
    }

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L11445-L12163 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    var initialized = false;
    var currentExamId = null;
    var state = 'idle';
    var debounceTimer = null;
    var DEBOUNCE_MS = 500;
    var bound = { input: false, keydown: false, actionBar: false, examChange: false };
    var lastResult = { valid: [], invalid: [], globalErrors: [] };

    function el(id) { return document.getElementById(id); }
    function dbg() {
      if (typeof console === 'undefined' || !console.debug) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.debug.apply(console, ['[BatchSoal.UI]'].concat(args));
      } catch (e) {   }
    }
    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI]'].concat(args));
      } catch (e) {   }
    }

    function mapToActionBarMode(s) {
      if (s === 'idle' || s === 'typing') return 'idle';
      if (s === 'parsing') return 'parsing';
      if (s === 'result_valid' || s === 'result_partial' ||
          s === 'result_invalid') return 'result';
      if (s === 'previewing' || s === 'confirming') return 'previewing';
      if (s === 'saving') return 'saving';
      if (s === 'success') return 'success';
      if (s === 'failure') return 'failure';
      return 'idle';
    }

    function mapToSummaryStatus(s, snapshot) {
      if (s === 'idle' || s === 'typing') return 'idle';
      if (s === 'parsing') return 'parsing';
      if (s === 'result_valid' || s === 'success') return 'valid';
      if (s === 'result_partial') return 'partial';
      if (s === 'result_invalid' || s === 'failure') return 'error';
      if (snapshot) {
        var v = (snapshot.valid || []).length;
        var i = (snapshot.invalid || []).length;
        var ge = (snapshot.globalErrors || []).length;
        if (ge > 0) return 'error';
        if (v > 0 && i > 0) return 'partial';
        if (v > 0) return 'valid';
        if (i > 0) return 'error';
      }
      return 'idle';
    }

    function setState(next) {
      state = next || 'idle';
      try {
        var AB = BatchSoal.UI.ActionBar;
        if (AB && typeof AB.setMode === 'function') {
          AB.setMode(mapToActionBarMode(state));
        }
      } catch (e) {   }
    }

    function renderSummary(status) {
      try {
        var SP = BatchSoal.UI.SummaryPanel;
        if (!SP || typeof SP.render !== 'function') return;
        SP.render({
          status: status,
          valid: lastResult.valid,
          invalid: lastResult.invalid,
          globalErrors: lastResult.globalErrors,
          typeConfig: BatchSoal.UI.currentExamTypeConfig || null,
          existingCounts: BatchSoal.UI.currentExamExistingCounts || null
        });
      } catch (e) {   }
    }

    function loadTypeConfig(examId) {
      try {
        if (typeof root.currentExamTypeConfig !== 'undefined' &&
            root.currentExamTypeConfig) {
          BatchSoal.UI.currentExamTypeConfig = root.currentExamTypeConfig;
        }
      } catch (e) {   }

      // Reset existing counts saat ganti ujian agar "Sisa kuota" tidak memakai
      // data ujian sebelumnya selama menunggu respons backend.
      BatchSoal.UI.currentExamExistingCounts = null;

      if (!examId) return;

      try {
        if (!root.google || !root.google.script || !root.google.script.run) return;
        if (!root.currentUser || !root.currentUser.userID || !root.currentUser.token) return;

        root.google.script.run
          .withSuccessHandler(function (resp) {
            try {
              var tc = (resp && !Array.isArray(resp) && resp.typeConfig)
                ? resp.typeConfig : null;

              // Hitung jumlah soal yang SUDAH tersimpan per tipe agar "Sisa kuota"
              // di Ringkasan Validasi memperhitungkan soal eksisting, bukan hanya
              // soal dalam batch saat ini.
              var counts = { PG: 0, PG_KOMPLEKS: 0, BS: 0, JODOH: 0, Esai: 0 };
              var qs = (resp && !Array.isArray(resp) && resp.questions)
                ? resp.questions
                : (Array.isArray(resp) ? resp : null);
              if (qs && qs.length) {
                for (var i = 0; i < qs.length; i++) {
                  var qt = qs[i] && qs[i].type;
                  if (qt && counts.hasOwnProperty(qt)) counts[qt]++;
                }
              }
              BatchSoal.UI.currentExamExistingCounts = counts;

              if (tc) {
                BatchSoal.UI.currentExamTypeConfig = tc;
                root.currentExamTypeConfig = tc;
              }
              // Selalu render ulang ringkasan agar sisa kuota memakai data terbaru,
              // meskipun TypeConfig tidak berubah.
              renderSummary(mapToSummaryStatus(state, lastResult));
            } catch (e) { logWarn('Handler TypeConfig error:', e); }
          })
          .withFailureHandler(function (err) {
            logWarn('Gagal memuat TypeConfig (fallback ke cache):', err);
          })
          .getQuestionsByExam(examId, root.currentUser.userID, root.currentUser.token);
      } catch (e) {
        logWarn('Pemuatan TypeConfig melempar exception:', e);
      }
    }

    function runParseNow() {
      debounceTimer = null;

      var ta = el('batch-input-text');
      if (!ta) return;
      var raw = ta.value || '';

      setState('parsing');
      renderSummary('parsing');

      var validation = { valid: [], invalid: [], globalErrors: [] };
      try {
        var Parser = BatchSoal.Parser;
        var Validator = BatchSoal.Validator;
        if (!Parser || typeof Parser.parseBatchText !== 'function' ||
            !Validator || typeof Validator.validateParsedBlocks !== 'function') {
          throw new Error('Parser/Validator belum siap.');
        }
        var typeConfig = BatchSoal.UI.currentExamTypeConfig || {};
        var optCountByType = {
          PG: (typeConfig.PG && typeof typeConfig.PG.optCount === 'number')
            ? typeConfig.PG.optCount : 5,
          PG_KOMPLEKS: (typeConfig.PG_KOMPLEKS &&
                        typeof typeConfig.PG_KOMPLEKS.optCount === 'number')
            ? typeConfig.PG_KOMPLEKS.optCount : 5
        };
        var parsed = Parser.parseBatchText(raw, optCountByType);
        var v = Validator.validateParsedBlocks(parsed, typeConfig);
        validation = {
          valid: (v && Array.isArray(v.valid)) ? v.valid : [],
          invalid: (v && Array.isArray(v.invalid)) ? v.invalid : [],
          globalErrors: (v && Array.isArray(v.globalErrors)) ? v.globalErrors : []
        };
      } catch (e) {
        logWarn('Pipeline parse/validate gagal:', e);
        validation = {
          valid: [],
          invalid: [],
          globalErrors: ['Sistem gagal memproses teks. Silakan coba lagi.']
        };
      }
      lastResult = validation;

      var ge = validation.globalErrors.length;
      var vCount = validation.valid.length;
      var iCount = validation.invalid.length;
      var nextState;
      if (ge > 0) {
        nextState = 'result_invalid';
      } else if (vCount === 0 && iCount === 0) {
        nextState = 'idle';
      } else if (vCount > 0 && iCount === 0) {
        nextState = 'result_valid';
      } else if (vCount > 0 && iCount > 0) {
        nextState = 'result_partial';
      } else {
        nextState = 'result_invalid';
      }

      renderSummary(mapToSummaryStatus(nextState, validation));
      setState(nextState);
    }

    function scheduleParse() {
      if (debounceTimer) {
        try { root.clearTimeout(debounceTimer); } catch (e) {   }
      }
      if (state !== 'parsing' && state !== 'saving' &&
          state !== 'previewing' && state !== 'confirming') {
        setState('typing');
      }
      debounceTimer = root.setTimeout(runParseNow, DEBOUNCE_MS);
    }

    function isFormVisible() {
      var form = el('form-batch-q');
      if (!form) return false;
      return !form.classList.contains('hidden');
    }

    function clickIfEnabled(id) {
      var btn = el(id);
      if (!btn || btn.disabled) return false;
      try { btn.click(); return true; } catch (e) { return false; }
    }

    function cycleFormatGuideTabForward() {
      var tabs = document.querySelectorAll('#batch-format-guide .batch-format-tab');
      if (!tabs || tabs.length === 0) {
        var mobItems = document.querySelectorAll('#batch-format-mobile .batch-format-mobile-item');
        if (mobItems && mobItems.length) {
          var openIdx = -1;
          for (var j = 0; j < mobItems.length; j++) {
            if (mobItems[j].open) { openIdx = j; break; }
          }
          for (var k = 0; k < mobItems.length; k++) mobItems[k].open = false;
          var n = mobItems[((openIdx < 0 ? -1 : openIdx) + 1) % mobItems.length];
          if (n) n.open = true;
        }
        return;
      }
      var idx = -1;
      for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('aria-selected') === 'true') { idx = i; break; }
      }
      var next = tabs[((idx < 0 ? -1 : idx) + 1) % tabs.length];
      if (!next) return;
      try {
        if (typeof next.click === 'function') next.click();
        if (typeof next.focus === 'function') next.focus();
      } catch (e) {   }
    }

    function toggleFormatGuideDrawer() {
      var drawer = document.querySelector('#form-batch-q details.batch-collapse');
      if (drawer) {
        drawer.open = !drawer.open;
        if (drawer.open) {
          var sum = drawer.querySelector('summary');
          if (sum && typeof sum.focus === 'function') {
            try { sum.focus(); } catch (e) {}
          }
        }
        return;
      }
      var firstTab = document.querySelector('#batch-format-guide .batch-format-tab');
      if (firstTab && typeof firstTab.focus === 'function') {
        try { firstTab.focus(); } catch (e) {   }
      }
    }

    function onKeyDown(ev) {
      if (!ev) return;
      if (!isFormVisible()) return;
      var ctrl = ev.ctrlKey || ev.metaKey;
      if (!ctrl) return;
      var key = ev.key;
      if (!key) return;
      var lower = key.toLowerCase();

      if (lower === 's' && !ev.shiftKey && !ev.altKey) {
        ev.preventDefault();
        clickIfEnabled('btn-batch-save');
        return;
      }
      if (key === 'Enter' && !ev.shiftKey && !ev.altKey) {
        ev.preventDefault();
        clickIfEnabled('btn-batch-save');
        return;
      }
      if (lower === 't' && ev.shiftKey && !ev.altKey) {
        ev.preventDefault();
        cycleFormatGuideTabForward();
        return;
      }
      if (key === '/' && !ev.shiftKey && !ev.altKey) {
        ev.preventDefault();
        toggleFormatGuideDrawer();
        return;
      }
    }

    function onPreviewStub(result) {
      setState('previewing');
      dbg('Pratinjau dipicu (stub Task 7.x)', {
        valid: (result && result.valid && result.valid.length) || 0,
        invalid: (result && result.invalid && result.invalid.length) || 0
      });
      try {
        if (typeof root.previewBatchInput === 'function') {
          root.previewBatchInput();
        }
      } catch (e) {   }
    }

    function onSaveStub(result) {
      setState('confirming');
      dbg('Simpan dipicu', {
        valid: (result && result.valid && result.valid.length) || 0,
        invalid: (result && result.invalid && result.invalid.length) || 0
      });

      var confirmFn = (BatchSoal.UI && typeof BatchSoal.UI.confirmSave === 'function')
        ? BatchSoal.UI.confirmSave
        : null;

      if (!confirmFn) {
        try {
          if (typeof root.processBatchInput === 'function') {
            root.processBatchInput();
          }
        } catch (e) {   }
        return;
      }

      var prevResultState = (function () {
        var v = (result && result.valid) ? result.valid.length : 0;
        var i = (result && result.invalid) ? result.invalid.length : 0;
        var ge = (result && result.globalErrors) ? result.globalErrors.length : 0;
        if (ge > 0) return 'result_invalid';
        if (v > 0 && i > 0) return 'result_partial';
        if (v > 0) return 'result_valid';
        if (i > 0) return 'result_invalid';
        return 'idle';
      })();

      var typeCfg = (BatchSoal.UI && BatchSoal.UI.currentExamTypeConfig) || null;

      Promise.resolve()
        .then(function () { return confirmFn(result, typeCfg); })
        .then(function (confirmed) {
          if (!confirmed) {
            setState(prevResultState);
            dbg('Konfirmasi simpan dibatalkan oleh pengguna.');
            return;
          }
          setState('saving');

          var submitFn = (BatchSoal.UI && typeof BatchSoal.UI.submitBatch === 'function')
            ? BatchSoal.UI.submitBatch
            : null;

          if (!submitFn) {
            try {
              if (typeof root.processBatchInput === 'function') {
                root.processBatchInput();
              }
            } catch (e) {
              logWarn('processBatchInput (fallback) melempar exception:', e);
              setState(prevResultState);
            }
            return;
          }

          submitFn(result)
            .then(function (resp) {
              var SR = (BatchSoal.UI && BatchSoal.UI.SaveResponse) || null;
              var nextState = (resp && resp.success === true) ? 'success' : 'failure';
              setState(nextState);

              if (SR && typeof SR.handle === 'function') {
                try {
                  SR.handle(resp, {
                    validationResult: result,
                    examID: currentExamId,
                    retryFn: function () {
                      try { setState('saving'); } catch (e) {   }
                      try { return submitFn(result); }
                      catch (e) {
                        logWarn('Retry submit melempar exception:', e);
                      }
                    }
                  });
                } catch (e) {
                  logWarn('SaveResponse.handle melempar exception:', e);
                }
              } else {
                logWarn('Submit gagal/timeout (fallback restore):',
                        resp && (resp.code || resp.message));
                try {
                  var AB = BatchSoal.UI && BatchSoal.UI.ActionBar;
                  if (AB) {
                    if (typeof AB.setEnabled === 'function') {
                      AB.setEnabled({ preview: true, save: true, reset: true });
                    }
                    if (typeof AB.setProgress === 'function') {
                      AB.setProgress(0);
                    }
                  }
                } catch (e2) {   }
              }
            })
            .catch(function (err) {
              logWarn('Submit Promise unexpectedly rejected:', err);
              setState('failure');
              try {
                var AB2 = BatchSoal.UI && BatchSoal.UI.ActionBar;
                if (AB2 && typeof AB2.setEnabled === 'function') {
                  AB2.setEnabled({ preview: true, save: true, reset: true });
                }
                if (AB2 && typeof AB2.setProgress === 'function') {
                  AB2.setProgress(0);
                }
              } catch (e) {   }
            });
        })
        .catch(function (err) {
          logWarn('Dialog konfirmasi gagal:', err);
          setState(prevResultState);
        });
    }

    function performReset() {
      // Reset penuh: kosongkan textarea, draft, gutter/counter, ringkasan, lalu
      // kembalikan state ke idle.
      try {
        var ta = el('batch-input-text');
        if (ta) {
          ta.value = '';
          try {
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          } catch (e) {
            try {
              var evt = document.createEvent('Event');
              evt.initEvent('input', true, true);
              ta.dispatchEvent(evt);
            } catch (e2) {   }
          }
        }
      } catch (e) { logWarn('Reset textarea gagal:', e); }

      // Perbarui gutter & penghitung agar konsisten dengan textarea kosong.
      try {
        var ST = BatchSoal.UI && BatchSoal.UI.SmartTextarea;
        if (ST && typeof ST.recompute === 'function') ST.recompute();
        if (ST && typeof ST.scheduleNow === 'function') ST.scheduleNow();
      } catch (e) {   }

      // Hapus draft tersimpan untuk ujian aktif.
      try {
        var DR = BatchSoal.UI && BatchSoal.UI.Draft;
        if (DR && typeof DR.clear === 'function') DR.clear();
      } catch (e) {   }

      lastResult = { valid: [], invalid: [], globalErrors: [] };
      setState('idle');
      renderSummary('idle');

      // Reset bar aksi (tombol & progress) ke kondisi idle.
      try {
        var AB = BatchSoal.UI && BatchSoal.UI.ActionBar;
        if (AB) {
          if (typeof AB.update === 'function') {
            AB.update({ valid: [], invalid: [], globalErrors: [] });
          }
          if (typeof AB.setProgress === 'function') AB.setProgress(0);
        }
      } catch (e) {   }

      // Fokuskan kembali ke textarea agar pengguna bisa langsung menempel ulang.
      try {
        var ta2 = el('batch-input-text');
        if (ta2 && typeof ta2.focus === 'function') ta2.focus();
      } catch (e) {   }

      dbg('Reset → form dikosongkan, state idle.');
    }

    function onResetStub() {
      // Cegah kehilangan data tak sengaja: minta konfirmasi sebelum mengosongkan
      // formulir. Jika textarea sudah kosong, langsung reset tanpa dialog.
      var taEl = el('batch-input-text');
      var hasText = !!(taEl && taEl.value && taEl.value.trim() !== '');

      if (!hasText) {
        performReset();
        return;
      }

      var Swal = root.Swal;
      if (!Swal || typeof Swal.fire !== 'function') {
        // Tanpa SweetAlert2: fallback ke confirm bawaan browser.
        var ok = true;
        try {
          ok = root.confirm('Kosongkan semua teks soal batch? Tindakan ini tidak dapat dibatalkan.');
        } catch (e) { ok = true; }
        if (ok) performReset();
        return;
      }

      Swal.fire({
        icon: 'warning',
        title: 'Reset Formulir Batch?',
        html: '<p style="font-size:13px;color:#475569;">' +
              'Semua teks soal yang sudah ditempel akan <b>dihapus</b> dan tidak dapat dikembalikan.</p>',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-rotate-left"></i> Ya, Reset',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
        focusCancel: true,
        customClass: { popup: 'lp-swal' }
      }).then(function (res) {
        if (res && res.isConfirmed) {
          performReset();
        } else {
          // Batal: kembalikan fokus ke textarea tanpa mengubah apa pun.
          try { if (taEl && typeof taEl.focus === 'function') taEl.focus(); } catch (e) {   }
        }
      }).catch(function (err) {
        logWarn('Dialog konfirmasi reset gagal:', err);
      });
    }

    function init(examId) {
      try {
        var RG = BatchSoal.UI && BatchSoal.UI.RoleGate;
        if (RG && typeof RG.isAuthorized === 'function' && !RG.isAuthorized()) {
          try { RG.enforce(); } catch (e) {   }
          return;
        }
      } catch (e) {   }

      if (initialized) {
        if (examId && examId !== currentExamId) {
          currentExamId = examId;
          BatchSoal.UI.currentExamId = examId;
          loadTypeConfig(examId);
        }
        try {
          if (BatchSoal.UI.Draft && typeof BatchSoal.UI.Draft.init === 'function') {
            BatchSoal.UI.Draft.init({
              getUserId: function () {
                return (root.currentUser && root.currentUser.userID) || null;
              },
              getExamId: function () { return currentExamId; }
            });
          }
        } catch (e) { logWarn('Re-wiring Draft gagal:', e); }
        return;
      }

      currentExamId = examId || (function () {
        try {
          var sel = el('select-exam-q');
          return sel && sel.value ? sel.value : null;
        } catch (e) { return null; }
      })();
      BatchSoal.UI.currentExamId = currentExamId;

      loadTypeConfig(currentExamId);

      if (!bound.input) {
        var ta = el('batch-input-text');
        if (ta) {
          ta.addEventListener('input', function () { scheduleParse(); });
          bound.input = true;
        }
      }

      if (!bound.keydown) {
        var form = el('form-batch-q');
        var target = form || document;
        target.addEventListener('keydown', onKeyDown, true);
        bound.keydown = true;
      }

      if (!bound.actionBar && BatchSoal.UI.ActionBar) {
        try {
          var AB = BatchSoal.UI.ActionBar;
          // The ActionBar auto-init at module load runs before renderQuestionBank
          // injects #batch-action-bar, so it bails early. Initialize it now that
          // the Bank Soal DOM exists; init() is idempotent (guards on #batch-action-bar).
          if (typeof AB.init === 'function') AB.init();
          if (typeof AB.onPreview === 'function') AB.onPreview(onPreviewStub);
          if (typeof AB.onSave === 'function') AB.onSave(onSaveStub);
          if (typeof AB.onReset === 'function') AB.onReset(onResetStub);
          bound.actionBar = true;
        } catch (e) { logWarn('Wiring ActionBar gagal:', e); }
      }

      if (!bound.examChange) {
        var examSel = el('select-exam-q');
        if (examSel) {
          examSel.addEventListener('change', function (ev) {
            try {
              var newId = ev.currentTarget && ev.currentTarget.value
                ? String(ev.currentTarget.value).trim() : '';
              if (newId && newId !== currentExamId) {
                currentExamId = newId;
                BatchSoal.UI.currentExamId = newId;
                loadTypeConfig(newId);
              } else if (!newId) {
                currentExamId = null;
              }
              scheduleParse();
              try {
                if (BatchSoal.UI.Draft && typeof BatchSoal.UI.Draft.init === 'function') {
                  BatchSoal.UI.Draft.init({
                    getUserId: function () {
                      return (root.currentUser && root.currentUser.userID) || null;
                    },
                    getExamId: function () { return currentExamId; }
                  });
                }
              } catch (e) {   }
            } catch (e) { logWarn('Listener exam change gagal:', e); }
          });
          bound.examChange = true;
        }
      }

      try {
        if (BatchSoal.UI.PreviewWiring &&
            typeof BatchSoal.UI.PreviewWiring.init === 'function') {
          BatchSoal.UI.PreviewWiring.init();
        }
      } catch (e) { logWarn('Wiring PreviewWiring gagal:', e); }

      try {
        if (BatchSoal.UI.Draft && typeof BatchSoal.UI.Draft.init === 'function') {
          BatchSoal.UI.Draft.init({
            getUserId: function () {
              return (root.currentUser && root.currentUser.userID) || null;
            },
            getExamId: function () { return currentExamId; }
          });
        }
      } catch (e) { logWarn('Wiring Draft gagal:', e); }

      try {
        if (BatchSoal.UI.Responsive &&
            typeof BatchSoal.UI.Responsive.init === 'function') {
          BatchSoal.UI.Responsive.init();
        }
      } catch (e) { logWarn('Wiring Responsive gagal:', e); }

      setState('idle');
      renderSummary('idle');

      initialized = true;
      dbg('Initialized.', { examId: currentExamId });
    }

    BatchSoal.UI.init = init;
    BatchSoal.UI.scheduleParse = scheduleParse;
    BatchSoal.UI.getState = function () { return state; };
    BatchSoal.UI._setState = setState;
    BatchSoal.UI._getLastResult = function () { return lastResult; };

    // Reset this orchestrator's init guards so the next init() re-wires to a
    // freshly rendered Bank Soal DOM (renderQuestionBank rebuilds it each visit).
    BatchSoal.UI._resetInit = function () {
      initialized = false;
      bound = { input: false, keydown: false, actionBar: false, examChange: false };
    };

    // Re-initialize every Batch UI module against the current DOM. Called by
    // renderQuestionBank after it replaces the Bank Soal markup so that all
    // listeners/counters/buttons bind to the new elements (Task: fix batch wiring).
    BatchSoal.UI.reinitForRender = function (examId) {
      var U = BatchSoal.UI;
      try { if (U._resetInit) U._resetInit(); } catch (e) {   }
      // Only modules that attach listeners to the rebuilt Bank Soal DOM are reset.
      // Responsive/Draft bind to window/dynamic resolvers, so they are left intact
      // to avoid leaking duplicate listeners on each tab visit.
      var children = ['SmartTextarea', 'SummaryPanel', 'ActionBar', 'FormatGuide',
                      'PreviewWiring'];
      for (var i = 0; i < children.length; i++) {
        var mod = U[children[i]];
        if (mod && typeof mod._resetInit === 'function') {
          try { mod._resetInit(); } catch (e) {   }
        }
      }
      // Re-run the FormatGuide/SmartTextarea/SummaryPanel init explicitly since
      // their auto-init at module load ran before this DOM existed.
      try { if (U.FormatGuide && U.FormatGuide.init) U.FormatGuide.init(); } catch (e) {   }
      try { if (U.SmartTextarea && U.SmartTextarea.init) U.SmartTextarea.init(); } catch (e) {   }
      try { if (U.SummaryPanel && U.SummaryPanel.init) U.SummaryPanel.init(); } catch (e) {   }
      try { if (typeof init === 'function') init(examId); } catch (e) {   }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        try { init(); } catch (e) { logWarn('Auto-init error:', e); }
      }, { once: true });
    } else {
      root.setTimeout(function () {
        try { init(); } catch (e) { logWarn('Auto-init error:', e); }
      }, 0);
    }

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L12165-L12449 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    var initialized = false;
    var intervalId = null;
    var lastSavedAt = null;
    var enabled = true;
    var restorePromptShown = false;
    var bound = { blur: false };
    var resolvers = {
      getUserId: function () { return null; },
      getExamId: function () { return null; }
    };
    var SAVE_INTERVAL_MS = 3000;
    var KEY_PREFIX = 'batchDraft:';

    function el(id) { return document.getElementById(id); }
    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.Draft]'].concat(args));
      } catch (e) {   }
    }

    function pad2(n) {
      n = String(n);
      return n.length < 2 ? '0' + n : n;
    }
    function formatHHMMSS(date) {
      try {
        return pad2(date.getHours()) + ':' +
               pad2(date.getMinutes()) + ':' +
               pad2(date.getSeconds());
      } catch (e) { return ''; }
    }

    function isFormVisible() {
      var form = el('form-batch-q');
      if (!form) return false;
      return !form.classList.contains('hidden');
    }

    function getKey(opts) {
      opts = opts || {};
      var uid = opts.userId;
      var eid = opts.examId;
      if (uid === null || uid === undefined || uid === '' ||
          eid === null || eid === undefined || eid === '') {
        return null;
      }
      return KEY_PREFIX + String(uid) + ':' + String(eid);
    }

    function safeGetItem(key) {
      try { return root.localStorage.getItem(key); }
      catch (e) { logWarn('localStorage.getItem gagal:', e); return null; }
    }
    function safeSetItem(key, value) {
      try { root.localStorage.setItem(key, value); return true; }
      catch (e) {
        logWarn('localStorage.setItem gagal — auto-save dimatikan untuk sesi ini:', e);
        enabled = false;
        return false;
      }
    }
    function safeRemoveItem(key) {
      try { root.localStorage.removeItem(key); return true; }
      catch (e) { logWarn('localStorage.removeItem gagal:', e); return false; }
    }

    function updateLabel() {
      var label = el('batch-autosave-label');
      if (!label) return;
      if (!lastSavedAt) {
        label.textContent = '';
        return;
      }
      label.textContent = 'Tersimpan otomatis · ' + formatHHMMSS(lastSavedAt);
    }


    function load(opts) {
      var key = getKey(opts);
      if (!key) return null;
      return safeGetItem(key);
    }

    function clear() {
      try {
        var uid = resolvers.getUserId && resolvers.getUserId();
        var eid = resolvers.getExamId && resolvers.getExamId();
        var key = getKey({ userId: uid, examId: eid });
        if (key) safeRemoveItem(key);
      } catch (e) { logWarn('clear() gagal:', e); }
      lastSavedAt = null;
      updateLabel();
    }

    function save() {
      if (!enabled) return;
      try {
        var ta = el('batch-input-text');
        if (!ta) return;
        var uid = resolvers.getUserId && resolvers.getUserId();
        var eid = resolvers.getExamId && resolvers.getExamId();
        var key = getKey({ userId: uid, examId: eid });
        if (!key) return;

        var text = ta.value || '';
        if (text.length === 0) {
          safeRemoveItem(key);
          return;
        }

        var ok = safeSetItem(key, text);
        if (!ok) return;
        lastSavedAt = new Date();
        updateLabel();
      } catch (e) {
        logWarn('save() melempar:', e);
      }
    }

    function promptRestore(opts) {
      return new Promise(function (resolve) {
        try {
          var draft = load(opts);
          if (typeof draft !== 'string' || draft.length === 0) {
            resolve(false);
            return;
          }
          if (typeof root.Swal === 'undefined' || !root.Swal ||
              typeof root.Swal.fire !== 'function') {
            var ok = false;
            try { ok = root.confirm('Ada draf yang belum disimpan untuk ujian ini. Pulihkan?'); }
            catch (e) { ok = false; }
            resolve(!!ok);
            return;
          }

          root.Swal.fire({
            icon: 'question',
            title: 'Pulihkan draf?',
            text: 'Ada draf yang belum disimpan untuk ujian ini. Pulihkan?',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-rotate-left mr-1"></i> Pulihkan',
            cancelButtonText: '<i class="fas fa-trash mr-1"></i> Hapus draf',
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#64748b',
            reverseButtons: true,
            customClass: { popup: 'lp-swal' }
          }).then(function (res) {
            resolve(!!(res && res.isConfirmed));
          }).catch(function () { resolve(false); });
        } catch (e) {
          logWarn('promptRestore gagal:', e);
          resolve(false);
        }
      });
    }

    function tick() {
      try {
        if (!enabled) return;
        if (!isFormVisible()) return;
        save();
      } catch (e) { logWarn('tick gagal:', e); }
    }

    function startInterval() {
      if (intervalId !== null) return;
      try {
        intervalId = root.setInterval(tick, SAVE_INTERVAL_MS);
      } catch (e) { logWarn('setInterval gagal:', e); }
    }

    function bindBlur() {
      if (bound.blur) return;
      var ta = el('batch-input-text');
      if (!ta) return;
      ta.addEventListener('blur', function () {
        try { save(); } catch (e) {   }
      });
      bound.blur = true;
    }

    function init(opts) {
      opts = opts || {};
      if (typeof opts.getUserId === 'function') resolvers.getUserId = opts.getUserId;
      if (typeof opts.getExamId === 'function') resolvers.getExamId = opts.getExamId;

      restorePromptShown = false;

      if (initialized) {
        maybeRestore();
        return;
      }
      initialized = true;

      bindBlur();
      startInterval();
      maybeRestore();
    }

    function maybeRestore() {
      if (restorePromptShown) return;
      var uid = resolvers.getUserId && resolvers.getUserId();
      var eid = resolvers.getExamId && resolvers.getExamId();
      if (!uid || !eid) return;
      var ta = el('batch-input-text');
      if (!ta) return;
      if ((ta.value || '').length > 0) return;
      var draft = load({ userId: uid, examId: eid });
      if (typeof draft !== 'string' || draft.length === 0) return;

      restorePromptShown = true;
      promptRestore({ userId: uid, examId: eid }).then(function (accept) {
        try {
          if (accept) {
            ta.value = draft;
            try {
              ta.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (e) {
              var ev = document.createEvent('Event');
              ev.initEvent('input', true, true);
              ta.dispatchEvent(ev);
            }
            lastSavedAt = new Date();
            updateLabel();
          } else {
            var key = getKey({ userId: uid, examId: eid });
            if (key) safeRemoveItem(key);
          }
        } catch (e) { logWarn('Handler promptRestore gagal:', e); }
      });
    }

    BatchSoal.UI.Draft = {
      init: init,
      save: save,
      load: load,
      clear: clear,
      getKey: getKey,
      promptRestore: promptRestore
    };

    function ensureSmartTextareaClear() {
      try {
        var ST = BatchSoal.UI.SmartTextarea;
        if (!ST) return;
        if (typeof ST.clear === 'function') return;
        ST.clear = function () {
          try {
            var ta = el('batch-input-text');
            if (ta) {
              ta.value = '';
              try {
                ta.dispatchEvent(new Event('input', { bubbles: true }));
              } catch (e) {
                var ev = document.createEvent('Event');
                ev.initEvent('input', true, true);
                ta.dispatchEvent(ev);
              }
            }
          } finally {
            try { clear(); } catch (e) {   }
          }
        };
      } catch (e) { logWarn('ensureSmartTextareaClear gagal:', e); }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureSmartTextareaClear, { once: true });
    } else {
      root.setTimeout(ensureSmartTextareaClear, 0);
    }

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L12451-L12691 ─── */
  'use strict';
  (function (root) {
    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};
    if (BatchSoal.UI.Responsive && BatchSoal.UI.Responsive.__bound) {
      return;
    }

    var BP = [
      { name: '3xl', min: 1920 },
      { name: '2xl', min: 1536 },
      { name: 'xl',  min: 1280 },
      { name: 'lg',  min: 1024 },
      { name: 'md',  min: 768  },
      { name: 'sm',  min: 640  },
      { name: 'xs',  min: 0    }
    ];

    var DEBOUNCE_MS = 120;

    var state = {
      bound: false,
      observer: null,
      debounceTimer: null,
      lastBreakpoint: null,
      savedScrollRatio: 0,
      savedTab: null,
      savedSelection: null
    };

    function logWarn() {
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.Responsive]'].concat(args));
      } catch (e) {   }
    }

    function el(id) { return document.getElementById(id); }
    function getContainer() { return el('form-batch-q'); }
    function getTextarea() { return el('batch-input-text'); }

    function computeBreakpoint() {
      var w = (root.innerWidth || document.documentElement.clientWidth || 0);
      for (var i = 0; i < BP.length; i++) {
        if (w >= BP[i].min) return BP[i].name;
      }
      return 'xs';
    }

    function getActiveTab() {
      try {
        var tab = document.querySelector(
          '#batch-format-guide .batch-format-tab[aria-selected="true"]'
        );
        if (!tab) return null;
        return tab.getAttribute('data-batch-tab');
      } catch (e) { return null; }
    }

    function restoreActiveTab(tabId) {
      if (!tabId) return;
      try {
        var tab = document.querySelector(
          '#batch-format-guide .batch-format-tab[data-batch-tab="' + tabId + '"]'
        );
        if (!tab) return;
        if (tab.getAttribute('aria-selected') !== 'true') {
          try { tab.click(); } catch (e) {   }
        }
      } catch (e) {   }
    }

    function captureState() {
      var ta = getTextarea();
      if (ta) {
        var denom = Math.max(1, ta.scrollHeight - ta.clientHeight);
        state.savedScrollRatio = ta.scrollTop / denom;
        try {
          state.savedSelection = {
            start: ta.selectionStart,
            end: ta.selectionEnd
          };
        } catch (e) { state.savedSelection = null; }
      } else {
        state.savedScrollRatio = 0;
        state.savedSelection = null;
      }
      state.savedTab = getActiveTab();
    }

    function restoreState() {
      var ta = getTextarea();
      if (ta) {
        try {
          var denom = Math.max(1, ta.scrollHeight - ta.clientHeight);
          ta.scrollTop = Math.round(state.savedScrollRatio * denom);
        } catch (e) {   }
        if (state.savedSelection) {
          try {
            ta.setSelectionRange(
              state.savedSelection.start,
              state.savedSelection.end
            );
          } catch (e) {   }
        }
      }
      restoreActiveTab(state.savedTab);
      rerenderSummary();
    }

    function rerenderSummary() {
      try {
        var SP = BatchSoal.UI && BatchSoal.UI.SummaryPanel;
        var getLast = BatchSoal.UI && BatchSoal.UI._getLastResult;
        var lastResult = (typeof getLast === 'function') ? getLast() : null;
        if (SP && typeof SP.render === 'function' && lastResult) {
          var validArr   = lastResult.valid || [];
          var invalidArr = lastResult.invalid || [];
          var globalArr  = lastResult.globalErrors || [];
          var status;
          if (globalArr.length > 0 && validArr.length === 0) {
            status = 'error';
          } else if (validArr.length > 0 && invalidArr.length > 0) {
            status = 'partial';
          } else if (validArr.length > 0) {
            status = 'valid';
          } else if (invalidArr.length > 0) {
            status = 'error';
          } else {
            status = 'idle';
          }
          SP.render({
            status: status,
            valid: validArr,
            invalid: invalidArr,
            globalErrors: globalArr,
            typeConfig: (BatchSoal.UI && BatchSoal.UI.currentExamTypeConfig) || null,
            existingCounts: (BatchSoal.UI && BatchSoal.UI.currentExamExistingCounts) || null
          });
          return;
        }
      } catch (e) {   }
      try {
        if (BatchSoal.UI && typeof BatchSoal.UI.scheduleParse === 'function') {
          BatchSoal.UI.scheduleParse();
        }
      } catch (e) {   }
    }

    function rafTwice(fn) {
      var raf = root.requestAnimationFrame ||
                function (cb) { return root.setTimeout(cb, 16); };
      raf(function () { raf(function () { try { fn(); } catch (e) { logWarn(e); } }); });
    }

    function performRecompute(force) {
      var current = computeBreakpoint();
      if (!force && current === state.lastBreakpoint) {
        return;
      }
      captureState();
      state.lastBreakpoint = current;
      rafTwice(restoreState);
    }

    function scheduleRecompute() {
      if (state.debounceTimer) {
        root.clearTimeout(state.debounceTimer);
      }
      state.debounceTimer = root.setTimeout(function () {
        state.debounceTimer = null;
        try { performRecompute(false); }
        catch (e) { logWarn('performRecompute gagal:', e); }
      }, DEBOUNCE_MS);
    }

    function onOrientationChange() {
      captureState();
      rafTwice(function () {
        state.lastBreakpoint = computeBreakpoint();
        restoreState();
      });
    }

    function bindResizeListener() {
      var container = getContainer();
      if (root.ResizeObserver && container) {
        try {
          state.observer = new root.ResizeObserver(function () {
            scheduleRecompute();
          });
          state.observer.observe(container);
          return;
        } catch (e) {
          logWarn('ResizeObserver gagal — fallback ke window.resize:', e);
          state.observer = null;
        }
      }
      root.addEventListener('resize', scheduleRecompute, { passive: true });
    }

    function bindOrientation() {
      root.addEventListener('orientationchange', onOrientationChange, { passive: true });
      try {
        if (root.screen && root.screen.orientation &&
            typeof root.screen.orientation.addEventListener === 'function') {
          root.screen.orientation.addEventListener('change', onOrientationChange);
        }
      } catch (e) {   }
    }

    function init() {
      if (state.bound) return;
      state.lastBreakpoint = computeBreakpoint();
      bindResizeListener();
      bindOrientation();
      state.bound = true;
    }

    function recompute() {
      performRecompute(true);
    }

    function getCurrentBreakpoint() {
      return computeBreakpoint();
    }

    BatchSoal.UI.Responsive = {
      init: init,
      recompute: recompute,
      getCurrentBreakpoint: getCurrentBreakpoint
    };
    Object.defineProperty(BatchSoal.UI.Responsive, '__bound', {
      get: function () { return state.bound; },
      enumerable: false
    });

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L13118-L13660 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    function escHtml(s) {
      if (s == null) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function typeLabel(type) {
      var L = (BatchSoal && BatchSoal.TYPE_LABELS) || {};
      return L[type] || (type || '?');
    }

    function typeColor(type) {
      var C = (BatchSoal && BatchSoal.TYPE_COLORS) || {};
      return C[type] || { main: '#64748b', soft: '#f1f5f9' };
    }

    function typeBadgeHtml(type) {
      if (!type) {
        return '<span class="bp-type-badge" style="background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;">?</span>';
      }
      var c = typeColor(type);
      var label = typeLabel(type);
      return '<span class="bp-type-badge" style="background:' + c.soft + ';color:' + c.main + ';">' + escHtml(label) + '</span>';
    }

    function letterFor(idx) {
      return String.fromCharCode(65 + idx);
    }

    function safeJsonParse(s, fallback) {
      try {
        var v = JSON.parse(s);
        return v == null ? fallback : v;
      } catch (e) { return fallback; }
    }

    function formatPoint(n) {
      if (n === Math.floor(n)) return String(n);
      return String(n).replace('.', ',');
    }

    function searchTextOf(item) {
      var parts = [];
      if (item.kind === 'valid') {
        var vq = item.data;
        if (vq.content) parts.push(vq.content);
        if (Array.isArray(vq.options)) {
          for (var i = 0; i < vq.options.length; i++) {
            if (typeof vq.options[i] === 'string') parts.push(vq.options[i]);
          }
        } else if (typeof vq.options === 'string' && vq.options) {
          var arr = safeJsonParse(vq.options, null);
          if (Array.isArray(arr)) {
            for (var j = 0; j < arr.length; j++) {
              var it = arr[j] || {};
              if (it.q) parts.push(String(it.q));
              if (it.a) parts.push(String(it.a));
            }
          }
        }
        if (Array.isArray(vq.keywords)) {
          for (var k = 0; k < vq.keywords.length; k++) parts.push(String(vq.keywords[k]));
        }
      } else {
        var iq = item.data;
        if (iq.snippet) parts.push(iq.snippet);
        if (Array.isArray(iq.errors)) {
          for (var e = 0; e < iq.errors.length; e++) parts.push(String(iq.errors[e] || ''));
        }
      }
      return parts.join(' \n ').toLowerCase();
    }

    function typeOf(item) {
      if (item.kind === 'valid') return item.data.type || null;
      return item.data.detectedType || null;
    }

    function _filterItems(state) {
      var q = (state.search || '').trim().toLowerCase();
      var tab = state.tab || 'all';
      var typeFilter = state.typeFilter || '';
      var out = [];
      for (var i = 0; i < state.items.length; i++) {
        var it = state.items[i];
        if (tab === 'valid' && it.kind !== 'valid') continue;
        if (tab === 'invalid' && it.kind !== 'invalid') continue;
        if (typeFilter) {
          var t = typeOf(it);
          if (t !== typeFilter) continue;
        }
        if (q) {
          if (it._search.indexOf(q) === -1) continue;
        }
        out.push(it);
      }
      return out;
    }

    function _setActiveTab(state, tab) {
      if (tab !== 'all' && tab !== 'valid' && tab !== 'invalid') tab = 'all';
      state.tab = tab;
    }

    function _setActiveTypeFilter(state, type) {
      state.typeFilter = type || '';
    }

    function _applyFilters(state) {
      return _filterItems(state);
    }

    function metaBadgesHtml(vq) {
      var pt = (typeof vq.point === 'number' && isFinite(vq.point)) ? vq.point : 10;
      var html = '<span class="bp-meta-badge">Bobot ' + escHtml(formatPoint(pt)) + '</span>';
      if (vq.isRequired === 'TRUE') {
        html += '<span class="bp-meta-badge req">Wajib</span>';
      } else {
        html += '<span class="bp-meta-badge optional">Opsional</span>';
      }
      if (vq.legacyMode) {
        html += '<span class="bp-meta-badge">PG Lama</span>';
      }
      return html;
    }

    function renderPGOptionsHtml(vq) {
      var opts = Array.isArray(vq.options) ? vq.options : [];
      var correct = String(vq.correct || '').toUpperCase();
      var html = '<ul class="bp-options">';
      for (var i = 0; i < opts.length; i++) {
        var letter = letterFor(i);
        var isCorrect = letter === correct;
        html += '<li' + (isCorrect ? ' class="correct"' : '') + '>'
             +    '<span class="bp-opt-letter">' + letter + '</span>'
             +    '<span>' + escHtml(opts[i]) + '</span>'
             + '</li>';
      }
      html += '</ul>';
      return html;
    }

    function renderPGKompleksOptionsHtml(vq) {
      var opts = Array.isArray(vq.options) ? vq.options : [];
      var correctList = Array.isArray(vq.correctList)
        ? vq.correctList
        : safeJsonParse(vq.correct, []);
      var correctSet = {};
      if (Array.isArray(correctList)) {
        for (var c = 0; c < correctList.length; c++) {
          correctSet[String(correctList[c]).toUpperCase()] = true;
        }
      }
      var html = '<ul class="bp-options">';
      for (var i = 0; i < opts.length; i++) {
        var letter = letterFor(i);
        var isCorrect = !!correctSet[letter];
        html += '<li' + (isCorrect ? ' class="correct"' : '') + '>'
             +    '<span class="bp-opt-letter">' + letter + '</span>'
             +    '<span>' + escHtml(opts[i]) + '</span>'
             + '</li>';
      }
      html += '</ul>';
      return html;
    }

    function renderBSStatementsHtml(vq) {
      var stmts = Array.isArray(vq.options) ? vq.options : [];
      var keyMap = safeJsonParse(vq.correct, {});
      var html = '<ul class="bp-statements">';
      for (var i = 0; i < stmts.length; i++) {
        var t = stmts[i];
        var k = (keyMap && typeof keyMap === 'object') ? keyMap[t] : null;
        var kClass = k === 'Benar' ? 'benar' : (k === 'Salah' ? 'salah' : '');
        var kText = k || '?';
        html += '<li>'
             +    '<span class="bp-stmt-key ' + kClass + '">' + escHtml(kText) + '</span>'
             +    '<span>' + escHtml(t) + '</span>'
             + '</li>';
      }
      html += '</ul>';
      return html;
    }

    function renderJODOHPairsHtml(vq) {
      var arr = (typeof vq.options === 'string')
        ? safeJsonParse(vq.options, [])
        : (Array.isArray(vq.options) ? vq.options : []);
      var html = '<ul class="bp-pairs">';
      for (var i = 0; i < arr.length; i++) {
        var it = arr[i] || {};
        var q = typeof it.q === 'string' ? it.q : '';
        var a = typeof it.a === 'string' ? it.a : '';
        if (q === '') {
          html += '<li class="distractor">'
               +    '<span class="bp-distractor-tag">Pengacoh</span>'
               +    '<span>' + escHtml(a) + '</span>'
               + '</li>';
        } else {
          html += '<li>'
               +    '<span>' + escHtml(q) + '</span>'
               +    '<span class="bp-pair-arrow">⟶</span>'
               +    '<span>' + escHtml(a) + '</span>'
               + '</li>';
        }
      }
      html += '</ul>';
      return html;
    }

    function renderEsaiBodyHtml(vq) {
      var html = '';
      if (Array.isArray(vq.keywords) && vq.keywords.length > 0) {
        html += '<div style="font-size:11px;font-weight:700;color:#64748b;margin-top:8px;">Kata Kunci</div>';
        html += '<div class="bp-keywords">';
        for (var i = 0; i < vq.keywords.length; i++) {
          html += '<span>' + escHtml(vq.keywords[i]) + '</span>';
        }
        html += '</div>';
      }
      if (vq.minCharEnabled) {
        var mc = (typeof vq.minChar === 'number' && isFinite(vq.minChar)) ? vq.minChar : 0;
        html += '<div class="bp-min-char"><i class="fas fa-text-width"></i> Minimal karakter: <b>' + escHtml(String(mc)) + '</b></div>';
      }
      if (vq.rubric) {
        html += '<div style="font-size:12px;color:#475569;margin-top:6px;"><b>Rubrik:</b> ' + escHtml(vq.rubric) + '</div>';
      }
      return html;
    }

    function renderValidCardBody(vq) {
      switch (vq.type) {
        case 'PG': return renderPGOptionsHtml(vq);
        case 'PG_KOMPLEKS': return renderPGKompleksOptionsHtml(vq);
        case 'BS': return renderBSStatementsHtml(vq);
        case 'JODOH': return renderJODOHPairsHtml(vq);
        case 'Esai': return renderEsaiBodyHtml(vq);
        default: return '';
      }
    }

    function _renderCard(item, kind) {
      kind = kind || item.kind;
      if (kind === 'valid') {
        var vq = item.data || item;
        var blockNum = vq.blockNumber != null ? vq.blockNumber : '?';
        var html = '<div class="bp-card">'
                +    '<div class="bp-card-head">'
                +      '<span class="bp-block-num">Blok ' + escHtml(String(blockNum)) + '</span>'
                +      typeBadgeHtml(vq.type)
                +      metaBadgesHtml(vq)
                +    '</div>'
                +    '<div class="bp-content">' + escHtml(vq.content || '') + '</div>'
                +    renderValidCardBody(vq)
                + '</div>';
        return html;
      }
      var iq = item.data || item;
      var bnum = iq.blockNumber != null ? iq.blockNumber : '?';
      var snippet = typeof iq.snippet === 'string' ? iq.snippet : '';
      var errs = Array.isArray(iq.errors) ? iq.errors : [];
      var stripPrefix = new RegExp('^\\s*Blok\\s+' + bnum + '\\s*:\\s*');
      var errHtml = '';
      for (var e = 0; e < errs.length; e++) {
        var msg = String(errs[e] || '').replace(stripPrefix, '');
        errHtml += '<li>' + escHtml(msg) + '</li>';
      }
      var detected = iq.detectedType || null;
      var html2 = '<div class="bp-card invalid">'
               +    '<div class="bp-card-head">'
               +      '<span class="bp-block-num">Blok ' + escHtml(String(bnum)) + '</span>'
               +      typeBadgeHtml(detected)
               +    '</div>'
               +    (snippet ? '<div class="bp-snippet">"' + escHtml(snippet) + '"</div>' : '')
               +    (errHtml ? '<ul class="bp-errors">' + errHtml + '</ul>' : '')
               +    '<button type="button" class="bp-edit-btn" data-edit-block-number="' + escHtml(String(bnum)) + '">'
               +      '<i class="fas fa-pen-to-square"></i> Edit Blok'
               +    '</button>'
               + '</div>';
      return html2;
    }

    function renderBody(state) {
      var body = document.getElementById('batch-preview-body');
      if (!body) return;
      var filtered = _filterItems(state);
      if (filtered.length === 0) {
        body.innerHTML = '<div class="batch-preview-empty">Tidak ada item yang cocok dengan filter aktif.</div>';
        return;
      }
      var html = '';
      for (var i = 0; i < filtered.length; i++) {
        html += _renderCard(filtered[i], filtered[i].kind);
      }
      body.innerHTML = html;
    }

    function updateTabsUi(state) {
      var tabs = document.querySelectorAll('#batch-preview-tabs button[data-tab]');
      for (var i = 0; i < tabs.length; i++) {
        var t = tabs[i];
        var isActive = t.getAttribute('data-tab') === state.tab;
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    }

    function buildModalHtml(state) {
      var counts = state.counts;
      var validCount = counts.valid;
      var invalidCount = counts.invalid;
      var total = counts.all;
      var saveDisabled = validCount === 0;

      var html = '<div class="batch-preview-root">'
              +   '<div class="batch-preview-header">'
              +     '<h2 class="batch-preview-title">'
              +       '<i class="fas fa-eye"></i> Pratinjau Batch Input'
              +     '</h2>'
              +     '<div class="batch-preview-tabs" id="batch-preview-tabs" role="tablist">'
              +       '<button type="button" data-tab="all" role="tab" aria-selected="true">'
              +         'Semua (' + total + ')'
              +       '</button>'
              +       '<button type="button" data-tab="valid" role="tab" aria-selected="false">'
              +         'Valid (' + validCount + ')'
              +       '</button>'
              +       '<button type="button" data-tab="invalid" role="tab" aria-selected="false">'
              +         'Invalid (' + invalidCount + ')'
              +       '</button>'
              +     '</div>'
              +     '<div class="batch-preview-filters">'
              +       '<select id="batch-preview-type-filter" aria-label="Filter per tipe soal">'
              +         '<option value="">Semua Tipe</option>'
              +         '<option value="PG">PG</option>'
              +         '<option value="PG_KOMPLEKS">PG Kompleks</option>'
              +         '<option value="BS">Benar/Salah</option>'
              +         '<option value="JODOH">Menjodohkan</option>'
              +         '<option value="Esai">Esai</option>'
              +       '</select>'
              +       '<input type="search" id="batch-preview-search" placeholder="Cari konten…" aria-label="Cari konten soal" />'
              +     '</div>'
              +   '</div>'
              +   '<div class="batch-preview-body" id="batch-preview-body" role="region" aria-label="Daftar pratinjau soal">'
              +   '</div>'
              +   '<div class="batch-preview-footer">'
              +     '<div class="batch-preview-summary">'
              +       'Ringkasan: '
              +       '<b class="valid">' + validCount + ' valid</b> · '
              +       '<b class="invalid">' + invalidCount + ' invalid</b> · '
              +       '<b>' + total + ' total</b>'
              +     '</div>'
              +     '<div class="batch-preview-actions">'
              +       '<button type="button" id="batch-preview-close" class="btn-close">'
              +         '<i class="fas fa-xmark"></i> Tutup'
              +       '</button>'
              +       '<button type="button" id="batch-preview-save" class="btn-save"'
              +         (saveDisabled ? ' disabled' : '') + '>'
              +         '<i class="fas fa-save"></i> Simpan Soal Valid (' + validCount + ')'
              +       '</button>'
              +     '</div>'
              +   '</div>'
              + '</div>';
      return html;
    }

    function open(validationResult, options) {
      options = options || {};

      try {
        if (typeof root.Swal !== 'undefined' && Swal.isVisible &&
            Swal.isVisible() && Swal.getPopup &&
            Swal.getPopup() &&
            Swal.getPopup().classList.contains('lp-batch-preview')) {
          Swal.close();
        }
      } catch (e) {   }

      var validArr = (validationResult && Array.isArray(validationResult.valid))
        ? validationResult.valid : [];
      var invalidArr = (validationResult && Array.isArray(validationResult.invalid))
        ? validationResult.invalid : [];

      var items = [];
      for (var i = 0; i < validArr.length; i++) {
        var v = validArr[i];
        var vi = { kind: 'valid', data: v, _search: '' };
        vi._search = searchTextOf(vi);
        items.push(vi);
      }
      for (var j = 0; j < invalidArr.length; j++) {
        var inv = invalidArr[j];
        var ii = { kind: 'invalid', data: inv, _search: '' };
        ii._search = searchTextOf(ii);
        items.push(ii);
      }

      var state = {
        items: items,
        counts: {
          all: items.length,
          valid: validArr.length,
          invalid: invalidArr.length
        },
        tab: 'all',
        typeFilter: '',
        search: '',
        _searchDebounce: null
      };

      if (typeof root.Swal === 'undefined') {
        if (typeof console !== 'undefined') {
          console.warn('[BatchSoal.UI.PreviewModal] SweetAlert2 tidak tersedia.');
        }
        return Promise.resolve({ action: 'close' });
      }

      return new Promise(function (resolve) {
        var resolved = false;
        function safeResolve(payload) {
          if (resolved) return;
          resolved = true;
          try { resolve(payload); } catch (e) {   }
        }

        Swal.fire({
          html: buildModalHtml(state),
          width: '95%',
          padding: 0,
          showConfirmButton: false,
          showCloseButton: true,
          showCancelButton: false,
          allowOutsideClick: true,
          allowEscapeKey: true,
          customClass: { popup: 'lp-swal lp-batch-preview' },
          didOpen: function () {
            renderBody(state);
            updateTabsUi(state);

            var tabs = document.querySelectorAll('#batch-preview-tabs button[data-tab]');
            for (var t = 0; t < tabs.length; t++) {
              tabs[t].addEventListener('click', function (ev) {
                var tab = ev.currentTarget.getAttribute('data-tab');
                _setActiveTab(state, tab);
                updateTabsUi(state);
                renderBody(state);
              });
            }

            var sel = document.getElementById('batch-preview-type-filter');
            if (sel) {
              sel.addEventListener('change', function (ev) {
                _setActiveTypeFilter(state, ev.currentTarget.value || '');
                renderBody(state);
              });
            }

            var searchInput = document.getElementById('batch-preview-search');
            if (searchInput) {
              searchInput.addEventListener('input', function (ev) {
                var v = ev.currentTarget.value || '';
                if (state._searchDebounce != null) {
                  clearTimeout(state._searchDebounce);
                }
                state._searchDebounce = setTimeout(function () {
                  state._searchDebounce = null;
                  state.search = v;
                  renderBody(state);
                }, 200);
              });
            }

            var body = document.getElementById('batch-preview-body');
            if (body) {
              body.addEventListener('click', function (ev) {
                var btn = ev.target && ev.target.closest
                  ? ev.target.closest('[data-edit-block-number]')
                  : null;
                if (!btn) return;
                ev.preventDefault();
                var raw = btn.getAttribute('data-edit-block-number');
                var n = parseInt(raw, 10);
                if (!isFinite(n)) n = null;
                safeResolve({ action: 'edit', editBlockNumber: n });
                try { Swal.close(); } catch (e) {   }
              });
            }

            var closeBtn = document.getElementById('batch-preview-close');
            if (closeBtn) {
              closeBtn.addEventListener('click', function () {
                safeResolve({ action: 'close' });
                try { Swal.close(); } catch (e) {   }
              });
            }
            var saveBtn = document.getElementById('batch-preview-save');
            if (saveBtn) {
              saveBtn.addEventListener('click', function () {
                if (saveBtn.disabled) return;
                safeResolve({ action: 'save' });
                try { Swal.close(); } catch (e) {   }
              });
            }
          },
          willClose: function () {
            if (state._searchDebounce != null) {
              try { clearTimeout(state._searchDebounce); } catch (e) {}
              state._searchDebounce = null;
            }
          }
        }).then(function () {
          safeResolve({ action: 'close' });
        }, function () {
          safeResolve({ action: 'close' });
        });
      });
    }

    BatchSoal.UI.PreviewModal = {
      open: open,
      _renderCard: _renderCard,
      _filterItems: _filterItems,
      _setActiveTab: _setActiveTab,
      _setActiveTypeFilter: _setActiveTypeFilter,
      _applyFilters: _applyFilters
    };

    BatchSoal.UI.openPreview = function (validationResult, options) {
      return BatchSoal.UI.PreviewModal.open(validationResult, options);
    };

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L13662-L13926 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    var initialized = false;
    var HIGHLIGHT_MS = 1500;

    function el(id) { return document.getElementById(id); }
    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.PreviewWiring]'].concat(args));
      } catch (e) {   }
    }

    function deriveResultState(validation) {
      var v = (validation && validation.valid) ? validation.valid.length : 0;
      var i = (validation && validation.invalid) ? validation.invalid.length : 0;
      var ge = (validation && validation.globalErrors) ? validation.globalErrors.length : 0;
      if (ge > 0) return 'result_invalid';
      if (v === 0 && i === 0) return 'idle';
      if (v > 0 && i === 0) return 'result_valid';
      if (v > 0 && i > 0) return 'result_partial';
      return 'result_invalid';
    }

    function setFsm(stateName) {
      try {
        if (typeof BatchSoal.UI._setState === 'function') {
          BatchSoal.UI._setState(stateName);
        }
      } catch (e) {   }
    }

    function injectCss() {
      if (document.getElementById('batch-preview-wiring-style')) return;
      var head = document.head || document.getElementsByTagName('head')[0];
      if (!head) return;
      var s = document.createElement('style');
      s.id = 'batch-preview-wiring-style';
      s.textContent = [
        '#batch-input-text.batch-jump-highlight {',
        '  animation: batch-jump-pulse 1.4s ease-out 1;',
        '  outline: 2px solid #f59e0b;',
        '  outline-offset: 2px;',
        '  border-radius: 4px;',
        '}',
        '@keyframes batch-jump-pulse {',
        '  0%   { outline-color: rgba(245, 158, 11, 1);   box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.45); }',
        '  60%  { outline-color: rgba(245, 158, 11, 0.6); box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.10); }',
        '  100% { outline-color: rgba(245, 158, 11, 0);   box-shadow: 0 0 0 0   rgba(245, 158, 11, 0);    }',
        '}',
        '@media (prefers-reduced-motion: reduce) {',
        '  #batch-input-text.batch-jump-highlight {',
        '    animation: none;',
        '    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.45);',
        '  }',
        '}'
      ].join('\n');
      try { head.appendChild(s); } catch (e) {   }
    }

    function blockOffsetForNumber(text, n) {
      if (typeof text !== 'string' || text === '') return null;
      var nn = parseInt(n, 10);
      if (!isFinite(nn) || nn < 1) return null;

      var len = text.length;
      var pos = 0;
      var blockNum = 0;
      var inBlock = false;
      var blockStart = -1;
      var prevLineEnd = -1;

      while (pos <= len) {
        var nlIdx = text.indexOf('\n', pos);
        var lineEnd = (nlIdx === -1) ? len : nlIdx;
        var contentEnd = (lineEnd > pos && text.charAt(lineEnd - 1) === '\r')
          ? lineEnd - 1 : lineEnd;
        var line = text.substring(pos, contentEnd);
        var isBlank = line.replace(/\s+/g, '') === '';

        if (!inBlock && !isBlank) {
          inBlock = true;
          blockNum++;
          blockStart = pos;
          prevLineEnd = contentEnd;
          if (blockNum > nn) {
            return null;
          }
        } else if (inBlock) {
          if (isBlank) {
            if (blockNum === nn) {
              return { startIndex: blockStart, endIndex: prevLineEnd };
            }
            inBlock = false;
            blockStart = -1;
            prevLineEnd = -1;
          } else {
            prevLineEnd = contentEnd;
          }
        }

        if (nlIdx === -1) break;
        pos = nlIdx + 1;
      }

      if (inBlock && blockNum === nn && blockStart >= 0) {
        return { startIndex: blockStart, endIndex: (prevLineEnd >= 0 ? prevLineEnd : len) };
      }
      return null;
    }

    function jumpToBlock(blockNumber) {
      var ta = (BatchSoal.UI && BatchSoal.UI.SmartTextarea &&
                typeof BatchSoal.UI.SmartTextarea.getTextarea === 'function')
        ? BatchSoal.UI.SmartTextarea.getTextarea()
        : el('batch-input-text');
      if (!ta) return;

      try { ta.focus({ preventScroll: true }); }
      catch (e1) { try { ta.focus(); } catch (e2) {   } }

      var n = parseInt(blockNumber, 10);
      if (!isFinite(n) || n < 1) {
        return;
      }

      var text = ta.value || '';
      var offsets = blockOffsetForNumber(text, n);
      if (!offsets) {
        return;
      }

      var startIdx = offsets.startIndex;

      try {
        if (typeof ta.setSelectionRange === 'function') {
          ta.setSelectionRange(startIdx, startIdx);
        } else {
          ta.selectionStart = startIdx;
          ta.selectionEnd = startIdx;
        }
      } catch (e) {   }

      var lineNum = 0;
      for (var i = 0; i < startIdx; i++) {
        if (text.charCodeAt(i) === 10  ) lineNum++;
      }
      var totalLines = 1;
      for (var j = 0; j < text.length; j++) {
        if (text.charCodeAt(j) === 10) totalLines++;
      }

      var clientHeight = ta.clientHeight || 0;
      var scrollHeight = ta.scrollHeight || 0;
      var approxLineHeight = (totalLines > 0 && scrollHeight > 0)
        ? (scrollHeight / totalLines) : 19.5;
      if (!isFinite(approxLineHeight) || approxLineHeight <= 0) approxLineHeight = 19.5;

      var targetTop = Math.max(
        0,
        (lineNum * approxLineHeight) - (clientHeight * 0.33)
      );
      try { ta.scrollTop = targetTop; } catch (e) {   }

      try {
        ta.classList.remove('batch-jump-highlight');
        void ta.offsetWidth;
        ta.classList.add('batch-jump-highlight');
        root.setTimeout(function () {
          try { ta.classList.remove('batch-jump-highlight'); }
          catch (e) {   }
        }, HIGHLIGHT_MS);
      } catch (e) {   }
    }

    function openFromActionBar() {
      var getLast = BatchSoal.UI && BatchSoal.UI._getLastResult;
      var lastResult = (typeof getLast === 'function') ? getLast() : null;
      if (!lastResult) {
        logWarn('Pratinjau diminta tetapi belum ada hasil validasi.');
        return;
      }

      setFsm('previewing');

      var openFn = BatchSoal.UI && BatchSoal.UI.openPreview;
      if (typeof openFn !== 'function') {
        logWarn('BatchSoal.UI.openPreview tidak tersedia.');
        setFsm(deriveResultState(lastResult));
        return;
      }

      var promise;
      try { promise = openFn(lastResult); }
      catch (e) {
        logWarn('openPreview melempar exception:', e);
        setFsm(deriveResultState(lastResult));
        return;
      }
      if (!promise || typeof promise.then !== 'function') {
        setFsm(deriveResultState(lastResult));
        return;
      }

      promise.then(function (resp) {
        var action = (resp && resp.action) || 'close';
        if (action === 'edit') {
          setFsm(deriveResultState(lastResult));
          jumpToBlock(resp && resp.editBlockNumber);
        } else if (action === 'save') {
          try {
            if (typeof BatchSoal.UI.triggerSaveFlow === 'function') {
              BatchSoal.UI.triggerSaveFlow(lastResult);
            } else {
              setFsm('confirming');
              var sBtn = el('btn-batch-save');
              if (sBtn && !sBtn.disabled && typeof sBtn.click === 'function') {
                sBtn.click();
              } else {
                setFsm(deriveResultState(lastResult));
              }
            }
          } catch (e) {
            logWarn('Gagal memicu alur simpan dari Preview:', e);
            setFsm(deriveResultState(lastResult));
          }
        } else {
          setFsm(deriveResultState(lastResult));
        }
      }, function (err) {
        logWarn('Promise modal pratinjau ditolak:', err);
        setFsm(deriveResultState(lastResult));
      });
    }

    function init() {
      injectCss();
      if (initialized) return;
      try {
        var AB = BatchSoal.UI && BatchSoal.UI.ActionBar;
        if (AB && typeof AB.onPreview === 'function') {
          AB.onPreview(openFromActionBar);
        }
      } catch (e) { logWarn('Gagal mendaftarkan onPreview:', e); }
      initialized = true;
    }

    BatchSoal.UI.PreviewWiring = {
      init: init,
      openFromActionBar: openFromActionBar,
      jumpToBlock: jumpToBlock,
      _blockOffsetForNumber: blockOffsetForNumber,
      _deriveResultState: deriveResultState,
      _resetInit: function () { initialized = false; }
    };

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L13928-L13991 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    if (typeof BatchSoal.UI.triggerSaveFlow === 'function') return;

    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.triggerSaveFlow]'].concat(args));
      } catch (e) {   }
    }

    function setFsm(stateName) {
      try {
        if (typeof BatchSoal.UI._setState === 'function') {
          BatchSoal.UI._setState(stateName);
        }
      } catch (e) {   }
    }

    function triggerSaveFlow(validationResult) {
      setFsm('confirming');

      try {
        var AB = BatchSoal.UI && BatchSoal.UI.ActionBar;
        if (AB && typeof AB.invokeSave === 'function') {
          AB.invokeSave(validationResult);
          return;
        }
      } catch (e) {
        logWarn('ActionBar.invokeSave melempar exception:', e);
      }

      try {
        if (typeof root.processBatchInput === 'function') {
          root.processBatchInput();
          return;
        }
      } catch (e) {
        logWarn('processBatchInput melempar exception:', e);
      }

      try {
        var btn = document.getElementById('btn-batch-save');
        if (btn && !btn.disabled && typeof btn.click === 'function') {
          btn.click();
          return;
        }
      } catch (e) {
        logWarn('Gagal mensintesiskan klik #btn-batch-save:', e);
      }

      logWarn('Tidak ada handler save yang dapat dipanggil.');
    }

    BatchSoal.UI.triggerSaveFlow = triggerSaveFlow;
    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L13993-L14309 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    if (BatchSoal.UI.ConfirmSave && typeof BatchSoal.UI.ConfirmSave.open === 'function') {
      return;
    }

    var TYPE_ORDER = ['PG', 'PG_KOMPLEKS', 'BS', 'JODOH', 'Esai'];
    var QUOTA_WARNING_THRESHOLD = 0.9;
    var STYLE_TAG_ID = 'batch-confirm-save-style';

    function escHtml(s) {
      if (s === null || s === undefined) return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function typeLabel(type) {
      var L = (BatchSoal && BatchSoal.TYPE_LABELS) || {};
      return L[type] || type;
    }

    function typeColor(type) {
      var C = (BatchSoal && BatchSoal.TYPE_COLORS) || {};
      return C[type] || { main: '#64748b', soft: '#f1f5f9' };
    }

    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.ConfirmSave]'].concat(args));
      } catch (e) {   }
    }

    function injectStyleOnce() {
      if (typeof document === 'undefined') return;
      if (document.getElementById(STYLE_TAG_ID)) return;
      var style = document.createElement('style');
      style.id = STYLE_TAG_ID;
      style.textContent = [
        '.swal2-popup.lp-batch-confirm { padding: 0 !important; border-radius: 16px !important; max-width: 520px !important; width: 95vw !important; }',
        '.lp-batch-confirm .swal2-html-container { margin: 0 !important; padding: 0 !important; text-align: left !important; }',
        '.lp-batch-confirm .batch-confirm-root { padding: 20px 22px 8px; font-family: inherit; color: #1e293b; }',
        '.lp-batch-confirm .batch-confirm-headline { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }',
        '.lp-batch-confirm .batch-confirm-valid { font-size: 36px; font-weight: 900; color: #16a34a; line-height: 1; letter-spacing: -0.02em; }',
        '.lp-batch-confirm .batch-confirm-headline > span:last-child { font-size: 14px; font-weight: 600; color: #334155; }',
        '.lp-batch-confirm .batch-confirm-sub { font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }',
        '.lp-batch-confirm .batch-confirm-sub.has-invalid { color: #b91c1c; }',
        '.lp-batch-confirm .batch-confirm-sub i { font-size: 11px; }',
        '.lp-batch-confirm .batch-confirm-breakdown { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }',
        '.lp-batch-confirm .batch-confirm-row { display: grid; grid-template-columns: 110px 1fr auto; gap: 10px; align-items: center; font-size: 12px; }',
        '.lp-batch-confirm .batch-confirm-row .bc-label { display: flex; align-items: center; gap: 6px; font-weight: 700; color: #334155; }',
        '.lp-batch-confirm .batch-confirm-row .bc-dot { width: 10px; height: 10px; border-radius: 999px; flex: 0 0 auto; }',
        '.lp-batch-confirm .batch-confirm-row .bc-bar-track { position: relative; height: 8px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }',
        '.lp-batch-confirm .batch-confirm-row .bc-bar-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; transition: width 0.2s ease; }',
        '.lp-batch-confirm .batch-confirm-row.warn .bc-bar-fill { background: #f59e0b !important; }',
        '.lp-batch-confirm .batch-confirm-row .bc-meta { font-size: 11px; font-weight: 600; color: #475569; white-space: nowrap; }',
        '.lp-batch-confirm .batch-confirm-row.warn .bc-meta { color: #b45309; }',
        '.lp-batch-confirm .batch-confirm-quota-warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; border-radius: 10px; padding: 10px 12px; font-size: 12px; font-weight: 600; display: flex; gap: 8px; align-items: flex-start; margin-bottom: 4px; }',
        '.lp-batch-confirm .batch-confirm-quota-warning i { color: #d97706; margin-top: 2px; }',
        '.lp-batch-confirm .batch-confirm-quota-warning ul { list-style: disc; margin: 4px 0 0 18px; padding: 0; font-weight: 500; color: #78350f; }',
        '.lp-batch-confirm .swal2-actions { margin: 12px 22px 18px !important; gap: 8px; }',
        '.lp-batch-confirm .swal2-confirm.bc-btn-confirm { background: #16a34a !important; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3) !important; padding: 10px 18px !important; font-weight: 700 !important; border-radius: 10px !important; }',
        '.lp-batch-confirm .swal2-confirm.bc-btn-confirm:hover { background: #15803d !important; }',
        '.lp-batch-confirm .swal2-cancel.bc-btn-cancel { background: #f1f5f9 !important; color: #475569 !important; border: 1px solid #e2e8f0 !important; padding: 10px 18px !important; font-weight: 700 !important; border-radius: 10px !important; }',
        '.lp-batch-confirm .swal2-cancel.bc-btn-cancel:hover { background: #e2e8f0 !important; }'
      ].join('\n');
      document.head.appendChild(style);
    }

    function isExamSelected() {
      try {
        var sel = document.getElementById('select-exam-q');
        if (sel && sel.value && String(sel.value).trim() !== '') return true;
      } catch (e) {   }
      try {
        if (BatchSoal.UI && BatchSoal.UI.currentExamId &&
            String(BatchSoal.UI.currentExamId).trim() !== '') {
          return true;
        }
      } catch (e) {   }
      return false;
    }

    function computeBreakdown(validationResult) {
      var byType = { PG: 0, PG_KOMPLEKS: 0, BS: 0, JODOH: 0, Esai: 0 };
      var total = 0;
      if (!validationResult || !validationResult.valid ||
          typeof validationResult.valid.length !== 'number') {
        return { byType: byType, total: 0 };
      }
      var arr = validationResult.valid;
      for (var i = 0; i < arr.length; i++) {
        var t = arr[i] && arr[i].type;
        if (byType.hasOwnProperty(t)) {
          byType[t] = byType[t] + 1;
          total += 1;
        }
      }
      return { byType: byType, total: total };
    }

    function resolveExistingCount(type, examTypeConfig) {
      // Sumber utama: hitungan soal eksisting yang dimuat orchestrator dari
      // backend (getQuestionsByExam) — akurat dan tidak bergantung variabel global.
      try {
        var ec = BatchSoal.UI && BatchSoal.UI.currentExamExistingCounts;
        if (ec && typeof ec[type] === 'number') {
          return ec[type];
        }
      } catch (e) {   }
      // Fallback lama: properti existing pada config (jika ada).
      try {
        if (examTypeConfig && examTypeConfig.existing &&
            typeof examTypeConfig.existing[type] === 'number') {
          return examTypeConfig.existing[type];
        }
      } catch (e) {   }
      // Fallback terakhir: data soal global (jika tersedia di window).
      try {
        var aqd = root.allQuestionsData;
        if (aqd && aqd.length) {
          var n = 0;
          for (var i = 0; i < aqd.length; i++) {
            var q = aqd[i];
            if (q && q.type === type) n += 1;
          }
          return n;
        }
      } catch (e) {   }
      return 0;
    }

    function buildHtml(state) {
      state = state || {};
      var validCount = parseInt(state.validCount, 10) || 0;
      var invalidCount = parseInt(state.invalidCount, 10) || 0;
      var byType = state.byType || {};
      var cfg = state.examTypeConfig || null;

      var headline = '<div class="batch-confirm-headline">' +
        '<span class="batch-confirm-valid">' + escHtml(validCount) + '</span>' +
        '<span>Soal Valid akan disimpan</span>' +
        '</div>';

      var subClass = invalidCount > 0 ? 'batch-confirm-sub has-invalid' : 'batch-confirm-sub';
      var subText = invalidCount > 0
        ? ('<i class="fas fa-triangle-exclamation"></i>' +
           escHtml(invalidCount) + ' Soal_Invalid akan dilewati dan tidak dikirim ke server.')
        : '<i class="fas fa-circle-check"></i>Tidak ada Soal_Invalid pada hasil validasi.';
      var sub = '<div class="' + subClass + '" data-invalid-count="' +
        escHtml(invalidCount) + '">' + subText + '</div>';

      var rows = [];
      var quotaWarnings = [];
      for (var i = 0; i < TYPE_ORDER.length; i++) {
        var t = TYPE_ORDER[i];
        var batch = parseInt(byType[t], 10) || 0;
        if (batch <= 0) continue;

        var color = typeColor(t);
        var label = typeLabel(t);

        var max = 0;
        var existing = 0;
        var hasCfg = false;
        if (cfg && cfg[t] && typeof cfg[t].max === 'number' && cfg[t].max > 0) {
          max = cfg[t].max;
          existing = resolveExistingCount(t, cfg);
          hasCfg = true;
        }

        var projected = existing + batch;
        var ratio = max > 0 ? (projected / max) : 0;
        var isWarn = hasCfg && ratio >= QUOTA_WARNING_THRESHOLD;
        // Bila ada kuota: bar = proyeksi/maks. Bila tanpa kuota (tak terbatas):
        // tampilkan proporsi tipe ini terhadap total soal batch agar bar tetap
        // bermakna (bukan selalu 100%).
        var pctFill;
        if (hasCfg) {
          pctFill = Math.max(0, Math.min(100, Math.round(ratio * 100)));
        } else {
          var share = validCount > 0 ? (batch / validCount) : 0;
          pctFill = Math.max(8, Math.min(100, Math.round(share * 100)));
        }

        var meta;
        if (hasCfg) {
          meta = '+' + batch + ' (total: ' + projected + '/' + max + ')';
        } else {
          meta = '+' + batch + ' soal';
        }

        var rowClass = isWarn ? 'batch-confirm-row warn' : 'batch-confirm-row';
        var fillStyle = 'width: ' + pctFill + '%; background: ' + color.main + ';';
        rows.push(
          '<div class="' + rowClass + '" data-type="' + escHtml(t) + '">' +
            '<div class="bc-label">' +
              '<span class="bc-dot" style="background: ' + color.main + ';"></span>' +
              '<span>' + escHtml(label) + '</span>' +
            '</div>' +
            '<div class="bc-bar-track" aria-hidden="true">' +
              '<div class="bc-bar-fill" style="' + fillStyle + '"></div>' +
            '</div>' +
            '<div class="bc-meta">' + escHtml(meta) + '</div>' +
          '</div>'
        );

        if (isWarn) {
          quotaWarnings.push(
            '<li><b>' + escHtml(label) + '</b>: kuota akan terisi ' +
            projected + '/' + max + ' (≥90%).</li>'
          );
        }
      }

      var breakdown = rows.length > 0
        ? ('<div class="batch-confirm-breakdown">' + rows.join('') + '</div>')
        : '';

      var quotaWarning = quotaWarnings.length > 0
        ? ('<div class="batch-confirm-quota-warning">' +
            '<i class="fas fa-triangle-exclamation"></i>' +
            '<div>' +
              '<div>Peringatan kuota hampir penuh:</div>' +
              '<ul>' + quotaWarnings.join('') + '</ul>' +
            '</div>' +
          '</div>')
        : '';

      return '<div class="batch-confirm-root">' +
        headline + sub + breakdown + quotaWarning +
        '</div>';
    }

    function open(validationResult, examTypeConfig, options) {
      options = options || {};
      injectStyleOnce();

      var Swal = root.Swal;
      if (!Swal || typeof Swal.fire !== 'function') {
        logWarn('SweetAlert2 (Swal) tidak tersedia.');
        return Promise.resolve(false);
      }

      if (!isExamSelected()) {
        return Swal.fire({
          icon: 'warning',
          title: 'Pilih ujian terlebih dahulu',
          html: '<p style="font-size:13px;color:#475569;">' +
                'Anda harus memilih <b>Mata Pelajaran</b> tujuan pada dropdown ' +
                'di atas sebelum menyimpan soal batch.</p>',
          confirmButtonText: 'Mengerti',
          confirmButtonColor: '#2563eb',
          customClass: { popup: 'lp-swal' }
        }).then(function () { return false; });
      }

      var breakdown = computeBreakdown(validationResult);
      var validCount = breakdown.total;
      var invalidCount = (validationResult && validationResult.invalid &&
                         typeof validationResult.invalid.length === 'number')
        ? validationResult.invalid.length
        : 0;

      var html = buildHtml({
        validCount: validCount,
        invalidCount: invalidCount,
        byType: breakdown.byType,
        examTypeConfig: examTypeConfig || null
      });

      return Swal.fire({
        title: 'Konfirmasi Simpan Batch',
        html: html,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Simpan ' + validCount + ' Soal',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        focusConfirm: false,
        allowOutsideClick: true,
        allowEscapeKey: true,
        customClass: {
          popup: 'lp-batch-confirm',
          confirmButton: 'bc-btn-confirm',
          cancelButton: 'bc-btn-cancel'
        }
      }).then(function (res) {
        return !!(res && res.isConfirmed);
      }).catch(function (err) {
        logWarn('SweetAlert2 error:', err);
        return false;
      });
    }

    BatchSoal.UI.ConfirmSave = {
      open: open,
      computeBreakdown: computeBreakdown,
      buildHtml: buildHtml,
      isExamSelected: isExamSelected
    };

    BatchSoal.UI.confirmSave = open;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L14311-L14507 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    if (BatchSoal.UI.SaveSubmit && typeof BatchSoal.UI.SaveSubmit.submit === 'function') {
      return;
    }

    var TIMEOUT_MS = 30000;

    var STRIP_FIELDS = ['blockNumber', 'snippet', '_search', 'legacyMode', 'summary'];

    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.SaveSubmit]'].concat(args));
      } catch (e) {   }
    }

    function safeCallActionBar(method, arg) {
      try {
        var AB = BatchSoal.UI && BatchSoal.UI.ActionBar;
        if (AB && typeof AB[method] === 'function') {
          AB[method](arg);
        }
      } catch (e) {   }
    }

    function sanitizeQuestion(q) {
      if (!q || typeof q !== 'object') return q;
      var out = {};
      for (var k in q) {
        if (!Object.prototype.hasOwnProperty.call(q, k)) continue;
        if (STRIP_FIELDS.indexOf(k) !== -1) continue;
        out[k] = q[k];
      }
      return out;
    }

    function resolveExamId(optionsExamId) {
      if (optionsExamId && String(optionsExamId).trim() !== '') {
        return String(optionsExamId).trim();
      }
      try {
        var sel = document.getElementById('select-exam-q');
        if (sel && sel.value && String(sel.value).trim() !== '') {
          return String(sel.value).trim();
        }
      } catch (e) {   }
      try {
        if (BatchSoal.UI && BatchSoal.UI.currentExamId) {
          var v = String(BatchSoal.UI.currentExamId).trim();
          if (v !== '') return v;
        }
      } catch (e) {   }
      return null;
    }

    function resolveAuth() {
      var u = root.currentUser || null;
      if (!u || !u.userID || !u.token) return null;
      return { id: String(u.userID), token: String(u.token) };
    }

    function submit(validationResult, options) {
      options = options || {};

      return new Promise(function (resolve) {
        var resolved = false;
        var timeoutId = null;
        var nudgeId = null;

        function clearNudge() {
          if (nudgeId) {
            try { clearInterval(nudgeId); } catch (e) {   }
            nudgeId = null;
          }
        }

        function safeResolve(payload) {
          if (resolved) return;
          resolved = true;
          if (timeoutId) {
            try { clearTimeout(timeoutId); } catch (e) {   }
            timeoutId = null;
          }
          clearNudge();
          safeCallActionBar('setEnabled', { reset: true });
          resolve(payload);
        }

        var validQuestions = (validationResult && Array.isArray(validationResult.valid))
          ? validationResult.valid : [];
        if (validQuestions.length === 0) {
          safeResolve({
            ok: false,
            code: 'NO_VALID',
            message: 'Tidak ada Soal_Valid untuk dikirim.'
          });
          return;
        }

        var payload = [];
        for (var i = 0; i < validQuestions.length; i++) {
          payload.push(sanitizeQuestion(validQuestions[i]));
        }

        var auth = resolveAuth();
        if (!auth) {
          safeResolve({
            ok: false,
            code: 'NO_AUTH',
            message: 'Sesi pengguna tidak valid.'
          });
          return;
        }

        var examID = resolveExamId(options.examID);
        if (!examID) {
          safeResolve({
            ok: false,
            code: 'NO_EXAM',
            message: 'Ujian target belum dipilih.'
          });
          return;
        }

        safeCallActionBar('setEnabled', { save: false, preview: false, reset: false });
        safeCallActionBar('setMode', 'saving');
        safeCallActionBar('setProgress', 15);

        try {
          var pct = 15;
          nudgeId = setInterval(function () {
            if (resolved) { clearNudge(); return; }
            if (pct < 60) {
              pct += 5;
              safeCallActionBar('setProgress', pct);
            } else {
              clearNudge();
            }
          }, 800);
        } catch (e) { nudgeId = null; }

        timeoutId = setTimeout(function () {
          safeResolve({
            ok: false,
            code: 'TIMEOUT',
            message: 'Permintaan melewati batas 30 detik.'
          });
        }, TIMEOUT_MS);

        if (!root.google || !root.google.script || !root.google.script.run) {
          safeResolve({
            ok: false,
            code: 'NO_GAS',
            message: 'google.script.run tidak tersedia di lingkungan ini.'
          });
          return;
        }

        try {
          root.google.script.run
            .withSuccessHandler(function (resp) {
              safeResolve(resp);
            })
            .withFailureHandler(function (err) {
              var msg = '';
              try { msg = String(err && err.message ? err.message : err); }
              catch (e) { msg = String(err); }
              safeResolve({ ok: false, code: 'EXCEPTION', message: msg });
            })
            .saveBatchQuestions(examID, payload, auth.id, auth.token);
        } catch (e) {
          var emsg = '';
          try { emsg = String(e && e.message ? e.message : e); }
          catch (ee) { emsg = String(e); }
          logWarn('saveBatchQuestions melempar exception sinkronis:', emsg);
          safeResolve({ ok: false, code: 'EXCEPTION', message: emsg });
        }
      });
    }

    BatchSoal.UI.SaveSubmit = {
      submit: submit,
      TIMEOUT_MS: TIMEOUT_MS
    };

    BatchSoal.UI.submitBatch = submit;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L14509-L14602 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    if (BatchSoal.UI.RoleGate && typeof BatchSoal.UI.RoleGate.enforce === 'function') {
      return;
    }

    var ROLES_ALLOWED = ['Admin', 'Guru'];
    var enforced = false;

    function dbg() {
      if (typeof console === 'undefined' || !console.debug) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.debug.apply(console, ['[BatchSoal.UI.RoleGate]'].concat(args));
      } catch (e) {   }
    }

    function isAuthorized() {
      var u = root.currentUser || {};
      var role = u && u.role ? String(u.role) : '';
      for (var i = 0; i < ROLES_ALLOWED.length; i++) {
        if (role === ROLES_ALLOWED[i]) return true;
      }
      return false;
    }

    function enforce() {
      if (isAuthorized()) {
        return;
      }
      if (enforced) return;

      try {
        var form = document.getElementById('form-batch-q');
        if (form && form.parentNode) {
          form.parentNode.removeChild(form);
          dbg('Formulir #form-batch-q dihapus dari DOM.');
        }

        var selectors = [
          'button[onclick*="_qbShowForm(\'batch\')"]',
          'button[onclick*="_qbShowForm(\\"batch\\")"]',
          'button[onclick*="showBatchForm"]',
          '[data-tab="batch"]'
        ];
        var removedSet = (typeof Set === 'function') ? new Set() : null;
        for (var i = 0; i < selectors.length; i++) {
          var nodes;
          try { nodes = document.querySelectorAll(selectors[i]); }
          catch (e) { nodes = []; }
          for (var j = 0; j < nodes.length; j++) {
            var btn = nodes[j];
            if (!btn || (removedSet && removedSet.has(btn))) continue;
            if (btn.parentNode) {
              btn.parentNode.removeChild(btn);
              if (removedSet) removedSet.add(btn);
              dbg('Tombol pemicu Batch dihapus.', selectors[i]);
            }
          }
        }

        enforced = true;
      } catch (e) {
        dbg('enforce() error:', e);
      }
    }

    function _resetForRender() { enforced = false; }

    BatchSoal.UI.RoleGate = {
      isAuthorized: isAuthorized,
      enforce: enforce,
      ROLES_ALLOWED: ROLES_ALLOWED.slice(),
      _resetForRender: _resetForRender
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        try { enforce(); } catch (e) { dbg('DOMContentLoaded enforce error:', e); }
      }, { once: true });
    } else {
      window.setTimeout(function () {
        try { enforce(); } catch (e) { dbg('Deferred enforce error:', e); }
      }, 0);
    }

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L14604-L15056 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    if (BatchSoal.UI.SaveResponse && typeof BatchSoal.UI.SaveResponse.handle === 'function') {
      return;
    }

    var TYPE_LABEL = {
      PG: 'Pilihan Ganda',
      PG_KOMPLEKS: 'PG Kompleks',
      BS: 'Benar/Salah',
      JODOH: 'Menjodohkan',
      Esai: 'Esai'
    };

    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.SaveResponse]'].concat(args));
      } catch (e) {   }
    }

    function escapeHtml(s) {
      if (s === null || typeof s === 'undefined') return '';
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function safeCallActionBar(method, arg) {
      try {
        var AB = BatchSoal.UI && BatchSoal.UI.ActionBar;
        if (AB && typeof AB[method] === 'function') {
          AB[method](arg);
        }
      } catch (e) {   }
    }

    function reEnableButtons() {
      safeCallActionBar('setEnabled', { preview: true, save: true, reset: true });
      safeCallActionBar('setProgress', 0);
    }

    function reloadQuestionsTable(examID) {
      try {
        if (examID && typeof root.loadQuestionsTable === 'function') {
          root.loadQuestionsTable(examID);
          return true;
        }
      } catch (e) {
        logWarn('loadQuestionsTable melempar exception:', e);
      }
      logWarn('loadQuestionsTable tidak tersedia / examID kosong — table tidak di-reload.');
      return false;
    }

    function renderPerTypeHtml(perType, mode) {
      if (!perType || typeof perType !== 'object') return '';
      var rows = [];
      for (var t in perType) {
        if (!Object.prototype.hasOwnProperty.call(perType, t)) continue;
        var d = perType[t] || {};
        var label = TYPE_LABEL[t] || t;
        var rejected = (typeof d.rejected === 'number') ? d.rejected : 0;
        var line;
        if (mode === 'QUOTA') {
          var existing = (typeof d.existing === 'number') ? d.existing : '?';
          var max = (typeof d.max === 'number') ? d.max : '?';
          line = '<b>' + escapeHtml(label) + '</b>: ' +
            escapeHtml(String(rejected)) + ' soal ditolak ' +
            '(kuota ' + escapeHtml(String(existing)) + '/' + escapeHtml(String(max)) + ')';
        } else if (mode === 'TYPE_DISABLED') {
          line = '<b>' + escapeHtml(label) + '</b>: ' +
            escapeHtml(String(rejected)) + ' soal ditolak (tipe dinonaktifkan)';
        } else {
          line = '<b>' + escapeHtml(label) + '</b>: ' +
            escapeHtml(String(rejected)) + ' soal ditolak';
        }
        rows.push('<li style="margin-bottom:4px;">' + line + '</li>');
      }
      if (rows.length === 0) return '';
      return '<p class="text-sm text-slate-500 mb-2" style="text-align:left;">Tipe yang ditolak:</p>' +
        '<ul style="text-align:left;font-size:13px;color:#475569;list-style:disc;padding-left:18px;">' +
        rows.join('') + '</ul>';
    }

    function _showSuccessToast(opts) {
      opts = opts || {};
      var count = (typeof opts.count === 'number') ? opts.count : 0;
      var subject = opts.subject || 'ujian terpilih';
      var onViewClick = (typeof opts.onView === 'function') ? opts.onView : null;

      if (typeof Swal === 'undefined') {
        logWarn('SweetAlert2 tidak tersedia — fallback alert().');
        try { root.alert('Berhasil menyimpan ' + count + ' soal ke ' + subject + '.'); } catch (e) {}
        return;
      }

      try {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Berhasil menyimpan ' + count + ' soal ke ' + escapeHtml(String(subject)) + '.',
          showConfirmButton: true,
          confirmButtonText: '<i class="fas fa-eye"></i> Lihat Soal',
          confirmButtonColor: '#7c3aed',
          timer: 5000,
          timerProgressBar: true
        }).then(function (result) {
          if (result && result.isConfirmed && onViewClick) {
            try { onViewClick(); } catch (e) { logWarn('onView handler exception:', e); }
          }
        });
      } catch (e) {
        logWarn('Swal toast exception:', e);
      }
    }

    function _showErrorDialog(opts) {
      opts = opts || {};
      var title = opts.title || 'Terjadi Kesalahan';
      var html = opts.html || '<p style="font-size:13px;color:#475569;">Silakan coba lagi.</p>';
      var retryFn = (typeof opts.retryFn === 'function') ? opts.retryFn : null;
      var errorPayload = opts.errorPayload || null;

      if (typeof Swal === 'undefined') {
        logWarn('SweetAlert2 tidak tersedia — fallback alert().');
        try { root.alert(title); } catch (e) {}
        return;
      }

      var copyBtnId = 'batch-copy-error-btn-' + Date.now();
      var copyHint = '<div id="' + copyBtnId + '-hint" style="font-size:11px;color:#10b981;margin-top:6px;display:none;">' +
        '<i class="fas fa-check"></i> Detail error disalin ke clipboard.' +
        '</div>';

      try {
        Swal.fire({
          icon: 'error',
          title: title,
          html: html + copyHint,
          showConfirmButton: !!retryFn,
          confirmButtonText: '<i class="fas fa-rotate"></i> Coba Lagi',
          confirmButtonColor: '#7c3aed',
          showDenyButton: true,
          denyButtonText: '<i class="fas fa-copy"></i> Salin Detail Error',
          denyButtonColor: '#64748b',
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          cancelButtonColor: '#94a3b8',
          preDeny: function () {
            try {
              var json = JSON.stringify(errorPayload || {}, null, 2);
              if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
                root.navigator.clipboard.writeText(json).then(function () {
                  showCopyHint();
                }).catch(function () {
                  fallbackCopy(json);
                });
              } else {
                fallbackCopy(json);
              }
            } catch (e) {
              logWarn('Copy error gagal:', e);
            }
            return false;
          }
        }).then(function (result) {
          if (result && result.isConfirmed && retryFn) {
            try { retryFn(); } catch (e) { logWarn('retryFn exception:', e); }
          }
        });

        function showCopyHint() {
          try {
            var hint = document.getElementById(copyBtnId + '-hint');
            if (hint) {
              hint.style.display = 'block';
              setTimeout(function () { try { hint.style.display = 'none'; } catch (e) {} }, 2500);
            }
          } catch (e) {   }
        }

        function fallbackCopy(text) {
          try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {   }
            document.body.removeChild(ta);
            showCopyHint();
          } catch (e) {
            logWarn('Fallback copy gagal:', e);
          }
        }
      } catch (e) {
        logWarn('Swal error dialog exception:', e);
      }
    }



    function _handleSuccess(resp, context) {
      context = context || {};
      var count = (typeof resp.count === 'number') ? resp.count :
                  (resp.savedCount || 0);
      var subject = resp.subject || resp.examName || '';

      safeCallActionBar('setEnabled', { preview: true, save: true, reset: true });

      safeCallActionBar('setProgress', 100);
      try {
        root.setTimeout(function () { safeCallActionBar('setProgress', 0); }, 800);
      } catch (e) {   }

      try {
        var ST = BatchSoal.UI && BatchSoal.UI.SmartTextarea;
        if (ST && typeof ST.clear === 'function') ST.clear();
      } catch (e) { logWarn('SmartTextarea.clear gagal:', e); }
      try {
        var DR = BatchSoal.UI && BatchSoal.UI.Draft;
        if (DR && typeof DR.clear === 'function') DR.clear();
      } catch (e) { logWarn('Draft.clear gagal:', e); }

      try {
        var form = document.getElementById('form-batch-q');
        if (form) form.classList.add('hidden');
      } catch (e) {   }

      reloadQuestionsTable(context.examID);

      _showSuccessToast({
        count: count,
        subject: subject,
        onView: function () {
          try {
            var table = document.getElementById('bankSoalTable') ||
                        document.getElementById('questions-table') ||
                        document.querySelector('#dash-batch table') ||
                        document.querySelector('#dash-questions table');
            if (table && typeof table.scrollIntoView === 'function') {
              table.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } catch (e) {   }
        }
      });
    }

    function _handleAuth(resp, context) {
      var msg = (resp && resp.message) ? String(resp.message) :
        'Sesi Anda tidak valid. Silakan login ulang.';

      reEnableButtons();

      if (typeof Swal === 'undefined') {
        try { root.alert(msg); } catch (e) {}
        return;
      }

      try {
        Swal.fire({
          icon: 'error',
          title: 'Sesi Tidak Valid',
          html: '<p style="font-size:13px;color:#475569;">' + escapeHtml(msg) + '</p>',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#7c3aed'
        });
      } catch (e) { logWarn('Swal AUTH exception:', e); }
    }

    function _handleTypeDisabled(resp, context) {
      var details = (resp && resp.details) || {};
      var perType = details.perType || details.types || {};
      var perTypeHtml = renderPerTypeHtml(perType, 'TYPE_DISABLED');
      var msg = (resp && resp.message) ? String(resp.message) :
        'Beberapa tipe soal dinonaktifkan untuk ujian ini.';

      reEnableButtons();

      if (typeof Swal === 'undefined') { try { root.alert(msg); } catch (e) {} return; }

      try {
        Swal.fire({
          icon: 'error',
          title: 'Tipe Soal Dinonaktifkan',
          html: '<p style="font-size:13px;color:#475569;text-align:left;">' + escapeHtml(msg) + '</p>' +
                (perTypeHtml || ''),
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#7c3aed'
        });
      } catch (e) { logWarn('Swal TYPE_DISABLED exception:', e); }
    }

    function _handleQuota(resp, context) {
      var details = (resp && resp.details) || {};
      var perType = details.perType || details.types || {};
      var perTypeHtml = renderPerTypeHtml(perType, 'QUOTA');
      var msg = (resp && resp.message) ? String(resp.message) :
        'Kuota soal untuk satu atau lebih tipe terlampaui.';

      reEnableButtons();

      if (typeof Swal === 'undefined') { try { root.alert(msg); } catch (e) {} return; }

      try {
        Swal.fire({
          icon: 'error',
          title: 'Kuota Tipe Terlampaui',
          html: '<p style="font-size:13px;color:#475569;text-align:left;">' + escapeHtml(msg) + '</p>' +
                (perTypeHtml || ''),
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#7c3aed'
        });
      } catch (e) { logWarn('Swal QUOTA exception:', e); }
    }

    function _handleConfigMissing(resp, context) {
      var msg = (resp && resp.message) ? String(resp.message) :
        'Konfigurasi tipe soal untuk ujian ini tidak dapat dimuat. Hubungi Admin.';

      reEnableButtons();

      _showErrorDialog({
        title: 'Konfigurasi Ujian Tidak Ditemukan',
        html: '<p style="font-size:13px;color:#475569;">' + escapeHtml(msg) + '</p>',
        retryFn: (context && typeof context.retryFn === 'function') ? context.retryFn : null,
        errorPayload: {
          code: (resp && resp.code) || 'CONFIG_MISSING',
          message: msg,
          details: (resp && resp.details) || null,
          examID: context && context.examID
        }
      });
    }

    function _handleSystemOrTimeout(resp, context) {
      var code = (resp && resp.code) || 'SYSTEM';
      var msg = (resp && resp.message) ? String(resp.message) : '';

      var titleByCode = {
        TIMEOUT: 'Permintaan Melewati Batas Waktu',
        SYSTEM: 'Kesalahan Sistem',
        EXCEPTION: 'Terjadi Kesalahan',
        NO_GAS: 'Server Tidak Terhubung',
        NO_EXAM: 'Ujian Target Belum Dipilih',
        NO_VALID: 'Tidak Ada Soal Valid Dikirim'
      };
      var defaultMsgByCode = {
        TIMEOUT: 'Server tidak merespons dalam 30 detik. Silakan coba lagi.',
        SYSTEM: 'Terjadi kesalahan pada server. Silakan coba lagi.',
        EXCEPTION: 'Permintaan gagal diproses. Silakan coba lagi.',
        NO_GAS: 'Tidak dapat menghubungi server. Periksa koneksi Anda lalu coba lagi.',
        NO_EXAM: 'Pilih ujian target terlebih dahulu sebelum menyimpan.',
        NO_VALID: 'Tidak ada Soal_Valid untuk dikirim.'
      };

      var title = titleByCode[code] || titleByCode.SYSTEM;
      var defaultMsg = defaultMsgByCode[code] || defaultMsgByCode.SYSTEM;
      var displayMsg = msg || defaultMsg;

      reEnableButtons();

      _showErrorDialog({
        title: title,
        html: '<p style="font-size:13px;color:#475569;">' + escapeHtml(displayMsg) + '</p>' +
              '<p style="font-size:11px;color:#94a3b8;margin-top:6px;">Kode: <code>' + escapeHtml(code) + '</code></p>',
        retryFn: (context && typeof context.retryFn === 'function') ? context.retryFn : null,
        errorPayload: {
          code: code,
          message: displayMsg,
          details: (resp && resp.details) || null,
          examID: context && context.examID
        }
      });
    }


    function handle(resp, context) {
      context = context || {};
      resp = resp || {};

      if (resp.success === true) {
        try { _handleSuccess(resp, context); }
        catch (e) {
          logWarn('Handler sukses melempar exception:', e);
          reEnableButtons();
        }
        return;
      }

      var code = (resp && resp.code) ? String(resp.code).toUpperCase() : 'SYSTEM';

      try {
        switch (code) {
          case 'AUTH':
          case 'NO_AUTH':
            _handleAuth(resp, context);
            break;
          case 'TYPE_DISABLED':
            _handleTypeDisabled(resp, context);
            break;
          case 'QUOTA':
            _handleQuota(resp, context);
            break;
          case 'CONFIG_MISSING':
            _handleConfigMissing(resp, context);
            break;
          case 'TIMEOUT':
          case 'SYSTEM':
          case 'EXCEPTION':
          case 'NO_GAS':
          case 'NO_EXAM':
          case 'NO_VALID':
            _handleSystemOrTimeout(resp, context);
            break;
          default:
            logWarn('Kode respons tidak dikenal, fallback ke SYSTEM:', code);
            _handleSystemOrTimeout(resp, context);
        }
      } catch (e) {
        logWarn('Handler error melempar exception:', e);
        reEnableButtons();
      }
    }

    BatchSoal.UI.SaveResponse = {
      handle: handle,
      _handleSuccess: _handleSuccess,
      _handleAuth: _handleAuth,
      _handleTypeDisabled: _handleTypeDisabled,
      _handleQuota: _handleQuota,
      _handleConfigMissing: _handleConfigMissing,
      _handleSystemOrTimeout: _handleSystemOrTimeout,
      _showErrorDialog: _showErrorDialog,
      _showSuccessToast: _showSuccessToast
    };

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── UI Block L15058-L15170 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal = root.BatchSoal || {};
    BatchSoal.UI = BatchSoal.UI || {};

    if (typeof BatchSoal.UI.saveBatchToBackend === 'function') {
      return;
    }

    function logWarn() {
      if (typeof console === 'undefined' || !console.warn) return;
      try {
        var args = Array.prototype.slice.call(arguments);
        console.warn.apply(console, ['[BatchSoal.UI.saveBatchToBackend]'].concat(args));
      } catch (e) {   }
    }

    function saveBatchToBackend(validationResult, options) {
      options = options || {};

      var SS = BatchSoal.UI && BatchSoal.UI.SaveSubmit;
      var SR = BatchSoal.UI && BatchSoal.UI.SaveResponse;

      if (!SS || typeof SS.submit !== 'function') {
        logWarn('SaveSubmit modul tidak tersedia — pipeline dibatalkan.');
        var notReady = {
          ok: false,
          code: 'SYSTEM',
          message: 'Modul pengiriman batch belum siap. Muat ulang halaman lalu coba lagi.'
        };
        if (SR && typeof SR.handle === 'function') {
          try {
            SR.handle(notReady, {
              validationResult: validationResult || null,
              examID: (options && options.examID) || null
            });
          } catch (e) { logWarn('SaveResponse.handle exception:', e); }
        }
        return Promise.resolve(notReady);
      }

      function buildRetryFn() {
        return function () {
          try { return saveBatchToBackend(validationResult, options); }
          catch (e) { logWarn('retryFn exception:', e); }
        };
      }

      var submitOptions = {};
      if (options && typeof options.examID !== 'undefined') {
        submitOptions.examID = options.examID;
      }

      var p;
      try {
        p = SS.submit(validationResult, submitOptions);
      } catch (e) {
        logWarn('SaveSubmit.submit melempar exception sinkronis:', e);
        var msg = '';
        try { msg = String(e && e.message ? e.message : e); }
        catch (ee) { msg = String(e); }
        p = Promise.resolve({ ok: false, code: 'EXCEPTION', message: msg });
      }

      return p.then(function (resp) {
        var resolvedExamID = (options && options.examID) || null;
        if (!resolvedExamID) {
          try {
            var sel = document.getElementById('select-exam-q');
            if (sel && sel.value && String(sel.value).trim() !== '') {
              resolvedExamID = String(sel.value).trim();
            }
          } catch (e) {   }
        }
        if (!resolvedExamID) {
          try {
            if (BatchSoal.UI && BatchSoal.UI.currentExamId) {
              resolvedExamID = String(BatchSoal.UI.currentExamId).trim() || null;
            }
          } catch (e) {   }
        }

        var ctx = {
          validationResult: validationResult || null,
          examID: resolvedExamID,
          retryFn: buildRetryFn()
        };
        if (options && options.context && typeof options.context === 'object') {
          for (var k in options.context) {
            if (Object.prototype.hasOwnProperty.call(options.context, k) &&
                typeof ctx[k] === 'undefined') {
              ctx[k] = options.context[k];
            }
          }
        }

        if (SR && typeof SR.handle === 'function') {
          try { SR.handle(resp, ctx); }
          catch (e) { logWarn('SaveResponse.handle exception:', e); }
        } else {
          logWarn('SaveResponse modul tidak tersedia — respons tidak dipetakan ke UI.');
        }
        return resp;
      });
    }

    BatchSoal.UI.saveBatchToBackend = saveBatchToBackend;

    root.BatchSoal = BatchSoal;
  })(window);