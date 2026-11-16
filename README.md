# MadangLur

**Katalog & dashboard produk UMKM makanan/minuman khas Banyuwangi.**

MadangLur adalah aplikasi demo frontend untuk menampilkan produk UMKM, mencari dan memfilter
produk, menghubungi penjual lewat WhatsApp, mengelola produk lewat dashboard penjual, serta
mengelola akun lewat panel admin. Produk, akun, dan sesi disimpan di `localStorage`, jadi
perubahan bertahan saat halaman dimuat ulang.

> **Status: demo v0.6.0 (frontend-only + auth lokal 3 role).**
> Belum ada backend, JWT, bcrypt server, atau database. Daftar/masuk/logout berjalan lokal di
> browser dan **bukan keamanan produksi**. Rencana target Express + Supabase + JWT ada di
> `SPEC.md`; status aktual ada di `STATUS.md`.

---

## Fitur

- Katalog 8 produk demo dengan nama toko, kategori, harga, stok, dan badge unggulan.
- Pencarian real-time pada **nama dan deskripsi** produk.
- Filter kategori: Semua, 5 kategori, dan ⭐ Unggulan.
- Sorting: default, Nama A–Z, Harga termurah, Harga termahal, Stok terbanyak.
- Tombol **Pesan via WhatsApp** (`wa.me`) dengan pesan otomatis.
- Indikator stok 3 level: Tersedia, Stok Menipis (≤ 5), Habis.
- **Tiga peran akun**:
  - **Penjual** — dashboard produk + profil toko; akunnya dibuat oleh admin.
  - **Pembeli** — daftar mandiri, katalog publik, dan halaman **Akun Pembeli**
    (`#/pembeli`) berisi daftar toko beserta nomor WhatsApp yang bisa dihubungi.
  - **Admin** — panel pengelolaan akun + pembuatan akun penjual.
- **Daftar** di `#/daftar` **hanya untuk pembeli**. Untuk menjadi penjual, minta admin
  membuatkan akun lewat **Panel Admin → Buat Akun Penjual**. Akun admin tidak dapat dibuat
  dari form publik.
- **Admin bawaan** `admin` / `Admin123!` dibuat otomatis saat aplikasi pertama dijalankan.
- **Masuk** di `#/masuk` dengan memilih peran **Penjual**, **Pembeli**, atau **Admin**.
  Akun hanya bisa masuk lewat peran yang terdaftar (pilih peran lain → pesan koreksi).
  Setelah berhasil diarahkan sesuai peran: admin → `#/admin`, penjual → `#/dashboard`,
  pembeli → `#/` (navbar menampilkan **Akun Saya**).
- **Guard role**: dashboard hanya untuk penjual, panel admin hanya untuk admin; akses salah
  peran dialihkan dengan toast.
- **Profil Toko** di dashboard penjual:
  - ubah nama toko dan nomor WhatsApp;
  - perubahan nomor otomatis disinkronkan ke semua produk milik penjual, sehingga tautan
    WhatsApp di katalog langsung memakai nomor terbaru.
- **Kepemilikan produk** lewat `penjual_id`; dashboard hanya menampilkan produk milik penjual
  yang sedang masuk. Produk seed tetap publik dan tidak dapat diedit penjual.
- Dashboard penjual:
  - statistik total produk, total stok, kategori aktif, produk unggulan;
  - tabel produk sendiri;
  - tambah/edit produk lewat modal;
  - hapus produk dengan konfirmasi;
  - validasi nama, kategori, harga, stok, dan deskripsi;
  - export/import JSON **scoped** ke produk sendiri.
- Panel admin `#/admin`:
  - form **Buat Akun Penjual** (username, nama toko, nomor WA, password);
  - statistik penjual, pembeli, produk global, toko aktif;
  - tabel akun dengan peran, nama toko, nomor WA, jumlah produk, status;
  - aktif/nonaktifkan akun penjual/pembeli;
  - hapus akun non-admin beserta produk penjualnya;
  - reset produk demo.
- Persistensi `localStorage` untuk produk, akun, dan sesi.
- Pemulihan otomatis + banner pemberitahuan bila data produk tersimpan rusak.
- Responsif hingga layar kecil; kontrol utama dapat dijangkau keyboard.
- **Tes Vitest** (`npm test`): login sesuai peran, registrasi pembeli, pembuatan penjual
  oleh admin, sinkron nomor WA ke produk & tautan `wa.me`, dan pengelompokan toko pembeli.

## Yang belum ada

- Backend Express, Supabase/PostgreSQL, migrasi, dan seed database.
- JWT, verifikasi token di server, bcrypt, dan otorisasi API nyata.
- Manajemen password (ganti password, lupa password).
- Sidebar dashboard, deskripsi toko, dan upload/gambar produk nyata (demo memakai emoji).

---

## Prasyarat

- Node.js **20.19+** atau **22.12+** (kebutuhan Vite 8; Node 26 aman)
- npm (bawaan Node.js)
- Browser modern

> Jika Anda terkunci di Node 18, turunkan Vite ke versi yang mendukungnya atau gunakan
> Node 20.19+/22.12+.

## Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Build produksi dan pratinjau:

```bash
npm run build
npm run preview
```

Menjalankan tes:

```bash
npm test
```

Dependency runtime hanya Vite; Vitest dipakai untuk pengembangan.

---

## Route & guard

| Hash | Halaman | Guard |
|---|---|---|
| `#/` atau kosong | Katalog publik | Tidak ada |
| `#/masuk` | Form masuk | Sudah masuk → halaman sesuai peran |
| `#/daftar` | Form daftar penjual/pembeli | Sudah masuk → halaman sesuai peran |
| `#/dashboard` | Dashboard toko | Tanpa sesi → `#/masuk`; bukan penjual → halaman sesuai peran + toast |
| `#/pembeli` | Akun & daftar kontak toko | Tanpa sesi → `#/masuk`; bukan pembeli → halaman sesuai peran + toast |
| `#/admin` | Panel admin | Tanpa sesi → `#/masuk`; bukan admin → halaman sesuai peran + toast |

Hash tidak dikenal akan diarahkan ke `#/`. Trailing slash seperti `#/dashboard/` juga diterima.

---

## Akun, peran, dan sesi

### Akun admin bawaan

Saat aplikasi mulai, `pastikanAdmin()` memastikan akun berikut ada:

| Peran | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin123!` |

Akun ini dilindungi: admin tidak dapat menonaktifkan atau menghapus dirinya dari panel.

### Registrasi pembeli

1. Buka `#/daftar`.
2. Isi username (3–20 karakter: huruf, angka, `_`), password (min. 6 karakter), dan konfirmasi.
   Tidak ada pilihan peran atau field toko.
3. Setelah berhasil, akun langsung masuk sebagai **pembeli** dan diarahkan ke `#/`.

### Membuat akun penjual (oleh admin)

1. Masuk sebagai admin, lalu buka `#/admin`.
2. Isi form **Buat Akun Penjual**: username, nama toko (2–40 karakter), nomor WA
   (opsional, format `62…`), password, dan ulangi password.
3. Klik **Buat Akun Penjual**; akun muncul di tabel dengan peran Penjual.
4. Berikan username + password kepada penjual. Ia masuk lewat `#/masuk` dengan memilih peran
   **Penjual**, lalu bisa mengubah nama toko/nomor WA di Profil Toko.

### Sesi

1. `#/masuk` dipakai untuk login berikutnya. Username tidak membedakan huruf besar/kecil.
2. Tombol **Keluar** ada di navbar; akun tetap tersimpan dan bisa masuk lagi.
3. Sesi bertahan setelah reload selama `localStorage` tersedia.
4. Akun yang dinonaktifkan admin tidak bisa login dan sesinya dianggap tidak valid.

| Key `localStorage` | Isi |
|---|---|
| `madanglur:products:v1` | Array produk katalog |
| `madanglur:users:v1` | Array akun (`role`, `aktif`, `nama_toko`, `nomor_wa`, hash password, …) |
| `madanglur:session:v1` | `id` akun yang sedang masuk |

Contoh akun tersimpan:

```json
{
  "id": "user-abc12345",
  "username": "toko_osing",
  "role": "penjual",
  "aktif": true,
  "nama_toko": "Toko Osing Jaya",
  "nomor_wa": "6281234500009",
  "sandi_salt": "…",
  "sandi_hash": "…",
  "dibuat": "2026-11-16T00:00:00.000Z"
}
```

Akun lama yang belum punya `role`/`aktif` dimigrasikan otomatis: `role` menjadi `penjual`
dan `aktif` menjadi `true`.

> **Keamanan:** password di-hash SHA-256 + salt 16 byte memakai Web Crypto, tetapi hash,
> akun, dan sesi tetap berada di browser dan dapat dibaca/dimodifikasi lewat DevTools.
> Otorisasi peran di demo murni client-side. Ini **bukan** pengganti bcrypt + JWT +
> verifikasi server pada target `SPEC.md`.

---

## Alur data

```
DEMO_PRODUCTS (8 produk, publik/tanpa penjual_id)
        │
        ▼
loadProducts() ──► localStorage "madanglur:products:v1"
        │                     ▲
        ▼                     │
     state store ──► CRUD / import / reset / sinkron profil
        │
        ├──► katalog (#/, semua peran)
        ├──► dashboard (#/dashboard, penjual; produk milik sendiri)
        └──► admin (#/admin, admin; akun + produk global)

#/daftar ──► daftarAkun() ──► "madanglur:users:v1" + "madanglur:session:v1"
#/masuk  ──► masuk()      ──► verifikasi hash + status aktif ──► sesi
Keluar   ──► keluar()     ──► hapus "madanglur:session:v1"
Profil   ──► updateProfilPenjual() + sinkronProfilPenjual()
```

- Key penyimpanan: **`madanglur:products:v1`**, **`madanglur:users:v1`**,
  **`madanglur:session:v1`**.
- Saat pertama dibuka, 8 produk contoh disimpan otomatis dan akun admin dipastikan ada.
- Tambah/edit/hapus/import menulis ulang key produk. Perubahan profil penjual menulis ulang
  akun lalu menyinkronkan `toko_nama`/`toko_nomor_wa` pada semua produk miliknya.
- Bila data produk rusak (JSON tidak valid, struktur/field salah), seluruh payload ditolak,
  8 produk contoh dipulihkan, dan banner error ditampilkan.
- Bila `localStorage` diblokir/penuh, aplikasi tetap berjalan di memori dan menampilkan banner info.

### Bentuk data produk

```json
{
  "id": "es-kopi-aren-gendis",
  "nama": "Es Kopi Aren Gendis",
  "kategori": "Minuman",
  "harga": 18000,
  "stok": 35,
  "deskripsi": "Kopi robusta lokal dengan gula aren cair dan es batu.",
  "unggulan": true,
  "toko_nama": "Kedai Gendis",
  "toko_nomor_wa": "6281234500003",
  "penjual_id": ""
}
```

Aturan validasi data tersimpan/import:

| Field | Aturan |
|---|---|
| `nama` | string, minimal 2 karakter |
| `kategori` | salah satu: Jajanan Pasar, Minuman, Sambal & Bumbu, Oleh-oleh Kering, Makanan Berat |
| `harga` | number, finite, ≥ 0 |
| `stok` | integer, ≥ 0 |
| `deskripsi` | opsional, string, maks. 300 karakter |
| `unggulan` | opsional, boolean |
| `id` | opsional, string tidak kosong; harus unik dalam satu payload |
| `toko_nama` | opsional, string; default nama toko akun yang sedang masuk |
| `toko_nomor_wa` | opsional, string kosong atau format `^62[0-9]{8,}$` |
| `penjual_id` | opsional, string; produk seed bernilai kosong (publik) |

Payload wajib berupa **array**. Satu item tidak valid → seluruh import ditolak.
Produk baru lewat dashboard selalu memakai `penjual_id`, `toko_nama`, dan `toko_nomor_wa`
dari akun penjual yang sedang masuk.

---

## Export, import, dan reset

Buka `#/dashboard` sebagai penjual, lalu gunakan toolbar:

1. **Export JSON** — mengunduh `madanglur-produk-<username>.json` berisi **produk milik
   penjual tersebut**.
2. **Import JSON** — pilih file `.json`. File divalidasi penuh sebelum produk lama penjual
   diganti. Produk penjual lain dan produk seed **tetap utuh**; semua produk hasil impor
   diatribusikan ke penjual yang sedang masuk dan memakai nama/nomor profilnya.
3. **Reset produk demo** — hanya ada di `#/admin`, dengan konfirmasi; memulihkan 8 produk
   contoh dan menghapus produk tambahan semua akun.

Contoh file import minimal:

```json
[
  {
    "nama": "Es Teh Melati",
    "kategori": "Minuman",
    "harga": 8000,
    "stok": 12
  }
]
```

---

## Struktur proyek

```
.
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── STATUS.md
├── SPEC.md
├── UI-SPEC.md
├── TASKS.md
├── CATATAN.md
└── src/
    ├── main.js        shell, route, guard role, view katalog
    ├── router.js      hash routing #/, #/masuk, #/daftar, #/pembeli, #/dashboard, #/admin
    ├── auth.js        akun 3 role, seed admin, registrasi pembeli, buat penjual, sesi
    ├── auth-page.js   halaman masuk (pemilih peran) & daftar pembeli
    ├── admin.js       panel admin: buat penjual, akun, status, hapus, reset produk
    ├── products.js    kategori, seed produk, stok, ID
    ├── store.js       state, filter/sort, CRUD, ownership, import/reset, sinkron profil
    ├── storage.js     localStorage produk, validasi payload (termasuk penjual_id), export
    ├── ui.js          navbar role-aware, render katalog, hero, filter, toast, notice
    ├── dashboard.js   dashboard penjual, profil toko, tabel, modal, import/export
    ├── pembeli.js     halaman akun pembeli: info akun, daftar toko & nomor WA
    ├── auth.test.js   tes login per peran, registrasi pembeli, buat penjual
    ├── store.test.js  tes sinkron nomor WA ke produk & tautan wa.me
    ├── pembeli.test.js tes pengelompokan toko halaman pembeli
    └── style.css      token & seluruh style (termasuk auth, profil, admin)
```

---

## Akun demo

- **Admin bawaan:** `admin` / `Admin123!` (dibuat otomatis, dapat dilihat juga di hint
  halaman masuk).
- **Pembeli:** daftar sendiri lewat `#/daftar`; pendaftaran langsung membuat sesi.
- **Penjual:** dibuat admin lewat **Panel Admin → Buat Akun Penjual** (bukan dari form publik).
- Akun tersimpan di browser ini saja (key `madanglur:users:v1`), jadi tidak ada di
  browser/perangkat lain.

Untuk memulai ulang data akun, hapus key `madanglur:users:v1` dan `madanglur:session:v1`
di DevTools → Application → Local Storage. Akun admin akan dibuat lagi saat halaman dimuat.

---

## Pengujian manual

1. Buka `#/dashboard` tanpa masuk; pastikan dialihkan ke `#/masuk`.
2. Masuk dengan peran **Admin** (`admin` / `Admin123!`); pastikan diarahkan ke `#/admin`.
   Coba juga masuk dengan peran **Penjual** memakai akun admin → ditolak dengan pesan peran.
3. Buka `#/daftar`; pastikan hanya ada form pembeli (tanpa pilihan peran/field toko).
4. Daftar pembeli; pastikan diarahkan ke `#/` dengan badge Pembeli.
5. Sebagai pembeli, buka `#/pembeli` (daftar toko + nomor WA tampil), lalu `#/dashboard` dan
   `#/admin`; pastikan dua halaman terakhir dialihkan dengan toast.
6. Keluar; masuk admin → isi **Buat Akun Penjual** (username, nama toko, nomor WA, password);
   pastikan akun baru muncul di tabel dengan peran Penjual.
7. Coba buat penjual dengan username yang sudah dipakai → ditolak dengan pesan jelas.
8. Keluar; masuk dengan akun penjual tersebut lewat peran **Penjual** → diarahkan ke
   `#/dashboard`.
9. Tambah produk, lalu buka `#/`; pastikan produk tampil dan tombol WhatsApp memakai nomor
   profil penjual.
10. Ubah nomor WhatsApp di **Profil Toko**; kembali ke `#/` dan `#/pembeli`; pastikan nomor
    serta `href` `wa.me` memakai nomor baru.
11. Masuk admin; nonaktifkan penjual; coba login penjual tersebut; pastikan ditolak.
12. Aktifkan kembali, lalu hapus akun pembeli; pastikan hilang dari tabel dan `localStorage`.
13. Pastikan akun admin menampilkan "Dilindungi" dan tidak bisa dihapus/dinonaktifkan.
14. Buka `#/`; cari "kopi", filter kategori, dan coba semua sort.
15. Export JSON penjual, ubah file, lalu import kembali; pastikan produk penjual lain dan
    produk seed tidak ikut berubah.
16. Coba import file rusak/field salah; pastikan data lama tidak hilang.
17. Reset produk demo dari panel admin; pastikan kembali ke 8 produk.
18. Reload; pastikan sesi, akun, dan produk bertahan.
19. Keluar, lalu coba masuk dengan peran yang salah (akun pembeli memilih Penjual) → ditolak
    dengan pesan yang menyebut peran akun yang benar.
20. Jalankan `npm test` dan `npm run build`; keduanya harus sukses.

---

## Troubleshooting

| Gejala | Penyebab / solusi |
|---|---|
| Perubahan hilang setelah reload | `localStorage` diblokir/penuh, atau mode privat. Cek banner notice dan pengaturan browser. |
| Muncul banner "Data produk tersimpan tidak valid" | Data di `localStorage` rusak. Aplikasi sudah memulihkan 8 produk contoh; banner bisa ditutup. |
| Dashboard dialihkan ke `#/masuk` | Belum ada sesi (atau sesi sudah dihapus). Masuk lewat `#/masuk` atau daftar di `#/daftar`. |
| Dashboard/admin menolak akses | Peran akun tidak sesuai. Admin → `#/admin`, penjual → `#/dashboard`, pembeli → `#/`. |
| Tidak bisa login | Akun mungkin dinonaktifkan admin. Minta admin mengaktifkan kembali. |
| Ingin menjadi penjual | Form daftar publik hanya untuk pembeli. Masuk sebagai admin, buka **Panel Admin → Buat Akun Penjual**, lalu berikan username/password kepada penjual. |
| Lupa password | Demo belum punya reset password. Hapus key `madanglur:users:v1` + `madanglur:session:v1`, lalu daftar akun baru; admin akan di-seed ulang. |
| "Username sudah digunakan" | Username unik per browser. Pilih username lain atau masuk dengan akun yang ada. |
| "Data akun tersimpan tidak valid" | Isi `madanglur:users:v1` rusak. Hapus key tersebut (dan sesi) untuk memulai ulang. |
| Nomor WA di katalog tidak berubah | Simpan lewat **Profil Toko** di dashboard penjual, bukan mengedit file produk. Produk seed publik memakai nomor seed masing-masing. |
| Ingin mulai dari awal | Admin → **Reset Produk Demo** untuk produk, atau hapus key `madanglur:products:v1`. Untuk akun, hapus `madanglur:users:v1` + `madanglur:session:v1`. |
| Import gagal | Pastikan file JSON berupa array dan `harga`/`stok` berupa number, bukan string. |
| Halaman kosong setelah build | Jalankan `npm run preview`, bukan membuka `dist/index.html` langsung. |

---

## Dokumen

- [`SPEC.md`](SPEC.md) — target produk & arsitektur (Express + Supabase + JWT).
- [`UI-SPEC.md`](UI-SPEC.md) — target UI/UX dan komponen.
- [`TASKS.md`](TASKS.md) — rencana milestone M1–M9.
- [`STATUS.md`](STATUS.md) — status implementasi demo, deviasi, dan checklist rilis.
- [`CATATAN.md`](CATATAN.md) — catatan workshop.

---

## Catatan

Ini aplikasi pembelajaran/demonstrasi, bukan sistem produksi. Auth demo menyimpan akun dan
sesi di browser serta memakai SHA-256 + salt, **bukan** bcrypt/JWT dengan verifikasi server.
Otorisasi peran hanya guard client-side. Jangan menyimpan data sensitif dan jangan menganggap
validasi client sebagai pengaman.
