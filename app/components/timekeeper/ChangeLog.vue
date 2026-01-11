<!--
  ChangeLog.vue
  
  Toggleable panel showing timestamped changes.
  Styled like a small notebook margin.
  
  UX Decisions:
  - Slides in from right edge
  - Uses margin red border for notebook feel
  - Entries show emoji icons for quick type identification
  - Newest entries at top (reverse chronological)
-->
<script setup lang="ts">
import type { ChangeLogEntry } from '~/types'
import { storeToRefs } from 'pinia'
import { useTimekeeperStore } from '~/stores/timekeeper'

const store = useTimekeeperStore()
const { changeLog: entries, isChangeLogVisible: isVisible } = storeToRefs(store)
const { toggleChangeLog: emit_toggle } = store

function toggle() {
  emit_toggle()
}

// Emits - keeping for compatibility if requested but we use store
const emit = defineEmits<{
  toggle: []
}>()

// Type icons
const typeIcons: Record<ChangeLogEntry['type'], string> = {
  delay: '⏰',
  cancel: '❌',
  swap: '🔄',
  adjust: '⏱️',
  start: '▶️',
  done: '✅'
}

// Format timestamp
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<template>
  <!-- Toggle button -->
  <button
    :class="[
      'fixed right-0 top-1/2 -translate-y-1/2 z-40',
      'bg-notebook-paper border-2 border-r-0 border-notebook-margin',
      'px-2 py-4 font-handwritten text-sm',
      'hover:bg-notebook-paper-dark transition-colors',
      'rounded-l-lg'
    ]"
    @click="emit('toggle')"
  >
    <span class="writing-mode-vertical">
      {{ isVisible ? '📕 Tutup' : '📖 Log' }}
    </span>
  </button>

  <!-- Panel -->
  <Transition name="slide">
    <div 
      v-if="isVisible"
      class="fixed right-0 top-0 h-full w-full md:w-80 z-30 changelog-panel shadow-lg overflow-y-auto"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-notebook-paper border-b-2 border-notebook-margin p-4">
        <h3 class="font-handwritten-alt text-xl font-bold text-notebook-ink">
          📔 Catatan Perubahan
        </h3>
      </div>

      <!-- Entries -->
      <div class="p-4">
        <div v-if="entries.length === 0" class="text-center py-8">
          <p class="font-handwritten text-notebook-ink-light">
            Belum ada perubahan 📝
          </p>
        </div>

        <div
          v-for="entry in entries"
          :key="entry.id"
          class="changelog-entry"
        >
          <div class="flex items-start gap-2">
            <span class="text-lg flex-shrink-0">{{ typeIcons[entry.type] }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-handwritten text-sm text-notebook-ink">
                {{ entry.description }}
              </p>
              <p class="font-handwritten text-xs text-notebook-ink-light truncate">
                {{ entry.agendaTitle }}
              </p>
              <p class="font-handwritten text-xs text-pen-gray">
                {{ formatTimestamp(entry.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.writing-mode-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
