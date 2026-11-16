# STATUS.md — MadangLur

**Status implementasi demo v0.6.0**
Tanggal: 2026-11-16

> Dokumen ini adalah sumber kebenaran tentang **apa yang benar-benar berjalan** di repo ini.
> `SPEC.md`, `UI-SPEC.md`, dan `TASKS.md` tetap menyimpan **target** (Express + Supabase + JWT).
> Bagian target yang belum dikerjakan ditandai jelas di sini agar tidak dianggap selesai.

---

## 1. Ringkasan

| Aspek | Kondisi saat ini |
|---|---|
| Aplikasi | MadangLur — katalog & dashboard produk UMKM Banyuwangi |
| Versi | `0.6.0` (demo frontend + auth lokal 3 role) |
| Stack | Vite + JavaScript vanilla, tanpa dependency tambahan |
| Data | 8 produk demo + perubahan pengguna di `localStorage` |
| Akun | 3 peran (`penjual`, `pembeli`, `admin`); registrasi publik hanya penjual/pembeli; admin di-seed otomatis |
| Password | SHA-256 + salt 16 byte via Web Crypto (demo, bukan bcrypt) |
| Backend | Belum ada. Tidak ada Express, Supabase, JWT, atau API |
| Guard | Client-side: dashboard hanya penjual, admin hanya admin, katalog untuk semua |
| Route | `#/`, `#/masuk`, `#/daftar`, `#/dashboard`, `#/admin` |
| Build | `npm run build` sukses |
| Test | Belum ada Vitest; verifikasi lewat build, skrip Node, E2E browser headless, dan checklist manual |

> **Penting:** auth dan otorisasi peran di demo ini **bukan keamanan produksi**. Semua data
> akun berada di browser pengguna dan dapat dibaca/diubah lewat DevTools. Target tetap JWT +
> verifikasi/otorisasi di server (SPEC §4.1, TASKS M4).

---

## 2. Status fitur terhadap SPEC

Legenda: ✅ selesai di demo · 🟡 padanan demo / sebagian · ⏳ belum dikerjakan (target)

### 2.1 Autentikasi (A-01 … A-08)

| ID | Fitur target | Status | Catatan |
|---|---|---|---|
| A-01 | `POST /api/auth/login` | 🟡 | Padanan: `masuk()` di `src/auth.js` (lokal, tanpa API) |
| A-02 | JWT payload + expire | ⏳ | Demo menyimpan id akun di sesi lokal, bukan JWT |
| A-03 | Middleware `verifyJWT` | ⏳ | Demo memakai guard client di `main.js` |
| A-04 | Middleware `authorize(role)` | 🟡 | Padanan client-side: guard role di `main.js`; belum ada middleware server |
| A-05 | Cek status `aktif` saat login | ✅ | `masuk()` menolak akun nonaktif; `getSession()` mengabaikan sesi nonaktif |
| A-06 | Simpan JWT di `localStorage` | 🟡 | Key `madanglur:session:v1` berisi id akun, bukan token |
| A-07 | Redirect sesuai role | ✅ | Admin → `#/admin`, penjual → `#/dashboard`, pembeli → `#/` |
| A-08 | Logout → hapus sesi → katalog | ✅ | `keluar()` + tombol **Keluar** di navbar |

Registrasi publik (`#/daftar`) **tidak ada di target SPEC** (target: penjual dibuat admin).
Demo menambahkan daftar mandiri untuk penjual/pembeli agar aplikasi bisa dicoba tanpa membuat
akun lewat API admin — lihat D-10 dan deviasi §4.

### 2.2 Katalog publik (F-01 … F-07)

| ID | Fitur target | Status | Implementasi demo |
|---|---|---|---|
| F-01 | `GET /api/produk` + join toko | ✅ | Padanan: `loadProducts()` membaca `localStorage`, seed `DEMO_PRODUCTS` |
| F-02 | Query param server (`search`, `kategori`, `sort`, …) | ⏳ | Filter dilakukan di client (`filterProducts`) |
| F-03 | Render card grid | ✅ | `src/ui.js` → `renderCatalog()` |
| F-04 | Search/filter/sort di client tanpa re-fetch | ✅ | `src/store.js` → `filterProducts()` |
| F-05 | Tombol WhatsApp `wa.me` | ✅ | `buildWhatsAppUrl()`; nomor mengikuti `toko_nomor_wa` produk |
| F-06 | Indikator stok 3 level | ✅ | `stokStatus()`; Tersedia / Stok Menipis ≤5 / Habis |
| F-07 | Filter unggulan | ✅ | Pill "⭐ Unggulan" |

### 2.3 Akun, sesi, dan peran demo (di luar SPEC)

| ID | Fitur | Status | Implementasi demo |
|---|---|---|---|
| D-10 | Daftar akun penjual/pembeli | ✅ | `#/daftar`; pemilih peran; field toko hanya untuk penjual |
| D-11 | Masuk | ✅ | `#/masuk`; pesan gagal generik; akun nonaktif ditolak |
| D-12 | Sesi bertahan | ✅ | `madanglur:session:v1`; tetap masuk setelah reload |
| D-13 | Logout | ✅ | Hapus sesi; akun tetap tersimpan |
| D-14 | Guard role | ✅ | Dashboard penjual, panel admin, redirect + toast untuk peran salah |
| D-15 | Navbar dinamis | ✅ | Tamu: Masuk/Daftar; masuk: username + badge peran + menu sesuai role + Keluar |
| D-16 | Atribusi produk | ✅ | Produk baru/import memakai `penjual_id` + nama toko + nomor WA akun |
| D-17 | Hash password | ✅ | SHA-256 + salt 16 byte via Web Crypto (demo, bukan bcrypt) |
| D-18 | Akun rusak | ✅ | Ditolak dengan pesan jelas; data tidak ditimpa |
| D-19 | Admin bawaan | ✅ | `admin` / `Admin123!` di-seed oleh `pastikanAdmin()`; tidak bisa dinonaktifkan/dihapus |
| D-20 | Migrasi akun lama | ✅ | Akun tanpa `role`/`aktif` dianggap penjual aktif |
| D-21 | Profil toko penjual | ✅ | Form nama toko + nomor WA; validasi; update akun |
| D-22 | Sinkron nomor ke produk | ✅ | `sinkronProfilPenjual()` memperbarui `toko_nama`/`toko_nomor_wa` semua produk milik penjual |

### 2.4 Dashboard toko (P-01 … P-08)

| ID | Fitur target | Status | Implementasi demo |
|---|---|---|---|
| P-01 | `GET /api/toko/:id` + ringkasan | 🟡 | `ringkasanProduk()` menghitung statistik dari produk milik penjual |
| P-02 | `PUT /api/toko/:id` (profil toko) | 🟡 | Padanan: `updateProfilPenjual()` + sinkron ke produk; belum ada endpoint |
| P-03 | `GET /api/produk?toko_id=:id` | ✅ | `produkMilik()` memfilter `penjual_id`; seed publik tidak masuk dashboard |
| P-04 | `POST /api/produk` | ✅ | `addProduk(input, sesi)` → state + `localStorage` |
| P-05 | `PUT /api/produk/:id` | ✅ | `updateProduk(id, input, penjualId)` memeriksa kepemilikan |
| P-06 | `DELETE /api/produk/:id` | ✅ | `deleteProduk(id, penjualId)` + `confirm()` |
| P-07 | Form tambah/edit + validasi client | ✅ | Modal `src/dashboard.js`; pesan UI-SPEC §9 |
| P-08 | Tab Profil Toko | ✅ | Padanan: kartu **Profil Toko** di atas statistik (bukan tab/sidebar) |

### 2.5 Panel admin (ADM-01 … ADM-07)

| ID | Fitur target | Status | Catatan |
|---|---|---|---|
| ADM-01 | Daftar akun + ringkasan toko | ✅ | Tabel akun di `#/admin`; jumlah produk dihitung dari state |
| ADM-02 | Buat akun penjual baru | ⏳ | Belum ada form admin; gunakan registrasi publik atau seed |
| ADM-03 | Toggle status aktif | ✅ | `setAkunAktif()`; akun admin dilindungi |
| ADM-04 | Hapus user + cascade toko/produk | ✅ | `hapusAkun()` + `hapusProdukPenjual()`; admin dilindungi |
| ADM-05 | Tabel akun dengan aksi | ✅ | Username, peran, toko, WA, produk, status, aksi |
| ADM-06 | Form tambah penjual | ⏳ | Belum ada |
| ADM-07 | Ringkasan global | ✅ | Stat card: total penjual, pembeli, produk global, toko aktif |

### 2.6 Acceptance criteria UI

| AC | Status | Catatan |
|---|---|---|
| AC-UI01 | ✅ | 8 card tampil; setiap card punya nama toko |
| AC-UI02 | ✅ | Pencarian real-time pada nama **dan** deskripsi |
| AC-UI03 | ✅ | Stok 0 → tombol disabled + label "Habis" |
| AC-UI04 | 🟡 | Nomor kosong memakai `WHATSAPP_NUMBER` sebagai fallback, bukan disabled |
| AC-UI05 | ✅ | `wa.me` membuka tab baru dengan nomor produk |
| AC-UI06 | ✅ | Nomor produk penjual mengikuti profil dan disinkronkan saat nomor diubah |
| AC-UI07 | ✅ | Dashboard penjual hanya menampilkan produk miliknya; seed tetap publik |
| AC-UI08 | ✅ | Produk baru langsung muncul di tabel dan katalog tanpa reload |
| AC-UI09 | ✅ | Profil toko ada di dashboard penjual (kartu, bukan tab) |
| AC-UI10 | ✅ | Guard `#/admin` + redirect peran |
| AC-UI11 | ✅ | Tabel akun admin dengan aksi status/hapus |
| AC-UI12 | 🟡 | Tidak ada fetch API; kegagalan penyimpanan ditangani banner notice |

---

## 3. Fitur demo di luar SPEC MVP

| ID | Fitur | Lokasi | Perilaku |
|---|---|---|---|
| D-01 | Persistensi produk | `src/storage.js` | Key `madanglur:products:v1`; bertahan setelah reload |
| D-02 | Validasi data tersimpan | `validasiDaftarProduk()` | Payload wajib array; field dicek tipe/nilai, termasuk `penjual_id` |
| D-03 | Pemulihan data rusak | `loadProducts()` | JSON/struktur rusak → banner error + 8 produk contoh dipulihkan & disimpan ulang |
| D-04 | Import JSON atomik + scoped | `importProduk()` | Penjual hanya mengganti produk miliknya; produk lain/seed tetap |
| D-05 | Export JSON | `eksporProdukJSON()` | Unduh produk milik penjual (`madanglur-produk-<username>.json`) |
| D-06 | Reset produk demo | `resetDemo()` | Hanya di panel admin; konfirmasi → 8 produk contoh dipulihkan |
| D-07 | Notice storage diblokir | `src/main.js`, `src/ui.js` | Banner info; aplikasi tetap jalan dengan data di memori |
| D-08 | Toast | `showToast()` | success / error / info, ±2,5 detik |
| D-09 | Guard role | `src/main.js` | Tanpa sesi → `#/masuk`; peran salah → halaman sesuai peran + toast |
| D-10 | Daftar akun | `src/auth.js`, `src/auth-page.js` | Pemilih Penjual/Pembeli; admin ditolak; field toko kondisional |
| D-11 | Masuk | `src/auth.js`, `src/auth-page.js` | Verifikasi hash + status aktif; pesan gagal tidak membocorkan username |
| D-12 | Sesi | `src/auth.js` | Key `madanglur:session:v1`; auto-login saat reload |
| D-13 | Logout | `src/ui.js`, `src/main.js` | Tombol Keluar; sesi dihapus, akun tetap |
| D-14 | Navbar role-aware | `src/ui.js` | Badge Penjual/Pembeli/Admin; menu Dashboard/Panel Admin sesuai peran |
| D-15 | Atribusi produk | `src/store.js`, `src/storage.js` | `penjual_id` + nama toko + nomor WA akun menjadi default `addProduk`/import |
| D-16 | Hash password | `src/auth.js` | SHA-256(salt + password), salt acak 16 byte |
| D-17 | Akun rusak | `src/auth.js` | Login/daftar menolak, tidak menimpa data |
| D-18 | Auth page | `src/auth-page.js` | `#/masuk` & `#/daftar`, error per field + fokus otomatis |
| D-19 | Admin seed | `src/auth.js` | `pastikanAdmin()`; kredensial SPEC; akun dilindungi |
| D-20 | Migrasi akun | `src/auth.js` | `role`/`aktif` default untuk data lama |
| D-21 | Profil + sinkron nomor | `src/auth.js`, `src/store.js`, `src/dashboard.js` | Simpan profil → semua produk penjual memakai nomor baru |
| D-22 | Panel admin | `src/admin.js` | Stat global, tabel akun, toggle status, hapus akun/produk, reset produk |

---

## 4. Deviasi yang disengaja

1. **Frontend-only.** Tidak ada Express, Supabase, migrasi SQL, seed database, atau endpoint `/api/*`.
2. **Auth lokal, bukan JWT.** Daftar/masuk/logout/sesi/guard berjalan di client. Tidak ada token
   JWT, verifikasi server, bcrypt, atau otorisasi API. Password di-hash SHA-256 + salt agar tidak
   plaintext, tetapi tetap **bukan keamanan produksi**.
3. **Otorisasi peran client-side.** `main.js` memeriksa `role` dari sesi lokal. Ini dapat
   dimodifikasi lewat DevTools; target memakai middleware `verifyJWT`/`authorize` di server.
4. **localStorage untuk produk, akun, dan sesi.** Ini penyimpanan sementara demo. Target SPEC
   menyebut localStorage hanya untuk JWT; saat backend dibuat, ganti `storage.js` dengan
   `apiFetch('/produk')` dan `auth.js` dengan `POST /api/auth/login`.
5. **Key demo:** `madanglur:products:v1`, `madanglur:users:v1`, `madanglur:session:v1`.
6. **Admin bawaan di client.** Kredensial `admin` / `Admin123!` dan hash seed tertanam di
   `auth.js`, serta ditampilkan sebagai hint di halaman masuk. Ini khusus demo; target memakai
   seed database dengan bcrypt dan tidak menampilkan kredensial.
7. **Registrasi publik.** Target SPEC membuat penjual lewat admin; demo membuka registrasi
   penjual/pembeli. Admin tidak dapat didaftarkan dari form.
8. **Peran pembeli adalah akun.** SPEC mendefinisikan pembeli sebagai pengunjung tanpa akun;
   demo memberi opsi akun pembeli agar login/redirect peran dapat dicoba tanpa backend.
9. **Kepemilikan produk di client.** `penjual_id` disimpan di produk dan dicek di `store.js`.
   Target mengecek kepemilikan lewat JWT/toko_id di server (AC-F08).
10. **Produk seed bersifat publik.** 8 produk contoh tidak punya pemilik; dashboard penjual
    mulai kosong dan tidak dapat mengedit produk seed.
11. **Import/export scoped.** Alat demo di dashboard penjual hanya menyentuh produk sendiri.
    Target tidak memasukkan import/export sebagai fitur MVP.
12. **Reset demo dipindah ke admin.** Dashboard penjual tidak lagi punya tombol reset global.
13. **Profil toko berupa kartu.** UI-SPEC target memakai tab/sidebar; demo memakai kartu di atas
    statistik agar tetap sederhana tanpa sidebar.
14. **Belum ada form tambah penjual di admin** (ADM-02/ADM-06). Akun dibuat lewat registrasi
    publik; admin hanya mengelola akun yang ada.
15. **Nomor WA kosong → fallback.** `WHATSAPP_NUMBER` dipakai bila `toko_nomor_wa` kosong.
    Target AC-UI04 meminta tombol disabled; demo memilih fallback.
16. **Card uniform.** Fitur "featured card span 2 kolom" di UI-SPEC §3.3 belum diterapkan.
17. **Tanpa Vitest.** Fungsi murni diverifikasi dengan skrip Node sementara; belum ada file
    test di repo.
18. **Tanpa aset gambar.** Hanya emoji lokal; tidak ada gambar/font berhak cipta.

---

## 5. Struktur aktual

```
madanglur/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
├── README.md
├── STATUS.md
├── SPEC.md
├── UI-SPEC.md
├── TASKS.md
├── CATATAN.md
└── src/
    ├── main.js        ← shell, route, guard role, view katalog
    ├── router.js      ← hash routing #/, #/masuk, #/daftar, #/dashboard, #/admin
    ├── auth.js        ← akun 3 role, seed admin, hash, sesi, profil penjual
    ├── auth-page.js   ← halaman masuk & daftar (pemilih peran)
    ├── admin.js       ← panel admin, tabel akun, status, hapus, reset
    ├── products.js    ← kategori, seed 8 produk, stok, ID
    ├── store.js       ← state, filter/sort, CRUD, ownership, import/reset, sinkron profil
    ├── storage.js     ← localStorage produk, validasi payload, export
    ├── ui.js          ← navbar role-aware, katalog, hero, filter, toast, notice
    ├── dashboard.js   ← dashboard penjual, profil toko, tabel, modal, import/export
    └── style.css      ← token + seluruh style (auth, profil, admin)
```

Tidak ada folder `client/`, `server/`, `db/`, atau `public/`.

---

## 6. Verifikasi yang sudah dilakukan (v0.6.0)

| Pemeriksaan | Hasil |
|---|---|
| `npm run build` | ✅ Sukses (JS ±49,3 kB; CSS ±20,2 kB) |
| Auth/role unit (Node) | ✅ 50 pemeriksaan: seed admin, login admin, tolak role admin, daftar penjual/pembeli, migrasi akun lama, hash, sesi, profil, sinkron nomor, scoping produk, import scoped, status aktif, lindungi admin, hapus akun + produk |
| E2E browser (Chrome headless) | ✅ 36 pemeriksaan: seed admin, login admin, registrasi penjual/pembeli, field toko kondisional, produk sendiri, ganti nomor → `wa.me` katalog, guard role, tabel admin, toggle status, login nonaktif ditolak, hapus akun, tanpa exception/console error |
| Storage kosong | ✅ 8 produk contoh dimuat, admin di-seed otomatis |
| Tambah/edit/hapus produk | ✅ State + localStorage berubah; katalog ikut berubah |
| JSON rusak | ✅ 8 produk contoh dipulihkan + banner error |
| Import invalid | ✅ `{ ok: false }`; state dan localStorage lama tidak berubah |
| Import scoped | ✅ Produk penjual lain dan seed tetap utuh; hasil impor memakai nomor profil |
| Export | ✅ JSON produk penjual, dapat diimpor balik |
| Reset produk | ✅ Hanya dari panel admin; kembali ke 8 produk |
| Sort/filter/search | ✅ Tidak berubah dari v0.5.0 |
| Route & trailing slash | ✅ `#/`, `#/masuk`, `#/daftar`, `#/dashboard`, `#/admin` |
| WhatsApp | ✅ `href` wa.me, `target="_blank"`, `rel="noopener"`, pesan otomatis |
| Hash password | ✅ Password tidak tersimpan plaintext; hash + salt tersimpan |

Checklist manual yang masih disarankan sebelum rilis:

- [x] Buka `#/` dan cek katalog tetap 8 card.
- [x] Cari produk, klik semua pill kategori, coba semua opsi sort.
- [x] Klik tombol WhatsApp produk stok > 0. *(tautan terverifikasi; membuka aplikasi WhatsApp tetap perlu dicek manusia)*
- [x] Daftar penjual → dashboard → tambah/edit/hapus produk → kembali ke `#/`.
- [x] Ubah nomor di Profil Toko → cek `href` WhatsApp produk di katalog.
- [x] Daftar pembeli → guard dashboard/admin.
- [x] Admin → toggle status → login akun nonaktif ditolak → aktifkan kembali.
- [x] Admin → hapus akun pembeli.
- [x] Keluar → masuk lagi → reload; sesi dan produk bertahan.
- [x] Export → import kembali; coba juga file rusak.
- [x] Reset produk dari panel admin.
- [x] Tab melalui kontrol utama; pastikan fokus terlihat.

---

## 7. Checklist rilis v0.6.0

- [x] Versi `package.json` + `package-lock.json` = `0.6.0`
- [x] README, STATUS, SPEC, UI-SPEC, TASKS, CATATAN konsisten dengan v0.6.0
- [x] Dokumen menjelaskan demo vs target tanpa saling bertentangan
- [x] Tiga peran + registrasi penjual/pembeli + admin seed berjalan tanpa backend
- [x] Nomor HP penjual tersinkron ke produk dan tautan WhatsApp katalog
- [x] Dashboard penjual dan panel admin dijaga sesuai peran
- [x] Admin tidak dapat didaftarkan dari form publik
- [x] Auth/otorisasi demo ditandai bukan keamanan produksi di README + STATUS
- [x] `npm run build` sukses
- [x] Unit Node + E2E browser lulus
- [ ] Commit akhir (tanpa `node_modules/`, `dist/`, `.env`)

---

## 8. Langkah berikutnya (opsional, target SPEC)

1. **M1–M2:** buat `server/`, `db/`, migrasi, seed, dan `GET /api/produk`.
2. **Ganti storage demo:** `loadProducts()` → `apiFetch('/produk')`; hapus pemanggilan
   `simpanProdukTersimpan`; `storage.js` boleh dihapus.
3. **M4:** ganti `auth.js` dengan login JWT (`POST /api/auth/login`), `madanglur_token`,
   middleware `verifyJWT`/`authorize`, cek status aktif, redirect per role.
4. **M5:** pindahkan profil toko + kepemilikan produk ke server (`toko_id`/JWT), dashboard
   per toko.
5. **M6:** lengkapi panel admin dengan form buat penjual (ADM-02/ADM-06) dan endpoint server.
6. **M7:** Vitest untuk `filterProducts`, `validateProduk`, `buildWhatsAppUrl`, validator import,
   `validateDaftar`/`validateMasuk`, serta helper ownership/sinkron profil.
7. **M8–M9:** security review, README final, commit.

Selama target belum dikerjakan, jangan menandai item M1–M9 di `TASKS.md` sebagai selesai
hanya karena padanan demo-nya ada.
