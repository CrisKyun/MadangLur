/**
 * admin.js — panel admin demo (UI-SPEC §6).
 *
 * Hanya bisa dibuka akun berperan `admin` (guard di main.js). Panel ini
 * menampilkan seluruh akun demo, memungkinkan admin menonaktifkan/mengaktifkan
 * akun penjual/pembeli dan menghapus akun non-admin beserta produk penjualnya.
 * Akun admin bawaan dilindungi. Reset produk contoh juga dipindahkan ke sini.
 */

import {
  LABEL_PERAN,
  hapusAkun,
  muatAkun,
  setAkunAktif,
} from './auth.js'
import { getState, hapusProdukPenjual, resetDemo } from './store.js'
import { escapeHtml, showToast } from './ui.js'

const URUTAN_PERAN = { admin: 0, penjual: 1, pembeli: 2 }

/** Render shell panel admin lalu isi body dari data akun + produk saat ini. */
export function mountAdmin(root, sesi) {
  const username = escapeHtml(sesi?.username || 'admin')

  root.innerHTML = `
    <section class="dash admin" aria-labelledby="admin-title">
      <div class="dash-head">
        <div>
          <p class="dash-eyebrow">Masuk sebagai @${username} · Admin</p>
          <h1 class="dash-title" id="admin-title">Panel Admin</h1>
          <p class="dash-sub">
            Kelola akun penjual dan pembeli demo. Admin dapat menonaktifkan akun
            atau menghapusnya beserta produk penjual terkait. Akun admin bawaan
            tidak dapat diubah dari panel ini.
          </p>
        </div>
        <button type="button" class="btn-tool btn-tool-danger" data-action="reset">
          Reset Produk Demo
        </button>
      </div>
      <div id="admin-body"></div>
    </section>
  `

  const panel = root.querySelector('.admin')
  panel.querySelector('#admin-body').innerHTML = renderBody(getState())
  bindEvents(panel)
}

/** Dipanggil subscriber store saat data produk berubah. */
export function updateAdmin(root) {
  const body = root.querySelector('#admin-body')
  if (body) body.innerHTML = renderBody(getState())
}

function hitungProduk(state, akun) {
  if (akun.role !== 'penjual') return '—'
  const jumlah = state.products.filter(
    (produk) => String(produk.penjual_id ?? '') === akun.id,
  ).length
  return String(jumlah)
}

function renderBody(state) {
  const baca = muatAkun()

  if (baca.status === 'corrupt') {
    return `
      <div class="state state-empty" role="alert">
        <p>Data akun tersimpan tidak valid.</p>
        <p class="state-hint">
          Hapus key <code>madanglur:users:v1</code> di browser lalu muat ulang
          halaman untuk memulai ulang demo.
        </p>
      </div>
    `
  }

  if (baca.status === 'unavailable') {
    return `
      <div class="state state-empty" role="alert">
        <p>Penyimpanan lokal tidak tersedia.</p>
        <p class="state-hint">Panel admin membutuhkan localStorage untuk membaca akun.</p>
      </div>
    `
  }

  const akun = [...baca.akun].sort((a, b) => {
    const peran = (URUTAN_PERAN[a.role] ?? 9) - (URUTAN_PERAN[b.role] ?? 9)
    if (peran !== 0) return peran
    return a.username.localeCompare(b.username, 'id')
  })

  const penjual = akun.filter((item) => item.role === 'penjual')
  const pembeli = akun.filter((item) => item.role === 'pembeli')
  const tokoAktif = penjual.filter((item) => item.aktif).length

  const stat = [
    ['Total Penjual', penjual.length],
    ['Total Pembeli', pembeli.length],
    ['Produk Global', state.products.length],
    ['Toko Aktif', tokoAktif],
  ]

  return `
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
        <h2>Daftar Akun</h2>
        <p class="catalog-count">${akun.length} akun</p>
      </div>
      ${renderTable(state, akun)}
    </div>
  `
}

function renderTable(state, akun) {
  if (akun.length === 0) {
    return '<p class="empty-row">Belum ada akun.</p>'
  }

  const baris = akun
    .map((item) => {
      const status = item.aktif
        ? '<span class="status-badge status-aktif">Aktif</span>'
        : '<span class="status-badge status-nonaktif">Nonaktif</span>'

      const aksi =
        item.role === 'admin'
          ? '<span class="text-muted">Dilindungi</span>'
          : `
              <div class="td-actions">
                <button type="button" class="${item.aktif ? 'btn-deactivate' : 'btn-activate'}"
                  data-action="toggle" data-id="${escapeHtml(item.id)}">
                  ${item.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button type="button" class="btn-del" data-action="delete" data-id="${escapeHtml(item.id)}">Hapus</button>
              </div>
            `

      return `
        <tr>
          <td class="td-name">${escapeHtml(item.username)}</td>
          <td><span class="role-pill role-${item.role}">${escapeHtml(LABEL_PERAN[item.role] ?? item.role)}</span></td>
          <td>${item.nama_toko ? escapeHtml(item.nama_toko) : '—'}</td>
          <td>${item.nomor_wa ? escapeHtml(item.nomor_wa) : '—'}</td>
          <td>${hitungProduk(state, item)}</td>
          <td>${status}</td>
          <td>${aksi}</td>
        </tr>
      `
    })
    .join('')

  return `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Username</th>
            <th scope="col">Peran</th>
            <th scope="col">Nama Toko</th>
            <th scope="col">Nomor WA</th>
            <th scope="col">Produk</th>
            <th scope="col">Status</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody>${baris}</tbody>
      </table>
    </div>
  `
}

function cariAkun(id) {
  const baca = muatAkun()
  if (baca.status !== 'ok') return null
  return baca.akun.find((akun) => akun.id === id) ?? null
}

function toggleAkun(root, id) {
  const akun = cariAkun(id)
  if (!akun) {
    showToast('Akun tidak ditemukan.', 'error')
    return
  }

  const hasil = setAkunAktif(id, !akun.aktif)
  if (!hasil.ok) {
    showToast(hasil.error, 'error')
    return
  }

  updateAdmin(root)
  showToast(
    hasil.akun.aktif
      ? `Akun @${hasil.akun.username} diaktifkan.`
      : `Akun @${hasil.akun.username} dinonaktifkan.`,
    'info',
  )
}

function hapus(root, id) {
  const akun = cariAkun(id)
  if (!akun) {
    showToast('Akun tidak ditemukan.', 'error')
    return
  }

  const setuju = window.confirm(
    `Hapus akun "@${akun.username}" beserta semua produk tokonya? Tindakan ini tidak bisa dibatalkan.`,
  )
  if (!setuju) return

  const hasil = hapusAkun(id)
  if (!hasil.ok) {
    showToast(hasil.error, 'error')
    return
  }

  const jumlahProduk =
    hasil.akun.role === 'penjual' ? hapusProdukPenjual(hasil.akun.id) : 0

  updateAdmin(root)
  showToast(
    jumlahProduk > 0
      ? `Akun @${hasil.akun.username} dan ${jumlahProduk} produknya dihapus.`
      : `Akun @${hasil.akun.username} dihapus.`,
    'info',
  )
}

function resetProduk() {
  const setuju = window.confirm(
    'Reset semua produk ke data contoh? Produk tambahan semua akun akan hilang.',
  )
  if (!setuju) return

  resetDemo()
  showToast('Produk contoh dipulihkan.', 'info')
}

function bindEvents(root) {
  root.addEventListener('click', (event) => {
    const aksi = event.target.closest('[data-action]')
    if (!aksi) return

    switch (aksi.dataset.action) {
      case 'toggle':
        toggleAkun(root, aksi.dataset.id)
        break
      case 'delete':
        hapus(root, aksi.dataset.id)
        break
      case 'reset':
        resetProduk()
        break
    }
  })
}
