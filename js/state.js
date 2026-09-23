/**
 * state.js — Global State Variables
 * SIPADU CBT v5.1.0
 *
 * Berisi semua variabel state global yang digunakan lintas module.
 * CATATAN: File ini harus di-load PERTAMA sebelum semua module lainnya.
 */

/* eslint-disable no-var */

// ── Timezone (diisi oleh api-client.js bootstrap sebelum app berjalan) ──
// Gunakan var agar tidak crash jika ada re-deklarasi di module lain saat debugging.
// Nilai awal diambil dari window jika sudah di-set oleh bootstrap, fallback ke WIB.
var APP_TIMEZONE = window.APP_TIMEZONE || window._appTimezone || 'Asia/Jakarta';
var APP_TZ_LABEL = APP_TIMEZONE === 'Asia/Makassar' ? 'WITA'
                 : APP_TIMEZONE === 'Asia/Jayapura'  ? 'WIT'
                 : 'WIB';

// ── Auth & Session ──
var currentUser = null;
window.currentUser = null;
var initialExamHTML = '';
var adminSessionTimer = null;
var ADMIN_SESSION_DURATION_MS = 1 * 60 * 60 * 1000; // 1 jam

// ── Ujian Siswa ──
var currentExam = null;
var questions = [];
var answers = {};
var currentQIndex = 0;
var violationCount = 0;
var fullscreenExitCount = 0;
var MAX_FULLSCREEN_EXIT = 3;
var wakeLock = null;
var timerInterval;
var selectedLeft = null;

// ── Anti-cheat event handler refs ──
var ac_ctxHandler, ac_keyHandler, ac_visHandler, ac_blurHandler, ac_fsHandler, ac_unloadHandler;
var ac_copyHandler, ac_cutHandler, ac_pasteHandler;
var ac_pageHideHandler, ac_pageFreezeHandler, ac_pageShowHandler;
var _winKeyJustPressed = false;
var _winKeyTimer = null;
var _imgModalOpen = false;

// ── Cached data ──
var cachedExams = [];
var cachedUsers = [];
var masterData = {
  classes: [],
  subjects: []
};

// ── Results / Nilai ──
var currentGradingId = null;
var allResultsData = [];
var filteredResults = [];
var currentPage = 1;
var rowsPerPage = 10;

// ── Bank Soal ──
var allQuestionsData = [];
var currentExamTypeConfig = null;
var filteredQuestions = [];
var currentQPage = 1;
var qRowsPerPage = 10;
var _activeTypeFilter = null;

// ── Users ──
var allUsersData = [];
var filteredUsers = [];
var currentUserPage = 1;
var userRowsPerPage = 10;
var selectedUsers = new Set();
var pendingTeacherAssignments = [];
