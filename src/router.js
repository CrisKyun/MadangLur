/**
 * router.js — hash routing minimal untuk halaman demo.
 * #/          → katalog publik (semua peran)
 * #/masuk     → form masuk
 * #/daftar    → form daftar akun penjual/pembeli
 * #/dashboard → dashboard penjual (butuh sesi penjual; guard di main.js)
 * #/pembeli   → akun & daftar kontak toko untuk pembeli (guard di main.js)
 * #/admin     → panel admin (butuh sesi admin; guard di main.js)
 */

const ROUTES = new Set(['/', '/dashboard', '/pembeli', '/masuk', '/daftar', '/admin'])

export function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '')
  // Terima "#/dashboard/" dan "#/dashboard//" sebagai route yang sama.
  const bersih = hash.length > 1 ? hash.replace(/\/+$/, '') : hash
  return ROUTES.has(bersih) ? bersih : '/'
}

/**
 * Dengarkan perubahan hash dan panggil onRoute dengan route aktif.
 * onRoute juga dipanggil sekali saat start.
 * @param {(route: string) => void} onRoute
 */
export function startRouter(onRoute) {
  window.addEventListener('hashchange', () => onRoute(currentRoute()))
  onRoute(currentRoute())
}
