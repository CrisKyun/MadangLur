/**
 * ui.js — semua fungsi render (string HTML) dan helper presentasi.
 * Tidak menyentuh state; menerima data dari store/main.
 */

import {
  LABEL_STOK,
  filterProduk,
  sortProduk,
  stokStatus,
} from './products.js'

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

/** Produk yang lolos filter + urutan aktif. */
export function produkTampil(state) {
  return sortProduk(filterProduk(state.products, state.filters), state.filters.sort)
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
      ${Object.values(KATEGORI_EMOJI)
        .map((emoji) => `<span class="hero-sel">${emoji}</span>`)
        .join('')}
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
  } else if (!produk.toko_nomor_wa) {
    aksi = '<button class="btn-wa" type="button" disabled>WA belum diatur</button>'
  } else {
    const teks = encodeURIComponent(
      `Halo, saya ingin memesan ${produk.nama} dari ${produk.toko_nama}`,
    )
    const href = `https://wa.me/${produk.toko_nomor_wa}?text=${teks}`
    aksi = `<a class="btn-wa" href="${escapeHtml(href)}" target="_blank" rel="noopener">📱 Pesan via WA</a>`
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

export function renderCatalog(state) {
  if (state.status === 'loading' || state.status === 'idle') {
    return '<p class="state state-loading">Memuat produk…</p>'
  }

  if (state.status === 'error') {
    return `<p class="state state-empty" role="alert">${escapeHtml(state.error)}</p>`
  }

  const daftar = produkTampil(state)

  if (daftar.length === 0) {
    return `
      <div class="state state-empty">
        <span aria-hidden="true">🔍</span>
        <p>Tidak ada produk yang sesuai</p>
      </div>
    `
  }

  return daftar.map(renderCard).join('')
}
