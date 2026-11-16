/**
 * main.js — entry point, hash router, dan view katalog.
 *
 * Route: #/ (katalog publik), #/masuk, #/daftar, #/dashboard (butuh sesi).
 * Sesi demo berasal dari auth.js (localStorage). Logika filter/sort murni ada
 * di store.filterProducts; CRUD dashboard memakai store.addProduk/
 * updateProduk/deleteProduk sehingga perubahan langsung terlihat di katalog.
 */

import './style.css'
import { getSession, keluar, pastikanAdmin } from './auth.js'
import { mountAdmin, updateAdmin } from './admin.js'
import { mountDaftar, mountMasuk } from './auth-page.js'
import { mountDashboard, updateDashboard } from './dashboard.js'
import { currentRoute, startRouter } from './router.js'
import {
  filterProducts,
  getState,
  loadProducts,
  setState,
  subscribe,
} from './store.js'
import {
  renderCatalog,
  renderFilterBar,
  renderHero,
  renderNavbar,
  renderNotice,
  showToast,
} from './ui.js'

const app = document.querySelector('#app')

app.innerHTML = `
  <div id="nav-root"></div>
  <div id="notice-root"></div>
  <main id="main"></main>
  <div id="toast-root" class="toast-root" aria-live="polite"></div>
`

const navRoot = app.querySelector('#nav-root')
const mainEl = app.querySelector('#main')

let activeRoute = '/'
let catalogRefs = null

function setFilter(patch) {
  setState({ filters: { ...getState().filters, ...patch } })
}

function updateNav(route) {
  navRoot.querySelectorAll('.nav-btn[data-route]').forEach((link) => {
    const aktif = link.dataset.route === route
    link.classList.toggle('active', aktif)

    if (aktif) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })
}

function renderNav(route) {
  navRoot.innerHTML = renderNavbar(getSession())
  updateNav(route)
}

/** Halaman beranda sesuai peran akun. */
function ruteBeranda(akun) {
  if (!akun) return '/'
  if (akun.role === 'admin') return '/admin'
  if (akun.role === 'penjual') return '/dashboard'
  return '/'
}

function alihkan(route) {
  window.location.hash = `#${route}`
}

function mountCatalog() {
  mainEl.innerHTML = `
    <section class="hero" id="hero" aria-labelledby="hero-title"></section>
    ${renderFilterBar()}
    <section class="catalog" aria-labelledby="catalog-title">
      <div class="catalog-head">
        <h2 id="catalog-title">Katalog Produk</h2>
        <p class="catalog-count" id="catalog-count" role="status" aria-live="polite"></p>
      </div>
      <div id="product-grid" class="product-grid"></div>
    </section>
  `

  const searchEl = mainEl.querySelector('#search-produk')
  const sortEl = mainEl.querySelector('#sort-produk')
  const pillsEl = mainEl.querySelector('.filter-pills')

  catalogRefs = {
    heroEl: mainEl.querySelector('#hero'),
    gridEl: mainEl.querySelector('#product-grid'),
    countEl: mainEl.querySelector('#catalog-count'),
    pillsEl,
  }

  // Kembalikan nilai filter saat berpindah route kembali ke katalog.
  const { filters } = getState()
  searchEl.value = filters.query
  sortEl.value = filters.sort

  searchEl.addEventListener('input', () => setFilter({ query: searchEl.value }))
  sortEl.addEventListener('change', () => setFilter({ sort: sortEl.value }))
  pillsEl.addEventListener('click', (event) => {
    const tombol = event.target.closest('[data-kategori]')
    if (!tombol) return
    setFilter({ kategori: tombol.dataset.kategori })
  })

  updateCatalog(getState())
}

function updateCatalog(state) {
  if (!catalogRefs) return

  const { heroEl, gridEl, countEl, pillsEl } = catalogRefs
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

function updateNotice(state) {
  const root = app.querySelector('#notice-root')
  root.innerHTML = state.notice ? renderNotice(state.notice) : ''
}

function renderRoute(route) {
  const sesi = getSession()

  // Pengguna yang sudah masuk tidak perlu melihat form masuk/daftar.
  if ((route === '/masuk' || route === '/daftar') && sesi) {
    alihkan(ruteBeranda(sesi))
    return
  }

  // Dashboard hanya untuk penjual yang sudah masuk.
  if (route === '/dashboard') {
    if (!sesi) {
      showToast('Silakan masuk dulu untuk membuka dashboard.', 'info')
      alihkan('/masuk')
      return
    }
    if (sesi.role !== 'penjual') {
      showToast('Dashboard hanya untuk akun penjual.', 'error')
      alihkan(ruteBeranda(sesi))
      return
    }
  }

  // Panel admin hanya untuk akun admin.
  if (route === '/admin') {
    if (!sesi) {
      showToast('Silakan masuk sebagai admin untuk membuka panel.', 'info')
      alihkan('/masuk')
      return
    }
    if (sesi.role !== 'admin') {
      showToast('Panel admin hanya untuk akun admin.', 'error')
      alihkan(ruteBeranda(sesi))
      return
    }
  }

  activeRoute = route
  renderNav(route)

  if (route === '/dashboard') {
    catalogRefs = null
    mountDashboard(mainEl, sesi)
  } else if (route === '/admin') {
    catalogRefs = null
    mountAdmin(mainEl, sesi)
  } else if (route === '/masuk') {
    catalogRefs = null
    mountMasuk(mainEl, {
      onSukses: (akun) => alihkan(ruteBeranda(akun)),
    })
  } else if (route === '/daftar') {
    catalogRefs = null
    mountDaftar(mainEl, {
      onSukses: (akun) => alihkan(ruteBeranda(akun)),
    })
  } else {
    mountCatalog()
  }
}

app.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="dismiss-notice"]')) {
    setState({ notice: null })
    return
  }

  if (event.target.closest('[data-action="logout"]')) {
    const rute = currentRoute()
    keluar()
    showToast('Anda telah keluar.', 'info')

    if (rute === '/') {
      // Hash tidak berubah, jadi render ulang katalog + navbar secara manual.
      renderRoute('/')
    } else {
      window.location.hash = '#/'
    }
  }
})

subscribe((state) => {
  updateNotice(state)
  if (activeRoute === '/dashboard') updateDashboard(mainEl)
  else if (activeRoute === '/admin') updateAdmin(mainEl)
  else if (activeRoute === '/') updateCatalog(state)
})

pastikanAdmin()
startRouter(renderRoute)
loadProducts()
