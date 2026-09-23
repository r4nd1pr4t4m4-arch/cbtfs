/**
 * login.js — Login Page Logic
 * _lpInitLoginUX(), downloadTemplateExcel(), processExcelImport(),
 * showBatchForm(), parseBatchText(), processBatchInput(), resetExamAttempt()
 * Sumber: index.html L29064-30184
 */

function _lpInitLoginUX() {
    const passInput = document.getElementById('password');
    const pinInput  = document.getElementById('pin');
    const userInput = document.getElementById('username');

    // Caps Lock detection on password & username
    if (passInput) {
        passInput.addEventListener('keydown', _lpHandleCapsKey);
        passInput.addEventListener('keyup',   _lpHandleCapsKey);
        passInput.addEventListener('blur', () => {
            // Bug fix #5: sembunyikan warning saat focus keluar dari password
            // tapi hanya jika username juga tidak sedang focused
            if (document.activeElement !== userInput) {
                const w = document.getElementById('caps-warning');
                if (w) w.classList.remove('show');
            }
        });
    }
    // Bug fix #5: Caps Lock juga terdeteksi saat mengetik di username
    if (userInput) {
        userInput.addEventListener('keydown', _lpHandleCapsKey);
        userInput.addEventListener('keyup',   _lpHandleCapsKey);
        userInput.addEventListener('blur', () => {
            if (document.activeElement !== passInput) {
                const w = document.getElementById('caps-warning');
                if (w) w.classList.remove('show');
            }
        });
    }

    // PIN digit-only enforcement
    if (pinInput) {
        pinInput.addEventListener('input', function() {
            const cleaned = this.value.replace(/\D/g, '');
            if (cleaned !== this.value) this.value = cleaned;
            this.classList.remove('is-invalid');
        });
        pinInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text') || '';
            const cleaned = text.replace(/\D/g, '').slice(0, 10);
            // Insert at caret
            const start = this.selectionStart || 0;
            const end   = this.selectionEnd   || 0;
            const cur   = this.value;
            this.value = (cur.slice(0, start) + cleaned + cur.slice(end)).slice(0, 10);
            const newPos = Math.min(start + cleaned.length, 10);
            try { this.setSelectionRange(newPos, newPos); } catch(err) {}
        });
    }

    // Clear invalid state on input
    [userInput, passInput].forEach(el => {
        if (!el) return;
        el.addEventListener('input', () => el.classList.remove('is-invalid'));
    });

    // Online/Offline indicator
    window.addEventListener('online',  _lpUpdateNetStatus);
    window.addEventListener('offline', _lpUpdateNetStatus);
    if (!navigator.onLine) _lpUpdateNetStatus();

    // Escape closes mobile sheet
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const right = document.getElementById('lp-right');
            if (right && right.classList.contains('mobile-open')) {
                lpCloseForm();
            }
        }
    });

    // Allow keyboard activation on role tabs (3 tab: Siswa, Admin/Guru, Pengawas)
    const _lpTabOrder = ['lp-role-siswa', 'lp-role-admin', 'lp-role-pengawas'];
    const _lpTabRoles = ['siswa', 'admin', 'pengawas'];
    _lpTabOrder.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                lpSetRole(_lpTabRoles[idx]);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIdx = (idx + 1) % _lpTabOrder.length;
                lpSetRole(_lpTabRoles[nextIdx]);
                const next = document.getElementById(_lpTabOrder[nextIdx]);
                if (next) next.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIdx = (idx - 1 + _lpTabOrder.length) % _lpTabOrder.length;
                lpSetRole(_lpTabRoles[prevIdx]);
                const prev = document.getElementById(_lpTabOrder[prevIdx]);
                if (prev) prev.focus();
            }
        });
    });

    // Eye icon keyboard activation
    const eyeBtn = document.querySelector('.lp-input-eye');
    if (eyeBtn) {
        eyeBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePasswordVisibility();
            }
        });
    }

    // Current year footer
    const yr = document.getElementById('currentYear');
    if (yr) yr.textContent = new Date().getFullYear();

    // Global ESC for results modals (grading)
    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      const m = document.getElementById('modal-grading');
      if (m && !m.classList.contains('hidden')) {
        if (typeof closeGradingModal === 'function') closeGradingModal();
      }
    });
}

function downloadTemplateExcel() {

    const examSel = document.getElementById('select-exam-q');
    const examId  = examSel ? examSel.value : '';
    if (!examId) {
        Swal.fire('Pilih Mata Pelajaran',
            'Silakan pilih Mata Pelajaran terlebih dahulu agar template disesuaikan dengan tipe soal yang diizinkan Admin.',
            'warning');
        return;
    }

    const exam = (cachedExams || []).find(e => String(e.id) === String(examId));
    const subjectLabel = exam ? `${exam.subject} (${exam.class})` : examId;

    const tc = currentExamTypeConfig || null;

    function isTypeAllowed(t) {
        if (!tc) return true; 
        const cfg = tc[t];
        if (!cfg) return true; 
        if (cfg.enabled === false) return false;

        const max = parseInt(cfg.max);
        if (!isNaN(max) && max > 0) {
            const used = (allQuestionsData || []).filter(q => q.type === t).length;
            if (used >= max) return false;
        }
        return true;
    }

    function getOptCount(t) {
        if (tc && tc[t] && tc[t].optCount) {
            const n = parseInt(tc[t].optCount);
            if (!isNaN(n)) return Math.max(2, Math.min(6, n));
        }
        return 5; 
    }

    const allowedTypes = ['PG','PG_KOMPLEKS','BS','JODOH','Esai'].filter(isTypeAllowed);

    if (allowedTypes.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Tidak Ada Tipe Soal Tersedia',
            html: `<p class="text-sm text-slate-600">Untuk mata pelajaran <b>${subjectLabel}</b>, semua tipe soal sudah penuh atau dinonaktifkan oleh Admin.</p>`,
            confirmButtonColor: '#3b82f6'
        });
        return;
    }

    const wb = XLSX.utils.book_new();

    const wsInfoRows = [
        ['TEMPLATE IMPORT SOAL'],
        ['Mata Pelajaran', subjectLabel],
        ['Tanggal Generate', new Date().toLocaleString('id-ID')],
        [],
        ['Tipe Soal yang Diizinkan untuk Mata Pelajaran Ini:']
    ];
    const typeLabelMap = {
        PG: 'Pilihan Ganda',
        PG_KOMPLEKS: 'Pilihan Ganda Kompleks',
        BS: 'Benar/Salah (AKM)',
        JODOH: 'Menjodohkan',
        Esai: 'Esai'
    };
    allowedTypes.forEach(t => {
        const cfg = tc && tc[t] ? tc[t] : {};
        const max = parseInt(cfg.max) || 0;
        const used = (allQuestionsData || []).filter(q => q.type === t).length;
        const sisa = max > 0 ? `Sisa kuota: ${Math.max(0, max - used)} dari ${max}` : 'Kuota: Bebas';
        const opts = (t === 'PG' || t === 'PG_KOMPLEKS') ? ` | Opsi: A-${String.fromCharCode(64 + getOptCount(t))}` : '';
        wsInfoRows.push([`• ${typeLabelMap[t]} (${t})`, `${sisa}${opts}`]);
    });
    wsInfoRows.push([]);
    wsInfoRows.push(['CATATAN:']);
    wsInfoRows.push(['- Hanya isi sheet untuk tipe soal yang diizinkan di atas.']);
    wsInfoRows.push(['- Jika Anda mengimport tipe yang tidak diizinkan, sistem akan menolak.']);
    wsInfoRows.push(['- Bobot default 10. Wajib: TRUE/FALSE.']);
    const wsInfo = XLSX.utils.aoa_to_sheet(wsInfoRows);
    wsInfo['!cols'] = [{wch:35},{wch:50}];
    XLSX.utils.book_append_sheet(wb, wsInfo, "INFO");

    const buildPGSheet = () => {
        const optCount = Math.max(getOptCount('PG'), getOptCount('PG_KOMPLEKS'));
        const optLetters = ['A','B','C','D','E','F'].slice(0, optCount);
        const headers = ["Tipe", "Pertanyaan", ...optLetters.map(L => `Opsi_${L}`),
                         "Kunci_Jawaban", "Bobot", "Wajib"];
        const samples = [];

        if (allowedTypes.includes('PG')) {
            const fullSample = ["Merah","Biru","Hijau","Kuning","Hitam","Ungu"].slice(0, optCount);
            samples.push(["PG", "Apa warna langit?", ...fullSample, "B", "10", "TRUE"]);
            const numSample = ["3","2","5","4","6","7"].slice(0, optCount);
            samples.push(["PG", "1 + 1 = ?", ...numSample, "B", "10", "TRUE"]);
        }
        if (allowedTypes.includes('PG_KOMPLEKS')) {
            const primeSample = ["2","4","5","6","7","9"].slice(0, optCount);
            const keyK = optLetters.filter((_,i)=>[0,2,4].includes(i) && i < optCount).join(', ');
            samples.push(["PG_KOMPLEKS", "Manakah bilangan prima?", ...primeSample, keyK || 'A, C', "10", "TRUE"]);
            const mamSample = ["Kucing","Ular","Anjing","Katak","Ikan","Buaya"].slice(0, optCount);
            samples.push(["PG_KOMPLEKS", "Hewan mamalia:", ...mamSample, "A, C", "10", "TRUE"]);
        }

        const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);
        const cols = [{wch:14},{wch:35}];
        optLetters.forEach(()=>cols.push({wch:15}));
        cols.push({wch:18},{wch:8},{wch:8});
        ws['!cols'] = cols;

        const sheetName = (allowedTypes.includes('PG') && allowedTypes.includes('PG_KOMPLEKS'))
            ? "PG & PG_Kompleks"
            : (allowedTypes.includes('PG') ? "PG" : "PG_Kompleks");
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };

    if (allowedTypes.includes('PG') || allowedTypes.includes('PG_KOMPLEKS')) {
        buildPGSheet();
    }

    if (allowedTypes.includes('BS')) {
        const bsHeaders = ["Tipe","Pertanyaan",
            "Pernyataan_1","Kunci_1","Pernyataan_2","Kunci_2","Pernyataan_3","Kunci_3",
            "Pernyataan_4","Kunci_4","Pernyataan_5","Kunci_5","Bobot","Wajib"];
        const bsSample = [
            ["BS","Tentukan pernyataan berikut!","Bumi berbentuk bulat","Benar","Matahari mengelilingi bumi","Salah","Air mendidih pada 100°C","Benar","Bulan adalah bintang","Salah","","","10","TRUE"],
            ["BS","Perhatikan pernyataan ini!","Indonesia di Asia","Benar","Jakarta ibu kota Jepang","Salah","Pancasila memiliki 5 sila","Benar","","","","","10","TRUE"],
        ];
        const wsBS = XLSX.utils.aoa_to_sheet([bsHeaders, ...bsSample]);
        wsBS['!cols'] = [{wch:8},{wch:30},{wch:25},{wch:8},{wch:25},{wch:8},{wch:25},{wch:8},{wch:25},{wch:8},{wch:25},{wch:8},{wch:8},{wch:8}];
        XLSX.utils.book_append_sheet(wb, wsBS, "Benar_Salah");
    }

    if (allowedTypes.includes('JODOH')) {
        const jHeaders = ["Tipe","Pertanyaan",
            "Kiri_1","Kanan_1","Kiri_2","Kanan_2","Kiri_3","Kanan_3","Kiri_4","Kanan_4","Kiri_5","Kanan_5",
            "Pengecoh_1","Pengecoh_2","Bobot","Wajib"];
        const jSample = [
            ["JODOH","Pasangkan negara dengan ibu kota!","Indonesia","Jakarta","Jepang","Tokyo","Inggris","London","Prancis","Paris","","","Berlin","Madrid","10","TRUE"],
            ["JODOH","Pasangkan hewan dengan makanannya!","Kucing","Ikan","Kelinci","Wortel","Burung","Biji-bijian","","","","","Rumput","","10","TRUE"],
        ];
        const wsJ = XLSX.utils.aoa_to_sheet([jHeaders, ...jSample]);
        wsJ['!cols'] = [{wch:8},{wch:35},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:15},{wch:8},{wch:8}];
        XLSX.utils.book_append_sheet(wb, wsJ, "Menjodohkan");
    }

    if (allowedTypes.includes('Esai')) {
        const eHeaders = ["Tipe","Pertanyaan","Kunci_Jawaban","Bobot","Wajib"];
        const eSample = [
            ["Esai","Jelaskan proses fotosintesis!","Fotosintesis adalah proses...","10","TRUE"],
            ["Esai","Sebutkan 5 rukun Islam!","","10","FALSE"],
        ];
        const wsE = XLSX.utils.aoa_to_sheet([eHeaders, ...eSample]);
        wsE['!cols'] = [{wch:8},{wch:45},{wch:40},{wch:8},{wch:8}];
        XLSX.utils.book_append_sheet(wb, wsE, "Esai");
    }

    const safeSubject = (exam ? exam.subject : 'Soal').replace(/[\\/:*?"<>|]/g,'_').substring(0,40);
    const safeClass   = exam && exam.class ? '_' + String(exam.class).replace(/[\\/:*?"<>|]/g,'_') : '';
    const fileName = `Template_${safeSubject}${safeClass}.xlsx`;

    XLSX.writeFile(wb, fileName);
}

function processExcelImport() {
    const fileInput = document.getElementById('input-excel-file');
    const examId = document.getElementById('select-exam-q').value;

    if (!examId) {
        Swal.fire('Peringatan', 'Silakan pilih Mata Pelajaran di dropdown atas terlebih dahulu!', 'warning');
        return;
    }
    if (fileInput.files.length === 0) {
        Swal.fire('Peringatan', 'Pilih file Excel (.xlsx) dulu.', 'warning');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    const btn = document.querySelector('button[onclick="processExcelImport()"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Membaca File...';

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const questionsToSave = [];
            const errors = [];

            workbook.SheetNames.forEach(sheetName => {
                const ws = workbook.Sheets[sheetName];
                const rawData = XLSX.utils.sheet_to_json(ws, {header: 1});
                if (rawData.length <= 1) return; 

                const header = rawData[0].map(h => String(h || '').trim().toLowerCase());
                rawData.slice(1).forEach((row, rowIdx) => {
                    if (!row || row.length === 0) return;
                    const rowNum = rowIdx + 2; 
                    const type = row[0] ? String(row[0]).trim().toUpperCase() : '';
                    if (!type) return;

                    let normalizedType = type;
                    if (type === 'PG_KOMPLEKS' || type === 'PGK' || type === 'KOMPLEKS') normalizedType = 'PG_KOMPLEKS';
                    else if (type === 'PG') normalizedType = 'PG';
                    else if (type === 'BS' || type === 'BENAR_SALAH' || type === 'BENAR/SALAH') normalizedType = 'BS';
                    else if (type === 'JODOH' || type === 'MENJODOHKAN') normalizedType = 'JODOH';
                    else if (type === 'ESAI' || type === 'ESSAY') normalizedType = 'Esai';
                    else {
                        errors.push(`[${sheetName}] Baris ${rowNum}: Tipe "${type}" tidak dikenali.`);
                        return;
                    }

                    const result = _parseExcelRow(normalizedType, row, header, sheetName, rowNum);
                    if (result.error) {
                        errors.push(result.error);
                    } else {
                        questionsToSave.push(result.data);
                    }
                });
            });

            if (errors.length > 0 && questionsToSave.length === 0) {
                btn.disabled = false;
                btn.innerHTML = originalText;
                Swal.fire({
                    icon: 'error',
                    title: 'Semua Soal Gagal Validasi',
                    html: `<div class="text-left text-xs max-h-60 overflow-y-auto bg-red-50 border border-red-200 rounded p-3 text-red-700 space-y-1">${errors.map(e => `• ${e}`).join('<br>')}</div>`,
                    confirmButtonColor: '#d33'
                });
                return;
            }

            if (questionsToSave.length === 0) throw new Error("Tidak ada data soal valid di file.");

            const importCheck = filterQuestionsForTypeConfig(questionsToSave);
            if (importCheck.blocked.length > 0) {
                const msgs = importCheck.blocked.map(b => `• ${b}`).join('<br>');
                btn.disabled = false;
                btn.innerHTML = originalText;
                Swal.fire({
                    icon: 'warning',
                    title: 'Import Dibatalkan',
                    html: `<p class="text-sm text-slate-500 mb-3">Beberapa soal melanggar konfigurasi Admin:</p><div class="text-left text-xs bg-red-50 border border-red-200 rounded p-3 text-red-700">${msgs}</div>`,
                    confirmButtonColor: '#d33',
                    footer: `<span class="text-xs text-slate-400">Soal valid: ${importCheck.allowed.length}. Perbaiki file lalu coba lagi.</span>`
                });
                return;
            }

            const doUpload = () => {
                btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Mengupload...';
                google.script.run
                    .withSuccessHandler(res => {
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                        if (res.success) {
                            Swal.fire('Sukses', `Berhasil mengimport ${res.count} soal!`, 'success');
                            fileInput.value = '';
                            document.getElementById('form-import-excel').classList.add('hidden');
                            loadQuestionsTable(examId);
                        } else {
                            Swal.fire('Gagal', res.message, 'error');
                        }
                    })
                    .withFailureHandler(err => {
                        btn.disabled = false;
                        btn.innerHTML = originalText;
                        Swal.fire('Error Server', err.message || 'Gagal menyimpan ke database.', 'error');
                    })
                    .saveImportedQuestions(examId, questionsToSave, currentUser.userID, currentUser.token);
            };

            if (errors.length > 0) {
                btn.disabled = false;
                btn.innerHTML = originalText;
                Swal.fire({
                    icon: 'warning',
                    title: `${errors.length} Baris Dilewati`,
                    html: `<p class="text-sm text-slate-600 mb-2">${questionsToSave.length} soal valid siap diimport. ${errors.length} baris gagal validasi:</p><div class="text-left text-xs max-h-40 overflow-y-auto bg-amber-50 border border-amber-200 rounded p-3 text-amber-700 space-y-1">${errors.slice(0, 20).map(e => `• ${e}`).join('<br>')}${errors.length > 20 ? '<br>• ...' : ''}</div>`,
                    showCancelButton: true,
                    confirmButtonText: `Import ${questionsToSave.length} Soal Valid`,
                    cancelButtonText: 'Batal',
                    confirmButtonColor: '#16a34a'
                }).then(result => {
                    if (result.isConfirmed) {
                        btn.disabled = true;
                        doUpload();
                    }
                });
            } else {
                doUpload();
            }

        } catch (err) {
            btn.disabled = false;
            btn.innerHTML = originalText;
            Swal.fire('Error', 'Gagal memproses file: ' + err.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function _parseExcelRow(type, row, header, sheetName, rowNum) {
    const prefix = `[${sheetName}] Baris ${rowNum}`;

    // ---- Header-aware column lookup helpers ----
    // header: array of normalized lowercased strings (already trimmed) from row 0
    function _findCol(/* ...candidates */) {
        const cands = Array.from(arguments).map(s => String(s || '').toLowerCase());
        for (let i = 0; i < header.length; i++) {
            const h = header[i];
            if (!h) continue;
            if (cands.indexOf(h) !== -1) return i;
        }
        return -1;
    }
    function _findColRegex(re) {
        for (let i = 0; i < header.length; i++) {
            if (header[i] && re.test(header[i])) return i;
        }
        return -1;
    }
    function _cell(idx) {
        if (idx < 0 || idx >= row.length) return '';
        const v = row[idx];
        return (v === undefined || v === null) ? '' : String(v).trim();
    }

    const idxPertanyaan = _findCol('pertanyaan', 'soal', 'question');
    const content = idxPertanyaan >= 0 ? _cell(idxPertanyaan) : (row[1] ? String(row[1]).trim() : '');

    if (!content) {
        return { error: `${prefix}: Kolom Pertanyaan kosong.` };
    }

    if (type === 'PG' || type === 'PG_KOMPLEKS') {
        // 1) Determine admin's max option count for this type (default 5, clamp 2..6)
        let maxOptCount = 5;
        if (currentExamTypeConfig && currentExamTypeConfig[type] && currentExamTypeConfig[type].optCount) {
            const n = parseInt(currentExamTypeConfig[type].optCount);
            if (!isNaN(n)) maxOptCount = n;
        }
        maxOptCount = Math.max(2, Math.min(6, maxOptCount));

        // 2) Locate option columns by header name (Opsi_A..Opsi_F or A..F)
        const optLetters = ['A','B','C','D','E','F'];
        const optColIdx = [];
        optLetters.forEach(L => {
            const idx = _findCol(`opsi_${L.toLowerCase()}`, `opsi ${L.toLowerCase()}`, L.toLowerCase(), `opsi${L.toLowerCase()}`);
            if (idx >= 0) optColIdx.push({ letter: L, col: idx });
        });

        // Fallback: if header didn't expose Opsi_* columns, infer by position
        // (Tipe=0, Pertanyaan=1, Opsi mulai dari kolom 2 sampai sebelum Kunci)
        let inferredFromHeader = optColIdx.length > 0;

        // 3) Locate Kunci, Bobot, Wajib via header
        const idxKunci = _findCol('kunci_jawaban', 'kunci jawaban', 'kunci', 'jawaban', 'key');
        const idxBobot = _findCol('bobot', 'point', 'poin', 'skor');
        const idxWajib = _findCol('wajib', 'required', 'is_required', 'isrequired');

        // 4) Read options. If header-based, use those columns up to maxOptCount.
        //    If not, fall back to positional read but stop before idxKunci to avoid
        //    treating Kunci as an option when admin reduced optCount.
        let rawOptions = [];
        if (inferredFromHeader) {
            // sort by column index (defensive) and limit to first maxOptCount columns
            optColIdx.sort((a, b) => a.col - b.col);
            const limited = optColIdx.slice(0, maxOptCount);
            rawOptions = limited.map(o => _cell(o.col));
        } else {
            const startCol = 2;
            const endCol = (idxKunci > startCol) ? idxKunci : Math.min(row.length, startCol + maxOptCount);
            for (let c = startCol; c < endCol && (c - startCol) < maxOptCount; c++) {
                rawOptions.push(_cell(c));
            }
        }

        // 5) Filter empty options (allow trailing blanks if admin's max is, e.g., 5 but only 4 filled)
        const options = rawOptions.filter(o => o !== '' && o !== null && o !== undefined);

        if (options.length < 2) {
            return { error: `${prefix} (${type}): Minimal 2 opsi terisi, hanya ditemukan ${options.length}.` };
        }
        if (options.length > maxOptCount) {
            return { error: `${prefix} (${type}): Terdapat ${options.length} opsi terisi, melebihi batas maksimal ${maxOptCount} (A-${optLetters[maxOptCount - 1]}) yang dikonfigurasi Admin.` };
        }

        // 6) Read kunci jawaban (header-based; positional fallback uses last 3 cols pattern)
        const keyRaw = idxKunci >= 0
            ? _cell(idxKunci).toUpperCase()
            : (rawOptions.length ? String(row[2 + rawOptions.length] || '').trim().toUpperCase() : '');

        if (!keyRaw) {
            return { error: `${prefix} (${type}): Kunci jawaban kosong.` };
        }

        const labels = ['A','B','C','D','E','F'];
        const maxLetter = labels[options.length - 1];

        if (type === 'PG') {
            if (keyRaw.length !== 1 || !labels.includes(keyRaw)) {
                return { error: `${prefix} (PG): Kunci "${keyRaw}" tidak valid. Harus satu huruf (A-${maxLetter}).` };
            }
            if (keyRaw > maxLetter) {
                return { error: `${prefix} (PG): Kunci "${keyRaw}" melebihi opsi yang tersedia (A-${maxLetter}).` };
            }
        } else {
            const keyLetters = keyRaw.split(',').map(k => k.trim()).filter(k => k);
            if (keyLetters.length < 2) {
                return { error: `${prefix} (PG_KOMPLEKS): Kunci harus minimal 2 huruf (contoh: A, C). Ditemukan: "${keyRaw}".` };
            }
            const invalid = keyLetters.find(k => !labels.includes(k) || k > maxLetter);
            if (invalid) {
                return { error: `${prefix} (PG_KOMPLEKS): Kunci "${invalid}" tidak valid. Harus antara A-${maxLetter}.` };
            }
        }

        const optTexts = options.map(o => String(o).toLowerCase());
        const dupIdx = optTexts.findIndex((v, i) => optTexts.indexOf(v) !== i);
        if (dupIdx !== -1) {
            return { error: `${prefix} (${type}): Opsi ${labels[dupIdx]} duplikat dengan opsi lain.` };
        }

        let correct = keyRaw;
        if (type === 'PG_KOMPLEKS') {
            const keyArr = keyRaw.split(',').map(k => k.trim()).filter(k => k);
            correct = JSON.stringify(keyArr);
        }

        // 7) Bobot & Wajib (header-based; positional fallback after kunci)
        let bobot = 10;
        if (idxBobot >= 0) {
            const v = _cell(idxBobot);
            if (v) bobot = parseInt(v) || 10;
        } else {
            const fallbackBobotCol = (idxKunci >= 0 ? idxKunci + 1 : 2 + options.length + 1);
            const v = _cell(fallbackBobotCol);
            if (v) bobot = parseInt(v) || 10;
        }
        let isReq = 'TRUE';
        if (idxWajib >= 0) {
            const v = _cell(idxWajib);
            if (v) isReq = v.toUpperCase();
        } else {
            const fallbackWajibCol = (idxKunci >= 0 ? idxKunci + 2 : 2 + options.length + 2);
            const v = _cell(fallbackWajibCol);
            if (v) isReq = v.toUpperCase();
        }

        return { data: { type, content, options, correct, point: bobot, isRequired: isReq, image: '' } };
    }

    if (type === 'BS') {
        const statements = [];
        const keys = {};

        // Header-aware: find Pernyataan_N / Kunci_N pairs
        const pairs = [];
        for (let i = 1; i <= 10; i++) {
            const sIdx = _findCol(`pernyataan_${i}`, `pernyataan ${i}`, `pernyataan${i}`);
            const kIdx = _findCol(`kunci_${i}`, `kunci ${i}`, `kunci${i}`);
            if (sIdx >= 0 && kIdx >= 0) pairs.push({ s: sIdx, k: kIdx });
        }

        if (pairs.length > 0) {
            pairs.forEach(p => {
                const stmt = _cell(p.s);
                const kunci = _cell(p.k);
                if (stmt) {
                    const kNorm = kunci.charAt(0).toUpperCase() + kunci.slice(1).toLowerCase();
                    if (kNorm !== 'Benar' && kNorm !== 'Salah') {
                        // Will be caught below, but skip silently if kunci empty? No, surface error.
                        statements.push({ __invalid: true, stmt, kunci });
                    } else {
                        statements.push(stmt);
                        keys[statements.length - 1] = kNorm;
                    }
                }
            });
            const bad = statements.find(s => typeof s === 'object' && s.__invalid);
            if (bad) {
                return { error: `${prefix} (BS): Kunci pernyataan "${bad.stmt.substring(0, 20)}..." harus "Benar" atau "Salah", ditemukan: "${bad.kunci}".` };
            }
        } else {
            // Positional fallback (legacy behaviour)
            let colIdx = 2;
            for (let i = 0; i < 5; i++) {
                const stmt = row[colIdx] ? String(row[colIdx]).trim() : '';
                const kunci = row[colIdx + 1] ? String(row[colIdx + 1]).trim() : '';
                colIdx += 2;
                if (stmt) {
                    const kNorm = kunci.charAt(0).toUpperCase() + kunci.slice(1).toLowerCase();
                    if (kNorm !== 'Benar' && kNorm !== 'Salah') {
                        return { error: `${prefix} (BS): Kunci pernyataan "${stmt.substring(0, 20)}..." harus "Benar" atau "Salah", ditemukan: "${kunci}".` };
                    }
                    statements.push(stmt);
                    keys[statements.length - 1] = kNorm;
                }
            }
        }

        if (statements.length < 3) {
            return { error: `${prefix} (BS): Minimal 3 pernyataan diperlukan, hanya ditemukan ${statements.length}.` };
        }

        const stmtLower = statements.map(s => String(s).toLowerCase());
        const dupStmt = stmtLower.findIndex((v, i) => stmtLower.indexOf(v) !== i);
        if (dupStmt !== -1) {
            return { error: `${prefix} (BS): Pernyataan ke-${dupStmt + 1} duplikat.` };
        }

        const idxBobot = _findCol('bobot', 'point', 'poin', 'skor');
        const idxWajib = _findCol('wajib', 'required', 'is_required', 'isrequired');
        const bobot = idxBobot >= 0 ? (parseInt(_cell(idxBobot)) || 10) : (row[12] ? (parseInt(row[12]) || 10) : 10);
        const isReq = idxWajib >= 0 ? (_cell(idxWajib).toUpperCase() || 'TRUE') : (row[13] ? String(row[13]).toUpperCase() : 'TRUE');

        return { data: { type, content, options: statements, correct: JSON.stringify(keys), point: bobot, isRequired: isReq, image: '' } };
    }

    if (type === 'JODOH') {
        const pairs = [];
        const pairCols = [];
        for (let i = 1; i <= 10; i++) {
            const lIdx = _findCol(`kiri_${i}`, `kiri ${i}`, `kiri${i}`);
            const rIdx = _findCol(`kanan_${i}`, `kanan ${i}`, `kanan${i}`);
            if (lIdx >= 0 && rIdx >= 0) pairCols.push({ l: lIdx, r: rIdx, n: i });
        }

        if (pairCols.length > 0) {
            pairCols.forEach(pc => {
                const left = _cell(pc.l);
                const right = _cell(pc.r);
                if (left && right) pairs.push({ q: left, a: right });
                else if (left && !right) pairs.push({ __invalid: pc.n });
            });
            const bad = pairs.find(p => p.__invalid);
            if (bad) {
                return { error: `${prefix} (JODOH): Pasangan ke-${bad.__invalid} memiliki sisi kiri tapi sisi kanan kosong.` };
            }
        } else {
            // Positional fallback
            let colIdx = 2;
            for (let i = 0; i < 5; i++) {
                const left = row[colIdx] ? String(row[colIdx]).trim() : '';
                const right = row[colIdx + 1] ? String(row[colIdx + 1]).trim() : '';
                colIdx += 2;
                if (left && right) pairs.push({ q: left, a: right });
                else if (left && !right) {
                    return { error: `${prefix} (JODOH): Pasangan ke-${i + 1} memiliki sisi kiri tapi sisi kanan kosong.` };
                }
            }
        }

        // Pengecoh (distractors)
        const distractorCols = [];
        for (let i = 1; i <= 10; i++) {
            const dIdx = _findCol(`pengecoh_${i}`, `pengecoh ${i}`, `pengecoh${i}`, `distractor_${i}`);
            if (dIdx >= 0) distractorCols.push(dIdx);
        }
        if (distractorCols.length > 0) {
            distractorCols.forEach(dIdx => {
                const v = _cell(dIdx);
                if (v) pairs.push({ q: '', a: v });
            });
        } else {
            const p1 = row[12] ? String(row[12]).trim() : '';
            const p2 = row[13] ? String(row[13]).trim() : '';
            if (p1) pairs.push({ q: '', a: p1 });
            if (p2) pairs.push({ q: '', a: p2 });
        }

        const realPairs = pairs.filter(p => p.q);
        const distractors = pairs.filter(p => !p.q);

        if (realPairs.length < 3) {
            return { error: `${prefix} (JODOH): Minimal 3 pasangan diperlukan, hanya ditemukan ${realPairs.length}.` };
        }
        if (distractors.length < 1) {
            return { error: `${prefix} (JODOH): Minimal 1 pengecoh diperlukan. Isi kolom Pengecoh.` };
        }

        const leftTexts = realPairs.map(p => p.q.toLowerCase());
        const dupL = leftTexts.findIndex((v, i) => leftTexts.indexOf(v) !== i);
        if (dupL !== -1) {
            return { error: `${prefix} (JODOH): Pernyataan kiri ke-${dupL + 1} duplikat.` };
        }

        const rightTexts = pairs.filter(p => p.a).map(p => p.a.toLowerCase());
        const dupR = rightTexts.findIndex((v, i) => rightTexts.indexOf(v) !== i);
        if (dupR !== -1) {
            return { error: `${prefix} (JODOH): Jawaban/opsi kanan duplikat.` };
        }

        const idxBobot = _findCol('bobot', 'point', 'poin', 'skor');
        const idxWajib = _findCol('wajib', 'required', 'is_required', 'isrequired');
        const bobot = idxBobot >= 0 ? (parseInt(_cell(idxBobot)) || 10) : (row[14] ? (parseInt(row[14]) || 10) : 10);
        const isReq = idxWajib >= 0 ? (_cell(idxWajib).toUpperCase() || 'TRUE') : (row[15] ? String(row[15]).toUpperCase() : 'TRUE');

        return { data: { type, content, options: pairs, correct: 'Auto-Check', point: bobot, isRequired: isReq, image: '' } };
    }

    if (type === 'Esai') {
        const idxKunci = _findCol('kunci_jawaban', 'kunci jawaban', 'kunci', 'jawaban', 'key');
        const idxBobot = _findCol('bobot', 'point', 'poin', 'skor');
        const idxWajib = _findCol('wajib', 'required', 'is_required', 'isrequired');
        const key = idxKunci >= 0 ? _cell(idxKunci) : (row[2] ? String(row[2]).trim() : '');
        const bobot = idxBobot >= 0 ? (parseInt(_cell(idxBobot)) || 10) : (row[3] ? (parseInt(row[3]) || 10) : 10);
        const isReq = idxWajib >= 0 ? (_cell(idxWajib).toUpperCase() || 'TRUE') : (row[4] ? String(row[4]).toUpperCase() : 'TRUE');

        return { data: { type, content, options: [], correct: key, point: bobot, isRequired: isReq, image: '' } };
    }

    return { error: `${prefix}: Tipe "${type}" tidak didukung.` };
}

function showBatchForm() {
  _qbShowForm('batch');
}

// Unified form switcher
function _qbShowForm(name) {
  const map = {
    manual: 'form-add-q',
    gform:  'form-import-q',
    excel:  'form-import-excel',
    copy:   'form-copy-q',
    batch:  'form-batch-q'
  };
  const all = Object.values(map);
  const targetId = map[name];

  // Hide all
  all.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Show selected
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (!target) return;

  // Per-form pre-actions
  if (name === 'manual') {
    if (typeof resetQuestionForm === 'function') resetQuestionForm();
    if (typeof toggleOptionsInput === 'function') toggleOptionsInput('PG');
    // Sync exam id from dropdown so user can save without re-selecting
    const examSel = document.getElementById('select-exam-q');
    const hidden  = document.getElementById('input-exam-id');
    if (examSel && hidden && examSel.value) hidden.value = examSel.value;
  }
  if (name === 'copy') {
    if (typeof initCopyForm === 'function') initCopyForm();
  }

  target.classList.remove('hidden');

  // Smooth scroll to form
  setTimeout(() => {
    target.scrollIntoView({ behavior:'smooth', block:'start' });
    if (name === 'batch') {
      const ta = document.getElementById('batch-input-text');
      if (ta) try { ta.focus(); } catch(e) {}
      // Wiring orchestration Task 5.6 — idempoten, hanya bind sekali tapi
      // selalu re-resolve examId dari dropdown agar TypeConfig terbaru
      // ikut termuat saat formulir dibuka.
      try {
        const examSel = document.getElementById('select-exam-q');
        const examId = examSel && examSel.value ? examSel.value : null;
        if (window.BatchSoal && window.BatchSoal.UI) {
          // renderQuestionBank rebuilds the batch DOM on each visit, so force a
          // full re-init that re-wires textarea/summary/action-bar/format-guide
          // to the fresh elements. Falls back to init() for older builds.
          if (typeof window.BatchSoal.UI.reinitForRender === 'function') {
            window.BatchSoal.UI.reinitForRender(examId);
          } else if (typeof window.BatchSoal.UI.init === 'function') {
            window.BatchSoal.UI.init(examId);
          }
        }
      } catch (e) { /* swallow */ }
    } else if (name === 'gform') {
      const inp = document.getElementById('input-form-url');
      if (inp) try { inp.focus(); } catch(e) {}
    }
  }, 80);
}

function parseBatchText(rawText) {
  const results = [];
  const errors  = [];
  const blocks  = rawText.trim().split(/\n\s*\n/);

  blocks.forEach((block, blockIdx) => {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    let questionText = '';
    const options    = [];
    let answerLetter = '';
    const optionMap  = {};

    lines.forEach(line => {
      if (/^(jawaban|kunci|answer|jawab)\s*:/i.test(line)) {
        const match = line.match(/:\s*([A-Ea-e])/);
        if (match) answerLetter = match[1].toUpperCase();
        return;
      }
      const optMatch = line.match(/^([A-Ea-e])[.)]\s+(.+)/);
      if (optMatch) {
        const letter = optMatch[1].toUpperCase();
        const text   = optMatch[2].trim();
        optionMap[letter] = text;
        options.push(text);
        return;
      }
      const numMatch = line.match(/^(?:No\.?\s*)?\d+[.)]\s+(.+)/);
      if (numMatch) {
        questionText = numMatch[1].trim();
        return;
      }
      if (questionText && options.length === 0) {
        questionText += '\n' + line;
      }
    });

    if (!questionText) {
      errors.push(`Blok ${blockIdx + 1}: Teks pertanyaan tidak ditemukan.`);
      return;
    }
    if (options.length < 2) {
      errors.push(`Blok ${blockIdx + 1}: Pilihan jawaban kurang (minimal 2). Soal: "${questionText.substring(0, 40)}..."`);
      return;
    }

    let correctText = '';
    if (answerLetter && optionMap[answerLetter]) {
      correctText = answerLetter;
    } else if (answerLetter) {
      errors.push(`Blok ${blockIdx + 1}: Huruf kunci "${answerLetter}" tidak ada di opsi. Soal: "${questionText.substring(0, 40)}..."`);
      return;
    }

    results.push({
      type:       'PG',
      content:    questionText,
      options:    options,
      correct:    correctText,
      isRequired: 'TRUE',
      image:      ''
    });
  });

  return { results, errors };
}

function updateBatchPreviewCount() {
  const raw    = document.getElementById('batch-input-text').value;
  const status = document.getElementById('batch-preview-status');
  if (!raw.trim()) { status.classList.add('hidden'); return; }

  const { results, errors } = parseBatchText(raw);
  status.classList.remove('hidden');

  let html = '';
  if (results.length > 0) {
    html += `<span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold mr-2">
      <i class="fas fa-check-circle"></i> ${results.length} soal valid
    </span>`;
  }
  if (errors.length > 0) {
    html += `<span class="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold">
      <i class="fas fa-exclamation-triangle"></i> ${errors.length} soal bermasalah
    </span>`;
  }
  status.innerHTML = html;
}

function previewBatchInput() {
  const raw = document.getElementById('batch-input-text').value;
  if (!raw.trim()) {
    Swal.fire('Kosong', 'Silakan tempel teks soal terlebih dahulu.', 'warning');
    return;
  }

  const { results, errors } = parseBatchText(raw);

  if (results.length === 0 && errors.length === 0) {
    Swal.fire('Tidak Ada Soal', 'Tidak ada soal yang berhasil dikenali. Pastikan formatnya sudah benar.', 'info');
    return;
  }

  let html = '';
  if (results.length > 0) {
    html += `<p class="text-left text-xs font-bold text-emerald-700 mb-2"><i class="fas fa-check-circle mr-1"></i> ${results.length} Soal Terdeteksi:</p>`;
    html += '<div class="text-left space-y-2 max-h-60 overflow-y-auto pr-1">';
    results.forEach((q, i) => {
      html += `<div class="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
        <p class="font-bold text-slate-700">${i + 1}. ${q.content.substring(0, 80)}${q.content.length > 80 ? '...' : ''}</p>
        <p class="text-slate-500 mt-0.5">Opsi: ${q.options.map((o, idx) => String.fromCharCode(65+idx) + '. ' + o).join(' | ')}</p>
        <p class="text-emerald-700 font-semibold mt-0.5"><i class="fas fa-key text-xs mr-1"></i>Kunci: ${q.correct || '(tidak ada)'}</p>
      </div>`;
    });
    html += '</div>';
  }
  if (errors.length > 0) {
    html += `<p class="text-left text-xs font-bold text-red-600 mt-3 mb-1"><i class="fas fa-exclamation-triangle mr-1"></i> ${errors.length} Soal Bermasalah:</p>`;
    html += '<ul class="text-left text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto">';
    errors.forEach(e => { html += `<li>• ${e}</li>`; });
    html += '</ul>';
  }

  Swal.fire({
    title: 'Preview Hasil Parsing',
    html: html,
    icon: results.length > 0 ? 'success' : 'warning',
    confirmButtonText: results.length > 0 ? '<i class="fas fa-upload"></i> Lanjut Simpan' : 'Tutup',
    showCancelButton: results.length > 0,
    cancelButtonText: 'Batal',
    confirmButtonColor: '#7c3aed',
    width: 600
  }).then(res => {
    if (res.isConfirmed && results.length > 0) {
      doSaveBatchQuestions(results);
    }
  });
}

function processBatchInput() {
  const raw    = document.getElementById('batch-input-text').value;
  const examId = document.getElementById('select-exam-q').value;

  if (!raw.trim()) {
    Swal.fire('Kosong', 'Silakan tempel teks soal terlebih dahulu.', 'warning');
    return;
  }
  if (!examId) {
    Swal.fire('Pilih Ujian', 'Silakan pilih mata pelajaran/ujian tujuan terlebih dahulu (dropdown di atas).', 'warning');
    return;
  }

  const { results, errors } = parseBatchText(raw);

  if (results.length === 0) {
    let errMsg = 'Tidak ada soal yang berhasil dikenali. Periksa format Anda.';
    if (errors.length > 0) errMsg += '<br><br>' + errors.map(e => '• ' + e).join('<br>');
    Swal.fire({ title: 'Gagal Parse', html: errMsg, icon: 'error' });
    return;
  }

  let confirmHtml = `Sistem akan menyimpan <b class="text-purple-700">${results.length} soal</b> ke ujian yang dipilih.`;
  if (errors.length > 0) {
    confirmHtml += `<br><span class="text-red-500 text-sm">(${errors.length} soal dilewati karena format bermasalah)</span>`;
  }

  Swal.fire({
    title: 'Konfirmasi Simpan Batch',
    html: confirmHtml,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-save"></i> Ya, Simpan Sekarang',
    cancelButtonText: 'Cek Dulu',
    confirmButtonColor: '#7c3aed'
  }).then(res => {
    if (res.isConfirmed) doSaveBatchQuestions(results);
  });
}

function doSaveBatchQuestions(questionsArr) {
  const examId = document.getElementById('select-exam-q').value;
  if (!examId) {
    Swal.fire('Pilih Ujian', 'Silakan pilih mata pelajaran tujuan terlebih dahulu.', 'warning');
    return;
  }

  const btn = document.querySelector('#form-batch-q button[onclick="processBatchInput()"]');
  const btnText = document.getElementById('batch-btn-text');
  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Menyimpan...';

  const batchCheck = filterQuestionsForTypeConfig(questionsArr);
  if (batchCheck.blocked.length > 0) {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Simpan Semua Soal';
    const msgs = batchCheck.blocked.map(b => `• ${b}`).join('<br>');
    Swal.fire({
      icon: 'warning',
      title: 'Soal Tidak Dapat Disimpan',
      html: `<p class="text-sm text-slate-500 mb-2">Beberapa soal melanggar konfigurasi Admin:</p><div class="text-left text-xs bg-red-50 border border-red-200 rounded p-3 text-red-700">${msgs}</div>`,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#d33',
      footer: `<span class="text-xs text-slate-400">Soal yang valid: ${batchCheck.allowed.length} soal.</span>`
    });
    return;
  }

  Swal.fire({
    title: 'Menyimpan Soal...',
    html: `<div class="flex flex-col items-center gap-3">
      <i class="fas fa-circle-notch fa-spin text-3xl text-purple-500"></i>
      <p class="text-slate-500 text-sm">Mohon tunggu, sedang menyimpan ${questionsArr.length} soal...</p>
    </div>`,
    allowOutsideClick: false,
    showConfirmButton: false
  });

  google.script.run
    .withSuccessHandler(res => {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = 'Simpan Semua Soal';
      Swal.close();
      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil! 🎉',
          html: `<b>${res.count} soal</b> berhasil ditambahkan ke bank soal.`,
          confirmButtonColor: '#7c3aed',
          timer: 2500,
          showConfirmButton: false
        });
        document.getElementById('batch-input-text').value = '';
        document.getElementById('batch-preview-status').classList.add('hidden');
        document.getElementById('form-batch-q').classList.add('hidden');
        loadQuestionsTable(examId);
      } else {
        Swal.fire('Gagal', res.message || 'Terjadi kesalahan saat menyimpan.', 'error');
      }
    })
    .withFailureHandler(err => {
      if (btn) btn.disabled = false;
      if (btnText) btnText.textContent = 'Simpan Semua Soal';
      Swal.fire('Error', err.message, 'error');
    })
    .saveImportedQuestions(examId, questionsArr, currentUser.userID, currentUser.token);
}

function resetExamAttempt(responseId, studentName) {
    // FIX BUG-6: capture examId sekarang (sinkron) sebelum Swal async.
    // Jika user pindah tab saat Swal terbuka, elemen select bisa hilang dari DOM.
    const examSelectEl = document.getElementById('select-result-exam');
    const capturedExamId = examSelectEl ? examSelectEl.value : (window._resultsUI && window._resultsUI.examId) || '';

    Swal.fire({
        title: 'Reset Ujian?',
        html: `<p style="font-size:13px;color:#475569;">Anda akan menghapus data ujian <b>${String(studentName||'siswa').replace(/</g,'&lt;')}</b>.</p>
               <p style="font-size:12px;color:#dc2626;margin-top:8px;background:#fef2f2;padding:8px 12px;border-radius:8px;border:1px solid #fecaca;">
                 <i class="fas fa-triangle-exclamation"></i> Siswa dapat mengikuti ujian kembali dari awal setelah ini.
               </p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: '<i class="fas fa-rotate-right" style="margin-right:6px;"></i>Ya, Reset Data',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        customClass: { popup: 'lp-swal' }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Memproses...',
                html: '<p style="font-size:13px;color:#475569;">Menghapus data ujian siswa...</p>',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); },
                customClass: { popup: 'lp-swal' }
            });

            google.script.run
                .withSuccessHandler((res) => {
                    if (res && res.success) {
                        const Toast = Swal.mixin({ toast:true, position:'top-end', showConfirmButton:false, timer:2000, timerProgressBar:true });
                        Toast.fire({ icon:'success', title: res.message || 'Data ujian direset' });
                        // FIX BUG-6: gunakan capturedExamId bukan akses DOM ulang
                        if (capturedExamId) loadResultsTable(capturedExamId);
                    } else {
                        Swal.fire({
                            title: 'Gagal',
                            html: `<p style="font-size:13px;color:#475569;">${(res && res.message) || 'Terjadi kesalahan.'}</p>`,
                            icon: 'error', confirmButtonColor: '#dc2626',
                            customClass: { popup: 'lp-swal' }
                        });
                    }
                })
                .withFailureHandler((err) => {
                    Swal.fire({
                        title: 'Error Server',
                        html: `<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) ? err.message : String(err)}</p>`,
                        icon: 'error', confirmButtonColor: '#dc2626',
                        customClass: { popup: 'lp-swal' }
                    });
                })
                .resetStudentExam(responseId, currentUser.userID, currentUser.token);
        }
    });
}
