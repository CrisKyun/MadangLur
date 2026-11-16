/**
 * products.js — data & aturan domain produk.
 *
 * KATEGORI mengikuti enum PostgreSQL di SPEC §5.2.
 * DEMO_PRODUCTS hanya placeholder sementara agar UI bisa dirender sebelum
 * API tersedia; dihapus saat GET /api/produk dipakai (M2).
 */

export const KATEGORI = [
  'Jajanan Pasar',
  'Minuman',
  'Sambal & Bumbu',
  'Oleh-oleh Kering',
  'Makanan Berat',
]

/** Batas stok menipis sesuai UI-SPEC §3.3. */
export const STOK_MENIPIS = 5

export const LABEL_STOK = {
  tersedia: 'Tersedia',
  menipis: 'Stok Menipis',
  habis: 'Habis',
}

/** 8 produk seed SPEC §5.3 (tanpa created_at; id sementara, bukan UUID). */
export const DEMO_PRODUCTS = [
  {
    id: 'rujak-soto-banyuwangi',
    nama: 'Rujak Soto Banyuwangi',
    kategori: 'Makanan Berat',
    harga: 18000,
    stok: 20,
    unggulan: true,
    toko_nama: 'Toko Osing Jaya',
    toko_nomor_wa: '6281200000001',
  },
  {
    id: 'pecel-pitik',
    nama: 'Pecel Pitik',
    kategori: 'Makanan Berat',
    harga: 25000,
    stok: 8,
    unggulan: true,
    toko_nama: 'Toko Osing Jaya',
    toko_nomor_wa: '6281200000001',
  },
  {
    id: 'kopi-osing-robusta',
    nama: 'Kopi Osing Robusta',
    kategori: 'Minuman',
    harga: 35000,
    stok: 50,
    unggulan: true,
    toko_nama: 'Toko Osing Jaya',
    toko_nomor_wa: '6281200000001',
  },
  {
    id: 'wedang-uwuh-rempah',
    nama: 'Wedang Uwuh Rempah',
    kategori: 'Minuman',
    harga: 15000,
    stok: 30,
    unggulan: false,
    toko_nama: 'Toko Osing Jaya',
    toko_nomor_wa: '6281200000001',
  },
  {
    id: 'sambal-matah-kemasan',
    nama: 'Sambal Matah Kemasan',
    kategori: 'Sambal & Bumbu',
    harga: 22000,
    stok: 5,
    unggulan: false,
    toko_nama: 'Warung Blambangan',
    toko_nomor_wa: '6281200000002',
  },
  {
    id: 'kerupuk-ikan-blambangan',
    nama: 'Kerupuk Ikan Blambangan',
    kategori: 'Oleh-oleh Kering',
    harga: 20000,
    stok: 0,
    unggulan: false,
    toko_nama: 'Warung Blambangan',
    toko_nomor_wa: '6281200000002',
  },
  {
    id: 'getuk-lindri-banyuwangi',
    nama: 'Getuk Lindri Banyuwangi',
    kategori: 'Jajanan Pasar',
    harga: 12000,
    stok: 15,
    unggulan: false,
    toko_nama: 'Warung Blambangan',
    toko_nomor_wa: '6281200000002',
  },
  {
    id: 'lapis-legit-osing',
    nama: 'Lapis Legit Osing',
    kategori: 'Jajanan Pasar',
    harga: 45000,
    stok: 3,
    unggulan: true,
    toko_nama: 'Warung Blambangan',
    toko_nomor_wa: '6281200000002',
  },
]

/**
 * Status stok 3 level (UI-SPEC §3.3).
 * @param {number} stok
 * @returns {'tersedia'|'menipis'|'habis'}
 */
export function stokStatus(stok) {
  if (!Number.isFinite(stok) || stok <= 0) return 'habis'
  return stok <= STOK_MENIPIS ? 'menipis' : 'tersedia'
}

/**
 * Filter daftar produk berdasarkan kata kunci nama + pill kategori.
 * Teks kosong/spasi = semua produk; "Unggulan" memfilter flag unggulan.
 * @param {Array<object>} products
 * @param {{ query?: string, kategori?: string }} [filters]
 */
export function filterProduk(products, { query = '', kategori = 'Semua' } = {}) {
  const kataKunci = query.trim().toLowerCase()

  return products.filter((produk) => {
    const cocokKategori =
      kategori === 'Semua'
        ? true
        : kategori === 'Unggulan'
          ? produk.unggulan === true
          : produk.kategori === kategori

    const cocokKataKunci =
      kataKunci === '' || produk.nama.toLowerCase().includes(kataKunci)

    return cocokKategori && cocokKataKunci
  })
}

/**
 * Urutkan salinan daftar produk (tidak mengubah array asli).
 * @param {Array<object>} products
 * @param {'default'|'nama'|'harga-termurah'|'harga-termahal'|'stok-terbanyak'} [sort]
 */
export function sortProduk(products, sort = 'default') {
  const hasil = [...products]

  switch (sort) {
    case 'nama':
      return hasil.sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
    case 'harga-termurah':
      return hasil.sort((a, b) => a.harga - b.harga)
    case 'harga-termahal':
      return hasil.sort((a, b) => b.harga - a.harga)
    case 'stok-terbanyak':
      return hasil.sort((a, b) => b.stok - a.stok)
    default:
      return hasil
  }
}
