/**
 * store.js — state aplikasi + notifikasi perubahan, fungsi murni
 * filterProducts(), serta CRUD produk dengan persistensi localStorage.
 *
 * Catatan: target SPEC (v0.3.0) menetapkan localStorage hanya untuk JWT dan
 * data produk di Supabase. Persistensi di sini adalah penyimpanan sementara
 * untuk demo v0.4.0 tanpa backend (lihat storage.js); ganti dengan API saat
 * M2 dikerjakan.
 */

import {
  DEMO_PRODUCTS,
  KATEGORI,
  POLA_NOMOR_WA,
  WHATSAPP_NUMBER,
  buatIdProduk,
} from './products.js'
import {
  TOKO_DEMO,
  muatProdukTersimpan,
  simpanProdukTersimpan,
  validasiDaftarProduk,
} from './storage.js'

// Tetap diekspor dari store agar pemanggil lama tidak perlu berubah.
export { POLA_NOMOR_WA }

/** @typedef {'idle'|'loading'|'ready'|'error'} Status */

const state = {
  products: [],
  /** @type {Status} */
  status: 'idle',
  /** @type {string|null} */
  error: null,
  /** @type {{ tipe: 'error'|'info', pesan: string }|null} */
  notice: null,
  filters: {
    query: '',
    kategori: 'Semua',
    sort: 'default',
  },
}

const listeners = new Set()

export function getState() {
  return state
}

/**
 * Gabungkan perubahan state lalu beri tahu semua subscriber.
 * @param {Partial<typeof state> | ((state: typeof state) => Partial<typeof state>)} patch
 */
export function setState(patch) {
  const next = typeof patch === 'function' ? patch(state) : patch
  Object.assign(state, next)
  listeners.forEach((listener) => listener(state))
}

/**
 * @param {(state: typeof state) => void} listener
 * @returns {() => void} fungsi unsubscribe
 */
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Filter + urutkan produk. Fungsi murni: tidak membaca state modul,
 * tidak mengubah array masukan (hasil filter menghasilkan array baru).
 *
 * Aturan:
 * - query dicocokkan case-insensitive pada nama DAN deskripsi;
 *   spasi di awal/akhir diabaikan, query kosong = semua produk.
 * - kategori "Semua" = tanpa filter; "Unggulan" = hanya produk unggulan.
 * - sort: 'default' (urutan data), 'nama' (A–Z), 'harga-termurah',
 *   'harga-termahal', 'stok-terbanyak'.
 *
 * @param {Array<{ nama: string, deskripsi?: string, kategori: string, harga: number, unggulan?: boolean }>} products
 * @param {{ query?: string, kategori?: string, sort?: string }} [options]
 * @returns {Array<object>} produk yang lolos filter, sudah diurutkan
 */
export function filterProducts(
  products,
  { query = '', kategori = 'Semua', sort = 'default' } = {},
) {
  const kataKunci = String(query).trim().toLowerCase()

  const hasil = products.filter((produk) => {
    const cocokKategori =
      kategori === 'Semua'
        ? true
        : kategori === 'Unggulan'
          ? produk.unggulan === true
          : produk.kategori === kategori

    if (!cocokKategori) return false
    if (kataKunci === '') return true

    const nama = String(produk.nama ?? '').toLowerCase()
    const deskripsi = String(produk.deskripsi ?? '').toLowerCase()

    return nama.includes(kataKunci) || deskripsi.includes(kataKunci)
  })

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

function normalisasiNomor(nomor) {
  return String(nomor ?? '').replace(/[\s()+-]/g, '')
}

/**
 * Cek nomor dalam format internasional (62…).
 * Spasi, tanda hubung, kurung, dan awalan "+" diabaikan sebelum divalidasi.
 * @param {string} nomor
 * @returns {boolean}
 */
export function isNomorWAValid(nomor) {
  return POLA_NOMOR_WA.test(normalisasiNomor(nomor))
}

/**
 * Bangun tautan wa.me untuk memesan satu produk. Fungsi murni.
 * Mengembalikan null bila nomor tidak valid (mis. "0812…", "6281", kosong)
 * atau produk tidak punya nama — pemanggil yang memutuskan menonaktifkan tombol.
 *
 * @param {string} nomor nomor tujuan, format internasional (62…)
 * @param {{ nama: string, toko_nama?: string }} produk
 * @returns {string|null} URL wa.me dengan teks pesan ter-encode, atau null
 */
export function buildWhatsAppUrl(nomor, produk) {
  const tujuan = normalisasiNomor(nomor)

  if (!POLA_NOMOR_WA.test(tujuan)) return null
  if (!produk || !produk.nama) return null

  const teks = `Halo, saya ingin memesan ${produk.nama} dari ${produk.toko_nama ?? 'toko ini'}`
  return `https://wa.me/${tujuan}?text=${encodeURIComponent(teks)}`
}

/**
 * Pesan validasi produk (mengikuti UI-SPEC §9).
 */
export const PESAN_VALIDASI = {
  nama: 'Nama produk minimal 2 karakter.',
  kategori: 'Pilih kategori produk.',
  harga: 'Harga tidak valid (harus ≥ 0).',
  stok: 'Stok tidak valid (harus bilangan bulat ≥ 0).',
  deskripsi: 'Deskripsi maksimal 300 karakter.',
}

/**
 * Validasi input form produk. Fungsi murni; harga/stok boleh berupa string
 * dari form. Kategori harus salah satu KATEGORI.
 *
 * @param {{ nama?: string, kategori?: string, harga?: string|number, stok?: string|number, deskripsi?: string, unggulan?: boolean }} input
 * @returns {{ valid: boolean, errors: Record<string, string>, data: object }}
 */
export function validateProduk(input = {}) {
  const errors = {}

  const nama = String(input.nama ?? '').trim()
  if (nama.length < 2) errors.nama = PESAN_VALIDASI.nama

  const kategori = String(input.kategori ?? '')
  if (!KATEGORI.includes(kategori)) errors.kategori = PESAN_VALIDASI.kategori

  const hargaRaw = String(input.harga ?? '').trim()
  const harga = Number(hargaRaw)
  if (hargaRaw === '' || !Number.isFinite(harga) || harga < 0) {
    errors.harga = PESAN_VALIDASI.harga
  }

  const stokRaw = String(input.stok ?? '').trim()
  const stok = Number(stokRaw)
  if (stokRaw === '' || !Number.isInteger(stok) || stok < 0) {
    errors.stok = PESAN_VALIDASI.stok
  }

  const deskripsi = String(input.deskripsi ?? '').trim()
  if (deskripsi.length > 300) errors.deskripsi = PESAN_VALIDASI.deskripsi

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      nama,
      kategori,
      harga,
      stok,
      deskripsi,
      unggulan: input.unggulan === true,
    },
  }
}

/**
 * Simpan daftar produk baru ke state + localStorage, sekaligus atur notice
 * bila penyimpanan gagal.
 */
function terapkanProduk(products) {
  const tersimpan = simpanProdukTersimpan(products)

  setState({
    products,
    notice: tersimpan
      ? null
      : { tipe: 'error', pesan: 'Gagal menyimpan perubahan ke penyimpanan lokal.' },
  })
}

/**
 * Tambah produk lalu simpan ke localStorage.
 * @param {object} input data form
 * @param {{ id?: string, nama_toko?: string, nomor_wa?: string }} [toko] identitas toko pemilik
 * @returns {{ ok: true, product: object } | { ok: false, errors: Record<string,string> }}
 */
export function addProduk(input, toko = {}) {
  const hasil = validateProduk(input)
  if (!hasil.valid) return { ok: false, errors: hasil.errors }

  const produk = {
    id: buatIdProduk(hasil.data.nama),
    ...hasil.data,
    toko_nama: toko?.nama_toko?.trim() || TOKO_DEMO,
    toko_nomor_wa: toko?.nomor_wa || WHATSAPP_NUMBER,
    penjual_id: String(toko?.id ?? ''),
  }

  terapkanProduk([...getState().products, produk])
  return { ok: true, product: produk }
}

/**
 * Produk milik satu penjual. Produk seed tanpa `penjual_id` dianggap publik
 * dan tidak pernah masuk dashboard penjual.
 * @param {Array<object>} products
 * @param {string} penjualId
 * @returns {Array<object>}
 */
export function produkMilik(products, penjualId) {
  const id = String(penjualId ?? '')
  if (id === '') return []
  return products.filter((produk) => String(produk.penjual_id ?? '') === id)
}

/**
 * Perbarui produk berdasarkan id. Bila `penjualId` diberikan, produk hanya
 * boleh diubah kalau dimiliki penjual tersebut.
 * @returns {{ ok: true, product: object } | { ok: false, errors: Record<string,string> }}
 */
export function updateProduk(id, input, penjualId = null) {
  const hasil = validateProduk(input)
  if (!hasil.valid) return { ok: false, errors: hasil.errors }

  const lama = getState().products.find((produk) => produk.id === id)
  if (!lama) return { ok: false, errors: { umum: 'Produk tidak ditemukan.' } }
  if (
    penjualId !== null &&
    String(lama.penjual_id ?? '') !== String(penjualId ?? '')
  ) {
    return { ok: false, errors: { umum: 'Produk ini bukan milik toko Anda.' } }
  }

  const produk = { ...lama, ...hasil.data }
  terapkanProduk(
    getState().products.map((item) => (item.id === id ? produk : item)),
  )
  return { ok: true, product: produk }
}

/**
 * Hapus produk berdasarkan id. Bila `penjualId` diberikan, hanya produk milik
 * penjual tersebut yang boleh dihapus.
 * @returns {boolean} true bila ada produk yang terhapus
 */
export function deleteProduk(id, penjualId = null) {
  const sebelum = getState().products
  const target = sebelum.find((produk) => produk.id === id)
  if (!target) return false
  if (
    penjualId !== null &&
    String(target.penjual_id ?? '') !== String(penjualId ?? '')
  ) {
    return false
  }

  terapkanProduk(sebelum.filter((produk) => produk.id !== id))
  return true
}

/**
 * Sinkronkan nama toko + nomor WA penjual ke semua produk miliknya sehingga
 * tautan WhatsApp di katalog otomatis mengikuti nomor terbaru.
 * @returns {number} jumlah produk yang diperbarui
 */
export function sinkronProfilPenjual(penjualId, profil = {}) {
  const id = String(penjualId ?? '')
  if (id === '') return 0

  const nama = String(profil.nama_toko ?? '').trim()
  const nomor = String(profil.nomor_wa ?? '')
  let jumlah = 0

  const products = getState().products.map((produk) => {
    if (String(produk.penjual_id ?? '') !== id) return produk
    jumlah += 1
    return {
      ...produk,
      toko_nama: nama || produk.toko_nama,
      toko_nomor_wa: nomor,
    }
  })

  if (jumlah > 0) terapkanProduk(products)
  return jumlah
}

/**
 * Hapus semua produk milik satu penjual (dipakai admin saat menghapus akun).
 * @returns {number} jumlah produk yang dihapus
 */
export function hapusProdukPenjual(penjualId) {
  const id = String(penjualId ?? '')
  if (id === '') return 0

  const sebelum = getState().products
  const sesudah = sebelum.filter(
    (produk) => String(produk.penjual_id ?? '') !== id,
  )
  const jumlah = sebelum.length - sesudah.length
  if (jumlah > 0) terapkanProduk(sesudah)
  return jumlah
}

/**
 * Ringkasan dashboard: total produk, total stok, kategori aktif, unggulan.
 * @param {Array<{ stok: number, kategori: string, unggulan?: boolean }>} products
 */
export function ringkasanProduk(products) {
  return {
    totalProduk: products.length,
    totalStok: products.reduce((total, produk) => total + (Number(produk.stok) || 0), 0),
    kategoriAktif: new Set(products.map((produk) => produk.kategori)).size,
    totalUnggulan: products.filter((produk) => produk.unggulan === true).length,
  }
}

function salinContohProduk() {
  return DEMO_PRODUCTS.map((produk) => ({ ...produk }))
}

/**
 * Muat produk: localStorage → validasi → fallback data contoh.
 * Data rusak tidak dipakai; data contoh dipulihkan dan disimpan ulang.
 */
export async function loadProducts() {
  setState({ status: 'loading', error: null })

  const hasil = muatProdukTersimpan()

  if (hasil.status === 'corrupt') {
    const contoh = salinContohProduk()
    const tersimpan = simpanProdukTersimpan(contoh)

    setState({
      products: contoh,
      status: 'ready',
      notice: {
        tipe: 'error',
        pesan: `Data produk tersimpan tidak valid (${hasil.alasan}). Data contoh dipulihkan.${tersimpan ? '' : ' Penyimpanan lokal tidak tersedia.'}`,
      },
    })
    return
  }

  if (hasil.status === 'ok') {
    setState({ products: hasil.products, status: 'ready' })
    return
  }

  const contoh = salinContohProduk()
  const notice =
    hasil.status === 'empty' && simpanProdukTersimpan(contoh)
      ? null
      : {
          tipe: 'info',
          pesan:
            'Penyimpanan lokal tidak tersedia; perubahan hanya berlaku selama halaman terbuka.',
        }

  setState({ products: contoh, status: 'ready', notice })
}

/**
 * Impor produk dari JSON yang sudah di-parse. Payload divalidasi penuh lebih
 * dulu; data lama (state + localStorage) tidak disentuh bila impor gagal.
 *
 * Bila `toko.id` diberikan (penjual), impor bersifat scoped: hanya produk
 * milik penjual tersebut yang diganti; produk penjual lain dan produk seed
 * tetap utuh. Pemilik hasil impor selalu penjual yang sedang masuk.
 * @param {unknown} data
 * @param {{ id?: string, nama_toko?: string, nomor_wa?: string }} [toko] pemilik
 * @returns {{ ok: true, jumlah: number } | { ok: false, error: string }}
 */
export function importProduk(data, toko = {}) {
  const idPemilik = String(toko?.id ?? '')
  const hasil = validasiDaftarProduk(data, {
    toko_nama: toko?.nama_toko,
    toko_nomor_wa: toko?.nomor_wa,
    penjual_id: idPemilik,
  })
  if (!hasil.ok) return { ok: false, error: hasil.error }

  let products = hasil.products

  if (idPemilik !== '') {
    const nama = String(toko?.nama_toko ?? '').trim()
    const nomor = String(toko?.nomor_wa ?? '')
    const produkLain = getState().products.filter(
      (produk) => String(produk.penjual_id ?? '') !== idPemilik,
    )

    products = [
      ...produkLain,
      ...hasil.products.map((produk) => ({
        ...produk,
        penjual_id: idPemilik,
        toko_nama: nama || produk.toko_nama,
        toko_nomor_wa: nomor !== '' ? nomor : produk.toko_nomor_wa,
      })),
    ]
  }

  if (!simpanProdukTersimpan(products)) {
    return { ok: false, error: 'Penyimpanan lokal gagal ditulis; data lama dipertahankan.' }
  }

  setState({ products, notice: null })
  return { ok: true, jumlah: hasil.products.length }
}

/**
 * Pulihkan produk contoh (state + localStorage).
 * @returns {number} jumlah produk contoh
 */
export function resetDemo() {
  const contoh = salinContohProduk()
  terapkanProduk(contoh)
  return contoh.length
}
