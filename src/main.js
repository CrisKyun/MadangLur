/**
 * main.js — entry point.
 * Merakit shell halaman sekali, lalu re-render tiap state berubah.
 *
 * Belum termasuk: hash router, auth, filter bar, modal (M3–M6).
 */

import './style.css'
import { getState, loadProducts, subscribe } from './store.js'
import { produkTampil, renderCatalog, renderHero, renderNavbar } from './ui.js'

const app = document.querySelector('#app')

app.innerHTML = `
  ${renderNavbar()}
  <main id="main">
    <section class="hero" id="hero" aria-labelledby="hero-title"></section>
    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-head">
        <h2 id="catalog-title">Katalog Produk</h2>
        <p class="catalog-count" id="catalog-count"></p>
      </div>
      <div id="product-grid" class="product-grid" aria-live="polite"></div>
    </section>
  </main>
`

const heroEl = app.querySelector('#hero')
const gridEl = app.querySelector('#product-grid')
const countEl = app.querySelector('#catalog-count')

function render(state) {
  heroEl.innerHTML = renderHero(state.products, state.status)
  gridEl.innerHTML = renderCatalog(state)

  const siap = state.status === 'ready'
  gridEl.setAttribute('aria-busy', String(state.status === 'loading'))
  countEl.textContent = siap ? `${produkTampil(state).length} produk ditampilkan` : ''
}

subscribe(render)
render(getState())
loadProducts()
