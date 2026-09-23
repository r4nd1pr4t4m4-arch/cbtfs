/**
 * exam-modal.js — Modal Form Jadwal Ujian (openExamModal)
 * openExamModal(), populateClassCheckboxes(), loadMasterDataForUser(), assignment helpers
 * Sumber: index.html L38237-38573
 */

function openExamModal(data = null) {
    // Deep-copy data agar object dari cachedExams / BatchSoal (yang mungkin
    // ter-freeze) tidak langsung dimutasi saat kita membaca/menetapkan nilainya.
    if (data !== null && typeof data === 'object') {
        try { data = JSON.parse(JSON.stringify(data)); } catch (e) { /* pakai original */ }
    }

    const modal = document.getElementById('examModal');

    if (!modal) {
        initExamModalComponent();
        return setTimeout(() => openExamModal(data), 100);
    }

    const title = document.getElementById('examModalTitle');
    const btn = document.getElementById('btnSaveExam');

    document.getElementById('examForm').reset();
    document.getElementById('input-examId').value = '';

    const toLocalISO = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        return local.toISOString().slice(0, 16);
    };

    if (data) {
        title.innerText = 'Edit Jadwal Ujian';
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Update Data';
        document.getElementById('input-examId').value = data.id;
        document.getElementById('input-date').value = toLocalISO(data.date);
        document.getElementById('input-endDate').value = toLocalISO(data.endDate);
        document.getElementById('input-duration').value = data.duration;
        document.getElementById('input-pin').value = data.pin;
        if (document.getElementById('input-passing-grade')) document.getElementById('input-passing-grade').value = data.passingGrade || 0;
        if (document.getElementById('input-bypass-period')) document.getElementById('input-bypass-period').checked = data.bypassInputPeriod || false;

        const sc = data.shuffleConfig || {};
        ['PG','PG_KOMPLEKS','BS','JODOH','Esai'].forEach(t => {
          const el = document.getElementById('shuffle-' + t);
          if (el) el.checked = !!sc[t];
        });
        const tc = data.typeConfig || {};
        ['PG','PG_KOMPLEKS','BS','JODOH','Esai'].forEach(t => {
          const enableEl = document.getElementById('typeconfig-enabled-' + t);
          const maxEl    = document.getElementById('typeconfig-max-' + t);
          const optEl    = document.getElementById('typeconfig-optcount-' + t);
          const dpEl     = document.getElementById('typeconfig-defaultpoint-' + t);
          const cfg = tc[t];
          const isEnabled = cfg ? cfg.enabled !== false : true;
          if (enableEl) enableEl.checked = isEnabled;
          if (maxEl)    maxEl.value = cfg ? (cfg.max || 0) : 0;
          if (optEl)    optEl.value = cfg && cfg.optCount ? cfg.optCount : 5;
          const _dpFallbackEdit = { PG:1, PG_KOMPLEKS:1, BS:1, JODOH:1, Esai:5 };
          if (dpEl)     dpEl.value  = (cfg && cfg.defaultPoint != null) ? cfg.defaultPoint : _dpFallbackEdit[t];
          toggleTypeMaxInput(t, isEnabled);
        });
    } else {
        title.innerText = 'Buat Jadwal Baru';

        ['PG','PG_KOMPLEKS','BS','JODOH','Esai'].forEach(t => {
          const el = document.getElementById('shuffle-' + t);
          if (el) el.checked = false;
        });
        const _dpFallbackNew = { PG:1, PG_KOMPLEKS:1, BS:1, JODOH:1, Esai:5 };
        ['PG','PG_KOMPLEKS','BS','JODOH','Esai'].forEach(t => {
          const enableEl = document.getElementById('typeconfig-enabled-' + t);
          const maxEl    = document.getElementById('typeconfig-max-' + t);
          const optEl    = document.getElementById('typeconfig-optcount-' + t);
          const dpEl     = document.getElementById('typeconfig-defaultpoint-' + t);
          if (enableEl) enableEl.checked = true;
          if (maxEl)    maxEl.value = 0;
          if (optEl)    optEl.value = 5;
          if (dpEl)     dpEl.value  = _dpFallbackNew[t];
          toggleTypeMaxInput(t, true);
        });
        btn.innerHTML = '<i class="fas fa-save"></i> Simpan Jadwal';
        const now = new Date();
        const next = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        document.getElementById('input-date').value = toLocalISO(now);
        document.getElementById('input-endDate').value = toLocalISO(next);
        document.getElementById('input-duration').value = '60';
        document.getElementById('input-pin').value = Math.floor(10000 + Math.random() * 90000);
        if (document.getElementById('input-passing-grade')) document.getElementById('input-passing-grade').value = 0;
        if (document.getElementById('input-bypass-period')) document.getElementById('input-bypass-period').checked = false;
    }

    const subjSelect = document.getElementById('input-subject');

    const applySelection = (allSubjects, allClasses) => {
        const selectedClasses = data ? String(data.class || '').split(',').map(c => c.trim()) : [];

        if (currentUser && currentUser.role === 'Guru') {
            google.script.run
                .withSuccessHandler(assignments => {
                    const guruSubjects = [...new Set(assignments.map(a => a.subject))];
                    const guruClasses  = [...new Set(assignments.map(a => a.classVal))];

                    populateSelect(subjSelect, guruSubjects, false);
                    populateClassCheckboxes(guruClasses, selectedClasses);

                    if (data) subjSelect.value = data.subject || '';
                })
                .getTeacherAssignments(currentUser.userID, currentUser.token);
        } else {
            populateSelect(subjSelect, allSubjects, false);
            populateClassCheckboxes(allClasses, selectedClasses);
            if (data) subjSelect.value = data.subject || '';
        }
    };

    if (!masterData.classes || masterData.classes.length === 0) {
        google.script.run.withSuccessHandler(md => {
            if (md) {
                masterData = md;
                applySelection(md.subjects || [], md.classes || []);
            }
        }).getMasterData();
    } else {
        applySelection(masterData.subjects || [], masterData.classes || []);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Trigger initial helper recompute
    setTimeout(examTimeChanged, 50);
    // Focus first field for keyboard users
    setTimeout(() => {
      const subj = document.getElementById('input-subject');
      if (subj) try { subj.focus(); } catch(e) {}
    }, 80);
}

// renderAssignmentDropdown, fillAssignmentInput, loadMasterDataForUser dihapus:
// fungsi-fungsi ini tidak pernah dipanggil dari exam-modal dan termasuk
// modul user-form yang seharusnya ada di user-modal.js.
function refreshAllTeacherAssignmentDropdowns() {
    const rows = document.querySelectorAll('#teacher-assignments-container .assignment-row');
    rows.forEach(row => {
        const subSelect = row.querySelector('.assign-subject');
        const clsSelect = row.querySelector('.assign-class');
        if (!subSelect || !clsSelect) return;

        const currentSub = subSelect.value;
        const currentCls = clsSelect.value;

        let subOpts = `<option value="">— Pilih Mapel —</option>`;
        (masterData.subjects || []).forEach(s => {
            const sClean = String(s).trim();
            const sel = (currentSub && sClean === String(currentSub).trim()) ? 'selected' : '';
            subOpts += `<option value="${sClean}" ${sel}>${sClean}</option>`;
        });
        subSelect.innerHTML = subOpts;

        let clsOpts = `<option value="">— Pilih Kelas —</option>`;
        (masterData.classes || []).forEach(c => {
            const cClean = String(c).trim();
            const sel = (currentCls && cClean === String(currentCls).trim()) ? 'selected' : '';
            clsOpts += `<option value="${cClean}" ${sel}>${cClean}</option>`;
        });
        clsSelect.innerHTML = clsOpts;

        subSelect.style.color = '#000000';
        clsSelect.style.color = '#000000';
    });
}

function renderStudentClassDropdown(selectedValue = null) {
    const select = document.getElementById('input-student-class');
    if (!select) return;

    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';

    if (masterData && masterData.classes) {
        masterData.classes.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;

            if (selectedValue && String(c) === String(selectedValue)) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    }
}

function addTeacherAssignmentRow(subjectVal = '', classVal = '') {
    const container = document.getElementById('teacher-assignments-container');
    if (!container) return;

    let subOpts = `<option value="">— Pilih Mapel —</option>`;
    if (masterData && masterData.subjects && masterData.subjects.length > 0) {
        masterData.subjects.forEach(s => {
            const sClean = String(s).trim();
            const selected = (subjectVal && sClean === String(subjectVal).trim()) ? 'selected' : '';
            subOpts += `<option value="${sClean}" ${selected}>${sClean}</option>`;
        });
    }

    let clsOpts = `<option value="">— Pilih Kelas —</option>`;
    if (masterData && masterData.classes && masterData.classes.length > 0) {
        masterData.classes.forEach(c => {
            const cClean = String(c).trim();
            const selected = (classVal && cClean === String(classVal).trim()) ? 'selected' : '';
            clsOpts += `<option value="${cClean}" ${selected}>${cClean}</option>`;
        });
    }

    const div = document.createElement('div');
    div.className = 'assignment-row flex gap-2 items-center animate-[fadeIn_0.2s_ease-out]';
    div.innerHTML = `
        <select class="assign-subject flex-1 min-w-[120px] border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition" style="color: #000000; max-width: 100%;">
            ${subOpts}
        </select>
        <select class="assign-class flex-1 min-w-[150px] border border-slate-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition" style="color: #000000; max-width: 100%;">
            ${clsOpts}
        </select>
        <button type="button" onclick="this.parentElement.remove()"
                class="shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Hapus baris ini">
            <i class="fas fa-trash text-sm"></i>
        </button>
    `;
    container.appendChild(div);
}


