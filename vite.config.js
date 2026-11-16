import { defineConfig } from 'vite'

// base './' agar hasil build bisa dibuka dari path mana pun (file:// atau sub-folder).
// Proxy /api -> http://localhost:3000 baru ditambahkan saat Express API tersedia (M2).
export default defineConfig({
  base: './',
  server: {
    port: 5173,
  },
})
