<script setup lang="ts">
// Kita buat Interface agar TypeScript tahu bentuk data dari API
interface ApiResponse {
  status: string
  data: {
    uptime: string
    usersActive: number
    serverTime: string
    version: string
  }
}

// Gunakan interface tersebut di useFetch
const { data: apiResponse, refresh } = await useFetch<ApiResponse>('/api/stats')
</script>

<template>
  <div class="main-container">
    <h1>🚀 Selamat Datang di Timekeeper</h1>
    <p>Ini adalah halaman pertama kamu menggunakan struktur <strong>Nuxt 4</strong>.</p>
    
    <div class="info-box">
      <h3>Statistik dari API Server:</h3>
      
      <!-- Pengecekan ekstra: apiResponse?.data -->
      <div v-if="apiResponse?.data" class="stats-grid">
        <StatusCard title="Uptime" :value="apiResponse.data.uptime" color="#1976d2" />
        <StatusCard title="User Aktif" :value="apiResponse.data.usersActive" color="#42b883" />
        <StatusCard title="Waktu Server" :value="apiResponse.data.serverTime" color="#fbc02d" />
      </div>

      <!-- State Loading: Jika apiResponse masih null -->
      <div v-else-if="apiResponse === null" class="loading-state">
        ⏳ Sedang memuat data server...
      </div>

      <!-- State Error: Jika apiResponse ada tapi data-nya kosong -->
      <div v-else class="error-state">
        ⚠️ Format data dari server tidak sesuai.
      </div>
      
      <!-- Bungkus refresh dengan () => refresh() agar tidak error event -->
      <button @click="() => refresh()" class="refresh-btn">🔄 Refresh Data</button>
    </div>

    <div class="navigation">
      <NuxtLink to="/about">Ke Halaman Tentang ➡️</NuxtLink> <br>
      <NuxtLink to="/custom-page" style="color: #607d8b">Coba Halaman dengan Layout Berbeda 🎨</NuxtLink>
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
  background: #f9f9f9;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.info-box {
  text-align: left;
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
}
.navigation {
  margin-top: 20px;
}
a {
  color: #1976d2;
  text-decoration: none;
  font-weight: bold;
}
a:hover {
  text-decoration: underline;
}
.refresh-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.refresh-btn:hover {
  background: #33a06f;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}
.loading-state {
  color: #666;
  font-style: italic;
  padding: 10px 0;
}
.error-state {
  color: #d32f2f;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
}
</style>
