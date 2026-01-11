<!--
  ConfirmationModal.vue
  
  Reusable confirmation modal for destructive actions.
  Prevents accidental data loss with clear warning UI.
  
  UX: Error prevention through confirmation dialogs
-->
<script setup lang="ts">
const props = defineProps<{
  isVisible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

// Close on Escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('cancel')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const iconMap = {
  danger: '⚠️',
  warning: '⚡',
  info: 'ℹ️',
  success: '✅'
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="emit('cancel')"
    >
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="isVisible"
          class="bg-notebook-paper border-4 border-notebook-ink rounded-lg p-6 max-w-md mx-4 shadow-2xl"
        >
          <!-- Title -->
          <h3 class="font-handwritten-alt text-2xl font-bold text-notebook-ink mb-4 flex items-center gap-2">
            <span class="text-3xl">{{ iconMap[type || 'danger'] }}</span>
            {{ title }}
          </h3>
          
          <!-- Message -->
          <div class="mb-6">
            <p class="font-handwritten text-lg text-notebook-ink leading-relaxed">
              {{ message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              :class="[
                'btn-sketchy flex-1 py-2',
                type === 'danger' ? 'btn-sketchy-danger' : 'btn-sketchy-primary'
              ]"
              @click="emit('confirm')"
            >
              {{ confirmText || 'Ya, Lanjutkan' }}
            </button>
            <button
              class="btn-sketchy flex-1 py-2"
              @click="emit('cancel')"
            >
              {{ cancelText || 'Batal' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
