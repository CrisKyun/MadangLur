/**
 * store.js — state aplikasi (in-memory) + notifikasi perubahan,
 * serta fungsi murni filterProducts() untuk pencarian/filter/sort.
 *
 * Catatan SPEC v0.3.0: localStorage hanya untuk JWT (madanglur_token),
 * bukan untuk data produk. Karena itu tidak ada persistensi di sini.
 */

import { DEMO_PRODUCTS } from './products.js'

/** @typedef {'idle'|'loading'|'ready'|'error'} Status */

const state = {
  products: [],
  /** @type {Status} */
  status: 'idle',
  /** @type {string|null} */
  error: null,
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
 *   'harga-termahal'.
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
    default:
      return hasil
  }
}

/**
 * Pola nomor WhatsApp internasional: 62 diikuti minimal 8 digit
 * (sama dengan regex validator di SPEC §11 dan CHECK constraint DB).
 */
export const POLA_NOMOR_WA = /^62[0-9]{8,}$/

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
 * Placeholder pemuatan produk.
 * M2: ganti isi fetchProducts() dengan apiFetch('/produk').
 */
export async function loadProducts() {
  setState({ status: 'loading', error: null })

  try {
    const products = await fetchProducts()
    setState({ products, status: 'ready' })
  } catch {
    setState({ status: 'error', error: 'Gagal memuat data. Coba lagi.' })
  }
}

async function fetchProducts() {
  return DEMO_PRODUCTS
}
