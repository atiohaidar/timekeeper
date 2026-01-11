<!--
  LoadingSkeleton.vue
  
  Skeleton screen component for loading states.
  Shows animated placeholder while data is being fetched.
  
  UX: Reduces perceived loading time and provides visual feedback
-->
<script setup lang="ts">
const props = defineProps<{
  variant?: 'agenda-list' | 'agenda-detail' | 'card'
  count?: number
}>()
</script>

<template>
  <div class="animate-pulse">
    <!-- Agenda List Skeleton -->
    <div v-if="variant === 'agenda-list'" class="space-y-3 p-4">
      <div
        v-for="i in (count || 3)"
        :key="i"
        class="border-2 border-notebook-lines/30 rounded-lg p-4 bg-notebook-paper-dark"
      >
        <div class="h-6 bg-notebook-lines/20 rounded w-3/4 mb-3"></div>
        <div class="h-4 bg-notebook-lines/20 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-notebook-lines/20 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Agenda Detail Skeleton -->
    <div v-else-if="variant === 'agenda-detail'" class="p-6 space-y-6">
      <!-- Title -->
      <div class="h-10 bg-notebook-lines/20 rounded w-2/3"></div>
      
      <!-- Description -->
      <div class="h-24 bg-yellow-100/50 rounded-lg p-4">
        <div class="h-4 bg-notebook-lines/20 rounded w-full mb-2"></div>
        <div class="h-4 bg-notebook-lines/20 rounded w-5/6"></div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="h-20 bg-notebook-paper-dark border-2 border-notebook-lines/30 rounded"></div>
        <div class="h-20 bg-notebook-paper-dark border-2 border-notebook-lines/30 rounded"></div>
        <div class="h-20 bg-notebook-paper-dark border-2 border-notebook-lines/30 rounded"></div>
        <div class="h-20 bg-notebook-paper-dark border-2 border-notebook-lines/30 rounded"></div>
      </div>

      <!-- Button -->
      <div class="flex justify-center">
        <div class="h-12 bg-notebook-lines/20 rounded-lg w-48"></div>
      </div>
    </div>

    <!-- Card Skeleton -->
    <div v-else class="border-2 border-notebook-lines/30 rounded-lg p-4 bg-notebook-paper-dark">
      <div class="h-5 bg-notebook-lines/20 rounded w-3/4 mb-2"></div>
      <div class="h-4 bg-notebook-lines/20 rounded w-1/2"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
