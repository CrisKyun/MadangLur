import { beforeEach, describe, expect, it } from 'vitest'
import {
  addProduk,
  buildWhatsAppTokoUrl,
  buildWhatsAppUrl,
  getState,
  setState,
  sinkronProfilPenjual,
} from './store.js'
import { STORAGE_KEY } from './storage.js'

const PENJUAL_A = { id: 'user-a', nama_toko: 'Toko A', nomor_wa: '628111111111' }
const PENJUAL_B = { id: 'user-b', nama_toko: 'Toko B', nomor_wa: '628222222222' }

function tambah(nama, toko) {
  const hasil = addProduk(
    { nama, kategori: 'Minuman', harga: 9000, stok: 5 },
    toko,
  )
  expect(hasil.ok).toBe(true)
  return hasil.product
}

beforeEach(() => {
  localStorage.clear()
  setState({ products: [], notice: null, status: 'ready' })
})

describe('nomor WA penjual tersinkron ke produk dan tautan wa.me', () => {
  it('produk baru memakai nomor WA profil penjual', () => {
    const produk = tambah('Es A', PENJUAL_A)

    expect(produk.toko_nomor_wa).toBe(PENJUAL_A.nomor_wa)
    expect(buildWhatsAppUrl(produk.toko_nomor_wa, produk)).toContain(
      'https://wa.me/628111111111',
    )
  })

  it('ganti nomor hanya memperbarui produk milik penjual tersebut', () => {
    tambah('Es A', PENJUAL_A)
    tambah('Es B', PENJUAL_B)

    const jumlah = sinkronProfilPenjual(PENJUAL_A.id, {
      nama_toko: 'Toko A Baru',
      nomor_wa: '628999999999',
    })

    expect(jumlah).toBe(1)
    const [produkA, produkB] = getState().products
    expect(produkA.toko_nomor_wa).toBe('628999999999')
    expect(produkA.toko_nama).toBe('Toko A Baru')
    expect(produkB.toko_nomor_wa).toBe(PENJUAL_B.nomor_wa)
    expect(produkB.toko_nama).toBe(PENJUAL_B.nama_toko)
  })

  it('tautan wa.me dan localStorage memakai nomor terbaru', () => {
    tambah('Es A', PENJUAL_A)
    sinkronProfilPenjual(PENJUAL_A.id, {
      nama_toko: 'Toko A Baru',
      nomor_wa: '628999999999',
    })

    const produk = getState().products[0]
    const teksPesan = `Halo, saya ingin memesan ${produk.nama} dari ${produk.toko_nama}`
    expect(buildWhatsAppUrl(produk.toko_nomor_wa, produk)).toBe(
      `https://wa.me/628999999999?text=${encodeURIComponent(teksPesan)}`,
    )

    const teksChat = 'Halo Toko A Baru, saya menemukan toko Anda di MadangLur.'
    expect(buildWhatsAppTokoUrl(produk.toko_nomor_wa, produk.toko_nama)).toBe(
      `https://wa.me/628999999999?text=${encodeURIComponent(teksChat)}`,
    )

    const tersimpan = JSON.parse(localStorage.getItem(STORAGE_KEY))
    expect(tersimpan[0].toko_nomor_wa).toBe('628999999999')
    expect(tersimpan[0].toko_nama).toBe('Toko A Baru')
  })

  it('tidak memakai nomor demo ketika penjual belum mengisi nomor', () => {
    const produk = tambah('Es Tanpa Nomor', {
      id: 'user-c',
      nama_toko: 'Toko C',
      nomor_wa: '',
    })

    expect(produk.toko_nomor_wa).toBe('')
    expect(buildWhatsAppUrl(produk.toko_nomor_wa, produk)).toBeNull()
    expect(buildWhatsAppTokoUrl(produk.toko_nomor_wa, produk.toko_nama)).toBeNull()
  })
})
