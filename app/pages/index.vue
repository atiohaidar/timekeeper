<template>
  <div class="main-container">
    <h1>🚀 Selamat Datang di Timekeeper</h1>
    <p>Ini adalah halaman pertama kamu menggunakan struktur <strong>Nuxt 4</strong>.</p>
    
    <div class="info-box">
      <h3>Apa yang baru?</h3>
      <ul>
        <li>File ini ada di <code>app/pages/index.vue</code></li>
        <li>Halaman diatur otomatis oleh folder <code>app/pages/</code></li>
      </ul>
    </div>

    <div class="navigation">
      <NuxtLink to="/about">Ke Halaman Tentang ➡️</NuxtLink>
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
</style>
