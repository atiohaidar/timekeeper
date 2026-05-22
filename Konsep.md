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

## 6. Composables (Folder `app/composables/`)
Composables adalah tempat menaruh logika yang bisa dipakai berulang kali. Nuxt otomatis melakukan *auto-import* untuk semua file di folder ini.

### Perbedaan `ref` vs `useState` di dalam Composable:
- **`useState('key', ...)`**: Menciptakan state yang **Shared (Global)**. Jika diubah di satu tempat, semua tempat yang memanggilnya akan ikut ter-update.
- **`ref()`**: Menciptakan state yang **Private (Local)** per pemanggilan fungsi. Setiap komponen yang memanggilnya akan mendapatkan "salinan" baru.

**Contoh:**
```typescript
export const useApp = () => {
  const global = useState('key', () => 0) // Data barengan
  const lokal = ref(0)                   // Data masing-masing
  return { global, lokal }
}
```

---

## 7. State Management: Pinia
Pinia adalah library state management resmi untuk Vue 3, yang terintegrasi dengan Nuxt 4. Ia menyediakan cara terstruktur untuk mengelola state global yang lebih scalable dibanding `useState`.

### Karakteristik Utama:
- **Terstruktur**: Menggunakan **Store** dengan state, actions, dan getters.
- **Scalable**: Cocok untuk aplikasi besar dengan banyak state.
- **TypeScript Friendly**: Auto-infer tipe, lebih aman dan IDE-friendly.
- **DevTools Integration**: Bisa inspect state di Vue DevTools.
- **Plugins**: Mendukung persist (localStorage), undo/redo, dll.
- **SSR Compatible**: Bekerja baik dengan Nuxt SSR.

### Setup di Nuxt:
1. Install: `npm install pinia @pinia/nuxt`
2. Tambah module di `nuxt.config.ts`:
   ```typescript
   export default defineNuxtConfig({
     modules: ['@pinia/nuxt']
   })
   ```
3. Buat store di `app/stores/`: Auto-imported.

### Contoh Penggunaan:
```typescript
// app/stores/app.ts
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const counter = ref(0)  // State
  const increment = () => counter.value++  // Action
  const decrement = () => counter.value--  // Action
  const isEven = computed(() => counter.value % 2 === 0)  // Getter

  return { counter, increment, decrement, isEven }
})
```

```vue
<!-- Di komponen -->
<script setup>
const appStore = useAppStore()
</script>
<template>
  <p>Counter: {{ appStore.counter }}</p>
  <button @click="appStore.increment">+</button>
  <p>Status: {{ appStore.isEven ? 'Genap' : 'Ganjil' }}</p>
</template>
```

### Perbandingan: Pinia vs `useState`

| Fitur                | `useState`                          | Pinia                                |
| :------------------- | :---------------------------------- | :----------------------------------- |
| **Struktur**         | Sederhana, hanya state + key.       | Store dengan actions, getters.       |
| **Scalability**      | Baik untuk kecil, tapi tidak rapi besar. | **Sangat scalable** untuk app besar. |
| **TypeScript**       | Manual typing.                      | **Auto-infer** tipe.                 |
| **DevTools**         | Terbatas.                           | **Penuh support** di Vue DevTools.   |
| **Plugins**          | Tidak ada.                          | Banyak (persist, dll).               |
| **SSR**              | Ya, tapi sederhana.                 | Ya, optimized.                       |

> **Kapan pakai Pinia?** Jika app mulai kompleks (auth, cart, settings), atau butuh devtools/debugging. Untuk hal kecil, `useState` cukup.
