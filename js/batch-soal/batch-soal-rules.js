/**
 * batch-soal-rules.js
 * BatchSoal.Rules — Aturan validasi tipe soal.
 * Sumber: index.html L7719-7867
 */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};
    BatchSoal.Rules = BatchSoal.Rules || {};

    function deepFreeze(obj) {
      if (obj === null || typeof obj !== 'object' || Object.isFrozen(obj)) {
        return obj;
      }
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) {
        var v = obj[keys[i]];
        if (v !== null && typeof v === 'object') {
          deepFreeze(v);
        }
      }
      return Object.freeze(obj);
    }

    var Rules = {
      PG: {
        content: { min: 1, max: 2000 },
        options: {
          min: 2,
          max: 'optCount',
          perOption: { min: 1, max: 500 },
          dedup: 'ci'
        },
        key: { kind: 'singleLetter', range: 'A..optCount' }
      },
      PG_KOMPLEKS: {
        content: { min: 1, max: 2000 },
        options: {
          min: 2,
          max: 'optCount',
          perOption: { min: 1, max: 500 },
          dedup: 'ci'
        },
        key: {
          kind: 'letterList',
          minCount: 2,
          maxCount: 'optCount',
          sep: ',',
          dedup: 'ci',
          range: 'A..optCount'
        }
      },
      BS: {
        content: { min: 1, max: 2000 },
        statements: {
          min: 3,
          max: 20,
          perStatement: { min: 1, max: 500 },
          dedup: 'ci'
        },
        key: { kind: 'perStatement', allowed: ['Benar', 'Salah'] }
      },
      JODOH: {
        content: { min: 1, max: 2000 },
        pairs: {
          min: 3,
          max: 50,
          distractorMin: 1,
          distractorMax: 3,
          dedupLeftCi: true,
          dedupRightCi: true
        }
      },
      Esai: {
        content: { min: 1, max: 2000 },
        minChar: { kind: 'optionalInt', min: 1, max: 5000 },
        keywords: { kind: 'optionalCsv', min: 1, max: 20, perEntryMax: 100 }
      },
      common: {
        point: { min: 0.01, max: 100, default: 10 },
        isRequired: {
          values: ['TRUE', 'FALSE', 'WAJIB', 'OPSIONAL'],
          default: 'TRUE'
        }
      }
    };

    deepFreeze(Rules);

    var ruleKeys = Object.keys(Rules);
    for (var i = 0; i < ruleKeys.length; i++) {
      BatchSoal.Rules[ruleKeys[i]] = Rules[ruleKeys[i]];
    }

    function normalizeIsRequired(value) {
      if (value === null || value === undefined) {
        return 'TRUE';
      }
      if (typeof value !== 'string') {
        return null;
      }
      var trimmed = value.trim();
      if (trimmed === '') {
        return 'TRUE';
      }
      var upper = trimmed.toUpperCase();
      if (upper === 'TRUE' || upper === 'WAJIB') {
        return 'TRUE';
      }
      if (upper === 'FALSE' || upper === 'OPSIONAL') {
        return 'FALSE';
      }
      return null;
    }

    function parsePoint(value) {
      if (value === null || value === undefined) {
        return 10;
      }
      var num;
      if (typeof value === 'number') {
        num = value;
      } else if (typeof value === 'string') {
        var trimmed = value.trim();
        if (trimmed === '') {
          return 10;
        }
        var normalized = trimmed.replace(',', '.');
        if (normalized.indexOf(',') !== -1) {
          return null;
        }
        num = Number(normalized);
      } else {
        return null;
      }
      if (!isFinite(num)) {
        return null;
      }
      if (num < Rules.common.point.min || num > Rules.common.point.max) {
        return null;
      }
      return num;
    }

    BatchSoal.Rules.normalizeIsRequired = normalizeIsRequired;
    BatchSoal.Rules.parsePoint = parsePoint;

    Object.freeze(BatchSoal.Rules);

    root.BatchSoal = BatchSoal;
  })(window);