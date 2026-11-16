/**
 * auth-page.js — halaman #/masuk dan #/daftar (demo tanpa backend).
 *
 * Form memakai validasi client dari auth.js. Registrasi publik hanya bisa
 * memilih Penjual atau Pembeli; akun admin disiapkan otomatis oleh auth.js.
 * Setelah berhasil, pemanggil (main.js) mengarahkan sesuai peran akun.
 */

import { daftarAkun, masuk } from './auth.js'
import { showToast } from './ui.js'

/** Tampilkan error per field + error umum, lalu fokus ke field pertama. */
function tampilkanError(form, errors) {
  form.querySelectorAll('[data-error]').forEach((el) => {
    el.textContent = ''
    el.classList.remove('is-show')
  })
  form.querySelectorAll('[aria-invalid]').forEach((el) => {
    el.removeAttribute('aria-invalid')
  })

  let pertama = null

  for (const [kunci, pesan] of Object.entries(errors)) {
    const wadah = form.querySelector(`[data-error="${kunci}"]`)
    if (!wadah) continue

    wadah.textContent = pesan
    wadah.classList.add('is-show')

    if (kunci === 'umum') continue
    const input = form.querySelector(`[name="${kunci}"]`)
    if (input) {
      input.setAttribute('aria-invalid', 'true')
      if (!pertama) pertama = input
    }
  }

  pertama?.focus()
}

function setBusy(form, sibuk, label) {
  const tombol = form.querySelector('button[type="submit"]')
  if (!tombol) return
  tombol.disabled = sibuk
  tombol.textContent = sibuk ? 'Memproses…' : label
}

function fieldError(kunci) {
  return `<p class="auth-field-error" data-error="${kunci}" id="e-${kunci}"></p>`
}

function inputAtribut(kunci) {
  return `aria-describedby="e-${kunci}"`
}

function pasangForm(form, proses, labelTombol, onSukses) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const data = new FormData(form)
    tampilkanError(form, {})
    setBusy(form, true, labelTombol)

    let hasil
    try {
      hasil = await proses(data)
    } catch {
      hasil = { ok: false, errors: { umum: 'Terjadi kesalahan. Coba lagi.' } }
    }

    setBusy(form, false, labelTombol)

    if (!hasil.ok) {
      tampilkanError(form, hasil.errors)
      return
    }

    showToast(`Selamat datang, ${hasil.akun.username}!`, 'success')
    onSukses?.(hasil.akun)
  })
}

function kartuAuth(isi) {
  return `
    <section class="auth-wrap">
      <div class="auth-card">
        <p class="auth-emoji" aria-hidden="true">🍛</p>
        ${isi}
        <p class="auth-note">
          Demo lokal: akun dan sesi disimpan di browser ini, bukan di server.
        </p>
      </div>
    </section>
  `
}

export function mountMasuk(root, { onSukses } = {}) {
  root.innerHTML = kartuAuth(`
    <h1 class="auth-title">Masuk ke MadangLur</h1>
    <p class="auth-sub">
      Pilih peran akun Anda. Penjual membuka dashboard toko, pembeli membuka
      akun &amp; katalog, admin membuka panel pengelolaan akun.
    </p>
    <form id="form-masuk" class="auth-form" novalidate>
      <fieldset class="auth-role auth-role-3" aria-describedby="e-role">
        <legend>Masuk sebagai</legend>
        <label class="auth-role-option">
          <input type="radio" name="role" value="penjual" checked />
          <span class="auth-role-body">
            <strong>Penjual</strong>
            <small>Dashboard produk &amp; profil toko</small>
          </span>
        </label>
        <label class="auth-role-option">
          <input type="radio" name="role" value="pembeli" />
          <span class="auth-role-body">
            <strong>Pembeli</strong>
            <small>Katalog &amp; kontak toko</small>
          </span>
        </label>
        <label class="auth-role-option">
          <input type="radio" name="role" value="admin" />
          <span class="auth-role-body">
            <strong>Admin</strong>
            <small>Panel pengelolaan akun</small>
          </span>
        </label>
      </fieldset>
      <p class="auth-field-error" data-error="role" id="e-role"></p>
      <div class="auth-field">
        <label for="a-username">Username</label>
        <input id="a-username" name="username" type="text" autocomplete="username"
          required ${inputAtribut('username')} />
        ${fieldError('username')}
      </div>
      <div class="auth-field">
        <label for="a-sandi">Password</label>
        <input id="a-sandi" name="sandi" type="password" autocomplete="current-password"
          required ${inputAtribut('sandi')} />
        ${fieldError('sandi')}
      </div>
      <p class="auth-alert" data-error="umum" role="alert"></p>
      <button class="btn-auth" type="submit">Masuk</button>
    </form>
    <p class="auth-switch">
      Belum punya akun? <a href="#/daftar">Daftar sekarang</a>
    </p>
    <p class="auth-hint">
      Akun admin bawaan: <code>admin</code> / <code>Admin123!</code> — pilih peran
      Admin saat masuk.
    </p>
  `)

  const form = root.querySelector('#form-masuk')
  pasangForm(
    form,
    (data) => masuk({
      role: data.get('role'),
      username: data.get('username'),
      sandi: data.get('sandi'),
    }),
    'Masuk',
    onSukses,
  )

  root.querySelector('#a-username')?.focus()
}

export function mountDaftar(root, { onSukses } = {}) {
  root.innerHTML = kartuAuth(`
    <h1 class="auth-title">Buat akun pembeli</h1>
    <p class="auth-sub">
      Pendaftaran mandiri hanya untuk pembeli. Ingin berjualan di MadangLur?
      Minta admin membuatkan akun penjual untuk Anda.
    </p>
    <form id="form-daftar" class="auth-form" novalidate>
      <div class="auth-field">
        <label for="a-username">Username</label>
        <input id="a-username" name="username" type="text" autocomplete="username"
          minlength="3" maxlength="20" pattern="[A-Za-z0-9_]{3,20}"
          placeholder="mis. pembeli_osing" required ${inputAtribut('username')} />
        ${fieldError('username')}
      </div>
      <div class="auth-field">
        <label for="a-sandi">Password</label>
        <input id="a-sandi" name="sandi" type="password" autocomplete="new-password"
          minlength="6" maxlength="72" required ${inputAtribut('sandi')} />
        ${fieldError('sandi')}
      </div>
      <div class="auth-field">
        <label for="a-sandi2">Ulangi Password</label>
        <input id="a-sandi2" name="sandi2" type="password" autocomplete="new-password"
          minlength="6" maxlength="72" required ${inputAtribut('sandi2')} />
        ${fieldError('sandi2')}
      </div>
      <p class="auth-alert" data-error="umum" role="alert"></p>
      <button class="btn-auth" type="submit">Daftar &amp; Masuk</button>
    </form>
    <p class="auth-switch">
      Sudah punya akun? <a href="#/masuk">Masuk di sini</a>
    </p>
    <p class="auth-hint">
      Akun penjual dibuat oleh admin dari Panel Admin, bukan dari halaman ini.
    </p>
  `)

  const form = root.querySelector('#form-daftar')

  pasangForm(
    form,
    (data) => daftarAkun({
      role: 'pembeli',
      username: data.get('username'),
      sandi: data.get('sandi'),
      sandi2: data.get('sandi2'),
    }),
    'Daftar & Masuk',
    onSukses,
  )

  root.querySelector('#a-username')?.focus()
}
