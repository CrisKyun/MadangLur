/**
 * storage.js — persistensi produk ke localStorage untuk mode demo.
 *
 * Penyesuaian terhadap proyek ini:
 * - Aplikasi bernama MadangLur, jadi key memakai prefix `madanglur:`.
 * - Target SPEC (v0.3.0) menetapkan localStorage hanya untuk JWT dan data
 *   produk di Supabase. Modul ini adalah penyimpanan sementara demo v0.4.0
 *   agar aplikasi berjalan tanpa backend; ganti dengan GET /api/produk saat
 *   M2 dikerjakan.
 *
 * Semua fungsi baca/tulis menangani kegagalan (JSON rusak, kuota penuh,
 * localStorage diblokir) tanpa melempar error ke pemanggil.
 */

import {
  KATEGORI,
  POLA_NOMOR_WA,
  WHATSAPP_NUMBER,
  buatIdProduk,
} from './products.js'

export const STORAGE_KEY = 'madanglur:products:v1'

export const TOKO_DEMO = 'Toko Demo MadangLur'

function gagal(error) {
  return { ok: false, error }
}

function normalisasiItem(item, indeks, defaults = {}) {
  const label = `Produk #${indeks + 1}`

  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return gagal(`${label}: bukan objek produk.`)
  }

  if (typeof item.nama !== 'string' || item.nama.trim().length < 2) {
    return gagal(`${label}: nama harus string minimal 2 karakter.`)
  }

  if (typeof item.kategori !== 'string' || !KATEGORI.includes(item.kategori)) {
    return gagal(`${label}: kategori tidak valid.`)
  }

  if (typeof item.harga !== 'number' || !Number.isFinite(item.harga) || item.harga < 0) {
    return gagal(`${label}: harga harus angka ≥ 0.`)
  }

  if (typeof item.stok !== 'number' || !Number.isInteger(item.stok) || item.stok < 0) {
    return gagal(`${label}: stok harus bilangan bulat ≥ 0.`)
  }

  if (item.deskripsi !== undefined && typeof item.deskripsi !== 'string') {
    return gagal(`${label}: deskripsi harus string.`)
  }

  if (item.unggulan !== undefined && typeof item.unggulan !== 'boolean') {
    return gagal(`${label}: unggulan harus boolean.`)
  }

  if (item.id !== undefined && (typeof item.id !== 'string' || item.id.trim() === '')) {
    return gagal(`${label}: id harus string tidak kosong.`)
  }

  if (item.toko_nama !== undefined && typeof item.toko_nama !== 'string') {
    return gagal(`${label}: toko_nama harus string.`)
  }

  if (item.toko_nomor_wa !== undefined) {
    if (typeof item.toko_nomor_wa !== 'string') {
      return gagal(`${label}: toko_nomor_wa harus string.`)
    }
    if (item.toko_nomor_wa !== '' && !POLA_NOMOR_WA.test(item.toko_nomor_wa)) {
      return gagal(`${label}: nomor WA harus format 62… atau string kosong.`)
    }
  }

  if (item.penjual_id !== undefined && typeof item.penjual_id !== 'string') {
    return gagal(`${label}: penjual_id harus string.`)
  }

  const nama = item.nama.trim()
  const deskripsi = (item.deskripsi ?? '').trim()
  const tokoDefault = String(defaults?.toko_nama ?? '').trim() || TOKO_DEMO
  const nomorDefault = defaults?.toko_nomor_wa || WHATSAPP_NUMBER

  if (deskripsi.length > 300) {
    return gagal(`${label}: deskripsi maksimal 300 karakter.`)
  }

  return {
    ok: true,
    value: {
      id: item.id ?? buatIdProduk(nama),
      nama,
      kategori: item.kategori,
      harga: item.harga,
      stok: item.stok,
      deskripsi,
      unggulan: item.unggulan === true,
      toko_nama: item.toko_nama?.trim() || tokoDefault,
      toko_nomor_wa: item.toko_nomor_wa ?? nomorDefault,
      penjual_id: item.penjual_id ?? defaults?.penjual_id ?? '',
    },
  }
}

/**
 * Validasi seluruh payload: harus array, tiap field bertipe benar, id unik.
 * Data yang tidak valid ditolak seluruhnya (tidak ada impor sebagian).
 * @param {unknown} data
 * @param {{ toko_nama?: string, toko_nomor_wa?: string, penjual_id?: string }} [defaults] pemilik default
 * @returns {{ ok: true, products: Array<object> } | { ok: false, error: string }}
 */
export function validasiDaftarProduk(data, defaults = {}) {
  if (!Array.isArray(data)) {
    return gagal('Data harus berupa array produk.')
  }

  const products = []
  const idTerpakai = new Set()

  for (let indeks = 0; indeks < data.length; indeks += 1) {
    const hasil = normalisasiItem(data[indeks], indeks, defaults)
    if (!hasil.ok) return hasil

    if (idTerpakai.has(hasil.value.id)) {
      return gagal(`ID produk duplikat: ${hasil.value.id}.`)
    }

    idTerpakai.add(hasil.value.id)
    products.push(hasil.value)
  }

  return { ok: true, products }
}

/**
 * Baca produk dari localStorage.
 * status: 'ok' | 'empty' (belum ada data) | 'corrupt' | 'unavailable'
 * @returns {{ status: string, products?: Array<object>, alasan?: string }}
 */
export function muatProdukTersimpan() {
  let raw

  try {
    raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null
  } catch {
    return { status: 'unavailable' }
  }

  if (raw === null) return { status: 'empty' }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    return { status: 'corrupt', alasan: 'JSON tidak valid' }
  }

  const hasil = validasiDaftarProduk(data)
  if (!hasil.ok) return { status: 'corrupt', alasan: hasil.error }

  return { status: 'ok', products: hasil.products }
}

/**
 * Simpan produk ke localStorage.
 * @param {Array<object>} products
 * @returns {boolean} false bila gagal (kuota penuh / storage diblokir)
 */
export function simpanProdukTersimpan(products) {
  try {
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    return true
  } catch {
    return false
  }
}

/** Serialisasi produk untuk file export (JSON rapi 2 spasi). */
export function eksporProdukJSON(products) {
  return JSON.stringify(products, null, 2)
}
