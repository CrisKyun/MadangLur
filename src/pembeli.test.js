import { describe, expect, it } from 'vitest'
import { daftarToko } from './pembeli.js'
import { buildWhatsAppTokoUrl } from './store.js'

const PRODUK = [
  {
    nama: 'Es B',
    toko_nama: 'Toko B',
    toko_nomor_wa: '628111111111',
    kategori: 'Minuman',
    stok: 3,
  },
  {
    nama: 'Es A',
    toko_nama: 'Toko A',
    toko_nomor_wa: '628222222222',
    kategori: 'Minuman',
    stok: 0,
  },
  {
    nama: 'Kue B',
    toko_nama: 'toko b',
    toko_nomor_wa: '628333333333',
    kategori: 'Jajanan Pasar',
    stok: 1,
  },
]

describe('pengelompokan toko di halaman pembeli', () => {
  it('menggabungkan nama toko tanpa membedakan huruf besar/kecil', () => {
    expect(daftarToko(PRODUK).map((toko) => toko.nama)).toEqual([
      'Toko A',
      'Toko B',
    ])
  })

  it('menghitung jumlah produk, stok tersedia, dan kategori per toko', () => {
    const tokoB = daftarToko(PRODUK).find((toko) => toko.nama === 'Toko B')

    expect(tokoB.jumlah).toBe(2)
    expect(tokoB.tersedia).toBe(2)
    expect(tokoB.kategori).toBe(2)
  })

  it('memakai nomor WA terakhir yang tidak kosong untuk tautan chat', () => {
    const tokoB = daftarToko(PRODUK).find((toko) => toko.nama === 'Toko B')

    expect(tokoB.nomor).toBe('628333333333')
    expect(buildWhatsAppTokoUrl(tokoB.nomor, tokoB.nama)).toContain(
      'https://wa.me/628333333333',
    )
  })

  it('toko tanpa nomor tetap tampil dengan nomor kosong', () => {
    const [toko] = daftarToko([
      {
        nama: 'Wedang',
        toko_nama: 'Tanpa Nomor',
        toko_nomor_wa: '',
        kategori: 'Minuman',
        stok: 2,
      },
    ])

    expect(toko.nomor).toBe('')
    expect(buildWhatsAppTokoUrl(toko.nomor, toko.nama)).toBeNull()
  })
})
