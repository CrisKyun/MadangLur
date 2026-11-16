# UI-SPEC.md — MadangLur
**Spesifikasi Antarmuka Pengguna (UI/UX)**
Versi: 0.6.0 | Status: Draft — target + demo | Tanggal: 2026-11-16
Referensi: SPEC.md v0.6.0 | Prototype: tidak disertakan di repo demo

```
Changelog:
  v0.3.0  Spesifikasi UI target untuk katalog, login, dashboard, admin
  v0.4.0  Selaraskan dengan demo: navbar tanpa login, dashboard tanpa sidebar/profil,
          toolbar import/export/reset, notice banner, label "Pesan via WhatsApp"
  v0.5.0  Demo auth lokal: halaman Masuk/Daftar, navbar auth-aware, guard dashboard,
          dashboard berheader akun. Sidebar, profil toko, dan admin tetap target.
  v0.6.0  Demo 3 role: pemilih peran di Daftar, navbar role-aware, dashboard penjual
          scoped + kartu Profil Toko, panel admin, guard role. Sidebar + form admin
          tambah penjual tetap target.
```

## 0. Status Implementasi UI (v0.6.0)

> Dokumen ini adalah **target** UI. Demo v0.6.0 mengimplementasikan halaman katalog,
> **masuk/daftar (auth lokal 3 role)**, dashboard penjual dengan profil toko, dan panel admin.
> Sidebar, deskripsi toko, **form admin tambah penjual**, dan guard JWT server **belum ada**.

| Area | Demo v0.6.0 | Target (belum) |
|---|---|---|
| Navbar | Brand + Katalog + Masuk/Daftar (tamu) atau username + badge peran + menu role + Keluar | Dropdown akun, sidebar |
| Routing | `#/`, `#/masuk`, `#/daftar`, `#/dashboard`, `#/admin` + guard role client-side | `#/login`, guard role JWT server |
| Katalog | Hero, filter, grid, card, WA, empty state | Featured card span 2 kolom |
| Auth | Form Masuk/Daftar, pemilih peran (Masuk: Penjual/Pembeli/Admin; Daftar: Penjual/Pembeli), error per field, sesi `localStorage`, admin seed | Login JWT server, widget akun seed |
| Dashboard | Header akun, kartu Profil Toko, 4 stat card, tabel produk sendiri, modal CRUD, export/import scoped | Sidebar, tab Profil Toko, kelola via API |
| Admin | Stat global, tabel akun, toggle status, hapus, reset produk | Form tambah penjual, aksi via API |
| Notifikasi | Toast + banner notice | — |

Status per fitur: `STATUS.md`. Struktur file aktual: `SPEC.md` §7.1.

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
| Height | `min-height: 58px` (bertambah bila menu membungkus) |
| Position | `sticky` pada wrapper `#nav-root`, `top: 0`, `z-index: 100`; tinggi aktual disimpan di `--nav-h` |
| Background | `var(--gula-jawa)` |
| Border bottom | `2px solid var(--daun-salam)` |
| Padding horizontal | `clamp(1rem, 4vw, 2.5rem)` |

**Elemen navbar:**

| Elemen | Kondisi tampil | Spesifikasi |
|---|---|---|
| `.nav-brand` (🍛 MadangLur) | Selalu | font-weight 800, warna `var(--santan)`, klik → katalog |
| Tombol "Katalog" | Selalu | `.nav-btn`; class `.active` saat di halaman katalog |
| Tombol "Masuk" | Belum login | `.nav-btn`; class `.active` saat di `#/masuk` |
| Tombol "Daftar" | Belum login | `.nav-btn.nav-cta`; bg `var(--kunyit)` |
| Tombol "Dashboard" | Sudah login sebagai penjual | `.nav-btn`; class `.active` saat di `#/dashboard` |
| Tombol "Panel Admin" | Sudah login sebagai admin | `.nav-btn`; class `.active` saat di `#/admin` |
| Tombol "Akun Saya" | Sudah login sebagai pembeli | `.nav-btn`; class `.active` saat di `#/pembeli` |
| Username | Sudah login | `.nav-user`; teks `var(--santan-2)`, font-size `.8rem`, ellipsis 12ch |
| `.role-badge` | Sudah login | Pill kecil; hijau untuk penjual, pandan untuk pembeli, kunyit untuk admin |
| Tombol "Keluar" | Sudah login | `.nav-btn.nav-logout`; border `1px solid rgba(255,255,255,.2)` |

> **Demo v0.6.0:** navbar dirender ulang setiap route berdasarkan `getSession()`. Tamu melihat
> **Katalog · Masuk · Daftar**; penjual melihat **Katalog · Dashboard · username · badge
> Penjual · Keluar**; pembeli melihat **Katalog · Akun Saya · username · badge Pembeli ·
> Keluar**; admin melihat **Katalog · Panel Admin · username · badge Admin · Keluar**. Badge mengikuti
> `role` akun; menu Dashboard/Panel Admin hanya tampil untuk peran yang berhak. Link aktif
> memakai `.active` + `aria-current="page"`.

### 2.2 Routing (Hash-based)

| Hash | Halaman | Guard |
|---|---|---|
| `#/` atau kosong | Katalog Publik | Tidak ada |
| `#/login` (target) / `#/masuk` (demo) | Halaman Masuk | Redirect sesuai peran jika sudah masuk |
| `#/daftar` (demo) | Halaman Daftar | Redirect sesuai peran jika sudah masuk |
| `#/dashboard` | Dashboard Penjual | Tanpa sesi → `#/masuk`; bukan penjual → halaman sesuai peran + toast |
| `#/pembeli` | Akun Pembeli | Tanpa sesi → `#/masuk`; bukan pembeli → halaman sesuai peran + toast |
| `#/admin` | Panel Admin | Tanpa sesi → `#/masuk`; bukan admin → halaman sesuai peran + toast |

**Redirect setelah login:**
- Role `admin` → `#/admin`
- Role `penjual` → `#/dashboard`
- Role `pembeli` → `#/`

> **Demo v0.6.0:** `#/masuk` dan `#/daftar` menggantikan `#/login`; `#/admin` sudah ada dengan
> guard role client-side. Guard memakai sesi `localStorage` (`madanglur:session:v1`), bukan JWT.
> Pengguna yang sudah masuk dan membuka `#/masuk`/`#/daftar` dialihkan ke halaman sesuai
> perannya. Hash tidak dikenal diarahkan ke `#/`; trailing slash (`#/dashboard/`) dinormalkan.

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
| Position | `sticky`, `top: var(--nav-h, 58px)` (tinggi navbar aktual), `z-index: 90` |
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
│ [📱 Pesan via WhatsApp] │  ← .btn-wa
└─────────────────────────┘
```

**Indikator stok:**

| Kondisi | Class | Warna dot | Warna teks | Label |
|---|---|---|---|---|
| stok > 5 | `.stok-ok` | `var(--pandan)` | `var(--daun-salam)` | "Tersedia" |
| 1 ≤ stok ≤ 5 | `.stok-low` | `var(--kunyit)` | `var(--kunyit)` | "Stok Menipis" |
| stok = 0 | `.stok-habis` | `var(--cabe)` | `var(--cabe)` | "Habis" |

**Tombol "Pesan via WhatsApp" (`.btn-wa`):**

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

## 4. Halaman: Masuk (`#/masuk`) & Daftar (`#/daftar`)

> **Demo v0.6.0:** dua halaman auth sudah ada dengan gaya kartu di tengah. Masuk memiliki
> pemilih peran **Penjual/Pembeli/Admin** dan hanya menerima akun dengan peran yang sama;
> Daftar hanya **Penjual/Pembeli** (tanpa opsi admin) dan field toko hanya tampil untuk penjual.
> Halaman masuk menampilkan hint akun admin demo (`admin` / `Admin123!`). Target final tetap
> login JWT di `#/login` dengan widget akun seed; spesifikasi kartu di bawah berlaku untuk demo.

```
┌──────────────────────────────────────┐
│                 🍛                   │
│          Masuk ke MadangLur          │
│   Penjual, pembeli, atau admin...    │
│                                      │
│  Username: [________________]        │
│  Password: [________________]        │
│  (pesan error per field)             │
│  (alert umum jika gagal)             │
│  [           Masuk          ]        │
│  Belum punya akun? Daftar sekarang   │
│  Admin demo: admin / Admin123!       │
│  ── Demo lokal: data di browser ──   │
└──────────────────────────────────────┘
```

| Properti | Nilai |
|---|---|
| Background halaman | `var(--santan)` |
| `.auth-wrap` | grid center; `min-height: calc(100vh - 58px)` |
| `.auth-card` | bg putih, `border-radius var(--r-lg)`, `max-width 460px`, `shadow-pop` |
| Padding card | `clamp(1.5rem, 4vw, 2.25rem)` |

**Field Masuk:** Pemilih peran (Penjual/Pembeli/Admin), Username (`autocomplete="username"`),
Password (`current-password`).
**Field Daftar:** Pemilih peran (Penjual/Pembeli), Username, Nama Toko + Nomor WhatsApp
(hanya penjual), Password, Ulangi Password.

**Pemilih peran (`.auth-role`):** dua kartu radio di Daftar, tiga di Masuk (1 kolom di ≤600px). Kartu
terpilih memakai border `var(--daun-salam)` + bg `var(--pandan-muda)`. Radio disembunyikan
secara visual tetapi tetap fokusabel; fokus memakai outline `var(--kunyit)`.

| Field | Aturan demo | Pesan |
|---|---|---|
| Peran | hanya `penjual`/`pembeli` | "Pilih peran Penjual atau Pembeli." / "Akun admin tidak dapat didaftarkan dari halaman ini." |
| Username | 3–20 karakter `[a-z0-9_]`, dinormalisasi lowercase | "Username 3–20 karakter: huruf, angka, atau garis bawah." |
| Username | unik | "Username sudah digunakan." |
| Nama Toko | wajib untuk penjual, 2–40 karakter | "Nama toko minimal 2 karakter." / "Nama toko maksimal 40 karakter." |
| Nomor WA | opsional untuk penjual; `^62[0-9]{8,}$` | "Nomor WA harus diawali 62, mis. 6281234500001." |
| Password | 6–72 karakter | "Password minimal 6 karakter." |
| Ulangi Password | sama dengan password | "Konfirmasi password tidak cocok." |
| Login gagal | — | "Username atau password salah." (generik, tidak membocorkan username) |
| Login nonaktif | — | "Akun Anda dinonaktifkan. Hubungi admin." |
| Login peran salah | peran pilihan harus sama dengan peran akun | "Akun @{username} terdaftar sebagai {Peran}. Pilih peran {Peran} untuk masuk." |

**Error & state:**
- Error per field: `.auth-field-error.is-show` di bawah input; input diberi `aria-invalid="true"`;
  fokus otomatis ke field pertama yang salah.
- Error umum: `.auth-alert.is-show` dengan `role="alert"` di atas tombol submit.
- Tombol submit berubah menjadi "Memproses…" dan `disabled` saat menunggu hash.
- Sukses: toast "Selamat datang, {username}!" lalu redirect sesuai peran
  (admin → `#/admin`, penjual → `#/dashboard`, pembeli → `#/`).

> Catatan keamanan: hash memakai SHA-256 + salt 16 byte via Web Crypto. Ini **bukan**
> bcrypt dan bukan keamanan produksi; data akun berada di `localStorage` pengguna.

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

> **Demo v0.6.0:** tidak ada sidebar atau tombol Keluar di dalam dashboard (Keluar ada di
> navbar). Dashboard memakai layout satu kolom: eyebrow "Masuk sebagai @username · Penjual",
> judul nama toko, deskripsi singkat, tombol **+ Tambah Produk**, toolbar demo
> (Export/Import scoped), kartu **Profil Toko**, 4 stat card, lalu tabel produk milik penjual.
> Tabel hanya memuat produk dengan `penjual_id` akun; 8 produk seed bersifat publik dan tidak
> muncul di dashboard. Reset produk global dipindah ke panel admin.

### 5.2 Tab: Produk Saya

**Stat cards (`.stat-row`):**

| Stat | Kalkulasi target | Demo v0.6.0 |
|---|---|---|
| Total Produk | `COUNT(produk WHERE toko_id = JWT.tokoId)` | `produkMilik(products, penjual_id).length` |
| Total Stok | `SUM(stok)` | `SUM(stok)` dari produk milik penjual |
| Kategori | `COUNT(DISTINCT kategori)` | `Set(kategori).size` dari produk milik penjual |
| Unggulan | `COUNT(unggulan = true)` | filter `unggulan === true` |

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

**Empty state tabel:** "Belum ada produk milik toko Anda." + hint bahwa produk contoh publik —
center, padding `2rem`.

### 5.3 Kartu: Profil Toko

> **Demo v0.6.0:** profil toko diimplementasikan sebagai kartu `.profile-card` di atas stat
> card, bukan tab/sidebar. Field deskripsi toko belum ada. Menyimpan profil memanggil
> `updateProfilPenjual()` lalu `sinkronProfilPenjual()` sehingga semua produk penjual memakai
> nama toko + nomor WA terbaru.

Form di dalam `.profile-card` (bg putih, shadow-card, border-left `4px solid var(--kunyit)`):

| Field | Input type | Validasi |
|---|---|---|
| Nama Toko | text | Wajib, 2–40 karakter |
| Nomor WhatsApp | text | Opsional; jika diisi wajib format `^62[0-9]{8,}$` |

Hint WA: `Format: 62 diikuti nomor tanpa spasi atau tanda +` (font `.75rem`, warna `var(--wajan)`; `<code>` bg `var(--santan-2)`)

Tombol "Simpan Profil": bg `var(--daun-salam)`, rata kanan (full-width di ≤600px).
Setelah simpan: toast sukses menyebut jumlah produk yang nomornya ikut diperbarui.

---

## 6. Halaman: Panel Admin (`#/admin`)

> **Demo v0.6.0:** panel admin sudah ada di `#/admin`, hanya untuk akun berperan admin.
> Layout belum memakai sidebar: header + tombol **Reset Produk Demo** + stat card + tabel akun.
> Form tambah penjual (ADM-02/06) belum diimplementasikan.

### 6.1 Layout

Target memakai sidebar + main seperti dashboard, dengan label "Admin Panel" dan satu item menu
"Kelola Penjual". Demo memakai layout satu kolom: eyebrow "Masuk sebagai @admin · Admin",
judul **Panel Admin**, deskripsi singkat, tombol **Reset Produk Demo**, stat card, lalu tabel akun.

### 6.2 Global Stats (`.stat-row`)

Grid `auto-fit, minmax(160px, 1fr)`, gap `.75rem`:

| Stat | Sumber |
|---|---|
| Total Penjual | Hitung akun `role = 'penjual'` |
| Total Pembeli | Hitung akun `role = 'pembeli'` |
| Produk Global | Jumlah seluruh produk di state |
| Toko Aktif | `penjual.filter(aktif).length` |

Style `.stat-card`: bg putih, border-left `4px solid var(--daun-salam)`, angka: ff-head `2rem` 800.

### 6.3 Tabel Akun

| Kolom | Keterangan |
|---|---|
| Username | font-weight 600 |
| Peran | Pill Admin / Penjual / Pembeli |
| Nama Toko | Nama toko miliknya; `—` untuk pembeli/admin |
| Nomor WA | Nomor profil; `—` jika kosong |
| Produk | Jumlah produk dengan `penjual_id` akun; `—` untuk non-penjual |
| Status | Badge Aktif / Nonaktif |
| Aksi | Tombol Nonaktifkan/Aktifkan + Hapus; admin menampilkan "Dilindungi" |

**Badge peran:**

| Peran | Class | Style |
|---|---|---|
| Admin | `.role-pill.role-admin` | bg `var(--kunyit-muda)`, teks `var(--kunyit)` |
| Penjual | `.role-pill.role-penjual` | bg `var(--pandan-muda)`, teks `var(--daun-salam)` |
| Pembeli | `.role-pill.role-pembeli` | bg `var(--santan-2)`, teks `var(--wajan)` |

**Badge status:**

| Status | Class | Style |
|---|---|---|
| Aktif | `.status-badge.status-aktif` | bg `var(--pandan-muda)`, teks `var(--daun-salam)` |
| Nonaktif | `.status-badge.status-nonaktif` | bg `var(--cabe-muda)`, teks `var(--cabe)` |

**Tombol aksi:**

| Tombol | Class | Kondisi tampil |
|---|---|---|
| "Nonaktifkan" | `.btn-deactivate` | Jika akun aktif dan bukan admin |
| "Aktifkan" | `.btn-activate` | Jika akun nonaktif dan bukan admin |
| "Hapus" | `.btn-del` | Non-admin |
| "Dilindungi" | `.text-muted` | Akun admin |

Hapus: `confirm()` — "Hapus akun `{username}` beserta semua produk tokonya?" Setelah setuju,
akun dihapus dan `hapusProdukPenjual()` menghapus produk milik penjual tersebut.
Reset produk: `confirm()` — "Reset semua produk ke data contoh? Produk tambahan semua akun akan hilang."

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

> **Demo v0.5.0:** belum diimplementasikan (panel admin belum ada).

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

Pesan error produk ditampilkan via toast bertipe `error`, **bukan** alert browser. Form auth
memakai pola berbeda: error per field ditampilkan inline di bawah input + ringkasan umum
(`role="alert"`), lalu fokus pindah ke field pertama yang salah (aksesibilitas).

| Field | Aturan | Pesan Error |
|---|---|---|
| Nama produk | min 2 karakter | "Nama produk minimal 2 karakter." |
| Kategori | wajib pilih | "Pilih kategori produk." |
| Harga | angka, ≥ 0 | "Harga tidak valid (harus ≥ 0)." |
| Stok | integer, ≥ 0 | "Stok tidak valid (harus bilangan bulat ≥ 0)." |
| Nomor WA | regex `^62[0-9]{8,}$` | "Format nomor WA tidak valid. Gunakan format 628..." |
| Username | 3–20 karakter `[a-z0-9_]` | "Username 3–20 karakter: huruf, angka, atau garis bawah." |
| Username | unik | "Username sudah digunakan." |
| Password | 6–72 karakter | "Password minimal 6 karakter." |
| Konfirmasi password | sama | "Konfirmasi password tidak cocok." |
| Nama toko (daftar) | 2–40 karakter | "Nama toko minimal 2 karakter." |
| Nomor WA (daftar) | opsional; `^62[0-9]{8,}$` | "Nomor WA harus diawali 62, mis. 6281234500001." |
| Login | username/password salah | "Username atau password salah." (generik) |
| Login | akun nonaktif | "Akun Anda dinonaktifkan." *(target; demo belum ada status)* |

> **Demo v0.5.0:** pesan produk di atas dipakai di `validateProduk()`. Validasi nomor WA
> (`^62[0-9]{8,}$`) dipakai saat memuat/mengimpor data (`storage.js`) **dan** pada form
> daftar (`auth.js`). Form Profil Toko belum ada. Deskripsi dibatasi 300 karakter.
> Pesan auth memakai `PESAN_AUTH` di `src/auth.js` agar konsisten antara validasi dan UI.

---

## 10. Responsivitas

| Breakpoint | Perilaku |
|---|---|
| ≥760px | Product grid multi-kolom; featured card span 2 kolom |
| <760px | Hero: 1 kolom (mosaic di bawah teks); product grid: 1 kolom |
| ≤540px | Hero mosaic: sel `44px×44px`, emoji `1.4rem` |
| 375px–1440px | Semua halaman harus dapat digunakan (NF-02) |

Filter bar: scroll horizontal tersembunyi (`scrollbar-width: none`) untuk pill kategori pada layar sempit.

**Demo v0.5.0 — navbar & auth:**
- ≤600px: navbar boleh `wrap`, tinggi `min-height: 58px`; tombol lebih rapat (`padding .32rem .55rem`);
  `.nav-user` dipotong 8ch; badge role disembunyikan agar tidak berdesakan.
- `.auth-card` memakai `width: min(100%, 460px)` sehingga tetap muat di 375px tanpa overflow.

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
| Error form auth | `aria-invalid="true"` + `aria-describedby` ke pesan field; ringkasan umum `role="alert"` |
| Fokus setelah gagal submit | Fokus otomatis ke field pertama yang salah (auth) |

---

## 12. Placeholder Gambar (NF-08)

> **Demo v0.5.0:** card memakai emoji kategori + background warna (`div.card-img`), tanpa
> file SVG/gambar eksternal. Ini memenuhi semangat NF-08 (tanpa aset berhak cipta).

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

### 13.1 Implementasi demo v0.5.0 (aktual)

| Komponen | File implementasi | Halaman |
|---|---|---|
| Navbar (auth-aware) | `src/ui.js` → `renderNavbar(session)` | Semua |
| Shell + route + guard + notice root | `src/main.js`, `src/router.js` | Semua |
| Form Masuk / Daftar | `src/auth-page.js` → `mountMasuk()` / `mountDaftar()` | Auth |
| Validasi + hash + sesi | `src/auth.js` | Auth |
| Hero | `src/ui.js` → `renderHero()` | Katalog |
| Filter Bar (search + pills + sort) | `src/ui.js` → `renderFilterBar()`; event di `src/main.js` | Katalog |
| Product Card | `src/ui.js` → `renderCard()` | Katalog |
| Loading / empty / error state | `src/ui.js` → `renderCatalog()` | Katalog |
| Dashboard header + shell | `src/dashboard.js` → `mountDashboard(root, sesi)` | Dashboard |
| Stat Cards | `src/dashboard.js` → `renderBody()`; hitung di `src/store.js` → `ringkasanProduk()` | Dashboard |
| Tabel Produk | `src/dashboard.js` → `renderTable()` | Dashboard |
| Modal Tambah/Edit Produk | `src/dashboard.js` → `renderModal()` / `openModal()` | Dashboard |
| Toolbar Export/Import/Reset | `src/dashboard.js` → `ekspor()`, `imporBerkas()`, `resetDemoAksi()` | Dashboard |
| Toast Notification | `src/ui.js` → `showToast()`; root di `src/main.js` | Semua |
| Notice Banner | `src/ui.js` → `renderNotice()`; root di `src/main.js` | Semua |
| Persistensi + validasi payload | `src/storage.js` | — |
| Filter/sort/validasi/CRUD | `src/store.js` | Katalog + Dashboard |

### 13.2 Pemetaan target (belum dikerjakan)

| Komponen target | File target |
|---|---|
| Login Form + Demo Accounts Widget | `client/src/pages/login.js` |
| Sidebar Dashboard | `client/src/pages/dashboard.js` |
| Form Profil Toko | `client/src/pages/dashboard.js` |
| Global Stat Cards + Tabel Penjual | `client/src/pages/admin.js` |
| Modal Tambah Penjual | `client/src/pages/admin.js` |
| Hero / Filter / Product Card / Empty State | `client/src/pages/catalog.js` |

> Nama file di §13.2 mengikuti target monorepo di `SPEC.md` §7.2, bukan struktur demo.
> Demo sudah punya form Masuk/Daftar lokal (`src/auth-page.js`), tetapi belum punya widget
> akun demo, role, atau sesi JWT seperti target `login.js`.

---

## 14. Fitur Demo Tambahan (v0.5.0)

Bagian ini mendokumentasikan komponen yang **tidak ada di target UI v0.3.0**, tetapi
benar-benar dipakai di demo.

### 14.1 Toolbar dashboard

Posisi: di bawah header dashboard, di atas stat card.

```
[Export JSON] [Import JSON] [Reset Demo]
```

| Tombol | Class | Perilaku |
|---|---|---|
| Export JSON | `.btn-tool` | Unduh `madanglur-produk.json`; toast success |
| Import JSON | `.btn-tool` | Buka file picker (`.json`); validasi → ganti data; toast success/error |
| Reset Demo | `.btn-tool.btn-tool-danger` | `confirm()` → pulihkan 8 produk contoh; toast info |

Style: border `1.5px solid var(--wajan-muda)`, bg putih, teks `var(--wajan)`, font `.8rem`
600. Hover: border/teks `var(--daun-salam)`. Varian danger memakai `var(--cabe)`.

Import bersifat **atomik**:

1. `JSON.parse` di `try/catch` → gagal = toast "Impor gagal: file bukan JSON yang valid."
2. `validasiDaftarProduk()` memeriksa seluruh array → satu item salah = seluruh import ditolak.
3. Data lama baru diganti setelah validasi **dan** penulisan `localStorage` berhasil.
4. Jika gagal, state dan `localStorage` lama tidak berubah.

### 14.2 Notice banner

Posisi: tepat di bawah navbar, full-width. Root: `#notice-root`.

| Varian | Class | Penggunaan |
|---|---|---|
| Error | `.notice.notice-error` | Data tersimpan rusak; 8 produk contoh dipulihkan |
| Info | `.notice.notice-info` | `localStorage` tidak tersedia/diblokir |

Isi: teks pesan + tombol tutup `✕` (`.notice-close`, `aria-label="Tutup pemberitahuan"`).
Banner error memakai `role="alert"`, banner info `role="status"`. Banner tetap tampil
sampai ditutup atau state berubah.

### 14.3 Auth lokal

| Aspek | Demo v0.6.0 |
|---|---|
| Route | `#/masuk` (form masuk), `#/daftar` (registrasi mandiri) |
| Penyimpanan akun | `localStorage` key `madanglur:users:v1` (array akun) |
| Penyimpanan sesi | `localStorage` key `madanglur:session:v1` (id akun) |
| Hash password | SHA-256(`${salt}:${sandi}`) + salt acak 16 byte (Web Crypto) |
| Login per peran | Form masuk memilih Penjual/Pembeli/Admin; peran harus cocok dengan akun |
| Guard | Tanpa sesi → halaman terproteksi dialihkan ke `#/masuk` + toast info; peran salah → halaman sesuai peran |
| Redirect | Setelah masuk/daftar → sesuai peran (admin `#/admin`, penjual `#/dashboard`, pembeli `#/`); sudah masuk → form auth dialihkan |
| Navbar | Dirender ulang saat route berubah dan setelah logout |
| Logout | Hapus `madanglur:session:v1`; akun tetap; toast "Anda telah keluar." |

Perilaku penting:
- Username dinormalisasi ke lowercase dan harus unik.
- Login gagal selalu memakai pesan generik, baik username tidak ada maupun password salah.
- Data akun rusak (`JSON` invalid/struktur salah) tidak ditimpa; form menampilkan pesan
  perbaikan yang menyebut key `madanglur:users:v1`.
- `localStorage` diblokir → pendaftaran/masuk menolak dengan pesan penyimpanan.
- Ini **bukan** JWT dan **bukan** keamanan produksi.

### 14.4 Perbedaan lain dari target

- Tidak ada sidebar; profil toko berupa kartu di atas dashboard, bukan tab.
- Auth demo berbasis `localStorage` (SHA-256 + salt), bukan JWT + bcrypt di server.
- Tabel dashboard memfilter produk lewat `penjual_id` di client; belum ada `toko_id` dari server.
- Card katalog berukuran seragam; featured card span 2 kolom belum diterapkan.
- Nomor WA kosong membuat tombol WhatsApp nonaktif (tidak memakai nomor demo).
- Produk baru/import memakai nama toko + nomor WA akun yang sedang masuk; field toko
  eksplisit pada payload import tetap dipertahankan.

---

## 15. Halaman: Akun Pembeli (`#/pembeli`)

Halaman demo khusus akun pembeli; bukan bagian target MVP (target: pembeli tanpa akun).

```
┌──────────────────────────────────────────────────┐
│ @pembeli · Pembeli                    [Katalog]  │
│ Akun Pembeli                                     │
│ [Informasi Akun: username, peran, status]        │
│ [4 stat card]                                    │
│ Daftar Toko & Nomor WhatsApp                     │
│ ┌────────┬──────────────┬────────┬────────────┐  │
│ │ Toko   │ Nomor WA     │ Produk │ Kontak     │  │
│ └────────┴──────────────┴────────┴────────────┘  │
└──────────────────────────────────────────────────┘
```

| Properti | Nilai |
|---|---|
| Guard | Tanpa sesi → `#/masuk`; bukan pembeli → halaman sesuai peran + toast |
| Sumber data | Produk di store, dikelompokkan per `toko_nama` |
| Kontak | `wa.me` dari `buildWhatsAppTokoUrl()`; nomor kosong → "Nomor belum diatur" |
| Nomor | Mengikuti Profil Toko penjual; perubahan nomor langsung terlihat di sini |

---

*Dokumen ini adalah spesifikasi UI **target** untuk MadangLur.
Status implementasi demo ada di `STATUS.md`; perubahan desain target harus diperbarui
di sini sebelum diimplementasikan.*
