/**
 * main.js — entry point & wiring event.
 *
 * Merakit shell halaman sekali, mengikat filter bar, lalu re-render grid
 * setiap state berubah. Logika filter/sort murni ada di store.filterProducts.
 *
 * Belum termasuk: hash router, auth, dashboard/admin, modal (M4–M6).
 */

import './style.css'
import {
  filterProducts,
  getState,
  loadProducts,
  setState,
  subscribe,
} from './store.js'
import { renderCatalog, renderFilterBar, renderHero, renderNavbar } from './ui.js'

const app = document.querySelector('#app')

app.innerHTML = `
  ${renderNavbar()}
  <main id="main">
    <section class="hero" id="hero" aria-labelledby="hero-title"></section>
    ${renderFilterBar()}
    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-head">
        <h2 id="catalog-title">Katalog Produk</h2>
        <p class="catalog-count" id="catalog-count" role="status" aria-live="polite"></p>
      </div>
      <div id="product-grid" class="product-grid"></div>
    </section>
  </main>
`

const heroEl = app.querySelector('#hero')
const gridEl = app.querySelector('#product-grid')
const countEl = app.querySelector('#catalog-count')
const searchEl = app.querySelector('#search-produk')
const pillsEl = app.querySelector('.filter-pills')
const sortEl = app.querySelector('#sort-produk')

function setFilter(patch) {
  setState({ filters: { ...getState().filters, ...patch } })
}

searchEl.addEventListener('input', () => setFilter({ query: searchEl.value }))
sortEl.addEventListener('change', () => setFilter({ sort: sortEl.value }))

pillsEl.addEventListener('click', (event) => {
  const tombol = event.target.closest('[data-kategori]')
  if (!tombol) return
  setFilter({ kategori: tombol.dataset.kategori })
})

function render(state) {
  const daftar = filterProducts(state.products, state.filters)

  heroEl.innerHTML = renderHero(state.products, state.status)
  gridEl.innerHTML = renderCatalog({
    status: state.status,
    error: state.error,
    daftar,
  })
  gridEl.setAttribute('aria-busy', String(state.status === 'loading'))
  countEl.textContent =
    state.status === 'ready' ? `${daftar.length} produk ditampilkan` : ''

  pillsEl.querySelectorAll('[data-kategori]').forEach((tombol) => {
    const aktif = tombol.dataset.kategori === state.filters.kategori
    tombol.classList.toggle('active', aktif)
    tombol.setAttribute('aria-pressed', String(aktif))
  })
}

subscribe(render)
render(getState())
loadProducts()
