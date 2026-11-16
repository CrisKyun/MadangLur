# UI-SPEC.md — MadangLur
**Spesifikasi Antarmuka Pengguna (UI/UX)**
Versi: 0.3.0 | Status: Draft | Tanggal: 2026-11-16
Referensi: SPEC.md v0.3.0 | Prototype: MadangLur___Prototype_Interaktif.html

---

## 1. Design Token

Semua nilai warna, tipografi, dan spasi menggunakan token CSS di `:root`. Implementasi wajib mengacu token ini — **jangan hardcode** hex/px langsung.

### 1.1 Palet Warna

| Token | Hex | Peran |
|---|---|---|
| `--santan` | `#FAF3E8` | Background halaman utama |
| `--santan-2` | `#F0E6D3` | Background elemen sekunder (th, hover row) |
| `--gula-jawa` | `#2C1A0E` | Teks utama, Navbar background, Hero background |
| `--daun-salam` | `#2D5016` | Warna aksi utama (tombol, border aktif, harga) |
| `--pandan` | `#5A9E2F` | Hover aksi, indikator stok tersedia |
| `--pandan-muda` | `#EAF4DF` | Background pill aktif, badge stok ok |
| `--kunyit` | `#D4860A` | Badge Unggulan, tombol Login di navbar |
| `--kunyit-muda` | `#FDF3DC` | Background btn-edit, badge stok menipis |
| `--cabe` | `#B83232` | Warna error/bahaya, indikator stok habis |
| `--cabe-muda` | `#FDEAEA` | Background badge nonaktif, btn-del |
| `--wajan` | `#5C4B3A` | Teks label, placeholder, ikon |
| `--wajan-muda` | `#EDE0D0` | Border default input, divider |

### 1.2 Tipografi

| Token | Nilai | Digunakan untuk |
|---|---|---|
| `--ff-head` | `'Bricolage Grotesque', sans-serif` | h1–h4, harga, angka statistik |
| `--ff-body` | `'Plus Jakarta Sans', sans-serif` | Semua teks body, label, tombol |

**Skala teks:**

| Elemen | font-size | font-weight |
|---|---|---|
| h1 (Hero title) | `clamp(2rem, 5vw, 3.2rem)` | 800 |
| h2 (Section/Page heading) | `clamp(1.4rem, 3vw, 1.9rem)` | 700 |
| h3 (Sub-heading, modal title) | `1.1rem` | 600 |
| Body default | `15px` | 400 |
| Label form | `0.82rem` | 600 |
| Badge/pill | `0.7–0.8rem` | 600 |
| Caption/hint | `0.75rem` | 400 |

### 1.3 Border Radius

| Token | Nilai | Digunakan untuk |
|---|---|---|
| `--r-sm` | `6px` | Input, tombol kecil, navbar btn |
| `--r-md` | `12px` | Card produk, stat card, toast |
| `--r-lg` | `18px` | Profil card |
| `--r-xl` | `24px` | Modal box, login box |

### 1.4 Shadow

| Token | Nilai | Digunakan untuk |
|---|---|---|
| `--shadow-card` | `0 2px 8px rgba(44,26,14,.08), 0 1px 2px rgba(44,26,14,.04)` | Card produk, tabel |
| `--shadow-pop` | `0 8px 24px rgba(44,26,14,.14)` | Modal, login box, card hover |

### 1.5 Kategori — Warna Badge & Background Card

| Kategori | Badge class | Card BG class | Badge color |
|---|---|---|---|
| Jajanan Pasar | `.kat-jajanan` | `.bg-jajanan` | bg `#FEF3C7`, teks `#92400E` |
| Minuman | `.kat-minuman` | `.bg-minuman` | bg `#DBEAFE`, teks `#1E40AF` |
| Sambal & Bumbu | `.kat-sambal` | `.bg-sambal` | bg `#FFE4E6`, teks `#9F1239` |
| Oleh-oleh Kering | `.kat-oleh` | `.bg-oleh` | bg `#F3E8FF`, teks `#6B21A8` |
| Makanan Berat | `.kat-makanan` | `.bg-makanan` | bg `var(--pandan-muda)`, teks `var(--daun-salam)` |

---

## 2. Layout Global

### 2.1 Navbar

```
┌──────────────────────────────────────────────────────────┐
│ 🍛 MadangLur    [Katalog]  [Masuk]                       │  ← Guest
│ 🍛 MadangLur    [Katalog]  toko_osing [penjual▾] [Keluar]│  ← Logged in
└──────────────────────────────────────────────────────────┘
```

| Properti | Nilai |
|---|---|
| Height | `58px` |
| Position | `sticky`, `top: 0`, `z-index: 100` |
| Background | `var(--gula-jawa)` |
| Border bottom | `2px solid var(--daun-salam)` |
| Padding horizontal | `clamp(1rem, 4vw, 2.5rem)` |

**Elemen navbar:**

| Elemen | Kondisi tampil | Spesifikasi |
|---|---|---|
| `.nav-brand` (🍛 MadangLur) | Selalu | font-weight 800, warna `var(--santan)`, klik → katalog |
| Tombol "Katalog" | Selalu | `.nav-btn`; class `.active` saat di halaman katalog |
| Tombol "Masuk" | Belum login | `.nav-btn.login-btn`; bg `var(--kunyit)` |
| Username | Sudah login | Teks `var(--santan-2)`, font-size `.85rem` |
| `.role-badge` | Sudah login | Pill kecil, bg `var(--daun-salam)`, teks putih, kapitalisasi |
| Tombol "Keluar" | Sudah login | Border `1px solid rgba(255,255,255,.2)`, warna `var(--santan-2)` |

### 2.2 Routing (Hash-based)

| Hash | Halaman | Guard |
|---|---|---|
| `#/` atau kosong | Katalog Publik | Tidak ada |
| `#/login` | Halaman Login | Redirect ke `#/` jika sudah login |
| `#/dashboard` | Dashboard Penjual | Redirect ke `#/login` jika tidak ada token; 403 jika bukan penjual |
| `#/admin` | Panel Admin | Redirect ke `#/login` jika tidak ada token; 403 jika bukan admin |

**Redirect setelah login:**
- Role `admin` → `#/admin`
- Role `penjual` → `#/dashboard`

---

## 3. Halaman: Katalog Publik (`#/`)

### 3.1 Hero Section

```
┌──────────────────────────────────────────────────┬──────────┐
│  [Kuliner UMKM Banyuwangi]                        │ 🍜 ☕ 🌶 │
│  Temukan cita rasa                                │ 🍘 🫚 🍵 │
│  dari dapur tetangga                              │ 🧆 🍰 🫙 │
│                                                   │          │
│  Deskripsi singkat...                            │          │
│                                                   │          │
│  8 produk    2 toko    5 kategori                 │          │
└──────────────────────────────────────────────────┴──────────┘
```

| Properti | Nilai |
|---|---|
| Background | `var(--gula-jawa)` |
| Overlay gradient | `radial-gradient(ellipse at 80% 50%, rgba(45,80,22,.4), transparent 65%)` |
| Padding | `clamp(2.5rem, 6vw, 4rem) clamp(1rem, 4vw, 2.5rem)` |
| Layout | `grid`, 2 kolom: `1fr auto`; di ≤540px: 1 kolom |

**Sub-elemen Hero:**

| Elemen | Spesifikasi |
|---|---|
| `.hero-eyebrow` | Pill hijau (`var(--daun-salam)`), teks putih, font `.78rem` 600 |
| `.hero-title` | Teks `var(--santan)`; kata kunci dalam `<em>` berwarna `var(--kunyit)` |
| `.hero-sub` | Teks `var(--wajan-muda)`, max-width `42ch` |
| `.hero-stats` | Flex row, gap `1.5rem`; angka: ff-head `1.5rem` 800 `var(--santan)` |
| `.hero-mosaic` | Grid 3×3, sel 54px×54px; hover: `scale(1.1)`, bg `rgba(255,255,255,.12)` |

### 3.2 Filter Bar

```
┌────────────────────────────────────────────────────────────────┐
│ [🔍 Cari produk…]  [Semua][🍽 Makanan][☕ Minuman]…  [Sort▾] │
└────────────────────────────────────────────────────────────────┘
```

| Properti | Nilai |
|---|---|
| Position | `sticky`, `top: 58px`, `z-index: 90` |
| Background | `var(--santan)` |
| Border bottom | `1px solid var(--wajan-muda)` |
| Padding | `.75rem clamp(1rem, 4vw, 2.5rem)` |

**Search input:**
- Min-width `200px`, max-width `320px`, flex `1`
- Ikon kaca pembesar absolut di kiri (warna `var(--wajan)`)
- Border `1.5px solid var(--wajan-muda)`; focus: border `var(--daun-salam)`
- Placeholder color `#b0a090`

**Pill kategori:**

| State | Style |
|---|---|
| Default | bg `var(--santan-2)`, border transparent, teks `var(--wajan)` |
| Hover | border `var(--pandan)`, teks `var(--daun-salam)` |
| Aktif | bg `var(--pandan-muda)`, border `var(--daun-salam)`, teks `var(--daun-salam)` font-weight 600 |

Daftar pill: **Semua** · 🍽 Makanan Berat · ☕ Minuman · 🌶 Sambal & Bumbu · 🍘 Oleh-oleh Kering · 🧆 Jajanan Pasar · ⭐ Unggulan

**Sort select:**
- Min-width `140px`; opsi: Urutan default / Nama A–Z / Harga termurah / Harga termahal / Stok terbanyak

### 3.3 Product Grid

**Layout grid:**

| Viewport | Kolom |
|---|---|
| ≥760px | `auto-fill, minmax(220px, 1fr)` |
| <760px | 1–2 kolom otomatis |

**Featured card** (produk unggulan pertama, hanya jika viewport ≥760px):
- `grid-column: span 2`
- Layout 2 kolom: gambar kiri, body kanan
- Min-height gambar: `180px`
- **Urutan:** produk unggulan pertama berdasarkan urutan yang dikembalikan API (`created_at ASC`). Jika tidak ada produk unggulan, tidak ada featured card — semua card berukuran normal.

**Product Card:**

```
┌─────────────────────────┐
│ [bg kategori + emoji]   │  ← .card-img, h: 140px
│ [★ Unggulan]            │  ← .badge-unggulan (bila unggulan)
├─────────────────────────┤
│ 🏪 Nama Toko            │  ← .card-toko, font .75rem
│ Nama Produk             │  ← .card-name, ff-head .95rem 700
│ [Badge Kategori]        │  ← .card-kategori (warna per kategori)
│                         │
│ Rp 18.000               │  ← .card-price, ff-head 1.1rem 800 daun-salam
│ ● Tersedia / Menipis /  │  ← .stok-wrap (dot + label)
│   Habis                 │
│ [📱 Pesan via WA]       │  ← .btn-wa
└─────────────────────────┘
```

**Indikator stok:**

| Kondisi | Class | Warna dot | Warna teks | Label |
|---|---|---|---|---|
| stok > 5 | `.stok-ok` | `var(--pandan)` | `var(--daun-salam)` | "Tersedia" |
| 1 ≤ stok ≤ 5 | `.stok-low` | `var(--kunyit)` | `var(--kunyit)` | "Stok Menipis" |
| stok = 0 | `.stok-habis` | `var(--cabe)` | `var(--cabe)` | "Habis" |

**Tombol "Pesan via WA" (`.btn-wa`):**

| Kondisi | State | Perilaku |
|---|---|---|
| stok > 0 & nomor_wa terisi | Aktif | Buka `wa.me/{nomor_wa}?text=...` di tab baru |
| stok = 0 | Disabled | Label "Habis", bg `var(--wajan-muda)`, cursor not-allowed |
| nomor_wa kosong | Disabled | Label "WA belum diatur" |

Teks WA deeplink: `Halo, saya ingin memesan {nama produk} dari {nama toko}`

Format URL lengkap (wajib `encodeURIComponent` pada teks):
```
https://wa.me/{nomor_wa}?text=Halo%2C%20saya%20ingin%20memesan%20{nama_produk_encoded}%20dari%20{nama_toko_encoded}
```
Contoh konkret — Kopi Osing Robusta dari Toko Osing Jaya:
```
https://wa.me/6281200000001?text=Halo%2C%20saya%20ingin%20memesan%20Kopi%20Osing%20Robusta%20dari%20Toko%20Osing%20Jaya
```
Implementasi: `const text = encodeURIComponent(\`Halo, saya ingin memesan ${produk.nama} dari ${produk.toko_nama}\`)`

**Loading state** (saat `fetch('/api/produk')` belum selesai):
- Tampilkan teks `"Memuat produk…"` di dalam `#productGrid`, center, warna `var(--wajan)`, padding `4rem 2rem`
- Hero stats menampilkan `—` sebagai placeholder angka selama loading
- Setelah fetch selesai (berhasil atau gagal), loading state diganti dengan grid atau empty state

**Empty state** (tidak ada produk setelah filter):
- Emoji besar (mis. 🔍), teks "Tidak ada produk yang sesuai", center, padding `4rem 2rem`

**Error state** (fetch gagal / network error):
- Toast error `"Gagal memuat data. Coba lagi."` (tipe `error`) muncul otomatis
- Grid tetap kosong; tidak crash atau menampilkan pesan teknis ke user

---

## 4. Halaman: Login (`#/login`)

```
┌──────────────────────────────────────┐
│           🍛                          │
│      Masuk ke MadangLur              │
│    Dashboard penjual & panel admin   │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ Akun demo — klik untuk isi   │    │  ← .demo-accounts (bg pandan-muda)
│  │ Admin   admin/Admin123! [Pakai]   │
│  │ Penjual 1  toko_osing  [Pakai]   │
│  │ Penjual 2  warung_...  [Pakai]   │
│  └──────────────────────────────┘    │
│                                      │
│  Username: [____________]            │
│  Password: [____________]            │
│  [         Masuk         ]           │
│  (error message jika gagal)          │
└──────────────────────────────────────┘
```

| Properti | Nilai |
|---|---|
| Background halaman | `var(--gula-jawa)` |
| `.login-box` | bg putih, `border-radius var(--r-xl)`, max-width `400px`, shadow-pop |
| Padding box | `2.5rem` |

**Demo accounts widget:**
- Background `var(--pandan-muda)`, border-radius `var(--r-sm)`
- Tiap baris: label role — `<code>` username — tombol "Pakai" (bg `var(--daun-salam)`)
- Klik "Pakai" → isi otomatis field username & password

**Form fields:**
- Label: font `.82rem` 600
- Input: border `1.5px solid var(--wajan-muda)`; focus: border `var(--daun-salam)`, bg `#fff`

**Error message (`.login-error`):**
- Muncul di bawah tombol Masuk
- Teks warna `var(--cabe)`, font-size `.85rem`
- Pesan: "Username atau password salah." atau "Akun Anda dinonaktifkan."

---

## 5. Halaman: Dashboard Penjual (`#/dashboard`)

### 5.1 Layout

```
┌──────────┬──────────────────────────────────────────────┐
│          │  Toko Osing Jaya                              │
│ Produk   │  Kelola produk toko Anda                     │
│ Saya ✓   │                                               │
│          │  [4 Produk] [78 Stok] [2 Kategori] [2 Unggulan] │
│ Profil   │                                               │
│ Toko     │  Daftar Produk              [+ Tambah Produk] │
│          │  ┌─────────────────────────────────────────┐  │
│          │  │ Nama │ Kategori │ Harga │ Stok │ ⭐ │ Aksi│  │
│ [Keluar] │  │ ...  │  ...     │  ...  │  ... │ · │ ·  │  │
└──────────┴──────────────────────────────────────────────┘
```

**Sidebar (`.dash-sidebar`):**

| Properti | Nilai |
|---|---|
| Width | `200px` (desktop) |
| Background | `var(--santan-2)` |
| Padding | `1.5rem 1rem` |
| Border right | `1px solid var(--wajan-muda)` |

| Item sidebar | Icon | Posisi |
|---|---|---|
| Produk Saya | 🛍 (shopping bag) | Atas |
| Profil Toko | 🏠 (house) | Atas |
| Keluar | → (logout) | Bawah (`margin-top: auto`) |

State aktif sidebar: bg `var(--pandan-muda)`, teks `var(--daun-salam)`, border-left `3px solid var(--daun-salam)`

### 5.2 Tab: Produk Saya

**Stat cards (`.stat-row`):**

| Stat | Kalkulasi |
|---|---|
| Total Produk | `COUNT(produk WHERE toko_id = JWT.tokoId)` |
| Total Stok | `SUM(stok)` |
| Kategori | `COUNT(DISTINCT kategori)` |
| Unggulan | `COUNT(unggulan = true)` |

Style `.stat-card`: bg putih, border-radius `var(--r-md)`, shadow-card, border-left `4px solid var(--daun-salam)`; angka: ff-head `2rem` 800; label: `.78rem` wajan.

**Tabel produk:**

| Kolom | Lebar | Keterangan |
|---|---|---|
| Nama Produk | Auto | font-weight 600 (`.td-name`) |
| Kategori | Auto | Badge warna per kategori |
| Harga | Auto | ff-head 700 `var(--daun-salam)` (`.td-price`) |
| Stok | Auto | Stok 0 → `<span>` warna `var(--cabe)` teks "Habis" |
| Unggulan | Auto | ⭐ warna `var(--kunyit)` jika true; `—` jika false |
| Aksi | Auto | Tombol Edit + Hapus |

**Tombol aksi tabel:**
- `btn-edit`: bg `var(--kunyit-muda)`, teks `var(--kunyit)`; hover: bg `var(--kunyit)`, teks putih
- `btn-del`: bg `var(--cabe-muda)`, teks `var(--cabe)`; hover: bg `var(--cabe)`, teks putih

**Tombol "+ Tambah Produk" (`.btn-add`):**
- Ikon `+` SVG, bg `var(--daun-salam)`, teks putih, font-weight 600

**Empty state tabel:** "Belum ada produk. Tambahkan produk pertama Anda!" — center, padding `2rem`.

### 5.3 Tab: Profil Toko

Form di dalam `.profil-card` (max-width `540px`, bg putih, shadow-card):

| Field | Input type | Validasi |
|---|---|---|
| Nama Toko | text | Wajib, tidak boleh kosong |
| Deskripsi | text | Opsional, maks. `200` karakter (sesuai DB) |
| Nomor WhatsApp | text | Opsional; jika diisi wajib format `^62[0-9]{8,}$` |

Hint WA: `Format: 62 diikuti nomor tanpa spasi atau tanda +` (font `.75rem`, warna `var(--wajan)`; `<code>` bg `var(--santan-2)`)

Tombol "Simpan Perubahan": full-width, bg `var(--daun-salam)`

---

## 6. Halaman: Panel Admin (`#/admin`)

### 6.1 Layout

Sama seperti Dashboard (sidebar + main), dengan label sidebar "Admin Panel" dan satu item menu "Kelola Penjual".

### 6.2 Global Stats (`.global-stats`)

Grid `auto-fit, minmax(160px, 1fr)`, gap `.75rem`:

| Stat | Sumber |
|---|---|
| Total Penjual | `GET /api/users/summary` |
| Total Produk | `GET /api/users/summary` |
| Toko Aktif | `COUNT(users WHERE aktif = true AND role = 'penjual')` |

Style `.global-stat`: bg putih, border-left `4px solid var(--daun-salam)`, angka: ff-head `2rem` 800.

### 6.3 Tabel Penjual

| Kolom | Keterangan |
|---|---|
| Username | font-weight 600 |
| Nama Toko | Nama toko miliknya |
| Produk | Jumlah produk toko tersebut |
| Status | Badge Aktif / Nonaktif |
| Aksi | Tombol Nonaktifkan/Aktifkan + Hapus |

**Badge status:**

| Status | Class | Style |
|---|---|---|
| Aktif | `.status-aktif` | bg `var(--pandan-muda)`, teks `var(--daun-salam)` |
| Nonaktif | `.status-nonaktif` | bg `var(--cabe-muda)`, teks `var(--cabe)` |

**Tombol aksi:**

| Tombol | Class | Kondisi tampil |
|---|---|---|
| "Nonaktifkan" | `.btn-deactivate` | Jika user aktif |
| "Aktifkan" | `.btn-activate` | Jika user nonaktif |
| "Hapus" | `.btn-del` | Selalu |

Hapus: tampilkan `confirm()` dialog — "Hapus akun `{username}` beserta semua produk tokonya?"

---

## 7. Modal

### 7.1 Overlay & Box

| Properti | Nilai |
|---|---|
| Overlay bg | `rgba(44,26,14,.55)` + `backdrop-filter: blur(3px)` |
| Animasi buka | opacity: 0→1, translateY(12px→0), durasi `0.2s` |
| `.modal-box` | bg putih, `border-radius var(--r-xl)`, max-width `440px`, max-height `90vh`, overflow-y auto |
| Tutup | Klik tombol ✕ (`.modal-close`, bulat 30px) atau klik overlay di luar box |

### 7.2 Modal Tambah/Edit Produk

**Judul:** "Tambah Produk" atau "Edit Produk" (dinamis)

| Field | Input | Validasi |
|---|---|---|
| Nama Produk | text | Wajib, min. 2 karakter |
| Kategori | select | Wajib pilih salah satu |
| Stok | number, min=0 | Wajib, integer ≥ 0 |
| Harga (Rp) | number, min=0 | Wajib, ≥ 0 |
| Deskripsi | text | Opsional, maks. 300 karakter |
| Produk Unggulan | checkbox | Opsional |

Layout form: Kategori & Stok dalam `.form-row` (2 kolom).

**Tombol footer:**
- "Batal" (`.btn-cancel`): flex 1, bg `var(--santan-2)`, teks `var(--wajan)`
- "Simpan Produk" (`.btn-save`): flex 2, bg `var(--daun-salam)`, teks putih

### 7.3 Modal Tambah Penjual (Admin)

**Judul:** "Tambah Penjual Baru"

| Field | Input | Validasi |
|---|---|---|
| Username | text | Wajib, min. 3 karakter, unik |
| Password | password | Wajib, min. 6 karakter |
| Nama Toko | text | Wajib |
| Nomor WhatsApp | text | Opsional; jika diisi wajib format `^62[0-9]{8,}$` |

Layout: Username & Password dalam `.form-row`.

**Tombol footer:** "Batal" + "Buat Akun" (sama pola seperti modal produk).

---

## 8. Toast Notification

```
                               ┌────────────────────────────┐
                               │ ✓ Produk berhasil ditambahkan! │
                               └────────────────────────────┘
                                       (bottom-right)
```

| Properti | Nilai |
|---|---|
| Posisi | `fixed`, bottom `1.5rem`, right `1.5rem`, z-index `999` |
| Animasi | translateY(80px→0) + opacity(0→1); `cubic-bezier(.34,1.56,.64,1)` |
| Duration tampil | ±2.5 detik, lalu menghilang |
| Background | `var(--gula-jawa)`, teks `var(--santan)` |

**Varian (border-left 4px):**

| Tipe | Border color | Contoh pesan |
|---|---|---|
| success (default) | `var(--pandan)` | "Produk berhasil disimpan!" |
| error | `var(--cabe)` | "Harga tidak valid (harus ≥ 0)." |
| info | `var(--kunyit)` | "Produk dihapus." |

---

## 9. Validasi Client-side

Semua pesan error ditampilkan via toast bertipe `error`, **bukan** alert browser atau inline field error.

| Field | Aturan | Pesan Error |
|---|---|---|
| Nama produk | min 2 karakter | "Nama produk minimal 2 karakter." |
| Kategori | wajib pilih | "Pilih kategori produk." |
| Harga | angka, ≥ 0 | "Harga tidak valid (harus ≥ 0)." |
| Stok | integer, ≥ 0 | "Stok tidak valid (harus bilangan bulat ≥ 0)." |
| Nomor WA | regex `^62[0-9]{8,}$` | "Format nomor WA tidak valid. Gunakan format 628..." |
| Username penjual | min 3 karakter | "Username minimal 3 karakter." |
| Username penjual | unik | "Username sudah digunakan." |
| Password penjual | min 6 karakter | "Password minimal 6 karakter." |
| Nama toko (admin) | tidak kosong | "Nama toko wajib diisi." |
| Login | username/password salah | "Username atau password salah." (dari API 401) |
| Login | akun nonaktif | "Akun Anda dinonaktifkan." (dari API 401) |

---

## 10. Responsivitas

| Breakpoint | Perilaku |
|---|---|
| ≥760px | Product grid multi-kolom; featured card span 2 kolom |
| <760px | Hero: 1 kolom (mosaic di bawah teks); product grid: 1 kolom |
| ≤540px | Hero mosaic: sel `44px×44px`, emoji `1.4rem` |
| 375px–1440px | Semua halaman harus dapat digunakan (NF-02) |

Filter bar: scroll horizontal tersembunyi (`scrollbar-width: none`) untuk pill kategori pada layar sempit.

**Dashboard & Admin — breakpoint:**

| Breakpoint | Perilaku sidebar |
|---|---|
| ≥768px | Sidebar vertikal di kiri, lebar `200px`, tampil permanen |
| <768px | Sidebar berubah jadi nav bar horizontal di bawah navbar utama; item tampil sebaris (flex row); lebar penuh; border-bottom `1px solid var(--wajan-muda)` |

Nav bar horizontal mobile (`.dash-sidebar` di <768px):
- `display: flex`, `flex-direction: row`, `overflow-x: auto`, `scrollbar-width: none`
- Item aktif tetap pakai border-bottom `3px solid var(--daun-salam)` (bukan border-left)
- Item "Keluar" tetap di paling kanan (`margin-left: auto`)

---

## 11. Aksesibilitas (WCAG 2.1 AA)

| Ketentuan | Implementasi |
|---|---|
| Semua elemen interaktif dijangkau keyboard | `<button>`, `<input>`, `<select>` native — tidak gunakan `<div>` sebagai tombol |
| Kontras teks ≥ 4.5:1 | Pasangan warna utama: `var(--gula-jawa)` pada `var(--santan)` |
| Label form eksplisit | `<label for="...">` terhubung ke `<input id="...">` |
| State disabled tombol WA | `disabled` attribute pada `<button>`, bukan hanya CSS |
| Tombol aksi ada teks | Jangan hanya ikon tanpa teks atau `aria-label` |

---

## 12. Placeholder Gambar (NF-08)

Gambar produk menggunakan SVG placeholder warna per kategori (bukan gambar eksternal). Emoji kategori dirender sebagai teks di dalam `div.card-img`. URL gambar (`image_url`) di DB dibiarkan kosong string default.

Emoji per kategori:

| Kategori | Emoji |
|---|---|
| Jajanan Pasar | 🧆 |
| Minuman | ☕ |
| Sambal & Bumbu | 🌶️ |
| Oleh-oleh Kering | 🍘 |
| Makanan Berat | 🍜 |

---

## 13. Komponen — Daftar Lengkap

| Komponen | File implementasi | Halaman digunakan |
|---|---|---|
| Navbar | `main.js` / `renderNav()` | Semua |
| Hero | `pages/catalog.js` | Katalog |
| Filter Bar (search + pills + sort) | `pages/catalog.js` | Katalog |
| Product Card | `pages/catalog.js` | Katalog |
| Empty State | `pages/catalog.js` | Katalog |
| Login Form | `pages/login.js` | Login |
| Demo Accounts Widget | `pages/login.js` | Login |
| Sidebar Dashboard | `pages/dashboard.js` | Dashboard, Admin |
| Stat Cards (penjual) | `pages/dashboard.js` | Dashboard |
| Tabel Produk | `pages/dashboard.js` | Dashboard |
| Form Profil Toko | `pages/dashboard.js` | Dashboard |
| Global Stat Cards (admin) | `pages/admin.js` | Admin |
| Tabel Penjual | `pages/admin.js` | Admin |
| Modal Tambah/Edit Produk | `pages/dashboard.js` | Dashboard |
| Modal Tambah Penjual | `pages/admin.js` | Admin |
| Toast Notification | `main.js` / `toast()` | Semua |

---

*Dokumen ini adalah spesifikasi UI tunggal untuk MadangLur v0.3.0.
Perubahan desain harus diperbarui di sini sebelum diimplementasikan di kode.*
