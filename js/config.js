/**
 * config.js — Application Configuration & Constants
 * SIPADU CBT v5.1.0
 *
 * Berisi:
 * - APP_TIMEZONE, APP_TZ_LABEL
 * - ADMIN_SESSION_DURATION_MS
 * - MAX_FULLSCREEN_EXIT
 * - Copyright badge (protected IIFE)
 * Sumber: index.html L15173-15231
 */

  <script>

(function() {
  const _idArr = [114, 97, 110, 100, 105, 45, 112, 114, 97, 116, 97, 109, 97, 45, 115, 101, 99, 117, 114, 101, 45, 102, 111, 111, 116, 101, 114];
  const _txtArr = [169, 32, 67, 111, 112, 121, 114, 105, 103, 104, 116, 32, 82, 97, 110, 100, 105, 32, 80, 114, 97, 116, 97, 109, 97, 44, 32, 83, 46, 80, 100, 46, 32, 124, 32, 72, 97, 107, 32, 67, 105, 112, 116, 97, 32, 68, 105, 108, 105, 110, 100, 117, 110, 103, 105, 32, 85, 110, 100, 97, 110, 103, 45, 85, 110, 100, 97, 110, 103, 32, 45, 32, 67, 66, 84, 32, 86, 101, 114, 115, 105, 111, 110, 32, 52, 46, 53];

  const _dec = (arr) => String.fromCharCode(...arr);

  function _ensureBadge() {
    const _id = _dec(_idArr);
    if (document.getElementById(_id)) return true;
    const targetContainer = document.getElementById('loginForm');
    if (!targetContainer) return false;
    const _d = document.createElement('div');
    _d.id = _id;
    _d.className = 'cbt-secure-badge';
    _d.style.textAlign = 'center';
    _d.style.width = '100%';
    _d.style.marginTop = '15px';
    _d.innerHTML = `<i class="fas fa-shield-alt"></i> <span>${_dec(_txtArr)}</span>`;
    targetContainer.appendChild(_d);
    return true;
  }

  // Try once on load, then poll briefly until rendered, then stop.
  if (!_ensureBadge()) {
    let _tries = 0;
    const _it = setInterval(() => {
      if (_ensureBadge() || ++_tries > 40) clearInterval(_it);
    }, 500);
  }
  // Re-add if removed (e.g. after form.reset() — observe loginForm).
  const _mo = new MutationObserver(() => { _ensureBadge(); });
  const _start = setInterval(() => {
    const f = document.getElementById('loginForm');
    if (f) { _mo.observe(f, { childList: true }); clearInterval(_start); }
  }, 500);
})();

const APP_TIMEZONE = window.APP_TIMEZONE || window._appTimezone || 'Asia/Jakarta';
const APP_TZ_LABEL = APP_TIMEZONE === 'Asia/Makassar' ? 'WITA'
                   : APP_TIMEZONE === 'Asia/Jayapura'  ? 'WIT'
                   : 'WIB';

let currentUser = null;
window.currentUser = null;
let initialExamHTML = '';
let adminSessionTimer = null;
const ADMIN_SESSION_DURATION_MS = 1 * 60 * 60 * 1000;

let currentExam = null;
let questions = [];
let answers = {};
let currentQIndex = 0;
let violationCount = 0;
let fullscreenExitCount = 0;
const MAX_FULLSCREEN_EXIT = 3;
let wakeLock = null;
