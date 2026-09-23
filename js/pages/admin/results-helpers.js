/**
 * results-helpers.js — Helpers untuk Hasil & Nilai (shared antara results dan question bank)
 * Sumber: index.html L38542-38858
 */

function handleResultSearch(keyword) {
    const term = keyword.toLowerCase().trim();

    filteredResults = allResultsData.filter(item => {
        return item.name.toLowerCase().includes(term) ||
            item.studentId.toLowerCase().includes(term);
    });

    currentPage = 1; 
    renderInternalTable(); 
}

function changeRowsPerPage(val) {
    if (val === 'all') {
        rowsPerPage = filteredResults.length > 0 ? filteredResults.length : 10;
    } else {
        rowsPerPage = parseInt(val);
    }
    currentPage = 1; 
    renderInternalTable();
}

function changePage(direction) {
    if (direction === 'prev') {
        if (currentPage > 1) currentPage--;
    } else if (direction === 'next') {
        const maxPage = Math.ceil(filteredResults.length / rowsPerPage);
        if (currentPage < maxPage) currentPage++;
    }
    renderInternalTable();
}

function closePreviewModal() {
    const modal = document.getElementById('modal-preview');
    if (modal) {
        modal.classList.add('hidden');
        // BUG FIX: null-check sebelum classList.replace agar tidak throw
        const dialog = modal.querySelector('.relative.w-full');
        if (dialog) {
            dialog.classList.remove('max-w-6xl');
            dialog.classList.add('max-w-4xl');
        }
    }
}

// Keyboard Escape untuk menutup modal preview soal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('modal-preview');
        if (modal && !modal.classList.contains('hidden')) {
            closePreviewModal();
        }
    }
});

function _renderSingleQuestionForPreview(q, index) {
    // ── Tipe meta untuk badge warna ──────────────────────────────────────────
    const TYPE_META = {
        PG:          { label: 'Pilihan Ganda',      color: 'bg-blue-100 text-blue-700 border-blue-200'     },
        PG_KOMPLEKS: { label: 'PG Kompleks',        color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
        BS:          { label: 'Benar / Salah',      color: 'bg-orange-100 text-orange-700 border-orange-200' },
        JODOH:       { label: 'Menjodohkan',        color: 'bg-teal-100 text-teal-700 border-teal-200'     },
        Esai:        { label: 'Esai',               color: 'bg-rose-100 text-rose-700 border-rose-200'     }
    };
    const typeMeta  = TYPE_META[q.type] || { label: q.type, color: 'bg-slate-100 text-slate-600 border-slate-200' };
    const pointVal  = q.point ? Number(q.point) : null;
    const isRequired = String(q.isRequired || '').toUpperCase() === 'TRUE';

    let html = `<div class="bg-white rounded-xl shadow-sm border border-slate-200 mb-4 overflow-hidden">`;

    // ── Header kartu ─────────────────────────────────────────────────────────
    html += `
        <div class="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex-wrap gap-y-2">
            <span class="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white border border-slate-200 text-slate-600 font-black rounded-full text-sm shadow-sm">${index + 1}</span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${typeMeta.color}">${typeMeta.label}</span>
            ${pointVal !== null ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold"><i class="fas fa-star text-[8px]"></i>${pointVal} poin</span>` : ''}
            ${isRequired ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold"><i class="fas fa-asterisk text-[8px]"></i>Wajib</span>` : `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold">Opsional</span>`}
            <span class="ml-auto text-[10px] text-slate-400 font-mono">ID: ${String(q.id || '').substring(0, 12)}</span>
        </div>`;

    // ── Konten soal ──────────────────────────────────────────────────────────
    html += `<div class="px-5 pt-5 pb-4">`;
    html += `<div class="question-text text-base md:text-lg mb-5">${prepContent(q.content)}</div>`;

    if (q.image) {
        html += `<div class="mb-5 border rounded-xl overflow-hidden flex justify-center bg-slate-50">
                    <img src="${q.image}?sz=w1000" class="max-w-full h-auto max-h-96" alt="Gambar Soal">
                 </div>`;
    }

    if (q.audio) {
        const _fid = _driveFileIdFromLink(q.audio);
        if (_fid) {
            const _audName = (typeof _resolveQuestionAudioName === 'function')
                ? _resolveQuestionAudioName(q.audio) : 'Audio Soal';
            html += '<div class="mb-5">' + _driveAudioHtml(q.audio, _audName, 'exam') + '</div>';
        }
    }

    const type = q.type;
    let options = [];
    try { options = JSON.parse(q.options); } catch (e) { options = []; }

    if (type === 'PG' && Array.isArray(options)) {
        const correctLetter = String(q.key || '').trim().toUpperCase();
        const optionChars = ['A', 'B', 'C', 'D', 'E'];
        html += '<div class="space-y-3">';
        options.forEach((opt, i) => {
            const letter = optionChars[i];
            const isCorrect = (letter === correctLetter);
            html += `
                <label class="option-label ${isCorrect ? 'border border-emerald-300 bg-emerald-50 !rounded-xl' : ''}">
                    <div class="custom-radio ${isCorrect ? '!border-emerald-500 !bg-emerald-500' : '!border-slate-300'}"></div>
                    <div class="flex-1">
                        <span class="font-bold ${isCorrect ? 'text-emerald-700' : 'text-slate-500'} mr-2">${letter}.</span>
                        <span class="${isCorrect ? 'text-emerald-800 font-semibold' : ''}">${prepContent(opt)}</span>
                    </div>
                    ${isCorrect ? `<span class="ml-2 shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 whitespace-nowrap"><i class="fas fa-check text-[8px]"></i>Kunci</span>` : ''}
                </label>`;
        });
        html += '</div>';
        if (!correctLetter) {
            html += `<div class="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2"><i class="fas fa-triangle-exclamation"></i>Kunci jawaban belum diset.</div>`;
        }

    } else if (type === 'PG_KOMPLEKS' && Array.isArray(options)) {
        let correctList = [];
        try { correctList = JSON.parse(q.key); } catch(e) { correctList = String(q.key || '').split(',').map(s => s.trim()).filter(Boolean); }
        const correctSet = new Set(correctList.map(l => String(l).trim().toUpperCase()));
        const optionChars = ['A', 'B', 'C', 'D', 'E'];
        html += '<p class="text-xs text-indigo-600 font-semibold mb-3 flex items-center gap-1"><i class="fas fa-info-circle"></i> Pilih <b>lebih dari satu</b> jawaban yang benar.</p>';
        html += '<div class="space-y-3">';
        options.forEach((opt, i) => {
            const letter = optionChars[i];
            const isCorrect = correctSet.has(letter);
            html += `
                <div class="option-label py-3 px-4 flex items-center border ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'} rounded-xl">
                    <div class="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center border-2 ${isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'} rounded">
                        ${isCorrect ? '<i class="fas fa-check text-white" style="font-size:9px"></i>' : ''}
                    </div>
                    <div class="flex-1">
                        <span class="font-bold ${isCorrect ? 'text-emerald-700' : 'text-slate-500'} mr-2">${letter}.</span>
                        <span class="${isCorrect ? 'text-emerald-800 font-semibold' : ''}">${prepContent(opt)}</span>
                    </div>
                    ${isCorrect ? `<span class="ml-2 shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 whitespace-nowrap"><i class="fas fa-check text-[8px]"></i>Kunci</span>` : ''}
                </div>`;
        });
        html += '</div>';
        if (correctSet.size === 0) {
            html += `<div class="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2"><i class="fas fa-triangle-exclamation"></i>Kunci jawaban belum diset.</div>`;
        }

    } else if (type === 'Esai') {
        html += `<textarea readonly class="w-full border border-slate-200 rounded-lg p-4 h-32 bg-slate-50" placeholder="Siswa akan mengetik jawaban di sini..."></textarea>`;
        const keywords = String(q.key || '').trim();
        if (keywords) {
            const kwList = keywords.split(',').map(k => k.trim()).filter(Boolean);
            html += `
                <div class="mt-4 rounded-xl border border-violet-200 bg-violet-50 overflow-hidden">
                    <div class="px-4 py-2 bg-violet-100 border-b border-violet-200 flex items-center gap-2">
                        <i class="fas fa-key text-violet-500 text-xs"></i>
                        <span class="text-xs font-bold text-violet-700 uppercase tracking-wide">Kata Kunci Penilaian</span>
                    </div>
                    <div class="px-4 py-3 flex flex-wrap gap-2">
                        ${kwList.map(kw => `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-violet-300 text-violet-700 text-xs font-semibold shadow-sm"><i class="fas fa-tag text-[9px] text-violet-400"></i>${kw}</span>`).join('')}
                    </div>
                </div>`;
        } else {
            html += `<div class="mt-3 text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2"><i class="fas fa-circle-info"></i>Tidak ada kata kunci penilaian — dinilai manual oleh Guru.</div>`;
        }

    } else if (type === 'BS' && Array.isArray(options)) {
        // Kunci BS bisa berupa dua format:
        //   1. Index-based : {"0":"Salah","1":"Benar"} — key = indeks urutan pernyataan
        //   2. Statement-based: {"Teks pernyataan":"Benar"} — key = teks pernyataan
        // Deteksi format: jika SEMUA key adalah angka bulat → index-based.
        let rawKeyMap = {};
        try {
            const parsed = JSON.parse(q.key);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) rawKeyMap = parsed;
        } catch(e) {}

        const allKeys = Object.keys(rawKeyMap);
        const isIndexBased = allKeys.length > 0 && allKeys.every(k => /^\d+$/.test(k.trim()));

        // Normalisasi ke lookup: indeks → nilai kunci ("Benar"/"Salah")
        const kunciByIndex = {};
        if (isIndexBased) {
            // {"0":"Salah","1":"Benar"} → langsung pakai indeks
            allKeys.forEach(k => { kunciByIndex[parseInt(k, 10)] = rawKeyMap[k]; });
        } else {
            // Statement-based: petakan teks pernyataan ke indeks opsi
            options.forEach((stmt, i) => {
                // Coba exact match dulu, lalu trim match
                if (rawKeyMap.hasOwnProperty(stmt)) {
                    kunciByIndex[i] = rawKeyMap[stmt];
                } else {
                    const stmtTrim = String(stmt).trim();
                    for (const k of allKeys) {
                        if (String(k).trim() === stmtTrim) { kunciByIndex[i] = rawKeyMap[k]; break; }
                    }
                }
            });
        }

        html += `
            <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full">
                    <thead>
                        <tr class="bg-slate-100">
                            <th class="p-3 text-left text-xs font-bold text-slate-600">Pernyataan</th>
                            <th class="p-3 text-center text-xs font-bold text-slate-600 w-40">Jawaban Siswa</th>
                            <th class="p-3 text-center text-xs font-bold text-emerald-700 w-28">Kunci</th>
                        </tr>
                    </thead>
                    <tbody>`;
        options.forEach((stmt, i) => {
            const kunci  = kunciByIndex[i] || null;
            const isBenar = (String(kunci || '').toLowerCase() === 'benar');
            html += `
                <tr class="border-t border-slate-100">
                    <td class="p-4 text-sm text-slate-700">${prepContent(stmt)}</td>
                    <td class="p-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button class="font-medium text-xs py-1 px-3 rounded-full border border-slate-300 bg-white text-slate-600">Benar</button>
                            <button class="font-medium text-xs py-1 px-3 rounded-full border border-slate-300 bg-white text-slate-600">Salah</button>
                        </div>
                    </td>
                    <td class="p-3 text-center">
                        ${kunci
                            ? `<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${isBenar ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}">
                                <i class="fas ${isBenar ? 'fa-check' : 'fa-times'} text-[9px]"></i>${isBenar ? 'Benar' : 'Salah'}
                              </span>`
                            : `<span class="text-[10px] text-slate-400 italic">—</span>`
                        }
                    </td>
                </tr>`;
        });
        html += '</tbody></table></div>';

    } else if (type === 'JODOH' && Array.isArray(options)) {
        html += '<p class="text-sm text-center text-slate-500 italic mb-4">Siswa akan memasangkan item di sisi kiri dengan sisi kanan.</p>';
        html += `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="space-y-2 border-r pr-4">
                    ${options.map(p => `<div class="p-3 rounded-lg border bg-white text-sm text-center font-medium">${prepContent(p.q)}</div>`).join('')}
                </div>
                <div class="space-y-2">
                    ${options.map(p => `<div class="p-3 rounded-lg border bg-white text-sm text-center font-medium">${prepContent(p.a)}</div>`).join('')}
                </div>
            </div>`;
        // Kunci JODOH: tampilkan pasangan yang benar
        html += `
            <div class="rounded-xl border border-teal-200 bg-teal-50 overflow-hidden">
                <div class="px-4 py-2 bg-teal-100 border-b border-teal-200 flex items-center gap-2">
                    <i class="fas fa-link text-teal-500 text-xs"></i>
                    <span class="text-xs font-bold text-teal-700 uppercase tracking-wide">Kunci Pasangan</span>
                </div>
                <div class="divide-y divide-teal-100">
                    ${options.map((p, i) => `
                        <div class="px-4 py-2.5 flex items-center gap-3 text-sm">
                            <span class="w-5 h-5 flex items-center justify-center rounded-full bg-teal-200 text-teal-800 text-[10px] font-bold shrink-0">${i + 1}</span>
                            <span class="font-semibold text-teal-800 flex-1 min-w-0">${prepContent(p.q)}</span>
                            <i class="fas fa-arrow-right text-teal-400 text-xs shrink-0"></i>
                            <span class="font-semibold text-teal-800 flex-1 min-w-0 text-right">${prepContent(p.a)}</span>
                        </div>`).join('')}
                </div>
            </div>`;
    }

    html += `</div>`; // tutup px-5 konten

    // ── Footer strip: ringkasan kunci jawaban ────────────────────────────────
    let answerSummary = '';
    if (type === 'PG') {
        const k = String(q.key || '').trim().toUpperCase();
        answerSummary = k
            ? `<span class="font-bold text-emerald-800">Jawaban: ${k}</span>`
            : `<span class="text-amber-600 italic">Kunci belum diset</span>`;
    } else if (type === 'PG_KOMPLEKS') {
        let kArr = [];
        try { kArr = JSON.parse(q.key); } catch(e) { kArr = String(q.key||'').split(',').map(s=>s.trim()).filter(Boolean); }
        answerSummary = kArr.length
            ? `<span class="font-bold text-emerald-800">Jawaban: ${kArr.join(', ')}</span>`
            : `<span class="text-amber-600 italic">Kunci belum diset</span>`;
    } else if (type === 'BS') {
        let km = {};
        try { const p = JSON.parse(q.key); if(p && typeof p==='object') km=p; } catch(e){}
        const total = options.length;
        const vals  = Object.values(km).map(v => String(v).trim().toLowerCase());
        const benar = vals.filter(v => v === 'benar').length;
        const salah = vals.filter(v => v === 'salah').length;
        answerSummary = (benar + salah) > 0
            ? `<span class="font-bold text-emerald-800">${benar} Benar</span><span class="mx-1 text-slate-300">·</span><span class="font-bold text-rose-700">${salah} Salah</span><span class="text-slate-400 ml-1">dari ${total} pernyataan</span>`
            : `<span class="text-amber-600 italic">Kunci belum diset</span>`;
    } else if (type === 'JODOH') {
        answerSummary = `<span class="font-bold text-teal-700">${options.length} pasangan</span><span class="text-slate-400 ml-1">— dinilai otomatis</span>`;
    } else if (type === 'Esai') {
        const kws = String(q.key||'').trim();
        const kwCount = kws ? kws.split(',').filter(k=>k.trim()).length : 0;
        answerSummary = kwCount
            ? `<span class="font-bold text-violet-700">${kwCount} kata kunci</span><span class="text-slate-400 ml-1">— dinilai manual/AI</span>`
            : `<span class="text-slate-400 italic">Tidak ada kata kunci — dinilai manual</span>`;
    }

    html += `
        <div class="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border-t border-emerald-100 text-xs flex-wrap">
            <i class="fas fa-key text-emerald-500 text-[10px] shrink-0"></i>
            <span class="text-emerald-600 font-semibold uppercase tracking-wide text-[10px] shrink-0">Kunci:</span>
            ${answerSummary}
        </div>`;

    html += `</div>`; // tutup kartu
    return html;
}

function showQuestionPreview(qStr) {