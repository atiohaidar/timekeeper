<!--
  TimeJumpNav.vue
  
  Quick navigation buttons for timeline.
  Allows users to jump to Now, Next, or Previous agenda.
  
  UX: Improves navigation and orientation in timeline
-->
<script setup lang="ts">
import type { Agenda } from '~/stores/timekeeper'
import { storeToRefs } from 'pinia'
import { useTimekeeperStore } from '~/stores/timekeeper'

const store = useTimekeeperStore()
const { sortedAgendas: agendas, selectedAgendaId, runningAgenda } = storeToRefs(store)
const { selectAgenda } = store

const runningAgendaId = computed(() => runningAgenda.value?.id ?? null)

const emit = defineEmits<{
  jumpToNow: []
  jumpToNext: []
  jumpToPrevious: []
  selectAgenda: [id: string]
}>()

// Find current agenda (running or next waiting)
const currentAgenda = computed(() => {
  if (runningAgendaId.value) {
    return agendas.value.find(a => a.id === runningAgendaId.value)
  }
  
  // Find first waiting agenda
  const sorted = [...agendas.value].sort((a, b) => a.order - b.order)
  return sorted.find(a => a.status === 'waiting')
})

// Find next agenda
const nextAgenda = computed(() => {
  if (!selectedAgendaId.value) return null
  
  const sorted = [...agendas.value].sort((a, b) => a.order - b.order)
  const currentIndex = sorted.findIndex(a => a.id === selectedAgendaId.value)
  
  if (currentIndex === -1 || currentIndex === sorted.length - 1) return null
  return sorted[currentIndex + 1]
})

// Find previous agenda
const previousAgenda = computed(() => {
  if (!selectedAgendaId.value) return null
  
  const sorted = [...agendas.value].sort((a, b) => a.order - b.order)
  const currentIndex = sorted.findIndex(a => a.id === selectedAgendaId.value)
  
  if (currentIndex <= 0) return null
  return sorted[currentIndex - 1]
})

function handleJumpToNow() {
  if (currentAgenda.value) {
    emit('selectAgenda', currentAgenda.value.id)
  }
  emit('jumpToNow')
}

function handleJumpToNext() {
  if (nextAgenda.value) {
    emit('selectAgenda', nextAgenda.value.id)
  }
  emit('jumpToNext')
}

function handleJumpToPrevious() {
  if (previousAgenda.value) {
    emit('selectAgenda', previousAgenda.value.id)
  }
  emit('jumpToPrevious')
}

// Keyboard shortcuts
function handleKeydown(e: KeyboardEvent) {
  // Ctrl/Cmd + Arrow keys
  if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
    e.preventDefault()
    handleJumpToPrevious()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
    e.preventDefault()
    handleJumpToNext()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
    e.preventDefault()
    handleJumpToNow()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="flex items-center gap-2 bg-notebook-paper-dark border-2 border-notebook-lines rounded-lg p-2 shadow-sm">
    <!-- Previous -->
    <button
      :disabled="!previousAgenda"
      :class="[
        'btn-sketchy text-xs py-1 px-3 flex items-center gap-1',
        !previousAgenda && 'opacity-40 cursor-not-allowed'
      ]"
      :title="previousAgenda ? `Sebelumnya: ${previousAgenda.title}` : 'Tidak ada agenda sebelumnya'"
      @click="handleJumpToPrevious"
    >
      <span>⬆️</span>
      <span class="hidden md:inline">Sebelumnya</span>
    </button>

    <!-- Now -->
    <button
      :disabled="!currentAgenda"
      :class="[
        'btn-sketchy btn-sketchy-primary text-xs py-1 px-3 flex items-center gap-1',
        !currentAgenda && 'opacity-40 cursor-not-allowed'
      ]"
      :title="currentAgenda ? `Saat ini: ${currentAgenda.title}` : 'Tidak ada agenda aktif'"
      @click="handleJumpToNow"
    >
      <span>🎯</span>
      <span class="hidden md:inline">Sekarang</span>
    </button>

    <!-- Next -->
    <button
      :disabled="!nextAgenda"
      :class="[
        'btn-sketchy text-xs py-1 px-3 flex items-center gap-1',
        !nextAgenda && 'opacity-40 cursor-not-allowed'
      ]"
      :title="nextAgenda ? `Selanjutnya: ${nextAgenda.title}` : 'Tidak ada agenda selanjutnya'"
      @click="handleJumpToNext"
    >
      <span>⬇️</span>
      <span class="hidden md:inline">Selanjutnya</span>
    </button>

    <!-- Keyboard hint -->
    <div class="hidden lg:block ml-2 text-xs text-notebook-ink-light font-handwritten">
      <span class="opacity-60">Ctrl+↑↓ atau Cmd+↑↓</span>
    </div>
  </div>
</template>
