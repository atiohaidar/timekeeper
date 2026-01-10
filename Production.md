# 🚀 Panduan Production Nuxt 4

Dokumen ini menjelaskan cara melakukan build dan menjalankan aplikasi Nuxt 4 di lingkungan produksi.

---

## 1. Proses Build
Untuk mengubah kode development menjadi kode yang optimal untuk production, jalankan perintah:

```bash
npm run build
```

### Apa yang terjadi saat build?
Nuxt akan membuat folder **`.output/`** di root proyek kamu. Folder ini berisi:
- **`.output/public/`**: File statis (HTML, CSS, JS) untuk browser.
- **`.output/server/`**: Server backend (Nitro) yang sudah siap jalan dengan Node.js.

---

## 2. Cara Menjalankan di Production
Setelah proses build selesai, kamu bisa menjalankan aplikasi menggunakan Node.js:

```bash
node .output/server/index.mjs
```

Aplikasi kamu sekarang berjalan di mode production (biasanya di port 3000).

---

## 3. Strategi Deployment

### A. Managed Hosting (Layanan Cloud)
Layanan seperti **Vercel**, **Netlify**, atau **Cloudflare Pages** biasanya akan mendeteksi Nuxt secara otomatis. Kamu cukup hubungkan repo GitHub kamu, dan mereka yang akan mengurus proses build dan run.

### B. VPS (Virtual Private Server)
Jika kamu menggunakan VPS sendiri (seperti DigitalOcean atau AWS), disarankan menggunakan **PM2** agar aplikasi tetap berjalan jika terjadi crash atau server restart:

```bash
# Pasang PM2 secara global
npm install -g pm2

# Jalankan aplikasi Nuxt
pm2 start .output/server/index.mjs --name "timekeeper-app"
```

---

## 4. Mode Statis (Khusus Front-end)
Jika aplikasi kamu tidak butuh API server internal saat runtime, kamu bisa men-generate file HTML murni:

```bash
npm run generate
```
Hasilnya akan ada di `.output/public/` dan bisa di-host di mana saja tanpa butuh Node.js.
