# Phase 9 — Frontend Migration ke Vercel

Dokumen ini menjelaskan cara deploy SIPADU CBT ke Vercel dengan GAS sebagai backend REST API.

---

## Arsitektur

```
Browser (Vercel)
      │  fetch() POST { fn, args }
      ▼
https://script.google.com/macros/s/<ID>/exec
      │  (GAS Web App)
      ├── api-cors.gs     → response builders
      ├── api-router.gs   → doPost() whitelist router
      └── Code.gs + code-integration.gs + ...
              │
              ├── Spreadsheet (sumber kebenaran selama dual-write)
              └── Firestore   (setelah cutover)
```

---

## File Baru di Fase Ini

| File | Lokasi | Deskripsi |
|------|--------|-----------|
| `api-cors.gs` | `gas/` | Response builders (`_apiOk_`, `_apiErr_`, `_apiRun_`) |
| `api-router.gs` | `gas/` | `doGet` + `doPost` router + whitelist 70+ fungsi |
| `api-client.js` | `vercel/` | `google.script.run` polyfill + `gasApi` Promise API |
| `index.html` | `vercel/` | Copy `index.html` dengan 5 patch Vercel |
| `vercel.json` | `vercel/` | Vercel deployment config |
| `package.json` | `vercel/` | npm scripts |
| `build.js` | `vercel/` | Inject `GAS_URL` ke `index.html` saat build |
| `.env.example` | `vercel/` | Template environment variables |

---

## Perubahan di `vercel/index.html` vs `index.html`

Hanya 5 patch — tidak ada perubahan logika:

| Patch | Perubahan |
|-------|-----------|
| P1 | Hapus `<base target="_top">` (GAS-specific, rusak di Vercel) |
| P2 | Update `<title>` dari hardcoded ke `SIPADU CBT \| Ujian Online` |
| P3 | Inject `<div id="__GAS_CONFIG__">` + `<script src="/api-client.js">` sebelum `</head>` |
| P4 | Ganti 5 ekspresi `<?= cfg.* ?>` dengan `data-cfg="..."` attributes + `window.APP_TIMEZONE ||` |
| P5 | Ganti body `fetchAndStartClock()` agar pakai `window._appTimezone` dari bootstrap |

---

## Urutan File di Apps Script (setelah Phase 9)

```
1. firebase-auth.gs
2. firebase-helpers.gs
3. db.gs
4. firestore-read.gs
5. firestore-write.gs
6. firestore-cbtops.gs
7. api-cors.gs          ← Phase 9 (WAJIB sebelum api-router)
8. api-router.gs        ← Phase 9
9. Code.gs
10. code-integration.gs ← HARUS TERAKHIR
```

---

## Cara Deploy ke Vercel

### Prasyarat

1. GAS Web App sudah di-deploy:
   - Apps Script → **Deploy → New Deployment**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Catat URL: `https://script.google.com/macros/s/<ID>/exec`

2. Vercel CLI atau akun Vercel tersambung ke repo.

### Langkah Deploy

```bash
# 1. Masuk ke folder vercel
cd vercel

# 2. Install dependencies (opsional, hanya untuk dev lokal)
npm install

# 3. Set environment variable
# Di Vercel Dashboard: Settings → Environment Variables
#   GAS_URL = https://script.google.com/macros/s/<YOUR_DEPLOYMENT_ID>/exec

# 4. Deploy
vercel --prod
```

### Dev Lokal

```bash
cd vercel

# Jalankan build script (inject GAS_URL)
GAS_URL=https://script.google.com/macros/s/<ID>/exec node build.js

# Serve lokal
npx serve . -p 3000
# Buka: http://localhost:3000
```

Atau tanpa build (GAS URL diset via console browser):
```javascript
// Di browser console:
gasApi.setUrl('https://script.google.com/macros/s/<ID>/exec');
```

---

## api-client.js — Cara Kerja

### Drop-in `google.script.run` replacement

`api-client.js` otomatis mendeteksi lingkungan:
- **Di GAS** (doGet serve): `google.script.run` native ada → polyfill tidak dipasang
- **Di Vercel**: `google.script.run` tidak ada → polyfill dipasang

Semua panggilan yang ada di `index.html` seperti:
```javascript
google.script.run
  .withSuccessHandler(fn)
  .functionName(arg1, arg2)
```
Tetap bekerja tanpa perubahan — dikirim sebagai `fetch()` POST ke GAS.

### Promise API baru (`gasApi`)

```javascript
// Cara baru (lebih ergonomis):
gasApi.call('getExamList', userID, token)
  .then(exams => console.log(exams))
  .catch(err  => console.error(err));

// Bootstrap config:
gasApi.getConfig().then(cfg => console.log(cfg.app_name));

// Set URL runtime:
gasApi.setUrl('https://script.google.com/macros/s/.../exec');
```

### Bootstrap

Saat DOM siap, `api-client.js` secara otomatis:
1. Memanggil `gasApi.getConfig()` (GAS `doGet`)
2. Mengisi semua elemen `data-cfg="*"` dengan nilai dari config
3. Men-set `window.APP_TIMEZONE` dan `window._appTimezone`
4. Melempar event `gasConfigLoaded` (ditangkap oleh `fetchAndStartClock`)

---

## GAS API Router — Format Request/Response

### Request (POST body)
```json
{ "fn": "loginUser", "args": ["ADM-001", "admin123", null, "admin"] }
```

### Response sukses
```json
{ "ok": true, "data": { "success": true, "token": "...", "role": "Admin" } }
```

### Response error
```json
{ "ok": false, "code": "FORBIDDEN", "message": "Fungsi tidak diizinkan.", "status": 403 }
```

### Health check (GET)
```
GET https://script.google.com/macros/s/<ID>/exec
→ { "ok": true, "data": { "app_name": "...", "timezone": "Asia/Jakarta", ... } }
```

---

## CORS & Keamanan

GAS Web App dengan deploy setting **"Anyone"** dapat diakses langsung dari browser
tanpa CORS preflight (tidak butuh `Access-Control-Allow-Origin` header) karena:
- Request dikirim dengan `Content-Type: text/plain` (bukan JSON)
- Ini adalah "simple request" — browser tidak mengirim preflight OPTIONS

**Keamanan backend tetap terjamin** karena:
- Semua fungsi yang butuh auth menerima `userID + token` sebagai argumen
- GAS memvalidasi token di setiap fungsi sebelum mengembalikan data
- Daftar fungsi yang boleh dipanggil dikontrol di whitelist `api-router.gs`
- Fungsi sensitif (verifyAdminAccess, dll.) tetap di-enforce di dalam fungsi itu sendiri

---

## Troubleshooting

### "GAS URL belum dikonfigurasi"
Set URL via console browser:
```javascript
gasApi.setUrl('https://script.google.com/macros/s/<ID>/exec');
```
Atau rebuild dengan `GAS_URL` yang benar.

### "Fungsi ... tidak diizinkan" (403)
Fungsi belum ada di whitelist `_API_WHITELIST_` di `api-router.gs`.
Tambahkan dan buat deployment GAS baru.

### Response lambat / timeout
- GAS cold start bisa 5-10 detik pada request pertama
- Timeout default di `api-client.js`: 60 detik
- Ubah via `gasApi.setTimeout(90000)` jika perlu

### Data tidak muncul setelah login
Pastikan `INTEGRATION_ENABLED=true` dan Firestore terisi (jalankan `migrateAll()` di GAS Editor).

### `google.script.run` tidak ditemukan di console
Normal — di Vercel, `google.script.run` adalah polyfill.
Cek `window.google.script.run.__isPolyfill__` — seharusnya `true`.

---

## Fase Selanjutnya

| Phase | Topik |
|-------|-------|
| **10** | Testing: integration test live |
| **11** | Cutover: `activateCutoverMode()` + monitoring |
| **12** | Decommission Spreadsheet |
