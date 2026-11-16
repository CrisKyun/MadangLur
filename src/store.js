/**
 * store.js — state aplikasi (in-memory) + notifikasi perubahan.
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
