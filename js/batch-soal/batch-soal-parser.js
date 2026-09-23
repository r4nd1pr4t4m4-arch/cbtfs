/**
 * batch-soal-parser.js
 * BatchSoal.Parser — Parser teks soal mentah menjadi objek terstruktur.
 * Sumber: index.html L7869-8913
 */
/* ─── Block L7869-L7929 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Parser = BatchSoal.Parser || {};

    function splitBlocks(rawText) {
      if (rawText === null || rawText === undefined) {
        return [];
      }
      var text = String(rawText);
      var parts = text.split(/\r?\n\s*\r?\n+/);
      var out = [];
      for (var i = 0; i < parts.length; i++) {
        var trimmed = parts[i].trim();
        if (trimmed.length > 0) {
          out.push(trimmed);
        }
      }
      return out;
    }

    function preCheck(rawText) {
      var globalErrors = [];
      var LIMITS = BatchSoal.LIMITS;

      if (rawText === null || rawText === undefined ||
          String(rawText).trim().length === 0) {
        globalErrors.push(
          'Teks tempelan kosong atau hanya berisi whitespace.'
        );
        return { globalErrors: globalErrors };
      }

      var text = String(rawText);

      if (text.length > LIMITS.MAX_TEXT) {
        globalErrors.push(
          'Teks tempelan terlalu panjang: ' + text.length +
          ' karakter (batas ' + LIMITS.MAX_TEXT + ' karakter).'
        );
      }

      var blockCount = splitBlocks(text).length;
      if (blockCount > LIMITS.MAX_BLOCKS) {
        globalErrors.push(
          'Jumlah blok terlalu banyak: ' + blockCount +
          ' blok (batas ' + LIMITS.MAX_BLOCKS + ' blok).'
        );
      }

      return { globalErrors: globalErrors };
    }

    BatchSoal.Parser.splitBlocks = splitBlocks;
    BatchSoal.Parser.preCheck = preCheck;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── Block L7931-L8042 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Parser = BatchSoal.Parser || {};

    var TIPE_LINE_RE = /^\s*Tipe\s*:\s*(.+?)\s*$/i;

    var CANONICAL_TYPE = {
      'PG':           'PG',
      'PG_KOMPLEKS':  'PG_KOMPLEKS',
      'BS':           'BS',
      'JODOH':        'JODOH',
      'ESAI':         'Esai'
    };

    var LEGACY_NUMBER_RE = /^\s*\d+[.)]\s+/;
    var LEGACY_OPTION_RE = /^\s*[A-E][.)]\s+/i;
    var LEGACY_ANSWER_RE = /^\s*(?:jawaban|kunci|answer|jawab)\s*:\s*[A-E]\s*$/i;

    function tryDetectLegacyPG(blockLines) {
      if (!blockLines || typeof blockLines.length !== 'number') {
        return false;
      }
      var numberCount = 0;
      var optionCount = 0;
      var answerCount = 0;
      for (var i = 0; i < blockLines.length; i++) {
        var line = blockLines[i];
        if (typeof line !== 'string') {
          continue;
        }
        if (LEGACY_ANSWER_RE.test(line)) {
          answerCount++;
          continue;
        }
        if (LEGACY_NUMBER_RE.test(line)) {
          numberCount++;
          continue;
        }
        if (LEGACY_OPTION_RE.test(line)) {
          optionCount++;
        }
      }
      return (numberCount >= 1 && optionCount >= 2 && answerCount === 1);
    }

    function detectType(blockLines) {
      var lines = (blockLines && typeof blockLines.length === 'number')
        ? Array.prototype.slice.call(blockLines)
        : [];

      var markerIdx = -1;
      var markerValue = null;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (typeof line !== 'string') {
          continue;
        }
        var m = line.match(TIPE_LINE_RE);
        if (m) {
          markerIdx = i;
          markerValue = m[1];
          break;
        }
      }

      if (markerIdx !== -1) {
        var bodyWithoutMarker = lines.slice();
        bodyWithoutMarker.splice(markerIdx, 1);

        var canonical = CANONICAL_TYPE[markerValue.toUpperCase()];
        if (canonical) {
          return {
            type: canonical,
            body: bodyWithoutMarker,
            legacyMode: false,
            parseErrors: []
          };
        }
        return {
          type: null,
          body: bodyWithoutMarker,
          legacyMode: false,
          parseErrors: ["tipe '" + markerValue + "' tidak dikenali."]
        };
      }

      if (tryDetectLegacyPG(lines)) {
        return {
          type: 'PG',
          body: lines.slice(),
          legacyMode: true,
          parseErrors: []
        };
      }

      return {
        type: null,
        body: lines.slice(),
        legacyMode: false,
        parseErrors: ['tipe soal tidak dapat ditentukan.']
      };
    }

    BatchSoal.Parser.detectType = detectType;
    BatchSoal.Parser.tryDetectLegacyPG = tryDetectLegacyPG;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── Block L8044-L8330 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Parser = BatchSoal.Parser || {};
    BatchSoal.Rules = BatchSoal.Rules || {};

    var BOBOT_LINE_RE   = /^\s*Bobot\s*:\s*(.+?)\s*$/i;
    var WAJIB_LINE_RE   = /^\s*Wajib\s*:\s*(.+?)\s*$/i;
    var OPTION_LINE_RE  = /^\s*([A-F])[.)]\s?(.*)$/i;
    var ANSWER_LINE_RE  = /^\s*(?:Jawaban|Kunci|Answer|Jawab)\s*:\s*(.+?)\s*$/i;

    function normalizeOptCount(optCount) {
      var n = Number(optCount);
      if (!isFinite(n) || n < 2 || n > 6) {
        return 5;
      }
      return Math.floor(n);
    }

    function extractFirstAttribute(lines, regex) {
      var firstIdx = -1;
      var firstRaw = null;
      var duplicateCount = 0;
      var rest = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (typeof line !== 'string') {
          rest.push(line);
          continue;
        }
        var m = line.match(regex);
        if (m) {
          if (firstIdx === -1) {
            firstIdx = i;
            firstRaw = m[1].trim();
            continue;
          }
          duplicateCount++;
          continue;
        }
        rest.push(line);
      }
      return { raw: firstRaw, rest: rest, duplicateCount: duplicateCount };
    }

    function resolveCommonAttributes(bobotRaw, wajibRaw) {
      var point = null;
      var pointRaw = null;
      var pointResult = BatchSoal.Rules.parsePoint(bobotRaw);
      if (pointResult === null) {
        point = null;
        pointRaw = bobotRaw;
      } else {
        point = pointResult;
        pointRaw = null;
      }

      var isRequired = null;
      var isRequiredRaw = null;
      var reqResult = BatchSoal.Rules.normalizeIsRequired(wajibRaw);
      if (reqResult === null) {
        isRequired = null;
        isRequiredRaw = wajibRaw;
      } else {
        isRequired = reqResult;
        isRequiredRaw = null;
      }

      return {
        point: point,
        pointRaw: pointRaw,
        isRequired: isRequired,
        isRequiredRaw: isRequiredRaw
      };
    }

    function splitContentOptionsAnswer(lines) {
      var firstOptionIdx = -1;
      for (var i = 0; i < lines.length; i++) {
        if (typeof lines[i] === 'string' && OPTION_LINE_RE.test(lines[i])) {
          firstOptionIdx = i;
          break;
        }
      }

      var contentLines;
      var tail;
      if (firstOptionIdx === -1) {
        contentLines = lines.slice();
        tail = [];
      } else {
        contentLines = lines.slice(0, firstOptionIdx);
        tail = lines.slice(firstOptionIdx);
      }

      var optionEntries = [];
      var answerRaw = null;
      var duplicateAnswer = 0;

      for (var j = 0; j < tail.length; j++) {
        var line = tail[j];
        if (typeof line !== 'string') {
          continue;
        }
        var optMatch = line.match(OPTION_LINE_RE);
        if (optMatch) {
          optionEntries.push({
            letter: optMatch[1].toUpperCase(),
            text: (optMatch[2] || '').trim(),
            idx: j
          });
          continue;
        }
        var ansMatch = line.match(ANSWER_LINE_RE);
        if (ansMatch) {
          if (answerRaw === null) {
            answerRaw = ansMatch[1].trim();
          } else {
            duplicateAnswer++;
          }
          continue;
        }
      }

      if (firstOptionIdx === -1) {
        var filtered = [];
        for (var k = 0; k < contentLines.length; k++) {
          var cline = contentLines[k];
          if (typeof cline === 'string') {
            var cm = cline.match(ANSWER_LINE_RE);
            if (cm) {
              if (answerRaw === null) {
                answerRaw = cm[1].trim();
              } else {
                duplicateAnswer++;
              }
              continue;
            }
          }
          filtered.push(cline);
        }
        contentLines = filtered;
      }

      return {
        contentLines: contentLines,
        optionEntries: optionEntries,
        answerRaw: answerRaw,
        duplicateAnswer: duplicateAnswer
      };
    }

    function joinContent(contentLines) {
      var parts = [];
      for (var i = 0; i < contentLines.length; i++) {
        var line = contentLines[i];
        parts.push(typeof line === 'string' ? line : '');
      }
      return parts.join('\n').replace(/^\s+|\s+$/g, '');
    }

    function buildOptionsArrays(optionEntries) {
      var sorted = optionEntries.slice().sort(function (a, b) {
        if (a.letter < b.letter) return -1;
        if (a.letter > b.letter) return 1;
        return a.idx - b.idx;
      });
      var letters = [];
      var texts = [];
      for (var i = 0; i < sorted.length; i++) {
        letters.push(sorted[i].letter);
        texts.push(sorted[i].text);
      }
      return { optionLetters: letters, options: texts };
    }

    function parsePG(blockLines, optCount) {
      var lines = (blockLines && typeof blockLines.length === 'number')
        ? Array.prototype.slice.call(blockLines)
        : [];
      normalizeOptCount(optCount);

      var parseErrors = [];

      var bobot = extractFirstAttribute(lines, BOBOT_LINE_RE);
      if (bobot.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Bobot:.');
      }
      var wajib = extractFirstAttribute(bobot.rest, WAJIB_LINE_RE);
      if (wajib.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Wajib:.');
      }

      var common = resolveCommonAttributes(bobot.raw, wajib.raw);
      var split = splitContentOptionsAnswer(wajib.rest);
      if (split.duplicateAnswer > 0) {
        parseErrors.push('ditemukan beberapa baris kunci jawaban.');
      }

      var content = joinContent(split.contentLines);
      var opts = buildOptionsArrays(split.optionEntries);

      var correct = null;
      var correctRaw = '';
      if (split.answerRaw !== null) {
        correctRaw = split.answerRaw;
        if (/^[A-Fa-f]$/.test(correctRaw)) {
          correct = correctRaw.toUpperCase();
        } else {
          correct = null;
        }
      }

      return {
        type: 'PG',
        content: content,
        options: opts.options,
        optionLetters: opts.optionLetters,
        correct: correct,
        correctRaw: correctRaw,
        point: common.point,
        pointRaw: common.pointRaw,
        isRequired: common.isRequired,
        isRequiredRaw: common.isRequiredRaw,
        parseErrors: parseErrors
      };
    }

    function parsePGKompleks(blockLines, optCount) {
      var lines = (blockLines && typeof blockLines.length === 'number')
        ? Array.prototype.slice.call(blockLines)
        : [];
      normalizeOptCount(optCount);

      var parseErrors = [];

      var bobot = extractFirstAttribute(lines, BOBOT_LINE_RE);
      if (bobot.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Bobot:.');
      }
      var wajib = extractFirstAttribute(bobot.rest, WAJIB_LINE_RE);
      if (wajib.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Wajib:.');
      }

      var common = resolveCommonAttributes(bobot.raw, wajib.raw);
      var split = splitContentOptionsAnswer(wajib.rest);
      if (split.duplicateAnswer > 0) {
        parseErrors.push('ditemukan beberapa baris kunci jawaban.');
      }

      var content = joinContent(split.contentLines);
      var opts = buildOptionsArrays(split.optionEntries);

      var correctRaw = split.answerRaw === null ? '' : split.answerRaw;
      var correctList = [];
      if (split.answerRaw !== null) {
        var parts = correctRaw.split(',');
        for (var i = 0; i < parts.length; i++) {
          correctList.push(parts[i].trim().toUpperCase());
        }
      }

      return {
        type: 'PG_KOMPLEKS',
        content: content,
        options: opts.options,
        optionLetters: opts.optionLetters,
        correct: null,
        correctRaw: correctRaw,
        correctList: correctList,
        point: common.point,
        pointRaw: common.pointRaw,
        isRequired: common.isRequired,
        isRequiredRaw: common.isRequiredRaw,
        parseErrors: parseErrors
      };
    }

    BatchSoal.Parser.parsePG = parsePG;
    BatchSoal.Parser.parsePGKompleks = parsePGKompleks;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── Block L8332-L8602 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Parser = BatchSoal.Parser || {};
    BatchSoal.Rules = BatchSoal.Rules || {};

    var BOBOT_LINE_RE = /^\s*Bobot\s*:\s*(.+?)\s*$/i;
    var WAJIB_LINE_RE = /^\s*Wajib\s*:\s*(.+?)\s*$/i;

    var PERNYATAAN_HEADER_RE = /^\s*Pernyataan\s*:\s*$/i;
    var PASANGAN_HEADER_RE   = /^\s*Pasangan\s*:\s*$/i;
    var PENGACOH_HEADER_RE   = /^\s*Pengacoh\s*:\s*$/i;

    var BS_STATEMENT_RE = /^\s*(.+?)\s*\|\s*(.+?)\s*$/;

    var JODOH_PAIR_RE = /^\s*(.*?)\s*(?:=|\u2192|\s-\s)\s*(.+?)\s*$/;

    function extractFirstAttribute(lines, regex) {
      var firstRaw = null;
      var duplicateCount = 0;
      var rest = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (typeof line !== 'string') {
          rest.push(line);
          continue;
        }
        var m = line.match(regex);
        if (m) {
          if (firstRaw === null) {
            firstRaw = m[1].trim();
            continue;
          }
          duplicateCount++;
          continue;
        }
        rest.push(line);
      }
      return { raw: firstRaw, rest: rest, duplicateCount: duplicateCount };
    }

    function resolveCommonAttributes(bobotRaw, wajibRaw) {
      var pointResult = BatchSoal.Rules.parsePoint(bobotRaw);
      var point = pointResult === null ? null : pointResult;
      var pointRaw = pointResult === null ? bobotRaw : null;

      var reqResult = BatchSoal.Rules.normalizeIsRequired(wajibRaw);
      var isRequired = reqResult === null ? null : reqResult;
      var isRequiredRaw = reqResult === null ? wajibRaw : null;

      return {
        point: point,
        pointRaw: pointRaw,
        isRequired: isRequired,
        isRequiredRaw: isRequiredRaw
      };
    }

    function joinContent(contentLines) {
      var parts = [];
      for (var i = 0; i < contentLines.length; i++) {
        var line = contentLines[i];
        parts.push(typeof line === 'string' ? line : '');
      }
      return parts.join('\n').replace(/^\s+|\s+$/g, '');
    }

    function normalizeBSKey(raw) {
      if (typeof raw !== 'string') return null;
      var t = raw.trim().toLowerCase();
      if (t === 'benar') return 'Benar';
      if (t === 'salah') return 'Salah';
      return null;
    }

    function findFirstMatch(lines, regex, fromIdx) {
      var start = fromIdx | 0;
      if (start < 0) start = 0;
      for (var i = start; i < lines.length; i++) {
        if (typeof lines[i] === 'string' && regex.test(lines[i])) {
          return i;
        }
      }
      return -1;
    }

    function parseBS(blockLines) {
      var lines = (blockLines && typeof blockLines.length === 'number')
        ? Array.prototype.slice.call(blockLines)
        : [];

      var parseErrors = [];

      var bobot = extractFirstAttribute(lines, BOBOT_LINE_RE);
      if (bobot.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Bobot:.');
      }
      var wajib = extractFirstAttribute(bobot.rest, WAJIB_LINE_RE);
      if (wajib.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Wajib:.');
      }

      var common = resolveCommonAttributes(bobot.raw, wajib.raw);

      var rest = wajib.rest;
      var markerIdx = findFirstMatch(rest, PERNYATAAN_HEADER_RE, 0);

      var contentLines;
      var entryLines;
      if (markerIdx === -1) {
        parseErrors.push("penanda 'Pernyataan:' tidak ditemukan.");
        var firstStmtIdx = -1;
        for (var i = 0; i < rest.length; i++) {
          if (typeof rest[i] === 'string' && BS_STATEMENT_RE.test(rest[i])) {
            firstStmtIdx = i;
            break;
          }
        }
        if (firstStmtIdx === -1) {
          contentLines = rest.slice();
          entryLines = [];
        } else {
          contentLines = rest.slice(0, firstStmtIdx);
          entryLines = rest.slice(firstStmtIdx);
        }
      } else {
        contentLines = rest.slice(0, markerIdx);
        entryLines = rest.slice(markerIdx + 1);
      }

      var content = joinContent(contentLines);

      var statements = [];
      var answerMap = {};
      for (var k = 0; k < entryLines.length; k++) {
        var line = entryLines[k];
        if (typeof line !== 'string') continue;
        var trimmed = line.trim();
        if (trimmed === '') continue;
        var m = line.match(BS_STATEMENT_RE);
        if (!m) {
          parseErrors.push('baris pernyataan tidak valid: "' + trimmed + '".');
          continue;
        }
        var text = m[1].trim();
        var keyRaw = m[2].trim();
        var key = normalizeBSKey(keyRaw);
        statements.push({ text: text, key: key, keyRaw: keyRaw });
        if (key !== null) {
          answerMap[text] = key;
        }
      }

      return {
        type: 'BS',
        content: content,
        statements: statements,
        answerMap: answerMap,
        point: common.point,
        pointRaw: common.pointRaw,
        isRequired: common.isRequired,
        isRequiredRaw: common.isRequiredRaw,
        parseErrors: parseErrors
      };
    }

    function parseJODOH(blockLines) {
      var lines = (blockLines && typeof blockLines.length === 'number')
        ? Array.prototype.slice.call(blockLines)
        : [];

      var parseErrors = [];

      var bobot = extractFirstAttribute(lines, BOBOT_LINE_RE);
      if (bobot.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Bobot:.');
      }
      var wajib = extractFirstAttribute(bobot.rest, WAJIB_LINE_RE);
      if (wajib.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Wajib:.');
      }

      var common = resolveCommonAttributes(bobot.raw, wajib.raw);

      var rest = wajib.rest;
      var pasanganIdx = findFirstMatch(rest, PASANGAN_HEADER_RE, 0);
      var pengacohSearchStart = pasanganIdx === -1 ? 0 : pasanganIdx + 1;
      var pengacohIdx = findFirstMatch(rest, PENGACOH_HEADER_RE, pengacohSearchStart);

      var contentLines;
      var pairLines;
      var distractorLines;

      if (pasanganIdx === -1) {
        parseErrors.push("penanda 'Pasangan:' tidak ditemukan.");
        if (pengacohIdx === -1) {
          contentLines = rest.slice();
          pairLines = [];
          distractorLines = [];
        } else {
          contentLines = rest.slice(0, pengacohIdx);
          pairLines = [];
          distractorLines = rest.slice(pengacohIdx + 1);
        }
      } else {
        contentLines = rest.slice(0, pasanganIdx);
        if (pengacohIdx === -1) {
          pairLines = rest.slice(pasanganIdx + 1);
          distractorLines = [];
        } else {
          pairLines = rest.slice(pasanganIdx + 1, pengacohIdx);
          distractorLines = rest.slice(pengacohIdx + 1);
        }
      }

      var content = joinContent(contentLines);

      var pairs = [];
      var distractors = [];

      for (var p = 0; p < pairLines.length; p++) {
        var pl = pairLines[p];
        if (typeof pl !== 'string') continue;
        var ptrim = pl.trim();
        if (ptrim === '') continue;
        var pm = pl.match(JODOH_PAIR_RE);
        if (!pm) {
          parseErrors.push('baris pasangan tidak valid: "' + ptrim + '".');
          continue;
        }
        var q = pm[1].trim();
        var a = pm[2].trim();
        if (q === '') {
          parseErrors.push('pasangan tidak valid (sisi kiri kosong): "' + ptrim + '".');
          continue;
        }
        pairs.push({ q: q, a: a });
      }

      for (var d = 0; d < distractorLines.length; d++) {
        var dl = distractorLines[d];
        if (typeof dl !== 'string') continue;
        var dtrim = dl.trim();
        if (dtrim === '') continue;
        distractors.push({ q: '', a: dtrim });
      }

      var items = pairs.concat(distractors);

      return {
        type: 'JODOH',
        content: content,
        pairs: pairs,
        distractors: distractors,
        items: items,
        point: common.point,
        pointRaw: common.pointRaw,
        isRequired: common.isRequired,
        isRequiredRaw: common.isRequiredRaw,
        parseErrors: parseErrors
      };
    }

    BatchSoal.Parser.parseBS = parseBS;
    BatchSoal.Parser.parseJODOH = parseJODOH;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── Block L8604-L8769 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Parser = BatchSoal.Parser || {};
    BatchSoal.Rules = BatchSoal.Rules || {};

    var BOBOT_LINE_RE       = /^\s*Bobot\s*:\s*(.+?)\s*$/i;
    var WAJIB_LINE_RE       = /^\s*Wajib\s*:\s*(.+?)\s*$/i;
    var RUBRIK_LINE_RE      = /^\s*Rubrik\s*:\s*(.+?)\s*$/i;
    var KATAKUNCI_LINE_RE   = /^\s*KataKunci\s*:\s*(.+?)\s*$/i;
    var MINKARAKTER_LINE_RE = /^\s*MinKarakter\s*:\s*(.+?)\s*$/i;

    function extractFirstAttribute(lines, regex) {
      var firstRaw = null;
      var duplicateCount = 0;
      var rest = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (typeof line !== 'string') {
          rest.push(line);
          continue;
        }
        var m = line.match(regex);
        if (m) {
          if (firstRaw === null) {
            firstRaw = m[1].trim();
            continue;
          }
          duplicateCount++;
          continue;
        }
        rest.push(line);
      }
      return { raw: firstRaw, rest: rest, duplicateCount: duplicateCount };
    }

    function resolveCommonAttributes(bobotRaw, wajibRaw) {
      var pointResult = BatchSoal.Rules.parsePoint(bobotRaw);
      var point = pointResult === null ? null : pointResult;
      var pointRaw = pointResult === null ? bobotRaw : null;

      var reqResult = BatchSoal.Rules.normalizeIsRequired(wajibRaw);
      var isRequired = reqResult === null ? null : reqResult;
      var isRequiredRaw = reqResult === null ? wajibRaw : null;

      return {
        point: point,
        pointRaw: pointRaw,
        isRequired: isRequired,
        isRequiredRaw: isRequiredRaw
      };
    }

    function joinContent(contentLines) {
      var parts = [];
      for (var i = 0; i < contentLines.length; i++) {
        var line = contentLines[i];
        parts.push(typeof line === 'string' ? line : '');
      }
      return parts.join('\n').replace(/^\s+|\s+$/g, '');
    }

    function splitKeywordsRaw(raw) {
      if (typeof raw !== 'string') return [];
      if (raw.trim() === '') return [];
      var parts = raw.split(',');
      var out = [];
      for (var i = 0; i < parts.length; i++) {
        out.push(parts[i].trim());
      }
      return out;
    }

    function tryParseStrictInt(raw) {
      if (typeof raw !== 'string') return null;
      var t = raw.trim();
      if (t === '') return null;
      var n = parseInt(t, 10);
      if (isNaN(n)) return null;
      if (String(n) !== t) return null;
      return n;
    }

    function parseEsai(blockLines) {
      var lines = (blockLines && typeof blockLines.length === 'number')
        ? Array.prototype.slice.call(blockLines)
        : [];

      var parseErrors = [];

      var bobot = extractFirstAttribute(lines, BOBOT_LINE_RE);
      if (bobot.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Bobot:.');
      }
      var wajib = extractFirstAttribute(bobot.rest, WAJIB_LINE_RE);
      if (wajib.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Wajib:.');
      }

      var rubrik = extractFirstAttribute(wajib.rest, RUBRIK_LINE_RE);
      if (rubrik.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris Rubrik:.');
      }
      var kataKunci = extractFirstAttribute(rubrik.rest, KATAKUNCI_LINE_RE);
      if (kataKunci.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris KataKunci:.');
      }
      var minKar = extractFirstAttribute(kataKunci.rest, MINKARAKTER_LINE_RE);
      if (minKar.duplicateCount > 0) {
        parseErrors.push('ditemukan beberapa baris MinKarakter:.');
      }

      var common = resolveCommonAttributes(bobot.raw, wajib.raw);

      var rubricPresent = (rubrik.raw !== null);
      var rubric = rubricPresent ? rubrik.raw : '';

      var keywordsPresent = (kataKunci.raw !== null);
      var keywordsRaw = keywordsPresent ? kataKunci.raw : null;
      var keywords = keywordsPresent ? splitKeywordsRaw(kataKunci.raw) : [];

      var minCharEnabled, minChar, minCharRaw;
      if (minKar.raw === null) {
        minCharEnabled = false;
        minChar = 0;
        minCharRaw = null;
      } else {
        minCharEnabled = true;
        var asInt = tryParseStrictInt(minKar.raw);
        if (asInt === null) {
          minChar = null;
          minCharRaw = minKar.raw;
        } else {
          minChar = asInt;
          minCharRaw = minKar.raw;
        }
      }

      var content = joinContent(minKar.rest);

      return {
        type: 'Esai',
        content: content,
        rubric: rubric,
        rubricPresent: rubricPresent,
        keywords: keywords,
        keywordsRaw: keywordsRaw,
        keywordsPresent: keywordsPresent,
        minChar: minChar,
        minCharEnabled: minCharEnabled,
        minCharRaw: minCharRaw,
        point: common.point,
        pointRaw: common.pointRaw,
        isRequired: common.isRequired,
        isRequiredRaw: common.isRequiredRaw,
        parseErrors: parseErrors
      };
    }

    BatchSoal.Parser.parseEsai = parseEsai;

    root.BatchSoal = BatchSoal;
  })(window);
/* ─── Block L8771-L8913 ─── */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Parser = BatchSoal.Parser || {};

    var DEFAULT_OPT_COUNT = { PG: 5, PG_KOMPLEKS: 5 };

    function normalizeOptCountByType(optCountByType) {
      var src = (optCountByType && typeof optCountByType === 'object')
        ? optCountByType
        : {};
      var result = {
        PG: DEFAULT_OPT_COUNT.PG,
        PG_KOMPLEKS: DEFAULT_OPT_COUNT.PG_KOMPLEKS
      };
      var keys = ['PG', 'PG_KOMPLEKS'];
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var v = Number(src[k]);
        if (isFinite(v) && v >= 2 && v <= 6) {
          result[k] = Math.floor(v);
        }
      }
      return result;
    }

    function splitBlockToLines(block) {
      var raw = String(block == null ? '' : block);
      var parts = raw.split(/\r?\n/);
      var out = [];
      for (var i = 0; i < parts.length; i++) {
        var line = parts[i];
        out.push(line.replace(/\s+$/, ''));
      }
      return out;
    }

    function prefixErrors(messages, blockNumber) {
      var out = [];
      if (!messages || typeof messages.length !== 'number') {
        return out;
      }
      var prefix = 'Blok ' + blockNumber + ': ';
      for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];
        out.push(prefix + (typeof msg === 'string' ? msg : String(msg)));
      }
      return out;
    }

    function dispatchTypeParser(type, body, optCountByType) {
      var Parser = BatchSoal.Parser;
      var parsed = null;
      var parseErrors = [];
      switch (type) {
        case 'PG':
          parsed = Parser.parsePG(body, optCountByType.PG);
          break;
        case 'PG_KOMPLEKS':
          parsed = Parser.parsePGKompleks(body, optCountByType.PG_KOMPLEKS);
          break;
        case 'BS':
          parsed = Parser.parseBS(body);
          break;
        case 'JODOH':
          parsed = Parser.parseJODOH(body);
          break;
        case 'Esai':
          parsed = Parser.parseEsai(body);
          break;
        default:
          parsed = null;
      }
      if (parsed && parsed.parseErrors &&
          typeof parsed.parseErrors.length === 'number') {
        parseErrors = parsed.parseErrors;
      }
      return { parsed: parsed, parseErrors: parseErrors };
    }

    function parseBatchText(rawText, optCountByType) {
      var Parser = BatchSoal.Parser;
      var optCounts = normalizeOptCountByType(optCountByType);

      var pre = Parser.preCheck(rawText);
      if (pre && pre.globalErrors && pre.globalErrors.length > 0) {
        return {
          blocks: [],
          globalErrors: pre.globalErrors.slice()
        };
      }

      var blockTexts = Parser.splitBlocks(rawText);
      var blocks = [];

      for (var i = 0; i < blockTexts.length; i++) {
        var blockNumber = i + 1;
        var blockRaw = blockTexts[i];
        var blockLines = splitBlockToLines(blockRaw);

        var detection = Parser.detectType(blockLines);
        var detectedType = detection.type;
        var legacyMode = !!detection.legacyMode;
        var detectionErrors = (detection.parseErrors &&
                               typeof detection.parseErrors.length === 'number')
          ? detection.parseErrors
          : [];

        var combinedSuffix;
        var parsed = null;

        if (detectedType === null) {
          combinedSuffix = detectionErrors.slice();
        } else {
          var dispatched = dispatchTypeParser(
            detectedType,
            detection.body,
            optCounts
          );
          parsed = dispatched.parsed;
          combinedSuffix = detectionErrors.concat(dispatched.parseErrors);
        }

        blocks.push({
          blockNumber: blockNumber,
          rawText: blockRaw,
          detectedType: detectedType,
          legacyMode: legacyMode,
          parseErrors: prefixErrors(combinedSuffix, blockNumber),
          parsed: parsed
        });
      }

      return { blocks: blocks, globalErrors: [] };
    }

    BatchSoal.Parser.parseBatchText = parseBatchText;

    root.BatchSoal = BatchSoal;
  })(window);