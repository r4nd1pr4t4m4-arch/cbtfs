/**
 * item-analysis.js — Analisis Butir Soal
 * renderItemAnalysis() + semua sub-tab: PG, PGK, BS, JODOH, Esai
 * Sumber: index.html L40908-45327
 */

function renderItemAnalysis(container) {
  container.innerHTML = `
    <div class="ia-page fade-in">

      <!-- ── Header ── -->
      <div class="ia-header">
        <div>
          <h2><i class="fas fa-microscope"></i>Analisis Butir Soal &amp; Laporan</h2>
          <p>Tingkat kesukaran · Daya beda · Penilaian esai · Laporan siswa · Rekap kelas</p>
        </div>
      </div>

      <!-- ── Legend ── -->
      <div class="ia-legend">
        <div class="ia-legend-row">
          <b><i class="fas fa-gauge-high mr-1 text-purple-500"></i>Tingkat Kesukaran (P)</b>
          <span class="text-emerald-600 font-semibold">🟢 P &gt; 0.70 Mudah</span> ·
          <span class="text-amber-600 font-semibold">🟡 0.30–0.70 Sedang</span> ·
          <span class="text-red-600 font-semibold">🔴 P &lt; 0.30 Sukar</span>
        </div>
        <div class="ia-legend-row">
          <b><i class="fas fa-chart-line mr-1 text-purple-500"></i>Daya Beda (D)</b>
          <span class="text-emerald-600 font-semibold">💎 ≥0.40 Sangat Baik</span> ·
          <span class="text-green-600 font-semibold">🟢 0.30–0.39 Baik</span> ·
          <span class="text-amber-600 font-semibold">🟡 0.20–0.29 Cukup</span> ·
          <span class="text-red-600 font-semibold">🔴 &lt;0.20 Jelek</span>
        </div>
      </div>

      <!-- ── Exam selector ── -->
      <div class="ia-exam-row">
        <div style="flex:1;">
          <label for="ia-exam-select"><i class="fas fa-book-open"></i>Mata Pelajaran / Ujian</label>
          <select id="ia-exam-select" onchange="onIAExamChange(this.value)">
            <option value="">— Pilih ujian untuk memulai analisis —</option>
          </select>
        </div>
      </div>

      <!-- ── Main card ── -->
      <div class="ia-card">
        <!-- Tabs -->
        <div class="ia-tabs-wrap">
          <div class="ia-tabs" id="ia-sub-tabs" role="tablist" aria-label="Jenis analisis">
            <button id="ia-tab-pg"            onclick="switchIATab('pg')"            class="ia-sub-tab active" role="tab" aria-selected="true"  tabindex="0"><i class="fas fa-list-ol"></i>PG</button>
            <button id="ia-tab-pgk"           onclick="switchIATab('pgk')"           class="ia-sub-tab"        role="tab" aria-selected="false" tabindex="-1"><i class="fas fa-list-check"></i>PG Kompleks</button>
            <button id="ia-tab-bs"            onclick="switchIATab('bs')"            class="ia-sub-tab"        role="tab" aria-selected="false" tabindex="-1"><i class="fas fa-check-double"></i>Benar/Salah</button>
            <button id="ia-tab-jodoh"         onclick="switchIATab('jodoh')"         class="ia-sub-tab"        role="tab" aria-selected="false" tabindex="-1"><i class="fas fa-link"></i>Menjodohkan</button>
            <button id="ia-tab-esai"          onclick="switchIATab('esai')"          class="ia-sub-tab"        role="tab" aria-selected="false" tabindex="-1"><i class="fas fa-pen-nib"></i>Esai</button>
            <button id="ia-tab-laporan-siswa" onclick="switchIATab('laporan-siswa')" class="ia-sub-tab"        role="tab" aria-selected="false" tabindex="-1"><i class="fas fa-user-graduate"></i>Laporan Siswa</button>
            <button id="ia-tab-rekap-kelas"   onclick="switchIATab('rekap-kelas')"   class="ia-sub-tab"        role="tab" aria-selected="false" tabindex="-1"><i class="fas fa-chart-bar"></i>Rekap Kelas</button>
          </div>
        </div>

        <div class="ia-card-body">

          <!-- Panel PG -->
          <div id="ia-panel-pg" role="tabpanel">
            <button onclick="loadItemAnalysis()" class="ia-run-btn ia-run-btn-pg mb-5" aria-label="Jalankan analisis pilihan ganda">
              <i class="fas fa-calculator"></i>Jalankan Analisis PG
            </button>
            <div id="ia-result">
              <div class="ia-empty-state">
                <i class="fas fa-chart-bar"></i>
                <p>Belum ada data analisis PG</p>
                <small>Pilih ujian lalu klik tombol di atas</small>
              </div>
            </div>
          </div>

          <!-- Panel PGK -->
          <div id="ia-panel-pgk" class="hidden" role="tabpanel">
            <div class="ia-note indigo mb-5">
              <i class="fas fa-info-circle"></i>
              <div><b>Catatan PG Kompleks:</b> Formula P dan D sama dengan PG biasa. Karena PG Kompleks menuntut siswa memilih lebih dari satu jawaban benar, nilai P cenderung lebih rendah dan kolom terakhir menampilkan kunci jawaban, bukan distribusi opsi.</div>
            </div>
            <button onclick="loadPGKAnalysis()" class="ia-run-btn ia-run-btn-pgk mb-5" aria-label="Jalankan analisis PG Kompleks">
              <i class="fas fa-calculator"></i>Jalankan Analisis PG Kompleks
            </button>
            <div id="pgk-result">
              <div class="ia-empty-state">
                <i class="fas fa-list-check"></i>
                <p>Belum ada data analisis PG Kompleks</p>
                <small>Pilih ujian lalu klik tombol di atas</small>
              </div>
            </div>
          </div>

          <!-- Panel BS -->
          <div id="ia-panel-bs" class="hidden" role="tabpanel">
            <button onclick="loadBSAnalysis()" class="ia-run-btn ia-run-btn-bs mb-5" aria-label="Jalankan analisis benar salah">
              <i class="fas fa-flask"></i>Jalankan Analisis Benar/Salah
            </button>
            <div id="bs-result">
              <div class="ia-empty-state">
                <i class="fas fa-check-double"></i>
                <p>Belum ada data analisis Benar/Salah</p>
                <small>Pilih ujian lalu klik tombol di atas</small>
              </div>
            </div>
          </div>

          <!-- Panel JODOH -->
          <div id="ia-panel-jodoh" class="hidden" role="tabpanel">
            <button onclick="loadJODOHAnalysis()" class="ia-run-btn ia-run-btn-jodoh mb-5" aria-label="Jalankan analisis menjodohkan">
              <i class="fas fa-project-diagram"></i>Jalankan Analisis Menjodohkan
            </button>
            <div id="jodoh-result">
              <div class="ia-empty-state">
                <i class="fas fa-link"></i>
                <p>Belum ada data analisis Menjodohkan</p>
                <small>Pilih ujian lalu klik tombol di atas</small>
              </div>
            </div>
          </div>

          <!-- Panel Esai -->
          <div id="ia-panel-esai" class="hidden" role="tabpanel">
            <button onclick="loadEssayAnalysis()" class="ia-run-btn ia-run-btn-esai mb-5" aria-label="Muat data penilaian esai">
              <i class="fas fa-pen-nib"></i>Muat Data Penilaian Esai
            </button>
            <div id="esai-result">
              <div class="ia-empty-state">
                <i class="fas fa-pen-nib"></i>
                <p>Belum ada data esai dimuat</p>
                <small>Pilih ujian lalu klik tombol di atas</small>
              </div>
            </div>
          </div>

          <!-- Panel Laporan Siswa -->
          <div id="ia-panel-laporan-siswa" class="hidden" role="tabpanel">
            <div id="laporan-siswa-result">
              <div class="ia-note">
                <i class="fas fa-arrow-up"></i>
                <div><b>Pilih ujian dari dropdown di atas</b>, kemudian pilih nama siswa untuk melihat laporan lengkapnya.</div>
              </div>
            </div>
          </div>

          <!-- Panel Rekap Kelas -->
          <div id="ia-panel-rekap-kelas" class="hidden" role="tabpanel">
            <button onclick="loadClassSummary()" class="ia-run-btn ia-run-btn-rekap mb-5" aria-label="Tampilkan rekap kelas">
              <i class="fas fa-chart-bar"></i>Tampilkan Rekap Kelas
            </button>
            <div id="rekap-kelas-result">
              <div class="ia-empty-state">
                <i class="fas fa-school"></i>
                <p>Belum ada rekap kelas</p>
                <small>Pilih ujian lalu klik tombol di atas</small>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`;

  google.script.run
    .withSuccessHandler(function(exams) {
      const sel = document.getElementById('ia-exam-select');
      if (!sel) return;
      // Clear existing options first (except placeholder)
      while (sel.options.length > 1) sel.remove(1);
      (Array.isArray(exams) ? exams : []).forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        const subj = String(e.subject || '');
        const cls  = String(e.class || '');
        const date = String(e.dateStr || '-');
        opt.textContent = `${subj} – ${cls} (${date})`;
        sel.appendChild(opt);
      });
      if (sel.options.length === 1) {
        // No exams available
        const opt = document.createElement('option');
        opt.value = '';
        opt.disabled = true;
        opt.textContent = 'Belum ada ujian tersedia';
        sel.appendChild(opt);
      }
    })
    .withFailureHandler(function(err) {
      Swal.fire({
        title:'Gagal Memuat Daftar Ujian',
        html:`<p style="font-size:12px;color:#475569;font-family:monospace;">${(err && err.message) || err}</p>`,
        icon:'error', confirmButtonColor:'#dc2626',
        customClass:{ popup:'lp-swal' }
      });
    })
    .getExamList(currentUser.userID, currentUser.token);
}


function switchIATab(tab) {
  const ids = ['pg', 'pgk', 'bs', 'jodoh', 'esai', 'laporan-siswa', 'rekap-kelas'];
  ids.forEach(key => {
    const panel = document.getElementById('ia-panel-' + key);
    const btn   = document.getElementById('ia-tab-' + key);
    if (!panel || !btn) return;
    if (key === tab) {
      panel.classList.remove('hidden');
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      panel.classList.add('hidden');
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    }
  });
}

// Shared helper: warn if no exam selected
function _iaWarnNoExam() {
  Swal.fire({
    title:'Pilih Ujian Dulu',
    html:'<p style="font-size:13px;color:#475569;">Silakan pilih ujian dari dropdown di atas terlebih dahulu.</p>',
    icon:'info',
    confirmButtonColor:'#7e22ce',
    customClass:{ popup:'lp-swal' }
  });
}

function onIAExamChange(examID) {
  // Bug 4 fix: clear ALL panel results and ALL cached window state when exam changes
  const _clearEl = function(id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = '';
  };
  _clearEl('laporan-siswa-result');
  _clearEl('ia-result');
  _clearEl('pgk-result');
  _clearEl('bs-result');
  _clearEl('jodoh-result');
  _clearEl('esai-result');
  _clearEl('rekap-kelas-result');

  // Reset all cached data for each analysis type
  window._iaStudentList     = [];
  window._studentReportData = null;
  window._iaFilteredData    = null;
  window._iaResForExport    = null;
  window._pgkFilteredData   = null;
  window._pgkResForExport   = null;
  window._bsAnalysisData    = null;
  window._jodohAnalysisData = null;
  window._classSummaryData  = null;
  window._essayState        = { data: null, grades: {}, aiReasons: {}, aiPending: new Set() };
  window._iaEssayAnswerMap  = {};

  if (examID) {
    // Rebuild the student dropdown / placeholder in the Laporan Siswa panel
    const lsPanel = document.getElementById('laporan-siswa-result');
    if (lsPanel) {
      lsPanel.innerHTML = `
        <div class="ia-note">
          <i class="fas fa-circle-notch fa-spin text-blue-400"></i>
          <div>Memuat daftar siswa untuk ujian ini...</div>
        </div>`;
    }
    loadStudentDropdown(examID);
  } else {
    const lsPanel = document.getElementById('laporan-siswa-result');
    if (lsPanel) {
      lsPanel.innerHTML = `
        <div class="ia-note">
          <i class="fas fa-arrow-up"></i>
          <div><b>Pilih ujian dari dropdown di atas</b>, lalu pilih nama siswa untuk melihat laporan lengkapnya.</div>
        </div>`;
    }
  }
}

function loadStudentDropdown(examID) {
  const container = document.getElementById('laporan-siswa-result');
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center gap-2 mb-4">
      <div class="flex-1">
        <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pilih Siswa</label>
        <select id="ia-student-select"
          class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
          onchange="loadStudentReport(this.value)">
          <option value="">-- Pilih Siswa --</option>
        </select>
      </div>
      <div class="flex-shrink-0 mt-5 flex gap-2">
        <button onclick="openBulkPrintModal()"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg shadow-sm transition" id="btn-bulk-print-student" style="display:none">
          <i class="fas fa-print"></i> Cetak Banyak
        </button>
        <button onclick="printStudentReport()"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-lg shadow transition" id="btn-print-student-report" style="display:none">
          <i class="fas fa-print"></i> Cetak
        </button>
      </div>
    </div>
    <div id="student-report-body">
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center text-blue-500 text-sm">
        <i class="fas fa-user-graduate text-2xl mb-2 block"></i>
        Pilih siswa dari dropdown untuk melihat laporan detail.
      </div>
    </div>`;

  google.script.run
    .withSuccessHandler(function(results) {
      const sel = document.getElementById('ia-student-select');
      if (!sel) return;
      window._iaStudentList = [];
      (results || []).forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.responseId;
        opt.textContent = `${r.name} (${r.class}) — ${typeof r.score === 'number' ? r.score.toFixed(1) : r.score}`;
        sel.appendChild(opt);
        window._iaStudentList.push({
          responseId:  r.responseId,
          name:        r.name,
          class:       r.class,
          score:       typeof r.score === 'number' ? r.score.toFixed(1) : String(r.score || '-'),
          passed:      r.passingStatus === 'Lulus' || (typeof r.score === 'number' && r.score >= (r.passingGrade || 0)),
          startTime:   r.startTime || '-'
        });
      });
      if (window._iaStudentList.length > 0) {
        const bulkBtn = document.getElementById('btn-bulk-print-student');
        if (bulkBtn) bulkBtn.style.display = 'flex';
      }
    })
    .withFailureHandler(function(err) {
      // Bug 3 fix: was empty — now shows error so teacher knows why student list failed
      const sel = document.getElementById('ia-student-select');
      if (sel) {
        const errOpt = document.createElement('option');
        errOpt.value = '';
        errOpt.disabled = true;
        errOpt.textContent = '⚠ Gagal memuat daftar siswa';
        sel.appendChild(errOpt);
      }
      Swal.fire({
        icon: 'error', title: 'Gagal Memuat Siswa',
        html: '<p style="font-size:12px;color:#475569;">' + ((err && err.message) || String(err)) + '</p>',
        confirmButtonColor: '#dc2626',
        customClass: { popup: 'lp-swal' }
      });
    })
    .getExamResults(examID, currentUser.userID, currentUser.token);
}


function loadStudentReport(responseId) {
  if (!responseId) return;
  const examID  = document.getElementById('ia-exam-select')?.value;
  const body    = document.getElementById('student-report-body');
  const printBtn = document.getElementById('btn-print-student-report');
  if (!body || !examID) return;
  if (printBtn) printBtn.style.display = 'none';

  body.innerHTML = `
    <div class="ia-loading">
      <i class="fas fa-circle-notch fa-spin text-blue-500 text-2xl"></i>
      <span>Memuat laporan siswa...</span>
    </div>`;

  google.script.run
    .withSuccessHandler(function(res) {
      if (!res || !res.success) {
        body.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Gagal memuat laporan.</b> ${res?.message || 'Terjadi kesalahan.'}</div></div>`;
        return;
      }
      window._studentReportData = res;
      body.innerHTML = buildStudentReportHTML(res);
      renderMath(body); 
      if (printBtn) printBtn.style.display = 'flex';
    })
    .withFailureHandler(err => {
      body.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Error:</b> ${err.message || String(err)}</div></div>`;
    })
    .getStudentDetailReport(examID, responseId, currentUser.userID, currentUser.token);
}


function buildStudentReportHTML(res) {
  const { student, session, examInfo, typeStats, wrongQuestions, unanswered, recommendations, totalQuestions, totalCorrect, totalWrong, totalUnanswered } = res;

  const passedBg  = session.passed
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-red-50 border-red-200 text-red-700';
  const passedLabel = session.passed ? '✓ LULUS' : '✗ TIDAK LULUS';

  const scoreCard = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div class="col-span-2 md:col-span-1 rounded-xl border-2 ${passedBg} p-4 text-center">
        <div class="text-4xl font-black">${session.totalScore}</div>
        <div class="text-xs font-bold uppercase mt-1">${passedLabel}</div>
        <div class="text-[10px] mt-0.5 opacity-75">KKM: ${session.passingGrade}</div>
      </div>
      <div class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
        <div class="text-3xl font-black text-blue-700">${totalCorrect}</div>
        <div class="text-xs font-semibold text-blue-500 mt-0.5">Benar / ${totalQuestions} Soal</div>
      </div>
      <div class="rounded-xl border ${totalWrong > 0 ? 'border-orange-100 bg-orange-50' : 'border-emerald-100 bg-emerald-50'} p-4 text-center">
        <div class="text-3xl font-black ${totalWrong > 0 ? 'text-orange-600' : 'text-emerald-600'}">${totalWrong}</div>
        <div class="text-xs font-semibold ${totalWrong > 0 ? 'text-orange-500' : 'text-emerald-500'} mt-0.5">Jawaban Salah</div>
      </div>
      <div class="rounded-xl border ${totalUnanswered > 0 ? 'border-slate-200 bg-slate-50' : 'border-emerald-100 bg-emerald-50'} p-4 text-center">
        <div class="text-3xl font-black ${totalUnanswered > 0 ? 'text-slate-500' : 'text-emerald-600'}">${totalUnanswered}</div>
        <div class="text-xs font-semibold ${totalUnanswered > 0 ? 'text-slate-400' : 'text-emerald-500'} mt-0.5">Tidak Dijawab</div>
      </div>
    </div>`;

  const sessionInfo = `
    <div class="flex flex-wrap gap-3 mb-5 text-xs text-slate-500">
      <span class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
        <i class="fas fa-clock mr-1"></i>Mulai: ${session.startTime}
      </span>
      <span class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
        <i class="fas fa-flag-checkered mr-1"></i>Selesai: ${session.submitTime}
      </span>
      <span class="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
        <i class="fas fa-stopwatch mr-1"></i>Durasi: ${session.durasiMenit}
      </span>
    </div>`;

  const typeOrder = ['PG','PG_KOMPLEKS','BS','JODOH','Esai'];
  const typeColors = {
    PG: 'bg-blue-500', PG_KOMPLEKS: 'bg-indigo-500',
    BS: 'bg-teal-500', JODOH: 'bg-purple-500', Esai: 'bg-rose-500'
  };
  const typeBarsHTML = typeOrder
    .filter(t => typeStats[t])
    .map(t => {
      const st = typeStats[t];
      const color = typeColors[t] || 'bg-slate-400';
      const pctColor = st.pct >= 75 ? 'text-emerald-600' : st.pct >= 50 ? 'text-yellow-600' : 'text-red-600';
      return `
        <div class="mb-3">
          <div class="flex justify-between text-xs mb-1">
            <span class="font-semibold text-slate-600">${st.label}</span>
            <span class="font-black ${pctColor}">${st.pct}% &nbsp;·&nbsp; ${st.earnedPoints}/${st.maxPoints} poin &nbsp;·&nbsp; ${st.correct}/${st.total} benar</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div class="${color} h-3 rounded-full transition-all" style="width:${st.pct}%"></div>
          </div>
        </div>`;
    }).join('');

  const typeBreakdown = `
    <div class="rounded-xl border border-slate-200 p-4 mb-5">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
        <i class="fas fa-layer-group mr-1.5"></i>Breakdown per Tipe Soal
      </p>
      ${typeBarsHTML || '<p class="text-xs text-slate-400 text-center py-3">Tidak ada data tipe soal.</p>'}
    </div>`;

  var TYPE_ORDER  = ['PG','PG_KOMPLEKS','BS','JODOH','Esai'];
  var TYPE_LABELS = { PG:'Pilihan Ganda (PG)', PG_KOMPLEKS:'PG Kompleks (PGK)', BS:'Benar/Salah (B/S)', JODOH:'Menjodohkan', Esai:'Esai' };
  var TYPE_COLORS = {
    PG:         'bg-blue-100 text-blue-700 border-blue-200',
    PG_KOMPLEKS:'bg-indigo-100 text-indigo-700 border-indigo-200',
    BS:         'bg-teal-100 text-teal-700 border-teal-200',
    JODOH:      'bg-purple-100 text-purple-700 border-purple-200',
    Esai:       'bg-rose-100 text-rose-700 border-rose-200'
  };
  var TYPE_HDR = {
    PG:         'bg-blue-50 border-blue-200 text-blue-800',
    PG_KOMPLEKS:'bg-indigo-50 border-indigo-200 text-indigo-800',
    BS:         'bg-teal-50 border-teal-200 text-teal-800',
    JODOH:      'bg-purple-50 border-purple-200 text-purple-800',
    Esai:       'bg-rose-50 border-rose-200 text-rose-800'
  };

  var wrongByType = {};
  wrongQuestions.forEach(function(q) {
    var t = q.type || 'PG';
    if (!wrongByType[t]) wrongByType[t] = [];
    wrongByType[t].push(q);
  });

  var wrongGroupsHTML = '';
  if (wrongQuestions.length === 0) {
    wrongGroupsHTML = '<p class="text-xs text-emerald-600 text-center py-4 font-semibold"><i class="fas fa-check-circle mr-1"></i>Semua soal dijawab dengan benar!</p>';
  } else {
    TYPE_ORDER.forEach(function(t) {
      var qs = wrongByType[t];
      if (!qs || qs.length === 0) return;
      var tc  = TYPE_COLORS[t] || 'bg-slate-100 text-slate-600 border-slate-200';
      var hdr = TYPE_HDR[t]   || 'bg-slate-50 border-slate-200 text-slate-700';
      var rows = qs.map(function(q, i) {
        var stuAns = q.studentAnswer;
        if (q.type === 'PG_KOMPLEKS' && stuAns) {
          var parts = stuAns.split(',').map(function(s){ return s.trim(); });
          var isLetters = parts.every(function(p){ return /^[A-E]$/.test(p.toUpperCase()); });
          if (!isLetters) {
            stuAns = parts.map(function(p){
              if (/^[A-E]$/.test(p.toUpperCase())) return p.toUpperCase();
              return p; 
            }).join(', ');
          } else {
            stuAns = parts.map(function(p){ return p.toUpperCase(); }).join(', ');
          }
        }
        return '<tr class="hover:bg-red-50/30 border-b border-slate-100">'
          + '<td class="p-3 text-center text-xs text-slate-400 w-8">'+(i+1)+'</td>'
          + '<td class="p-3 text-xs text-slate-700 max-w-xs">'+prepContent(q.content)+'</td>'
          + '<td class="p-3 text-xs text-red-600 max-w-xs">'+stuAns+'</td>'
          + '<td class="p-3 text-xs text-emerald-700 font-semibold max-w-xs">'+q.correctAnswer+'</td>'
          + '<td class="p-3 text-center text-xs font-bold text-orange-600">'+q.earnedPoints+'/'+q.weight+'</td>'
          + '</tr>';
      }).join('');

      wrongGroupsHTML += ''
        + '<div class="rounded-xl border overflow-hidden mb-3 ' + hdr + '">'
        + '<div class="px-4 py-2.5 flex items-center gap-2 border-b ' + hdr + '">'
          + '<span class="px-2 py-0.5 rounded text-[10px] font-black border '+tc+'">'+TYPE_LABELS[t]+'</span>'
          + '<span class="text-xs font-semibold text-slate-500">'+qs.length+' soal keliru</span>'
        + '</div>'
        + '<div class="overflow-x-auto">'
        + '<table class="w-full text-sm">'
        + '<thead class="bg-white/60"><tr>'
          + '<th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-8">No</th>'
          + '<th class="p-3 text-left text-[10px] font-black uppercase text-slate-400">Soal</th>'
          + '<th class="p-3 text-left text-[10px] font-black uppercase text-red-400">Jawaban Siswa</th>'
          + '<th class="p-3 text-left text-[10px] font-black uppercase text-emerald-500">Kunci</th>'
          + '<th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-20">Poin</th>'
        + '</tr></thead>'
        + '<tbody>'+rows+'</tbody>'
        + '</table></div></div>';
    });
  }

  var wrongTable = '<div class="rounded-xl border border-slate-200 overflow-hidden mb-5">'
    + '<div class="px-4 py-3 bg-red-50 border-b border-red-100 flex items-center justify-between">'
      + '<p class="text-xs font-bold text-red-700 uppercase tracking-wide"><i class="fas fa-times-circle mr-1.5"></i>Soal yang Keliru ('+wrongQuestions.length+')</p>'
      + '<span class="text-[10px] text-slate-400">Dikelompokkan per tipe soal</span>'
    + '</div>'
    + '<div class="p-3">'+wrongGroupsHTML+'</div>'
    + '</div>';

  const levelStyle = {
    danger:  'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    good:    'bg-emerald-50 border-emerald-200 text-emerald-700'
  };
  const levelIcon = { danger: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', good: 'fa-check-circle' };

  const rekoHTML = recommendations.map(r => `
    <div class="flex items-start gap-3 p-3 rounded-xl border mb-2 ${levelStyle[r.level] || 'bg-slate-50 border-slate-200'}">
      <i class="fas ${levelIcon[r.level] || 'fa-info-circle'} mt-0.5 flex-shrink-0"></i>
      <div>
        <div class="text-xs font-black uppercase mb-0.5">${r.type}</div>
        <div class="text-xs">${r.message}</div>
      </div>
    </div>`).join('');

  const rekoPanel = `
    <div class="rounded-xl border border-slate-200 p-4 mb-4">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
        <i class="fas fa-lightbulb mr-1.5 text-amber-500"></i>Rekomendasi Tindak Lanjut
      </p>
      ${rekoHTML || '<p class="text-xs text-slate-400">Tidak ada rekomendasi.</p>'}
    </div>`;

  return `
    <div id="student-report-content">
      <!-- Header siswa -->
      <div class="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span class="text-white font-black text-lg">${student.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-slate-800 text-lg">${student.name}</span>
            ${session.isTimeout ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide" title="Siswa kehabisan waktu saat mengerjakan ujian"><i class="fas fa-clock"></i> Waktu Habis</span>` : ''}
          </div>
          <div class="text-xs text-slate-500">${student.class} &nbsp;·&nbsp; ${examInfo.subject} &nbsp;·&nbsp; Kelas ${examInfo.classes}</div>
        </div>
      </div>
      ${scoreCard}
      ${sessionInfo}
      ${typeBreakdown}
      ${wrongTable}
      ${rekoPanel}
    </div>`;
}

var _STUDENT_PRINT_CSS = [
  'body{font-family:Arial,sans-serif;font-size:11px;color:#1e293b;margin:0;padding:16px;}',
  'h2{font-size:12px;margin:14px 0 6px;border-bottom:2px solid #e2e8f0;padding-bottom:4px;color:#334155;}',
  'p{margin:3px 0;font-size:10px;color:#64748b;}',
  '.header{display:flex;align-items:center;gap:14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:14px;}',
  '.avatar{width:44px;height:44px;border-radius:50%;background:#2563eb;color:#fff;font-size:20px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
  '.student-name{font-size:15px;font-weight:900;color:#1e293b;}',
  '.student-meta{font-size:10px;color:#64748b;margin-top:2px;}',
  '.badge-timeout{display:inline-block;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:700;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;margin-left:6px;text-transform:uppercase;vertical-align:middle;}',
  '.score-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}',
  '.score-card{border-radius:8px;padding:10px;text-align:center;border:1px solid #e2e8f0;}',
  '.score-card .val{font-size:22px;font-weight:900;}',
  '.score-card .lbl{font-size:9px;font-weight:700;text-transform:uppercase;margin-top:2px;}',
  '.score-card .sub{font-size:9px;margin-top:1px;opacity:.7;}',
  '.card-pass{background:#f0fdf4;border-color:#a7f3d0;color:#065f46;}',
  '.card-fail{background:#fef2f2;border-color:#fca5a5;color:#991b1b;}',
  '.card-blue{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8;}',
  '.card-orange{background:#fff7ed;border-color:#fed7aa;color:#c2410c;}',
  '.card-slate{background:#f8fafc;border-color:#e2e8f0;color:#475569;}',
  '.session-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}',
  '.session-chip{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:10px;color:#64748b;}',
  '.session-chip strong{color:#1e293b;}',
  '.type-table{width:100%;border-collapse:collapse;margin-bottom:14px;}',
  '.type-table th{background:#f1f5f9;padding:5px 8px;border:1px solid #e2e8f0;font-size:10px;text-align:left;}',
  '.type-table td{padding:5px 8px;border:1px solid #e2e8f0;font-size:10px;}',
  '.pct-bar-wrap{width:80px;background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;display:inline-block;vertical-align:middle;}',
  '.pct-bar{height:8px;border-radius:4px;}',
  '.pct-good{background:#10b981;} .pct-med{background:#f59e0b;} .pct-low{background:#ef4444;}',
  '.pct-txt{font-weight:900;font-size:10px;}',
  '.wrong-section{margin-bottom:14px;}',
  '.wrong-type-hdr{font-size:10px;font-weight:900;text-transform:uppercase;padding:5px 10px;border:1px solid #e2e8f0;border-bottom:none;border-radius:6px 6px 0 0;background:#f8fafc;}',
  '.wrong-table{width:100%;border-collapse:collapse;border:1px solid #e2e8f0;}',
  '.wrong-table th{background:#f1f5f9;padding:5px 8px;border-bottom:1px solid #e2e8f0;font-size:9px;text-align:left;font-weight:700;}',
  '.wrong-table td{padding:5px 8px;border-bottom:1px solid #f1f5f9;font-size:10px;vertical-align:top;}',
  '.wrong-table tr:last-child td{border-bottom:none;}',
  '.ans-wrong{color:#dc2626;} .ans-correct{color:#16a34a;font-weight:700;} .no-col{color:#94a3b8;text-align:center;width:28px;}',
  '.reko-item{padding:7px 10px;border-radius:6px;margin-bottom:6px;border:1px solid #e2e8f0;display:flex;gap:8px;align-items:flex-start;}',
  '.reko-danger{background:#fef2f2;border-color:#fca5a5;color:#991b1b;}',
  '.reko-warning{background:#fffbeb;border-color:#fcd34d;color:#92400e;}',
  '.reko-good{background:#f0fdf4;border-color:#a7f3d0;color:#065f46;}',
  '.reko-icon{font-size:13px;flex-shrink:0;}',
  '.reko-type{font-size:9px;font-weight:900;text-transform:uppercase;margin-bottom:2px;}',
  '.reko-msg{font-size:10px;}',
  '.page-break{page-break-after:always;break-after:page;margin-bottom:0;}',
  '@media print{@page{size:A4;margin:12mm;}body{padding:0;}.header{break-inside:avoid;}.wrong-section{break-inside:avoid;}}'
].join('');

function _buildStudentPrintBody(res) {
  var student      = res.student    || {};
  var session      = res.session    || {};
  var examInfo     = res.examInfo   || {};
  var typeStats    = res.typeStats  || {};
  var wrongQ       = res.wrongQuestions || [];
  var reko         = res.recommendations || [];
  var tqTotal      = res.totalQuestions  || 0;
  var tqCorrect    = res.totalCorrect    || 0;
  var tqWrong      = res.totalWrong      || 0;
  var tqUnanswered = res.totalUnanswered || 0;

  var TYPE_ORDER  = ['PG','PG_KOMPLEKS','BS','JODOH','Esai'];
  var TYPE_LABELS = { PG:'Pilihan Ganda (PG)', PG_KOMPLEKS:'PG Kompleks (PGK)', BS:'Benar/Salah (B/S)', JODOH:'Menjodohkan', Esai:'Esai' };
  var TYPE_COLORS_PRINT = {
    PG:'background:#eff6ff;color:#1e40af;', PG_KOMPLEKS:'background:#eef2ff;color:#3730a3;',
    BS:'background:#f0fdfa;color:#0f766e;', JODOH:'background:#faf5ff;color:#6b21a8;', Esai:'background:#fff1f2;color:#be123c;'
  };

  var initial = (student.name||'?').charAt(0).toUpperCase();
  var timeoutBadge = session.isTimeout ? '<span class="badge-timeout">Waktu Habis</span>' : '';
  var headerHTML = '<div class="header">'
    + '<div class="avatar">'+initial+'</div>'
    + '<div><div class="student-name">'+_esc(student.name||'-')+timeoutBadge+'</div>'
    + '<div class="student-meta">'+_esc(student.class||'-')+'&nbsp;&bull;&nbsp;'+_esc(examInfo.subject||'-')+'&nbsp;&bull;&nbsp;Kelas '+_esc(examInfo.classes||'-')+'</div>'
    + '</div></div>';

  var cardPass  = session.passed ? 'card-pass' : 'card-fail';
  var passLabel = session.passed ? '✓ LULUS'   : '✗ TIDAK LULUS';
  var scoreGridHTML = '<div class="score-grid">'
    + '<div class="score-card '+cardPass+'"><div class="val">'+session.totalScore+'</div><div class="lbl">'+passLabel+'</div><div class="sub">KKM: '+session.passingGrade+'</div></div>'
    + '<div class="score-card card-blue"><div class="val">'+tqCorrect+'</div><div class="lbl">Benar / '+tqTotal+' Soal</div></div>'
    + '<div class="score-card '+(tqWrong > 0 ? 'card-orange':'card-pass')+'"><div class="val">'+tqWrong+'</div><div class="lbl">Jawaban Salah</div></div>'
    + '<div class="score-card '+(tqUnanswered > 0 ? 'card-slate':'card-pass')+'"><div class="val">'+tqUnanswered+'</div><div class="lbl">Tidak Dijawab</div></div>'
    + '</div>';

  var sessionHTML = '<div class="session-row">'
    + '<div class="session-chip"><strong>Mulai:</strong> '+_esc(session.startTime||'-')+'</div>'
    + '<div class="session-chip"><strong>Selesai:</strong> '+_esc(session.submitTime||'-')+'</div>'
    + '<div class="session-chip"><strong>Durasi:</strong> '+_esc(session.durasiMenit||'-')+'</div>'
    + '</div>';

  var typeRows = TYPE_ORDER.filter(function(t){ return !!typeStats[t]; }).map(function(t) {
    var st = typeStats[t];
    var barCls = st.pct >= 75 ? 'pct-good' : st.pct >= 50 ? 'pct-med' : 'pct-low';
    var pctCls = st.pct >= 75 ? 'color:#16a34a' : st.pct >= 50 ? 'color:#d97706' : 'color:#dc2626';
    return '<tr>'
      + '<td>'+_esc(TYPE_LABELS[t]||t)+'</td>'
      + '<td style="text-align:center;">'+st.total+'</td>'
      + '<td style="text-align:center;">'+st.correct+'</td>'
      + '<td style="text-align:center;">'+st.earnedPoints+' / '+st.maxPoints+'</td>'
      + '<td style="text-align:center;"><span class="pct-bar-wrap"><span class="pct-bar '+barCls+'" style="width:'+st.pct+'%"></span></span></td>'
      + '<td style="text-align:center;"><span class="pct-txt" style="'+pctCls+'">'+st.pct+'%</span></td>'
      + '</tr>';
  }).join('');
  var typeBreakdownHTML = '<h2>Performa per Tipe Soal</h2>'
    + '<table class="type-table"><thead><tr>'
    + '<th>Tipe Soal</th><th style="text-align:center;">Total</th><th style="text-align:center;">Benar</th>'
    + '<th style="text-align:center;">Poin</th><th style="text-align:center;">Grafik</th><th style="text-align:center;">%</th>'
    + '</tr></thead><tbody>'+typeRows+'</tbody></table>';

  var wrongByType = {};
  wrongQ.forEach(function(q){ var t=q.type||'PG'; if(!wrongByType[t]) wrongByType[t]=[]; wrongByType[t].push(q); });
  var wrongHTML = '';
  if (!wrongQ.length) {
    wrongHTML = '<p style="color:#16a34a;text-align:center;padding:10px;font-weight:700;">✓ Semua soal dijawab dengan benar!</p>';
  } else {
    TYPE_ORDER.forEach(function(t) {
      var qs = wrongByType[t]; if (!qs||!qs.length) return;
      var hdrStyle = TYPE_COLORS_PRINT[t] || 'background:#f8fafc;color:#334155;';
      var rows = qs.map(function(q, i) {
        var stuAns = q.studentAnswer||'-';
        if (q.type==='PG_KOMPLEKS' && stuAns && stuAns!=='-') {
          stuAns = stuAns.split(',').map(function(p){ p=p.trim(); return /^[A-E]$/i.test(p)?p.toUpperCase():p; }).join(', ');
        }
        return '<tr><td class="no-col">'+(i+1)+'</td>'
          + '<td>'+_esc(q.content||'-')+'</td>'
          + '<td class="ans-wrong">'+_esc(stuAns)+'</td>'
          + '<td class="ans-correct">'+_esc(q.correctAnswer||'-')+'</td>'
          + '<td style="text-align:center;color:#d97706;font-weight:700;">'+_esc(String(q.earnedPoints||0))+'/'+_esc(String(q.weight||0))+'</td></tr>';
      }).join('');
      wrongHTML += '<div class="wrong-section">'
        + '<div class="wrong-type-hdr" style="'+hdrStyle+'">'+_esc(TYPE_LABELS[t]||t)+' &nbsp;·&nbsp; '+qs.length+' soal keliru</div>'
        + '<table class="wrong-table"><thead><tr>'
        + '<th style="text-align:center;width:28px;">No</th><th>Soal</th>'
        + '<th style="color:#dc2626;">Jawaban Siswa</th><th style="color:#16a34a;">Kunci</th><th style="text-align:center;">Poin</th>'
        + '</tr></thead><tbody>'+rows+'</tbody></table></div>';
    });
  }
  var wrongSection = '<h2>Soal yang Keliru ('+wrongQ.length+')</h2>'+wrongHTML;

  var rekoRows = reko.map(function(r) {
    var cls  = r.level==='danger' ? 'reko-danger' : r.level==='warning' ? 'reko-warning' : 'reko-good';
    var icon = r.level==='danger' ? '⚠' : r.level==='warning' ? '△' : '✓';
    return '<div class="reko-item '+cls+'"><div class="reko-icon">'+icon+'</div>'
      + '<div><div class="reko-type">'+_esc(r.type||'')+'</div>'
      + '<div class="reko-msg">'+_esc(r.message||'')+'</div></div></div>';
  }).join('');
  var rekoSection = '<h2>Rekomendasi Tindak Lanjut</h2>'
    + (rekoRows||'<p style="color:#94a3b8;text-align:center;">Tidak ada rekomendasi.</p>');

  var now = new Date().toLocaleString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
  return headerHTML + scoreGridHTML + sessionHTML + typeBreakdownHTML + wrongSection + rekoSection
    + '<p style="margin-top:20px;text-align:right;color:#94a3b8;font-size:9px;">Dicetak: '+now+'</p>';
}

function _esc(s) {
  return String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function printStudentReport() {
  var res = window._studentReportData;
  if (!res || !res.success) return Swal.fire({
    icon:'info', title:'Tidak Ada Laporan',
    html:'<p style="font-size:13px;color:#475569;">Buka laporan siswa terlebih dahulu sebelum mencetak.</p>',
    confirmButtonColor:'#7e22ce',
    customClass:{ popup:'lp-swal' }
  });
  var body = _buildStudentPrintBody(res);
  var fullHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<title>Laporan Siswa \u2014 '+_esc((res.student||{}).name||'')+'</title>'
    + '<style>'+_STUDENT_PRINT_CSS+'</style>'
    + '<div id="__GAS_CONFIG__" data-gas-url="https://script.google.com/macros/s/AKfycbwHNjzGCBgrM3umOSYJzY1WO079ucscGUUbVUWphai44wOnIhTbu1hgXrh_7ummaVyb/exec" style="display:none"></div>'
    + '<script src="/api-client.js"><\/script>'
    + '</head><body>'+body+'</body></html>';
  _openPrintBlobWindow(fullHtml, false);
}

function openBulkPrintModal() {
  var list = window._iaStudentList || [];
  if (!list.length) {
    return Swal.fire({ icon:'info', title:'Belum Ada Data Siswa', text:'Pilih ujian dan tunggu daftar siswa termuat.' });
  }

  function buildRows(filter) {
    var filtered = filter === 'lulus'
      ? list.filter(function(s){ return s.passed; })
      : filter === 'gagal'
        ? list.filter(function(s){ return !s.passed; })
        : list;
    if (!filtered.length) return '<p style="text-align:center;color:#94a3b8;padding:16px 0;font-size:13px;">Tidak ada siswa untuk filter ini.</p>';
    return filtered.map(function(s) {
      var scoreColor = s.passed ? '#16a34a' : '#dc2626';
      var badge = s.passed
        ? '<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;border-radius:12px;padding:1px 7px;font-size:10px;font-weight:700;margin-left:6px;">LULUS</span>'
        : '<span style="background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;border-radius:12px;padding:1px 7px;font-size:10px;font-weight:700;margin-left:6px;">TIDAK LULUS</span>';
      return '<label style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;border:1px solid #e2e8f0;margin-bottom:5px;background:#fff;transition:background .15s;" '
        + 'onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'#fff\'">'
        + '<input type="checkbox" class="bulk-chk" value="'+_esc(s.responseId)+'" '
        + 'style="width:15px;height:15px;accent-color:#6d28d9;cursor:pointer;" checked '
        + 'onchange="updateBulkCount()">'
        + '<div style="flex:1;min-width:0;">'
        + '<div style="font-size:12px;font-weight:700;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'
        + _esc(s.name)+badge+'</div>'
        + '<div style="font-size:10px;color:#64748b;margin-top:1px;">'+_esc(s.class)
        + ' &nbsp;&bull;&nbsp; <span style="font-weight:700;color:'+scoreColor+';">'+s.score+'</span>'
        + ' &nbsp;&bull;&nbsp; '+_esc(s.startTime)+'</div>'
        + '</div></label>';
    }).join('');
  }

  var examName = '';
  var examSel = document.getElementById('ia-exam-select');
  if (examSel && examSel.selectedOptions[0]) examName = examSel.selectedOptions[0].textContent;

  var modalHtml = '<div style="text-align:left;">'
    + '<p style="font-size:11px;color:#64748b;margin:0 0 10px;padding:6px 10px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;">'
    + '<b>Ujian:</b> '+_esc(examName)+'</p>'
    + '<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">'
    + '<span style="font-size:11px;font-weight:700;color:#475569;margin-right:2px;">Filter:</span>'
    + '<button id="bp-f-all"  onclick="setBPFilter(\'all\')"   style="padding:3px 10px;border-radius:20px;border:1px solid #6d28d9;background:#6d28d9;color:#fff;font-size:11px;font-weight:700;cursor:pointer;">Semua</button>'
    + '<button id="bp-f-lulus" onclick="setBPFilter(\'lulus\')" style="padding:3px 10px;border-radius:20px;border:1px solid #e2e8f0;background:#fff;color:#16a34a;font-size:11px;font-weight:700;cursor:pointer;">Lulus</button>'
    + '<button id="bp-f-gagal" onclick="setBPFilter(\'gagal\')" style="padding:3px 10px;border-radius:20px;border:1px solid #e2e8f0;background:#fff;color:#dc2626;font-size:11px;font-weight:700;cursor:pointer;">Tidak Lulus</button>'
    + '<span style="flex:1;"></span>'
    + '<button onclick="toggleAllBP(true)"  style="padding:3px 10px;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc;color:#334155;font-size:11px;cursor:pointer;">✓ Semua</button>'
    + '<button onclick="toggleAllBP(false)" style="padding:3px 10px;border-radius:6px;border:1px solid #e2e8f0;background:#f8fafc;color:#334155;font-size:11px;cursor:pointer;">✗ Kosongkan</button>'
    + '</div>'
    + '<div id="bp-list" style="max-height:300px;overflow-y:auto;padding-right:2px;">'
    + buildRows('all')
    + '</div>'
    + '<div id="bp-counter" style="margin-top:10px;font-size:12px;color:#475569;text-align:center;font-weight:600;"></div>'
    + '</div>';

  window._bpBuildRows = buildRows;
  window._bpCurrentFilter = 'all';

  Swal.fire({
    title: '<span style="font-size:16px;">&#128438; Pilih Siswa untuk Dicetak</span>',
    html:  modalHtml,
    width: 560,
    showCancelButton: true,
    confirmButtonText: 'Cetak',
    cancelButtonText:  'Batal',
    confirmButtonColor: '#6d28d9',
    didOpen: function() { updateBulkCount(); },
    preConfirm: function() {
      var checks = Array.from(document.querySelectorAll('.bulk-chk:checked'));
      if (!checks.length) {
        Swal.showValidationMessage('Pilih minimal satu siswa.');
        return false;
      }
      return checks.map(function(c){ return c.value; });
    }
  }).then(function(result) {
    if (result.isConfirmed && result.value && result.value.length) {
      executeBulkPrint(result.value);
    }
  });
}

function setBPFilter(filter) {
  window._bpCurrentFilter = filter;
  var el = document.getElementById('bp-list');
  if (el && window._bpBuildRows) el.innerHTML = window._bpBuildRows(filter);
  ['all','lulus','gagal'].forEach(function(f) {
    var btn = document.getElementById('bp-f-'+f);
    if (!btn) return;
    if (f === filter) {
      btn.style.background = '#6d28d9'; btn.style.color = '#fff'; btn.style.borderColor = '#6d28d9';
    } else {
      btn.style.background = '#fff'; btn.style.color = (f==='lulus'?'#16a34a':(f==='gagal'?'#dc2626':'#334155')); btn.style.borderColor = '#e2e8f0';
    }
  });
  updateBulkCount();
}

function toggleAllBP(checked) {
  document.querySelectorAll('.bulk-chk').forEach(function(c){ c.checked = checked; });
  updateBulkCount();
}

function updateBulkCount() {
  var total   = document.querySelectorAll('.bulk-chk').length;
  var checked = document.querySelectorAll('.bulk-chk:checked').length;
  var counter = document.getElementById('bp-counter');
  if (counter) {
    counter.innerHTML = '<b style="color:'+(checked>0?'#6d28d9':'#94a3b8')+';">'+checked+'</b>'
      + ' dari <b>'+total+'</b> siswa dipilih';
  }
  var confirmBtn = Swal.getConfirmButton();
  if (confirmBtn) {
    confirmBtn.textContent = checked > 0 ? 'Cetak '+checked+' Laporan' : 'Cetak';
    confirmBtn.disabled    = checked === 0;
  }
}

function executeBulkPrint(responseIds) {
  var examID = (document.getElementById('ia-exam-select')||{}).value;
  if (!examID) return _iaWarnNoExam();

  var total    = responseIds.length;
  var collected = [];

  Swal.fire({
    title: 'Memuat Laporan…',
    html:  '<div id="bp-prog-text" style="font-size:13px;color:#475569;margin-bottom:8px;">Menyiapkan (0 / '+total+')…</div>'
      + '<div style="background:#e2e8f0;border-radius:8px;height:10px;overflow:hidden;">'
      + '<div id="bp-prog-bar" style="height:10px;background:#6d28d9;width:0%;border-radius:8px;transition:width .3s;"></div>'
      + '</div>',
    allowOutsideClick: false,
    showConfirmButton:  false,
    didOpen: function() { Swal.showLoading(); }
  });

  function updateProgress(done) {
    var pct = Math.round(done / total * 100);
    var bar = document.getElementById('bp-prog-bar');
    var txt = document.getElementById('bp-prog-text');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = 'Memuat laporan ' + done + ' / ' + total + '…';
  }

  function fetchNext(idx) {
    if (idx >= total) {
      var succeeded = collected.filter(function(r){ return r && r.success; });
      if (!succeeded.length) {
        Swal.fire({ icon:'error', title:'Gagal Memuat', text:'Tidak ada laporan yang berhasil dimuat.' });
        return;
      }
      var pages = succeeded.map(function(r, i) {
        return '<div class="'+(i < succeeded.length - 1 ? 'page-break' : '')+'">'+_buildStudentPrintBody(r)+'</div>';
      }).join('');
      var examLabel = '';
      var sel = document.getElementById('ia-exam-select');
      if (sel && sel.selectedOptions[0]) examLabel = sel.selectedOptions[0].textContent;
      var fullHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
        + '<title>Laporan Siswa \u2014 '+_esc(examLabel)+'</title>'
        + '<style>'+_STUDENT_PRINT_CSS+'</style>'
        + '<!-- VERCEL: GAS URL injected at build time -->'
        + '<div id="__GAS_CONFIG__" data-gas-url="https://script.google.com/macros/s/AKfycbwHNjzGCBgrM3umOSYJzY1WO079ucscGUUbVUWphai44wOnIhTbu1hgXrh_7ummaVyb/exec" style="display:none"></div>'
        + '<!-- VERCEL: API client adapter \u2014 replaces google.script.run with fetch() -->'
        + '<script src="/api-client.js"><\/script>'
        + '</head><body>'+pages+'</body></html>';
      Swal.close();
      setTimeout(function(){ _openPrintBlobWindow(fullHtml, false); }, 200);
      return;
    }

    updateProgress(idx);
    google.script.run
      .withSuccessHandler(function(res) {
        collected.push(res || null);
        fetchNext(idx + 1);
      })
      .withFailureHandler(function() {
        collected.push(null); 
        fetchNext(idx + 1);
      })
      .getStudentDetailReport(examID, responseIds[idx], currentUser.userID, currentUser.token);
  }

  fetchNext(0);
}

function loadClassSummary() {
  const examID = document.getElementById('ia-exam-select')?.value;
  if (!examID) return _iaWarnNoExam();

  const rd = document.getElementById('rekap-kelas-result');
  if (!rd) return;

  rd.innerHTML = `
    <div class="ia-loading">
      <i class="fas fa-circle-notch fa-spin text-cyan-600 text-2xl"></i>
      <span>Menghitung rekap kelas...</span>
    </div>`;

  google.script.run
    .withSuccessHandler(res => {
      if (!res || !res.success) {
        rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Gagal memuat rekap kelas.</b> ${res?.message || 'Terjadi kesalahan.'}</div></div>`;
        return;
      }
      window._classSummaryData = res;
      rd.innerHTML = buildClassSummaryHTML(res);
      renderMath(rd); 
    })
    .withFailureHandler(err => {
      rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Error:</b> ${err.message || String(err)}</div></div>`;
    })
    .getClassSummaryReport(examID, currentUser.userID, currentUser.token);
}


function buildClassSummaryHTML(res) {
  const { examInfo, totalStudents, statistics: st, histogram, typeSummary, mostWrong, studentList } = res;

  const passRateColor = st.passRate >= 75 ? 'text-emerald-600' : st.passRate >= 50 ? 'text-amber-600' : 'text-red-600';
  const statsCards = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div class="rounded-xl border border-cyan-100 bg-cyan-50 p-4 text-center">
        <div class="text-3xl font-black text-cyan-700">${totalStudents}</div>
        <div class="text-xs font-semibold text-cyan-500 mt-0.5">Total Peserta</div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
        <div class="text-3xl font-black text-slate-700">${st.avg}</div>
        <div class="text-xs font-semibold text-slate-500 mt-0.5">Rata-rata</div>
        <div class="text-[10px] text-slate-400">Min ${st.min} · Maks ${st.max}</div>
      </div>
      <div class="rounded-xl border border-purple-100 bg-purple-50 p-4 text-center">
        <div class="text-3xl font-black text-purple-700">${st.median}</div>
        <div class="text-xs font-semibold text-purple-500 mt-0.5">Median</div>
        <div class="text-[10px] text-purple-400">Std Dev: ${st.stdDev}</div>
      </div>
      <div class="rounded-xl border ${st.passRate >= 75 ? 'border-emerald-100 bg-emerald-50' : 'border-orange-100 bg-orange-50'} p-4 text-center">
        <div class="text-3xl font-black ${passRateColor}">${st.passRate}%</div>
        <div class="text-xs font-semibold ${passRateColor} mt-0.5">Tingkat Kelulusan</div>
        <div class="text-[10px] text-slate-400">${st.passCount} lulus · ${st.failCount} tidak</div>
      </div>
    </div>`;

  const histMax = Math.max(...histogram.map(h => h.count), 1);
  const histBars = histogram.map(h => {
    const heightPct = Math.round(h.count / histMax * 100);
    const isAboveKKM = h.min >= (res.examInfo.passingGrade || 76);
    const barColor   = isAboveKKM ? 'bg-emerald-500' : 'bg-red-400';
    return `
      <div class="flex flex-col items-center gap-1 flex-1">
        <span class="text-xs font-black ${isAboveKKM ? 'text-emerald-600' : 'text-red-500'}">${h.count || ''}</span>
        <div class="w-full ${barColor} rounded-t transition-all" style="height:${Math.max(4, heightPct * 0.7)}px"></div>
        <span class="text-[9px] text-slate-500 leading-tight text-center">${h.label}</span>
      </div>`;
  }).join('');

  const histPanel = `
    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
        <i class="fas fa-chart-bar mr-1.5"></i>Distribusi Nilai
        <span class="font-normal text-slate-400 ml-2">KKM: ${examInfo.passingGrade} &nbsp;·&nbsp; Batang hijau = di atas KKM</span>
      </p>
      <div class="flex items-end gap-1 pt-6">${histBars}</div>
    </div>`;

  const typeColors = { PG:'bg-blue-500', PG_KOMPLEKS:'bg-indigo-500', BS:'bg-teal-500', JODOH:'bg-purple-500', Esai:'bg-rose-500' };
  const typeBars = typeSummary.map(t => {
    const color  = typeColors[t.type] || 'bg-slate-400';
    const pColor = t.avgPct >= 75 ? 'text-emerald-600' : t.avgPct >= 50 ? 'text-yellow-600' : 'text-red-600';
    return `
      <div class="mb-2.5">
        <div class="flex justify-between text-xs mb-1">
          <span class="font-semibold text-slate-600">${t.label}</span>
          <span class="font-black ${pColor}">${t.avgPct}% rata-rata</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div class="${color} h-2.5 rounded-full" style="width:${t.avgPct}%"></div>
        </div>
      </div>`;
  }).join('');

  const typePanel = typeSummary.length
    ? `<div class="rounded-xl border border-slate-200 p-4 mb-5">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
          <i class="fas fa-layer-group mr-1.5"></i>Rata-rata Pencapaian per Tipe Soal
        </p>
        ${typeBars}
      </div>` : '';

  var MWTYPE_ORDER  = ['PG','PG_KOMPLEKS','BS','JODOH','Esai'];
  var MWTYPE_LABELS = { PG:'Pilihan Ganda (PG)', PG_KOMPLEKS:'PG Kompleks (PGK)', BS:'Benar/Salah (B/S)', JODOH:'Menjodohkan', Esai:'Esai' };
  var MWTYPE_COLORS = {
    PG:'bg-blue-100 text-blue-700', PG_KOMPLEKS:'bg-indigo-100 text-indigo-700',
    BS:'bg-teal-100 text-teal-700', JODOH:'bg-purple-100 text-purple-700', Esai:'bg-rose-100 text-rose-700'
  };
  var MWTYPE_HDR = {
    PG:'bg-blue-50 border-blue-200', PG_KOMPLEKS:'bg-indigo-50 border-indigo-200',
    BS:'bg-teal-50 border-teal-200', JODOH:'bg-purple-50 border-purple-200', Esai:'bg-rose-50 border-rose-200'
  };

  var mwByType = {};
  mostWrong.forEach(function(q) {
    var t = q.type || 'PG';
    if (!mwByType[t]) mwByType[t] = [];
    mwByType[t].push(q);
  });

  var wrongGroupsBody = '';
  if (mostWrong.length === 0) {
    wrongGroupsBody = '<tr><td colspan="4" class="text-center p-6 text-slate-400">Tidak ada data.</td></tr>';
  } else {
    MWTYPE_ORDER.forEach(function(t) {
      var qs = mwByType[t];
      if (!qs || qs.length === 0) return;
      var tc  = MWTYPE_COLORS[t] || 'bg-slate-100 text-slate-600';
      var hdr = MWTYPE_HDR[t]   || 'bg-slate-50 border-slate-200';

      wrongGroupsBody += '<tr><td colspan="4" class="px-4 py-2 border-b border-t border-slate-200 '+ hdr +'">'
        + '<span class="px-2 py-0.5 rounded text-[10px] font-black border '+tc+'">'+MWTYPE_LABELS[t]+'</span>'
        + '<span class="text-[10px] text-slate-500 ml-2">'+qs.length+' soal</span>'
        + '</td></tr>';

      qs.forEach(function(q, i) {
        var pctColor = q.wrongPct >= 75 ? 'text-red-700 bg-red-50' : q.wrongPct >= 50 ? 'text-orange-700 bg-orange-50' : 'text-yellow-700 bg-yellow-50';
        wrongGroupsBody += '<tr class="hover:bg-orange-50/20 border-b border-slate-100">'
          + '<td class="p-3 text-center text-xs text-slate-400">'+(i+1)+'</td>'
          + '<td class="p-3 text-xs text-slate-700 max-w-sm">'+prepContent(q.content)+'</td>'
          + '<td class="p-3 text-center">'
            + '<span class="font-black text-base '+(q.wrongPct>=75?'text-red-600':q.wrongPct>=50?'text-orange-600':'text-yellow-600')+'">'+q.wrongCount+'</span>'
            + '<span class="text-[10px] text-slate-400 ml-0.5">/ '+totalStudents+'</span>'
          + '</td>'
          + '<td class="p-3 text-center"><span class="px-2 py-1 rounded-full text-xs font-black '+pctColor+'">'+q.wrongPct+'%</span></td>'
          + '</tr>';
      });
    });
  }

  var wrongPanel = '<div class="rounded-xl border border-slate-200 overflow-hidden mb-5">'
    + '<div class="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">'
      + '<p class="text-xs font-bold text-orange-700 uppercase tracking-wide"><i class="fas fa-exclamation-triangle mr-1.5"></i>Soal Paling Banyak Dijawab Salah</p>'
      + '<span class="text-[10px] text-slate-400">Dikelompokkan per tipe soal</span>'
    + '</div>'
    + '<div class="overflow-x-auto">'
    + '<table class="w-full text-sm">'
    + '<thead class="bg-slate-50"><tr>'
      + '<th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-8">No</th>'
      + '<th class="p-3 text-left text-[10px] font-black uppercase text-slate-400">Soal</th>'
      + '<th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-20">Jml Salah</th>'
      + '<th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-20">% Salah</th>'
    + '</tr></thead>'
    + '<tbody>'+wrongGroupsBody+'</tbody>'
    + '</table></div></div>';

  const studentRows = studentList.map((s, i) => `
    <tr class="hover:bg-cyan-50/20 border-b border-slate-100 ${!s.passed ? 'bg-red-50/30' : ''}">
      <td class="p-3 text-center text-xs font-bold ${i < 3 ? 'text-amber-500' : 'text-slate-400'}">${i+1}</td>
      <td class="p-3 text-sm font-semibold text-slate-700">${s.name}</td>
      <td class="p-3 text-center text-xs text-slate-500">${s.class}</td>
      <td class="p-3 text-center font-black text-lg ${s.score >= (res.examInfo.passingGrade||76) ? 'text-emerald-600' : 'text-red-600'}">${s.score.toFixed(1)}</td>
      <td class="p-3 text-center">
        <div class="flex flex-col items-center gap-1">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${s.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}">
            ${s.passed ? 'Lulus' : 'Tidak Lulus'}
          </span>
          ${s.isTimeout ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide" title="Siswa kehabisan waktu saat mengerjakan ujian"><i class="fas fa-clock"></i> Waktu Habis</span>` : ''}
        </div>
      </td>
    </tr>`).join('');

  const rankPanel = `
    <div class="rounded-xl border border-slate-200 overflow-hidden mb-5">
      <div class="px-4 py-3 bg-cyan-50 border-b border-cyan-100 flex items-center justify-between">
        <p class="text-xs font-bold text-cyan-700 uppercase tracking-wide">
          <i class="fas fa-trophy mr-1.5"></i>Peringkat Siswa
        </p>
        <span class="text-[10px] text-slate-400">Diurutkan dari nilai tertinggi · KKM: ${examInfo.passingGrade}</span>
      </div>
      <div class="overflow-x-auto max-h-80 overflow-y-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 sticky top-0">
            <tr>
              <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-10">Rank</th>
              <th class="p-3 text-left text-[10px] font-black uppercase text-slate-400">Nama Siswa</th>
              <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-20">Kelas</th>
              <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-20">Nilai</th>
              <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-28">Status</th>
            </tr>
          </thead>
          <tbody>${studentRows}</tbody>
        </table>
      </div>
    </div>`;

  const exportBar = `
    <div id="class-summary-export-bar" class="flex flex-wrap gap-2 mb-5">
      <button onclick="exportClassSummaryToExcel()"
        class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition">
        <i class="fas fa-file-excel"></i> Ekspor Excel
      </button>
      <button onclick="printClassSummary()"
        class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-lg shadow transition">
        <i class="fas fa-print"></i> Cetak / PDF
      </button>
    </div>`;

  return `
    <div id="class-summary-content">
      <!-- Info ujian -->
      <div class="flex items-center gap-3 mb-5 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
        <i class="fas fa-school text-cyan-600 text-xl flex-shrink-0"></i>
        <div>
          <div class="font-bold text-slate-800">${examInfo.subject}</div>
          <div class="text-xs text-slate-500">Kelas ${examInfo.classes} &nbsp;·&nbsp; ${totalStudents} Peserta &nbsp;·&nbsp; KKM ${examInfo.passingGrade}</div>
        </div>
      </div>
      ${exportBar}
      ${statsCards}
      ${histPanel}
      ${typePanel}
      ${wrongPanel}
      ${rankPanel}
    </div>`;
}

function exportClassSummaryToExcel() {
  const res = window._classSummaryData;
  if (!res) return Swal.fire({ icon:'warning', title:'Tidak Ada Data', text:'Jalankan analisis terlebih dahulu.' });

  try {
    const wb = XLSX.utils.book_new();

    const st = res.statistics;
    const statRows = [
      ['REKAP KELAS — ' + res.examInfo.subject],
      [''],
      ['Kelas',        res.examInfo.classes],
      ['KKM',          res.examInfo.passingGrade],
      ['Total Peserta',res.totalStudents],
      [''],
      ['Rata-rata',    st.avg],
      ['Nilai Tertinggi', st.max],
      ['Nilai Terendah',  st.min],
      ['Median',          st.median],
      ['Standar Deviasi', st.stdDev],
      ['Jumlah Lulus',    st.passCount],
      ['Jumlah Tidak Lulus', st.failCount],
      ['Tingkat Kelulusan', st.passRate + '%'],
      [''],
      ['=== PERFORMA PER TIPE SOAL ==='],
      ['Tipe', 'Rata-rata %'],
      ...res.typeSummary.map(t => [t.label, t.avgPct + '%'])
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(statRows);
    ws1['!cols'] = [{wch:28},{wch:20}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Statistik');

    const rankHeader = ['Rank', 'Nama Siswa', 'Kelas', 'Nilai', 'Status'];
    const rankRows   = [rankHeader, ...res.studentList.map((s, i) => [
      i+1, s.name, s.class, s.score, s.passed ? 'Lulus' : 'Tidak Lulus'
    ])];
    const ws2 = XLSX.utils.aoa_to_sheet(rankRows);
    ws2['!cols'] = [{wch:6},{wch:32},{wch:12},{wch:10},{wch:14}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Peringkat Siswa');

    const histHeader = ['Rentang Nilai', 'Jumlah Siswa'];
    const histRows   = [histHeader, ...res.histogram.map(h => [h.label, h.count])];
    const ws3 = XLSX.utils.aoa_to_sheet(histRows);
    ws3['!cols'] = [{wch:16},{wch:16}];
    XLSX.utils.book_append_sheet(wb, ws3, 'Distribusi Nilai');

    const mwHeader = ['No', 'Tipe', 'Soal', 'Jml Salah', '% Salah'];
    const mwRows   = [mwHeader, ...res.mostWrong.map((q, i) => [
      i+1, q.type, q.content, q.wrongCount, q.wrongPct + '%'
    ])];
    const ws4 = XLSX.utils.aoa_to_sheet(mwRows);
    ws4['!cols'] = [{wch:5},{wch:14},{wch:70},{wch:12},{wch:10}];
    XLSX.utils.book_append_sheet(wb, ws4, 'Soal Bermasalah');

    const fname = `RekapKelas_${res.examInfo.subject.replace(/\s+/g,'_')}_${new Date().toLocaleDateString('id-ID').replace(/\//g,'-')}.xlsx`;
    XLSX.writeFile(wb, fname);
    Swal.fire({ icon:'success', title:'Berhasil!', text:`"${fname}" berhasil diunduh.`, timer:2500, showConfirmButton:false });

  } catch(e) {
    Swal.fire({ icon:'error', title:'Gagal Ekspor', text: e.message || String(e) });
  }
}

function printClassSummary() {
  const content = document.getElementById('class-summary-content');
  if (!content) return;

  const style = document.createElement('style');
  style.id    = 'class-summary-print-style';
  style.textContent = `@media print {
    body > * { display:none !important; }
    #class-summary-print-area { display:block !important; font-family:sans-serif; }
    #class-summary-print-area * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    #class-summary-print-area .max-h-80,
    #class-summary-print-area .max-h-96,
    #class-summary-print-area [class*="max-h-"] {
      max-height: none !important;
      overflow: visible !important;
    }
    #class-summary-print-area .overflow-y-auto,
    #class-summary-print-area .overflow-x-auto,
    #class-summary-print-area .overflow-auto {
      overflow: visible !important;
    }
    #class-summary-print-area .sticky {
      position: relative !important;
    }
  }`;
  document.head.appendChild(style);

  const printDiv = document.createElement('div');
  printDiv.id    = 'class-summary-print-area';
  const res = window._classSummaryData;
  printDiv.innerHTML = `
    <div style="padding:20px;font-size:11px">
      <h2 style="font-size:16px;margin-bottom:4px">Rekap Hasil Ujian Kelas</h2>
      <p style="color:#64748b;margin-bottom:16px">
        ${res?.examInfo.subject} | Kelas ${res?.examInfo.classes} |
        Dicetak: ${new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}
      </p>
      ${content.innerHTML}
    </div>`;
  document.body.appendChild(printDiv);

  const barInPrint = printDiv.querySelector('#class-summary-export-bar');
  if (barInPrint) barInPrint.remove();

  _convertChartBarsToInlineStyles(printDiv);

  printDiv.querySelectorAll('.max-h-80, .max-h-96, .max-h-64, [class*="max-h-"]').forEach(el => {
    el.style.maxHeight = 'none';
    el.style.overflow = 'visible';
  });
  printDiv.querySelectorAll('.overflow-y-auto, .overflow-x-auto, .overflow-auto, .overflow-hidden').forEach(el => {
    el.style.overflow = 'visible';
    el.style.overflowX = 'visible';
    el.style.overflowY = 'visible';
  });

  printDiv.querySelectorAll('.rounded-full[style*="width"]').forEach(el => {
    const widthStyle = el.style.width;
    if (widthStyle && !widthStyle.includes('%')) {
      const parent = el.parentElement;
      if (parent) {
        const parentWidth = parent.offsetWidth;
        const elWidth = el.offsetWidth;
        if (parentWidth > 0 && elWidth > 0) {
          const pct = Math.min(100, Math.round(elWidth / parentWidth * 100));
          el.style.width = pct + '%';
        }
      }
    }
    el.style.maxWidth = '100%';
  });

  printDiv.querySelectorAll('.rounded-full.overflow-hidden, .rounded-full[class*="overflow-hidden"]').forEach(el => {
    el.style.overflow = 'hidden';
    el.style.position = 'relative';
  });

  window.print();
  setTimeout(() => {
    printDiv.remove();
    document.getElementById('class-summary-print-style')?.remove();
  }, 1000);
}

function _convertChartBarsToInlineStyles(container) {
  const allElements = container.querySelectorAll('*');
  allElements.forEach(el => {
    const computed = window.getComputedStyle(el);
    const bgColor = computed.backgroundColor;

    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      el.style.backgroundColor = bgColor;
    }

    if (el.classList.contains('rounded-t') && !el.style.height) {
      const height = computed.height;
      if (height && height !== 'auto' && height !== '0px') {
        el.style.height = height;
      }
    }

    if (el.classList.contains('rounded-full') && el.parentElement && el.parentElement.classList.contains('rounded-full')) {

      const borderRadius = computed.borderRadius;
      if (borderRadius) el.style.borderRadius = borderRadius;

      const h = computed.height;
      if (h && !el.style.height) el.style.height = h;
    }
  });
}



function loadItemAnalysis() {
  const examID = document.getElementById('ia-exam-select')?.value;
  if (!examID) return _iaWarnNoExam();
  const rd = document.getElementById('ia-result');
  rd.innerHTML = '<div class="ia-loading"><i class="fas fa-circle-notch fa-spin text-purple-500 text-2xl"></i><span>Menghitung analisis butir soal...</span></div>';
  google.script.run
    .withSuccessHandler(function(res) {
      if (!res.success) { rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Gagal analisis PG.</b> ${res.message}</div></div>`; return; }
      renderItemAnalysisTable(res, rd);
    })
    .withFailureHandler(err => { rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-bug"></i><div><b>Error:</b> ${err.message||String(err)}</div></div>`; })
    .getItemAnalysis(examID, currentUser.userID, currentUser.token);
}

function renderItemAnalysisTable(res, container) {
  const filteredData = res.data.filter(function(q){ return q.type === 'PG'; });

  const avgP = filteredData.length > 0 ? (filteredData.reduce(function(s,q){return s+(q.difficulty||0);},0)/filteredData.length).toFixed(2) : '-';
  const avgD = filteredData.length > 0 ? (filteredData.reduce(function(s,q){return s+(q.discrimination||0);},0)/filteredData.length).toFixed(2) : '-';

  const pBadge = function(p) {
    if (p===null) return '<span class="text-slate-400 text-xs">N/A</span>';
    if (p>0.70)  return '<div class="font-bold text-base text-green-600">'+p+'</div><div class="text-[10px] text-green-500 font-semibold">\uD83D\uDFE2 Mudah</div>';
    if (p>=0.30) return '<div class="font-bold text-base text-yellow-600">'+p+'</div><div class="text-[10px] text-yellow-500 font-semibold">\uD83D\uDFE1 Sedang</div>';
    return '<div class="font-bold text-base text-red-600">'+p+'</div><div class="text-[10px] text-red-500 font-semibold">\uD83D\uDD34 Sukar</div>';
  };
  const dBadge = function(d) {
    if (d===null) return '<span class="text-slate-400 text-xs">N/A</span>';
    if (d<0)    return '<div class="font-bold text-base text-red-700">'+d+'</div><div class="text-[10px] text-red-600 font-semibold">\u26D4 Negatif</div>';
    if (d<0.20) return '<div class="font-bold text-base text-orange-600">'+d+'</div><div class="text-[10px] text-orange-500 font-semibold">\uD83D\uDD34 Jelek</div>';
    if (d<0.30) return '<div class="font-bold text-base text-yellow-600">'+d+'</div><div class="text-[10px] text-yellow-500 font-semibold">\uD83D\uDFE1 Cukup</div>';
    if (d<0.40) return '<div class="font-bold text-base text-green-600">'+d+'</div><div class="text-[10px] text-green-500 font-semibold">\uD83D\uDFE2 Baik</div>';
    return '<div class="font-bold text-base text-emerald-600">'+d+'</div><div class="text-[10px] text-emerald-500 font-semibold">\uD83D\uDC8E Sangat Baik</div>';
  };

  const buildRows = function(dataArr) {
    return dataArr.map(function(q, idx) {
      var optH = '<span class="text-xs text-slate-400">-</span>';
      if (q.optionDist && q.optionDist.length > 0) {
        optH = q.optionDist.map(function(opt) {
          var bc = opt.isCorrect ? 'bg-emerald-400' : 'bg-slate-300';
          var lc = opt.isCorrect ? 'text-emerald-700 font-black' : 'text-slate-500';
          return '<div class="flex items-center gap-1 mb-0.5">'
            + '<span class="w-5 text-xs '+lc+'">'+opt.label+'</span>'
            + '<div class="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">'
            + '<div class="'+bc+' h-1.5 rounded-full" style="width:'+opt.pct+'%"></div></div>'
            + '<span class="text-[10px] text-slate-400 w-6 text-right">'+opt.count+'</span></div>';
        }).join('');
      }
      var benarHTML = (q.correctCount != null)
        ? '<span class="font-bold text-slate-800">'+q.correctCount+'</span>'
          + '<span class="text-slate-400 font-normal text-xs">/'+res.totalStudents+'</span>'
        : '<span class="text-slate-400">-</span>';
      var safeContent = String(q.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return '<tr class="hover:bg-purple-50/20">'
        + '<td class="p-4 text-center font-bold text-slate-400">'+(idx+1)+'</td>'
        + '<td class="p-4 max-w-xs"><p class="text-xs text-slate-600 line-clamp-2">'+safeContent+'</p></td>'
        + '<td class="p-4 text-center">'+benarHTML+'</td>'
        + '<td class="p-4 text-center">'+pBadge(q.difficulty)+'</td>'
        + '<td class="p-4 text-center">'+dBadge(q.discrimination)+'</td>'
        + '<td class="p-4 min-w-[140px]">'+optH+'</td>'
        + '</tr>';
    }).join('');
  };

  window._iaFilteredData    = filteredData;
  window._iaTotalStudents   = res.totalStudents;
  window._iaBuildRows       = buildRows;
  window._iaGroupSize       = res.groupSize;
  window._iaResForExport    = res;

  container.innerHTML = ''
    + '<div class="ia-stats-grid">'
    + '<div class="ia-stat-card" style="background:#eff6ff;border-color:#bfdbfe"><div class="ia-stat-val text-blue-700">'+res.totalStudents+'</div><div class="ia-stat-lbl text-blue-500">Peserta</div></div>'
    + '<div class="ia-stat-card" style="background:#eef2ff;border-color:#c7d2fe"><div class="ia-stat-val text-indigo-700">'+filteredData.length+'</div><div class="ia-stat-lbl text-indigo-500">Soal PG</div></div>'
    + '<div class="ia-stat-card" style="background:#fffbeb;border-color:#fde68a"><div class="ia-stat-val text-amber-700">'+avgP+'</div><div class="ia-stat-lbl text-amber-500">Rata-rata P</div></div>'
    + '<div class="ia-stat-card" style="background:#f0fdf4;border-color:#a7f3d0"><div class="ia-stat-val text-emerald-700">'+avgD+'</div><div class="ia-stat-lbl text-emerald-500">Rata-rata D</div></div>'
    + '</div>'
    + '<div class="ia-toolbar">'
    + '<span class="ia-toolbar-info"><i class="fas fa-list-ol text-purple-500"></i>Menampilkan <b>'+filteredData.length+'</b> soal PG &nbsp;&middot;&nbsp; Grup atas/bawah: '+res.groupSize+' siswa (27%)</span>'
    + '<div class="ia-toolbar-actions">'
    + '<button onclick="exportIAtoExcel()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"><i class="fas fa-file-excel"></i> Ekspor</button>'
    + '<button onclick="printIATable()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"><i class="fas fa-print"></i> Cetak</button>'
    + '</div>'
    + '</div>'
    + '<div class="ia-table-wrap">'
    + '<table class="table-modern w-full text-sm" id="ia-table"><thead><tr>'
    + '<th class="text-center w-10">No</th><th>Soal</th>'
    + '<th class="text-center">Benar</th><th class="text-center">P (Kesukaran)</th><th class="text-center">D (Daya Beda)</th>'
    + '<th class="text-center">Distribusi Pilihan</th>'
    + '</tr></thead><tbody id="ia-tbody">'+buildRows(filteredData)+'</tbody></table>'
    + '</div>'
    + '<p class="ia-toolbar-info mt-2 justify-end" id="ia-row-count">Menampilkan <b>'+filteredData.length+'</b> soal PG &nbsp;&middot;&nbsp; Grup atas/bawah: '+res.groupSize+' siswa (27% teratas &amp; terbawah)</p>';
  renderMath(container); 
}

function filterItemAnalysis(type) {
  const data = window._iaFilteredData || [];
  const buildRows = window._iaBuildRows;
  if (!buildRows) return;
  const filtered = type === 'ALL' ? data : data.filter(q => q.type === type);
  const tbody = document.getElementById('ia-tbody');
  const countEl = document.getElementById('ia-row-count');
  if (tbody) tbody.innerHTML = buildRows(filtered);
  renderMath(tbody); 
  if (countEl) countEl.innerHTML = 'Menampilkan '+filtered.length+' soal &nbsp;&middot;&nbsp; Grup atas/bawah: '+window._iaGroupSize+' siswa (27% teratas &amp; terbawah)';
}

function exportIAtoExcel() {
  var data = window._iaFilteredData || [];
  var res  = window._iaResForExport || {};
  if (!data.length) return Swal.fire({ icon:'info', title:'Tidak Ada Data', text:'Jalankan analisis PG terlebih dahulu.' });
  var rows = [['No','Soal','Benar','Total Peserta','Tingkat Kesukaran (P)','Kategori P','Daya Beda (D)','Kategori D']];
  data.forEach(function(q, i) {
    var catP = q.difficulty > 0.70 ? 'Mudah' : q.difficulty >= 0.30 ? 'Sedang' : 'Sukar';
    var catD = q.discrimination < 0 ? 'Negatif/Buang' : q.discrimination < 0.20 ? 'Jelek' : q.discrimination < 0.30 ? 'Cukup' : q.discrimination < 0.40 ? 'Baik' : 'Sangat Baik';
    rows.push([i+1, q.content, q.correctCount !== undefined ? q.correctCount : '-', res.totalStudents || '-', q.difficulty !== null ? q.difficulty : 'N/A', catP, q.discrimination !== null ? q.discrimination : 'N/A', catD]);
  });
  var subject = (res.examInfo && res.examInfo.subject) ? res.examInfo.subject : 'Unknown';
  var classes = (res.examInfo && res.examInfo.classes) ? res.examInfo.classes : '';
  var filename = 'Analisis PG ' + subject + ' - ' + classes;
  _downloadAsExcel(rows, filename);
}

function exportPGKtoExcel() {
  var data = window._pgkFilteredData || [];
  var res  = window._pgkResForExport || {};
  if (!data.length) return Swal.fire({ icon:'info', title:'Tidak Ada Data', text:'Jalankan analisis PG Kompleks terlebih dahulu.' });
  var HURUF = ['A','B','C','D','E'];
  var rows = [['No','Soal','Benar (Semua Tepat)','Total Peserta','Kunci Jawaban','Tingkat Kesukaran (P)','Kategori P','Daya Beda (D)','Kategori D']];
  data.forEach(function(q, i) {
    var keyDisp = '-';
    if (q.keyLetters && q.keyLetters.length) keyDisp = q.keyLetters.join(', ');
    else if (q.key) { try { var kArr = JSON.parse(q.key); keyDisp = Array.isArray(kArr) ? kArr.join(', ') : String(q.key); } catch(e) { keyDisp = String(q.key); } }
    var catP = q.difficulty > 0.70 ? 'Mudah' : q.difficulty >= 0.30 ? 'Sedang' : 'Sukar';
    var catD = q.discrimination < 0 ? 'Negatif/Buang' : q.discrimination < 0.20 ? 'Jelek' : q.discrimination < 0.30 ? 'Cukup' : q.discrimination < 0.40 ? 'Baik' : 'Sangat Baik';
    rows.push([i+1, q.content, q.correctCount !== undefined ? q.correctCount : '-', res.totalStudents || '-', keyDisp, q.difficulty !== null ? q.difficulty : 'N/A', catP, q.discrimination !== null ? q.discrimination : 'N/A', catD]);
  });
  _downloadAsExcel(rows, 'Analisis PG Kompleks ' + ((res.examInfo && res.examInfo.subject) ? res.examInfo.subject : '') + ' - ' + ((res.examInfo && res.examInfo.classes) ? res.examInfo.classes : ''));
}

function _downloadAsExcel(rows, filename) {
  try {
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(rows);
    if (rows[0]) {
      ws['!cols'] = rows[0].map(function(h, i) {
        if (i === 0) return { wch: 5 };
        if (i === 1) return { wch: 60 };
        return { wch: 20 };
      });
    }
    XLSX.utils.book_append_sheet(wb, ws, 'Analisis');
    XLSX.writeFile(wb, filename + '.xlsx');
    Swal.fire({ icon:'success', title:'Berhasil Diekspor!', html:'File <b>'+filename+'.xlsx</b> telah diunduh.', timer:2500, showConfirmButton:false });
  } catch(e) {
    Swal.fire({ icon:'error', title:'Gagal Ekspor', text: e.message || String(e) });
  }
}

function handleSetupAutoTimeoutTrigger() {
    Swal.fire({
        title: 'Mohon Tunggu',
        html: '<div class="text-sm text-slate-600">Menjadwalkan trigger auto-timeout harian...</div>',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: 'lp-swal' }
    });

    google.script.run
        .withFailureHandler(function(err) {
            Swal.fire({
                icon: 'error',
                title: 'Setup Gagal',
                html: `<div class="text-sm text-slate-600">${err && err.message ? err.message : err}</div>`,
                customClass: { popup: 'lp-swal' }
            });
        })
        .withSuccessHandler(function(res) {
            if (res && res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    html: `<div class="text-sm text-slate-600">${res.message}</div>`,
                    timer: 3000,
                    showConfirmButton: false,
                    customClass: { popup: 'lp-swal' }
                });
                loadConfigToForm();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    html: `<div class="text-sm text-slate-600">${(res && res.message) ? res.message : 'Unknown error'}</div>`,
                    customClass: { popup: 'lp-swal' }
                });
            }
        })
        .setupDailyTimeoutTrigger();
}

function printIATable() {
  var data = window._iaFilteredData || [];
  var res  = window._iaResForExport || {};
  if (!data.length) return Swal.fire({ icon:'info', title:'Tidak Ada Data', text:'Jalankan analisis PG terlebih dahulu.' });
  var subject = (res.examInfo && res.examInfo.subject) ? res.examInfo.subject : '-';
  var classes = (res.examInfo && res.examInfo.classes) ? res.examInfo.classes : '-';
  _printAnalysisTable({
    title: 'Analisis Butir Soal — Pilihan Ganda (PG)',
    subtitle: 'Mata Pelajaran: ' + subject + ' | Kelas: ' + classes,
    totalStudents: res.totalStudents,
    groupSize: res.groupSize,
    data: data,
    columns: ['No','Soal','Benar','P (Kesukaran)','Kategori P','D (Daya Beda)','Kategori D'],
    rowFn: function(q, idx) {
      var catP = q.difficulty > 0.70 ? 'Mudah' : q.difficulty >= 0.30 ? 'Sedang' : 'Sukar';
      var catD = q.discrimination < 0 ? 'Negatif/Buang' : q.discrimination < 0.20 ? 'Jelek' : q.discrimination < 0.30 ? 'Cukup' : q.discrimination < 0.40 ? 'Baik' : 'Sangat Baik';
      return '<td>'+(idx+1)+'</td><td style="max-width:300px;">'+prepContent(q.content)+'</td>'
        + '<td style="text-align:center;">'+(q.correctCount !== undefined ? q.correctCount+'/'+res.totalStudents : '-')+'</td>'
        + '<td style="text-align:center;">'+q.difficulty+'</td><td style="text-align:center;">'+catP+'</td>'
        + '<td style="text-align:center;">'+q.discrimination+'</td><td style="text-align:center;">'+catD+'</td>';
    }
  });
}

function printPGKTable() {
  var data = window._pgkFilteredData || [];
  var res  = window._pgkResForExport || {};
  if (!data.length) return Swal.fire({ icon:'info', title:'Tidak Ada Data', text:'Jalankan analisis PG Kompleks terlebih dahulu.' });
  var subject = (res.examInfo && res.examInfo.subject) ? res.examInfo.subject : '-';
  var classes = (res.examInfo && res.examInfo.classes) ? res.examInfo.classes : '-';
  _printAnalysisTable({
    title: 'Analisis Butir Soal — PG Kompleks (PGK)',
    subtitle: 'Mata Pelajaran: ' + subject + ' | Kelas: ' + classes,
    totalStudents: res.totalStudents,
    groupSize: res.groupSize,
    data: data,
    columns: ['No','Soal','Benar','Kunci Jawaban','P (Kesukaran)','Kategori P','D (Daya Beda)','Kategori D'],
    rowFn: function(q, idx) {
      var keyDisp = '-';
      if (q.keyLetters && q.keyLetters.length) keyDisp = q.keyLetters.join(', ');
      else if (q.key) { try { var kArr = JSON.parse(q.key); keyDisp = Array.isArray(kArr) ? kArr.join(', ') : String(q.key); } catch(e) { keyDisp = String(q.key); } }
      var catP = q.difficulty > 0.70 ? 'Mudah' : q.difficulty >= 0.30 ? 'Sedang' : 'Sukar';
      var catD = q.discrimination < 0 ? 'Negatif/Buang' : q.discrimination < 0.20 ? 'Jelek' : q.discrimination < 0.30 ? 'Cukup' : q.discrimination < 0.40 ? 'Baik' : 'Sangat Baik';
      return '<td>'+(idx+1)+'</td><td style="max-width:260px;">'+prepContent(q.content)+'</td>'
        + '<td style="text-align:center;">'+(q.correctCount !== undefined ? q.correctCount+'/'+res.totalStudents : '-')+'</td>'
        + '<td style="text-align:center;font-weight:bold;">'+keyDisp+'</td>'
        + '<td style="text-align:center;">'+q.difficulty+'</td><td style="text-align:center;">'+catP+'</td>'
        + '<td style="text-align:center;">'+q.discrimination+'</td><td style="text-align:center;">'+catD+'</td>';
    }
  });
}

function _openPrintBlobWindow(html, landscape) {
  try {
    var pageSize = landscape ? 'size:landscape;' : 'size:portrait;';
    var printCss = '<style>@media print{@page{' + pageSize + 'margin:10mm;}}</style>';
    var gasBlock = '  <!-- VERCEL: GAS URL injected at build time -->\n  <div id="__GAS_CONFIG__" data-gas-url="https://script.google.com/macros/s/AKfycbwHNjzGCBgrM3umOSYJzY1WO079ucscGUUbVUWphai44wOnIhTbu1hgXrh_7ummaVyb/exec" style="display:none"></div>\n  <!-- VERCEL: API client adapter \u2014 replaces google.script.run with fetch() -->\n  <script src="/api-client.js"><\/script>\n<\/head>';
    var fullHtml = html.replace(gasBlock, printCss + gasBlock);

    var iframeId = '__ia_print_frame__';
    var iframe = document.getElementById(iframeId);
    if (iframe) iframe.parentNode.removeChild(iframe);
    iframe = document.createElement('iframe');
    iframe.id   = iframeId;
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(iframe);

    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(fullHtml);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(function() {
      try {
        iframe.contentWindow.print();
      } catch(printErr) {
        Swal.fire({ icon:'error', title:'Gagal Mencetak', text: printErr.message || String(printErr) });
      }
      setTimeout(function() {
        if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 60000);
    }, 500);

  } catch(e) {
    Swal.fire({ icon:'error', title:'Gagal Membuka Cetak', text: e.message || String(e) });
  }
}

function _printAnalysisTable(opts) {
  var headerCells = opts.columns.map(function(c){ return '<th>'+c+'</th>'; }).join('');
  var bodyRows = opts.data.map(function(q, idx) {
    return '<tr>'+opts.rowFn(q, idx)+'</tr>';
  }).join('');

  var subtitleHtml = opts.subtitle ? '<p style="font-size:11px;font-weight:bold;color:#334155;margin:4px 0;">'+opts.subtitle+'</p>' : '';

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+opts.title+'</title>'
    + '<style>body{font-family:Arial,sans-serif;font-size:11px;color:#1e293b;margin:20px;}'
    + 'h2{font-size:14px;margin-bottom:4px;} p{margin:2px 0;color:#64748b;font-size:10px;}'
    + 'table{border-collapse:collapse;width:100%;margin-top:12px;}'
    + 'th{background:#f1f5f9;padding:6px 8px;border:1px solid #e2e8f0;text-align:left;font-size:10px;}'
    + 'td{padding:5px 8px;border:1px solid #e2e8f0;font-size:10px;vertical-align:top;}'
    + 'tr:nth-child(even){background:#f8fafc;}'
    + '</style>'
    + '<!-- VERCEL: GAS URL injected at build time -->'
    + '<div id="__GAS_CONFIG__" data-gas-url="https://script.google.com/macros/s/AKfycbwHNjzGCBgrM3umOSYJzY1WO079ucscGUUbVUWphai44wOnIhTbu1hgXrh_7ummaVyb/exec" style="display:none"></div>'
    + '<!-- VERCEL: API client adapter — replaces google.script.run with fetch() -->'
    + '<script src="/api-client.js"><\/script>'
    + '</head><body>'
    + '<h2>'+opts.title+'</h2>'
    + subtitleHtml
    + '<p>Peserta: '+opts.totalStudents+' &nbsp;&middot;&nbsp; Grup atas/bawah: '+opts.groupSize+' siswa (27%)</p>'
    + '<p>Dicetak: '+new Date().toLocaleString('id-ID')+'</p>'
    + '<table><thead><tr>'+headerCells+'</tr></thead><tbody>'+bodyRows+'</tbody></table>'
    + '</body></html>';

  _openPrintBlobWindow(html, true);
}

function openPrintAllStudentsModal() {
  var examID = (document.getElementById('ia-exam-select') || {}).value;
  if (!examID) return _iaWarnNoExam();
  var lsSel = document.getElementById('ia-student-select');
  if (!lsSel || lsSel.options.length <= 1) {
    return Swal.fire({ icon:'warning', title:'Tidak Ada Data Siswa', text:'Muat daftar siswa terlebih dahulu.' });
  }

  var options = Array.from(lsSel.options)
    .filter(function(o){ return o.value; })
    .map(function(o){
      return '<label style="display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;border-bottom:1px solid #f1f5f9;">'
        + '<input type="checkbox" value="'+o.value+'" class="print-chk" style="width:14px;height:14px;accent-color:#2563eb;">'
        + '<span style="font-size:12px;color:#1e293b;">'+o.text+'</span></label>';
    }).join('');

  Swal.fire({
    title: 'Pilih Siswa untuk Dicetak',
    width: 480,
    html: '<div style="text-align:left;">'
      + '<div style="margin-bottom:8px;display:flex;gap:6px;">'
      + '<button type="button" onclick="document.querySelectorAll(&quot;.print-chk&quot;).forEach(function(c){c.checked=true;})" '
        + 'style="padding:4px 10px;font-size:11px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#f8fafc;">Pilih Semua</button>'
      + '<button type="button" onclick="document.querySelectorAll(&quot;.print-chk&quot;).forEach(function(c){c.checked=false;})" '
        + 'style="padding:4px 10px;font-size:11px;border:1px solid #cbd5e1;border-radius:6px;cursor:pointer;background:#f8fafc;">Hapus Pilihan</button>'
      + '</div>'
      + '<div style="max-height:280px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;">'
      + options + '</div></div>',
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-print"></i>&nbsp;Cetak Terpilih',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#dc2626'
  }).then(function(r) {
    if (!r.isConfirmed) return;
    var checked = Array.from(document.querySelectorAll('.print-chk:checked')).map(function(c){ return c.value; });
    if (!checked.length) return Swal.fire({ icon:'info', title:'Tidak Ada Siswa Dipilih', text:'Centang minimal satu siswa.' });
    _batchPrintStudentReports(examID, checked);
  });
}

// Bug 1 fix: sequential fetch (preserves order) + Bug 1: correct GAS fn name getStudentDetailReport
function _batchPrintStudentReports(examID, studentIds) {
  var total     = studentIds.length;
  var collected = [];

  Swal.fire({
    title: 'Memuat Laporan…',
    html: '<div id="bp-legacy-text" style="font-size:13px;color:#475569;margin-bottom:8px;">Menyiapkan (0 / '+total+')…</div>'
      + '<div style="background:#e2e8f0;border-radius:8px;height:10px;overflow:hidden;">'
      + '<div id="bp-legacy-bar" style="height:10px;background:#dc2626;width:0%;border-radius:8px;transition:width .3s;"></div>'
      + '</div>',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: function() { Swal.showLoading(); }
  });

  function fetchNext(idx) {
    if (idx >= total) {
      var succeeded = collected.filter(function(r){ return r && r.success; });
      Swal.close();
      if (!succeeded.length) {
        return Swal.fire({ icon:'error', title:'Gagal Memuat', text:'Tidak ada laporan yang berhasil dimuat.' });
      }
      _openBatchPrintWindow(succeeded);
      return;
    }
    var pct = Math.round(idx / total * 100);
    var bar = document.getElementById('bp-legacy-bar');
    var txt = document.getElementById('bp-legacy-text');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.textContent = 'Memuat laporan ' + idx + ' / ' + total + '…';

    google.script.run
      .withSuccessHandler(function(res) {
        collected.push(res || null);
        fetchNext(idx + 1);
      })
      .withFailureHandler(function() {
        collected.push(null);
        fetchNext(idx + 1);
      })
      // Bug 1 fix: was getStudentReport — correct name is getStudentDetailReport
      .getStudentDetailReport(examID, studentIds[idx], currentUser.userID, currentUser.token);
  }

  fetchNext(0);
}

// Bug 2 fix: use _buildStudentPrintBody (has inline CSS) instead of buildStudentReportHTML (Tailwind-only)
function _openBatchPrintWindow(reports) {
  if (!reports.length) return Swal.fire({ icon:'error', title:'Gagal', text:'Tidak ada laporan berhasil dimuat.' });

  var pages = reports.map(function(res, i) {
    var body = '';
    try { body = _buildStudentPrintBody(res); } catch(e) { body = '<p style="color:red;">Error: '+e.message+'</p>'; }
    return '<div class="'+(i < reports.length - 1 ? 'page-break' : '')+'">'+body+'</div>';
  }).join('');

  var fullHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<title>Cetak Laporan Siswa</title>'
    + '<style>'+_STUDENT_PRINT_CSS+'</style>'
    + '</head><body>'
    + pages
    + '</body></html>';

  _openPrintBlobWindow(fullHtml, false);
}

function loadPGKAnalysis() {
  const examID = document.getElementById('ia-exam-select')?.value;
  if (!examID) return _iaWarnNoExam();
  const rd = document.getElementById('pgk-result');
  if (!rd) return;
  rd.innerHTML = `<div class="ia-loading"><i class="fas fa-circle-notch fa-spin text-indigo-500 text-2xl"></i><span>Menghitung analisis PG Kompleks...</span></div>`;
  google.script.run
    .withSuccessHandler(function(res) {
      if (!res.success) { rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Gagal analisis PGK.</b> ${res.message}</div></div>`; return; }
      renderPGKAnalysisTable(res, rd);
    })
    .withFailureHandler(err => { rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-bug"></i><div><b>Error:</b> ${err.message||String(err)}</div></div>`; })
    .getItemAnalysis(examID, currentUser.userID, currentUser.token);
}

function renderPGKAnalysisTable(res, container) {
  var filteredData = res.data.filter(function(q){ return q.type === 'PG_KOMPLEKS'; });

  if (filteredData.length === 0) {
    container.innerHTML = '<div class="text-center py-12 text-slate-400"><i class="fas fa-inbox text-3xl mb-3 block"></i><p class="font-medium">Tidak ada soal PG Kompleks pada ujian ini.</p></div>';
    return;
  }

  var avgP = filteredData.length > 0 ? (filteredData.reduce(function(s,q){return s+(q.difficulty||0);},0)/filteredData.length).toFixed(2) : '-';
  var avgD = filteredData.length > 0 ? (filteredData.reduce(function(s,q){return s+(q.discrimination||0);},0)/filteredData.length).toFixed(2) : '-';

  var pBadge = function(p) {
    if (p===null) return '<span class="text-slate-400 text-xs">N/A</span>';
    if (p>0.70)  return '<div class="font-bold text-base text-green-600">'+p+'</div><div class="text-[10px] text-green-500 font-semibold">\uD83D\uDFE2 Mudah</div>';
    if (p>=0.30) return '<div class="font-bold text-base text-yellow-600">'+p+'</div><div class="text-[10px] text-yellow-500 font-semibold">\uD83D\uDFE1 Sedang</div>';
    return '<div class="font-bold text-base text-red-600">'+p+'</div><div class="text-[10px] text-red-500 font-semibold">\uD83D\uDD34 Sukar</div>';
  };
  var dBadge = function(d) {
    if (d===null) return '<span class="text-slate-400 text-xs">N/A</span>';
    if (d<0)    return '<div class="font-bold text-base text-red-700">'+d+'</div><div class="text-[10px] text-red-600 font-semibold">\u26D4 Negatif</div>';
    if (d<0.20) return '<div class="font-bold text-base text-orange-600">'+d+'</div><div class="text-[10px] text-orange-500 font-semibold">\uD83D\uDD34 Jelek</div>';
    if (d<0.30) return '<div class="font-bold text-base text-yellow-600">'+d+'</div><div class="text-[10px] text-yellow-500 font-semibold">\uD83D\uDFE1 Cukup</div>';
    if (d<0.40) return '<div class="font-bold text-base text-green-600">'+d+'</div><div class="text-[10px] text-green-500 font-semibold">\uD83D\uDFE2 Baik</div>';
    return '<div class="font-bold text-base text-emerald-600">'+d+'</div><div class="text-[10px] text-emerald-500 font-semibold">\uD83D\uDC8E Sangat Baik</div>';
  };

  var HURUF = ['A','B','C','D','E'];

  var buildRows = function(dataArr) {
    return dataArr.map(function(q, idx) {
      var keyDisplay = '-';
      if (q.keyLetters && Array.isArray(q.keyLetters) && q.keyLetters.length > 0) {
        keyDisplay = q.keyLetters.join(', ');
      } else if (q.key) {
        try {
          var parsed = JSON.parse(q.key);
          if (Array.isArray(parsed)) {
            keyDisplay = parsed.map(function(k) {
              var idx2 = HURUF.indexOf(String(k).trim().toUpperCase());
              return idx2 !== -1 ? HURUF[idx2] : String(k).trim();
            }).join(', ');
          } else { keyDisplay = String(q.key); }
        } catch(e) {
          keyDisplay = String(q.key).split(',').map(function(k){ return k.trim(); }).join(', ');
        }
      }

      var benarHTML = (q.correctCount !== undefined)
        ? '<span class="font-bold text-slate-800">'+q.correctCount+'</span>'
          + '<span class="text-slate-400 font-normal text-xs">/'+res.totalStudents+'</span>'
        : '<span class="text-slate-400">-</span>';

      return '<tr class="hover:bg-indigo-50/20">'
        + '<td class="p-4 text-center font-bold text-slate-400">'+(idx+1)+'</td>'
        + '<td class="p-4 max-w-xs"><div class="text-xs text-slate-600 line-clamp-2">'+prepContent(q.content)+'</div></td>'
        + '<td class="p-4 text-center">'+benarHTML+'</td>'
        + '<td class="p-4 text-center">'+pBadge(q.difficulty)+'</td>'
        + '<td class="p-4 text-center">'+dBadge(q.discrimination)+'</td>'
        + '<td class="p-4 text-center">'
          + '<div class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 inline-block">'+keyDisplay+'</div>'
          + '<div class="text-[10px] text-slate-400 mt-1">semua harus dipilih</div>'
        + '</td>'
        + '</tr>';
    }).join('');
  };

  window._pgkFilteredData   = filteredData;
  window._pgkTotalStudents  = res.totalStudents;
  window._pgkBuildRows      = buildRows;
  window._pgkGroupSize      = res.groupSize;
  window._pgkResForExport   = res;

  container.innerHTML = ''
    + '<div class="ia-stats-grid">'
    + '<div class="ia-stat-card" style="background:#eff6ff;border-color:#bfdbfe"><div class="ia-stat-val text-blue-700">'+res.totalStudents+'</div><div class="ia-stat-lbl text-blue-500">Peserta</div></div>'
    + '<div class="ia-stat-card" style="background:#eef2ff;border-color:#c7d2fe"><div class="ia-stat-val text-indigo-700">'+filteredData.length+'</div><div class="ia-stat-lbl text-indigo-500">Soal PGK</div></div>'
    + '<div class="ia-stat-card" style="background:#fffbeb;border-color:#fde68a"><div class="ia-stat-val text-amber-700">'+avgP+'</div><div class="ia-stat-lbl text-amber-500">Rata-rata P</div></div>'
    + '<div class="ia-stat-card" style="background:#f0fdf4;border-color:#a7f3d0"><div class="ia-stat-val text-emerald-700">'+avgD+'</div><div class="ia-stat-lbl text-emerald-500">Rata-rata D</div></div>'
    + '</div>'
    + '<div class="ia-toolbar">'
    + '<span class="ia-toolbar-info"><i class="fas fa-list-check text-indigo-500"></i>Menampilkan <b>'+filteredData.length+'</b> soal PGK &nbsp;&middot;&nbsp; Grup atas/bawah: '+res.groupSize+' siswa (27%)</span>'
    + '<div class="ia-toolbar-actions">'
    + '<button onclick="exportPGKtoExcel()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"><i class="fas fa-file-excel"></i> Ekspor</button>'
    + '<button onclick="printPGKTable()" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"><i class="fas fa-print"></i> Cetak</button>'
    + '</div>'
    + '</div>'
    + '<div class="ia-table-wrap">'
    + '<table class="table-modern w-full text-sm" id="pgk-table"><thead><tr>'
    + '<th class="text-center w-10">No</th><th>Soal</th>'
    + '<th class="text-center">Benar (Semua Tepat)</th><th class="text-center">P (Kesukaran)</th><th class="text-center">D (Daya Beda)</th>'
    + '<th class="text-center">Kunci Jawaban</th>'
    + '</tr></thead><tbody id="pgk-tbody">'+buildRows(filteredData)+'</tbody></table>'
    + '</div>';
  renderMath(container);
}

  function loadBSAnalysis() {
    const examID = document.getElementById('ia-exam-select')?.value;
    if (!examID) {
      return _iaWarnNoExam();
    }
    const rd = document.getElementById('bs-result');
    if (!rd) return;
  
    rd.innerHTML = `
      <div class="ia-loading">
        <i class="fas fa-circle-notch fa-spin text-teal-500 text-2xl"></i>
        <span>Menghitung analisis Benar/Salah...</span>
      </div>`;
  
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.success) {
          rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Gagal memuat analisis BS.</b> ${res?.message || 'Terjadi kesalahan.'}</div></div>`;
          return;
        }
        renderBSAnalysisPanel(res, rd);
      })
      .withFailureHandler(err => {
        if (rd) rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-bug"></i><div><b>Error:</b> ${err.message || String(err)}</div></div>`;
      })
      .getBSItemAnalysis(examID, currentUser.userID, currentUser.token);
  }
  
  function renderBSAnalysisPanel(res, container) {
    window._bsAnalysisData = res;
  
    const s  = res.summary;
    const D  = s.discrimination;
    const P  = s.difficulty;
    const bermasalahPct = res.totalStatements > 0
      ? Math.round(s.totalBermasalah / res.totalStatements * 100) : 0;

    const pBadge = (pVal, size = 'normal') => {
      const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
      if (pVal > 0.70) return `<span class="${sz} rounded-full bg-green-100 text-green-700 font-bold border border-green-200">🟢 ${pVal.toFixed(3)} Mudah</span>`;
      if (pVal >= 0.30) return `<span class="${sz} rounded-full bg-yellow-100 text-yellow-700 font-bold border border-yellow-200">🟡 ${pVal.toFixed(3)} Sedang</span>`;
      return `<span class="${sz} rounded-full bg-red-100 text-red-700 font-bold border border-red-200">🔴 ${pVal.toFixed(3)} Sukar</span>`;
    };
  
    const dBadge = (dVal, size = 'normal') => {
      const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
      if (dVal < 0)    return `<span class="${sz} rounded-full bg-red-900/10 text-red-800 font-bold border border-red-300">⛔ ${dVal.toFixed(3)} Buang</span>`;
      if (dVal < 0.20) return `<span class="${sz} rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">🔴 ${dVal.toFixed(3)} Jelek</span>`;
      if (dVal < 0.30) return `<span class="${sz} rounded-full bg-yellow-100 text-yellow-700 font-bold border border-yellow-200">🟡 ${dVal.toFixed(3)} Cukup</span>`;
      if (dVal < 0.40) return `<span class="${sz} rounded-full bg-green-100 text-green-700 font-bold border border-green-200">🟢 ${dVal.toFixed(3)} Baik</span>`;
      return `<span class="${sz} rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">💎 ${dVal.toFixed(3)} Sangat Baik</span>`;
    };
  
    const rowQuality = (stmt) => {
      if (stmt.D < 0 || stmt.P < 0.20) return 'bg-red-50 border-l-4 border-red-400';
      if (stmt.D < 0.20 || stmt.P < 0.30) return 'bg-orange-50/60 border-l-4 border-orange-300';
      if (stmt.D >= 0.40 && stmt.P >= 0.30 && stmt.P <= 0.70) return 'bg-emerald-50/40 border-l-4 border-emerald-300';
      return 'border-l-4 border-slate-200';
    };
  
    const accordionCards = res.data.map((q, qi) => {
      const hasProblems = q.badStatements > 0;
      const headerBg    = hasProblems ? 'bg-orange-50 border-orange-200' : 'bg-teal-50 border-teal-200';
      const iconColor   = hasProblems ? 'text-orange-500' : 'text-teal-500';
  
      const stmtRows = q.statements.map((st, si) => {

        const pct = res.totalStudents > 0 ? Math.round(st.correctCount / res.totalStudents * 100) : 0;
        const barColor = pct >= 70 ? 'bg-green-400' : pct >= 30 ? 'bg-yellow-400' : 'bg-red-400';
  
        const wrongBtn = st.wrongCount > 0
          ? `<button onclick="showBSWrongStudentsModal(${qi}, ${si})"
              class="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg
                      bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition">
              <i class="fas fa-user-times"></i>${st.wrongCount} siswa keliru
            </button>`
          : `<span class="text-xs text-emerald-600 font-semibold"><i class="fas fa-check-circle mr-1"></i>Semua Benar</span>`;
  
        return `
          <tr class="${rowQuality(st)} transition hover:brightness-95">
            <td class="p-3 text-center text-xs font-bold text-slate-400 w-10">${si + 1}</td>
            <td class="p-3 text-xs text-slate-700 max-w-xs leading-relaxed">${st.text}</td>
            <td class="p-3 text-center">
              <span class="px-2.5 py-1 rounded-full text-xs font-black
                ${st.keyAnswer === 'Benar' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}">
                ${st.keyAnswer}
              </span>
            </td>
            <td class="p-3 w-32">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div class="${barColor} h-2 rounded-full transition-all" style="width:${pct}%"></div>
                </div>
                <span class="text-xs font-bold text-slate-600 w-8 text-right">${pct}%</span>
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5">${st.correctCount}/${res.totalStudents} benar</div>
            </td>
            <td class="p-3 text-center">${pBadge(st.P, 'sm')}</td>
            <td class="p-3 text-center">${dBadge(st.D, 'sm')}</td>
            <td class="p-3 text-center">${wrongBtn}</td>
          </tr>`;
      }).join('');
  
      return `
        <div class="rounded-xl border ${headerBg} overflow-hidden mb-3 shadow-sm">
          <!-- Header soal -->
          <button onclick="toggleBSQuestion('bsq-${qi}')"
            class="w-full flex items-start justify-between p-4 text-left hover:brightness-95 transition">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/80 ${iconColor} flex items-center justify-center font-black text-sm border border-current/20">
                ${qi + 1}
              </span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-700 line-clamp-2">${prepContent(q.content) || '(soal tanpa teks pembuka)'}</div>
                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  <span class="text-[10px] text-slate-400">${q.totalStatements} pernyataan &nbsp;·&nbsp; Bobot ${q.weight} poin</span>
                  ${hasProblems ? `<span class="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">⚠ ${q.badStatements} pernyataan bermasalah</span>` : '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Semua pernyataan berkualitas</span>'}
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                  ${pBadge(q.avgP, 'sm')}
                  ${dBadge(q.avgD, 'sm')}
                </div>
              </div>
            </div>
            <i class="fas fa-chevron-down ${iconColor} mt-1 flex-shrink-0 transition-transform" id="icon-bsq-${qi}"></i>
          </button>
  
          <!-- Detail pernyataan (collapsed by default) -->
          <div id="bsq-${qi}" class="hidden border-t border-current/10">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-white/60">
                    <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-10">No</th>
                    <th class="p-3 text-left text-[10px] font-black uppercase text-slate-400">Pernyataan</th>
                    <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-20">Kunci</th>
                    <th class="p-3 text-left text-[10px] font-black uppercase text-slate-400 w-36">% Benar</th>
                    <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-28">P (Kesukaran)</th>
                    <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-32">D (Daya Beda)</th>
                    <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-36">Siswa Keliru</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">${stmtRows}</tbody>
              </table>
            </div>
          </div>
        </div>`;
    }).join('');
  
    container.innerHTML = `
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="rounded-xl border border-teal-100 bg-teal-50 p-4 text-center">
          <div class="text-3xl font-black text-teal-700">${res.totalStudents}</div>
          <div class="text-xs font-semibold text-teal-500 mt-0.5">Peserta Ujian</div>
        </div>
        <div class="rounded-xl border border-purple-100 bg-purple-50 p-4 text-center">
          <div class="text-3xl font-black text-purple-700">${res.totalBSQuestions}</div>
          <div class="text-xs font-semibold text-purple-500 mt-0.5">Soal Benar/Salah</div>
          <div class="text-[10px] text-purple-400">${res.totalStatements} total pernyataan</div>
        </div>
        <div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
          <div class="flex justify-center gap-2 text-sm font-bold mb-1">
            <span class="text-green-600">${P.mudah}M</span>
            <span class="text-yellow-600">${P.sedang}S</span>
            <span class="text-red-600">${P.sukar}SK</span>
          </div>
          <div class="text-xs font-semibold text-amber-600">Distribusi Kesukaran (P)</div>
          <div class="text-[10px] text-amber-400">Mudah · Sedang · Sukar</div>
        </div>
        <div class="rounded-xl border ${s.totalBermasalah > 0 ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50'} p-4 text-center">
          <div class="text-3xl font-black ${s.totalBermasalah > 0 ? 'text-red-600' : 'text-emerald-600'}">${s.totalBermasalah}</div>
          <div class="text-xs font-semibold ${s.totalBermasalah > 0 ? 'text-red-500' : 'text-emerald-500'} mt-0.5">Pernyataan Bermasalah</div>
          <div class="text-[10px] ${s.totalBermasalah > 0 ? 'text-red-400' : 'text-emerald-400'}">${bermasalahPct}% dari total</div>
        </div>
      </div>
  
      <!-- Distribusi Daya Beda mini-chart -->
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-5">
        <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
          <i class="fas fa-chart-bar mr-1.5"></i>Distribusi Daya Beda (D) — Semua Pernyataan
        </p>
        <div class="flex items-end gap-2 pt-6">
          ${[
            { label: 'Negatif', count: D.negatif,   color: 'bg-red-600',     text: 'text-red-700'     },
            { label: 'Jelek',   count: D.jelek,     color: 'bg-orange-400',  text: 'text-orange-700'  },
            { label: 'Cukup',   count: D.cukup,     color: 'bg-yellow-400',  text: 'text-yellow-700'  },
            { label: 'Baik',    count: D.baik,      color: 'bg-green-400',   text: 'text-green-700'   },
            { label: 'Sgt Baik',count: D.sangatBaik,color: 'bg-emerald-500', text: 'text-emerald-700' }
          ].map(item => {
            const maxVal = Math.max(D.negatif, D.jelek, D.cukup, D.baik, D.sangatBaik, 1);
            const heightPct = Math.round(item.count / maxVal * 100);
            return `<div class="flex flex-col items-center gap-1 flex-1">
              <span class="text-xs font-black ${item.text}">${item.count}</span>
              <div class="w-full ${item.color} rounded-t" style="height:${Math.max(4, heightPct * 0.48)}px"></div>
              <span class="text-[9px] text-slate-500 font-semibold leading-tight text-center">${item.label}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
  
      <!-- Tombol Ekspor -->
      <div class="flex flex-wrap gap-2 mb-5">
        <button onclick="exportBSAnalysisToExcel()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition">
          <i class="fas fa-file-excel"></i> Ekspor Excel
        </button>
        <button onclick="printBSAnalysis()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-lg shadow transition">
          <i class="fas fa-print"></i> Cetak / PDF
        </button>
        <span class="flex items-center text-xs text-slate-400 ml-1">
          <i class="fas fa-info-circle mr-1"></i>
          Grup atas/bawah: ${res.groupSize} siswa (27%)
        </span>
      </div>
  
      <!-- Kartu Soal (accordion) -->
      <div id="bs-accordion">${accordionCards}</div>
  
      <p class="text-xs text-slate-400 text-right mt-3">
        Ujian: <b>${res.examInfo.subject}</b> — Kelas ${res.examInfo.classes} &nbsp;·&nbsp;
        ${res.totalStudents} peserta
      </p>`;
    renderMath(container);
  }
  
  function toggleBSQuestion(id) {
    const panel = document.getElementById(id);
    const idx   = id.replace('bsq-', '');
    const icon  = document.getElementById('icon-bsq-' + idx);
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !isHidden);
    if (icon) {
      icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }
  
  function showBSWrongStudentsModal(questionIdx, stmtIdx) {
    const res = window._bsAnalysisData;
    if (!res || !res.data[questionIdx]) return;
  
    const q    = res.data[questionIdx];
    const stmt = q.statements[stmtIdx];
    if (!stmt) return;
  
    const rows = stmt.wrongStudents.length === 0
      ? '<tr><td colspan="4" class="text-center p-6 text-slate-400"><i class="fas fa-check-circle text-green-500 mr-2"></i>Semua siswa menjawab benar!</td></tr>'
      : stmt.wrongStudents.map((s, i) => `
          <tr class="hover:bg-red-50/30">
            <td class="p-3 text-center text-xs text-slate-400">${i + 1}</td>
            <td class="p-3 text-sm font-semibold text-slate-700">${s.name}</td>
            <td class="p-3 text-center text-xs text-slate-500">${s.cls}</td>
            <td class="p-3 text-center">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                ${s.given}
              </span>
            </td>
            <td class="p-3 text-center text-xs font-bold text-slate-600">${s.score.toFixed(1)}</td>
          </tr>`
        ).join('');
  
    const pctBenar = res.totalStudents > 0
      ? Math.round(stmt.correctCount / res.totalStudents * 100) : 0;
  
    Swal.fire({
      title: `Soal ${q.questionNumber} · Pernyataan ${stmtIdx + 1}`,
      width: '700px',
      html: `
        <div class="text-left">
          <div class="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200 text-sm text-slate-600 leading-relaxed">
            "${stmt.text}"
          </div>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              <i class="fas fa-key mr-1"></i>Kunci: ${stmt.keyAnswer}
            </span>
            <span class="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-semibold border border-green-200">
              ✓ ${stmt.correctCount} benar (${pctBenar}%)
            </span>
            <span class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-semibold border border-red-200">
              ✗ ${stmt.wrongCount} keliru
            </span>
          </div>
          <div class="overflow-auto max-h-72 rounded-xl border border-slate-200">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 sticky top-0">
                <tr>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase w-8">No</th>
                  <th class="p-3 text-left text-xs font-black text-slate-400 uppercase">Nama Siswa</th>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase w-24">Kelas</th>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase w-28">Jawaban Diberi</th>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase w-20">Skor Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">${rows}</tbody>
            </table>
          </div>
          ${stmt.wrongStudents.length > 0 ? `
          <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <i class="fas fa-lightbulb mr-1.5"></i>
            <b>Rekomendasi:</b>
            ${stmt.D < 0
              ? 'Pernyataan ini memiliki Daya Beda negatif — siswa pandai justru lebih banyak salah. Perlu direvisi atau dihapus.'
              : stmt.D < 0.20
              ? 'Daya Beda rendah. Pertimbangkan untuk memperjelas kalimat pernyataan agar tidak ambigu.'
              : `${stmt.wrongCount} siswa ini kemungkinan belum memahami konsep terkait pernyataan tersebut. Pertimbangkan remedial/penjelasan ulang.`
            }
          </div>` : ''}
        </div>`,
      showConfirmButton: true,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#6366f1'
    });
  }
  
  function exportBSAnalysisToExcel() {
    const res = window._bsAnalysisData;
    if (!res) return Swal.fire({ icon: 'warning', title: 'Tidak Ada Data', text: 'Jalankan analisis terlebih dahulu.' });
  
    try {
      const wb = XLSX.utils.book_new();
  
      const summaryRows = [
        ['ANALISIS BUTIR SOAL — BENAR/SALAH'],
        [''],
        ['Ujian',       res.examInfo.subject],
        ['Kelas',       res.examInfo.classes],
        ['Passing Grade', res.examInfo.passingGrade],
        ['Peserta',     res.totalStudents],
        ['Grup Atas/Bawah', `${res.groupSize} siswa (27%)`],
        ['Total Soal BS', res.totalBSQuestions],
        ['Total Pernyataan', res.totalStatements],
        [''],
        ['=== DISTRIBUSI KESUKARAN (P) ==='],
        ['Mudah  (P > 0.70)',    res.summary.difficulty.mudah],
        ['Sedang (0.30–0.70)',   res.summary.difficulty.sedang],
        ['Sukar  (P < 0.30)',    res.summary.difficulty.sukar],
        [''],
        ['=== DISTRIBUSI DAYA BEDA (D) ==='],
        ['Sangat Baik (D ≥ 0.40)', res.summary.discrimination.sangatBaik],
        ['Baik        (0.30–0.39)', res.summary.discrimination.baik],
        ['Cukup       (0.20–0.29)', res.summary.discrimination.cukup],
        ['Jelek       (0.00–0.19)', res.summary.discrimination.jelek],
        ['Negatif     (D < 0)',     res.summary.discrimination.negatif],
        [''],
        ['Total Pernyataan Bermasalah (D<0.20 atau P<0.20)', res.summary.totalBermasalah]
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 40 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
  
      const detailHeader = [
        'No Soal', 'ID Soal', 'Teks Soal (Pembuka)',
        'No Pernyataan', 'Teks Pernyataan',
        'Kunci Jawaban', 'Jumlah Benar', 'Jumlah Salah', '% Benar',
        'P (Kesukaran)', 'Kategori P',
        'D (Daya Beda)', 'Kategori D',
        'Grup Atas Benar', 'Grup Bawah Benar',
        'Status'
      ];
      const detailRows = [detailHeader];
  
      res.data.forEach(q => {
        q.statements.forEach(st => {
          const pct = res.totalStudents > 0 ? Math.round(st.correctCount / res.totalStudents * 100) : 0;
          let status = 'Baik';
          if (st.D < 0) status = 'BUANG — D Negatif';
          else if (st.D < 0.20 && st.P < 0.30) status = 'PERLU REVISI — D Jelek & Sukar';
          else if (st.D < 0.20) status = 'PERLU REVISI — D Jelek';
          else if (st.P < 0.20) status = 'PERLU REVISI — Terlalu Sukar';
  
          detailRows.push([
            q.questionNumber,
            q.questionId,
            q.content.substring(0, 80),
            st.index + 1,
            st.text.substring(0, 120),
            st.keyAnswer,
            st.correctCount,
            st.wrongCount,
            pct + '%',
            st.P,
            st.diffLabel.label,
            st.D,
            st.discLabel.label,
            st.upperCorrect,
            st.lowerCorrect,
            status
          ]);
        });
      });
  
      const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
      wsDetail['!cols'] = [
        { wch: 8 }, { wch: 20 }, { wch: 40 }, { wch: 12 }, { wch: 50 },
        { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 8 },
        { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 16 },
        { wch: 14 }, { wch: 14 }, { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Analisis Pernyataan');
  
      const wrongHeader = ['No Soal', 'No Pernyataan', 'Teks Pernyataan (Singkat)', 'Kunci', 'Nama Siswa', 'Kelas', 'Jawaban Diberi', 'Skor Total'];
      const wrongRows   = [wrongHeader];
  
      res.data.forEach(q => {
        q.statements.forEach(st => {
          if (st.wrongStudents.length === 0) return;
          st.wrongStudents.forEach(s => {
            wrongRows.push([
              q.questionNumber,
              st.index + 1,
              st.text.substring(0, 60),
              st.keyAnswer,
              s.name,
              s.cls,
              s.given,
              s.score
            ]);
          });
        });
      });
  
      if (wrongRows.length > 1) {
        const wsWrong = XLSX.utils.aoa_to_sheet(wrongRows);
        wsWrong['!cols'] = [
          { wch: 8 }, { wch: 12 }, { wch: 50 }, { wch: 10 },
          { wch: 28 }, { wch: 10 }, { wch: 18 }, { wch: 10 }
        ];
        XLSX.utils.book_append_sheet(wb, wsWrong, 'Daftar Siswa Keliru');
      }
  
      const fname = `AnalisisBS_${res.examInfo.subject.replace(/\s+/g,'_')}_${res.examInfo.classes.replace(/,/g,'')}_${new Date().toLocaleDateString('id-ID').replace(/\//g,'-')}.xlsx`;
      XLSX.writeFile(wb, fname);
  
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: `File "${fname}" berhasil diunduh.`, timer: 2500, showConfirmButton: false });
  
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'Gagal Ekspor', text: e.message || String(e) });
    }
  }
  
  // Bug 11 fix: was window.print() directly (pollutes main page). Now uses _openPrintBlobWindow (safe iframe).
  function printBSAnalysis() {
    const res = window._bsAnalysisData;
    if (!res) return Swal.fire({ icon: 'warning', title: 'Tidak Ada Data', text: 'Jalankan analisis terlebih dahulu.' });

    const printCss = 'body{font-family:Arial,sans-serif;font-size:11px;color:#1e293b;margin:20px;}'
      + 'h2{font-size:14px;margin-bottom:4px;color:#1e293b;}'
      + 'p{margin:2px 0;font-size:10px;color:#64748b;}'
      + 'table{border-collapse:collapse;width:100%;margin-top:10px;margin-bottom:16px;}'
      + 'th{background:#f1f5f9;padding:6px 8px;border:1px solid #e2e8f0;text-align:left;font-size:10px;font-weight:700;}'
      + 'td{padding:5px 8px;border:1px solid #e2e8f0;font-size:10px;vertical-align:top;}'
      + 'tr:nth-child(even){background:#f8fafc;}'
      + '.soal-hdr{background:#f8fafc!important;font-weight:bold!important;}'
      + '.row-buang{background:#fef2f2!important;} .row-warn{background:#fff7ed!important;}';

    let rows = '';
    res.data.forEach(q => {
      rows += '<tr class="soal-hdr"><td colspan="9" style="border:1px solid #e2e8f0;padding:6px 8px;font-weight:bold;font-size:10px;color:#1e293b">'
        + 'Soal ' + q.questionNumber + ': ' + _esc(q.content.substring(0, 100)) + (q.content.length > 100 ? '…' : '')
        + '</td></tr>';
      q.statements.forEach(st => {
        const pct = res.totalStudents > 0 ? Math.round(st.correctCount / res.totalStudents * 100) : 0;
        let rek = 'Pertahankan';
        if (st.D < 0)       rek = 'BUANG — D Negatif';
        else if (st.D < 0.20) rek = 'Revisi Pernyataan';
        else if (st.P < 0.20) rek = 'Terlalu Sukar';
        else if (st.P > 0.90) rek = 'Terlalu Mudah';
        const rowCls = (st.D < 0 || st.P < 0.20) ? 'class="row-buang"' : st.D < 0.20 ? 'class="row-warn"' : '';
        rows += '<tr ' + rowCls + '>'
          + '<td style="text-align:center;color:#94a3b8">' + (st.index + 1) + '</td>'
          + '<td style="max-width:200px">' + _esc(st.text.substring(0, 80)) + '</td>'
          + '<td style="text-align:center;font-weight:bold">' + _esc(st.keyAnswer) + '</td>'
          + '<td style="text-align:center">' + pct + '%</td>'
          + '<td style="text-align:center;font-weight:bold">' + st.P.toFixed(3) + '</td>'
          + '<td style="text-align:center">' + _esc(st.diffLabel.label) + '</td>'
          + '<td style="text-align:center;font-weight:bold">' + st.D.toFixed(3) + '</td>'
          + '<td style="text-align:center">' + _esc(st.discLabel.label) + '</td>'
          + '<td style="text-align:center;font-size:9px">' + _esc(rek) + '</td>'
          + '</tr>';
      });
    });

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      + '<title>Analisis Butir Soal — Benar/Salah</title>'
      + '<style>' + printCss + '</style>'
      + '<!-- VERCEL: GAS URL injected at build time -->'
      + '<div id="__GAS_CONFIG__" data-gas-url="https://script.google.com/macros/s/AKfycbwHNjzGCBgrM3umOSYJzY1WO079ucscGUUbVUWphai44wOnIhTbu1hgXrh_7ummaVyb/exec" style="display:none"></div>'
      + '<!-- VERCEL: API client adapter \u2014 replaces google.script.run with fetch() -->'
      + '<script src="/api-client.js"><\/script>'
      + '</head><body>'
      + '<h2>Analisis Butir Soal — Benar/Salah</h2>'
      + '<p><b>' + _esc(res.examInfo.subject) + '</b> | Kelas ' + _esc(res.examInfo.classes) + ' | ' + res.totalStudents + ' peserta</p>'
      + '<p>Grup atas/bawah: ' + res.groupSize + ' siswa (27%) &nbsp;·&nbsp; Dicetak: ' + new Date().toLocaleDateString('id-ID', {day:'2-digit',month:'long',year:'numeric'}) + '</p>'
      + '<table><thead><tr>'
      + '<th style="width:28px">No</th><th>Soal / Pernyataan</th>'
      + '<th style="text-align:center">Kunci</th><th style="text-align:center">% Benar</th>'
      + '<th style="text-align:center">P</th><th style="text-align:center">Kat. P</th>'
      + '<th style="text-align:center">D</th><th style="text-align:center">Kat. D</th>'
      + '<th style="text-align:center">Rekomendasi</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>'
      + '</body></html>';

    _openPrintBlobWindow(html, true);
  }

  function loadJODOHAnalysis() {
    const examID = document.getElementById('ia-exam-select')?.value;
    if (!examID) {
      return _iaWarnNoExam();
    }
    const rd = document.getElementById('jodoh-result');
    if (!rd) return;
  
    rd.innerHTML = `
      <div class="ia-loading">
        <i class="fas fa-circle-notch fa-spin text-indigo-500 text-2xl"></i>
        <span>Menghitung analisis Menjodohkan + Confusion Matrix...</span>
      </div>`;
  
    google.script.run
      .withSuccessHandler(function(res) {
        if (!res || !res.success) {
          rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Gagal memuat analisis Menjodohkan.</b> ${res?.message || 'Terjadi kesalahan.'}</div></div>`;
          return;
        }
        renderJODOHAnalysisPanel(res, rd);
      })
      .withFailureHandler(err => {
        if (rd) rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-bug"></i><div><b>Error:</b> ${err.message || String(err)}</div></div>`;
      })
      .getJODOHItemAnalysis(examID, currentUser.userID, currentUser.token);
  }
  
  function renderJODOHAnalysisPanel(res, container) {
    window._jodohAnalysisData = res;
  
    const s  = res.summary;
    const P  = s.difficulty;
    const D  = s.discrimination;
    const bermasalahPct = res.totalPairs > 0
      ? Math.round(s.totalBermasalah / res.totalPairs * 100) : 0;
  
    const pBadge = (v, sm = false) => {
      const sz = sm ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
      if (v > 0.70)  return `<span class="${sz} rounded-full bg-green-100 text-green-700 font-bold border border-green-200">🟢 ${v.toFixed(3)} Mudah</span>`;
      if (v >= 0.30) return `<span class="${sz} rounded-full bg-yellow-100 text-yellow-700 font-bold border border-yellow-200">🟡 ${v.toFixed(3)} Sedang</span>`;
      return           `<span class="${sz} rounded-full bg-red-100 text-red-700 font-bold border border-red-200">🔴 ${v.toFixed(3)} Sukar</span>`;
    };
    const dBadge = (v, sm = false) => {
      const sz = sm ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
      if (v < 0)     return `<span class="${sz} rounded-full bg-red-900/10 text-red-800 font-bold border border-red-300">⛔ ${v.toFixed(3)} Buang</span>`;
      if (v < 0.20)  return `<span class="${sz} rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">🔴 ${v.toFixed(3)} Jelek</span>`;
      if (v < 0.30)  return `<span class="${sz} rounded-full bg-yellow-100 text-yellow-700 font-bold border border-yellow-200">🟡 ${v.toFixed(3)} Cukup</span>`;
      if (v < 0.40)  return `<span class="${sz} rounded-full bg-green-100 text-green-700 font-bold border border-green-200">🟢 ${v.toFixed(3)} Baik</span>`;
      return           `<span class="${sz} rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">💎 ${v.toFixed(3)} Sangat Baik</span>`;
    };
  
    const topConfHTML = res.topConfusions.length === 0
      ? '<p class="text-xs text-slate-400 text-center py-3">Tidak ada kebingungan signifikan terdeteksi.</p>'
      : res.topConfusions.map((c, i) => `
          <div class="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
            <span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center flex-shrink-0">${i + 1}</span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 text-xs flex-wrap">
                <span class="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px]">${c.left}</span>
                <i class="fas fa-arrow-right text-slate-400 text-[10px]"></i>
                <span class="line-through text-red-500 bg-red-50 px-2 py-0.5 rounded truncate max-w-[120px]">${c.wrong}</span>
                <i class="fas fa-times text-red-400 text-[10px]"></i>
                <span class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded truncate max-w-[120px]">${c.correct} ✓</span>
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5">Soal ${c.questionNumber}</div>
            </div>
            <span class="text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 flex-shrink-0">
              ${c.count} siswa (${c.pct}%)
            </span>
          </div>`
        ).join('');
  
    const accordionHTML = res.data.map((q, qi) => buildJODOHQuestionCard(q, qi, res, pBadge, dBadge)).join('');
  
    container.innerHTML = `
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-center">
          <div class="text-3xl font-black text-indigo-700">${res.totalStudents}</div>
          <div class="text-xs font-semibold text-indigo-500 mt-0.5">Peserta Ujian</div>
        </div>
        <div class="rounded-xl border border-purple-100 bg-purple-50 p-4 text-center">
          <div class="text-3xl font-black text-purple-700">${res.totalJODOHQuestions}</div>
          <div class="text-xs font-semibold text-purple-500 mt-0.5">Soal Menjodohkan</div>
          <div class="text-[10px] text-purple-400">${res.totalPairs} total pasangan</div>
        </div>
        <div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
          <div class="flex justify-center gap-2 text-sm font-bold mb-1">
            <span class="text-green-600">${P.mudah}M</span>
            <span class="text-yellow-600">${P.sedang}S</span>
            <span class="text-red-600">${P.sukar}SK</span>
          </div>
          <div class="text-xs font-semibold text-amber-600">Distribusi Kesukaran</div>
          <div class="text-[10px] text-amber-400">Mudah · Sedang · Sukar</div>
        </div>
        <div class="rounded-xl border ${s.totalBermasalah > 0 ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50'} p-4 text-center">
          <div class="text-3xl font-black ${s.totalBermasalah > 0 ? 'text-red-600' : 'text-emerald-600'}">${s.totalBermasalah}</div>
          <div class="text-xs font-semibold ${s.totalBermasalah > 0 ? 'text-red-500' : 'text-emerald-500'} mt-0.5">Pasangan Bermasalah</div>
          <div class="text-[10px] ${s.totalBermasalah > 0 ? 'text-red-400' : 'text-emerald-400'}">${bermasalahPct}% dari total</div>
        </div>
      </div>
  
      <!-- Dua kolom: distribusi D + top confusions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  
        <!-- Distribusi Daya Beda -->
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            <i class="fas fa-chart-bar mr-1.5"></i>Distribusi Daya Beda (D)
          </p>
          <div class="flex items-end gap-2 pt-6">
            ${[
              { label: 'Negatif', count: D.negatif,    color: 'bg-red-600',     text: 'text-red-700'     },
              { label: 'Jelek',   count: D.jelek,      color: 'bg-orange-400',  text: 'text-orange-700'  },
              { label: 'Cukup',   count: D.cukup,      color: 'bg-yellow-400',  text: 'text-yellow-700'  },
              { label: 'Baik',    count: D.baik,       color: 'bg-green-400',   text: 'text-green-700'   },
              { label: 'Sgt Baik',count: D.sangatBaik, color: 'bg-emerald-500', text: 'text-emerald-700' }
            ].map(item => {
              const maxVal = Math.max(D.negatif, D.jelek, D.cukup, D.baik, D.sangatBaik, 1);
              const h = Math.round(item.count / maxVal * 100);
              return `<div class="flex flex-col items-center gap-1 flex-1">
                <span class="text-xs font-black ${item.text}">${item.count}</span>
                <div class="w-full ${item.color} rounded-t" style="height:${Math.max(4, h * 0.48)}px"></div>
                <span class="text-[9px] text-slate-500 font-semibold leading-tight text-center">${item.label}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
  
        <!-- Top Confusions Global -->
        <div class="rounded-xl border border-rose-100 bg-rose-50 p-4">
          <p class="text-xs font-bold text-rose-600 uppercase tracking-wide mb-3">
            <i class="fas fa-random mr-1.5"></i>Kebingungan Paling Sering (Top 10)
          </p>
          <div class="space-y-0 max-h-40 overflow-y-auto">${topConfHTML}</div>
        </div>
      </div>
  
      <!-- Tombol Ekspor -->
      <div class="flex flex-wrap gap-2 mb-5">
        <button onclick="exportJODOHAnalysisToExcel()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition">
          <i class="fas fa-file-excel"></i> Ekspor Excel
        </button>
        <button onclick="printJODOHAnalysis()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-600 hover:bg-slate-700 rounded-lg shadow transition">
          <i class="fas fa-print"></i> Cetak / PDF
        </button>
        <span class="flex items-center text-xs text-slate-400 ml-1">
          <i class="fas fa-info-circle mr-1"></i>
          Grup atas/bawah: ${res.groupSize} siswa (27%)
        </span>
      </div>
  
      <!-- Accordion Soal -->
      <div id="jodoh-accordion">${accordionHTML}</div>
  
      <p class="text-xs text-slate-400 text-right mt-3">
        Ujian: <b>${res.examInfo.subject}</b> — Kelas ${res.examInfo.classes} &nbsp;·&nbsp;
        ${res.totalStudents} peserta
      </p>`;
    renderMath(container);
  }
  
  function buildJODOHQuestionCard(q, qi, res, pBadge, dBadge) {
    const hasProblems = q.badPairs > 0;
    const headerBg   = hasProblems ? 'bg-orange-50 border-orange-200' : 'bg-indigo-50 border-indigo-200';
    const iconColor  = hasProblems ? 'text-orange-500' : 'text-indigo-500';
  
    const pairRows = q.pairs.map((pair, pi) => {
      const pct       = res.totalStudents > 0 ? Math.round(pair.correctCount / res.totalStudents * 100) : 0;
      const barColor  = pct >= 70 ? 'bg-green-400' : pct >= 30 ? 'bg-yellow-400' : 'bg-red-400';
      const rowStyle  = (pair.D < 0 || pair.P < 0.20)
        ? 'bg-red-50 border-l-4 border-red-400'
        : (pair.D < 0.20 || pair.P < 0.30)
          ? 'bg-orange-50/60 border-l-4 border-orange-300'
          : (pair.D >= 0.40 && pair.P >= 0.30 && pair.P <= 0.70)
            ? 'bg-emerald-50/40 border-l-4 border-emerald-300'
            : 'border-l-4 border-slate-200';
  
      const wrongBtn = pair.wrongCount > 0
        ? `<button onclick="showJODOHWrongStudentsModal(${qi}, ${pi})"
            class="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg
                    bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition">
            <i class="fas fa-user-times"></i>${pair.wrongCount} siswa keliru
          </button>`
        : `<span class="text-xs text-emerald-600 font-semibold"><i class="fas fa-check-circle mr-1"></i>Semua Benar</span>`;
  
      return `
        <tr class="${rowStyle} transition hover:brightness-95">
          <td class="p-3 text-center text-xs font-bold text-slate-400 w-8">${pi + 1}</td>
          <td class="p-3 text-xs font-semibold text-slate-700">${pair.leftItem}</td>
          <td class="p-3 text-center"><i class="fas fa-arrow-right text-slate-300"></i></td>
          <td class="p-3 text-xs text-emerald-700 font-semibold bg-emerald-50/40">${pair.correctRight}</td>
          <td class="p-3 w-32">
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div class="${barColor} h-2 rounded-full" style="width:${pct}%"></div>
              </div>
              <span class="text-xs font-bold text-slate-600 w-8 text-right">${pct}%</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${pair.correctCount}/${res.totalStudents}</div>
          </td>
          <td class="p-3 text-center">${pBadge(pair.P, true)}</td>
          <td class="p-3 text-center">${dBadge(pair.D, true)}</td>
          <td class="p-3 text-center">${wrongBtn}</td>
        </tr>`;
    }).join('');
  
    const colHeaders = q.allAnswerOptions;
    const maxCount   = Math.max(1, ...q.confusionMatrix.flatMap(row =>
      Object.values(row.counts).filter((_, i) => colHeaders[i] !== undefined)
    ));
  
    const matrixHeaderCols = colHeaders.map(col => `
      <th class="p-2 text-[10px] font-black text-indigo-600 text-center border border-indigo-100 bg-indigo-50/80 max-w-[80px]">
        <span class="block truncate max-w-[70px] mx-auto" title="${col}">${col.length > 14 ? col.substring(0,12)+'…' : col}</span>
      </th>`).join('');
  
    const matrixRows = q.confusionMatrix.map(row => {
      const cells = colHeaders.map(col => {
        const count  = row.counts[col] || 0;
        const isCorrect = col === row.correctRight;
        const pct    = res.totalStudents > 0 ? Math.round(count / res.totalStudents * 100) : 0;
        const opacity = count === 0 ? '10' : Math.max(20, Math.round((count / maxCount) * 80)).toString();
        const bg     = isCorrect
          ? `bg-emerald-500/${opacity} border-emerald-300`
          : count > 0
            ? `bg-red-400/${opacity} border-red-200`
            : 'bg-slate-50 border-slate-100';
  
        return `<td class="p-2 text-center border ${bg} transition">
          ${count > 0
            ? `<div class="font-black text-sm ${isCorrect ? 'text-emerald-700' : 'text-red-600'}">${count}</div>
              <div class="text-[9px] ${isCorrect ? 'text-emerald-500' : 'text-red-400'}">${pct}%</div>`
            : '<span class="text-[10px] text-slate-300">—</span>'
          }
        </td>`;
      }).join('');
  
      return `<tr>
        <td class="p-2 text-xs font-semibold text-slate-700 border border-slate-100 bg-slate-50 max-w-[100px]">
          <span class="block truncate max-w-[90px]" title="${row.leftItem}">${row.leftItem.length > 15 ? row.leftItem.substring(0,13)+'…' : row.leftItem}</span>
        </td>
        ${cells}
      </tr>`;
    }).join('');
  
    return `
      <div class="rounded-xl border ${headerBg} overflow-hidden mb-3 shadow-sm">
        <!-- Header soal -->
        <button onclick="toggleJODOHQuestion('jq-${qi}')"
          class="w-full flex items-start justify-between p-4 text-left hover:brightness-95 transition">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/80 ${iconColor} flex items-center justify-center font-black text-sm border border-current/20">
              ${qi + 1}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-700 line-clamp-2">${prepContent(q.content) || '(soal tanpa teks pembuka)'}</div>
              <div class="flex flex-wrap items-center gap-2 mt-1.5">
                <span class="text-[10px] text-slate-400">${q.totalPairs} pasangan &nbsp;·&nbsp; Bobot ${q.weight} poin</span>
                ${hasProblems
                  ? `<span class="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">⚠ ${q.badPairs} pasangan bermasalah</span>`
                  : '<span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Semua pasangan berkualitas</span>'}
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                ${pBadge(q.avgP, true)}
                ${dBadge(q.avgD, true)}
              </div>
            </div>
          </div>
          <i class="fas fa-chevron-down ${iconColor} mt-1 flex-shrink-0 transition-transform" id="icon-jq-${qi}"></i>
        </button>
  
        <!-- Detail (collapsed) -->
        <div id="jq-${qi}" class="hidden border-t border-current/10">
  
          <!-- Sub-tab: Tabel Pasangan vs Confusion Matrix -->
          <div class="flex border-b border-slate-100 bg-white/50 px-4 pt-2 gap-1">
            <button onclick="switchJODOHSubTab('pairs', ${qi})" id="jq-tab-pairs-${qi}"
              class="jq-subtab-${qi} px-3 py-2 text-xs font-semibold rounded-t border-b-2 border-indigo-500 text-indigo-700 bg-indigo-50/80 transition">
              <i class="fas fa-table mr-1"></i>Analisis Pasangan
            </button>
            <button onclick="switchJODOHSubTab('matrix', ${qi})" id="jq-tab-matrix-${qi}"
              class="jq-subtab-${qi} px-3 py-2 text-xs font-semibold rounded-t border-b-2 border-transparent text-slate-500 hover:bg-slate-100/80 transition">
              <i class="fas fa-th mr-1"></i>Confusion Matrix
            </button>
          </div>
  
          <!-- Panel Tabel Pasangan -->
          <div id="jq-pairs-${qi}" class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-white/60">
                  <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-8">No</th>
                  <th class="p-3 text-left text-[10px] font-black uppercase text-slate-400">Kolom Kiri (Pertanyaan)</th>
                  <th class="p-3 text-center text-[10px] text-slate-300 w-8"></th>
                  <th class="p-3 text-left text-[10px] font-black uppercase text-emerald-500">Kunci Jawaban</th>
                  <th class="p-3 text-left text-[10px] font-black uppercase text-slate-400 w-36">% Benar</th>
                  <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-28">P (Kesukaran)</th>
                  <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-32">D (Daya Beda)</th>
                  <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-36">Siswa Keliru</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">${pairRows}</tbody>
            </table>
          </div>
  
          <!-- Panel Confusion Matrix (hidden by default) -->
          <div id="jq-matrix-${qi}" class="hidden p-4">
            <p class="text-xs text-slate-500 mb-3">
              <i class="fas fa-info-circle mr-1 text-indigo-400"></i>
              Setiap sel menunjukkan berapa siswa memilih kombinasi baris–kolom tersebut.
              <span class="text-emerald-600 font-semibold ml-1">Hijau = jawaban benar.</span>
              <span class="text-red-600 font-semibold ml-1">Merah = jawaban salah.</span>
            </p>
            <div class="ia-confusion-wrap">
              <table class="text-sm border-collapse" style="min-width:300px">
                <thead>
                  <tr>
                    <th class="p-2 text-[10px] font-black text-slate-400 text-left border border-slate-100 bg-slate-50">
                      Kiri ↓ / Kanan →
                    </th>
                    ${matrixHeaderCols}
                  </tr>
                </thead>
                <tbody>${matrixRows}</tbody>
              </table>
            </div>
            ${q.topConfusions.length > 0 ? `
            <div class="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p class="text-xs font-bold text-rose-600 mb-2"><i class="fas fa-exclamation-triangle mr-1"></i>Pasangan Paling Sering Tertukar pada Soal Ini:</p>
              ${q.topConfusions.slice(0, 3).map(c => `
                <div class="text-xs text-slate-600 mb-1">
                  <span class="font-semibold">"${c.left}"</span>
                  sering dijawab dengan <span class="text-red-500 font-semibold line-through">"${c.wrong}"</span>
                  (seharusnya <span class="text-emerald-600 font-semibold">"${c.correct}"</span>) —
                  <b>${c.count} siswa (${c.pct}%)</b>
                </div>`).join('')}
              <p class="text-[10px] text-rose-500 mt-2">
                <i class="fas fa-lightbulb mr-1"></i>Siswa kemungkinan mengacaukan kedua konsep ini.
                Disarankan mengulang penjelasan perbedaan antara konsep-konsep yang sering tertukar.
              </p>
            </div>` : ''}
          </div>
  
        </div>
      </div>`;
  }
  
  // Bug 10 fix: replaced fragile className.replace() with explicit classList add/remove per token
  function switchJODOHSubTab(tab, qi) {
    const pairsPanel  = document.getElementById(`jq-pairs-${qi}`);
    const matrixPanel = document.getElementById(`jq-matrix-${qi}`);
    const pairsBtn    = document.getElementById(`jq-tab-pairs-${qi}`);
    const matrixBtn   = document.getElementById(`jq-tab-matrix-${qi}`);
    if (!pairsPanel || !matrixPanel || !pairsBtn || !matrixBtn) return;

    const activeTokens   = ['border-indigo-500', 'text-indigo-700', 'bg-indigo-50/80'];
    const inactiveTokens = ['border-transparent', 'text-slate-500', 'hover:bg-slate-100/80'];

    function setActive(btn) {
      inactiveTokens.forEach(t => btn.classList.remove(t));
      activeTokens.forEach(t => btn.classList.add(t));
    }
    function setInactive(btn) {
      activeTokens.forEach(t => btn.classList.remove(t));
      inactiveTokens.forEach(t => btn.classList.add(t));
    }

    if (tab === 'pairs') {
      pairsPanel.classList.remove('hidden');
      matrixPanel.classList.add('hidden');
      setActive(pairsBtn);
      setInactive(matrixBtn);
    } else {
      matrixPanel.classList.remove('hidden');
      pairsPanel.classList.add('hidden');
      setActive(matrixBtn);
      setInactive(pairsBtn);
    }
  }
  
  function toggleJODOHQuestion(id) {
    const panel = document.getElementById(id);
    const idx   = id.replace('jq-', '');
    const icon  = document.getElementById('icon-jq-' + idx);
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !isHidden);
    if (icon) icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
  
  function showJODOHWrongStudentsModal(questionIdx, pairIdx) {
    const res = window._jodohAnalysisData;
    if (!res || !res.data[questionIdx]) return;
  
    const q    = res.data[questionIdx];
    const pair = q.pairs[pairIdx];
    if (!pair) return;
  
    const pctBenar = res.totalStudents > 0
      ? Math.round(pair.correctCount / res.totalStudents * 100) : 0;
  
    const wrongDistMap = {};
    pair.wrongStudents.forEach(s => {
      const k = s.given || 'Tidak Dijawab';
      wrongDistMap[k] = (wrongDistMap[k] || 0) + 1;
    });
    const wrongDistHTML = Object.entries(wrongDistMap)
      .sort((a, b) => b[1] - a[1])
      .map(([ans, cnt]) => {
        const barPct = pair.wrongCount > 0 ? Math.round(cnt / pair.wrongCount * 100) : 0;
        return `<div class="flex items-center gap-2 mb-1">
          <span class="text-xs text-slate-600 w-28 truncate" title="${ans}">${ans}</span>
          <div class="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
            <div class="bg-red-400 h-2 rounded-full" style="width:${barPct}%"></div>
          </div>
          <span class="text-xs font-bold text-slate-600 w-14 text-right">${cnt} (${barPct}%)</span>
        </div>`;
      }).join('');
  
    let rekomendasi = '';
    if (pair.D < 0) {
      rekomendasi = 'Pasangan ini memiliki Daya Beda negatif — siswa pandai justru lebih banyak salah. Pasangan perlu direvisi atau diganti.';
    } else if (pair.D < 0.20) {
      rekomendasi = 'Daya Beda rendah. Kemungkinan kalimat pada kolom kiri atau kanan kurang jelas, atau ada dua konsep yang terlalu mirip sehingga membingungkan.';
    } else if (pair.P < 0.30) {
      rekomendasi = `Mayoritas siswa (${100 - pctBenar}%) belum bisa menjodohkan "${pair.leftItem}" dengan benar. Materi ini perlu penguatan khusus sebelum evaluasi berikutnya.`;
    } else {
      rekomendasi = `${pair.wrongCount} siswa ini mungkin belum memahami hubungan antara "${pair.leftItem}" dan "${pair.correctRight}". Pertimbangkan remedial atau penjelasan ulang.`;
    }
  
    const rows = pair.wrongStudents.length === 0
      ? '<tr><td colspan="5" class="text-center p-6 text-slate-400">Semua siswa menjawab benar!</td></tr>'
      : pair.wrongStudents.map((s, i) => `
          <tr class="hover:bg-red-50/30">
            <td class="p-3 text-center text-xs text-slate-400">${i + 1}</td>
            <td class="p-3 text-sm font-semibold text-slate-700">${s.name}</td>
            <td class="p-3 text-center text-xs text-slate-500">${s.cls}</td>
            <td class="p-3 text-center">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                ${s.given}
              </span>
            </td>
            <td class="p-3 text-center text-xs font-bold text-slate-600">${s.score.toFixed(1)}</td>
          </tr>`).join('');
  
    Swal.fire({
      title: `Soal ${q.questionNumber} · Pasangan ${pairIdx + 1}`,
      width: '720px',
      html: `
        <div class="text-left">
          <!-- Info pasangan -->
          <div class="flex items-center gap-3 bg-slate-50 rounded-xl p-3 mb-4 border border-slate-200">
            <div class="flex-1 text-sm font-semibold text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 truncate">${pair.leftItem}</div>
            <i class="fas fa-arrow-right text-indigo-400"></i>
            <div class="flex-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 truncate">${pair.correctRight}</div>
          </div>
  
          <!-- Stats singkat -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-semibold border border-green-200">
              ✓ ${pair.correctCount} benar (${pctBenar}%)
            </span>
            <span class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-semibold border border-red-200">
              ✗ ${pair.wrongCount} keliru
            </span>
            <span class="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              P = ${pair.P.toFixed(3)} · D = ${pair.D.toFixed(3)}
            </span>
          </div>
  
          <!-- Distribusi jawaban salah -->
          ${pair.wrongCount > 0 ? `
          <div class="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p class="text-xs font-bold text-slate-500 mb-2">Distribusi Jawaban Salah yang Diberikan:</p>
            ${wrongDistHTML}
          </div>` : ''}
  
          <!-- Tabel siswa keliru -->
          <div class="overflow-auto max-h-64 rounded-xl border border-slate-200 mb-4">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 sticky top-0">
                <tr>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase w-8">No</th>
                  <th class="p-3 text-left text-xs font-black text-slate-400 uppercase">Nama Siswa</th>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase w-24">Kelas</th>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase">Jawaban Diberi</th>
                  <th class="p-3 text-center text-xs font-black text-slate-400 uppercase w-20">Skor Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">${rows}</tbody>
            </table>
          </div>
  
          <!-- Rekomendasi -->
          <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            <i class="fas fa-lightbulb mr-1.5"></i>
            <b>Rekomendasi:</b> ${rekomendasi}
          </div>
        </div>`,
      showConfirmButton: true,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#6366f1'
    });
  }
    
  function exportJODOHAnalysisToExcel() {
    const res = window._jodohAnalysisData;
    if (!res) return Swal.fire({ icon: 'warning', title: 'Tidak Ada Data', text: 'Jalankan analisis terlebih dahulu.' });
  
    try {
      const wb = XLSX.utils.book_new();
  
      const summaryRows = [
        ['ANALISIS BUTIR SOAL — MENJODOHKAN'],
        [''],
        ['Ujian',        res.examInfo.subject],
        ['Kelas',        res.examInfo.classes],
        ['Passing Grade',res.examInfo.passingGrade],
        ['Peserta',      res.totalStudents],
        ['Grup Atas/Bawah', `${res.groupSize} siswa (27%)`],
        ['Total Soal JODOH', res.totalJODOHQuestions],
        ['Total Pasangan',   res.totalPairs],
        [''],
        ['=== DISTRIBUSI KESUKARAN (P) ==='],
        ['Mudah  (P > 0.70)',  res.summary.difficulty.mudah],
        ['Sedang (0.30–0.70)', res.summary.difficulty.sedang],
        ['Sukar  (P < 0.30)',  res.summary.difficulty.sukar],
        [''],
        ['=== DISTRIBUSI DAYA BEDA (D) ==='],
        ['Sangat Baik (D ≥ 0.40)', res.summary.discrimination.sangatBaik],
        ['Baik        (0.30–0.39)', res.summary.discrimination.baik],
        ['Cukup       (0.20–0.29)', res.summary.discrimination.cukup],
        ['Jelek       (0.00–0.19)', res.summary.discrimination.jelek],
        ['Negatif     (D < 0)',     res.summary.discrimination.negatif],
        [''],
        ['Total Pasangan Bermasalah', res.summary.totalBermasalah],
        [''],
        ['=== TOP 10 KEBINGUNGAN PALING SERING ==='],
        ['No', 'Soal', 'Kolom Kiri', 'Dijawab Dengan (Salah)', 'Seharusnya (Benar)', 'Jumlah Siswa', 'Persentase']
      ];
      res.topConfusions.forEach((c, i) => {
        summaryRows.push([i + 1, `Soal ${c.questionNumber}`, c.left, c.wrong, c.correct, c.count, c.pct + '%']);
      });
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 36 }, { wch: 20 }, { wch: 28 }, { wch: 28 }, { wch: 28 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');
  
      const detailHeader = [
        'No Soal', 'ID Soal', 'Teks Soal (Pembuka)',
        'No Pasangan', 'Kolom Kiri (Pertanyaan)', 'Kunci (Kolom Kanan)',
        'Jml Benar', 'Jml Salah', '% Benar',
        'P (Kesukaran)', 'Kategori P',
        'D (Daya Beda)', 'Kategori D',
        'Grup Atas Benar', 'Grup Bawah Benar',
        'Status'
      ];
      const detailRows = [detailHeader];
  
      res.data.forEach(q => {
        q.pairs.forEach(pair => {
          const pct = res.totalStudents > 0 ? Math.round(pair.correctCount / res.totalStudents * 100) : 0;
          let status = 'Baik';
          if (pair.D < 0) status = 'BUANG — D Negatif';
          else if (pair.D < 0.20 && pair.P < 0.30) status = 'PERLU REVISI — D Jelek & Sukar';
          else if (pair.D < 0.20) status = 'PERLU REVISI — D Jelek';
          else if (pair.P < 0.20) status = 'PERLU REVISI — Terlalu Sukar';
  
          detailRows.push([
            q.questionNumber, q.questionId, q.content.substring(0, 60),
            pair.index + 1, pair.leftItem, pair.correctRight,
            pair.correctCount, pair.wrongCount, pct + '%',
            pair.P, pair.diffLabel.label,
            pair.D, pair.discLabel.label,
            pair.upperCorrect, pair.lowerCorrect,
            status
          ]);
        });
      });
  
      const wsDetail = XLSX.utils.aoa_to_sheet(detailRows);
      wsDetail['!cols'] = [
        {wch:8},{wch:20},{wch:40},{wch:10},{wch:30},{wch:30},
        {wch:10},{wch:10},{wch:8},{wch:12},{wch:14},{wch:12},{wch:16},{wch:14},{wch:14},{wch:30}
      ];
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Analisis Pasangan');
  
      res.data.forEach((q, qi) => {
        const cols = q.allAnswerOptions;
        const matrixHeader = ['Kolom Kiri (Pertanyaan)', ...cols, 'Tidak Dijawab'];
        const matrixRows2  = [matrixHeader];
        q.confusionMatrix.forEach(row => {
          const cells = cols.map(col => row.counts[col] || 0);
          matrixRows2.push([row.leftItem, ...cells, row.counts['Tidak Dijawab'] || 0]);
        });
        const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows2);
        wsMatrix['!cols'] = [{ wch: 30 }, ...cols.map(() => ({ wch: 12 })), { wch: 14 }];
        const sheetName = `Matrix_Soal${qi + 1}`.substring(0, 31);
        XLSX.utils.book_append_sheet(wb, wsMatrix, sheetName);
      });
  
      const wrongHeader = ['No Soal', 'No Pasangan', 'Kolom Kiri', 'Kunci', 'Nama Siswa', 'Kelas', 'Jawaban Diberi', 'Skor Total'];
      const wrongRows   = [wrongHeader];
      res.data.forEach(q => {
        q.pairs.forEach(pair => {
          pair.wrongStudents.forEach(s => {
            wrongRows.push([q.questionNumber, pair.index + 1, pair.leftItem, pair.correctRight, s.name, s.cls, s.given, s.score]);
          });
        });
      });
      if (wrongRows.length > 1) {
        const wsWrong = XLSX.utils.aoa_to_sheet(wrongRows);
        wsWrong['!cols'] = [{wch:8},{wch:10},{wch:28},{wch:28},{wch:28},{wch:10},{wch:28},{wch:10}];
        XLSX.utils.book_append_sheet(wb, wsWrong, 'Daftar Siswa Keliru');
      }
  
      const fname = `AnalisisJODOH_${res.examInfo.subject.replace(/\s+/g,'_')}_${res.examInfo.classes.replace(/,/g,'')}_${new Date().toLocaleDateString('id-ID').replace(/\//g,'-')}.xlsx`;
      XLSX.writeFile(wb, fname);
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: `File "${fname}" berhasil diunduh.`, timer: 2500, showConfirmButton: false });
  
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'Gagal Ekspor', text: e.message || String(e) });
    }
  }
  
  // Bug 11 fix: was window.print() directly. Now uses _openPrintBlobWindow (safe iframe).
  function printJODOHAnalysis() {
    const res = window._jodohAnalysisData;
    if (!res) return Swal.fire({ icon: 'warning', title: 'Tidak Ada Data', text: 'Jalankan analisis terlebih dahulu.' });

    const printCss = 'body{font-family:Arial,sans-serif;font-size:11px;color:#1e293b;margin:20px;}'
      + 'h2{font-size:14px;margin-bottom:4px;} h3{font-size:12px;margin-top:14px;margin-bottom:6px;}'
      + 'p{margin:2px 0;font-size:10px;color:#64748b;}'
      + 'table{border-collapse:collapse;width:100%;margin-top:10px;margin-bottom:16px;}'
      + 'th{background:#f1f5f9;padding:6px 8px;border:1px solid #e2e8f0;text-align:left;font-size:10px;font-weight:700;}'
      + 'td{padding:5px 8px;border:1px solid #e2e8f0;font-size:10px;vertical-align:top;}'
      + '.soal-hdr{background:#f8fafc!important;font-weight:bold!important;}'
      + '.row-buang{background:#fef2f2!important;} .row-warn{background:#fff7ed!important;}'
      + '.conf-th{background:#fef2f2!important;border-color:#fecaca!important;}';

    let rows = '';
    res.data.forEach(q => {
      rows += '<tr class="soal-hdr"><td colspan="9" style="padding:6px 8px;font-weight:bold;font-size:10px;color:#1e293b">'
        + 'Soal ' + q.questionNumber + ': ' + _esc(q.content.substring(0, 100)) + (q.content.length > 100 ? '…' : '')
        + '</td></tr>';
      q.pairs.forEach(pair => {
        const pct = res.totalStudents > 0 ? Math.round(pair.correctCount / res.totalStudents * 100) : 0;
        let rek = 'Pertahankan';
        if (pair.D < 0)        rek = 'BUANG';
        else if (pair.D < 0.20) rek = 'Revisi Pasangan';
        else if (pair.P < 0.20) rek = 'Terlalu Sukar';
        else if (pair.P > 0.90) rek = 'Terlalu Mudah';
        const rowCls = (pair.D < 0 || pair.P < 0.20) ? 'class="row-buang"' : pair.D < 0.20 ? 'class="row-warn"' : '';
        rows += '<tr ' + rowCls + '>'
          + '<td style="text-align:center;color:#94a3b8">' + (pair.index + 1) + '</td>'
          + '<td>' + _esc(pair.leftItem) + '</td>'
          + '<td style="text-align:center;font-weight:bold;color:#059669">' + _esc(pair.correctRight) + '</td>'
          + '<td style="text-align:center">' + pct + '%</td>'
          + '<td style="text-align:center;font-weight:bold">' + pair.P.toFixed(3) + '</td>'
          + '<td style="text-align:center">' + _esc(pair.diffLabel.label) + '</td>'
          + '<td style="text-align:center;font-weight:bold">' + pair.D.toFixed(3) + '</td>'
          + '<td style="text-align:center">' + _esc(pair.discLabel.label) + '</td>'
          + '<td style="text-align:center;font-size:9px">' + _esc(rek) + '</td>'
          + '</tr>';
      });
    });

    let confTable = '';
    if (res.topConfusions.length > 0) {
      confTable = '<h3>Pasangan yang Paling Sering Tertukar</h3>'
        + '<table><thead><tr>'
        + '<th class="conf-th" style="text-align:center">No</th>'
        + '<th class="conf-th">Soal</th><th class="conf-th">Kolom Kiri</th>'
        + '<th class="conf-th">Jawaban Salah yang Dipilih</th>'
        + '<th class="conf-th">Jawaban Benar</th>'
        + '<th class="conf-th" style="text-align:center">Jml Siswa</th>'
        + '</tr></thead><tbody>';
      res.topConfusions.forEach((c, i) => {
        confTable += '<tr>'
          + '<td style="text-align:center">' + (i + 1) + '</td>'
          + '<td>Soal ' + c.questionNumber + '</td>'
          + '<td>' + _esc(c.left) + '</td>'
          + '<td style="color:#dc2626;text-decoration:line-through">' + _esc(c.wrong) + '</td>'
          + '<td style="color:#059669;font-weight:bold">' + _esc(c.correct) + '</td>'
          + '<td style="text-align:center;font-weight:bold">' + c.count + ' (' + c.pct + '%)</td>'
          + '</tr>';
      });
      confTable += '</tbody></table>';
    }

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      + '<title>Analisis Butir Soal — Menjodohkan</title>'
      + '<style>' + printCss + '</style>'
      + '<!-- VERCEL: GAS URL injected at build time -->'
      + '<div id="__GAS_CONFIG__" data-gas-url="https://script.google.com/macros/s/AKfycbwHNjzGCBgrM3umOSYJzY1WO079ucscGUUbVUWphai44wOnIhTbu1hgXrh_7ummaVyb/exec" style="display:none"></div>'
      + '<!-- VERCEL: API client adapter \u2014 replaces google.script.run with fetch() -->'
      + '<script src="/api-client.js"><\/script>'
      + '</head><body>'
      + '<h2>Analisis Butir Soal — Menjodohkan</h2>'
      + '<p><b>' + _esc(res.examInfo.subject) + '</b> | Kelas ' + _esc(res.examInfo.classes) + ' | ' + res.totalStudents + ' peserta</p>'
      + '<p>Grup atas/bawah: ' + res.groupSize + ' siswa (27%) &nbsp;·&nbsp; Dicetak: ' + new Date().toLocaleDateString('id-ID', {day:'2-digit',month:'long',year:'numeric'}) + '</p>'
      + '<table><thead><tr>'
      + '<th style="width:28px">No</th><th>Soal / Pasangan</th>'
      + '<th style="text-align:center">Kunci</th><th style="text-align:center">% Benar</th>'
      + '<th style="text-align:center">P</th><th style="text-align:center">Kat. P</th>'
      + '<th style="text-align:center">D</th><th style="text-align:center">Kat. D</th>'
      + '<th style="text-align:center">Rekomendasi</th>'
      + '</tr></thead><tbody>' + rows + '</tbody></table>'
      + confTable
      + '</body></html>';

    _openPrintBlobWindow(html, true);
  }

  window._essayState = {
    data:        null,     
    grades:      {},       
    aiReasons:   {},       
    aiPending:   new Set() 
  };
  
  function loadEssayAnalysis() {
    const examID = document.getElementById('ia-exam-select')?.value;
    if (!examID) return _iaWarnNoExam();
  
    const rd = document.getElementById('esai-result');
    if (!rd) return;
  
    window._essayState = { data: null, grades: {}, aiReasons: {}, aiPending: new Set() };
  
    rd.innerHTML = `
      <div class="ia-loading">
        <i class="fas fa-circle-notch fa-spin text-rose-500 text-2xl"></i>
        <span>Memuat data jawaban esai...</span>
      </div>`;
  
    google.script.run
      .withSuccessHandler(res => {
        if (!res || !res.success) {
          rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-exclamation-triangle"></i><div><b>Gagal memuat data esai.</b> ${res?.message || 'Terjadi kesalahan.'}</div></div>`;
          return;
        }
        window._essayState.data = res;
  
        res.students.forEach(s => {
          window._essayState.grades[s.responseId]    = window._essayState.grades[s.responseId]    || {};
          window._essayState.aiReasons[s.responseId] = window._essayState.aiReasons[s.responseId] || {};
          res.essayQuestions.forEach(q => {
            const ea = s.essayAnswers[q.id];
            if (ea.teacherScore !== null) {
              window._essayState.grades[s.responseId][q.id] = ea.teacherScore;
            }
            if (ea.aiReason) {
              window._essayState.aiReasons[s.responseId][q.id] = ea.aiReason;
            }
          });
        });
  
        renderEssayAnalysisPanel(res, rd);
      })
      .withFailureHandler(err => {
        if (rd) rd.innerHTML = `<div class="ia-note amber"><i class="fas fa-bug"></i><div><b>Error:</b> ${err.message || String(err)}</div></div>`;
      })
      .getEssayAnalysisData(examID, currentUser.userID, currentUser.token);
  }
  
  function renderEssayAnalysisPanel(res, container) {
    const { totalStudents, essayQuestions, students, progress, hasApiKey, examInfo } = res;
  
    const gradedPct  = progress.total > 0 ? Math.round(progress.graded / progress.total * 100) : 0;
    const isFullyGraded = progress.pending === 0;
  
    const apiKeyWarning = !hasApiKey ? `
      <div class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
        <i class="fas fa-key text-amber-500 text-xl flex-shrink-0"></i>
        <div class="flex-1">
          <p class="text-sm font-bold text-amber-700">Fitur Penilaian AI Belum Dikonfigurasi</p>
          <p class="text-xs text-amber-600 mt-0.5">Tambahkan <code class="bg-amber-100 px-1 rounded">anthropic_api_key</code> di menu <b>Konfigurasi</b> untuk mengaktifkan penilaian otomatis oleh AI (Anthropic Claude).</p>
        </div>
        <button onclick="showAdminTab('dash-config', document.querySelector('.sidebar-item[onclick*=dash-config]'))"
          class="flex-shrink-0 px-3 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
          Konfigurasi
        </button>
      </div>` : '';
  
    const gridHTML = buildEssayGradingGrid(res);
  
    container.innerHTML = `
      ${apiKeyWarning}
  
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div class="rounded-xl border border-rose-100 bg-rose-50 p-4 text-center">
          <div class="text-3xl font-black text-rose-700">${totalStudents}</div>
          <div class="text-xs font-semibold text-rose-500 mt-0.5">Peserta Ujian</div>
        </div>
        <div class="rounded-xl border border-purple-100 bg-purple-50 p-4 text-center">
          <div class="text-3xl font-black text-purple-700">${essayQuestions.length}</div>
          <div class="text-xs font-semibold text-purple-500 mt-0.5">Soal Esai</div>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
          <div class="text-3xl font-black ${isFullyGraded ? 'text-emerald-600' : 'text-amber-600'}">${gradedPct}%</div>
          <div class="text-xs font-semibold ${isFullyGraded ? 'text-emerald-500' : 'text-amber-500'} mt-0.5">
            ${isFullyGraded ? '✓ Semua Sudah Dinilai' : `${progress.graded}/${progress.total} Dinilai`}
          </div>
        </div>
        <div class="rounded-xl border ${progress.pending > 0 ? 'border-orange-100 bg-orange-50' : 'border-emerald-100 bg-emerald-50'} p-4 text-center">
          <div class="text-3xl font-black ${progress.pending > 0 ? 'text-orange-600' : 'text-emerald-600'}">${progress.pending}</div>
          <div class="text-xs font-semibold ${progress.pending > 0 ? 'text-orange-500' : 'text-emerald-500'} mt-0.5">Belum Dinilai</div>
        </div>
      </div>
  
      <!-- Progress bar -->
      <div class="mb-5">
        <div class="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progres Penilaian</span>
          <span>${progress.graded} dari ${progress.total} jawaban</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div class="h-2.5 rounded-full transition-all ${isFullyGraded ? 'bg-emerald-500' : 'bg-rose-500'}"
            style="width:${gradedPct}%"></div>
        </div>
      </div>
  
      <!-- Toolbar aksi massal -->
      <div class="flex flex-wrap items-center gap-2 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wide mr-1">Aksi Massal:</span>
        ${hasApiKey ? `
        <button onclick="scoreAllPendingWithAI()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition" id="btn-ai-all">
          <i class="fas fa-robot"></i> Nilai Semua Belum Dinilai dengan AI
        </button>
        <button onclick="acceptAllAIScores()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow transition">
          <i class="fas fa-check-double"></i> Setujui Semua Skor AI
        </button>` : ''}
        <button onclick="saveAllEssayGrades()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition" id="btn-save-all">
          <i class="fas fa-save"></i> Simpan Semua Nilai
        </button>
        <button onclick="exportEssayAnalysisToExcel()"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-lg shadow transition border border-slate-300">
          <i class="fas fa-file-excel text-emerald-600"></i> Ekspor Excel
        </button>
      </div>
  
      <!-- Grid Penilaian -->
      <div id="essay-grading-grid">${gridHTML}</div>
  
      <!-- Panel statistik (muncul setelah semua dinilai) -->
      <div id="essay-stats-panel" class="${isFullyGraded ? '' : 'hidden'}">
        ${isFullyGraded ? buildEssayStatsPanel(res) : ''}
      </div>
  
      <p class="text-xs text-slate-400 text-right mt-3">
        Ujian: <b>${examInfo.subject}</b> — Kelas ${examInfo.classes}
      </p>`;
    renderMath(container); 
  }
  
  function buildEssayGradingGrid(res) {
    const { essayQuestions, students } = res;
  
    return essayQuestions.map((q, qi) => {
      const rows = students.map((s, si) => {
        const ea         = s.essayAnswers[q.id];
        const isDummy    = ea.text === '(Tidak dijawab)';
        const savedScore = window._essayState.grades[s.responseId]?.[q.id];
        // Validasi aiScore: hanya pakai jika bernilai angka finite yang valid
        const _rawAi     = ea.aiScore;
        const aiScore    = (typeof _rawAi === 'number' && isFinite(_rawAi)) ? _rawAi : null;
        const displayVal = savedScore !== undefined ? savedScore
                         : (aiScore !== null ? aiScore : '');
        const aiReason   = window._essayState.aiReasons[s.responseId]?.[q.id] || ea.aiReason || '';
        const isGraded   = savedScore !== undefined || isDummy;
        const rowBg      = isDummy ? 'bg-slate-50 opacity-60' : isGraded ? 'bg-emerald-50/30' : 'bg-white hover:bg-rose-50/20';

        // Bug 6 fix: store answer text safely in a lookup map — avoid embedding raw text in onclick
        if (!window._iaEssayAnswerMap) window._iaEssayAnswerMap = {};
        const _ansKey = s.responseId + '|' + q.id;
        window._iaEssayAnswerMap[_ansKey] = { text: ea.text, name: s.studentName, question: q.content };

        // Tampilkan badge Skor AI hanya jika skor valid dan bukan dummy
        const aiScoreBadge = (aiScore !== null && !isDummy)
          ? `<span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full cursor-help"
                title="${aiReason.replace(/"/g, '&quot;') || 'Skor AI'}">
              <i class="fas fa-robot mr-0.5"></i>AI: ${aiScore}
            </span>` : '';
  
        const scoreInput = isDummy
          ? `<span class="text-xs text-slate-400 italic">Tidak dijawab</span>`
          : `<div class="flex items-center gap-2">
              <input type="number"
                id="score-${s.responseId}-${q.id}"
                class="essay-score-input w-20 p-1.5 border border-slate-300 rounded-lg text-center font-bold text-sm
                        focus:ring-2 focus:ring-rose-400 outline-none transition
                        ${isGraded ? 'bg-emerald-50 border-emerald-300' : ''}"
                data-response-id="${s.responseId}"
                data-question-id="${q.id}"
                data-max="${q.maxPoint}"
                value="${displayVal}"
                min="0" max="${q.maxPoint}" step="0.5"
                oninput="onEssayScoreInput(this)"
                placeholder="0">
              <span class="text-xs text-slate-400">/ ${q.maxPoint}</span>
            </div>`;
  
        const aiBtn = (!isDummy && res.hasApiKey)
          ? `<button onclick="scoreSingleWithAI('${s.responseId}', '${q.id}', ${qi}, ${si})"
                id="ai-btn-${s.responseId}-${q.id}"
                class="p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition text-xs"
                title="Nilai dengan AI">
              <i class="fas fa-robot"></i>
            </button>` : '';
  
        return `
          <tr class="${rowBg} border-b border-slate-100 transition">
            <td class="p-3 w-8 text-center text-xs text-slate-400 font-bold">${si + 1}</td>
            <td class="p-3">
              <div class="font-semibold text-slate-700 text-sm">${s.studentName}</div>
              <div class="text-[10px] text-slate-400">${s.studentClass}</div>
            </td>
            <td class="p-3 max-w-sm">
              ${isDummy
                ? '<span class="text-xs text-slate-400 italic">(Tidak dijawab)</span>'
                : `<div class="text-xs text-slate-600 leading-relaxed line-clamp-3 cursor-pointer hover:line-clamp-none transition-all"
                        title="${_esc(q.content).replace(/"/g,'&quot;').substring(0,120)}"
                        onclick="_iaShowEssayAnswer(this)"
                        data-sid="${_esc(s.responseId)}"
                        data-qid="${_esc(q.id)}"
                        data-name="${_esc(s.studentName)}">${_esc(ea.text)}</div>`
              }
            </td>
            <td class="p-3 text-center w-36">${aiScoreBadge}</td>
            <td class="p-3 text-center w-40">${scoreInput}</td>
            <td class="p-3 text-center w-16">${aiBtn}</td>
          </tr>`;
      }).join('');
  
      return `
        <div class="rounded-xl border border-slate-200 overflow-hidden mb-4 shadow-sm">
          <!-- Header soal -->
          <div class="flex items-start gap-3 p-4 bg-rose-50 border-b border-rose-200">
            <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-white text-rose-600 flex items-center justify-center font-black text-sm border border-rose-200">
              ${qi + 1}
            </span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-700">${prepContent(q.content)}</div>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="text-[10px] text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">Bobot: ${q.maxPoint} poin</span>
                ${q.rubric ? `<span class="text-[10px] text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full cursor-pointer"
                  onclick="Swal.fire({title:'Rubrik Penilaian',text:'${q.rubric.replace(/'/g,"\\'")}',icon:'info'})">
                  <i class="fas fa-list-check mr-1"></i>Ada Rubrik
                </span>` : ''}
              </div>
            </div>
            ${res.hasApiKey ? `
            <button onclick="scoreQuestionWithAI(${qi})"
              class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              <i class="fas fa-robot"></i> Nilai Soal Ini
            </button>` : ''}
          </div>
          <!-- Tabel siswa -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50">
                <tr>
                  <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-8">No</th>
                  <th class="p-3 text-left text-[10px] font-black uppercase text-slate-400 w-36">Siswa</th>
                  <th class="p-3 text-left text-[10px] font-black uppercase text-slate-400">Jawaban</th>
                  <th class="p-3 text-center text-[10px] font-black uppercase text-indigo-400 w-28">Skor AI</th>
                  <th class="p-3 text-center text-[10px] font-black uppercase text-emerald-500 w-40">Skor Guru (Final)</th>
                  <th class="p-3 text-center text-[10px] font-black uppercase text-slate-400 w-16">AI</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
    }).join('');
  }
  
  function onEssayScoreInput(inp) {
    const rid = inp.dataset.responseId;
    const qid = inp.dataset.questionId;
    const max = parseFloat(inp.dataset.max) || 10;
    let val   = parseFloat(inp.value);
  
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) { inp.value = max; val = max; }
  
    if (!window._essayState.grades[rid]) window._essayState.grades[rid] = {};
    window._essayState.grades[rid][qid] = val;
  
    inp.classList.remove('bg-white', 'bg-emerald-50', 'border-emerald-300', 'border-slate-300');
    inp.classList.add('bg-emerald-50', 'border-emerald-300');
  }
  
  function scoreSingleWithAI(responseId, questionId, qi, si) {
    const key = `${responseId}|${questionId}`;
    if (window._essayState.aiPending.has(key)) return;
  
    const res = window._essayState.data;
    const q   = res.essayQuestions[qi];
    const s   = res.students[si];
    const ea  = s.essayAnswers[questionId];
  
    const btn = document.getElementById(`ai-btn-${responseId}-${questionId}`);
    if (btn) { btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>'; btn.disabled = true; }
  
    window._essayState.aiPending.add(key);
  
    google.script.run
      .withSuccessHandler(aiRes => {
        window._essayState.aiPending.delete(key);
        if (btn) { btn.innerHTML = '<i class="fas fa-robot"></i>'; btn.disabled = false; }
  
        if (!aiRes.success) {
          Swal.fire({ icon: 'error', title: 'Gagal', text: aiRes.message, toast: true, position: 'top-end', timer: 3500, showConfirmButton: false });
          return;
        }
  
        // ✅ Perbarui state data agar acceptAllAIScores() bisa membaca skor baru
        ea.aiScore  = aiRes.score;
        ea.aiReason = aiRes.reason;

        if (!window._essayState.aiReasons[responseId]) window._essayState.aiReasons[responseId] = {};
        window._essayState.aiReasons[responseId][questionId] = aiRes.reason;

        const aiBadgeCell = document.getElementById(`score-${responseId}-${questionId}`)?.closest('tr')?.querySelector('td:nth-child(4)');
        if (aiBadgeCell) {
          aiBadgeCell.innerHTML = `<span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full cursor-help"
              title="${aiRes.reason}">
            <i class="fas fa-robot mr-0.5"></i>AI: ${aiRes.score}
          </span>`;
        }

        const inp = document.getElementById(`score-${responseId}-${questionId}`);
        if (inp && (inp.value === '' || parseFloat(inp.value) === 0)) {
          inp.value = aiRes.score;
          onEssayScoreInput(inp);
        }

        // Bug 5 fix: add failure handler so silent AI-score-save errors are surfaced
        google.script.run
          .withSuccessHandler(function() {})
          .withFailureHandler(function(saveErr) {
            Swal.fire({ icon: 'warning', title: 'Skor AI Tidak Tersimpan',
              text: 'Skor AI berhasil dihitung tapi gagal disimpan ke server: ' + ((saveErr && saveErr.message) || String(saveErr)),
              toast: true, position: 'top-end', timer: 4000, showConfirmButton: false });
          })
          .saveAIScoreToResponse(responseId, questionId, aiRes.score, aiRes.reason, currentUser.userID, currentUser.token);
      })
      .withFailureHandler(err => {
        window._essayState.aiPending.delete(key);
        if (btn) { btn.innerHTML = '<i class="fas fa-robot"></i>'; btn.disabled = false; }
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || String(err), toast: true, position: 'top-end', timer: 3500, showConfirmButton: false });
      })
      .scoreEssayWithAI(q.content, q.maxPoint, ea.text, q.rubric || '', currentUser.userID, currentUser.token);
  }
  
  async function scoreQuestionWithAI(qi) {
    const res = window._essayState.data;
    const q   = res.essayQuestions[qi];
  
    const pending = res.students.filter(s => {
      const ea = s.essayAnswers[q.id];
      const scored = window._essayState.grades[s.responseId]?.[q.id];
      return ea.text !== '(Tidak dijawab)' && scored === undefined;
    });
  
    if (pending.length === 0) {
      return Swal.fire({ icon: 'info', title: 'Semua Sudah Dinilai', text: 'Semua jawaban pada soal ini sudah memiliki nilai.', timer: 2000, showConfirmButton: false });
    }
  
    const confirm = await Swal.fire({
      icon: 'question',
      title: `Nilai ${pending.length} Jawaban dengan AI?`,
      html: `Soal: <b>${q.content.substring(0, 80)}${q.content.length > 80 ? '...' : ''}</b><br>
            <span class="text-sm text-slate-500">Hanya jawaban yang belum dinilai guru yang akan diproses.</span>`,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-robot mr-1"></i>Ya, Nilai dengan AI',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#4f46e5'
    });
    if (!confirm.isConfirmed) return;
  
    let done = 0;
    Swal.fire({ title: 'Menilai dengan AI...', html: `<div id="ai-progress-text">0 / ${pending.length}</div>
      <div class="w-full bg-slate-200 rounded-full h-2 mt-2"><div id="ai-progress-bar" class="h-2 rounded-full bg-indigo-500 transition-all" style="width:0%"></div></div>`,
      allowOutsideClick: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
  
    for (const s of pending) {
      const ea = s.essayAnswers[q.id];
      const si = res.students.indexOf(s);
  
      await new Promise(resolve => {
        google.script.run
          .withSuccessHandler(aiRes => {
            if (aiRes.success && !aiRes.skipped) {
              if (!window._essayState.aiReasons[s.responseId]) window._essayState.aiReasons[s.responseId] = {};
              window._essayState.aiReasons[s.responseId][q.id] = aiRes.reason;

              // ✅ Perbarui state data agar acceptAllAIScores() bisa membaca skor baru
              s.essayAnswers[q.id].aiScore  = aiRes.score;
              s.essayAnswers[q.id].aiReason = aiRes.reason;

              const inp = document.getElementById(`score-${s.responseId}-${q.id}`);
              if (inp && (inp.value === '' || parseFloat(inp.value) === 0)) {
                inp.value = aiRes.score;
                onEssayScoreInput(inp);
              }
              const aiBadgeCell = inp?.closest('tr')?.querySelector('td:nth-child(4)');
              if (aiBadgeCell) {
                aiBadgeCell.innerHTML = `<span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full" title="${aiRes.reason}">
                  <i class="fas fa-robot mr-0.5"></i>AI: ${aiRes.score}</span>`;
              }
              // Bug 5 fix: add failure handler
              google.script.run
                .withSuccessHandler(function() {})
                .withFailureHandler(function() {})
                .saveAIScoreToResponse(s.responseId, q.id, aiRes.score, aiRes.reason, currentUser.userID, currentUser.token);
            }
            done++;
            const pct = Math.round(done / pending.length * 100);
            const pb  = document.getElementById('ai-progress-bar');
            const pt  = document.getElementById('ai-progress-text');
            if (pb) pb.style.width = pct + '%';
            if (pt) pt.textContent = `${done} / ${pending.length}`;
            resolve();
          })
          .withFailureHandler(() => { done++; resolve(); })
          .scoreEssayWithAI(q.content, q.maxPoint, ea.text, q.rubric || '', currentUser.userID, currentUser.token);
      });
    }
  
    Swal.fire({ icon: 'success', title: 'Selesai!', text: `${done} jawaban telah dinilai AI. Periksa dan revisi jika perlu, lalu simpan.`, confirmButtonText: 'OK', confirmButtonColor: '#4f46e5' });
  }
  
  async function scoreAllPendingWithAI() {
    const res = window._essayState.data;
    const allPending = [];
    res.students.forEach(s => {
      res.essayQuestions.forEach(q => {
        const ea     = s.essayAnswers[q.id];
        const scored = window._essayState.grades[s.responseId]?.[q.id];
        if (ea.text !== '(Tidak dijawab)' && scored === undefined) {
          allPending.push({ s, q });
        }
      });
    });
  
    if (allPending.length === 0) {
      return Swal.fire({ icon: 'info', title: 'Semua Sudah Dinilai', timer: 2000, showConfirmButton: false });
    }
  
    const confirm = await Swal.fire({
      icon: 'question', title: `Nilai ${allPending.length} Jawaban dengan AI?`,
      text: 'Semua jawaban esai yang belum dinilai akan diproses secara berurutan.',
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-robot mr-1"></i>Mulai Penilaian AI',
      cancelButtonText: 'Batal', confirmButtonColor: '#4f46e5'
    });
    if (!confirm.isConfirmed) return;
  
    let done = 0;
    Swal.fire({ title: 'Menilai dengan AI...', html: `<div id="ai-progress-text">0 / ${allPending.length}</div>
      <div class="w-full bg-slate-200 rounded-full h-2 mt-2"><div id="ai-progress-bar" class="h-2 rounded-full bg-indigo-500 transition-all" style="width:0%"></div></div>`,
      allowOutsideClick: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });
  
    for (const { s, q } of allPending) {
      const ea = s.essayAnswers[q.id];
      await new Promise(resolve => {
        google.script.run
          .withSuccessHandler(aiRes => {
            if (aiRes.success && !aiRes.skipped) {
              if (!window._essayState.aiReasons[s.responseId]) window._essayState.aiReasons[s.responseId] = {};
              window._essayState.aiReasons[s.responseId][q.id] = aiRes.reason;

              // ✅ Perbarui state data agar acceptAllAIScores() bisa membaca skor baru
              s.essayAnswers[q.id].aiScore  = aiRes.score;
              s.essayAnswers[q.id].aiReason = aiRes.reason;

              const inp = document.getElementById(`score-${s.responseId}-${q.id}`);
              if (inp && (inp.value === '' || parseFloat(inp.value) === 0)) { inp.value = aiRes.score; onEssayScoreInput(inp); }
              const aiBadgeCell = inp?.closest('tr')?.querySelector('td:nth-child(4)');
              if (aiBadgeCell) {
                aiBadgeCell.innerHTML = `<span class="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full" title="${aiRes.reason}">
                  <i class="fas fa-robot mr-0.5"></i>AI: ${aiRes.score}</span>`;
              }
              // Bug 5 fix: add failure handler
              google.script.run
                .withSuccessHandler(function() {})
                .withFailureHandler(function() {})
                .saveAIScoreToResponse(s.responseId, q.id, aiRes.score, aiRes.reason, currentUser.userID, currentUser.token);
            }
            done++;
            const pct = Math.round(done / allPending.length * 100);
            const pb  = document.getElementById('ai-progress-bar');
            const pt  = document.getElementById('ai-progress-text');
            if (pb) pb.style.width = pct + '%';
            if (pt) pt.textContent = `${done} / ${allPending.length}`;
            resolve();
          })
          .withFailureHandler(() => { done++; resolve(); })
          .scoreEssayWithAI(q.content, q.maxPoint, ea.text, q.rubric || '', currentUser.userID, currentUser.token);
      });
    }
  
    Swal.fire({ icon: 'success', title: 'Penilaian AI Selesai!',
      text: `${done} jawaban telah dinilai. Input skor sudah terisi otomatis — periksa dan revisi jika perlu, lalu klik Simpan Semua.`,
      confirmButtonText: 'OK', confirmButtonColor: '#4f46e5' });
  }
  
  function acceptAllAIScores() {
    const res = window._essayState.data;
    if (!res) return;
    let count = 0;
  
    res.students.forEach(s => {
      res.essayQuestions.forEach(q => {
        const ea      = s.essayAnswers[q.id];
        if (ea.text === '(Tidak dijawab)') return;
        const aiScore = ea.aiScore;
        // Bug 9 fix: was `=== null` which misses undefined — use proper numeric guard
        if (typeof aiScore !== 'number' || !isFinite(aiScore)) return;
  
        const inp = document.getElementById(`score-${s.responseId}-${q.id}`);
        if (inp) {
          inp.value = aiScore;
          onEssayScoreInput(inp);
          count++;
        }
      });
    });
  
    Swal.fire({ icon: 'success', title: `${count} Skor AI Diterima`, text: 'Semua skor AI telah diisi ke kolom Skor Guru. Klik Simpan Semua untuk menyimpan ke database.', timer: 2500, showConfirmButton: false });
  }
  
  function saveAllEssayGrades() {
    const res    = window._essayState.data;
    const grades = window._essayState.grades;
  
    if (!res || Object.keys(grades).length === 0) {
      return Swal.fire({ icon: 'warning', title: 'Tidak Ada Data', text: 'Isi nilai untuk setidaknya satu siswa terlebih dahulu.' });
    }
  
    let hasError = false;
    for (const rid in grades) {
      for (const qid in grades[rid]) {
        const q   = res.essayQuestions.find(q => q.id === qid);
        const max = q ? q.maxPoint : 10;
        const val = grades[rid][qid];
        if (val > max) {
          Swal.fire({ icon: 'error', title: 'Nilai Melebihi Batas', text: `Terdapat nilai melebihi bobot maksimum (${max} poin). Periksa kembali.` });
          hasError = true;
          break;
        }
      }
      if (hasError) break;
    }
    if (hasError) return;
  
    const btn = document.getElementById('btn-save-all');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-1"></i>Menyimpan...'; }
  
    google.script.run
      .withSuccessHandler(saveRes => {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i> Simpan Semua Nilai'; }
        if (saveRes.success) {
          Swal.fire({ icon: 'success', title: 'Nilai Tersimpan!',
            html: `<b>${saveRes.savedCount}</b> data nilai berhasil disimpan ke database.${saveRes.failCount > 0 ? `<br><span class="text-red-500">${saveRes.failCount} gagal.</span>` : ''}
                  <br><span class="text-sm text-slate-500">Nilai total siswa sudah diperbarui otomatis.</span>`,
            confirmButtonText: 'OK', confirmButtonColor: '#059669'
          }).then(() => {
            loadEssayAnalysis();
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: saveRes.message });
        }
      })
      .withFailureHandler(err => {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i> Simpan Semua Nilai'; }
        Swal.fire({ icon: 'error', title: 'Error', text: err.message || String(err) });
      })
      .batchSaveEssayGrades(res.examID, grades, currentUser.userID, currentUser.token);
  }
  
  // Bug 6 fix: safe dispatcher — reads answer from lookup map, never from onclick attribute
  function _iaShowEssayAnswer(el) {
    var sid  = el.getAttribute('data-sid');
    var qid  = el.getAttribute('data-qid');
    var name = el.getAttribute('data-name') || '';
    var key  = sid + '|' + qid;
    var entry = (window._iaEssayAnswerMap || {})[key];
    if (!entry) return;
    showFullEssayAnswer(name, entry.question, entry.text);
  }

  // Bug 6 fix: rewritten — all params are safe values (no raw HTML embedded from onclick)
  function showFullEssayAnswer(studentName, questionText, answerText) {
    // Escape for safe HTML rendering inside Swal
    var safeQ = _esc(String(questionText || '').substring(0, 120));
    var safeA = _esc(String(answerText || ''));
    Swal.fire({
      title: _esc(studentName),
      html: '<div class="text-left">'
        + '<p class="text-xs text-slate-500 mb-3 italic">' + safeQ + '</p>'
        + '<div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-serif max-h-72 overflow-y-auto">'
        + '"' + safeA + '"'
        + '</div></div>',
      showConfirmButton: true, confirmButtonText: 'Tutup', confirmButtonColor: '#6366f1', width: '600px'
    });
  }
  
  function buildEssayStatsPanel(res) {
    const { essayQuestions, students } = res;
    if (!essayQuestions.length || !students.length) return '';
  
    const qStats = essayQuestions.map(q => {
      const scores = students
        .map(s => {
          const saved = window._essayState.grades[s.responseId]?.[q.id];
          const ea    = s.essayAnswers[q.id];
          if (ea.text === '(Tidak dijawab)') return null;
          if (saved !== undefined) return saved;
          return ea.teacherScore;
        })
        .filter(v => v !== null && v !== undefined);
  
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const max = q.maxPoint;
      return { id: q.id, label: q.content.substring(0, 50), avg: Math.round(avg * 10) / 10, max, pct: Math.round(avg / max * 100) };
    });
  
    const bars = qStats.map((qs, i) => {
      const color = qs.pct >= 70 ? 'bg-emerald-500' : qs.pct >= 40 ? 'bg-yellow-500' : 'bg-red-400';
      return `<div class="flex items-center gap-3 mb-3">
        <span class="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-black flex items-center justify-center flex-shrink-0">${i + 1}</span>
        <div class="flex-1">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-600 truncate max-w-xs">${qs.label}</span>
            <span class="font-bold text-slate-700 ml-2">${qs.avg}/${qs.max}</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div class="${color} h-2 rounded-full" style="width:${qs.pct}%"></div>
          </div>
        </div>
        <span class="text-xs font-bold text-slate-500 w-10 text-right">${qs.pct}%</span>
      </div>`;
    }).join('');
  
    return `<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-5 mt-5">
      <p class="text-sm font-bold text-emerald-700 mb-4"><i class="fas fa-chart-bar mr-2"></i>Rata-rata Skor Per Soal Esai</p>
      ${bars}
    </div>`;
  }
  
  function exportEssayAnalysisToExcel() {
    const res = window._essayState.data;
    if (!res) return Swal.fire({ icon: 'warning', title: 'Tidak Ada Data', text: 'Muat data terlebih dahulu.' });
  
    try {
      const wb = XLSX.utils.book_new();
      const { essayQuestions, students, examInfo } = res;
  
      const headerRow = ['No', 'Nama Siswa', 'Kelas', 'Skor Total Ujian',
        ...essayQuestions.map((q, i) => `Esai ${i+1} (max ${q.maxPoint})`),
        'Total Esai', 'Status Penilaian'
      ];
      const dataRows = [headerRow];
      students.forEach((s, si) => {
        let totalEssay = 0, allGraded = true;
        const perQ = essayQuestions.map(q => {
          const ea  = s.essayAnswers[q.id];
          const saved = window._essayState.grades[s.responseId]?.[q.id];
          const score = saved !== undefined ? saved : ea.teacherScore;
          if (ea.text !== '(Tidak dijawab)' && score === null) allGraded = false;
          if (score !== null && score !== undefined) totalEssay += score;
          return score !== null && score !== undefined ? score : '-';
        });
        dataRows.push([si+1, s.studentName, s.studentClass, s.totalScore, ...perQ, Math.round(totalEssay*10)/10, allGraded ? 'Sudah Dinilai' : 'Belum Selesai']);
      });
      const ws1 = XLSX.utils.aoa_to_sheet(dataRows);
      ws1['!cols'] = [{wch:5},{wch:28},{wch:10},{wch:14},...essayQuestions.map(()=>({wch:16})),{wch:12},{wch:16}];
      XLSX.utils.book_append_sheet(wb, ws1, 'Nilai Esai');
  
      // ── Sheet 2: Jawaban Lengkap ────
      essayQuestions.forEach((q, qi) => {
        const hdr = ['No', 'Nama Siswa', 'Kelas', 'Jawaban Siswa', 'Skor AI', 'Alasan AI', 'Skor Guru', `Maks (${q.maxPoint})`];
        const rows = [hdr];
        students.forEach((s, si) => {
          const ea    = s.essayAnswers[q.id];
          const saved = window._essayState.grades[s.responseId]?.[q.id];
          const score = saved !== undefined ? saved : (ea.teacherScore !== null ? ea.teacherScore : '-');
          rows.push([si+1, s.studentName, s.studentClass, ea.text, ea.aiScore ?? '-',
            window._essayState.aiReasons[s.responseId]?.[q.id] || ea.aiReason || '-',
            score, q.maxPoint]);
        });
        const wsQ = XLSX.utils.aoa_to_sheet(rows);
        wsQ['!cols'] = [{wch:5},{wch:28},{wch:10},{wch:60},{wch:10},{wch:50},{wch:12},{wch:12}];
        XLSX.utils.book_append_sheet(wb, wsQ, `Esai_${qi+1}`.substring(0,31));
      });
  
      const fname = `AnalisisEsai_${examInfo.subject.replace(/\s+/g,'_')}_${examInfo.classes.replace(/,/g,'')}_${new Date().toLocaleDateString('id-ID').replace(/\//g,'-')}.xlsx`;
      XLSX.writeFile(wb, fname);
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: `"${fname}" berhasil diunduh.`, timer: 2500, showConfirmButton: false });
  
    } catch(e) {
      Swal.fire({ icon: 'error', title: 'Gagal Ekspor', text: e.message || String(e) });
    }
  }

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