/**
 * products.js — data & aturan domain produk.
 *
 * KATEGORI mengikuti enum PostgreSQL di SPEC §5.2.
 * DEMO_PRODUCTS berisi 8 produk fiktif untuk landing page; diganti data API
 * saat GET /api/produk tersedia (M2).
 *
 * Logika filter/sort berada di store.js (filterProducts) agar mudah diuji.
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

/**
 * Nomor WhatsApp pemilik landing page (fiktif).
 * Dipakai sebagai nomor tujuan default bila produk tidak punya nomor toko.
 * Format internasional: 62 + digit, tanpa "+" dan tanpa spasi.
 */
export const WHATSAPP_NUMBER = '6281234500001'

/** 8 produk contoh (fiktif) — nama, toko, dan nomor WA tidak merujuk entitas nyata. */
export const DEMO_PRODUCTS = [
  {
    id: 'nasi-tempong-mbak-nia',
    nama: 'Nasi Tempong Mbak Nia',
    kategori: 'Makanan Berat',
    harga: 22000,
    stok: 18,
    unggulan: true,
    deskripsi: 'Nasi hangat dengan sayur, ikan asin, dan sambal tempong pedas khas Banyuwangi.',
    toko_nama: 'Dapur Mbak Nia',
    toko_nomor_wa: '6281234500001',
  },
  {
    id: 'pecel-kembang-turi',
    nama: 'Pecel Kembang Turi',
    kategori: 'Makanan Berat',
    harga: 15000,
    stok: 4,
    unggulan: false,
    deskripsi: 'Sayur kembang turi rebus disiram bumbu kacang gurih, disajikan dengan peyek.',
    toko_nama: 'Warung Bu Sri',
    toko_nomor_wa: '6281234500002',
  },
  {
    id: 'es-kopi-aren-gendis',
    nama: 'Es Kopi Aren Gendis',
    kategori: 'Minuman',
    harga: 18000,
    stok: 35,
    unggulan: true,
    deskripsi: 'Kopi robusta lokal dengan gula aren cair dan es batu, manisnya pas.',
    toko_nama: 'Kedai Gendis',
    toko_nomor_wa: '6281234500003',
  },
  {
    id: 'wedang-jahe-serai',
    nama: 'Wedang Jahe Serai',
    kategori: 'Minuman',
    harga: 12000,
    stok: 0,
    unggulan: false,
    deskripsi: 'Jahe bakar dan serai segar diseduh gula batu, hangat dan tidak terlalu manis.',
    toko_nama: 'Kedai Gendis',
    toko_nomor_wa: '6281234500003',
  },
  {
    id: 'tahu-walik-crispy',
    nama: 'Tahu Walik Crispy',
    kategori: 'Jajanan Pasar',
    harga: 10000,
    stok: 25,
    unggulan: false,
    deskripsi: 'Tahu goreng renyah berisi adonan aci, cocok dicocol sambal kecap.',
    toko_nama: 'Warung Bu Sri',
    toko_nomor_wa: '6281234500002',
  },
  {
    id: 'keripik-tempe-daun-jeruk',
    nama: 'Keripik Tempe Daun Jeruk',
    kategori: 'Oleh-oleh Kering',
    harga: 16000,
    stok: 12,
    unggulan: true,
    deskripsi: 'Tempe iris tipis digoreng kering dengan aroma daun jeruk, camilan tahan lama.',
    toko_nama: 'Toko Laras',
    toko_nomor_wa: '6281234500004',
  },
  {
    id: 'sambal-bawang-kemasan',
    nama: 'Sambal Bawang Kemasan',
    kategori: 'Sambal & Bumbu',
    harga: 19000,
    stok: 6,
    unggulan: false,
    deskripsi: 'Sambal bawang pedas dalam kemasan kaca, praktis untuk lauk harian.',
    toko_nama: 'Dapur Mbak Nia',
    toko_nomor_wa: '6281234500001',
  },
  {
    id: 'klepon-pandan-gula-jawa',
    nama: 'Klepon Pandan Gula Jawa',
    kategori: 'Jajanan Pasar',
    harga: 9000,
    stok: 3,
    unggulan: false,
    deskripsi: 'Bola ketan pandan berisi gula jawa cair, taburan kelapa parut.',
    toko_nama: 'Toko Laras',
    toko_nomor_wa: '6281234500004',
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
