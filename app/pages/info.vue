<script setup lang="ts">
// Kita panggil Composable yang baru kita buat
const { globalAppTitle, localVisitTime } = useAppStatus()

// Mencoba mengubah global state
const editTitle = () => {
  globalAppTitle.value = "Timekeeper - Updated"
}
</script>

<template>
  <div class="main-container">
    <h1>📄 Halaman Info</h1>
    
    <div class="box">
      <h3>🌍 Global State (useState):</h3>
      <p>App Title: <strong>{{ globalAppTitle }}</strong></p>
      <button @click="editTitle" class="btn">Ganti Judul Global</button>
      <p class="small">Judul ini akan berubah di semua halaman yang pakai Composable ini.</p>
    </div>

    <div class="box local">
      <h3>🏠 Local State (ref):</h3>
      <p>Waktu dibuka: <strong>{{ localVisitTime }}</strong></p>
      <p class="small">Waktu ini unik untuk halaman ini. Halaman lain akan punya waktu yang berbeda.</p>
    </div>

    <div class="navigation">
      <NuxtLink to="/">⬅️ Balik ke Home</NuxtLink> <br>
      <NuxtLink to="/about">Ke About ➡️</NuxtLink>
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
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.box {
  background: #e1f5fe;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
}
.box.local {
  background: #f3e5f5;
  border: 1px solid #ce93d8;
}
.btn {
  background: #0288d1;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}
.navigation { margin-top: 20px; }
a { color: #0288d1; font-weight: bold; text-decoration: none; }
.small { font-size: 0.8rem; color: #666; margin-top: 10px; }
</style>
