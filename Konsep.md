# 🧠 Catatan Konsep Belajar Nuxt 4

Dokumen ini berisi rangkuman konsep yang sudah dipelajari untuk membantu transisi dari React/Vue biasa ke **Nuxt 4**.

---

## 1. Struktur Folder (Nuxt 4)
Nuxt 4 memperkenalkan struktur yang lebih rapi di dalam folder `app/`:
- **`app/pages/`**: Setiap file `.vue` otomatis jadi rute (Routing otomatis).
- **`app/components/`**: Tempat menyimpan komponen UI. Nuxt otomatis mendeteksi komponen di sini, jadi tidak perlu `import` manual.
- **`server/api/`**: Tempat membuat endpoint backend (API) sederhana yang langsung jalan bareng aplikasi Nuxt.

---

## 2. State Management: `useState`
Di Nuxt, `useState` adalah cara standar untuk mengelola data yang bisa dibagikan antar komponen/halaman.

### Karakteristik Utama:
- **Global & Shared**: Menggunakan **Key** (string unik) untuk mengakses data yang sama di mana saja.
- **SSR Friendly**: Mencegah kebocoran data antar user di server dan memastikan sinkronisasi yang mulus saat halaman dimuat di browser.
- **Tanpa Boilerplate**: Tidak perlu menginstal library tambahan (seperti Pinia) untuk kebutuhan state sederhana.

### Contoh Penggunaan:
```vue
// Di Halaman A (Inisialisasi)
const counter = useState('counter', () => 0)

// Di Halaman B (Otomatis dapat data yang sama)
// Nuxt akan mengabaikan fungsi () => 0 jika state sudah ada
const counter = useState('counter', () => 0)
```

> **Catatan Penting**: Fungsi inisialisasi tersebut bersifat **lazy**. Nuxt hanya menjalankannya jika state dengan key tersebut belum pernah dibuat sebelumnya. Ini penting agar halaman tetap aman meskipun diakses langsung lewat URL mana pun.

---

## 3. Perbandingan: Nuxt `useState` vs React `useState`

| Fitur                | React `useState`                   | Nuxt `useState`                       |
| :------------------- | :--------------------------------- | :------------------------------------ |
| **Cakupan (Scope)**  | Lokal (hanya di satu komponen).    | **Global/Shared** (lewat kunci unik). |
| **Cara Berbagi**     | Harus via Props atau Context.      | **Otomatis** selama kuncinya sama.    |
| **Interaksi Server** | Hanya jalan di Client.             | Didesain khusus untuk **SSR**.        |
| **Tipe Data**        | Getter & Setter (`[val, setVal]`). | **Vue Ref** (`val.value`).            |

---

## 4. Kenapa Tidak Pakai `ref()` Biasa?
- **`ref()` global** (di luar `script setup`): Berisiko menyebabkan data "tercampur" antar user di environment server (SSR).
- **`ref()` lokal** (di dalam `script setup`): Bagus untuk state yang benar-benar private (misal: status menu buka/tutup), tapi hilang kalau ganti halaman.

---

## 5. Tips Selanjutnya
1. **Composables**: Jika logika `useState` mulai panjang, pindahkan ke folder `app/composables/` agar rapi.
2. **Hydration**: Pastikan HTML yang dirender server sama dengan client untuk menghindari error `parentNode of null`.
