/**
 * config.js — Konfigurasi Sistem
 * renderConfigPage() + loadConfigToForm() + handleSaveConfig() + semua config helpers
 * Sumber: index.html L37022-38181
 */

function renderConfigPage(container) {
    container.innerHTML = [
      '<style> .cfgv2 { --c-blue:#2563eb;--c-indigo:#4f46e5;--c-violet:#7c3aed; --c-pink:#db2777;--c-emerald:#059669;--c-amber:#d97706;--c-slate:#475569; font-family:\'Segoe UI\',system-ui,sans-serif; } .cfgv2 .card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.06); } .cfgv2 .card-head { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #f1f5f9; } .cfgv2 .card-icon { width:32px;height:32px;border-radius:9px; display:flex;align-items:center;justify-content:center;flex-shrink:0; } .cfgv2 .card-body { padding:18px; } .cfgv2 .field-lbl { display:block;font-size:11px;font-weight:700; letter-spacing:.05em;text-transform:uppercase;color:#64748b;margin-bottom:5px; } .cfgv2 .field-inp { width:100%;border:1.5px solid #e2e8f0;padding:9px 12px; border-radius:9px;font-size:13px;color:#1e293b;outline:none;background:#fafafa; transition:border .15s,box-shadow .15s; } .cfgv2 .field-inp:focus { border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.1);background:#fff; } .cfgv2 .field-hint { font-size:11px;color:#94a3b8;margin-top:4px; } .cfgv2 .btn-primary { display:inline-flex;align-items:center;gap:6px; padding:8px 16px;background:#2563eb;color:#fff;border:none;border-radius:9px; font-size:12px;font-weight:700;cursor:pointer;transition:background .15s,transform .1s; } .cfgv2 .btn-primary:hover { background:#1d4ed8; } .cfgv2 .btn-primary:active { transform:scale(.97); } .cfgv2 .btn-ghost { display:inline-flex;align-items:center;gap:5px; padding:7px 12px;background:transparent;color:#64748b;border:1.5px solid #e2e8f0; border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s; } .cfgv2 .btn-ghost:hover { color:#ef4444;border-color:#fecaca;background:#fff5f5; } .cfgv2 .btn-outline { display:inline-flex;align-items:center;gap:6px; padding:8px 14px;background:#fff;color:#374151;border:1.5px solid #e2e8f0; border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s; } .cfgv2 .btn-outline:hover { border-color:#2563eb;color:#2563eb;background:#eff6ff; } .cfgv2 .hint-row { display:none;align-items:center;gap:8px; background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px; padding:8px 12px;margin-top:8px; } .cfgv2 .hint-row.flex { display:flex; } .cfgv2 .status-badge { display:none; } .cfgv2 .status-badge.show { display:inline-flex; } .cfgv2 .pulse { width:8px;height:8px;border-radius:50%;flex-shrink:0; animation:cfgPulse 2s infinite; } @keyframes cfgPulse { 0%,100%{opacity:1}50%{opacity:.45} } .cfgv2 .prog-bar { height:7px;background:#e2e8f0;border-radius:99px;overflow:hidden; } .cfgv2 .prog-fill { height:100%;border-radius:99px;transition:width .6s ease; } .cfgv2 .grid2 { display:grid;grid-template-columns:1fr 1fr;gap:14px; } .cfgv2 .grid3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px; } @media(max-width:640px){ .cfgv2 .grid2,.cfgv2 .grid3{grid-template-columns:1fr;} } .cfgv2 .divider { height:1px;background:#f1f5f9;margin:14px 0; } .cfgv2 .tag-active { display:inline-flex;align-items:center;gap:5px; padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700; } .cfgv2 .kop-fmt-row { display:flex;align-items:center;gap:8px;flex-wrap:wrap; } .cfgv2 .fmt-btn { display:inline-flex;align-items:center;justify-content:center; width:30px;height:30px;border:1.5px solid #e2e8f0;border-radius:7px; background:#fff;cursor:pointer;font-size:12px;color:#64748b;transition:all .12s; } .cfgv2 .fmt-btn:hover { border-color:#6366f1;color:#6366f1; } .cfgv2 .fmt-btn.on { background:#eff6ff;border-color:#2563eb;color:#2563eb; } .cfgv2 .fmt-size { border:1.5px solid #e2e8f0;border-radius:7px;padding:4px 6px; font-size:11px;width:60px;color:#374151;background:#fff;outline:none; } .cfgv2 .sect-num { display:inline-flex;align-items:center;justify-content:center; width:20px;height:20px;border-radius:50%;background:#2563eb;color:#fff; font-size:10px;font-weight:800;flex-shrink:0; } .cfgv2 .kop-preview-box { background:#f8fafc;border:1px solid #e2e8f0; border-radius:10px;padding:16px;min-height:80px; } .cfgv2 .progress-card { background:linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%); border-radius:14px;padding:18px 20px;color:#fff; } .cfgv2 .summ-card { background:#fff;border:1px solid #e2e8f0;border-radius:12px; padding:14px;cursor:pointer;transition:all .18s;text-align:center; } .cfgv2 .summ-card:hover { border-color:#93c5fd;box-shadow:0 4px 12px rgba(37,99,235,.1); transform:translateY(-2px); } .cfgv2 .cfg-summ-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; } @media(max-width:640px){ .cfgv2 .cfg-summ-grid { grid-template-columns:repeat(4,1fr); gap:8px; } .cfgv2 .cfg-summ-grid .summ-card { padding:10px 6px; border-radius:10px; } .cfgv2 .cfg-summ-grid .summ-card > div:first-child { font-size:20px; margin-bottom:4px; } .cfgv2 .cfg-summ-grid .summ-card > div:nth-child(2) { font-size:10px; margin-bottom:2px; } .cfgv2 .cfg-summ-grid .summ-card > div:nth-child(3) { font-size:9px; } } @media(max-width:360px){ .cfgv2 .cfg-summ-grid { grid-template-columns:repeat(2,1fr); } } </style>',
      '<form id="cfg-main-form" class="cfgv2 w-full max-w-4xl mx-auto pb-10 space-y-5" onsubmit="handleSaveConfig(event)">',
      '<div class="progress-card"><div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;"><div><h1 style="font-size:20px;font-weight:800;letter-spacing:-.3px;margin:0 0 4px;">&#9881; Konfigurasi Sistem</h1><p style="font-size:12px;opacity:.75;margin:0;">Kelola seluruh pengaturan aplikasi dari satu panel terpadu</p></div><button type="submit" style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;background:#fff;color:#1e40af;border:none;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.15);">&#128190; Simpan Semua</button></div><div style="margin-top:16px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;"><span style="font-size:11px;opacity:.8;font-weight:600;">KELENGKAPAN KONFIGURASI</span><span id="cfg-progress-pct" style="font-size:14px;font-weight:800;">&#8212;</span></div><div class="prog-bar" style="background:rgba(255,255,255,.25);"><div id="cfg-progress-fill" class="prog-fill" style="width:0%;background:#fff;"></div></div><p id="cfg-progress-note" style="font-size:11px;opacity:.7;margin-top:6px;"></p></div></div>',
      '<div class="cfg-summ-grid"><div class="summ-card" onclick="document.getElementById(\'sec-tampilan\').scrollIntoView({behavior:\'smooth\'})"><div style="font-size:18px;margin-bottom:5px;">&#127912;</div><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;">Tampilan</div><div id="cfg-sum-tampilan" style="font-size:10px;color:#94a3b8;">&#9679; Memuat...</div></div><div class="summ-card" onclick="document.getElementById(\'sec-ai\').scrollIntoView({behavior:\'smooth\'})"><div style="font-size:18px;margin-bottom:5px;">&#129302;</div><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;">AI</div><div id="cfg-sum-ai" style="font-size:10px;color:#94a3b8;">&#9679; Memuat...</div></div><div class="summ-card" onclick="document.getElementById(\'sec-kartu\').scrollIntoView({behavior:\'smooth\'})"><div style="font-size:18px;margin-bottom:5px;">&#127987;</div><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;">Kartu Ujian</div><div id="cfg-sum-kartu" style="font-size:10px;color:#94a3b8;">&#9679; Memuat...</div></div><div class="summ-card" onclick="document.getElementById(\'sec-kop\').scrollIntoView({behavior:\'smooth\'})"><div style="font-size:18px;margin-bottom:5px;">&#128196;</div><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;">KOP Surat</div><div id="cfg-sum-kop" style="font-size:10px;color:#94a3b8;">&#9679; Memuat...</div></div><div class="summ-card" onclick="document.getElementById(\'sec-imgfolder\').scrollIntoView({behavior:\'smooth\'})"><div style="font-size:18px;margin-bottom:5px;">&#128193;</div><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;">Folder Gambar</div><div id="cfg-sum-imgfolder" style="font-size:10px;color:#94a3b8;">&#9679; Memuat...</div></div><div class="summ-card" onclick="document.getElementById(\'sec-audfolder\').scrollIntoView({behavior:\'smooth\'})"><div style="font-size:18px;margin-bottom:5px;">&#127925;</div><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;">Folder Audio</div><div id="cfg-sum-audfolder" style="font-size:10px;color:#94a3b8;">&#9679; Memuat...</div></div><div class="summ-card" onclick="document.getElementById(\'sec-jadwalinput\').scrollIntoView({behavior:\'smooth\'})"><div style="font-size:18px;margin-bottom:5px;">&#128197;</div><div style="font-size:11px;font-weight:700;color:#1e293b;margin-bottom:3px;">Jadwal Input</div><div id="cfg-sum-jadwalinput" style="font-size:10px;color:#94a3b8;">&#9679; Memuat...</div></div></div>',
      '<div id="sec-tampilan" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#eff6ff;"><i class="fas fa-paint-brush" style="color:#2563eb;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num">1</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Tampilan Aplikasi</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Logo, judul, latar belakang halaman login</p></div></div><button type="button" onclick="resetCfgSection(\'tampilan\')" class="btn-ghost"><i class="fas fa-undo-alt"></i> Reset</button></div><div class="card-body"><div class="grid2"><div><label class="field-lbl" for="cfg-app-name">Nama Aplikasi</label><input type="text" id="cfg-app-name" name="appName" class="field-inp" placeholder="Contoh: CBT MTs Nurul Falah"></div><div><label class="field-lbl" for="cfg-app-subtitle">Subjudul Aplikasi</label><input type="text" id="cfg-app-subtitle" name="appSubtitle" class="field-inp" placeholder="Contoh: Tahun Ajaran 2025/2026"></div></div><div class="divider"></div><div><label class="field-lbl" for="cfg-app-logo">URL Logo Aplikasi</label><div style="display:flex;gap:6px;"><input type="url" id="cfg-app-logo" name="appLogo" class="field-inp" placeholder="https://..." oninput="updateLogoPreview(this.value)" style="flex:1;"></div><p class="field-hint">URL gambar publik (JPG/PNG/SVG)</p><div id="cfg-logo-results" style="margin-top:6px;max-height:120px;overflow-y:auto;"></div><div style="margin-top:8px;height:52px;background:#f8fafc;border:1px dashed #e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><img id="cfg-logo-preview" src="" alt="logo preview" style="max-height:48px;max-width:160px;object-fit:contain;display:none;"><span id="cfg-logo-placeholder" style="font-size:11px;color:#cbd5e1;">Preview logo</span></div></div><div class="divider"></div><label style="display:flex;align-items:center;gap:10px;cursor:pointer;width:fit-content;"><input type="checkbox" id="cfg-show-result" name="showExamResult" style="width:16px;height:16px;accent-color:#2563eb;cursor:pointer;"><div><span style="font-size:13px;font-weight:600;color:#1e293b;">Tampilkan nilai setelah ujian selesai</span><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Jika dicentang, siswa dapat melihat nilai dan kunci jawaban setelah submit</p></div></label><div class="divider" style="margin:12px 0;"></div><label style="display:flex;align-items:center;gap:10px;cursor:pointer;width:fit-content;"><input type="checkbox" id="cfg-essay-canvas" name="essayCanvasEnabled" style="width:16px;height:16px;accent-color:#7c3aed;cursor:pointer;"><div><span style="font-size:13px;font-weight:600;color:#1e293b;"><i class="fas fa-paint-brush" style="color:#7c3aed;margin-right:5px;font-size:12px;"></i>Aktifkan Canvas Gambar pada Soal Esai</span><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Jika dicentang, siswa dapat menggambar rumus/diagram di kanvas pada soal Esai — berguna untuk Matematika dan IPA.</p></div></label><div class="divider" style="margin:12px 0;"></div><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><div style="flex:0 0 auto;"><label class="field-lbl" for="cfg-violation-limit" style="margin-bottom:4px;display:flex;align-items:center;gap:5px;"><i class="fas fa-exclamation-triangle" style="color:#f59e0b;font-size:11px;"></i>Batas Pelanggaran (Monitor)</label><input type="number" id="cfg-violation-limit" name="violationLimit" min="0" step="1" value="3" class="field-inp" style="width:90px;text-align:center;font-weight:800;" placeholder="3"></div><p class="field-hint" style="margin-top:0;flex:1;">Jumlah pelanggaran maksimum sebelum dianggap mencurigakan. Dipakai sebagai nilai default filter di Halaman Monitor. Set ke 0 untuk menonaktifkan.</p></div></div></div>',
      '<div id="sec-ai" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#eef2ff;"><i class="fas fa-robot" style="color:#4f46e5;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#4f46e5;">2</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Integrasi AI</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Anthropic API Key untuk penilaian esai & konversi rumus otomatis</p></div></div><div style="display:flex;align-items:center;gap:8px;"><div id="cfg-ai-status-badge"></div><button type="button" onclick="resetCfgSection(\'ai\')" class="btn-ghost"><i class="fas fa-undo-alt"></i> Reset</button></div></div><div class="card-body"><div id="cfg-ai-key-hint" class="hint-row"><i class="fas fa-check-circle" style="color:#059669;"></i><span style="font-size:12px;color:#065f46;font-weight:600;">API Key aktif:</span><code id="cfg-ai-key-masked" style="font-family:monospace;font-size:11px;background:#d1fae5;padding:2px 7px;border-radius:5px;color:#065f46;"></code><button type="button" onclick="clearAiKeyInput()" class="btn-ghost" style="margin-left:auto;padding:4px 10px;font-size:10px;"><i class="fas fa-pen"></i> Ganti Key</button></div><div style="margin-top:10px;"><label class="field-lbl" for="cfg-anthropic-key">Anthropic API Key</label><div style="display:flex;gap:8px;"><div style="position:relative;flex:1;"><input type="password" id="cfg-anthropic-key" name="anthropicApiKey" class="field-inp" placeholder="sk-ant-api03-..." style="padding-right:90px;"><button type="button" onclick="toggleAiKeyVisibility()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:11px;color:#64748b;font-weight:600;padding:4px 6px;"><i id="icon-ai-key-vis" class="fas fa-eye"></i><span id="label-ai-key-vis">Tampilkan</span></button></div><button type="button" onclick="testAiApiKeyNow()" class="btn-primary"><i class="fas fa-plug"></i> Test Koneksi</button></div><p class="field-hint">Dapatkan API Key gratis di <a href="https://console.anthropic.com/settings/keys" target="_blank" style="color:#4f46e5;">console.anthropic.com</a></p></div><div id="cfg-ai-test-result" style="margin-top:10px;font-size:12px;"></div></div></div>',
      '<div id="sec-kartu" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#f5f3ff;"><i class="fas fa-id-card" style="color:#7c3aed;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#7c3aed;">3</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Kartu Ujian Siswa</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Template Slides dan Folder Drive untuk mencetak kartu ujian</p></div></div><div style="display:flex;align-items:center;gap:8px;"><div id="cfg-kartu-status-badge"></div><button type="button" onclick="resetCfgSection(\'kartu\')" class="btn-ghost"><i class="fas fa-undo-alt"></i> Reset</button></div></div><div class="card-body"><p style="font-size:12px;color:#64748b;margin:0 0 12px;line-height:1.6;">Salin <strong>ID dokumen</strong> dari URL Google Slides (Template) dan URL Google Drive (Folder output). ID berada di antara <code style="background:#f1f5f9;padding:1px 5px;border-radius:4px;">/d/</code> dan <code style="background:#f1f5f9;padding:1px 5px;border-radius:4px;">/edit</code> pada URL.</p><div class="grid2"><div><label class="field-lbl" for="cfg-kartu-template-id"><i class="fas fa-file-powerpoint" style="color:#7c3aed;margin-right:4px;"></i>Template ID (Google Slides)</label><div id="cfg-kartu-template-hint" class="hint-row" style="margin-bottom:8px;"><i class="fas fa-check-circle" style="color:#059669;"></i><code id="cfg-kartu-template-name" style="font-family:monospace;font-size:11px;background:#d1fae5;padding:2px 7px;border-radius:5px;color:#065f46;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></code><button type="button" onclick="clearKartuTemplateInput()" class="btn-ghost" style="padding:3px 8px;font-size:10px;flex-shrink:0;"><i class="fas fa-pen"></i></button></div><input type="text" id="cfg-kartu-template-id" name="kartuTemplateId" class="field-inp" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"><p class="field-hint">ID Google Slides yang digunakan sebagai template kartu</p></div><div><label class="field-lbl" for="cfg-kartu-folder-id"><i class="fas fa-folder" style="color:#7c3aed;margin-right:4px;"></i>Folder ID (Output Drive)</label><div id="cfg-kartu-folder-hint" class="hint-row" style="margin-bottom:8px;"><i class="fas fa-check-circle" style="color:#059669;"></i><code id="cfg-kartu-folder-name" style="font-family:monospace;font-size:11px;background:#d1fae5;padding:2px 7px;border-radius:5px;color:#065f46;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></code><button type="button" onclick="clearKartuFolderInput()" class="btn-ghost" style="padding:3px 8px;font-size:10px;flex-shrink:0;"><i class="fas fa-pen"></i></button></div><input type="text" id="cfg-kartu-folder-id" name="kartuFolderId" class="field-inp" placeholder="1a2B3cD4eF5gH6iJ7kL8mN9oP0qR1sT2u"><p class="field-hint">ID Folder Google Drive tempat file kartu disimpan</p></div></div><div style="margin-top:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><button type="button" onclick="validateKartuConfigNow()" class="btn-outline"><i class="fas fa-check-double" style="color:#7c3aed;"></i> Validasi Akses</button><div id="cfg-kartu-validate-result" style="font-size:12px;flex:1;"></div></div></div></div>',
      '<div id="sec-imgfolder" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#fdf2f8;"><i class="fas fa-folder-open" style="color:#db2777;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#db2777;">4</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Folder Upload Gambar Guru</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Folder Google Drive untuk guru mengunggah gambar soal</p></div></div><div style="display:flex;align-items:center;gap:8px;"><div id="cfg-imgfolder-status-badge"></div><button type="button" onclick="resetCfgSection(\'imgfolder\')" class="btn-ghost"><i class="fas fa-undo-alt"></i> Reset</button></div></div><div class="card-body"><div id="cfg-imgfolder-hint" class="hint-row" style="margin-bottom:12px;"><i class="fas fa-check-circle" style="color:#059669;"></i><span style="font-size:12px;color:#065f46;font-weight:600;">Folder aktif:</span><code id="cfg-imgfolder-masked" style="font-family:monospace;font-size:11px;background:#d1fae5;padding:2px 7px;border-radius:5px;color:#065f46;"></code><button type="button" onclick="clearImgFolderInput()" class="btn-ghost" style="margin-left:auto;padding:4px 10px;font-size:10px;"><i class="fas fa-pen"></i> Ganti</button></div><label class="field-lbl" for="cfg-img-upload-folder-url"><i class="fas fa-link" style="color:#db2777;margin-right:4px;"></i>URL atau ID Folder Google Drive</label><div style="display:flex;gap:8px;"><input type="text" id="cfg-img-upload-folder-url" name="imgUploadFolderUrl" class="field-inp" placeholder="https://drive.google.com/drive/folders/..." style="flex:1;"><button type="button" onclick="testImgUploadFolder()" class="btn-primary" style="background:#db2777;flex-shrink:0;"><i class="fas fa-check"></i> Simpan &amp; Validasi</button></div><p class="field-hint">Paste URL folder atau ID langsung. Folder harus dapat diakses oleh akun yang menjalankan script ini.</p><div id="cfg-imgfolder-test-result" style="margin-top:10px;font-size:12px;"></div></div></div>',
      '<div id="sec-audfolder" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#ecfeff;"><i class="fas fa-music" style="color:#0891b2;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#0891b2;">5</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Folder Upload Audio Guru</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Folder Google Drive untuk guru mengunggah audio soal</p></div></div><div style="display:flex;align-items:center;gap:8px;"><div id="cfg-audfolder-status-badge"></div><button type="button" onclick="resetCfgSection(\'audfolder\')" class="btn-ghost"><i class="fas fa-undo-alt"></i> Reset</button></div></div><div class="card-body"><div id="cfg-audfolder-hint" class="hint-row" style="margin-bottom:12px;"><i class="fas fa-check-circle" style="color:#059669;"></i><span style="font-size:12px;color:#065f46;font-weight:600;">Folder aktif:</span><code id="cfg-audfolder-masked" style="font-family:monospace;font-size:11px;background:#d1fae5;padding:2px 7px;border-radius:5px;color:#065f46;"></code><button type="button" onclick="clearAudFolderInput()" class="btn-ghost" style="margin-left:auto;padding:4px 10px;font-size:10px;"><i class="fas fa-pen"></i> Ganti</button></div><label class="field-lbl" for="cfg-aud-upload-folder-url"><i class="fas fa-link" style="color:#0891b2;margin-right:4px;"></i>URL atau ID Folder Google Drive</label><div style="display:flex;gap:8px;"><input type="text" id="cfg-aud-upload-folder-url" name="audioUploadFolderUrl" class="field-inp" placeholder="https://drive.google.com/drive/folders/..." style="flex:1;"><button type="button" onclick="testAudUploadFolder()" class="btn-primary" style="background:#0891b2;flex-shrink:0;"><i class="fas fa-check"></i> Simpan &amp; Validasi</button></div><p class="field-hint">Paste URL folder atau ID langsung. Folder harus dapat diakses oleh akun yang menjalankan script ini.</p><div id="cfg-audfolder-test-result" style="margin-top:10px;font-size:12px;"></div></div></div>',
      '<div id="sec-kop" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#f0fdf4;"><i class="fas fa-file-invoice" style="color:#059669;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#059669;">6</span><span style="font-size:14px;font-weight:800;color:#1e293b;">KOP Surat &amp; Identitas Sekolah</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Data ini muncul di header PDF Rekap Nilai dan Kartu Ujian</p></div></div><button type="button" onclick="resetCfgSection(\'kop\')" class="btn-ghost"><i class="fas fa-undo-alt"></i> Reset</button></div><div class="card-body"><div class="grid2" style="margin-bottom:14px;"><div><label class="field-lbl" for="cfg-kop-logo"><i class="fas fa-image" style="color:#059669;margin-right:4px;"></i>Logo Sekolah (URL)</label><input type="url" id="cfg-kop-logo" name="pdfKopLogo" class="field-inp" placeholder="https://..." oninput="updateKopPreview()"><p class="field-hint">URL gambar logo yang akan muncul di header PDF</p></div><div><div class="field-lbl">Preview KOP Surat</div><div class="kop-preview-box" id="cfg-kop-preview"><div style="display:flex;align-items:center;gap:10px;"><img id="cfg-kop-logo-img" src="" style="height:48px;width:auto;object-fit:contain;display:none;" onerror="this.style.display=\'none\'"><div style="flex:1;text-align:center;"><div id="cfg-kop-prev-b1" style="font-size:11px;color:#94a3b8;">&#8212;</div><div id="cfg-kop-prev-b2" style="font-size:10px;color:#94a3b8;"></div><div id="cfg-kop-prev-b3" style="font-size:10px;color:#94a3b8;"></div><div id="cfg-kop-prev-alamat" style="font-size:9px;color:#94a3b8;"></div><div id="cfg-kop-prev-kontak" style="font-size:9px;color:#94a3b8;"></div></div></div></div></div></div><div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;"><div><label class="field-lbl" for="cfg-kop-baris1">Baris 1 &mdash; Nama Instansi Induk</label><input type="text" id="cfg-kop-baris1" name="baris1" class="field-inp" placeholder="Contoh: PEMERINTAH KAB. BANDUNG"></div><div style="padding-bottom:1px;"><div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:600;">FORMAT</div><div class="kop-fmt-row"><button type="button" id="kop-fmt-baris1-bold" class="fmt-btn" onclick="toggleKopFmt(\'baris1\',\'bold\')" title="Bold"><b>B</b></button><button type="button" id="kop-fmt-baris1-italic" class="fmt-btn" onclick="toggleKopFmt(\'baris1\',\'italic\')" title="Italic"><i>I</i></button><select id="kop-fmt-baris1-size" class="fmt-size" onchange="setKopFmtSize(\'baris1\', this.value)" title="Ukuran font"><option value="7">7pt</option><option value="8">8pt</option><option value="9">9pt</option><option value="10" selected>10pt</option><option value="11">11pt</option><option value="12">12pt</option><option value="14">14pt</option><option value="16">16pt</option></select></div></div></div><div style="height:10px;"></div><div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;"><div><label class="field-lbl" for="cfg-kop-baris2">Baris 2 &mdash; Nama Dinas/Unit</label><input type="text" id="cfg-kop-baris2" name="baris2" class="field-inp" placeholder="Contoh: DINAS PENDIDIKAN"></div><div style="padding-bottom:1px;"><div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:600;">FORMAT</div><div class="kop-fmt-row"><button type="button" id="kop-fmt-baris2-bold" class="fmt-btn" onclick="toggleKopFmt(\'baris2\',\'bold\')" title="Bold"><b>B</b></button><button type="button" id="kop-fmt-baris2-italic" class="fmt-btn" onclick="toggleKopFmt(\'baris2\',\'italic\')" title="Italic"><i>I</i></button><select id="kop-fmt-baris2-size" class="fmt-size" onchange="setKopFmtSize(\'baris2\', this.value)" title="Ukuran font"><option value="7">7pt</option><option value="8">8pt</option><option value="9">9pt</option><option value="10" selected>10pt</option><option value="11">11pt</option><option value="12">12pt</option><option value="14">14pt</option><option value="16">16pt</option></select></div></div></div><div style="height:10px;"></div><div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;"><div><label class="field-lbl" for="cfg-kop-baris3">Baris 3 &mdash; Nama Sekolah</label><input type="text" id="cfg-kop-baris3" name="baris3" class="field-inp" placeholder="Contoh: SMP NEGERI 1 BANDUNG"></div><div style="padding-bottom:1px;"><div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:600;">FORMAT</div><div class="kop-fmt-row"><button type="button" id="kop-fmt-baris3-bold" class="fmt-btn" onclick="toggleKopFmt(\'baris3\',\'bold\')" title="Bold"><b>B</b></button><button type="button" id="kop-fmt-baris3-italic" class="fmt-btn" onclick="toggleKopFmt(\'baris3\',\'italic\')" title="Italic"><i>I</i></button><select id="kop-fmt-baris3-size" class="fmt-size" onchange="setKopFmtSize(\'baris3\', this.value)" title="Ukuran font"><option value="7">7pt</option><option value="8">8pt</option><option value="9">9pt</option><option value="10" selected>10pt</option><option value="11">11pt</option><option value="12">12pt</option><option value="14">14pt</option><option value="16">16pt</option></select></div></div></div><div style="height:10px;"></div><div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;"><div><label class="field-lbl" for="cfg-kop-alamat">Alamat Sekolah</label><input type="text" id="cfg-kop-alamat" name="alamat" class="field-inp" placeholder="Contoh: Jl. Raya Pendidikan No.1, Bandung"></div><div style="padding-bottom:1px;"><div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:600;">FORMAT</div><div class="kop-fmt-row"><button type="button" id="kop-fmt-alamat-bold" class="fmt-btn" onclick="toggleKopFmt(\'alamat\',\'bold\')" title="Bold"><b>B</b></button><button type="button" id="kop-fmt-alamat-italic" class="fmt-btn" onclick="toggleKopFmt(\'alamat\',\'italic\')" title="Italic"><i>I</i></button><select id="kop-fmt-alamat-size" class="fmt-size" onchange="setKopFmtSize(\'alamat\', this.value)" title="Ukuran font"><option value="7">7pt</option><option value="8">8pt</option><option value="9">9pt</option><option value="10" selected>10pt</option><option value="11">11pt</option><option value="12">12pt</option><option value="14">14pt</option><option value="16">16pt</option></select></div></div></div><div style="height:10px;"></div><div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;"><div><label class="field-lbl" for="cfg-kop-kontak">Telepon / Email / Website</label><input type="text" id="cfg-kop-kontak" name="kontak" class="field-inp" placeholder="Contoh: Telp: (022) 123456 | email@sekolah.sch.id"></div><div style="padding-bottom:1px;"><div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:600;">FORMAT</div><div class="kop-fmt-row"><button type="button" id="kop-fmt-kontak-bold" class="fmt-btn" onclick="toggleKopFmt(\'kontak\',\'bold\')" title="Bold"><b>B</b></button><button type="button" id="kop-fmt-kontak-italic" class="fmt-btn" onclick="toggleKopFmt(\'kontak\',\'italic\')" title="Italic"><i>I</i></button><select id="kop-fmt-kontak-size" class="fmt-size" onchange="setKopFmtSize(\'kontak\', this.value)" title="Ukuran font"><option value="7">7pt</option><option value="8">8pt</option><option value="9">9pt</option><option value="10" selected>10pt</option><option value="11">11pt</option><option value="12">12pt</option><option value="14">14pt</option><option value="16">16pt</option></select></div></div></div><div class="divider"></div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:12px;font-weight:700;color:#475569;margin-bottom:10px;"><i class="fas fa-user-tie" style="margin-right:6px;color:#059669;"></i>Kepala Sekolah / Penandatangan</div><div class="grid2"><div><label class="field-lbl" for="cfg-kop-kepala-nama">Nama Lengkap + Gelar</label><input type="text" id="cfg-kop-kepala-nama" name="pdfKopKepalaNama" class="field-inp" placeholder="Contoh: Drs. Ahmad Fauzi, S.Pd., M.M."></div><div><label class="field-lbl" for="cfg-kop-kepala-nip">NIP</label><input type="text" id="cfg-kop-kepala-nip" name="pdfKopKepalaNip" class="field-inp" placeholder="Contoh: 196501011990031001"></div></div></div></div></div>',
      '<div id="sec-jadwalinput" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#fef3c7;"><i class="fas fa-calendar-alt" style="color:#d97706;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#d97706;">7</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Jadwal Input Soal &amp; Notifikasi</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Pengaturan periode guru menyusun soal dan notifikasi email</p></div></div></div><div class="card-body"><div class="grid2" style="margin-bottom:14px;"><div><label class="field-lbl" for="cfg-input-period-start">Mulai Input Soal</label><input type="datetime-local" id="cfg-input-period-start" name="input_period_start" class="field-inp"><p class="field-hint">Waktu sistem CBT dibuka untuk input soal.</p></div><div><label class="field-lbl" for="cfg-input-period-end">Batas Akhir (Deadline)</label><input type="datetime-local" id="cfg-input-period-end" name="input_period_end" class="field-inp"><p class="field-hint">Waktu sistem dikunci dari penginputan.</p></div></div><div class="divider"></div><label style="display:flex;align-items:center;gap:10px;cursor:pointer;width:fit-content;margin-bottom:12px;"><input type="checkbox" id="cfg-input-period-enabled" name="input_period_enabled" style="width:16px;height:16px;accent-color:#d97706;cursor:pointer;"><div><span style="font-size:13px;font-weight:600;color:#1e293b;">Aktifkan Penegakan Jadwal</span><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Jika dicentang, guru tidak bisa input/edit soal di luar jadwal di atas.</p></div></label><div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:12px 14px;margin-bottom:14px;"><p style="font-size:12px;color:#b45309;margin:0;line-height:1.6;"><i class="fas fa-envelope-open-text" style="margin-right:5px;"></i><strong>Notifikasi Email Otomatis:</strong> Sistem akan mengirimkan pengingat ke guru yang belum menyelesaikan target soal pada H-1 deadline. Trigger perlu diaktifkan terlebih dahulu.</p></div><div style="display:flex;gap:10px;flex-wrap:wrap;"><button type="button" onclick="handleSetupInputReminderTrigger()" class="btn-primary" style="background:#d97706;"><i class="fas fa-bell"></i> Aktifkan Notifikasi</button><button type="button" onclick="handleRemoveInputReminderTrigger()" class="btn-ghost" style="border-color:#fecaca;color:#ef4444;"><i class="fas fa-ban"></i> Nonaktifkan</button></div><div id="trigger-input-reminder-status" style="margin-top:10px;font-size:12px;font-weight:600;"></div></div></div>',
      '<div id="sec-jadwal" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#eff6ff;"><i class="fas fa-clock" style="color:#2563eb;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#2563eb;">8</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Jadwal Otomatis</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Pengaturan Trigger GAS untuk aktivasi ujian & batas waktu esai</p></div></div><div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;"><div id="auto-trigger-status"><span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:20px;font-size:11px;font-weight:700;color:#64748b;"><span class="pulse" style="background:#94a3b8;"></span> Mengecek Auto-Active...</span></div><div id="auto-timeout-trigger-status"><span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:20px;font-size:11px;font-weight:700;color:#64748b;"><span class="pulse" style="background:#94a3b8;"></span> Mengecek Auto-Timeout...</span></div></div></div><div class="card-body"><div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 14px;margin-bottom:14px;"><p style="font-size:12px;color:#1e40af;margin:0;line-height:1.6;"><i class="fas fa-info-circle" style="margin-right:5px;"></i><strong>Auto-Active:</strong> Trigger berjalan setiap 5 menit untuk mengubah status ujian menjadi <strong>Aktif</strong> atau <strong>Non-Aktif</strong> berdasarkan kolom <code style="background:#dbeafe;padding:1px 5px;border-radius:3px;">Date</code> dan <code style="background:#dbeafe;padding:1px 5px;border-radius:3px;">EndDate</code> di sheet Ujian.</p></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;"><button type="button" onclick="handleSetupAutoTrigger()" class="btn-primary"><i class="fas fa-bolt"></i> Aktifkan Auto-Active</button><button type="button" onclick="handleRemoveAutoTrigger()" class="btn-ghost" style="border-color:#fecaca;color:#ef4444;"><i class="fas fa-ban"></i> Nonaktifkan Auto-Active</button></div><div class="divider"></div><div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 14px;margin-bottom:14px;"><p style="font-size:12px;color:#9a3412;margin:0;line-height:1.6;"><i class="fas fa-hourglass-end" style="margin-right:5px;"></i><strong>Auto-Timeout:</strong> Mengubah status siswa "In Progress" yang ujiannya sudah habis menjadi "Waktu Habis" secara otomatis dan menilai esainya. Trigger berjalan setiap hari pada jam tertentu.</p></div><div style="display:flex;align-items:end;gap:10px;flex-wrap:wrap;"><div style="flex:1;"><label class="field-lbl" for="cfg-auto-timeout-hour">Jam Eksekusi Auto-Timeout (0-23)</label><input type="number" id="cfg-auto-timeout-hour" name="autoTimeoutHour" class="field-inp" min="0" max="23" placeholder="16"></div><button type="button" onclick="handleSetupAutoTimeoutTrigger()" class="btn-primary" style="background:#ea580c;flex-shrink:0;"><i class="fas fa-clock"></i> Setup Auto-Timeout</button></div></div></div>',
      '<div id="sec-backup" class="card"><div class="card-head"><div style="display:flex;align-items:center;gap:10px;"><div class="card-icon" style="background:#eff6ff;"><i class="fas fa-cloud-upload-alt" style="color:#2563eb;font-size:13px;"></i></div><div><div style="display:flex;align-items:center;gap:7px;"><span class="sect-num" style="background:#2563eb;">9</span><span style="font-size:14px;font-weight:800;color:#1e293b;">Backup Data</span></div><p style="font-size:11px;color:#94a3b8;margin:2px 0 0;">Salin seluruh database ke folder CBT_BACKUPS di Google Drive</p></div></div></div><div class="card-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:4px;"><i class="fas fa-download" style="color:#2563eb;margin-right:6px;"></i>Backup Manual</div><p style="font-size:11px;color:#64748b;margin:0 0 12px;line-height:1.5;">Jalankan backup sekarang ke folder <code style="background:#e2e8f0;padding:1px 4px;border-radius:3px;">CBT_BACKUPS</code> di Google Drive Anda.</p><button type="button" onclick="handleManualBackup()" class="btn-primary" style="width:100%;justify-content:center;"><i class="fas fa-cloud-upload-alt"></i> Backup Sekarang</button></div><div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;"><div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:4px;"><i class="fas fa-calendar-alt" style="color:#059669;margin-right:6px;"></i>Backup Otomatis Semester</div><p style="font-size:11px;color:#64748b;margin:0 0 12px;line-height:1.5;">Setup trigger otomatis backup setiap <strong>30 Juni</strong> dan <strong>31 Desember</strong>.</p><button type="button" onclick="handleSetupSemesterBackup()" class="btn-outline" style="width:100%;justify-content:center;"><i class="fas fa-clock" style="color:#059669;"></i> Setup Trigger Semester</button></div></div></div></div>',
      '</form>'
    ].join('');
    loadConfigToForm();

    // Mobile floating Save button (FAB)
    if (!document.getElementById('cfg-fab-save')) {
      const fab = document.createElement('button');
      fab.id = 'cfg-fab-save';
      fab.type = 'button';
      fab.innerHTML = '<i class="fas fa-floppy-disk"></i> Simpan Konfigurasi';
      fab.onclick = function() {
        const form = document.getElementById('cfg-main-form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      };
      document.body.appendChild(fab);
    }
    const _fabEl = document.getElementById('cfg-fab-save');
    if (_fabEl) _fabEl.classList.add('show');

    // Live progress update on input change
    setTimeout(function() {
      const form = document.getElementById('cfg-main-form');
      if (form && !form.dataset.progressBound) {
        form.addEventListener('input', () => { try { updateCfgProgress(); } catch(e){} });
        form.dataset.progressBound = '1';
      }
    }, 100);
    setTimeout(function() {
        try {
            google.script.run
                .withSuccessHandler(function(res) {
                    var el = document.getElementById('auto-trigger-status');
                    if (!el) return;
                    el.innerHTML = (res && res.active)
                        ? '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm border border-emerald-200"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Aktif — setiap 5 menit</span>'
                        : '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-sm border border-slate-200"><span class="w-2 h-2 rounded-full bg-slate-400"></span> Tidak Aktif</span>';
                })
                .withFailureHandler(function(err) {
                    var el = document.getElementById('auto-trigger-status');
                    if (el) el.innerHTML = '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs border border-red-200"><i class="fas fa-exclamation-circle mr-1"></i> Gagal cek status</span>';
                    console.warn('checkAutoActivateTriggerStatus error:', err);
                })
                .checkAutoActivateTriggerStatus();
        } catch(e) { console.warn('trigger check failed', e); }

        // Cek status auto-timeout trigger secara terpisah agar tidak race condition
        try {
            google.script.run
                .withSuccessHandler(function(res) {
                    var el = document.getElementById('auto-timeout-trigger-status');
                    if (!el) return;
                    if (res && res.active) {
                        var hr = (res.hour !== undefined && res.hour !== null) ? res.hour : '';
                        el.innerHTML = '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-sm border border-orange-200"><span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Timeout Aktif' + (hr !== '' ? ' (Jam ' + hr + ':00)' : '') + '</span>';
                    } else {
                        el.innerHTML = '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-sm border border-slate-200"><span class="w-2 h-2 rounded-full bg-slate-400"></span> Timeout Nonaktif</span>';
                    }
                })
                .withFailureHandler(function(err) {
                    var el = document.getElementById('auto-timeout-trigger-status');
                    if (el) el.innerHTML = '<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-500 text-xs border border-red-200"><i class="fas fa-exclamation-circle mr-1"></i> Gagal cek status</span>';
                    console.warn('checkAutoTimeoutTriggerStatus error:', err);
                })
                .checkAutoTimeoutTriggerStatus();
        } catch(e) { console.warn('timeout trigger check failed', e); }
    }, 500);
}


function updateLogoPreview(url) {
    const img = document.getElementById('cfg-logo-preview');
    const placeholder = document.getElementById('cfg-logo-placeholder');
    if (!img) return;
    if (url) {
        img.style.display = 'block';
        img.src = url;
        img.onerror = () => {
          img.style.display = 'none';
          if (placeholder) {
            placeholder.style.display = 'inline';
            placeholder.style.color = '#dc2626';
            placeholder.textContent = 'Gambar gagal dimuat';
          }
        };
        img.onload = () => {
          if (placeholder) {
            placeholder.style.display = 'none';
            placeholder.style.color = '';
            placeholder.textContent = 'Preview logo';
          }
        };
    } else {
        img.style.display = 'none';
        img.src = '';
        if (placeholder) {
          placeholder.style.display = 'inline';
          placeholder.style.color = '';
          placeholder.textContent = 'Preview logo';
        }
    }
}

function initKopFmt() {
    window._kopFmt = {
        baris1: { bold: true,  italic: false, size: 10 },
        baris2: { bold: true,  italic: false, size: 10 },
        baris3: { bold: true,  italic: false, size: 13 },
        alamat: { bold: false, italic: true,  size: 9  },
        kontak: { bold: false, italic: true,  size: 9  },
    };
}

function toggleKopFmt(field, prop) {
    if (!window._kopFmt) initKopFmt();
    window._kopFmt[field][prop] = !window._kopFmt[field][prop];
    const btn = document.getElementById('kop-fmt-' + field + '-' + prop);
    if (btn) btn.classList.toggle('on', window._kopFmt[field][prop]);
    updateKopPreview();
}

function setKopFmtSize(field, size) {
    if (!window._kopFmt) initKopFmt();
    window._kopFmt[field].size = parseInt(size) || 10;
    updateKopPreview();
}

function applyKopFmtToUI() {
    if (!window._kopFmt) return;
    const fields = ['baris1', 'baris2', 'baris3', 'alamat', 'kontak'];
    fields.forEach(f => {
        const fmt = window._kopFmt[f];
        if (!fmt) return;
        const boldBtn   = document.getElementById('kop-fmt-' + f + '-bold');
        const italicBtn = document.getElementById('kop-fmt-' + f + '-italic');
        const sizeEl    = document.getElementById('kop-fmt-' + f + '-size');
        if (boldBtn)   boldBtn.classList.toggle('on', !!fmt.bold);
        if (italicBtn) italicBtn.classList.toggle('on', !!fmt.italic);
        if (sizeEl)    sizeEl.value = String(fmt.size);
    });
}

function updateKopPreview() {
    const logo   = (document.getElementById('cfg-kop-logo')   || {}).value || '';
    const baris1 = (document.getElementById('cfg-kop-baris1') || {}).value || '';
    const baris2 = (document.getElementById('cfg-kop-baris2') || {}).value || '';
    const baris3 = (document.getElementById('cfg-kop-baris3') || {}).value || '';
    const alamat = (document.getElementById('cfg-kop-alamat') || {}).value || '';
    const kontak = (document.getElementById('cfg-kop-kontak') || {}).value || '';

    const hasAny = logo || baris1 || baris2 || baris3 || alamat || kontak;
    const preview = document.getElementById('cfg-kop-preview');
    if (preview) preview.style.display = hasAny ? '' : 'none';

    const logoImg = document.getElementById('cfg-kop-logo-img');
    if (logoImg) {
        logoImg.src = logo;
        logoImg.style.display = logo ? 'block' : 'none';
    }

    if (!window._kopFmt) initKopFmt();
    const fmt = window._kopFmt;

    const applyFmt = (elId, text, field) => {
        const el = document.getElementById(elId);
        if (!el) return;
        el.textContent = text;
        const f = fmt[field] || {};
        el.style.fontSize   = (f.size || 10) + 'px';
        el.style.fontWeight = f.bold   ? '700' : '400';
        el.style.fontStyle  = f.italic ? 'italic' : 'normal';
        el.style.lineHeight = '1.4';
    };

    applyFmt('cfg-kop-prev-b1',     baris1, 'baris1');
    applyFmt('cfg-kop-prev-b2',     baris2, 'baris2');
    applyFmt('cfg-kop-prev-b3',     baris3, 'baris3');
    applyFmt('cfg-kop-prev-alamat', alamat, 'alamat');
    applyFmt('cfg-kop-prev-kontak', kontak, 'kontak');
}

// toggleCfgAccordion dan openCfgSection dihapus — dead wrappers yang hanya
// meneruskan ke switchCfgTab, tidak dipanggil dari manapun dalam project.

function resetCfgSection(section) {
    const sectionLabels = { tampilan:'Tampilan Aplikasi', ai:'Integrasi AI', kartu:'Kartu Ujian', kop:'KOP Surat', imgfolder:'Folder Upload Guru', audfolder:'Folder Upload Audio Guru' };
    Swal.fire({
        title: 'Reset Seksi?',
        html: `<p style="font-size:13px;color:#475569;">Semua isian pada seksi <b>${sectionLabels[section] || section}</b> akan dikosongkan dan langsung disimpan ke server.</p>
               <p style="font-size:11px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:8px;margin-top:8px;">
                 <i class="fas fa-triangle-exclamation"></i> Tindakan ini tidak dapat dibatalkan.
               </p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-rotate-left mr-1"></i> Ya, Reset & Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
        customClass:{ popup:'lp-swal' }
    }).then(result => {
        if (!result.isConfirmed) return;

        var clearPayload = {};
        if (section === 'tampilan') {
            clearPayload = {
                appName: '', appSubtitle: '', appLogo: '',
                appBackground: '', showExamResult: 'false',
                essayCanvasEnabled: 'false'
            };
        } else if (section === 'ai') {
            clearPayload = { anthropicApiKey: '__CLEAR__' };
        } else if (section === 'kartu') {
            clearPayload = {
                kartuTemplateId: '__CLEAR__',
                kartuFolderId:   '__CLEAR__'
            };
            window._kartuCfg = { tplSet: false, folSet: false, loaded: true };
        } else if (section === 'kop') {
            clearPayload = {
                pdfKopLogo: '__CLEAR__', pdfKopBaris1: '__CLEAR__',
                pdfKopBaris2: '__CLEAR__', pdfKopBaris3: '__CLEAR__',
                pdfKopAlamat: '__CLEAR__', pdfKopKontak: '__CLEAR__',
                pdfKopKepalaNama: '__CLEAR__', pdfKopKepalaNip: '__CLEAR__'
            };
            ['baris1','baris2','baris3','alamat','kontak'].forEach(function(f) {
                clearPayload['pdfKopFmt_' + f + '_bold']   = '0';
                clearPayload['pdfKopFmt_' + f + '_italic'] = '0';
                clearPayload['pdfKopFmt_' + f + '_size']   = '10';
            });
        } else if (section === 'imgfolder') {
            clearPayload = { imgUploadFolderUrl: '__CLEAR__' };
        } else if (section === 'audfolder') {
            clearPayload = { audioUploadFolderUrl: '__CLEAR__' };
        }

        Swal.fire({
            title: 'Mereset & Menyimpan...',
            html: '<p style="font-size:13px;color:#475569;">Menghapus data seksi dari server.</p>',
            allowOutsideClick: false,
            didOpen: function() { Swal.showLoading(); },
            customClass:{ popup:'lp-swal' }
        });

        _clearSectionUI(section);

        google.script.run
            .withSuccessHandler(function(res) {
                if (res && res.success) {
                    const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
                    Toast.fire({ icon:'success', title: `Seksi ${sectionLabels[section] || section} direset` });
                    updateCfgProgress();
                } else {
                    Swal.fire({
                      title:'Gagal', html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Server tidak merespons.'}</p>`,
                      icon:'error', confirmButtonColor:'#dc2626',
                      customClass:{ popup:'lp-swal' }
                    });
                    loadConfigToForm();
                }
            })
            .withFailureHandler(function(err) {
                Swal.fire({
                  title:'Error Server',
                  html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
                  icon:'error', confirmButtonColor:'#dc2626',
                  customClass:{ popup:'lp-swal' }
                });
                loadConfigToForm();
            })
            .saveAppConfig(clearPayload);
    });
}

function _clearSectionUI(section) {
    if (section === 'tampilan') {
        ['cfg-app-name','cfg-app-subtitle','cfg-app-logo'].forEach(function(id) {
            var el = document.getElementById(id); if (el) el.value = '';
        });
        updateLogoPreview('');
        var cb = document.getElementById('cfg-show-result');
        if (cb) cb.checked = false;
        var cbCanvas = document.getElementById('cfg-essay-canvas');
        if (cbCanvas) cbCanvas.checked = false;
    } else if (section === 'ai') {
        var el = document.getElementById('cfg-anthropic-key');
        if (el) { el.value = ''; el.type = 'password'; }
        var icon = document.getElementById('icon-ai-key-vis');
        var lbl  = document.getElementById('label-ai-key-vis');
        if (icon) icon.className = 'fas fa-eye';
        if (lbl)  lbl.textContent = 'Tampilkan';
        var hint  = document.getElementById('cfg-ai-key-hint');
        var badge = document.getElementById('cfg-ai-status-badge');
        if (hint)  { hint.classList.add('hidden'); hint.classList.remove('flex'); }
        if (badge) { badge.innerHTML = ''; badge.classList.add('hidden'); }
    } else if (section === 'kartu') {
        ['cfg-kartu-template-id','cfg-kartu-folder-id'].forEach(function(id) {
            var el = document.getElementById(id); if (el) el.value = '';
        });
        var tplHint = document.getElementById('cfg-kartu-template-hint');
        var folHint = document.getElementById('cfg-kartu-folder-hint');
        var badge   = document.getElementById('cfg-kartu-status-badge');
        if (tplHint) { tplHint.classList.add('hidden'); tplHint.classList.remove('flex'); }
        if (folHint) { folHint.classList.add('hidden'); folHint.classList.remove('flex'); }
        if (badge)   { badge.innerHTML = ''; badge.classList.add('hidden'); }
    } else if (section === 'kop') {
        ['cfg-kop-logo','cfg-kop-baris1','cfg-kop-baris2','cfg-kop-baris3',
         'cfg-kop-alamat','cfg-kop-kontak','cfg-kop-kepala-nama','cfg-kop-kepala-nip'].forEach(function(id) {
            var el = document.getElementById(id); if (el) el.value = '';
        });
        initKopFmt();
        applyKopFmtToUI();
        updateKopPreview();
    } else if (section === 'imgfolder') {
        var inp    = document.getElementById('cfg-img-upload-folder-url');
        var hint   = document.getElementById('cfg-imgfolder-hint');
        var badge  = document.getElementById('cfg-imgfolder-status-badge');
        var result = document.getElementById('cfg-imgfolder-test-result');
        if (inp)    { inp.value = ''; inp.placeholder = 'https://drive.google.com/drive/folders/...'; }
        if (hint)   { hint.classList.add('hidden'); hint.classList.remove('flex'); }
        if (badge)  { badge.innerHTML = ''; badge.classList.add('hidden'); }
        if (result) { result.innerHTML = ''; }
    } else if (section === 'audfolder') {
        var inp    = document.getElementById('cfg-aud-upload-folder-url');
        var hint   = document.getElementById('cfg-audfolder-hint');
        var badge  = document.getElementById('cfg-audfolder-status-badge');
        var result = document.getElementById('cfg-audfolder-test-result');
        if (inp)    { inp.value = ''; inp.placeholder = 'https://drive.google.com/drive/folders/...'; }
        if (hint)   { hint.classList.add('hidden'); hint.classList.remove('flex'); }
        if (badge)  { badge.innerHTML = ''; badge.classList.add('hidden'); }
        if (result) { result.innerHTML = ''; }
    }
}


function switchCfgTab(tabId) {
    var target = document.getElementById('sec-' + tabId)
                  || document.getElementById('tab-panel-' + tabId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        target.style.outline = '2px solid #3b82f6';
        target.style.outlineOffset = '2px';
        setTimeout(function() {
            target.style.outline = '';
            target.style.outlineOffset = '';
        }, 1500);
    }
}

function updateCfgProgress() {
    const fields = [
        { id: 'cfg-app-name',               section: 'tampilan',   w: 2 },
        { id: 'cfg-app-logo',               section: 'tampilan',   w: 1 },

        { id: 'cfg-anthropic-key',          section: 'ai',         w: 2, hintId: 'cfg-ai-key-hint' },
        { id: 'cfg-kartu-template-id',      section: 'kartu',      w: 1 },
        { id: 'cfg-kartu-folder-id',        section: 'kartu',      w: 1 },
        { id: 'cfg-kop-baris3',             section: 'kop',        w: 2 },
        { id: 'cfg-kop-kepala-nama',        section: 'kop',        w: 1 },
        { id: 'cfg-kop-kepala-nip',         section: 'kop',        w: 1 },
        { id: 'cfg-img-upload-folder-url',  section: 'imgfolder',  w: 1, hintId: 'cfg-imgfolder-hint' },
        { id: 'cfg-aud-upload-folder-url',  section: 'audfolder',  w: 1, hintId: 'cfg-audfolder-hint' },
        { id: 'cfg-input-period-start',     section: 'jadwalinput',w: 1 },
    ];
    const secStat = { tampilan:{f:0,t:0}, ai:{f:0,t:0}, kartu:{f:0,t:0}, kop:{f:0,t:0}, imgfolder:{f:0,t:0}, audfolder:{f:0,t:0}, jadwalinput:{f:0,t:0} };
    let totalW = 0, filledW = 0;

    fields.forEach(c => {
        totalW += c.w;
        secStat[c.section].t += c.w;
        const el = document.getElementById(c.id);
        let ok = el && el.value.trim().length > 0;
        if (!ok && c.hintId) {
            const h = document.getElementById(c.hintId);
            ok = h && !h.classList.contains('hidden');
        }
        if (ok) { filledW += c.w; secStat[c.section].f += c.w; }
    });

    const pct = Math.round((filledW / totalW) * 100);

    const fill  = document.getElementById('cfg-progress-fill');
    const pctEl = document.getElementById('cfg-progress-pct');
    const note  = document.getElementById('cfg-progress-note');
    if (fill) {
        fill.style.width = pct + '%';
        // Pertahankan class 'prog-fill' (sumber style height/border-radius/transition dari .cfgv2 .prog-fill)
        // sambil mengganti warna via inline style agar tidak conflict dengan class override
        fill.className = 'prog-fill';
        fill.style.background = pct < 40 ? '#f87171' : pct < 70 ? '#fbbf24' : '#3b82f6';
    }
    if (pctEl) {
        pctEl.textContent = pct + '%';
        pctEl.style.color = pct < 40 ? '#ef4444' : pct < 70 ? '#f59e0b' : '#2563eb';
        pctEl.style.fontSize = '14px';
        pctEl.style.fontWeight = '800';
    }
    if (note) {
        const icons = { 100: '✅', 70: '🔶', 40: '⚠️', 0: '❌' };
        const icon  = pct === 100 ? icons[100] : pct >= 70 ? icons[70] : pct >= 40 ? icons[40] : icons[0];
        if      (pct === 100) note.textContent = icon + ' Semua konfigurasi utama telah diisi.';
        else if (pct >= 70)   note.textContent = icon + ' Hampir lengkap — beberapa field opsional belum diisi.';
        else if (pct >= 40)   note.textContent = icon + ' Konfigurasi sebagian — lengkapi field yang tersisa.';
        else                  note.textContent = icon + ' Konfigurasi belum lengkap. Harap isi field-field penting.';
    }

    const secCfg = {
        tampilan:  'cfg-sum-tampilan',
        ai:        'cfg-sum-ai',
        kartu:     'cfg-sum-kartu',
        kop:       'cfg-sum-kop',
        imgfolder: 'cfg-sum-imgfolder',
        audfolder: 'cfg-sum-audfolder',
        jadwalinput:'cfg-sum-jadwalinput'
    };
    Object.entries(secCfg).forEach(([sec, elId]) => {
        const el = document.getElementById(elId);
        if (!el) return;
        const s = secStat[sec];
        if (s.t === 0) return;
        if (s.f >= s.t) {
            el.innerHTML = '<span class="text-emerald-600 flex items-center gap-1"><i class="fas fa-check-circle text-[9px]"></i>Lengkap</span>';
        } else if (s.f > 0) {
            el.innerHTML = '<span class="text-amber-500 flex items-center gap-1"><i class="fas fa-dot-circle text-[9px]"></i>Sebagian</span>';
        } else {
            el.innerHTML = '<span class="text-slate-400 flex items-center gap-1"><i class="fas fa-circle text-[9px]"></i>Belum diisi</span>';
        }
    });
}

function loadConfigToForm() {
    ['cfg-sum-tampilan','cfg-sum-ai','cfg-sum-kartu','cfg-sum-kop','cfg-sum-imgfolder','cfg-sum-jadwalinput','cfg-sum-audfolder'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<i class="fas fa-circle-notch fa-spin text-[8px]"></i> Memuat...';
    });

    google.script.run
    .withFailureHandler(function(err) {
        ['cfg-sum-tampilan','cfg-sum-ai','cfg-sum-kartu','cfg-sum-kop','cfg-sum-imgfolder','cfg-sum-jadwalinput','cfg-sum-audfolder'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<span class="text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>Gagal memuat</span>';
        });
        Swal.fire({
            icon: 'error',
            title: 'Gagal Memuat Konfigurasi',
            html: `<p style="font-size:13px;color:#475569;">Tidak dapat membaca data konfigurasi dari server.</p>
                   <p style="font-size:11px;color:#dc2626;font-family:monospace;background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:8px;margin-top:8px;">${(err && err.message) || err}</p>`,
            confirmButtonText: 'Coba Lagi',
            showCancelButton: true,
            cancelButtonText: 'Tutup',
            confirmButtonColor:'#2563eb',
            cancelButtonColor:'#64748b',
            reverseButtons:true,
            customClass:{ popup:'lp-swal' }
        }).then(r => { if (r.isConfirmed) loadConfigToForm(); });
    })
    .withSuccessHandler(function(res) {
        try {
            if (res && res.success && res.data) {
                var d = res.data;

                var elName = document.getElementById('cfg-app-name');
                var elSub  = document.getElementById('cfg-app-subtitle');
                var elLogo = document.getElementById('cfg-app-logo');
                var elBg   = null; 
                var elCb   = document.getElementById('cfg-show-result');
                if (elName) elName.value = d.app_name || '';
                if (elSub)  elSub.value  = d.app_subtitle || '';
                if (elLogo) { elLogo.value = d.app_logo || ''; updateLogoPreview(d.app_logo || ''); }

                if (elCb)   elCb.checked = (String(d.show_exam_result).toLowerCase() === 'true');

                // Load violation_limit
                var elViolLimit = document.getElementById('cfg-violation-limit');
                if (elViolLimit) {
                    var vl = d.violation_limit;
                    elViolLimit.value = (vl !== undefined && vl !== null && vl !== '') ? parseInt(vl, 10) : 3;
                }

                var elCanvas = document.getElementById('cfg-essay-canvas');
                if (elCanvas) {
                    var rawCanvas = d.essay_canvas_enabled;
                    if (rawCanvas === undefined || rawCanvas === null || rawCanvas === '') {
                        elCanvas.checked = true; 
                    } else {
                        elCanvas.checked = (String(rawCanvas).toLowerCase() !== 'false');
                    }
                }

                var keySet    = !!d.anthropic_api_key_set;
                var keyMasked = d.anthropic_api_key_masked || '';
                var hintEl    = document.getElementById('cfg-ai-key-hint');
                var maskedEl  = document.getElementById('cfg-ai-key-masked');
                var badgeEl   = document.getElementById('cfg-ai-status-badge');
                var keyInput  = document.getElementById('cfg-anthropic-key');

                if (keySet) {
                    if (hintEl)   { hintEl.classList.remove('hidden'); hintEl.classList.add('flex'); }
                    if (maskedEl) maskedEl.textContent = keyMasked;
                    if (keyInput) keyInput.placeholder = 'Biarkan kosong untuk mempertahankan key lama';
                    if (badgeEl) {
                        badgeEl.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">' +
                            '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> API Key Anthropic aktif</span>';
                        badgeEl.classList.remove('hidden');
                    }
                } else {
                    if (hintEl) { hintEl.classList.add('hidden'); hintEl.classList.remove('flex'); }
                    if (badgeEl) {
                        badgeEl.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">' +
                            '<i class="fas fa-exclamation-triangle text-[10px]"></i> API Key belum dikonfigurasi</span>';
                        badgeEl.classList.remove('hidden');
                    }
                }

                var tplSet  = !!d.kartu_template_id_set;
                var tplVal  = d.kartu_template_id      || '';
                var folSet  = !!d.kartu_folder_id_set;
                var folVal  = d.kartu_folder_id        || '';
                var tplInput  = document.getElementById('cfg-kartu-template-id');
                var folInput  = document.getElementById('cfg-kartu-folder-id');
                var tplHint   = document.getElementById('cfg-kartu-template-hint');
                var folHint   = document.getElementById('cfg-kartu-folder-hint');
                var tplNameEl = document.getElementById('cfg-kartu-template-name');
                var folNameEl = document.getElementById('cfg-kartu-folder-name');
                var kartuBadge = document.getElementById('cfg-kartu-status-badge');

                if (tplSet && tplVal) {
                    if (tplInput) { tplInput.value = tplVal; tplInput.placeholder = 'Biarkan kosong untuk mempertahankan ID lama'; }
                    if (tplHint)  { tplHint.classList.remove('hidden'); tplHint.classList.add('flex'); }
                    if (tplNameEl) tplNameEl.textContent = d.kartu_template_id_masked || tplVal;
                } else {
                    if (tplHint) { tplHint.classList.add('hidden'); tplHint.classList.remove('flex'); }
                }
                if (folSet && folVal) {
                    if (folInput) { folInput.value = folVal; folInput.placeholder = 'Biarkan kosong untuk mempertahankan ID lama'; }
                    if (folHint)  { folHint.classList.remove('hidden'); folHint.classList.add('flex'); }
                    if (folNameEl) folNameEl.textContent = d.kartu_folder_id_masked || folVal;
                } else {
                    if (folHint) { folHint.classList.add('hidden'); folHint.classList.remove('flex'); }
                }
                if (kartuBadge) {
                    if (tplSet && folSet) {
                        kartuBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">' +
                            '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Template &amp; Folder kartu ujian sudah dikonfigurasi</span>';
                    } else {
                        var kartuMsg = (!tplSet && !folSet) ? 'Template ID &amp; Folder ID belum dikonfigurasi'
                                     : !tplSet ? 'Template ID belum dikonfigurasi'
                                     : 'Folder ID belum dikonfigurasi';
                        kartuBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">' +
                            '<i class="fas fa-exclamation-triangle text-[10px]"></i> ' + kartuMsg + '</span>';
                    }
                    kartuBadge.classList.remove('hidden');
                }
                window._kartuCfg = {
                    tplSet : tplSet,
                    folSet : folSet,
                    loaded : true
                };

                var imgFolderSet    = !!d['image_upload_folder_id_set'];
                var imgFolderVal    = d['image_upload_folder_id'] || '';
                var imgFolderHint   = document.getElementById('cfg-imgfolder-hint');
                var imgFolderMasked = document.getElementById('cfg-imgfolder-masked');
                var imgFolderInput  = document.getElementById('cfg-img-upload-folder-url');
                var imgFolderBadge  = document.getElementById('cfg-imgfolder-status-badge');

                if (imgFolderSet && imgFolderVal) {
                    if (imgFolderInput)  { imgFolderInput.value = ''; imgFolderInput.placeholder = 'Biarkan kosong untuk mempertahankan folder lama'; }
                    if (imgFolderHint)   { imgFolderHint.classList.remove('hidden'); imgFolderHint.classList.add('flex'); }
                    if (imgFolderMasked) imgFolderMasked.textContent = imgFolderVal.length > 12
                        ? imgFolderVal.substring(0, 6) + '\u2022\u2022\u2022\u2022' + imgFolderVal.slice(-4) : imgFolderVal;
                }
                if (imgFolderBadge) {
                    imgFolderBadge.innerHTML = imgFolderSet
                        ? '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Folder upload guru aktif</span>'
                        : '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fas fa-exclamation-triangle text-[10px]"></i> Folder upload guru belum dikonfigurasi</span>';
                    imgFolderBadge.classList.remove('hidden');
                }

                var audFolderSet    = !!d['audio_upload_folder_id_set'];
                var audFolderVal    = d['audio_upload_folder_id'] || '';
                var audFolderHint   = document.getElementById('cfg-audfolder-hint');
                var audFolderMasked = document.getElementById('cfg-audfolder-masked');
                var audFolderInput  = document.getElementById('cfg-aud-upload-folder-url');
                var audFolderBadge  = document.getElementById('cfg-audfolder-status-badge');

                if (audFolderSet && audFolderVal) {
                    if (audFolderInput)  { audFolderInput.value = ''; audFolderInput.placeholder = 'Biarkan kosong untuk mempertahankan folder lama'; }
                    if (audFolderHint)   { audFolderHint.classList.remove('hidden'); audFolderHint.classList.add('flex'); }
                    if (audFolderMasked) audFolderMasked.textContent = audFolderVal.length > 12
                        ? audFolderVal.substring(0, 6) + '\u2022\u2022\u2022\u2022' + audFolderVal.slice(-4) : audFolderVal;
                }
                if (audFolderBadge) {
                    audFolderBadge.innerHTML = audFolderSet
                        ? '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Folder upload audio guru aktif</span>'
                        : '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200"><i class="fas fa-exclamation-triangle text-[10px]"></i> Folder upload audio guru belum dikonfigurasi</span>';
                    audFolderBadge.classList.remove('hidden');
                }

                var kopMap = {
                    'pdf_kop_logo':        'cfg-kop-logo',
                    'pdf_kop_baris1':      'cfg-kop-baris1',
                    'pdf_kop_baris2':      'cfg-kop-baris2',
                    'pdf_kop_baris3':      'cfg-kop-baris3',
                    'pdf_kop_alamat':      'cfg-kop-alamat',
                    'pdf_kop_kontak':      'cfg-kop-kontak',
                    'pdf_kop_kepala_nama': 'cfg-kop-kepala-nama',
                    'pdf_kop_kepala_nip':  'cfg-kop-kepala-nip'
                };
                Object.keys(kopMap).forEach(function(k) {
                    var el = document.getElementById(kopMap[k]);
                    if (el && d[k] !== undefined) el.value = String(d[k]);
                });
                updateKopPreview();

                if (!window._kopFmt) initKopFmt();
                ['baris1','baris2','baris3','alamat','kontak'].forEach(function(f) {
                    var bold   = d['pdf_kop_fmt_' + f + '_bold'];
                    var italic = d['pdf_kop_fmt_' + f + '_italic'];
                    var size   = d['pdf_kop_fmt_' + f + '_size'];
                    if (bold   !== undefined) window._kopFmt[f].bold   = (bold   === '1' || bold   === true);
                    if (italic !== undefined) window._kopFmt[f].italic = (italic === '1' || italic === true);
                    if (size   !== undefined && parseInt(size, 10)) window._kopFmt[f].size = parseInt(size, 10);
                });
                applyKopFmtToUI();

                var elInputStart = document.getElementById('cfg-input-period-start');
                var elInputEnd = document.getElementById('cfg-input-period-end');
                var elInputEnabled = document.getElementById('cfg-input-period-enabled');

                if (elInputStart) elInputStart.value = d.input_period_start || '';
                if (elInputEnd) elInputEnd.value = d.input_period_end || '';
                if (elInputEnabled) elInputEnabled.checked = (String(d.input_period_enabled) === 'true');

                updateCfgProgress();

                // Auto-Timeout
                var elTimeoutHour = document.getElementById('cfg-auto-timeout-hour');
                if (elTimeoutHour) elTimeoutHour.value = d.auto_timeout_hour !== undefined ? d.auto_timeout_hour : 16;
                var timeoutBadge = document.getElementById('auto-timeout-trigger-status');
                if (timeoutBadge) {
                    if (d.auto_timeout_trigger_active) {
                        var hr = d.auto_timeout_trigger_hour;
                        timeoutBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200"><span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Timeout Aktif' + (hr !== null ? ` (Jam ${hr}:00)` : '') + '</span>';
                    } else {
                        timeoutBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">Timeout Nonaktif</span>';
                    }
                }

            } else {
                var errMsg = (res && res.message) || 'Data konfigurasi tidak tersedia.';
                ['cfg-sum-tampilan','cfg-sum-ai','cfg-sum-kartu','cfg-sum-kop','cfg-sum-imgfolder','cfg-sum-jadwalinput','cfg-sum-audfolder'].forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.innerHTML = '<span class="text-slate-400"><i class="fas fa-minus-circle mr-1"></i>Belum ada</span>';
                });
                if (!window._kopFmt) initKopFmt();
                applyKopFmtToUI();
                updateCfgProgress();
                var note = document.getElementById('cfg-progress-note');
                if (note) note.textContent = '\u26A0 ' + errMsg + ' Silakan isi dan simpan konfigurasi.';
            }
        } catch (handlerErr) {
            console.error('[loadConfigToForm] Error di withSuccessHandler:', handlerErr);
            var note = document.getElementById('cfg-progress-note');
            if (note) note.textContent = '\u26A0 Terjadi error saat memuat konfigurasi: ' + (handlerErr.message || String(handlerErr));
        }
    })
    .getAppConfig();
}

function clearImgFolderInput() {
    const inp   = document.getElementById('cfg-img-upload-folder-url');
    const hint  = document.getElementById('cfg-imgfolder-hint');
    const badge = document.getElementById('cfg-imgfolder-status-badge');
    if (inp)   { inp.value = ''; inp.placeholder = 'https://drive.google.com/drive/folders/...'; inp.focus(); }
    if (hint)  { hint.classList.add('hidden'); hint.classList.remove('flex'); }
    if (badge) { badge.innerHTML = ''; badge.classList.add('hidden'); }
    updateCfgProgress();
}

function testImgUploadFolder() {
    const url = (document.getElementById('cfg-img-upload-folder-url') || {}).value || '';
    const hint = document.getElementById('cfg-imgfolder-hint');
    if (hint && hint.classList.contains('flex')) {
        Swal.fire({
          icon:'info', title:'Folder Sudah Aktif',
          html:'<p style="font-size:13px;color:#475569;">Folder upload guru sudah dikonfigurasi. Klik <b>Ganti</b> jika ingin menggantinya.</p>',
          timer:2200, showConfirmButton:false,
          customClass:{ popup:'lp-swal' }
        });
        return;
    }
    if (!url.trim()) {
        Swal.fire({
          title:'URL Kosong',
          html:'<p style="font-size:13px;color:#475569;">Masukkan URL Folder Google Drive terlebih dahulu.</p>',
          icon:'warning', confirmButtonColor:'#db2777',
          customClass:{ popup:'lp-swal' }
        });
        return;
    }
    const m1 = url.match(/folders\/([a-zA-Z0-9-_]+)/);
    const m2 = url.match(/id=([a-zA-Z0-9-_]+)/);
    const folderId = m1 ? m1[1] : (m2 ? m2[1] : url.trim());
    const resultEl = document.getElementById('cfg-imgfolder-test-result');
    if (resultEl) resultEl.innerHTML = '<i class="fas fa-spinner fa-spin text-pink-500"></i> Memvalidasi...';
    google.script.run
        .withSuccessHandler(function(res) {
            if (resultEl) {
                resultEl.innerHTML = res && res.success
                    ? '<span class="text-emerald-600"><i class="fas fa-check-circle mr-1"></i>Folder valid &amp; dapat diakses</span>'
                    : '<span class="text-red-500"><i class="fas fa-times-circle mr-1"></i>' + ((res && res.message) || 'Gagal').replace(/</g,'&lt;') + '</span>';
            }
            if (res && res.success) {
                var imgFolderHint   = document.getElementById('cfg-imgfolder-hint');
                var imgFolderMasked = document.getElementById('cfg-imgfolder-masked');
                var imgFolderBadge  = document.getElementById('cfg-imgfolder-status-badge');
                if (imgFolderHint)   { imgFolderHint.classList.remove('hidden'); imgFolderHint.classList.add('flex'); }
                if (imgFolderMasked) imgFolderMasked.textContent = folderId.length > 12 ? folderId.substring(0, 6) + '\u2022\u2022\u2022\u2022' + folderId.slice(-4) : folderId;
                if (imgFolderBadge) {
                    imgFolderBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Folder upload guru aktif</span>';
                    imgFolderBadge.classList.remove('hidden');
                }
                updateCfgProgress();
                const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
                Toast.fire({ icon:'success', title:'Folder upload tervalidasi' });
            }
        })
        .withFailureHandler(function(err) {
            if (resultEl) resultEl.innerHTML = '<span class="text-red-500"><i class="fas fa-times-circle mr-1"></i>' + ((err && err.message) || String(err)).replace(/</g,'&lt;') + '</span>';
        })
        .saveImageUploadFolderId(folderId, currentUser.userID, currentUser.token);
}


function clearAudFolderInput() {
    const inp   = document.getElementById('cfg-aud-upload-folder-url');
    const hint  = document.getElementById('cfg-audfolder-hint');
    const badge = document.getElementById('cfg-audfolder-status-badge');
    if (inp)   { inp.value = ''; inp.placeholder = 'https://drive.google.com/drive/folders/...'; inp.focus(); }
    if (hint)  { hint.classList.add('hidden'); hint.classList.remove('flex'); }
    if (badge) { badge.innerHTML = ''; badge.classList.add('hidden'); }
    updateCfgProgress();
}

function testAudUploadFolder() {
    const url = (document.getElementById('cfg-aud-upload-folder-url') || {}).value || '';
    const hint = document.getElementById('cfg-audfolder-hint');
    if (hint && hint.classList.contains('flex')) {
        Swal.fire({
          icon:'info', title:'Folder Sudah Aktif',
          html:'<p style="font-size:13px;color:#475569;">Folder upload audio guru sudah dikonfigurasi. Klik <b>Ganti</b> jika ingin menggantinya.</p>',
          timer:2200, showConfirmButton:false,
          customClass:{ popup:'lp-swal' }
        });
        return;
    }
    if (!url.trim()) {
        Swal.fire({
          title:'URL Kosong',
          html:'<p style="font-size:13px;color:#475569;">Masukkan URL Folder Google Drive terlebih dahulu.</p>',
          icon:'warning', confirmButtonColor:'#0891b2',
          customClass:{ popup:'lp-swal' }
        });
        return;
    }
    const m1 = url.match(/folders\/([a-zA-Z0-9-_]+)/);
    const m2 = url.match(/id=([a-zA-Z0-9-_]+)/);
    const folderId = m1 ? m1[1] : (m2 ? m2[1] : url.trim());
    const resultEl = document.getElementById('cfg-audfolder-test-result');
    if (resultEl) resultEl.innerHTML = '<i class="fas fa-spinner fa-spin text-cyan-600"></i> Memvalidasi...';
    google.script.run
        .withSuccessHandler(function(res) {
            if (resultEl) {
                resultEl.innerHTML = res && res.success
                    ? '<span class="text-emerald-600"><i class="fas fa-check-circle mr-1"></i>Folder valid &amp; dapat diakses</span>'
                    : '<span class="text-red-500"><i class="fas fa-times-circle mr-1"></i>' + ((res && res.message) || 'Gagal').replace(/</g,'&lt;') + '</span>';
            }
            if (res && res.success) {
                var audFolderHint   = document.getElementById('cfg-audfolder-hint');
                var audFolderMasked = document.getElementById('cfg-audfolder-masked');
                var audFolderBadge  = document.getElementById('cfg-audfolder-status-badge');
                if (audFolderHint)   { audFolderHint.classList.remove('hidden'); audFolderHint.classList.add('flex'); }
                if (audFolderMasked) audFolderMasked.textContent = folderId.length > 12 ? folderId.substring(0, 6) + '\u2022\u2022\u2022\u2022' + folderId.slice(-4) : folderId;
                if (audFolderBadge) {
                    audFolderBadge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Folder upload audio guru aktif</span>';
                    audFolderBadge.classList.remove('hidden');
                }
                updateCfgProgress();
                const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:1800, timerProgressBar:true });
                Toast.fire({ icon:'success', title:'Folder upload audio tervalidasi' });
            }
        })
        .withFailureHandler(function(err) {
            if (resultEl) resultEl.innerHTML = '<span class="text-red-500"><i class="fas fa-times-circle mr-1"></i>' + ((err && err.message) || String(err)).replace(/</g,'&lt;') + '</span>';
        })
        .saveAudioUploadFolderId(folderId, currentUser.userID, currentUser.token);
}


function handleSaveConfig(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    const fab = document.getElementById('cfg-fab-save');
    const fabOriginal = fab ? fab.innerHTML : '';

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    if (fab) { fab.disabled = true; fab.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...'; }

    const fd = new FormData(e.target);
    const formObj = Object.fromEntries(fd.entries());

    const showResultCheckbox = document.getElementById('cfg-show-result');
    formObj.showExamResult = (showResultCheckbox && showResultCheckbox.checked) ? 'true' : 'false';

    const canvasCheckbox = document.getElementById('cfg-essay-canvas');
    formObj.essayCanvasEnabled = (canvasCheckbox && canvasCheckbox.checked) ? 'true' : 'false';

    // Batas pelanggaran
    var vlEl = document.getElementById('cfg-violation-limit');
    var vlVal = vlEl ? parseInt(vlEl.value, 10) : NaN;
    formObj.violationLimit = (!isNaN(vlVal) && vlVal >= 0) ? String(vlVal) : '3';

    const keyInput = document.getElementById('cfg-anthropic-key');
    formObj.anthropicApiKey = keyInput ? keyInput.value.trim() : '';

    const tplInput = document.getElementById('cfg-kartu-template-id');
    const folInput = document.getElementById('cfg-kartu-folder-id');
    formObj.kartuTemplateId = tplInput ? tplInput.value.trim() : '';
    formObj.kartuFolderId   = folInput ? folInput.value.trim() : '';

    const imgFolderEl = document.getElementById('cfg-img-upload-folder-url');
    formObj.imgUploadFolderUrl = imgFolderEl ? imgFolderEl.value.trim() : '';

    const audFolderEl = document.getElementById('cfg-aud-upload-folder-url');
    formObj.audioUploadFolderUrl = audFolderEl ? audFolderEl.value.trim() : '';

    const kopInputMap = {
        'pdfKopLogo':       'cfg-kop-logo',
        'pdfKopBaris1':     'cfg-kop-baris1',
        'pdfKopBaris2':     'cfg-kop-baris2',
        'pdfKopBaris3':     'cfg-kop-baris3',
        'pdfKopAlamat':     'cfg-kop-alamat',
        'pdfKopKontak':     'cfg-kop-kontak',
        'pdfKopKepalaNama': 'cfg-kop-kepala-nama',
        'pdfKopKepalaNip':  'cfg-kop-kepala-nip'
    };
    Object.entries(kopInputMap).forEach(([key, elId]) => {
        const el = document.getElementById(elId);
        formObj[key] = el ? el.value.trim() : '';
    });

    const _fmt = window._kopFmt || {};
    ['baris1','baris2','baris3','alamat','kontak'].forEach(f => {
        const fmtData = _fmt[f] || {};
        formObj['pdfKopFmt_' + f + '_bold']   = fmtData.bold   ? '1' : '0';
        formObj['pdfKopFmt_' + f + '_italic'] = fmtData.italic ? '1' : '0';
        formObj['pdfKopFmt_' + f + '_size']   = String(fmtData.size || 10);
    });

    const _restoreBtns = () => {
        btn.disabled = false; btn.innerHTML = originalText;
        if (fab) { fab.disabled = false; fab.innerHTML = fabOriginal; }
    };

    google.script.run
    .withFailureHandler(function(err) {
        _restoreBtns();
        Swal.fire({
            icon: 'error',
            title: 'Gagal Menyimpan',
            html: `<p style="font-size:13px;color:#475569;">Terjadi kesalahan saat menghubungi server.</p>
                   <p style="font-size:11px;color:#dc2626;font-family:monospace;margin-top:8px;background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:8px;">${(err && err.message) || err}</p>`,
            confirmButtonColor:'#dc2626',
            customClass:{ popup:'lp-swal' }
        });
    })
    .withSuccessHandler(function(res) {
        if (res && res.success) {
            const periodForm = {
                enabled: document.getElementById('cfg-input-period-enabled') ? document.getElementById('cfg-input-period-enabled').checked : false,
                startISO: document.getElementById('cfg-input-period-start') ? document.getElementById('cfg-input-period-start').value : '',
                endISO: document.getElementById('cfg-input-period-end') ? document.getElementById('cfg-input-period-end').value : ''
            };
            google.script.run
              .withFailureHandler(function(err) {
                  _restoreBtns();
                  Swal.fire('Partial Success', 'Konfigurasi tersimpan, tetapi Gagal Menyimpan Jadwal Input: ' + (err.message || err), 'warning');
              })
              .withSuccessHandler(function(res2) {
                  _restoreBtns();
                  if (res2 && res2.success) {
                      const savedKey = formObj.anthropicApiKey && formObj.anthropicApiKey.indexOf('••••') === -1;
                      const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2400, timerProgressBar:true });
                      Toast.fire({ icon:'success', title: savedKey ? 'Tersimpan · API Key diperbarui' : 'Konfigurasi & Jadwal tersimpan' });
                      applyConfigToLogin(formObj.appName, formObj.appSubtitle, formObj.appLogo);
                      if (savedKey) setTimeout(function() { loadConfigToForm(); }, 600);
                      setTimeout(function() { if (typeof updateCfgProgress === 'function') updateCfgProgress(); }, 400);
                      if (keyInput) keyInput.value = '';
                  } else {
                      Swal.fire({
                          title:'Partial Success',
                          html:`<p style="font-size:13px;color:#475569;">Konfigurasi tersimpan, tetapi Gagal Menyimpan Jadwal Input: ${(res2 && res2.message) || 'Error'}</p>`,
                          icon:'warning', confirmButtonColor:'#d97706',
                          customClass:{ popup:'lp-swal' }
                      });
                  }
              })
              .saveInputPeriod(periodForm, currentUser.userID, currentUser.token);
        } else {
            _restoreBtns();
            Swal.fire({
              title:'Gagal',
              html:`<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan'}</p>`,
              icon:'error', confirmButtonColor:'#dc2626',
              customClass:{ popup:'lp-swal' }
            });
        }
    }).saveAppConfig(formObj);
}

function toggleAiKeyVisibility() {
    const inp   = document.getElementById('cfg-anthropic-key');
    const icon  = document.getElementById('icon-ai-key-vis');
    const label = document.getElementById('label-ai-key-vis');
    if (!inp) return;
    if (inp.type === 'password') {
        inp.type  = 'text';
        icon.className  = 'fas fa-eye-slash';
        label.textContent = 'Sembunyikan';
    } else {
        inp.type  = 'password';
        icon.className  = 'fas fa-eye';
        label.textContent = 'Tampilkan';
    }
}

function clearAiKeyInput() {
    const inp   = document.getElementById('cfg-anthropic-key');
    const hint  = document.getElementById('cfg-ai-key-hint');
    if (inp)  { inp.value = ''; inp.focus(); inp.placeholder = 'Masukkan Anthropic API Key baru (sk-ant-...)'; }
    if (hint) { hint.classList.add('hidden'); hint.classList.remove('flex'); }
    updateCfgProgress();
}

function clearKartuTemplateInput() {
    const inp  = document.getElementById('cfg-kartu-template-id');
    const hint = document.getElementById('cfg-kartu-template-hint');
    if (inp)  { inp.value = ''; inp.focus(); inp.placeholder = 'Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'; }
    if (hint) { hint.classList.add('hidden'); hint.classList.remove('flex'); }
    _updateKartuStatusBadge();
    updateCfgProgress();
}

function clearKartuFolderInput() {
    const inp  = document.getElementById('cfg-kartu-folder-id');
    const hint = document.getElementById('cfg-kartu-folder-hint');
    if (inp)  { inp.value = ''; inp.focus(); inp.placeholder = 'Contoh: 1a2B3cD4eF5gH6iJ7kL8mN9oP0qR1sT2u'; }
    if (hint) { hint.classList.add('hidden'); hint.classList.remove('flex'); }
    _updateKartuStatusBadge();
    updateCfgProgress();
}

function _updateKartuStatusBadge() {
    const badge = document.getElementById('cfg-kartu-status-badge');
    if (!badge) return;
    const tplEl  = document.getElementById('cfg-kartu-template-id');
    const folEl  = document.getElementById('cfg-kartu-folder-id');
    const tplSet = !!(tplEl && tplEl.value && tplEl.value.trim());
    const folSet = !!(folEl && folEl.value && folEl.value.trim());
    if (!tplSet && !folSet) {
        badge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">' +
            '<i class="fas fa-exclamation-triangle text-[10px]"></i> Template ID &amp; Folder ID belum dikonfigurasi</span>';
        badge.classList.remove('hidden');
    }
}

function validateKartuConfigNow() {
    const tplInput    = document.getElementById('cfg-kartu-template-id');
    const folInput    = document.getElementById('cfg-kartu-folder-id');
    const resultEl    = document.getElementById('cfg-kartu-validate-result');
    const tplVal      = tplInput ? tplInput.value.trim() : '';
    const folVal      = folInput ? folInput.value.trim() : '';

    if (!tplVal && !folVal) {
        if (resultEl) resultEl.innerHTML = '<span class="text-amber-600"><i class="fas fa-exclamation-triangle mr-1"></i>Isi Template ID dan Folder ID terlebih dahulu.</span>';
        return;
    }

    if (resultEl) resultEl.innerHTML = '<i class="fas fa-circle-notch fa-spin text-violet-500 mr-1"></i> Memvalidasi...';

    google.script.run
        .withSuccessHandler(function(res) {
            if (!resultEl) return;
            if (res.success) {
                resultEl.innerHTML = '<span class="text-emerald-600 font-bold"><i class="fas fa-check-circle mr-1"></i>Valid! Template: "<b>' + (res.templateName || '') + '</b>" &middot; Folder: "<b>' + (res.folderName || '') + '</b>"</span>';
                var tplHint   = document.getElementById('cfg-kartu-template-hint');
                var folHint   = document.getElementById('cfg-kartu-folder-hint');
                var tplNameEl = document.getElementById('cfg-kartu-template-name');
                var folNameEl = document.getElementById('cfg-kartu-folder-name');
                if (res.templateOk && tplHint) {
                    if (tplNameEl) tplNameEl.textContent = res.templateName;
                    tplHint.classList.remove('hidden'); tplHint.classList.add('flex');
                }
                if (res.folderOk && folHint) {
                    if (folNameEl) folNameEl.textContent = res.folderName;
                    folHint.classList.remove('hidden'); folHint.classList.add('flex');
                }
                var badge = document.getElementById('cfg-kartu-status-badge');
                if (badge) {
                    badge.innerHTML = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">' +
                        '<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Template &amp; Folder kartu ujian valid &amp; siap digunakan</span>';
                    badge.classList.remove('hidden');
                }
            } else {
                var errList = (res.errors || []).map(function(e) { return '<li>' + e + '</li>'; }).join('');
                resultEl.innerHTML = '<span class="text-red-600 font-bold"><i class="fas fa-times-circle mr-1"></i>Validasi gagal:</span>' +
                    '<ul class="text-red-500 text-[11px] list-disc ml-5 mt-0.5">' + errList + '</ul>';
            }
        })
        .withFailureHandler(function(err) {
            if (resultEl) resultEl.innerHTML = '<span class="text-red-600"><i class="fas fa-shield-alt mr-1"></i>' + (err.message || String(err)) + '</span>';
        })
        .validateKartuConfig(currentUser.userID, currentUser.token, tplVal, folVal);
}

function testAiApiKeyNow() {
    const resultEl  = document.getElementById('cfg-ai-test-result');
    const keyInput  = document.getElementById('cfg-anthropic-key');
    const newKeyVal = keyInput ? keyInput.value.trim() : '';

    if (resultEl) {
        resultEl.innerHTML = '<i class="fas fa-circle-notch fa-spin text-indigo-500 mr-1"></i> Menguji koneksi...';
    }

    if (newKeyVal && newKeyVal.indexOf('\u2022\u2022\u2022\u2022') === -1) {
        Swal.fire({
            title: 'Simpan & Test API Key?',
            html: `<p style="font-size:13px;color:#475569;">Untuk menguji koneksi, API Key baru akan <b>disimpan</b> terlebih dahulu ke server.</p>
                   <p style="font-size:11px;color:#1d4ed8;background:#eff6ff;border:1px solid #bfdbfe;padding:8px 12px;border-radius:8px;margin-top:8px;">
                     <i class="fas fa-circle-info"></i> Field konfigurasi lain yang belum disimpan tidak akan terpengaruh.
                   </p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save mr-1"></i> Simpan & Test',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#64748b',
            reverseButtons: true,
            customClass:{ popup:'lp-swal' }
        }).then(function(r) {
            if (!r.isConfirmed) {
                if (resultEl) resultEl.innerHTML = '';
                return;
            }

            var appNameEl    = document.getElementById('cfg-app-name');
            var appSubEl     = document.getElementById('cfg-app-subtitle');
            var appLogoEl    = document.getElementById('cfg-app-logo');

            var showResultEl = document.getElementById('cfg-show-result');
            google.script.run
                .withSuccessHandler(function(saveRes) {
                    if (!saveRes.success) {
                        if (resultEl) resultEl.innerHTML = '<span class="text-red-500"><i class="fas fa-times-circle mr-1"></i>' + (saveRes.message || 'Gagal menyimpan') + '</span>';
                        return;
                    }
                    if (keyInput) keyInput.value = '';
                    _runAiConnectionTest(resultEl);
                })
                .withFailureHandler(function(err) {
                    if (resultEl) resultEl.innerHTML = '<span class="text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>Gagal menyimpan key: ' + (err.message || String(err)) + '</span>';
                })
                .saveAppConfig({
                    appName:        appNameEl    ? appNameEl.value    : '',
                    appSubtitle:    appSubEl     ? appSubEl.value     : '',
                    appLogo:        appLogoEl    ? appLogoEl.value    : '',
                    appBackground:  '',
                    showExamResult: (showResultEl && showResultEl.checked) ? 'true' : 'false',
                    anthropicApiKey: newKeyVal
                });
        });
    } else {
        _runAiConnectionTest(resultEl);
    }
}

function _runAiConnectionTest(resultEl) {
    if (resultEl) resultEl.innerHTML = '<i class="fas fa-circle-notch fa-spin text-indigo-500 mr-1"></i> Menguji koneksi ke Anthropic Claude...';
    google.script.run
        .withSuccessHandler(function(res) {
            if (!resultEl) return;
            if (res.success) {
                resultEl.innerHTML = '<span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">' +
                    '<i class="fas fa-check-circle text-emerald-500"></i>' +
                    '<span><b>Berhasil!</b> Model: ' + (res.model || '') + ' \u2014 Respons: <i>&quot;' + (res.reply || '') + '&quot;</i></span></span>';
                setTimeout(function() { loadConfigToForm(); }, 300);
            } else {
                resultEl.innerHTML = '<span class="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">' +
                    '<i class="fas fa-times-circle text-red-500"></i>' +
                    '<span><b>Gagal:</b> ' + (res.message || '') + '</span></span>';
            }
        })
        .withFailureHandler(function(err) {
            if (resultEl) resultEl.innerHTML = '<span class="text-red-500"><i class="fas fa-exclamation-triangle mr-1"></i>' + (err.message || 'Error tidak diketahui') + '</span>';
        })
        .testAnthropicApiKey(currentUser.userID, currentUser.token);
}

// _renderConfigExtras dihapus — fungsi kosong tanpa implementasi

function applyConfigToLogin(title, subtitle, logo) {
    if (title) {
        const loginTitle = document.getElementById('login-title');
        if (loginTitle) loginTitle.innerText = title;

        const adminHeader = document.querySelector('.sidebar-header-text h1');
        if (adminHeader) adminHeader.innerText = title;

        document.title = title;
    }
    if (subtitle) {
        const loginSubtitle = document.getElementById('login-subtitle');
        if (loginSubtitle) loginSubtitle.innerText = subtitle;
    }
    if (logo) {
        const loginLogo = document.getElementById('login-logo-img');
        if (loginLogo) loginLogo.src = logo;
    }
}
