# ⏱️ Timekeeper Dashboard

Dashboard real-time untuk mengelola rundown acara dengan tampilan bergaya **Notebook** (buku tulis). Dibangun menggunakan **Nuxt 4** dan **Pinia**.

> Untuk dokumentasi teknis lengkap (arsitektur, tipe data, store, API), lihat [docs/TECHNICAL.md](docs/TECHNICAL.md).

---

## ✨ Fitur Utama

- **📖 Tampilan Notebook** — UI bergaya buku tulis dengan garis biru, garis margin merah, tombol sketsa, dan font tulisan tangan (Patrick Hand, Caveat, Courier Prime).
- **⏱️ Pelacakan Waktu Real-time** — Mulai, hentikan, dan lacak setiap agenda dengan timer yang berjalan langsung di layar.
- **⚡ Penjadwalan Dinamis** — Estimasi waktu mulai agenda berikutnya otomatis dihitung ulang saat ada perubahan durasi atau urutan.
- **📌 Pengingat per Divisi** — Setiap agenda bisa memiliki pengingat khusus per divisi (contoh: "Cek Laptop & Proyektor" untuk Logistik di -10 menit sebelum agenda).
- **🔄 Drag & Drop** — Susun ulang urutan agenda dengan menarik dan melepas item di mode edit.
- **📔 Change Log** — Catatan otomatis setiap perubahan waktu, pembatalan, perpindahan urutan, dan penyesuaian durasi.
- **🔔 Notifikasi Toast** — Pemberitahuan interaktif untuk setiap aksi penting (sukses, peringatan, error, info).
- **↩️ Undo / Redo** — Batalkan atau ulangi perubahan (hingga 50 langkah tersimpan).
- **📥 Import CSV** — Impor data agenda dari file CSV/Excel.
- **📊 Export CSV** — Simpan agenda ke file CSV dalam format yang bisa diedit, atau unduh laporan agenda.
- **🕹️ Mode Simulasi** — Lompat ke waktu tertentu untuk menguji tampilan jadwal tanpa menunggu waktu sebenarnya.
- **💾 Penyimpanan Otomatis** — Data agenda tersimpan otomatis di browser (localStorage) dengan key `timekeeper-v1`.

---

## 🚀 Cara Menggunakan

### Prasyarat

- [Node.js](https://nodejs.org/) (versi LTS disarankan)
- npm (sudah termasuk dalam Node.js)

### Instalasi

```bash
npm install
```

### Menjalankan Mode Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000/timekeeper/](http://localhost:3000/timekeeper/) di browser.

### Build untuk Produksi

```bash
npm run build
```

Hasil build berada di folder `.output/`. Untuk menjalankan:

```bash
node .output/server/index.mjs
```

### Generate Halaman Statis

```bash
npm run generate
```

Hasil generate berada di `.output/public/`, cocok untuk hosting statis seperti GitHub Pages.

### Preview Build Produksi

```bash
npm run preview
```

---

## 📖 Panduan Penggunaan

### Tampilan Utama

Halaman utama terbagi menjadi dua panel:

| Panel | Lebar | Isi |
|-------|-------|-----|
| **Kiri** | 60% (desktop) / 100% (mobile) | Timeline & daftar agenda |
| **Kanan** | 40% (desktop) / slide-up (mobile) | Detail agenda yang dipilih |

Header menampilkan **nama acara** (bisa diedit dengan klik), **tanggal**, **jam real-time**, dan indikator **LIVE EVENT MODE** saat ada agenda berjalan.

### Mengelola Agenda

| Aksi | Cara |
|------|------|
| **Memilih agenda** | Klik item agenda di panel kiri |
| **Memulai agenda** | Klik tombol mulai di panel detail |
| **Menyelesaikan agenda** | Klik tombol selesai — otomatis berpindah ke agenda berikutnya |
| **Membatalkan agenda** | Klik tombol batal — status menjadi `cancelled` |
| **Menyesuaikan durasi** | Gunakan tombol +/- menit di panel detail |
| **Mengedit catatan** | Tulis langsung di kolom catatan pada panel detail |
| **Menambah agenda** | Buka modal tambah agenda melalui tombol tambah |
| **Mengedit agenda** | Buka modal edit dari panel detail |
| **Menghapus agenda** | Hapus melalui modal edit |
| **Mengubah urutan** | Aktifkan mode edit, lalu drag & drop item agenda |

### Pengingat (Reminders)

Setiap agenda dapat memiliki satu atau lebih pengingat yang terikat pada divisi tertentu:

- **Offset waktu**: menit relatif terhadap waktu mulai agenda (contoh: `-10` berarti 10 menit sebelum, `0` berarti saat agenda dimulai, `+5` berarti 5 menit setelah mulai)
- **Divisi**: nama divisi tujuan (contoh: Logistik, MC, Sound, Acara, Akademik, Panitia)
- **Pesan**: instruksi singkat (contoh: "Cek Laptop & Proyektor")
- **Ikon**: emoji opsional (contoh: 📽️, 🎁, 📋)

### Import & Export Data

Akses melalui tombol **📁 Menu Data** di header:

| Menu | Fungsi |
|------|--------|
| **📥 Import dari Excel** | Impor agenda dari file CSV |
| **📁 Simpan ke Excel** | Export agenda dalam format CSV 7 kolom (bisa di-import kembali): `Judul Agenda, Durasi (menit), PIC, Deskripsi, Rem-Waktu, Rem-Divisi, Rem-Pesan` |
| **📊 Laporan (CSV)** | Unduh laporan lengkap dengan data aktual: `Judul, PIC, Status, Rencana Mulai, Rencana Durasi (m), Aktual Mulai, Aktual Selesai, Aktual Durasi (m), Catatan` |

### Mode Simulasi

1. Klik jam digital di header untuk menampilkan opsi developer.
2. Klik **⏱️ Test Waktu** untuk mengaktifkan mode simulasi.
3. Gunakan input waktu untuk melompat ke jam tertentu.
4. Gunakan tombol ⏸️ / ▶️ untuk pause/resume simulasi.
5. Klik ✖ untuk kembali ke waktu nyata.

### Undo / Redo

Setiap aksi yang mengubah data agenda (mulai, selesai, batal, ubah durasi, ubah urutan, tambah, hapus, import) menyimpan snapshot. Gunakan tombol undo/redo untuk membatalkan atau mengulangi perubahan. Maksimal 50 snapshot tersimpan.

### Reset Data

Gunakan fungsi reset untuk mengembalikan data ke dummy data bawaan. Data di localStorage akan dihapus.

---

## 🧪 Pengujian

### Unit & Integration Test (Vitest)

```bash
npm run test
```

File test yang tersedia:

| File | Cakupan |
|------|---------|
| `app/composables/useTimer.test.ts` | Logika timer (start, pause, reset) |
| `app/composables/useTimeFormatter.test.ts` | Fungsi format waktu dan tanggal |
| `app/components/StatusCard.test.ts` | Rendering komponen StatusCard |
| `app/components/timekeeper/TimelineView.test.ts` | Rendering komponen TimelineView |

Mode UI interaktif:

```bash
npm run test:ui
```

### End-to-End Test (Playwright)

```bash
npx playwright test
```

Lihat laporan:

```bash
npx playwright show-report
```

---

## 🛠️ Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| [Nuxt](https://nuxt.com/) | ^4.2.2 | Framework utama (Vue 3) |
| [Vue](https://vuejs.org/) | ^3.5.26 | UI framework |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.4 | State management |
| [Vue Router](https://router.vuejs.org/) | ^4.6.4 | Routing |
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.17 | Utility CSS framework |
| [Vitest](https://vitest.dev/) | ^3.0.0 | Unit & integration testing |
| [Playwright](https://playwright.dev/) | ^1.57.0 | End-to-end testing |

---

## 📂 Struktur Proyek

```
timekeeper/
├── app/
│   ├── app.vue                          # Root component
│   ├── pages/
│   │   └── index.vue                    # Halaman utama dashboard
│   ├── components/
│   │   ├── Card.vue                     # Komponen kartu generik
│   │   ├── Button.vue                   # Komponen tombol generik
│   │   ├── StatusCard.vue               # Kartu status dengan warna dinamis
│   │   └── timekeeper/                  # Komponen spesifik Timekeeper
│   │       ├── AgendaItem.vue           # Baris agenda tunggal
│   │       ├── AgendaList.vue           # Daftar agenda
│   │       ├── AgendaDetail.vue         # Panel detail agenda
│   │       ├── AgendaTimer.vue          # Tampilan timer (MM:SS)
│   │       ├── AgendaReminders.vue      # Pengingat per divisi
│   │       ├── TimelineView.vue         # Visualisasi timeline
│   │       ├── TimelineBlock.vue        # Blok unit timeline
│   │       ├── TimelinePin.vue          # Pin penanda timeline
│   │       ├── TimeJumpNav.vue          # Navigasi Now/Next/Previous
│   │       ├── AddEditAgendaModal.vue   # Modal tambah/edit agenda
│   │       ├── ImportAgendasModal.vue   # Modal import CSV
│   │       ├── ConfirmationModal.vue    # Modal konfirmasi aksi destruktif
│   │       ├── InlineEdit.vue           # Komponen edit inline
│   │       ├── ChangeLog.vue            # Panel catatan perubahan
│   │       ├── Toast.vue                # Notifikasi toast tunggal
│   │       ├── ToastContainer.vue       # Container toast
│   │       └── LoadingSkeleton.vue      # Skeleton loading
│   ├── stores/
│   │   └── timekeeper.ts               # Pinia store utama
│   ├── composables/
│   │   ├── useTimer.ts                  # Logika timer (start, pause, reset)
│   │   ├── useToast.ts                  # Sistem notifikasi toast
│   │   ├── useTimeFormatter.ts          # Utilitas format waktu & tanggal
│   │   └── useAppStatus.ts             # Status global aplikasi
│   ├── types/
│   │   └── index.ts                     # Definisi tipe TypeScript
│   └── layouts/
│       └── default.vue                  # Layout default
├── server/
│   └── api/
│       └── stats.ts                     # API endpoint /api/stats (data mock)
├── assets/
│   └── css/
│       └── notebook.css                 # CSS gaya notebook
├── e2e/
│   └── basic-flows.spec.ts             # Test E2E Playwright
├── test/
│   └── setup.ts                         # Setup global Vitest
├── public/                              # Aset statis
├── nuxt.config.ts                       # Konfigurasi Nuxt
├── tailwind.config.js                   # Konfigurasi Tailwind CSS
├── vitest.config.ts                     # Konfigurasi Vitest
├── playwright.config.ts                 # Konfigurasi Playwright
├── tsconfig.json                        # Konfigurasi TypeScript
└── package.json                         # Dependencies & scripts
```

---

## 🌐 Deployment

Aplikasi ini dikonfigurasi dengan `ssr: false` dan `baseURL: '/timekeeper/'`, cocok untuk hosting statis di **GitHub Pages**.

### GitHub Pages

```bash
npm run generate
```

Upload isi `.output/public/` ke branch `gh-pages`.

### VPS (dengan PM2)

```bash
npm run build
npm install -g pm2
pm2 start .output/server/index.mjs --name "timekeeper-app"
```

### Vercel / Netlify

Platform ini otomatis mendeteksi proyek Nuxt. Cukup hubungkan repository, dan deployment berjalan otomatis.

---

## 📝 Lisensi

MIT
