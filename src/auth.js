/**
 * auth.js — akun & sesi demo MadangLur (tanpa backend).
 *
 * Alur ini adalah pengganti sementara untuk target SPEC (Express + Supabase +
 * JWT). Akun disimpan di localStorage dan password di-hash dengan SHA-256 +
 * salt acak memakai Web Crypto. Ini BUKAN keamanan produksi: data berada di
 * browser pengguna dan dapat dibaca/dimodifikasi. Saat backend tersedia,
 * ganti modul ini dengan `POST /api/auth/login` + verifikasi JWT.
 *
 * Peran demo: penjual, pembeli, admin. Registrasi publik hanya boleh membuat
 * penjual/pembeli; akun admin disiapkan otomatis oleh `pastikanAdmin()`.
 */

import { POLA_NOMOR_WA } from './products.js'

export const AKUN_KEY = 'madanglur:users:v1'
export const SESI_KEY = 'madanglur:session:v1'

/** Peran yang dikenal aplikasi. */
export const PERAN = ['penjual', 'pembeli', 'admin']

/** Peran yang boleh dibuat lewat form registrasi publik. */
export const PERAN_PUBLIK = ['penjual', 'pembeli']

export const LABEL_PERAN = {
  penjual: 'Penjual',
  pembeli: 'Pembeli',
  admin: 'Admin',
}

/**
 * Akun admin demo dari SPEC §3. Salt + hash dihitung sekali (SHA-256) agar
 * seeding tidak bergantung pada Web Crypto yang asinkron.
 */
const ADMIN_SEED = {
  id: 'user-admin',
  username: 'admin',
  role: 'admin',
  aktif: true,
  nama_toko: 'Admin MadangLur',
  nomor_wa: '',
  sandi_salt: 'madanglur-admin-seed',
  sandi_hash: '6ca8286eaf83bdfecf8e6f957cea43d720d26ab4aecdf343b136489dd2ecaa66',
  dibuat: '2026-01-01T00:00:00.000Z',
}

export const PESAN_AUTH = {
  username: 'Username 3–20 karakter: huruf, angka, atau garis bawah.',
  usernameKosong: 'Username wajib diisi.',
  usernameDipakai: 'Username sudah digunakan.',
  role: 'Pilih peran Penjual atau Pembeli.',
  roleAdmin: 'Akun admin tidak dapat didaftarkan dari halaman ini.',
  namaToko: 'Nama toko minimal 2 karakter.',
  namaTokoPanjang: 'Nama toko maksimal 40 karakter.',
  nomor: 'Nomor WA harus diawali 62, mis. 6281234500001.',
  sandi: 'Password minimal 6 karakter.',
  sandiPanjang: 'Password maksimal 72 karakter.',
  sandiKosong: 'Password wajib diisi.',
  sandiCocok: 'Konfirmasi password tidak cocok.',
  loginSalah: 'Username atau password salah.',
  nonaktif: 'Akun Anda dinonaktifkan. Hubungi admin.',
  akunRusak: 'Data akun tersimpan tidak valid. Hapus key madanglur:users:v1 di browser untuk memulai ulang.',
  storage: 'Penyimpanan lokal tidak tersedia; akun tidak dapat disimpan.',
  sesi: 'Gagal menyimpan sesi login. Coba lagi.',
  kripto: 'Browser ini tidak mendukung Web Crypto sehingga akun tidak dapat dibuat.',
  akunTidakAda: 'Akun tidak ditemukan.',
  bukanPenjual: 'Hanya akun penjual yang memiliki profil toko.',
  adminDilindungi: 'Akun admin tidak dapat diubah atau dihapus dari panel ini.',
  tolakAkses: 'Anda tidak memiliki akses ke halaman tersebut.',
}

const POLA_USERNAME = /^[a-z0-9_]{3,20}$/

/** @typedef {'penjual'|'pembeli'|'admin'} Peran */

/**
 * @typedef {object} Akun
 * @property {string} id
 * @property {string} username
 * @property {Peran} role
 * @property {boolean} aktif
 * @property {string} nama_toko
 * @property {string} nomor_wa
 * @property {string} sandi_salt
 * @property {string} sandi_hash
 * @property {string} [dibuat]
 */

function normalisasiUsername(nilai) {
  return String(nilai ?? '').trim().toLowerCase()
}

export function normalisasiNomor(nomor) {
  return String(nomor ?? '').replace(/[\s()+-]/g, '')
}

function publik(akun) {
  return {
    id: akun.id,
    username: akun.username,
    role: akun.role,
    aktif: akun.aktif,
    nama_toko: akun.nama_toko,
    nomor_wa: akun.nomor_wa,
  }
}

function bacaItem(key) {
  try {
    return { status: 'ok', nilai: globalThis.localStorage?.getItem(key) ?? null }
  } catch {
    return { status: 'unavailable', nilai: null }
  }
}

function tulisItem(key, nilai) {
  try {
    globalThis.localStorage.setItem(key, nilai)
    return true
  } catch {
    return false
  }
}

function hapusItem(key) {
  try {
    globalThis.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

function tulisAkun(daftar) {
  return tulisItem(AKUN_KEY, JSON.stringify(daftar))
}

/**
 * Normalisasi satu akun tersimpan. Data lama tanpa `role`/`aktif` dianggap
 * penjual aktif agar pengguna demo versi sebelumnya tidak kehilangan akun.
 * @returns {Akun|null}
 */
function normalisasiAkunTersimpan(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null
  if (typeof item.id !== 'string' || item.id === '') return null
  if (typeof item.username !== 'string' || item.username === '') return null
  if (typeof item.nama_toko !== 'string') return null
  if (typeof item.nomor_wa !== 'string') return null
  if (typeof item.sandi_salt !== 'string' || item.sandi_salt === '') return null
  if (typeof item.sandi_hash !== 'string' || item.sandi_hash === '') return null
  if (item.dibuat !== undefined && typeof item.dibuat !== 'string') return null

  const role = item.role === undefined ? 'penjual' : item.role
  if (!PERAN.includes(role)) return null

  const aktif = item.aktif === undefined ? true : item.aktif
  if (typeof aktif !== 'boolean') return null

  return { ...item, role, aktif }
}

function validasiAkunTersimpan(data) {
  if (!Array.isArray(data)) return null

  const hasil = []
  const usernameTerpakai = new Set()
  const idTerpakai = new Set()

  for (const item of data) {
    const akun = normalisasiAkunTersimpan(item)
    if (!akun) return null
    if (usernameTerpakai.has(akun.username)) return null
    if (idTerpakai.has(akun.id)) return null

    usernameTerpakai.add(akun.username)
    idTerpakai.add(akun.id)
    hasil.push(akun)
  }

  return hasil
}

/**
 * Baca daftar akun beserta status penyimpanan.
 * @returns {{ status: 'ok'|'empty'|'corrupt'|'unavailable', akun: Akun[] }}
 */
export function muatAkun() {
  const baca = bacaItem(AKUN_KEY)
  if (baca.status === 'unavailable') return { status: 'unavailable', akun: [] }
  if (baca.nilai === null) return { status: 'empty', akun: [] }

  let data
  try {
    data = JSON.parse(baca.nilai)
  } catch {
    return { status: 'corrupt', akun: [] }
  }

  const akun = validasiAkunTersimpan(data)
  if (!akun) return { status: 'corrupt', akun: [] }

  return { status: akun.length === 0 ? 'empty' : 'ok', akun }
}

/**
 * Pastikan akun admin demo selalu ada. Dipanggil sekali saat aplikasi mulai.
 * Tidak menimpa akun admin yang sudah ada dan tidak menyentuh data rusak.
 * @returns {{ ok: boolean, dibuat?: boolean, alasan?: string }}
 */
export function pastikanAdmin() {
  const baca = muatAkun()

  if (baca.status === 'unavailable') return { ok: false, alasan: 'unavailable' }
  if (baca.status === 'corrupt') return { ok: false, alasan: 'corrupt' }

  if (baca.akun.some((akun) => akun.username === ADMIN_SEED.username)) {
    return { ok: true, dibuat: false }
  }

  if (!tulisAkun([...baca.akun, { ...ADMIN_SEED }])) {
    return { ok: false, alasan: 'unavailable' }
  }

  return { ok: true, dibuat: true }
}

/**
 * Validasi form daftar (fungsi murni; tidak menyentuh storage).
 * Registrasi publik hanya menerima peran penjual/pembeli. Field toko hanya
 * divalidasi/disimpan untuk penjual.
 * @param {{ username?: string, role?: string, nama_toko?: string, nomor_wa?: string, sandi?: string, sandi2?: string }} input
 */
export function validateDaftar(input = {}) {
  const errors = {}

  const role = String(input.role ?? 'penjual').trim().toLowerCase()
  if (!PERAN_PUBLIK.includes(role)) {
    errors.role = role === 'admin' ? PESAN_AUTH.roleAdmin : PESAN_AUTH.role
  }

  const username = normalisasiUsername(input.username)
  if (!POLA_USERNAME.test(username)) errors.username = PESAN_AUTH.username

  const penjual = role === 'penjual'
  const namaToko = penjual ? String(input.nama_toko ?? '').trim() : ''
  if (penjual) {
    if (namaToko.length < 2) errors.nama_toko = PESAN_AUTH.namaToko
    else if (namaToko.length > 40) errors.nama_toko = PESAN_AUTH.namaTokoPanjang
  }

  const nomor = penjual ? normalisasiNomor(input.nomor_wa) : ''
  if (penjual && nomor !== '' && !POLA_NOMOR_WA.test(nomor)) {
    errors.nomor_wa = PESAN_AUTH.nomor
  }

  const sandi = String(input.sandi ?? '')
  if (sandi.length < 6) errors.sandi = PESAN_AUTH.sandi
  else if (sandi.length > 72) errors.sandi = PESAN_AUTH.sandiPanjang

  if (String(input.sandi2 ?? '') !== sandi) errors.sandi2 = PESAN_AUTH.sandiCocok

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      username,
      role: PERAN_PUBLIK.includes(role) ? role : 'penjual',
      nama_toko: namaToko,
      nomor_wa: nomor,
      sandi,
    },
  }
}

/** Validasi form masuk (fungsi murni). */
export function validateMasuk(input = {}) {
  const errors = {}
  const username = normalisasiUsername(input.username)
  const sandi = String(input.sandi ?? '')

  if (username === '') errors.username = PESAN_AUTH.usernameKosong
  if (sandi === '') errors.sandi = PESAN_AUTH.sandiKosong

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { username, sandi },
  }
}

function hex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function buatSalt() {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  return hex(bytes)
}

function buatId() {
  const acak = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID().slice(0, 8)
    : Math.random().toString(16).slice(2, 10)
  return `user-${acak}`
}

async function hashSandi(sandi, salt) {
  if (!globalThis.crypto?.subtle) throw new Error(PESAN_AUTH.kripto)
  const data = new TextEncoder().encode(`${salt}:${sandi}`)
  const buffer = await globalThis.crypto.subtle.digest('SHA-256', data)
  return hex(new Uint8Array(buffer))
}

/**
 * Daftarkan akun baru lalu langsung membuat sesi.
 * @returns {Promise<{ ok: true, akun: object } | { ok: false, errors: Record<string,string> }>}
 */
export async function daftarAkun(input) {
  const hasil = validateDaftar(input)
  if (!hasil.valid) return { ok: false, errors: hasil.errors }

  const baca = muatAkun()
  if (baca.status === 'corrupt') {
    return { ok: false, errors: { umum: PESAN_AUTH.akunRusak } }
  }
  if (baca.status === 'unavailable') {
    return { ok: false, errors: { umum: PESAN_AUTH.storage } }
  }
  if (baca.akun.some((akun) => akun.username === hasil.data.username)) {
    return { ok: false, errors: { username: PESAN_AUTH.usernameDipakai } }
  }

  const salt = buatSalt()
  let hash
  try {
    hash = await hashSandi(hasil.data.sandi, salt)
  } catch (error) {
    return { ok: false, errors: { umum: error.message } }
  }

  const akun = {
    id: buatId(),
    username: hasil.data.username,
    role: hasil.data.role,
    aktif: true,
    nama_toko: hasil.data.nama_toko,
    nomor_wa: hasil.data.nomor_wa,
    sandi_salt: salt,
    sandi_hash: hash,
    dibuat: new Date().toISOString(),
  }

  if (!tulisAkun([...baca.akun, akun])) {
    return { ok: false, errors: { umum: PESAN_AUTH.storage } }
  }

  // Bila sesi gagal ditulis, kembalikan daftar akun agar pendaftaran bisa diulang.
  if (!tulisItem(SESI_KEY, akun.id)) {
    tulisAkun(baca.akun)
    return { ok: false, errors: { umum: PESAN_AUTH.sesi } }
  }

  return { ok: true, akun: publik(akun) }
}

/**
 * Masuk dengan username + password. Pesan gagal dibuat generik agar tidak
 * membocorkan username mana yang terdaftar.
 * @returns {Promise<{ ok: true, akun: object } | { ok: false, errors: Record<string,string> }>}
 */
export async function masuk(input) {
  const hasil = validateMasuk(input)
  if (!hasil.valid) return { ok: false, errors: hasil.errors }

  const baca = muatAkun()
  if (baca.status === 'corrupt') {
    return { ok: false, errors: { umum: PESAN_AUTH.akunRusak } }
  }
  if (baca.status === 'unavailable') {
    return { ok: false, errors: { umum: PESAN_AUTH.storage } }
  }

  const akun = baca.akun.find((item) => item.username === hasil.data.username)

  let hash
  try {
    hash = await hashSandi(hasil.data.sandi, akun?.sandi_salt ?? 'madanglur-demo')
  } catch (error) {
    return { ok: false, errors: { umum: error.message } }
  }

  if (!akun || hash !== akun.sandi_hash) {
    return { ok: false, errors: { umum: PESAN_AUTH.loginSalah } }
  }

  if (akun.aktif === false) {
    return { ok: false, errors: { umum: PESAN_AUTH.nonaktif } }
  }

  if (!tulisItem(SESI_KEY, akun.id)) {
    return { ok: false, errors: { umum: PESAN_AUTH.sesi } }
  }

  return { ok: true, akun: publik(akun) }
}

/**
 * Sesi aktif (akun publik) atau null. Membaca ulang akun agar perubahan nama
 * toko/nomor langsung terlihat. Akun nonaktif dianggap tidak punya sesi.
 */
export function getSession() {
  const baca = muatAkun()
  if (baca.status !== 'ok') return null

  const sesi = bacaItem(SESI_KEY)
  if (sesi.status !== 'ok' || typeof sesi.nilai !== 'string') return null

  const akun = baca.akun.find((item) => item.id === sesi.nilai)
  if (!akun || akun.aktif === false) return null
  return publik(akun)
}

/** Hapus sesi saja; akun tetap tersimpan. */
export function keluar() {
  return hapusItem(SESI_KEY)
}

/** Cek apakah username sudah dipakai (untuk pesan form). */
export function usernameDipakai(username) {
  const baca = muatAkun()
  if (baca.status !== 'ok') return false
  return baca.akun.some((akun) => akun.username === normalisasiUsername(username))
}

/**
 * Perbarui profil toko penjual (nama toko + nomor WhatsApp).
 * Sinkronisasi ke produk dilakukan oleh store.sinkronProfilPenjual.
 * @param {string} id
 * @param {{ nama_toko?: string, nomor_wa?: string }} input
 * @returns {{ ok: true, akun: object } | { ok: false, errors: Record<string,string> }}
 */
export function updateProfilPenjual(id, input = {}) {
  const baca = muatAkun()
  if (baca.status === 'corrupt') {
    return { ok: false, errors: { umum: PESAN_AUTH.akunRusak } }
  }
  if (baca.status === 'unavailable') {
    return { ok: false, errors: { umum: PESAN_AUTH.storage } }
  }

  const akun = baca.akun.find((item) => item.id === id)
  if (!akun) return { ok: false, errors: { umum: PESAN_AUTH.akunTidakAda } }
  if (akun.role !== 'penjual') {
    return { ok: false, errors: { umum: PESAN_AUTH.bukanPenjual } }
  }

  const errors = {}
  const namaToko = String(input.nama_toko ?? '').trim()
  if (namaToko.length < 2) errors.nama_toko = PESAN_AUTH.namaToko
  else if (namaToko.length > 40) errors.nama_toko = PESAN_AUTH.namaTokoPanjang

  const nomor = normalisasiNomor(input.nomor_wa)
  if (nomor !== '' && !POLA_NOMOR_WA.test(nomor)) errors.nomor_wa = PESAN_AUTH.nomor

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const baru = { ...akun, nama_toko: namaToko, nomor_wa: nomor }
  if (!tulisAkun(baca.akun.map((item) => (item.id === id ? baru : item)))) {
    return { ok: false, errors: { umum: PESAN_AUTH.storage } }
  }

  return { ok: true, akun: publik(baru) }
}

/**
 * Aktif/nonaktifkan akun dari panel admin. Akun admin dilindungi.
 * @returns {{ ok: true, akun: object } | { ok: false, error: string }}
 */
export function setAkunAktif(id, aktif) {
  const baca = muatAkun()
  if (baca.status === 'corrupt') return { ok: false, error: PESAN_AUTH.akunRusak }
  if (baca.status === 'unavailable') return { ok: false, error: PESAN_AUTH.storage }

  const akun = baca.akun.find((item) => item.id === id)
  if (!akun) return { ok: false, error: PESAN_AUTH.akunTidakAda }
  if (akun.role === 'admin') return { ok: false, error: PESAN_AUTH.adminDilindungi }

  const baru = { ...akun, aktif: aktif === true }
  if (!tulisAkun(baca.akun.map((item) => (item.id === id ? baru : item)))) {
    return { ok: false, error: PESAN_AUTH.storage }
  }

  if (baru.aktif === false) {
    const sesi = bacaItem(SESI_KEY)
    if (sesi.status === 'ok' && sesi.nilai === id) hapusItem(SESI_KEY)
  }

  return { ok: true, akun: publik(baru) }
}

/**
 * Hapus akun non-admin dari panel admin. Produk milik penjual dihapus oleh
 * pemanggil (admin.js) agar modul auth tidak bergantung pada store.
 * @returns {{ ok: true, akun: object } | { ok: false, error: string }}
 */
export function hapusAkun(id) {
  const baca = muatAkun()
  if (baca.status === 'corrupt') return { ok: false, error: PESAN_AUTH.akunRusak }
  if (baca.status === 'unavailable') return { ok: false, error: PESAN_AUTH.storage }

  const akun = baca.akun.find((item) => item.id === id)
  if (!akun) return { ok: false, error: PESAN_AUTH.akunTidakAda }
  if (akun.role === 'admin') return { ok: false, error: PESAN_AUTH.adminDilindungi }

  if (!tulisAkun(baca.akun.filter((item) => item.id !== id))) {
    return { ok: false, error: PESAN_AUTH.storage }
  }

  const sesi = bacaItem(SESI_KEY)
  if (sesi.status === 'ok' && sesi.nilai === id) hapusItem(SESI_KEY)

  return { ok: true, akun: publik(akun) }
}
