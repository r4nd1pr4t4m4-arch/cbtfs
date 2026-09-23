/**
 * state.js — Global State Variables
 * SIPADU CBT v5.1.0
 *
 * Berisi semua variabel state global yang digunakan lintas module.
 * Sumber: index.html L15212-15299
 *
 * CATATAN: File ini harus di-load sebelum semua module lainnya.
 */

/* eslint-disable no-var */
/* global APP_TIMEZONE, APP_TZ_LABEL */

const APP_TIMEZONE = window.APP_TIMEZONE || window._appTimezone || 'Asia/Jakarta';
const APP_TZ_LABEL = APP_TIMEZONE === 'Asia/Makassar' ? 'WITA'
                   : APP_TIMEZONE === 'Asia/Jayapura'  ? 'WIT'
                   : 'WIB';

let currentUser = null;
window.currentUser = null;
let initialExamHTML = '';
let adminSessionTimer = null;
const ADMIN_SESSION_DURATION_MS = 1 * 60 * 60 * 1000;

let currentExam = null;
let questions = [];
let answers = {};
let currentQIndex = 0;
let violationCount = 0;
let fullscreenExitCount = 0;
const MAX_FULLSCREEN_EXIT = 3;
let wakeLock = null;


let timerInterval;
let selectedLeft = null;
let ac_ctxHandler, ac_keyHandler, ac_visHandler, ac_blurHandler, ac_fsHandler, ac_unloadHandler;
let ac_copyHandler, ac_cutHandler, ac_pasteHandler;
let ac_pageHideHandler, ac_pageFreezeHandler, ac_pageShowHandler;
let _winKeyJustPressed = false;
let _winKeyTimer = null;
let _imgModalOpen = false;
let cachedExams = [];
let cachedUsers = [];
let masterData = {
  classes: [],
  subjects: []
};
let currentGradingId = null;
let allResultsData = [];
let filteredResults = [];
let currentPage = 1;
let rowsPerPage = 10;
let allQuestionsData = [];
let currentExamTypeConfig = null;
let filteredQuestions = [];
let currentQPage = 1;
let qRowsPerPage = 10;
let _activeTypeFilter = null;
let allUsersData = [];
let filteredUsers = [];
let currentUserPage = 1;
let userRowsPerPage = 10;
let selectedUsers = new Set();
let pendingTeacherAssignments = []; 