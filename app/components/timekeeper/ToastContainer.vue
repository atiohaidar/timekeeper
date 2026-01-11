<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed top-20 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
    <div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto">
      <TimekeeperToast
        :message="toast.message"
        :type="toast.type"
        @close="removeToast(toast.id)"
      />
    </div>
  </div>
</template>

<style scoped>
/* Optional: animations for the list itself if TransitionGroup is used */
</style>
