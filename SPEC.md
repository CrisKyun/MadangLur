# SPEC.md — MadangLur
**Katalog & Dashboard Produk UMKM Makanan/Minuman Banyuwangi**
Versi: 0.6.0 | Status: Draft — target + demo | Tanggal: 2026-11-16

```
Changelog:
  v0.1.0  Rilis awal — localStorage, 1 role, Vite vanilla
  v0.2.0  Tambah 3 role (Admin/Penjual/Pembeli), model Toko & User, nomor WA per toko
  v0.3.0  Migrasi ke PostgreSQL (Supabase) + Express REST API; hapus localStorage sebagai
          primary store; auth berbasis JWT; estimasi naik ke 2 hari
  v0.4.0  Implementasi demo frontend-only (Vite + localStorage): katalog, pencarian/filter/
          sorting, dashboard CRUD, import/export/reset. Backend, auth, dan admin tetap target.
  v0.5.0  Demo auth lokal: daftar/masuk/logout, sesi di localStorage, guard dashboard,
          navbar dinamis, atribusi produk ke akun. JWT + backend tetap target.
  v0.6.0  Demo 3 role: penjual/pembeli/admin, admin seed, registrasi peran, dashboard penjual
          scoped, profil toko + sinkron nomor WA ke produk, panel admin, guard role.
          JWT + backend + otorisasi server tetap target.
```

---

## 0. Status Implementasi (v0.6.0)

> **Baca ini dulu.** Dokumen ini adalah **target** arsitektur (Express + Supabase + JWT).
> Repo saat ini menjalankan **demo frontend-only** dengan **auth lokal 3 role** (bukan JWT).
> Auth demo bukan keamanan produksi: akun dan sesi berada di browser pengguna.

| Sudah berjalan di demo | Belum dikerjakan (target) |
|---|---|
| Katalog 8 produk + nama toko | Express API (`server/`) |
| Pencarian nama + deskripsi | PostgreSQL/Supabase + migrasi + seed |
| Filter kategori + unggulan | JWT + verifikasi token di server |
| Sorting (nama, harga, stok) | Middleware `verifyJWT` / `authorize` |
| Tombol WhatsApp + nomor per toko | Otorisasi/kepemilikan data di server |
| Daftar/masuk/logout demo + sesi lokal | Endpoint `PUT /api/toko/:id` |
| 3 peran + guard role client-side | Form admin buat penjual (ADM-02/06) |
| Admin seed `admin` / `Admin123!` | Dashboard per `toko_id` dari JWT |
| Dashboard penjual scoped + profil toko | Vitest, deployment, rate limiting |
| Sinkron nomor WA penjual ke produk | Logging, security review |
| Panel admin: daftar, status, hapus, reset | Manajemen password (ganti/lupa) |
| Persistensi `localStorage` (produk, akun, sesi) | — |

**Sumber kebenaran status:** [`STATUS.md`](STATUS.md). Ringkasan cara menjalankan ada di
[`README.md`](README.md). Pada dokumen ini, semua bagian yang menyebut `/api/*`, JWT, Supabase,
bcrypt, atau `client/src/*` adalah **rencana target**, bukan kondisi repo saat ini.

---

## 1. Tujuan

Membangun aplikasi web latihan 2 hari bernama **MadangLur** ("madang" = makan dalam bahasa
Jawa Banyuwangian, "lur" = saudara/teman) yang menampilkan katalog produk UMKM makanan dan
minuman khas Banyuwangi. Aplikasi ini berfungsi sebagai:

1. **Etalase digital** bagi pembeli untuk menemukan dan memesan produk via WhatsApp.
2. **Dashboard toko** bagi penjual untuk mengelola produk dan profil tokonya sendiri.
3. **Panel admin** bagi administrator untuk mengelola akun penjual.

**Tujuan latihan:**
- Praktik membangun REST API dengan Node.js + Express.
- Praktik desain skema PostgreSQL dan query SQL murni (tanpa ORM).
- Praktik autentikasi berbasis JWT (JSON Web Token).
- Praktik konsumsi API dari frontend JavaScript vanilla.
- Praktik multi-role authorization di sisi server.

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│          Vite + JavaScript Vanilla  (:5173)                 │
│   Katalog Publik │ Dashboard Penjual │ Panel Admin          │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP / JSON (fetch API)
                           │  Authorization: Bearer <JWT>
┌──────────────────────────▼──────────────────────────────────┐
│                      EXPRESS API                            │
│                    Node.js  (:3000)                         │
│  /api/auth  │  /api/produk  │  /api/toko  │  /api/users    │
│                   Middleware: verifyJWT, authorize          │
└──────────────────────────┬──────────────────────────────────┘
                           │  node-postgres (pg)
                           │  connection pool
┌──────────────────────────▼──────────────────────────────────┐
│                   SUPABASE POSTGRESQL                       │
│              (cloud, free tier, region: ap-southeast-1)     │
│    tabel: users │ toko │ produk                             │
└─────────────────────────────────────────────────────────────┘
```

**Monorepo struktur target (belum dibuat):**
```
madanglur/
  server/     ← Express API
  client/     ← Vite frontend
  db/         ← SQL migration & seed files
  .env.example
  README.md
```

> **Demo v0.6.0:** hanya bagian frontend yang ada, dan letaknya di root repo
> (`index.html`, `src/`), bukan di `client/`. Tidak ada `server/`, `db/`, atau `.env`.
> Login demo berjalan di client (`src/auth.js`) tanpa endpoint `/api/auth`; akun, peran, dan
> sesi disimpan di `localStorage`. Guard role juga client-side. Diagram di atas menggambarkan
> target saat backend dikerjakan.

---

## 3. Pengguna & Peran

| Peran | Deskripsi | Endpoint yang Dapat Diakses |
|---|---|---|
| **Pembeli** | Pengunjung tanpa akun; hanya membaca katalog | `GET /api/produk`, `GET /api/toko` |
| **Penjual** | Pemilik toko; kelola produk & profil toko sendiri | Semua endpoint `/api/produk` & `/api/toko` miliknya |
| **Admin** | Super-user; kelola akun penjual | Semua endpoint `/api/users` |

### Aturan Akses

```
Pembeli  → tidak perlu token; endpoint publik bebas diakses
Penjual  → wajib JWT; hanya dapat mengubah data dengan toko_id miliknya
Admin    → wajib JWT; dapat CRUD semua user; tidak dapat ubah produk toko lain
```

### Seed Akun Default

| Role | Username | Password |
|---|---|---|
| admin | `admin` | `Admin123!` |
| penjual | `toko_osing` | `Penjual123!` |
| penjual | `warung_blambangan` | `Penjual123!` |

> Password di-hash dengan **bcrypt** (cost factor 10) sebelum disimpan ke database.
> Seed script meng-hash otomatis — password plaintext hanya ada di `db/seed.sql`.
>
> **Demo v0.6.0** hanya memakai akun admin seed (`admin` / `Admin123!`), yang dibuat otomatis
> oleh `pastikanAdmin()` dengan hash SHA-256 + salt tetap. Akun penjual/pembeli dibuat lewat
> registrasi mandiri di `#/daftar` (username, peran, password; nama toko + nomor WA untuk
> penjual) dan disimpan di `localStorage` dengan hash SHA-256 + salt acak. Role tersimpan pada
> akun, produk penjual memakai `penjual_id`, dan status `aktif` dicek saat login. Ini deviasi
> demo, bukan pengganti model `users`/`toko` target.

---

## 4. Daftar Fitur MVP

> Tabel di bawah adalah **target MVP**. Status implementasi demo per ID ada di
> `STATUS.md` §2. Jangan membaca tanda "Must" sebagai "sudah selesai".

### 4.1 Autentikasi (Auth)

| ID | Fitur | Prioritas |
|---|---|---|
| A-01 | `POST /api/auth/login` — terima username+password, kembalikan JWT | Must |
| A-02 | JWT payload: `{ userId, role, tokoId }`, expire 8 jam | Must |
| A-03 | Middleware `verifyJWT` — validasi token di header `Authorization: Bearer` | Must |
| A-04 | Middleware `authorize(role)` — tolak jika role tidak sesuai (403) | Must |
| A-05 | Cek status `aktif` user saat login; tolak jika false (401) | Must |
| A-06 | Frontend: simpan JWT ke `localStorage` key `madanglur_token` | Must |
| A-07 | Frontend: redirect otomatis sesuai role setelah login berhasil | Must |
| A-08 | Frontend: tombol logout → hapus token → redirect ke katalog | Must |

### 4.2 Katalog Publik (Pembeli)

| ID | Fitur | Prioritas |
|---|---|---|
| F-01 | `GET /api/produk` — kembalikan semua produk (join nama toko & nomor WA) | Must |
| F-02 | Server mendukung query params: `?search=`, `?kategori=`, `?toko_id=`, `?unggulan=true`, `?sort=` — diproses di SQL (untuk penggunaan API langsung / Postman) | Must |
| F-03 | Frontend: render card grid dari response API | Must |
| F-04 | Frontend: pencarian, filter, sorting dilakukan di sisi klien dari data yang sudah di-fetch sekali (`GET /api/produk` tanpa params) — tidak re-fetch saat filter berubah | Must |
| F-05 | Frontend: tombol "Pesan via WhatsApp" → `wa.me/{toko.nomor_wa}?text=...` | Must |
| F-06 | Frontend: indikator stok (Tersedia / Stok Menipis ≤5 / Habis) | Should |
| F-07 | Frontend: filter toggle produk unggulan | Should |

### 4.3 Dashboard Toko (Penjual)

| ID | Fitur | Prioritas |
|---|---|---|
| P-01 | `GET /api/toko/:id` — detail toko beserta ringkasan (total produk, stok, kategori) | Must |
| P-02 | `PUT /api/toko/:id` — update nama, deskripsi, nomor_wa toko | Must |
| P-03 | `GET /api/produk?toko_id=:id` — daftar produk toko sendiri | Must |
| P-04 | `POST /api/produk` — tambah produk baru; `toko_id` diambil dari JWT | Must |
| P-05 | `PUT /api/produk/:id` — edit produk; validasi kepemilikan via JWT | Must |
| P-06 | `DELETE /api/produk/:id` — hapus produk; validasi kepemilikan via JWT | Must |
| P-07 | Frontend: form tambah/edit produk dengan validasi client-side | Must |
| P-08 | Frontend: tab "Profil Toko" untuk edit nama, deskripsi, nomor WA | Must |

### 4.4 Panel Admin

| ID | Fitur | Prioritas |
|---|---|---|
| ADM-01 | `GET /api/users` — daftar semua user penjual + ringkasan toko | Must |
| ADM-02 | `POST /api/users` — buat akun penjual baru + toko kosong | Must |
| ADM-03 | `PATCH /api/users/:id/status` — toggle aktif/nonaktif | Must |
| ADM-04 | `DELETE /api/users/:id` — hapus user + cascade toko + produk | Must |
| ADM-05 | Frontend: tabel daftar penjual dengan aksi | Must |
| ADM-06 | Frontend: form tambah penjual | Must |
| ADM-07 | `GET /api/users/summary` — total penjual, total produk global | Should |

---

## 5. Data Model & Skema Database

### 5.1 Diagram Relasi

```
users ──────1:1──────> toko ──────1:N──────> produk
 id (PK)               id (PK)               id (PK)
 username              nama                  nama
 password_hash         deskripsi             kategori
 role                  nomor_wa              harga
 aktif                 penjual_id (FK)       stok
                                             deskripsi
                                             image_url
                                             unggulan
                                             toko_id (FK)
                                             created_at
                                             updated_at
```

### 5.2 DDL — Migration SQL

```sql
-- db/migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'penjual')),
  aktif         BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE toko (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        VARCHAR(60)  NOT NULL,
  deskripsi   VARCHAR(200) NOT NULL DEFAULT '',
  nomor_wa    VARCHAR(20)  NOT NULL DEFAULT ''
                           CHECK (nomor_wa = '' OR nomor_wa ~ '^62[0-9]{8,}$'),
  penjual_id  UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TYPE kategori_enum AS ENUM (
  'Jajanan Pasar', 'Minuman', 'Sambal & Bumbu', 'Oleh-oleh Kering', 'Makanan Berat'
);

CREATE TABLE produk (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  nama        VARCHAR(80)    NOT NULL CHECK (char_length(nama) >= 2),
  kategori    kategori_enum  NOT NULL,
  harga       INTEGER        NOT NULL CHECK (harga >= 0),
  stok        INTEGER        NOT NULL CHECK (stok >= 0),
  deskripsi   VARCHAR(300)   NOT NULL DEFAULT '',
  image_url   TEXT           NOT NULL DEFAULT '',
  unggulan    BOOLEAN        NOT NULL DEFAULT false,
  toko_id     UUID           NOT NULL REFERENCES toko(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_toko_updated_at
  BEFORE UPDATE ON toko
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_produk_updated_at
  BEFORE UPDATE ON produk
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### 5.3 Seed Data

```sql
-- db/seed.sql
-- Password: Admin123!  → hash dengan bcrypt cost 10 (jalankan via script Node)
-- Seed script: db/seed.js — meng-hash password lalu INSERT

-- Contoh hasil (hash bervariasi tiap run):
INSERT INTO users (username, password_hash, role) VALUES
  ('admin',              '<bcrypt_hash>', 'admin'),
  ('toko_osing',         '<bcrypt_hash>', 'penjual'),
  ('warung_blambangan',  '<bcrypt_hash>', 'penjual');

INSERT INTO toko (nama, deskripsi, nomor_wa, penjual_id) VALUES
  ('Toko Osing Jaya',   'Produk khas Suku Osing Banyuwangi', '6281200000001',
   (SELECT id FROM users WHERE username = 'toko_osing')),
  ('Warung Blambangan', 'Oleh-oleh dan kuliner khas Blambangan', '6281200000002',
   (SELECT id FROM users WHERE username = 'warung_blambangan'));

-- 8 produk nonpribadi
INSERT INTO produk (nama, kategori, harga, stok, unggulan, toko_id) VALUES
  ('Rujak Soto Banyuwangi',  'Makanan Berat',    18000, 20, true,
   (SELECT id FROM toko WHERE nama = 'Toko Osing Jaya')),
  ('Pecel Pitik',            'Makanan Berat',    25000,  8, true,
   (SELECT id FROM toko WHERE nama = 'Toko Osing Jaya')),
  ('Kopi Osing Robusta',     'Minuman',          35000, 50, true,
   (SELECT id FROM toko WHERE nama = 'Toko Osing Jaya')),
  ('Wedang Uwuh Rempah',     'Minuman',          15000, 30, false,
   (SELECT id FROM toko WHERE nama = 'Toko Osing Jaya')),
  ('Sambal Matah Kemasan',   'Sambal & Bumbu',   22000,  5, false,
   (SELECT id FROM toko WHERE nama = 'Warung Blambangan')),
  ('Kerupuk Ikan Blambangan','Oleh-oleh Kering', 20000,  0, false,
   (SELECT id FROM toko WHERE nama = 'Warung Blambangan')),
  ('Getuk Lindri Banyuwangi','Jajanan Pasar',    12000, 15, false,
   (SELECT id FROM toko WHERE nama = 'Warung Blambangan')),
  ('Lapis Legit Osing',      'Jajanan Pasar',    45000,  3, true,
   (SELECT id FROM toko WHERE nama = 'Warung Blambangan'));
```

---

## 6. API Specification

Base URL: `http://localhost:3000/api`
Content-Type: `application/json`
Auth header: `Authorization: Bearer <JWT>` (endpoint terproteksi)

### 6.1 Auth

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/login` | — | `{ username, password }` | `{ token, user: { id, username, role, tokoId } }` |

**Error responses standar:**
```
401  { error: "Username atau password salah" }
401  { error: "Akun Anda dinonaktifkan" }
403  { error: "Akses ditolak" }
404  { error: "Tidak ditemukan" }
422  { error: "Validasi gagal", detail: { field: "pesan" } }
500  { error: "Kesalahan server" }
```

### 6.2 Produk

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/produk` | — | Semua produk; query: `search`, `kategori`, `toko_id`, `unggulan`, `sort` |
| GET | `/produk/:id` | — | Detail satu produk |
| POST | `/produk` | Penjual | Tambah produk; `toko_id` dari JWT |
| PUT | `/produk/:id` | Penjual (owner) | Edit produk; cek `toko_id === JWT.tokoId` |
| DELETE | `/produk/:id` | Penjual (owner) | Hapus produk; cek `toko_id === JWT.tokoId` |

**Response `GET /produk` (array):**
```json
[
  {
    "id": "uuid",
    "nama": "Kopi Osing Robusta",
    "kategori": "Minuman",
    "harga": 35000,
    "stok": 50,
    "deskripsi": "...",
    "image_url": "",
    "unggulan": true,
    "toko_id": "uuid",
    "toko_nama": "Toko Osing Jaya",
    "toko_nomor_wa": "6281200000001",
    "created_at": "2026-11-16T...",
    "updated_at": "2026-11-16T..."
  }
]
```

### 6.3 Toko

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/toko` | — | Semua toko (nama + ringkasan jumlah produk) |
| GET | `/toko/:id` | — | Detail toko + ringkasan |
| PUT | `/toko/:id` | Penjual (owner) | Update nama, deskripsi, nomor_wa |

### 6.4 Users (Admin only)

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/users` | Admin | Daftar semua penjual + info toko + jumlah produk |
| GET | `/users/summary` | Admin | Total penjual, total produk global |
| POST | `/users` | Admin | Buat penjual + toko; body: `{ username, password, nama_toko, nomor_wa }` |
| PATCH | `/users/:id/status` | Admin | Toggle `aktif`; body: `{ aktif: boolean }` |
| DELETE | `/users/:id` | Admin | Hapus user + cascade toko + produk |

---

## 7. Struktur Direktori

### 7.1 Implementasi demo v0.6.0 (aktual)

```
madanglur/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js            ← base './', port 5173
├── .gitignore
├── README.md
├── STATUS.md
├── SPEC.md
├── UI-SPEC.md
├── TASKS.md
├── CATATAN.md
└── src/
    ├── main.js               ← shell, route, guard role, view katalog
    ├── router.js             ← hash routing #/, #/masuk, #/daftar, #/dashboard, #/admin
    ├── auth.js               ← akun 3 role, seed admin, hash password, sesi, profil penjual
    ├── auth-page.js          ← halaman masuk & daftar (pemilih peran)
    ├── admin.js              ← panel admin: akun, status, hapus, reset produk
    ├── products.js           ← kategori, seed 8 produk, stok, ID
    ├── store.js              ← state, filter/sort, CRUD, ownership, import/reset, sinkron profil
    ├── storage.js            ← localStorage produk, validasi payload, export
    ├── ui.js                 ← navbar role-aware, katalog, hero, filter, toast, notice
    ├── dashboard.js          ← dashboard penjual, profil toko, tabel, modal, import/export
    └── style.css             ← token & seluruh style (auth, profil, admin)
```

Tidak ada `server/`, `db/`, `client/`, `public/`, atau `.env` pada demo ini.

### 7.2 Target monorepo (belum dikerjakan)

```
madanglur/
├── .env.example              ← template variabel environment
├── .gitignore
├── README.md
│
├── db/
│   ├── migrations/
│   │   └── 001_init.sql      ← DDL tabel
│   └── seed.js               ← script Node: hash password + INSERT data
│
├── server/
│   ├── package.json
│   ├── index.js              ← entry point Express
│   ├── config/
│   │   └── db.js             ← Pool pg dari DATABASE_URL
│   ├── middleware/
│   │   ├── verifyJWT.js      ← validasi Bearer token
│   │   └── authorize.js      ← cek role (admin | penjual)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── produk.js
│   │   ├── toko.js
│   │   └── users.js
│   └── utils/
│       └── validate.js       ← helper validasi nomor WA, dll.
│
└── client/
    ├── package.json
    ├── vite.config.js        ← proxy /api → localhost:3000
    ├── index.html
    └── src/
        ├── main.js
        ├── router.js         ← hash routing
        ├── api.js            ← wrapper fetch (setHeader JWT, error handler)
        ├── auth.js           ← login(), logout(), getSession()
        ├── pages/
        │   ├── catalog.js
        │   ├── login.js
        │   ├── dashboard.js
        │   └── admin.js
        ├── utils.js          ← formatRupiah, validateNomorWA
        └── style.css
```

**Variabel environment target (`.env`, belum dipakai demo):**
```
DATABASE_URL=postgresql://user:password@host:5432/madanglur
JWT_SECRET=ganti_dengan_string_acak_panjang
PORT=3000
```

---

## 8. Non-Functional Requirements

| Kode | Kategori | Ketentuan |
|---|---|---|
| NF-01 | Performa | Response API < 500 ms untuk operasi CRUD tunggal di koneksi lokal |
| NF-02 | Responsivitas | Frontend dapat digunakan di viewport 375 px hingga 1440 px |
| NF-03 | Aksesibilitas | Semua elemen interaktif dapat dijangkau keyboard; kontras WCAG AA |
| NF-04 | Keamanan | `DATABASE_URL` dan `JWT_SECRET` hanya di `.env`; tidak pernah di-commit ke git |
| NF-05 | Keamanan | Password di-hash bcrypt sebelum disimpan; tidak ada plaintext di database |
| NF-06 | Keamanan | JWT diverifikasi di setiap request terproteksi; tidak ada logika "bypass" |
| NF-07 | Keamanan | Kepemilikan data divalidasi di server (bukan hanya di frontend) |
| NF-08 | Hak Cipta | Tidak menggunakan gambar/font berhak cipta; gunakan placeholder SVG |
| NF-09 | Maintainability | Setiap route handler < 50 baris; pisahkan validasi ke `utils/validate.js` |
| NF-10 | Kompatibilitas | Node.js >= 20.19 atau >= 22.12 (kebutuhan Vite 8); PostgreSQL >= 14; browser modern tanpa polyfill |
| NF-11 | Isolasi Data | Validasi kepemilikan toko dilakukan di server, bukan hanya di UI |

---

## 9. Risiko

| ID | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R-01 | Supabase free tier terkena rate limit | API lambat / gagal | Rendah | Connection pool max 5; gunakan `pg` pool |
| R-02 | CORS error antara Vite (:5173) dan Express (:3000) | Frontend tidak bisa hit API | Sedang | Pasang `cors` di Express; proxy di `vite.config.js` |
| R-03 | JWT_SECRET hilang / berubah | Semua token invalid | Rendah | Simpan di `.env`; jangan di-generate ulang tanpa logout semua user |
| R-04 | Lupa validasi kepemilikan di server | Penjual A bisa hapus produk toko B | Sedang | Setiap handler PUT/DELETE produk wajib cek `toko_id === req.user.tokoId` |
| R-05 | Nomor WA tidak valid lolos ke database | Tombol WA tidak berfungsi | Rendah | CHECK constraint di PostgreSQL + validasi JS di frontend |
| R-06 | Scope creep (3 role + API + DB) melebihi 2 hari | Tidak selesai | **Tinggi** | Ikuti iterasi berurutan; sisihkan "Should" jika waktu menipis |

---

## 10. Out-of-Scope

- Refresh token / token rotation
- Reset password via email
- Upload gambar nyata (hanya URL/path statis atau SVG placeholder)
- Registrasi mandiri oleh penjual (hanya admin yang buat akun) — *demo v0.6.0 menambah
  `#/daftar` sebagai jalan pintas agar bisa dicoba tanpa seed akun; lihat STATUS D-10*
- Pembayaran online
- Laporan penjualan / histori transaksi
- Penjual multi-toko
- Pembeli dengan akun / wishlist — *demo v0.6.0 menambah peran akun pembeli agar redirect
  peran bisa diuji tanpa backend; target tetap pengunjung tanpa akun*
- Deploy ke cloud (hanya lokal + Supabase)
- Internasionalisasi selain Bahasa Indonesia
- PWA / service worker
- Rate limiting / throttling API
- Logging terpusat (Winston, dsb.)

---

## 11. Acceptance Criteria

Semua kriteria dapat diperiksa secara manual di browser + Postman/Thunder Client.

> AC-A*, AC-F*, AC-T*, AC-ADM*, serta AC-UI07/09/10/11/12 di bawah adalah target API/JWT
> dan **belum dapat dijalankan** pada demo v0.6.0. Padanan demo-nya ada di §11.0 dan
> `STATUS.md` §6.

### 11.0 Acceptance criteria demo v0.6.0

```
AC-D01  Buka #/ → 8 card produk tampil; tiap card punya nama toko, kategori, harga, stok.
AC-D02  Ketik kata kunci → card terfilter real-time pada nama DAN deskripsi.
AC-D03  Klik pill kategori / ⭐ Unggulan → hanya produk yang sesuai tampil.
AC-D04  Ubah sort → urutan berubah (default, Nama A–Z, Harga termurah/termahal, Stok terbanyak).
AC-D05  Stok 0 → tombol "Habis" disabled; produk tersedia → tombol WhatsApp membuka wa.me.
AC-D06  Buka #/dashboard tanpa sesi → dialihkan ke #/masuk + toast info.
AC-D07  Tambah/edit produk dengan input valid → tabel dan katalog berubah tanpa reload penuh.
AC-D08  Input tidak valid → toast error sesuai UI-SPEC §9; data tidak tersimpan.
AC-D09  Hapus produk → dialog konfirmasi; setelah setuju produk hilang dari tabel dan katalog.
AC-D10  Reload halaman → perubahan produk tetap ada (localStorage madanglur:products:v1).
AC-D11  Export JSON penjual → file berisi produk milik penjual tersebut.
AC-D12  Import JSON valid → hanya produk penjual itu yang diganti; produk lain + seed tetap.
AC-D13  Import JSON rusak/field salah → toast error; state dan localStorage lama tidak berubah.
AC-D14  Reset produk demo (admin) → konfirmasi → 8 produk contoh dipulihkan.
AC-D15  Rusakkan nilai localStorage → reload → banner error + 8 produk contoh dipulihkan.
AC-D16  Blokir localStorage → aplikasi tetap jalan + banner info.
AC-D17  #/dashboard/, #/dashboard//, dan hash tak dikenal → route valid / fallback ke katalog.
AC-D18  Buka #/daftar → submit kosong/field salah → error per field + fokus ke field pertama.
AC-D19  Daftar penjual valid → sesi aktif, diarahkan ke #/dashboard dengan nama toko + @username.
AC-D20  Daftar pembeli valid → field toko tersembunyi, diarahkan ke #/, navbar badge Pembeli.
AC-D21  Form daftar hanya menampilkan pilihan Penjual/Pembeli; tidak ada opsi admin.
AC-D22  Login admin (pilih peran Admin, admin / Admin123!) → diarahkan ke #/admin.
AC-D23  Username duplikat → ditolak dengan pesan "Username sudah digunakan."
AC-D24  Masuk dengan password salah / username tak ada → pesan generik "Username atau password salah."
AC-D25  Login penjual → #/dashboard; login pembeli → #/; login admin → #/admin; peran yang dipilih harus cocok dengan peran akun.
AC-D26  Sesi bertahan setelah reload; navbar menampilkan username + badge peran + Keluar.
AC-D27  Keluar → sesi dihapus, navbar kembali tamu, akun tetap tersimpan.
AC-D28  Pengguna yang sudah masuk membuka #/masuk atau #/daftar → dialihkan sesuai peran.
AC-D29  Produk baru/import memakai penjual_id + nama toko + nomor WA akun yang sedang masuk.
AC-D30  Penjual hanya melihat produk miliknya; produk seed publik tidak muncul di dashboard.
AC-D31  Penjual ubah nomor WA di Profil Toko → semua produknya tersinkron; href wa.me katalog memakai nomor baru.
AC-D32  Pembeli membuka #/dashboard atau #/admin → dialihkan ke #/ + toast.
AC-D33  Penjual membuka #/admin → dialihkan ke #/dashboard + toast.
AC-D34  Admin menonaktifkan penjual → penjual tidak bisa login; admin bisa mengaktifkan kembali.
AC-D35  Admin menghapus akun penjual → akun + produknya hilang; akun pembeli → akun hilang.
AC-D36  Akun admin menampilkan "Dilindungi"; tidak bisa dinonaktifkan/dihapus.
AC-D37  Login dengan peran yang tidak cocok → ditolak; pesan menyebut peran akun yang benar.
AC-D38  Pembeli membuka #/pembeli → halaman akun tampil; daftar toko memakai nomor WA terbaru penjual.
```

### Autentikasi

```
AC-A01  POST /api/auth/login {username:"admin", password:"Admin123!"} → 200, ada field "token".
AC-A02  POST /api/auth/login {username:"admin", password:"salah"} → 401, ada field "error".
AC-A03  POST /api/auth/login akun penjual nonaktif → 401 "Akun Anda dinonaktifkan".
AC-A04  GET /api/users tanpa token → 401.
AC-A05  GET /api/users dengan token penjual → 403.
AC-A06  Frontend: login admin → redirect ke #/admin; login penjual → redirect ke #/dashboard.
AC-A07  Frontend: akses #/dashboard tanpa token → redirect ke #/login.
AC-A08  Frontend: logout → token dihapus dari localStorage; redirect ke katalog.
```

### API Produk

```
AC-F01  GET /api/produk → 200, array 8 objek; tiap objek ada field toko_nama dan toko_nomor_wa.
AC-F02  GET /api/produk?kategori=Minuman → hanya produk berkategori Minuman.
AC-F03  GET /api/produk?search=kopi → hanya produk namanya mengandung "kopi" (case-insensitive).
AC-F04  GET /api/produk?unggulan=true → hanya produk dengan unggulan=true.
AC-F05  POST /api/produk tanpa token → 401.
AC-F06  POST /api/produk dengan token penjual, data valid → 201, produk tersimpan di DB.
AC-F07  POST /api/produk harga: -1 → 422, ada pesan validasi.
AC-F08  PUT /api/produk/:id dengan token penjual lain (bukan owner) → 403.
AC-F09  DELETE /api/produk/:id oleh owner → 200; GET produk tersebut → 404.
AC-F10  GET /api/produk/:id dengan UUID valid → 200, objek produk lengkap.
AC-F11  GET /api/produk/:id dengan UUID tidak ada → 404 { error: "Tidak ditemukan" }.
```

### API Toko & Users

```
AC-T01  GET /api/toko → 200, array 2 toko.
AC-T02  PUT /api/toko/:id dengan nomor_wa "08123" (tidak diawali 62) → 422.
AC-T03  PUT /api/toko/:id dengan nomor_wa valid "6281200000099" → 200, tersimpan.
AC-T04  PUT /api/toko/:id toko lain oleh penjual berbeda → 403.
AC-ADM01  POST /api/users (token admin) username unik + data valid → 201; user + toko terbuat.
AC-ADM02  POST /api/users username duplikat → 422 "Username sudah digunakan".
AC-ADM03  PATCH /api/users/:id/status {aktif:false} → 200; penjual tidak bisa login.
AC-ADM04  DELETE /api/users/:id → 200; GET /api/produk → produk toko tersebut ikut hilang.
```

### Frontend Katalog

```
AC-UI01  Buka / tanpa login → 8 card tampil; setiap card ada nama toko.
AC-UI02  Ketik di kolom pencarian → card terfilter real-time.
AC-UI03  Produk stok 0 → tombol WA disabled + label "Habis".
AC-UI04  Produk nomor_wa kosong → tombol WA disabled + label "WA belum diatur".
AC-UI05  Klik tombol WA produk tersedia → tab baru membuka wa.me dengan nomor toko yang benar.
AC-UI06  Setelah penjual ubah nomor WA → reload katalog → tombol WA menggunakan nomor baru.
```

### Frontend Dashboard & Admin

```
AC-UI07  Login penjual → tabel hanya tampil produk toko sendiri.
AC-UI08  Tambah produk via form → produk langsung muncul di tabel dan katalog tanpa reload penuh.
AC-UI09  Edit profil toko (nomor WA baru) → simpan → fetch ulang → nomor baru tampil di form.
AC-UI10  Login admin → tabel penjual tampil; tombol nonaktifkan berfungsi.
AC-UI11  Admin hapus penjual → penjual hilang dari tabel; produk toko tersebut hilang dari katalog.
AC-UI12  Jika fetch ke API gagal (server mati / network error) → toast error "Gagal memuat data. Coba lagi." tampil; halaman tidak crash.
```

---

## 12. Implementation Plan

> Estimasi total: **2 hari (±14–16 jam)** untuk satu orang.
> Kerjakan berurutan — setiap iterasi adalah checkpoint yang bisa dicoba.
>
> **Catatan v0.6.0:** rencana di bawah adalah jalur target backend + auth JWT. Progres nyata
> (termasuk frontend demo, auth lokal 3 role, dashboard penjual scoped, profil toko, dan panel
> admin) dicatat di `TASKS.md` dan `STATUS.md`. Langkah demo auth lokal di `src/auth.js`
> **bukan** iterasi 2/5 di bawah; saat backend siap, modul itu diganti dengan pemanggilan
> `POST /api/auth/login` + penyimpanan JWT.

---

### HARI 1 — Backend & Database

#### Iterasi 0 — Setup Monorepo & Supabase (±45 menit)
**Goal:** Koneksi ke database berhasil.

- [ ] Buat akun Supabase di supabase.com; buat project baru region `ap-southeast-1`.
- [ ] Salin `DATABASE_URL` (connection string) dari Settings → Database.
- [ ] Inisialisasi monorepo:
  ```bash
  mkdir madanglur && cd madanglur
  mkdir db server client
  git init
  echo "node_modules/\n.env" > .gitignore
  cp .env.example .env   # isi DATABASE_URL & JWT_SECRET
  ```
- [ ] Setup server:
  ```bash
  cd server
  npm init -y
  npm install express pg bcrypt jsonwebtoken cors dotenv
  npm install -D nodemon
  ```
- [ ] Buat `server/config/db.js` — Pool pg dari `DATABASE_URL`.
- [ ] Verifikasi: `node -e "require('./config/db').query('SELECT 1')"` → tidak error.

---

#### Iterasi 1 — Migrasi & Seed Database (±1 jam)
**Goal:** Tabel terbuat; 8 produk seed tersimpan di Supabase.

- [ ] Jalankan `db/migrations/001_init.sql` di Supabase SQL Editor.
- [ ] Buat `db/seed.js`:
  - Import `bcrypt` dan `pg`.
  - Hash password seed dengan `bcrypt.hash(password, 10)`.
  - INSERT users, toko, produk sesuai §5.3.
- [ ] `node db/seed.js` → tidak error.
- [ ] Verifikasi di Supabase Table Editor: 3 user, 2 toko, 8 produk.

---

#### Iterasi 2 — Auth Endpoint (±1 jam)
**Goal:** AC-A01 s/d AC-A05 terpenuhi (uji via Postman/Thunder Client).

- [ ] `server/middleware/verifyJWT.js` — parse & verifikasi `Authorization: Bearer`.
- [ ] `server/middleware/authorize.js` — cek `req.user.role`.
- [ ] `server/routes/auth.js`:
  - `POST /api/auth/login`: query user, `bcrypt.compare`, sign JWT, return token.
  - Cek `aktif === true`.
- [ ] Pasang route di `server/index.js` + CORS.
- [ ] Verifikasi AC-A01 sampai AC-A05.

---

#### Iterasi 3 — Endpoint Produk & Toko (±2 jam)
**Goal:** AC-F01 s/d AC-F09 dan AC-T01 s/d AC-T04 terpenuhi.

- [ ] `server/routes/produk.js`:
  - `GET /api/produk` — query dengan LEFT JOIN toko; support query params.
  - `GET /api/produk/:id`
  - `POST /api/produk` — verifyJWT + authorize('penjual'); inject `toko_id` dari JWT.
  - `PUT /api/produk/:id` — cek `toko_id === req.user.tokoId`.
  - `DELETE /api/produk/:id` — cek `toko_id === req.user.tokoId`.
- [ ] `server/routes/toko.js`:
  - `GET /api/toko`, `GET /api/toko/:id`
  - `PUT /api/toko/:id` — verifyJWT; cek `penjual_id === req.user.userId`.
- [ ] Validasi nomor WA di `utils/validate.js`: `/^62[0-9]{8,}$/`.
- [ ] Verifikasi AC-F01 sampai AC-T04.

---

#### Iterasi 4 — Endpoint Users/Admin (±1 jam)
**Goal:** AC-ADM01 s/d AC-ADM04 terpenuhi.

- [ ] `server/routes/users.js`:
  - `GET /api/users` — authorize('admin'); join toko + COUNT produk.
  - `GET /api/users/summary`
  - `POST /api/users` — hash password, INSERT user + toko dalam transaksi.
  - `PATCH /api/users/:id/status`
  - `DELETE /api/users/:id` — cascade otomatis via FK ON DELETE CASCADE.
- [ ] Verifikasi AC-ADM01 sampai AC-ADM04.

---

### HARI 2 — Frontend

#### Iterasi 5 — Setup Client & API Layer (±45 menit)
**Goal:** Vite berjalan; fetch ke API berhasil.

- [ ] `npm create vite@latest client -- --template vanilla`
- [ ] `client/vite.config.js`: proxy `/api` → `http://localhost:3000`.
- [ ] `client/src/api.js`:
  - `apiFetch(path, options)` — tambah header JWT otomatis dari localStorage.
  - Handle 401 → redirect ke `#/login`.
- [ ] `client/src/auth.js`: `login()`, `logout()`, `getSession()`.
- [ ] `client/src/router.js`: hash routing + guard.
- [ ] Verifikasi: `fetch('/api/produk')` di console → array 8 produk.

---

#### Iterasi 6 — Halaman Katalog & Login (±2 jam)
**Goal:** AC-UI01 s/d AC-UI06 dan AC-A06 s/d AC-A08 terpenuhi.

- [ ] `pages/login.js`: form login → `auth.login()` → redirect sesuai role.
- [ ] `pages/catalog.js`: fetch `/api/produk` → render card grid.
- [ ] Komponen card: nama, nama toko, kategori, harga, stok indicator, badge Unggulan, tombol WA.
- [ ] Filter/sorting di sisi klien dari data fetch.
- [ ] Navbar: "Login" / "Logout + username" sesuai sesi.
- [ ] 5 placeholder SVG per kategori (warna berbeda).
- [ ] CSS responsif: 1 → 2 → 4 kolom.
- [ ] Verifikasi AC-UI01 s/d AC-UI06, AC-A06 s/d AC-A08.

---

#### Iterasi 7 — Dashboard Toko (±2 jam)
**Goal:** AC-UI07 s/d AC-UI09 terpenuhi.

- [ ] `pages/dashboard.js`: guard penjual aktif.
- [ ] Fetch produk toko sendiri + render tabel + ringkasan.
- [ ] Form tambah/edit produk (validasi client-side).
- [ ] Hapus produk dengan `confirm()`.
- [ ] Tab "Profil Toko": fetch + edit nama, deskripsi, nomor WA.
- [ ] Validasi nomor WA di frontend sebelum kirim.
- [ ] Verifikasi AC-UI07 s/d AC-UI09.

---

#### Iterasi 8 — Panel Admin (±1,5 jam)
**Goal:** AC-UI10 s/d AC-UI11 terpenuhi.

- [ ] `pages/admin.js`: guard admin.
- [ ] Fetch `/api/users` + render tabel penjual.
- [ ] Ringkasan global dari `/api/users/summary`.
- [ ] Form tambah penjual.
- [ ] Tombol nonaktifkan/aktifkan + hapus.
- [ ] Verifikasi AC-UI10 s/d AC-UI11.

---

#### Iterasi 9 — Polish & QA (±1 jam)
**Goal:** Semua AC terpenuhi; tidak ada error konsol.

- [ ] Jalankan checklist seluruh AC (§11) secara manual.
- [ ] Cek responsivitas di 375 px dan 1280 px.
- [ ] Perbaiki contrast warna (DevTools Accessibility).
- [ ] Pastikan semua tombol terjangkau keyboard.
- [ ] Hapus `console.log` debug.
- [ ] Update `README.md`: prasyarat, cara setup, cara run, akun demo.

---

## 13. Referensi

- [Supabase — Getting Started](https://supabase.com/docs/guides/getting-started)
- [node-postgres (pg) — Docs](https://node-postgres.com/)
- [Express.js — Docs](https://expressjs.com/)
- [jsonwebtoken — npm](https://www.npmjs.com/package/jsonwebtoken)
- [bcrypt — npm](https://www.npmjs.com/package/bcrypt)
- [Vite — Vanilla Template](https://vitejs.dev/guide/)
- [wa.me Deep Link Format](https://faq.whatsapp.com/425247423114725)
- [WCAG 2.1 Contrast — Level AA](https://www.w3.org/TR/WCAG21/#contrast-minimum)

---

*Dokumen ini adalah sumber kebenaran untuk **target** MVP MadangLur.
Status implementasi aktual ada di `STATUS.md`; rencana kerja ada di `TASKS.md`.
Setiap perubahan scope harus diperbarui di sini sebelum implementasi.*
