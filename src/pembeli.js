/**
 * pembeli.js — halaman #/pembeli untuk akun berperan pembeli.
 *
 * Pembeli tidak mengelola produk. Halaman ini merangkum akun dan menampilkan
 * daftar toko beserta nomor WhatsApp yang bisa dihubungi. Nomor diambil dari
 * produk, yang disinkronkan dari Profil Toko penjual, sehingga perubahan nomor
 * oleh penjual langsung terlihat di katalog dan di halaman ini.
 */

import { buildWhatsAppTokoUrl, getState } from './store.js'
import { escapeHtml, tampilkanNomor } from './ui.js'

/** Akun pembeli yang sedang masuk. */
let akunAktif = null

export function mountPembeli(root, sesi) {
  akunAktif = sesi ?? null

  root.innerHTML = `
    <section class="dash" aria-labelledby="pembeli-title">
      <div class="dash-head">
        <div>
          <p class="dash-eyebrow">Masuk sebagai @${escapeHtml(akunAktif?.username ?? 'pembeli')} · Pembeli</p>
          <h1 class="dash-title" id="pembeli-title">Akun Pembeli</h1>
          <p class="dash-sub">
            Akun pembeli tidak memiliki toko. Gunakan halaman ini untuk melihat
            daftar toko dan nomor WhatsApp yang bisa dihubungi. Nomor mengikuti
            profil toko yang diatur penjualnya.
          </p>
        </div>
        <a class="btn-add" href="#/">Jelajahi Katalog</a>
      </div>
      <div id="pembeli-body"></div>
    </section>
  `

  updatePembeli(root)
}

/** Dipanggil subscriber store saat data produk berubah. */
export function updatePembeli(root) {
  const body = root.querySelector('#pembeli-body')
  if (body) body.innerHTML = renderBody(getState())
}

/**
 * Kelompokkan produk per toko (nama toko), dengan nomor WA terakhir yang
 * tersimpan pada produk toko tersebut.
 */
export function daftarToko(products) {
  const peta = new Map()

  for (const produk of products) {
    const nama = String(produk.toko_nama ?? '').trim() || 'Toko tanpa nama'
    const kunci = nama.toLowerCase()
    const nomor = String(produk.toko_nomor_wa ?? '').trim()

    const toko = peta.get(kunci) ?? {
      nama,
      nomor: '',
      jumlah: 0,
      tersedia: 0,
      kategori: new Set(),
    }

    toko.jumlah += 1
    if (Number(produk.stok) > 0) toko.tersedia += 1
    toko.kategori.add(produk.kategori)
    if (nomor !== '') toko.nomor = nomor

    peta.set(kunci, toko)
  }

  return [...peta.values()]
    .map((toko) => ({ ...toko, kategori: toko.kategori.size }))
    .sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
}

function renderBody(state) {
  if (state.status !== 'ready') {
    return '<p class="state state-loading">Memuat data toko…</p>'
  }

  const toko = daftarToko(state.products)
  const denganNomor = toko.filter((item) => item.nomor !== '').length

  const stat = [
    ['Toko Terdaftar', toko.length],
    ['Produk di Katalog', state.products.length],
    ['Produk Tersedia', state.products.filter((produk) => Number(produk.stok) > 0).length],
    ['Toko dengan WA', denganNomor],
  ]

  return `
    <section class="profile-card" aria-labelledby="info-pembeli">
      <div class="profile-head">
        <div>
          <h2 id="info-pembeli">Informasi Akun</h2>
          <p class="profile-sub">
            Akun pembeli hanya dapat menjelajah katalog dan menghubungi penjual.
            Untuk berjualan, keluar lalu daftar akun baru sebagai penjual.
          </p>
        </div>
      </div>
      <dl class="buyer-info">
        <div>
          <dt>Username</dt>
          <dd>@${escapeHtml(akunAktif?.username ?? '-')}</dd>
        </div>
        <div>
          <dt>Peran</dt>
          <dd><span class="role-pill role-pembeli">Pembeli</span></dd>
        </div>
        <div>
          <dt>Status akun</dt>
          <dd><span class="status-badge status-aktif">Aktif</span></dd>
        </div>
      </dl>
    </section>
    <div class="stat-row">
      ${stat
        .map(
          ([label, nilai]) => `
            <div class="stat-card">
              <span class="stat-label">${label}</span>
              <span class="stat-value">${nilai}</span>
            </div>`,
        )
        .join('')}
    </div>
    <div class="table-card">
      <div class="table-head">
        <h2>Daftar Toko &amp; Nomor WhatsApp</h2>
        <p class="catalog-count">${toko.length} toko</p>
      </div>
      ${renderTable(toko)}
    </div>
  `
}

function renderTable(toko) {
  if (toko.length === 0) {
    return `
      <div class="empty-row">
        <p>Belum ada toko di katalog.</p>
        <p class="empty-hint">Toko muncul setelah penjual menambahkan produk.</p>
      </div>
    `
  }

  const baris = toko
    .map((item) => {
      const href = buildWhatsAppTokoUrl(item.nomor, item.nama)
      const nomor = tampilkanNomor(item.nomor) || '—'
      const kontak = href
        ? `<a class="btn-wa btn-wa-sm" href="${escapeHtml(href)}" target="_blank" rel="noopener">📱 Chat</a>`
        : '<span class="text-muted">Nomor belum diatur</span>'

      return `
        <tr>
          <td class="td-name">${escapeHtml(item.nama)}</td>
          <td class="kontak-nomor">${escapeHtml(nomor)}</td>
          <td>${item.jumlah} produk</td>
          <td>${item.tersedia} tersedia</td>
          <td>${kontak}</td>
        </tr>
      `
    })
    .join('')

  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Toko</th>
            <th scope="col">Nomor WhatsApp</th>
            <th scope="col">Produk</th>
            <th scope="col">Stok</th>
            <th scope="col">Kontak</th>
          </tr>
        </thead>
        <tbody>${baris}</tbody>
      </table>
    </div>
  `
}
