/**
 * kartu-siswa.js — Kartu Ujian Siswa
 * renderKartuTable(), handleKartuMassal(), handleDownloadKartu(), trigger helpers
 * Sumber: index.html L39303-39322, L39714-40065
 */

// handleDownloadKartu didefinisikan di users.js (dengan _validateKartuConfig + _doDownloadKartu)


function renderKartuTable() {
  const wrapper    = document.getElementById('kartu-table-wrapper');
  const pagination = document.getElementById('kartu-pagination');
  const info       = document.getElementById('kartu-pagination-info');
  const btnPrev    = document.getElementById('btn-kartu-prev');
  const btnNext    = document.getElementById('btn-kartu-next');
  if (!wrapper) return;
  const data     = window._kartuFilteredData || [];
  const perPage  = window._kartuPerPage || 10;
  const page     = window._kartuPage    || 1;
  const total    = data.length;
  const maxPage  = perPage === 'all' ? 1 : Math.ceil(total / perPage);
  if (window._kartuPage > maxPage) window._kartuPage = maxPage;
  if (window._kartuPage < 1)       window._kartuPage = 1;
  const start    = perPage === 'all' ? 0 : (page - 1) * perPage;
  const end      = perPage === 'all' ? total : Math.min(start + perPage, total);
  const pageData = data.slice(start, end);
  if (total === 0) {
    wrapper.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <i class="fas fa-user-slash text-4xl mb-3 text-slate-300"></i>
        <p class="font-medium">Tidak ada siswa ditemukan.</p>
      </div>`;
    if (pagination) pagination.classList.add('hidden');
    return;
  }
  const rows = pageData.map((s, i) => {
    const isChecked  = window._kartuSelected && window._kartuSelected.has(s.id) ? 'checked' : '';
    const statusBadge = s.isActive
      ? `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Aktif</span>`
      : `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-700 border border-red-100">Non-Aktif</span>`;
    return `
      <tr class="kartu-row hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
        <td class="py-3 px-4 text-center w-10">
          <input type="checkbox" class="kartu-check w-4 h-4 rounded border-slate-300 cursor-pointer accent-emerald-600"
            value="${s.id}" ${isChecked} onchange="updateKartuSelection('${s.id}', this.checked)">
        </td>
        <td class="py-3 px-4 text-center text-slate-400 text-sm w-10">${start + i + 1}</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm uppercase">
              ${String(s.nama || '?').charAt(0)}
            </div>
            <div>
              <div class="font-semibold text-slate-700 text-sm">${s.nama}</div>
              <div class="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 rounded inline-block mt-0.5">${s.id}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-sm text-slate-600">${s.kelas || '-'}</td>
        <td class="py-3 px-4 text-center">${statusBadge}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="handleDownloadKartu('${s.id}')"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm transition transform active:scale-95">
            <i class="fas fa-file-pdf"></i> Cetak
          </button>
        </td>
      </tr>`;
  }).join('');
  wrapper.innerHTML = `
    <div class="overflow-x-auto w-full">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
            <th class="py-4 px-4 text-center w-10">
              <input type="checkbox" id="kartu-check-all" onchange="toggleAllKartu(this.checked)"
                class="w-4 h-4 rounded border-slate-300 cursor-pointer accent-emerald-600" title="Pilih Semua">
            </th>
            <th class="py-4 px-4 text-center w-10">#</th>
            <th class="py-4 px-4">Nama Siswa</th>
            <th class="py-4 px-4">Kelas</th>
            <th class="py-4 px-4 text-center">Status</th>
            <th class="py-4 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">${rows}</tbody>
      </table>
    </div>`;
  if (pagination) pagination.classList.remove('hidden');
  if (info)    info.innerText = `Menampilkan ${start + 1}–${end} dari ${total} data`;
  if (btnPrev) { btnPrev.disabled = (page <= 1);        btnPrev.classList.toggle('opacity-50', page <= 1); }
  if (btnNext) { btnNext.disabled = (page >= maxPage);  btnNext.classList.toggle('opacity-50', page >= maxPage); }
  const checkAll = document.getElementById('kartu-check-all');
  const sel = window._kartuSelected ? window._kartuSelected.size : 0;
  const onPage = pageData.length;
  const selOnPage = pageData.filter(s => window._kartuSelected && window._kartuSelected.has(s.id)).length;
  if (checkAll) {
    checkAll.indeterminate = (selOnPage > 0 && selOnPage < onPage);
    checkAll.checked = (onPage > 0 && selOnPage === onPage);
  }
}
function filterKartuTable(keyword) {
  const term = keyword.toLowerCase().trim();
  const all  = window._kartuSiswaData || [];
  window._kartuFilteredData = term === '' ? all : all.filter(s =>
    String(s.nama  || '').toLowerCase().includes(term) ||
    String(s.kelas || '').toLowerCase().includes(term) ||
    String(s.id    || '').toLowerCase().includes(term)
  );
  window._kartuPage = 1;
  renderKartuTable();
}
function updateKartuSelection(id, checked) {
  if (!window._kartuSelected) window._kartuSelected = new Set();
  if (checked) window._kartuSelected.add(id);
  else window._kartuSelected.delete(id);
  syncKartuMassalButton();
}
function toggleAllKartu(checked) {
  if (!window._kartuSelected) window._kartuSelected = new Set();
  document.querySelectorAll('.kartu-check').forEach(cb => {
    cb.checked = checked;
    if (checked) window._kartuSelected.add(cb.value);
    else window._kartuSelected.delete(cb.value);
  });
  syncKartuMassalButton();
}
function changeKartuPerPage(val) {
  window._kartuPerPage = (val === 'all') ? 'all' : parseInt(val);
  window._kartuPage    = 1;
  renderKartuTable();
}
function changeKartuPage(dir) {
  const total   = (window._kartuFilteredData || []).length;
  const perPage = window._kartuPerPage || 10;
  const maxPage = perPage === 'all' ? 1 : Math.ceil(total / perPage);
  if (dir === 'prev' && window._kartuPage > 1)        window._kartuPage--;
  if (dir === 'next' && window._kartuPage < maxPage)  window._kartuPage++;
  renderKartuTable();
}
function syncKartuMassalButton() {
  const btn   = document.getElementById('btn-kartu-massal');
  const count = document.getElementById('kartu-massal-count');
  const checkAll = document.getElementById('kartu-check-all');
  const total = document.querySelectorAll('.kartu-check').length;
  const sel   = window._kartuSelected ? window._kartuSelected.size : 0;
  if (!btn) return;
  if (sel > 0) { btn.classList.remove('hidden'); btn.classList.add('flex'); }
  else         { btn.classList.add('hidden');    btn.classList.remove('flex'); }
  if (count) count.textContent = sel;
  if (checkAll) {
    checkAll.indeterminate = (sel > 0 && sel < total);
    checkAll.checked = (total > 0 && sel === total);
  }
}
function handleKartuMassal() {
  const ids = Array.from(window._kartuSelected || []);
  if (ids.length === 0) return;
  Swal.fire({
    title: `Cetak ${ids.length} Kartu?`,
    html: `Sistem akan membuat <b>${ids.length} kartu ujian</b> dan mengunduhnya sebagai file <b>ZIP</b>.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#059669',
    confirmButtonText: `<i class="fas fa-file-archive"></i> Ya, Cetak Sekarang`,
    cancelButtonText: 'Batal'
  }).then(result => {
    if (!result.isConfirmed) return;
    const processId = 'PROC-' + new Date().getTime();
    let progressInterval;
    Swal.fire({
      title: 'Sedang Memproses...',
      html: `
        <div class="text-sm text-slate-500 mb-3">Mohon jangan tutup halaman ini.</div>
        <div class="w-full bg-slate-200 rounded-full h-4 mb-2 overflow-hidden">
          <div id="kartu-progress-bar" class="bg-emerald-500 h-4 rounded-full transition-all duration-300" style="width:0%"></div>
        </div>
        <div id="kartu-progress-text" class="font-bold text-slate-700">Menyiapkan data...</div>`,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        progressInterval = setInterval(() => {
          google.script.run
            .withSuccessHandler(status => {
              if (!status) return;
              const parts   = status.split('/');
              const current = parseInt(parts[0]);
              const total   = parseInt(parts[1]);
              const pct     = Math.round((current / total) * 100);
              const bar  = document.getElementById('kartu-progress-bar');
              const text = document.getElementById('kartu-progress-text');
              if (bar)  bar.style.width = pct + '%';
              if (text) text.innerText  = `Memproses ${current} dari ${total} kartu (${pct}%)`;
            })
            .checkDownloadProgress(processId);
        }, 1000);
      }
    });
    google.script.run
      .withSuccessHandler(res => {
        clearInterval(progressInterval);
        Swal.close();
        if (res.success) {
          Swal.fire({
            icon: 'success',
            title: 'Selesai!',
            text: res.message,
            confirmButtonText: '<i class="fas fa-download"></i> Download ZIP',
            confirmButtonColor: '#059669',
            preConfirm: () => window.open(res.url, '_blank')
          });
          window._kartuSelected.clear();
          document.querySelectorAll('.kartu-check').forEach(cb => cb.checked = false);
          syncKartuMassalButton();
        } else {
          Swal.fire('Gagal', res.message, 'error');
        }
      })
      .withFailureHandler(err => {
        clearInterval(progressInterval);
        Swal.fire('Error', err.message, 'error');
      })
      .downloadKartuMassal(ids, processId);
  });
}

function checkInputReminderTriggerStatusUI() {
    const statusEl = document.getElementById('trigger-input-reminder-status');
    if (!statusEl) return;
    statusEl.innerHTML = '<span class="text-slate-500"><i class="fas fa-spinner fa-spin mr-1"></i>Mengecek status...</span>';
    google.script.run
        .withSuccessHandler(res => {
            if (res && res.active) {
                statusEl.innerHTML = '<span class="text-emerald-600"><i class="fas fa-check-circle mr-1"></i>Notifikasi Aktif (1 jam sekali)</span>';
            } else {
                statusEl.innerHTML = '<span class="text-slate-500"><i class="fas fa-ban mr-1"></i>Notifikasi Tidak Aktif</span>';
            }
        })
        .withFailureHandler(() => {
            statusEl.innerHTML = '<span class="text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>Gagal mengecek</span>';
        })
        .checkInputReminderTriggerStatus();
}

function handleSetupInputReminderTrigger() {
    Swal.fire({
        title: 'Mengaktifkan...',
        html: '<p style="font-size:13px;">Sedang mengatur trigger notifikasi email di server...</p>',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: 'lp-swal' }
    });
    google.script.run
        .withSuccessHandler(res => {
            if (res && res.success) {
                Swal.fire('Berhasil', res.message, 'success');
                checkInputReminderTriggerStatusUI();
            } else {
                Swal.fire('Gagal', res && res.message ? res.message : 'Kesalahan tidak diketahui', 'error');
            }
        })
        .withFailureHandler(err => {
            Swal.fire('Error', err.message || err, 'error');
        })
        .setupInputReminderTrigger();
}

function handleRemoveInputReminderTrigger() {
    Swal.fire({
        title: 'Menonaktifkan...',
        html: '<p style="font-size:13px;">Sedang menghapus trigger notifikasi email...</p>',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: 'lp-swal' }
    });
    google.script.run
        .withSuccessHandler(res => {
            if (res && res.success) {
                Swal.fire('Berhasil', res.message, 'success');
                checkInputReminderTriggerStatusUI();
            } else {
                Swal.fire('Gagal', res && res.message ? res.message : 'Kesalahan tidak diketahui', 'error');
            }
        })
        .withFailureHandler(err => {
            Swal.fire('Error', err.message || err, 'error');
        })
        .removeInputReminderTrigger();
}

function handleSetupAutoTrigger() {
  Swal.fire({
    title:'Mengaktifkan Trigger...',
    html:'<p style="font-size:13px;color:#475569;">Menyiapkan trigger auto-aktivasi setiap 5 menit.</p>',
    allowOutsideClick:false, didOpen:()=>Swal.showLoading(),
    customClass:{ popup:'lp-swal' }
  });
  google.script.run
    .withSuccessHandler(function(res) {
      Swal.close();
      const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2200, timerProgressBar:true });
      Toast.fire({ icon:'success', title: (res && res.message) || 'Auto-trigger aktif' });
      const el = document.getElementById('auto-trigger-status');
      if (el) el.innerHTML = '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Aktif — setiap 5 menit</span>';
    })
    .withFailureHandler(err => Swal.fire({
      icon:'error', title:'Gagal Aktifkan',
      html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
      confirmButtonColor:'#dc2626',
      customClass:{ popup:'lp-swal' }
    }))
    .setupAutoActivateTrigger();
}

function handleRemoveAutoTrigger() {
  Swal.fire({
    title:'Nonaktifkan Auto-Trigger?',
    html:`<p style="font-size:13px;color:#475569;">Trigger akan dihapus. Status ujian harus diubah <b>manual</b>.</p>
          <p style="font-size:11px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:8px;margin-top:8px;">
            <i class="fas fa-triangle-exclamation"></i> Pastikan Anda akan mengelola status ujian secara manual.
          </p>`,
    icon:'warning',
    showCancelButton:true,
    confirmButtonText:'<i class="fas fa-ban mr-1"></i> Ya, Nonaktifkan',
    cancelButtonText:'Batal',
    confirmButtonColor:'#dc2626',
    cancelButtonColor:'#64748b',
    reverseButtons:true,
    customClass:{ popup:'lp-swal' }
  })
  .then(r => {
    if (!r.isConfirmed) return;
    Swal.fire({
      title:'Memproses...', allowOutsideClick:false,
      didOpen:()=>Swal.showLoading(),
      customClass:{ popup:'lp-swal' }
    });
    google.script.run
      .withSuccessHandler(function(res) {
        Swal.close();
        const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2200, timerProgressBar:true });
        Toast.fire({ icon:'info', title:(res && res.message) || 'Trigger dinonaktifkan' });
        const el = document.getElementById('auto-trigger-status');
        if (el) el.innerHTML = '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-sm border border-slate-200"><span class="w-2 h-2 rounded-full bg-slate-400"></span> Tidak Aktif</span>';
      })
      .withFailureHandler(err => Swal.fire({
        icon:'error', title:'Gagal Menonaktifkan',
        html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
        confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      }))
      .removeAutoActivateTrigger();
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// PROGRES KOREKSI ESAI — render functions  v3 (stable skeleton loading)
// ══════════════════════════════════════════════════════════════════════════════

// ── Helpers skeleton ─────────────────────────────────────────────────────────

/** Satu skeleton stat card dengan dimensi identik card nyata */
