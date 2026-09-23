/**
 * utils.js — Utility & Helper Functions
 * SIPADU CBT v5.1.0
 *
 * Fungsi-fungsi reusable yang digunakan di banyak modul:
 * - renderMath()     : render MathJax
 * - prepContent()    : sanitasi konten HTML soal
 * - formatScore()    : format nilai angka
 * - escHtmlGlobal()  : escape HTML
 * - autoDetectTextDirection() : RTL/LTR detection (Arabic)
 * Sumber: index.html L15232-15300, L32052-32069
 */

function renderMath(el) {
  if (typeof MathJax === 'undefined') return;
  try {
    const target = (el instanceof HTMLElement) ? el : (typeof el === 'string' ? document.querySelector(el) : null);
    const promise = target ? MathJax.typesetPromise([target]) : MathJax.typesetPromise();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(err => console.warn('MathJax renderMath error:', err));
    }
  } catch(e) {
    console.warn('renderMath exception:', e);
  }
}

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
    return `<div class="q-content-render q-block">${converted}</div>`;
  } else {
    converted = cleaned
      .replace(/<\/p>\s*<p[^>]*>/gi, '<br>')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '');
  }
  return `<span class="q-content-render">${converted}</span>`;
}
let timerInterval;
let selectedLeft = null;
let ac_ctxHandler, ac_keyHandler, ac_visHandler, ac_blurHandler, ac_fsHandler, ac_unloadHandler;
let ac_copyHandler, ac_cutHandler, ac_pasteHandler;
let ac_pageHideHandler, ac_pageFreezeHandler, ac_pageShowHandler;
let _winKeyJustPressed = false;
let _winKeyTimer = null;
let _imgModalOpen = false;
let cachedExams = [];
let cachedUsers = [];
let masterData = {
  classes: [],
  subjects: []
};
let currentGradingId = null;
let allResultsData = [];
let filteredResults = [];
let currentPage = 1;
let rowsPerPage = 10;
let allQuestionsData = [];
let currentExamTypeConfig = null;
let filteredQuestions = [];
let currentQPage = 1;
let qRowsPerPage = 10;
let _activeTypeFilter = null;
let allUsersData = [];
let filteredUsers = [];
let currentUserPage = 1;
let userRowsPerPage = 10;
let selectedUsers = new Set();
let pendingTeacherAssignments = []; 


/* ─── escHtmlGlobal (L32052-32069) ─── */
function escHtmlGlobal(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ═══════════════════════════════════════════════════════════════
// ── VIOLATION DETAIL SLIDE PANEL ───────────────────────────────
// ═══════════════════════════════════════════════════════════════

/**
 * Buka slide panel riwayat pelanggaran.
 * @param {string} namaHtml - nama siswa (sudah di-escHtml, aman untuk innerHTML)
 * @param {number} total    - jumlah total pelanggaran
 * @param {Array}  logs     - array { waktu, jenis, detail } dari server

/* ─── autoDetectTextDirection (L37002-37020) ─── */
function togglePasswordVisibility() {
    const passInput = document.getElementById('password');
    const icon = document.getElementById('icon-toggle-pass');
    const eyeBtn = icon ? icon.parentElement : null;
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

function renderConfigPage(container) {

/* ─── togglePasswordVisibility (L37022) ─── */

function renderConfigPage(container) {