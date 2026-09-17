/**
 * build.js
 *
 * Build script untuk Vercel deployment.
 * Mengganti placeholder __GAS_URL_PLACEHOLDER__ di index.html
 * dengan nilai GAS_URL dari environment variable.
 *
 * Dipanggil otomatis oleh Vercel build process via package.json:
 *   "build": "node build.js"
 *
 * Usage lokal:
 *   GAS_URL=https://script.google.com/macros/s/.../exec node build.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const GAS_URL     = process.env.GAS_URL || '__GAS_URL_PLACEHOLDER__';
const INDEX_FILE  = path.join(__dirname, 'index.html');
const OUTPUT_FILE = INDEX_FILE; // overwrite in-place

if (!GAS_URL || GAS_URL === '__GAS_URL_PLACEHOLDER__') {
  console.warn('[build.js] WARNING: GAS_URL tidak diset. Set environment variable GAS_URL sebelum deploy.');
  console.warn('           Pengguna harus set URL manual via console: gasApi.setUrl("https://...")');
} else {
  console.log('[build.js] GAS_URL:', GAS_URL.substring(0, 60) + '...');
}

// Read index.html
let html = fs.readFileSync(INDEX_FILE, 'utf8');

// Replace placeholder
const before = html;
html = html.replace(/__GAS_URL_PLACEHOLDER__/g, GAS_URL);

const changeCount = (before.match(/__GAS_URL_PLACEHOLDER__/g) || []).length;
if (changeCount > 0) {
  console.log('[build.js] Replaced ' + changeCount + ' placeholder(s) dengan GAS_URL.');
} else {
  console.log('[build.js] Tidak ada placeholder yang ditemukan (mungkin sudah diset).');
}

// Write back
fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
console.log('[build.js] Build selesai: ' + OUTPUT_FILE);
