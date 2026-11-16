# TASKS.md — MadangLur
**Rencana Pengerjaan Iteratif**
Versi: 0.3.0 | Referensi: SPEC.md v0.3.0, UI-SPEC.md v0.3.0
Estimasi total: **±14–16 jam** (2 hari, 1 orang)

> Kerjakan berurutan. Setiap milestone adalah checkpoint yang dapat dijalankan dan diuji sendiri.
> Jangan lanjut ke milestone berikutnya sebelum semua acceptance criteria milestone saat ini terpenuhi.

---

## Legenda Status

| Simbol | Arti |
|--------|------|
| `[ ]` | Belum dikerjakan |
| `[x]` | Selesai |
| `[~]` | Sedang dikerjakan / sebagian |

---

## M1 — Scaffold Monorepo & Koneksi Database
**Estimasi: ±45 menit**
**Goal:** Struktur folder siap; Express bisa query ke Supabase; Vite bisa jalan.

### Tugas

- [ ] Buat struktur monorepo:
  ```
  madanglur/
    db/migrations/   db/seed.js
    server/          client/
    .env.example     .gitignore    README.md
  ```
- [ ] Isi `.gitignore`: `node_modules/`, `.env`
- [ ] Salin `.env.example` → `.env`; isi `DATABASE_URL` dan `JWT_SECRET`
- [ ] Setup server:
  ```
  cd server && npm init -y
  npm install express pg bcrypt jsonwebtoken cors dotenv
  npm install -D nodemon
  ```
- [ ] Buat `server/config/db.js` — Pool pg dari `DATABASE_URL`
- [ ] Tambah script di `server/package.json`:
  ```json
  "dev": "nodemon index.js",
  "start": "node index.js"
  ```
- [ ] Buat `server/index.js` — Express minimal dengan CORS + satu route health-check `GET /api/ping`
- [ ] Setup client:
  ```
  cd client && npm create vite@latest . -- --template vanilla
  ```
- [ ] Buat `client/vite.config.js` — proxy `/api` → `http://localhost:3000`
- [ ] Jalankan migrasi `db/migrations/001_init.sql` di Supabase SQL Editor

### File yang Disentuh

```
madanglur/
  .env.example
  .gitignore
  server/package.json
  server/index.js
  server/config/db.js
  client/vite.config.js
  db/migrations/001_init.sql
```

### Acceptance Criteria

```
M1-AC1  cd server && node -e "require('./config/db').query('SELECT 1').then(()=>console.log('OK'))"
        → output "OK", tidak ada error koneksi.

M1-AC2  curl http://localhost:3000/api/ping
        → 200 { "pong": true }

M1-AC3  cd client && npm run dev
        → Vite berjalan di http://localhost:5173, tidak ada error terminal.

M1-AC4  Supabase Table Editor: tabel users, toko, produk terbuat dengan kolom sesuai §5.2 SPEC.
```

---

## M2 — Seed Database & Katalog Publik (8 Produk)
**Estimasi: ±2,5 jam**
**Goal:** 8 produk dari DB tampil sebagai card grid di halaman katalog; Hero section lengkap.

### Tugas

**Backend:**
- [ ] Buat `db/seed.js` — hash password bcrypt lalu INSERT users, toko, 8 produk sesuai §5.3 SPEC
- [ ] Jalankan `node db/seed.js` — verifikasi 3 user, 2 toko, 8 produk di Supabase Table Editor
- [ ] Buat `server/routes/produk.js`:
  - `GET /api/produk` — query dengan LEFT JOIN toko; kembalikan `toko_nama` dan `toko_nomor_wa`
- [ ] Daftarkan route di `server/index.js`

**Frontend:**
- [ ] Buat `client/src/api.js` — fungsi `apiFetch(path, options)` **(versi sementara, tanpa JWT)** — akan diupdate di M4 untuk menyisipkan header `Authorization: Bearer` otomatis
- [ ] Buat `client/src/utils.js` — `formatRupiah(n)`, `katEmoji(k)`, `bgClass(k)`, `katClass(k)`
- [ ] Buat `client/src/pages/catalog.js` — `renderCatalog()`:
  - Fetch `GET /api/produk` (satu kali, simpan di variabel `allProducts`)
  - Render Hero section — angka dihitung dari `allProducts`:
    - **Total produk** = `allProducts.length`
    - **Toko aktif** = `new Set(allProducts.map(p => p.toko_id)).size`
    - **Kategori** = `new Set(allProducts.map(p => p.kategori)).size`
    - _(Tidak perlu fetch `GET /api/toko` terpisah — endpoint itu baru dibuat di M5)_
  - Render product grid sesuai UI-SPEC §3.3
  - Render card: nama toko, nama produk, badge kategori, harga, indikator stok, tombol WA
- [ ] Implementasi indikator stok 3 level (ok / low / habis) sesuai UI-SPEC §3.3
- [ ] Implementasi tombol WA: disabled jika stok=0 atau nomor_wa kosong; link `wa.me/...` jika aktif
- [ ] Buat `client/index.html` — struktur dasar + mount catalog
- [ ] Import CSS dari prototype ke `client/src/style.css` (design token + komponen katalog)
- [ ] Buat Navbar — state guest (hanya tombol Masuk) sesuai UI-SPEC §2.1
- [ ] Loading state: tampilkan "Memuat produk…" di grid + placeholder `—` di Hero stats selama fetch berlangsung
- [ ] Error state: jika fetch gagal → toast error "Gagal memuat data. Coba lagi." (sesuai AC-UI12 SPEC)
- [ ] Empty state jika tidak ada produk

### File yang Disentuh

```
db/seed.js
server/routes/produk.js
server/index.js
client/index.html
client/src/style.css
client/src/api.js
client/src/utils.js
client/src/pages/catalog.js
client/src/main.js
```

### Acceptance Criteria

```
M2-AC1  node db/seed.js → tidak error; Supabase: 3 user, 2 toko, 8 produk.

M2-AC2  curl http://localhost:3000/api/produk
        → 200, array 8 objek; tiap objek ada field toko_nama dan toko_nomor_wa.
        (sesuai AC-F01 SPEC)

M2-AC3  Buka http://localhost:5173 → 8 card produk tampil.

M2-AC4  Setiap card: nama toko, nama produk, badge kategori (warna sesuai kategori),
        harga format Rp, indikator stok tampil benar.

M2-AC5  Produk "Kerupuk Ikan Blambangan" (stok=0) → tombol WA disabled + label "Habis".

M2-AC6  Produk dengan nomor_wa terisi → klik tombol WA → terbuka wa.me/{nomor} di tab baru.
        (sesuai AC-UI03, AC-UI05 SPEC)

M2-AC7  Hero section: angka produk, toko, kategori tampil dan sesuai data nyata dari API.
        (angka dihitung dari response produk, bukan endpoint terpisah)

M2-AC8  Selama fetch berlangsung → grid menampilkan "Memuat produk…"; Hero stats menampilkan "—".

M2-AC9  Matikan server lalu buka katalog → toast "Gagal memuat data. Coba lagi." muncul; halaman tidak crash.
        (sesuai AC-UI12 SPEC)
```

---

## M3 — Pencarian, Filter Kategori & Sorting
**Estimasi: ±1 jam**
**Goal:** Filter bar fungsional; semua filter bekerja di sisi klien dari data yang sudah di-fetch.

### Tugas

- [ ] Tambah filter bar ke `catalog.js`:
  - Search input (real-time `oninput`) — filter nama produk case-insensitive
  - Pill kategori: Semua / 5 kategori / ⭐ Unggulan — sesuai UI-SPEC §3.2
  - Sort select: default / Nama A–Z / Harga termurah / Harga termahal / Stok terbanyak
- [ ] State filter (`currentKat`, query search, sort) disimpan dalam variabel modul — tidak re-fetch ke API saat filter berubah
- [ ] Update `catalog-count` (#N produk ditampilkan) setiap filter berubah
- [ ] Tampilkan empty state jika hasil filter kosong

### File yang Disentuh

```
client/src/pages/catalog.js
client/src/style.css  (tambah style filter bar jika belum ada)
```

### Acceptance Criteria

```
M3-AC1  Ketik "kopi" di search → hanya card "Kopi Osing Robusta" tampil, real-time.
        (sesuai AC-UI02 SPEC; perilaku sama dengan AC-F03 tapi diproses di client, bukan server)

M3-AC2  Klik pill "Minuman" → hanya produk kategori Minuman tampil.
        (perilaku sama dengan AC-F02 tapi diproses di client)

M3-AC3  Klik pill "⭐ Unggulan" → hanya produk dengan unggulan=true tampil.

M3-AC4  Sort "Harga termurah" → card urut dari Rp 12.000 ke Rp 45.000.

M3-AC5  Sort "Nama A–Z" → card urut alfabetis.

M3-AC6  Kombinasi: search "a" + filter "Minuman" → hanya produk minuman yang namanya mengandung "a".

M3-AC7  Tidak ada produk sesuai filter → empty state tampil (emoji + teks "Tidak ada produk...").

M3-AC8  catalog-count menunjukkan jumlah card yang sedang tampil, bukan total semua produk.
```

---

## M4 — Autentikasi JWT & Integrasi WhatsApp
**Estimasi: ±1,5 jam**
**Goal:** Login/logout berfungsi; JWT disimpan di localStorage; redirect sesuai role; tombol WA terverifikasi.

### Tugas

**Backend:**
- [ ] Buat `server/middleware/verifyJWT.js` — parse dan verifikasi `Authorization: Bearer <token>`
- [ ] Buat `server/middleware/authorize.js` — cek `req.user.role`; return 403 jika tidak sesuai
- [ ] Buat `server/routes/auth.js`:
  - `POST /api/auth/login`: query user, `bcrypt.compare`, cek `aktif`, sign JWT (payload: `{ userId, role, tokoId }`, expire 8 jam), return token + info user
- [ ] Daftarkan route di `server/index.js`

**Frontend:**
- [ ] Buat `client/src/auth.js`:
  - `login(username, password)` — POST ke `/api/auth/login`, simpan token ke `localStorage` key `madanglur_token`
  - `logout()` — hapus token dari localStorage, redirect ke `#/`
  - `getSession()` — decode payload JWT dari localStorage (tanpa verifikasi ulang di client); return null jika tidak ada / expired
- [ ] Update `client/src/api.js` — `apiFetch` otomatis sisipkan header `Authorization: Bearer` dari localStorage; intercept 401 → `logout()` → redirect `#/login`
- [ ] Buat `client/src/router.js` — hash routing + route guard:
  - `#/login` → redirect `#/` jika sudah login
  - `#/dashboard` → redirect `#/login` jika tidak ada session; 403 jika bukan penjual
  - `#/admin` → redirect `#/login` jika tidak ada session; 403 jika bukan admin
- [ ] Buat `client/src/pages/login.js`:
  - Form username + password
  - Demo accounts widget (3 baris + tombol "Pakai" isi otomatis) sesuai UI-SPEC §4
  - Tampilkan pesan error dari API (401 wrong password / 401 nonaktif)
  - Redirect sesuai role setelah berhasil
- [ ] Update Navbar — tampilkan username + role badge + tombol Keluar jika sudah login

### File yang Disentuh

```
server/middleware/verifyJWT.js
server/middleware/authorize.js
server/routes/auth.js
server/index.js
client/src/auth.js
client/src/api.js
client/src/router.js
client/src/pages/login.js
client/src/main.js  (mount router, update renderNav)
client/src/style.css  (tambah style login page jika belum)
```

### Acceptance Criteria

```
M4-AC1  POST /api/auth/login {username:"admin", password:"Admin123!"} → 200, ada field "token".
        (sesuai AC-A01 SPEC)

M4-AC2  POST /api/auth/login {username:"admin", password:"salah"} → 401, ada field "error".
        (sesuai AC-A02 SPEC)

M4-AC3  POST /api/auth/login akun penjual nonaktif (setelah di-patch) → 401 "Akun Anda dinonaktifkan".
        (sesuai AC-A03 SPEC)

M4-AC4  GET /api/users tanpa token → 401.
        (sesuai AC-A04 SPEC)

M4-AC5  GET /api/users dengan token penjual → 403.
        (sesuai AC-A05 SPEC)

M4-AC6  Login admin di browser → redirect ke #/admin.
        Login penjual → redirect ke #/dashboard.
        (sesuai AC-A06 SPEC)

M4-AC7  Akses #/dashboard di browser tanpa token → redirect ke #/login.
        (sesuai AC-A07 SPEC)

M4-AC8  Klik "Keluar" → token hilang dari localStorage; redirect ke katalog; navbar kembali ke state guest.
        (sesuai AC-A08 SPEC)

M4-AC9  localStorage.getItem('madanglur_token') setelah login → string JWT (bukan null).

M4-AC10 Tombol WA di katalog: produk stok>0 dan nomor_wa terisi → klik → wa.me terbuka
        dengan nomor toko yang benar (bukan hardcode).
        (sesuai AC-UI05 SPEC)
```

---

## M5 — Dashboard Penjual (CRUD Produk & Profil Toko)
**Estimasi: ±2,5 jam**
**Goal:** Penjual bisa tambah, edit, hapus produk miliknya; bisa edit profil toko; semua tervalidasi di server.

### Tugas

**Backend:**
- [ ] Lengkapi `server/routes/produk.js`:
  - `GET /api/produk?toko_id=:id` — filter by toko_id (sudah ada di M2, tambah param)
  - `GET /api/produk/:id` — detail satu produk; 404 jika UUID tidak ditemukan (sesuai AC-F10, AC-F11 SPEC)
  - `POST /api/produk` — verifyJWT + authorize('penjual'); inject `toko_id` dari `req.user.tokoId`; validasi field
  - `PUT /api/produk/:id` — cek `toko_id === req.user.tokoId` (403 jika beda)
  - `DELETE /api/produk/:id` — cek kepemilikan sama
- [ ] Buat `server/routes/toko.js`:
  - `GET /api/toko/:id` — detail toko + ringkasan (total produk, total stok, jumlah kategori)
  - `PUT /api/toko/:id` — verifyJWT; cek `penjual_id === req.user.userId`; validasi nomor_wa
- [ ] Buat `server/utils/validate.js` — `validateNomorWA(str)` regex `^62[0-9]{8,}$`
- [ ] Daftarkan routes toko di `server/index.js`

**Frontend:**
- [ ] Buat `client/src/pages/dashboard.js`:
  - Guard: redirect jika bukan penjual
  - Fetch toko sendiri (`GET /api/toko/:id`) + render sidebar + header
  - Render 4 stat cards (total produk, stok, kategori, unggulan) — sesuai UI-SPEC §5.2
  - Tab "Produk Saya": tabel produk dari `GET /api/produk?toko_id=:id`
  - Tab "Profil Toko": form edit nama, deskripsi, nomor WA — sesuai UI-SPEC §5.3
  - Tombol "+ Tambah Produk" → buka modal
  - Tombol Edit baris → buka modal isi data produk
  - Tombol Hapus baris → `confirm()` → DELETE; toast feedback
- [ ] Buat modal tambah/edit produk sesuai UI-SPEC §7.2:
  - Field: nama, kategori (select), stok, harga, deskripsi, checkbox unggulan
  - Validasi client-side sebelum POST/PUT (sesuai tabel UI-SPEC §9)
  - Setelah simpan → tutup modal → re-render tabel + stat cards tanpa full reload
- [ ] Form profil toko: validasi nomor WA sebelum PUT; toast "Profil berhasil disimpan"
- [ ] Empty state tabel: "Belum ada produk. Tambahkan produk pertama Anda!"

### File yang Disentuh

```
server/routes/produk.js
server/routes/toko.js
server/utils/validate.js
server/index.js
client/src/pages/dashboard.js
client/src/style.css  (tambah style dashboard jika belum)
client/src/router.js  (daftarkan route #/dashboard)
```

### Acceptance Criteria

```
M5-AC1  Login penjual → tabel hanya tampil produk toko sendiri (bukan toko lain).
        (sesuai AC-UI07 SPEC)

M5-AC2  Klik "+ Tambah Produk" → isi form → Simpan → produk langsung muncul di tabel
        dan di halaman katalog tanpa reload penuh.
        (sesuai AC-UI08 SPEC)

M5-AC3  POST /api/produk tanpa token → 401. (AC-F05 SPEC)

M5-AC4  POST /api/produk harga: -1 → 422, ada pesan validasi. (AC-F07 SPEC)

M5-AC5  PUT /api/produk/:id dengan token penjual lain → 403. (AC-F08 SPEC)

M5-AC6  DELETE /api/produk/:id oleh owner → 200; GET produk tersebut → 404. (AC-F09 SPEC)

M5-AC7  Edit profil toko → ubah nomor WA → Simpan → fetch ulang form → nomor baru tampil.
        (sesuai AC-UI09 SPEC)

M5-AC8  PUT /api/toko/:id dengan nomor_wa "08123" (tidak diawali 62) → 422. (AC-T02 SPEC)

M5-AC9  PUT /api/toko/:id toko lain oleh penjual berbeda → 403. (AC-T04 SPEC)

M5-AC10 Toast muncul dengan pesan yang tepat setelah setiap aksi (tambah/edit/hapus/simpan profil).

M5-AC11 Stat cards update otomatis setelah tambah/hapus produk (tanpa reload halaman).

M5-AC12 GET /api/produk/:id dengan UUID valid → 200, objek produk lengkap. (AC-F10 SPEC)

M5-AC13 GET /api/produk/:id dengan UUID tidak ada → 404 { error: "Tidak ditemukan" }. (AC-F11 SPEC)
```

---

## M6 — Panel Admin (CRUD Penjual)
**Estimasi: ±1,5 jam**
**Goal:** Admin bisa lihat, tambah, nonaktifkan, dan hapus akun penjual beserta tokonya.

### Tugas

**Backend:**
- [ ] Buat `server/routes/users.js`:
  - `GET /api/users` — authorize('admin'); join toko + COUNT produk per toko
  - `GET /api/users/summary` — total penjual, total produk global
  - `POST /api/users` — hash password, INSERT user + toko dalam satu transaksi PostgreSQL
  - `PATCH /api/users/:id/status` — toggle field `aktif`
  - `DELETE /api/users/:id` — cascade otomatis via FK ON DELETE CASCADE
- [ ] Daftarkan routes di `server/index.js`

**Frontend:**
- [ ] Buat `client/src/pages/admin.js`:
  - Guard: redirect jika bukan admin
  - Fetch `/api/users/summary` → render 3 global stat cards (total penjual, produk, toko aktif)
  - Fetch `/api/users` → render tabel penjual: username, nama toko, jumlah produk, status badge, tombol aksi
  - Badge status: `.status-aktif` / `.status-nonaktif` sesuai UI-SPEC §6.3
  - Tombol "Nonaktifkan"/"Aktifkan" → PATCH; toast; re-render tabel
  - Tombol "Hapus" → `confirm()` → DELETE; toast; re-render
  - Tombol "+ Tambah Penjual" → buka modal
- [ ] Buat modal tambah penjual sesuai UI-SPEC §7.3:
  - Field: username, password, nama toko, nomor WA (opsional)
  - Validasi client-side (sesuai UI-SPEC §9)
  - Setelah simpan → tutup modal → re-render tabel + summary

### File yang Disentuh

```
server/routes/users.js
server/index.js
client/src/pages/admin.js
client/src/style.css  (tambah style admin jika belum)
client/src/router.js  (daftarkan route #/admin)
```

### Acceptance Criteria

```
M6-AC1  Login admin → tabel penjual tampil dengan username, nama toko, jumlah produk, status.
        (sesuai AC-UI10 SPEC)

M6-AC2  POST /api/users (token admin), username unik + data valid → 201;
        user baru + toko kosong terbuat di DB. (AC-ADM01 SPEC)

M6-AC3  POST /api/users username duplikat → 422 "Username sudah digunakan". (AC-ADM02 SPEC)

M6-AC4  Klik "Nonaktifkan" → PATCH status false → badge berubah "Nonaktif" → penjual tidak bisa login.
        (sesuai AC-ADM03 SPEC)

M6-AC5  Klik "Hapus penjual" → konfirmasi → DELETE → penjual hilang dari tabel;
        produk toko tersebut hilang dari katalog. (AC-ADM04, AC-UI11 SPEC)

M6-AC6  GET /api/users/summary → 200, ada field total penjual dan total produk.

M6-AC7  Global stat cards menampilkan angka yang sesuai dengan data nyata.
```

---

## M7 — Vitest: Unit Test Utils & Validasi
**Estimasi: ±1 jam**
**Goal:** Fungsi-fungsi kritis yang murni (tanpa I/O) tercakup oleh unit test.

> Scope: **unit test saja** — utils client-side dan validator server-side.
> Tidak mencakup integration test endpoint Express (itu cukup diuji manual via acceptance criteria).

### Tugas

**Setup:**
- [ ] Install Vitest di `client/`:
  ```
  cd client && npm install -D vitest
  ```
- [ ] Tambah script di `client/package.json`:
  ```json
  "test": "vitest run",
  "test:watch": "vitest"
  ```
- [ ] Install Vitest (atau Jest) di `server/` untuk test validator:
  ```
  cd server && npm install -D vitest
  ```
- [ ] Tambah script di `server/package.json`:
  ```json
  "test": "vitest run"
  ```

**Test yang ditulis:**

`client/src/__tests__/utils.test.js`:
- [ ] `formatRupiah(18000)` → `"Rp 18.000"`
- [ ] `formatRupiah(0)` → `"Rp 0"`
- [ ] `katClass('Minuman')` → `"kat-minuman"`
- [ ] `katClass('Jajanan Pasar')` → `"kat-jajanan"`
- [ ] `katClass('kategori tidak ada')` → fallback string (tidak throw)
- [ ] `bgClass` — 5 kategori valid + 1 fallback
- [ ] `katEmoji` — 5 kategori valid

`server/__tests__/validate.test.js`:
- [ ] `validateNomorWA('6281200000001')` → `true`
- [ ] `validateNomorWA('6281')` → `false` (kurang dari 8 digit setelah 62)
- [ ] `validateNomorWA('08123456789')` → `false` (tidak diawali 62)
- [ ] `validateNomorWA('')` → `false`
- [ ] `validateNomorWA('628abc123')` → `false` (ada huruf)
- [ ] `validateNomorWA('6281200000099')` → `true`

> **Catatan:** Regex yang diuji di sini (`^62[0-9]{8,}$`) wajib identik antara `server/utils/validate.js` dan `client/src/utils.js`. Jika ada perbedaan, DB constraint PostgreSQL (`CHECK`) menjadi penentu akhir. Test ini memastikan keduanya konsisten.

### File yang Disentuh

```
client/package.json
client/src/__tests__/utils.test.js
server/package.json
server/__tests__/validate.test.js
```

### Acceptance Criteria

```
M7-AC1  cd client && npm test → semua test utils hijau, 0 failed.

M7-AC2  cd server && npm test → semua test validateNomorWA hijau, 0 failed.

M7-AC3  Test coverage: minimal 100% untuk fungsi yang di-test
        (tidak perlu coverage global — cukup file utils dan validate).

M7-AC4  Tidak ada test yang di-skip atau ditandai .todo tanpa alasan.
```

### Perintah Uji

```bash
# Unit test client
cd client && npm test

# Unit test server
cd server && npm test

# Watch mode selama development
cd client && npm run test:watch
```

---

## M8 — Security Review & Polish
**Estimasi: ±1 jam**
**Goal:** Semua acceptance criteria SPEC §11 terpenuhi; tidak ada celah keamanan obvious; UI responsif dan aksesibel.

### Tugas

**Security checklist:**
- [ ] Verifikasi `DATABASE_URL` dan `JWT_SECRET` tidak ada di kode — hanya di `.env`
- [ ] Verifikasi `.env` ada di `.gitignore` dan tidak ter-commit
- [ ] Pastikan setiap handler PUT/DELETE produk selalu cek `toko_id === req.user.tokoId` di server (bukan hanya di UI)
- [ ] Pastikan setiap handler PUT toko selalu cek `penjual_id === req.user.userId`
- [ ] Verifikasi tidak ada logika "bypass" JWT — semua endpoint terproteksi wajib lewat `verifyJWT`
- [ ] Password: pastikan `bcrypt.compare` yang dipakai di login, bukan `===`
- [ ] Validasi nomor WA dilakukan di **dua tempat**: `validate.js` server + `utils.js` client

**UI/UX polish:**
- [ ] Cek responsivitas di viewport 375px dan 1280px (semua halaman)
- [ ] Cek kontras warna — gunakan DevTools Accessibility panel
- [ ] Pastikan semua `<button>`, `<input>`, `<select>` dapat dijangkau keyboard (Tab + Enter)
- [ ] Semua `<label>` terhubung ke `<input>` via `for`/`id`
- [ ] Tombol WA disabled menggunakan attribute `disabled` (bukan hanya CSS `pointer-events: none`)
- [ ] Hapus semua `console.log` debug

**QA manual — jalankan seluruh checklist SPEC §11:**
- [ ] AC-A01 s/d AC-A08
- [ ] AC-F01 s/d AC-F09
- [ ] AC-T01 s/d AC-T04
- [ ] AC-ADM01 s/d AC-ADM04
- [ ] AC-UI01 s/d AC-UI11

### File yang Disentuh

```
server/middleware/verifyJWT.js   (review)
server/routes/produk.js          (review kepemilikan)
server/routes/toko.js            (review kepemilikan)
server/routes/users.js           (review)
server/utils/validate.js         (review)
client/src/utils.js              (review validasi WA)
client/src/style.css             (kontras, aksesibilitas)
.gitignore                       (verifikasi)
```

### Acceptance Criteria

```
M8-AC1  git log --all -- .env → tidak ada commit yang menyertakan file .env.

M8-AC2  PUT /api/produk/:id dengan token penjual lain → 403 (bukan 200).
        Verifikasi ini terjadi di server, bukan hanya diblok di UI.

M8-AC3  Semua 26 acceptance criteria SPEC §11 (AC-A01–AC-UI11) lulus secara manual.

M8-AC4  DevTools Lighthouse Accessibility score ≥ 80 di halaman katalog.

M8-AC5  Semua elemen interaktif dapat dijangkau dengan Tab; tombol dapat diaktifkan dengan Enter/Space.

M8-AC6  grep -r "console.log" server/src client/src → tidak ada hasil (atau hanya komentar).

M8-AC7  Viewport 375px: semua teks terbaca, tidak ada overflow horizontal di halaman katalog.
```

### Perintah Uji

```bash
# Cek file .env tidak ter-commit
git status

# Cek console.log tersisa
grep -r "console.log" server/ client/src/

# Jalankan semua unit test sekaligus
cd client && npm test && cd ../server && npm test
```

---

## M9 — README & Finalisasi (Out-of-Scope: Deployment ke Cloud)
**Estimasi: ±30 menit**
**Goal:** Proyek dapat di-clone dan dijalankan orang lain dari README saja; semua checklist selesai.

> Sesuai SPEC §10 Out-of-Scope: **tidak ada deployment ke cloud**. Aplikasi berjalan lokal + Supabase.

### Tugas

- [ ] Tulis `README.md`:
  - Deskripsi singkat MadangLur
  - Prasyarat: Node.js ≥ 18, akun Supabase
  - Setup: clone → `.env` → migrasi → seed → jalankan
  - Cara menjalankan:
    ```bash
    # Terminal 1 — API
    cd server && npm run dev
    # Terminal 2 — Frontend
    cd client && npm run dev
    ```
  - Akun demo (username + password seed)
  - Struktur direktori singkat
- [ ] Update `SPEC.md` jika ada perbedaan implementasi vs spec selama pengerjaan
- [ ] Final commit: semua file ter-commit kecuali `.env` dan `node_modules`
- [ ] Verifikasi `npm run dev` berjalan clean di terminal baru (tanpa cache)

### File yang Disentuh

```
README.md
SPEC.md   (jika ada koreksi)
.env.example  (pastikan template lengkap)
```

### Acceptance Criteria

```
M9-AC1  Clone repo ke folder baru → ikuti README → aplikasi berjalan tanpa langkah ekstra.

M9-AC2  README mencantumkan: prasyarat, setup, cara run, akun demo.

M9-AC3  .env.example berisi semua variabel yang diperlukan (DATABASE_URL, JWT_SECRET, PORT).

M9-AC4  git diff HEAD .env.example → tidak ada nilai sensitif (hanya placeholder).

M9-AC5  cd client && npm run build → build sukses tanpa error (opsional, nice-to-have).
```

---

## Ringkasan Milestone

| # | Milestone | Estimasi | Dependensi |
|---|---|---|---|
| M1 | Scaffold Monorepo & Koneksi DB | ±45 mnt | — |
| M2 | Seed DB & Katalog Publik (8 produk) | ±2,5 jam | M1 |
| M3 | Pencarian, Filter & Sorting | ±1 jam | M2 |
| M4 | Autentikasi JWT & Integrasi WA | ±1,5 jam | M2 |
| M5 | Dashboard Penjual — CRUD Produk & Profil | ±2,5 jam | M4 |
| M6 | Panel Admin — CRUD Penjual | ±1,5 jam | M4, M5 |
| M7 | Vitest — Unit Test Utils & Validasi | ±1 jam | M3, M5 |
| M8 | Security Review & Polish | ±1 jam | M6, M7 |
| M9 | README & Finalisasi | ±30 mnt | M8 |
| | **Total** | **±12–14 jam** | |

---

## Catatan Penting

- **localStorage** di proyek ini **hanya** untuk menyimpan JWT token (`madanglur_token`). Bukan sebagai data store. Semua data produk/toko/user ada di Supabase PostgreSQL. Ini sesuai SPEC.md v0.3.0 — migrasi dari localStorage sebagai primary store sudah dilakukan sejak v0.2.0→v0.3.0.
- **Deployment:** sesuai SPEC §10 Out-of-Scope — tidak ada deployment ke cloud dalam scope ini. Aplikasi berjalan lokal; hanya Supabase (database) yang cloud.
- **Vitest:** scope dibatasi unit test fungsi murni (utils + validator). Integration test endpoint Express cukup via acceptance criteria manual dengan Postman/Thunder Client — sesuai SPEC §11.

---

*Dokumen ini dibaca bersama SPEC.md dan UI-SPEC.md.
Urutan milestone wajib diikuti; jangan loncat milestone karena setiap milestone adalah fondasi berikutnya.*
