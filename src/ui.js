/**
 * ui.js — semua fungsi render (string HTML) dan helper presentasi.
 * Tidak membaca state dan tidak memfilter data; daftar produk yang sudah
 * difilter diterima dari main.js (hasil store.filterProducts).
 */

import { LABEL_STOK, WHATSAPP_NUMBER, stokStatus } from './products.js'
import { buildWhatsAppUrl } from './store.js'

const KATEGORI_CLASS = {
  'Jajanan Pasar': 'jajanan',
  Minuman: 'minuman',
  'Sambal & Bumbu': 'sambal',
  'Oleh-oleh Kering': 'oleh',
  'Makanan Berat': 'makanan',
}

const KATEGORI_EMOJI = {
  'Jajanan Pasar': '🧆',
  Minuman: '☕',
  'Sambal & Bumbu': '🌶️',
  'Oleh-oleh Kering': '🍘',
  'Makanan Berat': '🍜',
}

/** Urutan pill kategori sesuai UI-SPEC §3.2. */
const PILL_ORDER = [
  'Makanan Berat',
  'Minuman',
  'Sambal & Bumbu',
  'Oleh-oleh Kering',
  'Jajanan Pasar',
]

/** Emoji lokal untuk mozaik hero — pengganti aset gambar berhak cipta (NF-08). */
const HERO_EMOJI = ['🍜', '☕', '🌶️', '🍘', '🧆', '🍵', '🥟', '🍢']

const STATUS_STOK = {
  tersedia: { class: 'stok-ok', label: LABEL_STOK.tersedia },
  menipis: { class: 'stok-low', label: LABEL_STOK.menipis },
  habis: { class: 'stok-habis', label: LABEL_STOK.habis },
}

/** Escape nilai sebelum masuk template HTML (data dari API tidak dipercaya). */
export function escapeHtml(value) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(value ?? '').replace(/[&<>"']/g, (karakter) => map[karakter])
}

export function formatRupiah(angka) {
  return `Rp ${Number(angka).toLocaleString('id-ID')}`
}

export function renderNavbar() {
  return `
    <header class="nav">
      <a class="nav-brand" href="#/">🍛 MadangLur</a>
      <nav class="nav-menu" aria-label="Navigasi utama">
        <a class="nav-btn active" href="#/">Katalog</a>
      </nav>
    </header>
  `
}

export function renderHero(products, status) {
  const siap = status === 'ready'
  const jumlahProduk = siap ? products.length : '—'
  const jumlahToko = siap ? new Set(products.map((p) => p.toko_nama)).size : '—'
  const jumlahKategori = siap ? new Set(products.map((p) => p.kategori)).size : '—'

  return `
    <div class="hero-copy">
      <p class="hero-eyebrow">Kuliner UMKM Banyuwangi</p>
      <h1 class="hero-title" id="hero-title">
        Temukan cita rasa dari <em>dapur tetangga</em>
      </h1>
      <p class="hero-sub">
        Katalog produk makanan dan minuman khas Banyuwangi. Pilih produk,
        lalu hubungi penjual langsung lewat WhatsApp.
      </p>
      <p class="hero-actions">
        <a class="btn-cta" href="#katalog">Lihat katalog →</a>
      </p>
      <dl class="hero-stats">
        <div class="hero-stat">
          <dt>Produk</dt>
          <dd>${jumlahProduk}</dd>
        </div>
        <div class="hero-stat">
          <dt>Toko</dt>
          <dd>${jumlahToko}</dd>
        </div>
        <div class="hero-stat">
          <dt>Kategori</dt>
          <dd>${jumlahKategori}</dd>
        </div>
      </dl>
    </div>
    <div class="hero-mosaic" aria-hidden="true">
      ${HERO_EMOJI.map((emoji) => `<span class="hero-sel">${emoji}</span>`).join('')}
    </div>
  `
}

/**
 * Filter bar statis (UI-SPEC §3.2). id="katalog" menjadi target CTA hero.
 * State aktif pill diatur main.js lewat class + aria-pressed.
 */
export function renderFilterBar() {
  const pills = PILL_ORDER.map((kategori) => {
    const emoji = KATEGORI_EMOJI[kategori]
    return `
      <button type="button" class="pill" data-kategori="${escapeHtml(kategori)}"
        aria-pressed="false">${emoji} ${escapeHtml(kategori)}</button>
    `
  }).join('')

  return `
    <div class="filter-bar" id="katalog" role="search" aria-label="Pencarian dan filter katalog">
      <div class="filter-search">
        <label class="sr-only" for="search-produk">Cari produk</label>
        <span class="filter-icon" aria-hidden="true">🔍</span>
        <input
          id="search-produk"
          type="search"
          placeholder="Cari produk…"
          autocomplete="off"
        />
      </div>
      <div class="filter-pills" role="group" aria-label="Filter kategori">
        <button type="button" class="pill active" data-kategori="Semua"
          aria-pressed="true">Semua</button>
        ${pills}
        <button type="button" class="pill" data-kategori="Unggulan"
          aria-pressed="false">⭐ Unggulan</button>
      </div>
      <div class="filter-sort">
        <label class="sr-only" for="sort-produk">Urutkan produk</label>
        <select id="sort-produk">
          <option value="default">Urutan default</option>
          <option value="nama">Nama A–Z</option>
          <option value="harga-termurah">Harga termurah</option>
          <option value="harga-termahal">Harga termahal</option>
        </select>
      </div>
    </div>
  `
}

function renderCard(produk) {
  const kategoriClass = KATEGORI_CLASS[produk.kategori] ?? 'lainnya'
  const emoji = KATEGORI_EMOJI[produk.kategori] ?? '🍽️'
  const stok = stokStatus(produk.stok)
  const statusStok = STATUS_STOK[stok]

  const badgeUnggulan = produk.unggulan
    ? '<span class="badge-unggulan">★ Unggulan</span>'
    : ''

  let aksi
  if (stok === 'habis') {
    aksi = '<button class="btn-wa" type="button" disabled>Habis</button>'
  } else {
    // Nomor toko diutamakan; WHATSAPP_NUMBER hanya fallback bila kosong.
    const nomor = produk.toko_nomor_wa || WHATSAPP_NUMBER
    const href = buildWhatsAppUrl(nomor, produk)

    aksi = href
      ? `<a class="btn-wa" href="${escapeHtml(href)}" target="_blank" rel="noopener">📱 Pesan via WhatsApp</a>`
      : '<button class="btn-wa" type="button" disabled>WA belum diatur</button>'
  }

  return `
    <article class="card">
      <div class="card-img bg-${kategoriClass}">
        <span class="card-emoji" aria-hidden="true">${emoji}</span>
        ${badgeUnggulan}
      </div>
      <div class="card-body">
        <p class="card-toko">🏪 ${escapeHtml(produk.toko_nama)}</p>
        <h3 class="card-name">${escapeHtml(produk.nama)}</h3>
        <span class="badge kat-${kategoriClass}">${escapeHtml(produk.kategori)}</span>
        <p class="card-price">${formatRupiah(produk.harga)}</p>
        <p class="stok ${statusStok.class}">
          <span class="stok-dot" aria-hidden="true"></span>${statusStok.label}
        </p>
        ${aksi}
      </div>
    </article>
  `
}

/**
 * @param {{ status: string, error: string|null, daftar: Array<object> }} view
 */
export function renderCatalog({ status, error, daftar }) {
  if (status === 'loading' || status === 'idle') {
    return '<p class="state state-loading">Memuat produk…</p>'
  }

  if (status === 'error') {
    return `<p class="state state-empty" role="alert">${escapeHtml(error)}</p>`
  }

  if (daftar.length === 0) {
    return `
      <div class="state state-empty">
        <span aria-hidden="true">🔍</span>
        <p>Tidak ada produk yang sesuai</p>
        <p class="state-hint">Coba kata kunci lain atau ubah filter kategori.</p>
      </div>
    `
  }

  return daftar.map(renderCard).join('')
}
