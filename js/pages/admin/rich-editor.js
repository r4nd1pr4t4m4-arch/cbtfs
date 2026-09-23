/**
 * rich-editor.js — TinyMCE Rich Editor Init + Student Result Page
 * initRichEditor(), showStudentResultPage()
 * Sumber: index.html L39246-39714
 */

function initRichEditor() {
    if (tinymce.get('editor-content')) tinymce.remove('#editor-content');
    
    tinymce.init({
        selector: '#editor-content',
        height: 300,
        menubar: false,
        plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount',
        toolbar: 'undo redo | blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | folderimage',
        paste_data_images: true,
        smart_paste: true,
        images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blobInfo.blob());
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        }),
        setup: (editor) => {
            editor.ui.registry.addButton('folderimage', {
                icon: 'gallery',
                tooltip: 'Sisipkan dari Folder Gambar',
                onAction: () => openImgPickerForEditor(editor)
            });
        }
    });

    for(let i=0; i<6; i++) {
        const id = 'opt-' + i;
        if (tinymce.get(id)) tinymce.remove('#' + id);
        
        tinymce.init({
            selector: '#' + id,
            height: 150, 
            menubar: false,
            statusbar: false, 
            plugins: 'image charmap', 
            toolbar: 'bold italic | folderimage',
            paste_data_images: true,
            smart_paste: true,
            content_style: 'body { font-size: 12px; margin: 5px; }', 
            images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(blobInfo.blob());
                reader.onload = () => resolve(reader.result);
                reader.onerror = (error) => reject(error);
            }),
            setup: (editor) => {
                editor.ui.registry.addButton('folderimage', {
                    icon: 'gallery',
                    tooltip: 'Sisipkan dari Folder Gambar',
                    onAction: () => openImgPickerForEditor(editor)
                });
            }
        });
    }
}

// handleDownloadKartu ada di kartu-siswa.js (dengan _validateKartuConfig)

function showStudentResultPage(loginRes) {
  document.getElementById('result-exam-title').textContent = (loginRes.examData && loginRes.examData.subject) ? loginRes.examData.subject : 'Hasil Ujian';
  document.getElementById('result-student-id').textContent = loginRes.userID;
  document.getElementById('result-student-name').textContent = loginRes.username;

  // BUG FIX #3: Reset konten result-loading ke state awal (spinner) sebelum request,
  // mencegah tampilan error lama dari pemanggilan sebelumnya masih terlihat.
  const loadingEl = document.getElementById('result-loading');
  loadingEl.innerHTML = `
    <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-blue-500"></i>
    <p class="font-medium">Memuat detail jawaban...</p>`;
  loadingEl.classList.remove('hidden');

  document.getElementById('result-detail-container').classList.add('hidden');
  document.getElementById('result-score-label').innerHTML = '';
  document.getElementById('result-essay-note').textContent = '';
  // BUG FIX #4: Reset score circle ke state awal (–) agar nilai lama tidak tersisa
  const scoreCircle = document.getElementById('result-score-circle');
  scoreCircle.textContent = '–';
  scoreCircle.className = 'inline-flex items-center justify-center w-36 h-36 rounded-full bg-emerald-500 text-white text-5xl font-bold shadow-lg shadow-emerald-200 mb-4';

  switchPage('page-result');

  google.script.run
    .withSuccessHandler(function(res) {
      document.getElementById('result-loading').classList.add('hidden');

      if (!res || !res.success) {
        const msg = (res && res.message) ? res.message : 'Gagal memuat data hasil ujian.';
        document.getElementById('result-loading').innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-exclamation-circle text-4xl text-red-400 mb-3"></i>
            <p class="text-red-500 font-semibold">${msg}</p>
            <p class="text-sm text-slate-400 mt-2">Pastikan Anda sudah mengerjakan ujian ini sebelumnya.</p>
          </div>`;
        document.getElementById('result-loading').classList.remove('hidden');
        return;
      }

      const details = res.data || [];

      function formatJodohResultDisplay(pairs, studentMap, isKey = false) {
        if (!pairs || pairs.length === 0) return '<i class="text-slate-400">Data tidak valid.</i>';
        const realPairs = pairs.filter(p => p.q && String(p.q).trim() !== '');
        if (realPairs.length === 0) return '<i class="text-slate-400">Data tidak valid.</i>';
        let html = '<ul class="text-sm space-y-2">';
        realPairs.forEach(pair => {
          const left         = pair.q;
          const correctRight = pair.a;
          const leftHtml         = prepContent(left)         || left         || '';
          const correctRightHtml = prepContent(correctRight) || correctRight || '';
          if (isKey) {
            html += `<li class="flex items-start gap-2"><span class="font-medium w-2/5">${leftHtml}</span> <i class="fas fa-long-arrow-alt-right mx-1 text-slate-300"></i> <span>${correctRightHtml}</span></li>`;
          } else {
            const studentChoice = studentMap ? studentMap[left] : undefined;
            const isMatch = studentChoice && String(studentChoice).trim().toLowerCase() === String(correctRight).trim().toLowerCase();
            const icon = isMatch ? '<i class="fas fa-check-circle text-emerald-500 ml-2"></i>' : '<i class="fas fa-times-circle text-red-500 ml-2"></i>';
            const displayChoiceHtml = studentChoice
              ? (prepContent(studentChoice) || studentChoice)
              : '<i class="text-slate-400">(Kosong)</i>';
            html += `<li class="flex items-start gap-2 ${isMatch ? '' : 'text-red-600'}"><span class="font-medium w-2/5">${leftHtml}</span> <i class="fas fa-long-arrow-alt-right mx-1 text-slate-300"></i> <span>${displayChoiceHtml}</span> ${icon}</li>`;
          }
        });
        html += '</ul>';
        return html;
      }

      let benarCount = 0, salahCount = 0, esaiDinilai = 0, esaiPending = 0;

      const rows = details.map(item => {
        const isEsai = item.type === 'Esai';
        const statusUpper = (item.status || '').toUpperCase();
        let isBenar = false;
        let isSebagian = false;

        if (item.type === 'JODOH' && item.pairs && item.pairs.length > 0) {
          const studentMap = item.rawStudentAns || {};
          const realPairs = item.pairs.filter(p => p.q && String(p.q).trim() !== '');
          let matchCount = 0;
          realPairs.forEach(pair => {
            const stu = studentMap[pair.q];
            if (stu && String(stu).trim().toLowerCase() === String(pair.a).trim().toLowerCase()) matchCount++;
          });
          isBenar = realPairs.length > 0 && matchCount === realPairs.length;
          isSebagian = matchCount > 0 && matchCount < realPairs.length;
          if (!isEsai) {
            if (isBenar) benarCount++;
            else if (isSebagian) salahCount++; 
            else salahCount++;
          }
        } else if (!isEsai) {
          // BUG FIX #7: isSebagian tidak pernah diset untuk soal non-JODOH (misalnya BS yang sebagian benar).
          // Periksa status dari backend untuk menentukan isBenar dan isSebagian dengan benar.
          isBenar = (statusUpper === 'BENAR' || statusUpper.includes('CORRECT'));
          isSebagian = statusUpper.startsWith('BENAR SEBAGIAN');
          if (isBenar) benarCount++;
          else salahCount++;
        }

        const isEsaiDone = isEsai && statusUpper.startsWith('DINILAI');
        const isEsaiPending = isEsai && statusUpper === 'MENUNGGU KOREKSI';
        if (isEsaiDone) esaiDinilai++;
        if (isEsaiPending) esaiPending++;

        let statusBadge;
        if (isEsaiDone) {
          const earnedPoin = item.point !== undefined ? item.point : 0;
          statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                           <i class="fas fa-check-circle mr-1"></i>Dinilai (${earnedPoin})
                         </span>`;
        } else if (isEsaiPending) {
          statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                           <i class="fas fa-clock mr-1"></i>Menunggu
                         </span>`;
        } else if (item.type === 'JODOH') {
          if (isBenar) {
            statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                             <i class="fas fa-check mr-1"></i>Benar
                           </span>`;
          } else if (isSebagian) {
            statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                             <i class="fas fa-adjust mr-1"></i>Sebagian
                           </span>`;
          } else {
            statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                             <i class="fas fa-times mr-1"></i>Salah
                           </span>`;
          }
        } else if (isBenar) {
          statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                           <i class="fas fa-check mr-1"></i>Benar
                         </span>`;
        } else if (statusUpper.startsWith('BENAR SEBAGIAN')) {
          statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                           <i class="fas fa-adjust mr-1"></i>Sebagian
                         </span>`;
        } else {
          statusBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                           <i class="fas fa-times mr-1"></i>Salah
                         </span>`;
        }

        let answerDisplay, keyDisplay;
        if (item.type === 'JODOH') {
          const rawAnsJodoh = (function() {
            var raw = item.rawStudentAns;
            if (!raw) return {};
            if (typeof raw === 'string') {
              try { return JSON.parse(raw); } catch(e) { return {}; }
            }
            if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
            return {};
          })();
          if (item.pairs && item.pairs.length > 0) {
            answerDisplay = formatJodohResultDisplay(item.pairs, rawAnsJodoh, false);
            keyDisplay = formatJodohResultDisplay(item.pairs, null, true);
          } else {
            answerDisplay = (item.answer !== undefined && item.answer !== null && item.answer !== '')
              ? '<span class="font-medium">' + item.answer + '</span>'
              : '<span class="text-slate-300 italic text-xs">tidak dijawab</span>';
            keyDisplay = '<span class="text-slate-300 italic text-xs">-</span>';
          }
        } else if (item.type === 'BS') {
          let rawBsAns = item.answer;
          if (typeof rawBsAns === 'string') {
            try { rawBsAns = JSON.parse(rawBsAns); } catch(e) {}
          }
          if (rawBsAns && typeof rawBsAns === 'object' && !Array.isArray(rawBsAns)) {
            const bsEntries = Object.entries(rawBsAns);
            // BUG FIX #5: parseInt(k)+1 menghasilkan NaN jika key adalah teks pernyataan.
            // Gunakan index iterasi sebagai nomor urut pernyataan, bukan parseInt dari key.
            // BUG FIX #10: Urutkan entry berdasarkan index numerik (jika ada) agar tampil berurutan.
            const sortedEntries = bsEntries.slice().sort(function(a, b) {
              var na = parseInt(a[0], 10), nb = parseInt(b[0], 10);
              if (!isNaN(na) && !isNaN(nb)) return na - nb;
              return 0;
            });
            answerDisplay = sortedEntries.length > 0
              ? sortedEntries.map(function([k, v], idx) {
                  var color = (String(v).toLowerCase() === 'benar') ? 'text-emerald-600' : 'text-red-600';
                  var num = isNaN(parseInt(k)) ? (idx + 1) : (parseInt(k) + 1);
                  return '<span class="inline-flex items-center gap-1 text-xs">'
                    + '<span class="font-medium text-slate-500">P' + num + ':</span> '
                    + '<strong class="' + color + '">' + v + '</strong>'
                    + '</span>';
                }).join(' &nbsp;|&nbsp; ')
              : '<span class="text-slate-300 italic text-xs">tidak dijawab</span>';
          } else if (rawBsAns !== undefined && rawBsAns !== null && rawBsAns !== '') {
            answerDisplay = String(rawBsAns);
          } else {
            answerDisplay = '<span class="text-slate-300 italic text-xs">tidak dijawab</span>';
          }
          let rawBsKey = item.key;
          if (rawBsKey && typeof rawBsKey === 'string') {
            try {
              var parsedKey = JSON.parse(rawBsKey);
              if (parsedKey && typeof parsedKey === 'object') {
                // BUG FIX #5b: Sama seperti di atas, gunakan index iterasi sebagai nomor urut
                // agar tidak menghasilkan NaN ketika key adalah teks pernyataan.
                keyDisplay = Object.entries(parsedKey).map(function([k, v], idx) {
                  var color = (String(v).toLowerCase() === 'benar') ? 'text-emerald-600' : 'text-red-600';
                  var num = isNaN(parseInt(k)) ? (idx + 1) : (parseInt(k) + 1);
                  return '<span class="text-xs"><span class="font-medium text-slate-500">P' + num + ':</span> <strong class="' + color + '">' + v + '</strong></span>';
                }).join(' &nbsp;|&nbsp; ');
              } else {
                keyDisplay = rawBsKey;
              }
            } catch(e) {
              keyDisplay = rawBsKey || '<span class="text-slate-300 italic text-xs">-</span>';
            }
          } else {
            keyDisplay = (item.key && item.key !== '') ? item.key : '<span class="text-slate-300 italic text-xs">-</span>';
          }
        } else {
          // BUG FIX #13: escape HTML di answerDisplay & keyDisplay untuk tipe PG/Esai
          // agar karakter seperti < > " dari jawaban siswa tidak merusak markup.
          function _esc(s) {
            return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
          }
          answerDisplay = (item.answer !== undefined && item.answer !== null && item.answer !== '')
            ? _esc(String(item.answer))
            : '<span class="text-slate-300 italic text-xs">tidak dijawab</span>';
          keyDisplay = (item.key && item.key !== '')
            ? _esc(String(item.key))
            : '<span class="text-slate-300 italic text-xs">-</span>';
        }

        // BUG FIX #6: rowBg untuk soal JODOH (isSebagian) dan BS tidak ditangani dengan benar.
        // Tambahkan kondisi untuk status "sebagian benar" agar warna baris kuning, bukan merah.
        const rowBg = isEsai
          ? (isEsaiDone ? 'bg-blue-50/20' : 'bg-amber-50/20')
          : (isBenar ? 'bg-green-50/30' : (isSebagian ? 'bg-amber-50/20' : 'bg-red-50/20'));

        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50 transition ${rowBg}">
            <td class="py-3 px-4 text-center text-slate-400 font-bold text-sm">${item.no}</td>
            <td class="py-3 px-4">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                ${item.type}
              </span>
            </td>
            <td class="py-3 px-4 text-slate-700 text-sm max-w-xs">
              <div class="math-content" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
                ${prepContent(item.question) || '-'}
              </div>
            </td>
            <td class="py-3 px-4 text-slate-600 text-sm">${answerDisplay}</td>
            <td class="py-3 px-4 text-slate-500 text-sm font-medium">${keyDisplay}</td>
            <td class="py-3 px-4 text-center">${statusBadge}</td>
            <td class="py-3 px-4 text-center font-bold text-slate-700">${item.point}</td>
          </tr>`;
      }).join('');

      const tbody = document.getElementById('result-table-body');
      tbody.innerHTML = rows || '<tr><td colspan="7" class="text-center py-8 text-slate-400">Tidak ada data soal.</td></tr>';

      const score = Number(res.finalScore) || 0;
      const scoreEl = document.getElementById('result-score-circle');
      scoreEl.textContent = formatScore(score);
      scoreEl.classList.remove('bg-emerald-500','shadow-emerald-200','bg-yellow-500','shadow-yellow-200','bg-red-500','shadow-red-200');
      const labelEl = document.getElementById('result-score-label');
      const _passingGrade = (res.passingGrade && res.passingGrade > 0) ? res.passingGrade : 75;
      if (score >= _passingGrade) {
        scoreEl.classList.add('bg-emerald-500','shadow-emerald-200');
        labelEl.innerHTML = `<span class="text-emerald-600 font-bold text-lg">✅ LULUS</span><span class="text-xs text-slate-400 ml-2">(KKM: ${_passingGrade})</span>`;
      } else if (score >= _passingGrade * 0.80) {
        scoreEl.classList.add('bg-yellow-500','shadow-yellow-200');
        labelEl.innerHTML = `<span class="text-yellow-600 font-bold text-lg">⚠️ TIDAK LULUS</span><span class="text-xs text-slate-400 ml-2">(KKM: ${_passingGrade}, kurang ${(_passingGrade-score).toFixed(1)} poin)</span>`;
      } else {
        scoreEl.classList.add('bg-red-500','shadow-red-200');
        labelEl.innerHTML = `<span class="text-red-500 font-bold text-lg">❌ TIDAK LULUS</span><span class="text-xs text-slate-400 ml-2">(KKM: ${_passingGrade}, kurang ${(_passingGrade-score).toFixed(1)} poin)</span>`;
      }

      const noteEl = document.getElementById('result-essay-note');
      if (esaiPending > 0) {
        noteEl.textContent = 'ℹ️ Soal esai belum dikoreksi guru — nilai mungkin berubah setelah koreksi.';
        noteEl.className = 'mt-3 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block';
      } else if (esaiDinilai > 0) {
        noteEl.textContent = '✅ Semua soal esai sudah dikoreksi guru.';
        noteEl.className = 'mt-3 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 inline-block';
      } else {
        noteEl.textContent = '';
        noteEl.className = '';
      }

      let statsHtml = `
        <span class="text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
          <i class="fas fa-check mr-1"></i>Benar: ${benarCount}
        </span>
        <span class="text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
          <i class="fas fa-times mr-1"></i>Salah: ${salahCount}
        </span>`;
      if (esaiDinilai > 0) {
        statsHtml += `<span class="text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <i class="fas fa-pen mr-1"></i>Esai dinilai: ${esaiDinilai}
                      </span>`;
      }
      if (esaiPending > 0) {
        statsHtml += `<span class="text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        <i class="fas fa-clock mr-1"></i>Esai pending: ${esaiPending}
                      </span>`;
      }
      document.getElementById('result-stats-row').innerHTML = statsHtml;

      // BUG FIX #9: renderMath dipindah ke sini (setelah container menjadi visible)
      // agar MathJax dapat merender konten dengan benar pada elemen yang terlihat.
      document.getElementById('result-detail-container').classList.remove('hidden');
      renderMath(tbody);
    })
    .withFailureHandler(function(err) {
      document.getElementById('result-loading').innerHTML =
        `<p class="text-red-500 text-center p-8 font-medium">
           <i class="fas fa-exclamation-triangle mr-2"></i>
           Gagal terhubung ke server: ${err.message || err}
         </p>`;
      document.getElementById('result-loading').classList.remove('hidden');
    })
    .getMyExamResult(loginRes.responseId, loginRes.userID, loginRes.token);
  }
    function renderKartuSiswaPage(container) {
      window._kartuSelected  = new Set();
      window._kartuPage      = 1;
      window._kartuPerPage   = 10;
      container.innerHTML = `
        <div class="fade-in w-full space-y-4">
          <div class="dash-card p-6">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
              <div>
                <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <i class="fas fa-id-card text-emerald-600"></i> Kartu Ujian Siswa
                </h2>
                <p class="text-sm text-slate-500 mt-1">Cetak kartu ujian siswa yang Anda ajar.</p>
              </div>
              <button id="btn-kartu-massal" onclick="handleKartuMassal()"
                class="hidden items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg transition transform active:scale-95">
                <i class="fas fa-file-archive"></i> Cetak Massal
                <span id="kartu-massal-count" class="ml-1 bg-white text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">0</span>
              </button>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-center gap-3">
              <div class="flex items-center gap-2 text-sm text-slate-600">
                <span>Show</span>
                <select onchange="changeKartuPerPage(this.value)" class="border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 bg-white cursor-pointer">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="all">Semua</option>
                </select>
                <span>entries</span>
              </div>
              <div class="relative w-full md:w-72">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><i class="fas fa-search"></i></span>
                <input type="text" id="kartu-search" placeholder="Cari nama, ID, atau kelas..." oninput="filterKartuTable(this.value)"
                  class="pl-9 w-full border border-slate-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition shadow-sm">
              </div>
            </div>
          </div>
          <div id="kartu-table-wrapper" class="dash-card border border-slate-200 overflow-hidden min-h-[300px]">
            <div class="flex flex-col items-center justify-center h-64 text-slate-400">
              <i class="fas fa-circle-notch fa-spin text-3xl mb-3 text-emerald-500"></i>
              <p>Memuat data siswa...</p>
            </div>
          </div>
          <div id="kartu-pagination" class="hidden dash-card p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div class="text-slate-500 font-medium" id="kartu-pagination-info">Menampilkan 0 data</div>
            <div class="flex gap-2">
              <button onclick="changeKartuPage('prev')" id="btn-kartu-prev"
                class="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-slate-600">
                Sebelumnya
              </button>
              <button onclick="changeKartuPage('next')" id="btn-kartu-next"
                class="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-slate-600">
                Selanjutnya
              </button>
            </div>
          </div>
        </div>`;
      google.script.run
        .withSuccessHandler(siswa => {
          window._kartuSiswaData     = siswa || [];
          window._kartuFilteredData  = siswa || [];
          window._kartuPage          = 1;
          renderKartuTable();
        })
        .withFailureHandler(err => {
          document.getElementById('kartu-table-wrapper').innerHTML =
            `<div class="p-10 text-center text-red-500"><i class="fas fa-exclamation-triangle text-3xl mb-2"></i><p>${err.message}</p></div>`;
        })
        .getSiswaForGuru(currentUser.userID, currentUser.token);
    }
