<script setup lang="ts">
// Import store secara eksplisit
import { useAppStore } from '~/stores/app'

// Mengakses store yang sama dengan Pinia
const appStore = useAppStore()
</script>

<template>
  <div class="main-container">
    <h1>ℹ️ Tentang Timekeeper</h1>
    <p>Ini adalah halaman kedua yang dibuat untuk mendemonstrasikan routing di Nuxt 4.</p>
    
    <div class="shared-state-info">
      <p>Global Counter dari halaman utama: <strong>{{ appStore.counter }}</strong></p>
      <p v-if="appStore.counter > 10" style="color: #d32f2f">Wah, angkanya sudah lebih dari 10! 🔥</p>
    </div>

    <div class="navigation">
      <NuxtLink to="/">⬅️ Kembali ke Beranda</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  font-family: sans-serif;
  max-width: 600px;
  margin: 50px auto;
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: #f1f8e9;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.navigation {
  margin-top: 20px;
}
a {
  color: #2e7d32;
  text-decoration: none;
  font-weight: bold;
}
a:hover {
  text-decoration: underline;
}
</style>
