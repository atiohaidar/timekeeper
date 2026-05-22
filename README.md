# Timekeeper

Timekeeper adalah aplikasi dashboard manajemen rundown acara berbasis web yang dibuat menggunakan Nuxt 4, Vue 3, dan Pinia. Aplikasi ini dirancang untuk mempermudah koordinator acara dalam melacak waktu, memperhitungkan keterlambatan secara dinamis, dan melakukan penyesuaian agenda secara real-time.

Aplikasi ini menggunakan desain visual bertema notebook kertas retro dengan font tulisan tangan kustom, memberikan estetika personal namun tetap fungsional untuk penggunaan di lapangan.

> 📝 **Versi Naskah Akademis (IEEE Paper Format)**
> Proyek ini juga didokumentasikan dalam bentuk paper ilmiah dengan format IEEE 2-kolom. Anda dapat membaca naskah simulasi PDF-nya secara lokal di markdown editor atau mengekspornya di sini: **[README_PAPER.md](./README_PAPER.md)**.

---

## Fitur Utama

*   **Kalkulasi Waktu Kumulatif Otomatis**: Agenda dimodelkan secara berantai. Jika ada satu agenda yang molor atau durasinya diubah, sistem akan otomatis menggeser estimasi waktu mulai dan selesai untuk seluruh agenda berikutnya secara real-time.
*   **Sistem Snapshot (Undo/Redo)**: Menyimpan riwayat perubahan state hingga 50 transaksi terakhir di Pinia store. Mempermudah untuk mengembalikan rundown ke kondisi sebelumnya jika terjadi kesalahan input.
*   **Mode Simulasi Waktu**: Detasemen jam sistem asli untuk kebutuhan uji coba. Anda bisa mempercepat waktu simulasi, mengatur waktu kustom, atau menjeda clock untuk simulasi rundown acara sebelum hari-H.
*   **Inline Editing**: Pengeditan langsung di baris agenda dengan klik biasa, lengkap dengan validasi input otomatis dan auto-save saat blur.
*   **Ekspor & Impor CSV**: Kompatibel penuh dengan spreadsheet (Excel/Google Sheets). Anda bisa mengimpor template rundown dasar atau mengekspor laporan akhir berupa log pelaksanaan acara yang riil.
*   **Notebook Aesthetic**: Tampilan retro menggunakan garis buku tulis fisik dengan dukungan Google Fonts (*Caveat*, *Patrick Hand*, dan *Courier Prime*).

---

## Struktur Folder Proyek

Mengikuti struktur standar Nuxt 4 di dalam folder `app/`:

```bash
timekeeper/
├── app/
│   ├── components/      # Komponen UI modular (StatusCard, TimelineView, dll.)
│   ├── composables/     # Logic reusable (useTimer.ts, useToast.ts)
│   ├── layouts/         # Layout dasar aplikasi
│   ├── pages/           # Halaman utama aplikasi (index.vue)
│   ├── stores/          # State management Pinia (timekeeper.ts)
│   └── types/           # Definisi tipe TypeScript
├── e2e/                 # Pengujian End-to-End berbasis Playwright
├── public/              # Aset statis public
└── server/              # Endpoint backend API sederhana
```

---

## Memulai Aplikasi

### Instalasi Dependensi
```bash
npm install
```

### Menjalankan Development Server
```bash
npm run dev
```

### Build untuk Production
```bash
npm run build
```

---

## Menjalankan Uji Coba (Testing)

Aplikasi ini dilengkapi pengujian otomatis dari unit testing hingga browser automation.

### Unit & Integration Testing (Vitest)
Digunakan untuk menguji fungsi internal (seperti timer composable) dan interaksi antar komponen.
```bash
# Menjalankan tes di terminal
npm run test

# Menjalankan tes dengan dashboard interaktif Vitest
npm run test:ui
```

### End-to-End Testing (Playwright)
Mensimulasikan tindakan pengguna sungguhan di browser untuk memvalidasi alur kerja aplikasi secara keseluruhan.
```bash
# Menjalankan E2E test
npm run test:e2e

# Membuka laporan hasil pengujian
npx playwright show-report
```

---

## Indeks Dokumentasi Lanjutan
Informasi teknis dan catatan pengembangan lebih mendalam tersedia di berkas berikut:
*   🧠 **Konsep & Reactivity Store:** [Konsep.md](./Konsep.md)
*   🧪 **Detail Setup Testing:** [Testing.md](./Testing.md)
*   💅 **Rangkuman Perbaikan UX & Shortcuts:** [UX_IMPROVEMENTS.md](./UX_IMPROVEMENTS.md)
*   🟢 **Catatan Migrasi Nuxt 4:** [Nuxt4.md](./Nuxt4.md)
*   🎨 **Integrasi Tailwind CSS:** [Tailwind.md](./Tailwind.md)
*   📦 **Panduan Deploy & Production:** [Production.md](./Production.md)

---

## Pengembang

*   **Atio Haidar** - Lead Software Engineer & Creator
