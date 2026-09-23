/**
 * admin-logs.js — Log Aktivitas Admin
 * renderAdminLogs() + _al* helpers + backup handlers
 * Sumber: index.html L44739-45328
 */

  function renderAdminLogs(container) {
    const isGuru = currentUser && currentUser.role === 'Guru';
    const pageTitle = isGuru ? 'Log Aktivitas' : 'Log Aktivitas Admin';
    const pageDesc  = isGuru
      ? 'Rekam jejak semua aksi yang telah Anda lakukan.'
      : 'Rekam jejak semua aksi penting Admin & Guru untuk audit trail dan keamanan sistem.';

    // Init UI state
    if (!window._logsUI) {
      window._logsUI = {
        search: '',
        filterAction: '',     // exact action match
        filterCategory: '',   // create | update | delete | reset | backup | login | import | config | other
        filterActor: '',      // exact actorID
        page: 1,
        pageSize: 25,
        expanded: new Set()
      };
    }

    container.innerHTML = `
      <div class="al-page fade-in">
        <div class="al-header">
          <div>
            <h2><i class="fas fa-clipboard-list mr-2"></i>${_alEsc(pageTitle)}</h2>
            <p>${_alEsc(pageDesc)}</p>
          </div>
          <div class="al-header-actions">
            <button class="al-header-btn" onclick="renderAdminLogs(document.getElementById('admin-content'))" title="Muat ulang data">
              <i class="fas fa-rotate"></i> <span class="hidden sm:inline">Refresh</span>
            </button>
            <button class="al-header-btn solid" onclick="_alExportCsv()" id="al-export-btn" style="display:none;">
              <i class="fas fa-file-csv"></i> <span class="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        <div id="al-stats-mount"></div>
        <div id="al-filter-mount"></div>

        <div id="al-content" class="al-content-card">
          <div class="p-6">
            ${Array(5).fill(0).map(() => '<div class="pr-skel-row"></div>').join('')}
          </div>
        </div>
      </div>
    `;

    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.success) {
          _alRenderError((res && res.message) || 'Gagal memuat data');
          return;
        }
        const data = isGuru
          ? (res.data || []).filter(l => String(l.actorID) === String(currentUser.userID))
          : (res.data || []);
        window._adminLogsData = data;
        const btn = document.getElementById('al-export-btn');
        if (btn) btn.style.display = data.length ? 'inline-flex' : 'none';
        _alRefresh();
      })
      .withFailureHandler(err => {
        _alRenderError((err && err.message) || String(err));
      })
      .getAdminLogs(currentUser.userID, currentUser.token, 500);
  }

  function _alEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function _alAttr(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  }

  function _alCategory(action) {
    const a = String(action || '').toUpperCase();
    if (a.includes('CREATE'))  return 'create';
    if (a.includes('UPDATE') || a.includes('EDIT')) return 'update';
    if (a.includes('DELETE') || a.includes('REMOVE')) return 'delete';
    if (a.includes('RESET'))   return 'reset';
    if (a.includes('BACKUP'))  return a.includes('FAIL') ? 'fail' : 'backup';
    if (a.includes('FAIL'))    return 'fail';
    if (a.includes('LOGIN') || a.includes('LOGOUT')) return 'login';
    if (a.includes('IMPORT'))  return 'import';
    if (a.includes('CONFIG') || a.includes('SETTING')) return 'config';
    return 'other';
  }
  function _alCategoryLabel(cat) {
    return ({ create:'Create', update:'Update', delete:'Delete', reset:'Reset', backup:'Backup', fail:'Failed', login:'Auth', import:'Import', config:'Config', other:'Lainnya' })[cat] || 'Lainnya';
  }

  function _alRenderError(msg) {
    const root = document.getElementById('al-content');
    if (!root) return;
    root.innerHTML = `
      <div class="dash-error-state max-w-md mx-auto m-6">
        <div class="ico"><i class="fas fa-triangle-exclamation"></i></div>
        <h3 class="font-bold text-base text-red-700 mb-1">Gagal Memuat Log</h3>
        <p class="text-xs text-red-600 mb-4">${_alEsc(msg)}</p>
        <button onclick="renderAdminLogs(document.getElementById('admin-content'))" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition inline-flex items-center gap-2">
          <i class="fas fa-rotate-right"></i> Coba Lagi
        </button>
      </div>`;
  }

  function _alRefresh() {
    const ui = window._logsUI;
    const raw = Array.isArray(window._adminLogsData) ? window._adminLogsData : [];

    // Filter
    const search = (ui.search || '').toLowerCase();
    const filtered = raw.filter(l => {
      if (ui.filterCategory && _alCategory(l.action) !== ui.filterCategory) return false;
      if (ui.filterAction   && String(l.action || '') !== ui.filterAction) return false;
      if (ui.filterActor    && String(l.actorID || '') !== ui.filterActor) return false;
      if (search) {
        const hay = [l.action, l.actorName, l.actorID, l.targetID, l.targetType, l.details, l.timestamp]
          .map(v => String(v || '').toLowerCase()).join(' | ');
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / ui.pageSize));
    if (ui.page > totalPages) ui.page = totalPages;
    const startIdx = (ui.page - 1) * ui.pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + ui.pageSize);

    _alRenderStats(raw);
    _alRenderFilter(raw);
    _alRenderContent(pageItems, filtered.length, ui.page, totalPages, startIdx);
  }

  function _alRenderStats(raw) {
    const mount = document.getElementById('al-stats-mount');
    if (!mount) return;
    if (raw.length === 0) { mount.innerHTML = ''; return; }

    const ui = window._logsUI;
    const cats = { create:0, update:0, delete:0, reset:0, backup:0, fail:0, login:0, import:0, config:0, other:0 };
    raw.forEach(l => { cats[_alCategory(l.action)] = (cats[_alCategory(l.action)] || 0) + 1; });

    const pill = (key, ico, color, label, val) => `
      <div class="al-stat ${ui.filterCategory===key?'active':''}" onclick="_alSetFilter('category', '${key}')" tabindex="0" role="button">
        <div class="al-stat-ico ${color}"><i class="fas ${ico}"></i></div>
        <div><div class="al-stat-num">${val}</div><div class="al-stat-lbl">${label}</div></div>
      </div>`;

    mount.innerHTML = `
      <div class="al-stat-grid">
        <div class="al-stat ${ui.filterCategory===''?'active':''}" onclick="_alSetFilter('category', '')" tabindex="0" role="button">
          <div class="al-stat-ico bg-slate-100 text-slate-600"><i class="fas fa-list"></i></div>
          <div><div class="al-stat-num">${raw.length}</div><div class="al-stat-lbl">Semua</div></div>
        </div>
        ${pill('create', 'fa-plus-circle',     'bg-emerald-100 text-emerald-600','Create',  cats.create)}
        ${pill('update', 'fa-pen-to-square',   'bg-blue-100 text-blue-600',     'Update',  cats.update)}
        ${pill('delete', 'fa-trash',           'bg-red-100 text-red-600',       'Delete',  cats.delete)}
        ${pill('login',  'fa-right-to-bracket','bg-teal-100 text-teal-600',     'Auth',    cats.login)}
        ${pill('backup', 'fa-cloud-upload',    'bg-purple-100 text-purple-600', 'Backup',  cats.backup)}
      </div>`;
  }

  function _alRenderFilter(raw) {
    const mount = document.getElementById('al-filter-mount');
    if (!mount) return;
    if (raw.length === 0) { mount.innerHTML = ''; return; }
    const ui = window._logsUI;

    // Build distinct actors and actions
    const actors = [];
    const actorSeen = new Set();
    raw.forEach(l => {
      const id = String(l.actorID || '');
      if (id && !actorSeen.has(id)) {
        actorSeen.add(id);
        actors.push({ id, name: l.actorName || id });
      }
    });
    actors.sort((a, b) => String(a.name).localeCompare(String(b.name)));

    const actions = [...new Set(raw.map(l => String(l.action || '')).filter(Boolean))].sort();

    const hasFilters = !!(ui.search || ui.filterCategory || ui.filterAction || ui.filterActor);

    mount.innerHTML = `
      <div class="al-filter">
        <div class="ex-search" style="flex:1; min-width:160px;">
          <i class="fas fa-search"></i>
          <input id="al-search-input" type="text" placeholder="Cari aksi, aktor, target, detail..."
            value="${_alAttr(ui.search)}" oninput="_alSetFilter('search', this.value)" autocomplete="off">
          <button class="ex-search-clear ${ui.search ? 'show' : ''}" onclick="_alSetFilter('search','')" title="Bersihkan">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <select class="ex-select" onchange="_alSetFilter('action', this.value)">
          <option value="">Semua Aksi</option>
          ${actions.map(a => `<option value="${_alAttr(a)}" ${ui.filterAction===a?'selected':''}>${_alEsc(a)}</option>`).join('')}
        </select>
        ${actors.length > 1 ? `
          <select class="ex-select" onchange="_alSetFilter('actor', this.value)">
            <option value="">Semua Aktor</option>
            ${actors.map(a => `<option value="${_alAttr(a.id)}" ${ui.filterActor===a.id?'selected':''}>${_alEsc(a.name)} (${_alEsc(a.id)})</option>`).join('')}
          </select>` : ''}
        <select class="ex-select" onchange="_alSetPageSize(this.value)">
          <option value="15"  ${ui.pageSize===15?'selected':''}>15 baris</option>
          <option value="25"  ${ui.pageSize===25?'selected':''}>25 baris</option>
          <option value="50"  ${ui.pageSize===50?'selected':''}>50 baris</option>
          <option value="100" ${ui.pageSize===100?'selected':''}>100 baris</option>
          <option value="500" ${ui.pageSize===500?'selected':''}>500 baris</option>
        </select>
        ${hasFilters ? `
          <button onclick="_alResetFilters()" class="ex-select" style="background:#fef2f2;border-color:#fecaca;color:#dc2626;">
            <i class="fas fa-times-circle mr-1"></i> Reset
          </button>` : ''}
      </div>`;
  }

  function _alRenderContent(items, totalFiltered, page, totalPages, startIdx) {
    const root = document.getElementById('al-content');
    if (!root) return;
    const raw = Array.isArray(window._adminLogsData) ? window._adminLogsData : [];

    if (raw.length === 0) {
      root.innerHTML = `
        <div class="dash-empty">
          <div class="dash-empty-icon"><i class="fas fa-clipboard-list"></i></div>
          <p class="font-bold text-slate-700 text-sm">Belum ada log aktivitas.</p>
          <p class="text-xs text-slate-400 mt-1">Aktivitas Admin/Guru akan tercatat di sini secara otomatis.</p>
        </div>`;
      return;
    }
    if (totalFiltered === 0) {
      root.innerHTML = `
        <div class="dash-empty">
          <div class="dash-empty-icon"><i class="fas fa-search-minus"></i></div>
          <p class="font-bold text-slate-700 text-sm">Tidak ada log yang cocok.</p>
          <p class="text-xs text-slate-400 mt-1 mb-3">Bersihkan filter atau ubah kata kunci pencarian.</p>
          <button onclick="_alResetFilters()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition inline-flex items-center gap-2">
            <i class="fas fa-rotate-left"></i> Reset Filter
          </button>
        </div>`;
      return;
    }

    const tableHtml = _alBuildTable(items, startIdx);
    const cardsHtml = _alBuildCards(items, startIdx);
    const pagi      = _alPagination(totalFiltered, page, totalPages);

    root.innerHTML = `
      <div class="al-table-wrap">
        <div style="overflow-x:auto;">${tableHtml}</div>
        ${pagi}
      </div>
      <div class="al-cards">${cardsHtml}</div>
      <div class="md:hidden">${pagi}</div>`;
  }

  function _alBuildTable(items, startIdx) {
    const ui = window._logsUI;
    const rows = items.map((l, i) => {
      const idx = startIdx + i;
      const cat = _alCategory(l.action);
      const expanded = ui.expanded.has(idx);
      const det = String(l.details || '');
      const longDetail = det.length > 80;

      const detailDisplay = longDetail && !expanded
        ? _alEsc(det.slice(0, 80)) + '...'
        : _alEsc(det || '-');

      const expandBtn = longDetail
        ? `<button class="al-detail-toggle" onclick="_alToggleExpand(${idx})" title="${expanded?'Tutup detail':'Lihat detail lengkap'}">
            <i class="fas fa-chevron-${expanded?'up':'down'}"></i>
          </button>` : '';

      return `
        <tr class="${expanded ? 'expanded' : ''}">
          <td style="white-space:nowrap;">
            <span class="text-[11px] text-slate-500 font-mono">${_alEsc(l.timestamp || '-')}</span>
          </td>
          <td>
            <div class="font-bold text-slate-700 text-sm">${_alEsc(l.actorName || '-')}</div>
            <div class="text-[10px] text-slate-400 font-mono">${_alEsc(l.actorID || '')}</div>
          </td>
          <td style="text-align:center;">
            <span class="al-action-badge al-action-${cat}">${_alEsc(l.action || '-')}</span>
          </td>
          <td>
            <div class="text-xs font-semibold text-slate-700">${_alEsc(l.targetType || '-')}</div>
            ${l.targetID ? `<div class="text-[10px] text-slate-400 font-mono break-all">${_alEsc(l.targetID)}</div>` : ''}
          </td>
          <td>
            <div class="flex items-start gap-2">
              <span class="flex-1 ${expanded ? 'whitespace-pre-wrap break-words' : 'truncate'}" title="${_alAttr(det)}">${detailDisplay}</span>
              ${expandBtn}
            </div>
          </td>
        </tr>`;
    }).join('');

    return `
      <table class="al-table">
        <thead>
          <tr>
            <th style="width:170px;">Waktu</th>
            <th style="width:180px;">Aktor</th>
            <th style="text-align:center;width:140px;">Aksi</th>
            <th style="width:160px;">Target</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  function _alBuildCards(items, startIdx) {
    const ui = window._logsUI;
    return items.map((l, i) => {
      const idx = startIdx + i;
      const cat = _alCategory(l.action);
      const expanded = ui.expanded.has(idx);
      const det = String(l.details || '');
      const longDetail = det.length > 100;

      const detailDisplay = longDetail && !expanded
        ? _alEsc(det.slice(0, 100)) + '...'
        : _alEsc(det || '-');

      return `
        <div class="al-card-row">
          <div class="al-card-top">
            <div class="al-card-actor">
              <span class="al-action-badge al-action-${cat}">${_alEsc(l.action || '-')}</span>
            </div>
            <span class="al-card-time">${_alEsc(l.timestamp || '-')}</span>
          </div>
          <div class="al-card-meta">
            <span class="font-bold text-slate-700">${_alEsc(l.actorName || '-')}</span>
            <span class="font-mono text-[10px] text-slate-400">${_alEsc(l.actorID || '')}</span>
            ${l.targetType ? `<span class="text-slate-300">·</span><span><i class="fas fa-bullseye text-slate-300 mr-1"></i>${_alEsc(l.targetType)}${l.targetID ? `: <code class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">${_alEsc(l.targetID)}</code>`:''}</span>` : ''}
          </div>
          ${det ? `
            <div class="al-card-detail">
              <span class="${expanded?'whitespace-pre-wrap':''}">${detailDisplay}</span>
              ${longDetail ? `<button class="al-detail-toggle" onclick="_alToggleExpand(${idx})">
                <i class="fas fa-chevron-${expanded?'up':'down'}"></i> ${expanded?'Tutup':'Lihat'}
              </button>` : ''}
            </div>` : ''}
        </div>`;
    }).join('');
  }

  function _alPagination(total, page, totalPages) {
    if (totalPages <= 1) {
      return `<div class="al-pagination"><span>Menampilkan <b class="text-slate-700">${total}</b> entri</span></div>`;
    }
    const ws = Math.max(1, page - 2);
    const we = Math.min(totalPages, page + 2);
    let nums = '';
    if (ws > 1) nums += `<button class="al-page-btn" onclick="_alSetPage(1)">1</button>` + (ws > 2 ? '<span class="text-slate-400">…</span>' : '');
    for (let p = ws; p <= we; p++) nums += `<button class="al-page-btn ${p===page?'active':''}" onclick="_alSetPage(${p})">${p}</button>`;
    if (we < totalPages) nums += (we < totalPages - 1 ? '<span class="text-slate-400">…</span>' : '') + `<button class="al-page-btn" onclick="_alSetPage(${totalPages})">${totalPages}</button>`;

    return `
      <div class="al-pagination">
        <span>Halaman <b>${page}</b> / <b>${totalPages}</b> · ${total} entri</span>
        <div class="flex gap-1">
          <button class="al-page-btn" onclick="_alSetPage(${page-1})" ${page<=1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
          ${nums}
          <button class="al-page-btn" onclick="_alSetPage(${page+1})" ${page>=totalPages?'disabled':''}><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>`;
  }

  // State setters
  function _alSetFilter(key, value) {
    const ui = window._logsUI; if (!ui) return;
    if (key === 'search')   ui.search = value || '';
    if (key === 'category') ui.filterCategory = (ui.filterCategory === value && value) ? '' : value;
    if (key === 'action')   ui.filterAction = value || '';
    if (key === 'actor')    ui.filterActor = value || '';
    ui.page = 1;
    ui.expanded.clear();
    const wasFocused = document.activeElement && document.activeElement.id === 'al-search-input';
    const caretPos   = wasFocused ? document.activeElement.selectionStart : null;
    _alRefresh();
    if (wasFocused) {
      const inp = document.getElementById('al-search-input');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(caretPos, caretPos); } catch(e){}
      }
    }
  }
  function _alResetFilters() {
    const ui = window._logsUI; if (!ui) return;
    Object.assign(ui, { search:'', filterCategory:'', filterAction:'', filterActor:'', page:1 });
    ui.expanded.clear();
    _alRefresh();
  }
  function _alSetPage(p) {
    const ui = window._logsUI; if (!ui) return;
    ui.page = Math.max(1, parseInt(p) || 1);
    ui.expanded.clear();
    _alRefresh();
    const c = document.getElementById('admin-content');
    if (c) c.scrollTo({ top:0, behavior:'smooth' });
  }
  function _alSetPageSize(val) {
    const ui = window._logsUI; if (!ui) return;
    ui.pageSize = parseInt(val) || 25;
    ui.page = 1;
    ui.expanded.clear();
    _alRefresh();
  }
  function _alToggleExpand(idx) {
    const ui = window._logsUI; if (!ui) return;
    if (ui.expanded.has(idx)) ui.expanded.delete(idx);
    else ui.expanded.add(idx);
    _alRefresh();
  }

  // Export filtered logs to CSV
  function _alExportCsv() {
    const raw = Array.isArray(window._adminLogsData) ? window._adminLogsData : [];
    const ui = window._logsUI || {};
    const search = (ui.search || '').toLowerCase();
    const data = raw.filter(l => {
      if (ui.filterCategory && _alCategory(l.action) !== ui.filterCategory) return false;
      if (ui.filterAction   && String(l.action || '') !== ui.filterAction) return false;
      if (ui.filterActor    && String(l.actorID || '') !== ui.filterActor) return false;
      if (search) {
        const hay = [l.action, l.actorName, l.actorID, l.targetID, l.targetType, l.details, l.timestamp]
          .map(v => String(v || '').toLowerCase()).join(' | ');
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    if (data.length === 0) {
      Swal.fire({
        title:'Tidak Ada Data',
        html:'<p style="font-size:13px;color:#475569;">Tidak ada log untuk diekspor.</p>',
        icon:'info', confirmButtonColor:'#d97706',
        customClass:{ popup:'lp-swal' }
      });
      return;
    }

    try {
      const headers = ['Waktu', 'Actor ID', 'Actor Name', 'Action', 'Target Type', 'Target ID', 'Details'];
      const csvEscape = v => {
        const s = String(v == null ? '' : v);
        if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
        return s;
      };
      const rows = data.map(l => [l.timestamp, l.actorID, l.actorName, l.action, l.targetType, l.targetID, l.details].map(csvEscape).join(','));
      const csv = '\ufeff' + headers.map(csvEscape).join(',') + '\r\n' + rows.join('\r\n');
      const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0,16).replace(/[T:]/g,'-');
      a.href = url; a.download = `Admin_Logs_${ts}.csv`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 200);

      const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
      Toast.fire({ icon:'success', title:`${data.length} log diekspor ke CSV` });
    } catch(e) {
      Swal.fire({
        title:'Gagal Ekspor',
        html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(e && e.message) || e}</p>`,
        icon:'error', confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      });
    }
  }

  // Backwards-compat shims
  function filterAdminLogs() {
    const inp = document.getElementById('al-search-input');
    _alSetFilter('search', inp ? inp.value : '');
  }
  function renderAdminLogsTable() { _alRefresh(); }

  function handleManualBackup() {
    Swal.fire({
      title:'Memproses Backup...',
      html:'<p style="font-size:13px;color:#475569;">Sedang menyalin database ke Google Drive.</p>',
      allowOutsideClick:false, didOpen:()=>Swal.showLoading(),
      customClass:{ popup:'lp-swal' }
    });
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.success) {
          Swal.fire({
            icon:'success', title:'Backup Berhasil!',
            html:`<p style="font-size:13px;color:#475569;">File tersimpan di folder <b>CBT_BACKUPS</b>.</p>
                  <p style="font-size:11px;color:#1e293b;font-family:monospace;background:#f1f5f9;padding:6px 10px;border-radius:6px;margin-top:8px;">${(res.fileName || '').replace(/</g,'&lt;')}</p>
                  <a href="${res.url}" target="_blank" style="margin-top:14px;display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#2563eb;color:#fff;font-size:12px;border-radius:8px;font-weight:700;text-decoration:none;">
                    <i class="fas fa-external-link-alt"></i> Buka File Backup</a>`,
            showConfirmButton:true, confirmButtonText:'Selesai', confirmButtonColor:'#64748b',
            customClass:{ popup:'lp-swal' }
          });
        } else {
          Swal.fire({
            icon:'error', title:'Backup Gagal',
            html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
            confirmButtonColor:'#dc2626',
            customClass:{ popup:'lp-swal' }
          });
        }
      })
      .withFailureHandler(err => Swal.fire({
        icon:'error', title:'Error Server',
        html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
        confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      }))
      .manualBackup(currentUser.userID, currentUser.token);
  }

  function handleSetupSemesterBackup() {
    Swal.fire({
      title:'Setup Trigger Backup Semester?',
      html:`<p style="font-size:13px;color:#475569;">Akan membuat trigger otomatis pada:</p>
            <ul style="text-align:left;margin-top:8px;font-size:12px;color:#475569;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;list-style:none;">
              <li style="display:flex;align-items:center;gap:6px;"><span style="font-size:14px;">📅</span> <b>30 Juni</b> — akhir semester genap</li>
              <li style="display:flex;align-items:center;gap:6px;margin-top:4px;"><span style="font-size:14px;">📅</span> <b>31 Desember</b> — akhir semester ganjil</li>
            </ul>
            <p style="font-size:11px;color:#94a3b8;margin-top:8px;">Trigger berjalan otomatis tanpa tindakan manual.</p>`,
      icon:'info', showCancelButton:true,
      confirmButtonText:'<i class="fas fa-calendar-check mr-1"></i> Setup Sekarang',
      cancelButtonText:'Batal',
      confirmButtonColor:'#059669',
      cancelButtonColor:'#64748b',
      reverseButtons:true,
      customClass:{ popup:'lp-swal' }
    }).then(r => {
      if (!r.isConfirmed) return;
      Swal.fire({
        title:'Membuat trigger...',
        allowOutsideClick:false, didOpen:()=>Swal.showLoading(),
        customClass:{ popup:'lp-swal' }
      });
      google.script.run
        .withSuccessHandler(res => {
          Swal.close();
          const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2200, timerProgressBar:true });
          Toast.fire({ icon:'success', title: (res && res.message) || 'Trigger semester aktif' });
        })
        .withFailureHandler(err => Swal.fire({
          icon:'error', title:'Gagal',
          html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
          confirmButtonColor:'#dc2626',
          customClass:{ popup:'lp-swal' }
        }))
        .setupSemesterBackupTrigger();
    });
  }

  const yr = document.getElementById('currentYear');
  if (yr) yr.textContent = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────
//   MODUL PENGAWAS UJIAN
//   • initSupervisorPanel()        – boostrap panel pengawas
//   • renderSupervisorHome()       – dashboard pengawas
//   • renderSupervisorMonitor()    – monitor ujian pengawas
//   • renderSupervisorManagement() – manajemen pengawas (Admin)
//   ============================================================ -->
// ─────────────────────────────────────────────────────────────────
// State monitor pengawas (live-mode)
// ─────────────────────────────────────────────────────────────────
var _svMonitorLive      = false;
var _svMonitorTimer     = null;
var _svMonitorRawData   = null;
var _svMonitorActiveTab = 'semua';
var _svMonitorExamFilter = '';
var _svLiveSecs         = 30;
var _svLiveElapsed      = 0;
var _svLiveRingTimer    = null;

// ─────────────────────────────────────────────────────────────────
// Panel Pengawas Bootstrap
// ─────────────────────────────────────────────────────────────────