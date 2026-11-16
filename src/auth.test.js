import { beforeEach, describe, expect, it } from 'vitest'
import {
  PESAN_AUTH,
  SESI_KEY,
  buatPenjual,
  daftarAkun,
  masuk,
  muatAkun,
  pastikanAdmin,
} from './auth.js'

const SANDI = 'rahasia123'

beforeEach(() => {
  localStorage.clear()
  pastikanAdmin()
})

describe('login harus cocok dengan peran akun', () => {
  it('menolak akun admin yang masuk lewat peran penjual', async () => {
    const hasil = await masuk({
      username: 'admin',
      sandi: 'Admin123!',
      role: 'penjual',
    })

    expect(hasil.ok).toBe(false)
    expect(hasil.errors.umum).toContain('terdaftar sebagai Admin')
    expect(localStorage.getItem(SESI_KEY)).toBeNull()
  })

  it('menerima admin lewat peran admin dan menyimpan sesi', async () => {
    const hasil = await masuk({
      username: 'admin',
      sandi: 'Admin123!',
      role: 'admin',
    })

    expect(hasil.ok).toBe(true)
    expect(hasil.akun.role).toBe('admin')
    expect(localStorage.getItem(SESI_KEY)).toBe(hasil.akun.id)
  })

  it('menolak login tanpa peran sebelum memeriksa password', async () => {
    const hasil = await masuk({ username: 'admin', sandi: 'Admin123!' })

    expect(hasil.ok).toBe(false)
    expect(hasil.errors.role).toBe(PESAN_AUTH.roleMasuk)
    expect(localStorage.getItem(SESI_KEY)).toBeNull()
  })
})

describe('registrasi publik hanya untuk pembeli', () => {
  it('menolak pendaftaran peran penjual', async () => {
    const hasil = await daftarAkun({
      role: 'penjual',
      username: 'calon_penjual',
      nama_toko: 'Toko Baru',
      nomor_wa: '6281234500009',
      sandi: SANDI,
      sandi2: SANDI,
    })

    expect(hasil.ok).toBe(false)
    expect(hasil.errors.role).toBe(PESAN_AUTH.roleDaftar)
    expect(muatAkun().akun.some((akun) => akun.username === 'calon_penjual')).toBe(false)
  })

  it('mendaftarkan pembeli tanpa field toko dan langsung membuat sesi', async () => {
    const hasil = await daftarAkun({
      username: 'pembeli_uji',
      sandi: SANDI,
      sandi2: SANDI,
    })

    expect(hasil.ok).toBe(true)
    expect(hasil.akun.role).toBe('pembeli')
    expect(hasil.akun.nama_toko).toBe('')
    expect(hasil.akun.nomor_wa).toBe('')
    expect(localStorage.getItem(SESI_KEY)).toBe(hasil.akun.id)
  })
})

describe('admin membuat akun penjual', () => {
  it('membuat penjual dengan profil toko dan penjual bisa masuk lewat peran penjual', async () => {
    const dibuat = await buatPenjual({
      username: 'toko_admin',
      nama_toko: 'Toko dari Admin',
      nomor_wa: '6281234500009',
      sandi: SANDI,
      sandi2: SANDI,
    })

    expect(dibuat.ok).toBe(true)
    expect(dibuat.akun.role).toBe('penjual')
    expect(dibuat.akun.nama_toko).toBe('Toko dari Admin')
    // Admin tetap masuk sebagai admin; pembuatan akun tidak membuat sesi baru.
    expect(localStorage.getItem(SESI_KEY)).toBeNull()

    const login = await masuk({
      username: 'toko_admin',
      sandi: SANDI,
      role: 'penjual',
    })
    expect(login.ok).toBe(true)
    expect(login.akun.role).toBe('penjual')
  })

  it('menolak username duplikat', async () => {
    const hasil = await buatPenjual({
      username: 'admin',
      nama_toko: 'Toko Kembar',
      sandi: SANDI,
      sandi2: SANDI,
    })

    expect(hasil.ok).toBe(false)
    expect(hasil.errors.username).toBe(PESAN_AUTH.usernameDipakai)
  })

  it('menolak nomor WA yang tidak diawali 62 dan password pendek', async () => {
    const nomor = await buatPenjual({
      username: 'toko_nomor',
      nama_toko: 'Toko Nomor',
      nomor_wa: '08123456789',
      sandi: SANDI,
      sandi2: SANDI,
    })
    expect(nomor.ok).toBe(false)
    expect(nomor.errors.nomor_wa).toBe(PESAN_AUTH.nomor)

    const sandi = await buatPenjual({
      username: 'toko_sandi',
      nama_toko: 'Toko Sandi',
      sandi: '123',
      sandi2: '123',
    })
    expect(sandi.ok).toBe(false)
    expect(sandi.errors.sandi).toBe(PESAN_AUTH.sandi)
  })
})
