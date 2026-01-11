<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  color?: string
  icon?: string
}>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow duration-300"
       :class="`border-l-${color || 'green-500'}`">
    <div class="flex items-center justify-between">
      <div>
        <h4 class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
          {{ title }}
        </h4>
        <p class="text-2xl font-bold text-gray-900">
          {{ value }}
        </p>
      </div>
      <div v-if="icon" class="text-3xl text-gray-400">
        <i :class="icon"></i>
      </div>
    </div>
  </div>
</template>
