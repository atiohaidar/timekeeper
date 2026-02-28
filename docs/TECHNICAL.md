# 📘 Dokumentasi Teknis — Timekeeper Dashboard

Dokumen ini menjelaskan arsitektur, model data, state management, composables, API, dan konfigurasi teknis dari proyek Timekeeper Dashboard.

> Untuk panduan penggunaan dan cara instalasi, lihat [README.md](../README.md).

---

## Daftar Isi

- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Tipe Data (TypeScript)](#tipe-data-typescript)
- [State Management (Pinia Store)](#state-management-pinia-store)
- [Composables](#composables)
- [Komponen](#komponen)
- [Server API](#server-api)
- [Styling & Theming](#styling--theming)
- [Konfigurasi](#konfigurasi)
- [Testing](#testing)

---

## Arsitektur Aplikasi

Aplikasi ini menggunakan arsitektur **Nuxt 4** dengan rendering sisi klien (`ssr: false`). Tidak ada autentikasi atau database — semua data disimpan di `localStorage` browser.

```
┌─────────────────────────────────────────────────┐
│                   app.vue                        │
│            (NuxtLayout + NuxtPage)               │
├─────────────────────────────────────────────────┤
│                 pages/index.vue                  │
│         (Halaman utama dashboard)                │
│  ┌──────────────────┬──────────────────────┐     │
│  │  TimelineView    │   AgendaDetail       │     │
│  │  (Panel Kiri)    │   (Panel Kanan)      │     │
│  └──────────────────┴──────────────────────┘     │
├─────────────────────────────────────────────────┤
│              stores/timekeeper.ts                 │
│        (Pinia Store — state sentral)             │
├─────────────────────────────────────────────────┤
│               localStorage                       │
│          (Persistensi data, key:                 │
│            'timekeeper-v1')                      │
└─────────────────────────────────────────────────┘
```

**Alur data:**

1. `pages/index.vue` menggunakan `useTimekeeperStore()` untuk mengakses dan memanipulasi state.
2. Store (`stores/timekeeper.ts`) mengelola semua logika bisnis, termasuk timer, penjadwalan, undo/redo, dan persistensi.
3. Komponen di `components/timekeeper/` menerima data via props atau langsung dari store, dan mengirim aksi via emit.
4. Perubahan data otomatis disimpan ke `localStorage` melalui `watch` deep pada `agendas`.

---

## Tipe Data (TypeScript)

Definisi tipe berada di `app/types/index.ts`.

### `AgendaStatus`

```typescript
type AgendaStatus = 'waiting' | 'running' | 'done' | 'cancelled'
```

### `Reminder`

```typescript
interface Reminder {
    id: string
    offsetMinutes: number  // Menit relatif terhadap waktu mulai agenda (bisa negatif)
    division: string       // Nama divisi (contoh: "MC", "Sound", "Logistik")
    message: string        // Instruksi singkat
    icon?: string          // Emoji opsional
}
```

### `Agenda`

```typescript
interface Agenda {
    id: string
    title: string
    pic: string                    // Person in Charge
    plannedStartTime: Date
    plannedDuration: number        // Dalam menit
    actualStartTime: Date | null
    actualEndTime: Date | null
    actualDurationSeconds?: number // Durasi aktual dalam detik
    status: AgendaStatus
    description: string
    notes: string
    order: number                  // Urutan dalam timeline
    reminders: Reminder[]
}
```

### `ChangeLogEntry`

```typescript
interface ChangeLogEntry {
    id: string
    timestamp: Date
    type: 'delay' | 'cancel' | 'swap' | 'adjust' | 'start' | 'done'
    description: string
    agendaId: string
    agendaTitle: string
}
```

---

## State Management (Pinia Store)

Store utama didefinisikan di `app/stores/timekeeper.ts` menggunakan Composition API (`defineStore` dengan setup function).

### State

| State | Tipe | Deskripsi |
|-------|------|-----------|
| `eventName` | `ref<string>` | Nama acara (default: `'Big Class 2 Islah 1 2022'`) |
| `agendas` | `ref<Agenda[]>` | Array semua agenda |
| `selectedAgendaId` | `ref<string \| null>` | ID agenda yang sedang dipilih |
| `changeLog` | `ref<ChangeLogEntry[]>` | Riwayat perubahan |
| `isChangeLogVisible` | `ref<boolean>` | Visibilitas panel change log |
| `isEditMode` | `ref<boolean>` | Status mode edit |
| `currentTime` | `ref<Date>` | Waktu saat ini (real atau simulasi) |
| `isSimulated` | `ref<boolean>` | Status mode simulasi |
| `isPaused` | `ref<boolean>` | Status pause simulasi |
| `elapsedSeconds` | `ref<number>` | Detik berjalan untuk agenda aktif |
| `undoStack` | `ref<string[]>` | Stack undo (JSON string, maks 50) |
| `redoStack` | `ref<string[]>` | Stack redo (JSON string) |

### Computed Properties

| Computed | Tipe Return | Deskripsi |
|----------|-------------|-----------|
| `selectedAgenda` | `Agenda \| null` | Objek agenda yang sedang dipilih |
| `runningAgenda` | `Agenda \| null` | Agenda dengan status `'running'` |
| `sortedAgendas` | `Agenda[]` | Agenda diurutkan berdasarkan `order` |
| `estimatedStartTimes` | `Map<string, Date>` | Peta estimasi waktu mulai untuk semua agenda |

### Actions

#### Agenda Management

| Action | Parameter | Deskripsi |
|--------|-----------|-----------|
| `selectAgenda(id)` | `id: string` | Memilih agenda untuk ditampilkan di panel detail |
| `startAgenda(id)` | `id: string` | Memulai agenda — menghentikan agenda yang sedang berjalan jika ada, menyetel `actualStartTime` ke waktu saat ini, mereset `elapsedSeconds` |
| `stopAgenda(id, markDone?)` | `id: string, markDone: boolean = true` | Menghentikan agenda — menyetel `actualEndTime`, `actualDurationSeconds`; jika `markDone=true`, status menjadi `'done'` dan otomatis memilih agenda berikutnya |
| `cancelAgenda(id)` | `id: string` | Membatalkan agenda — status menjadi `'cancelled'`, otomatis memilih agenda `'waiting'` berikutnya, menghitung ulang jadwal |
| `adjustTime(id, minutes)` | `id: string, minutes: number` | Mengubah `plannedDuration` — minimal 1 menit, mengembalikan `boolean` (berhasil/gagal) |
| `updateNotes(id, notes)` | `id: string, notes: string` | Memperbarui catatan agenda |
| `addAgenda(data, insertAfterId?)` | `data: Partial<Agenda>, insertAfterId?: string` | Menambah agenda baru — bisa disisipkan setelah agenda tertentu, default durasi 15 menit |
| `updateAgenda(id, updates)` | `id: string, updates: Partial<Agenda>` | Memperbarui properti agenda |
| `deleteAgenda(id)` | `id: string` | Menghapus agenda dan menormalisasi ulang urutan |
| `reorderAgendas(fromIndex, toIndex)` | `fromIndex: number, toIndex: number` | Memindahkan agenda dari posisi satu ke posisi lain, menghitung ulang jadwal |

#### Reminder Management

| Action | Parameter | Deskripsi |
|--------|-----------|-----------|
| `addReminder(agendaId, reminder)` | `agendaId: string, reminder: Omit<Reminder, 'id'>` | Menambah pengingat ke agenda |
| `updateReminder(agendaId, reminderId, updates)` | `agendaId: string, reminderId: string, updates: Partial<Omit<Reminder, 'id'>>` | Memperbarui pengingat |
| `deleteReminder(agendaId, reminderId)` | `agendaId: string, reminderId: string` | Menghapus pengingat |

#### Data Management

| Action | Deskripsi |
|--------|-----------|
| `importAgendas(newAgendas, replace)` | Impor agenda dari data CSV — `replace=true` mengganti semua, `replace=false` menambahkan di akhir |
| `exportCurrentAgendas()` | Export agenda ke CSV format 7 kolom (dengan BOM UTF-8 untuk kompatibilitas Excel): `Judul Agenda, Durasi (menit), PIC, Deskripsi, Rem-Waktu, Rem-Divisi, Rem-Pesan` |
| `downloadReport()` | Unduh laporan CSV format 9 kolom: `Judul, PIC, Status, Rencana Mulai, Rencana Durasi (m), Aktual Mulai, Aktual Selesai, Aktual Durasi (m), Catatan` |
| `resetData()` | Reset semua data ke dummy data bawaan (dengan konfirmasi), menghapus localStorage |

#### Undo/Redo

| Action | Deskripsi |
|--------|-----------|
| `undo()` | Mengembalikan state agenda ke snapshot sebelumnya |
| `redo()` | Mengulangi state agenda yang di-undo |

Fungsi helper internal:
- `snapshot()` — Menyimpan snapshot JSON dari `agendas` ke `undoStack` (maks 50 entry). Dipanggil sebelum setiap aksi mutasi.
- `canUndo()` / `canRedo()` — Mengecek apakah undo/redo tersedia.

#### Simulasi Waktu

| Action | Deskripsi |
|--------|-----------|
| `toggleSimulation()` | Mengaktifkan/menonaktifkan mode simulasi |
| `setSimulationTime(date)` | Menyetel waktu simulasi ke `Date` tertentu |
| `togglePause()` | Pause/resume jam simulasi |

#### Persistensi

| Mekanisme | Detail |
|-----------|--------|
| Key localStorage | `'timekeeper-v1'` |
| Auto-save | `watch(agendas, ..., { deep: true })` memanggil `saveToStorage()` |
| Auto-load | `loadFromStorage()` dipanggil saat inisialisasi di client |
| Date parsing | Custom `dateReviver` untuk mengembalikan string ISO ke objek `Date` |

#### Central Clock Loop

Store menjalankan `setInterval` setiap 1 detik pada client:
- Jika mode simulasi aktif dan tidak di-pause: `currentTime` di-increment 1 detik.
- Jika mode real-time: `currentTime` di-sync ke `new Date()`.
- Jika ada agenda berjalan (`runningAgenda`): `elapsedSeconds` dihitung dari selisih `currentTime` dan `actualStartTime`.

---

## Composables

### `useTimer` (`app/composables/useTimer.ts`)

Timer lokal sederhana berbasis `setInterval`.

```typescript
const { seconds, isActive, start, pause, reset } = useTimer()
```

| Return | Tipe | Deskripsi |
|--------|------|-----------|
| `seconds` | `Ref<number>` | Jumlah detik yang telah berlalu |
| `isActive` | `Ref<boolean>` | Apakah timer sedang berjalan |
| `start()` | `() => void` | Memulai timer (increment `seconds` setiap 1 detik) |
| `pause()` | `() => void` | Menjeda timer |
| `reset()` | `() => void` | Menjeda dan mereset `seconds` ke 0 |

### `useToast` (`app/composables/useToast.ts`)

Sistem notifikasi toast global menggunakan shared `ref`.

```typescript
const toast = useToast()
toast.success('Berhasil!')
toast.error('Gagal!')
toast.warning('Perhatian!')
toast.info('Informasi')
```

| Return | Tipe | Deskripsi |
|--------|------|-----------|
| `toasts` | `Ref<ToastMessage[]>` | Array toast yang aktif |
| `addToast(message, type)` | `(string, type) => void` | Menambah toast baru |
| `removeToast(id)` | `(string) => void` | Menghapus toast berdasarkan ID |
| `success(msg)` | `(string) => void` | Toast hijau (sukses) |
| `error(msg)` | `(string) => void` | Toast merah (error) |
| `warning(msg)` | `(string) => void` | Toast kuning (peringatan) |
| `info(msg)` | `(string) => void` | Toast biru (info) |

Tipe `ToastMessage`:

```typescript
interface ToastMessage {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
}
```

### `useTimeFormatter` (`app/composables/useTimeFormatter.ts`)

Utilitas format waktu dan tanggal menggunakan locale Indonesia (`id-ID`).

```typescript
const { formatTime, formatDate, formatDuration } = useTimeFormatter()
```

| Fungsi | Input | Output Contoh |
|--------|-------|---------------|
| `formatTime(date)` | `Date \| string \| null` | `"08:30"` atau `"--:--"` jika null/invalid |
| `formatDate(date)` | `Date \| string \| null` | `"Jumat, 15 Januari 2025"` atau `"-"` jika null/invalid |
| `formatDuration(minutes)` | `number` | `"1j 30m"` atau `"45m"` |

### `useAppStatus` (`app/composables/useAppStatus.ts`)

Status global aplikasi.

```typescript
const { globalAppTitle, localVisitTime } = useAppStatus()
```

| Return | Tipe | Deskripsi |
|--------|------|-----------|
| `globalAppTitle` | `Ref<string>` (global via `useState`) | Judul aplikasi: `'Timekeeper v1.0'` |
| `localVisitTime` | `Ref<string>` (lokal per panggilan) | Waktu kunjungan lokal |

---

## Komponen

### Komponen Umum

| Komponen | File | Deskripsi |
|----------|------|-----------|
| `Card` | `app/components/Card.vue` | Komponen kartu generik |
| `Button` | `app/components/Button.vue` | Komponen tombol generik |
| `StatusCard` | `app/components/StatusCard.vue` | Kartu status dengan warna dinamis berdasarkan props |

### Komponen Timekeeper

| Komponen | File | Deskripsi |
|----------|------|-----------|
| `AgendaItem` | `timekeeper/AgendaItem.vue` | Baris agenda tunggal dalam daftar |
| `AgendaList` | `timekeeper/AgendaList.vue` | Daftar agenda (container) |
| `AgendaDetail` | `timekeeper/AgendaDetail.vue` | Panel detail agenda — menampilkan info lengkap, tombol aksi, catatan, pengingat |
| `AgendaTimer` | `timekeeper/AgendaTimer.vue` | Tampilan timer dalam format MM:SS |
| `AgendaReminders` | `timekeeper/AgendaReminders.vue` | Daftar pengingat per divisi untuk agenda |
| `TimelineView` | `timekeeper/TimelineView.vue` | Visualisasi timeline seluruh agenda |
| `TimelineBlock` | `timekeeper/TimelineBlock.vue` | Blok unit dalam timeline |
| `TimelinePin` | `timekeeper/TimelinePin.vue` | Pin penanda posisi waktu saat ini di timeline |
| `TimeJumpNav` | `timekeeper/TimeJumpNav.vue` | Navigasi cepat: Now, Next, Previous |
| `AddEditAgendaModal` | `timekeeper/AddEditAgendaModal.vue` | Modal untuk menambah atau mengedit agenda |
| `ImportAgendasModal` | `timekeeper/ImportAgendasModal.vue` | Modal untuk import agenda dari CSV |
| `ConfirmationModal` | `timekeeper/ConfirmationModal.vue` | Modal konfirmasi untuk aksi destruktif |
| `InlineEdit` | `timekeeper/InlineEdit.vue` | Komponen edit inline |
| `ChangeLog` | `timekeeper/ChangeLog.vue` | Panel catatan perubahan (change log) |
| `Toast` | `timekeeper/Toast.vue` | Notifikasi toast tunggal |
| `ToastContainer` | `timekeeper/ToastContainer.vue` | Container untuk menampilkan kumpulan toast |
| `LoadingSkeleton` | `timekeeper/LoadingSkeleton.vue` | Skeleton loading untuk state loading awal |

---

## Server API

### `GET /api/stats`

**File:** `server/api/stats.ts`

Endpoint mock yang mengembalikan data statistik simulasi. Tidak memerlukan autentikasi.

**Response:**

```json
{
  "status": "success",
  "data": {
    "uptime": "99.9%",
    "usersActive": 42,
    "serverTime": "14:30:05",
    "version": "4.2.2"
  }
}
```

| Field | Tipe | Deskripsi |
|-------|------|-----------|
| `uptime` | `string` | Uptime statis `"99.9%"` |
| `usersActive` | `number` | Angka random 0–99 |
| `serverTime` | `string` | Waktu server saat request |
| `version` | `string` | Versi statis `"4.2.2"` |

---

## Styling & Theming

### Tailwind CSS (`tailwind.config.js`)

#### Warna Kustom

| Grup | Nama | Hex | Deskripsi |
|------|------|-----|-----------|
| `notebook` | `paper` | `#ffffff` | Latar kertas putih |
| `notebook` | `paper-dark` | `#f8f9fa` | Abu sangat muda untuk hover |
| `notebook` | `lines` | `#a8d4f0` | Garis horizontal biru |
| `notebook` | `margin` | `#e88b8b` | Garis margin merah |
| `notebook` | `ink` | `#2c3e50` | Teks utama (tinta gelap) |
| `notebook` | `ink-light` | `#5a6c7d` | Teks sekunder |
| `pen` | `blue` | `#1e5799` | Pena biru |
| `pen` | `red` | `#c0392b` | Pena merah |
| `pen` | `green` | `#27ae60` | Pena hijau (done) |
| `pen` | `gray` | `#7f8c8d` | Pensil abu |

#### Font Kustom

| Nama Class | Font | Tipe |
|------------|------|------|
| `font-handwritten` | Patrick Hand | Cursive |
| `font-handwritten-alt` | Caveat | Cursive |
| `font-typewriter` | Courier Prime | Monospace |

Font dimuat via Google Fonts di `nuxt.config.ts`.

#### Animasi Kustom

| Nama | Deskripsi |
|------|-----------|
| `wobble` | Rotasi ±1° selama 0.3 detik |
| `pulse-soft` | Opacity 1→0.7→1 selama 2 detik (infinite) |

### CSS Notebook (`assets/css/notebook.css`)

Class-class utama:

| Class | Deskripsi |
|-------|-----------|
| `.notebook-paper` | Latar kertas dengan garis biru dan garis margin merah |
| `.notebook-paper-simple` | Latar kertas dengan garis biru tanpa garis margin |
| `.notebook-paper-ruled` | Varian kertas bergaris dengan tekstur grain |
| `.btn-sketchy` | Tombol bergaya sketsa tangan dengan border asimetris |
| `.btn-sketchy-large` | Varian tombol sketsa yang lebih besar |
| `.btn-sketchy-primary` | Tombol sketsa warna biru |
| `.btn-sketchy-danger` | Tombol sketsa warna merah |
| `.btn-sketchy-success` | Tombol sketsa warna hijau |
| `.border-sketchy` | Border bergaya sketsa |
| `.border-sketchy-light` | Border sketsa yang lebih tipis |
| `.underline-hand` | Garis bawah bergaya tulisan tangan (SVG) |
| `.highlight-circle` | Lingkaran sorotan merah (untuk item aktif) |
| `.progress-bar-hand` | Progress bar bergaya sketsa dengan pola strip |
| `.textarea-notebook` | Textarea dengan latar kertas bergaris |
| `.badge-status` | Badge status dasar |
| `.badge-waiting` | Badge status menunggu (abu) |
| `.badge-running` | Badge status berjalan (biru, dengan animasi pulse) |
| `.badge-done` | Badge status selesai (hijau) |
| `.badge-cancelled` | Badge status dibatalkan (abu, coret) |
| `.changelog-panel` | Panel change log dengan border kiri merah |
| `.changelog-entry` | Entry change log dengan garis putus-putus |
| `.draggable-item` | Item yang bisa di-drag (cursor grab) |
| `.drop-zone` | Area drop untuk drag & drop |
| `.live-indicator` | Indikator LIVE merah dengan animasi blink |
| `.text-highlight` | Efek stabilo kuning |
| `.sticky-note` | Catatan tempel kuning dengan efek tape |
| `.paper-texture` | Overlay tekstur kertas |
| `.box-sketchy` | Box dengan border ganda bergaya sketsa |
| `.checkmark-hand` | Tanda centang bergaya tulisan tangan |

---

## Konfigurasi

### `nuxt.config.ts`

| Pengaturan | Nilai | Deskripsi |
|------------|-------|-----------|
| `future.compatibilityVersion` | `4` | Menggunakan kompatibilitas Nuxt 4 |
| `ssr` | `false` | Rendering sisi klien saja |
| `app.baseURL` | `'/timekeeper/'` | Base URL untuk GitHub Pages |
| `modules` | `['@pinia/nuxt', '@nuxtjs/tailwindcss']` | Modul Nuxt yang digunakan |
| `css` | `['~/assets/css/notebook.css']` | CSS global yang dimuat |
| `pinia.storesDirs` | `['./stores/**']` | Direktori store Pinia |
| `devtools.enabled` | `true` | Vue DevTools aktif saat development |

Google Fonts (Caveat, Patrick Hand, Courier Prime) dimuat melalui tag `<link>` di `app.head`.

### `vitest.config.ts`

| Pengaturan | Nilai |
|------------|-------|
| Plugin | `@vitejs/plugin-vue` |
| Environment | `jsdom` |
| Globals | `true` |
| Setup files | `./test/setup.ts` |
| Exclude | `e2e/**`, `node_modules/**` |

### `playwright.config.ts`

| Pengaturan | Nilai |
|------------|-------|
| Test directory | `./e2e` |
| Reporter | `html` |
| Base URL | `http://localhost:3000` |
| Browser | Chromium (Desktop Chrome) |
| Web server | `npm run dev` (auto-start) |
| Trace | On first retry |

### `tsconfig.json`

TypeScript dikonfigurasi melalui referensi ke file yang di-generate oleh Nuxt (`.nuxt/tsconfig.json`).

---

## Testing

### Unit & Integration Test (Vitest)

| File Test | File Target | Cakupan |
|-----------|-------------|---------|
| `app/composables/useTimer.test.ts` | `useTimer.ts` | `start()`: timer berjalan dan increment seconds; `pause()`: timer berhenti; `reset()`: seconds kembali ke 0 |
| `app/composables/useTimeFormatter.test.ts` | `useTimeFormatter.ts` | `formatTime()`: format jam:menit; `formatDate()`: format tanggal Indonesia; `formatDuration()`: format durasi jam/menit; penanganan input null/invalid |
| `app/components/StatusCard.test.ts` | `StatusCard.vue` | Rendering props (title, value, color); class CSS dinamis berdasarkan prop color |
| `app/components/timekeeper/TimelineView.test.ts` | `TimelineView.vue` | Rendering komponen TimelineView |

Perintah:

```bash
npm run test          # Jalankan semua test
npm run test:ui       # Mode UI interaktif
```

### E2E Test (Playwright)

| Test | Deskripsi |
|------|-----------|
| `should load homepage and display timer` | Verifikasi halaman utama dimuat dengan judul dan tampilan timer |
| `should start and pause timer` | Verifikasi tombol start berfungsi |
| `should increment and decrement counter` | Verifikasi tombol increment/decrement berfungsi |
| `should navigate to about page and share counter` | Verifikasi navigasi antar halaman |
| `should fetch and display API stats` | Verifikasi data API `/api/stats` ditampilkan |
| `should navigate to custom page with different layout` | Verifikasi navigasi ke halaman dengan layout berbeda |

Perintah:

```bash
npx playwright test           # Jalankan semua E2E test
npx playwright show-report    # Lihat laporan HTML
```

---

## Catatan Keamanan

- Tidak ada sistem autentikasi atau otorisasi.
- Semua data disimpan di `localStorage` browser (per-device, per-browser).
- API endpoint `/api/stats` mengembalikan data mock tanpa autentikasi.
- Aplikasi berjalan sepenuhnya di sisi klien (`ssr: false`).
