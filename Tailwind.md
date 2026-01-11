# 🎨 Tailwind CSS di Nuxt.js (Timekeeper Project)

Dokumen ini menjelaskan implementasi Tailwind CSS di project Timekeeper dengan Nuxt 4.

## 📦 Setup Tailwind CSS

### 1. Install Dependencies
```bash
npm install -D tailwindcss @nuxtjs/tailwindcss
```

### 2. Konfigurasi Nuxt
Tambahkan module di `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss'
  ]
})
```

### 3. File Konfigurasi
Buat `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Import CSS
**Dengan @nuxtjs/tailwindcss module**, CSS akan otomatis di-import. Kamu tidak perlu menambahkan import manual.

**Yang perlu dilakukan:**
- Pastikan `assets/css/main.css` ada dengan Tailwind directives
- Module akan otomatis mendeteksi dan menggunakan file tersebut

**Jangan** tambahkan `css: ['~/assets/css/main.css']` di `nuxt.config.ts` karena akan menyebabkan konflik.

## 🎯 Konsep Dasar Tailwind

### Utility-First Approach
Tailwind menggunakan **utility classes** - class kecil yang melakukan satu tugas spesifik:

```html
<!-- ❌ Traditional CSS -->
<div class="card">
  <h2 class="title">Hello</h2>
</div>

<style>
.card { padding: 1rem; border-radius: 0.5rem; }
.title { font-size: 1.5rem; font-weight: bold; }
</style>

<!-- ✅ Tailwind CSS -->
<div class="p-4 rounded-lg bg-white shadow-md">
  <h2 class="text-xl font-bold">Hello</h2>
</div>
```

### Keuntungan:
- **Rapid Development**: Tidak perlu tulis CSS custom
- **Consistent Design**: Sistem design yang konsisten
- **Small Bundle**: Hanya CSS yang digunakan yang di-include
- **Responsive**: Built-in responsive utilities

## 📱 Responsive Design

Tailwind memiliki breakpoint untuk responsive design:

```html
<!-- Mobile-first approach -->
<div class="text-sm md:text-base lg:text-lg xl:text-xl">
  Responsive text size
</div>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

**Breakpoints:**
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+
- `2xl`: 1536px+

## 🎨 Color System

Tailwind memiliki sistem warna yang konsisten:

```html
<!-- Background colors -->
<div class="bg-red-500 bg-blue-600 bg-green-700"></div>

<!-- Text colors -->
<p class="text-gray-900 text-blue-600 text-green-500"></p>

<!-- Opacity variants -->
<div class="bg-blue-500/50 bg-red-500/75"></div>
```

## 📏 Spacing System

Spacing menggunakan scale yang konsisten:

```html
<!-- Padding -->
<div class="p-4 p-6 p-8 p-12 p-16 p-20 p-24"></div>

<!-- Margin -->
<div class="m-4 mt-8 mb-4 ml-2 mr-6"></div>

<!-- Gap untuk flex/grid -->
<div class="flex gap-4 space-x-6"></div>
```

## 🔧 Komponen Reusable

### Button Component
```vue
<!-- components/Button.vue -->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const variantClasses = computed(() => ({
  primary: 'bg-blue-500 hover:bg-blue-600',
  secondary: 'bg-gray-500 hover:bg-gray-600',
  success: 'bg-green-500 hover:bg-green-600',
  danger: 'bg-red-500 hover:bg-red-600'
}[props.variant]))

const sizeClasses = computed(() => ({
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-6 text-base',
  lg: 'py-4 px-8 text-lg'
}[props.size]))
</script>

<template>
  <button
    :class="[
      'text-white font-semibold rounded-lg transition-colors',
      variantClasses,
      sizeClasses,
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>
```

### Card Component
```vue
<!-- components/Card.vue -->
<template>
  <div class="bg-white rounded-lg shadow-md p-6 border border-gray-100">
    <slot></slot>
  </div>
</template>
```

## 🎭 States & Interactions

### Hover States
```html
<button class="bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
  Hover me
</button>
```

### Focus States
```html
<input class="border focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
```

### Dark Mode
```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

## � Troubleshooting

### CSS Import Error
**Error**: `Failed to resolve import "~/assets/css/main.css"`

**Cause**: Konflik antara @nuxtjs/tailwindcss module dan CSS import manual.

**Solution**: Hapus `css: ['~/assets/css/main.css']` dari `nuxt.config.ts`. Module akan otomatis menangani import CSS.

### Module Tidak Mendeteksi CSS
**Error**: Tailwind classes tidak bekerja

**Solution**: Pastikan:
1. File `assets/css/main.css` ada dengan `@tailwind` directives
2. `@nuxtjs/tailwindcss` module sudah ditambahkan di `nuxt.config.ts`
3. Restart dev server setelah perubahan

### Port Already in Use
**Error**: `Port 3000 is already in use`

**Solution**: Nuxt akan otomatis menggunakan port alternatif (3001, 3002, dll.)

### 1. Use @apply untuk Custom Classes
```css
/* assets/css/components.css */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors;
}
```

### 2. Extract Components
```vue
<!-- ✅ Good: Extract ke component -->
<Button variant="primary" size="lg">Click me</Button>

<!-- ❌ Bad: Inline classes panjang -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
  Click me
</button>
```

### 3. Responsive Design
```vue
<!-- ✅ Mobile-first -->
<div class="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<!-- ✅ Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- items -->
</div>
```

### 4. Performance
- Tailwind auto-purge unused CSS
- Gunakan `@apply` untuk reduce duplication
- Import hanya utilities yang dibutuhkan

## 📚 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Nuxt Tailwind Module](https://tailwindcss.nuxtjs.org/)
- [Tailwind Play](https://play.tailwindcss.com/)
- [Tailwind Components](https://tailwindcomponents.com/)

## 🎯 Project Examples

### StatusCard Component (Re-designed)
```vue
<template>
  <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
    <h4 class="text-sm font-semibold text-gray-600 uppercase mb-1">{{ title }}</h4>
    <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
  </div>
</template>
```

### Modern Layout
```vue
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Content -->
    </div>
  </div>
</template>
```

Tailwind CSS membuat styling Vue/Nuxt apps jadi lebih cepat dan konsisten! 🎨✨</content>
<parameter name="filePath">/media/tio/Data2/Project/timekeeper/Tailwind.md