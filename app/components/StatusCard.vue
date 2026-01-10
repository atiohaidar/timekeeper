<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  color?: string
}>()
</script>

<template>
  <div class="card" :style="{ borderLeft: `5px solid ${color || '#42b883'}` }">
    <h4 class="card-title">{{ title }}</h4>
    <p class="card-value">{{ value }}</p>
  </div>
</template>

<style scoped>
.card {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin: 10px 0;
  text-align: left;
}
.card-title {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
}
.card-value {
  margin: 5px 0 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}
</style>
