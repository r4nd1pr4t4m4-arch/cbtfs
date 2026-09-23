/**
 * batch-soal-namespace.js
 * Inisialisasi namespace BatchSoal beserta sub-objek dan konstanta.
 * Sumber: index.html L7683-7717
 */
  (function (root) {
    'use strict';

    var BatchSoal = root.BatchSoal || {};

    BatchSoal.Rules = BatchSoal.Rules || {};
    BatchSoal.Parser = BatchSoal.Parser || {};
    BatchSoal.Validator = BatchSoal.Validator || {};
    BatchSoal.UI = BatchSoal.UI || {};

    BatchSoal.TYPE_LABELS = Object.freeze({
      PG: 'PG',
      PG_KOMPLEKS: 'PG Kompleks',
      BS: 'Benar/Salah',
      JODOH: 'Menjodohkan',
      Esai: 'Esai'
    });

    BatchSoal.TYPE_COLORS = Object.freeze({
      PG:           Object.freeze({ main: '#2563eb', soft: '#dbeafe' }),
      PG_KOMPLEKS:  Object.freeze({ main: '#7c3aed', soft: '#ede9fe' }),
      BS:           Object.freeze({ main: '#0d9488', soft: '#ccfbf1' }),
      JODOH:        Object.freeze({ main: '#d97706', soft: '#fef3c7' }),
      Esai:         Object.freeze({ main: '#e11d48', soft: '#ffe4e6' })
    });

    BatchSoal.LIMITS = Object.freeze({
      MAX_TEXT: 200000,
      MAX_BLOCKS: 500
    });

    root.BatchSoal = BatchSoal;
  })(window);