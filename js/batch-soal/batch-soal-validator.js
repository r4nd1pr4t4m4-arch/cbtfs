/**
 * batch-soal-validator.js
 * BatchSoal.Validator — Validasi input soal.
 * Sumber: index.html L8915-9643
 */
/* ─── Block L8915-L9005 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Validator = BatchSoal.Validator || {};

    function formatNumberForMessage(num) {
      if (Number.isInteger(num)) {
        return String(num);
      }
      return String(num).replace('.', ',');
    }

    function validateCommon(parsed) {
      var errors = [];

      if (!parsed || typeof parsed !== 'object') {
        errors.push('bobot nilai tidak valid.');
        errors.push('status wajib tidak valid.');
        return errors;
      }

      var point = parsed.point;
      var pointRaw = parsed.pointRaw;
      if (point === null || point === undefined) {
        if (pointRaw !== null && pointRaw !== undefined && String(pointRaw).trim() !== '') {
          errors.push('bobot nilai "' + String(pointRaw) + '" tidak valid (gunakan angka antara 0,01 dan 100).');
        } else {
          errors.push('bobot nilai tidak valid.');
        }
      } else if (typeof point !== 'number' || !isFinite(point)) {
        errors.push('bobot nilai tidak valid.');
      } else if (point < 0.01 || point > 100) {
        errors.push('bobot nilai ' + formatNumberForMessage(point) + ' di luar rentang 0,01..100.');
      }

      var isRequired = parsed.isRequired;
      var isRequiredRaw = parsed.isRequiredRaw;
      if (isRequired === null || isRequired === undefined) {
        if (isRequiredRaw !== null && isRequiredRaw !== undefined && String(isRequiredRaw).trim() !== '') {
          errors.push('status wajib "' + String(isRequiredRaw) + '" tidak valid (gunakan TRUE, FALSE, WAJIB, atau OPSIONAL).');
        } else {
          errors.push('status wajib tidak valid.');
        }
      } else if (isRequired !== 'TRUE' && isRequired !== 'FALSE') {
        errors.push('status wajib "' + String(isRequired) + '" tidak dikenali.');
      }

      return errors;
    }

    function findCaseInsensitiveDuplicates(arr) {
      if (!arr || typeof arr.length !== 'number') {
        return [];
      }
      var map = new Map();
      var firstSeenAt = new Map();
      for (var i = 0; i < arr.length; i++) {
        var v = arr[i];
        if (typeof v !== 'string') {
          continue;
        }
        var key = v.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, [i]);
          firstSeenAt.set(key, i);
        } else {
          map.get(key).push(i);
        }
      }
      var groups = [];
      var keys = Array.from(map.keys());
      keys.sort(function (a, b) {
        return firstSeenAt.get(a) - firstSeenAt.get(b);
      });
      for (var k = 0; k < keys.length; k++) {
        var indices = map.get(keys[k]);
        if (indices.length >= 2) {
          groups.push(indices.slice());
        }
      }
      return groups;
    }

    BatchSoal.Validator.validateCommon = validateCommon;
    BatchSoal.Validator.findCaseInsensitiveDuplicates = findCaseInsensitiveDuplicates;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── Block L9007-L9368 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Validator = BatchSoal.Validator || {};


    function normalizeOptCount(optCount) {
      var n = Number(optCount);
      if (!isFinite(n) || n < 2 || n > 6 || Math.floor(n) !== n) {
        return 5;
      }
      return n;
    }

    function letterFromIndex(i) {
      return String.fromCharCode(65 + i);
    }

    function isLetterInRange(letter, optCount) {
      if (typeof letter !== 'string' || letter.length !== 1) return false;
      var code = letter.charCodeAt(0);
      return code >= 65 && code <= 64 + optCount;
    }

    function trimmedLen(s) {
      if (typeof s !== 'string') return 0;
      return s.trim().length;
    }

    function indicesToOneBasedList(indices) {
      var parts = [];
      for (var i = 0; i < indices.length; i++) {
        parts.push(String(indices[i] + 1));
      }
      return parts.join(', ');
    }

    function indicesToOptionLetters(indices, optionLetters) {
      var parts = [];
      var hasLetters = !!(optionLetters && typeof optionLetters.length === 'number');
      for (var i = 0; i < indices.length; i++) {
        var idx = indices[i];
        var letter = (hasLetters && typeof optionLetters[idx] === 'string' && optionLetters[idx].length > 0)
          ? optionLetters[idx]
          : letterFromIndex(idx);
        parts.push(letter);
      }
      return parts.join(', ');
    }

    function validateOptionsBlock(options, optionLetters, optCount) {
      var errors = [];
      var opts = (options && typeof options.length === 'number') ? options : [];
      var letters = (optionLetters && typeof optionLetters.length === 'number') ? optionLetters : [];
      var count = opts.length;

      if (count < 2 || count > optCount) {
        errors.push('jumlah opsi ' + count + ' di luar rentang 2..' + optCount + '.');
      }

      for (var i = 0; i < count; i++) {
        var len = trimmedLen(opts[i]);
        if (len < 1 || len > 500) {
          var letter = (typeof letters[i] === 'string' && letters[i].length > 0)
            ? letters[i]
            : letterFromIndex(i);
          errors.push('opsi ' + letter + ' kosong atau melebihi 500 karakter.');
        }
      }

      if (count >= 1) {
        var ordered = true;
        for (var j = 0; j < count; j++) {
          if (letters[j] !== letterFromIndex(j)) {
            ordered = false;
            break;
          }
        }
        if (!ordered) {
          var maxLetter = letterFromIndex(count - 1);
          errors.push('urutan huruf opsi tidak berurutan A..' + maxLetter + '.');
        }
      }

      var dupGroups = BatchSoal.Validator.findCaseInsensitiveDuplicates(opts);
      for (var g = 0; g < dupGroups.length; g++) {
        errors.push('opsi duplikat: ' + indicesToOptionLetters(dupGroups[g], letters) + '.');
      }

      return errors;
    }

    function validatePG(parsed, optCount) {
      var errors = BatchSoal.Validator.validateCommon(parsed).slice();
      var oc = normalizeOptCount(optCount);

      if (!parsed || typeof parsed !== 'object') {
        errors.push('struktur soal PG tidak dapat dibaca.');
        return errors;
      }

      var contentLen = trimmedLen(parsed.content);
      if (contentLen < 1 || contentLen > 2000) {
        errors.push('pertanyaan kosong atau melebihi 2000 karakter (panjang aktual: ' + contentLen + ').');
      }

      var optionErrors = validateOptionsBlock(parsed.options, parsed.optionLetters, oc);
      for (var i = 0; i < optionErrors.length; i++) {
        errors.push(optionErrors[i]);
      }

      var maxLetter = letterFromIndex(oc - 1);
      var correct = (typeof parsed.correct === 'string') ? parsed.correct : null;
      if (correct === null || !isLetterInRange(correct, oc)) {
        var rawForMsg = (typeof parsed.correctRaw === 'string') ? parsed.correctRaw : '';
        errors.push('kunci jawaban "' + rawForMsg + '" tidak valid (harus huruf A..' + maxLetter + ').');
      }

      return errors;
    }

    function validatePGKompleks(parsed, optCount) {
      var errors = BatchSoal.Validator.validateCommon(parsed).slice();
      var oc = normalizeOptCount(optCount);

      if (!parsed || typeof parsed !== 'object') {
        errors.push('struktur soal PG_KOMPLEKS tidak dapat dibaca.');
        return errors;
      }

      var contentLen = trimmedLen(parsed.content);
      if (contentLen < 1 || contentLen > 2000) {
        errors.push('pertanyaan kosong atau melebihi 2000 karakter (panjang aktual: ' + contentLen + ').');
      }

      var optionErrors = validateOptionsBlock(parsed.options, parsed.optionLetters, oc);
      for (var oi = 0; oi < optionErrors.length; oi++) {
        errors.push(optionErrors[oi]);
      }

      var maxLetter = letterFromIndex(oc - 1);
      var correctList = (parsed.correctList && typeof parsed.correctList.length === 'number')
        ? parsed.correctList
        : [];
      var correctRaw = (typeof parsed.correctRaw === 'string') ? parsed.correctRaw : '';

      if (correctList.length === 1) {
        if (/[A-Za-z]\s*[;\.]\s*[A-Za-z]/.test(correctRaw)) {
          errors.push('pemisah kunci jawaban tidak valid (gunakan koma).');
        }
      }

      if (correctList.length < 2 || correctList.length > oc) {
        errors.push('jumlah kunci jawaban ' + correctList.length + ' di luar rentang 2..' + oc + '.');
      }

      var seenEmpty = false;
      for (var k = 0; k < correctList.length; k++) {
        var entryRaw = correctList[k];
        var entry = (typeof entryRaw === 'string') ? entryRaw.trim() : '';
        if (entry === '') {
          if (!seenEmpty) {
            errors.push('kunci jawaban berisi entri kosong (cek koma berurutan atau separator selain koma).');
            seenEmpty = true;
          }
          continue;
        }
        var letter = entry.toUpperCase();
        if (letter.length !== 1 || !isLetterInRange(letter, oc)) {
          errors.push('huruf kunci "' + entryRaw + '" tidak valid (harus A..' + maxLetter + ').');
        }
      }

      var keyDupGroups = BatchSoal.Validator.findCaseInsensitiveDuplicates(correctList);
      if (keyDupGroups.length > 0) {
        var labels = [];
        for (var dg = 0; dg < keyDupGroups.length; dg++) {
          var grp = keyDupGroups[dg];
          var firstIdx = grp[0];
          var raw = correctList[firstIdx];
          var label = (typeof raw === 'string') ? raw.trim().toUpperCase() : '';
          labels.push(label);
        }
        errors.push('kunci jawaban duplikat: ' + labels.join(', ') + '.');
      }

      return errors;
    }

    function validateBS(parsed  ) {
      var errors = BatchSoal.Validator.validateCommon(parsed).slice();

      if (!parsed || typeof parsed !== 'object') {
        errors.push('struktur soal BS tidak dapat dibaca.');
        return errors;
      }

      var contentLen = trimmedLen(parsed.content);
      if (contentLen < 1 || contentLen > 2000) {
        errors.push('pengantar kosong atau melebihi 2000 karakter.');
      }

      var statements = (parsed.statements && typeof parsed.statements.length === 'number')
        ? parsed.statements
        : [];

      if (statements.length < 3 || statements.length > 20) {
        errors.push('jumlah pernyataan ' + statements.length + ' di luar rentang 3..20.');
      }

      var texts = [];
      for (var i = 0; i < statements.length; i++) {
        var st = statements[i] || {};
        var text = (typeof st.text === 'string') ? st.text : '';
        texts.push(text);
        var len = trimmedLen(text);
        if (len < 1 || len > 500) {
          errors.push('pernyataan #' + (i + 1) + ' kosong atau melebihi 500 karakter.');
        }
        var key = st.key;
        if (key !== 'Benar' && key !== 'Salah') {
          var keyRaw = (typeof st.keyRaw === 'string') ? st.keyRaw : '';
          errors.push('pernyataan #' + (i + 1) + ' kunci "' + keyRaw + '" tidak valid (harus Benar/Salah).');
        }
      }

      var dupGroups = BatchSoal.Validator.findCaseInsensitiveDuplicates(texts);
      for (var g = 0; g < dupGroups.length; g++) {
        errors.push('pernyataan duplikat: #' + indicesToOneBasedList(dupGroups[g]) + '.');
      }

      return errors;
    }

    function validateJODOH(parsed  ) {
      var errors = BatchSoal.Validator.validateCommon(parsed).slice();

      if (!parsed || typeof parsed !== 'object') {
        errors.push('struktur soal JODOH tidak dapat dibaca.');
        return errors;
      }

      var contentLen = trimmedLen(parsed.content);
      if (contentLen < 1 || contentLen > 2000) {
        errors.push('pengantar kosong atau melebihi 2000 karakter.');
      }

      var pairs = (parsed.pairs && typeof parsed.pairs.length === 'number')
        ? parsed.pairs
        : [];
      var distractors = (parsed.distractors && typeof parsed.distractors.length === 'number')
        ? parsed.distractors
        : [];

      if (pairs.length < 3 || pairs.length > 50) {
        errors.push('jumlah pasangan ' + pairs.length + ' di luar rentang 3..50.');
      }

      if (distractors.length < 1 || distractors.length > 3) {
        errors.push('jumlah pengacoh ' + distractors.length + ' di luar rentang 1..3.');
      }

      for (var i = 0; i < pairs.length; i++) {
        var p = pairs[i] || {};
        var aTrim = (typeof p.a === 'string') ? p.a.trim() : '';
        if (aTrim === '') {
          errors.push('pasangan #' + (i + 1) + ' sisi kanan kosong.');
        }
      }

      var leftSides = [];
      for (var lp = 0; lp < pairs.length; lp++) {
        leftSides.push(pairs[lp] && typeof pairs[lp].q === 'string' ? pairs[lp].q : '');
      }
      var leftDups = BatchSoal.Validator.findCaseInsensitiveDuplicates(leftSides);
      for (var lg = 0; lg < leftDups.length; lg++) {
        errors.push('sisi kiri pasangan duplikat: #' + indicesToOneBasedList(leftDups[lg]) + '.');
      }

      var rightSides = [];
      for (var rp = 0; rp < pairs.length; rp++) {
        rightSides.push(pairs[rp] && typeof pairs[rp].a === 'string' ? pairs[rp].a : '');
      }
      for (var rd = 0; rd < distractors.length; rd++) {
        rightSides.push(distractors[rd] && typeof distractors[rd].a === 'string' ? distractors[rd].a : '');
      }
      var rightDups = BatchSoal.Validator.findCaseInsensitiveDuplicates(rightSides);
      for (var rg = 0; rg < rightDups.length; rg++) {
        errors.push('sisi kanan duplikat: #' + indicesToOneBasedList(rightDups[rg]) + '.');
      }

      var items = pairs.concat(distractors);
      for (var it = 0; it < items.length; it++) {
        var item = items[it] || {};
        var qLen = trimmedLen(item.q);
        var aLen = trimmedLen(item.a);
        if (qLen > 500) {
          errors.push('sisi kiri #' + (it + 1) + ' melebihi 500 karakter.');
        }
        if (aLen > 500) {
          errors.push('sisi kanan #' + (it + 1) + ' melebihi 500 karakter.');
        }
      }

      return errors;
    }

    function validateEsai(parsed  ) {
      var errors = BatchSoal.Validator.validateCommon(parsed).slice();

      if (!parsed || typeof parsed !== 'object') {
        errors.push('struktur soal Esai tidak dapat dibaca.');
        return errors;
      }

      var contentLen = trimmedLen(parsed.content);
      if (contentLen < 1 || contentLen > 2000) {
        errors.push('pertanyaan kosong atau melebihi 2000 karakter (panjang aktual: ' + contentLen + ').');
      }

      if (parsed.minCharEnabled === true) {
        var mc = parsed.minChar;
        var mcRaw = (typeof parsed.minCharRaw === 'string') ? parsed.minCharRaw : '';
        var validInt = (typeof mc === 'number' && isFinite(mc) && Math.floor(mc) === mc && mc >= 1 && mc <= 5000);
        if (!validInt) {
          errors.push('MinKarakter "' + mcRaw + '" tidak valid (harus bilangan bulat 1..5000).');
        }
      }

      if (parsed.keywordsPresent === true) {
        var keywords = (parsed.keywords && typeof parsed.keywords.length === 'number')
          ? parsed.keywords
          : [];
        if (keywords.length < 1 || keywords.length > 20) {
          errors.push('jumlah KataKunci ' + keywords.length + ' di luar rentang 1..20.');
        }
        for (var ki = 0; ki < keywords.length; ki++) {
          var kw = keywords[ki];
          var kwStr = (typeof kw === 'string') ? kw : '';
          var kwTrim = kwStr.trim();
          if (kwTrim === '') {
            errors.push('KataKunci #' + (ki + 1) + ' kosong.');
          } else if (kwTrim.length > 100) {
            errors.push('KataKunci #' + (ki + 1) + ' melebihi 100 karakter.');
          }
        }
      }

      return errors;
    }

    BatchSoal.Validator.validatePG = validatePG;
    BatchSoal.Validator.validatePGKompleks = validatePGKompleks;
    BatchSoal.Validator.validateBS = validateBS;
    BatchSoal.Validator.validateJODOH = validateJODOH;
    BatchSoal.Validator.validateEsai = validateEsai;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── Block L9370-L9643 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Validator = BatchSoal.Validator || {};

    function makeSnippet(text) {
      var s = String(text == null ? '' : text)
        .trim()
        .replace(/\s+/g, ' ');
      if (s.length <= 60) return s;
      return s.slice(0, 57) + '...';
    }

    function prefixSuffixErrors(suffixErrors, blockNumber) {
      if (!suffixErrors || typeof suffixErrors.length !== 'number') {
        return [];
      }
      var prefix = 'Blok ' + blockNumber + ': ';
      var out = [];
      for (var i = 0; i < suffixErrors.length; i++) {
        var msg = suffixErrors[i];
        out.push(prefix + (typeof msg === 'string' ? msg : String(msg)));
      }
      return out;
    }

    function dispatchTypeValidator(type, parsed, typeConfig) {
      var V = BatchSoal.Validator;
      var oc;
      switch (type) {
        case 'PG':
          oc = (typeConfig && typeConfig.PG && typeConfig.PG.optCount) || 5;
          return V.validatePG(parsed, oc);
        case 'PG_KOMPLEKS':
          oc = (typeConfig && typeConfig.PG_KOMPLEKS && typeConfig.PG_KOMPLEKS.optCount) || 5;
          return V.validatePGKompleks(parsed, oc);
        case 'BS':
          return V.validateBS(parsed);
        case 'JODOH':
          return V.validateJODOH(parsed);
        case 'Esai':
          return V.validateEsai(parsed);
        default:
          return ['tipe tidak dikenali untuk validasi.'];
      }
    }

    function buildSummary(type, validQuestion, parsed) {
      switch (type) {
        case 'PG':
          return {
            optionCount: (validQuestion.options && validQuestion.options.length) || 0
          };
        case 'PG_KOMPLEKS':
          return {
            optionCount: (validQuestion.options && validQuestion.options.length) || 0,
            keyCount: (validQuestion.correctList && validQuestion.correctList.length) || 0
          };
        case 'BS':
          return {
            statementCount: (validQuestion.options && validQuestion.options.length) || 0
          };
        case 'JODOH': {
          var pairCount = 0;
          var distractorCount = 0;
          if (parsed && parsed.pairs && parsed.distractors) {
            pairCount = parsed.pairs.length;
            distractorCount = parsed.distractors.length;
          } else {
            try {
              var arr = JSON.parse(validQuestion.options || '[]');
              if (Array.isArray(arr)) {
                for (var i = 0; i < arr.length; i++) {
                  var item = arr[i] || {};
                  if (item.q && String(item.q).trim() !== '') pairCount++;
                  else distractorCount++;
                }
              }
            } catch (e) {   }
          }
          return { pairCount: pairCount, distractorCount: distractorCount };
        }
        case 'Esai':
          return {
            keywordCount: (validQuestion.keywords && validQuestion.keywords.length) || 0,
            minCharEnabled: !!validQuestion.minCharEnabled
          };
        default:
          return {};
      }
    }

    function buildValidQuestion(block, parsed, typeConfig) {
      var type = parsed.type;
      var vq = {
        blockNumber: block.blockNumber,
        type: type,
        content: typeof parsed.content === 'string' ? parsed.content : '',
        imageUrl: '',
        options: undefined,
        correct: undefined,
        isRequired: parsed.isRequired === 'TRUE' || parsed.isRequired === 'FALSE'
          ? parsed.isRequired
          : 'TRUE',
        point: typeof parsed.point === 'number' && isFinite(parsed.point)
          ? parsed.point
          : 10,
        rubric: '',
        keywords: [],
        minChar: 0,
        minCharEnabled: false,
        legacyMode: !!block.legacyMode,
        summary: null
      };

      switch (type) {
        case 'PG':
          vq.options = (parsed.options && parsed.options.slice) ? parsed.options.slice() : [];
          vq.correct = typeof parsed.correct === 'string' ? parsed.correct : '';
          break;
        case 'PG_KOMPLEKS':
          vq.options = (parsed.options && parsed.options.slice) ? parsed.options.slice() : [];
          vq.correctList = (parsed.correctList && parsed.correctList.slice)
            ? parsed.correctList.slice()
            : [];
          vq.correct = JSON.stringify(vq.correctList);
          break;
        case 'BS': {
          var stmts = (parsed.statements && parsed.statements.slice)
            ? parsed.statements
            : [];
          var texts = [];
          var keyMap = {};
          for (var i = 0; i < stmts.length; i++) {
            var s = stmts[i] || {};
            var t = typeof s.text === 'string' ? s.text : '';
            texts.push(t);
            if (s.key === 'Benar' || s.key === 'Salah') {
              keyMap[t] = s.key;
            }
          }
          vq.options = texts;
          vq.correct = JSON.stringify(keyMap);
          break;
        }
        case 'JODOH': {
          var items = (parsed.items && parsed.items.slice)
            ? parsed.items.slice()
            : [];
          var copy = [];
          for (var j = 0; j < items.length; j++) {
            var it = items[j] || {};
            copy.push({
              q: typeof it.q === 'string' ? it.q : '',
              a: typeof it.a === 'string' ? it.a : ''
            });
          }
          vq.options = JSON.stringify(copy);
          vq.correct = '';
          break;
        }
        case 'Esai':
          vq.options = '[]';
          vq.correct = '';
          vq.rubric = typeof parsed.rubric === 'string' ? parsed.rubric : '';
          vq.keywords = (parsed.keywords && parsed.keywords.slice)
            ? parsed.keywords.slice()
            : [];
          vq.minCharEnabled = !!parsed.minCharEnabled;
          vq.minChar = (typeof parsed.minChar === 'number' && isFinite(parsed.minChar))
            ? parsed.minChar
            : 0;
          break;
        default:
          vq.options = [];
          vq.correct = '';
      }

      vq.summary = buildSummary(type, vq, parsed);
      return vq;
    }

    function validateParsedBlocks(parsedResult, typeConfig) {
      var globalErrors = [];
      if (parsedResult && parsedResult.globalErrors &&
          typeof parsedResult.globalErrors.length === 'number') {
        globalErrors = parsedResult.globalErrors.slice();
      }

      var valid = [];
      var invalid = [];

      var blocks = (parsedResult && parsedResult.blocks &&
                    typeof parsedResult.blocks.length === 'number')
        ? parsedResult.blocks
        : [];

      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (!block || typeof block !== 'object') continue;

        var blockNumber = block.blockNumber;
        var detectedType = block.detectedType;
        var parsed = block.parsed;
        var parserErrs = (block.parseErrors &&
                          typeof block.parseErrors.length === 'number')
          ? block.parseErrors.slice()
          : [];

        if (detectedType === null || !parsed || typeof parsed !== 'object') {
          var snippet1;
          if (parsed && typeof parsed === 'object' &&
              typeof parsed.content === 'string' && parsed.content.trim() !== '') {
            snippet1 = makeSnippet(parsed.content);
          } else {
            snippet1 = makeSnippet(firstNonBlankLine(block.rawText));
          }
          invalid.push({
            blockNumber: blockNumber,
            detectedType: detectedType || null,
            snippet: snippet1,
            errors: parserErrs.length > 0
              ? parserErrs
              : ['Blok ' + blockNumber + ': tipe soal tidak dapat ditentukan.']
          });
          continue;
        }

        var typeSuffixErrs = dispatchTypeValidator(detectedType, parsed, typeConfig);
        var typePrefixedErrs = prefixSuffixErrors(typeSuffixErrs, blockNumber);
        var combined = parserErrs.concat(typePrefixedErrs);

        if (combined.length > 0) {
          var snippet2;
          if (typeof parsed.content === 'string' && parsed.content.trim() !== '') {
            snippet2 = makeSnippet(parsed.content);
          } else {
            snippet2 = makeSnippet(firstNonBlankLine(block.rawText));
          }
          invalid.push({
            blockNumber: blockNumber,
            detectedType: detectedType,
            snippet: snippet2,
            errors: combined
          });
          continue;
        }

        valid.push(buildValidQuestion(block, parsed, typeConfig));
      }

      return {
        valid: valid,
        invalid: invalid,
        globalErrors: globalErrors
      };
    }

    function firstNonBlankLine(rawText) {
      if (typeof rawText !== 'string') return '';
      var lines = rawText.split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        if (lines[i] && lines[i].trim() !== '') return lines[i];
      }
      return '';
    }

    BatchSoal.Validator.validateParsedBlocks = validateParsedBlocks;

    root.BatchSoal = BatchSoal;
  })(window);