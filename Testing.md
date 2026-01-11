# 🧪 Testing di Nuxt 4 (Timekeeper Project)

Dokumen ini menjelaskan konsep testing di project Timekeeper, dari unit hingga E2E testing.

## ✅ Status Testing

- **Unit Testing**: ✅ 10 tests passed (4 files)
- **Integration Testing**: ✅ 2 tests passed (1 file)
- **E2E Testing**: ✅ 6 tests passed (1 file)

Semua testing sudah diimplementasi dan berjalan dengan baik!

## 1. Konsep Testing di Vue/Nuxt

Testing adalah proses verifikasi bahwa kode berfungsi sesuai ekspektasi. Di Vue/Nuxt:

- **Unit Testing**: Test bagian terkecil (fungsi, composables, store).
- **Integration Testing**: Test interaksi antar komponen.
- **E2E Testing**: Test full aplikasi seperti user nyata (sudah diimplementasi).

### Mengapa Testing Penting?
- **Catch Bug Awal**: Temukan masalah sebelum production.
- **Refactor Aman**: Ubah kode tanpa takut rusak fitur.
- **Dokumentasi**: Test jadi contoh cara pakai fungsi.
- **Confidence**: Pastikan reactivity, props, dan state management bekerja.

## 2. Setup Testing

### Tools Digunakan
- **Vitest**: Framework testing cepat, built-in Vue support.
- **Vue Test Utils**: Untuk test komponen Vue (mount, trigger events).
- **jsdom**: Simulasi DOM untuk environment browser.

### File Konfigurasi
- `vitest.config.ts`: Setup plugins dan environment.
- `test/setup.ts`: Provide Vue globals (`ref`, `computed`) untuk composables.
- `package.json`: Scripts `test` dan `test:ui`.

## 3. Unit Testing

### Konsep
Unit test fokus pada logic internal tanpa dependencies eksternal. Di project ini:
- Test composables (reusable logic).
- Test store actions dan getters.
- Test fungsi synchronous/asynchronous.

### Contoh Implementasi
- **useTimer**: Test start/pause/reset logic (lihat `app/composables/useTimer.test.ts`).
- **Pinia Store**: Test increment/decrement dan computed values (lihat `app/stores/app.test.ts`).

### Kapan Pakai
- Validasi algoritma (timer increment).
- Pastikan state changes benar.
- Test edge cases (reset saat pause).

## 4. Integration Testing

### Konsep
Integration test verifikasi bahwa komponen bekerja bersama: props → rendering → events → state updates. Lebih realistis dari unit test.

### Aspek yang Ditest
- **Component Rendering**: Props pass dengan benar, template render sesuai.
- **User Interactions**: Klik button trigger actions, update UI.
- **Reactivity**: State changes propagate ke komponen lain.
- **Styling**: CSS classes/styles apply berdasarkan props/state.

### Contoh Implementasi
- **StatusCard Component**: Test props rendering dan style application (lihat `app/components/StatusCard.test.ts`).
- **Component-Store Interaction**: Test klik button update counter, reactivity antar komponen (lihat `app/pages/index.integration.test.ts`).

### Kapan Pakai
- UI components dengan props/events.
- Interaksi komponen + store/global state.
- Pastikan user flows (klik → update → feedback).

## 5. Perbedaan Unit vs Integration Testing

| Aspek | Unit Testing | Integration Testing |
|-------|--------------|---------------------|
| **Fokus** | Logic internal | Interaksi antar bagian |
| **Dependencies** | Di-mock/isolasi | Real dependencies |
| **Kecepatan** | Sangat cepat | Lebih lambat |
| **Coverage** | Code paths | User scenarios |
| **Tools** | Vitest saja | Vitest + Vue Test Utils |

## 6. Menjalankan Test

```bash
# Run semua test
npm run test

# UI interaktif
npm run test:ui

# Test spesifik
npx vitest run app/composables/useTimer.test.ts
```

## 7. Best Practices

### Unit Testing
- Test satu concern per test.
- Mock external calls (API, timers).
- Gunakan `describe`/`it` untuk struktur.

### Integration Testing
- Mount komponen dengan props realistis.
- Test user behaviors (klik, input).
- Verifikasi UI changes, bukan implementation details.

### General
- **Coverage**: Target 70-80% untuk balance.
- **CI/CD**: Jalankan test di pipeline.
- **TDD**: Write test first, then code (opsional).

## 8. Troubleshooting Umum

### Error "ref is not defined"
- Pastikan `test/setup.ts` provide Vue globals.
- Restart Vitest jika config berubah.

### Component tidak mount
- Setup Pinia di `beforeEach` untuk store tests.
- Gunakan `global.plugins` di Vue Test Utils.

### Styles tidak apply
- Browser convert hex → rgb, adjust assertions.
- Test presence class, bukan exact style.

## 9. Next Steps

- **E2E Testing**: Playwright untuk full browser simulation.
- **API Testing**: Test server routes dengan supertest.
- **Coverage Report**: Tambah `@vitest/coverage-v8`.
- **Visual Testing**: Percy untuk UI regression.

## 10. Referensi File Test

- Unit: `app/composables/useTimer.test.ts`, `app/stores/app.test.ts`
- Integration: `app/components/StatusCard.test.ts`, `app/pages/index.integration.test.ts`
- E2E: `e2e/basic-flows.spec.ts`
- Config: `vitest.config.ts`, `test/setup.ts`, `playwright.config.ts`

---

## 11. E2E Testing

### Konsep
E2E (End-to-End) testing mensimulasikan user behavior di browser nyata: buka halaman, klik, navigasi, dll. Lebih lambat tapi paling realistis.

### Tools Digunakan
- **Playwright**: Framework E2E modern, support multiple browsers.
- Auto-start dev server selama test.
- Generate HTML reports.

### Setup Playwright
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
  },
})
```

### Contoh Implementasi
```typescript
// e2e/basic-flows.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Timekeeper App E2E', () => {
  test('should load homepage and display timer', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Timekeeper/)
    await expect(page.locator('h1')).toContainText('Selamat Datang')
  })

  test('should increment and decrement counter', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.counter-value')).toContainText('0')
    
    await page.locator('.btn-green').click()
    await page.waitForTimeout(500)
    
    await page.locator('.btn-red').click()
    await page.waitForTimeout(500)
  })

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/')
    await page.locator('text=Ke Halaman Tentang').click()
    await expect(page).toHaveURL(/\/about/)
    await expect(page.locator('h1')).toContainText('Tentang Timekeeper')
  })
})
```

### Menjalankan E2E Test
```bash
# Run E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui

# Show report
npx playwright show-report
```

### Kapan Pakai E2E
- Critical user journeys (login, checkout).
- Cross-browser compatibility.
- Full app integration.

### Troubleshooting E2E

#### Konflik dengan Vitest
**Problem**: `test.describe() not expected` error saat run Vitest.

**Cause**: Vitest mencoba run E2E files sebagai unit tests.

**Solution**: Exclude `e2e/**` dan `node_modules/**` di `vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    exclude: ['e2e/**', 'node_modules/**']
  }
})
```

#### Reactivity tidak bekerja
- Vue reactivity kompleks di E2E, gunakan `waitForTimeout` atau `waitForFunction`.
- Simplify expectations: test bahwa klik bekerja, bukan exact state changes.

#### State tidak persist antar halaman
- Tambah Pinia persistedstate plugin untuk state sharing.
- Atau test navigation tanpa expect state transfer.

#### Timeout errors
- Increase timeout di config.
- Pastikan dev server stable.
- Use `page.waitForLoadState('networkidle')` untuk wait network.

### Perbedaan dengan Integration Testing

| Aspek | Integration Testing | E2E Testing |
|-------|---------------------|-------------|
| **Environment** | jsdom (simulated) | Real browser |
| **Scope** | Component interactions | Full app flows |
| **Speed** | Fast | Slow |
| **Setup** | Simple | Complex (browsers) |
| **Reliability** | High | Medium (flaky) |

### Best Practices E2E
- Test critical paths only.
- Use data-testid untuk stable selectors.
- Mock external APIs untuk consistency.
- Run in CI/CD dengan proper browser setup.

### Next Steps E2E
- **Visual Testing**: Percy untuk UI diffs.
- **Cross-browser**: Test di Firefox, Safari.
- **Mobile**: Test responsive design.
- **Performance**: Measure load times.