<template>
  <div class="layout-wrapper">
    <header class="main-header">
      <nav>
        <NuxtLink to="/">🏠 Beranda</NuxtLink> |
        <NuxtLink to="/about">ℹ️ Tentang</NuxtLink>
      </nav>
    </header>

    <main class="content-area">
      <slot />
    </main>

    <footer class="main-footer">
      <p>&copy; 2026 Timekeeper App - Belajar Nuxt 4</p>
    </footer>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.main-header {
  background: #333;
  color: white;
  padding: 1rem;
  text-align: center;
}
.main-header nav a {
  color: #42b883;
  text-decoration: none;
  margin: 0 10px;
  font-weight: bold;
}
.content-area {
  flex: 1;
  padding: 20px;
}
.main-footer {
  background: #f4f4f4;
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;
  color: #666;
}
</style>
