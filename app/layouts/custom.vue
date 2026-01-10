<template>
  <div class="custom-layout">
    <aside class="sidebar">
      <h3>Menu Khusus</h3>
      <nav>
        <NuxtLink to="/">🏠 Beranda</NuxtLink>
        <NuxtLink to="/custom-page">📄 Halaman Custom</NuxtLink>
      </nav>
    </aside>

    <main class="main-content">
      <header class="custom-header">
        <h2>Layout Kustom (Sidebar Mode)</h2>
      </header>
      <div class="page-body">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.custom-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 200px;
  background: #2c3e50;
  color: white;
  padding: 20px;
}
.sidebar nav a {
  display: block;
  color: #ecf0f1;
  text-decoration: none;
  margin: 10px 0;
}
.main-content {
  flex: 1;
  background: #ecf0f1;
}
.custom-header {
  background: #34495e;
  padding: 10px 20px;
  color: white;
}
.page-body {
  padding: 20px;
}
</style>
