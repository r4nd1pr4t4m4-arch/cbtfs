/**
 * config.js — Copyright Badge (Protected IIFE)
 * SIPADU CBT v5.1.0
 *
 * Memasang badge copyright di halaman login.
 * Semua konstanta & variabel state ada di state.js.
 * Sumber: index.html L15173-15231
 */

(function() {
  const _idArr  = [114,97,110,100,105,45,112,114,97,116,97,109,97,45,115,101,99,117,114,101,45,102,111,111,116,101,114];
  const _txtArr = [169,32,67,111,112,121,114,105,103,104,116,32,82,97,110,100,105,32,80,114,97,116,97,109,97,44,32,83,46,80,100,46,32,124,32,72,97,107,32,67,105,112,116,97,32,68,105,108,105,110,100,117,110,103,105,32,85,110,100,97,110,103,45,85,110,100,97,110,103,32,45,32,67,66,84,32,86,101,114,115,105,111,110,32,52,46,53];

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
    _d.innerHTML = '<i class="fas fa-shield-alt"></i> <span>' + _dec(_txtArr) + '</span>';
    targetContainer.appendChild(_d);
    return true;
  }

  // Coba sekali saat load, lalu poll singkat sampai form tersedia.
  if (!_ensureBadge()) {
    let _tries = 0;
    const _it = setInterval(() => {
      if (_ensureBadge() || ++_tries > 40) clearInterval(_it);
    }, 500);
  }
  // Pasang ulang jika badge dihapus (mis. setelah form.reset()).
  const _mo = new MutationObserver(() => { _ensureBadge(); });
  const _start = setInterval(() => {
    const f = document.getElementById('loginForm');
    if (f) { _mo.observe(f, { childList: true }); clearInterval(_start); }
  }, 500);
})();
