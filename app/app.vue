<script setup>
// Set global title
useHead({
  title: 'Timekeeper App'
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <div id="page-wrapper">
        <NuxtPage />
      </div>
    </NuxtLayout>
  </div>
</template>
