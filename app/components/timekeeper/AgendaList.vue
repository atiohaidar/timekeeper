<!--
  AgendaList.vue
  
  Vertical timeline list of all agenda items.
  Handles selection, drag-and-drop reordering.
  
  UX Decisions:
  - Notebook paper background with lines
  - Red margin line separates drag handles from content
  - Smooth animations for drag operations
  - Clear visual feedback for drop zones
-->
<script setup lang="ts">
import type { Agenda } from '~/stores/timekeeper'
import { storeToRefs } from 'pinia'
import { useTimekeeperStore } from '~/stores/timekeeper'

const store = useTimekeeperStore()
const { sortedAgendas: agendas, selectedAgendaId: selectedId, runningAgenda } = storeToRefs(store)
const { selectAgenda, reorderAgendas } = store

const runningId = computed(() => runningAgenda.value?.id ?? null)

// Emits - keeping for compatibility if requested
const emit = defineEmits<{
  select: [id: string]
  reorder: [fromIndex: number, toIndex: number]
}>()

// Drag state
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Drag handlers
function handleDragStart(event: DragEvent, index: number) {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

function handleDragEnd(_event: DragEvent) {
  draggedIndex.value = null
  dragOverIndex.value = null
}

function handleDragOver(_event: DragEvent, index: number) {
  dragOverIndex.value = index
}

function handleDrop(_event: DragEvent, toIndex: number) {
  if (draggedIndex.value !== null && draggedIndex.value !== toIndex) {
    emit('reorder', draggedIndex.value, toIndex)
  }
  draggedIndex.value = null
  dragOverIndex.value = null
}
</script>

<template>
  <div class="h-full overflow-y-auto notebook-paper">
    <!-- Header -->
    <div class="sticky top-0 bg-notebook-paper border-b-2 border-notebook-lines px-4 py-3 ml-8 md:ml-16">
      <h2 class="font-handwritten-alt text-2xl font-bold text-notebook-ink">
        📋 Rundown Acara
      </h2>
    </div>

    <!-- Agenda list -->
    <div class="py-4">
      <TimekeeperAgendaItem
        v-for="agenda in agendas"
        :key="agenda.id"
        :agenda="agenda"
        :is-selected="selectedId === agenda.id"
        :is-running="runningId === agenda.id"
        :class="[
          draggedIndex === agenda.order && 'opacity-50',
          dragOverIndex === agenda.order && draggedIndex !== agenda.order && 'drop-zone drag-over'
        ]"
        @select="emit('select', $event)"
        @drag-start="handleDragStart"
        @drag-end="handleDragEnd"
        @drag-over="handleDragOver"
        @drop="handleDrop"
      />

      <!-- Empty state -->
      <div v-if="agendas.length === 0" class="ml-8 md:ml-16 px-4 py-8 text-center">
        <p class="font-handwritten text-notebook-ink-light text-lg">
          Belum ada agenda 📝
        </p>
      </div>
    </div>
  </div>
</template>
