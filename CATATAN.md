# CATATAN WORKSHOP VIBE CODING

## 1. Tujuan Latihan

Workshop ini bertujuan untuk mempelajari penerapan Vibe Coding dalam proses pengembangan aplikasi dengan memanfaatkan bantuan AI Agent.

Melalui latihan ini, saya ingin memahami cara menyusun spesifikasi kebutuhan aplikasi, memberikan prompt yang jelas dan terarah, meninjau kode yang dihasilkan AI, serta melakukan pengujian untuk memastikan aplikasi berjalan sesuai kebutuhan.

Selain itu, latihan ini bertujuan membangun pemahaman bahwa AI merupakan alat bantu pengembangan, sedangkan manusia tetap bertanggung jawab dalam menentukan kebutuhan, memeriksa perubahan, mengambil keputusan, dan memastikan kualitas hasil akhir aplikasi.

## 2. Target Aplikasi

Aplikasi yang akan dikembangkan adalah **PawonBoga**, yaitu aplikasi katalog dan dashboard pengelolaan produk untuk UMKM yang bergerak di bidang makanan dan minuman.

Aplikasi ini ditargetkan memiliki fitur utama sebagai berikut:

1. **Katalog Produk:** Menampilkan daftar produk makanan dan minuman beserta informasi produknya.
2. **Manajemen Produk:** Mengelola data produk melalui fitur CRUD (Create, Read, Update, Delete).
3. **Penyimpanan Data:** Menyimpan data produk menggunakan localStorage dengan validasi data.
4. **Import dan Export:** Menyediakan fitur untuk mengimpor dan mengekspor data produk dalam format JSON.
5. **Integrasi WhatsApp:** Memudahkan pelanggan menghubungi penjual melalui WhatsApp.
6. **Pengujian:** Memastikan fitur aplikasi berjalan sesuai kebutuhan melalui pengujian manual dan Vitest.

Teknologi yang digunakan dalam pengembangan aplikasi ini adalah Vite, Vanilla JavaScript, localStorage, dan Vitest.

## 3. Batasan Workshop

Agar pengembangan tetap terarah dan sesuai dengan tujuan pembelajaran, batasan workshop ini meliputi:

1. Pengembangan aplikasi mengikuti instruksi dan tahapan yang telah ditentukan dalam workshop.
2. Penyimpanan data menggunakan localStorage, bukan database server.
3. Aplikasi ditujukan untuk pembelajaran dan demonstrasi, sehingga tidak boleh dianggap sebagai sistem produksi yang aman.
4. Pengembangan dilakukan secara bertahap menggunakan prompt yang jelas dan memiliki tujuan spesifik.
5. Setiap perubahan kode yang dihasilkan AI harus ditinjau dan diuji sebelum disetujui.

## 4. Risiko Penggunaan AI yang Ingin Diperiksa

Risiko yang ingin diperiksa adalah kemungkinan AI menghasilkan kode yang terlihat benar, tetapi tidak sesuai dengan spesifikasi, mengandung kesalahan logika, atau menyebabkan fitur lain yang sebelumnya berjalan menjadi bermasalah.

Untuk mengantisipasi risiko tersebut, setiap perubahan kode akan diperiksa melalui `git diff`, kemudian diuji di browser dan menggunakan test case yang sesuai sebelum perubahan diterima dan di-commit.
