# 🧠 Memahami Konsep Nuxt 4

Dokumen ini menjelaskan apa itu Nuxt 4, hubungannya dengan teknologi lain, dan bagaimana ia bekerja.

---

## 1. Apa itu Nuxt 4?
Nuxt 4 adalah **Fullstack Framework** yang dibangun di atas **Vue.js**. 

> [!NOTE]
> Jika **Vue.js** adalah mesinnya, maka **Nuxt** adalah mobil utuh yang sudah siap pakai dengan segala fasilitasnya (Routing, SEO, API Server).

### Perbandingan Cepat:
*   **Next.js** = Framework Fullstack untuk **React**.
*   **Nuxt.js** = Framework Fullstack untuk **Vue.js**.

---

## 2. Kenapa Disebut "Fullstack"?
Banyak orang mengira Nuxt hanya untuk tampilan (Frontend). Padahal, Nuxt punya dua sisi yang bekerja bersamaan:

1.  **Frontend (Folder `app/`)**: Tempat kamu membuat UI menggunakan Vue components.
2.  **Backend (Folder `server/`)**: Tempat kamu membuat API, logika server, dan koneksi ke database. Ini dijalankan oleh mesin bernama **Nitro**.

---

## 3. Struktur Folder Nuxt 4 (Versi Terbaru)
Nuxt 4 memperkenalkan struktur yang lebih rapi dibanding versi 3:

| Folder | Fungsi |
| :--- | :--- |
| **`app/pages/`** | File-based Routing. Nama file otomatis jadi URL. |
| **`app/layouts/`** | Kerangka tampilan yang bisa dipakai berulang kali (Header/Footer). |
| **`app/components/`** | Potongan UI kecil yang **Auto-imported** (tidak perlu import manual). |
| **`server/api/`** | Tempat membuat API backend sesungguhnya. |
| **`public/`** | File statis seperti gambar atau favicon. |

---

## 4. Cara Berjalan di Production
Nuxt sangat fleksibel. Kamu bisa memilih cara aplikasimu di-run setelah selesai dibuat:

### A. Mode Server (SSR)
*   **Perintah:** `npm run build` -> `node .output/server/index.mjs`
*   **Kegunaan:** Aplikasi Fullstack yang butuh database real-time dan SEO maksimal.
*   **Hosting:** VPS atau Platform seperti Vercel.

### B. Mode Statis (SSG / Pages Biasa)
*   **Perintah:** `npm run generate`
*   **Hasil:** Folder berisi file **HTML/CSS/JS** murni.
*   **Kegunaan:** Blog, landing page, atau website yang ingin di-host secara gratis dan ringan.
*   **Hosting:** GitHub Pages, Netlify.

---

## 5. Fitur Sakti: Auto-Imports
Di Nuxt, kamu tidak perlu mengetikkan `import` satu persatu seperti di Vue biasa atau Next.js.
*   Panggil saja `ref()`, `reactive()`, atau `useFetch()`.
*   Panggil komponen buatanmu sendiri (misal `<StatusCard />`).
Nuxt akan otomatis mendeteksi dan melakukan import di belakang layar. Ini membuat kode kamu jauh lebih bersih!

---

## 7. Nuxt 3 vs Nuxt 4: Apa yang Berubah?

Jika kamu melihat tutorial lama (Nuxt 3), ada beberapa perbedaan mencolok yang perlu diperhatikan agar tidak bingung:

| Fitur | Nuxt 3 | Nuxt 4 |
| :--- | :--- | :--- |
| **Lokasi File Utama** | Langsung di Root (`pages/`, `components/`) | Di dalam folder **`app/`** |
| **Shared Code** | Harus pilih masuk `server` atau `client` | Ada folder **`shared/`** untuk keduanya |
| **useFetch Cleanup** | Harus manual/pusing soal memori | **Otomatis**. Bersih-bersih data saat ganti page |
| **Type Safety** | Sudah bagus | **Jauh lebih ketat** dan akurat (TypeScript) |

---

## 8. Hal Penting yang Perlu Diperhatikan ⚠️

Jika kamu belajar Nuxt 4, pastikan hal-hal berikut sudah benar:

### A. Aktifkan Mode compatibility
Pastikan di `nuxt.config.ts` sudah ada:
```typescript
future: {
  compatibilityVersion: 4,
}
```
Tanpa ini, Nuxt 4 akan berjalan dengan gaya "Nuxt 3" dan folder `app/` tidak akan terbaca.

### B. Struktur folder `app/`
Semua file `.vue` kamu (halaman, layout, komponen) **wajib** masuk ke folder `app/`. Kalau kamu taruh di luar, Nuxt tidak akan menemukannya.

### C. Data Fetching (Undefined vs Null)
Di Nuxt 4, jika data belum ada, `useFetch` akan mengembalikan `undefined`, bukan `null`. Ini alasan kenapa kita harus pakai pengecekan `apiResponse?.data` di kode.

### D. Server Directory Tetap di Luar
Folder `server/` (tempat API kamu) tetap berada di folder utama (root), **bukan** di dalam folder `app/`. Ingat: `app/` hanya untuk frontend.

---

## 9. Ringkasan: Kenapa Belajar Nuxt 4?
1.  **Sistematis:** Folder sudah diatur secara standar profesional.
2.  **Cepat:** Banyak hal dilakukan secara otomatis (Routing & Import).
3.  **Modern:** Sudah mendukung teknologi terbaru (Vite, Nitro, TypeScript).
4.  **SEO Juara:** Menghasilkan HTML yang mudah dibaca oleh Google secara default.
