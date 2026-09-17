# SIPADU CBT — Panduan Setup & Deployment

Sistem Ujian Berbasis Komputer (CBT) dengan arsitektur:
**Vercel (frontend) · Google Apps Script (REST API) · Firebase Firestore (database)**

---

## Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Prasyarat](#2-prasyarat)
3. [Setup Firebase](#3-setup-firebase)
4. [Setup Google Apps Script](#4-setup-google-apps-script)
5. [Migrasi Data dari Spreadsheet](#5-migrasi-data-dari-spreadsheet)
6. [Aktifkan Integrasi Firestore](#6-aktifkan-integrasi-firestore)
7. [Deploy Frontend ke Vercel](#7-deploy-frontend-ke-vercel)
8. [Testing](#8-testing)
9. [Cutover ke Firestore-Only](#9-cutover-ke-firestore-only)
10. [Decommission Spreadsheet](#10-decommission-spreadsheet)
11. [Troubleshooting](#11-troubleshooting)
12. [Referensi File](#12-referensi-file)

---

## 1. Arsitektur Sistem

```
┌──────────────────────────────────────────────────────────────┐
│               BROWSER (Siswa / Guru / Admin)                 │
│          https://<project>.vercel.app                        │
└──────────────────────────┬───────────────────────────────────┘
                           │  fetch() POST { fn, args }
                           ▼
┌──────────────────────────────────────────────────────────────┐
│               VERCEL  (Static Hosting)                       │
│   index.html · api-client.js                                 │
│   • google.script.run polyfill → fetch()                     │
│   • Bootstrap config dari GAS doGet()                        │
└──────────────────────────┬───────────────────────────────────┘
                           │  HTTPS POST to GAS Web App
                           ▼
┌──────────────────────────────────────────────────────────────┐
│          GOOGLE APPS SCRIPT  (REST API)                      │
│   api-router.gs  → doPost whitelist (70+ fungsi)             │
│   Code.gs        → business logic                            │
│   db.gs          → DAL: dbGet / dbSet / dbQuery / dbBatch    │
│   firebase-auth.gs → JWT service account + token cache       │
└──────────────────────────┬───────────────────────────────────┘
                           │  Firestore REST API + JWT
                           ▼
┌──────────────────────────────────────────────────────────────┐
│               FIREBASE FIRESTORE                             │
│   users · exams · questions · responses                      │
│   adminLogs · logs · config                                  │
└──────────────────────────────────────────────────────────────┘
```

### Urutan File di Apps Script (wajib dipertahankan)

```
1.  firebase-auth.gs
2.  firebase-helpers.gs
3.  db.gs
4.  firestore-read.gs
5.  firestore-write.gs
6.  firestore-cbtops.gs
7.  api-cors.gs
8.  api-router.gs
9.  cutover.gs
10. Code.gs
11. code-integration.gs   ← HARUS TERAKHIR
```

> **Cara mengatur urutan:** di Apps Script Editor, klik ikon ⋮ di samping nama file
> → **Move up / Move down**.

---

## 2. Prasyarat

| Komponen | Versi / Kebutuhan |
|----------|------------------|
| Google Account | Akses ke Google Apps Script dan Drive |
| Firebase Project | Firestore dalam mode Production |
| Vercel Account | Free tier cukup |
| Node.js | ≥ 18 (untuk build script lokal) |
| Firebase CLI | `npm install -g firebase-tools` |

---

## 3. Setup Firebase

### 3.1 Buat Firebase Project

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. **Add project** → isi nama → nonaktifkan Google Analytics (opsional)
3. **Build → Firestore Database → Create database**
   - Region: `asia-southeast1` (rekomendasi untuk Indonesia)
   - Mode: **Production** (bukan Test mode)

### 3.2 Buat Service Account

1. **Project Settings** (⚙️) → **Service Accounts**
2. Klik **Generate new private key** → simpan file JSON dengan aman
3. Buka file JSON dan catat nilai:
   - `project_id`
   - `client_email`
   - `private_key`

> ⚠️ **Jangan commit file JSON private key ke Git.**

### 3.3 Deploy Security Rules & Indexes

```bash
cd "path/ke/Kiro CBT/firebase"
firebase login
firebase use --add          # pilih project yang baru dibuat
firebase deploy --only firestore
```

Verifikasi di Firebase Console → **Firestore → Indexes**: pastikan 16 composite indexes muncul dengan status **Enabled** (proses build beberapa menit).

### 3.4 Collections yang Akan Dibuat

| Collection | Isi |
|------------|-----|
| `users` | Akun siswa, guru, admin |
| `exams` | Data ujian |
| `questions` | Bank soal |
| `responses` | Jawaban siswa |
| `adminLogs` | Audit log |
| `logs` | Log pelanggaran |
| `config` | Konfigurasi aplikasi |

---

## 4. Setup Google Apps Script

### 4.1 Upload Semua File GAS

Buka Apps Script project yang terhubung ke Spreadsheet CBT, lalu upload file-file berikut dari folder `gas/`:

```
firebase-auth.gs      firebase-helpers.gs    db.gs
firestore-read.gs     firestore-write.gs     firestore-cbtops.gs
api-cors.gs           api-router.gs          cutover.gs
code-integration.gs   migrate-to-firestore.gs
```

Atur urutan file sesuai [Bagian 1](#1-arsitektur-sistem).

### 4.2 Simpan Kredensial Firebase ke Script Properties

Di Apps Script Editor: **Project Settings → Script Properties**, tambahkan:

| Key | Nilai |
|-----|-------|
| `FIREBASE_PROJECT_ID` | `project_id` dari file JSON |
| `FIREBASE_SA_EMAIL` | `client_email` dari file JSON |
| `FIREBASE_SA_KEY` | `private_key` dari file JSON (termasuk `-----BEGIN...END-----`) |

### 4.3 Verifikasi Koneksi

Jalankan dari Apps Script Editor (**pilih fungsi → Run**):

```javascript
// Cek apakah Script Properties sudah terisi dengan benar
setupFirebase()
```

Output jika belum diisi:
```
✗ FIREBASE_PROJECT_ID   → BELUM DISET
✗ FIREBASE_SA_EMAIL     → BELUM DISET
...
━━━ CARA MENGISI SCRIPT PROPERTIES ━━━
```

Setelah Script Properties terisi, uji koneksi live ke Firestore:

```javascript
testFirebaseConnection()
```

Output yang diharapkan:
```
✓ Token berhasil: ya29.c.b0AXv0z...
✓ Firestore read: OK (data=null)
✓ Firestore write: OK
✓ Firestore delete: OK

✅ Firebase connection OK — siap digunakan.
```

### 4.4 Deploy GAS sebagai Web App

1. Apps Script Editor → **Deploy → New Deployment**
2. **Type**: Web App
3. **Execute as**: Me
4. **Who has access**: Anyone
5. Klik **Deploy** → catat URL:
   ```
   https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
   ```

> Setiap perubahan kode GAS memerlukan **New Deployment** baru agar URL tetap dan perubahan aktif.

---

## 5. Migrasi Data dari Spreadsheet

Langkah ini memindahkan data yang sudah ada di Google Spreadsheet ke Firestore.

### 5.1 Dry Run (tanpa menulis)

```javascript
migrateDryRun()
// Tampilkan perkiraan jumlah dokumen yang akan dibuat
```

### 5.2 Migrasi Penuh

```javascript
migrateAll()
// Migrasi semua koleksi secara berurutan
```

### 5.3 Verifikasi Hasil

```javascript
verifyMigration()
// Bandingkan jumlah baris Sheet vs dokumen Firestore
```

Output yang diharapkan:
```
Users:     sheet=50  firestore=50  ✓
Exams:     sheet=12  firestore=12  ✓
Questions: sheet=200 firestore=200 ✓
...
```

> Jika ada koleksi yang mismatch, jalankan migrasi per koleksi:
> ```javascript
> migrateUsers()   // atau migrateExams(), migrateQuestions(), dst.
> ```

---

## 6. Aktifkan Integrasi Firestore

Setelah migrasi selesai, aktifkan mode **dual-write** (sistem menulis ke Spreadsheet DAN Firestore secara bersamaan):

```javascript
activateMigrationMode()
// Read mode  : hybrid (Firestore → Sheet fallback)
// Write mode : dual (Sheet + Firestore)
// Integration: ENABLED
```

Verifikasi:

```javascript
getIntegrationStatus()
runIntegrationDiagnostics()
```

Output yang diharapkan:
```
Integration enabled : true
Read mode           : hybrid
Write mode          : dual
Firestore reachable : true
Test read config    : OK
Test write config   : OK
```

### Mode yang Tersedia

| Fungsi | Efek |
|--------|------|
| `activateMigrationMode()` | Dual-write + hybrid read (fase migrasi) |
| `rollbackToSpreadsheet()` | Kembali ke Spreadsheet-only (rollback darurat) |
| `activateCutoverMode()` | Firestore-only (setelah cutover) |
| `getIntegrationStatus()` | Lihat mode aktif saat ini |

---

## 7. Deploy Frontend ke Vercel

### 7.1 Persiapan File

File frontend ada di folder `vercel/`. Isi utama:

| File | Fungsi |
|------|--------|
| `index.html` | Aplikasi frontend (patched dari GAS version) |
| `api-client.js` | Drop-in pengganti `google.script.run` dengan `fetch()` |
| `build.js` | Inject GAS URL ke `index.html` saat build |
| `vercel.json` | Konfigurasi deployment Vercel |
| `.env.example` | Template environment variables |

### 7.2 Set Environment Variable

**Di Vercel Dashboard**: Settings → Environment Variables:

| Key | Nilai |
|-----|-------|
| `GAS_URL` | URL GAS Web App dari Langkah 4.4 |

### 7.3 Deploy

```bash
cd vercel
npm install        # install dependencies (opsional, hanya untuk lokal)
vercel --prod      # deploy ke Vercel
```

### 7.4 Dev Lokal

```bash
cd vercel

# Inject GAS URL dan jalankan server lokal
GAS_URL=https://script.google.com/macros/s/<ID>/exec node build.js
npx serve . -p 3000

# Buka: http://localhost:3000
```

Atau set URL langsung via browser console:
```javascript
gasApi.setUrl('https://script.google.com/macros/s/<ID>/exec');
```

### 7.5 Cara Kerja api-client.js

`api-client.js` secara otomatis mendeteksi lingkungan:

- **Di GAS** (serve via `doGet`): `google.script.run` native tersedia → polyfill tidak dipasang
- **Di Vercel**: `google.script.run` tidak ada → polyfill dipasang, semua panggilan dikirim via `fetch()`

Semua panggilan di `index.html` seperti:
```javascript
google.script.run
  .withSuccessHandler(fn)
  .loginUser(userId, password, pin, mode)
```
Tetap bekerja tanpa perubahan — dikirim sebagai `POST { fn: "loginUser", args: [...] }` ke GAS.

### 7.6 Format API

**Request:**
```json
{ "fn": "loginUser", "args": ["ADM-001", "admin123", null, "admin"] }
```

**Response sukses:**
```json
{ "ok": true, "data": { "success": true, "token": "...", "role": "Admin" } }
```

**Response error:**
```json
{ "ok": false, "code": "FORBIDDEN", "message": "Fungsi tidak diizinkan.", "status": 403 }
```

**Health check (GET):**
```
GET https://script.google.com/macros/s/<ID>/exec
→ { "ok": true, "data": { "app_name": "...", "timezone": "Asia/Jakarta", ... } }
```

---

## 8. Testing

### 8.1 Setup Satu Kali

```javascript
// Simpan URL deployment ke Script Properties
PropertiesService.getScriptProperties()
  .setProperty('DEPLOYED_WEBAPP_URL', 'https://script.google.com/macros/s/<ID>/exec');

// Aktifkan integration mode
activateMigrationMode();
```

### 8.2 Jalankan Semua Test (GAS)

```
Apps Script Editor → fungsi: test_runAll → Run
```

Output yang diharapkan:
```
╔══════════════════════════════════════════════╗
║   SIPADU CBT — PHASE 10 FULL TEST SUITE      ║
╚══════════════════════════════════════════════╝
  TOTAL: 78 PASSED  0 FAILED  5 SKIPPED
```

### 8.3 Test Suite Tersedia

| Fungsi | Apa yang diuji |
|--------|----------------|
| `test_runAll()` | Semua suite sekaligus |
| `test_statusCheck()` | Snapshot status sistem |
| `db_test_all()` | Unit: type converters, query builder |
| `db_test_integration()` | Live: dbGet / dbSet / dbUpdate / dbDelete |
| `test_readLayer()` | fs.* hybrid read + fallback |
| `test_writeLayer()` | fw.* builders + mode flags |
| `test_integrationLayer()` | Overrides + session guards |
| `test_apiEndpoints()` | doPost whitelist + response format |
| `test_dataIntegrity()` | Sheet vs Firestore counts |
| `test_authSecurity()` | Rejection untuk fungsi sensitif |
| `test_vercelApiClient()` | Smoke test live endpoint |

### 8.4 Browser Tests

```bash
cd vercel && npx serve . -p 3000
# Buka: http://localhost:3000/api-client.test.html
```

1. Isi GAS Web App URL → **Simpan URL**
2. Klik **▶ Jalankan Semua Test**

### 8.5 Checklist Sebelum Cutover

```
[ ] test_runAll()            → 0 FAILED
[ ] test_dataIntegrity()     → semua counts match
[ ] test_authSecurity()      → 0 FAILED
[ ] test_apiEndpoints()      → 0 FAILED
[ ] test_vercelApiClient()   → 0 FAILED
[ ] Browser test harness     → 0 FAILED
[ ] Login manual (siswa + admin) → berhasil
```

---

## 9. Cutover ke Firestore-Only

Cutover adalah peralihan dari dual-write ke Firestore-only. Lakukan saat:
- Semua test pass
- Tidak ada ujian aktif
- Di luar jam sibuk

### 9.1 Persiapan (H-1)

```javascript
// Konfirmasi test sudah pass
test_runAll()    // pastikan 0 FAILED

// Tandai test sudah pass
PropertiesService.getScriptProperties()
  .setProperty('PHASE10_TESTS_PASSED', 'true');

// Backup spreadsheet
manualBackup()

// Cek status
cutover_status()
```

### 9.2 Hari Cutover

```javascript
// Step 1: Pre-check (wajib)
cutover_preCheck()
// Harus: ✅ SEMUA CHECK BLOCKER PASS

// Step 2: Freeze sheets
cutover_freezeSheets()

// Step 3: Activate (otomatis jalankan pre-check ulang)
cutover_activate()

// Step 4: Smoke test
cutover_smokeTest()
// Harus: ✅ Semua smoke test PASS

// Step 5: Setup monitoring otomatis
cutover_setupMonitoringTrigger()
// Trigger: setiap 6 jam → cutover_monitor()
```

### 9.3 Monitoring 48 Jam

Selama 48 jam, monitoring berjalan otomatis setiap 6 jam. Pantau manual:

| Yang dicek | Cara |
|------------|------|
| Login siswa berhasil | Coba login dari browser |
| Soal tampil normal | Login sebagai Siswa |
| Jawaban tersimpan | Perhatikan syncAnswers |
| Admin panel berfungsi | Buka daftar ujian |
| Rekap nilai muncul | Cek getExamResults |

**Tanda harus rollback:**
- Login error (bukan "password salah")
- Soal tidak muncul
- `cutover_monitor()` melaporkan `issues > 0` berulang kali
- Firestore unreachable > 30 menit

### 9.4 Rollback (jika diperlukan)

```javascript
cutover_rollback()
// Dalam ~5 detik sistem kembali ke dual-write + hybrid read
```

### 9.5 Tutup Cutover

Setelah 48 jam stabil:

```javascript
cutover_finalReport()
// State: COMPLETED
// Monitoring trigger dihapus otomatis
```

### 9.6 Checklist Cutover

```
PRE-CUTOVER (H-1):
[ ] test_runAll() → 0 FAILED
[ ] PHASE10_TESTS_PASSED = true
[ ] Pilih waktu tanpa ujian aktif
[ ] manualBackup() selesai

HARI CUTOVER:
[ ] Ujian aktif = 0, siswa in-progress = 0
[ ] cutover_preCheck()       → 0 BLOCKERS
[ ] cutover_freezeSheets()   → 13 sheets frozen
[ ] cutover_activate()       → ✅ CUTOVER AKTIF
[ ] cutover_smokeTest()      → 0 FAILED
[ ] cutover_setupMonitoringTrigger()
[ ] Login manual test berhasil

MONITORING:
[ ] H+6  : cutover_monitor() → 0 issues
[ ] H+12 : cutover_monitor() → 0 issues + login test
[ ] H+24 : cutover_monitor() → 0 issues
[ ] H+36 : cutover_monitor() → 0 issues
[ ] H+48 : cutover_monitor() → 0 issues

FINALISASI:
[ ] cutover_finalReport()    → state = COMPLETED
```

---

## 10. Decommission Spreadsheet

Setelah cutover stabil, Spreadsheet bisa dikosongkan datanya dan dikunci sebagai arsip read-only. Ini opsional — hanya diperlukan untuk membersihkan quota dan memastikan tidak ada yang tidak sengaja mengakses sheet.

### 10.1 Persiapan

```javascript
// Pastikan cutover selesai
cutover_status()  // state harus COMPLETED

// Backup akhir
manualBackup()

// Konfirmasi
PropertiesService.getScriptProperties()
  .setProperty('DECOMMISSION_BACKUP_DONE', 'true');
```

### 10.2 Jalankan Decommission

```javascript
// Opsi 1: Langkah per langkah
decommission_preCheck()       // pastikan ✅ SEMUA CHECK PASS
decommission_exportArchive()  // backup + export CSV ke Drive
decommission_clearData()      // kosongkan Responses, Logs, AdminLogs
decommission_removeTriggers() // hapus semua clock trigger
decommission_lockSpreadsheet()// kunci read-only permanen
decommission_finalReport()    // tutup, state = DECOMMISSIONED

// Opsi 2: Shortcut semua sekaligus
decommission_runAll()
```

### 10.3 Yang Dikosongkan vs Yang Dipertahankan

**Dikosongkan** (data sudah di Firestore):
- `Responses` — jawaban siswa
- `Logs` — log pelanggaran
- `AdminLogs` — audit log

**Dipertahankan** sebagai arsip referensi:
- `Users`, `Exams`, `Questions`, `Konfigurasi`, `Master_Data`
- `Supervisors`, `ExamRooms`, `Gambar`, `Audio`, `Notifications`

### 10.4 Checklist Decommission

```
[ ] cutover_status()          → COMPLETED
[ ] Ujian aktif = 0
[ ] manualBackup()            → berhasil
[ ] DECOMMISSION_BACKUP_DONE  → true
[ ] decommission_preCheck()   → ✅ PASS
[ ] decommission_exportArchive() → folder di Drive terbuat
[ ] decommission_clearData()  → 3 sheet dikosongkan
[ ] decommission_removeTriggers() → trigger dihapus
[ ] decommission_lockSpreadsheet() → sheet di-protect
[ ] decommission_finalReport() → DECOMMISSIONED ✅

VERIFIKASI AKHIR:
[ ] Buka Vercel URL → login berhasil
[ ] Ujian bisa dibuat dan dijalankan
[ ] Siswa bisa login dan mengerjakan
[ ] Admin dapat melihat rekap nilai
```

---

## 11. Troubleshooting

### Firebase / Firestore

| Gejala | Solusi |
|--------|--------|
| "FIREBASE_PROJECT_ID belum dikonfigurasi" | `PropertiesService.getScriptProperties().setProperty('FIREBASE_PROJECT_ID', 'id')` |
| "401 Unauthorized" | `invalidateFirebaseToken(); testFirebaseConnection()` |
| Firestore tidak bisa diakses | `testFirebaseConnection()` — cek `FIREBASE_SA_KEY` mengandung baris lengkap `-----BEGIN/END PRIVATE KEY-----` |

### Integrasi

| Gejala | Solusi |
|--------|--------|
| Data tidak muncul setelah login | Pastikan `INTEGRATION_ENABLED=true` dan `migrateAll()` sudah dijalankan |
| "Firestore write error" di Logger | Non-fatal. Cek koneksi: `testFirebaseConnection()` |
| Sheet dan Firestore tidak sinkron | `migrateUsers()` / `migrateExams()` / dll. untuk sync ulang |
| Mau disable sementara | `disableIntegration()` — data tetap aman di sheet |

### Vercel / Frontend

| Gejala | Solusi |
|--------|--------|
| "GAS URL belum dikonfigurasi" | Set via console browser: `gasApi.setUrl('https://...')` |
| "Fungsi tidak diizinkan" (403) | Tambahkan fungsi ke whitelist di `api-router.gs`, deploy ulang |
| Response lambat (> 10 detik) | GAS cold start normal. Naikkan timeout: `gasApi.setTimeout(90000)` |
| `google.script.run` tidak ada | Normal di Vercel — cek `window.google.script.run.__isPolyfill__ === true` |
| Data tidak muncul di Vercel | Pastikan GAS_URL tersetting, cek network tab browser |

### Cutover

| Gejala | Solusi |
|--------|--------|
| Pre-check "Users count mismatch" | `migrateUsers(); verifyMigration()` |
| Smoke test FAILED setelah activate | `cutover_rollback()` segera |
| Monitor melaporkan issues | `cutover_status(); testFirebaseConnection()` — rollback jika > 30 menit |
| Mau rollback manual tanpa fungsi | `setReadMode('hybrid'); setWriteMode('dual'); enableIntegration()` |

---

## 12. Referensi File

### `gas/` — Google Apps Script

| File | Deskripsi |
|------|-----------|
| `Code.gs` | Business logic utama (**tidak dimodifikasi**) |
| `firebase-auth.gs` | JWT service account + token cache 55 menit |
| `firebase-helpers.gs` | Firestore type converters + query builder |
| `db.gs` | DAL: `dbGet`, `dbSet`, `dbUpdate`, `dbDelete`, `dbQuery`, `dbBatch` |
| `firestore-read.gs` | `fs.*` hybrid read layer (Firestore → Sheet fallback) |
| `firestore-write.gs` | `fw.*` write layer (dual-write atau Firestore-only) |
| `firestore-cbtops.gs` | Specialized CBT read helpers (join multi-koleksi) |
| `api-cors.gs` | Response builders: `_apiOk_`, `_apiErr_`, `_apiRun_` |
| `api-router.gs` | `doGet` (health check) + `doPost` (whitelist 70+ fungsi) |
| `code-integration.gs` | Override Code.gs untuk routing Firestore |
| `cutover.gs` | Semua fungsi cutover (Phase 11) + decommission (Phase 12) |
| `migrate-to-firestore.gs` | Utilitas migrasi data satu kali dari Sheet ke Firestore |
| `db.test.gs` | Test suite lengkap (unit + integration + security) |

### `vercel/` — Frontend

| File | Deskripsi |
|------|-----------|
| `index.html` | Aplikasi frontend (patched untuk Vercel) |
| `api-client.js` | `google.script.run` polyfill + `gasApi` Promise API |
| `build.js` | Inject `GAS_URL` ke `index.html` saat Vercel build |
| `vercel.json` | Vercel deployment config |
| `package.json` | npm scripts |
| `.env.example` | Template environment variables |
| `api-client.test.html` | Browser test harness (4 suite, 30 test cases) |

### `firebase/` — Firebase Config

| File | Deskripsi |
|------|-----------|
| `firestore.rules` | Security rules (deny-all dari client) |
| `firestore.indexes.json` | 16 composite indexes |
| `firebase.json` | Firebase CLI config |
| `.firebaserc` | Firebase project binding |

---

## Script Properties Lengkap

Semua konfigurasi disimpan di **Apps Script → Project Settings → Script Properties**:

| Key | Nilai | Keterangan |
|-----|-------|-----------|
| `FIREBASE_PROJECT_ID` | `your-project-id` | ID project Firebase |
| `FIREBASE_SA_EMAIL` | `xxx@xxx.iam.gserviceaccount.com` | Service account email |
| `FIREBASE_SA_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | Private key |
| `READ_MODE` | `hybrid` / `firebase-only` / `spreadsheet` | Mode baca aktif |
| `WRITE_MODE` | `dual` / `firestore` / `spreadsheet` | Mode tulis aktif |
| `INTEGRATION_ENABLED` | `true` / `false` | Override aktif |
| `DEPLOYED_WEBAPP_URL` | `https://script.google.com/...` | Untuk testing |
| `CUTOVER_STATE` | `NOT_STARTED` / `ACTIVE` / `COMPLETED` | Status cutover |
| `PHASE10_TESTS_PASSED` | `true` | Konfirmasi test sebelum cutover |
| `DECOMMISSION_BACKUP_DONE` | `true` | Konfirmasi backup sebelum decommission |

Lihat semua nilai saat ini:
```javascript
Logger.log(JSON.stringify(
  PropertiesService.getScriptProperties().getProperties(), null, 2
));
```

---

*Dokumentasi detail per fase tersedia di:*
- `gas/README-phase2.md` — Setup Firebase
- `gas/README-phase5-6.md` — Integrasi Firestore (Phase 5–12)
- `vercel/README-phase9.md` — Deploy Vercel
- `gas/README-phase10.md` — Testing
- `gas/README-phase11.md` — Cutover Runbook
- `gas/README-phase12.md` — Decommission Guide
