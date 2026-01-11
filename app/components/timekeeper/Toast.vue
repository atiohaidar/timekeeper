<!--
  Toast.vue
  
  Toast notification component for success/error feedback.
  Auto-dismisses after 3 seconds with slide-in animation.
  
  UX: Provides immediate feedback for user actions
-->
<script setup lang="ts">
const props = defineProps<{
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)

// Auto-dismiss
onMounted(() => {
  const timeout = setTimeout(() => {
    isVisible.value = false
    setTimeout(() => emit('close'), 300) // Wait for animation
  }, props.duration || 3000)

  onUnmounted(() => clearTimeout(timeout))
})

const iconMap = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️'
}

const bgColorMap = {
  success: 'bg-green-100 border-green-400',
  error: 'bg-red-100 border-red-400',
  info: 'bg-blue-100 border-blue-400',
  warning: 'bg-yellow-100 border-yellow-400'
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div
      v-if="isVisible"
      :class="[
        'fixed top-20 right-6 z-50 max-w-md',
        'border-2 rounded-lg shadow-lg p-4',
        'flex items-center gap-3',
        bgColorMap[type || 'info']
      ]"
    >
      <div class="text-2xl flex-shrink-0">
        {{ iconMap[type || 'info'] }}
      </div>
      <p class="font-handwritten text-lg text-notebook-ink flex-1">
        {{ message }}
      </p>
      <button
        class="text-notebook-ink/40 hover:text-notebook-ink transition-colors"
        @click="isVisible = false"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>
