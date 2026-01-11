<!--
  AgendaItem.vue
  
  Single agenda row in the timeline list.
  Shows title, planned time, status icon, and drag handle.
  
  UX Decisions:
  - Running item gets a hand-drawn circle highlight
  - Status icons use emoji for quick recognition
  - Subtle hover effect (wobble) for interactivity feel
  - Drag handle on the left for reordering
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { Agenda, AgendaStatus } from '~/composables/useTimekeeper'

// Props
const props = defineProps<{
  agenda: Agenda
  isSelected: boolean
  isRunning: boolean
}>()

// Computed property for isRunning
const isRunning = computed(() => props.isRunning)

// Emits
const emit = defineEmits<{
  select: [id: string]
  dragStart: [event: DragEvent, index: number]
  dragEnd: [event: DragEvent]
  dragOver: [event: DragEvent, index: number]
  drop: [event: DragEvent, index: number]
}>()

// Status icon mapping
const statusIcons: Record<AgendaStatus, string> = {
  waiting: '⏳',
  running: '⏱️',
  done: '✅',
  cancelled: '❌'
}

// Format time for display
function formatTime(date: Date): string {
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Calculate estimated end time
const estimatedEndTime = computed(() => {
  const endTime = new Date(props.agenda.plannedStartTime.getTime() + props.agenda.plannedDuration * 60000)
  return formatTime(endTime)
})
</script>

<template>
  <div 
    class="relative p-2 md:p-4 border-b border-notebook-lines cursor-pointer transition-colors duration-200 group"
    :class="[
      isSelected && 'bg-notebook-paper-dark',
      agenda.status === 'cancelled' && 'opacity-60'
    ]"
    @click="emit('select', agenda.id)"
    draggable="true"
    @dragstart="emit('dragStart', $event, agenda.order)"
    @dragend="emit('dragEnd', $event)"
    @dragover.prevent="emit('dragOver', $event, agenda.order)"
    @drop="emit('drop', $event, agenda.order)"
  >
    <div class="flex items-start gap-2 md:gap-3">
      <!-- Drag Handle (visible on hover) -->
      <div class="mt-1 text-notebook-ink-light opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hidden md:block">
        ⋮⋮
      </div>

      <!-- Time -->
      <div class="flex-shrink-0 w-12 md:w-16 pt-1">
        <span class="font-typewriter text-xs md:text-sm font-bold text-notebook-ink block">
          {{ formatTime(agenda.plannedStartTime) }}
        </span>
        <span class="font-typewriter text-[10px] md:text-xs text-notebook-ink-light block">
          - {{ estimatedEndTime }}
        </span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 
          :class="[
            'font-handwritten text-lg text-notebook-ink truncate',
            agenda.status === 'cancelled' && 'line-through',
            isRunning && 'underline-hand'
          ]"
        >
          {{ agenda.title }}
        </h3>
        <p class="font-handwritten text-sm text-notebook-ink-light">
           {{ agenda.plannedDuration }} menit
        </p>
      </div>

      <!-- Right: Status icon -->
      <div class="flex-shrink-0 text-2xl" :title="agenda.status">
        {{ statusIcons[agenda.status] }}
      </div>
    </div>
  </div>
</template>
