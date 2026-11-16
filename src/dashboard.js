/**
 * dashboard.js — halaman dashboard penjual (UI-SPEC §5.2, §7.2).
 *
 * Hanya bisa dibuka oleh akun berperan `penjual` (guard di main.js). Setiap
 * penjual hanya melihat produk miliknya (`penjual_id`). Form "Profil Toko"
 * menyimpan nama toko + nomor WhatsApp ke akun lalu menyinkronkan keduanya ke
 * semua produk miliknya, sehingga tautan WhatsApp di katalog otomatis ikut
 * berubah. Data disimpan di localStorage (mode demo).
 */

import { updateProfilPenjual } from './auth.js'
import { KATEGORI } from './products.js'
import {
  addProduk,
  deleteProduk,
  getState,
  importProduk,
  produkMilik,
  ringkasanProduk,
  sinkronProfilPenjual,
  updateProduk,
} from './store.js'
import { eksporProdukJSON } from './storage.js'
import { escapeHtml, formatRupiah, kelasKategori, showToast } from './ui.js'

/** id produk yang sedang diedit; null = mode tambah. */
let editingId = null
/** apakah modal sedang terbuka (mode tambah tetap punya editingId null). */
let modalTerbuka = false
/** akun penjual yang sedang masuk (dipakai untuk atribusi & scoping produk). */
let akunAktif = null

/** Render shell dashboard lalu isi body dari state saat ini. */
export function mountDashboard(root, sesi) {
  editingId = null
  modalTerbuka = false
  akunAktif = sesi ?? null

  const namaToko = escapeHtml(sesi?.nama_toko || 'Dashboard Toko')
  const username = escapeHtml(sesi?.username || 'demo')

  root.innerHTML = `
    <section class="dash" aria-labelledby="dash-title">
      <div class="dash-head">
        <div>
          <p class="dash-eyebrow">Masuk sebagai @${username} · Penjual</p>
          <h1 class="dash-title" id="dash-title">${namaToko}</h1>
          <p class="dash-sub">
            Kelola produk toko Anda. Produk baru tercatat atas nama toko Anda,
            dan nomor WhatsApp di katalog mengikuti profil toko.
            Perubahan disimpan di <code>localStorage</code> (mode demo).
          </p>
        </div>
        <button type="button" class="btn-add" data-action="add">+ Tambah Produk</button>
      </div>
      <div class="dash-tools">
        <button type="button" class="btn-tool" data-action="export">Export JSON</button>
        <button type="button" class="btn-tool" data-action="import">Import JSON</button>
        <input type="file" id="input-import" accept="application/json,.json" hidden />
      </div>
      <div id="dash-body"></div>
      <div id="modal-root"></div>
    </section>
  `

  // Listener dipasang pada elemen .dash, bukan pada mainEl. Saat route
  // berganti, elemen ini ikut dibuang sehingga listener tidak menumpuk.
  const dash = root.querySelector('.dash')
  dash.querySelector('#dash-body').innerHTML = renderBody(getState())
  bindEvents(dash)
}

/** Dipanggil subscriber store saat data produk berubah. */
export function updateDashboard(root) {
  const body = root.querySelector('#dash-body')
  if (body) body.innerHTML = renderBody(getState())
}

function renderBody(state) {
  const products = produkMilik(state.products, akunAktif?.id)
  const ringkasan = ringkasanProduk(products)

  const stat = [
    ['Total Produk', ringkasan.totalProduk],
    ['Total Stok', ringkasan.totalStok],
    ['Kategori Aktif', ringkasan.kategoriAktif],
    ['Produk Unggulan', ringkasan.totalUnggulan],
  ]

  return `
    ${renderProfil(akunAktif)}
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
        <h2>Daftar Produk Toko Anda</h2>
        <p class="catalog-count">${products.length} produk</p>
      </div>
      ${renderTable(products)}
    </div>
  `
}

function renderProfil(akun) {
  return `
    <section class="profile-card" aria-labelledby="profil-title">
      <div class="profile-head">
        <div>
          <h2 id="profil-title">Profil Toko</h2>
          <p class="profile-sub">
            Nama toko dan nomor WhatsApp ini dipakai semua produk Anda. Nomor
            yang tersimpan di sini menjadi nomor yang dihubungi pembeli: tombol
            WhatsApp di katalog dan daftar toko halaman pembeli otomatis
            mengikuti nomor ini setelah disimpan.
          </p>
        </div>
      </div>
      <form id="form-profil" class="profile-form" novalidate>
        <div class="profile-grid">
          <div class="form-field">
            <label for="p-nama-toko">Nama Toko</label>
            <input id="p-nama-toko" name="nama_toko" type="text" maxlength="40"
              value="${escapeHtml(akun?.nama_toko ?? '')}" required />
          </div>
          <div class="form-field">
            <label for="p-nomor">Nomor WhatsApp</label>
            <input id="p-nomor" name="nomor_wa" type="tel" inputmode="numeric"
              value="${escapeHtml(akun?.nomor_wa ?? '')}" placeholder="6281234500001" />
          </div>
        </div>
        <p class="profile-hint">
          Format: <code>62</code> diikuti nomor tanpa spasi, tanda <code>+</code>,
          atau tanda hubung. Contoh: <code>6281234500001</code>. Bila nomor
          kosong, tombol WhatsApp produk Anda nonaktif di katalog.
        </p>
        <div class="profile-actions">
          <button type="submit" class="btn-save">Simpan Profil</button>
        </div>
      </form>
    </section>
  `
}

function renderTable(products) {
  if (products.length === 0) {
    return `
      <div class="empty-row">
        <p>Belum ada produk milik toko Anda.</p>
        <p class="empty-hint">
          Produk contoh di katalog bersifat publik dan tidak dapat diedit dari
          dashboard. Tambahkan produk pertama Anda dengan tombol di atas.
        </p>
      </div>
    `
  }

  const baris = products
    .map((produk) => {
      const kelas = kelasKategori(produk.kategori)
      const stok =
        Number(produk.stok) <= 0
          ? '<span class="text-habis">Habis</span>'
          : escapeHtml(produk.stok)

      return `
        <tr>
          <td class="td-name">${escapeHtml(produk.nama)}</td>
          <td><span class="badge kat-${kelas}">${escapeHtml(produk.kategori)}</span></td>
          <td class="td-price">${formatRupiah(produk.harga)}</td>
          <td>${stok}</td>
          <td>${produk.unggulan ? '<span class="td-star">★</span>' : '—'}</td>
          <td>
            <div class="td-actions">
              <button type="button" class="btn-edit" data-action="edit" data-id="${escapeHtml(produk.id)}">Edit</button>
              <button type="button" class="btn-del" data-action="delete" data-id="${escapeHtml(produk.id)}">Hapus</button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Nama Produk</th>
            <th scope="col">Kategori</th>
            <th scope="col">Harga</th>
            <th scope="col">Stok</th>
            <th scope="col">Unggulan</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody>${baris}</tbody>
      </table>
    </div>
  `
}

function renderModal(produk) {
  const nilai = (value) => escapeHtml(value ?? '')
  const opsi = KATEGORI.map(
    (kategori) =>
      `<option value="${escapeHtml(kategori)}"${produk?.kategori === kategori ? ' selected' : ''}>${escapeHtml(kategori)}</option>`,
  ).join('')

  return `
    <div class="modal-overlay" data-action="overlay">
      <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head">
          <h2 id="modal-title">${produk ? 'Edit Produk' : 'Tambah Produk'}</h2>
          <button type="button" class="modal-close" data-action="close-modal" aria-label="Tutup">✕</button>
        </div>
        <form id="form-produk" class="modal-form" novalidate>
          <div class="form-field">
            <label for="f-nama">Nama Produk</label>
            <input id="f-nama" name="nama" type="text" value="${nilai(produk?.nama)}" required />
          </div>
          <div class="form-row">
            <div class="form-field">
              <label for="f-kategori">Kategori</label>
              <select id="f-kategori" name="kategori" required>
                <option value=""${produk ? '' : ' selected'}>Pilih kategori</option>
                ${opsi}
              </select>
            </div>
            <div class="form-field">
              <label for="f-stok">Stok</label>
              <input id="f-stok" name="stok" type="number" min="0" step="1"
                value="${produk ? nilai(produk.stok) : ''}" required />
            </div>
          </div>
          <div class="form-field">
            <label for="f-harga">Harga (Rp)</label>
            <input id="f-harga" name="harga" type="number" min="0"
              value="${produk ? nilai(produk.harga) : ''}" required />
          </div>
          <div class="form-field">
            <label for="f-deskripsi">Deskripsi</label>
            <textarea id="f-deskripsi" name="deskripsi" maxlength="300" rows="3">${nilai(produk?.deskripsi)}</textarea>
          </div>
          <label class="form-check">
            <input type="checkbox" name="unggulan"${produk?.unggulan ? ' checked' : ''} />
            Produk unggulan
          </label>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" data-action="close-modal">Batal</button>
            <button type="submit" class="btn-save">Simpan Produk</button>
          </div>
        </form>
      </div>
    </div>
  `
}

function openModal(root, produk) {
  editingId = produk?.id ?? null
  modalTerbuka = true
  root.querySelector('#modal-root').innerHTML = renderModal(produk)
  root.querySelector('#f-nama')?.focus()
}

function closeModal(root) {
  editingId = null
  modalTerbuka = false
  const modal = root.querySelector('#modal-root')
  if (modal) modal.innerHTML = ''
}

function produkSendiri() {
  return produkMilik(getState().products, akunAktif?.id)
}

function hapus(id) {
  const produk = produkSendiri().find((item) => item.id === id)
  if (!produk) return

  const setuju = window.confirm(
    `Hapus produk "${produk.nama}"? Tindakan ini tidak bisa dibatalkan.`,
  )
  if (!setuju) return

  if (deleteProduk(id, akunAktif?.id)) {
    showToast('Produk dihapus.', 'info')
  }
}

function ekspor() {
  const username = String(akunAktif?.username ?? 'penjual').replace(/[^a-z0-9_]/gi, '')
  const blob = new Blob([eksporProdukJSON(produkSendiri())], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `madanglur-produk-${username || 'penjual'}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  showToast('Produk toko Anda diekspor.', 'success')
}

async function imporBerkas(input) {
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  let data
  try {
    data = JSON.parse(await file.text())
  } catch {
    showToast('Impor gagal: file bukan JSON yang valid.', 'error')
    return
  }

  const hasil = importProduk(data, akunAktif ?? {})

  if (!hasil.ok) {
    showToast(`Impor gagal: ${hasil.error}`, 'error')
    return
  }

  showToast(`${hasil.jumlah} produk berhasil diimpor untuk toko Anda.`, 'success')
}

/**
 * Simpan profil toko: update akun dulu, lalu sinkronkan nama + nomor ke semua
 * produk milik penjual agar tautan WhatsApp katalog ikut berubah.
 */
function simpanProfil(root, form) {
  const data = new FormData(form)
  const input = {
    nama_toko: data.get('nama_toko') ?? '',
    nomor_wa: data.get('nomor_wa') ?? '',
  }

  const hasil = updateProfilPenjual(akunAktif?.id, input)
  if (!hasil.ok) {
    const [field, pesan] = Object.entries(hasil.errors)[0]
    showToast(pesan, 'error')
    form.querySelector(`[name="${field}"]`)?.focus()
    return
  }

  akunAktif = hasil.akun
  const jumlahProduk = sinkronProfilPenjual(akunAktif.id, akunAktif)

  const judul = root.querySelector('#dash-title')
  if (judul) judul.textContent = akunAktif.nama_toko || 'Dashboard Toko'

  updateDashboard(root)
  showToast(
    jumlahProduk > 0
      ? `Profil disimpan. ${jumlahProduk} produk memakai nomor WhatsApp terbaru.`
      : 'Profil toko disimpan.',
    'success',
  )
}

function simpanProduk(root, form) {
  const data = new FormData(form)
  const input = {
    nama: data.get('nama') ?? '',
    kategori: data.get('kategori') ?? '',
    harga: data.get('harga') ?? '',
    stok: data.get('stok') ?? '',
    deskripsi: data.get('deskripsi') ?? '',
    unggulan: data.get('unggulan') === 'on',
  }

  const id = editingId
  const hasil = id
    ? updateProduk(id, input, akunAktif?.id)
    : addProduk(input, akunAktif ?? {})

  if (!hasil.ok) {
    const [field, pesan] = Object.entries(hasil.errors)[0]
    showToast(pesan, 'error')
    form.querySelector(`[name="${field}"]`)?.focus()
    return
  }

  closeModal(root)
  showToast(
    id ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!',
    'success',
  )
}

function bindEvents(root) {
  root.addEventListener('click', (event) => {
    const aksi = event.target.closest('[data-action]')
    if (!aksi) return

    switch (aksi.dataset.action) {
      case 'add':
        openModal(root, null)
        break
      case 'edit': {
        const produk = produkSendiri().find(
          (item) => item.id === aksi.dataset.id,
        )
        if (produk) openModal(root, produk)
        break
      }
      case 'delete':
        hapus(aksi.dataset.id)
        break
      case 'export':
        ekspor()
        break
      case 'import':
        root.querySelector('#input-import')?.click()
        break
      case 'close-modal':
        closeModal(root)
        break
      case 'overlay':
        if (event.target === aksi) closeModal(root)
        break
    }
  })

  root.addEventListener('submit', (event) => {
    if (event.target.matches('#form-produk')) {
      event.preventDefault()
      simpanProduk(root, event.target)
      return
    }

    if (event.target.matches('#form-profil')) {
      event.preventDefault()
      simpanProfil(root, event.target)
    }
  })

  root.addEventListener('change', (event) => {
    if (event.target.id !== 'input-import') return
    void imporBerkas(event.target)
  })

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalTerbuka) closeModal(root)
  })
}
