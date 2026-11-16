/**
 * Lingkungan tes Vitest: modul demo memakai localStorage browser, sedangkan
 * environment Node tidak menyediakannya. Stub in-memory ini cukup karena semua
 * akses di `src/` hanya get/set/remove/clear.
 */
class MemoriStorage {
  constructor() {
    this.data = new Map()
  }

  getItem(kunci) {
    const k = String(kunci)
    return this.data.has(k) ? this.data.get(k) : null
  }

  setItem(kunci, nilai) {
    this.data.set(String(kunci), String(nilai))
  }

  removeItem(kunci) {
    this.data.delete(String(kunci))
  }

  clear() {
    this.data.clear()
  }

  key(indeks) {
    return [...this.data.keys()][indeks] ?? null
  }

  get length() {
    return this.data.size
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MemoriStorage(),
  configurable: true,
  writable: true,
})
