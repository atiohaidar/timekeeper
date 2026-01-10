<script setup lang="ts">
// Ini adalah kuncinya! Kita memberitahu Nuxt untuk menggunakan layout 'custom'
definePageMeta({
  layout: 'custom'
})
</script>

<template>
  <div>
    <h1>Halo dari Halaman Custom!</h1>
    <p>Halaman ini tidak menggunakan header hitam di atas, tapi menggunakan sidebar di kiri.</p>
    <p>Ini berkat penggunaan <code>definePageMeta</code>.</p>
  </div>
</template>
