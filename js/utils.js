/**
 * utils.js — Utility & Helper Functions
 * SIPADU CBT v5.1.0
 *
 * Fungsi-fungsi reusable yang digunakan di banyak modul:
 * - renderMath()               : render MathJax pada elemen tertentu
 * - prepContent()              : sanitasi konten HTML soal
 * - formatScore()              : format nilai angka ke string
 * - escHtmlGlobal()            : escape karakter HTML berbahaya
 * - togglePasswordVisibility() : toggle show/hide password di form login
 * - openViolationPanel()       : buka slide panel riwayat pelanggaran
 * - closeViolationPanel()      : tutup slide panel pelanggaran
 * Sumber: index.html L15232-15300, L32052-32069
 */

// ── Semua variabel state global ada di state.js ──
// Utils hanya berisi fungsi-fungsi helper murni.

/* ─── renderMath ─── */
function renderMath(el) {
  if (typeof MathJax === 'undefined') return;
  try {
    const target = (el instanceof HTMLElement)
      ? el
      : (typeof el === 'string' ? document.querySelector(el) : null);
    const promise = target
      ? MathJax.typesetPromise([target])
      : MathJax.typesetPromise();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(err => console.warn('MathJax renderMath error:', err));
    }
  } catch(e) {
    console.warn('renderMath exception:', e);
  }
}

/* ─── prepContent ─── */
function prepContent(html) {
  if (!html || typeof html !== 'string') return html || '';
  let cleaned = html
    .replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .trim();
  if (!/<[a-z]/i.test(cleaned)) return cleaned;
  const hasStyledP = /<p\s+[^>]*style\s*=/i.test(cleaned);

  let converted;
  if (hasStyledP) {
    converted = cleaned
      .replace(/<p(\s+[^>]*)>/gi, '<div$1>')
      .replace(/<p>/gi, '<div>')
      .replace(/<\/p>/gi, '</div>');
    return '<div class="q-content-render q-block">' + converted + '</div>';
  } else {
    converted = cleaned
      .replace(/<\/p>\s*<p[^>]*>/gi, '<br>')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '');
  }
  return '<span class="q-content-render">' + converted + '</span>';
}

/* ─── formatScore ─── */
function formatScore(val) {
  if (val === '-' || val === '' || val === null || val === undefined) return '-';
  const n = parseFloat(val);
  if (isNaN(n)) return '-';
  return n.toFixed(2);
}

/* ─── escHtmlGlobal ─── */
function escHtmlGlobal(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ─── togglePasswordVisibility ─── */
function togglePasswordVisibility() {
  const passInput = document.getElementById('password');
  const icon      = document.getElementById('icon-toggle-pass');
  const eyeBtn    = icon ? icon.parentElement : null;
  if (!passInput || !icon) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
    if (eyeBtn) eyeBtn.setAttribute('aria-label', 'Sembunyikan password');
  } else {
    passInput.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
    if (eyeBtn) eyeBtn.setAttribute('aria-label', 'Tampilkan password');
  }
  try { passInput.focus(); } catch(e) {}
}

/* ─── Violation Detail Slide Panel ─── */
/**
 * Buka slide panel riwayat pelanggaran.
 * @param {string} namaHtml - nama siswa (sudah di-escHtml, aman untuk innerHTML)
 * @param {number} total    - jumlah total pelanggaran
 * @param {Array}  logs     - array { waktu, jenis, detail } dari server
 */
function openViolationPanel(namaHtml, total, logs) {
  const overlay  = document.getElementById('viol-panel-overlay');
  const title    = document.getElementById('viol-panel-title');
  const subtitle = document.getElementById('viol-panel-subtitle');
  const body     = document.getElementById('viol-panel-body');
  if (!overlay || !body) return;

  if (title)    title.textContent    = 'Riwayat Pelanggaran';
  if (subtitle) subtitle.innerHTML   = namaHtml + ' &mdash; <b>' + (total || 0) + '</b> pelanggaran';

  if (!logs || logs.length === 0) {
    body.innerHTML = '<div class="viol-empty"><i class="fas fa-check-circle text-emerald-400 mr-1"></i> Tidak ada catatan pelanggaran.</div>';
  } else {
    body.innerHTML = logs.map(function(l) {
      const waktu  = escHtmlGlobal(l.waktu  || '-');
      const jenis  = escHtmlGlobal(l.jenis  || '-');
      const detail = escHtmlGlobal(l.detail || '');
      return '<div class="viol-item">'
        + '<div class="viol-time">' + waktu + '</div>'
        + '<div class="viol-type">' + jenis + '</div>'
        + (detail ? '<div class="viol-detail">' + detail + '</div>' : '')
        + '</div>';
    }).join('');
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeViolationPanel() {
  const overlay = document.getElementById('viol-panel-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}
